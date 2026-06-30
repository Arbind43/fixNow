import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import LocationBar from '@/components/ui/LocationBar';

const leftNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services', hasDropdown: true },
  { name: 'Categories', path: '/search' },
  { name: 'About', path: '/about' },
];

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg border-b border-white/10' : 'bg-transparent py-6'}`}>
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* Left Links */}
          <div className="hidden lg:flex items-center gap-8">
            {leftNavLinks.map((link) => {
              const isActive = isActiveLink(link.path);
              return (
                <div key={link.path} className="relative group">
                  <Link
                    to={link.path}
                    className="flex items-center gap-1 text-[15px] font-semibold text-white/90 hover:text-white transition-colors"
                  >
                    {link.name}
                    {link.hasDropdown && <ChevronDown size={14} className="opacity-70" />}
                  </Link>
                  {/* Active Underline */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Center Logo */}
          <Link to="/" className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <span className="text-2xl font-bold tracking-wide text-white flex items-center gap-1">
              Fix<span className="text-amber-500">Now</span>
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/80 mt-0.5">Premium Services</span>
          </Link>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Location Pill */}
            <LocationBar />
            <div className="flex items-center gap-3 text-white/80">
              <Link to="/search" className="hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                <Search size={18} />
              </Link>
              <button onClick={toggleTheme} className="hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {user && <NotificationDropdown />}
            </div>
            
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'technician' ? '/technician/dashboard' : '/dashboard'}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-semibold transition-colors rounded-sm shadow-lg shadow-amber-500/20"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-semibold transition-colors rounded-sm shadow-lg shadow-amber-500/20"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Actions (Visible on small screens) */}
          <div className="lg:hidden flex items-center gap-3 ml-auto text-white/80">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[190] bg-[#1a1a1a] pt-28 px-6 pb-6 flex flex-col"
          >
            <div className="flex flex-col gap-6 text-lg font-medium text-white/90">
              {leftNavLinks.map((link) => (
                <Link key={link.path} to={link.path} className="border-b border-white/10 pb-4">
                  {link.name}
                </Link>
              ))}
              {/* Location in mobile menu */}
              <div className="pt-2">
                <LocationBar />
              </div>
            </div>
            <div className="mt-auto flex flex-col gap-6">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'technician' ? '/technician/dashboard' : '/dashboard'}
                  className="w-full text-center py-4 bg-amber-500 text-white font-bold rounded-sm shadow-lg"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="w-full text-center py-4 bg-amber-500 text-white font-bold rounded-sm shadow-lg"
                >
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
