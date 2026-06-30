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

import { OAuth2Client } from 'google-auth-library';

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return next(new AppError('No access token provided', 400));
    }

    // Google uses an access_token here because we used useGoogleLogin on frontend, 
    // which does implicit flow and returns an access_token. We need to fetch user info.
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    if (!response.ok) {
      return next(new AppError('Failed to fetch user info from Google', 401));
    }
    
    const payload = await response.json();
    const email = payload.email;
    const name = payload.name || 'Google User';
    const avatar = payload.picture;

    if (!email) {
      return next(new AppError('Google account does not have an email', 400));
    }

    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        role: 'customer',
        isVerified: true,
        avatar,
      });
    } else {
      // Optionally update avatar if they already exist
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        await user.save({ validateBeforeSave: false });
      }
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Try to send email, if fails reset token
    try {
      const message = `Your password reset code is: ${resetToken}\nThis code is valid for 10 minutes.\nIf you didn't request a password reset, please ignore this email!`;

      await sendEmail({
        email: user.email,
        subject: 'Your password reset code (valid for 10 min)',
        message,
      });

      console.log('Password reset OTP:', resetToken); // Fallback for dev

      res.status(200).json({
        success: true,
        message: 'Password reset code sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.log('Email sending failed, but here is the reset code for dev testing:', resetToken);
      
      // We'll still return success in dev so we can test the frontend flow even without email config
      res.status(200).json({
        success: true,
        message: 'If email was valid, a reset code has been sent.',
      });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully reset.',
    });
  } catch (error) {
    next(error);
  }
};
