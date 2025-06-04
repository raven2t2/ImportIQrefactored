/**
 * Live Market Data Integration
 * Monitors authentic JDM and US car datasets every 12 hours
 * Provides real-time pricing with currency conversion
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface JDMVehicle {
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
  source: 'GOONET';
}

interface USVehicle {
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
  source: 'US_CLASSIC';
}

interface LiveMarketData {
  jdmVehicles: JDMVehicle[];
  usVehicles: USVehicle[];
  lastUpdated: string;
  nextUpdate: string;
  exchangeRates: {
    jpyToAud: number;
    usdToAud: number;
  };
}

// API endpoints for authentic datasets
const JDM_GOONET_API = 'https://api.apify.com/v2/datasets/VMNgVmAgcCNYQZtNI/items?clean=true&format=json';
const US_CLASSIC_API = 'https://api.apify.com/v2/datasets/EFjwLXRVn4w9QKgPV/items?clean=true&format=json';

// Exchange rate API (free tier)
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

let cachedMarketData: LiveMarketData | null = null;
let updateInterval: NodeJS.Timeout | null = null;

/**
 * Get current exchange rates for currency conversion
 */
async function getExchangeRates(): Promise<{ jpyToAud: number; usdToAud: number }> {
  try {
    console.log('Fetching current exchange rates...');
    const response = await axios.get(EXCHANGE_RATE_API, { timeout: 10000 });
    const rates = response.data.rates;
    
    return {
      jpyToAud: rates.AUD / rates.JPY,
      usdToAud: rates.AUD,
    };
  } catch (error) {
    console.error('Failed to fetch exchange rates, using defaults:', error);
    // Fallback rates (approximate)
    return {
      jpyToAud: 0.0095, // 1 JPY ≈ 0.0095 AUD
      usdToAud: 1.50,   // 1 USD ≈ 1.50 AUD
    };
  }
}

/**
 * Fetch and process JDM vehicles from GOONET
 */
async function fetchJDMVehicles(exchangeRates: { jpyToAud: number; usdToAud: number }): Promise<JDMVehicle[]> {
  try {
    console.log('Fetching authentic JDM vehicles from GOONET...');
    const response = await axios.get(JDM_GOONET_API, { timeout: 30000 });
    const rawData = response.data;
    
    if (!Array.isArray(rawData)) {
      console.error('JDM API returned invalid data format');
      return [];
    }

    const vehicles = rawData.slice(0, 100).map((item: any) => {
      // Extract price and convert to number
      const priceText = item.price || item.priceText || '0';
      const priceJPY = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
      const priceAUD = Math.round(priceJPY * exchangeRates.jpyToAud);

      // Extract vehicle details
      const title = item.title || item.name || 'Unknown Vehicle';
      const make = extractMake(title);
      const model = extractModel(title, make);
      const year = extractYear(title) || new Date().getFullYear();

      return {
        id: item.id || `jdm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        price: priceJPY,
        currency: 'JPY',
        priceAUD,
        make,
        model,
        year,
        mileage: item.mileage || item.odometer || 'Unknown',
        location: item.location || item.prefecture || 'Japan',
        url: item.url || item.link || '',
        images: Array.isArray(item.images) ? item.images.slice(0, 5) : [],
        transmission: item.transmission || 'Unknown',
        fuelType: item.fuelType || item.fuel || 'Petrol',
        engineSize: item.engineSize || item.displacement || 'Unknown',
        description: item.description || item.comments || '',
        lastUpdated: new Date().toISOString(),
        source: 'GOONET' as const,
      };
    }).filter((vehicle: JDMVehicle) => vehicle.priceAUD > 1000); // Filter out invalid entries

    console.log(`Successfully processed ${vehicles.length} JDM vehicles from GOONET`);
    return vehicles;
  } catch (error) {
    console.error('Failed to fetch JDM vehicles:', error);
    return [];
  }
}

/**
 * Fetch and process US vehicles from classic car dataset
 */
async function fetchUSVehicles(exchangeRates: { jpyToAud: number; usdToAud: number }): Promise<USVehicle[]> {
  try {
    console.log('Fetching authentic US classic/muscle cars...');
    const response = await axios.get(US_CLASSIC_API, { timeout: 30000 });
    const rawData = response.data;
    
    if (!Array.isArray(rawData)) {
      console.error('US API returned invalid data format');
      return [];
    }

    const vehicles = rawData.slice(0, 100).map((item: any) => {
      // Extract price and convert to number
      const priceText = item.price || item.asking_price || '0';
      const priceUSD = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
      const priceAUD = Math.round(priceUSD * exchangeRates.usdToAud);

      // Extract vehicle details
      const title = item.title || item.name || item.make_model || 'Unknown Vehicle';
      const make = item.make || extractMake(title);
      const model = item.model || extractModel(title, make);
      const year = item.year || extractYear(title) || new Date().getFullYear();

      return {
        id: item.id || `us_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        price: priceUSD,
        currency: 'USD',
        priceAUD,
        make,
        model,
        year,
        mileage: item.mileage || item.miles || item.odometer || 'Unknown',
        location: item.location || item.city || item.state || 'USA',
        url: item.url || item.link || item.listing_url || '',
        images: Array.isArray(item.images) ? item.images.slice(0, 5) : [],
        transmission: item.transmission || 'Unknown',
        fuelType: item.fuelType || item.fuel || 'Petrol',
        engineSize: item.engine || item.engineSize || 'Unknown',
        description: item.description || item.details || '',
        lastUpdated: new Date().toISOString(),
        source: 'US_CLASSIC' as const,
      };
    }).filter((vehicle: USVehicle) => vehicle.priceAUD > 1000); // Filter out invalid entries

    console.log(`Successfully processed ${vehicles.length} US classic/muscle cars`);
    return vehicles;
  } catch (error) {
    console.error('Failed to fetch US vehicles:', error);
    return [];
  }
}

/**
 * Extract make from vehicle title
 */
function extractMake(title: string): string {
  const commonMakes = [
    'Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Lexus', 'Infiniti', 'Acura',
    'Ford', 'Chevrolet', 'Dodge', 'Chrysler', 'Cadillac', 'Buick', 'GMC', 'Lincoln', 'Mercury', 'Pontiac',
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Ferrari', 'Lamborghini', 'Maserati'
  ];
  
  const upperTitle = title.toUpperCase();
  for (const make of commonMakes) {
    if (upperTitle.includes(make.toUpperCase())) {
      return make;
    }
  }
  
  // Extract first word as fallback
  return title.split(' ')[0] || 'Unknown';
}

/**
 * Extract model from vehicle title
 */
function extractModel(title: string, make: string): string {
  const titleWords = title.split(' ');
  const makeIndex = titleWords.findIndex(word => 
    word.toLowerCase() === make.toLowerCase()
  );
  
  if (makeIndex >= 0 && makeIndex < titleWords.length - 1) {
    return titleWords.slice(makeIndex + 1, makeIndex + 3).join(' ');
  }
  
  return titleWords.slice(1, 3).join(' ') || 'Unknown';
}

/**
 * Extract year from vehicle title
 */
function extractYear(title: string): number | null {
  const yearMatch = title.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? parseInt(yearMatch[0]) : null;
}

/**
 * Perform full market data refresh
 */
export async function refreshLiveMarketData(): Promise<LiveMarketData> {
  try {
    console.log('Starting live market data refresh...');
    
    // Get current exchange rates
    const exchangeRates = await getExchangeRates();
    
    // Fetch data from both sources in parallel
    const [jdmVehicles, usVehicles] = await Promise.all([
      fetchJDMVehicles(exchangeRates),
      fetchUSVehicles(exchangeRates)
    ]);
    
    const marketData: LiveMarketData = {
      jdmVehicles,
      usVehicles,
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
      exchangeRates
    };
    
    // Cache the data
    cachedMarketData = marketData;
    
    // Save to file for persistence
    const dataPath = path.join(process.cwd(), 'live-market-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(marketData, null, 2));
    
    console.log(`Live market data refresh completed: ${jdmVehicles.length} JDM + ${usVehicles.length} US vehicles`);
    return marketData;
    
  } catch (error) {
    console.error('Failed to refresh live market data:', error);
    throw error;
  }
}

/**
 * Get cached market data or trigger refresh if needed
 */
export function getLiveMarketData(): LiveMarketData | null {
  // Check if we have cached data and if it's still fresh
  if (cachedMarketData) {
    const nextUpdate = new Date(cachedMarketData.nextUpdate);
    if (Date.now() < nextUpdate.getTime()) {
      return cachedMarketData;
    }
  }
  
  // Try to load from file
  try {
    const dataPath = path.join(process.cwd(), 'live-market-data.json');
    if (fs.existsSync(dataPath)) {
      const fileData = fs.readFileSync(dataPath, 'utf-8');
      const data: LiveMarketData = JSON.parse(fileData);
      
      // Check if file data is still fresh
      const nextUpdate = new Date(data.nextUpdate);
      if (Date.now() < nextUpdate.getTime()) {
        cachedMarketData = data;
        return data;
      }
    }
  } catch (error) {
    console.error('Failed to load cached market data:', error);
  }
  
  return null;
}

/**
 * Initialize live market data monitoring
 */
export function initializeLiveMarketData() {
  console.log('Initializing live market data monitoring (12-hour intervals)...');
  
  // Initial refresh
  refreshLiveMarketData().catch(error => {
    console.error('Initial market data refresh failed:', error);
  });
  
  // Set up 12-hour refresh interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  updateInterval = setInterval(() => {
    console.log('Performing scheduled market data refresh...');
    refreshLiveMarketData().catch(error => {
      console.error('Scheduled market data refresh failed:', error);
    });
  }, 12 * 60 * 60 * 1000); // 12 hours
  
  console.log('Live market data monitoring initialized - next update in 12 hours');
}

/**
 * Get market analysis from live data
 */
export function getMarketAnalysis(): {
  totalVehicles: number;
  averagePriceAUD: number;
  jdmCount: number;
  usCount: number;
  priceRanges: { range: string; count: number }[];
  topMakes: { make: string; count: number; avgPrice: number }[];
} {
  const data = getLiveMarketData();
  if (!data) {
    return {
      totalVehicles: 0,
      averagePriceAUD: 0,
      jdmCount: 0,
      usCount: 0,
      priceRanges: [],
      topMakes: []
    };
  }
  
  const allVehicles = [...data.jdmVehicles, ...data.usVehicles];
  const totalVehicles = allVehicles.length;
  const averagePriceAUD = totalVehicles > 0 
    ? Math.round(allVehicles.reduce((sum, v) => sum + v.priceAUD, 0) / totalVehicles)
    : 0;
  
  // Price ranges
  const priceRanges = [
    { range: 'Under $20k AUD', count: allVehicles.filter(v => v.priceAUD < 20000).length },
    { range: '$20k-$50k AUD', count: allVehicles.filter(v => v.priceAUD >= 20000 && v.priceAUD < 50000).length },
    { range: '$50k-$100k AUD', count: allVehicles.filter(v => v.priceAUD >= 50000 && v.priceAUD < 100000).length },
    { range: '$100k+ AUD', count: allVehicles.filter(v => v.priceAUD >= 100000).length }
  ];
  
  // Top makes
  const makeStats: { [make: string]: { count: number; totalPrice: number } } = {};
  allVehicles.forEach(vehicle => {
    if (!makeStats[vehicle.make]) {
      makeStats[vehicle.make] = { count: 0, totalPrice: 0 };
    }
    makeStats[vehicle.make].count++;
    makeStats[vehicle.make].totalPrice += vehicle.priceAUD;
  });
  
  const topMakes = Object.entries(makeStats)
    .map(([make, stats]) => ({
      make,
      count: stats.count,
      avgPrice: Math.round(stats.totalPrice / stats.count)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalVehicles,
    averagePriceAUD,
    jdmCount: data.jdmVehicles.length,
    usCount: data.usVehicles.length,
    priceRanges,
    topMakes
  };
}