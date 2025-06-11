import { db } from "./db";
import { users, userSubscriptions, savedReports, savedJourneys } from "@shared/schema";
import { eq } from "drizzle-orm";

// Demo user data setup
export const DEMO_USER = {
  id: 1, // Use integer ID to match schema
  email: "demo@importiq.com",
  fullName: "Demo User",
  passwordHash: "$2b$10$demohashedpassword", // Demo password hash
};

// Initialize demo user and subscription data
export async function initializeDemoUser() {
  try {
    // Check if demo user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, DEMO_USER.email))
      .limit(1);

    if (!existingUser) {
      // Create demo user
      const [newUser] = await db.insert(users).values({
        email: DEMO_USER.email,
        fullName: DEMO_USER.fullName,
        passwordHash: DEMO_USER.passwordHash,
      }).returning();
      
      // Update DEMO_USER with the actual ID
      DEMO_USER.id = newUser.id;
    } else {
      // Update DEMO_USER with existing ID
      DEMO_USER.id = existingUser.id;
    }

    // Check if demo subscription exists
    const [existingSub] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, DEMO_USER.id))
      .limit(1);

    if (!existingSub) {
      // Create demo subscription (Starter plan)
      await db.insert(userSubscriptions).values({
        userId: DEMO_USER.id,
        stripeSubscriptionId: "sub_demo_starter",
        stripeCustomerId: "cus_demo_user",
        plan: "starter",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
      });
    }

    // Create some demo saved reports
    const reportCount = await db
      .select()
      .from(savedReports)
      .where(eq(savedReports.userId, DEMO_USER.id));

    if (reportCount.length === 0) {
      await db.insert(savedReports).values([
        {
          userId: DEMO_USER.id,
          title: "Toyota Supra MK4 Analysis",
          searchQuery: "Toyota Supra 1998",
          destination: "australia",
          reportType: "lookup",
          vehicleData: {
            make: "Toyota",
            model: "Supra",
            year: 1998,
            price: "$45,000",
            eligible: true
          },
          isBookmarked: true,
        },
        {
          userId: DEMO_USER.id,
          title: "Nissan Skyline GT-R R34 Import",
          searchQuery: "Nissan Skyline GT-R R34",
          destination: "usa",
          reportType: "compliance",
          vehicleData: {
            make: "Nissan",
            model: "Skyline GT-R",
            year: 2002,
            price: "$80,000",
            eligible: true
          },
          isBookmarked: false,
        },
        {
          userId: DEMO_USER.id,
          title: "Honda NSX Type-R Cost Analysis",
          searchQuery: "Honda NSX Type-R",
          destination: "canada",
          reportType: "cost_analysis",
          vehicleData: {
            make: "Honda",
            model: "NSX Type-R",
            year: 1995,
            price: "$120,000",
            eligible: true
          },
          isBookmarked: true,
        }
      ]);
    }

    // Create some demo saved journeys
    const journeyCount = await db
      .select()
      .from(savedJourneys)
      .where(eq(savedJourneys.userId, DEMO_USER.id));

    if (journeyCount.length === 0) {
      await db.insert(savedJourneys).values([
        {
          userId: DEMO_USER.id,
          vehicleData: {
            make: "Mitsubishi",
            model: "Evolution IX",
            year: 2006,
            price: "$35,000"
          },
          destinationCountry: "australia",
          journeyState: {
            step: "documentation",
            progress: 75,
            nextAction: "Submit compliance paperwork"
          }
        },
        {
          userId: DEMO_USER.id,
          vehicleData: {
            make: "Subaru",
            model: "Impreza WRX STI",
            year: 2004,
            price: "$28,000"
          },
          destinationCountry: "uk",
          journeyState: {
            step: "shipping",
            progress: 50,
            nextAction: "Confirm shipping arrangements"
          }
        }
      ]);
    }

    console.log("Demo user and data initialized successfully");
    return DEMO_USER;
  } catch (error) {
    console.error("Error initializing demo user:", error);
    throw error;
  }
}

// Middleware to simulate authentication for demo purposes
export function demoAuthMiddleware(req: any, res: any, next: any) {
  // Set demo user as authenticated
  req.user = DEMO_USER;
  req.isAuthenticated = () => true;
  next();
}

// Demo auth endpoints
export function setupDemoAuth(app: any) {
  // Demo login endpoint
  app.post("/api/auth/demo-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (email === "demo@importiq.com" && password === "demo123") {
        await initializeDemoUser();
        res.json({
          success: true,
          user: DEMO_USER,
          message: "Demo login successful"
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid demo credentials"
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Demo login failed"
      });
    }
  });

  // Demo user endpoint (always returns demo user)
  app.get("/api/auth/user", (req, res) => {
    res.json(DEMO_USER);
  });
}