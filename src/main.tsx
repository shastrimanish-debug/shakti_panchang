import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { LicenseProvider } from './lib/license-client';

// Auto-register service worker for PWA offline capabilities
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LicenseProvider>
      <App />
    </LicenseProvider>
  </React.StrictMode>
);
