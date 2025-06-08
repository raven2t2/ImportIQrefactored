/**
 * Working Vehicle Database Seeder
 * Seeds essential vehicle data matching actual PostgreSQL schema
 */
import { db } from './db';
import { vehicleSpecifications } from '../shared/schema';
import { sql } from 'drizzle-orm';

export class WorkingVehicleSeeder {
  /**
   * Seed essential vehicle data that matches actual PostgreSQL columns
   */
  static async seedWorkingVehicles() {
    console.log('🚗 Seeding working vehicle database...');
    
    const workingVehicles = [
      // JDM Icons - using actual database column names
      {
        make: 'Nissan',
        model: 'Skyline GT-R',
        year: 1999,
        chassis: 'BNR34',
        engine: 'RB26DETT',
        displacement: '2600',
        transmission: '6MT',
        drive_type: 'AWD',  // matches database column
        fuel_type: 'Petrol', // matches database column
        body_style: 'Coupe', // matches database column
        doors: 2,
        power: 280,
        torque: 392,
        special_notes: 'BNR34 GT-R, legendary R34 generation | Market Value: $180000 | Rarity: 98/100 | Mod Potential: EXTREME | Import Status: ELIGIBLE', // matches database column
        is_verified: true // matches database column
      },
      {
        make: 'Toyota',
        model: 'Supra',
        year: 1997,
        chassis: 'JZA80',
        engine: '2JZ-GTE',
        displacement: '3000',
        transmission: '6MT',
        drive_type: 'RWD',
        fuel_type: 'Petrol',
        body_style: 'Coupe',
        doors: 2,
        power: 280,
        torque: 431,
        special_notes: 'JZA80 Supra Twin Turbo, 2JZ-GTE legend | Market Value: $95000 | Rarity: 92/100 | Mod Potential: EXTREME | Import Status: ELIGIBLE',
        is_verified: true
      },
      {
        make: 'Honda',
        model: 'NSX',
        year: 1991,
        chassis: 'NA1',
        engine: 'C30A',
        displacement: '3000',
        transmission: '5MT',
        drive_type: 'RWD',
        fuel_type: 'Petrol',
        body_style: 'Coupe',
        doors: 2,
        power: 274,
        torque: 285,
        special_notes: 'Original NSX, aluminum monocoque, F1-inspired | Market Value: $145000 | Rarity: 94/100 | Mod Potential: MODERATE | Import Status: ELIGIBLE',
        is_verified: true
      },
      {
        make: 'Mazda',
        model: 'RX-7',
        year: 1999,
        chassis: 'FD3S',
        engine: '13B-REW',
        displacement: '1300',
        transmission: '5MT',
        drive_type: 'RWD',
        fuel_type: 'Petrol',
        body_style: 'Coupe',
        doors: 2,
        power: 280,
        torque: 314,
        special_notes: 'FD3S RX-7, twin-turbo rotary perfection | Market Value: $65000 | Rarity: 89/100 | Mod Potential: EXTREME | Import Status: ELIGIBLE',
        is_verified: true
      },
      {
        make: 'Subaru',
        model: 'Impreza WRX STI',
        year: 1999,
        chassis: 'GC8',
        engine: 'EJ207',
        displacement: '2000',
        transmission: '5MT',
        drive_type: 'AWD',
        fuel_type: 'Petrol',
        body_style: 'Sedan',
        doors: 4,
        power: 280,
        torque: 363,
        special_notes: 'GC8 STI, rally-bred performance sedan | Market Value: $45000 | Rarity: 78/100 | Mod Potential: EXTREME | Import Status: ELIGIBLE_25_YEAR',
        is_verified: true
      },
      // American Muscle
      {
        make: 'Ford',
        model: 'Mustang',
        year: 1969,
        chassis: 'S-Code',
        engine: '428 Cobra Jet',
        displacement: '7000',
        transmission: '4MT',
        drive_type: 'RWD',
        fuel_type: 'Petrol',
        body_style: 'Coupe',
        doors: 2,
        power: 335,
        torque: 445,
        special_notes: 'Legendary 428 Cobra Jet, ultimate muscle car | Market Value: $95000 | Rarity: 92/100 | Mod Potential: HIGH | Import Status: ELIGIBLE',
        is_verified: true
      },
      {
        make: 'Chevrolet',
        model: 'Camaro',
        year: 1969,
        chassis: 'F-Body',
        engine: 'LS6 454',
        displacement: '7440',
        transmission: '4MT',
        drive_type: 'RWD',
        fuel_type: 'Petrol',
        body_style: 'Coupe',
        doors: 2,
        power: 450,
        torque: 500,
        special_notes: 'LS6 454 Camaro, big block muscle legend | Market Value: $125000 | Rarity: 95/100 | Mod Potential: HIGH | Import Status: ELIGIBLE',
        is_verified: true
      },
      // European Performance
      {
        make: 'BMW',
        model: 'M3',
        year: 1995,
        chassis: 'E36',
        engine: 'S50B32',
        displacement: '3200',
        transmission: '6MT',
        drive_type: 'RWD',
        fuel_type: 'Petrol',
        body_style: 'Coupe',
        doors: 2,
        power: 321,
        torque: 350,
        special_notes: 'E36 M3, naturally aspirated perfection | Market Value: $45000 | Rarity: 82/100 | Mod Potential: HIGH | Import Status: ELIGIBLE',
        is_verified: true
      },
      {
        make: 'Porsche',
        model: '911',
        year: 1995,
        chassis: '993',
        engine: 'M64/05',
        displacement: '3600',
        transmission: '6MT',
        drive_type: 'RWD',
        fuel_type: 'Petrol',
        body_style: 'Coupe',
        doors: 2,
        power: 272,
        torque: 330,
        special_notes: '993 generation, last air-cooled 911 | Market Value: $125000 | Rarity: 92/100 | Mod Potential: MODERATE | Import Status: ELIGIBLE',
        is_verified: true
      }
    ];

    try {
      for (const vehicle of workingVehicles) {
        await db.insert(vehicleSpecifications).values(vehicle).onConflictDoNothing();
      }
      
      console.log(`✅ Seeded ${workingVehicles.length} working vehicles`);
      return true;
    } catch (error) {
      console.error('❌ Failed to seed working vehicles:', error);
      return false;
    }
  }

  /**
   * Find vehicle by query (chassis code, make/model, etc.)
   */
  static async findVehicle(query: string) {
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      // Search by chassis code first
      const chassisMatch = await db.select()
        .from(vehicleSpecifications)
        .where(sql`LOWER(chassis) = ${normalizedQuery}`)
        .limit(1);
      
      if (chassisMatch.length > 0) {
        return chassisMatch;
      }
      
      // Search by make and model
      const makeModelMatch = await db.select()
        .from(vehicleSpecifications)
        .where(sql`LOWER(make) LIKE ${`%${normalizedQuery}%`} OR LOWER(model) LIKE ${`%${normalizedQuery}%`}`)
        .limit(10);
      
      return makeModelMatch;
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }
}