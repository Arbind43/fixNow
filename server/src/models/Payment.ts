import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  booking:           Types.ObjectId;
  customer:          Types.ObjectId;
  razorpayOrderId:   string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount:            number;         // total paid by customer
  platformFee:       number;         // 15% commission kept by platform
  technicianAmount:  number;         // 85% to be credited to technician on completion
  currency:          string;
  paymentMethod:     'razorpay' | 'cod';
  status:            'created' | 'successful' | 'failed';
  escrowReleased:    boolean;        // true once job completed & technician wallet credited
  refundId?:         string;         // Razorpay refund ID
  refundStatus?:     'none' | 'pending' | 'processed' | 'failed';
  refundAmount?:     number;         // actual refunded amount (based on cancellation policy)
  refundReason?:     string;
  refundedAt?:       Date;
  createdAt:         Date;
  updatedAt:         Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking:           { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId:   { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount:            { type: Number, required: true },
    platformFee:       { type: Number, default: 0 },
    technicianAmount:  { type: Number, default: 0 },
    currency:          { type: String, default: 'INR' },
    paymentMethod:     { type: String, enum: ['razorpay', 'cod'], default: 'razorpay' },
    status:            { type: String, enum: ['created', 'successful', 'failed'], default: 'created' },
    escrowReleased:    { type: Boolean, default: false },
    refundId:          { type: String },
    refundStatus:      { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' },
    refundAmount:      { type: Number, default: 0 },
    refundReason:      { type: String },
    refundedAt:        { type: Date },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);


