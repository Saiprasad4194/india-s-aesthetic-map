import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Trash2, Share2, ExternalLink, Copy } from "lucide-react";
import { saveAnalysisData, saveAIResult, type AnalysisData } from "@/lib/analysisStore";

interface AnalysisRecord {
  id: string;
  title: string;
  role: string;
  state: string | null;
  lang: string;
  law_text: string;
  modules: any;
  ai_result: any;
  share_id: string;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load analyses");
    } else {
      setAnalyses((data as any[]) || []);
    }
    setLoading(false);
  };

  const handleView = (analysis: AnalysisRecord) => {
    const data: AnalysisData = {
      role: analysis.role as "central" | "state",
      state: analysis.state || "",
      lang: analysis.lang as "en" | "hi",
      lawText: analysis.law_text,
      modules: analysis.modules,
      timestamp: new Date(analysis.created_at).getTime(),
    };
    saveAnalysisData(data);
    if (analysis.ai_result) {
      saveAIResult(analysis.ai_result);
    }
    navigate("/results");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analyses").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Analysis deleted");
    }
  };

  const handleShare = async (shareId: string) => {
    const url = `${window.location.origin}/shared/${shareId}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard!");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Analysis History</h1>
            <p className="text-muted-foreground">Your past law impact analyses</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            New Analysis
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-8">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No analyses yet</h2>
              <p className="text-muted-foreground mb-4">Run your first AI analysis to see it here.</p>
              <Button onClick={() => navigate("/")}>Go to Input</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 stagger-children">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="shadow-soft hover:-translate-y-1 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{analysis.title}</CardTitle>
                      <CardDescription>
                        {new Date(analysis.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {analysis.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {analysis.law_text.substring(0, 120)}...
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(analysis.modules)
                      .filter(([_, v]) => v)
                      .map(([k]) => (
                        <Badge key={k} variant="outline" className="text-[10px]">
                          {k.replace("mod", "")}
                        </Badge>
                      ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => handleView(analysis)} className="flex-1">
                      <ExternalLink className="w-3 h-3 mr-1" /> View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare(analysis.share_id)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(analysis.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default History;
