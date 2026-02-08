import type { Facility, MedicalDesert, RegionStats } from '@/types/facility';

export interface VulnerabilityExportRow {
  region: string;
  vulnerabilityScore: number;
  facilityCount: number;
  hospitalCount: number;
  clinicCount: number;
  coverageScore: number;
  criticalGaps: string;
  populationAtRisk: string;
  recommendations: string;
  urgencyLevel: string;
}

export interface ActionableInsight {
  region: string;
  issue: string;
  recommendation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedImpact: string;
  requiredResources: string;
}

// Generate vulnerability data for export
export function generateVulnerabilityData(
  facilities: Facility[],
  regionStats: RegionStats[],
  medicalDeserts: MedicalDesert[]
): VulnerabilityExportRow[] {
  const desertMap = new Map(medicalDeserts.map(d => [d.region, d]));
  
  return regionStats.map(region => {
    const desert = desertMap.get(region.name);
    const regionalFacilities = facilities.filter(f => 
      (f.address.stateOrRegion || f.address.city || '').includes(region.name)
    );
    
    // Calculate vulnerability score (inverse of coverage)
    const vulnerabilityScore = 100 - region.coverageScore;
    
    // Identify critical gaps
    const criticalSpecialties = ['emergencyMedicine', 'generalSurgery', 'gynecologyAndObstetrics', 'pediatrics', 'cardiology'];
    const presentSpecialties = new Set(regionalFacilities.flatMap(f => f.specialties));
    const gaps = criticalSpecialties.filter(s => !presentSpecialties.has(s as any));
    
    // Generate recommendations based on gaps
    const recommendations: string[] = [];
    if (region.hospitals === 0) recommendations.push('Deploy mobile hospital unit or establish critical access hospital');
    if (gaps.includes('emergencyMedicine')) recommendations.push('Establish 24/7 emergency services');
    if (gaps.includes('gynecologyAndObstetrics')) recommendations.push('Deploy OB/GYN specialist or telehealth services');
    if (gaps.includes('pediatrics')) recommendations.push('Add pediatric care capabilities');
    if (region.coverageScore < 30) recommendations.push('Priority region for healthcare infrastructure investment');
    
    return {
      region: region.name,
      vulnerabilityScore: Math.round(vulnerabilityScore),
      facilityCount: region.totalFacilities,
      hospitalCount: region.hospitals,
      clinicCount: region.clinics,
      coverageScore: region.coverageScore,
      criticalGaps: gaps.length > 0 ? gaps.map(g => g.replace(/([A-Z])/g, ' $1').trim()).join('; ') : 'None identified',
      populationAtRisk: desert ? `~${(desert.estimatedPopulation / 1000).toFixed(0)}K` : 'Unknown',
      recommendations: recommendations.join('; ') || 'Continue monitoring',
      urgencyLevel: vulnerabilityScore >= 70 ? 'critical' : vulnerabilityScore >= 50 ? 'high' : vulnerabilityScore >= 30 ? 'medium' : 'low'
    };
  }).sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
}

// Generate actionable insights
export function generateActionableInsights(
  facilities: Facility[],
  regionStats: RegionStats[],
  medicalDeserts: MedicalDesert[]
): ActionableInsight[] {
  const insights: ActionableInsight[] = [];
  
  // Identify regions without hospitals
  regionStats.filter(r => r.hospitals === 0 && r.totalFacilities > 0).forEach(region => {
    insights.push({
      region: region.name,
      issue: 'No hospital coverage - only clinics available',
      recommendation: 'Establish critical access hospital or deploy mobile surgical unit',
      priority: 'critical',
      estimatedImpact: `${region.totalFacilities} clinics could refer to local hospital`,
      requiredResources: 'Hospital facility, surgical staff, emergency equipment'
    });
  });
  
  // Identify medical deserts
  medicalDeserts.filter(d => d.severity === 'high').forEach(desert => {
    insights.push({
      region: desert.region,
      issue: `Medical desert identified - ${desert.criticalGaps.join(', ')}`,
      recommendation: `Deploy resources to cover ${(desert.estimatedPopulation / 1000).toFixed(0)}K population within ${desert.radius}km`,
      priority: 'critical',
      estimatedImpact: `${(desert.estimatedPopulation / 1000).toFixed(0)}K people currently underserved`,
      requiredResources: desert.criticalGaps.map(g => `${g} services`).join(', ')
    });
  });
  
  // Identify facilities with low data quality (potential verification needed)
  const lowQualityFacilities = facilities.filter(f => (f.dataQualityScore || 0) < 30);
  if (lowQualityFacilities.length > 10) {
    const regions = [...new Set(lowQualityFacilities.map(f => f.address.stateOrRegion || f.address.city || 'Unknown'))];
    regions.slice(0, 3).forEach(region => {
      insights.push({
        region,
        issue: 'Multiple facilities with incomplete data - verification needed',
        recommendation: 'Conduct field verification of facility capabilities',
        priority: 'medium',
        estimatedImpact: 'Improved data accuracy for resource allocation',
        requiredResources: 'Field survey team, verification protocols'
      });
    });
  }
  
  // Identify regions with only basic services
  regionStats.filter(r => {
    const hasAdvancedCare = Object.keys(r.specialtyCoverage).some(s => 
      ['cardiology', 'neurology', 'oncology'].some(adv => s.toLowerCase().includes(adv))
    );
    return !hasAdvancedCare && r.totalFacilities >= 5;
  }).slice(0, 5).forEach(region => {
    insights.push({
      region: region.name,
      issue: 'No advanced specialty care available',
      recommendation: 'Establish telehealth connections to tertiary care centers',
      priority: 'high',
      estimatedImpact: 'Access to specialist consultations for complex cases',
      requiredResources: 'Telehealth equipment, specialist partnership agreements'
    });
  });
  
  return insights.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Convert data to CSV string
export function toCSV<T>(data: T[], columns: { key: keyof T; header: string }[]): string {
  const headers = columns.map(c => `"${c.header}"`).join(',');
  const rows = data.map(row => 
    columns.map(c => {
      const value = row[c.key];
      const strValue = value === null || value === undefined ? '' : String(value);
      // Escape quotes and wrap in quotes
      return `"${strValue.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export vulnerability report
export function exportVulnerabilityReport(
  facilities: Facility[],
  regionStats: RegionStats[],
  medicalDeserts: MedicalDesert[],
  country: string
): void {
  const data = generateVulnerabilityData(facilities, regionStats, medicalDeserts);
  const csv = toCSV(data, [
    { key: 'region', header: 'Region' },
    { key: 'vulnerabilityScore', header: 'Vulnerability Score (0-100)' },
    { key: 'urgencyLevel', header: 'Urgency Level' },
    { key: 'facilityCount', header: 'Total Facilities' },
    { key: 'hospitalCount', header: 'Hospitals' },
    { key: 'clinicCount', header: 'Clinics' },
    { key: 'coverageScore', header: 'Coverage Score' },
    { key: 'criticalGaps', header: 'Critical Service Gaps' },
    { key: 'populationAtRisk', header: 'Population at Risk' },
    { key: 'recommendations', header: 'Recommendations' }
  ]);
  
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `${country.toLowerCase()}-vulnerability-report-${timestamp}.csv`);
}

// Export actionable insights
export function exportActionableInsights(
  facilities: Facility[],
  regionStats: RegionStats[],
  medicalDeserts: MedicalDesert[],
  country: string
): void {
  const data = generateActionableInsights(facilities, regionStats, medicalDeserts);
  const csv = toCSV(data, [
    { key: 'priority', header: 'Priority' },
    { key: 'region', header: 'Region' },
    { key: 'issue', header: 'Issue Identified' },
    { key: 'recommendation', header: 'Recommendation' },
    { key: 'estimatedImpact', header: 'Estimated Impact' },
    { key: 'requiredResources', header: 'Required Resources' }
  ]);
  
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `${country.toLowerCase()}-actionable-insights-${timestamp}.csv`);
}

// Simple export for analyzed facilities
export function exportFacilitiesToCSV(facilities: Facility[], filename: string): void {
  const data = facilities.map(f => ({
    name: f.name,
    type: f.facilityTypeId || 'unknown',
    status: f.status,
    region: f.address.stateOrRegion || f.address.city || 'Unknown',
    city: f.address.city || '',
    specialties: f.specialties.join('; '),
    equipment: f.equipment.join('; '),
    procedures: f.procedures.join('; '),
    capacity: f.capacity || '',
    coverageScore: f.dataQualityScore || 0,
    phone: f.officialPhone || f.phoneNumbers[0] || '',
    email: f.email || '',
  }));

  const csv = toCSV(data, [
    { key: 'name', header: 'Facility Name' },
    { key: 'type', header: 'Type' },
    { key: 'status', header: 'Status' },
    { key: 'region', header: 'Region' },
    { key: 'city', header: 'City' },
    { key: 'specialties', header: 'Specialties' },
    { key: 'equipment', header: 'Equipment' },
    { key: 'procedures', header: 'Procedures' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'coverageScore', header: 'Data Quality Score' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `${filename}-${timestamp}.csv`);
}
