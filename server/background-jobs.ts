import { CurrencyService } from "./currency-service";
import { db } from "./db";
import { exchangeRates, userSessions, vehicleLookupCache, importIntelligenceCache } from "@shared/schema";
import { lt } from "drizzle-orm";

export class BackgroundJobService {
  private static instance: BackgroundJobService;
  private intervals: NodeJS.Timeout[] = [];

  private constructor() {}

  static getInstance(): BackgroundJobService {
    if (!BackgroundJobService.instance) {
      BackgroundJobService.instance = new BackgroundJobService();
    }
    return BackgroundJobService.instance;
  }

  /**
   * Initialize all background jobs for production
   */
  async initialize() {
    console.log('🔄 Starting background job service...');

    // Update exchange rates every 6 hours
    this.scheduleJob(
      'exchange-rates',
      this.updateExchangeRates.bind(this),
      6 * 60 * 60 * 1000 // 6 hours
    );

    // Clean up expired sessions every hour
    this.scheduleJob(
      'session-cleanup',
      this.cleanupExpiredSessions.bind(this),
      60 * 60 * 1000 // 1 hour
    );

    // Clean up old cache entries every 24 hours
    this.scheduleJob(
      'cache-cleanup',
      this.cleanupOldCache.bind(this),
      24 * 60 * 60 * 1000 // 24 hours
    );

    // Reset free lookup counters at midnight UTC
    this.scheduleJob(
      'reset-lookups',
      this.resetFreeLookups.bind(this),
      this.getMillisecondsUntilMidnight(),
      true // recurring daily
    );

    console.log('✅ Background job service initialized');
  }

  /**
   * Schedule a recurring job
   */
  private scheduleJob(
    name: string, 
    job: () => Promise<void>, 
    interval: number, 
    dailyReset = false
  ) {
    const runJob = async () => {
      try {
        await job();
        console.log(`✅ Background job completed: ${name}`);
      } catch (error) {
        console.error(`❌ Background job failed: ${name}`, error);
      }
    };

    // Run immediately on startup
    runJob();

    // Schedule recurring execution
    const intervalId = setInterval(runJob, interval);
    this.intervals.push(intervalId);

    // For daily reset, schedule next execution at midnight
    if (dailyReset) {
      setTimeout(() => {
        const dailyInterval = setInterval(runJob, 24 * 60 * 60 * 1000);
        this.intervals.push(dailyInterval);
      }, this.getMillisecondsUntilMidnight());
    }
  }

  /**
   * Update exchange rates from official sources
   */
  private async updateExchangeRates() {
    const currencyService = new CurrencyService();
    const supportedCurrencies = [
      'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD',
      'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN',
      'TRY', 'ZAR', 'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN'
    ];

    for (const currency of supportedCurrencies) {
      try {
        const rate = await currencyService.getExchangeRate('USD', currency);
        
        await db.insert(exchangeRates).values({
          fromCurrency: 'USD',
          toCurrency: currency,
          rate: rate,
          source: 'official',
          lastUpdated: new Date()
        }).onConflictDoUpdate({
          target: [exchangeRates.fromCurrency, exchangeRates.toCurrency],
          set: {
            rate: rate,
            lastUpdated: new Date()
          }
        });
      } catch (error) {
        console.error(`Failed to update exchange rate for ${currency}:`, error);
      }
    }
  }

  /**
   * Clean up expired user sessions
   */
  private async cleanupExpiredSessions() {
    const now = new Date();
    
    await db.delete(userSessions)
      .where(lt(userSessions.expiresAt, now));
  }

  /**
   * Clean up old cache entries
   */
  private async cleanupOldCache() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    try {
      // Clean vehicle lookup cache older than 1 week
      const result1 = await db.delete(vehicleLookupCache)
        .where(lt(vehicleLookupCache.lastAccessed, oneWeekAgo));
      
      console.log(`Cleaned ${result1.rowCount || 0} vehicle lookup cache entries`);
    } catch (error) {
      console.log('Vehicle lookup cache cleanup skipped - table may not exist yet');
    }

    try {
      // Clean import intelligence cache older than 1 week
      const result2 = await db.delete(importIntelligenceCache)
        .where(lt(importIntelligenceCache.lastAccessed, oneWeekAgo));
      
      console.log(`Cleaned ${result2.rowCount || 0} import intelligence cache entries`);
    } catch (error) {
      console.log('Import intelligence cache cleanup skipped - table may not exist yet');
    }
  }

  /**
   * Reset free lookup counters for users
   */
  private async resetFreeLookups() {
    // This would typically reset daily lookup counters
    // Implementation depends on specific business logic
    console.log('🔄 Resetting daily lookup counters...');
  }

  /**
   * Calculate milliseconds until next midnight UTC
   */
  private getMillisecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }

  /**
   * Shutdown all background jobs
   */
  shutdown() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('🛑 Background job service stopped');
  }
}

export const backgroundJobService = BackgroundJobService.getInstance();