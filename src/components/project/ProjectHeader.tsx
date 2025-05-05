
import { ChevronDown, ChevronUp, Users, Zap } from "lucide-react";
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
        return <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center bg-background/70 backdrop-blur-sm dark:bg-black/30">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor"/>
          </svg>
        </Badge>;
      case 'vercel':
        return <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center bg-background/70 backdrop-blur-sm dark:bg-black/30">
          <svg className="h-3.5 w-3.5" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
          </svg>
        </Badge>;
      case 'supabase':
        return <Badge variant="outline" className="h-6 w-6 p-0 flex items-center justify-center bg-background/70 backdrop-blur-sm dark:bg-black/30">
          <svg className="h-3.5 w-3.5" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"/>
            <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor" fillOpacity="0.6"/>
            <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="currentColor"/>
          </svg>
        </Badge>;
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
          
          <Button variant="ghost" size="icon" className="rounded-full">
            {expanded ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-primary" />}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
