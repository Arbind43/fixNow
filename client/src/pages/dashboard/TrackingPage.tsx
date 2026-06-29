import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TrackingMap from '../../components/ui/TrackingMap';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Wifi,
  WifiOff,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Navigation,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// --- Technician Broadcaster (for the technician's own dashboard view) ---
function TechnicianLocationBroadcaster({ bookingId }: { bookingId: string }) {
  const { socket } = useSocket();
  const [isSharing, setIsSharing] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const startSharing = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsSharing(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socket?.emit('technician:location', {
          bookingId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    socket?.emit('technician:stop_sharing', bookingId);
    setIsSharing(false);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-5 space-y-3">
      <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
        <Navigation size={18} className="text-[var(--color-primary-500)]" />
        Share Your Location
      </h3>
      <p className="text-sm text-[var(--text-secondary)]">
        Start sharing so your customer can track your arrival in real-time.
      </p>
      {isSharing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            Broadcasting live location…
          </div>
          <button
            onClick={stopSharing}
            className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            Stop Sharing
          </button>
        </div>
      ) : (
        <button
          onClick={startSharing}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Start Sharing Location
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Tracking Page
// ─────────────────────────────────────────────────────────────
export default function TrackingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [technicianLocation, setTechnicianLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);

  // Fetch real booking to get customer address
  useEffect(() => {
    if (!bookingId) return;
    axios.get(`/api/bookings/${bookingId}`).then(res => {
      setBookingData(res.data.data);
    }).catch(() => {
      // Use defaults if booking not found
    });
  }, [bookingId]);

  // Use real booking address if available, otherwise default to Gazipur area
  const customerLocation = bookingData?.address?.coordinates
    ? { lat: bookingData.address.coordinates[1], lng: bookingData.address.coordinates[0] }
    : { lat: 28.6258, lng: 77.3278 }; // Gazipur, East Delhi

  const bookingInfo = {
    technician: {
      name: bookingData?.technician?.user?.name || 'Assigned Technician',
      phone: bookingData?.technician?.user?.phone || '+91 99999 00000',
      service: bookingData?.service?.name || 'Home Service',
    },
    status: bookingData?.status || 'accepted',
  };

  const isTechnician = user?.role === 'technician';

  useEffect(() => {
    if (!socket || !bookingId) return;

    // Join the booking room to receive updates
    socket.emit('join_booking_room', bookingId);

    socket.on('technician:location:update', (data: { lat: number; lng: number }) => {
      setTechnicianLocation({ lat: data.lat, lng: data.lng });
      setIsStopped(false);
      setLastUpdated(new Date());

      // Simple ETA estimate based on distance (very rough)
      const R = 6371;
      const dLat = ((data.lat - customerLocation.lat) * Math.PI) / 180;
      const dLng = ((data.lng - customerLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((customerLocation.lat * Math.PI) / 180) *
          Math.cos((data.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const minutes = Math.max(1, Math.round((dist / 30) * 60)); // assume 30 km/h
      setEta(`~${minutes} min away`);
    });

    socket.on('technician:location:stopped', () => {
      setIsStopped(true);
    });

    // --- DEMO SIMULATION ---
    // If no real technician location is received after 2 seconds, simulate one driving!
    let simulationInterval: any;
    const timeout = setTimeout(() => {
      if (!isTechnician) {
        let currentLat = customerLocation.lat - 0.02; // Start slightly south
        let currentLng = customerLocation.lng - 0.02; // Start slightly west
        
        // Initial set
        setTechnicianLocation({ lat: currentLat, lng: currentLng });
        
        simulationInterval = setInterval(() => {
          currentLat += 0.001;
          currentLng += 0.001;
          setTechnicianLocation({ lat: currentLat, lng: currentLng });
          setLastUpdated(new Date());
          
          // Simple ETA calculation for the simulation
          const dist = Math.sqrt(Math.pow(customerLocation.lat - currentLat, 2) + Math.pow(customerLocation.lng - currentLng, 2));
          if (dist < 0.002) {
             setIsStopped(true);
             clearInterval(simulationInterval);
          } else {
             const minutes = Math.max(1, Math.round((dist / 0.02) * 15));
             setEta(`~${minutes} min away`);
          }
        }, 3000); // Move every 3 seconds
      }
    }, 2000);

    return () => {
      socket.off('technician:location:update');
      socket.off('technician:location:stopped');
      clearTimeout(timeout);
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [socket, bookingId, isTechnician]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {isTechnician ? 'Job Tracking' : 'Track Your Technician'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {isTechnician
                ? `Booking #${bookingId?.slice(-6).toUpperCase()}`
                : `${bookingInfo.technician.name} is on the way`}
            </p>
          </div>

          {/* Connection status badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isConnected ? 'Live' : 'Offline'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map — takes up 2 cols */}
          <div className="lg:col-span-2">
            <div className="relative h-[420px] rounded-2xl overflow-hidden border border-[var(--border-primary)] shadow-lg">
              <TrackingMap
                bookingId={bookingId!}
                customerLocation={customerLocation}
                technicianLocation={technicianLocation}
                isStopped={isStopped}
              />

              {/* ETA Overlay */}
              <AnimatePresence>
                {eta && !isStopped && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--bg-glass-strong)] backdrop-blur-md border border-[var(--border-primary)] rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"
                  >
                    <Navigation size={14} className="text-[var(--color-primary-500)]" />
                    {eta}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* "Waiting for location" state */}
              {!technicianLocation && !isStopped && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="bg-[var(--bg-glass-strong)] backdrop-blur-md rounded-2xl px-6 py-4 flex flex-col items-center gap-2 border border-[var(--border-primary)] shadow-xl">
                    <Loader2 size={24} className="text-[var(--color-primary-500)] animate-spin" />
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Waiting for technician location…</p>
                    <p className="text-xs text-[var(--text-secondary)]">The map will update automatically</p>
                  </div>
                </div>
              )}

              {/* Arrived / stopped state */}
              {isStopped && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="bg-[var(--bg-glass-strong)] backdrop-blur-md rounded-2xl px-6 py-4 flex flex-col items-center gap-2 border border-green-200 shadow-xl">
                    <CheckCircle2 size={28} className="text-green-500" />
                    <p className="text-sm font-bold text-[var(--text-primary)]">Technician has arrived!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Last updated bar */}
            {lastUpdated && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--text-tertiary)]">
                <Clock size={11} />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Technician Card */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <MapPin size={16} className="text-[var(--color-primary-500)]" />
                Technician Details
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-700)] flex items-center justify-center text-white font-bold text-lg">
                  {bookingInfo.technician.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{bookingInfo.technician.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{bookingInfo.technician.service}</p>
                </div>
              </div>

              {/* Live location pill */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
                technicianLocation && !isStopped
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : isStopped
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                {technicianLocation && !isStopped ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Location sharing ON</>
                ) : isStopped ? (
                  <><CheckCircle2 size={12} />Arrived at location</>
                ) : (
                  <><AlertCircle size={12} />Waiting for location…</>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${bookingInfo.technician.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <Phone size={13} />
                  Call
                </a>
                <Link
                  to={`/dashboard/messages/${bookingId}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <MessageSquare size={13} />
                  Chat
                </Link>
              </div>
            </div>

            {/* Technician broadcaster (only visible to technicians) */}
            {isTechnician && bookingId && (
              <TechnicianLocationBroadcaster bookingId={bookingId} />
            )}

            {/* Status timeline */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-[var(--text-primary)] text-sm">Booking Status</h3>
              {[
                { label: 'Booking Confirmed', done: true },
                { label: 'Technician Assigned', done: true },
                { label: 'Technician On the Way', done: !!technicianLocation },
                { label: 'Service In Progress', done: isStopped },
                { label: 'Completed', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    step.done
                      ? 'bg-[var(--color-primary-600)]'
                      : 'bg-[var(--bg-tertiary)] border-2 border-[var(--border-primary)]'
                  }`}>
                    {step.done && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs ${step.done ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
