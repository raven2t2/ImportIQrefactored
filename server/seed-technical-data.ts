import { db } from "./db";
import { 
  vehicleTechnicalIntelligence, 
  popularVehicleModifications, 
  modificationCostAnalysis,
  vehicleInvestmentIntelligence 
} from "@shared/schema";

async function seedTechnicalData() {
  console.log("🔧 Seeding vehicle technical intelligence data...");

  try {
    // Nissan Skyline GT-R (R34)
    const [gtrTech] = await db.insert(vehicleTechnicalIntelligence).values({
      make: "Nissan",
      model: "Skyline GT-R",
      chassisCode: "BNR34",
      year: 1999,
      engineCode: "RB26DETT",
      engineType: "Inline-6 Twin Turbo",
      displacement: "2.6L (2568cc)",
      power: "280hp (JDM limited) / 320hp+ (actual)",
      torque: "368Nm (271 lb-ft)",
      compression: "8.5:1",
      configuration: "DOHC 24-valve",
      drivetrainType: "AWD ATTESA E-TS",
      transmission: "5-speed manual (Getrag)",
      differential: "Active LSD front/rear",
      rarityFactor: "Extremely rare - R34 GT-R production: 11,578 units",
      collectibilityScore: 95,
      productionNumbers: 11578,
      appreciationRate: 15.0,
      marketSegment: "blue_chip_jdm",
      technicalNotes: "Legendary RB26DETT engine with ceramic turbos, ATTESA E-TS AWD system"
    }).returning();

    // GT-R Popular Modifications
    await db.insert(popularVehicleModifications).values([
      {
        vehicleTechId: gtrTech.id,
        modificationName: "HKS GT-SS turbo upgrade",
        category: "turbo",
        estimatedCost: 8500,
        powerGain: "+150hp",
        torqueGain: "+180Nm",
        difficultyLevel: "professional",
        popularityRank: 1,
        brandName: "HKS",
        description: "High-flow GT-SS turbos for significant power increase"
      },
      {
        vehicleTechId: gtrTech.id,
        modificationName: "Tomei 2.8L stroker kit",
        category: "engine",
        estimatedCost: 15000,
        powerGain: "+200hp",
        torqueGain: "+250Nm",
        difficultyLevel: "professional",
        popularityRank: 2,
        brandName: "Tomei",
        description: "Complete stroker kit for increased displacement and power"
      },
      {
        vehicleTechId: gtrTech.id,
        modificationName: "Nismo heritage parts restoration",
        category: "restoration",
        estimatedCost: 12000,
        powerGain: "OEM+",
        difficultyLevel: "advanced",
        popularityRank: 3,
        brandName: "Nismo",
        description: "Authentic Nismo parts for period-correct restoration"
      },
      {
        vehicleTechId: gtrTech.id,
        modificationName: "Mine's ECU tune",
        category: "ecu",
        estimatedCost: 2500,
        powerGain: "+50hp",
        torqueGain: "+60Nm",
        difficultyLevel: "moderate",
        popularityRank: 4,
        brandName: "Mine's",
        description: "Professional ECU remapping by Mine's Motor Sports"
      }
    ]);

    // GT-R Modification Cost Analysis
    await db.insert(modificationCostAnalysis).values([
      {
        vehicleTechId: gtrTech.id,
        modificationStage: "stage1",
        stageName: "Stage 1 Tune",
        totalCost: 2500,
        powerOutput: "330hp",
        torqueOutput: "430Nm",
        expectedReliability: "Excellent",
        timeToComplete: "1-2 days",
        laborCosts: 800,
        partsCosts: 1500,
        miscCosts: 200,
        roi: "High - safe power gains"
      },
      {
        vehicleTechId: gtrTech.id,
        modificationStage: "stage2",
        stageName: "Turbo Upgrade",
        totalCost: 8500,
        powerOutput: "480hp",
        torqueOutput: "550Nm",
        expectedReliability: "Good",
        timeToComplete: "3-5 days",
        laborCosts: 2500,
        partsCosts: 5500,
        miscCosts: 500,
        roi: "Excellent - significant gains"
      },
      {
        vehicleTechId: gtrTech.id,
        modificationStage: "full_build",
        stageName: "Full Built Engine",
        totalCost: 25000,
        powerOutput: "700hp+",
        torqueOutput: "800Nm+",
        expectedReliability: "Moderate - track focused",
        timeToComplete: "2-4 weeks",
        laborCosts: 8000,
        partsCosts: 15000,
        miscCosts: 2000,
        roi: "Track/show car performance"
      }
    ]);

    // GT-R Investment Intelligence
    await db.insert(vehicleInvestmentIntelligence).values({
      vehicleTechId: gtrTech.id,
      currentMarketValue: 72325,
      fiveYearAppreciation: 15.0,
      tenYearAppreciation: 28.0,
      collectibilityRating: "blue_chip",
      liquidityRating: "high",
      marketFactors: {
        factors: ["25-year rule eligibility", "Limited production", "Motorsport heritage", "Pop culture icon"]
      },
      riskFactors: {
        risks: ["High maintenance costs", "Parts availability", "Import complexity"]
      },
      investmentGrade: "A+",
      holdingRecommendation: "Long-term hold - appreciation expected",
      sellingStrategy: "Wait for full US market eligibility in 2024"
    });

    // Toyota Supra (A80)
    const [supraTech] = await db.insert(vehicleTechnicalIntelligence).values({
      make: "Toyota",
      model: "Supra",
      chassisCode: "JZA80",
      year: 1995,
      engineCode: "2JZ-GTE",
      engineType: "Inline-6 Twin Turbo",
      displacement: "3.0L (2997cc)",
      power: "320hp (JDM) / 276hp (official)",
      torque: "440Nm (325 lb-ft)",
      compression: "8.5:1",
      configuration: "DOHC 24-valve",
      drivetrainType: "RWD",
      transmission: "6-speed manual (V161)",
      differential: "Torsen LSD",
      rarityFactor: "JDM twin-turbo production: ~11,000 units",
      collectibilityScore: 92,
      productionNumbers: 11000,
      appreciationRate: 18.0,
      marketSegment: "legend_status_jdm",
      technicalNotes: "Legendary 2JZ-GTE iron block engine, capable of 1000+ hp"
    }).returning();

    // Supra Popular Modifications
    await db.insert(popularVehicleModifications).values([
      {
        vehicleTechId: supraTech.id,
        modificationName: "Single turbo conversion",
        category: "turbo",
        estimatedCost: 12000,
        powerGain: "+300hp",
        torqueGain: "+400Nm",
        difficultyLevel: "professional",
        popularityRank: 1,
        description: "Convert from twin to single large turbo setup"
      },
      {
        vehicleTechId: supraTech.id,
        modificationName: "HKS T04Z turbo kit",
        category: "turbo",
        estimatedCost: 8500,
        powerGain: "+250hp",
        torqueGain: "+350Nm",
        difficultyLevel: "advanced",
        popularityRank: 2,
        brandName: "HKS",
        description: "Complete T04Z turbo kit with supporting modifications"
      },
      {
        vehicleTechId: supraTech.id,
        modificationName: "AEM standalone ECU",
        category: "ecu",
        estimatedCost: 3500,
        powerGain: "Tuning platform",
        difficultyLevel: "professional",
        popularityRank: 3,
        brandName: "AEM",
        description: "Complete engine management system"
      }
    ]);

    // Supra Modification Cost Analysis
    await db.insert(modificationCostAnalysis).values([
      {
        vehicleTechId: supraTech.id,
        modificationStage: "stage1",
        stageName: "ECU Tune",
        totalCost: 1800,
        powerOutput: "400hp",
        torqueOutput: "520Nm",
        expectedReliability: "Excellent",
        timeToComplete: "1 day",
        laborCosts: 600,
        partsCosts: 1000,
        miscCosts: 200,
        roi: "Excellent - unlocks hidden power"
      },
      {
        vehicleTechId: supraTech.id,
        modificationStage: "stage2",
        stageName: "Single Turbo",
        totalCost: 12000,
        powerOutput: "620hp",
        torqueOutput: "740Nm",
        expectedReliability: "Good",
        timeToComplete: "1-2 weeks",
        laborCosts: 3500,
        partsCosts: 7500,
        miscCosts: 1000,
        roi: "Excellent - dramatic transformation"
      }
    ]);

    // Subaru Impreza WRX STI
    const [stiTech] = await db.insert(vehicleTechnicalIntelligence).values({
      make: "Subaru",
      model: "Impreza WRX STI",
      chassisCode: "GDB",
      year: 2004,
      engineCode: "EJ257",
      engineType: "Flat-4 Turbo",
      displacement: "2.5L (2457cc)",
      power: "300hp (JDM STI)",
      torque: "407Nm (300 lb-ft)",
      compression: "8.2:1",
      configuration: "SOHC 16-valve boxer",
      drivetrainType: "Symmetrical AWD",
      transmission: "6-speed manual",
      differential: "Active center diff, mechanical LSDs",
      rarityFactor: "JDM STI variants highly sought after",
      collectibilityScore: 82,
      productionNumbers: 25000,
      appreciationRate: 8.5,
      marketSegment: "rally_heritage",
      technicalNotes: "Famous rally-bred AWD system with boxer engine"
    }).returning();

    // STI Popular Modifications
    await db.insert(popularVehicleModifications).values([
      {
        vehicleTechId: stiTech.id,
        modificationName: "Cobb AccessPort tune",
        category: "ecu",
        estimatedCost: 1200,
        powerGain: "+50hp",
        torqueGain: "+70Nm",
        difficultyLevel: "easy",
        popularityRank: 1,
        brandName: "Cobb",
        description: "Handheld tuning device for easy power gains"
      },
      {
        vehicleTechId: stiTech.id,
        modificationName: "Perrin intake system",
        category: "intake",
        estimatedCost: 800,
        powerGain: "+15hp",
        torqueGain: "+20Nm",
        difficultyLevel: "easy",
        popularityRank: 2,
        brandName: "Perrin",
        description: "Cold air intake system for improved airflow"
      }
    ]);

    console.log("✅ Technical intelligence data seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding technical data:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTechnicalData().then(() => process.exit(0));
}

export { seedTechnicalData };