// server/src/services/seedGovernorates.js
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const seedGovernoratesAndDistricts = async () => {
    if (!process.env.DATABASE_URL) {
        console.info('DATABASE_URL not set - skipping governorates seed (local sqlite fallback).');
        return;
    }
    try {
        // التحقق من وجود بيانات مسبقة
        const existingGovernorates = await prisma.governorate.findMany();
        if (existingGovernorates.length > 0) {
            console.log('✅ بيانات المحافظات موجودة مسبقًا. لن يتم الإدخال التلقائي.');
            return;
        }

        console.log('⏳ لا توجد بيانات للمحافظات. بدء الإدخال التلقائي من الملف...');

        // تحديد مسار ملف Excel
        const filePath = path.join(process.cwd(), 'uploads', 'المحافظه- الحى.xlsx');
        
        // التحقق من وجود الملف
        if (!fs.existsSync(filePath)) {
            console.error('❌ الملف غير موجود: ', filePath);
            return;
        }

        // قراءة الملف
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // تخطي الصفوف غير الضرورية (حسب ملفك، البيانات تبدأ من الصف الثالث)
        const rows = jsonData.slice(2);

        const governoratesMap = new Map();

        for (const row of rows) {
            const governorateName = row[0]?.toString().trim();
            const districtName = row[1]?.toString().trim();

            if (governorateName && districtName) {
                if (!governoratesMap.has(governorateName)) {
                    governoratesMap.set(governorateName, []);
                }
                governoratesMap.get(governorateName).push(districtName);
            }
        }

        // إدخال البيانات في قاعدة البيانات
        for (const [govName, districts] of governoratesMap.entries()) {
            // ✅ الطريقة الآمنة: إنشاء الكائن وتمريره مباشرة كقيمة لـ "data"
            const governorateRecord = {
                name: govName
            };

            const createdGovernorate = await prisma.governorate.create({
                data: governorateRecord
            });

            // إدخال المراكز التابعة لها
            for (const districtName of districts) {
                const districtRecord = {
                    name: districtName,
                    governorateId: createdGovernorate.id
                };

                await prisma.district.create({
                    data: districtRecord
                });
            }
        }

        console.log(`✅ تمت إضافة ${governoratesMap.size} محافظة و ${Array.from(governoratesMap.values()).flat().length} مركز/حي بنجاح.`);

    } catch (error) {
        console.error('❌ خطأ في الإدخال التلقائي للمحافظات:', error.message);
    }
};