import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SavedLocation } from '../types';
import { resolveBirthCoordinates } from '../services/kundali';

export type ServerTimeSyncSource =
  | 'server-api'
  | 'http-date'
  | 'world-time-api'
  | 'cached-offset'
  | 'device-fallback';

export interface ServerTimeSyncState {
  /** Authoritative offset in milliseconds: serverUtcMs - deviceUtcMs */
  clockOffsetMs: number;
  /** Whether server time has been verified during this session */
  isSynced: boolean;
  /** Whether a time sync network request is currently in progress */
  isSyncing: boolean;
  /** Timestamp (device ms) when the last sync completed */
  lastSyncedAt: number | null;
  /** Source of the time synchronization */
  syncSource: ServerTimeSyncSource;
}

export interface LocationSyncedDateTime {
  /** 4-digit year at the target location */
  year: number;
  /** 0-indexed month (0 = Jan, 11 = Dec) at the target location */
  month: number;
  /** Day of month (1-31) at the target location */
  day: number;
  /** 24-hour clock hours (0-23) at the target location */
  hours: number;
  /** Minutes (0-59) at the target location */
  minutes: number;
  /** Seconds (0-59) at the target location */
  seconds: number;
  /** YYYY-MM-DD formatted calendar string at the target location */
  dateStr: string;
  /** HH:MM formatted 24-hour string at the target location */
  timeStr: string;
  /** Safe local-noon Date object for calendar-day calculations (new Date(year, month, day, 12, 0, 0)) */
  localNoonDate: Date;
  /** Exact server-synced UTC Date instant */
  utcInstant: Date;
  /** Effective timezone offset in hours (including DST if applicable) */
  timezoneHours: number;
  /** IANA timezone identifier if resolved */
  ianaTimeZone?: string;
}

const SESSION_OFFSET_KEY = 'shakti_server_clock_offset_ms_v1';
const SYNC_TTL_MS = 5 * 60 * 1000; // Re-validate every 5 minutes
const SKEW_THRESHOLD_MS = 60 * 1000; // 60 seconds device clock skew threshold

// Monotonic hardware clock anchor so mid-session device clock changes cannot corrupt calculations
let anchorServerEpochMs: number | null = null;
let anchorPerfNowMs: number | null = null;

function getPerfNow(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function loadCachedOffsetMs(): { offsetMs: number; hasCache: boolean } {
  if (typeof window === 'undefined') return { offsetMs: 0, hasCache: false };
  try {
    const raw = sessionStorage.getItem(SESSION_OFFSET_KEY);
    if (raw !== null) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        return { offsetMs: parsed, hasCache: true };
      }
    }
  } catch {
    // Ignore storage access errors
  }
  return { offsetMs: 0, hasCache: false };
}

function saveCachedOffsetMs(offsetMs: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_OFFSET_KEY, String(Math.round(offsetMs)));
  } catch {
    // Ignore storage access errors
  }
}

const initialCache = loadCachedOffsetMs();

let globalSyncState: ServerTimeSyncState = {
  clockOffsetMs: initialCache.offsetMs,
  isSynced: false,
  isSyncing: false,
  lastSyncedAt: null,
  syncSource: initialCache.hasCache ? 'cached-offset' : 'device-fallback',
};

let activeSyncPromise: Promise<ServerTimeSyncState> | null = null;
const listeners = new Set<(state: ServerTimeSyncState) => void>();

function notifyListeners(): void {
  for (const listener of listeners) {
    try {
      listener(globalSyncState);
    } catch {
      // Ignore subscriber errors
    }
  }
}

function applyVerifiedServerTime(serverEpochMs: number, source: ServerTimeSyncSource): ServerTimeSyncState {
  const deviceNowMs = Date.now();
  const perfNowMs = getPerfNow();
  const offsetMs = serverEpochMs - deviceNowMs;

  anchorServerEpochMs = serverEpochMs;
  anchorPerfNowMs = perfNowMs;
  saveCachedOffsetMs(offsetMs);

  globalSyncState = {
    clockOffsetMs: offsetMs,
    isSynced: true,
    isSyncing: false,
    lastSyncedAt: deviceNowMs,
    syncSource: source,
  };
  notifyListeners();
  return globalSyncState;
}

/**
 * Returns the authoritative server-synced UTC timestamp in milliseconds.
 * Uses the monotonic `performance.now()` delta from the last verified server timestamp
 * (with sleep/hibernation drift protection), falling back to `Date.now() + clockOffsetMs`.
 */
export function getSyncedTimestampMs(): number {
  const offsetEstimate = Date.now() + globalSyncState.clockOffsetMs;
  if (anchorServerEpochMs !== null && anchorPerfNowMs !== null) {
    const elapsedPerfMs = getPerfNow() - anchorPerfNowMs;
    if (elapsedPerfMs >= 0) {
      const monotonicEstimate = anchorServerEpochMs + elapsedPerfMs;
      // If device slept/suspended, performance.now() may pause on some mobile OSes;
      // if monotonic and wall-clock estimates diverge by > 2 minutes, prefer wall-clock + offset
      if (Math.abs(monotonicEstimate - offsetEstimate) < 120_000) {
        return Math.round(monotonicEstimate);
      }
    }
  }
  return Math.round(offsetEstimate);
}

/**
 * Returns a fresh `Date` instance representing the server-synced current time.
 * Safe to call from both React components and pure astrology/panchang calculation services.
 */
export function getSyncedNow(): Date {
  return new Date(getSyncedTimestampMs());
}

/**
 * Resolves the current server-synced calendar date and 24h time for any geographical location
 * (respecting IANA timezones and historical/current Daylight Saving Time).
 */
export function getSyncedLocationDateTime(
  location?: SavedLocation,
  baseUtcDate?: Date
): LocationSyncedDateTime {
  const utcInstant = baseUtcDate instanceof Date && !Number.isNaN(baseUtcDate.getTime())
    ? baseUtcDate
    : getSyncedNow();

  const resolved = resolveBirthCoordinates(
    location?.name || 'नई दिल्ली (New Delhi)',
    location?.latitude ?? 28.6139,
    location?.longitude ?? 77.2090,
    location?.timezoneHours ?? 5.5,
    utcInstant
  );

  const shifted = new Date(utcInstant.getTime() + resolved.timezoneHours * 3600000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  const hours = shifted.getUTCHours();
  const minutes = shifted.getUTCMinutes();
  const seconds = shifted.getUTCSeconds();

  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const localNoonDate = new Date(year, month, day, 12, 0, 0);

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    dateStr,
    timeStr,
    localNoonDate,
    utcInstant,
    timezoneHours: resolved.timezoneHours,
    ianaTimeZone: resolved.ianaTimeZone,
  };
}

/**
 * Performs an NTP-style HTTP time synchronization against:
 * 1. Application server `/api/time` JSON payload (or HTTP `Date` header)
 * 2. Application server `/api/health` timestamp (or HTTP `Date` header)
 * 3. Same-origin `HEAD` HTTP `Date` header
 * 4. Public UTC time authority fallback (`worldtimeapi.org` / `timeapi.io`) for standalone/APK mode
 */
export async function syncServerTime(force: boolean = false): Promise<ServerTimeSyncState> {
  if (typeof window === 'undefined') {
    return globalSyncState;
  }

  // Return cached sync state if still fresh and not forced
  if (
    !force &&
    globalSyncState.isSynced &&
    globalSyncState.lastSyncedAt !== null &&
    Date.now() - globalSyncState.lastSyncedAt < SYNC_TTL_MS
  ) {
    return globalSyncState;
  }

  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  globalSyncState = { ...globalSyncState, isSyncing: true };
  notifyListeners();

  activeSyncPromise = (async (): Promise<ServerTimeSyncState> => {
    // 1. Primary: /api/time on application server
    try {
      const t0 = getPerfNow();
      const resp = await fetch(`/api/time?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(4000),
      });
      const t1 = getPerfNow();
      const halfRttMs = Math.max(0, (t1 - t0) / 2);

      if (resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await resp.json();
          const rawMs =
            typeof data?.serverTimeMs === 'number'
              ? data.serverTimeMs
              : typeof data?.timestamp === 'string'
                ? Date.parse(data.timestamp)
                : NaN;
          if (Number.isFinite(rawMs) && rawMs > 1700000000000) {
            return applyVerifiedServerTime(rawMs + halfRttMs, 'server-api');
          }
        }
        const dateHeader = resp.headers.get('date');
        if (dateHeader) {
          const parsedHeaderMs = Date.parse(dateHeader);
          if (Number.isFinite(parsedHeaderMs) && parsedHeaderMs > 1700000000000) {
            return applyVerifiedServerTime(parsedHeaderMs + halfRttMs, 'http-date');
          }
        }
      }
    } catch {
      // Proceed to fallback
    }

    // 2. Secondary: /api/health endpoint or HTTP Date header
    try {
      const t0 = getPerfNow();
      const resp = await fetch(`/api/health?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(3500),
      });
      const t1 = getPerfNow();
      const halfRttMs = Math.max(0, (t1 - t0) / 2);

      if (resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await resp.json();
          const parsedMs = typeof data?.timestamp === 'string' ? Date.parse(data.timestamp) : NaN;
          if (Number.isFinite(parsedMs) && parsedMs > 1700000000000) {
            return applyVerifiedServerTime(parsedMs + halfRttMs, 'server-api');
          }
        }
        const dateHeader = resp.headers.get('date');
        if (dateHeader) {
          const parsedHeaderMs = Date.parse(dateHeader);
          if (Number.isFinite(parsedHeaderMs) && parsedHeaderMs > 1700000000000) {
            return applyVerifiedServerTime(parsedHeaderMs + halfRttMs, 'http-date');
          }
        }
      }
    } catch {
      // Proceed to fallback
    }

    // 3. Tertiary: Same-origin HEAD request Date header (works on CDN/static hosts)
    try {
      const t0 = getPerfNow();
      const resp = await fetch(`${window.location.origin}/?_t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(3500),
      });
      const t1 = getPerfNow();
      const halfRttMs = Math.max(0, (t1 - t0) / 2);
      const dateHeader = resp.headers.get('date');
      if (dateHeader) {
        const parsedHeaderMs = Date.parse(dateHeader);
        if (Number.isFinite(parsedHeaderMs) && parsedHeaderMs > 1700000000000) {
          return applyVerifiedServerTime(parsedHeaderMs + halfRttMs, 'http-date');
        }
      }
    } catch {
      // Proceed to public time authority fallback
    }

    // 4. Public UTC Time API fallback (useful inside standalone Capacitor Android APK)
    try {
      const t0 = getPerfNow();
      const resp = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
      });
      const t1 = getPerfNow();
      const halfRttMs = Math.max(0, (t1 - t0) / 2);
      if (resp.ok) {
        const data = await resp.json();
        const rawMs =
          typeof data?.unixtime === 'number'
            ? data.unixtime * 1000
            : typeof data?.utc_datetime === 'string'
              ? Date.parse(data.utc_datetime)
              : NaN;
        if (Number.isFinite(rawMs) && rawMs > 1700000000000) {
          return applyVerifiedServerTime(rawMs + halfRttMs, 'world-time-api');
        }
      }
    } catch {
      // Offline or unreachable; retain cached offset or device clock
    }

    globalSyncState = {
      ...globalSyncState,
      isSyncing: false,
    };
    notifyListeners();
    return globalSyncState;
  })().finally(() => {
    activeSyncPromise = null;
  });

  return activeSyncPromise;
}

export interface UseUserDateTimeOptions {
  /** Optional active location to compute timezone-accurate local date/time */
  location?: SavedLocation;
  /** Optional custom initial date */
  initialDate?: Date;
  /** Interval (in ms) to refresh the live `now` timestamp (default: 30000ms) */
  liveTickIntervalMs?: number;
  /**
   * When true (default), if the user has not manually picked a custom calendar date,
   * `selectedDate` automatically snaps to the server-synced date once synchronization completes.
   */
  autoFollowServerToday?: boolean;
}

export interface UseUserDateTimeResult {
  /** Live server-synced Date object */
  now: Date;
  /** Active calculation date for Panchang / calendar views (server-synced by default) */
  selectedDate: Date;
  /** Updates the active calculation date (marks as user-customized if changed away from today) */
  setSelectedDate: (next: Date | ((prev: Date) => Date)) => void;
  /** Resets `selectedDate` back to the authoritative server-synced current time */
  resetToToday: () => Date;
  /** Returns an immediate, up-to-the-millisecond server-synced Date */
  getSyncedNow: () => Date;
  /** Returns timezone-accurate calendar YMD and wall-clock time for a location using server-synced UTC */
  getLocationDateTime: (loc?: SavedLocation, baseDate?: Date) => LocationSyncedDateTime;
  /** Enforces server-time-sync before running a Panchang or Kundali calculation and returns the synced Date */
  ensureServerSyncedDate: (forceSync?: boolean) => Promise<Date>;
  /** Current location's live server-synced date/time breakdown */
  locationNow: LocationSyncedDateTime;
  /** True once server time has been verified */
  isSynced: boolean;
  /** True while a server time sync request is in flight */
  isSyncing: boolean;
  /** Offset in ms between true server UTC time and device clock (serverMs - deviceMs) */
  clockOffsetMs: number;
  /** Device clock drift in whole seconds */
  driftSeconds: number;
  /** True if the device system clock is off by more than 60 seconds */
  isClockSkewed: boolean;
  /** Source used to synchronize the clock */
  syncSource: ServerTimeSyncSource;
  /** Triggers an immediate server time synchronization */
  syncNow: () => Promise<Date>;
}

/**
 * `useUserDateTime` Hook
 *
 * Enforces server-time-sync when calculating Panchang or Kundali so the application
 * never relies solely on potentially inaccurate or skewed device system clocks.
 */
export function useUserDateTime(options: UseUserDateTimeOptions = {}): UseUserDateTimeResult {
  const {
    location,
    initialDate,
    liveTickIntervalMs = 30_000,
    autoFollowServerToday = true,
  } = options;

  const [syncState, setSyncState] = useState<ServerTimeSyncState>(() => globalSyncState);
  const [now, setNow] = useState<Date>(() => getSyncedNow());
  const hasUserCustomizedDateRef = useRef<boolean>(Boolean(initialDate));
  const [selectedDate, setSelectedDateInternal] = useState<Date>(() =>
    initialDate instanceof Date && !Number.isNaN(initialDate.getTime())
      ? initialDate
      : getSyncedNow()
  );

  // Subscribe to global server-time sync updates & trigger initial sync on mount
  useEffect(() => {
    const handleSyncUpdate = (nextState: ServerTimeSyncState) => {
      setSyncState(nextState);
      const freshNow = getSyncedNow();
      setNow(freshNow);

      // If the user hasn't manually navigated to a different date, ensure `selectedDate`
      // reflects the authoritative server time (especially critical if device clock was skewed)
      if (autoFollowServerToday && !hasUserCustomizedDateRef.current) {
        setSelectedDateInternal((prev) => {
          if (Math.abs(freshNow.getTime() - prev.getTime()) > 15_000) {
            return freshNow;
          }
          return prev;
        });
      }
    };

    listeners.add(handleSyncUpdate);
    void syncServerTime(false);

    const handleVisibilityOrFocus = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        void syncServerTime(false);
      }
    };

    const handleOnline = () => {
      void syncServerTime(true);
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      listeners.delete(handleSyncUpdate);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [autoFollowServerToday]);

  // Periodic live clock tick + background server re-verification
  useEffect(() => {
    if (liveTickIntervalMs <= 0) return;
    const interval = setInterval(() => {
      const synced = getSyncedNow();
      setNow(synced);

      // Keep selectedDate current if user is still on "Today" view and day rolls over
      if (autoFollowServerToday && !hasUserCustomizedDateRef.current) {
        setSelectedDateInternal((prev) => {
          if (
            prev.getFullYear() !== synced.getFullYear() ||
            prev.getMonth() !== synced.getMonth() ||
            prev.getDate() !== synced.getDate()
          ) {
            return synced;
          }
          return prev;
        });
      }

      // Periodically re-verify with server if TTL elapsed
      if (
        !globalSyncState.lastSyncedAt ||
        Date.now() - globalSyncState.lastSyncedAt >= SYNC_TTL_MS
      ) {
        void syncServerTime(false);
      }
    }, liveTickIntervalMs);

    return () => clearInterval(interval);
  }, [liveTickIntervalMs, autoFollowServerToday]);

  const setSelectedDate = useCallback((next: Date | ((prev: Date) => Date)) => {
    setSelectedDateInternal((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      if (!(resolved instanceof Date) || Number.isNaN(resolved.getTime())) {
        return getSyncedNow();
      }
      const syncedNow = getSyncedNow();
      const isSameCalendarDay =
        resolved.getFullYear() === syncedNow.getFullYear() &&
        resolved.getMonth() === syncedNow.getMonth() &&
        resolved.getDate() === syncedNow.getDate();

      hasUserCustomizedDateRef.current = !isSameCalendarDay;
      // If user clicked "Today" (same calendar day and within 5s of raw device Date.now()),
      // replace raw device `new Date()` with server-synced `syncedNow`!
      if (Math.abs(resolved.getTime() - Date.now()) < 5_000) {
        hasUserCustomizedDateRef.current = false;
        return syncedNow;
      }
      return resolved;
    });
  }, []);

  const resetToToday = useCallback((): Date => {
    hasUserCustomizedDateRef.current = false;
    const fresh = getSyncedNow();
    setNow(fresh);
    setSelectedDateInternal(fresh);
    void syncServerTime(false);
    return fresh;
  }, []);

  const syncNow = useCallback(async (): Promise<Date> => {
    await syncServerTime(true);
    const fresh = getSyncedNow();
    setNow(fresh);
    if (!hasUserCustomizedDateRef.current) {
      setSelectedDateInternal(fresh);
    }
    return fresh;
  }, []);

  const ensureServerSyncedDate = useCallback(async (forceSync: boolean = false): Promise<Date> => {
    await syncServerTime(forceSync);
    const fresh = getSyncedNow();
    setNow(fresh);
    return fresh;
  }, []);

  const getLocationDateTime = useCallback(
    (loc?: SavedLocation, baseDate?: Date): LocationSyncedDateTime => {
      return getSyncedLocationDateTime(loc || location, baseDate || getSyncedNow());
    },
    [location]
  );

  const locationNow = useMemo(
    () => getSyncedLocationDateTime(location, now),
    [location, now]
  );

  const driftSeconds = Math.round(syncState.clockOffsetMs / 1000);
  const isClockSkewed = Math.abs(syncState.clockOffsetMs) > SKEW_THRESHOLD_MS;

  return {
    now,
    selectedDate,
    setSelectedDate,
    resetToToday,
    getSyncedNow,
    getLocationDateTime,
    ensureServerSyncedDate,
    locationNow,
    isSynced: syncState.isSynced,
    isSyncing: syncState.isSyncing,
    clockOffsetMs: syncState.clockOffsetMs,
    driftSeconds,
    isClockSkewed,
    syncSource: syncState.syncSource,
    syncNow,
  };
}

export default useUserDateTime;
