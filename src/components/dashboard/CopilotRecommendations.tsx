import { motion } from 'framer-motion';
import { ArrowRight, Zap, Loader2, RefreshCw, Upload, Globe, Database, BarChart3, Lightbulb, TrendingUp } from 'lucide-react';
import { type ForecastPoint } from '@/data/demoData';
//import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import { useEffect, useState } from 'react';

const buildOptimizationPrompt = (forecastData: any) => `
Take the forecast data provided and generate a comprehensive optimization report that is directly relevant to the type of forecast data.

Forecast Data: ${JSON.stringify(forecastData)}

Output JSON with:
{
  "executive_summary": "...",
  "recommendations": [
    { "priority": "HIGH", "title": "...", "details": "...", "expected_benefit": "..." }
  ],
  "visualization": {
    "charts": [
      { "type": "line", "x": "date", "y": "forecast", "title": "Forecast vs. Action Points" }
    ]
  },
  "guidance_points": ["...", "..."]
}
`;

const CopilotRecommendations = ({ forecastData }: { forecastData: any }) => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!forecastData) return;

    const prompt = buildOptimizationPrompt(forecastData);

    // Replace this with your Copilot API call
    // Example pseudo-code:
    // copilot.generate(prompt).then(output => {
    //   setReport(JSON.parse(output));
    // });

    // For now, simulate with sample data:
    setReport({
      executive_summary: "Demand will peak mid-March. Optimization focuses on inventory buffers and supplier coordination.",
      recommendations: [
        { priority: "HIGH", title: "Safety Stock Adjustment", details: "Increase buffer by 15% before March 12.", expected_benefit: "+20% service stability" },
        { priority: "MEDIUM", title: "Post-Peak Markdown", details: "Launch promotions after March 24 to clear excess stock.", expected_benefit: "-10% holding costs" }
      ],
      visualization: {
        charts: [
          { type: "line", x: "date", y: "forecast", title: "Forecast vs. Inventory Buffer" }
        ]
      },
      guidance_points: [
        "Focus resources on peak demand periods",
        "Balance cost vs. service level",
        "Communicate volatility to suppliers"
      ]
    });
  }, [forecastData]);

  if (!report) return <p>Loading recommendations...</p>;

  return (
    <div>
      <h2>Executive Summary</h2>
      <p>{report.executive_summary}</p>

      <h3>Recommendations</h3>
      {report.recommendations.map((rec: any, i: number) => (
        <div key={i}>
          <strong>{rec.priority}</strong> - {rec.title}
          <p>{rec.details}</p>
          <em>{rec.expected_benefit}</em>
        </div>
      ))}

      <h3>Guidance Points</h3>
      <ul>
        {report.guidance_points.map((point: string, i: number) => <li key={i}>{point}</li>)}
      </ul>
    </div>
  );
};

export default CopilotRecommendations;
