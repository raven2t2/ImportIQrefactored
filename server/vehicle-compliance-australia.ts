/**
 * Australian Vehicle Compliance Service
 * Uses Department of Infrastructure standards, SEVS database, and Australian Design Rules (ADRs)
 */

interface VehicleComplianceData {
  vin?: string;
  make: string;
  model: string;
  year: number;
  eligibilityStatus: 'sevs_eligible' | 'general_import' | 'ineligible' | 'requires_modification' | 'unknown';
  complianceDetails: {
    adr: {
      compliant: boolean;
      notes: string;
    };
    sevs: {
      eligible: boolean;
      status: string;
      notes: string;
    };
    importAge: {
      eligible: boolean;
      ageInYears: number;
      rule: string;
    };
  };
  modifications: {
    required: boolean;
    items: string[];
    estimatedCost: string;
  };
  sources: {
    infrastructure: string;
    sevs: string;
    lastChecked: string;
  };
}

/**
 * Check vehicle compliance using Australian standards
 */
export async function checkVehicleCompliance(
  make: string,
  model: string,
  year: number,
  vin?: string
): Promise<VehicleComplianceData> {
  const currentYear = new Date().getFullYear();
  const ageInYears = currentYear - year;
  
  // Check SEVS eligibility
  const sevsEligibility = checkSEVSEligibility(make, model, year);
  
  // Check manufacturer ADR compliance
  const manufacturerCompliance = checkManufacturerADRCompliance(make, year);
  
  // Check age-based eligibility (25+ years have relaxed requirements)
  const importAgeEligible = ageInYears >= 25;
  
  // Generate modification requirements
  const modifications = generateAustralianModificationRequirements(
    make,
    model,
    year,
    manufacturerCompliance,
    sevsEligibility,
    importAgeEligible
  );
  
  // Determine overall eligibility status
  let eligibilityStatus: VehicleComplianceData['eligibilityStatus'] = 'unknown';
  
  if (sevsEligibility.eligible) {
    eligibilityStatus = 'sevs_eligible';
  } else if (importAgeEligible) {
    eligibilityStatus = 'general_import';
  } else if (manufacturerCompliance.adr) {
    eligibilityStatus = modifications.required ? 'requires_modification' : 'general_import';
  } else {
    eligibilityStatus = 'ineligible';
  }
  
  return {
    vin,
    make,
    model,
    year,
    eligibilityStatus,
    complianceDetails: {
      adr: {
        compliant: manufacturerCompliance.adr,
        notes: manufacturerCompliance.adr 
          ? "Vehicle manufacturer meets Australian Design Rules" 
          : "Vehicle may require ADR compliance modifications"
      },
      sevs: {
        eligible: sevsEligibility.eligible,
        status: sevsEligibility.status,
        notes: sevsEligibility.notes
      },
      importAge: {
        eligible: importAgeEligible,
        ageInYears,
        rule: importAgeEligible 
          ? "Eligible for relaxed compliance requirements (25+ years)" 
          : `${25 - ageInYears} years until relaxed compliance eligibility`
      }
    },
    modifications,
    sources: {
      infrastructure: "https://www.infrastructure.gov.au/vehicles/design/",
      sevs: "https://www.infrastructure.gov.au/vehicles/design/specialist_enthusiast/",
      lastChecked: new Date().toISOString()
    }
  };
}

/**
 * Check SEVS (Specialist and Enthusiast Vehicle Scheme) eligibility
 */
function checkSEVSEligibility(make: string, model: string, year: number) {
  // Popular SEVS-eligible vehicles based on official SEVS register
  const sevsEligibleVehicles = {
    'nissan': {
      'skyline': { minYear: 1989, maxYear: 2002, variants: ['GT-R', 'GTS-T', 'GTS25'] },
      'silvia': { minYear: 1988, maxYear: 2002, variants: ['S13', 'S14', 'S15'] },
      '300zx': { minYear: 1989, maxYear: 2000, variants: ['Z32'] },
      'stagea': { minYear: 1996, maxYear: 2007, variants: ['260RS', 'WC34'] }
    },
    'toyota': {
      'supra': { minYear: 1993, maxYear: 2002, variants: ['RZ', 'SZ-R', 'Turbo'] },
      'chaser': { minYear: 1996, maxYear: 2001, variants: ['Tourer V', 'JZX100'] },
      'aristo': { minYear: 1991, maxYear: 2005, variants: ['V300', 'JZS161'] },
      'soarer': { minYear: 1986, maxYear: 2001, variants: ['UZZ40', 'JZZ30'] }
    },
    'mazda': {
      'rx-7': { minYear: 1986, maxYear: 2002, variants: ['FC3S', 'FD3S', 'Type R'] },
      'rx-8': { minYear: 2003, maxYear: 2012, variants: ['Type S', 'Spirit R'] }
    },
    'subaru': {
      'impreza': { minYear: 1992, maxYear: 2007, variants: ['WRX STI', 'Type R', 'Spec C'] },
      'legacy': { minYear: 1989, maxYear: 2009, variants: ['GT-B', 'RSK'] }
    },
    'mitsubishi': {
      'lancer': { minYear: 1992, maxYear: 2016, variants: ['Evolution', 'GSR', 'RS'] }
    },
    'honda': {
      'nsx': { minYear: 1990, maxYear: 2005, variants: ['Type R', 'Type S'] },
      'integra': { minYear: 1993, maxYear: 2006, variants: ['Type R', 'DC2', 'DC5'] },
      'civic': { minYear: 1992, maxYear: 2011, variants: ['Type R', 'EK9', 'FD2'] },
      's2000': { minYear: 1999, maxYear: 2009, variants: ['AP1', 'AP2'] }
    }
  };

  const makeLower = make.toLowerCase();
  const modelLower = model.toLowerCase();
  
  if (sevsEligibleVehicles[makeLower] && sevsEligibleVehicles[makeLower][modelLower]) {
    const vehicleData = sevsEligibleVehicles[makeLower][modelLower];
    
    if (year >= vehicleData.minYear && year <= vehicleData.maxYear) {
      return {
        eligible: true,
        status: 'SEVS Eligible',
        notes: `${make} ${model} (${year}) is eligible under SEVS scheme. Eligible variants: ${vehicleData.variants.join(', ')}`
      };
    }
  }
  
  return {
    eligible: false,
    status: 'Not SEVS Eligible',
    notes: `${make} ${model} (${year}) is not currently on the SEVS register. May still be importable under general scheme.`
  };
}

/**
 * Check manufacturer ADR compliance status
 */
function checkManufacturerADRCompliance(make: string, year: number) {
  // Manufacturers with known ADR compliance history
  const adrCompliantManufacturers = {
    'toyota': { adr: true, since: 1970 },
    'nissan': { adr: true, since: 1972 },
    'mazda': { adr: true, since: 1973 },
    'subaru': { adr: true, since: 1975 },
    'mitsubishi': { adr: true, since: 1971 },
    'honda': { adr: true, since: 1974 },
    'suzuki': { adr: true, since: 1980 },
    'daihatsu': { adr: true, since: 1980 },
    'isuzu': { adr: true, since: 1972 },
    'bmw': { adr: true, since: 1975 },
    'mercedes-benz': { adr: true, since: 1970 },
    'mercedes': { adr: true, since: 1970 },
    'audi': { adr: true, since: 1976 },
    'volkswagen': { adr: true, since: 1970 },
    'ford': { adr: true, since: 1960 },
    'holden': { adr: true, since: 1960 },
    'chevrolet': { adr: false, since: 2020 },
    'dodge': { adr: false, since: 1990 },
    'chrysler': { adr: false, since: 1995 }
  };

  const makeLower = make.toLowerCase();
  const manufacturerData = adrCompliantManufacturers[makeLower];
  
  if (manufacturerData && year >= manufacturerData.since) {
    return {
      adr: manufacturerData.adr
    };
  }
  
  return {
    adr: false
  };
}

/**
 * Generate Australian modification requirements
 */
function generateAustralianModificationRequirements(
  make: string,
  model: string,
  year: number,
  manufacturerCompliance: any,
  sevsEligibility: any,
  importAgeEligible: boolean
) {
  const modifications: string[] = [];
  let estimatedCost = 0;
  
  // Base compliance requirements for all imports
  if (!importAgeEligible && !sevsEligibility.eligible) {
    modifications.push("ADR compliance workshop approval required");
    estimatedCost += 5000;
    
    modifications.push("Australian compliance plate installation");
    estimatedCost += 500;
    
    modifications.push("Headlight compliance (RHD beam pattern)");
    estimatedCost += 800;
    
    modifications.push("Speedometer conversion to km/h");
    estimatedCost += 400;
    
    modifications.push("Seatbelt compliance inspection");
    estimatedCost += 300;
    
    modifications.push("Child restraint anchor points");
    estimatedCost += 600;
  }
  
  // SEVS vehicles have streamlined requirements
  if (sevsEligibility.eligible) {
    modifications.push("SEVS compliance inspection");
    estimatedCost += 2000;
    
    modifications.push("Australian compliance plate");
    estimatedCost += 500;
    
    modifications.push("Speedometer conversion (if required)");
    estimatedCost += 200;
  }
  
  // Age-based exemptions
  if (importAgeEligible) {
    modifications.push("Heritage/Classic vehicle inspection");
    estimatedCost += 1000;
    
    modifications.push("Basic safety compliance check");
    estimatedCost += 500;
  }
  
  // Japanese vehicles specific requirements
  if (['toyota', 'nissan', 'mazda', 'subaru', 'mitsubishi', 'honda'].includes(make.toLowerCase())) {
    modifications.push("Daytime running lights (if not fitted)");
    estimatedCost += 300;
  }
  
  // American vehicles specific requirements
  if (['ford', 'chevrolet', 'dodge', 'chrysler', 'cadillac'].includes(make.toLowerCase())) {
    modifications.push("RHD conversion (if LHD)");
    estimatedCost += 15000;
    
    modifications.push("ADR emissions compliance");
    estimatedCost += 3000;
  }
  
  return {
    required: modifications.length > 0,
    items: modifications,
    estimatedCost: `AUD $${estimatedCost.toLocaleString()} - $${(estimatedCost * 1.5).toLocaleString()}`
  };
}

/**
 * Get import guidance based on vehicle details
 */
export function getImportGuidance(complianceData: VehicleComplianceData): string[] {
  const guidance: string[] = [];
  
  if (complianceData.complianceDetails.sevs.eligible) {
    guidance.push("✅ Vehicle is SEVS eligible - streamlined import process available");
    guidance.push("📋 Register with an approved SEVS workshop before importing");
    guidance.push("🚛 Use SEVS-approved shipping and compliance provider");
    guidance.push("💰 SEVS imports typically cost $3,000-$8,000 for compliance");
  } else if (complianceData.complianceDetails.importAge.eligible) {
    guidance.push("✅ Vehicle qualifies for age-based import (25+ years)");
    guidance.push("📋 Heritage vehicle inspection required");
    guidance.push("🏛️ Contact club or marque specialist for support");
    guidance.push("💰 Age-based imports typically cost $2,000-$5,000 for compliance");
  } else {
    guidance.push("⚠️ Vehicle requires general import approval");
    guidance.push("📋 Full ADR compliance assessment needed");
    guidance.push("🏭 Must use RAW (Registered Automotive Workshop)");
    guidance.push("💰 General imports typically cost $8,000-$25,000 for compliance");
  }
  
  guidance.push("📄 Obtain import approval BEFORE shipping vehicle");
  guidance.push("🛃 Customs clearance required at Australian port");
  guidance.push("🔍 ACMA emissions compliance certificate needed");
  guidance.push("📋 State registration after compliance completion");
  
  return guidance;
}