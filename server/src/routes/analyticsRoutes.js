import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
    getKPIs, 
    getDailyPatients, 
    getPatientsByGovernorate, 
    getTransfersByHospital 
} from '../controllers/analyticsController.js';

const router = express.Router();

// ✅ مؤشرات الأداء الرئيسية - متاحة لمدير النظام فقط
router.get('/kpis', authenticateSession, authorizeRole('system_admin'), getKPIs);

// ✅ المرضى الجدد حسب اليوم - متاح للمدير والطبيب والممرض
router.get('/daily-patients', authenticateSession, authorizeRole('system_admin','doctor','nurse'), getDailyPatients);

// ✅ المرضى حسب المحافظة - متاح لمدير النظام ومسؤول البيانات
router.get('/patients-by-governorate', authenticateSession, authorizeRole('system_admin','data_officer'), getPatientsByGovernorate);

// ✅ التحويلات حسب المستشفى - متاح لمدير النظام ومدير المستشفى
router.get('/transfers-by-hospital', authenticateSession, authorizeRole('system_admin','hospital_admin'), getTransfersByHospital);

export default router;
