/**
 * Market Data Integration for Authentic Auction Data
 * Connects our comprehensive auction scrapers to the frontend display
 */

import { getAuthenticJapaneseListings } from './legitimate-japanese-data';
import { scrapeAllUSAuctions } from './us-auction-scraper';
import { scrapeWithAdvancedAntiBotBypass } from './advanced-anti-bot-scraper';

interface MarketVehicle {
  id: string;
  title: string;
  price: number;
  currency: string;
  priceAUD: number;
  make: string;
  model: string;
  year: number;
  mileage: string;
  location: string;
  url: string;
  images: string[];
  transmission: string;
  fuelType: string;
  engineSize: string;
  description: string;
  lastUpdated: string;
  source: string;
}

interface MarketData {
  vehicles: MarketVehicle[];
  lastUpdated: string;
  exchangeRates: {
    jpyToAud: number;
    usdToAud: number;
  };
}

// Cache for market data
let marketDataCache: MarketData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get current exchange rates
 */
async function getExchangeRates(): Promise<{ jpyToAud: number; usdToAud: number }> {
  try {
    console.log('Fetching current exchange rates...');
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    const usdToAud = data.rates.AUD || 1.54;
    const jpyToAud = (1 / data.rates.JPY) * usdToAud || 0.0108;

    console.log(`Exchange rates - JPY to AUD: ${jpyToAud.toFixed(6)}, USD to AUD: ${usdToAud.toFixed(4)}`);
    return { jpyToAud, usdToAud };
  } catch (error) {
    console.error('Error fetching exchange rates, using fallback rates:', error);
    return { jpyToAud: 0.0108, usdToAud: 1.54 };
  }
}

/**
 * Convert Japanese auction listing to MarketVehicle
 */
function convertJapaneseItem(listing: any, exchangeRates: { jpyToAud: number }): MarketVehicle {
  return {
    id: listing.id || `jp_${Math.random().toString(36).substr(2, 9)}`,
    title: `${listing.year || ''} ${listing.make || ''} ${listing.model || ''}`.trim(),
    price: listing.price || 0,
    currency: 'JPY',
    priceAUD: Math.round((listing.price || 0) * exchangeRates.jpyToAud),
    make: listing.make || 'Unknown',
    model: listing.model || 'Unknown',
    year: listing.year || new Date().getFullYear(),
    mileage: listing.mileage || 'Unknown',
    location: listing.location || 'Japan',
    url: listing.url || '',
    images: listing.images || [],
    transmission: listing.specifications?.transmission || 'Unknown',
    fuelType: listing.specifications?.fuelType || 'Petrol',
    engineSize: listing.specifications?.engine || 'Unknown',
    description: listing.description || '',
    lastUpdated: new Date().toISOString(),
    source: 'Japanese Auctions'
  };
}

/**
 * Convert US auction listing to MarketVehicle
 */
function convertUSItem(listing: any, exchangeRates: { usdToAud: number }): MarketVehicle {
  return {
    id: listing.id || `us_${Math.random().toString(36).substr(2, 9)}`,
    title: `${listing.year || ''} ${listing.make || ''} ${listing.model || ''}`.trim(),
    price: listing.price || 0,
    currency: 'USD',
    priceAUD: Math.round((listing.price || 0) * exchangeRates.usdToAud),
    make: listing.make || 'Unknown',
    model: listing.model || 'Unknown',
    year: listing.year || new Date().getFullYear(),
    mileage: listing.mileage || 'Unknown',
    location: listing.location || 'USA',
    url: listing.url || '',
    images: listing.images || [],
    transmission: listing.transmission || 'Unknown',
    fuelType: listing.fuelType || 'Petrol',
    engineSize: listing.engineSize || 'Unknown',
    description: listing.description || '',
    lastUpdated: new Date().toISOString(),
    source: 'US Auctions'
  };
}

/**
 * Fetch authentic market data from our scrapers
 */
export async function getMarketData(): Promise<MarketData> {
  const now = Date.now();
  
  // Return cached data if recent
  if (marketDataCache && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Returning cached market data');
    return marketDataCache;
  }

  console.log('Fetching fresh authentic market data...');
  
  try {
    const exchangeRates = await getExchangeRates();
    const vehicles: MarketVehicle[] = [];
    
    // High-demand models to prioritize
    const priorityModels = [
      { make: 'Toyota', model: 'Supra' },
      { make: 'Nissan', model: 'Skyline' },
      { make: 'Honda', model: 'NSX' },
      { make: 'Mazda', model: 'RX-7' }
    ];
    
    // Fetch Japanese auction data for priority models
    for (const { make, model } of priorityModels) {
      try {
        console.log(`Fetching Japanese auction data for ${make} ${model}...`);
        const japaneseResult = await getAuthenticJapaneseListings(make, model);
        
        if (japaneseResult.success && japaneseResult.listings) {
          for (const listing of japaneseResult.listings.slice(0, 5)) {
            const converted = convertJapaneseItem(listing, exchangeRates);
            vehicles.push(converted);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error fetching Japanese data for ${make} ${model}:`, error);
      }
    }
    
    // Fetch US auction data for priority makes
    const priorityMakes = ['Toyota', 'Nissan', 'Honda'];
    for (const make of priorityMakes) {
      try {
        console.log(`Fetching US auction data for ${make}...`);
        const usResult = await scrapeAllUSAuctions(make);
        
        for (const listing of usResult.slice(0, 4)) {
          const converted = convertUSItem(listing, exchangeRates);
          vehicles.push(converted);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`Error fetching US data for ${make}:`, error);
      }
    }
    
    // If we need more data, use advanced scraping for Supras specifically
    if (vehicles.length < 15) {
      try {
        console.log('Fetching additional Supra data with advanced scraping...');
        const supraData = await scrapeWithAdvancedAntiBotBypass('Toyota', 'Supra');
        
        for (const listing of supraData.slice(0, 8)) {
          const converted = convertJapaneseItem(listing, exchangeRates);
          vehicles.push(converted);
        }
      } catch (error) {
        console.error('Error with advanced Supra scraping:', error);
      }
    }

    const marketData: MarketData = {
      vehicles: vehicles.slice(0, 50), // Limit to 50 total vehicles
      lastUpdated: new Date().toISOString(),
      exchangeRates
    };

    // Cache the data
    marketDataCache = marketData;
    lastFetchTime = now;
    
    console.log(`Market data refresh completed: ${vehicles.length} authentic vehicles`);
    return marketData;
    
  } catch (error) {
    console.error('Error fetching market data:', error);
    
    // Return cached data if available, otherwise empty data
    return marketDataCache || {
      vehicles: [],
      lastUpdated: new Date().toISOString(),
      exchangeRates: { jpyToAud: 0.0108, usdToAud: 1.54 }
    };
  }
}

/**
 * Force refresh market data
 */
export async function refreshMarketData(): Promise<MarketData> {
  marketDataCache = null;
  lastFetchTime = 0;
  return getMarketData();
}