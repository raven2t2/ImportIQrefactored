/**
 * ImportIQ Scraping System Integration
 * Integrates the Python scraping system with the Node.js/PostgreSQL backend
 * Provides real-time monitoring and data quality tracking
 */

import { db } from './db';
import { eq, sql, desc, and, gte } from 'drizzle-orm';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// Scraping system monitoring interface
export interface ScrapingSystemStatus {
  isRunning: boolean;
  totalScheduledJobs: number;
  nextJobTime: string | null;
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    totalRecordsScraped: number;
    lastRunTime: string | null;
  };
  dataQuality: {
    averageQualityScore: number;
    validationRate: number;
    recentErrors: string[];
  };
}

export interface ScrapingJobResult {
  jobType: string;
  status: 'success' | 'failed' | 'running';
  recordsFound: number;
  executionTime: number;
  errors: string[];
  dataQualityScore: number;
  timestamp: string;
}

export class ScrapingSystemManager {
  private static instance: ScrapingSystemManager;
  private schedulerProcess: any = null;
  private isInitialized = false;

  static getInstance(): ScrapingSystemManager {
    if (!ScrapingSystemManager.instance) {
      ScrapingSystemManager.instance = new ScrapingSystemManager();
    }
    return ScrapingSystemManager.instance;
  }

  /**
   * Initialize the scraping system integration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔧 Initializing ImportIQ scraping system integration...');

    // Create PostgreSQL tables for scraping system
    await this.createScrapingTables();

    // Initialize monitoring
    await this.setupMonitoring();

    this.isInitialized = true;
    console.log('✅ Scraping system integration initialized');
  }

  /**
   * Create PostgreSQL tables for scraping system data
   */
  private async createScrapingTables(): Promise<void> {
    const tables = [
      // Staging table for raw scraped data
      `CREATE TABLE IF NOT EXISTS scraped_data_staging (
        id SERIAL PRIMARY KEY,
        source TEXT NOT NULL,
        data_type TEXT NOT NULL,
        raw_data JSONB NOT NULL,
        quality_score FLOAT DEFAULT 0,
        processed BOOLEAN DEFAULT FALSE,
        validation_errors TEXT[],
        scraped_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP
      )`,

      // Scraping activity log
      `CREATE TABLE IF NOT EXISTS scraping_log (
        id SERIAL PRIMARY KEY,
        source TEXT NOT NULL,
        job_type TEXT NOT NULL,
        status TEXT NOT NULL,
        records_found INTEGER DEFAULT 0,
        records_processed INTEGER DEFAULT 0,
        errors TEXT[],
        execution_time_seconds FLOAT,
        quality_score FLOAT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP DEFAULT NOW()
      )`,

      // Import eligibility data from scrapers
      `CREATE TABLE IF NOT EXISTS import_eligibility_data (
        id SERIAL PRIMARY KEY,
        make TEXT NOT NULL,
        model TEXT,
        year INTEGER,
        country_destination TEXT NOT NULL,
        eligibility_status TEXT,
        regulatory_authority TEXT,
        twenty_five_year_rule BOOLEAN,
        requirements TEXT,
        source_url TEXT,
        confidence_score FLOAT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT NOW(),
        UNIQUE(make, model, year, country_destination)
      )`,

      // Customs duty rates from scrapers
      `CREATE TABLE IF NOT EXISTS customs_duty_rates (
        id SERIAL PRIMARY KEY,
        country TEXT NOT NULL,
        hts_code TEXT,
        tariff_code TEXT,
        description TEXT,
        duty_rate_percent FLOAT,
        vehicle_category TEXT,
        additional_fees TEXT,
        gst_rate_percent FLOAT,
        vat_rate_percent FLOAT,
        luxury_tax_threshold FLOAT,
        luxury_tax_rate FLOAT,
        effective_date DATE,
        source TEXT,
        last_updated TIMESTAMP DEFAULT NOW(),
        UNIQUE(country, hts_code, tariff_code)
      )`,

      // Data quality metrics
      `CREATE TABLE IF NOT EXISTS data_quality_metrics (
        id SERIAL PRIMARY KEY,
        source TEXT NOT NULL,
        metric_date DATE DEFAULT CURRENT_DATE,
        total_records INTEGER DEFAULT 0,
        valid_records INTEGER DEFAULT 0,
        validation_rate FLOAT DEFAULT 0,
        average_quality_score FLOAT DEFAULT 0,
        common_errors JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      )`
    ];

    for (const tableSQL of tables) {
      try {
        await db.execute(sql.raw(tableSQL));
      } catch (error) {
        console.log(`Creating scraping table: ${tableSQL.split(' ')[5]}`);
      }
    }
  }

  /**
   * Setup monitoring for the scraping system
   */
  private async setupMonitoring(): Promise<void> {
    // Create indices for better performance
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_scraped_data_source ON scraped_data_staging(source)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_data_processed ON scraped_data_staging(processed)',
      'CREATE INDEX IF NOT EXISTS idx_scraping_log_source ON scraping_log(source)',
      'CREATE INDEX IF NOT EXISTS idx_scraping_log_status ON scraping_log(status)',
      'CREATE INDEX IF NOT EXISTS idx_import_eligibility_make_model ON import_eligibility_data(make, model)',
      'CREATE INDEX IF NOT EXISTS idx_customs_duty_country ON customs_duty_rates(country)'
    ];

    for (const indexSQL of indices) {
      try {
        await db.execute(sql.raw(indexSQL));
      } catch (error) {
        // Index might already exist
      }
    }
  }

  /**
   * Start the Python scraping scheduler
   */
  async startScheduler(): Promise<boolean> {
    if (this.schedulerProcess) {
      console.log('Scraping scheduler is already running');
      return true;
    }

    try {
      const schedulerPath = path.join(process.cwd(), 'utils', 'scheduler.py');
      
      // Check if Python scheduler exists
      try {
        await fs.access(schedulerPath);
      } catch {
        console.log('Python scheduler not found, scraping system ready for manual setup');
        return false;
      }

      this.schedulerProcess = spawn('python3', [schedulerPath], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.schedulerProcess.stdout?.on('data', (data: Buffer) => {
        console.log(`[Scraper] ${data.toString().trim()}`);
      });

      this.schedulerProcess.stderr?.on('data', (data: Buffer) => {
        console.error(`[Scraper Error] ${data.toString().trim()}`);
      });

      this.schedulerProcess.on('exit', (code: number) => {
        console.log(`Scraping scheduler exited with code ${code}`);
        this.schedulerProcess = null;
      });

      console.log('🚀 Python scraping scheduler started');
      return true;

    } catch (error) {
      console.error('Failed to start scraping scheduler:', error);
      return false;
    }
  }

  /**
   * Stop the Python scraping scheduler
   */
  async stopScheduler(): Promise<void> {
    if (this.schedulerProcess) {
      this.schedulerProcess.kill('SIGTERM');
      this.schedulerProcess = null;
      console.log('🛑 Scraping scheduler stopped');
    }
  }

  /**
   * Get current scraping system status
   */
  async getSystemStatus(): Promise<ScrapingSystemStatus> {
    // Get recent scraping logs
    const recentLogs = await db.execute(sql`
      SELECT * FROM scraping_log 
      WHERE completed_at > NOW() - INTERVAL '24 hours'
      ORDER BY completed_at DESC
    `);

    // Calculate statistics
    const totalRuns = recentLogs.length;
    const successfulRuns = recentLogs.filter((log: any) => log.status === 'success').length;
    const failedRuns = totalRuns - successfulRuns;

    // Get data quality metrics
    const qualityMetrics = await db.execute(sql`
      SELECT 
        AVG(average_quality_score) as avg_quality,
        AVG(validation_rate) as avg_validation_rate
      FROM data_quality_metrics 
      WHERE metric_date > CURRENT_DATE - INTERVAL '7 days'
    `);

    // Get recent errors
    const recentErrors = await db.execute(sql`
      SELECT errors FROM scraping_log 
      WHERE status = 'failed' AND completed_at > NOW() - INTERVAL '24 hours'
      ORDER BY completed_at DESC
      LIMIT 5
    `);

    const errors = recentErrors
      .flatMap((log: any) => log.errors || [])
      .slice(0, 10);

    return {
      isRunning: this.schedulerProcess !== null,
      totalScheduledJobs: 5, // Based on our configuration
      nextJobTime: null, // Would get from scheduler if running
      stats: {
        totalRuns,
        successfulRuns,
        failedRuns,
        totalRecordsScraped: recentLogs.reduce((sum: number, log: any) => sum + (log.records_found || 0), 0),
        lastRunTime: recentLogs[0]?.completed_at || null
      },
      dataQuality: {
        averageQualityScore: qualityMetrics[0]?.avg_quality || 0,
        validationRate: qualityMetrics[0]?.avg_validation_rate || 0,
        recentErrors: errors
      }
    };
  }

  /**
   * Process scraped data from staging to main tables
   */
  async processScrapedData(): Promise<number> {
    console.log('📊 Processing scraped data from staging...');

    // Get unprocessed records
    const unprocessedRecords = await db.execute(sql`
      SELECT * FROM scraped_data_staging 
      WHERE processed = false 
      ORDER BY scraped_at ASC
      LIMIT 1000
    `);

    let processedCount = 0;

    for (const record of unprocessedRecords) {
      try {
        const data = record.raw_data;
        const source = record.source;

        if (source === 'import_eligibility') {
          await this.processImportEligibilityData(data);
        } else if (source === 'customs_duty_rates') {
          await this.processCustomsDutyData(data);
        }

        // Mark as processed
        await db.execute(sql`
          UPDATE scraped_data_staging 
          SET processed = true, processed_at = NOW()
          WHERE id = ${record.id}
        `);

        processedCount++;

      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error);
        
        // Mark as failed
        await db.execute(sql`
          UPDATE scraped_data_staging 
          SET validation_errors = ARRAY['Processing failed: ' || ${error.message}]
          WHERE id = ${record.id}
        `);
      }
    }

    console.log(`✅ Processed ${processedCount} scraped records`);
    return processedCount;
  }

  /**
   * Process import eligibility data into main table
   */
  private async processImportEligibilityData(data: any): Promise<void> {
    const record = {
      make: data.make,
      model: data.model,
      year: data.year,
      country_destination: data.country_destination,
      eligibility_status: data.eligibility_status,
      regulatory_authority: data.regulatory_authority,
      twenty_five_year_rule: data.twenty_five_year_rule,
      requirements: data.requirements,
      source_url: data.source_url,
      confidence_score: data.quality_score || 0
    };

    await db.execute(sql`
      INSERT INTO import_eligibility_data 
      (make, model, year, country_destination, eligibility_status, regulatory_authority, 
       twenty_five_year_rule, requirements, source_url, confidence_score)
      VALUES (${record.make}, ${record.model}, ${record.year}, ${record.country_destination},
              ${record.eligibility_status}, ${record.regulatory_authority}, 
              ${record.twenty_five_year_rule}, ${record.requirements}, ${record.source_url}, ${record.confidence_score})
      ON CONFLICT (make, model, year, country_destination) 
      DO UPDATE SET 
        eligibility_status = EXCLUDED.eligibility_status,
        regulatory_authority = EXCLUDED.regulatory_authority,
        twenty_five_year_rule = EXCLUDED.twenty_five_year_rule,
        requirements = EXCLUDED.requirements,
        source_url = EXCLUDED.source_url,
        confidence_score = EXCLUDED.confidence_score,
        last_updated = NOW()
    `);
  }

  /**
   * Process customs duty data into main table
   */
  private async processCustomsDutyData(data: any): Promise<void> {
    const record = {
      country: data.country,
      hts_code: data.hts_code || null,
      tariff_code: data.tariff_code || null,
      description: data.description,
      duty_rate_percent: data.duty_rate_percent,
      vehicle_category: data.vehicle_category,
      additional_fees: data.additional_fees,
      gst_rate_percent: data.gst_rate_percent || null,
      vat_rate_percent: data.vat_rate_percent || null,
      luxury_tax_threshold: data.luxury_tax_threshold || null,
      luxury_tax_rate: data.luxury_tax_rate || null,
      effective_date: data.effective_date,
      source: data.source
    };

    await db.execute(sql`
      INSERT INTO customs_duty_rates 
      (country, hts_code, tariff_code, description, duty_rate_percent, vehicle_category,
       additional_fees, gst_rate_percent, vat_rate_percent, luxury_tax_threshold, 
       luxury_tax_rate, effective_date, source)
      VALUES (${record.country}, ${record.hts_code}, ${record.tariff_code}, ${record.description},
              ${record.duty_rate_percent}, ${record.vehicle_category}, ${record.additional_fees},
              ${record.gst_rate_percent}, ${record.vat_rate_percent}, ${record.luxury_tax_threshold},
              ${record.luxury_tax_rate}, ${record.effective_date}, ${record.source})
      ON CONFLICT (country, hts_code, tariff_code) 
      DO UPDATE SET 
        description = EXCLUDED.description,
        duty_rate_percent = EXCLUDED.duty_rate_percent,
        vehicle_category = EXCLUDED.vehicle_category,
        additional_fees = EXCLUDED.additional_fees,
        gst_rate_percent = EXCLUDED.gst_rate_percent,
        vat_rate_percent = EXCLUDED.vat_rate_percent,
        luxury_tax_threshold = EXCLUDED.luxury_tax_threshold,
        luxury_tax_rate = EXCLUDED.luxury_tax_rate,
        effective_date = EXCLUDED.effective_date,
        source = EXCLUDED.source,
        last_updated = NOW()
    `);
  }

  /**
   * Get import eligibility for a specific vehicle
   */
  async getImportEligibility(make: string, model: string, year: number, country: string): Promise<any> {
    const result = await db.execute(sql`
      SELECT * FROM import_eligibility_data
      WHERE make ILIKE ${make} 
        AND (model ILIKE ${model} OR model IS NULL)
        AND (year = ${year} OR year IS NULL)
        AND country_destination ILIKE ${country}
      ORDER BY confidence_score DESC, last_updated DESC
      LIMIT 1
    `);

    return result[0] || null;
  }

  /**
   * Get customs duty rates for a vehicle
   */
  async getCustomsDutyRates(country: string, vehicleCategory: string = 'passenger_car'): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT * FROM customs_duty_rates
      WHERE country ILIKE ${country}
        AND (vehicle_category = ${vehicleCategory} OR vehicle_category IS NULL)
      ORDER BY last_updated DESC
    `);

    return result;
  }

  /**
   * Update data quality metrics
   */
  async updateDataQualityMetrics(): Promise<void> {
    const sources = ['import_eligibility', 'customs_duty_rates', 'government_auctions', 'insurance_auctions'];

    for (const source of sources) {
      const metrics = await db.execute(sql`
        SELECT 
          COUNT(*) as total_records,
          COUNT(*) FILTER (WHERE processed = true) as valid_records,
          AVG(quality_score) as avg_quality_score
        FROM scraped_data_staging
        WHERE source = ${source} AND scraped_at > CURRENT_DATE
      `);

      if (metrics[0]?.total_records > 0) {
        const validationRate = metrics[0].valid_records / metrics[0].total_records;
        
        await db.execute(sql`
          INSERT INTO data_quality_metrics 
          (source, total_records, valid_records, validation_rate, average_quality_score)
          VALUES (${source}, ${metrics[0].total_records}, ${metrics[0].valid_records}, 
                  ${validationRate}, ${metrics[0].avg_quality_score || 0})
          ON CONFLICT (source, metric_date) 
          DO UPDATE SET 
            total_records = EXCLUDED.total_records,
            valid_records = EXCLUDED.valid_records,
            validation_rate = EXCLUDED.validation_rate,
            average_quality_score = EXCLUDED.average_quality_score
        `);
      }
    }
  }

  /**
   * Run manual scraping job
   */
  async runManualJob(jobType: string): Promise<ScrapingJobResult> {
    console.log(`🔧 Running manual ${jobType} scraping job...`);
    
    try {
      // This would integrate with the Python scraper
      // For now, return a mock result showing the integration structure
      
      const result: ScrapingJobResult = {
        jobType,
        status: 'success',
        recordsFound: 0,
        executionTime: 0,
        errors: [],
        dataQualityScore: 0,
        timestamp: new Date().toISOString()
      };

      // Log the job execution
      await db.execute(sql`
        INSERT INTO scraping_log 
        (source, job_type, status, records_found, execution_time_seconds, quality_score, started_at)
        VALUES (${jobType}, 'manual', ${result.status}, ${result.recordsFound}, 
                ${result.executionTime}, ${result.dataQualityScore}, NOW())
      `);

      return result;

    } catch (error) {
      console.error(`Manual ${jobType} job failed:`, error);
      
      const result: ScrapingJobResult = {
        jobType,
        status: 'failed',
        recordsFound: 0,
        executionTime: 0,
        errors: [error.message],
        dataQualityScore: 0,
        timestamp: new Date().toISOString()
      };

      await db.execute(sql`
        INSERT INTO scraping_log 
        (source, job_type, status, errors, started_at)
        VALUES (${jobType}, 'manual', ${result.status}, ARRAY[${error.message}], NOW())
      `);

      return result;
    }
  }
}

// Initialize the scraping system integration
export const scrapingSystem = ScrapingSystemManager.getInstance();