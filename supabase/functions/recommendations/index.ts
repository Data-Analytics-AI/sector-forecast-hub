import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { forecastData, industryId, extraFields } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const dataPoints = (forecastData || []).slice(0, 60);
    const hasExtra = extraFields && extraFields.length > 0;

    const systemPrompt = `You are an expert data analyst and optimization advisor.
Your job is to take forecast data and generate practical, easy-to-understand optimization recommendations.

CRITICAL RULES:
1. First, DETECT what type of data this is by examining the values, patterns, and any labels. It could be sales/demand, weather/temperature, energy, traffic, financial, or any other type.
2. Tailor your recommendations specifically to the detected data type:

   - Sales/demand data → inventory buffers, order frequency, promotions during low-demand, peak preparation, safety stock levels
   - Weather/temperature data → logistics schedule adjustments, energy usage planning, weather disruption preparedness, workforce planning, seasonal maintenance
   - Financial data → cash flow optimization, investment timing, risk hedging, budget allocation
   - Energy data → load balancing, peak shaving, storage optimization, demand response
   - Traffic data → route optimization, scheduling adjustments, capacity planning
   - Any other type → adapt recommendations to be practical and actionable for that specific context

3. If additional fields are present (e.g., product categories, locations, suppliers, regions), incorporate them into more specific recommendations.
4. Produce 4-6 clear, actionable recommendations with specific numbers derived from the actual data.
5. Include a visualization suggestion that makes sense for the data type.
6. Include guidance points that an average person can easily understand.
7. Return ONLY valid JSON, no markdown fences.`;

    const userPrompt = `Industry context: ${industryId || "general"}
${hasExtra ? `Additional fields: ${extraFields.join(", ")}. Use these for more specific recommendations.` : "The data contains only dates and values."}

Forecast data (period, actual, forecast, upper_bound, lower_bound):
${dataPoints.map((p: any) => `${p.period}, ${p.actual ?? "null"}, ${p.forecast}, ${p.upper}, ${p.lower}`).join("\n")}

Analyze this data carefully. Detect what type of data it is from the values and patterns. Then return JSON in this exact structure:
{
  "data_type": "string describing detected data type e.g. sales, weather, energy",
  "recommendations": [
    { "priority": "high|medium|low", "action": "short title", "details": "specific actionable details with numbers from the data", "impact": "expected quantitative benefit" }
  ],
  "visualization": {
    "charts": [
      { "type": "line|bar|area", "x": "field name", "y": "field name", "title": "descriptive chart title" }
    ]
  },
  "summary": {
    "expected_benefits": "clear description of overall benefits",
    "optimization_focus": "main area of focus",
    "guidance_points": [
      "Simple, clear guidance point 1",
      "Simple, clear guidance point 2",
      "Simple, clear guidance point 3"
    ]
  }
}`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "").trim();
    }

    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommendations error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
