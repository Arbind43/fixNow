import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Wallet, Banknote, ShieldCheck, Tag, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, Button, Input } from '../../components/ui';
import { showToast } from '../../components/ui/Toast';

declare global { interface Window { Razorpay: any; } }

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (!bookingId) return;
    axios.get(`/api/bookings/${bookingId}`)
      .then(res => setBooking(res.data.data))
      .catch(() => showToast.error('Failed to load booking details.'))
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  const basePrice = booking?.totalAmount || 0;
  const discount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, basePrice - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    try {
      const res = await axios.post('/api/coupons/validate', {
        code: couponCode,
        orderValue: basePrice
      });
      if (res.data.success) {
        setAppliedCoupon(res.data.data);
        showToast.success(`Coupon applied! Saved ₹${res.data.data.discountAmount}`);
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handlePayment = async () => {
    if (!bookingId) return;
    setIsProcessing(true);
    try {
      await loadRazorpayScript();
      const orderRes = await axios.post('/api/payments/create-order', {
        bookingId,
        amount: finalTotal,
      });
      const { orderId, amount, currency, keyId, isMock } = orderRes.data.data;

      if (isMock) {
        await axios.post('/api/payments/verify', {
          razorpay_order_id:   orderId,
          razorpay_payment_id: 'mock_payment_id',
          razorpay_signature:  'mock_signature',
          bookingId,
        });
        showToast.success('🎉 Payment successful! Booking confirmed.');
        navigate('/dashboard/payment-success', { state: { bookingId } });
        return;
      }

      const options = {
        key: keyId, amount, currency,
        name: 'FixNow Services',
        description: `Booking ${bookingId}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await axios.post('/api/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId,
            });
            showToast.success('🎉 Payment successful! Booking confirmed.');
            navigate('/dashboard/payment-success', { state: { bookingId } });
          } catch { showToast.error('Payment verification failed.'); }
        },
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      </DashboardLayout>
    );
  }

  const serviceName   = booking?.service?.name || 'Service';
  const techName      = booking?.technician?.user?.name || 'Auto-assigned';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Complete Payment</h1>
          <p className="text-[var(--text-secondary)] mt-1">Securely pay for your service</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Payment Method</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${paymentMethod === 'razorpay' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-[var(--border-primary)] bg-[var(--bg-primary)] hover:border-amber-300'}`}
              >
                <CreditCard size={28} className={paymentMethod === 'razorpay' ? 'text-amber-600' : 'text-[var(--text-secondary)]'} />
                <span className={`font-semibold ${paymentMethod === 'razorpay' ? 'text-amber-700 dark:text-amber-400' : 'text-[var(--text-primary)]'}`}>Pay Online (Razorpay)</span>
                <span className="text-xs text-[var(--text-tertiary)]">Card, UPI, NetBanking</span>
              </button>

              <button 
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-[var(--border-primary)] bg-[var(--bg-primary)] hover:border-amber-300'}`}
              >
                <Banknote size={28} className={paymentMethod === 'cod' ? 'text-amber-600' : 'text-[var(--text-secondary)]'} />
                <span className={`font-semibold ${paymentMethod === 'cod' ? 'text-amber-700 dark:text-amber-400' : 'text-[var(--text-primary)]'}`}>Pay after service</span>
                <span className="text-xs text-[var(--text-tertiary)]">Cash on delivery</span>
              </button>
            </div>

            {paymentMethod === 'razorpay' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-400">
                🔒 You'll be redirected to Razorpay's secure checkout to complete your payment.
              </div>
            )}
          </div>

          {/* Order Summary & Coupon */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Service</span>
                  <span className="font-semibold text-[var(--text-primary)]">{serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Technician</span>
                  <span className="font-semibold text-amber-500">{techName}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border-primary)]">
                  <span className="text-[var(--text-secondary)]">Total Charge</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{basePrice}</span>
                </div>
                
                {/* Coupon Application */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-500 p-3 rounded-lg border border-emerald-500/20">
                      <div className="flex items-center gap-2 font-semibold">
                        <Tag size={16} /> {appliedCoupon.code}
                      </div>
                      <div className="flex items-center gap-3">
                        <span>-₹{appliedCoupon.discountAmount}</span>
                        <button onClick={handleRemoveCoupon} className="hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Coupon code" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || isApplyingCoupon}
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[var(--border-primary)] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--text-primary)]">Total</span>
                  <span className="text-2xl font-bold text-amber-500">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 p-3 rounded-lg mb-6">
                <ShieldCheck size={18} />
                <span>100% Secure Payment via Razorpay</span>
              </div>

              <Button 
                fullWidth 
                size="lg" 
                onClick={handlePayment} 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${finalTotal.toLocaleString()}`}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
