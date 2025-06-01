import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, type CalculationResult } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import Stripe from "stripe";

// Additional schemas for new tools
const valueEstimatorSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1990).max(new Date().getFullYear()),
  country: z.enum(["japan", "usa"]),
  condition: z.enum(["excellent", "good", "fair"]).optional(),
});

const complianceSchema = z.object({
  year: z.number().min(1970).max(new Date().getFullYear()),
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

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
      const { name, email } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      const exists = await storage.checkEmailExists(email);
      await storage.updateEmailCache(email, name);
      
      // Start trial for ImportIQ automatically
      await storage.createTrial(email, name);
      
      res.json({ 
        exists,
        message: exists ? "Welcome back!" : "Welcome to ImportIQ!"
      });
    } catch (error) {
      console.error("Error checking email:", error);
      res.status(500).json({ error: "Failed to process email" });
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
      const aiRecommendations = await storage.getAllAIRecommendations();
      
      const totalRevenuePotential = submissions.reduce((sum, sub) => {
        const cost = parseFloat(sub.totalCost) || 0;
        return sum + cost;
      }, 0);

      const stats = {
        totalSubmissions: submissions.length,
        totalAIRecommendations: aiRecommendations.length,
        totalRevenuePotential,
        conversionRate: submissions.length > 0 ? (submissions.length / (submissions.length + aiRecommendations.length)) * 100 : 0
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
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

  const httpServer = createServer(app);
  return httpServer;
}
