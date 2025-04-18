
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, KeyRound, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

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
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 dark:from-background dark:to-background/90 transition-colors duration-1000">
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
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
              {isGuest ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    You're currently using guest mode. Create an account to access security features.
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/auth')}>
                    Create Account
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={user?.email || "your@email.com"}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    Send Password Reset Link
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                User Levels
              </CardTitle>
              <CardDescription>
                Information about user levels and their limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Level 1 User</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>Daily limit: 5 points per day</li>
                  <li>Monthly limit: 30 points per month</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">Level 2 User</h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>No daily point limit</li>
                  <li>Monthly limit: 100 points per month</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Project moderators can change user levels in each project by clicking on the level badge next to a user's name.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Project Pulse v1.0.0</p>
      </footer>
    </div>
  );
};

export default Settings;
