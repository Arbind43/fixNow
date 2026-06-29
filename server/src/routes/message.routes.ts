import express from 'express';
import { getMessagesByBooking } from '../controllers/message.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.get('/:bookingId', getMessagesByBooking);

export default router;
