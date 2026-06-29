import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceCategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceCategorySchema = new Schema<IServiceCategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      unique: true,
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
    icon: {
      type: String, // lucide-react icon name or SVG path
      required: true,
    },
    image: {
      type: String, // URL to image
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ServiceCategory = mongoose.model<IServiceCategory>('ServiceCategory', serviceCategorySchema);
