import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createAdminUserIfNotExists = async () => {
    if (!process.env.DATABASE_URL) {
        console.info('DATABASE_URL not set - skipping Prisma admin seed (local sqlite fallback).');
        return;
    }
    try {
        // التحقق إذا كان يوجد مدير نظام مسبقًا
        const existingAdmin = await prisma.user.findFirst({
            where: {
                roles: { has: 'system_admin' }
            }
        });

        if (existingAdmin) {
            console.log('✅ حساب مدير النظام موجود مسبقًا.');
            return;
        }

        // إعداد كلمة المرور الافتراضية وتشفيرها
        const defaultPassword = 'Admin123!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // بيانات حساب الأدمن
        const adminData = {
            name: 'مدير النظام',
            email: 'admin@hospital.com',
            password: hashedPassword,
            roles: ['system_admin'],
            activeRole: 'system_admin',
            isActive: true
        };

        // إنشاء الحساب باستخدام Prisma
        const adminUser = await prisma.user.create({
            data: adminData
        });

        console.log('✅ تم إنشاء حساب مدير النظام تلقائيًا!');
        console.log('📧 البريد الإلكتروني: admin@hospital.com');
        console.log('🔑 كلمة المرور: Admin123!');

    } catch (error) {
        console.error('❌ فشل في إنشاء حساب مدير النظام:', error.message);
    }
};
