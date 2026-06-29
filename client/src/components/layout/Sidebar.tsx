import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, Wallet, Settings, 
  MessageSquare, User, CheckSquare, Bell, FileText,
  LogOut, AlertTriangle, ShieldCheck, Users, Briefcase
} from 'lucide-react';
import type { UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  role: UserRole;
  onClose?: () => void;
}

const menuItems = {
  customer: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Bookings', path: '/dashboard/bookings', icon: Calendar },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { name: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ],
  technician: [
    { name: 'Dashboard', path: '/technician/dashboard', icon: LayoutDashboard },
    { name: 'Job Requests', path: '/dashboard/requests', icon: Briefcase },
    { name: 'My Schedule', path: '/dashboard/schedule', icon: Calendar },
    { name: 'Earnings & Wallet', path: '/dashboard/wallet', icon: Wallet },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
    { name: 'Profile & Portfolio', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ],
  admin: [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Technicians', path: '/admin/technicians', icon: ShieldCheck },
    { name: 'All Bookings', path: '/admin/bookings', icon: Calendar },
    { name: 'Categories', path: '/admin/categories', icon: CheckSquare },
    { name: 'Disputes', path: '/admin/disputes', icon: AlertTriangle },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
};

export default function Sidebar({ role, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = menuItems[role] || menuItems.customer;

  return (
    <div className="h-full flex flex-col bg-[var(--bg-elevated)] border-r border-[var(--border-primary)]">
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="mb-6 px-2">
          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            {role} Panel
          </p>
        </div>

        {items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`
                relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <item.icon size={20} className={isActive ? '' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors'} />
              {item.name}
              
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--color-primary-600)] rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border-primary)]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-[var(--radius-lg)] text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
