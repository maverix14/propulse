import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, StatusLevel, UserLevel, hasReachedDailyLimit, hasReachedMonthlyLimit } from "@/types";
import { Shield, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StatusSelector } from "@/components/StatusSelector";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PillTextField } from "./PillTextField";
import { StickyNote } from "lucide-react";

interface UserStatusCardProps {
  user: User;
  currentDate: string;
  currentMonth: string;
  onStatusChange: (userId: string, value: StatusLevel) => void;
  onNoteChange: (userId: string, note: string) => void;
  onChangeUserLevel: (user: User) => void;
}

export const UserStatusCard = ({
  user,
  currentDate,
  currentMonth,
  onStatusChange,
  onNoteChange,
  onChangeUserLevel
}: UserStatusCardProps) => {
  const [editingNote, setEditingNote] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>(user.note || "");
  const {
    toast
  } = useToast();
  
  const getUserStatus = (user: User, date: string): StatusLevel => {
    // Get existing status or return 0 (not 1)
    const status = user.dailyStatus && date in user.dailyStatus ? user.dailyStatus[date] : 0;
    return status as StatusLevel || 0 as StatusLevel;
  };
  const getUserMonthlyStatus = (user: User, month: string): number => {
    return user.monthlyStatus && user.monthlyStatus[month] || 0;
  };
  const getProgressLimit = (user: User) => {
    return user.level === UserLevel.Level1 ? 30 : 100;
  };
  const getDailyLimit = (user: User) => {
    return user.level === UserLevel.Level1 ? 5 : null;
  };
  const dailyStatus = getUserStatus(user, currentDate);
  const monthlyStatus = getUserMonthlyStatus(user, currentMonth);
  const progressLimit = getProgressLimit(user);
  const dailyLimit = getDailyLimit(user);
  const hasHitMonthlyLimit = hasReachedMonthlyLimit(user, currentMonth);
  const getUserLevelBadge = (level: UserLevel) => {
    return <Badge variant={level === UserLevel.Level1 ? "outline" : "secondary"} className="ml-2 text-xs flex items-center">
        <Shield className="h-3 w-3 mr-1" />
        {level}
      </Badge>;
  };
  return <div className="rounded-lg border border-muted/40 bg-background/60 backdrop-blur-sm p-4 transition-all hover:shadow-md dark:bg-black/20 dark:border-muted/20">
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
                    <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => onChangeUserLevel(user)}>
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
            <StatusSelector value={dailyStatus as StatusLevel} onChange={value => onStatusChange(user.id, value)} disabled={hasHitMonthlyLimit} />
          </div>
          
          <div className="space-y-1 min-w-[80px]">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <div className="flex items-center">
                <span>Points</span>
                {hasHitMonthlyLimit && <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Monthly limit reached ({progressLimit} points)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>}
              </div>
              <span className="font-mono font-semibold">{monthlyStatus}/{progressLimit}</span>
            </div>
            <div className="relative">
              <Progress value={Math.min(100, monthlyStatus / progressLimit * 100)} className="h-1" />
              <div className="grid grid-cols-5 gap-0.5 absolute inset-0 -top-1">
                {Array.from({
                length: 5
              }).map((_, i) => {
                const threshold = Math.round(progressLimit * (i / 4));
                return <div key={i} className={cn("h-3 w-0.5 mx-auto rounded-full opacity-50", monthlyStatus >= threshold ? `bg-status-${i + 1}` : "bg-muted/20")} />;
              })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 w-full">
        <div className="w-full overflow-hidden">
          {editingNote ? (
            <Textarea 
              value={noteText} 
              onChange={e => setNoteText(e.target.value)} 
              placeholder="Add notes about this user's status..." 
              className="min-h-[80px] max-h-[150px] bg-background text-foreground dark:text-white resize-none w-full" 
              autoFocus 
              onBlur={() => {
                onNoteChange(user.id, noteText);
                setEditingNote(false);
              }} 
            /> 
          ) : (
            <div 
              onClick={() => {
                setEditingNote(true);
                setNoteText(user.note || "");
              }} 
              className="cursor-pointer w-full overflow-hidden"
            >
              <PillTextField 
                icon={<StickyNote className="h-4 w-4" />} 
                text={user.note || "Add status notes"} 
                maxWidth="w-full" 
                className="max-w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>;
};
