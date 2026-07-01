import { Transaction } from '../models/Transaction';
import { Wallet } from '../models/Wallet';
import { AppError } from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { TechnicianProfile } from '../models/TechnicianProfile';
import { Review } from '../models/Review';
import { Complaint } from '../models/Complaint';
import { Payment } from '../models/Payment';
import { ServiceCategory } from '../models/ServiceCategory';
import { Service } from '../models/Service';
import { AuditLog } from '../models/AuditLog';
import { PlatformSettings } from '../models/PlatformSettings';
import { Notification } from '../models/Notification';

// â”€â”€â”€ Helper: create audit log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function createAuditLog(req: Request, action: any, opts?: {
  targetId?: string;
  targetType?: string;
  details?: string;
}) {
  const admin = (req as any).user;
  if (!admin) return;
  try {
    await AuditLog.create({
      admin:     admin._id,
      adminName: admin.name,
      action,
      targetId:   opts?.targetId,
      targetType: opts?.targetType,
      details:    opts?.details,
      ipAddress:  req.ip || (req.headers['x-forwarded-for'] as string) || '',
      userAgent:  (req.headers['user-agent'] as string) || '',
    });
  } catch (err) {
    console.error('[AuditLog] Failed to create log:', err);
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 1. DASHBOARD METRICS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [
      totalUsers,
      totalProfessionals,
      pendingVerifications,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalBookings,
      openComplaints,
      allBookings,
      paidBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      TechnicianProfile.countDocuments({ verificationStatus: 'verified' }),
      TechnicianProfile.countDocuments({ verificationStatus: 'pending' }),
      Booking.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['open', 'in_review'] } }),
      Booking.find().populate({ path: 'service', populate: { path: 'category' } }),
      Booking.find({ paymentStatus: 'completed' }),
    ]);

    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Average rating
    const ratings = await TechnicianProfile.find({ rating: { $gt: 0 } }, 'rating');
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((s, t) => s + t.rating, 0) / ratings.length) * 10) / 10
      : 0;

    // Bookings by category
    const categoryCount: Record<string, number> = {};
    allBookings.forEach(b => {
      const catName = (b.service as any)?.category?.name || 'Uncategorized';
      categoryCount[catName] = (categoryCount[catName] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

    // Booking status distribution
    const bookingStatusData = [
      { name: 'Pending',     value: await Booking.countDocuments({ status: 'pending' }) },
      { name: 'Accepted',    value: await Booking.countDocuments({ status: 'accepted' }) },
      { name: 'In Progress', value: await Booking.countDocuments({ status: 'in_progress' }) },
      { name: 'Completed',   value: completedBookings },
      { name: 'Cancelled',   value: cancelledBookings },
    ];

    // Revenue trend â€“ last 30 days
    const revenueData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay   = new Date(date.setHours(23, 59, 59, 999));
      const dailyRev = paidBookings
        .filter(b => b.createdAt >= startOfDay && b.createdAt <= endOfDay)
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      revenueData.push({
        name:    `${startOfDay.getDate()}/${startOfDay.getMonth() + 1}`,
        revenue: dailyRev,
      });
    }

    // User growth â€“ last 30 days
    const userGrowthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end   = new Date(date.setHours(23, 59, 59, 999));
      const count = await User.countDocuments({ role: 'customer', createdAt: { $gte: start, $lte: end } });
      userGrowthData.push({ name: `${start.getDate()}/${start.getMonth() + 1}`, users: count });
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProfessionals,
        pendingVerifications,
        activeBookings,
        completedBookings,
        cancelledBookings,
        totalBookings,
        openComplaints,
        totalRevenue,
        avgRating,
        categoryData,
        bookingStatusData,
        revenueData,
        userGrowthData,
      }
    });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 2. USER MANAGEMENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = parseInt(req.query.page as string)  || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip  = (page - 1) * limit;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const role   = req.query.role   as string || '';

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all')   filter.role = role;
    if (status === 'banned')      filter.isBanned = true;
    if (status === 'suspended')   filter.isSuspended = true;
    if (status === 'active')      filter.isBanned = false, filter.isSuspended = false;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password -refreshToken'),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Get booking history
    const bookings = await Booking.find({ customer: user._id })
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const complaints = await Complaint.find({ customer: user._id }).sort({ createdAt: -1 }).limit(10);

    res.status(200).json({ success: true, data: { user, bookings, complaints } });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let auditAction: any;

    switch (action) {
      case 'ban':
        user.isBanned = true;
        auditAction = 'BAN_USER';
        break;
      case 'unban':
        user.isBanned = false;
        auditAction = 'UNBAN_USER';
        break;
      case 'suspend':
        user.isSuspended = true;
        auditAction = 'SUSPEND_USER';
        break;
      case 'unsuspend':
        user.isSuspended = false;
        auditAction = 'UNSUSPEND_USER';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await user.save();
    await createAuditLog(req, auditAction, { targetId: user.id, targetType: 'User', details: reason });
    res.status(200).json({ success: true, message: `User ${action}ned successfully`, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await createAuditLog(req, 'DELETE_USER', { targetId: String(req.params.id), targetType: 'User' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 3. PROFESSIONAL VERIFICATION & MANAGEMENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllTechnicians = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page   = parseInt(req.query.page as string)  || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const skip   = (page - 1) * limit;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';

    const techFilter: any = {};
    if (status && status !== 'all') techFilter.verificationStatus = status;

    const techs = await TechnicianProfile.find(techFilter)
      .populate({
        path: 'user',
        match: search
          ? { $or: [
              { name:  { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ]}
          : {},
        select: '-password -refreshToken',
      })
      .populate('categories', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out nulls if user didn't match search
    const filtered = techs.filter(t => t.user !== null);
    const total    = await TechnicianProfile.countDocuments(techFilter);

    res.status(200).json({
      success: true,
      data: filtered,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getTechnicianById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tech = await TechnicianProfile.findById(req.params.id)
      .populate('user', '-password -refreshToken')
      .populate('categories', 'name')
      .populate('services', 'name');

    if (!tech) return res.status(404).json({ success: false, message: 'Technician not found' });

    const completedJobs = await Booking.countDocuments({ technician: tech._id, status: 'completed' });
    const cancelledJobs = await Booking.countDocuments({ technician: tech._id, status: 'cancelled' });
    const earnings      = await Booking.aggregate([
      { $match: { technician: tech._id, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...tech.toObject(),
        stats: {
          completedJobs,
          cancelledJobs,
          cancellationRate: completedJobs + cancelledJobs > 0
            ? Math.round((cancelledJobs / (completedJobs + cancelledJobs)) * 100)
            : 0,
          totalEarnings: earnings[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTechnicianVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, reason, notes } = req.body;
    const tech = await TechnicianProfile.findById(req.params.id);
    if (!tech) return res.status(404).json({ success: false, message: 'Technician not found' });

    let auditAction: any;
    let notifTitle  = '';
    let notifMsg    = '';
    let notifLink   = '/dashboard/technician';

    switch (action) {
      case 'approve':
        tech.verificationStatus = 'verified';
        tech.docsRequested      = '';   // clear any pending doc request
        auditAction  = 'APPROVE_TECHNICIAN';
        notifTitle   = 'ðŸŽ‰ Verification Approved!';
        notifMsg     = 'Congratulations! Your professional account has been verified. You can now go online and start accepting jobs.';
        break;

      case 'reject':
        tech.verificationStatus = 'rejected';
        tech.rejectionReason    = reason || '';
        auditAction  = 'REJECT_TECHNICIAN';
        notifTitle   = 'âŒ Verification Rejected';
        notifMsg     = reason
          ? `Your verification was rejected. Reason: ${reason}. Please contact support for more information.`
          : 'Your verification was rejected. Please contact support for more information.';
        break;

      case 'suspend':
        tech.verificationStatus          = 'suspended';
        (tech as any).suspendedReason    = reason || '';
        auditAction  = 'SUSPEND_TECHNICIAN';
        notifTitle   = 'âš ï¸ Account Suspended';
        notifMsg     = reason
          ? `Your account has been suspended. Reason: ${reason}. Please contact support.`
          : 'Your account has been suspended. Please contact support for more information.';
        break;

      case 'reactivate':
        tech.verificationStatus = 'verified';
        (tech as any).suspendedReason = '';
        auditAction  = 'ACTIVATE_TECHNICIAN';
        notifTitle   = 'âœ… Account Reactivated';
        notifMsg     = 'Your account has been reactivated. You can now go online and accept new jobs.';
        break;

      case 'request_docs':
        tech.docsRequested = notes || reason || 'The admin has requested additional documents for verification.';
        auditAction  = 'REQUEST_ADDITIONAL_DOCS';
        notifTitle   = 'ðŸ“„ Additional Documents Required';
        notifMsg     = notes || reason
          ? `Admin message: ${notes || reason}`
          : 'Please upload additional documents to complete your verification. Log in to your dashboard for details.';
        notifLink = '/dashboard/technician/profile';
        break;

      case 'add_note':
        (tech as any).verificationNotes = notes || '';
        auditAction  = 'ADD_VERIFICATION_NOTE';
        notifTitle   = 'ðŸ“ Verification Note Added';
        notifMsg     = notes
          ? `Admin note: ${notes}`
          : 'The admin has added a note to your verification.';
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await tech.save();
    await createAuditLog(req, auditAction, {
      targetId:   String(tech._id),
      targetType: 'TechnicianProfile',
      details:    reason || notes,
    });

    // Sync isVerified on the User document
    if (action === 'approve' || action === 'reactivate') {
      await User.findByIdAndUpdate(tech.user, { isVerified: true });
    } else if (action === 'suspend' || action === 'reject') {
      await User.findByIdAndUpdate(tech.user, { isVerified: false });
    }

    // Send in-app notification to the technician's user account
    if (notifTitle && tech.user) {
      await Notification.create({
        user:    tech.user,
        title:   notifTitle,
        message: notifMsg,
        type:    'system',
        link:    notifLink,
        read:    false,
      });
    }

    res.status(200).json({ success: true, message: `Technician ${action} successful`, data: tech });
  } catch (error) {
    next(error);
  }
};


export const deleteTechnician = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tech = await TechnicianProfile.findByIdAndDelete(req.params.id);
    if (!tech) return res.status(404).json({ success: false, message: 'Technician not found' });
    await createAuditLog(req, 'DELETE_TECHNICIAN', { targetId: String(req.params.id), targetType: 'TechnicianProfile' });
    res.status(200).json({ success: true, message: 'Technician deleted' });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 4. BOOKING MANAGEMENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page   = parseInt(req.query.page as string)  || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const skip   = (page - 1) * limit;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('customer', 'name email phone')
        .populate({ path: 'technician', populate: { path: 'user', select: 'name email' } })
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, technicianId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    let auditAction: any;

    switch (action) {
      case 'cancel':
        booking.status = 'cancelled';
        auditAction = 'CANCEL_BOOKING';
        break;
      case 'complete':
        booking.status = 'completed';
        auditAction = 'COMPLETE_BOOKING';
        break;
      case 'assign':
        if (!technicianId) return res.status(400).json({ success: false, message: 'technicianId required' });
        booking.technician = technicianId;
        auditAction = 'ASSIGN_BOOKING';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await booking.save();
    await createAuditLog(req, auditAction, { targetId: String(booking._id), targetType: 'Booking' });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 5. COMPLAINT MANAGEMENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page   = parseInt(req.query.page as string)  || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const skip   = (page - 1) * limit;
    const status = req.query.status as string || '';

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('customer', 'name email')
        .populate('booking', 'status totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action, notes } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    let auditAction: any;

    switch (action) {
      case 'resolve':
        complaint.status = 'resolved';
        auditAction = 'RESOLVE_COMPLAINT';
        break;
      case 'reject':
        complaint.status = 'closed';
        auditAction = 'REJECT_COMPLAINT';
        break;
      case 'close':
        complaint.status = 'closed';
        auditAction = 'CLOSE_COMPLAINT';
        break;
      case 'in_review':
        complaint.status = 'in_review';
        auditAction = 'RESOLVE_COMPLAINT';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    if (notes) complaint.adminNotes = notes;
    await complaint.save();
    await createAuditLog(req, auditAction, { targetId: String(complaint._id), targetType: 'Complaint', details: notes });
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 6. REVIEWS MANAGEMENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page   = parseInt(req.query.page as string)  || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const skip   = (page - 1) * limit;
    const filter = req.query.filter as string || '';

    const query: any = {};
    if (filter === 'hidden')   query.isHidden   = true;
    if (filter === 'reported') query.isReported = true;
    if (filter === 'visible')  query.isHidden   = false;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('customer', 'name email avatar')
        .populate({ path: 'technician', populate: { path: 'user', select: 'name' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    let auditAction: any;

    switch (action) {
      case 'hide':
        (review as any).isHidden = true;
        auditAction = 'HIDE_REVIEW';
        break;
      case 'show':
        (review as any).isHidden = false;
        auditAction = 'HIDE_REVIEW';
        break;
      case 'delete':
        await Review.findByIdAndDelete(req.params.id);
        await createAuditLog(req, 'DELETE_REVIEW', { targetId: String(req.params.id), targetType: 'Review' });
        return res.status(200).json({ success: true, message: 'Review deleted' });
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    await review.save();
    await createAuditLog(req, auditAction, { targetId: String(review._id), targetType: 'Review' });
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 7. PAYMENTS MANAGEMENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = parseInt(req.query.page as string)  || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip  = (page - 1) * limit;
    const status = req.query.status as string || '';

    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('customer', 'name email')
        .populate('booking', 'status totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(filter),
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      totalRevenue: totalRevenue[0]?.total || 0,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 8. PLATFORM SETTINGS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await PlatformSettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    await createAuditLog(req, 'UPDATE_SETTINGS', { details: JSON.stringify(req.body) });
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 9. AUDIT LOGS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = parseInt(req.query.page as string)  || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip  = (page - 1) * limit;
    const action = req.query.action as string || '';

    const filter: any = {};
    if (action && action !== 'all') filter.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 10. NOTIFICATIONS CENTER
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const sendAdminNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, body, type, targetType, targetUserId } = req.body;

    let userIds: string[] = [];

    if (targetType === 'all') {
      const users = await User.find({}, '_id');
      userIds = users.map(u => String(u._id));
    } else if (targetType === 'customers') {
      const users = await User.find({ role: 'customer' }, '_id');
      userIds = users.map(u => String(u._id));
    } else if (targetType === 'professionals') {
      const users = await User.find({ role: 'technician' }, '_id');
      userIds = users.map(u => String(u._id));
    } else if (targetType === 'individual' && targetUserId) {
      userIds = [targetUserId];
    }

    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message: body,
      type: (['booking', 'message', 'system', 'payment'].includes(type) ? type : 'system') as any,
      read: false,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await createAuditLog(req, 'SEND_NOTIFICATION', {
      details: `Sent "${title}" to ${targetType} (${userIds.length} users)`,
    });

    res.status(200).json({
      success: true,
      message: `Notification sent to ${userIds.length} users`,
    });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 11. REPORTS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end   = endDate   ? new Date(endDate   as string) : new Date();
    const dateFilter = { createdAt: { $gte: start, $lte: end } };

    let data: any = {};

    switch (type) {
      case 'revenue':
        data = await Booking.aggregate([
          { $match: { paymentStatus: 'completed', ...dateFilter } },
          { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            count:   { $sum: 1 },
          }},
          { $sort: { _id: 1 } },
        ]);
        break;
      case 'bookings':
        data = await Booking.find(dateFilter)
          .populate('customer', 'name email')
          .populate('service', 'name')
          .sort({ createdAt: -1 });
        break;
      case 'users':
        data = await User.find({ role: 'customer', ...dateFilter })
          .select('-password -refreshToken')
          .sort({ createdAt: -1 });
        break;
      case 'professionals':
        data = await TechnicianProfile.find(dateFilter)
          .populate('user', 'name email phone')
          .sort({ createdAt: -1 });
        break;
      case 'complaints':
        data = await Complaint.find(dateFilter)
          .populate('customer', 'name email')
          .sort({ createdAt: -1 });
        break;
      case 'payments':
        data = await Payment.find(dateFilter)
          .populate('customer', 'name email')
          .sort({ createdAt: -1 });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.status(200).json({ success: true, type, startDate: start, endDate: end, data });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 12. SERVICES & CATEGORIES  (admin CRUD wrappers for audit logging)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const adminCreateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await ServiceCategory.create(req.body);
    await createAuditLog(req, 'CREATE_CATEGORY', { targetId: String(category._id), targetType: 'ServiceCategory' });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    await createAuditLog(req, 'UPDATE_CATEGORY', { targetId: String(req.params.id), targetType: 'ServiceCategory' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ServiceCategory.findByIdAndDelete(req.params.id);
    await createAuditLog(req, 'DELETE_CATEGORY', { targetId: String(req.params.id), targetType: 'ServiceCategory' });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€ Withdrawals (Manual Payouts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getAllWithdrawals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = {
      type: 'debit' as const,
      description: { $regex: 'Withdrawal to bank', $options: 'i' }
    };

    const transactions = await Transaction.find(query)
      .populate({ path: 'wallet', populate: { path: 'user', select: 'name email role' } })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) { next(error); }
};

export const updateWithdrawalStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['completed', 'failed'].includes(status)) {
      return next(new AppError('Status must be completed or failed', 400));
    }

    const tx = await Transaction.findById(req.params.id).populate('wallet');
    if (!tx) return next(new AppError('Withdrawal transaction not found', 404));

    if (tx.status !== 'pending') {
      return next(new AppError('Transaction is already processed', 400));
    }

    tx.status = status;
    await tx.save();

    // If failed, refund the wallet
    if (status === 'failed' && tx.wallet) {
      const wallet = await Wallet.findById((tx.wallet as any)._id);
      if (wallet) {
        wallet.balance += tx.amount;
        await wallet.save();
        
        await Transaction.create({
          wallet: wallet._id,
          type: 'credit',
          amount: tx.amount,
          description: 'Refund for failed withdrawal',
          reference: tx.reference,
          status: 'completed',
        });
      }
    }

    await createAuditLog(req, 'UPDATE_WITHDRAWAL', {
      targetId: tx._id.toString(),
      targetType: 'Transaction',
      details: `Withdrawal marked as ${status}`,
    });

    res.status(200).json({
      success: true,
      data: tx,
    });
  } catch (error) { next(error); }
};

