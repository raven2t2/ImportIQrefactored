/**
 * Strategic Intelligence Layer Test Suite
 * Validates User Intent Classification, Import Risk Index, and Strategic Recommendations
 */

import { smartParser } from './smart-parser';

async function testStrategicIntelligence() {
  console.log('🔍 Testing Strategic Intelligence Layer...\n');

  // Test 1: BMW M3 E46 - Enthusiast/Tuner Query
  console.log('Test 1: BMW M3 E46 Pattern Recognition with Strategic Intelligence');
  const bmwResult = await smartParser.intelligentVehicleLookup('BMW M3 E46');
  console.log('Result:', JSON.stringify(bmwResult, null, 2));
  console.log('\n---\n');

  // Test 2: VIN Decode with Strategic Intelligence
  console.log('Test 2: VIN Decode with Risk Assessment');
  const vinResult = await smartParser.decodeVIN('WBADT43452G234567');
  console.log('VIN Result:', JSON.stringify(vinResult, null, 2));
  console.log('\n---\n');

  // Test 3: Intent Classification Test - Drift Car
  console.log('Test 3: User Intent Classification - Drift Car');
  const driftResult = await smartParser.intelligentVehicleLookup('drift car nissan skyline');
  console.log('Drift Intent:', JSON.stringify(driftResult.userIntent, null, 2));
  console.log('Risk Index:', JSON.stringify(driftResult.importRiskIndex, null, 2));
  console.log('\n---\n');

  // Test 4: Strategic Recommendations - Skyline GT-R
  console.log('Test 4: Strategic Recommendations for High-Risk Vehicle');
  const gtrResult = await smartParser.intelligentVehicleLookup('skyline gtr r34');
  console.log('Strategic Recommendations:', JSON.stringify(gtrResult.strategicRecommendations, null, 2));
  console.log('\n---\n');

  // Test 5: Multi-manufacturer VIN Coverage
  console.log('Test 5: Multi-manufacturer VIN Coverage Test');
  const manufacturers = [
    'WBADT43452G234567', // BMW
    'JN1CV6EL4BM234567', // Nissan
    'WP0ZZZ99ZXS234567', // Porsche
    'ZHWGU11S39LA23456', // Lamborghini
    'ZFF65LFA4E0234567'  // Ferrari
  ];

  for (const vin of manufacturers) {
    const result = await smartParser.decodeVIN(vin);
    console.log(`${vin}: ${result.data?.make} ${result.data?.model} - ${result.confidenceScore}% confidence`);
  }

  console.log('\n✅ Strategic Intelligence Layer testing completed!');
}

// Run the test
testStrategicIntelligence().catch(console.error);