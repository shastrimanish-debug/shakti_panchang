export type ActiveTab = 
  | 'dashboard'
  | 'panchang'
  | 'festivals'
  | 'muhurat'
  | 'kundali'
  | 'milan'
  | 'choghadiya'
  | 'vrat'
  | 'sadesati'
  | 'gochar'
  | 'ratna'
  | 'mantra'
  | 'rashifal'
  | 'upay'
  | 'vastu'
  | 'uma';

export interface PanchangData {
  date: string;
  location: string;
  vikramSamvat: number;
  shakaSamvat: number;
  ayana: string;
  ritu: string;
  masa: string;
  paksha: string;
  tithi: { name: string; endTime: string; percentage: number };
  nakshatra: { name: string; endTime: string; percentage: number };
  yoga: { name: string; endTime: string };
  karan: { name: string; endTime: string };
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: string;
  yamgand: string;
  gulikKaal: string;
  abhijitMuhurat: string;
  durmuhurat: string;
}

export interface Festival {
  date: string;
  name: string;
  category: 'major' | 'vrata' | 'jayanti' | 'other';
  description: string;
}

export interface KundaliInput {
  name: string;
  dob: string;
  time: string;
  place: string;
  lat: number;
  lon: number;
}
