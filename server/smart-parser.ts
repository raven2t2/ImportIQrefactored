/**
 * Smart Parser - PostgreSQL-Based Vehicle Intelligence Engine
 * Complete refactor: No in-memory stores, JSON files, or ad-hoc object maps
 * All data queries from PostgreSQL with confidence scoring and source attribution
 */

import { db } from './db';
import { 
  vehicleSpecs, 
  complianceRules, 
  shippingRoutes, 
  marketDataSamples, 
  exchangeRates, 
  fallbackKeywords,
  vehicleLookupRequests 
} from '@shared/schema';
import { eq, and, or, like, ilike, desc, asc } from 'drizzle-orm';

export interface SmartParserResponse {
  data: any;
  confidenceScore: number;
  sourceAttribution: string;
  fallbackSuggestions?: string[];
  lastUpdated?: string;
  disclaimer?: string;
}

export interface VINDecodeResult {
  make?: string;
  model?: string;
  year?: number;
  country?: string;
  chassisCode?: string;
  engine?: string;
  bodyType?: string;
  confidenceScore: number;
  sourceAttribution: string;
}

export interface ComplianceCheckResult {
  country: string;
  region?: string;
  isEligible: boolean;
  minimumAge?: number;
  maximumAge?: number;
  requirements: string[];
  estimatedCosts: any;
  specialNotes: string[];
  confidenceScore: number;
  sourceAttribution: string;
}

export interface ShippingEstimate {
  originCountry: string;
  destCountry: string;
  estCost: number;
  estDays: number;
  routeName: string;
  confidenceScore: number;
  sourceAttribution: string;
}

export interface MarketPricing {
  averagePrice: number;
  sampleCount: number;
  priceRange: { min: number; max: number };
  recentListings: any[];
  confidenceScore: number;
  sourceAttribution: string;
}

class PostgreSQLSmartParser {
  
  /**
   * Decode VIN using PostgreSQL vehicle_specs table
   */
  async decodeVIN(vin: string): Promise<SmartParserResponse> {
    try {
      // Log the lookup request for audit trail
      await this.logLookupRequest(vin, 'vin_decode');
      
      // Query exact VIN match first
      const exactMatch = await db
        .select()
        .from(vehicleSpecs)
        .where(eq(vehicleSpecs.vin, vin.toUpperCase()))
        .limit(1);

      if (exactMatch.length > 0) {
        const spec = exactMatch[0];
        return {
          data: {
            make: spec.make,
            model: spec.model,
            year: spec.year,
            country: spec.countryOfOrigin,
            chassisCode: spec.chassisCode,
            engine: spec.engine,
            bodyType: spec.bodyType
          },
          confidenceScore: spec.confidenceScore,
          sourceAttribution: spec.sourceAttribution,
          lastUpdated: spec.lastVerified?.toISOString()
        };
      }

      // Try partial VIN matching (first 11 characters for WMI + VDS)
      const partialVin = vin.substring(0, 11);
      const partialMatches = await db
        .select()
        .from(vehicleSpecs)
        .where(like(vehicleSpecs.vin, `${partialVin}%`))
        .orderBy(desc(vehicleSpecs.confidenceScore))
        .limit(5);

      if (partialMatches.length > 0) {
        const bestMatch = partialMatches[0];
        const fallbacks = await this.getFallbackSuggestions(vin, 'vin');
        
        return {
          data: {
            make: bestMatch.make,
            model: bestMatch.model,
            year: bestMatch.year,
            country: bestMatch.countryOfOrigin,
            chassisCode: bestMatch.chassisCode
          },
          confidenceScore: Math.max(bestMatch.confidenceScore - 20, 60), // Reduce confidence for partial match
          sourceAttribution: `${bestMatch.sourceAttribution} (Partial VIN match)`,
          fallbackSuggestions: fallbacks,
          disclaimer: "Partial VIN match - verify details with full vehicle inspection"
        };
      }

      // No matches found
      const fallbacks = await this.getFallbackSuggestions(vin, 'vin');
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "No VIN match found in database",
        fallbackSuggestions: fallbacks,
        disclaimer: "VIN not found - consider manual vehicle verification"
      };

    } catch (error) {
      console.error('VIN decode error:', error);
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "Database query error",
        disclaimer: "System error during VIN lookup"
      };
    }
  }

  /**
   * Check compliance using PostgreSQL compliance_rules table
   */
  async checkCompliance(country: string, vehicleYear?: number, region?: string): Promise<SmartParserResponse> {
    try {
      await this.logLookupRequest(`${country}-${vehicleYear}-${region}`, 'compliance_check');

      let query = db
        .select()
        .from(complianceRules)
        .where(eq(complianceRules.country, country.toLowerCase()));

      if (region) {
        query = query.where(
          or(
            eq(complianceRules.region, region.toLowerCase()),
            eq(complianceRules.region, null)
          )
        );
      }

      const rules = await query
        .orderBy(desc(complianceRules.confidenceScore))
        .limit(10);

      if (rules.length === 0) {
        const fallbacks = await this.getFallbackSuggestions(country, 'compliance');
        return {
          data: null,
          confidenceScore: 0,
          sourceAttribution: "No compliance rules found",
          fallbackSuggestions: fallbacks,
          disclaimer: "Country not supported - contact customs authority"
        };
      }

      const primaryRule = rules[0];
      const vehicleAge = vehicleYear ? new Date().getFullYear() - vehicleYear : 0;

      // Check age eligibility
      let isEligible = true;
      if (primaryRule.minimumAge && vehicleAge < primaryRule.minimumAge) {
        isEligible = false;
      }
      if (primaryRule.maximumAge && vehicleAge > primaryRule.maximumAge) {
        isEligible = false;
      }

      const result: ComplianceCheckResult = {
        country: primaryRule.country,
        region: primaryRule.region,
        isEligible,
        minimumAge: primaryRule.minimumAge,
        maximumAge: primaryRule.maximumAge,
        requirements: primaryRule.requirements || [],
        estimatedCosts: primaryRule.estimatedCosts || {},
        specialNotes: primaryRule.specialNotes || [],
        confidenceScore: primaryRule.confidenceScore,
        sourceAttribution: primaryRule.sourceAttribution
      };

      return {
        data: result,
        confidenceScore: primaryRule.confidenceScore,
        sourceAttribution: primaryRule.sourceAttribution,
        lastUpdated: primaryRule.lastUpdated?.toISOString(),
        disclaimer: isEligible ? undefined : "Vehicle may not meet import eligibility requirements"
      };

    } catch (error) {
      console.error('Compliance check error:', error);
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "Database query error",
        disclaimer: "System error during compliance check"
      };
    }
  }

  /**
   * Get shipping estimates using PostgreSQL shipping_routes table
   */
  async getShippingEstimate(originCountry: string, destCountry: string): Promise<SmartParserResponse> {
    try {
      await this.logLookupRequest(`${originCountry}-${destCountry}`, 'shipping_estimate');

      const routes = await db
        .select()
        .from(shippingRoutes)
        .where(
          and(
            eq(shippingRoutes.originCountry, originCountry.toLowerCase()),
            eq(shippingRoutes.destCountry, destCountry.toLowerCase())
          )
        )
        .orderBy(desc(shippingRoutes.confidenceScore))
        .limit(5);

      if (routes.length === 0) {
        const fallbacks = await this.getFallbackSuggestions(`${originCountry}-${destCountry}`, 'shipping');
        return {
          data: null,
          confidenceScore: 0,
          sourceAttribution: "No shipping routes found",
          fallbackSuggestions: fallbacks,
          disclaimer: "Route not available - contact freight forwarder"
        };
      }

      const bestRoute = routes[0];
      const estimate: ShippingEstimate = {
        originCountry: bestRoute.originCountry,
        destCountry: bestRoute.destCountry,
        estCost: bestRoute.estCost / 100, // Convert from cents
        estDays: bestRoute.estDays,
        routeName: bestRoute.routeName,
        confidenceScore: bestRoute.confidenceScore,
        sourceAttribution: bestRoute.sourceAttribution
      };

      return {
        data: estimate,
        confidenceScore: bestRoute.confidenceScore,
        sourceAttribution: bestRoute.sourceAttribution,
        lastUpdated: bestRoute.lastUpdated?.toISOString()
      };

    } catch (error) {
      console.error('Shipping estimate error:', error);
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "Database query error",
        disclaimer: "System error during shipping calculation"
      };
    }
  }

  /**
   * Get market pricing using PostgreSQL market_data_samples table
   */
  async getMarketPricing(make: string, model: string, year?: number): Promise<SmartParserResponse> {
    try {
      await this.logLookupRequest(`${make}-${model}-${year}`, 'market_pricing');

      let query = db
        .select()
        .from(marketDataSamples)
        .where(
          and(
            ilike(marketDataSamples.make, `%${make}%`),
            ilike(marketDataSamples.model, `%${model}%`)
          )
        );

      if (year) {
        query = query.where(eq(marketDataSamples.year, year));
      }

      const samples = await query
        .orderBy(desc(marketDataSamples.dateListed))
        .limit(50);

      if (samples.length === 0) {
        const fallbacks = await this.getFallbackSuggestions(`${make} ${model}`, 'market');
        return {
          data: null,
          confidenceScore: 0,
          sourceAttribution: "No market data found",
          fallbackSuggestions: fallbacks,
          disclaimer: "Insufficient market data for pricing analysis"
        };
      }

      const prices = samples.map(s => s.priceUsd / 100); // Convert from cents
      const averagePrice = prices.reduce((a, b) => a + b) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const pricing: MarketPricing = {
        averagePrice,
        sampleCount: samples.length,
        priceRange: { min: minPrice, max: maxPrice },
        recentListings: samples.slice(0, 10).map(s => ({
          auctionSite: s.auctionSite,
          carName: s.carName,
          price: s.priceUsd / 100,
          dateListed: s.dateListed,
          url: s.url
        })),
        confidenceScore: Math.min(samples.length * 2 + 60, 95), // Higher confidence with more samples
        sourceAttribution: `Market analysis from ${samples.length} auction listings`
      };

      return {
        data: pricing,
        confidenceScore: pricing.confidenceScore,
        sourceAttribution: pricing.sourceAttribution,
        lastUpdated: samples[0]?.dateListed?.toISOString()
      };

    } catch (error) {
      console.error('Market pricing error:', error);
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "Database query error",
        disclaimer: "System error during market analysis"
      };
    }
  }

  /**
   * Get current exchange rates from PostgreSQL
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<SmartParserResponse> {
    try {
      const rate = await db
        .select()
        .from(exchangeRates)
        .where(
          and(
            eq(exchangeRates.fromCurrency, fromCurrency.toUpperCase()),
            eq(exchangeRates.toCurrency, toCurrency.toUpperCase())
          )
        )
        .orderBy(desc(exchangeRates.timestamp))
        .limit(1);

      if (rate.length === 0) {
        return {
          data: null,
          confidenceScore: 0,
          sourceAttribution: "No exchange rate found",
          disclaimer: "Currency pair not available"
        };
      }

      return {
        data: {
          rate: parseFloat(rate[0].rate),
          fromCurrency: rate[0].fromCurrency,
          toCurrency: rate[0].toCurrency,
          timestamp: rate[0].timestamp
        },
        confidenceScore: rate[0].confidenceScore,
        sourceAttribution: rate[0].sourceAttribution,
        lastUpdated: rate[0].timestamp.toISOString()
      };

    } catch (error) {
      console.error('Exchange rate error:', error);
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "Database query error",
        disclaimer: "System error during currency lookup"
      };
    }
  }

  /**
   * Get fallback suggestions from PostgreSQL fallback_keywords table
   */
  private async getFallbackSuggestions(input: string, category: string): Promise<string[]> {
    try {
      const suggestions = await db
        .select()
        .from(fallbackKeywords)
        .where(
          and(
            or(
              ilike(fallbackKeywords.inputVariation, `%${input}%`),
              ilike(fallbackKeywords.normalizedModel, `%${input}%`)
            ),
            eq(fallbackKeywords.category, category)
          )
        )
        .orderBy(desc(fallbackKeywords.matchScore))
        .limit(5);

      return suggestions.map(s => s.normalizedModel);
    } catch (error) {
      console.error('Fallback suggestions error:', error);
      return [];
    }
  }

  /**
   * Log lookup request for audit trail and analytics
   */
  private async logLookupRequest(identifier: string, lookupType: string): Promise<void> {
    try {
      await db.insert(vehicleLookupRequests).values({
        identifier,
        lookupType,
        timestamp: new Date(),
        userAgent: 'SmartParser',
        ipAddress: '127.0.0.1'
      });
    } catch (error) {
      // Silent fail for logging - don't break main functionality
      console.error('Lookup logging error:', error);
    }
  }

  /**
   * Get comprehensive vehicle analysis combining all data sources
   */
  async getVehicleAnalysis(identifier: string): Promise<SmartParserResponse> {
    const analyses = [];

    // Try VIN decode first
    if (identifier.length === 17) {
      const vinResult = await this.decodeVIN(identifier);
      if (vinResult.data) {
        analyses.push({
          type: 'vin_decode',
          ...vinResult
        });
      }
    }

    // Extract make/model if possible and get market data
    const makeModelMatch = identifier.match(/(\w+)\s+(\w+)/);
    if (makeModelMatch) {
      const [, make, model] = makeModelMatch;
      const marketResult = await this.getMarketPricing(make, model);
      if (marketResult.data) {
        analyses.push({
          type: 'market_pricing',
          ...marketResult
        });
      }
    }

    if (analyses.length === 0) {
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "No analysis possible",
        disclaimer: "Unable to analyze provided identifier"
      };
    }

    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidenceScore, 0) / analyses.length;
    
    return {
      data: {
        analysisTypes: analyses.map(a => a.type),
        results: analyses.map(({ type, data, sourceAttribution }) => ({
          type,
          data,
          sourceAttribution
        }))
      },
      confidenceScore: Math.round(avgConfidence),
      sourceAttribution: `Combined analysis from ${analyses.length} data sources`,
      disclaimer: "Comprehensive analysis based on available data"
    };
  }
}

// Export singleton instance
export const smartParser = new PostgreSQLSmartParser();

// Legacy compatibility exports
export const decodeVIN = (vin: string) => smartParser.decodeVIN(vin);
export const checkCompliance = (country: string, year?: number, region?: string) => 
  smartParser.checkCompliance(country, year, region);
export const getShippingEstimate = (origin: string, dest: string) => 
  smartParser.getShippingEstimate(origin, dest);
export const getMarketPricing = (make: string, model: string, year?: number) => 
  smartParser.getMarketPricing(make, model, year);
export const getExchangeRate = (from: string, to: string) => 
  smartParser.getExchangeRate(from, to);