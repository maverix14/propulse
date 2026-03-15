import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';
import { Project } from '@/types';
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
    if (noteText !== project.note) {
      onUpdate({ ...project, note: noteText });
      toast({
        title: "Note updated",
        description: "Project note has been saved",
      });
    }
    setIsEditing(false);
  };

  if (!isExpanded) return null;

  return (
    <div className="mt-4 w-full">
      {isEditing ? (
        <div className="mt-2">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add notes about this project..."
            className="min-h-[100px] max-h-[200px] bg-background text-foreground"
            onBlur={handleSaveNote}
            autoFocus
          />
        </div>
      ) : (
        <div 
          className="cursor-pointer max-w-full"
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