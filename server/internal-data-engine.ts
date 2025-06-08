/**
 * Internal Data Engine - Trust-First Infrastructure
 * 100% internal data processing with confidence scores and admin overrides
 * Uses PostgreSQL with Smart Parser for intelligent fallback handling
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { smartParser } from './smart-parser';
import { dataSeeder } from './data-seeder';
import { db } from './db';
import { vehicleLookupRequests } from '@shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DataResponse {
  data: any;
  confidence: number;
  source: string;
  disclaimer?: string;
  adminOverride?: boolean;
  lastUpdated?: string;
}

export interface VINDecodeResult {
  make?: string;
  country?: string;
  type?: string;
  year?: number;
  confidence: number;
  source: string;
  pattern: string;
}

export interface ShippingEstimate {
  originPort: string;
  destinationPort: string;
  estimatedCostUSD: number;
  transitDays: number;
  serviceType: string;
  confidence: number;
  source: string;
}

export interface ComplianceRule {
  country: string;
  minimumAge?: number;
  maximumAge?: number;
  requirements: string[];
  exemptions?: any[];
  estimatedCosts: Record<string, number>;
  confidence: number;
  source: string;
}

class InternalDataEngine {
  private dataSeeded: boolean = false;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if data exists in database
      const summary = await dataSeeder.getSeededDataSummary();
      
      if (summary.vinPatterns === 0 || summary.shippingRoutes === 0) {
        console.log('Database empty - seeding with authentic global data...');
        await dataSeeder.seedAllData();
        console.log('Database seeding completed');
      } else {
        console.log('Database already contains seeded data:', summary);
      }
      
      this.dataSeeded = true;
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private loadShippingCSV(filePath: string) {
    try {
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim();
          });
          this.shippingData.push(row);
        }
      }
    } catch (error) {
      console.error('Error loading shipping CSV:', error);
    }
  }

  /**
   * Decode VIN using internal patterns
   */
  decodeVIN(vin: string): DataResponse {
    if (!vin || vin.length < 3) {
      return {
        data: null,
        confidence: 0,
        source: "Invalid VIN format",
        disclaimer: "VIN must be at least 3 characters"
      };
    }

    const wmi = vin.substring(0, 3).toUpperCase();
    const yearChar = vin.length >= 10 ? vin.charAt(9) : null;

    let result: VINDecodeResult = {
      pattern: wmi,
      confidence: 25,
      source: "Internal VIN Database"
    };

    // Check WMI database
    if (this.vinPatterns?.wmi_database?.[wmi]) {
      const wmiData = this.vinPatterns.wmi_database[wmi];
      result = {
        make: wmiData.make,
        country: wmiData.country,
        type: wmiData.type,
        confidence: wmiData.confidence || 95,
        source: this.vinPatterns.source || "NHTSA WMI Database",
        pattern: wmi
      };
    }

    // Decode year if available
    if (yearChar && this.vinPatterns?.year_decoding?.[yearChar]) {
      result.year = this.vinPatterns.year_decoding[yearChar];
      result.confidence = Math.min(result.confidence, 90); // Slightly lower for year estimation
    }

    return {
      data: result,
      confidence: result.confidence,
      source: result.source,
      disclaimer: this.vinPatterns?.disclaimer,
      lastUpdated: this.vinPatterns?.last_updated
    };
  }

  /**
   * Get shipping estimates for route
   */
  getShippingEstimate(originCountry: string, destinationCountry: string): DataResponse {
    const estimates = this.shippingData.filter(row => 
      row.origin_country?.toLowerCase() === originCountry.toLowerCase() &&
      row.destination_country?.toLowerCase() === destinationCountry.toLowerCase()
    );

    if (estimates.length === 0) {
      return {
        data: null,
        confidence: 0,
        source: "Internal Shipping Database",
        disclaimer: "No direct shipping routes found for this country pair"
      };
    }

    const processedEstimates = estimates.map(row => ({
      originPort: row.origin_port,
      destinationPort: row.destination_port,
      estimatedCostUSD: parseInt(row.estimated_cost_usd) || 0,
      transitDays: parseInt(row.transit_days) || 0,
      serviceType: row.service_type,
      confidence: parseInt(row.confidence) || 75,
      source: row.source || "Industry Standard Rates"
    }));

    const avgConfidence = processedEstimates.reduce((sum, est) => sum + est.confidence, 0) / processedEstimates.length;

    return {
      data: processedEstimates,
      confidence: Math.round(avgConfidence),
      source: "Internal Shipping Database",
      disclaimer: "Shipping costs are estimates and vary by carrier, season, and vehicle specifications",
      lastUpdated: "2025-06-08"
    };
  }

  /**
   * Get compliance rules for country and year
   */
  getComplianceRules(country: string, vehicleYear?: number): DataResponse {
    if (!this.complianceRules?.countries) {
      return {
        data: null,
        confidence: 0,
        source: "Internal Compliance Database",
        disclaimer: "Compliance data not available"
      };
    }

    const countryKey = country.toLowerCase().replace(/\s+/g, '_');
    const countryData = this.complianceRules.countries[countryKey];

    if (!countryData) {
      return {
        data: null,
        confidence: 0,
        source: "Internal Compliance Database",
        disclaimer: `No compliance data available for ${country}`
      };
    }

    let eligibleStatus = "Unknown";
    let applicableRules = countryData.general_rules;
    let exemptions: any[] = [];

    // Check eligibility if vehicle year provided
    if (vehicleYear && countryData.general_rules) {
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - vehicleYear;
      
      if (countryData.general_rules.minimum_age) {
        if (vehicleAge >= countryData.general_rules.minimum_age) {
          eligibleStatus = "Eligible";
        } else {
          eligibleStatus = "Not Eligible";
          
          // Check exemptions
          if (countryData.exemptions) {
            exemptions = countryData.exemptions.filter((exemption: any) => {
              return vehicleAge >= (exemption.minimum_age || 0);
            });
            
            if (exemptions.length > 0) {
              eligibleStatus = "Potentially Eligible (Exemption Required)";
            }
          }
        }
      }
    }

    const result = {
      country: country,
      eligibility: eligibleStatus,
      generalRules: applicableRules,
      exemptions: exemptions,
      requirements: countryData.compliance_requirements || [],
      estimatedCosts: countryData.estimated_costs || {},
      confidence: countryData.general_rules?.confidence || 75,
      source: countryData.general_rules?.source || "Government Transport Authority"
    };

    return {
      data: result,
      confidence: result.confidence,
      source: result.source,
      disclaimer: this.complianceRules.disclaimer,
      lastUpdated: countryData.general_rules?.last_updated
    };
  }

  /**
   * Apply admin override to any data response
   */
  applyAdminOverride(dataResponse: DataResponse, overrides: Record<string, any>): DataResponse {
    const modifiedResponse = { ...dataResponse };
    
    if (overrides.confidence !== undefined) {
      modifiedResponse.confidence = overrides.confidence;
    }
    
    if (overrides.data) {
      modifiedResponse.data = { ...modifiedResponse.data, ...overrides.data };
    }
    
    if (overrides.disclaimer) {
      modifiedResponse.disclaimer = overrides.disclaimer;
    }
    
    modifiedResponse.adminOverride = true;
    
    return modifiedResponse;
  }

  /**
   * Get data quality report
   */
  getDataQualityReport() {
    return {
      vinDatabase: {
        loaded: !!this.vinPatterns,
        recordCount: this.vinPatterns?.wmi_database ? Object.keys(this.vinPatterns.wmi_database).length : 0,
        lastUpdated: this.vinPatterns?.last_updated
      },
      shippingDatabase: {
        loaded: this.shippingData.length > 0,
        recordCount: this.shippingData.length,
        routeCoverage: [...new Set(this.shippingData.map(row => `${row.origin_country}-${row.destination_country}`))]
      },
      complianceDatabase: {
        loaded: !!this.complianceRules,
        countryCoverage: this.complianceRules?.countries ? Object.keys(this.complianceRules.countries) : [],
        overallConfidence: this.complianceRules?.data_quality?.overall_confidence
      }
    };
  }
}

// Singleton instance - lazy initialization
let _internalDataEngine: InternalDataEngine | null = null;

export function getInternalDataEngine(): InternalDataEngine {
  if (!_internalDataEngine) {
    _internalDataEngine = new InternalDataEngine();
  }
  return _internalDataEngine;
}

// For backward compatibility
export const internalDataEngine = {
  get decodeVIN() { return getInternalDataEngine().decodeVIN.bind(getInternalDataEngine()); },
  get getShippingEstimate() { return getInternalDataEngine().getShippingEstimate.bind(getInternalDataEngine()); },
  get getComplianceRules() { return getInternalDataEngine().getComplianceRules.bind(getInternalDataEngine()); },
  get getDataQualityReport() { return getInternalDataEngine().getDataQualityReport.bind(getInternalDataEngine()); },
  get applyAdminOverride() { return getInternalDataEngine().applyAdminOverride.bind(getInternalDataEngine()); }
};