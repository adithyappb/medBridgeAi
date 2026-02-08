import { CoverageMap } from '@/components/map/CoverageMap';
import { FacilityCard } from '@/components/facilities/FacilityCard';
import { useState } from 'react';
import { Facility } from '@/types/facility';
import { X, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountry, useFacilityStats } from '@/hooks/useFacilityData';
import { COUNTRY_REGISTRY } from '@/lib/countryConfig';

export function MapView() {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const { country } = useCountry();
  const { stats } = useFacilityStats();
  const countryName = COUNTRY_REGISTRY[country].name;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Coverage Map</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span>Interactive visualization of {stats.totalFacilities} healthcare facilities in {countryName}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              <Brain className="w-3 h-3" />
              AI-Ready
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>{stats.medicalDesertCount} Medical Deserts Detected</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative min-h-[500px]">
        <CoverageMap
          className="h-full w-full"
          onFacilityClick={setSelectedFacility}
        />

        {/* Selected Facility Detail Panel */}
        <AnimatePresence>
          {selectedFacility && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-20 z-[1000] w-80"
            >
              <div className="relative">
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-card rounded-full border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors z-10"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <FacilityCard facility={selectedFacility} showInsights />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
