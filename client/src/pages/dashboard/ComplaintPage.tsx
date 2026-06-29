import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { 
  AlertTriangle, CheckCircle, Clock, Loader2, MessageSquarePlus, 
  ChevronDown, ChevronUp, CreditCard, Shield, User, HelpCircle, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  open:      { label: 'Open',      color: 'text-red-400 bg-red-400/10 border-red-400/20',      icon: <AlertTriangle size={12} /> },
  in_review: { label: 'In Review', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: <Clock size={12} /> },
  resolved:  { label: 'Resolved',  color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle size={12} /> },
  closed:    { label: 'Closed',    color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',    icon: <CheckCircle size={12} /> },
};

const FAQ_TOPICS = [
  { id: 'payment', title: 'Payment & Refunds', icon: <CreditCard size={24} className="text-blue-500" /> },
  { id: 'quality', title: 'Service Quality', icon: <HelpCircle size={24} className="text-emerald-500" /> },
  { id: 'safety', title: 'Safety Concerns', icon: <Shield size={24} className="text-red-500" /> },
  { id: 'account', title: 'Account Issues', icon: <User size={24} className="text-amber-500" /> },
];

export default function ComplaintPage() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [complaintsRes, bookingsRes] = await Promise.all([
        axios.get('/api/complaints/me').catch(() => ({ data: { data: [] } })),
        axios.get('/api/bookings/me').catch(() => ({ data: { data: [] } }))
      ]);
      setComplaints(complaintsRes.data?.data || []);
      // Only keep the most recent 3 bookings for support
      setBookings((bookingsRes.data?.data || []).slice(0, 3));
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openFormForTopic = (title: string) => {
    setSelectedBooking(null);
    setSubject(`Issue regarding: ${title}`);
    setDescription('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openFormForBooking = (booking: any) => {
    setSelectedBooking(booking);
    setSubject(`Issue with Booking: ${booking.service?.name || 'Service'}`);
    setDescription('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        subject,
        description,
        booking: selectedBooking ? selectedBooking._id : undefined
      };
      
      await axios.post('/api/complaints', payload);
      showToast.success('Complaint submitted! We will review it within 24 hours.');
      
      // Reset form
      setSubject('');
      setDescription('');
      setSelectedBooking(null);
      setShowForm(false);
      
      // Refresh list
      fetchData();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--bg-secondary)] p-8 rounded-3xl border border-[var(--border-primary)] shadow-sm">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">Help & Support</h1>
            <p className="text-[var(--text-secondary)] mt-2 text-lg">How can we help you today?</p>
          </div>
          <Button onClick={() => openFormForTopic('General Inquiry')} className="flex items-center gap-2 shrink-0 rounded-full px-6 py-6 text-md shadow-lg shadow-[var(--color-primary-500)]/20 hover:scale-105 transition-transform">
            <MessageSquarePlus size={20} />
            Write to us
          </Button>
        </div>

        {/* Complaint Form Modal / Slide down */}
        {showForm && (
          <Card className="p-6 md:p-8 border-2 border-[var(--color-primary-500)] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-primary-600)]"></div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              {selectedBooking ? 'Report an issue with your booking' : 'File a New Complaint'}
            </h2>
            
            {selectedBooking && (
              <div className="mb-6 bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-primary)] flex justify-between items-center">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Selected Booking</p>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedBooking.service?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--text-secondary)]">{format(new Date(selectedBooking.createdAt), 'MMM dd, yyyy')}</p>
                  <p className="font-semibold text-[var(--color-primary-500)]">₹{selectedBooking.totalAmount}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent min-h-[140px] resize-none transition-colors"
                  placeholder="Describe the problem in detail. Please provide any relevant information..."
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1 py-3 text-md font-semibold">
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="py-3">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* FAQ Topics Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Common Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FAQ_TOPICS.map((topic) => (
              <button 
                key={topic.id}
                onClick={() => openFormForTopic(topic.title)}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:border-[var(--color-primary-500)] hover:shadow-md transition-all group"
              >
                <div className="p-4 rounded-full bg-[var(--bg-secondary)] group-hover:scale-110 transition-transform duration-300">
                  {topic.icon}
                </div>
                <span className="font-semibold text-[var(--text-primary)] text-sm">{topic.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Bookings Section */}
        {bookings.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Issues with Recent Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl p-5 hover:border-[var(--color-primary-400)] transition-colors flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold px-2 py-1 bg-[var(--bg-secondary)] rounded-md text-[var(--text-secondary)]">
                        {format(new Date(booking.scheduledDate), 'MMM dd')}
                      </span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">₹{booking.totalAmount}</span>
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">{booking.service?.name}</h3>
                    <p className="text-sm text-[var(--text-tertiary)] mb-4 capitalize">Status: {booking.status.replace('_', ' ')}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between items-center text-xs group"
                    onClick={() => openFormForBooking(booking)}
                  >
                    Get Help
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tickets History List */}
        <div className="space-y-4 pt-8 border-t border-[var(--border-primary)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            Ticket History
            <span className="text-sm font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-500)]/10 px-3 py-1 rounded-full">
              {complaints.length} tickets
            </span>
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-[var(--color-primary-500)]" />
            </div>
          ) : complaints.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2">
              <CheckCircle size={48} className="mx-auto mb-4 text-[var(--text-tertiary)]" />
              <h3 className="font-semibold text-lg text-[var(--text-primary)]">No support tickets</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm mx-auto">
                You haven't raised any complaints or support tickets yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.open;
                const isExpanded = expandedId === c._id;
                return (
                  <Card key={c._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : c._id)}
                      className="w-full p-5 md:p-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold tracking-wide uppercase ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <span className="text-sm font-medium text-[var(--text-tertiary)]">
                            {format(new Date(c.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-[var(--text-primary)] truncate">{c.subject}</p>
                        {c.booking && (
                          <p className="text-sm text-[var(--color-primary-500)] mt-1 font-medium">
                            Linked to Booking: {c.booking.service?.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-auto mt-2 md:mt-0">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-[var(--text-secondary)]" />
                        ) : (
                          <ChevronDown size={20} className="text-[var(--text-secondary)]" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 md:px-6 pb-6 space-y-6 border-t border-[var(--border-primary)] pt-5 bg-[var(--bg-secondary)]/50">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Your Message</p>
                          <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{c.description}</p>
                        </div>
                        {c.adminNotes && (
                          <div className="bg-[var(--color-primary-500)]/10 border-l-4 border-[var(--color-primary-500)] rounded-r-xl p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-600)] mb-2">Support Response</p>
                            <p className="text-[var(--text-primary)] leading-relaxed">{c.adminNotes}</p>
                          </div>
                        )}
                        {!c.adminNotes && c.status !== 'closed' && (
                          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-primary)] inline-block">
                            <Clock size={16} />
                            Our support team will review this shortly.
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
