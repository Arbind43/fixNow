import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Search, MapPin, Star, ArrowRight, Sparkles,
  SlidersHorizontal, Wrench, Clock, Users, CheckCircle2, Shield
} from 'lucide-react';
import { Skeleton, StarRating } from '../../components/ui';

/* ─── same variants as AboutPage ─── */
const fadeUp  = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.11 } } };

/* ─── Rotating card colours (same palette as AboutPage / CategoryPage) ─── */
const CARD_COLORS = [
  { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'       },
  { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'     },
  { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20'  },
  { color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'       },
  { color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20'   },
  { color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20'       },
];



export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query    = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<{ services: any[]; technicians: any[] }>({ services: [], technicians: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Ask for location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location not provided', err)
      );
    }
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        let services: any[]     = [];
        let technicians: any[]  = [];
        try {
          const techUrl = userLocation 
            ? `/api/technicians?lat=${userLocation.lat}&lng=${userLocation.lng}` 
            : '/api/technicians';
            
          const [sRes, tRes] = await Promise.all([axios.get('/api/services'), axios.get(techUrl)]);
          services    = sRes.data.data || [];
          technicians = tRes.data.data || [];
        } catch (error) { 
          console.error('Search fetch failed:', error); 
        }

        const qLower = query.toLowerCase().trim();
        
        // Simple NLP-like keyword extraction for better matching of long sentences
        const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'it', 'its', 'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'need', 'want', 'fix', 'making', 'loud', 'noise', 'someone', 'please', 'help'];
        
        const keywords = qLower.split(/[\s,.-]+/).filter((word: string) => word.length > 2 && !stopWords.includes(word));

        const filteredServices = services.filter((s: any) => {
          if (!qLower) return true;
          const searchString = `${s.name} ${s.description} ${s.category?.name}`.toLowerCase();
          
          // Exact substring match (for short queries like "AC Repair")
          if (searchString.includes(qLower)) return true;
          
          // Keyword match (for long sentence queries like "My AC is making noise")
          if (keywords.length > 0) {
            return keywords.some((kw: string) => searchString.includes(kw));
          }
          return false;
        });

        const filteredTechnicians = technicians.filter((t: any) => {
          if (!qLower) return true;
          const searchString = `${t.user?.name} ${t.categories?.map((c:any) => c.name).join(' ')}`.toLowerCase();
          
          if (searchString.includes(qLower)) return true;
          
          if (keywords.length > 0) {
            return keywords.some((kw: string) => searchString.includes(kw));
          }
          return false;
        });

        setResults({ services: filteredServices, technicians: filteredTechnicians });
      } catch { /* ignore */ } finally { setIsLoading(false); }
    };
    fetchResults();
  }, [query, category, userLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  /* ── apply local filters ── */
  const filtered = {
    services: results.services.filter((s: any) => {
      if (minPrice && s.basePrice < Number(minPrice)) return false;
      if (maxPrice && s.basePrice > Number(maxPrice)) return false;
      return true;
    }),
    technicians: results.technicians.filter((t: any) => {
      if (minRating && t.rating < minRating) return false;
      return true;
    }),
  };

  return (
    <div className="min-h-screen bg-[#0f1117] overflow-hidden">

      {/* ══ HERO — identical to AboutPage ══ */}
      <section className="relative pt-32 pb-24 text-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-app relative">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-300 text-sm font-medium mb-6 backdrop-blur-md">
              <Sparkles size={13} className="text-amber-400" /> Find a Service
            </motion.span>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight mb-5">
              {query ? <>Results for <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent capitalize">"{query}"</span></> : <>Find the <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">perfect service</span></>}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
              Search across verified professionals and services near you.
            </motion.p>

            {/* Search bar */}
            <motion.form variants={fadeUp} onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for services, technicians..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-amber-500/50 transition-all text-base backdrop-blur-sm"
                />
              </div>
              <button type="submit" className="px-7 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xl shadow-amber-500/20 transition-all whitespace-nowrap">
                Search
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* ══ RESULTS — same container style as AboutPage body ══ */}
      <section className="pb-24">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Sidebar — glassmorphic like AboutPage cards ── */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-24 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 font-bold text-white mb-6 pb-4 border-b border-white/10">
                  <SlidersHorizontal size={16} className="text-amber-400" />
                  Filters
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-3">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        placeholder="Min" type="number" value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 transition-colors"
                      />
                      <input
                        placeholder="Max" type="number" value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-amber-500/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-3">Min Rating</label>
                    <div className="space-y-2.5">
                      {[4, 3, 2].map(r => (
                        <label key={r} className="flex items-center gap-2.5 text-sm text-white/60 cursor-pointer hover:text-white transition-colors">
                          <input
                            type="radio" name="rating" value={r}
                            checked={minRating === r}
                            onChange={() => setMinRating(r)}
                            className="accent-amber-500"
                          />
                          <StarRating rating={r} /> <span className="ml-1">& Up</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setMinRating(0); }}
                  className="w-full mt-6 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20 transition-all text-sm"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* ── Main Results ── */}
            <div className="flex-1 space-y-12">
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* ── SERVICES — same card style as AboutPage values ── */}
                  {filtered.services.length > 0 && (
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                      {/* Section header — identical to AboutPage section headers */}
                      <motion.div variants={fadeUp} className="mb-10">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-semibold mb-4">
                          <Wrench size={12} className="text-amber-400" /> Services
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                          Matching <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Services</span>
                          <span className="text-white/30 text-2xl ml-3">({filtered.services.length})</span>
                        </h2>
                      </motion.div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.services.map((service: any, i: number) => {
                          const p = CARD_COLORS[i % CARD_COLORS.length];
                          return (
                            <motion.div
                              key={service._id}
                              variants={fadeUp}
                              className={`group p-6 rounded-2xl border ${p.bg} hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col`}
                            >
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-xl ${p.bg} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                <Wrench size={22} className={p.color} />
                              </div>
                              {/* Category badge */}
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${p.color} mb-1`}>
                                {service.category?.name}
                              </span>
                              {/* Name */}
                              <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                                {service.name}
                              </h3>
                              {/* Meta */}
                              <div className="flex items-center gap-3 mb-5 text-xs text-white/50">
                                <span className="flex items-center gap-1 font-semibold text-amber-400">
                                  <Star size={11} className="fill-amber-400" /> 4.8+
                                </span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> {service.duration} min
                                </span>
                              </div>
                              {/* Price + CTA */}
                              <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-4">
                                <div>
                                  <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Starts at</p>
                                  <p className={`text-xl font-extrabold ${p.color}`}>₹{service.basePrice}</p>
                                </div>
                                <Link
                                  to={`/services/${service.slug}`}
                                  className="flex items-center gap-1 text-white/30 group-hover:text-amber-400 text-sm font-semibold transition-all group-hover:translate-x-0.5"
                                >
                                  Book <ArrowRight size={14} />
                                </Link>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ── TECHNICIANS — same section-separator style as AboutPage ── */}
                  {filtered.technicians.length > 0 && (
                    <div className="py-12 -mx-4 px-4 bg-white/[0.02] border-y border-white/5 rounded-2xl">
                      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                        <motion.div variants={fadeUp} className="mb-10">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-semibold mb-4">
                            <Users size={12} className="text-amber-400" /> Professionals
                          </span>
                          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                            Matching <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Technicians</span>
                            <span className="text-white/30 text-2xl ml-3">({filtered.technicians.length})</span>
                          </h2>
                        </motion.div>

                        <div className="space-y-5">
                          {filtered.technicians.map((tech: any, i: number) => {
                            const p = CARD_COLORS[i % CARD_COLORS.length];
                            return (
                              <motion.div key={tech._id} variants={fadeUp}
                                className={`group p-6 rounded-2xl border ${p.bg} hover:scale-[1.02] transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center`}
                              >
                                <img
                                  src={tech.user?.avatar || 'https://i.pravatar.cc/150?img=1'}
                                  alt={tech.user?.name}
                                  className={`w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-amber-500/30 transition-colors`}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{tech.user?.name}</h3>
                                  <div className="flex items-center gap-4 text-sm text-white/50 mt-1 mb-3">
                                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                      <Star size={13} className="fill-amber-400" /> {tech.rating}
                                      <span className="text-white/40 font-normal">({tech.reviewsCount} reviews)</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin size={13} /> {tech.serviceRadius} km away
                                    </span>
                                  </div>
                                  <div className="flex gap-2 flex-wrap">
                                    {tech.categories?.slice(0, 3).map((cat: any) => (
                                      <span key={cat._id} className={`px-3 py-1 rounded-full text-xs font-semibold ${p.bg} ${p.color} border`}>
                                        {cat.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <Link to={`/technicians/${tech._id}`}>
                                  <button className="shrink-0 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 font-semibold hover:border-amber-500/40 hover:text-amber-400 transition-all text-sm whitespace-nowrap">
                                    View Profile
                                  </button>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* ── Empty State ── */}
                  {filtered.services.length === 0 && filtered.technicians.length === 0 && (
                    <motion.div variants={fadeUp} initial="hidden" animate="visible"
                      className="text-center py-20 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Search size={30} className="text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-white mb-2">No results found</h3>
                      <p className="text-white/50 max-w-sm mx-auto mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                      <Link to="/services" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20">
                        Browse All Services <ArrowRight size={16} />
                      </Link>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA — identical to AboutPage CTA ══ */}
      <section className="py-20">
        <div className="container-app">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 p-12 text-center"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Can't find what you need?</h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">Browse our full catalog of home services or talk to a FixNow expert.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/services" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-xl shadow-amber-500/20">
                  Browse All Services <ArrowRight size={18} />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/15 transition-all">
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
