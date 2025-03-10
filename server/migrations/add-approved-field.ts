import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { sql } from "drizzle-orm";

async function runMigration() {
  console.log("Iniciando migração para adicionar campo 'approved' à tabela 'users'");
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não está definido nas variáveis de ambiente.");
  }

  const pg = postgres(connectionString);
  const db = drizzle(pg);
  
  try {
    // Verificar se a coluna já existe
    const columnsResult = await db.select({ name: sql<string>`column_name` })
      .from(sql`information_schema.columns`)
      .where(sql`table_name = 'users'`)
      .all();
    
    const columnNames = columnsResult.map(col => col.name);
    
    if (columnNames.includes('approved')) {
      console.log("A coluna 'approved' já existe na tabela 'users'");
    } else {
      // Adicionar a coluna 'approved'
      await db.run(sql`ALTER TABLE users ADD COLUMN approved BOOLEAN NOT NULL DEFAULT FALSE`);
      console.log("Coluna 'approved' adicionada com sucesso à tabela 'users'");
      
      // Definir todos os usuários admin como aprovados
      await db.run(sql`UPDATE users SET approved = TRUE WHERE role = 'admin'`);
      console.log("Todos os usuários admin definidos como aprovados");
    }
    
    console.log("Migração concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a migração:", error);
    process.exit(1);
  }
}

runMigration();
