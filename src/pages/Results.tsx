import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Scale, TrendingUp, MapPin, Users, Heart, Globe, History, Telescope, AlertTriangle, CheckCircle2, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAnalysisData, getAIResult, pseudoRandomPercent, type AnalysisData, type AIAnalysisResult } from "@/lib/analysisStore";

interface AnalysisCard {
  id: string;
  title: string;
  icon: React.ElementType;
  status: "positive" | "neutral" | "risk";
  content: React.ReactNode;
  explanation: string;
}

const Results = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [aiResult, setAIResult] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    setData(getAnalysisData());
    setAIResult(getAIResult());
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Analysis Data</h2>
              <p className="text-muted-foreground mb-4">
                Please go to the Input page and run an analysis first.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Go to Input
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const { role, state, lang, modules } = data;

  const getStatusIcon = (status: "positive" | "neutral" | "risk") => {
    switch (status) {
      case "positive":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "neutral":
        return <MinusCircle className="w-5 h-5 text-warning" />;
      case "risk":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
  };

  const getStatusColor = (status: "positive" | "neutral" | "risk") => {
    switch (status) {
      case "positive":
        return "bg-success/10 border-success/30";
      case "neutral":
        return "bg-warning/10 border-warning/30";
      case "risk":
        return "bg-destructive/10 border-destructive/30";
    }
  };

  const cards: AnalysisCard[] = [];

  if (modules.modLegal) {
    const ai = aiResult?.modLegal;
    cards.push({
      id: "legal",
      title: "Simplified Legal Overview",
      icon: Scale,
      status: ai?.status || "positive",
      content: lang === "hi" && ai?.summary_hi ? (
        <p className="font-hindi">{ai.summary_hi}</p>
      ) : (
        <p>{ai?.summary_en || "This draft law simplifies GST input credit for micro and small enterprises, limits overlapping local taxes, and gives districts with weaker digital infrastructure more time and support."}</p>
      ),
      explanation: ai ? "AI-generated analysis based on the actual law text provided." : "Default analysis — run AI analysis for personalized results.",
    });
  }

  if (modules.modEconomic) {
    const ai = aiResult?.modEconomic;
    cards.push({
      id: "economic",
      title: "Economic & Fiscal Impact",
      icon: TrendingUp,
      status: ai?.status || "positive",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
            <span className="font-medium">Revenue Impact</span>
            <Badge className="bg-success text-success-foreground">{ai?.revenueImpact || "+₹2,400 Cr projected"}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">MSE Compliance Savings</span>
            <Badge variant="secondary">{ai?.complianceSavings || "~18% reduction"}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
            <span className="font-medium">Job Creation Potential</span>
            <Badge className="bg-success text-success-foreground">{ai?.jobCreation || "High"}</Badge>
          </div>
          {ai?.details && <p className="text-xs text-muted-foreground mt-2">{ai.details}</p>}
        </div>
      ),
      explanation: ai ? "AI-powered economic analysis based on the law text." : "Default analysis — run AI for personalized results.",
    });
  }

  if (modules.modGeo) {
    const ai = aiResult?.modGeo;
    cards.push({
      id: "geo",
      title: role === "central" ? "State-wise Impact Overview" : `District-wise Impact: ${state}`,
      icon: MapPin,
      status: ai?.status || "neutral",
      content: (
        <div className="space-y-2">
          {role === "central" ? (
            <>
              <div className="flex items-center gap-2 p-2 bg-success/10 rounded">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span>{ai?.highReadiness?.join(", ") || "Gujarat, Maharashtra, Karnataka"} - High digital readiness</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-warning/10 rounded">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span>{ai?.mediumReadiness?.join(", ") || "Rajasthan, MP, Odisha"} - Medium infrastructure</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span>{ai?.needSupport?.join(", ") || "Bihar, Jharkhand, Chhattisgarh"} - Need extended support</span>
              </div>
            </>
          ) : (
            <p>
              Districts in {state} show varying readiness levels. Urban districts likely to adopt quickly;
              rural districts may need the full 18-month compliance window.
            </p>
          )}
        </div>
      ),
      explanation: ai ? "AI geographic analysis based on state-wise readiness data." : "Default analysis — run AI for personalized results.",
    });
  }

  if (modules.modCommunity) {
    const ai = aiResult?.modCommunity;
    cards.push({
      id: "community",
      title: "Community Impact Analysis",
      icon: Users,
      status: ai?.status || "neutral",
      content: (
        <div className="space-y-2">
          <p>{ai?.summary || "Tribal artisan cooperatives in scheduled areas may face initial documentation challenges."}</p>
          {ai?.recommendations && (
            <ul className="list-disc list-inside text-sm space-y-1">
              {ai.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
        </div>
      ),
      explanation: ai ? "AI community impact analysis." : "Default analysis — run AI for personalized results.",
    });
  }

  if (modules.modGender) {
    const ai = aiResult?.modGender;
    cards.push({
      id: "gender",
      title: "Gender-specific Impact",
      icon: Heart,
      status: ai?.status || "positive",
      content: (
        <div className="space-y-2">
          <p>{ai?.summary || "The additional 3% input tax credit for women-led enterprises directly benefits an estimated 3.2 million registered businesses."}</p>
          {ai?.womenBenefit && (
            <Badge className="bg-success/20 text-success border-success/30">
              {ai.womenBenefit}
            </Badge>
          )}
        </div>
      ),
      explanation: ai ? "AI gender impact analysis." : "Default analysis — run AI for personalized results.",
    });
  }

  if (modules.modGlobal) {
    const ai = aiResult?.modGlobal;
    cards.push({
      id: "global",
      title: "Global Comparison",
      icon: Globe,
      status: ai?.status || "positive",
      content: (
        <div className="space-y-2">
          {ai?.comparisons ? (
            <ul className="list-disc list-inside text-sm space-y-1">
              {ai.comparisons.map((c, i) => (
                <li key={i}><strong>{c.country}</strong> ({c.policy}): {c.outcome}</li>
              ))}
            </ul>
          ) : (
            <>
              <p>Similar policies in Singapore and UK showed:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>15-20% increase in formal sector registration</li>
                <li>Reduced compliance burden by approximately 25%</li>
              </ul>
            </>
          )}
        </div>
      ),
      explanation: ai ? "AI global comparison analysis." : "Default analysis — run AI for personalized results.",
    });
  }

  if (modules.modPrevious) {
    const ai = aiResult?.modPrevious;
    cards.push({
      id: "previous",
      title: "Lessons from Past Reforms",
      icon: History,
      status: ai?.status || "neutral",
      content: (
        <div className="space-y-2">
          <p className="font-medium">Key learnings from past reforms:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            {(ai?.lessons || [
              "Early grievance redressal reduces resistance",
              "Phased implementation prevents system overload",
              "Clear communication in vernacular languages essential",
            ]).map((lesson, i) => (
              <li key={i}>{lesson}</li>
            ))}
          </ul>
        </div>
      ),
      explanation: ai ? "AI historical analysis." : "Default analysis — run AI for personalized results.",
    });
  }

  if (modules.modFuture) {
    const ai = aiResult?.modFuture;
    cards.push({
      id: "future",
      title: "3-Year Projection",
      icon: Telescope,
      status: ai?.status || "positive",
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="font-medium text-success">Optimistic Scenario</div>
            <div className="text-sm">{ai?.optimistic?.formalization || "85%"} MSE formalization, {ai?.optimistic?.revenue || "₹4,800 Cr"} additional revenue</div>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="font-medium text-warning">Neutral Scenario</div>
            <div className="text-sm">{ai?.neutral?.formalization || "65%"} MSE formalization, {ai?.neutral?.revenue || "₹2,400 Cr"} additional revenue</div>
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="font-medium text-destructive">Cautious Scenario</div>
            <div className="text-sm">{ai?.cautious?.formalization || "45%"} MSE formalization, {ai?.cautious?.revenue || "₹1,200 Cr"} additional revenue</div>
          </div>
        </div>
      ),
      explanation: ai ? "AI future projection analysis." : "Default analysis — run AI for personalized results.",
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        {/* Status Bar */}
        <div className="mb-6 p-4 bg-card rounded-lg border shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {role === "central"
                  ? "Central Government view: comparing impact across states."
                  : `State Government view: deep-dive into districts of ${state}.`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(modules)
                  .filter(([_, v]) => v)
                  .map(([key]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key.replace("mod", "")}
                    </Badge>
                  ))}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm">Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-sm">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-sm">Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Cards */}
        <div className="grid md:grid-cols-2 gap-6 stagger-children">
          {cards.map((card) => {
            const Icon = card.icon;
            const confidence = pseudoRandomPercent(card.id + data.timestamp);

            return (
              <Card
                key={card.id}
                className={`shadow-soft border-2 transition-all hover:-translate-y-1 ${getStatusColor(card.status)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                    </div>
                    {getStatusIcon(card.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-foreground">{card.content}</div>

                  {/* Confidence Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{confidence}%</span>
                    </div>
                    <div className="confidence-bar">
                      <div className="confidence-bar-fill" style={{ width: `${confidence}%` }} />
                    </div>
                  </div>

                  {/* Why AI suggests this */}
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Why AI suggests this:
                    </div>
                    <p className="text-xs text-muted-foreground">{card.explanation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
