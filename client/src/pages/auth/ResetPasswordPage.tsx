import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { Input, Button } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Assuming a /api/auth/reset-password endpoint exists
      // await axios.post('/api/auth/reset-password', { email, otp, newPassword });
      
      // Simulating success for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast.success('Password has been reset successfully!');
      navigate('/login');
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Your new password must be different from previously used passwords."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!location.state?.email && (
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
                       />
        )}
        
        <Input
          label="Reset Code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="tracking-widest"
          required
                   />

        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
                     
        />

        <Button
          type="submit"
                     isLoading={isLoading}
          className="mt-6"
        >
          Reset Password
        </Button>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
          <Link to="/login" className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
