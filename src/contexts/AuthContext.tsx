
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  isInitialized: boolean;
  isOnline: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true); // Default to guest mode
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Set up online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If signed in, no longer a guest
        if (session) {
          setIsGuest(false);
          localStorage.removeItem('isGuestMode');
        }
        
        setIsInitialized(true);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If user has an active session, they're not a guest
      if (session) {
        setIsGuest(false);
        localStorage.removeItem('isGuestMode');
      } else {
        // Default to guest mode for better offline experience
        setIsGuest(true);
        localStorage.setItem('isGuestMode', 'true');
      }
      
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isOnline) {
      throw new Error('You are currently offline. Please connect to the internet to sign in.');
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setIsGuest(false);
    localStorage.removeItem('isGuestMode');
  };

  const signUp = async (email: string, password: string) => {
    if (!isOnline) {
      throw new Error('You are currently offline. Please connect to the internet to sign up.');
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    // If online, perform actual sign out
    if (isOnline && session) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    
    // Always switch to guest mode on sign out
    setIsGuest(true);
    localStorage.setItem('isGuestMode', 'true');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('isGuestMode', 'true');
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isGuest, 
      signIn, 
      signUp, 
      signOut, 
      continueAsGuest,
      isInitialized,
      isOnline
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
