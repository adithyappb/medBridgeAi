// Country-agnostic configuration system
// Allows the platform to scale to any country dataset

export type CountryCode = 'GH';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  center: [number, number];
  defaultZoom: number;
  dataFile: string;
  regionCoords: Record<string, { lat: number; lng: number }>;
  populationMultiplier: number; // For estimating population in deserts
}

// Registry of supported countries - add new countries here
export const COUNTRY_REGISTRY: Record<CountryCode, CountryConfig> = {
  GH: {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    dataFile: '/data/ghana-facilities.csv',
    center: [7.9465, -1.0232],
    defaultZoom: 7,
    populationMultiplier: 50000,
    regionCoords: {
      'Greater Accra': { lat: 5.6037, lng: -0.1870 },
      'Ashanti': { lat: 6.6885, lng: -1.6244 },
      'Western': { lat: 5.0527, lng: -1.9857 },
      'Central': { lat: 5.1600, lng: -1.2600 },
      'Eastern': { lat: 6.1000, lng: -0.4500 },
      'Volta': { lat: 6.6000, lng: 0.4500 },
      'Northern': { lat: 9.4000, lng: -1.0000 },
      'Upper East': { lat: 10.7000, lng: -0.9000 },
      'Upper West': { lat: 10.2500, lng: -2.1500 },
      'Brong Ahafo': { lat: 7.5000, lng: -1.6700 },
      'Accra': { lat: 5.5560, lng: -0.1969 },
      'Kumasi': { lat: 6.6885, lng: -1.6244 },
      'Takoradi': { lat: 4.8845, lng: -1.7554 },
      'Tamale': { lat: 9.4008, lng: -0.8393 },
    },
  },
};

let currentCountry: CountryConfig = COUNTRY_REGISTRY.GH;

export function setCountry(code: CountryCode): void {
  if (COUNTRY_REGISTRY[code]) {
    currentCountry = COUNTRY_REGISTRY[code];
  }
}

export function getCountryConfig(): CountryConfig {
  return currentCountry;
}

export function detectCountryFromData(countryCode?: string, facilities?: Array<{ address?: { countryCode?: string; country?: string }; coordinates?: { lat: number; lng: number } }>): CountryCode {
  // Always return Ghana - app is Ghana-focused
  return 'GH';
}

export function getCoordinatesForLocation(
  city?: string,
  region?: string,
  countryCode?: string
): { lat: number; lng: number } | undefined {
  const detectedCode = countryCode ? detectCountryFromData(countryCode) : currentCountry.code;
  const config = COUNTRY_REGISTRY[detectedCode];
  const location = city || region;

  if (!location) return undefined;

  // Check exact match first
  if (config.regionCoords[location]) {
    return { ...config.regionCoords[location] };
  }

  // Check partial match
  for (const [key, coords] of Object.entries(config.regionCoords)) {
    if (
      location.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(location.toLowerCase())
    ) {
      // Add small random offset to prevent overlapping markers
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.1,
        lng: coords.lng + (Math.random() - 0.5) * 0.1,
      };
    }
  }

  // Default to country center with offset
  return {
    lat: config.center[0] + (Math.random() - 0.5) * 0.5,
    lng: config.center[1] + (Math.random() - 0.5) * 0.5,
  };
}

// Calculate map bounds from facility coordinates
export function calculateBounds(
  facilities: Array<{ coordinates?: { lat: number; lng: number } }>
): { center: [number, number]; zoom: number } {
  const validFacilities = facilities.filter((f) => f.coordinates);

  if (validFacilities.length === 0) {
    return { center: currentCountry.center, zoom: currentCountry.defaultZoom };
  }

  let minLat = 90,
    maxLat = -90,
    minLng = 180,
    maxLng = -180;

  for (const f of validFacilities) {
    if (f.coordinates) {
      minLat = Math.min(minLat, f.coordinates.lat);
      maxLat = Math.max(maxLat, f.coordinates.lat);
      minLng = Math.min(minLng, f.coordinates.lng);
      maxLng = Math.max(maxLng, f.coordinates.lng);
    }
  }

  const center: [number, number] = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

  // Calculate zoom based on bounds
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

  let zoom = 7;
  if (maxDiff > 10) zoom = 4;
  else if (maxDiff > 5) zoom = 5;
  else if (maxDiff > 2) zoom = 6;
  else if (maxDiff > 1) zoom = 7;
  else if (maxDiff > 0.5) zoom = 8;
  else zoom = 9;

  return { center, zoom };
}
