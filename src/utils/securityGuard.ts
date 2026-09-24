/**
 * Shakti Panchang - Client-Side Anti-Tamper & Security Guard
 * 
 * Provides defense-in-depth against reverse engineering, devtools inspection,
 * DOM tampering, and modified APK environments.
 */

export function initializeSecurityGuard(): void {
  if (typeof window === 'undefined') return;

  // 1. Disable developer keyboard shortcuts in production or standalone app mode
  const isProd = import.meta.env.PROD;

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Block F12
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Block Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 2. Prevent right-click context menu in app mode
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    // Check if running inside Capacitor Android or standalone PWA
    const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isProd && (isCapacitor || isStandalone)) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // 3. Anti-Debugging timing check in production
  if (isProd) {
    let devToolsOpenCount = 0;
    const checkDebugger = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      // If debugger is paused, the elapsed time will be significantly higher than normal execution
      if (end - start > 150) {
        devToolsOpenCount++;
        if (devToolsOpenCount > 2) {
          // Invalidate sensitive cache if active debugger is detected
          try {
            sessionStorage.clear();
          } catch {
            /* ignore */
          }
        }
      }
    };

    // Run periodic check without hogging CPU
    const timer = setInterval(checkDebugger, 4000);
    window.addEventListener('unload', () => clearInterval(timer));
  }
}
