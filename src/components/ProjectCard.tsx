
import { useState } from "react";
import { ChevronDown, ChevronUp, User, Users, Zap, Rocket, Edit, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Project, StatusLevel, User as UserType, getProjectStats } from "@/types";
import { StatusSelector } from "./StatusSelector";
import { StatusIndicator } from "./StatusIndicator";
import { getCurrentDate, getCurrentMonth } from "@/utils/dateUtils";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface ProjectCardProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
}

export const ProjectCard = ({ project, onUpdate }: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const currentDate = getCurrentDate();
  const currentMonth = getCurrentMonth();

  // Calculate project statistics
  const { userCount, dailyStatusSum, averageStatus } = getProjectStats(project, currentDate);
  
  // Determine background gradient based on average status
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
    const updatedUsers = project.users.map(user => {
      if (user.id === userId) {
        // Create a copy of dailyStatus or initialize if undefined
        const dailyStatus = { ...(user.dailyStatus || {}) };
        dailyStatus[currentDate] = value;

        // Calculate monthly status
        const monthlyStatus = { ...(user.monthlyStatus || {}) };
        
        // Sum up all the daily statuses for the current month
        const monthlySum = Object.entries(dailyStatus)
          .filter(([date]) => date.startsWith(currentMonth))
          .reduce((sum, [, status]) => sum + status, 0);
        
        monthlyStatus[currentMonth] = monthlySum;

        return {
          ...user,
          dailyStatus,
          monthlyStatus
        };
      }
      return user;
    });

    onUpdate({
      ...project,
      users: updatedUsers
    });
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
    const updatedUsers = project.users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          note
        };
      }
      return user;
    });

    onUpdate({
      ...project,
      users: updatedUsers
    });
  };

  const getUserStatus = (user: UserType, date: string): StatusLevel => {
    const status = (user.dailyStatus && user.dailyStatus[date]) || 1;
    return Math.max(1, Math.min(5, status)) as StatusLevel;
  };

  const getUserMonthlyStatus = (user: UserType, month: string): number => {
    return (user.monthlyStatus && user.monthlyStatus[month]) || 0;
  };

  return (
    <Card style={getCardStyle()} className="transition-all duration-300 hover:shadow-lg border-none backdrop-blur-sm">
      <CardHeader 
        className="cursor-pointer rounded-t-lg backdrop-blur-sm" 
        onClick={toggleExpanded}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Rocket className="h-6 w-6 text-primary" />
            <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {project.name}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            {expanded ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-primary" />}
          </Button>
        </div>
        <CardDescription className="mt-2 text-muted-foreground">{project.description}</CardDescription>
        
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center gap-1 bg-background/70 backdrop-blur-sm">
              <Users className="h-3.5 w-3.5" />
              <span>{userCount}</span>
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1 bg-background/70 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5" />
              <span>Points: {dailyStatusSum}</span>
            </Badge>
          </div>
          
          {averageStatus > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Average:</span>
              <Badge 
                className={cn(
                  "font-mono",
                  averageStatus >= 4 ? "bg-status-5" : 
                  averageStatus >= 3 ? "bg-status-4" : 
                  averageStatus >= 2 ? "bg-status-3" : 
                  averageStatus >= 1 ? "bg-status-2" : "bg-status-1"
                )}
              >
                {averageStatus.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-6 pt-4">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-muted/50 to-transparent mb-4"></div>
          
          {project.users.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg border-muted-foreground/20 bg-background/50 backdrop-blur-sm">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No users assigned to this project</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Add users to start tracking status</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {project.users.map((user) => {
                const dailyStatus = getUserStatus(user, currentDate);
                const monthlyStatus = getUserMonthlyStatus(user, currentMonth);
                
                return (
                  <div 
                    key={user.id} 
                    className="rounded-lg border border-muted/40 bg-background/60 backdrop-blur-sm p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user.username}</h3>
                          {editingNote === user.id ? (
                            <div className="flex items-center mt-1">
                              <Input 
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="h-6 text-xs py-1 px-2 bg-background/80"
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
                            <span>Daily</span>
                            <span className="font-mono">{dailyStatus}/5</span>
                          </div>
                          <StatusSelector 
                            value={dailyStatus}
                            onChange={(value) => handleStatusChange(user.id, value)}
                          />
                        </div>
                        
                        <div className="space-y-1 min-w-[80px]">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>Month</span>
                            <span className="font-mono font-semibold">{monthlyStatus}</span>
                          </div>
                          <div className="relative">
                            <Progress 
                              value={Math.min(100, (monthlyStatus / 150) * 100)} 
                              className="h-1"
                            />
                            <div className="grid grid-cols-5 gap-0.5 absolute inset-0 -top-1">
                              {[0, 30, 60, 90, 120].map((threshold, i) => (
                                <div 
                                  key={i} 
                                  className={cn(
                                    "h-3 w-0.5 mx-auto rounded-full opacity-50",
                                    monthlyStatus >= threshold ? `bg-status-${i+1}` : "bg-muted/20"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
      
      <CardFooter className="text-xs text-muted-foreground/70 italic p-4 pt-0">
        Created: {new Date(project.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};
