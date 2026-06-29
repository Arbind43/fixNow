import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white shadow-[var(--shadow-sm),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-[var(--color-primary-400)] hover:to-[var(--color-primary-500)] hover:shadow-[var(--shadow-glow)] active:scale-[0.96] border border-[var(--color-primary-600)]',
  secondary:
    'bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-secondary)] shadow-[var(--shadow-xs)] active:scale-[0.96]',
  outline:
    'bg-transparent border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)] hover:bg-[var(--color-primary-500)]/5 active:scale-[0.96]',
  ghost:
    'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] active:scale-[0.96]',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white border border-red-700 shadow-[var(--shadow-sm),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-red-400 hover:to-red-500 active:scale-[0.96]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 rounded-[var(--radius-md)]',
  md: 'px-4 py-2 text-sm font-semibold gap-2 rounded-[var(--radius-md)]',
  lg: 'px-6 py-2.5 text-sm font-semibold gap-2.5 rounded-[var(--radius-lg)]',
  xl: 'px-8 py-3.5 text-base font-semibold gap-3 rounded-[var(--radius-xl)]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.96 }}
        className={`
          relative inline-flex items-center justify-center
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          overflow-hidden
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Subtle Shine Effect for Primary */}
        {variant === 'primary' && !disabled && !isLoading && (
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
        )}
        
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="opacity-90">Loading...</span>
          </>
        ) : (
          <div className="relative z-10 flex items-center gap-inherit">
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            <span className="truncate">{children}</span>
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </div>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
