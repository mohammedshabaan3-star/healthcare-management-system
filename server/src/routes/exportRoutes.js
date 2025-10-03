import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
    exportHospitals, 
    exportPatients, 
    exportTransfers 
} from '../controllers/exportController.js';

const router = express.Router();

// ✅ تصدير المستشفيات - متاح فقط لمدير النظام
router.get('/hospitals', authenticateSession, authorizeRole('system_admin'), exportHospitals);

// ✅ تصدير المرضى - متاح فقط لمدير النظام
router.get('/patients', authenticateSession, authorizeRole('system_admin','data_officer'), exportPatients);

// ✅ تصدير طلبات التحويل - متاح فقط لمدير النظام
router.get('/transfers', authenticateSession, authorizeRole('system_admin','data_officer'), exportTransfers);

export default router;
