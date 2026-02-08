import { useState, useCallback } from 'react';
import type { Facility } from '@/types/facility';

interface InsightState {
  loading: boolean;
  insights: string | null;
  error: string | null;
}

export function useFacilityInsights() {
  const [state, setState] = useState<InsightState>({
    loading: false,
    insights: null,
    error: null,
  });

  const fetchInsights = useCallback(async (facility: Facility) => {
    setState({ loading: true, insights: null, error: null });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facility-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            facility: {
              name: facility.name,
              facilityTypeId: facility.facilityTypeId,
              status: facility.status,
              specialties: facility.specialties,
              capabilities: facility.capabilities,
              equipment: facility.equipment,
              procedures: facility.procedures,
              address: facility.address,
              capacity: facility.capacity,
              numberDoctors: facility.numberDoctors,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      setState({ loading: false, insights: data.insights, error: null });
    } catch (e) {
      setState({
        loading: false,
        insights: null,
        error: e instanceof Error ? e.message : 'Failed to generate insights',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, insights: null, error: null });
  }, []);

  return { ...state, fetchInsights, reset };
}
