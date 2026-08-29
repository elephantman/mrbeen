import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTravel } from '../../context/TravelContext';
import { Cloud, X, ShieldCheck } from 'lucide-react';

export const CloudBackupPrompt: React.FC = () => {
  const { user, signInWithGoogle, isFirebaseReady } = useAuth();
  const { stats, t } = useTravel();
  const [isVisible, setIsVisible] = useState(false);

  const totalVisited = stats.visitedCountriesCount + stats.visitedCitiesCount;

  useEffect(() => {
    // Show after user marks 4 or more places if not signed in
    if (!user && totalVisited >= 4) {
      const isDismissed = sessionStorage.getItem('dismissed_cloud_backup_prompt');
      if (!isDismissed) {
        // Small delay to feel natural and non-intrusive
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [user, totalVisited]);

  const handleDismiss = () => {
    sessionStorage.setItem('dismissed_cloud_backup_prompt', 'true');
    setIsVisible(false);
  };

  const handleConnect = async () => {
    const success = await signInWithGoogle();
    if (success) {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full mx-4 sm:mx-0 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="p-5 rounded-3xl glass-card border border-orange-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/95 to-orange-950/40 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Close Icon */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Cloud Icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Cloud className="w-5 h-5 animate-pulse" />
          </div>

          <div className="pr-4">
            <h4 className="font-bold text-sm text-white font-display">
              {t('cloud_prompt_title')}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {t('cloud_prompt_desc', { count: totalVisited })}
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free & Safe</span>
          </div>
          <span>•</span>
          <span>Cross-Device Sync</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            {t('cloud_prompt_later')}
          </button>

          <button
            onClick={handleConnect}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Google G Logo */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{t('cloud_prompt_connect')}</span>
          </button>
        </div>

        {!isFirebaseReady && (
          <p className="text-[10px] text-amber-400 mt-2 text-center">
            * Firebase keys need to be added to .env
          </p>
        )}
      </div>
    </div>
  );
};
