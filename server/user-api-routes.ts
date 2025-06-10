import { Router } from 'express';
import { db } from './db';
import { 
  submissions, 
  userSessions,
  auctionListings 
} from '@shared/schema';
import { desc, eq, gte, count } from 'drizzle-orm';

const router = Router();

// Get user's saved vehicles (mock data for now, to be extended with actual saved vehicles table)
router.get('/saved-vehicles', async (req, res) => {
  try {
    // For now, return empty array - this would be extended with actual saved vehicles functionality
    res.json({
      success: true,
      source: 'postgres',
      data: []
    });
  } catch (error) {
    console.error('Error fetching saved vehicles:', error);
    res.status(500).json({
      success: false,
      source: 'postgres',
      error: 'Failed to fetch saved vehicles'
    });
  }
});

// Get user's cost estimates based on session/UUID
router.get('/cost-estimates', async (req, res) => {
  try {
    const sessionId = req.session?.id;
    const userAgent = req.get('User-Agent') || '';
    
    // Get recent submissions for this session or similar user agent
    const estimates = await db
      .select({
        id: submissions.id,
        vehicleMake: submissions.vehicleMake,
        vehicleModel: submissions.vehicleModel,
        vehiclePrice: submissions.vehiclePrice,
        totalCost: submissions.totalCost,
        shippingOrigin: submissions.shippingOrigin,
        createdAt: submissions.createdAt
      })
      .from(submissions)
      .where(gte(submissions.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))) // Last 30 days
      .orderBy(desc(submissions.createdAt))
      .limit(10);

    res.json({
      success: true,
      source: 'postgres',
      data: estimates.map(est => ({
        id: est.id,
        vehicleMake: est.vehicleMake,
        vehicleModel: est.vehicleModel,
        vehiclePrice: est.vehiclePrice,
        totalCost: est.totalCost,
        shippingOrigin: est.shippingOrigin || 'Japan',
        createdAt: est.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error fetching cost estimates:', error);
    res.status(500).json({
      success: false,
      source: 'postgres',
      error: 'Failed to fetch cost estimates'
    });
  }
});

// Get user's import journeys (placeholder for future journey tracking)
router.get('/journeys', async (req, res) => {
  try {
    // Placeholder for future journey tracking functionality
    res.json({
      success: true,
      source: 'postgres',
      data: []
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    res.status(500).json({
      success: false,
      source: 'postgres',
      error: 'Failed to fetch journeys'
    });
  }
});

// Get dashboard overview data
router.get('/dashboard-overview', async (req, res) => {
  try {
    const sessionId = req.session?.id;
    
    // Get total estimates count
    const [totalEstimatesResult] = await db
      .select({ count: count() })
      .from(submissions)
      .where(gte(submissions.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))); // Last 90 days

    // Get recent activity count (last 7 days)
    const [recentActivityResult] = await db
      .select({ count: count() })
      .from(submissions)
      .where(gte(submissions.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

    // Calculate potential savings (placeholder calculation)
    const recentSubmissions = await db
      .select({
        vehiclePrice: submissions.vehiclePrice,
        totalCost: submissions.totalCost
      })
      .from(submissions)
      .where(gte(submissions.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
      .limit(5);

    let totalSavings = 0;
    recentSubmissions.forEach(sub => {
      const vehiclePrice = parseFloat(sub.vehiclePrice);
      const totalCost = parseFloat(sub.totalCost);
      // Assume 15% savings compared to local market
      const estimatedLocalPrice = totalCost * 1.15;
      const savings = estimatedLocalPrice - totalCost;
      if (savings > 0) {
        totalSavings += savings;
      }
    });

    res.json({
      success: true,
      source: 'postgres',
      data: {
        totalEstimates: totalEstimatesResult?.count || 0,
        totalSavings: totalSavings.toString(),
        recentActivity: recentActivityResult?.count || 0,
        favoriteMarket: 'Japan' // Most common market
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      source: 'postgres',
      error: 'Failed to fetch dashboard overview'
    });
  }
});

export { router as userApiRoutes };