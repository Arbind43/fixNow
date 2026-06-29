import mongoose, { Schema, Document, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IBooking extends Document {
  customer: Types.ObjectId;
  technician: Types.ObjectId;
  service: Types.ObjectId;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  scheduledDate: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technician: {
      type: Schema.Types.ObjectId,
      ref: 'TechnicianProfile',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please provide a scheduled date and time'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        type: [Number], // [lng, lat]
        index: '2dsphere',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
