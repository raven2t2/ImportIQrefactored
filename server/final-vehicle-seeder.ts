/**
 * Final Vehicle Database Seeder
 * Direct SQL insertion bypassing Drizzle schema mismatch issues
 */
import { db } from './db';
import { sql } from 'drizzle-orm';

export class FinalVehicleSeeder {
  /**
   * Seed vehicle data using direct SQL to bypass schema issues
   */
  static async seedFinalVehicles() {
    console.log('🚗 Seeding final vehicle database...');
    
    try {
      // Insert remaining vehicles using raw SQL
      await db.execute(sql`
        INSERT INTO vehicle_specifications (
          make, model, year, chassis, engine, displacement, transmission, 
          drive_type, fuel_type, body_style, doors, power, torque, 
          special_notes, is_verified
        ) VALUES 
        ('Mazda', 'RX-7', 1999, 'FD3S', '13B-REW', '1300', '5MT', 'RWD', 'Petrol', 'Coupe', 2, 280, 314, 'FD3S RX-7, twin-turbo rotary perfection | Market Value: $65000 | Rarity: 89/100 | Mod Potential: EXTREME | Import Status: ELIGIBLE', true),
        ('Subaru', 'Impreza WRX STI', 1999, 'GC8', 'EJ207', '2000', '5MT', 'AWD', 'Petrol', 'Sedan', 4, 280, 363, 'GC8 STI, rally-bred performance sedan | Market Value: $45000 | Rarity: 78/100 | Mod Potential: EXTREME | Import Status: ELIGIBLE_25_YEAR', true),
        ('Ford', 'Mustang', 1969, 'S-Code', '428 Cobra Jet', '7000', '4MT', 'RWD', 'Petrol', 'Coupe', 2, 335, 445, 'Legendary 428 Cobra Jet, ultimate muscle car | Market Value: $95000 | Rarity: 92/100 | Mod Potential: HIGH | Import Status: ELIGIBLE', true),
        ('Chevrolet', 'Camaro', 1969, 'F-Body', 'LS6 454', '7440', '4MT', 'RWD', 'Petrol', 'Coupe', 2, 450, 500, 'LS6 454 Camaro, big block muscle legend | Market Value: $125000 | Rarity: 95/100 | Mod Potential: HIGH | Import Status: ELIGIBLE', true),
        ('BMW', 'M3', 1995, 'E36', 'S50B32', '3200', '6MT', 'RWD', 'Petrol', 'Coupe', 2, 321, 350, 'E36 M3, naturally aspirated perfection | Market Value: $45000 | Rarity: 82/100 | Mod Potential: HIGH | Import Status: ELIGIBLE', true),
        ('Porsche', '911', 1995, '993', 'M64/05', '3600', '6MT', 'RWD', 'Petrol', 'Coupe', 2, 272, 330, '993 generation, last air-cooled 911 | Market Value: $125000 | Rarity: 92/100 | Mod Potential: MODERATE | Import Status: ELIGIBLE', true),
        ('Mitsubishi', 'Lancer Evolution IV', 1996, 'CN9A', '4G63T', '2000', '5MT', 'AWD', 'Petrol', 'Sedan', 4, 280, 373, 'Evo IV, rally-bred performance legend | Market Value: $55000 | Rarity: 85/100 | Mod Potential: EXTREME | Import Status: ELIGIBLE', true),
        ('Nissan', 'Silvia', 1999, 'S15', 'SR20DET', '2000', '6MT', 'RWD', 'Petrol', 'Coupe', 2, 250, 274, 'S15 Silvia, drift king chassis | Market Value: $35000 | Rarity: 75/100 | Mod Potential: EXTREME | Import Status: ELIGIBLE', true),
        ('Toyota', 'AE86', 1986, 'AE86', '4A-GE', '1600', '5MT', 'RWD', 'Petrol', 'Coupe', 2, 130, 149, 'AE86 Hachiroku, drift legend | Market Value: $25000 | Rarity: 88/100 | Mod Potential: HIGH | Import Status: ELIGIBLE', true),
        ('Honda', 'Civic Type R', 1997, 'EK9', 'B16B', '1600', '5MT', 'FWD', 'Petrol', 'Hatchback', 3, 185, 160, 'EK9 Type R, VTEC perfection | Market Value: $45000 | Rarity: 82/100 | Mod Potential: HIGH | Import Status: ELIGIBLE', true)
        ON CONFLICT (id) DO NOTHING
      `);
      
      console.log('✅ Seeded additional performance vehicles');
      return true;
    } catch (error) {
      console.error('❌ Failed to seed final vehicles:', error);
      return false;
    }
  }

  /**
   * Find vehicle by query using direct SQL search
   */
  static async findVehicle(query: string) {
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      // Search by chassis code first
      const chassisResults = await db.execute(sql`
        SELECT * FROM vehicle_specifications 
        WHERE LOWER(chassis) = ${normalizedQuery}
        LIMIT 1
      `);
      
      if (chassisResults.rows.length > 0) {
        return chassisResults.rows;
      }
      
      // Search by make and model
      const makeModelResults = await db.execute(sql`
        SELECT * FROM vehicle_specifications 
        WHERE LOWER(make) LIKE ${`%${normalizedQuery}%`} 
        OR LOWER(model) LIKE ${`%${normalizedQuery}%`}
        OR LOWER(chassis) LIKE ${`%${normalizedQuery}%`}
        ORDER BY 
          CASE 
            WHEN LOWER(chassis) = ${normalizedQuery} THEN 1
            WHEN LOWER(make) = ${normalizedQuery} THEN 2
            WHEN LOWER(model) = ${normalizedQuery} THEN 3
            ELSE 4
          END
        LIMIT 10
      `);
      
      return makeModelResults.rows;
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }

  /**
   * Get vehicle count to verify seeding
   */
  static async getVehicleCount() {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count FROM vehicle_specifications
      `);
      return result.rows[0]?.count || 0;
    } catch (error) {
      console.error('Failed to get vehicle count:', error);
      return 0;
    }
  }

  /**
   * Test database connectivity and data retrieval
   */
  static async testDatabase() {
    try {
      const count = await this.getVehicleCount();
      console.log(`📊 Vehicle database contains ${count} vehicles`);
      
      // Test a sample lookup
      const sampleResults = await this.findVehicle('GT-R');
      console.log(`🔍 Sample lookup for 'GT-R' returned ${sampleResults.length} results`);
      
      if (sampleResults.length > 0) {
        console.log(`✅ Found: ${sampleResults[0].make} ${sampleResults[0].model} (${sampleResults[0].chassis})`);
      }
      
      return true;
    } catch (error) {
      console.error('Database test failed:', error);
      return false;
    }
  }
}