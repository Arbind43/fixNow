import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Eye, XCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: '#f59e0b', bg: '#fef3c7' },
  accepted:    { label: 'Accepted',    color: '#3b82f6', bg: '#dbeafe' },
  in_progress: { label: 'In Progress', color: '#8b5cf6', bg: '#ede9fe' },
  completed:   { label: 'Completed',   color: '#22c55e', bg: '#dcfce7' },
  cancelled:   { label: 'Cancelled',   color: '#ef4444', bg: '#fee2e2' },
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected] = useState<any>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/bookings', {
        params: { page, limit: 15, status: statusFilter === 'all' ? '' : statusFilter },
      });
      setBookings(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const doAction = async (id: string, action: string) => {
    try {
      await axios.patch(`/api/admin/bookings/${id}/action`, { action });
      toast.success(`Booking ${action}led`);
      setSelected(null);
      fetch();
    } catch { toast.error('Action failed'); }
  };

  return (
    <AdminLayout>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Booking #{String(selected._id).slice(-8).toUpperCase()}</h3>
              <button onClick={() => setSelected(null)} className="text-sm px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                ['Service',    selected.service?.name || '—'],
                ['Customer',   `${selected.customer?.name} (${selected.customer?.email})`],
                ['Professional', selected.technician?.user?.name || '—'],
                ['Status',     STATUS_CONFIG[selected.status]?.label || selected.status],
                ['Amount',     `₹${selected.totalAmount?.toLocaleString()}`],
                ['Scheduled',  new Date(selected.scheduledDate).toLocaleString()],
                ['Created',    new Date(selected.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 text-sm py-1 border-b"
                  style={{ borderColor: 'var(--border-primary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-tertiary)' }}>{k}</span>
                  <span className="text-right" style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}

              {selected.address && (
                <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  📍 {selected.address.street}, {selected.address.city}, {selected.address.state}
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-2">
                {selected.status !== 'completed' && selected.status !== 'cancelled' && (
                  <>
                    <button onClick={() => doAction(selected._id, 'complete')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ background: '#22c55e' }}>
                      <CheckCircle size={14} /> Mark Completed
                    </button>
                    <button onClick={() => doAction(selected._id, 'cancel')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ background: '#ef4444' }}>
                      <XCircle size={14} /> Cancel Booking
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Booking Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{pagination.total.toLocaleString()} total bookings</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', ...Object.keys(STATUS_CONFIG)].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all border capitalize"
              style={{
                background:  statusFilter === s ? (STATUS_CONFIG[s]?.color || '#6366f1') : 'var(--bg-elevated)',
                color:       statusFilter === s ? '#fff' : 'var(--text-secondary)',
                borderColor: statusFilter === s ? (STATUS_CONFIG[s]?.color || '#6366f1') : 'var(--border-primary)',
              }}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Booking ID', 'Customer', 'Service', 'Status', 'Amount', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-t animate-pulse" style={{ borderColor: 'var(--border-primary)' }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded w-3/4" style={{ background: 'var(--border-primary)' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-sm" style={{ color: 'var(--text-tertiary)' }}>No bookings found</td></tr>
                ) : bookings.map(b => {
                  const cfg = STATUS_CONFIG[b.status];
                  return (
                    <tr key={b._id} className="border-t transition-colors"
                      style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        #{String(b._id).slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{b.customer?.name || '—'}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{b.service?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: cfg?.bg, color: cfg?.color }}>{cfg?.label}</span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        ₹{b.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(b.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(b)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-tertiary)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <Eye size={15} />
                        </button>
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
                  <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border disabled:opacity-40" style={{ borderColor: 'var(--border-primary)' }}>
                  <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

