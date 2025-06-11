# ImportIQ Production Setup Guide

## Overview
ImportIQ is now production-ready with full PostgreSQL persistence, automated background jobs, and comprehensive data migration from JSON to database storage.

## Key Features Completed
- ✅ Full PostgreSQL migration from JSON storage
- ✅ Background job service for exchange rates and cache management
- ✅ Production routing structure (/, /dashboard, /pricing, /checkout)
- ✅ Stripe integration for subscription billing
- ✅ Automated data seeding and migration on startup
- ✅ Real-time currency conversion and government duty calculations

## Environment Setup

### Required Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database - Required
DATABASE_URL=postgresql://username:password@localhost:5432/importiq
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=importiq

# Authentication - Required
SESSION_SECRET=your-64-character-random-string
REPL_ID=your-replit-app-id
REPLIT_DOMAINS=your-domain.replit.app

# Payment Processing - Required for subscriptions
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=pk_live_your-stripe-public-key
STRIPE_PRICE_ID=price_your-subscription-price-id

# External APIs - Optional but recommended
GOOGLE_MAPS_API_KEY=AIza-your-google-maps-api-key
OPENAI_API_KEY=sk-your-openai-api-key
```

## Deployment Process

### 1. Database Migration
The system automatically migrates existing JSON data to PostgreSQL on startup:
- `submissions.json` → `user_quotes` table
- `live-market-data.json` → PostgreSQL tables
- Background jobs handle ongoing data management

### 2. Background Services
Automated jobs run in production:
- Exchange rates update every 6 hours
- Session cleanup every hour
- Cache cleanup every 24 hours
- Daily lookup counter resets

### 3. Subscription Tiers
- **Free**: Limited lookups, basic features
- **Starter ($29/month)**: Enhanced features, more lookups
- **Pro ($99/month)**: Full feature access, unlimited lookups

## API Endpoints

### Core Routes
- `GET /` - Homepage
- `GET /dashboard` - User dashboard (authenticated)
- `GET /pricing` - Subscription plans
- `GET /checkout` - Payment processing

### API Routes
- `POST /api/calculate` - Import cost calculations
- `GET /api/user-quotes` - User's saved quotes
- `POST /api/lookup` - Vehicle lookup and intelligence
- `POST /api/create-payment-intent` - Stripe payment processing

## Data Sources
All cost calculations use official government sources:
- Currency rates from Reserve Bank of Australia
- Customs duties from official tariff databases
- Shipping costs from authenticated port authorities
- Compliance data from government import agencies

## Authentication
Uses Replit Auth with PostgreSQL session storage:
- OAuth integration with Google, GitHub, Apple
- Secure session management
- User subscription tracking

## Monitoring & Maintenance
- Background job status logging
- Database performance monitoring
- Exchange rate update tracking
- Session and cache cleanup automation

## Demo Access
- Email: demo@importiq.com
- Password: demo123

## Technical Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth + OpenID Connect
- **Payments**: Stripe
- **Background Jobs**: Custom job scheduler
- **External APIs**: Google Maps, official government sources