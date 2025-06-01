import { users, submissions, type User, type InsertUser, type Submission, type InsertSubmission } from "@shared/schema";
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

export const storage = new MemStorage();
