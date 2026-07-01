import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { AppError } from '../utils/AppError';
import { TechnicianProfile } from '../models/TechnicianProfile';
import { Notification } from '../models/Notification';
import { processRefund, releaseEscrowToTechnician, getRefundPercentage } from './payment.controller';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { technicianId, serviceId, scheduledDate, address, notes } = req.body;

    // ── Validate service ──────────────────────────────────────────────────────
    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    let assignedTechnicianId = technicianId ? new mongoose.Types.ObjectId(technicianId) : null;
    let assignedTechProfile: any = null;

    // ── Auto-assign if no technician was pre-selected ─────────────────────────
    if (!assignedTechnicianId) {
      const baseQuery: any = { isAvailable: true, verificationStatus: 'verified' };

      // LAYER 1 — GPS $geoNear with service filter (most accurate)
      if (address?.coordinates?.length === 2) {
        const [lng, lat] = address.coordinates;
        try {
          const geoWithService = await TechnicianProfile.aggregate([
            {
              $geoNear: {
                near: { type: 'Point', coordinates: [lng, lat] },
                distanceField: 'calculatedDistance',
                spherical: true,
                query: { 
                  ...baseQuery,
                  $or: [
                    { services: new mongoose.Types.ObjectId(serviceId) },
                    { categories: new mongoose.Types.ObjectId(service.category as unknown as string) }
                  ]
                },
                maxDistance: 100000, // 100 km
              },
            },
            { $sort: { calculatedDistance: 1 } },
            { $limit: 1 },
          ]);

          if (geoWithService.length > 0) {
            assignedTechnicianId = geoWithService[0]._id;
          }
        } catch (e) {
          console.warn('[Booking] GPS+service geoNear failed, trying next layer', e);
        }
      }

      // LAYER 2 — GPS $geoNear without service filter
      if (!assignedTechnicianId && address?.coordinates?.length === 2) {
        const [lng, lat] = address.coordinates;
        try {
          const geoAny = await TechnicianProfile.aggregate([
            {
              $geoNear: {
                near: { type: 'Point', coordinates: [lng, lat] },
                distanceField: 'calculatedDistance',
                spherical: true,
                query: baseQuery,
                maxDistance: 100000,
              },
            },
            { $sort: { calculatedDistance: 1 } },
            { $limit: 1 },
          ]);

          if (geoAny.length > 0) {
            assignedTechnicianId = geoAny[0]._id;
          }
        } catch (e) {
          console.warn('[Booking] GPS geoNear failed, trying city/pincode', e);
        }
      }

      // LAYER 3 — City / Pincode text match
      if (!assignedTechnicianId && (address?.city || address?.zipCode)) {
        const orClauses: any[] = [];
        if (address.city)    orClauses.push({ 'address.city':    { $regex: address.city,    $options: 'i' } });
        if (address.zipCode) orClauses.push({ 'address.pincode': { $regex: address.zipCode, $options: 'i' } });

        const cityMatch = await TechnicianProfile.findOne({ ...baseQuery, $or: orClauses });
        if (cityMatch) assignedTechnicianId = cityMatch._id;
      }

      // LAYER 4 — Any available verified technician (last resort)
      if (!assignedTechnicianId) {
        const anyTech = await TechnicianProfile.findOne(baseQuery);
        if (anyTech) assignedTechnicianId = anyTech._id;
      }

      if (!assignedTechnicianId) {
        return next(new AppError('No available technicians found. Please try again later.', 404));
      }
    }

    // ── Fetch the assigned technician's pricing ───────────────────────────────
    assignedTechProfile = await TechnicianProfile.findById(assignedTechnicianId);
    const techBaseCharge = assignedTechProfile?.pricing?.baseCharge;
    const techHourlyRate = assignedTechProfile?.hourlyRate;
    const actualPrice = (techBaseCharge && techBaseCharge > 0)
      ? techBaseCharge
      : (techHourlyRate && techHourlyRate > 0)
        ? techHourlyRate
        : service.basePrice;

    const platformFee = 49;
    const gst = Math.round(actualPrice * 0.18);
    const totalAmount = actualPrice + platformFee + gst;

    // ── Check Time Slot Availability ──────────────────────────────────────────
    const AvailabilitySlot = require('../models/AvailabilitySlot').AvailabilitySlot;
    const existingSlot = await AvailabilitySlot.findOne({
      technician: assignedTechnicianId,
      date: new Date(new Date(scheduledDate).setHours(0,0,0,0)), // start of the day
      // Simple exact time matching for now, could be improved to range check
      startTime: new Date(scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isBooked: true
    });

    if (existingSlot) {
      return next(new AppError('The selected time slot is already booked for this technician. Please choose another time.', 400));
    }

    // ── Create Booking ────────────────────────────────────────────────────────
    const booking = await Booking.create({
      customer: req.user?.id,
      technician: assignedTechnicianId,
      service: serviceId,
      scheduledDate,
      address: {
        street:  address?.street  || '',
        city:    address?.city    || '',
        state:   address?.state   || '',
        zipCode: address?.zipCode || '',
        coordinates: address?.coordinates || undefined,
      },
      notes,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // ── Create Availability Slot ──────────────────────────────────────────────
    const startTimeStr = new Date(scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endDate = new Date(scheduledDate);
    endDate.setMinutes(endDate.getMinutes() + (service.estimatedDuration || 60));
    const endTimeStr = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    await AvailabilitySlot.create({
      technician: assignedTechnicianId,
      date: new Date(new Date(scheduledDate).setHours(0,0,0,0)),
      startTime: startTimeStr,
      endTime: endTimeStr,
      isBooked: true,
      bookingRef: booking._id
    });

    // ── Notify the technician ─────────────────────────────────────────────────
    if (assignedTechProfile) {
      await Notification.create({
        user: assignedTechProfile.user,
        title: '🔔 New Service Booking!',
        message: `You have a new ${service.name} booking scheduled for ${new Date(scheduledDate).toLocaleDateString()}. Accept it from your dashboard.`,
        type: 'booking',
        link: '/dashboard/requests',
      });
    }

    // Populate for full response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'name basePrice')
      .populate({ path: 'technician', populate: { path: 'user', select: 'name avatar phone' } });

    res.status(201).json({
      success: true,
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any;

    if (req.user?.role === 'technician') {
      // BUG FIX: Booking.technician stores TechnicianProfile._id, NOT User._id
      const profile = await TechnicianProfile.findOne({ user: req.user?.id }).select('_id');
      if (!profile) {
        // Technician has no profile yet — return empty
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      query = { technician: profile._id };
    } else {
      query = { customer: req.user?.id };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate({
        path: 'technician',
        populate: { path: 'user', select: 'name phone avatar' },
      })
      .populate('service', 'name basePrice estimatedDuration')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate({
        path: 'technician',
        populate: { path: 'user', select: 'name phone avatar' },
      })
      .populate('service', 'name basePrice estimatedDuration');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    const isCustomer = booking.customer._id.toString() === req.user?.id;
    const techProfile = booking.technician as any;
    const isTech = techProfile?.user?._id?.toString() === req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    if (!isCustomer && !isTech && !isAdmin) {
      return next(new AppError('You do not have permission to view this booking', 403));
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Role-based status transition rules
    const userRole = req.user?.role;
    const currentStatus = booking.status;

    const allowed: Record<string, string[]> = {
      technician: ['accepted', 'in_progress', 'completed', 'cancelled'],
      customer:   ['cancelled'],
      admin:      ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    };

    const allowedStatuses = allowed[userRole || ''] || [];
    if (!allowedStatuses.includes(status)) {
      return next(new AppError(`You cannot set status to "${status}"`, 403));
    }

    // Prevent going backwards (unless cancelled)
    const statusOrder = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const newIdx = statusOrder.indexOf(status);
    if (status !== 'cancelled' && newIdx < currentIdx) {
      return next(new AppError('Cannot revert booking to a previous status', 400));
    }

    booking.status = status;
    await booking.save();

    // If job is completed, release escrow → credit technician wallet
    if (status === 'completed' && booking.paymentStatus === 'completed') {
      try {
        await releaseEscrowToTechnician(booking._id.toString());
      } catch (err) {
        console.error('[Escrow] Error releasing to technician:', err);
      }
    }

    // If cancelled, process refund based on time policy
    if (status === 'cancelled') {
      const cancellerRole = (userRole === 'technician' ? 'technician' : userRole === 'admin' ? 'admin' : 'customer') as 'customer' | 'technician' | 'admin';
      const cancellationReason = req.body.reason || 'No reason provided';

      // Update booking with cancellation details
      booking.cancellationReason = cancellationReason;
      booking.cancelledBy        = cancellerRole;
      await booking.save();

      // Calculate refund entitlement (show to user even before processing)
      const refundPct = getRefundPercentage(cancellerRole, booking.scheduledDate, currentStatus);

      // Process actual refund (async, non-blocking)
      processRefund(booking._id.toString(), cancellerRole, cancellationReason).then(({ refundAmount }) => {
        console.log(`[Cancellation] Refund of ₹${refundAmount} processed for booking ${booking._id}`);
      }).catch(err => console.error('[Cancellation] Refund failed:', err));

      // Notify both parties about cancellation + refund
      try {
        const populatedBooking = await Booking.findById(booking._id)
          .populate('customer', 'name')
          .populate({ path: 'technician', populate: { path: 'user', select: 'name' } });

        const refundMsg = booking.paymentStatus === 'completed'
          ? (refundPct === 100 ? '💸 You will receive a full refund.' : refundPct === 50 ? `💸 You will receive a 50% refund (₹${Math.round(booking.totalAmount * 0.5)}).` : '⚠️ No refund applicable as cancellation was too close to the job time.')
          : '';

        const customerMsg = cancellerRole === 'technician'
          ? `The technician cancelled your booking. ${refundMsg}`
          : `Your booking has been cancelled. ${refundMsg}`;

        const techMsg = cancellerRole === 'customer'
          ? 'The customer has cancelled the booking.'
          : 'You have cancelled the booking.';

        const customerId = (populatedBooking?.customer as any)?._id;
        const techUserId = (populatedBooking?.technician as any)?.user?._id;

        if (customerId) {
          const notif = await Notification.create({ user: customerId, title: 'Booking Cancelled', message: customerMsg, type: 'booking', link: '/dashboard/bookings' });
          const io = req.app.get('io');
          if (io) io.to(`user_${customerId}`).emit('new_notification', notif);
        }
        if (techUserId && cancellerRole !== 'technician') {
          const notif = await Notification.create({ user: techUserId, title: 'Booking Cancelled', message: techMsg, type: 'booking', link: '/dashboard/job-requests' });
          const io = req.app.get('io');
          if (io) io.to(`user_${techUserId}`).emit('new_notification', notif);
        }
      } catch (notifyErr) {
        console.warn('[Booking] Cancellation notification failed:', notifyErr);
      }

      return res.status(200).json({ success: true, data: booking, refundPercent: refundPct });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
