import React, { useState, useEffect, useRef } from 'react';
import { KundaliData, SavedLocation, DashaPratyantarPeriod } from '../types';
import { KundaliChart } from './KundaliChart';
import { LocationModal } from './LocationModal';
import {
  calculateKundali,
  calculateAshtakootMilan,
  generatePrashnaKundali,
  getVedicRemedies,
  calculatePratyantarPeriods,
} from '../services/kundali';
import { COMMON_INDIAN_CITIES } from '../services/disha';
import {
  saveKundaliProfile,
  DEFAULT_LOCATION,
  getSubscriptionStatus,
  SubscriptionStatus,
} from '../services/storage';
import { calculateVedicPanchang } from '../services/astronomy';
import { downloadMilanBhojpatraPdf, downloadBhojpatraPdf } from '../services/bhojpatraPdf';
import { generateExhaustive59PageKundaliPdf } from '../services/exhaustiveKundaliPdf';
import { PdfSuccessModal, PdfSuccessInfo } from './PdfSuccessModal';
import { SubscriptionModal } from './SubscriptionModal';
import {
  User,
  Clock,
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

interface KundaliViewProps {
  activeKundali: KundaliData | null;
  setActiveKundali: (k: KundaliData) => void;
  currentLocation: SavedLocation;
  onOpenSavedModal: () => void;
  initialSubTab?: 'chart' | 'dasha' | 'milan' | 'prashna' | 'remedies';
}

export const KundaliView: React.FC<KundaliViewProps> = ({
  activeKundali,
  setActiveKundali,
  currentLocation,
  onOpenSavedModal,
  initialSubTab,
}) => {
  // Active Sub-Tab
  const [kundaliTab, setKundaliTab] = useState<'chart' | 'dasha' | 'milan' | 'prashna' | 'remedies'>(
    initialSubTab || 'chart'
  );

  useEffect(() => {
    if (initialSubTab) {
      setKundaliTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Varga selector state
  const [selectedVarga, setSelectedVarga] = useState<number>(1);
  const [chartViewMode, setChartViewMode] = useState<'twin' | 'shodashvarga'>('twin');
  const [chartSubPage, setChartSubPage] = useState<'twin' | 'planets' | 'vargas'>('twin');
  const [milanSubPage, setMilanSubPage] = useState<'score' | 'ashtakoot' | 'manglik'>('score');
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(false);
  const [vargaListFilter, setVargaListFilter] = useState<'shodash' | 'all60'>('shodash');

  // Kundali Input Form State - clean neutral default profile
  const [name, setName] = useState('श्री जातक');
  const [dob, setDob] = useState('1995-01-01');
  const [tob, setTob] = useState('12:00');
  const [selectedCity, setSelectedCity] = useState<SavedLocation>(() => currentLocation || DEFAULT_LOCATION);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  // Synchronize form inputs if activeKundali changes
  useEffect(() => {
    if (activeKundali) {
      setName(activeKundali.name);
      const d = new Date(activeKundali.birthDate);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDob(`${y}-${m}-${day}`);
      setTob(activeKundali.birthTime);
      setSelectedCity({
        name: activeKundali.birthPlace,
        latitude: activeKundali.latitude,
        longitude: activeKundali.longitude,
        state: selectedCity.state || 'भारत',
        country: 'भारत',
      });
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
  const [boyName, setBoyName] = useState('वर (Boy)');
  const [boyDob, setBoyDob] = useState('1996-03-20');
  const [boyTob, setBoyTob] = useState('10:15');
  const [girlName, setGirlName] = useState('कन्या (Girl)');
  const [girlDob, setGirlDob] = useState('1998-08-12');
  const [girlTob, setGirlTob] = useState('14:45');
  const [isDownloadingMilanPdf, setIsDownloadingMilanPdf] = useState(false);

  // Prashna Question State
  const [prashnaText, setPrashnaText] = useState('क्या यह कार्य सफल होगा?');
  const [prashnaData, setPrashnaData] = useState<KundaliData | null>(null);

  // Dasha Drill-down state
  const [inspectedMaha, setInspectedMaha] = useState<string>('');
  const [inspectedAntar, setInspectedAntar] = useState<string>('');
  const [dashaViewLevel, setDashaViewLevel] = useState<'all' | 'maha' | 'antar' | 'pratyantar'>('maha');

  // Annual Subscription State (₹99 / Year)
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>(() => getSubscriptionStatus());
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

  // Handle Calculate or Recalculate
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const [y, m, d] = dob.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const k = calculateKundali(
      name.trim() || 'जातक',
      dateObj,
      tob,
      selectedCity.name,
      selectedCity.latitude,
      selectedCity.longitude
    );
    setActiveKundali(k);
    saveKundaliProfile(k);
    setIsFormExpanded(false);
  };

  // If no active kundali yet, initialize with current form inputs
  useEffect(() => {
    if (!activeKundali) {
      handleCalculate();
    }
  }, [activeKundali]);

  const k = activeKundali;

  // Initialize inspected dasha on active kundali
  useEffect(() => {
    if (k) {
      setInspectedMaha(k.mahadasha);
      setInspectedAntar(k.antardasha);
    }
  }, [k?.mahadasha, k?.antardasha]);

  // Milan calculation
  const boyKundali = calculateKundali(boyName, new Date(boyDob), boyTob, currentLocation.name);
  const girlKundali = calculateKundali(girlName, new Date(girlDob), girlTob, currentLocation.name);
  const milanResult = calculateAshtakootMilan(boyKundali, girlKundali);

  // Remedies calculation
  const remedies = k ? getVedicRemedies(k) : null;

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const now = new Date();
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
    if (!subStatus.isSubscribed) {
      setSubscriptionReason('विवाह मिलान पत्रिका PDF डाउनलोड करने के लिए श्री शक्ति पंचांग की वार्षिक सदस्यता (₹99/वर्ष) आवश्यक है।');
      setIsSubscriptionModalOpen(true);
      return;
    }
    try {
      setIsDownloadingMilanPdf(true);
      const res = await downloadMilanBhojpatraPdf({
        boy: boyKundali,
        girl: girlKundali,
        milan: milanResult,
      });
      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: res.pageCount,
        title: 'भोजपत्र अष्टकूट विवाह मिलान पत्रिका',
      });
    } catch (err: any) {
      console.error('Milan PDF error:', err);
      alert('विवाह मिलान पत्रिका तैयार करने में त्रुटि: ' + (err?.message || 'अज्ञात त्रुटि'));
    } finally {
      setIsDownloadingMilanPdf(false);
    }
  };

  const [isGeneratingSinglePdf, setIsGeneratingSinglePdf] = useState(false);

  const handleDownloadSinglePageKundaliPdf = async () => {
    if (!subStatus.isSubscribed) {
      setSubscriptionReason('जन्मपत्रिका PDF डाउनलोड करने के लिए श्री शक्ति पंचांग की वार्षिक सदस्यता (₹99/वर्ष) आवश्यक है।');
      setIsSubscriptionModalOpen(true);
      return;
    }
    if (!k) {
      alert('कृपया पहले जन्म विवरण भरकर "जन्म पत्रिका बनाएं" पर क्लिक करें।');
      return;
    }
    try {
      setIsGeneratingSinglePdf(true);
      const birthDateObj = k.birthDate instanceof Date ? k.birthDate : new Date(k.birthDate);
      const panchangData = calculateVedicPanchang(
        birthDateObj,
        k.latitude || 28.6139,
        k.longitude || 77.209
      );

      const res = await downloadBhojpatraPdf({
        title: `वैदिक_जन्म_पत्रिका_${k.name}`,
        panchang: panchangData,
        query: `${k.name} की जन्म कुंडली, लग्न व ग्रह विवरण`,
        answer: `लग्न: ${k.lagnaRashi}, चन्द्र राशि: ${k.moonRashi}, नक्षत्र: ${k.nakshatra} (चरण ${k.charan}), वर्तमान महादशा: ${k.mahadasha}, अन्तर्दशा: ${k.antardasha}। लग्न चक्र एवं नवमांश चक्र सहित ग्रह स्पष्ट तालिका।`,
        activeKundali: k,
        locationName: k.birthPlace,
        date: birthDateObj,
      });

      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: 1,
        title: `त्वरित 1-पृष्ठीय जन्मपत्रिका (${k.name})`,
      });
    } catch (err: any) {
      console.error('1-Page PDF error:', err);
      alert('1-पृष्ठीय पत्रिका तैयार करने में त्रुटि: ' + (err?.message || 'अज्ञात त्रुटि'));
    } finally {
      setIsGeneratingSinglePdf(false);
    }
  };

  const handleDownload59PagePdf = async () => {
    if (!subStatus.isSubscribed) {
      setSubscriptionReason('सम्पूर्ण 59-पृष्ठीय महा-जन्मपत्रिका सचित्र PDF तैयार व डाउनलोड करने के लिए श्री शक्ति पंचांग की वार्षिक सदस्यता (₹99/वर्ष) आवश्यक है।');
      setIsSubscriptionModalOpen(true);
      return;
    }
    if (!k) {
      alert('कृपया पहले जन्म विवरण भरकर "जन्म पत्रिका बनाएं" पर क्लिक करें।');
      return;
    }
    try {
      setIsGeneratingPdf(true);
      setPdfProgress({ current: 1, total: 59, message: 'सम्पूर्ण 59-पृष्ठीय महा-जन्मपत्रिका तैयार की जा रही है...' });
      const res = await generateExhaustive59PageKundaliPdf(k, (cur, tot, msg) => {
        setPdfProgress({ current: cur, total: tot, message: msg });
      });
      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: res.pageCount,
        title: `सम्पूर्ण 59-पृष्ठीय महा-जन्मपत्रिका (${k.name})`,
      });
    } catch (err: any) {
      console.error('59-Page PDF Error:', err);
      alert('59-पृष्ठीय महा-पत्रिका तैयार करने में त्रुटि: ' + (err?.message || 'अज्ञात त्रुटि'));
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 59-Page PDF Generating Progress Overlay Modal */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#B56A00]/20 border-2 border-[#B56A00] flex items-center justify-center mx-auto text-[#B56A00]">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="font-bold text-lg font-granth text-[#5C3A21]">
              ॥ सम्पूर्ण 59-पृष्ठीय महा-जन्मपत्रिका तैयार हो रही है ॥
            </h3>
            <p className="text-xs text-[#735133] leading-relaxed">
              कृपया कुछ क्षण प्रतीक्षा करें। सभी 16 षोडशवर्ग चक्र, 120 वर्षीय विंशोत्तरी दशाएं, योग, गोचर एवं विस्तृत वैदिक फलादेश उच्च रिज़ॉल्यूशन में संकलित हो रहे हैं।
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-[#E5D2B8] rounded-full h-3 overflow-hidden border border-[#8C6239]/40">
              <div
                className="bg-gradient-to-r from-[#8B1E1E] to-[#B56A00] h-full transition-all duration-150"
                style={{ width: `${Math.round((pdfProgress.current / pdfProgress.total) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#5C3A21] px-1">
              <span className="truncate max-w-[240px] text-left">{pdfProgress.message || 'पृष्ठ तैयार हो रहे हैं...'}</span>
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
        currentLocation={selectedCity}
        onSelectLocation={(loc) => {
          setSelectedCity(loc);
          setIsCityModalOpen(false);
        }}
      />

      {/* PDF Download and Storage Location Notification Modal */}
      <PdfSuccessModal
        info={pdfSuccessInfo}
        onClose={() => setPdfSuccessInfo(null)}
      />

      {/* Top Input Form & Actions (Collapsible on Mobile for Screen-fit view) */}
      {!isFormExpanded && k ? (
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 sm:p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#5C3A21] text-[#FFD88A] border border-[#B56A00] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {name.trim() ? name.trim().charAt(0) : 'ॐ'}
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-[#5C3A21] flex items-center gap-2">
                  <span>{name}</span>
                  <span className="text-[10px] text-[#8C6239] font-normal">
                    ({dob} • {tob})
                  </span>
                </div>
                <div className="text-[11px] text-[#735133] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#B56A00]" />
                  <span>{selectedCity.name}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsFormExpanded(true)}
                className="px-2.5 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition cursor-pointer"
              >
                विवरण बदलें ▼
              </button>

              <button
                type="button"
                onClick={handleDownload59PagePdf}
                disabled={isGeneratingPdf || isGeneratingSinglePdf}
                className="px-3 py-1.5 bg-gradient-to-r from-[#8B1E1E] via-[#A84318] to-[#B56A00] hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="59 पृष्ठीय सम्पूर्ण महा-जन्मपत्रिका PDF डाउनलोड करें"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">59-पृष्ठीय महा-पत्रिका (PDF)</span>
                <span className="sm:hidden">59-पृष्ठ PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSinglePageKundaliPdf}
                disabled={isGeneratingSinglePdf || isGeneratingPdf}
                className="px-2.5 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A] border border-[#B56A00]/80 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                title="त्वरित 1-पृष्ठीय भोजपत्र जन्मपत्रिका"
              >
                {isGeneratingSinglePdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD88A]" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-[#FFD88A]" />
                )}
                <span>1-पृष्ठ PDF</span>
              </button>

              <button
                onClick={onOpenSavedModal}
                className="px-2.5 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition cursor-pointer"
              >
                सहेजे गए
              </button>

              {/* Annual Subscription Pill */}
              {subStatus.isSubscribed ? (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionReason('आपकी वार्षिक सदस्यता सक्रिय है!');
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 text-emerald-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Crown className="w-3 h-3 text-amber-600 fill-current" />
                  <span className="hidden sm:inline">सक्रिय ({subStatus.daysRemaining} दिन)</span>
                  <span className="sm:hidden">सक्रिय</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionReason('वार्षिक सदस्यता (₹99/वर्ष) सक्रिय करने पर आप असीमित 59-पृष्ठीय महापत्रिका व कुण्डली PDF डाउनलोड कर सकते हैं।');
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer animate-pulse"
                >
                  <Lock className="w-3 h-3" />
                  <span>₹99/वर्ष</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold font-granth text-[#5C3A21] flex items-center gap-2">
              <User className="w-5 h-5 text-[#B56A00]" />
              जन्म विवरण दर्ज करें (Birth Details)
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {k && (
                <button
                  type="button"
                  onClick={() => setIsFormExpanded(false)}
                  className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  संक्षिप्त करें ▲
                </button>
              )}

              {k && (
                <>
                  <button
                    type="button"
                    onClick={handleDownload59PagePdf}
                    disabled={isGeneratingPdf || isGeneratingSinglePdf}
                    className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-[#8B1E1E] via-[#A84318] to-[#B56A00] hover:brightness-110 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                    title="59 पृष्ठीय सम्पूर्ण महा-जन्मपत्रिका PDF डाउनलोड करें"
                  >
                    <Download className="w-4 h-4" />
                    <span>सम्पूर्ण 59 पृष्ठीय महा-पत्रिका (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSinglePageKundaliPdf}
                    disabled={isGeneratingSinglePdf || isGeneratingPdf}
                    className="px-3 py-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FFD88A] border border-[#B56A00]/80 text-xs sm:text-sm font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="त्वरित 1-पृष्ठीय भोजपत्र जन्मपत्रिका (1 सेकंड में तैयार)"
                  >
                    {isGeneratingSinglePdf ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFD88A]" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#FFD88A]" />
                    )}
                    <span>त्वरित 1-पृष्ठ पत्रिका (PDF)</span>
                  </button>
                </>
              )}

              <button
                onClick={onOpenSavedModal}
                className="px-3 py-2 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 text-[#5C3A21] text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                सहेजे गए प्रोफाइल (History)
              </button>

              {/* Annual Subscription Pill */}
              {subStatus.isSubscribed ? (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionReason('आपकी वार्षिक सदस्यता सक्रिय है!');
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 text-emerald-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600 fill-current" />
                  <span>वार्षिक सदस्यता सक्रिय ({subStatus.daysRemaining} दिन)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSubscriptionReason('वार्षिक सदस्यता (₹99/वर्ष) सक्रिय करने पर आप असीमित 59-पृष्ठीय महापत्रिका व कुण्डली PDF डाउनलोड कर सकते हैं।');
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer animate-pulse"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>वार्षिक सदस्यता: ₹99/वर्ष</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#8C6239] mb-1">नाम</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] focus:ring-1 focus:ring-[#B56A00] outline-none"
                placeholder="नाम लिखें"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C6239] mb-1">जन्म तिथि (DOB)</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] focus:ring-1 focus:ring-[#B56A00] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C6239] mb-1">जन्म समय (Time)</label>
              <input
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] focus:ring-1 focus:ring-[#B56A00] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C6239] mb-1 flex items-center justify-between">
                <span>जन्म स्थान (शहर / गाँव / देश)</span>
                <span className="text-[10px] text-[#B56A00] font-normal">विश्व भर में खोजें</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="w-full bg-[#F4E8D1] hover:bg-[#EBDBC0] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] flex items-center justify-between transition text-left cursor-pointer"
              >
                <span className="truncate flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#B56A00] shrink-0" />
                  <span className="truncate">{selectedCity.name}</span>
                </span>
                <span className="text-[11px] text-[#B56A00] underline shrink-0 font-bold ml-1">स्थान बदलें</span>
              </button>
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex flex-wrap items-center justify-between gap-2 mt-2">
              <div className="text-xs text-[#735133] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>चयनित: <strong>{selectedCity.name}</strong> ({selectedCity.latitude.toFixed(2)}°N, {selectedCity.longitude.toFixed(2)}°E)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs sm:text-sm font-bold rounded-lg shadow-sm transition cursor-pointer"
                >
                  कुंडली बनाएँ / अद्यतन करें (Generate)
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Non-Subscribed Banner Alert */}
      {!subStatus.isSubscribed && (
        <div className="bg-gradient-to-r from-[#8B1E1E] via-[#A84318] to-[#5C3A21] rounded-xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3.5 border-2 border-amber-400/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-xs font-black">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-amber-200">
                श्री शक्ति पंचांग वार्षिक सदस्यता (केवल ₹99 / वर्ष)
              </div>
              <div className="text-xs text-amber-100/90 mt-0.5">
                सम्पूर्ण 59-पृष्ठीय महापत्रिका सचित्र PDF, अष्टकूट विवाह मिलान, एवं सूक्ष्म दशा सेवा हेतु वार्षिक सदस्यता आवश्यक है।
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubscriptionReason('सम्पूर्ण कुण्डली सेवा एवं 59-पृष्ठीय महापत्रिका सचित्र PDF डाउनलोड करने के लिए केवल ₹99/वर्ष की सदस्यता प्राप्त करें।');
              setIsSubscriptionModalOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-xs sm:text-sm rounded-lg shadow-md transition cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4" />
            <span>₹99/वर्ष में अनलॉक करें</span>
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#8C6239]/30 overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'chart', label: 'लग्न व सम्पूर्ण वर्ग चक्र (D1 से D60)', icon: Layers },
          { id: 'dasha', label: 'विंशोत्तरी महादशा / अंतर्दशा / प्रत्यंतर', icon: Clock },
          { id: 'milan', label: 'कुंडली मिलान (36 गुण व मांगलिक)', icon: Heart },
          { id: 'prashna', label: 'प्रश्न कुंडली', icon: HelpCircle },
          { id: 'remedies', label: 'वैदिक उपाय एवं रत्न', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = kundaliTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setKundaliTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap rounded-t-lg transition ${
                isSel
                  ? 'bg-[#FAF2E4] text-[#5C3A21] border-t-2 border-[#B56A00] shadow-xs'
                  : 'text-[#8C6239] hover:bg-[#FAF2E4]/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSel ? 'text-[#B56A00]' : 'text-[#8C6239]'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Charts & Shodashvarga (D1 to D60) */}
      {kundaliTab === 'chart' && k && (
        <div className="space-y-6">
          {/* Key Attributes Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">लग्न</div>
              <div className="text-sm font-black text-[#5C3A21]">{k.lagnaRashi} ({k.lagnaDegree.toFixed(1)}°)</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">चंद्र राशि</div>
              <div className="text-sm font-black text-[#5C3A21]">{k.moonRashi}</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">नक्षत्र</div>
              <div className="text-sm font-black text-[#5C3A21]">{k.nakshatra} ({k.charan})</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">गण / नाड़ी</div>
              <div className="text-sm font-black text-[#5C3A21]">{k.gana} | {k.nadi}</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">योनि / वर्ण</div>
              <div className="text-sm font-black text-[#5C3A21]">{k.yoni} | {k.varna}</div>
            </div>
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] text-[#8C6239] font-bold">वर्तमान सूक्ष्म दशा</div>
              <div className="text-xs sm:text-sm font-black text-[#B56A00] truncate">
                {k.mahadasha} / {k.antardasha} / {k.pratyantardasha}
              </div>
              <div className="text-[9px] text-[#735133] mt-0.5">महा / अंतर / प्रत्यंतर</div>
            </div>
          </div>

          {/* Sub-Pages Segmented Bar for Chart Tab */}
          <div className="flex items-center justify-between gap-1 p-1 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
            {[
              { id: 'twin', label: '१. लग्न व नवमांश', full: 'पृष्ठ १: लग्न (D1) व नवमांश (D9) चक्र' },
              { id: 'planets', label: '२. ग्रह स्पष्ट तालिका', full: 'पृष्ठ २: ग्रह स्थिति एवं स्पष्ट तालिका' },
              { id: 'vargas', label: '३. षोडशवर्ग (D1-D60)', full: 'पृष्ठ ३: सम्पूर्ण षोडशवर्ग (D1 से D60)' },
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
                      D1 लग्न चक्र (Lagna Rashi Chart)
                    </span>
                    <span className="text-[11px] text-[#8C6239] font-medium">सम्पूर्ण देह व भौतिक जीवन</span>
                  </div>
                  <KundaliChart
                    lagnaDegree={k.lagnaDegree}
                    planets={k.planets}
                    vargaDivision={1}
                    chartTitle={`${k.name} — लग्न चक्र (D1)`}
                  />
                </div>

                {/* D9 Navamsha */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-[#5C3A21] uppercase tracking-wider">
                      D9 नवमांश चक्र (Navamsha Chart)
                    </span>
                    <span className="text-[11px] text-[#8C6239] font-medium">भाग्य, विवाह व सूक्ष्म सामर्थ्य</span>
                  </div>
                  <KundaliChart
                    lagnaDegree={k.lagnaDegree}
                    planets={k.planets}
                    vargaDivision={9}
                    chartTitle={`${k.name} — नवमांश चक्र (D9)`}
                  />
                </div>
              </div>

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-[#8C6239]">पृष्ठ 1 / 3 (लग्न व नवमांश चक्र)</div>
                <button
                  type="button"
                  onClick={() => setChartSubPage('planets')}
                  className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>अगला: २. ग्रह स्पष्ट तालिका</span>
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
                  <span>ग्रह स्थिति, स्पष्ट अंश एवं भाव विवरण (Planetary Ephemeris)</span>
                  <span className="text-[10px] text-[#FFD88A]">9 ग्रह स्थिति</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30">
                      <tr>
                        <th className="py-2.5 px-3">ग्रह</th>
                        <th className="py-2.5 px-3">राशि</th>
                        <th className="py-2.5 px-3">भाव</th>
                        <th className="py-2.5 px-3">अंश (Deg)</th>
                        <th className="py-2.5 px-3">नक्षत्र व चरण</th>
                        <th className="py-2.5 px-3">गति</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8C6239]/20">
                      {k.planets.map((p, idx) => (
                        <tr key={idx} className="hover:bg-[#F4E8D1]/60">
                          <td className="py-2 px-3 font-bold text-[#5C3A21]">
                            {p.planet} ({p.englishName})
                          </td>
                          <td className="py-2 px-3 text-[#5C3A21]">{p.rashi}</td>
                          <td className="py-2 px-3 font-bold text-[#B56A00]">{p.house}</td>
                          <td className="py-2 px-3 text-[#5C3A21]">
                            {p.degreeInRashi.toFixed(2)}°
                          </td>
                          <td className="py-2 px-3 text-[#5C3A21]">
                            {p.nakshatra} (चरण {p.pada})
                          </td>
                          <td className="py-2 px-3">
                            {p.isRetrograde ? (
                              <span className="text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                                वक्री (R)
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-medium text-[10px]">मार्गी</span>
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
                  <span>पिछला: १. लग्न व नवमांश</span>
                </button>
                <div className="text-xs font-bold text-[#8C6239]">पृष्ठ 2 / 3</div>
                <button
                  type="button"
                  onClick={() => setChartSubPage('vargas')}
                  className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>अगला: ३. षोडशवर्ग (D1-D60)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sub-Page 3: Shodashvarga Explorer (D1 to D60) */}
          {chartSubPage === 'vargas' && (
            <div className="space-y-6">
              {/* Varga Selector (Shodashvarga & D1-D60) */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
                      वर्गीय चक्र चयन:
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
                        षोडशवर्ग (16 मुख्य वर्ग)
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
                        सम्पूर्ण D1 से D60 चक्र (All 60 Charts)
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
                      ← पिछला (D{Math.max(1, selectedVarga - 1)})
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
                      अगला (D{Math.min(60, selectedVarga + 1)}) →
                    </button>
                  </div>
                </div>

                {/* Direct Slider & Number Jump */}
                <div className="flex items-center gap-3 bg-[#F4E8D1]/60 p-2.5 rounded-lg border border-[#8C6239]/20">
                  <span className="text-xs font-bold text-[#5C3A21] whitespace-nowrap">वर्ग चक्र क्रमांक (1-60):</span>
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
                <div className="max-h-48 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {(vargaListFilter === 'shodash'
                      ? ALL_D1_TO_D60_VARGAS.filter((v) => v.isShodash)
                      : ALL_D1_TO_D60_VARGAS
                    ).map((v) => {
                      const isSel = selectedVarga === v.division;
                      return (
                        <button
                          key={v.division}
                          onClick={() => setSelectedVarga(v.division)}
                          className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
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
                                मुख्य
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-bold truncate mt-1">
                            {v.name.split(' ')[0]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Chart and Significance Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 space-y-3">
                  <KundaliChart
                    lagnaDegree={k.lagnaDegree}
                    planets={k.planets}
                    vargaDivision={selectedVarga}
                    chartTitle={`${k.name} — ${selectedVargaObj.name}`}
                  />
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {/* Shastric Meaning Card */}
                  <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-2">
                      <h4 className="text-base font-bold font-granth text-[#5C3A21]">
                        {selectedVargaObj.code}: {selectedVargaObj.name}
                      </h4>
                      <span className="bg-[#B56A00] text-[#FAF2E4] px-2.5 py-0.5 rounded text-xs font-black">
                        विभाजन 1/{selectedVarga} (30° ÷ {selectedVarga} = {(30 / selectedVarga).toFixed(2)}°)
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed">
                      <strong>शास्त्रीय महत्व:</strong> {selectedVargaObj.desc}
                    </p>

                    <div className="bg-[#F4E8D1] border border-[#8C6239]/20 rounded-lg p-3 text-xs text-[#735133] leading-relaxed">
                      {selectedVarga === 60 && (
                        <span>
                          <strong>षष्ट्यंश (D60) पराशरी नियम:</strong> महर्षि पराशर अनुसार षष्ट्यंश चक्र संचित कर्म एवं प्रारब्ध का सर्वोच्च सूक्ष्म दर्पण है। यदि कोई ग्रह D1 व D9 में शुभ हो किन्तु D60 में क्रूर षष्ट्यंश में हो, तो उसका शुभ फल क्षीण हो जाता है।
                        </span>
                      )}
                      {selectedVarga === 10 && (
                        <span>
                          <strong>दशमांश (D10) नियम:</strong> आजीविका, उच्च पद, राजकीय सम्मान व कर्म क्षेत्र का सूक्ष्म विश्लेषण दशमांश से ही सुनिश्चित होता है।
                        </span>
                      )}
                      {selectedVarga === 9 && (
                        <span>
                          <strong>नवमांश (D9) नियम:</strong> नवमांश चक्र को कुंडली की आत्मा माना गया है। ग्रह का वास्तविक बल नवमांश में उसकी राशि स्थिति (वर्गोत्तम/उच्च/नीच) पर निर्भर करता है।
                        </span>
                      )}
                      {selectedVarga !== 60 && selectedVarga !== 10 && selectedVarga !== 9 && (
                        <span>
                          बृहत् पराशर होरा शास्त्र अनुसार प्रत्येक वर्ग चक्र जातक के जीवन के विशिष्ट आयाम (जैसे D2 धन, D4 भूमि, D7 संतान, D12 माता-पिता, D16 वाहन, D24 विद्या, D30 अरिष्ट) का निर्विवाद सूक्ष्म परिणाम दर्शाता है।
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Shodashvarga Summary Table */}
                  <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                      <span>{vargaListFilter === 'shodash' ? 'षोडशवर्ग (16 वर्गीय चक्रों) की सूची' : 'सम्पूर्ण D1 से D60 वर्गीय चक्रों की सूची'}</span>
                      <span className="text-[10px] text-[#FFD88A]">क्लिक कर चार्ट देखें</span>
                    </div>
                    <div className="max-h-[260px] overflow-y-auto no-scrollbar">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-[#8C6239]/20">
                          {(vargaListFilter === 'shodash'
                            ? ALL_D1_TO_D60_VARGAS.filter((v) => v.isShodash)
                            : ALL_D1_TO_D60_VARGAS
                          ).map((v) => (
                            <tr
                              key={v.division}
                              onClick={() => setSelectedVarga(v.division)}
                              className={`cursor-pointer transition ${
                                selectedVarga === v.division
                                  ? 'bg-[#F4E8D1] font-bold'
                                  : 'hover:bg-[#FAF2E4]/80'
                              }`}
                            >
                              <td className="py-2 px-3 text-[#B56A00] font-black w-14">{v.code}</td>
                              <td className="py-2 px-3 text-[#5C3A21] font-bold">{v.name}</td>
                              <td className="py-2 px-3 text-[#735133]">{v.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
                  <span>पिछला: २. ग्रह स्पष्ट तालिका</span>
                </button>
                <div className="text-xs font-bold text-[#8C6239]">पृष्ठ 3 / 3 (षोडशवर्ग D1-D60)</div>
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
          {/* Active Dasha Hero Card with Pratyantar */}
          <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-[#8C6239] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#B56A00]" />
                वर्तमान सक्रिय त्रि-स्तरीय विंशोत्तरी दशा (Active Vimshottari Dasha Timeline)
              </div>

              <button
                onClick={jumpToActiveDasha}
                className="px-3 py-1.5 bg-[#B56A00] hover:bg-[#945500] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>वर्तमान सक्रिय सूक्ष्म दशा पर जाएँ</span>
              </button>
            </div>

            {/* Mobile Touch Swipe Indicator Banner */}
            <div className="p-2.5 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 border border-[#B56A00]/40 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C3A21]">
              <div className="flex items-center gap-2 font-bold">
                <MoveHorizontal className="w-4 h-4 text-[#B56A00] shrink-0" />
                <span>फोन पर दशा बदलने हेतु स्क्रीन पर बाएँ (←) या दाएँ (→) स्वाइप करें</span>
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
                  title="पिछला स्तर"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>पिछला</span>
                </button>
                <span className="text-[11px] text-[#8C6239] font-bold px-1">
                  {dashaViewLevel === 'maha' ? 'स्तर १/३' : dashaViewLevel === 'antar' ? 'स्तर २/३' : dashaViewLevel === 'pratyantar' ? 'स्तर ३/३' : 'समस्त'}
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
                  title="अगला स्तर"
                >
                  <span>अगला</span>
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
                  <span>1. महादशा (Mahadasha)</span>
                  <span className="bg-[#B56A00] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    सक्रिय
                  </span>
                </div>
                <div className="text-xl font-black text-[#5C3A21] mt-1">{k.mahadasha} महादशा</div>
                <div className="text-xs text-[#735133] mt-1 font-medium">
                  {currentActiveMahaPeriod
                    ? `${fmtDate(currentActiveMahaPeriod.startDate)} से ${fmtDate(currentActiveMahaPeriod.endDate)}`
                    : `स्वामी: ${k.mahadasha} देव`}
                </div>
                <div className="text-[10px] text-[#8C6239] mt-1 flex items-center justify-between">
                  <span>अवधि: {currentActiveMahaPeriod?.years.toFixed(1)} वर्ष</span>
                  <span className="text-[#B56A00] font-bold underline text-[10px]">चक्र देखें →</span>
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
                  <span>2. अंतर्दशा (Antardasha)</span>
                  <span className="bg-[#B56A00] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    सक्रिय
                  </span>
                </div>
                <div className="text-xl font-black text-[#B56A00] mt-1">{k.antardasha} अंतर्दशा</div>
                <div className="text-xs text-[#735133] mt-1 font-medium">
                  {currentActiveAntarPeriod
                    ? `${fmtDate(currentActiveAntarPeriod.startDate)} से ${fmtDate(currentActiveAntarPeriod.endDate)}`
                    : `उप-स्वामी: ${k.antardasha} देव`}
                </div>
                <div className="text-[10px] text-[#8C6239] mt-1 flex items-center justify-between">
                  <span>अवधि: {((currentActiveAntarPeriod?.years || 0) * 12).toFixed(1)} माह</span>
                  <span className="text-[#B56A00] font-bold underline text-[10px]">सूक्ष्म देखें →</span>
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
                  <span>3. प्रत्यंतर्दशा (Pratyantar)</span>
                  <span className="bg-rose-700 text-white text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                    सक्रिय
                  </span>
                </div>
                <div className="text-xl font-black text-rose-800 mt-1">{k.pratyantardasha} प्रत्यंतर</div>
                <div className="text-xs text-[#735133] mt-1 font-medium">
                  {currentActivePratyantarPeriod
                    ? `${fmtDate(currentActivePratyantarPeriod.startDate)} से ${fmtDate(currentActivePratyantarPeriod.endDate)}`
                    : `सूक्ष्म स्वामी: ${k.pratyantardasha} देव`}
                </div>
                <div className="text-[10px] text-rose-800 mt-1 flex items-center justify-between">
                  <span>अवधि: {currentActivePratyantarPeriod?.days} दिन</span>
                  <span className="text-rose-700 font-bold underline text-[10px]">प्रत्यंतर तालिका →</span>
                </div>
              </div>
            </div>

            {/* Level Navigation & Breadcrumb Bar */}
            <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#5C3A21]">
                <span className="text-[11px] text-[#8C6239] mr-1">दशा स्तर:</span>
                <button
                  onClick={() => setDashaViewLevel('maha')}
                  className={`px-2.5 py-1 rounded-md transition text-xs font-bold cursor-pointer ${
                    dashaViewLevel === 'maha'
                      ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                      : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#EBD8BD]'
                  }`}
                >
                  १. महादशा: <span className="text-amber-600 font-black">{inspectedMaha}</span>
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
                  २. अंतर्दशा: <span className="text-amber-600 font-black">{inspectedAntar}</span>
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
                  ३. प्रत्यंतर्दशा सूची ({inspectedPratyantars.length})
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
                  सम्पूर्ण ३-स्तरीय दृश्य
                </button>
                <button
                  onClick={() => setDashaViewLevel('pratyantar')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                    dashaViewLevel === 'pratyantar'
                      ? 'bg-rose-800 text-white shadow-xs'
                      : 'text-rose-900 hover:bg-[#F4E8D1]'
                  }`}
                >
                  प्रत्यंतर फोकस
                </button>
              </div>
            </div>

            <p className="text-xs text-[#735133] leading-relaxed pt-1 border-t border-[#8C6239]/20">
              विंशोत्तरी 120-वर्षीय दशा क्रम जातक के जन्म नक्षत्र ({k.nakshatra}) के स्वामी {k.dashaPeriods[0]?.planet} के आधार पर गणित है। किसी भी महादशा या अंतर्दशा पर क्लिक करके उसकी सूक्ष्म ९ प्रत्यंतर्दशाओं का विस्तृत विश्लेषण देखें।
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
                <span>1. महादशा चक्र (9 Planets)</span>
                <span className="text-[10px] text-amber-200">क्लिक कर चुनें</span>
              </div>
              <div className="divide-y divide-[#8C6239]/20">
                {k.dashaPeriods.map((dp, idx) => {
                  const now = new Date();
                  const isCur = now >= dp.startDate && now < dp.endDate;
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
                          <span>{dp.planet} महादशा</span>
                          {isCur && (
                            <span className="bg-[#B56A00] text-white px-1.5 py-0.2 rounded text-[9px] font-bold">
                              सक्रिय
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#735133] mt-0.5">
                          {fmtDate(dp.startDate)} से {fmtDate(dp.endDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#5C3A21]">{dp.years.toFixed(1)} वर्ष</span>
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
                <span>2. अंतर्दशाएँ ({inspectedMaha} में)</span>
                <span className="text-[10px] text-amber-200">क्लिक कर प्रत्यंतर देखें</span>
              </div>
              <div className="divide-y divide-[#8C6239]/20">
                {antarsOfCurrentMaha.map((ap, idx) => {
                  const now = new Date();
                  const isCur = now >= ap.startDate && now < ap.endDate;
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
                          <span>{ap.antar} अंतर्दशा</span>
                          {isCur && (
                            <span className="bg-[#B56A00] text-white px-1.5 py-0.2 rounded text-[9px] font-bold">
                              सक्रिय
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#735133] mt-0.5">
                          {fmtDate(ap.startDate)} से {fmtDate(ap.endDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#8C6239]">
                          {(ap.years * 12).toFixed(1)} माह
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
                <span>3. प्रत्यंतर्दशाएँ ({inspectedMaha} - {inspectedAntar})</span>
                <span className="text-[10px] text-amber-300 font-bold">सूक्ष्म चक्र</span>
              </div>
              <div className="divide-y divide-[#8C6239]/20">
                {inspectedPratyantars.map((pp, idx) => {
                  const now = new Date();
                  const isCur = now >= pp.startDate && now < pp.endDate;
                  return (
                    <div
                      key={idx}
                      className={`p-3 transition flex items-center justify-between ${
                        isCur ? 'bg-rose-100/90 border-l-4 border-rose-700 font-bold' : 'hover:bg-[#F4E8D1]/50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5">
                          <span>{pp.pratyantar} प्रत्यंतर</span>
                          {isCur && (
                            <span className="bg-rose-700 text-white px-1.5 py-0.2 rounded text-[9px] font-bold animate-pulse">
                              सक्रिय
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#735133] mt-0.5">
                          {fmtDate(pp.startDate)} — {fmtDate(pp.endDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-rose-900">{pp.days} दिन</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Kundali Milan (36 Gunas, Manglik, Nadi, Bhakoot & Twin Charts) */}
      {kundaliTab === 'milan' && (
        <div className="space-y-4">
          {/* Sub-Pages Segmented Bar for Milan Tab */}
          <div className="flex items-center justify-between gap-1 p-1 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
            {[
              { id: 'score', label: '१. मिलान स्कोर', full: 'पृष्ठ १: वर-कन्या विवरण एवं स्कोर' },
              { id: 'ashtakoot', label: '२. अष्टकूट तालिका', full: 'पृष्ठ २: अष्टकूट 8 घटक तालिका' },
              { id: 'manglik', label: '३. दोष विचार व चक्र', full: 'पृष्ठ ३: मांगलिक, नाड़ी, भकूट व चक्र' },
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
              <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 sm:p-5 shadow-xs">
                <h3 className="text-sm font-bold text-[#5C3A21] mb-3 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  वर-कन्या विवरण (Boy & Girl Profiles for Matchmaking)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Boy */}
                  <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20 space-y-2">
                    <span className="text-xs font-bold text-blue-900 uppercase">वर विवरण (Boy)</span>
                    <input
                      type="text"
                      value={boyName}
                      onChange={(e) => setBoyName(e.target.value)}
                      className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21]"
                      placeholder="वर का नाम"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={boyDob}
                        onChange={(e) => setBoyDob(e.target.value)}
                        className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21]"
                      />
                      <input
                        type="time"
                        value={boyTob}
                        onChange={(e) => setBoyTob(e.target.value)}
                        className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21]"
                      />
                    </div>
                  </div>

                  {/* Girl */}
                  <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20 space-y-2">
                    <span className="text-xs font-bold text-rose-900 uppercase">कन्या विवरण (Girl)</span>
                    <input
                      type="text"
                      value={girlName}
                      onChange={(e) => setGirlName(e.target.value)}
                      className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21]"
                      placeholder="कन्या का नाम"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={girlDob}
                        onChange={(e) => setGirlDob(e.target.value)}
                        className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21]"
                      />
                      <input
                        type="time"
                        value={girlTob}
                        onChange={(e) => setGirlTob(e.target.value)}
                        className="w-full bg-white border border-[#8C6239]/30 rounded p-1.5 text-xs text-[#5C3A21]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Milan Result Banner with Bhojpatra PDF Download Button */}
              <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#8C6239]/20 pb-3">
                  <div>
                    <div className="text-xs font-bold text-[#8C6239]">अष्टकूट गुण मिलान स्कोर</div>
                    <div className="text-3xl font-black font-granth text-[#5C3A21]">
                      {milanResult.totalScore} / 36 गुण
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                        ? 'अति उत्तम मिलान (28-36)'
                        : milanResult.verdictGrade === 'good'
                        ? 'शुभ व अनुकूल मिलान (21-27)'
                        : milanResult.verdictGrade === 'average'
                        ? 'मध्यम विवाह योग्य (18-20)'
                        : 'अस्वीकार्य / दोषयुक्त (<18)'}
                    </div>

                    <button
                      onClick={handleDownloadMilanPdf}
                      disabled={isDownloadingMilanPdf}
                      className="px-4 py-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isDownloadingMilanPdf ? 'पीडीएफ बन रहा है...' : 'मिलान भोजपत्र PDF'}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#5C3A21] font-medium leading-relaxed">
                  {milanResult.verdict}
                </p>
              </div>

              {/* Bottom Pagination */}
              <div className="flex items-center justify-between p-3 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-[#8C6239]">पृष्ठ 1 / 3 (मिलान स्कोर)</div>
                <button
                  type="button"
                  onClick={() => setMilanSubPage('ashtakoot')}
                  className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>अगला: २. अष्टकूट तालिका</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sub-Page 2: 8 Kootas Detailed Table */}
          {milanSubPage === 'ashtakoot' && (
            <div className="space-y-4">
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-[#5C3A21] text-[#FAF2E4] font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>अष्टकूट 8 घटकों का विस्तृत विश्लेषण तालिका</span>
                  <span className="text-[10px] text-[#FFD88A] font-bold">प्राप्त: {milanResult.totalScore}/36</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4E8D1] text-[#5C3A21] border-b border-[#8C6239]/30">
                      <tr>
                        <th className="py-2.5 px-3">कूट (Factor)</th>
                        <th className="py-2.5 px-3">प्राप्त अंक</th>
                        <th className="py-2.5 px-3">अधिकतम</th>
                        <th className="py-2.5 px-3">वर स्थिति</th>
                        <th className="py-2.5 px-3">कन्या स्थिति</th>
                        <th className="py-2.5 px-3">फल व विश्लेषण</th>
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
                  <span>पिछला: १. मिलान स्कोर</span>
                </button>
                <div className="text-xs font-bold text-[#8C6239]">पृष्ठ 2 / 3</div>
                <button
                  type="button"
                  onClick={() => setMilanSubPage('manglik')}
                  className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span>अगला: ३. दोष विचार व चक्र</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sub-Page 3: Manglik, Nadi, Bhakoot Dosha & Twin Charts */}
          {milanSubPage === 'manglik' && (
            <div className="space-y-4">
              {/* Manglik, Nadi & Bhakoot Dosha Comprehensive Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Manglik Card */}
                <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-1.5">
                    <span className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                      <Flame className="w-4 h-4 text-rose-600" />
                      मांगलिक दोष विचार
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        milanResult.manglikAnalysis?.isCancelled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {milanResult.manglikAnalysis?.verdict || 'विश्लेषण'}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C3A21] space-y-1">
                    <div><strong>वर:</strong> {milanResult.manglikAnalysis?.boyNote}</div>
                    <div><strong>कन्या:</strong> {milanResult.manglikAnalysis?.girlNote}</div>
                    <div className="text-[11px] text-[#735133] leading-relaxed pt-1">
                      <strong>परिहार:</strong> {milanResult.manglikAnalysis?.cancellationReason}
                    </div>
                  </div>
                </div>

                {/* Nadi Card */}
                <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-1.5">
                    <span className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                      <Info className="w-4 h-4 text-blue-600" />
                      नाड़ी दोष विचार (8 अंक)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        milanResult.nadiDosha?.hasDosha
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {milanResult.nadiDosha?.hasDosha ? 'समान नाड़ी दोष' : 'निर्दोष नाड़ी'}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C3A21] space-y-1">
                    <div><strong>वर नाड़ी:</strong> {boyKundali.nadi} | <strong>कन्या नाड़ी:</strong> {girlKundali.nadi}</div>
                    <div className="text-[11px] text-[#735133] leading-relaxed pt-1">
                      {milanResult.nadiDosha?.hasDosha
                        ? milanResult.nadiDosha.remedy
                        : 'दोनों की भिन्न नाड़ी होने से संतान, स्वास्थ्य व वंश वृद्धि अनुकूल रहेगी।'}
                    </div>
                  </div>
                </div>

                {/* Bhakoot Card */}
                <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-1.5">
                    <span className="text-xs font-bold text-[#5C3A21] flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      भकूट दोष विचार (7 अंक)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        milanResult.bhakootDosha?.hasDosha
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {milanResult.bhakootDosha?.hasDosha ? 'भकूट दोष' : 'निर्दोष संबंध'}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C3A21] space-y-1">
                    <div><strong>वर राशि:</strong> {boyKundali.moonRashi} | <strong>कन्या राशि:</strong> {girlKundali.moonRashi}</div>
                    <div className="text-[11px] text-[#735133] leading-relaxed pt-1">
                      {milanResult.bhakootDosha?.hasDosha
                        ? milanResult.bhakootDosha.remedy
                        : 'राशि परस्पर शुभ भाव संबंध में होने से प्रेम व सद्भाव की वृद्धि होगी।'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Twin Charts Comparison: Boy Lagna & Girl Lagna */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                <h4 className="text-sm font-bold font-granth text-[#5C3A21]">
                  वर एवं कन्या के लग्न व नवमांश चक्रों की तुलना
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-bold text-blue-900 mb-2">वर लग्न चक्र: {boyKundali.name} ({boyKundali.lagnaRashi} लग्न)</div>
                    <KundaliChart
                      lagnaDegree={boyKundali.lagnaDegree}
                      planets={boyKundali.planets}
                      vargaDivision={1}
                      chartTitle={`${boyKundali.name} — लग्न चक्र`}
                    />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-rose-900 mb-2">कन्या लग्न चक्र: {girlKundali.name} ({girlKundali.lagnaRashi} लग्न)</div>
                    <KundaliChart
                      lagnaDegree={girlKundali.lagnaDegree}
                      planets={girlKundali.planets}
                      vargaDivision={1}
                      chartTitle={`${girlKundali.name} — लग्न चक्र`}
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
                  <span>पिछला: २. अष्टकूट तालिका</span>
                </button>
                <div className="text-xs font-bold text-[#8C6239]">पृष्ठ 3 / 3 (दोष विचार व चक्र)</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Prashna Kundali */}
      {kundaliTab === 'prashna' && (
        <div className="space-y-6">
          <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-base font-bold font-granth text-[#5C3A21] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#B56A00]" />
              तात्कालिक प्रश्न कुंडली (Horary Astrological Chart)
            </h3>
            <p className="text-xs text-[#735133]">
              जब किसी व्यक्ति के पास जन्म समय या कुंडली उपलब्ध न हो, अथवा तात्कालिक प्रश्न का उत्तर जानना हो, तो प्रश्न पूछने के ठीक उस क्षण का आकाशीय चक्र निर्मित किया जाता है।
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <input
                type="text"
                value={prashnaText}
                onChange={(e) => setPrashnaText(e.target.value)}
                className="flex-1 min-w-[200px] bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg p-2 text-xs sm:text-sm font-semibold text-[#5C3A21] outline-none"
                placeholder="अपना प्रश्न यहाँ लिखें..."
              />
              <button
                onClick={() => {
                  const pk = generatePrashnaKundali(prashnaText, currentLocation.latitude, currentLocation.longitude);
                  setPrashnaData(pk);
                }}
                className="px-4 py-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs sm:text-sm font-bold rounded-lg transition"
              >
                प्रश्न कुंडली बनाएँ
              </button>
            </div>
          </div>

          {prashnaData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <KundaliChart
                lagnaDegree={prashnaData.lagnaDegree}
                planets={prashnaData.planets}
                chartTitle={prashnaData.name}
              />
              <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-5 space-y-3 text-xs sm:text-sm">
                <div className="font-bold text-[#5C3A21] text-base border-b border-[#8C6239]/20 pb-2">
                  प्रश्न लग्न विचार
                </div>
                <div><strong>प्रश्न लग्न:</strong> {prashnaData.lagnaRashi}</div>
                <div><strong>चंद्र स्थिति:</strong> {prashnaData.moonRashi} ({prashnaData.nakshatra} नक्षत्र)</div>
                <div><strong>समय:</strong> {prashnaData.birthTime} ({currentLocation.name})</div>
                <p className="text-xs text-[#735133] leading-relaxed pt-2">
                  वैदिक प्रश्न शास्त्रानुसार यदि लग्न में शुभ ग्रह (गुरु, शुक्र, बुध, चंद्र) हों अथवा लग्न स्वामी केंद्र/त्रिकोण में स्थित हो, तो कार्य में सफलता की प्रबल संभावना बनती है।
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Vedic Remedies & Gemstone */}
      {kundaliTab === 'remedies' && remedies && k && (
        <div className="space-y-6">
          <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold font-granth text-[#5C3A21] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#B56A00]" />
              {k.name} हेतु वैदिक उपाय, रत्न एवं इष्टदेव मार्गदर्शन
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
                <div className="text-[11px] text-[#8C6239] font-bold">शुभ रत्न (Lucky Gemstone)</div>
                <div className="text-sm font-black text-[#5C3A21] mt-1">{remedies.luckyGemstone}</div>
              </div>

              <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
                <div className="text-[11px] text-[#8C6239] font-bold">इष्ट देव (Ishta Devata)</div>
                <div className="text-sm font-black text-[#5C3A21] mt-1">{remedies.ishtaDevata}</div>
              </div>

              <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
                <div className="text-[11px] text-[#8C6239] font-bold">शुभ रंग (Lucky Color)</div>
                <div className="text-sm font-black text-[#5C3A21] mt-1">{remedies.luckyColor}</div>
              </div>
            </div>

            <div className="bg-[#F4E8D1] p-4 rounded-lg border border-[#8C6239]/20">
              <div className="text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-1">
                महामंत्र (Mantra)
              </div>
              <p className="text-xs sm:text-sm font-black text-[#5C3A21] leading-relaxed">
                {remedies.mantra}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
                दैनिक वैदिक उपाय (Daily Upay)
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
        </div>
      )}

      {/* ₹99 / Year Annual Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribed={(newStatus) => setSubStatus(newStatus)}
        reason={subscriptionReason}
      />
    </div>
  );
};
