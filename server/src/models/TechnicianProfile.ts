import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITechnicianProfile extends Document {
  user: Types.ObjectId;
  categories: Types.ObjectId[];
  services: Types.ObjectId[];

  // ── Personal Details ───────────────────────────────────────
  personalDetails: {
    dob?: string;
    gender?: 'male' | 'female' | 'other' | '';
  };

  // ── Address ────────────────────────────────────────────────
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    serviceRadiusKm: number;
  };

  // ── Professional Info ──────────────────────────────────────
  bio: string;
  experienceYears: number;
  skills: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;

  // ── Location (GeoJSON) ─────────────────────────────────────
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
    address: string;
  };

  // ── Documents ──────────────────────────────────────────────
  documents: {
    profilePhoto?: string;
    aadhaarUrl?: string;
    panUrl?: string;
    licenseUrl?: string;
    certificateUrl?: string;
    portfolioUrls?: string[];
  };

  // ── Banking ────────────────────────────────────────────────
  banking: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };

  // ── Availability ───────────────────────────────────────────
  availability: {
    workingDays: string[];   // ['Mon','Tue',...]
    startTime: string;       // '09:00'
    endTime: string;         // '18:00'
    emergencyAvailable: boolean;
  };

  // ── Pricing ────────────────────────────────────────────────
  pricing: {
    baseCharge: number;
    inspectionCharge: number;
    emergencyCharge: number;
  };

  verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  rejectionReason?: string;
  verificationNotes?: string;
  suspendedReason?: string;
  docsRequested?: string;   // message from admin requesting additional documents
  portfolio: string[];
  createdAt: Date;
  updatedAt: Date;
}

const technicianProfileSchema = new Schema<ITechnicianProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Profile must belong to a user'],
      unique: true,
    },
    categories: [{ type: Schema.Types.ObjectId, ref: 'ServiceCategory' }],
    services:   [{ type: Schema.Types.ObjectId, ref: 'Service' }],

    // Personal
    personalDetails: {
      dob:    { type: String, default: '' },
      gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    },

    // Address
    address: {
      street:          { type: String, default: '' },
      city:            { type: String, default: '' },
      state:           { type: String, default: '' },
      pincode:         { type: String, default: '' },
      serviceRadiusKm: { type: Number, default: 10 },
    },

    // Professional
    bio:            { type: String, maxlength: [1000, 'Bio cannot exceed 1000 characters'], default: '' },
    experienceYears:{ type: Number, default: 0 },
    skills:         [{ type: String }],
    hourlyRate:     { type: Number, default: 0, min: 0 },
    rating:         { type: Number, default: 0, min: 0, max: 5, set: (val: number) => Math.round(val * 10) / 10 },
    reviewCount:    { type: Number, default: 0 },
    isAvailable:    { type: Boolean, default: true },

    // GeoJSON location
    location: {
      type:        { type: String, default: 'Point', enum: ['Point'] },
      coordinates: { type: [Number], default: [0, 0] },
      address:     { type: String, default: '' },
    },

    // Documents
    documents: {
      profilePhoto:  { type: String, default: '' },
      aadhaarUrl:    { type: String, default: '' },
      panUrl:        { type: String, default: '' },
      licenseUrl:    { type: String, default: '' },
      certificateUrl:{ type: String, default: '' },
      portfolioUrls: [{ type: String }],
    },

    // Banking
    banking: {
      accountHolderName: { type: String, default: '' },
      bankName:          { type: String, default: '' },
      accountNumber:     { type: String, default: '' },
      ifscCode:          { type: String, default: '' },
      upiId:             { type: String, default: '' },
    },

    // Availability
    availability: {
      workingDays:        { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      startTime:          { type: String, default: '09:00' },
      endTime:            { type: String, default: '18:00' },
      emergencyAvailable: { type: Boolean, default: false },
    },

    // Pricing
    pricing: {
      baseCharge:       { type: Number, default: 0 },
      inspectionCharge: { type: Number, default: 0 },
      emergencyCharge:  { type: Number, default: 0 },
    },

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    verificationNotes: { type: String, default: '' },
    suspendedReason: { type: String, default: '' },
    docsRequested: { type: String, default: '' },
    portfolio: [String],
  },
  { timestamps: true }
);

// Geospatial index
technicianProfileSchema.index({ location: '2dsphere' });

export const TechnicianProfile = mongoose.model<ITechnicianProfile>('TechnicianProfile', technicianProfileSchema);
