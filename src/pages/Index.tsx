import { useEffect, useState, useCallback, useRef } from "react";
import { Project } from "@/types";
import { loadProjects, saveProjects } from "@/utils/storageUtils";
import { OptimizedProjectCard } from "@/components/OptimizedProjectCard";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { Zap, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProjectCardSkeleton } from "@/components/LoadingComponents";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load projects
  useEffect(() => {
    const loadUserProjects = async () => {
      setIsLoading(true);
      try {
        if (isGuest) {
          setProjects(loadProjects());
        } else if (user) {
          const { data, error } = await supabase.
          from('projects').
          select('*').
          eq('created_by', user.id);

          if (error) throw error;

          if (data && data.length > 0) {
            setProjects(data.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              createdAt: item.created_at,
              users: [],
              note: '',
              tags: []
            })));
          } else {
            setProjects(loadProjects());
          }
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast({
          title: "Error loading projects",
          description: "Failed to load your projects from the database",
          variant: "destructive"
        });
        setProjects(loadProjects());
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isGuest]);

  // Debounced save
  useEffect(() => {
    if (projects.length === 0) return;

    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      saveProjects(projects);

      if (!isGuest && user) {
        for (const project of projects) {
          const { error } = await supabase.from('projects').upsert({
            id: project.id,
            name: project.name,
            description: project.description,
            created_by: user.id,
            note: project.note
          });
          if (error) console.error('Error saving project:', error);
        }
      }
    }, 1000);

    return () => clearTimeout(saveTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const handleProjectCreate = useCallback((newProject: Project) => {
    setProjects((prev) => [...prev, newProject]);
    toast({
      title: "Project created",
      description: "Your new project has been created successfully."
    });
  }, [toast]);

  const handleProjectUpdate = useCallback((updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => p.id === updatedProject.id ? updatedProject : p));
  }, []);

  const handleProjectDelete = useCallback(async (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (user) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (error) throw error;
      } catch (error) {
        console.error('Failed to delete project from Supabase:', error);
      }
    }
    toast({
      title: "Project deleted",
      description: "Your project has been deleted successfully.",
      variant: "destructive"
    });
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 dark:from-background dark:to-background/90 transition-colors duration-1000">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center gap-4 mb-4">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary/80 via-primary to-primary/70">
            <span className="inline-flex items-center">ProPulsio</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">Track every pulse of your projects - v0.2</p>
          {isGuest ?
          <Button variant="outline" size="sm" className="mt-4 text-xs px-3 py-1 h-7 rounded-full border-border hover:bg-muted" onClick={() => navigate('/auth')}>
              Guest Mode
            </Button> :

          <Button variant="outline" size="sm" className="mt-4 text-xs px-3 py-1 h-7 rounded-full border-primary/30 text-primary hover:bg-primary/5">
              Online
            </Button>
          }
        </header>

        <div className="mb-6 flex justify-center">
          <NewProjectDialog onProjectCreate={handleProjectCreate} />
        </div>

        <div className="space-y-5">
          {isLoading ?
          Array.from({ length: 3 }, (_, i) => <ProjectCardSkeleton key={i} expanded={false} />) :
          projects.length === 0 ?
          <div className="text-center py-16 bg-muted/5 backdrop-blur-sm rounded-lg border border-dashed border-muted/30">
              <Zap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first project to get started tracking status with our futuristic dashboard
              </p>
            </div> :

          projects.map((project) =>
          <OptimizedProjectCard
            key={project.id}
            project={project}
            onUpdate={handleProjectUpdate}
            onDelete={handleProjectDelete} />

          )
          }
        </div>
      </div>
      
      <footer className="py-6 border-t border-border/40 mt-10">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </footer>
    </div>);

};

export default Index;