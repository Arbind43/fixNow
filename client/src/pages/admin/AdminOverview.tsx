import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, ShieldCheck, ClipboardList, Calendar, CheckCircle,
  XCircle, AlertTriangle, DollarSign, Star, TrendingUp,
  Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: any; label: string; value: string | number; color: string; sub?: string;
}) {
  return (
    <div className="rounded-xl p-5 flex items-start gap-4 border transition-all hover:shadow-lg"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}20`, color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-5 border animate-pulse" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl" style={{ background: 'var(--border-primary)' }} />
        <div className="flex-1">
          <div className="h-3 rounded w-20 mb-2" style={{ background: 'var(--border-primary)' }} />
          <div className="h-7 rounded w-28" style={{ background: 'var(--border-primary)' }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/metrics')
      .then(res => { if (res.data.success) setMetrics(res.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = metrics ? [
    { icon: Users,       label: 'Total Customers',       value: metrics.totalUsers.toLocaleString(),        color: '#6366f1' },
    { icon: ShieldCheck, label: 'Active Professionals',  value: metrics.totalProfessionals.toLocaleString(), color: '#8b5cf6' },
    { icon: ClipboardList,label:'Pending Verifications', value: metrics.pendingVerifications.toLocaleString(), color: '#f59e0b', sub: 'Awaiting review' },
    { icon: DollarSign,  label: 'Total Revenue',         value: `₹${metrics.totalRevenue.toLocaleString()}`, color: '#10b981' },
    { icon: Calendar,    label: 'Total Bookings',        value: metrics.totalBookings.toLocaleString(),       color: '#3b82f6' },
    { icon: CheckCircle, label: 'Completed',             value: metrics.completedBookings.toLocaleString(),  color: '#22c55e' },
    { icon: XCircle,     label: 'Cancelled',             value: metrics.cancelledBookings.toLocaleString(),  color: '#ef4444' },
    { icon: AlertTriangle,label:'Open Complaints',       value: metrics.openComplaints.toLocaleString(),     color: '#f97316' },
    { icon: Star,        label: 'Avg. Rating',           value: metrics.avgRating || '—',                    color: '#eab308' },
    { icon: Activity,    label: 'Active Bookings',       value: metrics.activeBookings.toLocaleString(),     color: '#06b6d4' },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard Overview</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Platform performance — real-time metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s) => <StatCard key={s.label} {...s} />)
          }
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartCard title="Revenue Trend (Last 30 Days)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.revenueData || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} interval={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} tickFormatter={v => `₹${v}`} width={50} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [`₹${v}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="User Growth (Last 30 Days)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.userGrowthData || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} interval={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Booking Status">
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics?.bookingStatusData || []}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    dataKey="value" paddingAngle={3}
                  >
                    {(metrics?.bookingStatusData || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Category Distribution */}
        <ChartCard title="Bookings by Service Category">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.categoryData || []} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} width={120} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </AdminLayout>
  );
}

