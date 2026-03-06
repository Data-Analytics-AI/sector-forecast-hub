import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function parseCSVText(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) =>
    line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
  );
  return { headers, rows };
}

function generateForecast(
  dates: string[],
  values: number[],
  horizon: number
): Array<{ ds: string; yhat: number; yhat_lower: number; yhat_upper: number }> {
  // Simple linear trend + seasonality forecast for testing
  const n = values.length;
  if (n === 0) {
    // Generate from scratch
    const forecast = [];
    const baseDate = new Date();
    for (let i = 0; i < horizon; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i + 1);
      const yhat = 100 + Math.sin(i / 7) * 15 + i * 0.5;
      forecast.push({
        ds: d.toISOString().split("T")[0],
        yhat: Math.round(yhat * 100) / 100,
        yhat_lower: Math.round((yhat - 10 - Math.random() * 5) * 100) / 100,
        yhat_upper: Math.round((yhat + 10 + Math.random() * 5) * 100) / 100,
      });
    }
    return forecast;
  }

  // Calculate simple trend from existing data
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const slope = n > 1 ? (values[n - 1] - values[0]) / n : 0;
  const lastValue = values[n - 1];
  const stdDev = Math.sqrt(
    values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n
  );

  // Determine date interval
  let lastDate: Date;
  try {
    lastDate = new Date(dates[dates.length - 1]);
    if (isNaN(lastDate.getTime())) lastDate = new Date();
  } catch {
    lastDate = new Date();
  }

  let intervalDays = 1;
  if (dates.length >= 2) {
    try {
      const d1 = new Date(dates[dates.length - 2]);
      const d2 = new Date(dates[dates.length - 1]);
      intervalDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
    } catch {
      intervalDays = 1;
    }
  }

  const forecast = [];
  for (let i = 1; i <= horizon; i++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i * intervalDays);
    const trend = lastValue + slope * i;
    const seasonal = Math.sin((i / 7) * Math.PI * 2) * stdDev * 0.3;
    const yhat = trend + seasonal;
    const uncertainty = stdDev * 0.5 * Math.sqrt(i / horizon + 0.5);

    forecast.push({
      ds: d.toISOString().split("T")[0],
      yhat: Math.round(yhat * 100) / 100,
      yhat_lower: Math.round((yhat - uncertainty) * 100) / 100,
      yhat_upper: Math.round((yhat + uncertainty) * 100) / 100,
    });
  }
  return forecast;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      source_type,
      source_path,
      date_col,
      value_col,
      horizon = 30,
      query,
    } = body;

    if (!source_type || !date_col || !value_col) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: source_type, date_col, value_col" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let dates: string[] = [];
    let values: number[] = [];

    if (source_type === "csv" || source_type === "excel") {
      // Download file from storage and parse
      if (!source_path) {
        return new Response(
          JSON.stringify({ error: "Missing source_path for file-based source" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("uploads")
        .download(source_path);

      if (downloadError || !fileData) {
        return new Response(
          JSON.stringify({ error: `Failed to download file: ${downloadError?.message || "Unknown error"}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const text = await fileData.text();
      const { headers, rows } = parseCSVText(text);

      const dateIdx = headers.findIndex(
        (h) => h.toLowerCase() === date_col.toLowerCase()
      );
      const valIdx = headers.findIndex(
        (h) => h.toLowerCase() === value_col.toLowerCase()
      );

      if (dateIdx === -1 || valIdx === -1) {
        return new Response(
          JSON.stringify({
            error: `Column not found. Available columns: ${headers.join(", ")}. Requested: date_col="${date_col}", value_col="${value_col}"`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      for (const row of rows) {
        const dateVal = row[dateIdx];
        const numVal = parseFloat(row[valIdx]);
        if (dateVal && !isNaN(numVal)) {
          dates.push(dateVal);
          values.push(numVal);
        }
      }
    } else if (source_type === "api") {
      // For API source, generate mock forecast based on params
      // In production this would fetch from the user's API endpoint
      dates = [];
      values = [];
    } else if (source_type === "db") {
      // For DB source, generate mock forecast based on params
      // In production this would connect to the user's database
      dates = [];
      values = [];
    }

    const forecast = generateForecast(dates, values, horizon);

    return new Response(
      JSON.stringify({ forecast }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
