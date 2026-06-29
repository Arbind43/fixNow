import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Star, Clock, Zap, Wrench, Droplets, Wind, Hammer,
  Paintbrush, Home, Monitor, Camera, Wifi, Car, Smartphone,
  BatteryCharging, Sparkles, Shield, CheckCircle2, Users,
  ChevronRight, Heart, Target
} from 'lucide-react';

/* ─── EXACT same animation variants as AboutPage ─── */
const fadeUp  = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } };

/* ─── Rotating card colors (same palette as AboutPage values) ─── */
const CARD_COLORS = [
  { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'      },
  { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'    },
  { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'      },
  { color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20'  },
  { color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20'      },
];

/* ─── Category data ─── */
type ServiceItem = { name: string; price: string; duration: string };
type CatDef = { icon: any; tagline: string; desc: string; techCount: number; avgRating: number; completedJobs: number; services: ServiceItem[] };

const allCategories: Record<string, CatDef> = {
  electrician:      { icon: Zap,             tagline: 'Power your home with confidence', desc: 'Professional electrical services by licensed engineers — safe, fast, and reliable.', techCount: 48, avgRating: 4.8, completedJobs: 3120, services: [{ name: 'Wiring & Rewiring', price: '₹499+', duration: '60 min' }, { name: 'Switchboard Installation', price: '₹299+', duration: '45 min' }, { name: 'Fan & Light Fitting', price: '₹149+', duration: '30 min' }, { name: 'Inverter & UPS Setup', price: '₹399+', duration: '60 min' }, { name: 'Short Circuit Repair', price: '₹249+', duration: '40 min' }, { name: 'Earthing Solutions', price: '₹599+', duration: '90 min' }] },
  plumber:          { icon: Droplets,        tagline: 'No drip too small to fix', desc: 'Expert plumbing solutions — from leaks to full bathroom installations.', techCount: 62, avgRating: 4.9, completedJobs: 5410, services: [{ name: 'Pipe Leak Repair', price: '₹199+', duration: '30 min' }, { name: 'Tap & Faucet Install', price: '₹149+', duration: '25 min' }, { name: 'Toilet Repair', price: '₹249+', duration: '40 min' }, { name: 'Water Tank Cleaning', price: '₹599+', duration: '90 min' }, { name: 'Drainage Cleaning', price: '₹399+', duration: '45 min' }, { name: 'Water Purifier Install', price: '₹299+', duration: '50 min' }] },
  'ac-repair':      { icon: Wind,            tagline: 'Stay cool, always', desc: 'AC service, gas refill, and installation by certified HVAC technicians.', techCount: 35, avgRating: 4.7, completedJobs: 2890, services: [{ name: 'AC Gas Refill', price: '₹1499+', duration: '90 min' }, { name: 'AC Deep Cleaning', price: '₹499+', duration: '60 min' }, { name: 'AC Installation', price: '₹799+', duration: '120 min' }, { name: 'AC Not Cooling Fix', price: '₹349+', duration: '45 min' }, { name: 'Window AC Service', price: '₹399+', duration: '60 min' }, { name: 'Split AC Service', price: '₹499+', duration: '75 min' }] },
  carpenter:        { icon: Hammer,          tagline: 'Crafted for your home', desc: 'Custom carpentry, furniture repair, and precision woodwork by skilled craftsmen.', techCount: 28, avgRating: 4.8, completedJobs: 1750, services: [{ name: 'Furniture Assembly', price: '₹299+', duration: '60 min' }, { name: 'Door Repair', price: '₹249+', duration: '45 min' }, { name: 'Bed & Wardrobe Fix', price: '₹399+', duration: '90 min' }, { name: 'Kitchen Cabinet Work', price: '₹799+', duration: '120 min' }, { name: 'Wood Polishing', price: '₹499+', duration: '60 min' }, { name: 'Custom Shelving', price: '₹599+', duration: '90 min' }] },
  painter:          { icon: Paintbrush,      tagline: 'Transform your space', desc: 'Interior & exterior painting by professional painters with premium finishes.', techCount: 42, avgRating: 4.8, completedJobs: 2100, services: [{ name: 'Interior Painting', price: '₹8999+', duration: '1 Day' }, { name: 'Exterior Painting', price: '₹14999+', duration: '2 Days' }, { name: 'Texture Painting', price: '₹3999+', duration: '4 hrs' }, { name: 'Waterproofing', price: '₹4999+', duration: '3 hrs' }, { name: 'Wall Putty Work', price: '₹2999+', duration: '2 hrs' }, { name: 'Wood Painting', price: '₹999+', duration: '90 min' }] },
  'home-cleaning':  { icon: Home,            tagline: 'Spotless, every time', desc: 'Deep cleaning and regular maintenance for a healthy, sparkling home.', techCount: 74, avgRating: 4.9, completedJobs: 8900, services: [{ name: 'Full Home Deep Clean', price: '₹2999+', duration: '4 hrs' }, { name: 'Kitchen Cleaning', price: '₹999+', duration: '2 hrs' }, { name: 'Bathroom Cleaning', price: '₹499+', duration: '1 hr' }, { name: 'Sofa Cleaning', price: '₹499+', duration: '60 min' }, { name: 'Carpet Cleaning', price: '₹799+', duration: '90 min' }, { name: 'Move-in/Move-out Clean', price: '₹3999+', duration: '5 hrs' }] },
  'laptop-repair':  { icon: Monitor,         tagline: 'Fast fixes, zero data loss', desc: 'Laptop and desktop repair by certified technicians with genuine parts.', techCount: 22, avgRating: 4.7, completedJobs: 1340, services: [{ name: 'Screen Replacement', price: '₹1999+', duration: '2 hrs' }, { name: 'Keyboard Repair', price: '₹799+', duration: '1 hr' }, { name: 'OS Installation', price: '₹499+', duration: '90 min' }, { name: 'Virus Removal', price: '₹349+', duration: '60 min' }, { name: 'Data Recovery', price: '₹999+', duration: '2 hrs' }, { name: 'Hardware Upgrade', price: '₹299+', duration: '45 min' }] },
  'cctv-install':   { icon: Camera,          tagline: 'Watch over what matters', desc: 'CCTV installation and security camera setup by certified technicians.', techCount: 18, avgRating: 4.7, completedJobs: 950, services: [{ name: 'Indoor Camera Setup', price: '₹499+', duration: '60 min' }, { name: 'Outdoor Camera Setup', price: '₹699+', duration: '90 min' }, { name: 'DVR/NVR Install', price: '₹999+', duration: '2 hrs' }, { name: 'WiFi Camera Setup', price: '₹399+', duration: '45 min' }, { name: 'Camera Maintenance', price: '₹299+', duration: '30 min' }, { name: 'Night Vision Setup', price: '₹599+', duration: '60 min' }] },
  'wifi-setup':     { icon: Wifi,            tagline: 'Fast, reliable connectivity', desc: 'WiFi networking, router setup, and smart home connectivity solutions.', techCount: 15, avgRating: 4.8, completedJobs: 780, services: [{ name: 'Router Installation', price: '₹299+', duration: '30 min' }, { name: 'WiFi Range Extender', price: '₹249+', duration: '30 min' }, { name: 'Network Cabling', price: '₹599+', duration: '90 min' }, { name: 'Mesh WiFi Setup', price: '₹799+', duration: '60 min' }, { name: 'Speed Optimization', price: '₹199+', duration: '30 min' }, { name: 'Smart Home Setup', price: '₹999+', duration: '2 hrs' }] },
  'mobile-repair':  { icon: Smartphone,      tagline: 'Back to full charge, fast', desc: 'Smartphone repair for all brands — screens, batteries, and more.', techCount: 30, avgRating: 4.8, completedJobs: 4100, services: [{ name: 'Screen Replacement', price: '₹1299+', duration: '60 min' }, { name: 'Battery Replacement', price: '₹499+', duration: '30 min' }, { name: 'Charging Port Fix', price: '₹349+', duration: '30 min' }, { name: 'Water Damage Repair', price: '₹799+', duration: '90 min' }, { name: 'Software Issues', price: '₹249+', duration: '45 min' }, { name: 'Back Panel Repair', price: '₹399+', duration: '30 min' }] },
  'car-mechanic':   { icon: Car,             tagline: 'Doorstep car care', desc: 'Doorstep car repair and maintenance services by certified mechanics.', techCount: 20, avgRating: 4.6, completedJobs: 1200, services: [{ name: 'Engine Check-up', price: '₹499+', duration: '60 min' }, { name: 'Oil Change', price: '₹299+', duration: '30 min' }, { name: 'Brake Service', price: '₹799+', duration: '90 min' }, { name: 'Battery Replacement', price: '₹399+', duration: '30 min' }, { name: 'AC Service', price: '₹599+', duration: '60 min' }, { name: 'General Service', price: '₹999+', duration: '120 min' }] },
  'ev-charger':     { icon: BatteryCharging, tagline: 'Power up, eco-friendly', desc: 'Electric vehicle charger installation at home or office by certified engineers.', techCount: 12, avgRating: 4.8, completedJobs: 420, services: [{ name: 'Level 1 Charger Install', price: '₹999+', duration: '90 min' }, { name: 'Level 2 Charger Install', price: '₹2499+', duration: '3 hrs' }, { name: 'Electrical Assessment', price: '₹499+', duration: '60 min' }, { name: 'Panel Upgrade', price: '₹1999+', duration: '2 hrs' }, { name: 'Smart Charger Setup', price: '₹3499+', duration: '4 hrs' }, { name: 'Commercial Install', price: '₹4999+', duration: '1 Day' }] },
};

const defaultCat: CatDef = {
  icon: Wrench, tagline: 'Expert help at your door', desc: 'Professional services by verified and rated technicians.', techCount: 30, avgRating: 4.8, completedJobs: 1000,
  services: [{ name: 'General Repair', price: '₹299+', duration: '60 min' }, { name: 'Installation', price: '₹399+', duration: '60 min' }, { name: 'Maintenance', price: '₹199+', duration: '45 min' }, { name: 'Consultation', price: '₹149+', duration: '30 min' }, { name: 'Emergency Service', price: '₹599+', duration: '45 min' }, { name: 'Inspection', price: '₹249+', duration: '30 min' }],
};

/* ─── Guarantee cards — EXACT same structure as AboutPage "values" ─── */
const guarantees = [
  { icon: Shield,       title: 'Fully Insured',    desc: 'All services are insured. Your property is fully protected during the job.',           color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'       },
  { icon: Star,         title: 'Top-Rated Pros',   desc: 'Only technicians with 4.5+ ratings from verified customers serve your home.',         color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'     },
  { icon: CheckCircle2, title: '30-Day Guarantee', desc: 'Free re-service or full refund if you\'re not 100% satisfied with the work done.',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20'  },
  { icon: Heart,        title: 'Customer First',   desc: '24/7 support for emergencies. Your satisfaction is our highest priority always.',     color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'       },
];

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const slug = categorySlug || '';
  const cat = allCategories[slug] || defaultCat;
  const Icon = cat.icon;
  const displayName = slug.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-[#0f1117] overflow-hidden">

      {/* ══ HERO — identical structure to AboutPage hero ══ */}
      <section className="relative pt-32 pb-24 text-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-app relative">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-white/35 text-sm mb-8">
            <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/services" className="hover:text-white/70 transition-colors">Services</Link>
            <ChevronRight size={14} />
            <span className="text-amber-400 font-semibold capitalize">{displayName}</span>
          </div>

          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge — same as AboutPage "Our Story" badge */}
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-300 text-sm font-medium mb-6 backdrop-blur-md">
              <Sparkles size={13} className="text-amber-400" />
              <span className="capitalize">{displayName} Services</span>
            </motion.span>

            {/* h1 — same classes as AboutPage */}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-5 capitalize">
              Expert {displayName}<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                at Your Door
              </span>
            </motion.h1>

            {/* Subtitle — same as AboutPage */}
            <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              {cat.desc}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══ MISSION SECTION — 2-col exactly like AboutPage ══ */}
      <section className="py-20 container-app">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Left — text + checklist */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-semibold mb-5">
              <Target size={12} /> Why FixNow
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-5">
              Every home deserves<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">expert care.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Every technician on FixNow is background-verified, skill-certified, and rated by real customers — so you never have to worry about who's coming to your home.
            </p>
            <ul className="space-y-4">
              {[
                'Background-verified and skill-tested professionals',
                'Real-time tracking from assignment to arrival',
                '30-day guarantee on every job, no questions asked',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — 4 stat cards — EXACT same as AboutPage stat grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: `${cat.techCount}+`,                      label: 'Verified Experts',  icon: Users,        color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'       },
              { value: `${cat.avgRating}★`,                      label: 'Average Rating',    icon: Star,         color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'     },
              { value: `${cat.completedJobs.toLocaleString()}+`, label: 'Jobs Completed',   icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20'  },
              { value: '30-Day',                                  label: 'Guarantee',        icon: Shield,       color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'       },
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
          </div>
        </div>
      </section>

      {/* ══ SERVICES GRID — alternate bg exactly like AboutPage "Values" section ══ */}
      <section className="py-20 bg-white/[0.02] border-y border-white/5">
        <div className="container-app">
          {/* Section header — EXACT copy of AboutPage Values header */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-semibold mb-4">
              <Sparkles size={12} className="text-amber-400" /> Available Services
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              What we <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">offer</span>
            </h2>
          </motion.div>

          {/* Cards — EXACT same structure as AboutPage value cards */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cat.services.map((service, i) => {
              const palette = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <motion.div
                  key={service.name}
                  variants={fadeUp}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(service.name)}`)}
                  className={`group p-6 rounded-2xl border ${palette.bg} hover:scale-105 transition-all duration-300 cursor-pointer`}
                >
                  {/* Icon — EXACT same as AboutPage value card icon */}
                  <div className={`w-12 h-12 rounded-xl ${palette.bg} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className={palette.color} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{service.name}</h3>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-5 text-xs text-white/50">
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <Star size={11} className="fill-amber-400" /> 4.8+
                    </span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {service.duration}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-end justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Starts at</p>
                      <p className={`text-xl font-extrabold ${palette.color}`}>{service.price}</p>
                    </div>
                    <ArrowRight size={16} className="text-white/25 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ GUARANTEES — EXACT same section as AboutPage "Core Values" ══ */}
      <section className="py-20">
        <div className="container-app">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-semibold mb-4">
              <Heart size={12} className="text-rose-400" /> Our Promise
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Our <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Guarantee</span>
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {guarantees.map(g => (
              <motion.div key={g.title} variants={fadeUp}
                className={`group p-6 rounded-2xl border ${g.bg} hover:scale-105 transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl ${g.bg} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <g.icon size={22} className={g.color} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{g.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{g.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CTA — EXACT same as AboutPage CTA ══ */}
      <section className="py-20">
        <div className="container-app">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 p-12 text-center"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 capitalize">
                Ready to book a {displayName} service?
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
                Get matched with a top-rated professional near you in under 60 seconds.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate('/services')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-500/20"
                >
                  Book Now <ArrowRight size={18} />
                </button>
                <Link to="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/15 transition-all"
                >
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
