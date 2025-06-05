/**
 * Live Market Data Integration
 * Uses Apify dataset exclusively with comprehensive image extraction
 * Provides real-time pricing with currency conversion
 */

import axios from 'axios';

interface ApifyVehicle {
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
  source: 'APIFY_DATASET';
}

interface LiveMarketData {
  vehicles: ApifyVehicle[];
  lastUpdated: string;
  exchangeRates: {
    jpyToAud: number;
    usdToAud: number;
  };
}

// Exchange rate cache
let exchangeRateCache: { jpyToAud: number; usdToAud: number; lastUpdated: Date } | null = null;

/**
 * Fetch current exchange rates
 */
async function getExchangeRates(): Promise<{ jpyToAud: number; usdToAud: number }> {
  // Return cached rates if less than 1 hour old
  if (exchangeRateCache && Date.now() - exchangeRateCache.lastUpdated.getTime() < 3600000) {
    return { jpyToAud: exchangeRateCache.jpyToAud, usdToAud: exchangeRateCache.usdToAud };
  }

  try {
    console.log('Fetching current exchange rates...');
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const rates = response.data.rates;
    
    const usdToAud = rates.AUD || 1.54;
    const jpyToAud = (1 / rates.JPY) * usdToAud || 0.0108;

    // Cache the rates
    exchangeRateCache = {
      jpyToAud,
      usdToAud,
      lastUpdated: new Date()
    };

    console.log(`Exchange rates - JPY to AUD: ${jpyToAud.toFixed(6)}, USD to AUD: ${usdToAud.toFixed(4)}`);
    return { jpyToAud, usdToAud };
  } catch (error) {
    console.error('Error fetching exchange rates, using fallback rates:', error);
    return { jpyToAud: 0.0108, usdToAud: 1.54 };
  }
}

/**
 * Fetch and process vehicles from Apify dataset
 */
async function fetchApifyVehicles(): Promise<ApifyVehicle[]> {
  try {
    console.log('Fetching vehicles from Apify dataset...');
    const response = await axios.get('https://api.apify.com/v2/datasets/sWaxRHE9a8UN4sM7F/items?clean=true&format=json');
    const rawData = response.data;

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn('No data received from Apify dataset');
      return [];
    }

    const exchangeRates = await getExchangeRates();
    const vehicles: ApifyVehicle[] = [];

    for (const item of rawData) {
      try {
        const vehicle = processApifyItem(item, exchangeRates);
        if (vehicle) {
          vehicles.push(vehicle);
        }
      } catch (error) {
        console.warn('Error processing vehicle item:', error);
      }
    }

    console.log(`Successfully processed ${vehicles.length} vehicles from Apify dataset`);
    return vehicles;
  } catch (error) {
    console.error('Error fetching Apify dataset:', error);
    return [];
  }
}

/**
 * Process individual Apify dataset item
 */
function processApifyItem(item: any, exchangeRates: { jpyToAud: number; usdToAud: number }): ApifyVehicle | null {
  try {
    // Extract all available images
    const images: string[] = [];
    
    // Primary image
    if (item.image && typeof item.image === 'string') {
      images.push(item.image);
    }
    
    // Additional images from various possible fields
    const imageFields = ['images', 'imageUrls', 'photos', 'gallery', 'pictures'];
    for (const field of imageFields) {
      if (item[field]) {
        if (Array.isArray(item[field])) {
          images.push(...item[field].filter((url: any) => typeof url === 'string'));
        } else if (typeof item[field] === 'string') {
          images.push(item[field]);
        }
      }
    }

    // Remove duplicates and invalid URLs
    const uniqueImages = Array.from(new Set(images)).filter(img => 
      img && img.startsWith('http') && (img.includes('.jpg') || img.includes('.jpeg') || img.includes('.png') || img.includes('.webp'))
    );

    // Extract price and convert to AUD
    let price = 0;
    let currency = 'USD';
    let priceAUD = 0;

    if (item.price) {
      const priceStr = String(item.price).replace(/[^\d.-]/g, '');
      price = parseFloat(priceStr) || 0;
      
      // Determine currency from price field or location
      if (item.price.includes('¥') || item.location?.includes('Japan')) {
        currency = 'JPY';
        priceAUD = price * exchangeRates.jpyToAud;
      } else {
        currency = 'USD';
        priceAUD = price * exchangeRates.usdToAud;
      }
    }

    // Extract make and model
    const title = item.title || item.name || '';
    const { make, model } = extractMakeModel(title);

    // Extract year
    const year = extractYear(title) || item.year || 2020;

    return {
      id: item.id || `apify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      price: price,
      currency: currency,
      priceAUD: Math.round(priceAUD),
      make: make,
      model: model,
      year: year,
      mileage: item.mileage || item.odometer || 'Unknown',
      location: item.location || 'Japan',
      url: item.url || item.link || '#',
      images: uniqueImages,
      transmission: item.transmission || 'Manual',
      fuelType: item.fuelType || item.fuel || 'Gasoline',
      engineSize: item.engineSize || item.engine || 'Unknown',
      description: item.description || item.details || title,
      lastUpdated: new Date().toISOString(),
      source: 'APIFY_DATASET'
    };
  } catch (error) {
    console.warn('Error processing Apify item:', error);
    return null;
  }
}

/**
 * Extract make and model from title
 */
function extractMakeModel(title: string): { make: string; model: string } {
  const titleUpper = title.toUpperCase();
  
  const makes = [
    'TOYOTA', 'NISSAN', 'HONDA', 'MAZDA', 'SUBARU', 'MITSUBISHI', 'SUZUKI', 'DAIHATSU',
    'LEXUS', 'INFINITI', 'ACURA', 'BMW', 'MERCEDES', 'AUDI', 'VOLKSWAGEN', 'PORSCHE',
    'FORD', 'CHEVROLET', 'DODGE', 'PLYMOUTH', 'PONTIAC', 'BUICK', 'CADILLAC', 'CHRYSLER'
  ];

  let make = 'Unknown';
  let model = 'Unknown';

  for (const makeName of makes) {
    if (titleUpper.includes(makeName)) {
      make = makeName.charAt(0) + makeName.slice(1).toLowerCase();
      
      // Extract model after make
      const makeIndex = titleUpper.indexOf(makeName);
      const afterMake = title.substring(makeIndex + makeName.length).trim();
      const modelMatch = afterMake.match(/^[A-Za-z0-9-]+/);
      if (modelMatch) {
        model = modelMatch[0];
      }
      break;
    }
  }

  // Special cases for popular models
  if (titleUpper.includes('SUPRA')) {
    make = 'Toyota';
    model = 'Supra';
  } else if (titleUpper.includes('SKYLINE') || titleUpper.includes('GTR') || titleUpper.includes('GT-R')) {
    make = 'Nissan';
    model = titleUpper.includes('GTR') || titleUpper.includes('GT-R') ? 'GT-R' : 'Skyline';
  } else if (titleUpper.includes('CIVIC')) {
    make = 'Honda';
    model = 'Civic';
  } else if (titleUpper.includes('IMPREZA')) {
    make = 'Subaru';
    model = 'Impreza';
  }

  return { make, model };
}

/**
 * Extract year from title
 */
function extractYear(title: string): number | null {
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    if (year >= 1980 && year <= new Date().getFullYear()) {
      return year;
    }
  }
  return null;
}

// Global cache for market data
let marketDataCache: LiveMarketData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Get live market data (cached for 12 hours)
 */
export async function getLiveMarketData(): Promise<LiveMarketData> {
  const now = Date.now();
  
  // Return cached data if less than 12 hours old
  if (marketDataCache && (now - lastFetchTime) < CACHE_DURATION) {
    return marketDataCache;
  }

  console.log('Refreshing live market data...');
  
  try {
    const vehicles = await fetchApifyVehicles();
    const exchangeRates = await getExchangeRates();

    marketDataCache = {
      vehicles,
      lastUpdated: new Date().toISOString(),
      exchangeRates
    };

    lastFetchTime = now;
    
    console.log(`Market data refresh completed: ${vehicles.length} vehicles`);
    return marketDataCache;
  } catch (error) {
    console.error('Error refreshing market data:', error);
    
    // Return cached data if available, otherwise empty data
    return marketDataCache || {
      vehicles: [],
      lastUpdated: new Date().toISOString(),
      exchangeRates: { jpyToAud: 0.0108, usdToAud: 1.54 }
    };
  }
}

/**
 * Initialize market data monitoring
 */
export function initializeLiveMarketDataMonitoring() {
  console.log('Initializing live market data monitoring (12-hour intervals)...');
  
  // Initial fetch
  getLiveMarketData().catch(console.error);
  
  // Set up 12-hour refresh interval
  setInterval(() => {
    console.log('Starting scheduled market data refresh...');
    getLiveMarketData().catch(console.error);
  }, CACHE_DURATION);
  
  console.log('Live market data monitoring initialized - next update in 12 hours');
}