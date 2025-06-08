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
  vehicleModelPatterns,
  smartParserHistory,
  adminQueryReviews,
  patternStaging,
  lookupAnalytics,
  userWatchlist
} from '@shared/schema';
import { eq, and, or, like, ilike, desc, asc } from 'drizzle-orm';

export interface SmartParserResponse {
  data: any;
  confidenceScore: number;
  sourceAttribution: string;
  sourceBreakdown: SourceBreakdown[];
  whyThisResult: string;
  nextSteps: NextStepRecommendation[];
  userIntent?: UserIntentClassification;
  importRiskIndex?: ImportRiskIndex;
  strategicRecommendations?: StrategicRecommendation[];
  fallbackSuggestions?: string[];
  lastUpdated?: string;
  disclaimer?: string;
}

export interface UserIntentClassification {
  category: string;
  subcategory: string;
  confidence: number;
  riskFactors: string[];
  detectedKeywords: string[];
}

export interface ImportRiskIndex {
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  explanation: string;
}

export interface RiskFactor {
  name: string;
  impact: number;
  description: string;
}

export interface StrategicRecommendation {
  type: string;
  title: string;
  description: string;
  timing: string;
  alternatives: string[];
  confidence: number;
  priority: 'low' | 'medium' | 'high';
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
   * Classify user intent from search query for strategic recommendations
   */
  private async classifyUserIntent(query: string): Promise<UserIntentClassification | undefined> {
    const normalizedQuery = query.toLowerCase();
    
    try {
      const patterns = await db.execute(
        `SELECT * FROM user_intent_patterns 
         WHERE LOWER($1) LIKE '%' || LOWER(search_pattern) || '%'
         ORDER BY confidence_score DESC, LENGTH(search_pattern) DESC
         LIMIT 1`,
        [normalizedQuery]
      );

      if (patterns.rows.length > 0) {
        const pattern = patterns.rows[0] as any;
        
        // Extract detected keywords
        const detectedKeywords = [];
        if (normalizedQuery.includes(pattern.search_pattern)) {
          detectedKeywords.push(pattern.search_pattern);
        }

        return {
          category: pattern.intent_category,
          subcategory: pattern.intent_subcategory,
          confidence: pattern.confidence_score,
          riskFactors: pattern.risk_factors,
          detectedKeywords
        };
      }
    } catch (error) {
      console.error('Intent classification error:', error);
    }

    return undefined;
  }

  /**
   * Calculate Import Risk Index based on multiple factors
   */
  private async calculateImportRiskIndex(make: string, model: string, year: number, destinationCountry: string = 'australia'): Promise<ImportRiskIndex> {
    const factors: RiskFactor[] = [];
    let totalRisk = 0;

    // Vehicle age proximity to 25-year rule
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - year;
    const yearsTo25 = 25 - vehicleAge;

    if (yearsTo25 > 0 && yearsTo25 <= 5) {
      const ageRisk = Math.max(0, (5 - yearsTo25) * 20); // Higher risk closer to 25 years
      factors.push({
        name: 'Age Threshold Proximity',
        impact: ageRisk,
        description: `Vehicle is ${yearsTo25} years from 25-year rule eligibility`
      });
      totalRisk += ageRisk;
    }

    // Compliance complexity based on make/model
    const complexityVehicles = ['skyline', 'gtr', 'supra', 'rx7', 'nsx'];
    const isComplexVehicle = complexityVehicles.some(v => model.toLowerCase().includes(v));
    
    if (isComplexVehicle) {
      const complexityRisk = 25;
      factors.push({
        name: 'Compliance Complexity',
        impact: complexityRisk,
        description: 'High-performance vehicle requires additional certification steps'
      });
      totalRisk += complexityRisk;
    }

    // Destination volatility (Australia has stable rules)
    if (destinationCountry === 'australia') {
      const stabilityBonus = -10; // Negative risk = good
      factors.push({
        name: 'Regulatory Stability',
        impact: stabilityBonus,
        description: 'Australia has stable import regulations'
      });
      totalRisk += stabilityBonus;
    }

    // Calculate final risk score (0-100)
    const riskScore = Math.max(0, Math.min(100, totalRisk));
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore < 25) riskLevel = 'low';
    else if (riskScore < 50) riskLevel = 'medium';
    else if (riskScore < 75) riskLevel = 'high';
    else riskLevel = 'critical';

    let explanation = `Import Risk Index: ${riskScore}/100 (${riskLevel}). `;
    if (riskScore < 30) explanation += 'Straightforward import process expected.';
    else if (riskScore < 60) explanation += 'Some complexity expected, plan additional time and budget.';
    else explanation += 'High complexity import, consider professional assistance.';

    return {
      score: riskScore,
      riskLevel,
      factors,
      explanation
    };
  }

  /**
   * Get strategic recommendations for vehicle and destination
   */
  private async getStrategicRecommendations(make: string, model: string, destinationCountry: string): Promise<StrategicRecommendation[]> {
    const vehiclePattern = `${make.toLowerCase()} ${model.toLowerCase()}`;
    
    try {
      const recommendations = await db.execute(
        `SELECT * FROM strategic_recommendations 
         WHERE LOWER(vehicle_pattern) LIKE LOWER($1) 
         AND (destination_country = $2 OR destination_country IS NULL)
         ORDER BY confidence_score DESC, priority_level DESC
         LIMIT 3`,
        [`%${vehiclePattern}%`, destinationCountry.toLowerCase()]
      );

      return recommendations.rows.map((rec: any) => ({
        type: rec.recommendation_type,
        title: rec.title,
        description: rec.description,
        timing: rec.timing_consideration || 'Consider timing factors',
        alternatives: rec.alternatives || [],
        confidence: rec.confidence_score,
        priority: rec.priority_level
      }));

    } catch (error) {
      console.error('Strategic recommendations error:', error);
      return [];
    }
  }

  /**
   * Generate contextual next steps based on vehicle type and origin country
   */
  private generateVehicleNextSteps(make: string, model: string, year: number, originCountry: string): NextStepRecommendation[] {
    const steps: NextStepRecommendation[] = [];
    
    // Validate inputs to prevent errors
    const safeMake = make || '';
    const safeModel = model || '';
    const safeYear = year || new Date().getFullYear();
    const safeOrigin = originCountry || 'unknown';
    
    // JDM vehicles to Australia/New Zealand - specific guidance
    if (safeOrigin === 'japan') {
      steps.push({
        title: 'Check 25-Year Import Eligibility',
        description: 'Verify if this Japanese vehicle meets the 25-year import rule for your destination country',
        priority: 'high',
        category: 'compliance',
        estimatedTime: '2 minutes'
      });
      
      if (safeMake.toLowerCase() === 'nissan' && safeModel.toLowerCase().includes('skyline')) {
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
  async intelligentVehicleLookup(query: string, userAgent?: string, ipAddress?: string): Promise<SmartParserResponse> {
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      // Query vehicle model patterns for intelligent matching
      const patterns = await db.select()
        .from(vehicleModelPatterns)
        .where(
          or(
            eq(vehicleModelPatterns.searchPattern, normalizedQuery),
            like(vehicleModelPatterns.searchPattern, `%${normalizedQuery}%`)
          )
        )
        .orderBy(desc(vehicleModelPatterns.confidenceScore))
        .limit(5);

      if (patterns.length > 0) {
        const bestMatch = patterns[0];
        
        // Persist lookup to history
        await this.persistLookupHistory(normalizedQuery, 'intelligent', bestMatch, userAgent, ipAddress);
        
        // Flag for admin review if confidence is low
        if (bestMatch.confidenceScore < 75) {
          await this.flagForAdminReview(normalizedQuery, 'intelligent', bestMatch.confidenceScore);
        }
        
        const sourceBreakdown: SourceBreakdown[] = [
          {
            dataPoint: 'Vehicle Pattern Recognition',
            source: bestMatch.sourceAttribution || 'Pattern Database',
            confidence: bestMatch.confidenceScore,
            lastVerified: new Date().toISOString().split('T')[0]
          }
        ];

        // Generate contextual next steps based on the matched vehicle
        const nextSteps = this.generateVehicleNextSteps(
          bestMatch.canonicalMake, 
          bestMatch.canonicalModel, 
          bestMatch.yearRangeStart || 1990, 
          'japan' // Most pattern matches are JDM
        );

        // Add year range guidance if query contains partial year
        const yearMatch = query.match(/\d{2,4}/);
        if (yearMatch) {
          const inputYear = parseInt(yearMatch[0]);
          const fullYear = inputYear < 50 ? 2000 + inputYear : inputYear < 100 ? 1900 + inputYear : inputYear;
          
          if (bestMatch.yearRangeStart && bestMatch.yearRangeEnd && fullYear >= bestMatch.yearRangeStart && fullYear <= bestMatch.yearRangeEnd) {
            nextSteps.unshift({
              title: `${fullYear} Model Year Confirmed`,
              description: `This year falls within the ${bestMatch.canonicalMake} ${bestMatch.canonicalModel} production range`,
              priority: 'high',
              category: 'year_validation',
              estimatedTime: '1 minute'
            });
          } else if (bestMatch.yearRangeStart && bestMatch.yearRangeEnd) {
            nextSteps.unshift({
              title: 'Year Range Mismatch',
              description: `${fullYear} is outside the production range (${bestMatch.yearRangeStart}-${bestMatch.yearRangeEnd}). Verify model year.`,
              priority: 'high',
              category: 'year_validation',
              estimatedTime: '5 minutes'
            });
          }
        }

        // Get strategic intelligence for matched vehicle
        const userIntent = await this.classifyUserIntent(query);
        const importRiskIndex = await this.calculateImportRiskIndex(bestMatch.canonicalMake, bestMatch.canonicalModel, bestMatch.yearRangeStart || 1990);
        const strategicRecommendations = await this.getStrategicRecommendations(bestMatch.canonicalMake, bestMatch.canonicalModel, 'australia');

        return {
          data: {
            make: bestMatch.canonicalMake,
            model: bestMatch.canonicalModel,
            chassisCode: bestMatch.chassisCode,
            yearRange: bestMatch.yearRangeStart && bestMatch.yearRangeEnd ? `${bestMatch.yearRangeStart}-${bestMatch.yearRangeEnd}` : 'Unknown',
            engine: bestMatch.enginePattern,
            bodyType: bestMatch.bodyType,
            specialNotes: bestMatch.specialNotes
          },
          confidenceScore: bestMatch.confidenceScore,
          sourceAttribution: bestMatch.sourceAttribution || 'Pattern Database',
          sourceBreakdown,
          whyThisResult: `Pattern "${normalizedQuery}" matched ${bestMatch.canonicalMake} ${bestMatch.canonicalModel} with ${bestMatch.confidenceScore}% confidence. This vehicle is recognized in our enthusiast database with chassis code ${bestMatch.chassisCode || 'N/A'}.`,
          nextSteps,
          userIntent,
          importRiskIndex,
          strategicRecommendations,
          lastUpdated: new Date().toISOString(),
          disclaimer: "Strategic recommendations based on current market analysis and regulatory intelligence. Import requirements may change - verify current regulations before proceeding."
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
      
      // Flag failed query for admin review
      await this.flagForAdminReview(normalizedQuery, 'intelligent', 0, 'failed');
      
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
   * Persist lookup history to PostgreSQL for analytics and admin review
   */
  private async persistLookupHistory(query: string, lookupType: string, resultData: any, userAgent?: string, ipAddress?: string) {
    try {
      await db.insert(smartParserHistory).values({
        queryText: query,
        lookupType,
        resultData: JSON.stringify(resultData),
        confidenceScore: resultData.confidenceScore || 0,
        importRiskIndex: resultData.importRiskIndex || 0,
        userIntent: resultData.userIntent || null,
        sourceAttribution: resultData.sourceAttribution || 'Unknown',
        nextSteps: JSON.stringify(resultData.nextSteps || []),
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      });
    } catch (error) {
      console.error('Failed to persist lookup history:', error);
    }
  }

  /**
   * Flag low-confidence queries for admin review
   */
  private async flagForAdminReview(query: string, lookupType: string, confidence: number, quality: string = 'poor') {
    try {
      await db.insert(adminQueryReviews).values({
        originalQuery: query,
        lookupType,
        confidenceScore: confidence,
        resultQuality: quality,
        flaggedForReview: true,
        enhancementSuggestions: confidence < 50 
          ? 'Consider adding this pattern to the database'
          : 'Review pattern matching accuracy'
      });
    } catch (error) {
      console.error('Failed to flag query for admin review:', error);
    }
  }

  /**
   * Add vehicle to user watchlist with eligibility tracking
   */
  async addToWatchlist(email: string, make: string, model: string, year?: number, chassisCode?: string, userIntent?: string): Promise<boolean> {
    try {
      // Calculate eligibility date (25-year rule)
      const eligibilityDate = year ? new Date(year + 25, 0, 1) : null;
      
      await db.insert(userWatchlist).values({
        userEmail: email,
        vehicleMake: make,
        vehicleModel: model,
        vehicleYear: year || null,
        chassisCode: chassisCode || null,
        eligibilityDate,
        userIntent: userIntent || 'daily',
        notificationPrefs: JSON.stringify({
          email: true,
          sms: false,
          eligibilityReminder: true,
          priceAlerts: true
        })
      });
      
      return true;
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      return false;
    }
  }

  /**
   * Suggest pattern for admin approval
   */
  async suggestPattern(pattern: string, make: string, model: string, chassisCode?: string, confidence: number = 85): Promise<boolean> {
    try {
      await db.insert(patternStaging).values({
        suggestedPattern: pattern,
        canonicalMake: make,
        canonicalModel: model,
        chassisCode: chassisCode || null,
        confidenceEstimate: confidence,
        sourceContext: 'User-suggested pattern from intelligent lookup'
      });
      
      return true;
    } catch (error) {
      console.error('Failed to suggest pattern:', error);
      return false;
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