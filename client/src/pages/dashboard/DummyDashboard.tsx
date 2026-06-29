import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function DummyDashboard() {
  const { user, logout } = useAuth();

  return (
    <DashboardLayout>
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          You are logged in as a <span className="font-semibold uppercase text-blue-600">{user?.role}</span>.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg mb-8">
          This is a placeholder dashboard. Specific dashboards for Customers, Technicians, and Admins will be built in the next phase.
        </div>

        <Button onClick={logout} variant="outline">
          Log Out
        </Button>
      </div>
    </DashboardLayout>
  );
}
