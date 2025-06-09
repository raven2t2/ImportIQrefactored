import { Router } from 'express';
import { locationIntelligence } from './enhanced-location-intelligence';

const router = Router();

// Get optimal port recommendations based on user location and preferences
router.get('/ports/recommendations', async (req, res) => {
  try {
    const { userLocation, vehicleOrigin, priority = 'convenience', vehicleType = 'JDM', budget = 10000 } = req.query;
    
    if (!userLocation) {
      return res.status(400).json({
        success: false,
        error: 'userLocation parameter is required'
      });
    }

    console.log(`🚢 Getting port recommendations for ${userLocation}`);
    
    const recommendations = await locationIntelligence.getOptimalPortRecommendations(
      userLocation.toString(),
      vehicleOrigin?.toString() || 'Japan',
      {
        priority: priority as 'cost' | 'speed' | 'convenience',
        vehicleType: vehicleType as 'JDM' | 'European' | 'Luxury' | 'Classic',
        budget: parseInt(budget.toString())
      }
    );

    res.json({
      success: true,
      recommendations,
      total: recommendations.length,
      searchParams: {
        userLocation: userLocation.toString(),
        vehicleOrigin: vehicleOrigin?.toString() || 'Japan',
        priority,
        vehicleType,
        budget: parseInt(budget.toString())
      }
    });

  } catch (error) {
    console.error('❌ Port recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get port recommendations',
      recommendations: []
    });
  }
});

// Get shipping routes and transit information
router.get('/shipping/routes', async (req, res) => {
  try {
    const { originCountry, destinationPort } = req.query;
    
    if (!originCountry || !destinationPort) {
      return res.status(400).json({
        success: false,
        error: 'originCountry and destinationPort parameters are required'
      });
    }

    console.log(`🚢 Getting shipping routes from ${originCountry} to ${destinationPort}`);
    
    const routes = await locationIntelligence.getShippingRoutes(
      originCountry.toString(),
      destinationPort.toString()
    );

    res.json({
      success: true,
      routes,
      total: routes.length,
      searchParams: {
        originCountry: originCountry.toString(),
        destinationPort: destinationPort.toString()
      }
    });

  } catch (error) {
    console.error('❌ Shipping routes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get shipping routes',
      routes: []
    });
  }
});

// Get location-based compliance requirements and local agents
router.get('/compliance/local', async (req, res) => {
  try {
    const { userLocation, make, model, year, origin } = req.query;
    
    if (!userLocation) {
      return res.status(400).json({
        success: false,
        error: 'userLocation parameter is required'
      });
    }

    console.log(`📋 Getting compliance requirements for ${userLocation}`);
    
    const compliance = await locationIntelligence.getLocationBasedCompliance(
      userLocation.toString(),
      {
        make: make?.toString() || 'Toyota',
        model: model?.toString() || 'Supra',
        year: parseInt(year?.toString() || '1995'),
        origin: origin?.toString() || 'Japan'
      }
    );

    res.json({
      success: true,
      compliance,
      searchParams: {
        userLocation: userLocation.toString(),
        vehicleDetails: {
          make: make?.toString() || 'Toyota',
          model: model?.toString() || 'Supra',
          year: parseInt(year?.toString() || '1995'),
          origin: origin?.toString() || 'Japan'
        }
      }
    });

  } catch (error) {
    console.error('❌ Compliance requirements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compliance requirements',
      compliance: null
    });
  }
});

// Get comprehensive import journey intelligence
router.get('/journey/complete', async (req, res) => {
  try {
    const { 
      userLocation, 
      vehicleOrigin = 'Japan', 
      make = 'Toyota', 
      model = 'Supra', 
      year = '1995',
      priority = 'convenience',
      vehicleType = 'JDM',
      budget = '10000'
    } = req.query;
    
    if (!userLocation) {
      return res.status(400).json({
        success: false,
        error: 'userLocation parameter is required'
      });
    }

    console.log(`🎯 Getting complete import journey for ${make} ${model} to ${userLocation}`);
    
    // Get all intelligence data in parallel
    const [portRecommendations, compliance] = await Promise.all([
      locationIntelligence.getOptimalPortRecommendations(
        userLocation.toString(),
        vehicleOrigin.toString(),
        {
          priority: priority as 'cost' | 'speed' | 'convenience',
          vehicleType: vehicleType as 'JDM' | 'European' | 'Luxury' | 'Classic',
          budget: parseInt(budget.toString())
        }
      ),
      locationIntelligence.getLocationBasedCompliance(
        userLocation.toString(),
        {
          make: make.toString(),
          model: model.toString(),
          year: parseInt(year.toString()),
          origin: vehicleOrigin.toString()
        }
      )
    ]);

    // Get shipping routes for the top port recommendation
    let shippingRoutes = [];
    if (portRecommendations.length > 0) {
      shippingRoutes = await locationIntelligence.getShippingRoutes(
        vehicleOrigin.toString(),
        portRecommendations[0].country
      );
    }

    res.json({
      success: true,
      journey: {
        vehicle: {
          make: make.toString(),
          model: model.toString(),
          year: parseInt(year.toString()),
          origin: vehicleOrigin.toString()
        },
        destination: {
          location: userLocation.toString(),
          region: compliance.region
        },
        recommendations: {
          ports: portRecommendations,
          shipping: shippingRoutes,
          compliance: compliance
        },
        summary: {
          estimatedTotalCost: portRecommendations[0]?.estimatedCost + compliance.totalCost + (shippingRoutes[0]?.estimatedCost || 0),
          estimatedTimeframe: `${shippingRoutes[0]?.transitTime || '14-21 days'} shipping + ${compliance.estimatedTimeframe} processing`,
          recommendedPort: portRecommendations[0]?.portName,
          nextSteps: compliance.requirements.slice(0, 3)
        }
      }
    });

  } catch (error) {
    console.error('❌ Complete journey error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get complete import journey',
      journey: null
    });
  }
});

export default router;