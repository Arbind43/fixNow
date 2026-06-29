import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: 'booking' | 'message' | 'system' | 'payment';
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['booking', 'message', 'system', 'payment'],
      default: 'system',
    },
    link: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
