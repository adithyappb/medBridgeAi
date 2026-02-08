
// Remove the import entirely as Deno.serve is built-in for Supabase Edge Runtime
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Facility {
  name: string;
  specialties: string[];
  procedures: string[];
  equipment: string[];
  capabilities: string[];
  city: string;
  region: string;
  status: string;
  facilityType: string;
  dataQualityScore: number;
}

interface Message {
  role: string;
  content: string;
}

interface AnalysisRequest {
  facilities: Facility[];
  country: string;
  query?: string;
  analysisType: 'vulnerability' | 'recommendations' | 'gaps' | 'query';
  model?: string;
  messages?: Message[];
}

// Optimized context builder to save tokens
function getFacilityContext(facilities: Facility[]) {
  return facilities.slice(0, 50).map(f => ({
    name: f.name,
    city: f.city,
    region: f.region,
    type: f.facilityType,
    status: f.status,
    specialties: f.specialties ? f.specialties.slice(0, 3) : [],
    score: f.dataQualityScore
  }));
}

function buildUserPrompt(analysisType: string, query?: string): string {
  switch (analysisType) {
    case 'vulnerability':
      return `
PERFORM A VULNERABILITY ANALYSIS.
Identify facilities with:
1. Low Data Quality Scores (<60)
2. 'Critical' or 'Overburdened' status
3. Missing core equipment
Output pure JSON:
{
  "highRiskCount": number,
  "criticalRegions": ["region1", "region2"],
  "vulnerableFacilities": [
    {"name": "Name", "reason": "Why"}
  ],
  "summary": "Executive summary of risks"
}`;
    case 'recommendations':
      return `
GENERATE STRATEGIC RECOMMENDATIONS.
Based on the facility list, recommend:
1. Equipment upgrades
2. New facility locations (based on gaps)
3. Service expansions
Output pure JSON:
{
  "upgrades": [{"facility": "Name", "upgrade": "Item"}],
  "newLocations": [{"region": "Region", "justification": "Why"}],
  "strategy": "Long-term strategy description"
}`;
    case 'gaps':
      return `
ANALYZE SERVICE GAPS.
Identify:
1. Regions with 0 facilities
2. Missing specialties in populated areas
Output pure JSON:
{
  "unservedRegions": ["r1", "r2"],
  "missingSpecialties": ["s1", "s2"],
  "impactAnalysis": "Description of impact"
}`;
    case 'query':
      return query ? `QUERY: ${query}` : "Provide a general overview of the healthcare network status.";
    default:
      return "Analyze the provided facility data.";
  }
}

function getSystemInstructions(country: string, facilityCount: number, facilityContext: unknown) {
  return `You are MedBridge-AI, an elite healthcare intelligence agent.

DATA CONTEXT:
- Country: ${country}
- Facilities analyzed: ${facilityCount}
- WHO standard: 1 hospital per 10,000 population

FACILITIES (Sample of up to 50):
${JSON.stringify(facilityContext, null, 2)}

RESPONSE RULES:
- Return ONLY valid JSON unless specifically asked for a chat response.
- Be concise and data-driven.
- If 'analysisType' is 'query', you may respond in text if the user asks for it, but prefer JSON structure if data is requested.
`;
}

// Use Deno.serve (Native API) - The cleanest and best practice for modern Supabase Functions
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { facilities, country, query, analysisType, model, messages } = await req.json() as AnalysisRequest;

    if (!facilities || !Array.isArray(facilities)) {
      throw new Error("Invalid facilities data");
    }

    const selectedModel = model || 'google/gemini-pro';
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // 1. Prepare Context
    const facilityContext = getFacilityContext(facilities);
    let systemPrompt = getSystemInstructions(country, facilities.length, facilityContext);

    // 2. Prepare Messages
    let apiMessages: Message[] = [];

    if (analysisType === 'query') {
      // Chat Mode
      if (messages && messages.length > 0) {
        // Recursive / History Mode
        systemPrompt += `
        RULES FOR CHAT:
        - Answer the user's latest message based on the Facility Data.
        - If the user asks a follow-up, use previous context.
        - specific format: {"answer": "...", "keyFindings": [], "evidence": [], "urgentAction": "", "confidence": ""}
        `;
        apiMessages = [
          { role: "system", content: systemPrompt },
          ...messages
        ];
      } else {
        // Single Query Mode
        const userContent = buildUserPrompt('query', query);
        systemPrompt += `
        RESPONSE FORMAT:
        {
          "answer": "Direct answer",
          "keyFindings": [],
          "evidence": [],
          "urgentAction": "",
          "confidence": "high|medium|low"
        }
        `;
        apiMessages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ];
      }
    } else {
      // Structured Analysis Mode
      const userContent = buildUserPrompt(analysisType);
      apiMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ];
    }

    // 3. Call AI
    const requestBody: any = {
      model: selectedModel,
      messages: apiMessages,
      temperature: 0.2,
    };

    if (selectedModel.startsWith('openai')) {
      requestBody.max_completion_tokens = 2000;
    } else {
      requestBody.max_tokens = 2000;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Error:", response.status, errText);
      throw new Error(`AI Gateway Error: ${response.status}`);
    }

    const aiRes = await response.json();
    const content = aiRes.choices?.[0]?.message?.content;

    if (!content) throw new Error("Empty AI response");

    // 4. Parse Result
    let parsedResult;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResult = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.warn("JSON Parse failed, returning raw", e);
      parsedResult = { rawResponse: content, analysisType };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysisType,
        result: parsedResult,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Handler Error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
