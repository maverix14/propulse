
// Local storage utility functions
import { Project } from "../types";

const STORAGE_KEY = 'project-pulse-data';

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
