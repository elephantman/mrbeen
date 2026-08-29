import React from 'react';
import { useTravel } from '../../context/TravelContext';
import { BADGES } from '../../data/badges';
import { BadgeDefinition } from '../../types/travel';
import { Trophy, Lock, CheckCircle2 } from 'lucide-react';

export const BadgeGallery: React.FC = () => {
  const { stats, triggerCelebration, t } = useTravel();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-card relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-display text-white">
              {t('badges_title')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {t('badges_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-2 font-bold text-sm">
            <span>{stats.unlockedBadgeIds.length} / {BADGES.length}</span>
            <span className="text-xs font-normal text-amber-300/80">{t('unlocked_label')}</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGES.map((badge: BadgeDefinition) => {
          const isUnlocked = stats.unlockedBadgeIds.includes(badge.id);
          const progress = badge.calculateProgress(stats);

          return (
            <div
              key={badge.id}
              onClick={() => {
                if (isUnlocked) triggerCelebration();
              }}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                isUnlocked
                  ? 'glass-card border-amber-500/30 hover:border-amber-500/60 hover:scale-[1.02] cursor-pointer shadow-lg'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-60'
              }`}
            >
              <div>
                {/* Badge Icon & Status */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                      isUnlocked
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('unlocked_label')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                      <Lock className="w-3 h-3" />
                      {t('locked_label')}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-white mb-1 font-display">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
                  <span>{t('progress_label')}</span>
                  <span className={isUnlocked ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-amber-400' : 'bg-slate-600'
                    }`}
                    style={{
                      width: `${Math.min(100, (progress.current / progress.total) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
