import { describe, it, expect } from 'vitest';
import { detectMedicalDeserts } from './csvParser';
import type { Facility, RegionStats } from '@/types/facility';

describe('detectMedicalDeserts', () => {
    it('should correctly identify distinct desert zones and count affected facilities', () => {
        // 1. Setup: Define a region that qualifies as a desert (low coverage, 0 hospitals)
        const desertRegion: RegionStats = {
            name: 'Desert Region',
            totalFacilities: 2,
            hospitals: 0,
            clinics: 2,
            healthCenters: 0,
            coverageScore: 20, // Low score < 50
            medicalDesertAreas: 1,
            facilityTypes: { clinic: 2 },
            specialtyCoverage: {}
        };

        const goodRegion: RegionStats = {
            name: 'Good Region',
            totalFacilities: 10,
            hospitals: 5,
            clinics: 5,
            healthCenters: 0,
            coverageScore: 85,
            medicalDesertAreas: 0,
            facilityTypes: { hospital: 5, clinic: 5 },
            specialtyCoverage: {}
        };

        const regions = [desertRegion, goodRegion];

        // 2. Setup: Define facilities in the desert region
        const facilities: Facility[] = [
            {
                id: 'f1',
                name: 'Desert Clinic A',
                address: { city: 'Desert City', stateOrRegion: 'Desert Region', pk_id: '1', line1: '', country: 'Ghana', countryCode: 'GH' },
                specialties: [],
                procedures: [],
                equipment: [],
                status: 'limited',
                coordinates: { lat: 0, lng: 0 },
                // ... minimal required fields
                uniqueId: '1',
                organizationType: 'facility',
                phoneNumbers: [],
                capabilities: [],
                websites: [],
                countries: [],
                yearEstablished: 2020,
                acceptsVolunteers: false,
                area: 0,
                numberDoctors: 1,
                capacity: 10,
                dataQualityScore: 50
            } as unknown as Facility,
            {
                id: 'f2',
                name: 'Desert Clinic B',
                address: { city: 'Desert City', stateOrRegion: 'Desert Region', pk_id: '2', line1: '', country: 'Ghana', countryCode: 'GH' },
                specialties: [],
                procedures: [],
                equipment: [],
                status: 'limited',
                coordinates: { lat: 0.1, lng: 0.1 },
                // ... minimal required fields
                uniqueId: '2',
                organizationType: 'facility',
                phoneNumbers: [],
                capabilities: [],
                websites: [],
                countries: [],
                yearEstablished: 2021,
                acceptsVolunteers: false,
                area: 0,
                numberDoctors: 1,
                capacity: 10,
                dataQualityScore: 50
            } as unknown as Facility,
            {
                id: 'f3',
                name: 'Good Hospital A',
                address: { city: 'Good City', stateOrRegion: 'Good Region', pk_id: '3', line1: '', country: 'Ghana', countryCode: 'GH' },
                specialties: [],
                procedures: [],
                equipment: [],
                status: 'operational',
                coordinates: { lat: 1, lng: 1 },
                uniqueId: '3',
                organizationType: 'facility',
                phoneNumbers: [],
                capabilities: [],
                websites: [],
                countries: [],
                yearEstablished: 2010,
                acceptsVolunteers: true,
                area: 100,
                numberDoctors: 10,
                capacity: 100,
                dataQualityScore: 90
            } as unknown as Facility
        ];

        // 3. Execution
        const deserts = detectMedicalDeserts(facilities, regions);

        // 4. Assertion
        // Expect exactly 1 desert zone (Desert Region)
        expect(deserts.length).toBe(1);
        expect(deserts[0].region).toBe('Desert Region');

        // Expect the affectedFacilityCount to be 2 (f1, f2)
        expect(deserts[0].affectedFacilityCount).toBe(2);

        // Severity should be high because score is 20 (<30)
        expect(deserts[0].severity).toBe('high');
    });
});
