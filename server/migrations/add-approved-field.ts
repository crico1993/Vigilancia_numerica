import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";

async function runMigration() {
  console.log("Iniciando migração para adicionar campo 'approved' à tabela 'users'");
  
  const sqlite = new Database("./data.db");
  const db = drizzle(sqlite);
  
  try {
    // Verificar se a coluna já existe
    const columnsResult = await db.select({ name: sql<string>`name` })
      .from(sql`pragma_table_info('users')`)
      .all();
    
    const columnNames = columnsResult.map(col => col.name);
    
    if (columnNames.includes('approved')) {
      console.log("A coluna 'approved' já existe na tabela 'users'");
    } else {
      // Adicionar a coluna 'approved'
      await db.run(sql`ALTER TABLE users ADD COLUMN approved INTEGER NOT NULL DEFAULT 0`);
      console.log("Coluna 'approved' adicionada com sucesso à tabela 'users'");
      
      // Definir todos os usuários admin como aprovados
      await db.run(sql`UPDATE users SET approved = 1 WHERE role = 'admin'`);
      console.log("Todos os usuários admin definidos como aprovados");
    }
    
    console.log("Migração concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a migração:", error);
    process.exit(1);
  }
}

runMigration();
