/**
 * Comprehensive Fallback Logic System
 * Ensures every vehicle input returns a meaningful result
 * Never allows dead ends - always provides guidance or partial results
 */

import { inferVehicleYear, normalizeModelName, YearInferenceResult } from './intelligent-year-handler';
import { detectGlobalVehicle } from './global-vehicle-database';

export interface FallbackResult {
  success: boolean;
  resultType: 'exact_match' | 'partial_match' | 'inferred_match' | 'guided_assistance';
  confidence: 'high' | 'medium' | 'low';
  data?: any;
  guidance?: {
    clarificationNeeded: string[];
    suggestedInputs: string[];
    nextSteps: string[];
  };
  eligibilityByCountry?: YearInferenceResult['eligibilityByCountry'];
  estimatedCosts?: {
    [countryCode: string]: {
      import: number;
      compliance: number;
      registration: number;
      total: number;
      timeline: string;
    };
  };
}

/**
 * Comprehensive vehicle database for fallback matching
 * Includes common variations and partial matches
 */
const COMPREHENSIVE_VEHICLE_DATABASE = {
  // Japanese vehicles with all common variations
  japanese: {
    'toyota': {
      'supra': {
        chassisCodes: ['JZA80', 'JZA70', 'MA70'],
        years: '1978-2002',
        aliases: ['mk4', 'mk3', '2jz', 'twin turbo'],
        popularYears: [1993, 1994, 1995, 1996, 1997, 1998]
      },
      'skyline': {
        chassisCodes: ['BNR32', 'BNR33', 'BNR34', 'ER34', 'ECR33'],
        years: '1989-2002',
        aliases: ['gtr', 'gt-r', 'r32', 'r33', 'r34', 'godzilla'],
        popularYears: [1993, 1995, 1999, 2000, 2001, 2002]
      },
      'ae86': {
        chassisCodes: ['AE86', 'ZN6'],
        years: '1983-1987',
        aliases: ['hachi roku', 'corolla', 'trueno', 'levin'],
        popularYears: [1985, 1986, 1987]
      },
      'mr2': {
        chassisCodes: ['SW20', 'AW11', 'ZZW30'],
        years: '1984-2007',
        aliases: ['sw20', 'aw11', 'spyder', 'turbo'],
        popularYears: [1991, 1993, 1995]
      }
    },
    'nissan': {
      'silvia': {
        chassisCodes: ['S13', 'S14', 'S15'],
        years: '1988-2002',
        aliases: ['240sx', '200sx', 's13', 's14', 's15', 'drift'],
        popularYears: [1990, 1995, 1999]
      },
      'fairlady': {
        chassisCodes: ['Z32', 'Z33', 'Z34'],
        years: '1989-2009',
        aliases: ['300zx', '350z', 'twin turbo', 'vq35'],
        popularYears: [1993, 2003, 2006]
      }
    },
    'mazda': {
      'rx7': {
        chassisCodes: ['FD3S', 'FC3S', 'SA22C'],
        years: '1978-2002',
        aliases: ['fd', 'fc', 'rotary', 'twin turbo', '13b'],
        popularYears: [1993, 1995, 1999]
      },
      'miata': {
        chassisCodes: ['NA6C', 'NA8C', 'NB8C', 'NC', 'ND'],
        years: '1989-present',
        aliases: ['mx5', 'roadster', 'na', 'nb', 'nc', 'nd'],
        popularYears: [1990, 1994, 1999, 2006]
      }
    }
  },
  
  // American muscle cars
  american: {
    'ford': {
      'mustang': {
        chassisCodes: ['S197', 'S550', 'Fox Body'],
        years: '1964-present',
        aliases: ['stang', 'pony', 'shelby', 'gt350', 'gt500', 'cobra'],
        popularYears: [1965, 1969, 1993, 2005, 2015]
      },
      'f150': {
        chassisCodes: ['P552', 'P415'],
        years: '1975-present',
        aliases: ['f-150', 'pickup', 'truck', 'raptor'],
        popularYears: [2009, 2015, 2021]
      }
    },
    'chevrolet': {
      'camaro': {
        chassisCodes: ['F-Body', 'Alpha'],
        years: '1966-present',
        aliases: ['z28', 'ss', 'zl1', 'iroc', 'trans am'],
        popularYears: [1969, 1993, 2010, 2016]
      },
      'corvette': {
        chassisCodes: ['C6', 'C7', 'C8'],
        years: '1953-present',
        aliases: ['vette', 'stingray', 'z06', 'zr1'],
        popularYears: [2005, 2014, 2020]
      }
    },
    'dodge': {
      'challenger': {
        chassisCodes: ['LC'],
        years: '2008-2023',
        aliases: ['hellcat', 'demon', 'srt', 'rt', 'scat pack'],
        popularYears: [2015, 2018, 2020]
      },
      'charger': {
        chassisCodes: ['LD'],
        years: '2006-2023',
        aliases: ['hellcat', 'srt', 'rt', 'scat pack', 'redeye'],
        popularYears: [2015, 2018, 2020]
      }
    }
  },

  // European performance cars
  european: {
    'bmw': {
      'm3': {
        chassisCodes: ['E30', 'E36', 'E46', 'E90', 'F80', 'G80'],
        years: '1986-present',
        aliases: ['e30', 'e36', 'e46', 'e90', 'f80', 'competition'],
        popularYears: [1990, 1995, 2001, 2008, 2015]
      },
      'm5': {
        chassisCodes: ['E34', 'E39', 'E60', 'F10', 'F90', 'G90'],
        years: '1984-present',
        aliases: ['e39', 'e60', 'f10', 'competition'],
        popularYears: [1998, 2005, 2012, 2018]
      }
    },
    'mercedes': {
      'c63': {
        chassisCodes: ['W204', 'W205'],
        years: '2008-present',
        aliases: ['amg', 'c63 amg', 'w204', 'w205', 'black series'],
        popularYears: [2011, 2015, 2020]
      }
    },
    'audi': {
      'rs4': {
        chassisCodes: ['B5', 'B7', 'B8', 'B9'],
        years: '2000-present',
        aliases: ['avant', 'wagon', 'quattro', 'twin turbo'],
        popularYears: [2001, 2007, 2013, 2018]
      }
    }
  }
};

/**
 * Standard cost estimation by country
 */
const STANDARD_COST_ESTIMATES = {
  'AU': { import: 4500, compliance: 6500, registration: 800, timeline: '8-12 weeks' },
  'US': { import: 3000, compliance: 2000, registration: 600, timeline: '6-8 weeks' },
  'CA': { import: 2800, compliance: 3200, registration: 500, timeline: '6-10 weeks' },
  'UK': { import: 2500, compliance: 3000, registration: 800, timeline: '4-6 weeks' },
  'DE': { import: 3500, compliance: 4500, registration: 1200, timeline: '10-14 weeks' }
};

/**
 * Fuzzy string matching for partial vehicle identification
 */
function fuzzyMatch(input: string, targets: string[]): { match: string; confidence: number } | null {
  const inputLower = input.toLowerCase();
  let bestMatch = '';
  let bestScore = 0;

  targets.forEach(target => {
    const targetLower = target.toLowerCase();
    let score = 0;
    
    // Exact match
    if (inputLower === targetLower) {
      score = 1.0;
    }
    // Contains match
    else if (inputLower.includes(targetLower) || targetLower.includes(inputLower)) {
      score = 0.8;
    }
    // Partial word match
    else {
      const inputWords = inputLower.split(/\s+/);
      const targetWords = targetLower.split(/\s+/);
      const commonWords = inputWords.filter(word => 
        targetWords.some(tWord => word.includes(tWord) || tWord.includes(word))
      );
      score = commonWords.length / Math.max(inputWords.length, targetWords.length);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = target;
    }
  });

  return bestScore > 0.3 ? { match: bestMatch, confidence: bestScore } : null;
}

/**
 * Extract potential vehicle information from any input
 */
function extractVehicleInfo(input: string): {
  make?: string;
  model?: string;
  year?: number;
  chassisCode?: string;
  confidence: number;
} {
  const inputLower = input.toLowerCase().trim();
  const result: any = { confidence: 0 };

  // Extract year if present
  const yearMatch = input.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    result.year = parseInt(yearMatch[0]);
    result.confidence += 0.3;
  }

  // Check for chassis codes and aliases
  const chassisPattern = /\b[A-Z]{2,3}\d{1,3}[A-Z]?\b/g;
  const chassisMatch = input.match(chassisPattern);
  if (chassisMatch) {
    result.chassisCode = chassisMatch[0];
    result.confidence += 0.4;
  }

  // Handle common chassis code aliases
  const chassisAliases: Record<string, string> = {
    'r32': 'BNR32',
    'r33': 'BNR33', 
    'r34': 'BNR34',
    'r35': 'CBA-R35',
    's13': 'RPS13',
    's14': 'S14A',
    's15': 'S15',
    'fd': 'FD3S',
    'fc': 'FC3S',
    'na': 'NA6C',
    'nb': 'NB8C',
    'sw20': 'SW20',
    'ae86': 'AE86',
    'jza80': 'JZA80'
  };

  const inputKey = inputLower.trim();
  if (chassisAliases[inputKey]) {
    result.chassisCode = chassisAliases[inputKey];
    result.confidence += 0.6;
  }

  // Search through comprehensive database
  for (const [origin, makes] of Object.entries(COMPREHENSIVE_VEHICLE_DATABASE)) {
    for (const [make, models] of Object.entries(makes)) {
      if (inputLower.includes(make)) {
        result.make = make;
        result.confidence += 0.2;

        for (const [model, data] of Object.entries(models)) {
          if (inputLower.includes(model) || 
              data.aliases.some(alias => inputLower.includes(alias))) {
            result.model = model;
            result.confidence += 0.3;
            break;
          }
        }
        break;
      }
    }
  }

  return result;
}

/**
 * Main fallback system that never fails
 */
export async function comprehensiveFallback(input: string): Promise<FallbackResult> {
  // First try exact match through global detection
  const globalDetection = detectGlobalVehicle(input);
  if (globalDetection.success) {
    const yearInference = inferVehicleYear(
      globalDetection.data!.make,
      globalDetection.data!.model,
      undefined,
      input.length === 17 ? input : undefined
    );

    return {
      success: true,
      resultType: 'exact_match',
      confidence: 'high',
      data: globalDetection.data,
      eligibilityByCountry: yearInference.eligibilityByCountry,
      estimatedCosts: generateCostEstimates(yearInference.eligibilityByCountry)
    };
  }

  // Try model name normalization
  const normalized = normalizeModelName(input);
  if (normalized) {
    const yearInference = inferVehicleYear(normalized.make, normalized.model);
    
    return {
      success: true,
      resultType: 'inferred_match',
      confidence: 'medium',
      data: {
        make: normalized.make,
        model: normalized.model,
        yearRange: yearInference.yearRange,
        source: 'model_normalization'
      },
      eligibilityByCountry: yearInference.eligibilityByCountry,
      estimatedCosts: generateCostEstimates(yearInference.eligibilityByCountry)
    };
  }

  // Extract vehicle information from partial input
  const extracted = extractVehicleInfo(input);
  if (extracted.confidence > 0.5) {
    const yearInference = extracted.make && extracted.model 
      ? inferVehicleYear(extracted.make, extracted.model, extracted.year)
      : null;

    return {
      success: true,
      resultType: 'partial_match',
      confidence: extracted.confidence > 0.8 ? 'high' : 'medium',
      data: {
        make: extracted.make,
        model: extracted.model,
        year: extracted.year,
        chassisCode: extracted.chassisCode,
        source: 'partial_extraction'
      },
      eligibilityByCountry: yearInference?.eligibilityByCountry,
      estimatedCosts: yearInference ? generateCostEstimates(yearInference.eligibilityByCountry) : undefined,
      guidance: {
        clarificationNeeded: generateClarificationNeeded(extracted),
        suggestedInputs: generateSuggestedInputs(extracted),
        nextSteps: [
          'Provide the specific year if known',
          'Include the full make and model name',
          'Add chassis code if available'
        ]
      }
    };
  }

  // Last resort: provide guided assistance
  return {
    success: true,
    resultType: 'guided_assistance',
    confidence: 'low',
    guidance: {
      clarificationNeeded: [
        'Vehicle make (e.g., Toyota, Ford, BMW)',
        'Vehicle model (e.g., Supra, Mustang, M3)',
        'Year of manufacture (if known)'
      ],
      suggestedInputs: [
        'Try: "Toyota Supra 1995"',
        'Try: "Ford Mustang GT 2015"',
        'Try: "JZA80" (chassis code)',
        'Try: "1G1YY22G965107678" (VIN)'
      ],
      nextSteps: [
        'Provide more specific vehicle information',
        'Include year, make, and model',
        'Use chassis codes for JDM vehicles',
        'Paste VIN for American vehicles'
      ]
    }
  };
}

function generateClarificationNeeded(extracted: any): string[] {
  const needed = [];
  if (!extracted.make) needed.push('Vehicle make');
  if (!extracted.model) needed.push('Vehicle model');
  if (!extracted.year) needed.push('Year of manufacture');
  return needed;
}

function generateSuggestedInputs(extracted: any): string[] {
  const suggestions = [];
  
  if (extracted.make && extracted.model) {
    suggestions.push(`${extracted.make} ${extracted.model} [year]`);
  }
  if (extracted.chassisCode) {
    suggestions.push(`Full chassis code: ${extracted.chassisCode}`);
  }
  
  suggestions.push(
    'Try with year: "Toyota Supra 1995"',
    'Use chassis code: "JZA80"',
    'Include full details: "2015 Dodge Charger Hellcat"'
  );
  
  return suggestions;
}

function generateCostEstimates(eligibilityByCountry?: YearInferenceResult['eligibilityByCountry']) {
  if (!eligibilityByCountry) return undefined;

  const costs: any = {};
  Object.entries(STANDARD_COST_ESTIMATES).forEach(([country, estimate]) => {
    const eligibility = eligibilityByCountry[country];
    if (eligibility?.eligible) {
      costs[country] = {
        ...estimate,
        total: estimate.import + estimate.compliance + estimate.registration
      };
    }
  });
  
  return Object.keys(costs).length > 0 ? costs : undefined;
}