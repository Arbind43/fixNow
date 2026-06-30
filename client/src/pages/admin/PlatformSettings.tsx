import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Settings } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export default function PlatformSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/admin/settings')
      .then(res => { if (res.data.success) setSettings(res.data.data); })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (key: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--border-primary)' }} />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (!settings) return null;

  function Field({ label, name, type = 'text', unit }: { label: string; name: string; type?: string; unit?: string }) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
        <div className="relative">
          <input
            type={type}
            value={settings[name] ?? ''}
            onChange={e => handleChange(name, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)', paddingRight: unit ? '3rem' : undefined }}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{unit}</span>
          )}
        </div>
      </div>
    );
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="rounded-xl border p-6 space-y-4"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
        <h3 className="font-semibold text-sm uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{title}</h3>
        {children}
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Platform Settings</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Manage global platform configuration</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              : <><Save size={15} /> Save Changes</>
            }
          </button>
        </div>

        <Section title="Finance">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Commission Rate" name="commissionRate" type="number" unit="%" />
            <Field label="GST Rate" name="gstRate" type="number" unit="%" />
            <Field label="Cancellation Charge" name="cancellationCharge" type="number" unit="₹" />
            <Field label="Min Payout Amount" name="minPayoutAmount" type="number" unit="₹" />
          </div>
        </Section>

        <Section title="Maintenance">
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Maintenance Mode</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Users will see maintenance message when enabled</p>
            </div>
            <button
              onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ background: settings.maintenanceMode ? '#6366f1' : 'var(--border-primary)' }}>
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: settings.maintenanceMode ? 'translateX(20px)' : 'translateX(0)' }} />
            </button>
          </div>
          <Field label="Maintenance Message" name="maintenanceMessage" />
        </Section>

        <Section title="Contact & Support">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Support Email" name="supportEmail" type="email" />
            <Field label="Support Phone" name="supportPhone" />
          </div>
          <Field label="Contact Address" name="contactAddress" />
          <Field label="Website URL" name="websiteUrl" />
        </Section>

        <Section title="Social Media Links">
          {(['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'] as const).map(platform => (
            <div key={platform}>
              <label className="block text-sm font-medium mb-1.5 capitalize" style={{ color: 'var(--text-primary)' }}>{platform}</label>
              <input
                type="url"
                value={settings.socialLinks?.[platform] ?? ''}
                onChange={e => handleSocialChange(platform, e.target.value)}
                placeholder={`https://${platform}.com/yourpage`}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          ))}
        </Section>

        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {saving ? 'Saving...' : <><Save size={15} /> Save All Settings</>}
        </button>
      </div>
    </AdminLayout>
  );
}

