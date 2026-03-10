export interface AnalysisData {
  role: "central" | "state";
  state: string;
  lang: "en" | "hi";
  lawText: string;
  modules: {
    modLegal: boolean;
    modEconomic: boolean;
    modGeo: boolean;
    modCommunity: boolean;
    modGender: boolean;
    modGlobal: boolean;
    modPrevious: boolean;
    modFuture: boolean;
  };
  timestamp: number;
}

// AI analysis result from the edge function
export interface AIAnalysisResult {
  modLegal?: {
    summary_en: string;
    summary_hi: string;
    status: "positive" | "neutral" | "risk";
    confidence: number;
  };
  modEconomic?: {
    revenueImpact: string;
    complianceSavings: string;
    jobCreation: string;
    status: "positive" | "neutral" | "risk";
    confidence: number;
    details: string;
  };
  modGeo?: {
    highReadiness: string[];
    mediumReadiness: string[];
    needSupport: string[];
    status: "positive" | "neutral" | "risk";
    confidence: number;
    stateImpacts?: Record<string, {
      impact: "positive" | "neutral" | "risk";
      positivePercent: number;
      neutralPercent: number;
      riskPercent: number;
      keyInsight: string;
    }>;
  };
  modCommunity?: {
    summary: string;
    recommendations: string[];
    status: "positive" | "neutral" | "risk";
    confidence: number;
  };
  modGender?: {
    summary: string;
    womenBenefit: string;
    status: "positive" | "neutral" | "risk";
    confidence: number;
  };
  modGlobal?: {
    comparisons: Array<{ country: string; policy: string; outcome: string }>;
    status: "positive" | "neutral" | "risk";
    confidence: number;
  };
  modPrevious?: {
    lessons: string[];
    status: "positive" | "neutral" | "risk";
    confidence: number;
  };
  modFuture?: {
    optimistic: { formalization: string; revenue: string };
    neutral: { formalization: string; revenue: string };
    cautious: { formalization: string; revenue: string };
    status: "positive" | "neutral" | "risk";
    confidence: number;
  };
}

const STORAGE_KEY = "aiParliamentAnalysis";
const AI_RESULT_KEY = "aiParliamentResult";

export const saveAnalysisData = (data: AnalysisData) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getAnalysisData = (): AnalysisData | null => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveAIResult = (result: AIAnalysisResult) => {
  sessionStorage.setItem(AI_RESULT_KEY, JSON.stringify(result));
};

export const getAIResult = (): AIAnalysisResult | null => {
  const data = sessionStorage.getItem(AI_RESULT_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearAnalysisData = () => {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(AI_RESULT_KEY);
};

// Utility: pseudo-random for confidence % so UI looks alive
export const pseudoRandomPercent = (seedText: string): number => {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  return 60 + (hash % 36);
};

export const INDIAN_STATES = [
  "Jammu & Kashmir",
  "Ladakh",
  "Himachal Pradesh",
  "Punjab",
  "Haryana",
  "Uttarakhand",
  "Uttar Pradesh",
  "Rajasthan",
  "Delhi",
  "Gujarat",
  "Maharashtra",
  "Goa",
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "West Bengal",
  "Odisha",
  "Jharkhand",
  "Bihar",
  "Chhattisgarh",
  "Madhya Pradesh",
  "Assam",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Meghalaya",
  "Sikkim",
];

export const DEFAULT_LAW_TEXT = `DRAFT LAW: Goods & Services Tax Credit Harmonisation (Amendment) Bill, 2026

This draft bill proposes:
1. A uniform minimum Goods & Services Tax (GST) input tax credit of 10% for micro and small enterprises (MSEs) with annual turnover below ₹2 crore.
2. A phased reduction of certain state-level local body taxes that overlap with GST, to avoid double taxation on inter-state trade.
3. A digital compliance window of 18 months for districts with below-average digital infrastructure, during which penalties for late GST filing are capped and handholding support is provided.
4. A targeted incentive for women-led enterprises, granting an additional 3% input tax credit for the first three years of registration.

Objective: To simplify GST compliance, encourage formalisation of small businesses, and reduce regional disparities in tax burden.`;
