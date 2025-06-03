/**
 * Advanced Anti-Bot Bypass System
 * Implements sophisticated techniques to extract authentic auction data
 */

import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

export interface AuthenticVehicleData {
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

// Browser fingerprint rotation system
const BROWSER_FINGERPRINTS = [
  {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: '1920x1080',
    platform: 'Win32',
    language: 'en-US',
    timezone: 'America/New_York'
  },
  {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    viewport: '1440x900',
    platform: 'MacIntel',
    language: 'en-US',
    timezone: 'America/Los_Angeles'
  },
  {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: '1366x768',
    platform: 'Linux x86_64',
    language: 'en-US',
    timezone: 'America/Chicago'
  }
];

// Session management for persistent scraping
class SessionManager {
  private sessions: Map<string, any> = new Map();
  private sessionRotation = 0;

  getSession(domain: string) {
    const sessionKey = `${domain}_${this.sessionRotation % 3}`;
    if (!this.sessions.has(sessionKey)) {
      this.sessions.set(sessionKey, {
        cookies: this.generateSessionCookies(),
        fingerprint: BROWSER_FINGERPRINTS[this.sessionRotation % BROWSER_FINGERPRINTS.length],
        requestCount: 0,
        lastUsed: Date.now()
      });
    }
    return this.sessions.get(sessionKey);
  }

  rotateSession() {
    this.sessionRotation++;
  }

  private generateSessionCookies() {
    const timestamp = Date.now();
    return {
      'session_id': Math.random().toString(36).substring(2, 15),
      '_ga': `GA1.1.${timestamp}`,
      '_gid': `GA1.1.${Math.floor(timestamp / 1000)}`,
      'visitor_id': Math.random().toString(36).substring(2, 10),
      'cf_clearance': Math.random().toString(36).substring(2, 30),
      '__cflb': Math.random().toString(36).substring(2, 20)
    };
  }
}

const sessionManager = new SessionManager();

/**
 * Advanced scraping with browser automation simulation
 */
export async function scrapeWithAdvancedAntiBotBypass(make: string, model?: string): Promise<AuthenticVehicleData[]> {
  const vehicles: AuthenticVehicleData[] = [];
  
  // Target multiple auction platforms with different strategies
  const platforms = [
    {
      name: 'Yahoo Auctions Japan',
      baseUrl: 'https://auctions.yahoo.co.jp',
      searchPath: '/search/search',
      strategy: 'yahoo_mobile'
    },
    {
      name: 'Mercari Auto',
      baseUrl: 'https://www.mercari.com',
      searchPath: '/search',
      strategy: 'mercari_api'
    },
    {
      name: 'CarView',
      baseUrl: 'https://www.carview.co.jp',
      searchPath: '/usedcar/search',
      strategy: 'carview_rss'
    },
    {
      name: 'Goo-net Exchange',
      baseUrl: 'https://www.goo-net.com',
      searchPath: '/usedcar/search',
      strategy: 'goonet_mobile'
    }
  ];

  for (const platform of platforms) {
    try {
      console.log(`Advanced scraping ${platform.name} for ${make}${model ? ` ${model}` : ''}`);
      
      const platformVehicles = await scrapePlatformWithSessionRotation(platform, make, model);
      vehicles.push(...platformVehicles);
      
      // Rotate session after each platform
      sessionManager.rotateSession();
      
      // Human-like delay between platforms
      await delay(5000 + Math.random() * 8000);
      
      if (vehicles.length >= 15) break;
      
    } catch (error) {
      console.warn(`Failed to scrape ${platform.name}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  return vehicles;
}

/**
 * Scrape individual platform with session management
 */
async function scrapePlatformWithSessionRotation(platform: any, make: string, model?: string): Promise<AuthenticVehicleData[]> {
  const vehicles: AuthenticVehicleData[] = [];
  const maxAttempts = 5;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const session = sessionManager.getSession(platform.baseUrl);
      
      console.log(`  Attempt ${attempt}/${maxAttempts} with ${session.fingerprint.platform} fingerprint`);
      
      const platformVehicles = await makeAdvancedRequest(platform, make, model, session, attempt);
      vehicles.push(...platformVehicles);
      
      if (vehicles.length > 0) {
        console.log(`  Successfully extracted ${vehicles.length} vehicles`);
        break;
      }
      
      // Progressive backoff with session rotation
      if (attempt < maxAttempts) {
        await delay(Math.pow(2, attempt) * 2000 + Math.random() * 3000);
      }
      
    } catch (error) {
      console.warn(`  Attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown');
      
      if (attempt === maxAttempts) {
        console.warn(`  All attempts failed for ${platform.name}`);
      }
    }
  }
  
  return vehicles;
}

/**
 * Make advanced request with full browser simulation
 */
async function makeAdvancedRequest(
  platform: any,
  make: string,
  model: string | undefined,
  session: any,
  attempt: number
): Promise<AuthenticVehicleData[]> {
  
  const searchParams = buildSearchParams(make, model, platform.strategy);
  const fullUrl = `${platform.baseUrl}${platform.searchPath}?${searchParams}`;
  
  // Build advanced headers with browser fingerprinting
  const headers = buildAdvancedHeaders(session, attempt);
  
  // Add platform-specific headers
  if (platform.strategy === 'yahoo_mobile') {
    headers['X-Requested-With'] = 'com.yahoo.mobile.client.android.auctions';
    headers['X-Yahoo-App-Type'] = 'mobile';
  } else if (platform.strategy === 'mercari_api') {
    headers['X-Platform'] = 'web';
    headers['X-Requested-With'] = 'XMLHttpRequest';
  }
  
  const response = await axios({
    method: 'GET',
    url: fullUrl,
    headers,
    timeout: 45000,
    maxRedirects: 10,
    validateStatus: (status) => status < 500,
    // Advanced HTTP configuration
    httpAgent: new (require('http').Agent)({
      keepAlive: true,
      maxSockets: 1,
      timeout: 60000
    }),
    httpsAgent: new (require('https').Agent)({
      keepAlive: true,
      maxSockets: 1,
      timeout: 60000,
      rejectUnauthorized: false,
      // Simulate different TLS fingerprints
      secureProtocol: attempt > 2 ? 'TLSv1_2_method' : 'TLSv1_3_method'
    })
  });
  
  if (response.status >= 200 && response.status < 300) {
    return parseResponseByStrategy(response.data, platform.strategy, platform.name);
  } else if (response.status === 403) {
    throw new Error(`Anti-bot detection triggered (403)`);
  } else if (response.status === 429) {
    throw new Error(`Rate limit exceeded (429)`);
  } else {
    throw new Error(`HTTP ${response.status}`);
  }
}

/**
 * Build search parameters for different platforms
 */
function buildSearchParams(make: string, model?: string, strategy?: string): string {
  const params = new URLSearchParams();
  
  if (strategy === 'yahoo_mobile') {
    params.append('p', `${make}${model ? ` ${model}` : ''} 自動車`);
    params.append('category', '2084005502');
    params.append('mode', 'mobile');
  } else if (strategy === 'mercari_api') {
    params.append('keyword', `${make}${model ? ` ${model}` : ''}`);
    params.append('category_id', '7');
    params.append('size', '20');
  } else if (strategy === 'carview_rss') {
    params.append('make', make.toLowerCase());
    if (model) params.append('model', model.toLowerCase());
    params.append('format', 'rss');
  } else {
    params.append('make', make);
    if (model) params.append('model', model);
    params.append('limit', '20');
  }
  
  return params.toString();
}

/**
 * Build advanced headers with browser fingerprinting
 */
function buildAdvancedHeaders(session: any, attempt: number): Record<string, string> {
  const fingerprint = session.fingerprint;
  const cookies = Object.entries(session.cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  const headers: Record<string, string> = {
    'User-Agent': fingerprint.userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': `${fingerprint.language},en;q=0.9`,
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'Cookie': cookies,
    'Cache-Control': 'max-age=0'
  };
  
  // Add Chrome-specific headers
  if (fingerprint.userAgent.includes('Chrome')) {
    headers['sec-ch-ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
    headers['sec-ch-ua-mobile'] = '?0';
    headers['sec-ch-ua-platform'] = `"${fingerprint.platform}"`;
  }
  
  // Add viewport and device information
  headers['Viewport-Width'] = fingerprint.viewport.split('x')[0];
  headers['Device-Memory'] = '8';
  
  // Progressive sophistication based on attempt
  if (attempt > 2) {
    headers['DNT'] = '1';
    headers['Pragma'] = 'no-cache';
  }
  
  if (attempt > 3) {
    headers['X-Forwarded-For'] = generateAustralianIP();
    headers['X-Real-IP'] = headers['X-Forwarded-For'];
  }
  
  return headers;
}

/**
 * Parse response based on platform strategy
 */
function parseResponseByStrategy(data: any, strategy: string, source: string): AuthenticVehicleData[] {
  const vehicles: AuthenticVehicleData[] = [];
  
  try {
    const $ = cheerio.load(data);
    
    if (strategy === 'yahoo_mobile') {
      $('.Product, .auction-item').each((index, element) => {
        const vehicle = parseYahooAuctionItem($, element, source);
        if (vehicle) vehicles.push(vehicle);
      });
    } else if (strategy === 'mercari_api') {
      $('.mer-item, .item-box').each((index, element) => {
        const vehicle = parseMercariItem($, element, source);
        if (vehicle) vehicles.push(vehicle);
      });
    } else if (strategy === 'carview_rss') {
      $('item').each((index, element) => {
        const vehicle = parseRSSItem($, element, source);
        if (vehicle) vehicles.push(vehicle);
      });
    } else {
      $('.car-item, .vehicle-card, .usedcar-item').each((index, element) => {
        const vehicle = parseGenericItem($, element, source);
        if (vehicle) vehicles.push(vehicle);
      });
    }
    
  } catch (error) {
    console.warn(`Failed to parse ${strategy} response`);
  }
  
  return vehicles;
}

function parseYahooAuctionItem($: cheerio.CheerioAPI, element: any, source: string): AuthenticVehicleData | null {
  try {
    const title = $(element).find('.Product-title, .auction-title, h3').first().text().trim();
    const price = $(element).find('.Product-price, .auction-price').first().text().trim();
    const image = $(element).find('img').first().attr('src');
    
    if (title && price) {
      const priceMatch = price.match(/[\d,]+/);
      const yearMatch = title.match(/(\d{4})/);
      
      if (priceMatch && yearMatch) {
        return {
          id: `yahoo-${Date.now()}-${Math.random()}`,
          make: extractMakeFromTitle(title),
          model: extractModelFromTitle(title),
          year: parseInt(yearMatch[1]),
          price: parseInt(priceMatch[0].replace(/,/g, '')),
          currency: 'JPY',
          mileage: 'Not specified',
          location: 'Japan',
          source: source,
          description: title,
          condition: 'Auction',
          listingDate: new Date().toISOString().split('T')[0],
          specifications: {
            fuelType: 'Petrol'
          }
        };
      }
    }
  } catch (error) {
    console.warn('Failed to parse Yahoo auction item');
  }
  return null;
}

function parseMercariItem($: cheerio.CheerioAPI, element: any, source: string): AuthenticVehicleData | null {
  try {
    const title = $(element).find('.mer-item-name, .item-name').first().text().trim();
    const price = $(element).find('.mer-price, .item-price').first().text().trim();
    
    if (title && price) {
      const priceMatch = price.match(/[\d,]+/);
      const yearMatch = title.match(/(\d{4})/);
      
      if (priceMatch && yearMatch) {
        return {
          id: `mercari-${Date.now()}-${Math.random()}`,
          make: extractMakeFromTitle(title),
          model: extractModelFromTitle(title),
          year: parseInt(yearMatch[1]),
          price: parseInt(priceMatch[0].replace(/,/g, '')),
          currency: 'JPY',
          mileage: 'Not specified',
          location: 'Japan',
          source: source,
          description: title,
          condition: 'Used',
          listingDate: new Date().toISOString().split('T')[0],
          specifications: {
            fuelType: 'Petrol'
          }
        };
      }
    }
  } catch (error) {
    console.warn('Failed to parse Mercari item');
  }
  return null;
}

function parseRSSItem($: cheerio.CheerioAPI, element: any, source: string): AuthenticVehicleData | null {
  try {
    const title = $(element).find('title').text();
    const description = $(element).find('description').text();
    
    if (title) {
      const yearMatch = title.match(/(\d{4})/);
      const priceMatch = description.match(/[\d,]+/) || title.match(/[\d,]+/);
      
      if (yearMatch && priceMatch) {
        return {
          id: `rss-${Date.now()}-${Math.random()}`,
          make: extractMakeFromTitle(title),
          model: extractModelFromTitle(title),
          year: parseInt(yearMatch[1]),
          price: parseInt(priceMatch[0].replace(/,/g, '')),
          currency: 'JPY',
          mileage: 'Not specified',
          location: 'Japan',
          source: source,
          description: title,
          condition: 'Good',
          listingDate: new Date().toISOString().split('T')[0],
          specifications: {
            fuelType: 'Petrol'
          }
        };
      }
    }
  } catch (error) {
    console.warn('Failed to parse RSS item');
  }
  return null;
}

function parseGenericItem($: cheerio.CheerioAPI, element: any, source: string): AuthenticVehicleData | null {
  try {
    const title = $(element).find('.car-name, .vehicle-title, h3, h4').first().text().trim();
    const price = $(element).find('.price, .car-price').first().text().trim();
    const year = $(element).find('.year, .car-year').first().text().trim();
    
    if (title && price) {
      const priceMatch = price.match(/[\d,]+/);
      const yearMatch = year.match(/\d{4}/) || title.match(/(\d{4})/);
      
      if (priceMatch && yearMatch) {
        return {
          id: `generic-${Date.now()}-${Math.random()}`,
          make: extractMakeFromTitle(title),
          model: extractModelFromTitle(title),
          year: parseInt(yearMatch[1] || yearMatch[0]),
          price: parseInt(priceMatch[0].replace(/,/g, '')),
          currency: 'JPY',
          mileage: 'Not specified',
          location: 'Japan',
          source: source,
          description: title,
          condition: 'Good',
          listingDate: new Date().toISOString().split('T')[0],
          specifications: {
            fuelType: 'Petrol'
          }
        };
      }
    }
  } catch (error) {
    console.warn('Failed to parse generic item');
  }
  return null;
}

// Helper functions
function extractMakeFromTitle(title: string): string {
  const makes = ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Lexus', 'Infiniti', 'Acura'];
  for (const make of makes) {
    if (title.toLowerCase().includes(make.toLowerCase())) {
      return make;
    }
  }
  return 'Unknown';
}

function extractModelFromTitle(title: string): string {
  const models = ['Supra', 'Skyline', 'RX-7', 'RX-8', 'Silvia', 'WRX', 'STI', 'NSX', 'GT-R', 'EVO', 'Civic', 'Accord'];
  for (const model of models) {
    if (title.toLowerCase().includes(model.toLowerCase())) {
      return model;
    }
  }
  return 'Unknown';
}

function generateAustralianIP(): string {
  const australianRanges = [
    '203.220.90.',
    '130.180.5.',
    '121.200.4.',
    '144.136.90.',
    '101.160.20.'
  ];
  const range = australianRanges[Math.floor(Math.random() * australianRanges.length)];
  const lastOctet = Math.floor(Math.random() * 254) + 1;
  return `${range}${lastOctet}`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}