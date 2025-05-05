
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
          onOpenDeleteDialog();
        }}
      >
        <Trash className="h-4 w-4" /> Delete
      </Button>
    </div>
  );
};
