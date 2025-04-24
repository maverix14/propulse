
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"

export function Toaster() {
  const { toasts, dismiss, toast } = useToast()
  const [appVersion, setAppVersion] = useState<string | null>(null);

  // Auto-dismiss toasts after 3 seconds
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.open) {
        const timer = setTimeout(() => {
          dismiss(toast.id)
        }, 3000)
        
        return () => clearTimeout(timer)
      }
    })
  }, [toasts, dismiss])

  // Check for app updates on load
  useEffect(() => {
    // Check for app version from URL and manifest
    const fetchManifestVersion = async () => {
      try {
        const response = await fetch('/manifest.json?nocache=' + Date.now());
        const manifest = await response.json();
        
        const urlParams = new URLSearchParams(window.location.search);
        const currentVersion = urlParams.get('version');
        
        // If version from URL doesn't match manifest version, we have an update
        if (currentVersion && manifest.version && currentVersion !== manifest.version) {
          console.log(`App version changed from ${currentVersion} to ${manifest.version}, clearing cache`);
          setAppVersion(manifest.version);
          
          toast({
            title: "App Update Available",
            description: "A new version is available. Click to update.",
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1" 
                onClick={() => {
                  clearCache().then(() => {
                    window.location.href = `/?version=${manifest.version}`;
                  });
                }}
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Update
              </Button>
            )
          });
        }
      } catch (error) {
        console.error('Failed to check for app updates:', error);
      }
    };
    
    fetchManifestVersion();
  }, [toast]);

  // Register a listener for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Notify user that the app has been updated
        console.log('Service worker controller has changed - app updated');
        toast({
          title: "App Updated",
          description: "The application has been updated to the latest version."
        });
      });
    }
  }, [toast]);

  const clearCache = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        resolve();
        return;
      }
      
      navigator.serviceWorker.ready
        .then(registration => {
          if (!registration.active) {
            console.log('No active service worker');
            resolve();
            return;
          }
          
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data.error) {
              console.error('Error clearing cache:', event.data.error);
              reject(event.data.error);
            } else {
              console.log('Cache cleared successfully:', event.data.result);
              resolve();
            }
          };
          
          registration.active.postMessage(
            { type: 'CLEAR_CACHE' },
            [messageChannel.port2]
          );
        })
        .catch(err => {
          console.error('Error with service worker:', err);
          reject(err);
        });
    });
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
