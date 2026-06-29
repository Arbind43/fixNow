import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface TokenPayload {
  id: string;
  role: string;
}

export const generateAccessToken = (userId: Types.ObjectId, role: string): string => {
  const payload: TokenPayload = { id: userId.toString(), role };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (process.env.JWT_EXPIRE || '15m') as any }
  );
};

export const generateRefreshToken = (userId: Types.ObjectId): string => {
  return jwt.sign(
    { id: userId.toString() },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as any }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret') as { id: string };
};
