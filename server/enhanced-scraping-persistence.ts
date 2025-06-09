/**
 * Enhanced Scraping Data Persistence Layer
 * Mandatory PostgreSQL persistence for all scraped data - no in-memory storage
 */

import { db } from './db';
import { 
  htsTariffCodes, 
  vehicleHtsMapping, 
  copartVehicles, 
  copartPriceHistory,
  cbsaImportRequirements,
  vehicleImportEligibility,
  scrapingData,
  scrapingMetrics
} from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export interface HTSTariffCodeData {
  htsCode: string;
  description: string;
  dutyRatePercent?: number;
  dutyRateSpecific?: string;
  effectiveDate?: string;
  countryExceptions?: Record<string, any>;
  vehicleCategory?: string;
  engineSizeCategory?: string;
  valueThreshold?: number;
  additionalFees?: string[];
  notes?: string;
}

export interface CopartVehicleData {
  lotNumber: string;
  vin?: string;
  make: string;
  model: string;
  year: number;
  engineSize?: string;
  transmission?: string;
  driveType?: string;
  fuelType?: string;
  mileage?: number;
  damageDescription?: string;
  damageSeverity?: string;
  currentBid?: number;
  buyItNowPrice?: number;
  estimatedValue?: number;
  saleDate?: string;
  location?: string;
  seller?: string;
  titleType?: string;
  auctionStatus?: string;
  reserveMet?: boolean;
  importEligibilityScore?: number;
  conditionReport?: Record<string, any>;
  images?: string[];
}

export interface CBSARequirementData {
  vehicleCategory: string;
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  rivEligible?: boolean;
  rivCategory?: string;
  requiredDocuments: string[];
  modificationRequirements?: string[];
  inspectionRequirements?: string;
  dutyRate: number;
  gstRate: number;
  additionalFees?: Record<string, any>;
  estimatedCostCad?: number;
  processingTimeDays?: number;
  provincialRequirements?: Record<string, any>;
  recallClearanceRequired?: boolean;
  emissionsCompliance?: string;
  safetyStandards?: string[];
  notes?: string;
  sourceUrl?: string;
}

export class EnhancedScrapingPersistence {
  
  /**
   * Persist HTS tariff codes with upsert capability
   */
  static async persistHTSTariffCodes(codes: HTSTariffCodeData[]): Promise<number> {
    let persistedCount = 0;
    
    for (const codeData of codes) {
      try {
        await db.insert(htsTariffCodes)
          .values({
            htsCode: codeData.htsCode,
            description: codeData.description,
            dutyRatePercent: codeData.dutyRatePercent?.toString(),
            dutyRateSpecific: codeData.dutyRateSpecific,
            effectiveDate: codeData.effectiveDate,
            countryExceptions: codeData.countryExceptions,
            vehicleCategory: codeData.vehicleCategory,
            engineSizeCategory: codeData.engineSizeCategory,
            valueThreshold: codeData.valueThreshold?.toString(),
            additionalFees: codeData.additionalFees,
            notes: codeData.notes,
            updatedAt: new Date()
          })
          .onConflictDoUpdate({
            target: htsTariffCodes.htsCode,
            set: {
              description: codeData.description,
              dutyRatePercent: codeData.dutyRatePercent?.toString(),
              dutyRateSpecific: codeData.dutyRateSpecific,
              effectiveDate: codeData.effectiveDate,
              countryExceptions: codeData.countryExceptions,
              vehicleCategory: codeData.vehicleCategory,
              engineSizeCategory: codeData.engineSizeCategory,
              valueThreshold: codeData.valueThreshold?.toString(),
              additionalFees: codeData.additionalFees,
              notes: codeData.notes,
              updatedAt: new Date()
            }
          });
        
        persistedCount++;
        
        // Create vehicle mappings for known makes/models
        await this.createVehicleHTSMappings(codeData);
        
      } catch (error) {
        console.error(`Failed to persist HTS code ${codeData.htsCode}:`, error);
      }
    }
    
    console.log(`✅ Persisted ${persistedCount} HTS tariff codes to PostgreSQL`);
    return persistedCount;
  }
  
  /**
   * Persist Copart vehicles with price history tracking
   */
  static async persistCopartVehicles(vehicles: CopartVehicleData[]): Promise<number> {
    let persistedCount = 0;
    
    for (const vehicleData of vehicles) {
      try {
        // Insert or update main vehicle record
        const [vehicle] = await db.insert(copartVehicles)
          .values({
            lotNumber: vehicleData.lotNumber,
            vin: vehicleData.vin,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            engineSize: vehicleData.engineSize,
            transmission: vehicleData.transmission,
            driveType: vehicleData.driveType,
            fuelType: vehicleData.fuelType,
            mileage: vehicleData.mileage,
            damageDescription: vehicleData.damageDescription,
            damageSeverity: vehicleData.damageSeverity,
            currentBid: vehicleData.currentBid?.toString(),
            buyItNowPrice: vehicleData.buyItNowPrice?.toString(),
            estimatedValue: vehicleData.estimatedValue?.toString(),
            saleDate: vehicleData.saleDate,
            location: vehicleData.location,
            seller: vehicleData.seller,
            titleType: vehicleData.titleType,
            auctionStatus: vehicleData.auctionStatus,
            reserveMet: vehicleData.reserveMet,
            importEligibilityScore: vehicleData.importEligibilityScore,
            conditionReport: vehicleData.conditionReport,
            images: vehicleData.images,
            updatedAt: new Date()
          })
          .onConflictDoUpdate({
            target: copartVehicles.lotNumber,
            set: {
              currentBid: vehicleData.currentBid?.toString(),
              buyItNowPrice: vehicleData.buyItNowPrice?.toString(),
              auctionStatus: vehicleData.auctionStatus,
              reserveMet: vehicleData.reserveMet,
              updatedAt: new Date()
            }
          })
          .returning();
        
        // Track price history
        if (vehicleData.currentBid && vehicleData.currentBid > 0) {
          await db.insert(copartPriceHistory)
            .values({
              vehicleId: vehicle.id,
              lotNumber: vehicleData.lotNumber,
              price: vehicleData.currentBid.toString(),
              bidCount: 0, // Extract if available
              saleStatus: vehicleData.auctionStatus || 'active'
            })
            .onConflictDoNothing();
        }
        
        // Calculate and store import eligibility
        await this.calculateImportEligibility(vehicle);
        
        persistedCount++;
        
      } catch (error) {
        console.error(`Failed to persist Copart vehicle ${vehicleData.lotNumber}:`, error);
      }
    }
    
    console.log(`✅ Persisted ${persistedCount} Copart vehicles to PostgreSQL`);
    return persistedCount;
  }
  
  /**
   * Persist CBSA import requirements
   */
  static async persistCBSARequirements(requirements: CBSARequirementData[]): Promise<number> {
    let persistedCount = 0;
    
    for (const reqData of requirements) {
      try {
        await db.insert(cbsaImportRequirements)
          .values({
            vehicleCategory: reqData.vehicleCategory,
            make: reqData.make,
            model: reqData.model,
            yearMin: reqData.yearMin,
            yearMax: reqData.yearMax,
            rivEligible: reqData.rivEligible,
            rivCategory: reqData.rivCategory,
            requiredDocuments: reqData.requiredDocuments,
            modificationRequirements: reqData.modificationRequirements,
            inspectionRequirements: reqData.inspectionRequirements,
            dutyRate: reqData.dutyRate.toString(),
            gstRate: reqData.gstRate.toString(),
            additionalFees: reqData.additionalFees,
            estimatedCostCad: reqData.estimatedCostCad?.toString(),
            processingTimeDays: reqData.processingTimeDays,
            provincialRequirements: reqData.provincialRequirements,
            recallClearanceRequired: reqData.recallClearanceRequired,
            emissionsCompliance: reqData.emissionsCompliance,
            safetyStandards: reqData.safetyStandards,
            notes: reqData.notes,
            sourceUrl: reqData.sourceUrl,
            updatedAt: new Date()
          })
          .onConflictDoNothing();
        
        persistedCount++;
        
      } catch (error) {
        console.error(`Failed to persist CBSA requirement:`, error);
      }
    }
    
    console.log(`✅ Persisted ${persistedCount} CBSA requirements to PostgreSQL`);
    return persistedCount;
  }
  
  /**
   * Record scraping metrics for monitoring
   */
  static async recordScrapingMetrics(
    source: string, 
    recordsFound: number, 
    recordsProcessed: number, 
    executionTime: number,
    errors: string[] = []
  ): Promise<void> {
    const successRate = recordsFound > 0 ? recordsProcessed / recordsFound : 0;
    
    await db.insert(scrapingMetrics)
      .values({
        source,
        recordsFound,
        recordsProcessed,
        successRate,
        executionTime,
        errors,
        runDate: new Date().toISOString().split('T')[0]
      });
    
    console.log(`📊 Recorded metrics for ${source}: ${recordsProcessed}/${recordsFound} processed`);
  }
  
  /**
   * Store raw scraping data for audit trail
   */
  static async storeRawScrapingData(
    source: string,
    dataType: string,
    rawData: any,
    processedData?: any,
    qualityScore?: number
  ): Promise<void> {
    await db.insert(scrapingData)
      .values({
        source,
        dataType,
        rawData,
        processedData,
        qualityScore,
        isValid: qualityScore ? qualityScore > 0.7 : true
      });
  }
  
  /**
   * Create vehicle-to-HTS code mappings
   */
  private static async createVehicleHTSMappings(htsData: HTSTariffCodeData): Promise<void> {
    if (!htsData.vehicleCategory) return;
    
    const vehicleMappings = this.inferVehicleMappingsFromHTS(htsData);
    
    for (const mapping of vehicleMappings) {
      try {
        await db.insert(vehicleHtsMapping)
          .values({
            vehicleMake: mapping.make,
            vehicleModel: mapping.model,
            engineSizeCc: mapping.engineSizeCc,
            yearMin: mapping.yearMin,
            yearMax: mapping.yearMax,
            htsCode: htsData.htsCode,
            mappingConfidence: mapping.confidence,
            notes: `Auto-mapped from HTS description: ${htsData.description}`
          })
          .onConflictDoNothing();
      } catch (error) {
        console.warn(`Failed to create vehicle mapping for ${htsData.htsCode}`);
      }
    }
  }
  
  /**
   * Calculate and store import eligibility for vehicles
   */
  private static async calculateImportEligibility(vehicle: any): Promise<void> {
    try {
      // Find matching HTS code
      const htsMapping = await db.select()
        .from(vehicleHtsMapping)
        .where(
          and(
            eq(vehicleHtsMapping.vehicleMake, vehicle.make),
            gte(vehicleHtsMapping.yearMax, vehicle.year),
            lte(vehicleHtsMapping.yearMin, vehicle.year)
          )
        )
        .limit(1);
      
      // Find Canada requirements
      const canadaReq = await db.select()
        .from(cbsaImportRequirements)
        .where(
          and(
            eq(cbsaImportRequirements.make, vehicle.make),
            gte(cbsaImportRequirements.yearMax, vehicle.year),
            lte(cbsaImportRequirements.yearMin, vehicle.year)
          )
        )
        .limit(1);
      
      // Calculate costs
      const usaEligible = vehicle.year <= new Date().getFullYear() - 25;
      const usaWaitUntil = usaEligible ? null : new Date(vehicle.year + 25, 0, 1);
      
      let calculatedDutyUsd = 0;
      let totalImportCostUsd = 0;
      
      if (htsMapping.length > 0 && vehicle.currentBid) {
        // Get HTS code details for duty calculation
        const [htsDetails] = await db.select()
          .from(htsTariffCodes)
          .where(eq(htsTariffCodes.htsCode, htsMapping[0].htsCode));
        
        if (htsDetails && htsDetails.dutyRatePercent) {
          calculatedDutyUsd = parseFloat(vehicle.currentBid) * (parseFloat(htsDetails.dutyRatePercent) / 100);
          totalImportCostUsd = parseFloat(vehicle.currentBid) + calculatedDutyUsd + 2500; // Base shipping/fees
        }
      }
      
      // Store eligibility record
      await db.insert(vehicleImportEligibility)
        .values({
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          usaEligible,
          canadaEligible: canadaReq.length > 0 && canadaReq[0].rivEligible,
          usaWaitUntil: usaWaitUntil?.toISOString().split('T')[0],
          canadaRequirementsId: canadaReq.length > 0 ? canadaReq[0].id : null,
          htsCode: htsMapping.length > 0 ? htsMapping[0].htsCode : null,
          calculatedDutyUsd: calculatedDutyUsd.toString(),
          totalImportCostUsd: totalImportCostUsd.toString(),
          confidenceScore: htsMapping.length > 0 ? 0.8 : 0.3,
          dataQualityScore: vehicle.vin ? 0.9 : 0.6
        })
        .onConflictDoUpdate({
          target: [vehicleImportEligibility.make, vehicleImportEligibility.model, vehicleImportEligibility.year],
          set: {
            calculatedDutyUsd: calculatedDutyUsd.toString(),
            totalImportCostUsd: totalImportCostUsd.toString(),
            lastCalculated: new Date(),
            lastUpdated: new Date()
          }
        });
        
    } catch (error) {
      console.warn(`Failed to calculate import eligibility for ${vehicle.make} ${vehicle.model}`);
    }
  }
  
  /**
   * Infer vehicle mappings from HTS code descriptions
   */
  private static inferVehicleMappingsFromHTS(htsData: HTSTariffCodeData): Array<{
    make: string;
    model: string;
    engineSizeCc?: number;
    yearMin?: number;
    yearMax?: number;
    confidence: number;
  }> {
    const mappings = [];
    
    // Engine size categories
    let engineSizeCc;
    if (htsData.engineSizeCategory === 'under_3000cc') {
      engineSizeCc = 2999;
    } else if (htsData.engineSizeCategory === 'over_3000cc') {
      engineSizeCc = 3001;
    }
    
    // Vehicle category mappings
    if (htsData.vehicleCategory === 'passenger_car') {
      const popularMakes = ['Toyota', 'Nissan', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi'];
      
      for (const make of popularMakes) {
        mappings.push({
          make,
          model: 'All Models',
          engineSizeCc,
          yearMin: 1990,
          yearMax: 2025,
          confidence: 0.7
        });
      }
    }
    
    return mappings;
  }
  
  /**
   * Get comprehensive vehicle import data with cross-references
   */
  static async getVehicleImportIntelligence(make: string, model: string, year: number): Promise<any> {
    const eligibility = await db.select({
      eligibility: vehicleImportEligibility,
      htsCode: htsTariffCodes,
      canadaReq: cbsaImportRequirements
    })
    .from(vehicleImportEligibility)
    .leftJoin(htsTariffCodes, eq(vehicleImportEligibility.htsCode, htsTariffCodes.htsCode))
    .leftJoin(cbsaImportRequirements, eq(vehicleImportEligibility.canadaRequirementsId, cbsaImportRequirements.id))
    .where(
      and(
        eq(vehicleImportEligibility.make, make),
        eq(vehicleImportEligibility.model, model),
        eq(vehicleImportEligibility.year, year)
      )
    )
    .limit(1);
    
    if (eligibility.length === 0) {
      return null;
    }
    
    // Get market data from Copart
    const marketData = await db.select()
      .from(copartVehicles)
      .where(
        and(
          eq(copartVehicles.make, make),
          eq(copartVehicles.model, model),
          eq(copartVehicles.year, year)
        )
      )
      .orderBy(desc(copartVehicles.scrapedAt))
      .limit(10);
    
    return {
      eligibility: eligibility[0],
      marketData,
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * Get database statistics for monitoring
   */
  static async getDatabaseStats(): Promise<any> {
    const stats = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(htsTariffCodes),
      db.select({ count: sql<number>`count(*)` }).from(copartVehicles),
      db.select({ count: sql<number>`count(*)` }).from(cbsaImportRequirements),
      db.select({ count: sql<number>`count(*)` }).from(vehicleImportEligibility),
      db.select({ 
        source: scrapingMetrics.source,
        totalRecords: sql<number>`sum(${scrapingMetrics.recordsProcessed})`,
        avgSuccessRate: sql<number>`avg(${scrapingMetrics.successRate})`
      })
      .from(scrapingMetrics)
      .groupBy(scrapingMetrics.source)
    ]);
    
    return {
      htsCodes: stats[0][0]?.count || 0,
      copartVehicles: stats[1][0]?.count || 0,
      cbsaRequirements: stats[2][0]?.count || 0,
      eligibilityRecords: stats[3][0]?.count || 0,
      scrapingStats: stats[4],
      lastUpdated: new Date().toISOString()
    };
  }
}

export default EnhancedScrapingPersistence;