import express from 'express';
import { chatWithAssistant } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Allow public access to the AI for lead generation, or restrict it. 
// We'll leave it open for now so unauthenticated users can get help on the landing page.
router.post('/chat', chatWithAssistant);

export default router;
