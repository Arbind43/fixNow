import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderValue } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` 
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderValue * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order value
    discountAmount = Math.min(discountAmount, orderValue);

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountAmount: Math.round(discountAmount),
      }
    });
  } catch (error) {
    next(error);
  }
};
