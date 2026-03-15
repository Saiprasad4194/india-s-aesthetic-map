import { Badge } from "@/components/ui/badge";
import type { AIAnalysisResult } from "@/lib/analysisStore";

interface Props {
  ai: AIAnalysisResult["modLegal"];
  lang: string;
}

const LawBreakdown = ({ ai, lang }: Props) => {
  if (!ai) {
    return <p className="text-sm">Run AI analysis for law breakdown.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <p className="text-sm">{lang === "hi" && ai.summary_hi ? ai.summary_hi : ai.summary_en}</p>
      </div>

      {/* Policy Classification & Objective */}
      {(ai.policyClassification || ai.objective) && (
        <div className="p-3 bg-primary/5 rounded-lg space-y-2">
          {ai.policyClassification && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">Classification:</span>
              <Badge variant="outline">{ai.policyClassification}</Badge>
            </div>
          )}
          {ai.objective && (
            <p className="text-xs text-muted-foreground"><strong>Objective:</strong> {ai.objective}</p>
          )}
        </div>
      )}

      {/* Sections Table */}
      {ai.sections && ai.sections.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2">Key Sections:</p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left font-medium">Section</th>
                  <th className="p-2 text-left font-medium">Meaning</th>
                  <th className="p-2 text-left font-medium">Affected</th>
                </tr>
              </thead>
              <tbody>
                {ai.sections.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-medium">{s.title}</td>
                    <td className="p-2 text-muted-foreground">{s.meaning}</td>
                    <td className="p-2 text-muted-foreground">{s.affectedParties}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stakeholders & Sectors */}
      <div className="flex flex-wrap gap-3">
        {ai.stakeholders && ai.stakeholders.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1">Stakeholders:</p>
            <div className="flex flex-wrap gap-1">
              {ai.stakeholders.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">{s}</Badge>
              ))}
            </div>
          </div>
        )}
        {ai.affectedSectors && ai.affectedSectors.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-1">Affected Sectors:</p>
            <div className="flex flex-wrap gap-1">
              {ai.affectedSectors.map((s, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawBreakdown;
