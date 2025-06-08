/**
 * United States-specific compliance and calculation logic
 */

export const usRegionConfig = {
  currency: 'USD',
  measurementUnit: 'imperial',
  drivingSide: 'right',
  vinFormat: 'NHTSA',
  compliance: {
    minimumAge: 25, // years for most vehicles
    maximumAge: null,
    requiresCompliance: true,
    epaRequired: true,
    dotRequired: true
  }
};

export const usDutyRates = {
  passengerVehicles: 0.025, // 2.5%
  motorcycles: 0.0, // 0% for most
  trucks: 0.25, // 25%
  gst: 0.0, // No federal GST
  stateTax: 0.0625 // Average state sales tax ~6.25%
};

export const usStateRequirements = {
  CA: { inspection: 'CARB Compliance', complexity: 'Very Complex', emissions: 'Strict' },
  NY: { inspection: 'Safety + Emissions', complexity: 'Complex', emissions: 'Strict' },
  TX: { inspection: 'Safety Only', complexity: 'Moderate', emissions: 'None' },
  FL: { inspection: 'None', complexity: 'Easy', emissions: 'None' },
  WA: { inspection: 'Emissions', complexity: 'Moderate', emissions: 'Moderate' },
  OR: { inspection: 'DEQ Test', complexity: 'Moderate', emissions: 'Moderate' },
  MT: { inspection: 'None', complexity: 'Easy', emissions: 'None' },
  NH: { inspection: 'Safety Only', complexity: 'Easy', emissions: 'None' }
};

export function calculateUsImportCosts(vehicleValue, destinationState = 'CA') {
  const duty = vehicleValue * usDutyRates.passengerVehicles;
  const stateTax = vehicleValue * usDutyRates.stateTax;
  
  // EPA/DOT compliance costs
  const complianceCosts = {
    epa: 2500,
    dot: 1500,
    carb: destinationState === 'CA' ? 5000 : 0,
    bondFee: 500
  };

  const stateRegistration = getUsStateRegistrationCost(destinationState);
  
  return {
    duty,
    stateTax,
    complianceCosts,
    stateRegistration,
    total: duty + stateTax + Object.values(complianceCosts).reduce((a, b) => a + b, 0) + stateRegistration.total
  };
}

function getUsStateRegistrationCost(state) {
  const costs = {
    CA: { inspection: 500, registration: 300, title: 75, total: 875 },
    NY: { inspection: 400, registration: 250, title: 65, total: 715 },
    TX: { inspection: 200, registration: 150, title: 35, total: 385 },
    FL: { inspection: 0, registration: 225, title: 85, total: 310 },
    WA: { inspection: 250, registration: 200, title: 50, total: 500 },
    OR: { inspection: 150, registration: 180, title: 45, total: 375 },
    MT: { inspection: 0, registration: 120, title: 30, total: 150 },
    NH: { inspection: 100, registration: 140, title: 25, total: 265 }
  };
  
  return costs[state] || costs.CA;
}

export function validateUsCompliance(vehicle) {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  // 25-year rule for most vehicles
  const eligible25Year = vehicleAge >= 25;
  
  // Show and Display exemption (racing/show cars)
  const showAndDisplayEligible = vehicle.rarity === 'high' && vehicle.historicalSignificance;
  
  return {
    eligible: eligible25Year || showAndDisplayEligible,
    rule: eligible25Year ? '25-year rule' : 'Show and Display',
    requiresEpaCompliance: !eligible25Year,
    requiresDotCompliance: !eligible25Year,
    estimatedComplianceCost: eligible25Year ? 1000 : 8000
  };
}