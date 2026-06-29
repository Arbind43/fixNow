import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  booking: Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries to load chat history
messageSchema.index({ booking: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, read: 1 }); // For unread badge counts

export const Message = mongoose.model<IMessage>('Message', messageSchema);
