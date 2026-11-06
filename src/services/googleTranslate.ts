/**
 * Google Translate Integration Service for Shakti Panchang
 * Allows 1-click full-page automatic translation across 100+ global languages
 */

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

const STORAGE_KEY_GT_ENABLED = 'shakti_gt_auto_enabled';
const STORAGE_KEY_GT_LANG = 'shakti_gt_target_lang';

export function isGoogleTranslateEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_GT_ENABLED) === 'true';
}

export function setGoogleTranslateEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_GT_ENABLED, enabled ? 'true' : 'false');
  if (!enabled) {
    clearGoogleTranslate();
  }
}

export function getSavedGoogleTranslateLang(): string {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem(STORAGE_KEY_GT_LANG) || 'en';
}

export function setSavedGoogleTranslateLang(lang: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_GT_LANG, lang);
}

let scriptInjected = false;

export function initGoogleTranslate(): void {
  if (typeof window === 'undefined') return;

  // Set the global init callback
  window.googleTranslateElementInit = () => {
    try {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'hi',
            includedLanguages:
              'en,gu,mr,hi,bn,ta,te,kn,ml,pa,or,es,fr,de,ja,ru,ar,zh-CN,it,pt,ne,sa',
            layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
            autoDisplay: false,
          },
          'google_translate_element'
        );

        // If auto-enabled, apply saved language after element mounts
        setTimeout(() => {
          if (isGoogleTranslateEnabled()) {
            const savedLang = getSavedGoogleTranslateLang();
            applyGoogleTranslate(savedLang);
          }
        }, 600);
      }
    } catch (err) {
      console.warn('Google Translate initialization notice:', err);
    }
  };

  if (!scriptInjected) {
    const existingScript = document.getElementById('google-translate-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
      scriptInjected = true;
    }
  }
}

/**
 * Programmatically triggers Google Translate to translate the whole page to targetLang
 */
export function applyGoogleTranslate(targetLang: string): void {
  if (typeof window === 'undefined') return;

  const gtLang = targetLang.toLowerCase().slice(0, 5);

  // Set cookies for Google Translate (/auto/lang and /hi/lang)
  const host = window.location.hostname;
  document.cookie = `googtrans=/auto/${gtLang}; path=/;`;
  document.cookie = `googtrans=/hi/${gtLang}; path=/;`;
  if (host && host !== 'localhost') {
    document.cookie = `googtrans=/auto/${gtLang}; path=/; domain=${host};`;
    document.cookie = `googtrans=/hi/${gtLang}; path=/; domain=${host};`;
  }

  setSavedGoogleTranslateLang(gtLang);

  // Trigger combo box if already in DOM
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (select) {
    select.value = gtLang;
    select.dispatchEvent(new Event('change'));
  }
}

/**
 * Resets Google Translate back to original
 */
export function clearGoogleTranslate(): void {
  if (typeof window === 'undefined') return;

  const host = window.location.hostname;
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  if (host && host !== 'localhost') {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
  }

  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (select) {
    select.value = '';
    select.dispatchEvent(new Event('change'));
  }
}
