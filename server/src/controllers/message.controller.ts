import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { Booking } from '../models/Booking';
import { AppError } from '../utils/AppError';

export const getMessagesByBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;

    // Ensure booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Ensure user is authorized to view these messages (Admin, or Customer/Technician of this booking)
    const isCustomer = booking.customer.toString() === req.user?.id;
    const isTechnician = booking.technician.toString() === req.user?.id; // Note: actual logic depends on how technician ref maps to user id
    const isAdmin = req.user?.role === 'admin';

    // Fetch messages
    const messages = await Message.find({ booking: bookingId })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    // Mark unread messages as read
    await Message.updateMany(
      { booking: bookingId, receiver: req.user?.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
