import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";

export interface UserAuthResult {
  success: boolean;
  user?: any;
  sessionToken?: string;
  error?: string;
}

export class UserAuthService {
  private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static readonly BCRYPT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async registerUser(email: string, password: string, fullName: string): Promise<UserAuthResult> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: "Email already registered" };
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const user = await storage.createUser({
        username: email, // Use email as username for compatibility
        email,
        password: passwordHash,
        fullName,
      });

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      await storage.createUserSession({
        userId: user.id,
        sessionToken,
        expiresAt,
      });

      // Remove password hash from response
      const { passwordHash: _, ...safeUser } = user;

      return { 
        success: true, 
        user: safeUser, 
        sessionToken 
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Registration failed" };
    }
  }

  static async authenticateUser(email: string, password: string): Promise<UserAuthResult> {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.isActive) {
        return { success: false, error: "Invalid credentials" };
      }

      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        return { success: false, error: "Invalid credentials" };
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      await storage.createUserAuthSession({
        userId: user.id,
        sessionToken,
        expiresAt,
      });

      // Remove password hash from response
      const { passwordHash: _, ...safeUser } = user;

      return { 
        success: true, 
        user: safeUser, 
        sessionToken 
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return { success: false, error: "Authentication failed" };
    }
  }

  static async validateSession(sessionToken: string): Promise<UserAuthResult> {
    try {
      const session = await storage.getUserAuthSession(sessionToken);
      if (!session || new Date() > new Date(session.expiresAt)) {
        if (session) {
          await storage.deleteUserAuthSession(sessionToken);
        }
        return { success: false, error: "Session expired" };
      }

      const user = await storage.getUser(session.userId);
      if (!user || !user.isActive) {
        await storage.deleteUserAuthSession(sessionToken);
        return { success: false, error: "User not found or inactive" };
      }

      // Remove password hash from response
      const { passwordHash: _, ...safeUser } = user;

      return { success: true, user: safeUser };
    } catch (error) {
      console.error("Session validation error:", error);
      return { success: false, error: "Session validation failed" };
    }
  }

  static async logout(sessionToken: string): Promise<boolean> {
    try {
      await storage.deleteUserAuthSession(sessionToken);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }
}