import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Eye, Trash2, UserX, UserCheck, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fef3c7' },
  verified:  { label: 'Active',    color: '#22c55e', bg: '#dcfce7' },
  rejected:  { label: 'Rejected',  color: '#ef4444', bg: '#fee2e2' },
  suspended: { label: 'Suspended', color: '#6366f1', bg: '#e0e7ff' },
};

export default function ProfessionalManagement() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected] = useState<any>(null);

  const fetchTechs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/technicians', {
        params: { page, limit: 15, search, status: statusFilter === 'all' ? '' : statusFilter },
      });
      setTechnicians(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchTechs(); }, [fetchTechs]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const doAction = async (id: string, action: string, reason?: string) => {
    try {
      await axios.patch(`/api/admin/technicians/${id}/verify`, { action, reason });
      toast.success('Action completed');
      setSelected(null);
      fetchTechs();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this professional? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/technicians/${id}`);
      toast.success('Professional deleted');
      fetchTechs();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminLayout>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Professional Details</h3>
              <button onClick={() => setSelected(null)} className="text-sm px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {selected.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{selected.user?.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.user?.email}</p>
                  </div>
                </div>
                {[
                  ['Rating', `${selected.rating || 0} ⭐ (${selected.reviewCount || 0} reviews)`],
                  ['Experience', `${selected.experienceYears || 0} years`],
                  ['Hourly Rate', `₹${selected.hourlyRate || 0}`],
                  ['City', selected.address?.city || '—'],
                  ['Status', STATUS_CONFIG[selected.verificationStatus]?.label || selected.verificationStatus],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{k}</p>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Actions</p>
                {selected.verificationStatus === 'verified' && (
                  <button onClick={() => doAction(selected._id, 'suspend', 'Admin action')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: '#f97316' }}>
                    <UserX size={14} /> Suspend
                  </button>
                )}
                {(selected.verificationStatus === 'suspended' || selected.verificationStatus === 'rejected') && (
                  <button onClick={() => doAction(selected._id, 'reactivate')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: '#22c55e' }}>
                    <UserCheck size={14} /> Reactivate
                  </button>
                )}
                <button onClick={() => handleDelete(selected._id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: '#ef4444' }}>
                  <Trash2 size={14} /> Delete Professional
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Professional Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{pagination.total.toLocaleString()} professionals</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search professionals..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm border outline-none"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Professional', 'Status', 'Rating', 'Experience', 'City', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide"
                    style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t animate-pulse" style={{ borderColor: 'var(--border-primary)' }}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 rounded" style={{ background: 'var(--border-primary)', width: '60%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : technicians.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-sm" style={{ color: 'var(--text-tertiary)' }}>No professionals found</td></tr>
              ) : technicians.map(t => {
                const cfg = STATUS_CONFIG[t.verificationStatus];
                return (
                  <tr key={t._id} className="border-t transition-colors"
                    style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                          {t.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t.user?.name || 'N/A'}</p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: cfg?.bg, color: cfg?.color }}>{cfg?.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-primary)' }}>
                        <Star size={11} className="text-yellow-400" /> {t.rating || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{t.experienceYears || 0}y</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{t.address?.city || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title="View" onClick={() => setSelected(t)}
                          className="p-1.5 rounded-lg" style={{ color: 'var(--text-tertiary)' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <Eye size={15} />
                        </button>
                        <button title="Delete" onClick={() => handleDelete(t._id)}
                          className="p-1.5 rounded-lg" style={{ color: '#ef4444' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

