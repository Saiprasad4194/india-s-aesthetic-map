import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";

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

  const economicData = [
    { year: "Year 1", revenue: 2400, compliance: 85, adoption: 45 },
    { year: "Year 2", revenue: 3200, compliance: 78, adoption: 65 },
    { year: "Year 3", revenue: 4100, compliance: 72, adoption: 80 },
  ];

  const stateImpactData = [
    { name: "Gujarat", positive: 92, neutral: 6, risk: 2 },
    { name: "Maharashtra", positive: 88, neutral: 8, risk: 4 },
    { name: "Karnataka", positive: 86, neutral: 10, risk: 4 },
    { name: "Tamil Nadu", positive: 84, neutral: 12, risk: 4 },
    { name: "Rajasthan", positive: 65, neutral: 25, risk: 10 },
    { name: "UP", positive: 55, neutral: 30, risk: 15 },
    { name: "Bihar", positive: 48, neutral: 32, risk: 20 },
  ];

  const genderData = [
    { name: "Women-led Enterprises", value: 32, color: "hsl(145, 63%, 50%)" },
    { name: "Male-led Enterprises", value: 58, color: "hsl(217, 73%, 30%)" },
    { name: "Others", value: 10, color: "hsl(43, 96%, 56%)" },
  ];

  const scenarioData = [
    { scenario: "Optimistic", year1: 3200, year2: 4800, year3: 6500 },
    { scenario: "Neutral", year1: 2400, year2: 3200, year3: 4100 },
    { scenario: "Cautious", year1: 1600, year2: 2000, year3: 2600 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Impact Analysis Graphs</h1>
          <p className="text-muted-foreground">
            Visual representation of economic, social, and regional impact trends
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 stagger-children">
          {/* Economic Impact Over Time */}
          {modules.modEconomic && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Economic Impact Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={economicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                    <XAxis dataKey="year" stroke="hsl(220, 9%, 46%)" />
                    <YAxis stroke="hsl(220, 9%, 46%)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 20%, 88%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(145, 63%, 50%)"
                      strokeWidth={3}
                      name="Revenue (₹ Cr)"
                      dot={{ fill: "hsl(145, 63%, 50%)", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="adoption"
                      stroke="hsl(28, 87%, 55%)"
                      strokeWidth={3}
                      name="Adoption Rate (%)"
                      dot={{ fill: "hsl(28, 87%, 55%)", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* State-wise Impact */}
          {modules.modGeo && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">
                  {role === "central" ? "State-wise" : "District-wise"} Impact Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stateImpactData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                    <XAxis type="number" stroke="hsl(220, 9%, 46%)" />
                    <YAxis dataKey="name" type="category" stroke="hsl(220, 9%, 46%)" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 20%, 88%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="positive" stackId="a" fill="hsl(145, 63%, 50%)" name="Positive" />
                    <Bar dataKey="neutral" stackId="a" fill="hsl(43, 96%, 56%)" name="Neutral" />
                    <Bar dataKey="risk" stackId="a" fill="hsl(0, 72%, 55%)" name="Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Gender Impact */}
          {modules.modGender && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Gender-Specific Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
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
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Future Scenario Projections */}
          {modules.modFuture && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">3-Year Scenario Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                    <XAxis dataKey="scenario" stroke="hsl(220, 9%, 46%)" />
                    <YAxis stroke="hsl(220, 9%, 46%)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 20%, 88%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`₹${value} Cr`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="year1" fill="hsl(217, 73%, 30%)" name="Year 1" />
                    <Bar dataKey="year2" fill="hsl(28, 87%, 55%)" name="Year 2" />
                    <Bar dataKey="year3" fill="hsl(145, 63%, 50%)" name="Year 3" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {!modules.modEconomic && !modules.modGeo && !modules.modGender && !modules.modFuture && (
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No graph-generating modules were selected. Please go back and enable Economic, Geographic,
                Gender, or Future projection modules to see charts.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Impact;
