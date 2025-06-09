import { Router, Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

const router = Router();

/**
 * Search mod shops - Complete customer journey integration
 * GET /api/mod-shops/search
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { location, radius, limit, services, vehicle } = req.query;
    const searchLimit = limit ? parseInt(String(limit)) : 20;
    
    // Get active mod shop partners from PostgreSQL
    const shops = await db.execute(sql`
      SELECT id, name, business_name, contact_person, description, website,
             location, specialty, is_active, created_at,
             primary_contact, secondary_contact, logo_url, discount_code, discount_percent
      FROM mod_shop_partners 
      WHERE is_active = true
      ORDER BY name ASC
      LIMIT ${searchLimit}
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
      SELECT id, name, business_name, contact_person, description, website,
             location, specialty, is_active
      FROM mod_shop_partners 
      WHERE specialty ILIKE ${'%' + type + '%'} AND is_active = true
      ORDER BY name ASC
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

export { router as finalModShopRoutes };