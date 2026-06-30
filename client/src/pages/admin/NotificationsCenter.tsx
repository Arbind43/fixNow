import { useState } from 'react';
import axios from 'axios';
import { Send, Users, ShieldCheck, User, Megaphone } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

const TARGET_OPTIONS = [
  { key: 'all',           label: 'All Users',     icon: Users,       description: 'Send to every customer and professional' },
  { key: 'customers',     label: 'Customers Only', icon: User,        description: 'All registered customers' },
  { key: 'professionals', label: 'Professionals', icon: ShieldCheck, description: 'All verified professionals' },
  { key: 'individual',    label: 'Specific User', icon: User,        description: 'Enter a specific user ID' },
];

const NOTIFICATION_TYPES = ['system', 'booking', 'payment', 'promotion'];

export default function NotificationsCenter() {
  const [targetType, setTargetType] = useState('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('system');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ count: number; title: string } | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (targetType === 'individual' && !targetUserId.trim()) {
      toast.error('Please enter a User ID for individual targeting');
      return;
    }
    setSending(true);
    try {
      const res = await axios.post('/api/admin/notifications/send', {
        title, body, type, targetType,
        targetUserId: targetType === 'individual' ? targetUserId : undefined,
      });
      setSent({ count: parseInt(res.data.message?.match(/\d+/)?.[0] || '0'), title });
      setTitle(''); setBody(''); setTargetUserId('');
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notification Center</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Broadcast messages to platform users</p>
        </div>

        {sent && (
          <div className="rounded-xl border p-5 flex items-center gap-4"
            style={{ background: '#dcfce7', borderColor: '#86efac' }}>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
              <Megaphone size={20} />
            </div>
            <div>
              <p className="font-semibold text-green-800">Notification Sent!</p>
              <p className="text-sm text-green-700">"{sent.title}" delivered to {sent.count} users</p>
            </div>
            <button onClick={() => setSent(null)} className="ml-auto text-green-600 hover:text-green-800">✕</button>
          </div>
        )}

        <div className="rounded-xl border p-6 space-y-5"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
          {/* Target Audience */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Target Audience</label>
            <div className="grid grid-cols-2 gap-3">
              {TARGET_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setTargetType(opt.key)}
                  className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all"
                  style={{
                    background:  targetType === opt.key ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                    borderColor: targetType === opt.key ? '#6366f1' : 'var(--border-primary)',
                  }}>
                  <opt.icon size={18} style={{ color: targetType === opt.key ? '#6366f1' : 'var(--text-tertiary)', marginTop: 1 }} />
                  <div>
                    <p className="font-medium text-sm" style={{ color: targetType === opt.key ? '#6366f1' : 'var(--text-primary)' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {targetType === 'individual' && (
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>User ID</label>
              <input value={targetUserId} onChange={e => setTargetUserId(e.target.value)}
                placeholder="Enter MongoDB ObjectId of user..."
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none font-mono"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Type</label>
            <div className="flex flex-wrap gap-2">
              {NOTIFICATION_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize border transition-all"
                  style={{
                    background:  type === t ? '#6366f1' : 'var(--bg-secondary)',
                    color:       type === t ? '#fff' : 'var(--text-secondary)',
                    borderColor: type === t ? '#6366f1' : 'var(--border-primary)',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100}
              placeholder="Notification title..."
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-tertiary)' }}>{title.length}/100</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Message</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} maxLength={500}
              placeholder="Write your notification message here..."
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-tertiary)' }}>{body.length}/500</p>
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !title || !body}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {sending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
            ) : (
              <><Send size={16} /> Send Notification</>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

