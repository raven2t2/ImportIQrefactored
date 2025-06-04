/**
 * Yahoo Auctions Japan API Integration
 * Provides authentic auction data from Yahoo Auctions Japan
 */

import axios from 'axios';

export interface YahooAuctionItem {
  auctionID: string;
  title: string;
  currentPrice: number;
  currency: string;
  bidCount: number;
  timeLeft: string;
  imageUrl: string;
  auctionUrl: string;
  seller: {
    name: string;
    rating: number;
  };
  condition: string;
  location: string;
  startTime: string;
  endTime: string;
}

export interface YahooSearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'bids' | 'time' | 'popular';
  limit?: number;
}

export class YahooAuctionsAPI {
  private apiKey: string;
  private baseUrl = 'https://auctions.yahooapis.jp/AuctionWebService/V2/search';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search Yahoo Auctions Japan for vehicles
   */
  async searchVehicles(params: YahooSearchParams): Promise<YahooAuctionItem[]> {
    try {
      const searchParams = new URLSearchParams({
        appid: this.apiKey,
        query: params.query,
        category: params.category || '26084', // Auto category
        output: 'json',
        results: (params.limit || 20).toString(),
        sort: this.mapSortParam(params.sort || 'popular')
      });

      if (params.minPrice) {
        searchParams.append('aucminprice', params.minPrice.toString());
      }

      if (params.maxPrice) {
        searchParams.append('aucmaxprice', params.maxPrice.toString());
      }

      const response = await axios.get(`${this.baseUrl}?${searchParams.toString()}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'ImportIQ/1.0 (Yahoo Auctions API Client)',
          'Accept': 'application/json'
        }
      });

      return this.parseResponse(response.data);

    } catch (error) {
      console.error('Yahoo Auctions API Error:', error);
      throw new Error('Failed to fetch auction data from Yahoo Auctions Japan');
    }
  }

  /**
   * Get specific vehicle auctions by make/model
   */
  async getVehicleAuctions(make: string, model?: string): Promise<YahooAuctionItem[]> {
    const query = model ? `${make} ${model}` : make;
    
    return this.searchVehicles({
      query: query,
      category: '26084', // Auto category
      sort: 'popular',
      limit: 50
    });
  }

  /**
   * Map sort parameters to Yahoo API format
   */
  private mapSortParam(sort: string): string {
    const sortMap: Record<string, string> = {
      'price': 'aucprice',
      'bids': 'bid',
      'time': 'end',
      'popular': 'popular'
    };
    return sortMap[sort] || 'popular';
  }

  /**
   * Parse Yahoo API response
   */
  private parseResponse(data: any): YahooAuctionItem[] {
    if (!data.ResultSet || !data.ResultSet.Result) {
      return [];
    }

    const results = Array.isArray(data.ResultSet.Result) 
      ? data.ResultSet.Result 
      : [data.ResultSet.Result];

    return results.map((item: any) => ({
      auctionID: item.AuctionID,
      title: item.Title,
      currentPrice: parseInt(item.Price || '0'),
      currency: 'JPY',
      bidCount: parseInt(item.Bids || '0'),
      timeLeft: item.EndTime,
      imageUrl: item.Image || '',
      auctionUrl: item.AuctionItemUrl,
      seller: {
        name: item.Seller?.Id || 'Unknown',
        rating: parseFloat(item.Seller?.Rating || '0')
      },
      condition: item.ItemStatus || 'Used',
      location: item.Location || 'Japan',
      startTime: item.StartTime,
      endTime: item.EndTime
    }));
  }

  /**
   * Extract vehicle details from auction title
   */
  static extractVehicleInfo(title: string): {
    make?: string;
    model?: string;
    year?: number;
  } {
    const makes = ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi'];
    const result: any = {};

    // Extract make
    for (const make of makes) {
      if (title.toLowerCase().includes(make.toLowerCase())) {
        result.make = make;
        break;
      }
    }

    // Extract year (4 digits)
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      result.year = parseInt(yearMatch[0]);
    }

    // Extract common models
    const models = ['Skyline', 'Supra', 'NSX', 'RX-7', 'WRX', 'STI', 'Evo', 'Lancer'];
    for (const model of models) {
      if (title.toLowerCase().includes(model.toLowerCase())) {
        result.model = model;
        break;
      }
    }

    return result;
  }

  /**
   * Convert JPY to USD for price comparison
   */
  static convertJPYToUSD(jpyPrice: number, exchangeRate: number = 150): number {
    return Math.round(jpyPrice / exchangeRate);
  }

  /**
   * Calculate market statistics from auction data
   */
  static calculateMarketStats(auctions: YahooAuctionItem[]): {
    avgPrice: number;
    medianPrice: number;
    priceRange: { min: number; max: number };
    totalListings: number;
    activeBiddings: number;
  } {
    if (auctions.length === 0) {
      return {
        avgPrice: 0,
        medianPrice: 0,
        priceRange: { min: 0, max: 0 },
        totalListings: 0,
        activeBiddings: 0
      };
    }

    const prices = auctions.map(a => a.currentPrice).filter(p => p > 0);
    const sortedPrices = prices.sort((a, b) => a - b);
    
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
    const activeBiddings = auctions.filter(a => a.bidCount > 0).length;

    return {
      avgPrice: Math.round(avgPrice),
      medianPrice,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      totalListings: auctions.length,
      activeBiddings
    };
  }
}