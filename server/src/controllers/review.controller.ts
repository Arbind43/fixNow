import { Request, Response, NextFunction } from 'express';
import { Review }           from '../models/Review';
import { Booking }          from '../models/Booking';
import { TechnicianProfile } from '../models/TechnicianProfile';
import { AppError }         from '../utils/AppError';

// POST /api/reviews  — submit a review for a completed booking
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return next(new AppError('bookingId and rating are required', 400));
    }
    if (rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    // Verify the booking exists and belongs to this customer
    const booking = await Booking.findById(bookingId);
    if (!booking) return next(new AppError('Booking not found', 404));
    if (booking.customer.toString() !== req.user?.id) {
      return next(new AppError('You can only review your own bookings', 403));
    }
    if (booking.status !== 'completed') {
      return next(new AppError('You can only review completed bookings', 400));
    }

    // Prevent duplicate reviews
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) return next(new AppError('You have already reviewed this booking', 409));

    const review = await Review.create({
      booking:    bookingId,
      customer:   req.user!.id,
      technician: booking.technician,
      rating,
      comment: comment || '',
    });

    // Populate for response
    const populated = await Review.findById(review._id)
      .populate('customer', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/technician/:technicianId  — get all reviews for a technician
export const getTechnicianReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { technicianId } = req.params;
    const reviews = await Review.find({ technician: technicianId })
      .populate('customer', 'name avatar')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/booking/:bookingId  — check if a review exists for a booking
export const getBookingReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await Review.findOne({ booking: req.params.bookingId })
      .populate('customer', 'name avatar');
    res.status(200).json({ success: true, data: review || null });
  } catch (error) {
    next(error);
  }
};
