// Local storage utility functions
import { Project, User, UserLevel } from "../types";

const STORAGE_KEY = 'project-pulse-data';
const USERS_KEY = 'project-pulse-users';

/**
 * Save projects to localStorage
 */
export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

/**
 * Load projects from localStorage
 */
export const loadProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Get all unique users across all projects
 */
export const getAllUniqueUsers = (): {[username: string]: User} => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : {};
};

/**
 * Save a user to the global user registry
 */
export const saveUserGlobally = (user: User): void => {
  const users = getAllUniqueUsers();
  users[user.username] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Get a user from the global registry by username
 */
export const getGlobalUser = (username: string): User | null => {
  const users = getAllUniqueUsers();
  return users[username] || null;
};

/**
 * Sync a user across all projects
 */
export const syncUserAcrossProjects = (updatedUser: User): Project[] => {
  // Save the updated user to the global registry
  saveUserGlobally(updatedUser);
  
  // Update this user in all projects
  const projects = loadProjects();
  const updatedProjects = projects.map(project => {
    const updatedUsers = project.users.map(user => {
      if (user.username === updatedUser.username) {
        return {...updatedUser};
      }
      return user;
    });
    
    return {
      ...project,
      users: updatedUsers
    };
  });
  
  // Save the updated projects
  saveProjects(updatedProjects);
  
  return updatedProjects;
};

/**
 * Initialize a new user with default values
 */
export const initializeNewUser = (username: string): User => {
  // Check if user already exists globally
  const existingUser = getGlobalUser(username);
  
  if (existingUser) {
    return existingUser;
  }
  
  // Otherwise create a new user
  const newUser: User = {
    id: crypto.randomUUID(), // Use native UUID generation
    username,
    level: UserLevel.Level1, // Default to Level 1
    dailyStatus: {},
    monthlyStatus: {},
    note: ""
  };
  
  // Save to global registry
  saveUserGlobally(newUser);
  
  return newUser;
};
