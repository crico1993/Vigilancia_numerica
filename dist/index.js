// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").$type().notNull().default("server" /* SERVER */),
  active: boolean("active").notNull().default(true),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var ActivityType = /* @__PURE__ */ ((ActivityType3) => {
  ActivityType3["TRAINING"] = "training";
  ActivityType3["SUPPORT"] = "support";
  ActivityType3["PUBLICATION"] = "publication";
  ActivityType3["EVENT"] = "event";
  ActivityType3["TRAVEL"] = "travel";
  ActivityType3["COURSE"] = "course";
  ActivityType3["INTERVIEW"] = "interview";
  ActivityType3["OMBUDSMAN"] = "ombudsman";
  ActivityType3["COMMUNICATION"] = "communication";
  ActivityType3["OTHER"] = "other";
  return ActivityType3;
})(ActivityType || {});
var activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").$type().notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  municipalities: text("municipalities").array(),
  // Array of involved municipalities
  files: json("files").$type(),
  // File attachments metadata
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow()
});
var logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true
});
var insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true
});
var loginSchema = z.object({
  email: z.string().email("Email inv\xE1lido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  remember: z.boolean().optional()
});

// server/utils.ts
import bcrypt from "bcryptjs";
function zValidationErrorToResponse(error) {
  const errors = error.errors.map((err) => {
    return {
      path: err.path.join("."),
      message: err.message
    };
  });
  return {
    message: "Validation error",
    errors
  };
}
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// server/storage.ts
var MemStorage = class {
  users;
  activities;
  logs;
  userCurrentId;
  activityCurrentId;
  logCurrentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.activities = /* @__PURE__ */ new Map();
    this.logs = /* @__PURE__ */ new Map();
    this.userCurrentId = 1;
    this.activityCurrentId = 1;
    this.logCurrentId = 1;
    this.createUser({
      email: "crico1993@gmail.com",
      password: "qwert1234",
      name: "Carlos Ricardo",
      role: "admin" /* ADMIN */,
      active: true
    });
    this.createUser({
      email: "server@example.com",
      password: "password123",
      name: "Ana Silva",
      role: "server" /* SERVER */,
      active: true
    });
    this.createUser({
      email: "manager@example.com",
      password: "password123",
      name: "Marcos Oliveira",
      role: "manager" /* MANAGER */,
      active: true
    });
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const hashedPassword = await hashPassword(insertUser.password);
    const role = insertUser.role ? insertUser.role : "server" /* SERVER */;
    const active = insertUser.active !== void 0 ? insertUser.active : true;
    const user = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      password: hashedPassword,
      role,
      active,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, data) {
    const user = this.users.get(id);
    if (!user) return void 0;
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async getUsers() {
    return Array.from(this.users.values());
  }
  // Activity operations
  async createActivity(insertActivity) {
    const id = this.activityCurrentId++;
    const type = insertActivity.type;
    const activity = {
      id,
      type,
      description: insertActivity.description,
      date: insertActivity.date instanceof Date ? insertActivity.date : new Date(insertActivity.date),
      userId: insertActivity.userId,
      municipalities: insertActivity.municipalities || null,
      files: Array.isArray(insertActivity.files) ? insertActivity.files : null,
      observations: insertActivity.observations || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
  async getActivity(id) {
    return this.activities.get(id);
  }
  async updateActivity(id, data) {
    const activity = this.activities.get(id);
    if (!activity) return void 0;
    const updatedActivity = { ...activity, ...data };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }
  async deleteActivity(id) {
    return this.activities.delete(id);
  }
  async getActivities() {
    return Array.from(this.activities.values());
  }
  async getActivitiesByUserId(userId) {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.userId === userId
    );
  }
  async getActivitiesByType(type) {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.type === type
    );
  }
  async getActivitiesByDate(startDate, endDate) {
    return Array.from(this.activities.values()).filter(
      (activity) => {
        const activityDate = activity.date instanceof Date ? activity.date : new Date(activity.date);
        return activityDate >= startDate && activityDate <= endDate;
      }
    );
  }
  // Log operations
  async createLog(insertLog) {
    const id = this.logCurrentId++;
    const log2 = {
      id,
      action: insertLog.action,
      userId: insertLog.userId,
      details: insertLog.details || {},
      // Garante que details nunca é undefined
      createdAt: /* @__PURE__ */ new Date()
    };
    this.logs.set(id, log2);
    return log2;
  }
  async getLogs() {
    return Array.from(this.logs.values());
  }
  async getLogsByUserId(userId) {
    return Array.from(this.logs.values()).filter(
      (log2) => log2.userId === userId
    );
  }
  // Authentication
  async validateCredentials(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isValid = await comparePassword(password, user.password);
    if (!isValid) return null;
    return user;
  }
};
var storage = new MemStorage();

// server/routes.ts
import session from "express-session";
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "vigilanciaemNumeros",
      resave: true,
      // Alterado para true para garantir que a sessão seja salva
      saveUninitialized: false,
      cookie: {
        secure: false,
        // Alterado para false para permitir cookies sem HTTPS em desenvolvimento
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1e3
        // 24 hours
      }
    })
  );
  const authenticate = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "N\xE3o autenticado. Fa\xE7a login para continuar." });
    }
    next();
  };
  const authorize = (roles) => {
    return (req, res, next) => {
      if (!req.session.userRole || !roles.includes(req.session.userRole)) {
        return res.status(403).json({ message: "Acesso n\xE3o autorizado." });
      }
      next();
    };
  };
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.validateCredentials(
        validatedData.email,
        validatedData.password
      );
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inv\xE1lidos." });
      }
      if (!user.active) {
        return res.status(403).json({ message: "Usu\xE1rio desativado. Contate o administrador." });
      }
      if (!user.approved && user.role !== "admin" /* ADMIN */) {
        return res.status(403).json({ message: "Seu cadastro est\xE1 aguardando aprova\xE7\xE3o pelo administrador." });
      }
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.userName = user.name;
      await storage.createLog({
        userId: user.id,
        action: "LOGIN",
        details: { ip: req.ip }
      });
      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json(zValidationErrorToResponse(error));
      }
      return res.status(500).json({ message: "Erro no servidor." });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    if (req.session.userId) {
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
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "N\xE3o autenticado" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {
      });
      return res.status(401).json({ message: "Usu\xE1rio n\xE3o encontrado" });
    }
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  });
  app2.post("/api/users/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse({
        ...req.body,
        role: "server" /* SERVER */,
        // Sempre registra como SERVER por segurança
        approved: false
        // Novo usuário inicia como não aprovado
      });
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email j\xE1 cadastrado. Escolha outro email." });
      }
      const user = await storage.createUser(validatedData);
      await storage.createLog({
        userId: user.id,
        action: "SELF_REGISTER",
        details: { ip: req.ip }
      });
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        approved: user.approved,
        message: "Cadastro realizado com sucesso! Aguarde a aprova\xE7\xE3o do administrador para acessar o sistema."
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json(zValidationErrorToResponse(error));
      }
      return res.status(500).json({ message: "Erro ao criar usu\xE1rio." });
    }
  });
  app2.get("/api/users", authenticate, authorize(["admin" /* ADMIN */]), async (req, res) => {
    try {
      const users2 = await storage.getUsers();
      const safeUsers = users2.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt
      }));
      return res.status(200).json(safeUsers);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter usu\xE1rios." });
    }
  });
  app2.post("/api/users", authenticate, authorize(["admin" /* ADMIN */]), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email j\xE1 cadastrado." });
      }
      const user = await storage.createUser(validatedData);
      await storage.createLog({
        userId: req.session.userId,
        action: "CREATE_USER",
        details: { targetUserId: user.id, targetEmail: user.email }
      });
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json(zValidationErrorToResponse(error));
      }
      return res.status(500).json({ message: "Erro ao criar usu\xE1rio." });
    }
  });
  app2.patch("/api/users/:id", authenticate, authorize(["admin" /* ADMIN */]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usu\xE1rio inv\xE1lido." });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado." });
      }
      const allowedFields = ["name", "role", "active", "password"];
      const updateData = Object.keys(req.body).filter((key) => allowedFields.includes(key)).reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
      const updatedUser = await storage.updateUser(userId, updateData);
      await storage.createLog({
        userId: req.session.userId,
        action: "UPDATE_USER",
        details: { targetUserId: userId, fields: Object.keys(updateData) }
      });
      return res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        active: updatedUser.active
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar usu\xE1rio." });
    }
  });
  app2.post("/api/users/reset-password/:id", authenticate, authorize(["admin" /* ADMIN */]), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usu\xE1rio inv\xE1lido." });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado." });
      }
      const { password } = req.body;
      if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "Senha inv\xE1lida. Deve ter pelo menos 6 caracteres." });
      }
      await storage.updateUser(userId, { password });
      await storage.createLog({
        userId: req.session.userId,
        action: "RESET_PASSWORD",
        details: { targetUserId: userId }
      });
      return res.status(200).json({ message: "Senha redefinida com sucesso." });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao redefinir senha." });
    }
  });
  app2.get("/api/activities", authenticate, async (req, res) => {
    try {
      let activities3 = [];
      if (req.session.userRole === "server" /* SERVER */) {
        activities3 = await storage.getActivitiesByUserId(req.session.userId);
      } else {
        activities3 = await storage.getActivities();
      }
      const typeFilter = req.query.type;
      if (typeFilter && Object.values(ActivityType).includes(typeFilter)) {
        activities3 = activities3.filter((a) => a.type === typeFilter);
      }
      const startDateStr = req.query.startDate;
      const endDateStr = req.query.endDate;
      if (startDateStr && endDateStr) {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          activities3 = activities3.filter((a) => {
            const activityDate = new Date(a.date);
            return activityDate >= startDate && activityDate <= endDate;
          });
        }
      }
      return res.status(200).json(activities3);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter atividades." });
    }
  });
  app2.post("/api/activities", authenticate, async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      const activity = await storage.createActivity(validatedData);
      await storage.createLog({
        userId: req.session.userId,
        action: "CREATE_ACTIVITY",
        details: { activityId: activity.id, activityType: activity.type }
      });
      return res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json(zValidationErrorToResponse(error));
      }
      return res.status(500).json({ message: "Erro ao criar atividade." });
    }
  });
  app2.get("/api/activities/:id", authenticate, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "ID de atividade inv\xE1lido." });
      }
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade n\xE3o encontrada." });
      }
      if (req.session.userRole === "server" /* SERVER */ && activity.userId !== req.session.userId) {
        return res.status(403).json({ message: "Acesso n\xE3o autorizado a esta atividade." });
      }
      return res.status(200).json(activity);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter atividade." });
    }
  });
  app2.patch("/api/activities/:id", authenticate, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "ID de atividade inv\xE1lido." });
      }
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade n\xE3o encontrada." });
      }
      if (activity.userId !== req.session.userId && req.session.userRole !== "admin" /* ADMIN */) {
        return res.status(403).json({ message: "Somente o criador da atividade ou um administrador pode edit\xE1-la." });
      }
      const { userId, ...updateData } = req.body;
      const updatedActivity = await storage.updateActivity(activityId, updateData);
      await storage.createLog({
        userId: req.session.userId,
        action: "UPDATE_ACTIVITY",
        details: { activityId, fields: Object.keys(updateData) }
      });
      return res.status(200).json(updatedActivity);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao atualizar atividade." });
    }
  });
  app2.delete("/api/activities/:id", authenticate, async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "ID de atividade inv\xE1lido." });
      }
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Atividade n\xE3o encontrada." });
      }
      if (activity.userId !== req.session.userId && req.session.userRole !== "admin" /* ADMIN */) {
        return res.status(403).json({ message: "Somente o criador da atividade ou um administrador pode exclu\xED-la." });
      }
      await storage.deleteActivity(activityId);
      await storage.createLog({
        userId: req.session.userId,
        action: "DELETE_ACTIVITY",
        details: { activityId, activityType: activity.type }
      });
      return res.status(200).json({ message: "Atividade exclu\xEDda com sucesso." });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao excluir atividade." });
    }
  });
  app2.get("/api/statistics", authenticate, async (req, res) => {
    try {
      let activities3 = [];
      if (req.session.userRole === "server" /* SERVER */) {
        activities3 = await storage.getActivitiesByUserId(req.session.userId);
      } else {
        activities3 = await storage.getActivities();
      }
      const stats = {
        totalActivities: activities3.length,
        byType: {},
        byMonth: {},
        recentTrend: 0
      };
      activities3.forEach((activity) => {
        stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      });
      activities3.forEach((activity) => {
        const date = new Date(activity.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        stats.byMonth[monthYear] = (stats.byMonth[monthYear] || 0) + 1;
      });
      const now = /* @__PURE__ */ new Date();
      const thisMonth = now.getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const thisYear = now.getFullYear();
      const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      const thisMonthKey = `${thisYear}-${thisMonth + 1}`;
      const lastMonthKey = `${lastYear}-${lastMonth + 1}`;
      const thisMonthCount = stats.byMonth[thisMonthKey] || 0;
      const lastMonthCount = stats.byMonth[lastMonthKey] || 0;
      if (lastMonthCount > 0) {
        stats.recentTrend = (thisMonthCount - lastMonthCount) / lastMonthCount * 100;
      }
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter estat\xEDsticas." });
    }
  });
  app2.get("/api/logs", authenticate, authorize(["admin" /* ADMIN */]), async (req, res) => {
    try {
      const logs2 = await storage.getLogs();
      return res.status(200).json(logs2);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao obter logs." });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
