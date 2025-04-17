
// Define the core types for the application

export interface User {
  id: string;
  username: string;
  dailyStatus: { [date: string]: number }; // Store daily statuses by date
  monthlyStatus: { [month: string]: number }; // Store monthly aggregated statuses
  note: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  users: User[];
  createdAt: string;
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
