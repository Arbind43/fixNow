import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, CheckCircle, XCircle, FileText, Eye, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fef3c7' },
  verified:  { label: 'Verified',  color: '#22c55e', bg: '#dcfce7' },
  rejected:  { label: 'Rejected',  color: '#ef4444', bg: '#fee2e2' },
  suspended: { label: 'Suspended', color: '#6366f1', bg: '#e0e7ff' },
};

function DocLink({ url, label }: { url?: string; label: string }) {
  if (!url) return <span className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>Not uploaded</span>;
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
  
  return (
    <a href={fullUrl} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
      style={{ background: '#e0e7ff', color: '#6366f1' }}>
      <FileText size={12} /> {label}
    </a>
  );
}

export default function ProfessionalVerification() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected] = useState<any>(null);
  const [noteInput, setNoteInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTechs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/technicians', {
        params: { page, limit: 12, search, status: statusFilter },
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

  const doAction = async (action: string, reason?: string, notes?: string) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await axios.patch(`/api/admin/technicians/${selected._id}/verify`, { action, reason, notes });
      const labels: Record<string, string> = {
        approve: 'Approved', reject: 'Rejected', suspend: 'Suspended',
        reactivate: 'Reactivated', request_docs: 'Document request sent', add_note: 'Note saved',
      };
      toast.success(labels[action] || 'Done');
      setSelected(null);
      fetchTechs();
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = { pending: 0, verified: 0, rejected: 0, suspended: 0 };

  return (
    <AdminLayout>
      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full sm:w-[520px] h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto sm:rounded-l-2xl shadow-2xl"
            style={{ background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border-primary)' }}>
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Professional Profile</h3>
              <button onClick={() => { setSelected(null); setNoteInput(''); setReasonInput(''); }}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                Close ✕
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Profile */}
              <div className="flex items-center gap-4">
                {selected.documents?.profilePhoto ? (
                  <img src={selected.documents.profilePhoto.startsWith('/') ? `${import.meta.env.VITE_API_URL || ''}${selected.documents.profilePhoto}` : selected.documents.profilePhoto} alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2"
                    style={{ borderColor: 'var(--border-primary)' }} />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {selected.user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{selected.user?.name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: STATUS_CONFIG[selected.verificationStatus]?.bg, color: STATUS_CONFIG[selected.verificationStatus]?.color }}>
                    {STATUS_CONFIG[selected.verificationStatus]?.label}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Experience', `${selected.experienceYears || 0} yrs`],
                  ['Rating',     selected.rating ? `${selected.rating} ⭐` : '—'],
                  ['City',       selected.address?.city || '—'],
                  ['Joined',     new Date(selected.createdAt).toLocaleDateString()],
                  ['Hourly Rate',selected.hourlyRate ? `₹${selected.hourlyRate}` : '—'],
                  ['Available',  selected.isAvailable ? 'Yes' : 'No'],
                ].map(([k, v]) => (
                  <div key={k} className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{k}</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Bio */}
              {selected.bio && (
                <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  {selected.bio}
                </div>
              )}

              {/* Documents */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  Uploaded Documents
                </p>
                <div className="flex flex-wrap gap-2">
                  <DocLink url={selected.documents?.aadhaarUrl}    label="Aadhaar" />
                  <DocLink url={selected.documents?.panUrl}        label="PAN Card" />
                  <DocLink url={selected.documents?.licenseUrl}    label="License" />
                  <DocLink url={selected.documents?.certificateUrl} label="Certificate" />
                  {selected.documents?.portfolioUrls?.map((url: string, i: number) => (
                    <DocLink key={i} url={url} label={`Portfolio ${i + 1}`} />
                  ))}
                </div>
              </div>

              {/* Rejection Reason / Notes */}
              {selected.rejectionReason && (
                <div className="p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                  <p className="font-semibold text-xs mb-1">Rejection Reason:</p>
                  {selected.rejectionReason}
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Actions</p>

                {/* Note */}
                <div className="flex gap-2">
                  <input value={noteInput} onChange={e => setNoteInput(e.target.value)}
                    placeholder="Add verification note..." className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                  <button onClick={() => doAction('add_note', undefined, noteInput)} disabled={!noteInput || actionLoading}
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    style={{ background: '#e0e7ff', color: '#6366f1' }}>
                    Save
                  </button>
                </div>

                {/* Rejection Reason */}
                {selected.verificationStatus === 'pending' && (
                  <input value={reasonInput} onChange={e => setReasonInput(e.target.value)}
                    placeholder="Rejection reason (required for reject)..."
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                )}

                <div className="flex flex-wrap gap-2">
                  {selected.verificationStatus === 'pending' && (
                    <>
                      <button onClick={() => doAction('approve')} disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                        style={{ background: '#22c55e' }}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button onClick={() => doAction('reject', reasonInput)} disabled={actionLoading || !reasonInput}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                        style={{ background: '#ef4444' }}>
                        <XCircle size={14} /> Reject
                      </button>
                      <button onClick={() => doAction('request_docs')} disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                        style={{ background: '#f59e0b' }}>
                        <FileText size={14} /> Request Docs
                      </button>
                    </>
                  )}
                  {selected.verificationStatus === 'verified' && (
                    <button onClick={() => doAction('suspend', 'Admin suspension')} disabled={actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                      style={{ background: '#f97316' }}>
                      <AlertCircle size={14} /> Suspend
                    </button>
                  )}
                  {(selected.verificationStatus === 'suspended' || selected.verificationStatus === 'rejected') && (
                    <button onClick={() => doAction('reactivate')} disabled={actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                      style={{ background: '#6366f1' }}>
                      <CheckCircle size={14} /> Reactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Professional Verification</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Review and verify professional registrations</p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
              style={{
                background:   statusFilter === key ? cfg.color     : 'var(--bg-elevated)',
                color:        statusFilter === key ? '#fff'        : 'var(--text-secondary)',
                borderColor:  statusFilter === key ? cfg.color     : 'var(--border-primary)',
              }}>
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search professionals..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl p-5 border animate-pulse" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full" style={{ background: 'var(--border-primary)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-3/4" style={{ background: 'var(--border-primary)' }} />
                    <div className="h-3 rounded w-1/2" style={{ background: 'var(--border-primary)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-tertiary)' }}>
            <Clock size={40} className="mx-auto mb-3 opacity-40" />
            <p>No professionals with status "{statusFilter}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.map(t => {
              const cfg = STATUS_CONFIG[t.verificationStatus];
              return (
                <div key={t._id} className="rounded-xl border p-5 transition-all hover:shadow-lg cursor-pointer"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}
                  onClick={() => setSelected(t)}>
                  <div className="flex items-start gap-3 mb-4">
                    {t.documents?.profilePhoto ? (
                      <img src={t.documents.profilePhoto.startsWith('/') ? `${import.meta.env.VITE_API_URL || ''}${t.documents.profilePhoto}` : t.documents.profilePhoto} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        {t.user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t.user?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{t.user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: cfg?.bg, color: cfg?.color }}>
                        {cfg?.label}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>City: </span>
                      <span style={{ color: 'var(--text-primary)' }}>{t.address?.city || '—'}</span>
                    </div>
                    <div className="p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Exp: </span>
                      <span style={{ color: 'var(--text-primary)' }}>{t.experienceYears || 0} yrs</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {t.documents?.aadhaarUrl && <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#dcfce7', color: '#166534' }}>Aadhaar ✓</span>}
                    {t.documents?.panUrl && <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#dcfce7', color: '#166534' }}>PAN ✓</span>}
                    {!t.documents?.aadhaarUrl && <span className="px-2 py-0.5 rounded text-xs" style={{ background: '#fee2e2', color: '#991b1b' }}>No Aadhaar</span>}
                  </div>
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                    <Eye size={12} /> Click to review
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border disabled:opacity-40"
              style={{ borderColor: 'var(--border-primary)' }}>
              <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Page {page} / {pagination.pages}
            </span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border disabled:opacity-40"
              style={{ borderColor: 'var(--border-primary)' }}>
              <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

