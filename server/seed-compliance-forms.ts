import { ComplianceFormsSeeder } from "./compliance-forms-seeder";

/**
 * Seed the global vehicle import compliance forms database
 * Run this script to populate authentic government forms and requirements
 */
async function seedComplianceDatabase() {
  try {
    console.log('🌍 Starting global vehicle import compliance forms database seeding...');
    
    await ComplianceFormsSeeder.seedComplianceDatabase();
    
    console.log('✅ Global compliance forms database seeding completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding compliance forms database:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedComplianceDatabase();
}

export { seedComplianceDatabase };