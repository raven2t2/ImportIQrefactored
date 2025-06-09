import { Router, Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

const router = Router();

/**
 * Search mod shops with direct SQL for immediate functionality
 * GET /api/mod-shops/search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { location, radius = 100, limit = 20, services, vehicle } = req.query;
    
    // Direct SQL query to get mod shop data
    const shops = await db.execute(sql`
      SELECT id, business_name, contact_person, email, phone, website,
             street_address, city, state_province, postal_code, country,
             services_offered, specialties, customer_rating, review_count,
             average_cost_range, typical_turnaround_days
      FROM mod_shop_partners 
      LIMIT ${Number(limit)}
    `);

    res.json({
      success: true,
      shops: shops.rows,
      total: shops.rows.length,
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
    
    const shop = await db.execute(sql`
      SELECT * FROM mod_shop_partners 
      WHERE id = ${shopId}
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
 * Get shops by specialties
 * GET /api/mod-shops/specialty/:type
 */
router.get('/specialty/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;

    const shops = await db.execute(sql`
      SELECT id, business_name, contact_person, email, phone, website,
             city, state_province, specialties, customer_rating, review_count
      FROM mod_shop_partners 
      WHERE specialties::text ILIKE ${`%${type}%`}
      LIMIT ${Number(limit)}
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
 * Get all active shops
 * GET /api/mod-shops/all
 */
router.get('/all', async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;

    const shops = await db.execute(sql`
      SELECT id, business_name, contact_person, email, phone, website,
             city, state_province, country, specialties, customer_rating
      FROM mod_shop_partners 
      ORDER BY business_name ASC
      LIMIT ${Number(limit)}
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

export { router as workingModShopRoutes };