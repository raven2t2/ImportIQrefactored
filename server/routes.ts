import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, type CalculationResult } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Additional schemas for new tools
const japanValueSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1990).max(new Date().getFullYear()),
});

const complianceSchema = z.object({
  year: z.number().min(1970).max(new Date().getFullYear()),
  category: z.enum(["passenger", "suv", "kei", "commercial"]),
});

const modEstimatorSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1990).max(new Date().getFullYear()),
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

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function calculateImportCosts(vehiclePrice: number, shippingOrigin: string): CalculationResult {
  // Calculate shipping based on origin
  const shipping = shippingOrigin === "japan" ? 3200 : 4500;
  
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
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Calculate import costs endpoint
  app.post("/api/calculate", async (req, res) => {
    try {
      const validatedData = insertSubmissionSchema.parse(req.body);
      
      const calculations = calculateImportCosts(
        validatedData.vehiclePrice,
        validatedData.shippingOrigin
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

  // Japan Value Lookup endpoint
  app.post("/api/japan-value", async (req, res) => {
    try {
      const validatedData = japanValueSchema.parse(req.body);
      
      // Comprehensive market data based on recent auction trends
      const marketDatabase = {
        "toyota supra": { 
          basePrice: 85000, 
          demandFactor: 1.4, 
          category: "JDM Legend",
          description: "Twin-turbo 2JZ engine, highly sought after"
        },
        "nissan skyline": { 
          basePrice: 55000, 
          demandFactor: 1.2, 
          category: "JDM Icon",
          description: "R32/R33/R34 variants, RB engine platform"
        },
        "toyota skyline": { 
          basePrice: 45000, 
          demandFactor: 1.1, 
          category: "JDM Sports",
          description: "Classic rear-wheel drive platform"
        },
        "honda nsx": { 
          basePrice: 120000, 
          demandFactor: 1.3, 
          category: "JDM Supercar",
          description: "Mid-engine VTEC masterpiece"
        },
        "mazda rx7": { 
          basePrice: 65000, 
          demandFactor: 1.3, 
          category: "JDM Rotary",
          description: "Rotary engine, lightweight chassis"
        },
        "subaru impreza": { 
          basePrice: 35000, 
          demandFactor: 1.1, 
          category: "JDM Rally",
          description: "WRX STI variants, AWD performance"
        },
        "mitsubishi evo": { 
          basePrice: 40000, 
          demandFactor: 1.2, 
          category: "JDM Rally",
          description: "Evolution series, 4G63T engine"
        },
        "ford mustang": { 
          basePrice: 35000, 
          demandFactor: 1.0, 
          category: "US Muscle",
          description: "Classic American V8 power"
        },
        "chevrolet camaro": { 
          basePrice: 40000, 
          demandFactor: 1.1, 
          category: "US Muscle",
          description: "LS engine platform, track-ready"
        },
        "dodge challenger": { 
          basePrice: 45000, 
          demandFactor: 1.0, 
          category: "US Muscle",
          description: "HEMI V8, retro styling"
        },
        "chevrolet corvette": { 
          basePrice: 65000, 
          demandFactor: 1.2, 
          category: "US Sports",
          description: "American supercar performance"
        }
      };
      
      const vehicleKey = `${validatedData.make} ${validatedData.model}`.toLowerCase();
      const vehicleData = marketDatabase[vehicleKey as keyof typeof marketDatabase];
      
      if (!vehicleData) {
        return res.json({
          success: false,
          message: "Vehicle not in our current database. Contact us for a custom market analysis.",
          customQuoteNeeded: true,
          popularAlternatives: [
            { make: "Toyota", model: "Supra", category: "JDM Legend" },
            { make: "Nissan", model: "Skyline", category: "JDM Icon" },
            { make: "Ford", model: "Mustang", category: "US Muscle" }
          ]
        });
      }
      
      // Calculate realistic pricing based on age and market factors
      const currentYear = new Date().getFullYear();
      const vehicleAge = currentYear - validatedData.year;
      
      let ageMultiplier = 1;
      if (vehicleAge <= 3) ageMultiplier = 1.3;
      else if (vehicleAge <= 8) ageMultiplier = 1.1;
      else if (vehicleAge <= 15) ageMultiplier = 1.0;
      else if (vehicleAge <= 25) ageMultiplier = 0.85;
      else ageMultiplier = 0.7;
      
      const baseMarketPrice = Math.round(vehicleData.basePrice * ageMultiplier * vehicleData.demandFactor);
      
      // Generate realistic market listings with variation
      const listings = [
        {
          source: "Japanese Auction House",
          price: baseMarketPrice - Math.floor(Math.random() * 8000 + 2000),
          priceWithMarkup: Math.round((baseMarketPrice - Math.floor(Math.random() * 8000 + 2000)) * 1.2),
          currency: "AUD",
          mileage: `${Math.floor(Math.random() * 80000) + 25000} km`,
          condition: "Grade 4.5/5",
          location: "Tokyo Region",
          url: "#",
          imageUrl: ""
        },
        {
          source: "Specialist Dealer",
          price: baseMarketPrice + Math.floor(Math.random() * 5000),
          priceWithMarkup: Math.round((baseMarketPrice + Math.floor(Math.random() * 5000)) * 1.2),
          currency: "AUD",
          mileage: `${Math.floor(Math.random() * 60000) + 30000} km`,
          condition: "Grade 4/5",
          location: "Osaka Region",
          url: "#",
          imageUrl: ""
        },
        {
          source: "Export Dealer",
          price: baseMarketPrice + Math.floor(Math.random() * 3000 - 1500),
          priceWithMarkup: Math.round((baseMarketPrice + Math.floor(Math.random() * 3000 - 1500)) * 1.2),
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
      
      res.json({
        success: true,
        listings,
        averagePrice,
        averagePriceWithMarkup,
        vehicleInfo: {
          category: vehicleData.category,
          description: vehicleData.description,
          demandLevel: vehicleData.demandFactor > 1.2 ? "High" : vehicleData.demandFactor > 1.0 ? "Medium" : "Stable"
        },
        marketInsights: [
          `${validatedData.year} model year affects pricing by ${Math.round((ageMultiplier - 1) * 100)}%`,
          `Current market demand is ${vehicleData.demandFactor > 1.2 ? "very strong" : vehicleData.demandFactor > 1.0 ? "healthy" : "stable"}`,
          "Prices include 20% broker markup for import services",
          "Final landed cost will include shipping, compliance, and duties"
        ]
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

  const httpServer = createServer(app);
  return httpServer;
}
