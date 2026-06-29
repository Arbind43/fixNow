import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  booking: Types.ObjectId;
  customer: Types.ObjectId;
  technician: Types.ObjectId;
  invoiceNumber: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  platformFee: number;
  total: number;
  pdfUrl?: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
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
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    total: { type: Number, required: true },
    pdfUrl: { type: String },
    status: {
      type: String,
      enum: ['draft', 'issued', 'paid', 'cancelled'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
