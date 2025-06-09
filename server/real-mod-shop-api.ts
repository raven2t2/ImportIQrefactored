import { Router } from 'express';
import { db } from './db';

const router = Router();

// Get mod shops by specialty with real database queries
router.get('/specialty/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    const { state, city, limit = '10' } = req.query;
    
    console.log(`🔍 PostgreSQL query: Searching for ${specialty} specialists with filters:`, { state, city });
    
    // Build WHERE conditions
    let whereConditions = ['is_active = true'];
    
    // Filter by specialty
    if (specialty.toLowerCase() === 'jdm') {
      whereConditions.push("(specialty ILIKE '%JDM%' OR name ILIKE '%JDM%')");
    } else if (specialty.toLowerCase() === 'european') {
      whereConditions.push("(specialty ILIKE '%European%' OR name ILIKE '%European%')");
    } else if (specialty.toLowerCase() === 'performance') {
      whereConditions.push("(specialty ILIKE '%Performance%' OR name ILIKE '%Performance%')");
    }

    // Add geographic filters
    if (state) {
      whereConditions.push(`location ILIKE '%${state}%'`);
    }
    
    if (city) {
      whereConditions.push(`location ILIKE '%${city}%'`);
    }

    const sqlQuery = `
      SELECT id, name, business_name, contact_person, description, website, location, specialty, is_active, created_at
      FROM mod_shop_partners 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY name 
      LIMIT ${parseInt(limit.toString())}
    `;

    console.log('Executing SQL:', sqlQuery);
    const result = await db.execute(sqlQuery);
    const shops = result.rows;
    
    console.log(`✅ PostgreSQL found ${shops.length} ${specialty} specialists`);
    
    res.json({
      success: true,
      shops: shops,
      total: shops.length,
      specialty: specialty,
      filters: { state, city }
    });
    
  } catch (error) {
    console.error('❌ PostgreSQL error fetching specialty shops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch specialty shops',
      shops: [],
      total: 0
    });
  }
});

// Search mod shops with geographic filtering
router.get('/search', async (req, res) => {
  try {
    const { state, city, specialty, limit = '10' } = req.query;
    
    console.log('🔍 PostgreSQL search with filters:', { state, city, specialty });
    
    let whereConditions = ['is_active = true'];
    
    if (state) {
      whereConditions.push(`location ILIKE '%${state}%'`);
    }
    
    if (city) {
      whereConditions.push(`location ILIKE '%${city}%'`);
    }
    
    if (specialty) {
      if (specialty.toString().toLowerCase() === 'jdm') {
        whereConditions.push("(specialty ILIKE '%JDM%' OR name ILIKE '%JDM%')");
      } else if (specialty.toString().toLowerCase() === 'european') {
        whereConditions.push("(specialty ILIKE '%European%' OR name ILIKE '%European%')");
      }
    }

    const sqlQuery = `
      SELECT id, name, business_name, contact_person, description, website, location, specialty, is_active, created_at
      FROM mod_shop_partners 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY name 
      LIMIT ${parseInt(limit.toString())}
    `;

    const result = await db.execute(sqlQuery);
    const shops = result.rows;
    
    console.log(`✅ PostgreSQL found ${shops.length} shops matching search criteria`);
    
    res.json({
      success: true,
      shops: shops,
      total: shops.length,
      searchParams: { state, city, specialty }
    });
    
  } catch (error) {
    console.error('❌ PostgreSQL error searching shops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search shops',
      shops: [],
      total: 0
    });
  }
});

// Get shop details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `SELECT * FROM mod_shop_partners WHERE id = ${parseInt(id)} AND is_active = true`;
    const shopResult = await db.execute(sqlQuery);
    
    if (!shopResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Shop not found'
      });
    }
    
    res.json({
      success: true,
      shop: shopResult.rows[0],
      reviews: []
    });
    
  } catch (error) {
    console.error('❌ PostgreSQL error fetching shop details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shop details'
    });
  }
});

// Get import services
router.get('/services/list', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM import_services ORDER BY service_name');
    
    res.json({
      success: true,
      services: result.rows
    });
    
  } catch (error) {
    console.error('❌ PostgreSQL error fetching import services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch import services',
      services: []
    });
  }
});

export default router;