import React, { useState, useMemo } from 'react';
import { useTravel } from '../../context/TravelContext';
import { POPULAR_CITIES } from '../../data/cities';
import { COUNTRIES, CONTINENTS } from '../../data/countries';
import { Search, Check, MapPin, Plus, Trash2 } from 'lucide-react';

export const CitiesListView: React.FC = () => {
  const {
    data,
    toggleCityVisited,
    removeCustomCity,
    setIsAddCityOpen,
    t,
  } = useTravel();

  const [query, setQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VISITED' | 'UNVISITED'>('ALL');

  // Combine popular cities with user custom cities
  const allCities = useMemo(() => {
    const combined = [...POPULAR_CITIES];
    if (data.customCities) {
      data.customCities.forEach((cc) => {
        if (!combined.some((c) => c.id === cc.id)) {
          const country = COUNTRIES.find((co) => co.id === cc.countryId);
          combined.push({
            id: cc.id,
            name: cc.name,
            countryId: cc.countryId,
            countryName: country?.name || '',
            continent: country?.continent || 'EU',
            lat: cc.lat,
            lng: cc.lng,
            isCustom: true,
          });
        }
      });
    }
    return combined;
  }, [data.customCities]);

  // Available countries in the cities list for filtering
  const availableCountries = useMemo(() => {
    const countryIds = new Set(allCities.map((c) => c.countryId));
    return COUNTRIES.filter((c) => countryIds.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [allCities]);

  const filteredCities = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allCities.filter((city) => {
      const matchQuery =
        !q ||
        city.name.toLowerCase().includes(q) ||
        city.countryName.toLowerCase().includes(q);
      if (!matchQuery) return false;

      if (selectedContinent !== 'ALL' && city.continent !== selectedContinent) return false;
      if (selectedCountry !== 'ALL' && city.countryId !== selectedCountry) return false;

      const isVisited = !!data.visitedCities[city.id];
      if (filterStatus === 'VISITED' && !isVisited) return false;
      if (filterStatus === 'UNVISITED' && isVisited) return false;

      return true;
    }).sort((a, b) => {
      const countryComp = a.countryName.localeCompare(b.countryName);
      if (countryComp !== 0) return countryComp;
      return a.name.localeCompare(b.name);
    });
  }, [allCities, query, selectedContinent, selectedCountry, filterStatus, data.visitedCities]);

  const visitedCount = Object.keys(data.visitedCities).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Controls */}
      <div className="p-5 rounded-2xl glass-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">
                {t('world_cities_title')}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                {t('cities_visited_count_pill', { visited: visitedCount, total: allCities.length })}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('world_cities_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search bar */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search_cities_placeholder')}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Pin Custom City Button */}
            <button
              onClick={() => setIsAddCityOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white shadow-lg transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('pin_city')}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                setSelectedContinent('ALL');
                setSelectedCountry('ALL');
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedContinent === 'ALL' && selectedCountry === 'ALL'
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('all_continents')}
            </button>
            {Object.entries(CONTINENTS).map(([code, info]) => (
              <button
                key={code}
                onClick={() => {
                  setSelectedContinent(code);
                  setSelectedCountry('ALL');
                }}
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

          <div className="flex items-center gap-2 text-xs">
            {/* Country Selector */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none max-w-[160px]"
            >
              <option value="ALL">{t('all_countries')}</option>
              {availableCountries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>

            {/* Status Selector */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="ALL">{t('all_status')}</option>
              <option value="VISITED">{t('status_visited')}</option>
              <option value="UNVISITED">{t('unvisited_status')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredCities.map((city) => {
          const isVisited = !!data.visitedCities[city.id];
          const country = COUNTRIES.find((c) => c.id === city.countryId);

          return (
            <div
              key={city.id}
              onClick={() => toggleCityVisited(city.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none group ${
                isVisited
                  ? 'bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isVisited
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-xs text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5 truncate">
                    <span className="truncate">{city.name}</span>
                    {city.isCapital && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded shrink-0">
                        {t('capital_badge')}
                      </span>
                    )}
                    {city.isCustom && (
                      <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1 rounded shrink-0">
                        {t('custom_pin_badge')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {country?.flag} {city.countryName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                {city.isCustom && (
                  <button
                    onClick={() => removeCustomCity(city.id)}
                    className="p-1 rounded text-slate-600 hover:text-rose-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => toggleCityVisited(city.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isVisited
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                  title={t('status_visited')}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCities.length === 0 && (
        <div className="py-16 text-center text-slate-400">
          <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="font-medium text-sm text-slate-300">{t('no_cities_match')}</p>
        </div>
      )}
    </div>
  );
};
