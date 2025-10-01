import { PrismaClient } from '@prisma/client';
import { loadHospitalFile } from '../utils/processFiles.js';

const prisma = new PrismaClient();

/**
 * 🚀 دالة Seed لإدخال المستشفيات من ملف Excel
 */
export const seedHospitals = async () => {
    try {
        const hospitalsFromFile = loadHospitalFile();

        if (!hospitalsFromFile || hospitalsFromFile.length === 0) {
            console.log('⚠️ لا توجد بيانات مستشفيات في ملف الإكسيل.');
            return;
        }

        for (const hospital of hospitalsFromFile) {
            if (!hospital.name) continue;

            // ✅ البحث عن مستشفى بنفس الاسم أو الكود
            let existing = null;
            if (hospital.code) {
                existing = await prisma.hospital.findUnique({ where: { code: hospital.code } });
            }
            if (!existing) {
                existing = await prisma.hospital.findFirst({ where: { name: hospital.name } });
            }

            // ✅ البحث عن المحافظة
            const governorate = hospital.governorate
                ? await prisma.governorate.findFirst({ where: { name: hospital.governorate } })
                : null;

            if (existing) {
                // تحديث
                await prisma.hospital.update({
                    where: { id: existing.id },
                    data: {
                        icuBeds: hospital.icuBeds || 0,
                        pediatricBeds: hospital.pediatricBeds || 0,
                        incubators: hospital.incubators || 0,
                        newbornBeds: hospital.newbornBeds || 0,
                        mediumCareBeds: hospital.mediumCareBeds || 0,
                        ...(governorate && { governorate: { connect: { id: governorate.id } } })
                    }
                });
            } else {
                // إنشاء جديد
                const code = hospital.code?.trim() || `HOSP-${Math.floor(Math.random() * 1000000)}`;
                await prisma.hospital.create({
                    data: {
                        code,
                        name: hospital.name,
                        icuBeds: hospital.icuBeds || 0,
                        pediatricBeds: hospital.pediatricBeds || 0,
                        incubators: hospital.incubators || 0,
                        newbornBeds: hospital.newbornBeds || 0,
                        mediumCareBeds: hospital.mediumCareBeds || 0,
                        ...(governorate && { governorate: { connect: { id: governorate.id } } })
                    }
                });
                console.log(`✅ تمت إضافة مستشفى جديد: ${hospital.name}`);
            }
        }

        console.log('🎉 تم إدخال بيانات المستشفيات بنجاح.');
    } catch (error) {
        console.error('❌ خطأ في الإدخال التلقائي للمستشفيات:', error);
    } finally {
        await prisma.$disconnect();
    }
};
