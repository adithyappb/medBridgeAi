import { cn } from '@/lib/utils';
import type { Facility, FacilityType } from '@/types/facility';
import { displayValue } from '@/lib/sanitize';
import { Building2, MapPin, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { FacilityInsights } from './FacilityInsights';

interface FacilityCardProps {
  facility: Facility;
  compact?: boolean;
  onClick?: () => void;
  showInsights?: boolean;
}

export function FacilityCard({ facility, compact = false, onClick, showInsights = false }: FacilityCardProps) {
  const getStatusConfig = (status: Facility['status']) => {
    switch (status) {
      case 'operational':
        return { label: 'Operational', class: 'status-operational' };
      case 'limited':
        return { label: 'Limited', class: 'status-limited' };
      case 'critical':
        return { label: 'Critical', class: 'status-critical' };
      default:
        return { label: 'Unknown', class: 'bg-muted text-muted-foreground' };
    }
  };

  const getFacilityTypeLabel = (type?: FacilityType) => {
    switch (type) {
      case 'hospital': return 'Hospital';
      case 'clinic': return 'Clinic';
      case 'pharmacy': return 'Pharmacy';
      case 'doctor': return 'Doctor';
      case 'dentist': return 'Dentist';
      default: return 'Healthcare Facility';
    }
  };

  const status = getStatusConfig(facility.status);
  const facilityType = facility.facilityTypeId;
  const cityDisplay = displayValue(facility.address.city, '');
  const regionDisplay = displayValue(facility.address.stateOrRegion, '');
  const location = [cityDisplay, regionDisplay].filter(Boolean).join(', ') || 'Ghana';
  const facilityName = displayValue(facility.name, 'Healthcare Facility');

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onClick}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      >
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          facilityType === 'hospital' ? 'bg-primary/10 text-primary' :
          facilityType === 'clinic' ? 'bg-facility-clinic/10 text-facility-clinic' :
          'bg-success/10 text-success'
        )}>
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{facilityName}</p>
          <p className="text-xs text-muted-foreground truncate">{location}</p>
        </div>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', status.class)}>
          {status.label}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-card rounded-xl p-5 border border-border cursor-pointer hover:shadow-card-hover transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-11 h-11 rounded-lg flex items-center justify-center',
            facilityType === 'hospital' ? 'bg-primary/10 text-primary' :
            facilityType === 'clinic' ? 'bg-facility-clinic/10 text-facility-clinic' :
            'bg-success/10 text-success'
          )}>
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground line-clamp-1">{facilityName}</h3>
            <p className="text-xs text-muted-foreground">{getFacilityTypeLabel(facilityType)}</p>
          </div>
        </div>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex-shrink-0', status.class)}>
          {status.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        {facility.specialties.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{facility.specialties.length} specialties</span>
          </div>
        )}
      </div>

      {/* Specialties */}
      {facility.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {facility.specialties.slice(0, 3).map((spec) => (
            <span 
              key={spec}
              className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs"
            >
              {formatSpecialty(spec)}
            </span>
          ))}
          {facility.specialties.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
              +{facility.specialties.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Capabilities */}
      {facility.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {facility.capabilities.slice(0, 2).map((cap, idx) => (
            <span 
              key={idx}
              className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs line-clamp-1"
            >
              {cap.length > 40 ? cap.slice(0, 40) + '...' : cap}
            </span>
          ))}
        </div>
      )}

      {facility.description && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
          <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground line-clamp-2">{facility.description}</p>
        </div>
      )}

      {facility.capacity && facility.capacity > 0 && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Bed Capacity</span>
          <span className="font-medium text-foreground">{facility.capacity} beds</span>
        </div>
      )}

      {facility.officialWebsite && (
        <div className="mt-3 pt-3 border-t border-border">
          <a 
            href={`https://${facility.officialWebsite}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {facility.officialWebsite}
          </a>
        </div>
      )}

      {/* AI Insights */}
      {showInsights && <FacilityInsights facility={facility} />}
    </motion.div>
  );
}

function formatSpecialty(specialty: string): string {
  // Convert camelCase to readable format
  return specialty
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
