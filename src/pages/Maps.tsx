import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, TrendingUp, AlertTriangle, Minus, Gauge, Users, Factory, AlertCircle, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAnalysisData, getAIResult, type AIAnalysisResult, type AnalysisData } from "@/lib/analysisStore";
import indiaMap from "@/assets/india-states-map.png";

type RiskLevel = "low" | "medium" | "high";
type OverlayMetric = "overall" | "gdp" | "jobs" | "industryCost" | "policyRisk";

type StateImpact = NonNullable<NonNullable<AIAnalysisResult["modGeo"]>["stateImpacts"]>[string];

// State positions on map (layout config — not analysis data)
const statePositions: Record<string, { top: string; left: string }> = {
  "Jammu & Kashmir": { top: "12%", left: "28%" },
  "Ladakh": { top: "10%", left: "38%" },
  "Himachal Pradesh": { top: "20%", left: "32%" },
  "Punjab": { top: "24%", left: "28%" },
  "Uttarakhand": { top: "24%", left: "40%" },
  "Haryana": { top: "28%", left: "30%" },
  "Delhi": { top: "30%", left: "34%" },
  "Rajasthan": { top: "38%", left: "22%" },
  "Uttar Pradesh": { top: "35%", left: "45%" },
  "Bihar": { top: "38%", left: "58%" },
  "Sikkim": { top: "32%", left: "68%" },
  "Arunachal Pradesh": { top: "28%", left: "82%" },
  "Nagaland": { top: "35%", left: "85%" },
  "Manipur": { top: "40%", left: "84%" },
  "Mizoram": { top: "48%", left: "82%" },
  "Tripura": { top: "45%", left: "78%" },
  "Meghalaya": { top: "38%", left: "75%" },
  "Assam": { top: "34%", left: "76%" },
  "West Bengal": { top: "45%", left: "65%" },
  "Jharkhand": { top: "42%", left: "58%" },
  "Odisha": { top: "52%", left: "56%" },
  "Chhattisgarh": { top: "48%", left: "48%" },
  "Madhya Pradesh": { top: "45%", left: "38%" },
  "Gujarat": { top: "48%", left: "20%" },
  "Maharashtra": { top: "55%", left: "32%" },
  "Goa": { top: "72%", left: "24%" },
  "Karnataka": { top: "80%", left: "35%" },
  "Kerala": { top: "88%", left: "30%" },
  "Tamil Nadu": { top: "88%", left: "38%" },
  "Andhra Pradesh": { top: "72%", left: "42%" },
  "Telangana": { top: "60%", left: "38%" },
  "Andaman & Nicobar": { top: "72%", left: "78%" },
  "Lakshadweep": { top: "85%", left: "12%" },
  "Dadra & Nagar Haveli": { top: "56%", left: "24%" },
  "Daman & Diu": { top: "54%", left: "18%" },
  "Puducherry": { top: "87%", left: "44%" },
  "Chandigarh": { top: "22%", left: "26%" },
};

const unionTerritories = [
  "Jammu & Kashmir", "Ladakh", "Delhi", "Chandigarh", "Puducherry",
  "Andaman & Nicobar", "Lakshadweep", "Dadra & Nagar Haveli", "Daman & Diu",
];

const Maps = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [overlayMetric, setOverlayMetric] = useState<OverlayMetric>("overall");

  useEffect(() => {
    setData(getAnalysisData());
    setAiResult(getAIResult());
  }, []);

  const geo = aiResult?.modGeo;
  const stateImpactData = geo?.stateImpacts ?? {};
  const stateKeys = Object.keys(stateImpactData);
  const stateList = stateKeys.filter((k) => !unionTerritories.includes(k));
  const utList = stateKeys.filter((k) => unionTerritories.includes(k));

  const positiveStates = Object.values(stateImpactData).filter((s) => s.impact === "positive").length;
  const neutralStates = Object.values(stateImpactData).filter((s) => s.impact === "neutral").length;
  const riskStates = Object.values(stateImpactData).filter((s) => s.impact === "risk").length;

  const selectedImpact = selectedState ? stateImpactData[selectedState] : null;

  const quickInsights = useMemo(() => {
    const entries = Object.entries(stateImpactData).map(([key, s]) => {
      const benefitScore =
        (s.economicScore * 1.3 + s.employmentScore * 1.2 + s.socialScore) - s.riskPercent / 10;
      const challengeScore =
        s.riskPercent +
        (s.riskLevel === "high" ? 20 : s.riskLevel === "medium" ? 10 : 0) -
        s.infraReadiness / 10;
      return { key, name: key, benefitScore, challengeScore };
    });

    return {
      topBenefiting: [...entries].sort((a, b) => b.benefitScore - a.benefitScore).slice(0, 3),
      mostChallenged: [...entries].sort((a, b) => b.challengeScore - a.challengeScore).slice(0, 3),
    };
  }, [stateImpactData]);

  const getImpactColor = (impact: "positive" | "neutral" | "risk") => {
    switch (impact) {
      case "positive": return "bg-emerald-500";
      case "neutral": return "bg-amber-500";
      case "risk": return "bg-red-500";
    }
  };

  const getRiskBadge = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "low":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300/60">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300/60">Moderate Risk</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-300/60">High Implementation Risk</Badge>;
    }
  };

  const getMetricValue = (stateKey: string): number => {
    const s = stateImpactData[stateKey];
    if (!s) return 0;
    switch (overlayMetric) {
      case "overall":
        return ((s.economicScore + s.socialScore + s.environmentalScore + s.employmentScore) / 4) *
          (s.impact === "positive" ? 1.05 : s.impact === "risk" ? 0.95 : 1);
      case "gdp": return s.economicScore * 10;
      case "jobs": return s.employmentScore * 10;
      case "industryCost": return 100 - s.economicScore * 8;
      case "policyRisk": return s.riskLevel === "low" ? 20 : s.riskLevel === "medium" ? 60 : 90;
    }
  };

  // No AI data — prompt user
  if (!data || !geo || stateKeys.length === 0) {
    const noGeoModule = data && !data.modules.modGeo;
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {noGeoModule ? "Geographic Module Not Selected" : "No Geographic Analysis Data"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {noGeoModule
                  ? 'Enable the "State / District-wise impact" module in the Input page to view maps.'
                  : "Run an AI analysis with the Geographic module enabled to see state-wise impact data."}
              </p>
              <Link to="/" className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Go to Input
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Impact Analysis Map</h1>
            <p className="text-muted-foreground">
              AI-generated state-wise impact — unique to the analyzed law.
            </p>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 w-fit">
            <TrendingUp className="w-3 h-3 mr-1" /> AI Generated
          </Badge>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
            <CardContent className="py-4 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{positiveStates}</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-500">Positive Impact</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <CardContent className="py-4 text-center">
              <Minus className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{neutralStates}</div>
              <div className="text-sm text-amber-600 dark:text-amber-500">Neutral Impact</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800">
            <CardContent className="py-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{riskStates}</div>
              <div className="text-sm text-red-600 dark:text-red-500">Risk Areas</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="lg:col-span-2 shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                India - Impact Analysis Map
              </CardTitle>
              <CardDescription>
                Click on a state hotspot or select from the list to view AI-calculated impact.
              </CardDescription>
              <div className="mt-3">
                <Tabs value={overlayMetric} onValueChange={(v) => setOverlayMetric(v as OverlayMetric)}>
                  <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-1">
                    <TabsTrigger value="overall" className="flex items-center gap-1"><Gauge className="w-3 h-3" />Overall</TabsTrigger>
                    <TabsTrigger value="gdp" className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />GDP</TabsTrigger>
                    <TabsTrigger value="jobs" className="flex items-center gap-1"><Users className="w-3 h-3" />Jobs</TabsTrigger>
                    <TabsTrigger value="industryCost" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" />Cost</TabsTrigger>
                    <TabsTrigger value="policyRisk" className="flex items-center gap-1"><Flame className="w-3 h-3" />Risk</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative inline-block">
                <img
                  src={indiaMap}
                  alt="India Political Map"
                  className="max-w-full h-auto rounded-lg border border-border"
                  style={{ maxHeight: "600px" }}
                />
                {Object.entries(statePositions).map(([key, position]) => {
                  const stateData = stateImpactData[key];
                  const colorClass = stateData ? getImpactColor(stateData.impact) : "bg-muted-foreground/40";
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedState(key)}
                      className={`absolute z-10 w-4 h-4 rounded-full ${colorClass}
                        border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-150
                        ${selectedState === key ? "ring-2 ring-primary ring-offset-1 scale-150" : ""}`}
                      style={{ top: position.top, left: position.left, transform: "translate(-50%, -50%)" }}
                      title={key}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4 animate-slide-up">
            {/* Legend */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Impact Legend</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3"><div className="w-5 h-5 rounded bg-emerald-500" /><span className="text-sm">Positive Impact</span></div>
                <div className="flex items-center gap-3"><div className="w-5 h-5 rounded bg-amber-500" /><span className="text-sm">Neutral Impact</span></div>
                <div className="flex items-center gap-3"><div className="w-5 h-5 rounded bg-red-500" /><span className="text-sm">Risk Areas</span></div>
              </CardContent>
            </Card>

            {/* State Selector */}
            {stateList.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Select State</CardTitle></CardHeader>
                <CardContent className="max-h-[200px] overflow-y-auto">
                  <div className="space-y-1">
                    {stateList.map((key) => {
                      const s = stateImpactData[key];
                      return (
                        <button key={key} onClick={() => setSelectedState(key)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${selectedState === key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                          <div className={`w-3 h-3 rounded-full ${getImpactColor(s.impact)}`} />
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* UT Selector */}
            {utList.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Select Union Territory</CardTitle></CardHeader>
                <CardContent className="max-h-[200px] overflow-y-auto">
                  <div className="space-y-1">
                    {utList.map((key) => {
                      const s = stateImpactData[key];
                      return (
                        <button key={key} onClick={() => setSelectedState(key)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${selectedState === key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                          <div className={`w-3 h-3 rounded-full ${getImpactColor(s.impact)}`} />
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Selected state detail */}
            {selectedImpact ? (
              <Card className="shadow-soft">
                <CardHeader className="pb-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getImpactColor(selectedImpact.impact)}`} />
                      {selectedState}
                    </CardTitle>
                    {getRiskBadge(selectedImpact.riskLevel)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="impact">
                    <TabsList className="grid grid-cols-3 mb-3">
                      <TabsTrigger value="impact" className="text-xs">Impact Scores</TabsTrigger>
                      <TabsTrigger value="sectors" className="text-xs">Sector Impact</TabsTrigger>
                      <TabsTrigger value="stakeholders" className="text-xs">Stakeholders & Risk</TabsTrigger>
                    </TabsList>

                    <TabsContent value="impact" className="space-y-3 mt-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {[
                          { label: "Economic Impact", score: selectedImpact.economicScore, color: "bg-emerald-500", textColor: "text-emerald-700 dark:text-emerald-300" },
                          { label: "Social Impact", score: selectedImpact.socialScore, color: "bg-sky-500", textColor: "text-sky-700 dark:text-sky-300" },
                          { label: "Environmental", score: selectedImpact.environmentalScore, color: "bg-emerald-700", textColor: "text-emerald-900 dark:text-emerald-200" },
                          { label: "Employment", score: selectedImpact.employmentScore, color: "bg-indigo-500", textColor: "text-indigo-700 dark:text-indigo-300" },
                        ].map((m) => (
                          <div key={m.label} className="space-y-1">
                            <div className="flex justify-between">
                              <span className={`font-medium ${m.textColor}`}>{m.label}</span>
                              <span className="font-semibold">{m.score}/10</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.score * 10}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">INFRASTRUCTURE READINESS</h4>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Digital readiness</span>
                          <span className="font-semibold">{selectedImpact.infraReadiness}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${selectedImpact.infraReadiness}%` }} />
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">KEY INSIGHT</h4>
                        <p className="text-sm">{selectedImpact.keyInsight}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="sectors" className="mt-2 space-y-3">
                      <p className="text-xs text-muted-foreground">Sector-wise growth based on how the law affects each sector in this state.</p>
                      {selectedImpact.sectors?.length > 0 ? (
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={selectedImpact.sectors} margin={{ top: 8, right: 8, left: -16, bottom: 16 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="sector" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="change" fill="hsl(153, 60%, 45%)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No sector data available.</p>
                      )}
                    </TabsContent>

                    <TabsContent value="stakeholders" className="mt-2 space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">KEY STAKEHOLDERS</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedImpact.stakeholders?.map((s) => (
                            <Badge key={s} variant="outline" className="text-[11px]">{s}</Badge>
                          ))}
                        </div>
                      </div>

                      {selectedImpact.riskDrivers?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />RISK DRIVERS
                          </h4>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                            {selectedImpact.riskDrivers.map((r) => <li key={r}>{r}</li>)}
                          </ul>
                        </div>
                      )}

                      {selectedImpact.timeline?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-secondary" />TIMELINE PROJECTION
                          </h4>
                          <div className="flex items-center justify-between text-[11px]">
                            {selectedImpact.timeline.map((t, idx) => (
                              <div key={t.year} className="flex-1 flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold mb-1">
                                  Y{t.year}
                                </div>
                                <span className="text-center">{t.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-8 text-center">
                  <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a state to view detailed impact analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Summary */}
        <Card className="shadow-soft animate-fade-in mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Analysis Summary
            </CardTitle>
            <CardDescription>AI-generated overview across all analyzed regions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Regions Analyzed</div>
                <div className="text-3xl font-bold text-foreground">{stateKeys.length}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Avg Positive Impact</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {stateKeys.length ? Math.round(Object.values(stateImpactData).reduce((a, s) => a + s.positivePercent, 0) / stateKeys.length) : 0}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Avg Risk Level</div>
                <div className="text-3xl font-bold text-red-600">
                  {stateKeys.length ? Math.round(Object.values(stateImpactData).reduce((a, s) => a + s.riskPercent, 0) / stateKeys.length) : 0}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">High Risk Regions</div>
                <div className="text-3xl font-bold text-amber-600">{riskStates}</div>
              </div>
            </div>

            {/* Top / Challenged */}
            {quickInsights.topBenefiting.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mt-8 pt-6 border-t">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />Top Benefiting
                  </h4>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    {quickInsights.topBenefiting.map((s, i) => (
                      <li key={s.key}>{i + 1}. {s.name}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />Most Challenged
                  </h4>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    {quickInsights.mostChallenged.map((s, i) => (
                      <li key={s.key}>{i + 1}. {s.name}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Readiness clusters from AI */}
            {(geo.highReadiness?.length || geo.needSupport?.length) && (
              <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                {geo.highReadiness?.length > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">High Readiness</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{geo.highReadiness.join(", ")}</p>
                  </div>
                )}
                {geo.mediumReadiness?.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="font-medium text-amber-700 dark:text-amber-400">Medium Readiness</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{geo.mediumReadiness.join(", ")}</p>
                  </div>
                )}
                {geo.needSupport?.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="font-medium text-red-700 dark:text-red-400">Need Support</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{geo.needSupport.join(", ")}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Maps;
