import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Eye, MessageSquare, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:      { label: 'Open',      color: '#ef4444', bg: '#fee2e2' },
  in_review: { label: 'In Review', color: '#f59e0b', bg: '#fef3c7' },
  resolved:  { label: 'Resolved',  color: '#22c55e', bg: '#dcfce7' },
  closed:    { label: 'Closed',    color: '#6b7280', bg: '#f3f4f6' },
};

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/complaints', {
        params: { page, limit: 15, status: statusFilter === 'all' ? '' : statusFilter },
      });
      setComplaints(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const doAction = async (action: string) => {
    if (!selected) return;
    try {
      await axios.patch(`/api/admin/complaints/${selected._id}/action`, { action, notes });
      toast.success('Complaint updated');
      setSelected(null);
      setNotes('');
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
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Complaint Details</h3>
              <button onClick={() => { setSelected(null); setNotes(''); }}
                className="text-sm px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{selected.subject}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  By {selected.customer?.name} ({selected.customer?.email})
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: STATUS_CONFIG[selected.status]?.bg, color: STATUS_CONFIG[selected.status]?.color }}>
                  {STATUS_CONFIG[selected.status]?.label}
                </span>
              </div>

              <div className="p-4 rounded-lg text-sm leading-relaxed" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                {selected.description}
              </div>

              {selected.adminNotes && (
                <div className="p-3 rounded-lg text-sm" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <p className="font-semibold text-xs mb-1">Previous Admin Note:</p>
                  {selected.adminNotes}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                  Admin Notes
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  placeholder="Add your notes here..."
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.status !== 'in_review' && (
                  <button onClick={() => doAction('in_review')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: '#f59e0b' }}>
                    <Eye size={14} /> Mark In Review
                  </button>
                )}
                {selected.status !== 'resolved' && (
                  <button onClick={() => doAction('resolve')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: '#22c55e' }}>
                    <CheckCircle size={14} /> Resolve
                  </button>
                )}
                <button onClick={() => doAction('close')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: '#6b7280' }}>
                  <XCircle size={14} /> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Complaint Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{pagination.total.toLocaleString()} total complaints</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', ...Object.keys(STATUS_CONFIG)].map(s => {
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

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-5 animate-pulse" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
                <div className="h-5 rounded w-1/2 mb-2" style={{ background: 'var(--border-primary)' }} />
                <div className="h-3 rounded w-1/3" style={{ background: 'var(--border-primary)' }} />
              </div>
            ))
          ) : complaints.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--text-tertiary)' }}>
              <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
              <p>No complaints with this status</p>
            </div>
          ) : complaints.map(c => {
            const cfg = STATUS_CONFIG[c.status];
            return (
              <div key={c._id} className="rounded-xl border p-5 cursor-pointer transition-all hover:shadow-lg"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
                onClick={() => setSelected(c)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.subject}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: cfg?.bg, color: cfg?.color }}>{cfg?.label}</span>
                    </div>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{c.description}</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                      By {c.customer?.name} · {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="shrink-0 p-2 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border disabled:opacity-40" style={{ borderColor: 'var(--border-primary)' }}>
              <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Page {page} / {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border disabled:opacity-40" style={{ borderColor: 'var(--border-primary)' }}>
              <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

