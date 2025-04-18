
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Project, User, UserLevel } from "@/types";
import { Plus, UserPlus, X } from "lucide-react";
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
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newProject: Project = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      users: users,
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
    setUsers([]);
    setNewUsername("");
  };
  
  const addUser = () => {
    if (!newUsername.trim()) return;
    
    const newUser: User = {
      id: uuidv4(),
      username: newUsername.trim(),
      level: UserLevel.Level1, // Add the required level property, default to Level1
      dailyStatus: {},
      monthlyStatus: {},
      note: ""
    };
    
    setUsers([...users, newUser]);
    setNewUsername("");
  };
  
  const removeUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
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
            
            {/* User Assignment Section */}
            <div className="grid gap-2">
              <Label htmlFor="users">Assign Users</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-user"
                  placeholder="Enter username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  size="sm"
                  variant="outline"
                  onClick={addUser}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* User List */}
              {users.length > 0 && (
                <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto border rounded-md p-2">
                  {users.map(user => (
                    <div key={user.id} className="flex justify-between items-center py-1 px-2 bg-muted/40 rounded">
                      <span className="text-sm">{user.username}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUser(user.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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

