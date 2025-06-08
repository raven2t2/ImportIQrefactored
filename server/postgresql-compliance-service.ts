/**
 * PostgreSQL Compliance Service
 * Replaces all hardcoded compliance data with authentic PostgreSQL persistence
 * Serves as the single source of truth for global vehicle import regulations
 */

import { db } from './db';
import { sql } from 'drizzle-orm';
import { globalComplianceRules, vehicleEligibilityRules } from '@shared/schema';

export interface ComplianceResult {
  country: string;
  eligible: boolean;
  minimumAge: number;
  specialRequirements: string[];
  complianceCost: number;
  processingTimeWeeks: number;
  exemptions: any;
  sourceDocument: string;
  lastUpdated: string;
}

export interface GlobalEligibilityCheck {
  vehicleAge: number;
  eligibility: Record<string, ComplianceResult>;
  recommendedDestinations: string[];
  totalCountriesChecked: number;
}

export class PostgreSQLComplianceService {
  
  /**
   * Get comprehensive global eligibility for a vehicle across all countries
   */
  static async getGlobalEligibility(vehicleYear: number): Promise<GlobalEligibilityCheck> {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicleYear;
    
    // Get all compliance rules from PostgreSQL
    const rules = await db.execute(sql`
      SELECT DISTINCT ON (country) 
        country, rule_type, minimum_age_years, maximum_age_years,
        special_requirements, exemptions, compliance_cost, 
        processing_time_weeks, source_document, last_updated
      FROM global_compliance_rules 
      WHERE is_active = true
      ORDER BY country, rule_type
    `);
    
    const eligibility: Record<string, ComplianceResult> = {};
    const recommendedDestinations: string[] = [];
    
    for (const rule of rules.rows) {
      const ruleData = rule as any;
      const minimumAge = ruleData.minimum_age_years || 0;
      const isEligible = vehicleAge >= minimumAge;
      
      eligibility[ruleData.country] = {
        country: ruleData.country,
        eligible: isEligible,
        minimumAge,
        specialRequirements: this.parseJsonField(ruleData.special_requirements),
        complianceCost: parseFloat(ruleData.compliance_cost) || 0,
        processingTimeWeeks: ruleData.processing_time_weeks || 0,
        exemptions: this.parseJsonField(ruleData.exemptions),
        sourceDocument: ruleData.source_document || 'Official Government Source',
        lastUpdated: ruleData.last_updated
      };
      
      if (isEligible) {
        recommendedDestinations.push(ruleData.country);
      }
    }
    
    return {
      vehicleAge,
      eligibility,
      recommendedDestinations: recommendedDestinations.slice(0, 5),
      totalCountriesChecked: rules.rows.length
    };
  }
  
  /**
   * Get specific country compliance requirements
   */
  static async getCountryCompliance(country: string, vehicleYear?: number): Promise<ComplianceResult[]> {
    const rules = await db.execute(sql`
      SELECT * FROM global_compliance_rules 
      WHERE country = ${country} AND is_active = true
      ORDER BY rule_type
    `);
    
    const currentYear = new Date().getFullYear();
    const vehicleAge = vehicleYear ? currentYear - vehicleYear : 0;
    
    return rules.rows.map((rule: any) => ({
      country: rule.country,
      eligible: vehicleAge >= (rule.minimum_age_years || 0),
      minimumAge: rule.minimum_age_years || 0,
      specialRequirements: this.parseJsonField(rule.special_requirements),
      complianceCost: parseFloat(rule.compliance_cost) || 0,
      processingTimeWeeks: rule.processing_time_weeks || 0,
      exemptions: this.parseJsonField(rule.exemptions),
      sourceDocument: rule.source_document || 'Official Government Source',
      lastUpdated: rule.last_updated
    }));
  }
  
  /**
   * Get regional compliance variations (states/provinces)
   */
  static async getRegionalCompliance(country: string, region?: string): Promise<ComplianceResult[]> {
    const whereClause = region 
      ? sql`WHERE country = ${country} AND region = ${region} AND is_active = true`
      : sql`WHERE country = ${country} AND region IS NOT NULL AND is_active = true`;
    
    const rules = await db.execute(sql`
      SELECT * FROM global_compliance_rules ${whereClause}
      ORDER BY region, rule_type
    `);
    
    return rules.rows.map((rule: any) => ({
      country: rule.country,
      eligible: true, // Regional rules are additional requirements
      minimumAge: rule.minimum_age_years || 0,
      specialRequirements: this.parseJsonField(rule.special_requirements),
      complianceCost: parseFloat(rule.compliance_cost) || 0,
      processingTimeWeeks: rule.processing_time_weeks || 0,
      exemptions: this.parseJsonField(rule.exemptions),
      sourceDocument: rule.source_document || 'Regional Authority',
      lastUpdated: rule.last_updated
    }));
  }
  
  /**
   * Calculate total compliance costs for a destination
   */
  static async calculateComplianceCosts(country: string, region?: string): Promise<{
    baseCost: number;
    regionalCost: number;
    totalCost: number;
    breakdown: Array<{rule: string, cost: number}>;
  }> {
    // Get base country costs
    const baseCosts = await db.execute(sql`
      SELECT rule_type, compliance_cost FROM global_compliance_rules 
      WHERE country = ${country} AND region IS NULL AND is_active = true
    `);
    
    // Get regional costs if specified
    const regionalCosts = region ? await db.execute(sql`
      SELECT rule_type, compliance_cost FROM global_compliance_rules 
      WHERE country = ${country} AND region = ${region} AND is_active = true
    `) : { rows: [] };
    
    const breakdown = [];
    let baseCost = 0;
    let regionalCost = 0;
    
    for (const rule of baseCosts.rows) {
      const cost = parseFloat((rule as any).compliance_cost) || 0;
      baseCost += cost;
      breakdown.push({ rule: (rule as any).rule_type, cost });
    }
    
    for (const rule of regionalCosts.rows) {
      const cost = parseFloat((rule as any).compliance_cost) || 0;
      regionalCost += cost;
      breakdown.push({ rule: `${region} ${(rule as any).rule_type}`, cost });
    }
    
    return {
      baseCost,
      regionalCost,
      totalCost: baseCost + regionalCost,
      breakdown
    };
  }
  
  /**
   * Search compliance rules by keywords
   */
  static async searchComplianceRules(keywords: string): Promise<ComplianceResult[]> {
    const rules = await db.execute(sql`
      SELECT * FROM global_compliance_rules 
      WHERE (
        LOWER(country) LIKE ${'%' + keywords.toLowerCase() + '%'} OR
        LOWER(rule_type) LIKE ${'%' + keywords.toLowerCase() + '%'} OR
        LOWER(source_document) LIKE ${'%' + keywords.toLowerCase() + '%'}
      ) AND is_active = true
      ORDER BY country, rule_type
    `);
    
    return rules.rows.map((rule: any) => ({
      country: rule.country,
      eligible: true,
      minimumAge: rule.minimum_age_years || 0,
      specialRequirements: this.parseJsonField(rule.special_requirements),
      complianceCost: parseFloat(rule.compliance_cost) || 0,
      processingTimeWeeks: rule.processing_time_weeks || 0,
      exemptions: this.parseJsonField(rule.exemptions),
      sourceDocument: rule.source_document || 'Government Source',
      lastUpdated: rule.last_updated
    }));
  }
  
  /**
   * Get compliance statistics and coverage
   */
  static async getComplianceStatistics(): Promise<{
    totalCountries: number;
    totalRegions: number;
    totalRules: number;
    lastUpdated: string;
    coverageByRuleType: Record<string, number>;
  }> {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT country) as total_countries,
        COUNT(DISTINCT region) as total_regions,
        COUNT(*) as total_rules,
        MAX(last_updated) as last_updated
      FROM global_compliance_rules 
      WHERE is_active = true
    `);
    
    const ruleTypes = await db.execute(sql`
      SELECT rule_type, COUNT(*) as count
      FROM global_compliance_rules 
      WHERE is_active = true
      GROUP BY rule_type
      ORDER BY count DESC
    `);
    
    const coverageByRuleType: Record<string, number> = {};
    for (const ruleType of ruleTypes.rows) {
      const rule = ruleType as any;
      coverageByRuleType[rule.rule_type] = parseInt(rule.count);
    }
    
    const statsData = stats.rows[0] as any;
    return {
      totalCountries: parseInt(statsData.total_countries),
      totalRegions: parseInt(statsData.total_regions) - 1, // Subtract NULL count
      totalRules: parseInt(statsData.total_rules),
      lastUpdated: statsData.last_updated,
      coverageByRuleType
    };
  }
  
  /**
   * Helper to safely parse JSON fields
   */
  private static parseJsonField(field: any): any {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    return field;
  }
}