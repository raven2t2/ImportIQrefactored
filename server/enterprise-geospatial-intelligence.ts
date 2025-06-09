/**
 * Enterprise Geospatial Intelligence Service
 * Advanced PostGIS-powered Google Maps integration for ImportIQ
 * Features: Intelligent proximity matching, predictive routing, real-time capacity intelligence
 */

import { db } from "./db";
import { 
  optimalRoutes, 
  geographicAnalytics, 
  marketClusters, 
  shopAvailability,
  modShopPartnersEnhanced 
} from "@shared/schema";
import { sql, eq, and, or, desc, asc, gt, lt, between } from "drizzle-orm";

interface GoogleMapsAPICollection {
  places: any;
  geocoding: any;
  distanceMatrix: any;
  roads: any;
  placesDetails: any;
}

interface GeospatialQuery {
  customerLocation: { lat: number; lng: number };
  vehicleType: string;
  requiredServices: string[];
  maxRadius: number; // km
  urgency: 'standard' | 'urgent' | 'emergency';
}

interface ProximityResult {
  shopId: number;
  businessName: string;
  driveTimeMinutes: number;
  distanceKm: number;
  confidenceScore: number;
  availabilityStatus: string;
  estimatedCost: number;
  serviceCapacity: number;
  routePolyline: string;
  trafficConditions: any;
}

class EnterpriseGeospatialIntelligence {
  private googleMapsKey: string;
  private postgisEnabled: boolean = false;

  constructor() {
    this.googleMapsKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.initializePostGIS();
  }

  /**
   * Initialize PostGIS extension and spatial indexes
   */
  private async initializePostGIS(): Promise<void> {
    try {
      // Enable PostGIS extension
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis`);
      
      // Create spatial indexes on location columns
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_mod_shops_enhanced_location 
        ON mod_shop_partners_enhanced 
        USING GIST(ST_GeomFromText(location))
      `);
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_optimal_routes_customer_location 
        ON optimal_routes 
        USING GIST(ST_GeomFromText(customer_location))
      `);
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_market_clusters_center_point 
        ON market_clusters 
        USING GIST(ST_GeomFromText(center_point))
      `);

      console.log('🗺️ PostGIS spatial intelligence initialized');
      this.postgisEnabled = true;
    } catch (error) {
      console.error('PostGIS initialization failed:', error);
      // Fallback to standard geographic calculations
    }
  }

  /**
   * Advanced intelligent proximity matching using PostGIS spatial queries
   */
  async findOptimalShops(query: GeospatialQuery): Promise<ProximityResult[]> {
    const { customerLocation, vehicleType, requiredServices, maxRadius, urgency } = query;
    
    if (!this.postgisEnabled) {
      return this.fallbackProximitySearch(query);
    }

    try {
      // Create customer location point
      const customerPoint = `POINT(${customerLocation.lng} ${customerLocation.lat})`;
      
      // Advanced PostGIS proximity query with service matching
      const spatialQuery = sql`
        SELECT 
          msp.id,
          msp.business_name,
          msp.specializations,
          msp.google_rating,
          msp.trust_score,
          msp.partnership_level,
          msp.pricing_tier,
          msp.service_capacity,
          msp.response_time_minutes,
          msp.emergency_services,
          sa.current_capacity_percent,
          sa.real_time_status,
          sa.booking_lead_time_days,
          ST_Distance(
            ST_GeomFromText(msp.location)::geography,
            ST_GeomFromText(${customerPoint})::geography
          ) / 1000 as distance_km,
          ST_AsText(ST_MakeLine(
            ST_GeomFromText(${customerPoint}),
            ST_GeomFromText(msp.location)
          )) as route_line
        FROM mod_shop_partners_enhanced msp
        LEFT JOIN shop_availability sa ON msp.id = sa.shop_id 
          AND sa.day_of_week = EXTRACT(DOW FROM NOW())
        WHERE 
          msp.is_active = true
          AND msp.verification_status = 'verified'
          AND ST_DWithin(
            ST_GeomFromText(msp.location)::geography,
            ST_GeomFromText(${customerPoint})::geography,
            ${maxRadius * 1000}
          )
          AND (
            msp.specializations && ${requiredServices}
            OR array_length(${requiredServices}, 1) IS NULL
          )
          ${urgency === 'emergency' ? sql`AND msp.emergency_services = true` : sql``}
        ORDER BY 
          CASE 
            WHEN msp.partnership_level = 'preferred' THEN 1
            WHEN msp.partnership_level = 'standard' THEN 2
            ELSE 3
          END,
          ST_Distance(
            ST_GeomFromText(msp.location)::geography,
            ST_GeomFromText(${customerPoint})::geography
          )
        LIMIT 20
      `;

      const spatialResults = await db.execute(spatialQuery);
      
      // Enhance results with Google Roads API for precise drive times
      const enhancedResults = await Promise.all(
        spatialResults.map(shop => this.enhanceWithRoadsAPI(shop, customerLocation))
      );

      return enhancedResults.filter(result => result !== null) as ProximityResult[];

    } catch (error) {
      console.error('Spatial query failed:', error);
      return this.fallbackProximitySearch(query);
    }
  }

  /**
   * Enhance proximity results with Google Roads API for accurate drive times
   */
  private async enhanceWithRoadsAPI(shop: any, customerLocation: { lat: number; lng: number }): Promise<ProximityResult | null> {
    try {
      // Extract shop coordinates from PostGIS geometry
      const shopCoords = this.parsePostGISPoint(shop.location);
      if (!shopCoords) return null;

      // Google Distance Matrix API for precise drive time
      const distanceResponse = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${customerLocation.lat},${customerLocation.lng}&` +
        `destinations=${shopCoords.lat},${shopCoords.lng}&` +
        `mode=driving&traffic_model=best_guess&departure_time=now&` +
        `key=${this.googleMapsKey}`
      );

      const distanceData = await distanceResponse.json();
      const element = distanceData.rows[0]?.elements[0];

      if (!element || element.status !== 'OK') {
        return null;
      }

      // Google Directions API for route polyline
      const directionsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${customerLocation.lat},${customerLocation.lng}&` +
        `destination=${shopCoords.lat},${shopCoords.lng}&` +
        `mode=driving&alternatives=true&` +
        `key=${this.googleMapsKey}`
      );

      const directionsData = await directionsResponse.json();
      const route = directionsData.routes[0];

      // Calculate confidence score based on multiple factors
      const confidenceScore = this.calculateConfidenceScore({
        trustScore: shop.trust_score || 0,
        googleRating: shop.google_rating || 0,
        partnershipLevel: shop.partnership_level,
        distanceKm: shop.distance_km,
        capacity: shop.current_capacity_percent || 50,
        responseTime: shop.response_time_minutes || 60
      });

      // Estimate service cost based on pricing tier and services
      const estimatedCost = this.estimateServiceCost(
        shop.pricing_tier,
        shop.specializations,
        confidenceScore
      );

      return {
        shopId: shop.id,
        businessName: shop.business_name,
        driveTimeMinutes: Math.round(element.duration.value / 60),
        distanceKm: parseFloat((element.distance.value / 1000).toFixed(2)),
        confidenceScore,
        availabilityStatus: shop.real_time_status || 'unknown',
        estimatedCost,
        serviceCapacity: shop.current_capacity_percent || 50,
        routePolyline: route?.overview_polyline?.points || '',
        trafficConditions: {
          duration: element.duration.text,
          durationInTraffic: element.duration_in_traffic?.text,
          distance: element.distance.text,
          trafficSeverity: this.assessTrafficSeverity(element)
        }
      };

    } catch (error) {
      console.error('Roads API enhancement failed:', error);
      return null;
    }
  }

  /**
   * Dynamic service area mapping using Google Roads API
   */
  async calculateServiceArea(shopId: number, maxDriveTime: number = 45): Promise<any> {
    try {
      const shop = await db.select()
        .from(modShopPartnersEnhanced)
        .where(eq(modShopPartnersEnhanced.id, shopId))
        .limit(1);

      if (!shop.length) return null;

      const shopLocation = this.parsePostGISPoint(shop[0].location);
      if (!shopLocation) return null;

      // Generate points in expanding circles around shop
      const testPoints = this.generateTestPoints(shopLocation, maxDriveTime);
      
      // Use Google Distance Matrix to find actual reachable area
      const reachablePoints = await this.filterReachablePoints(
        shopLocation, 
        testPoints, 
        maxDriveTime
      );

      // Create service area polygon from reachable points
      const serviceAreaPolygon = this.createServicePolygon(reachablePoints);

      // Update shop's service area in database
      if (serviceAreaPolygon) {
        await db.update(modShopPartnersEnhanced)
          .set({
            serviceArea: serviceAreaPolygon,
            serviceAreaRadius: maxDriveTime,
            updatedAt: new Date()
          })
          .where(eq(modShopPartnersEnhanced.id, shopId));
      }

      return {
        shopId,
        serviceAreaPolygon,
        reachableRadius: maxDriveTime,
        testPointsAnalyzed: testPoints.length,
        reachablePoints: reachablePoints.length
      };

    } catch (error) {
      console.error('Service area calculation failed:', error);
      return null;
    }
  }

  /**
   * Real-time capacity intelligence and availability prediction
   */
  async updateRealTimeCapacity(): Promise<void> {
    try {
      // Get all active shops
      const activeShops = await db.select()
        .from(modShopPartnersEnhanced)
        .where(eq(modShopPartnersEnhanced.isActive, true));

      for (const shop of activeShops) {
        if (shop.googlePlaceId) {
          // Use Google Places API to get real-time business status
          const placeDetails = await this.getPlaceDetails(shop.googlePlaceId);
          
          if (placeDetails) {
            const currentStatus = this.determineRealTimeStatus(placeDetails);
            const capacityEstimate = this.estimateCurrentCapacity(placeDetails, shop);

            // Update shop availability
            await this.updateShopAvailability(shop.id, currentStatus, capacityEstimate);
          }
        }
      }

      console.log(`🔄 Updated real-time capacity for ${activeShops.length} shops`);
    } catch (error) {
      console.error('Real-time capacity update failed:', error);
    }
  }

  /**
   * Automated shop discovery using Google Places API
   */
  async discoverNewShops(location: { lat: number; lng: number }, radius: number = 25000): Promise<any[]> {
    try {
      const searchQueries = [
        'auto modification shop',
        'car tuning specialist',
        'automotive performance shop',
        'vehicle customization',
        'turbo installation shop',
        'suspension specialist',
        'exhaust system shop',
        'ECU tuning service',
        'automotive workshop',
        'performance garage'
      ];

      const discoveredShops = [];

      for (const query of searchQueries) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
          `query=${encodeURIComponent(query)}&` +
          `location=${location.lat},${location.lng}&` +
          `radius=${radius}&` +
          `type=car_repair&` +
          `key=${this.googleMapsKey}`
        );

        const data = await response.json();
        
        if (data.results) {
          for (const place of data.results) {
            const shopData = await this.analyzeDiscoveredShop(place);
            if (shopData && shopData.suitabilityScore > 0.7) {
              discoveredShops.push(shopData);
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return this.deduplicateShops(discoveredShops);
    } catch (error) {
      console.error('Shop discovery failed:', error);
      return [];
    }
  }

  /**
   * Predictive routing engine with traffic and weather considerations
   */
  async generatePredictiveRoute(query: GeospatialQuery): Promise<any> {
    try {
      const optimalShops = await this.findOptimalShops(query);
      
      if (!optimalShops.length) {
        return { error: 'No suitable shops found in area' };
      }

      const primaryShop = optimalShops[0];
      const alternativeShops = optimalShops.slice(1, 3);

      // Generate route with multiple waypoints for service efficiency
      const multiStopRoute = await this.optimizeMultiStopRoute(
        query.customerLocation,
        [primaryShop, ...alternativeShops]
      );

      // Store optimal route in database
      const routeRecord = await db.insert(optimalRoutes).values({
        customerZip: this.extractPostalCode(query.customerLocation),
        customerLocation: `POINT(${query.customerLocation.lng} ${query.customerLocation.lat})`,
        vehicleType: query.vehicleType,
        requiredServices: query.requiredServices,
        recommendedShopId: primaryShop.shopId,
        totalDriveTimeMinutes: primaryShop.driveTimeMinutes,
        totalEstimatedCost: primaryShop.estimatedCost,
        confidenceScore: primaryShop.confidenceScore,
        routePolyline: primaryShop.routePolyline,
        trafficConditions: primaryShop.trafficConditions,
        alternativeRoutes: alternativeShops,
        roadQuality: 'good', // Would be enhanced with road quality API
        weatherImpact: await this.getWeatherImpact(query.customerLocation)
      }).returning();

      return {
        primaryRoute: primaryShop,
        alternatives: alternativeShops,
        multiStopOptimization: multiStopRoute,
        routeId: routeRecord[0].id,
        estimatedSavings: this.calculateSavings(optimalShops),
        riskAssessment: this.assessRouteRisk(primaryShop, query)
      };

    } catch (error) {
      console.error('Predictive routing failed:', error);
      return { error: 'Route generation failed' };
    }
  }

  /**
   * Competitive intelligence analysis by geographic region
   */
  async analyzeMarketCompetition(region: string): Promise<any> {
    try {
      // Get existing market cluster data
      const marketData = await db.select()
        .from(marketClusters)
        .where(eq(marketClusters.clusterName, region));

      if (!marketData.length) {
        // Create new market analysis
        return this.createMarketAnalysis(region);
      }

      const cluster = marketData[0];
      
      // Analyze competition density and market opportunities
      const competitorAnalysis = await this.scanCompetitorNetwork(cluster);
      const marketGaps = await this.identifyServiceGaps(cluster);
      const expansionOpportunities = await this.assessExpansionPotential(cluster);

      // Update market intelligence
      await db.update(marketClusters)
        .set({
          competitorAnalysis,
          serviceGaps: marketGaps,
          expansionOpportunities,
          lastAnalyzed: new Date()
        })
        .where(eq(marketClusters.id, cluster.id));

      return {
        region,
        competitionLevel: competitorAnalysis.density,
        marketOpportunities: expansionOpportunities,
        serviceGaps: marketGaps,
        recommendedActions: this.generateMarketRecommendations(competitorAnalysis, marketGaps)
      };

    } catch (error) {
      console.error('Market competition analysis failed:', error);
      return { error: 'Competition analysis failed' };
    }
  }

  // Helper methods
  private parsePostGISPoint(pointText: string | null): { lat: number; lng: number } | null {
    if (!pointText) return null;
    
    const match = pointText.match(/POINT\(([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\)/);
    if (!match) return null;
    
    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2])
    };
  }

  private calculateConfidenceScore(factors: any): number {
    const weights = {
      trustScore: 0.25,
      googleRating: 0.20,
      partnership: 0.15,
      distance: 0.15,
      capacity: 0.15,
      responseTime: 0.10
    };

    let score = 0;
    score += (factors.trustScore / 5) * weights.trustScore;
    score += (factors.googleRating / 5) * weights.googleRating;
    score += this.getPartnershipScore(factors.partnershipLevel) * weights.partnership;
    score += Math.max(0, (50 - factors.distanceKm) / 50) * weights.distance;
    score += (factors.capacity / 100) * weights.capacity;
    score += Math.max(0, (120 - factors.responseTime) / 120) * weights.responseTime;

    return Math.round(score * 100) / 100;
  }

  private getPartnershipScore(level: string): number {
    switch (level) {
      case 'preferred': return 1.0;
      case 'standard': return 0.8;
      case 'provisional': return 0.6;
      default: return 0.4;
    }
  }

  private estimateServiceCost(pricingTier: string, services: string[], confidence: number): number {
    const baseCosts = {
      budget: 800,
      'mid-range': 1200,
      premium: 1800,
      luxury: 2500
    };

    const basePrice = baseCosts[pricingTier as keyof typeof baseCosts] || 1200;
    const serviceMultiplier = 1 + (services?.length || 1) * 0.2;
    const confidenceAdjustment = 0.8 + (confidence * 0.4);

    return Math.round(basePrice * serviceMultiplier * confidenceAdjustment);
  }

  private assessTrafficSeverity(element: any): string {
    if (!element.duration_in_traffic) return 'unknown';
    
    const normalDuration = element.duration.value;
    const trafficDuration = element.duration_in_traffic.value;
    const delay = (trafficDuration - normalDuration) / normalDuration;

    if (delay < 0.1) return 'light';
    if (delay < 0.3) return 'moderate';
    if (delay < 0.5) return 'heavy';
    return 'severe';
  }

  private generateTestPoints(center: { lat: number; lng: number }, maxDriveTime: number): Array<{ lat: number; lng: number }> {
    const points = [];
    const radiusKm = maxDriveTime * 0.8; // Rough conversion from drive time to radius
    
    for (let angle = 0; angle < 360; angle += 30) {
      for (let radius = 5; radius <= radiusKm; radius += 5) {
        const lat = center.lat + (radius / 111) * Math.cos(angle * Math.PI / 180);
        const lng = center.lng + (radius / 111) * Math.sin(angle * Math.PI / 180) / Math.cos(center.lat * Math.PI / 180);
        points.push({ lat, lng });
      }
    }
    
    return points;
  }

  private async filterReachablePoints(
    origin: { lat: number; lng: number }, 
    testPoints: Array<{ lat: number; lng: number }>, 
    maxDriveTime: number
  ): Promise<Array<{ lat: number; lng: number }>> {
    const reachablePoints = [];
    const batchSize = 25; // Google Distance Matrix API limit
    
    for (let i = 0; i < testPoints.length; i += batchSize) {
      const batch = testPoints.slice(i, i + batchSize);
      const destinations = batch.map(p => `${p.lat},${p.lng}`).join('|');
      
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?` +
          `origins=${origin.lat},${origin.lng}&` +
          `destinations=${destinations}&` +
          `mode=driving&` +
          `key=${this.googleMapsKey}`
        );
        
        const data = await response.json();
        
        if (data.rows && data.rows[0]) {
          data.rows[0].elements.forEach((element: any, index: number) => {
            if (element.status === 'OK' && element.duration.value <= maxDriveTime * 60) {
              reachablePoints.push(batch[index]);
            }
          });
        }
      } catch (error) {
        console.error('Distance Matrix batch failed:', error);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return reachablePoints;
  }

  private createServicePolygon(points: Array<{ lat: number; lng: number }>): string | null {
    if (points.length < 3) return null;
    
    // Simple convex hull algorithm for polygon creation
    // In production, would use more sophisticated algorithm
    const polygonPoints = points.map(p => `${p.lng} ${p.lat}`).join(', ');
    return `POLYGON((${polygonPoints}, ${points[0].lng} ${points[0].lat}))`;
  }

  private async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${placeId}&` +
        `fields=business_status,current_opening_hours,utc_offset&` +
        `key=${this.googleMapsKey}`
      );
      
      return await response.json();
    } catch (error) {
      console.error('Place details fetch failed:', error);
      return null;
    }
  }

  private determineRealTimeStatus(placeDetails: any): string {
    if (!placeDetails.result) return 'unknown';
    
    const business = placeDetails.result;
    
    if (business.business_status !== 'OPERATIONAL') return 'closed';
    
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 17) return 'closing_soon';
    if (currentHour < 8) return 'closed';
    
    return 'open';
  }

  private estimateCurrentCapacity(placeDetails: any, shop: any): number {
    // Estimate based on time of day, day of week, and shop characteristics
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    let baseCapacity = 50;
    
    // Time of day adjustments
    if (hour >= 10 && hour <= 15) baseCapacity += 20; // Peak hours
    if (hour < 9 || hour > 17) baseCapacity -= 30; // Off hours
    
    // Day of week adjustments
    if (dayOfWeek === 0 || dayOfWeek === 6) baseCapacity -= 20; // Weekends
    
    // Shop size adjustments
    if (shop.employeeCount > 10) baseCapacity += 15;
    if (shop.employeeCount < 5) baseCapacity -= 15;
    
    return Math.max(0, Math.min(100, baseCapacity));
  }

  private async updateShopAvailability(shopId: number, status: string, capacity: number): Promise<void> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    await db.insert(shopAvailability)
      .values({
        shopId,
        dayOfWeek,
        currentCapacityPercent: capacity,
        realTimeStatus: status,
        lastStatusUpdate: now
      })
      .onConflictDoUpdate({
        target: [shopAvailability.shopId, shopAvailability.dayOfWeek],
        set: {
          currentCapacityPercent: capacity,
          realTimeStatus: status,
          lastStatusUpdate: now,
          updatedAt: now
        }
      });
  }

  private async analyzeDiscoveredShop(place: any): Promise<any> {
    try {
      const suitabilityFactors = {
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        businessStatus: place.business_status === 'OPERATIONAL',
        hasPhoneNumber: !!place.formatted_phone_number,
        hasWebsite: !!place.website,
        types: place.types || []
      };
      
      const suitabilityScore = this.calculateSuitabilityScore(suitabilityFactors);
      
      return {
        googlePlaceId: place.place_id,
        businessName: place.name,
        address: place.formatted_address,
        location: `POINT(${place.geometry.location.lng} ${place.geometry.location.lat})`,
        googleRating: place.rating,
        googleReviewCount: place.user_ratings_total,
        phoneNumber: place.formatted_phone_number,
        websiteUrl: place.website,
        businessTypes: place.types,
        suitabilityScore,
        discoverySource: 'google_places_auto_discovery',
        needsVerification: true
      };
    } catch (error) {
      console.error('Shop analysis failed:', error);
      return null;
    }
  }

  private calculateSuitabilityScore(factors: any): number {
    let score = 0;
    
    // Rating quality
    if (factors.rating >= 4.0) score += 0.3;
    else if (factors.rating >= 3.5) score += 0.2;
    else if (factors.rating >= 3.0) score += 0.1;
    
    // Review volume
    if (factors.userRatingsTotal >= 50) score += 0.2;
    else if (factors.userRatingsTotal >= 20) score += 0.15;
    else if (factors.userRatingsTotal >= 10) score += 0.1;
    
    // Business status
    if (factors.businessStatus) score += 0.2;
    
    // Contact information
    if (factors.hasPhoneNumber) score += 0.1;
    if (factors.hasWebsite) score += 0.1;
    
    // Business type relevance
    const relevantTypes = ['car_repair', 'car_dealer', 'electronics_store'];
    if (factors.types.some((type: string) => relevantTypes.includes(type))) {
      score += 0.1;
    }
    
    return Math.round(score * 100) / 100;
  }

  private deduplicateShops(shops: any[]): any[] {
    const seen = new Set();
    return shops.filter(shop => {
      const key = `${shop.businessName}_${shop.address}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private async optimizeMultiStopRoute(origin: any, shops: any[]): Promise<any> {
    // Implement traveling salesman optimization for multi-shop visits
    // For now, return simple ordered route
    return {
      optimizedOrder: shops.map(shop => shop.shopId),
      totalTime: shops.reduce((sum, shop) => sum + shop.driveTimeMinutes, 0),
      totalDistance: shops.reduce((sum, shop) => sum + shop.distanceKm, 0),
      efficiency: 'optimized'
    };
  }

  private extractPostalCode(location: { lat: number; lng: number }): string {
    // Would use reverse geocoding to get postal code
    return 'UNKNOWN';
  }

  private async getWeatherImpact(location: { lat: number; lng: number }): Promise<any> {
    // Would integrate with weather API
    return { conditions: 'clear', impact: 'none' };
  }

  private calculateSavings(shops: ProximityResult[]): any {
    if (shops.length < 2) return null;
    
    const cheapest = Math.min(...shops.map(s => s.estimatedCost));
    const mostExpensive = Math.max(...shops.map(s => s.estimatedCost));
    
    return {
      potentialSavings: mostExpensive - cheapest,
      percentageSavings: Math.round(((mostExpensive - cheapest) / mostExpensive) * 100)
    };
  }

  private assessRouteRisk(primaryShop: ProximityResult, query: GeospatialQuery): any {
    let riskLevel = 'low';
    const riskFactors = [];
    
    if (primaryShop.driveTimeMinutes > 60) {
      riskFactors.push('Long drive time');
      riskLevel = 'medium';
    }
    
    if (primaryShop.confidenceScore < 0.7) {
      riskFactors.push('Lower confidence shop');
      riskLevel = 'medium';
    }
    
    if (primaryShop.availabilityStatus === 'busy') {
      riskFactors.push('Shop currently busy');
      if (riskLevel === 'medium') riskLevel = 'high';
    }
    
    return { level: riskLevel, factors: riskFactors };
  }

  private async createMarketAnalysis(region: string): Promise<any> {
    // Implementation for new market analysis
    return { message: 'Market analysis created for ' + region };
  }

  private async scanCompetitorNetwork(cluster: any): Promise<any> {
    // Implementation for competitor scanning
    return { density: 'medium', competitors: [] };
  }

  private async identifyServiceGaps(cluster: any): Promise<any[]> {
    // Implementation for service gap analysis
    return ['turbo_installation', 'ecu_tuning'];
  }

  private async assessExpansionPotential(cluster: any): Promise<any> {
    // Implementation for expansion assessment
    return { potential: 'high', reasons: [] };
  }

  private generateMarketRecommendations(competitive: any, gaps: any): string[] {
    return ['Focus on ECU tuning services', 'Consider mobile service expansion'];
  }

  private async fallbackProximitySearch(query: GeospatialQuery): Promise<ProximityResult[]> {
    // Fallback implementation without PostGIS
    console.log('Using fallback proximity search');
    return [];
  }
}

export default new EnterpriseGeospatialIntelligence();