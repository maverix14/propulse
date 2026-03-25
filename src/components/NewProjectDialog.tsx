
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Project } from "@/types";
import { Plus, Github } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRocket, faAtom, faBrain, faCode, faDatabase, faFire, faGlobe,
  faLaptopCode, faMicrochip, faMountain, faPuzzlePiece, faRobot, faSatellite,
  faBook, faCloud, faLeaf, faStar, faLightbulb, faShield, faVial, faWifi
} from "@fortawesome/free-solid-svg-icons";
import { Toggle } from "./ui/toggle";
import { useToast } from "@/hooks/use-toast";

interface NewProjectDialogProps {
  onProjectCreate: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  project?: Project;
  editMode?: boolean;
  trigger?: React.ReactNode;
}

const availableIcons = [
  { name: "rocket", icon: faRocket }, { name: "atom", icon: faAtom },
  { name: "brain", icon: faBrain }, { name: "code", icon: faCode },
  { name: "database", icon: faDatabase }, { name: "fire", icon: faFire },
  { name: "globe", icon: faGlobe }, { name: "laptop", icon: faLaptopCode },
  { name: "microchip", icon: faMicrochip }, { name: "mountain", icon: faMountain },
  { name: "puzzle", icon: faPuzzlePiece }, { name: "robot", icon: faRobot },
  { name: "satellite", icon: faSatellite }, { name: "book", icon: faBook },
  { name: "cloud", icon: faCloud }, { name: "leaf", icon: faLeaf },
  { name: "star", icon: faStar }, { name: "bulb", icon: faLightbulb },
  { name: "shield", icon: faShield }, { name: "vial", icon: faVial },
  { name: "wifi", icon: faWifi },
];

const platformTags = [
  { id: "github", name: "GitHub", icon: <Github className="h-4 w-4" /> },
  { id: "vercel", name: "Vercel", icon: <svg className="h-4 w-4" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" /></svg> },
  { id: "supabase", name: "Supabase", icon: <svg className="h-4 w-4" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"/><path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor" fillOpacity="0.6"/><path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="currentColor"/></svg> },
];

export const NewProjectDialog = ({ 
  onProjectCreate, onProjectEdit, project, editMode = false, trigger 
}: NewProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("rocket");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    if (project && editMode) {
      setName(project.name);
      setIconName(project.icon || "rocket");
      setSelectedTags(project.tags || []);
    } else {
      resetForm();
    }
  }, [project, editMode]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (editMode && project) {
      const updatedProject: Project = {
        ...project,
        name: name.trim(),
        icon: iconName,
        tags: selectedTags
      };
      onProjectEdit?.(updatedProject);
      toast({ title: "Project updated", description: "Your project has been updated successfully." });
    } else {
      const newProject: Project = {
        id: uuidv4(),
        name: name.trim(),
        description: "",
        users: [],
        createdAt: new Date().toISOString(),
        icon: iconName,
        tags: selectedTags
      };
      onProjectCreate(newProject);
      toast({ title: "Project created", description: "Your new project has been created successfully." });
    }
    
    setOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setName("");
    setIconName("rocket");
    setSelectedTags([]);
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button className="gap-2 bg-primary dark:bg-primary/90 hover:bg-primary/90 dark:hover:bg-primary/70">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-background/95 dark:backdrop-blur-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit project" : "Create new project"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Update your project details below." : "Add a new project to track daily and monthly status."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Project Icon</Label>
              <div className="grid grid-cols-7 gap-2">
                {availableIcons.map((item) => (
                  <Button
                    key={item.name}
                    type="button"
                    variant={iconName === item.name ? "default" : "outline"}
                    className="h-10 w-10 p-0"
                    onClick={() => setIconName(item.name)}
                  >
                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Platform Tags</Label>
              <div className="flex flex-wrap gap-2">
                {platformTags.map((tag) => (
                  <Toggle
                    key={tag.id}
                    pressed={selectedTags.includes(tag.id)}
                    onPressedChange={() => toggleTag(tag.id)}
                    className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-full h-8 w-8 p-0 flex items-center justify-center"
                    aria-label={tag.name}
                  >
                    {tag.icon}
                  </Toggle>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{editMode ? "Save Changes" : "Create Project"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
