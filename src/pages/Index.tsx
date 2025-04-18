
import { useEffect, useState } from "react";
import { Project } from "@/types";
import { loadProjects, saveProjects, syncUserAcrossProjects } from "@/utils/storageUtils";
import { ProjectCard } from "@/components/ProjectCard";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedProjects = loadProjects();
    setProjects(storedProjects);
  }, []);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const handleProjectCreate = (newProject: Project) => {
    setProjects([...projects, newProject]);
    toast({
      title: "Project created",
      description: "Your new project has been created successfully.",
    });
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(
      projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    
    // No need to show a toast here as most updates already show toasts
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(projects.filter((project) => project.id !== projectId));
    toast({
      title: "Project deleted",
      description: "Your project has been deleted successfully.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 dark:from-background dark:to-background/90 transition-colors duration-1000">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary dark:from-primary dark:via-primary/80 dark:to-primary/60">
            Project Pulse
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Track your projects' daily and monthly status with a futuristic approach
          </p>
        </header>

        <div className="mb-6 flex justify-center">
          <NewProjectDialog onProjectCreate={handleProjectCreate} />
        </div>

        <div className="space-y-5">
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-muted/5 backdrop-blur-sm rounded-lg border border-dashed border-muted/30">
              <Zap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first project to get started tracking status with our futuristic dashboard
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={handleProjectUpdate}
                onDelete={handleProjectDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
