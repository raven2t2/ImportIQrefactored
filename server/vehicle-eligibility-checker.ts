/**
 * Australian Vehicle Import Eligibility Checker
 * Based on Department of Infrastructure, Transport, Regional Development, Communications and the Arts (DITRDCA)
 * Motor Vehicle Standards Act 1989 and Australian Design Rules (ADRs)
 */

export interface VehicleEligibilityResult {
  eligible: boolean;
  eligibilityType: 'SEVS' | 'RAWS' | 'Personal Import' | 'Specialist Vehicle' | 'Historic Vehicle' | 'Not Eligible';
  ageRequirement: {
    minimumAge: number;
    currentAge: number;
    meetsRequirement: boolean;
    exemptionType?: string;
  };
  complianceRequirements: {
    rawsCompliance: boolean;
    sevsListed: boolean;
    adrCompliance: boolean;
    quarantineRequired: boolean;
    inspectionRequired: boolean;
  };
  estimatedCosts: {
    complianceCost: number;
    modificationCost: number;
    inspectionFees: number;
    quarantineFees: number;
  };
  restrictions: string[];
  nextSteps: string[];
  warnings: string[];
  lastUpdated: string;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  vin?: string;
  engineSize?: number;
  fuelType?: string;
  bodyType?: string;
  driveType?: string;
  transmission?: string;
  origin: 'japan' | 'usa' | 'uk' | 'europe' | 'other';
}

/**
 * Check vehicle eligibility for Australian import
 */
export function checkVehicleEligibility(vehicle: VehicleDetails): VehicleEligibilityResult {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  // Base eligibility assessment
  let eligible = false;
  let eligibilityType: VehicleEligibilityResult['eligibilityType'] = 'Not Eligible';
  let complianceCost = 0;
  let modificationCost = 0;
  const restrictions: string[] = [];
  const nextSteps: string[] = [];
  const warnings: string[] = [];

  // Age-based eligibility check
  if (vehicleAge >= 25) {
    // 25+ year rule - Historic Vehicle
    eligible = true;
    eligibilityType = 'Historic Vehicle';
    complianceCost = 1500; // Basic compliance
    nextSteps.push('Vehicle qualifies under 25-year rule');
    nextSteps.push('Apply for import approval via DITRDCA');
    nextSteps.push('Arrange basic safety inspection');
  } else if (vehicleAge >= 15) {
    // 15+ year rule - Personal Import Scheme
    eligible = true;
    eligibilityType = 'Personal Import';
    complianceCost = 3500;
    restrictions.push('Must be owned for minimum 12 months before import');
    restrictions.push('Cannot be sold for 12 months after import');
    nextSteps.push('Verify 12-month ownership requirement');
    nextSteps.push('Apply for personal import approval');
    warnings.push('Personal import scheme has strict ownership requirements');
  } else {
    // Check SEVS eligibility for newer vehicles
    const sevsEligible = checkSEVSEligibility(vehicle);
    if (sevsEligible) {
      eligible = true;
      eligibilityType = 'SEVS';
      complianceCost = 8000;
      nextSteps.push('Vehicle found on SEVS list');
      nextSteps.push('Source from SEVS-approved workshop');
    } else {
      // Check RAWS eligibility
      const rawsEligible = checkRAWSEligibility(vehicle);
      if (rawsEligible) {
        eligible = true;
        eligibilityType = 'RAWS';
        complianceCost = 15000;
        modificationCost = 25000; // Extensive modifications often required
        warnings.push('RAWS compliance is expensive and time-consuming');
        warnings.push('Vehicle may require extensive modifications');
        nextSteps.push('Consult with RAWS workshop for feasibility');
        nextSteps.push('Obtain modification estimate');
      }
    }
  }

  // Additional checks based on vehicle characteristics
  if (vehicle.bodyType === 'motorcycle' && vehicleAge < 30) {
    restrictions.push('Motorcycles require 30-year minimum age');
    if (vehicleAge < 30) {
      eligible = false;
      eligibilityType = 'Not Eligible';
    }
  }

  // Left-hand drive restrictions
  if (vehicle.origin === 'usa' || vehicle.origin === 'europe') {
    restrictions.push('Left-hand drive vehicles face additional restrictions');
    warnings.push('LHD vehicles may be restricted to certain states');
    modificationCost += 5000; // Additional conversion costs
  }

  // Emissions and safety requirements
  const emissionsCompliant = checkEmissionsCompliance(vehicle);
  const safetyCompliant = checkSafetyCompliance(vehicle);

  if (!emissionsCompliant) {
    warnings.push('Vehicle may not meet Australian emissions standards');
    modificationCost += 3000;
  }

  if (!safetyCompliant) {
    warnings.push('Vehicle may require safety modifications');
    modificationCost += 2000;
  }

  // Calculate total fees
  const inspectionFees = 350 + 150 + 87; // ACIS + Customs + Quarantine
  const quarantineFees = 87 + (Math.random() > 0.8 ? 200 : 0); // Base + potential additional

  return {
    eligible,
    eligibilityType,
    ageRequirement: {
      minimumAge: getMinimumAge(eligibilityType),
      currentAge: vehicleAge,
      meetsRequirement: vehicleAge >= getMinimumAge(eligibilityType),
      exemptionType: eligibilityType === 'SEVS' ? 'SEVS Listed Vehicle' : undefined
    },
    complianceRequirements: {
      rawsCompliance: eligibilityType === 'RAWS',
      sevsListed: eligibilityType === 'SEVS',
      adrCompliance: eligible,
      quarantineRequired: true,
      inspectionRequired: true
    },
    estimatedCosts: {
      complianceCost,
      modificationCost,
      inspectionFees,
      quarantineFees
    },
    restrictions,
    nextSteps,
    warnings,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Check if vehicle is on SEVS list
 */
function checkSEVSEligibility(vehicle: VehicleDetails): boolean {
  // SEVS vehicles (Specialist and Enthusiast Vehicle Scheme)
  const sevsVehicles = [
    // Japanese Performance Cars
    { make: 'nissan', models: ['skyline gt-r', 'silvia', '180sx', '200sx'], years: [1989, 2002] },
    { make: 'toyota', models: ['supra', 'mr2', 'celica gt-four', 'ae86'], years: [1986, 2002] },
    { make: 'mazda', models: ['rx-7', 'rx-8', 'mx-5'], years: [1986, 2012] },
    { make: 'honda', models: ['nsx', 'integra type r', 'civic type r'], years: [1990, 2005] },
    { make: 'subaru', models: ['impreza wrx', 'impreza sti', 'liberty rs'], years: [1992, 2007] },
    { make: 'mitsubishi', models: ['lancer evolution', '3000gt', 'gto'], years: [1990, 2007] },
    
    // European Sports Cars
    { make: 'porsche', models: ['911', 'boxster', 'cayman'], years: [1990, 2015] },
    { make: 'bmw', models: ['m3', 'm5', 'z3', 'z4'], years: [1990, 2015] },
    { make: 'mercedes-benz', models: ['sl', 'slk', 'amg'], years: [1990, 2015] },
    { make: 'audi', models: ['rs4', 'rs6', 'tt'], years: [1995, 2015] },
    
    // American Muscle Cars
    { make: 'chevrolet', models: ['corvette', 'camaro ss', 'camaro z28'], years: [1990, 2015] },
    { make: 'ford', models: ['mustang gt', 'mustang cobra'], years: [1990, 2015] },
    { make: 'dodge', models: ['viper', 'challenger srt'], years: [1990, 2015] }
  ];

  const vehicleMake = vehicle.make.toLowerCase();
  const vehicleModel = vehicle.model.toLowerCase();

  return sevsVehicles.some(sevs => {
    if (sevs.make !== vehicleMake) return false;
    if (vehicle.year < sevs.years[0] || vehicle.year > sevs.years[1]) return false;
    return sevs.models.some(model => 
      vehicleModel.includes(model) || model.includes(vehicleModel.split(' ')[0])
    );
  });
}

/**
 * Check RAWS eligibility
 */
function checkRAWSEligibility(vehicle: VehicleDetails): boolean {
  // RAWS (Register of Approved Workshop Scheme) - technically any vehicle can be made compliant
  // but practical considerations apply
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;

  // Generally not economical for vehicles older than 10 years due to modification costs
  if (vehicleAge > 10) return false;

  // Some vehicles are not practical for RAWS due to modification complexity
  const rawsProhibited = [
    'kei car', 'mini truck', 'van', 'bus', 'truck'
  ];

  const vehicleModel = vehicle.model.toLowerCase();
  const bodyType = vehicle.bodyType?.toLowerCase() || '';

  return !rawsProhibited.some(prohibited => 
    vehicleModel.includes(prohibited) || bodyType.includes(prohibited)
  );
}

/**
 * Check emissions compliance
 */
function checkEmissionsCompliance(vehicle: VehicleDetails): boolean {
  // Australian Design Rule 79/04 - Emission Control for Light Vehicles
  if (vehicle.year >= 2006) return true; // Generally compliant with Euro 4
  if (vehicle.year >= 1996) return vehicle.origin !== 'japan'; // Japan had different standards
  return false; // Pre-1996 vehicles generally need modification
}

/**
 * Check safety compliance
 */
function checkSafetyCompliance(vehicle: VehicleDetails): boolean {
  // Australian Design Rules for safety
  if (vehicle.year >= 2000) return true; // Generally compliant
  if (vehicle.year >= 1990) return vehicle.origin === 'europe' || vehicle.origin === 'usa'; // Similar standards
  return false; // Older vehicles generally need modifications
}

/**
 * Get minimum age requirement for eligibility type
 */
function getMinimumAge(eligibilityType: VehicleEligibilityResult['eligibilityType']): number {
  switch (eligibilityType) {
    case 'Historic Vehicle': return 25;
    case 'Personal Import': return 15;
    case 'SEVS': return 0; // No age requirement if on SEVS list
    case 'RAWS': return 0; // No age requirement but impractical for old vehicles
    case 'Specialist Vehicle': return 0;
    default: return 25;
  }
}

/**
 * Get detailed compliance requirements by state
 */
export function getStateComplianceRequirements(state: string, eligibilityType: string) {
  const stateRequirements = {
    'NSW': {
      inspection: 'Blue Slip inspection required',
      modifications: 'VSI (Vehicle Safety Inspection) for modified vehicles',
      registration: 'RMS registration process',
      additionalFees: 300
    },
    'VIC': {
      inspection: 'VicRoads safety inspection',
      modifications: 'Engineers certificate for modifications',
      registration: 'VicRoads registration',
      additionalFees: 350
    },
    'QLD': {
      inspection: 'Safety certificate required',
      modifications: 'Blue Card inspection for modifications',
      registration: 'TMR registration process',
      additionalFees: 280
    },
    'WA': {
      inspection: 'Vehicle examination',
      modifications: 'Department of Transport approval',
      registration: 'DOT registration',
      additionalFees: 400
    },
    'SA': {
      inspection: 'VASS inspection for imports',
      modifications: 'Regency Park inspection',
      registration: 'SA Motor Registration',
      additionalFees: 380
    },
    'TAS': {
      inspection: 'Transport Tasmania inspection',
      modifications: 'Engineers report required',
      registration: 'TAS registration',
      additionalFees: 320
    }
  };

  return stateRequirements[state] || stateRequirements['NSW'];
}

/**
 * Calculate total import timeline
 */
export function calculateImportTimeline(eligibilityType: VehicleEligibilityResult['eligibilityType']): {
  totalWeeks: number;
  phases: { phase: string; weeks: number; description: string }[];
} {
  const baseTimeline = [
    { phase: 'Vehicle Sourcing', weeks: 2, description: 'Find and secure vehicle' },
    { phase: 'Import Approval', weeks: 4, description: 'Government approvals and permits' },
    { phase: 'Shipping', weeks: 6, description: 'Ocean freight and transit' },
    { phase: 'Customs Clearance', weeks: 2, description: 'Quarantine and customs' }
  ];

  const compliancePhases = {
    'Historic Vehicle': [
      { phase: 'Basic Compliance', weeks: 3, description: 'Safety inspection and basic modifications' }
    ],
    'Personal Import': [
      { phase: 'Compliance Check', weeks: 4, description: 'Verify compliance and minor modifications' }
    ],
    'SEVS': [
      { phase: 'SEVS Compliance', weeks: 8, description: 'Full SEVS workshop compliance' }
    ],
    'RAWS': [
      { phase: 'RAWS Compliance', weeks: 16, description: 'Extensive modifications and testing' }
    ]
  };

  const phases = [...baseTimeline, ...(compliancePhases[eligibilityType] || [])];
  const totalWeeks = phases.reduce((sum, phase) => sum + phase.weeks, 0);

  return { totalWeeks, phases };
}