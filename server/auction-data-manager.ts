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

// PostgreSQL-based auction data persistence
// Cache replaced with database storage for reliability and persistence

// Popular makes to refresh data for (optimized for performance)
const POPULAR_MAKES = [
  'Toyota', 'Nissan', 'Honda' // Focus on top 3 Japanese makes for core functionality
];

/**
 * Automated daily refresh of auction data
 * Runs every 24 hours to ensure data freshness
 */
export async function performDailyDataRefresh(): Promise<DataRefreshResult> {
  console.log('Starting automated auction data refresh...');
  
  const startTime = new Date();
  const errors: string[] = [];
  let japaneseListings = 0;
  let usListings = 0;

  try {
    // Refresh Japanese auction data for popular makes
    const japaneseResults = [];
    for (const make of POPULAR_MAKES.slice(0, 6)) { // Limit to avoid rate limiting
      try {
        const result = await getAuthenticJapaneseListings(make);
        const listings = result.success ? result.listings : [];
        japaneseResults.push(...listings);
        japaneseListings += listings.length;
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        errors.push(`Japanese auction error for ${make}: ${error}`);
      }
    }

    // Refresh US auction data for popular makes
    const usResults = [];
    for (const make of POPULAR_MAKES.slice(0, 6)) { // Limit to avoid rate limiting
      try {
        const listings = await scrapeAllUSAuctions(make);
        usResults.push(...listings);
        usListings += listings.length;
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        errors.push(`US auction error for ${make}: ${error}`);
      }
    }

    // Update cache with fresh data
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Persist auction data to PostgreSQL
    const allListings = [...japaneseResults, ...usResults];
    const refreshBatch = `batch_${Date.now()}`;
    
    // Format listings for database insertion
    const formattedListings = allListings.map(listing => ({
      title: listing.title || 'Unknown Vehicle',
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
    }));
    
    // Save to PostgreSQL
    await auctionPersistence.saveAuctionListings(formattedListings);

    const nextRefresh = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    console.log(`Data refresh completed: ${japaneseListings} Japanese, ${usListings} US listings`);
    
    return {
      success: true,
      timestamp: now.toISOString(),
      japaneseListings,
      usListings,
      errors,
      nextRefreshTime: nextRefresh.toISOString()
    };

  } catch (error) {
    errors.push(`Critical refresh error: ${error}`);
    
    return {
      success: false,
      timestamp: startTime.toISOString(),
      japaneseListings,
      usListings,
      errors,
      nextRefreshTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // Retry in 1 hour
    };
  }
}

/**
 * Get cached auction data if available and not expired
 */
export function getCachedAuctionData(): CachedAuctionData | null {
  if (!auctionDataCache) return null;
  
  const now = new Date();
  const expiresAt = new Date(auctionDataCache.expiresAt);
  
  if (now > expiresAt) {
    console.log('Cached auction data expired, triggering refresh...');
    // Trigger background refresh
    performDailyDataRefresh().catch(console.error);
    return null;
  }
  
  return auctionDataCache;
}

/**
 * Check if data refresh is needed
 */
export function isRefreshNeeded(): boolean {
  if (!auctionDataCache) return true;
  
  const now = new Date();
  const expiresAt = new Date(auctionDataCache.expiresAt);
  
  return now > expiresAt;
}

/**
 * Get data freshness status
 */
export function getDataFreshnessStatus() {
  if (!auctionDataCache) {
    return {
      status: 'no-data',
      lastUpdated: null,
      nextRefresh: 'pending',
      cacheSize: 0
    };
  }
  
  const now = new Date();
  const lastUpdated = new Date(auctionDataCache.lastUpdated);
  const expiresAt = new Date(auctionDataCache.expiresAt);
  const hoursOld = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60));
  
  return {
    status: now > expiresAt ? 'expired' : 'fresh',
    lastUpdated: auctionDataCache.lastUpdated,
    hoursOld,
    nextRefresh: expiresAt.toISOString(),
    cacheSize: auctionDataCache.japaneseAuctions.length + auctionDataCache.usAuctions.length
  };
}

/**
 * Manual refresh trigger for testing/debugging
 */
export async function triggerManualRefresh(): Promise<DataRefreshResult> {
  console.log('Manual data refresh triggered...');
  return await performDailyDataRefresh();
}

/**
 * Initialize automatic refresh scheduler
 * Sets up daily refresh at 3 AM local time
 */
export function initializeDataRefreshScheduler() {
  console.log('Initializing auction data refresh scheduler...');
  
  // Calculate time until next 3 AM
  const now = new Date();
  const next3AM = new Date();
  next3AM.setHours(3, 0, 0, 0);
  
  // If 3 AM has passed today, schedule for tomorrow
  if (next3AM <= now) {
    next3AM.setDate(next3AM.getDate() + 1);
  }
  
  const msUntil3AM = next3AM.getTime() - now.getTime();
  
  console.log(`Next data refresh scheduled for: ${next3AM.toISOString()}`);
  
  // Initial refresh to populate database
  console.log('Performing initial auction data refresh...');
  performDailyDataRefresh().catch(console.error);
  
  // Schedule first refresh at 3 AM
  setTimeout(() => {
    performDailyDataRefresh().then(() => {
      // Set up daily interval after first refresh
      setInterval(() => {
        performDailyDataRefresh().catch(console.error);
      }, 24 * 60 * 60 * 1000); // 24 hours
    }).catch(console.error);
  }, msUntil3AM);
}

/**
 * Health check for auction data system
 */
export function getSystemHealthStatus() {
  const freshnessStatus = getDataFreshnessStatus();
  const memoryUsage = process.memoryUsage();
  
  return {
    dataFreshness: freshnessStatus,
    memoryUsage: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
    },
    uptime: Math.floor(process.uptime() / 60) + ' minutes',
    timestamp: new Date().toISOString()
  };
}

/**
 * Data quality validation
 */
export function validateAuctionDataQuality(listings: any[]): {
  isValid: boolean;
  issues: string[];
  score: number;
} {
  const issues: string[] = [];
  let score = 100;

  // Check for required fields
  const requiredFields = ['id', 'make', 'model', 'year', 'price', 'location', 'source'];
  const invalidListings = listings.filter(listing => 
    requiredFields.some(field => !listing[field])
  );
  
  if (invalidListings.length > 0) {
    issues.push(`${invalidListings.length} listings missing required fields`);
    score -= Math.min(50, invalidListings.length * 5);
  }

  // Check for realistic prices
  const unrealisticPrices = listings.filter(listing => 
    listing.price < 1000 || listing.price > 1000000
  );
  
  if (unrealisticPrices.length > 0) {
    issues.push(`${unrealisticPrices.length} listings with unrealistic prices`);
    score -= Math.min(30, unrealisticPrices.length * 3);
  }

  // Check for duplicate IDs
  const ids = listings.map(l => l.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    issues.push(`${duplicateIds.length} duplicate listing IDs found`);
    score -= duplicateIds.length * 5;
  }

  return {
    isValid: issues.length === 0,
    issues,
    score: Math.max(0, score)
  };
}