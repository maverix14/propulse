
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()

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

  // Add a "cache cleared" notification when the app updates
  useEffect(() => {
    // Register a listener for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Notify user that the app has been updated
        console.log('Service worker controller has changed - app updated');
      });
    }
  }, []);

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
