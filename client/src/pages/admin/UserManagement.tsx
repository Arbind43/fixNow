import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Filter, Ban, UserCheck, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const STATUS_BADGES: Record<string, string> = {
  active:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  banned:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

function getUserStatus(u: any) {
  if (u.isBanned)    return 'banned';
  if (u.isSuspended) return 'suspended';
  return 'active';
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}
function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-xl p-6 w-full max-w-sm shadow-xl"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('customer');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [confirm, setConfirm] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users', {
        params: { page, limit: 15, search, role: roleFilter, status: statusFilter },
      });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  const handleAction = async (userId: string, action: string) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/status`, { action });
      toast.success(`User ${action}ned successfully`);
      fetchUsers();
    } catch {
      toast.error('Action failed');
    }
    setConfirm(null);
  };

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Delete failed');
    }
    setConfirm(null);
  };

  return (
    <AdminLayout>
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-sm px-3 py-1 rounded-lg"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {selectedUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedUser.name}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedUser.email}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{selectedUser.phone || 'No phone'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Role',       selectedUser.role],
                  ['Status',     getUserStatus(selectedUser)],
                  ['Verified',   selectedUser.isVerified ? 'Yes' : 'No'],
                  ['Joined',     new Date(selectedUser.createdAt).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k} className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{k}</p>
                    <p className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {pagination.total.toLocaleString()} total records
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none focus:ring-2"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', '--tw-ring-color': '#6366f1' } as any}
            />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm border outline-none"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
            <option value="">All Roles</option>
            <option value="customer">Customers</option>
            <option value="technician">Technicians</option>
            <option value="admin">Admins</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg text-sm border outline-none"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-t animate-pulse" style={{ borderColor: 'var(--border-primary)' }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded" style={{ background: 'var(--border-primary)', width: j === 0 ? '60%' : '40%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No users found</td></tr>
                ) : users.map(u => {
                  const status = getUserStatus(u);
                  return (
                    <tr key={u._id} className="border-t transition-colors"
                      style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGES[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button title="View" onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'var(--text-tertiary)' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                            <Eye size={15} />
                          </button>
                          {status !== 'banned' ? (
                            <button title="Ban" onClick={() => setConfirm({
                              title: 'Ban User',
                              message: `Ban ${u.name}? They will not be able to log in.`,
                              onConfirm: () => handleAction(u._id, 'ban'),
                            })} className="p-1.5 rounded-lg transition-colors" style={{ color: '#ef4444' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                              <Ban size={15} />
                            </button>
                          ) : (
                            <button title="Unban" onClick={() => handleAction(u._id, 'unban')}
                              className="p-1.5 rounded-lg transition-colors" style={{ color: '#22c55e' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                              <UserCheck size={15} />
                            </button>
                          )}
                          <button title="Delete" onClick={() => setConfirm({
                            title: 'Delete User',
                            message: `Permanently delete ${u.name}? This cannot be undone.`,
                            onConfirm: () => handleDelete(u._id),
                          })} className="p-1.5 rounded-lg transition-colors" style={{ color: '#ef4444' }}
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
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Page {page} of {pagination.pages} · {pagination.total} results
              </p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border disabled:opacity-40 transition-colors"
                  style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                  <ChevronLeft size={16} />
                </button>
                <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border disabled:opacity-40 transition-colors"
                  style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

