
import { useEffect, useState } from "react";
import { Project } from "@/types";
import { loadProjects, saveProjects } from "@/utils/storageUtils";
import { ProjectCard } from "@/components/ProjectCard";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  // Load projects from localStorage on initial render
  useEffect(() => {
    const storedProjects = loadProjects();
    setProjects(storedProjects);
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const handleProjectCreate = (newProject: Project) => {
    setProjects([...projects, newProject]);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(
      projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
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
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
