import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar, Skeleton } from '../../components/ui';
import { Wrench, Zap, Droplets, PaintRoller, Sparkles, Box, Clock, Star, ArrowRight, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'ac-repair':   'from-sky-500/20 to-blue-700/20',
  'plumbing':    'from-cyan-500/20 to-teal-700/20',
  'electrical':  'from-yellow-400/20 to-orange-600/20',
  'painting':    'from-rose-400/20 to-pink-700/20',
  'cleaning':    'from-emerald-400/20 to-green-700/20',
  'appliances':  'from-purple-400/20 to-violet-700/20',
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  'ac-repair':   'text-sky-400',
  'plumbing':    'text-cyan-400',
  'electrical':  'text-yellow-400',
  'painting':    'text-rose-400',
  'cleaning':    'text-emerald-400',
  'appliances':  'text-purple-400',
};

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/categories').catch(() => ({ data: { data: [] } })),
      axios.get('/api/services').catch(() => ({ data: { data: [] } }))
    ]).then(([catRes, servRes]) => {
      const cats = catRes.data?.data || [];
      const servs = servRes.data?.data || [];
      setServices(servs);
      setCategories(cats);
      
      const allNames = [
        ...cats.map((c: any) => c.name),
        ...servs.map((s: any) => s.name)
      ];
      setSuggestions(Array.from(new Set(allNames)));
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const filteredServices = services.filter(s => {
    let matchesCat = false;
    if (activeCategory === 'all') {
      matchesCat = true;
    } else {
      const activeCat = categories.find((c: any) => c.slug === activeCategory);
      matchesCat =
        s.category?.slug === activeCategory ||
        String(s.category?._id) === activeCategory ||
        (activeCat && (
          String(s.category?._id) === String(activeCat._id) ||
          (s.category?.name || '').toLowerCase() === (activeCat.name || '').toLowerCase()
        ));
    }
    
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q
      || s.name.toLowerCase().includes(q)
      || (s.description || '').toLowerCase().includes(q)
      || (s.category?.name || '').toLowerCase().includes(q);
      
    return matchesCat && matchesSearch;
  });

  const getIcon = (name: string, size = 22) => {
    switch (name) {
      case 'Sparkles':    return <Sparkles    size={size} />;
      case 'Droplets':    return <Droplets    size={size} />;
      case 'Zap':         return <Zap         size={size} />;
      case 'PaintRoller': return <PaintRoller size={size} />;
      case 'Wrench':      return <Wrench      size={size} />;
      default:            return <Box         size={size} />;
    }
  };

  const getDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden pt-32 pb-20">
        {/* Background blobs */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative container-app text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-300 text-sm font-medium mb-6 backdrop-blur-md">
              <Sparkles size={14} className="text-amber-400" />
              25+ Service Categories — Expert Technicians
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-5">
              Our <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
              Transparent pricing. Verified professionals. 30‑day guarantee on every job.
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search for AC repair, plumber, electrician..."
                size="lg"
                suggestions={suggestions}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-app pb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-60 shrink-0 lg:sticky lg:top-28">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-widest mb-4 px-1">
                <SlidersHorizontal size={13} />
                Categories
              </div>

              <button
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                All Services
              </button>

              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                    activeCategory === cat.slug
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={activeCategory === cat.slug ? 'text-white' : CATEGORY_ICON_COLORS[cat.slug]}>
                      {getIcon(cat.icon, 16)}
                    </span>
                    {cat.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeCategory === cat.slug ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* ── Grid ── */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {activeCategory === 'all'
                  ? 'All Services'
                  : categories.find(c => c.slug === activeCategory)?.name}
              </h2>
              <span className="text-sm text-white/40">{filteredServices.length} results</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filteredServices.map((service, idx) => {
                    const catIcon = categories.find(c => c.slug === service.category?.slug);
                    const gradient = CATEGORY_GRADIENTS[service.category?.slug] ?? 'from-white/5 to-white/10';
                    const iconColor = CATEGORY_ICON_COLORS[service.category?.slug] ?? 'text-white/40';

                    return (
                      <motion.div
                        key={service._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                        className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all duration-300 flex flex-col"
                      >
                        {/* Card top banner */}
                        <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                          {/* Huge faded icon */}
                          <div className={`absolute -right-4 -bottom-4 opacity-20 scale-150 ${iconColor} transition-transform duration-500 group-hover:scale-[1.7] group-hover:rotate-6`}>
                            {getIcon(catIcon?.icon ?? 'Box', 72)}
                          </div>

                          {/* Category badge */}
                          <div className="absolute top-4 left-4">
                            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/80 border border-white/10">
                              {service.category.name}
                            </span>
                          </div>

                          {/* Rating */}
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-white">{service.rating}</span>
                            <span className="text-[10px] text-white/50">({service.reviewCount})</span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-1">
                            {service.name}
                          </h3>

                          <div className="flex items-center gap-1 text-white/50 text-xs mb-5">
                            <Clock size={12} />
                            <span>{getDuration(service.estimatedDuration)}</span>
                          </div>

                          <div className="mt-auto flex items-end justify-between">
                            <div>
                              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Starts at</p>
                              <p className="text-2xl font-extrabold text-white">₹{service.basePrice.toLocaleString()}</p>
                            </div>
                            <Link
                              to={`/services/${service.slug}`}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold hover:bg-amber-500 hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-amber-500/10"
                            >
                              Book
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench size={28} className="text-white/30" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No services found</h3>
                <p className="text-white/40 max-w-sm mx-auto">
                  We couldn't find any services matching "{searchQuery}". Try a different search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
