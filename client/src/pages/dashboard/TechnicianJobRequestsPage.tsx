import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Badge } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { Briefcase, Loader2, MapPin, Clock, IndianRupee, CheckCircle, XCircle, User } from 'lucide-react';


const STATUS_COLORS: Record<string, string> = {
  pending:     'warning',
  accepted:    'primary',
  in_progress: 'primary',
  completed:   'success',
  cancelled:   'error',
};

export default function TechnicianJobRequestsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/me');
      setBookings(res.data.data || []);
    } catch {
      showToast.error('Failed to load job requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchBookings(); 
  }, []);

  const handleStatus = async (bookingId: string, status: 'accepted' | 'cancelled' | 'completed') => {
    setActionLoading(bookingId + status);
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status });
      showToast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const pending    = bookings.filter(b => b.status === 'pending');
  const active     = bookings.filter(b => ['accepted','in_progress'].includes(b.status));
  const past       = bookings.filter(b => ['completed','cancelled'].includes(b.status));

  const renderBookingCard = (booking: any) => {
    const customerName = booking.customer?.name || 'Customer';
    const serviceName  = booking.service?.name  || 'Service';
    const amount       = booking.totalAmount     || 0;
    const scheduledDate = booking.scheduledDate
      ? format(new Date(booking.scheduledDate), 'dd MMM yyyy, h:mm a')
      : 'TBD';

    return (
      <Card key={booking._id} className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-700)] flex items-center justify-center text-white font-bold shrink-0">
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">{serviceName}</p>
              <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                <User size={12} /> {customerName}
              </p>
            </div>
          </div>
          <Badge variant={STATUS_COLORS[booking.status] as any}>{booking.status.replace('_', ' ')}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Clock size={14} />
            <span>{scheduledDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <IndianRupee size={14} />
            <span className="font-semibold text-[var(--text-primary)]">₹{amount.toLocaleString()}</span>
          </div>
          {booking.address?.street && (
            <div className="col-span-2 flex items-center gap-2 text-[var(--text-secondary)]">
              <MapPin size={14} />
              <span className="truncate">{booking.address.street}, {booking.address.city}</span>
            </div>
          )}
        </div>

        {booking.notes && (
          <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border-primary)] italic">
            "{booking.notes}"
          </p>
        )}

        <div className="flex gap-3 pt-1 border-t border-[var(--border-primary)]">
          {booking.status === 'pending' && (
            <>
              <Button
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => handleStatus(booking._id, 'accepted')}
                disabled={actionLoading === booking._id + 'accepted'}
              >
                <CheckCircle size={16} />
                {actionLoading === booking._id + 'accepted' ? 'Accepting...' : 'Accept'}
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => handleStatus(booking._id, 'cancelled')}
                disabled={actionLoading === booking._id + 'cancelled'}
              >
                <XCircle size={16} />
                {actionLoading === booking._id + 'cancelled' ? 'Declining...' : 'Decline'}
              </Button>
            </>
          )}
          {(booking.status === 'accepted' || booking.status === 'in_progress') && (
            <>
              <Button
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => handleStatus(booking._id, 'completed')}
                disabled={actionLoading === booking._id + 'completed'}
              >
                <CheckCircle size={16} />
                {actionLoading === booking._id + 'completed' ? 'Completing...' : 'Mark Complete'}
              </Button>
              <Link
                to={`/dashboard/messages/${booking._id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Chat
              </Link>
            </>
          )}
          {(booking.status === 'completed' || booking.status === 'cancelled') && (
            <Link
              to={`/dashboard/messages/${booking._id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-primary)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              View Chat
            </Link>
          )}
        </div>
      </Card>
    );
  };

  const renderSection = (title: string, items: any[], emptyMsg: string) => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
        {title}
        <span className="text-sm font-normal text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)] py-4 px-2">{emptyMsg}</p>
      ) : (
        <div className="space-y-4">
          {items.map(b => renderBookingCard(b))}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Job Requests</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your incoming and ongoing service requests.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-[var(--color-primary-500)]" />
          </div>
        ) : (
          <div className="space-y-10">
            {renderSection("🔔 New Requests", pending, "No pending requests right now.")}
            {renderSection("⚙️ Active Jobs", active, "No active jobs at the moment.")}
            {renderSection("📋 Past Jobs", past, "No completed or cancelled jobs yet.")}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
