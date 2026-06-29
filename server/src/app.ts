import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app: Express = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
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
