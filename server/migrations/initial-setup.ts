import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { users, activities, logs } from "@shared/schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "../utils";

async function runInitialSetup() {
  console.log("Iniciando configuração inicial do banco de dados");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não está definido nas variáveis de ambiente.");
  }

  const pg = postgres(connectionString);
  const db = drizzle(pg);

  try {
    // Create tables
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'server',
        active BOOLEAN NOT NULL DEFAULT TRUE,
        approved BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        municipalities TEXT[],
        files JSONB,
        observations TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("Tabelas criadas com sucesso");

    // Seed initial data
    const adminUser = {
      email: "admin@example.com",
      password: await hashPassword("admin123"),
      name: "Admin",
      role: "admin",
      active: true,
      approved: true,
    };

    await db.insert(users).values(adminUser);
    console.log("Dados iniciais inseridos com sucesso");

    console.log("Configuração inicial concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a configuração inicial:", error);
    process.exit(1);
  }
}

runInitialSetup();
