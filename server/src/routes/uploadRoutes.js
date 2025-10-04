import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { uploadGovernorates, uploadHospitals, uploadPatients } from '../controllers/uploadController.js';
import { upload } from '../middleware/fileUpload.js';

const router = express.Router();

// ✅ رفع ملف المحافظات - مسموح فقط لمدير النظام
router.post(
  '/governorates',
  authenticateSession,
  authorizeRole('system_admin'),
  upload.single('file'),
  uploadGovernorates
);

// ✅ رفع ملف المستشفيات - مسموح فقط لمدير النظام
router.post(
  '/hospitals',
  authenticateSession,
  authorizeRole('system_admin'),
  upload.single('file'),
  uploadHospitals
);

// ✅ رفع ملف المرضى - مسموح فقط لمدير النظام
router.post(
  '/patients',
  authenticateSession,
  authorizeRole('system_admin'),
  // يقبل ملف excel واحد ومجموعة مرفقات باسم attachments
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'attachments', maxCount: 50 }
  ]),
  uploadPatients
);

export default router;
