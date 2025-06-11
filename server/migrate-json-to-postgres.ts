import { db } from "./db";
import { userQuotes, marketDataSamples } from "@shared/schema";
import fs from 'fs';
import path from 'path';

export async function migrateJSONToPostgreSQL() {
  console.log('Starting migration from JSON files to PostgreSQL...');

  try {
    // Migrate submissions.json to user_quotes table
    const submissionsPath = path.join(process.cwd(), 'submissions.json');
    if (fs.existsSync(submissionsPath)) {
      const submissionsData = JSON.parse(fs.readFileSync(submissionsPath, 'utf8'));
      
      for (const submission of submissionsData) {
        await db.insert(userQuotes).values({
          fullName: submission.fullName,
          email: submission.email,
          vehiclePrice: submission.vehiclePrice,
          shippingOrigin: submission.shippingOrigin,
          shipping: submission.shipping,
          customsDuty: submission.customsDuty,
          gst: submission.gst,
          lct: submission.lct,
          inspection: submission.inspection,
          serviceFee: submission.serviceFee,
          totalCost: submission.totalCost,
          serviceTier: submission.serviceTier,
          createdAt: new Date(submission.createdAt)
        }).onConflictDoNothing();
      }
      
      console.log(`Migrated ${submissionsData.length} user quotes to PostgreSQL`);
    }

    // Migrate live-market-data.json to market_data_samples table
    const marketDataPath = path.join(process.cwd(), 'live-market-data.json');
    if (fs.existsSync(marketDataPath)) {
      const marketData = JSON.parse(fs.readFileSync(marketDataPath, 'utf8'));
      
      for (const vehicle of marketData) {
        await db.insert(marketDataSamples).values({
          vehicleMake: extractMake(vehicle.title),
          vehicleModel: extractModel(vehicle.title),
          year: parseInt(vehicle.year),
          price: parseFloat(vehicle.price),
          currency: vehicle.currency,
          mileage: vehicle.mileage,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
          sourceUrl: vehicle.url,
          imageUrls: vehicle.images,
          region: 'Japan',
          lastFetched: new Date(vehicle.scrapedAt)
        }).onConflictDoNothing();
      }
      
      console.log(`Migrated ${marketData.length} market data samples to PostgreSQL`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

function extractMake(title: string): string {
  const parts = title.split(' ');
  return parts[0] || 'Unknown';
}

function extractModel(title: string): string {
  const parts = title.split(' ');
  return parts.slice(1).join(' ') || 'Unknown';
}