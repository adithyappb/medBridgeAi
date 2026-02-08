import type { Facility as FacilityType_, FacilityType, OperatorType, AffiliationType, MedicalSpecialty, RegionStats, MedicalDesert } from '@/types/facility';
import { getCoordinatesForLocation, getCountryConfig, detectCountryFromData } from './countryConfig';
import {
  sanitizeString,
  sanitizeInteger,
  sanitizeBoolean,
  parseJsonArraySafe,
  sanitizeStringWithFallback
} from './sanitize';

// Re-export Facility type for convenience
export type { Facility as FacilityType_ } from '@/types/facility';
export type Facility = FacilityType_;

// Compute facility status based on data completeness
function computeStatus(facility: Partial<Facility>): 'operational' | 'limited' | 'critical' | 'unknown' {
  let score = 0;

  if (facility.specialties && facility.specialties.length > 0) score += 2;
  if (facility.procedures && facility.procedures.length > 0) score += 2;
  if (facility.equipment && facility.equipment.length > 0) score += 2;
  if (facility.capabilities && facility.capabilities.length > 0) score += 1;
  if (facility.phoneNumbers && facility.phoneNumbers.length > 0) score += 1;
  if (facility.description) score += 1;
  if (facility.capacity && facility.capacity > 0) score += 1;

  if (score >= 6) return 'operational';
  if (score >= 3) return 'limited';
  if (score >= 1) return 'critical';
  return 'unknown';
}

// Parse a single CSV row into a Facility object
function parseRow(row: Record<string, string>, index: number): Facility {
  const specialties = parseJsonArraySafe(row.specialties) as MedicalSpecialty[];
  const procedures = parseJsonArraySafe(row.procedure);
  const equipment = parseJsonArraySafe(row.equipment);
  const capabilities = parseJsonArraySafe(row.capability);
  const phoneNumbers = parseJsonArraySafe(row.phone_numbers);
  const websites = parseJsonArraySafe(row.websites);
  const affiliations = parseJsonArraySafe(row.affiliationTypeIds) as AffiliationType[];

  // Sanitize all string fields
  const name = sanitizeStringWithFallback(row.name, 'Unknown Facility');
  const city = sanitizeString(row.address_city);
  const stateOrRegion = sanitizeString(row.address_stateOrRegion);

  const facility: Facility = {
    id: sanitizeString(row.unique_id) || `facility-${index}`,
    uniqueId: sanitizeString(row.pk_unique_id) || String(index),
    sourceUrl: sanitizeString(row.source_url),
    name,

    organizationType: (sanitizeString(row.organization_type) as 'facility' | 'ngo') || 'facility',
    facilityTypeId: sanitizeString(row.facilityTypeId) as FacilityType | undefined,
    operatorTypeId: sanitizeString(row.operatorTypeId) as OperatorType | undefined,
    affiliationTypeIds: affiliations.length > 0 ? affiliations : undefined,

    specialties,
    procedures,
    equipment,
    capabilities,

    phoneNumbers,
    officialPhone: sanitizeString(row.officialPhone) || (phoneNumbers[0] || undefined),
    email: sanitizeString(row.email),
    websites,
    officialWebsite: sanitizeString(row.officialWebsite),

    facebookLink: sanitizeString(row.facebookLink),
    twitterLink: sanitizeString(row.twitterLink),
    linkedinLink: sanitizeString(row.linkedinLink),
    instagramLink: sanitizeString(row.instagramLink),
    logo: sanitizeString(row.logo),

    address: {
      line1: sanitizeString(row.address_line1),
      line2: sanitizeString(row.address_line2),
      line3: sanitizeString(row.address_line3),
      city,
      stateOrRegion,
      zipOrPostcode: sanitizeString(row.address_zipOrPostcode),
      country: sanitizeStringWithFallback(row.address_country, 'Ghana'),
      countryCode: sanitizeStringWithFallback(row.address_countryCode, 'GH'),
    },

    yearEstablished: sanitizeInteger(row.yearEstablished),
    acceptsVolunteers: sanitizeBoolean(row.acceptsVolunteers),
    description: sanitizeString(row.description),
    missionStatement: sanitizeString(row.missionStatement),
    organizationDescription: sanitizeString(row.organizationDescription),

    area: sanitizeInteger(row.area),
    numberDoctors: sanitizeInteger(row.numberDoctors),
    capacity: sanitizeInteger(row.capacity),

    countries: parseJsonArraySafe(row.countries),

    status: 'unknown',
  };

  // Compute coordinates from address (country-agnostic)
  facility.coordinates = getCoordinatesForLocation(
    facility.address.city,
    facility.address.stateOrRegion,
    facility.address.countryCode
  );

  // Compute status
  facility.status = computeStatus(facility);

  // Compute data quality score (0-100)
  facility.dataQualityScore = computeDataQuality(facility);

  return facility;
}

function computeDataQuality(facility: Facility): number {
  let score = 0;
  const checks = [
    { field: facility.name && facility.name !== 'Unknown Facility', weight: 10 },
    { field: facility.specialties.length > 0, weight: 15 },
    { field: facility.procedures.length > 0, weight: 15 },
    { field: facility.equipment.length > 0, weight: 15 },
    { field: facility.capabilities.length > 0, weight: 10 },
    { field: facility.phoneNumbers.length > 0, weight: 5 },
    { field: facility.email, weight: 5 },
    { field: facility.address.city, weight: 10 },
    { field: facility.facilityTypeId, weight: 5 },
    { field: facility.description, weight: 10 },
  ];

  for (const check of checks) {
    if (check.field) score += check.weight;
  }

  return Math.min(100, score);
}

// Parse CSV string into Facility array
// Alias for parseCSV
export function parseFacilityCSV(csvText: string): Facility[] {
  return parseCSV(csvText);
}

// Detect country from facilities (for auto-switching)
export function detectCountryFromFacilities(facilities: Facility[]): ReturnType<typeof detectCountryFromData> {
  return detectCountryFromData(undefined, facilities);
}

export function parseCSV(csvText: string): Facility[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  const facilities: Facility[] = [];
  const seenIds = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};

      headers.forEach((header, idx) => {
        row[header.trim()] = values[idx] || '';
      });

      const facility = parseRow(row, i);

      // Deduplicate by unique_id or name+city
      const dedupeKey = facility.id || `${facility.name}-${facility.address.city}`;
      if (!seenIds.has(dedupeKey)) {
        seenIds.add(dedupeKey);
        facilities.push(facility);
      }
    } catch (e) {
      console.warn(`Failed to parse row ${i}:`, e);
    }
  }

  return facilities;
}

// Handle CSV parsing with quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Compute region statistics from facilities
export function computeRegionStats(facilities: Facility[]): RegionStats[] {
  const regionMap = new Map<string, Facility[]>();

  for (const facility of facilities) {
    const region = facility.address.stateOrRegion || facility.address.city || 'Unknown';
    const normalized = normalizeRegion(region);

    if (!regionMap.has(normalized)) {
      regionMap.set(normalized, []);
    }
    regionMap.get(normalized)!.push(facility);
  }

  return Array.from(regionMap.entries()).map(([name, regionFacilities]) => {
    const facilityTypes: Record<string, number> = {};
    const specialtyCoverage: Record<string, number> = {};

    let hospitals = 0;
    let clinics = 0;
    let healthCenters = 0;

    for (const f of regionFacilities) {
      // Count facility types
      const type = f.facilityTypeId || 'unknown';
      facilityTypes[type] = (facilityTypes[type] || 0) + 1;

      if (type === 'hospital') hospitals++;
      else if (type === 'clinic') clinics++;
      else healthCenters++;

      // Count specialties
      for (const spec of f.specialties) {
        specialtyCoverage[spec] = (specialtyCoverage[spec] || 0) + 1;
      }
    }

    // Compute coverage score (simplified)
    const dataRichness = regionFacilities.reduce((sum, f) => sum + (f.dataQualityScore || 0), 0) / regionFacilities.length;
    const coverageScore = Math.min(100, Math.round(dataRichness * (hospitals > 0 ? 1.2 : 0.8)));

    return {
      name,
      totalFacilities: regionFacilities.length,
      hospitals,
      clinics,
      healthCenters,
      coverageScore,
      medicalDesertAreas: Math.max(0, 5 - hospitals), // Simplified calculation
      facilityTypes,
      specialtyCoverage,
    };
  }).sort((a, b) => b.totalFacilities - a.totalFacilities);
}

function normalizeRegion(region: string): string {
  const regionMappings: Record<string, string> = {
    'accra': 'Greater Accra',
    'kumasi': 'Ashanti',
    'tamale': 'Northern',
    'takoradi': 'Western',
    'cape coast': 'Central',
    'koforidua': 'Eastern',
    'ho': 'Volta',
    'bolgatanga': 'Upper East',
    'wa': 'Upper West',
    'sunyani': 'Brong Ahafo',
  };

  const lower = region.toLowerCase();
  for (const [key, value] of Object.entries(regionMappings)) {
    if (lower.includes(key)) return value;
  }

  // Check for direct matches
  for (const regionName of Object.values(regionMappings)) {
    if (lower.includes(regionName.toLowerCase())) return regionName;
  }

  return region;
}

// Detect medical deserts (areas with low coverage)
export function detectMedicalDeserts(facilities: Facility[], regionStats: RegionStats[]): MedicalDesert[] {
  const deserts: MedicalDesert[] = [];
  const config = getCountryConfig();

  for (const region of regionStats) {
    // A region is a "Desert Zone" if coverage is low OR it has NO hospitals
    if (region.coverageScore < 50 || region.hospitals === 0) {
      const regionFacilities = facilities.filter(f =>
        normalizeRegion(f.address.stateOrRegion || f.address.city || '') === region.name
      );

      // Find critical gaps (WHO essential services)
      const criticalSpecialties = ['emergencyMedicine', 'generalSurgery', 'gynecologyAndObstetrics', 'pediatrics'];
      const presentSpecialties = new Set(regionFacilities.flatMap(f => f.specialties));
      const gaps = criticalSpecialties.filter(s => !presentSpecialties.has(s as any));

      // Get coordinates from country config or from existing facilities
      let coords = config.regionCoords[region.name];
      if (!coords && regionFacilities.length > 0 && regionFacilities[0].coordinates) {
        coords = regionFacilities[0].coordinates;
      }
      if (!coords) {
        coords = { lat: config.center[0], lng: config.center[1] };
      }

      deserts.push({
        id: `desert-${region.name.toLowerCase().replace(/\s/g, '-')}`,
        region: region.name,
        coordinates: coords,
        radius: 50 + (50 - region.coverageScore),
        estimatedPopulation: region.totalFacilities * config.populationMultiplier,
        nearestFacility: regionFacilities[0] ? {
          id: regionFacilities[0].id,
          name: regionFacilities[0].name,
          distance: 30, // Mock distance for now/simulation
        } : undefined,
        criticalGaps: gaps.length > 0 ? gaps : ['Limited facility data'],
        severity: region.coverageScore < 30 ? 'high' : region.coverageScore < 50 ? 'medium' : 'low',
        // New: Track how many facilities are specifically in this "Desert Zone"
        affectedFacilityCount: regionFacilities.length
      });
    }
  }

  // Return distinct ZONES
  return deserts;
}
