import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IService extends Document {
  category: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  estimatedDuration: number; // in minutes
  isActive: boolean;
  features: string[]; // List of what's included
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: [true, 'Service must belong to a category'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide a base price'],
      min: [0, 'Price must be positive'],
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Please provide an estimated duration in minutes'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate service names within the same category
serviceSchema.index({ category: 1, name: 1 }, { unique: true });

export const Service = mongoose.model<IService>('Service', serviceSchema);
