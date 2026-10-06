import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";

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

type NativeLicense = {
  entitled?: boolean;
  playOwned?: boolean;
  kind?: string;
  daysRemaining?: number;
  expiresAt?: number;
  issuedAt?: number;
  tampered?: boolean;
  reason?: string;
};

const PlayLicense = registerPlugin<{
  status: () => Promise<NativeLicense>;
  purchase: () => Promise<NativeLicense>;
}>("PlayLicense");

let nativeStatus: LicenseStatus | null = null;

function mapNative(raw: NativeLicense): LicenseStatus {
  const kind = raw.kind === "annual" || raw.kind === "trial" || raw.kind === "lifetime" ? raw.kind : "none";
  return {
    ok: true,
    entitled: !!raw.entitled,
    kind,
    daysRemaining: Number(raw.daysRemaining) || 0,
    expiresAt: new Date(Number(raw.expiresAt) || Date.now()).toISOString(),
    issuedAt: new Date(Number(raw.issuedAt) || Date.now()).toISOString(),
    token: raw.playOwned ? "play-annual" : "trial-device",
    planName: raw.playOwned ? "श्री शक्ति पंचांग वार्षिक सदस्यता" : "श्री शक्ति पंचांग ७-दिवसीय निःशुल्क परीक्षण",
    amount: 99,
    reason: raw.reason || undefined,
    isTampered: !!raw.tampered,
  };
}

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
 * Master keys and UPI references no longer unlock the app.
 * Payment is only through Google Play.
 */
const VIP_MASTER_KEYS = new Set<string>([]);

function readTrialStart(now: number): number {
  const key = "sp_trial_start_v20";
  let start = 0;
  try {
    start = Number(localStorage.getItem(key) || "0");
  } catch {
    start = 0;
  }
  try {
    if (typeof document !== "undefined" && document.cookie) {
      const match = document.cookie.match(/_sp_t20=([0-9]+)/);
      const saved = match ? Number(match[1]) : 0;
      if (saved > 1000000000000 && (start === 0 || saved < start)) start = saved;
    }
  } catch {
    /* ignore */
  }
  try {
    const sess = Number(sessionStorage.getItem(key) || "0");
    if (sess > 1000000000000 && (start === 0 || sess < start)) start = sess;
  } catch {
    /* ignore */
  }
  if (!(start > 1000000000000 && start <= now + 60000)) start = now;
  const str = String(start);
  try {
    localStorage.setItem(key, str);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(key, str);
  } catch {
    /* ignore */
  }
  try {
    if (typeof document !== "undefined") {
      const expires = new Date(now + 365 * 86400000).toUTCString();
      document.cookie = `_sp_t20=${str}; expires=${expires}; path=/; SameSite=Lax`;
    }
  } catch {
    /* ignore */
  }
  return start;
}

/**
 * Compute current tamper-resistant trial / subscription status
 */
export function getLicenseStatus(): LicenseStatus {
  if (nativeStatus) return nativeStatus;
  const now = Date.now();
  const start = readTrialStart(now);
  const trialEnd = start + TRIAL_DURATION_MS;
  const entitled = now < trialEnd;
  const daysRemaining = entitled ? Math.max(1, Math.ceil((trialEnd - now) / 86400000)) : 0;

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
    reason: entitled
      ? undefined
      : "७ दिन का परीक्षण समाप्त। ₹99 की सदस्यता Google Play से लें।",
    isTampered: false,
  };
}

/**
 * Trial is the whole app for 7 days. After that nothing opens until ₹99 is paid.
 */
export function isFeaturePermitted(status: LicenseStatus, _tabId?: string, _panchangSubPage?: string): boolean {
  return status.entitled;
}

type LicenseContextValue = {
  status: LicenseStatus;
  loading: boolean;
  refresh: () => Promise<LicenseStatus>;
  assertEntitled: () => Promise<LicenseStatus>;
  activateAnnual: (activationCodeOrRef?: string) => Promise<LicenseStatus>;
  isAllowed: (tabId: string, panchangSubPage?: string) => boolean;
};

const LicenseContext = createContext<LicenseContextValue | null>(null);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LicenseStatus>(getLicenseStatus);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        nativeStatus = mapNative(await PlayLicense.status());
      } catch {
        nativeStatus = null;
      }
    }
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
    async (_codeOrRef?: string) => {
      if (!Capacitor.isNativePlatform()) {
        throw new Error("₹99 की सदस्यता Google Play से ली जाती है। Play Store वाला ऐप खोलें।");
      }
      nativeStatus = mapNative(await PlayLicense.purchase());
      const next = getLicenseStatus();
      setStatus(next);
      return next;
    },
    []
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
