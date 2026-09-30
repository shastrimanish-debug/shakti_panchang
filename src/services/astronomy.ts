import { PanchangData } from '../types';

export function calculatePanchang(dateStr: string, location: string): PanchangData {
  const d = new Date(dateStr);
  const dEpoch = new Date('2000-01-01T12:00:00Z');
  const days = (d.getTime() - dEpoch.getTime()) / (1000 * 60 * 60 * 24);

  // Mean longitudes of Sun and Moon (degrees)
  let Ls = (280.46646 + 0.98564736 * days) % 360;
  if (Ls < 0) Ls += 360;

  let Lm = (218.3165 + 13.176396 * days) % 360;
  if (Lm < 0) Lm += 360;

  // Lunar elongation (Moon longitude - Sun longitude)
  let DeltaL = (Lm - Ls + 360) % 360;

  // Tithi calculation (30 tithis in 360 degrees, 12 degrees per tithi)
  const tithiIndex = Math.floor(DeltaL / 12); // 0 to 29
  const paksha = tithiIndex < 15 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

  const tithis30 = [
    { name: 'प्रतिपदा (Pratipada)', endTime: '14:20 PM', percentage: 70 },
    { name: 'द्वितीया (Dwitiya)', endTime: '15:40 PM', percentage: 80 },
    { name: 'तृतीया (Tritiya)', endTime: '16:10 PM', percentage: 85 },
    { name: 'चतुर्थी (Chaturthi)', endTime: '12:30 PM', percentage: 60 },
    { name: 'पंचमी (Panchami)', endTime: '13:50 PM', percentage: 65 },
    { name: 'षष्ठी (Shashthi)', endTime: '17:20 PM', percentage: 90 },
    { name: 'सप्तमी (Saptami)', endTime: '11:10 AM', percentage: 50 },
    { name: 'अष्टमी (Ashtami)', endTime: '16:40 PM', percentage: 82 },
    { name: 'नवमी (Navami)', endTime: '18:15 PM', percentage: 95 },
    { name: 'दशमी (Dashami)', endTime: '14:00 PM', percentage: 75 },
    { name: 'एकादशी (Ekadashi)', endTime: '13:10 PM', percentage: 70 },
    { name: 'द्वादशी (Dwadashi)', endTime: '15:25 PM', percentage: 85 },
    { name: 'त्रयोदशी (Trayodashi)', endTime: '16:50 PM', percentage: 88 },
    { name: 'चतुर्दशी (Chaturdashi)', endTime: '12:00 PM', percentage: 55 },
    { name: 'पूर्णिमा (Purnima)', endTime: '19:40 PM', percentage: 98 },
    { name: 'प्रतिपदा (Pratipada)', endTime: '14:20 PM', percentage: 70 },
    { name: 'द्वितीया (Dwitiya)', endTime: '15:40 PM', percentage: 80 },
    { name: 'तृतीया (Tritiya)', endTime: '16:10 PM', percentage: 85 },
    { name: 'चतुर्थी (Chaturthi)', endTime: '12:30 PM', percentage: 60 },
    { name: 'पंचमी (Panchami)', endTime: '13:50 PM', percentage: 65 },
    { name: 'षष्ठी (Shashthi)', endTime: '17:20 PM', percentage: 90 },
    { name: 'सप्तमी (Saptami)', endTime: '11:10 AM', percentage: 50 },
    { name: 'अष्टमी (Ashtami)', endTime: '16:40 PM', percentage: 82 },
    { name: 'नवमी (Navami)', endTime: '18:15 PM', percentage: 95 },
    { name: 'दशमी (Dashami)', endTime: '14:00 PM', percentage: 75 },
    { name: 'एकादशी (Ekadashi)', endTime: '13:10 PM', percentage: 70 },
    { name: 'द्वादशी (Dwadashi)', endTime: '15:25 PM', percentage: 85 },
    { name: 'त्रयोदशी (Trayodashi)', endTime: '16:50 PM', percentage: 88 },
    { name: 'चतुर्दशी (Chaturdashi)', endTime: '12:00 PM', percentage: 55 },
    { name: 'अमावस्या (Amavasya)', endTime: '18:30 PM', percentage: 99 }
  ];

  const currentTithi = tithis30[tithiIndex] || tithis30[0];

  // Nakshatra calculation (27 nakshatras in 360 degrees, 13.333 degrees per nakshatra)
  const nakshatras = [
    'अश्विनी (Ashwini)', 'भरणी (Bharani)', 'कृत्तिका (Krittika)', 'रोहिणी (Rohini)',
    'मृगशिरा (Mrigashira)', 'आर्द्रा (Ardra)', 'पुनर्वसु (Punarvasu)', 'पुष्य (Pushya)',
    'आश्लेषा (Ashlesha)', 'मघा (Magha)', 'पूर्वा फाल्गुनी (Purva Phalguni)', 'उत्तरा फाल्गुनी (Uttara Phalguni)',
    'हस्त (Hasta)', 'चित्रा (Chitra)', 'स्वाति (Swati)', 'विशाखा (Vishakha)',
    'अनुराधा (Anuradha)', 'ज्येष्ठा (Jyeshtha)', 'मूल (Moola)', 'पूर्वाषाढ़ा (Purva Ashadha)',
    'उत्तराषाढ़ा (Uttara Ashadha)', 'श्रवण (Shravana)', 'धनिष्ठा (Dhanishta)', 'शतभिषा (Satabhisha)',
    'पूर्वाभाद्रपद (Purva Bhadrapada)', 'उत्तराभाद्रपद (Uttara Bhadrapada)', 'रेवती (Revati)'
  ];
  const nakshatraIndex = Math.floor(Lm / (360 / 27)) % 27;

  // Yoga calculation
  const yogas = ['विष्कुंभ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'घर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिध', 'शिव', 'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'ऐन्द्र', 'वैधृति'];
  const yogaIndex = Math.floor((Lm + Ls) / (360 / 27)) % yogas.length;

  // Karan calculation
  const karans = ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'vणिज', 'विष्टि (भद्रा)', 'शकुनि', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न'];
  const karanIndex = Math.floor(DeltaL / 6) % karans.length;

  const masas = ['चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद', 'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'];
  const masaIndex = Math.floor((days / 30.43685) % 12 + 12) % 12;

  const month = d.getMonth();

  return {
    date: dateStr,
    location,
    vikramSamvat: 2083,
    shakaSamvat: 1948,
    ayana: month > 2 && month < 9 ? 'दक्षिणायन (Dakshinayana)' : 'उत्तरायण (Uttarayana)',
    ritu: month === 3 || month === 4 ? 'वसन्त ऋतु' : month === 5 || month === 6 ? 'ग्रीष्म ऋतु' : month === 7 || month === 8 ? 'वर्षा ऋतु' : 'शरद/हेमन्त ऋतु',
    masa: masas[Math.floor(masaIndex)],
    paksha: paksha,
    tithi: currentTithi,
    nakshatra: { name: nakshatras[nakshatraIndex], endTime: '16:45 PM', percentage: 78 },
    yoga: { name: yogas[yogaIndex], endTime: '14:30 PM' },
    karan: { name: karans[karanIndex], endTime: '12:15 PM' },
    sunrise: '06:12 AM',
    sunset: '06:18 PM',
    moonrise: '10:30 AM',
    moonset: '11:45 PM',
    rahuKaal: '04:30 PM - 06:00 PM',
    yamgand: '12:00 PM - 01:30 PM',
    gulikKaal: '03:00 PM - 04:30 PM',
    abhijitMuhurat: '11:48 AM - 12:36 PM',
    durmuhurat: '02:45 PM - 03:32 PM'
  };
}
