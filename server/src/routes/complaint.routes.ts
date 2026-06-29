import express, { Request, Response, NextFunction } from 'express';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
} from '../controllers/complaint.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.post('/', createComplaint);
router.get('/me', getMyComplaints);

// Admin only
const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};
router.get('/', adminOnly, getAllComplaints);
router.put('/:id', adminOnly, updateComplaintStatus);

export default router;
