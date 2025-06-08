/**
 * Data Seeder - Populate PostgreSQL with authentic global vehicle import data
 * Migrates data from CSV/YAML files to database tables
 */

import { db } from "./db";
import { vinPatterns, shippingRoutes, complianceRules, geographicCoverage } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VINPatternData {
  [wmiCode: string]: {
    manufacturer: string;
    country: string;
    countryCode: string;
    vehicleType: string;
    confidence: number;
    source: string;
  };
}

interface ShippingData {
  origin_port: string;
  destination_port: string;
  origin_country: string;
  destination_country: string;
  estimated_cost_usd: string;
  transit_days: string;
  service_type: string;
  confidence: string;
  last_updated: string;
  source: string;
}

export class DataSeeder {
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, 'data');
  }

  async seedAllData(): Promise<void> {
    console.log('Starting data seeding process...');
    
    try {
      await this.seedVINPatterns();
      await this.seedShippingRoutes();
      await this.seedComplianceRules();
      await this.seedGeographicCoverage();
      
      console.log('Data seeding completed successfully');
    } catch (error) {
      console.error('Data seeding failed:', error);
      throw error;
    }
  }

  async seedVINPatterns(): Promise<void> {
    console.log('Seeding VIN patterns...');
    
    const vinPatternsPath = path.join(this.dataPath, 'vin_patterns.json');
    
    if (!fs.existsSync(vinPatternsPath)) {
      console.log('VIN patterns file not found, skipping...');
      return;
    }

    const vinData = JSON.parse(fs.readFileSync(vinPatternsPath, 'utf8')) as VINPatternData;
    
    const patterns = Object.entries(vinData).map(([wmiCode, data]) => ({
      wmiCode,
      manufacturer: data.manufacturer,
      country: data.country,
      countryCode: data.countryCode,
      vehicleType: data.vehicleType,
      confidence: data.confidence,
      source: data.source,
      sourceUrl: `https://www.nhtsa.gov/vin-decoder`,
      lastVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Clear existing data
    await db.delete(vinPatterns);
    
    // Insert new data in batches
    const batchSize = 50;
    for (let i = 0; i < patterns.length; i += batchSize) {
      const batch = patterns.slice(i, i + batchSize);
      await db.insert(vinPatterns).values(batch);
    }
    
    console.log(`Seeded ${patterns.length} VIN patterns`);
  }

  async seedShippingRoutes(): Promise<void> {
    console.log('Seeding shipping routes...');
    
    const shippingPath = path.join(this.dataPath, 'shipping_estimates.csv');
    
    if (!fs.existsSync(shippingPath)) {
      console.log('Shipping estimates file not found, skipping...');
      return;
    }

    const csvContent = fs.readFileSync(shippingPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const headers = lines[0].split(',');
    
    const routes = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim();
      });
      return row as ShippingData;
    }).filter(route => route.origin_port && route.destination_port).map(route => ({
      originPort: route.origin_port,
      destinationPort: route.destination_port,
      originCountry: route.origin_country,
      destinationCountry: route.destination_country,
      estimatedCostUsd: Math.round(parseFloat(route.estimated_cost_usd) * 100), // Convert to cents
      transitDays: parseInt(route.transit_days),
      serviceType: route.service_type,
      confidence: parseInt(route.confidence),
      source: route.source,
      sourceUrl: null,
      lastUpdated: new Date(),
      createdAt: new Date()
    }));

    // Clear existing data
    await db.delete(shippingRoutes);
    
    // Insert new data in batches
    const batchSize = 50;
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      await db.insert(shippingRoutes).values(batch);
    }
    
    console.log(`Seeded ${routes.length} shipping routes`);
  }

  async seedComplianceRules(): Promise<void> {
    console.log('Seeding compliance rules...');
    
    const compliancePath = path.join(this.dataPath, 'compliance_rules.yaml');
    
    if (!fs.existsSync(compliancePath)) {
      console.log('Compliance rules file not found, skipping...');
      return;
    }

    const yamlContent = fs.readFileSync(compliancePath, 'utf8');
    const data = yaml.load(yamlContent) as any;
    
    const rules = Object.entries(data)
      .filter(([key]) => !['admin_overrides', 'data_quality', 'disclaimer'].includes(key))
      .map(([countryKey, countryData]: [string, any]) => {
        const general = countryData.general_rules || {};
        const requirements = countryData.requirements || [];
        const costs = countryData.estimated_costs || {};
        const notes = countryData.special_notes || [];
        
        return {
          country: this.formatCountryName(countryKey),
          countryCode: this.getCountryCode(countryKey),
          minimumAge: general.minimum_age || null,
          maximumAge: general.maximum_age || null,
          leftHandDriveAllowed: general.left_hand_drive_allowed !== false && 
                               general.left_hand_drive_preferred !== false && 
                               general.left_hand_drive_restricted !== true,
          requirements: Array.isArray(requirements) ? requirements : [],
          estimatedCosts: costs,
          specialNotes: Array.isArray(notes) ? notes : [],
          confidence: general.confidence || 70,
          source: general.source || 'Government Transport Authority',
          sourceUrl: null,
          lastUpdated: new Date(),
          createdAt: new Date()
        };
      });

    // Clear existing data
    await db.delete(complianceRules);
    
    // Insert new data
    if (rules.length > 0) {
      await db.insert(complianceRules).values(rules);
    }
    
    console.log(`Seeded ${rules.length} compliance rules`);
  }

  async seedGeographicCoverage(): Promise<void> {
    console.log('Seeding geographic coverage...');
    
    // Get unique countries from shipping routes and compliance rules
    const shippingCountries = await db
      .selectDistinct({ 
        originCountry: shippingRoutes.originCountry,
        destinationCountry: shippingRoutes.destinationCountry
      })
      .from(shippingRoutes);
    
    const complianceCountries = await db
      .selectDistinct({ country: complianceRules.country, countryCode: complianceRules.countryCode })
      .from(complianceRules);

    const vinCountries = await db
      .selectDistinct({ country: vinPatterns.country, countryCode: vinPatterns.countryCode })
      .from(vinPatterns);

    // Build comprehensive country list
    const allCountries = new Map<string, any>();
    
    // Add from shipping data
    shippingCountries.forEach(row => {
      if (row.originCountry) {
        allCountries.set(row.originCountry, { 
          name: row.originCountry, 
          hasShipping: true, 
          hasCompliance: false, 
          hasVin: false 
        });
      }
      if (row.destinationCountry) {
        allCountries.set(row.destinationCountry, { 
          name: row.destinationCountry, 
          hasShipping: true, 
          hasCompliance: false, 
          hasVin: false 
        });
      }
    });

    // Add from compliance data
    complianceCountries.forEach(row => {
      const existing = allCountries.get(row.country) || { name: row.country, hasShipping: false, hasCompliance: false, hasVin: false };
      existing.hasCompliance = true;
      existing.countryCode = row.countryCode;
      allCountries.set(row.country, existing);
    });

    // Add from VIN data
    vinCountries.forEach(row => {
      const existing = allCountries.get(row.country) || { name: row.country, hasShipping: false, hasCompliance: false, hasVin: false };
      existing.hasVin = true;
      existing.countryCode = row.countryCode;
      allCountries.set(row.country, existing);
    });

    const coverage = Array.from(allCountries.values()).map(country => {
      const score = (country.hasShipping ? 33 : 0) + (country.hasCompliance ? 33 : 0) + (country.hasVin ? 34 : 0);
      const priority = score >= 67 ? 'high' : score >= 34 ? 'medium' : 'low';
      
      return {
        countryCode: country.countryCode || this.getCountryCode(country.name),
        countryName: country.name,
        hasShippingData: country.hasShipping,
        hasComplianceData: country.hasCompliance,
        hasVinSupport: country.hasVin,
        coverageScore: score,
        demandPriority: priority,
        lastDataUpdate: new Date(),
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Clear existing data
    await db.delete(geographicCoverage);
    
    // Insert new data
    if (coverage.length > 0) {
      await db.insert(geographicCoverage).values(coverage);
    }
    
    console.log(`Seeded ${coverage.length} geographic coverage records`);
  }

  private formatCountryName(key: string): string {
    const nameMap: { [key: string]: string } = {
      'australia': 'Australia',
      'united_states': 'United States',
      'canada': 'Canada',
      'united_kingdom': 'United Kingdom',
      'germany': 'Germany',
      'france': 'France',
      'italy': 'Italy',
      'netherlands': 'Netherlands',
      'belgium': 'Belgium',
      'south_korea': 'South Korea',
      'new_zealand': 'New Zealand',
      'united_arab_emirates': 'United Arab Emirates',
      'south_africa': 'South Africa',
      'japan': 'Japan',
      'norway': 'Norway',
      'sweden': 'Sweden',
      'switzerland': 'Switzerland',
      'austria': 'Austria'
    };
    
    return nameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getCountryCode(countryKey: string): string {
    const codeMap: { [key: string]: string } = {
      'australia': 'AU', 'united_states': 'US', 'canada': 'CA', 'united_kingdom': 'GB',
      'germany': 'DE', 'france': 'FR', 'italy': 'IT', 'netherlands': 'NL',
      'belgium': 'BE', 'south_korea': 'KR', 'new_zealand': 'NZ', 'united_arab_emirates': 'AE',
      'south_africa': 'ZA', 'japan': 'JP', 'norway': 'NO', 'sweden': 'SE',
      'switzerland': 'CH', 'austria': 'AT', 'USA': 'US', 'UK': 'GB',
      'Japan': 'JP', 'Australia': 'AU', 'Canada': 'CA', 'Germany': 'DE',
      'France': 'FR', 'Italy': 'IT', 'Netherlands': 'NL', 'Belgium': 'BE',
      'South Korea': 'KR', 'New Zealand': 'NZ', 'UAE': 'AE', 'South Africa': 'ZA',
      'Norway': 'NO', 'Sweden': 'SE', 'Switzerland': 'CH', 'Austria': 'AT'
    };
    
    return codeMap[countryKey] || 'XX';
  }

  async getSeededDataSummary(): Promise<any> {
    const [vinCount] = await db.select({ count: 'count(*)' }).from(vinPatterns);
    const [shippingCount] = await db.select({ count: 'count(*)' }).from(shippingRoutes);
    const [complianceCount] = await db.select({ count: 'count(*)' }).from(complianceRules);
    const [coverageCount] = await db.select({ count: 'count(*)' }).from(geographicCoverage);
    
    return {
      vinPatterns: parseInt(vinCount.count as string),
      shippingRoutes: parseInt(shippingCount.count as string),
      complianceRules: parseInt(complianceCount.count as string),
      geographicCoverage: parseInt(coverageCount.count as string),
      lastSeeded: new Date().toISOString()
    };
  }
}

export const dataSeeder = new DataSeeder();