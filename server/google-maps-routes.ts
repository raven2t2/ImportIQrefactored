import { Router } from 'express';
import { googleMapsService } from './google-maps-service';

const router = Router();

// Find nearby mod shops using Google Maps geocoding and distance calculation
router.get('/nearby', async (req, res) => {
  try {
    const { location, specialty, radius = '100', limit = '10' } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }
    
    console.log(`🗺️ Google Maps API: Finding shops near "${location}"`);
    
    const nearbyShops = await googleMapsService.findNearbyShops(
      location.toString(),
      specialty?.toString(),
      parseInt(radius.toString()),
      parseInt(limit.toString())
    );
    
    res.json({
      success: true,
      shops: nearbyShops,
      total: nearbyShops.length,
      searchParams: {
        location: location.toString(),
        specialty: specialty?.toString(),
        radius: parseInt(radius.toString()),
        limit: parseInt(limit.toString())
      }
    });
    
  } catch (error) {
    console.error('❌ Google Maps nearby search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find nearby shops',
      shops: [],
      total: 0
    });
  }
});

// Geocode a location (for frontend map display)
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address parameter is required'
      });
    }
    
    const result = await googleMapsService.geocodeLocation(address.toString());
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      result
    });
    
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Geocoding failed'
    });
  }
});

// Initialize geocoding for all existing shops (admin function)
router.post('/geocode-shops', async (req, res) => {
  try {
    await googleMapsService.geocodeAllShops();
    
    res.json({
      success: true,
      message: 'Shop geocoding completed'
    });
    
  } catch (error) {
    console.error('❌ Shop geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Shop geocoding failed'
    });
  }
});

export default router;