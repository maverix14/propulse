
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PillTextField } from './project/PillTextField';

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
          className="cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          <PillTextField 
            icon={<StickyNote className="h-4 w-4" />}
            text={project.note || "Add project notes"}
            maxWidth="max-w-full"
          />
        </div>
      )}
    </div>
  );
};
