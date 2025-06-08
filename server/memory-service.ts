/**
 * Intelligent Memory Service
 * Transforms ImportIQ from lookup tool to import co-pilot with personalized memories
 */

import { db } from './db';
import { sql } from 'drizzle-orm';
import { desc, eq, and } from 'drizzle-orm';
import { 
  recentLookups, 
  savedJourneys, 
  vehicleWatchlist, 
  journeyEvents, 
  sessionMemory 
} from '@shared/schema';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class MemoryService {
  
  /**
   * Record user lookup for memory tracking
   */
  static async recordLookup(
    sessionId: string,
    vehicleData: any,
    destination: string,
    lookupType: string = 'smart_lookup',
    resultSummary?: string,
    userId?: number
  ) {
    try {
      await db.insert(recentLookups).values({
        sessionId,
        userId,
        vehicleMake: vehicleData.make,
        vehicleModel: vehicleData.model,
        chassisCode: vehicleData.chassis,
        destination,
        lookupType,
        resultSummary: resultSummary || `${vehicleData.make} ${vehicleData.model} lookup for ${destination}`,
        createdAt: new Date()
      });

      // Update session memory
      await this.updateSessionMemory(sessionId, vehicleData, destination, userId);
      
      // Record journey event
      await this.recordJourneyEvent(
        sessionId,
        'lookup',
        {
          vehicle: vehicleData,
          destination,
          lookupType
        },
        `Looked up ${vehicleData.make} ${vehicleData.model} for import to ${destination}`,
        userId
      );
    } catch (error) {
      console.error('Failed to record lookup:', error);
    }
  }

  /**
   * Get recent lookups for session/user
   */
  static async getRecentLookups(sessionId: string, userId?: number, limit: number = 5) {
    try {
      const lookups = await db.select()
        .from(recentLookups)
        .where(
          userId 
            ? eq(recentLookups.userId, userId)
            : eq(recentLookups.sessionId, sessionId)
        )
        .orderBy(desc(recentLookups.createdAt))
        .limit(limit);

      return lookups;
    } catch (error) {
      console.error('Failed to get recent lookups:', error);
      return [];
    }
  }

  /**
   * Save import journey with AI-generated summary
   */
  static async saveJourney(
    sessionId: string,
    vehicleData: any,
    destination: string,
    journeyData: any,
    journeyName?: string,
    userId?: number
  ) {
    try {
      // Generate AI summary using OpenAI
      const aiSummary = await this.generateJourneySummary(vehicleData, destination, journeyData);
      
      // Auto-generate journey name if not provided
      const autoJourneyName = journeyName || `${vehicleData.make} ${vehicleData.model} to ${destination}`;
      
      // Estimate completion based on timeline
      const estimatedWeeks = journeyData.timeline?.reduce((total: number, phase: any) => {
        const weeks = parseInt(phase.duration) || 4;
        return total + weeks;
      }, 0) || 20;
      
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + (estimatedWeeks * 7));

      const [savedJourney] = await db.insert(savedJourneys).values({
        sessionId,
        userId,
        journeyName: autoJourneyName,
        vehicleMake: vehicleData.make,
        vehicleModel: vehicleData.model,
        chassisCode: vehicleData.chassis,
        vehicleYear: vehicleData.year || 1995,
        destination,
        journeyData,
        aiSummary,
        isBookmarked: true,
        tags: this.generateTags(vehicleData, destination),
        progress: 'planning',
        estimatedCompletion,
        totalCostEstimate: Math.round((journeyData.costBreakdown?.total || 40000) * 100), // convert to cents
        currency: journeyData.costBreakdown?.currency || 'AUD',
        lastViewed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Record journey event
      await this.recordJourneyEvent(
        sessionId,
        'save_journey',
        { journeyId: savedJourney.id, vehicle: vehicleData, destination },
        `Saved import journey for ${vehicleData.make} ${vehicleData.model}`,
        userId,
        savedJourney.id
      );

      return savedJourney;
    } catch (error) {
      console.error('Failed to save journey:', error);
      throw error;
    }
  }

  /**
   * Get saved journeys for session/user
   */
  static async getSavedJourneys(sessionId: string, userId?: number) {
    try {
      const journeys = await db.select()
        .from(savedJourneys)
        .where(
          userId 
            ? eq(savedJourneys.userId, userId)
            : eq(savedJourneys.sessionId, sessionId)
        )
        .orderBy(desc(savedJourneys.lastViewed));

      return journeys;
    } catch (error) {
      console.error('Failed to get saved journeys:', error);
      return [];
    }
  }

  /**
   * Add vehicle to watchlist
   */
  static async addToWatchlist(
    sessionId: string,
    vehicleData: any,
    destination: string,
    watchType: string = 'price_alert',
    alertThreshold?: number,
    contactEmail?: string,
    userId?: number
  ) {
    try {
      const [watchItem] = await db.insert(vehicleWatchlist).values({
        sessionId,
        userId,
        vehicleMake: vehicleData.make,
        vehicleModel: vehicleData.model,
        chassisCode: vehicleData.chassis,
        destination,
        watchType,
        alertThreshold,
        currentStatus: `Watching ${watchType.replace('_', ' ')}`,
        isActive: true,
        alertFrequency: 'weekly',
        contactEmail,
        createdAt: new Date()
      }).returning();

      // Record journey event
      await this.recordJourneyEvent(
        sessionId,
        'add_watchlist',
        { watchType, vehicle: vehicleData, destination },
        `Added ${vehicleData.make} ${vehicleData.model} to watchlist for ${watchType.replace('_', ' ')}`,
        userId
      );

      return watchItem;
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      throw error;
    }
  }

  /**
   * Get user's watchlist
   */
  static async getWatchlist(sessionId: string, userId?: number) {
    try {
      const watchlist = await db.select()
        .from(vehicleWatchlist)
        .where(
          and(
            userId 
              ? eq(vehicleWatchlist.userId, userId)
              : eq(vehicleWatchlist.sessionId, sessionId),
            eq(vehicleWatchlist.isActive, true)
          )
        )
        .orderBy(desc(vehicleWatchlist.createdAt));

      return watchlist;
    } catch (error) {
      console.error('Failed to get watchlist:', error);
      return [];
    }
  }

  /**
   * Record journey event
   */
  static async recordJourneyEvent(
    sessionId: string,
    eventType: string,
    eventData: any,
    description: string,
    userId?: number,
    savedJourneyId?: number,
    importance: string = 'medium'
  ) {
    try {
      await db.insert(journeyEvents).values({
        sessionId,
        userId,
        savedJourneyId,
        eventType,
        eventData,
        vehicleMake: eventData.vehicle?.make,
        vehicleModel: eventData.vehicle?.model,
        destination: eventData.destination,
        description,
        importance,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to record journey event:', error);
    }
  }

  /**
   * Get journey timeline for user
   */
  static async getJourneyTimeline(sessionId: string, userId?: number, limit: number = 20) {
    try {
      const events = await db.select()
        .from(journeyEvents)
        .where(
          userId 
            ? eq(journeyEvents.userId, userId)
            : eq(journeyEvents.sessionId, sessionId)
        )
        .orderBy(desc(journeyEvents.createdAt))
        .limit(limit);

      return events;
    } catch (error) {
      console.error('Failed to get journey timeline:', error);
      return [];
    }
  }

  /**
   * Update session memory with user preferences
   */
  static async updateSessionMemory(
    sessionId: string,
    vehicleData: any,
    destination: string,
    userId?: number
  ) {
    try {
      // Get existing session memory
      const [existing] = await db.select()
        .from(sessionMemory)
        .where(eq(sessionMemory.sessionId, sessionId));

      if (existing) {
        // Update existing session
        const preferredTypes = existing.preferredVehicleTypes || [];
        const vehicleType = `${vehicleData.make} ${vehicleData.model}`.toLowerCase();
        
        if (!preferredTypes.includes(vehicleType)) {
          preferredTypes.push(vehicleType);
        }

        await db.update(sessionMemory)
          .set({
            lastActivity: new Date(),
            totalLookups: (existing.totalLookups || 0) + 1,
            favoriteDestination: destination,
            preferredVehicleTypes: preferredTypes.slice(-10), // keep last 10
            returningUser: true,
            updatedAt: new Date()
          })
          .where(eq(sessionMemory.sessionId, sessionId));
      } else {
        // Create new session memory
        await db.insert(sessionMemory).values({
          sessionId,
          userId,
          lastActivity: new Date(),
          totalLookups: 1,
          favoriteDestination: destination,
          preferredVehicleTypes: [`${vehicleData.make} ${vehicleData.model}`.toLowerCase()],
          journeyStage: 'exploring',
          returningUser: false,
          firstVisit: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to update session memory:', error);
    }
  }

  /**
   * Get session insights for personalization
   */
  static async getSessionInsights(sessionId: string, userId?: number) {
    try {
      const [memory] = await db.select()
        .from(sessionMemory)
        .where(eq(sessionMemory.sessionId, sessionId));

      if (!memory) {
        return {
          isNewUser: true,
          totalLookups: 0,
          favoriteDestination: null,
          preferredVehicleTypes: [],
          journeyStage: 'exploring'
        };
      }

      return {
        isNewUser: !memory.returningUser,
        totalLookups: memory.totalLookups || 0,
        favoriteDestination: memory.favoriteDestination,
        preferredVehicleTypes: memory.preferredVehicleTypes || [],
        journeyStage: memory.journeyStage || 'exploring',
        firstVisit: memory.firstVisit,
        lastActivity: memory.lastActivity
      };
    } catch (error) {
      console.error('Failed to get session insights:', error);
      return {
        isNewUser: true,
        totalLookups: 0,
        favoriteDestination: null,
        preferredVehicleTypes: [],
        journeyStage: 'exploring'
      };
    }
  }

  /**
   * Generate AI-powered journey summary using OpenAI
   */
  private static async generateJourneySummary(
    vehicleData: any,
    destination: string,
    journeyData: any
  ): Promise<string> {
    try {
      const prompt = `Generate a personalized, encouraging summary for this vehicle import journey:

Vehicle: ${vehicleData.make} ${vehicleData.model} ${vehicleData.chassis ? `(${vehicleData.chassis})` : ''}
Destination: ${destination}
Total Cost: ${journeyData.costBreakdown?.currency || 'AUD'} ${journeyData.costBreakdown?.total?.toLocaleString() || 'TBD'}
Eligibility: ${journeyData.eligibility?.status || 'Under review'}
Timeline: ${journeyData.timeline?.total || 'TBD'}

Write a 2-3 sentence summary that:
1. Celebrates their vehicle choice
2. Acknowledges the journey complexity 
3. Provides confidence about the process
4. Mentions key cost/timeline highlights

Keep it personal, professional, and motivating. No technical jargon.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      });

      return response.choices[0].message.content || 
        `Your ${vehicleData.make} ${vehicleData.model} import to ${destination} is an excellent choice. With proper planning, this journey should take approximately ${journeyData.timeline?.total || '20-24 weeks'} and cost around ${journeyData.costBreakdown?.currency || 'AUD'} ${journeyData.costBreakdown?.total?.toLocaleString() || '40,000'}.`;
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      // Fallback summary
      return `Your ${vehicleData.make} ${vehicleData.model} import to ${destination} is an excellent choice. With proper planning, this journey should take approximately ${journeyData.timeline?.total || '20-24 weeks'} and cost around ${journeyData.costBreakdown?.currency || 'AUD'} ${journeyData.costBreakdown?.total?.toLocaleString() || '40,000'}.`;
    }
  }

  /**
   * Generate smart tags for journey categorization
   */
  private static generateTags(vehicleData: any, destination: string): string[] {
    const tags = [];
    
    // Vehicle type tags
    if (vehicleData.make) tags.push(vehicleData.make.toLowerCase());
    if (vehicleData.model?.toLowerCase().includes('gt-r')) tags.push('performance');
    if (vehicleData.model?.toLowerCase().includes('supra')) tags.push('legendary');
    if (vehicleData.chassis) tags.push('jdm');
    
    // Destination tags
    tags.push(destination.toLowerCase());
    
    // Common tags
    tags.push('import', 'journey');
    
    return tags.slice(0, 8); // limit to 8 tags
  }

  /**
   * Get personalized recommendations based on user memory
   */
  static async getPersonalizedRecommendations(sessionId: string, userId?: number) {
    try {
      const insights = await this.getSessionInsights(sessionId, userId);
      const recentLookups = await this.getRecentLookups(sessionId, userId, 10);
      
      const recommendations = {
        welcomeMessage: insights.isNewUser 
          ? "Welcome to ImportIQ! Let's find your perfect import vehicle."
          : `Welcome back! You've explored ${insights.totalLookups} vehicles so far.`,
        
        suggestedDestinations: insights.favoriteDestination 
          ? [insights.favoriteDestination]
          : ['australia', 'usa', 'canada'],
          
        suggestedVehicles: insights.preferredVehicleTypes.slice(0, 5),
        
        continueJourney: recentLookups.length > 0 
          ? `Continue exploring your ${recentLookups[0].vehicleMake} ${recentLookups[0].vehicleModel} import`
          : null,
          
        journeyStage: insights.journeyStage
      };
      
      return recommendations;
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return {
        welcomeMessage: "Welcome to ImportIQ! Let's find your perfect import vehicle.",
        suggestedDestinations: ['australia', 'usa', 'canada'],
        suggestedVehicles: [],
        continueJourney: null,
        journeyStage: 'exploring'
      };
    }
  }
}