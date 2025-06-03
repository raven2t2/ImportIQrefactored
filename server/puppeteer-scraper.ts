/**
 * Puppeteer-based auction scraper for authentic data extraction
 * Uses headless browser automation to bypass anti-bot detection
 */

import puppeteer, { Browser, Page } from 'puppeteer';

export interface AuthenticAuctionData {
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

let globalBrowser: Browser | null = null;

async function initBrowser(): Promise<Browser> {
  if (globalBrowser) {
    try {
      await globalBrowser.version();
      return globalBrowser;
    } catch (error) {
      globalBrowser = null;
    }
  }

  globalBrowser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '--window-size=1920,1080'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });

  return globalBrowser;
}

export async function scrapeWithPuppeteer(make: string, model?: string): Promise<AuthenticAuctionData[]> {
  const vehicles: AuthenticAuctionData[] = [];
  let browser: Browser | null = null;
  
  try {
    browser = await initBrowser();
    
    // Try Yahoo Auctions Japan first
    const yahooVehicles = await scrapeYahooAuctions(browser, make, model);
    vehicles.push(...yahooVehicles);
    
    if (vehicles.length < 10) {
      // Try CarView as backup
      const carViewVehicles = await scrapeCarView(browser, make, model);
      vehicles.push(...carViewVehicles);
    }
    
    if (vehicles.length < 5) {
      // Try Goo-net as final backup
      const goonetVehicles = await scrapeGooNet(browser, make, model);
      vehicles.push(...goonetVehicles);
    }
    
  } catch (error) {
    console.error('Puppeteer scraping failed:', error);
  }
  
  return vehicles.slice(0, 15);
}

async function scrapeYahooAuctions(browser: Browser, make: string, model?: string): Promise<AuthenticAuctionData[]> {
  const vehicles: AuthenticAuctionData[] = [];
  let page: Page | null = null;
  
  try {
    page = await browser.newPage();
    
    // Set realistic browser fingerprint
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
    
    // Navigate to Yahoo Auctions search
    const searchQuery = `${make}${model ? ` ${model}` : ''} 自動車`;
    const searchUrl = `https://auctions.yahoo.co.jp/search/search?p=${encodeURIComponent(searchQuery)}&category=2084005502`;
    
    console.log(`Navigating to Yahoo Auctions: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Simulate human behavior
    await page.mouse.move(100, 100);
    await page.waitForTimeout(1000);
    await page.mouse.move(200, 200);
    
    // Extract auction listings
    const listings = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.Product, .auction-item, [data-aid]'));
      return items.map(item => {
        const titleElement = item.querySelector('.Product-title, .auction-title, h3, a[title]');
        const priceElement = item.querySelector('.Product-price, .auction-price, .price');
        const linkElement = item.querySelector('a[href*="page.auctions.yahoo.co.jp"]');
        
        const title = titleElement?.textContent?.trim() || '';
        const price = priceElement?.textContent?.trim() || '';
        const link = linkElement?.getAttribute('href') || '';
        
        return { title, price, link };
      }).filter(item => item.title && item.price);
    });
    
    console.log(`Found ${listings.length} Yahoo auction listings`);
    
    for (const listing of listings.slice(0, 10)) {
      try {
        const vehicle = parseYahooListing(listing, 'Yahoo Auctions Japan');
        if (vehicle) {
          vehicles.push(vehicle);
        }
      } catch (error) {
        console.warn('Failed to parse Yahoo listing:', error);
      }
    }
    
  } catch (error) {
    console.error('Yahoo Auctions scraping failed:', error);
  } finally {
    if (page) {
      await page.close();
    }
  }
  
  return vehicles;
}

async function scrapeCarView(browser: Browser, make: string, model?: string): Promise<AuthenticAuctionData[]> {
  const vehicles: AuthenticAuctionData[] = [];
  let page: Page | null = null;
  
  try {
    page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    const searchUrl = `https://www.carview.co.jp/usedcar/search/?make=${make.toLowerCase()}${model ? `&model=${model.toLowerCase()}` : ''}`;
    
    console.log(`Navigating to CarView: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const listings = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.car-item, .vehicle-card, .usedcar-item'));
      return items.map(item => {
        const titleElement = item.querySelector('.car-name, .vehicle-title, h3');
        const priceElement = item.querySelector('.price, .car-price');
        const yearElement = item.querySelector('.year, .car-year');
        
        const title = titleElement?.textContent?.trim() || '';
        const price = priceElement?.textContent?.trim() || '';
        const year = yearElement?.textContent?.trim() || '';
        
        return { title, price, year };
      }).filter(item => item.title && item.price);
    });
    
    console.log(`Found ${listings.length} CarView listings`);
    
    for (const listing of listings.slice(0, 8)) {
      try {
        const vehicle = parseCarViewListing(listing, 'CarView Japan');
        if (vehicle) {
          vehicles.push(vehicle);
        }
      } catch (error) {
        console.warn('Failed to parse CarView listing:', error);
      }
    }
    
  } catch (error) {
    console.error('CarView scraping failed:', error);
  } finally {
    if (page) {
      await page.close();
    }
  }
  
  return vehicles;
}

async function scrapeGooNet(browser: Browser, make: string, model?: string): Promise<AuthenticAuctionData[]> {
  const vehicles: AuthenticAuctionData[] = [];
  let page: Page | null = null;
  
  try {
    page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    const searchUrl = `https://www.goo-net.com/usedcar/search/?make=${make}${model ? `&model=${model}` : ''}`;
    
    console.log(`Navigating to Goo-net: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const listings = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.listing-item, .car-listing, .vehicle-item'));
      return items.map(item => {
        const titleElement = item.querySelector('.car-title, .vehicle-name, h3');
        const priceElement = item.querySelector('.price, .listing-price');
        const detailsElement = item.querySelector('.car-details, .vehicle-specs');
        
        const title = titleElement?.textContent?.trim() || '';
        const price = priceElement?.textContent?.trim() || '';
        const details = detailsElement?.textContent?.trim() || '';
        
        return { title, price, details };
      }).filter(item => item.title && item.price);
    });
    
    console.log(`Found ${listings.length} Goo-net listings`);
    
    for (const listing of listings.slice(0, 6)) {
      try {
        const vehicle = parseGooNetListing(listing, 'Goo-net Japan');
        if (vehicle) {
          vehicles.push(vehicle);
        }
      } catch (error) {
        console.warn('Failed to parse Goo-net listing:', error);
      }
    }
    
  } catch (error) {
    console.error('Goo-net scraping failed:', error);
  } finally {
    if (page) {
      await page.close();
    }
  }
  
  return vehicles;
}

function parseYahooListing(listing: any, source: string): AuthenticAuctionData | null {
  try {
    const { title, price, link } = listing;
    
    const yearMatch = title.match(/(\d{4})/);
    const priceMatch = price.match(/([\d,]+)/);
    
    if (!yearMatch || !priceMatch) {
      return null;
    }
    
    const year = parseInt(yearMatch[1]);
    const priceValue = parseInt(priceMatch[1].replace(/,/g, ''));
    
    return {
      id: `yahoo-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      make: extractMakeFromTitle(title),
      model: extractModelFromTitle(title),
      year,
      price: priceValue,
      currency: 'JPY',
      mileage: 'Not specified',
      location: 'Japan',
      source,
      description: title,
      condition: 'Auction',
      listingDate: new Date().toISOString().split('T')[0],
      specifications: {
        fuelType: 'Petrol'
      }
    };
  } catch (error) {
    return null;
  }
}

function parseCarViewListing(listing: any, source: string): AuthenticAuctionData | null {
  try {
    const { title, price, year } = listing;
    
    const yearMatch = year.match(/(\d{4})/) || title.match(/(\d{4})/);
    const priceMatch = price.match(/([\d,]+)/);
    
    if (!yearMatch || !priceMatch) {
      return null;
    }
    
    const yearValue = parseInt(yearMatch[1]);
    const priceValue = parseInt(priceMatch[1].replace(/,/g, ''));
    
    return {
      id: `carview-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      make: extractMakeFromTitle(title),
      model: extractModelFromTitle(title),
      year: yearValue,
      price: priceValue,
      currency: 'JPY',
      mileage: 'Not specified',
      location: 'Japan',
      source,
      description: title,
      condition: 'Used',
      listingDate: new Date().toISOString().split('T')[0],
      specifications: {
        fuelType: 'Petrol'
      }
    };
  } catch (error) {
    return null;
  }
}

function parseGooNetListing(listing: any, source: string): AuthenticAuctionData | null {
  try {
    const { title, price, details } = listing;
    
    const yearMatch = title.match(/(\d{4})/) || details.match(/(\d{4})/);
    const priceMatch = price.match(/([\d,]+)/);
    
    if (!yearMatch || !priceMatch) {
      return null;
    }
    
    const yearValue = parseInt(yearMatch[1]);
    const priceValue = parseInt(priceMatch[1].replace(/,/g, ''));
    
    return {
      id: `goonet-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      make: extractMakeFromTitle(title),
      model: extractModelFromTitle(title),
      year: yearValue,
      price: priceValue,
      currency: 'JPY',
      mileage: 'Not specified',
      location: 'Japan',
      source,
      description: title,
      condition: 'Used',
      listingDate: new Date().toISOString().split('T')[0],
      specifications: {
        fuelType: 'Petrol'
      }
    };
  } catch (error) {
    return null;
  }
}

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

// Cleanup function
export async function closeBrowser(): Promise<void> {
  if (globalBrowser) {
    try {
      await globalBrowser.close();
      globalBrowser = null;
    } catch (error) {
      console.warn('Error closing browser:', error);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', closeBrowser);
process.on('SIGTERM', closeBrowser);