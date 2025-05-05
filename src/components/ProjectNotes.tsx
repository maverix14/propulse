
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StickyNote } from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
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

  if (!isExpanded && !isEditing) return null;

  return (
    <div className="w-full">
      {isEditing ? (
        <div className="flex flex-col gap-2 w-full">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add notes about this project..."
            className="min-h-[100px] bg-background"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSaveNote();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setNoteText(project.note || '');
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveNote}
            >
              Save Note
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="h-8 px-3 rounded-full gap-2 w-full justify-start hover:bg-muted/20"
          onClick={() => setIsEditing(true)}
        >
          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-background flex items-center justify-center border">
            <StickyNote className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm truncate">
            {project.note ? project.note : "Add project notes"}
          </span>
        </Button>
      )}
    </div>
  );
};
