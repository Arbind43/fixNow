import express from 'express';
import { getMyWallet, addFunds, withdrawFunds, getBankAccount, saveBankAccount } from '../controllers/wallet.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.get('/me',           getMyWallet);
router.post('/add',         addFunds);
router.post('/withdraw',    withdrawFunds);
router.get('/bank-account', getBankAccount);
router.put('/bank-account', saveBankAccount);

export default router;
