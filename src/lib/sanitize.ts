/**
 * Data Sanitization Utilities
 * Comprehensive null handling and data cleaning for the entire application
 */

/**
 * Sanitize a string value - removes null, undefined, empty strings, and "null" string literals
 */
export function sanitizeString(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim();
  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'none' ||
    trimmed === 'N/A' ||
    trimmed === 'n/a'
  ) {
    return undefined;
  }
  return trimmed;
}

/**
 * Sanitize a string and provide a fallback if null
 */
export function sanitizeStringWithFallback(
  value: string | null | undefined,
  fallback: string
): string {
  return sanitizeString(value) ?? fallback;
}

/**
 * Sanitize a number value
 */
export function sanitizeNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'nan') {
      return undefined;
    }
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? undefined : parsed;
  }
  return isNaN(value) ? undefined : value;
}

/**
 * Sanitize an integer value
 */
export function sanitizeInteger(value: string | number | null | undefined): number | undefined {
  const num = sanitizeNumber(value);
  return num !== undefined ? Math.floor(num) : undefined;
}

/**
 * Sanitize a boolean value
 */
export function sanitizeBoolean(value: string | boolean | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  const trimmed = String(value).trim().toLowerCase();
  return trimmed === 'true' || trimmed === '1' || trimmed === 'yes';
}

/**
 * Sanitize an array - removes null, undefined, and empty string elements
 */
export function sanitizeArray<T>(arr: (T | null | undefined)[] | null | undefined): T[] {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.filter((item): item is T => {
    if (item === null || item === undefined) return false;
    if (typeof item === 'string') {
      const trimmed = item.trim().toLowerCase();
      return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined';
    }
    return true;
  });
}

/**
 * Parse JSON array strings from CSV with sanitization
 */
export function parseJsonArraySafe(value: string | null | undefined): string[] {
  if (!value) return [];
  const trimmed = String(value).trim();
  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed === '[]' ||
    trimmed === '""'
  ) {
    return [];
  }
  
  try {
    // Handle escaped quotes
    const cleaned = trimmed.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return sanitizeArray(parsed.map(item => 
        typeof item === 'string' ? sanitizeString(item) : String(item)
      ));
    }
    return [];
  } catch {
    // Try to parse as comma-separated if JSON fails
    if (trimmed.includes(',')) {
      return sanitizeArray(trimmed.split(',').map(s => sanitizeString(s)));
    }
    // Single value
    const single = sanitizeString(trimmed);
    return single ? [single] : [];
  }
}

/**
 * Sanitize an entire object - recursively cleans all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeArray(value);
    } else if (value !== null && typeof value === 'object') {
      (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }
  return result;
}

/**
 * Display-safe string - returns a clean display value or dash
 */
export function displayValue(value: string | null | undefined, fallback = '—'): string {
  const sanitized = sanitizeString(value);
  return sanitized ?? fallback;
}

/**
 * Display-safe number - returns formatted number or fallback
 */
export function displayNumber(
  value: number | string | null | undefined,
  fallback = '—',
  options?: Intl.NumberFormatOptions
): string {
  const num = sanitizeNumber(value);
  if (num === undefined) return fallback;
  return new Intl.NumberFormat('en-US', options).format(num);
}

/**
 * Check if a value is effectively null/empty
 */
export function isNullish(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    return trimmed === '' || trimmed === 'null' || trimmed === 'undefined';
  }
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'number') return isNaN(value);
  return false;
}

/**
 * Count non-null values in an object
 */
export function countValidFields(obj: Record<string, unknown>): number {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (!isNullish(value)) count++;
  }
  return count;
}
