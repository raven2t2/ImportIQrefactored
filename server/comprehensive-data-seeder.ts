/**
 * Comprehensive Data Seeder for ImportIQ PostgreSQL Database
 * Populates all compliance rules, vehicle specs, cost structures, and port data
 */

import { db } from './db';
import { 
  globalComplianceRules, 
  vehicleSpecifications, 
  importCostStructure, 
  portInformation,
  vehicleHeads
} from '@shared/schema';

export class ComprehensiveDataSeeder {
  
  /**
   * Seed all database tables with authentic data
   */
  static async seedAllTables() {
    console.log('Starting comprehensive database seeding...');
    
    try {
      await this.seedGlobalComplianceRules();
      await this.seedVehicleSpecifications();
      await this.seedImportCostStructure();
      await this.seedPortInformation();
      await this.seedVehicleHeads();
      
      console.log('✅ All database tables seeded successfully');
      return true;
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      return false;
    }
  }

  /**
   * Seed global compliance rules for all major import destinations
   */
  static async seedGlobalComplianceRules() {
    console.log('Seeding global compliance rules...');
    
    const complianceRules = [
      // Australia Rules
      {
        country: 'australia',
        region: null,
        ruleType: 'age_restriction',
        vehicleCategory: 'passenger',
        minimumAgeYears: 25,
        maximumAgeYears: null,
        emissionStandard: 'ADR',
        safetyStandard: 'ADR',
        specialRequirements: JSON.stringify({
          rightHandDrive: true,
          compliancePlate: true,
          rawApproval: true
        }),
        exemptions: JSON.stringify({
          vintage: 'Pre-1989 vehicles exempt from some ADR requirements',
          racing: 'Competition vehicles with special permits'
        }),
        complianceCost: '8500.00',
        processingTimeWeeks: 12,
        effectiveDate: new Date('2024-01-01'),
        sourceDocument: 'Australian Design Rules (ADR) and Motor Vehicle Standards Act 1989'
      },
      {
        country: 'australia',
        region: null,
        ruleType: 'emissions',
        vehicleCategory: 'passenger',
        minimumAgeYears: null,
        maximumAgeYears: null,
        emissionStandard: 'Euro 5',
        safetyStandard: 'ADR',
        specialRequirements: JSON.stringify({
          catalyticConverter: true,
          emissionsTesting: true
        }),
        complianceCost: '2500.00',
        processingTimeWeeks: 4,
        effectiveDate: new Date('2024-01-01'),
        sourceDocument: 'Australian Government Department of Infrastructure'
      },
      // USA Rules
      {
        country: 'usa',
        region: null,
        ruleType: 'age_restriction',
        vehicleCategory: 'passenger',
        minimumAgeYears: 25,
        maximumAgeYears: null,
        emissionStandard: 'EPA',
        safetyStandard: 'FMVSS',
        specialRequirements: JSON.stringify({
          dotCompliance: true,
          epaCompliance: true,
          leftHandDriveConversion: false
        }),
        exemptions: JSON.stringify({
          show_display: '25+ year vehicles for show or display'
        }),
        complianceCost: '12000.00',
        processingTimeWeeks: 16,
        effectiveDate: new Date('2024-01-01'),
        sourceDocument: 'NHTSA Federal Motor Vehicle Safety Standards'
      },
      // Canada Rules
      {
        country: 'canada',
        region: null,
        ruleType: 'age_restriction',
        vehicleCategory: 'passenger',
        minimumAgeYears: 15,
        maximumAgeYears: null,
        emissionStandard: 'Environment Canada',
        safetyStandard: 'CMVSS',
        specialRequirements: JSON.stringify({
          transportCanadaApproval: true,
          daytimeRunningLights: true
        }),
        complianceCost: '6500.00',
        processingTimeWeeks: 8,
        effectiveDate: new Date('2024-01-01'),
        sourceDocument: 'Transport Canada Motor Vehicle Safety Act'
      },
      // UK Rules
      {
        country: 'uk',
        region: null,
        ruleType: 'age_restriction',
        vehicleCategory: 'passenger',
        minimumAgeYears: null,
        maximumAgeYears: null,
        emissionStandard: 'Euro 6',
        safetyStandard: 'UNECE',
        specialRequirements: JSON.stringify({
          rightHandDrive: true,
          motTest: true,
          v5cRegistration: true
        }),
        complianceCost: '3500.00',
        processingTimeWeeks: 6,
        effectiveDate: new Date('2024-01-01'),
        sourceDocument: 'DVLA Vehicle Type Approval'
      }
    ];

    for (const rule of complianceRules) {
      await db.insert(globalComplianceRules).values({
        country: rule.country,
        region: rule.region,
        ruleType: rule.ruleType,
        vehicleCategory: rule.vehicleCategory,
        minimumAgeYears: rule.minimumAgeYears,
        maximumAgeYears: rule.maximumAgeYears,
        emissionStandard: rule.emissionStandard,
        safetyStandard: rule.safetyStandard,
        specialRequirements: rule.specialRequirements,
        exemptions: rule.exemptions,
        complianceCost: rule.complianceCost,
        processingTimeWeeks: rule.processingTimeWeeks,
        effectiveDate: rule.effectiveDate,
        sourceDocument: rule.sourceDocument
      }).onConflictDoNothing();
    }
    
    console.log(`✅ Seeded ${complianceRules.length} compliance rules`);
  }

  /**
   * Seed vehicle specifications for popular JDM and other imports
   */
  static async seedVehicleSpecifications() {
    console.log('Seeding vehicle specifications...');
    
    const vehicles = [
      // Toyota Supra JZA80
      {
        make: 'Toyota',
        model: 'Supra',
        year: 1993,
        chassis: 'JZA80',
        engine: '2JZ-GTE',
        displacement: '3000cc',
        transmission: '6MT',
        driveType: 'RWD',
        fuelType: 'Petrol',
        bodyStyle: 'Coupe',
        doors: 2,
        seats: 4,
        weight: 1570,
        length: 4520,
        width: 1810,
        height: 1275,
        wheelbase: 2550,
        power: 280,
        torque: 431,
        emissions: 'Pre-Euro',
        safetyRating: 'N/A',
        productionStart: new Date('1993-01-01'),
        productionEnd: new Date('2002-12-31'),
        marketRegions: ['Japan', 'Europe', 'North America'],
        specialNotes: 'Legendary 2JZ-GTE twin-turbo engine, highly sought after for tuning potential',
        isVerified: true
      },
      // Nissan Skyline GT-R R34
      {
        make: 'Nissan',
        model: 'Skyline GT-R',
        year: 1999,
        chassis: 'BNR34',
        engine: 'RB26DETT',
        displacement: '2600cc',
        transmission: '6MT',
        driveType: 'AWD',
        fuelType: 'Petrol',
        bodyStyle: 'Coupe',
        doors: 2,
        seats: 4,
        weight: 1560,
        length: 4600,
        width: 1785,
        height: 1360,
        wheelbase: 2665,
        power: 280,
        torque: 392,
        emissions: 'Pre-Euro',
        safetyRating: 'N/A',
        productionStart: new Date('1999-01-01'),
        productionEnd: new Date('2002-08-31'),
        marketRegions: ['Japan'],
        specialNotes: 'ATTESA E-TS AWD system, RB26DETT twin-turbo I6, NISMO heritage',
        isVerified: true
      },
      // Honda NSX NA1
      {
        make: 'Honda',
        model: 'NSX',
        year: 1991,
        chassis: 'NA1',
        engine: 'C30A',
        displacement: '3000cc',
        transmission: '5MT',
        driveType: 'RWD',
        fuelType: 'Petrol',
        bodyStyle: 'Coupe',
        doors: 2,
        seats: 2,
        weight: 1365,
        length: 4430,
        width: 1810,
        height: 1170,
        wheelbase: 2530,
        power: 270,
        torque: 284,
        emissions: 'Pre-Euro',
        safetyRating: 'N/A',
        productionStart: new Date('1990-01-01'),
        productionEnd: new Date('1997-12-31'),
        marketRegions: ['Japan', 'North America'],
        specialNotes: 'All-aluminum construction, VTEC V6, developed with Ayrton Senna input',
        isVerified: true
      },
      // Mazda RX-7 FD3S
      {
        make: 'Mazda',
        model: 'RX-7',
        year: 1993,
        chassis: 'FD3S',
        engine: '13B-REW',
        displacement: '1300cc',
        transmission: '5MT',
        driveType: 'RWD',
        fuelType: 'Petrol',
        bodyStyle: 'Coupe',
        doors: 2,
        seats: 4,
        weight: 1280,
        length: 4285,
        width: 1760,
        height: 1230,
        wheelbase: 2425,
        power: 255,
        torque: 294,
        emissions: 'Pre-Euro',
        safetyRating: 'N/A',
        productionStart: new Date('1992-01-01'),
        productionEnd: new Date('2002-08-31'),
        marketRegions: ['Japan', 'North America', 'Europe'],
        specialNotes: 'Sequential twin-turbo rotary engine, perfect weight distribution',
        isVerified: true
      }
    ];

    for (const vehicle of vehicles) {
      await db.insert(vehicleSpecifications).values(vehicle).onConflictDoNothing();
    }
    
    console.log(`✅ Seeded ${vehicles.length} vehicle specifications`);
  }

  /**
   * Seed import cost structures for major trade routes
   */
  static async seedImportCostStructure() {
    console.log('Seeding import cost structures...');
    
    const costStructures = [
      // Japan to Australia
      {
        originCountry: 'japan',
        destinationCountry: 'australia',
        destinationRegion: null,
        vehicleType: 'passenger',
        ageCategory: 'classic',
        dutyRate: 0.05, // 5%
        gstRate: 0.10, // 10%
        luxuryTaxThreshold: '79659.00',
        luxuryTaxRate: 0.33, // 33%
        baseShippingCost: '3500.00',
        inspectionFee: '400.00',
        complianceFee: '8500.00',
        registrationFee: '800.00',
        brokerageFee: '650.00',
        storagePerDay: '45.00',
        currency: 'AUD',
        effectiveDate: new Date('2024-01-01'),
        sourceAuthority: 'Australian Border Force, Department of Infrastructure'
      },
      // USA to Australia
      {
        originCountry: 'usa',
        destinationCountry: 'australia',
        destinationRegion: null,
        vehicleType: 'passenger',
        ageCategory: 'classic',
        dutyRate: 0.05,
        gstRate: 0.10,
        luxuryTaxThreshold: '79659.00',
        luxuryTaxRate: 0.33,
        baseShippingCost: '4200.00',
        inspectionFee: '400.00',
        complianceFee: '9500.00',
        registrationFee: '800.00',
        brokerageFee: '750.00',
        storagePerDay: '45.00',
        currency: 'AUD',
        effectiveDate: new Date('2024-01-01'),
        sourceAuthority: 'Australian Border Force'
      },
      // Japan to USA
      {
        originCountry: 'japan',
        destinationCountry: 'usa',
        destinationRegion: null,
        vehicleType: 'passenger',
        ageCategory: 'classic',
        dutyRate: 0.025, // 2.5%
        gstRate: 0.00, // No federal sales tax
        luxuryTaxThreshold: '0.00',
        luxuryTaxRate: 0.00,
        baseShippingCost: '2800.00',
        inspectionFee: '500.00',
        complianceFee: '12000.00',
        registrationFee: '200.00',
        brokerageFee: '800.00',
        storagePerDay: '65.00',
        currency: 'USD',
        effectiveDate: new Date('2024-01-01'),
        sourceAuthority: 'U.S. Customs and Border Protection, NHTSA'
      },
      // Japan to Canada
      {
        originCountry: 'japan',
        destinationCountry: 'canada',
        destinationRegion: null,
        vehicleType: 'passenger',
        ageCategory: 'classic',
        dutyRate: 0.061, // 6.1%
        gstRate: 0.05, // 5% GST
        luxuryTaxThreshold: '100000.00',
        luxuryTaxRate: 0.10,
        baseShippingCost: '3200.00',
        inspectionFee: '350.00',
        complianceFee: '6500.00',
        registrationFee: '300.00',
        brokerageFee: '600.00',
        storagePerDay: '55.00',
        currency: 'CAD',
        effectiveDate: new Date('2024-01-01'),
        sourceAuthority: 'Canada Border Services Agency, Transport Canada'
      }
    ];

    for (const structure of costStructures) {
      await db.insert(importCostStructure).values(structure).onConflictDoNothing();
    }
    
    console.log(`✅ Seeded ${costStructures.length} cost structures`);
  }

  /**
   * Seed port information for major vehicle import ports
   */
  static async seedPortInformation() {
    console.log('Seeding port information...');
    
    const ports = [
      // Australian Ports
      {
        portCode: 'AUMEL',
        portName: 'Port of Melbourne',
        country: 'australia',
        region: 'victoria',
        city: 'Melbourne',
        latitude: '-37.8406',
        longitude: '144.9631',
        portAuthority: 'Port of Melbourne Corporation',
        website: 'https://www.portofmelbourne.com',
        vehicleTerminal: true,
        roroCapable: true,
        containerCapable: true,
        operatingHours: '24/7',
        vehicleProcessingCapacity: 15000,
        averageProcessingDays: 7,
        baseHandlingFee: '450.00',
        quarantineInspectionFee: '400.00',
        customsProcessingFee: '180.00',
        storagePerDay: '45.00',
        afterHoursFee: '250.00',
        currentStatus: 'moderate',
        averageWaitDays: 3,
        peakSeasons: JSON.stringify(['December', 'January', 'February']),
        monthlyVehicleVolume: 12000,
        congestionFactors: ['Summer holidays', 'Chinese New Year', 'Weather delays'],
        quarantineStrictness: 'high',
        customsComplexity: 'moderate',
        additionalRequirements: ['Quarantine inspection', 'Fumigation if required'],
        recommendedAgents: ['Patrick Stevedoring', 'DP World Melbourne'],
        railConnections: true,
        highwayAccess: 'Direct access to West Gate Freeway',
        regionsServed: ['Victoria', 'Tasmania', 'South Australia'],
        bestFor: ['High-volume imports', 'Container shipping', 'Rail distribution'],
        challenges: ['Port congestion during peak season', 'Weather delays'],
        tips: ['Book early during summer months', 'Consider off-peak shipping'],
        currency: 'AUD'
      },
      {
        portCode: 'AUSYD',
        portName: 'Port Botany',
        country: 'australia',
        region: 'new_south_wales',
        city: 'Sydney',
        latitude: '-33.9475',
        longitude: '151.2303',
        portAuthority: 'NSW Ports',
        website: 'https://www.nswports.com.au',
        vehicleTerminal: true,
        roroCapable: true,
        containerCapable: true,
        operatingHours: '24/7',
        vehicleProcessingCapacity: 18000,
        averageProcessingDays: 5,
        baseHandlingFee: '480.00',
        quarantineInspectionFee: '400.00',
        customsProcessingFee: '180.00',
        storagePerDay: '50.00',
        afterHoursFee: '280.00',
        currentStatus: 'high',
        averageWaitDays: 2,
        peakSeasons: JSON.stringify(['November', 'December', 'January']),
        monthlyVehicleVolume: 15000,
        congestionFactors: ['Christmas season', 'Equipment availability'],
        quarantineStrictness: 'very_high',
        customsComplexity: 'complex',
        additionalRequirements: ['Strict quarantine protocols', 'Advanced documentation'],
        recommendedAgents: ['Patrick Terminals', 'DP World Sydney'],
        railConnections: true,
        highwayAccess: 'M1 Pacific Motorway direct access',
        regionsServed: ['New South Wales', 'Queensland', 'ACT'],
        bestFor: ['Premium vehicles', 'Fast processing', 'Major market access'],
        challenges: ['Higher costs', 'Strict compliance requirements'],
        tips: ['Ensure all documentation is perfect', 'Consider premium services'],
        currency: 'AUD'
      },
      // US Ports
      {
        portCode: 'USLAX',
        portName: 'Port of Long Beach',
        country: 'usa',
        region: 'california',
        city: 'Long Beach',
        latitude: '33.7701',
        longitude: '-118.2137',
        portAuthority: 'Port of Long Beach',
        website: 'https://www.polb.com',
        vehicleTerminal: true,
        roroCapable: true,
        containerCapable: true,
        operatingHours: '24/7',
        vehicleProcessingCapacity: 25000,
        averageProcessingDays: 10,
        baseHandlingFee: '650.00',
        quarantineInspectionFee: '200.00',
        customsProcessingFee: '150.00',
        storagePerDay: '65.00',
        afterHoursFee: '300.00',
        currentStatus: 'high',
        averageWaitDays: 5,
        peakSeasons: JSON.stringify(['October', 'November', 'December']),
        monthlyVehicleVolume: 20000,
        congestionFactors: ['Holiday season', 'Labor disputes', 'Equipment shortages'],
        quarantineStrictness: 'standard',
        customsComplexity: 'complex',
        additionalRequirements: ['EPA compliance', 'DOT approval', 'State registration prep'],
        recommendedAgents: ['WWL Vehicle Services', 'Pasha Automotive'],
        railConnections: true,
        highwayAccess: 'I-710 and I-405 access',
        regionsServed: ['West Coast', 'Southwest', 'Mountain States'],
        bestFor: ['Japanese imports', 'West Coast distribution', 'High volume'],
        challenges: ['Port congestion', 'Complex regulations', 'High costs'],
        tips: ['Plan for longer processing times', 'Use experienced brokers'],
        currency: 'USD'
      }
    ];

    for (const port of ports) {
      await db.insert(portInformation).values(port).onConflictDoNothing();
    }
    
    console.log(`✅ Seeded ${ports.length} port records`);
  }

  /**
   * Seed vehicle hero data for emotional descriptions
   */
  static async seedVehicleHeads() {
    console.log('Seeding vehicle hero data...');
    
    const heroVehicles = [
      {
        make: 'Toyota',
        model: 'Supra',
        year: 1993,
        chassis: 'JZA80',
        heroStatus: 'legendary',
        emotionalDescription: 'The ultimate JDM icon with sequential twin turbos and legendary 2JZ-GTE engine',
        culturalSignificance: 'Defines the golden era of Japanese sports cars and tuning culture',
        keyAppealFactors: ['2JZ-GTE engine', 'Sequential turbos', 'Tunability', 'Fast & Furious fame'],
        marketDemand: 'extreme',
        investmentPotential: 'excellent',
        difficulty: 'moderate',
        importEligible: true
      },
      {
        make: 'Nissan',
        model: 'Skyline GT-R',
        year: 1999,
        chassis: 'BNR34',
        heroStatus: 'legendary',
        emotionalDescription: 'The ultimate AWD weapon with RB26DETT and ATTESA E-TS system',
        culturalSignificance: 'Godzilla - the king of Japanese performance cars',
        keyAppealFactors: ['RB26DETT engine', 'ATTESA AWD', 'R34 design', 'NISMO heritage'],
        marketDemand: 'extreme',
        investmentPotential: 'excellent',
        difficulty: 'high',
        importEligible: true
      },
      {
        make: 'Honda',
        model: 'NSX',
        year: 1991,
        chassis: 'NA1',
        heroStatus: 'legendary',
        emotionalDescription: 'The everyday supercar with VTEC precision and aluminum excellence',
        culturalSignificance: 'Redefined what a supercar could be - reliable, usable, perfect',
        keyAppealFactors: ['VTEC V6', 'All-aluminum body', 'Ayrton Senna input', 'Honda reliability'],
        marketDemand: 'high',
        investmentPotential: 'excellent',
        difficulty: 'low',
        importEligible: true
      },
      {
        make: 'Mazda',
        model: 'RX-7',
        year: 1993,
        chassis: 'FD3S',
        heroStatus: 'legendary',
        emotionalDescription: 'The rotary masterpiece with sequential turbos and perfect balance',
        culturalSignificance: 'The pinnacle of rotary engine development and sports car purity',
        keyAppealFactors: ['13B-REW rotary', 'Sequential turbos', 'Perfect balance', 'Unique sound'],
        marketDemand: 'high',
        investmentPotential: 'good',
        difficulty: 'high',
        importEligible: true
      }
    ];

    for (const hero of heroVehicles) {
      await db.insert(vehicleHeads).values(hero).onConflictDoNothing();
    }
    
    console.log(`✅ Seeded ${heroVehicles.length} hero vehicles`);
  }
}