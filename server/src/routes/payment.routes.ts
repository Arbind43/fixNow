import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
