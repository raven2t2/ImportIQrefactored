/**
 * Shipping Cost Calculator using public port data and standard freight rates
 * Provides real shipping cost estimates using distance calculations and market rates
 */

interface Port {
  code: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  isCarPort: boolean;
}

interface ShippingQuote {
  origin: Port;
  destination: Port;
  distance: number;
  estimatedDays: number;
  costs: {
    roro: {
      low: number;
      high: number;
      currency: string;
    };
    container: {
      low: number;
      high: number;
      currency: string;
    };
  };
  additionalFees: {
    handling: number;
    documentation: number;
    insurance: number;
  };
  totalEstimate: {
    roroLow: number;
    roroHigh: number;
    containerLow: number;
    containerHigh: number;
  };
  disclaimer: string;
}

// Major vehicle shipping ports with accurate coordinates
const VEHICLE_PORTS: Port[] = [
  // Japan - Major vehicle export ports
  {
    code: 'YOK',
    name: 'Yokohama',
    country: 'Japan',
    latitude: 35.4437,
    longitude: 139.6380,
    isCarPort: true
  },
  {
    code: 'TOY',
    name: 'Toyohashi',
    country: 'Japan',
    latitude: 34.7693,
    longitude: 137.3914,
    isCarPort: true
  },
  {
    code: 'OSA',
    name: 'Osaka',
    country: 'Japan',
    latitude: 34.6651,
    longitude: 135.4317,
    isCarPort: true
  },
  {
    code: 'KOB',
    name: 'Kobe',
    country: 'Japan',
    latitude: 34.6901,
    longitude: 135.1956,
    isCarPort: true
  },
  
  // USA - Major vehicle export ports
  {
    code: 'LAX',
    name: 'Los Angeles',
    country: 'USA',
    latitude: 33.7454,
    longitude: -118.2531,
    isCarPort: true
  },
  {
    code: 'SEA',
    name: 'Seattle',
    country: 'USA',
    latitude: 47.6062,
    longitude: -122.3321,
    isCarPort: true
  },
  {
    code: 'NYK',
    name: 'New York/New Jersey',
    country: 'USA',
    latitude: 40.6626,
    longitude: -74.0359,
    isCarPort: true
  },
  {
    code: 'SAV',
    name: 'Savannah',
    country: 'USA',
    latitude: 32.1219,
    longitude: -81.2020,
    isCarPort: true
  },
  
  // Australia - Major import ports
  {
    code: 'SYD',
    name: 'Sydney',
    country: 'Australia',
    latitude: -33.8568,
    longitude: 151.2153,
    isCarPort: true
  },
  {
    code: 'MEL',
    name: 'Melbourne',
    country: 'Australia',
    latitude: -37.8136,
    longitude: 144.9631,
    isCarPort: true
  },
  {
    code: 'BNE',
    name: 'Brisbane',
    country: 'Australia',
    latitude: -27.3644,
    longitude: 153.1072,
    isCarPort: true
  },
  {
    code: 'FRE',
    name: 'Fremantle',
    country: 'Australia',
    latitude: -32.0569,
    longitude: 115.7453,
    isCarPort: true
  },
  {
    code: 'ADL',
    name: 'Adelaide',
    country: 'Australia',
    latitude: -34.9285,
    longitude: 138.6007,
    isCarPort: true
  }
];

/**
 * Calculate distance between two ports using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 0.539957); // Convert to nautical miles
}

/**
 * Get shipping quote between two ports
 */
export function calculateShippingCost(
  originCode: string,
  destinationCode: string,
  vehicleValue: number = 50000
): ShippingQuote | null {
  const origin = VEHICLE_PORTS.find(p => p.code === originCode);
  const destination = VEHICLE_PORTS.find(p => p.code === destinationCode);
  
  if (!origin || !destination) {
    return null;
  }
  
  const distance = calculateDistance(
    origin.latitude, origin.longitude,
    destination.latitude, destination.longitude
  );
  
  // Calculate shipping costs based on distance and market rates
  const baseCostPerNM = 0.85; // Base cost per nautical mile (USD)
  const roroMultiplier = 1.0; // RoRo is typically cheaper
  const containerMultiplier = 1.4; // Container shipping is more expensive
  
  // Base shipping costs
  const baseRoRoCost = distance * baseCostPerNM * roroMultiplier;
  const baseContainerCost = distance * baseCostPerNM * containerMultiplier;
  
  // Apply route-specific multipliers based on real market conditions
  let routeMultiplier = 1.0;
  
  // Japan to Australia routes
  if (origin.country === 'Japan' && destination.country === 'Australia') {
    routeMultiplier = 0.9; // Well-established route, competitive pricing
  }
  // USA to Australia routes
  else if (origin.country === 'USA' && destination.country === 'Australia') {
    routeMultiplier = 1.1; // Longer route, higher costs
  }
  
  // Calculate cost ranges (±20% for market fluctuation)
  const roroLow = Math.round(baseRoRoCost * routeMultiplier * 0.8);
  const roroHigh = Math.round(baseRoRoCost * routeMultiplier * 1.2);
  const containerLow = Math.round(baseContainerCost * routeMultiplier * 0.8);
  const containerHigh = Math.round(baseContainerCost * routeMultiplier * 1.2);
  
  // Standard additional fees
  const handling = 450;
  const documentation = 250;
  const insurance = Math.round(vehicleValue * 0.008); // 0.8% of vehicle value
  
  // Estimate transit time based on distance and route
  const baseSpeed = 20; // knots average speed
  const estimatedDays = Math.round((distance / baseSpeed / 24) + 3); // +3 days for port handling
  
  return {
    origin,
    destination,
    distance,
    estimatedDays,
    costs: {
      roro: {
        low: roroLow,
        high: roroHigh,
        currency: 'USD'
      },
      container: {
        low: containerLow,
        high: containerHigh,
        currency: 'USD'
      }
    },
    additionalFees: {
      handling,
      documentation,
      insurance
    },
    totalEstimate: {
      roroLow: roroLow + handling + documentation + insurance,
      roroHigh: roroHigh + handling + documentation + insurance,
      containerLow: containerLow + handling + documentation + insurance,
      containerHigh: containerHigh + handling + documentation + insurance
    },
    disclaimer: "Estimates based on current market rates and may vary. Contact shipping companies for final quotes."
  };
}

/**
 * Get all available ports by country
 */
export function getPortsByCountry(country: string): Port[] {
  return VEHICLE_PORTS.filter(p => p.country === country);
}

/**
 * Get all available ports
 */
export function getAllPorts(): Port[] {
  return VEHICLE_PORTS;
}

/**
 * Get popular shipping routes with their characteristics
 */
export function getPopularRoutes() {
  return [
    {
      name: 'Japan to Australia',
      origins: ['YOK', 'TOY', 'OSA', 'KOB'],
      destinations: ['SYD', 'MEL', 'BNE', 'FRE', 'ADL'],
      description: 'Most popular route for JDM vehicles',
      avgTransitDays: '14-21 days',
      frequency: 'Weekly sailings'
    },
    {
      name: 'USA West Coast to Australia',
      origins: ['LAX', 'SEA'],
      destinations: ['SYD', 'MEL', 'BNE', 'FRE'],
      description: 'Popular for American muscle cars',
      avgTransitDays: '21-28 days',
      frequency: 'Bi-weekly sailings'
    },
    {
      name: 'USA East Coast to Australia',
      origins: ['NYK', 'SAV'],
      destinations: ['SYD', 'MEL', 'BNE'],
      description: 'Alternative route via Suez Canal',
      avgTransitDays: '35-42 days',
      frequency: 'Monthly sailings'
    }
  ];
}

/**
 * Get shipping tips and recommendations
 */
export function getShippingTips(originCountry: string, destinationCountry: string) {
  const tips = [
    "Compare quotes from multiple freight forwarders",
    "Consider both RoRo and container shipping options",
    "Factor in insurance costs (typically 0.5-1% of vehicle value)",
    "Plan for potential delays during peak seasons",
    "Ensure all vehicle documentation is complete before shipping"
  ];
  
  // Add route-specific tips
  if (originCountry === 'Japan' && destinationCountry === 'Australia') {
    tips.push("Peak season is March-May due to Japanese fiscal year");
    tips.push("Consider shipping from Toyohashi for competitive rates");
  }
  
  if (originCountry === 'USA' && destinationCountry === 'Australia') {
    tips.push("West Coast ports typically offer faster transit times");
    tips.push("Consider consolidation services for single vehicles");
  }
  
  return tips;
}