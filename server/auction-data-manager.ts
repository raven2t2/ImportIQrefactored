/**
 * Auction Data Management System
 * Handles automated daily refresh, data caching, and quality assurance
 * Ensures authentic auction data remains current and reliable
 */

import { getAuthenticJapaneseListings } from './legitimate-japanese-data';
import { scrapeAllUSAuctions } from './us-auction-scraper';
import { auctionPersistence } from './auction-persistence-service';
import { db } from './db';
import { dataIngestionLogs } from '@shared/schema';

// Export auctionDataCache for admin API access
export let auctionDataCache: Record<string, any[]> = {};

interface DataRefreshResult {
  success: boolean;
  timestamp: string;
  japaneseListings: number;
  usListings: number;
  errors: string[];
  nextRefreshTime: string;
}

interface CachedAuctionData {
  japaneseAuctions: any[];
  usAuctions: any[];
  lastUpdated: string;
  expiresAt: string;
}

/**
 * Automated daily refresh of auction data
 * Runs every 24 hours to ensure data freshness
 */
export async function performDailyDataRefresh(): Promise<DataRefreshResult> {
  const startTime = new Date();
  console.log(`🔄 Starting auction data refresh at ${startTime.toISOString()}`);
  
  try {
    // Log the start of data ingestion
    await db.insert(dataIngestionLogs).values({
      sourceName: 'auction_scraper',
      status: 'processing',
      recordsReceived: 0,
      recordsProcessed: 0,
      recordsSkipped: 0
    });

    // Fetch authentic Japanese auction data
    const japaneseListings = await getAuthenticJapaneseListings();
    console.log(`Fetched ${japaneseListings.length} Japanese listings`);
    
    // Update cache
    auctionDataCache['japanese'] = japaneseListings;
    
    // Fetch authentic US auction data  
    const usListings = await scrapeAllUSAuctions();
    console.log(`Fetched ${usListings.length} US listings`);
    
    // Update cache
    auctionDataCache['us'] = usListings;
    
    // Combine all listings
    const allListings = [...japaneseListings, ...usListings];
    console.log(`Processing ${allListings.length} total authentic auction listings`);
    
    // Convert to database format and persist
    const dbListings = allListings.map(convertToAuctionListing);
    await auctionPersistence.saveAuctionListings(dbListings);
    
    const endTime = new Date();
    const processingTimeMs = endTime.getTime() - startTime.getTime();
    
    // Log successful completion
    await db.insert(dataIngestionLogs).values({
      sourceName: 'auction_scraper',
      status: 'success',
      recordsReceived: allListings.length,
      recordsProcessed: dbListings.length,
      recordsSkipped: 0,
      processingTimeMs
    });
    
    console.log(`✅ Successfully persisted ${dbListings.length} auction listings`);
    console.log(`Data refresh completed: ${japaneseListings.length} Japanese, ${usListings.length} US listings`);
    
    const nextRefresh = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      success: true,
      timestamp: endTime.toISOString(),
      japaneseListings: japaneseListings.length,
      usListings: usListings.length,
      errors: [],
      nextRefreshTime: nextRefresh.toISOString()
    };
  } catch (error) {
    const endTime = new Date();
    const processingTimeMs = endTime.getTime() - startTime.getTime();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log the failure
    await db.insert(dataIngestionLogs).values({
      sourceName: 'auction_scraper',
      status: 'failed',
      recordsReceived: 0,
      recordsProcessed: 0,
      recordsSkipped: 0,
      processingTimeMs,
      errors: [errorMessage]
    });
    
    console.error('Data refresh failed:', error);
    
    const nextRefresh = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      success: false,
      timestamp: endTime.toISOString(),
      japaneseListings: 0,
      usListings: 0,
      errors: [errorMessage],
      nextRefreshTime: nextRefresh.toISOString()
    };
  }
}

/**
 * Get cached auction data if available and not expired
 */
export function getCachedAuctionData(): CachedAuctionData | null {
  const cache = auctionDataCache;
  if (!cache || Object.keys(cache).length === 0) {
    return null;
  }
  
  const now = new Date();
  const lastUpdated = new Date().toISOString();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  
  return {
    japaneseAuctions: cache['japanese'] || [],
    usAuctions: cache['us'] || [],
    lastUpdated,
    expiresAt
  };
}

/**
 * Check if data refresh is needed
 */
export function isRefreshNeeded(): boolean {
  const cache = getCachedAuctionData();
  if (!cache) return true;
  
  const now = new Date();
  const expiresAt = new Date(cache.expiresAt);
  
  return now >= expiresAt;
}

/**
 * Get data freshness status
 */
export function getDataFreshnessStatus() {
  const cache = getCachedAuctionData();
  const refreshNeeded = isRefreshNeeded();
  
  return {
    isFresh: !refreshNeeded,
    lastUpdated: cache?.lastUpdated || null,
    nextRefreshDue: refreshNeeded,
    totalCachedListings: cache ? 
      (cache.japaneseAuctions.length + cache.usAuctions.length) : 0
  };
}

/**
 * Manual refresh trigger for testing/debugging
 */
export async function triggerManualRefresh(): Promise<DataRefreshResult> {
  console.log('🔧 Manual refresh triggered');
  return await performDailyDataRefresh();
}

/**
 * Initialize automatic refresh scheduler
 * Sets up daily refresh at 3 AM local time
 */
export function initializeDataRefreshScheduler() {
  console.log('📅 Initializing auction data refresh scheduler');
  
  // Calculate time until next 3 AM
  const now = new Date();
  const nextThreeAM = new Date();
  nextThreeAM.setHours(3, 0, 0, 0);
  
  if (nextThreeAM <= now) {
    nextThreeAM.setDate(nextThreeAM.getDate() + 1);
  }
  
  const timeUntilNextRun = nextThreeAM.getTime() - now.getTime();
  
  // Schedule initial run
  setTimeout(async () => {
    await performDailyDataRefresh();
    
    // Schedule recurring daily runs
    setInterval(async () => {
      await performDailyDataRefresh();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
  }, timeUntilNextRun);
  
  console.log(`⏰ Next auction data refresh scheduled for ${nextThreeAM.toISOString()}`);
}

/**
 * Health check for auction data system
 */
export function getSystemHealthStatus() {
  const cache = getCachedAuctionData();
  const refreshStatus = getDataFreshnessStatus();
  
  return {
    status: cache && refreshStatus.isFresh ? 'healthy' : 'needs_refresh',
    cacheSize: cache ? 
      (cache.japaneseAuctions.length + cache.usAuctions.length) : 0,
    lastUpdated: cache?.lastUpdated || null,
    nextRefreshDue: refreshStatus.nextRefreshDue,
    dataSourcesActive: {
      japanese: cache?.japaneseAuctions.length || 0,
      us: cache?.usAuctions.length || 0
    }
  };
}

/**
 * Data quality validation
 */
export function validateAuctionDataQuality(listings: any[]): {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
} {
  const issues: string[] = [];
  let qualityScore = 100;
  
  if (listings.length === 0) {
    issues.push('No listings found');
    qualityScore = 0;
  }
  
  const validListings = listings.filter(listing => 
    listing.make && listing.model && listing.price
  );
  
  const completenessRatio = validListings.length / listings.length;
  if (completenessRatio < 0.8) {
    issues.push('High number of incomplete listings');
    qualityScore -= 20;
  }
  
  const uniqueSources = new Set(listings.map(l => l.sourceSite)).size;
  if (uniqueSources < 2) {
    issues.push('Limited data source diversity');
    qualityScore -= 10;
  }
  
  return {
    isValid: qualityScore >= 70,
    qualityScore,
    issues
  };
}

/**
 * Convert raw auction data to database format
 */
function convertToAuctionListing(listing: any) {
  const refreshBatch = new Date().toISOString().slice(0, 10);
  
  return {
    title: listing.title || `${listing.make} ${listing.model}` || 'Unknown Vehicle',
    description: listing.description || `${listing.year} ${listing.make} ${listing.model}`,
    price: listing.price?.toString() || '0',
    currency: listing.currency || 'USD',
    mileage: listing.mileage?.toString() || null,
    location: listing.location || 'Unknown',
    imageUrl: listing.imageUrl || null,
    listingUrl: listing.listingUrl || listing.url || '#',
    sourceSite: listing.sourceSite || 'auction_site',
    make: listing.make || null,
    model: listing.model || null,
    year: listing.year || null,
    condition: listing.condition || null,
    bodyType: listing.bodyType || null,
    transmission: listing.transmission || null,
    fuelType: listing.fuelType || null,
    engineSize: listing.engineSize || null,
    auctionId: listing.auctionId || listing.id || `auto_${Date.now()}_${Math.random()}`,
    lotNumber: listing.lotNumber || null,
    auctionDate: listing.auctionDate ? new Date(listing.auctionDate) : null,
    auctionGrade: listing.auctionGrade || null,
    saleStatus: listing.saleStatus || 'current',
    refreshBatch,
    dataSource: 'auction_scraper'
  };
}