import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Scale, TrendingUp, MapPin, Users, Heart, Globe, History, Telescope, AlertTriangle, CheckCircle2, MinusCircle, Leaf, MessageSquare, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PDFExport from "@/components/PDFExport";
import { getAnalysisData, getAIResult, pseudoRandomPercent, type AnalysisData, type AIAnalysisResult } from "@/lib/analysisStore";
import LawBreakdown from "@/components/results/LawBreakdown";
import RiskScoreCard from "@/components/results/RiskScoreCard";
import SentimentCard from "@/components/results/SentimentCard";
import EnvironmentalCard from "@/components/results/EnvironmentalCard";

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

  // If no data exists, use defaults so results page always shows something
  const effectiveData: AnalysisData = data ?? {
    role: "central",
    state: "Maharashtra",
    lang: "en",
    lawText: "",
    modules: {
      modLegal: true, modEconomic: true, modGeo: true, modCommunity: true,
      modGender: true, modGlobal: true, modPrevious: true, modFuture: true,
      modEnvironmental: true, modSentiment: true, modRiskScore: true,
    },
    timestamp: Date.now(),
  };

  const { role, state, lang, modules } = effectiveData;

  const getStatusIcon = (status: "positive" | "neutral" | "risk") => {
    switch (status) {
      case "positive": return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "neutral": return <MinusCircle className="w-5 h-5 text-warning" />;
      case "risk": return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
  };

  const getStatusColor = (status: "positive" | "neutral" | "risk") => {
    switch (status) {
      case "positive": return "bg-success/10 border-success/30";
      case "neutral": return "bg-warning/10 border-warning/30";
      case "risk": return "bg-destructive/10 border-destructive/30";
    }
  };

  const cards: AnalysisCard[] = [];

  // Legal module with law breakdown
  if (modules.modLegal) {
    const ai = aiResult?.modLegal;
    cards.push({
      id: "legal", title: "Law Summary & Breakdown", icon: Scale,
      status: ai?.status || "positive",
      content: <LawBreakdown ai={ai} lang={lang} />,
      explanation: ai ? "AI-generated law breakdown with clause detection and stakeholder identification." : "Default analysis — run AI for personalized results.",
    });
  }

  if (modules.modEconomic) {
    const ai = aiResult?.modEconomic;
    cards.push({
      id: "economic", title: "Economic & Fiscal Impact", icon: TrendingUp,
      status: ai?.status || "positive",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
            <span className="font-medium text-sm">Revenue Impact</span>
            <Badge className="bg-success text-success-foreground">{ai?.revenueImpact || "+₹2,400 Cr projected"}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium text-sm">GDP Impact</span>
            <Badge variant="secondary">{ai?.gdpImpact || "+0.3% GDP"}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium text-sm">Industry Cost Change</span>
            <Badge variant="secondary">{ai?.industryCostChange || "-12% for MSEs"}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
            <span className="font-medium text-sm">Employment Change</span>
            <Badge className="bg-success text-success-foreground">{ai?.employmentChange || "+30,000 jobs"}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
            <span className="font-medium text-sm">Job Creation Potential</span>
            <Badge className="bg-success text-success-foreground">{ai?.jobCreation || "High"}</Badge>
          </div>
          {ai?.sectorImpacts && ai.sectorImpacts.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold mb-2">Sector-wise Impact:</p>
              <div className="space-y-1">
                {ai.sectorImpacts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                    <span>{s.sector}</span>
                    <span className="font-medium">{s.change}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {ai?.details && <p className="text-xs text-muted-foreground mt-2">{ai.details}</p>}
        </div>
      ),
      explanation: ai ? "AI-powered economic analysis with sector breakdown." : "Default — run AI for real analysis.",
    });
  }

  if (modules.modGeo) {
    const ai = aiResult?.modGeo;
    cards.push({
      id: "geo", title: role === "central" ? "State-wise Impact" : `District Impact: ${state}`, icon: MapPin,
      status: ai?.status || "neutral",
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-success/10 rounded"><div className="w-3 h-3 rounded-full bg-success" /><span className="text-sm">{ai?.highReadiness?.join(", ") || "Gujarat, Maharashtra, Karnataka"} - High readiness</span></div>
          <div className="flex items-center gap-2 p-2 bg-warning/10 rounded"><div className="w-3 h-3 rounded-full bg-warning" /><span className="text-sm">{ai?.mediumReadiness?.join(", ") || "Rajasthan, MP, Odisha"} - Medium</span></div>
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded"><div className="w-3 h-3 rounded-full bg-destructive" /><span className="text-sm">{ai?.needSupport?.join(", ") || "Bihar, Jharkhand, Chhattisgarh"} - Need support</span></div>
        </div>
      ),
      explanation: ai ? "AI geographic analysis." : "Default — run AI for real analysis.",
    });
  }

  if (modules.modCommunity) {
    const ai = aiResult?.modCommunity;
    cards.push({
      id: "community", title: "Social & Community Impact", icon: Users,
      status: ai?.status || "neutral",
      content: (
        <div className="space-y-3">
          <p className="text-sm">{ai?.summary || "Analysis of community impact pending."}</p>
          {ai?.urbanImpact && <div className="p-2 bg-primary/5 rounded text-xs"><strong>Urban:</strong> {ai.urbanImpact}</div>}
          {ai?.ruralImpact && <div className="p-2 bg-success/5 rounded text-xs"><strong>Rural:</strong> {ai.ruralImpact}</div>}
          {ai?.inequalityEffect && <div className="p-2 bg-warning/5 rounded text-xs"><strong>Inequality:</strong> {ai.inequalityEffect}</div>}
          {ai?.recommendations && <ul className="list-disc list-inside text-xs space-y-1">{ai.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>}
        </div>
      ),
      explanation: ai ? "AI community impact analysis with urban/rural breakdown." : "Default — run AI.",
    });
  }

  if (modules.modGender) {
    const ai = aiResult?.modGender;
    cards.push({
      id: "gender", title: "Gender-specific Impact", icon: Heart,
      status: ai?.status || "positive",
      content: (
        <div className="space-y-2">
          <p className="text-sm">{ai?.summary || "Gender impact analysis pending."}</p>
          {ai?.womenBenefit && <Badge className="bg-success/20 text-success border-success/30">{ai.womenBenefit}</Badge>}
        </div>
      ),
      explanation: ai ? "AI gender impact analysis." : "Default — run AI.",
    });
  }

  if (modules.modEnvironmental) {
    const ai = aiResult?.modEnvironmental;
    cards.push({
      id: "environmental", title: "Environmental Impact", icon: Leaf,
      status: ai?.status || "neutral",
      content: <EnvironmentalCard ai={ai} />,
      explanation: ai ? "AI environmental impact analysis." : "Default — run AI.",
    });
  }

  if (modules.modSentiment) {
    const ai = aiResult?.modSentiment;
    cards.push({
      id: "sentiment", title: "Public Sentiment Analysis", icon: MessageSquare,
      status: ai?.status || "neutral",
      content: <SentimentCard ai={ai} />,
      explanation: ai ? "AI public sentiment prediction." : "Default — run AI.",
    });
  }

  if (modules.modRiskScore) {
    const ai = aiResult?.modRiskScore;
    cards.push({
      id: "riskScore", title: "Risk Assessment & Legal Conflicts", icon: ShieldAlert,
      status: ai?.status || "neutral",
      content: <RiskScoreCard ai={ai} />,
      explanation: ai ? "AI risk assessment with legal conflict analysis." : "Default — run AI.",
    });
  }

  if (modules.modGlobal) {
    const ai = aiResult?.modGlobal;
    cards.push({
      id: "global", title: "Global Comparison", icon: Globe,
      status: ai?.status || "positive",
      content: (
        <div className="space-y-2">
          {ai?.comparisons ? (
            <ul className="list-disc list-inside text-sm space-y-1">{ai.comparisons.map((c, i) => <li key={i}><strong>{c.country}</strong> ({c.policy}): {c.outcome}</li>)}</ul>
          ) : <p className="text-sm">Global comparison pending.</p>}
        </div>
      ),
      explanation: ai ? "AI global comparison." : "Default — run AI.",
    });
  }

  if (modules.modPrevious) {
    const ai = aiResult?.modPrevious;
    cards.push({
      id: "previous", title: "Lessons from Past Reforms", icon: History,
      status: ai?.status || "neutral",
      content: (
        <div className="space-y-2">
          <ul className="list-disc list-inside text-sm space-y-1">
            {(ai?.lessons || ["Run analysis for past reform lessons"]).map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      ),
      explanation: ai ? "AI historical analysis." : "Default — run AI.",
    });
  }

  if (modules.modFuture) {
    const ai = aiResult?.modFuture;
    cards.push({
      id: "future", title: "3-Year Projection", icon: Telescope,
      status: ai?.status || "positive",
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="font-medium text-success text-sm">Optimistic</div>
            <div className="text-xs">{ai?.optimistic?.formalization || "85%"} formalization, {ai?.optimistic?.revenue || "₹4,800 Cr"} revenue</div>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="font-medium text-warning text-sm">Neutral</div>
            <div className="text-xs">{ai?.neutral?.formalization || "65%"} formalization, {ai?.neutral?.revenue || "₹2,400 Cr"} revenue</div>
          </div>
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="font-medium text-destructive text-sm">Cautious</div>
            <div className="text-xs">{ai?.cautious?.formalization || "45%"} formalization, {ai?.cautious?.revenue || "₹1,200 Cr"} revenue</div>
          </div>
        </div>
      ),
      explanation: ai ? "AI projection." : "Default — run AI.",
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6 p-4 bg-card rounded-lg border shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {role === "central" ? "Central Government view" : `State view: ${state}`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(modules).filter(([_, v]) => v).map(([key]) => (
                  <Badge key={key} variant="secondary" className="text-xs">{key.replace("mod", "")}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PDFExport data={effectiveData} aiResult={aiResult} />
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success" /><span className="text-sm">Positive</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning" /><span className="text-sm">Neutral</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive" /><span className="text-sm">Risk</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 stagger-children">
          {cards.map((card) => {
            const aiModuleKey = card.id === "legal" ? "modLegal" : card.id === "economic" ? "modEconomic" : card.id === "geo" ? "modGeo" : card.id === "community" ? "modCommunity" : card.id === "gender" ? "modGender" : card.id === "environmental" ? "modEnvironmental" : card.id === "sentiment" ? "modSentiment" : card.id === "riskScore" ? "modRiskScore" : card.id === "global" ? "modGlobal" : card.id === "previous" ? "modPrevious" : "modFuture";
            const aiModuleResult = aiResult?.[aiModuleKey] as any;
            const confidence = aiModuleResult?.confidence || pseudoRandomPercent(card.id + effectiveData.timestamp);
            const Icon = card.icon;

            return (
              <Card key={card.id} className={`shadow-soft border-2 transition-all hover:-translate-y-1 ${getStatusColor(card.status)}`}>
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
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{confidence}%</span>
                    </div>
                    <div className="confidence-bar">
                      <div className="confidence-bar-fill" style={{ width: `${confidence}%` }} />
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Why AI suggests this:</div>
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
