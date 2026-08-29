import React from 'react';
import { useTravel } from '../../context/TravelContext';
import { Map as MapIcon, Globe, MapPin, Trophy, BarChart3 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeTheme, t } = useTravel();

  const tabs = [
    { id: 'map', label: t('nav_map').split(' ')[0], icon: MapIcon },
    { id: 'countries', label: t('nav_countries'), icon: Globe },
    { id: 'cities', label: t('nav_cities'), icon: MapPin },
    { id: 'badges', label: t('nav_badges').split(' ')[0], icon: Trophy },
    { id: 'stats', label: t('nav_stats').split(' ')[0], icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all ${
              isActive ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform ${
                isActive ? 'scale-110' : ''
              }`}
              style={{ color: isActive ? activeTheme.primaryColor : undefined }}
            />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
