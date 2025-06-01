import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  vehiclePrice: decimal("vehicle_price", { precision: 10, scale: 2 }).notNull(),
  shippingOrigin: text("shipping_origin").notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  customsDuty: decimal("customs_duty", { precision: 10, scale: 2 }).notNull(),
  gst: decimal("gst", { precision: 10, scale: 2 }).notNull(),
  lct: decimal("lct", { precision: 10, scale: 2 }).notNull(),
  inspection: decimal("inspection", { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  serviceTier: text("service_tier").notNull(),
  zipCode: text("zip_code"),
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  vehicleYear: integer("vehicle_year"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  budget: integer("budget").notNull(),
  intendedUse: text("intended_use").notNull(),
  experience: text("experience").notNull(),
  preferences: text("preferences").notNull(),
  timeline: text("timeline").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailCache = pgTable("email_cache", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  submissionCount: integer("submission_count").default(1).notNull(),
  lastSubmission: timestamp("last_submission").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trials = pgTable("trials", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  trialStartDate: timestamp("trial_start_date").defaultNow().notNull(),
  trialEndDate: timestamp("trial_end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  subscriptionStatus: text("subscription_status").default("trial").notNull(), // trial, active, expired, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User projects and saved calculations
export const userProjects = pgTable("user_projects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectName: text("project_name").notNull(),
  vehicleDetails: text("vehicle_details").notNull(),
  calculationResults: text("calculation_results"),
  projectType: text("project_type").notNull(), // "import", "mod", "compliance", etc.
  status: text("status").default("planning"), // planning, in-progress, completed
  bookmarked: boolean("bookmarked").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User achievements and badges
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  badgeId: text("badge_id").notNull(),
  badgeName: text("badge_name").notNull(),
  badgeDescription: text("badge_description"),
  earnedAt: timestamp("earned_at").defaultNow(),
  unlockedFeature: text("unlocked_feature"),
});

// Car events near users
export const carEvents = pgTable("car_events", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  eventType: text("event_type").notNull(), // "show", "meet", "track", "auction"
  description: text("description"),
  location: text("location").notNull(),
  postcode: text("postcode").notNull(),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  websiteUrl: text("website_url"),
  entryFee: text("entry_fee"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  email: varchar("email").notNull(),
  reportType: varchar("report_type").notNull(),
  reportTitle: varchar("report_title").notNull(),
  reportData: jsonb("report_data").notNull(),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  service: varchar("service").notNull(),
  preferredDate: varchar("preferred_date").notNull(),
  preferredTime: varchar("preferred_time").notNull(),
  vehicleDetails: text("vehicle_details"),
  message: text("message"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  fullName: true,
  email: true,
  vehiclePrice: true,
  shippingOrigin: true,
}).extend({
  vehiclePrice: z.coerce.number().min(1000, "Vehicle price must be at least $1,000"),
  shippingOrigin: z.enum(["japan", "usa"], {
    required_error: "Please select a shipping origin",
  }),
  zipCode: z.string().min(4, "Please enter your zip/postal code"),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleYear: z.coerce.number().min(1950).max(new Date().getFullYear() + 1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export interface CalculationResult {
  vehiclePrice: number;
  shipping: number;
  customsDuty: number;
  gst: number;
  lct: number;
  inspection: number;
  serviceFee: number;
  totalCost: number;
  serviceTier: string;
  serviceTierDescription: string;
  freightBreakdown?: {
    baseShipping: number;
    regionalAdjustment: number;
    region: string;
  };
}
