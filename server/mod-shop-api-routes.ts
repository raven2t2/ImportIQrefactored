/**
 * Mod Shop Partner API Routes
 * Provides endpoints for shop discovery, customer matching, and service capabilities
 */

import { Router, Request, Response } from "express";
import { db } from "./db";
import { modShopPartners, serviceAreas, shopReviews, importServices, shopServiceCapabilities } from "@shared/schema";
import { eq, and, or, sql, ilike, desc, asc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schemas
const locationSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(1).max(500).default(50), // miles
  services: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  minRating: z.number().min(1).max(5).optional(),
  limit: z.number().min(1).max(100).default(20)
});

const zipCodeSearchSchema = z.object({
  zipCode: z.string().min(5).max(10),
  radius: z.number().min(1).max(500).default(50),
  services: z.array(z.string()).optional(),
  vehicleType: z.string().optional(),
  urgency: z.enum(["standard", "urgent", "emergency"]).default("standard")
});

/**
 * Find shops near customer coordinates
 * POST /api/mod-shops/search/location
 */
router.post('/search/location', async (req: Request, res: Response) => {
  try {
    const searchParams = locationSearchSchema.parse(req.body);
    const { latitude, longitude, radius, services, specialties, minRating, limit } = searchParams;
    
    // Haversine formula for distance calculation
    const earthRadiusMiles = 3959;
    
    let query = db
      .select({
        id: modShopPartners.id,
        businessName: modShopPartners.businessName,
        phone: modShopPartners.phone,
        email: modShopPartners.email,
        website: modShopPartners.website,
        streetAddress: modShopPartners.streetAddress,
        city: modShopPartners.city,
        stateProvince: modShopPartners.stateProvince,
        country: modShopPartners.country,
        latitude: modShopPartners.latitude,
        longitude: modShopPartners.longitude,
        servicesOffered: modShopPartners.servicesOffered,
        specialties: modShopPartners.specialties,
        certifications: modShopPartners.certifications,
        customerRating: modShopPartners.customerRating,
        reviewCount: modShopPartners.reviewCount,
        averageCostRange: modShopPartners.averageCostRange,
        typicalTurnaroundDays: modShopPartners.typicalTurnaroundDays,
        verifiedPartner: modShopPartners.verifiedPartner,
        distance: sql<number>`(
          ${earthRadiusMiles} * acos(
            cos(radians(${latitude})) * 
            cos(radians(CAST(${modShopPartners.latitude} AS FLOAT))) * 
            cos(radians(CAST(${modShopPartners.longitude} AS FLOAT)) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(CAST(${modShopPartners.latitude} AS FLOAT)))
          )
        )`
      })
      .from(modShopPartners)
      .where(
        and(
          eq(modShopPartners.partnershipStatus, "active"),
          sql`(
            ${earthRadiusMiles} * acos(
              cos(radians(${latitude})) * 
              cos(radians(CAST(${modShopPartners.latitude} AS FLOAT))) * 
              cos(radians(CAST(${modShopPartners.longitude} AS FLOAT)) - radians(${longitude})) + 
              sin(radians(${latitude})) * 
              sin(radians(CAST(${modShopPartners.latitude} AS FLOAT)))
            )
          ) <= ${radius}`,
          minRating ? sql`CAST(${modShopPartners.customerRating} AS FLOAT) >= ${minRating}` : undefined
        )
      );

    // Filter by services if specified
    if (services && services.length > 0) {
      query = query.where(
        or(
          ...services.map(service => 
            sql`${modShopPartners.servicesOffered} ? ${service}`
          )
        )
      );
    }

    // Filter by specialties if specified
    if (specialties && specialties.length > 0) {
      query = query.where(
        or(
          ...specialties.map(specialty => 
            sql`${modShopPartners.specialties} ? ${specialty}`
          )
        )
      );
    }

    const shops = await query
      .orderBy(sql`distance`)
      .limit(limit);

    res.json({
      success: true,
      shops,
      searchParams: {
        location: { latitude, longitude },
        radius,
        totalFound: shops.length
      }
    });

  } catch (error) {
    console.error('Error searching shops by location:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof z.ZodError ? error.errors : 'Invalid search parameters' 
    });
  }
});

/**
 * Find shops by ZIP code with import-specific matching
 * POST /api/mod-shops/search/zipcode
 */
router.post('/search/zipcode', async (req: Request, res: Response) => {
  try {
    const searchParams = zipCodeSearchSchema.parse(req.body);
    const { zipCode, radius, services, vehicleType, urgency } = searchParams;
    
    // In production, use geocoding service to convert ZIP to coordinates
    // For now, using mock coordinates for major ZIP codes
    const mockCoordinates = getMockCoordinatesFromZip(zipCode);
    if (!mockCoordinates) {
      return res.status(400).json({
        success: false,
        error: 'Unable to geocode ZIP code'
      });
    }

    // Find shops using coordinates
    const locationSearch = await fetch('/api/mod-shops/search/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: mockCoordinates.lat,
        longitude: mockCoordinates.lng,
        radius,
        services
      })
    });

    const nearbyShops = await locationSearch.json();
    
    // Apply import-specific scoring
    const scoredShops = nearbyShops.shops.map((shop: any) => ({
      ...shop,
      importScore: calculateImportScore(shop, vehicleType, urgency),
      recommendationReason: getRecommendationReason(shop, vehicleType, services)
    })).sort((a: any, b: any) => b.importScore - a.importScore);

    res.json({
      success: true,
      shops: scoredShops,
      searchParams: {
        zipCode,
        radius,
        vehicleType,
        urgency,
        totalFound: scoredShops.length
      }
    });

  } catch (error) {
    console.error('Error searching shops by ZIP code:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof z.ZodError ? error.errors : 'Invalid search parameters' 
    });
  }
});

/**
 * Get shop details with reviews and capabilities
 * GET /api/mod-shops/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const shopId = parseInt(req.params.id);
    
    // Get shop details
    const shop = await db
      .select()
      .from(modShopPartners)
      .where(eq(modShopPartners.id, shopId))
      .limit(1);

    if (shop.length === 0) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }

    // Get reviews
    const reviews = await db
      .select()
      .from(shopReviews)
      .where(eq(shopReviews.shopId, shopId))
      .orderBy(desc(shopReviews.reviewDate))
      .limit(10);

    // Get service capabilities
    const capabilities = await db
      .select({
        service: importServices,
        capability: shopServiceCapabilities
      })
      .from(shopServiceCapabilities)
      .leftJoin(importServices, eq(shopServiceCapabilities.serviceId, importServices.id))
      .where(eq(shopServiceCapabilities.shopId, shopId));

    // Get service areas
    const serviceAreas = await db
      .select()
      .from(serviceAreas)
      .where(eq(serviceAreas.shopId, shopId));

    res.json({
      success: true,
      shop: shop[0],
      reviews,
      capabilities,
      serviceAreas,
      stats: {
        avgRating: shop[0].customerRating,
        totalReviews: reviews.length,
        verifiedPartner: shop[0].verifiedPartner,
        servicesCount: capabilities.length
      }
    });

  } catch (error) {
    console.error('Error getting shop details:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Get available services and specialties for filtering
 * GET /api/mod-shops/filters
 */
router.get('/filters', async (req: Request, res: Response) => {
  try {
    // Get all unique services
    const servicesResult = await db
      .select({
        services: modShopPartners.servicesOffered
      })
      .from(modShopPartners)
      .where(eq(modShopPartners.partnershipStatus, "active"));

    // Get all unique specialties
    const specialtiesResult = await db
      .select({
        specialties: modShopPartners.specialties
      })
      .from(modShopPartners)
      .where(eq(modShopPartners.partnershipStatus, "active"));

    // Extract unique values
    const allServices = new Set<string>();
    const allSpecialties = new Set<string>();

    servicesResult.forEach(row => {
      if (row.services) {
        (row.services as string[]).forEach(service => allServices.add(service));
      }
    });

    specialtiesResult.forEach(row => {
      if (row.specialties) {
        (row.specialties as string[]).forEach(specialty => allSpecialties.add(specialty));
      }
    });

    res.json({
      success: true,
      filters: {
        services: Array.from(allServices).sort(),
        specialties: Array.from(allSpecialties).sort(),
        costRanges: [
          "under-500",
          "500-1000", 
          "1000-2000",
          "2000-5000",
          "over-5000"
        ],
        turnaroundTimes: [
          "same-day",
          "1-3-days",
          "1-week",
          "2-weeks",
          "1-month+"
        ]
      }
    });

  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Match customer to optimal shops for specific import requirements
 * POST /api/mod-shops/match-import-requirements
 */
router.post('/match-import-requirements', async (req: Request, res: Response) => {
  try {
    const matchSchema = z.object({
      customerLocation: z.object({
        latitude: z.number(),
        longitude: z.number()
      }),
      vehicleDetails: z.object({
        make: z.string(),
        model: z.string(),
        year: z.number(),
        originCountry: z.string()
      }),
      destinationCountry: z.string(),
      urgency: z.enum(["standard", "urgent", "emergency"]).default("standard"),
      budget: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional()
    });

    const matchParams = matchSchema.parse(req.body);
    const { customerLocation, vehicleDetails, destinationCountry, urgency, budget } = matchParams;

    // Determine required services based on vehicle and destination
    const requiredServices = getRequiredServicesForImport(vehicleDetails, destinationCountry);
    
    // Find nearby shops with required capabilities
    const matchedShops = await findOptimalShopsForImport(
      customerLocation,
      requiredServices,
      urgency,
      budget
    );

    // Generate detailed recommendations
    const recommendations = matchedShops.map(shop => ({
      ...shop,
      matchScore: calculateImportMatchScore(shop, requiredServices, urgency),
      estimatedCost: estimateServiceCost(shop, requiredServices),
      estimatedTimeline: estimateServiceTimeline(shop, requiredServices, urgency),
      missingServices: findMissingServices(shop, requiredServices),
      recommendationDetails: generateRecommendationDetails(shop, vehicleDetails, requiredServices)
    }));

    res.json({
      success: true,
      recommendations: recommendations.sort((a, b) => b.matchScore - a.matchScore),
      requiredServices,
      searchCriteria: {
        vehicle: vehicleDetails,
        destination: destinationCountry,
        location: customerLocation,
        urgency
      },
      summary: {
        totalShopsFound: recommendations.length,
        perfectMatches: recommendations.filter(r => r.matchScore >= 90).length,
        goodMatches: recommendations.filter(r => r.matchScore >= 70).length
      }
    });

  } catch (error) {
    console.error('Error matching import requirements:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof z.ZodError ? error.errors : 'Invalid match parameters' 
    });
  }
});

// Helper functions

function getMockCoordinatesFromZip(zipCode: string): { lat: number; lng: number } | null {
  // Mock coordinates for major ZIP codes - in production use geocoding service
  const mockZips: Record<string, { lat: number; lng: number }> = {
    '90210': { lat: 34.0901, lng: -118.4065 }, // Beverly Hills, CA
    '10001': { lat: 40.7505, lng: -73.9934 },  // New York, NY
    '60601': { lat: 41.8827, lng: -87.6233 },  // Chicago, IL
    '77001': { lat: 29.7604, lng: -95.3698 },  // Houston, TX
    '94102': { lat: 37.7749, lng: -122.4194 }, // San Francisco, CA
    '02101': { lat: 42.3601, lng: -71.0589 },  // Boston, MA
    '33101': { lat: 25.7617, lng: -80.1918 },  // Miami, FL
    '98101': { lat: 47.6062, lng: -122.3321 }, // Seattle, WA
    '85001': { lat: 33.4484, lng: -112.0740 }, // Phoenix, AZ
    '80201': { lat: 39.7392, lng: -104.9903 }  // Denver, CO
  };
  
  return mockZips[zipCode] || null;
}

function calculateImportScore(shop: any, vehicleType?: string, urgency?: string): number {
  let score = 0;
  
  // Base rating score (0-50 points)
  if (shop.customerRating) {
    score += (parseFloat(shop.customerRating) / 5) * 50;
  }
  
  // Verification bonus (0-20 points)
  if (shop.verifiedPartner) {
    score += 20;
  }
  
  // Service match bonus (0-20 points)
  const importServices = ['import_compliance', 'vin_verification', 'emissions_testing', 'safety_inspection'];
  const shopServices = shop.servicesOffered || [];
  const serviceMatches = importServices.filter(service => shopServices.includes(service)).length;
  score += (serviceMatches / importServices.length) * 20;
  
  // Urgency handling (0-10 points)
  if (urgency === 'urgent' && shop.typicalTurnaroundDays <= 3) {
    score += 10;
  } else if (urgency === 'emergency' && shop.typicalTurnaroundDays <= 1) {
    score += 10;
  } else if (urgency === 'standard') {
    score += 5;
  }
  
  return Math.round(score);
}

function getRecommendationReason(shop: any, vehicleType?: string, services?: string[]): string {
  const reasons = [];
  
  if (shop.verifiedPartner) {
    reasons.push("Verified ImportIQ partner");
  }
  
  if (shop.customerRating >= 4.5) {
    reasons.push("Highly rated by customers");
  }
  
  if (services) {
    const shopServices = shop.servicesOffered || [];
    const matchedServices = services.filter(service => shopServices.includes(service));
    if (matchedServices.length > 0) {
      reasons.push(`Offers ${matchedServices.length} required services`);
    }
  }
  
  if (shop.distance < 10) {
    reasons.push("Close to your location");
  }
  
  return reasons.join(", ") || "Available for import services";
}

function getRequiredServicesForImport(vehicleDetails: any, destinationCountry: string): string[] {
  const baseServices = ['vin_verification', 'import_compliance'];
  
  // Add country-specific requirements
  switch (destinationCountry.toLowerCase()) {
    case 'usa':
      baseServices.push('dot_compliance', 'epa_compliance');
      if (vehicleDetails.year < new Date().getFullYear() - 25) {
        baseServices.push('classic_car_certification');
      }
      break;
    case 'canada':
      baseServices.push('riv_inspection', 'transport_canada_compliance');
      break;
    case 'uk':
      baseServices.push('mot_test', 'dvla_registration');
      break;
    case 'australia':
      baseServices.push('adas_compliance', 'adr_certification');
      break;
  }
  
  // Add vehicle-specific services
  if (vehicleDetails.originCountry === 'japan') {
    baseServices.push('jdm_specialist');
  }
  
  return baseServices;
}

async function findOptimalShopsForImport(
  location: { latitude: number; longitude: number },
  requiredServices: string[],
  urgency: string,
  budget?: { min?: number; max?: number }
): Promise<any[]> {
  const earthRadiusMiles = 3959;
  const maxRadius = urgency === 'emergency' ? 25 : urgency === 'urgent' ? 50 : 100;
  
  const shops = await db
    .select()
    .from(modShopPartners)
    .where(
      and(
        eq(modShopPartners.partnershipStatus, "active"),
        sql`(
          ${earthRadiusMiles} * acos(
            cos(radians(${location.latitude})) * 
            cos(radians(CAST(${modShopPartners.latitude} AS FLOAT))) * 
            cos(radians(CAST(${modShopPartners.longitude} AS FLOAT)) - radians(${location.longitude})) + 
            sin(radians(${location.latitude})) * 
            sin(radians(CAST(${modShopPartners.latitude} AS FLOAT)))
          )
        ) <= ${maxRadius}`
      )
    )
    .limit(50);
  
  return shops.filter(shop => {
    const shopServices = shop.servicesOffered as string[] || [];
    return requiredServices.some(service => shopServices.includes(service));
  });
}

function calculateImportMatchScore(shop: any, requiredServices: string[], urgency: string): number {
  let score = 0;
  
  // Service capability match (0-40 points)
  const shopServices = shop.servicesOffered as string[] || [];
  const serviceMatches = requiredServices.filter(service => shopServices.includes(service)).length;
  score += (serviceMatches / requiredServices.length) * 40;
  
  // Rating and verification (0-30 points)
  if (shop.customerRating) {
    score += (parseFloat(shop.customerRating) / 5) * 20;
  }
  if (shop.verifiedPartner) {
    score += 10;
  }
  
  // Turnaround time match (0-20 points)
  const urgencyMap = { emergency: 1, urgent: 3, standard: 7 };
  const maxDays = urgencyMap[urgency as keyof typeof urgencyMap];
  if (shop.typicalTurnaroundDays <= maxDays) {
    score += 20;
  } else if (shop.typicalTurnaroundDays <= maxDays * 2) {
    score += 10;
  }
  
  // Experience and specialization (0-10 points)
  const specialties = shop.specialties as string[] || [];
  if (specialties.includes('import_vehicles') || specialties.includes('jdm_vehicles')) {
    score += 10;
  }
  
  return Math.round(score);
}

function estimateServiceCost(shop: any, requiredServices: string[]): { min: number; max: number; currency: string } {
  // Base estimation logic - in production, use detailed service pricing
  const baseCost = requiredServices.length * 200;
  const shopMultiplier = shop.customerRating ? parseFloat(shop.customerRating) / 4 : 1;
  
  return {
    min: Math.round(baseCost * shopMultiplier * 0.8),
    max: Math.round(baseCost * shopMultiplier * 1.5),
    currency: 'USD'
  };
}

function estimateServiceTimeline(shop: any, requiredServices: string[], urgency: string): { min: number; max: number; unit: string } {
  const baseDays = shop.typicalTurnaroundDays || 5;
  const serviceMultiplier = Math.max(1, requiredServices.length / 3);
  
  const urgencyMultiplier = urgency === 'emergency' ? 0.5 : urgency === 'urgent' ? 0.7 : 1;
  
  const estimatedDays = baseDays * serviceMultiplier * urgencyMultiplier;
  
  return {
    min: Math.max(1, Math.round(estimatedDays * 0.8)),
    max: Math.round(estimatedDays * 1.3),
    unit: 'days'
  };
}

function findMissingServices(shop: any, requiredServices: string[]): string[] {
  const shopServices = shop.servicesOffered as string[] || [];
  return requiredServices.filter(service => !shopServices.includes(service));
}

function generateRecommendationDetails(shop: any, vehicleDetails: any, requiredServices: string[]): string {
  const details = [];
  
  if (shop.verifiedPartner) {
    details.push("✓ Verified ImportIQ partner with guaranteed service quality");
  }
  
  const shopServices = shop.servicesOffered as string[] || [];
  const availableServices = requiredServices.filter(service => shopServices.includes(service));
  if (availableServices.length > 0) {
    details.push(`✓ Provides ${availableServices.length}/${requiredServices.length} required services`);
  }
  
  if (shop.customerRating >= 4.0) {
    details.push(`✓ Excellent customer rating: ${shop.customerRating}/5.0`);
  }
  
  const specialties = shop.specialties as string[] || [];
  if (vehicleDetails.originCountry === 'japan' && specialties.includes('jdm_vehicles')) {
    details.push("✓ JDM specialist - experienced with Japanese imports");
  }
  
  return details.join("\n");
}

export default router;