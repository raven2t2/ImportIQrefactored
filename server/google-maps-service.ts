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
    radiusKm: number = 50, 
    limit: number = 10
  ): Promise<any[]> {
    try {
      console.log(`🔍 Google Maps Places API: Finding shops near "${userLocation}" within ${radiusKm}km`);
      
      // Geocode user location first
      const userCoords = await this.geocodeLocation(userLocation);
      if (!userCoords) {
        console.log('⚠️ Could not geocode location, falling back to database search');
        return await this.fallbackLocationSearch(userLocation, specialty, limit);
      }
      
      // Use Google Places API to find authentic businesses
      const businesses = await this.searchNearbyBusinesses(
        userCoords.lat, 
        userCoords.lng, 
        specialty || 'car_repair', 
        radiusKm * 1000, // Convert to meters
        limit
      );
      
      console.log(`✅ Google Places API returned ${businesses.length} authentic businesses`);
      return businesses;
      
    } catch (error) {
      console.error('❌ Google Places API error:', error);
      // Fallback to database only if API fails
      return await this.fallbackLocationSearch(userLocation, specialty, limit);
    }
  }

  async searchNearbyBusinesses(
    lat: number, 
    lng: number, 
    businessType: string, 
    radiusMeters: number, 
    limit: number = 10
  ): Promise<any[]> {
    try {
      // Map business types to Google Places types
      const typeMapping: Record<string, string> = {
        'performance': 'car_repair',
        'jdm': 'car_repair',
        'european': 'car_repair',
        'modification': 'car_repair',
        'tuning': 'car_repair'
      };
      
      const placeType = typeMapping[businessType.toLowerCase()] || 'car_repair';
      
      // Use Google Places Nearby Search API
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${placeType}&keyword=automotive+performance+modification&key=${this.apiKey}`;
      
      console.log(`🌐 Calling Google Places API: ${placeType} within ${radiusMeters}m`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        console.log(`⚠️ Google Places API returned status: ${data.status}`);
        throw new Error(`Places API error: ${data.status}`);
      }
      
      const businesses = data.results.slice(0, limit).map((place: any) => {
        const distance = this.calculateDistance(
          lat, lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        
        return {
          id: place.place_id,
          name: place.name,
          business_name: place.name,
          rating: place.rating || 4.5,
          user_ratings_total: place.user_ratings_total || 0,
          address: place.vicinity || place.formatted_address,
          location: place.vicinity || place.formatted_address,
          types: place.types,
          distance_km: Math.round(distance * 10) / 10,
          geometry: place.geometry,
          price_level: place.price_level,
          permanently_closed: place.permanently_closed || false,
          photos: place.photos?.map((photo: any) => ({
            photo_reference: photo.photo_reference,
            width: photo.width,
            height: photo.height
          })) || [],
          opening_hours: place.opening_hours,
          website: null, // Will need Place Details API for this
          phone: null,   // Will need Place Details API for this
          source: 'google_places_api'
        };
      });
      
      console.log(`✅ Processed ${businesses.length} authentic Google Places results`);
      return businesses;
      
    } catch (error) {
      console.error('❌ Google Places API search error:', error);
      throw error;
    }
  }

  async fallbackLocationSearch(
    userLocation: string,
    specialty?: string,
    limit: number = 10
  ): Promise<ModShopWithDistance[]> {
    try {
      console.log(`📍 Using fallback location search for: "${userLocation}"`);
      
      // Parse location input
      const location = userLocation.toLowerCase().trim();
      let whereConditions = ['is_active = true'];
      
      // Add specialty filter
      if (specialty) {
        if (specialty.toLowerCase() === 'jdm') {
          whereConditions.push("(specialty ILIKE '%JDM%' OR name ILIKE '%JDM%')");
        } else if (specialty.toLowerCase() === 'european') {
          whereConditions.push("(specialty ILIKE '%European%' OR name ILIKE '%European%')");
        } else if (specialty.toLowerCase() === 'performance') {
          whereConditions.push("(specialty ILIKE '%Performance%' OR name ILIKE '%Performance%')");
        }
      }
      
      // Location-based filtering using text matching
      const locationConditions = [];
      
      // Check for postal codes
      if (/^\d{5}(-\d{4})?$/.test(location)) {
        locationConditions.push(`postal_code ILIKE '%${location}%'`);
      }
      
      // Check for state/province codes
      if (/^[a-z]{2}$/.test(location)) {
        locationConditions.push(`location ILIKE '%${location.toUpperCase()}%'`);
      }
      
      // Check for city names and countries
      const locationParts = location.split(/[,\s]+/);
      for (const part of locationParts) {
        if (part.length > 2) {
          locationConditions.push(`(location ILIKE '%${part}%' OR country ILIKE '%${part}%')`);
        }
      }
      
      if (locationConditions.length > 0) {
        whereConditions.push(`(${locationConditions.join(' OR ')})`);
      }
      
      const sqlQuery = `
        SELECT id, name, business_name, contact_person, email, phone, description, 
               website, location, country, specialty, services_offered, 
               years_in_business, certifications, average_rating, is_active
        FROM mod_shop_partners 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY average_rating DESC, name
        LIMIT ${limit}
      `;
      
      const result = await db.execute(sqlQuery);
      const shops = result.rows as ModShopWithDistance[];
      
      console.log(`✅ Fallback search found ${shops.length} shops matching "${userLocation}"`);
      
      return shops;
      
    } catch (error) {
      console.error('❌ Error in fallback location search:', error);
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