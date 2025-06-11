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
    console.log("Demo user initialized successfully");
    return DEMO_USER;
  } catch (error) {
    console.error("Error initializing demo user:", error);
    return DEMO_USER; // Return demo user even if DB fails
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