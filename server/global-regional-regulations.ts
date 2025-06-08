/**
 * Global Regional Vehicle Import Regulations
 * Comprehensive coverage of major automotive markets worldwide
 * Authentic government fees, processing times, and regulatory requirements
 */

export interface GlobalRegionalRegulation {
  countryCode: string;
  countryName: string;
  authority: string;
  governmentWebsite: string;
  currency: string;
  
  // Registration Requirements
  registration: {
    requiresInspection: boolean;
    inspectionType: string[];
    registrationFee: number;
    licensePlateFee: number;
    processingTime: string;
    difficultyLevel: "Easy" | "Moderate" | "Complex" | "Very Complex";
  };

  // Import-Specific Requirements
  importRequirements: {
    additionalInspections: string[];
    requiredDocuments: string[];
    specialRequirements: string[];
    exemptions: string[];
    restrictedVehicles: string[];
    complianceCertRequired: boolean;
  };

  // Fees and Taxes
  fees: {
    importDuty: number;
    vat: number;
    registrationTax: number;
    documentationFee: number;
    inspectionFee: number;
    environmentalTax: number;
    additionalFees: {
      name: string;
      amount: number;
      description: string;
    }[];
  };

  // Regional Specifics
  regional: {
    estimatedDays: number;
    peakSeasons: string[];
    recommendedAgents: string[];
    commonDelays: string[];
    regionalTips: string[];
    advantages: string[];
    majorPorts: string[];
  };

  // Compliance Notes
  compliance: {
    strictnessLevel: "Low" | "Moderate" | "High" | "Very High";
    commonIssues: string[];
    bestPractices: string[];
    internationalAgreements: string[];
  };

  lastUpdated: string;
}

export const GLOBAL_REGIONAL_REGULATIONS: Record<string, GlobalRegionalRegulation> = {
  // NORDIC COUNTRIES
  "SE": {
    countryCode: "SE",
    countryName: "Sweden",
    authority: "Transportstyrelsen",
    governmentWebsite: "https://transportstyrelsen.se/",
    currency: "SEK",
    registration: {
      requiresInspection: true,
      inspectionType: ["Besiktning", "Enskild Godkännande", "EU-typgodkännande"],
      registrationFee: 525,
      licensePlateFee: 325,
      processingTime: "7-14 business days",
      difficultyLevel: "Moderate"
    },
    importRequirements: {
      additionalInspections: ["Registreringsbesiktning", "Miljöklassning", "Säkerhetskontroll"],
      requiredDocuments: ["EG-intyg", "Försäkringsbevis", "Ägarintyg", "Faktura"],
      specialRequirements: ["Swedish personal number", "Environmental classification", "EU conformity"],
      exemptions: ["EU type-approved vehicles", "Veteran vehicles 30+ years"],
      restrictedVehicles: ["Non-EU vehicles without individual approval", "High emission vehicles"],
      complianceCertRequired: true
    },
    fees: {
      importDuty: 10.0,
      vat: 25.0,
      registrationTax: 0, // No registration tax
      documentationFee: 250,
      inspectionFee: 1500, // Registreringsbesiktning
      environmentalTax: 0, // Included in annual tax
      additionalFees: [
        { name: "Fordonsskatt", amount: 360, description: "Annual vehicle tax (varies by emissions)" },
        { name: "Trängselskatt", amount: 0, description: "Congestion tax in Stockholm/Gothenburg (usage-based)" },
        { name: "Återvinningsavgift", amount: 150, description: "Recycling fee" }
      ]
    },
    regional: {
      estimatedDays: 16,
      peakSeasons: ["Summer vacation", "Midsummer period"],
      recommendedAgents: ["Bilprovningen", "DEKRA Sverige", "Svensk Bilimport"],
      commonDelays: ["Environmental classification", "Besiktning booking", "Documentation translation"],
      regionalTips: ["Book besiktning early", "Ensure environmental compliance", "Use certified importers"],
      advantages: ["High-quality infrastructure", "Digital processes", "Strong environmental focus"],
      majorPorts: ["Gothenburg", "Stockholm", "Malmö"]
    },
    compliance: {
      strictnessLevel: "High",
      commonIssues: ["Environmental standards", "Digital documentation", "Winter equipment requirements"],
      bestPractices: ["Ensure emission compliance", "Use digital services", "Prepare for strict inspections"],
      internationalAgreements: ["EU", "EEA", "Nordic cooperation"]
    },
    lastUpdated: "2025-06-08"
  },

  "NO": {
    countryCode: "NO",
    countryName: "Norway",
    authority: "Statens vegvesen",
    governmentWebsite: "https://www.vegvesen.no/",
    currency: "NOK",
    registration: {
      requiresInspection: true,
      inspectionType: ["EU-kontroll", "Periodisk kjøretøykontroll", "Individuell godkjenning"],
      registrationFee: 2870,
      licensePlateFee: 455,
      processingTime: "10-21 business days",
      difficultyLevel: "Very Complex"
    },
    importRequirements: {
      additionalInspections: ["Individuell godkjenning", "EU-kontroll", "Omregistrering"],
      requiredDocuments: ["EU-samsvarserklæring", "Faktura", "Forsikringsbevis", "Tollpapirer"],
      specialRequirements: ["Norwegian residence", "High import taxes", "Environmental standards"],
      exemptions: ["Electric vehicles (reduced taxes)", "Veteran vehicles 30+ years"],
      restrictedVehicles: ["High-emission vehicles (very high taxes)", "Modified vehicles"],
      complianceCertRequired: true
    },
    fees: {
      importDuty: 8.9, // For non-EU vehicles
      vat: 25.0,
      registrationTax: 8745, // Engangsavgift (varies significantly)
      documentationFee: 455,
      inspectionFee: 2870, // EU-kontroll
      environmentalTax: 0, // Included in engangsavgift
      additionalFees: [
        { name: "Engangsavgift", amount: 25000, description: "One-time tax (varies greatly by CO2/weight)" },
        { name: "Årsavgift", amount: 3135, description: "Annual vehicle tax" },
        { name: "Vrakpant", amount: 2500, description: "Scrapping deposit" }
      ]
    },
    regional: {
      estimatedDays: 25,
      peakSeasons: ["Summer months", "Christmas period"],
      recommendedAgents: ["Statens vegvesen", "Bilimportører", "EU-kontroll stasjoner"],
      commonDelays: ["High tax calculations", "EU-kontroll appointments", "Documentation requirements"],
      regionalTips: ["Consider electric vehicles for tax savings", "Calculate total costs early", "Use established importers"],
      advantages: ["High-quality roads", "Strong economy", "Electric vehicle incentives"],
      majorPorts: ["Oslo", "Bergen", "Stavanger"]
    },
    compliance: {
      strictnessLevel: "Very High",
      commonIssues: ["Extremely high import taxes", "Complex tax calculations", "Strict environmental standards"],
      bestPractices: ["Calculate all taxes before purchase", "Consider electric alternatives", "Use certified agents"],
      internationalAgreements: ["EEA", "Nordic cooperation", "WTO"]
    },
    lastUpdated: "2025-06-08"
  },

  "DK": {
    countryCode: "DK",
    countryName: "Denmark",
    authority: "Færdselsstyrelsen",
    governmentWebsite: "https://www.fstyr.dk/",
    currency: "DKK",
    registration: {
      requiresInspection: true,
      inspectionType: ["Periodisk syn", "Individuel godkendelse", "EU-typegodkendelse"],
      registrationFee: 1180,
      licensePlateFee: 500,
      processingTime: "14-21 business days",
      difficultyLevel: "Complex"
    },
    importRequirements: {
      additionalInspections: ["Registreringssyn", "Individuel godkendelse", "Miljøgodkendelse"],
      requiredDocuments: ["EU-overensstemmelseserklæring", "Faktura", "Forsikringsbevis", "Importdokumentation"],
      specialRequirements: ["Danish CPR number", "Registration tax payment", "Environmental compliance"],
      exemptions: ["EU type-approved vehicles", "Veteran vehicles 35+ years"],
      restrictedVehicles: ["Non-EU vehicles without approval", "High-emission vehicles"],
      complianceCertRequired: true
    },
    fees: {
      importDuty: 10.0,
      vat: 25.0,
      registrationTax: 85000, // Registreringsafgift (varies significantly by value)
      documentationFee: 500,
      inspectionFee: 1830, // Syn costs
      environmentalTax: 0, // Included in registration tax
      additionalFees: [
        { name: "Registreringsafgift", amount: 25000, description: "Registration tax (85-150% of value)" },
        { name: "Årsafgift", amount: 2500, description: "Annual vehicle tax" },
        { name: "Miljøtillæg", amount: 0, description: "Environmental surcharge (varies)" }
      ]
    },
    regional: {
      estimatedDays: 21,
      peakSeasons: ["Summer vacation", "Holiday periods"],
      recommendedAgents: ["FDM", "Synscenter", "Bilimport specialister"],
      commonDelays: ["Registration tax calculation", "Syn appointments", "EU documentation"],
      regionalTips: ["Calculate registration tax carefully", "Use established importers", "Consider vehicle value impact"],
      advantages: ["Well-organized system", "Good infrastructure", "EU membership benefits"],
      majorPorts: ["Copenhagen", "Aarhus", "Aalborg"]
    },
    compliance: {
      strictnessLevel: "High",
      commonIssues: ["Very high registration tax", "Complex tax calculations", "EU compliance requirements"],
      bestPractices: ["Calculate total costs including registration tax", "Use certified inspection centers", "Ensure EU compliance"],
      internationalAgreements: ["EU", "Nordic cooperation", "Schengen"]
    },
    lastUpdated: "2025-06-08"
  },

  // ASIA-PACIFIC
  "SG": {
    countryCode: "SG",
    countryName: "Singapore",
    authority: "Land Transport Authority (LTA)",
    governmentWebsite: "https://www.lta.gov.sg/",
    currency: "SGD",
    registration: {
      requiresInspection: true,
      inspectionType: ["LTA Inspection", "VICOM Test", "COE Bidding"],
      registrationFee: 220,
      licensePlateFee: 50,
      processingTime: "21-35 business days",
      difficultyLevel: "Very Complex"
    },
    importRequirements: {
      additionalInspections: ["LTA Type Approval", "VICOM Inspection", "Emissions Test"],
      requiredDocuments: ["Certificate of Entitlement", "Import Permit", "Insurance", "Original Registration"],
      specialRequirements: ["Certificate of Entitlement (COE)", "Vehicle quota system", "Left-hand drive restrictions"],
      exemptions: ["Classic cars with approval", "Diplomatic vehicles"],
      restrictedVehicles: ["Vehicles over 10 years old", "Right-hand drive vehicles", "Modified vehicles"],
      complianceCertRequired: true
    },
    fees: {
      importDuty: 20.0, // For most vehicles
      vat: 7.0, // GST
      registrationTax: 180.0, // ARF - Additional Registration Fee
      documentationFee: 220,
      inspectionFee: 142,
      environmentalTax: 0, // Included in other fees
      additionalFees: [
        { name: "COE", amount: 80000, description: "Certificate of Entitlement (varies by category)" },
        { name: "ARF", amount: 45000, description: "Additional Registration Fee (100-180% of OMV)" },
        { name: "PARF", amount: 0, description: "Preferential Additional Registration Fee (refundable)" }
      ]
    },
    regional: {
      estimatedDays: 42,
      peakSeasons: ["Chinese New Year", "Year-end COE bidding"],
      recommendedAgents: ["Authorised Dealers", "Parallel Importers", "LTA Approved Agents"],
      commonDelays: ["COE bidding cycles", "LTA inspection slots", "Documentation approval"],
      regionalTips: ["Understand COE system", "Consider vehicle age limits", "Use authorized dealers"],
      advantages: ["Strategic location", "Efficient port", "High-quality infrastructure"],
      majorPorts: ["Singapore Port"]
    },
    compliance: {
      strictnessLevel: "Very High",
      commonIssues: ["Extremely high costs", "Complex quota system", "Age restrictions"],
      bestPractices: ["Understand total cost structure", "Work with established dealers", "Consider leasing options"],
      internationalAgreements: ["ASEAN", "CPTPP", "RCEP"]
    },
    lastUpdated: "2025-06-08"
  },

  "HK": {
    countryCode: "HK",
    countryName: "Hong Kong",
    authority: "Transport Department",
    governmentWebsite: "https://www.td.gov.hk/",
    currency: "HKD",
    registration: {
      requiresInspection: true,
      inspectionType: ["Vehicle Examination", "Type Approval", "Annual Examination"],
      registrationFee: 1050,
      licensePlateFee: 540,
      processingTime: "14-28 business days",
      difficultyLevel: "Complex"
    },
    importRequirements: {
      additionalInspections: ["Vehicle Examination", "Emissions Test", "Safety Inspection"],
      requiredDocuments: ["Type Approval Certificate", "Import License", "Invoice", "Insurance"],
      specialRequirements: ["Type approval required", "Right-hand drive", "Hong Kong standards"],
      exemptions: ["Temporary imports", "Transit vehicles"],
      restrictedVehicles: ["Left-hand drive vehicles", "Non-approved types", "Commercial vehicles"],
      complianceCertRequired: true
    },
    fees: {
      importDuty: 0.0, // No import duty for most private cars
      vat: 0.0, // No VAT in Hong Kong
      registrationTax: 0.0, // First Registration Tax varies
      documentationFee: 540,
      inspectionFee: 585,
      environmentalTax: 0,
      additionalFees: [
        { name: "First Registration Tax", amount: 15000, description: "45-115% of taxable value" },
        { name: "License Fee", amount: 4800, description: "Annual license fee" },
        { name: "Examination Fee", amount: 585, description: "Vehicle examination" }
      ]
    },
    regional: {
      estimatedDays: 24,
      peakSeasons: ["Chinese New Year", "Summer months"],
      recommendedAgents: ["Authorized Dealers", "Vehicle Importers", "Examination Centers"],
      commonDelays: ["Type approval process", "Examination scheduling", "Documentation"],
      regionalTips: ["Ensure right-hand drive", "Understand tax structure", "Use established importers"],
      advantages: ["Free port status", "No import duty", "Strategic location"],
      majorPorts: ["Hong Kong Port"]
    },
    compliance: {
      strictnessLevel: "High",
      commonIssues: ["Type approval requirements", "High registration tax", "Right-hand drive requirement"],
      bestPractices: ["Ensure type approval", "Calculate total tax burden", "Use authorized agents"],
      internationalAgreements: ["WTO", "CEPA", "Various FTAs"]
    },
    lastUpdated: "2025-06-08"
  },

  "NZ": {
    countryCode: "NZ",
    countryName: "New Zealand",
    authority: "Waka Kotahi NZ Transport Agency",
    governmentWebsite: "https://www.nzta.govt.nz/",
    currency: "NZD",
    registration: {
      requiresInspection: true,
      inspectionType: ["Entry Certification", "Warrant of Fitness", "Certificate of Fitness"],
      registrationFee: 95.60,
      licensePlateFee: 34.90,
      processingTime: "7-21 business days",
      difficultyLevel: "Moderate"
    },
    importRequirements: {
      additionalInspections: ["Entry Certification", "Border Inspection", "Compliance Inspection"],
      requiredDocuments: ["Import Approval", "Overseas Registration", "Shipping Documents", "Insurance"],
      specialRequirements: ["Biosecurity clearance", "Specialist vehicle requirements", "Entry certification"],
      exemptions: ["Returning resident vehicles", "Temporary imports"],
      restrictedVehicles: ["Vehicles over 20 years without specialist approval", "Left-hand drive vehicles"],
      complianceCertRequired: true
    },
    fees: {
      importDuty: 0.0, // Free trade agreement rates
      vat: 15.0, // GST
      registrationTax: 0.0, // No registration tax
      documentationFee: 34.90,
      inspectionFee: 200.00, // Entry certification
      environmentalTax: 0,
      additionalFees: [
        { name: "Entry Certification", amount: 200, description: "Compliance certification" },
        { name: "Border Inspection", amount: 165, description: "Biosecurity and customs inspection" },
        { name: "Registration", amount: 95.60, description: "Vehicle registration" }
      ]
    },
    regional: {
      estimatedDays: 21,
      peakSeasons: ["Summer months", "Holiday periods"],
      recommendedAgents: ["Licensed Vehicle Importers", "Entry Certifiers", "Compliance Specialists"],
      commonDelays: ["Biosecurity clearance", "Entry certification", "Shipping schedules"],
      regionalTips: ["Use licensed importers", "Ensure right-hand drive", "Plan for biosecurity delays"],
      advantages: ["Right-hand drive market", "Established import industry", "No registration tax"],
      majorPorts: ["Auckland", "Wellington", "Christchurch"]
    },
    compliance: {
      strictnessLevel: "Moderate",
      commonIssues: ["Biosecurity requirements", "Entry certification", "Age restrictions"],
      bestPractices: ["Use licensed importers", "Ensure compliance before shipping", "Plan adequate timeline"],
      internationalAgreements: ["CPTPP", "RCEP", "Various FTAs"]
    },
    lastUpdated: "2025-06-08"
  },

  "ZA": {
    countryCode: "ZA",
    countryName: "South Africa",
    authority: "Department of Transport",
    governmentWebsite: "https://www.transport.gov.za/",
    currency: "ZAR",
    registration: {
      requiresInspection: true,
      inspectionType: ["Roadworthy Certificate", "Registration Inspection", "Compliance Test"],
      registrationFee: 425,
      licensePlateFee: 195,
      processingTime: "14-28 business days",
      difficultyLevel: "Moderate"
    },
    importRequirements: {
      additionalInspections: ["Import Permit Inspection", "SABS Compliance", "Roadworthy Test"],
      requiredDocuments: ["Import Permit", "Letter of Authority", "SABS Certificate", "Customs Documentation"],
      specialRequirements: ["Import permit required", "SABS compliance", "Right-hand drive"],
      exemptions: ["Returning residents", "Temporary imports", "Diplomatic vehicles"],
      restrictedVehicles: ["Left-hand drive vehicles", "Vehicles over 5 years without permit"],
      complianceCertRequired: true
    },
    fees: {
      importDuty: 25.0, // For most vehicles
      vat: 15.0,
      registrationTax: 0.0, // No registration tax
      documentationFee: 195,
      inspectionFee: 350,
      environmentalTax: 0,
      additionalFees: [
        { name: "Import Permit", amount: 2500, description: "Department of Trade permit" },
        { name: "SABS Testing", amount: 1500, description: "Standards compliance testing" },
        { name: "Roadworthy Certificate", amount: 350, description: "Vehicle roadworthy inspection" }
      ]
    },
    regional: {
      estimatedDays: 35,
      peakSeasons: ["December holidays", "Easter period"],
      recommendedAgents: ["MIOSA Members", "Vehicle Importers", "Clearing Agents"],
      commonDelays: ["Import permit processing", "SABS compliance", "Port congestion"],
      regionalTips: ["Obtain import permit early", "Ensure SABS compliance", "Use experienced clearing agents"],
      advantages: ["Right-hand drive market", "Established automotive industry", "Multiple entry ports"],
      majorPorts: ["Durban", "Cape Town", "Port Elizabeth"]
    },
    compliance: {
      strictnessLevel: "Moderate",
      commonIssues: ["Import permit delays", "SABS compliance", "Currency fluctuations"],
      bestPractices: ["Apply for permits early", "Ensure standards compliance", "Use established importers"],
      internationalAgreements: ["SADC", "AfCFTA", "Various bilateral agreements"]
    },
    lastUpdated: "2025-06-08"
  }
};

/**
 * Get global country regulation by country code
 */
export function getGlobalCountryRegulation(countryCode: string): GlobalRegionalRegulation | null {
  return GLOBAL_REGIONAL_REGULATIONS[countryCode.toUpperCase()] || null;
}

/**
 * Calculate total global country-specific costs
 */
export function calculateGlobalCountryCosts(countryCode: string, vehicleValue: number): {
  country: GlobalRegionalRegulation;
  totalCost: number;
  breakdown: {
    importDuty: number;
    vat: number;
    registrationTax: number;
    inspectionFees: number;
    additionalFees: number;
  };
  totalFees: number;
} | null {
  const country = getGlobalCountryRegulation(countryCode);
  if (!country) return null;

  const importDuty = vehicleValue * (country.fees.importDuty / 100);
  const vat = vehicleValue * (country.fees.vat / 100);
  const registrationTax = vehicleValue * (country.fees.registrationTax / 100);
  const inspectionFees = country.fees.inspectionFee + country.fees.documentationFee;
  const additionalFees = country.fees.additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

  const totalFees = inspectionFees + country.registration.registrationFee + country.registration.licensePlateFee + additionalFees;
  const totalCost = importDuty + vat + registrationTax + totalFees;

  return {
    country,
    totalCost: Math.round(totalCost),
    breakdown: {
      importDuty: Math.round(importDuty),
      vat: Math.round(vat),
      registrationTax: Math.round(registrationTax),
      inspectionFees: Math.round(inspectionFees),
      additionalFees: Math.round(additionalFees)
    },
    totalFees: Math.round(totalFees)
  };
}

/**
 * Get all supported countries for global coverage
 */
export function getAllSupportedCountries(): string[] {
  return Object.keys(GLOBAL_REGIONAL_REGULATIONS);
}

/**
 * Find best global countries for import by criteria
 */
export function findBestGlobalCountriesForImport(criteria: {
  prioritizeCost?: boolean;
  prioritizeSpeed?: boolean;
  prioritizeSimplicity?: boolean;
  region?: string;
}): GlobalRegionalRegulation[] {
  const countries = Object.values(GLOBAL_REGIONAL_REGULATIONS);
  
  return countries.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (criteria.prioritizeCost) {
      scoreA += (a.fees.importDuty < 15 ? 3 : 0) + (a.fees.vat < 20 ? 2 : 0);
      scoreB += (b.fees.importDuty < 15 ? 3 : 0) + (b.fees.vat < 20 ? 2 : 0);
    }

    if (criteria.prioritizeSpeed) {
      scoreA += (a.regional.estimatedDays < 21 ? 3 : 0);
      scoreB += (b.regional.estimatedDays < 21 ? 3 : 0);
    }

    if (criteria.prioritizeSimplicity) {
      scoreA += (a.registration.difficultyLevel === "Easy" ? 3 : 
                a.registration.difficultyLevel === "Moderate" ? 2 : 0);
      scoreB += (b.registration.difficultyLevel === "Easy" ? 3 : 
                b.registration.difficultyLevel === "Moderate" ? 2 : 0);
    }

    return scoreB - scoreA;
  });
}