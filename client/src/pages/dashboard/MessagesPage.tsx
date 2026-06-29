import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MessageSquare, Loader2, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function MessagesPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('/api/bookings/me');
        setBookings(res.data.data || []);
      } catch {
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Messages</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Chat with your assigned technician for each booking.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-[var(--color-primary-500)]" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] flex items-center justify-center">
              <MessageSquare size={24} className="text-[var(--text-tertiary)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">No conversations yet</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                Your chats with technicians will appear here after you make a booking.
              </p>
            </div>
            <Link
              to="/dashboard/book-service"
              className="mt-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Book a Service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const techName = booking.technician?.user?.name || 'Technician';
              const serviceName = booking.service?.name || 'Service';
              const statusColor =
                booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                booking.status === 'accepted' || booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700';

              return (
                <Link
                  key={booking._id}
                  to={`/dashboard/messages/${booking._id}`}
                  className="flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl hover:border-[var(--color-primary-300)] hover:shadow-md transition-all group"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-700)] flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {techName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[var(--text-primary)] truncate">{techName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColor}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">{serviceName}</p>
                    <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-1">
                      <Calendar size={10} />
                      {booking.scheduledDate ? format(new Date(booking.scheduledDate), 'dd MMM yyyy, h:mm a') : 'TBD'}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--color-primary-500)] transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
