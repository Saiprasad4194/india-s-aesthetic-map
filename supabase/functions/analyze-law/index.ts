import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lawText, role, state, lang, modules } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const enabledModules = Object.entries(modules)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    const systemPrompt = `You are an expert Indian policy analyst AI. You analyze draft laws and policies for the Indian government.
You MUST respond with valid JSON only, no markdown, no explanation outside JSON.

Analyze the given draft law and return a JSON object with the following structure based on which modules are requested:

{
  "modLegal": {
    "summary_en": "Plain English summary of the law (2-3 sentences)",
    "summary_hi": "Same summary in simple Hindi",
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96,
    "sections": [{"title": "section name", "meaning": "what it means", "affectedParties": "who is affected"}],
    "objective": "main objective of the law",
    "affectedSectors": ["list of affected sectors/industries"],
    "stakeholders": ["list of key stakeholders"],
    "policyClassification": "e.g. Tax Reform, Environmental, Social Welfare, etc."
  },
  "modEconomic": {
    "revenueImpact": "e.g. +₹2,400 Cr projected",
    "complianceSavings": "e.g. ~18% reduction",
    "jobCreation": "High" | "Medium" | "Low",
    "gdpImpact": "e.g. +0.3% GDP contribution",
    "industryCostChange": "e.g. -12% compliance cost for MSEs",
    "employmentChange": "e.g. +30,000 direct jobs",
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96,
    "details": "2-3 sentence explanation",
    "sectorImpacts": [{"sector": "name", "impact": "positive"|"neutral"|"risk", "change": "+X% or -X%", "details": "one line"}],
    "timelineProjection": [{"period": "Q1 2026", "revenue": 0, "employment": 0, "adoption": 0}]
  },
  "modGeo": {
    "highReadiness": ["list of states with high digital readiness"],
    "mediumReadiness": ["list of states with medium infrastructure"],
    "needSupport": ["list of states needing extended support"],
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96,
    "stateImpacts": {
      "StateName": {
        "impact": "positive"|"neutral"|"risk",
        "positivePercent": 0-100, "neutralPercent": 0-100, "riskPercent": 0-100,
        "keyInsight": "one line insight specific to this state and the law",
        "economicScore": 1-10, "socialScore": 1-10, "environmentalScore": 1-10, "employmentScore": 1-10,
        "sectors": [{"sector": "sector name", "change": -10 to +20}],
        "stakeholders": ["key stakeholder groups in this state"],
        "infraReadiness": 0-100,
        "riskLevel": "low"|"medium"|"high",
        "riskDrivers": ["reasons for risk in this state"],
        "timeline": [{"year": 1, "label": "what happens"}, {"year": 3, "label": "..."}, {"year": 5, "label": "..."}]
      }
    }
  },
  "modCommunity": {
    "summary": "2-3 sentences about community impact",
    "recommendations": ["list of recommendations"],
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96,
    "urbanImpact": "summary of urban impact",
    "ruralImpact": "summary of rural impact",
    "inequalityEffect": "how it affects inequality"
  },
  "modGender": {
    "summary": "2-3 sentences about gender-specific impact",
    "womenBenefit": "key benefit for women",
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96
  },
  "modGlobal": {
    "comparisons": [{"country": "name", "policy": "name", "outcome": "result"}],
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96
  },
  "modPrevious": {
    "lessons": ["key lessons from past reforms"],
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96
  },
  "modFuture": {
    "optimistic": { "formalization": "85%", "revenue": "₹4,800 Cr" },
    "neutral": { "formalization": "65%", "revenue": "₹2,400 Cr" },
    "cautious": { "formalization": "45%", "revenue": "₹1,200 Cr" },
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96
  },
  "modEnvironmental": {
    "carbonImpact": "e.g. -5% carbon emissions in manufacturing",
    "pollutionChange": "e.g. Moderate reduction in industrial pollution",
    "resourceUsage": "e.g. +12% efficient resource utilization",
    "sustainabilityScore": 0-100,
    "summary": "2-3 sentences about environmental impact",
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96,
    "recommendations": ["environmental recommendations"]
  },
  "modSentiment": {
    "publicSupport": 0-100,
    "publicOpposition": 0-100,
    "neutralSentiment": 0-100,
    "summary": "2-3 sentences about likely public reaction",
    "newsReactions": [{"source": "type of media", "sentiment": "positive"|"negative"|"neutral", "summary": "one line"}],
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96
  },
  "modRiskScore": {
    "economicRisk": 1-10,
    "socialRisk": 1-10,
    "environmentalRisk": 1-10,
    "legalRisk": 1-10,
    "politicalRisk": 1-10,
    "overallRisk": 1-10,
    "summary": "2-3 sentences about overall risk assessment",
    "legalConflicts": ["list of potential conflicts with existing laws or constitutional provisions"],
    "mitigationStrategies": ["list of risk mitigation strategies"],
    "status": "positive" | "neutral" | "risk",
    "confidence": 60-96
  }
}

Only include modules that are requested. The role is "${role}" and ${role === "state" ? `the state is "${state}"` : "this is a central/national level analysis"}.
Language preference: ${lang === "hi" ? "Include Hindi summaries where applicable" : "English only"}.
Requested modules: ${enabledModules.join(", ")}

Be specific to the actual law text provided. Use realistic Indian economic figures and state names. For sections analysis, break the law into its key clauses/provisions.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze this draft law:\n\n${lawText}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let analysisResult;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysisResult = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI analysis response");
    }

    return new Response(JSON.stringify({ success: true, analysis: analysisResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-law error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
