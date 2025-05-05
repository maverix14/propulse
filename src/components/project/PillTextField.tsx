
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PillTextFieldProps {
  icon: React.ReactNode;
  text: string | undefined;
  className?: string;
  maxWidth?: string;
}

export const PillTextField = ({ icon, text, className, maxWidth = "max-w-[200px]" }: PillTextFieldProps) => {
  return (
    <div className={cn(
      "flex items-center bg-muted/20 rounded-full border border-muted overflow-hidden",
      className
    )}>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0">
        {icon}
      </Button>
      <div className={cn("px-2 pr-4 truncate text-sm", maxWidth)}>
        {text || "Not set"}
      </div>
    </div>
  );
};
