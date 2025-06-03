import { users, submissions, aiRecommendations, emailCache, trials, userProjects, userAchievements, carEvents, reports, bookings, affiliates, influencerProfiles, referralClicks, referralSignups, payoutRequests, vehicleBuilds, modShopPartners, modShopDeals, partsWatchlist, adminUsers, adminSessions, deposits, chatInteractions, chatProfiles, auctionListings, dataIngestionLogs, type User, type InsertUser, type Submission, type InsertSubmission, type Booking, type InsertBooking, type Affiliate, type InsertAffiliate, type InfluencerProfile, type InsertInfluencerProfile, type ReferralClick, type InsertReferralClick, type ReferralSignup, type InsertReferralSignup, type PayoutRequest, type InsertPayoutRequest, type VehicleBuild, type InsertVehicleBuild, type ModShopPartner, type InsertModShopPartner, type ModShopDeal, type InsertModShopDeal, type PartsWatchlistItem, type InsertPartsWatchlistItem, type AdminUser, type InsertAdminUser, type AdminSession, type InsertAdminSession, type Deposit, type InsertDeposit, type ChatInteraction, type InsertChatInteraction, type ChatProfile, type InsertChatProfile, type AuctionListing, type InsertAuctionListing, type DataIngestionLog, type InsertDataIngestionLog } from "@shared/schema";
import { db } from "./db";
import { eq, lt, desc, and, gte } from "drizzle-orm";
import fs from 'fs';
import path from 'path';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: any): Promise<User>;
  createSubmission(submission: Omit<Submission, 'id' | 'createdAt'>): Promise<Submission>;
  getAllSubmissions(): Promise<Submission[]>;
  createAIRecommendation(recommendation: Omit<any, 'id' | 'createdAt'>): Promise<any>;
  getAllAIRecommendations(): Promise<any[]>;
  checkEmailExists(email: string): Promise<boolean>;
  updateEmailCache(email: string, name: string): Promise<void>;
  getEmailInfo(email: string): Promise<{ name: string; submissionCount: number } | null>;
  createTrial(email: string, name: string, passwordHash?: string): Promise<any>;
  getTrialStatus(email: string): Promise<{ isActive: boolean; daysRemaining: number; status: string } | null>;
  getPasswordHash(email: string): Promise<string | null>;
  updateTrialName(email: string, name: string): Promise<void>;
  updateTrialEmail(currentEmail: string, newEmail: string): Promise<void>;
  updateTrialPassword(email: string, passwordHash: string): Promise<void>;
  updateTrialPhoto(email: string, photoUrl: string): Promise<void>;
  updateUserLocation(email: string, location: { latitude: number; longitude: number; timestamp: string }): Promise<void>;
  getAllEmailCache(): Promise<any[]>;
  getAllTrials(): Promise<any[]>;
  createUserProject(userId: string, project: any): Promise<any>;
  getUserProjects(userId: string): Promise<any[]>;
  awardBadge(userId: string, badgeId: string, badgeName: string): Promise<void>;
  getUserAchievements(userId: string): Promise<any[]>;
  getNearbyCarEvents(postcode: string): Promise<any[]>;
  saveReport(reportData: any): Promise<any>;
  getUserReports(email: string): Promise<any[]>;
  createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
  // Deposit Management Methods
  createDeposit(deposit: Omit<InsertDeposit, 'id'>): Promise<Deposit>;
  getAllDeposits(): Promise<Deposit[]>;
  getDepositById(id: number): Promise<Deposit | undefined>;
  
  // Affiliate System Methods
  createAffiliate(affiliate: Omit<InsertAffiliate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Affiliate>;
  getAffiliate(id: number): Promise<Affiliate | undefined>;
  getAffiliateByEmail(email: string): Promise<Affiliate | undefined>;
  getAffiliateByReferralCode(code: string): Promise<Affiliate | undefined>;
  getAllAffiliates(): Promise<Affiliate[]>;
  updateAffiliate(id: number, updates: Partial<Affiliate>): Promise<Affiliate>;
  
  createInfluencerProfile(profile: Omit<InsertInfluencerProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<InfluencerProfile>;
  getInfluencerProfile(affiliateId: number): Promise<InfluencerProfile | undefined>;
  getInfluencerProfileByHandle(handle: string): Promise<InfluencerProfile | undefined>;
  updateInfluencerProfile(id: number, updates: Partial<InfluencerProfile>): Promise<InfluencerProfile>;
  
  trackReferralClick(click: Omit<InsertReferralClick, 'id' | 'clickedAt'>): Promise<ReferralClick>;
  createReferralSignup(signup: Omit<InsertReferralSignup, 'id' | 'attributionDate'>): Promise<ReferralSignup>;
  getReferralStats(affiliateId: number): Promise<{ clicks: number; signups: number; earnings: number }>;
  
  createPayoutRequest(request: Omit<InsertPayoutRequest, 'id' | 'requestedAt'>): Promise<PayoutRequest>;
  getPayoutRequests(affiliateId?: number): Promise<PayoutRequest[]>;
  updatePayoutRequest(id: number, updates: Partial<PayoutRequest>): Promise<PayoutRequest>;
  
  // Vehicle Builds (My Build Garage)
  createVehicleBuild(build: Omit<InsertVehicleBuild, 'id' | 'createdAt' | 'updatedAt'>): Promise<VehicleBuild>;
  getUserVehicleBuilds(userId: string): Promise<VehicleBuild[]>;
  updateVehicleBuild(id: number, updates: Partial<VehicleBuild>): Promise<VehicleBuild>;
  deleteVehicleBuild(id: number): Promise<void>;
  
  // Mod Shop Partners
  getModShopPartners(): Promise<ModShopPartner[]>;
  createModShopPartner(partner: Omit<InsertModShopPartner, 'id' | 'createdAt'>): Promise<ModShopPartner>;
  
  // Car Events
  getCarEventsByState(state: string): Promise<any[]>;
  getUpcomingCarEvents(): Promise<any[]>;
  
  // Parts Watchlist
  createWatchlistItem(item: Omit<InsertPartsWatchlistItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PartsWatchlistItem>;
  getUserWatchlist(userId: string): Promise<PartsWatchlistItem[]>;
  updateWatchlistItem(id: number, updates: Partial<PartsWatchlistItem>): Promise<PartsWatchlistItem>;
  deleteWatchlistItem(id: number): Promise<void>;
  
  // Shop Suggestions
  createShopSuggestion(suggestion: Omit<any, 'id' | 'createdAt'>): Promise<any>;

  // Auction Data Management
  createAuctionListing(listing: Omit<InsertAuctionListing, 'id'>): Promise<AuctionListing>;
  getAuctionListings(filters: { make?: string; model?: string; sourceSite?: string; limit: number; offset: number }): Promise<AuctionListing[]>;
  createDataIngestionLog(log: Omit<InsertDataIngestionLog, 'id'>): Promise<DataIngestionLog>;
  getDataIngestionLogs(limit: number): Promise<DataIngestionLog[]>;

  // Admin user management
  createAdminUser(admin: Omit<InsertAdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser>;
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  updateAdminUserLastLogin(id: number): Promise<void>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser>;
  deactivateAdminUser(id: number): Promise<void>;
  createAdminSession(session: Omit<InsertAdminSession, 'id' | 'createdAt'>): Promise<AdminSession>;
  getAdminSession(token: string): Promise<AdminSession | undefined>;
  deleteAdminSession(token: string): Promise<void>;
  cleanExpiredAdminSessions(): Promise<void>;

  // New tool storage methods
  storeTrueCostCalculation(data: any): Promise<any>;
  storeExpertPicksUsage(data: any): Promise<any>;
  storeModCostEstimate(data: any): Promise<any>;
  storeRegistrationStatsLookup(data: any): Promise<any>;
  storeImportVolumeView(data: any): Promise<any>;

  // Chat interaction tracking methods
  createChatInteraction(interaction: Omit<InsertChatInteraction, 'id' | 'createdAt'>): Promise<ChatInteraction>;
  getChatProfile(userIdentifier: string): Promise<ChatProfile | undefined>;
  updateChatProfile(userIdentifier: string, updates: { totalInteractions?: number; lastInteractionDate?: Date; toolContext?: string; topicCategory?: string }): Promise<ChatProfile>;
  createChatProfile(profile: Omit<InsertChatProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatProfile>;

  // Auction Data Ingestion Methods
  createAuctionListing(listing: Omit<InsertAuctionListing, 'id' | 'createdAt' | 'lastUpdated'>): Promise<AuctionListing>;
  getAuctionListings(filters?: { make?: string; model?: string; sourceSite?: string; limit?: number; offset?: number }): Promise<AuctionListing[]>;
  getAuctionListingById(id: number): Promise<AuctionListing | undefined>;
  updateAuctionListing(id: number, updates: Partial<AuctionListing>): Promise<AuctionListing>;
  deleteAuctionListing(id: number): Promise<void>;
  createDataIngestionLog(log: Omit<InsertDataIngestionLog, 'id' | 'createdAt'>): Promise<DataIngestionLog>;
  getDataIngestionLogs(limit?: number): Promise<DataIngestionLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSubmission(submissionData: Omit<Submission, 'id' | 'createdAt'>): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(submissionData)
      .returning();
    return submission;
  }

  async createAIRecommendation(recommendationData: Omit<any, 'id' | 'createdAt'>): Promise<any> {
    const [recommendation] = await db
      .insert(aiRecommendations)
      .values(recommendationData)
      .returning();
    return recommendation;
  }

  async getAllAIRecommendations(): Promise<any[]> {
    return await db.select().from(aiRecommendations).orderBy(aiRecommendations.createdAt);
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const [cached] = await db.select().from(emailCache).where(eq(emailCache.email, email));
    return !!cached;
  }

  async updateEmailCache(email: string, name: string): Promise<void> {
    const existing = await db.select().from(emailCache).where(eq(emailCache.email, email));
    
    if (existing.length > 0) {
      await db
        .update(emailCache)
        .set({ 
          submissionCount: existing[0].submissionCount + 1,
          lastSubmission: new Date()
        })
        .where(eq(emailCache.email, email));
    } else {
      await db.insert(emailCache).values({
        email,
        name,
        submissionCount: 1,
        lastSubmission: new Date()
      });
    }
  }

  async getEmailInfo(email: string): Promise<{ name: string; submissionCount: number } | null> {
    const [cached] = await db.select().from(emailCache).where(eq(emailCache.email, email));
    return cached ? { name: cached.name, submissionCount: cached.submissionCount } : null;
  }

  async createTrial(email: string, name: string, passwordHash?: string): Promise<any> {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

    const [trial] = await db
      .insert(trials)
      .values({
        email,
        name,
        passwordHash,
        trialEndDate,
        isActive: true,
        subscriptionStatus: "trial"
      })
      .onConflictDoUpdate({
        target: trials.email,
        set: {
          name,
          passwordHash,
          trialEndDate,
          isActive: true,
          subscriptionStatus: "trial"
        }
      })
      .returning();
    return trial;
  }

  async getTrialStatus(email: string): Promise<{ isActive: boolean; daysRemaining: number; status: string } | null> {
    const [trial] = await db.select().from(trials).where(eq(trials.email, email));
    
    if (!trial) return null;

    const now = new Date();
    const endDate = new Date(trial.trialEndDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      isActive: trial.isActive && daysRemaining > 0,
      daysRemaining,
      status: trial.subscriptionStatus
    };
  }

  async getPasswordHash(email: string): Promise<string | null> {
    const [trial] = await db.select().from(trials).where(eq(trials.email, email));
    return trial?.passwordHash || null;
  }

  async getAllEmailCache(): Promise<any[]> {
    return await db.select().from(emailCache);
  }

  async getAllTrials(): Promise<any[]> {
    return await db.select().from(trials);
  }

  async updateTrialName(email: string, name: string): Promise<void> {
    await db.update(trials)
      .set({ name })
      .where(eq(trials.email, email));
  }

  async updateTrialEmail(currentEmail: string, newEmail: string): Promise<void> {
    await db.update(trials)
      .set({ email: newEmail })
      .where(eq(trials.email, currentEmail));
  }

  async updateTrialPassword(email: string, passwordHash: string): Promise<void> {
    await db.update(trials)
      .set({ passwordHash })
      .where(eq(trials.email, email));
  }

  async updateTrialPhoto(email: string, photoUrl: string): Promise<void> {
    // For now, we'll store photo URLs as part of user data
    // In a production system, you might want a separate user_profiles table
    console.log(`Photo updated for ${email}: ${photoUrl}`);
  }

  async updateUserLocation(email: string, location: { latitude: number; longitude: number; timestamp: string }): Promise<void> {
    await db.update(trials)
      .set({ 
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        locationTimestamp: new Date(location.timestamp)
      })
      .where(eq(trials.email, email));
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions);
  }

  async saveReport(reportData: any): Promise<any> {
    const [report] = await db
      .insert(reports)
      .values(reportData)
      .returning();
    return report;
  }

  async getUserReports(email: string): Promise<any[]> {
    return await db.select().from(reports).where(eq(reports.email, email));
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(bookings.createdAt);
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Stub implementations for missing methods
  async upsertUser(user: any): Promise<User> {
    // Implementation needed for auth
    return user;
  }

  async createUserProject(userId: string, project: any): Promise<any> {
    return project;
  }

  async getUserProjects(userId: string): Promise<any[]> {
    return [];
  }

  async awardBadge(userId: string, badgeId: string, badgeName: string): Promise<void> {
    // Badge implementation
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    return [];
  }

  async getNearbyCarEvents(postcode: string): Promise<any[]> {
    return [];
  }

  // Affiliate System Implementation
  async createAffiliate(affiliateData: Omit<InsertAffiliate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Affiliate> {
    const referralCode = this.generateReferralCode();
    const [affiliate] = await db
      .insert(affiliates)
      .values({
        ...affiliateData,
        referralCode,
      })
      .returning();
    return affiliate;
  }

  async getAffiliate(id: number): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate;
  }

  async getAffiliateByEmail(email: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.email, email));
    return affiliate;
  }

  async getAffiliateByReferralCode(code: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.referralCode, code));
    return affiliate;
  }

  async getAllAffiliates(): Promise<Affiliate[]> {
    return await db.select().from(affiliates).orderBy(affiliates.createdAt);
  }

  async updateAffiliate(id: number, updates: Partial<Affiliate>): Promise<Affiliate> {
    const [affiliate] = await db
      .update(affiliates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(affiliates.id, id))
      .returning();
    return affiliate;
  }

  async createInfluencerProfile(profileData: Omit<InsertInfluencerProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<InfluencerProfile> {
    const [profile] = await db
      .insert(influencerProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async getInfluencerProfile(affiliateId: number): Promise<InfluencerProfile | undefined> {
    const [profile] = await db.select().from(influencerProfiles).where(eq(influencerProfiles.affiliateId, affiliateId));
    return profile;
  }

  async getInfluencerProfileByHandle(handle: string): Promise<InfluencerProfile | undefined> {
    const [profile] = await db.select().from(influencerProfiles).where(eq(influencerProfiles.handle, handle));
    return profile;
  }

  async updateInfluencerProfile(id: number, updates: Partial<InfluencerProfile>): Promise<InfluencerProfile> {
    const [profile] = await db
      .update(influencerProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(influencerProfiles.id, id))
      .returning();
    return profile;
  }

  async trackReferralClick(clickData: Omit<InsertReferralClick, 'id' | 'clickedAt'>): Promise<ReferralClick> {
    const [click] = await db
      .insert(referralClicks)
      .values(clickData)
      .returning();
    
    // Update affiliate click count
    await db
      .update(affiliates)
      .set({ 
        totalClicks: affiliates.totalClicks + 1,
        updatedAt: new Date() 
      })
      .where(eq(affiliates.id, clickData.affiliateId));
    
    return click;
  }

  async createReferralSignup(signupData: Omit<InsertReferralSignup, 'id' | 'attributionDate'>): Promise<ReferralSignup> {
    const [signup] = await db
      .insert(referralSignups)
      .values(signupData)
      .returning();
    
    // Update affiliate signup count and earnings
    await db
      .update(affiliates)
      .set({ 
        totalSignups: affiliates.totalSignups + 1,
        totalEarnings: affiliates.totalEarnings + (signupData.commissionEarned || 0),
        currentBalance: affiliates.currentBalance + (signupData.commissionEarned || 0),
        updatedAt: new Date() 
      })
      .where(eq(affiliates.id, signupData.affiliateId));
    
    return signup;
  }

  async getReferralStats(affiliateId: number): Promise<{ clicks: number; signups: number; earnings: number }> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (!affiliate) {
      return { clicks: 0, signups: 0, earnings: 0 };
    }
    
    return {
      clicks: affiliate.totalClicks,
      signups: affiliate.totalSignups,
      earnings: affiliate.totalEarnings
    };
  }

  async createPayoutRequest(requestData: Omit<InsertPayoutRequest, 'id' | 'requestedAt'>): Promise<PayoutRequest> {
    const [request] = await db
      .insert(payoutRequests)
      .values(requestData)
      .returning();
    return request;
  }

  async getPayoutRequests(affiliateId?: number): Promise<PayoutRequest[]> {
    if (affiliateId) {
      return await db.select().from(payoutRequests).where(eq(payoutRequests.affiliateId, affiliateId));
    }
    return await db.select().from(payoutRequests).orderBy(payoutRequests.requestedAt);
  }

  async updatePayoutRequest(id: number, updates: Partial<PayoutRequest>): Promise<PayoutRequest> {
    const [request] = await db
      .update(payoutRequests)
      .set({ ...updates, processedAt: updates.status === 'paid' ? new Date() : undefined })
      .where(eq(payoutRequests.id, id))
      .returning();
    return request;
  }

  // Vehicle Builds (My Build Garage)
  async createVehicleBuild(buildData: Omit<InsertVehicleBuild, 'id' | 'createdAt' | 'updatedAt'>): Promise<VehicleBuild> {
    const [build] = await db
      .insert(vehicleBuilds)
      .values(buildData)
      .returning();
    return build;
  }

  async getUserVehicleBuilds(userId: string): Promise<VehicleBuild[]> {
    try {
      const builds = await db
        .select()
        .from(vehicleBuilds)
        .where(eq(vehicleBuilds.userId, userId))
        .orderBy(vehicleBuilds.createdAt);
      return builds;
    } catch (error) {
      console.error("Error fetching vehicle builds:", error);
      return [];
    }
  }

  async updateVehicleBuild(id: number, updates: Partial<VehicleBuild>): Promise<VehicleBuild> {
    const [updated] = await db
      .update(vehicleBuilds)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vehicleBuilds.id, id))
      .returning();
    return updated;
  }

  async deleteVehicleBuild(id: number): Promise<void> {
    await db
      .delete(vehicleBuilds)
      .where(eq(vehicleBuilds.id, id));
  }

  // Mod Shop Partners
  async getModShopPartners(): Promise<ModShopPartner[]> {
    return await db
      .select()
      .from(modShopPartners)
      .where(eq(modShopPartners.isActive, true))
      .orderBy(modShopPartners.name);
  }

  async createModShopPartner(partnerData: Omit<InsertModShopPartner, 'id' | 'createdAt'>): Promise<ModShopPartner> {
    const [partner] = await db
      .insert(modShopPartners)
      .values(partnerData)
      .returning();
    return partner;
  }

  // Mod Shop Deal Methods for JV partnerships
  async createModShopDeal(data: Omit<InsertModShopDeal, "id" | "createdAt" | "updatedAt">): Promise<ModShopDeal> {
    const [deal] = await db
      .insert(modShopDeals)
      .values(data)
      .returning();
    return deal;
  }

  async getAllModShopDeals(): Promise<ModShopDeal[]> {
    return await db.select().from(modShopDeals).orderBy(desc(modShopDeals.createdAt));
  }

  async getActiveModShopDeals(): Promise<ModShopDeal[]> {
    return await db
      .select()
      .from(modShopDeals)
      .where(
        and(
          eq(modShopDeals.isActive, true),
          gte(modShopDeals.validUntil, new Date())
        )
      )
      .orderBy(desc(modShopDeals.discount));
  }

  async updateModShopDeal(id: number, data: Partial<Omit<InsertModShopDeal, "id" | "createdAt">>): Promise<ModShopDeal> {
    const [deal] = await db
      .update(modShopDeals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modShopDeals.id, id))
      .returning();
    return deal;
  }

  async deleteModShopDeal(id: number): Promise<void> {
    await db.delete(modShopDeals).where(eq(modShopDeals.id, id));
  }

  // Car Events (reusing existing structure)
  async getCarEventsByState(state: string): Promise<any[]> {
    return await db
      .select()
      .from(carEvents)
      .where(eq(carEvents.state, state))
      .orderBy(carEvents.eventDate);
  }

  async getUpcomingCarEvents(): Promise<any[]> {
    return await db
      .select()
      .from(carEvents)
      .where(gt(carEvents.eventDate, new Date()))
      .orderBy(carEvents.eventDate)
      .limit(10);
  }

  // Parts Watchlist
  async createWatchlistItem(itemData: Omit<InsertPartsWatchlistItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PartsWatchlistItem> {
    const [item] = await db
      .insert(partsWatchlist)
      .values(itemData)
      .returning();
    return item;
  }

  async getUserWatchlist(userId: string): Promise<PartsWatchlistItem[]> {
    return await db
      .select()
      .from(partsWatchlist)
      .where(eq(partsWatchlist.userId, userId))
      .orderBy(partsWatchlist.createdAt);
  }

  async updateWatchlistItem(id: number, updates: Partial<PartsWatchlistItem>): Promise<PartsWatchlistItem> {
    const [updated] = await db
      .update(partsWatchlist)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(partsWatchlist.id, id))
      .returning();
    return updated;
  }

  async deleteWatchlistItem(id: number): Promise<void> {
    await db
      .delete(partsWatchlist)
      .where(eq(partsWatchlist.id, id));
  }

  // Shop Suggestions
  async createShopSuggestion(suggestionData: Omit<any, 'id' | 'createdAt'>): Promise<any> {
    // Implementation for shop suggestions would go here
    return suggestionData;
  }

  // Admin user management methods
  async createAdminUser(adminData: Omit<InsertAdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    const [admin] = await db
      .insert(adminUsers)
      .values(adminData)
      .returning();
    return admin;
  }

  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id));
    return admin || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async updateAdminUserLastLogin(id: number): Promise<void> {
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers);
  }

  async updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser> {
    const [admin] = await db
      .update(adminUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
    return admin;
  }

  async deactivateAdminUser(id: number): Promise<void> {
    await db
      .update(adminUsers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async createAdminSession(sessionData: Omit<InsertAdminSession, 'id' | 'createdAt'>): Promise<AdminSession> {
    const [session] = await db
      .insert(adminSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getAdminSession(token: string): Promise<AdminSession | undefined> {
    const [session] = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.sessionToken, token));
    return session || undefined;
  }

  async deleteAdminSession(token: string): Promise<void> {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.sessionToken, token));
  }

  async cleanExpiredAdminSessions(): Promise<void> {
    await db
      .delete(adminSessions)
      .where(lt(adminSessions.expiresAt, new Date()));
  }

  async updateAdminUserPassword(id: number, passwordHash: string): Promise<boolean> {
    const result = await db
      .update(adminUsers)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(adminUsers.id, id));
    return result.rowCount > 0;
  }

  async updateAdminUserRole(id: number, role: string): Promise<AdminUser | undefined> {
    const rolePermissions = {
      viewer: { canViewFinancials: false, canManageUsers: false, canExportData: false, canManageAffiliates: false },
      sales: { canViewFinancials: false, canManageUsers: false, canExportData: true, canManageAffiliates: false },
      marketing: { canViewFinancials: false, canManageUsers: false, canExportData: true, canManageAffiliates: true },
      finance: { canViewFinancials: true, canManageUsers: false, canExportData: true, canManageAffiliates: false },
      manager: { canViewFinancials: true, canManageUsers: true, canExportData: true, canManageAffiliates: true },
      super_admin: { canViewFinancials: true, canManageUsers: true, canExportData: true, canManageAffiliates: true }
    };

    const permissions = rolePermissions[role as keyof typeof rolePermissions] || rolePermissions.viewer;

    const [user] = await db
      .update(adminUsers)
      .set({
        role,
        ...permissions,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, id))
      .returning();
    return user;
  }

  async deleteAdminSessionsByUserId(userId: number): Promise<void> {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.adminUserId, userId));
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // New tool storage implementations
  async storeTrueCostCalculation(data: any): Promise<any> {
    // Store in submissions table for now with type 'true_cost_calculation'
    const submission = {
      name: 'True Cost Explorer',
      email: 'system@importiq.com',
      vehiclePrice: data.vehiclePrice.toString(),
      totalCost: data.totalCost.toString(),
      make: data.vehicleType,
      model: data.state,
      year: new Date().getFullYear(),
      type: 'true_cost_calculation',
      calculationData: data.breakdown
    };
    return await this.createSubmission(submission);
  }

  async storeExpertPicksUsage(data: any): Promise<any> {
    const submission = {
      name: 'Expert Picks',
      email: 'system@importiq.com',
      vehiclePrice: data.budget.toString(),
      totalCost: '0',
      make: data.category,
      model: data.experience,
      year: new Date().getFullYear(),
      type: 'expert_picks_usage',
      calculationData: JSON.stringify(data)
    };
    return await this.createSubmission(submission);
  }

  async storeModCostEstimate(data: any): Promise<any> {
    const submission = {
      name: 'Mod Cost Estimator',
      email: 'system@importiq.com',
      vehiclePrice: '0',
      totalCost: data.totalCost.toString(),
      make: data.vehicle,
      model: 'modifications',
      year: new Date().getFullYear(),
      type: 'mod_cost_estimate',
      calculationData: data.breakdown
    };
    return await this.createSubmission(submission);
  }

  async storeRegistrationStatsLookup(data: any): Promise<any> {
    const submission = {
      name: 'Registration Stats',
      email: 'system@importiq.com',
      vehiclePrice: '0',
      totalCost: data.totalRegistrations.toString(),
      make: data.make,
      model: data.model,
      year: data.year,
      type: 'registration_stats_lookup',
      calculationData: JSON.stringify(data)
    };
    return await this.createSubmission(submission);
  }

  async storeImportVolumeView(data: any): Promise<any> {
    const submission = {
      name: 'Import Volume Dashboard',
      email: 'system@importiq.com',
      vehiclePrice: '0',
      totalCost: data.totalImports.toString(),
      make: 'volume_data',
      model: data.period,
      year: new Date().getFullYear(),
      type: 'import_volume_view',
      calculationData: JSON.stringify(data)
    };
    return await this.createSubmission(submission);
  }

  // Deposit Management Methods
  async createDeposit(depositData: Omit<InsertDeposit, 'id'>): Promise<Deposit> {
    const [deposit] = await db
      .insert(deposits)
      .values(depositData)
      .returning();
    return deposit;
  }

  async getAllDeposits(): Promise<Deposit[]> {
    return await db.select().from(deposits).orderBy(desc(deposits.createdAt));
  }

  async getDepositById(id: number): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    return deposit;
  }

  // Chat interaction tracking methods
  async createChatInteraction(interaction: Omit<InsertChatInteraction, 'id' | 'createdAt'>): Promise<ChatInteraction> {
    const [result] = await db
      .insert(chatInteractions)
      .values({ ...interaction, createdAt: new Date() })
      .returning();
    return result;
  }

  async getChatProfile(userIdentifier: string): Promise<ChatProfile | undefined> {
    const [profile] = await db
      .select()
      .from(chatProfiles)
      .where(eq(chatProfiles.userIdentifier, userIdentifier));
    return profile;
  }

  async updateChatProfile(userIdentifier: string, updates: { totalInteractions?: number; lastInteractionDate?: Date; toolContext?: string; topicCategory?: string }): Promise<ChatProfile> {
    const existingProfile = await this.getChatProfile(userIdentifier);
    
    if (!existingProfile) {
      // Create new profile
      return await this.createChatProfile({
        userIdentifier,
        totalInteractions: updates.totalInteractions || 1,
        lastInteractionDate: updates.lastInteractionDate || new Date(),
        favoriteTools: updates.toolContext ? [updates.toolContext] : [],
        preferredTopics: updates.topicCategory ? [updates.topicCategory] : [],
        userExpertiseLevel: 'beginner',
        iconPersonality: 'friendly',
        customIconEnabled: true
      });
    }

    // Update existing profile
    const favoriteTools = existingProfile.favoriteTools as string[] || [];
    const preferredTopics = existingProfile.preferredTopics as string[] || [];
    
    if (updates.toolContext && !favoriteTools.includes(updates.toolContext)) {
      favoriteTools.push(updates.toolContext);
    }
    
    if (updates.topicCategory && !preferredTopics.includes(updates.topicCategory)) {
      preferredTopics.push(updates.topicCategory);
    }

    // Determine expertise level based on interaction count
    const totalInteractions = (existingProfile.totalInteractions || 0) + (updates.totalInteractions || 0);
    let userExpertiseLevel = 'beginner';
    if (totalInteractions > 20) {
      userExpertiseLevel = 'expert';
    } else if (totalInteractions > 10) {
      userExpertiseLevel = 'intermediate';
    }

    const [updatedProfile] = await db
      .update(chatProfiles)
      .set({
        totalInteractions,
        lastInteractionDate: updates.lastInteractionDate || new Date(),
        favoriteTools,
        preferredTopics,
        userExpertiseLevel,
        updatedAt: new Date()
      })
      .where(eq(chatProfiles.userIdentifier, userIdentifier))
      .returning();

    return updatedProfile;
  }

  async createChatProfile(profile: Omit<InsertChatProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatProfile> {
    const [result] = await db
      .insert(chatProfiles)
      .values({
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result;
  }

  // Auction Data Ingestion Methods
  async createAuctionListing(listing: Omit<InsertAuctionListing, 'id' | 'createdAt' | 'lastUpdated'>): Promise<AuctionListing> {
    const [result] = await db
      .insert(auctionListings)
      .values({
        ...listing,
        createdAt: new Date(),
        lastUpdated: new Date()
      })
      .returning();

    return result;
  }

  async getAuctionListings(filters?: { make?: string; model?: string; sourceSite?: string; limit?: number; offset?: number }): Promise<AuctionListing[]> {
    let query = db.select().from(auctionListings).where(eq(auctionListings.isActive, true));
    
    if (filters?.make) {
      query = query.where(eq(auctionListings.make, filters.make));
    }
    
    if (filters?.model) {
      query = query.where(eq(auctionListings.model, filters.model));
    }
    
    if (filters?.sourceSite) {
      query = query.where(eq(auctionListings.sourceSite, filters.sourceSite));
    }

    query = query.orderBy(desc(auctionListings.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getAuctionListingById(id: number): Promise<AuctionListing | undefined> {
    const [listing] = await db.select().from(auctionListings).where(eq(auctionListings.id, id));
    return listing;
  }

  async updateAuctionListing(id: number, updates: Partial<AuctionListing>): Promise<AuctionListing> {
    const [result] = await db
      .update(auctionListings)
      .set({
        ...updates,
        lastUpdated: new Date()
      })
      .where(eq(auctionListings.id, id))
      .returning();

    return result;
  }

  async deleteAuctionListing(id: number): Promise<void> {
    await db.update(auctionListings)
      .set({ isActive: false, lastUpdated: new Date() })
      .where(eq(auctionListings.id, id));
  }

  async createDataIngestionLog(log: Omit<InsertDataIngestionLog, 'id' | 'createdAt'>): Promise<DataIngestionLog> {
    const [result] = await db
      .insert(dataIngestionLogs)
      .values({
        ...log,
        createdAt: new Date()
      })
      .returning();

    return result;
  }

  async getDataIngestionLogs(limit?: number): Promise<DataIngestionLog[]> {
    let query = db.select().from(dataIngestionLogs).orderBy(desc(dataIngestionLogs.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private submissions: Map<number, Submission>;
  currentUserId: number;
  currentSubmissionId: number;
  private jsonFilePath: string;

  constructor() {
    this.users = new Map();
    this.submissions = new Map();
    this.currentUserId = 1;
    this.currentSubmissionId = 1;
    this.jsonFilePath = path.resolve(process.cwd(), 'submissions.json');
    this.loadSubmissionsFromFile();
  }

  private loadSubmissionsFromFile() {
    try {
      if (fs.existsSync(this.jsonFilePath)) {
        const data = fs.readFileSync(this.jsonFilePath, 'utf-8');
        const submissions = JSON.parse(data);
        submissions.forEach((submission: Submission) => {
          this.submissions.set(submission.id, submission);
          if (submission.id >= this.currentSubmissionId) {
            this.currentSubmissionId = submission.id + 1;
          }
        });
      }
    } catch (error) {
      console.error('Error loading submissions from file:', error);
    }
  }

  private saveSubmissionsToFile() {
    try {
      const submissions = Array.from(this.submissions.values());
      fs.writeFileSync(this.jsonFilePath, JSON.stringify(submissions, null, 2));
    } catch (error) {
      console.error('Error saving submissions to file:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSubmission(submissionData: Omit<Submission, 'id' | 'createdAt'>): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const submission: Submission = {
      ...submissionData,
      id,
      createdAt: new Date(),
    };
    
    this.submissions.set(id, submission);
    this.saveSubmissionsToFile();
    return submission;
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values());
  }
}

export const storage = new DatabaseStorage();
