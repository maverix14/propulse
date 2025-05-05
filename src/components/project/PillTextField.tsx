
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface PillTextFieldProps {
  icon: React.ReactNode;
  text: string | undefined;
  className?: string;
  maxWidth?: string;
  onClick?: () => void;
  editable?: boolean;
}

export const PillTextField = ({ 
  icon, 
  text, 
  className, 
  maxWidth = "max-w-[200px]", 
  onClick,
  editable = false
}: PillTextFieldProps) => {
  return (
    <div 
      className={cn(
        "flex items-center bg-muted/20 rounded-full border border-muted overflow-hidden group",
        editable && "hover:border-primary/20 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0">
        {icon}
      </Button>
      <div className={cn("px-2 truncate text-sm flex-1", maxWidth)}>
        {text || "Not set"}
      </div>
      {editable && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0" 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};
