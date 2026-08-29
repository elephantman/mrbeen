import { UserTravelData, TravelStatsState } from '../types/travel';
import { COUNTRIES, CONTINENTS, TOTAL_WORLD_COUNTRIES, TOTAL_WORLD_LAND_AREA } from '../data/countries';
import { BADGES } from '../data/badges';
import { ContinentCode } from '../types/geo';

export const calculateTravelStats = (data: UserTravelData): TravelStatsState => {
  const visitedCountryIds = Object.keys(data.visitedCountries);
  const visitedCountriesCount = visitedCountryIds.length;
  const visitedCitiesCount = Object.keys(data.visitedCities).length;

  const continentStats: Record<ContinentCode, { visited: number; total: number; percentage: number }> = {
    EU: { visited: 0, total: CONTINENTS.EU.totalCountries, percentage: 0 },
    AS: { visited: 0, total: CONTINENTS.AS.totalCountries, percentage: 0 },
    AF: { visited: 0, total: CONTINENTS.AF.totalCountries, percentage: 0 },
    NA: { visited: 0, total: CONTINENTS.NA.totalCountries, percentage: 0 },
    SA: { visited: 0, total: CONTINENTS.SA.totalCountries, percentage: 0 },
    OC: { visited: 0, total: CONTINENTS.OC.totalCountries, percentage: 0 },
    AN: { visited: 0, total: CONTINENTS.AN.totalCountries, percentage: 0 },
  };

  let totalAreaCoveredKm2 = 0;

  const countryMap = new Map(COUNTRIES.map(c => [c.id, c]));

  visitedCountryIds.forEach(id => {
    const c = countryMap.get(id);
    if (c) {
      if (continentStats[c.continent]) {
        continentStats[c.continent].visited += 1;
      }
      totalAreaCoveredKm2 += c.areaKm2 || 0;
    }
  });

  // Calculate percentages
  Object.keys(continentStats).forEach(key => {
    const k = key as ContinentCode;
    const stat = continentStats[k];
    stat.percentage = stat.total > 0 ? Math.round((stat.visited / stat.total) * 100) : 0;
  });

  const worldPercentage = Math.round((visitedCountriesCount / TOTAL_WORLD_COUNTRIES) * 100);
  const worldAreaPercentage = Math.min(100, Math.round((totalAreaCoveredKm2 / TOTAL_WORLD_LAND_AREA) * 100));

  // Explorer Level Calculation
  const explorerLevels = [
    { level: 1, title: 'Armchair Dreamer', nextLevelAt: 1 },
    { level: 2, title: 'First-time Tourist', nextLevelAt: 3 },
    { level: 3, title: 'Curious Wanderer', nextLevelAt: 7 },
    { level: 4, title: 'Voyager', nextLevelAt: 15 },
    { level: 5, title: 'Globetrotter', nextLevelAt: 25 },
    { level: 6, title: 'World Citizen', nextLevelAt: 40 },
    { level: 7, title: 'Legendary Explorer', nextLevelAt: 70 },
  ];

  let currentLevel = explorerLevels[0];
  for (let i = 0; i < explorerLevels.length; i++) {
    if (visitedCountriesCount >= explorerLevels[i].nextLevelAt) {
      currentLevel = explorerLevels[i];
    }
  }

  const nextLevel = explorerLevels.find(l => l.level === currentLevel.level + 1) || currentLevel;
  const prevThreshold = currentLevel.nextLevelAt;
  const nextThreshold = nextLevel.nextLevelAt;
  const levelProgress = nextThreshold > prevThreshold
    ? Math.min(100, Math.round(((visitedCountriesCount - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
    : 100;

  const tempState: TravelStatsState = {
    totalCountries: TOTAL_WORLD_COUNTRIES,
    visitedCountriesCount,
    worldPercentage,
    visitedCitiesCount,
    continentStats,
    totalAreaCoveredKm2,
    worldAreaPercentage,
    explorerLevel: {
      level: currentLevel.level,
      title: currentLevel.title,
      nextLevelAt: nextLevel.nextLevelAt,
      progress: levelProgress,
    },
    unlockedBadgeIds: [],
  };

  // Badges unlock check
  const unlockedBadgeIds = BADGES.filter(b => b.calculateProgress(tempState).unlocked).map(b => b.id);
  tempState.unlockedBadgeIds = unlockedBadgeIds;

  return tempState;
};
