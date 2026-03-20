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
  Scale
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAnalysisData, getAIResult, type AnalysisData, type AIAnalysisResult } from "@/lib/analysisStore";
import {
  LineChart,
  Line,
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
  Scatter,
  ReferenceLine,
} from "recharts";

// Insight Card Component
const InsightCard = ({ 
  title, 
  value, 
  trend, 
  trendValue, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  value: string; 
  trend: "up" | "down" | "neutral"; 
  trendValue: string; 
  description: string;
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

// Knowledge Panel Component
const KnowledgePanel = ({ 
  title, 
  insights 
}: { 
  title: string; 
  insights: string[] 
}) => (
  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-saffron" />
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-saffron mt-2 flex-shrink-0" />
            {insight}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const Impact = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    setData(getAnalysisData());
    setAiResult(getAIResult());
  }, []);

  // Read latest simulation result so impact can react to parameter changes
  const simulationResult = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("policySimulation");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const economicModule = aiResult?.modEconomic;
  const geoModule = aiResult?.modGeo;
  const genderModule = aiResult?.modGender;
  const futureModule = aiResult?.modFuture;
  const envModule = aiResult?.modEnvironmental;
  const communityModule = aiResult?.modCommunity;
  const riskModule = aiResult?.modRiskScore;

  // Safe destructuring for role/state/modules before using them in derived flags
  const { role, state, modules } = data || {
    role: "central",
    state: "",
    modules: {} as AnalysisData["modules"],
  };

  // Top-level headline numbers (fallbacks if AI didn't provide specific formats)
  const headlineRevenue = economicModule?.revenueImpact ?? "N/A";
  const headlineJobs = economicModule?.employmentChange ?? economicModule?.jobCreation ?? "N/A";
  const headlineGdp = economicModule?.gdpImpact ?? "N/A";
  const headlineCompliance = economicModule?.complianceSavings ?? "N/A";

  // Dynamic economic timeline from AI (optionally adjusted by simulation)
  const economicData = useMemo(() => {
    if (!economicModule?.timelineProjection) return [];
    const factor =
      simulationResult?.modifiedOutcome?.revenueChange &&
      typeof simulationResult.modifiedOutcome.revenueChange === "string"
        ? 1 +
          (parseFloat(
            simulationResult.modifiedOutcome.revenueChange.replace(/[^0-9.-]/g, "")
          ) || 0) /
            100
        : 1;

    return economicModule.timelineProjection.map((p) => ({
      year: p.period,
      revenue: Math.round(p.revenue * factor),
      compliance: p.adoption, // treat adoption as compliance proxy if separate value absent
      adoption: p.adoption,
      employment: p.employment,
    }));
  }, [economicModule, simulationResult]);

  // State-wise impact distribution from geo module
  const stateImpactData = useMemo(() => {
    if (!geoModule?.stateImpacts) return [];
    return Object.entries(geoModule.stateImpacts).map(([name, v]) => ({
      name,
      positive: v.positivePercent,
      neutral: v.neutralPercent,
      risk: v.riskPercent,
    }));
  }, [geoModule]);

  // Gender impact from gender module (simplified since AI doesn't give exact shares)
  const genderData = useMemo(() => {
    if (!genderModule) return [];
    const base = [
      { name: "Women-led Enterprises", value: 0, color: "hsl(145, 63%, 50%)", growth: "+0%" },
      { name: "Other Enterprises", value: 100, color: "hsl(217, 73%, 30%)", growth: "+0%" },
    ];
    // If womenBenefit mentions uplift, approximate a 30–40% relative uplift
    const womenBoost = genderModule.womenBenefit?.toLowerCase().includes("significant") ? 40 : 25;
    base[0].value = womenBoost;
    base[0].growth = `+${womenBoost}%`;
    base[1].value = 100 - womenBoost;
    return base;
  }, [genderModule]);

  // Scenario projections from future module
  const scenarioData = useMemo(() => {
    if (!futureModule) return [];
    const parseValue = (v: string | undefined) =>
      v ? parseFloat(v.replace(/[^0-9.-]/g, "")) || 0 : 0;
    return [
      {
        scenario: "Optimistic",
        year1: parseValue(futureModule.optimistic.revenue),
        year3: parseValue(futureModule.optimistic.revenue) * 1.5,
        year5: parseValue(futureModule.optimistic.revenue) * 2,
      },
      {
        scenario: "Neutral",
        year1: parseValue(futureModule.neutral.revenue),
        year3: parseValue(futureModule.neutral.revenue) * 1.3,
        year5: parseValue(futureModule.neutral.revenue) * 1.7,
      },
      {
        scenario: "Cautious",
        year1: parseValue(futureModule.cautious.revenue),
        year3: parseValue(futureModule.cautious.revenue) * 1.2,
        year5: parseValue(futureModule.cautious.revenue) * 1.4,
      },
    ];
  }, [futureModule]);

  // Radar chart: combine economic, employment, compliance, sustainability, social equity
  const radarData = useMemo(() => {
    if (!economicModule && !envModule && !communityModule) return [];
    const parsePercent = (txt?: string) =>
      txt ? Math.max(0, Math.min(100, parseFloat(txt.replace(/[^0-9.-]/g, "")) || 0)) : 0;

    const economicGrowth = parsePercent(economicModule?.gdpImpact);
    const employment = parsePercent(economicModule?.employmentChange);
    const compliance = parsePercent(economicModule?.complianceSavings);
    const sustainability = envModule?.sustainabilityScore ?? 0;
    const socialEquity =
      communityModule?.inequalityEffect?.toLowerCase().includes("reduce") ? 70 : 50;

    return [
      { subject: "Economic Growth", A: economicGrowth, B: 50, fullMark: 100 },
      { subject: "Employment", A: employment, B: 50, fullMark: 100 },
      { subject: "Compliance", A: compliance, B: 50, fullMark: 100 },
      { subject: "Sustainability", A: sustainability, B: 50, fullMark: 100 },
      { subject: "Social Equity", A: socialEquity, B: 50, fullMark: 100 },
    ];
  }, [economicModule, envModule, communityModule]);

  // Sector-wise growth derived from AI sectorImpacts
  const sectorData = useMemo(() => {
    if (!economicModule?.sectorImpacts) return [];
    return economicModule.sectorImpacts.map((s) => ({
      sector: s.sector,
      change: parseFloat(s.change.replace(/[^0-9.-]/g, "")) || 0,
    }));
  }, [economicModule]);

  // Simple monthly timeline from economic timelineProjection
  const timelineData = useMemo(() => {
    if (!economicModule?.timelineProjection) return [];
    return economicModule.timelineProjection.map((p, idx) => ({
      month: p.period || `T${idx + 1}`,
      direct: p.revenue,
      indirect: p.employment,
      total: p.revenue + p.employment,
    }));
  }, [economicModule]);

  // Compliance metrics approximated from economic + risk modules
  const complianceData = useMemo(() => {
    const base = parseFloat(
      (economicModule?.complianceSavings || "").replace(/[^0-9.-]/g, "")
    );
    const overallRisk = riskModule?.overallRisk ?? 5;
    const achievedBase = isNaN(base) ? 70 : Math.min(100, Math.max(40, base));
    return [
      { category: "Document Filing", achieved: achievedBase, target: 90 },
      { category: "Tax Registration", achieved: achievedBase - overallRisk, target: 88 },
      { category: "Labor Laws", achieved: achievedBase - overallRisk * 1.2, target: 85 },
      { category: "Environmental", achieved: envModule ? envModule.sustainabilityScore : 60, target: 80 },
      { category: "Digital Integration", achieved: achievedBase + 5, target: 92 },
    ].map((item) => ({
      ...item,
      achieved: Math.max(30, Math.min(100, Math.round(item.achieved))),
    }));
  }, [economicModule, envModule, riskModule]);

  const hasDynamicEconomic = modules.modEconomic && economicModule;
  const hasDynamicGeo = modules.modGeo && geoModule?.stateImpacts;
  const hasDynamicGender = modules.modGender && genderModule;
  const hasDynamicFuture = modules.modFuture && futureModule;

  if (!data || !aiResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Analysis Data</h2>
              <p className="text-muted-foreground mb-4">
                Please go to the Input page and run an analysis with the Impact modules enabled.
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Impact Analysis Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive visual analytics for law impact assessment
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="bg-primary/10">
              <MapPin className="w-3 h-3 mr-1" />
              {role === "central" ? "Pan-India Analysis" : state}
            </Badge>
            <Badge variant="outline" className="bg-saffron/10 text-saffron border-saffron/30">
              <Calendar className="w-3 h-3 mr-1" />
              Analysis Date: {new Date().toLocaleDateString("en-IN")}
            </Badge>
          </div>
        </div>

        {/* Quick Stats Row */}
        {hasDynamicEconomic && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <InsightCard
              title="Estimated Revenue Impact"
              value={headlineRevenue}
              trend="up"
              trendValue={economicModule?.details ? "AI-estimated" : ""}
              description="Projected annual revenue contribution based on AI analysis"
              icon={TrendingUp}
            />
            <InsightCard
              title="Employment Impact"
              value={headlineJobs}
              trend="up"
              trendValue={simulationResult ? "Scenario-adjusted" : "AI baseline"}
              description="Estimated direct and indirect job creation or loss"
              icon={Users}
            />
            <InsightCard
              title="GDP Impact"
              value={headlineGdp}
              trend={headlineGdp.includes("-") ? "down" : "up"}
              trendValue="National GDP effect"
              description="Macroeconomic impact estimated from the law's economic focus"
              icon={Scale}
            />
            <InsightCard
              title="Compliance & MSME Relief"
              value={headlineCompliance}
              trend="neutral"
              trendValue="Compliance & cost change"
              description="Change in compliance burden and MSME cost structure"
              icon={Target}
            />
          </div>
        )}

        {/* Main Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Economic Impact Over Time */}
          {hasDynamicEconomic && economicData.length > 0 && (
            <Card className="shadow-soft lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Economic Impact Timeline
                    </CardTitle>
                    <CardDescription>
                      Timeline of revenue, compliance, adoption and employment as estimated by AI
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Growing
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={economicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                    <XAxis dataKey="year" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 20%, 88%)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number, name: string) => {
                        if (name.includes("Revenue")) return [`₹${value} Cr`, name];
                        if (name.includes("Employment")) return [`${value.toLocaleString()} jobs`, name];
                        return [`${value}%`, name];
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      fill="hsl(145, 63%, 50%)"
                      fillOpacity={0.2}
                      stroke="hsl(145, 63%, 50%)"
                      strokeWidth={2}
                      name="Revenue (₹ Cr)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="adoption"
                      stroke="hsl(28, 87%, 55%)"
                      strokeWidth={3}
                      name="Adoption Rate (%)"
                      dot={{ fill: "hsl(28, 87%, 55%)", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="compliance"
                      stroke="hsl(217, 73%, 50%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Compliance (%)"
                      dot={{ fill: "hsl(217, 73%, 50%)", strokeWidth: 2, r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
                Figures are derived from the AI economic module and adapt automatically to each analyzed law and simulation scenario.
              </CardFooter>
            </Card>
          )}

          {/* State-wise Impact */}
          {hasDynamicGeo && stateImpactData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {role === "central" ? "State-wise" : "District-wise"} Impact Analysis
                </CardTitle>
                <CardDescription>
                  Regional distribution of positive, neutral, and risk impacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={stateImpactData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                    <XAxis type="number" stroke="hsl(220, 9%, 46%)" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="hsl(220, 9%, 46%)" width={75} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 20%, 88%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                    <Legend />
                    <Bar dataKey="positive" stackId="a" fill="hsl(145, 63%, 50%)" name="Positive Impact" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="neutral" stackId="a" fill="hsl(43, 96%, 56%)" name="Neutral" />
                    <Bar dataKey="risk" stackId="a" fill="hsl(0, 72%, 55%)" name="Risk Areas" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Gender Impact */}
          {hasDynamicGender && genderData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Gender-Specific Impact Distribution
                </CardTitle>
                <CardDescription>
                  Enterprise ownership breakdown and projected growth rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        labelLine={false}
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(220, 20%, 88%)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Share"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 min-w-[180px]">
                    {genderData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.value}%</span>
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            {item.growth}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Future Scenario Projections */}
          {hasDynamicFuture && scenarioData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  5-Year Scenario Projections
                </CardTitle>
                <CardDescription>
                  Revenue projections under different economic scenarios (₹ Crores)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                    <XAxis dataKey="scenario" stroke="hsl(220, 9%, 46%)" fontSize={11} />
                    <YAxis stroke="hsl(220, 9%, 46%)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 20%, 88%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()} Cr`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="year1" fill="hsl(217, 73%, 60%)" name="Year 1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="year3" fill="hsl(28, 87%, 55%)" name="Year 3" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="year5" fill="hsl(145, 63%, 50%)" name="Year 5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Analytics Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Multi-dimensional Impact Radar */}
          {(modules.modEconomic || modules.modGeo) && radarData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Multi-Dimensional Analysis</CardTitle>
                <CardDescription>Comparing current vs projected impact across key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(220, 20%, 88%)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="hsl(220, 9%, 46%)" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="With Law" dataKey="A" stroke="hsl(145, 63%, 50%)" fill="hsl(145, 63%, 50%)" fillOpacity={0.4} />
                    <Radar name="Without Law" dataKey="B" stroke="hsl(220, 9%, 46%)" fill="hsl(220, 9%, 46%)" fillOpacity={0.2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Sector-wise Impact */}
          {hasDynamicEconomic && sectorData.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Sector-wise Growth Projection</CardTitle>
                <CardDescription>Expected growth percentage by industry sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sectorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                    <XAxis type="number" fontSize={10} stroke="hsl(220, 9%, 46%)" />
                    <YAxis dataKey="sector" type="category" width={80} fontSize={10} stroke="hsl(220, 9%, 46%)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 20%, 88%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Growth"]}
                    />
                    <Bar dataKey="change" fill="hsl(28, 87%, 55%)" radius={[0, 4, 4, 0]} name="Growth %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Compliance Tracker */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Compliance Metrics</CardTitle>
              <CardDescription>Target vs achieved compliance rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceData.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="font-medium">{item.achieved}% / {item.target}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={item.achieved} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 w-0.5 bg-red-500" 
                      style={{ left: `${item.target}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Timeline Impact Analysis */}
        {hasDynamicEconomic && timelineData.length > 0 && (
          <Card className="shadow-soft mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Implementation Timeline Impact
              </CardTitle>
              <CardDescription>
                Monthly progression of direct and indirect economic benefits (₹ Crores)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                  <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                  <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 20%, 88%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${value} Cr`, ""]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="direct" 
                    stackId="1" 
                    stroke="hsl(145, 63%, 50%)" 
                    fill="hsl(145, 63%, 50%)" 
                    fillOpacity={0.6}
                    name="Direct Benefits"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="indirect" 
                    stackId="1" 
                    stroke="hsl(28, 87%, 55%)" 
                    fill="hsl(28, 87%, 55%)" 
                    fillOpacity={0.6}
                    name="Indirect Benefits"
                  />
                  <ReferenceLine y={500} stroke="hsl(0, 72%, 55%)" strokeDasharray="5 5" label={{ value: "Target", position: "right", fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Knowledge Insights Section */}
        {aiResult && (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <KnowledgePanel
              title="Economic Insights"
              insights={[
                economicModule?.details || "Run economic analysis to see detailed revenue and cost insights.",
                economicModule?.industryCostChange || "",
                economicModule?.gdpImpact || "",
              ].filter(Boolean)}
            />
            <KnowledgePanel
              title="Regional Observations"
              insights={[
                geoModule?.highReadiness?.length
                  ? `High-readiness regions: ${geoModule.highReadiness.join(", ")}`
                  : "Enable geographic module to see state-wise readiness.",
                geoModule?.needSupport?.length
                  ? `States needing support: ${geoModule.needSupport.join(", ")}`
                  : "",
              ].filter(Boolean)}
            />
            <KnowledgePanel
              title="Risk & Recommendations"
              insights={[
                riskModule?.summary || "Run risk score module to see overall risk commentary.",
                ...(riskModule?.mitigationStrategies || []),
              ]}
            />
          </div>
        )}

        {/* No Modules Selected */}
        {!modules.modEconomic && !modules.modGeo && !modules.modGender && !modules.modFuture && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No graph-generating modules were selected. Please go back and enable Economic, Geographic,
                Gender, or Future projection modules to see charts.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-2 mt-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Go to Input
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Impact;
