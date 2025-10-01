import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
    getStandards, 
    createStandard, 
    updateStandard, 
    deleteStandard, 
    toggleStandardStatus 
} from '../controllers/standardController.js';

const router = express.Router();

// ✅ جلب جميع المعايير - متاح للجميع بعد تسجيل الدخول
router.get('/', authenticateSession, getStandards);

// ✅ إنشاء معيار جديد - متاح فقط لمدير النظام
router.post('/', authenticateSession, authorizeRole('system_admin'), createStandard);

// ✅ تحديث معيار - متاح فقط لمدير النظام
router.put('/:id', authenticateSession, authorizeRole('system_admin'), updateStandard);

// ✅ حذف معيار - متاح فقط لمدير النظام
router.delete('/:id', authenticateSession, authorizeRole('system_admin'), deleteStandard);

// ✅ تفعيل/إلغاء تفعيل معيار - متاح فقط لمدير النظام
router.patch('/:id/toggle-status', authenticateSession, authorizeRole('system_admin'), toggleStandardStatus);

export default router;
