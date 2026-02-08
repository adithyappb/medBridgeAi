
import { IntelligenceMetrics } from "./data-intelligence.ts";

export function generateSystemPrompt(intelligence: IntelligenceMetrics, country: string, facilityCount: number): string {
    return `You are MedBridge-AI, an elite healthcare intelligence system that delivers SHARP, PRECISE, LINE-BY-LINE insights to save lives.

CRITICAL: You have been provided with PRE-COMPUTED DATA INTELLIGENCE METRICS. Use these to give SPECIFIC answers, not generic ones.

COMPUTED INTELLIGENCE METRICS:
• Medical Deserts Identified: ${intelligence.medicalDeserts.length}
• Critical Gaps Found: ${intelligence.criticalGaps.length}
• Total Population at Risk: ${intelligence.populationImpact.totalAtRisk.toLocaleString()}
• Top Critical Areas: ${intelligence.populationImpact.criticalAreas.join(', ')}

MEDICAL DESERTS (calculated with desert score algorithm):
${intelligence.medicalDeserts.map(d =>
        `- **${d.region}**: ${d.desertScore}% severity, missing ${d.missingServices.join(', ')}, ${d.estimatedPop.toLocaleString()} pop at risk`
    ).join('\n')}

RESOURCE OPTIMIZATION (ROI-optimized priority):
${intelligence.resourceOptimization.map(r =>
        `- Priority #${r.priority}: **${r.region}** - deploy ${r.recommendedResources.join(', ')} (ROI: ${r.roi.toLocaleString()})`
    ).join('\n')}

CRITICAL RESPONSE RULES:
1. USE THE COMPUTED METRICS ABOVE - cite specific regions and numbers
2. Start with THE MOST CRITICAL INSIGHT FIRST from the data
3. Bold ALL numbers and region names for instant scanning
4. No generic statements - ONLY data-driven specifics

RESPONSE STRUCTURE:
✦ **Critical Finding** - [Use top medical desert or highest urgency]
• **Specific Region** - [cite desert score, pop at risk]
• **Resource Priority** - [cite ROI-optimized recommendation]
• **Population Impact** - [cite total at risk from metrics]

⚠️ URGENT ACTION: [Based on Priority #1 from resource optimization]

DATA CONTEXT:
• Country: **${country}**
• Facilities: **${facilityCount}** analyzed
• Regions: **${intelligence.medicalDeserts.length}** medical deserts identified

ALWAYS cite the SPECIFIC computed metrics. Never say "some regions" - say "**Region Name** (X% desertscore, Y pop)".
CRITICAL RESPONSE RULES:
1. Start with THE MOST CRITICAL INSIGHT FIRST (what will save the most lives)
2. Use clear line-by-line structure - ONE insight per line
3. Bold ALL numbers and region names for instant scanning
4. Maximum impact in minimum words - no fluff
5. End with SINGLE most urgent action`;
}

export function generateUserPrompt(analysisType: string, country: string, facilityContext: any[], query?: string): string {
    const commonSuffix = `
FORMATTING STANDARDS:
- Use ✦ for critical insights
- Use • for supporting points  
- Bold: **numbers**, **region names**, **facility names**
- Keep each line under 80 characters
- No paragraphs - only bullet points
- No generic statements - cite SPECIFIC data

DATA CONTEXT:
• Country: **${country}**
• Facilities: **${facilityContext.length}** analyzed
• WHO Standard: 1 hospital per 10,000 population
• Access Threshold: Emergency care within 60 minutes

JSON OUTPUT FORMAT:
{
  "answer": "ONE powerful opening sentence with **bold data**",
  "keyFindings": [
    "✦ **Number** facilities lack critical specialty",
    "• **Region** has zero emergency services",
    "• **X%** population at risk in medical deserts"
  ],
  "evidence": [
    "Specific facility name in Region shows gap",
    "Data point: exact number + what it means"
  ],
  "urgentAction": "Deploy mobile emergency units to **Region** immediately",
  "confidence": "high"
}

NEVER:
❌ Say "I don't have enough data"
❌ Use vague words like "some" or "many"  
❌ Write paragraphs
❌ Give generic advice
`;

    const commonAlways = `
ALWAYS:
✅ Lead with lives at risk
✅ Cite specific facilities/regions
✅ Quantify impact (**X lives**, **Y facilities**)
✅ Give ONE clear next action
`;

    let specificPrompt = '';

    switch (analysisType) {
        case 'vulnerability':
            specificPrompt = `Analyze these ${country} healthcare facilities and identify the most vulnerable regions (medical deserts).

Facility Data:
${JSON.stringify(facilityContext, null, 2)}

Return a JSON object with this exact structure:
{
  "vulnerableRegions": [
    {
      "region": "Region Name",
      "vulnerabilityScore": 0-100,
      "populationAtRisk": "estimated number",
      "criticalGaps": ["list of missing critical services"],
      "nearestAlternative": "nearest facility with services",
      "distanceToAlternative": "estimated distance/time",
      "urgencyLevel": "critical|high|medium|low",
      "recommendations": ["specific actionable recommendations"]
    }
  ],
  "overallAssessment": "summary paragraph",
  "priorityActions": ["top 3 priority actions"],
  "dataQualityNotes": "notes on data completeness"
}`;
            break;

        case 'recommendations':
            specificPrompt = `Based on these ${country} healthcare facilities, provide strategic recommendations for improving healthcare access.

Facility Data:
${JSON.stringify(facilityContext, null, 2)}

Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "priority": 1-10,
      "type": "new_facility|upgrade|mobile_unit|telehealth|specialist_deployment",
      "location": "specific location",
      "intervention": "detailed intervention description",
      "estimatedCost": "cost range",
      "populationImpact": "number of people served",
      "timeframe": "immediate|short-term|long-term",
      "requiredResources": ["list of resources needed"],
      "expectedOutcome": "measurable outcome"
    }
  ],
  "quickWins": ["immediate low-cost interventions"],
  "longTermStrategy": "strategic vision paragraph",
  "partnershipOpportunities": ["potential NGO/government partnerships"]
}`;
            break;

        case 'gaps':
            specificPrompt = `Identify specific service gaps and verify facility claims for these ${country} healthcare facilities.

Facility Data:
${JSON.stringify(facilityContext, null, 2)}

Return a JSON object with this exact structure:
{
  "serviceGaps": [
    {
      "service": "service name (e.g., cardiac surgery, pediatric ICU)",
      "affectedRegions": ["list of regions lacking this service"],
      "currentProviders": ["facilities claiming to offer this"],
      "verificationStatus": "verified|unverified|suspicious",
      "verificationNotes": "why this status was assigned",
      "populationNeed": "estimated demand",
      "recommendation": "how to address this gap"
    }
  ],
  "anomalies": [
    {
      "facility": "facility name",
      "issue": "description of suspicious claim",
      "evidence": "why this is flagged",
      "suggestedAction": "verification needed"
    }
  ],
  "equipmentGaps": ["critical equipment missing in the region"],
  "specialtyDeserts": ["specialties with zero coverage in regions"]
}`;
            break;

        case 'query':
            specificPrompt = `QUERY: ${query}

FACILITY DATA (${country}):
${JSON.stringify(facilityContext, null, 2)}

INSTRUCTIONS:
- Answer directly and powerfully
- Cite specific facilities/regions
- Quantify impact where possible
- Provide ONE clear next action

JSON RESPONSE:
{
  "answer": "Direct 2-3 sentence answer with **bold** key data",
  "keyFindings": ["Concise finding with number", "Another finding"],
  "evidence": ["Specific citation from data"],
  "urgentAction": "One clear action step",
  "confidence": "high|medium|low"
}`;
            break;
    }

    return specificPrompt + commonSuffix + commonAlways;
}
