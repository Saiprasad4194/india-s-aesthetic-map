import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AIAnalysisResult } from "@/lib/analysisStore";

interface Props {
  ai: AIAnalysisResult["modRiskScore"];
}

const riskColor = (score: number) => {
  if (score <= 3) return "text-success";
  if (score <= 6) return "text-warning";
  return "text-destructive";
};

const riskBg = (score: number) => {
  if (score <= 3) return "bg-success";
  if (score <= 6) return "bg-warning";
  return "bg-destructive";
};

const RiskScoreCard = ({ ai }: Props) => {
  if (!ai) return <p className="text-sm">Run AI analysis for risk scores.</p>;

  const risks = [
    { label: "Economic Risk", score: ai.economicRisk },
    { label: "Social Risk", score: ai.socialRisk },
    { label: "Environmental Risk", score: ai.environmentalRisk },
    { label: "Legal Risk", score: ai.legalRisk },
    { label: "Political Risk", score: ai.politicalRisk },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Risk */}
      <div className="text-center p-4 rounded-lg bg-muted/50">
        <div className={`text-3xl font-bold ${riskColor(ai.overallRisk)}`}>{ai.overallRisk}/10</div>
        <p className="text-xs text-muted-foreground mt-1">Overall Risk Score</p>
      </div>

      {/* Individual Risks */}
      <div className="space-y-2">
        {risks.map((r) => (
          <div key={r.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{r.label}</span>
              <span className={`font-semibold ${riskColor(r.score)}`}>{r.score}/10</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${riskBg(r.score)}`} style={{ width: `${r.score * 10}%` }} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{ai.summary}</p>

      {/* Legal Conflicts */}
      {ai.legalConflicts && ai.legalConflicts.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1">Potential Legal Conflicts:</p>
          <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
            {ai.legalConflicts.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {/* Mitigation */}
      {ai.mitigationStrategies && ai.mitigationStrategies.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1">Mitigation Strategies:</p>
          <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
            {ai.mitigationStrategies.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskScoreCard;
