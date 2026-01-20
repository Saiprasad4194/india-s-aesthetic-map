import { useEffect, useState } from "react";
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
import { getAnalysisData, type AnalysisData } from "@/lib/analysisStore";
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

  useEffect(() => {
    setData(getAnalysisData());
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

  const { role, state, modules } = data;

  // Enhanced Economic Data
  const economicData = [
    { year: "2024 Q1", revenue: 2400, compliance: 85, adoption: 45, employment: 12000, gdpContribution: 0.8 },
    { year: "2024 Q2", revenue: 2800, compliance: 82, adoption: 52, employment: 15000, gdpContribution: 0.9 },
    { year: "2024 Q3", revenue: 3200, compliance: 78, adoption: 65, employment: 18500, gdpContribution: 1.1 },
    { year: "2024 Q4", revenue: 3600, compliance: 75, adoption: 72, employment: 22000, gdpContribution: 1.2 },
    { year: "2025 Q1", revenue: 4100, compliance: 72, adoption: 80, employment: 26000, gdpContribution: 1.4 },
    { year: "2025 Q2", revenue: 4600, compliance: 70, adoption: 86, employment: 30000, gdpContribution: 1.6 },
  ];

  // Enhanced State Impact Data
  const stateImpactData = [
    { name: "Gujarat", positive: 92, neutral: 6, risk: 2, population: 63.8, gdp: 18.5 },
    { name: "Maharashtra", positive: 88, neutral: 8, risk: 4, population: 123.1, gdp: 28.9 },
    { name: "Karnataka", positive: 86, neutral: 10, risk: 4, population: 67.6, gdp: 16.8 },
    { name: "Tamil Nadu", positive: 84, neutral: 12, risk: 4, population: 77.8, gdp: 19.4 },
    { name: "Telangana", positive: 82, neutral: 12, risk: 6, population: 37.2, gdp: 11.5 },
    { name: "Kerala", positive: 78, neutral: 15, risk: 7, population: 35.3, gdp: 8.9 },
    { name: "Rajasthan", positive: 65, neutral: 25, risk: 10, population: 79.5, gdp: 10.2 },
    { name: "UP", positive: 55, neutral: 30, risk: 15, population: 231.5, gdp: 17.9 },
    { name: "Bihar", positive: 48, neutral: 32, risk: 20, population: 124.8, gdp: 6.1 },
    { name: "West Bengal", positive: 58, neutral: 28, risk: 14, population: 99.6, gdp: 12.5 },
  ];

  // Gender Data with more details
  const genderData = [
    { name: "Women-led Enterprises", value: 32, color: "hsl(145, 63%, 50%)", growth: "+18%" },
    { name: "Male-led Enterprises", value: 58, color: "hsl(217, 73%, 30%)", growth: "+8%" },
    { name: "Joint Ventures", value: 7, color: "hsl(28, 87%, 55%)", growth: "+12%" },
    { name: "Others", value: 3, color: "hsl(43, 96%, 56%)", growth: "+5%" },
  ];

  // Extended Scenario Data
  const scenarioData = [
    { scenario: "Optimistic", year1: 3200, year2: 4800, year3: 6500, year5: 12000 },
    { scenario: "Neutral", year1: 2400, year2: 3200, year3: 4100, year5: 7500 },
    { scenario: "Cautious", year1: 1600, year2: 2000, year3: 2600, year5: 4200 },
    { scenario: "Pessimistic", year1: 1200, year2: 1400, year3: 1600, year5: 2500 },
  ];

  // Radar Chart Data for Multi-dimensional Analysis
  const radarData = [
    { subject: "Economic Growth", A: 85, B: 65, fullMark: 100 },
    { subject: "Employment", A: 78, B: 60, fullMark: 100 },
    { subject: "Compliance", A: 92, B: 75, fullMark: 100 },
    { subject: "Innovation", A: 70, B: 55, fullMark: 100 },
    { subject: "Sustainability", A: 68, B: 50, fullMark: 100 },
    { subject: "Social Equity", A: 75, B: 62, fullMark: 100 },
  ];

  // Sector-wise Distribution
  const sectorData = [
    { sector: "Agriculture", current: 25, projected: 32, change: 28 },
    { sector: "Manufacturing", current: 35, projected: 42, change: 20 },
    { sector: "Services", current: 40, projected: 48, change: 20 },
    { sector: "Technology", current: 15, projected: 28, change: 87 },
    { sector: "Healthcare", current: 20, projected: 26, change: 30 },
    { sector: "Education", current: 18, projected: 24, change: 33 },
  ];

  // Timeline Impact Data
  const timelineData = [
    { month: "Jan", direct: 120, indirect: 80, total: 200 },
    { month: "Feb", direct: 150, indirect: 95, total: 245 },
    { month: "Mar", direct: 180, indirect: 110, total: 290 },
    { month: "Apr", direct: 220, indirect: 130, total: 350 },
    { month: "May", direct: 280, indirect: 160, total: 440 },
    { month: "Jun", direct: 350, indirect: 200, total: 550 },
    { month: "Jul", direct: 400, indirect: 240, total: 640 },
    { month: "Aug", direct: 450, indirect: 280, total: 730 },
  ];

  // Compliance Metrics
  const complianceData = [
    { category: "Document Filing", achieved: 92, target: 95 },
    { category: "Tax Registration", achieved: 88, target: 90 },
    { category: "Labor Laws", achieved: 75, target: 85 },
    { category: "Environmental", achieved: 68, target: 80 },
    { category: "Digital Integration", achieved: 82, target: 90 },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <InsightCard
            title="Estimated Revenue Impact"
            value="₹4,600 Cr"
            trend="up"
            trendValue="+12.3%"
            description="Projected annual revenue contribution by Year 2"
            icon={TrendingUp}
          />
          <InsightCard
            title="Employment Generation"
            value="30,000+"
            trend="up"
            trendValue="+26%"
            description="New direct & indirect jobs expected"
            icon={Users}
          />
          <InsightCard
            title="Compliance Rate"
            value="78%"
            trend="neutral"
            trendValue="Stable"
            description="Average regulatory compliance across sectors"
            icon={Scale}
          />
          <InsightCard
            title="Adoption Rate"
            value="86%"
            trend="up"
            trendValue="+14%"
            description="Business adoption within first 18 months"
            icon={Target}
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Economic Impact Over Time - Enhanced */}
          {modules.modEconomic && (
            <Card className="shadow-soft lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Economic Impact Timeline
                    </CardTitle>
                    <CardDescription>
                      Quarterly projections for revenue, compliance, and adoption rates
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
              <CardFooter className="border-t pt-4">
                <div className="grid grid-cols-3 w-full gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">+91.7%</p>
                    <p className="text-xs text-muted-foreground">Revenue Growth</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-saffron">150%</p>
                    <p className="text-xs text-muted-foreground">Employment Growth</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">41pts</p>
                    <p className="text-xs text-muted-foreground">Adoption Increase</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          )}

          {/* State-wise Impact - Enhanced */}
          {modules.modGeo && (
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

          {/* Gender Impact - Enhanced with Legend Info */}
          {modules.modGender && (
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

          {/* Future Scenario Projections - Enhanced */}
          {modules.modFuture && (
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
          {(modules.modEconomic || modules.modGeo) && (
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
          {modules.modEconomic && (
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
        {modules.modEconomic && (
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
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <KnowledgePanel
            title="Economic Insights"
            insights={[
              "Revenue impact expected to exceed ₹4,600 Cr annually by Year 2",
              "Technology sector shows highest growth potential at 87%",
              "Employment multiplier effect estimated at 2.5x direct jobs",
              "MSME sector likely to benefit most from compliance simplification",
            ]}
          />
          <KnowledgePanel
            title="Regional Observations"
            insights={[
              "Western states (Gujarat, Maharashtra) show highest adoption rates",
              "Eastern states may need additional implementation support",
              "Urban areas likely to see faster initial adoption",
              "Rural impact expected to accelerate in Year 2-3",
            ]}
          />
          <KnowledgePanel
            title="Recommendations"
            insights={[
              "Prioritize digital infrastructure in low-adoption regions",
              "Consider phased rollout for compliance requirements",
              "Establish grievance redressal mechanisms early",
              "Monitor gender-specific outcomes for policy adjustments",
            ]}
          />
        </div>

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
