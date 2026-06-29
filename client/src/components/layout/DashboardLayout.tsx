import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar'; // You might want a simpler dashboard header, but reusing Navbar for now or custom header.
import type { UserRole } from '@/types';

import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const role = user?.role || 'customer';

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex flex-1 pt-16 md:pt-18 overflow-hidden h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 overflow-y-auto">
          <Sidebar role={role} />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
                style={{ zIndex: 'var(--z-modal-backdrop)' }}
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-64 bg-[var(--bg-primary)] lg:hidden"
                style={{ zIndex: 'var(--z-modal)' }}
              >
                <div className="flex justify-end p-4 border-b border-[var(--border-primary)]">
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)]">
                    <X size={20} />
                  </button>
                </div>
                <div className="h-[calc(100%-65px)]">
                  <Sidebar role={role} onClose={() => setIsMobileSidebarOpen(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Mobile sidebar toggle button (visible only on smaller screens) */}
          <div className="lg:hidden mb-4">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-3 py-2 rounded-md border border-[var(--border-primary)] shadow-sm"
            >
              <Menu size={18} /> Menu
            </button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
