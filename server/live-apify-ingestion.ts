/**
 * Live Apify Auction Data Ingestion
 * Fetches real auction data from the three specified Apify datasets
 * Stores everything in PostgreSQL - no hardcoded data
 */

import { db } from "./db";
import { vehicleAuctions, datasetSources } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// The three Apify datasets specified in the requirements
const APIFY_DATASETS = [
  {
    id: "EFjwLXRVn4w9QKgPV",
    name: "US Muscle Classic",
    category: "US Muscle",
    url: "https://api.apify.com/v2/datasets/EFjwLXRVn4w9QKgPV/items?clean=true&format=json"
  },
  {
    id: "BOwRnzKkfbtVVzgfu", 
    name: "Classic Skyline",
    category: "Skyline",
    url: "https://api.apify.com/v2/datasets/BOwRnzKkfbtVVzgfu/items?clean=true&format=json"
  },
  {
    id: "ZNQXj1F51xyzo0kiK",
    name: "JDM Classics", 
    category: "JDM",
    url: "https://api.apify.com/v2/datasets/ZNQXj1F51xyzo0kiK/items?clean=true&format=json"
  }
];

interface ApifyRecord {
  id?: string;
  searchResult?: {
    title?: string;
    description?: string;
    url?: string;
    price?: string | number;
    location?: string;
    year?: string | number;
    make?: string;
    model?: string;
  };
  crawl?: {
    loadedAt?: string;
    uniqueKey?: string;
  };
  [key: string]: any;
}

export async function ingestLiveApifyData(): Promise<{
  success: boolean;
  totalIngested: number;
  byCategory: Record<string, number>;
  errors: string[];
}> {
  console.log("🔄 Starting live Apify auction data ingestion...");
  
  const results = {
    success: true,
    totalIngested: 0,
    byCategory: {} as Record<string, number>,
    errors: [] as string[]
  };

  // Initialize dataset sources in database
  await initializeDatasetSources();

  for (const dataset of APIFY_DATASETS) {
    try {
      console.log(`📡 Fetching ${dataset.name} data from Apify...`);
      
      const response = await fetch(dataset.url, {
        headers: {
          'User-Agent': 'ImportIQ-Intelligence/1.0'
        }
      });

      if (!response.ok) {
        const error = `Failed to fetch ${dataset.name}: ${response.status}`;
        results.errors.push(error);
        console.error(error);
        continue;
      }

      const data: ApifyRecord[] = await response.json();
      console.log(`📊 Retrieved ${data.length} records from ${dataset.name}`);

      const processed = await processApifyRecords(data, dataset);
      results.byCategory[dataset.category] = processed;
      results.totalIngested += processed;

      // Update dataset source timestamp
      await updateDatasetTimestamp(dataset.id);

    } catch (error) {
      const errorMsg = `Error processing ${dataset.name}: ${error}`;
      results.errors.push(errorMsg);
      console.error(errorMsg);
      results.success = false;
    }
  }

  console.log(`✅ Ingestion complete: ${results.totalIngested} total records`);
  return results;
}

async function initializeDatasetSources() {
  for (const dataset of APIFY_DATASETS) {
    try {
      await db
        .insert(datasetSources)
        .values({
          sourceId: dataset.id,
          sourceName: dataset.name,
          sourceUrl: dataset.url,
          category: dataset.category,
          active: true,
          lastFetchAt: new Date()
        })
        .onConflictDoUpdate({
          target: datasetSources.sourceId,
          set: {
            sourceName: dataset.name,
            sourceUrl: dataset.url,
            active: true
          }
        });
    } catch (error) {
      console.error(`Error initializing dataset source ${dataset.id}:`, error);
    }
  }
}

async function processApifyRecords(records: ApifyRecord[], dataset: any): Promise<number> {
  let processed = 0;

  for (const record of records) {
    try {
      const normalized = normalizeApifyRecord(record, dataset.category);
      if (!normalized) continue;

      // Check if record already exists
      const existing = await db
        .select()
        .from(vehicleAuctions)
        .where(eq(vehicleAuctions.apifyId, normalized.apifyId))
        .limit(1);

      if (existing.length === 0) {
        // Insert new record
        await db.insert(vehicleAuctions).values(normalized);
        processed++;
      } else {
        // Update existing record if price changed
        if (existing[0].price !== normalized.price) {
          await db
            .update(vehicleAuctions)
            .set({
              price: normalized.price,
              lastUpdated: new Date()
            })
            .where(eq(vehicleAuctions.apifyId, normalized.apifyId));
        }
      }

    } catch (error) {
      console.error("Error processing record:", error);
    }
  }

  return processed;
}

function normalizeApifyRecord(record: ApifyRecord, category: string) {
  try {
    const searchResult = record.searchResult || record;
    const title = searchResult.title || record.title || "";
    const description = searchResult.description || record.description || "";
    
    // Extract vehicle details from title
    const { make, model, year } = extractVehicleDetails(title);
    if (!make) return null;

    // Extract price
    const price = extractPrice(searchResult.price || record.price);
    
    // Generate unique ID
    const apifyId = record.crawl?.uniqueKey || 
                   record.id || 
                   `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      apifyId,
      category,
      make,
      model,
      year,
      price,
      location: extractLocation(searchResult.location || record.location),
      source: getSourceFromUrl(searchResult.url || record.url),
      sourceUrl: searchResult.url || record.url || null,
      description: description.substring(0, 500),
      fetchedAt: new Date(),
      lastUpdated: new Date()
    };

  } catch (error) {
    console.error("Error normalizing record:", error);
    return null;
  }
}

function extractVehicleDetails(title: string): { make: string | null, model: string | null, year: number | null } {
  if (!title) return { make: null, model: null, year: null };

  const titleUpper = title.toUpperCase();
  
  // Common makes
  const makes = [
    'TOYOTA', 'NISSAN', 'HONDA', 'MAZDA', 'SUBARU', 'MITSUBISHI',
    'FORD', 'CHEVROLET', 'DODGE', 'PLYMOUTH', 'PONTIAC', 'BUICK',
    'OLDSMOBILE', 'CADILLAC', 'LINCOLN', 'MERCURY', 'CHRYSLER'
  ];

  let make = null;
  let model = null;
  let year = null;

  // Find make
  for (const m of makes) {
    if (titleUpper.includes(m)) {
      make = m.charAt(0) + m.slice(1).toLowerCase();
      break;
    }
  }

  // Extract year (4 digits)
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[0]);
  }

  // Extract model (simplified)
  if (make) {
    const afterMake = title.substring(titleUpper.indexOf(make.toUpperCase()) + make.length).trim();
    const modelMatch = afterMake.match(/^([A-Za-z0-9\-\s]+)/);
    if (modelMatch) {
      model = modelMatch[1].trim().split(' ')[0];
    }
  }

  return { make, model, year };
}

function extractPrice(priceInput: any): number | null {
  if (!priceInput) return null;
  
  const priceStr = typeof priceInput === 'string' ? priceInput : priceInput.toString();
  
  // Remove currency symbols and extract numbers
  const cleanPrice = priceStr.replace(/[\$,£€¥\s]/g, '');
  const match = cleanPrice.match(/(\d+(?:\.\d{2})?)/);
  
  if (match) {
    const price = parseFloat(match[1]);
    return price > 1000 && price < 10000000 ? price : null;
  }
  
  return null;
}

function extractLocation(location: any): string | null {
  if (!location) return null;
  
  const locationStr = typeof location === 'string' ? location : location.toString();
  return locationStr.substring(0, 100);
}

function getSourceFromUrl(url: any): string {
  if (!url) return "Unknown";
  
  const urlStr = typeof url === 'string' ? url : url.toString();
  
  if (urlStr.includes('classic.com')) return 'Classic.com';
  if (urlStr.includes('bringatrailer.com')) return 'Bring a Trailer';
  if (urlStr.includes('barrett-jackson.com')) return 'Barrett-Jackson';
  if (urlStr.includes('mecum.com')) return 'Mecum Auctions';
  if (urlStr.includes('yahoo')) return 'Yahoo Auctions';
  
  return 'Auction Source';
}

async function updateDatasetTimestamp(sourceId: string) {
  try {
    await db
      .update(datasetSources)
      .set({ lastFetchAt: new Date() })
      .where(eq(datasetSources.sourceId, sourceId));
  } catch (error) {
    console.error(`Error updating timestamp for ${sourceId}:`, error);
  }
}

export async function getIngestionStatus() {
  try {
    const sources = await db.select().from(datasetSources);
    const totalRecords = await db
      .select({ count: sql`COUNT(*)` })
      .from(vehicleAuctions);

    const categoryStats = await db
      .select({
        category: vehicleAuctions.category,
        count: sql`COUNT(*)`,
        avgPrice: sql`AVG(${vehicleAuctions.price})`,
        lastUpdated: sql`MAX(${vehicleAuctions.lastUpdated})`
      })
      .from(vehicleAuctions)
      .groupBy(vehicleAuctions.category);

    return {
      sources,
      totalRecords: Number(totalRecords[0]?.count || 0),
      categoryStats
    };
  } catch (error) {
    console.error("Error getting ingestion status:", error);
    return {
      sources: [],
      totalRecords: 0,
      categoryStats: []
    };
  }
}