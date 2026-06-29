import express from 'express';
import { 
  getAllServices, 
  getServiceBySlug, 
  createService, 
  updateService 
} from '../controllers/service.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/rbac.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:slug', getServiceBySlug);

// Admin only routes
router.use(protect as any);
router.use(restrictTo('admin'));

router.post('/', createService);
router.put('/:id', updateService);

export default router;
