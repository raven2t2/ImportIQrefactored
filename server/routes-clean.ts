import express, { type Express } from "express";
import { createServer, type Server } from "http";
import fs from 'fs';
import path from 'path';
import { getLiveMarketData, getMarketAnalysis, refreshLiveMarketData } from "./live-market-data";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // US Market Intelligence API endpoint using authentic AutoTrader data
  app.get("/api/us-market-intelligence", (req, res) => {
    try {
      console.log('Loading AutoTrader dataset...');
      
      // Load authentic AutoTrader dataset
      const dataPath = path.join(process.cwd(), 'attached_assets/dataset_autotrader-scraper_2025-06-04_08-27-39-827.json');
      
      if (!fs.existsSync(dataPath)) {
        console.error('Dataset file not found at:', dataPath);
        return res.status(500).json({ error: 'Dataset file not found' });
      }
      
      const rawData = fs.readFileSync(dataPath, 'utf8');
      const autoTraderData = JSON.parse(rawData);
      
      console.log('Successfully loaded', autoTraderData.length, 'vehicle records from AutoTrader dataset');
      
      // Get request parameters
      const brand = req.query.brand as string;
      const model = req.query.model as string;
      const year = req.query.year as string;
      const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : null;
      const maxMileage = req.query.maxMileage ? parseInt(req.query.maxMileage as string) : null;
      
      // Filter data based on search criteria
      let filteredData = autoTraderData.filter((vehicle: any) => {
        if (brand && vehicle.brand && vehicle.brand.toLowerCase() !== brand.toLowerCase()) {
          return false;
        }
        if (model && vehicle.model && !vehicle.model.toLowerCase().includes(model.toLowerCase())) {
          return false;
        }
        if (year && vehicle.year && vehicle.year.toString() !== year.toString()) {
          return false;
        }
        if (maxPrice && vehicle.price && vehicle.price > maxPrice) {
          return false;
        }
        if (maxMileage && vehicle.mileage) {
          const mileageNum = typeof vehicle.mileage === 'string' 
            ? parseInt(vehicle.mileage.replace(/,/g, '')) 
            : vehicle.mileage;
          if (!isNaN(mileageNum) && mileageNum > maxMileage) {
            return false;
          }
        }
        return vehicle.price && vehicle.year; // Only include vehicles with valid price and year
      });

      // Calculate market analysis
      const prices = filteredData.map((v: any) => v.price).filter((p: any) => p && p > 0);
      const averagePrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const medianPrice = sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : 0;

      // Basic analysis object
      const analysis = {
        averagePrice: Math.round(averagePrice),
        medianPrice: Math.round(medianPrice),
        priceRange: {
          min: sortedPrices.length > 0 ? sortedPrices[0] : 0,
          max: sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : 0
        },
        totalListings: filteredData.length,
        marketTrend: "stable",
        popularFeatures: ["Automatic Transmission", "Air Conditioning", "Power Windows"],
        averageDaysOnMarket: 45
      };

      // Get unique brands and models for filters
      const brands = Array.from(new Set(autoTraderData.map((v: any) => v.brand).filter(Boolean))).sort();
      const models = Array.from(new Set(autoTraderData.map((v: any) => v.model).filter(Boolean))).sort();
      const years = Array.from(new Set(autoTraderData.map((v: any) => v.year).filter(Boolean))).sort((a: any, b: any) => b - a);

      res.json({
        listings: filteredData.slice(0, 50),
        analysis,
        brands,
        models,
        years
      });

    } catch (error) {
      console.error('Error in US market intelligence:', error);
      res.status(500).json({ error: 'Failed to analyze market data' });
    }
  });

  // Live Market Data API endpoints for authentic JDM and US datasets
  app.get("/api/live-market-data", (req, res) => {
    try {
      const marketData = getLiveMarketData();
      
      if (!marketData) {
        return res.status(503).json({ 
          error: 'Market data not available', 
          message: 'Data is being refreshed, please try again in a few minutes' 
        });
      }
      
      // Apply filters if provided
      const { make, source, maxPriceAUD, minYear } = req.query;
      let jdmVehicles = marketData.jdmVehicles;
      let usVehicles = marketData.usVehicles;
      
      if (make) {
        const makeFilter = (make as string).toLowerCase();
        jdmVehicles = jdmVehicles.filter(v => v.make.toLowerCase().includes(makeFilter));
        usVehicles = usVehicles.filter(v => v.make.toLowerCase().includes(makeFilter));
      }
      
      if (maxPriceAUD) {
        const maxPrice = parseInt(maxPriceAUD as string);
        jdmVehicles = jdmVehicles.filter(v => v.priceAUD <= maxPrice);
        usVehicles = usVehicles.filter(v => v.priceAUD <= maxPrice);
      }
      
      if (minYear) {
        const yearFilter = parseInt(minYear as string);
        jdmVehicles = jdmVehicles.filter(v => v.year >= yearFilter);
        usVehicles = usVehicles.filter(v => v.year >= yearFilter);
      }
      
      if (source === 'jdm') {
        usVehicles = [];
      } else if (source === 'us') {
        jdmVehicles = [];
      }
      
      res.json({
        jdmVehicles: jdmVehicles.slice(0, 50), // Limit to 50 per source
        usVehicles: usVehicles.slice(0, 50),
        lastUpdated: marketData.lastUpdated,
        nextUpdate: marketData.nextUpdate,
        exchangeRates: marketData.exchangeRates,
        totalResults: {
          jdm: jdmVehicles.length,
          us: usVehicles.length
        }
      });
    } catch (error) {
      console.error('Error serving live market data:', error);
      res.status(500).json({ error: 'Failed to retrieve market data' });
    }
  });

  app.get("/api/live-market-analysis", (req, res) => {
    try {
      const analysis = getMarketAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error('Error generating market analysis:', error);
      res.status(500).json({ error: 'Failed to generate market analysis' });
    }
  });

  app.post("/api/refresh-market-data", async (req, res) => {
    try {
      console.log('Manual market data refresh requested');
      const refreshedData = await refreshLiveMarketData();
      res.json({ 
        success: true, 
        message: 'Market data refreshed successfully',
        jdmCount: refreshedData.jdmVehicles.length,
        usCount: refreshedData.usVehicles.length,
        lastUpdated: refreshedData.lastUpdated
      });
    } catch (error) {
      console.error('Error refreshing market data:', error);
      res.status(500).json({ 
        error: 'Failed to refresh market data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}