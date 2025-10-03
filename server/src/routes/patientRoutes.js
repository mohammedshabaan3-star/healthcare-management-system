import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
  getPatients,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';

const router = express.Router();

// ✅ جلب جميع المرضى - متاح للأطباء، الممرضين، مدير النظام
router.get('/', authenticateSession, authorizeRole('system_admin', 'hospital_admin', 'doctor', 'nurse'), getPatients);

// ✅ إنشاء مريض جديد - متاح للأطباء والممرضين ومدير النظام
router.post('/', authenticateSession, authorizeRole('system_admin', 'hospital_admin', 'doctor', 'nurse'), createPatient);

// ✅ تحديث بيانات مريض - متاح للأطباء والممرضين ومدير النظام
router.put('/:id', authenticateSession, authorizeRole('system_admin', 'hospital_admin', 'doctor', 'nurse'), updatePatient);

// ✅ حذف مريض - متاح فقط لمدير النظام
router.delete('/:id', authenticateSession, authorizeRole('system_admin'), deletePatient);

export default router;
