import { Router, Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { seedRealGeographicModShops } from './real-geographic-mod-shop-seeder';

const router = Router();

/**
 * Search mod shops - Complete customer journey integration
 * GET /api/mod-shops/search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { location, radius, limit, services, vehicle, postalCode, city, state } = req.query;
    const searchLimit = limit ? parseInt(String(limit)) : 20;
    const searchRadius = radius ? parseInt(String(radius)) : 50; // miles
    
    let query = sql`
      SELECT id, name, business_name, contact_person, description, website,
             location, specialty, is_active, created_at
      FROM mod_shop_partners 
      WHERE is_active = true
    `;

    // Add location-based filtering using the location field
    if (postalCode) {
      query = sql`${query} AND location ILIKE ${'%' + postalCode + '%'}`;
    } else if (city && state) {
      query = sql`${query} AND (location ILIKE ${'%' + city + '%'} AND location ILIKE ${'%' + state + '%'})`;
    } else if (state) {
      query = sql`${query} AND location ILIKE ${'%' + state + '%'}`;
    } else if (city) {
      query = sql`${query} AND location ILIKE ${'%' + city + '%'}`;
    }

    // Add service filtering
    if (services) {
      const serviceArray = String(services).split(',');
      query = sql`${query} AND services_offered ?& ${serviceArray}`;
    }

    query = sql`${query} ORDER BY customer_rating DESC, review_count DESC LIMIT ${searchLimit}`;

    const shops = await db.execute(query);

    res.json({
      success: true,
      shops: shops.rows,
      total: shops.rows.length,
      searchParams: { location, radius, services, vehicle, postalCode, city, state }
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
    
    if (isNaN(shopId)) {
      return res.status(400).json({ success: false, error: 'Invalid shop ID' });
    }
    
    const shop = await db.execute(sql`
      SELECT * FROM mod_shop_partners 
      WHERE id = ${shopId} AND is_active = true
      LIMIT 1
    `);

    if (shop.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }

    res.json({
      success: true,
      shop: shop.rows[0]
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
 * Get shops by specialty for vehicle matching
 * GET /api/mod-shops/specialty/:type
 */
router.get('/specialty/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { limit } = req.query;
    const searchLimit = limit ? parseInt(String(limit)) : 10;

    const shops = await db.execute(sql`
      SELECT id, business_name, contact_person, website,
             street_address, city, state_province, postal_code, 
             specialties, services_offered, is_active
      FROM mod_shop_partners 
      WHERE specialties @> ${[type]} AND is_active = true
      ORDER BY business_name ASC
      LIMIT ${searchLimit}
    `);

    res.json({
      success: true,
      shops: shops.rows,
      specialty: type,
      total: shops.rows.length
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
 * Get all active shops for complete listing
 * GET /api/mod-shops/all
 */
router.get('/all', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const searchLimit = limit ? parseInt(String(limit)) : 50;

    const shops = await db.execute(sql`
      SELECT id, name, business_name, contact_person, description, website,
             location, specialty, is_active, created_at
      FROM mod_shop_partners 
      WHERE is_active = true
      ORDER BY name ASC
      LIMIT ${searchLimit}
    `);

    res.json({
      success: true,
      shops: shops.rows,
      total: shops.rows.length
    });

  } catch (error) {
    console.error('Error getting all shops:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

/**
 * Seed geographic mod shop data
 * POST /api/mod-shops/seed-geographic
 */
router.post('/seed-geographic', async (req: Request, res: Response) => {
  try {
    const result = await seedRealGeographicModShops();
    res.json({
      success: true,
      message: 'Geographic mod shop data seeded successfully',
      ...result
    });
  } catch (error) {
    console.error('Error seeding geographic mod shops:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

export { router as finalModShopRoutes };