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

// Distinct bright colors matching the reference image style
const stateColors: Record<string, string> = {
  JK: "#4CAF50",   // Green
  LA: "#9C27B0",   // Purple
  HP: "#FF5722",   // Deep Orange
  PB: "#FFEB3B",   // Yellow
  HR: "#E91E63",   // Pink
  UK: "#00BCD4",   // Cyan
  DL: "#F44336",   // Red
  RJ: "#FFC107",   // Amber
  UP: "#8BC34A",   // Light Green
  BR: "#03A9F4",   // Light Blue
  SK: "#FF9800",   // Orange
  AR: "#673AB7",   // Deep Purple
  NL: "#4CAF50",   // Green
  MN: "#E91E63",   // Pink
  MZ: "#00BCD4",   // Cyan
  TR: "#FFEB3B",   // Yellow
  ML: "#FF5722",   // Deep Orange
  AS: "#9C27B0",   // Purple
  WB: "#2196F3",   // Blue
  JH: "#8BC34A",   // Light Green
  OR: "#FF9800",   // Orange
  CT: "#CDDC39",   // Lime
  MP: "#FF5722",   // Deep Orange
  GJ: "#E91E63",   // Pink
  MH: "#9C27B0",   // Purple
  GA: "#00BCD4",   // Cyan
  KA: "#F44336",   // Red
  TG: "#E91E63",   // Pink
  AP: "#8BC34A",   // Light Green
  TN: "#FFEB3B",   // Yellow
  KL: "#4CAF50",   // Green
  AN: "#03A9F4",   // Light Blue
  LD: "#00BCD4",   // Cyan
  PY: "#FF9800",   // Orange
  DD: "#9C27B0",   // Purple (Daman & Diu)
  DN: "#CDDC39",   // Lime (Dadra & Nagar Haveli)
  CH: "#FF5722",   // Deep Orange (Chandigarh)
};

// Accurate SVG paths for India map states
const statesData = [
  {
    id: "JK",
    name: "Jammu &\nKashmir",
    path: "M165,45 L185,35 L205,40 L225,35 L245,50 L260,75 L255,105 L240,125 L220,115 L200,130 L175,115 L155,125 L135,100 L130,70 L145,55 Z",
    labelX: 180,
    labelY: 80,
  },
  {
    id: "LA",
    name: "Ladakh",
    path: "M245,50 L280,40 L320,55 L340,80 L335,115 L305,130 L275,120 L260,95 L260,75 Z",
    labelX: 290,
    labelY: 85,
  },
  {
    id: "HP",
    name: "Himachal\nPradesh",
    path: "M200,130 L220,115 L245,125 L265,140 L258,165 L240,180 L215,175 L195,185 L175,168 L170,145 Z",
    labelX: 215,
    labelY: 155,
  },
  {
    id: "PB",
    name: "Punjab",
    path: "M135,135 L170,120 L175,150 L195,168 L185,195 L160,205 L130,192 L118,162 Z",
    labelX: 152,
    labelY: 165,
  },
  {
    id: "HR",
    name: "Haryana",
    path: "M160,205 L185,195 L215,190 L238,205 L250,230 L232,255 L200,265 L168,250 L158,225 Z",
    labelX: 198,
    labelY: 228,
  },
  {
    id: "DL",
    name: "Delhi",
    path: "M218,238 L230,230 L240,242 L232,255 L220,252 Z",
    labelX: 228,
    labelY: 245,
  },
  {
    id: "UK",
    name: "Uttarakhand",
    path: "M240,180 L275,165 L310,178 L322,208 L298,235 L268,228 L250,235 L238,210 Z",
    labelX: 275,
    labelY: 205,
  },
  {
    id: "RJ",
    name: "Rajasthan",
    path: "M70,250 L118,225 L158,235 L200,255 L218,295 L205,355 L180,405 L130,428 L80,410 L52,355 L48,295 Z",
    labelX: 125,
    labelY: 335,
  },
  {
    id: "UP",
    name: "Uttar\nPradesh",
    path: "M218,265 L252,245 L298,238 L355,258 L398,305 L405,360 L375,395 L320,410 L268,398 L232,360 L215,315 Z",
    labelX: 305,
    labelY: 330,
  },
  {
    id: "BR",
    name: "Bihar",
    path: "M405,345 L445,320 L485,335 L505,372 L492,415 L450,435 L408,422 L395,385 Z",
    labelX: 448,
    labelY: 378,
  },
  {
    id: "SK",
    name: "Sikkim",
    path: "M482,300 L500,290 L512,308 L502,328 L488,322 Z",
    labelX: 495,
    labelY: 312,
  },
  {
    id: "AS",
    name: "Assam",
    path: "M512,320 L548,308 L595,318 L630,338 L618,370 L588,382 L552,375 L522,382 L505,362 L498,340 Z",
    labelX: 558,
    labelY: 350,
  },
  {
    id: "AR",
    name: "Arunachal\nPradesh",
    path: "M558,255 L610,242 L658,262 L665,305 L628,332 L588,322 L548,310 L540,278 Z",
    labelX: 605,
    labelY: 285,
  },
  {
    id: "NL",
    name: "Nagaland",
    path: "M618,355 L642,345 L662,365 L652,392 L628,382 Z",
    labelX: 638,
    labelY: 368,
  },
  {
    id: "MN",
    name: "Manipur",
    path: "M628,392 L652,392 L662,422 L645,442 L622,430 Z",
    labelX: 640,
    labelY: 415,
  },
  {
    id: "MZ",
    name: "Mizoram",
    path: "M595,432 L620,425 L638,450 L628,492 L602,482 L588,452 Z",
    labelX: 610,
    labelY: 458,
  },
  {
    id: "TR",
    name: "Tripura",
    path: "M568,428 L588,418 L602,445 L590,478 L568,465 Z",
    labelX: 582,
    labelY: 448,
  },
  {
    id: "ML",
    name: "Meghalaya",
    path: "M522,378 L562,370 L592,385 L585,412 L548,420 L520,408 Z",
    labelX: 555,
    labelY: 395,
  },
  {
    id: "WB",
    name: "West\nBengal",
    path: "M492,420 L525,408 L550,432 L558,480 L540,535 L515,555 L490,538 L478,490 L472,448 Z",
    labelX: 512,
    labelY: 485,
  },
  {
    id: "JH",
    name: "Jharkhand",
    path: "M408,430 L450,438 L480,455 L475,505 L440,525 L398,508 L385,468 Z",
    labelX: 432,
    labelY: 475,
  },
  {
    id: "OR",
    name: "Odisha",
    path: "M385,510 L440,525 L478,550 L472,610 L425,650 L378,632 L355,575 L362,525 Z",
    labelX: 418,
    labelY: 580,
  },
  {
    id: "CT",
    name: "Chhattisgarh",
    path: "M305,455 L375,448 L388,498 L372,560 L325,585 L278,562 L268,505 Z",
    labelX: 325,
    labelY: 520,
  },
  {
    id: "MP",
    name: "Madhya\nPradesh",
    path: "M175,400 L235,378 L305,398 L358,422 L375,450 L305,458 L272,510 L212,502 L160,468 L140,430 Z",
    labelX: 252,
    labelY: 445,
  },
  {
    id: "GJ",
    name: "Gujarat",
    path: "M38,405 L80,395 L128,418 L162,450 L150,510 L118,565 L78,590 L35,558 L12,498 L18,445 Z",
    labelX: 85,
    labelY: 495,
  },
  {
    id: "MH",
    name: "Maharashtra",
    path: "M118,548 L162,512 L218,505 L282,552 L318,600 L300,665 L238,695 L168,672 L125,625 L110,578 Z",
    labelX: 208,
    labelY: 608,
  },
  {
    id: "GA",
    name: "Goa",
    path: "M145,678 L172,668 L185,695 L165,715 L140,702 Z",
    labelX: 160,
    labelY: 695,
  },
  {
    id: "KA",
    name: "Karnataka",
    path: "M145,718 L188,698 L245,710 L290,698 L310,752 L292,815 L238,845 L172,822 L142,765 Z",
    labelX: 218,
    labelY: 770,
  },
  {
    id: "TG",
    name: "Telangana",
    path: "M280,568 L335,575 L385,598 L402,645 L378,692 L320,695 L285,665 L270,612 Z",
    labelX: 332,
    labelY: 638,
  },
  {
    id: "AP",
    name: "Andhra\nPradesh",
    path: "M290,700 L378,698 L425,672 L448,722 L430,788 L375,838 L318,815 L288,755 L285,718 Z",
    labelX: 365,
    labelY: 758,
  },
  {
    id: "TN",
    name: "Tamil\nNadu",
    path: "M240,852 L302,828 L362,855 L398,908 L362,958 L298,972 L255,935 L222,888 Z",
    labelX: 308,
    labelY: 905,
  },
  {
    id: "KL",
    name: "Kerala",
    path: "M178,838 L240,852 L252,905 L235,965 L210,985 L178,950 L165,892 Z",
    labelX: 208,
    labelY: 912,
  },
  {
    id: "AN",
    name: "Andaman &\nNicobar",
    path: "M595,705 L615,698 L628,745 L622,820 L608,875 L590,868 L582,795 L588,738 Z",
    labelX: 605,
    labelY: 785,
  },
  {
    id: "LD",
    name: "Lakshadweep",
    path: "M82,800 L102,792 L110,835 L98,860 L78,850 Z",
    labelX: 92,
    labelY: 828,
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

  const getStateColor = (stateId: string) => {
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
          className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-300 hover:bg-gray-100"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-300 hover:bg-gray-100"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-300 hover:bg-gray-100"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm font-medium border border-gray-300 shadow-lg text-gray-700">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Tooltip */}
      {hoveredState && (
        <div
          className="fixed z-50 px-4 py-3 rounded-lg bg-white shadow-xl border border-gray-200 pointer-events-none"
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y - 10,
          }}
        >
          <div className="font-bold text-gray-900 text-lg">
            {getStateDataById(hoveredState)?.name?.replace(/\n/g, " ")}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-4 h-4 rounded border border-gray-400"
              style={{ backgroundColor: getStateColor(hoveredState) }}
            />
            <span className="text-sm text-gray-600">
              Impact Score: {stateData.find(s => s.id === hoveredState)?.score || "N/A"}
            </span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        className="relative overflow-hidden rounded-xl bg-sky-100 cursor-grab active:cursor-grabbing"
        style={{ height: "600px" }}
        onMouseDown={handleMouseDown}
      >
        <svg
          viewBox="0 0 700 1020"
          className="w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.2s ease-out",
          }}
          onMouseMove={handleMouseMove}
        >
          {/* Water body background effect */}
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#B0E0E6" />
            </linearGradient>
          </defs>

          {/* Bay of Bengal label */}
          <text
            x="520"
            y="650"
            fill="#4682B4"
            fontSize="18"
            fontWeight="500"
            fontStyle="italic"
            opacity="0.8"
          >
            Bay of Bengal
          </text>

          {/* Arabian Sea label */}
          <text
            x="20"
            y="700"
            fill="#4682B4"
            fontSize="18"
            fontWeight="500"
            fontStyle="italic"
            opacity="0.8"
          >
            Arabian Sea
          </text>

          {/* Indian Ocean label */}
          <text
            x="280"
            y="990"
            fill="#4682B4"
            fontSize="16"
            fontWeight="500"
            fontStyle="italic"
            opacity="0.8"
          >
            Indian Ocean
          </text>

          {/* Neighboring countries */}
          <text x="100" y="30" fill="#666" fontSize="14" fontWeight="600">
            PAKISTAN
          </text>
          <text x="350" y="25" fill="#666" fontSize="14" fontWeight="600">
            CHINA
          </text>
          <text x="630" y="280" fill="#666" fontSize="12" fontWeight="600">
            MYANMAR
          </text>
          <text x="500" y="540" fill="#666" fontSize="12" fontWeight="600">
            BANGLADESH
          </text>
          <text x="268" y="145" fill="#666" fontSize="12" fontWeight="600">
            NEPAL
          </text>
          <text x="490" y="285" fill="#666" fontSize="10" fontWeight="600">
            BHUTAN
          </text>
          <text x="165" y="1000" fill="#666" fontSize="12" fontWeight="600">
            SRI LANKA
          </text>

          {/* India Outline Border - drawn first as background */}
          <path
            d={statesData.map(s => s.path).join(' ')}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="4"
            strokeLinejoin="round"
            className="pointer-events-none"
          />

          {/* States with prominent borders */}
          <g>
            {statesData.map((state) => (
              <g key={state.id}>
                {/* State shape with thick border */}
                <path
                  d={state.path}
                  fill={getStateColor(state.id)}
                  stroke="#1a1a1a"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    filter: hoveredState === state.id ? "brightness(1.15)" : 
                            selectedState === state.id ? "brightness(0.9)" : "none",
                    transform: hoveredState === state.id ? "scale(1.02)" : "scale(1)",
                    transformOrigin: `${state.labelX}px ${state.labelY}px`,
                  }}
                  onMouseEnter={() => setHoveredState(state.id)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => onStateClick?.(state.id)}
                />
                
                {/* State name label */}
                <text
                  x={state.labelX}
                  y={state.labelY}
                  textAnchor="middle"
                  fontSize={state.id === "DL" || state.id === "GA" || state.id === "SK" ? "6" : 
                           state.id === "LD" || state.id === "PY" ? "7" : "9"}
                  fontWeight="700"
                  fill="#1a1a1a"
                  className="pointer-events-none select-none"
                  style={{
                    textShadow: "0px 0px 3px white, 0px 0px 3px white, 0px 0px 3px white",
                  }}
                >
                  {state.name.split('\n').map((line, i) => (
                    <tspan
                      key={i}
                      x={state.labelX}
                      dy={i === 0 ? 0 : "1.1em"}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            ))}
          </g>

          {/* India Country Outline - thick outer border */}
          <path
            d="M165,45 L185,35 L205,40 L225,35 L245,50 L280,40 L320,55 L340,80 L335,115 L305,130 L275,120 L260,95 L260,75 L260,105 L240,125 L265,140 L310,178 L322,208 L355,258 L398,305 L445,320 L485,335 L512,308 L548,308 L595,318 L658,262 L665,305 L662,365 L662,422 L638,450 L628,492 L590,478 L568,465 L540,535 L515,555 L478,550 L440,525 L425,650 L448,722 L430,788 L398,908 L362,958 L298,972 L210,985 L165,892 L142,765 L145,718 L140,702 L110,578 L78,590 L12,498 L18,445 L38,405 L48,295 L70,250 L118,225 L135,135 L130,70 L145,55 Z"
            fill="none"
            stroke="#000000"
            strokeWidth="5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="pointer-events-none"
          />

          {/* Capital Cities Markers */}
          <g>
            {/* New Delhi */}
            <circle cx="228" cy="245" r="5" fill="#FF0000" stroke="#000" strokeWidth="2" />
            <text x="228" y="262" textAnchor="middle" fontSize="8" fontWeight="700" fill="#000">
              New Delhi ★
            </text>
          </g>
        </svg>
      </div>

      {/* Map Title */}
      <div className="text-center mt-4">
        <h3 className="text-xl font-bold text-gray-800">INDIA - Political Map</h3>
        <p className="text-sm text-gray-500 mt-1">States and Union Territories</p>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 border border-gray-200 shadow">
        <p>🖱️ Scroll to zoom • Drag to pan • Click state for details</p>
      </div>
    </div>
  );
};

export default IndiaMap;
