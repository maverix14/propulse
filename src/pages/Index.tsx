import { useEffect, useState } from "react";
import { Project } from "@/types";
import { loadProjects, saveProjects } from "@/utils/storageUtils";
import { ProjectCard } from "@/components/ProjectCard";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { Zap, Settings, Info } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const {
    toast
  } = useToast();
  const {
    user,
    signOut,
    isGuest
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProjects = async () => {
      if (isGuest) {
        const storedProjects = loadProjects();
        setProjects(storedProjects);
      } else if (user) {
        try {
          const {
            data,
            error
          } = await supabase.from('projects').select('*').eq('created_by', user.id);
          if (error) throw error;
          if (data && data.length > 0) {
            const transformedProjects: Project[] = data.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              createdAt: item.created_at,
              users: [],
              note: '',
              tags: []
            }));
            setProjects(transformedProjects);
          } else {
            const storedProjects = loadProjects();
            setProjects(storedProjects);
          }
        } catch (error) {
          console.error('Failed to load projects:', error);
          toast({
            title: "Error loading projects",
            description: "Failed to load your projects from the database",
            variant: "destructive"
          });
          const storedProjects = loadProjects();
          setProjects(storedProjects);
        }
      }
    };
    loadUserProjects();
  }, [user, isGuest, toast]);

  useEffect(() => {
    const saveUserProjects = async () => {
      if (projects.length === 0) return;
      if (isGuest) {
        saveProjects(projects);
      } else if (user) {
        try {
          saveProjects(projects);
          for (const project of projects) {
            const {
              error
            } = await supabase.from('projects').upsert({
              id: project.id,
              name: project.name,
              description: project.description,
              created_by: user.id,
              note: project.note
            });
            if (error) {
              console.error('Error saving project to Supabase:', error);
            }
          }
        } catch (error) {
          console.error('Failed to save projects to Supabase:', error);
        }
      }
    };
    saveUserProjects();
  }, [projects, user, isGuest]);

  const handleProjectCreate = (newProject: Project) => {
    setProjects([...projects, newProject]);
    toast({
      title: "Project created",
      description: "Your new project has been created successfully."
    });
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(projects.map(project => project.id === updatedProject.id ? updatedProject : project));
  };

  const handleProjectDelete = (projectId: string) => {
    const deleteProject = async () => {
      setProjects(projects.filter(project => project.id !== projectId));
      if (user) {
        try {
          const {
            error
          } = await supabase.from('projects').delete().eq('id', projectId);
          if (error) throw error;
        } catch (error) {
          console.error('Failed to delete project from Supabase:', error);
        }
      }
    };
    deleteProject();
    toast({
      title: "Project deleted",
      description: "Your project has been deleted successfully.",
      variant: "destructive"
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  return <div className="min-h-screen bg-gradient-to-br from-background to-background/95 dark:from-background dark:to-background/90 transition-colors duration-1000">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-600 dark:from-zinc-300 dark:via-zinc-400 dark:to-zinc-500">
            <span className="inline-flex items-center">
              ProPulse
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Track every pulse of your projects
          </p>
          {isGuest ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 text-xs px-3 py-1 h-7 rounded-full border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => navigate('/auth')}
            >
              Guest Mode
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 text-xs px-3 py-1 h-7 rounded-full border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              Online
            </Button>
          )}
        </header>

        <div className="mb-6 flex justify-center">
          <NewProjectDialog onProjectCreate={handleProjectCreate} />
        </div>

        <div className="space-y-5">
          {projects.length === 0 ? <div className="text-center py-16 bg-muted/5 backdrop-blur-sm rounded-lg border border-dashed border-muted/30">
              <Zap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first project to get started tracking status with our futuristic dashboard
              </p>
            </div> : projects.map(project => <ProjectCard key={project.id} project={project} onUpdate={handleProjectUpdate} onDelete={handleProjectDelete} />)}
        </div>
      </div>
      
      <footer className="py-6 border-t border-border/40 mt-10">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="rounded-full">
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                  toast({
                    title: "ProPulse",
                    description: "Version 1.0.0 - Track every pulse of your projects"
                  });
                }}>
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>About</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            ProPulse v1.0.0
          </p>
        </div>
      </footer>
    </div>;
};

export default Index;
