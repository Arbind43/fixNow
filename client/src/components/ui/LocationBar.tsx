import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Navigation, Search, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface LocationData {
  area: string;
  city: string;
  pincode?: string;
  lat?: number;
  lng?: number;
}

export default function LocationBar() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved location from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fixnow_location');
    if (saved) {
      try { setLocation(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveLocation = (loc: LocationData) => {
    setLocation(loc);
    localStorage.setItem('fixnow_location', JSON.stringify(loc));
    setIsModalOpen(false);
    setSearchText('');
    setSuggestions([]);
    setError(null);
    // Dispatch a custom event so CustomerDashboard can react
    window.dispatchEvent(new CustomEvent('locationChanged', { detail: loc }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          // Use Nominatim (free, no API key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address;

          const area =
            addr.suburb || addr.neighbourhood || addr.village ||
            addr.town || addr.county || addr.state_district || 'Your Area';
          const city = addr.city || addr.town || addr.state || 'India';
          const pincode = addr.postcode;

          saveLocation({ area, city, pincode, lat, lng });
        } catch {
          setError('Could not reverse geocode. Using coordinates only.');
          saveLocation({ area: `${lat.toFixed(3)}°N`, city: `${lng.toFixed(3)}°E`, lat, lng });
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === 1)
          setError('Location access denied. Please allow it in browser settings.');
        else
          setError('Could not detect location. Try manual search below.');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Nominatim search for manual entry
  const handleSearch = async (q: string) => {
    setSearchText(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=in&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 400);
  };

  const pickSuggestion = (s: any) => {
    const parts = s.display_name.split(', ');
    const area = parts[0] || 'Unknown Area';
    const city = parts[1] || parts[parts.length - 2] || 'India';
    saveLocation({
      area, city,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon),
    });
  };

  const displayText = location
    ? `${location.area}, ${location.city}`
    : 'Detect location';

  return (
    <>
      {/* Location Pill — shown in Navbar */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all group max-w-[200px]"
      >
        <MapPin size={14} className="text-amber-400 shrink-0" />
        <span className="text-sm font-medium text-white truncate">
          {location ? location.area : 'Set location'}
        </span>
        <ChevronDown size={13} className="text-white/50 shrink-0 group-hover:rotate-180 transition-transform duration-200" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-start justify-center pt-20 px-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white">Choose your location</h2>
                  <p className="text-xs text-white/50 mt-0.5">Find professionals near you</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Auto-detect button */}
                <button
                  onClick={detectLocation}
                  disabled={isDetecting}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:border-amber-500/50 hover:bg-amber-500/15 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    {isDetecting ? (
                      <Loader2 size={18} className="text-amber-400 animate-spin" />
                    ) : (
                      <Navigation size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">
                      {isDetecting ? 'Detecting your location…' : 'Use current location'}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {isDetecting ? 'Please wait' : 'Using GPS / browser location'}
                    </p>
                  </div>
                </button>

                {/* Error message */}
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-white/30 font-medium">or search manually</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    ref={searchRef}
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search for area, city, pincode…"
                    className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                  {isFetchingSuggestions && (
                    <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 animate-spin" />
                  )}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                    {suggestions.map((s, i) => {
                      const parts = s.display_name.split(', ');
                      return (
                        <button
                          key={i}
                          onClick={() => pickSuggestion(s)}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-white/3 hover:bg-white/8 transition-colors text-left"
                        >
                          <MapPin size={14} className="text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{parts[0]}</p>
                            <p className="text-xs text-white/40 truncate">{parts.slice(1, 4).join(', ')}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Current saved location chip */}
                {location && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <p className="text-sm text-emerald-300 font-medium truncate">
                      Current: {location.area}, {location.city}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
