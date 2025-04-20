import { useState } from "react";
import { ChevronDown, ChevronUp, Users, Zap, Edit, Trash, X, Check, Shield, AlertTriangle, Pencil, Github, Info, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Project, StatusLevel, User as UserType, UserLevel, getProjectStats, hasReachedDailyLimit, hasReachedMonthlyLimit } from "@/types";
import { StatusSelector } from "./StatusSelector";
import { getCurrentDate, getCurrentMonth } from "@/utils/dateUtils";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
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
  faSatellite,
  faBook,
  faCloud,
  faLeaf,
  faStar,
  faLightbulb,
  faShield,
  faVial,
  faWifi
} from "@fortawesome/free-solid-svg-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { syncUserAcrossProjects, initializeNewUser } from "@/utils/storageUtils";
import { Label } from "./ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { NewProjectDialog } from "./NewProjectDialog";
import { ProjectNotes } from "./ProjectNotes";
import { Textarea } from "./ui/textarea";

const iconMap = {
  default: faRocket,
  atom: faAtom,
  brain: faBrain,
  code: faCode,
  database: faDatabase,
  fire: faFire,
  globe: faGlobe,
  laptop: faLaptopCode,
  chip: faMicrochip,
  mountain: faMountain,
  puzzle: faPuzzlePiece,
  robot: faRobot,
  satellite: faSatellite,
  book: faBook,
  cloud: faCloud,
  leaf: faLeaf,
  star: faStar,
  bulb: faLightbulb,
  shield: faShield,
  vial: faVial,
  wifi: faWifi
};

interface ProjectCardProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard = ({ project, onUpdate, onDelete }: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userLevelDialogOpen, setUserLevelDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const { toast } = useToast();
  
  const currentDate = getCurrentDate();
  const currentMonth = getCurrentMonth();
  
  const { userCount, dailyStatusSum, averageStatus } = getProjectStats(project, currentDate);

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

  const getProjectIcon = () => {
    if (!project.icon) return iconMap.default;
    
    return iconMap[project.icon as keyof typeof iconMap] || iconMap.default;
  };

  const getCardStyle = () => {
    if (averageStatus <= 0) return {};
    
    const statusLevel = Math.min(5, Math.max(1, Math.round(averageStatus))) as StatusLevel;
    const opacity = 0.05 + (averageStatus / 10);
    
    const statusColors = {
      1: `rgba(239, 68, 68, ${opacity})`,
      2: `rgba(249, 115, 22, ${opacity})`,
      3: `rgba(250, 204, 21, ${opacity})`,
      4: `rgba(132, 204, 22, ${opacity})`,
      5: `rgba(34, 197, 94, ${opacity})`,
    };
    
    return {
      background: `linear-gradient(135deg, ${statusColors[statusLevel]}, transparent 80%)`,
    };
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleStatusChange = (userId: string, value: StatusLevel) => {
    const userToUpdate = project.users.find(user => user.id === userId);
    if (!userToUpdate) return;
    
    if (value > 5 && userToUpdate.level === UserLevel.Level1 && value > (userToUpdate.dailyStatus?.[currentDate] || 0)) {
      toast({
        title: "Daily limit reached",
        description: "Maximum 5 points per day allowed for Level 1 users",
        variant: "destructive",
      });
      return;
    }
    
    if (hasReachedMonthlyLimit(userToUpdate, currentMonth) && 
        value > (userToUpdate.dailyStatus?.[currentDate] || 0)) {
      toast({
        title: "Monthly limit reached",
        description: `Level ${userToUpdate.level} users can only add up to ${userToUpdate.level === UserLevel.Level1 ? 30 : 100} points per month.`,
        variant: "destructive",
      });
      return;
    }
    
    const updatedUser = { ...userToUpdate };
    const dailyStatus = { ...(updatedUser.dailyStatus || {}) };
    dailyStatus[currentDate] = value;
    updatedUser.dailyStatus = dailyStatus;

    const monthlyStatus = { ...(updatedUser.monthlyStatus || {}) };
    
    const monthlySum = Object.entries(dailyStatus)
      .filter(([date]) => date.startsWith(currentMonth))
      .reduce((sum, [, status]) => sum + status, 0);
    
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

    const updatedUser = { ...userToUpdate, note };
    
    const updatedProjects = syncUserAcrossProjects(updatedUser);
    
    const thisProject = updatedProjects.find(p => p.id === project.id);
    if (thisProject) {
      onUpdate(thisProject);
      toast({
        title: "Note updated",
        description: "User status note has been saved",
      });
    }
  };

  const getUserStatus = (user: UserType, date: string): StatusLevel => {
    const status = (user.dailyStatus && user.dailyStatus[date]) || 1;
    return Math.max(1, Math.min(5, status)) as StatusLevel;
  };

  const getUserMonthlyStatus = (user: UserType, month: string): number => {
    return (user.monthlyStatus && user.monthlyStatus[month]) || 0;
  };

  const getUserLevelBadge = (level: UserLevel) => {
    return (
      <Badge variant={level === UserLevel.Level1 ? "outline" : "secondary"} 
        className="ml-2 text-xs flex items-center">
        <Shield className="h-3 w-3" />
        {level}
      </Badge>
    );
  };

  const getProgressLimit = (user: UserType) => {
    return user.level === UserLevel.Level1 ? 30 : 100;
  };

  const renderPlatformTag = (tagId: string) => {
    switch(tagId) {
      case 'github':
        return <Github className="h-3.5 w-3.5" />;
      case 'vercel':
        return (
          <svg className="h-3.5 w-3.5" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
          </svg>
        );
      case 'supabase':
        return (
          <svg className="h-3.5 w-3.5" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"/>
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor" fillOpacity="0.6"/>
            <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="currentColor"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card style={getCardStyle()} className="transition-all duration-300 hover:shadow-lg border-none backdrop-blur-sm dark:bg-black/20">
        <CardHeader 
          className="cursor-pointer rounded-t-lg backdrop-blur-sm py-4" 
          onClick={toggleExpanded}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative h-6 w-6 flex items-center justify-center text-primary dark:text-primary">
                <FontAwesomeIcon icon={getProjectIcon()} className="h-5 w-5" />
                <div className="absolute inset-0 blur-md rounded-full bg-primary/10"></div>
              </div>
              <div className="flex-1">
                <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent dark:from-primary dark:to-primary/60">
                  {project.name}
                </CardTitle>
                <CardDescription className="mt-1">{project.description}</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center gap-1 bg-background/70 backdrop-blur-sm dark:bg-black/30">
                    <Users className="h-3.5 w-3.5" />
                    <span>{userCount}</span>
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1 bg-background/70 backdrop-blur-sm dark:bg-black/30">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{dailyStatusSum}</span>
                  </Badge>
                </div>
                
                {project.tags && project.tags.length > 0 && (
                  <div className="flex items-center gap-1 justify-end">
                    {project.tags.map(tagId => (
                      <Badge key={tagId} variant="outline" className="h-6 w-6 p-0 flex items-center justify-center bg-background/70 backdrop-blur-sm dark:bg-black/30">
                        {renderPlatformTag(tagId)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <ProjectNotes project={project} onUpdate={onUpdate} isExpanded={false} />
              
              <Button variant="ghost" size="icon" className="rounded-full">
                {expanded ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-primary" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {expanded && (
          <CardContent className="space-y-6 pt-4">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-muted/50 to-transparent mb-4 dark:via-muted/20"></div>
            
            <div className="flex items-center justify-end gap-2">
              <NewProjectDialog 
                project={project}
                editMode={true}
                onProjectEdit={onUpdate}
                onProjectCreate={() => {}} // Add missing prop with empty function
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash className="h-4 w-4" /> Delete
              </Button>
            </div>
            
            <ProjectNotes project={project} onUpdate={onUpdate} isExpanded={true} />
            
            {project.users.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg border-muted-foreground/20 bg-background/50 backdrop-blur-sm dark:bg-black/20">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No users assigned to this project</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Edit the project to add users</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {project.users.map((user) => {
                  const dailyStatus = getUserStatus(user, currentDate);
                  const monthlyStatus = getUserMonthlyStatus(user, currentMonth);
                  const progressLimit = getProgressLimit(user);
                  const hasHitMonthlyLimit = hasReachedMonthlyLimit(user, currentMonth);
                  
                  return (
                    <div 
                      key={user.id} 
                      className="rounded-lg border border-muted/40 bg-background/60 backdrop-blur-sm p-4 transition-all hover:shadow-md dark:bg-black/20 dark:border-muted/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
                              {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{user.username}</h3>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="p-0 h-auto" 
                                      onClick={() => handleChangeUserLevel(user)}
                                    >
                                      {getUserLevelBadge(user.level)}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Level 1: 30 points/month, 5 points/day max</p>
                                    <p>Level 2: 100 points/month, no daily limit</p>
                                    <p className="text-xs mt-1">Click to change level</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                              <span>Daily</span>
                              <span className="font-mono">
                                {dailyStatus}/{user.level === UserLevel.Level1 ? "5" : "∞"}
                              </span>
                            </div>
                            <StatusSelector 
                              value={dailyStatus}
                              onChange={(value) => handleStatusChange(user.id, value)}
                              disabled={
                                (user.level === UserLevel.Level1 && hasReachedDailyLimit(user, currentDate)) 
                                || hasHitMonthlyLimit
                              }
                            />
                          </div>
                          
                          <div className="space-y-1 min-w-[80px]">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                              <div className="flex items-center">
                                <span>Points</span>
                                {hasHitMonthlyLimit && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Monthly limit reached ({progressLimit} points)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <span className="font-mono font-semibold">{monthlyStatus}/{progressLimit}</span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={Math.min(100, (monthlyStatus / progressLimit) * 100)} 
                                className="h-1"
                              />
                              <div className="grid grid-cols-5 gap-0.5 absolute inset-0 -top-1">
                                {Array.from({length: 5}).map((_, i) => {
                                  const threshold = Math.round(progressLimit * (i / 4));
                                  return (
                                    <div 
                                      key={i} 
                                      className={cn(
                                        "h-3 w-0.5 mx-auto rounded-full opacity-50",
                                        monthlyStatus >= threshold ? `bg-status-${i+1}` : "bg-muted/20"
                                      )}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div 
                          className="rounded-md border p-3 bg-muted/10 text-sm cursor-pointer hover:bg-muted/20 transition-colors"
                          onClick={() => setEditingNote(user.id)}
                        >
                          {editingNote === user.id ? (
                            <Textarea
                              value={user.note || ""}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add notes about this user's status..."
                              className="min-h-[80px] bg-background text-foreground dark:text-white"
                              autoFocus
                              onBlur={() => {
                                if (user.note !== noteText) {
                                  handleNoteChange(user.id, noteText);
                                }
                                setEditingNote(null);
                              }}
                            />
                          ) : (
                            user.note ? user.note : <span className="text-muted-foreground italic">Click to add status notes</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
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
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => onDelete?.(project.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={userLevelDialogOpen} onOpenChange={setUserLevelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Level</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <>
                  <p className="mb-2">Select a level for {selectedUser.username}:</p>
                  <div className="grid gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={selectedUser.level === UserLevel.Level1 ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => updateUserLevel(UserLevel.Level1)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Level 1
                        <span className="ml-auto text-xs text-muted-foreground">
                          30 points/month, 5 points/day
                        </span>
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={selectedUser.level === UserLevel.Level2 ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => updateUserLevel(UserLevel.Level2)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Level 2
                        <span className="ml-auto text-xs text-muted-foreground">
                          100 points/month, no daily limit
                        </span>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
