import { Router } from 'express';
import {
    getAllBooths,
    getBoothById,
    getBoothsByType,
    getAvailableBooths
} from '../controllers/booth.controller';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getAllBooths);
router.get('/available', authenticateToken, getAvailableBooths);
router.get('/type/:typeId',authenticateToken, getBoothsByType);
router.get('/:id', authenticateToken, getBoothById);

export default router;