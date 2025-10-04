// server/src/controllers/uploadController.js
import { PrismaClient } from '@prisma/client';
import { processGovernorateFile, processHospitalFile } from '../services/excelService.js';
import { processPatientFile } from '../services/excelService.js';

const prisma = new PrismaClient();

export const uploadGovernorates = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'لم يتم تحميل أي ملف' });
        }

        const { governorates, districts } = processGovernorateFile(req.file.buffer);

        // بدء معاملة لضمان التكامل
        const result = await prisma.$transaction(async (tx) => {
            // حذف البيانات القديمة إذا لزم الأمر (اختياري)
            // await tx.district.deleteMany();
            // await tx.governorate.deleteMany();

            // إنشاء المحافظات
            const createdGovernorates = await Promise.all(
                governorates.map(name => 
                    tx.governorate.upsert({
                        where: { name },
                        update: {},
                        create: { name }
                    })
                )
            );

            // إنشاء المراكز/الأحياء
            const governorateMap = {};
            for (const gov of createdGovernorates) {
                governorateMap[gov.name] = gov.id;
            }

            const districtsToCreate = districts.map(d => ({
                name: d.districtName,
                governorateId: governorateMap[d.governorateName]
            }));

            const createdDistricts = await tx.district.createMany({
                data: districtsToCreate,
                skipDuplicates: true // تجنب التكرارات
            });

            return { governorates: createdGovernorates.length, districts: createdDistricts.count };
        });

        res.json({
            success: true,
            message: 'تم رفع ومعالجة ملف المحافظات والمراكز بنجاح',
             result
        });

    } catch (error) {
        console.error('Error uploading governorates:', error);
        res.status(500).json({ error: 'فشل في معالجة الملف' });
    }
};

export const uploadHospitals = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'لم يتم تحميل أي ملف' });
        }

        const hospitals = processHospitalFile(req.file.buffer);

        const result = await prisma.$transaction(async (tx) => {
            let successCount = 0;
            let errorCount = 0;

            for (const hospitalData of hospitals) {
                try {
                    // البحث عن المحافظة
                    let governorateId = null;
                    if (hospitalData.governorate) {
                        const governorate = await tx.governorate.findUnique({
                            where: { name: hospitalData.governorate }
                        });
                        governorateId = governorate?.id || null;
                    }

                    // إنشاء أو تحديث المستشفى
                    await tx.hospital.upsert({
                        where: { code: hospitalData.code },
                        update: {
                            name: hospitalData.name,
                            governorateId,
                            icuBeds: hospitalData.icuBeds,
                            pediatricBeds: hospitalData.pediatricBeds,
                            mediumCareBeds: hospitalData.mediumCareBeds,
                            incubators: hospitalData.incubators,
                            newbornBeds: hospitalData.newbornBeds,
                            attachments: hospitalData.attachments
                        },
                        create: {
                            code: hospitalData.code,
                            name: hospitalData.name,
                            governorateId,
                            icuBeds: hospitalData.icuBeds,
                            pediatricBeds: hospitalData.pediatricBeds,
                            mediumCareBeds: hospitalData.mediumCareBeds,
                            incubators: hospitalData.incubators,
                            newbornBeds: hospitalData.newbornBeds,
                            attachments: hospitalData.attachments
                        }
                    });
                    successCount++;
                } catch (err) {
                    console.error(`فشل في معالجة المستشفى ${hospitalData.name}:`, err);
                    errorCount++;
                }
            }

            return { successCount, errorCount };
        });

        res.json({
            success: true,
            message: 'تم رفع ومعالجة ملف المستشفيات بنجاح',
            data: result
        });

    } catch (error) {
        console.error('Error uploading hospitals:', error);
        res.status(500).json({ error: 'فشل في معالجة الملف' });
    }
};

export const uploadPatients = async (req, res) => {
    // multer.fields stores files in req.files as arrays by field name
    const excelFiles = (req.files && req.files.file) || [];
    const attachments = (req.files && req.files.attachments) || [];

    if (excelFiles.length === 0) {
        return res.status(400).json({ message: 'لم يتم رفع ملف Excel للمرضى' });
    }

    try {
        const patients = processPatientFile(excelFiles[0].buffer);

        // Prepare attachments directory
        const fs = await import('fs');
        const path = await import('path');
        const uploadsDir = path.default.join(process.cwd(), 'uploads', 'patients');
        if (!fs.default.existsSync(uploadsDir)) fs.default.mkdirSync(uploadsDir, { recursive: true });
        const batchDirName = `batch_${Date.now()}`;
        const batchDir = path.default.join(uploadsDir, batchDirName);
        fs.default.mkdirSync(batchDir, { recursive: true });

        // Map attachments to nationalId when possible
        const attachmentsMap = {}; // nationalId -> [filePaths]
        const unmatched = [];

        for (const file of attachments) {
            // originalname can contain nationalId or patient full name; try to find 14-digit sequence
            const orig = file.originalname || '';
            const match = orig.match(/(\d{14})/);
            const fileNameSafe = `${Date.now()}_${orig.replace(/[^a-zA-Z0-9.\-\u0600-\u06FF]/g, '_')}`;
            const outPath = path.default.join(batchDir, fileNameSafe);
            fs.default.writeFileSync(outPath, file.buffer);

            if (match) {
                const nid = match[1];
                attachmentsMap[nid] = attachmentsMap[nid] || [];
                attachmentsMap[nid].push(outPath);
            } else {
                unmatched.push(outPath);
            }
        }

        const results = { upserted: 0, errors: [] };

        // نستخدم معاملة واحدة أو عدة معاملات حسب الحاجة
        await prisma.$transaction(async (tx) => {
            for (let i = 0; i < patients.length; i++) {
                const p = patients[i];

                // تحقق بسيط: رقم قومي يجب أن يكون 14 رقمًا
                if (!p.nationalId || !/^[0-9]{14}$/.test(p.nationalId)) {
                    results.errors.push({ row: i + 1, message: 'الرقم القومي غير صالح' });
                    continue;
                }

                // حاول إيجاد المريض بحسب الرقم القومي
                const existing = await tx.patient.findUnique({ where: { nationalId: p.nationalId } });

                const data = {
                    nationalId: p.nationalId,
                    fullName: p.fullName || undefined,
                    age: p.age || undefined,
                    gender: p.gender || undefined,
                    governorate: p.governorate || undefined,
                    address: p.address || undefined,
                    phone1: p.phone1 || undefined,
                    phone2: p.phone2 || undefined,
                    admissionDate: p.admissionDate ? new Date(p.admissionDate) : undefined,
                    admissionTime: p.admissionTime || undefined,
                    initialDiagnosis: p.initialDiagnosis || undefined,
                    finalDiagnosis: p.finalDiagnosis || undefined,
                    careType: p.careType || undefined,
                    source: p.source || undefined,
                    doctorName: p.doctorName || undefined,
                    apache: p.apache || undefined,
                    // إرفاقات الملف (JSON string of paths) — نحاول ربط المرفقات التي تحمل الرقم القومي
                    attachments: attachmentsMap[p.nationalId] ? JSON.stringify(attachmentsMap[p.nationalId]) : undefined
                };

                if (existing) {
                    await tx.patient.update({ where: { id: existing.id }, data });
                } else {
                    await tx.patient.create({ data });
                }

                results.upserted += 1;
            }
        });

        return res.json({ message: 'تم رفع ومعالجة المرضى', results });
    } catch (error) {
        console.error('Error uploading patients:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء رفع ملف المرضى', error: error.message });
    }
};