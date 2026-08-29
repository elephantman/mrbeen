import React from 'react';
import { useTravel } from '../../context/TravelContext';
import { CONTINENTS } from '../../data/countries';
import { 
  Globe2, 
  MapPin, 
  Trophy, 
  Share2, 
  ChevronRight, 
  Flame,
  Award
} from 'lucide-react';

export const StatsDashboard: React.FC = () => {
  const { stats, activeTheme, setIsShareOpen, setActiveTab, t } = useTravel();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Metric Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: World Explored */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div 
            className="absolute top-0 right-0 w-28 h-28 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"
            style={{ backgroundColor: activeTheme.primaryColor }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('world_explored')}
            </span>
            <Globe2 className="w-5 h-5" style={{ color: activeTheme.primaryColor }} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-display text-white">
              {stats.worldPercentage}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.visitedCountriesCount} of {stats.totalCountries} {t('countries_visited')}
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.worldPercentage}%`,
                backgroundColor: activeTheme.primaryColor,
              }}
            />
          </div>
        </div>

        {/* Metric 2: Cities Pinned */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('cities_pinned')}
            </span>
            <MapPin className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-display text-white">
              {stats.visitedCitiesCount}
            </span>
            <span className="text-xs text-slate-400">{t('nav_cities')}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('cities_pinned_desc')}
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.visitedCitiesCount * 4)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Land Area Covered */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('land_area_covered')}
            </span>
            <Flame className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-display text-white">
              {(stats.totalAreaCoveredKm2 / 1_000_000).toFixed(1)}M
            </span>
            <span className="text-xs text-slate-400">km²</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.worldAreaPercentage}% {t('of_earth')}
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${stats.worldAreaPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Explorer Level */}
        <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('explorer_rank')}
            </span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold font-display text-amber-400">
              {stats.explorerLevel.title}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('level_label', { level: stats.explorerLevel.level })} • {stats.explorerLevel.nextLevelAt ? t('next_level_at', { count: stats.explorerLevel.nextLevelAt }) : 'Max Rank'}
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(stats.explorerLevel.level / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Continent Exploration Grid */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white font-display">
              {t('continent_exploration')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('continent_exploration_desc')}
            </p>
          </div>
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('share_travel_stats')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {Object.entries(stats.continentStats).map(([code, c]) => {
            const info = CONTINENTS[code as keyof typeof CONTINENTS];

            return (
              <div
                key={code}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info?.icon || '🌍'}</span>
                    <div>
                      <div className="font-bold text-xs text-white">{info?.name || code}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.visited} of {c.total} {t('countries_visited')}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-white font-display">
                    {c.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${c.percentage}%`,
                      background: `linear-gradient(90deg, ${activeTheme.primaryColor}, #38bdf8)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Banner Preview */}
      <div 
        onClick={() => setActiveTab('badges')}
        className="p-5 rounded-3xl glass-card border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {t('achievement_showcase')}
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
              {stats.unlockedBadgeIds.length} of 13 {t('nav_badges')}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
          <span>View All Badges</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
