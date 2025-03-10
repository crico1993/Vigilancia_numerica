import { ActivityType, UserRole, FileData } from '@shared/schema';

// Extended User type with additional front-end properties
export interface UserWithMeta {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
  createdAt?: string | Date;
}

// Extended Activity type with additional front-end properties
export interface ActivityWithMeta {
  id: number;
  type: ActivityType;
  description: string;
  date: string | Date;
  userId: number;
  municipalities?: string[];
  files?: FileData[];
  observations?: string;
  createdAt: string | Date;
  
  // Frontend-only fields
  userName?: string;
  userInitials?: string;
  isOwner?: boolean;
}

// Dashboard statistics interface
export interface DashboardStats {
  totalActivities: number;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
  recentTrend: number;
}

// Activity filter options
export interface ActivityFilters {
  type?: string;
  startDate?: string;
  endDate?: string;
  userId?: number;
  municipality?: string;
}

// Form data for activity creation/update
export interface ActivityFormData {
  type: ActivityType;
  description: string;
  date: string;
  time: string;
  municipalities?: string[];
  files?: File[];
  observations?: string;
}

// Report generation options
export interface ReportOptions {
  startDate: Date;
  endDate: Date;
  activityType?: string;
  userId?: number;
  municipality?: string;
  format: 'pdf' | 'excel';
  includeCharts: boolean;
  includeDetails: boolean;
}

// User form data
export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
}

// Password change form data
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
