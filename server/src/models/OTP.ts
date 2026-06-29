import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const otpSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1m' }, // MongoDB TTL index - documents automatically delete 1 minute after this date (expiresAt itself is set in the future)
  },
});

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);
