/**
 * PostgreSQL-Powered Vehicle Journey Tools Service
 * All tools persist data and calculations in PostgreSQL for complete journey tracking
 */

import { db } from './db';
import { sql } from 'drizzle-orm';

export interface JourneyToolResult {
  toolName: string;
  sessionId: string;
  data: any;
  calculationResults?: any;
  persistenceId?: number;
  status: 'active' | 'completed' | 'error';
}

export interface ImportCostCalculation {
  vehiclePrice: number;
  originCountry: string;
  destinationCountry: string;
  destinationState?: string;
  shippingCost: number;
  importDuty: number;
  gstAmount: number;
  complianceCost: number;
  totalCost: number;
  breakdown: any;
}

export interface EligibilityCheck {
  make: string;
  model: string;
  year: number;
  destinationCountry: string;
  destinationState?: string;
  isEligible: boolean;
  reason: string;
  requirements: string[];
  complianceNotes: any;
}

export interface ShippingEstimate {
  originPort: string;
  destinationPort: string;
  vehicleType: string;
  estimatedCost: number;
  estimatedDays: number;
  shippingMethod: string;
  routeDetails: any;
}

export interface ComplianceChecklist {
  make: string;
  model: string;
  year: number;
  destinationCountry: string;
  checklistItems: any[];
  completedItems: string[];
  progressPercentage: number;
  estimatedTime: number;
}

export class JourneyToolsService {
  
  /**
   * Calculate import costs with PostgreSQL persistence
   */
  static async calculateImportCosts(
    sessionId: string,
    vehicleData: any,
    originCountry: string,
    destinationCountry: string,
    destinationState?: string
  ): Promise<JourneyToolResult> {
    try {
      const calculation = await this.performImportCostCalculation(
        vehicleData,
        originCountry,
        destinationCountry,
        destinationState
      );

      // Persist to PostgreSQL
      const [persistedRecord] = await db.execute(sql`
        INSERT INTO import_cost_calculations (
          session_id, vehicle_make, vehicle_model, vehicle_year, vehicle_price,
          origin_country, destination_country, destination_state,
          shipping_cost, import_duty, gst_amount, compliance_cost, total_cost,
          calculation_breakdown
        ) VALUES (
          ${sessionId}, ${vehicleData.make}, ${vehicleData.model}, ${vehicleData.year}, ${vehicleData.price},
          ${originCountry}, ${destinationCountry}, ${destinationState || null},
          ${calculation.shippingCost}, ${calculation.importDuty}, ${calculation.gstAmount}, 
          ${calculation.complianceCost}, ${calculation.totalCost}, ${JSON.stringify(calculation.breakdown)}
        ) RETURNING id
      `);

      // Update journey tools tracking
      await this.persistJourneyTool(sessionId, 'import_calculator', calculation, persistedRecord.id);

      return {
        toolName: 'import_calculator',
        sessionId,
        data: calculation,
        calculationResults: calculation,
        persistenceId: persistedRecord.id,
        status: 'completed'
      };
    } catch (error) {
      console.error('Import cost calculation error:', error);
      return {
        toolName: 'import_calculator',
        sessionId,
        data: null,
        status: 'error'
      };
    }
  }

  /**
   * Check vehicle eligibility with PostgreSQL persistence
   */
  static async checkVehicleEligibility(
    sessionId: string,
    vehicleData: any,
    destinationCountry: string,
    destinationState?: string
  ): Promise<JourneyToolResult> {
    try {
      const eligibilityCheck = await this.performEligibilityCheck(
        vehicleData,
        destinationCountry,
        destinationState
      );

      // Persist to PostgreSQL
      const [persistedRecord] = await db.execute(sql`
        INSERT INTO vehicle_eligibility_checks (
          session_id, vehicle_make, vehicle_model, vehicle_year, chassis_code,
          destination_country, destination_state, is_eligible, eligibility_reason,
          minimum_age_requirement, special_requirements, compliance_notes
        ) VALUES (
          ${sessionId}, ${vehicleData.make}, ${vehicleData.model}, ${vehicleData.year}, ${vehicleData.chassisCode || null},
          ${destinationCountry}, ${destinationState || null}, ${eligibilityCheck.isEligible}, ${eligibilityCheck.reason},
          ${eligibilityCheck.minimumAge || null}, ${JSON.stringify(eligibilityCheck.requirements)}, ${JSON.stringify(eligibilityCheck.complianceNotes)}
        ) RETURNING id
      `);

      await this.persistJourneyTool(sessionId, 'eligibility_checker', eligibilityCheck, persistedRecord.id);

      return {
        toolName: 'eligibility_checker',
        sessionId,
        data: eligibilityCheck,
        calculationResults: eligibilityCheck,
        persistenceId: persistedRecord.id,
        status: 'completed'
      };
    } catch (error) {
      console.error('Eligibility check error:', error);
      return {
        toolName: 'eligibility_checker',
        sessionId,
        data: null,
        status: 'error'
      };
    }
  }

  /**
   * Get shipping estimate with PostgreSQL persistence
   */
  static async getShippingEstimate(
    sessionId: string,
    vehicleData: any,
    originCountry: string,
    destinationCountry: string
  ): Promise<JourneyToolResult> {
    try {
      const shippingEstimate = await this.performShippingEstimation(
        vehicleData,
        originCountry,
        destinationCountry
      );

      // Persist to PostgreSQL
      const [persistedRecord] = await db.execute(sql`
        INSERT INTO shipping_estimates (
          session_id, origin_port, destination_port, vehicle_type,
          estimated_cost, estimated_days, shipping_method, route_details
        ) VALUES (
          ${sessionId}, ${shippingEstimate.originPort}, ${shippingEstimate.destinationPort}, ${vehicleData.bodyType || 'passenger'},
          ${shippingEstimate.estimatedCost}, ${shippingEstimate.estimatedDays}, ${shippingEstimate.shippingMethod}, ${JSON.stringify(shippingEstimate.routeDetails)}
        ) RETURNING id
      `);

      await this.persistJourneyTool(sessionId, 'shipping_calculator', shippingEstimate, persistedRecord.id);

      return {
        toolName: 'shipping_calculator',
        sessionId,
        data: shippingEstimate,
        calculationResults: shippingEstimate,
        persistenceId: persistedRecord.id,
        status: 'completed'
      };
    } catch (error) {
      console.error('Shipping estimation error:', error);
      return {
        toolName: 'shipping_calculator',
        sessionId,
        data: null,
        status: 'error'
      };
    }
  }

  /**
   * Generate compliance checklist with PostgreSQL persistence
   */
  static async generateComplianceChecklist(
    sessionId: string,
    vehicleData: any,
    destinationCountry: string
  ): Promise<JourneyToolResult> {
    try {
      const checklist = await this.generateComplianceChecklistData(
        vehicleData,
        destinationCountry
      );

      // Persist to PostgreSQL
      const [persistedRecord] = await db.execute(sql`
        INSERT INTO compliance_checklists (
          session_id, vehicle_make, vehicle_model, vehicle_year,
          destination_country, checklist_items, estimated_completion_time
        ) VALUES (
          ${sessionId}, ${vehicleData.make}, ${vehicleData.model}, ${vehicleData.year},
          ${destinationCountry}, ${JSON.stringify(checklist.checklistItems)}, ${checklist.estimatedTime}
        ) RETURNING id
      `);

      await this.persistJourneyTool(sessionId, 'compliance_checklist', checklist, persistedRecord.id);

      return {
        toolName: 'compliance_checklist',
        sessionId,
        data: checklist,
        calculationResults: checklist,
        persistenceId: persistedRecord.id,
        status: 'completed'
      };
    } catch (error) {
      console.error('Compliance checklist error:', error);
      return {
        toolName: 'compliance_checklist',
        sessionId,
        data: null,
        status: 'error'
      };
    }
  }

  /**
   * Get journey tools for session from PostgreSQL
   */
  static async getJourneyTools(sessionId: string): Promise<JourneyToolResult[]> {
    try {
      const tools = await db.execute(sql`
        SELECT * FROM vehicle_journey_tools 
        WHERE session_id = ${sessionId}
        ORDER BY created_at ASC
      `);

      return tools.map(tool => ({
        toolName: tool.tool_name,
        sessionId: tool.session_id,
        data: tool.tool_data,
        calculationResults: tool.calculation_results,
        persistenceId: tool.id,
        status: tool.completion_status
      }));
    } catch (error) {
      console.error('Error fetching journey tools:', error);
      return [];
    }
  }

  /**
   * Private method to persist journey tool usage
   */
  private static async persistJourneyTool(
    sessionId: string,
    toolName: string,
    toolData: any,
    relatedId?: number
  ): Promise<void> {
    await db.execute(sql`
      INSERT INTO vehicle_journey_tools (
        session_id, tool_name, tool_data, calculation_results, completion_status
      ) VALUES (
        ${sessionId}, ${toolName}, ${JSON.stringify(toolData)}, ${JSON.stringify(toolData)}, 'completed'
      )
    `);
  }

  /**
   * Private method to perform import cost calculation
   */
  private static async performImportCostCalculation(
    vehicleData: any,
    originCountry: string,
    destinationCountry: string,
    destinationState?: string
  ): Promise<ImportCostCalculation> {
    const vehiclePrice = vehicleData.price || 25000;
    const dutyRate = this.getDutyRate(destinationCountry, vehicleData.year);
    const gstRate = this.getGSTRate(destinationCountry);
    
    const shippingCost = this.calculateShippingCost(originCountry, destinationCountry, vehicleData.bodyType);
    const importDuty = vehiclePrice * dutyRate;
    const gstAmount = (vehiclePrice + importDuty + shippingCost) * gstRate;
    const complianceCost = this.getComplianceCost(destinationCountry, vehicleData);
    const totalCost = vehiclePrice + shippingCost + importDuty + gstAmount + complianceCost;

    return {
      vehiclePrice,
      originCountry,
      destinationCountry,
      destinationState,
      shippingCost,
      importDuty,
      gstAmount,
      complianceCost,
      totalCost,
      breakdown: {
        vehiclePrice,
        shippingCost,
        importDuty,
        gstAmount,
        complianceCost,
        totalCost,
        dutyRate: dutyRate * 100,
        gstRate: gstRate * 100
      }
    };
  }

  /**
   * Private method to perform eligibility check
   */
  private static async performEligibilityCheck(
    vehicleData: any,
    destinationCountry: string,
    destinationState?: string
  ): Promise<EligibilityCheck> {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicleData.year;
    const minimumAge = this.getMinimumImportAge(destinationCountry);
    const isEligible = vehicleAge >= minimumAge;
    
    const requirements = this.getComplianceRequirements(destinationCountry, vehicleData);
    const reason = isEligible 
      ? `Vehicle meets ${minimumAge}-year import requirement`
      : `Vehicle must be at least ${minimumAge} years old (currently ${vehicleAge} years)`;

    return {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      destinationCountry,
      destinationState,
      isEligible,
      reason,
      requirements,
      complianceNotes: {
        vehicleAge,
        minimumAge,
        currentYear,
        specialConsiderations: this.getSpecialConsiderations(vehicleData)
      }
    };
  }

  /**
   * Private method to perform shipping estimation
   */
  private static async performShippingEstimation(
    vehicleData: any,
    originCountry: string,
    destinationCountry: string
  ): Promise<ShippingEstimate> {
    const route = this.getShippingRoute(originCountry, destinationCountry);
    const estimatedCost = this.calculateShippingCost(originCountry, destinationCountry, vehicleData.bodyType);
    const estimatedDays = this.getShippingDays(originCountry, destinationCountry);

    return {
      originPort: route.originPort,
      destinationPort: route.destinationPort,
      vehicleType: vehicleData.bodyType || 'passenger',
      estimatedCost,
      estimatedDays,
      shippingMethod: 'RORO', // Roll-on/Roll-off standard for cars
      routeDetails: {
        route: `${route.originPort} → ${route.destinationPort}`,
        transitTime: `${estimatedDays} days`,
        shippingLine: route.preferredCarrier
      }
    };
  }

  /**
   * Private method to generate compliance checklist
   */
  private static async generateComplianceChecklistData(
    vehicleData: any,
    destinationCountry: string
  ): Promise<ComplianceChecklist> {
    const checklistItems = this.getComplianceChecklistItems(destinationCountry, vehicleData);
    const estimatedTime = checklistItems.reduce((total, item) => total + (item.estimatedMinutes || 30), 0);

    return {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      destinationCountry,
      checklistItems,
      completedItems: [],
      progressPercentage: 0,
      estimatedTime
    };
  }

  // Helper methods for calculations
  private static getDutyRate(country: string, year: number): number {
    if (country.toLowerCase() === 'australia') return 0.05; // 5% duty
    if (country.toLowerCase() === 'usa') return 0.025; // 2.5% duty
    return 0.10; // Default 10%
  }

  private static getGSTRate(country: string): number {
    if (country.toLowerCase() === 'australia') return 0.10; // 10% GST
    if (country.toLowerCase() === 'canada') return 0.05; // 5% GST
    return 0.0; // No GST by default
  }

  private static calculateShippingCost(origin: string, destination: string, bodyType: string): number {
    const baseRates = {
      'japan-australia': 2800,
      'usa-australia': 3200,
      'uk-australia': 4500,
      'germany-australia': 4200
    };
    
    const routeKey = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
    return baseRates[routeKey] || 3500;
  }

  private static getComplianceCost(country: string, vehicleData: any): number {
    if (country.toLowerCase() === 'australia') {
      return vehicleData.engine?.includes('turbo') ? 8500 : 6500;
    }
    return 5000; // Default compliance cost
  }

  private static getMinimumImportAge(country: string): number {
    if (country.toLowerCase() === 'australia') return 25;
    if (country.toLowerCase() === 'usa') return 25;
    if (country.toLowerCase() === 'canada') return 15;
    return 25; // Default to 25 years
  }

  private static getComplianceRequirements(country: string, vehicleData: any): string[] {
    const requirements = [
      'Vehicle must pass safety inspection',
      'Emissions compliance certification required',
      'Import permit and documentation'
    ];

    if (country.toLowerCase() === 'australia') {
      requirements.push('RAWS (Registered Automotive Workshop Scheme) compliance');
      if (vehicleData.engine?.includes('turbo')) {
        requirements.push('Turbocharger system compliance check');
      }
    }

    return requirements;
  }

  private static getSpecialConsiderations(vehicleData: any): string[] {
    const considerations = [];
    
    if (vehicleData.engine?.includes('RB26')) {
      considerations.push('GT-R requires specialist compliance workshop');
    }
    
    if (vehicleData.engine?.includes('2JZ')) {
      considerations.push('Supra turbo models have specific boost pressure limits');
    }

    return considerations;
  }

  private static getShippingRoute(origin: string, destination: string): any {
    const routes = {
      'japan-australia': {
        originPort: 'Yokohama',
        destinationPort: 'Melbourne',
        preferredCarrier: 'K-Line'
      },
      'usa-australia': {
        originPort: 'Los Angeles',
        destinationPort: 'Sydney',
        preferredCarrier: 'COSCO'
      }
    };

    const routeKey = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
    return routes[routeKey] || {
      originPort: 'International Port',
      destinationPort: 'Local Port',
      preferredCarrier: 'International Shipping'
    };
  }

  private static getShippingDays(origin: string, destination: string): number {
    const routes = {
      'japan-australia': 14,
      'usa-australia': 21,
      'uk-australia': 35,
      'germany-australia': 28
    };

    const routeKey = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
    return routes[routeKey] || 30;
  }

  private static getComplianceChecklistItems(country: string, vehicleData: any): any[] {
    const baseItems = [
      {
        id: 'import_permit',
        title: 'Obtain Import Permit',
        description: 'Apply for vehicle import permit from relevant authority',
        estimatedMinutes: 60,
        priority: 'high',
        category: 'documentation'
      },
      {
        id: 'vehicle_inspection',
        title: 'Pre-Import Vehicle Inspection',
        description: 'Arrange comprehensive vehicle inspection before shipping',
        estimatedMinutes: 120,
        priority: 'high',
        category: 'inspection'
      },
      {
        id: 'shipping_booking',
        title: 'Book Shipping',
        description: 'Arrange vehicle transportation with certified carrier',
        estimatedMinutes: 45,
        priority: 'medium',
        category: 'logistics'
      }
    ];

    if (country.toLowerCase() === 'australia') {
      baseItems.push({
        id: 'raws_compliance',
        title: 'RAWS Compliance Certification',
        description: 'Complete Registered Automotive Workshop Scheme compliance',
        estimatedMinutes: 480,
        priority: 'high',
        category: 'compliance'
      });
    }

    return baseItems;
  }
}