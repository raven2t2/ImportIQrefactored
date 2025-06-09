import { db } from './db';

interface ModShopData {
  name: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  country: string;
  postalCode: string;
  specialty: string;
  description: string;
  servicesOffered: string[];
  yearsInBusiness: number;
  certifications: string[];
  averageRating: number;
  isActive: boolean;
}

const globalModShops: ModShopData[] = [
  // United States - California
  { name: "JDM Legends CA", businessName: "JDM Legends California LLC", contactPerson: "Mike Rodriguez", email: "mike@jdmlegends.com", phone: "+1-714-555-0123", website: "https://jdmlegends.com", location: "Los Angeles, CA", country: "United States", postalCode: "90210", specialty: "JDM Performance", description: "Premier JDM tuning and modification specialists serving Southern California", servicesOffered: ["Engine Tuning", "Suspension", "Turbo Upgrades", "ECU Mapping"], yearsInBusiness: 12, certifications: ["ASE Certified", "Tuning School Graduate"], averageRating: 4.8, isActive: true },
  { name: "Euro Dynamics", businessName: "European Automotive Dynamics Inc", contactPerson: "Andreas Mueller", email: "andreas@eurodynamics.com", phone: "+1-415-555-0456", website: "https://eurodynamics.com", location: "San Francisco, CA", country: "United States", postalCode: "94102", specialty: "European Performance", description: "Specializing in BMW, Mercedes, Audi, and Porsche performance modifications", servicesOffered: ["Engine Tuning", "Performance Exhaust", "Brake Upgrades", "Suspension"], yearsInBusiness: 8, certifications: ["BMW Certified", "Mercedes Specialist"], averageRating: 4.7, isActive: true },
  { name: "West Coast Tuning", businessName: "West Coast Automotive Tuning", contactPerson: "Sarah Chen", email: "sarah@westcoasttuning.com", phone: "+1-619-555-0789", website: "https://westcoasttuning.com", location: "San Diego, CA", country: "United States", postalCode: "92101", specialty: "Multi-Brand Performance", description: "Full-service performance shop specializing in Japanese and European imports", servicesOffered: ["Dyno Tuning", "Turbo Installation", "Roll Cage", "Track Prep"], yearsInBusiness: 15, certifications: ["SEMA Member", "Race Shop Certified"], averageRating: 4.9, isActive: true },
  { name: "Silicon Valley Motors", businessName: "Silicon Valley Motorsports", contactPerson: "David Park", email: "david@svmotors.com", phone: "+1-408-555-0321", website: "https://svmotors.com", location: "San Jose, CA", country: "United States", postalCode: "95110", specialty: "Electric & Hybrid Performance", description: "Cutting-edge electric vehicle and hybrid performance modifications", servicesOffered: ["EV Tuning", "Battery Upgrades", "Hybrid Systems", "Performance Electronics"], yearsInBusiness: 6, certifications: ["Tesla Certified", "EV Specialist"], averageRating: 4.6, isActive: true },

  // United States - Texas
  { name: "Lone Star Performance", businessName: "Lone Star Automotive Performance", contactPerson: "Jake Thompson", email: "jake@lonestarperf.com", phone: "+1-214-555-0654", website: "https://lonestarperf.com", location: "Dallas, TX", country: "United States", postalCode: "75201", specialty: "American Muscle & Import", description: "Texas-sized performance for muscle cars and imports", servicesOffered: ["Supercharger Installation", "Nitrous Systems", "Engine Builds", "Drag Prep"], yearsInBusiness: 18, certifications: ["NHRA Certified", "LSX Specialist"], averageRating: 4.8, isActive: true },
  { name: "Houston Import Specialists", businessName: "Houston Import Automotive", contactPerson: "Carlos Mendoza", email: "carlos@houstonimport.com", phone: "+1-713-555-0987", website: "https://houstonimport.com", location: "Houston, TX", country: "United States", postalCode: "77002", specialty: "JDM & European", description: "Houston's premier import performance and modification center", servicesOffered: ["JDM Conversions", "Turbo Upgrades", "Suspension", "Custom Fabrication"], yearsInBusiness: 11, certifications: ["Honda Performance Certified", "Subaru Specialist"], averageRating: 4.7, isActive: true },

  // United States - Illinois
  { name: "Windy City Tuning", businessName: "Chicago Performance Tuning LLC", contactPerson: "Robert Wilson", email: "rob@windycitytuning.com", phone: "+1-312-555-0147", website: "https://windycitytuning.com", location: "Chicago, IL", country: "United States", postalCode: "60601", specialty: "All-Weather Performance", description: "Cold-weather performance specialists for year-round driving", servicesOffered: ["All-Wheel Drive Tuning", "Winter Performance", "Track Prep", "Engine Management"], yearsInBusiness: 14, certifications: ["Subaru Performance", "AWD Specialist"], averageRating: 4.8, isActive: true },

  // United States - Washington
  { name: "Pacific Northwest Performance", businessName: "PNW Automotive Performance", contactPerson: "Lisa Johnson", email: "lisa@pnwperf.com", phone: "+1-206-555-0258", website: "https://pnwperf.com", location: "Seattle, WA", country: "United States", postalCode: "98101", specialty: "Rally & All-Weather", description: "Rally-inspired performance modifications for Pacific Northwest conditions", servicesOffered: ["Rally Prep", "Suspension Tuning", "Turbo Systems", "All-Weather Setup"], yearsInBusiness: 9, certifications: ["Rally America Certified", "Subaru STI Specialist"], averageRating: 4.9, isActive: true },

  // Canada - Ontario
  { name: "Toronto JDM Works", businessName: "Toronto Japanese Domestic Motors", contactPerson: "Ken Yamamoto", email: "ken@torontojdm.ca", phone: "+1-416-555-0369", website: "https://torontojdm.ca", location: "Toronto, ON", country: "Canada", postalCode: "M5V 2T6", specialty: "JDM Import Compliance", description: "Canadian JDM specialists with Transport Canada compliance expertise", servicesOffered: ["RIV Compliance", "DRL Installation", "Speedometer Conversion", "Safety Inspections"], yearsInBusiness: 16, certifications: ["Transport Canada Approved", "RIV Certified"], averageRating: 4.8, isActive: true },
  { name: "Maple Leaf Performance", businessName: "Maple Leaf Automotive Performance", contactPerson: "Pierre Dubois", email: "pierre@mapleleafperf.ca", phone: "+1-416-555-0741", website: "https://mapleleafperf.ca", location: "Toronto, ON", country: "Canada", postalCode: "M4W 1J1", specialty: "European Performance", description: "European performance specialists serving the GTA", servicesOffered: ["European Tuning", "Performance Upgrades", "Maintenance", "Track Prep"], yearsInBusiness: 12, certifications: ["BMW Canada Certified", "Audi Specialist"], averageRating: 4.7, isActive: true },

  // Canada - British Columbia
  { name: "Vancouver Import Motors", businessName: "Vancouver Import Automotive Ltd", contactPerson: "Emily Wang", email: "emily@vancouverimport.ca", phone: "+1-604-555-0852", website: "https://vancouverimport.ca", location: "Vancouver, BC", country: "Canada", postalCode: "V6B 1A1", specialty: "JDM Right-Hand Drive", description: "Right-hand drive specialists and JDM import experts", servicesOffered: ["RHD Conversions", "JDM Imports", "Compliance Work", "Performance Mods"], yearsInBusiness: 20, certifications: ["ICBC Approved", "RHD Specialist"], averageRating: 4.9, isActive: true },

  // Australia - New South Wales
  { name: "Sydney JDM Garage", businessName: "Sydney Japanese Domestic Motors Pty Ltd", contactPerson: "Matthew O'Brien", email: "matt@sydneyjdm.com.au", phone: "+61-2-555-0123", website: "https://sydneyjdm.com.au", location: "Sydney, NSW", country: "Australia", postalCode: "2000", specialty: "JDM Compliance & Performance", description: "Australia's leading JDM compliance and performance specialists", servicesOffered: ["RAWS Compliance", "Import Approval", "Performance Mods", "Engineering Certificates"], yearsInBusiness: 22, certifications: ["RAWS Approved", "NSW Engineering"], averageRating: 4.8, isActive: true },
  { name: "Aussie Euro Performance", businessName: "Australian European Performance", contactPerson: "Klaus Richter", email: "klaus@aussieeuro.com.au", phone: "+61-2-555-0456", website: "https://aussieeuro.com.au", location: "Sydney, NSW", country: "Australia", postalCode: "2010", specialty: "European Performance", description: "Premium European vehicle modifications and compliance", servicesOffered: ["BMW Tuning", "Mercedes Performance", "Audi Modifications", "Porsche Upgrades"], yearsInBusiness: 14, certifications: ["BMW Australia Certified", "TÜV Certified"], averageRating: 4.7, isActive: true },

  // Australia - Victoria
  { name: "Melbourne Performance Centre", businessName: "Melbourne Automotive Performance Centre", contactPerson: "James Mitchell", email: "james@melbourneperf.com.au", phone: "+61-3-555-0789", website: "https://melbourneperf.com.au", location: "Melbourne, VIC", country: "Australia", postalCode: "3000", specialty: "Multi-Brand Performance", description: "Melbourne's premier performance and modification specialists", servicesOffered: ["Dyno Tuning", "Engine Builds", "Turbo Systems", "Track Preparation"], yearsInBusiness: 18, certifications: ["Dyno Dynamics Certified", "Engine Builder"], averageRating: 4.9, isActive: true },

  // United Kingdom - England
  { name: "London JDM Centre", businessName: "London Japanese Domestic Motors Ltd", contactPerson: "Oliver Smith", email: "oliver@londonjdm.co.uk", phone: "+44-20-555-0123", website: "https://londonjdm.co.uk", location: "London, England", country: "United Kingdom", postalCode: "SW1A 1AA", specialty: "JDM Import & SVA", description: "UK's premier JDM import specialists with full SVA compliance", servicesOffered: ["SVA Testing", "IVA Compliance", "Import Registration", "Performance Mods"], yearsInBusiness: 25, certifications: ["DVLA Approved", "SVA Certified"], averageRating: 4.8, isActive: true },
  { name: "Birmingham Euro Works", businessName: "Birmingham European Automotive", contactPerson: "William Davies", email: "william@birminghameuro.co.uk", phone: "+44-121-555-0456", website: "https://birminghameuro.co.uk", location: "Birmingham, England", country: "United Kingdom", postalCode: "B1 1AA", specialty: "German Performance", description: "Specialist German performance modifications and tuning", servicesOffered: ["German Tuning", "Performance Exhaust", "ECU Remapping", "Suspension"], yearsInBusiness: 16, certifications: ["TÜV UK Certified", "VAG Specialist"], averageRating: 4.7, isActive: true },

  // Germany
  { name: "München Motorsport", businessName: "München Motorsport GmbH", contactPerson: "Hans Weber", email: "hans@muenchenmotorsport.de", phone: "+49-89-555-0123", website: "https://muenchenmotorsport.de", location: "Munich, Bavaria", country: "Germany", postalCode: "80331", specialty: "BMW Performance", description: "BMW birthplace performance specialists with factory connections", servicesOffered: ["BMW Tuning", "M-Power Upgrades", "Track Preparation", "Engine Building"], yearsInBusiness: 30, certifications: ["BMW Partner", "TÜV Certified"], averageRating: 4.9, isActive: true },
  { name: "Stuttgart Performance", businessName: "Stuttgart Performance GmbH", contactPerson: "Stefan Müller", email: "stefan@stuttgartperf.de", phone: "+49-711-555-0456", website: "https://stuttgartperf.de", location: "Stuttgart, Baden-Württemberg", country: "Germany", postalCode: "70173", specialty: "Porsche & Mercedes", description: "Home of Porsche and Mercedes performance modifications", servicesOffered: ["Porsche Tuning", "Mercedes AMG", "Performance Parts", "Custom Builds"], yearsInBusiness: 28, certifications: ["Porsche Partner", "Mercedes Certified"], averageRating: 4.8, isActive: true },

  // Japan
  { name: "Tokyo Tuning Works", businessName: "Tokyo Tuning Works Co. Ltd", contactPerson: "Hiroshi Tanaka", email: "hiroshi@tokyotuning.jp", phone: "+81-3-555-0123", website: "https://tokyotuning.jp", location: "Tokyo, Kanto", country: "Japan", postalCode: "100-0001", specialty: "JDM Original Source", description: "Original JDM performance parts and modifications from the source", servicesOffered: ["JDM Parts", "Performance Tuning", "Custom Builds", "Export Services"], yearsInBusiness: 35, certifications: ["JASMA Certified", "JGTC Approved"], averageRating: 4.9, isActive: true },
  { name: "Osaka Speed Shop", businessName: "Osaka Speed Shop KK", contactPerson: "Kenji Nakamura", email: "kenji@osakaspeed.jp", phone: "+81-6-555-0456", website: "https://osakaspeed.jp", location: "Osaka, Kansai", country: "Japan", postalCode: "530-0001", specialty: "Drift & Circuit", description: "Drift and circuit racing specialists in the heart of Japan", servicesOffered: ["Drift Setup", "Circuit Tuning", "Roll Cages", "Racing Prep"], yearsInBusiness: 20, certifications: ["D1GP Partner", "Super GT Certified"], averageRating: 4.8, isActive: true },

  // France
  { name: "Paris Performance", businessName: "Paris Performance SARL", contactPerson: "Jean-Pierre Laurent", email: "jean@parisperf.fr", phone: "+33-1-555-0123", website: "https://parisperf.fr", location: "Paris, Île-de-France", country: "France", postalCode: "75001", specialty: "French & European", description: "French automotive excellence with European performance expertise", servicesOffered: ["Renault Sport", "Peugeot Performance", "European Tuning", "Track Days"], yearsInBusiness: 22, certifications: ["Renault Sport Partner", "FIA Approved"], averageRating: 4.7, isActive: true },

  // Italy
  { name: "Milano Veloce", businessName: "Milano Veloce SRL", contactPerson: "Marco Rossi", email: "marco@milanoveloce.it", phone: "+39-02-555-0123", website: "https://milanoveloce.it", location: "Milan, Lombardy", country: "Italy", postalCode: "20121", specialty: "Italian Exotics", description: "Italian exotic car specialists - Ferrari, Lamborghini, Maserati", servicesOffered: ["Ferrari Tuning", "Lamborghini Mods", "Exotic Maintenance", "Track Prep"], yearsInBusiness: 26, certifications: ["Ferrari Approved", "Lamborghini Partner"], averageRating: 4.9, isActive: true },

  // Netherlands
  { name: "Amsterdam Performance", businessName: "Amsterdam Performance BV", contactPerson: "Pieter van Berg", email: "pieter@amsterdamperf.nl", phone: "+31-20-555-0123", website: "https://amsterdamperf.nl", location: "Amsterdam, North Holland", country: "Netherlands", postalCode: "1012 JS", specialty: "European Imports", description: "European import specialists with TÜV compliance expertise", servicesOffered: ["Import Compliance", "TÜV Certification", "Performance Mods", "Registration"], yearsInBusiness: 19, certifications: ["TÜV Partner", "RDW Certified"], averageRating: 4.8, isActive: true },

  // Belgium
  { name: "Brussels Euro Motors", businessName: "Brussels European Motors BVBA", contactPerson: "Philippe Dubois", email: "philippe@brusselseuro.be", phone: "+32-2-555-0123", website: "https://brusselseuro.be", location: "Brussels, Brussels-Capital", country: "Belgium", postalCode: "1000", specialty: "Luxury European", description: "Luxury European vehicle modifications and compliance", servicesOffered: ["Luxury Mods", "European Compliance", "Performance Tuning", "Concours Prep"], yearsInBusiness: 15, certifications: ["EU Type Approval", "Luxury Specialist"], averageRating: 4.7, isActive: true },

  // Switzerland
  { name: "Zurich Precision", businessName: "Zurich Precision Motorsport AG", contactPerson: "Andreas Zimmermann", email: "andreas@zurichprecision.ch", phone: "+41-44-555-0123", website: "https://zurichprecision.ch", location: "Zurich, Zurich", country: "Switzerland", postalCode: "8001", specialty: "Precision Engineering", description: "Swiss precision engineering for high-performance modifications", servicesOffered: ["Precision Tuning", "Swiss Engineering", "Alpine Setup", "Track Precision"], yearsInBusiness: 24, certifications: ["Swiss Engineering", "FIA Approved"], averageRating: 4.9, isActive: true },

  // New Zealand
  { name: "Auckland Performance", businessName: "Auckland Automotive Performance Ltd", contactPerson: "Mike Taylor", email: "mike@aucklandperf.co.nz", phone: "+64-9-555-0123", website: "https://aucklandperf.co.nz", location: "Auckland, North Island", country: "New Zealand", postalCode: "1010", specialty: "JDM & Rally", description: "New Zealand's JDM and rally performance specialists", servicesOffered: ["JDM Imports", "Rally Prep", "Compliance Work", "Performance Mods"], yearsInBusiness: 17, certifications: ["NZTA Certified", "Rally NZ Approved"], averageRating: 4.8, isActive: true },

  // United States - Additional Major Cities
  { name: "Motor City Performance", businessName: "Detroit Motor City Performance", contactPerson: "Tony Ricci", email: "tony@motorcityperf.com", phone: "+1-313-555-0147", website: "https://motorcityperf.com", location: "Detroit, MI", country: "United States", postalCode: "48201", specialty: "American Muscle", description: "Detroit's muscle car and performance headquarters", servicesOffered: ["LS Swaps", "Supercharger Kits", "Muscle Car Builds", "Drag Racing"], yearsInBusiness: 25, certifications: ["GM Performance Partner", "Ford Racing"], averageRating: 4.8, isActive: true },
  { name: "Mile High Motorsports", businessName: "Denver Mile High Motorsports", contactPerson: "Chris Anderson", email: "chris@milehighmotorsports.com", phone: "+1-303-555-0258", website: "https://milehighmotorsports.com", location: "Denver, CO", country: "United States", postalCode: "80202", specialty: "High Altitude Performance", description: "High altitude performance specialists and tuning experts", servicesOffered: ["Altitude Tuning", "Turbo Systems", "Engine Management", "Track Prep"], yearsInBusiness: 13, certifications: ["High Altitude Specialist", "Turbonetics Dealer"], averageRating: 4.7, isActive: true },
  { name: "Atlanta Import Works", businessName: "Atlanta Import Automotive Works", contactPerson: "Marcus Johnson", email: "marcus@atlantaimport.com", phone: "+1-404-555-0369", website: "https://atlantaimport.com", location: "Atlanta, GA", country: "United States", postalCode: "30301", specialty: "Import Performance", description: "Southeast's premier import performance and modification center", servicesOffered: ["Import Tuning", "Suspension Work", "Turbo Upgrades", "Custom Fabrication"], yearsInBusiness: 16, certifications: ["Import Specialist", "Fabrication Certified"], averageRating: 4.8, isActive: true },
  { name: "Vegas Speed Works", businessName: "Las Vegas Speed Works LLC", contactPerson: "Danny Rodriguez", email: "danny@vegasspeed.com", phone: "+1-702-555-0741", website: "https://vegasspeed.com", location: "Las Vegas, NV", country: "United States", postalCode: "89101", specialty: "Desert Performance", description: "Desert performance specialists for extreme conditions", servicesOffered: ["Desert Tuning", "Cooling Systems", "High-Temp Performance", "Off-Road"], yearsInBusiness: 11, certifications: ["Desert Racing Certified", "SCORE Approved"], averageRating: 4.6, isActive: true },
  { name: "Music City Motors", businessName: "Nashville Music City Motors", contactPerson: "Billy Carter", email: "billy@musiccitymotors.com", phone: "+1-615-555-0852", website: "https://musiccitymotors.com", location: "Nashville, TN", country: "United States", postalCode: "37201", specialty: "Southern Performance", description: "Southern hospitality meets high performance modifications", servicesOffered: ["Street Performance", "Show Cars", "Custom Paint", "Sound Systems"], yearsInBusiness: 14, certifications: ["Custom Car Specialist", "Audio Certified"], averageRating: 4.7, isActive: true },

  // Additional International Locations
  { name: "Dubai Exotic Motors", businessName: "Dubai Exotic Motors LLC", contactPerson: "Ahmed Al-Rashid", email: "ahmed@dubaiexotic.ae", phone: "+971-4-555-0123", website: "https://dubaiexotic.ae", location: "Dubai, UAE", country: "United Arab Emirates", postalCode: "00000", specialty: "Luxury Exotics", description: "Middle East's premier luxury and exotic vehicle specialists", servicesOffered: ["Exotic Tuning", "Luxury Mods", "Desert Setup", "Concours Prep"], yearsInBusiness: 12, certifications: ["Luxury Specialist", "UAE Approved"], averageRating: 4.9, isActive: true },
  { name: "Singapore Performance Hub", businessName: "Singapore Performance Hub Pte Ltd", contactPerson: "Li Wei Chen", email: "li@singaporeperf.sg", phone: "+65-555-0123", website: "https://singaporeperf.sg", location: "Singapore, Central", country: "Singapore", postalCode: "018989", specialty: "Asian Performance", description: "Southeast Asia's performance modification headquarters", servicesOffered: ["COE Compliance", "LTA Approval", "Performance Mods", "Track Days"], yearsInBusiness: 18, certifications: ["LTA Certified", "COE Specialist"], averageRating: 4.8, isActive: true },
  { name: "Hong Kong Speed Centre", businessName: "Hong Kong Speed Centre Ltd", contactPerson: "Jackie Wong", email: "jackie@hkspeed.hk", phone: "+852-555-0123", website: "https://hkspeed.hk", location: "Hong Kong, Central", country: "Hong Kong", postalCode: "00000", specialty: "Compact Performance", description: "Space-efficient performance solutions for urban environments", servicesOffered: ["Compact Tuning", "Urban Performance", "Space-Efficient Mods", "City Racing"], yearsInBusiness: 21, certifications: ["HK Transport Approved", "Urban Specialist"], averageRating: 4.7, isActive: true },
  { name: "São Paulo Speed Shop", businessName: "São Paulo Speed Shop Ltda", contactPerson: "Carlos Silva", email: "carlos@saopaulospeed.br", phone: "+55-11-555-0123", website: "https://saopaulospeed.br", location: "São Paulo, SP", country: "Brazil", postalCode: "01310-100", specialty: "South American Performance", description: "Brazil's leading performance modification specialists", servicesOffered: ["Flex Fuel Tuning", "Turbo Systems", "Performance Parts", "Racing Prep"], yearsInBusiness: 19, certifications: ["DETRAN Approved", "Flex Fuel Specialist"], averageRating: 4.8, isActive: true },
  { name: "Mexico City Tuning", businessName: "Mexico City Tuning SA de CV", contactPerson: "Roberto Hernandez", email: "roberto@mexicocitytuning.mx", phone: "+52-55-555-0123", website: "https://mexicocitytuning.mx", location: "Mexico City, CDMX", country: "Mexico", postalCode: "06000", specialty: "Latin Performance", description: "Latin America's performance and modification experts", servicesOffered: ["High Altitude Tuning", "Performance Mods", "Custom Builds", "Track Prep"], yearsInBusiness: 15, certifications: ["SEMARNAT Approved", "High Altitude Certified"], averageRating: 4.6, isActive: true }
];

export async function seedGlobalModShops(): Promise<void> {
  try {
    console.log('🌍 Starting global mod shop database seeding...');
    
    // Clear existing data
    await db.execute('DELETE FROM mod_shop_partners WHERE id > 0');
    console.log('🗑️ Cleared existing mod shop data');
    
    // Insert global mod shops in batches
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < globalModShops.length; i += batchSize) {
      const batch = globalModShops.slice(i, i + batchSize);
      
      for (const shop of batch) {
        const insertSQL = `
          INSERT INTO mod_shop_partners (
            name, business_name, contact_person, email, phone, website, 
            location, country, postal_code, specialty, description, 
            services_offered, years_in_business, certifications, 
            average_rating, is_active, created_at, updated_at
          ) VALUES (
            '${shop.name.replace(/'/g, "''")}',
            '${shop.businessName.replace(/'/g, "''")}',
            '${shop.contactPerson.replace(/'/g, "''")}',
            '${shop.email}',
            '${shop.phone}',
            '${shop.website}',
            '${shop.location.replace(/'/g, "''")}',
            '${shop.country.replace(/'/g, "''")}',
            '${shop.postalCode}',
            '${shop.specialty.replace(/'/g, "''")}',
            '${shop.description.replace(/'/g, "''")}',
            '${JSON.stringify(shop.servicesOffered).replace(/'/g, "''")}',
            ${shop.yearsInBusiness},
            '${JSON.stringify(shop.certifications).replace(/'/g, "''")}',
            ${shop.averageRating},
            ${shop.isActive},
            NOW(),
            NOW()
          )
        `;
        
        await db.execute(insertSQL);
        insertedCount++;
      }
      
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}, total shops: ${insertedCount}`);
    }
    
    console.log(`🎉 Successfully seeded ${insertedCount} global mod shops across ${new Set(globalModShops.map(s => s.country)).size} countries`);
    
    // Show distribution summary
    const countryDistribution = globalModShops.reduce((acc, shop) => {
      acc[shop.country] = (acc[shop.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('🌐 Global distribution:');
    Object.entries(countryDistribution).forEach(([country, count]) => {
      console.log(`   ${country}: ${count} shops`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding global mod shops:', error);
    throw error;
  }
}

export { globalModShops };