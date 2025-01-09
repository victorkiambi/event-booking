// src/routes/user.routes.ts
import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
    register,
    login,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    getUserById,
    deactivateUser
} from '../controllers/user.controller';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticateToken, logout);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.patch('/profile', authenticateToken, updateProfile);
router.patch('/change-password', authenticateToken, changePassword);

// Admin only routes
router.get('/', authenticateToken, requireRoles([UserRole.ADMIN]), getAllUsers);
router.get('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), getUserById);
router.patch('/:id/deactivate', authenticateToken, requireRoles([UserRole.ADMIN]), deactivateUser);

export default router;