import { SavedLocation, KundaliData, AppReminder } from '../types';

const STORAGE_KEY_LOCATION = 'shakti_selected_location';
const STORAGE_KEY_PROFILES = 'shakti_saved_kundali_profiles_v1';
const STORAGE_KEY_REMINDERS = 'shakti_app_reminders_v1';
const STORAGE_KEY_CUSTOM_LOCS = 'shakti_panchang_user_custom_locations';

export const DEFAULT_LOCATION: SavedLocation = {
  name: 'बुरहानपुर (Burhanpur)',
  latitude: 21.3142,
  longitude: 76.2298,
  state: 'मध्य प्रदेश',
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
      return arr.map((p: any) => ({
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
