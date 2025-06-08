/**
 * Global Intelligence Integration Layer
 * Seamlessly integrates refactored tools into the user flow
 * Provides behind-the-scenes optimization without exposing complexity
 */

import { 
  generateIntelligentRecommendations, 
  getBestPortForRegion, 
  getOptimalShippingRoute, 
  getComplianceRoadmap,
  GLOBAL_PORT_INTELLIGENCE 
} from './global-intelligence-modules';

export interface SeamlessIntelligenceResult {
  // Enhanced cost breakdown with optimizations
  optimizedCosts: {
    portHandling: number;
    shipping: number;
    compliance: number;
    totalSavings: number;
    savingsSource: string;
  };
  
  // Timeline optimization
  timelineEnhancements: {
    originalWeeks: number;
    optimizedWeeks: number;
    timeSavings: number;
    optimizationStrategy: string;
  };
  
  // Strategic recommendations (user-friendly)
  strategicInsights: {
    portAdvantage: string;
    shippingStrategy: string;
    complianceOptimization: string;
    riskMitigation: string[];
  };
  
  // Background intelligence (not exposed to user)
  backgroundIntelligence: {
    selectedPort: any;
    shippingRoute: any;
    complianceData: any;
    alternativeOptions: any[];
  };
}

/**
 * Primary integration function that enhances user experience
 * without exposing the complexity of individual modules
 */
export function enhanceImportJourney(
  vehicleData: {
    make: string;
    model: string;
    year: number;
    price: number;
  },
  userSelection: {
    targetCountry: string;
    targetRegion: string;
    priority: 'cost' | 'speed' | 'reliability';
  }
): SeamlessIntelligenceResult {
  
  // Generate comprehensive intelligence using refactored modules
  const recommendations = generateIntelligentRecommendations(
    vehicleData, 
    userSelection.targetCountry, 
    userSelection.targetRegion
  );
  
  const optimalPort = getBestPortForRegion(userSelection.targetCountry, userSelection.targetRegion);
  const shippingStrategy = getOptimalShippingRoute("JP", userSelection.targetCountry, vehicleData.price);
  const complianceRoadmap = getComplianceRoadmap(userSelection.targetCountry, userSelection.targetRegion);
  
  // Calculate optimizations based on user priority
  const basePortCost = 2000; // Standard port handling
  const baseShipping = 3500; // Standard shipping
  const baseCompliance = 4000; // Standard compliance
  const baseTimeline = 12; // Standard 12 weeks
  
  const optimizedPortCost = optimalPort?.costs.averageTotalCost || basePortCost;
  const optimizedShipping = shippingStrategy?.estimatedCost || baseShipping;
  const optimizedCompliance = complianceRoadmap.totalEstimatedCost || baseCompliance;
  const optimizedTimeline = Math.max(6, complianceRoadmap.totalTimelineWeeks);
  
  // Calculate savings and optimizations
  const portSavings = Math.max(0, basePortCost - optimizedPortCost);
  const shippingSavings = Math.max(0, baseShipping - optimizedShipping);
  const complianceSavings = Math.max(0, baseCompliance - optimizedCompliance);
  const totalSavings = portSavings + shippingSavings + complianceSavings;
  const timeSavings = Math.max(0, baseTimeline - optimizedTimeline);
  
  // Generate user-friendly insights
  const portAdvantage = optimalPort 
    ? `${optimalPort.name} selected for ${optimalPort.strategic.recommendedFor[0]?.toLowerCase() || 'optimal processing'}`
    : "Standard port processing recommended";
    
  const shippingStrategyText = shippingStrategy
    ? `${shippingStrategy.recommendedLine.name} routing optimized for ${userSelection.priority}`
    : "Standard shipping arrangements";
    
  const complianceOptimization = complianceRoadmap.criticalRequirements.length > 0
    ? `${complianceRoadmap.criticalRequirements.length} critical requirements identified and streamlined`
    : "Standard compliance pathway confirmed";
    
  // Determine savings source
  let savingsSource = "baseline optimization";
  if (portSavings > shippingSavings && portSavings > complianceSavings) {
    savingsSource = "strategic port selection";
  } else if (shippingSavings > complianceSavings) {
    savingsSource = "shipping route optimization";
  } else if (complianceSavings > 0) {
    savingsSource = "compliance pathway efficiency";
  }
  
  // Determine optimization strategy
  let optimizationStrategy = "standard processing";
  if (timeSavings >= 4) {
    optimizationStrategy = "accelerated compliance processing";
  } else if (timeSavings >= 2) {
    optimizationStrategy = "parallel processing optimization";
  } else if (timeSavings > 0) {
    optimizationStrategy = "minor timeline improvements";
  }
  
  return {
    optimizedCosts: {
      portHandling: optimizedPortCost,
      shipping: optimizedShipping,
      compliance: optimizedCompliance,
      totalSavings,
      savingsSource
    },
    
    timelineEnhancements: {
      originalWeeks: baseTimeline,
      optimizedWeeks: optimizedTimeline,
      timeSavings,
      optimizationStrategy
    },
    
    strategicInsights: {
      portAdvantage,
      shippingStrategy: shippingStrategyText,
      complianceOptimization,
      riskMitigation: complianceRoadmap.riskFactors.slice(0, 2).map(risk => 
        `Proactive ${risk.toLowerCase()} management`
      )
    },
    
    backgroundIntelligence: {
      selectedPort: optimalPort,
      shippingRoute: shippingStrategy,
      complianceData: complianceRoadmap,
      alternativeOptions: [
        {
          type: "port",
          alternatives: GLOBAL_PORT_INTELLIGENCE[userSelection.targetCountry.toUpperCase()]?.slice(0, 2) || []
        },
        {
          type: "shipping",
          alternatives: shippingStrategy ? [
            {
              option: "Standard Service",
              cost: shippingStrategy.estimatedCost * 0.9,
              days: (shippingStrategy.route.transitDays || 14) + 3
            },
            {
              option: "Express Service",
              cost: shippingStrategy.estimatedCost * 1.3,
              days: (shippingStrategy.route.transitDays || 14) - 2
            }
          ] : []
        }
      ]
    }
  };
}

/**
 * Quick optimization check for real-time UI updates
 * Provides instant feedback without full intelligence processing
 */
export function getQuickOptimizationPreview(
  targetCountry: string,
  targetRegion: string
): {
  estimatedSavings: number;
  optimizationLevel: 'Low' | 'Medium' | 'High';
  keyBenefit: string;
} {
  const port = getBestPortForRegion(targetCountry, targetRegion);
  const compliance = getComplianceRoadmap(targetCountry, targetRegion);
  
  const estimatedSavings = Math.round(
    (port?.costs.averageTotalCost || 2000) * 0.1 + 
    compliance.totalEstimatedCost * 0.05
  );
  
  const optimizationLevel = estimatedSavings > 1000 ? 'High' : 
                           estimatedSavings > 500 ? 'Medium' : 'Low';
  
  const keyBenefit = port 
    ? `${port.strategic.recommendedFor[0]} via ${port.name}`
    : "Standard processing pathway";
  
  return {
    estimatedSavings,
    optimizationLevel,
    keyBenefit
  };
}

/**
 * Generate country-specific sandbox data for testing
 * Each country gets customized intelligence modules
 */
export function generateCountrySandbox(country: string): {
  availablePorts: any[];
  complianceRequirements: any[];
  shippingRoutes: any[];
  optimizationOpportunities: string[];
} {
  const countryPorts = GLOBAL_PORT_INTELLIGENCE[country.toUpperCase()] || [];
  
  return {
    availablePorts: countryPorts,
    complianceRequirements: Object.values(getComplianceRoadmap(country, 'default').criticalRequirements || []),
    shippingRoutes: [
      {
        from: "Japan",
        to: country,
        options: ["Standard", "Express", "Economy"]
      }
    ],
    optimizationOpportunities: [
      "Port selection optimization",
      "Shipping route efficiency",
      "Compliance pathway streamlining",
      "Timeline acceleration",
      "Cost reduction strategies"
    ]
  };
}