/**
 * Auction Persistence Service
 * Handles saving and retrieving auction data from PostgreSQL
 */

import { db } from './db';
import { auctionListings } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface AuctionListingData {
  title: string;
  description: string;
  price: string;
  currency: string;
  mileage?: string | null;
  location: string;
  imageUrl?: string | null;
  listingUrl: string;
  sourceSite: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  condition?: string | null;
  bodyType?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  engineSize?: string | null;
  auctionId: string;
  lotNumber?: string | null;
  auctionDate?: Date | null;
  auctionGrade?: string | null;
  saleStatus: string;
  refreshBatch: string;
  dataSource: string;
}

class AuctionPersistenceService {
  /**
   * Save multiple auction listings to database
   */
  async saveAuctionListings(listings: AuctionListingData[]): Promise<void> {
    if (listings.length === 0) {
      console.log('No auction listings to save');
      return;
    }

    try {
      // Insert listings in batches to avoid overwhelming the database
      const batchSize = 50;
      let totalSaved = 0;

      for (let i = 0; i < listings.length; i += batchSize) {
        const batch = listings.slice(i, i + batchSize);
        
        await db.insert(auctionListings).values(batch).onConflictDoUpdate({
          target: auctionListings.auctionId,
          set: {
            title: sql`excluded.title`,
            description: sql`excluded.description`,
            price: sql`excluded.price`,
            currency: sql`excluded.currency`,
            mileage: sql`excluded.mileage`,
            location: sql`excluded.location`,
            imageUrl: sql`excluded.image_url`,
            listingUrl: sql`excluded.listing_url`,
            sourceSite: sql`excluded.source_site`,
            make: sql`excluded.make`,
            model: sql`excluded.model`,
            year: sql`excluded.year`,
            condition: sql`excluded.condition`,
            bodyType: sql`excluded.body_type`,
            transmission: sql`excluded.transmission`,
            fuelType: sql`excluded.fuel_type`,
            engineSize: sql`excluded.engine_size`,
            lotNumber: sql`excluded.lot_number`,
            auctionDate: sql`excluded.auction_date`,
            auctionGrade: sql`excluded.auction_grade`,
            saleStatus: sql`excluded.sale_status`,
            refreshBatch: sql`excluded.refresh_batch`,
            dataSource: sql`excluded.data_source`,
            lastUpdated: sql`NOW()`
          }
        });

        totalSaved += batch.length;
        console.log(`Saved batch ${Math.ceil(i / batchSize) + 1}: ${batch.length} listings (${totalSaved}/${listings.length} total)`);
      }

      console.log(`✅ Successfully saved ${totalSaved} auction listings to database`);
    } catch (error) {
      console.error('Error saving auction listings:', error);
      throw error;
    }
  }

  /**
   * Get auction listings with filters
   */
  async getAuctionListings(filters: {
    make?: string;
    model?: string;
    sourceSite?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    try {
      let query = db.select().from(auctionListings);

      // Apply filters
      const conditions = [];
      
      if (filters.make) {
        conditions.push(sql`LOWER(${auctionListings.make}) LIKE ${`%${filters.make.toLowerCase()}%`}`);
      }
      
      if (filters.model) {
        conditions.push(sql`LOWER(${auctionListings.model}) LIKE ${`%${filters.model.toLowerCase()}%`}`);
      }
      
      if (filters.sourceSite) {
        conditions.push(eq(auctionListings.sourceSite, filters.sourceSite));
      }
      
      if (filters.minPrice) {
        conditions.push(sql`CAST(${auctionListings.price} AS NUMERIC) >= ${filters.minPrice}`);
      }
      
      if (filters.maxPrice) {
        conditions.push(sql`CAST(${auctionListings.price} AS NUMERIC) <= ${filters.maxPrice}`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply ordering, limit, and offset
      query = query.orderBy(desc(auctionListings.lastUpdated));
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.offset(filters.offset);
      }

      const results = await query;
      return results;
    } catch (error) {
      console.error('Error fetching auction listings:', error);
      throw error;
    }
  }

  /**
   * Get auction listing by ID
   */
  async getAuctionListingById(id: number): Promise<any | null> {
    try {
      const [result] = await db
        .select()
        .from(auctionListings)
        .where(eq(auctionListings.id, id));
      
      return result || null;
    } catch (error) {
      console.error('Error fetching auction listing by ID:', error);
      throw error;
    }
  }

  /**
   * Get auction listing by auction ID
   */
  async getAuctionListingByAuctionId(auctionId: string): Promise<any | null> {
    try {
      const [result] = await db
        .select()
        .from(auctionListings)
        .where(eq(auctionListings.auctionId, auctionId));
      
      return result || null;
    } catch (error) {
      console.error('Error fetching auction listing by auction ID:', error);
      throw error;
    }
  }

  /**
   * Get auction statistics
   */
  async getAuctionStats(): Promise<{
    totalListings: number;
    uniqueMakes: number;
    uniqueSourceSites: number;
    averagePrice: number;
    lastUpdated: string | null;
  }> {
    try {
      const [stats] = await db
        .select({
          totalListings: sql<number>`COUNT(*)`,
          uniqueMakes: sql<number>`COUNT(DISTINCT ${auctionListings.make})`,
          uniqueSourceSites: sql<number>`COUNT(DISTINCT ${auctionListings.sourceSite})`,
          averagePrice: sql<number>`AVG(CAST(${auctionListings.price} AS NUMERIC))`,
          lastUpdated: sql<string>`MAX(${auctionListings.lastUpdated})`
        })
        .from(auctionListings);

      return {
        totalListings: stats.totalListings || 0,
        uniqueMakes: stats.uniqueMakes || 0,
        uniqueSourceSites: stats.uniqueSourceSites || 0,
        averagePrice: stats.averagePrice || 0,
        lastUpdated: stats.lastUpdated || null
      };
    } catch (error) {
      console.error('Error fetching auction stats:', error);
      throw error;
    }
  }

  /**
   * Delete old auction listings (cleanup)
   */
  async cleanupOldListings(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await db
        .delete(auctionListings)
        .where(sql`${auctionListings.lastUpdated} < ${cutoffDate}`);

      const deletedCount = result.rowCount || 0;
      console.log(`Cleaned up ${deletedCount} old auction listings (older than ${daysOld} days)`);
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old listings:', error);
      throw error;
    }
  }

  /**
   * Get listings by refresh batch
   */
  async getListingsByBatch(refreshBatch: string): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(auctionListings)
        .where(eq(auctionListings.refreshBatch, refreshBatch))
        .orderBy(desc(auctionListings.lastUpdated));

      return results;
    } catch (error) {
      console.error('Error fetching listings by batch:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const auctionPersistence = new AuctionPersistenceService();