/**
 * United Kingdom-specific compliance and calculation logic
 */

export const ukRegionConfig = {
  currency: 'GBP',
  measurementUnit: 'mixed', // miles for distance, litres for fuel
  drivingSide: 'left',
  vinFormat: 'EU',
  compliance: {
    minimumAge: 0, // No age restriction for most vehicles
    maximumAge: null,
    requiresCompliance: true,
    typeApprovalRequired: true,
    motRequired: true
  }
};

export const ukDutyRates = {
  passengerVehicles: 0.10, // 10%
  motorcycles: 0.06, // 6%
  commercialVehicles: 0.10,
  vat: 0.20, // 20%
  firstRegistration: 0.0 // Varies by emissions
};

export const ukRegionalRequirements = {
  England: { mot: 'Required', ulez: 'London only', complexity: 'Moderate' },
  Scotland: { mot: 'Required', lev: 'Glasgow/Edinburgh', complexity: 'Moderate' },
  Wales: { mot: 'Required', cleanAir: 'Planned', complexity: 'Easy' },
  NorthernIreland: { mot: 'Required', emissions: 'Standard', complexity: 'Easy' }
};

export function calculateUkImportCosts(vehicleValue, destinationRegion = 'England') {
  const duty = vehicleValue * ukDutyRates.passengerVehicles;
  const vat = (vehicleValue + duty) * ukDutyRates.vat;
  
  // Registration and compliance costs
  const complianceCosts = {
    typeApproval: 1200, // IVA test
    firstRegistration: 55,
    numberPlates: 25,
    mot: 55
  };

  const regionalCosts = getUkRegionalCosts(destinationRegion);
  
  return {
    duty,
    vat,
    complianceCosts,
    regionalCosts,
    total: duty + vat + Object.values(complianceCosts).reduce((a, b) => a + b, 0) + regionalCosts.total
  };
}

function getUkRegionalCosts(region) {
  const costs = {
    England: { inspection: 150, documentation: 75, total: 225 },
    Scotland: { inspection: 140, documentation: 70, total: 210 },
    Wales: { inspection: 135, documentation: 65, total: 200 },
    NorthernIreland: { inspection: 130, documentation: 60, total: 190 }
  };
  
  return costs[region] || costs.England;
}

export function validateUkCompliance(vehicle) {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  // EU type approval for newer vehicles, IVA for older/modified
  const requiresIva = vehicleAge > 10 || vehicle.modified;
  
  return {
    eligible: true, // No age restrictions
    requiresTypeApproval: !requiresIva,
    requiresIva: requiresIva,
    requiresMot: vehicleAge >= 3,
    estimatedComplianceCost: requiresIva ? 2500 : 800
  };
}