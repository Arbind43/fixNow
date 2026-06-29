import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAvailabilitySlot extends Document {
  technician: Types.ObjectId;
  date: Date; // Specific calendar date
  startTime: string; // e.g., '10:00 AM'
  endTime: string; // e.g., '11:00 AM'
  isBooked: boolean;
  bookingRef?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    technician: {
      type: Schema.Types.ObjectId,
      ref: 'TechnicianProfile',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookingRef: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent overlapping or duplicate slots for the same technician
availabilitySlotSchema.index({ technician: 1, date: 1, startTime: 1 }, { unique: true });

export const AvailabilitySlot = mongoose.model<IAvailabilitySlot>('AvailabilitySlot', availabilitySlotSchema);
