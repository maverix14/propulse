
import { useState } from "react";
import { ChevronDown, ChevronUp, Users, Zap, Edit, Trash, UserPlus, X, Check, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(project);
  const [newUsername, setNewUsername] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userLevelDialogOpen, setUserLevelDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const { toast } = useToast();
  
  const currentDate = getCurrentDate();
  const currentMonth = getCurrentMonth();
  
  const { userCount, dailyStatusSum, averageStatus } = getProjectStats(project, currentDate);
  
  const handleProjectEdit = () => {
    onUpdate(editedProject);
    setIsEditing(false);
    toast({
      title: "Project updated",
      description: "Project details have been updated successfully."
    });
  };

  const handleAddUser = () => {
    if (!newUsername.trim()) return;
    
    // Check if user already exists in this project
    const existingUser = project.users.find(user => 
      user.username.toLowerCase() === newUsername.trim().toLowerCase()
    );
    
    if (existingUser) {
      toast({
        title: "User already exists",
        description: "This user is already in the project.",
        variant: "destructive"
      });
      return;
    }
    
    // Initialize a new user (will check global registry)
    const newUser = initializeNewUser(newUsername.trim());
    
    const updatedProject = {
      ...project,
      users: [...project.users, newUser]
    };
    
    onUpdate(updatedProject);
    setNewUsername("");
    
    toast({
      title: "User added",
      description: `${newUser.username} has been added to the project.`
    });
  };

  const handleRemoveUser = (userId: string) => {
    const updatedUsers = project.users.filter(user => user.id !== userId);
    const updatedProject = { ...project, users: updatedUsers };
    onUpdate(updatedProject);
    
    toast({
      title: "User removed",
      description: "The user has been removed from the project."
    });
  };

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
    
    // Sync across all projects
    const updatedProjects = syncUserAcrossProjects(updatedUser);
    
    // Find the updated version of current project
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
    
    // Check if user has reached daily limit (Level 1 users only)
    if (userToUpdate.level === UserLevel.Level1 && 
        hasReachedDailyLimit(userToUpdate, currentDate) && 
        value > (userToUpdate.dailyStatus?.[currentDate] || 0)) {
      toast({
        title: "Daily limit reached",
        description: "Level 1 users can only add up to 5 points per day.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if user has reached monthly limit
    if (hasReachedMonthlyLimit(userToUpdate, currentMonth) && 
        value > (userToUpdate.dailyStatus?.[currentDate] || 0)) {
      toast({
        title: "Monthly limit reached",
        description: `Level ${userToUpdate.level} users can only add up to ${userToUpdate.level === UserLevel.Level1 ? 30 : 100} points per month.`,
        variant: "destructive"
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

    // Sync this user across all projects
    const updatedProjects = syncUserAcrossProjects(updatedUser);
    
    // Find the updated version of the current project
    const thisProject = updatedProjects.find(p => p.id === project.id);
    if (thisProject) {
      onUpdate(thisProject);
    }
  };

  const startEditingNote = (userId: string, note: string) => {
    setEditingNote(userId);
    setNoteText(note || "");
  };

  const saveNote = (userId: string) => {
    handleNoteChange(userId, noteText);
    setEditingNote(null);
  };

  const handleNoteChange = (userId: string, note: string) => {
    const userToUpdate = project.users.find(user => user.id === userId);
    if (!userToUpdate) return;

    const updatedUser = { ...userToUpdate, note };
    
    // Sync across all projects
    const updatedProjects = syncUserAcrossProjects(updatedUser);
    
    // Find the updated version of current project
    const thisProject = updatedProjects.find(p => p.id === project.id);
    if (thisProject) {
      onUpdate(thisProject);
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
        className="ml-2 text-xs flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Level {level}
      </Badge>
    );
  };

  const getProgressLimit = (user: UserType) => {
    return user.level === UserLevel.Level1 ? 30 : 100;
  };

  return (
    <>
      <Card style={getCardStyle()} className="transition-all duration-300 hover:shadow-lg border-none backdrop-blur-sm dark:bg-black/20">
        <CardHeader 
          className="cursor-pointer rounded-t-lg backdrop-blur-sm py-4" 
          onClick={toggleExpanded}
        >
          <div className="flex justify-between items-center">
            {isEditing ? (
              <div className="flex-1 flex items-center gap-4">
                <div className="relative h-6 w-6 flex items-center justify-center text-primary dark:text-primary">
                  <FontAwesomeIcon icon={getProjectIcon()} className="h-5 w-5" />
                </div>
                <Input
                  value={editedProject.name}
                  onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                  className="max-w-[200px]"
                />
                <Textarea
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  className="flex-1 h-[40px] resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleProjectEdit}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="relative h-6 w-6 flex items-center justify-center text-primary dark:text-primary">
                  <FontAwesomeIcon icon={getProjectIcon()} className="h-5 w-5" />
                  <div className="absolute inset-0 blur-md rounded-full bg-primary/10 dark:bg-primary/20"></div>
                </div>
                <div className="flex-1">
                  <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent dark:from-primary dark:to-primary/60">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{project.description}</CardDescription>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4">
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
              
              <Button variant="ghost" size="icon" className="rounded-full">
                {expanded ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-primary" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {expanded && (
          <CardContent className="space-y-6 pt-4">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-muted/50 to-transparent mb-4 dark:via-muted/20"></div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add new user..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleAddUser}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" /> Edit
                </Button>
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
            </div>
            
            {project.users.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg border-muted-foreground/20 bg-background/50 backdrop-blur-sm dark:bg-black/20">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No users assigned to this project</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Add users to start tracking status</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {project.users.map((user) => {
                  const dailyStatus = getUserStatus(user, currentDate);
                  const monthlyStatus = getUserMonthlyStatus(user, currentMonth);
                  const progressLimit = getProgressLimit(user);
                  const hasHitDailyLimit = hasReachedDailyLimit(user, currentDate);
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
                            {editingNote === user.id ? (
                              <div className="flex items-center mt-1">
                                <Input 
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  className="h-6 text-xs py-1 px-2 bg-background/80 dark:bg-black/40"
                                  placeholder="Add status note..."
                                />
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6 ml-1" 
                                  onClick={() => saveNote(user.id)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingNote(user.id, user.note || "");
                                }}
                              >
                                <span>{user.note ? user.note : "Add status note..."}</span>
                                <Edit className="h-3 w-3 opacity-60" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                              <div className="flex items-center">
                                <span>Daily</span>
                                {hasHitDailyLimit && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Daily limit reached (5 points)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <span className="font-mono">{dailyStatus}/5</span>
                            </div>
                            <StatusSelector 
                              value={dailyStatus}
                              onChange={(value) => handleStatusChange(user.id, value)}
                              disabled={hasHitDailyLimit || hasHitMonthlyLimit}
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
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
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
