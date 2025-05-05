import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, KeyRound, Shield, RotateCw, Plus, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
interface UserLevelSetting {
  id: number;
  name: string;
  dailyLimit: number | null;
  monthlyLimit: number;
  isEditing: boolean;
}
const Settings = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    user,
    isGuest,
    isOnline
  } = useAuth();

  // Use local storage for user levels to persist changes
  const getStoredLevels = (): UserLevelSetting[] => {
    const storedLevels = localStorage.getItem('userLevelSettings');
    if (storedLevels) {
      return JSON.parse(storedLevels);
    }
    return [{
      id: 1,
      name: "Level 1",
      dailyLimit: 5,
      monthlyLimit: 30,
      isEditing: false
    }, {
      id: 2,
      name: "Level 2",
      dailyLimit: null,
      monthlyLimit: 100,
      isEditing: false
    }];
  };
  const [userLevels, setUserLevels] = useState<UserLevelSetting[]>(getStoredLevels);
  const [newLevel, setNewLevel] = useState<UserLevelSetting | null>(null);

  // Save user levels to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('userLevelSettings', JSON.stringify(userLevels));
  }, [userLevels]);
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast({
        title: "Reset Email Sent",
        description: "Check your email for the password reset link"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const startEditing = (id: number) => {
    setUserLevels(userLevels.map(level => level.id === id ? {
      ...level,
      isEditing: true
    } : level));
  };
  const saveLevel = (id: number) => {
    setUserLevels(userLevels.map(level => level.id === id ? {
      ...level,
      isEditing: false
    } : level));
    toast({
      title: "Level Settings Saved",
      description: "User level settings have been updated"
    });
  };
  const updateLevelField = (id: number, field: keyof UserLevelSetting, value: any) => {
    setUserLevels(userLevels.map(level => level.id === id ? {
      ...level,
      [field]: value
    } : level));
  };
  const addNewLevel = () => {
    if (newLevel) {
      const nextId = Math.max(...userLevels.map(l => l.id)) + 1;
      const updatedLevels = [...userLevels, {
        ...newLevel,
        id: nextId,
        isEditing: false
      }];
      setUserLevels(updatedLevels);
      setNewLevel(null);
      toast({
        title: "Level Added",
        description: `${newLevel.name} has been added to user levels`
      });
    }
  };
  const startAddingLevel = () => {
    setNewLevel({
      id: 0,
      name: "New Level",
      dailyLimit: 10,
      monthlyLimit: 50,
      isEditing: true
    });
  };
  const cancelAddLevel = () => {
    setNewLevel(null);
  };
  const deleteLevel = (id: number) => {
    // Don't allow deleting Level 1 or Level 2
    if (id <= 2) {
      toast({
        title: "Cannot Delete",
        description: "Default levels cannot be removed",
        variant: "destructive"
      });
      return;
    }
    const updatedLevels = userLevels.filter(level => level.id !== id);
    setUserLevels(updatedLevels);
    toast({
      title: "Level Deleted",
      description: "User level has been removed"
    });
  };
  const handleClearCache = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          const messageChannel = new MessageChannel();
          const clearCachePromise = new Promise<void>((resolve, reject) => {
            messageChannel.port1.onmessage = event => {
              if (event.data.error) {
                reject(event.data.error);
              } else {
                resolve();
              }
            };
          });
          registration.active.postMessage({
            type: 'CLEAR_CACHE'
          }, [messageChannel.port2]);
          await clearCachePromise;
          toast({
            title: "Cache Cleared",
            description: "Application cache has been cleared successfully."
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear application cache",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background to-background/95 dark:from-background dark:to-background/90 transition-colors duration-1000">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <div className="mb-8 flex justify-center items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="absolute left-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyRound className="h-5 w-5 mr-2" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGuest ? <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    You're currently using guest mode. Create an account to access security features.
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/auth')}>
                    Create Account
                  </Button>
                </div> : <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={user?.email || "your@email.com"} required disabled={!isOnline} />
                  </div>
                  <Button type="submit" disabled={isSubmitting || !isOnline}>
                    Send Password Reset Link
                  </Button>
                </form>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                User Levels
              </CardTitle>
              <CardDescription>
                Configure user levels and their limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userLevels.map(level => <div key={level.id} className="p-4 border rounded-lg">
                  {level.isEditing ? <div className="space-y-4">
                      <div>
                        <label htmlFor={`level-name-${level.id}`} className="block text-sm font-medium mb-1">
                          Level Name
                        </label>
                        <Input id={`level-name-${level.id}`} value={level.name} onChange={e => updateLevelField(level.id, 'name', e.target.value)} />
                      </div>
                      
                      <div>
                        <label htmlFor={`daily-limit-${level.id}`} className="block text-sm font-medium mb-1">
                          Daily Limit (empty for unlimited)
                        </label>
                        <Input id={`daily-limit-${level.id}`} type="number" value={level.dailyLimit === null ? '' : level.dailyLimit} onChange={e => {
                    const value = e.target.value === '' ? null : Number(e.target.value);
                    updateLevelField(level.id, 'dailyLimit', value);
                  }} min="0" />
                      </div>
                      
                      <div>
                        <label htmlFor={`monthly-limit-${level.id}`} className="block text-sm font-medium mb-1">
                          Monthly Limit
                        </label>
                        <Input id={`monthly-limit-${level.id}`} type="number" value={level.monthlyLimit} onChange={e => updateLevelField(level.id, 'monthlyLimit', Number(e.target.value))} min="1" required />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => saveLevel(level.id)}>
                          Save
                        </Button>
                      </div>
                    </div> : <div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium flex items-center">
                          <span className="mr-2">{level.id}</span>
                          {level.name}
                        </h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEditing(level.id)}>
                            Edit
                          </Button>
                          {level.id > 2 && <Button variant="outline" size="sm" className="text-destructive" onClick={() => deleteLevel(level.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>}
                        </div>
                      </div>
                      
                      <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2">
                        <li>
                          Daily limit: {level.dailyLimit === null ? "No limit" : `${level.dailyLimit} points per day`}
                        </li>
                        <li>
                          Monthly limit: {level.monthlyLimit} points per month
                        </li>
                      </ul>
                    </div>}
                </div>)}
              
              {newLevel ? <div className="p-4 border rounded-lg border-dashed">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="new-level-name" className="block text-sm font-medium mb-1">
                        Level Name
                      </label>
                      <Input id="new-level-name" value={newLevel.name} onChange={e => setNewLevel({
                    ...newLevel,
                    name: e.target.value
                  })} />
                    </div>
                    
                    <div>
                      <label htmlFor="new-daily-limit" className="block text-sm font-medium mb-1">
                        Daily Limit (empty for unlimited)
                      </label>
                      <Input id="new-daily-limit" type="number" value={newLevel.dailyLimit === null ? '' : newLevel.dailyLimit} onChange={e => {
                    const value = e.target.value === '' ? null : Number(e.target.value);
                    setNewLevel({
                      ...newLevel,
                      dailyLimit: value
                    });
                  }} min="0" />
                    </div>
                    
                    <div>
                      <label htmlFor="new-monthly-limit" className="block text-sm font-medium mb-1">
                        Monthly Limit
                      </label>
                      <Input id="new-monthly-limit" type="number" value={newLevel.monthlyLimit} onChange={e => setNewLevel({
                    ...newLevel,
                    monthlyLimit: Number(e.target.value)
                  })} min="1" required />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={cancelAddLevel}>
                        Cancel
                      </Button>
                      <Button variant="default" size="sm" onClick={addNewLevel}>
                        Add Level
                      </Button>
                    </div>
                  </div>
                </div> : <Button className="w-full" variant="outline" onClick={startAddingLevel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Level
                </Button>}
              
              <p className="text-sm text-muted-foreground mt-4">
                Project moderators can change user levels in each project by clicking on the level badge next to a user's name.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RotateCw className="h-5 w-5 mr-2" />
                Application Cache
              </CardTitle>
              <CardDescription>
                Manage application cache and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you're experiencing issues with the application not updating or showing stale data,
                  you can clear the application cache.
                </p>
                
                <Button onClick={handleClearCache}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Clear Application Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        
      </footer>
    </div>;
};
export default Settings;
