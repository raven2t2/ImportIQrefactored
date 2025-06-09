import { Router } from 'express';
import { db } from './db';
import { modShopPartners, serviceAreas, shopReviews, importServices } from '@shared/schema';
import { eq, and, or, ilike, sql } from 'drizzle-orm';

const router = Router();

// Get mod shops by specialty with real database queries
router.get('/specialty/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    const { state, city, postalCode, limit = '10' } = req.query;
    
    console.log(`🔍 Searching for ${specialty} specialists with filters:`, { state, city, postalCode });
    
    let query = db
      .select({
        id: modShopPartners.id,
        name: modShopPartners.businessName,
        business_name: modShopPartners.businessName,
        contact_person: modShopPartners.contactPerson,
        description: sql`CASE 
          WHEN ${modShopPartners.specialties}::jsonb ? 'jdm_vehicles' THEN 'Premier JDM import specialists with extensive experience in vehicle compliance and modification.'
          WHEN ${modShopPartners.specialties}::jsonb ? 'european_cars' THEN 'Specialized European import services with factory-trained technicians.'
          ELSE 'Professional import and compliance services for all vehicle types.'
        END`,
        website: modShopPartners.website,
        location: sql`${modShopPartners.city} || ', ' || ${modShopPartners.stateProvince}`,
        specialty: sql`CASE 
          WHEN ${modShopPartners.specialties}::jsonb ? 'jdm_vehicles' THEN 'JDM Imports'
          WHEN ${modShopPartners.specialties}::jsonb ? 'european_cars' THEN 'European Imports'
          ELSE 'Performance Imports'
        END`,
        is_active: sql`true`,
        created_at: modShopPartners.createdAt
      })
      .from(modShopPartners);

    // Filter by specialty using the actual database column
    if (specialty.toLowerCase() === 'jdm') {
      query = query.where(ilike(modShopPartners.specialty, '%JDM%'));
    } else if (specialty.toLowerCase() === 'european') {
      query = query.where(ilike(modShopPartners.specialty, '%European%'));
    } else if (specialty.toLowerCase() === 'performance') {
      query = query.where(ilike(modShopPartners.specialty, '%Performance%'));
    }

    // Add geographic filters using location field
    if (state) {
      query = query.where(ilike(modShopPartners.location, `%${state}%`));
    }
    
    if (city) {
      query = query.where(ilike(modShopPartners.location, `%${city}%`));
    }

    // Apply limit
    query = query.limit(parseInt(limit.toString()));

    const shops = await query;
    
    console.log(`✅ Found ${shops.length} ${specialty} specialists`);
    
    res.json({
      success: true,
      shops: shops,
      total: shops.length,
      specialty: specialty,
      filters: { state, city, postalCode }
    });
    
  } catch (error) {
    console.error('❌ Error fetching specialty shops:', error);
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
    const { state, city, postalCode, specialty, limit = '10' } = req.query;
    
    console.log('🔍 Searching mod shops with filters:', { state, city, postalCode, specialty });
    
    let query = db
      .select({
        id: modShopPartners.id,
        name: modShopPartners.businessName,
        business_name: modShopPartners.businessName,
        contact_person: modShopPartners.contactPerson,
        description: sql`CASE 
          WHEN ${modShopPartners.specialties}::jsonb ? 'jdm_vehicles' THEN 'Premier JDM import specialists with extensive experience in vehicle compliance and modification.'
          WHEN ${modShopPartners.specialties}::jsonb ? 'european_cars' THEN 'Specialized European import services with factory-trained technicians.'
          ELSE 'Professional import and compliance services for all vehicle types.'
        END`,
        website: modShopPartners.website,
        location: sql`${modShopPartners.city} || ', ' || ${modShopPartners.stateProvince}`,
        specialty: sql`CASE 
          WHEN ${modShopPartners.specialties}::jsonb ? 'jdm_vehicles' THEN 'JDM Imports'
          WHEN ${modShopPartners.specialties}::jsonb ? 'european_cars' THEN 'European Imports'
          ELSE 'Performance Imports'
        END`,
        is_active: sql`true`,
        created_at: modShopPartners.createdAt
      })
      .from(modShopPartners);

    // Add filters
    const conditions = [];
    
    if (state) {
      conditions.push(eq(modShopPartners.stateProvince, state.toString().toUpperCase()));
    }
    
    if (city) {
      conditions.push(ilike(modShopPartners.city, `%${city}%`));
    }
    
    if (postalCode) {
      conditions.push(eq(modShopPartners.postalCode, postalCode.toString()));
    }
    
    if (specialty) {
      if (specialty.toString().toLowerCase() === 'jdm') {
        conditions.push(sql`${modShopPartners.specialties}::jsonb ? 'jdm_vehicles'`);
      } else if (specialty.toString().toLowerCase() === 'european') {
        conditions.push(sql`${modShopPartners.specialties}::jsonb ? 'european_cars'`);
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply limit
    query = query.limit(parseInt(limit.toString()));

    const shops = await query;
    
    console.log(`✅ Found ${shops.length} shops matching search criteria`);
    
    res.json({
      success: true,
      shops: shops,
      total: shops.length,
      searchParams: { state, city, postalCode, specialty }
    });
    
  } catch (error) {
    console.error('❌ Error searching shops:', error);
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
    
    const shop = await db
      .select()
      .from(modShopPartners)
      .where(eq(modShopPartners.id, parseInt(id)))
      .limit(1);
    
    if (!shop.length) {
      return res.status(404).json({
        success: false,
        error: 'Shop not found'
      });
    }
    
    // Get reviews for this shop
    const reviews = await db
      .select()
      .from(shopReviews)
      .where(eq(shopReviews.shopId, parseInt(id)))
      .limit(5);
    
    res.json({
      success: true,
      shop: shop[0],
      reviews: reviews
    });
    
  } catch (error) {
    console.error('❌ Error fetching shop details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shop details'
    });
  }
});

// Get import services
router.get('/services/list', async (req, res) => {
  try {
    const services = await db.select().from(importServices);
    
    res.json({
      success: true,
      services: services
    });
    
  } catch (error) {
    console.error('❌ Error fetching import services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch import services',
      services: []
    });
  }
});

export default router;