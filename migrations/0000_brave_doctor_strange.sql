CREATE TABLE "admin_data_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"data_type" varchar NOT NULL,
	"record_id" integer NOT NULL,
	"field_name" varchar NOT NULL,
	"original_value" text,
	"override_value" text NOT NULL,
	"reason" text NOT NULL,
	"admin_user_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_query_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_query" text NOT NULL,
	"lookup_type" varchar NOT NULL,
	"confidence_score" integer,
	"result_quality" varchar,
	"admin_notes" text,
	"enhancement_suggestions" text,
	"flagged_for_review" boolean DEFAULT false,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" integer NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"department" text,
	"first_name" text,
	"last_name" text,
	"job_title" text,
	"phone_number" text,
	"is_active" boolean DEFAULT true,
	"can_view_financials" boolean DEFAULT false,
	"can_manage_users" boolean DEFAULT false,
	"can_export_data" boolean DEFAULT false,
	"can_manage_affiliates" boolean DEFAULT false,
	"last_login" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"social_link" varchar(500),
	"referral_code" varchar(50) NOT NULL,
	"tier" varchar(50) DEFAULT 'starter',
	"commission_rate" integer DEFAULT 20,
	"status" varchar(50) DEFAULT 'active',
	"total_clicks" integer DEFAULT 0,
	"total_signups" integer DEFAULT 0,
	"total_earnings" integer DEFAULT 0,
	"current_balance" integer DEFAULT 0,
	"is_influencer" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "affiliates_email_unique" UNIQUE("email"),
	CONSTRAINT "affiliates_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"budget" integer NOT NULL,
	"intended_use" text NOT NULL,
	"experience" text NOT NULL,
	"preferences" text NOT NULL,
	"timeline" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anonymous_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"user_fingerprint" varchar(255),
	"current_journey_session_id" integer,
	"recent_queries" jsonb,
	"preferences" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"first_seen" timestamp DEFAULT now(),
	"last_seen" timestamp DEFAULT now(),
	"page_views" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "anonymous_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "api_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_name" text NOT NULL,
	"token_hash" text NOT NULL,
	"scopes" text[] DEFAULT '{"lookup"}' NOT NULL,
	"last_used" timestamp,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "auction_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"mileage" varchar,
	"location" varchar NOT NULL,
	"image_url" text,
	"listing_url" text NOT NULL,
	"source_site" varchar NOT NULL,
	"make" varchar,
	"model" varchar,
	"year" integer,
	"condition" varchar,
	"body_type" varchar,
	"transmission" varchar,
	"fuel_type" varchar,
	"engine_size" varchar,
	"auction_id" varchar,
	"lot_number" varchar,
	"auction_date" timestamp,
	"auction_grade" varchar,
	"sale_status" varchar,
	"is_active" boolean DEFAULT true,
	"data_source" varchar NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automotive_news" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" text NOT NULL,
	"publication_name" text NOT NULL,
	"publication_date" timestamp NOT NULL,
	"article_title" text NOT NULL,
	"article_url" text,
	"keywords" jsonb,
	"summary_text" text,
	"full_text_content" text,
	"category" text,
	"relevance_score" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "automotive_news_article_id_unique" UNIQUE("article_id"),
	CONSTRAINT "automotive_news_article_url_unique" UNIQUE("article_url")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"service" varchar NOT NULL,
	"preferred_date" varchar NOT NULL,
	"preferred_time" varchar NOT NULL,
	"vehicle_details" text,
	"message" text,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulk_vin_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"job_name" text NOT NULL,
	"vin_list" text[] NOT NULL,
	"destination" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"total_vins" integer NOT NULL,
	"processed_vins" integer DEFAULT 0,
	"successful_vins" integer DEFAULT 0,
	"failed_vins" integer DEFAULT 0,
	"results_data" jsonb,
	"download_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "car_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"event_type" text NOT NULL,
	"description" text,
	"location" text NOT NULL,
	"postcode" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"end_date" timestamp,
	"website_url" text,
	"entry_fee" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cbsa_import_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_category" varchar(100) NOT NULL,
	"make" varchar(50),
	"model" varchar(100),
	"year_min" integer,
	"year_max" integer,
	"riv_eligible" boolean DEFAULT false,
	"riv_category" varchar(20),
	"required_documents" jsonb NOT NULL,
	"modification_requirements" jsonb,
	"inspection_requirements" text,
	"duty_rate" numeric(5, 2) NOT NULL,
	"gst_rate" numeric(5, 2) NOT NULL,
	"additional_fees" jsonb,
	"estimated_cost_cad" numeric(10, 2),
	"processing_time_days" integer DEFAULT 30,
	"provincial_requirements" jsonb,
	"recall_clearance_required" boolean DEFAULT true,
	"emissions_compliance" varchar(100),
	"safety_standards" jsonb,
	"notes" text,
	"source_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar NOT NULL,
	"user_identifier" varchar,
	"interaction_type" varchar NOT NULL,
	"tool_context" varchar,
	"message_count" integer DEFAULT 0,
	"session_duration" integer,
	"helpfulness_rating" integer,
	"topic_category" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_identifier" varchar NOT NULL,
	"total_interactions" integer DEFAULT 0,
	"preferred_topics" jsonb,
	"avg_session_duration" integer,
	"last_interaction_date" timestamp,
	"user_expertise_level" varchar DEFAULT 'beginner',
	"favorite_tools" jsonb,
	"icon_personality" varchar DEFAULT 'friendly',
	"custom_icon_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_profiles_user_identifier_unique" UNIQUE("user_identifier")
);
--> statement-breakpoint
CREATE TABLE "compliance_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"form_code" varchar(50) NOT NULL,
	"form_name" varchar(200) NOT NULL,
	"form_description" text NOT NULL,
	"form_url" varchar(500) NOT NULL,
	"pdf_url" varchar(500),
	"required_for" text[] NOT NULL,
	"mandatory" boolean DEFAULT true,
	"processing_time_days" integer,
	"fees" jsonb,
	"last_verified" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"country" varchar NOT NULL,
	"region" varchar,
	"rule" text NOT NULL,
	"notes" text,
	"minimum_age" integer,
	"maximum_age" integer,
	"left_hand_drive_allowed" boolean DEFAULT true,
	"requirements" text[],
	"estimated_costs" jsonb,
	"special_notes" text[],
	"confidence_score" integer NOT NULL,
	"source_attribution" text NOT NULL,
	"source_url" text,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copart_price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer,
	"lot_number" varchar(20),
	"price" numeric(10, 2) NOT NULL,
	"bid_count" integer DEFAULT 0,
	"sale_status" varchar(20) NOT NULL,
	"time_remaining" varchar(50),
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copart_vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"lot_number" varchar(20) NOT NULL,
	"vin" varchar(17),
	"make" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"engine_size" varchar(20),
	"transmission" varchar(20),
	"drive_type" varchar(10),
	"fuel_type" varchar(20),
	"mileage" integer,
	"damage_description" text,
	"damage_severity" varchar(20),
	"current_bid" numeric(10, 2),
	"buy_it_now_price" numeric(10, 2),
	"estimated_value" numeric(10, 2),
	"sale_date" date,
	"location" varchar(100),
	"seller" varchar(50),
	"title_type" varchar(30),
	"auction_status" varchar(20),
	"reserve_met" boolean DEFAULT false,
	"import_eligibility_score" integer,
	"condition_report" jsonb,
	"images" jsonb,
	"scraped_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "copart_vehicles_lot_number_unique" UNIQUE("lot_number")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_code" varchar(3) NOT NULL,
	"country_name" varchar(100) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"import_agency_name" varchar(200) NOT NULL,
	"agency_website" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "countries_country_code_unique" UNIQUE("country_code")
);
--> statement-breakpoint
CREATE TABLE "csv_import_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"total_rows" integer NOT NULL,
	"processed_rows" integer DEFAULT 0,
	"successful_rows" integer DEFAULT 0,
	"failed_rows" integer DEFAULT 0,
	"results_data" jsonb,
	"error_log" jsonb,
	"download_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "customs_duties" (
	"id" serial PRIMARY KEY NOT NULL,
	"origin_country" text NOT NULL,
	"destination_country" text NOT NULL,
	"vehicle_age_category" text NOT NULL,
	"duty_rate_percent" numeric(5, 3) NOT NULL,
	"additional_taxes" jsonb,
	"trade_agreement" text,
	"effective_date" date,
	"expiry_date" date,
	"confidence_score" integer,
	"source_attribution" text,
	"regulation_reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customs_regulations" (
	"id" serial PRIMARY KEY NOT NULL,
	"regulation_id" text NOT NULL,
	"country" text NOT NULL,
	"vehicle_type_category" text NOT NULL,
	"import_duty_percentage" numeric(5, 2) NOT NULL,
	"gst_vat_percentage" numeric(5, 2),
	"additional_fees_flat" numeric(10, 2),
	"source_url" text,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customs_regulations_regulation_id_unique" UNIQUE("regulation_id")
);
--> statement-breakpoint
CREATE TABLE "data_ingestion_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_name" varchar NOT NULL,
	"records_received" integer DEFAULT 0,
	"records_processed" integer DEFAULT 0,
	"records_skipped" integer DEFAULT 0,
	"errors" jsonb,
	"request_payload" jsonb,
	"status" varchar NOT NULL,
	"processing_time_ms" integer,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_quality_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"data_type" varchar NOT NULL,
	"total_records" integer NOT NULL,
	"verified_records" integer NOT NULL,
	"confidence_average" integer NOT NULL,
	"missing_data_areas" text[],
	"last_audit_date" timestamp DEFAULT now(),
	"next_audit_due" timestamp,
	"audited_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dataset_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"category" text NOT NULL,
	"last_fetched" timestamp,
	"fetch_frequency" integer DEFAULT 24,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"amount" numeric(10, 2) NOT NULL,
	"deposit_type" text NOT NULL,
	"service_details" text,
	"vehicle_details" text,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"status" text DEFAULT 'pending',
	"paid_at" timestamp,
	"refunded_at" timestamp,
	"applied_to_invoice" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"submission_count" integer DEFAULT 1 NOT NULL,
	"last_submission" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_cache_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_currency" varchar(3) NOT NULL,
	"to_currency" varchar(3) NOT NULL,
	"rate" numeric(10, 6) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"confidence_score" integer NOT NULL,
	"source_attribution" text NOT NULL,
	"source_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fallback_keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"input_variation" varchar NOT NULL,
	"normalized_model" varchar NOT NULL,
	"match_score" integer NOT NULL,
	"make" varchar,
	"category" varchar,
	"confidence_score" integer NOT NULL,
	"source_attribution" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"insight_id" text NOT NULL,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"topic" text NOT NULL,
	"post_date" timestamp NOT NULL,
	"post_content" text NOT NULL,
	"sentiment_score" numeric(5, 2),
	"source_forum" text,
	"reliability" text DEFAULT 'unverified',
	"upvotes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "forum_insights_insight_id_unique" UNIQUE("insight_id")
);
--> statement-breakpoint
CREATE TABLE "geographic_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"region_name" varchar(100) NOT NULL,
	"region_type" varchar(20) NOT NULL,
	"center_point" text,
	"boundary_polygon" text,
	"total_shops" integer NOT NULL,
	"average_rating" numeric(3, 2),
	"average_cost_per_service" numeric(10, 2),
	"competition_density" numeric(5, 2),
	"customer_demand_score" integer,
	"market_opportunity_score" integer,
	"population_density" integer,
	"average_income_level" integer,
	"target_demographics" jsonb,
	"seasonal_trends" jsonb,
	"growth_projection" numeric(5, 2),
	"last_analyzed" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "geographic_coverage" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"country_name" varchar NOT NULL,
	"has_shipping_data" boolean DEFAULT false,
	"has_compliance_data" boolean DEFAULT false,
	"has_vin_support" boolean DEFAULT false,
	"coverage_score" integer DEFAULT 0,
	"demand_priority" varchar DEFAULT 'medium',
	"last_data_update" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "geographic_coverage_country_code_unique" UNIQUE("country_code")
);
--> statement-breakpoint
CREATE TABLE "global_compliance_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"country" varchar NOT NULL,
	"region" varchar,
	"rule_type" varchar NOT NULL,
	"vehicle_category" varchar,
	"minimum_age_years" integer,
	"maximum_age_years" integer,
	"emission_standard" varchar,
	"safety_standard" varchar,
	"special_requirements" jsonb,
	"exemptions" jsonb,
	"compliance_cost" numeric(10, 2),
	"processing_time_weeks" integer,
	"is_active" boolean DEFAULT true,
	"effective_date" timestamp,
	"expiry_date" timestamp,
	"source_document" text,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "historic_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"listing_platform" text NOT NULL,
	"post_date" timestamp NOT NULL,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"vehicle_year" integer NOT NULL,
	"odometer_km" integer,
	"asking_price_usd" numeric(12, 2) NOT NULL,
	"condition_notes" text,
	"location_listed" text,
	"listing_duration" integer,
	"final_status" text,
	"final_price_usd" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "historic_listings_listing_id_unique" UNIQUE("listing_id")
);
--> statement-breakpoint
CREATE TABLE "hs_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"hs_code" text NOT NULL,
	"description" text NOT NULL,
	"vehicle_type_category" text,
	"duty_rate" numeric(5, 2),
	"effective_date" timestamp NOT NULL,
	"country" text NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hs_codes_hs_code_unique" UNIQUE("hs_code")
);
--> statement-breakpoint
CREATE TABLE "hts_tariff_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"hts_code" varchar(12) NOT NULL,
	"description" text NOT NULL,
	"duty_rate_percent" numeric(5, 2),
	"duty_rate_specific" varchar(100),
	"effective_date" date,
	"country_exceptions" jsonb,
	"vehicle_category" varchar(50),
	"engine_size_category" varchar(30),
	"value_threshold" numeric(12, 2),
	"additional_fees" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "hts_tariff_codes_hts_code_unique" UNIQUE("hts_code")
);
--> statement-breakpoint
CREATE TABLE "import_cost_calculations" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_data" jsonb,
	"destination" text,
	"vehicle_cost_aud" numeric(12, 2),
	"shipping_cost_aud" numeric(12, 2),
	"duties_and_taxes" numeric(12, 2),
	"compliance_costs" numeric(12, 2),
	"total_cost_aud" numeric(12, 2),
	"session_token" text,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_cost_structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"origin_country" varchar NOT NULL,
	"destination_country" varchar NOT NULL,
	"destination_region" varchar,
	"vehicle_type" varchar,
	"age_category" varchar,
	"duty_rate" numeric(5, 4),
	"gst_rate" numeric(5, 4),
	"luxury_tax_threshold" numeric(12, 2),
	"luxury_tax_rate" numeric(5, 4),
	"base_shipping_cost" numeric(10, 2),
	"inspection_fee" numeric(10, 2),
	"compliance_fee" numeric(10, 2),
	"registration_fee" numeric(10, 2),
	"brokerage_fee" numeric(10, 2),
	"storage_per_day" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'AUD',
	"effective_date" timestamp NOT NULL,
	"expiry_date" timestamp,
	"is_active" boolean DEFAULT true,
	"source_authority" text,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_intelligence_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_hash" varchar(64) NOT NULL,
	"destination" varchar(50) NOT NULL,
	"eligibility_data" jsonb NOT NULL,
	"cost_data" jsonb NOT NULL,
	"timeline_data" jsonb NOT NULL,
	"next_steps_data" jsonb NOT NULL,
	"alternatives_data" jsonb,
	"calculated_at" timestamp DEFAULT now(),
	"valid_until" timestamp
);
--> statement-breakpoint
CREATE TABLE "import_risk_assessment" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer,
	"destination" text NOT NULL,
	"regulatory_risk" jsonb,
	"market_risk" jsonb,
	"financial_risk" jsonb,
	"overall_risk_score" integer,
	"risk_category" varchar,
	"mitigation_strategies" text[],
	"contingency_budget" numeric(8, 2),
	"recommended_actions" text[],
	"last_assessed" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_name" varchar(200),
	"service_description" text,
	"typical_cost_min" numeric(10, 2),
	"typical_cost_max" numeric(10, 2),
	"typical_time_days" integer,
	"required_for_countries" jsonb
);
--> statement-breakpoint
CREATE TABLE "influencer_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"handle" varchar(100) NOT NULL,
	"avatar_url" varchar(500),
	"header_headline" varchar(200),
	"subheader" text,
	"brand_color" varchar(7) DEFAULT '#FFD700',
	"testimonial" text,
	"video_embed_url" varchar(500),
	"custom_cta" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "influencer_profiles_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "journey_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" integer,
	"saved_journey_id" integer,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"vehicle_make" text,
	"vehicle_model" text,
	"destination" text,
	"description" text,
	"importance" text DEFAULT 'medium',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legacy_vehicle_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" varchar NOT NULL,
	"model" varchar NOT NULL,
	"year" integer NOT NULL,
	"chassis" varchar,
	"engine" varchar,
	"displacement" varchar,
	"transmission" varchar,
	"drive_type" varchar,
	"fuel_type" varchar,
	"body_style" varchar,
	"doors" integer,
	"seats" integer,
	"weight" integer,
	"length" integer,
	"width" integer,
	"height" integer,
	"wheelbase" integer,
	"power" integer,
	"torque" integer,
	"emissions" varchar,
	"safety_rating" varchar,
	"production_start" timestamp,
	"production_end" timestamp,
	"market_regions" text[],
	"special_notes" text,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lookup_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"query_text" text NOT NULL,
	"lookup_method" varchar NOT NULL,
	"success_rate" numeric(8, 2),
	"average_confidence" numeric(8, 2),
	"common_failure_reasons" text[],
	"suggested_improvements" text[],
	"date_analyzed" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_clusters" (
	"id" serial PRIMARY KEY NOT NULL,
	"cluster_name" varchar(100) NOT NULL,
	"cluster_type" varchar(30) NOT NULL,
	"center_point" text,
	"coverage_area" text,
	"radius_km" numeric(6, 2),
	"shop_count" integer NOT NULL,
	"average_drive_time_minutes" integer,
	"market_saturation_score" numeric(3, 2),
	"service_gaps" jsonb,
	"expansion_opportunities" jsonb,
	"competitor_analysis" jsonb,
	"accessibility_score" integer,
	"economic_viability" numeric(3, 2),
	"partner_recruitment_priority" varchar(20),
	"last_analyzed" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_data_samples" (
	"id" serial PRIMARY KEY NOT NULL,
	"auction_site" varchar NOT NULL,
	"car_name" varchar NOT NULL,
	"vin" varchar(17),
	"price_usd" integer NOT NULL,
	"date_listed" timestamp NOT NULL,
	"url" text NOT NULL,
	"make" varchar,
	"model" varchar,
	"year" integer,
	"mileage" varchar,
	"condition" varchar,
	"location" varchar,
	"confidence_score" integer NOT NULL,
	"source_attribution" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_intelligence_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer,
	"average_price" numeric(12, 2),
	"price_variance" numeric(8, 2),
	"active_listings" integer,
	"market_trend" varchar,
	"import_volume" varchar,
	"best_import_window" text,
	"timing_insight" text,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mod_shop_deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_name" varchar NOT NULL,
	"discount" integer NOT NULL,
	"description" text NOT NULL,
	"code" varchar NOT NULL,
	"valid_until" timestamp NOT NULL,
	"category" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "mod_shop_deals_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "mod_shop_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" varchar(200) NOT NULL,
	"contact_person" varchar(100),
	"email" varchar(100),
	"phone" varchar(20),
	"website" varchar(300),
	"street_address" varchar(300),
	"city" varchar(100),
	"state_province" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(50),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"services_offered" jsonb,
	"specialties" jsonb,
	"certifications" jsonb,
	"years_in_business" integer,
	"customer_rating" numeric(3, 2),
	"review_count" integer,
	"average_cost_range" varchar(50),
	"typical_turnaround_days" integer,
	"verified_partner" boolean DEFAULT false,
	"last_verified" date,
	"partnership_status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mod_shop_partners_enhanced" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" varchar(200) NOT NULL,
	"owner_name" varchar(100),
	"email" varchar(255),
	"phone" varchar(50),
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"country" varchar(50) NOT NULL,
	"location" text,
	"service_area" text,
	"service_area_radius" numeric(6, 2),
	"specializations" text[],
	"certifications" jsonb,
	"year_established" integer,
	"employee_count" integer,
	"google_place_id" varchar(100),
	"google_rating" numeric(2, 1),
	"google_review_count" integer,
	"website_url" varchar(500),
	"social_media_profiles" jsonb,
	"operating_hours" jsonb,
	"service_capacity" jsonb,
	"average_job_duration" jsonb,
	"pricing_tier" varchar(20),
	"trust_score" numeric(3, 2),
	"partnership_level" varchar(20),
	"verification_status" varchar(20),
	"last_verification" timestamp,
	"competitive_advantages" text[],
	"unique_services" text[],
	"equipment_quality" varchar(20),
	"customer_satisfaction_score" numeric(3, 2),
	"response_time_minutes" integer,
	"emergency_services" boolean DEFAULT false,
	"mobile_services" boolean DEFAULT false,
	"pickup_delivery" boolean DEFAULT false,
	"warranty_offered" boolean DEFAULT false,
	"insurance_coverage" jsonb,
	"business_licenses" jsonb,
	"payment_methods" text[],
	"languages_spoken" text[],
	"accessibility_features" text[],
	"parking_availability" varchar(20),
	"public_transport_access" boolean DEFAULT false,
	"nearby_landmarks" text[],
	"market_position" varchar(20),
	"growth_trend" varchar(20),
	"partnership_status" varchar(20),
	"is_active" boolean DEFAULT true,
	"last_contact_date" timestamp,
	"next_review_date" timestamp,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mod_shop_partners_legacy" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"logo_url" varchar,
	"website" varchar,
	"discount_code" varchar,
	"discount_percent" integer,
	"location" varchar,
	"specialty" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modification_cost_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_tech_id" integer,
	"modification_stage" text NOT NULL,
	"stage_name" text NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"power_output" text NOT NULL,
	"torque_output" text,
	"expected_reliability" text,
	"time_to_complete" text,
	"recommended_parts" jsonb,
	"labor_costs" numeric(8, 2),
	"parts_costs" numeric(8, 2),
	"misc_costs" numeric(8, 2),
	"roi" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "optimal_routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_zip" varchar(10) NOT NULL,
	"customer_location" text,
	"vehicle_type" varchar(50) NOT NULL,
	"required_services" jsonb NOT NULL,
	"recommended_shop_id" integer NOT NULL,
	"total_drive_time_minutes" integer NOT NULL,
	"total_estimated_cost" numeric(10, 2) NOT NULL,
	"confidence_score" numeric(3, 2) NOT NULL,
	"route_polyline" text,
	"traffic_conditions" jsonb,
	"alternative_routes" jsonb,
	"road_quality" varchar(20),
	"weather_impact" jsonb,
	"last_calculated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parts_watchlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"part_name" varchar NOT NULL,
	"target_price" integer,
	"current_price" integer,
	"source" varchar,
	"source_url" varchar,
	"is_found" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pattern_staging" (
	"id" serial PRIMARY KEY NOT NULL,
	"suggested_pattern" text NOT NULL,
	"canonical_make" varchar,
	"canonical_model" varchar,
	"chassis_code" varchar,
	"confidence_estimate" integer,
	"source_context" text,
	"admin_status" varchar DEFAULT 'pending',
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"approved_by" varchar
);
--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_details" jsonb,
	"status" varchar(50) DEFAULT 'pending',
	"notes" text,
	"requested_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "popular_vehicle_modifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_tech_id" integer,
	"modification_name" text NOT NULL,
	"category" text NOT NULL,
	"estimated_cost" numeric(10, 2),
	"power_gain" text,
	"torque_gain" text,
	"difficulty_level" text,
	"popularity_rank" integer,
	"compatible_years" text,
	"brand_name" text,
	"part_number" text,
	"installation_time" text,
	"description" text,
	"warning_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "port_information" (
	"id" serial PRIMARY KEY NOT NULL,
	"port_code" varchar NOT NULL,
	"port_name" varchar NOT NULL,
	"country" varchar NOT NULL,
	"region" varchar,
	"city" varchar NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"port_authority" varchar,
	"website" varchar,
	"vehicle_terminal" boolean DEFAULT false,
	"roro_capable" boolean DEFAULT false,
	"container_capable" boolean DEFAULT false,
	"operating_hours" varchar,
	"vehicle_processing_capacity" integer,
	"average_processing_days" integer,
	"base_handling_fee" numeric(10, 2),
	"quarantine_inspection_fee" numeric(10, 2),
	"customs_processing_fee" numeric(10, 2),
	"storage_per_day" numeric(10, 2),
	"after_hours_fee" numeric(10, 2),
	"current_status" varchar,
	"average_wait_days" integer,
	"peak_seasons" jsonb,
	"monthly_vehicle_volume" integer,
	"congestion_factors" text[],
	"quarantine_strictness" varchar,
	"customs_complexity" varchar,
	"additional_requirements" text[],
	"recommended_agents" text[],
	"rail_connections" boolean DEFAULT false,
	"highway_access" varchar,
	"regions_served" text[],
	"best_for" text[],
	"challenges" text[],
	"tips" text[],
	"currency" varchar(3) DEFAULT 'AUD',
	"is_active" boolean DEFAULT true,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "port_information_port_code_unique" UNIQUE("port_code")
);
--> statement-breakpoint
CREATE TABLE "project_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"urgency" varchar NOT NULL,
	"service_type" varchar NOT NULL,
	"budget" text,
	"timeline" text,
	"message" text NOT NULL,
	"preferred_contact" varchar NOT NULL,
	"vehicle_info" jsonb,
	"destination" text NOT NULL,
	"status" varchar DEFAULT 'new',
	"assigned_to" text,
	"response_notes" text,
	"submitted_at" timestamp NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "public_auction_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" text NOT NULL,
	"auction_house_name" text NOT NULL,
	"sale_date" timestamp NOT NULL,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"vehicle_year" integer NOT NULL,
	"vin_partial" text,
	"odometer_km" integer,
	"condition_notes" text,
	"sold_price_usd" numeric(12, 2) NOT NULL,
	"auction_fees_usd" numeric(10, 2),
	"auction_location" text,
	"lot_number" text,
	"grade" text,
	"estimated_value" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "public_auction_sales_sale_id_unique" UNIQUE("sale_id")
);
--> statement-breakpoint
CREATE TABLE "recent_lookups" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" integer,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"chassis_code" text,
	"destination" text NOT NULL,
	"lookup_type" text DEFAULT 'smart_lookup',
	"result_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"referer" varchar(500),
	"clicked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"affiliate_id" integer NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"signup_source" varchar(100),
	"conversion_value" integer DEFAULT 0,
	"commission_earned" integer DEFAULT 0,
	"attribution_date" timestamp DEFAULT now(),
	"conversion_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "regional_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"region" text NOT NULL,
	"country" text NOT NULL,
	"year_month" text NOT NULL,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"registered_count" integer NOT NULL,
	"new_registrations" integer,
	"used_registrations" integer,
	"data_source" text,
	"reporting_period" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "regional_registrations_registration_id_unique" UNIQUE("registration_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"email" varchar NOT NULL,
	"report_type" varchar NOT NULL,
	"report_title" varchar NOT NULL,
	"report_data" jsonb NOT NULL,
	"email_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_journeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" integer,
	"journey_name" text NOT NULL,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"chassis_code" text,
	"vehicle_year" integer,
	"destination" text NOT NULL,
	"journey_data" jsonb NOT NULL,
	"ai_summary" text,
	"is_bookmarked" boolean DEFAULT true,
	"tags" text[],
	"progress" text DEFAULT 'planning',
	"estimated_completion" timestamp,
	"total_cost_estimate" integer,
	"currency" text DEFAULT 'AUD',
	"last_viewed" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"vehicle_data" jsonb NOT NULL,
	"search_query" text NOT NULL,
	"destination" text NOT NULL,
	"report_type" text DEFAULT 'lookup' NOT NULL,
	"is_bookmarked" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scraping_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar(100) NOT NULL,
	"data_type" varchar(50) NOT NULL,
	"raw_data" jsonb NOT NULL,
	"processed_data" jsonb,
	"quality_score" real,
	"is_valid" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"last_validated" timestamp
);
--> statement-breakpoint
CREATE TABLE "scraping_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" varchar(100) NOT NULL,
	"records_found" integer DEFAULT 0,
	"records_processed" integer DEFAULT 0,
	"success_rate" real,
	"average_quality_score" real,
	"execution_time" real,
	"errors" jsonb,
	"run_date" date DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer,
	"service_radius_miles" integer,
	"serves_state_province" varchar(100),
	"serves_metro_area" varchar(100),
	"mobile_service" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "session_memory" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" integer,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"total_lookups" integer DEFAULT 0,
	"favorite_destination" text,
	"preferred_vehicle_types" text[],
	"journey_stage" text DEFAULT 'exploring',
	"personalization_data" jsonb,
	"returning_user" boolean DEFAULT false,
	"first_visit" timestamp DEFAULT now(),
	"device_fingerprint" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_memory_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "shipping_routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"origin_country" varchar NOT NULL,
	"dest_country" varchar NOT NULL,
	"est_cost" integer NOT NULL,
	"est_days" integer NOT NULL,
	"route_name" varchar NOT NULL,
	"origin_port" varchar,
	"destination_port" varchar,
	"service_type" varchar,
	"confidence_score" integer NOT NULL,
	"source_attribution" text NOT NULL,
	"source_url" text,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shop_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" varchar(8),
	"close_time" varchar(8),
	"current_capacity_percent" integer,
	"max_daily_capacity" integer,
	"average_service_time" integer,
	"booking_lead_time_days" integer,
	"special_hours" jsonb,
	"emergency_available" boolean DEFAULT false,
	"rush_hour_impact" jsonb,
	"seasonal_adjustments" jsonb,
	"real_time_status" varchar(20),
	"last_status_update" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer,
	"customer_name" varchar(100),
	"rating" integer,
	"review_text" text,
	"service_type" varchar(100),
	"vehicle_type" varchar(100),
	"total_cost" numeric(10, 2),
	"review_date" date,
	"verified_customer" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "shop_service_capabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer,
	"service_id" integer,
	"certified" boolean DEFAULT false,
	"cost_override" numeric(10, 2),
	"turnaround_override" integer
);
--> statement-breakpoint
CREATE TABLE "shop_suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_name" varchar NOT NULL,
	"website" varchar,
	"location" varchar,
	"specialty" varchar,
	"suggested_by" varchar,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_parser_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"query_text" text NOT NULL,
	"lookup_type" varchar NOT NULL,
	"result_data" jsonb,
	"confidence_score" integer,
	"import_risk_index" integer,
	"user_intent" varchar,
	"source_attribution" text,
	"next_steps" text,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"email" text,
	"vehicle_price" numeric(10, 2) NOT NULL,
	"shipping_origin" text NOT NULL,
	"shipping" numeric(10, 2) NOT NULL,
	"customs_duty" numeric(10, 2) NOT NULL,
	"gst" numeric(10, 2) NOT NULL,
	"lct" numeric(10, 2) NOT NULL,
	"inspection" numeric(10, 2) NOT NULL,
	"service_fee" numeric(10, 2) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"service_tier" text NOT NULL,
	"zip_code" text,
	"vehicle_make" text,
	"vehicle_model" text,
	"vehicle_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"statistic_id" text NOT NULL,
	"reporting_country" text NOT NULL,
	"partner_country" text NOT NULL,
	"vehicle_category" text NOT NULL,
	"import_export_type" text NOT NULL,
	"volume" integer NOT NULL,
	"value_usd" numeric(15, 2) NOT NULL,
	"period_start_date" timestamp NOT NULL,
	"period_end_date" timestamp NOT NULL,
	"data_source" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trade_statistics_statistic_id_unique" UNIQUE("statistic_id")
);
--> statement-breakpoint
CREATE TABLE "trials" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text,
	"trial_start_date" timestamp DEFAULT now() NOT NULL,
	"trial_end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscription_status" text DEFAULT 'trial' NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"location_timestamp" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trials_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"badge_name" text NOT NULL,
	"badge_description" text,
	"earned_at" timestamp DEFAULT now(),
	"unlocked_feature" text
);
--> statement-breakpoint
CREATE TABLE "user_auth_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_auth_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "user_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_name" text NOT NULL,
	"vehicle_details" text NOT NULL,
	"calculation_results" text,
	"project_type" text NOT NULL,
	"status" text DEFAULT 'planning',
	"bookmarked" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" integer,
	"is_anonymous" boolean DEFAULT true,
	"ip_address" text,
	"user_agent" text,
	"country" text,
	"city" text,
	"last_activity" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"session_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "user_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"email" text,
	"vehicle_price" numeric(10, 2) NOT NULL,
	"shipping_origin" text NOT NULL,
	"shipping" numeric(10, 2) NOT NULL,
	"customs_duty" numeric(10, 2) NOT NULL,
	"gst" numeric(10, 2) NOT NULL,
	"lct" numeric(10, 2) NOT NULL,
	"inspection" numeric(10, 2) NOT NULL,
	"service_fee" numeric(10, 2) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"service_tier" text NOT NULL,
	"zip_code" text,
	"vehicle_make" text,
	"vehicle_model" text,
	"vehicle_year" integer,
	"session_id" text,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"plan" text NOT NULL,
	"status" text NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "user_watchlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" varchar,
	"vehicle_make" varchar NOT NULL,
	"vehicle_model" varchar NOT NULL,
	"vehicle_year" integer,
	"chassis_code" varchar,
	"eligibility_date" timestamp,
	"user_intent" varchar,
	"notification_prefs" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stripe_customer_id" text,
	"free_lookup_used" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_auction_changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"auction_id" integer NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"changed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_auctions" (
	"id" serial PRIMARY KEY NOT NULL,
	"apify_id" text,
	"category" text,
	"make" text,
	"model" text,
	"year" integer,
	"chassis_code" text,
	"engine" text,
	"transmission" text,
	"mileage" text,
	"fuel_type" text,
	"auction_end" timestamp,
	"price" numeric(12, 2),
	"location" text,
	"source" text,
	"source_url" text,
	"image_url" text,
	"description" text,
	"fetched_at" timestamp DEFAULT now(),
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "vehicle_auctions_apify_id_unique" UNIQUE("apify_id")
);
--> statement-breakpoint
CREATE TABLE "vehicle_builds" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"nickname" varchar NOT NULL,
	"chassis_code" varchar,
	"vin" varchar,
	"make" varchar,
	"model" varchar,
	"year" integer,
	"photos" text[],
	"mod_list" text[],
	"planned_upgrades" text[],
	"upgrade_eta" text[],
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_heads" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"chassis_code" text,
	"year_start" integer,
	"year_end" integer,
	"origin_country" text,
	"hero_status" text,
	"emotional_description" text,
	"import_difficulty" text,
	"typical_price_range" text,
	"key_appeal_factors" text[],
	"cultural_significance" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_hts_mapping" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_make" varchar(50) NOT NULL,
	"vehicle_model" varchar(100) NOT NULL,
	"engine_size_cc" integer,
	"year_min" integer,
	"year_max" integer,
	"hts_code" varchar(12),
	"mapping_confidence" real DEFAULT 1,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_import_eligibility" (
	"id" serial PRIMARY KEY NOT NULL,
	"vin" varchar(17),
	"make" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"usa_eligible" boolean DEFAULT false,
	"canada_eligible" boolean DEFAULT false,
	"usa_wait_until" date,
	"canada_requirements_id" integer,
	"hts_code" varchar(12),
	"calculated_duty_usd" numeric(10, 2),
	"calculated_duty_cad" numeric(10, 2),
	"total_import_cost_usd" numeric(10, 2),
	"total_import_cost_cad" numeric(10, 2),
	"confidence_score" real DEFAULT 0,
	"data_quality_score" real DEFAULT 0,
	"last_calculated" timestamp DEFAULT now(),
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_investment_intelligence" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_tech_id" integer,
	"current_market_value" numeric(12, 2),
	"five_year_appreciation" numeric(5, 2),
	"ten_year_appreciation" numeric(5, 2),
	"collectibility_rating" text,
	"liquidity_rating" text,
	"market_factors" jsonb,
	"risk_factors" jsonb,
	"investment_grade" text,
	"holding_recommendation" text,
	"selling_strategy" text,
	"last_market_analysis" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_journey_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"original_query" text NOT NULL,
	"parsed_data" jsonb NOT NULL,
	"confidence_score" integer,
	"current_destination" varchar,
	"current_step" varchar DEFAULT 'lookup',
	"journey_state" jsonb,
	"user_agent" text,
	"ip_address" varchar(45),
	"is_active" boolean DEFAULT true,
	"last_accessed" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vehicle_journey_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "vehicle_lookup_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"query_hash" varchar(64) NOT NULL,
	"original_query" text NOT NULL,
	"resolved_vehicle" jsonb NOT NULL,
	"lookup_type" varchar NOT NULL,
	"confidence_score" integer NOT NULL,
	"source_attribution" text,
	"valid_until" timestamp,
	"access_count" integer DEFAULT 1,
	"last_accessed" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "vehicle_lookup_cache_query_hash_unique" UNIQUE("query_hash")
);
--> statement-breakpoint
CREATE TABLE "vehicle_lookup_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"identifier_type" varchar NOT NULL,
	"result_data" jsonb,
	"user_ip" varchar,
	"user_agent" text,
	"confidence" integer,
	"data_source" varchar,
	"processing_time_ms" integer,
	"errors" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_model_patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"search_pattern" text NOT NULL,
	"canonical_make" varchar NOT NULL,
	"canonical_model" varchar NOT NULL,
	"chassis_code" varchar,
	"year_range_start" integer,
	"year_range_end" integer,
	"engine_pattern" varchar,
	"body_type" varchar,
	"confidence_score" integer DEFAULT 85,
	"source_attribution" text,
	"special_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_monitoring_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer,
	"alert_types" text[],
	"price_threshold" numeric(12, 2),
	"is_active" boolean DEFAULT true,
	"last_notified" timestamp,
	"notification_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_recalls" (
	"id" serial PRIMARY KEY NOT NULL,
	"recall_id" text NOT NULL,
	"issuing_authority" text NOT NULL,
	"recall_date" timestamp NOT NULL,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"vehicle_year_start" integer NOT NULL,
	"vehicle_year_end" integer,
	"defect_description" text NOT NULL,
	"remedy_description" text,
	"affected_vehicles" integer,
	"severity" text,
	"recall_status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_recalls_recall_id_unique" UNIQUE("recall_id")
);
--> statement-breakpoint
CREATE TABLE "vehicle_sourcing_intelligence" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer,
	"best_source_country" text,
	"availability_percentage" integer,
	"recommended_auction_houses" text[],
	"seasonal_recommendations" jsonb,
	"sourcing_strategy" text,
	"quality_rating" varchar,
	"value_rating" varchar,
	"pro_tips" text[],
	"last_analyzed" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_specifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"spec_id" text NOT NULL,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"vehicle_year_start" integer NOT NULL,
	"vehicle_year_end" integer,
	"engine_type" text,
	"engine_displacement_cc" integer,
	"horsepower_hp" integer,
	"transmission_type" text,
	"drive_type" text,
	"dimensions_length_mm" integer,
	"weight_kg" integer,
	"fuel_economy_l_100km" numeric(4, 2),
	"region_specific_notes" text,
	"data_source" text,
	"verification_status" text DEFAULT 'unverified',
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_specifications_spec_id_unique" UNIQUE("spec_id")
);
--> statement-breakpoint
CREATE TABLE "vehicle_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"vin" varchar(17),
	"chassis_code" varchar(50),
	"make" varchar NOT NULL,
	"model" varchar NOT NULL,
	"year" integer NOT NULL,
	"engine" varchar,
	"country_of_origin" varchar NOT NULL,
	"body_type" varchar,
	"confidence_score" integer NOT NULL,
	"source_attribution" text NOT NULL,
	"source_url" text,
	"last_verified" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vehicle_specs_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE "vehicle_technical_intelligence" (
	"id" serial PRIMARY KEY NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"chassis_code" text,
	"year" integer,
	"engine_code" text NOT NULL,
	"engine_type" text NOT NULL,
	"displacement" text NOT NULL,
	"power" text NOT NULL,
	"torque" text NOT NULL,
	"compression" text,
	"configuration" text,
	"drivetrain_type" text NOT NULL,
	"transmission" text NOT NULL,
	"differential" text,
	"rarity_factor" text,
	"collectibility_score" integer,
	"production_numbers" integer,
	"appreciation_rate" numeric(5, 2),
	"market_segment" text,
	"technical_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_watchlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" integer,
	"vehicle_make" text NOT NULL,
	"vehicle_model" text NOT NULL,
	"chassis_code" text,
	"destination" text NOT NULL,
	"watch_type" text NOT NULL,
	"alert_threshold" integer,
	"current_status" text,
	"last_checked" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"alert_frequency" text DEFAULT 'weekly',
	"contact_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vin_patterns_legacy" (
	"id" serial PRIMARY KEY NOT NULL,
	"wmi_code" varchar(10) NOT NULL,
	"manufacturer" varchar NOT NULL,
	"country" varchar NOT NULL,
	"country_code" varchar(3) NOT NULL,
	"vehicle_type" varchar NOT NULL,
	"confidence" integer NOT NULL,
	"source" text NOT NULL,
	"source_url" text,
	"last_verified" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"document_name" varchar(200) NOT NULL,
	"document_description" text,
	"original_required" boolean DEFAULT false,
	"notarization_required" boolean DEFAULT false,
	"translation_required" boolean DEFAULT false,
	"apostille_required" boolean DEFAULT false,
	"validity_period_days" integer,
	"issuing_authority" varchar(200)
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"field_name" varchar(100) NOT NULL,
	"field_type" varchar(50) NOT NULL,
	"required" boolean DEFAULT false,
	"description" text,
	"example_value" varchar(200),
	"validation_rules" jsonb
);
--> statement-breakpoint
CREATE TABLE "form_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"verification_date" date NOT NULL,
	"verification_status" varchar(20) NOT NULL,
	"changes" text,
	"verified_by" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "import_processes" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"step_name" varchar(200) NOT NULL,
	"step_description" text,
	"required_forms" jsonb,
	"estimated_time_days" integer,
	"cost_estimate" jsonb,
	"dependencies" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "anonymous_sessions" ADD CONSTRAINT "anonymous_sessions_current_journey_session_id_vehicle_journey_sessions_id_fk" FOREIGN KEY ("current_journey_session_id") REFERENCES "public"."vehicle_journey_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_vin_jobs" ADD CONSTRAINT "bulk_vin_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_forms" ADD CONSTRAINT "compliance_forms_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copart_price_history" ADD CONSTRAINT "copart_price_history_vehicle_id_copart_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."copart_vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copart_price_history" ADD CONSTRAINT "copart_price_history_lot_number_copart_vehicles_lot_number_fk" FOREIGN KEY ("lot_number") REFERENCES "public"."copart_vehicles"("lot_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csv_import_jobs" ADD CONSTRAINT "csv_import_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "influencer_profiles" ADD CONSTRAINT "influencer_profiles_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_events" ADD CONSTRAINT "journey_events_saved_journey_id_saved_journeys_id_fk" FOREIGN KEY ("saved_journey_id") REFERENCES "public"."saved_journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modification_cost_analysis" ADD CONSTRAINT "modification_cost_analysis_vehicle_tech_id_vehicle_technical_intelligence_id_fk" FOREIGN KEY ("vehicle_tech_id") REFERENCES "public"."vehicle_technical_intelligence"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "popular_vehicle_modifications" ADD CONSTRAINT "popular_vehicle_modifications_vehicle_tech_id_vehicle_technical_intelligence_id_fk" FOREIGN KEY ("vehicle_tech_id") REFERENCES "public"."vehicle_technical_intelligence"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_clicks" ADD CONSTRAINT "referral_clicks_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_signups" ADD CONSTRAINT "referral_signups_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_areas" ADD CONSTRAINT "service_areas_shop_id_mod_shop_partners_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."mod_shop_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_reviews" ADD CONSTRAINT "shop_reviews_shop_id_mod_shop_partners_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."mod_shop_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_service_capabilities" ADD CONSTRAINT "shop_service_capabilities_shop_id_mod_shop_partners_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."mod_shop_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_service_capabilities" ADD CONSTRAINT "shop_service_capabilities_service_id_import_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."import_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_auth_sessions" ADD CONSTRAINT "user_auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_auction_changes" ADD CONSTRAINT "vehicle_auction_changes_auction_id_vehicle_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."vehicle_auctions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_hts_mapping" ADD CONSTRAINT "vehicle_hts_mapping_hts_code_hts_tariff_codes_hts_code_fk" FOREIGN KEY ("hts_code") REFERENCES "public"."hts_tariff_codes"("hts_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_import_eligibility" ADD CONSTRAINT "vehicle_import_eligibility_canada_requirements_id_cbsa_import_requirements_id_fk" FOREIGN KEY ("canada_requirements_id") REFERENCES "public"."cbsa_import_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_import_eligibility" ADD CONSTRAINT "vehicle_import_eligibility_hts_code_hts_tariff_codes_hts_code_fk" FOREIGN KEY ("hts_code") REFERENCES "public"."hts_tariff_codes"("hts_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_investment_intelligence" ADD CONSTRAINT "vehicle_investment_intelligence_vehicle_tech_id_vehicle_technical_intelligence_id_fk" FOREIGN KEY ("vehicle_tech_id") REFERENCES "public"."vehicle_technical_intelligence"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_compliance_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."compliance_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_verifications" ADD CONSTRAINT "form_verifications_form_id_compliance_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."compliance_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_processes" ADD CONSTRAINT "import_processes_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anonymous_sessions_id_idx" ON "anonymous_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "anonymous_sessions_fingerprint_idx" ON "anonymous_sessions" USING btree ("user_fingerprint");--> statement-breakpoint
CREATE INDEX "anonymous_sessions_active_idx" ON "anonymous_sessions" USING btree ("is_active","last_seen");--> statement-breakpoint
CREATE INDEX "source_site_idx" ON "auction_listings" USING btree ("source_site");--> statement-breakpoint
CREATE INDEX "make_model_idx" ON "auction_listings" USING btree ("make","model");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "auction_listings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auction_id_idx" ON "auction_listings" USING btree ("auction_id");--> statement-breakpoint
CREATE INDEX "compliance_forms_country_idx" ON "compliance_forms" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "compliance_forms_form_code_idx" ON "compliance_forms" USING btree ("form_code");--> statement-breakpoint
CREATE INDEX "compliance_forms_mandatory_idx" ON "compliance_forms" USING btree ("mandatory");--> statement-breakpoint
CREATE INDEX "geographic_analytics_region_name_idx" ON "geographic_analytics" USING btree ("region_name");--> statement-breakpoint
CREATE INDEX "geographic_analytics_region_type_idx" ON "geographic_analytics" USING btree ("region_type");--> statement-breakpoint
CREATE INDEX "geographic_analytics_opportunity_idx" ON "geographic_analytics" USING btree ("market_opportunity_score");--> statement-breakpoint
CREATE INDEX "geographic_analytics_demand_idx" ON "geographic_analytics" USING btree ("customer_demand_score");--> statement-breakpoint
CREATE INDEX "import_intelligence_vehicle_dest_idx" ON "import_intelligence_cache" USING btree ("vehicle_hash","destination");--> statement-breakpoint
CREATE INDEX "import_intelligence_valid_idx" ON "import_intelligence_cache" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "journey_events_session_idx" ON "journey_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "journey_events_user_idx" ON "journey_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "journey_events_saved_journey_idx" ON "journey_events" USING btree ("saved_journey_id");--> statement-breakpoint
CREATE INDEX "journey_events_event_type_idx" ON "journey_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "journey_events_created_at_idx" ON "journey_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "market_clusters_cluster_name_idx" ON "market_clusters" USING btree ("cluster_name");--> statement-breakpoint
CREATE INDEX "market_clusters_cluster_type_idx" ON "market_clusters" USING btree ("cluster_type");--> statement-breakpoint
CREATE INDEX "market_clusters_saturation_idx" ON "market_clusters" USING btree ("market_saturation_score");--> statement-breakpoint
CREATE INDEX "market_clusters_priority_idx" ON "market_clusters" USING btree ("partner_recruitment_priority");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_business_name_idx" ON "mod_shop_partners_enhanced" USING btree ("business_name");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_city_idx" ON "mod_shop_partners_enhanced" USING btree ("city");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_state_idx" ON "mod_shop_partners_enhanced" USING btree ("state");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_country_idx" ON "mod_shop_partners_enhanced" USING btree ("country");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_specializations_idx" ON "mod_shop_partners_enhanced" USING btree ("specializations");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_google_place_idx" ON "mod_shop_partners_enhanced" USING btree ("google_place_id");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_trust_score_idx" ON "mod_shop_partners_enhanced" USING btree ("trust_score");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_partnership_level_idx" ON "mod_shop_partners_enhanced" USING btree ("partnership_level");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_verification_idx" ON "mod_shop_partners_enhanced" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "mod_shop_partners_enhanced_active_idx" ON "mod_shop_partners_enhanced" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "optimal_routes_customer_zip_idx" ON "optimal_routes" USING btree ("customer_zip");--> statement-breakpoint
CREATE INDEX "optimal_routes_vehicle_type_idx" ON "optimal_routes" USING btree ("vehicle_type");--> statement-breakpoint
CREATE INDEX "optimal_routes_shop_idx" ON "optimal_routes" USING btree ("recommended_shop_id");--> statement-breakpoint
CREATE INDEX "optimal_routes_confidence_idx" ON "optimal_routes" USING btree ("confidence_score");--> statement-breakpoint
CREATE INDEX "recent_lookups_session_idx" ON "recent_lookups" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "recent_lookups_user_idx" ON "recent_lookups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recent_lookups_created_at_idx" ON "recent_lookups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "saved_journeys_session_idx" ON "saved_journeys" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "saved_journeys_user_idx" ON "saved_journeys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_journeys_progress_idx" ON "saved_journeys" USING btree ("progress");--> statement-breakpoint
CREATE INDEX "saved_journeys_last_viewed_idx" ON "saved_journeys" USING btree ("last_viewed");--> statement-breakpoint
CREATE INDEX "session_memory_session_id_idx" ON "session_memory" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_memory_user_idx" ON "session_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_memory_last_activity_idx" ON "session_memory" USING btree ("last_activity");--> statement-breakpoint
CREATE INDEX "shop_availability_shop_id_idx" ON "shop_availability" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "shop_availability_day_of_week_idx" ON "shop_availability" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "shop_availability_capacity_idx" ON "shop_availability" USING btree ("current_capacity_percent");--> statement-breakpoint
CREATE INDEX "shop_availability_status_idx" ON "shop_availability" USING btree ("real_time_status");--> statement-breakpoint
CREATE INDEX "session_id_idx" ON "user_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "last_activity_idx" ON "user_sessions" USING btree ("last_activity");--> statement-breakpoint
CREATE INDEX "vehicle_auction_changes_auction_id_idx" ON "vehicle_auction_changes" USING btree ("auction_id");--> statement-breakpoint
CREATE INDEX "vehicle_auction_changes_changed_at_idx" ON "vehicle_auction_changes" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "vehicle_auctions_apify_id_idx" ON "vehicle_auctions" USING btree ("apify_id");--> statement-breakpoint
CREATE INDEX "vehicle_auctions_category_idx" ON "vehicle_auctions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "vehicle_auctions_make_model_idx" ON "vehicle_auctions" USING btree ("make","model");--> statement-breakpoint
CREATE INDEX "vehicle_auctions_price_idx" ON "vehicle_auctions" USING btree ("price");--> statement-breakpoint
CREATE INDEX "vehicle_auctions_fetched_at_idx" ON "vehicle_auctions" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX "vehicle_journey_sessions_token_idx" ON "vehicle_journey_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "vehicle_journey_sessions_active_idx" ON "vehicle_journey_sessions" USING btree ("is_active","last_accessed");--> statement-breakpoint
CREATE INDEX "vehicle_lookup_cache_hash_idx" ON "vehicle_lookup_cache" USING btree ("query_hash");--> statement-breakpoint
CREATE INDEX "vehicle_lookup_cache_valid_idx" ON "vehicle_lookup_cache" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "vehicle_watchlist_session_idx" ON "vehicle_watchlist" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "vehicle_watchlist_user_idx" ON "vehicle_watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vehicle_watchlist_watch_type_idx" ON "vehicle_watchlist" USING btree ("watch_type");--> statement-breakpoint
CREATE INDEX "vehicle_watchlist_is_active_idx" ON "vehicle_watchlist" USING btree ("is_active");