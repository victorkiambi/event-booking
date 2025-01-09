import { Router } from 'express';
import {
    getAllCompanies,
    getCompanyById,
    getCompanyBooths,
    getCompanyUsers,
    getCompanyBookings
} from '../controllers/company.controller';

const router = Router();

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.get('/:id/booths', getCompanyBooths);
router.get('/:id/users', getCompanyUsers);
router.get('/:id/bookings', getCompanyBookings);

export default router;