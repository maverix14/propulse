import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { loadProjects } from '@/utils/storageUtils';
import { useToast } from '@/hooks/use-toast';

const MIGRATION_KEY = 'data-migration-complete';

export const DataMigration = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const hasMigrated = useRef(false);

  useEffect(() => {
    if (isGuest || !user || hasMigrated.current) return;

    // Check if migration already completed for this user
    const migrationFlag = localStorage.getItem(MIGRATION_KEY);
    if (migrationFlag === user.id) return;

    hasMigrated.current = true;

    const migrateData = async () => {
      try {
        const localProjects = loadProjects();
        if (localProjects.length === 0) {
          localStorage.setItem(MIGRATION_KEY, user.id);
          return;
        }

        for (const project of localProjects) {
          const { error } = await supabase
            .from('projects')
            .upsert({
              id: project.id,
              name: project.name,
              description: project.description,
              created_by: user.id,
              created_at: project.createdAt,
            });

          if (error) {
            console.error('Error migrating project:', error);
          }
        }

        // Mark migration as complete for this user
        localStorage.setItem(MIGRATION_KEY, user.id);

        toast({
          title: "Data Migration Complete",
          description: "Your local projects have been migrated to your account"
        });
      } catch (error) {
        console.error('Migration error:', error);
        hasMigrated.current = false; // Allow retry on error
      }
    };

    migrateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isGuest]);

  return null;
};