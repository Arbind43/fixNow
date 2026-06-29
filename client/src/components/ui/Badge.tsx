import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
  primary: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)]',
  success: 'bg-[var(--color-success-light)] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'bg-[var(--color-warning-light)] text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  error: 'bg-[var(--color-error-light)] text-red-700 dark:bg-red-950 dark:text-red-400',
  info: 'bg-[var(--color-info-light)] text-blue-700 dark:bg-blue-950 dark:text-blue-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--text-tertiary)]',
  primary: 'bg-[var(--color-primary-600)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
  info: 'bg-[var(--color-info)]',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-full)]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {icon}
      {children}
    </span>
  );
}
