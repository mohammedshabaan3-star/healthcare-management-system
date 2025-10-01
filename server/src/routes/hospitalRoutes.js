import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
  getHospitals,
  createHospital,
  updateHospital,
  deleteHospital
} from '../controllers/hospitalController.js';

const router = express.Router();

/**
 * 🔹 جلب جميع المستشفيات
 * متاح لجميع المستخدمين المسجلين (أي دور)
 */
router.get('/', authenticateSession, getHospitals);

/**
 * 🔹 إنشاء مستشفى جديد
 * متاح فقط لمدير النظام
 * يجب أن يتضمن: الاسم، الكود، المحافظة، وعدد الأسرة
 */
router.post('/', authenticateSession, authorizeRole('system_admin'), createHospital);

/**
 * 🔹 تحديث بيانات مستشفى
 * متاح فقط لمدير النظام
 * يمكن تحديث الاسم، الكود، المحافظة، وعدد الأسرة
 */
router.put('/:id', authenticateSession, authorizeRole('system_admin'), updateHospital);

/**
 * 🔹 حذف مستشفى
 * متاح فقط لمدير النظام
 */
router.delete('/:id', authenticateSession, authorizeRole('system_admin'), deleteHospital);

export default router;
