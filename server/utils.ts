import { z } from "zod";
import bcrypt from "bcryptjs";

// Convert Zod validation errors to a more readable format
export function zValidationErrorToResponse(error: z.ZodError) {
  const errors = error.errors.map(err => {
    return {
      path: err.path.join('.'),
      message: err.message,
    };
  });

  return {
    message: "Validation error",
    errors,
  };
}

// Password hashing and validation
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Format date to display in the application
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

// Format date and time
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

// Get color for activity type
export function getActivityTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    training: 'blue',
    support: 'green',
    publication: 'amber',
    event: 'purple',
    travel: 'indigo',
    course: 'cyan',
    interview: 'pink',
    ombudsman: 'rose',
    communication: 'orange',
    other: 'gray',
  };
  
  return colorMap[type] || 'gray';
}

// Get activity type label in Portuguese
export function getActivityTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    training: 'Capacitação',
    support: 'Suporte',
    publication: 'Publicação',
    event: 'Evento',
    travel: 'Viagem',
    course: 'Curso',
    interview: 'Entrevista',
    ombudsman: 'Ouvidoria',
    communication: 'Comunicação',
    other: 'Outra',
  };
  
  return labelMap[type] || 'Desconhecido';
}

// Check for DATABASE_URL environment variable
export function checkDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }
}
