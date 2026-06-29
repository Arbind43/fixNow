import express from 'express';
import { createReview, getTechnicianReviews, getBookingReview } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public
router.get('/technician/:technicianId', getTechnicianReviews);
router.get('/booking/:bookingId',       getBookingReview);

// Protected — must be logged in to submit
router.post('/', protect as any, createReview);

export default router;
