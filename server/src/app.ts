import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app: Express = express();

// Security and utility middlewares
app.use(helmet());
// CORS - allow local dev + any Vercel deployment + explicit CLIENT_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads directory
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Root route - server info page
app.get('/', (req: Request, res: Response) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>FixNow API Server</title>
      <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; border-radius: 16px; padding: 40px 60px; text-align: center; border: 1px solid #334155; }
        h1 { color: #6366f1; font-size: 2.5rem; margin-bottom: 8px; }
        p { color: #94a3b8; font-size: 1.1rem; }
        .badge { display: inline-block; background: #22c55e; color: white; padding: 4px 16px; border-radius: 99px; font-size: 0.85rem; margin-top: 16px; }
        .endpoints { margin-top: 24px; text-align: left; background: #0f172a; border-radius: 8px; padding: 16px 24px; font-size: 0.9rem; }
        .endpoints span { color: #6366f1; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>⚡ FixNow API</h1>
        <p>Backend server is running successfully</p>
        <div class="badge">● Online</div>
        <div class="endpoints">
          <p><span>GET</span> /api/health — Health check</p>
          <p><span>POST</span> /api/auth/login — User login</p>
          <p><span>GET</span> /api/categories — All categories</p>
          <p><span>GET</span> /api/services — All services</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running normally' });
});

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import serviceRoutes from './routes/service.routes';
import technicianRoutes from './routes/technician.routes';
import technicianRegisterRoutes from './routes/technician-register.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import messageRoutes from './routes/message.routes';
import aiRoutes from './routes/ai.routes';
import notificationRoutes from './routes/notification.routes';
import walletRoutes from './routes/wallet.routes';
import invoiceRoutes from './routes/invoice.routes';
import reviewRoutes  from './routes/review.routes';
import adminRoutes   from './routes/admin.routes';
import couponRoutes  from './routes/coupon.routes';
import complaintRoutes from './routes/complaint.routes';

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/technician', technicianRegisterRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/coupons',    couponRoutes);
app.use('/api/complaints', complaintRoutes);

// Global Error Handler
import { errorHandler } from './middleware/error';
app.use(errorHandler as any); // Type cast until we properly type it

export default app;
