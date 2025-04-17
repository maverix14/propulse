
import { useTheme } from "./ThemeProvider";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full p-3 w-12 h-12 flex items-center justify-center transition-transform duration-300 hover:scale-110 focus:outline-none",
        "bg-primary/10 text-primary",
        "dark:bg-primary/20 dark:text-primary"
      )}
      aria-label="Toggle dark mode"
    >
      <div className="relative">
        <Rocket 
          className={cn(
            "h-6 w-6 transition-all duration-500",
            theme === "dark" ? "text-yellow-400" : "text-primary",
          )} 
        />
        <div 
          className={cn(
            "absolute inset-0 blur-md rounded-full transition-opacity duration-500",
            theme === "dark" 
              ? "bg-yellow-400/30 opacity-100" 
              : "bg-primary/20 opacity-70"
          )}
        ></div>
      </div>
    </button>
  );
};
