import React from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Map as MapIcon, 
  Globe, 
  MapPin, 
  Trophy, 
  BarChart3, 
  Search, 
  Plus, 
  Share2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    data,
    setIsSearchOpen,
    setIsAddCityOpen,
    setIsShareOpen,
    activeTheme,
    t,
  } = useTravel();

  const navItems = [
    { id: 'map', label: t('nav_map'), icon: MapIcon, badge: null },
    { id: 'countries', label: t('nav_countries'), icon: Globe, badge: `${stats.visitedCountriesCount}` },
    { id: 'cities', label: t('nav_cities'), icon: MapPin, badge: `${stats.visitedCitiesCount}` },
    { id: 'badges', label: t('nav_badges'), icon: Trophy, badge: `${stats.unlockedBadgeIds.length}` },
    { id: 'stats', label: t('nav_stats'), icon: BarChart3, badge: `${stats.worldPercentage}%` },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl h-[calc(100vh-4rem)] p-4 select-none shrink-0">
      {/* Top Profile Card */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">{t('profile_title')}</div>
            <div className="font-bold text-sm text-white font-display truncate max-w-[130px]">
              {data.userName || 'World Traveler'}
            </div>
            <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
              {stats.explorerLevel.title}
            </div>
          </div>

          {/* Mini World % Circle */}
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray={`${stats.worldPercentage}, 100`}
                strokeLinecap="round"
                stroke={activeTheme.primaryColor}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-white">
              {stats.worldPercentage}%
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-orange-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Quick Tools */}
      <div className="space-y-2 pt-4 border-t border-slate-800/80">
        {/* Quick Search */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('search_places')}</span>
          </div>
          <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Pin City */}
        <button
          onClick={() => setIsAddCityOpen(true)}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t('pin_custom_place')}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setIsShareOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.primaryColor}, #ea580c)`,
            boxShadow: `0 4px 14px ${activeTheme.primaryColor}40`,
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t('share_card')}</span>
        </button>
      </div>
    </aside>
  );
};
