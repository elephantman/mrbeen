import { ContinentCode } from './geo';

export interface VisitedCountryRecord {
  id: string; // alpha-3 code
  firstVisitedYear?: number;
  rating?: number; // 1-5
  notes?: string;
  visitedAt: string; // ISO string
}

export interface VisitedCityRecord {
  id: string;
  name: string;
  countryId: string;
  lat: number;
  lng: number;
  visitedAt: string;
  notes?: string;
  isCustom?: boolean;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'countries' | 'continents' | 'cities' | 'milestone' | 'special';
  requiredCount: number;
  targetContinent?: ContinentCode;
  calculateProgress: (state: TravelStatsState) => { current: number; total: number; unlocked: boolean };
}

export interface TravelStatsState {
  totalCountries: number;
  visitedCountriesCount: number;
  worldPercentage: number;
  visitedCitiesCount: number;
  continentStats: Record<ContinentCode, { visited: number; total: number; percentage: number }>;
  totalAreaCoveredKm2: number;
  worldAreaPercentage: number;
  explorerLevel: {
    level: number;
    title: string;
    nextLevelAt: number;
    progress: number;
  };
  unlockedBadgeIds: string[];
}

export type MapMode = '2d' | '3d';

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  visitedFill: string;
  visitedHover: string;
  wishlistFill: string;
  cityPinColor: string;
  cityPinGlow: string;
  oceanColor: string;
  landColor: string;
  landStroke: string;
  cardBg: string;
  accentGradient: string;
}

export interface UserTravelData {
  version: number;
  userName: string;
  tagline: string;
  visitedCountries: Record<string, VisitedCountryRecord>;
  visitedCities: Record<string, VisitedCityRecord>;
  wishlistCountries: Record<string, { id: string; addedAt: string }>;
  wishlistCities: Record<string, { id: string; name: string; countryId: string; lat: number; lng: number }>;
  customCities: VisitedCityRecord[];
  activeThemeId: string;
  language?: 'en' | 'tr';
}
