/**
 * Live Auction Intelligence System
 * Uses real-world auction data to enhance import planning intelligence
 * NOT a marketplace - purely for cost estimation and timing guidance
 */

import { db } from "./db";
import { vehicleAuctions, vehicleAuctionChanges, datasetSources } from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

export interface AuctionIntelligence {
  make: string;
  model: string;
  year?: number;
  priceRange: {
    min: number;
    max: number;
    average: number;
    currency: string;
  };
  marketTrend: "rising" | "falling" | "stable";
  sampleSize: number;
  lastUpdated: string;
  timingRecommendation: string;
  confidenceLevel: "high" | "medium" | "low";
}

export interface MarketTiming {
  recommendation: string;
  reasoning: string;
  priceDirection: "rising" | "falling" | "stable";
  bestTimeToImport: string;
  riskLevel: "low" | "medium" | "high";
}

/**
 * Get auction intelligence for a specific vehicle
 */
export async function getAuctionIntelligence(
  make: string, 
  model: string, 
  year?: number
): Promise<AuctionIntelligence | null> {
  try {
    const conditions = [
      sql`LOWER(${vehicleAuctions.make}) = LOWER(${make})`,
      sql`LOWER(${vehicleAuctions.model}) LIKE LOWER(${'%' + model + '%'})`
    ];

    if (year) {
      conditions.push(eq(vehicleAuctions.year, year));
    }

    // Get recent auction data (last 90 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 90);

    const auctions = await db
      .select()
      .from(vehicleAuctions)
      .where(and(
        ...conditions,
        gte(vehicleAuctions.fetchedAt, recentDate)
      ))
      .orderBy(desc(vehicleAuctions.fetchedAt));

    if (auctions.length === 0) {
      return null;
    }

    const prices = auctions.map(a => a.price).filter(p => p !== null) as number[];
    if (prices.length === 0) {
      return null;
    }

    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Analyze trend
    const trend = await analyzePriceTrend(make, model, year);
    const timing = await generateTimingRecommendation(trend, avgPrice, auctions.length);

    return {
      make,
      model,
      year,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        average: Math.round(avgPrice),
        currency: "USD" // Most auction data is in USD
      },
      marketTrend: trend.priceDirection,
      sampleSize: auctions.length,
      lastUpdated: auctions[0]?.fetchedAt?.toISOString() || new Date().toISOString(),
      timingRecommendation: timing.recommendation,
      confidenceLevel: auctions.length >= 5 ? "high" : auctions.length >= 2 ? "medium" : "low"
    };

  } catch (error) {
    console.error("Error getting auction intelligence:", error);
    return null;
  }
}

/**
 * Analyze price trends over time
 */
async function analyzePriceTrend(
  make: string, 
  model: string, 
  year?: number
): Promise<MarketTiming> {
  try {
    const conditions = [
      sql`LOWER(${vehicleAuctions.make}) = LOWER(${make})`,
      sql`LOWER(${vehicleAuctions.model}) LIKE LOWER(${'%' + model + '%'})`
    ];

    if (year) {
      conditions.push(eq(vehicleAuctions.year, year));
    }

    // Get data from last 6 months, grouped by month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await db
      .select({
        month: sql`DATE_TRUNC('month', ${vehicleAuctions.fetchedAt})`,
        avgPrice: sql`AVG(${vehicleAuctions.price})`,
        count: sql`COUNT(*)`
      })
      .from(vehicleAuctions)
      .where(and(
        ...conditions,
        gte(vehicleAuctions.fetchedAt, sixMonthsAgo)
      ))
      .groupBy(sql`DATE_TRUNC('month', ${vehicleAuctions.fetchedAt})`)
      .orderBy(asc(sql`DATE_TRUNC('month', ${vehicleAuctions.fetchedAt})`));

    if (monthlyData.length < 2) {
      return {
        recommendation: "Monitor market - insufficient historical data",
        reasoning: "Need more auction data to determine trend",
        priceDirection: "stable",
        bestTimeToImport: "Current market conditions appear stable",
        riskLevel: "medium"
      };
    }

    // Calculate trend
    const recentAvg = Number(monthlyData[monthlyData.length - 1]?.avgPrice || 0);
    const olderAvg = Number(monthlyData[0]?.avgPrice || 0);
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

    let priceDirection: "rising" | "falling" | "stable";
    let recommendation: string;
    let reasoning: string;
    let bestTimeToImport: string;
    let riskLevel: "low" | "medium" | "high";

    if (changePercent > 10) {
      priceDirection = "rising";
      recommendation = "Consider importing soon - prices trending upward";
      reasoning = `Prices have increased ${changePercent.toFixed(1)}% over recent months`;
      bestTimeToImport = "Within the next 2-3 months before further increases";
      riskLevel = "medium";
    } else if (changePercent < -10) {
      priceDirection = "falling";
      recommendation = "Wait 2-3 months for potentially better pricing";
      reasoning = `Prices have decreased ${Math.abs(changePercent).toFixed(1)}% recently`;
      bestTimeToImport = "Monitor for further price decreases";
      riskLevel = "low";
    } else {
      priceDirection = "stable";
      recommendation = "Good time to import - stable market conditions";
      reasoning = "Prices have remained relatively stable";
      bestTimeToImport = "Current market timing is favorable";
      riskLevel = "low";
    }

    return {
      recommendation,
      reasoning,
      priceDirection,
      bestTimeToImport,
      riskLevel
    };

  } catch (error) {
    console.error("Error analyzing price trend:", error);
    return {
      recommendation: "Market analysis unavailable",
      reasoning: "Unable to analyze current trends",
      priceDirection: "stable",
      bestTimeToImport: "Standard import timing recommended",
      riskLevel: "medium"
    };
  }
}

/**
 * Generate timing recommendation based on trend analysis
 */
async function generateTimingRecommendation(
  trend: MarketTiming, 
  avgPrice: number, 
  sampleSize: number
): Promise<MarketTiming> {
  // Enhance recommendation based on sample size and price level
  if (sampleSize < 2) {
    return {
      ...trend,
      recommendation: "Limited market data - proceed with standard import timeline",
      riskLevel: "medium"
    };
  }

  if (avgPrice > 50000) {
    return {
      ...trend,
      recommendation: trend.recommendation + " (High-value vehicle - consider market timing carefully)",
      riskLevel: trend.riskLevel === "low" ? "medium" : "high"
    };
  }

  return trend;
}

/**
 * Get market summary for popular vehicle categories
 */
export async function getMarketSummary(): Promise<{
  totalAuctions: number;
  categories: Array<{
    category: string;
    avgPrice: number;
    count: number;
    trend: string;
  }>;
  lastUpdated: string;
}> {
  try {
    const totalAuctions = await db
      .select({ count: sql`COUNT(*)` })
      .from(vehicleAuctions);

    const categories = await db
      .select({
        category: vehicleAuctions.category,
        avgPrice: sql`AVG(${vehicleAuctions.price})`,
        count: sql`COUNT(*)`,
      })
      .from(vehicleAuctions)
      .where(sql`${vehicleAuctions.price} IS NOT NULL`)
      .groupBy(vehicleAuctions.category)
      .orderBy(desc(sql`AVG(${vehicleAuctions.price})`));

    const lastFetch = await db
      .select({ lastUpdated: vehicleAuctions.fetchedAt })
      .from(vehicleAuctions)
      .orderBy(desc(vehicleAuctions.fetchedAt))
      .limit(1);

    return {
      totalAuctions: Number(totalAuctions[0]?.count || 0),
      categories: categories.map(cat => ({
        category: cat.category || "Unknown",
        avgPrice: Math.round(Number(cat.avgPrice || 0)),
        count: Number(cat.count || 0),
        trend: "stable" // Could be enhanced with historical comparison
      })),
      lastUpdated: lastFetch[0]?.lastUpdated?.toISOString() || new Date().toISOString()
    };

  } catch (error) {
    console.error("Error getting market summary:", error);
    return {
      totalAuctions: 0,
      categories: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Search auction history for similar vehicles
 */
export async function searchAuctionHistory(searchTerm: string): Promise<Array<{
  make: string;
  model: string;
  year: number | null;
  price: number | null;
  source: string;
  location: string | null;
  fetchedAt: Date | null;
}>> {
  try {
    const results = await db
      .select({
        make: vehicleAuctions.make,
        model: vehicleAuctions.model,
        year: vehicleAuctions.year,
        price: vehicleAuctions.price,
        source: vehicleAuctions.source,
        location: vehicleAuctions.location,
        fetchedAt: vehicleAuctions.fetchedAt
      })
      .from(vehicleAuctions)
      .where(
        sql`(LOWER(${vehicleAuctions.make}) LIKE LOWER(${'%' + searchTerm + '%'}) 
             OR LOWER(${vehicleAuctions.model}) LIKE LOWER(${'%' + searchTerm + '%'}))`
      )
      .orderBy(desc(vehicleAuctions.fetchedAt))
      .limit(20);

    return results;

  } catch (error) {
    console.error("Error searching auction history:", error);
    return [];
  }
}