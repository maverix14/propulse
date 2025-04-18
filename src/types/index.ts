// Define the core types for the application

export interface User {
  id: string;
  username: string;
  level: UserLevel;
  dailyStatus: { [date: string]: number }; // Store daily statuses by date
  monthlyStatus: { [month: string]: number }; // Store monthly aggregated statuses
  note: string;
}

export enum UserLevel {
  Level1 = 1,
  Level2 = 2
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  icon?: string;
  users: User[];
  tags?: string[]; // Add tags property for platform tags
}

export type StatusLevel = 1 | 2 | 3 | 4 | 5;

// Helper functions to compute project statistics
export const getProjectStats = (project: Project, currentDate: string) => {
  const userCount = project.users.length;
  
  // Calculate sum of today's statuses
  const dailyStatusSum = project.users.reduce((sum, user) => {
    return sum + (user.dailyStatus?.[currentDate] || 0);
  }, 0);

  // Calculate average status (if there are users)
  const averageStatus = userCount > 0 
    ? Math.round((dailyStatusSum / userCount) * 10) / 10 
    : 0;

  return {
    userCount,
    dailyStatusSum,
    averageStatus,
  };
};

// Helper function to check if user has reached their daily point limit
export const hasReachedDailyLimit = (user: User, currentDate: string): boolean => {
  const dailyPoints = user.dailyStatus?.[currentDate] || 0;
  
  // Level 1 users have a 5 point daily limit, Level 2 users have no daily limit
  return user.level === UserLevel.Level1 && dailyPoints >= 5;
};

// Helper function to check if user has reached their monthly point limit
export const hasReachedMonthlyLimit = (user: User, currentMonth: string): boolean => {
  const monthlyPoints = user.monthlyStatus?.[currentMonth] || 0;
  
  // Level 1 users have a 30 point monthly limit, Level 2 users have a 100 point monthly limit
  return (user.level === UserLevel.Level1 && monthlyPoints >= 30) || 
         (user.level === UserLevel.Level2 && monthlyPoints >= 100);
};
