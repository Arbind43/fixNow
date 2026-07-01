import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Badge, Skeleton, Avatar } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import ReviewModal from '../../components/ui/ReviewModal';
import {
  Calendar as CalendarIcon, MapPin, Clock, Search,
  CheckCircle2, XCircle, AlertCircle, Navigation,
  Plus, ArrowRight, Zap, X, Star, FileText
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; class: string; dot: string }> = {
  completed:   { label: 'Completed',   class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  cancelled:   { label: 'Cancelled',   class: 'bg-red-500/15 text-red-400 border-red-500/20',            dot: 'bg-red-400'     },
  in_progress: { label: 'In Progress', class: 'bg-blue-500/15 text-blue-400 border-blue-500/20',         dot: 'bg-blue-400'    },
  accepted:    { label: 'Confirmed',   class: 'bg-amber-500/15 text-amber-400 border-amber-500/20',      dot: 'bg-amber-400'   },
  pending:     { label: 'Pending',     class: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',         dot: 'bg-zinc-400'    },
};

const FILTERS = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ booking: any; refundPct: number } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [reviewedIds, setReviewedIds]     = useState<Set<string>>(new Set());

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/me');
      setBookings(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  // Compute refund percentage for the cancellation modal
  const computeRefundPct = (scheduledDate: string): number => {
    const hoursUntil = (new Date(scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil > 24) return 100;
    if (hoursUntil >= 2) return 50;
    return 0;
  };

  const openCancelModal = (booking: any) => {
    const pct = computeRefundPct(booking.scheduledDate);
    setCancelModal({ booking, refundPct: pct });
    setCancelReason('');
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    const bookingId = cancelModal.booking._id;
    setCancellingId(bookingId);
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status: 'cancelled', reason: cancelReason || 'Customer cancelled' });
      const refundMsg = cancelModal.booking.paymentStatus === 'completed'
        ? (cancelModal.refundPct === 100 ? ' Full refund will be processed.' : cancelModal.refundPct === 50 ? ` 50% refund (₹${Math.round(cancelModal.booking.totalAmount * 0.5)}) will be processed.` : ' No refund applicable.')
        : '';
      showToast.success(`Booking cancelled.${refundMsg}`);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled', refundAmount: Math.round(cancelModal.booking.totalAmount * cancelModal.refundPct / 100) } : b));
      setCancelModal(null);
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  // After fetching bookings, check which completed ones already have reviews
  useEffect(() => {
    const completedIds = bookings.filter(b => b.status === 'completed').map(b => b._id);
    if (completedIds.length === 0) return;
    Promise.all(completedIds.map(id =>
      axios.get(`/api/reviews/booking/${id}`).then(r => r.data.data ? id : null).catch(() => null)
    )).then(results => {
      const reviewed = new Set(results.filter(Boolean) as string[]);
      setReviewedIds(reviewed);
    });
  }, [bookings]);

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const StatusPill = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cfg.class}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  return (
    <>
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-2 sm:px-0">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">My Bookings</h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">Manage and track all your service requests in one place</p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus size={16} />
            Book a Service
          </Link>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total',       value: bookings.length,                                           color: 'text-white'          },
            { label: 'Active',      value: bookings.filter(b => b.status === 'accepted').length,       color: 'text-amber-400'      },
            { label: 'Completed',   value: bookings.filter(b => b.status === 'completed').length,      color: 'text-emerald-400'    },
            { label: 'Pending',     value: bookings.filter(b => b.status === 'pending').length,        color: 'text-zinc-400'       },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-center">
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 hide-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                filter === f
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-amber-500/40 hover:text-[var(--text-primary)]'
              }`}
            >
              {f.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl bg-[var(--bg-elevated)]" />
            ))
          ) : filteredBookings.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredBookings.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  className="group relative bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl overflow-hidden hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300"
                >
                  {/* Top accent */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${STATUS_CONFIG[booking.status]?.dot.replace('bg-', 'bg-') ?? 'bg-zinc-500'} opacity-60`} />

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                      <div className="flex items-center gap-4">
                        {/* Service Icon */}
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <Zap size={22} className="text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">
                            {booking.service?.name}
                          </h3>
                          <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                            #{booking._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-[var(--text-primary)]">₹{(booking.totalAmount || 0).toLocaleString()}</p>
                          <p className={`text-xs capitalize font-medium ${
                            booking.paymentStatus === 'refunded' ? 'text-blue-400'
                            : booking.paymentStatus === 'completed' ? 'text-emerald-500'
                            : 'text-zinc-400'
                          }`}>
                            {booking.paymentStatus === 'refunded'
                              ? `↩ Refund: ₹${(booking.refundAmount || 0).toLocaleString()}`
                              : booking.paymentStatus === 'completed' ? '✓ Paid'
                              : 'Payment Pending'}
                          </p>
                        </div>
                        <StatusPill status={booking.status} />
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[var(--bg-secondary)] rounded-xl mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                          <Clock size={14} className="text-[var(--text-tertiary)]" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-tertiary)]">Scheduled</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {format(new Date(booking.scheduledDate), 'EEE, MMM d')} · {format(new Date(booking.scheduledDate), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-[var(--text-tertiary)]" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-tertiary)]">Location</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[200px]">
                            {booking.address?.street || 'N/A'}, {booking.address?.city || ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Technician + Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Avatar src={booking.technician?.user?.avatar} name={booking.technician?.user?.name} size="md" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{booking.technician?.user?.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">Assigned Technician</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && booking.technician && (
                          <Link
                            to={`/dashboard/track/${booking._id}`}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-500/20"
                          >
                            <Navigation size={14} />
                            Track Live
                          </Link>
                        )}
                        {/* Review and Invoice buttons for completed bookings */}
                        {booking.status === 'completed' && (
                          <>
                            {booking.paymentStatus === 'completed' && (
                              <Link
                                to={`/dashboard/invoices/${booking._id}`}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/30 text-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)]/20 rounded-xl text-sm font-semibold transition-all"
                              >
                                <FileText size={14} /> View Invoice
                              </Link>
                            )}
                            {reviewedIds.has(booking._id) ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold">
                                <Star size={13} className="fill-emerald-500" /> Reviewed
                              </span>
                            ) : (
                              <button
                                onClick={() => setReviewBooking(booking)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 rounded-xl text-sm font-semibold transition-all"
                              >
                                <Star size={14} /> Rate & Review
                              </button>
                            )}
                          </>
                        )}
                        {(booking.status === 'pending' || booking.status === 'accepted') && (
                          <button
                            disabled={cancellingId === booking._id}
                            onClick={() => openCancelModal(booking)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-semibold transition-all"
                          >
                            {cancellingId === booking._id ? (
                              <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X size={14} />
                            )}
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl"
            >
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-[var(--text-tertiary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No bookings found</h3>
              <p className="text-[var(--text-secondary)] mb-6 text-sm max-w-xs mx-auto">
                You haven't made any {filter !== 'all' ? `"${filter}"` : ''} bookings yet.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                Explore Services
                <ArrowRight size={15} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>

    {/* Review Modal — rendered outside layout but inside fragment */}
    {reviewBooking && (
      <ReviewModal
        booking={reviewBooking}
        onClose={() => setReviewBooking(null)}
        onSubmitted={() => {
          setReviewedIds(prev => new Set([...prev, reviewBooking._id]));
          setReviewBooking(null);
        }}
      />
    )}

    {/* Cancellation Policy Modal */}
    {cancelModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Cancel Booking?</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Service: <strong>{cancelModal.booking.service?.name}</strong>
          </p>

          {cancelModal.booking.paymentStatus === 'completed' && (
            <div className={`p-3 rounded-xl mb-4 text-sm font-semibold ${
              cancelModal.refundPct === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : cancelModal.refundPct === 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {cancelModal.refundPct === 100 && `✅ You'll get a full refund of ₹${cancelModal.booking.totalAmount}`}
              {cancelModal.refundPct === 50  && `⚠️ You'll get a 50% refund of ₹${Math.round(cancelModal.booking.totalAmount * 0.5)}`}
              {cancelModal.refundPct === 0   && '❌ No refund (cancellation < 2 hours before job)'}
            </div>
          )}

          <div className="mb-5 p-3 text-xs bg-[var(--bg-secondary)] rounded-xl space-y-1 text-[var(--text-tertiary)]">
            <p className="font-semibold text-[var(--text-secondary)] mb-1">📋 Refund Policy</p>
            <p>• Cancel &gt;24 hrs → <span className="text-emerald-400 font-medium">100% refund</span></p>
            <p>• Cancel 2–24 hrs → <span className="text-amber-400 font-medium">50% refund</span></p>
            <p>• Cancel &lt;2 hrs → <span className="text-red-400 font-medium">No refund</span></p>
          </div>

          <textarea
            placeholder="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            className="w-full mb-4 p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:border-amber-500/50"
            rows={2}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setCancelModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-semibold transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancel}
              disabled={!!cancellingId}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {cancellingId ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
