import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, CreditCard, TrendingUp, Check, X, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  created:    { label: 'Created',    color: '#6b7280', bg: '#f3f4f6' },
  successful: { label: 'Successful', color: '#22c55e', bg: '#dcfce7' },
  failed:     { label: 'Failed',     color: '#ef4444', bg: '#fee2e2' },
  pending:    { label: 'Pending',    color: '#f59e0b', bg: '#fef3c7' },
  completed:  { label: 'Completed',  color: '#22c55e', bg: '#dcfce7' },
};

export default function PaymentManagement() {
  const [activeTab, setActiveTab] = useState<'payments' | 'payouts'>('payments');

  // Payments State
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Payouts State
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutPagination, setPayoutPagination] = useState({ total: 0, pages: 1 });
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/payments', {
        params: { page, limit: 20, status: statusFilter === 'all' ? '' : statusFilter },
      });
      setPayments(res.data.data);
      setPagination(res.data.pagination);
      setTotalRevenue(res.data.totalRevenue || 0);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  const fetchWithdrawals = useCallback(async () => {
    setLoadingPayouts(true);
    try {
      const res = await axios.get('/api/admin/withdrawals', {
        params: { page: payoutPage, limit: 20 },
      });
      setWithdrawals(res.data.data);
      setPayoutPagination({ total: res.data.total, pages: res.data.pages });
    } catch { toast.error('Failed to load withdrawals'); }
    finally { setLoadingPayouts(false); }
  }, [payoutPage]);

  useEffect(() => {
    if (activeTab === 'payments') fetchPayments();
    else fetchWithdrawals();
  }, [activeTab, fetchPayments, fetchWithdrawals]);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const handlePayoutAction = async (id: string, status: 'completed' | 'failed') => {
    if (!window.confirm(Are you sure you want to mark this payout as \\\?)) return;
    setProcessingId(id);
    try {
      await axios.patch(/api/admin/withdrawals/\\\/action, { status });
      toast.success(\Payout marked as \\);
      fetchWithdrawals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Finance Management</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Manage customer payments and professional payouts</p>
          </div>
          <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-primary)] w-max">
            <button
              onClick={() => setActiveTab('payments')}
              className={\px-4 py-2 text-sm font-semibold rounded-md transition-all \\}
            >
              Payments Received
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={\px-4 py-2 text-sm font-semibold rounded-md transition-all \\}
            >
              Pending Payouts
            </button>
          </div>
        </div>

        {activeTab === 'payments' ? (
          <>
            {/* Revenue Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border p-5 flex items-center gap-4"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#dcfce7', color: '#22c55e' }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Total Revenue</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="rounded-xl border p-5 flex items-center gap-4"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                  <CreditCard size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Total Transactions</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{pagination.total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'created', 'successful', 'failed'].map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all border capitalize"
                    style={{
                      background:  statusFilter === s ? (cfg?.color || '#6366f1') : 'var(--bg-elevated)',
                      color:       statusFilter === s ? '#fff' : 'var(--text-secondary)',
                      borderColor: statusFilter === s ? (cfg?.color || '#6366f1') : 'var(--border-primary)',
                    }}>
                    {s === 'all' ? 'All' : cfg?.label}
                  </button>
                );
              })}
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Transaction ID', 'Customer', 'Amount', 'Status', 'Razorpay ID', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-t animate-pulse" style={{ borderColor: 'var(--border-primary)' }}>
                          <td colSpan={6} className="px-4 py-4 h-12 bg-[var(--bg-secondary)]/50" />
                        </tr>
                      ))
                    ) : payments.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-16 text-sm" style={{ color: 'var(--text-tertiary)' }}>No payments found</td></tr>
                    ) : payments.map(p => {
                      const cfg = STATUS_CONFIG[p.status];
                      return (
                        <tr key={p._id} className="border-t transition-colors"
                          style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            #{String(p._id).slice(-8).toUpperCase()}
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                            {p.customer?.name}<br/>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{p.customer?.email}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                            ₹{(p.amount / 100).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: cfg?.bg, color: cfg?.color }}>{cfg?.label}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {p.razorpayPaymentId || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Page {page} of {pagination.pages}</p>
                  <div className="flex gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: 'var(--border-primary)' }}>
                      <ChevronLeft size={16} />
                    </button>
                    <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: 'var(--border-primary)' }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* PAYOUTS TAB */
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    {['Professional', 'Amount', 'Reference', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingPayouts ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-t animate-pulse" style={{ borderColor: 'var(--border-primary)' }}>
                        <td colSpan={6} className="px-4 py-4 h-12 bg-[var(--bg-secondary)]/50" />
                      </tr>
                    ))
                  ) : withdrawals.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16 text-sm" style={{ color: 'var(--text-tertiary)' }}>No payout requests found</td></tr>
                  ) : withdrawals.map(w => {
                    const cfg = STATUS_CONFIG[w.status];
                    return (
                      <tr key={w._id} className="border-t transition-colors"
                        style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}>
                        <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                          <span className="font-semibold">{w.wallet?.user?.name || 'Unknown User'}</span><br/>
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{w.wallet?.user?.email}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-amber-500">
                          ₹{(w.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-primary)' }}>
                          {w.reference}<br/>
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{w.description}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: cfg?.bg, color: cfg?.color }}>{cfg?.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {new Date(w.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {w.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePayoutAction(w._id, 'completed')}
                                disabled={processingId === w._id}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                {processingId === w._id ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />} Mark Paid
                              </button>
                              <button
                                onClick={() => handlePayoutAction(w._id, 'failed')}
                                disabled={processingId === w._id}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <X size={14} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {payoutPagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Page {payoutPage} of {payoutPagination.pages}</p>
                <div className="flex gap-2">
                  <button disabled={payoutPage <= 1} onClick={() => setPayoutPage(p => p - 1)} className="p-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: 'var(--border-primary)' }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button disabled={payoutPage >= payoutPagination.pages} onClick={() => setPayoutPage(p => p + 1)} className="p-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: 'var(--border-primary)' }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
