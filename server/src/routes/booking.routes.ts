import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getBookingById, 
  updateBookingStatus 
} from '../controllers/booking.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All booking routes require authentication
router.use(protect as any);

router.post('/', createBooking);
router.get('/me', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);

export default router;
