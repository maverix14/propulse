
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Project } from "@/types";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faRocket, 
  faAtom, 
  faBrain, 
  faCode, 
  faDatabase, 
  faFire, 
  faGlobe,
  faLaptopCode, 
  faMicrochip, 
  faMountain, 
  faPuzzlePiece,
  faRobot, 
  faSatellite
} from "@fortawesome/free-solid-svg-icons";

interface NewProjectDialogProps {
  onProjectCreate: (project: Project) => void;
}

// Map of icons to choose from
const availableIcons = [
  { name: "rocket", icon: faRocket },
  { name: "atom", icon: faAtom },
  { name: "brain", icon: faBrain },
  { name: "code", icon: faCode },
  { name: "database", icon: faDatabase },
  { name: "fire", icon: faFire },
  { name: "globe", icon: faGlobe },
  { name: "laptop", icon: faLaptopCode },
  { name: "microchip", icon: faMicrochip },
  { name: "mountain", icon: faMountain },
  { name: "puzzle", icon: faPuzzlePiece },
  { name: "robot", icon: faRobot },
  { name: "satellite", icon: faSatellite },
];

export const NewProjectDialog = ({ onProjectCreate }: NewProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("rocket");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newProject: Project = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      users: [],
      createdAt: new Date().toISOString(),
      icon: iconName
    };
    
    onProjectCreate(newProject);
    setOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setIconName("rocket");
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary dark:bg-primary/90 hover:bg-primary/90 dark:hover:bg-primary/70">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-background/95 dark:backdrop-blur-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
            <DialogDescription>
              Add a new project to track daily and monthly status.
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
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
          </div>
          <DialogFooter>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
