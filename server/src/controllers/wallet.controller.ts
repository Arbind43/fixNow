import { Request, Response, NextFunction } from 'express';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { AppError } from '../utils/AppError';

// Get current user's wallet
export const getMyWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user?.id });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user?.id, balance: 0 });
    }

    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort('-createdAt')
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        wallet,
        transactions,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add funds to wallet (Mocking the payment gateway success)
export const addFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, reference } = req.body;

    if (!amount || amount <= 0) {
      return next(new AppError('Please provide a valid amount', 400));
    }

    let wallet = await Wallet.findOne({ user: req.user?.id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user?.id, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    const transaction = await Transaction.create({
      wallet: wallet._id,
      type: 'credit',
      amount,
      description: 'Added funds to wallet',
      reference: reference || `REF-${Date.now()}`,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: {
        wallet,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};

// Withdraw funds (for Technicians)
export const withdrawFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return next(new AppError('Please provide a valid amount', 400));
    }

    let wallet = await Wallet.findOne({ user: req.user?.id });
    if (!wallet) {
      return next(new AppError('Wallet not found', 404));
    }

    if (wallet.balance < amount) {
      return next(new AppError('Insufficient funds', 400));
    }

    wallet.balance -= amount;
    await wallet.save();

    const transaction = await Transaction.create({
      wallet: wallet._id,
      type: 'debit',
      amount,
      description: 'Withdrawal to Bank Account',
      reference: `WITHDRAW-${Date.now()}`,
      status: 'pending' // pending manual approval by admin in real scenario
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        wallet,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};
