import toast, { Toaster as ReactHotToaster } from 'react-hot-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function Toaster() {
  return (
    <ReactHotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: '!bg-[var(--bg-elevated)] !text-[var(--text-primary)] !border !border-[var(--border-primary)] !shadow-[var(--shadow-lg)] !rounded-[var(--radius-lg)] !p-0',
        success: {
          iconTheme: {
            primary: 'var(--color-success)',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--color-error)',
            secondary: 'white',
          },
        },
      }}
    >
      {(t) => (
        <div
          className={`
            flex items-start gap-3 p-4 min-w-[300px] max-w-[400px]
            ${t.visible ? 'animate-enter' : 'animate-leave'}
          `}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle size={20} className="text-[var(--color-success)]" />}
            {t.type === 'error' && <AlertCircle size={20} className="text-[var(--color-error)]" />}
            {t.type === 'custom' && <Info size={20} className="text-[var(--color-info)]" />}
          </div>
          <div className="flex-1 min-w-0">
            {/* The actual toast message goes here. react-hot-toast handles this internally when rendering */}
            <p className="text-sm font-medium">{t.message as React.ReactNode}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 p-1 rounded-md text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </ReactHotToaster>
  );
}

// Utility wrapper for common toast types
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.custom(message),
  warning: (message: string) => 
    toast(message, {
      icon: <AlertTriangle size={20} className="text-[var(--color-warning)]" />,
    }),
};
