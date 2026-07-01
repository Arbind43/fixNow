import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getDashboardMetrics,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllTechnicians,
  getTechnicianById,
  updateTechnicianVerification,
  deleteTechnician,
  getAllBookings,
  updateBooking,
  getAllComplaints,
  updateComplaint,
  getAllReviews,
  updateReview,
  getAllPayments,
  getSettings,
  updateSettings,
  getAuditLogs,
  sendAdminNotification,
  generateReport,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  getAllWithdrawals,
  updateWithdrawalStatus,
} from '../controllers/admin.controller';

const router = express.Router();

// ── Admin-only guard ──────────────────────────────────────────────────────────
router.use(protect as any);

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

router.use(adminOnly);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/metrics', getDashboardMetrics);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',              getAllUsers);
router.get('/users/:id',          getUserById);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id',       deleteUser);

// ── Technicians (Professionals) ───────────────────────────────────────────────
router.get('/technicians',              getAllTechnicians);
router.get('/technicians/:id',          getTechnicianById);
router.patch('/technicians/:id/verify', updateTechnicianVerification);
router.delete('/technicians/:id',       deleteTechnician);

// ── Bookings ──────────────────────────────────────────────────────────────────
router.get('/bookings',              getAllBookings);
router.patch('/bookings/:id/action', updateBooking);

// ── Complaints ────────────────────────────────────────────────────────────────
router.get('/complaints',              getAllComplaints);
router.patch('/complaints/:id/action', updateComplaint);

// ── Reviews ───────────────────────────────────────────────────────────────────
router.get('/reviews',              getAllReviews);
router.patch('/reviews/:id/action', updateReview);

// ── Payments ──────────────────────────────────────────────────────────────────
router.get('/payments', getAllPayments);

// ── Payouts / Withdrawals ─────────────────────────────────────────────────────
router.get('/withdrawals', getAllWithdrawals);
router.patch('/withdrawals/:id/action', updateWithdrawalStatus);

// ── Platform Settings ─────────────────────────────────────────────────────────
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// ── Audit Logs ────────────────────────────────────────────────────────────────
router.get('/audit-logs', getAuditLogs);

// ── Notifications ─────────────────────────────────────────────────────────────
router.post('/notifications/send', sendAdminNotification);

// ── Reports ───────────────────────────────────────────────────────────────────
router.get('/reports', generateReport);

// ── Categories (admin CRUD) ───────────────────────────────────────────────────
router.post('/categories',       adminCreateCategory);
router.patch('/categories/:id',  adminUpdateCategory);
router.delete('/categories/:id', adminDeleteCategory);

export default router;
