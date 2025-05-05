
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Project, projectSchema } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { faRocket, faAtom, faBrain, faCode, faDatabase, faFire, faGlobe, faLaptopCode, faMicrochip, faMountain, faPuzzlePiece, faRobot, faSatellite, faBook, faCloud, faLeaf, faStar, faLightbulb, faShield, faVial, faWifi } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NewProjectDialogProps {
  onProjectCreate: (project: Project) => void;
  initialProject?: Project; // Add this to handle edit mode
  onProjectEdit?: (updatedProject: Project) => void; // Add this to handle project updates
  trigger?: React.ReactNode; // Add this to customize the trigger element
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({ 
  onProjectCreate, 
  initialProject, 
  onProjectEdit,
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(initialProject?.icon || "rocket");
  
  // Determine if we're in edit mode
  const isEditMode = !!initialProject;

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialProject?.name || "",
      description: initialProject?.description || "",
      icon: initialProject?.icon || "rocket",
      tags: initialProject?.tags || [],
    },
  });

  const icons = [
    { id: "rocket", icon: faRocket, label: "Rocket" },
    { id: "atom", icon: faAtom, label: "Atom" },
    { id: "brain", icon: faBrain, label: "Brain" },
    { id: "code", icon: faCode, label: "Code" },
    { id: "database", icon: faDatabase, label: "Database" },
    { id: "fire", icon: faFire, label: "Fire" },
    { id: "globe", icon: faGlobe, label: "Globe" },
    { id: "laptop", icon: faLaptopCode, label: "Laptop" },
    { id: "chip", icon: faMicrochip, label: "Chip" },
    { id: "mountain", icon: faMountain, label: "Mountain" },
    { id: "puzzle", icon: faPuzzlePiece, label: "Puzzle" },
    { id: "robot", icon: faRobot, label: "Robot" },
    { id: "satellite", icon: faSatellite, label: "Satellite" },
    { id: "book", icon: faBook, label: "Book" },
    { id: "cloud", icon: faCloud, label: "Cloud" },
    { id: "leaf", icon: faLeaf, label: "Leaf" },
    { id: "star", icon: faStar, label: "Star" },
    { id: "bulb", icon: faLightbulb, label: "Bulb" },
    { id: "shield", icon: faShield, label: "Shield" },
    { id: "vial", icon: faVial, label: "Vial" },
    { id: "wifi", icon: faWifi, label: "Wifi" },
  ];

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    if (isEditMode && initialProject && onProjectEdit) {
      // Update existing project
      const updatedProject: Project = {
        ...initialProject,
        name: data.name,
        description: data.description || "",
        icon: selectedIcon || undefined,
        tags: data.tags,
      };
      onProjectEdit(updatedProject);
    } else {
      // Create a new project with the form data
      const newProject: Project = {
        id: uuidv4(),
        name: data.name,
        description: data.description || "",
        icon: selectedIcon || undefined,
        users: [],
        created_at: new Date().toISOString(),
        tags: data.tags,
      };
      
      // Call the parent component's callback
      onProjectCreate(newProject);
    }
    
    // Reset the form and close the dialog
    form.reset();
    setSelectedIcon("rocket");
    setOpen(false);
  };

  // Custom dialog trigger or default button
  const dialogTrigger = trigger || (
    <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      New Project
    </Button>
  );

  return (
    <>
      {React.isValidElement(dialogTrigger) 
        ? React.cloneElement(dialogTrigger as React.ReactElement, { 
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              setOpen(true);
              if (dialogTrigger.props.onClick) dialogTrigger.props.onClick(e);
            }
          })
        : dialogTrigger
      }
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit project' : 'Create new project'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update project details' : 'Add a new project to manage your work'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My awesome project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a brief description of your project"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Project Icon</Label>
                <ScrollArea className="h-[160px] mt-2 border rounded-md p-2">
                  <div className="grid grid-cols-5 gap-2">
                    {icons.map((icon) => (
                      <Button
                        key={icon.id}
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex flex-col items-center justify-center h-16 w-full p-2",
                          selectedIcon === icon.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => {
                          setSelectedIcon(icon.id);
                          form.setValue("icon", icon.id);
                        }}
                      >
                        <FontAwesomeIcon icon={icon.icon} className="h-6 w-6 mb-1" />
                        <span className="text-xs">{icon.label}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedIcon(initialProject?.icon || "rocket");
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Project'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
