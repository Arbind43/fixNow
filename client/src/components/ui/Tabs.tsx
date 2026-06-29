import { useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export default function Tabs({ tabs, activeTab, onChange, className = '', variant = 'underline' }: TabsProps) {
  return (
    <div className={`flex items-center ${variant === 'underline' ? 'border-b border-[var(--border-primary)]' : 'gap-2'} ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
              ${variant === 'underline' 
                ? isActive ? 'text-[var(--color-primary-600)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                : isActive ? 'text-[var(--color-primary-700)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30 dark:text-[var(--color-primary-300)] rounded-full' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-full'
              }
            `}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>

            {isActive && variant === 'underline' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary-600)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
