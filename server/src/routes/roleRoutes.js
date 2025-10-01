// server/src/routes/roleRoutes.js
import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
    getRoles, 
    createRole, 
    updateRole, 
    deleteRole 
} from '../controllers/roleController.js';

const router = express.Router();

// ✅ جلب الأدوار (يجب أن يعمل لعرضها في UserManagement)
router.get('/', authenticateSession, getRoles);

// ✅ العمليات الإدارية — متاحة فقط لمدير النظام
router.post('/', authenticateSession, authorizeRole('system_admin'), createRole);
router.put('/:id', authenticateSession, authorizeRole('system_admin'), updateRole);
router.delete('/:id', authenticateSession, authorizeRole('system_admin'), deleteRole);

export default router;