import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Admin users table for secure admin access
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("viewer"), // super_admin, manager, sales, marketing, finance, viewer
  department: text("department"), // sales, marketing, finance, operations, executive
  firstName: text("first_name"),
  lastName: text("last_name"),
  jobTitle: text("job_title"),
  phoneNumber: text("phone_number"),
  isActive: boolean("is_active").default(true),
  canViewFinancials: boolean("can_view_financials").default(false),
  canManageUsers: boolean("can_manage_users").default(false),
  canExportData: boolean("can_export_data").default(false),
  canManageAffiliates: boolean("can_manage_affiliates").default(false),
  lastLogin: timestamp("last_login"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin sessions for secure session management
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  email: text("email"),
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
  passwordHash: text("password_hash"),
  trialStartDate: timestamp("trial_start_date").defaultNow().notNull(),
  trialEndDate: timestamp("trial_end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  subscriptionStatus: text("subscription_status").default("trial").notNull(), // trial, active, expired, cancelled
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  locationTimestamp: timestamp("location_timestamp"),
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

// Affiliate System Tables
export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  socialLink: varchar("social_link", { length: 500 }),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
  tier: varchar("tier", { length: 50 }).default("starter"), // starter, influencer, enterprise
  commissionRate: integer("commission_rate").default(20), // percentage
  status: varchar("status", { length: 50 }).default("active"), // active, suspended, pending
  totalClicks: integer("total_clicks").default(0),
  totalSignups: integer("total_signups").default(0),
  totalEarnings: integer("total_earnings").default(0), // in cents
  currentBalance: integer("current_balance").default(0), // in cents
  isInfluencer: boolean("is_influencer").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const influencerProfiles = pgTable("influencer_profiles", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").references(() => affiliates.id).notNull(),
  handle: varchar("handle", { length: 100 }).notNull().unique(),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  headerHeadline: varchar("header_headline", { length: 200 }),
  subheader: text("subheader"),
  brandColor: varchar("brand_color", { length: 7 }).default("#FFD700"),
  testimonial: text("testimonial"),
  videoEmbedUrl: varchar("video_embed_url", { length: 500 }),
  customCta: varchar("custom_cta", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const referralClicks = pgTable("referral_clicks", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").references(() => affiliates.id).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  referer: varchar("referer", { length: 500 }),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

export const referralSignups = pgTable("referral_signups", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").references(() => affiliates.id).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  signupSource: varchar("signup_source", { length: 100 }), // trial, subscription, etc
  conversionValue: integer("conversion_value").default(0), // in cents
  commissionEarned: integer("commission_earned").default(0), // in cents
  attributionDate: timestamp("attribution_date").defaultNow(),
  conversionDate: timestamp("conversion_date"),
});

export const payoutRequests = pgTable("payout_requests", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").references(() => affiliates.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // paypal, stripe
  paymentDetails: jsonb("payment_details"), // email, account info
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, paid, rejected
  notes: text("notes"),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// My Build Garage - Vehicle builds
export const vehicleBuilds = pgTable("vehicle_builds", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  nickname: varchar("nickname").notNull(),
  chassisCode: varchar("chassis_code"),
  vin: varchar("vin"),
  make: varchar("make"),
  model: varchar("model"),
  year: integer("year"),
  photos: text("photos").array(), // Array of photo URLs
  modList: text("mod_list").array(), // Array of modifications
  plannedUpgrades: text("planned_upgrades").array(), // Array of planned mods
  upgradeEta: text("upgrade_eta").array(), // ETAs for planned upgrades
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mod Shop Partners
export const modShopPartners = pgTable("mod_shop_partners", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  website: varchar("website"),
  discountCode: varchar("discount_code"),
  discountPercent: integer("discount_percent"),
  location: varchar("location"),
  specialty: varchar("specialty"), // JDM, European, American, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Member-exclusive mod shop deals (for JV partnerships)
export const modShopDeals = pgTable("mod_shop_deals", {
  id: serial("id").primaryKey(),
  shopName: varchar("shop_name").notNull(),
  discount: integer("discount").notNull(), // percentage
  description: text("description").notNull(),
  code: varchar("code").notNull().unique(),
  validUntil: timestamp("valid_until").notNull(),
  category: varchar("category"), // Performance, JDM Parts, Wheels, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parts Watchlist
export const partsWatchlist = pgTable("parts_watchlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  partName: varchar("part_name").notNull(),
  targetPrice: integer("target_price"), // in cents
  currentPrice: integer("current_price"), // in cents
  source: varchar("source"), // eBay, Yahoo JP, Facebook, etc.
  sourceUrl: varchar("source_url"),
  isFound: boolean("is_found").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shop Suggestions (for CMS)
export const shopSuggestions = pgTable("shop_suggestions", {
  id: serial("id").primaryKey(),
  shopName: varchar("shop_name").notNull(),
  website: varchar("website"),
  location: varchar("location"),
  specialty: varchar("specialty"),
  suggestedBy: varchar("suggested_by"), // email or user ID
  status: varchar("status").default("pending"), // pending, contacted, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
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

// Affiliate System Types
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;
export type InfluencerProfile = typeof influencerProfiles.$inferSelect;
export type InsertInfluencerProfile = typeof influencerProfiles.$inferInsert;
export type ReferralClick = typeof referralClicks.$inferSelect;
export type InsertReferralClick = typeof referralClicks.$inferInsert;
export type ReferralSignup = typeof referralSignups.$inferSelect;
export type InsertReferralSignup = typeof referralSignups.$inferInsert;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = typeof payoutRequests.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;

export type VehicleBuild = typeof vehicleBuilds.$inferSelect;
export type InsertVehicleBuild = typeof vehicleBuilds.$inferInsert;

export type ModShopPartner = typeof modShopPartners.$inferSelect;
export type InsertModShopPartner = typeof modShopPartners.$inferInsert;

export type ModShopDeal = typeof modShopDeals.$inferSelect;
export type InsertModShopDeal = typeof modShopDeals.$inferInsert;

export type PartsWatchlistItem = typeof partsWatchlist.$inferSelect;
export type InsertPartsWatchlistItem = typeof partsWatchlist.$inferInsert;

export type ShopSuggestion = typeof shopSuggestions.$inferSelect;
export type InsertShopSuggestion = typeof shopSuggestions.$inferInsert;

// Affiliate schema for forms
export const insertAffiliateSchema = createInsertSchema(affiliates).pick({
  name: true,
  email: true,
  socialLink: true,
});

export const insertInfluencerProfileSchema = createInsertSchema(influencerProfiles).pick({
  handle: true,
  avatarUrl: true,
  headerHeadline: true,
  subheader: true,
  brandColor: true,
  testimonial: true,
  videoEmbedUrl: true,
  customCta: true,
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).pick({
  amount: true,
  paymentMethod: true,
  paymentDetails: true,
});

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
