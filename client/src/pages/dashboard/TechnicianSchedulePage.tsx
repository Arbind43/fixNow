import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui';
import { Clock, MapPin, User, IndianRupee, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';
import { showToast } from '../../components/ui/Toast';

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-amber-500/15 text-amber-400 border-amber-500/20',
  accepted:    'bg-blue-500/15 text-blue-400 border-blue-500/20',
  in_progress: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  completed:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  cancelled:   'bg-red-500/15 text-red-400 border-red-500/20',
};

function getDateLabel(dateStr: string) {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isThisWeek(date)) return format(date, 'EEEE'); // e.g., "Monday"
  return format(date, 'MMM dd, yyyy');
}

export default function TechnicianSchedulePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('/api/bookings/me');
        const upcoming = (res.data.data || []).filter(
          (b: any) => ['pending', 'accepted', 'in_progress'].includes(b.status)
        );
        upcoming.sort((a: any, b: any) =>
          new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        );
        setBookings(upcoming);
      } catch {
        showToast.error('Failed to load schedule');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Group by date label
  const grouped: Record<string, any[]> = {};
  bookings.forEach((b) => {
    const label = getDateLabel(b.scheduledDate);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(b);
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Schedule</h1>
          <p className="text-[var(--text-secondary)] mt-1">Your upcoming appointments and service bookings.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-[var(--color-primary-500)]" />
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-[var(--color-success)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">All Clear!</h2>
            <p className="text-[var(--text-secondary)] max-w-md">
              No upcoming bookings scheduled. New job requests will appear here once accepted.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([dateLabel, dayBookings]) => (
              <div key={dateLabel}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{dateLabel}</h2>
                  <span className="h-px flex-1 bg-[var(--border-primary)]" />
                  <span className="text-sm text-[var(--text-tertiary)]">{dayBookings.length} job{dayBookings.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-4">
                  {dayBookings.map((booking) => {
                    const customerName = booking.customer?.name || 'Customer';
                    const serviceName = booking.service?.name || 'Service';
                    const timeStr = format(new Date(booking.scheduledDate), 'h:mm a');

                    return (
                      <Card key={booking._id} className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[var(--color-primary-500)] font-bold text-lg">{timeStr}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[booking.status]}`}>
                                {booking.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="font-semibold text-[var(--text-primary)] text-base">{serviceName}</p>

                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[var(--text-secondary)]">
                              <div className="flex items-center gap-2">
                                <User size={14} />
                                <span>{customerName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <IndianRupee size={14} />
                                <span className="font-semibold text-[var(--text-primary)]">₹{booking.totalAmount?.toLocaleString()}</span>
                              </div>
                              {booking.address?.city && (
                                <div className="flex items-center gap-2 sm:col-span-2">
                                  <MapPin size={14} />
                                  <span className="truncate">
                                    {booking.address.street ? `${booking.address.street}, ` : ''}{booking.address.city}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Timeline dot */}
                          <div className="w-3 h-3 rounded-full bg-[var(--color-primary-500)] mt-1.5 shrink-0 ring-4 ring-[var(--color-primary-500)]/20" />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
