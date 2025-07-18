import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Project, User as UserType, StatusLevel, UserLevel } from "@/types";
import { ProjectHeader, ProjectActions, UserStatusCard, UserLevelDialog } from "./project";
import { ProjectNotes } from "./ProjectNotes";
import { IntegrationUsernames } from "./project/IntegrationUsernames";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
    toast({
      title: "Project deleted",
      description: "Your project has been deleted successfully.",
      variant: "destructive",
    });
  }, [project.id, onDelete, toast]);

  const handleStatusChange = useCallback((userId: string, value: StatusLevel) => {
    const updatedUsers = project.users?.map(user => 
      user.id === userId 
        ? { ...user, dailyStatus: { ...user.dailyStatus, [new Date().toISOString().split('T')[0]]: value } }
        : user
    ) || [];
    onUpdate({ ...project, users: updatedUsers });
  }, [project, onUpdate]);

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

  const currentDate = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().substring(0, 7);
  const userCount = project.users?.length || 0;
  const dailyStatusSum = project.users?.reduce((sum, user) => 
    sum + (user.dailyStatus?.[currentDate] || 0), 0
  ) || 0;

  const memoizedUsers = useMemo(() => 
    project.users?.map((user, index) => (
      <UserStatusCard
        key={`${user.username}-${index}`}
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
              
              {project.users && project.users.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">User Status</h4>
                  <div className="grid gap-3">
                    {memoizedUsers}
                  </div>
                </div>
              )}
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
    </>
  );
});

OptimizedProjectCard.displayName = "OptimizedProjectCard";