import { users, submissions, aiRecommendations, emailCache, type User, type InsertUser, type Submission, type InsertSubmission } from "@shared/schema";
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
  createSubmission(submission: Omit<Submission, 'id' | 'createdAt'>): Promise<Submission>;
  getAllSubmissions(): Promise<Submission[]>;
  createAIRecommendation(recommendation: Omit<any, 'id' | 'createdAt'>): Promise<any>;
  getAllAIRecommendations(): Promise<any[]>;
  checkEmailExists(email: string): Promise<boolean>;
  updateEmailCache(email: string, name: string): Promise<void>;
  getEmailInfo(email: string): Promise<{ name: string; submissionCount: number } | null>;
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

  async getAllSubmissions(): Promise<Submission[]> {
    return await db.select().from(submissions);
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
