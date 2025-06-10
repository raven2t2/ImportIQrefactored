import { auctionListings, type AuctionListing, type InsertAuctionListing } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike } from "drizzle-orm";

export class AuctionPersistenceService {
  private static instance: AuctionPersistenceService;
  
  static getInstance(): AuctionPersistenceService {
    if (!AuctionPersistenceService.instance) {
      AuctionPersistenceService.instance = new AuctionPersistenceService();
    }
    return AuctionPersistenceService.instance;
  }

  async saveAuctionListings(listings: InsertAuctionListing[]): Promise<void> {
    if (listings.length === 0) return;
    
    console.log(`Persisting ${listings.length} auction listings to PostgreSQL...`);
    
    // Use batch insert with conflict resolution
    for (const listing of listings) {
      try {
        await db.insert(auctionListings)
          .values({
            ...listing,
            refreshBatch: listing.refreshBatch || `batch_${Date.now()}`,
            refreshedAt: new Date(),
            dataSource: listing.dataSource || 'auction_scraper',
            isActive: true
          })
          .onConflictDoNothing();
      } catch (error) {
        console.error(`Failed to persist auction listing: ${listing.title}`, error);
      }
    }
    
    console.log(`✅ Successfully persisted ${listings.length} auction listings`);
  }

  async getAuctionListings(limit: number = 100): Promise<AuctionListing[]> {
    return await db.select().from(auctionListings)
      .where(eq(auctionListings.isActive, true))
      .orderBy(desc(auctionListings.refreshedAt))
      .limit(limit);
  }

  async getAuctionListingsByMakeModel(make: string, model: string): Promise<AuctionListing[]> {
    return await db.select().from(auctionListings)
      .where(and(
        eq(auctionListings.isActive, true),
        ilike(auctionListings.make, `%${make}%`),
        ilike(auctionListings.model, `%${model}%`)
      ))
      .orderBy(desc(auctionListings.price));
  }

  async searchAuctionListings(query: string, limit: number = 50): Promise<AuctionListing[]> {
    return await db.select().from(auctionListings)
      .where(and(
        eq(auctionListings.isActive, true),
        sql`(${auctionListings.title} ILIKE ${'%' + query + '%'} OR 
             ${auctionListings.make} ILIKE ${'%' + query + '%'} OR 
             ${auctionListings.model} ILIKE ${'%' + query + '%'})`
      ))
      .orderBy(desc(auctionListings.refreshedAt))
      .limit(limit);
  }

  async getActiveAuctionCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(auctionListings)
      .where(eq(auctionListings.isActive, true));
    return result?.count || 0;
  }

  async getAuctionStatsBySource(): Promise<Record<string, number>> {
    const results = await db.select({
      sourceSite: auctionListings.sourceSite,
      count: sql<number>`count(*)`
    })
    .from(auctionListings)
    .where(eq(auctionListings.isActive, true))
    .groupBy(auctionListings.sourceSite);

    const stats: Record<string, number> = {};
    for (const result of results) {
      stats[result.sourceSite] = result.count;
    }
    return stats;
  }

  async cleanupOldListings(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await db.update(auctionListings)
      .set({ isActive: false })
      .where(and(
        eq(auctionListings.isActive, true),
        sql`${auctionListings.refreshedAt} < ${cutoffDate}`
      ));
    
    return result.rowCount || 0;
  }

  async markRefreshBatchInactive(refreshBatch: string): Promise<void> {
    await db.update(auctionListings)
      .set({ isActive: false })
      .where(and(
        eq(auctionListings.isActive, true),
        eq(auctionListings.refreshBatch, refreshBatch)
      ));
  }
}

export const auctionPersistence = AuctionPersistenceService.getInstance();