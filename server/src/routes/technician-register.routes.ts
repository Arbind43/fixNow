import express from 'express';
import { upload } from '../middleware/upload.middleware';
import { registerTechnician } from '../controllers/technicianRegister.controller';

const router = express.Router();

router.post(
  '/register',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'tradeCertificate', maxCount: 1 },
    { name: 'portfolioPhotos', maxCount: 5 },
  ]),
  registerTechnician
);

export default router;
