import express from 'express';
import { 
  getTechnicians, 
  getTechnicianById, 
  updateMyProfile, 
  getMyProfile,
  reapplyForVerification,
} from '../controllers/technician.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/rbac.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// Public route: list all technicians
router.get('/', getTechnicians);

// Technician-only profile routes — MUST come before /:id so Express
// doesn't treat the literal string "me" as a MongoDB ObjectId param.
router.get('/me/profile', protect as any, restrictTo('technician', 'admin'), getMyProfile);
router.put('/me/profile', protect as any, restrictTo('technician', 'admin'), updateMyProfile);

// Re-apply after rejection (with optional document re-upload)
router.post(
  '/me/reapply',
  protect as any,
  restrictTo('technician'),
  upload.fields([
    { name: 'profilePhoto',     maxCount: 1 },
    { name: 'aadhaarCard',      maxCount: 1 },
    { name: 'panCard',          maxCount: 1 },
    { name: 'drivingLicense',   maxCount: 1 },
    { name: 'tradeCertificate', maxCount: 1 },
  ]),
  reapplyForVerification
);

// Public route: get a single technician by ID (keep LAST to avoid swallowing /me/*)
router.get('/:id', getTechnicianById);

export default router;
