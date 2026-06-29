import { useState } from 'react';
import { Wallet, Star, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Badge } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';

export default function TechnicianDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Status Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-primary-600)] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="z-10">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-primary-100 mt-1">Here is what's happening today.</p>
          </div>
          <div className="z-10 flex items-center gap-3 bg-black/20 p-2 rounded-xl backdrop-blur-sm">
            <span className="text-sm font-medium">Status:</span>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-primary-600)] ${isOnline ? 'bg-green-400' : 'bg-zinc-400'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm font-bold w-12">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Today's Earnings</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">₹1,450</p>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Jobs Completed</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">3</p>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Average Rating</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">4.8 <span className="text-sm font-normal text-[var(--text-tertiary)]">/ 5</span></p>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Weekly Trend</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">+12%</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Job Requests */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-primary)] pb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">New Requests</h2>
              <Badge variant="error" className="animate-pulse">1 New</Badge>
            </div>
            
            <div className="bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 p-5 rounded-xl border border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-lg">AC Installation</h3>
                  <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                    <Clock size={14} /> Today, 4:00 PM
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-[var(--color-primary-600)]">₹899</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Est. 2 hours</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-6 bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-primary)]">
                "Need installation for a split AC. Wiring is already done."
              </p>
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => showToast.success('Job accepted!')}>Accept Job</Button>
                <Button variant="outline" className="flex-1" onClick={() => showToast.error('Job declined!')}>Decline</Button>
              </div>
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">Today's Schedule</h2>
            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-primary)] before:to-transparent">
              
              {/* Timeline Item 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-[var(--bg-primary)] bg-[var(--color-success)] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-primary)]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[var(--text-primary)]">Deep Cleaning</div>
                    <div className="text-xs text-[var(--text-tertiary)]">10:00 AM</div>
                  </div>
                  <Badge variant="success" className="text-[10px] px-2 py-0">Completed</Badge>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-[var(--bg-primary)] bg-[var(--color-primary-500)] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-[var(--bg-primary)] p-4 rounded-xl border-2 border-[var(--color-primary-500)] shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-[var(--text-primary)]">Pipe Leakage</div>
                    <div className="text-xs text-[var(--text-tertiary)]">2:30 PM</div>
                  </div>
                  <Badge variant="primary" className="text-[10px] px-2 py-0">In Progress</Badge>
                </div>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
