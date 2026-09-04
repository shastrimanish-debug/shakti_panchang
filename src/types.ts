export interface SavedLocation {
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  district?: string;
  country?: string;
  type?: string;
}

export interface SolarTimes {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  solarNoon: Date;
}

export interface VedicPanchangData {
  date: Date;
  weekday: string;
  paksha: string;
  tithi: string;
  tithiNumber: number;
  tithiProgress: number;
  nakshatra: string;
  nakshatraNumber: number;
  nakshatraProgress: number;
  pada: number;
  yoga: string;
  yogaNumber: number;
  karana: string;
  karanaNumber: number;
  samvat: string;
  sakaSamvat: string;
  masa: string;
  solarRashi: string;
  lunarRashi: string;
  ayanamsha: number;
  ayanamshaName: string;
  sunLongitude: number;
  moonLongitude: number;
  solar: SolarTimes;
  calculationNote?: string;
}

export interface PlanetPosition {
  planet: string;
  englishName: string;
  rashi: string;
  rashiNumber: number;
  degree: number;
  degreeInRashi: number;
  house: number;
  isRetrograde: boolean;
  latitude: number;
  speed: number;
  nakshatra: string;
  pada: number;
}

export interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  years: number;
}

export interface AntarDashaPeriod {
  maha: string;
  antar: string;
  startDate: Date;
  endDate: Date;
  years: number;
}

export interface DashaPratyantarPeriod {
  maha: string;
  antar: string;
  pratyantar: string;
  startDate: Date;
  endDate: Date;
  days: number;
}

export interface KundaliData {
  name: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezoneHours: number;
  lagnaDegree: number;
  lagnaRashi: string;
  lagnaRashiNumber: number;
  moonRashi: string;
  sunRashi: string;
  nakshatra: string;
  charan: string;
  nadi: string;
  gana: string;
  yoni: string;
  varna: string;
  vashya: string;
  nakshatraLord?: string;
  isManglik?: boolean;
  manglikDescription?: string;
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  planets: PlanetPosition[];
  dashaPeriods: DashaPeriod[];
  antarPeriods: AntarDashaPeriod[];
  pratyantarPeriods: DashaPratyantarPeriod[];
  calculatedAt?: Date;
}

export interface AshtakootItem {
  name: string;
  score: number;
  max: number;
  note: string;
  boyValue: string;
  girlValue: string;
}

export interface FestivalItem {
  id: string;
  name: string;
  hindiName: string;
  date: Date;
  type: string;
  description: string;
  tithi?: string;
  paksha?: string;
  masa?: string;
  significance?: string;
  rituals?: string[];
}

export interface AppReminder {
  id: string;
  title: string;
  date?: string;
  body?: string;
  timestamp?: number;
  type?: string;
  createdAt?: number | string;
  category?: 'festival' | 'vrat' | 'muhurat' | 'personal';
  notes?: string;
}

export interface ChoghadiyaItem {
  name: string;
  hindiName: string;
  start: Date;
  end: Date;
  nature: 'auspicious' | 'inauspicious' | 'neutral';
  meaning: string;
  ruler: string;
}

export interface MuhuratWindow {
  title: string;
  start: Date;
  end: Date;
  description: string;
  nature: 'auspicious' | 'inauspicious' | 'neutral';
}

export interface PdfResult {
  success: boolean;
  fileName: string;
  filePath?: string;
  fileBlob?: Blob;
  url?: string;
  fileSizeKb?: number;
  pageCount?: number;
}
