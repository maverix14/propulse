
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { User, UserLevel } from "@/types";
import { useEffect, useState } from "react";

interface UserLevelSetting {
  id: number;
  name: string;
  dailyLimit: number | null;
  monthlyLimit: number;
}

interface UserLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: User | null;
  onUpdateUserLevel: (level: UserLevel) => void;
}

export const UserLevelDialog = ({
  open,
  onOpenChange,
  selectedUser,
  onUpdateUserLevel
}: UserLevelDialogProps) => {
  const [userLevels, setUserLevels] = useState<UserLevelSetting[]>([]);
  
  useEffect(() => {
    // Get user levels from localStorage
    const storedLevels = localStorage.getItem('userLevelSettings');
    if (storedLevels) {
      setUserLevels(JSON.parse(storedLevels));
    } else {
      // Default levels if not found
      setUserLevels([
        {
          id: 1,
          name: "Level 1",
          dailyLimit: 5,
          monthlyLimit: 30
        },
        {
          id: 2,
          name: "Level 2",
          dailyLimit: null,
          monthlyLimit: 100
        }
      ]);
    }
  }, [open]);
  
  if (!selectedUser) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change User Level</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">Select a level for {selectedUser.username}:</p>
            <div className="grid gap-4 mt-4">
              {userLevels.map(level => (
                <div key={level.id} className="flex items-center space-x-2">
                  <Button
                    variant={selectedUser.level === level.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => onUpdateUserLevel(level.id as UserLevel)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {level.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {level.monthlyLimit} points/month, 
                      {level.dailyLimit ? ` ${level.dailyLimit} points/day` : ' no daily limit'}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
