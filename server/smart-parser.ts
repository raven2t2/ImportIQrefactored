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
  vehicleLookupRequests,
  vehicleManufacturers,
  portIntelligence,
  regionalComplianceDetails,
  auctionHouses,
  customsDuties,
  vehicleSafetyRecalls
} from '@shared/schema';
import { eq, and, or, like, ilike, desc, asc } from 'drizzle-orm';

export interface SmartParserResponse {
  data: any;
  confidenceScore: number;
  sourceAttribution: string;
  sourceBreakdown: SourceBreakdown[];
  whyThisResult: string;
  nextSteps: NextStepRecommendation[];
  fallbackSuggestions?: string[];
  lastUpdated?: string;
  disclaimer?: string;
}

export interface SourceBreakdown {
  dataPoint: string;
  source: string;
  confidence: number;
  lastVerified: string;
  url?: string;
}

export interface NextStepRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionUrl?: string;
  estimatedTime?: string;
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
        const sourceBreakdown: SourceBreakdown[] = [
          {
            dataPoint: 'Vehicle Identification',
            source: spec.sourceAttribution,
            confidence: spec.confidenceScore,
            lastVerified: spec.lastVerified?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            url: spec.sourceUrl || undefined
          }
        ];

        const nextSteps = this.generateVehicleNextSteps(spec.make, spec.model, spec.year, spec.countryOfOrigin);

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
          sourceBreakdown,
          whyThisResult: `VIN ${vin} matched against official ${spec.make} manufacturer database. ${spec.confidenceScore}% confidence based on direct manufacturer record verification.`,
          nextSteps,
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
        
        const partialConfidence = Math.max(bestMatch.confidenceScore - 20, 60);
        const sourceBreakdown: SourceBreakdown[] = [
          {
            dataPoint: 'Partial Vehicle Identification',
            source: `${bestMatch.sourceAttribution} (Partial VIN)`,
            confidence: partialConfidence,
            lastVerified: new Date().toISOString().split('T')[0],
            url: bestMatch.sourceUrl || undefined
          }
        ];

        const nextSteps = this.generateVehicleNextSteps(bestMatch.make, bestMatch.model, bestMatch.year, bestMatch.countryOfOrigin);

        return {
          data: {
            make: bestMatch.make,
            model: bestMatch.model,
            year: bestMatch.year,
            country: bestMatch.countryOfOrigin,
            chassisCode: bestMatch.chassisCode
          },
          confidenceScore: partialConfidence,
          sourceAttribution: `${bestMatch.sourceAttribution} (Partial VIN match)`,
          sourceBreakdown,
          whyThisResult: `Partial VIN match found using first 11 characters. ${partialConfidence}% confidence due to incomplete VIN verification. Full VIN recommended for complete accuracy.`,
          nextSteps,
          fallbackSuggestions: fallbacks,
          disclaimer: "Partial VIN match - verify details with full vehicle inspection"
        };
      }

      // No matches found - provide guidance without fake data
      const fallbacks = await this.getFallbackSuggestions(vin, 'vin');
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "No authenticated manufacturer data available",
        sourceBreakdown: [],
        whyThisResult: `VIN ${vin} not found in verified manufacturer databases. This could indicate: 1) Vehicle not yet in our database, 2) Modified VIN, or 3) Special edition/limited production vehicle.`,
        nextSteps: [
          {
            title: 'Try Manual Vehicle Entry',
            description: 'Enter make, model, and year manually for import eligibility check',
            priority: 'high',
            category: 'alternative_lookup',
            estimatedTime: '2 minutes'
          },
          {
            title: 'Check Chassis Code',
            description: 'Look up vehicle chassis code for Japanese imports',
            priority: 'medium',
            category: 'alternative_lookup',
            estimatedTime: '5 minutes'
          }
        ],
        fallbackSuggestions: fallbacks,
        disclaimer: "No authentic VIN data found in manufacturer databases"
      };

    } catch (error) {
      console.error('VIN decode error:', error);
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "Database system error",
        sourceBreakdown: [],
        whyThisResult: 'Technical error occurred during VIN lookup. Database connectivity or query processing issue.',
        nextSteps: [
          {
            title: 'Retry Lookup',
            description: 'Try the VIN lookup again in a few moments',
            priority: 'high',
            category: 'system',
            estimatedTime: '1 minute'
          }
        ],
        disclaimer: "System error prevented VIN lookup completion"
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
   * Generate contextual next steps based on vehicle type and origin country
   */
  private generateVehicleNextSteps(make: string, model: string, year: number, originCountry: string): NextStepRecommendation[] {
    const steps: NextStepRecommendation[] = [];
    
    // JDM vehicles to Australia/New Zealand - specific guidance
    if (originCountry === 'japan') {
      steps.push({
        title: 'Check 25-Year Import Eligibility',
        description: 'Verify if this Japanese vehicle meets the 25-year import rule for your destination country',
        priority: 'high',
        category: 'compliance',
        estimatedTime: '2 minutes'
      });
      
      if (make.toLowerCase() === 'nissan' && model.toLowerCase().includes('skyline')) {
        steps.push({
          title: 'GT-R Specialist Compliance Check',
          description: 'GT-R models have specific compliance requirements including RAWS certification in Australia',
          priority: 'high',
          category: 'specialist_compliance',
          estimatedTime: '30 minutes'
        });
      }
      
      if (make.toLowerCase() === 'toyota' && model.toLowerCase().includes('supra')) {
        steps.push({
          title: 'Turbo Model Verification',
          description: 'Confirm turbo vs naturally aspirated model for accurate compliance assessment',
          priority: 'medium',
          category: 'technical_verification',
          estimatedTime: '15 minutes'
        });
      }
    }
    
    // US Muscle cars - E85 and modification considerations
    if (originCountry === 'united_states' && year >= 1965 && year <= 1975) {
      steps.push({
        title: 'Classic Muscle Car Compliance',
        description: 'Verify emissions exemptions and modification allowances for classic American muscle cars',
        priority: 'high',
        category: 'classic_compliance',
        estimatedTime: '20 minutes'
      });
      
      steps.push({
        title: 'E85 Fuel Compatibility Check',
        description: 'Determine if engine modifications needed for local fuel standards',
        priority: 'medium',
        category: 'fuel_compatibility',
        estimatedTime: '10 minutes'
      });
    }
    
    // German vehicles - EU compliance transfer
    if (originCountry === 'germany') {
      steps.push({
        title: 'EU Compliance Transfer',
        description: 'Check if existing EU certification can expedite import approval process',
        priority: 'medium',
        category: 'compliance_transfer',
        estimatedTime: '15 minutes'
      });
    }
    
    // Always add shipping cost estimation
    steps.push({
      title: 'Get Shipping Quote',
      description: 'Calculate accurate shipping costs from origin country to your location',
      priority: 'medium',
      category: 'logistics',
      estimatedTime: '5 minutes'
    });
    
    // Always add market pricing check
    steps.push({
      title: 'Check Current Market Value',
      description: 'Compare recent auction results and market prices for this specific model',
      priority: 'low',
      category: 'market_research',
      estimatedTime: '10 minutes'
    });
    
    return steps;
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
   * Intelligent vehicle lookup using pattern recognition for natural language queries
   */
  async intelligentVehicleLookup(query: string): Promise<SmartParserResponse> {
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      // Query vehicle model patterns for intelligent matching
      const patterns = await db.execute(
        `SELECT * FROM vehicle_model_patterns 
         WHERE LOWER(search_pattern) = LOWER($1) 
         OR LOWER($2) LIKE '%' || LOWER(search_pattern) || '%'
         ORDER BY confidence_score DESC, LENGTH(search_pattern) DESC
         LIMIT 5`,
        [normalizedQuery, normalizedQuery]
      );

      if (patterns.rows.length > 0) {
        const bestMatch = patterns.rows[0] as any;
        
        const sourceBreakdown: SourceBreakdown[] = [
          {
            dataPoint: 'Vehicle Pattern Recognition',
            source: bestMatch.source_attribution,
            confidence: bestMatch.confidence_score,
            lastVerified: new Date().toISOString().split('T')[0]
          }
        ];

        // Generate contextual next steps based on the matched vehicle
        const nextSteps = this.generateVehicleNextSteps(
          bestMatch.canonical_make, 
          bestMatch.canonical_model, 
          bestMatch.year_range_start, 
          'japan' // Most pattern matches are JDM
        );

        // Add year range guidance if query contains partial year
        const yearMatch = query.match(/\d{2,4}/);
        if (yearMatch) {
          const inputYear = parseInt(yearMatch[0]);
          const fullYear = inputYear < 50 ? 2000 + inputYear : inputYear < 100 ? 1900 + inputYear : inputYear;
          
          if (fullYear >= bestMatch.year_range_start && fullYear <= bestMatch.year_range_end) {
            nextSteps.unshift({
              title: `${fullYear} Model Year Confirmed`,
              description: `This year falls within the ${bestMatch.canonical_make} ${bestMatch.canonical_model} production range`,
              priority: 'high',
              category: 'year_validation',
              estimatedTime: '1 minute'
            });
          } else {
            nextSteps.unshift({
              title: 'Year Range Mismatch',
              description: `${fullYear} is outside the production range (${bestMatch.year_range_start}-${bestMatch.year_range_end}). Verify model year.`,
              priority: 'high',
              category: 'year_validation',
              estimatedTime: '5 minutes'
            });
          }
        }

        return {
          data: {
            make: bestMatch.canonical_make,
            model: bestMatch.canonical_model,
            chassisCode: bestMatch.chassis_code,
            yearRange: `${bestMatch.year_range_start}-${bestMatch.year_range_end}`,
            engine: bestMatch.engine_pattern,
            bodyType: bestMatch.body_type,
            specialNotes: bestMatch.special_notes
          },
          confidenceScore: bestMatch.confidence_score,
          sourceAttribution: bestMatch.source_attribution,
          sourceBreakdown,
          whyThisResult: `Pattern "${normalizedQuery}" matched ${bestMatch.canonical_make} ${bestMatch.canonical_model} with ${bestMatch.confidence_score}% confidence. This vehicle is recognized in our enthusiast database with chassis code ${bestMatch.chassis_code}.`,
          nextSteps
        };
      }

      // No pattern match found
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "No vehicle pattern recognition match",
        sourceBreakdown: [],
        whyThisResult: `Query "${query}" did not match any known vehicle patterns. Try using specific make/model names or common enthusiast terminology.`,
        nextSteps: [
          {
            title: 'Try VIN Lookup',
            description: 'Enter the 17-character VIN for precise vehicle identification',
            priority: 'high',
            category: 'alternative_lookup',
            estimatedTime: '2 minutes'
          },
          {
            title: 'Manual Make/Model Entry',
            description: 'Enter manufacturer and model separately for standard search',
            priority: 'medium',
            category: 'alternative_lookup',
            estimatedTime: '3 minutes'
          }
        ],
        disclaimer: "Vehicle pattern not recognized in database"
      };

    } catch (error) {
      console.error('Intelligent lookup error:', error);
      return {
        data: null,
        confidenceScore: 0,
        sourceAttribution: "Pattern recognition system error",
        sourceBreakdown: [],
        whyThisResult: "Technical error in pattern recognition system",
        nextSteps: [
          {
            title: 'Use Standard Lookup',
            description: 'Try VIN or manual make/model entry instead',
            priority: 'high',
            category: 'system_fallback',
            estimatedTime: '2 minutes'
          }
        ],
        disclaimer: "System error during pattern recognition"
      };
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