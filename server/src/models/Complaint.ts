import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComplaint extends Document {
  customer: Types.ObjectId;
  booking?: Types.ObjectId;
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'closed'],
      default: 'open',
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
