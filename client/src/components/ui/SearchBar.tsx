import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  showFilters?: boolean;
  onFilterClick?: () => void;
  suggestions?: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'py-2 pl-9 pr-4 text-sm',
  md: 'py-3 pl-11 pr-4 text-base',
  lg: 'py-4 pl-12 pr-5 text-lg',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 22,
};

export default function SearchBar({
  placeholder = 'Search services, technicians...',
  onSearch,
  showFilters = false,
  onFilterClick,
  suggestions = [],
  className = '',
  size = 'md',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const showSuggestions = isFocused && query.length > 0 && suggestions.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsFocused(false);
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={iconSizes[size]}
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              isFocused ? 'text-[var(--color-primary-500)]' : 'text-[var(--text-tertiary)]'
            }`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className={`
              w-full ${sizeStyles[size]} rounded-[var(--radius-2xl)]
              bg-[var(--bg-secondary)] border border-[var(--border-primary)]
              text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
              transition-all duration-[var(--transition-base)]
              focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-500)]/10
              focus:shadow-[var(--shadow-glow)]
            `}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); onSearch(''); }}
                className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
              >
                <X size={16} />
              </button>
            )}
            {showFilters && (
              <button
                type="button"
                onClick={onFilterClick}
                className="p-2 rounded-[var(--radius-lg)] text-[var(--text-tertiary)] hover:text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-950)] transition-all"
              >
                <SlidersHorizontal size={18} />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] overflow-hidden"
            style={{ zIndex: 'var(--z-dropdown)' }}
          >
            {filteredSuggestions.slice(0, 6).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(suggestion);
                  onSearch(suggestion);
                  setIsFocused(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Search size={16} className="text-[var(--text-tertiary)] shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
