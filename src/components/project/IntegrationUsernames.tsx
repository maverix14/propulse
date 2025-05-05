
import { useState } from "react";
import { Project } from "@/types";
import { Github } from "lucide-react";
import { PillTextField } from "./PillTextField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface IntegrationUsernamesProps {
  project: Project;
  onUpdate?: (updatedProject: Project) => void;
  readOnly?: boolean;
}

export const IntegrationUsernames = ({ project, onUpdate, readOnly = false }: IntegrationUsernamesProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  // Early return if no tags
  if (!project.tags || project.tags.length === 0) {
    return null;
  }

  const hasGithub = project.tags.includes("github");
  const hasVercel = project.tags.includes("vercel");
  const hasSupabase = project.tags.includes("supabase");

  if (!hasGithub && !hasVercel && !hasSupabase) {
    return null;
  }

  const handleEdit = (field: string, value: string | undefined) => {
    if (readOnly) return;
    setEditingField(field);
    setEditValue(value || "");
  };

  const handleSave = () => {
    if (!editingField || !onUpdate) return;
    
    const updatedProject = {
      ...project,
      [editingField]: editValue
    };
    
    onUpdate(updatedProject);
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const renderEditableField = (field: string, icon: React.ReactNode, value: string | undefined, placeholder: string) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-2 w-full">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 py-1 text-sm"
            placeholder={placeholder}
            autoFocus
          />
          <div className="flex-shrink-0 flex">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full min-w-0 flex-grow-0 flex-shrink basis-auto">
        <PillTextField 
          icon={icon}
          text={value || placeholder}
          onClick={() => handleEdit(field, value)}
          editable={!readOnly}
          maxWidth="max-w-full"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {hasGithub && (
        <div className="flex-grow-0 flex-shrink max-w-full">
          {renderEditableField(
            "githubUser",
            <Github className="h-4 w-4" />,
            project.githubUser,
            "GitHub username"
          )}
        </div>
      )}
      
      {hasVercel && (
        <div className="flex-grow-0 flex-shrink max-w-full">
          {renderEditableField(
            "vercelUser",
            <svg className="h-4 w-4" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
            </svg>,
            project.vercelUser,
            "Vercel username"
          )}
        </div>
      )}
      
      {hasSupabase && (
        <div className="flex-grow-0 flex-shrink max-w-full">
          {renderEditableField(
            "supabaseUser",
            <svg className="h-4 w-4" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"/>
              <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor" fillOpacity="0.6"/>
              <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="currentColor"/>
            </svg>,
            project.supabaseUser,
            "Supabase username"
          )}
        </div>
      )}
    </div>
  );
};
