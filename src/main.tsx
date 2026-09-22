import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { LicenseProvider } from './lib/license-client';

// Auto-register service worker for PWA offline capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({
      immediate: true,
      onRegisterError(error: any) {
        console.warn('PWA service worker registration skipped in preview:', error);
      },
    });
  } catch (err) {
    console.warn('PWA registration error:', err);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LicenseProvider>
      <App />
    </LicenseProvider>
  </React.StrictMode>
);
