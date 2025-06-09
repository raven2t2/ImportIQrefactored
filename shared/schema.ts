import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index, numeric, date, real } from "drizzle-orm/pg-core";
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

// Category 1: Government Customs and Import/Export Data
export const customsRegulations = pgTable("customs_regulations", {
  id: serial("id").primaryKey(),
  regulationId: text("regulation_id").unique().notNull(),
  country: text("country").notNull(),
  vehicleTypeCategory: text("vehicle_type_category").notNull(),
  importDutyPercentage: decimal("import_duty_percentage", { precision: 5, scale: 2 }).notNull(),
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).notNull(),
  specificRequirements: text("specific_requirements"),
  effectiveDate: timestamp("effective_date").notNull(),
  sourceAuthority: text("source_authority"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const customsDuties = pgTable("customs_duties", {
  id: serial("id").primaryKey(),
  originCountry: text("origin_country").notNull(),
  destinationCountry: text("destination_country").notNull(),
  vehicleAgeCategory: text("vehicle_age_category").notNull(),
  dutyRatePercent: decimal("duty_rate_percent", { precision: 5, scale: 3 }).notNull(),
  additionalTaxes: jsonb("additional_taxes"),
  tradeAgreement: text("trade_agreement"),
  effectiveDate: date("effective_date"),
  expiryDate: date("expiry_date"),
  confidenceScore: integer("confidence_score"),
  sourceAttribution: text("source_attribution"),
  regulationReference: text("regulation_reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tradeStatistics = pgTable("trade_statistics", {
  id: serial("id").primaryKey(),
  statisticId: text("statistic_id").unique().notNull(),
  reportingCountry: text("reporting_country").notNull(),
  partnerCountry: text("partner_country").notNull(),
  vehicleCategory: text("vehicle_category").notNull(),
  importExportType: text("import_export_type").notNull(), // import or export
  volume: integer("volume").notNull(),
  valueUsd: decimal("value_usd", { precision: 15, scale: 2 }).notNull(),
  periodStartDate: timestamp("period_start_date").notNull(),
  periodEndDate: timestamp("period_end_date").notNull(),
  dataSource: text("data_source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hsCodes = pgTable("hs_codes", {
  id: serial("id").primaryKey(),
  hsCode: text("hs_code").unique().notNull(),
  description: text("description").notNull(),
  vehicleTypeCategory: text("vehicle_type_category"),
  dutyRate: decimal("duty_rate", { precision: 5, scale: 2 }),
  effectiveDate: timestamp("effective_date").notNull(),
  country: text("country").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Category 2: Public Auction House Past Results
export const publicAuctionSales = pgTable("public_auction_sales", {
  id: serial("id").primaryKey(),
  saleId: text("sale_id").unique().notNull(),
  auctionHouseName: text("auction_house_name").notNull(),
  saleDate: timestamp("sale_date").notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: integer("vehicle_year").notNull(),
  vinPartial: text("vin_partial"),
  odometerKm: integer("odometer_km"),
  conditionNotes: text("condition_notes"),
  soldPriceUsd: decimal("sold_price_usd", { precision: 12, scale: 2 }).notNull(),
  auctionFeesUsd: decimal("auction_fees_usd", { precision: 10, scale: 2 }),
  auctionLocation: text("auction_location"),
  lotNumber: text("lot_number"),
  grade: text("grade"),
  estimatedValue: decimal("estimated_value", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Category 3: Vehicle Specification Databases
export const vehicleSpecifications = pgTable("vehicle_specifications", {
  id: serial("id").primaryKey(),
  specId: text("spec_id").unique().notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYearStart: integer("vehicle_year_start").notNull(),
  vehicleYearEnd: integer("vehicle_year_end"),
  engineType: text("engine_type"),
  engineDisplacementCc: integer("engine_displacement_cc"),
  horsepowerHp: integer("horsepower_hp"),
  transmissionType: text("transmission_type"),
  driveType: text("drive_type"),
  dimensionsLengthMm: integer("dimensions_length_mm"),
  weightKg: integer("weight_kg"),
  fuelEconomyL100km: decimal("fuel_economy_l_100km", { precision: 4, scale: 2 }),
  regionSpecificNotes: text("region_specific_notes"),
  dataSource: text("data_source"),
  verificationStatus: text("verification_status").default("unverified"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const forumInsights = pgTable("forum_insights", {
  id: serial("id").primaryKey(),
  insightId: text("insight_id").unique().notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  topic: text("topic").notNull(),
  postDate: timestamp("post_date").notNull(),
  postContent: text("post_content").notNull(),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }),
  sourceForum: text("source_forum"),
  reliability: text("reliability").default("unverified"),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Category 4: Automotive News Archives
export const automotiveNews = pgTable("automotive_news", {
  id: serial("id").primaryKey(),
  articleId: text("article_id").unique().notNull(),
  publicationName: text("publication_name").notNull(),
  publicationDate: timestamp("publication_date").notNull(),
  articleTitle: text("article_title").notNull(),
  articleUrl: text("article_url").unique(),
  keywords: jsonb("keywords").$type<string[]>(),
  summaryText: text("summary_text"),
  fullTextContent: text("full_text_content"),
  category: text("category"), // recall, market_trend, review, regulation
  relevanceScore: decimal("relevance_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicleRecalls = pgTable("vehicle_recalls", {
  id: serial("id").primaryKey(),
  recallId: text("recall_id").unique().notNull(),
  issuingAuthority: text("issuing_authority").notNull(),
  recallDate: timestamp("recall_date").notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYearStart: integer("vehicle_year_start").notNull(),
  vehicleYearEnd: integer("vehicle_year_end"),
  defectDescription: text("defect_description").notNull(),
  remedyDescription: text("remedy_description"),
  affectedVehicles: integer("affected_vehicles"),
  severity: text("severity"), // low, moderate, high, critical
  recallStatus: text("recall_status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Category 5: Regional Registration Data
export const regionalRegistrations = pgTable("regional_registrations", {
  id: serial("id").primaryKey(),
  registrationId: text("registration_id").unique().notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  yearMonth: text("year_month").notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  registeredCount: integer("registered_count").notNull(),
  newRegistrations: integer("new_registrations"),
  usedRegistrations: integer("used_registrations"),
  dataSource: text("data_source"),
  reportingPeriod: text("reporting_period"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const historicListings = pgTable("historic_listings", {
  id: serial("id").primaryKey(),
  listingId: text("listing_id").unique().notNull(),
  listingPlatform: text("listing_platform").notNull(),
  postDate: timestamp("post_date").notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: integer("vehicle_year").notNull(),
  odometerKm: integer("odometer_km"),
  askingPriceUsd: decimal("asking_price_usd", { precision: 12, scale: 2 }).notNull(),
  conditionNotes: text("condition_notes"),
  locationListed: text("location_listed"),
  listingDuration: integer("listing_duration"), // days
  finalStatus: text("final_status"), // sold, expired, withdrawn
  finalPriceUsd: decimal("final_price_usd", { precision: 12, scale: 2 }),
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

// Memory and Personalization Tables
export const recentLookups = pgTable("recent_lookups", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: integer("user_id"), // nullable for anonymous users
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  chassisCode: text("chassis_code"),
  destination: text("destination").notNull(),
  lookupType: text("lookup_type").default("smart_lookup"), // smart_lookup, import_intelligence, compliance_check
  resultSummary: text("result_summary"), // brief summary of what was found
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index("recent_lookups_session_idx").on(table.sessionId),
  userIdx: index("recent_lookups_user_idx").on(table.userId),
  createdAtIdx: index("recent_lookups_created_at_idx").on(table.createdAt),
}));

export const savedJourneys = pgTable("saved_journeys", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: integer("user_id"), // nullable for anonymous users
  journeyName: text("journey_name").notNull(), // user-defined or auto-generated
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  chassisCode: text("chassis_code"),
  vehicleYear: integer("vehicle_year"),
  destination: text("destination").notNull(),
  journeyData: jsonb("journey_data").notNull(), // full import intelligence result
  aiSummary: text("ai_summary"), // GPT-generated personalized summary
  isBookmarked: boolean("is_bookmarked").default(true),
  tags: text("tags").array(), // user or AI-generated tags
  progress: text("progress").default("planning"), // planning, purchasing, shipping, compliance, completed
  estimatedCompletion: timestamp("estimated_completion"),
  totalCostEstimate: integer("total_cost_estimate"), // in cents
  currency: text("currency").default("AUD"),
  lastViewed: timestamp("last_viewed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index("saved_journeys_session_idx").on(table.sessionId),
  userIdx: index("saved_journeys_user_idx").on(table.userId),
  progressIdx: index("saved_journeys_progress_idx").on(table.progress),
  lastViewedIdx: index("saved_journeys_last_viewed_idx").on(table.lastViewed),
}));

export const vehicleWatchlist = pgTable("vehicle_watchlist", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: integer("user_id"), // nullable for anonymous users
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  chassisCode: text("chassis_code"),
  destination: text("destination").notNull(),
  watchType: text("watch_type").notNull(), // price_alert, eligibility_change, regulation_update
  alertThreshold: integer("alert_threshold"), // price threshold in cents
  currentStatus: text("current_status"), // current eligibility or price
  lastChecked: timestamp("last_checked").defaultNow(),
  isActive: boolean("is_active").default(true),
  alertFrequency: text("alert_frequency").default("weekly"), // daily, weekly, monthly
  contactEmail: text("contact_email"), // for notifications
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index("vehicle_watchlist_session_idx").on(table.sessionId),
  userIdx: index("vehicle_watchlist_user_idx").on(table.userId),
  watchTypeIdx: index("vehicle_watchlist_watch_type_idx").on(table.watchType),
  isActiveIdx: index("vehicle_watchlist_is_active_idx").on(table.isActive),
}));

// Enhanced scraping tables for comprehensive data persistence
export const htsTariffCodes = pgTable('hts_tariff_codes', {
  id: serial('id').primaryKey(),
  htsCode: varchar('hts_code', { length: 12 }).unique().notNull(),
  description: text('description').notNull(),
  dutyRatePercent: decimal('duty_rate_percent', { precision: 5, scale: 2 }),
  dutyRateSpecific: varchar('duty_rate_specific', { length: 100 }),
  effectiveDate: date('effective_date'),
  countryExceptions: jsonb('country_exceptions'),
  vehicleCategory: varchar('vehicle_category', { length: 50 }),
  engineSizeCategory: varchar('engine_size_category', { length: 30 }),
  valueThreshold: decimal('value_threshold', { precision: 12, scale: 2 }),
  additionalFees: jsonb('additional_fees'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vehicleHtsMapping = pgTable('vehicle_hts_mapping', {
  id: serial('id').primaryKey(),
  vehicleMake: varchar('vehicle_make', { length: 50 }).notNull(),
  vehicleModel: varchar('vehicle_model', { length: 100 }).notNull(),
  engineSizeCc: integer('engine_size_cc'),
  yearMin: integer('year_min'),
  yearMax: integer('year_max'),
  htsCode: varchar('hts_code', { length: 12 }).references(() => htsTariffCodes.htsCode),
  mappingConfidence: real('mapping_confidence').default(1.0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const copartVehicles = pgTable('copart_vehicles', {
  id: serial('id').primaryKey(),
  lotNumber: varchar('lot_number', { length: 20 }).unique().notNull(),
  vin: varchar('vin', { length: 17 }),
  make: varchar('make', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year').notNull(),
  engineSize: varchar('engine_size', { length: 20 }),
  transmission: varchar('transmission', { length: 20 }),
  driveType: varchar('drive_type', { length: 10 }),
  fuelType: varchar('fuel_type', { length: 20 }),
  mileage: integer('mileage'),
  damageDescription: text('damage_description'),
  damageSeverity: varchar('damage_severity', { length: 20 }),
  currentBid: decimal('current_bid', { precision: 10, scale: 2 }),
  buyItNowPrice: decimal('buy_it_now_price', { precision: 10, scale: 2 }),
  estimatedValue: decimal('estimated_value', { precision: 10, scale: 2 }),
  saleDate: date('sale_date'),
  location: varchar('location', { length: 100 }),
  seller: varchar('seller', { length: 50 }),
  titleType: varchar('title_type', { length: 30 }),
  auctionStatus: varchar('auction_status', { length: 20 }),
  reserveMet: boolean('reserve_met').default(false),
  importEligibilityScore: integer('import_eligibility_score'),
  conditionReport: jsonb('condition_report'),
  images: jsonb('images'),
  scrapedAt: timestamp('scraped_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const copartPriceHistory = pgTable('copart_price_history', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => copartVehicles.id),
  lotNumber: varchar('lot_number', { length: 20 }).references(() => copartVehicles.lotNumber),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  bidCount: integer('bid_count').default(0),
  saleStatus: varchar('sale_status', { length: 20 }).notNull(),
  timeRemaining: varchar('time_remaining', { length: 50 }),
  recordedAt: timestamp('recorded_at').defaultNow(),
});

export const cbsaImportRequirements = pgTable('cbsa_import_requirements', {
  id: serial('id').primaryKey(),
  vehicleCategory: varchar('vehicle_category', { length: 100 }).notNull(),
  make: varchar('make', { length: 50 }),
  model: varchar('model', { length: 100 }),
  yearMin: integer('year_min'),
  yearMax: integer('year_max'),
  rivEligible: boolean('riv_eligible').default(false),
  rivCategory: varchar('riv_category', { length: 20 }),
  requiredDocuments: jsonb('required_documents').notNull(),
  modificationRequirements: jsonb('modification_requirements'),
  inspectionRequirements: text('inspection_requirements'),
  dutyRate: decimal('duty_rate', { precision: 5, scale: 2 }).notNull(),
  gstRate: decimal('gst_rate', { precision: 5, scale: 2 }).notNull(),
  additionalFees: jsonb('additional_fees'),
  estimatedCostCad: decimal('estimated_cost_cad', { precision: 10, scale: 2 }),
  processingTimeDays: integer('processing_time_days').default(30),
  provincialRequirements: jsonb('provincial_requirements'),
  recallClearanceRequired: boolean('recall_clearance_required').default(true),
  emissionsCompliance: varchar('emissions_compliance', { length: 100 }),
  safetyStandards: jsonb('safety_standards'),
  notes: text('notes'),
  sourceUrl: varchar('source_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vehicleImportEligibility = pgTable('vehicle_import_eligibility', {
  id: serial('id').primaryKey(),
  vin: varchar('vin', { length: 17 }),
  make: varchar('make', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year').notNull(),
  usaEligible: boolean('usa_eligible').default(false),
  canadaEligible: boolean('canada_eligible').default(false),
  usaWaitUntil: date('usa_wait_until'),
  canadaRequirementsId: integer('canada_requirements_id').references(() => cbsaImportRequirements.id),
  htsCode: varchar('hts_code', { length: 12 }).references(() => htsTariffCodes.htsCode),
  calculatedDutyUsd: decimal('calculated_duty_usd', { precision: 10, scale: 2 }),
  calculatedDutyCad: decimal('calculated_duty_cad', { precision: 10, scale: 2 }),
  totalImportCostUsd: decimal('total_import_cost_usd', { precision: 10, scale: 2 }),
  totalImportCostCad: decimal('total_import_cost_cad', { precision: 10, scale: 2 }),
  confidenceScore: real('confidence_score').default(0.0),
  dataQualityScore: real('data_quality_score').default(0.0),
  lastCalculated: timestamp('last_calculated').defaultNow(),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const scrapingData = pgTable('scraping_data', {
  id: serial('id').primaryKey(),
  source: varchar('source', { length: 100 }).notNull(),
  dataType: varchar('data_type', { length: 50 }).notNull(),
  rawData: jsonb('raw_data').notNull(),
  processedData: jsonb('processed_data'),
  qualityScore: real('quality_score'),
  isValid: boolean('is_valid').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  lastValidated: timestamp('last_validated'),
});

export const scrapingMetrics = pgTable('scraping_metrics', {
  id: serial('id').primaryKey(),
  source: varchar('source', { length: 100 }).notNull(),
  recordsFound: integer('records_found').default(0),
  recordsProcessed: integer('records_processed').default(0),
  successRate: real('success_rate'),
  averageQualityScore: real('average_quality_score'),
  executionTime: real('execution_time'),
  errors: jsonb('errors'),
  runDate: date('run_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const journeyEvents = pgTable("journey_events", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  userId: integer("user_id"), // nullable for anonymous users
  savedJourneyId: integer("saved_journey_id").references(() => savedJourneys.id),
  eventType: text("event_type").notNull(), // lookup, save_journey, bookmark, price_check, compliance_update
  eventData: jsonb("event_data"), // contextual data for the event
  vehicleMake: text("vehicle_make"),
  vehicleModel: text("vehicle_model"),
  destination: text("destination"),
  description: text("description"), // human-readable event description
  importance: text("importance").default("medium"), // low, medium, high, critical
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index("journey_events_session_idx").on(table.sessionId),
  userIdx: index("journey_events_user_idx").on(table.userId),
  savedJourneyIdx: index("journey_events_saved_journey_idx").on(table.savedJourneyId),
  eventTypeIdx: index("journey_events_event_type_idx").on(table.eventType),
  createdAtIdx: index("journey_events_created_at_idx").on(table.createdAt),
}));

export const sessionMemory = pgTable("session_memory", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id"), // nullable for anonymous users
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  totalLookups: integer("total_lookups").default(0),
  favoriteDestination: text("favorite_destination"),
  preferredVehicleTypes: text("preferred_vehicle_types").array(),
  journeyStage: text("journey_stage").default("exploring"), // exploring, researching, decided, importing
  personalizationData: jsonb("personalization_data"), // AI insights about user preferences
  returningUser: boolean("returning_user").default(false),
  firstVisit: timestamp("first_visit").defaultNow(),
  deviceFingerprint: text("device_fingerprint"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index("session_memory_session_id_idx").on(table.sessionId),
  userIdx: index("session_memory_user_idx").on(table.userId),
  lastActivityIdx: index("session_memory_last_activity_idx").on(table.lastActivity),
}));

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
  successRate: decimal("success_rate", { precision: 8, scale: 2 }),
  averageConfidence: decimal("average_confidence", { precision: 8, scale: 2 }),
  commonFailureReasons: text("common_failure_reasons").array(),
  suggestedImprovements: text("suggested_improvements").array(),
  dateAnalyzed: timestamp("date_analyzed").defaultNow(),
});

// Vehicle heads database with hero vehicles and emotional descriptions
export const vehicleHeads = pgTable('vehicle_heads', {
  id: serial('id').primaryKey(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  chassisCode: text('chassis_code'),
  yearStart: integer('year_start'),
  yearEnd: integer('year_end'),
  originCountry: text('origin_country'),
  heroStatus: text('hero_status'),
  emotionalDescription: text('emotional_description'),
  importDifficulty: text('import_difficulty'),
  typicalPriceRange: text('typical_price_range'),
  keyAppealFactors: text('key_appeal_factors').array(),
  culturalSignificance: text('cultural_significance'),
  createdAt: timestamp('created_at').defaultNow()
});

// Import cost calculations for tracking pricing data
export const importCostCalculations = pgTable('import_cost_calculations', {
  id: serial('id').primaryKey(),
  vehicleData: jsonb('vehicle_data'),
  destination: text('destination'),
  vehicleCostAud: decimal('vehicle_cost_aud', { precision: 12, scale: 2 }),
  shippingCostAud: decimal('shipping_cost_aud', { precision: 12, scale: 2 }),
  dutiesAndTaxes: decimal('duties_and_taxes', { precision: 12, scale: 2 }),
  complianceCosts: decimal('compliance_costs', { precision: 12, scale: 2 }),
  totalCostAud: decimal('total_cost_aud', { precision: 12, scale: 2 }),
  sessionToken: text('session_token'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow()
});

// Market Intelligence Analytics - Real-time auction and pricing data
export const marketIntelligenceAnalytics = pgTable('market_intelligence_analytics', {
  id: serial('id').primaryKey(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  averagePrice: decimal('average_price', { precision: 12, scale: 2 }),
  priceVariance: decimal('price_variance', { precision: 8, scale: 2 }),
  activeListings: integer('active_listings'),
  marketTrend: varchar('market_trend'), // rising, falling, stable
  importVolume: varchar('import_volume'), // high, moderate, low
  bestImportWindow: text('best_import_window'),
  timingInsight: text('timing_insight'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Project Inquiries - Customer import project requests
export const projectInquiries = pgTable('project_inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  urgency: varchar('urgency').notNull(), // low, medium, high, urgent
  serviceType: varchar('service_type').notNull(), // quote, consultation, full-service, compliance-only
  budget: text('budget'),
  timeline: text('timeline'),
  message: text('message').notNull(),
  preferredContact: varchar('preferred_contact').notNull(), // email, phone, either
  vehicleInfo: jsonb('vehicle_info'), // make, model, chassis, year
  destination: text('destination').notNull(),
  status: varchar('status').default('new'), // new, contacted, in-progress, completed, closed
  assignedTo: text('assigned_to'),
  responseNotes: text('response_notes'),
  submittedAt: timestamp('submitted_at').notNull(),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Vehicle Sourcing Intelligence - Best procurement strategies
export const vehicleSourcingIntelligence = pgTable('vehicle_sourcing_intelligence', {
  id: serial('id').primaryKey(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  bestSourceCountry: text('best_source_country'),
  availabilityPercentage: integer('availability_percentage'),
  recommendedAuctionHouses: text('recommended_auction_houses').array(),
  seasonalRecommendations: jsonb('seasonal_recommendations'),
  sourcingStrategy: text('sourcing_strategy'),
  qualityRating: varchar('quality_rating'), // high, medium, low
  valueRating: varchar('value_rating'), // excellent, good, fair
  proTips: text('pro_tips').array(),
  lastAnalyzed: timestamp('last_analyzed').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Import Risk Assessment - Comprehensive risk analysis
export const importRiskAssessment = pgTable('import_risk_assessment', {
  id: serial('id').primaryKey(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  destination: text('destination').notNull(),
  regulatoryRisk: jsonb('regulatory_risk'), // compliance, documentation, age eligibility
  marketRisk: jsonb('market_risk'), // price volatility, availability, competition
  financialRisk: jsonb('financial_risk'), // currency, hidden costs, cost overruns
  overallRiskScore: integer('overall_risk_score'), // 1-100
  riskCategory: varchar('risk_category'), // low, medium, high
  mitigationStrategies: text('mitigation_strategies').array(),
  contingencyBudget: decimal('contingency_budget', { precision: 8, scale: 2 }),
  recommendedActions: text('recommended_actions').array(),
  lastAssessed: timestamp('last_assessed').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Vehicle Technical Intelligence - Comprehensive engine and modification data
export const vehicleTechnicalIntelligence = pgTable('vehicle_technical_intelligence', {
  id: serial('id').primaryKey(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  chassisCode: text('chassis_code'),
  year: integer('year'),
  engineCode: text('engine_code').notNull(),
  engineType: text('engine_type').notNull(),
  displacement: text('displacement').notNull(),
  power: text('power').notNull(),
  torque: text('torque').notNull(),
  compression: text('compression'),
  configuration: text('configuration'),
  drivetrainType: text('drivetrain_type').notNull(),
  transmission: text('transmission').notNull(),
  differential: text('differential'),
  rarityFactor: text('rarity_factor'),
  collectibilityScore: integer('collectibility_score'),
  productionNumbers: integer('production_numbers'),
  appreciationRate: decimal('appreciation_rate', { precision: 5, scale: 2 }),
  marketSegment: text('market_segment'),
  technicalNotes: text('technical_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Popular Vehicle Modifications - Community-driven modification database
export const popularVehicleModifications = pgTable('popular_vehicle_modifications', {
  id: serial('id').primaryKey(),
  vehicleTechId: integer('vehicle_tech_id').references(() => vehicleTechnicalIntelligence.id),
  modificationName: text('modification_name').notNull(),
  category: text('category').notNull(), // engine, suspension, exhaust, intake, turbo, etc
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  powerGain: text('power_gain'),
  torqueGain: text('torque_gain'),
  difficultyLevel: text('difficulty_level'), // easy, moderate, advanced, professional
  popularityRank: integer('popularity_rank'),
  compatibleYears: text('compatible_years'),
  brandName: text('brand_name'),
  partNumber: text('part_number'),
  installationTime: text('installation_time'),
  description: text('description'),
  warningNotes: text('warning_notes'),
  createdAt: timestamp('created_at').defaultNow()
});

// Modification Cost Analysis - Real market pricing for upgrades
export const modificationCostAnalysis = pgTable('modification_cost_analysis', {
  id: serial('id').primaryKey(),
  vehicleTechId: integer('vehicle_tech_id').references(() => vehicleTechnicalIntelligence.id),
  modificationStage: text('modification_stage').notNull(), // stage1, stage2, stage3, full_build
  stageName: text('stage_name').notNull(),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
  powerOutput: text('power_output').notNull(),
  torqueOutput: text('torque_output'),
  expectedReliability: text('expected_reliability'),
  timeToComplete: text('time_to_complete'),
  recommendedParts: jsonb('recommended_parts'),
  laborCosts: decimal('labor_costs', { precision: 8, scale: 2 }),
  partsCosts: decimal('parts_costs', { precision: 8, scale: 2 }),
  miscCosts: decimal('misc_costs', { precision: 8, scale: 2 }),
  roi: text('roi'), // return on investment for performance/dollar
  createdAt: timestamp('created_at').defaultNow()
});

// Vehicle Investment Intelligence - Market appreciation and collectibility data
export const vehicleInvestmentIntelligence = pgTable('vehicle_investment_intelligence', {
  id: serial('id').primaryKey(),
  vehicleTechId: integer('vehicle_tech_id').references(() => vehicleTechnicalIntelligence.id),
  currentMarketValue: decimal('current_market_value', { precision: 12, scale: 2 }),
  fiveYearAppreciation: decimal('five_year_appreciation', { precision: 5, scale: 2 }),
  tenYearAppreciation: decimal('ten_year_appreciation', { precision: 5, scale: 2 }),
  collectibilityRating: text('collectibility_rating'), // blue_chip, strong, moderate, speculative
  liquidityRating: text('liquidity_rating'), // high, medium, low
  marketFactors: jsonb('market_factors'),
  riskFactors: jsonb('risk_factors'),
  investmentGrade: text('investment_grade'), // A+, A, B+, B, C
  holdingRecommendation: text('holding_recommendation'),
  sellingStrategy: text('selling_strategy'),
  lastMarketAnalysis: timestamp('last_market_analysis').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Vehicle Monitoring Alerts - User tracking and notifications
export const vehicleMonitoringAlerts = pgTable('vehicle_monitoring_alerts', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year'),
  alertTypes: text('alert_types').array(), // price_alerts, new_listings, market_changes
  priceThreshold: decimal('price_threshold', { precision: 12, scale: 2 }),
  isActive: boolean('is_active').default(true),
  lastNotified: timestamp('last_notified'),
  notificationCount: integer('notification_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
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

// Global Compliance Rules Database
export const globalComplianceRules = pgTable("global_compliance_rules", {
  id: serial("id").primaryKey(),
  country: varchar("country").notNull(),
  region: varchar("region"), // state/province if applicable
  ruleType: varchar("rule_type").notNull(), // age_restriction, emissions, safety, etc
  vehicleCategory: varchar("vehicle_category"), // passenger, commercial, motorcycle
  minimumAgeYears: integer("minimum_age_years"),
  maximumAgeYears: integer("maximum_age_years"),
  emissionStandard: varchar("emission_standard"),
  safetyStandard: varchar("safety_standard"),
  specialRequirements: jsonb("special_requirements"),
  exemptions: jsonb("exemptions"),
  complianceCost: decimal("compliance_cost", { precision: 10, scale: 2 }),
  processingTimeWeeks: integer("processing_time_weeks"),
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date"),
  expiryDate: timestamp("expiry_date"),
  sourceDocument: text("source_document"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legacy Vehicle Specifications (renamed to avoid conflict)
export const legacyVehicleSpecs = pgTable("legacy_vehicle_specs", {
  id: serial("id").primaryKey(),
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  chassis: varchar("chassis"),
  engine: varchar("engine"),
  displacement: varchar("displacement"),
  transmission: varchar("transmission"),
  driveType: varchar("drive_type"),
  fuelType: varchar("fuel_type"),
  bodyStyle: varchar("body_style"),
  doors: integer("doors"),
  seats: integer("seats"),
  weight: integer("weight"), // kg
  length: integer("length"), // mm
  width: integer("width"), // mm
  height: integer("height"), // mm
  wheelbase: integer("wheelbase"), // mm
  power: integer("power"), // hp
  torque: integer("torque"), // nm
  emissions: varchar("emissions"),
  safetyRating: varchar("safety_rating"),
  productionStart: timestamp("production_start"),
  productionEnd: timestamp("production_end"),
  marketRegions: text("market_regions").array(),
  specialNotes: text("special_notes"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Import Cost Structure Database
export const importCostStructure = pgTable("import_cost_structure", {
  id: serial("id").primaryKey(),
  originCountry: varchar("origin_country").notNull(),
  destinationCountry: varchar("destination_country").notNull(),
  destinationRegion: varchar("destination_region"),
  vehicleType: varchar("vehicle_type"), // passenger, commercial, motorcycle
  ageCategory: varchar("age_category"), // vintage, classic, modern
  dutyRate: decimal("duty_rate", { precision: 5, scale: 4 }), // percentage as decimal
  gstRate: decimal("gst_rate", { precision: 5, scale: 4 }),
  luxuryTaxThreshold: decimal("luxury_tax_threshold", { precision: 12, scale: 2 }),
  luxuryTaxRate: decimal("luxury_tax_rate", { precision: 5, scale: 4 }),
  baseShippingCost: decimal("base_shipping_cost", { precision: 10, scale: 2 }),
  inspectionFee: decimal("inspection_fee", { precision: 10, scale: 2 }),
  complianceFee: decimal("compliance_fee", { precision: 10, scale: 2 }),
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }),
  brokerageFee: decimal("brokerage_fee", { precision: 10, scale: 2 }),
  storagePerDay: decimal("storage_per_day", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("AUD"),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  sourceAuthority: text("source_authority"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Port and Shipping Database
export const portInformation = pgTable("port_information", {
  id: serial("id").primaryKey(),
  portCode: varchar("port_code").notNull().unique(),
  portName: varchar("port_name").notNull(),
  country: varchar("country").notNull(),
  region: varchar("region"),
  city: varchar("city").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  portAuthority: varchar("port_authority"),
  website: varchar("website"),
  vehicleTerminal: boolean("vehicle_terminal").default(false),
  roroCapable: boolean("roro_capable").default(false),
  containerCapable: boolean("container_capable").default(false),
  operatingHours: varchar("operating_hours"),
  vehicleProcessingCapacity: integer("vehicle_processing_capacity"), // per month
  averageProcessingDays: integer("average_processing_days"),
  baseHandlingFee: decimal("base_handling_fee", { precision: 10, scale: 2 }),
  quarantineInspectionFee: decimal("quarantine_inspection_fee", { precision: 10, scale: 2 }),
  customsProcessingFee: decimal("customs_processing_fee", { precision: 10, scale: 2 }),
  storagePerDay: decimal("storage_per_day", { precision: 10, scale: 2 }),
  afterHoursFee: decimal("after_hours_fee", { precision: 10, scale: 2 }),
  currentStatus: varchar("current_status"), // low, moderate, high, congested
  averageWaitDays: integer("average_wait_days"),
  peakSeasons: jsonb("peak_seasons"),
  monthlyVehicleVolume: integer("monthly_vehicle_volume"),
  congestionFactors: text("congestion_factors").array(),
  quarantineStrictness: varchar("quarantine_strictness"), // standard, high, very_high
  customsComplexity: varchar("customs_complexity"), // simple, moderate, complex
  additionalRequirements: text("additional_requirements").array(),
  recommendedAgents: text("recommended_agents").array(),
  railConnections: boolean("rail_connections").default(false),
  highwayAccess: varchar("highway_access"),
  regionsServed: text("regions_served").array(),
  bestFor: text("best_for").array(),
  challenges: text("challenges").array(),
  tips: text("tips").array(),
  currency: varchar("currency", { length: 3 }).default("AUD"),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
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

// Real-world auction data from Apify
export const vehicleAuctions = pgTable("vehicle_auctions", {
  id: serial("id").primaryKey(),
  apifyId: text("apify_id").unique(),
  category: text("category"), // e.g., "JDM", "US Muscle", "Skyline"
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  chassisCode: text("chassis_code"),
  engine: text("engine"),
  transmission: text("transmission"),
  mileage: text("mileage"),
  fuelType: text("fuel_type"),
  auctionEnd: timestamp("auction_end"),
  price: numeric("price", { precision: 12, scale: 2 }),
  location: text("location"),
  source: text("source"),
  sourceUrl: text("source_url"),
  imageUrl: text("image_url"),
  description: text("description"),
  fetchedAt: timestamp("fetched_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => ({
  apifyIdIdx: index("vehicle_auctions_apify_id_idx").on(table.apifyId),
  categoryIdx: index("vehicle_auctions_category_idx").on(table.category),
  makeModelIdx: index("vehicle_auctions_make_model_idx").on(table.make, table.model),
  priceIdx: index("vehicle_auctions_price_idx").on(table.price),
  fetchedAtIdx: index("vehicle_auctions_fetched_at_idx").on(table.fetchedAt),
}));

export const vehicleAuctionChanges = pgTable("vehicle_auction_changes", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").references(() => vehicleAuctions.id).notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  changedAt: timestamp("changed_at").defaultNow(),
}, (table) => ({
  auctionIdIdx: index("vehicle_auction_changes_auction_id_idx").on(table.auctionId),
  changedAtIdx: index("vehicle_auction_changes_changed_at_idx").on(table.changedAt),
}));

export const datasetSources = pgTable("dataset_sources", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  lastFetched: timestamp("last_fetched"),
  fetchFrequency: integer("fetch_frequency").default(24), // hours
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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
