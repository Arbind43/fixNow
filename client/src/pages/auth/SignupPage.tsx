import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Wrench, Briefcase, Star, Zap, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '../../types';

export default function SignupPage() {
  const [role, setRole]         = useState<UserRole>('customer');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, role });
      const { user, accessToken } = response.data.data;
      login(accessToken, user);
      showToast.success('Account created!');
      navigate('/verify-email');
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all text-sm";

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      
      {/* Left Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <Wrench size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Fix<span className="text-amber-500">Now</span></span>
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2">Create an account</h1>
          <p className="text-white/50 mb-8 text-sm">Join FixNow and experience seamless home services.</p>

          {/* Role Toggle */}
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl mb-7">
            {[
              { id: 'customer',   label: 'I am a Customer',     icon: User      },
              { id: 'technician', label: 'I am a Professional', icon: Briefcase },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id as UserRole)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === opt.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <opt.icon size={15} />
                {opt.id === 'customer' ? 'Customer' : 'Professional'}
              </button>
            ))}
          </div>

          {role === 'technician' ? (
            <div className="text-center py-8 border border-white/10 rounded-2xl bg-white/5">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Join as a FixNow Pro</h3>
              <p className="text-white/40 mb-6 text-sm max-w-xs mx-auto">
                Complete professional verification to start receiving bookings in your area.
              </p>
              <button
                onClick={() => navigate('/register/technician')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
              >
                Start Registration <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" value={name} required onChange={e => setName(e.target.value)} placeholder="John Doe" className={inputCls} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" value={email} required onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="password" value={password} required onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-500/20 mt-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
              </button>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30">Or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                type="button"
                onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`; }}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </form>
          )}

          <p className="text-center text-sm text-white/40 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel — Branding (Mirrors Login Page) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />

        {/* Logo */}
        <div className="relative z-10 flex justify-end">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Fix<span className="text-amber-500">Now</span></span>
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Wrench size={22} className="text-white" />
            </div>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8 pl-12">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Join the future of <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">home services.</span>
            </h2>
            <p className="text-white/50 text-lg">One account. Access to thousands of top-rated professionals.</p>
          </div>

          <div className="space-y-4">
            {[
              { icon: CheckCircle2, text: 'Instant booking with confirmed professionals' },
              { icon: Zap,          text: 'Upfront pricing, no hidden fees' },
              { icon: Star,         text: 'Read reviews from real customers' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-white/70">
                <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <item.icon size={15} className="text-amber-400" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 pl-12">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm inline-block">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-amber-400" />)}
            </div>
            <p className="text-white/80 text-sm italic mb-4 max-w-sm">
              "FixNow completely changed how I manage my home. The professionals are always on time and the app is so easy to use."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">S</div>
              <span className="text-white/60 text-xs font-semibold">Sarah M. — Verified Customer</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
