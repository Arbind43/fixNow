import { motion } from 'framer-motion';
import { Shield, Users, Zap, Target, Heart, Award, Sparkles, ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp  = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } };

const values = [
  { icon: Shield, title: 'Trust & Safety',   desc: 'Every technician is background-verified, skill-tested, and continuously rated by real customers.',                    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'      },
  { icon: Zap,    title: 'Speed',             desc: 'AI-powered matching gets you a verified technician at your door in under 30 minutes.',                                color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'    },
  { icon: Heart,  title: 'Customer First',    desc: '100% satisfaction guarantee. Not happy? Get a full refund or free re-service — no questions asked.',                  color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'      },
  { icon: Globe,  title: 'Accessibility',     desc: 'Available across 50+ cities. Our app supports multiple languages to serve every Indian household.',                    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

const milestones = [
  { year: '2024', title: 'Founded',       desc: 'FixNow launched in Bangalore with 50 technicians.',                                   color: 'from-blue-500 to-indigo-600'   },
  { year: '2025', title: 'AI Integration', desc: 'Launched Gemini-powered diagnostics and smart matching.',                             color: 'from-amber-500 to-orange-600'  },
  { year: '2026', title: '50K+ Customers', desc: 'Expanded to 50+ cities with 10,000 verified technicians.',                           color: 'from-emerald-500 to-teal-600'  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 text-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-app relative">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-300 text-sm font-medium mb-6 backdrop-blur-md">
              <Sparkles size={13} className="text-amber-400" /> Our Story
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-5">
              Building India's Most<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Trusted</span>{' '}Service Platform
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              We combine artificial intelligence with expert craftsmanship to deliver home services that are fast, reliable, and transparent.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 container-app">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold mb-5">
              <Target size={12} /> Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">
              Every home deserves<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">expert care.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              India has millions of skilled technicians who struggle to find steady work, and millions of homeowners who can't find reliable help. FixNow bridges this gap with technology.
            </p>
            <ul className="space-y-4">
              {[
                'Create dignified jobs for 100,000+ technicians',
                'Serve 10 million households by 2028',
                'Make AI-powered diagnostics accessible to every Indian home',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="grid grid-cols-2 gap-4">
            {[
              { value: '10K+', label: 'Technicians',  icon: Users,  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'      },
              { value: '50K+', label: 'Customers',    icon: Heart,  color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'      },
              { value: '50+',  label: 'Cities',       icon: Globe,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { value: '4.8★', label: 'App Rating',   icon: Award,  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'    },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${s.bg} text-center`}
              >
                <s.icon size={22} className={`${s.color} mx-auto mb-3`} />
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="container-app">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-semibold mb-4">
              <Heart size={12} className="text-rose-400" /> What We Stand For
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Our Core <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Values</span>
            </h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(v => (
              <motion.div key={v.title} variants={fadeUp}
                className={`group p-6 rounded-2xl border ${v.bg} hover:scale-105 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl ${v.bg} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <v.icon size={22} className={v.color} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20">
        <div className="container-app max-w-2xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Our <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Journey</span>
            </h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/50 to-transparent" />
            {milestones.map((m, i) => (
              <motion.div key={m.year} variants={fadeUp} className="relative flex gap-8 mb-12 last:mb-0">
                <div className={`relative z-10 shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-extrabold text-xs shadow-xl`}>
                  {m.year}
                </div>
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-white">{m.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="container-app">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 p-12 text-center"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to experience the future of home services?</h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">Join 50,000+ happy customers who trust FixNow for all their repair needs.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-500/20">
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/services" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/15 transition-all">
                  Browse Services
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
