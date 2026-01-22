import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAnalysisData, type AnalysisData } from "@/lib/analysisStore";
import indiaMap from "@/assets/india-political-map.gif";

const Maps = () => {
  const [data, setData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    setData(getAnalysisData());
  }, []);

  // Show map even without running analysis (for demo purposes)
  const shouldShowMap = !data || data.modules.modGeo;

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
            India Political Map - States and Union Territories
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <Card className="lg:col-span-2 shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                India - States and Union Territories
              </CardTitle>
              <CardDescription>
                Political map showing all states and union territories of India
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <img 
                src={indiaMap} 
                alt="India Political Map - States and Union Territories" 
                className="max-w-full h-auto rounded-lg border border-border"
                style={{ maxHeight: "700px" }}
              />
            </CardContent>
          </Card>

          {/* State Details Panel */}
          <div className="space-y-4 animate-slide-up">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Map Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-blue-600"></div>
                  <span className="text-sm text-muted-foreground">International Boundary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-gray-400"></div>
                  <span className="text-sm text-muted-foreground">State/UT Boundary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-red-500 bg-white"></div>
                  <span className="text-sm text-muted-foreground">Country Capital</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                  <span className="text-sm text-muted-foreground">State/UT Capital</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total States</span>
                  <span className="font-semibold text-foreground">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Union Territories</span>
                  <span className="font-semibold text-foreground">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">National Capital</span>
                  <span className="font-semibold text-foreground">New Delhi</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Neighboring Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Pakistan", "China", "Nepal", "Bhutan", "Bangladesh", "Myanmar", "Sri Lanka"].map((country) => (
                    <span
                      key={country}
                      className="px-2 py-1 bg-muted rounded text-xs"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Water Bodies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Arabian Sea", "Bay of Bengal", "Indian Ocean"].map((water) => (
                    <span
                      key={water}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {water}
                    </span>
                  ))}
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
