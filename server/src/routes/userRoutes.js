import express from 'express';
import { authenticateSession, authorizeRole } from '../middleware/auth.js';
import { 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    toggleUserActive 
} from '../controllers/userController.js';

const router = express.Router();

// ✅ متاح فقط لمديري النظام مع التحقق من الجلسة أولًا
router.get('/', authenticateSession, authorizeRole('system_admin'), getUsers);
router.post('/', authenticateSession, authorizeRole('system_admin'), createUser);
router.put('/:id', authenticateSession, authorizeRole('system_admin'), updateUser);
router.delete('/:id', authenticateSession, authorizeRole('system_admin'), deleteUser);
router.patch('/:id/toggle-active', authenticateSession, authorizeRole('system_admin'), toggleUserActive);

export default router;
