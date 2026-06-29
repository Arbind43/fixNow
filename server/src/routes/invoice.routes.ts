import express from 'express';
import { generateInvoiceRecord, downloadInvoicePdf } from '../controllers/invoice.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect as any);

router.post('/generate', generateInvoiceRecord);
router.get('/:id/pdf', downloadInvoicePdf);

export default router;
