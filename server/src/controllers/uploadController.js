// server/src/controllers/uploadController.js
import { PrismaClient } from '@prisma/client';
import { processGovernorateFile, processHospitalFile } from '../services/excelService.js';

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