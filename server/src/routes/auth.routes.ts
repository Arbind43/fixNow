import express from 'express';
import { register, login, getMe, sendOtp, verifyOtp, mockGoogleAuth, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, requestOtpSchema, verifyOtpSchema } from '../validators/auth.validator';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp', validate(requestOtpSchema), sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Mock Google Auth
router.get('/google', mockGoogleAuth);

// Protected routes
router.get('/me', protect as any, getMe);

export default router;
