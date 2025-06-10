import type { Express } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "./db";
import { users, userAuthSessions } from "@shared/schema";
import { eq } from "drizzle-orm";

export function setupUserRoutes(app: Express) {
  // User registration
  app.post("/api/user/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ error: "Email, password, and full name are required" });
      }

      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          passwordHash,
          fullName,
          isActive: true,
        })
        .returning();

      // Create session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(userAuthSessions).values({
        userId: newUser.id,
        sessionToken,
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Remove password hash from response
      const { passwordHash: _, ...safeUser } = newUser;

      res.json({
        success: true,
        user: safeUser,
        sessionToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // User login
  app.post("/api/user/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user.id));

      // Create session
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(userAuthSessions).values({
        userId: user.id,
        sessionToken,
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Remove password hash from response
      const { passwordHash: _, ...safeUser } = user;

      res.json({
        success: true,
        user: safeUser,
        sessionToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Check authentication status
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.get('Authorization');
      const sessionToken = authHeader?.replace('Bearer ', '') || req.query.session as string;

      if (!sessionToken) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get session
      const [session] = await db
        .select()
        .from(userAuthSessions)
        .where(eq(userAuthSessions.sessionToken, sessionToken))
        .limit(1);

      if (!session || new Date() > new Date(session.expiresAt)) {
        if (session) {
          await db
            .delete(userAuthSessions)
            .where(eq(userAuthSessions.sessionToken, sessionToken));
        }
        return res.status(401).json({ message: "Session expired" });
      }

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user || !user.isActive) {
        await db
          .delete(userAuthSessions)
          .where(eq(userAuthSessions.sessionToken, sessionToken));
        return res.status(401).json({ message: "User not found" });
      }

      // Remove password hash from response
      const { passwordHash: _, ...safeUser } = user;

      res.json({
        success: true,
        user: safeUser,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Authentication check failed" });
    }
  });

  // User logout
  app.post("/api/user/logout", async (req, res) => {
    try {
      const authHeader = req.get('Authorization');
      const sessionToken = authHeader?.replace('Bearer ', '') || req.body.sessionToken;

      if (sessionToken) {
        await db
          .delete(userAuthSessions)
          .where(eq(userAuthSessions.sessionToken, sessionToken));
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Get user dashboard data
  app.get("/api/user/dashboard", async (req, res) => {
    try {
      const authHeader = req.get('Authorization');
      const sessionToken = authHeader?.replace('Bearer ', '') || req.query.session as string;

      if (!sessionToken) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Validate session (similar to auth check above)
      const [session] = await db
        .select()
        .from(userAuthSessions)
        .where(eq(userAuthSessions.sessionToken, sessionToken))
        .limit(1);

      if (!session || new Date() > new Date(session.expiresAt)) {
        return res.status(401).json({ message: "Session expired" });
      }

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Get user's saved vehicles, cost estimates, etc.
      // For now, return mock data structure that the dashboard expects
      const dashboardData = {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        savedVehicles: [],
        costEstimates: [],
        userJourneys: [],
        dashboardStats: {
          totalEstimates: 0,
          totalSavings: "$0",
          recentActivity: 0,
          favoriteMarket: "Japan",
        }
      };

      res.json({
        success: true,
        data: dashboardData,
        source: "user_dashboard_api"
      });
    } catch (error) {
      console.error("Dashboard data error:", error);
      res.status(500).json({ error: "Failed to load dashboard data" });
    }
  });
}