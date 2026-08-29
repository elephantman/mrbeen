import { UserTravelData } from '../types/travel';
import { DEFAULT_THEME } from '../data/themes';

const STORAGE_KEY = 'been_app_travel_data_v1';

export const DEFAULT_USER_DATA: UserTravelData = {
  version: 1,
  userName: 'World Traveler',
  tagline: 'Collecting moments and passport stamps ✨',
  visitedCountries: {},
  visitedCities: {},
  wishlistCountries: {},
  wishlistCities: {},
  customCities: [],
  activeThemeId: DEFAULT_THEME.id,
};

export const loadStoredTravelData = (): UserTravelData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_DATA,
      ...parsed,
      visitedCountries: parsed.visitedCountries || {},
      visitedCities: parsed.visitedCities || {},
      wishlistCountries: parsed.wishlistCountries || {},
      wishlistCities: parsed.wishlistCities || {},
      customCities: parsed.customCities || [],
    };
  } catch (err) {
    console.error('Error reading stored travel data:', err);
    return DEFAULT_USER_DATA;
  }
};

export const saveStoredTravelData = (data: UserTravelData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving travel data:', err);
  }
};

export const exportUserDataAsJSON = (data: UserTravelData): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `been-travels-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const parseImportedJSON = (file: File): Promise<UserTravelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (typeof parsed !== 'object' || !parsed) {
          throw new Error('Invalid JSON structure');
        }
        resolve({
          ...DEFAULT_USER_DATA,
          ...parsed,
          visitedCountries: parsed.visitedCountries || {},
          visitedCities: parsed.visitedCities || {},
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
