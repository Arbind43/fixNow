import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      type = 'text',
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full relative">
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1.5 transition-colors ${
              isFocused ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            {label}
          </label>
        )}
        
        <div className="relative group">
          {/* Animated Glow on Focus */}
          {isFocused && !error && !disabled && (
            <motion.div
              layoutId={`input-glow-${inputId}`}
              className="absolute -inset-0.5 rounded-[var(--radius-lg)] bg-[var(--color-primary-500)]/20 blur-sm pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}

          {icon && iconPosition === 'left' && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors z-10 ${
              isFocused ? 'text-[var(--color-primary-500)]' : 'text-[var(--text-tertiary)]'
            }`}>
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              relative z-0 w-full px-4 py-2.5 rounded-[var(--radius-lg)]
              bg-[var(--bg-elevated)] border shadow-[var(--shadow-xs)]
              text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-tertiary)]
              focus:outline-none focus:ring-0
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${(icon && iconPosition === 'right') || isPassword ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 hover:border-red-600 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.2)]'
                  : 'border-[var(--border-primary)] hover:border-[var(--color-primary-300)] focus:border-[var(--color-primary-500)] focus:shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
              }
              ${className}
            `}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors z-10 focus:outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          
          {icon && iconPosition === 'right' && !isPassword && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10 ${
              isFocused ? 'text-[var(--color-primary-500)]' : 'text-[var(--text-tertiary)]'
            }`}>
              {icon}
            </div>
          )}
        </div>
        
        {/* Error or Helper text with animated reveal */}
        {(error || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-1.5 text-sm font-medium ${
              error ? 'text-red-500 dark:text-red-400' : 'text-[var(--text-tertiary)]'
            }`}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
