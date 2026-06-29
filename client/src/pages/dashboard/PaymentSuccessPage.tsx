import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CheckCircle2, ArrowRight, Navigation, FileText, Sparkles } from 'lucide-react';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId;

  useEffect(() => {
    if (!bookingId) navigate('/dashboard/bookings');
  }, [bookingId, navigate]);

  if (!bookingId) return null;

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-3xl p-10 text-center"
        >
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />

          {/* Success icon with ripple */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-emerald-500/20"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-emerald-500/30"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 120, delay: 0.1 }}
              className="relative w-28 h-28 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 size={52} className="text-emerald-400" />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-4">
              <Sparkles size={13} /> Payment Successful
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3">Booking Confirmed!</h1>
            <p className="text-[var(--text-secondary)] mb-8 text-sm leading-relaxed max-w-xs mx-auto">
              Your payment was successful and your service has been scheduled. A technician will arrive at the designated time.
            </p>
          </motion.div>

          {/* Booking ID Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-5 text-left mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Booking ID</p>
                <p className="font-semibold text-[var(--text-primary)] font-mono text-sm">{String(bookingId).slice(-12).toUpperCase()}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] border-t border-[var(--border-primary)] pt-3 text-center">
              A confirmation receipt has been sent to your registered email.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              to={`/dashboard/track/${bookingId}`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              <Navigation size={16} />
              Track Live
            </Link>
            <Link
              to="/dashboard/bookings"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-500/30 font-semibold rounded-xl transition-all"
            >
              My Bookings
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
