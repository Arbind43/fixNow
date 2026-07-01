import { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, Download,
  Building2, CreditCard, CheckCircle2, AlertCircle, Pencil, X, ChevronRight,
  Lock, Clock, Banknote, ShieldCheck, Info
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Badge } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';

interface BankAccount {
  accountHolderName?: string;
  bankName?:          string;
  accountNumber?:     string;
  ifscCode?:          string;
  upiId?:             string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const isTechnician = user?.role === 'technician';

  const [balance, setBalance]           = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bankAccount, setBankAccount]   = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading]       = useState(true);

  // Withdraw modal state
  const [showWithdrawModal, setShowWithdrawModal]       = useState(false);
  const [withdrawAmount, setWithdrawAmount]             = useState('');
  const [isWithdrawing, setIsWithdrawing]               = useState(false);
  const [withdrawResult, setWithdrawResult]             = useState<any | null>(null);

  // Bank form state
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm]         = useState<BankAccount>({});
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankErrors, setBankErrors]     = useState<Partial<BankAccount>>({});

  const fetchWallet = async () => {
    try {
      const res = await axios.get('/api/wallet/me');
      setBalance(res.data.data.wallet.balance);
      setTransactions(res.data.data.transactions || []);
      if (res.data.data.bankAccount) {
        setBankAccount(res.data.data.bankAccount);
      }
    } catch {
      showToast.error('Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  // Open bank form pre-filled
  const openBankForm = () => {
    setBankForm({
      accountHolderName: bankAccount?.accountHolderName || '',
      bankName:          bankAccount?.bankName          || '',
      accountNumber:     bankAccount?.accountNumber     || '',
      ifscCode:          bankAccount?.ifscCode          || '',
      upiId:             bankAccount?.upiId             || '',
    });
    setBankErrors({});
    setShowBankForm(true);
  };

  const validateBankForm = (): boolean => {
    const errs: Partial<BankAccount> = {};
    if (!bankForm.accountHolderName?.trim())   errs.accountHolderName = 'Required';
    if (!bankForm.accountNumber?.trim())        errs.accountNumber     = 'Required';
    if (!bankForm.ifscCode?.trim())             errs.ifscCode          = 'Required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(bankForm.ifscCode)) errs.ifscCode = 'Invalid IFSC (e.g. HDFC0001234)';
    setBankErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveBankAccount = async () => {
    if (!validateBankForm()) return;
    setIsSavingBank(true);
    try {
      const res = await axios.put('/api/wallet/bank-account', bankForm);
      setBankAccount(res.data.data);
      setShowBankForm(false);
      showToast.success('Bank account saved successfully!');
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to save bank account');
    } finally {
      setIsSavingBank(false);
    }
  };

  const isBankLinked = !!(bankAccount?.accountHolderName && bankAccount?.accountNumber && bankAccount?.ifscCode);

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt < 100) { showToast.error('Minimum withdrawal is â‚¹100'); return; }
    if (amt > balance)     { showToast.error('Amount exceeds available balance'); return; }
    setIsWithdrawing(true);
    try {
      const res = await axios.post('/api/wallet/withdraw', { amount: amt });
      setWithdrawResult(res.data);
      setBalance(res.data.data.wallet.balance);
      setTransactions(prev => [res.data.data.transaction, ...prev]);
      setWithdrawAmount('');
      showToast.success('Withdrawal submitted!');
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAddFunds = async () => {
    try {
      await axios.post('/api/wallet/add', { amount: 500 });
      showToast.success('â‚¹500 added to wallet!');
      fetchWallet();
    } catch { showToast.error('Failed to add funds'); }
  };

  const pendingTx = transactions.filter(tx => tx.status === 'pending');
  const pendingOutflow = pendingTx.filter(tx => tx.type === 'debit').reduce((s, tx) => s + tx.amount, 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">My Wallet</h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">Manage your earnings and bank transfers</p>
          </div>
        </div>

        {/* Balance + Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/20"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <WalletIcon size={18} />
                <span className="text-sm font-medium">Available Balance</span>
              </div>
              <p className="text-5xl font-extrabold mb-1 tracking-tight">â‚¹{balance.toLocaleString()}</p>
              {pendingOutflow > 0 && (
                <p className="text-xs opacity-75 mb-4">
                  <Clock size={11} className="inline mr-1" />
                  â‚¹{pendingOutflow.toLocaleString()} pending withdrawal
                </p>
              )}
              {!pendingOutflow && <div className="mb-4" />}
              <div className="flex flex-wrap gap-3 mt-2">
                {!isTechnician && (
                  <button onClick={handleAddFunds} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20 transition-all">
                    <Plus size={16} /> Add Funds
                  </button>
                )}
                {isTechnician && (
                  <button
                    onClick={() => { setWithdrawResult(null); setShowWithdrawModal(true); }}
                    disabled={balance < 100}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/20 transition-all"
                  >
                    <ArrowUpRight size={16} /> Withdraw Funds
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Total Credited</p>
              <p className="text-2xl font-extrabold text-emerald-400">
                â‚¹{transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-4 text-center">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Total Withdrawn</p>
              <p className="text-2xl font-extrabold text-[var(--text-primary)]">
                â‚¹{transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Account Section (Technicians only) */}
        {isTechnician && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isBankLinked ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                  <Building2 size={20} className={isBankLinked ? 'text-emerald-400' : 'text-amber-400'} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">Bank Account</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isBankLinked ? 'Your payout destination' : 'Required for withdrawals'}
                  </p>
                </div>
              </div>
              <button
                onClick={openBankForm}
                className="flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-400 font-semibold transition-colors"
              >
                {isBankLinked ? <><Pencil size={14} /> Edit</> : <><Plus size={14} /> Add Account</>}
              </button>
            </div>

            {isBankLinked ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Account Holder</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{bankAccount?.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Account Number</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 font-mono">
                    â€¢â€¢â€¢â€¢{bankAccount?.accountNumber?.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">IFSC Code</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{bankAccount?.ifscCode}</p>
                </div>
                {bankAccount?.bankName && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Bank</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{bankAccount.bankName}</p>
                  </div>
                )}
                {bankAccount?.upiId && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">UPI ID</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{bankAccount.upiId}</p>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold">Linked</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-400">Bank account not linked</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Add your bank account details to withdraw your earnings directly to your bank.
                    Like Swiggy/Zomato delivery partners, funds will be transferred via IMPS/NEFT.
                  </p>
                  <button onClick={openBankForm} className="mt-2 text-sm text-amber-500 font-semibold flex items-center gap-1 hover:text-amber-400 transition-colors">
                    Add Bank Account <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-[var(--border-primary)] flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Transaction History</h2>
            <span className="text-xs text-[var(--text-tertiary)]">{transactions.length} entries</span>
          </div>

          <div className="divide-y divide-[var(--border-primary)]">
            {isLoading ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="p-10 text-center">
                <Banknote size={36} className="text-[var(--text-tertiary)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)]">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx._id} className="px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'credit' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{tx.description}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                        {tx.createdAt ? format(new Date(tx.createdAt), 'MMM d, yyyy Â· h:mm a') : 'â€”'}
                        {tx.reference && <span className="ml-2 font-mono text-[10px]">{tx.reference.toString().slice(-10).toUpperCase()}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-base ${tx.type === 'credit' ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>
                      {tx.type === 'credit' ? '+' : '-'}â‚¹{tx.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      tx.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400'
                      : tx.status === 'pending'  ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-red-500/15 text-red-400'
                    }`}>
                      {tx.status === 'pending' ? 'â³ Processing' : tx.status === 'completed' ? 'âœ“ Done' : 'âœ— Failed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* â”€â”€â”€ Bank Account Form Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {showBankForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                    <Building2 size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)]">Bank Account Details</h3>
                    <p className="text-xs text-[var(--text-secondary)]">For IMPS/NEFT payouts</p>
                  </div>
                </div>
                <button onClick={() => setShowBankForm(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-tertiary)]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    value={bankForm.accountHolderName || ''}
                    onChange={e => setBankForm(p => ({ ...p, accountHolderName: e.target.value }))}
                    placeholder="As per bank records"
                    className={`w-full px-3 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50 ${bankErrors.accountHolderName ? 'border-red-500' : 'border-[var(--border-primary)]'}`}
                  />
                  {bankErrors.accountHolderName && <p className="text-xs text-red-400 mt-1">{bankErrors.accountHolderName}</p>}
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bankName || ''}
                    onChange={e => setBankForm(p => ({ ...p, bankName: e.target.value }))}
                    placeholder="e.g. HDFC Bank, SBI"
                    className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={bankForm.accountNumber || ''}
                    onChange={e => setBankForm(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
                    placeholder="Enter account number"
                    className={`w-full px-3 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-amber-500/50 ${bankErrors.accountNumber ? 'border-red-500' : 'border-[var(--border-primary)]'}`}
                  />
                  {bankErrors.accountNumber && <p className="text-xs text-red-400 mt-1">{bankErrors.accountNumber}</p>}
                </div>

                {/* IFSC */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={bankForm.ifscCode || ''}
                    onChange={e => setBankForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className={`w-full px-3 py-2.5 bg-[var(--bg-secondary)] border rounded-xl text-sm text-[var(--text-primary)] font-mono uppercase focus:outline-none focus:border-amber-500/50 ${bankErrors.ifscCode ? 'border-red-500' : 'border-[var(--border-primary)]'}`}
                  />
                  {bankErrors.ifscCode && <p className="text-xs text-red-400 mt-1">{bankErrors.ifscCode}</p>}
                </div>

                {/* UPI ID (optional) */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">UPI ID <span className="font-normal opacity-60">(optional)</span></label>
                  <input
                    type="text"
                    value={bankForm.upiId || ''}
                    onChange={e => setBankForm(p => ({ ...p, upiId: e.target.value }))}
                    placeholder="yourname@bank"
                    className="w-full px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2 text-xs text-blue-400">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                <span>Your bank details are encrypted and used only for processing your earnings payout. We never charge from this account.</span>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowBankForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSaveBankAccount}
                  disabled={isSavingBank}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {isSavingBank ? 'Saving...' : 'Save Bank Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* â”€â”€â”€ Withdraw Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              {withdrawResult ? (
                /* â”€â”€ Success Screen â”€â”€ */
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Withdrawal Submitted!</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-5">{withdrawResult.message}</p>

                  <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-left space-y-3 mb-5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-tertiary)]">Amount</span>
                      <span className="font-bold text-[var(--text-primary)]">â‚¹{withdrawResult.data?.transaction?.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-tertiary)]">To Account</span>
                      <span className="font-mono text-[var(--text-primary)]">â€¢â€¢â€¢â€¢{withdrawResult.data?.bankAccount?.accountNumber?.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-tertiary)]">Estimated Arrival</span>
                      <span className="text-amber-400 font-semibold">{withdrawResult.data?.estimatedArrival}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-tertiary)]">Reference</span>
                      <span className="font-mono text-xs text-[var(--text-tertiary)]">{withdrawResult.data?.payoutId?.slice(-14)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setWithdrawResult(null); setShowWithdrawModal(false); }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* â”€â”€ Withdraw Form â”€â”€ */
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                        <Banknote size={20} className="text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)]">Withdraw Earnings</h3>
                        <p className="text-xs text-[var(--text-secondary)]">Direct bank transfer</p>
                      </div>
                    </div>
                    <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-tertiary)]">
                      <X size={18} />
                    </button>
                  </div>

                  {!isBankLinked ? (
                    /* Bank not linked warning */
                    <div className="py-6 text-center">
                      <Lock size={32} className="text-amber-400 mx-auto mb-3" />
                      <p className="font-semibold text-[var(--text-primary)] mb-1">Bank Account Required</p>
                      <p className="text-sm text-[var(--text-secondary)] mb-4">Link your bank account first to start withdrawing your earnings.</p>
                      <button
                        onClick={() => { setShowWithdrawModal(false); openBankForm(); }}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        Add Bank Account
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* To account info */}
                      <div className="flex items-center gap-3 bg-[var(--bg-secondary)] rounded-xl p-3 mb-4">
                        <CreditCard size={18} className="text-[var(--text-tertiary)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{bankAccount?.accountHolderName}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {bankAccount?.bankName || 'Bank'} â€¢â€¢â€¢â€¢{bankAccount?.accountNumber?.slice(-4)} Â· {bankAccount?.ifscCode}
                          </p>
                        </div>
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      </div>

                      {/* Amount input */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">Enter Withdrawal Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--text-secondary)]">â‚¹</span>
                          <input
                            type="number"
                            min={100}
                            max={balance}
                            value={withdrawAmount}
                            onChange={e => setWithdrawAmount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-2xl font-bold text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-[var(--text-tertiary)]">
                          <span>Min: â‚¹100</span>
                          <button
                            onClick={() => setWithdrawAmount(balance.toString())}
                            className="text-amber-500 font-semibold hover:text-amber-400"
                          >
                            Withdraw All (â‚¹{balance.toLocaleString()})
                          </button>
                        </div>
                      </div>

                      {/* Quick amounts */}
                      <div className="flex gap-2 mb-4">
                        {[500, 1000, 2000, 5000].filter(a => a <= balance).map(amt => (
                          <button
                            key={amt}
                            onClick={() => setWithdrawAmount(amt.toString())}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              withdrawAmount === amt.toString()
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-amber-500/50 hover:text-amber-500'
                            }`}
                          >
                            â‚¹{(amt / 1000).toFixed(amt >= 1000 ? 0 : 0)}k{amt < 1000 ? amt : ''}
                          </button>
                        ))}
                      </div>

                      {/* Transfer info */}
                      <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-5 text-xs text-blue-400">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        <span>Payouts are processed via IMPS (instant, once RazorpayX is configured) or manually within 1-2 business days. No fee charged.</span>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => setShowWithdrawModal(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-semibold transition-colors">
                          Cancel
                        </button>
                        <button
                          onClick={handleWithdraw}
                          disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) < 100}
                          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                        >
                          {isWithdrawing ? 'Processing...' : `Withdraw â‚¹${parseFloat(withdrawAmount || '0').toLocaleString()}`}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

