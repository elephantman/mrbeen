import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserTravelData,
  TravelStatsState,
  MapMode,
  ThemeConfig,
  VisitedCountryRecord,
  VisitedCityRecord,
} from '../types/travel';
import { loadStoredTravelData, saveStoredTravelData, exportUserDataAsJSON, parseImportedJSON, DEFAULT_USER_DATA } from '../utils/storage';
import { calculateTravelStats } from '../utils/geoCalculations';
import { THEMES, DEFAULT_THEME } from '../data/themes';
import { SAMPLE_PRESETS } from '../data/sampleProfiles';
import { POPULAR_CITIES } from '../data/cities';
import { TRANSLATIONS, Language } from '../i18n/translations';

interface TravelContextType {
  data: UserTravelData;
  stats: TravelStatsState;
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  activeTheme: ThemeConfig;
  setTheme: (themeId: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  
  // Selection and navigation modals
  selectedCountryId: string | null;
  setSelectedCountryId: (id: string | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isShareOpen: boolean;
  setIsShareOpen: (open: boolean) => void;
  isAddCityOpen: boolean;
  setIsAddCityOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  activeTab: 'map' | 'countries' | 'cities' | 'badges' | 'stats';
  setActiveTab: (tab: 'map' | 'countries' | 'cities' | 'badges' | 'stats') => void;

  // Actions
  toggleCountryVisited: (countryId: string, visited?: boolean) => void;
  toggleCountryWishlist: (countryId: string) => void;
  updateCountryRecord: (countryId: string, updates: Partial<VisitedCountryRecord>) => void;
  
  toggleCityVisited: (cityId: string, customCityInfo?: Partial<VisitedCityRecord>) => void;
  toggleCityWishlist: (city: { id: string; name: string; countryId: string; lat: number; lng: number }) => void;
  addCustomCity: (city: { name: string; countryId: string; lat: number; lng: number; notes?: string }) => void;
  removeCustomCity: (cityId: string) => void;
  
  setUserName: (name: string) => void;
  setTagline: (tagline: string) => void;
  loadPreset: (presetId: string) => void;
  loadUserData: (newData: UserTravelData) => void;
  clearAllData: () => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<boolean>;
  triggerCelebration: () => void;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export const TravelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<UserTravelData>(() => loadStoredTravelData());
  const [mapMode, setMapMode] = useState<MapMode>('2d');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'countries' | 'cities' | 'badges' | 'stats'>('map');

  const language = data.language || 'en';

  const setLanguage = useCallback((lang: Language) => {
    setData(prev => ({ ...prev, language: lang }));
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let text = (dict as any)[key] || (TRANSLATIONS.en as any)[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  }, [language]);

  // Save changes to localStorage
  useEffect(() => {
    saveStoredTravelData(data);
  }, [data]);

  // Compute travel stats
  const stats = useMemo(() => calculateTravelStats(data), [data]);

  // Theme
  const activeTheme = useMemo(() => {
    return THEMES.find(t => t.id === data.activeThemeId) || DEFAULT_THEME;
  }, [data.activeThemeId]);

  const setTheme = useCallback((themeId: string) => {
    setData(prev => ({ ...prev, activeThemeId: themeId }));
  }, []);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [activeTheme.primaryColor, '#ffffff', '#fb923c', '#38bdf8'],
      });
    } catch {
      // ignore
    }
  }, [activeTheme]);

  const toggleCountryVisited = useCallback((countryId: string, forceVisited?: boolean) => {
    setData(prev => {
      const nextVisited = { ...prev.visitedCountries };
      const nextWishlist = { ...prev.wishlistCountries };
      const isCurrentlyVisited = !!nextVisited[countryId];
      const shouldVisit = forceVisited !== undefined ? forceVisited : !isCurrentlyVisited;

      if (shouldVisit) {
        nextVisited[countryId] = {
          id: countryId,
          visitedAt: new Date().toISOString(),
          rating: 5,
        };
        delete nextWishlist[countryId];
      } else {
        delete nextVisited[countryId];
      }

      return {
        ...prev,
        visitedCountries: nextVisited,
        wishlistCountries: nextWishlist,
      };
    });

    if (!data.visitedCountries[countryId]) {
      triggerCelebration();
    }
  }, [data.visitedCountries, triggerCelebration]);

  const toggleCountryWishlist = useCallback((countryId: string) => {
    setData(prev => {
      const nextWishlist = { ...prev.wishlistCountries };
      if (nextWishlist[countryId]) {
        delete nextWishlist[countryId];
      } else {
        nextWishlist[countryId] = {
          id: countryId,
          addedAt: new Date().toISOString(),
        };
      }
      return { ...prev, wishlistCountries: nextWishlist };
    });
  }, []);

  const updateCountryRecord = useCallback((countryId: string, updates: Partial<VisitedCountryRecord>) => {
    setData(prev => {
      if (!prev.visitedCountries[countryId]) return prev;
      return {
        ...prev,
        visitedCountries: {
          ...prev.visitedCountries,
          [countryId]: {
            ...prev.visitedCountries[countryId],
            ...updates,
          },
        },
      };
    });
  }, []);

  const toggleCityVisited = useCallback((cityId: string, customCityInfo?: Partial<VisitedCityRecord>) => {
    setData(prev => {
      const nextCities = { ...prev.visitedCities };
      const nextWishlistCities = { ...prev.wishlistCities };
      const isVisited = !!nextCities[cityId];

      if (isVisited) {
        delete nextCities[cityId];
      } else {
        const found = POPULAR_CITIES.find(c => c.id === cityId);
        if (found) {
          nextCities[cityId] = {
            id: found.id,
            name: found.name,
            countryId: found.countryId,
            lat: found.lat,
            lng: found.lng,
            visitedAt: new Date().toISOString(),
            ...customCityInfo,
          };
          const nextCountries = { ...prev.visitedCountries };
          if (!nextCountries[found.countryId]) {
            nextCountries[found.countryId] = {
              id: found.countryId,
              visitedAt: new Date().toISOString(),
            };
          }
          delete nextWishlistCities[cityId];
          return {
            ...prev,
            visitedCountries: nextCountries,
            visitedCities: nextCities,
            wishlistCities: nextWishlistCities,
          };
        } else if (customCityInfo && customCityInfo.name && customCityInfo.countryId) {
          nextCities[cityId] = {
            id: cityId,
            name: customCityInfo.name,
            countryId: customCityInfo.countryId,
            lat: customCityInfo.lat || 0,
            lng: customCityInfo.lng || 0,
            visitedAt: new Date().toISOString(),
            ...customCityInfo,
          };
          delete nextWishlistCities[cityId];
        }
      }

      return {
        ...prev,
        visitedCities: nextCities,
        wishlistCities: nextWishlistCities,
      };
    });
  }, []);

  const toggleCityWishlist = useCallback((city: { id: string; name: string; countryId: string; lat: number; lng: number }) => {
    setData(prev => {
      const nextWishlist = { ...prev.wishlistCities };
      if (nextWishlist[city.id]) {
        delete nextWishlist[city.id];
      } else {
        nextWishlist[city.id] = { ...city };
      }
      return { ...prev, wishlistCities: nextWishlist };
    });
  }, []);

  const addCustomCity = useCallback((city: { name: string; countryId: string; lat: number; lng: number; notes?: string }) => {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newRecord: VisitedCityRecord = {
      id,
      name: city.name,
      countryId: city.countryId,
      lat: city.lat,
      lng: city.lng,
      notes: city.notes,
      visitedAt: new Date().toISOString(),
      isCustom: true,
    };

    setData(prev => {
      const nextCountries = { ...prev.visitedCountries };
      if (!nextCountries[city.countryId]) {
        nextCountries[city.countryId] = {
          id: city.countryId,
          visitedAt: new Date().toISOString(),
        };
      }
      return {
        ...prev,
        visitedCountries: nextCountries,
        visitedCities: { ...prev.visitedCities, [id]: newRecord },
        customCities: [...(prev.customCities || []), newRecord],
      };
    });

    triggerCelebration();
  }, [triggerCelebration]);

  const removeCustomCity = useCallback((cityId: string) => {
    setData(prev => {
      const nextCities = { ...prev.visitedCities };
      delete nextCities[cityId];
      return {
        ...prev,
        visitedCities: nextCities,
        customCities: (prev.customCities || []).filter(c => c.id !== cityId),
      };
    });
  }, []);

  const setUserName = useCallback((name: string) => {
    setData(prev => ({ ...prev, userName: name }));
  }, []);

  const setTagline = useCallback((tagline: string) => {
    setData(prev => ({ ...prev, tagline }));
  }, []);

  const loadPreset = useCallback((presetId: string) => {
    const preset = SAMPLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setData(prev => ({ ...preset.data, language: prev.language || 'en' }));
      triggerCelebration();
    }
  }, [triggerCelebration]);

  const loadUserData = useCallback((newData: UserTravelData) => {
    setData(newData);
  }, []);

  const clearAllData = useCallback(() => {
    setData(prev => ({
      ...DEFAULT_USER_DATA,
      activeThemeId: prev.activeThemeId,
      language: prev.language || 'en',
    }));
  }, []);

  const exportJSON = useCallback(() => {
    exportUserDataAsJSON(data);
  }, [data]);

  const importJSON = useCallback(async (file: File): Promise<boolean> => {
    try {
      const parsed = await parseImportedJSON(file);
      setData(prev => ({ ...parsed, language: prev.language || 'en' }));
      triggerCelebration();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [triggerCelebration]);

  return (
    <TravelContext.Provider
      value={{
        data,
        stats,
        mapMode,
        setMapMode,
        activeTheme,
        setTheme,
        language,
        setLanguage,
        t,
        selectedCountryId,
        setSelectedCountryId,
        isSearchOpen,
        setIsSearchOpen,
        isShareOpen,
        setIsShareOpen,
        isAddCityOpen,
        setIsAddCityOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        activeTab,
        setActiveTab,
        toggleCountryVisited,
        toggleCountryWishlist,
        updateCountryRecord,
        toggleCityVisited,
        toggleCityWishlist,
        addCustomCity,
        removeCustomCity,
        setUserName,
        setTagline,
        loadPreset,
        loadUserData,
        clearAllData,
        exportJSON,
        importJSON,
        triggerCelebration,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};
