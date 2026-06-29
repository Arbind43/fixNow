import express, { Request, Response, NextFunction } from 'express';
import { getDashboardMetrics } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Only admin can access these routes
router.use(protect as any);

// Inline admin role guard
const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

router.get('/metrics', adminOnly, getDashboardMetrics);

export default router;
