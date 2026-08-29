import { UserTravelData } from '../types/travel';

export interface SamplePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  data: UserTravelData;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'digital-nomad',
    name: 'Digital Nomad',
    description: 'Tech worker hopping between popular hubs in Europe & Asia',
    icon: '💻',
    data: {
      version: 1,
      userName: 'Alex Rivers',
      tagline: 'Coding from coffee shops worldwide ☕',
      visitedCountries: {
        TUR: { id: 'TUR', visitedAt: '2023-05-10', rating: 5, notes: 'Amazing food in Istanbul!' },
        FRA: { id: 'FRA', visitedAt: '2022-09-15', rating: 5, notes: 'Croissant and museums' },
        DEU: { id: 'DEU', visitedAt: '2023-02-20', rating: 4, notes: 'Tech conference in Berlin' },
        ESP: { id: 'ESP', visitedAt: '2023-07-12', rating: 5, notes: 'Barcelona beach life' },
        PRT: { id: 'PRT', visitedAt: '2023-10-05', rating: 5, notes: 'Lisbon sunset viewpoints' },
        THA: { id: 'THA', visitedAt: '2024-01-15', rating: 5, notes: 'Bangkok street food & coworking' },
        IDN: { id: 'IDN', visitedAt: '2024-02-10', rating: 5, notes: 'Bali nomad hub' },
        JPN: { id: 'JPN', visitedAt: '2024-04-01', rating: 5, notes: 'Tokyo neon & ramen' },
        ARE: { id: 'ARE', visitedAt: '2023-11-20', rating: 4, notes: 'Dubai skyline stopover' },
        GBR: { id: 'GBR', visitedAt: '2022-06-18', rating: 4, notes: 'London museums' },
      },
      visitedCities: {
        ist: { id: 'ist', name: 'Istanbul', countryId: 'TUR', lat: 41.0082, lng: 28.9784, visitedAt: '2023-05-10' },
        par: { id: 'par', name: 'Paris', countryId: 'FRA', lat: 48.8566, lng: 2.3522, visitedAt: '2022-09-15' },
        ber: { id: 'ber', name: 'Berlin', countryId: 'DEU', lat: 52.5200, lng: 13.4050, visitedAt: '2023-02-20' },
        bcn: { id: 'bcn', name: 'Barcelona', countryId: 'ESP', lat: 41.3851, lng: 2.1734, visitedAt: '2023-07-12' },
        lis: { id: 'lis', name: 'Lisbon', countryId: 'PRT', lat: 38.7223, lng: -9.1393, visitedAt: '2023-10-05' },
        bkk: { id: 'bkk', name: 'Bangkok', countryId: 'THA', lat: 13.7563, lng: 100.5018, visitedAt: '2024-01-15' },
        dps: { id: 'dps', name: 'Bali (Denpasar)', countryId: 'IDN', lat: -8.6705, lng: 115.2126, visitedAt: '2024-02-10' },
        tyo: { id: 'tyo', name: 'Tokyo', countryId: 'JPN', lat: 35.6762, lng: 139.6503, visitedAt: '2024-04-01' },
        dxb: { id: 'dxb', name: 'Dubai', countryId: 'ARE', lat: 25.2048, lng: 55.2708, visitedAt: '2023-11-20' },
        lon: { id: 'lon', name: 'London', countryId: 'GBR', lat: 51.5074, lng: -0.1278, visitedAt: '2022-06-18' },
      },
      wishlistCountries: {
        ISL: { id: 'ISL', addedAt: '2024-05-01' },
        NZL: { id: 'NZL', addedAt: '2024-05-01' },
        PER: { id: 'PER', addedAt: '2024-05-01' },
        EGY: { id: 'EGY', addedAt: '2024-05-01' },
      },
      wishlistCities: {},
      customCities: [],
      activeThemeId: 'been-orange',
    }
  },
  {
    id: 'euro-backpacker',
    name: 'Euro Backpacker',
    description: 'Classic Interrail rail adventure across European capitals',
    icon: '🚆',
    data: {
      version: 1,
      userName: 'Maya Sterling',
      tagline: 'Trains, hostels & historical cobblestones 🏰',
      visitedCountries: {
        FRA: { id: 'FRA', visitedAt: '2023-06-01' },
        ITA: { id: 'ITA', visitedAt: '2023-06-08' },
        CHE: { id: 'CHE', visitedAt: '2023-06-15' },
        AUT: { id: 'AUT', visitedAt: '2023-06-20' },
        DEU: { id: 'DEU', visitedAt: '2023-06-25' },
        NLD: { id: 'NLD', visitedAt: '2023-07-01' },
        BEL: { id: 'BEL', visitedAt: '2023-07-06' },
        CZE: { id: 'CZE', visitedAt: '2023-07-12' },
        HUN: { id: 'HUN', visitedAt: '2023-07-18' },
        HRV: { id: 'HRV', visitedAt: '2023-07-24' },
        GRC: { id: 'GRC', visitedAt: '2023-08-01' },
      },
      visitedCities: {
        par: { id: 'par', name: 'Paris', countryId: 'FRA', lat: 48.8566, lng: 2.3522, visitedAt: '2023-06-01' },
        rom: { id: 'rom', name: 'Rome', countryId: 'ITA', lat: 41.9028, lng: 12.4964, visitedAt: '2023-06-08' },
        flr: { id: 'flr', name: 'Florence', countryId: 'ITA', lat: 43.7696, lng: 11.2558, visitedAt: '2023-06-10' },
        ven: { id: 'ven', name: 'Venice', countryId: 'ITA', lat: 45.4408, lng: 12.3155, visitedAt: '2023-06-12' },
        zrh: { id: 'zrh', name: 'Zurich', countryId: 'CHE', lat: 47.3769, lng: 8.5417, visitedAt: '2023-06-15' },
        vie: { id: 'vie', name: 'Vienna', countryId: 'AUT', lat: 48.2082, lng: 16.3738, visitedAt: '2023-06-20' },
        muc: { id: 'muc', name: 'Munich', countryId: 'DEU', lat: 48.1351, lng: 11.5820, visitedAt: '2023-06-25' },
        ams: { id: 'ams', name: 'Amsterdam', countryId: 'NLD', lat: 52.3676, lng: 4.9041, visitedAt: '2023-07-01' },
        bru: { id: 'bru', name: 'Brussels', countryId: 'BEL', lat: 50.8503, lng: 4.3517, visitedAt: '2023-07-06' },
        prg: { id: 'prg', name: 'Prague', countryId: 'CZE', lat: 50.0755, lng: 14.4378, visitedAt: '2023-07-12' },
        bud: { id: 'bud', name: 'Budapest', countryId: 'HUN', lat: 47.4979, lng: 19.0402, visitedAt: '2023-07-18' },
        dbv: { id: 'dbv', name: 'Dubrovnik', countryId: 'HRV', lat: 42.6507, lng: 18.0944, visitedAt: '2023-07-24' },
        ath: { id: 'ath', name: 'Athens', countryId: 'GRC', lat: 37.9838, lng: 23.7275, visitedAt: '2023-08-01' },
      },
      wishlistCountries: {
        NOR: { id: 'NOR', addedAt: '2024-01-01' },
        SWE: { id: 'SWE', addedAt: '2024-01-01' },
      },
      wishlistCities: {},
      customCities: [],
      activeThemeId: 'sunset-wanderer',
    }
  }
];
