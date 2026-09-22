import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type LicenseKind = "trial" | "annual";
export type LicenseStatus = {
  ok: boolean;
  entitled: boolean;
  kind: LicenseKind | "none";
  daysRemaining: number;
  expiresAt: string;
  issuedAt: string;
  token: string;
  planName: string;
  amount: number;
  reason?: string;
};

const START_KEY = "sp_trial_start_v1";
const ANNUAL_KEY = "sp_annual_until_v1";

function trialStatus(): LicenseStatus {
  const now = Date.now();
  let start = 0;
  try {
    start = Number(localStorage.getItem(START_KEY) || "0");
    if (!start) {
      start = now;
      localStorage.setItem(START_KEY, String(start));
    }
  } catch {
    start = now;
  }
  let annualUntil = 0;
  try {
    annualUntil = Number(localStorage.getItem(ANNUAL_KEY) || "0");
  } catch {
    annualUntil = 0;
  }
  if (annualUntil > now) {
    const days = Math.max(0, Math.ceil((annualUntil - now) / 86400000));
    return {
      ok: true,
      entitled: true,
      kind: "annual",
      daysRemaining: days,
      expiresAt: new Date(annualUntil).toISOString(),
      issuedAt: new Date(start).toISOString(),
      token: "local-annual",
      planName: "श्री शक्ति पंचांग वार्षिक सदस्यता",
      amount: 99,
    };
  }
  const end = start + 7 * 86400000;
  const days = Math.max(0, Math.ceil((end - now) / 86400000));
  const entitled = now < end;
  return {
    ok: true,
    entitled,
    kind: entitled ? "trial" : "none",
    daysRemaining: days,
    expiresAt: new Date(end).toISOString(),
    issuedAt: new Date(start).toISOString(),
    token: "local-trial",
    planName: "श्री शक्ति पंचांग वार्षिक सदस्यता",
    amount: 99,
  };
}

type LicenseContextValue = {
  status: LicenseStatus;
  loading: boolean;
  refresh: () => Promise<LicenseStatus>;
  assertEntitled: () => Promise<LicenseStatus>;
  activateAnnual: (paymentRef: string) => Promise<LicenseStatus>;
};

const LicenseContext = createContext<LicenseContextValue | null>(null);

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LicenseStatus>(trialStatus);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    const next = trialStatus();
    setStatus(next);
    setLoading(false);
    return next;
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const assertEntitled = useCallback(async () => {
    const next = trialStatus();
    setStatus(next);
    if (!next.entitled) throw Object.assign(new Error("not_entitled"), { status: next });
    return next;
  }, []);
  const activateAnnual = useCallback(async (_paymentRef: string) => {
    const until = Date.now() + 365 * 86400000;
    try {
      localStorage.setItem(ANNUAL_KEY, String(until));
    } catch {
      /* ignore */
    }
    return refresh();
  }, [refresh]);
  const value = useMemo(
    () => ({ status, loading, refresh, assertEntitled, activateAnnual }),
    [status, loading, refresh, assertEntitled, activateAnnual],
  );
  return createElement(LicenseContext.Provider, { value }, children);
}

export function useLicense(): LicenseContextValue {
  const ctx = useContext(LicenseContext);
  if (!ctx) {
    return {
      status: trialStatus(),
      loading: false,
      refresh: async () => trialStatus(),
      assertEntitled: async () => trialStatus(),
      activateAnnual: async () => trialStatus(),
    };
  }
  return ctx;
}

export function isPremium(status: LicenseStatus): boolean {
  return status.entitled;
}
