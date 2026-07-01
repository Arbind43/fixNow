import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { TechnicianProfile } from '../models/TechnicianProfile';
import { AppError } from '../utils/AppError';

// â”€â”€â”€ Razorpay Payout (RazorpayX) helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// RazorpayX uses a separate key pair from regular Razorpay.
// Falls back to "manual payout" mode if keys are not configured.
const getRazorpayXAuth = () => {
  const keyId     = process.env.RAZORPAYX_KEY_ID     || process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAYX_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return Buffer.from(`${keyId}:${keySecret}`).toString('base64');
};

const isRazorpayXEnabled = () => {
  const key = process.env.RAZORPAYX_KEY_ID || '';
  return key.startsWith('rzp_') && process.env.NODE_ENV === 'production';
};

// â”€â”€â”€ GET WALLET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getMyWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user?.id });
    if (!wallet) wallet = await Wallet.create({ user: req.user?.id, balance: 0 });

    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort('-createdAt')
      .limit(50);

    // If technician, also fetch bank account details
    let bankAccount = null;
    if (req.user?.role === 'technician') {
      const profile = await TechnicianProfile.findOne({ user: req.user?.id }, 'banking');
      if (profile) {
        bankAccount = profile.banking;
      }
    }

    res.status(200).json({
      success: true,
      data: { wallet, transactions, bankAccount },
    });
  } catch (error) {
    next(error);
  }
};

// â”€â”€â”€ GET / SAVE BANK ACCOUNT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getBankAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await TechnicianProfile.findOne({ user: req.user?.id }, 'banking');
    if (!profile) return next(new AppError('Technician profile not found', 404));
    res.status(200).json({ success: true, data: profile.banking });
  } catch (error) { next(error); }
};

export const saveBankAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountHolderName, bankName, accountNumber, ifscCode, upiId } = req.body;

    if (!accountHolderName || !accountNumber || !ifscCode) {
      return next(new AppError('Account holder name, account number, and IFSC code are required', 400));
    }

    // Basic IFSC validation (11 chars, first 4 letters)
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
      return next(new AppError('Invalid IFSC code format', 400));
    }

    const profile = await TechnicianProfile.findOneAndUpdate(
      { user: req.user?.id },
      {
        'banking.accountHolderName': accountHolderName.trim(),
        'banking.bankName':          bankName?.trim() || '',
        'banking.accountNumber':     accountNumber.trim(),
        'banking.ifscCode':          ifscCode.toUpperCase().trim(),
        'banking.upiId':             upiId?.trim() || '',
      },
      { new: true, projection: 'banking' }
    );

    if (!profile) return next(new AppError('Technician profile not found', 404));

    res.status(200).json({
      success: true,
      message: 'Bank account details saved successfully',
      data: profile.banking,
    });
  } catch (error) { next(error); }
};

// â”€â”€â”€ ADD FUNDS (customer/test only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const addFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, reference } = req.body;
    if (!amount || amount <= 0) return next(new AppError('Please provide a valid amount', 400));

    let wallet = await Wallet.findOne({ user: req.user?.id });
    if (!wallet) wallet = await Wallet.create({ user: req.user?.id, balance: 0 });

    wallet.balance += amount;
    await wallet.save();

    const transaction = await Transaction.create({
      wallet:      wallet._id,
      type:        'credit',
      amount,
      description: 'Added funds to wallet',
      reference:   reference || `REF-${Date.now()}`,
      status:      'completed',
    });

    res.status(200).json({ success: true, data: { wallet, transaction } });
  } catch (error) { next(error); }
};

// â”€â”€â”€ WITHDRAW FUNDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Uses Razorpay Payout API (RazorpayX) when configured; falls back to manual queue.
export const withdrawFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return next(new AppError('Please provide a valid amount', 400));
    if (amount < 100) return next(new AppError('Minimum withdrawal amount is â‚¹100', 400));

    // 1. Fetch wallet
    const wallet = await Wallet.findOne({ user: req.user?.id });
    if (!wallet) return next(new AppError('Wallet not found', 404));
    if (wallet.balance < amount) return next(new AppError('Insufficient balance', 400));

    // 2. Ensure bank account is linked
    const profile = await TechnicianProfile.findOne({ user: req.user?.id }, 'banking');
    if (!profile) return next(new AppError('Technician profile not found', 404));

    const { accountHolderName, accountNumber, ifscCode, bankName } = profile.banking || {};
    if (!accountHolderName || !accountNumber || !ifscCode) {
      return next(new AppError('Please add your bank account details before withdrawing', 400));
    }

    // 3. Debit wallet immediately (hold the amount)
    wallet.balance -= amount;
    await wallet.save();

    // 4. Attempt real Razorpay Payout (RazorpayX) if keys are available
    let payoutId     = '';
    let payoutStatus = 'pending';
    let payoutMode   = 'manual';

    if (isRazorpayXEnabled()) {
      try {
        const auth = getRazorpayXAuth();
        const headers = {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          'X-Payout-Idempotency': `WD-${req.user?.id}-${Date.now()}`,
        };

        // Step A: Create Contact
        const contactRes = await axios.post('https://api.razorpay.com/v1/contacts', {
          name:          accountHolderName,
          type:          'vendor',
          reference_id:  req.user?.id,
        }, { headers });
        const contactId = contactRes.data.id;

        // Step B: Create Fund Account (bank)
        const fundAccRes = await axios.post('https://api.razorpay.com/v1/fund_accounts', {
          contact_id:   contactId,
          account_type: 'bank_account',
          bank_account: {
            name:           accountHolderName,
            ifsc:           ifscCode,
            account_number: accountNumber,
          },
        }, { headers });
        const fundAccountId = fundAccRes.data.id;

        // Step C: Create Payout
        const payoutRes = await axios.post('https://api.razorpay.com/v1/payouts', {
          account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER, // RazorpayX account
          fund_account_id: fundAccountId,
          amount:          amount * 100,         // in paise
          currency:        'INR',
          mode:            'IMPS',               // instant bank transfer
          purpose:         'payout',
          queue_if_low_balance: true,
          narration:       `FixNow Earnings Payout`,
          reference_id:    `WD-${req.user?.id}-${Date.now()}`,
        }, { headers });

        payoutId     = payoutRes.data.id;
        payoutStatus = payoutRes.data.status; // 'processing' or 'queued'
        payoutMode   = 'razorpay_x';

        console.log(`[Payout] RazorpayX payout ${payoutId} initiated for â‚¹${amount}`);
      } catch (payoutErr: any) {
        console.error('[Payout] RazorpayX failed, falling back to manual:', payoutErr?.response?.data || payoutErr.message);
        // Rollback wallet deduction if payout failed to initiate
        wallet.balance += amount;
        await wallet.save();
        return next(new AppError('Payout initiation failed. Please try again or contact support.', 500));
      }
    } else {
      // Test/Manual mode: queue the withdrawal for admin processing
      payoutId     = `WD-MANUAL-${Date.now()}`;
      payoutStatus = 'pending';
      payoutMode   = 'manual';
      console.log(`[Payout] Manual payout queued for â‚¹${amount} to ${accountHolderName} | ${bankName || ''} | ${accountNumber} | ${ifscCode}`);
    }

    // 5. Record transaction
    const transaction = await Transaction.create({
      wallet:      wallet._id,
      type:        'debit',
      amount,
      description: `Withdrawal to bank account (...${accountNumber.slice(-4)}) â€” ${payoutMode === 'razorpay_x' ? 'via Razorpay' : 'Manual processing (1-2 business days)'}`,
      reference:   payoutId,
      status:      payoutMode === 'razorpay_x' ? 'completed' : 'pending',
    });

    res.status(200).json({
      success: true,
      message: payoutMode === 'razorpay_x'
        ? `â‚¹${amount} payout initiated via IMPS. It will reflect in your bank within minutes.`
        : `â‚¹${amount} withdrawal request submitted. It will be processed within 1-2 business days to your account ending in ...${accountNumber.slice(-4)}.`,
      data: {
        wallet,
        transaction,
        payoutId,
        payoutStatus,
        estimatedArrival: payoutMode === 'razorpay_x' ? 'Within minutes (IMPS)' : '1-2 business days',
        bankAccount: {
          accountHolderName,
          accountNumber: `XXXXXXXX${accountNumber.slice(-4)}`,
          ifscCode,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


