import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IndiaMap from "@/components/IndiaMap";
import { getAnalysisData, type AnalysisData } from "@/lib/analysisStore";

const Maps = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    setData(getAnalysisData());
  }, []);

  // Show map even without running analysis (for demo purposes)
  // Only hide map if user explicitly ran analysis WITHOUT the geo module
  const shouldShowMap = !data || data.modules.modGeo;

  const handleStateClick = (stateId: string) => {
    setSelectedState(selectedState === stateId ? null : stateId);
  };

  const stateDetails: Record<string, { name: string; districts: string[]; readiness: string; recommendation: string }> = {
    JK: {
      name: "Jammu & Kashmir",
      districts: ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
      readiness: "Medium",
      recommendation: "Extended compliance window recommended due to geographic challenges",
    },
    GJ: {
      name: "Gujarat",
      districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
      readiness: "High",
      recommendation: "Strong MSE ecosystem - early adoption likely",
    },
    MH: {
      name: "Maharashtra",
      districts: ["Mumbai", "Pune", "Nagpur", "Nashik"],
      readiness: "High",
      recommendation: "Existing GST compliance culture favorable for adoption",
    },
    KA: {
      name: "Karnataka",
      districts: ["Bengaluru", "Mysuru", "Hubli", "Mangalore"],
      readiness: "High",
      recommendation: "Tech industry presence accelerates digital compliance",
    },
    UP: {
      name: "Uttar Pradesh",
      districts: ["Lucknow", "Kanpur", "Varanasi", "Agra"],
      readiness: "Medium-Low",
      recommendation: "Consider vernacular support and additional handholding",
    },
    BR: {
      name: "Bihar",
      districts: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
      readiness: "Low",
      recommendation: "Full 18-month compliance window essential",
    },
  };

  const selectedDetails = selectedState ? stateDetails[selectedState] : null;

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
          <h1 className="text-2xl font-bold text-foreground">Impact Maps</h1>
          <p className="text-muted-foreground">
            Interactive maps showing state-wise and district-wise impact analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="lg:col-span-2 shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                State-wise Impact Map
              </CardTitle>
              <CardDescription>
                Click on any state to view detailed impact analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IndiaMap
                onStateClick={handleStateClick}
                selectedState={selectedState}
              />
            </CardContent>
          </Card>

          {/* State Details Panel */}
          <div className="space-y-4 animate-slide-up">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">State Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDetails ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {selectedDetails.name}
                      </h3>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Key Districts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDetails.districts.map((district) => (
                          <span
                            key={district}
                            className="px-2 py-1 bg-muted rounded text-xs"
                          >
                            {district}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Digital Readiness
                      </h4>
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${selectedDetails.readiness === "High" 
                          ? "bg-success/20 text-success" 
                          : selectedDetails.readiness === "Medium" || selectedDetails.readiness === "Medium-Low"
                          ? "bg-warning/20 text-warning"
                          : "bg-destructive/20 text-destructive"
                        }
                      `}>
                        {selectedDetails.readiness}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        AI Recommendation
                      </h4>
                      <p className="text-sm text-foreground">
                        {selectedDetails.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Click on a state in the map to view details
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Impact Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High Readiness</span>
                  <span className="font-semibold text-success">12 states</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Medium Readiness</span>
                  <span className="font-semibold text-warning">11 states</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Need Support</span>
                  <span className="font-semibold text-destructive">8 states</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Maps;
