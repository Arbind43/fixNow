import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  wallet: Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string; // e.g. booking ID or payment ID
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
