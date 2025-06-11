import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users, userAuthSessions } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    fullName: string;
    stripeCustomerId?: string;
    freeLookupUsed: boolean;
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header or session cookie
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to session cookie
      token = req.cookies?.sessionToken;
    }

    console.log('Debug - Auth header:', authHeader);
    console.log('Debug - Query session:', req.query.session);
    console.log('Debug - Cookies:', req.cookies);
    console.log('Debug - Session token:', token);

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Validate session token
    const sessions = await db.select({
      sessionId: userAuthSessions.id,
      userId: userAuthSessions.userId,
      expiresAt: userAuthSessions.expiresAt,
      email: users.email,
      fullName: users.fullName,
      stripeCustomerId: users.stripeCustomerId,
      freeLookupUsed: users.freeLookupUsed
    })
    .from(userAuthSessions)
    .innerJoin(users, eq(userAuthSessions.userId, users.id))
    .where(and(
      eq(userAuthSessions.sessionToken, token),
      gt(userAuthSessions.expiresAt, new Date()),
      eq(users.isActive, true)
    ))
    .limit(1);

    if (!sessions.length) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const session = sessions[0];
    
    // Attach user to request
    (req as AuthenticatedRequest).user = {
      id: session.userId,
      email: session.email,
      fullName: session.fullName,
      stripeCustomerId: session.stripeCustomerId || undefined,
      freeLookupUsed: session.freeLookupUsed || false
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Similar to requireAuth but doesn't fail if no token
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies?.sessionToken;
    }

    if (token) {
      const sessions = await db.select({
        sessionId: userAuthSessions.id,
        userId: userAuthSessions.userId,
        expiresAt: userAuthSessions.expiresAt,
        email: users.email,
        fullName: users.fullName,
        stripeCustomerId: users.stripeCustomerId,
        freeLookupUsed: users.freeLookupUsed
      })
      .from(userAuthSessions)
      .innerJoin(users, eq(userAuthSessions.userId, users.id))
      .where(and(
        eq(userAuthSessions.sessionToken, token),
        gt(userAuthSessions.expiresAt, new Date()),
        eq(users.isActive, true)
      ))
      .limit(1);

      if (sessions.length > 0) {
        const session = sessions[0];
        (req as AuthenticatedRequest).user = {
          id: session.userId,
          email: session.email,
          fullName: session.fullName,
          stripeCustomerId: session.stripeCustomerId || undefined,
          freeLookupUsed: session.freeLookupUsed || false
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
}