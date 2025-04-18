
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Edit, Check } from 'lucide-react';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface ProjectNotesProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  isExpanded: boolean;
}

export const ProjectNotes = ({ project, onUpdate, isExpanded }: ProjectNotesProps) => {
  const [noteText, setNoteText] = useState(project.note || '');

  const handleSaveNote = () => {
    const updatedProject = {
      ...project,
      note: noteText
    };
    onUpdate(updatedProject);
  };

  // Hide notes in collapsed view
  if (!isExpanded) return null;

  return (
    <div className={cn("mt-4", isExpanded ? "" : "hidden")}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center">
          <StickyNote className="h-4 w-4 mr-1" /> Project Notes
        </h4>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 flex items-center gap-1"
            >
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add notes about this project..."
                className="min-h-[100px] bg-background text-foreground"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveNote}>
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="rounded-md border p-3 bg-muted/10 text-sm mt-2">
        {project.note || <span className="text-muted-foreground italic">No notes</span>}
      </div>
    </div>
  );
};
