import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseCSV, computeRegionStats, detectMedicalDeserts } from '@/lib/csvParser';
import { COUNTRY_REGISTRY, setCountry, type CountryCode } from '@/lib/countryConfig';
import type { Facility, RegionStats, MedicalDesert, FacilityFilters } from '@/types/facility';

interface FacilityDataState {
  facilities: Facility[];
  regionStats: RegionStats[];
  medicalDeserts: MedicalDesert[];
  isLoading: boolean;
  error: string | null;
  country: CountryCode;
}

// Cache per country
const dataCache: Partial<Record<CountryCode, FacilityDataState>> = {};
const loadPromises: Partial<Record<CountryCode, Promise<FacilityDataState>>> = {};

async function loadFacilityData(countryCode: CountryCode): Promise<FacilityDataState> {
  const config = COUNTRY_REGISTRY[countryCode];

  try {
    const response = await fetch(config.dataFile);
    if (!response.ok) {
      throw new Error(`Failed to load facility data for ${config.name}`);
    }

    const csvText = await response.text();
    const facilities = parseCSV(csvText);
    const regionStats = computeRegionStats(facilities);
    const medicalDeserts = detectMedicalDeserts(facilities, regionStats);

    return {
      facilities,
      regionStats,
      medicalDeserts,
      isLoading: false,
      error: null,
      country: countryCode,
    };
  } catch (error) {
    console.error(`Error loading facility data for ${countryCode}:`, error);
    return {
      facilities: [],
      regionStats: [],
      medicalDeserts: [],
      isLoading: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      country: countryCode,
    };
  }
}

// Global country state - ensure it's a valid country
let globalCountry: CountryCode = 'GH';
const countryListeners: Set<(country: CountryCode) => void> = new Set();

// Validate country code exists in registry
function isValidCountry(code: string): code is CountryCode {
  return code in COUNTRY_REGISTRY;
}

export function useCountry() {
  const [country, setLocalCountry] = useState<CountryCode>(globalCountry);

  useEffect(() => {
    const listener = (newCountry: CountryCode) => setLocalCountry(newCountry);
    countryListeners.add(listener);
    return () => { countryListeners.delete(listener); };
  }, []);

  const changeCountry = useCallback((newCountry: CountryCode) => {
    if (!isValidCountry(newCountry)) {
      console.warn(`Invalid country code: ${newCountry}, defaulting to GH`);
      newCountry = 'GH';
    }
    globalCountry = newCountry;
    setCountry(newCountry);
    countryListeners.forEach(listener => listener(newCountry));
  }, []);

  return { country, changeCountry };
}

export function useFacilityData() {
  const { country } = useCountry();
  const [state, setState] = useState<FacilityDataState>(() => {
    const cached = dataCache[country];
    return cached || {
      facilities: [],
      regionStats: [],
      medicalDeserts: [],
      isLoading: true,
      error: null,
      country,
    };
  });

  useEffect(() => {
    // Check cache first
    if (dataCache[country]) {
      setState(dataCache[country]!);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, country }));

    // Start loading if not already
    if (!loadPromises[country]) {
      loadPromises[country] = loadFacilityData(country);
    }

    loadPromises[country]!.then((data) => {
      dataCache[country] = data;
      setState(data);
    });
  }, [country]);

  return state;
}

// Hook for filtered facilities
export function useFilteredFacilities(filters: FacilityFilters) {
  const { facilities, isLoading, error } = useFacilityData();

  const filtered = useMemo(() => {
    if (!facilities.length) return [];

    return facilities.filter((facility) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          facility.name.toLowerCase().includes(search) ||
          facility.address.city?.toLowerCase().includes(search) ||
          facility.address.stateOrRegion?.toLowerCase().includes(search) ||
          facility.specialties.some(s => s.toLowerCase().includes(search)) ||
          facility.capabilities.some(c => c.toLowerCase().includes(search));

        if (!matchesSearch) return false;
      }

      // Facility type filter
      if (filters.facilityType?.length) {
        if (!facility.facilityTypeId || !filters.facilityType.includes(facility.facilityTypeId)) {
          return false;
        }
      }

      // Operator type filter
      if (filters.operatorType?.length) {
        if (!facility.operatorTypeId || !filters.operatorType.includes(facility.operatorTypeId)) {
          return false;
        }
      }

      // Specialties filter
      if (filters.specialties?.length) {
        const hasSpecialty = filters.specialties.some(s =>
          facility.specialties.includes(s)
        );
        if (!hasSpecialty) return false;
      }

      // Region filter
      if (filters.region?.length) {
        const facilityRegion = facility.address.stateOrRegion || facility.address.city || '';
        const matchesRegion = filters.region.some(r =>
          facilityRegion.toLowerCase().includes(r.toLowerCase())
        );
        if (!matchesRegion) return false;
      }

      // Status filter
      if (filters.status?.length) {
        if (!filters.status.includes(facility.status)) {
          return false;
        }
      }

      // Equipment filter
      if (filters.hasEquipment && facility.equipment.length === 0) {
        return false;
      }

      // Procedures filter
      if (filters.hasProcedures && facility.procedures.length === 0) {
        return false;
      }

      return true;
    });
  }, [facilities, filters]);

  return { facilities: filtered, isLoading, error };
}

// Compute summary statistics
export function useFacilityStats() {
  const { facilities, regionStats, medicalDeserts, isLoading, country } = useFacilityData();

  const stats = useMemo(() => {
    if (!facilities.length) {
      return {
        totalFacilities: 0,
        totalHospitals: 0,
        totalClinics: 0,
        totalRegions: 0,
        medicalDesertCount: 0,
        averageCoverageScore: 0,
        populationAtRisk: 0,
        uniqueSpecialties: 0,
        facilitiesWithEquipment: 0,
        facilitiesWithProcedures: 0,
      };
    }

    const allSpecialties = new Set<string>();
    let facilitiesWithEquipment = 0;
    let facilitiesWithProcedures = 0;

    for (const f of facilities) {
      f.specialties.forEach(s => allSpecialties.add(s));
      if (f.equipment.length > 0) facilitiesWithEquipment++;
      if (f.procedures.length > 0) facilitiesWithProcedures++;
    }

    const avgCoverage = regionStats.length
      ? regionStats.reduce((sum, r) => sum + r.coverageScore, 0) / regionStats.length
      : 0;

    const populationAtRisk = medicalDeserts.reduce((sum, d) => sum + (d.estimatedPopulation || 0), 0);

    return {
      totalFacilities: facilities.length,
      totalHospitals: facilities.filter(f => f.facilityTypeId === 'hospital').length,
      totalClinics: facilities.filter(f => f.facilityTypeId === 'clinic').length,
      totalRegions: regionStats.length,
      medicalDesertCount: medicalDeserts.length,
      averageCoverageScore: Math.round(avgCoverage),
      populationAtRisk,
      uniqueSpecialties: allSpecialties.size,
      facilitiesWithEquipment,
      facilitiesWithProcedures,
    };
  }, [facilities, regionStats, medicalDeserts]);

  return { stats, isLoading, country };
}
