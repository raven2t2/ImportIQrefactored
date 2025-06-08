export interface SmartParserResponse {
  data: any;
  confidenceScore: number;
  sourceAttribution: string;
  sourceBreakdown: SourceBreakdown[];
  whyThisResult: string;
  nextSteps: NextStepRecommendation[];
  userIntent?: UserIntentClassification;
  importRiskIndex?: ImportRiskIndex;
  strategicRecommendations?: StrategicRecommendation[];
  fallbackSuggestions?: string[];
  lastUpdated?: string;
  disclaimer?: string;
}

export interface UserIntentClassification {
  category: string;
  subcategory: string;
  confidence: number;
  riskFactors: string[];
  detectedKeywords: string[];
}

export interface ImportRiskIndex {
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  explanation: string;
}

export interface RiskFactor {
  name: string;
  impact: number;
  description: string;
}

export interface StrategicRecommendation {
  type: string;
  title: string;
  description: string;
  timing: string;
  alternatives: string[];
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

export interface SourceBreakdown {
  dataPoint: string;
  source: string;
  confidence: number;
  lastVerified: string;
  url?: string;
}

export interface NextStepRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionUrl?: string;
  estimatedTime?: string;
}

export interface VINDecodeResult {
  make?: string;
  model?: string;
  year?: number;
  country?: string;
  chassisCode?: string;
  engine?: string;
  bodyType?: string;
  confidenceScore: number;
  sourceAttribution: string;
}

export interface ComplianceCheckResult {
  country: string;
  region?: string;
  isEligible: boolean;
  minimumAge?: number;
  maximumAge?: number;
  requirements: string[];
  estimatedCosts: any;
  specialNotes: string[];
  confidenceScore: number;
  sourceAttribution: string;
}

export interface ShippingEstimate {
  originCountry: string;
  destCountry: string;
  estCost: number;
  estDays: number;
  routeName: string;
  confidenceScore: number;
  sourceAttribution: string;
}

export interface MarketPricing {
  averagePrice: number;
  sampleCount: number;
  priceRange: { min: number; max: number };
  recentListings: any[];
  confidenceScore: number;
  sourceAttribution: string;
}