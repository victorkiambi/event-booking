// src/routes/booking.routes.ts
import { Router } from 'express';
import {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    getBookingsByDateRange
} from '../controllers/booking.controller';

const router = Router();

router.get('/', getAllBookings);
router.get('/date-range', getBookingsByDateRange);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/cancel', cancelBooking);

export default router;