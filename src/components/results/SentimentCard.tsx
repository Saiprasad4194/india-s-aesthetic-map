import { Badge } from "@/components/ui/badge";
import type { AIAnalysisResult } from "@/lib/analysisStore";

interface Props {
  ai: AIAnalysisResult["modSentiment"];
}

const SentimentCard = ({ ai }: Props) => {
  if (!ai) return <p className="text-sm">Run AI analysis for sentiment data.</p>;

  return (
    <div className="space-y-4">
      {/* Sentiment Bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Public Support</span>
            <span className="font-semibold text-success">{ai.publicSupport}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full" style={{ width: `${ai.publicSupport}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Opposition</span>
            <span className="font-semibold text-destructive">{ai.publicOpposition}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-destructive rounded-full" style={{ width: `${ai.publicOpposition}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Neutral</span>
            <span className="font-semibold text-warning">{ai.neutralSentiment}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-warning rounded-full" style={{ width: `${ai.neutralSentiment}%` }} />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{ai.summary}</p>

      {/* Media Reactions */}
      {ai.newsReactions && ai.newsReactions.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2">Predicted Media Reactions:</p>
          <div className="space-y-2">
            {ai.newsReactions.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs p-2 bg-muted/50 rounded">
                <Badge variant={r.sentiment === "positive" ? "default" : r.sentiment === "negative" ? "destructive" : "secondary"} className="text-[9px] shrink-0">
                  {r.sentiment}
                </Badge>
                <div>
                  <span className="font-medium">{r.source}:</span> {r.summary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentCard;
