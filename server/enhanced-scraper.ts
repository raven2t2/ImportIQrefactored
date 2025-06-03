/**
 * Enhanced Market Data Scraper
 * Advanced anti-bot detection bypass for authentic vehicle data extraction
 */

import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

export interface EnhancedVehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: string;
  location: string;
  source: string;
  description: string;
  condition: string;
  listingDate: string;
  specifications: {
    engine?: string;
    transmission?: string;
    fuelType?: string;
    bodyType?: string;
  };
}

/**
 * Enhanced scraping with sophisticated anti-bot bypass
 */
export async function scrapeEnhancedAuctionData(make: string, model?: string): Promise<EnhancedVehicleData[]> {
  const vehicles: EnhancedVehicleData[] = [];
  
  // Multiple scraping strategies with anti-bot measures
  const strategies = [
    { name: 'Mobile RSS', fn: scrapeMobileRSS },
    { name: 'API Endpoints', fn: scrapeAPIEndpoints },
    { name: 'Search Aggregators', fn: scrapeSearchAggregators }
  ];
  
  for (const strategy of strategies) {
    try {
      console.log(`Attempting ${strategy.name} for ${make}${model ? ` ${model}` : ''}`);
      const results = await strategy.fn(make, model);
      vehicles.push(...results);
      
      if (vehicles.length >= 8) break;
      
      // Human-like delay between strategies
      await delay(2000 + Math.random() * 3000);
    } catch (error) {
      console.warn(`${strategy.name} failed:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  return vehicles;
}

/**
 * Mobile RSS feed scraping with rotating headers
 */
async function scrapeMobileRSS(make: string, model?: string): Promise<EnhancedVehicleData[]> {
  const vehicles: EnhancedVehicleData[] = [];
  
  const rssSources = [
    `https://rss.autotrader.com/atc/search/${make.toLowerCase()}`,
    `https://www.cars.com/rss/search/${make.toLowerCase()}`,
    `https://feeds.carmax.com/inventory/${make.toLowerCase()}`
  ];
  
  for (const rssUrl of rssSources) {
    try {
      const response = await makeEnhancedRequest(rssUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': getMobileUserAgent()
        }
      });
      
      if (response.status === 200) {
        const $ = cheerio.load(response.data, { xmlMode: true });
        
        $('item').each((index, element) => {
          const title = $(element).find('title').text();
          const description = $(element).find('description').text();
          const pubDate = $(element).find('pubDate').text();
          
          if (title.toLowerCase().includes(make.toLowerCase()) && 
              (!model || title.toLowerCase().includes(model.toLowerCase()))) {
            
            const vehicle = parseRSSVehicle(title, description, pubDate, rssUrl);
            if (vehicle) vehicles.push(vehicle);
          }
        });
      }
    } catch (error) {
      console.warn(`RSS scraping failed for ${rssUrl}`);
    }
  }
  
  return vehicles;
}

/**
 * API endpoint scraping with session simulation
 */
async function scrapeAPIEndpoints(make: string, model?: string): Promise<EnhancedVehicleData[]> {
  const vehicles: EnhancedVehicleData[] = [];
  
  const apiEndpoints = [
    {
      url: 'https://m.autotrader.com/rest/search/results',
      params: { make, model, zip: '90210' }
    },
    {
      url: 'https://mobile-api.cars.com/v1/inventory/search',
      params: { make, model_name: model }
    }
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await makeEnhancedRequest(endpoint.url, {
        params: endpoint.params,
        headers: {
          'User-Agent': getMobileUserAgent(),
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': generateSessionCookie()
        }
      });
      
      if (response.status === 200 && response.data) {
        const listings = parseAPIResponse(response.data, endpoint.url);
        vehicles.push(...listings);
      }
    } catch (error) {
      console.warn(`API endpoint failed for ${endpoint.url}`);
    }
  }
  
  return vehicles;
}

/**
 * Search aggregator scraping with browser simulation
 */
async function scrapeSearchAggregators(make: string, model?: string): Promise<EnhancedVehicleData[]> {
  const vehicles: EnhancedVehicleData[] = [];
  
  const searchUrls = [
    `https://www.edmunds.com/inventory/srp.html?make=${make}`,
    `https://www.kelleybluebook.com/cars-for-sale/${make.toLowerCase()}`,
    `https://www.carfax.com/cars-for-sale/${make.toLowerCase()}`
  ];
  
  for (const url of searchUrls) {
    try {
      const response = await makeEnhancedRequest(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': getDesktopUserAgent(),
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.google.com/'
        }
      });
      
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const listings = parseSearchResults($, make, model, url);
        vehicles.push(...listings);
      }
    } catch (error) {
      console.warn(`Search aggregator failed for ${url}`);
    }
  }
  
  return vehicles;
}

/**
 * Enhanced request with sophisticated anti-bot bypass
 */
async function makeEnhancedRequest(url: string, config: AxiosRequestConfig = {}): Promise<any> {
  const maxRetries = 6;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Simulate human browsing patterns with realistic delays
      if (attempt > 1) {
        const baseDelay = Math.pow(1.5, attempt) * 2000;
        const randomDelay = Math.random() * 4000;
        const humanDelay = baseDelay + randomDelay;
        await delay(humanDelay);
      }
      
      // Advanced header spoofing with browser fingerprinting
      const headers: any = {
        ...getAdvancedHeaders(attempt),
        'User-Agent': getRealisticUserAgent(attempt),
        'Accept-Language': getGeoLanguage(),
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': attempt === 1 ? 'none' : 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        ...config.headers
      };
      
      // Add realistic session persistence
      if (attempt > 1) {
        headers['Cookie'] = generateAdvancedSessionCookie(attempt);
        headers['Cache-Control'] = attempt > 3 ? 'no-cache, no-store' : 'max-age=0';
        headers['Pragma'] = attempt > 3 ? 'no-cache' : undefined;
        headers['Referer'] = getRealisticReferer(url);
      }
      
      // Add realistic viewport and screen resolution
      if (attempt > 2) {
        headers['Viewport-Width'] = getRandomViewport();
        headers['Device-Memory'] = getRandomDeviceMemory();
      }
      
      const response = await axios({
        url,
        timeout: 25000 + (attempt * 5000),
        maxRedirects: 8,
        validateStatus: (status) => status < 500,
        ...config,
        headers,
        // Simulate different network conditions
        httpAgent: new (require('http').Agent)({
          keepAlive: true,
          maxSockets: attempt > 3 ? 1 : 5,
          timeout: 30000
        }),
        httpsAgent: new (require('https').Agent)({
          keepAlive: true,
          maxSockets: attempt > 3 ? 1 : 5,
          timeout: 30000,
          rejectUnauthorized: false
        })
      });
      
      // Success criteria - accept more status codes
      if (response.status >= 200 && response.status < 400) {
        return response;
      }
      
      // Handle specific error codes
      if (response.status === 403) {
        throw new Error(`Anti-bot detection: ${response.status}`);
      } else if (response.status === 429) {
        throw new Error(`Rate limited: ${response.status}`);
      } else if (response.status >= 400) {
        throw new Error(`Client error: ${response.status}`);
      }
      
      throw new Error(`Unexpected status: ${response.status}`);
      
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('403') || errorMessage.includes('anti-bot')) {
          console.warn(`Anti-bot detection triggered on attempt ${attempt}/${maxRetries}, implementing countermeasures`);
          if (attempt < maxRetries) {
            // Aggressive anti-detection delay with jitter
            const antiDetectionDelay = 8000 + Math.random() * 12000;
            await delay(antiDetectionDelay);
          }
        } else if (errorMessage.includes('429') || errorMessage.includes('rate')) {
          console.warn(`Rate limit detected on attempt ${attempt}/${maxRetries}, backing off`);
          if (attempt < maxRetries) {
            // Exponential backoff for rate limiting
            const backoffDelay = Math.pow(3, attempt) * 5000 + Math.random() * 10000;
            await delay(backoffDelay);
          }
        } else if (errorMessage.includes('timeout') || errorMessage.includes('econnreset')) {
          console.warn(`Network issue on attempt ${attempt}/${maxRetries}, retrying with different approach`);
          if (attempt < maxRetries) {
            await delay(3000 + Math.random() * 5000);
          }
        }
      }
    }
  }
  
  throw lastError;
}

// Helper functions
function getRandomUserAgent(): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getMobileUserAgent(): string {
  const mobileAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0'
  ];
  return mobileAgents[Math.floor(Math.random() * mobileAgents.length)];
}

function getDesktopUserAgent(): string {
  const desktopAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  return desktopAgents[Math.floor(Math.random() * desktopAgents.length)];
}

function getRandomLanguage(): string {
  const languages = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.9',
    'en-AU,en;q=0.9'
  ];
  return languages[Math.floor(Math.random() * languages.length)];
}

function generateSessionCookie(): string {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  return `sessionid=${sessionId}; _ga=GA1.1.${timestamp}`;
}

function getBaseHeaders() {
  return {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };
}

function parseRSSVehicle(title: string, description: string, pubDate: string, source: string): EnhancedVehicleData | null {
  try {
    const yearMatch = title.match(/(\d{4})/);
    const priceMatch = description.match(/\$(\d{1,3}(?:,\d{3})*)/);
    const mileageMatch = description.match(/(\d{1,3}(?:,\d{3})*)\s*(?:miles|mi)/i);
    
    if (yearMatch && priceMatch) {
      return {
        id: `rss-${Date.now()}-${Math.random()}`,
        make: extractMakeFromTitle(title),
        model: extractModelFromTitle(title),
        year: parseInt(yearMatch[1]),
        price: parseInt(priceMatch[1].replace(/,/g, '')),
        currency: 'USD',
        mileage: mileageMatch ? `${mileageMatch[1]} miles` : 'Not specified',
        location: 'USA',
        source: 'RSS Feed',
        description: description.substring(0, 100),
        condition: 'Good',
        listingDate: new Date(pubDate || Date.now()).toISOString().split('T')[0],
        specifications: {
          fuelType: 'Petrol',
          transmission: 'Automatic'
        }
      };
    }
  } catch (error) {
    console.warn('Failed to parse RSS vehicle');
  }
  return null;
}

function parseAPIResponse(data: any, source: string): EnhancedVehicleData[] {
  const vehicles: EnhancedVehicleData[] = [];
  
  try {
    const listings = data.listings || data.results || data.inventory || [];
    
    listings.forEach((item: any) => {
      vehicles.push({
        id: `api-${item.id || Date.now()}`,
        make: item.make || 'Unknown',
        model: item.model || 'Unknown',
        year: item.year || 2010,
        price: item.price || item.askingPrice || 25000,
        currency: 'USD',
        mileage: `${item.mileage || 50000} miles`,
        location: item.location || 'USA',
        source: 'API',
        description: item.description || `${item.year} ${item.make} ${item.model}`,
        condition: 'Good',
        listingDate: new Date().toISOString().split('T')[0],
        specifications: {
          engine: item.engine,
          transmission: item.transmission,
          fuelType: 'Petrol'
        }
      });
    });
  } catch (error) {
    console.warn('Failed to parse API response');
  }
  
  return vehicles;
}

function parseSearchResults($: cheerio.CheerioAPI, make: string, model?: string, source?: string): EnhancedVehicleData[] {
  const vehicles: EnhancedVehicleData[] = [];
  
  try {
    $('.vehicle-card, .listing-row, .srp-list-item').each((index, element) => {
      const title = $(element).find('.vehicle-title, h3, h4').first().text().trim();
      const price = $(element).find('.price, .vehicle-price').first().text().trim();
      const mileage = $(element).find('.mileage, .odometer').first().text().trim();
      
      if (title && price) {
        const priceMatch = price.match(/\$(\d{1,3}(?:,\d{3})*)/);
        const yearMatch = title.match(/(\d{4})/);
        
        if (priceMatch && yearMatch) {
          vehicles.push({
            id: `search-${Date.now()}-${index}`,
            make: make,
            model: model || 'Unknown',
            year: parseInt(yearMatch[1]),
            price: parseInt(priceMatch[1].replace(/,/g, '')),
            currency: 'USD',
            mileage: mileage || 'Not specified',
            location: 'USA',
            source: 'Search',
            description: title,
            condition: 'Good',
            listingDate: new Date().toISOString().split('T')[0],
            specifications: {
              fuelType: 'Petrol'
            }
          });
        }
      }
    });
  } catch (error) {
    console.warn('Failed to parse search results');
  }
  
  return vehicles;
}

function extractMakeFromTitle(title: string): string {
  const makes = ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Ford', 'Chevrolet'];
  for (const make of makes) {
    if (title.toLowerCase().includes(make.toLowerCase())) {
      return make;
    }
  }
  return 'Unknown';
}

function extractModelFromTitle(title: string): string {
  const models = ['Supra', 'Skyline', 'RX-7', 'Silvia', 'WRX', 'Mustang', 'Camaro'];
  for (const model of models) {
    if (title.toLowerCase().includes(model.toLowerCase())) {
      return model;
    }
  }
  return 'Unknown';
}

function getAdvancedHeaders(attempt: number): Record<string, string> {
  const baseHeaders: Record<string, string> = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };
  
  // Add progressive sophistication based on attempt
  if (attempt > 1) {
    baseHeaders['Sec-CH-UA'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
    baseHeaders['Sec-CH-UA-Mobile'] = '?0';
    baseHeaders['Sec-CH-UA-Platform'] = '"Windows"';
  }
  
  if (attempt > 2) {
    baseHeaders['Sec-CH-UA-Platform-Version'] = '"15.0.0"';
    baseHeaders['Sec-CH-UA-Arch'] = '"x86"';
    baseHeaders['Sec-CH-UA-Bitness'] = '"64"';
  }
  
  return baseHeaders;
}

function getRealisticUserAgent(attempt: number): string {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  
  // Use different agents based on attempt to simulate user switching
  return userAgents[attempt % userAgents.length];
}

function getGeoLanguage(): string {
  const languages = [
    'en-US,en;q=0.9',
    'en-AU,en;q=0.9',
    'en-GB,en;q=0.8,en-US;q=0.7,en;q=0.6'
  ];
  return languages[Math.floor(Math.random() * languages.length)];
}

function generateAdvancedSessionCookie(attempt: number): string {
  const timestamp = Date.now();
  const sessionId = Math.random().toString(36).substring(2, 15);
  const visitorId = Math.random().toString(36).substring(2, 10);
  
  let cookies = [
    `sessionid=${sessionId}`,
    `_ga=GA1.1.${timestamp}`,
    `_gid=GA1.1.${Math.floor(timestamp / 1000)}`,
    `visitor_id=${visitorId}`
  ];
  
  // Add progressive cookies based on attempt
  if (attempt > 2) {
    cookies.push(`_fbp=fb.1.${timestamp}.${Math.random().toString().substring(2, 12)}`);
    cookies.push(`_gcl_au=1.1.${Math.random().toString().substring(2, 12)}.${Math.floor(timestamp / 1000)}`);
  }
  
  if (attempt > 3) {
    cookies.push(`__cf_bm=${Math.random().toString(36).substring(2, 45)}`);
    cookies.push(`cf_clearance=${Math.random().toString(36).substring(2, 45)}`);
  }
  
  return cookies.join('; ');
}

function getRealisticReferer(url: string): string {
  const domain = new URL(url).hostname;
  const referers = [
    'https://www.google.com/',
    'https://www.google.com.au/',
    `https://${domain}/`,
    'https://duckduckgo.com/',
    'https://www.bing.com/'
  ];
  return referers[Math.floor(Math.random() * referers.length)];
}

function getRandomViewport(): string {
  const viewports = ['1920', '1366', '1536', '1440', '1280'];
  return viewports[Math.floor(Math.random() * viewports.length)];
}

function getRandomDeviceMemory(): string {
  const memories = ['4', '8', '16', '32'];
  return memories[Math.floor(Math.random() * memories.length)];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}