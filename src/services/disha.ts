import { calculateSolarTimes } from './astronomy';
import { getDayChoghadiya, getInauspiciousWindows } from './choghadiya';
import { ChoghadiyaItem } from '../types';

export interface IndianCity {
  name: string;
  latitude: number;
  longitude: number;
  state: string;
  country?: string;
  district?: string;
  type?: string;
}

export const COMMON_INDIAN_CITIES: IndianCity[] = [
  { name: 'बुरहानपुर (Burhanpur)', latitude: 21.3142, longitude: 76.2298, state: 'मध्य प्रदेश' },
  { name: 'उज्जैन (Ujjain)', latitude: 23.1765, longitude: 75.7885, state: 'मध्य प्रदेश' },
  { name: 'वाराणसी (Varanasi / Kashi)', latitude: 25.3176, longitude: 82.9739, state: 'उत्तर प्रदेश' },
  { name: 'अयोध्या (Ayodhya)', latitude: 26.7986, longitude: 82.1998, state: 'उत्तर प्रदेश' },
  { name: 'हरिद्वार (Haridwar)', latitude: 29.9457, longitude: 78.1642, state: 'उत्तराखंड' },
  { name: 'मथुरा (Mathura)', latitude: 27.4924, longitude: 77.6737, state: 'उत्तर प्रदेश' },
  { name: 'नई दिल्ली (New Delhi)', latitude: 28.6139, longitude: 77.2090, state: 'दिल्ली' },
  { name: 'वडोदरा (Vadodara)', latitude: 22.3072, longitude: 73.1812, state: 'गुजरात' },
  { name: 'अहमदाबाद (Ahmedabad)', latitude: 23.0225, longitude: 72.5714, state: 'गुजरात' },
  { name: 'मुंबई (Mumbai)', latitude: 19.0760, longitude: 72.8777, state: 'महाराष्ट्र' },
  { name: 'पुणे (Pune)', latitude: 18.5204, longitude: 73.8567, state: 'महाराष्ट्र' },
  { name: 'जयपुर (Jaipur)', latitude: 26.9124, longitude: 75.7873, state: 'राजस्थान' },
  { name: 'इन्दौर (Indore)', latitude: 22.7196, longitude: 75.8577, state: 'मध्य प्रदेश' },
  { name: 'भोपाल (Bhopal)', latitude: 23.2599, longitude: 77.4126, state: 'मध्य प्रदेश' },
  { name: 'खंडवा (Khandwa)', latitude: 21.8314, longitude: 76.3498, state: 'मध्य प्रदेश' },
  { name: 'जबलपुर (Jabalpur)', latitude: 23.1815, longitude: 79.9864, state: 'मध्य प्रदेश' },
  { name: 'ग्वालियर (Gwalior)', latitude: 26.2183, longitude: 78.1828, state: 'मध्य प्रदेश' },
  { name: 'बेंगलुरु (Bengaluru)', latitude: 12.9716, longitude: 77.5946, state: 'कर्नाटक' },
  { name: 'हैदराबाद (Hyderabad)', latitude: 17.3850, longitude: 78.4867, state: 'तेलंगाना' },
  { name: 'कोलकाता (Kolkata)', latitude: 22.5726, longitude: 88.3639, state: 'पश्चिम बंगाल' },
  { name: 'पटना (Patna)', latitude: 25.5941, longitude: 85.1376, state: 'बिहार' },
  { name: 'सूरत (Surat)', latitude: 21.1702, longitude: 72.8311, state: 'गुजरात' },
];

export const DISHASHOOL_MAP: Record<number, string> = {
  0: 'पश्चिम', // Sunday
  1: 'पूर्व',   // Monday
  2: 'उत्तर',  // Tuesday
  3: 'उत्तर',  // Wednesday
  4: 'दक्षिण', // Thursday
  5: 'पश्चिम', // Friday
  6: 'पूर्व',   // Saturday
};

export const DISHASHOOL_REMEDIES: Record<number, string> = {
  0: 'रविवार दिशाशूल परिहार: यात्रा से पूर्व दलिया अथवा घी खाकर, सूर्य देव को अर्घ्य देकर प्रस्थान करें।',
  1: 'सोमवार दिशाशूल परिहार: दर्पण (शीशा) में अपना मुख देखकर अथवा दूध पीकर यात्रा आरंभ करें।',
  2: 'मंगलवार दिशाशूल परिहार: गुड़ खाकर अथवा धनिया चबाकर, हनुमान चालीसा का पाठ कर प्रस्थान करें।',
  3: 'बुधवार दिशाशूल परिहार: तिल अथवा हरी इलायची खाकर, भगवान गणेश का स्मरण कर यात्रा करें।',
  4: 'गुरुवार दिशाशूल परिहार: दही खाकर अथवा पीली सरसों साथ रखकर, श्री हरि विष्णु का ध्यान करें।',
  5: 'शुक्रवार दिशाशूल परिहार: जौ अथवा खीर खाकर, मां लक्ष्मी का ध्यान कर प्रस्थान करें।',
  6: 'शनिवार दिशाशूल परिहार: अदरक, उड़द अथवा राई खाकर, शनि देव का स्मरण कर यात्रा आरंभ करें।',
};

export const TRAVEL_REMEDIES = DISHASHOOL_REMEDIES;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (toDeg(theta) + 360) % 360;
}

export function bearingToDirection(bearing: number): string {
  const b = ((bearing % 360) + 360) % 360;
  if (b < 22.5 || b >= 337.5) return 'उत्तर';
  if (b < 67.5) return 'उत्तर-पूर्व';
  if (b < 112.5) return 'पूर्व';
  if (b < 157.5) return 'दक्षिण-पूर्व';
  if (b < 202.5) return 'दक्षिण';
  if (b < 247.5) return 'दक्षिण-पश्चिम';
  if (b < 292.5) return 'पश्चिम';
  return 'उत्तर-पश्चिम';
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(6371 * c);
}

export interface YatraShoolResult {
  fromName: string;
  toName: string;
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  bearing: number;
  direction: string;
  distanceKm: number;
  shoolDirection: string;
  isDirectionBlocked: boolean;
  message: string;
  remedy: string;
  suitablePeriods: ChoghadiyaItem[];
}

export function calculateYatraShool(
  fromName: string,
  fromLat: number,
  fromLon: number,
  toName: string,
  toLat: number,
  toLon: number,
  date: Date
): YatraShoolResult {
  const weekday = date.getDay();
  const shoolDir = DISHASHOOL_MAP[weekday] || 'पश्चिम';
  const bearing = calculateBearing(fromLat, fromLon, toLat, toLon);
  const direction = bearingToDirection(bearing);
  const distanceKm = calculateDistanceKm(fromLat, fromLon, toLat, toLon);

  const exactBlocked = direction === shoolDir;
  const partialBlocked =
    (direction === 'उत्तर-पूर्व' && shoolDir === 'पूर्व') ||
    (direction === 'उत्तर-पश्चिम' && shoolDir === 'पश्चिम') ||
    (direction === 'दक्षिण-पूर्व' && shoolDir === 'पूर्व') ||
    (direction === 'दक्षिण-पश्चिम' && shoolDir === 'पश्चिम') ||
    (direction === 'उत्तर-पूर्व' && shoolDir === 'उत्तर') ||
    (direction === 'उत्तर-पश्चिम' && shoolDir === 'उत्तर');

  const isBlocked = exactBlocked || partialBlocked;

  let message = '';
  if (exactBlocked) {
    message = `आज ${direction} दिशा में सीधा दिशाशूल है। वैदिक मान्यतानुसार आज इस दिशा में यात्रा प्रारंभ करने से बचें। यदि यात्रा अत्यावश्यक हो तो नीचे दिया गया पारंपरिक परिहार अवश्य करें।`;
  } else if (partialBlocked) {
    message = `आज ${direction} दिशा आंशिक रूप से दिशाशूल (${shoolDir}) से प्रभावित है। सावधानी बरतें और शुभ चौघड़िया में ही यात्रा प्रारंभ करें।`;
  } else {
    message = `आज की यात्रा दिशा (${direction}) दिशाशूल से पूर्णतया मुक्त है। यात्रा के लिए यह दिशा शुभ और अनुकूल है।`;
  }

  const solar = calculateSolarTimes(date, fromLat, fromLon);
  const dayChoghadiyas = getDayChoghadiya(solar, weekday);
  const inauspiciousWindows = getInauspiciousWindows(solar, weekday);

  const suitablePeriods = dayChoghadiyas.filter((c) => {
    if (['Kaal', 'Rog', 'Udveg'].includes(c.name)) return false;
    const overlapsRahu = inauspiciousWindows.some(
      (w) => w.title === 'राहु काल' && c.start < w.end && c.end > w.start
    );
    return !overlapsRahu;
  });

  const remedy = DISHASHOOL_REMEDIES[weekday] || '';

  return {
    fromName,
    toName,
    fromLat,
    fromLon,
    toLat,
    toLon,
    bearing,
    direction,
    distanceKm,
    shoolDirection: shoolDir,
    isDirectionBlocked: isBlocked,
    message,
    remedy,
    suitablePeriods,
  };
}
