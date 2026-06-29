import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.heic', '.heif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.originalname} (${file.mimetype}). Only images and PDFs are allowed.`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
});
