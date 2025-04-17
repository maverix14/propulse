
import { useState } from "react";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Project, StatusLevel, User as UserType } from "@/types";
import { StatusSelector } from "./StatusSelector";
import { StatusIndicator } from "./StatusIndicator";
import { getCurrentDate, getCurrentMonth } from "@/utils/dateUtils";

interface ProjectCardProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
}

export const ProjectCard = ({ project, onUpdate }: ProjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const currentDate = getCurrentDate();
  const currentMonth = getCurrentMonth();

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
    <Card>
      <CardHeader className="cursor-pointer" onClick={toggleExpanded}>
        <div className="flex justify-between items-center">
          <CardTitle>{project.name}</CardTitle>
          <Button variant="ghost" size="icon">
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="space-y-4">
            {project.users.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No users assigned to this project
              </div>
            ) : (
              project.users.map(user => (
                <div key={user.id} className="flex flex-col space-y-2 border-b pb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Today's Status</span>
                      <StatusSelector 
                        value={getUserStatus(user, currentDate)}
                        onChange={(value) => handleStatusChange(user.id, value)}
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Monthly Total</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-lg">
                          {getUserMonthlyStatus(user, currentMonth)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-muted-foreground">Note</span>
                      <Input
                        value={user.note || ""}
                        onChange={(e) => handleNoteChange(user.id, e.target.value)}
                        placeholder="Add a note..."
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
      <CardFooter className="text-xs text-muted-foreground">
        Created: {new Date(project.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};
