import { db } from './db';
import { savedReports, apiTokens, csvImportJobs, bulkVinJobs, type SavedReport, type ApiToken, type CsvImportJob, type BulkVinJob } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import crypto from 'crypto';
import { subscriptionService } from './subscription-service';

export class SubscriptionFeaturesService {
  // ===== SAVED REPORTS FEATURE =====
  async saveReport(userId: number, reportData: {
    title: string;
    vehicleData: any;
    searchQuery: string;
    destination: string;
    reportType?: string;
    notes?: string;
  }): Promise<SavedReport> {
    const [savedReport] = await db.insert(savedReports).values({
      userId,
      title: reportData.title,
      vehicleData: reportData.vehicleData,
      searchQuery: reportData.searchQuery,
      destination: reportData.destination,
      reportType: reportData.reportType || 'lookup',
      notes: reportData.notes
    }).returning();

    return savedReport;
  }

  async getUserReports(userId: number, limit: number = 50): Promise<SavedReport[]> {
    return await db.select()
      .from(savedReports)
      .where(eq(savedReports.userId, userId))
      .orderBy(desc(savedReports.updatedAt))
      .limit(limit);
  }

  async getReport(userId: number, reportId: number): Promise<SavedReport | null> {
    const reports = await db.select()
      .from(savedReports)
      .where(and(
        eq(savedReports.id, reportId),
        eq(savedReports.userId, userId)
      ))
      .limit(1);

    return reports.length > 0 ? reports[0] : null;
  }

  async updateReport(userId: number, reportId: number, updates: Partial<SavedReport>): Promise<SavedReport | null> {
    const [updated] = await db.update(savedReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(savedReports.id, reportId),
        eq(savedReports.userId, userId)
      ))
      .returning();

    return updated || null;
  }

  async deleteReport(userId: number, reportId: number): Promise<boolean> {
    const result = await db.delete(savedReports)
      .where(and(
        eq(savedReports.id, reportId),
        eq(savedReports.userId, userId)
      ));

    return result.rowCount > 0;
  }

  // ===== API TOKENS FEATURE =====
  async createApiToken(userId: number, tokenName: string, scopes: string[] = ['lookup']): Promise<{ token: string; apiToken: ApiToken }> {
    // Check if user has Pro access for API features
    const hasApiAccess = await subscriptionService.canAccessFeature(userId, 'apiAccess');
    if (!hasApiAccess) {
      throw new Error('API access requires Pro subscription');
    }

    // Generate secure API token
    const token = `iiq_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [apiToken] = await db.insert(apiTokens).values({
      userId,
      tokenName,
      tokenHash,
      scopes,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }).returning();

    return { token, apiToken };
  }

  async getUserTokens(userId: number): Promise<ApiToken[]> {
    return await db.select()
      .from(apiTokens)
      .where(and(
        eq(apiTokens.userId, userId),
        eq(apiTokens.isActive, true)
      ))
      .orderBy(desc(apiTokens.createdAt));
  }

  async validateApiToken(token: string): Promise<{ userId: number; scopes: string[] } | null> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const tokens = await db.select()
      .from(apiTokens)
      .where(and(
        eq(apiTokens.tokenHash, tokenHash),
        eq(apiTokens.isActive, true)
      ))
      .limit(1);

    if (!tokens.length) return null;

    const apiToken = tokens[0];
    
    // Check if token is expired
    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
      return null;
    }

    // Update last used timestamp
    await db.update(apiTokens)
      .set({ lastUsed: new Date() })
      .where(eq(apiTokens.id, apiToken.id));

    return {
      userId: apiToken.userId,
      scopes: apiToken.scopes
    };
  }

  async revokeApiToken(userId: number, tokenId: number): Promise<boolean> {
    const result = await db.update(apiTokens)
      .set({ isActive: false })
      .where(and(
        eq(apiTokens.id, tokenId),
        eq(apiTokens.userId, userId)
      ));

    return result.rowCount > 0;
  }

  // ===== CSV IMPORT FEATURE =====
  async createCsvImportJob(userId: number, fileName: string, csvData: string[][]): Promise<CsvImportJob> {
    // Check if user has CSV import access
    const hasCsvAccess = await subscriptionService.canAccessFeature(userId, 'csvImport');
    if (!hasCsvAccess) {
      throw new Error('CSV import requires Pro subscription');
    }

    const [importJob] = await db.insert(csvImportJobs).values({
      userId,
      fileName,
      totalRows: csvData.length,
      status: 'processing'
    }).returning();

    // Process CSV data asynchronously
    this.processCsvImport(importJob.id, csvData);

    return importJob;
  }

  private async processCsvImport(jobId: number, csvData: string[][]) {
    try {
      const results: any[] = [];
      const errors: any[] = [];
      let processed = 0;
      let successful = 0;
      let failed = 0;

      for (const row of csvData) {
        try {
          // Assume CSV format: VIN, Destination
          const [vin, destination] = row;
          
          if (!vin || !destination) {
            errors.push({ row: processed + 1, error: 'Missing VIN or destination' });
            failed++;
          } else {
            // Process vehicle lookup (integration with smart-parser would go here)
            const result = {
              vin,
              destination,
              status: 'success',
              // This would be the actual lookup result
              vehicleData: { make: 'Sample', model: 'Data', year: 2020 }
            };
            results.push(result);
            successful++;
          }
        } catch (error) {
          errors.push({ row: processed + 1, error: error.message });
          failed++;
        }
        
        processed++;
        
        // Update progress
        await db.update(csvImportJobs)
          .set({
            processedRows: processed,
            successfulRows: successful,
            failedRows: failed
          })
          .where(eq(csvImportJobs.id, jobId));
      }

      // Complete the job
      await db.update(csvImportJobs)
        .set({
          status: 'completed',
          resultsData: results,
          errorLog: errors,
          completedAt: new Date(),
          downloadUrl: `/api/download/csv-results/${jobId}`
        })
        .where(eq(csvImportJobs.id, jobId));

    } catch (error) {
      await db.update(csvImportJobs)
        .set({
          status: 'failed',
          errorLog: [{ error: error.message }],
          completedAt: new Date()
        })
        .where(eq(csvImportJobs.id, jobId));
    }
  }

  async getCsvImportJob(userId: number, jobId: number): Promise<CsvImportJob | null> {
    const jobs = await db.select()
      .from(csvImportJobs)
      .where(and(
        eq(csvImportJobs.id, jobId),
        eq(csvImportJobs.userId, userId)
      ))
      .limit(1);

    return jobs.length > 0 ? jobs[0] : null;
  }

  async getUserCsvJobs(userId: number): Promise<CsvImportJob[]> {
    return await db.select()
      .from(csvImportJobs)
      .where(eq(csvImportJobs.userId, userId))
      .orderBy(desc(csvImportJobs.createdAt))
      .limit(20);
  }

  // ===== BULK VIN LOOKUP FEATURE =====
  async createBulkVinJob(userId: number, jobName: string, vinList: string[], destination: string): Promise<BulkVinJob> {
    // Check if user has bulk VIN access
    const hasBulkAccess = await subscriptionService.canAccessFeature(userId, 'bulkVin');
    if (!hasBulkAccess) {
      throw new Error('Bulk VIN lookup requires Pro subscription');
    }

    const [bulkJob] = await db.insert(bulkVinJobs).values({
      userId,
      jobName,
      vinList,
      destination,
      totalVins: vinList.length,
      status: 'processing'
    }).returning();

    // Process VINs asynchronously
    this.processBulkVinLookup(bulkJob.id, vinList, destination);

    return bulkJob;
  }

  private async processBulkVinLookup(jobId: number, vinList: string[], destination: string) {
    try {
      const results: any[] = [];
      let processed = 0;
      let successful = 0;
      let failed = 0;

      for (const vin of vinList) {
        try {
          // Process individual VIN lookup (integration with smart-parser would go here)
          const result = {
            vin,
            destination,
            status: 'success',
            // This would be the actual lookup result
            vehicleData: { make: 'Sample', model: 'Data', year: 2020 },
            eligibility: { status: 'eligible', confidence: 95 },
            costs: { totalCost: 50000 }
          };
          results.push(result);
          successful++;
        } catch (error) {
          results.push({
            vin,
            destination,
            status: 'error',
            error: error.message
          });
          failed++;
        }
        
        processed++;
        
        // Update progress
        await db.update(bulkVinJobs)
          .set({
            processedVins: processed,
            successfulVins: successful,
            failedVins: failed
          })
          .where(eq(bulkVinJobs.id, jobId));
      }

      // Complete the job
      await db.update(bulkVinJobs)
        .set({
          status: 'completed',
          resultsData: results,
          completedAt: new Date(),
          downloadUrl: `/api/download/bulk-vin-results/${jobId}`
        })
        .where(eq(bulkVinJobs.id, jobId));

    } catch (error) {
      await db.update(bulkVinJobs)
        .set({
          status: 'failed',
          completedAt: new Date()
        })
        .where(eq(bulkVinJobs.id, jobId));
    }
  }

  async getBulkVinJob(userId: number, jobId: number): Promise<BulkVinJob | null> {
    const jobs = await db.select()
      .from(bulkVinJobs)
      .where(and(
        eq(bulkVinJobs.id, jobId),
        eq(bulkVinJobs.userId, userId)
      ))
      .limit(1);

    return jobs.length > 0 ? jobs[0] : null;
  }

  async getUserBulkVinJobs(userId: number): Promise<BulkVinJob[]> {
    return await db.select()
      .from(bulkVinJobs)
      .where(eq(bulkVinJobs.userId, userId))
      .orderBy(desc(bulkVinJobs.createdAt))
      .limit(20);
  }
}

export const subscriptionFeaturesService = new SubscriptionFeaturesService();