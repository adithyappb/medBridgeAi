import type { MedicalDesert } from '@/types/facility';

/**
 * Simple grid-based deduplication for medical deserts.
 * Groups deserts into regional cells and keeps only the most severe per cell.
 */
export function mergeOverlappingDeserts(deserts: MedicalDesert[]): MedicalDesert[] {
  if (deserts.length === 0) return [];

  // Grid cell size in degrees (~50km at equator)
  const CELL_SIZE = 0.5;

  // Group deserts by grid cell
  const grid = new Map<string, MedicalDesert>();

  for (const desert of deserts) {
    const cellKey = `${Math.floor(desert.coordinates.lat / CELL_SIZE)},${Math.floor(desert.coordinates.lng / CELL_SIZE)}`;
    
    const existing = grid.get(cellKey);
    if (!existing) {
      grid.set(cellKey, desert);
    } else {
      // Keep the more severe one, or the one with larger population
      const severityRank = { high: 3, medium: 2, low: 1 };
      const existingSeverity = severityRank[existing.severity];
      const newSeverity = severityRank[desert.severity];
      
      if (newSeverity > existingSeverity || 
          (newSeverity === existingSeverity && (desert.estimatedPopulation ?? 0) > (existing.estimatedPopulation ?? 0))) {
        grid.set(cellKey, desert);
      }
    }
  }

  return Array.from(grid.values());
}

/**
 * Simple cluster icon styling
 */
export function getClusterIconHtml(count: number): string {
  const size = Math.min(36 + Math.log10(count + 1) * 12, 52);
  
  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: rgba(59, 130, 246, 0.9);
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
      color: white;
      font-family: system-ui, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    ">
      ${count}
    </div>
  `;
}
