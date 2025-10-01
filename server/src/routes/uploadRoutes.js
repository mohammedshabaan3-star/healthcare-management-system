import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { uploadGovernorates, uploadHospitals } from '../controllers/uploadController.js';
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

export default router;
