import express from 'express';
import { 
  getAllCategories, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller';
import { protect } from '../middleware/auth.middleware';
import { restrictTo } from '../middleware/rbac.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);

// Admin only routes
router.use(protect as any);
router.use(restrictTo('admin'));

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
