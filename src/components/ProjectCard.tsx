import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Project, StatusLevel, User as UserType, UserLevel, getProjectStats, hasReachedDailyLimit, hasReachedMonthlyLimit } from "@/types";
import { getCurrentDate, getCurrentMonth } from "@/utils/dateUtils";
import { syncUserAcrossProjects } from "@/utils/storageUtils";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ProjectHeader, ProjectActions, UserStatusCard, UserLevelDialog, IntegrationUsernames } from "./project";
import { Users } from "lucide-react";
import { ProjectNotes } from "./ProjectNotes";

interface ProjectCardProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  onDelete?: (projectId: string) => void;
}
export const ProjectCard = ({
  project,
  onUpdate,
  onDelete
}: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userLevelDialogOpen, setUserLevelDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const {
    toast
  } = useToast();
  const currentDate = getCurrentDate();
  const currentMonth = getCurrentMonth();
  const {
    userCount,
    dailyStatusSum,
    averageStatus
  } = getProjectStats(project, currentDate);
  const handleChangeUserLevel = (user: UserType) => {
    setSelectedUser(user);
    setUserLevelDialogOpen(true);
  };
  const updateUserLevel = (level: UserLevel) => {
    if (!selectedUser) return;
    const updatedUser = {
      ...selectedUser,
      level
    };
    const updatedProjects = syncUserAcrossProjects(updatedUser);
    const thisProject = updatedProjects.find(p => p.id === project.id);
    if (thisProject) {
      onUpdate(thisProject);
    }
    setUserLevelDialogOpen(false);
    setSelectedUser(null);
    toast({
      title: "User level updated",
      description: `${updatedUser.username}'s level has been changed to Level ${level}.`
    });
  };
  const getCardStyle = () => {
    if (averageStatus <= 0) return {};
    const statusLevel = Math.min(5, Math.max(1, Math.round(averageStatus))) as StatusLevel;
    const opacity = 0.05 + averageStatus / 10;
    const statusColors = {
      1: `rgba(239, 68, 68, ${opacity})`,
      2: `rgba(249, 115, 22, ${opacity})`,
      3: `rgba(250, 204, 21, ${opacity})`,
      4: `rgba(132, 204, 22, ${opacity})`,
      5: `rgba(34, 197, 94, ${opacity})`
    };
    return {
      background: `linear-gradient(135deg, ${statusColors[statusLevel]}, transparent 80%)`
    };
  };
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  const handleStatusChange = (userId: string, value: StatusLevel) => {
    const userToUpdate = project.users.find(user => user.id === userId);
    if (!userToUpdate) return;

    // Get user level settings from localStorage
    const userLevelSettings = JSON.parse(localStorage.getItem('userLevelSettings') || '[]');
    const userLevelSetting = userLevelSettings.find((setting: any) => setting.id === userToUpdate.level);

    // Use default limits if settings not found
    const dailyLimit = userLevelSetting?.dailyLimit ?? (userToUpdate.level === UserLevel.Level1 ? 5 : null);
    const monthlyLimit = userLevelSetting?.monthlyLimit ?? (userToUpdate.level === UserLevel.Level1 ? 30 : 100);

    // Check daily limit if applicable
    if (dailyLimit !== null && value > (userToUpdate.dailyStatus?.[currentDate] || 0) && (userToUpdate.dailyStatus?.[currentDate] || 0) >= dailyLimit) {
      toast({
        title: "Daily limit reached",
        description: `Maximum ${dailyLimit} points per day allowed for this user level`,
        variant: "destructive"
      });
      return;
    }

    // Check monthly limit
    const currentMonthlyTotal = userToUpdate.monthlyStatus?.[currentMonth] || 0;
    const currentDailyValue = userToUpdate.dailyStatus?.[currentDate] || 0;
    const pointDifference = value - currentDailyValue;
    if (pointDifference > 0 && currentMonthlyTotal + pointDifference > monthlyLimit) {
      toast({
        title: "Monthly limit reached",
        description: `This user can only add up to ${monthlyLimit} points per month.`,
        variant: "destructive"
      });
      return;
    }
    const updatedUser = {
      ...userToUpdate
    };
    const dailyStatus = {
      ...(updatedUser.dailyStatus || {})
    };
    dailyStatus[currentDate] = value;
    updatedUser.dailyStatus = dailyStatus;
    const monthlyStatus = {
      ...(updatedUser.monthlyStatus || {})
    };
    const monthlySum = Object.entries(dailyStatus).filter(([date]) => date.startsWith(currentMonth)).reduce((sum, [, status]) => sum + (status || 0), 0);
    monthlyStatus[currentMonth] = monthlySum;
    updatedUser.monthlyStatus = monthlyStatus;
    const updatedProjects = syncUserAcrossProjects(updatedUser);
    const thisProject = updatedProjects.find(p => p.id === project.id);
    if (thisProject) {
      onUpdate(thisProject);
    }
  };
  const handleNoteChange = (userId: string, note: string) => {
    const userToUpdate = project.users.find(user => user.id === userId);
    if (!userToUpdate) return;
    const updatedUser = {
      ...userToUpdate,
      note
    };
    const updatedProjects = syncUserAcrossProjects(updatedUser);
    const thisProject = updatedProjects.find(p => p.id === project.id);
    if (thisProject) {
      onUpdate(thisProject);
      toast({
        title: "Note updated",
        description: "User status note has been saved"
      });
    }
  };
  return <>
      <Card style={getCardStyle()} className="transition-all duration-300 hover:shadow-lg border-none backdrop-blur-sm dark:bg-black/20">
        <ProjectHeader project={project} expanded={expanded} toggleExpanded={toggleExpanded} userCount={userCount} dailyStatusSum={dailyStatusSum} onUpdate={onUpdate} />
        
        {expanded && <CardContent className="space-y-6 pt-4">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-muted/50 to-transparent mb-4 dark:via-muted/20"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2 grow mx-[20px]">
                <ProjectNotes project={project} onUpdate={onUpdate} isExpanded={true} />
                <IntegrationUsernames project={project} onUpdate={onUpdate} />
              </div>
              
              <ProjectActions project={project} onUpdate={onUpdate} onOpenDeleteDialog={() => setDeleteDialogOpen(true)} />
            </div>
            
            {project.users.length === 0 ? <div className="text-center py-8 border border-dashed rounded-lg border-muted-foreground/20 bg-background/50 backdrop-blur-sm dark:bg-black/20">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No users assigned to this project</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Edit the project to add users</p>
              </div> : <div className="grid gap-4">
                {project.users.map(user => <UserStatusCard key={user.id} user={user} currentDate={currentDate} currentMonth={currentMonth} onStatusChange={handleStatusChange} onNoteChange={handleNoteChange} onChangeUserLevel={handleChangeUserLevel} />)}
              </div>}
          </CardContent>}
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete?.(project.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <UserLevelDialog open={userLevelDialogOpen} onOpenChange={setUserLevelDialogOpen} selectedUser={selectedUser} onUpdateUserLevel={updateUserLevel} />
    </>;
};
