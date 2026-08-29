export type ContinentCode = 'EU' | 'AS' | 'AF' | 'NA' | 'SA' | 'OC' | 'AN';

export interface ContinentInfo {
  code: ContinentCode;
  name: string;
  totalCountries: number;
  icon: string;
}

export interface CountryData {
  id: string; // ISO 3166-1 alpha-3 (e.g. 'USA', 'TUR', 'FRA')
  numericId: string; // ISO 3166-1 numeric (matches world-atlas TopoJSON, e.g. '840', '792', '250')
  alpha2: string; // ISO alpha-2 (e.g. 'US', 'TR', 'FR')
  name: string;
  nativeName?: string;
  continent: ContinentCode;
  capital: string;
  flag: string; // Emoji flag
  population: number;
  areaKm2: number;
  lat: number;
  lng: number;
}

export interface CityData {
  id: string;
  name: string;
  countryId: string; // ISO alpha-3
  countryName: string;
  continent: ContinentCode;
  lat: number;
  lng: number;
  population?: number;
  isCapital?: boolean;
  isCustom?: boolean;
}
