import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
    getPendingTransfers, 
    approveTransfer, 
    rejectTransfer 
} from '../controllers/transferController.js';

const router = express.Router();

// ✅ جلب طلبات التحويل المعلقة - متاح للمدير أو مسؤول البيانات
router.get(
  '/pending',
  authenticateSession,
  authorizeRole('system_admin', 'data_officer'),
  getPendingTransfers
);

// ✅ الموافقة على طلب تحويل - متاح فقط لمدير المستشفى
router.post(
  '/:id/approve',
  authenticateSession,
  authorizeRole('hospital_admin'),
  approveTransfer
);

// ✅ رفض طلب تحويل - متاح فقط لمدير المستشفى
router.post(
  '/:id/reject',
  authenticateSession,
  authorizeRole('hospital_admin'),
  rejectTransfer
);

export default router;
