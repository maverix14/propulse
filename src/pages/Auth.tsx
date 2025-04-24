
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRound, LogIn, UserPlus, ExternalLink, Wifi, WifiOff } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, continueAsGuest, session, isGuest, isOnline, isInitialized } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isInitialized && (session || isGuest)) {
      navigate('/');
    }
  }, [session, isGuest, navigate, isInitialized]);

  // Don't render anything until auth is initialized to prevent flickering
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95">
        <div className="animate-pulse text-center">
          <div className="h-8 w-40 bg-muted rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-muted/50 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please connect to the internet to sign in.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please connect to the internet to sign up.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signUp(email, password);
      toast({
        title: "Verification email sent",
        description: "Please check your email to verify your account"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate('/');
    toast({
      title: "Guest Mode Activated",
      description: "You are now using the app as a guest. Your data will be stored locally."
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border">
        <div className="flex items-center justify-center">
          <h2 className="text-3xl font-bold text-center mr-2">Project Pulse</h2>
          {!isOnline && <WifiOff className="h-5 w-5 text-amber-500" />}
        </div>
        
        {!isOnline && (
          <div className="py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-700 dark:text-amber-400 text-sm mb-4">
            You're currently offline. Continue in guest mode to use the app with local data storage.
          </div>
        )}
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" className="flex items-center gap-2" disabled={!isOnline}>
              <LogIn className="w-4 h-4" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2" disabled={!isOnline}>
              <UserPlus className="w-4 h-4" /> Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!isOnline || isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!isOnline || isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={!isOnline || isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!isOnline || isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!isOnline || isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={!isOnline || isLoading}>
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {isOnline ? "Or continue without account" : "Continue offline"}
            </span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={handleGuestMode}
        >
          <ExternalLink className="w-4 h-4" />
          Continue as Guest
        </Button>
      </div>
    </div>
  );
};

export default Auth;
