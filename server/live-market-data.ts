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
    console.log('Fetching vehicles from enhanced dataset...');
    
    // Try to load from local file first (contains comprehensive image data)
    const fs = await import('fs');
    try {
      const localData = fs.readFileSync('./live-market-data.json', 'utf8');
      const rawData = JSON.parse(localData);
      console.log('Using enhanced local dataset with comprehensive images');
      
      const exchangeRates = await getExchangeRates();
      const vehicles: ApifyVehicle[] = [];

      for (const item of rawData) {
        const processed = processEnhancedItem(item, exchangeRates);
        if (processed) {
          vehicles.push(processed);
        }
      }

      console.log(`Successfully processed ${vehicles.length} vehicles from enhanced dataset`);
      return vehicles;
    } catch (localError) {
      console.log('Local dataset not found, fetching from Apify...');
    }
    
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
 * Process individual enhanced dataset item
 */
function processEnhancedItem(item: any, exchangeRates: { jpyToAud: number; usdToAud: number }): ApifyVehicle | null {
  try {
    if (!item || !item.title || !item.price || !item.images || !Array.isArray(item.images)) {
      return null;
    }

    const { make, model } = extractMakeModel(item.title);
    const year = item.year ? parseInt(item.year) : extractYear(item.title) || 2020;
    const price = parseFloat(item.price.toString().replace(/[^\d.]/g, ''));
    const currency = item.currency || 'JPY';
    
    // Convert price to AUD
    let priceAUD = price;
    if (currency === 'JPY') {
      priceAUD = price * exchangeRates.jpyToAud;
    } else if (currency === 'USD') {
      priceAUD = price * exchangeRates.usdToAud;
    }

    return {
      id: `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: item.title.trim(),
      price: Math.round(priceAUD),
      currency: 'AUD',
      priceAUD: Math.round(priceAUD),
      make,
      model,
      year,
      mileage: item.mileage || 'Unknown',
      location: 'Japan',
      url: item.url || '',
      images: item.images.filter((img: string) => img && img.startsWith('http')),
      transmission: item.transmission || 'Unknown',
      fuelType: item.fuelType || 'Gasoline',
      engineSize: '3.0L',
      description: `${make} ${model} ${year} - Premium Japanese import vehicle`,
      lastUpdated: new Date().toISOString(),
      source: 'APIFY_DATASET'
    };
  } catch (error) {
    console.warn('Error processing enhanced item:', error);
    return null;
  }
}

/**
 * Process individual Apify dataset item
 */
function processApifyItem(item: any, exchangeRates: { jpyToAud: number; usdToAud: number }): ApifyVehicle | null {
  try {
    // Extract all available images from various sources
    const images: string[] = [];
    
    // Check JSON-LD schema for vehicle images
    if (item.metadata?.jsonLd) {
      for (const ld of item.metadata.jsonLd) {
        if (ld['@type'] === 'Product' && ld.image) {
          if (typeof ld.image === 'string') {
            images.push(ld.image);
          } else if (Array.isArray(ld.image)) {
            images.push(...ld.image.filter((url: any) => typeof url === 'string'));
          }
        }
      }
    }

    // Check OpenGraph images
    if (item.metadata?.openGraph) {
      for (const og of item.metadata.openGraph) {
        if (og.property === 'og:image' && og.content && og.content.includes('picture')) {
          images.push(og.content);
        }
      }
    }

    // Primary image field
    if (item.image && typeof item.image === 'string') {
      images.push(item.image);
    }
    
    // Additional image fields for different dataset structures
    const imageFields = ['images', 'imageUrls', 'photos', 'gallery', 'pictures', 'vehicleImages'];
    for (const field of imageFields) {
      if (item[field]) {
        if (Array.isArray(item[field])) {
          images.push(...item[field].filter((url: any) => typeof url === 'string'));
        } else if (typeof item[field] === 'string') {
          images.push(item[field]);
        }
      }
    }

    // Extract images from text content if needed
    if (item.text && images.length === 0) {
      const imageRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp)/gi;
      const textImages = item.text.match(imageRegex);
      if (textImages) {
        images.push(...textImages);
      }
    }

    // Remove duplicates and filter valid image URLs
    const uniqueImages = Array.from(new Set(images)).filter(img => 
      img && 
      img.startsWith('http') && 
      (img.includes('.jpg') || img.includes('.jpeg') || img.includes('.png') || img.includes('.webp')) &&
      !img.includes('fb_image.jpg') && // Exclude social media placeholder images
      !img.includes('common/other/')
    );

    // Extract price and convert to AUD from JSON-LD schema
    let price = 0;
    let currency = 'USD';
    let priceAUD = 0;

    // Check JSON-LD schema for price information
    if (item.metadata?.jsonLd) {
      for (const ld of item.metadata.jsonLd) {
        if (ld['@type'] === 'Product' && ld.offers) {
          if (ld.offers.price) {
            price = parseFloat(String(ld.offers.price).replace(/[^\d.-]/g, '')) || 0;
            currency = ld.offers.priceCurrency || 'JPY';
          }
        }
      }
    }

    // Fallback to text extraction if no structured price data
    if (price === 0 && item.text) {
      const priceMatch = item.text.match(/¥([\d,]+)/);
      if (priceMatch) {
        price = parseFloat(priceMatch[1].replace(/,/g, '')) || 0;
        currency = 'JPY';
      }
    }

    // Convert to AUD
    if (currency === 'JPY') {
      priceAUD = price * exchangeRates.jpyToAud;
    } else {
      priceAUD = price * exchangeRates.usdToAud;
    }

    // Extract vehicle details from JSON-LD schema and metadata
    let make = 'Unknown';
    let model = 'Unknown';
    let year = 2020;
    let title = '';

    if (item.metadata?.jsonLd) {
      for (const ld of item.metadata.jsonLd) {
        if (ld['@type'] === 'Product') {
          title = ld.name || '';
          if (ld.brand?.name) {
            make = ld.brand.name;
          }
        }
      }
    }

    // Extract from title if not found in structured data
    if (!title) {
      title = item.metadata?.title || item.text?.split('\n')[0] || 'Unknown Vehicle';
    }

    // Parse make/model/year from title
    const extracted = extractMakeModel(title);
    if (extracted.make !== 'Unknown') make = extracted.make;
    if (extracted.model !== 'Unknown') model = extracted.model;
    
    // Extract year from title
    const extractedYear = extractYear(title);
    if (extractedYear) year = extractedYear;

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