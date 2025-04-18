
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Edit, Check } from 'lucide-react';
import { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectNotesProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  isExpanded: boolean;
}

export const ProjectNotes = ({ project, onUpdate, isExpanded }: ProjectNotesProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(project.note || '');

  const handleSaveNote = () => {
    const updatedProject = {
      ...project,
      note: noteText
    };
    onUpdate(updatedProject);
    setIsEditing(false);
  };

  // If not expanded, show a preview of the note
  if (!isExpanded) {
    return project.note ? (
      <div className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1 ml-auto mr-2">
        <StickyNote className="h-3 w-3" />
        <span>{project.note}</span>
      </div>
    ) : null;
  }

  return (
    <div className={cn("mt-4", isExpanded ? "" : "hidden")}>
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="project-note" className="text-sm font-medium flex items-center">
              <StickyNote className="h-4 w-4 mr-1" /> Project Notes
            </label>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleSaveNote}
              className="h-7 px-2 flex items-center gap-1"
            >
              <Check className="h-4 w-4" /> Save
            </Button>
          </div>
          <Textarea
            id="project-note"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add notes about this project..."
            className="min-h-[80px] text-sm"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center">
              <StickyNote className="h-4 w-4 mr-1" /> Project Notes
            </h4>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
              className="h-7 px-2 flex items-center gap-1"
            >
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </div>
          <div className="rounded-md border p-3 bg-muted/10 text-sm">
            {project.note || <span className="text-muted-foreground italic">No notes</span>}
          </div>
        </div>
      )}
    </div>
  );
};
