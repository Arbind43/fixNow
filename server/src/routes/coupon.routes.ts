import express from 'express';
import { validateCoupon } from '../controllers/coupon.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/validate', protect, validateCoupon);

export default router;
