import React, { useState, useMemo } from 'react';
import { useTravel } from '../../context/TravelContext';
import { COUNTRIES, CONTINENTS } from '../../data/countries';
import { Search, Check, Heart, Globe, ArrowUpDown } from 'lucide-react';

export const CountriesListView: React.FC = () => {
  const {
    data,
    toggleCountryVisited,
    toggleCountryWishlist,
    setSelectedCountryId,
    t,
  } = useTravel();

  const [query, setQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VISITED' | 'WISHLIST' | 'UNVISITED'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'population' | 'area'>('name');

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();

    return COUNTRIES.filter((country) => {
      // Text search
      const matchQuery =
        !q ||
        country.name.toLowerCase().includes(q) ||
        (country.nativeName && country.nativeName.toLowerCase().includes(q)) ||
        country.capital.toLowerCase().includes(q) ||
        country.id.toLowerCase().includes(q);

      if (!matchQuery) return false;

      // Continent filter
      if (selectedContinent !== 'ALL' && country.continent !== selectedContinent) {
        return false;
      }

      // Status filter
      const isVisited = !!data.visitedCountries[country.id];
      const isWishlist = !!data.wishlistCountries[country.id];

      if (filterStatus === 'VISITED' && !isVisited) return false;
      if (filterStatus === 'WISHLIST' && !isWishlist) return false;
      if (filterStatus === 'UNVISITED' && (isVisited || isWishlist)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'population') return b.population - a.population;
      if (sortBy === 'area') return b.areaKm2 - a.areaKm2;
      return 0;
    });
  }, [query, selectedContinent, filterStatus, sortBy, data.visitedCountries, data.wishlistCountries]);

  const visitedCount = Object.keys(data.visitedCountries).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Controls */}
      <div className="p-5 rounded-2xl glass-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">
                {t('all_countries_title')}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                {visitedCount} of {COUNTRIES.length} {t('countries_visited')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('all_countries_subtitle')}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          {/* Continent Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedContinent('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedContinent === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('all_continents')}
            </button>
            {Object.entries(CONTINENTS).map(([code, info]) => (
              <button
                key={code}
                onClick={() => setSelectedContinent(code)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  selectedContinent === code
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.name}</span>
              </button>
            ))}
          </div>

          {/* Status & Sort */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="ALL">{t('all_status')}</option>
              <option value="VISITED">{t('status_visited')}</option>
              <option value="WISHLIST">{t('status_wishlist')}</option>
              <option value="UNVISITED">{t('unvisited_status')}</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-300 focus:outline-none"
              >
                <option value="name">{t('sort_name')}</option>
                <option value="population">{t('sort_population')}</option>
                <option value="area">{t('sort_area')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredCountries.map((country) => {
          const isVisited = !!data.visitedCountries[country.id];
          const isWishlist = !!data.wishlistCountries[country.id];

          return (
            <div
              key={country.id}
              onClick={() => setSelectedCountryId(country.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none group ${
                isVisited
                  ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50 shadow-sm'
                  : isWishlist
                  ? 'bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-3xl drop-shadow shrink-0">{country.flag}</span>
                <div className="truncate">
                  <div className="font-semibold text-xs text-white group-hover:text-orange-400 transition-colors truncate">
                    {country.name}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {country.capital} • {country.continent}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleCountryVisited(country.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isVisited
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                  title={t('mark_country_been_btn')}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => toggleCountryWishlist(country.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isWishlist
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-cyan-400 border border-slate-700'
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

      {filteredCountries.length === 0 && (
        <div className="py-16 text-center text-slate-400">
          <Globe className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="font-medium text-sm text-slate-300">{t('no_countries_match')}</p>
        </div>
      )}
    </div>
  );
};
