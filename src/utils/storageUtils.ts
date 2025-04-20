// Local storage utility functions
import { Project, User, UserLevel } from "../types";

const STORAGE_KEY = 'project-pulse-data';
const USERS_KEY = 'project-pulse-users';
const APP_VERSION_KEY = 'project-pulse-version';
const CURRENT_VERSION = '1.1.0'; // Must match manifest.json version

/**
 * Check if the app version in localStorage matches the current version
 * If not, clear the cache
 */
export const checkAppVersion = (): boolean => {
  const storedVersion = localStorage.getItem(APP_VERSION_KEY);
  
  if (storedVersion !== CURRENT_VERSION) {
    console.log(`App version changed from ${storedVersion} to ${CURRENT_VERSION}, clearing cache`);
    localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
    return false;
  }
  
  return true;
};

/**
 * Clear all app data from localStorage
 */
export const clearAllAppData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USERS_KEY);
  // Keep the version key to prevent repeated clearing
  localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
};

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
  // Check app version first
  const isSameVersion = checkAppVersion();
  
  // If version has changed, return empty array to force reload from server
  if (!isSameVersion) {
    return [];
  }
  
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
