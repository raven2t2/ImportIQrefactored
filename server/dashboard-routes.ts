import { db } from "./db";
import { users, userSubscriptions, savedReports, savedJourneys, vehicleLookupCache } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Request, Response } from "express";

// Dashboard data aggregation service
export class DashboardService {
  async getDashboardData(userId: number) {
    try {
      // Get recent searches from vehicle_lookup_cache (last 5)
      const recentSearches = await db
        .select({
          id: vehicleLookupCache.id,
          searchQuery: vehicleLookupCache.originalQuery,
          destination: "Unknown", // Not stored in cache table
          vehicleData: vehicleLookupCache.resolvedVehicle,
          createdAt: vehicleLookupCache.createdAt,
        })
        .from(vehicleLookupCache)
        .orderBy(desc(vehicleLookupCache.createdAt))
        .limit(5);

      // Get saved reports
      const reports = await db
        .select()
        .from(savedReports)
        .where(eq(savedReports.userId, userId))
        .orderBy(desc(savedReports.createdAt))
        .limit(10);

      // Get saved journeys
      const journeys = await db
        .select()
        .from(savedJourneys)
        .where(eq(savedJourneys.userId, userId))
        .orderBy(desc(savedJourneys.savedAt))
        .limit(10);

      // Get user subscription
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      return {
        recentSearches: recentSearches || [],
        savedReports: reports || [],
        savedJourneys: journeys || [],
        subscription: subscription[0] || null,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to load dashboard data");
    }
  }

  async saveJourney(userId: number, vehicleData: any, destinationCountry: string) {
    try {
      const [savedJourney] = await db
        .insert(savedJourneys)
        .values({
          userId,
          vehicleData,
          destinationCountry,
        })
        .returning();

      return savedJourney;
    } catch (error) {
      console.error("Error saving journey:", error);
      throw new Error("Failed to save journey");
    }
  }

  async saveReport(
    userId: number,
    title: string,
    vehicleData: any,
    searchQuery: string,
    destination: string,
    reportType: string = 'lookup'
  ) {
    try {
      const [savedReport] = await db
        .insert(savedReports)
        .values({
          userId,
          title,
          vehicleData,
          searchQuery,
          destination,
          reportType,
        })
        .returning();

      return savedReport;
    } catch (error) {
      console.error("Error saving report:", error);
      throw new Error("Failed to save report");
    }
  }

  async getUserSubscriptionStatus(userId: number) {
    try {
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      if (!subscription[0]) {
        return { plan: 'free', status: 'none', isActive: false };
      }

      const sub = subscription[0];
      const isActive = sub.status === 'active' && new Date(sub.currentPeriodEnd) > new Date();

      return {
        plan: sub.plan,
        status: sub.status,
        isActive,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      };
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      return { plan: 'free', status: 'none', isActive: false };
    }
  }
}

const dashboardService = new DashboardService();

// Dashboard routes
export function registerDashboardRoutes(app: any, authMiddleware: any) {
  // Get dashboard data
  app.get("/api/dashboard", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const dashboardData = await dashboardService.getDashboardData(userId);
      res.json(dashboardData);
    } catch (error: any) {
      console.error("Dashboard API error:", error);
      res.status(500).json({ message: error.message || "Failed to load dashboard" });
    }
  });

  // Save a journey
  app.post("/api/dashboard/save-journey", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { vehicleData, destinationCountry } = req.body;
      if (!vehicleData || !destinationCountry) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const savedJourney = await dashboardService.saveJourney(userId, vehicleData, destinationCountry);
      res.json(savedJourney);
    } catch (error: any) {
      console.error("Save journey API error:", error);
      res.status(500).json({ message: error.message || "Failed to save journey" });
    }
  });

  // Save a report
  app.post("/api/dashboard/save-report", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { title, vehicleData, searchQuery, destination, reportType } = req.body;
      if (!title || !vehicleData || !searchQuery || !destination) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const savedReport = await dashboardService.saveReport(
        userId,
        title,
        vehicleData,
        searchQuery,
        destination,
        reportType
      );
      res.json(savedReport);
    } catch (error: any) {
      console.error("Save report API error:", error);
      res.status(500).json({ message: error.message || "Failed to save report" });
    }
  });

  // Get subscription status
  app.get("/api/dashboard/subscription", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const subscriptionStatus = await dashboardService.getUserSubscriptionStatus(userId);
      res.json(subscriptionStatus);
    } catch (error: any) {
      console.error("Subscription API error:", error);
      res.status(500).json({ message: error.message || "Failed to load subscription" });
    }
  });
}

export { dashboardService };