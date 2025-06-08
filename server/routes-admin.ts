/**
 * Admin Debugging + Log View Routes
 * Enables admin users to query sessions and troubleshoot any session
 */
import { Router } from 'express';
import { db } from './db';
import { vehicleJourneySessions, importCostCalculations, vehicleJourneyTools } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Get session journey, tool state, and import cost breakdown
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get session details
    const [session] = await db.select()
      .from(vehicleJourneySessions)
      .where(eq(vehicleJourneySessions.sessionToken, sessionId))
      .limit(1);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Get all tools used in this session
    const tools = await db.select()
      .from(vehicleJourneyTools)
      .where(eq(vehicleJourneyTools.sessionId, sessionId));
    
    // Get import cost calculations
    const calculations = await db.select()
      .from(importCostCalculations)
      .where(eq(importCostCalculations.sessionId, sessionId));
    
    const debugInfo = {
      sessionId,
      session: {
        vehicleQuery: session.vehicleQuery,
        currentStep: session.currentStep,
        userData: session.userData,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress
      },
      toolsUsed: tools.map(tool => ({
        toolName: tool.toolName,
        toolData: tool.toolData,
        confidenceScore: tool.confidenceScore,
        sourceAttribution: tool.sourceAttribution,
        createdAt: tool.createdAt
      })),
      calculations: calculations.map(calc => ({
        vehicleData: calc.vehicleData,
        costBreakdown: calc.costBreakdown,
        totalCostAud: calc.totalCostAud,
        confidenceScore: calc.confidenceScore,
        createdAt: calc.createdAt
      })),
      summary: {
        totalTools: tools.length,
        totalCalculations: calculations.length,
        averageConfidence: tools.length > 0 ? 
          tools.reduce((sum, t) => sum + (t.confidenceScore || 0), 0) / tools.length : 0,
        sessionDuration: session.lastActivity && session.createdAt ? 
          new Date(session.lastActivity).getTime() - new Date(session.createdAt).getTime() : 0
      }
    };
    
    res.json(debugInfo);
  } catch (error) {
    console.error('Admin session debug error:', error);
    res.status(500).json({ error: 'Failed to retrieve session debug info' });
  }
});

/**
 * Get all active sessions with summary data
 */
router.get('/sessions/active', async (req, res) => {
  try {
    const sessions = await db.select()
      .from(vehicleJourneySessions)
      .orderBy(vehicleJourneySessions.lastActivity)
      .limit(50);
    
    const sessionSummaries = await Promise.all(
      sessions.map(async (session) => {
        const toolCount = await db.select()
          .from(vehicleJourneyTools)
          .where(eq(vehicleJourneyTools.sessionId, session.sessionToken));
        
        const calcCount = await db.select()
          .from(importCostCalculations)
          .where(eq(importCostCalculations.sessionId, session.sessionToken));
        
        return {
          sessionId: session.sessionToken,
          vehicleQuery: session.vehicleQuery,
          currentStep: session.currentStep,
          toolsUsed: toolCount.length,
          calculations: calcCount.length,
          lastActivity: session.lastActivity,
          createdAt: session.createdAt
        };
      })
    );
    
    res.json({
      activeSessions: sessionSummaries.length,
      sessions: sessionSummaries
    });
  } catch (error) {
    console.error('Admin active sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve active sessions' });
  }
});

export { router as adminRoutes };