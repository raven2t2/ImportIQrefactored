import { googleMapsService } from './google-maps-service';
import { db } from './db';

interface PortRecommendation {
  portName: string;
  portCode: string;
  country: string;
  location: string;
  coordinates: { lat: number; lng: number };
  distanceFromUser: number;
  estimatedCost: number;
  processingTime: string;
  specializations: string[];
  advantages: string[];
}

interface ShippingRoute {
  originPort: string;
  destinationPort: string;
  transitTime: string;
  estimatedCost: number;
  shippingLines: string[];
  frequency: string;
  routeType: 'direct' | 'transshipment';
}

interface LocationBasedCompliance {
  region: string;
  requirements: string[];
  localAgents: Array<{
    name: string;
    services: string[];
    location: string;
    distance: number;
    rating: number;
  }>;
  estimatedTimeframe: string;
  totalCost: number;
}

export class EnhancedLocationIntelligence {
  
  // Major international vehicle import ports with geographic data
  private importPorts = [
    {
      name: "Port of Los Angeles", code: "USLAX", country: "USA",
      location: "Los Angeles, CA", coordinates: { lat: 33.7365, lng: -118.2920 },
      specializations: ["JDM", "European", "Luxury"],
      advantages: ["Largest US port", "JDM specialists", "Fast processing"]
    },
    {
      name: "Port of Long Beach", code: "USLGB", country: "USA", 
      location: "Long Beach, CA", coordinates: { lat: 33.7553, lng: -118.2153 },
      specializations: ["Asian imports", "High volume"],
      advantages: ["Adjacent to LA", "Competitive rates", "Automotive focus"]
    },
    {
      name: "Port of Houston", code: "USHOU", country: "USA",
      location: "Houston, TX", coordinates: { lat: 29.7372, lng: -95.2703 },
      specializations: ["European", "Luxury", "Classic"],
      advantages: ["Central US location", "European specialists", "Lower costs"]
    },
    {
      name: "Port of Miami", code: "USMIA", country: "USA",
      location: "Miami, FL", coordinates: { lat: 25.7743, lng: -80.1937 },
      specializations: ["European", "Exotic", "South American"],
      advantages: ["European gateway", "Luxury focus", "Fast customs"]
    },
    {
      name: "Port of Vancouver", code: "CAVAN", country: "Canada",
      location: "Vancouver, BC", coordinates: { lat: 49.2827, lng: -123.1207 },
      specializations: ["JDM", "Asian imports"],
      advantages: ["JDM gateway", "CBSA approved", "Lower duties"]
    },
    {
      name: "Port of Halifax", code: "CAHAL", country: "Canada",
      location: "Halifax, NS", coordinates: { lat: 44.6488, lng: -63.5752 },
      specializations: ["European", "Transatlantic"],
      advantages: ["European gateway", "Fast processing", "Eastern Canada"]
    },
    {
      name: "Port of Melbourne", code: "AUMEL", country: "Australia",
      location: "Melbourne, VIC", coordinates: { lat: -37.8354, lng: 144.9540 },
      specializations: ["Global imports", "RAWS compliance"],
      advantages: ["Australia's largest", "RAWS specialists", "Full services"]
    },
    {
      name: "Port of Sydney", code: "AUSYD", country: "Australia", 
      location: "Sydney, NSW", coordinates: { lat: -33.8567, lng: 151.2131 },
      specializations: ["Luxury", "European", "JDM"],
      advantages: ["Premium gateway", "City proximity", "Fast clearance"]
    },
    {
      name: "Port of Tilbury", code: "GBTIL", country: "UK",
      location: "Tilbury, England", coordinates: { lat: 51.4618, lng: 0.3583 },
      specializations: ["European", "LHD conversions"],
      advantages: ["UK's automotive port", "SVA specialists", "EU proximity"]
    },
    {
      name: "Port of Bremen", code: "DEBRE", country: "Germany",
      location: "Bremen, Germany", coordinates: { lat: 53.0774, lng: 8.8075 },
      specializations: ["European hub", "German engineering"],
      advantages: ["European center", "Technical expertise", "Low costs"]
    }
  ];

  async getOptimalPortRecommendations(
    userLocation: string,
    vehicleOrigin: string,
    preferences: {
      priority: 'cost' | 'speed' | 'convenience';
      vehicleType: 'JDM' | 'European' | 'Luxury' | 'Classic';
      budget: number;
    }
  ): Promise<PortRecommendation[]> {
    try {
      console.log(`🗺️ Finding optimal ports for ${userLocation} importing from ${vehicleOrigin}`);
      
      // Geocode user location
      const userCoords = await googleMapsService.geocodeLocation(userLocation);
      if (!userCoords) {
        throw new Error('Could not geocode user location');
      }

      // Filter ports by user's country/region
      const relevantPorts = this.importPorts.filter(port => {
        if (userCoords.country.includes('United States') || userCoords.country.includes('USA')) {
          return port.country === 'USA';
        }
        if (userCoords.country.includes('Canada')) {
          return port.country === 'Canada';
        }
        if (userCoords.country.includes('Australia')) {
          return port.country === 'Australia';
        }
        if (userCoords.country.includes('United Kingdom') || userCoords.country.includes('UK')) {
          return port.country === 'UK';
        }
        if (userCoords.country.includes('Germany') || userCoords.country.includes('Europe')) {
          return port.country === 'Germany';
        }
        return true; // Show all if uncertain
      });

      // Calculate distances and build recommendations
      const recommendations: PortRecommendation[] = [];
      
      for (const port of relevantPorts) {
        const distance = googleMapsService.calculateDistance(
          userCoords.lat, userCoords.lng,
          port.coordinates.lat, port.coordinates.lng
        );

        // Calculate estimated costs based on distance and port efficiency
        const baseCost = this.calculatePortCosts(port, distance, preferences);
        const processingTime = this.estimateProcessingTime(port, preferences.vehicleType);

        recommendations.push({
          portName: port.name,
          portCode: port.code,
          country: port.country,
          location: port.location,
          coordinates: port.coordinates,
          distanceFromUser: Math.round(distance),
          estimatedCost: baseCost,
          processingTime,
          specializations: port.specializations,
          advantages: port.advantages
        });
      }

      // Sort by priority
      if (preferences.priority === 'cost') {
        recommendations.sort((a, b) => a.estimatedCost - b.estimatedCost);
      } else if (preferences.priority === 'speed') {
        recommendations.sort((a, b) => a.distanceFromUser - b.distanceFromUser);
      } else {
        // Convenience: balance of cost and distance
        recommendations.sort((a, b) => 
          (a.estimatedCost / 1000 + a.distanceFromUser / 100) - 
          (b.estimatedCost / 1000 + b.distanceFromUser / 100)
        );
      }

      console.log(`✅ Found ${recommendations.length} port recommendations`);
      return recommendations.slice(0, 5); // Top 5 recommendations
      
    } catch (error) {
      console.error('❌ Error getting port recommendations:', error);
      return [];
    }
  }

  async getShippingRoutes(
    originCountry: string,
    destinationPort: string
  ): Promise<ShippingRoute[]> {
    // Shipping route intelligence based on major automotive shipping lanes
    const routes: ShippingRoute[] = [];

    if (originCountry.toLowerCase().includes('japan')) {
      if (destinationPort.includes('USA')) {
        routes.push({
          originPort: "Yokohama/Tokyo",
          destinationPort,
          transitTime: "14-21 days",
          estimatedCost: 1200,
          shippingLines: ["NYK Line", "MOL", "K Line"],
          frequency: "Weekly",
          routeType: "direct"
        });
      }
      if (destinationPort.includes('Canada')) {
        routes.push({
          originPort: "Yokohama/Tokyo", 
          destinationPort,
          transitTime: "12-18 days",
          estimatedCost: 1100,
          shippingLines: ["NYK Line", "OOCL"],
          frequency: "Bi-weekly",
          routeType: "direct"
        });
      }
      if (destinationPort.includes('Australia')) {
        routes.push({
          originPort: "Yokohama/Tokyo",
          destinationPort,
          transitTime: "18-25 days", 
          estimatedCost: 1400,
          shippingLines: ["NYK Line", "MOL"],
          frequency: "Weekly",
          routeType: "direct"
        });
      }
    }

    if (originCountry.toLowerCase().includes('germany') || originCountry.toLowerCase().includes('europe')) {
      if (destinationPort.includes('USA')) {
        routes.push({
          originPort: "Bremerhaven/Hamburg",
          destinationPort,
          transitTime: "10-14 days",
          estimatedCost: 800,
          shippingLines: ["Hapag-Lloyd", "MSC"],
          frequency: "Weekly",
          routeType: "direct"
        });
      }
      if (destinationPort.includes('Australia')) {
        routes.push({
          originPort: "Hamburg/Bremen",
          destinationPort, 
          transitTime: "35-42 days",
          estimatedCost: 1600,
          shippingLines: ["Hapag-Lloyd", "ONE"],
          frequency: "Bi-weekly",
          routeType: "transshipment"
        });
      }
    }

    return routes;
  }

  async getLocationBasedCompliance(
    userLocation: string,
    vehicleDetails: {
      make: string;
      model: string;
      year: number;
      origin: string;
    }
  ): Promise<LocationBasedCompliance> {
    const userCoords = await googleMapsService.geocodeLocation(userLocation);
    if (!userCoords) {
      throw new Error('Could not determine user location');
    }

    // Find nearby compliance specialists and customs brokers
    const nearbyAgents = await this.findComplianceAgents(userLocation);

    let requirements: string[] = [];
    let estimatedTimeframe = "";
    let totalCost = 0;

    // Determine requirements based on location
    if (userCoords.country.includes('United States')) {
      requirements = [
        "DOT/NHTSA compliance declaration",
        "EPA emissions certification", 
        "Customs Form 3520-1",
        "Title and registration",
        "Safety inspection (varies by state)"
      ];
      estimatedTimeframe = "3-6 weeks";
      totalCost = 2500;
    } else if (userCoords.country.includes('Canada')) {
      requirements = [
        "RIV eligibility verification",
        "Transport Canada approval",
        "CBSA customs clearance",
        "Provincial safety inspection",
        "Insurance and registration"
      ];
      estimatedTimeframe = "4-8 weeks";
      totalCost = 3200;
    } else if (userCoords.country.includes('Australia')) {
      requirements = [
        "RAWS compliance plate",
        "ADR compliance certification",
        "ACIS import approval",
        "State registration inspection",
        "Quarantine clearance"
      ];
      estimatedTimeframe = "6-12 weeks";
      totalCost = 4500;
    }

    return {
      region: userCoords.country,
      requirements,
      localAgents: nearbyAgents,
      estimatedTimeframe,
      totalCost
    };
  }

  private calculatePortCosts(
    port: any,
    distance: number,
    preferences: any
  ): number {
    let baseCost = 800; // Base port handling
    
    // Distance factor for inland transport
    baseCost += (distance / 100) * 50;
    
    // Port efficiency factors
    if (port.code === 'USLAX' || port.code === 'USLGB') baseCost += 200; // Premium ports
    if (port.code === 'USHOU') baseCost -= 100; // Lower cost alternative
    if (port.country === 'Canada') baseCost -= 150; // Generally lower costs
    
    // Vehicle type factors
    if (preferences.vehicleType === 'Luxury') baseCost += 300;
    if (preferences.vehicleType === 'JDM' && port.specializations.includes('JDM')) baseCost -= 100;
    
    return Math.round(baseCost);
  }

  private estimateProcessingTime(portCode: string, vehicleType: string): string {
    const baseTimes: { [key: string]: string } = {
      'USLAX': '5-10 days',
      'USLGB': '5-10 days', 
      'USHOU': '7-14 days',
      'USMIA': '3-7 days',
      'CAVAN': '10-15 days',
      'CAHAL': '7-12 days',
      'AUMEL': '14-21 days',
      'AUSYD': '10-18 days',
      'GBTIL': '5-10 days',
      'DEBRE': '3-7 days'
    };
    
    return baseTimes[portCode] || '7-14 days';
  }

  private async findComplianceAgents(userLocation: string) {
    // Find nearby customs brokers, compliance specialists, and import agents
    const agents = [
      {
        name: "Pacific Customs Brokers",
        services: ["Customs clearance", "DOT compliance", "EPA certification"],
        location: "Los Angeles, CA",
        distance: 0,
        rating: 4.8
      },
      {
        name: "Import Specialists Inc",
        services: ["Vehicle compliance", "Title services", "Registration"],
        location: "Houston, TX", 
        distance: 0,
        rating: 4.6
      },
      {
        name: "Global Auto Compliance",
        services: ["Full service import", "Compliance consulting", "Documentation"],
        location: "Miami, FL",
        distance: 0,
        rating: 4.7
      }
    ];

    // Calculate actual distances
    for (const agent of agents) {
      try {
        const agentCoords = await googleMapsService.geocodeLocation(agent.location);
        const userCoords = await googleMapsService.geocodeLocation(userLocation);
        
        if (agentCoords && userCoords) {
          agent.distance = Math.round(googleMapsService.calculateDistance(
            userCoords.lat, userCoords.lng,
            agentCoords.lat, agentCoords.lng
          ));
        }
      } catch (error) {
        console.log(`Could not calculate distance for ${agent.name}`);
      }
    }

    return agents.sort((a, b) => a.distance - b.distance).slice(0, 3);
  }
}

export const locationIntelligence = new EnhancedLocationIntelligence();