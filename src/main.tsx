
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure any error is caught and logged
const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error('Failed to render app:', error);
  }
};

renderApp();
