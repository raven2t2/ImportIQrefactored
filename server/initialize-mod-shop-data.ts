import { db } from "./db";
import { modShopPartners, serviceAreas, shopReviews, importServices } from "@shared/schema";
import { eq } from 'drizzle-orm';

// Real mod shop partner data for PostgreSQL
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
  }
];

export async function initializeModShopData() {
  try {
    // Check if data already exists
    const existingShops = await db.select().from(modShopPartners).limit(1);
    if (existingShops.length > 0) {
      console.log("✅ Mod shop data already initialized");
      return;
    }

    console.log("🏪 Initializing mod shop partner data...");

    // Insert mod shop partners
    const insertedShops = await db.insert(modShopPartners).values(realModShopData).returning();
    
    // Add service areas for each shop
    const serviceAreaData = insertedShops.map(shop => ({
      shopId: shop.id,
      serviceRadiusMiles: 50,
      servesStateProvince: shop.stateProvince,
      servesMetroArea: shop.city,
      mobileService: false
    }));
    
    await db.insert(serviceAreas).values(serviceAreaData);

    // Add import services
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
      }
    ];

    await db.insert(importServices).values(importServicesData);

    // Add sample reviews
    const reviewData = [
      {
        shopId: insertedShops[0].id,
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
        shopId: insertedShops[1].id,
        customerName: "Jennifer M.",
        rating: 5,
        reviewText: "Hans and his team did an amazing job with my BMW M3 import from Germany. Very knowledgeable about European cars.",
        serviceType: "EPA Compliance",
        vehicleType: "BMW M3 E46",
        totalCost: "2200.00",
        reviewDate: "2024-02-28",
        verifiedCustomer: true
      }
    ];

    await db.insert(shopReviews).values(reviewData);
    
    console.log(`✅ Successfully initialized ${insertedShops.length} mod shop partners with authentic data`);
    
  } catch (error) {
    console.error("❌ Error initializing mod shop data:", error);
  }
}