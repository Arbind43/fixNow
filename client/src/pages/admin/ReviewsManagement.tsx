import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Star, EyeOff, Eye, Trash2, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/reviews', {
        params: { page, limit: 15, filter: filter === 'all' ? '' : filter },
      });
      setReviews(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [filter]);

  const doAction = async (id: string, action: string) => {
    if (action === 'delete' && !window.confirm('Delete this review permanently?')) return;
    try {
      await axios.patch(`/api/admin/reviews/${id}/action`, { action });
      toast.success(action === 'hide' ? 'Review hidden' : action === 'show' ? 'Review visible' : 'Review deleted');
      fetch();
    } catch { toast.error('Action failed'); }
  };

  const FILTERS = [
    { key: 'all',      label: 'All Reviews' },
    { key: 'visible',  label: 'Visible' },
    { key: 'hidden',   label: 'Hidden' },
    { key: 'reported', label: 'Reported' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reviews Moderation</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{pagination.total.toLocaleString()} reviews</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
              style={{
                background:  filter === f.key ? '#6366f1' : 'var(--bg-elevated)',
                color:       filter === f.key ? '#fff'    : 'var(--text-secondary)',
                borderColor: filter === f.key ? '#6366f1' : 'var(--border-primary)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-5 animate-pulse" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full" style={{ background: 'var(--border-primary)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-1/3" style={{ background: 'var(--border-primary)' }} />
                    <div className="h-3 rounded w-2/3" style={{ background: 'var(--border-primary)' }} />
                  </div>
                </div>
              </div>
            ))
          ) : reviews.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--text-tertiary)' }}>
              <Star size={40} className="mx-auto mb-3 opacity-40" />
              <p>No reviews found</p>
            </div>
          ) : reviews.map(r => (
            <div key={r._id} className="rounded-xl border p-5"
              style={{
                background: r.isHidden ? 'rgba(239,68,68,0.05)' : 'var(--bg-elevated)',
                borderColor: r.isHidden ? 'rgba(239,68,68,0.2)' : 'var(--border-primary)',
                opacity: r.isHidden ? 0.8 : 1,
              }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {r.customer?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.customer?.name}</span>
                      <StarRating rating={r.rating} />
                      {r.isHidden && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Hidden</span>
                      )}
                      {r.isReported && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600 flex items-center gap-1">
                          <Flag size={10} /> Reported
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.comment || <em>No comment</em>}</p>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                      For: {r.technician?.user?.name || '—'} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {r.isHidden ? (
                    <button title="Show review" onClick={() => doAction(r._id, 'show')}
                      className="p-1.5 rounded-lg" style={{ color: '#22c55e' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <Eye size={15} />
                    </button>
                  ) : (
                    <button title="Hide review" onClick={() => doAction(r._id, 'hide')}
                      className="p-1.5 rounded-lg" style={{ color: '#f59e0b' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.1)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <EyeOff size={15} />
                    </button>
                  )}
                  <button title="Delete review" onClick={() => doAction(r._id, 'delete')}
                    className="p-1.5 rounded-lg" style={{ color: '#ef4444' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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

