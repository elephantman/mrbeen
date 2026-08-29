import { BadgeDefinition } from '../types/travel';

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Mark your very first country as visited.',
    icon: '🧭',
    category: 'milestone',
    requiredCount: 1,
    calculateProgress: (state) => ({
      current: Math.min(1, state.visitedCountriesCount),
      total: 1,
      unlocked: state.visitedCountriesCount >= 1,
    }),
  },
  {
    id: 'wanderer',
    title: 'Wanderer',
    description: 'Visit at least 5 different countries.',
    icon: '🎒',
    category: 'countries',
    requiredCount: 5,
    calculateProgress: (state) => ({
      current: Math.min(5, state.visitedCountriesCount),
      total: 5,
      unlocked: state.visitedCountriesCount >= 5,
    }),
  },
  {
    id: 'globetrotter',
    title: 'Globetrotter',
    description: 'Explore 15 or more countries around the world.',
    icon: '🌍',
    category: 'countries',
    requiredCount: 15,
    calculateProgress: (state) => ({
      current: Math.min(15, state.visitedCountriesCount),
      total: 15,
      unlocked: state.visitedCountriesCount >= 15,
    }),
  },
  {
    id: 'world-citizen',
    title: 'World Citizen',
    description: 'Reach an impressive milestone of 30+ countries!',
    icon: '👑',
    category: 'countries',
    requiredCount: 30,
    calculateProgress: (state) => ({
      current: Math.min(30, state.visitedCountriesCount),
      total: 30,
      unlocked: state.visitedCountriesCount >= 30,
    }),
  },
  {
    id: 'euro-explorer',
    title: 'Euro Explorer',
    description: 'Visit at least 5 countries in Europe.',
    icon: '🏰',
    category: 'continents',
    requiredCount: 5,
    targetContinent: 'EU',
    calculateProgress: (state) => {
      const visited = state.continentStats.EU?.visited || 0;
      return {
        current: Math.min(5, visited),
        total: 5,
        unlocked: visited >= 5,
      };
    },
  },
  {
    id: 'asian-odyssey',
    title: 'Asian Odyssey',
    description: 'Discover 4 countries across Asia.',
    icon: '🏮',
    category: 'continents',
    requiredCount: 4,
    targetContinent: 'AS',
    calculateProgress: (state) => {
      const visited = state.continentStats.AS?.visited || 0;
      return {
        current: Math.min(4, visited),
        total: 4,
        unlocked: visited >= 4,
      };
    },
  },
  {
    id: 'american-dream',
    title: 'Pan-American Pioneer',
    description: 'Explore 3 countries in the Americas (NA or SA).',
    icon: '🗽',
    category: 'continents',
    requiredCount: 3,
    calculateProgress: (state) => {
      const visited = (state.continentStats.NA?.visited || 0) + (state.continentStats.SA?.visited || 0);
      return {
        current: Math.min(3, visited),
        total: 3,
        unlocked: visited >= 3,
      };
    },
  },
  {
    id: 'african-safari',
    title: 'African Voyager',
    description: 'Step foot in 2 or more countries in Africa.',
    icon: '🦁',
    category: 'continents',
    requiredCount: 2,
    targetContinent: 'AF',
    calculateProgress: (state) => {
      const visited = state.continentStats.AF?.visited || 0;
      return {
        current: Math.min(2, visited),
        total: 2,
        unlocked: visited >= 2,
      };
    },
  },
  {
    id: 'oceania-hopper',
    title: 'Oceania Hopper',
    description: 'Visit Australia, New Zealand or Pacific islands.',
    icon: '🦘',
    category: 'continents',
    requiredCount: 1,
    targetContinent: 'OC',
    calculateProgress: (state) => {
      const visited = state.continentStats.OC?.visited || 0;
      return {
        current: Math.min(1, visited),
        total: 1,
        unlocked: visited >= 1,
      };
    },
  },
  {
    id: 'city-collector',
    title: 'Urban Explorer',
    description: 'Pin 5 or more distinct world cities.',
    icon: '🏙️',
    category: 'cities',
    requiredCount: 5,
    calculateProgress: (state) => ({
      current: Math.min(5, state.visitedCitiesCount),
      total: 5,
      unlocked: state.visitedCitiesCount >= 5,
    }),
  },
  {
    id: 'metropolis-master',
    title: 'Metropolis Master',
    description: 'Mark 15 or more world cities on your map.',
    icon: '🌆',
    category: 'cities',
    requiredCount: 15,
    calculateProgress: (state) => ({
      current: Math.min(15, state.visitedCitiesCount),
      total: 15,
      unlocked: state.visitedCitiesCount >= 15,
    }),
  },
  {
    id: 'tri-continental',
    title: 'Tri-Continental',
    description: 'Visit countries in at least 3 different continents.',
    icon: '🌐',
    category: 'special',
    requiredCount: 3,
    calculateProgress: (state) => {
      const continentCount = Object.values(state.continentStats).filter(c => c.visited > 0).length;
      return {
        current: Math.min(3, continentCount),
        total: 3,
        unlocked: continentCount >= 3,
      };
    },
  },
  {
    id: 'world-conqueror',
    title: '5 Continents Club',
    description: 'Touch down on 5 different continents!',
    icon: '🏆',
    category: 'special',
    requiredCount: 5,
    calculateProgress: (state) => {
      const continentCount = Object.values(state.continentStats).filter(c => c.visited > 0).length;
      return {
        current: Math.min(5, continentCount),
        total: 5,
        unlocked: continentCount >= 5,
      };
    },
  }
];
