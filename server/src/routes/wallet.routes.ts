import express from 'express';
import { getMyWallet, addFunds, withdrawFunds } from '../controllers/wallet.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.get('/me', getMyWallet);
router.post('/add', addFunds);
router.post('/withdraw', withdrawFunds);

export default router;
