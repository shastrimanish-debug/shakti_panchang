import { SolarTimes, ChoghadiyaItem, MuhuratWindow } from '../types';

export const CHOGHADIYA_ORDER = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];

export const DAY_START_CHOGHADIYA: Record<number, string> = {
  1: 'Amrit', // Monday
  2: 'Rog',   // Tuesday
  3: 'Labh',  // Wednesday
  4: 'Shubh', // Thursday
  5: 'Char',  // Friday
  6: 'Kaal',  // Saturday
  0: 'Udveg', // Sunday
};

export const NIGHT_CHOGHADIYA_TABLE: Record<number, string[]> = {
  0: ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sunday
  1: ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],  // Monday
  2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],  // Tuesday
  3: ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Wednesday
  4: ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // Thursday
  5: ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],   // Friday
  6: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],  // Saturday
};

export const CHOGHADIYA_HINDI: Record<string, string> = {
  Amrit: 'अमृत',
  Shubh: 'शुभ',
  Labh: 'लाभ',
  Char: 'चर',
  Rog: 'रोग',
  Kaal: 'काल',
  Udveg: 'उद्वेग',
};

export const CHOGHADIYA_MEANING: Record<string, string> = {
  Amrit: 'सर्वोत्तम — समस्त मांगलिक व शुभ कार्य',
  Shubh: 'अति शुभ — धार्मिक, विवाह, पूजा व उत्सव',
  Labh: 'लाभकारी — व्यापार, नया काम, शिक्षा, धन प्राप्ति',
  Char: 'चल — यात्रा, गतिमान कार्य, वाहन, सामान्य कार्य',
  Rog: 'अशुभ — रोग, कष्ट, नया कार्य करने से बचें',
  Kaal: 'अति अशुभ — कलह व हानि कारक, कोई नया काम न करें',
  Udveg: 'अशुभ — उद्वेग, चिंता व मानसिक अशांति',
};

export const CHOGHADIYA_RULER: Record<string, string> = {
  Amrit: 'चंद्र देव',
  Shubh: 'गुरु देव',
  Labh: 'बुध देव',
  Char: 'शुक्र देव',
  Rog: 'मंगल देव',
  Kaal: 'शनि देव',
  Udveg: 'सूर्य देव',
};

export function getChoghadiyaNature(name: string): 'auspicious' | 'inauspicious' | 'neutral' {
  if (['Amrit', 'Shubh', 'Labh'].includes(name)) return 'auspicious';
  if (name === 'Char') return 'neutral';
  return 'inauspicious';
}

function makeChoghadiyaItem(name: string, start: Date, end: Date): ChoghadiyaItem {
  return {
    name,
    hindiName: CHOGHADIYA_HINDI[name] || name,
    start,
    end,
    nature: getChoghadiyaNature(name),
    meaning: CHOGHADIYA_MEANING[name] || '',
    ruler: CHOGHADIYA_RULER[name] || '',
  };
}

/**
 * Calculates 8 Day Choghadiyas between sunrise and sunset
 */
export function getDayChoghadiya(solar: SolarTimes, weekday: number): ChoghadiyaItem[] {
  const startName = DAY_START_CHOGHADIYA[weekday] || 'Udveg';
  const startIndex = CHOGHADIYA_ORDER.indexOf(startName);
  const partDuration = (solar.sunset.getTime() - solar.sunrise.getTime()) / 8;

  return Array.from({ length: 8 }, (_, i) => {
    const start = new Date(solar.sunrise.getTime() + partDuration * i);
    const end = i === 7 ? solar.sunset : new Date(solar.sunrise.getTime() + partDuration * (i + 1));
    const name = CHOGHADIYA_ORDER[(startIndex + i) % CHOGHADIYA_ORDER.length];
    return makeChoghadiyaItem(name, start, end);
  });
}

/**
 * Calculates 8 Night Choghadiyas between sunset and next sunrise
 */
export function getNightChoghadiya(solar: SolarTimes, weekday: number): ChoghadiyaItem[] {
  const sequence = NIGHT_CHOGHADIYA_TABLE[weekday] || NIGHT_CHOGHADIYA_TABLE[0];
  const partDuration = (solar.nextSunrise.getTime() - solar.sunset.getTime()) / 8;

  return Array.from({ length: 8 }, (_, i) => {
    const start = new Date(solar.sunset.getTime() + partDuration * i);
    const end = i === 7 ? solar.nextSunrise : new Date(solar.sunset.getTime() + partDuration * (i + 1));
    return makeChoghadiyaItem(sequence[i], start, end);
  });
}

// 1-based index (0-7 parts of day from sunrise)
const RAHU_KAAL_PARTS: Record<number, number> = { 1: 1, 2: 6, 3: 4, 4: 5, 5: 2, 6: 3, 0: 7 };
const YAMAGANDA_PARTS: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0, 6: 6, 0: 5 };
const GULIK_PARTS: Record<number, number> = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 0: 0 };

/**
 * Calculates inauspicious windows (Rahu Kaal, Yamaganda, Gulik Kaal)
 */
export function getInauspiciousWindows(solar: SolarTimes, weekday: number): MuhuratWindow[] {
  const dayDuration = (solar.sunset.getTime() - solar.sunrise.getTime()) / 8;
  const getWindowTime = (part: number) => new Date(solar.sunrise.getTime() + dayDuration * part);

  const rahuPart = RAHU_KAAL_PARTS[weekday] ?? 7;
  const yamaPart = YAMAGANDA_PARTS[weekday] ?? 5;
  const gulikPart = GULIK_PARTS[weekday] ?? 0;

  return [
    {
      title: 'राहु काल',
      start: getWindowTime(rahuPart),
      end: getWindowTime(rahuPart + 1),
      description: 'अशुभ काल — नवीन कार्य, निवेश या यात्रा प्रारंभ करने से बचें।',
      nature: 'inauspicious',
    },
    {
      title: 'यमगण्ड काल',
      start: getWindowTime(yamaPart),
      end: getWindowTime(yamaPart + 1),
      description: 'मृत्युतुल्य कष्ट या बाधा का कारक — शुभ कार्यों के लिए वर्जित।',
      nature: 'inauspicious',
    },
    {
      title: 'गुलिक काल',
      start: getWindowTime(gulikPart),
      end: getWindowTime(gulikPart + 1),
      description: 'शनि पुत्र गुलिक का काल — सामान्य कार्यों के लिए मध्यम, शुभ कार्य टालें।',
      nature: 'inauspicious',
    },
  ];
}

/**
 * Calculates auspicious windows (Brahma, Abhijit, Godhuli, Amrit Kaal)
 */
export function getAuspiciousWindows(solar: SolarTimes): MuhuratWindow[] {
  const dayLength = solar.sunset.getTime() - solar.sunrise.getTime();

  return [
    {
      title: 'ब्रह्म मुहूर्त',
      start: new Date(solar.sunrise.getTime() - 96 * 60000),
      end: new Date(solar.sunrise.getTime() - 48 * 60000),
      description: 'सर्वश्रेष्ठ काल — योग, ध्यान, अध्ययन व ईश वंदना के लिए परम पावन।',
      nature: 'auspicious',
    },
    {
      title: 'अभिजित मुहूर्त',
      start: new Date(solar.solarNoon.getTime() - 24 * 60000),
      end: new Date(solar.solarNoon.getTime() + 24 * 60000),
      description: 'विजय मुहूर्त — समस्त दोषों को नष्ट कर सफलता प्रदान करने वाला काल।',
      nature: 'auspicious',
    },
    {
      title: 'गोधूलि मुहूर्त',
      start: new Date(solar.sunset.getTime() - 24 * 60000),
      end: new Date(solar.sunset.getTime() + 24 * 60000),
      description: 'संध्या काल — गृह प्रवेश, गो-सेवा, सांध्य वंदना व शांति कर्म के लिए शुभ।',
      nature: 'auspicious',
    },
    {
      title: 'अमृत काल',
      start: new Date(solar.sunrise.getTime() + dayLength * 0.35),
      end: new Date(solar.sunrise.getTime() + dayLength * 0.45),
      description: 'अमृत योग — समस्त नवीन व मांगलिक कार्यों के लिए उत्तम।',
      nature: 'auspicious',
    },
  ];
}

/**
 * Finds current active choghadiya and remaining minutes
 */
export function getCurrentChoghadiya(
  choghadiyas: ChoghadiyaItem[],
  now: Date = new Date()
): { current: ChoghadiyaItem | null; remainingMinutes: number } {
  const item = choghadiyas.find((c) => now >= c.start && now < c.end) || null;
  if (!item) return { current: null, remainingMinutes: 0 };
  const rem = Math.max(0, Math.round((item.end.getTime() - now.getTime()) / 60000));
  return { current: item, remainingMinutes: rem };
}
