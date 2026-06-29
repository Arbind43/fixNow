import { motion } from 'framer-motion';
import { FileText, UserCheck, CreditCard, AlertTriangle, Scale, ShieldCheck, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const sections = [
  { icon: UserCheck, title: '1. Services Provided', content: 'FixNow AI is a technology platform that connects customers seeking home repair and maintenance services with independent, verified technicians. We facilitate the booking, tracking, payment, and review process. FixNow does not directly employ technicians — they operate as independent service providers on our platform.' },
  { icon: UserCheck, title: '2. User Responsibilities', content: 'Users must provide accurate personal and contact information. You are responsible for maintaining the confidentiality of your account credentials. When booking a service, you agree to be present (or designate a representative) at the service location. Misuse of the platform, including fraudulent bookings, harassment of technicians, or providing false reviews, will result in account suspension.' },
  { icon: CreditCard, title: '3. Payments & Pricing', content: 'All prices shown at the time of booking are final unless additional work is explicitly agreed upon by you. Payments are processed securely through Razorpay. FixNow wallet credits are non-transferable and expire 12 months after issuance. Refunds are processed within 5-7 business days to the original payment method.' },
  { icon: AlertTriangle, title: '4. Cancellation & Refund Policy', content: 'You may cancel a booking free of charge up to 30 minutes before the scheduled time. Late cancellations may incur a fee of up to 20% of the booking value. If a technician cancels, you will receive a full refund and a compensation credit. Our 100% satisfaction guarantee covers re-service or full refund for quality issues reported within 48 hours.' },
  { icon: Scale, title: '5. Limitation of Liability', content: 'FixNow AI is a marketplace platform and is not directly liable for the quality of work performed by technicians, though we take extensive measures to verify and monitor service quality. Our total liability in any claim shall not exceed the amount paid for the specific service in question. We are not liable for indirect, incidental, or consequential damages.' },
  { icon: ShieldCheck, title: '6. Dispute Resolution', content: 'Any disputes arising from the use of our services shall first be addressed through our internal complaint resolution system. If unresolved within 30 days, disputes shall be subject to arbitration under the Arbitration and Conciliation Act, 1996, with Bangalore, India as the seat of arbitration. These terms are governed by the laws of India.' },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-[var(--color-primary-900)] via-[var(--color-primary-800)] to-purple-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[120px]" />
        </div>
        <div className="container-app relative text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-medium mb-6">
              <FileText size={14} /> Legal
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
              Terms & Conditions
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
              Welcome to FixNow AI. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
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
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Have questions about these terms?</h3>
            <p className="text-[var(--text-secondary)]">Contact our legal team at <a href="mailto:legal@fixnowai.com" className="text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] font-semibold hover:underline">legal@fixnowai.com</a></p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
