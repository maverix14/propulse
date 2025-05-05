
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProjectNotesProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  isExpanded: boolean;
}

export const ProjectNotes = ({ project, onUpdate, isExpanded }: ProjectNotesProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(project.note || '');
  const { toast } = useToast();

  const handleSaveNote = () => {
    // Only update if there's been a change
    if (noteText !== project.note) {
      const updatedProject = {
        ...project,
        note: noteText
      };
      onUpdate(updatedProject);
      toast({
        title: "Note updated",
        description: "Project note has been saved",
      });
    }
    setIsEditing(false);
  };

  if (!isExpanded) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center">
          <StickyNote className="h-4 w-4 mr-1" /> Project Notes
        </h4>
      </div>
      {isEditing ? (
        <div className="mt-2">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add notes about this project..."
            className="min-h-[100px] bg-background text-foreground dark:text-white"
            onBlur={handleSaveNote}
            autoFocus
          />
        </div>
      ) : (
        <div 
          className="rounded-md border p-3 bg-muted/10 text-sm mt-2 cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => setIsEditing(true)}
        >
          {project.note || <span className="text-muted-foreground italic">Click to add notes</span>}
        </div>
      )}
    </div>
  );
};
