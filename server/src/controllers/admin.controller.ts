import { Request, Response, NextFunction } from 'express';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { TechnicianProfile } from '../models/TechnicianProfile';

export const getDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Total Revenue (sum of all completed payments)
    const paidBookings = await Booking.find({ paymentStatus: 'completed' });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // 2. Total Bookings
    const totalBookings = await Booking.countDocuments();

    // 3. Active Users
    const activeUsers = await User.countDocuments({ role: 'customer' });

    // 4. Active Technicians
    const activeTechnicians = await TechnicianProfile.countDocuments({ verificationStatus: 'verified' });

    // 5. Bookings by Category (populate service, then group by category)
    const bookings = await Booking.find().populate({ path: 'service', populate: { path: 'category' } });
    const categoryCount: Record<string, number> = {};
    bookings.forEach(b => {
      const catName = (b.service as any)?.category?.name || 'Uncategorized';
      categoryCount[catName] = (categoryCount[catName] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

    // 6. Revenue Trend (last 7 days for simplicity)
    // We group paid bookings by day.
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dailyBookings = paidBookings.filter(b => b.createdAt >= startOfDay && b.createdAt <= endOfDay);
      const dailyRev = dailyBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][startOfDay.getDay()];
      revenueData.push({ name: dayName, revenue: dailyRev });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        activeUsers,
        activeTechnicians,
        categoryData,
        revenueData
      }
    });
  } catch (error) {
    next(error);
  }
};
