import React, { useRef } from 'react';
import { useTravel } from '../../context/TravelContext';
import { THEMES } from '../../data/themes';
import { 
  X, 
  Settings, 
  Languages, 
  Palette, 
  HardDrive, 
  Download, 
  Upload, 
  Trash2, 
  Check, 
  ShieldCheck 
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    language,
    setLanguage,
    activeTheme,
    setTheme,
    exportJSON,
    importJSON,
    clearAllData,
    t,
  } = useTravel();

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSettingsOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importJSON(file);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: activeTheme.primaryColor }}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-display">
                {t('settings_title')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('settings_subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Language / Dil */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-orange-400" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  {t('section_language')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('section_language_desc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* English */}
              <button
                onClick={() => setLanguage('en')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  language === 'en'
                    ? 'bg-orange-500/15 border-orange-500 text-white font-bold shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🇺🇸</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">English</div>
                    <div className="text-[10px] text-slate-400">Default</div>
                  </div>
                </div>
                {language === 'en' && <Check className="w-4 h-4 text-orange-400" />}
              </button>

              {/* Türkçe */}
              <button
                onClick={() => setLanguage('tr')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  language === 'tr'
                    ? 'bg-orange-500/15 border-orange-500 text-white font-bold shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🇹🇷</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Türkçe</div>
                    <div className="text-[10px] text-slate-400">Turkish</div>
                  </div>
                </div>
                {language === 'tr' && <Check className="w-4 h-4 text-orange-400" />}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/80" />

          {/* Section 2: Visual Theme */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  {t('section_theme')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('section_theme_desc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEMES.map((theme) => {
                const isActive = theme.id === activeTheme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white font-bold border-slate-600 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{theme.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{theme.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800/80" />

          {/* Section 3: Backup & Data Management */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  {t('section_data_privacy')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('section_data_privacy_desc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={exportJSON}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('export_backup')}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('import_backup')}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(t('reset_confirm'))) {
                    clearAllData();
                  }
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 text-xs font-semibold text-rose-400 border border-rose-900/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('reset_data')}</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('app_version')}</span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            {t('close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};
