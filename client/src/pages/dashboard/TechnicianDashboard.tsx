import { useState, useEffect } from 'react';
import { Wallet, Star, TrendingUp, CheckCircle, Clock, AlertCircle, Upload, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Badge } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function TechnicianDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (silent = false) => {
    try {
      const res = await axios.get('/api/technician/profile');
      setProfile(res.data.data);
    } catch {
      if (!silent) showToast.error('Failed to load profile');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // Poll every 30 seconds so status changes from admin reflect quickly
    const interval = setInterval(() => fetchProfile(true), 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary-500)] border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Full-page block for unverified accounts ──────────────────────────────────
  if (!profile || profile.verificationStatus !== 'verified') {
    const status = profile?.verificationStatus || 'pending';
    const isPending   = status === 'pending';
    const isSuspended = status === 'suspended';
    const isRejected  = status === 'rejected';

    const iconBg = isPending ? 'bg-amber-100 text-amber-600' : isSuspended ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600';

    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto mt-12 space-y-4">
          <Card className="p-10 text-center flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${iconBg}`}>
              {isPending ? <Clock size={40} /> : <AlertCircle size={40} />}
            </div>

            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {isPending   && 'Verification Pending'}
              {isSuspended && 'Account Suspended'}
              {isRejected  && 'Verification Rejected'}
            </h1>

            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              {isPending && 'Your application has been received and is under review by our admin team. This usually takes 24–48 hours. You will be notified via the notification bell once a decision is made.'}
              {isSuspended && (
                profile?.suspendedReason
                  ? `Your account has been suspended. Admin note: "${profile.suspendedReason}". Please contact support.`
                  : 'Your account has been temporarily suspended. Please contact support for more details.'
              )}
              {isRejected && (
                profile?.rejectionReason
                  ? `Your application was rejected. Reason: "${profile.rejectionReason}". Please address these issues and contact support.`
                  : 'Unfortunately your application did not meet requirements. Please contact support.'
              )}
            </p>

            {/* Show "docs requested" message even on pending screen */}
            {profile?.docsRequested && (
              <div className="w-full mb-6 p-4 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-left">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">📄 Admin has requested additional documents:</p>
                <p className="text-sm text-amber-600 dark:text-amber-300">{profile.docsRequested}</p>
                <Link to="/dashboard/technician/profile"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                  <Upload size={14} /> Upload Documents
                </Link>
              </div>
            )}

            <div className="p-4 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-tertiary)] w-full">
              You cannot accept new bookings or go online while your account is <strong>{status}</strong>.
            </div>

            <button onClick={() => fetchProfile()} className="mt-4 flex items-center gap-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <RefreshCw size={12} /> Check status again
            </button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // ── Verified dashboard ────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Docs-requested banner (shown even on verified accounts needing extra docs) */}
        {profile?.docsRequested && (
          <div className="flex items-start gap-4 p-5 rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Upload size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300">📄 Admin Requested Additional Documents</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">{profile.docsRequested}</p>
            </div>
            <Link to="/dashboard/technician/profile"
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors">
              Upload Now
            </Link>
          </div>
        )}

        {/* Header & Status Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-primary-600)] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="z-10">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-primary-100 mt-1">Welcome back! Here is what's happening today.</p>
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">₹0</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Jobs Completed</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{profile?.reviewCount || 0}</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Average Rating</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                {profile?.rating || '0.0'} <span className="text-sm font-normal text-[var(--text-tertiary)]">/ 5</span>
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Weekly Trend</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">+0%</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Job Requests */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-primary)] pb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">New Requests</h2>
              <span className="text-xs text-[var(--text-tertiary)]">No new requests</span>
            </div>
            <div className="text-center py-10">
              <Clock className="mx-auto text-[var(--text-tertiary)] mb-4 opacity-50" size={40} />
              <p className="text-[var(--text-secondary)]">You're all caught up!</p>
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">Today's Schedule</h2>
            <div className="text-center py-10">
              <CheckCircle className="mx-auto text-[var(--text-tertiary)] mb-4 opacity-50" size={40} />
              <p className="text-[var(--text-secondary)]">No active jobs scheduled.</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );



  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary-500)] border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile || profile.verificationStatus !== 'verified') {
    const status = profile?.verificationStatus || 'pending';
    const isPending = status === 'pending';
    const isSuspended = status === 'suspended';
    const isRejected = status === 'rejected';

    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="p-10 text-center flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isPending ? 'bg-amber-100 text-amber-600' : isSuspended ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
              {isPending ? <Clock size={40} /> : <AlertCircle size={40} />}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {isPending && 'Verification Pending'}
              {isSuspended && 'Account Suspended'}
              {isRejected && 'Verification Rejected'}
            </h1>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              {isPending && 'Your application has been received and is currently under review by our admin team. This usually takes 24-48 hours. You will be notified once verified.'}
              {isSuspended && (profile?.suspendedReason ? `Your account has been suspended: ${profile.suspendedReason}. Please contact support.` : 'Your account has been temporarily suspended. Please contact support.')}
              {isRejected && (profile?.rejectionReason ? `Your application was rejected: ${profile.rejectionReason}.` : 'Unfortunately, your application did not meet our requirements at this time.')}
            </p>
            <div className="p-4 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-tertiary)]">
              You cannot accept new bookings or go online while your account is {status}.
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Status Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-primary-600)] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="z-10">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-primary-100 mt-1">Welcome back! Here is what's happening today.</p>
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">₹0</p>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Jobs Completed</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{profile?.reviewCount || 0}</p>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center justify-center shrink-0">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Average Rating</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] flex items-baseline gap-1">{profile?.rating || '0.0'} <span className="text-sm font-normal text-[var(--text-tertiary)]">/ 5</span></p>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Weekly Trend</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">+0%</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Job Requests */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-primary)] pb-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">New Requests</h2>
              <span className="text-xs text-[var(--text-tertiary)]">No new requests</span>
            </div>
            <div className="text-center py-10">
              <Clock className="mx-auto text-[var(--text-tertiary)] mb-4 opacity-50" size={40} />
              <p className="text-[var(--text-secondary)]">You're all caught up!</p>
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-primary)] pb-4">Today's Schedule</h2>
            <div className="text-center py-10">
              <CheckCircle className="mx-auto text-[var(--text-tertiary)] mb-4 opacity-50" size={40} />
              <p className="text-[var(--text-secondary)]">No active jobs scheduled.</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
