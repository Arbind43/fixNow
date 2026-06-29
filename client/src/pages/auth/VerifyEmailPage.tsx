import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/layout/AuthLayout';
import { Input, Button } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { KeyRound } from 'lucide-react';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already verified
  useEffect(() => {
    if (user?.isVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsLoading(true);
    try {
      await axios.post('/api/auth/verify-otp', { email: user.email, otp });
      
      showToast.success('Email verified successfully!');
      updateUser({ isVerified: true });
      navigate('/dashboard');
      
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const res = await axios.post('/api/auth/send-otp', { email: user.email });
      showToast.success('A new OTP has been sent to your email.');
      
      if (res.data.dev_otp) {
        console.log("DEV OTP:", res.data.dev_otp);
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  // Automatically request OTP on mount if not verified
  useEffect(() => {
    if (user && !user.isVerified) {
      handleResend();
    }
  }, []);

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We've sent a 6-digit code to ${user?.email || 'your email'}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-center">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <KeyRound size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <Input
          label="Verification Code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="text-center text-2xl tracking-widest h-14"
          required
                   />

        <Button
          type="submit"
                     isLoading={isLoading}
          disabled={otp.length !== 6}
        >
          Verify Email
        </Button>

        <p className="text-sm text-[var(--text-secondary)] mt-6">
          Didn't receive the code?{' '}
          <button 
            type="button" 
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Click to resend'}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
