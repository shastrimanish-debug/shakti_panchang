/**
 * Dynamic Panchang API Client
 * Sends dynamic requests with selected language code to 'api.php?lang={code}'
 * Compliant with Google Play Store & Reviewer Requirement:
 * "For dynamic Panchang data, append the selected language code to the PHP API requests (e.g., fetch('api.php?lang=hi')). The backend should return the translated data."
 */

import { VedicPanchangData } from '../types';
import { calculateVedicPanchang } from './astronomy';
import { trVedic, trWeekday, trRashi } from '../i18n/vedicTranslate';

export interface DynamicPanchangResponse {
  ok: boolean;
  language: string;
  date: string;
  location: {
    name?: string;
    latitude: number;
    longitude: number;
    timezoneHours?: number;
  };
  panchang: {
    date: string;
    tithi: string;
    paksha: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    weekday: string;
    sunRashi: string;
    moonRashi: string;
    vikramSamvat: number;
    sakaSamvat: number;
    ayana: string;
    ritu: string;
    masa: string;
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    brahmaMuhurat: { start: string; end: string };
    abhijitMuhurat: { start: string; end: string };
    rahuKaal: { start: string; end: string };
    gulikaKaal: { start: string; end: string };
    yamaganda: { start: string; end: string };
  };
  source?: 'remote_php_api' | 'local_vedic_engine';
}

/**
 * Local translation fallback that mirrors the backend PHP dynamic response
 */
export function getLocalizedPanchang(
  base: VedicPanchangData,
  langCode: string
): VedicPanchangData {
  const lang = (langCode || 'hi').slice(0, 2).toLowerCase();
  if (lang === 'hi') return base;

  return {
    ...base,
    weekday: trWeekday(base.weekday, lang),
    tithi: trVedic(base.tithi, lang),
    paksha: trVedic(base.paksha, lang),
    nakshatra: trVedic(base.nakshatra, lang),
    yoga: trVedic(base.yoga, lang),
    karana: trVedic(base.karana, lang),
    solarRashi: trRashi(base.solarRashi, lang),
    lunarRashi: trRashi(base.lunarRashi, lang),
    samvat: trVedic(base.samvat, lang),
    sakaSamvat: trVedic(base.sakaSamvat, lang),
    masa: trVedic(base.masa, lang),
  };
}

/**
 * Fetch dynamic Panchang from backend PHP endpoint: api.php?lang={langCode}
 */
export async function fetchDynamicPanchang(
  date: Date = new Date(),
  latitude: number = 23.1765,
  longitude: number = 75.7885,
  tzHours: number = 5.5,
  langCode: string = 'hi'
): Promise<VedicPanchangData> {
  const cleanLang = (langCode || 'hi').slice(0, 2).toLowerCase();
  const dateStr = date.toISOString().split('T')[0];

  const queryParams = new URLSearchParams({
    lang: cleanLang,
    date: dateStr,
    lat: latitude.toFixed(4),
    lng: longitude.toFixed(4),
    tz: tzHours.toString(),
  });

  const apiUrl = `api.php?${queryParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data: DynamicPanchangResponse = await response.json();
      if (data && data.ok && data.panchang) {
        // Compute base client object and merge backend translated fields
        const localBase = calculateVedicPanchang(date, latitude, longitude, tzHours);
        return {
          ...localBase,
          weekday: data.panchang.weekday || trWeekday(localBase.weekday, cleanLang),
          tithi: data.panchang.tithi || trVedic(localBase.tithi, cleanLang),
          paksha: data.panchang.paksha || trVedic(localBase.paksha, cleanLang),
          nakshatra: data.panchang.nakshatra || trVedic(localBase.nakshatra, cleanLang),
          yoga: data.panchang.yoga || trVedic(localBase.yoga, cleanLang),
          karana: data.panchang.karana || trVedic(localBase.karana, cleanLang),
          solarRashi: data.panchang.sunRashi || trRashi(localBase.solarRashi, cleanLang),
          lunarRashi: data.panchang.moonRashi || trRashi(localBase.lunarRashi, cleanLang),
          masa: data.panchang.masa || trVedic(localBase.masa, cleanLang),
        };
      }
    }
  } catch (err) {
    // If running offline or inside Capacitor WebView without server, seamlessly use local localized engine
  }

  // Authoritative offline fallback
  const fallbackBase = calculateVedicPanchang(date, latitude, longitude, tzHours);
  return getLocalizedPanchang(fallbackBase, cleanLang);
}
