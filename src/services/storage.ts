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
      // Filter out any demo/default profiles like Manish, Akshita, etc.
      const cleanArr = arr.filter(
        (p: any) => 
          !p.name?.includes('मनीष') && 
          !p.name?.includes('Manish') && 
          !p.name?.includes('अक्षिता') && 
          !p.name?.includes('Akshita') && 
          !p.birthPlace?.includes('बुरहानपुर')
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
  paymentMethod: string = 'Play'
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

const STORAGE_KEY_THEME = 'shakti_app_theme_mode';

export type AppTheme =
  | 'kesariya'
  | 'chandan'
  | 'peetambari'
  | 'gangajal'
  | 'tulsi'
  | 'sindoor'
  | 'swarna'
  | 'shvet'
  | 'bhojpatra'
  | 'tamra';

export interface DevotionalThemeInfo {
  id: AppTheme;
  name: string;
  nameEn: string;
  deity: string;
  icon: string;
  bgHex: string;
  cardBgHex: string;
  accentHex: string;
  borderHex: string;
  desc: string;
  isLight: boolean;
}

export const DEVOTIONAL_THEMES: DevotionalThemeInfo[] = [
  {
    id: 'kesariya',
    name: 'केसरी भगवा',
    nameEn: 'Kesariya Bhagwa',
    deity: 'श्री राम व हनुमान जी',
    icon: '🚩',
    bgHex: '#FFF8F0',
    cardBgHex: '#FFFFFF',
    accentHex: '#C2410C',
    borderHex: '#FDBA74',
    desc: 'अयोध्या राम मंदिर व सूर्य-हनुमान दिव्य तेज',
    isLight: true,
  },
  {
    id: 'chandan',
    name: 'श्री चन्दन',
    nameEn: 'Shree Chandan',
    deity: 'श्री बद्रीनाथ व जगन्नाथ',
    icon: '🪵',
    bgHex: '#FAF5EC',
    cardBgHex: '#FFFFFF',
    accentHex: '#8C4A00',
    borderHex: '#DFCBB5',
    desc: 'पवित्र चन्दन तिलक व वैदिक भोजपत्र आभा',
    isLight: true,
  },
  {
    id: 'peetambari',
    name: 'पीताम्बरी',
    nameEn: 'Peetambari Gold',
    deity: 'श्री हरि विष्णु व माँ बगलामुखी',
    icon: '💛',
    bgHex: '#FEFCE8',
    cardBgHex: '#FFFFFF',
    accentHex: '#A16207',
    borderHex: '#FDE047',
    desc: 'पावन हरि पीताम्बर व स्वर्ण प्रभा',
    isLight: true,
  },
  {
    id: 'gangajal',
    name: 'गंगाजल शिव',
    nameEn: 'Gangajal Shiva',
    deity: 'माँ गंगा व भगवान शिव',
    icon: '🌊',
    bgHex: '#F0FDFA',
    cardBgHex: '#FFFFFF',
    accentHex: '#0F766E',
    borderHex: '#99F6E4',
    desc: 'हरिद्वार-ऋषिकेश पावन अमृत धारा',
    isLight: true,
  },
  {
    id: 'tulsi',
    name: 'पावन तुलसी',
    nameEn: 'Pawan Tulsi',
    deity: 'श्री राधा-कृष्ण व वृन्दावन',
    icon: '🌿',
    bgHex: '#F4FBF4',
    cardBgHex: '#FFFFFF',
    accentHex: '#15803D',
    borderHex: '#BBF7D0',
    desc: 'वृन्दावन कुंज व पावन तुलसीदल आभा',
    isLight: true,
  },
  {
    id: 'sindoor',
    name: 'सिन्दूरी शक्ति',
    nameEn: 'Sindoor Shakti',
    deity: 'माँ दुर्गा व कामाख्या',
    icon: '🌺',
    bgHex: '#FFF5F5',
    cardBgHex: '#FFFFFF',
    accentHex: '#BE123C',
    borderHex: '#FECDD3',
    desc: 'माँ जगदम्बा कुमकुम व शक्ति कृपा',
    isLight: true,
  },
  {
    id: 'swarna',
    name: 'स्वर्ण महालक्ष्मी',
    nameEn: 'Swarna Lakshmi',
    deity: 'माँ महालक्ष्मी व काशी विश्वनाथ',
    icon: '✨',
    bgHex: '#FFFBEB',
    cardBgHex: '#FFFFFF',
    accentHex: '#B45309',
    borderHex: '#FDE68A',
    desc: 'महालक्ष्मी समृद्धि व काशी स्वर्ण आभा',
    isLight: true,
  },
  {
    id: 'shvet',
    name: 'श्वेत प्रकाश',
    nameEn: 'Shvet Kailash',
    deity: 'माँ सरस्वती व कैलास शांति',
    icon: '🕊️',
    bgHex: '#F8FAFC',
    cardBgHex: '#FFFFFF',
    accentHex: '#334155',
    borderHex: '#CBD5E1',
    desc: 'धवल कैलास शांति व उच्च पठनीयता',
    isLight: true,
  },
  {
    id: 'bhojpatra',
    name: 'भोजपत्र पाण्डुलिपि',
    nameEn: 'Bhojpatra Parchment',
    deity: 'महर्षि वेदव्यास व वैदिक संहिता',
    icon: '📜',
    bgHex: '#FAF2DE',
    cardBgHex: '#FFFDF9',
    accentHex: '#78350F',
    borderHex: '#DFCBB5',
    desc: 'प्राचीन भोजपत्र स्वर्ण पाण्डुलिपि परम्परा',
    isLight: true,
  },
  {
    id: 'tamra',
    name: 'ताम्र-डार्क',
    nameEn: 'Tamra Night',
    deity: 'निशाकाल व रात्रि उपासना',
    icon: '🌙',
    bgHex: '#17110E',
    cardBgHex: '#231710',
    accentHex: '#D97706',
    borderHex: '#78350F',
    desc: 'पारंपरिक ताम्र कांस्य डार्क मोड',
    isLight: false,
  },
];

export function getStoredTheme(): AppTheme {
  try {
    const val = localStorage.getItem(STORAGE_KEY_THEME);
    if (val && DEVOTIONAL_THEMES.some((t) => t.id === val)) return val as AppTheme;
  } catch {}
  return 'kesariya';
}

export function setStoredTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch {}
}

// -------------------------------------------------------------
// Astrologer / Pandit Custom Visiting Card Branding
// -------------------------------------------------------------
export interface AstrologerBranding {
  enabled: boolean;
  name: string;
  title: string;
  phone: string;
  city: string;
  sansthan?: string;
  specialization?: string;
}

const STORAGE_KEY_BRANDING = 'shakti_astrologer_branding_v1';

export function getAstrologerBranding(): AstrologerBranding {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BRANDING);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    enabled: false,
    name: 'ज्योतिषाचार्य मनीष शास्त्री',
    title: 'वैदिक ज्योतिषी एवं कर्मकांड मर्मज्ञ',
    phone: '',
    city: 'वडोदरा (गुजरात)',
    sansthan: 'श्री शक्ति ज्योतिष एवं कर्मकांड संस्थान',
    specialization: 'जन्म पत्रिका, विवाह मेलापक, वास्तु एवं अनुष्ठान',
  };
}

export function saveAstrologerBranding(branding: AstrologerBranding): void {
  try {
    localStorage.setItem(STORAGE_KEY_BRANDING, JSON.stringify(branding));
  } catch {}
}


