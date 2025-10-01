// server/src/controllers/userController.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// جلب جميع المستخدمين
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { hospital: true }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'فشل في جلب المستخدمين' });
    }
};

// إنشاء مستخدم جديد
export const createUser = async (req, res) => {
    const { name, email, password, roles, activeRole, hospitalId } = req.body;

    // ✅ التحقق من وجود كلمة المرور (مطلوبة عند الإنشاء)
    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'كلمة المرور مطلوبة وتحتوي على 8 أحرف على الأقل' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ تحويل hospitalId إلى رقم (إذا وُجد)
        const parsedHospitalId = hospitalId ? parseInt(hospitalId, 10) : null;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                roles: roles || ['doctor'],
                activeRole: activeRole || (roles && roles[0]) || 'doctor',
                hospitalId: parsedHospitalId,
                isActive: true
            },
            include: { hospital: true } // ✅ إرجاع بيانات المستشفى في الرد
        });

        // ✅ عدم إرجاع كلمة المرور لأسباب أمنية
        const { password: _, ...safeUser } = user;

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            user: safeUser
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'فشل في إنشاء الحساب' });
    }
};

// تحديث مستخدم
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, roles, activeRole, hospitalId, isActive } = req.body;

    try {
        const parsedHospitalId = hospitalId ? parseInt(hospitalId, 10) : null;

        const user = await prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: {
                name,
                email,
                roles,
                activeRole,
                hospitalId: parsedHospitalId,
                isActive: isActive !== undefined ? isActive : true
            },
            include: { hospital: true }
        });

        const { password: _, ...safeUser } = user;

        res.json({
            success: true,
            message: 'تم تحديث المستخدم بنجاح',
            user: safeUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'فشل في تحديث المستخدم' });
    }
};

// حذف مستخدم
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: { id: parseInt(id, 10) }
        });

        res.json({
            success: true,
            message: 'تم حذف المستخدم بنجاح'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'فشل في حذف المستخدم' });
    }
};

// تعطيل/تفعيل مستخدم
export const toggleUserActive = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(id, 10) } });
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: { isActive: !user.isActive },
            include: { hospital: true }
        });

        const { password: _, ...safeUser } = updatedUser;

        res.json({
            success: true,
            message: `تم ${updatedUser.isActive ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`,
            user: safeUser
        });

    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ error: 'فشل في تغيير حالة المستخدم' });
    }
};