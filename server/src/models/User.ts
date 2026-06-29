import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'technician' | 'admin';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  googleId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined to bypass unique constraint
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'technician', 'admin'],
      default: 'customer',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre<IUser>('save', async function () {
  // Only run this function if password was actually modified
  if (!this.isModified('password') || !this.password) {
    return;
  }

  // Hash the password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
