import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, TrendingUp, AlertTriangle, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAnalysisData, type AnalysisData } from "@/lib/analysisStore";
import indiaMap from "@/assets/india-states-map.png";

// Impact data for each state
const stateImpactData: Record<string, {
  name: string;
  impact: "positive" | "neutral" | "risk";
  positivePercent: number;
  neutralPercent: number;
  riskPercent: number;
  keyInsight: string;
}> = {
  "Jammu & Kashmir": { name: "Jammu & Kashmir", impact: "neutral", positivePercent: 35, neutralPercent: 45, riskPercent: 20, keyInsight: "Geographic challenges require extended compliance" },
  "Ladakh": { name: "Ladakh", impact: "neutral", positivePercent: 30, neutralPercent: 50, riskPercent: 20, keyInsight: "Limited infrastructure needs special provisions" },
  "Himachal Pradesh": { name: "Himachal Pradesh", impact: "positive", positivePercent: 65, neutralPercent: 25, riskPercent: 10, keyInsight: "Strong tourism sector benefits" },
  "Punjab": { name: "Punjab", impact: "positive", positivePercent: 70, neutralPercent: 20, riskPercent: 10, keyInsight: "Agricultural reforms boost growth" },
  "Uttarakhand": { name: "Uttarakhand", impact: "positive", positivePercent: 60, neutralPercent: 30, riskPercent: 10, keyInsight: "Eco-tourism and pharma sectors gain" },
  "Haryana": { name: "Haryana", impact: "positive", positivePercent: 72, neutralPercent: 18, riskPercent: 10, keyInsight: "Industrial corridor expansion accelerates" },
  "Delhi": { name: "Delhi", impact: "positive", positivePercent: 78, neutralPercent: 15, riskPercent: 7, keyInsight: "Service sector leads adoption" },
  "Rajasthan": { name: "Rajasthan", impact: "neutral", positivePercent: 45, neutralPercent: 35, riskPercent: 20, keyInsight: "Mining and tourism see mixed effects" },
  "Uttar Pradesh": { name: "Uttar Pradesh", impact: "risk", positivePercent: 30, neutralPercent: 35, riskPercent: 35, keyInsight: "Large informal sector needs support" },
  "Bihar": { name: "Bihar", impact: "risk", positivePercent: 25, neutralPercent: 35, riskPercent: 40, keyInsight: "Infrastructure gaps pose challenges" },
  "Sikkim": { name: "Sikkim", impact: "positive", positivePercent: 68, neutralPercent: 22, riskPercent: 10, keyInsight: "Organic farming policies align well" },
  "Arunachal Pradesh": { name: "Arunachal Pradesh", impact: "neutral", positivePercent: 40, neutralPercent: 40, riskPercent: 20, keyInsight: "Border development initiatives benefit" },
  "Nagaland": { name: "Nagaland", impact: "neutral", positivePercent: 38, neutralPercent: 42, riskPercent: 20, keyInsight: "Special provisions maintained" },
  "Manipur": { name: "Manipur", impact: "neutral", positivePercent: 35, neutralPercent: 45, riskPercent: 20, keyInsight: "Handloom sector sees opportunities" },
  "Mizoram": { name: "Mizoram", impact: "positive", positivePercent: 55, neutralPercent: 35, riskPercent: 10, keyInsight: "Bamboo industry expansion benefits" },
  "Tripura": { name: "Tripura", impact: "neutral", positivePercent: 42, neutralPercent: 40, riskPercent: 18, keyInsight: "Rubber and tea sectors stable" },
  "Meghalaya": { name: "Meghalaya", impact: "positive", positivePercent: 58, neutralPercent: 30, riskPercent: 12, keyInsight: "Mining reforms create opportunities" },
  "Assam": { name: "Assam", impact: "neutral", positivePercent: 45, neutralPercent: 35, riskPercent: 20, keyInsight: "Tea industry modernization ongoing" },
  "West Bengal": { name: "West Bengal", impact: "neutral", positivePercent: 48, neutralPercent: 32, riskPercent: 20, keyInsight: "Jute and IT sectors see mixed impact" },
  "Jharkhand": { name: "Jharkhand", impact: "risk", positivePercent: 32, neutralPercent: 33, riskPercent: 35, keyInsight: "Mining sector transition challenges" },
  "Odisha": { name: "Odisha", impact: "positive", positivePercent: 62, neutralPercent: 25, riskPercent: 13, keyInsight: "Steel and mining growth continues" },
  "Chhattisgarh": { name: "Chhattisgarh", impact: "neutral", positivePercent: 45, neutralPercent: 35, riskPercent: 20, keyInsight: "Industrial diversification needed" },
  "Madhya Pradesh": { name: "Madhya Pradesh", impact: "neutral", positivePercent: 50, neutralPercent: 30, riskPercent: 20, keyInsight: "Agricultural reforms show promise" },
  "Gujarat": { name: "Gujarat", impact: "positive", positivePercent: 82, neutralPercent: 12, riskPercent: 6, keyInsight: "Manufacturing hub leads compliance" },
  "Maharashtra": { name: "Maharashtra", impact: "positive", positivePercent: 85, neutralPercent: 10, riskPercent: 5, keyInsight: "Financial services drive adoption" },
  "Goa": { name: "Goa", impact: "positive", positivePercent: 75, neutralPercent: 18, riskPercent: 7, keyInsight: "Tourism and IT sectors thrive" },
  "Karnataka": { name: "Karnataka", impact: "positive", positivePercent: 88, neutralPercent: 8, riskPercent: 4, keyInsight: "Tech industry accelerates compliance" },
  "Kerala": { name: "Kerala", impact: "positive", positivePercent: 76, neutralPercent: 17, riskPercent: 7, keyInsight: "Healthcare and tourism see gains" },
  "Tamil Nadu": { name: "Tamil Nadu", impact: "positive", positivePercent: 80, neutralPercent: 14, riskPercent: 6, keyInsight: "Auto and textile sectors benefit" },
  "Andhra Pradesh": { name: "Andhra Pradesh", impact: "positive", positivePercent: 70, neutralPercent: 20, riskPercent: 10, keyInsight: "Pharma and IT growth accelerates" },
  "Telangana": { name: "Telangana", impact: "positive", positivePercent: 83, neutralPercent: 12, riskPercent: 5, keyInsight: "Hyderabad IT hub leads digital adoption" },
  "Andaman & Nicobar": { name: "Andaman & Nicobar", impact: "neutral", positivePercent: 45, neutralPercent: 40, riskPercent: 15, keyInsight: "Island development initiatives ongoing" },
  "Lakshadweep": { name: "Lakshadweep", impact: "neutral", positivePercent: 40, neutralPercent: 45, riskPercent: 15, keyInsight: "Tourism potential being developed" },
  "Dadra & Nagar Haveli": { name: "Dadra & Nagar Haveli", impact: "positive", positivePercent: 68, neutralPercent: 22, riskPercent: 10, keyInsight: "Industrial zone shows growth" },
  "Daman & Diu": { name: "Daman & Diu", impact: "positive", positivePercent: 65, neutralPercent: 25, riskPercent: 10, keyInsight: "Manufacturing sector benefits" },
  "Puducherry": { name: "Puducherry", impact: "positive", positivePercent: 65, neutralPercent: 25, riskPercent: 10, keyInsight: "Tourism and education sectors stable" },
  "Chandigarh": { name: "Chandigarh", impact: "positive", positivePercent: 75, neutralPercent: 18, riskPercent: 7, keyInsight: "Well-planned city with strong governance" },
};

// State positions on map (percentage-based for responsiveness)
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

// List of Union Territories
const unionTerritories = [
  "Jammu & Kashmir", "Ladakh", "Delhi", "Chandigarh", "Puducherry", 
  "Andaman & Nicobar", "Lakshadweep", "Dadra & Nagar Haveli", "Daman & Diu"
];

// List of States (excluding UTs)
const states = Object.keys(stateImpactData).filter(key => !unionTerritories.includes(key));

const Maps = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    setData(getAnalysisData());
  }, []);

  // Show map even without running analysis (for demo purposes)
  const shouldShowMap = !data || data.modules.modGeo;

  // Calculate summary stats
  const positiveStates = Object.values(stateImpactData).filter(s => s.impact === "positive").length;
  const neutralStates = Object.values(stateImpactData).filter(s => s.impact === "neutral").length;
  const riskStates = Object.values(stateImpactData).filter(s => s.impact === "risk").length;

  const selectedImpact = selectedState ? stateImpactData[selectedState] : null;

  const getImpactColor = (impact: "positive" | "neutral" | "risk") => {
    switch (impact) {
      case "positive": return "bg-emerald-500";
      case "neutral": return "bg-amber-500";
      case "risk": return "bg-red-500";
    }
  };

  if (!shouldShowMap) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Geographic Module Not Selected</h2>
              <p className="text-muted-foreground mb-4">
                Please enable the "State / District-wise impact" module in the Input page to view maps.
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Impact Analysis Map</h1>
          <p className="text-muted-foreground">
            State-wise law impact visualization with color-coded analysis
          </p>
        </div>

        {/* Impact Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
            <CardContent className="py-4 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{positiveStates}</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-500">Positive Impact States</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <CardContent className="py-4 text-center">
              <Minus className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{neutralStates}</div>
              <div className="text-sm text-amber-600 dark:text-amber-500">Neutral Impact States</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800">
            <CardContent className="py-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{riskStates}</div>
              <div className="text-sm text-red-600 dark:text-red-500">Risk Area States</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map with Impact Circles */}
          <Card className="lg:col-span-2 shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                India - Impact Analysis Map
              </CardTitle>
              <CardDescription>
                Click on circles or select from the list to view detailed impact analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative inline-block">
                <img 
                  src={indiaMap} 
                  alt="India Political Map - States and Union Territories" 
                  className="max-w-full h-auto rounded-lg border border-border"
                  style={{ maxHeight: "600px" }}
                />
                {/* Impact circles overlay */}
                {Object.entries(stateImpactData).map(([key, state]) => {
                  const position = statePositions[key];
                  if (!position) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedState(key)}
                      className={`absolute z-10 w-4 h-4 rounded-full ${getImpactColor(state.impact)} 
                        border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-150 
                        ${selectedState === key ? "ring-2 ring-primary ring-offset-1 scale-150" : ""}`}
                      style={{ 
                        top: position.top, 
                        left: position.left,
                        transform: "translate(-50%, -50%)"
                      }}
                      title={state.name}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* State Details Panel */}
          <div className="space-y-4 animate-slide-up">
            {/* Impact Legend */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Impact Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-500"></div>
                  <span className="text-sm">Positive Impact (High Readiness)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-amber-500"></div>
                  <span className="text-sm">Neutral Impact (Moderate Readiness)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-red-500"></div>
                  <span className="text-sm">Risk Areas (Need Support)</span>
                </div>
              </CardContent>
            </Card>

            {/* State Selector */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Select State</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                <div className="space-y-1">
                  {states.map((key) => {
                    const state = stateImpactData[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedState(key)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                          selectedState === key 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          state.impact === "positive" ? "bg-emerald-500" :
                          state.impact === "neutral" ? "bg-amber-500" : "bg-red-500"
                        }`}></div>
                        {state.name}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Union Territory Selector */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Select Union Territory</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                <div className="space-y-1">
                  {unionTerritories.map((key) => {
                    const ut = stateImpactData[key];
                    if (!ut) return null;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedState(key)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                          selectedState === key 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          ut.impact === "positive" ? "bg-emerald-500" :
                          ut.impact === "neutral" ? "bg-amber-500" : "bg-red-500"
                        }`}></div>
                        {ut.name}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected State Details */}
            {selectedImpact ? (
              <Card className="shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${
                      selectedImpact.impact === "positive" ? "bg-emerald-500" :
                      selectedImpact.impact === "neutral" ? "bg-amber-500" : "bg-red-500"
                    }`}></div>
                    {selectedImpact.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Impact Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-emerald-600 font-medium">Positive Impact</span>
                        <span className="font-semibold">{selectedImpact.positivePercent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedImpact.positivePercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-amber-600 font-medium">Neutral</span>
                        <span className="font-semibold">{selectedImpact.neutralPercent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedImpact.neutralPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-red-600 font-medium">Risk Areas</span>
                        <span className="font-semibold">{selectedImpact.riskPercent}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedImpact.riskPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Key Insight */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-1">KEY INSIGHT</h4>
                    <p className="text-sm">{selectedImpact.keyInsight}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-8 text-center">
                  <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a state from the list above to view detailed impact analysis
                  </p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

        {/* Analysis Summary - Full Width Below Map */}
        <Card className="shadow-soft animate-fade-in mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Comprehensive Analysis Summary
            </CardTitle>
            <CardDescription>
              Overview of law impact across all states and union territories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Regions Analyzed</div>
                <div className="text-3xl font-bold text-foreground">{Object.keys(stateImpactData).length}</div>
                <div className="text-xs text-muted-foreground">States & Union Territories</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Average Positive Impact</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {Math.round(Object.values(stateImpactData).reduce((acc, s) => acc + s.positivePercent, 0) / Object.keys(stateImpactData).length)}%
                </div>
                <div className="text-xs text-muted-foreground">Across all regions</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Average Risk Level</div>
                <div className="text-3xl font-bold text-red-600">
                  {Math.round(Object.values(stateImpactData).reduce((acc, s) => acc + s.riskPercent, 0) / Object.keys(stateImpactData).length)}%
                </div>
                <div className="text-xs text-muted-foreground">Requiring attention</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">High Risk Regions</div>
                <div className="text-3xl font-bold text-amber-600">{riskStates}</div>
                <div className="text-xs text-muted-foreground">States needing support</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">Positive Impact</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">{positiveStates} regions</div>
                <p className="text-xs text-emerald-600/80 mt-1">High readiness for implementation with strong economic and social benefits expected</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="font-medium text-amber-700 dark:text-amber-400">Neutral Impact</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">{neutralStates} regions</div>
                <p className="text-xs text-amber-600/80 mt-1">Moderate readiness with balanced outcomes requiring monitoring</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium text-red-700 dark:text-red-400">Risk Areas</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{riskStates} regions</div>
                <p className="text-xs text-red-600/80 mt-1">Need targeted support programs and extended compliance timelines</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Key Observations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  Southern and Western states show highest adoption readiness due to existing digital infrastructure
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  North-Eastern states require special provisions for geographic and infrastructure challenges
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  States with large informal sectors (UP, Bihar, Jharkhand) need phased implementation approach
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-1">•</span>
                  Union Territories show varied readiness based on their administrative structure and economic focus
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Maps;
