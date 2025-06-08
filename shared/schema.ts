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

// Deposits tracking for mod packages and services
export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  depositType: text("deposit_type").notNull(), // "mod-package", "import-service", "consultation"
  serviceDetails: text("service_details"),
  vehicleDetails: text("vehicle_details"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  status: text("status").default("pending"), // pending, paid, refunded, applied
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  appliedToInvoice: text("applied_to_invoice"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Chat interaction tracking for personalized icons
export const chatInteractions = pgTable("chat_interactions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").notNull(), // Anonymous session tracking
  userIdentifier: varchar("user_identifier"), // Could be email or user ID if authenticated
  interactionType: varchar("interaction_type").notNull(), // "message_sent", "tool_used", "session_started"
  toolContext: varchar("tool_context"), // Which ImportIQ tool they were using
  messageCount: integer("message_count").default(0),
  sessionDuration: integer("session_duration"), // in seconds
  helpfulnessRating: integer("helpfulness_rating"), // 1-5 if user provides feedback
  topicCategory: varchar("topic_category"), // "import_costs", "compliance", "vehicle_lookup", etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat personalization profiles
export const chatProfiles = pgTable("chat_profiles", {
  id: serial("id").primaryKey(),
  userIdentifier: varchar("user_identifier").notNull().unique(),
  totalInteractions: integer("total_interactions").default(0),
  preferredTopics: jsonb("preferred_topics"), // Array of most discussed topics
  avgSessionDuration: integer("avg_session_duration"),
  lastInteractionDate: timestamp("last_interaction_date"),
  userExpertiseLevel: varchar("user_expertise_level").default("beginner"), // beginner, intermediate, expert
  favoriteTools: jsonb("favorite_tools"), // Most used ImportIQ tools
  iconPersonality: varchar("icon_personality").default("friendly"), // friendly, professional, expert, enthusiastic
  customIconEnabled: boolean("custom_icon_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Smart Parser Result History - Persistent lookup records
export const smartParserHistory = pgTable("smart_parser_history", {
  id: serial("id").primaryKey(),
  queryText: text("query_text").notNull(),
  lookupType: varchar("lookup_type").notNull(), // vin, chassis, intelligent
  resultData: jsonb("result_data"),
  confidenceScore: integer("confidence_score"),
  importRiskIndex: integer("import_risk_index"),
  userIntent: varchar("user_intent"),
  sourceAttribution: text("source_attribution"),
  nextSteps: text("next_steps"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Query Review - Low confidence flagging system
export const adminQueryReviews = pgTable("admin_query_reviews", {
  id: serial("id").primaryKey(),
  originalQuery: text("original_query").notNull(),
  lookupType: varchar("lookup_type").notNull(),
  confidenceScore: integer("confidence_score"),
  resultQuality: varchar("result_quality"), // excellent, good, poor, failed
  adminNotes: text("admin_notes"),
  enhancementSuggestions: text("enhancement_suggestions"),
  flaggedForReview: boolean("flagged_for_review").default(false),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pattern Staging - Admin pattern management
export const patternStaging = pgTable("pattern_staging", {
  id: serial("id").primaryKey(),
  suggestedPattern: text("suggested_pattern").notNull(),
  canonicalMake: varchar("canonical_make"),
  canonicalModel: varchar("canonical_model"),
  chassisCode: varchar("chassis_code"),
  confidenceEstimate: integer("confidence_estimate"),
  sourceContext: text("source_context"),
  adminStatus: varchar("admin_status").default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
});

// Lookup Analytics - System performance tracking
export const lookupAnalytics = pgTable("lookup_analytics", {
  id: serial("id").primaryKey(),
  queryText: text("query_text").notNull(),
  lookupMethod: varchar("lookup_method").notNull(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }),
  averageConfidence: decimal("average_confidence", { precision: 5, scale: 2 }),
  commonFailureReasons: text("common_failure_reasons").array(),
  suggestedImprovements: text("suggested_improvements").array(),
  dateAnalyzed: timestamp("date_analyzed").defaultNow(),
});

// Vehicle Journey Sessions - Full persistence for intelligent lookup journeys
export const vehicleJourneySessions = pgTable("vehicle_journey_sessions", {
  id: serial("id").primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  originalQuery: text("original_query").notNull(),
  parsedData: jsonb("parsed_data").notNull(), // Complete parsed vehicle data
  confidenceScore: integer("confidence_score"),
  currentDestination: varchar("current_destination"), // australia, usa, uk, canada
  currentStep: varchar("current_step").default("lookup"), // lookup, destination, journey, complete
  journeyState: jsonb("journey_state"), // All computed costs, timelines, eligibility
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  isActive: boolean("is_active").default(true),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  sessionTokenIdx: index("vehicle_journey_sessions_token_idx").on(table.sessionToken),
  activeSessionIdx: index("vehicle_journey_sessions_active_idx").on(table.isActive, table.lastAccessed),
}));

// Vehicle Lookup Cache - Persistent vehicle data resolution
export const vehicleLookupCache = pgTable("vehicle_lookup_cache", {
  id: serial("id").primaryKey(),
  queryHash: varchar("query_hash", { length: 64 }).notNull().unique(), // SHA-256 of normalized query
  originalQuery: text("original_query").notNull(),
  resolvedVehicle: jsonb("resolved_vehicle").notNull(), // Canonical vehicle data
  lookupType: varchar("lookup_type").notNull(), // intelligent, vin, chassis, url
  confidenceScore: integer("confidence_score").notNull(),
  sourceAttribution: text("source_attribution"),
  validUntil: timestamp("valid_until"), // Cache expiry
  accessCount: integer("access_count").default(1),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  queryHashIdx: index("vehicle_lookup_cache_hash_idx").on(table.queryHash),
  validUntilIdx: index("vehicle_lookup_cache_valid_idx").on(table.validUntil),
}));

// Import Intelligence Cache - Destination-specific calculations
export const importIntelligenceCache = pgTable("import_intelligence_cache", {
  id: serial("id").primaryKey(),
  vehicleHash: varchar("vehicle_hash", { length: 64 }).notNull(), // Hash of vehicle data
  destination: varchar("destination", { length: 50 }).notNull(),
  eligibilityData: jsonb("eligibility_data").notNull(),
  costData: jsonb("cost_data").notNull(),
  timelineData: jsonb("timeline_data").notNull(),
  nextStepsData: jsonb("next_steps_data").notNull(),
  alternativesData: jsonb("alternatives_data"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  validUntil: timestamp("valid_until"), // Cache expiry
}, (table) => ({
  vehicleDestinationIdx: index("import_intelligence_vehicle_dest_idx").on(table.vehicleHash, table.destination),
  validUntilIdx: index("import_intelligence_valid_idx").on(table.validUntil),
}));

// Anonymous User Sessions - Track sessions for continuity
export const anonymousSessions = pgTable("anonymous_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userFingerprint: varchar("user_fingerprint", { length: 255 }), // Browser fingerprint
  currentJourneySessionId: integer("current_journey_session_id").references(() => vehicleJourneySessions.id),
  recentQueries: jsonb("recent_queries"), // Array of recent queries
  preferences: jsonb("preferences"), // User preferences and settings
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
  pageViews: integer("page_views").default(1),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  sessionIdIdx: index("anonymous_sessions_id_idx").on(table.sessionId),
  fingerprintIdx: index("anonymous_sessions_fingerprint_idx").on(table.userFingerprint),
  activeSessionIdx: index("anonymous_sessions_active_idx").on(table.isActive, table.lastSeen),
}));

// User Watchlist - Time-based import tracking
export const userWatchlist = pgTable("user_watchlist", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email"),
  vehicleMake: varchar("vehicle_make").notNull(),
  vehicleModel: varchar("vehicle_model").notNull(),
  vehicleYear: integer("vehicle_year"),
  chassisCode: varchar("chassis_code"),
  eligibilityDate: timestamp("eligibility_date"),
  userIntent: varchar("user_intent"), // daily, drift, collector, investment
  notificationPrefs: jsonb("notification_prefs"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicle Model Patterns - Pattern recognition database
export const vehicleModelPatterns = pgTable("vehicle_model_patterns", {
  id: serial("id").primaryKey(),
  searchPattern: text("search_pattern").notNull(),
  canonicalMake: varchar("canonical_make").notNull(),
  canonicalModel: varchar("canonical_model").notNull(),
  chassisCode: varchar("chassis_code"),
  yearRangeStart: integer("year_range_start"),
  yearRangeEnd: integer("year_range_end"),
  enginePattern: varchar("engine_pattern"),
  bodyType: varchar("body_type"),
  confidenceScore: integer("confidence_score").default(85),
  sourceAttribution: text("source_attribution"),
  specialNotes: text("special_notes"),
  createdAt: timestamp("created_at").defaultNow(),
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

// Auction Data Ingestion System
export const auctionListings = pgTable("auction_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  mileage: varchar("mileage"),
  location: varchar("location").notNull(),
  imageUrl: text("image_url"),
  listingUrl: text("listing_url").notNull(),
  sourceSite: varchar("source_site").notNull(), // yahoo_auctions, copart, iaai, etc
  
  // Vehicle details
  make: varchar("make"),
  model: varchar("model"), 
  year: integer("year"),
  condition: varchar("condition"),
  bodyType: varchar("body_type"),
  transmission: varchar("transmission"),
  fuelType: varchar("fuel_type"),
  engineSize: varchar("engine_size"),
  
  // Auction specific data
  auctionId: varchar("auction_id"), // External auction ID
  lotNumber: varchar("lot_number"),
  auctionDate: timestamp("auction_date"),
  auctionGrade: varchar("auction_grade"),
  saleStatus: varchar("sale_status"), // sold, unsold, current
  
  // Metadata
  isActive: boolean("is_active").default(true),
  dataSource: varchar("data_source").notNull(), // webhook, api, manual
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sourceSiteIdx: index("source_site_idx").on(table.sourceSite),
  makeModelIdx: index("make_model_idx").on(table.make, table.model),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  auctionIdIdx: index("auction_id_idx").on(table.auctionId),
}));

// Data ingestion logs
export const dataIngestionLogs = pgTable("data_ingestion_logs", {
  id: serial("id").primaryKey(),
  sourceName: varchar("source_name").notNull(),
  recordsReceived: integer("records_received").default(0),
  recordsProcessed: integer("records_processed").default(0),
  recordsSkipped: integer("records_skipped").default(0),
  errors: jsonb("errors"), // Array of error messages
  requestPayload: jsonb("request_payload"), // Original data received
  status: varchar("status").notNull(), // success, partial, failed
  processingTimeMs: integer("processing_time_ms"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  vehiclePrice: true,
  shippingOrigin: true,
}).extend({
  vehiclePrice: z.coerce.number().min(500, "Vehicle price must be at least $500"),
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

// Chat System Types
export type ChatInteraction = typeof chatInteractions.$inferSelect;
export type InsertChatInteraction = typeof chatInteractions.$inferInsert;
export type ChatProfile = typeof chatProfiles.$inferSelect;
export type InsertChatProfile = typeof chatProfiles.$inferInsert;
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

// Auction Data Ingestion Types
export type AuctionListing = typeof auctionListings.$inferSelect;
export type InsertAuctionListing = typeof auctionListings.$inferInsert;
export type DataIngestionLog = typeof dataIngestionLogs.$inferSelect;
export type InsertDataIngestionLog = typeof dataIngestionLogs.$inferInsert;

// Auction Data Webhook Schema
export const insertAuctionListingSchema = createInsertSchema(auctionListings, {
  title: z.string().min(1, "Title is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  location: z.string().min(1, "Location is required"),
  listingUrl: z.string().url("Must be a valid URL"),
  sourceSite: z.string().min(1, "Source site is required"),
  dataSource: z.string().min(1, "Data source is required"),
}).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertAuctionListingRequest = z.infer<typeof insertAuctionListingSchema>;

export type ShopSuggestion = typeof shopSuggestions.$inferSelect;
export type InsertShopSuggestion = typeof shopSuggestions.$inferInsert;

// Core PostgreSQL schemas for complete data persistence
export const vehicleSpecs = pgTable("vehicle_specs", {
  id: serial("id").primaryKey(),
  vin: varchar("vin", { length: 17 }).unique(),
  chassisCode: varchar("chassis_code", { length: 50 }),
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  engine: varchar("engine"),
  countryOfOrigin: varchar("country_of_origin").notNull(),
  bodyType: varchar("body_type"),
  confidenceScore: integer("confidence_score").notNull(),
  sourceAttribution: text("source_attribution").notNull(),
  sourceUrl: text("source_url"),
  lastVerified: timestamp("last_verified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceRules = pgTable("compliance_rules", {
  id: serial("id").primaryKey(),
  country: varchar("country").notNull(),
  region: varchar("region"), // state/province
  rule: text("rule").notNull(),
  notes: text("notes"),
  minimumAge: integer("minimum_age"),
  maximumAge: integer("maximum_age"),
  leftHandDriveAllowed: boolean("left_hand_drive_allowed").default(true),
  requirements: text("requirements").array(),
  estimatedCosts: jsonb("estimated_costs"),
  specialNotes: text("special_notes").array(),
  confidenceScore: integer("confidence_score").notNull(),
  sourceAttribution: text("source_attribution").notNull(),
  sourceUrl: text("source_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shippingRoutes = pgTable("shipping_routes", {
  id: serial("id").primaryKey(),
  originCountry: varchar("origin_country").notNull(),
  destCountry: varchar("dest_country").notNull(),
  estCost: integer("est_cost").notNull(), // in USD cents
  estDays: integer("est_days").notNull(),
  routeName: varchar("route_name").notNull(),
  originPort: varchar("origin_port"),
  destinationPort: varchar("destination_port"),
  serviceType: varchar("service_type"), // Container, RoRo, Air
  confidenceScore: integer("confidence_score").notNull(),
  sourceAttribution: text("source_attribution").notNull(),
  sourceUrl: text("source_url"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketDataSamples = pgTable("market_data_samples", {
  id: serial("id").primaryKey(),
  auctionSite: varchar("auction_site").notNull(),
  carName: varchar("car_name").notNull(),
  vin: varchar("vin", { length: 17 }),
  priceUsd: integer("price_usd").notNull(), // in cents
  dateListed: timestamp("date_listed").notNull(),
  url: text("url").notNull(),
  make: varchar("make"),
  model: varchar("model"),
  year: integer("year"),
  mileage: varchar("mileage"),
  condition: varchar("condition"),
  location: varchar("location"),
  confidenceScore: integer("confidence_score").notNull(),
  sourceAttribution: text("source_attribution").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
  toCurrency: varchar("to_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  sourceAttribution: text("source_attribution").notNull(),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fallbackKeywords = pgTable("fallback_keywords", {
  id: serial("id").primaryKey(),
  inputVariation: varchar("input_variation").notNull(),
  normalizedModel: varchar("normalized_model").notNull(),
  matchScore: integer("match_score").notNull(), // 0-100
  make: varchar("make"),
  category: varchar("category"), // vin, model, chassis, etc
  confidenceScore: integer("confidence_score").notNull(),
  sourceAttribution: text("source_attribution").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Remove legacy tables that are replaced by new schemas above
export const vinPatterns = pgTable("vin_patterns_legacy", {
  id: serial("id").primaryKey(),
  wmiCode: varchar("wmi_code", { length: 10 }).notNull(),
  manufacturer: varchar("manufacturer").notNull(),
  country: varchar("country").notNull(),
  countryCode: varchar("country_code", { length: 3 }).notNull(),
  vehicleType: varchar("vehicle_type").notNull(),
  confidence: integer("confidence").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  lastVerified: timestamp("last_verified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicleLookupRequests = pgTable("vehicle_lookup_requests", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(), // VIN, URL, or keyword
  identifierType: varchar("identifier_type").notNull(), // vin, url, keyword
  resultData: jsonb("result_data"), // Complete lookup result
  userIp: varchar("user_ip"),
  userAgent: text("user_agent"),
  confidence: integer("confidence"),
  dataSource: varchar("data_source"),
  processingTimeMs: integer("processing_time_ms"),
  errors: text("errors").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dataQualityReports = pgTable("data_quality_reports", {
  id: serial("id").primaryKey(),
  dataType: varchar("data_type").notNull(), // vin_patterns, shipping_routes, compliance_rules
  totalRecords: integer("total_records").notNull(),
  verifiedRecords: integer("verified_records").notNull(),
  confidenceAverage: integer("confidence_average").notNull(),
  missingDataAreas: text("missing_data_areas").array(),
  lastAuditDate: timestamp("last_audit_date").defaultNow(),
  nextAuditDue: timestamp("next_audit_due"),
  auditedBy: varchar("audited_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminDataOverrides = pgTable("admin_data_overrides", {
  id: serial("id").primaryKey(),
  dataType: varchar("data_type").notNull(), // vin_patterns, shipping_routes, compliance_rules
  recordId: integer("record_id").notNull(),
  fieldName: varchar("field_name").notNull(),
  originalValue: text("original_value"),
  overrideValue: text("override_value").notNull(),
  reason: text("reason").notNull(),
  adminUserId: integer("admin_user_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const geographicCoverage = pgTable("geographic_coverage", {
  id: serial("id").primaryKey(),
  countryCode: varchar("country_code", { length: 2 }).notNull().unique(),
  countryName: varchar("country_name").notNull(),
  hasShippingData: boolean("has_shipping_data").default(false),
  hasComplianceData: boolean("has_compliance_data").default(false),
  hasVinSupport: boolean("has_vin_support").default(false),
  coverageScore: integer("coverage_score").default(0), // 0-100
  demandPriority: varchar("demand_priority").default("medium"), // low, medium, high, critical
  lastDataUpdate: timestamp("last_data_update"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for PostgreSQL core schemas
export type VehicleSpec = typeof vehicleSpecs.$inferSelect;
export type InsertVehicleSpec = typeof vehicleSpecs.$inferInsert;
export type ShippingRoute = typeof shippingRoutes.$inferSelect;
export type InsertShippingRoute = typeof shippingRoutes.$inferInsert;
export type ComplianceRule = typeof complianceRules.$inferSelect;
export type InsertComplianceRule = typeof complianceRules.$inferInsert;
export type MarketDataSample = typeof marketDataSamples.$inferSelect;
export type InsertMarketDataSample = typeof marketDataSamples.$inferInsert;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = typeof exchangeRates.$inferInsert;
export type FallbackKeyword = typeof fallbackKeywords.$inferSelect;
export type InsertFallbackKeyword = typeof fallbackKeywords.$inferInsert;
export type VinPattern = typeof vinPatterns.$inferSelect;
export type InsertVinPattern = typeof vinPatterns.$inferInsert;
export type VehicleLookupRequest = typeof vehicleLookupRequests.$inferSelect;
export type InsertVehicleLookupRequest = typeof vehicleLookupRequests.$inferInsert;
export type DataQualityReport = typeof dataQualityReports.$inferSelect;
export type InsertDataQualityReport = typeof dataQualityReports.$inferInsert;
export type AdminDataOverride = typeof adminDataOverrides.$inferSelect;
export type InsertAdminDataOverride = typeof adminDataOverrides.$inferInsert;
export type GeographicCoverage = typeof geographicCoverage.$inferSelect;
export type InsertGeographicCoverage = typeof geographicCoverage.$inferInsert;

export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = typeof deposits.$inferInsert;
export const insertDepositSchema = createInsertSchema(deposits);

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
