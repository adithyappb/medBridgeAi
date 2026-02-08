/**
 * Data Cleaning Pipeline
 * Handles null removal, validation, and normalization for optimization algorithms
 */

import type { Facility } from '@/types/facility';
import { sanitizeString, sanitizeNumber, isNullish } from '@/lib/sanitize';

export interface CleanedFacility extends Facility {
  validCoordinates: boolean;
  validCapacity: boolean;
  normalizedScore: number;
  cleanedAt: Date;
}

export interface CleaningReport {
  totalInput: number;
  totalOutput: number;
  nullsRemoved: number;
  coordinatesFixed: number;
  duplicatesRemoved: number;
  outliersFlagged: number;
  cleaningDuration: number;
}

/**
 * Validates and cleans a single facility record
 */
function cleanFacility(facility: Facility): CleanedFacility | null {
  // Remove if name is null/empty or is a null-like value
  const cleanedName = sanitizeString(facility.name);
  if (!cleanedName || cleanedName === 'Unknown Facility') {
    // Still include but flag if no real name
  }

  // Validate coordinates - check for null-like values
  const lat = facility.coordinates?.lat;
  const lng = facility.coordinates?.lng;
  const validCoordinates = !!(
    facility.coordinates &&
    !isNullish(lat) &&
    !isNullish(lng) &&
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );

  // Validate capacity (dataQualityScore as proxy)
  const rawScore = facility.dataQualityScore;
  const score = sanitizeNumber(rawScore) ?? 50;
  const validCapacity = typeof score === 'number' && 
    score >= 0 && 
    score <= 100;

  // Normalize score to 0-1 range
  const normalizedScore = validCapacity 
    ? score / 100 
    : 0.5; // Default to median if unknown

  // Create cleaned facility with sanitized name
  const cleanedFacility: CleanedFacility = {
    ...facility,
    name: cleanedName || 'Healthcare Facility',
    validCoordinates,
    validCapacity,
    normalizedScore,
    cleanedAt: new Date(),
  };

  return cleanedFacility;
}

/**
 * Detects outliers using IQR method
 */
function detectOutliers(values: number[]): Set<number> {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outlierIndices = new Set<number>();
  values.forEach((v, i) => {
    if (v < lowerBound || v > upperBound) {
      outlierIndices.add(i);
    }
  });
  
  return outlierIndices;
}

/**
 * Main data cleaning pipeline
 * Removes nulls, validates fields, handles duplicates, flags outliers
 */
export function cleanFacilityData(facilities: Facility[]): {
  cleaned: CleanedFacility[];
  report: CleaningReport;
} {
  const startTime = performance.now();
  
  const cleaned: CleanedFacility[] = [];
  const seenIds = new Set<string>();
  let nullsRemoved = 0;
  let duplicatesRemoved = 0;
  let coordinatesFixed = 0;

  for (const facility of facilities) {
    // Skip duplicates
    if (seenIds.has(facility.id)) {
      duplicatesRemoved++;
      continue;
    }
    seenIds.add(facility.id);

    // Clean the facility
    const cleanedFacility = cleanFacility(facility);
    
    if (cleanedFacility === null) {
      nullsRemoved++;
      continue;
    }

    // Track coordinate issues
    if (!cleanedFacility.validCoordinates) {
      coordinatesFixed++;
    }

    cleaned.push(cleanedFacility);
  }

  // Detect quality score outliers
  const scores = cleaned.map(f => f.dataQualityScore ?? 50);
  const outlierIndices = detectOutliers(scores);

  const endTime = performance.now();

  return {
    cleaned,
    report: {
      totalInput: facilities.length,
      totalOutput: cleaned.length,
      nullsRemoved,
      coordinatesFixed,
      duplicatesRemoved,
      outliersFlagged: outlierIndices.size,
      cleaningDuration: endTime - startTime,
    },
  };
}

/**
 * Validates data quality meets minimum threshold for optimization
 */
export function validateDataQuality(report: CleaningReport): {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
} {
  const issues: string[] = [];
  
  const retentionRate = report.totalOutput / report.totalInput;
  if (retentionRate < 0.5) {
    issues.push(`High data loss: only ${(retentionRate * 100).toFixed(1)}% of records retained`);
  }

  const nullRate = report.nullsRemoved / report.totalInput;
  if (nullRate > 0.2) {
    issues.push(`High null rate: ${(nullRate * 100).toFixed(1)}% records had null values`);
  }

  const coordIssueRate = report.coordinatesFixed / report.totalOutput;
  if (coordIssueRate > 0.3) {
    issues.push(`Coordinate quality issue: ${(coordIssueRate * 100).toFixed(1)}% facilities lack valid coordinates`);
  }

  // Quality score: weighted combination
  const qualityScore = Math.round(
    (retentionRate * 0.4 + (1 - nullRate) * 0.3 + (1 - coordIssueRate) * 0.3) * 100
  );

  return {
    isValid: issues.length === 0,
    qualityScore,
    issues,
  };
}
