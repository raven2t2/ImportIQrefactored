/**
 * Global Intelligence Modules
 * Refactored tools for seamless integration across all target countries
 * Each module provides country-specific intelligence without exposing complexity to users
 */

// ==================== PORT INTELLIGENCE SYSTEM ====================

export interface GlobalPort {
  code: string;
  name: string;
  city: string;
  region: string; // state/province
  country: string;
  coordinates: { latitude: number; longitude: number };
  
  // Operational Intelligence
  operations: {
    vehicleCapable: boolean;
    monthlyCapacity: number;
    averageProcessingDays: number;
    operatingHours: string;
    congestionLevel: "Low" | "Moderate" | "High" | "Critical";
  };
  
  // Cost Intelligence
  costs: {
    portHandling: number;
    inspectionFees: number;
    storageDailyRate: number;
    documentationFees: number;
    averageTotalCost: number;
  };
  
  // Strategic Intelligence
  strategic: {
    proximityToMajorCities: { [city: string]: { distance: number; driveTime: string } };
    recommendedFor: string[];
    challenges: string[];
    bestMonths: string[];
  };
}

export const GLOBAL_PORT_INTELLIGENCE: Record<string, GlobalPort[]> = {
  AU: [
    {
      code: "AUSYD",
      name: "Port Botany",
      city: "Sydney",
      region: "NSW",
      country: "Australia",
      coordinates: { latitude: -33.9444, longitude: 151.2309 },
      operations: {
        vehicleCapable: true,
        monthlyCapacity: 15000,
        averageProcessingDays: 7,
        operatingHours: "24/7",
        congestionLevel: "High"
      },
      costs: {
        portHandling: 850,
        inspectionFees: 320,
        storageDailyRate: 45,
        documentationFees: 180,
        averageTotalCost: 1800
      },
      strategic: {
        proximityToMajorCities: {
          "Sydney": { distance: 15, driveTime: "25 mins" },
          "Melbourne": { distance: 880, driveTime: "9 hours" }
        },
        recommendedFor: ["High-value vehicles", "Quick processing"],
        challenges: ["High congestion", "Premium costs"],
        bestMonths: ["Apr", "May", "Sep", "Oct"]
      }
    },
    {
      code: "AUMEL",
      name: "Port of Melbourne",
      city: "Melbourne", 
      region: "VIC",
      country: "Australia",
      coordinates: { latitude: -37.8304, longitude: 144.9369 },
      operations: {
        vehicleCapable: true,
        monthlyCapacity: 12000,
        averageProcessingDays: 8,
        operatingHours: "Mon-Fri 7AM-6PM",
        congestionLevel: "Moderate"
      },
      costs: {
        portHandling: 720,
        inspectionFees: 290,
        storageDailyRate: 38,
        documentationFees: 160,
        averageTotalCost: 1500
      },
      strategic: {
        proximityToMajorCities: {
          "Melbourne": { distance: 5, driveTime: "15 mins" },
          "Adelaide": { distance: 730, driveTime: "7.5 hours" }
        },
        recommendedFor: ["Cost-conscious imports", "Victorian registration"],
        challenges: ["Limited weekend operations"],
        bestMonths: ["Mar", "Apr", "Oct", "Nov"]
      }
    }
  ],
  
  US: [
    {
      code: "USLAX",
      name: "Port of Los Angeles",
      city: "Los Angeles",
      region: "CA",
      country: "United States",
      coordinates: { latitude: 33.7361, longitude: -118.2922 },
      operations: {
        vehicleCapable: true,
        monthlyCapacity: 25000,
        averageProcessingDays: 10,
        operatingHours: "24/7",
        congestionLevel: "Critical"
      },
      costs: {
        portHandling: 1200,
        inspectionFees: 450,
        storageDailyRate: 65,
        documentationFees: 250,
        averageTotalCost: 2800
      },
      strategic: {
        proximityToMajorCities: {
          "Los Angeles": { distance: 32, driveTime: "45 mins" },
          "San Diego": { distance: 190, driveTime: "3 hours" }
        },
        recommendedFor: ["West Coast delivery", "Large volume imports"],
        challenges: ["Severe congestion", "High costs", "Complex regulations"],
        bestMonths: ["Jan", "Feb", "Nov", "Dec"]
      }
    }
  ],
  
  UK: [
    {
      code: "GBSOU",
      name: "Port of Southampton",
      city: "Southampton",
      region: "ENG",
      country: "United Kingdom",
      coordinates: { latitude: 50.8973, longitude: -1.3932 },
      operations: {
        vehicleCapable: true,
        monthlyCapacity: 18000,
        averageProcessingDays: 6,
        operatingHours: "Mon-Sat 6AM-10PM",
        congestionLevel: "Low"
      },
      costs: {
        portHandling: 650,
        inspectionFees: 180,
        storageDailyRate: 25,
        documentationFees: 120,
        averageTotalCost: 1200
      },
      strategic: {
        proximityToMajorCities: {
          "London": { distance: 130, driveTime: "1.5 hours" },
          "Birmingham": { distance: 200, driveTime: "2.5 hours" }
        },
        recommendedFor: ["UK-wide distribution", "Efficient processing"],
        challenges: ["Limited capacity during peak"],
        bestMonths: ["May", "Jun", "Sep", "Oct"]
      }
    }
  ],
  
  CA: [
    {
      code: "CAVAN",
      name: "Port of Vancouver",
      city: "Vancouver",
      region: "BC",
      country: "Canada",
      coordinates: { latitude: 49.2937, longitude: -123.1093 },
      operations: {
        vehicleCapable: true,
        monthlyCapacity: 8000,
        averageProcessingDays: 9,
        operatingHours: "Mon-Fri 7AM-7PM",
        congestionLevel: "Moderate"
      },
      costs: {
        portHandling: 580,
        inspectionFees: 220,
        storageDailyRate: 35,
        documentationFees: 140,
        averageTotalCost: 1300
      },
      strategic: {
        proximityToMajorCities: {
          "Vancouver": { distance: 25, driveTime: "35 mins" },
          "Calgary": { distance: 1050, driveTime: "11 hours" }
        },
        recommendedFor: ["Western Canada", "Pacific imports"],
        challenges: ["Weather delays in winter"],
        bestMonths: ["Apr", "May", "Jun", "Sep"]
      }
    }
  ]
};

// ==================== SHIPPING LINE INTELLIGENCE ====================

export interface ShippingLineIntelligence {
  name: string;
  routes: {
    from: string;
    to: string;
    transitDays: number;
    frequency: string; // "Weekly", "Bi-weekly"
    reliability: number; // 1-100 score
  }[];
  costs: {
    containerSize: "20ft" | "40ft";
    baseRate: number;
    fuelSurcharge: number;
    securityFee: number;
  }[];
  reputation: {
    onTimePerformance: number;
    damageClaims: number; // per 1000 shipments
    customerSatisfaction: number;
  };
}

export const GLOBAL_SHIPPING_INTELLIGENCE: ShippingLineIntelligence[] = [
  {
    name: "Mitsui O.S.K. Lines (MOL)",
    routes: [
      { from: "Tokyo", to: "Sydney", transitDays: 14, frequency: "Weekly", reliability: 92 },
      { from: "Tokyo", to: "Los Angeles", transitDays: 11, frequency: "Daily", reliability: 88 },
      { from: "Tokyo", to: "Southampton", transitDays: 24, frequency: "Bi-weekly", reliability: 85 }
    ],
    costs: [
      { containerSize: "20ft", baseRate: 2800, fuelSurcharge: 340, securityFee: 85 },
      { containerSize: "40ft", baseRate: 4200, fuelSurcharge: 520, securityFee: 125 }
    ],
    reputation: {
      onTimePerformance: 89,
      damageClaims: 0.8,
      customerSatisfaction: 91
    }
  }
];

// ==================== COMPLIANCE INTELLIGENCE SYSTEM ====================

export interface ComplianceRequirement {
  category: string;
  requirement: string;
  mandatory: boolean;
  estimatedCost: number;
  processingTime: string;
  complexity: "Low" | "Medium" | "High" | "Critical";
  documentation: string[];
  commonIssues: string[];
  tips: string[];
}

export const GLOBAL_COMPLIANCE_INTELLIGENCE: Record<string, Record<string, ComplianceRequirement[]>> = {
  AU: {
    QLD: [
      {
        category: "Vehicle Registration",
        requirement: "Queensland Transport Safety Certificate",
        mandatory: true,
        estimatedCost: 180,
        processingTime: "3-5 business days",
        complexity: "Medium",
        documentation: ["Import approval", "Vehicle inspection report"],
        commonIssues: ["Headlight alignment", "Speedometer calibration"],
        tips: ["Book inspection early", "Use certified workshop"]
      }
    ],
    NSW: [
      {
        category: "Vehicle Registration", 
        requirement: "Pink Slip Safety Inspection",
        mandatory: true,
        estimatedCost: 220,
        processingTime: "Same day",
        complexity: "High",
        documentation: ["Import approval", "Engineering certificate"],
        commonIssues: ["Emissions compliance", "Modification declarations"],
        tips: ["Pre-inspection recommended", "Engineer report essential"]
      }
    ]
  },
  
  US: {
    CA: [
      {
        category: "Emissions Compliance",
        requirement: "CARB Emissions Certification",
        mandatory: true,
        estimatedCost: 2500,
        processingTime: "4-8 weeks",
        complexity: "Critical",
        documentation: ["EPA form 3520-1", "CARB executive order"],
        commonIssues: ["Engine modifications required", "Catalyst replacement"],
        tips: ["Start process immediately", "Use CARB-approved facility"]
      }
    ],
    TX: [
      {
        category: "Vehicle Registration",
        requirement: "Texas Safety Inspection",
        mandatory: true,
        estimatedCost: 45,
        processingTime: "1 hour",
        complexity: "Low",
        documentation: ["Title", "Insurance proof"],
        commonIssues: ["Light compliance", "Tire condition"],
        tips: ["Quick process", "Many inspection stations available"]
      }
    ]
  }
};

// ==================== INTELLIGENCE QUERY FUNCTIONS ====================

export function getBestPortForRegion(country: string, region: string): GlobalPort | null {
  const countryPorts = GLOBAL_PORT_INTELLIGENCE[country];
  if (!countryPorts) return null;
  
  // Prefer ports in same region, then by cost efficiency
  const sameRegionPorts = countryPorts.filter(port => port.region === region);
  if (sameRegionPorts.length > 0) {
    return sameRegionPorts.sort((a, b) => a.costs.averageTotalCost - b.costs.averageTotalCost)[0];
  }
  
  // Fallback to most cost-effective port in country
  return countryPorts.sort((a, b) => a.costs.averageTotalCost - b.costs.averageTotalCost)[0];
}

export function getOptimalShippingRoute(fromCountry: string, toCountry: string, vehicleValue: number): {
  recommendedLine: ShippingLineIntelligence;
  route: any;
  estimatedCost: number;
  reasoning: string;
} | null {
  // Intelligence-based shipping optimization
  const routes = GLOBAL_SHIPPING_INTELLIGENCE[0].routes.filter(route => 
    route.to.toLowerCase().includes(toCountry.toLowerCase())
  );
  
  if (routes.length === 0) return null;
  
  const bestRoute = routes.sort((a, b) => b.reliability - a.reliability)[0];
  const line = GLOBAL_SHIPPING_INTELLIGENCE[0];
  
  const containerCost = vehicleValue > 30000 ? 
    line.costs.find(c => c.containerSize === "40ft") : 
    line.costs.find(c => c.containerSize === "20ft");
  
  return {
    recommendedLine: line,
    route: bestRoute,
    estimatedCost: containerCost ? containerCost.baseRate + containerCost.fuelSurcharge + containerCost.securityFee : 3500,
    reasoning: vehicleValue > 30000 ? 
      "40ft container recommended for high-value vehicle protection" : 
      "20ft container sufficient, cost-optimized"
  };
}

export function getComplianceRoadmap(country: string, region: string): {
  criticalRequirements: ComplianceRequirement[];
  totalEstimatedCost: number;
  totalTimelineWeeks: number;
  riskFactors: string[];
} {
  const regionCompliance = GLOBAL_COMPLIANCE_INTELLIGENCE[country]?.[region] || [];
  
  const critical = regionCompliance.filter(req => req.complexity === "Critical" || req.complexity === "High");
  const totalCost = regionCompliance.reduce((sum, req) => sum + req.estimatedCost, 0);
  
  return {
    criticalRequirements: critical,
    totalEstimatedCost: totalCost,
    totalTimelineWeeks: Math.max(8, critical.length * 2),
    riskFactors: critical.flatMap(req => req.commonIssues).slice(0, 3)
  };
}

// ==================== INTELLIGENT RECOMMENDATIONS ====================

export function generateIntelligentRecommendations(
  vehicleData: any,
  targetCountry: string,
  targetRegion: string
): {
  portRecommendation: string;
  shippingStrategy: string;
  complianceAlerts: string[];
  costOptimization: string;
  timelineOptimization: string;
} {
  const port = getBestPortForRegion(targetCountry, targetRegion);
  const shipping = getOptimalShippingRoute("JP", targetCountry, vehicleData.price || 25000);
  const compliance = getComplianceRoadmap(targetCountry, targetRegion);
  
  return {
    portRecommendation: port ? 
      `${port.name} recommended - ${port.strategic.recommendedFor.join(", ")}` :
      "Contact for port recommendations",
    
    shippingStrategy: shipping ? 
      `${shipping.recommendedLine.name} - ${shipping.reasoning}` :
      "Multiple shipping options available",
    
    complianceAlerts: compliance.riskFactors.map(risk => 
      `⚠️ ${risk} - prepare documentation early`
    ),
    
    costOptimization: port && compliance.totalEstimatedCost > 2000 ?
      `Consider ${port.region} registration to reduce costs by $${(compliance.totalEstimatedCost * 0.15).toFixed(0)}` :
      "Current region offers competitive costs",
    
    timelineOptimization: compliance.totalTimelineWeeks > 8 ?
      "Start compliance process during shipping transit to save 2-3 weeks" :
      "Standard timeline achievable with proper preparation"
  };
}