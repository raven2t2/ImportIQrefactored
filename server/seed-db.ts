/**
 * Database Seeding Script - Populate PostgreSQL with authentic global data
 */

import { dataSeeder } from './data-seeder';

async function main() {
  try {
    console.log('Starting database seeding...');
    await dataSeeder.seedAllData();
    
    const summary = await dataSeeder.getSeededDataSummary();
    console.log('Database seeding completed successfully:');
    console.log(JSON.stringify(summary, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

main();