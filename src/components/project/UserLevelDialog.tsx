
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
  if (!selectedUser) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change User Level</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-2">Select a level for {selectedUser.username}:</p>
            <div className="grid gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedUser.level === UserLevel.Level1 ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => onUpdateUserLevel(UserLevel.Level1)}
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
                  onClick={() => onUpdateUserLevel(UserLevel.Level2)}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Level 2
                  <span className="ml-auto text-xs text-muted-foreground">
                    100 points/month, no daily limit
                  </span>
                </Button>
              </div>
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
