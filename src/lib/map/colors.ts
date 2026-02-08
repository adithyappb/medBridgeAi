// Futuristic neon color palette with glow effects
export const MAP_COLORS = {
  // Facility types - Vibrant neon colors
  hospital: '#00d4ff',      // Cyan neon
  clinic: '#a855f7',        // Purple neon
  health_center: '#22c55e', // Green neon
  pharmacy: '#f59e0b',      // Amber neon
  dentist: '#ec4899',       // Pink neon
  doctor: '#6366f1',        // Indigo neon
  default: '#94a3b8',
  
  // Status - Glow colors
  operational: '#22c55e',
  limited: '#f59e0b',
  critical: '#ef4444',
  
  // Desert severity - Hot colors
  desertHigh: '#ff3366',
  desertMedium: '#ff6b35',
  desertLow: '#ffc107',
  
  // Network lines
  networkPrimary: '#00d4ff',
  networkSecondary: '#6366f1',
  
  // UI accents
  glowCyan: 'rgba(0, 212, 255, 0.6)',
  glowPurple: 'rgba(168, 85, 247, 0.6)',
  glowRed: 'rgba(239, 68, 68, 0.6)',
} as const;

export type FacilityColorKey = keyof typeof MAP_COLORS;

// Glow effect CSS for markers
export const GLOW_EFFECTS = {
  hospital: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.8))',
  clinic: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))',
  health_center: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))',
  pharmacy: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))',
  critical: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))',
  desert: 'drop-shadow(0 0 20px rgba(255, 51, 102, 0.7))',
} as const;