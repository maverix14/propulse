
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { loadProjects } from '@/utils/storageUtils';
import { useToast } from '@/hooks/use-toast';

export const DataMigration: React.FC = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Skip migration for guest users
    if (isGuest || !user) return;

    const migrateData = async () => {
      try {
        const localProjects = loadProjects();
        if (localProjects.length === 0) return;

        // Migrate each project
        for (const project of localProjects) {
          const { error } = await supabase
            .from('projects')
            .insert({
              id: project.id,
              name: project.name,
              description: project.description,
              created_by: user.id,
              created_at: project.created_at, // Changed from createdAt to created_at
            });

          if (error) {
            console.error('Error migrating project:', error);
            continue;
          }
        }

        // Clear local storage after successful migration
        // We want to keep the isGuestMode flag
        const isGuestMode = localStorage.getItem('isGuestMode');
        localStorage.clear();
        if (isGuestMode) {
          localStorage.setItem('isGuestMode', isGuestMode);
        }
        
        toast({
          title: "Data Migration Complete",
          description: "Your local projects have been migrated to your account"
        });
      } catch (error: any) {
        console.error('Migration error:', error);
        toast({
          title: "Migration Error",
          description: "Failed to migrate local data",
          variant: "destructive"
        });
      }
    };

    migrateData();
  }, [user, isGuest, toast]);

  return null;
};
