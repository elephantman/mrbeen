import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTravel } from '../../context/TravelContext';
import { COUNTRIES } from '../../data/countries';
import { POPULAR_CITIES } from '../../data/cities';
import { Search, X, Check, Heart, MapPin, Globe } from 'lucide-react';

export const QuickSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setSelectedCountryId,
    toggleCountryVisited,
    toggleCountryWishlist,
    toggleCityVisited,
    data,
    t,
  } = useTravel();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open & keyboard shortcut
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Filtered countries and cities
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return popular countries as suggestions
      return {
        countries: COUNTRIES.slice(0, 8),
        cities: POPULAR_CITIES.slice(0, 6),
      };
    }

    const matchedCountries = COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nativeName && c.nativeName.toLowerCase().includes(q)) ||
        c.capital.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    ).slice(0, 8);

    const matchedCities = POPULAR_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(q) ||
        city.countryName.toLowerCase().includes(q)
    ).slice(0, 10);

    return { countries: matchedCountries, cities: matchedCities };
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-500 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-1 rounded-md border border-slate-700 font-mono transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-4 space-y-5 flex-1">
          {/* Countries Section */}
          {searchResults.countries.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>{t('nav_countries')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.countries.map((country) => {
                  const isVisited = !!data.visitedCountries[country.id];
                  const isWishlist = !!data.wishlistCountries[country.id];

                  return (
                    <div
                      key={country.id}
                      onClick={() => {
                        setSelectedCountryId(country.id);
                        setIsSearchOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                        isVisited
                          ? 'bg-orange-500/10 border-orange-500/30'
                          : isWishlist
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-2xl drop-shadow">{country.flag}</span>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-white group-hover:text-orange-400 transition-colors truncate">
                            {country.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {t('capital_label')}: {country.capital} • {country.continent}
                          </div>
                        </div>
                      </div>

                      {/* Quick Toggle Action */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleCountryVisited(country.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isVisited
                              ? 'bg-orange-500 text-white'
                              : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                          }`}
                          title={t('mark_country_been_btn')}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleCountryWishlist(country.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isWishlist
                              ? 'bg-cyan-500 text-white'
                              : 'hover:bg-slate-700 text-slate-400 hover:text-cyan-400'
                          }`}
                          title={t('add_wishlist_btn')}
                        >
                          <Heart className="w-3.5 h-3.5" fill={isWishlist ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cities Section */}
          {searchResults.cities.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('nav_cities')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.cities.map((city) => {
                  const isCityVisited = !!data.visitedCities[city.id];
                  const country = COUNTRIES.find((c) => c.id === city.countryId);

                  return (
                    <div
                      key={city.id}
                      onClick={() => toggleCityVisited(city.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                        isCityVisited
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="text-lg">{country?.flag || '📍'}</span>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-white group-hover:text-cyan-400 transition-colors truncate">
                            {city.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {city.countryName} {city.isCapital ? '• ' + t('capital_badge') : ''}
                          </div>
                        </div>
                      </div>

                      <button
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isCityVisited
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
