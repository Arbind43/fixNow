/**
 * AdminLayout — now a thin wrapper around the shared DashboardLayout.
 * This gives admin pages the exact same Navbar + Sidebar + theme as
 * Customer and Professional dashboards, making the UI fully uniform.
 */
import DashboardLayout from '../layout/DashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

