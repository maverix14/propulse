
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
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();
  const { user, signOut, isGuest } = useAuth();
  const navigate = useNavigate();

  // Load projects from the appropriate source based on auth status
  useEffect(() => {
    const loadUserProjects = async () => {
      if (isGuest) {
        // Load from local storage for guest users
        const storedProjects = loadProjects();
        setProjects(storedProjects);
      } else if (user) {
        // Load from Supabase for authenticated users
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('created_by', user.id);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Transform the data from Supabase format to our Project type
            const transformedProjects: Project[] = data.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              createdAt: item.created_at,
              users: [], // Initialize with empty array, we'll populate later if needed
              // The note field doesn't exist in the Supabase response, providing a default empty string
              note: '', 
              tags: [] // Initialize with empty array
            }));
            
            setProjects(transformedProjects);
          } else {
            // If no projects in DB, try loading from local storage
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
          
          // Fallback to local storage
          const storedProjects = loadProjects();
          setProjects(storedProjects);
        }
      }
    };
    
    loadUserProjects();
  }, [user, isGuest, toast]);

  // Save projects to the appropriate location
  useEffect(() => {
    const saveUserProjects = async () => {
      if (projects.length === 0) return;
      
      if (isGuest) {
        // Save to local storage for guest users
        saveProjects(projects);
      } else if (user) {
        // Save to Supabase for authenticated users
        try {
          // First, save to local storage as backup
          saveProjects(projects);
          
          // Then try to save to Supabase
          for (const project of projects) {
            const { error } = await supabase
              .from('projects')
              .upsert({
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
      description: "Your new project has been created successfully.",
    });
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(
      projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const handleProjectDelete = (projectId: string) => {
    const deleteProject = async () => {
      setProjects(projects.filter((project) => project.id !== projectId));
      
      if (user) {
        try {
          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);
            
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
      variant: "destructive",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 dark:from-background dark:to-background/90 transition-colors duration-1000">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <ThemeToggle />
            <Button variant="outline" onClick={handleSignOut}>
              {isGuest ? "Back to Login" : "Sign Out"}
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary dark:from-primary dark:via-primary/80 dark:to-primary/60">
            <span className="inline-flex items-center">
              <Zap className="w-10 h-10 mr-2 animate-pulse-slow text-primary" />
              Project Pulse
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Track your projects' daily and monthly status with a futuristic approach
          </p>
          {isGuest && (
            <div className="mt-2 text-sm text-amber-500 dark:text-amber-400 font-medium">
              Guest Mode: Data is stored locally
            </div>
          )}
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
      
      <footer className="py-6 border-t border-border/40 mt-10">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate('/settings')}
                    className="rounded-full"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      toast({
                        title: "Project Pulse",
                        description: "Version 1.0.0 - Track your projects' status with ease"
                      });
                    }}
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>About</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Project Pulse v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
