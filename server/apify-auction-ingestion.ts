/**
 * Real-world Auction Data Ingestion System
 * Fetches live auction data from Apify datasets and stores in PostgreSQL
 */

import { db } from './db';
import { vehicleAuctions, vehicleAuctionChanges, datasetSources } from '@shared/schema';
import { eq, and, isNotNull, count, avg } from 'drizzle-orm';
import axios from 'axios';

interface ApifyAuctionRecord {
  id?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: string;
  location?: string;
  auction_end?: string;
  engine?: string;
  transmission?: string;
  fuel_type?: string;
  chassis_code?: string;
  source_url?: string;
  image_url?: string;
  description?: string;
  [key: string]: any;
}

export class ApifyAuctionIngestion {
  
  private static readonly APIFY_DATASETS = [
    {
      label: "US Muscle Classic",
      url: "https://api.apify.com/v2/datasets/EFjwLXRVn4w9QKgPV/items?clean=true&format=json",
      category: "US Muscle"
    },
    {
      label: "Classic Skyline", 
      url: "https://api.apify.com/v2/datasets/BOwRnzKkfbtVVzgfu/items?clean=true&format=json",
      category: "Skyline"
    },
    {
      label: "JDM Classics",
      url: "https://api.apify.com/v2/datasets/ZNQXj1F51xyzo0kiK/items?clean=true&format=json", 
      category: "JDM"
    }
  ];

  /**
   * Initialize dataset sources in PostgreSQL
   */
  static async initializeDatasetSources() {
    try {
      for (const dataset of this.APIFY_DATASETS) {
        await db.insert(datasetSources).values({
          label: dataset.label,
          url: dataset.url,
          category: dataset.category,
          fetchFrequency: 24,
          isActive: true
        }).onConflictDoNothing();
      }
      console.log('✅ Dataset sources initialized');
    } catch (error) {
      console.error('Failed to initialize dataset sources:', error);
    }
  }

  /**
   * Fetch and ingest all auction data
   */
  static async ingestAllAuctionData() {
    console.log('🔄 Starting full auction data ingestion...');
    
    let totalProcessed = 0;
    let totalErrors = 0;

    for (const dataset of this.APIFY_DATASETS) {
      try {
        console.log(`📥 Fetching ${dataset.label} from Apify...`);
        
        const response = await axios.get(dataset.url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'ImportIQ-DataIngestion/1.0'
          }
        });

        if (!response.data || !Array.isArray(response.data)) {
          console.warn(`⚠️ Invalid data format for ${dataset.label}`);
          continue;
        }

        console.log(`📊 Processing ${response.data.length} records from ${dataset.label}...`);
        
        const processed = await this.processAuctionRecords(response.data, dataset.category);
        totalProcessed += processed.success;
        totalErrors += processed.errors;

        // Update last fetched timestamp
        await db.update(datasetSources)
          .set({ lastFetched: new Date() })
          .where(eq(datasetSources.url, dataset.url));

        console.log(`✅ ${dataset.label}: ${processed.success} processed, ${processed.errors} errors`);
        
        // Pause between datasets to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to fetch ${dataset.label}:`, error.message);
        totalErrors++;
      }
    }

    console.log(`🎯 Ingestion complete: ${totalProcessed} processed, ${totalErrors} errors`);
    return { totalProcessed, totalErrors };
  }

  /**
   * Process individual auction records
   */
  private static async processAuctionRecords(records: ApifyAuctionRecord[], category: string) {
    let success = 0;
    let errors = 0;

    for (const record of records) {
      try {
        const normalizedRecord = this.normalizeAuctionRecord(record, category);
        
        if (!normalizedRecord.make || !normalizedRecord.model) {
          errors++;
          continue;
        }

        // Check if record already exists
        const existing = await db.select()
          .from(vehicleAuctions)
          .where(eq(vehicleAuctions.apifyId, normalizedRecord.apifyId))
          .limit(1);

        if (existing.length > 0) {
          // Update existing record and track changes
          await this.updateExistingRecord(existing[0], normalizedRecord);
        } else {
          // Insert new record
          await db.insert(vehicleAuctions).values(normalizedRecord);
        }
        
        success++;
        
      } catch (error) {
        console.error('Error processing record:', error);
        errors++;
      }
    }

    return { success, errors };
  }

  /**
   * Normalize Apify record to our schema
   */
  private static normalizeAuctionRecord(record: ApifyAuctionRecord, category: string) {
    // Generate unique ID if not provided
    const apifyId = record.id || `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Normalize make/model from various possible fields
    const make = this.extractMake(record);
    const model = this.extractModel(record);
    const year = this.extractYear(record);
    const price = this.extractPrice(record);
    
    return {
      apifyId,
      category,
      make,
      model,
      year,
      chassisCode: record.chassis_code || record.chassis || null,
      engine: record.engine || null,
      transmission: record.transmission || null,
      mileage: record.mileage?.toString() || null,
      fuelType: record.fuel_type || record.fuelType || null,
      auctionEnd: record.auction_end ? new Date(record.auction_end) : null,
      price: price,
      location: record.location || null,
      source: record.source || category,
      sourceUrl: record.source_url || record.url || null,
      imageUrl: record.image_url || record.imageUrl || record.image || null,
      description: record.description || record.title || null,
      fetchedAt: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Extract make from various possible fields
   */
  private static extractMake(record: ApifyAuctionRecord): string | null {
    const makeFields = ['make', 'brand', 'manufacturer'];
    for (const field of makeFields) {
      if (record[field] && typeof record[field] === 'string') {
        return record[field].trim();
      }
    }

    // Try to extract from title/description
    if (record.title || record.description) {
      const text = (record.title || record.description).toLowerCase();
      const knownMakes = [
        'toyota', 'nissan', 'honda', 'mazda', 'subaru', 'mitsubishi',
        'ford', 'chevrolet', 'dodge', 'pontiac', 'buick', 'cadillac',
        'bmw', 'mercedes', 'audi', 'volkswagen', 'porsche'
      ];
      
      for (const make of knownMakes) {
        if (text.includes(make)) {
          return make.charAt(0).toUpperCase() + make.slice(1);
        }
      }
    }

    return null;
  }

  /**
   * Extract model from various possible fields
   */
  private static extractModel(record: ApifyAuctionRecord): string | null {
    const modelFields = ['model', 'model_name', 'vehicle_model'];
    for (const field of modelFields) {
      if (record[field] && typeof record[field] === 'string') {
        return record[field].trim();
      }
    }

    // Try to extract from title after make
    if (record.title && record.make) {
      const title = record.title.toLowerCase();
      const make = record.make.toLowerCase();
      const makeIndex = title.indexOf(make);
      
      if (makeIndex !== -1) {
        const afterMake = title.substring(makeIndex + make.length).trim();
        const modelMatch = afterMake.match(/^([a-zA-Z0-9\-\s]+)/);
        if (modelMatch) {
          return modelMatch[1].trim();
        }
      }
    }

    return null;
  }

  /**
   * Extract year from various possible fields
   */
  private static extractYear(record: ApifyAuctionRecord): number | null {
    const yearFields = ['year', 'model_year', 'production_year'];
    for (const field of yearFields) {
      if (record[field]) {
        const year = parseInt(record[field].toString());
        if (year >= 1900 && year <= new Date().getFullYear() + 1) {
          return year;
        }
      }
    }

    // Try to extract from title/description
    if (record.title || record.description) {
      const text = record.title || record.description;
      const yearMatch = text.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0]);
        if (year >= 1900 && year <= new Date().getFullYear() + 1) {
          return year;
        }
      }
    }

    return null;
  }

  /**
   * Extract price from various possible fields
   */
  private static extractPrice(record: ApifyAuctionRecord): number | null {
    const priceFields = ['price', 'current_bid', 'final_price', 'sale_price'];
    for (const field of priceFields) {
      if (record[field] !== undefined && record[field] !== null) {
        let price = record[field];
        
        // Handle string prices with currency symbols
        if (typeof price === 'string') {
          price = price.replace(/[$,£€¥]/g, '');
          price = parseFloat(price);
        }
        
        if (typeof price === 'number' && price > 0 && price < 1000000) {
          return price;
        }
      }
    }

    return null;
  }

  /**
   * Update existing record and track changes
   */
  private static async updateExistingRecord(existing: any, newRecord: any) {
    const hasChanges = JSON.stringify(existing) !== JSON.stringify(newRecord);
    
    if (hasChanges) {
      // Track changes
      await db.insert(vehicleAuctionChanges).values({
        auctionId: existing.id,
        oldData: existing,
        newData: newRecord,
        changedAt: new Date()
      });

      // Update record
      await db.update(vehicleAuctions)
        .set({
          ...newRecord,
          lastUpdated: new Date()
        })
        .where(eq(vehicleAuctions.id, existing.id));
    }
  }

  /**
   * Get market pricing intelligence for a vehicle with destination currency conversion
   */
  static async getMarketPricing(make: string, model: string, year?: number, destinationCountry: string = 'usa') {
    try {
      const { CurrencyService } = await import('./currency-service');
      
      const conditions = [eq(vehicleAuctions.make, make)];
      
      if (model) {
        conditions.push(eq(vehicleAuctions.model, model));
      }
      
      if (year) {
        conditions.push(eq(vehicleAuctions.year, year));
      }

      const results = await db.select()
        .from(vehicleAuctions)
        .where(and(...conditions))
        .limit(50);

      if (results.length === 0) {
        return null;
      }

      const convertedPrices = await Promise.all(
        results
          .filter(r => r.price && r.price > 0)
          .map(async (r) => {
            const price = parseFloat(r.price.toString());
            const sourceCurrency = r.currency || null;
            
            // Use currency service for proper conversion
            const normalizedPrice = await CurrencyService.normalizePrice(
              price, 
              sourceCurrency, 
              destinationCountry
            );
            
            return normalizedPrice.amount;
          })
      );

      if (convertedPrices.length === 0) {
        return null;
      }

      const avgPrice = convertedPrices.reduce((sum, price) => sum + price, 0) / convertedPrices.length;
      const minPrice = Math.min(...convertedPrices);
      const maxPrice = Math.max(...convertedPrices);
      
      const currencyConfig = CurrencyService.getCurrencyConfig(destinationCountry);

      return {
        averagePrice: Math.round(avgPrice),
        minPrice: Math.round(minPrice),
        maxPrice: Math.round(maxPrice),
        currency: currencyConfig.code,
        sampleSize: convertedPrices.length,
        recentListings: results.slice(0, 5).map(r => ({
          price: r.price,
          location: r.location,
          source: r.source,
          fetchedAt: r.fetchedAt
        }))
      };

    } catch (error) {
      console.error('Error getting market pricing:', error);
      return null;
    }
  }

  /**
   * Get auction summary statistics
   */
  static async getAuctionSummary() {
    try {
      const totalRecords = await db.select().from(vehicleAuctions);
      
      const byCategory = await db.select({
        category: vehicleAuctions.category,
        count: db.count()
      })
      .from(vehicleAuctions)
      .groupBy(vehicleAuctions.category);

      const avgPrices = await db.select({
        category: vehicleAuctions.category,
        avgPrice: db.avg(vehicleAuctions.price)
      })
      .from(vehicleAuctions)
      .where(db.isNotNull(vehicleAuctions.price))
      .groupBy(vehicleAuctions.category);

      return {
        totalRecords: totalRecords.length,
        categoryCounts: byCategory,
        averagePrices: avgPrices,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error getting auction summary:', error);
      return null;
    }
  }
}