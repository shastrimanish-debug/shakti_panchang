import React from 'react';
import ReactDOM from 'react-dom/client';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import './i18n';
import { LanguageProvider } from './i18n';
import { App } from './App';
import './index.css';
import './board.css';
import { LicenseProvider } from './lib/license-client';
import { initializeSecurityGuard } from './utils/securityGuard';

// Initialize Capacitor PWA Elements for web camera modal support
if (typeof window !== 'undefined') {
  try {
    defineCustomElements(window);
  } catch {
    /* ignore */
  }
}

// Initialize anti-tamper and security safeguards
initializeSecurityGuard();

// Purge any stale Service Workers or Workbox caches that can cause a white screen after updates
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    })
    .catch(() => {});

  if ('caches' in window) {
    caches
      .keys()
      .then((keys) => {
        for (const key of keys) {
          void caches.delete(key);
        }
      })
      .catch(() => {});
  }
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMsg: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            height: '100dvh',
            backgroundColor: '#f6efe2',
            color: '#3a2414',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🕉️</div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#9a3412', margin: '0 0 8px' }}>
            श्री शक्ति वैदिक पंचांग
          </h2>
          <p style={{ fontSize: '13px', color: '#5c3a21', margin: '0 0 12px', maxWidth: '320px' }}>
            पृष्ठ पुनः लोड करें।
          </p>
          {this.state.errorMsg && (
            <pre
              style={{
                fontSize: '10px',
                color: '#7a5a3a',
                backgroundColor: '#efe2cc',
                padding: '8px 12px',
                borderRadius: '8px',
                maxWidth: '90vw',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginBottom: '16px',
              }}
            >
              {this.state.errorMsg}
            </pre>
          )}
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, errorMsg: '' });
              window.location.reload();
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              backgroundColor: '#9a3412',
              color: '#fff6e8',
              border: '1px solid #c8892d',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            पुनः खोलें (Reload)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <LicenseProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </LicenseProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
