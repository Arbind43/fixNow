import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, PlusCircle, AlertCircle, Zap, Wrench, Droplets, Sparkles, ArrowRight, Navigation, Star } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Avatar } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const QUICK_SERVICES = [
  { name: 'AC Repair',     slug: 'ac-repair',   icon: Sparkles, color: 'text-sky-400',    bg: 'bg-sky-500/10    border-sky-500/20'    },
  { name: 'Plumbing',      slug: 'plumbing',    icon: Droplets, color: 'text-cyan-400',   bg: 'bg-cyan-500/10   border-cyan-500/20'   },
  { name: 'Electrical',    slug: 'electrical',  icon: Zap,      color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { name: 'Appliances',    slug: 'appliances',  icon: Wrench,   color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');
  const [nearestTechnicians, setNearestTechnicians] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchNearest = async (overrideLat?: number, overrideLng?: number) => {
    // Use saved location from LocationBar if available
    const saved = localStorage.getItem('fixnow_location');
    let savedLoc: any = null;
    try { if (saved) savedLoc = JSON.parse(saved); } catch {}

    const useLat = overrideLat ?? savedLoc?.lat;
    const useLng = overrideLng ?? savedLoc?.lng;

    setIsLocating(true);
    setLocationError(null);

    const doFetch = async (lat?: number, lng?: number, city?: string, pincode?: string) => {
      const params = new URLSearchParams();
      if (lat)     params.append('lat',     String(lat));
      if (lng)     params.append('lng',     String(lng));
      if (city)    params.append('city',    city);
      if (pincode) params.append('pincode', pincode);
      const res = await axios.get(`/api/technicians?${params.toString()}`);
      setNearestTechnicians(res.data.data || []);
    };

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
        const d = await r.json();
        return {
          city: d.address?.city || d.address?.town || d.address?.state_district || '',
          pincode: d.address?.postcode || ''
        };
      } catch { return { city: '', pincode: '' }; }
    };

    try {
      if (useLat && useLng) {
        // We have coords — reverse geocode and fetch
        const { city, pincode } = await reverseGeocode(useLat, useLng);
        await doFetch(useLat, useLng, city || savedLoc?.city, pincode || savedLoc?.pincode);
      } else if (navigator.geolocation) {
        // Fall back to browser GPS
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude: lat, longitude: lng } = pos.coords;
              const { city, pincode } = await reverseGeocode(lat, lng);
              await doFetch(lat, lng, city, pincode);
            } catch { setLocationError('Failed to fetch nearby professionals.'); }
            finally { setIsLocating(false); }
          },
          () => {
            setLocationError('Location denied. Use the 📍 pin in the navbar to set your area.');
            setIsLocating(false);
          },
          { timeout: 10000, maximumAge: 60000 }
        );
        return; // async, setIsLocating handled inside
      } else {
        setLocationError('Set your location using the 📍 pin in the navbar.');
      }
    } catch (error) {
      setLocationError('Failed to fetch nearby professionals.');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting('Good afternoon');
    else if (h >= 17) setGreeting('Good evening');

    fetchNearest();

    // Refresh when location is changed from the Navbar LocationBar
    const handleLocationChange = (e: any) => {
      const { lat, lng } = e.detail || {};
      if (lat && lng) fetchNearest(lat, lng);
    };
    window.addEventListener('locationChanged', handleLocationChange);
    return () => window.removeEventListener('locationChanged', handleLocationChange);
  }, []);

  const recentBookings = [
    { id: '1', service: 'AC Gas Leak Repair',  date: 'Jun 15, 2026', status: 'completed', amount: 548  },
    { id: '2', service: 'Deep Home Cleaning',  date: 'May 20, 2026', status: 'completed', amount: 2999 },
  ];

  const stats = [
    { label: 'Total Bookings', value: '8',   color: 'text-white'       },
    { label: 'Completed',      value: '6',   color: 'text-emerald-400' },
    { label: 'Saved',          value: '₹840', color: 'text-amber-400'   },
    { label: 'Rating Given',   value: '4.9',  color: 'text-blue-400'    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-[var(--text-tertiary)] text-sm mb-1">{greeting},</p>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {user?.name?.split(' ')[0] || 'Friend'} 👋
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">What home service do you need today?</p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 shrink-0"
          >
            <PlusCircle size={16} />
            Book a Service
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl px-4 py-4 text-center"
            >
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Services */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Quick Book</h2>
            <Link to="/services" className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1">
              All Services <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_SERVICES.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border ${cat.bg} hover:scale-105 transition-all duration-300 text-center`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                    <cat.icon size={22} />
                  </div>
                  <span className="font-semibold text-[var(--text-primary)] text-sm">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Suggested Professionals Near You */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MapPin size={18} className="text-amber-500" />
              Nearest Professionals
            </h2>
            <button onClick={fetchNearest} className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1">
              Refresh Location
            </button>
          </div>
          
          {isLocating ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-primary)] animate-pulse" />
              ))}
            </div>
          ) : locationError ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-6 text-center">
              <MapPin size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
              <p className="text-[var(--text-secondary)] text-sm mb-3">{locationError}</p>
              <button onClick={fetchNearest} className="px-4 py-2 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)] rounded-lg text-sm font-semibold transition-colors">
                Enable Location Access
              </button>
            </div>
          ) : nearestTechnicians.length === 0 ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-6 text-center">
              <Search size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
              <p className="text-[var(--text-secondary)] text-sm mb-3">No professionals found within your immediate service radius.</p>
              <Link to="/search" className="px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg text-sm font-semibold transition-all">
                Browse All Professionals
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearestTechnicians.slice(0, 3).map((tech, i) => (
                <motion.div
                  key={tech._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-5 flex items-center gap-4 hover:border-amber-500/30 transition-colors group"
                >
                  <img 
                    src={tech.user?.avatar || `https://ui-avatars.com/api/?name=${tech.user?.name}&background=random`} 
                    className="w-14 h-14 rounded-xl object-cover" 
                    alt={tech.user?.name} 
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text-primary)] text-sm truncate group-hover:text-amber-500 transition-colors">
                      {tech.user?.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-1">
                      <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star size={11} className="fill-amber-500" /> {tech.rating || 'New'}
                      </span>
                      <span>•</span>
                      <span>{tech.distanceInKm ? `${tech.distanceInKm.toFixed(1)} km away` : 'Nearby'}</span>
                    </div>
                  </div>
                  <Link to={`/technicians/${tech._id}`} className="shrink-0 w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all">
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active / Empty Booking */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Active Booking</h2>
            <div className="relative bg-[var(--bg-elevated)] border-2 border-dashed border-[var(--border-primary)] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={28} className="text-[var(--text-tertiary)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No Active Bookings</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-xs">You don't have any ongoing service requests right now.</p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <Search size={15} />
                Find a Service
              </Link>
            </div>
          </div>

          {/* Recent History */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent History</h2>
              <Link to="/dashboard/bookings" className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentBookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl p-4 flex items-center gap-3 hover:border-amber-500/20 transition-colors group"
                >
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] text-sm truncate">{b.service}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{b.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[var(--text-primary)]">₹{b.amount}</p>
                    <p className="text-xs text-emerald-400 font-medium">Done</p>
                  </div>
                </motion.div>
              ))}

              <Link
                to="/dashboard/bookings"
                className="flex items-center justify-center gap-2 p-3 border border-dashed border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-amber-500/30 transition-colors"
              >
                <Navigation size={12} />
                Track your bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
