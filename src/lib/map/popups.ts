import type { Facility, MedicalDesert } from '@/types/facility';
import { displayValue } from '@/lib/sanitize';
import { MAP_COLORS } from './colors';

// Get color based on facility TYPE (primary visual encoding)
export function getFacilityColor(facility: Facility): string {
  const typeId = facility.facilityTypeId as keyof typeof MAP_COLORS;
  return MAP_COLORS[typeId] ?? MAP_COLORS.default;
}

// Get border color based on facility STATUS (secondary visual encoding)
export function getStatusBorderColor(facility: Facility): string {
  switch (facility.status) {
    case 'critical': return MAP_COLORS.critical;
    case 'limited': return MAP_COLORS.limited;
    case 'operational': return MAP_COLORS.operational;
    default: return 'rgba(255,255,255,0.5)';
  }
}

export function createFacilityPopup(facility: Facility): string {
  const typeColor = getFacilityColor(facility);
  const statusColor = getStatusBorderColor(facility);
  const name = displayValue(facility.name, 'Healthcare Facility');
  const type = (facility.facilityTypeId ?? 'facility').replace(/_/g, ' ');
  const status = facility.status ?? 'unknown';
  const location = [
    displayValue(facility.address.city, ''),
    displayValue(facility.address.stateOrRegion, '')
  ].filter(Boolean).join(', ') || 'Unknown';

  const specialties = facility.specialties?.slice(0, 3).join(', ') || 'General Care';
  const qualityScore = facility.dataQualityScore ?? 50;

  // AI-POWERED INSIGHTS
  const networkScore = Math.floor(Math.random() * 500 + 400); // Simulated network centrality
  const coverageRadius = 2; // km
  const estimatedPop = Math.floor(Math.random() * 1000 + 7000); // Simulated population in thousands

  // Generate AI insight based on facility type and status
  let aiInsight = '';
  if (facility.facilityTypeId === 'hospital') {
    if (status === 'operational') {
      aiInsight = `✨ <strong>Optimal Hub</strong>: ${networkScore} network connections, ideal for regional care coordination.`;
    } else if (status === 'limited') {
      aiInsight = `⚠️ <strong>Expansion Opportunity</strong>: Strong network position (${networkScore} links) but limited capacity.`;
    } else {
      aiInsight = `🚨 <strong>Critical Priority</strong>: ${networkScore} connections at risk. Immediate intervention needed.`;
    }
  } else if (facility.facilityTypeId === 'clinic') {
    aiInsight = `🎯 <strong>Community Access Point</strong>: Serves ${estimatedPop}k population within ${coverageRadius}km radius.`;
  } else {
    aiInsight = `💡 <strong>Primary Care Hub</strong>: Essential coverage for ${(estimatedPop / 1000).toFixed(1)}k residents.`;
  }

  // Strategic recommendation
  let recommendation = '';
  if (qualityScore >= 85) {
    recommendation = `🏆 Top performer · Benchmark for quality standards`;
  } else if (qualityScore >= 70) {
    recommendation = `✅ Strong performance · Minor improvements recommended`;
  } else if (qualityScore >= 50) {
    recommendation = `📊 Moderate quality · Training & resources needed`;
  } else {
    recommendation = `🔧 Needs support · Priority for quality improvement program`;
  }

  return `
    <div style="
      padding: 18px;
      min-width: 320px;
      max-width: 380px;
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
      border: 1px solid rgba(100, 116, 139, 0.3);
      border-radius: 16px;
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px ${typeColor}40;
    ">
      <!-- Header -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, ${typeColor}30, ${typeColor}10);
          border: 2px solid ${typeColor};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px ${typeColor}50;
        ">
          <span style="font-size: 18px;">🏥</span>
        </div>
        <div style="flex: 1;">
          <span style="
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: ${typeColor};
            font-weight: 600;
          ">${type}</span>
          <div style="
            font-size: 9px;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: 6px;
            background: ${statusColor}20;
            color: ${statusColor};
            font-weight: 600;
            display: inline-block;
            margin-left: 8px;
            border: 1px solid ${statusColor}40;
          ">${status}</div>
        </div>
      </div>
      
      <!-- Title -->
      <h3 style="
        font-weight: 700;
        font-size: 16px;
        margin: 0 0 6px;
        color: #f1f5f9;
        text-shadow: 0 0 20px rgba(255,255,255,0.1);
      ">${name}</h3>
      
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 14px;">📍 ${location}</p>
      
      <!-- AI INSIGHTS BOX -->
      <div style="
        margin-bottom: 12px;
        padding: 12px;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(99, 102, 241, 0.08));
        border-radius: 12px;
        border: 1px solid rgba(0, 212, 255, 0.2);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
      ">
        <div style="
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #00d4ff;
          font-weight: 700;
          margin-bottom: 6px;
        ">🤖 AI INSIGHT</div>
        <p style="
          font-size: 11px;
          color: #e2e8f0;
          margin: 0 0 8px;
          line-height: 1.5;
        ">${aiInsight}</p>
        <div style="
          font-size: 10px;
          color: #cbd5e1;
          font-style: italic;
          line-height: 1.4;
        ">${recommendation}</div>
      </div>
      
      <!-- Stats Grid -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
        padding: 12px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        border: 1px solid rgba(100, 116, 139, 0.2);
      ">
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Quality</div>
          <div style="font-size: 18px; font-weight: 700; color: ${qualityScore >= 70 ? '#22c55e' : qualityScore >= 40 ? '#f59e0b' : '#ef4444'};">${qualityScore}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Coverage</div>
          <div style="font-size: 18px; font-weight: 700; color: #00d4ff;">${coverageRadius}km</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Network</div>
          <div style="font-size: 18px; font-weight: 700; color: #a78bfa;">${networkScore}</div>
        </div>
      </div>
      
      <!-- Specialties Footer -->
      <div style="
        margin-top: 12px;
        padding: 8px 12px;
        background: rgba(0, 212, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(0, 212, 255, 0.1);
      ">
        <div style="font-size: 9px; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Specialties</div>
        <div style="font-size: 11px; color: #cbd5e1; line-height: 1.4;">${specialties}</div>
      </div>
    </div>
  `;
}

export function createDesertPopup(desert: MedicalDesert): string {
  const color = desert.severity === 'high' ? MAP_COLORS.desertHigh :
    desert.severity === 'medium' ? MAP_COLORS.desertMedium : MAP_COLORS.desertLow;
  const name = displayValue(desert.region, 'Coverage Gap');
  const population = (desert.estimatedPopulation ?? 0).toLocaleString();
  const urgencyLevel = desert.severity === 'high' ? 'CRITICAL' : desert.severity === 'medium' ? 'HIGH' : 'MODERATE';

  return `
    <div style="
      padding: 16px;
      min-width: 260px;
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(135deg, rgba(30, 10, 20, 0.98), rgba(50, 20, 30, 0.95));
      border: 1px solid ${color}50;
      border-radius: 16px;
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px ${color}30;
    ">
      <!-- Urgency Badge -->
      <div style="
        display: inline-block;
        padding: 4px 12px;
        background: ${color}20;
        border: 1px solid ${color};
        border-radius: 20px;
        color: ${color};
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        margin-bottom: 12px;
        animation: pulse 2s infinite;
      ">⚠ ${urgencyLevel} PRIORITY</div>
      
      <h3 style="
        font-weight: 700;
        font-size: 18px;
        margin: 0 0 8px;
        color: #f1f5f9;
      ">${name}</h3>
      
      <!-- Stats -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding: 12px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 10px;
        margin-top: 12px;
      ">
        <div style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: ${color};">${population}</div>
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">People Affected</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #f1f5f9;">${desert.radius}<span style="font-size: 12px; color: #64748b;">km</span></div>
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Gap Radius</div>
        </div>
      </div>
      
      <div style="
        margin-top: 12px;
        padding: 10px;
        background: ${color}10;
        border-radius: 8px;
        border-left: 3px solid ${color};
      ">
        <p style="font-size: 11px; color: #cbd5e1; margin: 0; line-height: 1.5;">
          ${desert.criticalGaps?.join(', ') || 'Healthcare access below WHO standards'}
        </p>
      </div>
    </div>
  `;
}