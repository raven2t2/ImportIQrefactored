/**
 * Smart Validation Engine - Enhanced Data Processing Functions
 * Connects smart input parsing to authentic regulatory datasets
 * Preserves all existing datasets while adding intelligent processing
 */

// Enhanced data parsing functions using existing authentic datasets
export async function enhanceVinData(vin: string) {
  const wmi = vin.substring(0, 3);
  const year = getVinYear(vin.charAt(9));
  
  // Use our authentic vehicle data
  const { AUSTRALIAN_VIN_PATTERNS, ADR_COMPLIANCE_DATABASE } = await import('./authentic-vehicle-data');
  
  const vinInfo = AUSTRALIAN_VIN_PATTERNS[wmi] || {
    make: 'Unknown',
    origin: wmi.startsWith('J') ? 'Japan' : wmi.startsWith('1') || wmi.startsWith('2') ? 'USA' : 'Europe'
  };

  // Check compliance eligibility
  const complianceInfo = ADR_COMPLIANCE_DATABASE[vinInfo.make] || {};
  
  return {
    ...vinInfo,
    year,
    complianceEligible: complianceInfo.eligible || false,
    estimatedAge: new Date().getFullYear() - year,
    eligibilityCountries: year <= new Date().getFullYear() - 15 ? ['AU', 'NZ'] : ['US', 'CA', 'UK', 'DE']
  };
}

export async function enhanceUrlData(url: string) {
  let platform = 'Unknown';
  let origin = 'Unknown';
  let extractedData: any = {};

  if (url.includes('yahoo') && url.includes('auctions')) {
    platform = 'Yahoo Auctions Japan';
    origin = 'Japan';
    extractedData.auctionType = 'Japanese Domestic';
  } else if (url.includes('copart')) {
    platform = 'Copart USA';
    origin = 'USA';
    extractedData.auctionType = 'Salvage/Insurance';
  } else if (url.includes('carsensor')) {
    platform = 'CarSensor Japan';
    origin = 'Japan';
    extractedData.auctionType = 'Used Car Sales';
  }

  return {
    platform,
    origin,
    ...extractedData,
    eligibilityCountries: origin === 'Japan' ? ['AU', 'NZ', 'UK', 'DE'] : ['AU', 'CA', 'UK', 'DE']
  };
}

export async function enhanceChassisData(chassis: string) {
  const chassisDatabase = {
    'JZX100': { make: 'Toyota', model: 'Chaser', year: 1996, origin: 'Japan' },
    'BNR32': { make: 'Nissan', model: 'Skyline GT-R', year: 1989, origin: 'Japan' },
    'FD3S': { make: 'Mazda', model: 'RX-7', year: 1992, origin: 'Japan' },
    'EK9': { make: 'Honda', model: 'Civic Type R', year: 1997, origin: 'Japan' },
    'GC8': { make: 'Subaru', model: 'Impreza WRX', year: 1992, origin: 'Japan' },
    'AE86': { make: 'Toyota', model: 'Corolla', year: 1983, origin: 'Japan' }
  };

  const chassisInfo = chassisDatabase[chassis] || { origin: 'Japan' };
  const estimatedAge = chassisInfo.year ? new Date().getFullYear() - chassisInfo.year : 25;

  return {
    ...chassisInfo,
    estimatedAge,
    eligibilityCountries: estimatedAge >= 15 ? ['AU', 'NZ'] : ['UK', 'DE', 'CA'],
    complianceRequired: true
  };
}

export async function enhanceModelData(model: string) {
  const words = model.toLowerCase().split(/\s+/);
  const japMakes = ['toyota', 'nissan', 'honda', 'mazda', 'subaru', 'mitsubishi'];
  const eurMakes = ['bmw', 'mercedes', 'audi', 'volkswagen', 'porsche'];
  const usMakes = ['ford', 'chevrolet', 'dodge', 'chrysler'];

  let origin = 'Various';
  let eligibilityCountries = ['AU', 'US', 'CA', 'UK', 'DE'];

  const detectedMake = words.find(word => 
    japMakes.includes(word) || eurMakes.includes(word) || usMakes.includes(word)
  );

  if (detectedMake) {
    if (japMakes.includes(detectedMake)) {
      origin = 'Japan';
      eligibilityCountries = ['AU', 'NZ', 'UK', 'DE', 'CA'];
    } else if (eurMakes.includes(detectedMake)) {
      origin = 'Europe';
      eligibilityCountries = ['AU', 'US', 'CA', 'UK'];
    } else if (usMakes.includes(detectedMake)) {
      origin = 'USA';
      eligibilityCountries = ['AU', 'CA', 'UK', 'DE'];
    }
  }

  return {
    detectedMake: detectedMake?.charAt(0).toUpperCase() + detectedMake?.slice(1),
    origin,
    eligibilityCountries,
    popularVariants: origin === 'Japan' ? ['GT-R', 'Type R', 'STI', 'Evolution'] : []
  };
}

export async function checkCountryEligibility(vehicleData: any, countryCode: string) {
  let regulations: any = {};
  let eligible = false;
  let costs: any = {};
  let requirements: string[] = [];
  let timeline = '4-8 weeks';

  try {
    switch (countryCode) {
      case 'AU':
        const { AUSTRALIAN_STATE_REQUIREMENTS } = await import('./australian-state-requirements');
        regulations = AUSTRALIAN_STATE_REQUIREMENTS['NSW'] || {};
        eligible = vehicleData.estimatedAge >= 15;
        costs = {
          import: 5000,
          compliance: 8000,
          registration: 800,
          total: 13800
        };
        requirements = ['ADR Compliance', 'RAWS Registration', 'State Registration'];
        break;

      case 'UK':
        const { UK_REGIONAL_REGULATIONS } = await import('./uk-regional-regulations');
        regulations = UK_REGIONAL_REGULATIONS['england'] || {};
        eligible = vehicleData.year >= 2001;
        costs = {
          import: 1200,
          vat: vehicleData.estimatedValue * 0.2 || 10000,
          iva: 456,
          total: 1656 + (vehicleData.estimatedValue * 0.2 || 10000)
        };
        requirements = ['IVA Test', 'DVLA Registration', 'MOT Certificate'];
        break;

      case 'DE':
        const { GERMAN_REGIONAL_REGULATIONS } = await import('./german-regional-regulations');
        regulations = GERMAN_REGIONAL_REGULATIONS['bayern'] || {};
        eligible = true;
        costs = {
          import: 800,
          vat: vehicleData.estimatedValue * 0.19 || 9500,
          tuv: 145,
          total: 945 + (vehicleData.estimatedValue * 0.19 || 9500)
        };
        requirements = ['TÜV Inspection', 'German Registration', 'Insurance'];
        break;

      case 'US':
        const { US_STATE_REGULATIONS } = await import('./us-state-regulations');
        regulations = US_STATE_REGULATIONS['CA'] || {};
        eligible = vehicleData.estimatedAge >= 25;
        costs = {
          import: 2500,
          epa: eligible ? 0 : 8000,
          dot: eligible ? 0 : 5000,
          total: eligible ? 2500 : 15500
        };
        requirements = eligible ? ['HS-7 Form', 'EPA 3520-1'] : ['DOT Approval', 'EPA Compliance', 'NHTSA Approval'];
        timeline = eligible ? '2-4 weeks' : '6-12 months';
        break;

      case 'CA':
        const { CANADIAN_PROVINCIAL_REGULATIONS } = await import('./canadian-provincial-regulations');
        regulations = CANADIAN_PROVINCIAL_REGULATIONS['ON'] || {};
        eligible = vehicleData.estimatedAge >= 15;
        costs = {
          import: 1800,
          riv: 206,
          inspection: 95,
          total: 2101
        };
        requirements = ['RIV Inspection', 'Provincial Safety', 'Provincial Registration'];
        break;

      case 'NZ':
        eligible = vehicleData.estimatedAge >= 20;
        costs = {
          import: 3200,
          compliance: 6500,
          registration: 600,
          total: 10300
        };
        requirements = ['NZTA Compliance', 'Entry Certification', 'WOF Certificate'];
        regulations = {
          authority: 'NZTA',
          website: 'https://www.nzta.govt.nz/',
          complexity: 'Moderate'
        };
        break;
    }
  } catch (error) {
    console.error(`Error loading regulations for ${countryCode}:`, error);
  }

  return {
    country: countryCode,
    eligible,
    confidence: eligible ? 95 : 85,
    costs,
    requirements,
    timeline,
    regulations: {
      authority: regulations.authority || 'Transport Authority',
      website: regulations.website || '#',
      complexity: regulations.difficultyLevel || regulations.complexity || 'Moderate'
    },
    nextSteps: eligible ? 
      [`Get ${countryCode} import quote`, `Find compliance workshop`, `Prepare documentation`] :
      [`Check alternative markets`, `Wait for eligibility date`, `Consider modification options`]
  };
}

export function generateRecommendations(results: any[]) {
  const eligible = results.filter(r => r.eligible);
  const ineligible = results.filter(r => !r.eligible);

  if (eligible.length === 0) {
    return {
      primary: "No immediate eligibility found",
      secondary: "Consider waiting for age requirements or alternative markets",
      alternatives: ineligible.map(r => ({
        country: r.country,
        reason: "Age/compliance restrictions",
        waitTime: r.timeline
      }))
    };
  }

  const cheapest = eligible.reduce((min, r) => r.costs.total < min.costs.total ? r : min);
  const fastest = eligible.reduce((min, r) => r.timeline < min.timeline ? r : min);

  return {
    primary: `Best option: ${cheapest.country} (lowest cost)`,
    secondary: `Fastest: ${fastest.country} (${fastest.timeline})`,
    breakdown: eligible.map(r => ({
      country: r.country,
      cost: r.costs.total,
      timeline: r.timeline,
      complexity: r.regulations.complexity
    }))
  };
}

function getVinYear(char: string): number {
  const yearMap: Record<string, number> = {
    'Y': 2000, '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
    '6': 2006, '7': 2007, '8': 2008, '9': 2009, 'A': 2010, 'B': 2011,
    'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015, 'G': 2016, 'H': 2017,
    'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023
  };
  return yearMap[char] || 2020;
}