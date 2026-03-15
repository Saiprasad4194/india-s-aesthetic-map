import { Badge } from "@/components/ui/badge";
import type { AIAnalysisResult } from "@/lib/analysisStore";

interface Props {
  ai: AIAnalysisResult["modEnvironmental"];
}

const EnvironmentalCard = ({ ai }: Props) => {
  if (!ai) return <p className="text-sm">Run AI analysis for environmental data.</p>;

  return (
    <div className="space-y-4">
      {/* Sustainability Score */}
      <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
        <div className="text-3xl font-bold text-success">{ai.sustainabilityScore}/100</div>
        <p className="text-xs text-muted-foreground mt-1">Sustainability Score</p>
      </div>

      {/* Impact Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
          <span>Carbon Impact</span>
          <span className="font-medium">{ai.carbonImpact}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
          <span>Pollution Change</span>
          <span className="font-medium">{ai.pollutionChange}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
          <span>Resource Usage</span>
          <span className="font-medium">{ai.resourceUsage}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{ai.summary}</p>

      {ai.recommendations && ai.recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1">Recommendations:</p>
          <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
            {ai.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalCard;
