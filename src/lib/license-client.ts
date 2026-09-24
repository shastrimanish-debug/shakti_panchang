import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type LicenseKind = "trial" | "annual" | "lifetime";

export type LicenseStatus = {
  ok: boolean;
  entitled: boolean; // True if trial is active OR subscribed
  kind: LicenseKind | "none";
  daysRemaining: number;
  expiresAt: string;
  issuedAt: string;
  token: string;
  planName: string;
  amount: number;
  reason?: string;
  isTampered?: boolean;
};

// Obfuscated storage keys for anti-tamper protection
const STORAGE_KEYS = {
  START: "sp_trial_start_v1",
  START_ANCHOR: "_sp_anchor_time_v1",
  ANNUAL: "sp_annual_until_v1",
  ANNUAL_TOKEN: "sp_annual_token_v1",
  SIGNATURE: "sp_sec_hash_v1",
  LAST_SEEN: "sp_last_active_v1",
  TAMPER_FLAG: "sp_tamper_detected_v1",
};

const SECRET_SALT = "ShaktiPanchang@VedicAstrology2026!ManishShastri";
const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Full Days (168 Hours)

/**
 * Deterministic fast cryptographic hash for anti-tampering
 */
function computeSignature(start: number, annualUntil: number, salt: string): string {
  const payload = `${start}:${annualUntil}:${salt}`;
  let hash1 = 0x811c9dc5;
  let hash2 = 0x27d4eb2f;

  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    hash1 ^= ch;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 ^= ch;
    hash2 = Math.imul(hash2, 0x5bd1e995);
  }

  const hex1 = (hash1 >>> 0).toString(16).padStart(8, "0");
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  return `SP-SEC-${hex1}${hex2}`.toUpperCase();
}

/**
 * Multi-layer storage retrieval to prevent localStorage wipe cheating
 */
function getEarliestAnchorTime(now: number): number {
  let earliest = 0;

  // 1. localStorage primary
  try {
    const val = Number(localStorage.getItem(STORAGE_KEYS.START) || "0");
    if (val > 1000000000000 && val <= now + 60000) {
      earliest = val;
    }
  } catch {
    /* ignore */
  }

  // 2. localStorage backup anchor
  try {
    const backup = Number(localStorage.getItem(STORAGE_KEYS.START_ANCHOR) || "0");
    if (backup > 1000000000000 && backup <= now + 60000) {
      if (earliest === 0 || backup < earliest) {
        earliest = backup;
      }
    }
  } catch {
    /* ignore */
  }

  // 3. sessionStorage anchor
  try {
    const sess = Number(sessionStorage.getItem(STORAGE_KEYS.START_ANCHOR) || "0");
    if (sess > 1000000000000 && sess <= now + 60000) {
      if (earliest === 0 || sess < earliest) {
        earliest = sess;
      }
    }
  } catch {
    /* ignore */
  }

  // 4. Document cookie anchor
  try {
    if (typeof document !== "undefined" && document.cookie) {
      const match = document.cookie.match(/_sp_anch=([0-9]+)/);
      if (match && match[1]) {
        const cVal = Number(match[1]);
        if (cVal > 1000000000000 && cVal <= now + 60000) {
          if (earliest === 0 || cVal < earliest) {
            earliest = cVal;
          }
        }
      }
    }
  } catch {
    /* ignore */
  }

  return earliest;
}

/**
 * Persist anchor time across all redundant browser locations
 */
function persistAnchorTime(start: number) {
  const str = String(start);
  try {
    localStorage.setItem(STORAGE_KEYS.START, str);
    localStorage.setItem(STORAGE_KEYS.START_ANCHOR, str);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(STORAGE_KEYS.START_ANCHOR, str);
  } catch {
    /* ignore */
  }
  try {
    if (typeof document !== "undefined") {
      const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `_sp_anch=${str}; expires=${expires}; path=/; SameSite=Lax`;
    }
  } catch {
    /* ignore */
  }
}

/**
 * Master VIP Activation Keys for Shastri Manish & Authorized Pandits
 */
const VIP_MASTER_KEYS = new Set([
  "SHASTRI-VIP-2026",
  "SHASTRI-VIP-2027",
  "VEDIC-SHAKTI-VIP",
  "MANISH-SHASTRI-PRO",
  "SHAKTI-VIP-LIFETIME",
  "SHASTRI.MANISH@GMAIL.COM",
]);

/**
 * Compute current tamper-resistant trial / subscription status
 */
export function getLicenseStatus(): LicenseStatus {
  const now = Date.now();

  // Check permanent tamper flag
  let isTampered = false;
  try {
    if (localStorage.getItem(STORAGE_KEYS.TAMPER_FLAG) === "true") {
      isTampered = true;
    }
  } catch {
    /* ignore */
  }

  // Anti-Clock Rollback Guard (Detect if user moved device clock backwards by > 5 mins)
  try {
    const lastActive = Number(localStorage.getItem(STORAGE_KEYS.LAST_SEEN) || "0");
    if (lastActive > 0 && now < lastActive - 300000) {
      // Clock was rolled backwards to cheat the 7-day trial!
      isTampered = true;
      localStorage.setItem(STORAGE_KEYS.TAMPER_FLAG, "true");
    } else {
      localStorage.setItem(STORAGE_KEYS.LAST_SEEN, String(now));
    }
  } catch {
    /* ignore */
  }

  // Retrieve or initialize start time
  let start = getEarliestAnchorTime(now);
  if (!start) {
    start = now;
    persistAnchorTime(start);
  } else {
    // Sync across stores in case one was cleared
    persistAnchorTime(start);
  }

  // Retrieve active annual or lifetime subscription
  let annualUntil = 0;
  let annualToken = "";
  try {
    annualUntil = Number(localStorage.getItem(STORAGE_KEYS.ANNUAL) || "0");
    annualToken = localStorage.getItem(STORAGE_KEYS.ANNUAL_TOKEN) || "";
  } catch {
    annualUntil = 0;
    annualToken = "";
  }

  // Verify anti-tamper signature if annual license exists
  if (annualUntil > 0) {
    let storedSig = "";
    try {
      storedSig = localStorage.getItem(STORAGE_KEYS.SIGNATURE) || "";
    } catch {
      /* ignore */
    }
    const expectedSig = computeSignature(start, annualUntil, SECRET_SALT);
    if (!storedSig || storedSig !== expectedSig) {
      // Tampering with localStorage annual key detected!
      isTampered = true;
      annualUntil = 0;
    }
  }

  // Check if active Annual / Lifetime license is present
  if (annualUntil > now && !isTampered) {
    const days = Math.max(0, Math.ceil((annualUntil - now) / 86400000));
    const isLifetime = annualUntil > now + 500 * 86400000;
    return {
      ok: true,
      entitled: true,
      kind: isLifetime ? "lifetime" : "annual",
      daysRemaining: days,
      expiresAt: new Date(annualUntil).toISOString(),
      issuedAt: new Date(start).toISOString(),
      token: annualToken || `auth-sp-${annualUntil}`,
      planName: isLifetime ? "श्री शक्ति पंचांग आजीवन सदस्यता (VIP)" : "श्री शक्ति पंचांग वार्षिक सदस्यता",
      amount: 99,
      isTampered: false,
    };
  }

  // Check 7-Day Trial Status
  const trialEnd = start + TRIAL_DURATION_MS;
  const daysRemaining = Math.max(0, Math.ceil((trialEnd - now) / 86400000));
  const entitled = !isTampered && now < trialEnd;

  return {
    ok: true,
    entitled,
    kind: entitled ? "trial" : "none",
    daysRemaining,
    expiresAt: new Date(trialEnd).toISOString(),
    issuedAt: new Date(start).toISOString(),
    token: entitled ? `trial-sp-${start}` : "expired",
    planName: "श्री शक्ति पंचांग ७-दिवसीय निःशुल्क परीक्षण",
    amount: 99,
    reason: isTampered
      ? "सुरक्षा उल्लंघन: समय परिवर्तन या छेड़छाड़ का प्रयास। केवल पंचांग मुख्य पृष्ठ उपलब्ध है।"
      : entitled
      ? undefined
      : "७-दिवसीय निःशुल्क परीक्षण समाप्त। केवल पंचांग का मुख्य पृष्ठ उपलब्ध है।",
    isTampered,
  };
}

/**
 * Check if a specific tab or subpage is permitted
 * STRICT RULE: If trial is expired, ONLY tab 'panchang' and subpage 'main' is permitted!
 */
export function isFeaturePermitted(
  status: LicenseStatus,
  tabId: string,
  panchangSubPage?: string
): boolean {
  // If subscribed or trial is active, everything is unlocked
  if (status.entitled) {
    return true;
  }

  // TRIAL EXPIRED: Only 'panchang' tab and 'main' subpage is allowed!
  if (tabId === "panchang") {
    if (!panchangSubPage || panchangSubPage === "main") {
      return true; // Panchang main page is ALWAYS free & accessible
    }
    return false; // Gochar, Hora, Muhurat, Disha are locked
  }

  // All other tabs (choghadiya, kundali, matchmaking, yatra, etc.) are strictly locked
  return false;
}

type LicenseContextValue = {
  status: LicenseStatus;
  loading: boolean;
  refresh: () => Promise<LicenseStatus>;
  assertEntitled: () => Promise<LicenseStatus>;
  activateAnnual: (activationCodeOrRef: string) => Promise<LicenseStatus>;
  isAllowed: (tabId: string, panchangSubPage?: string) => boolean;
};

const LicenseContext = createContext<LicenseContextValue | null>(null);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LicenseStatus>(getLicenseStatus);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const next = getLicenseStatus();
    setStatus(next);
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    void refresh();
    // Periodic check every 60 seconds
    const interval = setInterval(() => {
      void refresh();
    }, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const assertEntitled = useCallback(async () => {
    const next = getLicenseStatus();
    setStatus(next);
    if (!next.entitled) {
      throw Object.assign(new Error("not_entitled"), { status: next });
    }
    return next;
  }, []);

  const activateAnnual = useCallback(
    async (codeOrRef: string) => {
      const cleaned = codeOrRef.trim().toUpperCase();
      const now = Date.now();
      const start = getEarliestAnchorTime(now) || now;

      // 1. VIP Master Key Check
      if (VIP_MASTER_KEYS.has(cleaned)) {
        const until = now + 10 * 365 * 86400000; // 10 Years Lifetime VIP
        const signature = computeSignature(start, until, SECRET_SALT);
        try {
          localStorage.setItem(STORAGE_KEYS.ANNUAL, String(until));
          localStorage.setItem(STORAGE_KEYS.ANNUAL_TOKEN, `VIP-${cleaned}`);
          localStorage.setItem(STORAGE_KEYS.SIGNATURE, signature);
          localStorage.removeItem(STORAGE_KEYS.TAMPER_FLAG);
        } catch {
          /* ignore */
        }
        return refresh();
      }

      // 2. UPI 12-digit UTR or Valid Reference (8 to 24 chars)
      if (/^[A-Z0-9]{8,24}$/.test(cleaned)) {
        const until = now + 365 * 86400000; // 365 Days
        const signature = computeSignature(start, until, SECRET_SALT);
        try {
          localStorage.setItem(STORAGE_KEYS.ANNUAL, String(until));
          localStorage.setItem(STORAGE_KEYS.ANNUAL_TOKEN, `UTR-${cleaned}`);
          localStorage.setItem(STORAGE_KEYS.SIGNATURE, signature);
          localStorage.removeItem(STORAGE_KEYS.TAMPER_FLAG);
        } catch {
          /* ignore */
        }
        return refresh();
      }

      // Invalid reference
      throw new Error("अमान्य संदर्भ संख्या या लाइसेंस कोड। कृपया सही UPI UTR या VIP कोड दर्ज करें।");
    },
    [refresh]
  );

  const isAllowed = useCallback(
    (tabId: string, panchangSubPage?: string) => {
      return isFeaturePermitted(status, tabId, panchangSubPage);
    },
    [status]
  );

  const value = useMemo(
    () => ({
      status,
      loading,
      refresh,
      assertEntitled,
      activateAnnual,
      isAllowed,
    }),
    [status, loading, refresh, assertEntitled, activateAnnual, isAllowed]
  );

  return createElement(LicenseContext.Provider, { value }, children);
}

export function useLicense(): LicenseContextValue {
  const ctx = useContext(LicenseContext);
  if (!ctx) {
    const fallbackStatus = getLicenseStatus();
    return {
      status: fallbackStatus,
      loading: false,
      refresh: async () => fallbackStatus,
      assertEntitled: async () => fallbackStatus,
      activateAnnual: async () => fallbackStatus,
      isAllowed: (tabId: string, sub?: string) => isFeaturePermitted(fallbackStatus, tabId, sub),
    };
  }
  return ctx;
}

export function isPremium(status: LicenseStatus): boolean {
  return status.entitled;
}
