/**
 * Global Vehicle Import Eligibility Checker
 * Covers major import markets: Australia, United States, United Kingdom, Canada
 * Based on current government regulations and import laws
 */

export interface GlobalEligibilityResult {
  targetCountry: 'AU' | 'US' | 'UK' | 'CA';
  eligible: boolean;
  eligibilityType: string;
  ageRequirement: {
    minimumAge: number;
    currentAge: number;
    meetsRequirement: boolean;
    ruleDescription: string;
  };
  complianceRequirements: {
    standardsCompliance: boolean;
    safetyModifications: string[];
    emissionsModifications: string[];
    inspectionRequired: boolean;
    testingRequired: boolean;
  };
  estimatedCosts: {
    complianceCost: number;
    modificationCost: number;
    inspectionFees: number;
    dutyAndTaxes: number;
  };
  restrictions: string[];
  nextSteps: string[];
  warnings: string[];
  timeline: {
    totalWeeks: number;
    phases: { phase: string; weeks: number; description: string }[];
  };
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
  estimatedValue: number;
}

/**
 * Check vehicle eligibility for import to specified country
 */
export function checkGlobalEligibility(
  vehicle: VehicleDetails, 
  targetCountry: 'AU' | 'US' | 'UK' | 'CA'
): GlobalEligibilityResult {
  switch (targetCountry) {
    case 'AU':
      return checkAustralianEligibility(vehicle);
    case 'US':
      return checkUSEligibility(vehicle);
    case 'UK':
      return checkUKEligibility(vehicle);
    case 'CA':
      return checkCanadianEligibility(vehicle);
    default:
      throw new Error('Unsupported target country');
  }
}

/**
 * Australian Import Eligibility (DITRDCA regulations)
 */
function checkAustralianEligibility(vehicle: VehicleDetails): GlobalEligibilityResult {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  let eligible = false;
  let eligibilityType = 'Not Eligible';
  let complianceCost = 0;
  let modificationCost = 0;
  const restrictions: string[] = [];
  const nextSteps: string[] = [];
  const warnings: string[] = [];

  if (vehicleAge >= 25) {
    eligible = true;
    eligibilityType = '25-Year Rule (Historic Vehicle)';
    complianceCost = 1500;
    nextSteps.push('Apply for import approval via DITRDCA');
    nextSteps.push('Arrange basic safety inspection');
  } else if (vehicleAge >= 15) {
    eligible = true;
    eligibilityType = 'Personal Import Scheme (15+ years)';
    complianceCost = 3500;
    restrictions.push('Must be owned for 12+ months before import');
    restrictions.push('Cannot sell for 12 months after import');
    warnings.push('Strict ownership documentation required');
  } else if (isOnSEVSList(vehicle)) {
    eligible = true;
    eligibilityType = 'SEVS (Specialist and Enthusiast Vehicle Scheme)';
    complianceCost = 8000;
    nextSteps.push('Source through SEVS-approved workshop');
  } else {
    eligibilityType = 'RAWS (Register of Approved Workshop Scheme)';
    if (vehicleAge <= 10 && vehicle.estimatedValue > 30000) {
      eligible = true;
      complianceCost = 15000;
      modificationCost = 25000;
      warnings.push('Extensive modifications required');
      warnings.push('Very expensive compliance process');
    }
  }

  return {
    targetCountry: 'AU',
    eligible,
    eligibilityType,
    ageRequirement: {
      minimumAge: getAustralianMinAge(eligibilityType),
      currentAge: vehicleAge,
      meetsRequirement: vehicleAge >= getAustralianMinAge(eligibilityType),
      ruleDescription: 'Australian Design Rules compliance required'
    },
    complianceRequirements: {
      standardsCompliance: eligible,
      safetyModifications: getAustralianSafetyMods(vehicle),
      emissionsModifications: getAustralianEmissionsMods(vehicle),
      inspectionRequired: true,
      testingRequired: eligibilityType === 'RAWS'
    },
    estimatedCosts: {
      complianceCost,
      modificationCost,
      inspectionFees: 587, // ACIS + Quarantine + Customs
      dutyAndTaxes: calculateAustralianTaxes(vehicle.estimatedValue)
    },
    restrictions,
    nextSteps,
    warnings,
    timeline: getAustralianTimeline(eligibilityType),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * US Import Eligibility (DOT/EPA regulations)
 */
function checkUSEligibility(vehicle: VehicleDetails): GlobalEligibilityResult {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  let eligible = false;
  let eligibilityType = 'Not Eligible';
  let complianceCost = 0;
  let modificationCost = 0;
  const restrictions: string[] = [];
  const nextSteps: string[] = [];
  const warnings: string[] = [];

  if (vehicleAge >= 25) {
    eligible = true;
    eligibilityType = '25-Year Rule (Historic Vehicle)';
    complianceCost = 500; // Minimal compliance needed
    nextSteps.push('File DOT Form HS-7 and EPA Form 3520-1');
    nextSteps.push('Arrange port inspection');
  } else if (vehicle.origin === 'usa') {
    eligible = true;
    eligibilityType = 'US-Spec Vehicle (Re-import)';
    complianceCost = 200;
    nextSteps.push('Verify original US certification');
  } else if (isUSCompliant(vehicle)) {
    eligible = true;
    eligibilityType = 'DOT/EPA Compliant';
    complianceCost = 2000;
    nextSteps.push('Obtain compliance certification');
  } else {
    eligibilityType = 'Non-Compliant Vehicle';
    restrictions.push('Must meet FMVSS and EPA standards');
    restrictions.push('Extensive modifications required');
    if (vehicleAge >= 21) {
      eligible = true;
      modificationCost = 15000;
      warnings.push('Show or Display exemption may apply');
      warnings.push('Limited to 2,500 miles per year');
    }
  }

  return {
    targetCountry: 'US',
    eligible,
    eligibilityType,
    ageRequirement: {
      minimumAge: 25,
      currentAge: vehicleAge,
      meetsRequirement: vehicleAge >= 25,
      ruleDescription: 'DOT 25-year rule or FMVSS compliance required'
    },
    complianceRequirements: {
      standardsCompliance: eligible,
      safetyModifications: getUSsafetyMods(vehicle),
      emissionsModifications: getUSEmissionsMods(vehicle),
      inspectionRequired: true,
      testingRequired: vehicleAge < 25 && !isUSCompliant(vehicle)
    },
    estimatedCosts: {
      complianceCost,
      modificationCost,
      inspectionFees: 485, // Port fees + inspection
      dutyAndTaxes: calculateUSTaxes(vehicle.estimatedValue)
    },
    restrictions,
    nextSteps,
    warnings,
    timeline: getUSTimeline(eligibilityType),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * UK Import Eligibility (DVSA regulations)
 */
function checkUKEligibility(vehicle: VehicleDetails): GlobalEligibilityResult {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  let eligible = true; // UK is generally more permissive
  let eligibilityType = 'Standard Import';
  let complianceCost = 1500;
  let modificationCost = 0;
  const restrictions: string[] = [];
  const nextSteps: string[] = [];
  const warnings: string[] = [];

  if (vehicle.origin === 'europe') {
    eligibilityType = 'EU Type Approved Vehicle';
    complianceCost = 500;
    nextSteps.push('Register with DVLA');
    nextSteps.push('Arrange MOT test if over 3 years');
  } else if (vehicle.driveType === 'LHD') {
    eligibilityType = 'Left-Hand Drive Import';
    modificationCost = 3000; // Headlight conversion, etc.
    restrictions.push('Headlight conversion required');
    restrictions.push('Speedometer conversion to mph');
    warnings.push('Insurance may be more expensive');
  } else {
    eligibilityType = 'Right-Hand Drive Import';
    complianceCost = 1500;
    nextSteps.push('Individual Vehicle Approval (IVA) test required');
    nextSteps.push('DVLA registration');
  }

  if (vehicleAge < 6 && !isEuroCompliant(vehicle)) {
    modificationCost += 5000;
    warnings.push('Emissions modifications may be needed');
  }

  return {
    targetCountry: 'UK',
    eligible,
    eligibilityType,
    ageRequirement: {
      minimumAge: 0,
      currentAge: vehicleAge,
      meetsRequirement: true,
      ruleDescription: 'No age restriction, IVA test required for non-EU vehicles'
    },
    complianceRequirements: {
      standardsCompliance: true,
      safetyModifications: getUKSafetyMods(vehicle),
      emissionsModifications: getUKEmissionsMods(vehicle),
      inspectionRequired: true,
      testingRequired: vehicle.origin !== 'europe'
    },
    estimatedCosts: {
      complianceCost,
      modificationCost,
      inspectionFees: 456, // IVA test + DVLA fees
      dutyAndTaxes: calculateUKTaxes(vehicle.estimatedValue, vehicle.origin)
    },
    restrictions,
    nextSteps,
    warnings,
    timeline: getUKTimeline(eligibilityType),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Canadian Import Eligibility (Transport Canada regulations)
 */
function checkCanadianEligibility(vehicle: VehicleDetails): GlobalEligibilityResult {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  let eligible = false;
  let eligibilityType = 'Not Eligible';
  let complianceCost = 0;
  let modificationCost = 0;
  const restrictions: string[] = [];
  const nextSteps: string[] = [];
  const warnings: string[] = [];

  if (vehicleAge >= 15) {
    eligible = true;
    eligibilityType = '15-Year Rule (Antique Vehicle)';
    complianceCost = 800;
    nextSteps.push('Apply to Transport Canada (Form 1)');
    nextSteps.push('Arrange federal inspection');
  } else if (vehicle.origin === 'usa' && isUSCompliant(vehicle)) {
    eligible = true;
    eligibilityType = 'US-Compliant Vehicle';
    complianceCost = 2500;
    modificationCost = 1500; // DRL, metric conversion
    restrictions.push('Daytime running lights required');
    restrictions.push('Metric speedometer required');
    nextSteps.push('Obtain Transport Canada compliance');
  } else if (isCanadianCompliant(vehicle)) {
    eligible = true;
    eligibilityType = 'Canadian Compliant Vehicle';
    complianceCost = 1200;
    nextSteps.push('Verify CMVSS compliance');
  } else {
    eligibilityType = 'Non-Compliant Vehicle';
    restrictions.push('Must meet CMVSS standards');
    restrictions.push('Extensive modifications required');
    warnings.push('Most non-compliant vehicles cannot be imported');
  }

  return {
    targetCountry: 'CA',
    eligible,
    eligibilityType,
    ageRequirement: {
      minimumAge: 15,
      currentAge: vehicleAge,
      meetsRequirement: vehicleAge >= 15,
      ruleDescription: 'Transport Canada 15-year rule or CMVSS compliance required'
    },
    complianceRequirements: {
      standardsCompliance: eligible,
      safetyModifications: getCanadianSafetyMods(vehicle),
      emissionsModifications: getCanadianEmissionsMods(vehicle),
      inspectionRequired: true,
      testingRequired: vehicleAge < 15 && !isCanadianCompliant(vehicle)
    },
    estimatedCosts: {
      complianceCost,
      modificationCost,
      inspectionFees: 425, // Transport Canada fees
      dutyAndTaxes: calculateCanadianTaxes(vehicle.estimatedValue)
    },
    restrictions,
    nextSteps,
    warnings,
    timeline: getCanadianTimeline(eligibilityType),
    lastUpdated: new Date().toISOString()
  };
}

// Helper functions for compliance checks
function isOnSEVSList(vehicle: VehicleDetails): boolean {
  const sevsModels = [
    'skyline gt-r', 'supra', 'rx-7', 'nsx', 'impreza wrx', 'lancer evolution',
    'silvia', '180sx', 'mr2', 'celica gt-four', 'integra type r'
  ];
  return sevsModels.some(model => 
    vehicle.model.toLowerCase().includes(model) || model.includes(vehicle.model.toLowerCase())
  );
}

function isUSCompliant(vehicle: VehicleDetails): boolean {
  return vehicle.origin === 'usa' || 
         (vehicle.year >= 2000 && ['usa', 'europe'].includes(vehicle.origin));
}

function isEuroCompliant(vehicle: VehicleDetails): boolean {
  return vehicle.origin === 'europe' || vehicle.origin === 'uk';
}

function isCanadianCompliant(vehicle: VehicleDetails): boolean {
  return vehicle.origin === 'usa' && vehicle.year >= 1995;
}

// Tax calculation functions
function calculateAustralianTaxes(value: number): number {
  const duty = value * 0.05; // 5% duty
  const gst = (value + duty) * 0.10; // 10% GST
  const lct = value > 84916 ? (value - 84916) * 0.33 : 0; // LCT
  return duty + gst + lct;
}

function calculateUSTaxes(value: number): number {
  return value * 0.025; // 2.5% duty for passenger vehicles
}

function calculateUKTaxes(value: number, origin: string): number {
  if (origin === 'europe') return value * 0.20; // 20% VAT only
  const duty = value * 0.10; // 10% duty from outside EU
  const vat = (value + duty) * 0.20; // 20% VAT
  return duty + vat;
}

function calculateCanadianTaxes(value: number): number {
  return value * 0.061; // 6.1% duty + GST varies by province
}

// Safety and emissions modification requirements
function getAustralianSafetyMods(vehicle: VehicleDetails): string[] {
  const mods = [];
  if (vehicle.year < 2000) mods.push('Seatbelt compliance');
  if (vehicle.driveType === 'LHD') mods.push('Steering conversion');
  if (vehicle.origin === 'japan') mods.push('Lighting compliance');
  return mods;
}

function getAustralianEmissionsMods(vehicle: VehicleDetails): string[] {
  const mods = [];
  if (vehicle.year < 2006) mods.push('Catalytic converter upgrade');
  if (vehicle.year < 1996) mods.push('Full emissions system retrofit');
  return mods;
}

function getUSsafetyMods(vehicle: VehicleDetails): string[] {
  const mods = [];
  if (vehicle.year < 25) mods.push('FMVSS compliance modifications');
  if (vehicle.driveType === 'RHD') mods.push('Mirror adjustments');
  return mods;
}

function getUSEmissionsMods(vehicle: VehicleDetails): string[] {
  const mods = [];
  if (vehicle.year < 25 && vehicle.origin !== 'usa') {
    mods.push('EPA compliance modifications');
  }
  return mods;
}

function getUKSafetyMods(vehicle: VehicleDetails): string[] {
  const mods = [];
  if (vehicle.driveType === 'LHD') mods.push('Headlight beam adjustment');
  if (vehicle.origin !== 'europe') mods.push('IVA compliance modifications');
  return mods;
}

function getUKEmissionsMods(vehicle: VehicleDetails): string[] {
  const mods = [];
  if (vehicle.year >= 2015 && vehicle.origin !== 'europe') {
    mods.push('Euro 6 emissions compliance');
  }
  return mods;
}

function getCanadianSafetyMods(vehicle: VehicleDetails): string[] {
  const mods = [];
  if (vehicle.origin === 'usa') mods.push('Daytime running lights');
  if (vehicle.origin === 'usa') mods.push('Metric speedometer');
  return mods;
}

function getCanadianEmissionsMods(vehicle: VehicleDetails): string[] {
  const mods = [];
  if (vehicle.year < 15 && vehicle.origin !== 'usa') {
    mods.push('CMVSS emissions compliance');
  }
  return mods;
}

// Age requirement helpers
function getAustralianMinAge(eligibilityType: string): number {
  if (eligibilityType.includes('25-Year')) return 25;
  if (eligibilityType.includes('Personal Import')) return 15;
  return 0;
}

// Timeline helpers
function getAustralianTimeline(eligibilityType: string) {
  const baseWeeks = eligibilityType.includes('RAWS') ? 20 : 12;
  return {
    totalWeeks: baseWeeks,
    phases: [
      { phase: 'Sourcing', weeks: 3, description: 'Vehicle sourcing and purchase' },
      { phase: 'Shipping', weeks: 6, description: 'Ocean freight' },
      { phase: 'Compliance', weeks: eligibilityType.includes('RAWS') ? 8 : 2, description: 'Compliance work' },
      { phase: 'Registration', weeks: 1, description: 'State registration' }
    ]
  };
}

function getUSTimeline(eligibilityType: string) {
  const baseWeeks = eligibilityType.includes('25-Year') ? 8 : 16;
  return {
    totalWeeks: baseWeeks,
    phases: [
      { phase: 'Sourcing', weeks: 2, description: 'Vehicle sourcing' },
      { phase: 'Shipping', weeks: 4, description: 'Ocean freight' },
      { phase: 'Compliance', weeks: eligibilityType.includes('25-Year') ? 1 : 8, description: 'DOT/EPA compliance' },
      { phase: 'Registration', weeks: 1, description: 'State registration' }
    ]
  };
}

function getUKTimeline(eligibilityType: string) {
  const baseWeeks = eligibilityType.includes('EU') ? 6 : 10;
  return {
    totalWeeks: baseWeeks,
    phases: [
      { phase: 'Sourcing', weeks: 2, description: 'Vehicle sourcing' },
      { phase: 'Shipping', weeks: 3, description: 'European transport' },
      { phase: 'IVA Test', weeks: eligibilityType.includes('EU') ? 0 : 4, description: 'Individual Vehicle Approval' },
      { phase: 'Registration', weeks: 1, description: 'DVLA registration' }
    ]
  };
}

function getCanadianTimeline(eligibilityType: string) {
  const baseWeeks = eligibilityType.includes('15-Year') ? 8 : 14;
  return {
    totalWeeks: baseWeeks,
    phases: [
      { phase: 'Sourcing', weeks: 2, description: 'Vehicle sourcing' },
      { phase: 'Shipping', weeks: 4, description: 'Ocean freight' },
      { phase: 'Compliance', weeks: eligibilityType.includes('15-Year') ? 1 : 6, description: 'Transport Canada compliance' },
      { phase: 'Registration', weeks: 1, description: 'Provincial registration' }
    ]
  };
}