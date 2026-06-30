import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ShieldCheck, Calendar, AlertTriangle,
  FileText, Settings, LogOut, ChevronDown, Bell, Menu, X,
  Star, CreditCard, Megaphone, BarChart3, ClipboardList,
  ShoppingBag, BookOpen, History
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard',   path: '/admin',          icon: LayoutDashboard },
    ],
  },
  {
    label: 'Users',
    items: [
      { name: 'Customers',            path: '/admin/users',          icon: Users },
      { name: 'Professionals',        path: '/admin/professionals',  icon: ShieldCheck },
      { name: 'Verification Queue',   path: '/admin/verification',   icon: ClipboardList },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Bookings',    path: '/admin/bookings',   icon: Calendar },
      { name: 'Complaints',  path: '/admin/complaints', icon: AlertTriangle },
      { name: 'Reviews',     path: '/admin/reviews',    icon: Star },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Payments',    path: '/admin/payments',   icon: CreditCard },
      { name: 'Reports',     path: '/admin/reports',    icon: BarChart3 },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'Services',    path: '/admin/services',   icon: ShoppingBag },
      { name: 'Notify Users',path: '/admin/notifications', icon: Megaphone },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'Audit Logs',  path: '/admin/audit-logs', icon: History },
      { name: 'Settings',    path: '/admin/settings',   icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--border-primary)' }}>
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          F
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>FixNow Admin</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Control Panel</p>
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2" style={{ color: 'var(--text-tertiary)' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      background: isActive
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <item.icon size={16} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium transition-all"
          style={{ color: '#ef4444' }}
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

