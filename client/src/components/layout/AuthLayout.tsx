import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  imageNode?: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle, imageNode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[var(--bg-secondary)]">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-5/12 mx-auto lg:mx-0 bg-[var(--bg-primary)] lg:border-r border-[var(--border-primary)] shadow-[var(--shadow-xl)] lg:shadow-none relative z-10">
        
        {/* Back link */}
        <div className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto py-12">
          {/* Logo */}
          <div className="mb-10 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] gradient-primary flex items-center justify-center shadow-md">
                <Wrench size={22} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                Fix<span className="text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">Now</span>
              </span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
                {subtitle}
              </p>
            )}

            {/* Form Content */}
            {children}
          </motion.div>
        </div>
      </div>

      {/* Right side - Premium Graphic (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center relative overflow-hidden p-12 bg-gradient-to-br from-[var(--color-primary-900)] via-[var(--color-primary-800)] to-purple-900">
        {/* Animated ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-400/30 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/30 to-transparent rounded-full blur-[100px] pointer-events-none" />
        
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%222%22%20cy%3D%222%22%20r%3D%221%22%20fill%3D%22rgba(255%2C255%2C255%2C0.05)%22%2F%3E%3C%2Fsvg%3E')] opacity-50 pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg text-center">
          {imageNode || (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="p-10 rounded-[2.5rem] glass-strong border border-white/10 shadow-2xl relative overflow-hidden"
            >
              {/* Card internal glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              <h3 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                Your home,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                  expertly fixed.
                </span>
              </h3>
              <p className="text-blue-100/70 text-lg leading-relaxed mb-10">
                Join thousands of customers getting instant, AI-powered diagnostics and reliable service.
              </p>
              
              <div className="flex justify-center gap-8 border-t border-white/10 pt-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">50k+</p>
                  <p className="text-sm text-blue-200/60 uppercase tracking-wider font-medium">Customers</p>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">4.8</p>
                  <p className="text-sm text-blue-200/60 uppercase tracking-wider font-medium">App Rating</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
