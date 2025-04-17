
// Date utility functions

/**
 * Gets the current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Gets the current month in YYYY-MM format
 */
export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Gets all dates in a given month
 */
export const getDatesInMonth = (yearMonth: string): string[] => {
  const [year, month] = yearMonth.split('-').map(Number);
  const dates: string[] = [];
  
  // Create a new date for the first day of the month
  const date = new Date(year, month - 1, 1);
  
  // Get all dates in the month
  while (date.getMonth() === month - 1) {
    dates.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  
  return dates;
};
