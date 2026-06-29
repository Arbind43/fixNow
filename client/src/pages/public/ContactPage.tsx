import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const contactMethods = [
  { icon: Mail,    title: 'Email Us',       value: 'support@fixnowai.com',    desc: 'Reply within 2 hours',          href: 'mailto:support@fixnowai.com', color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'      },
  { icon: Phone,   title: 'Call Us',        value: '+91 98765 43210',          desc: 'Mon–Sat, 8am–10pm IST',         href: 'tel:+919876543210',           color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: MapPin,  title: 'Visit Us',       value: 'HSR Layout, Bangalore',    desc: '560102, Karnataka, India',      href: '#',                           color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'    },
  { icon: Clock,   title: 'Response Time',  value: 'Under 30 minutes',        desc: 'For emergency requests',        href: '#',                           color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20'  },
];

const inputCls = "w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all text-sm";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] overflow-hidden">
      {/* Hero */}
      <div className="relative pt-32 pb-20 text-center">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="container-app relative">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-300 text-sm font-medium mb-6 backdrop-blur-md">
              <MessageSquare size={13} className="text-amber-400" /> Get In Touch
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-5">
              We'd love to <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">hear from you</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
              Feedback, questions, or partnership inquiries — our team is ready to help.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="container-app pb-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {contactMethods.map(m => (
            <motion.a key={m.title} href={m.href} variants={fadeUp}
              className={`group flex flex-col items-center text-center p-6 rounded-2xl border ${m.bg} hover:scale-105 transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center mb-4 border ${m.bg}`}>
                <m.icon size={22} className={m.color} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{m.title}</h3>
              <p className={`text-sm font-semibold ${m.color} mb-1`}>{m.value}</p>
              <p className="text-xs text-white/40">{m.desc}</p>
            </motion.a>
          ))}
        </motion.div>

        {/* Contact Form Grid */}
        <div className="grid md:grid-cols-5 gap-12 max-w-4xl mx-auto">
          {/* Left Info */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-2 space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold mb-4">
                <Sparkles size={12} /> Quick Response
              </span>
              <h2 className="text-3xl font-extrabold text-white mb-3">
                Send us a<br />
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">message</span>
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Our team responds within 24 hours. For urgent matters, call us directly.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h4 className="font-bold text-white mb-3 text-sm">Office Hours</h4>
              <div className="space-y-2 text-xs text-white/50">
                <p>Monday – Saturday: 8:00 AM – 10:00 PM</p>
                <p>Sunday: 9:00 AM – 6:00 PM</p>
                <p className="text-amber-400 font-semibold pt-1">Emergency services available 24/7</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Subject</label>
                <select name="subject" value={formData.subject} onChange={handleChange} required className={`${inputCls} appearance-none`}>
                  <option value="" className="bg-[#1a1a2e]">Select a topic</option>
                  <option value="general" className="bg-[#1a1a2e]">General Inquiry</option>
                  <option value="support" className="bg-[#1a1a2e]">Technical Support</option>
                  <option value="billing" className="bg-[#1a1a2e]">Billing Issue</option>
                  <option value="partnership" className="bg-[#1a1a2e]">Partnership</option>
                  <option value="feedback" className="bg-[#1a1a2e]">Feedback</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Tell us how we can help..." className={`${inputCls} resize-none`} />
              </div>
              <button type="submit" disabled={sent}
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-500/20"
              >
                {sent ? '✓ Message Sent!' : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
