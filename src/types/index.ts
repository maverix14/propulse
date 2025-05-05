
import { z } from "zod";

// User Level Enum
export enum UserLevel {
  Level1 = "Level 1",
  Level2 = "Level 2",
  Custom = "Custom"
}

// Status Level type (0-5)
export type StatusLevel = 0 | 1 | 2 | 3 | 4 | 5;

// User type
export interface User {
  id: string;
  username: string;
  level: UserLevel;
  note?: string;
  dailyStatus?: Record<string, StatusLevel>;
  monthlyStatus?: Record<string, number>;
}

// Project type
export interface Project {
  id: string;
  name: string;
  description: string;
  icon?: string;
  tags?: string[];
  note?: string;
  users: User[];
  created_at?: string; // Added this field to match Supabase
  integrations?: {
    github?: string;
    vercel?: string;
    supabase?: string;
  };
}

// Project Creation Schema
export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const userLevelSettingsSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Level name is required"),
  dailyLimit: z.union([z.number().int().positive(), z.null()]),
  monthlyLimit: z.number().int().positive(),
});

// Helper function to check if user has reached daily limit
export const hasReachedDailyLimit = (user: User, currentDate: string): boolean => {
  if (user.level === UserLevel.Level1) {
    return (user.dailyStatus?.[currentDate] || 0) >= 5;
  }
  return false;
};

// Helper function to check if user has reached monthly limit
export const hasReachedMonthlyLimit = (user: User, currentMonth: string): boolean => {
  const monthlyLimit = user.level === UserLevel.Level1 ? 30 : 100;
  return (user.monthlyStatus?.[currentMonth] || 0) >= monthlyLimit;
};

// Helper function to get project statistics
export const getProjectStats = (project: Project, currentDate: string) => {
  const userCount = project.users.length;
  
  const dailyStatusSum = project.users.reduce((sum, user) => {
    const dailyStatus = user.dailyStatus?.[currentDate] || 0;
    return sum + dailyStatus;
  }, 0);
  
  const averageStatus = userCount > 0 ? dailyStatusSum / userCount : 0;
  
  return { userCount, dailyStatusSum, averageStatus };
};
