/**
 * Canada-specific compliance and calculation logic
 */

export const caRegionConfig = {
  currency: 'CAD',
  measurementUnit: 'metric',
  drivingSide: 'right',
  vinFormat: 'Transport Canada',
  compliance: {
    minimumAge: 15, // years for most vehicles
    maximumAge: null,
    requiresCompliance: true,
    transportCanadaRequired: true,
    riv: true // Registrar of Imported Vehicles
  }
};

export const caDutyRates = {
  passengerVehicles: 0.061, // 6.1%
  motorcycles: 0.0, // 0% under NAFTA
  commercialVehicles: 0.061,
  gst: 0.05, // 5% federal GST
  pst: 0.0, // Varies by province
  hst: 0.0 // Harmonized provinces
};

export const caProvincialRequirements = {
  ON: { tax: 'HST 13%', inspection: 'Safety + Emissions', complexity: 'Complex' },
  QC: { tax: 'GST 5% + QST 9.975%', inspection: 'SAAQ', complexity: 'Very Complex' },
  BC: { tax: 'GST 5% + PST 7%', inspection: 'AirCare', complexity: 'Complex' },
  AB: { tax: 'GST 5%', inspection: 'Safety Only', complexity: 'Moderate' },
  SK: { tax: 'GST 5% + PST 6%', inspection: 'SGI Safety', complexity: 'Moderate' },
  MB: { tax: 'GST 5% + PST 7%', inspection: 'MPI Safety', complexity: 'Moderate' },
  NS: { tax: 'HST 15%', inspection: 'Safety + Emissions', complexity: 'Complex' },
  NB: { tax: 'HST 15%', inspection: 'Safety', complexity: 'Moderate' },
  PE: { tax: 'HST 15%', inspection: 'Safety', complexity: 'Easy' },
  NL: { tax: 'HST 15%', inspection: 'Safety', complexity: 'Moderate' }
};

export function calculateCaImportCosts(vehicleValue, destinationProvince = 'ON') {
  const duty = vehicleValue * caDutyRates.passengerVehicles;
  const gst = (vehicleValue + duty) * caDutyRates.gst;
  
  // Provincial tax calculation
  const provincialTax = calculateProvincialTax(vehicleValue + duty, destinationProvince);
  
  // RIV and compliance costs
  const complianceCosts = {
    riv: 195, // RIV fee
    transportCanada: 800, // Compliance modifications
    inspection: 150,
    duties: 100 // Broker fees
  };

  const provincialCosts = getCaProvincialCosts(destinationProvince);
  
  return {
    duty,
    gst,
    provincialTax,
    complianceCosts,
    provincialCosts,
    total: duty + gst + provincialTax + Object.values(complianceCosts).reduce((a, b) => a + b, 0) + provincialCosts.total
  };
}

function calculateProvincialTax(taxableValue, province) {
  const rates = {
    ON: 0.08, // HST 13% - 5% GST = 8% provincial portion
    QC: 0.09975, // QST
    BC: 0.07, // PST
    AB: 0.0, // No PST
    SK: 0.06, // PST
    MB: 0.07, // PST
    NS: 0.10, // HST 15% - 5% GST = 10% provincial portion
    NB: 0.10, // HST 15% - 5% GST = 10% provincial portion
    PE: 0.10, // HST 15% - 5% GST = 10% provincial portion
    NL: 0.10 // HST 15% - 5% GST = 10% provincial portion
  };
  
  return taxableValue * (rates[province] || 0.08);
}

function getCaProvincialCosts(province) {
  const costs = {
    ON: { inspection: 120, registration: 95, plates: 60, total: 275 },
    QC: { inspection: 150, registration: 120, plates: 45, total: 315 },
    BC: { inspection: 140, registration: 110, plates: 50, total: 300 },
    AB: { inspection: 100, registration: 85, plates: 40, total: 225 },
    SK: { inspection: 110, registration: 90, plates: 35, total: 235 },
    MB: { inspection: 105, registration: 88, plates: 38, total: 231 },
    NS: { inspection: 125, registration: 100, plates: 42, total: 267 },
    NB: { inspection: 115, registration: 95, plates: 40, total: 250 },
    PE: { inspection: 100, registration: 80, plates: 35, total: 215 },
    NL: { inspection: 120, registration: 98, plates: 45, total: 263 }
  };
  
  return costs[province] || costs.ON;
}

export function validateCaCompliance(vehicle) {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  
  return {
    eligible: vehicleAge >= caRegionConfig.compliance.minimumAge,
    requiresRiv: true,
    requiresTransportCanadaCompliance: vehicleAge < 15,
    inspectionRequired: true,
    estimatedComplianceCost: vehicleAge >= 15 ? 1500 : 3500
  };
}