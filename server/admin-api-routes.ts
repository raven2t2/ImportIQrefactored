import { Router } from 'express';
import { db } from './db';
import { 
  auctionListings, 
  userSessions, 
  submissions, 
  dataIngestionLogs
} from '@shared/schema';
import { desc, count, gte, sql, eq } from 'drizzle-orm';
import { auctionDataCache } from './auction-data-manager';

const router = Router();

// Get in-memory cache status
router.get('/cache-status', async (req, res) => {
  try {
    const cacheData = auctionDataCache || {};
    const vehicles = Object.values(cacheData).flat();
    
    const recentVehicles = vehicles
      .sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 10)
      .map((vehicle: any) => ({
        make: vehicle.make || 'Unknown',
        model: vehicle.model || 'Unknown',
        year: vehicle.year || 0,
        price: vehicle.price || '0',
        sourceSite: vehicle.sourceSite || 'Unknown',
        timestamp: vehicle.timestamp || new Date().toISOString()
      }));

    const sources = [...new Set(vehicles.map((v: any) => v.sourceSite || 'Unknown'))];

    res.json({
      success: true,
      source: 'cache',
      data: {
        totalVehicles: vehicles.length,
        lastUpdated: new Date().toISOString(),
        sources,
        recentVehicles
      }
    });
  } catch (error) {
    console.error('Error fetching cache status:', error);
    res.status(500).json({
      success: false,
      source: 'cache',
      error: 'Failed to fetch cache status'
    });
  }
});

// Get active user sessions
router.get('/active-sessions', async (req, res) => {
  try {
    const sessions = await db
      .select({
        id: userSessions.id,
        userId: userSessions.userId,
        userAgent: userSessions.userAgent,
        ipAddress: userSessions.ipAddress,
        createdAt: userSessions.createdAt,
        lastActivity: userSessions.lastActivity
      })
      .from(userSessions)
      .where(gte(userSessions.lastActivity, new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .orderBy(desc(userSessions.lastActivity))
      .limit(50);

    res.json({
      success: true,
      source: 'postgres',
      data: {
        activeCount: sessions.length,
        sessions: sessions.map(session => ({
          id: session.id,
          userId: session.userId,
          userAgent: session.userAgent || 'Unknown',
          ipAddress: session.ipAddress || 'Unknown',
          createdAt: session.createdAt.toISOString(),
          lastActivity: session.lastActivity.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({
      success: false,
      source: 'postgres',
      error: 'Failed to fetch active sessions'
    });
  }
});

// Get recent submissions
router.get('/recent-submissions', async (req, res) => {
  try {
    const recentSubmissions = await db
      .select({
        id: submissions.id,
        email: submissions.email,
        vehicleMake: submissions.vehicleMake,
        vehicleModel: submissions.vehicleModel,
        vehiclePrice: submissions.vehiclePrice,
        totalCost: submissions.totalCost,
        createdAt: submissions.createdAt
      })
      .from(submissions)
      .where(gte(submissions.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .orderBy(desc(submissions.createdAt))
      .limit(20);

    res.json({
      success: true,
      source: 'postgres',
      data: {
        recentCount: recentSubmissions.length,
        submissions: recentSubmissions.map(sub => ({
          id: sub.id,
          email: sub.email || 'Unknown',
          vehicleMake: sub.vehicleMake,
          vehicleModel: sub.vehicleModel,
          vehiclePrice: sub.vehiclePrice,
          totalCost: sub.totalCost,
          createdAt: sub.createdAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    res.status(500).json({
      success: false,
      source: 'postgres',
      error: 'Failed to fetch recent submissions'
    });
  }
});

// Get database table counts
router.get('/database-counts', async (req, res) => {
  try {
    const [
      auctionListingsCount,
      submissionsCount,
      userSessionsCount
    ] = await Promise.all([
      db.select({ count: count() }).from(auctionListings),
      db.select({ count: count() }).from(submissions),
      db.select({ count: count() }).from(userSessions)
    ]);

    res.json({
      success: true,
      source: 'postgres',
      data: {
        auctionListings: auctionListingsCount[0]?.count || 0,
        importCostCalculations: submissionsCount[0]?.count || 0,
        userSessions: userSessionsCount[0]?.count || 0,
        totalSubmissions: submissionsCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching database counts:', error);
    res.status(500).json({
      success: false,
      source: 'postgres',
      error: 'Failed to fetch database counts'
    });
  }
});

// Get latest data ingestion logs
router.get('/refresh-log', async (req, res) => {
  try {
    const logs = await db
      .select({
        id: dataIngestionLogs.id,
        sourceName: dataIngestionLogs.sourceName,
        recordsReceived: dataIngestionLogs.recordsReceived,
        recordsProcessed: dataIngestionLogs.recordsProcessed,
        recordsSkipped: dataIngestionLogs.recordsSkipped,
        status: dataIngestionLogs.status,
        errors: dataIngestionLogs.errors,
        processingTimeMs: dataIngestionLogs.processingTimeMs,
        createdAt: dataIngestionLogs.createdAt
      })
      .from(dataIngestionLogs)
      .orderBy(desc(dataIngestionLogs.createdAt))
      .limit(10);

    const stats = {
      totalRuns: logs.length,
      successfulRuns: logs.filter(log => log.status === 'success').length,
      failedRuns: logs.filter(log => log.status === 'failed').length,
      totalRecordsProcessed: logs.reduce((sum, log) => sum + (log.recordsProcessed || 0), 0),
      totalRecordsReceived: logs.reduce((sum, log) => sum + (log.recordsReceived || 0), 0),
      lastRunTime: logs[0]?.createdAt?.toISOString() || null
    };

    res.json({
      success: true,
      source: 'postgres',
      data: {
        stats,
        recentLogs: logs.map(log => ({
          id: log.id,
          sourceName: log.sourceName,
          recordsReceived: log.recordsReceived,
          recordsProcessed: log.recordsProcessed,
          recordsSkipped: log.recordsSkipped,
          status: log.status,
          errors: log.errors,
          processingTimeMs: log.processingTimeMs,
          createdAt: log.createdAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching refresh logs:', error);
    res.status(500).json({
      success: false,
      source: 'postgres',
      error: 'Failed to fetch refresh logs'
    });
  }
});

export { router as adminApiRoutes };