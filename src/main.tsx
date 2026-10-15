import React from 'react';
import ReactDOM from 'react-dom/client';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import './i18n';
import { LanguageProvider } from './i18n';
import { App } from './App';
import './index.css';
import './board.css';
import { registerSW } from 'virtual:pwa-register';
import { LicenseProvider } from './lib/license-client';
import { initializeSecurityGuard } from './utils/securityGuard';
import { Capacitor } from '@capacitor/core';

const CACHE_GEN = "14";

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { message: string | null }> {
  state = { message: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? error.message : "ऐप नहीं खुली" };
  }

  render() {
    if (!this.state.message) return this.props.children;
    return (
      <div style={{ position: "fixed", inset: 0, background: "#f6efe2", color: "#3a2414", padding: 24, fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>शक्ति पंचांग</div>
        <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.5 }}>{this.state.message}</p>
      </div>
    );
  }
}

async function freeStaleAppCache() {
  try {
    if (localStorage.getItem("shakti_cache_gen") === CACHE_GEN) return;
    let hadWorker = false;
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      hadWorker = registrations.length > 0;
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    localStorage.setItem("shakti_cache_gen", CACHE_GEN);
    if (hadWorker) window.location.reload();
  } catch {
    // A stuck cache must not stop the panchang from opening.
  }
}

// Initialize Capacitor PWA Elements for web camera modal support
if (typeof window !== 'undefined') {
  defineCustomElements(window);
}

// Initialize anti-tamper and security safeguards
initializeSecurityGuard();

void freeStaleAppCache();

// The installed app already has its files. A service worker only keeps a stale screen.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
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
      <LanguageProvider>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </LanguageProvider>
    </LicenseProvider>
  </React.StrictMode>
);
