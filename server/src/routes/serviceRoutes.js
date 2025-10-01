import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
    getServices, 
    createService, 
    updateService, 
    deleteService, 
    toggleServiceStatus 
} from '../controllers/serviceController.js';

const router = express.Router();

// ✅ جلب جميع الخدمات - متاح للجميع بعد تسجيل الدخول
router.get('/', authenticateSession, getServices);

// ✅ إنشاء خدمة جديدة - متاح فقط لمدير النظام
router.post('/', authenticateSession, authorizeRole('system_admin'), createService);

// ✅ تحديث خدمة - متاح فقط لمدير النظام
router.put('/:id', authenticateSession, authorizeRole('system_admin'), updateService);

// ✅ حذف خدمة - متاح فقط لمدير النظام
router.delete('/:id', authenticateSession, authorizeRole('system_admin'), deleteService);

// ✅ تفعيل/إلغاء تفعيل خدمة - متاح فقط لمدير النظام
router.patch('/:id/toggle-status', authenticateSession, authorizeRole('system_admin'), toggleServiceStatus);

export default router;
