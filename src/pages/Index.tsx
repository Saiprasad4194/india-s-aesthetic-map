import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Play, RotateCcw, Scale, TrendingUp, MapPin, Users, Heart, Globe, History, Telescope, ChevronRight, Sparkles, Loader2, Leaf, MessageSquare, ShieldAlert, Upload
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
  { id: "modLegal", title: "Law Summary & Breakdown", description: "AI extracts sections, stakeholders, objectives, and classifies the policy.", icon: Scale, badge: "Clause detection", sensitive: false },
  { id: "modEconomic", title: "Economic & Fiscal Impact", description: "GDP impact, industry costs, employment changes, sector-wise analysis.", icon: TrendingUp, badge: "Revenue & jobs", sensitive: false },
  { id: "modGeo", title: "State / District-wise Impact", description: "Central: state comparison. State: district drill-down with readiness levels.", icon: MapPin, badge: "Role-aware", sensitive: false },
  { id: "modCommunity", title: "Social & Community Impact", description: "Urban vs rural impact, inequality effects, community-specific analysis.", icon: Users, badge: "Urban/Rural", sensitive: true },
  { id: "modGender", title: "Gender-specific Impact", description: "How provisions affect men, women, and non-binary citizens differently.", icon: Heart, badge: "Women-led enterprises", sensitive: true },
  { id: "modEnvironmental", title: "Environmental Impact", description: "Carbon emissions, pollution changes, resource usage, sustainability score.", icon: Leaf, badge: "Green analysis", sensitive: false },
  { id: "modSentiment", title: "Public Sentiment Analysis", description: "Predicted public support, opposition, and media reactions.", icon: MessageSquare, badge: "Public opinion", sensitive: false },
  { id: "modRiskScore", title: "Risk Assessment & Legal Conflicts", description: "Risk scores across dimensions, conflicts with existing laws, mitigation strategies.", icon: ShieldAlert, badge: "Risk matrix", sensitive: false },
  { id: "modGlobal", title: "Global Law Comparison", description: "Compares the proposal with similar policies in other countries.", icon: Globe, badge: "International", sensitive: false },
  { id: "modPrevious", title: "Lessons from Past Reforms", description: "Key learnings from earlier reforms to suggest improvements.", icon: History, badge: "Lessons learned", sensitive: false },
  { id: "modFuture", title: "Future National Impact Prediction", description: "3-year projection under optimistic, neutral, and cautious scenarios.", icon: Telescope, badge: "Scenario view", sensitive: false },
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
    modEnvironmental: false, modSentiment: false, modRiskScore: false,
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

  const selectAllModules = () => {
    const allSelected = Object.values(selectedModules).every(v => v);
    const newState = {} as any;
    Object.keys(selectedModules).forEach(k => { newState[k] = !allSelected; });
    setSelectedModules(newState);
  };

  const handleReset = () => {
    setRole("central");
    setSelectedState(INDIAN_STATES[0]);
    setLanguage("en");
    setLawText(DEFAULT_LAW_TEXT);
    setSelectedModules({
      modLegal: true, modEconomic: true, modGeo: true, modCommunity: false,
      modGender: false, modGlobal: false, modPrevious: false, modFuture: false,
      modEnvironmental: false, modSentiment: false, modRiskScore: false,
    });
    toast.success("Form reset to defaults");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) { setLawText(text); toast.success("File loaded successfully"); }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please upload a .txt or .md file. PDF parsing coming soon!");
    }
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

  const selectedCount = Object.values(selectedModules).filter(Boolean).length;

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
                  Analyzing {selectedCount} modules...
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
                      <CardDescription>Upload or paste a bill, select your analysis perspective.</CardDescription>
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
                    <span className="text-xs text-muted-foreground ml-2 font-normal">Central shows state-level; State shows district-level analysis.</span>
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
                </div>

                {/* Law Text + Upload */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Draft Law / Policy Text</Label>
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
                        <Button variant="ghost" size="sm" className="text-xs" asChild>
                          <span><Upload className="w-3 h-3 mr-1" /> Upload File</span>
                        </Button>
                      </label>
                      <Button variant="ghost" size="sm" onClick={() => setLawText(DEFAULT_LAW_TEXT)} className="text-xs">
                        <FileText className="w-3 h-3 mr-1" /> Restore sample
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={lawText}
                    onChange={(e) => setLawText(e.target.value)}
                    placeholder="Paste or type your draft law here, or upload a text file..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Supports: Plain text, .txt, .md files. Paste from parliamentary websites or government documents.</p>
                </div>

                {/* AI Modules */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      AI Analysis Modules
                      <span className="text-xs text-muted-foreground ml-2 font-normal">{selectedCount} of {modules.length} selected</span>
                    </Label>
                    <Button variant="ghost" size="sm" onClick={selectAllModules} className="text-xs">
                      {Object.values(selectedModules).every(v => v) ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
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
                    <CardTitle className="text-lg">What You'll Get</CardTitle>
                    <CardDescription>Comprehensive AI-powered analysis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">After running the analysis, explore:</p>
                <ul className="space-y-3">
                  {[
                    { label: "Results Page", desc: "Law breakdown, summaries, stakeholder identification", path: "/results" },
                    { label: "Impact Dashboard", desc: "Charts: economic, environmental, sentiment, risk scores", path: "/impact" },
                    { label: "Maps", desc: "Interactive India map with state-wise impact", path: "/maps" },
                    { label: "Simulation", desc: "Tweak parameters and see AI-predicted outcomes", path: "/simulation" },
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
                <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Who uses this:</strong> Government analysts, policy researchers, NGOs, journalists, and citizens.
                  </p>
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

export default Index;
