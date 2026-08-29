import React, { useMemo, useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { COUNTRIES } from '../../data/countries';
import { POPULAR_CITIES } from '../../data/cities';
import { 
  X, 
  Check, 
  Heart, 
  MapPin, 
  Star, 
  Users, 
  Globe2, 
  Plus, 
  Search, 
  CheckCheck, 
  RotateCcw 
} from 'lucide-react';

export const CountryDetailDrawer: React.FC = () => {
  const {
    selectedCountryId,
    setSelectedCountryId,
    data,
    toggleCountryVisited,
    toggleCountryWishlist,
    updateCountryRecord,
    toggleCityVisited,
    setIsAddCityOpen,
    t,
  } = useTravel();

  const [citySearch, setCitySearch] = useState('');

  const country = useMemo(() => {
    if (!selectedCountryId) return null;
    return COUNTRIES.find((c) => c.id === selectedCountryId) || null;
  }, [selectedCountryId]);

  const countryCities = useMemo(() => {
    if (!selectedCountryId) return [];
    const fromPopular = POPULAR_CITIES.filter((c) => c.countryId === selectedCountryId);
    const fromCustom = (data.customCities || []).filter((c) => c.countryId === selectedCountryId);
    const all = [...fromPopular];
    fromCustom.forEach((c) => {
      if (!all.some((a) => a.id === c.id)) {
        all.push({
          id: c.id,
          name: c.name,
          countryId: c.countryId,
          countryName: country?.name || '',
          continent: country?.continent || 'EU',
          lat: c.lat,
          lng: c.lng,
          isCustom: true,
        });
      }
    });
    return all;
  }, [selectedCountryId, data.customCities, country]);

  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return countryCities;
    return countryCities.filter((c) => c.name.toLowerCase().includes(q));
  }, [countryCities, citySearch]);

  const visitedInCountryCount = useMemo(() => {
    return countryCities.filter((c) => !!data.visitedCities[c.id]).length;
  }, [countryCities, data.visitedCities]);

  if (!country) return null;

  const isVisited = !!data.visitedCountries[country.id];
  const isWishlist = !!data.wishlistCountries[country.id];
  const record = data.visitedCountries[country.id];

  // Bulk action: Select all cities in this country
  const handleSelectAllCities = () => {
    countryCities.forEach((city) => {
      if (!data.visitedCities[city.id]) {
        toggleCityVisited(city.id);
      }
    });
  };

  // Bulk action: Deselect all cities in this country
  const handleDeselectAllCities = () => {
    countryCities.forEach((city) => {
      if (data.visitedCities[city.id]) {
        toggleCityVisited(city.id);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Flag & Close */}
        <div className="relative p-6 pb-4 border-b border-slate-800 bg-slate-950/70">
          <button
            onClick={() => setSelectedCountryId(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <span className="text-5xl drop-shadow-md">{country.flag}</span>
            <div>
              <h2 className="text-2xl font-bold font-display text-white">{country.name}</h2>
              {country.nativeName && country.nativeName !== country.name && (
                <p className="text-sm text-slate-400 font-medium">{country.nativeName}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {country.continent}
                </span>
                <span>• {t('capital_label')}: {country.capital}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <button
              onClick={() => toggleCountryVisited(country.id)}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isVisited
                  ? 'bg-orange-500 text-white shadow-orange-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isVisited ? t('country_visited_btn') : t('mark_country_been_btn')}</span>
            </button>

            <button
              onClick={() => toggleCountryWishlist(country.id)}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
                isWishlist
                  ? 'bg-cyan-500 text-white shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Heart className="w-4 h-4" fill={isWishlist ? 'currentColor' : 'none'} />
              <span>{isWishlist ? t('in_wishlist_btn') : t('add_wishlist_btn')}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Key Facts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('population')}</span>
              </div>
              <div className="text-base font-bold text-white mt-1">
                {(country.population / 1_000_000).toFixed(1)}M
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('land_area')}</span>
              </div>
              <div className="text-base font-bold text-white mt-1">
                {country.areaKm2.toLocaleString()} km²
              </div>
            </div>
          </div>

          {/* Visited Country Travel Journal & Rating */}
          {isVisited && (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('travel_journal')}
                </span>
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateCountryRecord(country.id, { rating: star })}
                      className="text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star
                        className="w-4 h-4"
                        fill={(record?.rating || 5) >= star ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes input */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('personal_memories')}</label>
                <textarea
                  value={record?.notes || ''}
                  onChange={(e) => updateCountryRecord(country.id, { notes: e.target.value })}
                  placeholder={t('journal_placeholder')}
                  rows={2}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Cities Section */}
          <div className="space-y-3">
            {/* Header & City Progress */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">
                    {t('cities_in_country', { name: country.name })} ({countryCities.length})
                  </h3>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {t('visited_cities_count', {
                    visited: visitedInCountryCount,
                    total: countryCities.length,
                    percent: countryCities.length > 0 ? Math.round((visitedInCountryCount / countryCities.length) * 100) : 0,
                  })}
                </div>
              </div>

              {/* Pin Custom City button */}
              <button
                onClick={() => setIsAddCityOpen(true)}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-semibold px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('custom_pin_badge')}</span>
              </button>
            </div>

            {/* Quick Filter & Bulk Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder={t('search_city_in_country', { count: countryCities.length })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                {citySearch && (
                  <button onClick={() => setCitySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Bulk Toggle Buttons */}
              <button
                onClick={handleSelectAllCities}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                title="Select all"
              >
                <CheckCheck className="w-3 h-3 text-cyan-400" />
                <span>{t('all_cities_btn')}</span>
              </button>
              <button
                onClick={handleDeselectAllCities}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-400 hover:text-rose-300 transition-colors whitespace-nowrap"
                title="Clear all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('clear_cities_btn')}</span>
              </button>
            </div>

            {/* Cities Checklist */}
            {filteredCities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredCities.map((city) => {
                  const isCityVisited = !!data.visitedCities[city.id];
                  return (
                    <div
                      key={city.id}
                      onClick={() => toggleCityVisited(city.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isCityVisited
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-white shadow-sm'
                          : 'bg-slate-800/40 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCityVisited ? 'text-cyan-400' : 'text-slate-500'
                          }`}
                        />
                        <div className="truncate">
                          <span className="font-semibold text-xs text-white block truncate">{city.name}</span>
                          {city.isCapital && (
                            <span className="text-[9px] text-amber-400 font-medium">{t('capital_badge')}</span>
                          )}
                          {city.isCustom && (
                            <span className="text-[9px] text-orange-400 font-medium">{t('custom_pin_badge')}</span>
                          )}
                        </div>
                      </div>

                      <button
                        className={`w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-colors ${
                          isCityVisited
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-800/30 rounded-2xl border border-slate-800/80">
                <MapPin className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">{t('no_cities_found', { query: citySearch })}</p>
                <button
                  onClick={() => setIsAddCityOpen(true)}
                  className="mt-2 text-xs font-semibold text-orange-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> {t('pin_custom_place')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
