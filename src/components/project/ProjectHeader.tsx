
import { ChevronDown, ChevronUp, Users, Zap, Github } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  IconDefinition,
  faRocket, 
  faAtom,
  faBrain,
  faCode,
  faDatabase,
  faFire,
  faGlobe,
  faLaptopCode,
  faMicrochip,
  faMountain,
  faPuzzlePiece,
  faRobot,
  faSatellite,
  faBook,
  faCloud,
  faLeaf,
  faStar,
  faLightbulb,
  faShield,
  faVial,
  faWifi
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { ProjectNotes } from "@/components/ProjectNotes";

interface ProjectHeaderProps {
  project: Project;
  expanded: boolean;
  toggleExpanded: () => void;
  userCount: number;
  dailyStatusSum: number;
  onUpdate: (updatedProject: Project) => void;
}

const iconMap: Record<string, IconDefinition> = {
  default: faRocket,
  atom: faAtom,
  brain: faBrain,
  code: faCode,
  database: faDatabase,
  fire: faFire,
  globe: faGlobe,
  laptop: faLaptopCode,
  chip: faMicrochip,
  mountain: faMountain,
  puzzle: faPuzzlePiece,
  robot: faRobot,
  satellite: faSatellite,
  book: faBook,
  cloud: faCloud,
  leaf: faLeaf,
  star: faStar,
  bulb: faLightbulb,
  shield: faShield,
  vial: faVial,
  wifi: faWifi
};

export const ProjectHeader = ({ 
  project, 
  expanded, 
  toggleExpanded, 
  userCount, 
  dailyStatusSum,
  onUpdate
}: ProjectHeaderProps) => {
  const getProjectIcon = () => {
    if (!project.icon) return iconMap.default;
    return iconMap[project.icon as keyof typeof iconMap] || iconMap.default;
  };
  
  const renderPlatformTag = (tagId: string) => {
    switch(tagId) {
      case 'github':
        return <Github className="h-3.5 w-3.5" />;
      case 'vercel':
        return (
          <svg className="h-3.5 w-3.5" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
          </svg>
        );
      case 'supabase':
        return (
          <svg className="h-3.5 w-3.5" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"/>
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor" fillOpacity="0.6"/>
            <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="currentColor"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <CardHeader 
      className="cursor-pointer rounded-t-lg backdrop-blur-sm py-4" 
      onClick={toggleExpanded}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative h-6 w-6 flex items-center justify-center text-primary dark:text-primary">
            <FontAwesomeIcon icon={getProjectIcon()} className="h-5 w-5" />
            <div className="absolute inset-0 blur-md rounded-full bg-primary/10"></div>
          </div>
          <div className="flex-1">
            <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent dark:from-primary dark:to-primary/60">
              {project.name}
            </CardTitle>
            <CardDescription className="mt-1">{project.description}</CardDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center gap-1 bg-background/70 backdrop-blur-sm dark:bg-black/30">
                <Users className="h-3.5 w-3.5" />
                <span>{userCount}</span>
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1 bg-background/70 backdrop-blur-sm dark:bg-black/30">
                <Zap className="h-3.5 w-3.5" />
                <span>{dailyStatusSum}</span>
              </Badge>
            </div>
            
            {project.tags && project.tags.length > 0 && (
              <div className="flex items-center gap-1 justify-end">
                {project.tags.map(tagId => (
                  <Badge key={tagId} variant="outline" className="h-6 w-6 p-0 flex items-center justify-center bg-background/70 backdrop-blur-sm dark:bg-black/30">
                    {renderPlatformTag(tagId)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <ProjectNotes project={project} onUpdate={onUpdate} isExpanded={false} />
          
          <Button variant="ghost" size="icon" className="rounded-full">
            {expanded ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-primary" />}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
