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
    const { lawText, parameters } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert Indian policy simulation AI. Given a law/policy text and modified parameters, predict the outcomes.
You MUST respond with valid JSON only.

The user will provide the original law text and parameter modifications. Predict outcomes based on those modifications.

Return this JSON structure:
{
  "baselineOutcome": {
    "gdpImpact": "+X%",
    "employmentChange": "+/-X jobs",
    "revenueChange": "+/-₹X Cr",
    "complianceRate": "X%",
    "publicSatisfaction": 0-100
  },
  "modifiedOutcome": {
    "gdpImpact": "+X%",
    "employmentChange": "+/-X jobs",
    "revenueChange": "+/-₹X Cr",
    "complianceRate": "X%",
    "publicSatisfaction": 0-100
  },
  "comparison": {
    "betterAreas": ["areas where modified policy is better"],
    "worseAreas": ["areas where modified policy is worse"],
    "tradeoffs": ["key tradeoffs to consider"]
  },
  "yearlyProjection": [
    {"year": 1, "baseline": {"revenue": 0, "jobs": 0, "compliance": 0}, "modified": {"revenue": 0, "jobs": 0, "compliance": 0}},
    {"year": 2, "baseline": {"revenue": 0, "jobs": 0, "compliance": 0}, "modified": {"revenue": 0, "jobs": 0, "compliance": 0}},
    {"year": 3, "baseline": {"revenue": 0, "jobs": 0, "compliance": 0}, "modified": {"revenue": 0, "jobs": 0, "compliance": 0}}
  ],
  "recommendation": "2-3 sentence recommendation based on simulation"
}

Use realistic Indian economic figures.`;

    const userPrompt = `Original Law:\n${lawText}\n\nModified Parameters:\n${JSON.stringify(parameters, null, 2)}\n\nPredict outcomes with these changes.`;

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
            { role: "user", content: userPrompt },
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

    let result;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse simulation response:", content);
      throw new Error("Failed to parse simulation response");
    }

    return new Response(JSON.stringify({ success: true, simulation: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simulate-policy error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
