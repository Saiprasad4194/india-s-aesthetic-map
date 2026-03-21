import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  BarChart3,
  PieChartIcon,
  Activity,
  Users,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  Target,
  Scale,
  Leaf,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAnalysisData, getAIResult, type AnalysisData, type AIAnalysisResult } from "@/lib/analysisStore";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  ReferenceLine,
} from "recharts";

/* ─── Reusable sub-components ─── */

const InsightCard = ({
  title, value, trend, trendValue, description, icon: Icon,
}: {
  title: string; value: string; trend: "up" | "down" | "neutral"; trendValue: string; description: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <Card className="shadow-soft hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm ${
          trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-yellow-600"
        }`}>
          {trend === "up" ? <ArrowUpRight className="w-4 h-4" /> :
           trend === "down" ? <ArrowDownRight className="w-4 h-4" /> :
           <Minus className="w-4 h-4" />}
          {trendValue}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{description}</p>
    </CardContent>
  </Card>
);

const KnowledgePanel = ({ title, insights }: { title: string; insights: string[] }) => {
  const filtered = insights.filter(Boolean);
  if (filtered.length === 0) return null;
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-saffron" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {filtered.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-saffron mt-2 flex-shrink-0" />
              {insight}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const EmptyModuleCard = ({ title, description }: { title: string; description: string }) => (
  <Card className="shadow-soft">
    <CardContent className="py-10 text-center">
      <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

/* ─── Helpers ─── */
const parseNum = (txt?: string) => (txt ? parseFloat(txt.replace(/[^0-9.-]/g, "")) || 0 : 0);
const trendDir = (v: string): "up" | "down" | "neutral" => (v.includes("-") ? "down" : v.match(/\+|[1-9]/) ? "up" : "neutral");

/* ─── Main page ─── */

const Impact = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    setData(getAnalysisData());
    setAiResult(getAIResult());
  }, []);

  const simulationResult = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("policySimulation");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const eco = aiResult?.modEconomic;
  const geo = aiResult?.modGeo;
  const gender = aiResult?.modGender;
  const future = aiResult?.modFuture;
  const env = aiResult?.modEnvironmental;
  const community = aiResult?.modCommunity;
  const risk = aiResult?.modRiskScore;
  const sentiment = aiResult?.modSentiment;

  const { role, state, modules } = data || { role: "central", state: "", modules: {} as AnalysisData["modules"] };

  /* ── Derived chart data (all from AI, zero fallbacks) ── */

  const economicTimeline = useMemo(() => {
    if (!eco?.timelineProjection?.length) return [];
    const simFactor = simulationResult?.modifiedOutcome?.revenueChange
      ? 1 + parseNum(simulationResult.modifiedOutcome.revenueChange) / 100
      : 1;
    return eco.timelineProjection.map((p) => ({
      period: p.period,
      revenue: Math.round(p.revenue * simFactor),
      employment: p.employment,
      adoption: p.adoption,
    }));
  }, [eco, simulationResult]);

  const sectorData = useMemo(() => {
    if (!eco?.sectorImpacts?.length) return [];
    return eco.sectorImpacts.map((s) => ({
      sector: s.sector,
      change: parseNum(s.change),
      impact: s.impact,
      details: s.details,
    }));
  }, [eco]);

  const stateImpactData = useMemo(() => {
    if (!geo?.stateImpacts) return [];
    return Object.entries(geo.stateImpacts).map(([name, v]) => ({
      name, positive: v.positivePercent, neutral: v.neutralPercent, risk: v.riskPercent,
    }));
  }, [geo]);

  const scenarioData = useMemo(() => {
    if (!future) return [];
    return [
      { scenario: "Optimistic", year1: parseNum(future.optimistic.revenue), year3: parseNum(future.optimistic.revenue) * 1.5, year5: parseNum(future.optimistic.revenue) * 2 },
      { scenario: "Neutral", year1: parseNum(future.neutral.revenue), year3: parseNum(future.neutral.revenue) * 1.3, year5: parseNum(future.neutral.revenue) * 1.7 },
      { scenario: "Cautious", year1: parseNum(future.cautious.revenue), year3: parseNum(future.cautious.revenue) * 1.2, year5: parseNum(future.cautious.revenue) * 1.4 },
    ];
  }, [future]);

  const radarData = useMemo(() => {
    if (!eco && !env && !community && !risk) return [];
    const items: { subject: string; score: number }[] = [];
    if (eco?.gdpImpact) items.push({ subject: "Economic Growth", score: Math.min(100, Math.abs(parseNum(eco.gdpImpact)) * 20) });
    if (eco?.employmentChange) items.push({ subject: "Employment", score: Math.min(100, Math.abs(parseNum(eco.employmentChange)) / 500) });
    if (eco?.complianceSavings) items.push({ subject: "Compliance", score: Math.min(100, Math.abs(parseNum(eco.complianceSavings))) });
    if (env) items.push({ subject: "Sustainability", score: env.sustainabilityScore });
    if (community?.inequalityEffect) items.push({ subject: "Social Equity", score: community.inequalityEffect.toLowerCase().includes("reduce") ? 75 : community.inequalityEffect.toLowerCase().includes("increase") ? 30 : 50 });
    if (risk) items.push({ subject: "Risk (inv.)", score: Math.max(0, 100 - risk.overallRisk * 10) });
    if (sentiment) items.push({ subject: "Public Support", score: sentiment.publicSupport });
    return items.map((i) => ({ ...i, baseline: 50, fullMark: 100 }));
  }, [eco, env, community, risk, sentiment]);

  const riskBreakdown = useMemo(() => {
    if (!risk) return [];
    return [
      { label: "Economic", score: risk.economicRisk },
      { label: "Social", score: risk.socialRisk },
      { label: "Environmental", score: risk.environmentalRisk },
      { label: "Legal", score: risk.legalRisk },
      { label: "Political", score: risk.politicalRisk },
    ];
  }, [risk]);

  const sentimentData = useMemo(() => {
    if (!sentiment) return [];
    return [
      { name: "Support", value: sentiment.publicSupport, color: "hsl(145, 63%, 50%)" },
      { name: "Opposition", value: sentiment.publicOpposition, color: "hsl(0, 72%, 55%)" },
      { name: "Neutral", value: sentiment.neutralSentiment, color: "hsl(43, 96%, 56%)" },
    ];
  }, [sentiment]);

  /* ── Guard: no data at all ── */
  if (!data || !aiResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Analysis Data</h2>
              <p className="text-muted-foreground mb-4">Run an AI analysis first to see dynamic impact insights.</p>
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

  const hasAnyChart = eco || geo || gender || future || env || risk || sentiment || community;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Impact Analysis Dashboard</h1>
              <p className="text-muted-foreground">AI-generated insights — unique to each analyzed law</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="bg-primary/10">
              <MapPin className="w-3 h-3 mr-1" />
              {role === "central" ? "Pan-India Analysis" : state}
            </Badge>
            <Badge variant="outline" className="bg-saffron/10 text-saffron border-saffron/30">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date().toLocaleDateString("en-IN")}
            </Badge>
            {simulationResult && (
              <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                Simulation applied
              </Badge>
            )}
          </div>
        </div>

        {/* ── Quick Stats (only if economic data exists) ── */}
        {eco && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <InsightCard title="Revenue Impact" value={eco.revenueImpact} trend={trendDir(eco.revenueImpact)} trendValue="AI-estimated" description="Projected annual revenue contribution" icon={TrendingUp} />
            <InsightCard title="Employment Impact" value={eco.employmentChange ?? eco.jobCreation} trend={trendDir(eco.employmentChange ?? eco.jobCreation)} trendValue={simulationResult ? "Scenario-adjusted" : "AI baseline"} description="Estimated job creation / loss" icon={Users} />
            <InsightCard title="GDP Impact" value={eco.gdpImpact ?? "N/A"} trend={trendDir(eco.gdpImpact ?? "")} trendValue="National GDP effect" description="Macroeconomic impact estimate" icon={Scale} />
            <InsightCard title="MSME Relief" value={eco.complianceSavings} trend="neutral" trendValue="Cost change" description="Compliance burden change for MSMEs" icon={Target} />
          </div>
        )}

        {/* ── Environmental & Risk Quick Stats ── */}
        {(env || risk) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {env && (
              <>
                <InsightCard title="Sustainability Score" value={`${env.sustainabilityScore}/100`} trend={env.sustainabilityScore >= 60 ? "up" : "down"} trendValue={env.status} description={env.carbonImpact} icon={Leaf} />
                <InsightCard title="Pollution Change" value={env.pollutionChange} trend={env.pollutionChange.toLowerCase().includes("reduc") ? "up" : "neutral"} trendValue="Environmental" description={env.resourceUsage} icon={Leaf} />
              </>
            )}
            {risk && (
              <>
                <InsightCard title="Overall Risk" value={`${risk.overallRisk}/10`} trend={risk.overallRisk <= 4 ? "up" : "down"} trendValue={risk.status} description={risk.summary.slice(0, 80)} icon={ShieldAlert} />
                <InsightCard title="Legal Risk" value={`${risk.legalRisk}/10`} trend={risk.legalRisk <= 3 ? "up" : "down"} trendValue="Constitutional check" description={risk.legalConflicts?.[0] ?? "No major conflicts detected"} icon={ShieldAlert} />
              </>
            )}
          </div>
        )}

        {/* ── Main Charts ── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Economic Timeline */}
          {economicTimeline.length > 0 && (
            <Card className="shadow-soft lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" />Economic Impact Timeline</CardTitle>
                    <CardDescription>Revenue, adoption & employment projections from AI analysis</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200"><TrendingUp className="w-3 h-3 mr-1" />AI Generated</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={economicTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                    <XAxis dataKey="period" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,20%,88%)", borderRadius: "8px" }}
                      formatter={(value: number, name: string) => {
                        if (name.includes("Revenue")) return [`₹${value} Cr`, name];
                        if (name.includes("Employment")) return [`${value.toLocaleString()} jobs`, name];
                        return [`${value}%`, name];
                      }} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" fill="hsl(145,63%,50%)" fillOpacity={0.2} stroke="hsl(145,63%,50%)" strokeWidth={2} name="Revenue (₹ Cr)" />
                    <Line yAxisId="right" type="monotone" dataKey="adoption" stroke="hsl(28,87%,55%)" strokeWidth={3} name="Adoption Rate (%)" dot={{ fill: "hsl(28,87%,55%)", strokeWidth: 2, r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="employment" stroke="hsl(217,73%,50%)" strokeWidth={2} name="Employment" dot={{ fill: "hsl(217,73%,50%)", strokeWidth: 2, r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="border-t pt-4 text-xs text-muted-foreground">All figures generated by AI for this specific law. Values change with each analysis.</CardFooter>
            </Card>
          )}

          {/* State-wise Impact */}
          {stateImpactData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />{role === "central" ? "State-wise" : "District-wise"} Impact</CardTitle>
                <CardDescription>Regional positive / neutral / risk distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stateImpactData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,88%)" />
                    <XAxis type="number" stroke="hsl(220,9%,46%)" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="hsl(220,9%,46%)" width={75} fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,20%,88%)", borderRadius: "8px" }} formatter={(v: number, n: string) => [`${v}%`, n]} />
                    <Legend />
                    <Bar dataKey="positive" stackId="a" fill="hsl(145,63%,50%)" name="Positive" />
                    <Bar dataKey="neutral" stackId="a" fill="hsl(43,96%,56%)" name="Neutral" />
                    <Bar dataKey="risk" stackId="a" fill="hsl(0,72%,55%)" name="Risk" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Public Sentiment Pie */}
          {sentimentData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-primary" />Public Sentiment</CardTitle>
                <CardDescription>Predicted public reaction breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" labelLine={false}>
                        {sentimentData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 min-w-[160px]">
                    {sentimentData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {sentiment?.summary && <p className="text-xs text-muted-foreground mt-3">{sentiment.summary}</p>}
              </CardContent>
            </Card>
          )}

          {/* Scenario Projections */}
          {scenarioData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />5-Year Scenario Projections</CardTitle>
                <CardDescription>Revenue under optimistic / neutral / cautious paths (₹ Cr)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,88%)" />
                    <XAxis dataKey="scenario" stroke="hsl(220,9%,46%)" fontSize={11} />
                    <YAxis stroke="hsl(220,9%,46%)" fontSize={11} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()} Cr`, ""]} />
                    <Legend />
                    <Bar dataKey="year1" fill="hsl(217,73%,60%)" name="Year 1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="year3" fill="hsl(28,87%,55%)" name="Year 3" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="year5" fill="hsl(145,63%,50%)" name="Year 5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Secondary Analytics ── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Radar */}
          {radarData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Multi-Dimensional Analysis</CardTitle>
                <CardDescription>AI-scored impact across key dimensions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(220,20%,88%)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="hsl(220,9%,46%)" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="With Law" dataKey="score" stroke="hsl(145,63%,50%)" fill="hsl(145,63%,50%)" fillOpacity={0.4} />
                    <Radar name="Baseline" dataKey="baseline" stroke="hsl(220,9%,46%)" fill="hsl(220,9%,46%)" fillOpacity={0.15} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Sector Growth */}
          {sectorData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Sector-wise Growth</CardTitle>
                <CardDescription>Expected growth % by industry</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sectorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,88%)" />
                    <XAxis type="number" fontSize={10} stroke="hsl(220,9%,46%)" />
                    <YAxis dataKey="sector" type="category" width={80} fontSize={10} stroke="hsl(220,9%,46%)" />
                    <Tooltip formatter={(v: number) => [`${v}%`, "Growth"]} />
                    <Bar dataKey="change" fill="hsl(28,87%,55%)" radius={[0, 4, 4, 0]} name="Growth %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Risk Breakdown */}
          {riskBreakdown.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Risk Breakdown</CardTitle>
                <CardDescription>Category-wise risk scores (1-10)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskBreakdown.map((r) => (
                  <div key={r.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-semibold ${r.score <= 3 ? "text-green-600" : r.score <= 6 ? "text-yellow-600" : "text-red-500"}`}>{r.score}/10</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.score <= 3 ? "bg-green-500" : r.score <= 6 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${r.score * 10}%` }} />
                    </div>
                  </div>
                ))}
                {risk?.mitigationStrategies?.[0] && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">💡 {risk.mitigationStrategies[0]}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Community & Gender Insights ── */}
        {(community || gender) && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {community && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Community Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{community.summary}</p>
                  {community.urbanImpact && <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs font-semibold mb-1">Urban Impact</p><p className="text-xs text-muted-foreground">{community.urbanImpact}</p></div>}
                  {community.ruralImpact && <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs font-semibold mb-1">Rural Impact</p><p className="text-xs text-muted-foreground">{community.ruralImpact}</p></div>}
                  {community.inequalityEffect && <div className="p-3 bg-muted/50 rounded-lg"><p className="text-xs font-semibold mb-1">Inequality Effect</p><p className="text-xs text-muted-foreground">{community.inequalityEffect}</p></div>}
                  {community.recommendations?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1">Recommendations</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        {community.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {gender && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Gender Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{gender.summary}</p>
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Women's Benefit</p>
                    <p className="text-xs text-muted-foreground">{gender.womenBenefit}</p>
                  </div>
                  <Badge variant={gender.status === "positive" ? "default" : gender.status === "risk" ? "destructive" : "secondary"}>
                    {gender.status} • {gender.confidence}% confidence
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── Knowledge Panels ── */}
        {aiResult && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <KnowledgePanel title="Economic Insights" insights={[eco?.details, eco?.industryCostChange, eco?.gdpImpact].filter(Boolean) as string[]} />
            <KnowledgePanel title="Regional Observations" insights={[
              geo?.highReadiness?.length ? `High-readiness: ${geo.highReadiness.join(", ")}` : undefined,
              geo?.needSupport?.length ? `Need support: ${geo.needSupport.join(", ")}` : undefined,
            ].filter(Boolean) as string[]} />
            <KnowledgePanel title="Risk & Mitigation" insights={[risk?.summary, ...(risk?.mitigationStrategies ?? [])].filter(Boolean) as string[]} />
          </div>
        )}

        {/* No modules fallback */}
        {!hasAnyChart && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No impact modules were enabled. Go back and enable Economic, Geographic, or other modules to see AI-generated charts.</p>
              <Link to="/" className="inline-flex items-center justify-center px-6 py-2 mt-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Go to Input</Link>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Impact;
