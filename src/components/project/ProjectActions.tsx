
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { Project } from "@/types";

interface ProjectActionsProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  onOpenDeleteDialog: () => void;
}

export const ProjectActions = ({ 
  project, 
  onUpdate, 
  onOpenDeleteDialog 
}: ProjectActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-2">
      <NewProjectDialog 
        project={project}
        editMode={true}
        onProjectEdit={onUpdate}
        onProjectCreate={() => {}}
        trigger={
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9"
          >
            <Edit className="h-4 w-4" />
          </Button>
        }
      />
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDeleteDialog();
        }}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};
