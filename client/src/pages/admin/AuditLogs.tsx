import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const ACTION_COLORS: Record<string, string> = {
  APPROVE_TECHNICIAN: '#22c55e',
  REJECT_TECHNICIAN:  '#ef4444',
  BAN_USER:           '#ef4444',
  UNBAN_USER:         '#22c55e',
  SUSPEND_USER:       '#f59e0b',
  UNSUSPEND_USER:     '#22c55e',
  DELETE_USER:        '#ef4444',
  DELETE_TECHNICIAN:  '#ef4444',
  CANCEL_BOOKING:     '#ef4444',
  COMPLETE_BOOKING:   '#22c55e',
  ASSIGN_BOOKING:     '#3b82f6',
  RESOLVE_COMPLAINT:  '#22c55e',
  CLOSE_COMPLAINT:    '#6b7280',
  HIDE_REVIEW:        '#f59e0b',
  DELETE_REVIEW:      '#ef4444',
  UPDATE_SETTINGS:    '#6366f1',
  SEND_NOTIFICATION:  '#8b5cf6',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionFilter, setActionFilter] = useState('all');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/audit-logs', {
        params: { page, limit: 25, action: actionFilter === 'all' ? '' : actionFilter },
      });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { setPage(1); }, [actionFilter]);

  const QUICK_FILTERS = [
    { key: 'all',               label: 'All' },
    { key: 'APPROVE_TECHNICIAN', label: 'Approvals' },
    { key: 'BAN_USER',           label: 'Bans' },
    { key: 'DELETE_USER',        label: 'Deletions' },
    { key: 'UPDATE_SETTINGS',    label: 'Settings' },
    { key: 'SEND_NOTIFICATION',  label: 'Notifications' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Audit Logs</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Complete record of admin actions · {pagination.total.toLocaleString()} entries
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map(f => (
            <button key={f.key} onClick={() => setActionFilter(f.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
              style={{
                background:  actionFilter === f.key ? '#6366f1' : 'var(--bg-elevated)',
                color:       actionFilter === f.key ? '#fff'    : 'var(--text-secondary)',
                borderColor: actionFilter === f.key ? '#6366f1' : 'var(--border-primary)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Timestamp', 'Admin', 'Action', 'Target', 'Details', 'IP'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i} className="border-t animate-pulse" style={{ borderColor: 'var(--border-primary)' }}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-3 rounded" style={{ background: 'var(--border-primary)', width: '70%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20" style={{ color: 'var(--text-tertiary)' }}>
                      <History size={40} className="mx-auto mb-3 opacity-40" />
                      <p>No audit logs found</p>
                    </td>
                  </tr>
                ) : logs.map(log => {
                  const color = ACTION_COLORS[log.action] || '#6366f1';
                  return (
                    <tr key={log._id} className="border-t transition-colors"
                      style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {log.adminName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                          style={{ background: `${color}20`, color }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {log.targetType && <span className="opacity-60">{log.targetType}: </span>}
                        {log.targetId ? <span className="font-mono">{String(log.targetId).slice(-8)}</span> : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}
                        title={log.details}>
                        {log.details || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                        {log.ipAddress || '—'}
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

