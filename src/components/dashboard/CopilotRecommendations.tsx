import { motion } from 'framer-motion';
import { ArrowRight, Zap, Loader2, RefreshCw, Upload, Globe, Database, BarChart3, Lightbulb, TrendingUp } from 'lucide-react';
import { type ForecastPoint } from '@/data/demoData';
//import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import { useEffect, useState } from 'react';

import { CopilotClient } from '@/integrations/copilot/client';

const copilot = new CopilotClient();


const buildOptimizationPrompt = (forecastData: any) => `
Take the forecast data provided and generate a comprehensive optimization report that is directly relevant to the type of forecast data.

Forecast Data: ${JSON.stringify(forecastData)}

Your output must include:
1. Executive Summary – concise overview of the forecast and key optimization focus.  
2. Bottlenecks – detect and describe specific operational or strategic bottlenecks revealed by the dataset.  
3. Improvements – state clear, actionable improvements to resolve each bottleneck, with measurable impact.  
4. Recommendations – prioritized list (HIGH, MEDIUM, LOW) with title, details, and expected benefit.  
5. Visualization Suggestions – chart types and axes relevant to the dataset.  
6. Guidance Points – short bullet points summarizing practical actions.  

Rules:
- Adapt terminology dynamically: if the dataset is sales, use “inventory, stockouts, promotions”; if weather, use “temperature, rainfall, energy load”; if healthcare, use “patients, diagnostics, staffing.”  
- Always highlight at least one bottleneck and its improvement.  
- Quantify improvements where possible (percentages, units, costs, time saved).  
- Output must be valid JSON with keys: executive_summary, bottlenecks, recommendations, visualization, guidance_points.

`;

const CopilotRecommendations = ({ forecastData }: { forecastData: any }) => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (!forecastData) return;

    const prompt = buildOptimizationPrompt(forecastData);

    // Replace this with your Copilot API call
    // Example pseudo-code:
    copilot.generate(prompt).then(output => {
      setReport(JSON.parse(output));
    });

    // For now, simulate with sample data:
    // setReport({
    //   executive_summary: "Demand will peak mid-March. Optimization focuses on inventory buffers and supplier coordination.",
    //   recommendations: [
    //     { priority: "HIGH", title: "Safety Stock Adjustment", details: "Increase buffer by 15% before March 12.", expected_benefit: "+20% service stability" },
    //     { priority: "MEDIUM", title: "Post-Peak Markdown", details: "Launch promotions after March 24 to clear excess stock.", expected_benefit: "-10% holding costs" }
    //   ],
    //   visualization: {
    //     charts: [
    //       { type: "line", x: "date", y: "forecast", title: "Forecast vs. Inventory Buffer" }
    //     ]
    //   },
    //   guidance_points: [
    //     "Focus resources on peak demand periods",
    //     "Balance cost vs. service level",
    //     "Communicate volatility to suppliers"
    //   ]
    // });
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
