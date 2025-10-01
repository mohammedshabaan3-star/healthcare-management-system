import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
  getGovernorates,
  createGovernorate,
  updateGovernorate,
  deleteGovernorate
} from '../controllers/governorateController.js';

const router = express.Router();

// ✅ جلب جميع المحافظات (متاح لجميع المستخدمين المسجلين)
router.get('/', authenticateSession, getGovernorates);

// ✅ إنشاء محافظة جديدة - متاح فقط لمدير النظام
router.post('/', authenticateSession, authorizeRole('system_admin'), createGovernorate);

// ✅ تحديث محافظة - متاح فقط لمدير النظام
router.put('/:id', authenticateSession, authorizeRole('system_admin'), updateGovernorate);

// ✅ حذف محافظة - متاح فقط لمدير النظام
router.delete('/:id', authenticateSession, authorizeRole('system_admin'), deleteGovernorate);

export default router;
