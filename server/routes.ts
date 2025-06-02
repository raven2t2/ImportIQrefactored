import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, type CalculationResult } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import Stripe from "stripe";
import bcrypt from "bcrypt";

// Additional schemas for new tools
const valueEstimatorSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1945).max(new Date().getFullYear()),
  country: z.enum(["japan", "usa"]),
  condition: z.enum(["excellent", "good", "fair"]).optional(),
});

const complianceSchema = z.object({
  year: z.number().min(1945).max(new Date().getFullYear()),
  category: z.enum(["passenger", "suv", "kei", "commercial"]),
});

const modEstimatorSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1950).max(new Date().getFullYear()),
  goal: z.enum(["daily", "drift", "show"]),
});

const aiRecommendationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  budget: z.number().min(20000).max(500000),
  intendedUse: z.enum(["daily", "weekend", "track", "show", "investment"]),
  experience: z.enum(["first-time", "some", "experienced"]),
  preferences: z.string().min(10),
  timeline: z.enum(["asap", "3-months", "6-months", "flexible"]),
});

const vehicleLookupSchema = z.object({
  identifier: z.string().min(1),
});

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load auction sample data
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const auctionData = JSON.parse(fs.readFileSync(path.join(__dirname, 'auction-data.json'), 'utf8'));

// JDM Chassis Code Database - Essential Import Vehicles
const jdmDatabase = {
  "JZX100": { "make": "Toyota", "model": "Chaser", "years": "1996–2001", "engine": "1JZ-GTE", "compliance_notes": "Turbo model may require emissions testing in VIC" },
  "JZX110": { "make": "Toyota", "model": "Mark II", "years": "2000–2004", "engine": "1JZ-GTE", "compliance_notes": "Popular drift platform" },
  "BNR32": { "make": "Nissan", "model": "Skyline GT-R", "years": "1989–1994", "engine": "RB26DETT", "compliance_notes": "25+ year rule eligible" },
  "BNR33": { "make": "Nissan", "model": "Skyline GT-R", "years": "1995–1998", "engine": "RB26DETT", "compliance_notes": "SEVS eligible or 25+ year rule" },
  "BNR34": { "make": "Nissan", "model": "Skyline GT-R", "years": "1999–2002", "engine": "RB26DETT", "compliance_notes": "SEVS eligible" },
  "FD3S": { "make": "Mazda", "model": "RX-7", "years": "1992–2002", "engine": "13B-REW", "compliance_notes": "Rotary engine compliance required" },
  "FC3S": { "make": "Mazda", "model": "RX-7", "years": "1986–1991", "engine": "13B-T", "compliance_notes": "25+ year rule eligible" },
  "EK9": { "make": "Honda", "model": "Civic Type R", "years": "1997–2000", "engine": "B16B", "compliance_notes": "SEVS eligible" },
  "DC2": { "make": "Honda", "model": "Integra Type R", "years": "1995–2001", "engine": "B18C", "compliance_notes": "SEVS eligible" },
  "GC8": { "make": "Subaru", "model": "Impreza WRX STI", "years": "1992–2000", "engine": "EJ20", "compliance_notes": "SEVS eligible or 25+ year rule" },
  "GDB": { "make": "Subaru", "model": "Impreza WRX STI", "years": "2000–2007", "engine": "EJ207", "compliance_notes": "SEVS eligible" },
  "AE86": { "make": "Toyota", "model": "Corolla", "years": "1983–1987", "engine": "4A-GE", "compliance_notes": "25+ year rule eligible" },
  "SW20": { "make": "Toyota", "model": "MR2", "years": "1989–1999", "engine": "3S-GTE", "compliance_notes": "Turbo model popular" },
  "NA1": { "make": "Honda", "model": "NSX", "years": "1990–1997", "engine": "C30A", "compliance_notes": "25+ year rule or SEVS" },
  "NA2": { "make": "Honda", "model": "NSX", "years": "1997–2005", "engine": "C32B", "compliance_notes": "SEVS eligible" },
  "CP9A": { "make": "Mitsubishi", "model": "Lancer Evolution IV", "years": "1996–1998", "engine": "4G63T", "compliance_notes": "SEVS eligible" },
  "CT9A": { "make": "Mitsubishi", "model": "Lancer Evolution VIII", "years": "2003–2005", "engine": "4G63T", "compliance_notes": "SEVS eligible" },
  "JZA80": { "make": "Toyota", "model": "Supra", "years": "1993–2002", "engine": "2JZ-GTE", "compliance_notes": "SEVS eligible" },
  "S13": { "make": "Nissan", "model": "Silvia", "years": "1988–1993", "engine": "CA18DET/SR20DET", "compliance_notes": "25+ year rule eligible" },
  "S14": { "make": "Nissan", "model": "Silvia", "years": "1993–1999", "engine": "SR20DET", "compliance_notes": "SEVS eligible" },
  "S15": { "make": "Nissan", "model": "Silvia", "years": "1999–2002", "engine": "SR20DET", "compliance_notes": "SEVS eligible" },
  "Z32": { "make": "Nissan", "model": "300ZX", "years": "1989–2000", "engine": "VG30DETT", "compliance_notes": "Twin turbo requires specialist compliance" },
  "RPS13": { "make": "Nissan", "model": "180SX", "years": "1989–1998", "engine": "CA18DET/SR20DET", "compliance_notes": "SEVS eligible" },
  "HCR32": { "make": "Nissan", "model": "Skyline GTS-T", "years": "1989–1993", "engine": "RB20DET", "compliance_notes": "25+ year rule eligible" },
  "EP3": { "make": "Honda", "model": "Civic Type R", "years": "2001–2005", "engine": "K20A", "compliance_notes": "SEVS eligible" },
  "AP1": { "make": "Honda", "model": "S2000", "years": "1999–2003", "engine": "F20C", "compliance_notes": "SEVS eligible" },
  "CZ4A": { "make": "Mitsubishi", "model": "Lancer Evolution X", "years": "2007–2016", "engine": "4B11T", "compliance_notes": "SEVS eligible" }
};

// Function to get auction samples for a vehicle
function getAuctionSamples(make: string, model: string, year: number) {
  const targetYear = year;
  const yearRange = 2; // +/- 2 years
  
  // Filter auction data by make, model, and year range
  const matches = auctionData.filter((entry: any) => {
    return entry.maker.toLowerCase() === make.toLowerCase() &&
           entry.model.toLowerCase().includes(model.toLowerCase()) &&
           entry.year >= (targetYear - yearRange) &&
           entry.year <= (targetYear + yearRange);
  });
  
  // Randomly select 3-5 samples
  const sampleCount = Math.min(matches.length, Math.floor(Math.random() * 3) + 3);
  const samples = [];
  
  for (let i = 0; i < sampleCount && matches.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * matches.length);
    const sample = matches.splice(randomIndex, 1)[0];
    
    // Convert JPY to AUD (using 150 yen = 1 AUD exchange rate)
    const audPrice = Math.round(sample.price_jpy / 150);
    
    samples.push({
      year: sample.year,
      mileage: sample.mileage.toLocaleString() + " km",
      auctionHouse: sample.auction_house,
      priceJpy: "¥" + sample.price_jpy.toLocaleString(),
      priceAud: "AUD $" + audPrice.toLocaleString()
    });
  }
  
  return samples;
}

function calculateImportCosts(vehiclePrice: number, shippingOrigin: string, zipCode?: string): CalculationResult {
  // Base shipping costs by origin
  let baseShipping = shippingOrigin === "japan" ? 3200 : 4500;
  
  // Regional freight adjustments based on zip code
  let freightAdjustment = 0;
  let region = "NSW (Sydney Metro)";
  
  if (zipCode) {
    const firstDigit = parseInt(zipCode.charAt(0));
    
    // Australian state-based freight costs
    switch (firstDigit) {
      case 1: // NSW (1000-1999)
      case 2: // NSW (2000-2999) - Sydney Metro
        freightAdjustment = 0; // Base rate
        region = "NSW (Sydney Metro)";
        break;
      case 3: // VIC (3000-3999) - Melbourne Metro
        freightAdjustment = 200;
        region = "VIC (Melbourne Metro)";
        break;
      case 4: // QLD (4000-4999) - Brisbane Metro
        freightAdjustment = 400;
        region = "QLD (Brisbane Metro)";
        break;
      case 5: // SA (5000-5999) - Adelaide Metro
        freightAdjustment = 600;
        region = "SA (Adelaide Metro)";
        break;
      case 6: // WA (6000-6999) - Perth Metro
        freightAdjustment = 800;
        region = "WA (Perth Metro)";
        break;
      case 7: // TAS (7000-7999) - Tasmania
        freightAdjustment = 1200;
        region = "TAS (Tasmania)";
        break;
      case 8: // NT/SA Remote (8000-8999)
        freightAdjustment = 1000;
        region = "NT/SA (Remote)";
        break;
      case 9: // WA Remote (9000-9999)
        freightAdjustment = 1500;
        region = "WA (Remote)";
        break;
      default:
        freightAdjustment = 0;
        region = "Standard Rate";
    }
  }
  
  const shipping = baseShipping + freightAdjustment;
  
  // Calculate customs duty (5% of vehicle price)
  const customsDuty = vehiclePrice * 0.05;
  
  // Calculate GST (10% of vehicle price + shipping + duty)
  const gstBase = vehiclePrice + shipping + customsDuty;
  const gst = gstBase * 0.10;
  
  // Calculate LCT (33% on amount exceeding $76,950 AUD)
  const lctThreshold = 76950;
  const subtotal = vehiclePrice + shipping + customsDuty + gst;
  const lct = subtotal > lctThreshold ? (subtotal - lctThreshold) * 0.33 : 0;
  
  // Fixed inspection fee
  const inspection = 2000;
  
  // Calculate base landed cost (before service fee)
  const baseLandedCost = vehiclePrice + shipping + customsDuty + gst + lct + inspection;
  
  // Determine service tier and fee based on base landed cost
  let serviceTier: string;
  let serviceTierDescription: string;
  let serviceFee: number;
  
  if (baseLandedCost < 65000) {
    serviceTier = "Essentials";
    serviceFee = 3000;
    serviceTierDescription = "For confident buyers who just want clean sourcing and smooth delivery. Verified partner referrals, transparent costs, progress tracking.";
  } else if (baseLandedCost <= 100000) {
    serviceTier = "Concierge";
    serviceFee = 5000;
    serviceTierDescription = "For busy professionals or first-timers who want hands-on project management. Includes mod shop liaison, priority sourcing, enhanced updates.";
  } else {
    serviceTier = "Elite";
    serviceFee = 10000;
    serviceTierDescription = "For collectors and complex builds that turn heads. Exclusive sourcing, full build coordination, white-glove delivery experience.";
  }
  
  // Calculate total cost including service fee
  const totalCost = baseLandedCost + serviceFee;
  
  return {
    vehiclePrice,
    shipping,
    customsDuty,
    gst,
    lct,
    inspection,
    serviceFee,
    totalCost,
    serviceTier,
    serviceTierDescription,
    freightBreakdown: {
      baseShipping,
      regionalAdjustment: freightAdjustment,
      region,
    },
  };
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Email checking endpoint for smart gating
  app.post("/api/check-email", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email and password are required" });
      }

      const exists = await storage.checkEmailExists(email);
      const existingTrial = await storage.getTrialStatus(email);
      
      if (existingTrial) {
        return res.json({ 
          exists: true,
          hasActiveTrial: existingTrial.isActive,
          trialDaysRemaining: existingTrial.daysRemaining,
          message: existingTrial.isActive ? 
            `Welcome back! You have ${existingTrial.daysRemaining} days left in your trial.` :
            "Your trial has expired. Ready to subscribe?"
        });
      }
      
      await storage.updateEmailCache(email, name);
      
      // Hash password before storing
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Start trial for ImportIQ automatically with hashed password
      await storage.createTrial(email, name, passwordHash);
      
      res.json({ 
        exists,
        hasActiveTrial: false,
        message: "Welcome to ImportIQ! Your 7-day trial is starting now."
      });
    } catch (error) {
      console.error("Error checking email:", error);
      res.status(500).json({ error: "Failed to process email" });
    }
  });

  // Login endpoint for existing users
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const trialStatus = await storage.getTrialStatus(email);
      const emailInfo = await storage.getEmailInfo(email);
      
      if (!trialStatus && !emailInfo) {
        return res.json({ 
          exists: false,
          message: "No account found with that email."
        });
      }
      
      if (trialStatus) {
        // Verify password
        const storedPasswordHash = await storage.getPasswordHash(email);
        if (!storedPasswordHash || !await bcrypt.compare(password, storedPasswordHash)) {
          return res.status(401).json({ error: "Invalid password" });
        }
        
        return res.json({ 
          exists: true,
          hasActiveTrial: trialStatus.isActive,
          trialDaysRemaining: trialStatus.daysRemaining,
          name: emailInfo?.name || "User",
          email: email,
          message: trialStatus.isActive ? 
            `Welcome back! You have ${trialStatus.daysRemaining} days left in your trial.` :
            "Your trial has expired."
        });
      }
      
      res.json({ 
        exists: true,
        hasActiveTrial: false,
        name: emailInfo?.name || "User",
        email: email,
        message: "Account found but no active trial."
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to process login" });
    }
  });

  // Trial status endpoint
  app.get("/api/trial-status/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const trialStatus = await storage.getTrialStatus(email);
      
      if (!trialStatus) {
        return res.status(404).json({ error: "Trial not found" });
      }
      
      res.json(trialStatus);
    } catch (error) {
      console.error("Error fetching trial status:", error);
      res.status(500).json({ error: "Failed to fetch trial status" });
    }
  });

  // Calculate import costs endpoint
  app.post("/api/calculate", async (req, res) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      
      const calculations = calculateImportCosts(
        validatedData.vehiclePrice,
        validatedData.shippingOrigin,
        validatedData.zipCode
      );
      
      // Save submission to storage
      const submission = await storage.createSubmission({
        fullName: validatedData.fullName,
        email: validatedData.email,
        vehiclePrice: validatedData.vehiclePrice.toString(),
        shippingOrigin: validatedData.shippingOrigin,
        shipping: calculations.shipping.toString(),
        customsDuty: calculations.customsDuty.toString(),
        gst: calculations.gst.toString(),
        lct: calculations.lct.toString(),
        inspection: calculations.inspection.toString(),
        serviceFee: calculations.serviceFee.toString(),
        totalCost: calculations.totalCost.toString(),
        serviceTier: calculations.serviceTier,
        zipCode: validatedData.zipCode || null,
        vehicleMake: validatedData.vehicleMake || null,
        vehicleModel: validatedData.vehicleModel || null,
        vehicleYear: validatedData.vehicleYear || null,
      });
      
      res.json({
        success: true,
        submission,
        calculations,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
      }
      
      console.error("Error calculating costs:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });
  
  // Get all submissions endpoint (for debugging/admin purposes)
  app.get("/api/submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Value Estimator endpoint
  app.post("/api/value-estimator", async (req, res) => {
    try {
      const validatedData = valueEstimatorSchema.parse(req.body);
      
      // Comprehensive global vehicle database
      const globalVehicleDatabase = {
        // Japanese Vehicles
        "toyota supra": { 
          basePrice: { japan: 85000, usa: 95000 }, 
          demandFactor: 1.4, 
          category: "Performance Legend",
          popularity: "Extremely High Demand"
        },
        "nissan skyline": { 
          basePrice: { japan: 55000, usa: 0 }, // USA doesn't have R34s legally yet
          demandFactor: 1.2, 
          category: "JDM Icon",
          popularity: "High Collector Interest"
        },
        "honda nsx": { 
          basePrice: { japan: 120000, usa: 140000 }, 
          demandFactor: 1.3, 
          category: "Supercar Classic",
          popularity: "Investment Grade"
        },
        "mazda rx7": { 
          basePrice: { japan: 65000, usa: 75000 }, 
          demandFactor: 1.3, 
          category: "Rotary Icon",
          popularity: "Enthusiast Favorite"
        },
        "subaru impreza": { 
          basePrice: { japan: 35000, usa: 45000 }, 
          demandFactor: 1.1, 
          category: "Rally Heritage",
          popularity: "Strong AWD Market"
        },
        "toyota ae86": { 
          basePrice: { japan: 35000, usa: 25000 }, 
          demandFactor: 1.3, 
          category: "Drift Legend",
          popularity: "Cult Following"
        },
        "nissan silvia": { 
          basePrice: { japan: 28000, usa: 0 }, 
          demandFactor: 1.1, 
          category: "Drift Platform",
          popularity: "High Tuner Demand"
        },
        "mazda miata": { 
          basePrice: { japan: 20000, usa: 18000 }, 
          demandFactor: 0.9, 
          category: "Roadster Classic",
          popularity: "Strong Sports Car Market"
        },
        "honda civic": { 
          basePrice: { japan: 25000, usa: 22000 }, 
          demandFactor: 0.9, 
          category: "Tuner Platform",
          popularity: "Broad Appeal"
        },
        "mitsubishi lancer": { 
          basePrice: { japan: 40000, usa: 35000 }, 
          demandFactor: 1.2, 
          category: "Rally Icon",
          popularity: "Performance Heritage"
        },
        // U.S. Vehicles
        "ford mustang": { 
          basePrice: { japan: 0, usa: 45000 }, 
          demandFactor: 1.1, 
          category: "American Muscle",
          popularity: "Global Icon"
        },
        "chevrolet camaro": { 
          basePrice: { japan: 0, usa: 50000 }, 
          demandFactor: 1.0, 
          category: "Muscle Car",
          popularity: "Performance Market"
        },
        "dodge challenger": { 
          basePrice: { japan: 0, usa: 55000 }, 
          demandFactor: 1.1, 
          category: "Modern Muscle",
          popularity: "Retro Appeal"
        },
        "chevrolet corvette": { 
          basePrice: { japan: 0, usa: 85000 }, 
          demandFactor: 1.3, 
          category: "American Supercar",
          popularity: "Performance Legend"
        },
        "ford f150": { 
          basePrice: { japan: 0, usa: 65000 }, 
          demandFactor: 0.9, 
          category: "Full-Size Truck",
          popularity: "Work & Lifestyle"
        },
        "ram 1500": { 
          basePrice: { japan: 0, usa: 62000 }, 
          demandFactor: 0.9, 
          category: "Heavy Duty Truck",
          popularity: "Commercial & Recreation"
        }
      };
      
      // Create vehicle key for lookup
      const vehicleKey = `${validatedData.make.toLowerCase()} ${validatedData.model.toLowerCase()}`;
      const vehicleData = (globalVehicleDatabase as any)[vehicleKey] || {
        basePrice: { japan: 35000, usa: 40000 },
        demandFactor: 1.0,
        category: "Import Vehicle",
        popularity: "General Market"
      };

      // Get base price for the selected country
      const countryBasePrice = vehicleData.basePrice[validatedData.country];
      if (countryBasePrice === 0) {
        return res.json({
          success: false,
          error: `${validatedData.make} ${validatedData.model} is not commonly available from ${validatedData.country.toUpperCase()} market`
        });
      }
      
      // Calculate age factor
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - validatedData.year;
      let ageFactor = 1.0;
      
      if (vehicleAge < 5) {
        ageFactor = 1.2;
      } else if (vehicleAge > 25) {
        ageFactor = 1.3;
      } else {
        ageFactor = Math.max(0.4, 1 - (vehicleAge * 0.03));
      }

      // Condition factor
      const conditionMultiplier = {
        excellent: 1.15,
        good: 1.0,
        fair: 0.85
      };
      const conditionFactor = conditionMultiplier[validatedData.condition || 'good'];

      const adjustedBasePrice = Math.round(countryBasePrice * ageFactor * vehicleData.demandFactor * conditionFactor);
      
      // Generate realistic market listings with variation
      const listings = [
        {
          source: "Japanese Auction House",
          price: adjustedBasePrice - Math.floor(Math.random() * 8000 + 2000),
          priceWithMarkup: Math.round((adjustedBasePrice - Math.floor(Math.random() * 8000 + 2000)) * 1.2),
          currency: "AUD",
          mileage: `${Math.floor(Math.random() * 80000) + 25000} km`,
          condition: "Grade 4.5/5",
          location: "Tokyo Region",
          url: "#",
          imageUrl: ""
        },
        {
          source: "Specialist Dealer",
          price: adjustedBasePrice + Math.floor(Math.random() * 5000),
          priceWithMarkup: Math.round((adjustedBasePrice + Math.floor(Math.random() * 5000)) * 1.2),
          currency: "AUD",
          mileage: `${Math.floor(Math.random() * 60000) + 30000} km`,
          condition: "Grade 4/5",
          location: "Osaka Region",
          url: "#",
          imageUrl: ""
        },
        {
          source: "Export Dealer",
          price: adjustedBasePrice + Math.floor(Math.random() * 3000 - 1500),
          priceWithMarkup: Math.round((adjustedBasePrice + Math.floor(Math.random() * 3000 - 1500)) * 1.2),
          currency: "AUD",
          mileage: `${Math.floor(Math.random() * 50000) + 35000} km`,
          condition: "Grade 4.5/5",
          location: "Nagoya Region",
          url: "#",
          imageUrl: ""
        }
      ];
      
      const averagePrice = Math.round(listings.reduce((sum, listing) => sum + listing.price, 0) / listings.length);
      const averagePriceWithMarkup = Math.round(listings.reduce((sum, listing) => sum + listing.priceWithMarkup, 0) / listings.length);
      
      // Generate market estimates in the correct format for frontend
      const estimates = [
        {
          source: validatedData.country === 'japan' ? "Auction House Direct" : "Dealer Network",
          basePrice: Math.round(adjustedBasePrice * 0.92),
          finalPrice: Math.round(adjustedBasePrice * 0.92 * 1.25),
          markup: 25,
          currency: "AUD",
          description: validatedData.country === 'japan' ? "Direct auction purchase, highest savings" : "Established dealer network, verified condition"
        },
        {
          source: "Specialist Importer",
          basePrice: Math.round(adjustedBasePrice * 1.05),
          finalPrice: Math.round(adjustedBasePrice * 1.05 * 1.18),
          markup: 18,
          currency: "AUD",
          description: "Curated selection, pre-import inspection included"
        },
        {
          source: "Broker Service",
          basePrice: Math.round(adjustedBasePrice * 1.02),
          finalPrice: Math.round(adjustedBasePrice * 1.02 * 1.22),
          markup: 22,
          currency: "AUD",
          description: "Full-service import, compliance management"
        }
      ];

      // Calculate estimated import total using our calculator logic
      const averageVehiclePrice = estimates.reduce((sum, est) => sum + est.finalPrice, 0) / estimates.length;
      const shipping = validatedData.country === 'japan' ? 3400 : 4500;
      const customsDuty = averageVehiclePrice * 0.05;
      const gst = (averageVehiclePrice + shipping + customsDuty) * 0.10;
      const lct = (averageVehiclePrice + shipping + customsDuty + gst) > 76950 ? 
        ((averageVehiclePrice + shipping + customsDuty + gst) - 76950) * 0.33 : 0;
      const compliance = 3000;
      
      const estimatedImportTotal = Math.round(averageVehiclePrice + shipping + customsDuty + gst + lct + compliance);

      // Determine demand rating
      const demandRating = vehicleData.demandFactor > 1.2 ? "High" : 
                          vehicleData.demandFactor > 1.0 ? "Medium" : "Low";

      // Market insights
      const insights = [
        `${validatedData.year} model year ${ageFactor > 1 ? 'commands premium pricing' : 'reflects market depreciation'}`,
        `${validatedData.country.toUpperCase()} sourcing ${validatedData.country === 'japan' ? 'offers unique JDM variants' : 'provides familiar U.S. specifications'}`,
        validatedData.condition ? `${validatedData.condition} condition affects final pricing` : "Condition assessment impacts final valuation",
        "Professional import services include compliance, shipping, and duties",
        `${vehicleData.category} vehicles show ${demandRating.toLowerCase()} market demand`
      ];

      res.json({
        success: true,
        estimates,
        demandRating,
        marketInsights: insights,
        estimatedImportTotal,
        vehicleInfo: {
          category: vehicleData.category,
          popularity: vehicleData.popularity
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
      }
      
      console.error("Error in japan-value:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Compliance Timeline Estimator endpoint
  app.post("/api/compliance-estimate", async (req, res) => {
    try {
      const validatedData = complianceSchema.parse(req.body);
      
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - validatedData.year;
      
      let estimatedWeeks: string;
      let explanation: string;
      let factors: string[];
      let isEligible: boolean = true;
      
      if (vehicleAge >= 25) {
        estimatedWeeks = "4-6 weeks";
        explanation = "Vehicles over 25 years old are eligible for importation under the historic vehicle scheme, which typically has faster processing times due to reduced compliance requirements.";
        factors = [
          "Vehicle qualifies as historic (25+ years old)",
          "Simplified compliance requirements",
          "Current port processing times",
          "Document preparation and verification"
        ];
      } else if (vehicleAge >= 15 && ["passenger", "suv"].includes(validatedData.category)) {
        estimatedWeeks = "8-12 weeks";
        explanation = "This vehicle may be SEVS (Specialist and Enthusiast Vehicle Scheme) eligible, requiring full compliance testing but following established procedures.";
        factors = [
          "SEVS eligibility assessment required",
          "Full ADR compliance testing needed",
          "Workshop availability for modifications",
          "Inspector scheduling and availability",
          "Current compliance plate processing times"
        ];
      } else {
        estimatedWeeks = "12+ weeks (if possible)";
        explanation = "This vehicle may require special approval or extensive modifications to meet Australian Design Rules. Some vehicles in this category cannot be made compliant.";
        isEligible = false;
        factors = [
          "May not be eligible for standard import schemes",
          "Extensive modifications likely required",
          "Special approval processes may be needed",
          "Limited workshop expertise for this vehicle type",
          "Potential for compliance rejection"
        ];
      }
      
      res.json({
        success: true,
        estimatedWeeks,
        category: validatedData.category,
        explanation,
        factors,
        isEligible
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
      }
      
      console.error("Error in compliance-estimate:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Mod Package Estimator endpoint
  app.post("/api/mod-estimator", async (req, res) => {
    try {
      const validatedData = modEstimatorSchema.parse(req.body);
      
      const vehicle = `${validatedData.year} ${validatedData.make} ${validatedData.model}`;
      
      // Base modification packages
      const baseStages = [
        {
          stage: 1,
          name: "Stage 1 - Foundation",
          description: "Essential performance and handling upgrades",
          cost: 3000,
          modifications: [
            "Cold air intake system",
            "Performance exhaust system", 
            "Lowering springs or coilovers",
            "Performance wheels and tyres",
            "Basic engine tune"
          ]
        },
        {
          stage: 2,
          name: "Stage 2 - Performance",
          description: "Significant power and handling improvements",
          cost: 8000,
          modifications: [
            "Turbocharger or supercharger upgrade",
            "Performance brake system",
            "Suspension geometry kit",
            "Intercooler and piping",
            "Engine management system",
            "Clutch and flywheel upgrade"
          ]
        },
        {
          stage: 3,
          name: "Stage 3 - Elite",
          description: "Complete transformation for show or track",
          cost: 15000,
          modifications: [
            "Widebody kit and aerodynamics",
            "Full interior customization",
            "Professional paint and wrap",
            "Roll cage installation",
            "Custom fabrication work",
            "High-end audio system"
          ]
        }
      ];
      
      // Adjust costs and modifications based on goal
      let stages = baseStages.map(stage => ({ ...stage }));
      let recommendedServiceTier: string;
      let serviceTierDescription: string;
      
      switch (validatedData.goal) {
        case "daily":
          stages[0].cost = 2500;
          stages[1].cost = 6000;
          stages[2].cost = 12000;
          recommendedServiceTier = "Concierge";
          serviceTierDescription = "Perfect for daily builds requiring reliable coordination between import and modification phases.";
          break;
        case "drift":
          stages[1].modifications.push("Limited slip differential", "Steering angle kit");
          stages[2].modifications.push("Hydraulic handbrake", "Racing seat and harness");
          recommendedServiceTier = "Elite";
          serviceTierDescription = "Drift builds require precise coordination and specialized knowledge - our Elite service ensures nothing is missed.";
          break;
        case "show":
          stages[2].cost = 20000;
          stages[2].modifications.push("Custom lighting system", "Show-quality detailing");
          recommendedServiceTier = "Elite";
          serviceTierDescription = "Show cars demand perfection at every level - from sourcing to final presentation.";
          break;
      }
      
      res.json({
        success: true,
        vehicle,
        goal: validatedData.goal,
        stages,
        recommendedServiceTier,
        serviceTierDescription
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
      }
      
      console.error("Error in mod-estimator:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  // Vehicle Lookup endpoint
  app.post("/api/vehicle-lookup", async (req, res) => {
    try {
      const validatedData = vehicleLookupSchema.parse(req.body);
      const { identifier } = validatedData;

      // Detect if VIN (17 characters) or JDM chassis code
      const isVin = identifier.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(identifier);

      if (isVin) {
        // VIN Decode using NHTSA API
        try {
          const vinResponse = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${identifier}?format=json`);
          const vinData = await vinResponse.json();

          if (vinData.Results && vinData.Results.length > 0) {
            const results = vinData.Results;
            const make = results.find((r: any) => r.Variable === "Make")?.Value || "";
            const model = results.find((r: any) => r.Variable === "Model")?.Value || "";
            const year = results.find((r: any) => r.Variable === "Model Year")?.Value || "";
            const trim = results.find((r: any) => r.Variable === "Trim")?.Value || "";
            const engine = results.find((r: any) => r.Variable === "Engine Model")?.Value || "";
            const fuelType = results.find((r: any) => r.Variable === "Fuel Type - Primary")?.Value || "";

            if (!make || !model) {
              return res.json({
                success: false,
                error: "VIN could not be decoded. Please verify the VIN is correct.",
                type: "vin"
              });
            }

            // Get auction samples
            const auctionSamples = getAuctionSamples(make, model, parseInt(year) || new Date().getFullYear());

            res.json({
              success: true,
              type: "vin",
              data: {
                make,
                model,
                year,
                trim: trim || undefined,
                engine: engine || undefined,
                fuelType: fuelType || undefined
              },
              auctionSamples
            });
          } else {
            res.json({
              success: false,
              error: "VIN could not be decoded. Please verify the VIN is correct.",
              type: "vin"
            });
          }
        } catch (error) {
          console.error("NHTSA API error:", error);
          res.json({
            success: false,
            error: "Failed to decode VIN. Please try again later.",
            type: "vin"
          });
        }
      } else {
        // JDM Chassis Code Lookup
        const chassisCode = identifier.toUpperCase();
        const jdmData = jdmDatabase[chassisCode as keyof typeof jdmDatabase];

        if (jdmData) {
          // Extract year from years range for auction samples
          const yearMatch = jdmData.years.match(/(\d{4})/);
          const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
          
          // Get auction samples
          const auctionSamples = getAuctionSamples(jdmData.make, jdmData.model, year);

          res.json({
            success: true,
            type: "jdm",
            data: jdmData,
            auctionSamples
          });
        } else {
          // Find similar chassis codes and alternative suggestions
          const allCodes = Object.keys(jdmDatabase);
          const suggestions = [];
          
          // Look for partial matches and similar codes
          const queryUpper = chassisCode.toUpperCase();
          const similarCodes = allCodes.filter(code => {
            return code.includes(queryUpper.substring(0, 3)) || 
                   queryUpper.includes(code.substring(0, 3)) ||
                   code.substring(0, 4) === queryUpper.substring(0, 4);
          });

          // Add popular alternatives if no similar codes found
          if (similarCodes.length === 0) {
            const popularCodes = ["JZX100", "BNR32", "FD3S", "EK9", "GC8", "AE86"];
            suggestions.push(...popularCodes.slice(0, 3));
          } else {
            suggestions.push(...similarCodes.slice(0, 5));
          }

          // Get auction samples for suggested vehicles
          const suggestionData = suggestions.map(code => ({
            code,
            vehicle: jdmDatabase[code as keyof typeof jdmDatabase]
          })).filter(item => item.vehicle);

          // Get some auction samples from suggested vehicles
          const auctionSamples: any[] = [];
          suggestionData.slice(0, 3).forEach(item => {
            if (item.vehicle) {
              const samples = getAuctionSamples(item.vehicle.make, item.vehicle.model, 2000);
              auctionSamples.push(...samples.slice(0, 2));
            }
          });

          res.json({
            success: false,
            error: "Chassis code not found in our database",
            type: "jdm",
            suggestions: suggestionData.map(item => ({
              code: item.code,
              description: `${item.vehicle.make} ${item.vehicle.model} (${item.vehicle.years})`
            })),
            auctionSamples: auctionSamples.slice(0, 6)
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
      }
      console.error("Vehicle lookup error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to lookup vehicle information" 
      });
    }
  });

  // AI Chat Assistant endpoint
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, vehicleContext, userLocation, chatHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      let systemPrompt = `You are an expert AI assistant specializing in vehicle import requirements for Australia. You provide accurate, helpful information about:

- Vehicle import eligibility and compliance requirements
- State-specific registration processes (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)
- ADR (Australian Design Rules) compliance
- VASS (Vehicle Assessment Signatory Scheme) processes
- Modification regulations and engineering requirements
- Shipping, customs, and quarantine procedures
- Cost estimates and timelines

Always provide specific, actionable advice. When discussing state requirements, be precise about which state you're referring to. Use Australian terminology and currency (AUD). Keep responses concise but comprehensive.`;

      if (vehicleContext) {
        systemPrompt += `\n\nUser's current vehicle context: ${vehicleContext}`;
      }

      if (userLocation) {
        systemPrompt += `\n\nUser's location: ${userLocation}`;
      }

      const messages = [
        { role: "system", content: systemPrompt },
        ...(chatHistory || []).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0].message.content;

      res.json({ 
        message: aiResponse,
        success: true 
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // AI Recommendations endpoint
  app.post("/api/ai-recommendations", async (req, res) => {
    try {
      const validatedData = aiRecommendationSchema.parse(req.body);

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          success: false, 
          error: "AI service is currently unavailable. Please contact support for vehicle recommendations." 
        });
      }

      // Create detailed prompt for OpenAI
      const prompt = `You are Michael T. Ragland from Immaculate Imports - a dual citizen with deep sourcing networks across Australia, Japan, and the U.S. You have military logistics background and 15+ years of automotive import expertise. You're analyzing this customer profile to provide 3 specific, actionable vehicle recommendations.

Customer Profile:
- Name: ${validatedData.name}
- Budget: $${validatedData.budget.toLocaleString()} AUD (total including all costs)
- Intended Use: ${validatedData.intendedUse}
- Experience Level: ${validatedData.experience}
- Preferences: ${validatedData.preferences}
- Timeline: ${validatedData.timeline}

CRITICAL: Use realistic 2024 market pricing. Do NOT inflate prices. Examples of realistic pricing:
- 1988 Camaro IROC-Z (clean): $35K USD base ($62K AUD landed)
- R32 GT-R (good condition): $45K USD base ($75K AUD landed)  
- FD RX-7 (clean): $55K USD base ($90K AUD landed)
- Supra A80 (turbo): $85K USD base ($140K AUD landed)

{
  "recommendations": [
    {
      "vehicleName": "Specific year/make/model (be precise, e.g., '2018 Honda Civic Type R FK8')",
      "estimatedPrice": number (realistic total landed cost in AUD - be conservative with pricing),
      "category": "Clear category like 'JDM Hot Hatch' or 'USDM Muscle'",
      "reasoning": "Military-style brief: why this specific vehicle hits their requirements perfectly",
      "pros": ["3-4 tactical advantages for their use case"],
      "cons": ["2-3 honest considerations they need to know"],
      "marketInsight": "Current market intelligence - pricing trends, availability, what you're seeing in auctions",
      "confidence": number (85-95 range - you're confident in your recommendations)
    }
  ],
  "budgetAnalysis": "Frank assessment of what their budget achieves in the current market - be honest about realistic expectations",
  "marketTrends": ["3-4 specific trends you're seeing across your three-market network"],
  "personalizedAdvice": "Direct, actionable advice based on their experience level and timeline - what they should do next"
}

Use accurate 2024 import costs: vehicle cost + shipping ($3200 Japan/$4500 US) + 5% customs duty + 10% GST + LCT (33% if over $89,332) + compliance ($3000-5000) + service fees ($3000-10000).

For classic/older vehicles (pre-2000), pricing is driven by rarity, condition, and desirability, NOT age depreciation. A clean 1988 IROC-Z should be priced around $35K USD base price, not inflated numbers.

Write like a military logistics expert who knows real market values and won't overprice to make a sale.

Respond with a JSON object containing your recommendations.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are Michael T. Ragland, military logistics expert and automotive import specialist with deep modification experience."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.7
      });

      const aiData = JSON.parse(response.choices[0].message.content || "{}");

      res.json({
        success: true,
        ...aiData
      });

    } catch (error: any) {
      console.error("AI Recommendations error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Unable to generate recommendations at this time. Please try again or contact support." 
      });
    }
  });

  // Admin authentication endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Simple admin password check - in production, use environment variable
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      
      if (password === adminPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid admin password" });
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ error: "Failed to process admin login" });
    }
  });

  // Dashboard API endpoints
  app.get("/api/admin/submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  app.get("/api/admin/ai-recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getAllAIRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      res.status(500).json({ error: "Failed to fetch AI recommendations" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      const emailCache = await storage.getAllEmailCache();
      const trials = await storage.getAllTrials();
      
      const activeTrials = trials.filter(trial => trial.isActive).length;
      const estimatedRevenue = activeTrials * 77; // $77 per trial
      
      res.json({
        totalSubmissions: submissions.length,
        totalUsers: emailCache.length,
        activeTrials: activeTrials,
        totalRevenue: estimatedRevenue
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
  });

  // Enhanced business analytics endpoint
  app.get("/api/admin/business-insights", async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      const trials = await storage.getAllTrials();
      const emailCache = await storage.getAllEmailCache();

      // Calculate business metrics
      const totalImportValue = submissions.reduce((sum, sub) => sum + parseFloat(sub.totalCost || "0"), 0);
      const avgImportValue = submissions.length > 0 ? totalImportValue / submissions.length : 0;
      
      // Service tier analysis
      const tierDistribution = submissions.reduce((acc, sub) => {
        acc[sub.serviceTier] = (acc[sub.serviceTier] || 0) + 1;
        return acc;
      }, {});

      // Market analysis
      const originDistribution = submissions.reduce((acc, sub) => {
        acc[sub.shippingOrigin] = (acc[sub.shippingOrigin] || 0) + 1;
        return acc;
      }, {});

      // Time-based analysis
      const now = new Date();
      const thisWeek = submissions.filter(sub => {
        const submissionDate = new Date(sub.createdAt);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return submissionDate > weekAgo;
      });

      const thisMonth = submissions.filter(sub => {
        const submissionDate = new Date(sub.createdAt);
        return submissionDate.getMonth() === now.getMonth() && 
               submissionDate.getFullYear() === now.getFullYear();
      });

      // Conversion metrics
      const conversionRate = emailCache.length > 0 ? (trials.filter(t => t.isActive).length / emailCache.length) * 100 : 0;
      
      // Top performing metrics
      const topTier = Object.entries(tierDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A";
      const topOrigin = Object.entries(originDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A";

      // Growth metrics
      const lastWeekSubmissions = submissions.filter(sub => {
        const submissionDate = new Date(sub.createdAt);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return submissionDate > twoWeeksAgo && submissionDate <= oneWeekAgo;
      });

      const weeklyGrowth = lastWeekSubmissions.length > 0 ? 
        ((thisWeek.length - lastWeekSubmissions.length) / lastWeekSubmissions.length) * 100 : 0;

      res.json({
        financialMetrics: {
          totalImportValue,
          avgImportValue,
          potentialCommission: totalImportValue * 0.05, // 5% commission estimate
          estimatedLifetimeValue: avgImportValue * 1.3 // Repeat customer factor
        },
        userEngagement: {
          conversionRate,
          totalUsers: emailCache.length,
          activeTrials: trials.filter(t => t.isActive).length,
          trialConversionRate: trials.length > 0 ? (trials.filter(t => t.isActive).length / trials.length) * 100 : 0
        },
        marketInsights: {
          topServiceTier: topTier,
          topImportOrigin: topOrigin,
          tierDistribution,
          originDistribution
        },
        timeBasedMetrics: {
          thisWeekSubmissions: thisWeek.length,
          thisMonthSubmissions: thisMonth.length,
          weeklyGrowthRate: weeklyGrowth,
          avgDailySubmissions: thisWeek.length / 7
        },
        actionableInsights: [
          {
            metric: "Top Service Tier",
            value: topTier,
            insight: `${topTier} service is most popular - consider promoting premium features`,
            priority: "high"
          },
          {
            metric: "Import Market Focus",
            value: topOrigin.toUpperCase(),
            insight: `${topOrigin.toUpperCase()} market shows strong demand - expand partnerships`,
            priority: "medium"
          },
          {
            metric: "Conversion Opportunity",
            value: `${conversionRate.toFixed(1)}%`,
            insight: conversionRate < 15 ? "Low conversion rate - optimize trial experience" : "Good conversion rate - scale marketing",
            priority: conversionRate < 15 ? "high" : "low"
          },
          {
            metric: "Weekly Growth",
            value: `${weeklyGrowth > 0 ? '+' : ''}${weeklyGrowth.toFixed(1)}%`,
            insight: weeklyGrowth > 0 ? "Positive growth trend - maintain momentum" : "Negative growth - review marketing strategy",
            priority: weeklyGrowth < 0 ? "high" : "medium"
          }
        ]
      });
    } catch (error) {
      console.error("Error fetching business insights:", error);
      res.status(500).json({ error: "Failed to fetch business insights" });
    }
  });

  // Stripe subscription endpoint
  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { plan } = req.body;
      const amount = plan === 'yearly' ? Math.round(97 * 12 * 0.75 * 100) : 97 * 100; // yearly gets 25% discount
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "aud",
        metadata: {
          plan: plan,
          subscription_type: 'importiq_professional'
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating subscription: " + error.message 
      });
    }
  });

  // Registration stats endpoint - simulated Australian registration data
  app.get("/api/registration-stats", async (req, res) => {
    const { state = "VIC", year = "2023", make = "" } = req.query;
    
    try {
      // Simulated registration data based on actual Australian market patterns
      const simulatedData = {
        totalRegistrations: 342156,
        topMakes: [
          { make: "Toyota", count: 67834 },
          { make: "Mazda", count: 45213 },
          { make: "Ford", count: 38756 },
          { make: "Holden", count: 32187 },
          { make: "Nissan", count: 28934 },
          { make: "Subaru", count: 24567 },
          { make: "BMW", count: 18243 },
          { make: "Mercedes-Benz", count: 15678 },
          { make: "Audi", count: 12456 },
          { make: "Lexus", count: 8934 }
        ],
        topModels: [
          { model: "Toyota Camry", count: 15234 },
          { model: "Mazda CX-5", count: 12876 },
          { model: "Ford Ranger", count: 11543 },
          { model: "Toyota RAV4", count: 10987 },
          { model: "Nissan X-Trail", count: 9876 }
        ],
        yearDistribution: [
          { year: 2023, count: 89456 },
          { year: 2022, count: 76234 },
          { year: 2021, count: 67892 },
          { year: 2020, count: 58734 },
          { year: 2019, count: 49768 }
        ],
        locationStats: [
          { location: "Melbourne", count: 156789 },
          { location: "Geelong", count: 45678 },
          { location: "Ballarat", count: 23456 },
          { location: "Bendigo", count: 18765 },
          { location: "Warrnambool", count: 12345 }
        ],
        data: [] // Detailed records would be here
      };

      res.json(simulatedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch registration data" });
    }
  });

  // Import volume dashboard endpoint - simulated Australian import data
  app.get("/api/import-volume-dashboard", async (req, res) => {
    const { year = "2023", port = "all" } = req.query;
    
    try {
      // Simulated import data based on Australian port statistics
      const simulatedData = {
        totalAnnualVolume: 156789,
        totalAnnualValue: 4567890000,
        averageVehicleValue: 29134,
        topPorts: [
          { port: "Melbourne", totalVolume: 67834, totalValue: 1987654321, percentage: 43.2 },
          { port: "Sydney", totalVolume: 45213, totalValue: 1345678901, percentage: 28.8 },
          { port: "Brisbane", totalVolume: 23456, totalValue: 678901234, percentage: 15.0 },
          { port: "Perth", totalVolume: 12345, totalValue: 345678901, percentage: 7.9 },
          { port: "Adelaide", totalVolume: 7941, totalValue: 210123456, percentage: 5.1 }
        ],
        monthlyTrends: [
          { month: "Jan", volume: 12456, value: 361234567 },
          { month: "Feb", volume: 11234, value: 325678901 },
          { month: "Mar", volume: 13567, value: 393456789 },
          { month: "Apr", volume: 12890, value: 373891234 },
          { month: "May", volume: 14123, value: 409567890 },
          { month: "Jun", volume: 13456, value: 390123456 },
          { month: "Jul", volume: 12789, value: 370567891 },
          { month: "Aug", volume: 13234, value: 383456789 },
          { month: "Sep", volume: 12567, value: 364123456 },
          { month: "Oct", volume: 13891, value: 402567890 },
          { month: "Nov", volume: 13234, value: 383891234 },
          { month: "Dec", volume: 12347, value: 357890123 }
        ],
        countryBreakdown: [
          { country: "Japan", volume: 89456, value: 2601234567, percentage: 57.0 },
          { country: "USA", volume: 34567, value: 1002345678, percentage: 22.1 },
          { country: "Germany", volume: 15678, value: 454567890, percentage: 10.0 },
          { country: "UK", volume: 9876, value: 286789012, percentage: 6.3 },
          { country: "Korea", volume: 7212, value: 209123456, percentage: 4.6 }
        ]
      };

      res.json(simulatedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch import volume data" });
    }
  });

  // Auction explorer endpoint - connects to Kaggle Japanese auction dataset
  app.post("/api/auction-explorer", async (req, res) => {
    const { make, model, yearFrom, yearTo, auctionHouse } = req.body;
    
    try {
      // Connect to Kaggle API for the Japanese vehicle auction dataset
      // This requires Kaggle API credentials to access the dataset
      res.status(503).json({
        error: "Auction data requires Kaggle API access to Japanese vehicle auction dataset",
        message: "To access historical auction data from major Japanese auction houses, please provide your Kaggle API credentials",
        requiredCredentials: ["KAGGLE_USERNAME", "KAGGLE_KEY"],
        datasetInfo: "Dataset: japanese-used-car-auction-prices",
        dataSource: "Kaggle - Japanese Vehicle Auction Historical Data"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch auction data" });
    }
  });

  // Save report to dashboard and email
  app.post("/api/save-report", async (req, res) => {
    try {
      const { email, reportType, reportTitle, reportData } = req.body;

      // Save report to database
      const report = await storage.saveReport({
        email,
        reportType,
        reportTitle,
        reportData,
        emailSent: false
      });

      // Here you can add email functionality with SendGrid
      // For now, just saving to dashboard
      
      res.json({ 
        success: true, 
        message: "Report saved to your ImportIQ dashboard",
        reportId: report.id 
      });
    } catch (error) {
      console.error("Save report error:", error);
      res.status(500).json({ success: false, message: "Failed to save report" });
    }
  });

  // Get user reports for dashboard
  app.get("/api/user-reports", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const reports = await storage.getUserReports(email as string);
      res.json({ success: true, reports });
    } catch (error) {
      console.error("Get user reports error:", error);
      res.status(500).json({ success: false, message: "Failed to get reports" });
    }
  });

  // Booking endpoints
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        service: req.body.service,
        preferredDate: req.body.preferredDate,
        preferredTime: req.body.preferredTime,
        vehicleDetails: req.body.vehicleDetails || null,
        message: req.body.message || null,
        status: "pending",
      };
      
      const booking = await storage.createBooking(bookingData);
      res.json({ 
        success: true, 
        bookingId: booking.id.toString(),
        confirmationEmail: true 
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking: " + error.message });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings: " + error.message });
    }
  });

  app.put("/api/bookings/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(parseInt(id), status);
      res.json({ success: true, booking });
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking: " + error.message });
    }
  });

  // Affiliate System Routes
  
  // Public affiliate signup
  app.post("/api/affiliate/signup", async (req, res) => {
    try {
      const { name, email, socialLink } = req.body;
      
      // Check if affiliate already exists
      const existingAffiliate = await storage.getAffiliateByEmail(email);
      if (existingAffiliate) {
        return res.status(400).json({ message: "Affiliate with this email already exists" });
      }
      
      const affiliate = await storage.createAffiliate({
        name,
        email,
        socialLink: socialLink || null,
      });
      
      res.json({ 
        success: true, 
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          referralCode: affiliate.referralCode,
          tier: affiliate.tier,
          commissionRate: affiliate.commissionRate
        }
      });
    } catch (error) {
      console.error("Error creating affiliate:", error);
      res.status(500).json({ message: "Failed to create affiliate" });
    }
  });

  // Track referral clicks
  app.post("/api/affiliate/track-click", async (req, res) => {
    try {
      const { referralCode } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');
      const referer = req.get('Referer');
      
      const affiliate = await storage.getAffiliateByReferralCode(referralCode);
      if (!affiliate) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
      
      await storage.trackReferralClick({
        affiliateId: affiliate.id,
        ipAddress,
        userAgent,
        referer
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking click:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // Get affiliate dashboard data
  app.get("/api/affiliate/:email", async (req, res) => {
    try {
      const { email } = req.params;
      
      const affiliate = await storage.getAffiliateByEmail(email);
      if (!affiliate) {
        return res.status(404).json({ message: "Affiliate not found" });
      }
      
      const stats = await storage.getReferralStats(affiliate.id);
      const payoutRequests = await storage.getPayoutRequests(affiliate.id);
      
      let influencerProfile = null;
      if (affiliate.isInfluencer) {
        influencerProfile = await storage.getInfluencerProfile(affiliate.id);
      }
      
      res.json({
        affiliate: {
          ...affiliate,
          currentBalance: affiliate.currentBalance / 100, // Convert cents to dollars
          totalEarnings: affiliate.totalEarnings / 100
        },
        stats,
        payoutRequests: payoutRequests.map(req => ({
          ...req,
          amount: req.amount / 100
        })),
        influencerProfile
      });
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
      res.status(500).json({ message: "Failed to fetch affiliate data" });
    }
  });

  // Create payout request
  app.post("/api/affiliate/payout-request", async (req, res) => {
    try {
      const { affiliateEmail, amount, paymentMethod, paymentDetails } = req.body;
      
      const affiliate = await storage.getAffiliateByEmail(affiliateEmail);
      if (!affiliate) {
        return res.status(404).json({ message: "Affiliate not found" });
      }
      
      const amountInCents = Math.round(amount * 100);
      if (amountInCents > affiliate.currentBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      const payoutRequest = await storage.createPayoutRequest({
        affiliateId: affiliate.id,
        amount: amountInCents,
        paymentMethod,
        paymentDetails
      });
      
      res.json({ success: true, payoutRequest });
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Get influencer landing page
  app.get("/api/influencer/:handle", async (req, res) => {
    try {
      const { handle } = req.params;
      
      const profile = await storage.getInfluencerProfileByHandle(handle);
      if (!profile || !profile.isActive) {
        return res.status(404).json({ message: "Influencer not found" });
      }
      
      const affiliate = await storage.getAffiliate(profile.affiliateId);
      if (!affiliate) {
        return res.status(404).json({ message: "Affiliate not found" });
      }
      
      res.json({
        profile,
        affiliate: {
          name: affiliate.name,
          referralCode: affiliate.referralCode
        }
      });
    } catch (error) {
      console.error("Error fetching influencer profile:", error);
      res.status(500).json({ message: "Failed to fetch influencer profile" });
    }
  });

  // Admin routes for affiliate management
  app.get("/api/admin/affiliates", async (req, res) => {
    try {
      const affiliates = await storage.getAllAffiliates();
      const payoutRequests = await storage.getPayoutRequests();
      
      res.json({ 
        affiliates: affiliates.map(affiliate => ({
          ...affiliate,
          currentBalance: affiliate.currentBalance / 100,
          totalEarnings: affiliate.totalEarnings / 100
        })),
        payoutRequests: payoutRequests.map(req => ({
          ...req,
          amount: req.amount / 100
        }))
      });
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      res.status(500).json({ message: "Failed to fetch affiliates" });
    }
  });

  // Upgrade affiliate to influencer
  app.post("/api/admin/upgrade-influencer", async (req, res) => {
    try {
      const { affiliateId, profileData } = req.body;
      
      // Update affiliate to influencer status
      await storage.updateAffiliate(affiliateId, {
        isInfluencer: true,
        commissionRate: 40, // Influencer tier gets 40%
        tier: "influencer"
      });
      
      // Create influencer profile
      const profile = await storage.createInfluencerProfile({
        affiliateId,
        ...profileData
      });
      
      res.json({ success: true, profile });
    } catch (error) {
      console.error("Error upgrading to influencer:", error);
      res.status(500).json({ message: "Failed to upgrade to influencer" });
    }
  });

  // User Personal Dashboard API Endpoints
  
  // Get user's personal calculation history
  app.get("/api/user/my-calculations", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }
      
      // Get user's submission history from database
      const submissions = await storage.getAllSubmissions();
      const userSubmissions = submissions.filter(sub => sub.email === email);
      
      res.json(userSubmissions);
    } catch (error) {
      console.error("Error fetching user calculations:", error);
      res.status(500).json({ error: "Failed to fetch calculations" });
    }
  });

  // Get user's AI recommendation history
  app.get("/api/user/my-recommendations", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }
      
      // Get user's AI recommendation history from database
      const recommendations = await storage.getAllAIRecommendations();
      const userRecommendations = recommendations.filter(rec => rec.email === email);
      
      res.json(userRecommendations);
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Get user's vehicle builds (My Garage)
  app.get("/api/user/my-builds", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const builds = await storage.getUserVehicleBuilds(userId as string);
      res.json(builds);
    } catch (error) {
      console.error("Error fetching user builds:", error);
      res.status(500).json({ error: "Failed to fetch vehicle builds" });
    }
  });

  // Create new vehicle build
  app.post("/api/user/my-builds", async (req, res) => {
    try {
      const { userId, name, vehicle, stage, targetMods, budget, notes } = req.body;
      
      const build = await storage.createVehicleBuild({
        userId,
        name,
        vehicle,
        stage: stage || 'Planning',
        targetMods: targetMods || [],
        budget: budget || 0,
        notes: notes || null,
        imageUrl: null
      });
      
      res.json({ success: true, build });
    } catch (error) {
      console.error("Error creating vehicle build:", error);
      res.status(500).json({ error: "Failed to create vehicle build" });
    }
  });

  // Get user's parts watchlist
  app.get("/api/user/my-watchlist", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      
      const watchlist = await storage.getUserWatchlist(userId as string);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching user watchlist:", error);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  // Add item to parts watchlist
  app.post("/api/user/my-watchlist", async (req, res) => {
    try {
      const { userId, partName, vehicle, targetPrice, source, notes } = req.body;
      
      const item = await storage.createWatchlistItem({
        userId,
        partName,
        vehicle: vehicle || null,
        targetPrice: targetPrice || null,
        currentPrice: null,
        source: source || null,
        notes: notes || null,
        isFound: false,
        priceAlert: false
      });
      
      res.json({ success: true, item });
    } catch (error) {
      console.error("Error adding watchlist item:", error);
      res.status(500).json({ error: "Failed to add watchlist item" });
    }
  });

  // Get user's dashboard stats
  app.get("/api/user/dashboard-stats", async (req, res) => {
    try {
      const { email, userId } = req.query;
      if (!email && !userId) {
        return res.status(400).json({ error: "Email or User ID required" });
      }
      
      // Get user's data counts
      const submissions = await storage.getAllSubmissions();
      const recommendations = await storage.getAllAIRecommendations();
      
      const userSubmissions = submissions.filter(sub => sub.email === email);
      const userRecommendations = recommendations.filter(rec => rec.email === email);
      
      let userBuilds = [];
      let userWatchlist = [];
      
      if (userId) {
        userBuilds = await storage.getUserVehicleBuilds(userId as string);
        userWatchlist = await storage.getUserWatchlist(userId as string);
      }
      
      res.json({
        totalCalculations: userSubmissions.length,
        totalRecommendations: userRecommendations.length,
        totalBuilds: userBuilds.length,
        watchlistItems: userWatchlist.length,
        totalProjectValue: userSubmissions.reduce((sum, sub) => sum + parseFloat(sub.totalCost || "0"), 0)
      });
    } catch (error) {
      console.error("Error fetching user dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
