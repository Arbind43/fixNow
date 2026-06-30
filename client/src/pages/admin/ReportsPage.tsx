import { useState } from 'react';
import axios from 'axios';
import { Download, BarChart3, Calendar } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { key: 'revenue',       label: 'Revenue Report',        icon: '💰', desc: 'Daily revenue aggregated by date' },
  { key: 'bookings',      label: 'Bookings Report',       icon: '📅', desc: 'All bookings with customer & service info' },
  { key: 'users',         label: 'User Report',           icon: '👥', desc: 'Registered customers in date range' },
  { key: 'professionals', label: 'Professionals Report',  icon: '🔧', desc: 'Professional registrations & details' },
  { key: 'complaints',    label: 'Complaints Report',     icon: '⚠️',  desc: 'Complaint tickets in date range' },
  { key: 'payments',      label: 'Payments Report',       icon: '💳', desc: 'All payment transactions' },
];

function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) { toast.error('No data to export'); return; }
  
  // Flatten nested objects for CSV
  const flatten = (obj: any, prefix = ''): Record<string, any> => {
    return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
      const val = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        Object.assign(acc, flatten(val, newKey));
      } else {
        acc[newKey] = Array.isArray(val) ? val.join(', ') : val;
      }
      return acc;
    }, {});
  };

  const flat = data.map(d => flatten(d));
  const headers = [...new Set(flat.flatMap(r => Object.keys(r)))];
  const csv = [
    headers.join(','),
    ...flat.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(data: any[], filename: string) {
  if (!data || data.length === 0) { toast.error('No data to export'); return; }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('revenue');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [lastFetched, setLastFetched] = useState('');

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/reports', {
        params: { type: reportType, startDate, endDate },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
      setReportData(data);
      setLastFetched(reportType);
      toast.success(`Report generated — ${data.length} records`);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const label = REPORT_TYPES.find(r => r.key === reportType)?.label || 'Report';

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Generate and export platform data reports</p>
        </div>

        <div className="rounded-xl border p-6 space-y-5"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
          {/* Report Type */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Report Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {REPORT_TYPES.map(rt => (
                <button key={rt.key} onClick={() => setReportType(rt.key)}
                  className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all"
                  style={{
                    background:  reportType === rt.key ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                    borderColor: reportType === rt.key ? '#6366f1' : 'var(--border-primary)',
                  }}>
                  <span className="text-2xl leading-none">{rt.icon}</span>
                  <div>
                    <p className="font-medium text-sm" style={{ color: reportType === rt.key ? '#6366f1' : 'var(--text-primary)' }}>
                      {rt.label}
                    </p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-tertiary)' }}>{rt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <Calendar size={14} className="inline mr-1" />Start Date
              </label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <Calendar size={14} className="inline mr-1" />End Date
              </label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <button onClick={generateReport} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              : <><BarChart3 size={16} /> Generate Report</>
            }
          </button>
        </div>

        {/* Results */}
        {reportData !== null && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {REPORT_TYPES.find(r => r.key === lastFetched)?.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {reportData.length} records · {startDate} to {endDate}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadCSV(reportData, `${lastFetched}_report_${startDate}.csv`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: '#dcfce7', color: '#166534' }}>
                  <Download size={14} /> CSV
                </button>
                <button
                  onClick={() => downloadJSON(reportData, `${lastFetched}_report_${startDate}.json`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ background: '#dbeafe', color: '#1e40af' }}>
                  <Download size={14} /> JSON
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ background: 'var(--bg-secondary)' }}>
                  <tr>
                    {reportData.length > 0 && Object.keys(reportData[0]).slice(0, 8).map(k => (
                      <th key={k} className="px-4 py-2 text-left font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text-tertiary)' }}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 100).map((row, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-elevated)' }}>
                      {Object.values(row).slice(0, 8).map((val: any, j) => (
                        <td key={j} className="px-4 py-2 max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>
                          {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.length > 100 && (
                <p className="px-4 py-3 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                  Showing first 100 of {reportData.length} records. Download for full data.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

