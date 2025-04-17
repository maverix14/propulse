
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Project, User } from "@/types";

interface NewProjectDialogProps {
  onProjectCreate: (project: Project) => void;
}

export const NewProjectDialog = ({ onProjectCreate }: NewProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setNewUsername("");
    setUsers([]);
  };

  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const handleAddUser = () => {
    if (newUsername.trim()) {
      const newUser: User = {
        id: crypto.randomUUID(),
        username: newUsername.trim(),
        dailyStatus: {},
        monthlyStatus: {},
        note: ""
      };
      
      setUsers([...users, newUser]);
      setNewUsername("");
    }
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleSubmit = () => {
    if (name.trim()) {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        users,
        createdAt: new Date().toISOString()
      };
      
      onProjectCreate(newProject);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Add details about your project and assign users to track.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Assigned Users
            </label>
            
            <div className="flex space-x-2">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Add username"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddUser();
                  }
                }}
              />
              <Button type="button" onClick={handleAddUser}>
                Add
              </Button>
            </div>
            
            <div className="mt-2 space-y-2">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users added yet</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded bg-secondary">
                    <span>{user.username}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
