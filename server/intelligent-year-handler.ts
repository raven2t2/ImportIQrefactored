/**
 * Intelligent Year Handling System
 * Infers eligible years from VIN, model history, and handles partial inputs
 * Ensures every vehicle lookup returns complete eligibility information
 */

export interface YearInferenceResult {
  inferredYear?: number;
  yearRange: string;
  eligibilityByCountry: {
    [countryCode: string]: {
      eligible: boolean;
      earliestEligibleYear?: number;
      rule: string;
      explanation: string;
      nextEligibleDate?: string;
    };
  };
  confidence: 'high' | 'medium' | 'low';
  source: string;
}

/**
 * Comprehensive vehicle production history database
 * Maps models to their exact production years for accurate eligibility calculations
 */
const VEHICLE_PRODUCTION_HISTORY: Record<string, {
  make: string;
  model: string;
  productionStart: number;
  productionEnd: number;
  majorRevisions: { year: number; changes: string[] }[];
  marketVariants: {
    [market: string]: { start: number; end: number; differences: string[] };
  };
}> = {
  // JDM Legends
  'toyota_supra': {
    make: 'Toyota', model: 'Supra',
    productionStart: 1978, productionEnd: 2002,
    majorRevisions: [
      { year: 1986, changes: ['A70 generation', 'Independent rear suspension'] },
      { year: 1993, changes: ['A80 generation', '2JZ engine introduction'] }
    ],
    marketVariants: {
      japan: { start: 1978, end: 2002, differences: ['280hp limit', 'More options'] },
      usa: { start: 1979, end: 1998, differences: ['DOT compliance', '320hp rating'] }
    }
  },
  'nissan_skyline_gtr': {
    make: 'Nissan', model: 'Skyline GT-R',
    productionStart: 1969, productionEnd: 2022,
    majorRevisions: [
      { year: 1989, changes: ['R32 generation', 'ATTESA AWD'] },
      { year: 1995, changes: ['R33 generation', 'Refined aerodynamics'] },
      { year: 1999, changes: ['R34 generation', 'Most iconic generation'] },
      { year: 2007, changes: ['R35 generation', 'Completely new platform'] }
    ],
    marketVariants: {
      japan: { start: 1969, end: 2022, differences: ['All generations available'] },
      usa: { start: 2008, end: 2022, differences: ['R35 only until 2024'] }
    }
  },
  'dodge_charger_hellcat': {
    make: 'Dodge', model: 'Charger Hellcat',
    productionStart: 2015, productionEnd: 2023,
    majorRevisions: [
      { year: 2015, changes: ['707hp introduction', 'Supercharged 6.2L'] },
      { year: 2018, changes: ['Redeye variant', '797hp option'] },
      { year: 2021, changes: ['Jailbreak edition', '807hp'] }
    ],
    marketVariants: {
      usa: { start: 2015, end: 2023, differences: ['Primary market'] },
      canada: { start: 2015, end: 2023, differences: ['Similar to US spec'] }
    }
  },
  'ford_mustang': {
    make: 'Ford', model: 'Mustang',
    productionStart: 1964, productionEnd: 2024,
    majorRevisions: [
      { year: 1965, changes: ['Production model launch'] },
      { year: 1974, changes: ['Mustang II generation'] },
      { year: 1979, changes: ['Fox body generation'] },
      { year: 1994, changes: ['SN95 generation'] },
      { year: 2005, changes: ['S197 retro design'] },
      { year: 2015, changes: ['S550 independent rear suspension'] }
    ],
    marketVariants: {
      usa: { start: 1964, end: 2024, differences: ['Primary market'] },
      europe: { start: 2015, end: 2024, differences: ['RHD available from 2015'] }
    }
  },
  'bmw_m3': {
    make: 'BMW', model: 'M3',
    productionStart: 1986, productionEnd: 2024,
    majorRevisions: [
      { year: 1986, changes: ['E30 generation', 'S14 engine'] },
      { year: 1992, changes: ['E36 generation', 'S50/S52 engines'] },
      { year: 2000, changes: ['E46 generation', 'S54 engine'] },
      { year: 2007, changes: ['E90 generation', 'V8 S65 engine'] },
      { year: 2014, changes: ['F80 generation', 'Turbo S55 engine'] }
    ],
    marketVariants: {
      europe: { start: 1986, end: 2024, differences: ['Full power specs'] },
      usa: { start: 1988, end: 2024, differences: ['Some detuned variants'] }
    }
  }
};

/**
 * Import eligibility rules by country
 * Comprehensive rules for calculating when vehicles become eligible
 */
const IMPORT_ELIGIBILITY_RULES: Record<string, {
  minimumAge: number;
  rule: string;
  exceptions: string[];
  calculationMethod: 'production_year' | 'model_year' | 'first_registration';
  exemptions: {
    condition: string;
    description: string;
    vehicles: string[];
  }[];
}> = {
  'AU': {
    minimumAge: 15,
    rule: '15-year minimum age for personal import scheme',
    exceptions: ['SEVS approved vehicles', 'RAW scheme vehicles'],
    calculationMethod: 'production_year',
    exemptions: [
      {
        condition: 'SEVS List',
        description: 'Vehicles on Specialist and Enthusiast Vehicle Scheme',
        vehicles: ['Lotus Elise', 'Dodge Viper', 'Various limited editions']
      }
    ]
  },
  'US': {
    minimumAge: 25,
    rule: '25-year rule for non-FMVSS compliant vehicles',
    exceptions: ['Originally sold in US', 'Substantial similarity'],
    calculationMethod: 'model_year',
    exemptions: [
      {
        condition: 'Show or Display',
        description: 'Limited exemption for historically significant vehicles',
        vehicles: ['R33 GT-R', 'R34 GT-R V-Spec', 'Land Rover Defender 90']
      }
    ]
  },
  'CA': {
    minimumAge: 15,
    rule: '15-year minimum age for federal exemption',
    exceptions: ['Originally sold in Canada', 'Substantial similarity to US model'],
    calculationMethod: 'model_year',
    exemptions: [
      {
        condition: 'Substantial Similarity',
        description: 'Similar to US-spec vehicles',
        vehicles: ['Most Japanese models sold in US']
      }
    ]
  },
  'UK': {
    minimumAge: 0,
    rule: 'Individual Vehicle Approval (IVA) process',
    exceptions: ['EU type approved vehicles', 'Mutual recognition'],
    calculationMethod: 'production_year',
    exemptions: [
      {
        condition: 'Type Approval',
        description: 'Vehicles with valid EU type approval',
        vehicles: ['Most European models', 'Some Japanese models']
      }
    ]
  },
  'DE': {
    minimumAge: 30,
    rule: 'H-Kennzeichen (historic plates) for easier compliance',
    exceptions: ['EU type approved vehicles', 'Individual approval possible'],
    calculationMethod: 'first_registration',
    exemptions: [
      {
        condition: 'EU Type Approval',
        description: 'Vehicles sold in EU market',
        vehicles: ['All EU-spec vehicles']
      }
    ]
  }
};

/**
 * Infer vehicle year from VIN
 */
function inferYearFromVIN(vin: string): { year?: number; confidence: 'high' | 'medium' | 'low' } {
  if (vin.length !== 17) {
    return { confidence: 'low' };
  }

  const yearChar = vin.charAt(9);
  const yearMapping: Record<string, number> = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
    'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
    'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026, 'V': 2027,
    'W': 2028, 'X': 2029, 'Y': 2030, '1': 2001, '2': 2002, '3': 2003,
    '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009
  };

  const year = yearMapping[yearChar];
  return {
    year,
    confidence: year ? 'high' : 'low'
  };
}

/**
 * Calculate eligibility for all countries based on year and model
 */
function calculateEligibilityByCountry(
  make: string,
  model: string,
  year: number,
  currentYear: number = new Date().getFullYear()
): YearInferenceResult['eligibilityByCountry'] {
  const eligibility: YearInferenceResult['eligibilityByCountry'] = {};

  Object.entries(IMPORT_ELIGIBILITY_RULES).forEach(([countryCode, rules]) => {
    const vehicleAge = currentYear - year;
    const isEligible = vehicleAge >= rules.minimumAge;
    
    eligibility[countryCode] = {
      eligible: isEligible,
      rule: rules.rule,
      explanation: isEligible 
        ? `This ${year} ${make} ${model} is ${vehicleAge} years old and eligible under the ${rules.rule}.`
        : `This ${year} ${make} ${model} is only ${vehicleAge} years old. It becomes eligible in ${year + rules.minimumAge} under the ${rules.rule}.`,
      nextEligibleDate: isEligible ? undefined : `January 1, ${year + rules.minimumAge}`
    };

    if (!isEligible) {
      eligibility[countryCode].earliestEligibleYear = year + rules.minimumAge;
    }
  });

  return eligibility;
}

/**
 * Main intelligent year inference function
 */
export function inferVehicleYear(
  make: string,
  model: string,
  providedYear?: number,
  vin?: string,
  chassisCode?: string
): YearInferenceResult {
  const currentYear = new Date().getFullYear();
  
  // If year is provided, use it directly
  if (providedYear) {
    return {
      inferredYear: providedYear,
      yearRange: providedYear.toString(),
      eligibilityByCountry: calculateEligibilityByCountry(make, model, providedYear, currentYear),
      confidence: 'high',
      source: 'user_provided'
    };
  }

  // Try to infer from VIN
  if (vin) {
    const vinResult = inferYearFromVIN(vin);
    if (vinResult.year) {
      return {
        inferredYear: vinResult.year,
        yearRange: vinResult.year.toString(),
        eligibilityByCountry: calculateEligibilityByCountry(make, model, vinResult.year, currentYear),
        confidence: vinResult.confidence,
        source: 'vin_decode'
      };
    }
  }

  // Look up vehicle production history
  const modelKey = `${make.toLowerCase()}_${model.toLowerCase().replace(/\s+/g, '_')}`;
  const productionHistory = VEHICLE_PRODUCTION_HISTORY[modelKey];

  if (productionHistory) {
    const midProductionYear = Math.floor((productionHistory.productionStart + productionHistory.productionEnd) / 2);
    
    // Calculate eligibility for the entire production range
    const eligibilityByCountry: YearInferenceResult['eligibilityByCountry'] = {};
    
    Object.entries(IMPORT_ELIGIBILITY_RULES).forEach(([countryCode, rules]) => {
      const earliestEligibleProductionYear = currentYear - rules.minimumAge;
      const isAnyYearEligible = productionHistory.productionStart <= earliestEligibleProductionYear;
      
      if (isAnyYearEligible) {
        const firstEligibleYear = Math.max(productionHistory.productionStart, currentYear - rules.minimumAge);
        eligibilityByCountry[countryCode] = {
          eligible: true,
          rule: rules.rule,
          explanation: `${make} ${model} models from ${firstEligibleYear} onwards are eligible under the ${rules.rule}.`,
          earliestEligibleYear: firstEligibleYear
        };
      } else {
        const nextEligibleYear = productionHistory.productionStart + rules.minimumAge;
        eligibilityByCountry[countryCode] = {
          eligible: false,
          rule: rules.rule,
          explanation: `${make} ${model} models become eligible starting in ${nextEligibleYear} under the ${rules.rule}.`,
          nextEligibleDate: `January 1, ${nextEligibleYear}`,
          earliestEligibleYear: nextEligibleYear
        };
      }
    });

    return {
      yearRange: `${productionHistory.productionStart}-${productionHistory.productionEnd}`,
      eligibilityByCountry,
      confidence: 'medium',
      source: 'production_history'
    };
  }

  // Fallback: provide general guidance
  const eligibilityByCountry: YearInferenceResult['eligibilityByCountry'] = {};
  
  Object.entries(IMPORT_ELIGIBILITY_RULES).forEach(([countryCode, rules]) => {
    const cutoffYear = currentYear - rules.minimumAge;
    eligibilityByCountry[countryCode] = {
      eligible: false,
      rule: rules.rule,
      explanation: `For ${make} ${model}, vehicles must be from ${cutoffYear} or earlier to be eligible under the ${rules.rule}.`,
      earliestEligibleYear: cutoffYear
    };
  });

  return {
    yearRange: 'unknown',
    eligibilityByCountry,
    confidence: 'low',
    source: 'general_rules'
  };
}

/**
 * Handle model name aliases and variations
 */
export const MODEL_ALIASES: Record<string, { canonical: string; variations: string[] }> = {
  'toyota_supra': {
    canonical: 'Toyota Supra',
    variations: ['supra', 'mk4 supra', 'jza80', 'a80 supra', '2jz supra']
  },
  'nissan_skyline_gtr': {
    canonical: 'Nissan Skyline GT-R',
    variations: ['skyline', 'gtr', 'gt-r', 'r32', 'r33', 'r34', 'r35', 'godzilla']
  },
  'dodge_charger_hellcat': {
    canonical: 'Dodge Charger Hellcat',
    variations: ['hellcat', 'charger hellcat', 'hellcat charger', 'srt hellcat']
  },
  'ford_mustang': {
    canonical: 'Ford Mustang',
    variations: ['mustang', 'stang', 'pony car', 'shelby', 'gt350', 'gt500']
  },
  'bmw_m3': {
    canonical: 'BMW M3',
    variations: ['m3', 'e30 m3', 'e36 m3', 'e46 m3', 'e90 m3', 'f80 m3']
  }
};

/**
 * Normalize model name from user input
 */
export function normalizeModelName(input: string): { make: string; model: string } | null {
  const normalized = input.toLowerCase().trim();
  
  for (const [key, data] of Object.entries(MODEL_ALIASES)) {
    if (data.variations.some(variation => normalized.includes(variation))) {
      const [make, ...modelParts] = data.canonical.split(' ');
      return {
        make,
        model: modelParts.join(' ')
      };
    }
  }
  
  return null;
}