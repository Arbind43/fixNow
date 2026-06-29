import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.user must be populated by the protect middleware first
    if (!req.user) {
      return next(new AppError('You must be logged in to access this resource', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
