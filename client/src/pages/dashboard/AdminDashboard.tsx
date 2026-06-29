import { useState, useEffect } from 'react';
import { 
  Users, Activity, DollarSign, Briefcase, ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeUsers: 0,
    activeTechnicians: 0,
    categoryData: [] as any[],
    revenueData: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get('/api/admin/metrics');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Overview</h1>
            <p className="text-[var(--text-secondary)] mt-1">Platform performance metrics</p>
          </div>
          
          <div className="relative">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">This Quarter</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" />
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">₹{metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium">Total Revenue</p>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
                <Briefcase size={24} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{metrics.totalBookings.toLocaleString()}</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium">Total Bookings</p>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{metrics.activeUsers.toLocaleString()}</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium">Active Customers</p>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
                <Activity size={24} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{metrics.activeTechnicians.toLocaleString()}</p>
              <p className="text-sm text-[var(--text-secondary)] font-medium">Verified Technicians</p>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold text-[var(--text-primary)] mb-6">Revenue Trend (Last 7 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--color-primary-500)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-1">
            <h3 className="font-bold text-[var(--text-primary)] mb-6">Bookings by Category</h3>
            <div className="h-[300px] w-full">
              {metrics.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} width={90} />
                    <Tooltip 
                      cursor={{ fill: 'var(--bg-secondary)' }}
                      contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--text-tertiary)]">
                  No data available yet
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
