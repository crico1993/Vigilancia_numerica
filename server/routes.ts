import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import session from "express-session";
import { z } from "zod";
import { 
  loginSchema, 
  insertUserSchema, 
  insertActivitySchema, 
  insertLogSchema,
  ActivityType, 
  UserRole 
} from "@shared/schema";
import { zValidationErrorToResponse, comparePassword, hashPassword } from "./utils";

// Define a type for our session data
declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: UserRole;
    userName: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Middleware to check authentication
  const authenticate = (req: Request, res: Response, next: () => void) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autenticado." });
    }
    next();
  };

  // Middleware to check authorization
  const authorize = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: () => void) => {
      if (!req.session.userRole || !roles.includes(req.session.userRole as UserRole)) {
        return res.status(403).json({ message: "Acesso não autorizado." });
      }
      next();
    };
  };

  // AUTH ROUTES
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.validateCredentials(
        validatedData.email,
        validatedData.password
      );
      
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos." });
      }

      if (!user.active) {
        return res.status(403).json({ message: "Usuário desativado. Contate o administrador." });
      }

      if (!user.approved && user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Aguardando aprovação" });
      }

      // Set session data
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.userName = user.name;

      // Log the login
      await storage.createLog({
        userId: user.id,
        action: "LOGIN",
        details: { ip: req.ip }
      });

      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(zValidationErrorToResponse(error));
      }
      return res.status(500).json({ message: "Erro no servidor." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    if (req.session.userId) {
      // Log the logout
      storage.createLog({
        userId: req.session.userId,
        action: "LOGOUT",
        details: { ip: req.ip }
      });
    }
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout." });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logout realizado com sucesso." });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      // Session exists but user doesn't - clear session
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved
    });
  });

  // USER REGISTRATION (public route)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse({
        ...req.body,
        role: UserRole.SERVER, // Force role to SERVER for public registrations
        active: true, // New accounts are active by default
        approved: false // But need approval
      });
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado." });
      }

      // Create the user
      const user = await storage.createUser(validatedData);
      
      // Return success response
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        approved: user.approved,
        message: "Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(zValidationErrorToResponse(error));
      }
      return res.status(500).json({ message: "Erro ao criar usuário." });
    }
  });

  // USER ROUTES
  app.get("/api/users", authenticate, authorize([UserRole.ADMIN]), async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Don't return password hash
      const safeUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        approved: user.approved,
        createdAt: user.createdAt
      }));
      
      return res.status(200).json(safeUsers);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter usuários." });
    }
  });

  app.post("/api/users", authenticate, authorize([UserRole.ADMIN]), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado." });
      }

      const user = await storage.createUser(validatedData);
      
      // Log the user creation
      await storage.createLog({
        userId: req.session.userId!,
        action: "CREATE_USER",
        details: { targetUserId: user.id, targetEmail: user.email }
      });

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        approved: user.approved
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(zValidationErrorToResponse(error));
      }
      return res.status(500).json({ message: "Erro ao criar usuário." });
    }
  });

  app.patch("/api/users/:id", authenticate, authorize([UserRole.ADMIN]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuário inválido." });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      // Only allow certain fields to be updated
      const allowedFields = ["name", "role", "active", "approved"];
      const updates: Record<string, any> = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Nenhum campo válido para atualizar." });
      }

      const updatedUser = await storage.updateUser(userId, updates);
      
      // Log the user update
      await storage.createLog({
        userId: req.session.userId!,
        action: "UPDATE_USER",
        details: { 
          targetUserId: userId, 
          updates: updates 
        }
      });

      if (!updatedUser) {
        return res.status(500).json({ message: "Erro ao atualizar usuário." });
      }

      return res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        active: updatedUser.active,
        approved: updatedUser.approved
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar usuário." });
    }
  });

  app.post("/api/users/:id/reset-password", authenticate, authorize([UserRole.ADMIN]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuário inválido." });
      }

      if (!req.body.password || typeof req.body.password !== 'string' || req.body.password.length < 6) {
        return res.status(400).json({ message: "Nova senha inválida. Deve ter pelo menos 6 caracteres." });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Update the user's password
      await storage.updateUser(userId, { password: hashedPassword });
      
      // Log the password reset
      await storage.createLog({
        userId: req.session.userId!,
        action: "RESET_USER_PASSWORD",
        details: { targetUserId: userId }
      });

      return res.status(200).json({ message: "Senha redefinida com sucesso." });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao redefinir senha." });
    }
  });

  // ACTIVITY ROUTES
  app.get("/api/activities", authenticate, async (req, res) => {
    try {
      let activities = [];
      
      // Filter by user if not a manager/admin
      if (req.session.userRole === UserRole.SERVER) {
        activities = await storage.getActivitiesByUserId(req.session.userId!);
      } else {
        activities = await storage.getActivities();
      }
      
      // Apply type filter if provided
      const typeFilter = req.query.type as string;
      if (typeFilter && Object.values(ActivityType).includes(typeFilter as ActivityType)) {
        activities = activities.filter(a => a.type === typeFilter);
      }
      
      // Apply date filters if provided
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      if (startDateStr && endDateStr) {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          activities = activities.filter(a => {
            const activityDate = new Date(a.date);
            return activityDate >= startDate && activityDate <= endDate;
          });
        }
      }
      
      return res.status(200).json(activities);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter atividades." });
    }
  });

  app.post("/api/activities", authenticate, async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const activity = await storage.createActivity(validatedData);
      
      // Log the activity creation
      await storage.createLog({
        userId: req.session.userId!,
        action: "CREATE_ACTIVITY",
        details: { activityId: activity.id, activityType: activity.type }
      });
      
      return res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(zValidationErrorToResponse(error));
      }
      return res.status(500).json({ message: "Erro ao criar atividade." });
    }
  });

  app.get("/api/activities/:id", authenticate, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "ID de atividade inválido." });
      }

      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada." });
      }

      // Check if user is permitted to see this activity
      if (req.session.userRole === UserRole.SERVER && activity.userId !== req.session.userId) {
        return res.status(403).json({ message: "Acesso não autorizado a esta atividade." });
      }

      return res.status(200).json(activity);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter atividade." });
    }
  });

  app.patch("/api/activities/:id", authenticate, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "ID de atividade inválido." });
      }

      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada." });
      }

      // Only owner or admin can edit
      if (activity.userId !== req.session.userId && req.session.userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Acesso não autorizado para editar esta atividade." });
      }

      // Fields that are allowed to be updated
      const allowedFields = ["type", "description", "date", "location", "participants", "outcome", "attachments"];
      const updates: Record<string, any> = {};
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Nenhum campo válido para atualizar." });
      }

      const updatedActivity = await storage.updateActivity(activityId, updates);
      
      // Log the activity update
      await storage.createLog({
        userId: req.session.userId!,
        action: "UPDATE_ACTIVITY",
        details: { 
          activityId: activityId, 
          activityType: activity.type,
          updates: updates 
        }
      });

      return res.status(200).json(updatedActivity);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar atividade." });
    }
  });

  app.delete("/api/activities/:id", authenticate, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "ID de atividade inválido." });
      }

      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada." });
      }

      // Only owner or admin can delete
      if (activity.userId !== req.session.userId && req.session.userRole !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Acesso não autorizado para excluir esta atividade." });
      }

      await storage.deleteActivity(activityId);
      
      // Log the activity deletion
      await storage.createLog({
        userId: req.session.userId!,
        action: "DELETE_ACTIVITY",
        details: { 
          activityId: activityId, 
          activityType: activity.type
        }
      });

      return res.status(200).json({ message: "Atividade excluída com sucesso." });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao excluir atividade." });
    }
  });

  // STATISTICS ROUTES
  app.get("/api/statistics", authenticate, async (req, res) => {
    try {
      let activities = [];
      
      // Filter by user or get all based on role
      if (req.session.userRole === UserRole.SERVER) {
        activities = await storage.getActivitiesByUserId(req.session.userId!);
      } else {
        activities = await storage.getActivities();
      }
      
      // Basic statistics
      const stats = {
        totalActivities: activities.length,
        byType: {} as Record<string, number>,
        byMonth: {} as Record<string, number>,
        byUser: {} as Record<string, number>,
        recentTrend: 0 // Percentage change from last month
      };
      
      // Count by type
      activities.forEach(activity => {
        // By type
        stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
        
        // By month (format: "YYYY-MM")
        const date = new Date(activity.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
        
        // By user
        stats.byUser[activity.userId] = (stats.byUser[activity.userId] || 0) + 1;
      });
      
      // Calculate trend (current month vs previous month)
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const lastMonthKey = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;

      const thisMonthCount = stats.byMonth[currentMonthKey] || 0;
      const lastMonthCount = stats.byMonth[lastMonthKey] || 0;

      if (lastMonthCount > 0) {
        stats.recentTrend = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
      }

      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter estatísticas." });
    }
  });

  // LOGS ROUTE (admin only)
  app.get("/api/logs", authenticate, authorize([UserRole.ADMIN]), async (req, res) => {
    try {
      const logs = await storage.getLogs();
      return res.status(200).json(logs);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter logs." });
    }
  });

  return httpServer;
}
