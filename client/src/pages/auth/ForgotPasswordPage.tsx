import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../../components/layout/AuthLayout';
import { Input, Button } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { Mail, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      
      setIsSent(true);
      showToast.success('Password reset instructions sent to your email.');
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to process request.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We've sent password reset instructions to ${email}`}
      >
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <ShieldCheck size={32} className="text-green-600 dark:text-green-400" />
          </div>
          
          <p className="text-center text-[var(--text-secondary)]">
            If an account exists for {email}, you will receive an email with instructions on how to reset your password.
          </p>

          <Link to="/reset-password" state={{ email }}>
            <Button className="mt-4">
              Enter Reset Code
            </Button>
          </Link>
          
          <Link to="/login" className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
                     icon={<Mail size={18} />}
        />

        <Button
          type="submit"
                     isLoading={isLoading}
        >
          Reset Password
        </Button>

        <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
