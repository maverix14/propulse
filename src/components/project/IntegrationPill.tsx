
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Github, Zap } from "lucide-react"; 
import { Project } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface IntegrationPillProps {
  project: Project;
  integrationType: "github" | "vercel" | "supabase";
  onUpdate: (updatedProject: Project) => void;
}

export const IntegrationPill: React.FC<IntegrationPillProps> = ({ project, integrationType, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(project.integrations?.[integrationType] || "");
  const { toast } = useToast();

  // Get the appropriate icon based on integration type
  const getIcon = () => {
    switch(integrationType) {
      case 'github':
        return <Github className="h-3.5 w-3.5" />;
      case 'vercel':
        return (
          <svg className="h-3.5 w-3.5" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
          </svg>
        );
      case 'supabase':
        return (
          <svg className="h-3.5 w-3.5" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"/>
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor" fillOpacity="0.6"/>
            <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="currentColor"/>
          </svg>
        );
      default:
        return <Zap className="h-3.5 w-3.5" />;
    }
  };

  // Get integration name for display purposes
  const getIntegrationName = () => {
    return integrationType.charAt(0).toUpperCase() + integrationType.slice(1);
  };

  const handleSave = () => {
    const updatedIntegrations = {
      ...(project.integrations || {}),
      [integrationType]: value
    };
    
    const updatedProject = {
      ...project,
      integrations: updatedIntegrations
    };
    
    onUpdate(updatedProject);
    setIsEditing(false);
    
    toast({
      title: `${getIntegrationName()} username updated`,
      description: value ? `Username set to "${value}"` : `Username removed`,
    });
  };

  return (
    <div className="flex items-center w-full max-w-full">
      {isEditing ? (
        <div className="flex w-full items-center gap-2">
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-background flex items-center justify-center border">
            {getIcon()}
          </div>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`${getIntegrationName()} username`}
            className="flex-1 h-8 rounded-full"
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
        </div>
      ) : (
        <Button
          variant="outline"
          className="h-8 px-3 rounded-full gap-2 w-full justify-start hover:bg-muted/20"
          onClick={() => setIsEditing(true)}
        >
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-background flex items-center justify-center border">
            {getIcon()}
          </div>
          <span className="text-sm truncate">
            {value ? value : `Add ${getIntegrationName()} username`}
          </span>
        </Button>
      )}
    </div>
  );
};
