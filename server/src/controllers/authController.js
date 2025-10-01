// server/src/controllers/authController.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * 🔹 Utility: يبني كائن المستخدم الموحد للواجهة
 */
const buildUserResponse = (dbUser, session = {}) => {
    if (!dbUser) return null;
    const activeRole =
        session.userRole || dbUser.activeRole || (Array.isArray(dbUser.roles) ? dbUser.roles[0] : null);

    return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        roles: dbUser.roles || [],
        activeRole,
        role: activeRole, // alias لأغراض التوافق مع الواجهة
        hospital: dbUser.hospital
            ? {
                  id: dbUser.hospital.id,
                  name: dbUser.hospital.name,
                  code: dbUser.hospital.code,
              }
            : null,
        lastLogin: dbUser.lastLogin || null,
    };
};

/* ==============================
   🔑 Auth Controllers
   ============================== */

// تسجيل الدخول
export const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { hospital: true },
        });

        if (!user) return res.status(400).json({ error: 'المستخدم غير موجود' });
        if (!user.isActive) return res.status(403).json({ error: 'الحساب غير نشط' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'كلمة المرور غير صحيحة' });

        if (!user.roles || !user.roles.includes(role)) {
            return res.status(403).json({ error: 'ليس لديك صلاحية للدخول بهذا الدور' });
        }

        // حفظ بيانات الجلسة
        req.session.userId = user.id;
        req.session.userRole = role;
        req.session.userEmail = user.email;
        req.session.isLoggedIn = true;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date(), activeRole: role },
            include: { hospital: true },
        });

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: buildUserResponse(updatedUser, req.session),
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
};

// تسجيل الخروج
export const logoutUser = async (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'فشل في تسجيل الخروج' });
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
    });
};

// التحقق من الجلسة
export const checkAuth = async (req, res) => {
    try {
        if (req.session && req.session.isLoggedIn && req.session.userId) {
            const dbUser = await prisma.user.findUnique({
                where: { id: req.session.userId },
                include: { hospital: true },
            });

            if (!dbUser) {
                req.session.destroy(() => {});
                return res.status(401).json({ error: 'غير مصرح بالوصول' });
            }

            return res.json({ isAuthenticated: true, user: buildUserResponse(dbUser, req.session) });
        }
        return res.status(401).json({ error: 'غير مصرح بالوصول' });
    } catch (error) {
        console.error('Error in checkAuth:', error);
        res.status(500).json({ error: 'فشل في التحقق من الجلسة' });
    }
};

// endpoint إضافي متوافق مع الواجهة
export const getCurrentUser = async (req, res) => {
    try {
        if (req.session && req.session.isLoggedIn && req.session.userId) {
            const dbUser = await prisma.user.findUnique({
                where: { id: req.session.userId },
                include: { hospital: true },
            });
            if (!dbUser) return res.status(401).json({ error: 'غير مصرح بالوصول' });
            return res.json(buildUserResponse(dbUser, req.session));
        }
        return res.status(401).json({ error: 'غير مصرح بالوصول' });
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        res.status(500).json({ error: 'فشل في جلب بيانات المستخدم' });
    }
};

// تغيير كلمة المرور
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'غير مصرح بالوصول' });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

        res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'فشل في تغيير كلمة المرور' });
    }
};

// إعادة تعيين كلمة المرور من قبل مدير النظام
export const resetPassword = async (req, res) => {
    const { userId, newPassword } = req.body;
    const adminId = req.session.userId;
    if (!adminId) return res.status(401).json({ error: 'غير مصرح بالوصول' });

    try {
        const admin = await prisma.user.findUnique({ where: { id: adminId } });
        if (!admin || !admin.roles.includes('system_admin')) {
            return res.status(403).json({ error: 'ليس لديك صلاحية لإعادة تعيين كلمات المرور' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
        if (!targetUser) return res.status(404).json({ error: 'المستخدم غير موجود' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: parseInt(userId, 10) }, data: { password: hashedPassword } });

        res.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'فشل في إعادة تعيين كلمة المرور' });
    }
};

/* ==============================
   🎭 Role & Permission Management
   ============================== */

// جلب كل الأدوار
export const getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany();
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'فشل في جلب الأدوار' });
    }
};

// إضافة دور جديد
export const createRole = async (req, res) => {
    const { name, displayName, description, permissions } = req.body;
    try {
        const role = await prisma.role.create({
            data: {
                name,
                displayName,
                description,
                permissions,
            },
        });
        res.json(role);
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'فشل في إضافة الدور' });
    }
};

// تعديل دور
export const updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, displayName, description, permissions } = req.body;
    try {
        const role = await prisma.role.update({
            where: { id: parseInt(id, 10) },
            data: { name, displayName, description, permissions },
        });
        res.json(role);
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'فشل في تحديث الدور' });
    }
};

// حذف دور
export const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.role.delete({ where: { id: parseInt(id, 10) } });
        res.json({ success: true, message: 'تم حذف الدور بنجاح' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: 'فشل في حذف الدور' });
    }
};
