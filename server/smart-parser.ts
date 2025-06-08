/**
 * Smart Parser Result System - Trust-First Global Data Management
 * Handles fallback chaining, partial matches, and elegant data gap handling
 */

import { db } from "./db";
import { vinPatterns, shippingRoutes, complianceRules, vehicleLookupRequests, geographicCoverage } from "@shared/schema";
import { eq, and, like, desc } from "drizzle-orm";

export interface SmartParseResult {
  success: boolean;
  confidence: number;
  data: any;
  source: string;
  gaps: DataGap[];
  suggestions: ActionSuggestion[];
  fallbackChain: string[];
  processingTime: number;
  adminOverride?: boolean;
}

export interface DataGap {
  type: 'missing_shipping' | 'missing_compliance' | 'missing_vin' | 'low_confidence';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
  contributionUrl?: string;
}

export interface ActionSuggestion {
  type: 'alternative_route' | 'similar_country' | 'contribute_data' | 'contact_support';
  title: string;
  description: string;
  actionUrl?: string;
  priority: number;
}

export class SmartParser {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Parse VIN with intelligent fallback and gap analysis
   */
  async parseVIN(vin: string): Promise<SmartParseResult> {
    const fallbackChain: string[] = [];
    const gaps: DataGap[] = [];
    const suggestions: ActionSuggestion[] = [];

    try {
      // Primary: Exact WMI match
      const wmiCode = vin.substring(0, 3);
      fallbackChain.push(`Exact WMI match: ${wmiCode}`);

      const [exactMatch] = await db
        .select()
        .from(vinPatterns)
        .where(eq(vinPatterns.wmiCode, wmiCode))
        .limit(1);

      if (exactMatch) {
        return this.buildResult({
          success: true,
          confidence: exactMatch.confidence,
          data: {
            make: exactMatch.manufacturer,
            country: exactMatch.country,
            countryCode: exactMatch.countryCode,
            type: exactMatch.vehicleType,
            year: this.extractYearFromVIN(vin),
            source: exactMatch.source
          },
          source: "Database Exact Match",
          gaps,
          suggestions,
          fallbackChain
        });
      }

      // Fallback: Partial WMI match
      fallbackChain.push(`Partial WMI search: ${wmiCode.substring(0, 2)}*`);
      const partialMatches = await db
        .select()
        .from(vinPatterns)
        .where(like(vinPatterns.wmiCode, `${wmiCode.substring(0, 2)}%`))
        .orderBy(desc(vinPatterns.confidence))
        .limit(3);

      if (partialMatches.length > 0) {
        const bestMatch = partialMatches[0];
        gaps.push({
          type: 'missing_vin',
          description: `Exact WMI code ${wmiCode} not found, using similar pattern ${bestMatch.wmiCode}`,
          impact: 'medium',
          suggestedAction: 'Verify manufacturer details manually',
          contributionUrl: '/contribute/vin-patterns'
        });

        suggestions.push({
          type: 'contribute_data',
          title: 'Help us improve VIN coverage',
          description: `WMI code ${wmiCode} is not in our database. You can help by contributing this pattern.`,
          actionUrl: '/contribute/vin-patterns',
          priority: 1
        });

        return this.buildResult({
          success: true,
          confidence: Math.max(bestMatch.confidence - 20, 50),
          data: {
            make: bestMatch.manufacturer,
            country: bestMatch.country,
            countryCode: bestMatch.countryCode,
            type: bestMatch.vehicleType,
            year: this.extractYearFromVIN(vin),
            source: bestMatch.source,
            note: `Partial match - exact WMI ${wmiCode} not found`
          },
          source: "Database Partial Match",
          gaps,
          suggestions,
          fallbackChain
        });
      }

      // Final fallback: Generic patterns
      fallbackChain.push("Generic manufacturer detection");
      const genericData = this.applyGenericVINRules(vin);
      
      gaps.push({
        type: 'missing_vin',
        description: `VIN pattern ${wmiCode} not found in database`,
        impact: 'high',
        suggestedAction: 'Manual verification required',
        contributionUrl: '/contribute/vin-patterns'
      });

      suggestions.push({
        type: 'contribute_data',
        title: 'Unknown VIN pattern detected',
        description: 'This VIN pattern is not in our database. Contributing it will help other users.',
        actionUrl: '/contribute/vin-patterns',
        priority: 1
      });

      return this.buildResult({
        success: true,
        confidence: 30,
        data: genericData,
        source: "Generic Pattern Analysis",
        gaps,
        suggestions,
        fallbackChain
      });

    } catch (error) {
      return this.buildResult({
        success: false,
        confidence: 0,
        data: null,
        source: "Error",
        gaps: [{
          type: 'missing_vin',
          description: `VIN parsing failed: ${error}`,
          impact: 'critical',
          suggestedAction: 'Check VIN format and try again'
        }],
        suggestions: [{
          type: 'contact_support',
          title: 'Need help with VIN lookup?',
          description: 'Our support team can help identify this vehicle manually.',
          actionUrl: '/contact',
          priority: 1
        }],
        fallbackChain
      });
    }
  }

  /**
   * Find shipping routes with intelligent alternatives
   */
  async findShippingRoutes(originCountry: string, destinationCountry: string): Promise<SmartParseResult> {
    const fallbackChain: string[] = [];
    const gaps: DataGap[] = [];
    const suggestions: ActionSuggestion[] = [];

    try {
      // Primary: Direct routes
      fallbackChain.push(`Direct routes: ${originCountry} → ${destinationCountry}`);
      
      const directRoutes = await db
        .select()
        .from(shippingRoutes)
        .where(and(
          eq(shippingRoutes.originCountry, originCountry),
          eq(shippingRoutes.destinationCountry, destinationCountry)
        ))
        .orderBy(desc(shippingRoutes.confidence));

      if (directRoutes.length > 0) {
        return this.buildResult({
          success: true,
          confidence: Math.min(...directRoutes.map(r => r.confidence)),
          data: directRoutes.map(route => ({
            originPort: route.originPort,
            destinationPort: route.destinationPort,
            estimatedCostUSD: route.estimatedCostUsd / 100,
            transitDays: route.transitDays,
            serviceType: route.serviceType,
            confidence: route.confidence,
            source: route.source
          })),
          source: "Database Direct Routes",
          gaps,
          suggestions,
          fallbackChain
        });
      }

      // Fallback: Similar destination country routes
      fallbackChain.push(`Similar routes from ${originCountry}`);
      const similarRoutes = await db
        .select()
        .from(shippingRoutes)
        .where(eq(shippingRoutes.originCountry, originCountry))
        .orderBy(desc(shippingRoutes.confidence))
        .limit(5);

      if (similarRoutes.length > 0) {
        gaps.push({
          type: 'missing_shipping',
          description: `No direct shipping routes found from ${originCountry} to ${destinationCountry}`,
          impact: 'high',
          suggestedAction: 'Consider alternative destination ports or shipping methods',
          contributionUrl: '/contribute/shipping-routes'
        });

        suggestions.push({
          type: 'alternative_route',
          title: 'Alternative shipping destinations',
          description: `We found routes from ${originCountry} to other countries. These may help estimate costs.`,
          priority: 1
        });

        return this.buildResult({
          success: true,
          confidence: 40,
          data: similarRoutes.map(route => ({
            originPort: route.originPort,
            destinationPort: route.destinationPort,
            destinationCountry: route.destinationCountry,
            estimatedCostUSD: route.estimatedCostUsd / 100,
            transitDays: route.transitDays,
            serviceType: route.serviceType,
            confidence: route.confidence - 30,
            source: route.source,
            note: "Alternative destination - adjust for your target country"
          })),
          source: "Database Similar Routes",
          gaps,
          suggestions,
          fallbackChain
        });
      }

      // No routes found
      gaps.push({
        type: 'missing_shipping',
        description: `No shipping routes found from ${originCountry}`,
        impact: 'critical',
        suggestedAction: 'Contact shipping providers directly or use alternative origin country',
        contributionUrl: '/contribute/shipping-routes'
      });

      suggestions.push({
        type: 'contribute_data',
        title: 'Missing shipping data',
        description: `Help expand coverage by contributing shipping routes from ${originCountry}.`,
        actionUrl: '/contribute/shipping-routes',
        priority: 1
      });

      return this.buildResult({
        success: false,
        confidence: 0,
        data: null,
        source: "No Data Available",
        gaps,
        suggestions,
        fallbackChain
      });

    } catch (error) {
      return this.buildResult({
        success: false,
        confidence: 0,
        data: null,
        source: "Error",
        gaps: [{
          type: 'missing_shipping',
          description: `Shipping route lookup failed: ${error}`,
          impact: 'critical',
          suggestedAction: 'Try again or contact support'
        }],
        suggestions: [{
          type: 'contact_support',
          title: 'Technical issue detected',
          description: 'Our team can help resolve this shipping lookup problem.',
          actionUrl: '/contact',
          priority: 1
        }],
        fallbackChain
      });
    }
  }

  /**
   * Get compliance rules with regional alternatives
   */
  async getComplianceRules(countryCode: string, vehicleYear?: number): Promise<SmartParseResult> {
    const fallbackChain: string[] = [];
    const gaps: DataGap[] = [];
    const suggestions: ActionSuggestion[] = [];

    try {
      fallbackChain.push(`Direct lookup: ${countryCode}`);
      
      const [rules] = await db
        .select()
        .from(complianceRules)
        .where(eq(complianceRules.countryCode, countryCode))
        .limit(1);

      if (rules) {
        return this.buildResult({
          success: true,
          confidence: rules.confidence,
          data: {
            country: rules.country,
            minimumAge: rules.minimumAge,
            maximumAge: rules.maximumAge,
            leftHandDriveAllowed: rules.leftHandDriveAllowed,
            requirements: rules.requirements,
            estimatedCosts: rules.estimatedCosts,
            specialNotes: rules.specialNotes,
            source: rules.source
          },
          source: "Database Compliance Rules",
          gaps,
          suggestions,
          fallbackChain
        });
      }

      gaps.push({
        type: 'missing_compliance',
        description: `Compliance rules for ${countryCode} not available`,
        impact: 'critical',
        suggestedAction: 'Contact local transport authority or import specialist',
        contributionUrl: '/contribute/compliance-rules'
      });

      suggestions.push({
        type: 'contribute_data',
        title: 'Missing compliance data',
        description: `Help other importers by contributing compliance rules for ${countryCode}.`,
        actionUrl: '/contribute/compliance-rules',
        priority: 1
      });

      return this.buildResult({
        success: false,
        confidence: 0,
        data: null,
        source: "No Data Available",
        gaps,
        suggestions,
        fallbackChain
      });

    } catch (error) {
      return this.buildResult({
        success: false,
        confidence: 0,
        data: null,
        source: "Error",
        gaps: [{
          type: 'missing_compliance',
          description: `Compliance lookup failed: ${error}`,
          impact: 'critical',
          suggestedAction: 'Try again or contact support'
        }],
        suggestions: [],
        fallbackChain
      });
    }
  }

  /**
   * Get geographic coverage matrix
   */
  async getCoverageMatrix(): Promise<SmartParseResult> {
    try {
      const coverage = await db.select().from(geographicCoverage);
      
      return this.buildResult({
        success: true,
        confidence: 100,
        data: coverage.map(c => ({
          countryCode: c.countryCode,
          countryName: c.countryName,
          hasShippingData: c.hasShippingData,
          hasComplianceData: c.hasComplianceData,
          hasVinSupport: c.hasVinSupport,
          coverageScore: c.coverageScore,
          demandPriority: c.demandPriority
        })),
        source: "Geographic Coverage Database",
        gaps: [],
        suggestions: [],
        fallbackChain: ["Coverage matrix lookup"]
      });
    } catch (error) {
      return this.buildResult({
        success: false,
        confidence: 0,
        data: null,
        source: "Error",
        gaps: [],
        suggestions: [],
        fallbackChain: []
      });
    }
  }

  private buildResult(params: Omit<SmartParseResult, 'processingTime'>): SmartParseResult {
    return {
      ...params,
      processingTime: Date.now() - this.startTime
    };
  }

  private extractYearFromVIN(vin: string): number | null {
    if (vin.length < 10) return null;
    
    const yearChar = vin.charAt(9);
    const yearMap: { [key: string]: number } = {
      'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984, 'F': 1985, 'G': 1986, 'H': 1987,
      'J': 1988, 'K': 1989, 'L': 1990, 'M': 1991, 'N': 1992, 'P': 1993, 'R': 1994, 'S': 1995,
      'T': 1996, 'V': 1997, 'W': 1998, 'X': 1999, 'Y': 2000, '1': 2001, '2': 2002, '3': 2003,
      '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009, 'A': 2010, 'B': 2011,
      'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025
    };

    return yearMap[yearChar] || null;
  }

  private applyGenericVINRules(vin: string): any {
    const firstChar = vin.charAt(0);
    
    // Generic country detection based on first character
    const countryMap: { [key: string]: { country: string, code: string } } = {
      '1': { country: 'United States', code: 'US' },
      '2': { country: 'Canada', code: 'CA' },
      '3': { country: 'Mexico', code: 'MX' },
      'J': { country: 'Japan', code: 'JP' },
      'K': { country: 'South Korea', code: 'KR' },
      'L': { country: 'China', code: 'CN' },
      'S': { country: 'United Kingdom', code: 'GB' },
      'W': { country: 'Germany', code: 'DE' },
      'V': { country: 'France', code: 'FR' },
      'Z': { country: 'Italy', code: 'IT' }
    };

    const detected = countryMap[firstChar] || { country: 'Unknown', code: 'XX' };
    
    return {
      make: 'Unknown',
      country: detected.country,
      countryCode: detected.code,
      type: 'Passenger Car',
      year: this.extractYearFromVIN(vin),
      source: 'Generic VIN Pattern Analysis'
    };
  }
}

export const smartParser = new SmartParser();