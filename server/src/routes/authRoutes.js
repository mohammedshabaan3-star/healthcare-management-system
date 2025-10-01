import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
    loginUser, 
    logoutUser, 
    checkAuth,
    changePassword,
    resetPassword
} from '../controllers/authController.js';

const router = express.Router();

// ✅ تسجيل الدخول - إنشاء جلسة جديدة
router.post('/login', loginUser);

// ✅ تسجيل الخروج - تدمير الجلسة
router.post('/logout', authenticateSession, logoutUser);

// ✅ التحقق من حالة الجلسة الحالية
router.get('/check', authenticateSession, checkAuth);

// ✅ تغيير كلمة المرور من قبل المستخدم (لازم يكون مسجل دخول)
router.post('/change-password', authenticateSession, changePassword);

// ✅ إعادة تعيين كلمة المرور من قبل المدير (فقط system_admin)
router.post('/reset-password', authenticateSession, authorizeRole('system_admin'), resetPassword);

export default router;
