import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, Download } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Badge } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';

export default function WalletPage() {
  const { user } = useAuth();
  const isTechnician = user?.role === 'technician';
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const res = await axios.get('/api/wallet/me');
      setBalance(res.data.data.wallet.balance);
      setTransactions(res.data.data.transactions);
    } catch (error) {
      showToast.error('Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchWallet();
  }, []);

  const handleAddFunds = async () => {
    try {
      // Mocking Razorpay add funds
      await axios.post('/api/wallet/add', { amount: 500 });
      showToast.success('₹500 added to wallet successfully!');
      fetchWallet();
    } catch (error) {
      showToast.error('Failed to add funds');
    }
  };

  const handleWithdraw = async () => {
    try {
      await axios.post('/api/wallet/withdraw', { amount: balance });
      showToast.success('Withdrawal request submitted!');
      fetchWallet();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to withdraw');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Wallet</h1>
            <p className="text-[var(--text-secondary)] mt-1">Manage your funds and transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2 bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 opacity-80">
                <WalletIcon size={20} />
                <span className="font-medium">Available Balance</span>
              </div>
              <h2 className="text-5xl font-bold mb-8">₹{balance.toLocaleString()}</h2>
              
              <div className="flex gap-4">
                {!isTechnician && (
                  <Button 
                    onClick={handleAddFunds}
                    className="bg-white text-[var(--color-primary-700)] hover:bg-zinc-100 border-none flex items-center gap-2"
                  >
                    <Plus size={18} /> Add ₹500 (Test)
                  </Button>
                )}
                {isTechnician && (
                  <Button 
                    onClick={handleWithdraw}
                    disabled={balance === 0}
                    className="bg-white text-[var(--color-primary-700)] hover:bg-zinc-100 border-none flex items-center gap-2"
                  >
                    <ArrowUpRight size={18} /> Withdraw All
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-center items-center text-center border-dashed border-2">
            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
              <Download size={24} className="text-[var(--text-tertiary)]" />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">Monthly Statement</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Download your transaction history for tax purposes.</p>
            <Button variant="outline" size="sm" className="w-full">Download PDF</Button>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="p-6 border-b border-[var(--border-primary)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Transactions</h2>
          </div>
          
          <div className="divide-y divide-[var(--border-primary)]">
            {isLoading ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">No transactions found.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{tx.description}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'credit' ? 'text-[var(--color-success)]' : 'text-[var(--text-primary)]'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </p>
                    <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'} className="mt-1">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
