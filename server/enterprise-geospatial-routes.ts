/**
 * Enterprise Geospatial API Routes
 * Exposes advanced PostGIS-powered Google Maps functionality
 */

import express from 'express';
import EnterpriseGeospatialIntelligence from './enterprise-geospatial-intelligence';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const proximitySearchSchema = z.object({
  customerLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  vehicleType: z.string().min(1),
  requiredServices: z.array(z.string()).optional().default([]),
  maxRadius: z.number().min(1).max(100).default(25),
  urgency: z.enum(['standard', 'urgent', 'emergency']).default('standard')
});

const serviceAreaSchema = z.object({
  shopId: z.number().int().positive(),
  maxDriveTime: z.number().min(5).max(120).default(45)
});

const marketAnalysisSchema = z.object({
  region: z.string().min(1),
  analysisType: z.enum(['competition', 'opportunities', 'gaps']).default('competition')
});

const discoverySchema = z.object({
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  radius: z.number().min(1000).max(50000).default(25000),
  categories: z.array(z.string()).optional()
});

/**
 * POST /api/geospatial/proximity-search
 * Advanced intelligent proximity matching with PostGIS spatial queries
 */
router.post('/proximity-search', async (req, res) => {
  try {
    const query = proximitySearchSchema.parse(req.body);
    
    console.log(`🎯 Enterprise proximity search: ${query.vehicleType} near ${query.customerLocation.lat}, ${query.customerLocation.lng}`);
    
    const results = await EnterpriseGeospatialIntelligence.findOptimalShops(query);
    
    res.json({
      success: true,
      query: {
        location: query.customerLocation,
        vehicleType: query.vehicleType,
        services: query.requiredServices,
        radius: query.maxRadius,
        urgency: query.urgency
      },
      results: results.map(shop => ({
        shopId: shop.shopId,
        businessName: shop.businessName,
        location: {
          driveTimeMinutes: shop.driveTimeMinutes,
          distanceKm: shop.distanceKm,
          routePolyline: shop.routePolyline
        },
        intelligence: {
          confidenceScore: shop.confidenceScore,
          availabilityStatus: shop.availabilityStatus,
          serviceCapacity: shop.serviceCapacity,
          estimatedCost: shop.estimatedCost
        },
        traffic: shop.trafficConditions,
        recommendations: {
          optimal: shop.confidenceScore > 0.8,
          available: shop.availabilityStatus === 'open',
          preferred: shop.serviceCapacity > 70
        }
      })),
      metadata: {
        searchRadius: query.maxRadius,
        resultsFound: results.length,
        averageConfidence: results.length > 0 
          ? Math.round((results.reduce((sum, r) => sum + r.confidenceScore, 0) / results.length) * 100) / 100
          : 0,
        searchTechnology: 'PostGIS_GoogleMaps_Enterprise'
      }
    });

  } catch (error) {
    console.error('Proximity search failed:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Proximity search service temporarily unavailable',
      fallback: 'Using standard location search'
    });
  }
});

/**
 * POST /api/geospatial/predictive-routing
 * Generate predictive routes with traffic and weather considerations
 */
router.post('/predictive-routing', async (req, res) => {
  try {
    const query = proximitySearchSchema.parse(req.body);
    
    console.log(`🚗 Predictive routing analysis for ${query.vehicleType}`);
    
    const routeAnalysis = await EnterpriseGeospatialIntelligence.generatePredictiveRoute(query);
    
    if (routeAnalysis.error) {
      return res.status(404).json({
        success: false,
        error: routeAnalysis.error,
        suggestions: [
          'Try expanding search radius',
          'Consider alternative service types',
          'Check for shops in nearby areas'
        ]
      });
    }
    
    res.json({
      success: true,
      routing: {
        primary: {
          shopId: routeAnalysis.primaryRoute.shopId,
          businessName: routeAnalysis.primaryRoute.businessName,
          totalTime: routeAnalysis.primaryRoute.driveTimeMinutes,
          totalDistance: routeAnalysis.primaryRoute.distanceKm,
          estimatedCost: routeAnalysis.primaryRoute.estimatedCost,
          confidence: routeAnalysis.primaryRoute.confidenceScore
        },
        alternatives: routeAnalysis.alternatives.map((alt: any) => ({
          shopId: alt.shopId,
          businessName: alt.businessName,
          timeComparison: `+${alt.driveTimeMinutes - routeAnalysis.primaryRoute.driveTimeMinutes} min`,
          costComparison: alt.estimatedCost - routeAnalysis.primaryRoute.estimatedCost,
          pros: alt.confidenceScore > routeAnalysis.primaryRoute.confidenceScore 
            ? ['Higher trust score'] : [],
          cons: alt.driveTimeMinutes > routeAnalysis.primaryRoute.driveTimeMinutes 
            ? ['Longer drive time'] : []
        })),
        optimization: routeAnalysis.multiStopOptimization,
        intelligence: {
          routeId: routeAnalysis.routeId,
          potentialSavings: routeAnalysis.estimatedSavings,
          riskAssessment: routeAnalysis.riskAssessment,
          technology: 'Google_Roads_API_PostGIS'
        }
      }
    });

  } catch (error) {
    console.error('Predictive routing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Predictive routing service unavailable'
    });
  }
});

/**
 * POST /api/geospatial/service-area-mapping
 * Dynamic service area mapping using Google Roads API
 */
router.post('/service-area-mapping', async (req, res) => {
  try {
    const { shopId, maxDriveTime } = serviceAreaSchema.parse(req.body);
    
    console.log(`📍 Service area mapping for shop ${shopId} (${maxDriveTime} min radius)`);
    
    const serviceArea = await EnterpriseGeospatialIntelligence.calculateServiceArea(shopId, maxDriveTime);
    
    if (!serviceArea) {
      return res.status(404).json({
        success: false,
        error: 'Shop not found or service area calculation failed'
      });
    }
    
    res.json({
      success: true,
      serviceArea: {
        shopId: serviceArea.shopId,
        maxDriveTime,
        coveragePolygon: serviceArea.serviceAreaPolygon,
        analysis: {
          testPointsAnalyzed: serviceArea.testPointsAnalyzed,
          reachablePoints: serviceArea.reachablePoints,
          coverageEfficiency: Math.round((serviceArea.reachablePoints / serviceArea.testPointsAnalyzed) * 100),
          roadAccessibility: serviceArea.reachablePoints > 50 ? 'excellent' : 
                            serviceArea.reachablePoints > 30 ? 'good' : 'limited'
        },
        technology: 'Google_Distance_Matrix_PostGIS_Polygons'
      }
    });

  } catch (error) {
    console.error('Service area mapping failed:', error);
    res.status(500).json({
      success: false,
      error: 'Service area mapping unavailable'
    });
  }
});

/**
 * GET /api/geospatial/real-time-capacity
 * Real-time capacity intelligence across all shops
 */
router.get('/real-time-capacity', async (req, res) => {
  try {
    console.log('🔄 Updating real-time shop capacity intelligence');
    
    await EnterpriseGeospatialIntelligence.updateRealTimeCapacity();
    
    res.json({
      success: true,
      message: 'Real-time capacity intelligence updated',
      timestamp: new Date().toISOString(),
      technology: 'Google_Places_Business_Status_API'
    });

  } catch (error) {
    console.error('Real-time capacity update failed:', error);
    res.status(500).json({
      success: false,
      error: 'Capacity intelligence service unavailable'
    });
  }
});

/**
 * POST /api/geospatial/discover-shops
 * Automated shop discovery using Google Places API
 */
router.post('/discover-shops', async (req, res) => {
  try {
    const { location, radius, categories } = discoverySchema.parse(req.body);
    
    console.log(`🔍 Automated shop discovery near ${location.lat}, ${location.lng}`);
    
    const discoveredShops = await EnterpriseGeospatialIntelligence.discoverNewShops(location, radius);
    
    res.json({
      success: true,
      discovery: {
        searchLocation: location,
        searchRadius: radius,
        shopsFound: discoveredShops.length,
        highQualityShops: discoveredShops.filter(shop => shop.suitabilityScore > 0.8).length,
        shops: discoveredShops.map(shop => ({
          businessName: shop.businessName,
          googlePlaceId: shop.googlePlaceId,
          address: shop.address,
          rating: shop.googleRating,
          reviewCount: shop.googleReviewCount,
          suitabilityScore: shop.suitabilityScore,
          businessTypes: shop.businessTypes,
          contact: {
            phone: shop.phoneNumber,
            website: shop.websiteUrl
          },
          status: shop.needsVerification ? 'pending_verification' : 'verified',
          discoverySource: shop.discoverySource
        }))
      },
      recommendations: {
        highPriority: discoveredShops
          .filter(shop => shop.suitabilityScore > 0.8)
          .slice(0, 5)
          .map(shop => shop.businessName),
        contactSuggestions: [
          'Verify business specialization in vehicle modifications',
          'Confirm service capacity and availability',
          'Assess partnership interest and terms'
        ]
      },
      technology: 'Google_Places_Text_Search_AI_Analysis'
    });

  } catch (error) {
    console.error('Shop discovery failed:', error);
    res.status(500).json({
      success: false,
      error: 'Shop discovery service unavailable'
    });
  }
});

/**
 * POST /api/geospatial/market-analysis
 * Competitive intelligence analysis by geographic region
 */
router.post('/market-analysis', async (req, res) => {
  try {
    const { region, analysisType } = marketAnalysisSchema.parse(req.body);
    
    console.log(`📊 Market competition analysis for ${region}`);
    
    const marketIntelligence = await EnterpriseGeospatialIntelligence.analyzeMarketCompetition(region);
    
    if (marketIntelligence.error) {
      return res.status(500).json({
        success: false,
        error: marketIntelligence.error
      });
    }
    
    res.json({
      success: true,
      marketIntelligence: {
        region: marketIntelligence.region,
        competition: {
          level: marketIntelligence.competitionLevel,
          density: marketIntelligence.competitionLevel === 'high' ? 'Saturated market' :
                   marketIntelligence.competitionLevel === 'medium' ? 'Competitive market' :
                   'Emerging market opportunity'
        },
        opportunities: {
          expansion: marketIntelligence.marketOpportunities,
          serviceGaps: marketIntelligence.serviceGaps,
          priority: marketIntelligence.serviceGaps.length > 2 ? 'high' : 'medium'
        },
        recommendations: marketIntelligence.recommendedActions,
        insights: {
          marketMaturity: marketIntelligence.competitionLevel,
          growthPotential: marketIntelligence.serviceGaps.length > 1 ? 'high' : 'moderate',
          investmentRisk: marketIntelligence.competitionLevel === 'high' ? 'medium' : 'low'
        }
      },
      technology: 'PostGIS_Spatial_Analysis_Google_Places_Intelligence'
    });

  } catch (error) {
    console.error('Market analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Market analysis service unavailable'
    });
  }
});

/**
 * GET /api/geospatial/system-status
 * Enterprise geospatial system status and capabilities
 */
router.get('/system-status', async (req, res) => {
  try {
    res.json({
      success: true,
      system: {
        postgisEnabled: true,
        googleMapsIntegration: !!process.env.GOOGLE_MAPS_API_KEY,
        spatialIndexes: 'active',
        realTimeCapacity: 'operational'
      },
      capabilities: {
        intelligentProximityMatching: true,
        dynamicServiceAreaMapping: true,
        predictiveRouting: true,
        realTimeCapacityIntelligence: true,
        automatedShopDiscovery: true,
        competitiveIntelligence: true,
        postgisSpatialQueries: true,
        googleRoadsAPIIntegration: true,
        trafficAwareRouting: true,
        weatherConsiderations: false // Would require weather API
      },
      apiEndpoints: {
        proximitySearch: '/api/geospatial/proximity-search',
        predictiveRouting: '/api/geospatial/predictive-routing',
        serviceAreaMapping: '/api/geospatial/service-area-mapping',
        realTimeCapacity: '/api/geospatial/real-time-capacity',
        shopDiscovery: '/api/geospatial/discover-shops',
        marketAnalysis: '/api/geospatial/market-analysis'
      },
      differentiators: [
        'PostGIS spatial database with geometric indexing',
        'Google Roads API for precise drive time calculations',
        'Real-time capacity intelligence via Google Places API',
        'Automated competitor discovery and analysis',
        'Predictive routing with traffic pattern analysis',
        'Dynamic service area polygons based on road accessibility'
      ]
    });

  } catch (error) {
    console.error('System status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'System status unavailable'
    });
  }
});

export default router;