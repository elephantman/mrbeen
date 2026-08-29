import React, { useMemo } from 'react';
import { useTravel } from '../../context/TravelContext';
import { COUNTRIES } from '../../data/countries';
import { Globe, Trophy } from 'lucide-react';

export type CardFormat = 'story' | 'square' | 'banner';
export type CardTheme = 'classic' | 'luxury' | 'sunset' | 'cyber' | 'passport';

interface ShareCardPreviewProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  format: CardFormat;
  theme: CardTheme;
  customName: string;
  customTagline: string;
  showFlags: boolean;
  showStats: boolean;
  showLevel: boolean;
}

export const ShareCardPreview: React.FC<ShareCardPreviewProps> = ({
  cardRef,
  format,
  theme,
  customName,
  customTagline,
  showFlags,
  showStats,
  showLevel,
}) => {
  const { data, stats } = useTravel();

  const visitedCountriesList = useMemo(() => {
    const ids = Object.keys(data.visitedCountries);
    return COUNTRIES.filter((c) => ids.includes(c.id));
  }, [data.visitedCountries]);

  // Dimension styling based on format
  const getContainerStyle = () => {
    switch (format) {
      case 'story': // 9:16
        return 'w-[340px] h-[600px] sm:w-[380px] sm:h-[675px]';
      case 'square': // 1:1
        return 'w-[340px] h-[340px] sm:w-[420px] sm:h-[420px]';
      case 'banner': // 16:9
        return 'w-[360px] h-[202px] sm:w-[500px] sm:h-[281px]';
    }
  };

  // Visual Theme styling
  const getThemeStyles = () => {
    switch (theme) {
      case 'luxury':
        return {
          bg: 'bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border-amber-500/40 text-white',
          accent: '#eab308',
          badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          gradientText: 'from-amber-200 via-yellow-400 to-amber-600',
          glow: 'rgba(234, 179, 8, 0.25)',
        };
      case 'sunset':
        return {
          bg: 'bg-gradient-to-br from-purple-950 via-slate-950 to-rose-950 border-rose-500/40 text-white',
          accent: '#f43f5e',
          badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          gradientText: 'from-rose-300 via-pink-400 to-purple-400',
          glow: 'rgba(244, 63, 94, 0.25)',
        };
      case 'cyber':
        return {
          bg: 'bg-gradient-to-b from-slate-950 via-cyan-950/40 to-slate-950 border-cyan-500/40 text-white',
          accent: '#06b6d4',
          badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          gradientText: 'from-cyan-300 via-teal-300 to-emerald-400',
          glow: 'rgba(6, 182, 212, 0.3)',
        };
      case 'passport':
        return {
          bg: 'bg-[#18231c] border-emerald-600/40 text-amber-100',
          accent: '#10b981',
          badgeBg: 'bg-emerald-950/80 border-emerald-600/40 text-emerald-300',
          gradientText: 'from-amber-100 to-emerald-200',
          glow: 'rgba(16, 185, 129, 0.2)',
        };
      case 'classic':
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950/60 border-orange-500/40 text-white',
          accent: '#f97316',
          badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
          gradientText: 'from-orange-300 via-amber-300 to-orange-500',
          glow: 'rgba(249, 115, 22, 0.3)',
        };
    }
  };

  const currentTheme = getThemeStyles();

  return (
    <div
      ref={cardRef}
      className={`relative rounded-3xl p-6 border shadow-2xl overflow-hidden flex flex-col justify-between select-none ${getContainerStyle()} ${currentTheme.bg}`}
      style={{
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px ${currentTheme.glow}`,
      }}
    >
      {/* Background Decorative Rings & Watermark */}
      <div 
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: currentTheme.accent }}
      />
      <div 
        className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.accent }}
      />

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Card Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          {/* App Branding */}
          <div className="flex items-center gap-2">
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-extrabold text-sm tracking-tight text-white">
              been<span style={{ color: currentTheme.accent }}>.</span>app
            </span>
          </div>

          {/* Explorer Level Pill */}
          {showLevel && (
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-sm ${currentTheme.badgeBg}`}>
              <Trophy className="w-3 h-3" />
              <span>{stats.explorerLevel.title}</span>
            </div>
          )}
        </div>

        {/* User Name & Tagline */}
        <div className="mt-4">
          <h2 
            className={`text-xl sm:text-2xl font-extrabold font-display tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${currentTheme.gradientText}`}
          >
            {customName || data.userName || 'Travel Map'}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">
            {customTagline || data.tagline || 'Passport stamps & adventures'}
          </p>
        </div>
      </div>

      {/* Centerpiece: Hero Numbers / Visual Stats */}
      <div className="relative z-10 my-auto py-3">
        {showStats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Countries Visited */}
            <div className={`p-2.5 rounded-2xl border backdrop-blur-md ${currentTheme.badgeBg}`}>
              <div className="text-2xl sm:text-3xl font-black font-display text-white">
                {stats.visitedCountriesCount}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">
                Countries
              </div>
            </div>

            {/* World % */}
            <div className={`p-2.5 rounded-2xl border backdrop-blur-md ${currentTheme.badgeBg}`}>
              <div className="text-2xl sm:text-3xl font-black font-display text-white">
                {stats.worldPercentage}%
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">
                World
              </div>
            </div>

            {/* Cities Pinned */}
            <div className={`p-2.5 rounded-2xl border backdrop-blur-md ${currentTheme.badgeBg}`}>
              <div className="text-2xl sm:text-3xl font-black font-display text-white">
                {stats.visitedCitiesCount}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-0.5">
                Cities
              </div>
            </div>
          </div>
        )}

        {/* Mini Continents Progress or Visual List */}
        {format === 'story' && (
          <div className="mt-4 space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Continents Explored
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(stats.continentStats)
                .filter(([_, s]) => s.visited > 0)
                .slice(0, 4)
                .map(([code, s]) => (
                  <div key={code} className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] font-medium">{code}</span>
                    <span className="font-bold text-[11px]" style={{ color: currentTheme.accent }}>
                      {s.visited} countries
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Flags Strip & Stamp */}
      <div className="relative z-10 pt-2">
        {showFlags && visitedCountriesList.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 overflow-hidden text-xl">
              {visitedCountriesList.slice(0, format === 'story' ? 10 : 8).map((c) => (
                <span key={c.id} title={c.name} className="drop-shadow">
                  {c.flag}
                </span>
              ))}
              {visitedCountriesList.length > (format === 'story' ? 10 : 8) && (
                <span className="text-[11px] font-bold text-slate-400 pl-1">
                  +{visitedCountriesList.length - (format === 'story' ? 10 : 8)}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/10 pt-2.5">
          <span>{new Date().getFullYear()} Travel Explorer</span>
          <span className="font-bold" style={{ color: currentTheme.accent }}>
            #BeenThere #TravelTracker
          </span>
        </div>
      </div>
    </div>
  );
};
