import { useState } from "react";
import { Loader2, Sparkles, TrendingUp, TrendingDown, Minus, ArrowRight, Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAnalysisData } from "@/lib/analysisStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from "recharts";

const Simulation = () => {
  const analysisData = getAnalysisData();
  const [taxRate, setTaxRate] = useState([10]);
  const [complianceWindow, setComplianceWindow] = useState([18]);
  const [womenIncentive, setWomenIncentive] = useState([3]);
  const [turnoverThreshold, setTurnoverThreshold] = useState([200]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async () => {
    if (!analysisData?.lawText) {
      toast.error("Please run an analysis first from the Input page");
      return;
    }

    setIsSimulating(true);
    try {
      const parameters = {
        taxCreditRate: `${taxRate[0]}%`,
        complianceWindowMonths: complianceWindow[0],
        womenIncentivePercent: `${womenIncentive[0]}%`,
        turnoverThresholdLakhs: turnoverThreshold[0],
      };

      const { data, error } = await supabase.functions.invoke("simulate-policy", {
        body: { lawText: analysisData.lawText, parameters },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      // Persist simulation so Maps module can react to latest scenario
      if (data?.simulation) {
        const enrichedSimulation = {
          ...data.simulation,
          parameters,
          generatedAt: Date.now(),
        };
        setResult(enrichedSimulation);
        try {
          sessionStorage.setItem("policySimulation", JSON.stringify(enrichedSimulation));
        } catch {
          // ignore storage failures
        }
      }

      toast.success("Simulation complete!");
    } catch (err: any) {
      console.error("Simulation error:", err);
      toast.error(err?.message || "Simulation failed");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-accent">
              <Sliders className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Policy Simulation</h1>
              <p className="text-muted-foreground">Tweak policy parameters and see AI-predicted outcomes</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Parameter Controls */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Policy Parameters</CardTitle>
              <CardDescription>Adjust values to simulate different scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>GST Credit Rate</Label>
                  <Badge variant="secondary">{taxRate[0]}%</Badge>
                </div>
                <Slider value={taxRate} onValueChange={setTaxRate} min={5} max={25} step={1} />
                <p className="text-xs text-muted-foreground">Input tax credit for MSEs</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Compliance Window</Label>
                  <Badge variant="secondary">{complianceWindow[0]} months</Badge>
                </div>
                <Slider value={complianceWindow} onValueChange={setComplianceWindow} min={6} max={36} step={3} />
                <p className="text-xs text-muted-foreground">Grace period for digital compliance</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Women Incentive</Label>
                  <Badge variant="secondary">{womenIncentive[0]}%</Badge>
                </div>
                <Slider value={womenIncentive} onValueChange={setWomenIncentive} min={0} max={10} step={1} />
                <p className="text-xs text-muted-foreground">Additional credit for women-led enterprises</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Turnover Threshold</Label>
                  <Badge variant="secondary">₹{turnoverThreshold[0]} L</Badge>
                </div>
                <Slider value={turnoverThreshold} onValueChange={setTurnoverThreshold} min={50} max={500} step={25} />
                <p className="text-xs text-muted-foreground">Max annual turnover for MSE eligibility</p>
              </div>

              <Button onClick={handleSimulate} disabled={isSimulating} className="w-full" size="lg">
                {isSimulating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Simulating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Run Simulation</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {!result && !isSimulating && (
              <Card className="shadow-soft">
                <CardContent className="py-16 text-center">
                  <Sliders className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Adjust Parameters & Simulate</h3>
                  <p className="text-muted-foreground">Modify policy parameters on the left and click "Run Simulation" to see predicted outcomes.</p>
                </CardContent>
              </Card>
            )}

            {isSimulating && (
              <Card className="shadow-soft">
                <CardContent className="py-16 text-center">
                  <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">AI Simulation Running...</h3>
                  <p className="text-muted-foreground">Predicting outcomes with modified parameters</p>
                </CardContent>
              </Card>
            )}

            {result && !isSimulating && (
              <>
                {/* Baseline vs Modified Comparison */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Baseline vs Modified Outcome</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <h4 className="font-semibold text-sm mb-3 text-muted-foreground">Original Policy</h4>
                        {result.baselineOutcome && Object.entries(result.baselineOutcome).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-sm font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="font-semibold text-sm mb-3 text-primary">Modified Policy</h4>
                        {result.modifiedOutcome && Object.entries(result.modifiedOutcome).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-sm font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tradeoffs */}
                {result.comparison && (
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg">Analysis & Tradeoffs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.comparison.betterAreas?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-success flex items-center gap-1 mb-2">
                            <TrendingUp className="w-4 h-4" /> Improvements
                          </h4>
                          <ul className="space-y-1">{result.comparison.betterAreas.map((a: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 mt-1 text-success shrink-0" /> {a}
                            </li>
                          ))}</ul>
                        </div>
                      )}
                      {result.comparison.worseAreas?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-destructive flex items-center gap-1 mb-2">
                            <TrendingDown className="w-4 h-4" /> Potential Downsides
                          </h4>
                          <ul className="space-y-1">{result.comparison.worseAreas.map((a: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 mt-1 text-destructive shrink-0" /> {a}
                            </li>
                          ))}</ul>
                        </div>
                      )}
                      {result.comparison.tradeoffs?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-warning flex items-center gap-1 mb-2">
                            <Minus className="w-4 h-4" /> Key Tradeoffs
                          </h4>
                          <ul className="space-y-1">{result.comparison.tradeoffs.map((a: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="w-3 h-3 mt-1 text-warning shrink-0" /> {a}
                            </li>
                          ))}</ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Year Projection Chart */}
                {result.yearlyProjection && (
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-lg">3-Year Revenue Projection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={result.yearlyProjection}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" />
                          <XAxis dataKey="year" tickFormatter={(v) => `Year ${v}`} fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="baseline.revenue" fill="hsl(220, 9%, 70%)" name="Baseline Revenue (₹ Cr)" />
                          <Bar dataKey="modified.revenue" fill="hsl(145, 63%, 42%)" name="Modified Revenue (₹ Cr)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* AI Recommendation */}
                {result.recommendation && (
                  <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardContent className="py-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-secondary mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1">AI Recommendation</h4>
                          <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Simulation;
