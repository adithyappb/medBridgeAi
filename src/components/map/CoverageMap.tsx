import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Maximize2, Minimize2, Crosshair, Plus, Minus, Target, CheckSquare, Square, AlertTriangle, Building2, Home, HeartPulse, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Facility } from '@/types/facility';
import { useFacilityData } from '@/hooks/useFacilityData';
import { FuturisticLegend } from './FuturisticLegend';
import { MapStats } from './MapStats';
import { calculateBounds } from '@/lib/countryConfig';
import { mergeOverlappingDeserts } from '@/lib/mapUtils';
import { MAP_COLORS } from '@/lib/map/colors';
import { createFacilityPopup, createDesertPopup, getFacilityColor, getStatusBorderColor } from '@/lib/map/popups';

interface CoverageMapProps {
  className?: string;
  onFacilityClick?: (facility: Facility) => void;
  isDashboardMode?: boolean;
}

// Custom dark map tiles
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Animated cluster icon with glow
function getClusterIconHtml(count: number): string {
  const size = Math.min(60, 30 + Math.log10(count + 1) * 15);
  const intensity = Math.min(1, count / 50);

  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, rgba(0, 212, 255, ${0.3 + intensity * 0.3}) 0%, transparent 70%);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
      <div style="
        width: ${size * 0.7}px;
        height: ${size * 0.7}px;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.9), rgba(99, 102, 241, 0.9));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: ${10 + Math.log10(count + 1) * 3}px;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.6), inset 0 1px 0 rgba(255,255,255,0.3);
        border: 2px solid rgba(255, 255, 255, 0.3);
      ">${count}</div>
    </div>
  `;
}

// Create glowing facility marker
function createFacilityMarker(facility: Facility): L.CircleMarker {
  const color = getFacilityColor(facility);
  const borderColor = getStatusBorderColor(facility);

  return L.circleMarker([facility.coordinates!.lat, facility.coordinates!.lng], {
    radius: 8,
    color: borderColor,
    fillColor: color,
    fillOpacity: 0.9,
    weight: 2.5,
    className: 'facility-marker-glow',
  });
}

// Create animated desert zone with WORLD-CLASS hover effects
function createDesertZone(desert: ReturnType<typeof mergeOverlappingDeserts>[0], isSelected: boolean = false): L.Circle {
  const color = desert.severity === 'high' ? MAP_COLORS.desertHigh :
    desert.severity === 'medium' ? MAP_COLORS.desertMedium : MAP_COLORS.desertLow;

  const zone = L.circle([desert.coordinates.lat, desert.coordinates.lng], {
    radius: desert.radius * 1000,
    color: isSelected ? '#00d4ff' : color,
    fillColor: color,
    fillOpacity: isSelected ? 0.55 : (desert.severity === 'high' ? 0.40 : desert.severity === 'medium' ? 0.30 : 0.22),
    weight: isSelected ? 5 : (desert.severity === 'high' ? 4 : 3),
    dashArray: desert.severity === 'high' ? '8,12' : '12,16',
    className: `desert-zone-${desert.severity} ${isSelected ? 'desert-selected' : ''} desert-interactive desert-wow`,
  });

  // Industry-leading hover effects (Google Maps/Mapbox standard)
  zone.on('mouseover', function (this: L.Circle) {
    const currentOpacity = this.options.fillOpacity || 0.22;
    this.setStyle({
      fillOpacity: Math.min(currentOpacity * 2.2, 0.70), // Stronger boost on hover
      weight: (this.options.weight || 3) + 3, // Much thicker border
      color: '#00d4ff', // Cyan highlight
    });
    // @ts-ignore - Leaflet canvas renderer
    if (this._container) this._container.style.cursor = 'pointer';
  });

  zone.on('mouseout', function (this: L.Circle) {
    this.setStyle({
      fillOpacity: isSelected ? 0.55 : (desert.severity === 'high' ? 0.40 : desert.severity === 'medium' ? 0.30 : 0.22),
      weight: isSelected ? 5 : (desert.severity === 'high' ? 4 : 3),
      color: isSelected ? '#00d4ff' : color,
    });
  });

  return zone;
}

// Create network connection lines between nearby facilities
function createNetworkLines(facilities: Facility[], maxDistance: number = 50): L.Polyline[] {
  const lines: L.Polyline[] = [];
  const validFacilities = facilities.filter(f => f.coordinates);

  for (let i = 0; i < Math.min(validFacilities.length, 100); i++) {
    const f1 = validFacilities[i];
    let nearestDist = Infinity;
    let nearestF: Facility | null = null;

    for (let j = 0; j < validFacilities.length; j++) {
      if (i === j) continue;
      const f2 = validFacilities[j];
      const dist = Math.sqrt(
        Math.pow(f1.coordinates!.lat - f2.coordinates!.lat, 2) +
        Math.pow(f1.coordinates!.lng - f2.coordinates!.lng, 2)
      ) * 111; // Rough km conversion

      if (dist < nearestDist && dist < maxDistance) {
        nearestDist = dist;
        nearestF = f2;
      }
    }

    if (nearestF) {
      const opacity = Math.max(0.1, 0.4 - (nearestDist / maxDistance) * 0.3);
      lines.push(
        L.polyline([
          [f1.coordinates!.lat, f1.coordinates!.lng],
          [nearestF.coordinates!.lat, nearestF.coordinates!.lng],
        ], {
          color: MAP_COLORS.networkPrimary,
          weight: 1,
          opacity,
          dashArray: '4,8',
          className: 'network-line',
        })
      );
    }
  }

  return lines;
}

// Filter Button Component with Glassmorphism
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'cyan';
}

function FilterButton({ active, onClick, icon, label, count, color }: FilterButtonProps) {
  const colorStyles = {
    red: {
      active: 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      inactive: 'bg-slate-800/40 border-slate-700/30 text-slate-500',
      hover: 'hover:border-red-500/30 hover:text-red-400',
    },
    orange: {
      active: 'bg-orange-500/20 border-orange-500/50 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
      inactive: 'bg-slate-800/40 border-slate-700/30 text-slate-500',
      hover: 'hover:border-orange-500/30 hover:text-orange-400',
    },
    yellow: {
      active: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
      inactive: 'bg-slate-800/40 border-slate-700/30 text-slate-500',
      hover: 'hover:border-yellow-500/30 hover:text-yellow-400',
    },
    green: {
      active: 'bg-green-500/20 border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
      inactive: 'bg-slate-800/40 border-slate-700/30 text-slate-500',
      hover: 'hover:border-green-500/30 hover:text-green-400',
    },
    cyan: {
      active: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.3)]',
      inactive: 'bg-slate-800/40 border-slate-700/30 text-slate-500',
      hover: 'hover:border-cyan-500/30 hover:text-cyan-400',
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 rounded-lg border flex items-center justify-between transition-all duration-200',
        active ? styles.active : `${styles.inactive} ${styles.hover}`
      )}
    >
      <div className="flex items-center gap-2">
        {active ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
      </div>
      <span className={cn(
        'text-xs font-bold px-1.5 py-0.5 rounded',
        active ? 'opacity-100' : 'opacity-40'
      )}>
        {count}
      </span>
    </motion.button>
  );
}

export function CoverageMap({ className, onFacilityClick, isDashboardMode = false }: CoverageMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    map: L.Map;
    markers: L.MarkerClusterGroup;
    deserts: L.LayerGroup;
    network: L.LayerGroup;
  } | null>(null);

  const [showDeserts, setShowDeserts] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showNetwork, setShowNetwork] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDesert, setSelectedDesert] = useState<ReturnType<typeof mergeOverlappingDeserts>[0] | null>(null);
  const [currentZoom, setCurrentZoom] = useState(7);

  // Advanced Filters
  const [showCriticalDeserts, setShowCriticalDeserts] = useState(true);
  const [showHighDeserts, setShowHighDeserts] = useState(true);
  const [showModerateDeserts, setShowModerateDeserts] = useState(true);

  const [showHospitals, setShowHospitals] = useState(true);
  const [showClinics, setShowClinics] = useState(true);
  const [showHealthCenters, setShowHealthCenters] = useState(true);

  const [showLimitedFacilities, setShowLimitedFacilities] = useState(true);
  const [showCriticalFacilities, setShowCriticalFacilities] = useState(true);
  const [showOperationalFacilities, setShowOperationalFacilities] = useState(true);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  const { facilities, medicalDeserts, isLoading } = useFacilityData();
  const cleanDeserts = useMemo(() => mergeOverlappingDeserts(medicalDeserts), [medicalDeserts]);

  // Calculate stats
  const stats = useMemo(() => {
    const hospitals = facilities.filter(f => f.facilityTypeId === 'hospital').length;
    const clinics = facilities.filter(f => f.facilityTypeId === 'clinic').length;
    const healthCenters = facilities.filter(f => f.facilityTypeId === 'health_center').length;
    const criticalDeserts = cleanDeserts.filter(d => d.severity === 'high').length;

    return {
      totalFacilities: facilities.length,
      hospitals,
      clinics,
      healthCenters,
      deserts: cleanDeserts.length,
      criticalDeserts,
      coverage: Math.round((1 - cleanDeserts.length / Math.max(facilities.length, 1)) * 100),
      avgDistance: 25, // Placeholder - could calculate from actual data
    };
  }, [facilities, cleanDeserts]);

  // Computed filter counts
  const filterCounts = useMemo(() => {
    const criticalDeserts = cleanDeserts.filter(d => d.severity === 'high').length;
    const highDeserts = cleanDeserts.filter(d => d.severity === 'medium').length;
    const moderateDeserts = cleanDeserts.filter(d => d.severity === 'low').length;

    const hospitals = facilities.filter(f => f.facilityTypeId === 'hospital').length;
    const clinics = facilities.filter(f => f.facilityTypeId === 'clinic').length;
    const healthCenters = facilities.filter(f => f.facilityTypeId === 'health_center').length;

    const limitedFacilities = facilities.filter(f => f.status === 'limited').length;
    const criticalFacilities = facilities.filter(f => f.status === 'critical').length;
    const operationalFacilities = facilities.filter(f => f.status === 'operational').length;

    return {
      criticalDeserts,
      highDeserts,
      moderateDeserts,
      hospitals,
      clinics,
      healthCenters,
      limitedFacilities,
      criticalFacilities,
      operationalFacilities,
    };
  }, [facilities, cleanDeserts]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || isLoading) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        zoomControl: false,
        preferCanvas: true,
        attributionControl: false,
        scrollWheelZoom: !isDashboardMode,
        dragging: !isDashboardMode,
        doubleClickZoom: !isDashboardMode,
        boxZoom: !isDashboardMode,
        keyboard: !isDashboardMode,
        touchZoom: !isDashboardMode,
      });

      // Dark themed tiles
      L.tileLayer(DARK_TILES, {
        attribution: '',
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control to bottom right only if not in dashboard mode
      if (!isDashboardMode) {
        L.control.zoom({ position: 'bottomright' }).addTo(map);
      }

      // Track zoom level
      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      setCurrentZoom(map.getZoom());

      const deserts = L.layerGroup().addTo(map);
      const network = L.layerGroup().addTo(map);
      const markers = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 60,
        disableClusteringAtZoom: 14,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: (cluster) => L.divIcon({
          html: getClusterIconHtml(cluster.getChildCount()),
          className: 'custom-cluster-futuristic',
          iconSize: L.point(60, 60),
        }),
      }).addTo(map);

      mapRef.current = { map, markers, deserts, network };
    }

    const { map, markers, deserts, network } = mapRef.current;
    const bounds = calculateBounds(facilities);

    // Clear all layers
    markers.clearLayers();
    deserts.clearLayers();
    network.clearLayers();

    // Add desert zones with click-to-zoom, animation, and FILTERING
    cleanDeserts.forEach(d => {
      // Apply desert severity filters
      if (d.severity === 'high' && !showCriticalDeserts) return;
      if (d.severity === 'medium' && !showHighDeserts) return;
      if (d.severity === 'low' && !showModerateDeserts) return;

      const isSelected = selectedDesert?.region === d.region;
      const zone = createDesertZone(d, isSelected);
      zone.bindPopup(createDesertPopup(d));

      // Click to zoom to desert
      zone.on('click', () => {
        setSelectedDesert(d);
        // Zoom to desert with padding
        const zoomLevel = 11; // Close zoom for deserts
        map.flyTo([d.coordinates.lat, d.coordinates.lng], zoomLevel, {
          animate: true,
          duration: 1.2,
        });
      });

      // Dynamic opacity based on zoom (wow factor: deserts fade when zoomed in)
      const adjustOpacity = () => {
        const currentZoom = map.getZoom();
        if (currentZoom >= 14) {
          zone.setStyle({ fillOpacity: 0, opacity: 0 }); // Invisible at close zoom
        } else if (currentZoom >= 12) {
          zone.setStyle({ fillOpacity: 0.05, opacity: 0.3 }); // Very faint
        } else {
          // Restore original opacity
          const originalOpacity = isSelected ? 0.35 : (d.severity === 'high' ? 0.25 : 0.18);
          zone.setStyle({ fillOpacity: originalOpacity, opacity: 1 });
        }
      };

      map.on('zoomend', adjustOpacity);
      adjustOpacity(); // Initial

      zone.addTo(deserts);
    });

    // Add network lines
    const lines = createNetworkLines(facilities);
    lines.forEach(line => line.addTo(network));

    // Add facility markers with FILTERING
    facilities.forEach(f => {
      if (!f.coordinates) return;

      // Apply facility type filters
      if (f.facilityTypeId === 'hospital' && !showHospitals) return;
      if (f.facilityTypeId === 'clinic' && !showClinics) return;
      if (f.facilityTypeId === 'health_center' && !showHealthCenters) return;

      // Apply facility status filters
      if (f.status === 'limited' && !showLimitedFacilities) return;
      if (f.status === 'critical' && !showCriticalFacilities) return;
      if (f.status === 'operational' && !showOperationalFacilities) return;

      const marker = createFacilityMarker(f);
      marker.bindPopup(createFacilityPopup(f));
      (marker as any)._facilityType = f.facilityTypeId;
      if (onFacilityClick) marker.on('click', () => onFacilityClick(f));
      markers.addLayer(marker);
    });

    map.setView(bounds.center, bounds.zoom, { animate: true });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [facilities, cleanDeserts, isLoading, onFacilityClick, isDashboardMode, selectedDesert,
    showCriticalDeserts, showHighDeserts, showModerateDeserts,
    showHospitals, showClinics, showHealthCenters,
    showLimitedFacilities, showCriticalFacilities, showOperationalFacilities]);

  // Toggle layers
  useEffect(() => {
    if (!mapRef.current) return;
    const { map, deserts, markers, network } = mapRef.current;

    showDeserts ? map.addLayer(deserts) : map.removeLayer(deserts);
    showFacilities ? map.addLayer(markers) : map.removeLayer(markers);
    showNetwork ? map.addLayer(network) : map.removeLayer(network);
  }, [showDeserts, showFacilities, showNetwork]);

  // Filter by type
  useEffect(() => {
    mapRef.current?.markers.eachLayer((layer: any) => {
      const match = selectedType === 'all' || layer._facilityType === selectedType;
      layer.setStyle({ opacity: match ? 1 : 0.15, fillOpacity: match ? 0.9 : 0.1 });
    });
  }, [selectedType]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    setSelectedDesert(null);
    const bounds = calculateBounds(facilities);
    mapRef.current.map.flyTo(bounds.center, bounds.zoom, { animate: true, duration: 1.2 });
  };

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.map.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.map.zoomOut();
  };

  return (
    <div className={cn(
      'relative rounded-2xl overflow-hidden',
      'border border-slate-700/50',
      'bg-slate-900',
      isFullscreen && 'fixed inset-0 z-50 rounded-none',
      className
    )}
      style={{
        boxShadow: '0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 100px rgba(0, 212, 255, 0.03)',
      }}
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Initializing Neural Map</p>
              <p className="text-xs text-slate-400">Processing {facilities.length} facilities...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filter Panel - WOW FACTOR */}
      {!isDashboardMode && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-4 left-4 z-[1000] w-72"
        >
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-[0_0_40px_rgba(0,212,255,0.15)] overflow-hidden">
            {/* Header - Always Visible */}
            <div
              onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-b border-slate-700/50"
            >
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Smart Filters</h3>
              </div>
              <motion.div
                animate={{ rotate: isFiltersCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </motion.div>
            </div>

            {/* Collapsible Content */}
            <AnimatePresence>
              {!isFiltersCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="p-4 space-y-4 pt-2">
                    {/* Desert Severity Filters */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Medical Deserts</p>
                      <div className="space-y-1.5">
                        <FilterButton
                          active={showCriticalDeserts}
                          onClick={() => setShowCriticalDeserts(!showCriticalDeserts)}
                          icon={<AlertTriangle className="w-3.5 h-3.5" />}
                          label="Critical"
                          count={filterCounts.criticalDeserts}
                          color="red"
                        />
                        <FilterButton
                          active={showHighDeserts}
                          onClick={() => setShowHighDeserts(!showHighDeserts)}
                          icon={<AlertTriangle className="w-3.5 h-3.5" />}
                          label="High"
                          count={filterCounts.highDeserts}
                          color="orange"
                        />
                        <FilterButton
                          active={showModerateDeserts}
                          onClick={() => setShowModerateDeserts(!showModerateDeserts)}
                          icon={<AlertTriangle className="w-3.5 h-3.5" />}
                          label="Moderate"
                          count={filterCounts.moderateDeserts}
                          color="yellow"
                        />
                      </div>
                    </div>

                    {/* Facility Type Filters */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Facility Types</p>
                      <div className="space-y-1.5">
                        <FilterButton
                          active={showHospitals}
                          onClick={() => setShowHospitals(!showHospitals)}
                          icon={<Building2 className="w-3.5 h-3.5" />}
                          label="Hospitals"
                          count={filterCounts.hospitals}
                          color="cyan"
                        />
                        <FilterButton
                          active={showClinics}
                          onClick={() => setShowClinics(!showClinics)}
                          icon={<HeartPulse className="w-3.5 h-3.5" />}
                          label="Clinics"
                          count={filterCounts.clinics}
                          color="cyan"
                        />
                        <FilterButton
                          active={showHealthCenters}
                          onClick={() => setShowHealthCenters(!showHealthCenters)}
                          icon={<Home className="w-3.5 h-3.5" />}
                          label="Health Centers"
                          count={filterCounts.healthCenters}
                          color="cyan"
                        />
                      </div>
                    </div>

                    {/* Facility Status Filters */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Operational Status</p>
                      <div className="space-y-1.5">
                        <FilterButton
                          active={showOperationalFacilities}
                          onClick={() => setShowOperationalFacilities(!showOperationalFacilities)}
                          icon={<CheckSquare className="w-3.5 h-3.5" />}
                          label="Operational"
                          count={filterCounts.operationalFacilities}
                          color="green"
                        />
                        <FilterButton
                          active={showLimitedFacilities}
                          onClick={() => setShowLimitedFacilities(!showLimitedFacilities)}
                          icon={<Square className="w-3.5 h-3.5" />}
                          label="Limited"
                          count={filterCounts.limitedFacilities}
                          color="yellow"
                        />
                        <FilterButton
                          active={showCriticalFacilities}
                          onClick={() => setShowCriticalFacilities(!showCriticalFacilities)}
                          icon={<AlertTriangle className="w-3.5 h-3.5" />}
                          label="Critical"
                          count={filterCounts.criticalFacilities}
                          color="red"
                        />
                      </div>
                    </div>

                    {/* Zoom Info */}
                    {currentZoom >= 12 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
                      >
                        <p className="text-xs text-cyan-300 text-center">
                          {currentZoom >= 14 ? '🎯 Close-up View: Deserts Hidden' : '🔍 Deserts Fading...'}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Map Controls */}
      {!isDashboardMode && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-10 h-10 rounded-xl bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRecenter}
            className="w-10 h-10 rounded-xl bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/50 transition-colors"
          >
            <Crosshair className="w-4 h-4" />
          </motion.button>

          {/* Custom Zoom Controls */}
          <div className="mt-2 flex flex-col gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              disabled={currentZoom >= 19}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              disabled={currentZoom <= 3}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <Minus className="w-5 h-5" strokeWidth={3} />
            </motion.button>
          </div>
        </div>
      )}

      {/* Legend */}
      {!isDashboardMode && (
        <FuturisticLegend
          showFacilities={showFacilities}
          showDeserts={showDeserts}
          showNetwork={showNetwork}
          onToggleFacilities={setShowFacilities}
          onToggleDeserts={setShowDeserts}
          onToggleNetwork={setShowNetwork}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          stats={stats}
        />
      )}

      {/* Stats Bar */}
      {!isDashboardMode && (
        <MapStats
          facilities={stats.totalFacilities}
          deserts={stats.deserts}
          coverage={stats.coverage}
          avgDistance={stats.avgDistance}
        />
      )}

      {/* Map Container */}
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{
          minHeight: isFullscreen ? '100vh' : '600px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      />

      {/* Gradient Overlays for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />
      </div>

      {/* Custom CSS for map elements */}
      <style>{`
        .leaflet-container {
          background: transparent !important;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 16px !important;
          padding: 0 !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
        }
        
        .leaflet-popup-tip {
          display: none !important;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          background: transparent !important;
        }
        
        .leaflet-control-zoom a {
          background: rgba(30, 41, 59, 0.9) !important;
          backdrop-filter: blur(10px);
          color: #94a3b8 !important;
          border: 1px solid rgba(100, 116, 139, 0.3) !important;
          border-radius: 8px !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 30px !important;
          margin-bottom: 4px !important;
          transition: all 0.2s !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(51, 65, 85, 0.9) !important;
          color: #f1f5f9 !important;
          border-color: rgba(0, 212, 255, 0.3) !important;
        }
        
        .custom-cluster-futuristic {
          background: transparent !important;
        }
        
        .facility-marker-glow {
          filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 12px currentColor);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        .facility-marker-glow:hover {
          filter: drop-shadow(0 0 15px currentColor) drop-shadow(0 0 25px currentColor);
          transform: scale(1.1);
        }
        
        /* Desert Interactive Zones - World-Class Standards */
        .desert-interactive {
          cursor: pointer !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .desert-zone-high {
          animation: desertPulseHigh 2.5s ease-in-out infinite;
          filter: drop-shadow(0 0 18px currentColor) drop-shadow(0 0 30px currentColor) drop-shadow(0 0 45px currentColor);
        }
        
        .desert-zone-medium {
          animation: desertPulseMedium 3s ease-in-out infinite;
          filter: drop-shadow(0 0 12px currentColor) drop-shadow(0 0 20px currentColor);
        }
        
        .desert-zone-low {
          animation: desertPulseLow 3.5s ease-in-out infinite;
          filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 15px currentColor);
        }
        
        /* WOW FACTOR: Enhanced selected desert with mega glow */
        .desert-selected {
          animation: desertSelected 2s ease-in-out infinite !important;
          filter: drop-shadow(0 0 30px #00d4ff) drop-shadow(0 0 50px #00d4ff) drop-shadow(0 0 70px #00d4ff) !important;
          cursor: pointer !important;
        }
        
        /* WOW FACTOR: Additional ripple effect class */
        .desert-wow {
          position: relative;
        }
        
        /* Smooth hover transition for all desert zones */
        path.leaflet-interactive {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes desertPulseHigh {
          0%, 100% { opacity: 0.40; }
          50% { opacity: 0.65; }
        }
        
        @keyframes desertPulseMedium {
          0%, 100% { opacity: 0.30; }
          50% { opacity: 0.50; }
        }
        
        @keyframes desertPulseLow {
          0%, 100% { opacity: 0.22; }
          50% { opacity: 0.38; }
        }
        
        @keyframes desertSelected {
          0%, 100% { 
            opacity: 0.55;
            transform: scale(1);
          }
          50% { 
            opacity: 0.75;
            transform: scale(1.05);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        
        .network-line {
          animation: networkFlow 2s linear infinite;
        }
        
        @keyframes networkFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -24; }
        }
      `}</style>
    </div>
  );
}