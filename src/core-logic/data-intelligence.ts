
export interface Facility {
    name: string;
    specialties: string[];
    procedures: string[];
    equipment: string[];
    capabilities: string[];
    city: string;
    region: string;
    status: string;
    facilityType: string;
    dataQualityScore: number;
    address?: { stateOrRegion?: string };
}

export interface IntelligenceMetrics {
    criticalGaps: Array<{ region: string; gap: string; severity: number; populationAtRisk: number }>;
    medicalDeserts: Array<{ region: string; desertScore: number; missingServices: string[]; estimatedPop: number }>;
    populationImpact: { totalAtRisk: number; criticalAreas: string[] };
    resourceOptimization: Array<{ region: string; priority: number; recommendedResources: string[]; roi: number }>;
    urgencyScores: Map<string, number>;
}

export function performDataIntelligenceAnalysis(facilities: Facility[]): IntelligenceMetrics {
    // Group facilities by region
    const regionMap = new Map<string, Facility[]>();
    facilities.forEach(f => {
        const region = f.region || 'Unknown';
        if (!regionMap.has(region)) regionMap.set(region, []);
        regionMap.get(region)!.push(f);
    });

    // Critical services that MUST be available
    const CRITICAL_SERVICES = ['emergency', 'obstetrics', 'gynecology', 'surgery', 'pediatrics'];

    // Calculate Medical Desert Scores (0-100, higher = worse)
    const medicalDeserts: IntelligenceMetrics['medicalDeserts'] = [];
    const criticalGaps: IntelligenceMetrics['criticalGaps'] = [];
    const urgencyScores = new Map<string, number>();

    regionMap.forEach((regionFacilities, regionName) => {
        // Count available critical services in region
        const availableServices = new Set<string>();
        regionFacilities.forEach(f => {
            f.specialties?.forEach(s => availableServices.add(s.toLowerCase()));
        });

        // Calculate missing services
        const missingServices = CRITICAL_SERVICES.filter(s =>
            !Array.from(availableServices).some(available => available.includes(s))
        );

        // Desert Score Algorithm: (missing critical services / total critical) * 100
        const desertScore = (missingServices.length / CRITICAL_SERVICES.length) * 100;

        // Population estimation (rough): facilities * 10,000 (WHO standard)
        const estimatedPop = regionFacilities.length * 10000;

        // Urgency Score: desert score * sqrt(population) / 100
        const urgencyScore = (desertScore * Math.sqrt(estimatedPop)) / 100;
        urgencyScores.set(regionName, urgencyScore);

        if (desertScore > 50 && estimatedPop > 5000) { // Stricter threshold: 50% missing services + min pop
            medicalDeserts.push({
                region: regionName,
                desertScore: Math.round(desertScore),
                missingServices,
                estimatedPop
            });

            // Add specific critical gaps
            missingServices.forEach(service => {
                criticalGaps.push({
                    region: regionName,
                    gap: service,
                    severity: desertScore,
                    populationAtRisk: estimatedPop
                });
            });
        }
    });

    // Sort by urgency score (highest first)
    medicalDeserts.sort((a, b) => (urgencyScores.get(b.region) || 0) - (urgencyScores.get(a.region) || 0));
    criticalGaps.sort((a, b) => b.severity - a.severity);

    // Calculate Resource Optimization using greedy algorithm
    const resourceOptimization: IntelligenceMetrics['resourceOptimization'] = [];
    medicalDeserts.slice(0, 5).forEach((desert, index) => {
        // ROI calculation: population served / (number of missing services + 1)
        const roi = desert.estimatedPop / (desert.missingServices.length + 1);

        resourceOptimization.push({
            region: desert.region,
            priority: index + 1,
            recommendedResources: desert.missingServices.slice(0, 3), // Top 3 most needed
            roi: Math.round(roi)
        });
    });

    // Population Impact Summary
    const totalAtRisk = medicalDeserts.reduce((sum, d) => sum + d.estimatedPop, 0);
    const criticalAreas = medicalDeserts.slice(0, 3).map(d => d.region);

    return {
        criticalGaps: criticalGaps.slice(0, 10),
        medicalDeserts: medicalDeserts.slice(0, 10),
        populationImpact: { totalAtRisk, criticalAreas },
        resourceOptimization,
        urgencyScores
    };
}

// Sanitize null-like values
export function sanitize(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value).trim();
    if (str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' || str === '') return '';
    return str;
}

export function sanitizeArray(arr: unknown[]): string[] {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.filter(item => {
        if (item === null || item === undefined) return false;
        const str = String(item).trim().toLowerCase();
        return str !== '' && str !== 'null' && str !== 'undefined';
    }).map(item => String(item).trim());
}
