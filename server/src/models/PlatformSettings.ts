import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  commissionRate: number;      // percentage, e.g. 10
  gstRate: number;             // percentage, e.g. 18
  supportEmail: string;
  supportPhone: string;
  cancellationCharge: number;  // flat INR amount
  maintenanceMode: boolean;
  maintenanceMessage: string;
  platformName: string;
  websiteUrl: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  contactAddress: string;
  minPayoutAmount: number;
  maxBookingRadius: number;
  updatedAt: Date;
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    commissionRate: { type: Number, default: 10, min: 0, max: 100 },
    gstRate:        { type: Number, default: 18, min: 0, max: 100 },
    supportEmail:   { type: String, default: 'support@fixnow.in' },
    supportPhone:   { type: String, default: '+91-9876543210' },
    cancellationCharge: { type: Number, default: 100, min: 0 },
    maintenanceMode:    { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: 'Platform is under maintenance. Please try again later.' },
    platformName:  { type: String, default: 'FixNow' },
    websiteUrl:    { type: String, default: 'https://fixnow.in' },
    socialLinks: {
      facebook:  { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter:   { type: String, default: '' },
      linkedin:  { type: String, default: '' },
      youtube:   { type: String, default: '' },
    },
    contactAddress:   { type: String, default: '' },
    minPayoutAmount:  { type: Number, default: 500, min: 0 },
    maxBookingRadius: { type: Number, default: 50, min: 1 },
  },
  {
    timestamps: true,
  }
);

export const PlatformSettings = mongoose.model<IPlatformSettings>('PlatformSettings', platformSettingsSchema);
