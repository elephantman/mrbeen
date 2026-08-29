import React, { useState, useRef, useEffect } from 'react';
import { useTravel } from '../../context/TravelContext';
import { THEMES } from '../../data/themes';
import { SAMPLE_PRESETS } from '../../data/sampleProfiles';
import { 
  Globe2, 
  Map as MapIcon, 
  Search, 
  Share2, 
  Palette, 
  Sparkles, 
  Download, 
  Upload, 
  Trash2, 
  ChevronDown,
  Trophy,
  Check,
  Settings
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    stats,
    mapMode,
    setMapMode,
    activeTheme,
    setTheme,
    setIsSearchOpen,
    setIsShareOpen,
    setIsSettingsOpen,
    loadPreset,
    clearAllData,
    exportJSON,
    importJSON,
    language,
    t,
  } = useTravel();

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const presetDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setPresetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importJSON(file);
      e.target.value = '';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 px-3 md:px-6 flex items-center justify-between">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{ 
            background: `linear-gradient(135deg, ${activeTheme.primaryColor}, #ea580c)`,
            boxShadow: `0 0 20px ${activeTheme.primaryColor}55`
          }}
        >
          <Globe2 className="w-5 h-5 text-white animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-xl tracking-tight text-white">
              been<span style={{ color: activeTheme.primaryColor }}>.</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Explorer
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            {t('app_tagline')}
          </p>
        </div>
      </div>

      {/* Stats Quick Pill */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 shadow-inner">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTheme.primaryColor }} />
          <span>{stats.visitedCountriesCount}</span>
          <span className="text-slate-500 font-normal">/ {stats.totalCountries} {t('countries_visited')}</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <span className="text-slate-400 font-normal">{t('world_visited')}:</span>
          <span style={{ color: activeTheme.primaryColor }}>{stats.worldPercentage}%</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
          <Trophy className="w-3.5 h-3.5" />
          <span>{stats.explorerLevel.title}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-medium group"
          title={`${t('search_places')} (Cmd+K)`}
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          <span className="hidden md:inline">{t('search_places')}</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* 2D / 3D Map Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
          <button
            onClick={() => setMapMode('2d')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mapMode === '2d'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('map_2d')}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('map_2d')}</span>
          </button>
          <button
            onClick={() => setMapMode('3d')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mapMode === '3d'
                ? 'bg-slate-800 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t('globe_3d')}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('globe_3d')}</span>
          </button>
        </div>

        {/* Theme Picker Dropdown */}
        <div className="relative" ref={themeDropdownRef}>
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1"
            title={t('theme_presets')}
          >
            <Palette className="w-4 h-4" style={{ color: activeTheme.primaryColor }} />
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('theme_presets')}
              </div>
              <div className="space-y-1 mt-1">
                {THEMES.map((theme) => {
                  const isActive = theme.id === activeTheme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setTheme(theme.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span>{theme.name}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Options & Presets Dropdown */}
        <div className="relative" ref={presetDropdownRef}>
          <button
            onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1"
            title={t('demo_presets')}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {presetDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('demo_presets')}
              </div>
              <div className="space-y-1 mt-1">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      loadPreset(preset.id);
                      setPresetDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <span className="text-base">{preset.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{preset.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="my-2 border-t border-slate-800" />

              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('backup_data')}
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    exportJSON();
                    setPresetDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('export_backup')}</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setPresetDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('import_backup')}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(t('reset_confirm'))) {
                      clearAllData();
                    }
                    setPresetDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('reset_data')}</span>
                </button>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group"
          title={t('settings')}
        >
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-45" />
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider hidden xl:inline">
            {language === 'tr' ? 'TR 🇹🇷' : 'EN 🇺🇸'}
          </span>
        </button>

        {/* Primary Share Studio Button */}
        <button
          onClick={() => setIsShareOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-white font-semibold text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.primaryColor}, #ea580c)`,
            boxShadow: `0 0 16px ${activeTheme.primaryColor}55`
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t('share_card')}</span>
        </button>
      </div>
    </header>
  );
};
