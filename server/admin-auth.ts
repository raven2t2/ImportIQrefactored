import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";

export interface AdminAuthResult {
  success: boolean;
  adminUser?: any;
  sessionToken?: string;
  error?: string;
}

export class AdminAuthService {
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  private static readonly BCRYPT_ROUNDS = 12;

  // Role-based permissions
  private static readonly ROLE_PERMISSIONS = {
    super_admin: {
      canViewFinancials: true,
      canManageUsers: true,
      canExportData: true,
      canManageAffiliates: true,
      canViewAnalytics: true,
      canManageSystem: true,
    },
    manager: {
      canViewFinancials: true,
      canManageUsers: false,
      canExportData: true,
      canManageAffiliates: true,
      canViewAnalytics: true,
      canManageSystem: false,
    },
    sales: {
      canViewFinancials: false,
      canManageUsers: false,
      canExportData: true,
      canManageAffiliates: true,
      canViewAnalytics: true,
      canManageSystem: false,
    },
    marketing: {
      canViewFinancials: false,
      canManageUsers: false,
      canExportData: true,
      canManageAffiliates: true,
      canViewAnalytics: true,
      canManageSystem: false,
    },
    finance: {
      canViewFinancials: true,
      canManageUsers: false,
      canExportData: true,
      canManageAffiliates: false,
      canViewAnalytics: true,
      canManageSystem: false,
    },
    viewer: {
      canViewFinancials: false,
      canManageUsers: false,
      canExportData: false,
      canManageAffiliates: false,
      canViewAnalytics: true,
      canManageSystem: false,
    },
  };

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async createAdminUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<AdminAuthResult> {
    try {
      // Check if admin already exists
      const existingAdmin = await storage.getAdminUserByEmail(userData.email);
      if (existingAdmin) {
        return { success: false, error: "Admin user already exists" };
      }

      const existingUsername = await storage.getAdminUserByUsername(userData.username);
      if (existingUsername) {
        return { success: false, error: "Username already taken" };
      }

      const passwordHash = await this.hashPassword(userData.password);
      
      const adminUser = await storage.createAdminUser({
        username: userData.username,
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'admin',
        isActive: true,
      });

      return { success: true, adminUser };
    } catch (error) {
      return { success: false, error: "Failed to create admin user" };
    }
  }

  static async authenticateAdmin(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<AdminAuthResult> {
    try {
      console.log("AuthService: Looking up user:", username);
      const adminUser = await storage.getAdminUserByUsername(username);
      console.log("AuthService: User found:", !!adminUser, "Active:", adminUser?.isActive);
      
      if (!adminUser || !adminUser.isActive) {
        return { success: false, error: "Invalid credentials" };
      }

      console.log("AuthService: Verifying password against hash:", adminUser.passwordHash.substring(0, 20) + "...");
      const isValidPassword = await this.verifyPassword(password, adminUser.passwordHash);
      console.log("AuthService: Password valid:", isValidPassword);
      
      if (!isValidPassword) {
        return { success: false, error: "Invalid admin password" };
      }

      // Update last login
      await storage.updateAdminUserLastLogin(adminUser.id);

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

      await storage.createAdminSession({
        adminUserId: adminUser.id,
        sessionToken,
        expiresAt,
        ipAddress,
        userAgent,
      });

      // Remove password hash from response
      const { passwordHash, ...safeAdminUser } = adminUser;

      return { 
        success: true, 
        adminUser: safeAdminUser, 
        sessionToken 
      };
    } catch (error) {
      return { success: false, error: "Authentication failed" };
    }
  }

  static async validateSession(sessionToken: string): Promise<AdminAuthResult> {
    try {
      const session = await storage.getAdminSession(sessionToken);
      if (!session || new Date() > new Date(session.expiresAt)) {
        if (session) {
          await storage.deleteAdminSession(sessionToken);
        }
        return { success: false, error: "Session expired" };
      }

      const adminUser = await storage.getAdminUser(session.adminUserId);
      if (!adminUser || !adminUser.isActive) {
        await storage.deleteAdminSession(sessionToken);
        return { success: false, error: "Admin user not found or inactive" };
      }

      // Remove password hash from response
      const { passwordHash, ...safeAdminUser } = adminUser;

      return { success: true, adminUser: safeAdminUser };
    } catch (error) {
      return { success: false, error: "Session validation failed" };
    }
  }

  static async logout(sessionToken: string): Promise<boolean> {
    try {
      await storage.deleteAdminSession(sessionToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async cleanExpiredSessions(): Promise<void> {
    try {
      await storage.cleanExpiredAdminSessions();
    } catch (error) {
      console.error("Failed to clean expired sessions:", error);
    }
  }

  static getRolePermissions(role: string) {
    return this.ROLE_PERMISSIONS[role as keyof typeof this.ROLE_PERMISSIONS] || this.ROLE_PERMISSIONS.viewer;
  }
}