import { useState } from "react";

interface StateData {
  id: string;
  name: string;
  impact: "positive" | "neutral" | "risk";
  score: number;
}

interface IndiaMapProps {
  stateData?: StateData[];
  onStateClick?: (stateId: string) => void;
  selectedState?: string | null;
}

const defaultStateData: StateData[] = [
  { id: "JK", name: "Jammu & Kashmir", impact: "neutral", score: 72 },
  { id: "LA", name: "Ladakh", impact: "neutral", score: 68 },
  { id: "HP", name: "Himachal Pradesh", impact: "positive", score: 85 },
  { id: "PB", name: "Punjab", impact: "positive", score: 82 },
  { id: "HR", name: "Haryana", impact: "positive", score: 88 },
  { id: "UK", name: "Uttarakhand", impact: "positive", score: 79 },
  { id: "DL", name: "Delhi", impact: "positive", score: 92 },
  { id: "RJ", name: "Rajasthan", impact: "neutral", score: 74 },
  { id: "UP", name: "Uttar Pradesh", impact: "risk", score: 65 },
  { id: "BR", name: "Bihar", impact: "risk", score: 58 },
  { id: "SK", name: "Sikkim", impact: "positive", score: 81 },
  { id: "AR", name: "Arunachal Pradesh", impact: "neutral", score: 70 },
  { id: "NL", name: "Nagaland", impact: "neutral", score: 69 },
  { id: "MN", name: "Manipur", impact: "neutral", score: 67 },
  { id: "MZ", name: "Mizoram", impact: "positive", score: 76 },
  { id: "TR", name: "Tripura", impact: "neutral", score: 71 },
  { id: "ML", name: "Meghalaya", impact: "neutral", score: 73 },
  { id: "AS", name: "Assam", impact: "neutral", score: 68 },
  { id: "WB", name: "West Bengal", impact: "neutral", score: 75 },
  { id: "JH", name: "Jharkhand", impact: "risk", score: 62 },
  { id: "OR", name: "Odisha", impact: "neutral", score: 70 },
  { id: "CT", name: "Chhattisgarh", impact: "risk", score: 64 },
  { id: "MP", name: "Madhya Pradesh", impact: "neutral", score: 72 },
  { id: "GJ", name: "Gujarat", impact: "positive", score: 89 },
  { id: "MH", name: "Maharashtra", impact: "positive", score: 87 },
  { id: "GA", name: "Goa", impact: "positive", score: 84 },
  { id: "KA", name: "Karnataka", impact: "positive", score: 91 },
  { id: "AP", name: "Andhra Pradesh", impact: "neutral", score: 77 },
  { id: "TG", name: "Telangana", impact: "positive", score: 86 },
  { id: "TN", name: "Tamil Nadu", impact: "positive", score: 88 },
  { id: "KL", name: "Kerala", impact: "positive", score: 90 },
];

const IndiaMap = ({ stateData = defaultStateData, onStateClick, selectedState }: IndiaMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getStateColor = (stateId: string) => {
    const state = stateData.find((s) => s.id === stateId);
    if (!state) return "hsl(220 26% 94%)";
    
    switch (state.impact) {
      case "positive":
        return "hsl(145 63% 50%)";
      case "neutral":
        return "hsl(43 96% 56%)";
      case "risk":
        return "hsl(0 72% 55%)";
      default:
        return "hsl(220 26% 94%)";
    }
  };

  const getStateData = (stateId: string) => {
    return stateData.find((s) => s.id === stateId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Tooltip */}
      {hoveredState && (
        <div
          className="fixed z-50 px-4 py-3 rounded-lg bg-card shadow-elevated border border-border pointer-events-none"
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y - 10,
          }}
        >
          <div className="font-semibold text-foreground">
            {getStateData(hoveredState)?.name}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStateColor(hoveredState) }}
            />
            <span className="text-sm text-muted-foreground">
              Impact Score: {getStateData(hoveredState)?.score}%
            </span>
          </div>
        </div>
      )}

      <svg
        viewBox="0 0 600 700"
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
      >
        {/* Background */}
        <rect x="0" y="0" width="600" height="700" fill="none" />
        
        {/* India Map - Simplified Path Representation */}
        {/* Jammu & Kashmir */}
        <path
          d="M180 50 L220 40 L270 50 L280 80 L260 110 L230 100 L200 120 L170 100 L160 70 Z"
          fill={getStateColor("JK")}
          className={`state-path ${selectedState === "JK" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("JK")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("JK")}
        />
        
        {/* Ladakh */}
        <path
          d="M270 50 L320 40 L350 60 L340 90 L300 100 L280 80 Z"
          fill={getStateColor("LA")}
          className={`state-path ${selectedState === "LA" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("LA")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("LA")}
        />
        
        {/* Himachal Pradesh */}
        <path
          d="M230 100 L260 110 L270 140 L240 160 L210 150 L200 120 Z"
          fill={getStateColor("HP")}
          className={`state-path ${selectedState === "HP" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("HP")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("HP")}
        />
        
        {/* Punjab */}
        <path
          d="M170 100 L200 120 L210 150 L180 180 L140 170 L130 130 Z"
          fill={getStateColor("PB")}
          className={`state-path ${selectedState === "PB" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("PB")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("PB")}
        />
        
        {/* Haryana */}
        <path
          d="M180 180 L210 150 L240 160 L250 200 L220 230 L180 210 Z"
          fill={getStateColor("HR")}
          className={`state-path ${selectedState === "HR" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("HR")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("HR")}
        />
        
        {/* Delhi */}
        <path
          d="M220 195 L235 190 L245 205 L235 215 L220 210 Z"
          fill={getStateColor("DL")}
          className={`state-path ${selectedState === "DL" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("DL")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("DL")}
        />
        
        {/* Uttarakhand */}
        <path
          d="M240 160 L270 140 L310 150 L320 190 L280 200 L250 200 Z"
          fill={getStateColor("UK")}
          className={`state-path ${selectedState === "UK" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("UK")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("UK")}
        />
        
        {/* Rajasthan */}
        <path
          d="M100 200 L180 210 L220 230 L210 300 L180 350 L100 340 L80 270 Z"
          fill={getStateColor("RJ")}
          className={`state-path ${selectedState === "RJ" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("RJ")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("RJ")}
        />
        
        {/* Uttar Pradesh */}
        <path
          d="M220 230 L280 200 L350 220 L380 280 L350 320 L280 330 L210 300 Z"
          fill={getStateColor("UP")}
          className={`state-path ${selectedState === "UP" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("UP")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("UP")}
        />
        
        {/* Bihar */}
        <path
          d="M380 280 L430 260 L470 290 L450 340 L390 350 L350 320 Z"
          fill={getStateColor("BR")}
          className={`state-path ${selectedState === "BR" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("BR")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("BR")}
        />
        
        {/* West Bengal */}
        <path
          d="M450 340 L490 330 L510 380 L490 450 L450 430 L430 380 Z"
          fill={getStateColor("WB")}
          className={`state-path ${selectedState === "WB" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("WB")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("WB")}
        />
        
        {/* Jharkhand */}
        <path
          d="M390 350 L450 340 L430 380 L420 410 L370 400 L350 370 Z"
          fill={getStateColor("JH")}
          className={`state-path ${selectedState === "JH" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("JH")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("JH")}
        />
        
        {/* Odisha */}
        <path
          d="M370 400 L420 410 L450 430 L430 490 L380 510 L340 470 L350 420 Z"
          fill={getStateColor("OR")}
          className={`state-path ${selectedState === "OR" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("OR")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("OR")}
        />
        
        {/* Chhattisgarh */}
        <path
          d="M280 370 L350 370 L350 420 L340 470 L290 460 L260 420 Z"
          fill={getStateColor("CT")}
          className={`state-path ${selectedState === "CT" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("CT")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("CT")}
        />
        
        {/* Madhya Pradesh */}
        <path
          d="M180 350 L280 330 L350 370 L280 370 L260 420 L200 410 L160 380 Z"
          fill={getStateColor("MP")}
          className={`state-path ${selectedState === "MP" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("MP")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("MP")}
        />
        
        {/* Gujarat */}
        <path
          d="M60 340 L100 340 L180 350 L160 380 L140 430 L80 450 L40 400 Z"
          fill={getStateColor("GJ")}
          className={`state-path ${selectedState === "GJ" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("GJ")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("GJ")}
        />
        
        {/* Maharashtra */}
        <path
          d="M140 430 L200 410 L260 420 L290 460 L280 520 L200 540 L140 510 L120 470 Z"
          fill={getStateColor("MH")}
          className={`state-path ${selectedState === "MH" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("MH")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("MH")}
        />
        
        {/* Goa */}
        <path
          d="M140 510 L165 505 L175 530 L155 545 L135 530 Z"
          fill={getStateColor("GA")}
          className={`state-path ${selectedState === "GA" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("GA")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("GA")}
        />
        
        {/* Karnataka */}
        <path
          d="M155 545 L200 540 L260 550 L270 610 L220 640 L160 620 L140 570 Z"
          fill={getStateColor("KA")}
          className={`state-path ${selectedState === "KA" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("KA")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("KA")}
        />
        
        {/* Andhra Pradesh */}
        <path
          d="M260 550 L340 470 L380 510 L370 570 L320 600 L270 610 Z"
          fill={getStateColor("AP")}
          className={`state-path ${selectedState === "AP" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("AP")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("AP")}
        />
        
        {/* Telangana */}
        <path
          d="M260 460 L290 460 L340 470 L360 500 L340 530 L280 520 L260 480 Z"
          fill={getStateColor("TG")}
          className={`state-path ${selectedState === "TG" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("TG")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("TG")}
        />
        
        {/* Tamil Nadu */}
        <path
          d="M220 640 L270 610 L320 600 L340 650 L300 680 L250 680 L220 660 Z"
          fill={getStateColor("TN")}
          className={`state-path ${selectedState === "TN" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("TN")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("TN")}
        />
        
        {/* Kerala */}
        <path
          d="M180 640 L220 640 L220 660 L200 690 L170 680 L160 650 Z"
          fill={getStateColor("KL")}
          className={`state-path ${selectedState === "KL" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("KL")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("KL")}
        />
        
        {/* Northeast States */}
        {/* Sikkim */}
        <path
          d="M450 260 L470 250 L480 270 L470 285 L455 280 Z"
          fill={getStateColor("SK")}
          className={`state-path ${selectedState === "SK" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("SK")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("SK")}
        />
        
        {/* Assam */}
        <path
          d="M480 270 L520 250 L570 280 L560 310 L510 320 L480 300 Z"
          fill={getStateColor("AS")}
          className={`state-path ${selectedState === "AS" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("AS")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("AS")}
        />
        
        {/* Arunachal Pradesh */}
        <path
          d="M520 200 L580 210 L590 250 L570 280 L520 250 Z"
          fill={getStateColor("AR")}
          className={`state-path ${selectedState === "AR" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("AR")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("AR")}
        />
        
        {/* Nagaland */}
        <path
          d="M560 280 L580 270 L595 290 L585 310 L565 305 Z"
          fill={getStateColor("NL")}
          className={`state-path ${selectedState === "NL" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("NL")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("NL")}
        />
        
        {/* Manipur */}
        <path
          d="M565 305 L585 310 L590 335 L575 345 L560 330 Z"
          fill={getStateColor("MN")}
          className={`state-path ${selectedState === "MN" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("MN")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("MN")}
        />
        
        {/* Mizoram */}
        <path
          d="M540 340 L560 330 L575 345 L565 380 L545 375 Z"
          fill={getStateColor("MZ")}
          className={`state-path ${selectedState === "MZ" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("MZ")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("MZ")}
        />
        
        {/* Tripura */}
        <path
          d="M515 350 L535 345 L540 370 L525 380 L510 365 Z"
          fill={getStateColor("TR")}
          className={`state-path ${selectedState === "TR" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("TR")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("TR")}
        />
        
        {/* Meghalaya */}
        <path
          d="M490 300 L520 295 L535 315 L515 330 L490 320 Z"
          fill={getStateColor("ML")}
          className={`state-path ${selectedState === "ML" ? "stroke-[3]" : ""}`}
          onMouseEnter={() => setHoveredState("ML")}
          onMouseLeave={() => setHoveredState(null)}
          onClick={() => onStateClick?.("ML")}
        />
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success" />
          <span className="text-sm text-muted-foreground">Low Risk / Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning" />
          <span className="text-sm text-muted-foreground">Medium / Needs Support</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive" />
          <span className="text-sm text-muted-foreground">High Risk / Attention</span>
        </div>
      </div>
    </div>
  );
};

export default IndiaMap;
