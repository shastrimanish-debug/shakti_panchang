import { Haptics } from '@capacitor/haptics';

/**
 * Triggers a subtle tactile 'selection' vibration using Capacitor Haptics.
 * Used when the user interacts with major buttons or navigates between book pages.
 * Gracefully falls back to web vibration or silent no-op if unsupported.
 */
export async function triggerHapticSelection(): Promise<void> {
  try {
    await Haptics.selectionChanged();
  } catch {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(10);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }
}

/**
 * Helper to wrap any click or navigation handler with haptic feedback.
 */
export function withHaptic<T extends (...args: unknown[]) => unknown>(fn?: T): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    triggerHapticSelection();
    if (fn) {
      fn(...args);
    }
  };
}
