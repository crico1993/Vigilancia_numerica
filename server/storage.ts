import { User, InsertUser, Activity, InsertActivity, Log, InsertLog, UserRole, activities, ActivityType, users, logs } from "@shared/schema";
import { hashPassword, comparePassword } from "./utils";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, gte, lte } from "drizzle-orm/expressions";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivity(id: number): Promise<Activity | undefined>;
  updateActivity(id: number, data: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  getActivities(): Promise<Activity[]>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  getActivitiesByType(type: ActivityType): Promise<Activity[]>;
  getActivitiesByDate(startDate: Date, endDate: Date): Promise<Activity[]>;
  
  // Log operations
  createLog(log: InsertLog): Promise<Log>;
  getLogs(): Promise<Log[]>;
  getLogsByUserId(userId: number): Promise<Log[]>;
  
  // Authentication
  validateCredentials(email: string, password: string): Promise<User | null>;
}

export class MemStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL não está definido nas variáveis de ambiente.");
    }
    const pg = postgres(connectionString);
    this.db = drizzle(pg);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1).all();
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1).all();
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const user = { ...insertUser, password: hashedPassword };
    const result = await this.db.insert(users).values(user).returning().all();
    return result[0];
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    const result = await this.db.update(users).set(data).where(eq(users.id, id)).returning().all();
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return await this.db.select().from(users).all();
  }

  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const result = await this.db.insert(activities).values(insertActivity).returning().all();
    return result[0];
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const result = await this.db.select().from(activities).where(eq(activities.id, id)).limit(1).all();
    return result[0];
  }

  async updateActivity(id: number, data: Partial<Activity>): Promise<Activity | undefined> {
    const result = await this.db.update(activities).set(data).where(eq(activities.id, id)).returning().all();
    return result[0];
  }

  async deleteActivity(id: number): Promise<boolean> {
    const result = await this.db.delete(activities).where(eq(activities.id, id)).returning().all();
    return result.length > 0;
  }

  async getActivities(): Promise<Activity[]> {
    return await this.db.select().from(activities).all();
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return await this.db.select().from(activities).where(eq(activities.userId, userId)).all();
  }

  async getActivitiesByType(type: ActivityType): Promise<Activity[]> {
    return await this.db.select().from(activities).where(eq(activities.type, type)).all();
  }

  async getActivitiesByDate(startDate: Date, endDate: Date): Promise<Activity[]> {
    return await this.db.select().from(activities).where(and(gte(activities.date, startDate), lte(activities.date, endDate))).all();
  }

  // Log operations
  async createLog(insertLog: InsertLog): Promise<Log> {
    const result = await this.db.insert(logs).values(insertLog).returning().all();
    return result[0];
  }

  async getLogs(): Promise<Log[]> {
    return await this.db.select().from(logs).all();
  }

  async getLogsByUserId(userId: number): Promise<Log[]> {
    return await this.db.select().from(logs).where(eq(logs.userId, userId)).all();
  }

  // Authentication
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await comparePassword(password, user.password);
    if (!isValid) return null;
    
    return user;
  }
}

export const storage = new MemStorage();
