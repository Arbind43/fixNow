import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Input, Button, Card } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, MapPin, CreditCard, CheckCircle2, Loader2,
  Navigation, User, Zap, ShieldCheck
} from 'lucide-react';

declare global {
  interface Window { Razorpay: any; }
}

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const STEPS = ['Schedule', 'Address', 'Review & Pay'];

export default function BookingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const serviceFromState          = location.state?.service;
  const preSelectedTechnician     = location.state?.technician;
  const [service, setService]     = useState<any>(serviceFromState || null);
  const [isFetchingService, setIsFetchingService] = useState(!serviceFromState);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-fetch service if not passed
  useEffect(() => {
    if (serviceFromState) return;
    (async () => {
      try {
        const res = await axios.get('/api/services');
        const services = res.data.data;
        if (services?.length > 0) setService(services[0]);
        else showToast.error('No services available. Please contact support.');
      } catch { showToast.error('Failed to load service details.'); }
      finally { setIsFetchingService(false); }
    })();
  }, [serviceFromState]);

  const [date, setDate]   = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime]   = useState('10:00');
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zipCode: '',
    coordinates: null as [number, number] | null,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating]     = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Pre-fill from saved location
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fixnow_location');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.lat && p.lng) {
          setAddress(prev => ({
            ...prev,
            coordinates: [p.lng, p.lat],
            city:    p.city    || prev.city,
            state:   p.state   || prev.state,
            zipCode: p.pincode || prev.zipCode,
          }));
        }
      }
    } catch {}
  }, []);

  const fetchGeolocation = () => {
    if (!navigator.geolocation) { showToast.error('Geolocation not supported'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let city = '', state = '', zipCode = '';
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: { 'Accept-Language': 'en' }
          });
          const d = await r.json();
          if (d?.address) {
            city    = d.address.city || d.address.town || d.address.state_district || '';
            state   = d.address.state || '';
            zipCode = d.address.postcode || '';
          }
          // Persist to localStorage
          localStorage.setItem('fixnow_location', JSON.stringify({ lat, lng, city, state, pincode: zipCode }));
        } catch { console.warn('Reverse geocoding failed'); }
        setAddress(prev => ({
          ...prev, coordinates: [lng, lat],
          city:    city    || prev.city,
          state:   state   || prev.state,
          zipCode: zipCode || prev.zipCode,
        }));
        setIsLocating(false);
        showToast.success('Location & address auto-filled!');
      },
      () => { setIsLocating(false); showToast.error('Location access denied.'); }
    );
  };

  // Step 1 → 2
  const handleScheduleNext = () => {
    if (!date || !time) { showToast.error('Please select a date and time.'); return; }
    setCurrentStep(1);
  };

  // Step 2 → 3
  const handleAddressNext = () => {
    if (!address.street || !address.city || !address.zipCode) {
      showToast.error('Please fill Street, City and PIN Code.');
      return;
    }
    setCurrentStep(2);
  };

  // Final: create booking + payment
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // 1️⃣ Create booking
      let bookingRes;
      try {
        bookingRes = await axios.post('/api/bookings', {
          serviceId:     service._id,
          technicianId:  preSelectedTechnician?._id,
          scheduledDate: new Date(`${date}T${time}`).toISOString(),
          address: {
            street:      address.street,
            city:        address.city,
            state:       address.state,
            zipCode:     address.zipCode,
            coordinates: address.coordinates || undefined,
          },
        });
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to create booking.';
        showToast.error(msg);
        setIsProcessing(false);
        return;
      }

      const booking = bookingRes.data.data;
      setCreatedBooking(booking);
      const realBookingId = booking._id;

      // 2️⃣ Load Razorpay SDK
      await loadRazorpayScript();

      // 3️⃣ Create payment order
      let orderRes;
      try {
        orderRes = await axios.post('/api/payments/create-order', {
          bookingId: realBookingId,
          amount:    booking.totalAmount,
        });
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to create payment order.';
        showToast.error(msg);
        setIsProcessing(false);
        return;
      }

      const { orderId, amount, currency, keyId, isMock } = orderRes.data.data;

      // 4️⃣ Mock / Test mode — skip real Razorpay modal
      if (isMock) {
        await axios.post('/api/payments/verify', {
          razorpay_order_id:   orderId,
          razorpay_payment_id: 'mock_payment_id',
          razorpay_signature:  'mock_signature',
          bookingId:           realBookingId,
        });
        showToast.success('🎉 Booking confirmed & payment processed!');
        navigate('/dashboard/payment-success', { state: { bookingId: realBookingId } });
        return;
      }

      // 5️⃣ Real Razorpay modal
      const options = {
        key:         keyId,
        amount,
        currency,
        name:        'FixNow Services',
        description: `Payment for ${service.name}`,
        order_id:    orderId,
        handler: async (response: any) => {
          try {
            await axios.post('/api/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId:           realBookingId,
            });
            showToast.success('🎉 Payment successful! Booking confirmed.');
            navigate('/dashboard/payment-success', { state: { bookingId: realBookingId } });
          } catch { showToast.error('Payment verification failed.'); }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#f59e0b' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r: any) => showToast.error('Payment failed: ' + r.error.description));
      rzp.open();
    } catch (err: any) {
      showToast.error(err.message || 'Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isFetchingService || !service) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 size={32} className="text-[var(--color-primary-500)] animate-spin" />
          <p className="text-[var(--text-secondary)]">
            {isFetchingService ? 'Loading service details…' : 'No services available.'}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const actualPrice = preSelectedTechnician?.pricing?.baseCharge
    || preSelectedTechnician?.hourlyRate
    || service.basePrice;
  const gst         = Math.round(actualPrice * 0.18);
  const platformFee = 49;
  const total       = actualPrice + platformFee + gst;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-2 sm:px-0">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Complete Your Booking</h1>
        <p className="text-[var(--text-secondary)] mb-8 text-sm">
          {service.name}{preSelectedTechnician ? ` · ${preSelectedTechnician.user?.name}` : ''}
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < currentStep ? 'bg-emerald-500 text-white' :
                i === currentStep ? 'bg-amber-500 text-white' :
                'bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border-primary)]'
              }`}>
                {i < currentStep ? <CheckCircle2 size={16}/> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === currentStep ? 'text-amber-500' : 'text-[var(--text-tertiary)]'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 w-8 sm:w-16 rounded ${i < currentStep ? 'bg-emerald-500' : 'bg-[var(--border-primary)]'}`}/>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Steps */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 0 — Schedule */}
            {currentStep === 0 && (
              <Card className="p-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                  <Calendar size={20} className="text-amber-500" /> Schedule Service
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Input
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <Input
                    label="Preferred Time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
                <Button onClick={handleScheduleNext} className="w-full">
                  Continue to Address →
                </Button>
              </Card>
            )}

            {/* STEP 1 — Address */}
            {currentStep === 1 && (
              <Card className="p-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin size={20} className="text-amber-500" /> Service Address
                  </span>
                  <button
                    onClick={fetchGeolocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all"
                  >
                    <Navigation size={14} />
                    {isLocating ? 'Detecting…' : 'Auto-detect Location'}
                  </button>
                </h2>

                {address.coordinates && (
                  <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <CheckCircle2 size={16} /> GPS acquired — nearest technician will be auto-assigned!
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <Input
                    label="Street Address / Flat No."
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="e.g. 42B, Rose Garden Apartments"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="e.g. Ranchi"
                      required
                    />
                    <Input
                      label="State"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="e.g. Jharkhand"
                    />
                  </div>
                  <Input
                    label="PIN Code"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    placeholder="e.g. 834001"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(0)} className="flex-1">← Back</Button>
                  <Button onClick={handleAddressNext} className="flex-1">Review & Pay →</Button>
                </div>
              </Card>
            )}

            {/* STEP 2 — Review */}
            {currentStep === 2 && (
              <Card className="p-6 animate-fadeIn">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-amber-500" /> Review Your Booking
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                    <Zap size={20} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Service</p>
                      <p className="font-semibold text-[var(--text-primary)]">{service.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                    <Calendar size={20} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Scheduled</p>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                    <MapPin size={20} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Service Address</p>
                      <p className="font-semibold text-[var(--text-primary)]">{address.street}, {address.city}, {address.zipCode}</p>
                    </div>
                  </div>
                  {preSelectedTechnician && (
                    <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                      <User size={20} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="text-xs text-[var(--text-tertiary)]">Technician</p>
                        <p className="font-semibold text-[var(--text-primary)]">{preSelectedTechnician.user?.name}</p>
                      </div>
                    </div>
                  )}
                  {!preSelectedTechnician && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-600 dark:text-amber-400">
                      🎯 The nearest available technician will be auto-assigned when you pay.
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">← Back</Button>
                  <Button onClick={handlePayment} isLoading={isProcessing} className="flex-1 flex items-center justify-center gap-2">
                    {!isProcessing && <CreditCard size={16} />}
                    Pay ₹{total.toLocaleString()} Securely
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5 border-b border-[var(--border-primary)] pb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-5">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-0.5">Service</p>
                  <p className="font-semibold text-[var(--text-primary)] text-sm">{service.name}</p>
                </div>
                {preSelectedTechnician && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-0.5">Technician</p>
                    <p className="font-semibold text-amber-500 text-sm flex items-center gap-1">
                      <CheckCircle2 size={13}/> {preSelectedTechnician.user?.name}
                    </p>
                  </div>
                )}
                {date && time && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-0.5">Scheduled</p>
                    <p className="font-semibold text-[var(--text-primary)] text-sm">
                      {new Date(date).toLocaleDateString()} at {time}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--border-primary)] pt-4 space-y-2 text-sm mb-4">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Service Charge</span><span>₹{actualPrice}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Platform Fee</span><span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>GST (18%)</span><span>₹{gst}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[var(--border-primary)]">
                <span className="font-bold text-[var(--text-primary)]">Total</span>
                <span className="text-2xl font-extrabold text-amber-500">₹{total.toLocaleString()}</span>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] p-3 rounded-xl">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>100% secure payments. Powered by Razorpay.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
