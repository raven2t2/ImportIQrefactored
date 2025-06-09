import { db } from './db';

interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
}

interface ModShopWithDistance {
  id: number;
  name: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  description: string;
  website: string;
  location: string;
  country: string;
  specialty: string;
  services_offered: string;
  years_in_business: number;
  certifications: string;
  average_rating: number;
  distance_km: number;
  is_active: boolean;
}

export class GoogleMapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY!;
    if (!this.apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY environment variable is required');
    }
  }

  async geocodeLocation(address: string): Promise<GeocodeResult | null> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.log(`⚠️ Geocoding failed for "${address}": ${data.status}`);
        return null;
      }
      
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;
      
      // Extract address components
      let country = '';
      let state = '';
      let city = '';
      let postalCode = '';
      
      for (const component of result.address_components) {
        const types = component.types;
        if (types.includes('country')) {
          country = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          city = component.long_name;
        } else if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
      }
      
      console.log(`✅ Geocoded "${address}" -> ${lat}, ${lng} (${result.formatted_address})`);
      
      return {
        lat,
        lng,
        formattedAddress: result.formatted_address,
        country,
        state,
        city,
        postalCode
      };
      
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return null;
    }
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async findNearbyShops(
    userLocation: string, 
    specialty?: string, 
    radiusKm: number = 100, 
    limit: number = 10
  ): Promise<ModShopWithDistance[]> {
    try {
      console.log(`🔍 Google Maps: Finding shops near "${userLocation}" within ${radiusKm}km`);
      
      // Geocode user location
      const userCoords = await this.geocodeLocation(userLocation);
      if (!userCoords) {
        console.log('❌ Could not geocode user location');
        return [];
      }
      
      // Get all mod shops from database
      let whereConditions = ['is_active = true'];
      
      if (specialty) {
        if (specialty.toLowerCase() === 'jdm') {
          whereConditions.push("(specialty ILIKE '%JDM%' OR name ILIKE '%JDM%')");
        } else if (specialty.toLowerCase() === 'european') {
          whereConditions.push("(specialty ILIKE '%European%' OR name ILIKE '%European%')");
        } else if (specialty.toLowerCase() === 'performance') {
          whereConditions.push("(specialty ILIKE '%Performance%' OR name ILIKE '%Performance%')");
        }
      }
      
      const sqlQuery = `
        SELECT id, name, business_name, contact_person, email, phone, description, 
               website, location, country, specialty, services_offered, 
               years_in_business, certifications, average_rating, is_active
        FROM mod_shop_partners 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY name
      `;
      
      const result = await db.execute(sqlQuery);
      const shops = result.rows;
      
      console.log(`📍 Found ${shops.length} shops in database, calculating distances...`);
      
      // Calculate distances and filter by radius
      const shopsWithDistance: ModShopWithDistance[] = [];
      
      for (const shop of shops) {
        // Geocode shop location
        const shopCoords = await this.geocodeLocation(shop.location as string);
        if (!shopCoords) {
          console.log(`⚠️ Could not geocode shop: ${shop.name} at ${shop.location}`);
          continue;
        }
        
        // Calculate distance
        const distance = this.calculateDistance(
          userCoords.lat, 
          userCoords.lng, 
          shopCoords.lat, 
          shopCoords.lng
        );
        
        // Only include shops within radius
        if (distance <= radiusKm) {
          shopsWithDistance.push({
            ...shop,
            distance_km: Math.round(distance * 10) / 10 // Round to 1 decimal place
          } as ModShopWithDistance);
        }
      }
      
      // Sort by distance and limit results
      const nearbyShops = shopsWithDistance
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, limit);
      
      console.log(`✅ Found ${nearbyShops.length} shops within ${radiusKm}km of ${userCoords.formattedAddress}`);
      
      return nearbyShops;
      
    } catch (error) {
      console.error('❌ Error finding nearby shops:', error);
      return [];
    }
  }

  async geocodeAllShops(): Promise<void> {
    try {
      console.log('🌍 Geocoding all mod shop locations for improved search...');
      
      const result = await db.execute(`
        SELECT id, name, location FROM mod_shop_partners 
        WHERE is_active = true AND (lat IS NULL OR lng IS NULL)
      `);
      
      const shops = result.rows;
      console.log(`📍 Geocoding ${shops.length} shop locations...`);
      
      for (const shop of shops) {
        const coords = await this.geocodeLocation(shop.location as string);
        if (coords) {
          // Update shop with coordinates
          await db.execute(`
            UPDATE mod_shop_partners 
            SET lat = ${coords.lat}, lng = ${coords.lng}, 
                formatted_address = '${coords.formattedAddress.replace(/'/g, "''")}',
                updated_at = NOW()
            WHERE id = ${shop.id}
          `);
          
          console.log(`✅ Geocoded: ${shop.name} -> ${coords.lat}, ${coords.lng}`);
        }
        
        // Rate limit to avoid API quota issues
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('✅ Shop geocoding completed');
      
    } catch (error) {
      console.error('❌ Error geocoding shops:', error);
    }
  }
}

export const googleMapsService = new GoogleMapsService();