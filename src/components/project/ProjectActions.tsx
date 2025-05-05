
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
    <div className="flex flex-col items-end gap-2">
      <NewProjectDialog 
        project={project}
        editMode={true}
        onProjectEdit={onUpdate}
        onProjectCreate={() => {}}
        trigger={
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            <Edit className="h-4 w-4" />
          </Button>
        }
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:border-destructive"
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
