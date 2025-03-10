import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

// Get user role label
export function getRoleLabel(role: string): string {
  const roles: Record<string, string> = {
    'ADMIN': 'Administrador',
    'SERVER': 'Servidor',
    'MANAGER': 'Gestor'
  };

  return roles[role] || 'Desconhecido';
}

// Get initials from a name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate a PDF export filename
export function generateExportFilename(prefix: string, extension: string): string {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  return `${prefix}_${formattedDate}.${extension}`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}


// Function to get a readable label for user role
export function getUserRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'MANAGER':
      return 'Gestor';
    case 'SERVER':
      return 'Servidor';
    default:
      return 'Desconhecido';
  }
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

// Obter rótulo do tipo de atividade
//export function getActivityTypeLabel(type: string): string {
//  const labelMap: Record<string, string> = {
//    training: 'Capacitação',
//    support: 'Suporte',
//    publication: 'Publicação',
//    event: 'Evento',
//    travel: 'Viagem',
//    course: 'Curso',
//    interview: 'Entrevista',
//    ombudsman: 'Ouvidoria',
//    communication: 'Comunicação',
//    other: 'Outra',
//  };
//
//  return labelMap[type] || 'Desconhecido';
//}
//
// Obter cor para o tipo de atividade
//export function getActivityTypeColor(type: string): string {
//  const colorMap: Record<string, string> = {
//    training: 'blue',
//    support: 'green',
//    publication: 'amber',
//    event: 'purple',
//    travel: 'indigo',
//    course: 'cyan',
//    interview: 'pink',
//    ombudsman: 'rose',
//    communication: 'orange',
//    other: 'gray',
//  };
//
//  return colorMap[type] || 'gray';
//}
//
// Obter rótulo para o papel do usuário
//export function getUserRoleLabel(role: string): string {
//  const roleMap: Record<string, string> = {
//    admin: 'Administrador',
//    manager: 'Gestor',
//    server: 'Servidor',
//  };
//
//  return roleMap[role] || 'Desconhecido';
//}

// Gerar PDF para exportação de relatórios
export async function generatePdfReport(data: any) {
  // Implementação placeholder
  console.log('Gerando PDF com dados:', data);
  return new Promise(resolve => setTimeout(resolve, 1000));
}

// Gerar Excel para exportação de relatórios
export async function generateExcelReport(data: any) {
  // Implementação placeholder
  console.log('Gerando Excel com dados:', data);
  return new Promise(resolve => setTimeout(resolve, 1000));
}