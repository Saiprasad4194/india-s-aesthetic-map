import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface StateInfo {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
  color: string;
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
  { id: "AN", name: "Andaman & Nicobar", impact: "neutral", score: 70 },
  { id: "LD", name: "Lakshadweep", impact: "neutral", score: 68 },
  { id: "PY", name: "Puducherry", impact: "positive", score: 78 },
];

// Color palette inspired by the reference image
const stateColors: Record<string, string> = {
  JK: "#4CAF50", // Green
  LA: "#8BC34A", // Light Green
  HP: "#FF9800", // Orange
  PB: "#FFEB3B", // Yellow
  HR: "#E91E63", // Pink
  UK: "#9C27B0", // Purple
  DL: "#F44336", // Red
  RJ: "#795548", // Brown
  UP: "#FFEB3B", // Yellow
  BR: "#4CAF50", // Green
  SK: "#FF9800", // Orange
  AR: "#F44336", // Red
  NL: "#4CAF50", // Green
  MN: "#E91E63", // Pink
  MZ: "#03A9F4", // Light Blue
  TR: "#FFEB3B", // Yellow
  ML: "#FF9800", // Orange
  AS: "#8BC34A", // Light Green
  WB: "#03A9F4", // Light Blue
  JH: "#4CAF50", // Green
  OR: "#9C27B0", // Purple
  CT: "#FFEB3B", // Yellow
  MP: "#FF9800", // Orange
  GJ: "#E91E63", // Pink
  MH: "#795548", // Brown
  GA: "#03A9F4", // Light Blue
  KA: "#F44336", // Red
  AP: "#8BC34A", // Light Green
  TG: "#E91E63", // Pink
  TN: "#FFEB3B", // Yellow
  KL: "#4CAF50", // Green
  AN: "#4CAF50", // Green
  LD: "#03A9F4", // Light Blue
  PY: "#FF9800", // Orange
};

// Accurate India map state paths
const statesData: StateInfo[] = [
  {
    id: "JK",
    name: "Jammu & Kashmir",
    path: "M155,35 L175,25 L200,30 L220,25 L240,35 L255,55 L250,80 L235,95 L215,90 L195,100 L175,90 L160,95 L145,75 L140,55 Z",
    labelX: 185,
    labelY: 60,
    color: stateColors.JK,
  },
  {
    id: "LA",
    name: "Ladakh",
    path: "M240,35 L275,25 L310,35 L330,55 L325,80 L300,90 L275,85 L255,70 L255,55 Z",
    labelX: 280,
    labelY: 55,
    color: stateColors.LA,
  },
  {
    id: "HP",
    name: "Himachal Pradesh",
    path: "M195,100 L215,90 L235,95 L250,105 L245,125 L230,140 L210,135 L195,145 L180,130 L175,115 Z",
    labelX: 210,
    labelY: 118,
    color: stateColors.HP,
  },
  {
    id: "PB",
    name: "Punjab",
    path: "M145,105 L175,90 L180,115 L195,130 L185,155 L165,165 L140,155 L130,130 Z",
    labelX: 155,
    labelY: 130,
    color: stateColors.PB,
  },
  {
    id: "HR",
    name: "Haryana",
    path: "M165,165 L185,155 L210,150 L230,160 L240,180 L225,200 L200,210 L175,200 L165,180 Z",
    labelX: 195,
    labelY: 180,
    color: stateColors.HR,
  },
  {
    id: "DL",
    name: "Delhi",
    path: "M210,185 L220,180 L228,190 L222,200 L212,198 Z",
    labelX: 218,
    labelY: 192,
    color: stateColors.DL,
  },
  {
    id: "UK",
    name: "Uttarakhand",
    path: "M230,140 L260,125 L290,135 L300,160 L280,180 L255,175 L240,180 L230,160 Z",
    labelX: 260,
    labelY: 155,
    color: stateColors.UK,
  },
  {
    id: "RJ",
    name: "Rajasthan",
    path: "M85,195 L130,175 L165,180 L200,195 L210,230 L200,280 L180,320 L140,340 L95,325 L70,280 L65,230 Z",
    labelX: 130,
    labelY: 265,
    color: stateColors.RJ,
  },
  {
    id: "UP",
    name: "Uttar Pradesh",
    path: "M210,210 L240,195 L280,190 L330,205 L365,245 L370,290 L345,315 L300,325 L255,315 L225,285 L210,250 Z",
    labelX: 285,
    labelY: 260,
    color: stateColors.UP,
  },
  {
    id: "BR",
    name: "Bihar",
    path: "M370,275 L405,255 L440,265 L455,295 L445,330 L410,345 L375,335 L365,305 Z",
    labelX: 410,
    labelY: 300,
    color: stateColors.BR,
  },
  {
    id: "SK",
    name: "Sikkim",
    path: "M440,240 L455,232 L465,245 L458,262 L445,258 Z",
    labelX: 452,
    labelY: 248,
    color: stateColors.SK,
  },
  {
    id: "AS",
    name: "Assam",
    path: "M465,255 L495,245 L535,250 L565,265 L555,290 L530,300 L500,295 L475,300 L460,285 L455,270 Z",
    labelX: 510,
    labelY: 275,
    color: stateColors.AS,
  },
  {
    id: "AR",
    name: "Arunachal Pradesh",
    path: "M505,195 L550,185 L590,200 L595,235 L565,255 L530,250 L495,245 L490,220 Z",
    labelX: 545,
    labelY: 220,
    color: stateColors.AR,
  },
  {
    id: "NL",
    name: "Nagaland",
    path: "M555,275 L575,268 L590,285 L582,305 L562,298 Z",
    labelX: 572,
    labelY: 286,
    color: stateColors.NL,
  },
  {
    id: "MN",
    name: "Manipur",
    path: "M562,305 L582,305 L588,330 L575,345 L558,335 Z",
    labelX: 572,
    labelY: 325,
    color: stateColors.MN,
  },
  {
    id: "MZ",
    name: "Mizoram",
    path: "M535,335 L555,330 L570,350 L562,385 L540,378 L530,355 Z",
    labelX: 548,
    labelY: 358,
    color: stateColors.MZ,
  },
  {
    id: "TR",
    name: "Tripura",
    path: "M508,335 L525,328 L535,350 L525,375 L508,365 Z",
    labelX: 518,
    labelY: 352,
    color: stateColors.TR,
  },
  {
    id: "ML",
    name: "Meghalaya",
    path: "M475,300 L510,295 L530,305 L525,325 L495,330 L475,320 Z",
    labelX: 502,
    labelY: 312,
    color: stateColors.ML,
  },
  {
    id: "WB",
    name: "West Bengal",
    path: "M445,330 L475,320 L495,340 L500,380 L485,420 L465,435 L445,420 L435,380 L430,350 Z",
    labelX: 462,
    labelY: 380,
    color: stateColors.WB,
  },
  {
    id: "JH",
    name: "Jharkhand",
    path: "M375,340 L410,345 L435,355 L430,395 L400,410 L365,395 L355,365 Z",
    labelX: 392,
    labelY: 375,
    color: stateColors.JH,
  },
  {
    id: "OR",
    name: "Odisha",
    path: "M355,400 L400,410 L430,430 L425,480 L385,510 L345,495 L330,450 L335,415 Z",
    labelX: 375,
    labelY: 455,
    color: stateColors.OR,
  },
  {
    id: "CT",
    name: "Chhattisgarh",
    path: "M280,360 L340,355 L355,395 L340,445 L300,465 L260,445 L255,400 Z",
    labelX: 300,
    labelY: 410,
    color: stateColors.CT,
  },
  {
    id: "MP",
    name: "Madhya Pradesh",
    path: "M175,320 L225,300 L280,315 L325,335 L340,355 L280,360 L255,400 L205,395 L165,370 L150,340 Z",
    labelX: 235,
    labelY: 350,
    color: stateColors.MP,
  },
  {
    id: "GJ",
    name: "Gujarat",
    path: "M55,320 L95,310 L135,330 L165,355 L155,400 L130,445 L95,465 L55,440 L35,395 L40,350 Z",
    labelX: 95,
    labelY: 390,
    color: stateColors.GJ,
  },
  {
    id: "MH",
    name: "Maharashtra",
    path: "M130,430 L165,400 L205,395 L260,435 L290,475 L275,530 L220,555 L165,535 L130,495 L120,460 Z",
    labelX: 195,
    labelY: 480,
    color: stateColors.MH,
  },
  {
    id: "GA",
    name: "Goa",
    path: "M145,535 L168,528 L178,550 L162,565 L142,555 Z",
    labelX: 158,
    labelY: 548,
    color: stateColors.GA,
  },
  {
    id: "KA",
    name: "Karnataka",
    path: "M145,560 L180,545 L225,555 L265,545 L280,590 L265,640 L220,665 L170,645 L145,600 Z",
    labelX: 205,
    labelY: 600,
    color: stateColors.KA,
  },
  {
    id: "TG",
    name: "Telangana",
    path: "M260,450 L305,455 L350,475 L365,510 L345,545 L295,545 L265,520 L255,485 Z",
    labelX: 305,
    labelY: 500,
    color: stateColors.TG,
  },
  {
    id: "AP",
    name: "Andhra Pradesh",
    path: "M265,545 L345,545 L385,525 L400,565 L385,620 L340,660 L295,640 L265,590 L265,565 Z",
    labelX: 335,
    labelY: 590,
    color: stateColors.AP,
  },
  {
    id: "TN",
    name: "Tamil Nadu",
    path: "M220,665 L275,645 L325,665 L355,710 L325,750 L270,760 L235,730 L210,695 Z",
    labelX: 280,
    labelY: 710,
    color: stateColors.TN,
  },
  {
    id: "KL",
    name: "Kerala",
    path: "M175,660 L220,665 L230,710 L215,755 L195,770 L175,740 L165,695 Z",
    labelX: 195,
    labelY: 715,
    color: stateColors.KL,
  },
  {
    id: "AN",
    name: "Andaman & Nicobar",
    path: "M520,545 L535,540 L545,580 L540,640 L530,680 L515,675 L510,620 L515,570 Z",
    labelX: 525,
    labelY: 610,
    color: stateColors.AN,
  },
  {
    id: "LD",
    name: "Lakshadweep",
    path: "M95,620 L110,615 L115,650 L105,665 L90,658 Z",
    labelX: 102,
    labelY: 640,
    color: stateColors.LD,
  },
];

const IndiaMap = ({ stateData = defaultStateData, onStateClick, selectedState }: IndiaMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const getImpactColor = (stateId: string) => {
    const state = stateData.find((s) => s.id === stateId);
    if (!state) return stateColors[stateId] || "#E0E0E0";
    return stateColors[stateId] || "#E0E0E0";
  };

  const getStateDataById = (stateId: string) => {
    return stateData.find((s) => s.id === stateId) || statesData.find((s) => s.id === stateId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.3, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMoveForPan = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
      }
    },
    [isPanning, startPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }
    document.addEventListener("mousemove", handleMouseMoveForPan);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
      document.removeEventListener("mousemove", handleMouseMoveForPan);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleWheel, handleMouseMoveForPan, handleMouseUp]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-card/90 backdrop-blur-sm shadow-lg border-border hover:bg-accent"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-card/90 backdrop-blur-sm shadow-lg border-border hover:bg-accent"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="bg-card/90 backdrop-blur-sm shadow-lg border-border hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-20 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm font-medium border border-border shadow-lg">
        Zoom: {Math.round(zoom * 100)}%
      </div>

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
            {getStateDataById(hoveredState)?.name}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-3 h-3 rounded-full border border-gray-400"
              style={{ backgroundColor: getImpactColor(hoveredState) }}
            />
            <span className="text-sm text-muted-foreground">
              Impact Score: {(getStateDataById(hoveredState) as StateData)?.score || "N/A"}%
            </span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        className="overflow-hidden rounded-xl border-2 border-border bg-gradient-to-b from-sky-200 to-sky-300 cursor-grab active:cursor-grabbing"
        style={{ height: "600px" }}
        onMouseDown={handleMouseDown}
      >
        <svg
          viewBox="0 0 650 820"
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.2s ease-out",
          }}
        >
          {/* Water/Ocean Background */}
          <rect x="0" y="0" width="650" height="820" fill="url(#oceanGradient)" />
          
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#00BFFF" />
            </linearGradient>
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Water Body Labels */}
          <text x="35" y="450" className="fill-blue-800 font-bold text-sm" style={{ fontSize: "14px" }}>
            ARABIAN
          </text>
          <text x="45" y="470" className="fill-blue-800 font-bold text-sm" style={{ fontSize: "14px" }}>
            SEA
          </text>
          <text x="420" y="480" className="fill-blue-800 font-bold text-sm" style={{ fontSize: "14px" }}>
            BAY OF
          </text>
          <text x="420" y="500" className="fill-blue-800 font-bold text-sm" style={{ fontSize: "14px" }}>
            BENGAL
          </text>
          <text x="280" y="800" className="fill-blue-800 font-bold text-sm" style={{ fontSize: "14px" }}>
            INDIAN OCEAN
          </text>

          {/* Neighboring Countries */}
          <text x="15" y="100" className="fill-gray-600 font-semibold" style={{ fontSize: "11px" }}>
            PAKISTAN
          </text>
          <text x="15" y="45" className="fill-gray-600 font-semibold" style={{ fontSize: "10px" }}>
            AFGHANISTAN
          </text>
          <text x="340" y="100" className="fill-gray-600 font-semibold" style={{ fontSize: "11px" }}>
            CHINA
          </text>
          <text x="390" y="130" className="fill-gray-600 font-semibold" style={{ fontSize: "10px" }}>
            TIBET
          </text>
          <text x="410" y="195" className="fill-gray-600 font-semibold" style={{ fontSize: "10px" }}>
            NEPAL
          </text>
          <text x="475" y="220" className="fill-gray-600 font-semibold" style={{ fontSize: "10px" }}>
            BHUTAN
          </text>
          <text x="510" y="345" className="fill-gray-600 font-semibold" style={{ fontSize: "10px" }}>
            BANGLADESH
          </text>
          <text x="560" y="410" className="fill-gray-600 font-semibold" style={{ fontSize: "10px" }}>
            MYANMAR
          </text>
          <text x="240" y="790" className="fill-gray-600 font-semibold" style={{ fontSize: "10px" }}>
            SRI LANKA
          </text>

          {/* Title */}
          <text x="520" y="50" className="fill-foreground font-bold" style={{ fontSize: "12px" }}>
            Map of
          </text>
          <text x="520" y="75" className="fill-primary font-black" style={{ fontSize: "24px" }}>
            INDIA
          </text>

          {/* India States */}
          <g filter="url(#dropShadow)">
            {statesData.map((state) => (
              <g key={state.id}>
                <path
                  d={state.path}
                  fill={getImpactColor(state.id)}
                  stroke="#2c3e50"
                  strokeWidth={selectedState === state.id ? 3 : 1.5}
                  className={`transition-all duration-200 ${
                    hoveredState === state.id ? "brightness-110" : ""
                  } ${selectedState === state.id ? "brightness-125" : ""}`}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredState(state.id)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStateClick?.(state.id);
                  }}
                />
              </g>
            ))}
          </g>

          {/* State Labels */}
          {statesData.map((state) => {
            // Shorter names for small states
            const shortNames: Record<string, string> = {
              JK: "J&K",
              HP: "HP",
              PB: "Punjab",
              HR: "Haryana",
              UK: "U'khand",
              DL: "DL",
              RJ: "Rajasthan",
              UP: "Uttar Pradesh",
              BR: "Bihar",
              SK: "SK",
              AS: "Assam",
              AR: "Arunachal",
              NL: "NL",
              MN: "MN",
              MZ: "MZ",
              TR: "TR",
              ML: "Meghalaya",
              WB: "W.Bengal",
              JH: "Jharkhand",
              OR: "Odisha",
              CT: "Chhattisgarh",
              MP: "Madhya Pradesh",
              GJ: "Gujarat",
              MH: "Maharashtra",
              GA: "Goa",
              KA: "Karnataka",
              TG: "Telangana",
              AP: "Andhra Pradesh",
              TN: "Tamil Nadu",
              KL: "Kerala",
              LA: "Ladakh",
              AN: "A&N",
              LD: "LD",
            };

            const displayName = shortNames[state.id] || state.name;
            const fontSize = ["DL", "SK", "GA", "NL", "MN", "MZ", "TR", "LD"].includes(state.id) ? 6 : 8;

            return (
              <text
                key={`label-${state.id}`}
                x={state.labelX}
                y={state.labelY}
                textAnchor="middle"
                className="pointer-events-none font-bold fill-gray-900"
                style={{
                  fontSize: `${fontSize}px`,
                  textShadow: "0 0 3px white, 0 0 3px white",
                }}
              >
                {displayName}
              </text>
            );
          })}

          {/* Capital dots for major cities */}
          <circle cx="218" cy="196" r="3" fill="#000" /> {/* Delhi */}
          <circle cx="95" cy="400" r="2" fill="#000" /> {/* Gandhinagar */}
          <circle cx="165" cy="128" r="2" fill="#000" /> {/* Chandigarh */}
          <circle cx="195" cy="495" r="2" fill="#000" /> {/* Mumbai */}
          <circle cx="210" cy="608" r="2" fill="#000" /> {/* Bengaluru */}
          <circle cx="305" cy="508" r="2" fill="#000" /> {/* Hyderabad */}
          <circle cx="285" cy="720" r="2" fill="#000" /> {/* Chennai */}
          <circle cx="275" cy="270" r="2" fill="#000" /> {/* Lucknow */}
          <circle cx="410" cy="305" r="2" fill="#000" /> {/* Patna */}
          <circle cx="465" cy="395" r="2" fill="#000" /> {/* Kolkata */}

          {/* City Labels */}
          <text x="228" y="200" className="pointer-events-none fill-gray-800" style={{ fontSize: "6px" }}>
            New Delhi
          </text>
          <text x="105" y="405" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Gandhinagar
          </text>
          <text x="170" y="133" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Chandigarh
          </text>
          <text x="205" y="500" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Mumbai
          </text>
          <text x="220" y="612" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Bengaluru
          </text>
          <text x="315" y="512" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Hyderabad
          </text>
          <text x="295" y="725" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Chennai
          </text>
          <text x="285" y="275" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Lucknow
          </text>
          <text x="420" y="310" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Patna
          </text>
          <text x="475" y="400" className="pointer-events-none fill-gray-800" style={{ fontSize: "5px" }}>
            Kolkata
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 p-4 bg-card/80 backdrop-blur-sm rounded-xl border border-border">
        <div className="text-sm font-semibold text-foreground mr-4">State Impact Colors:</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gray-400" style={{ backgroundColor: "#4CAF50" }} />
          <span className="text-sm text-muted-foreground">Green</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gray-400" style={{ backgroundColor: "#FFEB3B" }} />
          <span className="text-sm text-muted-foreground">Yellow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gray-400" style={{ backgroundColor: "#FF9800" }} />
          <span className="text-sm text-muted-foreground">Orange</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gray-400" style={{ backgroundColor: "#F44336" }} />
          <span className="text-sm text-muted-foreground">Red</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gray-400" style={{ backgroundColor: "#E91E63" }} />
          <span className="text-sm text-muted-foreground">Pink</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gray-400" style={{ backgroundColor: "#9C27B0" }} />
          <span className="text-sm text-muted-foreground">Purple</span>
        </div>
      </div>

      <div className="text-center mt-3 text-xs text-muted-foreground">
        🖱️ Scroll to zoom • Drag to pan • Click states for details
      </div>
    </div>
  );
};

export default IndiaMap;
