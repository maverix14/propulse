
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
