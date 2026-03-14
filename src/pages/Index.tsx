import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Play, RotateCcw, Scale, TrendingUp, MapPin, Users, Heart, Globe, History, Telescope, ChevronRight, Sparkles, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { saveAnalysisData, saveAIResult, INDIAN_STATES, DEFAULT_LAW_TEXT, type AnalysisData } from "@/lib/analysisStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const modules = [
  { id: "modLegal", title: "Simplified Legal Explanation", description: "One-paragraph summary, adapted to the selected language.", icon: Scale, badge: "Plain language", sensitive: false },
  { id: "modEconomic", title: "Economic & Fiscal Impact", description: "High-level view of revenue, compliance cost, and MSE competitiveness.", icon: TrendingUp, badge: "Revenue & jobs", sensitive: false },
  { id: "modGeo", title: "State / District-wise Impact", description: "Central role: compares states. State role: drills down to districts.", icon: MapPin, badge: "Role-aware", sensitive: false },
  { id: "modCommunity", title: "Community Impact", description: "Flags where specific communities might be unintentionally advantaged or disadvantaged.", icon: Users, badge: "Tribe, region, language", sensitive: true },
  { id: "modGender", title: "Gender-specific Impact", description: "Looks at how provisions affect men, women, and non-binary citizens differently.", icon: Heart, badge: "Women-led enterprises", sensitive: true },
  { id: "modGlobal", title: "Global Law Comparison", description: "Compares the proposal with similar policies in other countries.", icon: Globe, badge: "International reference", sensitive: false },
  { id: "modPrevious", title: "Previous Law Impact & Suggestions", description: "Uses mock data from earlier GST or tax reforms to suggest improvements.", icon: History, badge: "Lessons learned", sensitive: false },
  { id: "modFuture", title: "Future National Impact Prediction", description: "Simple 3-year projection under optimistic, neutral, and cautious scenarios.", icon: Telescope, badge: "Scenario view", sensitive: false },
];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [role, setRole] = useState<"central" | "state">("central");
  const [selectedState, setSelectedState] = useState(INDIAN_STATES[0]);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [lawText, setLawText] = useState(DEFAULT_LAW_TEXT);
  const [selectedModules, setSelectedModules] = useState({
    modLegal: true, modEconomic: true, modGeo: true, modCommunity: false,
    modGender: false, modGlobal: false, modPrevious: false, modFuture: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  useEffect(() => {
    const hasModule = Object.values(selectedModules).some((v) => v);
    if (lawText.trim() && hasModule) {
      const data: AnalysisData = {
        role, state: selectedState, lang: language, lawText, modules: selectedModules, timestamp: Date.now(),
      };
      saveAnalysisData(data);
    }
  }, [role, selectedState, language, lawText, selectedModules]);

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId as keyof typeof prev] }));
  };

  const handleReset = () => {
    setRole("central");
    setSelectedState(INDIAN_STATES[0]);
    setLanguage("en");
    setLawText(DEFAULT_LAW_TEXT);
    setSelectedModules({
      modLegal: true, modEconomic: true, modGeo: true, modCommunity: false,
      modGender: false, modGlobal: false, modPrevious: false, modFuture: false,
    });
    toast.success("Form reset to defaults");
  };

  const handleRunAnalysis = async () => {
    if (!lawText.trim()) { toast.error("Please enter the draft law text"); return; }
    const hasModule = Object.values(selectedModules).some((v) => v);
    if (!hasModule) { toast.error("Please select at least one analysis module"); return; }

    setIsAnalyzing(true);
    setProgress(10);
    setProgressLabel("Preparing analysis request...");

    const data: AnalysisData = {
      role, state: selectedState, lang: language, lawText, modules: selectedModules, timestamp: Date.now(),
    };
    saveAnalysisData(data);

    try {
      setProgress(25);
      setProgressLabel("Sending to AI engine...");

      const { data: result, error } = await supabase.functions.invoke("analyze-law", {
        body: { lawText, role, state: selectedState, lang: language, modules: selectedModules },
      });

      setProgress(70);
      setProgressLabel("Processing AI response...");

      if (error) throw error;
      if (result?.error) { toast.error(result.error); setIsAnalyzing(false); return; }

      if (result?.analysis) {
        saveAIResult(result.analysis);
      }

      setProgress(85);
      setProgressLabel("Saving to database...");

      // Save to database if user is logged in
      if (user) {
        const title = lawText.substring(0, 60).replace(/\n/g, " ").trim() + "...";
        await supabase.from("analyses").insert({
          user_id: user.id,
          title,
          role,
          state: selectedState,
          lang: language,
          law_text: lawText,
          modules: selectedModules,
          ai_result: result?.analysis || null,
        } as any);
      }

      setProgress(100);
      setProgressLabel("Analysis complete!");

      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
        toast.success("AI Analysis complete! Redirecting to results...");
        navigate("/results");
      }, 500);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setIsAnalyzing(false);
      setProgress(0);
      toast.error(err?.message || "Failed to run AI analysis. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Card className="w-full max-w-md shadow-elevated animate-scale-in">
              <CardContent className="py-8 space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <Sparkles className="w-6 h-6 text-secondary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
                  <p className="text-sm text-muted-foreground">{progressLabel}</p>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Analyzing {Object.values(selectedModules).filter(Boolean).length} modules...
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-3 space-y-6 animate-fade-in">
            <Card className="shadow-soft border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-secondary">①</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Law & Role Configuration</CardTitle>
                      <CardDescription>Select who you are analysing for, then choose or paste a draft law.</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Government Role
                    <span className="text-xs text-muted-foreground ml-2 font-normal">Central view shows state-wise impact. State view shows district-wise impact.</span>
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[140px]">
                      <Select value={role} onValueChange={(v) => setRole(v as "central" | "state")}>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="central">Central Government</SelectItem>
                          <SelectItem value="state">State Government</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {role === "state" && (
                      <div className="flex-1 min-w-[180px] animate-fade-in">
                        <Select value={selectedState} onValueChange={setSelectedState}>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex-1 min-w-[140px]">
                      <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "hi")}>
                        <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi (simple)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">Central → state heat-map</Badge>
                    <Badge variant="secondary" className="text-xs">State → district drill-down</Badge>
                    <Badge variant="secondary" className="text-xs">Language-aware explanations</Badge>
                  </div>
                </div>

                {/* Law Text */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Draft Law / Policy Text</Label>
                    <Button variant="ghost" size="sm" onClick={() => setLawText(DEFAULT_LAW_TEXT)} className="text-xs">
                      <FileText className="w-3 h-3 mr-1" /> Restore sample
                    </Button>
                  </div>
                  <Textarea
                    value={lawText}
                    onChange={(e) => setLawText(e.target.value)}
                    placeholder="Paste or type your draft law here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                {/* AI Modules */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    AI Analysis Modules
                    <span className="text-xs text-muted-foreground ml-2 font-normal">Select modules to include in this run</span>
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3 stagger-children">
                    {modules.map((module) => {
                      const Icon = module.icon;
                      const isChecked = selectedModules[module.id as keyof typeof selectedModules];
                      return (
                        <label
                          key={module.id}
                          className={`relative flex gap-3 p-4 rounded-lg border cursor-pointer transition-all
                            ${isChecked ? "bg-secondary/5 border-secondary/30 shadow-sm" : "bg-muted/30 border-border hover:border-border/80"}
                            ${module.sensitive ? "ring-1 ring-destructive/20" : ""}
                          `}
                        >
                          <Checkbox checked={isChecked} onCheckedChange={() => handleModuleToggle(module.id)} className="mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="font-medium text-sm">{module.title}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{module.badge}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                          </div>
                          {module.sensitive && (
                            <Badge variant="destructive" className="absolute -top-2 -right-2 text-[9px] px-1.5">Sensitive</Badge>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button size="lg" onClick={handleRunAnalysis} disabled={isAnalyzing} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-elevated">
                    {isAnalyzing ? (
                      <><Sparkles className="w-5 h-5 mr-2 animate-pulse" /> Analyzing...</>
                    ) : (
                      <><Play className="w-5 h-5 mr-2" /> Run AI Analysis</>
                    )}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    AI Analysis Ready
                  </div>
                  {!user && (
                    <span className="text-xs text-muted-foreground">
                      <a href="/auth" className="text-primary hover:underline">Sign in</a> to save analyses
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Card className="shadow-soft border-border/50 sticky top-32">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-secondary">②</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Quick Preview</CardTitle>
                    <CardDescription>Run analysis to see results</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">After running the analysis, you can view:</p>
                <ul className="space-y-3">
                  {[
                    { label: "Results Page", desc: "Detailed analysis cards with explanations", path: "/results" },
                    { label: "Impact Graphs", desc: "Visual charts showing economic and social impact", path: "/impact" },
                    { label: "Maps", desc: "Interactive India map with state-wise impact", path: "/maps" },
                  ].map((item) => (
                    <li key={item.path} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <ChevronRight className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  Click "Run AI Analysis" to generate data, then navigate using the menu above.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
