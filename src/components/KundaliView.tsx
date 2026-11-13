import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KundaliData, SavedLocation, DashaPratyantarPeriod } from '../types';
import { KundaliChart } from './KundaliChart';
import { LocationModal } from './LocationModal';
import {
  calculateKundali,
  calculateAshtakootMilan,
  generatePrashnaKundali,
  getVedicRemedies,
  calculatePratyantarPeriods,
  toTimeInput24h,
  formatTime12h,
  parseTimeString,
  extractCalendarYMD,
  resolveBirthCoordinates,
  formatUtcOffsetLabel,
  formatCoordLabel,
} from '../services/kundali';
import { COMMON_INDIAN_CITIES } from '../services/disha';
import {
  saveKundaliProfile,
  DEFAULT_LOCATION,
  getAstrologerBranding,
} from '../services/storage';
import { useLicense } from '@/lib/license-client';
import { useUserDateTime } from '../hooks/useUserDateTime';
import { calculateVedicPanchang, RASHIS, NAKSHATRAS } from '../services/astronomy';
import { createQuickKundaliFromRashiNakshatra } from '../services/milan';
import { downloadMilanBhojpatraPdf, downloadBhojpatraPdf } from '../services/bhojpatraPdf';
import { generateExhaustive59PageKundaliPdf } from '../services/exhaustiveKundaliPdf';
import { analyzeKundali, professionalPdfAnswer } from '../services/predictions';
import { CalcSettingsPanel } from './CalcSettingsPanel';
import { PdfSuccessModal, PdfSuccessInfo } from './PdfSuccessModal';
import { SubscriptionModal } from './SubscriptionModal';
import { SadeSatiView } from './SadeSatiView';
import { VargaAnalysisPanel } from './VargaAnalysisPanel';
import { KpAshtakvargaPanel } from './KpAshtakvargaPanel';
import { JaiminiPanel } from './JaiminiPanel';
import { Vedic3DKundaliView } from './Vedic3DKundaliView';
import { LalKitabUpayListView } from './LalKitabUpayListView';
import { PrashnaJyotishPanel } from './PrashnaJyotishPanel';
import { ShlokaPosterModal, ShlokaPosterData } from './ShlokaPosterModal';
import { UpayParchiModal } from './UpayParchiModal';
import { VedicDatePickerModal, VedicTimePickerModal } from './VedicDateTimePickerModals';
import { calculateTriveniGemology, getLocalizedGotra, GOTRA_LIST, GotraProfile, TriveniRatnaResult } from '../services/triveniGemology';
import { useTranslation, useLanguage } from '../i18n';
import { trVedic, trRashi, trPlanet } from '../i18n/vedicTranslate';
import {
  User,
  Clock,
  Calendar,
  Heart,
  HelpCircle,
  Shield,
  Download,
  AlertTriangle,
  Info,
  Layers,
  Flame,
  Zap,
  MapPin,
  Sparkles,
  FileText,
  Loader2,
  CheckCircle2,
  Crown,
  Lock,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Compass,
  Award,
  Share2,
} from 'lucide-react';

export const SHODASHVARGA_OPTIONS = [
  { division: 1, code: 'D1', name: 'लग्न चक्र (Lagna / Rashi)', desc: 'सम्पूर्ण जीवन, शारीरिक गठन, देह, रूप, स्वास्थ्य व मूल स्वभाव' },
  { division: 2, code: 'D2', name: 'होरा चक्र (Hora)', desc: 'धन-सम्पदा, कोष, आर्थिक समृद्धि, वाणी व पैतृक संपत्ति' },
  { division: 3, code: 'D3', name: 'द्रेष्काण चक्र (Drekkana)', desc: 'सहोदर (भाई-बहन), पराक्रम, साहस, शौर्य व तृतीय भाव फल' },
  { division: 4, code: 'D4', name: 'चतुर्थांश चक्र (Chaturthamsha)', desc: 'भाग्य, स्थाई संपत्ति, भूमि, भवन, वाहन व सुख साधन' },
  { division: 7, code: 'D7', name: 'सप्तमांश चक्र (Saptamsha)', desc: 'संतान, संतति सुख, वंश वृद्धि, पौत्र-पौत्री व पंचम भाव फल' },
  { division: 9, code: 'D9', name: 'नवमांश चक्र (Navamsha)', desc: 'विवाह, जीवनसाथी, धर्म, आध्यात्मिक सामर्थ्य व भाग्य की सूक्ष्मता' },
  { division: 10, code: 'D10', name: 'दशमांश चक्र (Dashamsha)', desc: 'आजीविका, कर्म, पद-प्रतिष्ठा, व्यवसाय, यश व करियर उत्थान' },
  { division: 12, code: 'D12', name: 'द्वादशांश चक्र (Dwadashamsha)', desc: 'माता-पिता, पूर्वज, पैतृक संस्कार, वंश परंपरा व पूर्व पुण्य' },
  { division: 16, code: 'D16', name: 'षोडशांश चक्र (Shodashamsha)', desc: 'वाहन सुख, सुख-साधन, आंतरिक आनंद, दुर्घटना रक्षा व वैभव' },
  { division: 20, code: 'D20', name: 'विंशांश चक्र (Vimshamsha)', desc: 'आध्यात्मिक साधना, उपासना, मंत्र सिद्धि, भक्ति व आत्मज्ञान' },
  { division: 24, code: 'D24', name: 'चतुर्विंशांश चक्र (Chaturvimshamsha / Siddhamsa)', desc: 'उच्च विद्या, ज्ञान, बुद्धि, अनुसंधान, पांडित्य व शास्त्रीय सिद्धि' },
  { division: 27, code: 'D27', name: 'सप्तविंशांश चक्र (Saptavimshamsha / Bhamsha)', desc: 'शारीरिक व मानसिक बल, सहनशक्ति, बल-निर्बलता व धैर्य' },
  { division: 30, code: 'D30', name: 'त्रिंशांश चक्र (Trimshamsha)', desc: 'अरिष्ट, दुर्घटना, पाप प्रभाव, विपत्तियाँ व दोष निवारण' },
  { division: 40, code: 'D40', name: 'खवेदांश चक्र (Khavedamsha)', desc: 'विशिष्ट शुभ-अशुभ कर्मफल, सूक्ष्म प्रारब्ध व पूर्व कर्म फल' },
  { division: 45, code: 'D45', name: 'अक्षवेदांश चक्र (Akshavedamsha)', desc: 'चरित्र, आचरण, नैतिक संस्कार, शुद्धि व आत्मिक बल' },
  { division: 60, code: 'D60', name: 'षष्ट्यंश चक्र (Shashtiamsha)', desc: 'पूर्वजन्म संचित कर्म, गहन प्रारब्ध व सम्पूर्ण फलित की सर्वोच्च कुंजी' },
];

export interface VargaDef {
  division: number;
  code: string;
  name: string;
  desc: string;
  isShodash: boolean;
}

export const ALL_D1_TO_D60_VARGAS: VargaDef[] = Array.from({ length: 60 }, (_, i) => {
  const div = i + 1;
  const shodashMatch = SHODASHVARGA_OPTIONS.find((s) => s.division === div);
  if (shodashMatch) {
    return {
      division: div,
      code: shodashMatch.code,
      name: shodashMatch.name,
      desc: shodashMatch.desc,
      isShodash: true,
    };
  }

  // Classical names for other known Vargas
  let customName = `D${div} सूक्ष्म वर्गीय चक्र`;
  let customDesc = `विभाजन 1/${div} अंश — सूक्ष्म ज्योतिषीय गणना`;
  if (div === 5) {
    customName = 'पंचांश चक्र (Panchamsha)';
    customDesc = 'आध्यात्मिक आभा, तेज, प्रसिद्धि व संतान सूक्ष्म शक्ति';
  } else if (div === 6) {
    customName = 'षष्ठांश चक्र (Shashtamsha)';
    customDesc = 'रोग, ऋण, शत्रु, बाधाएं व स्वास्थ्य संरक्षण';
  } else if (div === 8) {
    customName = 'अष्टमांश चक्र (Ashtamsha)';
    customDesc = 'दीर्घायु, गुप्त विद्या, शोध व आकस्मिक संकट';
  } else if (div === 11) {
    customName = 'एकादशांश / रुद्रांश (Rudramsha)';
    customDesc = 'विशिष्ट लाभ, विजय, ऐश्वर्य व कार्य सिद्धि';
  } else if (div === 28) {
    customName = 'ब्रह्मांश चक्र (Brahmamsha)';
    customDesc = 'ब्रह्म ज्ञान, पूर्व संचित प्रारब्ध व मोक्ष साधना';
  } else if (div === 54) {
    customName = 'चतुःपंचाशदंश चक्र (D54)';
    customDesc = 'विशिष्ट सूक्ष्म दैवज्ञ फल व पराशरीय ऊर्जा';
  }

  return {
    division: div,
    code: `D${div}`,
    name: customName,
    desc: customDesc,
    isShodash: false,
  };
});

const VARGA_I18N: Record<number, {
  en: { name: string; desc: string };
  gu: { name: string; desc: string };
}> = {
  1: { en: { name: 'Lagna / Rashi Chart', desc: 'Overall life, physical constitution, appearance, health & core nature' }, gu: { name: 'લગ્ન ચક્ર (Lagna / Rashi)', desc: 'સંપૂર્ણ જીવન, શારીરિક બાંધો, દેહ, રૂપ, સ્વાસ્થ્ય અને મૂળ સ્વભાવ' } },
  2: { en: { name: 'Hora Chart', desc: 'Wealth, treasury, financial prosperity, speech & ancestral assets' }, gu: { name: 'હોરા ચક્ર (Hora)', desc: 'ધન-સંપત્તિ, કોષ, આર્થિક સમૃદ્ધિ, વાણી અને પૈતૃક સંપત્તિ' } },
  3: { en: { name: 'Drekkana Chart', desc: 'Siblings, courage, valor, enterprise & 3rd-house results' }, gu: { name: 'દ્રેષ્કાણ ચક્ર (Drekkana)', desc: 'સહોદર (ભાઈ-બહેન), પરાક્રમ, સાહસ, શૌર્ય અને તૃતીય ભાવ ફળ' } },
  4: { en: { name: 'Chaturthamsha Chart', desc: 'Fortune, immovable property, land, home, vehicles & comforts' }, gu: { name: 'ચતુર્થાંશ ચક્ર (Chaturthamsha)', desc: 'ભાગ્ય, સ્થાયી સંપત્તિ, ભૂમિ, મકાન, વાહન અને સુખ સાધન' } },
  5: { en: { name: 'Panchamsha Chart', desc: 'Spiritual aura, radiance, fame & subtle progeny strength' }, gu: { name: 'પંચાંશ ચક્ર (Panchamsha)', desc: 'આધ્યાત્મિક આભા, તેજ, પ્રસિદ્ધિ અને સંતાન સૂક્ષ્મ શક્તિ' } },
  6: { en: { name: 'Shashtamsha Chart', desc: 'Illness, debts, enemies, obstacles & health protection' }, gu: { name: 'ષષ્ઠાંશ ચક્ર (Shashtamsha)', desc: 'રોગ, ઋણ, શત્રુ, અવરોધો અને સ્વાસ્થ્ય રક્ષણ' } },
  7: { en: { name: 'Saptamsha Chart', desc: 'Children, progeny happiness, lineage growth & 5th-house results' }, gu: { name: 'સપ્તમાંશ ચક્ર (Saptamsha)', desc: 'સંતાન, સંતતિ સુખ, વંશ વૃદ્ધિ, પૌત્ર-પૌત્રી અને પંચમ ભાવ ફળ' } },
  8: { en: { name: 'Ashtamsha Chart', desc: 'Longevity, occult knowledge, research & sudden crises' }, gu: { name: 'અષ્ટમાંશ ચક્ર (Ashtamsha)', desc: 'દીર્ઘાયુ, ગુપ્ત વિદ્યા, શોધ અને આકસ્મિક સંકટ' } },
  9: { en: { name: 'Navamsha Chart', desc: 'Marriage, spouse, dharma, spiritual strength & subtle fortune' }, gu: { name: 'નવમાંશ ચક્ર (Navamsha)', desc: 'વિવાહ, જીવનસાથી, ધર્મ, આધ્યાત્મિક સામર્થ્ય અને ભાગ્યની સૂક્ષ્મતા' } },
  10: { en: { name: 'Dashamsha Chart', desc: 'Career, profession, status, business, fame & rise in work' }, gu: { name: 'દશમાંશ ચક્ર (Dashamsha)', desc: 'આજીવિકા, કર્મ, પદ-પ્રતિષ્ઠા, વ્યવસાય, યશ અને કારકિર્દી ઉત્થાન' } },
  11: { en: { name: 'Rudramsha (D11)', desc: 'Special gains, victory, prosperity & accomplishment' }, gu: { name: 'એકાદશાંશ / રુદ્રાંશ (Rudramsha)', desc: 'વિશિષ્ટ લાભ, વિજય, ઐશ્વર્ય અને કાર્ય સિદ્ધિ' } },
  12: { en: { name: 'Dwadashamsha Chart', desc: 'Parents, ancestors, lineage traditions & past-life merit' }, gu: { name: 'દ્વાદશાંશ ચક્ર (Dwadashamsha)', desc: 'માતા-પિતા, પૂર્વજ, પૈતૃક સંસ્કાર, વંશ પરંપરા અને પૂર્વ પુણ્ય' } },
  16: { en: { name: 'Shodashamsha Chart', desc: 'Vehicles, luxuries, inner joy, accident protection & grandeur' }, gu: { name: 'ષોડશાંશ ચક્ર (Shodashamsha)', desc: 'વાહન સુખ, સુખ-સાધન, આંતરિક આનંદ, અકસ્માત રક્ષા અને વૈભવ' } },
  20: { en: { name: 'Vimshamsha Chart', desc: 'Spiritual sadhana, worship, mantra siddhi, bhakti & self-knowledge' }, gu: { name: 'વિંશાંશ ચક્ર (Vimshamsha)', desc: 'આધ્યાત્મિક સાધના, ઉપાસના, મંત્ર સિદ્ધિ, ભક્તિ અને આત્મજ્ઞાન' } },
  24: { en: { name: 'Chaturvimshamsha (Siddhamsa)', desc: 'Higher education, intellect, research, scholarship & mastery' }, gu: { name: 'ચતુર્વિંશાંશ ચક્ર (Siddhamsa)', desc: 'ઉચ્ચ વિદ્યા, જ્ઞાન, બુદ્ધિ, સંશોધન, પાંડિત્ય અને શાસ્ત્રીય સિદ્ધિ' } },
  27: { en: { name: 'Saptavimshamsha (Bhamsha)', desc: 'Physical & mental stamina, resilience, strength & patience' }, gu: { name: 'સપ્તવિંશાંશ ચક્ર (Bhamsha)', desc: 'શારીરિક અને માનસિક બળ, સહનશક્તિ, બળ-નિર્બળતા અને ધૈર્ય' } },
  28: { en: { name: 'Brahmamsha Chart', desc: 'Brahma Vidya, accumulated prarabdha & liberation practice' }, gu: { name: 'બ્રહ્માંશ ચક્ર (Brahmamsha)', desc: 'બ્રહ્મ જ્ઞાન, પૂર્વ સંચિત પ્રારબ્ધ અને મોક્ષ સાધના' } },
  30: { en: { name: 'Trimshamsha Chart', desc: 'Misfortunes, accidents, malefic influences & dosha remedies' }, gu: { name: 'ત્રિંશાંશ ચક્ર (Trimshamsha)', desc: 'અરિષ્ટ, અકસ્માત, પાપ પ્રભાવ, આપત્તિઓ અને દોષ નિવારણ' } },
  40: { en: { name: 'Khavedamsha Chart', desc: 'Auspicious & inauspicious karmic fruits & subtle past deeds' }, gu: { name: 'ખવેદાંશ ચક્ર (Khavedamsha)', desc: 'વિશિષ્ટ શુભ-અશુભ કર્મફળ, સૂક્ષ્મ પ્રારબ્ધ અને પૂર્વ કર્મ ફળ' } },
  45: { en: { name: 'Akshavedamsha Chart', desc: 'Character, conduct, moral values, purity & spiritual strength' }, gu: { name: 'અક્ષવેદાંશ ચક્ર (Akshavedamsha)', desc: 'ચરિત્ર, આચરણ, નૈતિક સંસ્કાર, શુદ્ધિ અને આત્મિક બળ' } },
  54: { en: { name: 'Chatuhpanchashadamsha (D54)', desc: 'Subtle Daivagya results & Parashari divisional energy' }, gu: { name: 'ચતુઃપંચાશદંશ ચક્ર (D54)', desc: 'વિશિષ્ટ સૂક્ષ્મ દૈવજ્ઞ ફળ અને પરાશરીય ઊર્જા' } },
  60: { en: { name: 'Shashtiamsha Chart', desc: 'Past-life accumulated karma, deep prarabdha & supreme key of destiny' }, gu: { name: 'ષષ્ટ્યંશ ચક્ર (Shashtiamsha)', desc: 'પૂર્વજન્મ સંચિત કર્મ, ગહન પ્રારબ્ધ અને સંપૂર્ણ ફલિતની સર્વોચ્ચ કૂંચી' } },
};

export function getLocalizedVarga(v: VargaDef, lang: string = 'hi'): { name: string; desc: string; shortName: string } {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  if (c === 'en') {
    const loc = VARGA_I18N[v.division]?.en;
    if (loc) return { ...loc, shortName: loc.name.split(' ')[0] };
    return {
      name: `${v.code} Subtle Divisional Chart`,
      desc: `Division 1/${v.division} part — subtle astrological calculation`,
      shortName: v.code,
    };
  }
  if (c === 'gu') {
    const loc = VARGA_I18N[v.division]?.gu;
    if (loc) return { ...loc, shortName: loc.name.split(' ')[0] };
    return {
      name: `${v.code} સૂક્ષ્મ વર્ગીય ચક્ર`,
      desc: `વિભાજન 1/${v.division} અંશ — સૂક્ષ્મ જ્યોતિષીય ગણના`,
      shortName: v.code,
    };
  }
  return { name: v.name, desc: v.desc, shortName: v.name.split(' ')[0] };
}

interface KundaliViewProps {
  activeKundali: KundaliData | null;
  setActiveKundali: (k: KundaliData) => void;
  currentLocation: SavedLocation;
  onOpenSavedModal: () => void;
  onOpenUmaModal?: () => void;
  onOpenBrandingModal?: () => void;
  onNavigateTab?: (tab: string) => void;
  initialSubTab?: 'chart' | 'dasha' | 'milan' | 'prashna' | 'remedies' | 'phalit' | 'sadesati';
}

export const KundaliView: React.FC<KundaliViewProps> = ({
  activeKundali,
  setActiveKundali,
  currentLocation,
  onOpenSavedModal,
  onOpenUmaModal,
  onOpenBrandingModal,
  onNavigateTab,
  initialSubTab,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const langCode = (language || 'hi').slice(0, 2).toLowerCase();
  const L = (hi: string, en: string, gu: string) =>
    langCode === 'en' ? en : langCode === 'gu' ? gu : hi;
  // Active Sub-Tab
  const [kundaliTab, setKundaliTab] = useState<'chart' | 'cosmic_3d' | 'dasha' | 'milan' | 'prashna' | 'remedies' | 'phalit' | 'sadesati' | 'kp_ashtakvarga'>(
    initialSubTab || 'chart'
  );

  useEffect(() => {
    if (initialSubTab) {
      setKundaliTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    const onSettings = () => {
      if (!activeKundali) return;
      setActiveKundali(
        calculateKundali(
          activeKundali.name,
          activeKundali.birthDate,
          activeKundali.birthTime,
          activeKundali.birthPlace,
          activeKundali.latitude,
          activeKundali.longitude,
          activeKundali.timezoneHours,
        ),
      );
    };
    window.addEventListener("shakti-calc-settings", onSettings);
    return () => window.removeEventListener("shakti-calc-settings", onSettings);
  }, [activeKundali, setActiveKundali]);

  // Varga selector state
  const [selectedVarga, setSelectedVarga] = useState<number>(10);
  const [chartViewMode, setChartViewMode] = useState<'twin' | 'shodashvarga'>('twin');
  const [chartSubPage, setChartSubPage] = useState<'twin' | 'planets' | 'vargas'>('twin');
  const [vargaViewType, setVargaViewType] = useState<'priority_analysis' | 'explorer'>('explorer');
  const [milanSubPage, setMilanSubPage] = useState<'score' | 'ashtakoot' | 'manglik'>('score');
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [vargaListFilter, setVargaListFilter] = useState<'shodash' | 'all60'>('all60');
  const [dashaSystemTab, setDashaSystemTab] = useState<'vimshottari' | 'jaimini'>('vimshottari');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Kundali Input Form State — empty until the user enters a real native
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [formGotra, setFormGotra] = useState<string>('kashyapa');
  const [selectedCity, setSelectedCity] = useState<SavedLocation>(() => currentLocation || DEFAULT_LOCATION);
  const [boyCity, setBoyCity] = useState<SavedLocation>(() => currentLocation || DEFAULT_LOCATION);
  const [girlCity, setGirlCity] = useState<SavedLocation>(() => currentLocation || DEFAULT_LOCATION);
  const [cityPickerTarget, setCityPickerTarget] = useState<'main' | 'boy' | 'girl'>('main');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main' | 'boy' | 'girl'>('main');

  // Synchronize form inputs if activeKundali changes
  useEffect(() => {
    if (activeKundali) {
      setName(activeKundali.name);
      if (activeKundali.gotra) {
        setFormGotra(activeKundali.gotra);
      }
      const { y, m, d } = extractCalendarYMD(activeKundali.birthDate);
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      setDob(`${y}-${mm}-${dd}`);
      const normTob = toTimeInput24h(activeKundali.birthTime) || activeKundali.birthTime;
      setTob(normTob);
      const coords = resolveBirthCoordinates(
        activeKundali.birthPlace,
        activeKundali.latitude,
        activeKundali.longitude,
        activeKundali.timezoneHours
      );
      setSelectedCity({
        name: activeKundali.birthPlace,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timezoneHours: coords.timezoneHours,
        state: selectedCity.state || L('भारत', 'India', 'ભારત'),
        country: L('भारत', 'India', 'ભારત'),
      });

      // Auto-heal if activeKundali has stale Lagna from older calculation
      const freshCheck = calculateKundali(
        activeKundali.name,
        new Date(y, m, d, 12, 0, 0),
        normTob,
        activeKundali.birthPlace,
        coords.latitude,
        coords.longitude,
        coords.timezoneHours
      );
      if (
        activeKundali.lagnaRashiNumber !== freshCheck.lagnaRashiNumber ||
        Math.abs((activeKundali.lagnaDegree || 0) - freshCheck.lagnaDegree) > 0.1
      ) {
        setActiveKundali(freshCheck);
      }
    }
  }, [activeKundali]);

  // 59-Page PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 59,
    message: '',
  });
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<PdfSuccessInfo | null>(null);

  // Ashtakoot Milan Boy & Girl Form
  const [boyName, setBoyName] = useState('');
  const [boyDob, setBoyDob] = useState('');
  const [boyTob, setBoyTob] = useState('');
  const [girlName, setGirlName] = useState('');
  const [girlDob, setGirlDob] = useState('');
  const [girlTob, setGirlTob] = useState('');
  const [isDownloadingMilanPdf, setIsDownloadingMilanPdf] = useState(false);
  const [milanInputMode, setMilanInputMode] = useState<'rashi' | 'dob'>('rashi');
  const [boyRashiIdx, setBoyRashiIdx] = useState<number>(3); // कर्क
  const [boyNakIdx, setBoyNakIdx] = useState<number>(6); // पुनर्वसु
  const [boyCharan, setBoyCharan] = useState<number>(1);
  const [boyIsManglik, setBoyIsManglik] = useState<boolean>(false);
  const [girlRashiIdx, setGirlRashiIdx] = useState<number>(0); // मेष
  const [girlNakIdx, setGirlNakIdx] = useState<number>(1); // भरणी
  const [girlCharan, setGirlCharan] = useState<number>(2);
  const [girlIsManglik, setGirlIsManglik] = useState<boolean>(false);
  const [isGotraModalOpen, setIsGotraModalOpen] = useState(false);
  const [gotraSearchQuery, setGotraSearchQuery] = useState('');
  const [milanPosterData, setMilanPosterData] = useState<ShlokaPosterData | null>(null);
  const [isUpayParchiOpen, setIsUpayParchiOpen] = useState(false);

  const handleLoadSampleMilan = () => {
    setMilanInputMode('dob');
    setBoyName(L('श्री राम', 'Sri Rama', 'શ્રી રામ'));
    setBoyDob('1995-04-12');
    setBoyTob('12:00');
    setGirlName(L('सीता (जानकी)', 'Sita (Janaki)', 'સીતા (જાનકી)'));
    setGirlDob('1997-05-15');
    setGirlTob('08:30');
  };

  // Dasha Drill-down state
  const [inspectedMaha, setInspectedMaha] = useState<string>('');
  const [inspectedAntar, setInspectedAntar] = useState<string>('');
  const [dashaViewLevel, setDashaViewLevel] = useState<'all' | 'maha' | 'antar' | 'pratyantar'>('maha');

  const { status: subStatus } = useLicense();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionReason, setSubscriptionReason] = useState<string>('');

  // Dasha Touch Swipe Gestures for Mobile
  const dashaTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleDashaTouchStart = (e: React.TouchEvent) => {
    dashaTouchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleDashaTouchEnd = (e: React.TouchEvent) => {
    if (!dashaTouchStartRef.current) return;
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - dashaTouchStartRef.current.x;
    const deltaY = touchEnd.clientY - dashaTouchStartRef.current.y;
    dashaTouchStartRef.current = null;

    if (Math.abs(deltaX) >= 35 && Math.abs(deltaX) > Math.abs(deltaY) * 0.7) {
      if (deltaX < 0) {
        // Swiped Left: Advance deeper (Maha -> Antar -> Pratyantar)
        if (dashaViewLevel === 'maha' || dashaViewLevel === 'all') {
          setDashaViewLevel('antar');
        } else if (dashaViewLevel === 'antar') {
          setDashaViewLevel('pratyantar');
        }
      } else {
        // Swiped Right: Return backward (Pratyantar -> Antar -> Maha)
        if (dashaViewLevel === 'pratyantar') {
          setDashaViewLevel('antar');
        } else if (dashaViewLevel === 'antar') {
          setDashaViewLevel('maha');
        }
      }
    }
  };

  const { now: syncedNow, locationNow, ensureServerSyncedDate } = useUserDateTime({
    location: currentLocation,
  });

  // Handle Calculate or Recalculate
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    void ensureServerSyncedDate(false);
    const trimmed = name.trim();
    if (!trimmed || !dob || !tob) {
      setFormError(L(
        'कृपया जातक का नाम, सही जन्म तिथि और जन्म समय भरें। कोई भी पूर्व-भरी कुंडली नहीं चलेगी।',
        'Please enter the native name, valid birth date, and birth time.',
        'કૃપા કરીને જાતકનું નામ, સાચી જન્મ તારીખ અને જન્મ સમય ભરો.'
      ));
      setIsFormExpanded(true);
      return;
    }
    const [y, m, d] = dob.split('-').map(Number);
    if (!y || !m || !d) {
      setFormError(L(
        'जन्म तिथि सही प्रारूप में लिखें।',
        'Please enter the birth date in a valid format.',
        'જન્મ તારીખ યોગ્ય ફોર્મેટમાં લખો.'
      ));
      return;
    }
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);
    if (Number.isNaN(dateObj.getTime()) || y < 1800 || y > 2100) {
      setFormError(L(
        'जन्म तिथि 1800–2100 के बीच होनी चाहिए।',
        'Birth year must be between 1800 and 2100.',
        'જન્મ વર્ષ 1800–2100 ની વચ્ચે હોવું જોઈએ.'
      ));
      return;
    }
    const k = calculateKundali(
      trimmed,
      dateObj,
      tob,
      selectedCity.name,
      selectedCity.latitude,
      selectedCity.longitude,
      selectedCity.timezoneHours,
      formGotra
    );
    setFormError(null);
    setActiveKundali(k);
    saveKundaliProfile(k);
    setSaveSuccessMessage(L(
      `जातक '${trimmed}' की जन्म कुंडली सुरक्षित सहेज ली गई है!`,
      `Birth Kundali for '${trimmed}' has been saved securely!`,
      `જાતક '${trimmed}' ની જન્મ કુંડળી સુરક્ષિત રીતે સાચવવામાં આવી છે!`
    ));
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4000);
    setIsFormExpanded(false);
    setKundaliTab('chart');
  };

  const liveTransitKundali = useMemo(() => {
    return calculateKundali(
      L('तत्काल लग्न कुण्डली (Live)', 'Live Prashna Lagna Chart', 'તત્કાળ લગ્ન કુંડળી (Live)'),
      locationNow.localNoonDate,
      locationNow.timeStr,
      currentLocation.name,
      currentLocation.latitude,
      currentLocation.longitude,
      locationNow.timezoneHours
    );
  }, [currentLocation, locationNow.dateStr, locationNow.timeStr, locationNow.timezoneHours, language]);

  const k = activeKundali || liveTransitKundali;
  const analysis = useMemo(() => (k ? analyzeKundali(k, language) : null), [k, language]);

  // Initialize inspected dasha on active kundali
  useEffect(() => {
    if (k) {
      setInspectedMaha(k.mahadasha);
      setInspectedAntar(k.antardasha);
    }
  }, [k?.mahadasha, k?.antardasha]);

  // Milan calculation
  const milanReady =
    milanInputMode === 'rashi'
      ? true
      : Boolean(boyName.trim() && boyDob && boyTob && girlName.trim() && girlDob && girlTob);

  const boyKundali = milanReady
    ? milanInputMode === 'rashi'
      ? createQuickKundaliFromRashiNakshatra(boyName.trim() || L('वर', 'Groom', 'વર'), boyRashiIdx, boyNakIdx, boyIsManglik, boyCharan, undefined, language)
      : (() => {
          const { y, m, d } = extractCalendarYMD(boyDob);
          return calculateKundali(
            boyName.trim(),
            new Date(y, m, d, 12, 0, 0),
            boyTob,
            boyCity.name,
            boyCity.latitude,
            boyCity.longitude,
            boyCity.timezoneHours
          );
        })()
    : null;

  const girlKundali = milanReady
    ? milanInputMode === 'rashi'
      ? createQuickKundaliFromRashiNakshatra(girlName.trim() || L('कन्या', 'Bride', 'કન્યા'), girlRashiIdx, girlNakIdx, girlIsManglik, girlCharan, undefined, language)
      : (() => {
          const { y, m, d } = extractCalendarYMD(girlDob);
          return calculateKundali(
            girlName.trim(),
            new Date(y, m, d, 12, 0, 0),
            girlTob,
            girlCity.name,
            girlCity.latitude,
            girlCity.longitude,
            girlCity.timezoneHours
          );
        })()
    : null;

  const milanResult = boyKundali && girlKundali ? calculateAshtakootMilan(boyKundali, girlKundali, language) : null;

  // Remedies calculation
  const remedies = useMemo(() => (k ? getVedicRemedies(k, language) : null), [k, language]);

  // त्रिवेणी रत्न शोधन (कुण्डली + अंक ज्योतिष + गोत्र)
  const [selectedGotraId, setSelectedGotraId] = useState<string>(() => k?.gotra || 'kashyapa');
  const [copiedTriveni, setCopiedTriveni] = useState(false);

  useEffect(() => {
    if (k?.gotra) {
      setSelectedGotraId(k.gotra);
    }
  }, [k?.gotra]);

  const triveniResult: TriveniRatnaResult | null = useMemo(() => {
    if (!k) return null;
    return calculateTriveniGemology(k, selectedGotraId, language);
  }, [k, selectedGotraId, language]);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString(langCode === 'en' ? 'en-IN' : langCode === 'gu' ? 'gu-IN' : 'hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const now = syncedNow;
  const currentActiveMahaPeriod =
    k?.dashaPeriods.find((d) => now >= d.startDate && now < d.endDate) || k?.dashaPeriods[0];
  const currentActiveAntarPeriod =
    k?.antarPeriods.find(
      (a) => a.maha === k?.mahadasha && now >= a.startDate && now < a.endDate
    ) || k?.antarPeriods[0];
  const currentActivePratyantarPeriod =
    k?.pratyantarPeriods?.find((p) => now >= p.startDate && now < p.endDate) ||
    k?.pratyantarPeriods?.[0];

  // Currently inspected Mahadasha & Antardasha details
  const currentMahaObj = k?.dashaPeriods.find((d) => d.planet === (inspectedMaha || k?.mahadasha)) || k?.dashaPeriods[0];
  const antarsOfCurrentMaha = k?.antarPeriods.filter((a) => a.maha === currentMahaObj?.planet) || [];
  const currentAntarObj =
    antarsOfCurrentMaha.find((a) => a.antar === (inspectedAntar || k?.antardasha)) || antarsOfCurrentMaha[0];

  // Calculate 9 Pratyantar Periods for current selected Antardasha
  const inspectedPratyantars: DashaPratyantarPeriod[] =
    currentMahaObj && currentAntarObj
      ? calculatePratyantarPeriods(
          currentMahaObj.planet,
          currentAntarObj.antar,
          currentAntarObj.startDate,
          currentAntarObj.endDate
        )
      : [];

  const handleDownloadMilanPdf = async () => {
    if (!boyKundali || !girlKundali || !milanResult) {
      setFormError(L(
        'वर और कन्या दोनों का नाम, जन्म तिथि और समय भरें।',
        'Please enter name, birth date, and time for both groom and bride.',
        'વર અને કન્યા બંનેનું નામ, જન્મ તારીખ અને સમય ભરો.'
      ));
      return;
    }
    try {
      setFormError(null);
      setIsDownloadingMilanPdf(true);
      const res = await downloadMilanBhojpatraPdf({
        boy: boyKundali,
        girl: girlKundali,
        milan: milanResult,
        lang: language,
      });
      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: res.pageCount,
        title: L('भोजपत्र अष्टकूट विवाह मिलान पत्रिका', 'Bhojpatra Ashtakoot Vivah Milan Patrika', 'ભોજપત્ર અષ્ટકૂટ વિવાહ મિલન પત્રિકા'),
      });
    } catch (err: any) {
      console.error('Milan PDF error:', err);
      setFormError(
        L('विवाह मिलान पत्रिका तैयार करने में त्रुटि: ', 'Error preparing Vivah Milan Patrika: ', 'વિવાહ મિલન પત્રિકા તૈયાર કરવામાં ભૂલ: ') +
        (err?.message || L('अज्ञात त्रुटि', 'Unknown error', 'અજ્ઞાત ભૂલ'))
      );
    } finally {
      setIsDownloadingMilanPdf(false);
    }
  };

  const [isGeneratingSinglePdf, setIsGeneratingSinglePdf] = useState(false);

  const handleDownloadSinglePageKundaliPdf = async () => {
    if (!k) {
      setFormError(L(
        'कृपया पहले जन्म विवरण भरकर "कुंडली बनाएँ और सहेजें" पर क्लिक करें।',
        'Please fill birth details first and click "Create & Save Kundali".',
        'કૃપા કરીને પહેલા જન્મ વિગતો ભરીને "કુંડળી બનાવો અને સાચવો" પર ક્લિક કરો.'
      ));
      return;
    }
    try {
      setFormError(null);
      setIsGeneratingSinglePdf(true);
      const birthDateObj = k.birthDate instanceof Date ? k.birthDate : new Date(k.birthDate);
      const panchangData = calculateVedicPanchang(
        birthDateObj,
        k.latitude || 28.6139,
        k.longitude || 77.209
      );

      const res = await downloadBhojpatraPdf({
        title: L(`वैदिक_जन्म_पत्रिका_${k.name}`, `Vedic_Janmapatrika_${k.name}`, `વૈદિક_જન્મ_પત્રિકા_${k.name}`),
        panchang: panchangData,
        query: L(
          `${k.name} की जन्म कुंडली — लग्न, ग्रह, दशा व फलादेश`,
          `Birth Kundali of ${k.name} — Lagna, Planets, Dasha & Predictions`,
          `${k.name} ની જન્મ કુંડળી — લગ્ન, ગ્રહ, દશા અને ફળાદેશ`
        ),
        answer: professionalPdfAnswer(k, language),
        activeKundali: k,
        locationName: k.birthPlace,
        date: birthDateObj,
        lang: language,
      });

      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: 1,
        title: L(`त्वरित 1-पृष्ठीय जन्मपत्रिका (${k.name})`, `Quick 1-Page Janmapatrika (${k.name})`, `ઝડપી ૧-પૃષ્ઠીય જન્મપત્રિકા (${k.name})`),
      });
    } catch (err: any) {
      console.error('1-Page PDF error:', err);
      setFormError(
        L('1-पृष्ठीय पत्रिका तैयार करने में त्रुटि: ', 'Error preparing 1-Page Patrika: ', '૧-પૃષ્ઠીય પત્રિકા તૈયાર કરવામાં ભૂલ: ') +
        (err?.message || L('अज्ञात त्रुटि', 'Unknown error', 'અજ્ઞાત ભૂલ'))
      );
    } finally {
      setIsGeneratingSinglePdf(false);
    }
  };

  const handleDownload59PagePdf = async () => {
    if (!k) {
      setFormError(L(
        'कृपया पहले जन्म विवरण भरकर "कुंडली बनाएँ और सहेजें" पर क्लिक करें।',
        'Please fill birth details first and click "Create & Save Kundali".',
        'કૃપા કરીને પહેલા જન્મ વિગતો ભરીને "કુંડળી બનાવો અને સાચવો" પર ક્લિક કરો.'
      ));
      return;
    }
    try {
      setFormError(null);
      setIsGeneratingPdf(true);
      setPdfProgress({
        current: 1,
        total: 59,
        message: L('सम्पूर्ण 59-पृष्ठीय महा-जन्मपत्रिका तैयार की जा रही है...', 'Preparing exhaustive 59-page Maha-Janmapatrika...', 'સંપૂર્ણ ૫૯-પૃષ્ઠીય મહા-જન્મપત્રિકા તૈયાર થઈ રહી છે...'),
      });
      const res = await generateExhaustive59PageKundaliPdf(
        k,
        (cur, tot, msg) => {
          setPdfProgress({ current: cur, total: tot, message: msg });
        },
        language
      );
      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: res.pageCount,
        title: L(
          `सम्पूर्ण 59-पृष्ठीय महा-जन्मपत्रिका (${k.name})`,
          `Complete 59-Page Maha-Janmapatrika (${k.name})`,
          `સંપૂર્ણ ૫૯-પૃષ્ઠીય મહા-જન્મપત્રિકા (${k.name})`
        ),
      });
    } catch (err: any) {
      console.error('59-Page PDF Error:', err);
      setFormError(
        L('59-पृष्ठीय महा-पत्रिका तैयार करने में त्रुटि: ', 'Error preparing 59-Page Maha-Patrika: ', '૫૯-પૃષ્ઠીય મહા-પત્રિકા તૈયાર કરવામાં ભૂલ: ') +
        (err?.message || L('अज्ञात त्रुटि', 'Unknown error', 'અજ્ઞાત ભૂલ'))
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const jumpToActiveDasha = () => {
    if (k) {
      setInspectedMaha(k.mahadasha);
      setInspectedAntar(k.antardasha);
    }
  };

  const selectedVargaObj =
    ALL_D1_TO_D60_VARGAS.find((v) => v.division === selectedVarga) || ALL_D1_TO_D60_VARGAS[0];
  const selectedVargaLoc = getLocalizedVarga(selectedVargaObj, language);

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
      {/* 59-Page PDF Generating Progress Overlay Modal */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#B56A00]/20 border-2 border-[#B56A00] flex items-center justify-center mx-auto text-[#B56A00]">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="font-bold text-lg font-granth text-[#5C3A21]">
              {L('॥ सम्पूर्ण 59-पृष्ठीय महा-जन्मपत्रिका तैयार हो रही है ॥', 'Preparing Complete 59-Page Maha-Janmapatrika', '॥ સંપૂર્ણ ૫૯-પૃષ્ઠીય મહા-જન્મપત્રિકા તૈયાર થઈ રહી છે ॥')}
            </h3>
            <p className="text-xs text-[#735133] leading-relaxed">
              {L(
                'कृपया कुछ क्षण प्रतीक्षा करें। सभी 16 षोडशवर्ग चक्र, 120 वर्षीय विंशोत्तरी दशाएं, योग, गोचर एवं विस्तृत वैदिक फलादेश उच्च रिज़ॉल्यूशन में संकलित हो रहे हैं।',
                'Please wait a moment. All 16 Shodashvarga charts, 120-year Vimshottari Dashas, Yogas, Gochar & detailed Vedic predictions are being compiled in high resolution.',
                'કૃપા કરીને થોડી ક્ષણ રાહ જુઓ. બધા ૧૬ ષોડશવર્ગ ચક્ર, ૧૨૦ વર્ષીય વિંશોત્તરી દશાઓ, યોગ, ગોચર અને વિસ્તૃત વૈદિક ફળાદેશ ઉચ્ચ રિઝોલ્યુશનમાં સંકલિત થઈ રહ્યા છે.'
              )}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-[#E5D2B8] rounded-full h-3 overflow-hidden border border-[#8C6239]/40">
              <div
                className="bg-gradient-to-r from-[#8B1E1E] to-[#B56A00] h-full transition-all duration-150"
                style={{ width: `${Math.round((pdfProgress.current / pdfProgress.total) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#5C3A21] px-1">
              <span className="truncate max-w-[240px] text-left">{pdfProgress.message || L('पृष्ठ तैयार हो रहे हैं...', 'Preparing pages...', 'પૃષ્ઠો તૈયાર થઈ રહ્યા છે...')}</span>
              <span className="text-[#B56A00] font-black shrink-0">
                {Math.round((pdfProgress.current / pdfProgress.total) * 100)}% ({pdfProgress.current}/{pdfProgress.total})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global City / Village Location Modal */}
      <LocationModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        currentLocation={
          cityPickerTarget === 'boy'
            ? boyCity
            : cityPickerTarget === 'girl'
              ? girlCity
              : selectedCity
        }
        title={
          cityPickerTarget === 'boy'
            ? L('वर (Boy) का जन्म शहर / स्थान चुनें', 'Select Groom Birth City / Place', 'વર (Boy) નું જન્મ શહેર / સ્થળ પસંદ કરો')
            : cityPickerTarget === 'girl'
              ? L('कन्या (Girl) का जन्म शहर / स्थान चुनें', 'Select Bride Birth City / Place', 'કન્યા (Girl) નું જન્મ શહેર / સ્થળ પસંદ કરો')
              : L('जातक का जन्म शहर / स्थान चुनें', 'Select Native Birth City / Place', 'જાતકનું જન્મ શહેર / સ્થળ પસંદ કરો')
        }
        persistGlobal={cityPickerTarget === 'main'}
        onSelectLocation={(loc) => {
          if (cityPickerTarget === 'boy') {
            setBoyCity(loc);
          } else if (cityPickerTarget === 'girl') {
            setGirlCity(loc);
          } else {
            setSelectedCity(loc);
          }
          setIsCityModalOpen(false);
        }}
      />

      {/* PDF Download and Storage Location Notification Modal */}
      <PdfSuccessModal
        info={pdfSuccessInfo}
        onClose={() => setPdfSuccessInfo(null)}
      />

      {/* Top Input Form & Actions (Hidden on Milan & Prashna tabs so couple/prashna tools are front-and-center) */}
      {kundaliTab !== 'milan' && kundaliTab !== 'prashna' && (!isFormExpanded && k ? (
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 sm:p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#5C3A21] text-[#FFD88A] border border-[#B56A00] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {name.trim() ? name.trim().charAt(0) : 'ॐ'}
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#5C3A21] flex flex-wrap items-center gap-2">
                  <span>{name}</span>
                  <span className="text-[10px] text-[#8C6239] font-semibold">
                    ({dob} • {formatTime12h(tob) || tob})
                  </span>
                  {k && (
                    <>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#5C3A21] text-[#FFD88A] font-bold">
                        {t('kundali.lagna', 'लग्न')} {k.lagnaRashiNumber} • {trRashi(k.lagnaRashi, language)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF2E4] border border-[#8C6239]/40 text-[#7A1D1D] font-bold">
                        {L('गोत्र:', 'Gotra:', 'ગોત્ર:')}{' '}
                        {(() => {
                          const gRaw = GOTRA_LIST.find((g) => g.id === (k.gotra || formGotra)) || GOTRA_LIST[0];
                          return getLocalizedGotra(gRaw, language).name.split(' ')[0];
                        })()}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-[#735133] flex flex-wrap items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#B56A00]" />
                  <span>
                    {selectedCity.name} ({formatCoordLabel(selectedCity.latitude, selectedCity.longitude)} •{' '}
                    {formatUtcOffsetLabel(k?.timezoneHours ?? selectedCity.timezoneHours ?? 5.5)})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsFormExpanded(true)}
                className="px-2.5 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition cursor-pointer"
              >
                {t('kundali.editDetails', 'विवरण बदलें ▼')}
              </button>

              <button
                type="button"
                onClick={handleDownload59PagePdf}
                disabled={isGeneratingPdf || isGeneratingSinglePdf}
                className="px-3 py-1.5 bg-gradient-to-r from-[#8B1E1E] via-[#A84318] to-[#B56A00] hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                title={L('59 पृष्ठीय सम्पूर्ण महा-जन्मपत्रिका PDF डाउनलोड करें', 'Download Complete 59-Page Maha-Janmapatrika PDF', '૫૯ પૃષ્ઠીય સંપૂર્ણ મહા-જન્મપત્રિકા PDF ડાઉનલોડ કરો')}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('kundali.exhaustive59PagePdf', '59-पृष्ठीय महा-पत्रिका (PDF)')}</span>
                <span className="sm:hidden">59-PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSinglePageKundaliPdf}
                disabled={isGeneratingSinglePdf || isGeneratingPdf}
                className="px-2.5 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A] border border-[#B56A00]/80 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                title={L('त्वरित 1-पृष्ठीय भोजपत्र जन्मपत्रिका', 'Quick 1-Page Bhojpatra Janmapatrika', 'ઝડપી ૧-પૃષ્ઠીય ભોજપત્ર જન્મપત્રિકા')}
              >
                {isGeneratingSinglePdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD88A]" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#FFD88A]" />
                )}
                <span>{t('kundali.quick1PagePdf', '1-पृष्ठ PDF')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUpayParchiOpen(true)}
                className="px-2.5 py-1.5 bg-[#FFFDF8] hover:bg-[#FAF2E4] text-[#7A1D1D] border border-[#7A1D1D]/50 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                title={L('पारंपरिक ज्योतिषीय लेटरहेड पर ६-सूत्रीय उपाय पर्ची', '6-Point Upay Parchi on Traditional Astrological Letterhead', 'પરંપરાગત જ્યોતિષીય લેટરહેડ પર ૬-સૂત્રીય ઉપાય ચિઠ્ઠી')}
              >
                <FileText className="w-3.5 h-3.5 text-[#7A1D1D]" />
                <span>📋 {t('common.prescriptionPad', 'उपाय पर्ची')}</span>
              </button>

              <button
                onClick={onOpenSavedModal}
                className="px-2.5 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition cursor-pointer"
              >
                {t('common.saved', 'सहेजे गए')}
              </button>

              {onOpenUmaModal && (
                <button
                  type="button"
                  onClick={onOpenUmaModal}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black text-xs rounded-xl shadow-md border border-amber-300 transition flex items-center gap-1.5 cursor-pointer active:scale-95 uma-glow-badge m3-touch"
                  title={L('उमा - वैदिक दैवज्ञ परामर्श', 'Uma - Vedic Jyotish Consultation', 'ઉમા - વૈદિક દૈવજ્ઞ પરામર્શ')}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                  <span>{t('kundali.umaConsult', 'उमा परामर्श ✨')}</span>
                </button>
              )}

              {/* Annual Subscription Pill */}
              {subStatus.entitled ? (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionReason(L('आपकी वार्षिक सदस्यता सक्रिय है!', 'Your VIP subscription is active!', 'તમારું VIP સબ્સ્ક્રિપ્શન સક્રિય છે!'));
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 text-emerald-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Crown className="w-3 h-3 text-amber-600 fill-current" />
                  <span className="hidden sm:inline">{L(`सक्रिय (${subStatus.daysRemaining} दिन)`, `Active (${subStatus.daysRemaining}d)`, `સક્રિય (${subStatus.daysRemaining} દિવસ)`)}</span>
                  <span className="sm:hidden">{L('सक्रिय', 'Active', 'સક્રિય')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionReason(L(
                      'आजीवन सदस्यता (₹99 / $1) सक्रिय करने पर आप असीमित 59-पृष्ठीय महापत्रिका व कुण्डली PDF डाउनलोड कर सकते हैं।',
                      'Activate Lifetime VIP (₹99 / $1) to download unlimited 59-page Maha-Patrika & Kundali PDFs.',
                      'આજીવન સભ્યપદ (₹99 / $1) સક્રિય કરવાથી તમે અમર્યાદિત ૫૯-પૃષ્ઠીય મહાપત્રિકા અને કુંડળી PDF ડાઉનલોડ કરી શકો છો.'
                    ));
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer animate-pulse"
                >
                  <Lock className="w-3 h-3" />
                  <span>{L('₹99 / $1 आजीवन', '₹99 / $1 Lifetime', '₹99 / $1 આજીવન')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm sm:text-base font-bold font-granth text-[#5C3A21] flex items-center gap-2">
              <User className="w-5 h-5 text-[#B56A00]" />
              {t('kundali.birthDetails', 'जन्म विवरण दर्ज करें (Birth Details)')}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {k && (
                <button
                  type="button"
                  onClick={() => setIsFormExpanded(false)}
                  className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  {t('kundali.collapse', 'संक्षिप्त करें ▲')}
                </button>
              )}

              {k && (
                <>
                  <button
                    type="button"
                    onClick={handleDownload59PagePdf}
                    disabled={isGeneratingPdf || isGeneratingSinglePdf}
                    className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-[#8B1E1E] via-[#A84318] to-[#B56A00] hover:brightness-110 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                    title={L('59 पृष्ठीय सम्पूर्ण महा-जन्मपत्रिका PDF डाउनलोड करें', 'Download Complete 59-Page Maha-Janmapatrika PDF', '૫૯ પૃષ્ઠીય સંપૂર્ણ મહા-જન્મપત્રિકા PDF ડાઉનલોડ કરો')}
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('kundali.exhaustive59PagePdf', 'सम्पूर्ण 59 पृष्ठीय महा-पत्रिका (PDF)')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSinglePageKundaliPdf}
                    disabled={isGeneratingSinglePdf || isGeneratingPdf}
                    className="px-3 py-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A] border border-[#B56A00]/80 text-xs sm:text-sm font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title={L('त्वरित 1-पृष्ठीय भोजपत्र जन्मपत्रिका (1 सेकंड में तैयार)', 'Quick 1-Page Bhojpatra Janmapatrika (Ready in 1 sec)', 'ઝડપી ૧-પૃષ્ઠીય ભોજપત્ર જન્મપત્રિકા (૧ સેકન્ડમાં તૈયાર)')}
                  >
                    {isGeneratingSinglePdf ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFD88A]" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#FFD88A]" />
                    )}
                    <span>{t('kundali.quick1PagePdf', 'त्वरित 1-पृष्ठ पत्रिका (PDF)')}</span>
                  </button>
                </>
              )}

              <button
                onClick={onOpenSavedModal}
                className="px-3 py-2 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                {t('kundali.savedProfiles', 'सहेजे गए प्रोफाइल (History)')}
              </button>

              {onOpenUmaModal && (
                <button
                  type="button"
                  onClick={onOpenUmaModal}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md border border-amber-300 transition flex items-center gap-2 cursor-pointer active:scale-95 uma-glow-badge m3-touch"
                  title={L('उमा (वैदिक एलेक्सा) से परामर्श लें', 'Consult Uma (Vedic Astrologer)', 'ઉમા (વૈદિક જ્યોતિષી) ની સલાહ લો')}
                >
                  <Sparkles className="w-4 h-4 fill-stone-950 text-stone-950" />
                  <span>{t('kundali.umaConsult', 'उमा परामर्श ✨')}</span>
                </button>
              )}

              {/* Annual Subscription Pill */}
              {subStatus.entitled ? (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionReason(L('आपकी वार्षिक सदस्यता सक्रिय है!', 'Your VIP subscription is active!', 'તમારું VIP સબ્સ્ક્રિપ્શન સક્રિય છે!'));
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 text-emerald-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600 fill-current" />
                  <span>{t('kundali.annualVipActive', { days: subStatus.daysRemaining, defaultValue: `वार्षिक सदस्यता सक्रिय (${subStatus.daysRemaining} दिन)` })}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionReason(L(
                      'आजीवन सदस्यता (₹99 / $1) सक्रिय करने पर आप असीमित 59-पृष्ठीय महापत्रिका व कुण्डली PDF डाउनलोड कर सकते हैं।',
                      'Activate Lifetime VIP (₹99 / $1) to download unlimited 59-page Maha-Patrika & Kundali PDFs.',
                      'આજીવન સભ્યપદ (₹99 / $1) સક્રિય કરવાથી તમે અમર્યાદિત ૫૯-પૃષ્ઠીય મહાપત્રિકા અને કુંડળી PDF ડાઉનલોડ કરી શકો છો.'
                    ));
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer animate-pulse"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('kundali.annualVipPrice', 'आजीवन सदस्यता: ₹99 / $1')}</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#8C6239] mb-1">{t('kundali.name', 'जातक का नाम')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] focus:ring-1 focus:ring-[#B56A00] outline-none"
                placeholder={t('kundali.name', 'नाम लिखें')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#8C6239]">{t('kundali.dob', 'जन्म तिथि (DOB)')}</label>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const y = now.getFullYear();
                    const m = String(now.getMonth() + 1).padStart(2, '0');
                    const d = String(now.getDate()).padStart(2, '0');
                    setDob(`${y}-${m}-${d}`);
                  }}
                  className="text-[10px] text-[#B56A00] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Calendar className="w-3 h-3" />
                  <span>{t('common.todayDate', 'आज')}</span>
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={dob}
                  onClick={() => {
                    setPickerTarget('main');
                    setIsDatePickerOpen(true);
                  }}
                  placeholder="YYYY-MM-DD"
                  className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 pr-8 text-xs sm:text-sm font-semibold text-[#5C3A21] focus:ring-1 focus:ring-[#B56A00] outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerTarget('main');
                    setIsDatePickerOpen(true);
                  }}
                  className="absolute right-2 p-1 text-[#8C6239] hover:text-[#5C3A21] cursor-pointer"
                  title={L('कैलेंडर खोलें', 'Open Calendar', 'કેલેન્ડર ખોલો')}
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#8C6239] flex items-center gap-1">
                  <span>{t('kundali.time', 'जन्म समय (Time)')}</span>
                  {tob && (
                    <span className="text-[10px] font-bold text-[#B56A00]">
                      {formatTime12h(tob)}
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const hh = String(now.getHours()).padStart(2, '0');
                    const mm = String(now.getMinutes()).padStart(2, '0');
                    setTob(`${hh}:${mm}`);
                  }}
                  className="text-[10px] text-[#B56A00] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Clock className="w-3 h-3" />
                  <span>{t('common.nowTime', 'अभी')}</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={tob ? `${tob} (${formatTime12h(tob)})` : ''}
                    onClick={() => {
                      setPickerTarget('main');
                      setIsTimePickerOpen(true);
                    }}
                    placeholder="HH:MM (e.g. 09:30)"
                    className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 pr-8 text-xs sm:text-sm font-semibold text-[#5C3A21] focus:ring-1 focus:ring-[#B56A00] outline-none cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPickerTarget('main');
                      setIsTimePickerOpen(true);
                    }}
                    className="absolute right-2 p-1 text-[#8C6239] hover:text-[#5C3A21] cursor-pointer"
                    title={L('समय घड़ी खोलें', 'Open Time Clock', 'સમય ઘડિયાળ ખોલો')}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
                {(() => {
                  const { hours, minutes } = parseTimeString(tob || '12:00');
                  const isPmNow = tob ? hours >= 12 : false;
                  return (
                    <div className="flex rounded-lg border border-[#8C6239]/40 overflow-hidden shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const currentH = tob ? hours : 9;
                          const currentM = tob ? minutes : 0;
                          const nextH = currentH >= 12 ? currentH - 12 : currentH;
                          setTob(`${String(nextH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`);
                        }}
                        className={`px-2 py-2 text-[10px] font-black transition cursor-pointer ${
                          tob && !isPmNow ? 'bg-[#5C3A21] text-[#FFD88A]' : 'bg-[#F4E8D1] text-[#5C3A21]'
                        }`}
                        title={L('प्रातः (AM)', 'Morning (AM)', 'સવાર (AM)')}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const currentH = tob ? hours : 14;
                          const currentM = tob ? minutes : 0;
                          const nextH = currentH < 12 ? currentH + 12 : currentH;
                          setTob(`${String(nextH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`);
                        }}
                        className={`px-2 py-2 text-[10px] font-black transition cursor-pointer ${
                          tob && isPmNow ? 'bg-[#5C3A21] text-[#FFD88A]' : 'bg-[#F4E8D1] text-[#5C3A21]'
                        }`}
                        title={L('दोपहर / सायं / रात्रि (PM)', 'Afternoon / Evening / Night (PM)', 'બપોર / સાંજ / રાત્રિ (PM)')}
                      >
                        PM
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C6239] mb-1 flex items-center justify-between">
                <span>{t('kundali.place', 'जन्म स्थान')}</span>
                <span className="text-[10px] text-[#B56A00] font-normal">{t('common.search', 'खोजें')}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setCityPickerTarget('main');
                  setIsCityModalOpen(true);
                }}
                className="w-full bg-[#F4E8D1] hover:bg-[#EBDBC0] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] flex items-center justify-between transition text-left cursor-pointer"
              >
                <span className="truncate flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#B56A00] shrink-0" />
                  <span className="truncate">{selectedCity.name}</span>
                </span>
                <span className="text-[11px] text-[#B56A00] underline shrink-0 font-bold ml-1">{t('common.select', 'स्थान बदलें')}</span>
              </button>
            </div>

            {/* गोत्र चयन (Gotra Selector for Triveni Gemology & Shodhan) */}
            <div>
              <label className="block text-xs font-bold text-[#7A1D1D] mb-1 flex items-center justify-between">
                <span>{L('जातक का गोत्र (Gotra)', 'Native Gotra', 'જાતકનું ગોત્ર (Gotra)')}</span>
                <span className="text-[10px] text-[#B56A00] font-semibold">{L('त्रिवेणी शोधन', 'Triveni Shodhan', 'ત્રિવેણી શોધન')}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsGotraModalOpen(true)}
                className="w-full bg-[#F4E8D1] hover:bg-[#EBDBC0] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] flex items-center justify-between transition text-left cursor-pointer"
              >
                <span className="truncate flex items-center gap-1.5 font-bold text-[#5C3A21]">
                  <span>🪷</span>
                  <span className="truncate">
                    {(() => {
                      const gRaw = GOTRA_LIST.find((g) => g.id === formGotra) || GOTRA_LIST[0];
                      return getLocalizedGotra(gRaw, language).name;
                    })()}
                  </span>
                </span>
                <span className="text-[11px] text-[#B56A00] underline shrink-0 font-bold ml-1">{L('गोत्र चुनें ▾', 'Select Gotra ▾', 'ગોત્ર પસંદ કરો ▾')}</span>
              </button>
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex flex-wrap items-center justify-between gap-2 mt-2">
              <div className="text-xs text-[#735133] flex flex-wrap items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>
                  <strong>{selectedCity.name}</strong> ({formatCoordLabel(selectedCity.latitude, selectedCity.longitude)} •{' '}
                  {(() => {
                    const { y, m, d } = extractCalendarYMD(dob || syncedNow);
                    const { hours, minutes } = parseTimeString(tob || '12:00');
                    const resolved = resolveBirthCoordinates(
                      selectedCity.name,
                      selectedCity.latitude,
                      selectedCity.longitude,
                      selectedCity.timezoneHours,
                      { y, m, d, hours, minutes }
                    );
                    return formatUtcOffsetLabel(resolved.timezoneHours);
                  })()}
                  )
                </span>
              </div>

              <div className="flex items-center gap-2 w-full">
                <button
                  type="submit"
                  className="w-full px-6 py-3 min-h-11 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
                >
                  {t('common.createAndSave', 'कुंडली बनाएँ और सहेजें')}
                </button>
              </div>
            </div>
            {formError && (
              <p className="sm:col-span-2 md:col-span-4 text-xs font-bold text-vermilion">{formError}</p>
            )}
          </form>
        </div>
      ))}

      {saveSuccessMessage && (
        <div className="bg-emerald-800 text-white p-3 rounded-xl shadow-md border-2 border-emerald-400 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-emerald-300 text-base">✅</span>
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessMessage(null)}
            className="text-white/80 hover:text-white text-xs px-2 py-0.5 rounded bg-emerald-950/40 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {formError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormError(null)}
            className="text-rose-700 hover:text-rose-950 font-black px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Non-Subscribed Banner Alert */}
      {!subStatus.entitled && (
        <div className="bg-gradient-to-r from-[#8B1E1E] via-[#A84318] to-[#5C3A21] rounded-xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3.5 border-2 border-amber-400/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-xs font-black">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-amber-200">
                {t('common.appName', 'शक्ति पंचांग')} • {t('kundali.annualVipPrice', 'आजीवन VIP सदस्यता (केवल ₹99 / $1)')}
              </div>
              <div className="text-xs text-amber-100/90 mt-0.5">
                {t('kundali.vipRequiredDesc', 'सम्पूर्ण 59-पृष्ठीय महापत्रिका सचित्र PDF, अष्टकूट विवाह मिलान, एवं सूक्ष्म दशा सेवा हेतु आजीवन सदस्यता प्राप्त करें।')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubscriptionReason(L(
                'सम्पूर्ण कुण्डली सेवा एवं 59-पृष्ठीय महापत्रिका सचित्र PDF डाउनलोड करने के लिए केवल ₹99 / $1 की आजीवन सदस्यता प्राप्त करें।',
                'Get Lifetime VIP (just ₹99 / $1) to unlock full Kundali services & 59-page illustrated Maha-Patrika PDF downloads.',
                'સંપૂર્ણ કુંડળી સેવા અને ૫૯-પૃષ્ઠીય મહાપત્રિકા સચિત્ર PDF ડાઉનલોડ કરવા માટે ફક્ત ₹99 / $1 ની આજીવન સભ્યપદ મેળવો.'
              ));
              setIsSubscriptionModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-xs sm:text-sm rounded-lg shadow-md transition cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4" />
            <span>{t('kundali.unlockWithVip', '₹99 / $1 में आजीवन अनलॉक करें')}</span>
          </button>
        </div>
      )}

      {!k && kundaliTab !== 'milan' && kundaliTab !== 'prashna' && (
        <div className="bg-parchment border border-wood/40 rounded-xl p-6 text-center space-y-2">
          <User className="w-8 h-8 text-gold mx-auto" />
          <h3 className="font-granth font-bold text-temple text-base">{t('kundali.noKundaliYet', 'नई कुंडली — कोई पूर्व-भरा जातक नहीं')}</h3>
          <p className="text-sm text-muted leading-relaxed">
            {L(
              'नाम, जन्म तिथि, समय और स्थान भरकर नीचे “कुंडली बनाएँ और सहेजें” दबाएँ।',
              'Enter name, birth date, time and place, then tap "Create & Save Kundali".',
              'નામ, જન્મ તારીખ, સમય અને સ્થળ ભરીને નીચે "કુંડળી બનાવો અને સાચવો" દબાવો.'
            )}
          </p>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <CalcSettingsPanel compact />
      <div className="grid grid-cols-2 gap-2 pb-16">
        {[
          { id: 'phalit', label: t('kundali.tabPhalit', 'फलादेश'), icon: Sparkles },
          { id: 'chart', label: t('kundali.tabCharts', 'वर्ग चक्र D1–D60'), icon: Layers },
          { id: 'cosmic_3d', label: t('kundali.tabCosmic3D', '3D कुंडली'), icon: Compass },
          { id: 'dasha', label: t('kundali.tabDasha', 'विंशोत्तरी दशा'), icon: Clock },
          { id: 'milan', label: t('kundali.tabMilan', 'कुंडली मिलान'), icon: Heart },
          { id: 'sadesati', label: t('kundali.tabSadeSati', 'साढ़े साती'), icon: Compass },
          { id: 'kp_ashtakvarga', label: t('kundali.tabKp', 'केपी व अष्टकवर्ग'), icon: Zap },
          { id: 'prashna', label: t('kundali.tabPrashna', 'प्रश्न कुंडली'), icon: HelpCircle },
          { id: 'remedies', label: t('kundali.tabRemedies', 'वैदिक उपाय व रत्न'), icon: Shield },
        ].map((tab, idx) => {
          const Icon = tab.icon;
          const isSel = kundaliTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 26,
                delay: idx * 0.02,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setKundaliTab(tab.id as any)}
              className={`flex items-center gap-2 min-w-0 overflow-hidden px-3 py-3 text-left text-xs font-bold rounded-2xl border cursor-pointer transition-colors ${
                isSel
                  ? 'bg-[#5C3A21] text-[#FAF2E4] border-[#5C3A21] shadow-xs'
                  : 'bg-[#FAF2E4] text-[#5C3A21] border-[#8C6239]/35 hover:border-[#8C6239]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isSel ? 'text-[#FFD88A]' : 'text-[#B56A00]'}`} />
              <span className="min-w-0 truncate">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab: chart-specific professional phaladesh */}
      {kundaliTab === 'phalit' && k && analysis && (
        <div className="space-y-4">
          <div className="bg-parchment border border-wood/40 rounded-xl p-4 space-y-2">
            <h3 className="font-granth font-bold text-temple">
              {t('kundali.nativeSummary', 'इस जातक का सार')} — {k.name}
            </h3>
            {analysis.summaryLines.map((line) => (
              <p key={line} className="text-sm text-ink leading-relaxed">{line}</p>
            ))}
            <p className="text-sm text-muted leading-relaxed">{analysis.dashaNarrative}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.areas.map((area) => (
              <article key={area.id} className="bg-parchment border border-wood/30 rounded-xl p-4 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-temple">{area.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                    (area.strengthKey === 'high' || area.strength === 'उच्च')
                      ? 'bg-leaf text-temple'
                      : (area.strengthKey === 'caution' || area.strength === 'सावधानी')
                        ? 'bg-vermilion/15 text-vermilion'
                        : 'bg-sand text-temple'
                  }`}>{area.strength}</span>
                </div>
                <p className="text-sm text-ink leading-relaxed"><span className="font-bold">{t('kundali.finding', 'निष्कर्ष')}: </span>{area.finding}</p>
                <p className="text-xs text-muted leading-relaxed"><span className="font-bold">{t('kundali.basis', 'कारण')}: </span>{area.why}</p>
                <p className="text-xs text-muted"><span className="font-bold">{t('kundali.timing', 'समय')}: </span>{area.timing}</p>
                <p className="text-xs text-ink"><span className="font-bold">{t('kundali.caution', 'सावधानी')}: </span>{area.caution}</p>
                <p className="text-xs text-temple"><span className="font-bold">{t('kundali.remedy', 'उपाय')}: </span>{area.remedy}</p>
              </article>
            ))}
          </div>

          <div className="bg-parchment border border-wood/40 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-sm text-temple">{t('kundali.yogas', 'योग')}</h4>
            {analysis.yogas.map((y) => <p key={y} className="text-sm text-ink leading-relaxed">• {y}</p>)}
            <h4 className="font-bold text-sm text-temple pt-2">{t('kundali.doshas', 'दोष विचार')}</h4>
            {analysis.doshas.map((y) => <p key={y} className="text-sm text-ink leading-relaxed">• {y}</p>)}
          </div>
        </div>
      )}

      {kundaliTab === 'phalit' && !k && (
        <p className="text-sm text-muted p-4">{t('kundali.createKundaliFirst', 'फलादेश के लिए पहले जन्म विवरण भरकर कुंडली बनाएँ।')}</p>
      )}

      {/* Tab: 3D Cosmic Kundali & UMA Sync (Zero Data Loss Architecture) */}
      {kundaliTab === 'cosmic_3d' && k && (
        <Vedic3DKundaliView
          kundali={k}
          currentLocationName={currentLocation.name}
          latitude={currentLocation.latitude}
          longitude={currentLocation.longitude}
        />
      )}

      {/* Tab 1: Charts & Shodashvarga (D1 to D60) */}
      {kundaliTab === 'chart' && k && (
        <div className="space-y-6">
          {/* Key Attributes Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">{t('kundali.lagna', 'लग्न')}</div>
              <div className="text-sm font-black text-[#5C3A21]">{trRashi(k.lagnaRashi, language)} ({k.lagnaDegree.toFixed(1)}°)</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">{t('kundali.moonSign', 'चंद्र राशि')}</div>
              <div className="text-sm font-black text-[#5C3A21]">{trRashi(k.moonRashi, language)}</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">{t('kundali.nakshatra', 'नक्षत्र')}</div>
              <div className="text-sm font-black text-[#5C3A21]">{trVedic(k.nakshatra, language)} ({k.charan})</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">{t('kundali.ganaNadi', 'गण / नाड़ी')}</div>
              <div className="text-sm font-black text-[#5C3A21]">{trVedic(k.gana, language)} | {trVedic(k.nadi, language)}</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">{t('kundali.yoniVarna', 'योनि / वर्ण')}</div>
              <div className="text-sm font-black text-[#5C3A21]">{trVedic(k.yoni, language)} | {trVedic(k.varna, language)}</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">{t('kundali.currentMicroDasha', 'वर्तमान सूक्ष्म दशा')}</div>
              <div className="text-xs sm:text-sm font-black text-[#B56A00] truncate">
                {trPlanet(k.mahadasha, language)} / {trPlanet(k.antardasha, language)} / {trPlanet(k.pratyantardasha, language)}
              </div>
              <div className="text-[9px] text-[#735133] mt-0.5">{t('kundali.mahaAntarPratyantar', 'महा / अंतर / प्रत्यंतर')}</div>
            </div>
          </div>

          {/* Sub-Pages Segmented Bar for Chart Tab */}
          <div className="flex items-center justify-between gap-1 p-1 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
            {[
              { id: 'twin', label: t('kundali.page1D1D9', '१. लग्न व नवमांश'), full: t('kundali.page1D1D9Full', 'पृष्ठ १: लग्न (D1) व नवमांश (D9) चक्र') },
              { id: 'planets', label: t('kundali.page2Planets', '२. ग्रह स्पष्ट तालिका'), full: t('kundali.page2PlanetsFull', 'पृष्ठ २: ग्रह स्थिति एवं स्पष्ट तालिका') },
              { id: 'vargas', label: t('kundali.page3Vargas', '३. षोडशवर्ग (D1-D60)'), full: t('kundali.page3VargasFull', 'पृष्ठ ३: सम्पूर्ण षोडशवर्ग (D1 से D60)') },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setChartSubPage(sp.id as any)}
                className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded-lg transition cursor-pointer ${
                  chartSubPage === sp.id
                    ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                    : 'text-[#8C6239] hover:bg-[#F4E8D1]'
                }`}
              >
                <span className="sm:hidden">{sp.label}</span>
                <span className="hidden sm:inline">{sp.full}</span>
              </button>
            ))}
          </div>

          {/* Sub-Page 1: Twin View (D1 + D9 Side-by-side) */}
          {chartSubPage === 'twin' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* D1 Lagna */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-[#5C3A21] uppercase tracking-wider">
                      {t('kundali.d1Title', 'D1 लग्न चक्र (Lagna Rashi Chart)')}
                    </span>
                    <span className="text-[11px] text-[#8C6239] font-medium">{t('kundali.d1Subtitle', 'सम्पूर्ण देह व भौतिक जीवन')}</span>
                  </div>
                  <KundaliChart
                    lagnaDegree={k.lagnaDegree}
                    planets={k.planets}
                    vargaDivision={1}
                    chartTitle={`${k.name} — ${t('kundali.d1Title', 'लग्न चक्र (D1)')}`}
                  />
                </div>

                {/* D9 Navamsha */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-[#5C3A21] uppercase tracking-wider">
                      {t('kundali.d9Title', 'D9 नवमांश चक्र (Navamsha Chart)')}
                    </span>
                    <span className="text-[11px] text-[#8C6239] font-medium">{t('kundali.d9Subtitle', 'भाग्य, विवाह व सूक्ष्म सामर्थ्य')}</span>
                  </div>
                  <KundaliChart
                    lagnaDegree={k.lagnaDegree}
                    planets={k.planets}
                    vargaDivision={9}
                    chartTitle={`${k.name} — ${t('kundali.d9Title', 'नवमांश चक्र (D9)')}`}
                  />
                </div>
              </div>

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-[#8C6239]">{t('kundali.page1of3', 'पृष्ठ 1 / 3 (लग्न व नवमांश चक्र)')}</div>
                <button
                  type="button"
                  onClick={() => setChartSubPage('planets')}
                  className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('kundali.page2Planets', 'अगला: २. ग्रह स्पष्ट तालिका')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sub-Page 2: Planetary Ephemeris Table */}
          {chartSubPage === 'planets' && (
            <div className="space-y-4">
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>{t('kundali.planetsPositions', 'ग्रह स्थिति, स्पष्ट अंश एवं भाव विवरण (Planetary Ephemeris)')}</span>
                  <span className="text-[10px] text-[#FFD88A]">{k.planets.length} {L('ग्रह स्थिति', 'Planetary Positions', 'ગ્રહ સ્થિતિ')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30">
                      <tr>
                        <th className="py-2.5 px-3">{t('kundali.planet', 'ग्रह')}</th>
                        <th className="py-2.5 px-3">{t('kundali.rashi', 'राशि')}</th>
                        <th className="py-2.5 px-3">{t('kundali.house', 'भाव')}</th>
                        <th className="py-2.5 px-3">{t('kundali.degrees', 'अंश (Deg)')}</th>
                        <th className="py-2.5 px-3">{t('kundali.nakshatraPada', 'नक्षत्र व चरण')}</th>
                        <th className="py-2.5 px-3">{t('kundali.state', 'गति')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8C6239]/20">
                      {k.planets.map((p, idx) => (
                        <tr key={idx} className="hover:bg-[#F4E8D1]/60">
                          <td className="py-2 px-3 font-bold text-[#5C3A21]">
                            {langCode === 'en' ? trPlanet(p.planet, language) : `${trPlanet(p.planet, language)} (${p.englishName})`}
                          </td>
                          <td className="py-2 px-3 text-[#5C3A21]">{trRashi(p.rashi, language)}</td>
                          <td className="py-2 px-3 font-bold text-[#B56A00]">{p.house}</td>
                          <td className="py-2 px-3 text-[#5C3A21]">
                            {p.degreeInRashi.toFixed(2)}°
                          </td>
                          <td className="py-2 px-3 text-[#5C3A21]">
                            {trVedic(p.nakshatra, language)} ({L('चरण', 'Pada', 'ચરણ')} {p.pada})
                          </td>
                          <td className="py-2 px-3">
                            {p.isRetrograde ? (
                              <span className="text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                                {L('वक्री (R)', 'Retrograde (R)', 'વક્રી (R)')}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-medium text-[10px]">{L('मार्गी', 'Direct', 'માર્ગી')}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setChartSubPage('twin')}
                  className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{t('kundali.page1D1D9', 'पिछला: १. लग्न व नवमांश')}</span>
                </button>
                <div className="text-xs font-bold text-[#8C6239]">{t('kundali.page2of3', 'पृष्ठ 2 / 3')}</div>
                <button
                  type="button"
                  onClick={() => setChartSubPage('vargas')}
                  className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('kundali.page3Vargas', 'अगला: ३. षोडशवर्ग (D1-D60)')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sub-Page 3: Shodashvarga Explorer (D1 to D60) */}
          {chartSubPage === 'vargas' && (
            <div className="space-y-4">
              {/* Primary Varga View Selector */}
              <div className="flex flex-wrap items-center p-1 bg-[#462B17] rounded-xl text-xs font-bold border border-[#8C6239]/60 gap-1">
                <button
                  type="button"
                  onClick={() => setVargaViewType('priority_analysis')}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer min-w-[180px] ${
                    vargaViewType === 'priority_analysis'
                      ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
                      : 'text-[#E5D2B8] hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#B56A00]" />
                  <span>{L('⭐ विशेष वर्ग विश्लेषण (D10 करियर, D7 संतान, D3 पराक्रम व वैशेषिकांश)', '⭐ Priority Varga Analysis (D10 Career, D7 Progeny, D3 Valor & Vaisheshikamsha)', '⭐ વિશેષ વર્ગ વિશ્લેષણ (D10 કારકિર્દી, D7 સંતાન, D3 પરાક્રમ અને વૈશેષિકાંશ)')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVargaViewType('explorer')}
                  className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer min-w-[180px] ${
                    vargaViewType === 'explorer'
                      ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
                      : 'text-[#E5D2B8] hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 text-[#B56A00]" />
                  <span>{L('☸️ सम्पूर्ण D1 से D60 वर्गीय चक्र अन्वेषक (Custom Explorer)', '☸️ Full D1 to D60 Divisional Chart Explorer', '☸️ સંપૂર્ણ D1 થી D60 વર્ગીય ચક્ર અન્વેષક')}</span>
                </button>
              </div>

              {/* 1. Priority Analysis Mode */}
              {vargaViewType === 'priority_analysis' && (
                <VargaAnalysisPanel
                  lagnaDegree={k.lagnaDegree}
                  planets={k.planets}
                  nativeName={k.name}
                  selectedVarga={selectedVarga}
                  onSelectVarga={(v) => {
                    setSelectedVarga(v);
                  }}
                />
              )}

              {/* 2. Custom D1-D60 Full Explorer Mode */}
              {vargaViewType === 'explorer' && (
                <div className="space-y-6">
                  {/* Varga Selector (Shodashvarga & D1-D60) */}
                  <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
                      {L('वर्गीय चक्र चयन:', 'Select Divisional Chart:', 'વર્ગીય ચક્ર પસંદગી:')}
                    </span>
                    <div className="inline-flex rounded-lg border border-[#8C6239]/30 p-0.5 bg-[#F4E8D1]">
                      <button
                        type="button"
                        onClick={() => setVargaListFilter('shodash')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                          vargaListFilter === 'shodash'
                            ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                            : 'text-[#5C3A21] hover:bg-[#FAF2E4]'
                        }`}
                      >
                        {L('षोडशवर्ग (16 मुख्य वर्ग)', 'Shodashvarga (16 Core Charts)', 'ષોડશવર્ગ (૧૬ મુખ્ય વર્ગ)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVargaListFilter('all60')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                          vargaListFilter === 'all60'
                            ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                            : 'text-[#5C3A21] hover:bg-[#FAF2E4]'
                        }`}
                      >
                        {L('सम्पूर्ण D1 से D60 चक्र (All 60 Charts)', 'All 60 Divisional Charts (D1–D60)', 'સંપૂર્ણ D1 થી D60 ચક્ર (બધા ૬૦)')}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={selectedVarga <= 1}
                      onClick={() => setSelectedVarga((prev) => Math.max(1, prev - 1))}
                      className="px-2 py-1 bg-[#F4E8D1] hover:bg-[#E5D2B8] disabled:opacity-40 border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded"
                    >
                      {L(`← पिछला (D${Math.max(1, selectedVarga - 1)})`, `← Prev (D${Math.max(1, selectedVarga - 1)})`, `← પાછળ (D${Math.max(1, selectedVarga - 1)})`)}
                    </button>
                    <span className="text-xs font-black text-[#B56A00] bg-[#FAF2E4] px-2 py-1 rounded border border-[#8C6239]/30">
                      {selectedVargaObj.code}
                    </span>
                    <button
                      type="button"
                      disabled={selectedVarga >= 60}
                      onClick={() => setSelectedVarga((prev) => Math.min(60, prev + 1))}
                      className="px-2 py-1 bg-[#F4E8D1] hover:bg-[#E5D2B8] disabled:opacity-40 border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded"
                    >
                      {L(`अगला (D${Math.min(60, selectedVarga + 1)}) →`, `Next (D${Math.min(60, selectedVarga + 1)}) →`, `આગળ (D${Math.min(60, selectedVarga + 1)}) →`)}
                    </button>
                  </div>
                </div>

                {/* Direct Slider & Number Jump */}
                <div className="flex items-center gap-3 bg-[#F4E8D1]/60 p-2.5 rounded-lg border border-[#8C6239]/20">
                  <span className="text-xs font-bold text-[#5C3A21] whitespace-nowrap">{L('वर्ग चक्र क्रमांक (1-60):', 'Division Number (1-60):', 'વર્ગ ચક્ર ક્રમાંક (1-60):')}</span>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={selectedVarga}
                    onChange={(e) => setSelectedVarga(Number(e.target.value))}
                    className="w-full accent-[#B56A00] cursor-pointer"
                  />
                  <span className="text-xs font-black text-[#5C3A21] w-12 text-right">
                    D{selectedVarga}
                  </span>
                </div>

                {/* Varga Pills Grid */}
                <div className="pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {(vargaListFilter === 'shodash'
                      ? ALL_D1_TO_D60_VARGAS.filter((v) => v.isShodash)
                      : ALL_D1_TO_D60_VARGAS
                    ).map((v) => {
                      const isSel = selectedVarga === v.division;
                      const vLoc = getLocalizedVarga(v, language);
                      return (
                        <button
                          key={v.division}
                          onClick={() => {
                            setSelectedVarga(v.division);
                            document.getElementById('varga-main-chart-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }}
                          className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                            isSel
                              ? 'bg-[#5C3A21] text-[#FAF2E4] border-[#5C3A21] shadow-xs ring-2 ring-[#B56A00]'
                              : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/30 hover:bg-[#EBDCC0]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-xs font-black ${isSel ? 'text-[#FFD88A]' : 'text-[#B56A00]'}`}>
                              {v.code}
                            </span>
                            {v.isShodash && (
                              <span className="text-[9px] px-1 bg-[#B56A00]/20 text-[#B56A00] rounded font-bold">
                                {L('मुख्य', 'Core', 'મુખ્ય')}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-bold truncate mt-1">
                            {vLoc.shortName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Chart and Significance Details */}
              <div id="varga-main-chart-viewer" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-3">
                  <KundaliChart
                    lagnaDegree={k.lagnaDegree}
                    planets={k.planets}
                    vargaDivision={selectedVarga}
                    chartTitle={`${k.name} — ${selectedVargaLoc.name}`}
                  />
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {/* Shastric Meaning Card */}
                  <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-2">
                      <h4 className="text-base font-bold font-granth text-[#5C3A21]">
                        {selectedVargaObj.code}: {selectedVargaLoc.name}
                      </h4>
                      <span className="bg-[#B56A00] text-[#FAF2E4] px-2.5 py-0.5 rounded text-xs font-black">
                        {L('विभाजन', 'Division', 'વિભાજન')} 1/{selectedVarga} (30° ÷ {selectedVarga} = {(30 / selectedVarga).toFixed(2)}°)
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed">
                      <strong>{L('शास्त्रीय महत्व:', 'Shastric Significance:', 'શાસ્ત્રીય મહત્વ:')}</strong> {selectedVargaLoc.desc}
                    </p>

                    <div className="bg-[#F4E8D1] border border-[#8C6239]/20 rounded-lg p-3 text-xs text-[#735133] leading-relaxed">
                      {selectedVarga === 60 && (
                        <span>
                          <strong>{L('षष्ट्यंश (D60) पराशरी नियम:', 'Shashtiamsha (D60) Parashari Rule:', 'ષષ્ટ્યંશ (D60) પરાશરી નિયમ:')}</strong>{' '}
                          {L(
                            'महर्षि पराशर अनुसार षष्ट्यंश चक्र संचित कर्म एवं प्रारब्ध का सर्वोच्च सूक्ष्म दर्पण है। यदि कोई ग्रह D1 व D9 में शुभ हो किन्तु D60 में क्रूर षष्ट्यंश में हो, तो उसका शुभ फल क्षीण हो जाता है।',
                            'According to Maharishi Parashara, the D60 chart is the supreme subtle mirror of accumulated karma and prarabdha. Even if a planet is strong in D1 and D9, an adverse D60 placement diminishes its auspicious results.',
                            'મહર્ષિ પરાશર અનુસાર ષષ્ટ્યંશ ચક્ર સંચિત કર્મ અને પ્રારબ્ધનું સર્વોચ્ચ સૂક્ષ્મ દર્પણ છે. જો કોઈ ગ્રહ D1 અને D9 માં શુભ હોય પરંતુ D60 માં ક્રૂર ષષ્ટ્યંશમાં હોય, તો તેનું શુભ ફળ ક્ષીણ થાય છે.'
                          )}
                        </span>
                      )}
                      {selectedVarga === 10 && (
                        <span>
                          <strong>{L('दशमांश (D10) नियम:', 'Dashamsha (D10) Rule:', 'દશમાંશ (D10) નિયમ:')}</strong>{' '}
                          {L(
                            'आजीविका, उच्च पद, राजकीय सम्मान व कर्म क्षेत्र का सूक्ष्म विश्लेषण दशमांश से ही सुनिश्चित होता है।',
                            'Livelihood, high status, leadership, honors, and career trajectory are precisely ascertained through the D10 chart.',
                            'આજીવિકા, ઉચ્ચ પદ, રાજકીય સન્માન અને કર્મ ક્ષેત્રનું સૂક્ષ્મ વિશ્લેષણ દશમાંશથી જ સુનિશ્ચિત થાય છે.'
                          )}
                        </span>
                      )}
                      {selectedVarga === 9 && (
                        <span>
                          <strong>{L('नवमांश (D9) नियम:', 'Navamsha (D9) Rule:', 'નવમાંશ (D9) નિયમ:')}</strong>{' '}
                          {L(
                            'नवमांश चक्र को कुंडली की आत्मा माना गया है। ग्रह का वास्तविक बल नवमांश में उसकी राशि स्थिति (वर्गोत्तम/उच्च/नीच) पर निर्भर करता है।',
                            'The Navamsha chart is regarded as the soul of the Kundali. A planet’s true strength depends on its D9 dignity (Vargottama, exalted, or debilitated).',
                            'નવમાંશ ચક્રને કુંડળીનો આત્મા માનવામાં આવે છે. ગ્રહનું વાસ્તવિક બળ નવમાંશમાં તેની રાશિ સ્થિતિ (વર્ગોત્તમ/ઉચ્ચ/નીચ) પર આધાર રાખે છે.'
                          )}
                        </span>
                      )}
                      {selectedVarga !== 60 && selectedVarga !== 10 && selectedVarga !== 9 && (
                        <span>
                          {L(
                            'बृहत् पराशर होरा शास्त्र अनुसार प्रत्येक वर्ग चक्र जातक के जीवन के विशिष्ट आयाम (जैसे D2 धन, D4 भूमि, D7 संतान, D12 माता-पिता, D16 वाहन, D24 विद्या, D30 अरिष्ट) का निर्विवाद सूक्ष्म परिणाम दर्शाता है।',
                            'Per Brihat Parashara Hora Shastra, each divisional chart reveals subtle outcomes across a specific life domain (e.g., D2 wealth, D4 property, D7 progeny, D12 parents, D16 vehicles, D24 education, D30 challenges).',
                            'બૃહત્ પરાશર હોરા શાસ્ત્ર અનુસાર દરેક વર્ગ ચક્ર જાતકના જીવનના વિશિષ્ટ આયામો (જેમ કે D2 ધન, D4 ભૂમિ, D7 સંતાન, D12 માતા-પિતા, D16 વાહન, D24 વિદ્યા, D30 અરિષ્ટ) નું સૂક્ષ્મ પરિણામ દર્શાવે છે.'
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Shodashvarga Summary Table */}
                  <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                      <span>
                        {vargaListFilter === 'shodash'
                          ? L('षोडशवर्ग (16 वर्गीय चक्रों) की सूची', 'List of 16 Shodashvarga Charts', 'ષોડશવર્ગ (૧૬ વર્ગીય ચક્રો) ની યાદી')
                          : L('सम्पूर्ण D1 से D60 वर्गीय चक्रों की सूची', 'Complete D1 to D60 Divisional Charts', 'સંપૂર્ણ D1 થી D60 વર્ગીય ચક્રોની યાદી')}
                      </span>
                      <span className="text-[10px] text-[#FFD88A]">{L('क्लिक कर चार्ट देखें', 'Click to view chart', 'ચાર્ટ જોવા ક્લિક કરો')}</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-[#8C6239]/20">
                          {(vargaListFilter === 'shodash'
                            ? ALL_D1_TO_D60_VARGAS.filter((v) => v.isShodash)
                            : ALL_D1_TO_D60_VARGAS
                          ).map((v) => {
                            const vLoc = getLocalizedVarga(v, language);
                            return (
                              <tr
                                key={v.division}
                                onClick={() => {
                                  setSelectedVarga(v.division);
                                  document.getElementById(`varga-chart-${v.division}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className={`cursor-pointer transition ${
                                  selectedVarga === v.division
                                    ? 'bg-[#F4E8D1] font-bold'
                                    : 'hover:bg-[#FAF2E4]/80'
                                }`}
                              >
                                <td className="py-2 px-3 text-[#B56A00] font-black w-14">{v.code}</td>
                                <td className="py-2 px-3 text-[#5C3A21] font-bold">{vLoc.name}</td>
                                <td className="py-2 px-3 text-[#735133]">{vLoc.desc}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/35">
                  <div>
                    <h4 className="text-sm font-black font-granth text-[#4A200A]">
                      {vargaListFilter === 'shodash'
                        ? L('मुख्य १६ षोडशवर्ग 3D चक्र (D1 – D60)', '16 Core Shodashvarga 3D Charts (D1 – D60)', 'મુખ્ય ૧૬ ષોડશવર્ગ 3D ચક્ર (D1 – D60)')
                        : L('सम्पूर्ण ६० वर्गीय 3D चक्र (D1 से D60 तक)', 'All 60 Divisional 3D Charts (D1 – D60)', 'સંપૂર્ણ ૬૦ વર્ગીય 3D ચક્ર (D1 થી D60)')}
                    </h4>
                    <p className="text-[11px] text-[#735133]">
                      {L(
                        'प्रत्येक चार्ट 3D उभरे वैदिक यंत्र रूप में प्रदर्शित है — किसी भी चार्ट पर “✦ 3D स्वर्ण यंत्र में देखें” दबाकर पूर्ण 3D मॉडल घुमाएँ।',
                        'Each chart is rendered as a 3D embossed Vedic Yantra — tap "✦ 3D Golden Yantra" on any chart to rotate the full 3D model.',
                        'દરેક ચક્ર 3D ઉપસેલા વૈદિક યંત્ર સ્વરૂપમાં પ્રદર્શિત છે — કોઈ પણ ચક્ર પર "✦ 3D સુવર્ણ યંત્રમાં જુઓ" દબાવી પૂર્ણ 3D મોડેલ ફેરવો.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVargaListFilter(vargaListFilter === 'shodash' ? 'all60' : 'shodash')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5C2D0C] text-[#FFF3C4] border border-[#D97706] cursor-pointer"
                  >
                    {vargaListFilter === 'shodash'
                      ? L('सभी 60 चक्र (D1-D60) खोलें', 'Show All 60 Charts (D1–D60)', 'બધા ૬૦ ચક્ર (D1-D60) ખોલો')
                      : L('केवल 16 मुख्य षोडशवर्ग दिखाएँ', 'Show Only 16 Core Shodashvargas', 'ફક્ત ૧૬ મુખ્ય ષોડશવર્ગ બતાવો')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(vargaListFilter === 'shodash'
                    ? ALL_D1_TO_D60_VARGAS.filter((v) => v.isShodash)
                    : ALL_D1_TO_D60_VARGAS
                  ).map((varga) => {
                    const vLoc = getLocalizedVarga(varga, language);
                    return (
                      <div
                        key={varga.division}
                        id={`varga-chart-${varga.division}`}
                        className="space-y-1.5 bg-[#FAF2E4]/70 p-2.5 rounded-2xl border border-[#8C6239]/25"
                      >
                        <div className="flex items-center justify-between px-1">
                          <div className="text-xs font-black text-[#4A200A]">
                            {varga.code}: {vLoc.name}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#F4E8D1] text-[#7C2D12] font-bold border border-[#C88A2B]/40">
                            {L('विभाजन', 'Division', 'વિભાજન')} 1/{varga.division}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5C3A21] px-1 leading-relaxed">{vLoc.desc}</p>
                        <KundaliChart
                          lagnaDegree={k.lagnaDegree}
                          planets={k.planets}
                          vargaDivision={varga.division}
                          chartTitle={`${k.name} — ${varga.code}`}
                          allowToggleStyle={false}
                          defaultRenderMode="relief3d"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setChartSubPage('planets')}
                  className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{L('पिछला: २. ग्रह स्पष्ट तालिका', 'Prev: 2. Planetary Table', 'પાછળ: ૨. ગ્રહ સ્પષ્ટ કોષ્ટક')}</span>
                </button>
                <div className="text-xs font-bold text-[#8C6239]">{L('पृष्ठ 3 / 3 (षोडशवर्ग D1-D60)', 'Page 3 / 3 (Shodashvarga D1–D60)', 'પૃષ્ઠ 3 / 3 (ષોડશવર્ગ D1-D60)')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Vimshottari Mahadasha, Antardasha & Pratyantardasha */}
      {kundaliTab === 'dasha' && k && (
        <div
          className="space-y-6 select-none touch-pan-y"
          onTouchStart={handleDashaTouchStart}
          onTouchEnd={handleDashaTouchEnd}
        >
          {/* Dasha System Selector: Vimshottari vs Jaimini Chara Dasha */}
          <div className="flex flex-wrap items-center justify-center p-1 bg-[#462B17] rounded-xl text-xs font-bold border border-[#8C6239]/60 gap-1 shadow-sm">
            <button
              type="button"
              onClick={() => setDashaSystemTab('vimshottari')}
              className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer min-w-[200px] ${
                dashaSystemTab === 'vimshottari'
                  ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
                  : 'text-[#E5D2B8] hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-[#B56A00]" />
              <span>1. {t('kundali.tabDasha', 'विंशोत्तरी दशा (३-स्तरीय ग्रह दशा)')}</span>
            </button>

            <button
              type="button"
              onClick={() => setDashaSystemTab('jaimini')}
              className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer min-w-[200px] ${
                dashaSystemTab === 'jaimini'
                  ? 'bg-[#FAF2E4] text-[#5C3A21] shadow-md font-black ring-1 ring-[#B56A00]'
                  : 'text-[#E5D2B8] hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#B56A00]" />
              <span>2. {L('जैमिनी चर दशा व कारकांश (Jaimini Chara Dasha)', 'Jaimini Chara Dasha & Karakamsha', 'જૈમિની ચર દશા અને કારકાંશ')}</span>
            </button>
          </div>

          {dashaSystemTab === 'jaimini' ? (
            <JaiminiPanel kundali={k} />
          ) : (
            <>
              {/* Active Dasha Hero Card with Pratyantar */}
              <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-[#8C6239] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#B56A00]" />
                {L('वर्तमान सक्रिय त्रि-स्तरीय विंशोत्तरी दशा (Active Vimshottari Dasha Timeline)', 'Active 3-Tier Vimshottari Dasha Timeline', 'વર્તમાન સક્રિય ત્રિ-સ્તરીય વિંશોત્તરી દશા')}
              </div>

              <button
                onClick={jumpToActiveDasha}
                className="px-3 py-1.5 bg-[#B56A00] hover:bg-[#945500] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>{L('वर्तमान सक्रिय सूक्ष्म दशा पर जाएँ', 'Jump to Active Micro Dasha', 'વર્તમાન સક્રિય સૂક્ષ્મ દશા પર જાઓ')}</span>
              </button>
            </div>

            {/* Mobile Touch Swipe Indicator Banner */}
            <div className="p-2.5 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 border border-[#B56A00]/40 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C3A21]">
              <div className="flex items-center gap-2 font-bold">
                <MoveHorizontal className="w-4 h-4 text-[#B56A00] shrink-0" />
                <span>{L('फोन पर दशा बदलने हेतु स्क्रीन पर बाएँ (←) या दाएँ (→) स्वाइप करें', 'Swipe left or right or use buttons to change dasha tier', 'દશા સ્તર બદલવા માટે સ્ક્રીન પર ડાબે (←) કે જમણે (→) સ્વાઇપ કરો')}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (dashaViewLevel === 'pratyantar') setDashaViewLevel('antar');
                    else if (dashaViewLevel === 'antar') setDashaViewLevel('maha');
                  }}
                  disabled={dashaViewLevel === 'maha'}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-0.5 cursor-pointer ${
                    dashaViewLevel === 'maha'
                      ? 'opacity-40 cursor-not-allowed bg-[#FAF2E4] text-[#8C6239]'
                      : 'bg-[#5C3A21] text-[#FAF2E4] active:scale-95'
                  }`}
                  title={t('common.prev', 'पिछला')}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{t('common.prev', 'पिछला')}</span>
                </button>
                <span className="text-[11px] text-[#8C6239] font-bold px-1">
                  {dashaViewLevel === 'maha' ? L('स्तर १/३', 'Tier 1/3', 'સ્તર ૧/૩') : dashaViewLevel === 'antar' ? L('स्तर २/३', 'Tier 2/3', 'સ્તર ૨/૩') : dashaViewLevel === 'pratyantar' ? L('स्तर ३/३', 'Tier 3/3', 'સ્તર ૩/૩') : L('समस्त', 'All', 'સમસ્ત')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (dashaViewLevel === 'maha' || dashaViewLevel === 'all') setDashaViewLevel('antar');
                    else if (dashaViewLevel === 'antar') setDashaViewLevel('pratyantar');
                  }}
                  disabled={dashaViewLevel === 'pratyantar'}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-0.5 cursor-pointer ${
                    dashaViewLevel === 'pratyantar'
                      ? 'opacity-40 cursor-not-allowed bg-[#FAF2E4] text-[#8C6239]'
                      : 'bg-[#5C3A21] text-[#FAF2E4] active:scale-95'
                  }`}
                  title={t('common.next', 'अगला')}
                >
                  <span>{t('common.next', 'अगला')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3 Prominent Cards: Mahadasha, Antardasha, Pratyantardasha */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => {
                  setInspectedMaha(k.mahadasha);
                  setDashaViewLevel('maha');
                }}
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  inspectedMaha === k.mahadasha
                    ? 'bg-[#F4E8D1] border-[#B56A00] shadow-xs'
                    : 'bg-[#F4E8D1]/80 border-[#8C6239]/30 hover:border-[#B56A00]'
                }`}
              >
                <div className="text-[11px] text-[#8C6239] font-bold uppercase flex items-center justify-between">
                  <span>1. {t('kundali.currentDasha', 'महादशा')}</span>
                  <span className="bg-[#B56A00] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {L('सक्रिय', 'Active', 'સક્રિય')}
                  </span>
                </div>
                <div className="text-xl font-black text-[#5C3A21] mt-1">{trPlanet(k.mahadasha, language)} {t('kundali.currentDasha', 'महादशा')}</div>
                <div className="text-xs text-[#735133] mt-1 font-medium">
                  {currentActiveMahaPeriod
                    ? `${fmtDate(currentActiveMahaPeriod.startDate)} ${L('से', 'to', 'થી')} ${fmtDate(currentActiveMahaPeriod.endDate)}`
                    : `${L('स्वामी:', 'Lord:', 'સ્વામી:')} ${trPlanet(k.mahadasha, language)}`}
                </div>
                <div className="text-[10px] text-[#8C6239] mt-1 flex items-center justify-between">
                  <span>{t('kundali.duration', 'अवधि')}: {currentActiveMahaPeriod?.years.toFixed(1)} {L('वर्ष', 'years', 'વર્ષ')}</span>
                  <span className="text-[#B56A00] font-bold underline text-[10px]">{L('चक्र देखें →', 'View Cycle →', 'ચક્ર જુઓ →')}</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setInspectedMaha(k.mahadasha);
                  setInspectedAntar(k.antardasha);
                  setDashaViewLevel('antar');
                }}
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  inspectedAntar === k.antardasha
                    ? 'bg-[#F4E8D1] border-[#B56A00] shadow-xs'
                    : 'bg-[#F4E8D1]/80 border-[#8C6239]/30 hover:border-[#B56A00]'
                }`}
              >
                <div className="text-[11px] text-[#8C6239] font-bold uppercase flex items-center justify-between">
                  <span>2. {t('kundali.antardasha', 'अंतर्दशा')}</span>
                  <span className="bg-[#B56A00] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {L('सक्रिय', 'Active', 'સક્રિય')}
                  </span>
                </div>
                <div className="text-xl font-black text-[#B56A00] mt-1">{trPlanet(k.antardasha, language)} {t('kundali.antardasha', 'अंतर्दशा')}</div>
                <div className="text-xs text-[#735133] mt-1 font-medium">
                  {currentActiveAntarPeriod
                    ? `${fmtDate(currentActiveAntarPeriod.startDate)} ${L('से', 'to', 'થી')} ${fmtDate(currentActiveAntarPeriod.endDate)}`
                    : `${L('उप-स्वामी:', 'Sub-Lord:', 'ઉપ-સ્વામી:')} ${trPlanet(k.antardasha, language)}`}
                </div>
                <div className="text-[10px] text-[#8C6239] mt-1 flex items-center justify-between">
                  <span>{t('kundali.duration', 'अवधि')}: {((currentActiveAntarPeriod?.years || 0) * 12).toFixed(1)} {L('माह', 'months', 'માસ')}</span>
                  <span className="text-[#B56A00] font-bold underline text-[10px]">{L('सूक्ष्म देखें →', 'View Micro →', 'સૂક્ષ્મ જુઓ →')}</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setInspectedMaha(k.mahadasha);
                  setInspectedAntar(k.antardasha);
                  setDashaViewLevel('pratyantar');
                }}
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                  dashaViewLevel === 'pratyantar'
                    ? 'bg-rose-50 border-rose-700 shadow-xs'
                    : 'bg-[#F4E8D1]/80 border-rose-800/30 hover:border-rose-700'
                }`}
              >
                <div className="text-[11px] text-rose-800 font-bold uppercase flex items-center justify-between">
                  <span>3. {L('प्रत्यंतर्दशा (Pratyantar)', 'Pratyantardasha', 'પ્રત્યંતરદશા')}</span>
                  <span className="bg-rose-700 text-white text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                    {L('सक्रिय', 'Active', 'સક્રિય')}
                  </span>
                </div>
                <div className="text-xl font-black text-rose-800 mt-1">{trPlanet(k.pratyantardasha, language)} {L('प्रत्यंतर', 'Pratyantar', 'પ્રત્યંતર')}</div>
                <div className="text-xs text-[#735133] mt-1 font-medium">
                  {currentActivePratyantarPeriod
                    ? `${fmtDate(currentActivePratyantarPeriod.startDate)} ${L('से', 'to', 'થી')} ${fmtDate(currentActivePratyantarPeriod.endDate)}`
                    : `${L('सूक्ष्म स्वामी:', 'Micro-Lord:', 'સૂક્ષ્મ સ્વામી:')} ${trPlanet(k.pratyantardasha, language)}`}
                </div>
                <div className="text-[10px] text-rose-800 mt-1 flex items-center justify-between">
                  <span>{t('kundali.duration', 'अवधि')}: {currentActivePratyantarPeriod?.days} {L('दिन', 'days', 'દિવસ')}</span>
                  <span className="text-rose-700 font-bold underline text-[10px]">{L('प्रत्यंतर तालिका →', 'Pratyantar Table →', 'પ્રત્યંતર કોષ્ટક →')}</span>
                </div>
              </div>
            </div>

            {/* Level Navigation & Breadcrumb Bar */}
            <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#5C3A21]">
                <span className="text-[11px] text-[#8C6239] mr-1">{L('दशा स्तर:', 'Dasha Tier:', 'દશા સ્તર:')}</span>
                <button
                  onClick={() => setDashaViewLevel('maha')}
                  className={`px-2.5 py-1 rounded-md transition text-xs font-bold cursor-pointer ${
                    dashaViewLevel === 'maha'
                      ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                      : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#EBD8BD]'
                  }`}
                >
                  {L('१. महादशा:', '1. Mahadasha:', '૧. મહાદશા:')} <span className="text-amber-600 font-black">{trPlanet(inspectedMaha, language)}</span>
                </button>
                <span className="text-[#8C6239]">›</span>
                <button
                  onClick={() => setDashaViewLevel('antar')}
                  className={`px-2.5 py-1 rounded-md transition text-xs font-bold cursor-pointer ${
                    dashaViewLevel === 'antar'
                      ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                      : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#EBD8BD]'
                  }`}
                >
                  {L('२. अंतर्दशा:', '2. Antardasha:', '૨. અંતર્દશા:')} <span className="text-amber-600 font-black">{trPlanet(inspectedAntar, language)}</span>
                </button>
                <span className="text-[#8C6239]">›</span>
                <button
                  onClick={() => setDashaViewLevel('pratyantar')}
                  className={`px-2.5 py-1 rounded-md transition text-xs font-bold cursor-pointer ${
                    dashaViewLevel === 'pratyantar'
                      ? 'bg-rose-800 text-white shadow-xs'
                      : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                  }`}
                >
                  {L('३. प्रत्यंतर्दशा सूची', '3. Pratyantardasha List', '૩. પ્રત્યંતરદશા યાદી')} ({inspectedPratyantars.length})
                </button>
              </div>

              {/* View toggle */}
              <div className="inline-flex rounded-lg border border-[#8C6239]/30 p-0.5 bg-[#FAF2E4]">
                <button
                  onClick={() => setDashaViewLevel('all')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                    dashaViewLevel === 'all'
                      ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                      : 'text-[#5C3A21] hover:bg-[#F4E8D1]'
                  }`}
                >
                  {L('सम्पूर्ण ३-स्तरीय दृश्य', 'Full 3-Tier View', 'સંપૂર્ણ ૩-સ્તરીય દ્રશ્ય')}
                </button>
                <button
                  onClick={() => setDashaViewLevel('pratyantar')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                    dashaViewLevel === 'pratyantar'
                      ? 'bg-rose-800 text-white shadow-xs'
                      : 'text-rose-900 hover:bg-[#F4E8D1]'
                  }`}
                >
                  {L('प्रत्यंतर फोकस', 'Pratyantar Focus', 'પ્રત્યંતર ફોકસ')}
                </button>
              </div>
            </div>

            <p className="text-xs text-[#735133] leading-relaxed pt-1 border-t border-[#8C6239]/20">
              {L(
                `विंशोत्तरी 120-वर्षीय दशा क्रम जातक के जन्म नक्षत्र (${k.nakshatra}) के स्वामी ${k.dashaPeriods[0]?.planet} के आधार पर गणित है। किसी भी महादशा या अंतर्दशा पर क्लिक करके उसकी सूक्ष्म ९ प्रत्यंतर्दशाओं का विस्तृत विश्लेषण देखें।`,
                `The 120-year Vimshottari Dasha cycle is calculated from the birth Nakshatra (${trVedic(k.nakshatra, language)}) ruled by ${trPlanet(k.dashaPeriods[0]?.planet || '', language)}. Click any Mahadasha or Antardasha to inspect its 9 subtle Pratyantardashas.`,
                `વિંશોત્તરી ૧૨૦-વર્ષીય દશા ક્રમ જાતકના જન્મ નક્ષત્ર (${trVedic(k.nakshatra, language)}) ના સ્વામી ${trPlanet(k.dashaPeriods[0]?.planet || '', language)} ના આધારે ગણાયેલ છે. કોઈ પણ મહાદશા કે અંતર્દશા પર ક્લિક કરીને તેની સૂક્ષ્મ ૯ પ્રત્યંતરદશાઓનું વિશ્લેષણ જુઓ.`
              )}
            </p>
          </div>

          {/* 3-Level Interactive Hierarchical Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: 9 Mahadashas */}
            <div
              className={`lg:col-span-4 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs ${
                dashaViewLevel === 'all' || dashaViewLevel === 'maha' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>{L('1. महादशा चक्र (9 Planets)', '1. Mahadasha Cycle (9 Planets)', '1. મહાદશા ચક્ર (૯ ગ્રહો)')}</span>
                <span className="text-[10px] text-amber-200">{L('क्लिक कर चुनें', 'Click to select', 'પસંદ કરવા ક્લિક કરો')}</span>
              </div>
              <div className="divide-y divide-[#8C6239]/20">
                {k.dashaPeriods.map((dp, idx) => {
                  const isCur = syncedNow >= dp.startDate && syncedNow < dp.endDate;
                  const isSelected = inspectedMaha === dp.planet;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setInspectedMaha(dp.planet);
                        const firstAntar = k.antarPeriods.find((a) => a.maha === dp.planet);
                        if (firstAntar) setInspectedAntar(firstAntar.antar);
                        if (dashaViewLevel === 'maha') {
                          setDashaViewLevel('antar');
                        }
                      }}
                      className={`p-3 cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#F4E8D1] border-l-4 border-[#B56A00] font-bold'
                          : 'hover:bg-[#F4E8D1]/60'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5">
                          <span>{trPlanet(dp.planet, language)} {t('kundali.currentDasha', 'महादशा')}</span>
                          {isCur && (
                            <span className="bg-[#B56A00] text-white px-1.5 py-0.2 rounded text-[9px] font-bold">
                              {L('सक्रिय', 'Active', 'સક્રિય')}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#735133] mt-0.5">
                          {fmtDate(dp.startDate)} {L('से', 'to', 'થી')} {fmtDate(dp.endDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#5C3A21]">{dp.years.toFixed(1)} {L('वर्ष', 'yrs', 'વર્ષ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle: 9 Antardashas of selected Mahadasha */}
            <div
              className={`lg:col-span-4 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs ${
                dashaViewLevel === 'all' || dashaViewLevel === 'antar' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>{L(`2. अंतर्दशाएँ (${inspectedMaha} में)`, `2. Antardashas (in ${trPlanet(inspectedMaha, language)})`, `2. અંતર્દશાઓ (${trPlanet(inspectedMaha, language)} માં)`)}</span>
                <span className="text-[10px] text-amber-200">{L('क्लिक कर प्रत्यंतर देखें', 'Click for Pratyantar', 'પ્રત્યંતર જોવા ક્લિક કરો')}</span>
              </div>
              <div className="divide-y divide-[#8C6239]/20">
                {antarsOfCurrentMaha.map((ap, idx) => {
                  const isCur = syncedNow >= ap.startDate && syncedNow < ap.endDate;
                  const isSelected = inspectedAntar === ap.antar;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setInspectedAntar(ap.antar);
                        if (dashaViewLevel === 'antar') {
                          setDashaViewLevel('pratyantar');
                        }
                      }}
                      className={`p-3 cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#F4E8D1] border-l-4 border-[#B56A00] font-bold'
                          : 'hover:bg-[#F4E8D1]/60'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5">
                          <span>{trPlanet(ap.antar, language)} {t('kundali.antardasha', 'अंतर्दशा')}</span>
                          {isCur && (
                            <span className="bg-[#B56A00] text-white px-1.5 py-0.2 rounded text-[9px] font-bold">
                              {L('सक्रिय', 'Active', 'સક્રિય')}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#735133] mt-0.5">
                          {fmtDate(ap.startDate)} {L('से', 'to', 'થી')} {fmtDate(ap.endDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#8C6239]">
                          {(ap.years * 12).toFixed(1)} {L('माह', 'mo', 'માસ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: 9 Pratyantardashas */}
            <div
              className={`lg:col-span-4 bg-[#FAF2E4] border-2 border-rose-800/40 rounded-xl overflow-hidden shadow-xs ${
                dashaViewLevel === 'all' || dashaViewLevel === 'pratyantar' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="p-3 bg-gradient-to-r from-rose-900 to-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>{L('3. प्रत्यंतर्दशाएँ', '3. Pratyantardashas', '3. પ્રત્યંતરદશાઓ')} ({trPlanet(inspectedMaha, language)} - {trPlanet(inspectedAntar, language)})</span>
                <span className="text-[10px] text-amber-300 font-bold">{L('सूक्ष्म चक्र', 'Micro Cycle', 'સૂક્ષ્મ ચક્ર')}</span>
              </div>
              <div className="divide-y divide-[#8C6239]/20">
                {inspectedPratyantars.map((pp, idx) => {
                  const isCur = syncedNow >= pp.startDate && syncedNow < pp.endDate;
                  return (
                    <div
                      key={idx}
                      className={`p-3 transition flex items-center justify-between ${
                        isCur ? 'bg-rose-100/90 border-l-4 border-rose-700 font-bold' : 'hover:bg-[#F4E8D1]/50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5">
                          <span>{trPlanet(pp.pratyantar, language)} {L('प्रत्यंतर', 'Pratyantar', 'પ્રત્યંતર')}</span>
                          {isCur && (
                            <span className="bg-rose-700 text-white px-1.5 py-0.2 rounded text-[9px] font-bold animate-pulse">
                              {L('सक्रिय', 'Active', 'સક્રિય')}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#735133] mt-0.5">
                          {fmtDate(pp.startDate)} — {fmtDate(pp.endDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-rose-900">{pp.days} {L('दिन', 'days', 'દિવસ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* Tab 3: Kundali Milan (36 Gunas, Manglik, Nadi, Bhakoot & Twin Charts) */}
      {kundaliTab === 'milan' && (
        <div className="space-y-4">
          {/* Sub-Pages Segmented Bar for Milan Tab */}
          <div className="flex items-center justify-between gap-1 p-1 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
            {[
              { id: 'score', label: L('१. मिलान स्कोर', '1. Match Score', '૧. મિલાન સ્કોર'), full: L('पृष्ठ १: वर-कन्या विवरण एवं स्कोर', 'Page 1: Groom-Bride Details & Score', 'પૃષ્ઠ ૧: વર-કન્યા વિગતો અને સ્કોર') },
              { id: 'ashtakoot', label: L('२. अष्टकूट तालिका', '2. Ashtakoot Table', '૨. અષ્ટકૂટ કોષ્ટક'), full: L('पृष्ठ २: अष्टकूट 8 घटक तालिका', 'Page 2: 8 Ashtakoot Factors Table', 'પૃષ્ઠ ૨: અષ્ટકૂટ ૮ ઘટક કોષ્ટક') },
              { id: 'manglik', label: L('३. दोष विचार व चक्र', '3. Doshas & Charts', '૩. દોષ વિચાર અને ચક્ર'), full: L('पृष्ठ ३: मांगलिक, नाड़ी, भकूट व चक्र', 'Page 3: Manglik, Nadi, Bhakoot & Charts', 'પૃષ્ઠ ૩: માંગલિક, નાડી, ભકૂટ અને ચક્ર') },
            ].map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setMilanSubPage(sp.id as any)}
                className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded-lg transition cursor-pointer ${
                  milanSubPage === sp.id
                    ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                    : 'text-[#8C6239] hover:bg-[#F4E8D1]'
                }`}
              >
                <span className="sm:hidden">{sp.label}</span>
                <span className="hidden sm:inline">{sp.full}</span>
              </button>
            ))}
          </div>

          {/* Sub-Page 1: Profiles and Score Banner */}
          {milanSubPage === 'score' && (
            <div className="space-y-4">
              {/* Couple Profiles Inputs */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-2">
                  <h3 className="text-sm font-bold text-[#5C3A21] flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span>{L('वर-कन्या विवरण (36-गुण अष्टकूट मिलान)', 'Groom & Bride Details (36-Guna Ashtakoot Match)', 'વર-કન્યા વિગતો (૩૬-ગુણ અષ્ટકૂટ મિલાન)')}</span>
                  </h3>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Mode Toggle */}
                    <div className="inline-flex rounded-lg border border-[#8C6239]/30 p-0.5 bg-[#F4E8D1]">
                      <button
                        type="button"
                        onClick={() => setMilanInputMode('rashi')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                          milanInputMode === 'rashi'
                            ? 'bg-[#5C3A21] text-white shadow-xs'
                            : 'text-[#5C3A21] hover:bg-[#FAF2E4]'
                        }`}
                      >
                        🌙 {L('राशि व नक्षत्र से', 'By Sign & Nakshatra', 'રાશિ અને નક્ષત્રથી')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMilanInputMode('dob')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                          milanInputMode === 'dob'
                            ? 'bg-[#5C3A21] text-white shadow-xs'
                            : 'text-[#5C3A21] hover:bg-[#FAF2E4]'
                        }`}
                      >
                        🗓️ {L('जन्म तिथि, समय व शहर', 'Birth Date, Time & City', 'જન્મ તારીખ, સમય અને શહેર')}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleLoadSampleMilan}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-md text-[11px] font-bold transition cursor-pointer shadow-xs active:scale-95"
                    >
                      🌟 {L('उदाहरण भरें', 'Load Sample', 'ઉદાહરણ ભરો')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Boy */}
                  <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-blue-900 uppercase">{L('वर विवरण (Boy)', 'Groom Details', 'વર વિગતો (Boy)')}</span>
                      {boyKundali && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                          {trRashi(boyKundali.moonRashi, language)} • {trVedic(boyKundali.nakshatra, language)} ({trVedic(boyKundali.nadi, language)} {L('नाड़ी', 'Nadi', 'નાડી')})
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={boyName}
                      onChange={(e) => setBoyName(e.target.value)}
                      className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21]"
                      placeholder={L('वर का नाम', "Groom's Name", 'વરનું નામ')}
                    />

                    {/* Boy Birth City Selector */}
                    <div>
                      <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">
                        {L('वर का जन्म शहर / स्थान (Birth City)', "Groom's Birth City / Place", 'વરનું જન્મ શહેર / સ્થળ')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCityPickerTarget('boy');
                          setIsCityModalOpen(true);
                        }}
                        className="w-full bg-white hover:bg-[#FAF2E4] border border-[#8C6239]/40 rounded p-1.5 text-xs font-bold text-[#2B1105] flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#B56A00] shrink-0" />
                          <span className="truncate">{boyCity.name}</span>
                        </span>
                        <span className="text-[10px] text-[#B56A00] underline font-bold shrink-0 ml-1">
                          📍 {L('शहर चुनें ▾', 'Select City ▾', 'શહેર પસંદ કરો ▾')}
                        </span>
                      </button>
                    </div>

                    {milanInputMode === 'rashi' ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{t('kundali.moonSign', 'चंद्र राशि')}</label>
                            <select
                              value={boyRashiIdx}
                              onChange={(e) => setBoyRashiIdx(Number(e.target.value))}
                              className="w-full bg-white border border-[#8C6239]/40 rounded p-1.5 text-xs font-bold text-[#2B1105]"
                            >
                              {RASHIS.map((r, idx) => (
                                <option key={r} value={idx}>
                                  {idx + 1}. {trRashi(r, language)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{L('जन्म नक्षत्र', 'Birth Nakshatra', 'જન્મ નક્ષત્ર')}</label>
                            <select
                              value={boyNakIdx}
                              onChange={(e) => setBoyNakIdx(Number(e.target.value))}
                              className="w-full bg-white border border-[#8C6239]/40 rounded p-1.5 text-xs font-bold text-[#2B1105]"
                            >
                              {NAKSHATRAS.map((n, idx) => (
                                <option key={n} value={idx}>
                                  {idx + 1}. {trVedic(n, language)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <div>
                            <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{L('नक्षत्र चरण (Pada)', 'Nakshatra Pada', 'નક્ષત્ર ચરણ (Pada)')}</label>
                            <select
                              value={boyCharan}
                              onChange={(e) => setBoyCharan(Number(e.target.value))}
                              className="w-full bg-white border border-[#8C6239]/40 rounded p-1.5 text-xs font-bold text-[#2B1105]"
                            >
                              {[1, 2, 3, 4].map((c) => (
                                <option key={c} value={c}>{L('चरण', 'Pada', 'ચરણ')} {c}</option>
                              ))}
                            </select>
                          </div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-[#4A0E0E] pt-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={boyIsManglik}
                              onChange={(e) => setBoyIsManglik(e.target.checked)}
                              className="rounded border-[#8C6239]"
                            />
                            <span>{L('वर मांगलिक है?', 'Is Groom Manglik?', 'વર માંગલિક છે?')}</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{t('kundali.dob', 'जन्म तिथि')}</label>
                          <input
                            type="text"
                            readOnly
                            value={boyDob}
                            onClick={() => {
                              setPickerTarget('boy');
                              setIsDatePickerOpen(true);
                            }}
                            placeholder="YYYY-MM-DD"
                            className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21] cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{t('kundali.time', 'जन्म समय')}</label>
                          <input
                            type="text"
                            readOnly
                            value={boyTob}
                            onClick={() => {
                              setPickerTarget('boy');
                              setIsTimePickerOpen(true);
                            }}
                            placeholder="HH:MM"
                            className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21] cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Girl */}
                  <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-rose-900 uppercase">{L('कन्या विवरण (Girl)', 'Bride Details', 'કન્યા વિગતો (Girl)')}</span>
                      {girlKundali && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-900 px-2 py-0.5 rounded border border-rose-200">
                          {trRashi(girlKundali.moonRashi, language)} • {trVedic(girlKundali.nakshatra, language)} ({L('चरण', 'Pada', 'ચરણ')} {girlKundali.charan} • {trVedic(girlKundali.nadi, language)} {L('नाड़ी', 'Nadi', 'નાડી')})
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={girlName}
                      onChange={(e) => setGirlName(e.target.value)}
                      className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21]"
                      placeholder={L('कन्या का नाम', "Bride's Name", 'કન્યાનું નામ')}
                    />

                    {/* Girl Birth City Selector */}
                    <div>
                      <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">
                        {L('कन्या का जन्म शहर / स्थान (Birth City)', "Bride's Birth City / Place", 'કન્યાનું જન્મ શહેર / સ્થળ')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCityPickerTarget('girl');
                          setIsCityModalOpen(true);
                        }}
                        className="w-full bg-white hover:bg-[#FAF2E4] border border-[#8C6239]/40 rounded p-1.5 text-xs font-bold text-[#2B1105] flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#B56A00] shrink-0" />
                          <span className="truncate">{girlCity.name}</span>
                        </span>
                        <span className="text-[10px] text-[#B56A00] underline font-bold shrink-0 ml-1">
                          📍 {L('शहर चुनें ▾', 'Select City ▾', 'શહેર પસંદ કરો ▾')}
                        </span>
                      </button>
                    </div>

                    {milanInputMode === 'rashi' ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{t('kundali.moonSign', 'चंद्र राशि')}</label>
                            <select
                              value={girlRashiIdx}
                              onChange={(e) => setGirlRashiIdx(Number(e.target.value))}
                              className="w-full bg-white border border-[#8C6239]/40 rounded p-1.5 text-xs font-bold text-[#2B1105]"
                            >
                              {RASHIS.map((r, idx) => (
                                <option key={r} value={idx}>
                                  {idx + 1}. {trRashi(r, language)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{L('जन्म नक्षत्र', 'Birth Nakshatra', 'જન્મ નક્ષત્ર')}</label>
                            <select
                              value={girlNakIdx}
                              onChange={(e) => setGirlNakIdx(Number(e.target.value))}
                              className="w-full bg-white border border-[#8C6239]/40 rounded p-1.5 text-xs font-bold text-[#2B1105]"
                            >
                              {NAKSHATRAS.map((n, idx) => (
                                <option key={n} value={idx}>
                                  {idx + 1}. {trVedic(n, language)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 items-center">
                          <div>
                            <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{L('नक्षत्र चरण (Pada)', 'Nakshatra Pada', 'નક્ષત્ર ચરણ (Pada)')}</label>
                            <select
                              value={girlCharan}
                              onChange={(e) => setGirlCharan(Number(e.target.value))}
                              className="w-full bg-white border border-[#8C6239]/40 rounded p-1.5 text-xs font-bold text-[#2B1105]"
                            >
                              {[1, 2, 3, 4].map((c) => (
                                <option key={c} value={c}>{L('चरण', 'Pada', 'ચરણ')} {c}</option>
                              ))}
                            </select>
                          </div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-[#4A0E0E] pt-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={girlIsManglik}
                              onChange={(e) => setGirlIsManglik(e.target.checked)}
                              className="rounded border-[#8C6239]"
                            />
                            <span>{L('कन्या मांगलिक है?', 'Is Bride Manglik?', 'કન્યા માંગલિક છે?')}</span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{t('kundali.dob', 'जन्म तिथि')}</label>
                          <input
                            type="text"
                            readOnly
                            value={girlDob}
                            onClick={() => {
                              setPickerTarget('girl');
                              setIsDatePickerOpen(true);
                            }}
                            placeholder="YYYY-MM-DD"
                            className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21] cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#5C3A21] block mb-0.5">{t('kundali.time', 'जन्म समय')}</label>
                          <input
                            type="text"
                            readOnly
                            value={girlTob}
                            onClick={() => {
                              setPickerTarget('girl');
                              setIsTimePickerOpen(true);
                            }}
                            placeholder="HH:MM"
                            className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21] cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Milan Result Banner with Bhojpatra PDF Download & HD Status Card Buttons */}
              {!milanResult ? (
                <div className="bg-leaf border border-wood/40 rounded-xl p-5 text-sm text-muted">
                  {L(
                    'वर और कन्या दोनों का पूरा नाम, जन्म तिथि और समय भरें — तब ही मिलान बनेगा। पैक में कोई पूर्व-भरी कुंडली नहीं है।',
                    'Enter full details (name, birth date & time, or Moon sign & Nakshatra) for both Groom and Bride to calculate matching.',
                    'વર અને કન્યા બંનેની પૂરી વિગતો (નામ, જન્મ તારીખ અને સમય અથવા રાશિ-નક્ષત્ર) ભરો — ત્યારે જ મિલાન ગણાશે.'
                  )}
                </div>
              ) : (
              <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8C6239]/20 pb-3">
                  <div>
                    <div className="text-xs font-bold text-[#8C6239]">{L('अष्टकूट गुण मिलान स्कोर', 'Ashtakoot Guna Milan Score', 'અષ્ટકૂટ ગુણ મિલાન સ્કોર')}</div>
                    <div className="text-3xl font-black font-granth text-[#5C3A21]">
                      {milanResult.totalScore} / 36 {L('गुण', 'Gunas', 'ગુણ')}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={`px-4 py-2 rounded-lg font-black text-xs sm:text-sm border ${
                        milanResult.verdictGrade === 'excellent'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : milanResult.verdictGrade === 'good'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}
                    >
                      {milanResult.verdictGrade === 'excellent'
                        ? L('अति उत्तम मिलान (28-36)', 'Excellent Match (28–36)', 'અતિ ઉત્તમ મિલાન (૨૮-૩૬)')
                        : milanResult.verdictGrade === 'good'
                        ? L('शुभ व अनुकूल मिलान (21-27)', 'Good & Auspicious Match (21–27)', 'શુભ અને અનુકૂળ મિલાન (૨૧-૨૭)')
                        : milanResult.verdictGrade === 'average'
                        ? L('मध्यम विवाह योग्य (18-20)', 'Average Match (18–20)', 'મધ્યમ વિવાહ યોગ્ય (૧૮-૨૦)')
                        : L('अस्वीकार्य / दोषयुक्त (<18)', 'Inauspicious / Weak Match (<18)', 'અસ્વીકાર્ય / દોષયુક્ત (<૧૮)')}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!boyKundali || !girlKundali) return;
                        setMilanPosterData({
                          title: L('अष्टकूट विवाह कुंडली मिलान पत्रिका', 'Ashtakoot Marriage Kundali Match Report', 'અષ્ટકૂટ વિવાહ કુંડળી મિલાન પત્રિકા'),
                          reference: `${L('वर', 'Groom', 'વર')}: ${boyKundali.name} (${trRashi(boyKundali.moonRashi, language)}) ❤️ ${L('कन्या', 'Bride', 'કન્યા')}: ${girlKundali.name} (${trRashi(girlKundali.moonRashi, language)})`,
                          sanskrit: `${L('प्राप्त गुण', 'Score', 'પ્રાપ્ત ગુણ')}: ${milanResult.totalScore} / 36 ${L('गुण', 'Gunas', 'ગુણ')}\n${L('मांगलिक विचार', 'Manglik Check', 'માંગલિક વિચાર')}: ${milanResult.manglikAnalysis?.verdict || L('निर्दोष', 'Clear', 'નિર્દોષ')}`,
                          meaning: `${milanResult.verdict}\n\n• ${L('नाड़ी', 'Nadi', 'નાડી')}: ${L('वर', 'Groom', 'વર')} (${trVedic(boyKundali.nadi, language)}) - ${L('कन्या', 'Bride', 'કન્યા')} (${trVedic(girlKundali.nadi, language)})\n• ${L('भकूट', 'Bhakoot', 'ભકૂટ')}: ${milanResult.bhakootDosha?.relationType || L('शुभ', 'Auspicious', 'શુભ')}\n• ${L('रज्जु/वेध', 'Rajju/Vedha', 'રજ્જુ/વેધ')}: ${milanResult.rajjuVedha?.note || L('शुभ', 'Auspicious', 'શુભ')}`,
                          accentTag: L('💍 वैदिक विवाह मेलापक', '💍 Vedic Marriage Melapak', '💍 વૈદિક વિવાહ મેલાપક'),
                        });
                      }}
                      className="px-3.5 py-2 bg-[#6E1409] hover:bg-[#540F07] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>📸 {L('विवाह मिलान HD कार्ड', 'Milan HD Card', 'વિવાહ મિલાન HD કાર્ડ')}</span>
                    </button>

                    <button
                      onClick={handleDownloadMilanPdf}
                      disabled={isDownloadingMilanPdf}
                      className="px-4 py-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isDownloadingMilanPdf
                        ? L('पीडीएफ बन रहा है...', 'Creating PDF...', 'PDF બની રહ્યું છે...')
                        : L('मिलान भोजपत्र PDF', 'Milan Bhojpatra PDF', 'મિલાન ભોજપત્ર PDF')}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed">
                  {milanResult.verdict}
                </p>
              </div>
              )}

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-[#8C6239]">{L('पृष्ठ 1 / 3 (मिलान स्कोर)', 'Page 1 / 3 (Match Score)', 'પૃષ્ઠ ૧ / ૩ (મિલાન સ્કોર)')}</div>
                <button
                  type="button"
                  onClick={() => setMilanSubPage('ashtakoot')}
                  className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{L('अगला: २. अष्टकूट तालिका', 'Next: 2. Ashtakoot Table', 'આગળ: ૨. અષ્ટકૂટ કોષ્ટક')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sub-Page 2: 8 Kootas Detailed Table */}
          {milanSubPage === 'ashtakoot' && !milanResult && (
            <div className="bg-leaf border border-wood/40 rounded-xl p-5 text-sm text-muted">
              {L('पहले वर-कन्या का जन्म विवरण भरें।', 'Please enter Groom & Bride details first.', 'પહેલા વર-કન્યાની જન્મ વિગતો ભરો.')}
            </div>
          )}
          {milanSubPage === 'ashtakoot' && milanResult && (
            <div className="space-y-4">
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>{L('अष्टकूट 8 घटकों का विस्तृत विश्लेषण तालिका', 'Detailed 8 Ashtakoot Factors Analysis Table', 'અષ્ટકૂટ ૮ ઘટકોનું વિસ્તૃત વિશ્લેષણ કોષ્ટક')}</span>
                  <span className="text-[10px] text-[#FFD88A] font-bold">{L('प्राप्त', 'Scored', 'પ્રાપ્ત')}: {milanResult.totalScore}/36</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30">
                      <tr>
                        <th className="py-2.5 px-3">{L('कूट (Factor)', 'Koota (Factor)', 'કૂટ (Factor)')}</th>
                        <th className="py-2.5 px-3">{L('प्राप्त अंक', 'Scored', 'પ્રાપ્ત અંક')}</th>
                        <th className="py-2.5 px-3">{L('अधिकतम', 'Max', 'મહત્તમ')}</th>
                        <th className="py-2.5 px-3">{L('वर स्थिति', 'Groom', 'વર સ્થિતિ')}</th>
                        <th className="py-2.5 px-3">{L('कन्या स्थिति', 'Bride', 'કન્યા સ્થિતિ')}</th>
                        <th className="py-2.5 px-3">{L('फल व विश्लेषण', 'Result & Analysis', 'ફળ અને વિશ્લેષણ')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8C6239]/20">
                      {milanResult.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F4E8D1]/60">
                          <td className="py-2.5 px-3 font-bold text-[#5C3A21]">{item.name}</td>
                          <td className="py-2.5 px-3 font-black text-[#B56A00]">{item.score}</td>
                          <td className="py-2.5 px-3 text-[#735133]">{item.max}</td>
                          <td className="py-2.5 px-3 text-[#5C3A21]">{item.boyValue}</td>
                          <td className="py-2.5 px-3 text-[#5C3A21]">{item.girlValue}</td>
                          <td className="py-2.5 px-3 text-[#5C3A21]">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setMilanSubPage('score')}
                  className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{L('पिछला: १. मिलान स्कोर', 'Prev: 1. Match Score', 'પાછળ: ૧. મિલાન સ્કોર')}</span>
                </button>
                <div className="text-xs font-bold text-[#8C6239]">{L('पृष्ठ 2 / 3', 'Page 2 / 3', 'પૃષ્ઠ ૨ / ૩')}</div>
                <button
                  type="button"
                  onClick={() => setMilanSubPage('manglik')}
                  className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{L('अगला: ३. दोष विचार व चक्र', 'Next: 3. Doshas & Charts', 'આગળ: ૩. દોષ વિચાર અને ચક્ર')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sub-Page 3: Manglik, Nadi, Bhakoot Dosha & Twin Charts */}
          {milanSubPage === 'manglik' && !milanResult && (
            <div className="bg-leaf border border-wood/40 rounded-xl p-5 text-sm text-muted">
              {L('पहले वर-कन्या का जन्म विवरण भरें।', 'Please enter Groom & Bride details first.', 'પહેલા વર-કન્યાની જન્મ વિગતો ભરો.')}
            </div>
          )}
          {milanSubPage === 'manglik' && milanResult && boyKundali && girlKundali && (
            <div className="space-y-4">
              {/* Manglik, Nadi & Bhakoot Dosha Comprehensive Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Manglik Card */}
                <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-1.5">
                    <span className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                      <Flame className="w-4 h-4 text-rose-600" />
                      {L('मांगलिक दोष विचार', 'Manglik Dosha Analysis', 'માંગલિક દોષ વિચાર')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        milanResult.manglikAnalysis?.isCancelled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {milanResult.manglikAnalysis?.verdict || L('विश्लेषण', 'Analysis', 'વિશ્લેષણ')}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C3A21] space-y-1">
                    <div><strong>{L('वर', 'Groom', 'વર')}:</strong> {milanResult.manglikAnalysis?.boyNote}</div>
                    <div><strong>{L('कन्या', 'Bride', 'કન્યા')}:</strong> {milanResult.manglikAnalysis?.girlNote}</div>
                    <div className="text-[11px] text-[#735133] leading-relaxed pt-1">
                      <strong>{L('परिहार', 'Cancellation', 'પરિહાર')}:</strong> {milanResult.manglikAnalysis?.cancellationReason}
                    </div>
                  </div>
                </div>

                {/* Nadi Card */}
                <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-1.5">
                    <span className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                      <Info className="w-4 h-4 text-blue-600" />
                      {L('नाड़ी दोष विचार (8 अंक)', 'Nadi Dosha Check (8 Pts)', 'નાડી દોષ વિચાર (૮ અંક)')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        milanResult.nadiDosha?.hasDosha
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {milanResult.nadiDosha?.hasDosha
                        ? L('समान नाड़ी दोष', 'Same Nadi Dosha', 'સમાન નાડી દોષ')
                        : L('निर्दोष नाड़ी', 'Dosha-Free Nadi', 'નિર્દોષ નાડી')}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C3A21] space-y-1">
                    <div><strong>{L('वर नाड़ी', 'Groom Nadi', 'વર નાડી')}:</strong> {trVedic(boyKundali.nadi, language)} | <strong>{L('कन्या नाड़ी', 'Bride Nadi', 'કન્યા નાડી')}:</strong> {trVedic(girlKundali.nadi, language)}</div>
                    <div className="text-[11px] text-[#735133] leading-relaxed pt-1">
                      {milanResult.nadiDosha?.hasDosha
                        ? milanResult.nadiDosha.remedy
                        : L(
                            'दोनों की भिन्न नाड़ी होने से संतान, स्वास्थ्य व वंश वृद्धि अनुकूल रहेगी।',
                            'Different Nadis indicate favorable health, progeny, and family harmony.',
                            'બંનેની ભિન્ન નાડી હોવાથી સંતાન, સ્વાસ્થ્ય અને વંશ વૃદ્ધિ અનુકૂળ રહેશે.'
                          )}
                    </div>
                  </div>
                </div>

                {/* Bhakoot Card */}
                <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-1.5">
                    <span className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      {L('भकूट दोष विचार (7 अंक)', 'Bhakoot Dosha Check (7 Pts)', 'ભકૂટ દોષ વિચાર (૭ અંક)')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        milanResult.bhakootDosha?.hasDosha
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {milanResult.bhakootDosha?.hasDosha
                        ? L('भकूट दोष', 'Bhakoot Dosha', 'ભકૂટ દોષ')
                        : L('निर्दोष संबंध', 'Auspicious Relation', 'નિર્દોષ સંબંધ')}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C3A21] space-y-1">
                    <div><strong>{L('वर राशि', 'Groom Sign', 'વર રાશિ')}:</strong> {trRashi(boyKundali.moonRashi, language)} | <strong>{L('कन्या राशि', 'Bride Sign', 'કન્યા રાશિ')}:</strong> {trRashi(girlKundali.moonRashi, language)}</div>
                    <div className="text-[11px] text-[#735133] leading-relaxed pt-1">
                      {milanResult.bhakootDosha?.hasDosha
                        ? milanResult.bhakootDosha.remedy
                        : L(
                            'राशि परस्पर शुभ भाव संबंध में होने से प्रेम व सद्भाव की वृद्धि होगी।',
                            'Favorable Moon sign relationship promotes mutual affection and prosperity.',
                            'રાશિ પરસ્પર શુભ ભાવ સંબંધમાં હોવાથી પ્રેમ અને સદભાવની વૃદ્ધિ થશે.'
                          )}
                    </div>
                  </div>
                </div>

                {/* Gana Dosha Card */}
                <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-1.5">
                    <span className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                      <Shield className="w-4 h-4 text-purple-600" />
                      {L('गण दोष विचार (6 अंक)', 'Gana Dosha Check (6 Pts)', 'ગણ દોષ વિચાર (૬ અંક)')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        milanResult.ganaDosha?.hasDosha
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {milanResult.ganaDosha?.hasDosha
                        ? L('गण भेद / दोष', 'Gana Mismatch', 'ગણ ભેદ / દોષ')
                        : L('अनुकूल गण', 'Harmonious Gana', 'અનુકૂળ ગણ')}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C3A21] space-y-1">
                    <div><strong>{L('वर गण', 'Groom Gana', 'વર ગણ')}:</strong> {trVedic(boyKundali.gana, language)} | <strong>{L('कन्या गण', 'Bride Gana', 'કન્યા ગણ')}:</strong> {trVedic(girlKundali.gana, language)}</div>
                    <div className="text-[11px] text-[#735133] leading-relaxed pt-1">
                      {milanResult.ganaDosha?.isPariharApplicable
                        ? `${L('परिहार', 'Cancellation', 'પરિહાર')}: ${milanResult.ganaDosha.pariharReason}`
                        : milanResult.ganaDosha?.hasDosha
                        ? L(
                            'गण भिन्नता होने से स्वभाव व जीवनशैली में समझदारी की आवश्यकता।',
                            'Difference in Gana requires mutual patience and understanding in temperament.',
                            'ગણ ભિન્નતા હોવાથી સ્વભાવ અને જીવનશૈલીમાં સમજદારીની જરૂરિયાત.'
                          )
                        : L(
                            'समान अथवा मित्र गण होने से स्वाभाविक प्रेम व वैवाहिक सुख।',
                            'Same or friendly Gana brings natural compatibility and marital bliss.',
                            'સમાન અથવા મિત્ર ગણ હોવાથી સ્વાભાવિક પ્રેમ અને વૈવાહિક સુખ.'
                          )}
                    </div>
                  </div>
                </div>

                {/* Rajju & Vedha Dosha Card (Dashakoota) */}
                {milanResult.rajjuVedha && (
                  <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-1.5">
                      <span className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                        <Award className="w-4 h-4 text-[#B56A00]" />
                        {L('दशकूट रज्जु एवं नक्षत्र वेध विचार', 'Dashakoota Rajju & Nakshatra Vedha Check', 'દશકૂટ રજ્જુ અને નક્ષત્ર વેધ વિચાર')}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          milanResult.rajjuVedha.hasRajjuDosha || milanResult.rajjuVedha.hasVedhaDosha
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {milanResult.rajjuVedha.hasVedhaDosha
                          ? L('वेध विचारणीय', 'Vedha Needs Review', 'વેધ વિચારણીય')
                          : milanResult.rajjuVedha.hasRajjuDosha
                          ? L('रज्जु साम्य', 'Rajju Match', 'રજ્જુ સામ્ય')
                          : L('रज्जु व वेध शुद्ध', 'Rajju & Vedha Clear', 'રજ્જુ અને વેધ શુદ્ધ')}
                      </span>
                    </div>
                    <div className="text-xs text-[#5C3A21] space-y-1">
                      <div>
                        <strong>{L('वर रज्जु', 'Groom Rajju', 'વર રજ્જુ')}:</strong> {milanResult.rajjuVedha.boyRajju} |{' '}
                        <strong>{L('कन्या रज्जु', 'Bride Rajju', 'કન્યા રજ્જુ')}:</strong> {milanResult.rajjuVedha.girlRajju}
                      </div>
                      <div className="text-[11px] text-[#735133] leading-relaxed pt-1">
                        {milanResult.rajjuVedha.note}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Auspicious Remedies & Conclusions */}
              {milanResult.auspiciousRemedies && milanResult.auspiciousRemedies.length > 0 && (
                <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-bold font-granth text-[#5C3A21] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B56A00]" />
                    {L('विवाह मिलान दोष परिहार एवं शास्त्रोक्त सात्विक उपाय', 'Marriage Dosha Cancellation & Shastric Sattvic Remedies', 'વિવાહ મિલાન દોષ પરિહાર અને શાસ્ત્રોક્ત સાત્વિક ઉપાય')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {milanResult.auspiciousRemedies.map((rem: string, rIdx: number) => (
                      <div key={rIdx} className="flex items-start gap-2 p-2 bg-[#F4E8D1] rounded border border-[#8C6239]/20 text-xs text-[#5C3A21]">
                        <span className="text-[#B56A00] font-bold">ॐ</span>
                        <span>{rem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Twin Charts Comparison: Boy Lagna & Girl Lagna */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                <h4 className="text-sm font-bold font-granth text-[#5C3A21]">
                  {L('वर एवं कन्या के लग्न व नवमांश चक्रों की तुलना', 'Comparison of Groom & Bride Ascendant Charts', 'વર અને કન્યાના લગ્ન ચક્રોની તુલના')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-bold text-blue-900 mb-2">
                      {L('वर लग्न चक्र', 'Groom Ascendant Chart', 'વર લગ્ન ચક્ર')}: {boyKundali.name} ({trRashi(boyKundali.lagnaRashi, language)} {L('लग्न', 'Lagna', 'લગ્ન')})
                    </div>
                    <KundaliChart
                      lagnaDegree={boyKundali.lagnaDegree}
                      planets={boyKundali.planets}
                      vargaDivision={1}
                      chartTitle={`${boyKundali.name} — ${L('लग्न चक्र', 'Lagna Chart', 'લગ્ન ચક્ર')}`}
                    />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-rose-900 mb-2">
                      {L('कन्या लग्न चक्र', 'Bride Ascendant Chart', 'કન્યા લગ્ન ચક્ર')}: {girlKundali.name} ({trRashi(girlKundali.lagnaRashi, language)} {L('लग्न', 'Lagna', 'લગ્ન')})
                    </div>
                    <KundaliChart
                      lagnaDegree={girlKundali.lagnaDegree}
                      planets={girlKundali.planets}
                      vargaDivision={1}
                      chartTitle={`${girlKundali.name} — ${L('लग्न चक्र', 'Lagna Chart', 'લગ્ન ચક્ર')}`}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setMilanSubPage('ashtakoot')}
                  className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{L('पिछला: २. अष्टकूट तालिका', 'Prev: 2. Ashtakoot Table', 'પાછળ: ૨. અષ્ટકૂટ કોષ્ટક')}</span>
                </button>
                <div className="text-xs font-bold text-[#8C6239]">{L('पृष्ठ 3 / 3 (दोष विचार व चक्र)', 'Page 3 / 3 (Doshas & Charts)', 'પૃષ્ઠ ૩ / ૩ (દોષ વિચાર અને ચક્ર)')}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Shani Sade Sati & Daily Planetary Transits (Gochar) */}
      {kundaliTab === 'sadesati' && (
        <SadeSatiView
          activeKundali={k}
          currentLocation={selectedCity}
          onNavigateToKundali={() => setIsFormExpanded(true)}
        />
      )}

      {/* Tab: KP System, Ashtakvarga & Jaimini Chara Dasha */}
      {kundaliTab === 'kp_ashtakvarga' && (
        k ? (
          <KpAshtakvargaPanel kundali={k} />
        ) : (
          <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-6 text-center space-y-2">
            <User className="w-8 h-8 text-[#B56A00] mx-auto" />
            <h3 className="font-granth font-bold text-[#5C3A21] text-base">
              {L('केपी व अष्टकवर्ग हेतु जातक कुण्डली आवश्यक है', 'Native Kundali is required for KP & Ashtakvarga', 'KP અને અષ્ટકવર્ગ માટે જાતક કુંડળી જરૂરી છે')}
            </h3>
            <p className="text-xs text-[#735133] max-w-md mx-auto leading-relaxed">
              {L(
                'कृपया ऊपर जातक का नाम, जन्म तिथि, सही जन्म समय और स्थान भरकर "कुंडली बनाएँ और सहेजें" दबाएँ।',
                'Please enter name, birth date, exact time, and place above and tap "Create & Save Kundali".',
                'કૃપા કરીને ઉપર જાતકનું નામ, જન્મ તારીખ, સાચો સમય અને સ્થળ ભરીને "કુંડળી બનાવો અને સાચવો" દબાવો.'
              )}
            </p>
          </div>
        )
      )}

      {/* Tab 4: Prashna Jyotish, Mook Prashna, Ramshalaka & Hanuman Prashnavali */}
      {kundaliTab === 'prashna' && (
        <PrashnaJyotishPanel currentLocation={selectedCity} />
      )}

      {/* Tab 5: Vedic Remedies, Gemstone & 100 Lal Kitab Upay */}
      {kundaliTab === 'remedies' && (
        <div className="space-y-6">
          {remedies && k && (
            <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold font-granth text-[#5C3A21] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#B56A00]" />
                  {L(
                    `${k.name} हेतु वैदिक उपाय, रत्न एवं इष्टदेव मार्गदर्शन`,
                    `Vedic Remedies, Gemstone & Ishta Devata Guide for ${k.name}`,
                    `${k.name} માટે વૈદિક ઉપાય, રત્ન અને ઇષ્ટદેવ માર્ગદર્શન`
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUpayParchiOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] hover:brightness-110 text-[#FFD88A] text-xs font-bold rounded-lg shadow-sm border border-[#B58738] flex items-center gap-1.5 cursor-pointer transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>📋 {L('पारंपरिक ६-सूत्रीय उपाय पर्ची (Prescription Pad) खोलें', 'Open Traditional 6-Point Remedy Slip', 'પારંપરિક ૬-સૂત્રીય ઉપાય પર્ચી ખોલો')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
                  <div className="text-[11px] text-[#8C6239] font-bold">{L('शुभ रत्न (Lucky Gemstone)', 'Lucky Gemstone', 'શુભ રત્ન (Lucky Gemstone)')}</div>
                  <div className="text-sm font-black text-[#5C3A21] mt-1">{remedies.luckyGemstone}</div>
                </div>

                <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
                  <div className="text-[11px] text-[#8C6239] font-bold">{L('इष्ट देव (Ishta Devata)', 'Ishta Devata', 'ઇષ્ટ દેવ (Ishta Devata)')}</div>
                  <div className="text-sm font-black text-[#5C3A21] mt-1">{remedies.ishtaDevata}</div>
                </div>

                <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
                  <div className="text-[11px] text-[#8C6239] font-bold">{L('शुभ रंग (Lucky Color)', 'Lucky Color', 'શુભ રંગ (Lucky Color)')}</div>
                  <div className="text-sm font-black text-[#5C3A21] mt-1">{remedies.luckyColor}</div>
                </div>
              </div>

              <div className="bg-[#F4E8D1] p-4 rounded-lg border border-[#8C6239]/20">
                <div className="text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-1">
                  {L('महामंत्र (Mantra)', 'Maha Mantra', 'મહામંત્ર (Mantra)')}
                </div>
                <p className="text-xs sm:text-sm font-black text-[#5C3A21] leading-relaxed">
                  {remedies.mantra}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
                  {L('दैनिक वैदिक उपाय (Daily Upay)', 'Daily Vedic Remedies', 'દૈનિક વૈદિક ઉપાય')}
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[#5C3A21]">
                  {remedies.remedies.map((u: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#B56A00] font-bold">✓</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 🌟 त्रिवेणी रत्न शोधन (Triveni Gemology: Kundali + Ank Jyotish + Gotra) 🌟 */}
          {triveniResult && (
            <div className="bg-[#FAF2E4] border-2 border-[#B58738]/60 rounded-2xl p-5 sm:p-6 shadow-md space-y-5 text-[#5C3A21]">
              {/* Header with Title and Gotra Dropdown */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#8C6239]/20 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7A1D1D]/10 text-[#7A1D1D] text-[11px] font-black uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                    <span>{L('त्रिवेणी रत्न शोधन पद्धति (Triveni Ratna Shodhan)', 'Triveni Gemology Method', 'ત્રિવેણી રત્ન શોધન પદ્ધતિ')}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-granth text-[#5C3A21]">
                    {L(
                      'कुण्डली + अंक ज्योतिष + गोत्र अनुसार सटीक रत्न निर्णय',
                      'Exact Gemstone Decision by Kundali + Numerology + Gotra',
                      'કુંડળી + અંક જ્યોતિષ + ગોત્ર અનુસાર સચોટ રત્ન નિર્ણય'
                    )}
                  </h3>
                  <p className="text-xs text-[#8C6239] mt-0.5">
                    {L(
                      'केवल राशि से नहीं, बल्कि लग्नेश-त्रिकोण, मूलांक-भाग्यांक तथा गोत्र-ऋषिकुल के तत्व व धातु समन्वय से प्रमाणित।',
                      'Certified not by sign alone, but by Ascendant-Trikona lords, Mulank-Bhagyank, and Gotra Rishi element & metal synergy.',
                      'ફક્ત રાશિથી નહીં, પરંતુ લગ્નેશ-ત્રિકોણ, મૂળાંક-ભાગ્યાંક તથા ગોત્ર-ઋષિકુળના તત્વ અને ધાતુ સમન્વયથી પ્રમાણિત.'
                    )}
                  </p>
                </div>

                {/* Gotra Selector Button */}
                <button
                  type="button"
                  onClick={() => setIsGotraModalOpen(true)}
                  className="flex items-center gap-2 bg-[#F4E8D1] hover:bg-[#EBDBC0] border border-[#B58738]/60 px-3 py-1.5 rounded-xl text-xs font-bold text-[#5C3A21] cursor-pointer transition shadow-xs"
                >
                  <span className="text-[#7A1D1D] font-black">{L('गोत्र:', 'Gotra:', 'ગોત્ર:')}</span>
                  <span className="font-bold underline text-[#7A1D1D]">
                    {getLocalizedGotra(GOTRA_LIST.find((g) => g.id === selectedGotraId) || GOTRA_LIST[0], language).name}
                  </span>
                  <span className="text-[10px] text-[#B56A00]">{L('बदलें ▾', 'Change ▾', 'બદલો ▾')}</span>
                </button>
              </div>

              {/* 3 Pillars Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Pillar 1: Kundali Trikona */}
                <div className="bg-[#F4E8D1]/80 rounded-xl p-3.5 border border-[#8C6239]/25 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#7A1D1D] mb-1">
                      <span>{L('१. कुण्डली त्रिकोण स्तंभ', '1. Kundali Trikona Pillar', '૧. કુંડળી ત્રિકોણ સ્તંભ')}</span>
                      <Crown className="w-3.5 h-3.5 text-[#B56A00]" />
                    </div>
                    <div className="text-xs font-black text-[#5C3A21]">
                      {L('लग्न', 'Lagna', 'લગ્ન')}: {triveniResult.lagnaSign} ({L('स्वामी', 'Lord', 'સ્વામી')}: {triveniResult.lagnaLord})
                    </div>
                    <div className="text-[11px] text-[#8C6239] mt-1 leading-snug">
                      {L('चंद्र राशि', 'Moon Sign', 'ચંદ્ર રાશિ')}: {triveniResult.moonSign} • {L('नक्षत्र', 'Nakshatra', 'નક્ષત્ર')}: {triveniResult.nakshatra}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-[#7A1D1D] bg-[#FAF2E4] px-2 py-1 rounded border border-[#8C6239]/20">
                    {L('मारक (२, ७) व त्रिक (६, ८, १२) दोष परिहारित', 'Maraka (2, 7) & Trik (6, 8, 12) Lords Excluded', 'મારક (૨, ૭) અને ત્રિક (૬, ૮, ૧૨) દોષ પરિહારિત')}
                  </div>
                </div>

                {/* Pillar 2: Ank Jyotish */}
                <div className="bg-[#F4E8D1]/80 rounded-xl p-3.5 border border-[#8C6239]/25 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#7A1D1D] mb-1">
                      <span>{L('२. अंक ज्योतिष स्तंभ', '2. Numerology Pillar', '૨. અંક જ્યોતિષ સ્તંભ')}</span>
                      <Zap className="w-3.5 h-3.5 text-[#B56A00]" />
                    </div>
                    <div className="text-xs font-black text-[#5C3A21]">
                      {L('मूलांक', 'Mulank', 'મૂળાંક')} {triveniResult.mulank} ({triveniResult.mulankPlanet}) • {L('भाग्यांक', 'Bhagyank', 'ભાગ્યાંક')} {triveniResult.bhagyank} ({triveniResult.bhagyankPlanet})
                    </div>
                    <div className="text-[11px] text-[#8C6239] mt-1 leading-snug">
                      {L('गण प्रवृत्ति:', 'Gana Nature:', 'ગણ પ્રવૃત્તિ:')} <span className="font-bold text-[#5C3A21]">{triveniResult.ganaClassification}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-[#7A1D1D] bg-[#FAF2E4] px-2 py-1 rounded border border-[#8C6239]/20">
                    {L('संख्या रश्मि:', 'Number Ray:', 'સંખ્યા રશ્મિ:')} {triveniResult.mulankGem}
                  </div>
                </div>

                {/* Pillar 3: Gotra & Rishi Kula */}
                <div className="bg-[#F4E8D1]/80 rounded-xl p-3.5 border border-[#8C6239]/25 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#7A1D1D] mb-1">
                      <span>{L('३. गोत्र व ऋषिकुल स्तंभ', '3. Gotra & Rishi Lineage', '૩. ગોત્ર અને ઋષિકુળ સ્તંભ')}</span>
                      <Flame className="w-3.5 h-3.5 text-[#B56A00]" />
                    </div>
                    <div className="text-xs font-black text-[#5C3A21]">
                      {L('गोत्र:', 'Gotra:', 'ગોત્ર:')} {triveniResult.gotra.name}
                    </div>
                    <div className="text-[11px] text-[#8C6239] mt-1 leading-snug">
                      {L('तत्व:', 'Element:', 'તત્વ:')} <span className="font-bold text-[#5C3A21]">{triveniResult.gotra.element}</span> • {L('ऋषि:', 'Rishi:', 'ઋષિ:')} {triveniResult.gotra.rishi}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-[#7A1D1D] bg-[#FAF2E4] px-2 py-1 rounded border border-[#8C6239]/20">
                    {L('गोत्रानुकूल धातु:', 'Gotra Metals:', 'ગોત્રાનુકૂળ ધાતુ:')} {triveniResult.gotra.favoredMetals.join(', ')}
                  </div>
                </div>
              </div>

              {/* Primary Recommended Stone & Secondary Bhagya Stone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Life Stone */}
                <div className="bg-gradient-to-br from-[#FFF8ED] to-[#F4E8D1] border-2 border-[#B58738] rounded-xl p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#7A1D1D] text-[#FFD88A] text-[11px] font-black tracking-wide">
                      {L('मुख्य जीवन रत्न (Primary Life Stone)', 'Primary Life Stone', 'મુખ્ય જીવન રત્ન (Primary Life Stone)')}
                    </span>
                    <span className="text-xs font-bold text-[#8C6239]">
                      {triveniResult.primaryLifeStone.planetRole} ({triveniResult.primaryLifeStone.planet})
                    </span>
                  </div>

                  <div className="text-base sm:text-lg font-black text-[#7A1D1D]">
                    💎 {triveniResult.primaryLifeStone.gem}
                  </div>
                  <div className="text-xs text-[#8C6239]">
                    {L('उपरत्न:', 'Substitute Gem:', 'ઉપરત્ન:')} <span className="font-bold text-[#5C3A21]">{triveniResult.primaryLifeStone.subGem}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                      <span className="text-[10px] font-bold text-[#8C6239] block">{L('वजन (Weight):', 'Weight:', 'વજન (Weight):')}</span>
                      <span className="font-bold text-[#5C3A21]">{triveniResult.primaryLifeStone.weightRatti}</span>
                    </div>
                    <div className="bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                      <span className="text-[10px] font-bold text-[#8C6239] block">{L('धातु (Metal):', 'Metal:', 'ધાતુ (Metal):')}</span>
                      <span className="font-bold text-[#5C3A21]">{triveniResult.primaryLifeStone.metal}</span>
                    </div>
                    <div className="bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                      <span className="text-[10px] font-bold text-[#8C6239] block">{L('अंगुली (Finger):', 'Finger:', 'આંગળી (Finger):')}</span>
                      <span className="font-bold text-[#5C3A21]">{triveniResult.primaryLifeStone.finger}</span>
                    </div>
                    <div className="bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                      <span className="text-[10px] font-bold text-[#8C6239] block">{L('दिन व वेला:', 'Day & Hora:', 'દિવસ અને વેળા:')}</span>
                      <span className="font-bold text-[#5C3A21]">{triveniResult.primaryLifeStone.day} ({triveniResult.primaryLifeStone.choghadiya})</span>
                    </div>
                  </div>

                  <div className="text-xs bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                    <span className="text-[10px] font-bold text-[#7A1D1D] block">{L('जाप बीज मंत्र:', 'Beej Mantra:', 'જાપ બીજ મંત્ર:')}</span>
                    <span className="font-black text-[#7A1D1D] font-mono">{triveniResult.primaryLifeStone.beejMantra}</span>
                  </div>
                  <p className="text-[11px] text-[#5C3A21] leading-relaxed pt-1">
                    {triveniResult.primaryLifeStone.shastricReason}
                  </p>
                </div>

                {/* Secondary / Bhagya Stone or Rudraksha Synergy */}
                {triveniResult.secondaryBhagyaStone ? (
                  <div className="bg-[#F4E8D1] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#8C6239] text-[#FAF2E4] text-[11px] font-black tracking-wide">
                        {L('सहायक भाग्य रत्न (Secondary Bhagya Stone)', 'Secondary Bhagya Stone', 'સહાયક ભાગ્ય રત્ન')}
                      </span>
                      <span className="text-xs font-bold text-[#8C6239]">
                        {triveniResult.secondaryBhagyaStone.planetRole} ({triveniResult.secondaryBhagyaStone.planet})
                      </span>
                    </div>

                    <div className="text-base sm:text-lg font-black text-[#5C3A21]">
                      ✨ {triveniResult.secondaryBhagyaStone.gem}
                    </div>
                    <div className="text-xs text-[#8C6239]">
                      {L('उपरत्न:', 'Substitute Gem:', 'ઉપરત્ન:')} <span className="font-bold text-[#5C3A21]">{triveniResult.secondaryBhagyaStone.subGem}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                        <span className="text-[10px] font-bold text-[#8C6239] block">{L('वजन (Weight):', 'Weight:', 'વજન (Weight):')}</span>
                        <span className="font-bold text-[#5C3A21]">{triveniResult.secondaryBhagyaStone.weightRatti}</span>
                      </div>
                      <div className="bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                        <span className="text-[10px] font-bold text-[#8C6239] block">{L('धातु (Metal):', 'Metal:', 'ધાતુ (Metal):')}</span>
                        <span className="font-bold text-[#5C3A21]">{triveniResult.secondaryBhagyaStone.metal}</span>
                      </div>
                      <div className="bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                        <span className="text-[10px] font-bold text-[#8C6239] block">{L('अंगुली (Finger):', 'Finger:', 'આંગળી (Finger):')}</span>
                        <span className="font-bold text-[#5C3A21]">{triveniResult.secondaryBhagyaStone.finger}</span>
                      </div>
                      <div className="bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                        <span className="text-[10px] font-bold text-[#8C6239] block">{L('दिन व वेला:', 'Day:', 'દિવસ અને વેળા:')}</span>
                        <span className="font-bold text-[#5C3A21]">{triveniResult.secondaryBhagyaStone.day}</span>
                      </div>
                    </div>

                    <div className="text-xs bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20">
                      <span className="text-[10px] font-bold text-[#7A1D1D] block">{L('जाप बीज मंत्र:', 'Beej Mantra:', 'જાપ બીજ મંત્ર:')}</span>
                      <span className="font-black text-[#7A1D1D] font-mono">{triveniResult.secondaryBhagyaStone.beejMantra}</span>
                    </div>
                    <p className="text-[11px] text-[#5C3A21] leading-relaxed pt-1">
                      {triveniResult.secondaryBhagyaStone.shastricReason}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#F4E8D1] border border-[#8C6239]/40 rounded-xl p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#B56A00] text-white text-[11px] font-black tracking-wide">
                          {L('रुद्राक्ष कवच (Protective Rudraksha)', 'Protective Rudraksha Kavach', 'રુદ્રાક્ષ કવચ (Protective Rudraksha)')}
                        </span>
                        <span className="text-xs font-bold text-[#8C6239]">
                          {triveniResult.remedialRudraksha.planet}
                        </span>
                      </div>
                      <div className="text-base font-black text-[#5C3A21]">
                        📿 {triveniResult.remedialRudraksha.mukhi}
                      </div>
                      <p className="text-xs text-[#5C3A21] mt-2 leading-relaxed">
                        {triveniResult.remedialRudraksha.benefits}
                      </p>
                    </div>
                    <div className="text-[11px] text-[#8C6239] bg-[#FAF2E4] p-2 rounded border border-[#8C6239]/20 mt-3">
                      {L(
                        'प्राण-प्रतिष्ठा: सोमवार अथवा शिवरात्रि के दिन गंगाजल व पंचामृत से अभिमंत्रित कर लाल धागे में धारण करें।',
                        'Consecration: Purify with Gangajal & Panchamrit on Monday or Shivaratri and wear in a red thread.',
                        'પ્રાણ-પ્રતિષ્ઠા: સોમવાર અથવા શિવરાત્રિના દિવસે ગંગાજળ અને પંચામૃતથી અભિમંત્રિત કરી લાલ દોરામાં ધારણ કરો.'
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Forbidden Gemstones Warning (कदापि धारण न करें) */}
              {triveniResult.forbiddenGems && triveniResult.forbiddenGems.length > 0 && (
                <div className="bg-[#FFF1F1] border-2 border-[#D9534F]/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-[#C9302C]">
                    <AlertTriangle className="w-4 h-4 text-[#C9302C]" />
                    <span>{L('शास्त्रीय निषेध (Strictly Forbidden Gemstones): भूलकर भी न पहनें', 'Strictly Forbidden Gemstones: Do NOT Wear', 'શાસ્ત્રીય નિષેધ (Strictly Forbidden Gemstones): ભૂલથી પણ ન પહેરો')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {triveniResult.forbiddenGems.map((f, idx) => (
                      <div key={idx} className="bg-white/90 p-2.5 rounded-lg border border-[#D9534F]/20 text-xs">
                        <div className="font-bold text-[#C9302C] flex items-center justify-between">
                          <span>❌ {f.gem} ({f.planet})</span>
                          <span className="text-[10px] bg-[#FFF1F1] px-1.5 py-0.5 rounded text-[#A94442] font-semibold">{f.role}</span>
                        </div>
                        <p className="text-[11px] text-[#5C3A21] mt-1 leading-snug">
                          {f.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vedic Sankalpa Mantra */}
              <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-4 space-y-1.5">
                <div className="text-xs font-bold text-[#7A1D1D] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{L('रत्न धारण वैदिक संकल्प मंत्र (Vedic Sankalpa Mantra):', 'Vedic Sankalpa Mantra for Wearing Gemstone:', 'રત્ન ધારણ વૈદિક સંકલ્પ મંત્ર:')}</span>
                </div>
                <div className="text-xs sm:text-sm font-black text-[#5C3A21] font-mono leading-relaxed bg-[#FAF2E4] p-3 rounded-lg border border-[#8C6239]/20 select-all">
                  {triveniResult.sankalpaMantra}
                </div>
                <p className="text-[11px] text-[#8C6239]">
                  {L(
                    'विधि: शुभ मुहूर्त में पूर्वाभिमुख बैठकर ताम्रपात्र में गंगाजल, कच्चा दूध, तुलसीदल रखकर रत्न को स्नान कराएं तथा १०८ बार बीज मंत्र जप कर धारण करें।',
                    'Procedure: Face East in an auspicious Muhurat, bathe the gem in a copper vessel with Gangajal, raw milk & Tulsi, chant the Beej Mantra 108 times, and wear.',
                    'વિધિ: શુભ મુહૂર્તમાં પૂર્વાભિમુખ બેસી તાંબાના પાત્રમાં ગંગાજળ, કાચું દૂધ, તુલસીદળ રાખી રત્નને સ્નાન કરાવો તથા ૧૦૮ વાર બીજ મંત્ર જપી ધારણ કરો.'
                  )}
                </p>
              </div>

              {/* Actions: Open Upay Parchi & Copy Triveni Details */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpayParchiOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] hover:brightness-110 text-[#FFD88A] text-xs font-bold rounded-lg shadow-sm border border-[#B58738] flex items-center gap-2 cursor-pointer transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>📋 {L('इस निर्णय को उपाय पर्ची (Prescription Pad) में देखें', 'View This Report in Remedy Slip', 'આ નિર્ણયને ઉપાય પર્ચીમાં જુઓ')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = [
                      L(`॥ त्रिवेणी रत्न शोधन निर्णय ॥`, `|| Triveni Gemology Report ||`, `॥ ત્રિવેણી રત્ન શોધન નિર્ણય ॥`),
                      `${L('जातक', 'Native', 'જાતક')}: ${triveniResult.personName}`,
                      `${L('लग्न', 'Ascendant', 'લગ્ન')}: ${triveniResult.lagnaSign} (${L('स्वामी', 'Lord', 'સ્વામી')}: ${triveniResult.lagnaLord})`,
                      `${L('मूलांक', 'Mulank', 'મૂળાંક')}: ${triveniResult.mulank} (${triveniResult.mulankPlanet}) | ${L('भाग्यांक', 'Bhagyank', 'ભાગ્યાંક')}: ${triveniResult.bhagyank} (${triveniResult.bhagyankPlanet})`,
                      `${L('गोत्र', 'Gotra', 'ગોત્ર')}: ${triveniResult.gotra.name} (${triveniResult.gotra.element})`,
                      `---------------------------------------`,
                      `${L('मुख्य जीवन रत्न', 'Primary Life Stone', 'મુખ્ય જીવન રત્ન')}: ${triveniResult.primaryLifeStone.gem} (${triveniResult.primaryLifeStone.weightRatti})`,
                      `${L('धातु', 'Metal', 'ધાતુ')}: ${triveniResult.primaryLifeStone.metal} | ${L('अंगुली', 'Finger', 'આંગળી')}: ${triveniResult.primaryLifeStone.finger}`,
                      `${L('वार व वेला', 'Day & Hora', 'વાર અને વેળા')}: ${triveniResult.primaryLifeStone.day} (${triveniResult.primaryLifeStone.choghadiya})`,
                      `${L('बीज मंत्र', 'Beej Mantra', 'બીજ મંત્ર')}: ${triveniResult.primaryLifeStone.beejMantra}`,
                      triveniResult.secondaryBhagyaStone ? `${L('सहायक रत्न', 'Secondary Stone', 'સહાયક રત્ન')}: ${triveniResult.secondaryBhagyaStone.gem} (${triveniResult.secondaryBhagyaStone.metal})` : '',
                      `${L('वर्जित रत्न', 'Forbidden Gems', 'વર્જિત રત્ન')}: ${triveniResult.forbiddenGems.map(f => f.gem).join(', ') || L('कोई नहीं', 'None', 'કોઈ નહીં')}`,
                      `---------------------------------------`,
                      `${L('संकल्प', 'Sankalpa Mantra', 'સંકલ્પ')}: ${triveniResult.sankalpaMantra}`,
                    ].filter(Boolean).join('\n');

                    navigator.clipboard.writeText(text);
                    setCopiedTriveni(true);
                    setTimeout(() => setCopiedTriveni(false), 2500);
                  }}
                  className="px-3.5 py-2 bg-[#F4E8D1] hover:bg-[#EBDBC0] text-[#5C3A21] text-xs font-bold rounded-lg border border-[#8C6239]/40 flex items-center gap-1.5 cursor-pointer transition"
                >
                  {copiedTriveni ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">{L('प्रतिलिपि बन गई (Copied)', 'Copied!', 'કોપી થયું (Copied)')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-[#8C6239]" />
                      <span>{L('त्रिवेणी रत्न विवरण कॉपी करें', 'Copy Triveni Gem Details', 'ત્રિવેણી રત્ન વિગતો કોપી કરો')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <LalKitabUpayListView onAskUma={() => onOpenUmaModal?.()} />
        </div>
      )}

      {/* HD Vivah Milan Poster Card Modal */}
      <ShlokaPosterModal
        isOpen={milanPosterData !== null}
        onClose={() => setMilanPosterData(null)}
        data={milanPosterData}
      />

      {/* ₹99 / Year Annual Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        reason={subscriptionReason}
      />

      {/* Traditional 6-Point Astrologer Upay Parchi (Prescription Pad) Modal */}
      <UpayParchiModal
        isOpen={isUpayParchiOpen}
        onClose={() => setIsUpayParchiOpen(false)}
        activeKundali={k}
        onOpenVishnuSahasranama={() => {
          if (onNavigateTab) {
            onNavigateTab('vishnu_sahasranama');
          } else {
            window.dispatchEvent(
              new CustomEvent('navigate-to-tab', { detail: { tab: 'vishnu_sahasranama' } })
            );
          }
        }}
      />

      {/* In-App Vedic Date Picker Modal */}
      <VedicDatePickerModal
        isOpen={isDatePickerOpen}
        value={pickerTarget === 'main' ? dob : pickerTarget === 'boy' ? boyDob : girlDob}
        onChange={(newDate) => {
          if (pickerTarget === 'main') setDob(newDate);
          else if (pickerTarget === 'boy') setBoyDob(newDate);
          else setGirlDob(newDate);
        }}
        onClose={() => setIsDatePickerOpen(false)}
        title={
          pickerTarget === 'main'
            ? undefined
            : pickerTarget === 'boy'
            ? L('वर की जन्म तिथि चुनें', 'Select Groom Date of Birth', 'વરની જન્મ તારીખ પસંદ કરો')
            : L('कन्या की जन्म तिथि चुनें', 'Select Bride Date of Birth', 'કન્યાની જન્મ તારીખ પસંદ કરો')
        }
      />

      {/* In-App Vedic Time Picker Modal */}
      <VedicTimePickerModal
        isOpen={isTimePickerOpen}
        value={pickerTarget === 'main' ? tob : pickerTarget === 'boy' ? boyTob : girlTob}
        onChange={(newTime) => {
          if (pickerTarget === 'main') setTob(newTime);
          else if (pickerTarget === 'boy') setBoyTob(newTime);
          else setGirlTob(newTime);
        }}
        onClose={() => setIsTimePickerOpen(false)}
        title={
          pickerTarget === 'main'
            ? undefined
            : pickerTarget === 'boy'
            ? L('वर का जन्म समय चुनें', 'Select Groom Birth Time', 'વરનો જન્મ સમય પસંદ કરો')
            : L('कन्या का जन्म समय चुनें', 'Select Bride Birth Time', 'કન્યાનો જન્મ સમય પસંદ કરો')
        }
      />

      {/* 🌟 Dedicated In-App Vedic Gotra Selector Modal (100% Android & Mobile Friendly) 🌟 */}
      {isGotraModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#5C1414] via-[#7A1D1D] to-[#5C1414] text-[#FFD88A] p-4 flex items-center justify-between border-b border-[#B58738]/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪷</span>
                <div>
                  <h3 className="font-bold text-base font-granth text-white leading-tight">
                    {L('वैदिक गोत्र व ऋषिकुल चयन', 'Vedic Gotra & Rishi Lineage', 'વૈદિક ગોત્ર અને ઋષિકુળ પસંદગી')}
                  </h3>
                  <p className="text-[11px] text-[#E6C687]">
                    {L('त्रिवेणी रत्न शोधन, धातु व संकल्प अनुकूलता हेतु', 'For Triveni Gemology, metal & Sankalpa alignment', 'ત્રિવેણી રત્ન શોધન, ધાતુ અને સંકલ્પ અનુકૂળતા માટે')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsGotraModalOpen(false);
                  setGotraSearchQuery('');
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 bg-[#F4E8D1] border-b border-[#8C6239]/20 shrink-0">
              <input
                type="text"
                value={gotraSearchQuery}
                onChange={(e) => setGotraSearchQuery(e.target.value)}
                placeholder={L(
                  'गोत्र खोजें (उदा. कश्यप, भारद्वाज, पुलस्त्य, भृगु...)',
                  'Search Gotra (e.g. Kashyapa, Bharadwaj, Pulastya, Bhrigu...)',
                  'ગોત્ર શોધો (દા.ત. કશ્યપ, ભારદ્વાજ, પુલસ્ત્ય, ભૃગુ...)'
                )}
                className="w-full bg-white border border-[#8C6239]/40 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#5C3A21] placeholder-[#8C6239]/70 focus:ring-2 focus:ring-[#B56A00] outline-none"
                autoFocus
              />
            </div>

            {/* Gotra List */}
            <div className="overflow-y-auto p-3 space-y-2 flex-1 divide-y divide-[#8C6239]/15">
              {GOTRA_LIST.filter((g) => {
                const q = gotraSearchQuery.trim().toLowerCase();
                if (!q) return true;
                const gLoc = getLocalizedGotra(g, language);
                return (
                  g.name.toLowerCase().includes(q) ||
                  g.nameEn.toLowerCase().includes(q) ||
                  g.rishi.toLowerCase().includes(q) ||
                  gLoc.name.toLowerCase().includes(q) ||
                  gLoc.rishi.toLowerCase().includes(q)
                );
              }).map((g) => {
                const isSelected = (formGotra || selectedGotraId) === g.id;
                const gLoc = getLocalizedGotra(g, language);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setFormGotra(g.id);
                      setSelectedGotraId(g.id);
                      if (k) {
                        k.gotra = g.id;
                      }
                      setIsGotraModalOpen(false);
                      setGotraSearchQuery('');
                    }}
                    className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#5C1414]/10 border-2 border-[#7A1D1D] shadow-xs'
                        : 'hover:bg-[#F4E8D1] border border-transparent'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#5C3A21]">{gLoc.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-[#7A1D1D] text-[#FFD88A] px-2 py-0.5 rounded-full font-bold">
                            {L('चयनित ✓', 'Selected ✓', 'પસંદ કરેલ ✓')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#7A1D1D] font-bold">
                        {gLoc.rishi} • <span className="text-[#8C6239] font-normal">{L('तत्व:', 'Element:', 'તત્વ:')} {gLoc.element}</span>
                      </div>
                      <div className="text-[11px] text-[#5C3A21]/80 leading-relaxed">
                        {L('अनुकूल धातु:', 'Favored Metals:', 'અનુકૂળ ધાતુ:')} <span className="font-bold text-[#5C3A21]">{gLoc.favoredMetals.join(', ')}</span>
                      </div>
                      <div className="text-[10px] text-[#8C6239] leading-snug">
                        {gLoc.description}
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#7A1D1D] bg-[#7A1D1D] text-white'
                            : 'border-[#8C6239]/40 bg-white'
                        }`}
                      >
                        {isSelected && <span className="text-[11px] font-bold">✓</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#F4E8D1] border-t border-[#8C6239]/20 flex items-center justify-between text-xs text-[#8C6239] shrink-0">
              <span>{L(`कुल ${GOTRA_LIST.length} प्रामाणिक वैदिक गोत्र उपलब्ध`, `${GOTRA_LIST.length} Authentic Vedic Gotras Available`, `કુલ ${GOTRA_LIST.length} પ્રામાણિક વૈદિક ગોત્ર ઉપલબ્ધ`)}</span>
              <button
                type="button"
                onClick={() => {
                  setIsGotraModalOpen(false);
                  setGotraSearchQuery('');
                }}
                className="px-4 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] font-bold rounded-lg cursor-pointer"
              >
                {L('बंद करें', 'Close', 'બંધ કરો')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
