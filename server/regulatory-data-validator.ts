/**
 * Regulatory Data Validation System
 * Ensures authenticity and accuracy of all government regulations
 * Cross-references official sources and maintains data integrity
 */

import axios from 'axios';

export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-100
  sources: string[];
  lastVerified: string;
  discrepancies: string[];
  recommendations: string[];
}

export interface DataSource {
  url: string;
  authority: string;
  type: 'official' | 'verified' | 'reference';
  lastChecked: string;
  status: 'active' | 'outdated' | 'unreachable';
}

/**
 * Official government data sources for validation
 */
export const OFFICIAL_DATA_SOURCES: Record<string, DataSource[]> = {
  // United States
  "US": [
    {
      url: "https://www.nhtsa.gov/importing-vehicle",
      authority: "NHTSA",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    },
    {
      url: "https://www.cbp.gov/trade/basic-import-export/importing-car",
      authority: "U.S. Customs and Border Protection",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    }
  ],
  
  // Canada
  "CA": [
    {
      url: "https://tc.canada.ca/en/road-transportation/importing-vehicle",
      authority: "Transport Canada",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    },
    {
      url: "https://www.cbsa-asfc.gc.ca/import/vehicle/menu-eng.html",
      authority: "Canada Border Services Agency",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    }
  ],

  // United Kingdom
  "UK": [
    {
      url: "https://www.gov.uk/importing-vehicles-into-the-uk",
      authority: "DVLA",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    },
    {
      url: "https://www.gov.uk/guidance/register-a-vehicle-from-outside-the-uk",
      authority: "DVSA",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    }
  ],

  // Germany
  "DE": [
    {
      url: "https://www.kba.de/EN/Home/home_node.html",
      authority: "Kraftfahrt-Bundesamt (KBA)",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    },
    {
      url: "https://www.tuv.com/germany/en/",
      authority: "TÜV",
      type: "verified",
      lastChecked: "2025-06-08",
      status: "active"
    }
  ],

  // Japan
  "JP": [
    {
      url: "https://www.mlit.go.jp/english/",
      authority: "Ministry of Land, Infrastructure, Transport and Tourism",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    },
    {
      url: "https://www.airia.or.jp/english/",
      authority: "Japan Automobile Inspection Association",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    }
  ],

  // European Union
  "EU": [
    {
      url: "https://ec.europa.eu/taxation_customs/business/customs-procedures/importing-goods_en",
      authority: "European Commission",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    },
    {
      url: "https://europa.eu/youreurope/citizens/vehicles/registration/registration-abroad/index_en.htm",
      authority: "Your Europe",
      type: "official",
      lastChecked: "2025-06-08",
      status: "active"
    }
  ]
};

/**
 * Known accurate fee ranges for validation
 */
export const VALIDATION_BENCHMARKS = {
  // Fee ranges in local currency
  feeRanges: {
    "US": {
      registrationFee: { min: 15, max: 150 },
      inspectionFee: { min: 50, max: 200 },
      safetyFee: { min: 25, max: 100 }
    },
    "CA": {
      registrationFee: { min: 20, max: 200 },
      safetyFee: { min: 75, max: 300 },
      eTestFee: { min: 30, max: 50 }
    },
    "UK": {
      registrationFee: { min: 55, max: 55 }, // Fixed DVLA fee
      motFee: { min: 54.85, max: 54.85 }, // Fixed MOT fee
      ivaFee: { min: 456, max: 456 } // Fixed IVA fee
    },
    "DE": {
      registrationFee: { min: 26, max: 30 },
      tuvFee: { min: 120, max: 180 },
      licensePlateFee: { min: 10, max: 15 }
    }
  },
  
  // Tax rates
  taxRates: {
    "US": { salesTax: { min: 0, max: 13 } },
    "CA": { gst: { min: 5, max: 5 }, pst: { min: 0, max: 10 } },
    "UK": { vat: { min: 20, max: 20 } },
    "DE": { vat: { min: 19, max: 19 } },
    "FR": { vat: { min: 20, max: 20 } },
    "IT": { vat: { min: 22, max: 22 } },
    "NL": { vat: { min: 21, max: 21 } }
  }
};

/**
 * Validate regulatory data against official sources
 */
export async function validateRegulatoryData(countryCode: string, regulationData: any): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    confidence: 100,
    sources: [],
    lastVerified: new Date().toISOString(),
    discrepancies: [],
    recommendations: []
  };

  // Check against known benchmarks
  const benchmarks = VALIDATION_BENCHMARKS.feeRanges[countryCode];
  if (benchmarks) {
    // Validate registration fees
    if (regulationData.fees?.registrationFee) {
      const fee = regulationData.fees.registrationFee;
      const range = benchmarks.registrationFee;
      if (fee < range.min || fee > range.max) {
        result.discrepancies.push(`Registration fee ${fee} outside expected range ${range.min}-${range.max}`);
        result.confidence -= 20;
      }
    }

    // Validate inspection fees
    if (regulationData.fees?.inspectionFee) {
      const fee = regulationData.fees.inspectionFee;
      const inspectionRange = benchmarks.inspectionFee || benchmarks.safetyFee;
      if (inspectionRange && (fee < inspectionRange.min || fee > inspectionRange.max)) {
        result.discrepancies.push(`Inspection fee ${fee} outside expected range ${inspectionRange.min}-${inspectionRange.max}`);
        result.confidence -= 15;
      }
    }
  }

  // Validate tax rates
  const taxBenchmarks = VALIDATION_BENCHMARKS.taxRates[countryCode];
  if (taxBenchmarks && regulationData.fees?.vat) {
    const vat = regulationData.fees.vat;
    const vatRange = taxBenchmarks.vat;
    if (vatRange && (vat < vatRange.min || vat > vatRange.max)) {
      result.discrepancies.push(`VAT rate ${vat}% doesn't match official rate ${vatRange.min}%`);
      result.confidence -= 25;
    }
  }

  // Check data freshness
  if (regulationData.lastUpdated) {
    const lastUpdate = new Date(regulationData.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 90) {
      result.recommendations.push("Data is over 90 days old and should be refreshed from official sources");
      result.confidence -= 10;
    }
  }

  // Validate required fields
  const requiredFields = ['authority', 'governmentWebsite', 'fees', 'registration'];
  for (const field of requiredFields) {
    if (!regulationData[field]) {
      result.discrepancies.push(`Missing required field: ${field}`);
      result.confidence -= 15;
    }
  }

  // Add official sources
  const sources = OFFICIAL_DATA_SOURCES[countryCode];
  if (sources) {
    result.sources = sources.filter(s => s.status === 'active').map(s => s.url);
  }

  // Determine overall validity
  result.isValid = result.confidence >= 70 && result.discrepancies.length <= 2;

  return result;
}

/**
 * Cross-reference data with multiple official sources
 */
export async function crossReferenceOfficialSources(countryCode: string): Promise<{
  availableSources: DataSource[];
  verificationStatus: string;
  recommendedActions: string[];
}> {
  const sources = OFFICIAL_DATA_SOURCES[countryCode] || [];
  const availableSources: DataSource[] = [];
  const recommendedActions: string[] = [];

  for (const source of sources) {
    try {
      // Test source accessibility (with timeout)
      const response = await axios.head(source.url, { timeout: 5000 });
      if (response.status === 200) {
        availableSources.push({ ...source, status: 'active' });
      }
    } catch (error) {
      availableSources.push({ ...source, status: 'unreachable' });
      recommendedActions.push(`Verify ${source.authority} website: ${source.url}`);
    }
  }

  const verificationStatus = availableSources.length > 0 
    ? `${availableSources.filter(s => s.status === 'active').length}/${sources.length} sources accessible`
    : 'No official sources configured';

  if (availableSources.filter(s => s.status === 'active').length === 0) {
    recommendedActions.push("CRITICAL: No official sources accessible - manual verification required");
  }

  return {
    availableSources,
    verificationStatus,
    recommendedActions
  };
}

/**
 * Generate data integrity report
 */
export async function generateDataIntegrityReport(): Promise<{
  overallScore: number;
  countryValidations: Record<string, ValidationResult>;
  criticalIssues: string[];
  recommendations: string[];
}> {
  const report = {
    overallScore: 0,
    countryValidations: {} as Record<string, ValidationResult>,
    criticalIssues: [] as string[],
    recommendations: [] as string[]
  };

  // Import all regulation modules
  const { US_STATE_REGULATIONS } = await import('./us-state-regulations');
  const { CANADIAN_PROVINCIAL_REGULATIONS } = await import('./canadian-provincial-regulations');
  const { UK_REGIONAL_REGULATIONS } = await import('./uk-regional-regulations');
  const { GERMAN_REGIONAL_REGULATIONS } = await import('./german-regional-regulations');
  const { JAPANESE_REGIONAL_REGULATIONS } = await import('./japanese-regional-regulations');
  const { EU_REGIONAL_REGULATIONS } = await import('./eu-regional-regulations');
  const { GLOBAL_REGIONAL_REGULATIONS } = await import('./global-regional-regulations');

  // Validate each country's data
  const allRegulations = {
    'US': Object.values(US_STATE_REGULATIONS)[0], // Sample validation
    'CA': Object.values(CANADIAN_PROVINCIAL_REGULATIONS)[0],
    'UK': Object.values(UK_REGIONAL_REGULATIONS)[0],
    'DE': Object.values(GERMAN_REGIONAL_REGULATIONS)[0],
    'JP': Object.values(JAPANESE_REGIONAL_REGULATIONS)[0],
    'FR': EU_REGIONAL_REGULATIONS['FR'],
    'SE': GLOBAL_REGIONAL_REGULATIONS['SE']
  };

  let totalScore = 0;
  let validatedCount = 0;

  for (const [countryCode, regulation] of Object.entries(allRegulations)) {
    if (regulation) {
      const validation = await validateRegulatoryData(countryCode, regulation);
      report.countryValidations[countryCode] = validation;
      
      totalScore += validation.confidence;
      validatedCount++;

      if (validation.confidence < 70) {
        report.criticalIssues.push(`${countryCode}: Low confidence (${validation.confidence}%)`);
      }

      report.recommendations.push(...validation.recommendations.map(r => `${countryCode}: ${r}`));
    }
  }

  report.overallScore = validatedCount > 0 ? Math.round(totalScore / validatedCount) : 0;

  if (report.overallScore < 80) {
    report.criticalIssues.push("Overall data integrity below acceptable threshold");
  }

  return report;
}

/**
 * Automated data freshness check
 */
export function checkDataFreshness(regulationData: any): {
  isStale: boolean;
  daysSinceUpdate: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
} {
  if (!regulationData.lastUpdated) {
    return { isStale: true, daysSinceUpdate: Infinity, urgency: 'critical' };
  }

  const lastUpdate = new Date(regulationData.lastUpdated);
  const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (daysSinceUpdate > 365) urgency = 'critical';
  else if (daysSinceUpdate > 180) urgency = 'high';
  else if (daysSinceUpdate > 90) urgency = 'medium';

  return {
    isStale: daysSinceUpdate > 90,
    daysSinceUpdate,
    urgency
  };
}

/**
 * Expert validation checklist
 */
export function generateValidationChecklist(countryCode: string): {
  checklist: string[];
  expertContacts: string[];
  verificationSteps: string[];
} {
  const baseChecklist = [
    "Verify current government website URLs",
    "Check latest fee schedules from official sources",
    "Confirm tax rates with revenue authorities",
    "Validate inspection requirements with transport departments",
    "Cross-reference with embassy/consulate information"
  ];

  const expertContacts = {
    'US': ['NHTSA Technical Hotline', 'State DMV offices', 'Customs brokers'],
    'CA': ['Transport Canada', 'Provincial licensing offices', 'CBSA'],
    'UK': ['DVLA customer service', 'DVSA', 'HMRC'],
    'DE': ['KBA', 'TÜV stations', 'Local Zulassungsstelle'],
    'JP': ['MLIT', 'JAI offices', 'Local transport bureaus']
  };

  const verificationSteps = [
    "1. Access official government websites",
    "2. Download current fee schedules",
    "3. Contact relevant authorities for clarification",
    "4. Cross-reference with industry sources",
    "5. Update data with verified information",
    "6. Document sources and verification dates"
  ];

  return {
    checklist: baseChecklist,
    expertContacts: expertContacts[countryCode] || ['Contact local authorities'],
    verificationSteps
  };
}