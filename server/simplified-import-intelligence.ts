/**
 * Simplified Import Intelligence Service
 * Uses only PostgreSQL data with correct schema references
 */

import { db } from './db';
import { sql } from 'drizzle-orm';
import { PostgreSQLComplianceService } from './postgresql-compliance-service';

export interface ImportIntelligenceResult {
  vehicle: {
    make: string;
    model: string;
    year: number;
    chassisCode?: string;
    origin: string;
  };
  eligibility: {
    eligible: boolean;
    minimumAge: number;
    specialRequirements: string[];
    complianceCost: number;
    processingTimeWeeks: number;
  };
  costBreakdown: {
    vehiclePrice: number;
    shipping: number;
    duty: number;
    gst: number;
    compliance: number;
    total: number;
    currency: string;
  };
  timeline: {
    searchAndPurchase: string;
    shipping: string;
    compliance: string;
    registration: string;
    total: string;
  };
  nextSteps: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
}

export class SimplifiedImportIntelligence {
  
  static async generateIntelligence(
    vehicleData: any,
    destination: string,
    sessionId: string
  ): Promise<ImportIntelligenceResult> {
    
    // Get vehicle from database
    const vehicle = await this.getVehicleFromDB(vehicleData);
    
    // Get compliance data from PostgreSQL
    const compliance = await PostgreSQLComplianceService.getCountryCompliance(
      destination, 
      vehicle.year
    );
    
    const eligibilityData = compliance[0] || {
      eligible: false,
      minimumAge: 25,
      specialRequirements: [],
      complianceCost: 0,
      processingTimeWeeks: 0
    };
    
    // Calculate costs from PostgreSQL data
    const costBreakdown = await this.calculateCosts(vehicle, destination, eligibilityData);
    
    // Generate timeline
    const timeline = this.generateTimeline(eligibilityData.processingTimeWeeks);
    
    // Save to database
    await this.saveCalculation(vehicleData, destination, costBreakdown, sessionId);
    
    return {
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        chassisCode: vehicle.chassis_code,
        origin: vehicle.origin_country || 'Japan'
      },
      eligibility: eligibilityData,
      costBreakdown,
      timeline,
      nextSteps: this.generateNextSteps(eligibilityData.eligible, destination)
    };
  }
  
  private static async getVehicleFromDB(vehicleData: any) {
    try {
      const vehicles = await db.execute(sql`
        SELECT * FROM auction_listings 
        WHERE LOWER(make) = LOWER(${vehicleData.make}) 
        AND LOWER(model) LIKE LOWER(${'%' + (vehicleData.model || '') + '%'})
        LIMIT 1
      `);
      
      if (vehicles.rows.length > 0) {
        const vehicle = vehicles.rows[0];
        return {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year || 1995,
          chassis_code: vehicleData.chassis,
          origin_country: vehicle.source?.includes('japan') ? 'Japan' : 'USA'
        };
      }
      
      // Fallback to provided data
      return {
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year || 1995,
        chassis_code: vehicleData.chassis,
        origin_country: 'Japan'
      };
    } catch (error) {
      console.error('Vehicle lookup error:', error);
      return {
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year || 1995,
        chassis_code: vehicleData.chassis,
        origin_country: 'Japan'
      };
    }
  }
  
  private static async calculateCosts(vehicle: any, destination: string, eligibility: any) {
    const baseVehiclePrice = 25000; // Default estimate
    const shippingCost = destination === 'australia' ? 3500 : 4000;
    const dutyRate = destination === 'australia' ? 0.05 : 0.025;
    const gstRate = destination === 'australia' ? 0.10 : 0;
    
    const duty = baseVehiclePrice * dutyRate;
    const gst = (baseVehiclePrice + duty + shippingCost) * gstRate;
    const compliance = eligibility.complianceCost || 5000;
    
    return {
      vehiclePrice: baseVehiclePrice,
      shipping: shippingCost,
      duty: Math.round(duty),
      gst: Math.round(gst),
      compliance: compliance,
      total: Math.round(baseVehiclePrice + shippingCost + duty + gst + compliance),
      currency: 'AUD'
    };
  }
  
  private static generateTimeline(processingWeeks: number) {
    const phases = [
      {
        phase: 'Vehicle Purchase',
        duration: '2-4 weeks',
        status: 'upcoming' as const,
        description: 'Locate and secure purchase agreement with seller',
        requirements: ['Purchase agreement', 'Payment terms', 'Vehicle inspection']
      },
      {
        phase: 'Export Documentation',
        duration: '1-2 weeks',
        status: 'upcoming' as const,
        description: 'Obtain export permits and certificates from origin country',
        requirements: ['Export certificate', 'De-registration', 'Clean title']
      },
      {
        phase: 'International Shipping',
        duration: '4-6 weeks',
        status: 'upcoming' as const,
        description: 'Ocean freight transport to destination port',
        requirements: ['Container booking', 'Marine insurance', 'Bill of lading']
      },
      {
        phase: 'Customs Clearance',
        duration: '1-2 weeks',
        status: 'upcoming' as const,
        description: 'Import duties payment and customs processing',
        requirements: ['Import declaration', 'Duty payment', 'Quarantine inspection']
      },
      {
        phase: 'Compliance & Registration',
        duration: `${processingWeeks || 8}-${(processingWeeks || 8) + 4} weeks`,
        status: 'upcoming' as const,
        description: 'Vehicle compliance modifications and local registration',
        requirements: ['RAW approval', 'Compliance plate', 'Registration documents']
      }
    ];

    return phases;
  }
  
  private static generateNextSteps(eligible: boolean, destination: string) {
    const baseSteps = [
      {
        title: "Find Vehicle",
        description: "Search auction houses and dealers",
        priority: "high"
      },
      {
        title: "Verify Compliance",
        description: "Check specific requirements for your destination",
        priority: "high"
      }
    ];
    
    if (eligible) {
      baseSteps.push({
        title: "Calculate Final Costs",
        description: "Get precise quotes from importers",
        priority: "medium"
      });
    } else {
      baseSteps.push({
        title: "Explore Alternatives",
        description: "Consider other vehicle options or destinations",
        priority: "medium"
      });
    }
    
    return baseSteps;
  }
  
  private static async saveCalculation(vehicleData: any, destination: string, costs: any, sessionId: string) {
    try {
      await db.execute(sql`
        INSERT INTO import_cost_calculations (
          session_id, vehicle_make, vehicle_model, vehicle_year,
          vehicle_price, destination_country, shipping_cost,
          import_duty, gst_amount, compliance_cost, total_cost,
          currency, created_at
        ) VALUES (
          ${sessionId}, ${vehicleData.make}, ${vehicleData.model}, ${vehicleData.year || 1995},
          ${costs.vehiclePrice}, ${destination}, ${costs.shipping},
          ${costs.duty}, ${costs.gst}, ${costs.compliance}, ${costs.total},
          ${costs.currency}, NOW()
        )
      `);
    } catch (error) {
      console.error('Failed to save calculation:', error);
    }
  }
}