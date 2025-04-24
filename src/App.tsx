
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { DataMigration } from "./components/DataMigration";
import { Suspense, lazy, useEffect } from "react";
import { useToast } from "./hooks/use-toast";

// Lazily load page components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
});

// Loading component to show while lazy components load
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-pulse text-center">
      <div className="h-8 w-40 bg-muted rounded mx-auto mb-4"></div>
      <div className="h-4 w-64 bg-muted/50 rounded mx-auto"></div>
    </div>
  </div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isGuest, isInitialized } = useAuth();
  
  // Show loading until authentication is initialized
  if (!isInitialized) {
    return <LoadingFallback />;
  }
  
  return (session || isGuest) ? children : <Navigate to="/auth" />;
};

// Component to handle service worker registration and updates
const ServiceWorkerHandler = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.info('Service worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.info('New service worker found!');
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: 'Update Available',
                    description: 'A new version is available. Reload to update.',
                    action: (
                      <button 
                        onClick={() => window.location.reload()} 
                        className="bg-primary text-white px-2 py-1 rounded text-xs"
                      >
                        Reload
                      </button>
                    )
                  });
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, [toast]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <DataMigration />
          <ServiceWorkerHandler />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/settings" element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } />
                <Route path="/" element={
                  <PrivateRoute>
                    <Index />
                  </PrivateRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
