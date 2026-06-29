import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({ trigger, items, align = 'right', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`
              absolute z-[var(--z-dropdown)] mt-2 w-56 rounded-[var(--radius-lg)]
              bg-[var(--bg-elevated)] border border-[var(--border-primary)]
              shadow-[var(--shadow-lg)] overflow-hidden
              ${align === 'right' ? 'right-0' : 'left-0'}
            `}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                    ${item.danger 
                      ? 'text-[var(--color-error)] hover:bg-[var(--color-error-light)] dark:hover:bg-[var(--color-error)]/10' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
