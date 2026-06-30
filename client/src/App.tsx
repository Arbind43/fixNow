import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Core layout components load synchronously
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';

// Lazy load pages for Code Splitting
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const SearchPage = lazy(() => import('@/pages/public/SearchPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ServicesPage = lazy(() => import('@/pages/public/ServicesPage'));
const ServiceDetailsPage = lazy(() => import('@/pages/public/ServiceDetailsPage'));
const CategoryPage = lazy(() => import('@/pages/public/CategoryPage'));
const TechnicianProfilePage = lazy(() => import('@/pages/public/TechnicianProfilePage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const FAQPage = lazy(() => import('@/pages/public/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage'));
const TermsAndConditionsPage = lazy(() => import('@/pages/public/TermsAndConditionsPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

const CustomerDashboard = lazy(() => import('@/pages/dashboard/CustomerDashboard'));
const TechnicianDashboard = lazy(() => import('@/pages/dashboard/TechnicianDashboard'));
const BookingPage = lazy(() => import('@/pages/dashboard/BookingPage'));
const PaymentSuccessPage = lazy(() => import('@/pages/dashboard/PaymentSuccessPage'));
const CustomerBookingsPage = lazy(() => import('@/pages/dashboard/CustomerBookingsPage'));
const ChatPage = lazy(() => import('@/pages/dashboard/ChatPage'));
const VideoCallPage = lazy(() => import('@/pages/dashboard/VideoCallPage'));
const CheckoutPage = lazy(() => import('@/pages/dashboard/CheckoutPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));
const NotificationsPage = lazy(() => import('@/pages/dashboard/NotificationsPage'));
const ComplaintPage = lazy(() => import('@/pages/dashboard/ComplaintPage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));
const WalletPage = lazy(() => import('@/pages/dashboard/WalletPage'));
const InvoicePage = lazy(() => import('@/pages/dashboard/InvoicePage'));
const TrackingPage = lazy(() => import('@/pages/dashboard/TrackingPage'));
const MessagesPage = lazy(() => import('@/pages/dashboard/MessagesPage'));
const TechnicianRegisterPage = lazy(() => import('@/pages/auth/TechnicianRegisterPage'));
const TechnicianJobRequestsPage = lazy(() => import('@/pages/dashboard/TechnicianJobRequestsPage'));
const TechnicianSchedulePage = lazy(() => import('@/pages/dashboard/TechnicianSchedulePage'));

// Admin Pages
const AdminOverview             = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminUserManagement       = lazy(() => import('@/pages/admin/UserManagement'));
const ProfessionalVerification  = lazy(() => import('@/pages/admin/ProfessionalVerification'));
const ProfessionalManagement    = lazy(() => import('@/pages/admin/ProfessionalManagement'));
const AdminBookingManagement    = lazy(() => import('@/pages/admin/BookingManagement'));
const AdminComplaintManagement  = lazy(() => import('@/pages/admin/ComplaintManagement'));
const AdminReviewsManagement    = lazy(() => import('@/pages/admin/ReviewsManagement'));
const AdminPaymentManagement    = lazy(() => import('@/pages/admin/PaymentManagement'));
const AdminServicesManagement   = lazy(() => import('@/pages/admin/ServicesManagement'));
const AdminNotificationsCenter  = lazy(() => import('@/pages/admin/NotificationsCenter'));
const AdminReportsPage          = lazy(() => import('@/pages/admin/ReportsPage'));
const AdminPlatformSettings     = lazy(() => import('@/pages/admin/PlatformSettings'));
const AdminAuditLogs            = lazy(() => import('@/pages/admin/AuditLogs'));

// Guards
import { ProtectedRoute, RoleRoute } from '@/components/layout/ProtectedRoutes';

// Dummy wrapper for pages that need navbar + footer
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Global loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
    <div className="w-12 h-12 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Public Routes */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
      <Route path="/services/:slug" element={<PublicLayout><ServiceDetailsPage /></PublicLayout>} />
      <Route path="/category/:categorySlug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
      <Route path="/technicians/:id" element={<PublicLayout><TechnicianProfilePage /></PublicLayout>} />
      <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
      <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
      <Route path="/terms-and-conditions" element={<PublicLayout><TermsAndConditionsPage /></PublicLayout>} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/register/technician" element={<TechnicianRegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Role Specific Dashboards */}
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/dashboard/bookings" element={<CustomerBookingsPage />} />
        <Route path="/dashboard/book-service" element={<BookingPage />} />
        <Route path="/booking/:serviceId" element={<BookingPage />} />
        <Route path="/dashboard/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/dashboard/checkout/:bookingId" element={<CheckoutPage />} />
        <Route path="/dashboard/messages" element={<MessagesPage />} />
        <Route path="/dashboard/messages/:bookingId" element={<ChatPage />} />
        <Route path="/dashboard/video/:bookingId" element={<VideoCallPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/notifications" element={<NotificationsPage />} />
        <Route path="/dashboard/wallet" element={<WalletPage />} />
        <Route path="/dashboard/complaints" element={<ComplaintPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/invoices/:bookingId" element={<InvoicePage />} />
        <Route path="/dashboard/track/:bookingId" element={<TrackingPage />} />
        
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        <Route path="/dashboard/requests" element={<TechnicianJobRequestsPage />} />
        <Route path="/dashboard/schedule" element={<TechnicianSchedulePage />} />

        {/* Admin Routes — role-guarded */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin"               element={<AdminOverview />} />
          <Route path="/admin/users"         element={<AdminUserManagement />} />
          <Route path="/admin/verification"  element={<ProfessionalVerification />} />
          <Route path="/admin/professionals" element={<ProfessionalManagement />} />
          <Route path="/admin/bookings"      element={<AdminBookingManagement />} />
          <Route path="/admin/complaints"    element={<AdminComplaintManagement />} />
          <Route path="/admin/reviews"       element={<AdminReviewsManagement />} />
          <Route path="/admin/payments"      element={<AdminPaymentManagement />} />
          <Route path="/admin/services"      element={<AdminServicesManagement />} />
          <Route path="/admin/notifications" element={<AdminNotificationsCenter />} />
          <Route path="/admin/reports"       element={<AdminReportsPage />} />
          <Route path="/admin/settings"      element={<AdminPlatformSettings />} />
          <Route path="/admin/audit-logs"    element={<AdminAuditLogs />} />
        </Route>
      </Route>
      
      {/* Fallback 404 */}
      <Route path="*" element={
        <PublicLayout>
          <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-4">
            <h1 className="text-6xl font-bold text-[var(--color-primary-500)] mb-4">404</h1>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Page Not Found</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>
            <a href="/" className="px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-[var(--radius-lg)] font-medium hover:bg-[var(--color-primary-700)] transition-colors">
              Back to Home
            </a>
          </div>
        </PublicLayout>
      } />
      </Routes>
      </Suspense>
      <AIAssistantWidget />
    </>
  );
}
