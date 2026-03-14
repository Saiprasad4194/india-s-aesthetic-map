import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { saveAnalysisData, saveAIResult, type AnalysisData } from "@/lib/analysisStore";

const SharedAnalysis = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!shareId) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("analyses")
        .select("*")
        .eq("share_id", shareId)
        .maybeSingle();

      if (fetchError || !data) {
        setError("Analysis not found or has been deleted");
        setLoading(false);
        return;
      }

      const analysisData: AnalysisData = {
        role: (data as any).role as "central" | "state",
        state: (data as any).state || "",
        lang: (data as any).lang as "en" | "hi",
        lawText: (data as any).law_text,
        modules: (data as any).modules,
        timestamp: new Date((data as any).created_at).getTime(),
      };
      saveAnalysisData(analysisData);
      if ((data as any).ai_result) {
        saveAIResult((data as any).ai_result);
      }
      navigate("/results");
    };

    load();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Not Found</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate("/")}>Go to Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
};

export default SharedAnalysis;
