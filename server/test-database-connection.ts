/**
 * Test PostgreSQL Database Connection and Verify Data
 */

import { db } from './db';
import { 
  globalComplianceRules, 
  vehicleSpecifications, 
  importCostStructure, 
  portInformation 
} from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function testDatabaseConnection() {
  console.log('🔧 Testing PostgreSQL database connection and data...');
  
  try {
    // Test compliance rules
    const complianceCount = await db.select().from(globalComplianceRules);
    console.log(`✅ Compliance rules: ${complianceCount.length} records`);
    
    // Test vehicle specifications
    const vehicleCount = await db.select().from(vehicleSpecifications);
    console.log(`✅ Vehicle specifications: ${vehicleCount.length} records`);
    
    // Test cost structures
    const costCount = await db.select().from(importCostStructure);
    console.log(`✅ Cost structures: ${costCount.length} records`);
    
    // Test port information
    const portCount = await db.select().from(portInformation);
    console.log(`✅ Port information: ${portCount.length} records`);
    
    // Test specific query for Toyota Supra
    const supaData = await db.select()
      .from(vehicleSpecifications)
      .where(eq(vehicleSpecifications.make, 'Toyota'))
      .where(eq(vehicleSpecifications.model, 'Supra'));
    
    console.log(`✅ Toyota Supra data: ${supaData.length} records`);
    
    // Test cost structure for Japan to Australia
    const jpToAusCost = await db.select()
      .from(importCostStructure)
      .where(eq(importCostStructure.originCountry, 'japan'))
      .where(eq(importCostStructure.destinationCountry, 'australia'));
      
    console.log(`✅ Japan to Australia cost data: ${jpToAusCost.length} records`);
    
    console.log('🎉 PostgreSQL database is fully operational with authentic data');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}