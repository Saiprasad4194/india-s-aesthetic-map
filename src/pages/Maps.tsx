import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, TrendingUp, AlertTriangle, Minus, Gauge, Users, Factory, AlertCircle, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAnalysisData, getAIResult, type AIAnalysisResult, type AnalysisData } from "@/lib/analysisStore";
import indiaMap from "@/assets/india-states-map.png";

type RiskLevel = "low" | "medium" | "high";

type OverlayMetric = "overall" | "gdp" | "jobs" | "industryCost" | "msme" | "policyRisk";

// Impact data for each state (base configuration)
const BASE_STATE_IMPACT_DATA: Record<string, {
  name: string;
  impact: "positive" | "neutral" | "risk";
  positivePercent: number;
  neutralPercent: number;
  riskPercent: number;
  keyInsight: string;
  // New detailed scores (out of 10)
  economicScore: number;
  socialScore: number;
  environmentalScore: number;
  employmentScore: number;
  // Sector-wise impact (percentage change)
  sectors: Array<{
    sector: string;
    change: number; // -10 to +20
  }>;
  stakeholders: string[];
  infraReadiness: number; // 0-100
  riskLevel: RiskLevel;
  riskDrivers: string[];
  timeline: Array<{ year: number; label: string }>;
}> = {
  "Jammu & Kashmir": {
    name: "Jammu & Kashmir", impact: "neutral", positivePercent: 35, neutralPercent: 45, riskPercent: 20,
    keyInsight: "Geographic challenges require extended compliance",
    economicScore: 5, socialScore: 6, environmentalScore: 7, employmentScore: 5,
    sectors: [
      { sector: "Tourism", change: 4 },
      { sector: "Agriculture", change: 1 },
      { sector: "Retail", change: 2 },
    ],
    stakeholders: ["Small Businesses", "Tourism Operators", "Local Traders"],
    infraReadiness: 58,
    riskLevel: "medium",
    riskDrivers: ["Mountainous terrain", "Patchy digital connectivity"],
    timeline: [
      { year: 1, label: "Extended compliance support" },
      { year: 3, label: "Tourism-led formalisation" },
      { year: 5, label: "Stabilised digital adoption" },
    ],
  },
  "Ladakh": {
    name: "Ladakh", impact: "neutral", positivePercent: 30, neutralPercent: 50, riskPercent: 20,
    keyInsight: "Limited infrastructure needs special provisions",
    economicScore: 4, socialScore: 5, environmentalScore: 8, employmentScore: 4,
    sectors: [
      { sector: "Tourism", change: 3 },
      { sector: "Logistics", change: 2 },
      { sector: "Defense Services", change: 1 },
    ],
    stakeholders: ["Local MSMEs", "Transport Companies"],
    infraReadiness: 52,
    riskLevel: "medium",
    riskDrivers: ["Sparse population", "Harsh climate"],
    timeline: [
      { year: 1, label: "Policy adjustment to terrain" },
      { year: 3, label: "Digital infra build-out" },
      { year: 5, label: "Tourism and logistics benefit" },
    ],
  },
  "Himachal Pradesh": {
    name: "Himachal Pradesh", impact: "positive", positivePercent: 65, neutralPercent: 25, riskPercent: 10,
    keyInsight: "Strong tourism sector benefits",
    economicScore: 7, socialScore: 7, environmentalScore: 6, employmentScore: 7,
    sectors: [
      { sector: "Tourism", change: 8 },
      { sector: "Manufacturing", change: 3 },
      { sector: "Agriculture", change: 2 },
    ],
    stakeholders: ["Tourism MSMEs", "Small Businesses", "Women Entrepreneurs"],
    infraReadiness: 72,
    riskLevel: "low",
    riskDrivers: ["Seasonal connectivity in hill districts"],
    timeline: [
      { year: 1, label: "Tourism compliance handholding" },
      { year: 3, label: "Higher GST credit uptake" },
      { year: 5, label: "Formalisation-led job stability" },
    ],
  },
  "Punjab": {
    name: "Punjab", impact: "positive", positivePercent: 70, neutralPercent: 20, riskPercent: 10,
    keyInsight: "Agricultural reforms boost growth",
    economicScore: 8, socialScore: 7, environmentalScore: 5, employmentScore: 7,
    sectors: [
      { sector: "Agriculture", change: 6 },
      { sector: "Food Processing", change: 7 },
      { sector: "Logistics", change: 5 },
    ],
    stakeholders: ["Farmers", "Agri MSMEs", "Logistics Operators"],
    infraReadiness: 78,
    riskLevel: "low",
    riskDrivers: ["Dependence on agri subsidies"],
    timeline: [
      { year: 1, label: "Farmer onboarding to GST credits" },
      { year: 3, label: "Agri supply-chain formalisation" },
      { year: 5, label: "Value-added exports rise" },
    ],
  },
  "Uttarakhand": {
    name: "Uttarakhand", impact: "positive", positivePercent: 60, neutralPercent: 30, riskPercent: 10,
    keyInsight: "Eco-tourism and pharma sectors gain",
    economicScore: 7, socialScore: 7, environmentalScore: 7, employmentScore: 6,
    sectors: [
      { sector: "Tourism", change: 7 },
      { sector: "Pharma", change: 6 },
      { sector: "Hydro Power", change: 3 },
    ],
    stakeholders: ["Tourism MSMEs", "Industrial Units"],
    infraReadiness: 74,
    riskLevel: "low",
    riskDrivers: ["Hilly districts need extra support"],
    timeline: [
      { year: 1, label: "Tourism sector pilot" },
      { year: 3, label: "Industrial zones fully compliant" },
      { year: 5, label: "Balanced eco-growth achieved" },
    ],
  },
  "Haryana": {
    name: "Haryana", impact: "positive", positivePercent: 72, neutralPercent: 18, riskPercent: 10,
    keyInsight: "Industrial corridor expansion accelerates",
    economicScore: 8, socialScore: 6, environmentalScore: 5, employmentScore: 8,
    sectors: [
      { sector: "Manufacturing", change: 9 },
      { sector: "Logistics", change: 6 },
      { sector: "IT/Services", change: 4 },
    ],
    stakeholders: ["Manufacturing MSMEs", "Transport Companies"],
    infraReadiness: 82,
    riskLevel: "low",
    riskDrivers: ["Urban-rural digital gap"],
    timeline: [
      { year: 1, label: "Industrial belt onboarding" },
      { year: 3, label: "Job-rich manufacturing growth" },
      { year: 5, label: "Integrated logistics benefits" },
    ],
  },
  "Delhi": {
    name: "Delhi", impact: "positive", positivePercent: 78, neutralPercent: 15, riskPercent: 7,
    keyInsight: "Service sector leads adoption",
    economicScore: 9, socialScore: 8, environmentalScore: 4, employmentScore: 8,
    sectors: [
      { sector: "Services", change: 10 },
      { sector: "Retail", change: 6 },
      { sector: "Logistics", change: 5 },
    ],
    stakeholders: ["Small Businesses", "Women Entrepreneurs", "Startups"],
    infraReadiness: 90,
    riskLevel: "low",
    riskDrivers: ["Air pollution compliance costs"],
    timeline: [
      { year: 1, label: "Rapid digital GST adoption" },
      { year: 3, label: "MSME compliance stabilises" },
      { year: 5, label: "Service-led revenue gains" },
    ],
  },
  "Rajasthan": {
    name: "Rajasthan", impact: "neutral", positivePercent: 45, neutralPercent: 35, riskPercent: 20,
    keyInsight: "Mining and tourism see mixed effects",
    economicScore: 6, socialScore: 5, environmentalScore: 5, employmentScore: 6,
    sectors: [
      { sector: "Mining", change: 3 },
      { sector: "Tourism", change: 4 },
      { sector: "Agriculture", change: 2 },
    ],
    stakeholders: ["Mining MSMEs", "Tourism Operators", "Farmers"],
    infraReadiness: 68,
    riskLevel: "medium",
    riskDrivers: ["Sparse districts", "Informal mining clusters"],
    timeline: [
      { year: 1, label: "Compliance pilots in mining belts" },
      { year: 3, label: "Tourism-town digitisation" },
      { year: 5, label: "Balanced sectoral gains" },
    ],
  },
  "Uttar Pradesh": {
    name: "Uttar Pradesh", impact: "risk", positivePercent: 30, neutralPercent: 35, riskPercent: 35,
    keyInsight: "Large informal sector needs support",
    economicScore: 5, socialScore: 5, environmentalScore: 4, employmentScore: 6,
    sectors: [
      { sector: "Manufacturing", change: 5 },
      { sector: "Agriculture", change: 2 },
      { sector: "Retail", change: 1 },
    ],
    stakeholders: ["Small Businesses", "Informal Workers", "Farmers"],
    infraReadiness: 62,
    riskLevel: "high",
    riskDrivers: ["High informal share", "District-wise infra gaps"],
    timeline: [
      { year: 1, label: "Intensive handholding in key districts" },
      { year: 3, label: "Gradual formalisation of MSMEs" },
      { year: 5, label: "Converging towards national average" },
    ],
  },
  "Bihar": {
    name: "Bihar", impact: "risk", positivePercent: 25, neutralPercent: 35, riskPercent: 40,
    keyInsight: "Infrastructure gaps pose challenges",
    economicScore: 4, socialScore: 5, environmentalScore: 4, employmentScore: 5,
    sectors: [
      { sector: "Agriculture", change: 1 },
      { sector: "Construction", change: 2 },
      { sector: "Retail", change: 1 },
    ],
    stakeholders: ["Farmers", "Rural MSMEs", "Transport Companies"],
    infraReadiness: 45,
    riskLevel: "high",
    riskDrivers: ["Low digital adoption", "High dependency on agriculture"],
    timeline: [
      { year: 1, label: "Policy adjustment & capacity building" },
      { year: 3, label: "Digital infra catch-up" },
      { year: 5, label: "Improved employment in formal MSMEs" },
    ],
  },
  "Sikkim": {
    name: "Sikkim", impact: "positive", positivePercent: 68, neutralPercent: 22, riskPercent: 10,
    keyInsight: "Organic farming policies align well",
    economicScore: 7, socialScore: 8, environmentalScore: 8, employmentScore: 6,
    sectors: [
      { sector: "Organic Agriculture", change: 7 },
      { sector: "Tourism", change: 5 },
      { sector: "Retail", change: 3 },
    ],
    stakeholders: ["Farmers", "Tourism MSMEs"],
    infraReadiness: 76,
    riskLevel: "low",
    riskDrivers: ["Mountain terrain logistics"],
    timeline: [
      { year: 1, label: "Organic clusters onboarded" },
      { year: 3, label: "Premium export markets accessed" },
      { year: 5, label: "Stable eco-friendly growth" },
    ],
  },
  "Arunachal Pradesh": {
    name: "Arunachal Pradesh", impact: "neutral", positivePercent: 40, neutralPercent: 40, riskPercent: 20,
    keyInsight: "Border development initiatives benefit",
    economicScore: 5, socialScore: 5, environmentalScore: 7, employmentScore: 5,
    sectors: [
      { sector: "Border Trade", change: 3 },
      { sector: "Hydro Power", change: 4 },
      { sector: "Agriculture", change: 1 },
    ],
    stakeholders: ["Border Traders", "Rural MSMEs"],
    infraReadiness: 54,
    riskLevel: "medium",
    riskDrivers: ["Difficult terrain", "Low penetration of GST advisors"],
    timeline: [
      { year: 1, label: "Targeted border town support" },
      { year: 3, label: "Hydro projects formalised" },
      { year: 5, label: "Sustained cross-border trade flows" },
    ],
  },
  "Nagaland": {
    name: "Nagaland", impact: "neutral", positivePercent: 38, neutralPercent: 42, riskPercent: 20,
    keyInsight: "Special provisions maintained",
    economicScore: 5, socialScore: 6, environmentalScore: 6, employmentScore: 5,
    sectors: [
      { sector: "Handloom", change: 3 },
      { sector: "Agriculture", change: 2 },
      { sector: "Retail", change: 1 },
    ],
    stakeholders: ["Artisans", "Farmers", "Small Traders"],
    infraReadiness: 52,
    riskLevel: "medium",
    riskDrivers: ["Remote districts", "Small enterprise scale"],
    timeline: [
      { year: 1, label: "Handloom cluster pilots" },
      { year: 3, label: "Digital GST support centres" },
      { year: 5, label: "Improved market access" },
    ],
  },
  "Manipur": {
    name: "Manipur", impact: "neutral", positivePercent: 35, neutralPercent: 45, riskPercent: 20,
    keyInsight: "Handloom sector sees opportunities",
    economicScore: 5, socialScore: 6, environmentalScore: 6, employmentScore: 5,
    sectors: [
      { sector: "Handloom", change: 4 },
      { sector: "Agriculture", change: 2 },
      { sector: "Retail", change: 1 },
    ],
    stakeholders: ["Women Entrepreneurs", "Artisans"],
    infraReadiness: 50,
    riskLevel: "medium",
    riskDrivers: ["Security-linked disruptions", "Digital infra gaps"],
    timeline: [
      { year: 1, label: "Women entrepreneur onboarding" },
      { year: 3, label: "Handloom export readiness" },
      { year: 5, label: "Stable MSME growth" },
    ],
  },
  "Mizoram": {
    name: "Mizoram", impact: "positive", positivePercent: 55, neutralPercent: 35, riskPercent: 10,
    keyInsight: "Bamboo industry expansion benefits",
    economicScore: 6, socialScore: 6, environmentalScore: 8, employmentScore: 6,
    sectors: [
      { sector: "Bamboo Products", change: 7 },
      { sector: "Agriculture", change: 3 },
      { sector: "Retail", change: 2 },
    ],
    stakeholders: ["Farmers", "Forest-based MSMEs"],
    infraReadiness: 64,
    riskLevel: "medium",
    riskDrivers: ["Hilly terrain", "Market access distance"],
    timeline: [
      { year: 1, label: "Bamboo cluster incentives" },
      { year: 3, label: "Processing units formalised" },
      { year: 5, label: "Export-oriented bamboo products" },
    ],
  },
  "Tripura": {
    name: "Tripura", impact: "neutral", positivePercent: 42, neutralPercent: 40, riskPercent: 18,
    keyInsight: "Rubber and tea sectors stable",
    economicScore: 6, socialScore: 6, environmentalScore: 6, employmentScore: 5,
    sectors: [
      { sector: "Rubber", change: 4 },
      { sector: "Tea", change: 3 },
      { sector: "Logistics", change: 2 },
    ],
    stakeholders: ["Plantation Owners", "MSMEs", "Transport Companies"],
    infraReadiness: 60,
    riskLevel: "medium",
    riskDrivers: ["Landlocked logistics", "Small MSME base"],
    timeline: [
      { year: 1, label: "Plantation GST awareness drives" },
      { year: 3, label: "Integrated logistics nodes" },
      { year: 5, label: "Stable export channels" },
    ],
  },
  "Meghalaya": {
    name: "Meghalaya", impact: "positive", positivePercent: 58, neutralPercent: 30, riskPercent: 12,
    keyInsight: "Mining reforms create opportunities",
    economicScore: 6, socialScore: 6, environmentalScore: 5, employmentScore: 6,
    sectors: [
      { sector: "Mining", change: 4 },
      { sector: "Tourism", change: 5 },
      { sector: "Agriculture", change: 2 },
    ],
    stakeholders: ["Miners", "Tourism Operators"],
    infraReadiness: 62,
    riskLevel: "medium",
    riskDrivers: ["Informal mining practices", "Eco-sensitivity"],
    timeline: [
      { year: 1, label: "Mining compliance restructuring" },
      { year: 3, label: "Tourism visibility improves" },
      { year: 5, label: "Safer, formal mining operations" },
    ],
  },
  "Assam": {
    name: "Assam", impact: "neutral", positivePercent: 45, neutralPercent: 35, riskPercent: 20,
    keyInsight: "Tea industry modernization ongoing",
    economicScore: 6, socialScore: 6, environmentalScore: 6, employmentScore: 6,
    sectors: [
      { sector: "Tea", change: 5 },
      { sector: "Oil & Gas", change: 3 },
      { sector: "Logistics", change: 3 },
    ],
    stakeholders: ["Plantation MSMEs", "Transport Companies"],
    infraReadiness: 66,
    riskLevel: "medium",
    riskDrivers: ["Flood-prone districts", "Remote tea estates"],
    timeline: [
      { year: 1, label: "Tea estate GST pilots" },
      { year: 3, label: "Logistics corridor strengthening" },
      { year: 5, label: "Diversified industrial base" },
    ],
  },
  "West Bengal": {
    name: "West Bengal", impact: "neutral", positivePercent: 48, neutralPercent: 32, riskPercent: 20,
    keyInsight: "Jute and IT sectors see mixed impact",
    economicScore: 6, socialScore: 6, environmentalScore: 5, employmentScore: 6,
    sectors: [
      { sector: "Jute", change: 3 },
      { sector: "IT/Services", change: 5 },
      { sector: "Logistics", change: 4 },
    ],
    stakeholders: ["Jute MSMEs", "IT Startups", "Port Logistics Operators"],
    infraReadiness: 72,
    riskLevel: "medium",
    riskDrivers: ["Legacy informal sectors", "Urban-rural gap"],
    timeline: [
      { year: 1, label: "Kolkata MSME digitisation" },
      { year: 3, label: "Jute sector restructuring" },
      { year: 5, label: "Balanced services growth" },
    ],
  },
  "Jharkhand": {
    name: "Jharkhand", impact: "risk", positivePercent: 32, neutralPercent: 33, riskPercent: 35,
    keyInsight: "Mining sector transition challenges",
    economicScore: 5, socialScore: 4, environmentalScore: 4, employmentScore: 5,
    sectors: [
      { sector: "Mining", change: 2 },
      { sector: "Steel", change: 3 },
      { sector: "Logistics", change: 2 },
    ],
    stakeholders: ["Mining Workers", "Industrial MSMEs"],
    infraReadiness: 52,
    riskLevel: "high",
    riskDrivers: ["High single-sector reliance", "Worker reskilling needs"],
    timeline: [
      { year: 1, label: "Mining transition roadmap" },
      { year: 3, label: "Alternate MSME clusters" },
      { year: 5, label: "Diversified employment base" },
    ],
  },
  "Odisha": {
    name: "Odisha", impact: "positive", positivePercent: 62, neutralPercent: 25, riskPercent: 13,
    keyInsight: "Steel and mining growth continues",
    economicScore: 7, socialScore: 6, environmentalScore: 5, employmentScore: 7,
    sectors: [
      { sector: "Steel", change: 7 },
      { sector: "Mining", change: 5 },
      { sector: "Port Logistics", change: 4 },
    ],
    stakeholders: ["Industrial MSMEs", "Port Operators"],
    infraReadiness: 70,
    riskLevel: "medium",
    riskDrivers: ["Environmental clearances", "Peripheral district gaps"],
    timeline: [
      { year: 1, label: "Industrial tax-credit alignment" },
      { year: 3, label: "Port-led logistics expansion" },
      { year: 5, label: "Higher formal job creation" },
    ],
  },
  "Chhattisgarh": {
    name: "Chhattisgarh", impact: "neutral", positivePercent: 45, neutralPercent: 35, riskPercent: 20,
    keyInsight: "Industrial diversification needed",
    economicScore: 6, socialScore: 5, environmentalScore: 5, employmentScore: 6,
    sectors: [
      { sector: "Steel", change: 4 },
      { sector: "Mining", change: 3 },
      { sector: "Agriculture", change: 2 },
    ],
    stakeholders: ["Industrial MSMEs", "Farmers"],
    infraReadiness: 62,
    riskLevel: "medium",
    riskDrivers: ["Tribal district access", "Industrial concentration"],
    timeline: [
      { year: 1, label: "District-wise infra mapping" },
      { year: 3, label: "New MSME clusters promoted" },
      { year: 5, label: "Balanced growth across sectors" },
    ],
  },
  "Madhya Pradesh": {
    name: "Madhya Pradesh", impact: "neutral", positivePercent: 50, neutralPercent: 30, riskPercent: 20,
    keyInsight: "Agricultural reforms show promise",
    economicScore: 6, socialScore: 6, environmentalScore: 5, employmentScore: 6,
    sectors: [
      { sector: "Agriculture", change: 4 },
      { sector: "Manufacturing", change: 4 },
      { sector: "Tourism", change: 3 },
    ],
    stakeholders: ["Farmers", "MSMEs", "Women Entrepreneurs"],
    infraReadiness: 68,
    riskLevel: "medium",
    riskDrivers: ["Large geography", "Rural digital gap"],
    timeline: [
      { year: 1, label: "Agri-market GST pilots" },
      { year: 3, label: "Industrial corridor activation" },
      { year: 5, label: "Formalisation across districts" },
    ],
  },
  "Gujarat": {
    name: "Gujarat", impact: "positive", positivePercent: 82, neutralPercent: 12, riskPercent: 6,
    keyInsight: "Manufacturing hub leads compliance",
    economicScore: 9, socialScore: 8, environmentalScore: 6, employmentScore: 9,
    sectors: [
      { sector: "Manufacturing", change: 12 },
      { sector: "Logistics", change: 8 },
      { sector: "Ports", change: 7 },
    ],
    stakeholders: ["Manufacturing MSMEs", "Exporters", "Logistics Companies"],
    infraReadiness: 92,
    riskLevel: "low",
    riskDrivers: ["Energy cost volatility"],
    timeline: [
      { year: 1, label: "Immediate tax-credit uptake" },
      { year: 3, label: "Export competitiveness jump" },
      { year: 5, label: "Highest manufacturing growth" },
    ],
  },
  "Maharashtra": {
    name: "Maharashtra", impact: "positive", positivePercent: 85, neutralPercent: 10, riskPercent: 5,
    keyInsight: "Financial services drive adoption",
    economicScore: 9, socialScore: 8, environmentalScore: 6, employmentScore: 9,
    sectors: [
      { sector: "Financial Services", change: 10 },
      { sector: "Manufacturing", change: 9 },
      { sector: "Logistics", change: 6 },
      { sector: "Retail", change: 4 },
    ],
    stakeholders: ["MSMEs", "Women Entrepreneurs", "Startups", "Transport Companies"],
    infraReadiness: 88,
    riskLevel: "low",
    riskDrivers: ["Urban-rural readiness gap"],
    timeline: [
      { year: 1, label: "Metro MSMEs adopt quickly" },
      { year: 3, label: "Manufacturing belts accelerate" },
      { year: 5, label: "Nation-leading job creation" },
    ],
  },
  "Goa": {
    name: "Goa", impact: "positive", positivePercent: 75, neutralPercent: 18, riskPercent: 7,
    keyInsight: "Tourism and IT sectors thrive",
    economicScore: 8, socialScore: 8, environmentalScore: 6, employmentScore: 7,
    sectors: [
      { sector: "Tourism", change: 9 },
      { sector: "IT/Services", change: 6 },
      { sector: "Retail", change: 4 },
    ],
    stakeholders: ["Tourism MSMEs", "Women Entrepreneurs"],
    infraReadiness: 86,
    riskLevel: "low",
    riskDrivers: ["Seasonal demand swings"],
    timeline: [
      { year: 1, label: "Tourism MSMEs digitised" },
      { year: 3, label: "IT corridor matures" },
      { year: 5, label: "Stable year-round employment" },
    ],
  },
  "Karnataka": {
    name: "Karnataka", impact: "positive", positivePercent: 88, neutralPercent: 8, riskPercent: 4,
    keyInsight: "Tech industry accelerates compliance",
    economicScore: 9, socialScore: 9, environmentalScore: 6, employmentScore: 9,
    sectors: [
      { sector: "IT/Services", change: 12 },
      { sector: "Startups", change: 14 },
      { sector: "Manufacturing", change: 7 },
    ],
    stakeholders: ["Startups", "Women Entrepreneurs", "MSMEs"],
    infraReadiness: 92,
    riskLevel: "low",
    riskDrivers: ["Bengaluru congestion costs"],
    timeline: [
      { year: 1, label: "Instant digital compliance" },
      { year: 3, label: "Startup-led innovation" },
      { year: 5, label: "High-tech employment surge" },
    ],
  },
  "Kerala": {
    name: "Kerala", impact: "positive", positivePercent: 76, neutralPercent: 17, riskPercent: 7,
    keyInsight: "Healthcare and tourism see gains",
    economicScore: 8, socialScore: 9, environmentalScore: 7, employmentScore: 7,
    sectors: [
      { sector: "Healthcare", change: 8 },
      { sector: "Tourism", change: 7 },
      { sector: "Remittance Services", change: 4 },
    ],
    stakeholders: ["Healthcare MSMEs", "Tourism Operators"],
    infraReadiness: 84,
    riskLevel: "low",
    riskDrivers: ["Aging population dynamics"],
    timeline: [
      { year: 1, label: "Hospitals and clinics onboarded" },
      { year: 3, label: "Tourism destinations formalised" },
      { year: 5, label: "Stable, inclusive growth" },
    ],
  },
  "Tamil Nadu": {
    name: "Tamil Nadu", impact: "positive", positivePercent: 80, neutralPercent: 14, riskPercent: 6,
    keyInsight: "Auto and textile sectors benefit",
    economicScore: 9, socialScore: 8, environmentalScore: 6, employmentScore: 9,
    sectors: [
      { sector: "Automobiles", change: 11 },
      { sector: "Textiles", change: 9 },
      { sector: "Electronics", change: 8 },
    ],
    stakeholders: ["Manufacturing MSMEs", "Women Workers"],
    infraReadiness: 90,
    riskLevel: "low",
    riskDrivers: ["Coastal climate risks"],
    timeline: [
      { year: 1, label: "Industrial clusters aligned" },
      { year: 3, label: "Supply-chain deepening" },
      { year: 5, label: "High-skilled job expansion" },
    ],
  },
  "Andhra Pradesh": {
    name: "Andhra Pradesh", impact: "positive", positivePercent: 70, neutralPercent: 20, riskPercent: 10,
    keyInsight: "Pharma and IT growth accelerates",
    economicScore: 8, socialScore: 7, environmentalScore: 6, employmentScore: 8,
    sectors: [
      { sector: "Pharma", change: 9 },
      { sector: "IT/Services", change: 7 },
      { sector: "Agriculture", change: 3 },
    ],
    stakeholders: ["Industrial MSMEs", "Farmers"],
    infraReadiness: 80,
    riskLevel: "low",
    riskDrivers: ["New capital region build-out"],
    timeline: [
      { year: 1, label: "Pharma hubs benefit first" },
      { year: 3, label: "IT corridor consolidates" },
      { year: 5, label: "Agriculture supply-chains modernise" },
    ],
  },
  "Telangana": {
    name: "Telangana", impact: "positive", positivePercent: 83, neutralPercent: 12, riskPercent: 5,
    keyInsight: "Hyderabad IT hub leads digital adoption",
    economicScore: 9, socialScore: 8, environmentalScore: 6, employmentScore: 9,
    sectors: [
      { sector: "IT/Services", change: 12 },
      { sector: "Startups", change: 13 },
      { sector: "Pharma", change: 9 },
    ],
    stakeholders: ["Startups", "Women Entrepreneurs", "MSMEs"],
    infraReadiness: 90,
    riskLevel: "low",
    riskDrivers: ["Urban concentration risk"],
    timeline: [
      { year: 1, label: "IT & startup ecosystem scales" },
      { year: 3, label: "Spillover to tier-2 cities" },
      { year: 5, label: "High-tech employment plateau" },
    ],
  },
  "Andaman & Nicobar": {
    name: "Andaman & Nicobar", impact: "neutral", positivePercent: 45, neutralPercent: 40, riskPercent: 15,
    keyInsight: "Island development initiatives ongoing",
    economicScore: 6, socialScore: 6, environmentalScore: 7, employmentScore: 5,
    sectors: [
      { sector: "Tourism", change: 5 },
      { sector: "Logistics", change: 3 },
      { sector: "Fisheries", change: 3 },
    ],
    stakeholders: ["Tourism MSMEs", "Fisherfolk"],
    infraReadiness: 60,
    riskLevel: "medium",
    riskDrivers: ["Island logistics", "Disaster vulnerability"],
    timeline: [
      { year: 1, label: "Tourism and ports pilot" },
      { year: 3, label: "Improved digital infra" },
      { year: 5, label: "Resilient island economy" },
    ],
  },
  "Lakshadweep": {
    name: "Lakshadweep", impact: "neutral", positivePercent: 40, neutralPercent: 45, riskPercent: 15,
    keyInsight: "Tourism potential being developed",
    economicScore: 6, socialScore: 7, environmentalScore: 8, employmentScore: 5,
    sectors: [
      { sector: "Tourism", change: 4 },
      { sector: "Fisheries", change: 3 },
      { sector: "Logistics", change: 2 },
    ],
    stakeholders: ["Fisherfolk", "Tourism MSMEs"],
    infraReadiness: 58,
    riskLevel: "medium",
    riskDrivers: ["Small base of enterprises", "Climate risks"],
    timeline: [
      { year: 1, label: "Tourism infra groundwork" },
      { year: 3, label: "Formalisation of local MSMEs" },
      { year: 5, label: "Sustainable blue economy" },
    ],
  },
  "Dadra & Nagar Haveli": {
    name: "Dadra & Nagar Haveli", impact: "positive", positivePercent: 68, neutralPercent: 22, riskPercent: 10,
    keyInsight: "Industrial zone shows growth",
    economicScore: 8, socialScore: 6, environmentalScore: 5, employmentScore: 8,
    sectors: [
      { sector: "Manufacturing", change: 10 },
      { sector: "Logistics", change: 5 },
      { sector: "Power", change: 3 },
    ],
    stakeholders: ["Industrial MSMEs", "Workers"],
    infraReadiness: 82,
    riskLevel: "low",
    riskDrivers: ["Dependence on external markets"],
    timeline: [
      { year: 1, label: "Industrial estate digitised" },
      { year: 3, label: "Higher job formalisation" },
      { year: 5, label: "Regional manufacturing hub" },
    ],
  },
  "Daman & Diu": {
    name: "Daman & Diu", impact: "positive", positivePercent: 65, neutralPercent: 25, riskPercent: 10,
    keyInsight: "Manufacturing sector benefits",
    economicScore: 8, socialScore: 6, environmentalScore: 5, employmentScore: 7,
    sectors: [
      { sector: "Manufacturing", change: 9 },
      { sector: "Tourism", change: 5 },
      { sector: "Logistics", change: 4 },
    ],
    stakeholders: ["Manufacturing MSMEs", "Tourism Operators"],
    infraReadiness: 80,
    riskLevel: "low",
    riskDrivers: ["Small domestic market size"],
    timeline: [
      { year: 1, label: "Industrial units onboarded" },
      { year: 3, label: "Tourism MSMEs formalised" },
      { year: 5, label: "Export linkages strengthened" },
    ],
  },
  "Puducherry": {
    name: "Puducherry", impact: "positive", positivePercent: 65, neutralPercent: 25, riskPercent: 10,
    keyInsight: "Tourism and education sectors stable",
    economicScore: 7, socialScore: 8, environmentalScore: 6, employmentScore: 6,
    sectors: [
      { sector: "Tourism", change: 7 },
      { sector: "Education", change: 5 },
      { sector: "Retail", change: 3 },
    ],
    stakeholders: ["Tourism MSMEs", "Students", "Women Entrepreneurs"],
    infraReadiness: 78,
    riskLevel: "low",
    riskDrivers: ["Seasonal tourism cycles"],
    timeline: [
      { year: 1, label: "Tourism cluster pilots" },
      { year: 3, label: "Education services formalised" },
      { year: 5, label: "Stable MSME ecosystem" },
    ],
  },
  "Chandigarh": {
    name: "Chandigarh", impact: "positive", positivePercent: 75, neutralPercent: 18, riskPercent: 7,
    keyInsight: "Well-planned city with strong governance",
    economicScore: 8, socialScore: 9, environmentalScore: 6, employmentScore: 7,
    sectors: [
      { sector: "Services", change: 8 },
      { sector: "Government Services", change: 5 },
      { sector: "Retail", change: 4 },
    ],
    stakeholders: ["Small Businesses", "Professionals"],
    infraReadiness: 90,
    riskLevel: "low",
    riskDrivers: ["Limited industrial base"],
    timeline: [
      { year: 1, label: "Administrative compliance first" },
      { year: 3, label: "Service MSMEs stabilise" },
      { year: 5, label: "Model city for implementation" },
    ],
  },
};

// State positions on map (percentage-based for responsiveness)
const statePositions: Record<string, { top: string; left: string }> = {
  "Jammu & Kashmir": { top: "12%", left: "28%" },
  "Ladakh": { top: "10%", left: "38%" },
  "Himachal Pradesh": { top: "20%", left: "32%" },
  "Punjab": { top: "24%", left: "28%" },
  "Uttarakhand": { top: "24%", left: "40%" },
  "Haryana": { top: "28%", left: "30%" },
  "Delhi": { top: "30%", left: "34%" },
  "Rajasthan": { top: "38%", left: "22%" },
  "Uttar Pradesh": { top: "35%", left: "45%" },
  "Bihar": { top: "38%", left: "58%" },
  "Sikkim": { top: "32%", left: "68%" },
  "Arunachal Pradesh": { top: "28%", left: "82%" },
  "Nagaland": { top: "35%", left: "85%" },
  "Manipur": { top: "40%", left: "84%" },
  "Mizoram": { top: "48%", left: "82%" },
  "Tripura": { top: "45%", left: "78%" },
  "Meghalaya": { top: "38%", left: "75%" },
  "Assam": { top: "34%", left: "76%" },
  "West Bengal": { top: "45%", left: "65%" },
  "Jharkhand": { top: "42%", left: "58%" },
  "Odisha": { top: "52%", left: "56%" },
  "Chhattisgarh": { top: "48%", left: "48%" },
  "Madhya Pradesh": { top: "45%", left: "38%" },
  "Gujarat": { top: "48%", left: "20%" },
  "Maharashtra": { top: "55%", left: "32%" },
  "Goa": { top: "72%", left: "24%" },
  "Karnataka": { top: "80%", left: "35%" },
  "Kerala": { top: "88%", left: "30%" },
  "Tamil Nadu": { top: "88%", left: "38%" },
  "Andhra Pradesh": { top: "72%", left: "42%" },
  "Telangana": { top: "60%", left: "38%" },
  "Andaman & Nicobar": { top: "72%", left: "78%" },
  "Lakshadweep": { top: "85%", left: "12%" },
  "Dadra & Nagar Haveli": { top: "56%", left: "24%" },
  "Daman & Diu": { top: "54%", left: "18%" },
  "Puducherry": { top: "87%", left: "44%" },
  "Chandigarh": { top: "22%", left: "26%" },
};

// List of Union Territories
const unionTerritories = [
  "Jammu & Kashmir", "Ladakh", "Delhi", "Chandigarh", "Puducherry", 
  "Andaman & Nicobar", "Lakshadweep", "Dadra & Nagar Haveli", "Daman & Diu"
];

// List of States (excluding UTs)
const states = Object.keys(BASE_STATE_IMPACT_DATA).filter(key => !unionTerritories.includes(key));

const Maps = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [overlayMetric, setOverlayMetric] = useState<OverlayMetric>("overall");

  useEffect(() => {
    setData(getAnalysisData());
    setAiResult(getAIResult());
  }, []);

  // Show map even without running analysis (for demo purposes)
  const shouldShowMap = !data || data.modules.modGeo;

  // Merge base map configuration with latest AI geo analysis for dynamic, law-specific impacts
  const stateImpactData = useMemo(() => {
    const geo = aiResult?.modGeo;
    const aiStateImpacts = geo?.stateImpacts || {};

    return Object.fromEntries(
      Object.entries(BASE_STATE_IMPACT_DATA).map(([key, base]) => {
        const ai = aiStateImpacts[key];

        // Start from base configuration
        let merged = { ...base };

        // If AI provided state-level impact, override headline impact + percentages + key insight
        if (ai) {
          merged = {
            ...merged,
            impact: ai.impact,
            positivePercent: ai.positivePercent,
            neutralPercent: ai.neutralPercent,
            riskPercent: ai.riskPercent,
            keyInsight: ai.keyInsight,
          };
        }

        // Use AI readiness clusters to refine risk level and infra readiness
        if (geo) {
          if (geo.highReadiness?.includes(key)) {
            merged = {
              ...merged,
              riskLevel: "low",
              infraReadiness: Math.max(merged.infraReadiness, 85),
            };
          } else if (geo.mediumReadiness?.includes(key)) {
            merged = {
              ...merged,
              riskLevel: "medium",
              infraReadiness: Math.max(merged.infraReadiness, 65),
            };
          } else if (geo.needSupport?.includes(key)) {
            merged = {
              ...merged,
              riskLevel: "high",
              infraReadiness: Math.min(merged.infraReadiness, 55),
            };
          }
        }

        return [key, merged];
      })
    );
  }, [aiResult]);

  // Calculate summary stats
  const positiveStates = Object.values(stateImpactData).filter(s => s.impact === "positive").length;
  const neutralStates = Object.values(stateImpactData).filter(s => s.impact === "neutral").length;
  const riskStates = Object.values(stateImpactData).filter(s => s.impact === "risk").length;

  const selectedImpact = selectedState ? stateImpactData[selectedState] : null;

  // Read latest simulation result from session storage (for map coupling)
  const simulationResult = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("policySimulation");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const getImpactColor = (impact: "positive" | "neutral" | "risk") => {
    switch (impact) {
      case "positive": return "bg-emerald-500";
      case "neutral": return "bg-amber-500";
      case "risk": return "bg-red-500";
    }
  };

  const getRiskBadge = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "low":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300/60">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300/60">Moderate Risk</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-300/60">High Implementation Risk</Badge>;
    }
  };

  // Map overlay color scale (heatmap style) based on selected metric
  const getMetricValue = (stateKey: string): number => {
    const s = stateImpactData[stateKey];
    if (!s) return 0;

    switch (overlayMetric) {
      case "overall": {
        const base = (s.economicScore + s.socialScore + s.environmentalScore + s.employmentScore) / 4;
        return base * (s.impact === "positive" ? 1.05 : s.impact === "risk" ? 0.95 : 1);
      }
      case "gdp":
        return s.economicScore * 10;
      case "jobs":
        return s.employmentScore * 10;
      case "industryCost":
        // Higher economic score → lower cost, so invert
        return 100 - s.economicScore * 8;
      case "msme":
        return (s.economicScore + s.employmentScore) * 5;
      case "policyRisk":
        return s.riskLevel === "low" ? 20 : s.riskLevel === "medium" ? 60 : 90;
    }
  };

  const getHeatmapColor = (stateKey: string): string => {
    const v = getMetricValue(stateKey);
    // Normalise 0-100 → 0 (red) to 140 (green) in HSL
    const clamped = Math.max(0, Math.min(100, v));
    const hue = 0 + (clamped / 100) * 140;
    const lightness = 45 + (clamped / 100) * 10;
    return `hsl(${hue}, 80%, ${lightness}%)`;
  };

  const quickInsights = useMemo(() => {
    const entries = Object.entries(stateImpactData).map(([key, s]) => {
      const benefitScore = (s.economicScore * 1.3 + s.employmentScore * 1.2 + s.socialScore) -
        (s.riskPercent / 10);
      const challengeScore = s.riskPercent + (s.riskLevel === "high" ? 20 : s.riskLevel === "medium" ? 10 : 0) -
        s.infraReadiness / 10;
      return { key, name: s.name, benefitScore, challengeScore };
    });

    const topBenefiting = [...entries]
      .sort((a, b) => b.benefitScore - a.benefitScore)
      .slice(0, 3);

    const mostChallenged = [...entries]
      .sort((a, b) => b.challengeScore - a.challengeScore)
      .slice(0, 3);

    return { topBenefiting, mostChallenged };
  }, []);

  if (!shouldShowMap) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Geographic Module Not Selected</h2>
              <p className="text-muted-foreground mb-4">
                Please enable the "State / District-wise impact" module in the Input page to view maps.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Go to Input
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Impact Analysis Map</h1>
            <p className="text-muted-foreground">
              State-wise law impact visualization showing economic, social, environmental and employment outcomes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="gap-1">
              <Factory className="w-3 h-3" />
              Manufacturing-heavy states → stronger economic & jobs impact
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              Agriculture-heavy states → stronger farmer & rural impact
            </Badge>
          </div>
        </div>

        {/* Impact Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
            <CardContent className="py-4 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{positiveStates}</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-500">Positive Impact States</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <CardContent className="py-4 text-center">
              <Minus className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{neutralStates}</div>
              <div className="text-sm text-amber-600 dark:text-amber-500">Neutral Impact States</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800">
            <CardContent className="py-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{riskStates}</div>
              <div className="text-sm text-red-600 dark:text-red-500">Risk Area States</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map with Heatmap Overlay */}
          <Card className="lg:col-span-2 shadow-soft animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                India - Impact Analysis Map
              </CardTitle>
              <CardDescription>
                Click on a state hotspot or select from the list to view AI-calculated impact, risks, sectors and stakeholders.
              </CardDescription>
              <div className="mt-3">
                <Tabs value={overlayMetric} onValueChange={(v) => setOverlayMetric(v as OverlayMetric)}>
                  <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-1">
                    <TabsTrigger value="overall" className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      Overall Impact
                    </TabsTrigger>
                    <TabsTrigger value="gdp" className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      GDP Impact
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Job Creation
                    </TabsTrigger>
                    <TabsTrigger value="industryCost" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Industry Cost
                    </TabsTrigger>
                    <TabsTrigger value="policyRisk" className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Policy Risk
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative inline-block">
                <img 
                  src={indiaMap} 
                  alt="India Political Map - States and Union Territories" 
                  className="max-w-full h-auto rounded-lg border border-border"
                  style={{ maxHeight: "600px" }}
                />
                {/* Impact circles overlay (small clickable dots as before) */}
                {Object.entries(stateImpactData).map(([key, state]) => {
                  const position = statePositions[key];
                  if (!position) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedState(key)}
                      className={`absolute z-10 w-4 h-4 rounded-full ${getImpactColor(state.impact)} 
                        border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-150 
                        ${selectedState === key ? "ring-2 ring-primary ring-offset-1 scale-150" : ""}`}
                      style={{ 
                        top: position.top, 
                        left: position.left,
                        transform: "translate(-50%, -50%)"
                      }}
                      title={state.name}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* State Details & Insights Panel */}
          <div className="space-y-4 animate-slide-up">
            {/* Impact Legend */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Impact Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-emerald-500"></div>
                  <span className="text-sm">Positive Impact (High Readiness)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-amber-500"></div>
                  <span className="text-sm">Neutral Impact (Moderate Readiness)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-red-500"></div>
                  <span className="text-sm">Risk Areas (Need Support)</span>
                </div>
              </CardContent>
            </Card>

            {/* State Selector */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Select State</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                <div className="space-y-1">
                  {states.map((key) => {
                    const state = stateImpactData[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedState(key)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                          selectedState === key 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          state.impact === "positive" ? "bg-emerald-500" :
                          state.impact === "neutral" ? "bg-amber-500" : "bg-red-500"
                        }`}></div>
                        {state.name}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Union Territory Selector */}
            <Card className="shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Select Union Territory</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                <div className="space-y-1">
                  {unionTerritories.map((key) => {
                    const ut = stateImpactData[key];
                    if (!ut) return null;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedState(key)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                          selectedState === key 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          ut.impact === "positive" ? "bg-emerald-500" :
                          ut.impact === "neutral" ? "bg-amber-500" : "bg-red-500"
                        }`}></div>
                        {ut.name}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected State Deep-Dive Panel */}
            {selectedImpact ? (
              <Card className="shadow-soft">
                <CardHeader className="pb-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${
                        selectedImpact.impact === "positive" ? "bg-emerald-500" :
                        selectedImpact.impact === "neutral" ? "bg-amber-500" : "bg-red-500"
                      }`}></div>
                      {selectedImpact.name}
                    </CardTitle>
                    {getRiskBadge(selectedImpact.riskLevel)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scores show how this law affects the state&apos;s economy, society, environment, and job market.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="impact">
                    <TabsList className="grid grid-cols-3 mb-3">
                      <TabsTrigger value="impact" className="text-xs">Impact Scores</TabsTrigger>
                      <TabsTrigger value="sectors" className="text-xs">Sector Impact</TabsTrigger>
                      <TabsTrigger value="stakeholders" className="text-xs">Stakeholders & Risk</TabsTrigger>
                    </TabsList>

                    {/* Impact Score Panel */}
                    <TabsContent value="impact" className="space-y-3 mt-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-emerald-700 dark:text-emerald-300">Economic Impact</span>
                            <span className="font-semibold">{selectedImpact.economicScore}/10</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${selectedImpact.economicScore * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-sky-700 dark:text-sky-300">Social Impact</span>
                            <span className="font-semibold">{selectedImpact.socialScore}/10</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full transition-all duration-500"
                              style={{ width: `${selectedImpact.socialScore * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-emerald-900 dark:text-emerald-200">Environmental</span>
                            <span className="font-semibold">{selectedImpact.environmentalScore}/10</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                              style={{ width: `${selectedImpact.environmentalScore * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-indigo-700 dark:text-indigo-300">Employment Impact</span>
                            <span className="font-semibold">{selectedImpact.employmentScore}/10</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${selectedImpact.employmentScore * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">POLICY READINESS & INFRASTRUCTURE</h4>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Infrastructure / digital readiness</span>
                          <span className="font-semibold">{selectedImpact.infraReadiness}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${selectedImpact.infraReadiness}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">KEY INSIGHT</h4>
                        <p className="text-sm">{selectedImpact.keyInsight}</p>
                      </div>
                    </TabsContent>

                    {/* Sector Impact by State */}
                    <TabsContent value="sectors" className="mt-2 space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Sector-wise growth or pressure based on how strongly the law touches each sector in this state.
                      </p>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={selectedImpact.sectors.map((s) => ({
                              sector: s.sector,
                              change: s.change,
                            }))}
                            margin={{ top: 8, right: 8, left: -16, bottom: 16 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="sector" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="change" fill="hsl(153, 60%, 45%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Manufacturing-heavy states show stronger GDP and job growth; agriculture-heavy states see bigger farmer impact.
                      </p>
                    </TabsContent>

                    {/* Stakeholder Impact & Risk Explanation */}
                    <TabsContent value="stakeholders" className="mt-2 space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground">KEY STAKEHOLDER GROUPS</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedImpact.stakeholders.map((s) => (
                            <Badge key={s} variant="outline" className="text-[11px]">
                              {s}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          These groups are identified from the law&apos;s economic and community analysis and mapped to this state based on sector presence.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          POLICY IMPLEMENTATION RISK
                        </h4>
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                          {selectedImpact.riskDrivers.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-muted-foreground">
                          Risk scores combine infrastructure gaps, digital adoption, and dependency on sectors most affected by the law.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-secondary" />
                          TIME-BASED IMPACT PROJECTION
                        </h4>
                        <div className="flex items-center justify-between text-[11px]">
                          {selectedImpact.timeline.map((t, idx) => (
                            <div key={t.year} className="flex-1 flex flex-col items-center">
                              <div className="relative flex items-center justify-center mb-1">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold">
                                  Y{t.year}
                                </div>
                                {idx < selectedImpact.timeline.length - 1 && (
                                  <div className="absolute w-16 h-px bg-border left-full ml-1 top-1/2 hidden sm:block" />
                                )}
                              </div>
                              <span className="text-center">{t.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-8 text-center">
                  <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a state from the list above to view detailed impact analysis
                  </p>
                </CardContent>
              </Card>
            )}

          </div>
        </div>

        {/* Analysis Summary - Full Width Below Map */}
        <Card className="shadow-soft animate-fade-in mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Comprehensive Analysis Summary
            </CardTitle>
            <CardDescription>
              Overview of law impact across all states and union territories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Regions Analyzed</div>
                <div className="text-3xl font-bold text-foreground">{Object.keys(stateImpactData).length}</div>
                <div className="text-xs text-muted-foreground">States & Union Territories</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Average Positive Impact</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {Math.round(Object.values(stateImpactData).reduce((acc, s) => acc + s.positivePercent, 0) / Object.keys(stateImpactData).length)}%
                </div>
                <div className="text-xs text-muted-foreground">Across all regions</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Average Risk Level</div>
                <div className="text-3xl font-bold text-red-600">
                  {Math.round(Object.values(stateImpactData).reduce((acc, s) => acc + s.riskPercent, 0) / Object.keys(stateImpactData).length)}%
                </div>
                <div className="text-xs text-muted-foreground">Requiring attention</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">High Risk Regions</div>
                <div className="text-3xl font-bold text-amber-600">{riskStates}</div>
                <div className="text-xs text-muted-foreground">States needing support</div>
              </div>
            </div>

            {/* Quick Insights Panel */}
            <div className="grid md:grid-cols-2 gap-6 mt-8 pt-6 border-t">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Top Benefiting States
                </h4>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  {quickInsights.topBenefiting.map((s, index) => (
                    <li key={s.key} className="flex items-center justify-between gap-2">
                      <span>{index + 1}. {s.name}</span>
                      <Badge variant="outline" className="text-[11px]">
                        High positive impact
                      </Badge>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Most Challenged States
                </h4>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  {quickInsights.mostChallenged.map((s, index) => (
                    <li key={s.key} className="flex items-center justify-between gap-2">
                      <span>{index + 1}. {s.name}</span>
                      <Badge variant="outline" className="text-[11px]">
                        Needs stronger support
                      </Badge>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">Positive Impact</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">{positiveStates} regions</div>
                <p className="text-xs text-emerald-600/80 mt-1">High readiness for implementation with strong economic and social benefits expected</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="font-medium text-amber-700 dark:text-amber-400">Neutral Impact</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">{neutralStates} regions</div>
                <p className="text-xs text-amber-600/80 mt-1">Moderate readiness with balanced outcomes requiring monitoring</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium text-red-700 dark:text-red-400">Risk Areas</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{riskStates} regions</div>
                <p className="text-xs text-red-600/80 mt-1">Need targeted support programs and extended compliance timelines</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Key Observations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  Southern and Western states show highest adoption readiness due to existing digital infrastructure
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  North-Eastern states require special provisions for geographic and infrastructure challenges
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  States with large informal sectors (UP, Bihar, Jharkhand) need phased implementation approach
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-1">•</span>
                  Union Territories show varied readiness based on their administrative structure and economic focus
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Maps;
