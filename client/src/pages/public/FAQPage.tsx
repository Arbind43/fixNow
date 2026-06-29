import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Search, MessageSquare, Sparkles, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const faqCategories = [
  {
    name: 'Getting Started',
    faqs: [
      { q: 'How do I book a service on FixNow?', a: 'Simply search for the service you need, select a time slot, and confirm your booking. Our AI will match you with the best available technician in your area.' },
      { q: 'Is FixNow available in my city?', a: 'FixNow is currently available in 50+ cities across India, including all major metros and Tier-2 cities. Check the app for availability in your area.' },
      { q: 'Do I need to create an account?', a: 'Yes, a quick account setup helps us personalize your experience, track bookings, and ensure safety. You can sign up with email, phone, or Google.' },
    ],
  },
  {
    name: 'Technicians & Quality',
    faqs: [
      { q: 'How does FixNow verify technicians?', a: 'Every technician goes through Aadhaar verification, skill assessment, background check, and certificate validation. Only those who meet our quality standards are onboarded.' },
      { q: 'Can I choose a specific technician?', a: 'Yes! You can view technician profiles with ratings, reviews, and experience before booking. You can also save favorites for future bookings.' },
      { q: 'What if the technician doesn\'t show up?', a: 'If a technician cancels or fails to arrive, we\'ll immediately reassign another verified technician. You\'ll also receive a compensation credit in your FixNow wallet.' },
    ],
  },
  {
    name: 'AI & Technology',
    faqs: [
      { q: 'How does the AI diagnosis work?', a: 'Our Gemini-powered AI analyzes your description or uploaded photos to identify potential issues, estimate repair costs, and suggest the right service category — all before a technician arrives.' },
      { q: 'Can I upload photos of the problem?', a: 'Absolutely! Our AI can analyze images of broken appliances, plumbing issues, electrical problems, and more to give you an instant preliminary diagnosis.' },
      { q: 'Is my data safe?', a: 'We follow industry-standard encryption and privacy practices. Your photos and chat data are only used for diagnosis purposes and are never shared with third parties.' },
    ],
  },
  {
    name: 'Payments & Refunds',
    faqs: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards, FixNow Wallet, and cash on delivery. All online payments are secured through Razorpay.' },
      { q: 'What is FixNow\'s refund policy?', a: 'We offer a 100% satisfaction guarantee. If you\'re not happy with the service, file a complaint within 48 hours for a full refund or free re-service.' },
      { q: 'Are there any hidden charges?', a: 'Never. The price shown at booking is what you pay. Any additional parts or work will always be discussed and approved by you before proceeding.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--bg-elevated)] overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--bg-tertiary)]/50 transition-colors gap-4">
        <span className="font-semibold text-[var(--text-primary)]">{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-[var(--text-tertiary)]">
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="px-5 pb-5 text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-primary)] pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const currentFaqs = faqCategories[activeCategory].faqs.filter(
    (f) => !searchQuery || f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-28 md:py-36 bg-gradient-to-br from-[var(--color-primary-900)] via-[var(--color-primary-800)] to-purple-900 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[120px]" />
        </div>
        <div className="container-app relative text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-200 text-sm font-medium mb-6">
              <HelpCircle size={14} /> Help Center
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">help you?</span>
            </motion.h1>
            <motion.div variants={fadeUp} className="mt-8 max-w-lg mx-auto relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full pl-12 pr-4 py-4 rounded-[var(--radius-2xl)] bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 focus:outline-none focus:border-white/40 focus:ring-4 focus:ring-white/10 backdrop-blur-sm transition-all text-lg"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 bg-[var(--bg-primary)]">
        <div className="container-app max-w-4xl">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {faqCategories.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === i
                    ? 'bg-[var(--color-primary-600)] text-white shadow-[var(--shadow-md)]'
                    : 'bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--color-primary-300)] dark:hover:border-[var(--color-primary-700)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <motion.div key={activeCategory} initial="hidden" animate="visible" variants={stagger} className="space-y-3">
            {currentFaqs.length > 0 ? (
              currentFaqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)
            ) : (
              <div className="text-center py-16">
                <HelpCircle size={48} className="text-[var(--text-tertiary)] mx-auto mb-4" />
                <p className="text-lg text-[var(--text-secondary)]">No results found for "{searchQuery}"</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">Try a different search term or browse the categories above.</p>
              </div>
            )}
          </motion.div>

          {/* Still need help CTA */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-16 p-8 md:p-12 rounded-[var(--radius-2xl)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center">
            <MessageSquare size={36} className="text-[var(--color-primary-500)] mx-auto mb-4" />
            <h3 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Still have questions?</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">Our support team is available 7 days a week to help you with any issues.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white font-bold shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)] transition-all">
                <Phone size={18} /> Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
