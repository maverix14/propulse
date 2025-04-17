
import { useEffect, useState } from "react";
import { Project } from "@/types";
import { loadProjects, saveProjects } from "@/utils/storageUtils";
import { ProjectCard } from "@/components/ProjectCard";
import { NewProjectDialog } from "@/components/NewProjectDialog";

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
    <div className="container py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Pulse</h1>
        <p className="text-muted-foreground">
          Track your projects' daily and monthly status
        </p>
      </header>

      <div className="mb-6">
        <NewProjectDialog onProjectCreate={handleProjectCreate} />
      </div>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started tracking status
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
  );
};

export default Index;
