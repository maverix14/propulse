
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("project-pulse-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(savedTheme || (prefersDark ? "dark" : "light"));
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    // Apply theme to document with transition
    document.documentElement.style.setProperty('transition', 'background-color 3s ease');
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.add("light");
    }
    
    localStorage.setItem("project-pulse-theme", theme);
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
