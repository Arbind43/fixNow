
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, StarRating } from '../../components/ui';
import {
  CheckCircle2, Clock, ShieldCheck, MapPin, ChevronRight,
  Navigation, Star, ArrowRight, Briefcase, Sparkles
} from 'lucide-react';

const MOCK_SERVICE = {
  _id: '101',
  name: 'AC Regular Servicing',
  category: { name: 'AC Repair', slug: 'ac-repair' },
  description: 'Complete inspection and deep cleaning of your AC unit to ensure optimal performance and cooling. Includes filter cleaning, coil washing, and gas level check.',
  basePrice: 499,
  estimatedDuration: 60,
  features: [
    'Deep cleaning of indoor & outdoor units',
    'Gas pressure and cooling check',
    'Filter and cooling coil wash',
    '30-day service guarantee',
    'Background verified professionals'
  ]
};

const MOCK_TECHNICIANS = [
  { _id: 't1', name: 'Rajesh Kumar', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', rating: 4.8, reviewCount: 124, experienceYears: 5, location: '2.4 km away', isVerified: true },
  { _id: 't2', name: 'Amit Sharma',  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', rating: 4.9, reviewCount: 312, experienceYears: 8, location: '3.1 km away', isVerified: true },
  { _id: 't3', name: 'Vikram Singh', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', rating: 4.6, reviewCount: 89,  experienceYears: 3, location: '1.2 km away', isVerified: true },
];

export default function ServiceDetailsPage() {
  useParams();

  return (
    <div className="min-h-screen bg-[#0f1117]">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container-app relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
            <Link to="/"        className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} className="text-white/20" />
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <ChevronRight size={14} className="text-white/20" />
            <span className="text-white/70 font-medium">{MOCK_SERVICE.name}</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-300 text-sm font-medium mb-5 backdrop-blur-md">
              <Sparkles size={13} className="text-amber-400" />
              {MOCK_SERVICE.category.name}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
              {MOCK_SERVICE.name}
            </h1>
            <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
              {MOCK_SERVICE.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container-app pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, label: 'Verified',       value: 'Professionals', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { icon: Clock,       label: 'Est. Duration',  value: `${MOCK_SERVICE.estimatedDuration} min`,     color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'    },
                { icon: Star,        label: 'Avg Rating',     value: '4.8 ★',          color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'   },
              ].map(stat => (
                <div key={stat.label} className={`border rounded-2xl p-4 text-center ${stat.bg}`}>
                  <stat.icon size={22} className={`${stat.color} mx-auto mb-2`} />
                  <p className="text-xs text-white/40 mb-0.5">{stat.label}</p>
                  <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* What's included */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5">What's included?</h3>
              <ul className="space-y-3">
                {MOCK_SERVICE.features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="flex items-center gap-3 text-white/70"
                  >
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Technicians */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">Available Technicians</h2>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Navigation size={12} />
                  Near you
                </span>
              </div>

              <div className="space-y-4">
                {MOCK_TECHNICIANS.map((tech, idx) => (
                  <motion.div
                    key={tech._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="group flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-white/8 rounded-2xl p-5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar src={tech.avatar} name={tech.name} size="lg" />
                        {tech.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-[#0f1117]">
                            <ShieldCheck size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{tech.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={tech.rating} />
                          <span className="text-xs text-white/40">({tech.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                          <span className="flex items-center gap-1"><Briefcase size={11} /> {tech.experienceYears} yrs exp</span>
                          <span className="flex items-center gap-1"><MapPin size={11} /> {tech.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Link
                        to={`/technicians/${tech._id}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-white/15 text-white/70 hover:text-white hover:border-white/30 rounded-xl text-sm font-semibold transition-all"
                      >
                        Profile
                      </Link>
                      <Link
                        to={`/booking/${MOCK_SERVICE._id}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-500/20"
                      >
                        Book Now
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sticky Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden">
              {/* Top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />

              <h3 className="text-xl font-bold text-white mt-2 mb-1">Book This Service</h3>
              <p className="text-sm text-white/50 mb-6">Pick a technician above to get started.</p>

              <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Starting price</p>
                  <p className="text-4xl font-extrabold text-white">₹{MOCK_SERVICE.basePrice}</p>
                </div>
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">Best Value</span>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { icon: ShieldCheck, title: 'FixNow Guarantee', sub: '30 days warranty on all repairs',         color: 'text-emerald-400' },
                  { icon: Clock,       title: 'On-time Promise',  sub: '10% off if the technician is late',       color: 'text-blue-400'    },
                  { icon: Star,        title: 'Top Rated',        sub: 'Only 4+ star verified professionals',     color: 'text-amber-400'   },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <item.icon size={16} className={item.color} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-white/50 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-500/20 group"
              >
                View Technicians
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
