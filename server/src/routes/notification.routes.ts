import express from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);

export default router;
