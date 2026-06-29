import { useState } from 'react';
import { CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button } from '../../components/ui';

const mockNotifications = [
  {
    id: 1,
    title: 'Booking Confirmed',
    message: 'Your AC Repair service has been confirmed for tomorrow at 10:00 AM.',
    time: '2 hours ago',
    type: 'success',
    read: false,
    icon: CheckCircle2
  },
  {
    id: 2,
    title: 'Technician Assigned',
    message: 'Rajeev Kumar has been assigned to your booking #BK-8492.',
    time: '5 hours ago',
    type: 'info',
    read: false,
    icon: Calendar
  },
  {
    id: 3,
    title: 'Payment Successful',
    message: 'We received your payment of ₹707 for the plumbing service.',
    time: '1 day ago',
    type: 'success',
    read: true,
    icon: CheckCircle2
  },
  {
    id: 4,
    title: 'Maintenance Reminder',
    message: 'It has been 6 months since your last Water Purifier service. Book now to ensure safe drinking water.',
    time: '2 days ago',
    type: 'warning',
    read: true,
    icon: AlertCircle
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-[var(--color-success)] bg-[var(--color-success)]/10';
      case 'warning': return 'text-[var(--color-warning)] bg-[var(--color-warning)]/10';
      default: return 'text-[var(--color-primary-600)] bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Notifications</h1>
            <p className="text-[var(--text-secondary)] mt-1">Stay updated on your bookings and alerts</p>
          </div>
          <Button variant="outline" onClick={markAllAsRead}>Mark all as read</Button>
        </div>

        <Card className="divide-y divide-[var(--border-primary)] overflow-hidden">
          {notifications.map(notification => {
            const Icon = notification.icon;
            return (
              <div 
                key={notification.id} 
                className={`p-6 flex gap-4 transition-colors ${notification.read ? 'bg-[var(--bg-primary)]' : 'bg-[var(--color-primary-50)]/50 dark:bg-[var(--color-primary-900)]/10'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getIconColor(notification.type)}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold ${notification.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                      <Clock size={12} /> {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] self-center shrink-0"></div>
                )}
              </div>
            );
          })}
        </Card>
      </div>
    </DashboardLayout>
  );
}
