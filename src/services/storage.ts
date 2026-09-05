import { SavedLocation, KundaliData, AppReminder } from '../types';

const STORAGE_KEY_LOCATION = 'shakti_selected_location';
const STORAGE_KEY_PROFILES = 'shakti_saved_kundali_profiles_v1';
const STORAGE_KEY_REMINDERS = 'shakti_app_reminders_v1';
const STORAGE_KEY_CUSTOM_LOCS = 'shakti_panchang_user_custom_locations';

export const DEFAULT_LOCATION: SavedLocation = {
  name: 'नई दिल्ली (New Delhi)',
  latitude: 28.6139,
  longitude: 77.2090,
  state: 'दिल्ली',
};

export function getStoredLocation(): SavedLocation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCATION);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_LOCATION;
}

export function setStoredLocation(loc: SavedLocation): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
  } catch {}
}

export function getSavedKundaliProfiles(): KundaliData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (raw) {
      const arr = JSON.parse(raw);
      // Filter out any older profiles for Manish
      const cleanArr = arr.filter(
        (p: any) => !p.name?.includes('मनीष') && !p.name?.includes('Manish') && !p.birthPlace?.includes('बुरहानपुर')
      );
      if (cleanArr.length !== arr.length) {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(cleanArr));
      }
      return cleanArr.map((p: any) => ({
        ...p,
        birthDate: new Date(p.birthDate),
        calculatedAt: new Date(p.calculatedAt || Date.now()),
        dashaPeriods: (p.dashaPeriods || []).map((d: any) => ({
          ...d,
          startDate: new Date(d.startDate),
          endDate: new Date(d.endDate),
        })),
        antarPeriods: (p.antarPeriods || []).map((a: any) => ({
          ...a,
          startDate: new Date(a.startDate),
          endDate: new Date(a.endDate),
        })),
        pratyantarPeriods: (p.pratyantarPeriods || []).map((pr: any) => ({
          ...pr,
          startDate: new Date(pr.startDate),
          endDate: new Date(pr.endDate),
        })),
      }));
    }
  } catch {}
  return [];
}

export function saveKundaliProfile(profile: KundaliData): void {
  try {
    const existing = getSavedKundaliProfiles().filter(
      (p) => !(p.name === profile.name && p.birthTime === profile.birthTime)
    );
    existing.unshift(profile);
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(existing.slice(0, 30)));
  } catch {}
}

export function deleteSavedKundaliProfile(name: string, birthTime: string): void {
  try {
    const existing = getSavedKundaliProfiles().filter(
      (p) => !(p.name === name && p.birthTime === birthTime)
    );
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(existing));
  } catch {}
}

export function getStoredReminders(): AppReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMINDERS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveReminder(rem: AppReminder): void {
  try {
    const list = getStoredReminders();
    list.unshift(rem);
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(list.slice(0, 50)));
  } catch {}
}

export const saveAppReminder = saveReminder;

export function deleteReminder(id: string): void {
  try {
    const filtered = getStoredReminders().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(filtered));
  } catch {}
}

export function getUserCustomLocations(): SavedLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_LOCS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveUserCustomLocation(loc: SavedLocation): void {
  try {
    const existing = getUserCustomLocations().filter((l) => l.name !== loc.name);
    existing.unshift(loc);
    localStorage.setItem(STORAGE_KEY_CUSTOM_LOCS, JSON.stringify(existing.slice(0, 50)));
  } catch {}
}

// -------------------------------------------------------------
// Annual Membership & Subscription Model (₹99 / Year)
// -------------------------------------------------------------
const STORAGE_KEY_SUBSCRIPTION = 'shakti_panchang_annual_subscription_v1';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  activatedAt: string;
  expiresAt: string;
  daysRemaining: number;
  planName: string;
  amount: number;
  txnId?: string;
  paymentMethod?: string;
}

export function getSubscriptionStatus(): SubscriptionStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
    if (raw) {
      const parsed = JSON.parse(raw);
      const expires = new Date(parsed.expiresAt);
      const now = new Date();
      const diffMs = expires.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const isSubscribed = diffMs > 0;

      return {
        isSubscribed,
        activatedAt: parsed.activatedAt,
        expiresAt: parsed.expiresAt,
        daysRemaining,
        planName: parsed.planName || 'श्री शक्ति पंचांग वार्षिक सदस्यता',
        amount: parsed.amount || 99,
        txnId: parsed.txnId,
        paymentMethod: parsed.paymentMethod,
      };
    }
  } catch {}

  return {
    isSubscribed: false,
    activatedAt: '',
    expiresAt: '',
    daysRemaining: 0,
    planName: 'श्री शक्ति पंचांग वार्षिक सदस्यता',
    amount: 99,
  };
}

export function activateSubscription(
  txnId?: string,
  paymentMethod: string = 'UPI'
): SubscriptionStatus {
  const now = new Date();
  const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const status: SubscriptionStatus = {
    isSubscribed: true,
    activatedAt: now.toISOString(),
    expiresAt: oneYearLater.toISOString(),
    daysRemaining: 365,
    planName: 'श्री शक्ति पंचांग वार्षिक सदस्यता',
    amount: 99,
    txnId: txnId || `TXN${Date.now().toString().slice(-8)}`,
    paymentMethod,
  };

  try {
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(status));
  } catch {}

  return status;
}

export function cancelSubscription(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SUBSCRIPTION);
  } catch {}
}

