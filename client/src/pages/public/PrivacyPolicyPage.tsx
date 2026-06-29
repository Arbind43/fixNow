import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Bell, Globe, FileText, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const sections = [
  { icon: Database, title: '1. Information We Collect', content: 'We collect information you provide directly to us, such as when you create an account, book a service, contact support, or communicate with us. This includes your name, email, phone number, address, and payment details. We also automatically collect device information, IP addresses, and usage data to improve our services.' },
  { icon: Eye, title: '2. How We Use Your Information', content: 'We use your information to provide and improve our services, process bookings and payments, send service updates and notifications, personalize your experience, ensure platform safety, comply with legal obligations, and communicate promotions (with your consent). AI diagnostic data is used solely for service analysis and is never sold to third parties.' },
  { icon: Lock, title: '3. Data Security', content: 'We implement industry-standard security measures including SSL/TLS encryption, secure payment processing through Razorpay, regular security audits, and strict access controls. Your payment card details are never stored on our servers. All technician verification data is encrypted at rest and in transit.' },
  { icon: Globe, title: '4. Data Sharing', content: 'We share your information only with: technicians assigned to your bookings (limited to service-relevant details), payment processors, cloud infrastructure providers, and law enforcement when legally required. We never sell your personal data to advertisers or third-party marketers.' },
  { icon: Bell, title: '5. Your Rights', content: 'You have the right to access, correct, or delete your personal data at any time. You can opt out of marketing communications, request a copy of your data, or ask us to stop processing your information. Contact us at privacy@fixnowai.com for any data-related requests.' },
  { icon: FileText, title: '6. Cookies & Tracking', content: 'We use essential cookies for authentication and session management, analytics cookies (Google Analytics) to understand usage patterns, and preference cookies to remember your settings. You can manage cookie preferences in your browser settings. We do not use advertising trackers.' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-[var(--color-primary-900)] via-[var(--color-primary-800)] to-purple-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[120px]" />
        </div>
        <div className="container-app relative text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-medium mb-6">
              <Shield size={14} /> Your Privacy Matters
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
              Privacy Policy
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-blue-100/70 text-lg">
              Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-[var(--bg-primary)]">
        <div className="container-app max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 p-6 rounded-[var(--radius-2xl)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)] border border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)]">
            <p className="text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)] font-medium leading-relaxed">
              <Sparkles size={16} className="inline mr-2 -mt-0.5" />
              At FixNow AI, we are committed to protecting your privacy. This policy explains what data we collect, how we use it, and how we keep it safe. We believe in transparency and your right to control your personal information.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-8">
            {sections.map((s) => (
              <motion.div key={s.title} variants={fadeUp} className="group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] text-[var(--color-primary-500)] shrink-0 mt-1">
                    <s.icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">{s.title}</h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{s.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-16 p-8 rounded-[var(--radius-2xl)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Questions about your privacy?</h3>
            <p className="text-[var(--text-secondary)] mb-4">Contact our Data Protection Officer at <a href="mailto:privacy@fixnowai.com" className="text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-semibold hover:underline">privacy@fixnowai.com</a></p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
