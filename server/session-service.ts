import { db } from './db';
import { vehicleJourneySessions, vehicleLookupCache, importIntelligenceCache, anonymousSessions } from '@shared/schema';
import { eq, and, gt, desc, lt } from 'drizzle-orm';
import crypto from 'crypto';

export interface VehicleData {
  make: string;
  model: string;
  chassis?: string;
  year?: string;
  productionYears?: string;
}

export interface JourneyState {
  eligibility?: any;
  costs?: any;
  timeline?: any;
  nextSteps?: any;
  alternatives?: any;
}

export class SessionService {
  // Generate unique session token
  private static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate hash for caching
  private static generateHash(data: string): string {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }

  // Create or update vehicle journey session
  static async createOrUpdateSession(
    query: string,
    vehicleData: VehicleData,
    confidenceScore: number,
    userAgent?: string,
    ipAddress?: string,
    sessionToken?: string
  ): Promise<string> {
    const token = sessionToken || this.generateSessionToken();
    
    try {
      // Check if session exists
      const existingSession = sessionToken ? 
        await db.select().from(vehicleJourneySessions)
          .where(eq(vehicleJourneySessions.sessionToken, sessionToken))
          .limit(1) : [];

      if (existingSession.length > 0) {
        // Update existing session
        await db.update(vehicleJourneySessions)
          .set({
            parsedData: vehicleData,
            confidenceScore,
            lastAccessed: new Date(),
            updatedAt: new Date()
          })
          .where(eq(vehicleJourneySessions.sessionToken, sessionToken));
      } else {
        // Create new session
        await db.insert(vehicleJourneySessions).values({
          sessionToken: token,
          originalQuery: query,
          parsedData: vehicleData,
          confidenceScore,
          userAgent,
          ipAddress,
          currentStep: 'lookup'
        });
      }

      return token;
    } catch (error) {
      console.error('Session creation error:', error);
      throw new Error('Failed to create session');
    }
  }

  // Get session data
  static async getSession(sessionToken: string): Promise<any> {
    try {
      const [session] = await db.select().from(vehicleJourneySessions)
        .where(and(
          eq(vehicleJourneySessions.sessionToken, sessionToken),
          eq(vehicleJourneySessions.isActive, true)
        ))
        .limit(1);

      if (session) {
        // Update last accessed
        await db.update(vehicleJourneySessions)
          .set({ lastAccessed: new Date() })
          .where(eq(vehicleJourneySessions.sessionToken, sessionToken));
      }

      return session;
    } catch (error) {
      console.error('Session retrieval error:', error);
      return null;
    }
  }

  // Update session with destination and journey state
  static async updateSessionDestination(
    sessionToken: string,
    destination: string,
    journeyState: JourneyState
  ): Promise<boolean> {
    try {
      await db.update(vehicleJourneySessions)
        .set({
          currentDestination: destination,
          currentStep: 'journey',
          journeyState,
          lastAccessed: new Date(),
          updatedAt: new Date()
        })
        .where(eq(vehicleJourneySessions.sessionToken, sessionToken));

      return true;
    } catch (error) {
      console.error('Session update error:', error);
      return false;
    }
  }

  // Cache vehicle lookup result
  static async cacheVehicleLookup(
    query: string,
    vehicleData: VehicleData,
    lookupType: string,
    confidenceScore: number,
    sourceAttribution?: string
  ): Promise<void> {
    try {
      const queryHash = this.generateHash(query);
      const validUntil = new Date();
      validUntil.setHours(validUntil.getHours() + 24); // Cache for 24 hours

      // Check if already cached
      const existing = await db.select().from(vehicleLookupCache)
        .where(eq(vehicleLookupCache.queryHash, queryHash))
        .limit(1);

      if (existing.length > 0) {
        // Update existing cache
        await db.update(vehicleLookupCache)
          .set({
            accessCount: existing[0].accessCount + 1,
            lastAccessed: new Date(),
            validUntil
          })
          .where(eq(vehicleLookupCache.queryHash, queryHash));
      } else {
        // Create new cache entry
        await db.insert(vehicleLookupCache).values({
          queryHash,
          originalQuery: query,
          resolvedVehicle: vehicleData,
          lookupType,
          confidenceScore,
          sourceAttribution,
          validUntil
        });
      }
    } catch (error) {
      console.error('Vehicle lookup cache error:', error);
    }
  }

  // Get cached vehicle lookup
  static async getCachedVehicleLookup(query: string): Promise<any> {
    try {
      const queryHash = this.generateHash(query);
      const now = new Date();

      const [cached] = await db.select().from(vehicleLookupCache)
        .where(and(
          eq(vehicleLookupCache.queryHash, queryHash),
          gt(vehicleLookupCache.validUntil, now.toISOString())
        ))
        .limit(1);

      if (cached) {
        // Update access count
        await db.update(vehicleLookupCache)
          .set({
            accessCount: cached.accessCount + 1,
            lastAccessed: new Date()
          })
          .where(eq(vehicleLookupCache.queryHash, queryHash));

        return {
          vehicleData: cached.resolvedVehicle,
          confidenceScore: cached.confidenceScore,
          sourceAttribution: cached.sourceAttribution,
          fromCache: true
        };
      }

      return null;
    } catch (error) {
      console.error('Vehicle lookup cache retrieval error:', error);
      return null;
    }
  }

  // Cache import intelligence
  static async cacheImportIntelligence(
    vehicleData: VehicleData,
    destination: string,
    intelligence: JourneyState
  ): Promise<void> {
    try {
      const vehicleHash = this.generateHash(JSON.stringify(vehicleData));
      const validUntil = new Date();
      validUntil.setHours(validUntil.getHours() + 12); // Cache for 12 hours

      await db.insert(importIntelligenceCache).values({
        vehicleHash,
        destination,
        eligibilityData: intelligence.eligibility || {},
        costData: intelligence.costs || {},
        timelineData: intelligence.timeline || {},
        nextStepsData: intelligence.nextSteps || {},
        alternativesData: intelligence.alternatives || {},
        validUntil
      });
    } catch (error) {
      console.error('Import intelligence cache error:', error);
    }
  }

  // Get cached import intelligence
  static async getCachedImportIntelligence(
    vehicleData: VehicleData,
    destination: string
  ): Promise<any> {
    try {
      const vehicleHash = this.generateHash(JSON.stringify(vehicleData));
      const now = new Date();

      const [cached] = await db.select().from(importIntelligenceCache)
        .where(and(
          eq(importIntelligenceCache.vehicleHash, vehicleHash),
          eq(importIntelligenceCache.destination, destination),
          gt(importIntelligenceCache.validUntil, now.toISOString())
        ))
        .limit(1);

      if (cached) {
        return {
          eligibility: cached.eligibilityData,
          costs: cached.costData,
          timeline: cached.timelineData,
          nextSteps: cached.nextStepsData,
          alternatives: cached.alternativesData,
          fromCache: true
        };
      }

      return null;
    } catch (error) {
      console.error('Import intelligence cache retrieval error:', error);
      return null;
    }
  }

  // Reconstruct session from URL parameters
  static async reconstructSessionFromParams(params: {
    make?: string;
    model?: string;
    chassis?: string;
    year?: string;
    destination?: string;
  }): Promise<string | null> {
    try {
      if (!params.make || !params.model) {
        return null;
      }

      const vehicleData: VehicleData = {
        make: params.make,
        model: params.model,
        chassis: params.chassis,
        year: params.year
      };

      // Try to find existing session with this vehicle data
      const sessions = await db.select().from(vehicleJourneySessions)
        .where(eq(vehicleJourneySessions.isActive, true))
        .orderBy(desc(vehicleJourneySessions.lastAccessed))
        .limit(10);

      for (const session of sessions) {
        const sessionVehicle = session.parsedData as VehicleData;
        if (sessionVehicle.make === vehicleData.make && 
            sessionVehicle.model === vehicleData.model &&
            sessionVehicle.chassis === vehicleData.chassis) {
          
          // Update session with destination if provided
          if (params.destination) {
            await this.updateSessionDestination(session.sessionToken, params.destination, {});
          }
          
          return session.sessionToken;
        }
      }

      // Create new session if no match found
      const query = `${params.make} ${params.model}${params.chassis ? ' ' + params.chassis : ''}`;
      const sessionToken = await this.createOrUpdateSession(query, vehicleData, 85);
      
      if (params.destination) {
        await this.updateSessionDestination(sessionToken, params.destination, {});
      }

      return sessionToken;
    } catch (error) {
      console.error('Session reconstruction error:', error);
      return null;
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Deactivate old sessions
      await db.update(vehicleJourneySessions)
        .set({ isActive: false })
        .where(lt(vehicleJourneySessions.lastAccessed, oneDayAgo.toISOString()));

      // Clean expired cache entries
      const now = new Date();
      await db.delete(vehicleLookupCache)
        .where(lt(vehicleLookupCache.validUntil, now.toISOString()));
      
      await db.delete(importIntelligenceCache)
        .where(lt(importIntelligenceCache.validUntil, now.toISOString()));

    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }

  // Get user's recent queries
  static async getRecentQueries(sessionToken: string, limit: number = 5): Promise<any[]> {
    try {
      const sessions = await db.select().from(vehicleJourneySessions)
        .where(eq(vehicleJourneySessions.isActive, true))
        .orderBy(desc(vehicleJourneySessions.lastAccessed))
        .limit(limit);

      return sessions.map(session => ({
        query: session.originalQuery,
        vehicleData: session.parsedData,
        destination: session.currentDestination,
        timestamp: session.lastAccessed
      }));
    } catch (error) {
      console.error('Recent queries retrieval error:', error);
      return [];
    }
  }
}

// Initialize cleanup scheduler
setInterval(() => {
  SessionService.cleanupExpiredSessions();
}, 60 * 60 * 1000); // Run every hour