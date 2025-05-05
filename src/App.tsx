
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { DataMigration } from "./components/DataMigration";
import { Suspense, lazy } from "react";

// Lazily load page components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));

// Create QueryClient instance outside of the component
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

// Modified route protection that allows guest access
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isInitialized } = useAuth();
  
  // Show loading until authentication is initialized
  if (!isInitialized) {
    return <LoadingFallback />;
  }
  
  // Allow all users (including guests) to access the route
  return <>{children}</>;
};

// Component to handle service worker registration
const ServiceWorkerHandler = () => {
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.info('Service worker registered:', registration);
        })
        .catch(error => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);
  
  return null;
};

// Main App component
const App = () => {
  return (
    <React.StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <React.Fragment>
                <TooltipProvider>
                  <DataMigration />
                  <ServiceWorkerHandler />
                  <Toaster />
                  <Sonner />
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
                </TooltipProvider>
              </React.Fragment>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
