import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, Calendar, MessageSquare, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'booking' | 'message' | 'system' | 'payment';
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/api/notifications');
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      } catch (error) {
        console.error('Failed to load notifications');
      }
    };

    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Listen for real-time notifications
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      const newNotif: Notification = {
        _id: data._id || Math.random().toString(36).substr(2, 9),
        title: data.title,
        message: data.message,
        type: data.type || 'system',
        link: data.link || (data.bookingId ? `/dashboard/messages/${data.bookingId}` : undefined),
        read: false,
        createdAt: data.createdAt || new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Also show a toast so they see it even if dropdown is closed
      import('./Toast').then(({ showToast }) => {
        showToast.info(data.message, { duration: 5000 });
      }).catch(() => {});
    };

    socket.on('new_notification', handleNewNotification);
    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      } else {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar size={16} className="text-[var(--color-primary-500)]" />;
      case 'message': return <MessageSquare size={16} className="text-green-500" />;
      case 'payment': return <CreditCard size={16} className="text-purple-500" />;
      default: return <Info size={16} className="text-[var(--text-tertiary)]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--bg-primary)] rounded-xl shadow-xl border border-[var(--border-primary)] z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-elevated)]">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <span className="bg-[var(--color-primary-100)] text-[var(--color-primary-600)] text-xs px-2 py-0.5 rounded-full">{unreadCount} New</span>}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAsRead('all')}
                  className="text-xs text-[var(--color-primary-600)] hover:underline flex items-center gap-1"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-tertiary)] flex flex-col items-center">
                  <Bell size={32} className="mb-2 opacity-20" />
                  <p>You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-primary)]">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`p-4 transition-colors hover:bg-[var(--bg-secondary)] flex gap-3 ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif._id);
                      }}
                    >
                      <div className="mt-1 shrink-0 bg-[var(--bg-elevated)] w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-[var(--border-primary)]">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {notif.link ? (
                          <Link to={notif.link} onClick={() => setIsOpen(false)} className="block focus:outline-none">
                            <p className="text-sm font-medium text-[var(--text-primary)] leading-tight mb-1">{notif.title}</p>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{notif.message}</p>
                          </Link>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-[var(--text-primary)] leading-tight mb-1">{notif.title}</p>
                            <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{notif.message}</p>
                          </>
                        )}
                        <p className="text-xs text-[var(--text-tertiary)] mt-2">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] shrink-0 mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-[var(--border-primary)] text-center bg-[var(--bg-secondary)]">
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="text-sm text-[var(--color-primary-600)] font-medium hover:underline"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
