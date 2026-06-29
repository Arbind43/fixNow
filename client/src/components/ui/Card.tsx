import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'md',
  onClick,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden bg-[var(--bg-elevated)] rounded-[var(--radius-2xl)] border border-[var(--border-primary)]
        shadow-[var(--shadow-sm)] transition-shadow duration-300
        ${hover ? 'cursor-pointer hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary-400)]/40' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {/* Optional Inner Glow Effect */}
      {glow && (
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-white/5 dark:border-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
