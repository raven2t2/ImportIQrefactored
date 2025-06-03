import puppeteer from 'puppeteer';
import { storage } from './storage';
import { InsertAuctionListing } from '@shared/schema';

// Enhanced scraper with webhook fallback for production-grade data acquisition
export class AdvancedMarketScraper {
  private browser: any = null;
  private isHeadless = true;
  
  // Proxy rotation list (free proxies for demonstration)
  private proxyList = [
    { host: '8.8.8.8', port: 8080 },
    { host: '1.1.1.1', port: 8080 },
    // Add more proxies as needed
  ];
  
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  constructor() {
    console.log('🚀 Advanced Market Scraper initialized with webhook fallback');
  }

  async initBrowser() {
    if (this.browser) return this.browser;
    
    try {
      console.log('🔧 Initializing Puppeteer with stealth configuration...');
      
      this.browser = await puppeteer.launch({
        headless: this.isHeadless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=' + this.getRandomUserAgent()
        ]
      });
      
      console.log('✅ Browser initialized successfully');
      return this.browser;
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw error;
    }
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async createStealthPage() {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    // Enhanced stealth configuration
    await page.setUserAgent(this.getRandomUserAgent());
    await page.setViewport({ width: 1366, height: 768 });
    
    // Override webdriver detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Remove headless Chrome detection
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Mock chrome object
      (window as any).chrome = {
        runtime: {},
      };
    });
    
    // Set realistic headers
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });
    
    return page;
  }

  async scrapeCopartListings(searchTerms: string[] = ['toyota', 'nissan', 'honda']): Promise<InsertAuctionListing[]> {
    const results: InsertAuctionListing[] = [];
    
    try {
      console.log('🔍 Attempting to scrape Copart listings...');
      const page = await this.createStealthPage();
      
      for (const term of searchTerms) {
        try {
          console.log(`🔎 Searching Copart for: ${term}`);
          
          // Navigate to Copart search
          await page.goto(`https://www.copart.com/lotSearchResults/?free=true&query=${term}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
          });
          
          // Wait for results to load
          await page.waitForTimeout(3000);
          
          // Check if we're blocked
          const isBlocked = await page.$('.cf-browser-verification') || 
                           await page.$('#challenge-form') ||
                           await page.content().includes('403') ||
                           await page.content().includes('Access Denied');
          
          if (isBlocked) {
            console.log('🚫 Detected anti-bot protection on Copart');
            throw new Error('Anti-bot protection detected');
          }
          
          // Extract listings if accessible
          const listings = await page.evaluate((searchTerm) => {
            const items: any[] = [];
            const listingElements = document.querySelectorAll('[data-uname="lotSearchResultsGridRow"]');
            
            listingElements.forEach((element, index) => {
              if (index < 10) { // Limit to 10 per search term
                try {
                  const titleElement = element.querySelector('.lot-title');
                  const priceElement = element.querySelector('.bid-value') || element.querySelector('.current-bid');
                  const imageElement = element.querySelector('img');
                  const linkElement = element.querySelector('a');
                  
                  if (titleElement) {
                    items.push({
                      title: titleElement.textContent?.trim() || `${searchTerm} vehicle`,
                      price: priceElement?.textContent?.replace(/[^\d.]/g, '') || '0',
                      currency: 'USD',
                      location: 'United States',
                      listingUrl: linkElement ? `https://www.copart.com${linkElement.getAttribute('href')}` : '',
                      sourceSite: 'copart',
                      imageUrl: imageElement?.getAttribute('src') || '',
                      dataSource: 'direct_scrape'
                    });
                  }
                } catch (e) {
                  console.error('Error parsing listing:', e);
                }
              }
            });
            
            return items;
          }, term);
          
          results.push(...listings.map(item => ({
            ...item,
            price: parseFloat(item.price) || 0,
            make: this.extractMake(item.title),
            model: this.extractModel(item.title),
            year: this.extractYear(item.title)
          })));
          
          console.log(`✅ Successfully scraped ${listings.length} listings for ${term}`);
          
        } catch (error) {
          console.log(`⚠️ Failed to scrape ${term} from Copart:`, error.message);
          
          // Add webhook instruction message
          console.log(`📡 Recommendation: Use external scraping service with webhook endpoint /api/receive-scan`);
        }
        
        // Rate limiting
        await page.waitForTimeout(2000);
      }
      
      await page.close();
      
    } catch (error) {
      console.error('❌ Copart scraping failed:', error.message);
      console.log('💡 Fallback: External scraping services can POST data to /api/receive-scan');
    }
    
    return results;
  }

  async scrapeJapaneseAuctions(): Promise<InsertAuctionListing[]> {
    const results: InsertAuctionListing[] = [];
    
    try {
      console.log('🔍 Attempting to scrape Japanese auction listings...');
      const page = await this.createStealthPage();
      
      // Try Goo-net Exchange
      try {
        await page.goto('https://www.goo-net-exchange.com/usedcars/', {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        await page.waitForTimeout(3000);
        
        // Check for anti-bot protection
        const isBlocked = await page.content().includes('403') || 
                         await page.content().includes('Access Denied') ||
                         await page.$('.cf-browser-verification');
        
        if (isBlocked) {
          throw new Error('Anti-bot protection detected on Goo-net');
        }
        
        // Extract Japanese listings
        const listings = await page.evaluate(() => {
          const items: any[] = [];
          const vehicleElements = document.querySelectorAll('.car-item, .vehicle-item, [data-vehicle]');
          
          vehicleElements.forEach((element, index) => {
            if (index < 15) { // Limit to 15 items
              try {
                const titleElement = element.querySelector('h3, .title, .car-name');
                const priceElement = element.querySelector('.price, .cost');
                const imageElement = element.querySelector('img');
                const linkElement = element.querySelector('a');
                
                if (titleElement) {
                  items.push({
                    title: titleElement.textContent?.trim() || 'Japanese Vehicle',
                    price: priceElement?.textContent?.replace(/[^\d.]/g, '') || '0',
                    currency: 'JPY',
                    location: 'Japan',
                    listingUrl: linkElement?.getAttribute('href') || '',
                    sourceSite: 'goo-net',
                    imageUrl: imageElement?.getAttribute('src') || '',
                    dataSource: 'direct_scrape'
                  });
                }
              } catch (e) {
                console.error('Error parsing Japanese listing:', e);
              }
            }
          });
          
          return items;
        });
        
        results.push(...listings.map(item => ({
          ...item,
          price: parseFloat(item.price) || 0,
          make: this.extractMake(item.title),
          model: this.extractModel(item.title),
          year: this.extractYear(item.title)
        })));
        
        console.log(`✅ Successfully scraped ${listings.length} Japanese listings`);
        
      } catch (error) {
        console.log(`⚠️ Failed to scrape Japanese auctions:`, error.message);
        console.log(`📡 Recommendation: Use Japanese auction API services with webhook endpoint`);
      }
      
      await page.close();
      
    } catch (error) {
      console.error('❌ Japanese auction scraping failed:', error.message);
    }
    
    return results;
  }

  private extractMake(title: string): string {
    const makes = ['toyota', 'nissan', 'honda', 'mazda', 'subaru', 'mitsubishi', 'ford', 'chevrolet', 'dodge'];
    const lowerTitle = title.toLowerCase();
    
    for (const make of makes) {
      if (lowerTitle.includes(make)) {
        return make.charAt(0).toUpperCase() + make.slice(1);
      }
    }
    
    return 'Unknown';
  }

  private extractModel(title: string): string {
    // Simplified model extraction
    const words = title.split(' ');
    return words.length > 1 ? words[1] : 'Unknown';
  }

  private extractYear(title: string): number | undefined {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : undefined;
  }

  async performFullScrape(): Promise<void> {
    console.log('🚀 Starting comprehensive market scrape...');
    
    try {
      // Scrape US auctions
      const usListings = await this.scrapeCopartListings(['toyota', 'nissan', 'honda', 'mazda', 'subaru']);
      
      // Scrape Japanese auctions
      const jpListings = await this.scrapeJapaneseAuctions();
      
      const allListings = [...usListings, ...jpListings];
      
      if (allListings.length > 0) {
        console.log(`💾 Saving ${allListings.length} listings to database...`);
        
        for (const listing of allListings) {
          try {
            await storage.createAuctionListing(listing);
          } catch (error) {
            console.error('Error saving listing:', error);
          }
        }
        
        console.log(`✅ Successfully saved ${allListings.length} auction listings`);
      } else {
        console.log('⚠️ No listings scraped directly - external webhook integration recommended');
        console.log('📡 External services can POST auction data to: /api/receive-scan');
        console.log('🔧 Supported services: ScraperAPI, BrightData, Oxylabs');
      }
      
    } catch (error) {
      console.error('❌ Full scrape failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🧹 Browser cleanup completed');
    }
  }

  // Webhook integration method for external services
  static async processWebhookData(data: any[]): Promise<void> {
    console.log(`📡 Processing ${data.length} listings from webhook...`);
    
    for (const item of data) {
      try {
        await storage.createAuctionListing({
          ...item,
          dataSource: 'webhook'
        });
      } catch (error) {
        console.error('Error processing webhook data:', error);
      }
    }
    
    console.log(`✅ Webhook data processing completed`);
  }
}

// Export singleton instance
export const marketScraper = new AdvancedMarketScraper();