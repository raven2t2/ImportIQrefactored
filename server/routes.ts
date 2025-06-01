import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, type CalculationResult } from "@shared/schema";
import { z } from "zod";

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
  
  // Calculate service fee (10% of total before service fee)
  const preServiceTotal = vehiclePrice + shipping + customsDuty + gst + lct + inspection;
  const serviceFee = preServiceTotal * 0.10;
  
  // Calculate total cost
  const totalCost = preServiceTotal + serviceFee;
  
  // Determine service tier
  let serviceTier: string;
  let serviceTierDescription: string;
  
  if (totalCost < 65000) {
    serviceTier = "Essentials";
    serviceTierDescription = "Standard import service with basic documentation, customs clearance, and delivery coordination.";
  } else if (totalCost <= 100000) {
    serviceTier = "Concierge";
    serviceTierDescription = "Enhanced service with priority processing, vehicle inspection reports, and dedicated support throughout the import process.";
  } else {
    serviceTier = "Elite";
    serviceTierDescription = "Premium white-glove service including dedicated account manager, priority processing, comprehensive vehicle preparation, and premium delivery options.";
  }
  
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

  const httpServer = createServer(app);
  return httpServer;
}
