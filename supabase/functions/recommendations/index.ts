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

    // Build a concise data summary for the prompt
    const dataPoints = (forecastData || []).slice(0, 60); // limit context size
    const hasExtra = extraFields && extraFields.length > 0;

    const systemPrompt = `You are a supply-chain and demand-planning optimization expert.
Take the forecast data provided and generate optimization recommendations.

Rules:
- If the dataset only includes date and sales/values:
  Focus on demand-driven strategies such as adjusting order frequency, setting safety stock buffers (e.g. "Maintain 15% buffer above forecasted peak demand"), planning promotions during low-demand periods, and preparing for peaks (e.g. "Schedule replenishment every 7 days during high-demand periods").
- If the dataset includes additional fields (e.g., product categories, warehouse locations, suppliers, lead times):
  Incorporate these into the recommendations, such as inventory allocation by location, supplier scheduling, transportation planning, or markdown strategies.
- Produce 4-6 clear, actionable recommendations that dynamically adapt to whatever fields are available.
- Each recommendation must have "priority" (high/medium/low), "action" title, "details" with specific numbers derived from the data, and "impact" (expected quantitative benefit).
- Include a summary with "expected_benefits" and "optimization_focus".
- Return ONLY valid JSON, no markdown fences.`;

    const userPrompt = `Industry: ${industryId || "general"}
${hasExtra ? `Additional fields in the data: ${extraFields.join(", ")}. Use these to give location/product/supplier-specific recommendations.` : "The data contains only dates and values. Focus purely on demand-driven inventory and ordering strategies."}

Forecast data (period, actual, forecast, upper_bound, lower_bound):
${dataPoints.map((p: any) => `${p.period}, ${p.actual ?? "null"}, ${p.forecast}, ${p.upper}, ${p.lower}`).join("\n")}

Analyze trends, seasonality, and variance in this data. Return JSON:
{
  "recommendations": [
    { "priority": "high|medium|low", "action": "string", "details": "string with specific numbers from data", "impact": "string" }
  ],
  "summary": {
    "expected_benefits": "string",
    "optimization_focus": "string"
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

    // Strip markdown fences if present
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
