// Medical Specialties from VF Schema
export const MEDICAL_SPECIALTIES = [
  'internalMedicine', 'familyMedicine', 'pediatrics', 'cardiology', 'generalSurgery',
  'emergencyMedicine', 'gynecologyAndObstetrics', 'orthopedicSurgery', 'dentistry',
  'ophthalmology', 'psychiatry', 'neurology', 'dermatology', 'radiology', 'pathology',
  'anesthesia', 'nephrology', 'oncology', 'infectiousDiseases', 'publicHealth',
  'criticalCareMedicine', 'physicalMedicineAndRehabilitation', 'hospiceAndPalliativeInternalMedicine',
  'geriatricsInternalMedicine', 'endocrinologyAndDiabetesAndMetabolism', 'gastroenterology',
  'pulmonology', 'rheumatology', 'hepatopancreatobiliarySurgery', 'plasticSurgery',
  'cardiacSurgery', 'thoracicSurgery', 'neurosurgery', 'vascularSurgery', 'urology',
  'otolaryngology', 'diagnosticRadiology', 'nuclearMedicine', 'sportsMedicinePMR',
  'neonatologyPerinatalMedicine', 'medicalOncology', 'clinicalPathology', 'globalHealthAndInternationalHealth',
  'maternalFetalMedicineOrPerinatology', 'obstetricsAndMaternityCare', 'socialAndBehavioralSciences',
  'addictionPsychiatry', 'communityAndPublicPsychiatry', 'cataractAndAnteriorSegmentSurgery',
  'glaucomaOphthalmology', 'retinaAndVitreoretinalOphthalmology', 'oculoplasticsAndReconstructiveOrbitalSurgery',
  'eyeTraumaAndEmergencyEyeCare', 'corneaOphthalmology', 'refractiveSurgeryOphthalmology', 'orthodontics'
] as const;

export type MedicalSpecialty = typeof MEDICAL_SPECIALTIES[number];

// Facility Types from VF Schema
export type FacilityType = 'hospital' | 'pharmacy' | 'doctor' | 'clinic' | 'dentist' | 'health_center' | 'chps_compound';
export type OperatorType = 'public' | 'private';
export type AffiliationType = 'faith-tradition' | 'philanthropy-legacy' | 'community' | 'academic' | 'government';
export type OrganizationType = 'facility' | 'ngo';

// Address structure matching VF schema
export interface Address {
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  stateOrRegion?: string;
  zipOrPostcode?: string;
  country?: string;
  countryCode?: string;
}

// Core Facility interface matching VF Ghana Dataset schema
export interface Facility {
  id: string;
  uniqueId: string;
  sourceUrl?: string;
  name: string;

  // Classification
  organizationType: OrganizationType;
  facilityTypeId?: FacilityType;
  operatorTypeId?: OperatorType;
  affiliationTypeIds?: AffiliationType[];

  // Medical data (free-form extracted)
  specialties: MedicalSpecialty[];
  procedures: string[];
  equipment: string[];
  capabilities: string[];

  // Contact info
  phoneNumbers: string[];
  officialPhone?: string;
  email?: string;
  websites: string[];
  officialWebsite?: string;

  // Social
  facebookLink?: string;
  twitterLink?: string;
  linkedinLink?: string;
  instagramLink?: string;
  logo?: string;

  // Address
  address: Address;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Additional info
  yearEstablished?: number;
  acceptsVolunteers?: boolean;
  description?: string;
  missionStatement?: string;
  organizationDescription?: string;

  // Capacity metrics
  area?: number;
  numberDoctors?: number;
  capacity?: number;

  // NGO-specific
  countries?: string[];

  // Metadata
  lastUpdated?: string;
  dataQualityScore?: number;

  // Computed status based on data completeness
  status: 'operational' | 'limited' | 'critical' | 'unknown';
}

// Region statistics computed from facility data
export interface RegionStats {
  name: string;
  totalFacilities: number;
  hospitals: number;
  clinics: number;
  healthCenters: number;
  population?: number;
  coverageScore: number;
  medicalDesertAreas: number;
  facilityTypes: Record<string, number>;
  specialtyCoverage: Record<string, number>;
}

// Medical Desert - areas lacking healthcare access
export interface MedicalDesert {
  id: string;
  region: string;
  district?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number;
  estimatedPopulation?: number;
  nearestFacility?: {
    id: string;
    name: string;
    distance: number;
  };
  criticalGaps: string[];
  severity: 'high' | 'medium' | 'low';
  affectedFacilityCount?: number;
}

// Agent chat types
export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  thinking?: string;
  agentSteps?: AgentStep[];
}

export interface AgentStep {
  step: number;
  action: string;
  input: string;
  output: string;
  dataUsed: Citation[];
  duration?: number;
}

export interface Citation {
  facilityId?: string;
  facilityName?: string;
  field: string;
  value: string;
  confidence: number;
  sourceUrl?: string;
  rowIndex?: number;
}

export interface QueryResult {
  answer: string;
  citations: Citation[];
  relatedFacilities: Facility[];
  suggestedFollowUps: string[];
  agentSteps?: AgentStep[];
}

// Filter options for facility search
export interface FacilityFilters {
  search?: string;
  facilityType?: FacilityType[];
  operatorType?: OperatorType[];
  specialties?: MedicalSpecialty[];
  region?: string[];
  status?: ('operational' | 'limited' | 'critical' | 'unknown')[];
  hasEquipment?: boolean;
  hasProcedures?: boolean;
}

// Anomaly detection for suspicious claims
export interface DataAnomaly {
  facilityId: string;
  facilityName: string;
  type: 'suspicious_claim' | 'missing_equipment' | 'inconsistent_data' | 'capacity_mismatch';
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedFields: string[];
  suggestedAction: string;
}
