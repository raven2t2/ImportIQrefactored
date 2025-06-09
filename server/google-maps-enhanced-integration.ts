import { Router } from 'express';
import { googleMapsService } from './google-maps-service';
import { globalMapsService } from './global-maps-service';

const router = Router();

// Enhanced Google Maps integration for comprehensive location intelligence
class GoogleMapsEnhancedService {
  
  // Find real automotive businesses using Google Places API
  async findAutomotiveBusinesses(location: string, businessType: string, radius: number = 50000) {
    try {
      console.log(`🔍 Google Places: Searching for ${businessType} near ${location}`);
      
      const geocoded = await googleMapsService.geocodeLocation(location);
      if (!geocoded) {
        throw new Error('Unable to geocode location');
      }

      // Use Google Places API to find real automotive businesses
      const searchTypes = this.getSearchTypes(businessType);
      const businesses = [];

      for (const searchType of searchTypes) {
        try {
          const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${geocoded.lat},${geocoded.lng}&radius=${radius}&type=${searchType}&keyword=automotive+performance+tuning+modification&key=${process.env.GOOGLE_MAPS_API_KEY}`;
          
          const response = await fetch(placesUrl);
          const data = await response.json();
          
          if (data.results) {
            for (const place of data.results.slice(0, 10)) {
              const businessDetails = await this.getPlaceDetails(place.place_id);
              if (businessDetails && this.isRelevantBusiness(businessDetails, businessType)) {
                businesses.push(businessDetails);
              }
            }
          }
        } catch (error) {
          console.error(`Error searching for ${searchType}:`, error);
        }
      }

      console.log(`✅ Google Places: Found ${businesses.length} real automotive businesses`);
      return businesses;
      
    } catch (error) {
      console.error('❌ Google Places search error:', error);
      return [];
    }
  }

  // Get detailed information about a specific place
  async getPlaceDetails(placeId: string) {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,reviews,opening_hours,types,geometry&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(detailsUrl);
      const data = await response.json();
      
      if (data.result) {
        return {
          id: placeId,
          name: data.result.name,
          business_name: data.result.name,
          address: data.result.formatted_address,
          phone: data.result.formatted_phone_number,
          website: data.result.website,
          rating: data.result.rating,
          coordinates: {
            lat: data.result.geometry.location.lat,
            lng: data.result.geometry.location.lng
          },
          types: data.result.types,
          reviews: data.result.reviews?.slice(0, 5) || [],
          opening_hours: data.result.opening_hours
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting place details:', error);
      return null;
    }
  }

  // Determine search types based on business category
  private getSearchTypes(businessType: string): string[] {
    const typeMap: { [key: string]: string[] } = {
      'performance': ['car_repair', 'car_dealer', 'store'],
      'jdm': ['car_repair', 'car_dealer', 'store'],
      'tuning': ['car_repair', 'store'],
      'modification': ['car_repair', 'store'],
      'import': ['car_dealer', 'car_repair'],
      'compliance': ['car_dealer', 'car_repair']
    };
    
    return typeMap[businessType.toLowerCase()] || ['car_repair', 'store'];
  }

  // Check if business is relevant to automotive performance/modification
  private isRelevantBusiness(business: any, businessType: string): boolean {
    const relevantKeywords = [
      'performance', 'tuning', 'modification', 'import', 'jdm', 'japanese',
      'turbo', 'engine', 'automotive', 'racing', 'custom', 'specialist',
      'motorsport', 'dyno', 'exhaust', 'suspension'
    ];
    
    const businessText = (business.name + ' ' + business.address).toLowerCase();
    return relevantKeywords.some(keyword => businessText.includes(keyword));
  }

  // Get optimal shipping ports using Google Maps
  async findOptimalPorts(originCountry: string, destinationLocation: string) {
    try {
      console.log(`🚢 Finding optimal ports from ${originCountry} to ${destinationLocation}`);
      
      const destCoords = await googleMapsService.geocodeLocation(destinationLocation);
      if (!destCoords) {
        throw new Error('Unable to geocode destination');
      }

      // Major international shipping ports by region
      const portsByRegion: { [key: string]: Array<{ name: string; coords: { lat: number; lng: number } }> } = {
        japan: [
          { name: 'Port of Tokyo', coords: { lat: 35.6329, lng: 139.7795 } },
          { name: 'Port of Yokohama', coords: { lat: 35.4437, lng: 139.6380 } },
          { name: 'Port of Osaka', coords: { lat: 34.6565, lng: 135.4265 } },
          { name: 'Port of Nagoya', coords: { lat: 35.0844, lng: 136.8903 } }
        ],
        usa: [
          { name: 'Port of Los Angeles', coords: { lat: 33.7361, lng: -118.2639 } },
          { name: 'Port of Long Beach', coords: { lat: 33.7694, lng: -118.2139 } },
          { name: 'Port of New York/New Jersey', coords: { lat: 40.6694, lng: -74.0347 } },
          { name: 'Port of Savannah', coords: { lat: 32.1347, lng: -81.1458 } }
        ]
      };

      const originPorts = portsByRegion[originCountry.toLowerCase()] || [];
      const optimalPorts = [];

      for (const port of originPorts) {
        const distance = googleMapsService.calculateDistance(
          port.coords.lat, port.coords.lng,
          destCoords.lat, destCoords.lng
        );
        
        optimalPorts.push({
          ...port,
          distanceToDestination: Math.round(distance)
        });
      }

      // Sort by distance to destination
      optimalPorts.sort((a, b) => a.distanceToDestination - b.distanceToDestination);
      
      console.log(`✅ Found ${optimalPorts.length} optimal ports`);
      return optimalPorts.slice(0, 3);
      
    } catch (error) {
      console.error('❌ Error finding optimal ports:', error);
      return [];
    }
  }

  // Enhanced route planning with Google Directions API
  async getShippingRouteIntelligence(originPort: string, destinationLocation: string) {
    try {
      console.log(`🗺️ Calculating shipping route from ${originPort} to ${destinationLocation}`);
      
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(originPort)}&destination=${encodeURIComponent(destinationLocation)}&mode=driving&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(directionsUrl);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
          steps: route.legs[0].steps.map((step: any) => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            distance: step.distance.text,
            duration: step.duration.text
          }))
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting route intelligence:', error);
      return null;
    }
  }

  // Find compliance agents and government facilities
  async findComplianceFacilities(location: string, facilityType: string) {
    try {
      console.log(`🏛️ Finding ${facilityType} facilities near ${location}`);
      
      const geocoded = await googleMapsService.geocodeLocation(location);
      if (!geocoded) {
        throw new Error('Unable to geocode location');
      }

      const searchKeywords = this.getComplianceKeywords(facilityType);
      const facilities = [];

      for (const keyword of searchKeywords) {
        try {
          const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(keyword + ' near ' + location)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
          
          const response = await fetch(placesUrl);
          const data = await response.json();
          
          if (data.results) {
            for (const place of data.results.slice(0, 5)) {
              const distance = googleMapsService.calculateDistance(
                geocoded.lat, geocoded.lng,
                place.geometry.location.lat, place.geometry.location.lng
              );
              
              facilities.push({
                name: place.name,
                address: place.formatted_address,
                rating: place.rating,
                distance_km: Math.round(distance),
                place_id: place.place_id,
                types: place.types
              });
            }
          }
        } catch (error) {
          console.error(`Error searching for ${keyword}:`, error);
        }
      }

      // Remove duplicates and sort by distance
      const uniqueFacilities = facilities.filter((facility, index, self) => 
        index === self.findIndex(f => f.place_id === facility.place_id)
      );
      
      uniqueFacilities.sort((a, b) => a.distance_km - b.distance_km);
      
      console.log(`✅ Found ${uniqueFacilities.length} compliance facilities`);
      return uniqueFacilities.slice(0, 10);
      
    } catch (error) {
      console.error('❌ Error finding compliance facilities:', error);
      return [];
    }
  }

  private getComplianceKeywords(facilityType: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      'inspection': ['vehicle inspection station', 'DOT inspection', 'safety inspection', 'emissions testing'],
      'customs': ['customs office', 'port authority', 'border services', 'customs broker'],
      'registration': ['DMV', 'vehicle registration', 'motor vehicle department', 'licensing office'],
      'compliance': ['compliance testing', 'certification facility', 'automotive testing', 'vehicle compliance']
    };
    
    return keywordMap[facilityType.toLowerCase()] || ['vehicle services'];
  }
}

const enhancedGoogleMaps = new GoogleMapsEnhancedService();

// Export the class for use in other modules
export { GoogleMapsEnhancedService };

// API Routes for enhanced Google Maps integration

// Find real automotive businesses using global search
router.get('/businesses/search', async (req, res) => {
  try {
    const { location, type = 'performance', radius = 50000 } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    console.log(`🌍 Global business search: ${type} near ${location}`);
    
    const searchResult = await globalMapsService.searchGlobalBusinesses(
      location.toString(),
      type.toString(),
      parseInt(radius.toString())
    );

    res.json({
      success: true,
      businesses: searchResult.businesses,
      total: searchResult.businesses.length,
      metadata: searchResult.searchMetadata,
      searchParams: { location, type, radius }
    });

  } catch (error) {
    console.error('❌ Global business search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search businesses globally'
    });
  }
});

// Get optimal shipping ports
router.get('/shipping/ports', async (req, res) => {
  try {
    const { origin, destination } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination parameters are required'
      });
    }

    const ports = await enhancedGoogleMaps.findOptimalPorts(
      origin.toString(),
      destination.toString()
    );

    res.json({
      success: true,
      ports,
      total: ports.length
    });

  } catch (error) {
    console.error('❌ Port search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find optimal ports'
    });
  }
});

// Get shipping route intelligence
router.get('/shipping/route', async (req, res) => {
  try {
    const { origin, destination } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination parameters are required'
      });
    }

    const route = await enhancedGoogleMaps.getShippingRouteIntelligence(
      origin.toString(),
      destination.toString()
    );

    res.json({
      success: true,
      route
    });

  } catch (error) {
    console.error('❌ Route intelligence error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get route intelligence'
    });
  }
});

// Find compliance facilities
router.get('/compliance/facilities', async (req, res) => {
  try {
    const { location, type = 'inspection' } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    console.log(`🏛️ Global compliance search: ${type} near ${location}`);
    
    const complianceData = await globalMapsService.getComplianceInformation(
      location.toString()
    );

    res.json({
      success: true,
      facilities: complianceData.facilities,
      requirements: complianceData.requirements,
      estimatedCosts: complianceData.estimatedCosts,
      region: complianceData.region,
      total: complianceData.facilities.length
    });

  } catch (error) {
    console.error('❌ Compliance facilities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find compliance facilities'
    });
  }
});

export default router;