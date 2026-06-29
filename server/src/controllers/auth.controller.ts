import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { OTP } from '../models/OTP';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';

// Helper to generate and send OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // Generate Tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to DB (optional, but good for revocation)
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // TODO: Send Welcome/Verification Email with OTP

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    // Find if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await OTP.deleteMany({ email }); // Clear existing
    await OTP.create({ email, otp, expiresAt });

    // Send the email using Nodemailer
    const message = `Your FixNow verification code is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share this code with anyone.`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your FixNow Verification Code',
        message
      });
    } catch (err) {
      await OTP.deleteMany({ email }); // Rollback
      return next(new AppError('There was an error sending the email. Try again later!', 500));
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to email successfully',
      dev_otp: process.env.NODE_ENV === 'development' ? otp : undefined 
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });
    
    if (!otpRecord) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Verify user
    await User.findOneAndUpdate({ email }, { isVerified: true });
    
    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const mockGoogleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For demonstration, we simply find the first customer in the DB and log them in
    let user = await User.findOne({ role: 'customer' });
    
    if (!user) {
      // Create a dummy google user if none exist
      user = await User.create({
        name: 'Google User',
        email: 'googleuser@example.com',
        password: 'Password123!', // Required by schema
        role: 'customer',
        isVerified: true
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    
    // Redirect to the frontend with the token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/login?token=${accessToken}`);
  } catch (error) {
    next(error);
  }
};
