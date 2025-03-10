import { pgTable, text, serial, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export enum UserRole {
  ADMIN = "admin",
  SERVER = "server",
  MANAGER = "manager"
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").$type<UserRole>().notNull().default(UserRole.SERVER),
  active: boolean("active").notNull().default(true),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity types
export enum ActivityType {
  TRAINING = "training", // Capacitações
  SUPPORT = "support", // Suportes
  PUBLICATION = "publication", // Publicações
  EVENT = "event", // Eventos
  TRAVEL = "travel", // Viagens
  COURSE = "course", // Cursos
  INTERVIEW = "interview", // Entrevistas
  OMBUDSMAN = "ombudsman", // Ouvidoria
  COMMUNICATION = "communication", // Comunicação
  OTHER = "other" // Outras
}

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").$type<ActivityType>().notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  municipalities: text("municipalities").array(), // Array of involved municipalities
  files: json("files").$type<FileData[]>(), // File attachments metadata
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// File data interface
export interface FileData {
  name: string;
  type: string;
  size: number;
  content: string; // Base64 encoded content
}

// Logs table for audit trail
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas and types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertLog = z.infer<typeof insertLogSchema>;
export type Log = typeof logs.$inferSelect;

// Extended schemas for validation
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  remember: z.boolean().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;
