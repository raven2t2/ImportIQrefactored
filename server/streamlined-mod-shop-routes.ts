import { Router, Request, Response } from 'express';
import { db } from './db';
import { modShopPartners } from '@shared/schema';
import { eq, and, or, sql, desc, asc, like } from 'drizzle-orm';

const router = Router();

/**
 * Search mod shops by location and services
 * GET /api/mod-shops/search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { location, radius = 100, limit = 20, services, vehicle } = req.query;
    
    // Basic search query with existing schema
    let query = db
      .select({
        id: modShopPartners.id,
        name: modShopPartners.name,
        businessName: modShopPartners.businessName,
        description: modShopPartners.description,
        website: modShopPartners.website,
        location: modShopPartners.location,
        specialty: modShopPartners.specialty,
        isActive: modShopPartners.isActive,
        createdAt: modShopPartners.createdAt
      })
      .from(modShopPartners)
      .where(eq(modShopPartners.isActive, true));

    // Apply filters based on query parameters
    if (services) {
      const serviceArray = Array.isArray(services) ? services : [services];
      const serviceConditions = serviceArray.map(service => 
        like(modShopPartners.specialty, `%${service}%`)
      );
      query = query.where(and(
        eq(modShopPartners.isActive, true),
        or(...serviceConditions)
      ));
    }

    if (vehicle) {
      // Match vehicle to specialty
      const vehicleStr = String(vehicle).toLowerCase();
      if (vehicleStr.includes('skyline') || vehicleStr.includes('nissan') || vehicleStr.includes('jdm')) {
        query = query.where(and(
          eq(modShopPartners.isActive, true),
          like(modShopPartners.specialty, '%JDM%')
        ));
      } else if (vehicleStr.includes('bmw') || vehicleStr.includes('mercedes') || vehicleStr.includes('audi') || vehicleStr.includes('european')) {
        query = query.where(and(
          eq(modShopPartners.isActive, true),
          like(modShopPartners.specialty, '%European%')
        ));
      } else if (vehicleStr.includes('honda') || vehicleStr.includes('toyota')) {
        query = query.where(and(
          eq(modShopPartners.isActive, true),
          or(
            like(modShopPartners.specialty, '%Honda%'),
            like(modShopPartners.specialty, '%Toyota%')
          )
        ));
      }
    }

    // Execute query with limit
    const shops = await query.limit(Number(limit));

    res.json({
      success: true,
      shops,
      total: shops.length,
      searchParams: { location, radius, services, vehicle }
    });

  } catch (error) {
    console.error('Error searching mod shops:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

/**
 * Get shop details by ID
 * GET /api/mod-shops/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const shopId = parseInt(req.params.id);
    
    const shop = await db
      .select()
      .from(modShopPartners)
      .where(eq(modShopPartners.id, shopId))
      .limit(1);

    if (shop.length === 0) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }

    res.json({
      success: true,
      shop: shop[0]
    });

  } catch (error) {
    console.error('Error getting shop details:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

/**
 * Get shops by specialty
 * GET /api/mod-shops/specialty/:type
 */
router.get('/specialty/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;

    const shops = await db
      .select()
      .from(modShopPartners)
      .where(and(
        eq(modShopPartners.isActive, true),
        like(modShopPartners.specialty, `%${type}%`)
      ))
      .limit(Number(limit));

    res.json({
      success: true,
      shops,
      specialty: type,
      total: shops.length
    });

  } catch (error) {
    console.error('Error getting shops by specialty:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

/**
 * Get all active shops
 * GET /api/mod-shops/all
 */
router.get('/all', async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;

    const shops = await db
      .select()
      .from(modShopPartners)
      .where(eq(modShopPartners.isActive, true))
      .orderBy(asc(modShopPartners.name))
      .limit(Number(limit));

    res.json({
      success: true,
      shops,
      total: shops.length
    });

  } catch (error) {
    console.error('Error getting all shops:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

export { router as streamlinedModShopRoutes };