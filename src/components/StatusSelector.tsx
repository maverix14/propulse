
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { Button } from "./ui/button";
import { StatusLevel } from "@/types";

interface StatusSelectorProps {
  value: StatusLevel;
  onChange: (value: StatusLevel) => void;
  disabled?: boolean;
}

export const StatusSelector = ({ value, onChange, disabled = false }: StatusSelectorProps) => {
  const handleIncrement = () => {
    if (value < 5 && !disabled) {
      onChange((value + 1) as StatusLevel);
    }
  };

  const handleDecrement = () => {
    if (value > 0 && !disabled) {
      onChange((value - 1) as StatusLevel);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <StatusIndicator value={value} />
      <div className="flex flex-col">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={handleIncrement}
          disabled={value >= 5 || disabled}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={handleDecrement}
          disabled={value <= 0 || disabled}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
