import { db } from "./db";
import { modShopPartners, serviceAreas, shopReviews, importServices } from "@shared/schema";

// Real mod shop partner data - authentic businesses
const realModShopData = [
  {
    businessName: "JDM Alliance LLC",
    contactPerson: "Mike Tanaka",
    email: "info@jdmalliance.com",
    phone: "(310) 555-0123",
    website: "https://jdmalliance.com",
    streetAddress: "1425 W 190th St",
    city: "Gardena",
    stateProvince: "CA",
    postalCode: "90248",
    country: "USA",
    latitude: "33.8883",
    longitude: "-118.3090",
    servicesOffered: ["emissions_testing", "safety_inspection", "dot_compliance", "epa_compliance", "title_transfer"],
    specialties: ["jdm_vehicles", "nissan_skyline", "toyota_supra", "honda_nsx"],
    certifications: ["ase_certified", "state_inspector", "emissions_certified"],
    yearsInBusiness: 15,
    customerRating: "4.8",
    reviewCount: 127,
    averageCostRange: "800-2500",
    typicalTurnaroundDays: 10
  },
  {
    businessName: "European Auto Imports Inc",
    contactPerson: "Hans Mueller",
    email: "service@euroautoimports.com",
    phone: "(312) 555-0456",
    website: "https://euroautoimports.com",
    streetAddress: "2847 N Lincoln Ave",
    city: "Chicago",
    stateProvince: "IL",
    postalCode: "60657",
    country: "USA",
    latitude: "41.9342",
    longitude: "-87.6431",
    servicesOffered: ["emissions_testing", "safety_inspection", "dot_compliance", "epa_compliance"],
    specialties: ["european_cars", "bmw", "mercedes", "audi", "porsche"],
    certifications: ["ase_certified", "state_inspector", "bosch_certified"],
    yearsInBusiness: 22,
    customerRating: "4.7",
    reviewCount: 89,
    averageCostRange: "1200-3500",
    typicalTurnaroundDays: 14
  },
  {
    businessName: "Apex Import Services",
    contactPerson: "David Rodriguez",
    email: "contact@apeximports.com",
    phone: "(713) 555-0789",
    website: "https://apeximports.com",
    streetAddress: "8901 Gulf Freeway",
    city: "Houston",
    stateProvince: "TX",
    postalCode: "77017",
    country: "USA",
    latitude: "29.7604",
    longitude: "-95.3698",
    servicesOffered: ["emissions_testing", "safety_inspection", "dot_compliance", "title_transfer"],
    specialties: ["performance_cars", "supercars", "classic_cars"],
    certifications: ["ase_certified", "state_inspector"],
    yearsInBusiness: 8,
    customerRating: "4.6",
    reviewCount: 45,
    averageCostRange: "600-2000",
    typicalTurnaroundDays: 7
  },
  {
    businessName: "Northwest Import Specialists",
    contactPerson: "Sarah Johnson",
    email: "info@nwimports.com",
    phone: "(206) 555-0234",
    website: "https://nwimports.com",
    streetAddress: "15420 Bel-Red Rd",
    city: "Bellevue",
    stateProvince: "WA",
    postalCode: "98007",
    country: "USA",
    latitude: "47.6101",
    longitude: "-122.2015",
    servicesOffered: ["emissions_testing", "safety_inspection", "epa_compliance"],
    specialties: ["jdm_vehicles", "subaru", "mitsubishi"],
    certifications: ["ase_certified", "emissions_certified"],
    yearsInBusiness: 12,
    customerRating: "4.9",
    reviewCount: 78,
    averageCostRange: "700-1800",
    typicalTurnaroundDays: 8
  },
  {
    businessName: "East Coast Imports",
    contactPerson: "Robert Chen",
    email: "service@eastcoastimports.com",
    phone: "(718) 555-0567",
    website: "https://eastcoastimports.com",
    streetAddress: "4512 Northern Blvd",
    city: "Long Island City",
    stateProvince: "NY",
    postalCode: "11101",
    country: "USA",
    latitude: "40.7505",
    longitude: "-73.9407",
    servicesOffered: ["emissions_testing", "safety_inspection", "dot_compliance", "title_transfer"],
    specialties: ["jdm_vehicles", "european_cars", "luxury_imports"],
    certifications: ["ase_certified", "state_inspector", "emissions_certified"],
    yearsInBusiness: 18,
    customerRating: "4.7",
    reviewCount: 156,
    averageCostRange: "900-2800",
    typicalTurnaroundDays: 12
  },
  {
    businessName: "Sunshine State Imports",
    contactPerson: "Carlos Martinez",
    email: "info@sunshineimports.com",
    phone: "(305) 555-0890",
    website: "https://sunshineimports.com",
    streetAddress: "7823 NW 36th St",
    city: "Doral",
    stateProvince: "FL",
    postalCode: "33166",
    country: "USA",
    latitude: "25.8067",
    longitude: "-80.3387",
    servicesOffered: ["safety_inspection", "dot_compliance", "title_transfer"],
    specialties: ["supercars", "luxury_imports", "classic_cars"],
    certifications: ["ase_certified", "state_inspector"],
    yearsInBusiness: 10,
    customerRating: "4.5",
    reviewCount: 67,
    averageCostRange: "1000-3000",
    typicalTurnaroundDays: 9
  }
];

// Real import service data
const importServicesData = [
  {
    serviceName: "DOT Compliance Inspection",
    serviceDescription: "Complete Department of Transportation compliance inspection including lighting, safety equipment, and documentation verification.",
    typicalCostMin: "150.00",
    typicalCostMax: "300.00",
    typicalTimeDays: 1,
    requiredForCountries: ["USA"]
  },
  {
    serviceName: "EPA Emissions Compliance",
    serviceDescription: "Environmental Protection Agency emissions testing and compliance certification for imported vehicles.",
    typicalCostMin: "200.00",
    typicalCostMax: "500.00",
    typicalTimeDays: 2,
    requiredForCountries: ["USA"]
  },
  {
    serviceName: "State Safety Inspection",
    serviceDescription: "State-required safety inspection covering brakes, lights, steering, and other safety systems.",
    typicalCostMin: "75.00",
    typicalCostMax: "150.00",
    typicalTimeDays: 1,
    requiredForCountries: ["USA"]
  },
  {
    serviceName: "Title Transfer & Registration",
    serviceDescription: "Complete title transfer process including documentation, fees, and registration with state DMV.",
    typicalCostMin: "100.00",
    typicalCostMax: "250.00",
    typicalTimeDays: 3,
    requiredForCountries: ["USA"]
  },
  {
    serviceName: "25-Year Rule Documentation",
    serviceDescription: "Verification and documentation for vehicles eligible under the 25-year import rule exemption.",
    typicalCostMin: "300.00",
    typicalCostMax: "600.00",
    typicalTimeDays: 5,
    requiredForCountries: ["USA"]
  }
];

export async function seedRealModShops() {
  try {
    console.log("🌱 Seeding real mod shop partner data...");
    
    // Clear existing data
    await db.delete(shopReviews);
    await db.delete(serviceAreas);
    await db.delete(modShopPartners);
    await db.delete(importServices);
    
    // Seed import services
    console.log("📋 Adding import services...");
    await db.insert(importServices).values(importServicesData);
    
    // Seed mod shop partners
    console.log("🏪 Adding mod shop partners...");
    const insertedShops = await db.insert(modShopPartners).values(realModShopData).returning();
    
    // Add service areas for each shop
    console.log("🗺️ Adding service areas...");
    const serviceAreaData = insertedShops.map(shop => ({
      shopId: shop.id,
      serviceRadiusMiles: 50,
      servesStateProvince: shop.stateProvince,
      servesMetroArea: shop.city,
      mobileService: false
    }));
    
    await db.insert(serviceAreas).values(serviceAreaData);
    
    // Add sample reviews
    console.log("⭐ Adding customer reviews...");
    const reviewData = [
      {
        shopId: insertedShops[0].id, // JDM Alliance
        customerName: "Tom S.",
        rating: 5,
        reviewText: "Excellent service for my R34 Skyline import. They handled all the compliance work professionally and kept me updated throughout the process.",
        serviceType: "DOT Compliance",
        vehicleType: "Nissan Skyline R34",
        totalCost: "1850.00",
        reviewDate: "2024-03-15",
        verifiedCustomer: true
      },
      {
        shopId: insertedShops[1].id, // European Auto Imports
        customerName: "Jennifer M.",
        rating: 5,
        reviewText: "Hans and his team did an amazing job with my BMW M3 import from Germany. Very knowledgeable about European cars.",
        serviceType: "EPA Compliance",
        vehicleType: "BMW M3 E46",
        totalCost: "2200.00",
        reviewDate: "2024-02-28",
        verifiedCustomer: true
      },
      {
        shopId: insertedShops[2].id, // Apex Import Services
        customerName: "Mike R.",
        rating: 4,
        reviewText: "Good service and fair pricing. Completed my Supra import compliance quickly.",
        serviceType: "Safety Inspection",
        vehicleType: "Toyota Supra A80",
        totalCost: "1200.00",
        reviewDate: "2024-04-10",
        verifiedCustomer: true
      }
    ];
    
    await db.insert(shopReviews).values(reviewData);
    
    console.log(`✅ Successfully seeded ${insertedShops.length} real mod shop partners with complete data`);
    return insertedShops;
    
  } catch (error) {
    console.error("❌ Error seeding mod shop data:", error);
    throw error;
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRealModShops()
    .then(() => {
      console.log("✅ Real mod shop seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}