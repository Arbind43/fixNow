import { Request, Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint';
import { AppError } from '../utils/AppError';

// Customer: File a complaint
export const createComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, description, booking } = req.body;

    if (!subject || !description) {
      return next(new AppError('Subject and description are required', 400));
    }

    const complaint = await Complaint.create({
      customer: req.user?.id,
      booking: booking || undefined,
      subject,
      description,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// Customer: Get my complaints
export const getMyComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const complaints = await Complaint.find({ customer: req.user?.id })
      .populate('booking', 'service scheduledDate totalAmount')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all complaints
export const getAllComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const complaints = await Complaint.find()
      .populate('customer', 'name email phone')
      .populate('booking', 'service scheduledDate totalAmount')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    next(error);
  }
};

// Admin: Update complaint status
export const updateComplaintStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, adminNotes } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return next(new AppError('Complaint not found', 404));
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};
