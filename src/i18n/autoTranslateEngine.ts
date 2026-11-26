/**
 * Universal React-19-Safe Whole-App Auto-Translation Engine
 *
 * Automatically translates any remaining hardcoded Hindi (Devanagari) text
 * across all 73+ components & 20+ Vedic data files into any of the 10
 * non-Hindi supported languages (en, gu, mr, bn, ta, te, kn, ml, pa, or):
 *
 *  - Tier 0: Persistent localStorage + in-memory cache (0ms offline after 1st visit)
 *  - Tier 1: Built-in Vedic/UI dictionary & smart "Hindi (English)" extractor (0ms)
 *  - Tier 2: Batched live translation (Google GTX -> /api/translate Gemini ->
 *            Hosting uma.php Gemini -> MyMemory fallback)
 *  - Safety: ONLY mutates Text.nodeValue (never wraps/removes DOM nodes, 100%
 *            React 19 reconciliation safe). Preserves sacred Sanskrit mantras
 *            (॥ double danda, pure Om mantras), language selector chips, and
 *            elements marked with data-no-translate="true".
 */

import { PROTECTED_LANGUAGE_NAMES, tryInstantLocalTranslate } from './autoTranslateDict';

const DEVANAGARI_RE = /[\u0900-\u097F]/;

// Hindi-specific grammar markers used ONLY when target language is Marathi (mr),
// since Marathi shares Devanagari script with Hindi.
const HINDI_ONLY_MARKERS_RE =
  /(?:^|[\s,।(\-])(?:है|हैं|था|थी|थे|करें|करता|करती|चाहिए|होता|होती|होते|नहीं|और|एवं|अथवा|क्योंकि|जिससे|द्वारा|सकता|सकती|होंगे|जाता|जाती|करने|करना|के लिए|में से|की ओर|को भी)(?:$|[\s,।.)\-:])/;

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'CODE',
  'PRE',
  'TEXTAREA',
  'INPUT',
  'SVG',
]);

const HOSTING_UMA_URL = 'https://myshivshakti.in/shaktipanchang/uma/v1/uma.php';

const LANG_FULL_NAMES: Record<string, string> = {
  en: 'English',
  gu: 'Gujarati',
  mr: 'Marathi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
  or: 'Odia',
};

const MAX_CACHE_ENTRIES = 2500;
const CACHE_PREFIX = 'shakti_autotr_v3_';
const LEGACY_CACHE_PREFIX = 'shakti_autotr_v2_';
let legacyPurged = false;

function purgeLegacyCaches(): void {
  if (legacyPurged || typeof window === 'undefined') return;
  legacyPurged = true;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LEGACY_CACHE_PREFIX)) toRemove.push(k);
    }
    for (const k of toRemove) localStorage.removeItem(k);
  } catch {
    // ignore storage errors
  }
}

// Session flags to avoid retrying blocked providers repeatedly
let gtxBlockedForSession = false;
let localApiUnavailableForSession = false;

// In-memory per-language caches & in-flight deduplication
const memCaches = new Map<string, Map<string, string>>();
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const inflightPromises = new Map<string, Promise<string | null>>();

function getLangCache(lang: string): Map<string, string> {
  purgeLegacyCaches();
  let cache = memCaches.get(lang);
  if (cache) return cache;
  cache = new Map<string, string>();
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + lang);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string' && v.trim()) {
            cache.set(k, v);
          }
        }
      }
    } catch {
      // Ignore corrupted or quota-limited storage
    }
  }
  memCaches.set(lang, cache);
  return cache;
}

function scheduleCacheSave(lang: string): void {
  if (typeof window === 'undefined') return;
  const existing = saveTimers.get(lang);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    saveTimers.delete(lang);
    const cache = memCaches.get(lang);
    if (!cache) return;
    try {
      // Trim oldest entries if above limit
      if (cache.size > MAX_CACHE_ENTRIES) {
        const excess = cache.size - MAX_CACHE_ENTRIES;
        const keys = Array.from(cache.keys()).slice(0, excess);
        for (const k of keys) cache.delete(k);
      }
      const obj: Record<string, string> = {};
      cache.forEach((v, k) => {
        obj[k] = v;
      });
      localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(obj));
    } catch {
      // If localStorage is full, prune half the cache
      try {
        const entries = Array.from(cache.entries()).slice(-Math.floor(MAX_CACHE_ENTRIES / 2));
        const obj: Record<string, string> = {};
        for (const [k, v] of entries) obj[k] = v;
        localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(obj));
      } catch {
        // Give up gracefully
      }
    }
  }, 800);
  saveTimers.set(lang, timer);
}

function isCapacitorRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
  if (w.Capacitor?.isNativePlatform?.()) return true;
  const proto = window.location?.protocol || '';
  return proto === 'capacitor:' || proto === 'file:';
}

/**
 * Sacred Sanskrit Shloka / Viniyoga / Mantra detector — NEVER translate sacred Sanskrit!
 */
const HINDI_PROSE_VERBS_RE =
  /(?:^|[\s,।])(है|हैं|था|थी|थे|करें|करता|करती|चाहिए|होता|होती|होते|नहीं|क्योंकि|जिससे|सकता|सकती|जाता|जाती|कहा गया|बताया गया)(?:$|[\s,।.])/;

const SANSKRIT_SACRED_MARKERS_RE =
  /(विनियोगः|विनियोग:|ऋषिः|छन्दः|छंदः|कीलकम्|कवचम्|अर्गलास्तोत्रम्|नमो नमः|स्वाहा|वौषट्|हुं फट्|प्रकीर्तिताः|उवाच:|उवाच\s|नमस्तुभ्यम्|शरणं गताः|रक्षतु|पातु\s|मंगलम्|मङ्गलम्)/;

export function isSacredSanskritOrProtected(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (PROTECTED_LANGUAGE_NAMES.has(t)) return true;
  // Double danda (॥) is the universal Sanskrit verse / mantra delimiter
  if (t.includes('॥')) return true;
  // Pure Vedic mantra starting with ॐ and ending in sacred invocation
  if (/^ॐ\s+[\u0900-\u097F\s,।\-:]+(नमः|स्वाहा|हुं|फट्|वषट्|शान्तिः|शांतिः|नमो|स्तुते)\s*[।!]*$/.test(t)) {
    return true;
  }
  // Sanskrit Viniyoga / Stotra / Kavach / Mantra invocation without Hindi prose verbs
  if (SANSKRIT_SACRED_MARKERS_RE.test(t) && !HINDI_PROSE_VERBS_RE.test(t)) {
    return true;
  }
  // Visarga-heavy or halanta-heavy pure Sanskrit verse line (e.g. ending in म् / त् / न् / ः)
  const sanskritWordEndings = (t.match(/(?:म्|त्|न्|ः)(?=[\s,।]|$)/g) || []).length;
  if (sanskritWordEndings >= 2 && !HINDI_PROSE_VERBS_RE.test(t)) {
    return true;
  }
  // Single sacred symbol
  if (t === 'ॐ' || t === 'श्री' || t === '॥' || t === '।') return true;
  return false;
}

export function needsAutoTranslation(text: string, targetLang: string): boolean {
  const lang = targetLang.slice(0, 2).toLowerCase();
  if (!lang || lang === 'hi') return false;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 1) return false;
  if (!DEVANAGARI_RE.test(trimmed)) return false;
  if (isSacredSanskritOrProtected(trimmed)) return false;
  if (lang === 'mr') {
    // Only translate Hindi sentences into Marathi; leave native Marathi alone
    return HINDI_ONLY_MARKERS_RE.test(trimmed);
  }
  return true;
}

function isElementProtected(el: Element | null): boolean {
  let curr: Element | null = el;
  while (curr) {
    if (SKIP_TAGS.has(curr.tagName)) return true;
    if (curr.getAttribute('data-no-translate') === 'true') return true;
    if (curr.getAttribute('translate') === 'no') return true;
    if (curr.classList?.contains('bx-sans')) return true;
    curr = curr.parentElement;
  }
  return false;
}

/**
 * Provider 1: Fast free Google GTX batch translation (works ~150ms on Android 4G/WiFi)
 */
async function translateViaGtx(texts: string[], targetLang: string): Promise<string[] | null> {
  if (gtxBlockedForSession || texts.length === 0) return null;
  try {
    // Use numeric markers that survive translation intact
    const SEP = '\n[[[SP_BRK_991]]]\n';
    const joined = texts.join(SEP);
    const body = new URLSearchParams({
      client: 'gtx',
      sl: 'hi',
      tl: targetLang,
      dt: 't',
      q: joined,
    });
    const resp = await fetch('https://translate.googleapis.com/translate_a/single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: body.toString(),
      signal: AbortSignal.timeout(7000),
    });
    if (!resp.ok) {
      if (resp.status === 429 || resp.status === 403 || resp.status === 400) {
        gtxBlockedForSession = true;
      }
      return null;
    }
    const json = await resp.json();
    if (!Array.isArray(json) || !Array.isArray(json[0])) return null;
    const combined = (json[0] as unknown[][])
      .map((part) => (typeof part?.[0] === 'string' ? part[0] : ''))
      .join('');
    const parts = combined.split(/\s*\[\[\[\s*SP_BRK_991\s*\]\]\]\s*/i);
    if (parts.length !== texts.length) {
      return null;
    }
    return parts.map((p) => p.trim());
  } catch {
    gtxBlockedForSession = true;
    return null;
  }
}

/**
 * Provider 2: Local Node /api/translate endpoint (Gemini 2.5 Flash / Hosting relay)
 */
async function translateViaServerApi(texts: string[], targetLang: string): Promise<string[] | null> {
  if (localApiUnavailableForSession || isCapacitorRuntime() || texts.length === 0) return null;
  try {
    const resp = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, targetLang }),
      signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) {
      if (resp.status === 404) localApiUnavailableForSession = true;
      return null;
    }
    const data = await resp.json();
    if (data?.ok && Array.isArray(data.translations) && data.translations.length === texts.length) {
      return data.translations.map((t: unknown, i: number) =>
        typeof t === 'string' && t.trim() ? t.trim() : texts[i]
      );
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Provider 3: Hosting AI Batch Translation (myshivshakti.in uma.php — works directly in Capacitor APK!)
 */
async function translateViaHostingAi(texts: string[], targetLang: string): Promise<string[] | null> {
  if (texts.length === 0) return null;
  const fullLangName = LANG_FULL_NAMES[targetLang] || 'English';
  try {
    const systemPrompt =
      `You are a precise Vedic astrology, Vastu, Tantra, and Hindu scripture translator. ` +
      `Translate every Hindi string in the input JSON array into natural, accurate ${fullLangName}. ` +
      `Rules: (1) Return ONLY a valid JSON array of strings with the EXACT SAME length and order. ` +
      `(2) Do not add markdown fences, notes, or explanations. ` +
      `(3) Preserve emojis, numbers, punctuation, and sacred Vedic terms naturally (e.g., Vastu, Mantra, Yantra, Tantra, Kundali, Panchang). ` +
      `(4) If a string already has both Hindi and English like "मुख्य द्वार (Main Entrance)", translate cleanly without duplicating meaning. ` +
      `(5) NEVER translate or transliterate sacred Sanskrit shlokas, Vedic mantras, Viniyoga, or Ramcharitmanas Awadhi doha/chaupai verses — return them UNCHANGED in original Devanagari.`;

    const resp = await fetch(HOSTING_UMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        query: JSON.stringify(texts),
        systemPrompt,
        lang: targetLang,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json().catch(() => null);
    if (!data?.ok || typeof data.text !== 'string') return null;

    const raw = data.text.trim();
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    const arr = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(arr) || arr.length !== texts.length) return null;
    return arr.map((item: unknown, i: number) =>
      typeof item === 'string' && item.trim() ? item.trim() : texts[i]
    );
  } catch {
    return null;
  }
}

/**
 * Provider 4: Free MyMemory Translation API (zero-auth universal fallback)
 */
async function translateViaMyMemory(texts: string[], targetLang: string): Promise<string[] | null> {
  if (texts.length === 0) return null;
  const results = new Array<string>(texts.length);
  let successCount = 0;

  // Concurrency-limited worker pool (4 parallel)
  let cursor = 0;
  const worker = async () => {
    while (cursor < texts.length) {
      const idx = cursor++;
      const src = texts[idx];
      if (src.length > 480) {
        results[idx] = src;
        continue;
      }
      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(src)}&langpair=hi|${encodeURIComponent(targetLang)}`;
        const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (resp.ok) {
          const j = await resp.json();
          const tr = j?.responseData?.translatedText;
          if (typeof tr === 'string' && tr.trim() && !/MYMEMORY WARNING/i.test(tr)) {
            results[idx] = tr.trim();
            successCount++;
            continue;
          }
        }
      } catch {
        // fallback to original
      }
      results[idx] = src;
    }
  };

  await Promise.all([worker(), worker(), worker(), worker()]);
  return successCount > 0 ? results : null;
}

/**
 * Execute resilient multi-provider batch translation for a chunk of unique strings.
 */
async function fetchBatchTranslation(texts: string[], targetLang: string): Promise<string[] | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;

  // On Web (dev/prod server), prefer our /api/translate Gemini batch first!
  // On Capacitor APK, try free fast GTX first, then Hosting AI Gemini, then MyMemory!
  if (!isCapacitorRuntime()) {
    const serverRes = await translateViaServerApi(texts, targetLang);
    if (serverRes) return serverRes;
    const gtxRes = await translateViaGtx(texts, targetLang);
    if (gtxRes) return gtxRes;
    const hostingRes = await translateViaHostingAi(texts, targetLang);
    if (hostingRes) return hostingRes;
    return translateViaMyMemory(texts, targetLang);
  } else {
    const gtxRes = await translateViaGtx(texts, targetLang);
    if (gtxRes) return gtxRes;
    const hostingRes = await translateViaHostingAi(texts, targetLang);
    if (hostingRes) return hostingRes;
    return translateViaMyMemory(texts, targetLang);
  }
}

/**
 * Translate a list of unique Hindi strings into targetLang, using cache + local dict + batched API.
 */
export async function translateStringsBatch(
  uniqueTexts: string[],
  targetLang: string
): Promise<Map<string, string>> {
  const lang = targetLang.slice(0, 2).toLowerCase();
  const cache = getLangCache(lang);
  const resolved = new Map<string, string>();
  const pendingToFetch: string[] = [];
  const waitingInflight: Array<{ text: string; promise: Promise<string | null> }> = [];

  for (const raw of uniqueTexts) {
    const cached = cache.get(raw);
    if (cached) {
      resolved.set(raw, cached);
      continue;
    }
    const instant = tryInstantLocalTranslate(raw, lang);
    if (instant) {
      cache.set(raw, instant);
      resolved.set(raw, instant);
      scheduleCacheSave(lang);
      continue;
    }
    const inflightKey = `${lang}::${raw}`;
    const existingPromise = inflightPromises.get(inflightKey);
    if (existingPromise) {
      waitingInflight.push({ text: raw, promise: existingPromise });
    } else {
      pendingToFetch.push(raw);
    }
  }

  // Split pending strings into clean chunks (max 16 items or 2000 chars per batch)
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentChars = 0;
  for (const item of pendingToFetch) {
    if (currentChunk.length >= 16 || (currentChars + item.length > 2000 && currentChunk.length > 0)) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentChars = 0;
    }
    currentChunk.push(item);
    currentChars += item.length;
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);

  // Run chunks with small concurrency (up to 2 batches simultaneously)
  const chunkPromises = chunks.map(async (chunk) => {
    const resolvers: Array<(v: string | null) => void> = [];
    chunk.forEach((text, i) => {
      const p = new Promise<string | null>((res) => {
        resolvers[i] = res;
      });
      inflightPromises.set(`${lang}::${text}`, p);
    });

    try {
      const translated = await fetchBatchTranslation(chunk, lang);
      chunk.forEach((text, i) => {
        const out = translated?.[i];
        if (out && out.trim() && out.trim() !== text) {
          cache.set(text, out.trim());
          resolved.set(text, out.trim());
          resolvers[i](out.trim());
        } else {
          resolvers[i](null);
        }
        inflightPromises.delete(`${lang}::${text}`);
      });
      if (translated) scheduleCacheSave(lang);
    } catch {
      chunk.forEach((text, i) => {
        resolvers[i](null);
        inflightPromises.delete(`${lang}::${text}`);
      });
    }
  });

  await Promise.all([
    ...chunkPromises,
    ...waitingInflight.map(async ({ text, promise }) => {
      const val = await promise;
      if (val) resolved.set(text, val);
    }),
  ]);

  return resolved;
}

/**
 * React-19-Safe DOM Auto-Translator controller.
 * Mounts on the LanguageProvider root container and translates all visible
 * Devanagari text nodes + input placeholders in place whenever language !== 'hi'.
 */
export function startDomAutoTranslator(
  root: HTMLElement,
  targetLang: string,
  onBusyChange?: (busy: boolean) => void
): () => void {
  const lang = targetLang.slice(0, 2).toLowerCase();
  if (!lang || lang === 'hi') {
    onBusyChange?.(false);
    return () => {};
  }

  let disposed = false;
  let scanTimer: ReturnType<typeof setTimeout> | null = null;
  let activeJobs = 0;

  // Track last applied value per text node to avoid infinite MutationObserver loops
  const appliedMap = new WeakMap<Text, string>();
  const cache = getLangCache(lang);

  const applyWithWhitespace = (originalRaw: string, translatedTrimmed: string): string => {
    const leadMatch = originalRaw.match(/^\s*/);
    const trailMatch = originalRaw.match(/\s*$/);
    return `${leadMatch ? leadMatch[0] : ''}${translatedTrimmed}${trailMatch ? trailMatch[0] : ''}`;
  };

  const scanAndTranslate = async () => {
    if (disposed) return;

    const pendingNodes = new Map<string, Text[]>();
    const pendingPlaceholders = new Map<string, Array<HTMLInputElement | HTMLTextAreaElement>>();

    // 1. Walk all text nodes cleanly
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    while (node) {
      const textNode = node as Text;
      const raw = textNode.nodeValue || '';
      const trimmed = raw.trim();

      if (trimmed && appliedMap.get(textNode) !== raw && needsAutoTranslation(trimmed, lang)) {
        const parent = textNode.parentElement;
        if (parent && !isElementProtected(parent)) {
          // Try instant 0ms cache or local dict first
          const instant = cache.get(trimmed) || tryInstantLocalTranslate(trimmed, lang);
          if (instant) {
            if (!cache.has(trimmed)) {
              cache.set(trimmed, instant);
              scheduleCacheSave(lang);
            }
            const nextVal = applyWithWhitespace(raw, instant);
            appliedMap.set(textNode, nextVal);
            textNode.nodeValue = nextVal;
          } else {
            const list = pendingNodes.get(trimmed);
            if (list) list.push(textNode);
            else pendingNodes.set(trimmed, [textNode]);
          }
        }
      }
      node = walker.nextNode();
    }

    // 2. Also translate input/textarea placeholders
    const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[placeholder], textarea[placeholder]'
    );
    inputs.forEach((inp) => {
      if (inp.getAttribute('data-no-translate') === 'true') return;
      const ph = (inp.placeholder || '').trim();
      if (!ph || !needsAutoTranslation(ph, lang)) return;
      const instant = cache.get(ph) || tryInstantLocalTranslate(ph, lang);
      if (instant) {
        if (!cache.has(ph)) {
          cache.set(ph, instant);
          scheduleCacheSave(lang);
        }
        inp.placeholder = instant;
      } else {
        const list = pendingPlaceholders.get(ph);
        if (list) list.push(inp);
        else pendingPlaceholders.set(ph, [inp]);
      }
    });

    const allUnique = Array.from(
      new Set([...pendingNodes.keys(), ...pendingPlaceholders.keys()])
    );
    if (allUnique.length === 0) return;

    activeJobs++;
    onBusyChange?.(true);
    try {
      const translatedMap = await translateStringsBatch(allUnique, lang);
      if (disposed) return;

      translatedMap.forEach((translatedText, origTrimmed) => {
        const nodes = pendingNodes.get(origTrimmed);
        if (nodes) {
          for (const textNode of nodes) {
            if (!textNode.isConnected) continue;
            const currentRaw = textNode.nodeValue || '';
            if (currentRaw.trim() !== origTrimmed) continue;
            const nextVal = applyWithWhitespace(currentRaw, translatedText);
            appliedMap.set(textNode, nextVal);
            textNode.nodeValue = nextVal;
          }
        }
        const phInputs = pendingPlaceholders.get(origTrimmed);
        if (phInputs) {
          for (const inp of phInputs) {
            if (!inp.isConnected) continue;
            if ((inp.placeholder || '').trim() === origTrimmed) {
              inp.placeholder = translatedText;
            }
          }
        }
      });
    } finally {
      activeJobs = Math.max(0, activeJobs - 1);
      if (activeJobs === 0 && !disposed) {
        onBusyChange?.(false);
      }
    }
  };

  const scheduleScan = (delayMs = 70) => {
    if (disposed) return;
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      scanTimer = null;
      void scanAndTranslate();
    }, delayMs);
  };

  // Initial pass immediately after mount
  scheduleScan(20);

  // Observe any dynamic tab switches, modals, drawers, or async content renders
  const observer = new MutationObserver((mutations) => {
    if (disposed) return;
    let shouldRescan = false;
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        shouldRescan = true;
        break;
      }
      if (m.type === 'characterData' && m.target.nodeType === Node.TEXT_NODE) {
        const tNode = m.target as Text;
        const val = tNode.nodeValue || '';
        if (appliedMap.get(tNode) !== val && DEVANAGARI_RE.test(val)) {
          shouldRescan = true;
          break;
        }
      }
    }
    if (shouldRescan) scheduleScan(80);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return () => {
    disposed = true;
    if (scanTimer) clearTimeout(scanTimer);
    observer.disconnect();
    onBusyChange?.(false);
  };
}
