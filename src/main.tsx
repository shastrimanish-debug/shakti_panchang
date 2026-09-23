import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { LicenseProvider } from './lib/license-client';

// Auto-register service worker for PWA offline capabilities in production only
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    try {
      registerSW({
        immediate: true,
        onRegisterError(error: any) {
          console.warn('PWA service worker registration skipped:', error);
        },
      });
    } catch (err) {
      console.warn('PWA registration error:', err);
    }
  } else {
    // In development mode, unregister any active service worker so Vite dev server modules are not intercepted
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LicenseProvider>
      <App />
    </LicenseProvider>
  </React.StrictMode>
);
