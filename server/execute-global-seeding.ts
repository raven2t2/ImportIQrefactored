import { seedGlobalModShops } from './global-mod-shop-seeder';

async function runGlobalSeeding() {
  try {
    console.log('🚀 Executing global mod shop database scaling...');
    await seedGlobalModShops();
    console.log('✅ Global mod shop seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Global seeding failed:', error);
    process.exit(1);
  }
}

runGlobalSeeding();