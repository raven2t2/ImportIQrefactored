/**
 * Australia-specific compliance and calculation logic
 */

export const auRegionConfig = {
  currency: 'AUD',
  measurementUnit: 'metric',
  drivingSide: 'left',
  vinFormat: 'ADR',
  compliance: {
    minimumAge: 15, // years
    maximumAge: null,
    requiresCompliance: true,
    compliancePlateRequired: true,
    inspectionRequired: true
  }
};

export const auDutyRates = {
  passengerVehicles: 0.05, // 5%
  motorcycles: 0.05,
  commercialVehicles: 0.05,
  gst: 0.10, // 10%
  luxuryCarTax: {
    threshold: 89332, // AUD 2024-25
    thresholdOther: 75526, // for fuel efficient vehicles
    rate: 0.33
  }
};

export const auStateRequirements = {
  NSW: { inspection: 'Blue Slip', complexity: 'Moderate' },
  VIC: { inspection: 'VIV', complexity: 'Complex' },
  QLD: { inspection: 'Safety Certificate', complexity: 'Easy' },
  WA: { inspection: 'Vehicle Inspection', complexity: 'Moderate' },
  SA: { inspection: 'Roadworthy Certificate', complexity: 'Easy' },
  TAS: { inspection: 'Safety Inspection', complexity: 'Easy' },
  ACT: { inspection: 'Safety Inspection', complexity: 'Moderate' },
  NT: { inspection: 'Safety Certificate', complexity: 'Easy' }
};

export function calculateAuImportCosts(vehicleValue, destinationState = 'NSW') {
  const duty = vehicleValue * auDutyRates.passengerVehicles;
  const gst = (vehicleValue + duty) * auDutyRates.gst;
  
  let luxuryTax = 0;
  if (vehicleValue > auDutyRates.luxuryCarTax.threshold) {
    luxuryTax = (vehicleValue - auDutyRates.luxuryCarTax.threshold) * auDutyRates.luxuryCarTax.rate;
  }

  const stateRegistration = getStateRegistrationCost(destinationState);
  
  return {
    duty,
    gst,
    luxuryTax,
    stateRegistration,
    total: duty + gst + luxuryTax + stateRegistration.total
  };
}

function getStateRegistrationCost(state) {
  const costs = {
    NSW: { inspection: 45, registration: 85, transfer: 35, total: 165 },
    VIC: { inspection: 75, registration: 95, transfer: 28, total: 198 },
    QLD: { inspection: 35, registration: 75, transfer: 25, total: 135 },
    WA: { inspection: 55, registration: 85, transfer: 30, total: 170 },
    SA: { inspection: 40, registration: 80, transfer: 25, total: 145 },
    TAS: { inspection: 35, registration: 70, transfer: 20, total: 125 },
    ACT: { inspection: 50, registration: 90, transfer: 30, total: 170 },
    NT: { inspection: 40, registration: 75, transfer: 25, total: 140 }
  };
  
  return costs[state] || costs.NSW;
}

export function validateAuCompliance(vehicle) {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  return {
    eligible: vehicleAge >= auRegionConfig.compliance.minimumAge,
    requiresCompliance: auRegionConfig.compliance.requiresCompliance,
    compliancePlateRequired: auRegionConfig.compliance.compliancePlateRequired,
    inspectionRequired: auRegionConfig.compliance.inspectionRequired,
    estimatedComplianceCost: vehicleAge >= 15 ? 3500 : null
  };
}