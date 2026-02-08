import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Facility {
  name: string;
  facilityTypeId?: string;
  status?: string;
  specialties?: string[];
  capabilities?: string[];
  equipment?: string[];
  procedures?: string[];
  address?: {
    city?: string;
    stateOrRegion?: string;
  };
  capacity?: number;
  numberDoctors?: number;
  // Optimization mode fields
  nearestFacility?: string;
  distanceKm?: number;
  travelTimeMinutes?: number;
  qualityScore?: number;
  nearbyRecommendations?: Array<{
    type: string;
    priority: string;
    justification: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { facility, mode } = await req.json() as { facility: Facility; mode?: string };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context based on mode
    const isOptimization = mode === 'optimization';
    const facilityContext = isOptimization 
      ? buildOptimizationContext(facility)
      : buildFacilityContext(facility);

    const systemPrompt = isOptimization
      ? `You are a healthcare network optimization expert. Analyze this facility's position and generate a concise, data-driven assessment.

Format your response EXACTLY like this (be specific to the data):

**Network Score**: [X/100] - [one-line explanation based on connectivity metrics]

**Critical Metrics**:
• Distance to nearest hub: [X km / Y min] - [impact assessment]
• Quality index: [score/100] - [what this means for care delivery]
• WHO Compliance: [PASS/FAIL] - [specific threshold analysis]

**Algorithmic Finding**: [One key insight the optimization algorithm detected - e.g., bottleneck, isolation, strategic position]

**Recommended Action**: [Single most impactful optimization - be specific with expected improvement]

Rules:
- Use the exact data provided - no generic statements
- Keep total response under 100 words
- Focus on what makes this facility's position unique in the network
- Quantify impact where possible`
      : `You are an elite healthcare intelligence analyst. Provide concise, actionable facility assessments.

Format your response EXACTLY like this (use these exact headers):
**Situation**
[1-2 sentences on current state and key strengths/gaps]

**Priority Actions**
• [Action 1 - most impactful]
• [Action 2]
• [Action 3 if critical]

**Risk Level**: [Low/Medium/High] - [one-line justification]

Rules:
- Be specific to THIS facility's data
- Focus on actionable intelligence
- Keep total response under 100 words
- No generic advice - use the actual data provided`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this healthcare facility:\n\n${facilityContext}` }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to generate insights.";

    return new Response(JSON.stringify({ insights: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("facility-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildFacilityContext(f: Facility): string {
  const lines: string[] = [];
  
  lines.push(`Name: ${f.name}`);
  lines.push(`Type: ${f.facilityTypeId || 'Unknown'}`);
  lines.push(`Status: ${f.status || 'Unknown'}`);
  lines.push(`Location: ${[f.address?.city, f.address?.stateOrRegion].filter(Boolean).join(', ') || 'Unknown'}`);
  
  if (f.capacity) lines.push(`Bed Capacity: ${f.capacity}`);
  if (f.numberDoctors) lines.push(`Doctors: ${f.numberDoctors}`);
  
  if (f.specialties && f.specialties.length > 0) {
    lines.push(`Specialties: ${f.specialties.join(', ')}`);
  } else {
    lines.push(`Specialties: None documented`);
  }
  
  if (f.capabilities && f.capabilities.length > 0) {
    lines.push(`Capabilities: ${f.capabilities.slice(0, 5).join(', ')}`);
  }
  
  if (f.equipment && f.equipment.length > 0) {
    lines.push(`Equipment: ${f.equipment.slice(0, 5).join(', ')}`);
  } else {
    lines.push(`Equipment: None documented`);
  }
  
  if (f.procedures && f.procedures.length > 0) {
    lines.push(`Procedures: ${f.procedures.slice(0, 5).join(', ')}`);
  }
  
  return lines.join('\n');
}

function buildOptimizationContext(f: Facility): string {
  const lines: string[] = [];
  
  lines.push(`Facility: ${f.name}`);
  lines.push(`Nearest Connected Facility: ${f.nearestFacility || 'Unknown'}`);
  lines.push(`Distance to Nearest: ${f.distanceKm?.toFixed(1) || '?'} km`);
  lines.push(`Travel Time: ${f.travelTimeMinutes?.toFixed(0) || '?'} minutes`);
  lines.push(`WHO Standard: ${(f.travelTimeMinutes || 0) <= 90 ? 'MEETS 90-min threshold' : 'EXCEEDS 90-min threshold - CRITICAL'}`);
  
  if (f.qualityScore !== undefined) {
    lines.push(`Quality Score: ${f.qualityScore}/100`);
  }
  
  if (f.capabilities && f.capabilities.length > 0) {
    lines.push(`Capabilities: ${f.capabilities.slice(0, 5).join(', ')}`);
  }
  
  if (f.nearbyRecommendations && f.nearbyRecommendations.length > 0) {
    lines.push(`\nNearby Optimization Opportunities:`);
    f.nearbyRecommendations.forEach((rec, i) => {
      lines.push(`${i + 1}. [${rec.priority.toUpperCase()}] New ${rec.type}: ${rec.justification}`);
    });
  }
  
  return lines.join('\n');
}
