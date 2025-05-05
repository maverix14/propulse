
import { Project } from "@/types";
import { Github } from "lucide-react";
import { PillTextField } from "./PillTextField";

interface IntegrationUsernamesProps {
  project: Project;
}

export const IntegrationUsernames = ({ project }: IntegrationUsernamesProps) => {
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

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {hasGithub && (
        <PillTextField 
          icon={<Github className="h-4 w-4" />}
          text={project.githubUser || "GitHub username"}
        />
      )}
      
      {hasVercel && (
        <PillTextField 
          icon={
            <svg className="h-4 w-4" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
            </svg>
          }
          text={project.vercelUser || "Vercel username"}
        />
      )}
      
      {hasSupabase && (
        <PillTextField 
          icon={
            <svg className="h-4 w-4" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"/>
              <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor" fillOpacity="0.6"/>
              <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="currentColor"/>
            </svg>
          }
          text={project.supabaseUser || "Supabase username"}
        />
      )}
    </div>
  );
};
