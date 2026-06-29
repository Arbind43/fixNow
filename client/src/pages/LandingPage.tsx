import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import axios from 'axios';

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Fetch categories and services from the database for comprehensive suggestions
    Promise.all([
      axios.get('/api/categories').catch(() => ({ data: { data: [] } })),
      axios.get('/api/services').catch(() => ({ data: { data: [] } }))
    ]).then(([catRes, servRes]) => {
      const cats = catRes.data?.data || [];
      const servs = servRes.data?.data || [];
      const allNames = [
        ...cats.map((c: any) => c.name),
        ...servs.map((s: any) => s.name)
      ];
      // Remove duplicates
      setSuggestions(Array.from(new Set(allNames)));
    });
  }, []);

  const handleSearch = (q: string) => {
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    else navigate('/search');
  };

  const filteredSuggestions = query.trim() 
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions.slice(0, 5); // Default to top 5 if empty

  return (
    <div className="relative min-h-screen bg-[#111] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/hero-bg.png")' }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 w-full max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-medium text-white tracking-wide mb-6 drop-shadow-lg">
          Premium Home Services
        </h1>
        <p className="text-lg md:text-2xl text-white/80 font-light tracking-wide drop-shadow-md mb-12">
          Intelligent repairs at your fingertips.
        </p>

        {/* AI Search Bar - Glassmorphic */}
        <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2 transition-all focus-within:bg-white/15 focus-within:border-white/30">
          <div className="relative flex-1 w-full flex items-center">
            <Search className="absolute left-5 text-white/50 pointer-events-none" size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Describe your issue (e.g. AC repair, plumbing)"
              className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder:text-white/50 focus:outline-none text-[15px] md:text-base font-medium"
            />
          </div>
          <button 
            onClick={() => handleSearch(query)} 
            className="w-full md:w-auto shrink-0 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
          >
            Diagnose & Fix
          </button>
          
          {/* Autocomplete Dropdown */}
          {isFocused && query.length > 0 && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50 text-left">
              {filteredSuggestions.slice(0, 8).map((suggestion, idx) => (
                <button
                  key={idx}
                  onMouseDown={(e) => { e.preventDefault(); handleSearch(suggestion); }}
                  className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700 border-b last:border-0 border-gray-100"
                >
                  <Search size={16} className="text-gray-400" />
                  <span className="font-medium">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Tags from Database */}
        {!query && suggestions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {suggestions.slice(0, 5).map((tag) => (
              <button 
                key={tag} 
                onClick={() => handleSearch(tag)} 
                className="text-sm font-medium text-white/60 hover:text-white cursor-pointer transition-colors px-4 py-2 rounded-full border border-white/10 hover:border-white/30 bg-black/20 backdrop-blur-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
