import { users, submissions, aiRecommendations, emailCache, trials, userProjects, userAchievements, carEvents, reports, bookings, affiliates, influencerProfiles, referralClicks, referralSignups, payoutRequests, type User, type InsertUser, type Submission, type InsertSubmission, type Booking, type InsertBooking, type Affiliate, type InsertAffiliate, type InfluencerProfile, type InsertInfluencerProfile, type ReferralClick, type InsertReferralClick, type ReferralSignup, type InsertReferralSignup, type PayoutRequest, type InsertPayoutRequest } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
  createTrial(email: string, name: string): Promise<any>;
  getTrialStatus(email: string): Promise<{ isActive: boolean; daysRemaining: number; status: string } | null>;
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
  createShopSuggestion(suggestion: Omit<InsertShopSuggestion, 'id' | 'createdAt'>): Promise<ShopSuggestion>;
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

  async createTrial(email: string, name: string): Promise<any> {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

    const [trial] = await db
      .insert(trials)
      .values({
        email,
        name,
        trialEndDate,
        isActive: true,
        subscriptionStatus: "trial"
      })
      .onConflictDoUpdate({
        target: trials.email,
        set: {
          name,
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
    return await db
      .select()
      .from(vehicleBuilds)
      .where(eq(vehicleBuilds.userId, userId))
      .orderBy(vehicleBuilds.createdAt);
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
  async createShopSuggestion(suggestionData: Omit<InsertShopSuggestion, 'id' | 'createdAt'>): Promise<ShopSuggestion> {
    const [suggestion] = await db
      .insert(shopSuggestions)
      .values(suggestionData)
      .returning();
    return suggestion;
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
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
