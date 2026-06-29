import express from 'express';
import { 
  getTechnicians, 
  getTechnicianById, 
  updateMyProfile, 
  getMyProfile 
} from '../controllers/technician.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/rbac.middleware';

const router = express.Router();

// Public route: list all technicians
router.get('/', getTechnicians);

// Technician-only profile routes — MUST come before /:id so Express
// doesn't treat the literal string "me" as a MongoDB ObjectId param.
router.get('/me/profile', protect as any, restrictTo('technician', 'admin'), getMyProfile);
router.put('/me/profile', protect as any, restrictTo('technician', 'admin'), updateMyProfile);

// Public route: get a single technician by ID (keep LAST to avoid swallowing /me/*)
router.get('/:id', getTechnicianById);

export default router;

