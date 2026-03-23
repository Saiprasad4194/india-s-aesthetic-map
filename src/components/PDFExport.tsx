import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { type AnalysisData, type AIAnalysisResult } from "@/lib/analysisStore";
import jsPDF from "jspdf";

interface PDFExportProps {
  data: AnalysisData;
  aiResult: AIAnalysisResult | null;
}

const PDFExport = ({ data, aiResult }: PDFExportProps) => {
  const handleExport = () => {
    const { role, state, lang, modules } = data;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    const checkPage = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    };

    const addHeading = (text: string) => {
      checkPage(20);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 60, 120);
      doc.text(text, margin, y);
      y += 4;
      doc.setDrawColor(20, 60, 120);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    };

    const addText = (text: string, bold = false) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(text, maxWidth);
      checkPage(lines.length * 5 + 2);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 2;
    };

    const addKeyValue = (key: string, value: string) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text(`${key}: `, margin, y);
      const keyWidth = doc.getTextWidth(`${key}: `);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      const valLines = doc.splitTextToSize(value, maxWidth - keyWidth);
      doc.text(valLines, margin + keyWidth, y);
      y += valLines.length * 5 + 2;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 60, 120);
    doc.text("AI Parliament - Law Impact Analysis Report", margin, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, margin, y);
    y += 5;
    doc.text(`Role: ${role === "central" ? "Central Government" : `State Government (${state})`}`, margin, y);
    y += 5;
    doc.text(`Language: ${lang === "en" ? "English" : "Hindi"}`, margin, y);
    y += 10;

    // Legal
    if (modules.modLegal && aiResult?.modLegal) {
      addHeading("Legal Overview");
      addText(aiResult.modLegal.summary_en);
      addKeyValue("Status", aiResult.modLegal.status);
      addKeyValue("Confidence", `${aiResult.modLegal.confidence}%`);
      if (aiResult.modLegal.sections?.length) {
        addText("Key Sections:", true);
        aiResult.modLegal.sections.forEach((s) => {
          addText(`  - ${s.title}: ${s.meaning} (Affects: ${s.affectedParties})`);
        });
      }
      y += 4;
    }

    // Economic
    if (modules.modEconomic && aiResult?.modEconomic) {
      addHeading("Economic & Fiscal Impact");
      addKeyValue("Revenue Impact", aiResult.modEconomic.revenueImpact);
      if (aiResult.modEconomic.gdpImpact) addKeyValue("GDP Impact", aiResult.modEconomic.gdpImpact);
      if (aiResult.modEconomic.employmentChange) addKeyValue("Employment Change", aiResult.modEconomic.employmentChange);
      addKeyValue("Job Creation", aiResult.modEconomic.jobCreation);
      if (aiResult.modEconomic.details) addText(aiResult.modEconomic.details);
      if (aiResult.modEconomic.sectorImpacts?.length) {
        addText("Sector Impacts:", true);
        aiResult.modEconomic.sectorImpacts.forEach((s) => {
          addText(`  - ${s.sector}: ${s.change} - ${s.details}`);
        });
      }
      y += 4;
    }

    // Geographic
    if (modules.modGeo && aiResult?.modGeo) {
      addHeading("Geographic Analysis");
      if (aiResult.modGeo.highReadiness?.length) addKeyValue("High Readiness", aiResult.modGeo.highReadiness.join(", "));
      if (aiResult.modGeo.mediumReadiness?.length) addKeyValue("Medium Readiness", aiResult.modGeo.mediumReadiness.join(", "));
      if (aiResult.modGeo.needSupport?.length) addKeyValue("Need Support", aiResult.modGeo.needSupport.join(", "));
      y += 4;
    }

    // Community
    if (modules.modCommunity && aiResult?.modCommunity) {
      addHeading("Social & Community Impact");
      addText(aiResult.modCommunity.summary);
      if (aiResult.modCommunity.urbanImpact) addKeyValue("Urban", aiResult.modCommunity.urbanImpact);
      if (aiResult.modCommunity.ruralImpact) addKeyValue("Rural", aiResult.modCommunity.ruralImpact);
      if (aiResult.modCommunity.recommendations?.length) {
        addText("Recommendations:", true);
        aiResult.modCommunity.recommendations.forEach((r, i) => addText(`  ${i + 1}. ${r}`));
      }
      y += 4;
    }

    // Gender
    if (modules.modGender && aiResult?.modGender) {
      addHeading("Gender Impact");
      addText(aiResult.modGender.summary);
      addKeyValue("Women Benefit", aiResult.modGender.womenBenefit);
      y += 4;
    }

    // Environmental
    if (modules.modEnvironmental && aiResult?.modEnvironmental) {
      addHeading("Environmental Impact");
      addText(aiResult.modEnvironmental.summary);
      addKeyValue("Carbon Impact", aiResult.modEnvironmental.carbonImpact);
      addKeyValue("Pollution Change", aiResult.modEnvironmental.pollutionChange);
      addKeyValue("Sustainability Score", `${aiResult.modEnvironmental.sustainabilityScore}/10`);
      y += 4;
    }

    // Sentiment
    if (modules.modSentiment && aiResult?.modSentiment) {
      addHeading("Public Sentiment");
      addText(aiResult.modSentiment.summary);
      addKeyValue("Support", `${aiResult.modSentiment.publicSupport}%`);
      addKeyValue("Opposition", `${aiResult.modSentiment.publicOpposition}%`);
      y += 4;
    }

    // Risk
    if (modules.modRiskScore && aiResult?.modRiskScore) {
      addHeading("Risk Assessment");
      addText(aiResult.modRiskScore.summary);
      addKeyValue("Overall Risk", `${aiResult.modRiskScore.overallRisk}/10`);
      addKeyValue("Economic Risk", `${aiResult.modRiskScore.economicRisk}/10`);
      addKeyValue("Social Risk", `${aiResult.modRiskScore.socialRisk}/10`);
      addKeyValue("Legal Risk", `${aiResult.modRiskScore.legalRisk}/10`);
      if (aiResult.modRiskScore.legalConflicts?.length) {
        addText("Legal Conflicts:", true);
        aiResult.modRiskScore.legalConflicts.forEach((c, i) => addText(`  ${i + 1}. ${c}`));
      }
      y += 4;
    }

    // Global
    if (modules.modGlobal && aiResult?.modGlobal) {
      addHeading("Global Comparison");
      aiResult.modGlobal.comparisons?.forEach((c) => {
        addText(`${c.country} (${c.policy}): ${c.outcome}`);
      });
      y += 4;
    }

    // Past Reforms
    if (modules.modPrevious && aiResult?.modPrevious) {
      addHeading("Lessons from Past Reforms");
      aiResult.modPrevious.lessons?.forEach((l, i) => addText(`${i + 1}. ${l}`));
      y += 4;
    }

    // Future
    if (modules.modFuture && aiResult?.modFuture) {
      addHeading("3-Year Projections");
      addKeyValue("Optimistic", `${aiResult.modFuture.optimistic?.formalization} formalization, ${aiResult.modFuture.optimistic?.revenue} revenue`);
      addKeyValue("Neutral", `${aiResult.modFuture.neutral?.formalization} formalization, ${aiResult.modFuture.neutral?.revenue} revenue`);
      addKeyValue("Cautious", `${aiResult.modFuture.cautious?.formalization} formalization, ${aiResult.modFuture.cautious?.revenue} revenue`);
    }

    // Footer
    checkPage(20);
    y += 8;
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("AI Parliament - Academic Prototype", margin, y);
    y += 4;
    doc.text("This report was generated by AI and is for informational purposes only.", margin, y);

    doc.save(`AI-Parliament-Report-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF report downloaded!");
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <Download className="w-4 h-4" />
      Export PDF Report
    </Button>
  );
};

export default PDFExport;
