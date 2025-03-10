import { User, InsertUser, Activity, InsertActivity, Log, InsertLog, UserRole, activities, ActivityType } from "@shared/schema";
import { hashPassword, comparePassword } from "./utils";

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
  private users: Map<number, User>;
  private activities: Map<number, Activity>;
  private logs: Map<number, Log>;
  userCurrentId: number;
  activityCurrentId: number;
  logCurrentId: number;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.logs = new Map();
    this.userCurrentId = 1;
    this.activityCurrentId = 1;
    this.logCurrentId = 1;
    
    // Create default admin user
    this.createUser({
      email: "crico1993@gmail.com",
      password: "qwert1234",
      name: "Carlos Ricardo",
      role: UserRole.ADMIN,
      active: true
    });
    
    // Create a sample server user
    this.createUser({
      email: "server@example.com",
      password: "password123",
      name: "Ana Silva",
      role: UserRole.SERVER,
      active: true
    });
    
    // Create a sample manager user
    this.createUser({
      email: "manager@example.com",
      password: "password123",
      name: "Marcos Oliveira",
      role: UserRole.MANAGER,
      active: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const hashedPassword = await hashPassword(insertUser.password);
    
    // Garantir que o role seja um valor válido do enum UserRole
    const role = insertUser.role ? insertUser.role as UserRole : UserRole.SERVER;
    const active = insertUser.active !== undefined ? insertUser.active : true;
    
    const user: User = { 
      id,
      name: insertUser.name,
      email: insertUser.email,
      password: hashedPassword,
      role,
      active,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    // If updating password, hash it
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Activity operations
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    
    // Garantir que o tipo de atividade seja um valor válido do enum ActivityType
    const type = insertActivity.type as ActivityType;
    
    const activity: Activity = { 
      id,
      type,
      description: insertActivity.description,
      date: insertActivity.date instanceof Date ? insertActivity.date : new Date(insertActivity.date),
      userId: insertActivity.userId,
      municipalities: insertActivity.municipalities || null,
      files: Array.isArray(insertActivity.files) ? insertActivity.files : null,
      observations: insertActivity.observations || null,
      createdAt: new Date()
    };
    
    this.activities.set(id, activity);
    return activity;
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async updateActivity(id: number, data: Partial<Activity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;

    const updatedActivity = { ...activity, ...data };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }

  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.userId === userId
    );
  }

  async getActivitiesByType(type: ActivityType): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.type === type
    );
  }

  async getActivitiesByDate(startDate: Date, endDate: Date): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => {
        const activityDate = activity.date instanceof Date 
          ? activity.date 
          : new Date(activity.date);
        
        return activityDate >= startDate && activityDate <= endDate;
      }
    );
  }

  // Log operations
  async createLog(insertLog: InsertLog): Promise<Log> {
    const id = this.logCurrentId++;
    const log: Log = { 
      id,
      action: insertLog.action,
      userId: insertLog.userId,
      details: insertLog.details || {}, // Garante que details nunca é undefined
      createdAt: new Date()
    };
    this.logs.set(id, log);
    return log;
  }

  async getLogs(): Promise<Log[]> {
    return Array.from(this.logs.values());
  }

  async getLogsByUserId(userId: number): Promise<Log[]> {
    return Array.from(this.logs.values()).filter(
      (log) => log.userId === userId
    );
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
