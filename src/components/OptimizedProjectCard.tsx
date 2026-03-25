import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Project, User as UserType, StatusLevel, UserLevel } from "@/types";
import { ProjectHeader, ProjectActions, UserStatusCard, UserLevelDialog } from "./project";
import { ProjectNotes } from "./ProjectNotes";
import { IntegrationUsernames } from "./project/IntegrationUsernames";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCurrentDate, getCurrentMonth } from "@/utils/dateUtils";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ProjectCardProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export const OptimizedProjectCard = React.memo(({ 
  project, 
  onUpdate, 
  onDelete 
}: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userLevelDialogOpen, setUserLevelDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();

  const currentDate = getCurrentDate();
  const currentMonth = getCurrentMonth();

  const handleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const handleUserClick = useCallback((user: UserType) => {
    setSelectedUser(user);
    setUserLevelDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    onDelete(project.id);
    setDeleteDialogOpen(false);
  }, [project.id, onDelete]);

  const handleStatusChange = useCallback((userId: string, value: StatusLevel) => {
    const updatedUsers = project.users?.map(user => 
      user.id === userId 
        ? { ...user, dailyStatus: { ...user.dailyStatus, [currentDate]: value } }
        : user
    ) || [];
    onUpdate({ ...project, users: updatedUsers });
  }, [project, onUpdate, currentDate]);

  const handleNoteChange = useCallback((userId: string, note: string) => {
    const updatedUsers = project.users?.map(user => 
      user.id === userId ? { ...user, note } : user
    ) || [];
    onUpdate({ ...project, users: updatedUsers });
  }, [project, onUpdate]);

  const handleUserLevelChange = useCallback((level: UserLevel) => {
    if (selectedUser) {
      const updatedUsers = project.users?.map(user => 
        user.id === selectedUser.id ? { ...user, level } : user
      ) || [];
      onUpdate({ ...project, users: updatedUsers });
      setUserLevelDialogOpen(false);
      setSelectedUser(null);
    }
  }, [project, onUpdate, selectedUser]);

  const handleAddUser = useCallback(() => {
    if (!newUsername.trim()) return;
    const newUser: UserType = {
      id: uuidv4(),
      username: newUsername.trim(),
      level: UserLevel.Level1,
      dailyStatus: {},
      monthlyStatus: {},
      note: "",
    };
    onUpdate({ ...project, users: [...(project.users || []), newUser] });
    setNewUsername("");
    setAddUserDialogOpen(false);
    toast({ title: "User added", description: `${newUser.username} has been added.` });
  }, [newUsername, project, onUpdate, toast]);

  const handleRemoveUser = useCallback((userId: string) => {
    const updatedUsers = (project.users || []).filter(u => u.id !== userId);
    onUpdate({ ...project, users: updatedUsers });
    toast({ title: "User removed", variant: "destructive" });
  }, [project, onUpdate, toast]);

  const userCount = project.users?.length || 0;
  const dailyStatusSum = project.users?.reduce((sum, user) => 
    sum + (user.dailyStatus?.[currentDate] || 0), 0
  ) || 0;

  const memoizedUsers = useMemo(() => 
    project.users?.map((user) => (
      <UserStatusCard
        key={user.id}
        user={user}
        currentDate={currentDate}
        currentMonth={currentMonth}
        onStatusChange={handleStatusChange}
        onNoteChange={handleNoteChange}
        onChangeUserLevel={handleUserClick}
      />
    )) || [], 
    [project.users, currentDate, currentMonth, handleStatusChange, handleNoteChange, handleUserClick]
  );

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <ProjectHeader 
            project={project} 
            expanded={expanded} 
            toggleExpanded={handleExpand}
            userCount={userCount}
            dailyStatusSum={dailyStatusSum}
            onUpdate={onUpdate}
          />
          
          {expanded && (
            <div className="mt-6 space-y-6 animate-fade-in">
              <ProjectActions 
                project={project} 
                onUpdate={onUpdate} 
                onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
              />
              
              <ProjectNotes project={project} onUpdate={onUpdate} isExpanded={expanded} />
              
              <IntegrationUsernames project={project} onUpdate={onUpdate} />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-muted-foreground">Users</h4>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddUserDialogOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Add User
                  </Button>
                </div>
                {project.users && project.users.length > 0 ? (
                  <div className="grid gap-3">
                    {memoizedUsers}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No users assigned yet</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserLevelDialog
        open={userLevelDialogOpen}
        onOpenChange={setUserLevelDialogOpen}
        selectedUser={selectedUser}
        onUpdateUserLevel={handleUserLevelChange}
      />

      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
});

OptimizedProjectCard.displayName = "OptimizedProjectCard";