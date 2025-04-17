
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

export const StatusIndicator = ({ value, size = "md" }: StatusIndicatorProps) => {
  const statusValue = Math.max(1, Math.min(5, Math.round(value))) as 1 | 2 | 3 | 4 | 5;
  
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base"
  };

  const statusColors = {
    1: "bg-status-1",
    2: "bg-status-2",
    3: "bg-status-3",
    4: "bg-status-4",
    5: "bg-status-5"
  };

  return (
    <div className="relative">
      <div 
        className={cn(
          "rounded-md flex items-center justify-center font-mono font-bold text-white shadow-md transition-all duration-300 hover:scale-105",
          sizeClasses[size],
          statusColors[statusValue],
        )}
      >
        {statusValue}
      </div>
      <div className={cn(
        "absolute -inset-0.5 rounded-md blur-sm opacity-50",
        statusColors[statusValue],
      )}></div>
    </div>
  );
};
