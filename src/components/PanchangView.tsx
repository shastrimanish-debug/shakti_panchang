import React, { useState, useEffect } from 'react';
import { VedicPanchangData } from '../types';
import {
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Sparkles,
  Compass,
  Calendar,
  Clock,
  Download,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Settings2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Layers,
  Lock,
} from 'lucide-react';
import { useLicense } from '../lib/license-client';
import {
  getAuspiciousWindows,
  getInauspiciousWindows,
  getDayChoghadiya,
} from '../services/choghadiya';
import { DISHASHOOL_MAP, DISHASHOOL_REMEDIES } from '../services/disha';
import { downloadBhojpatraPdf } from '../services/bhojpatraPdf';
import { PdfSuccessModal, PdfSuccessInfo } from './PdfSuccessModal';
import { sharePanchang, copyPanchangToClipboard } from '../services/sharePanchang';
import { CalcSettingsPanel } from './CalcSettingsPanel';
import { DailyShlokaCard } from './DailyShlokaCard';
import { MoonPhaseChart } from './MoonPhaseChart';
import {
  calculateSpecialYogas,
  calculatePanchakAndBhadra,
  calculateHoraTable,
} from '../services/horaPanchakYogas';
import { HoraChakraView } from './HoraChakraView';
import { PanchakBhadraCard } from './PanchakBhadraCard';
import { DailyGocharView } from './DailyGocharView';

export type PanchangSubPage = 'main' | 'gochar' | 'hora' | 'muhurat' | 'disha';

const SUB_PAGES: { id: PanchangSubPage; label: string; icon: string; fullLabel: string }[] = [
  { id: 'main', label: 'मुख्य', icon: '🪔', fullLabel: 'मुख्य पंचांग (५ अंग)' },
  { id: 'gochar', label: 'गोचर', icon: '🪐', fullLabel: 'दैनिक नवग्रह गोचर चक्र' },
  { id: 'hora', label: 'होरा', icon: '⏳', fullLabel: '२४ घंटे का दैनिक होरा चक्र' },
  { id: 'muhurat', label: 'मुहूर्त', icon: '🛡️', fullLabel: 'शुभ मुहूर्त, चौघड़िया व पञ्चक' },
  { id: 'disha', label: 'दिशा', icon: '🧭', fullLabel: 'दिशाशूल, चन्द्र दर्शन व खगोल' },
];

interface PanchangViewProps {
  panchang: VedicPanchangData;
  onNavigateTab: (tab: string) => void;
  onOpenUmaModal?: (query?: string) => void;
  onOpenWhatsAppPanchang?: () => void;
  locationName?: string;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onOpenLocationModal?: () => void;
  latitude?: number;
  longitude?: number;
  timezoneHours?: number;
  onOpenSubscriptionModal?: (reason?: string) => void;
}

export const PanchangView: React.FC<PanchangViewProps> = ({
  panchang,
  onNavigateTab,
  onOpenUmaModal,
  onOpenWhatsAppPanchang,
  locationName = 'उज्जैन',
  currentDate,
  onDateChange,
  onOpenLocationModal,
  latitude = 23.1765,
  longitude = 75.7885,
  timezoneHours = 5.5,
  onOpenSubscriptionModal,
}) => {
  const { status: licenseStatus } = useLicense();
  const isAllowed = licenseStatus.entitled;

  // 5-page mobile-fit architecture (मुख्य, गोचर, होरा, मुहूर्त, दिशा)
  const [activeSubTab, setActiveSubTab] = useState<PanchangSubPage>('main');
  const [muhuratSubTab, setMuhuratSubTab] = useState<'shubh' | 'panchak'>('shubh');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<PdfSuccessInfo | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [showCalcOptions, setShowCalcOptions] = useState(false);

  // Sub-pages state (मुख्य, गोचर, होरा, मुहूर्त, दिशा)

  const specialYogas = calculateSpecialYogas(panchang);
  const { panchak, bhadra } = calculatePanchakAndBhadra(panchang);
  const solar = panchang.solar;
  const { currentActiveHora } = calculateHoraTable(solar, currentDate || panchang.date);
  const weekday = panchang.date.getDay();
  const auspicious = getAuspiciousWindows(solar);
  const inauspicious = getInauspiciousWindows(solar, weekday);

  const abhijit = auspicious.find((w) => w.title === 'अभिजित मुहूर्त');
  const brahma = auspicious.find((w) => w.title === 'ब्रह्म मुहूर्त');
  const amrit = auspicious.find((w) => w.title.includes('अमृत') || w.title.includes('शुभ'));
  const godhuli = auspicious.find((w) => w.title.includes('गोधूलि'));
  const rahu = inauspicious.find((w) => w.title === 'राहु काल');
  const yamaghanta = inauspicious.find((w) => w.title.includes('यमघण्ट'));
  const gulika = inauspicious.find((w) => w.title.includes('गुलिक'));

  const dishaShool = DISHASHOOL_MAP[weekday] || 'अज्ञात';
  const dishaRemedy = DISHASHOOL_REMEDIES[weekday] || '';

  const dayChoghadiyas = getDayChoghadiya(solar, weekday);

  const fmt = (d: Date) =>
    d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  const handlePrevDay = () => {
    if (onDateChange && currentDate) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      onDateChange(d);
    }
  };

  const handleNextDay = () => {
    if (onDateChange && currentDate) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      onDateChange(d);
    }
  };

  const currentSubPageIdx = SUB_PAGES.findIndex((p) => p.id === activeSubTab);

  const handlePrevSubPage = () => {
    if (!isAllowed) {
      onOpenSubscriptionModal?.("७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। अन्य चक्र देखने के लिए वार्षिक सदस्यता सक्रिय करें।");
      return;
    }
    const prevIdx = (currentSubPageIdx - 1 + SUB_PAGES.length) % SUB_PAGES.length;
    setActiveSubTab(SUB_PAGES[prevIdx].id);
  };

  const handleNextSubPage = () => {
    if (!isAllowed) {
      onOpenSubscriptionModal?.("७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। अन्य चक्र देखने के लिए वार्षिक सदस्यता सक्रिय करें।");
      return;
    }
    const nextIdx = (currentSubPageIdx + 1) % SUB_PAGES.length;
    setActiveSubTab(SUB_PAGES[nextIdx].id);
  };

  const handleShare = async () => {
    try {
      const loc = { name: locationName, latitude: 23.1765, longitude: 75.7885, state: '' };
      const outcome = await sharePanchang(panchang, loc);
      if (outcome === 'shared') {
        setShareNotice('पंचांग सफलतापूर्वक साझा किया गया!');
      } else if (outcome === 'whatsapp') {
        setShareNotice('व्हाट्सएप खोला गया!');
      }
      setTimeout(() => setShareNotice(null), 3000);
    } catch {
      setShareNotice('शेयर करने में त्रुटि आई');
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  const handleCopy = () => {
    const loc = { name: locationName, latitude: 23.1765, longitude: 75.7885, state: '' };
    const success = copyPanchangToClipboard(panchang, loc);
    if (success) {
      setShareNotice('आज का पंचांग क्लिपबोर्ड पर कॉपी हो गया!');
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  // Handle Bhojpatra PDF Download
  const handleDownloadTodayBhojpatra = async () => {
    try {
      setIsDownloadingPdf(true);
      const defaultGuidance = `॥ ॐ श्री गणेशाय नमः ॥\n\nआज ${panchang.weekday}, ${panchang.paksha} पक्ष की ${panchang.tithi} तिथि है। नक्षत्र ${panchang.nakshatra} (चरण ${panchang.pada}) तथा योग ${panchang.yoga} है। संवत्सर ${panchang.samvat} गतिशील है।\n\nशास्त्रानुसार आज सूर्य देव ${panchang.solarRashi} में एवं चंद्र देव ${panchang.lunarRashi} में स्थित हैं। आज के दिन प्रातःकाल सूर्य अर्घ्य तथा सात्विक कार्य सिद्धि हेतु अनुकूल समय का चयन करें। राहुकाल के समय किसी नवीन कार्य का आरंभ न करें।\n\n॥ शुभम् भवतु • कल्याणमस्तु ॥`;

      const res = await downloadBhojpatraPdf({
        panchang,
        query: `आज ${panchang.weekday} का दैनिक वैदिक पंचांग विवरण एवं शुभाशुभ योग`,
        answer: defaultGuidance,
        locationName,
        date: panchang.date,
      });

      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: res.pageCount,
        title: `दैनिक भोजपत्र पंचांग (${panchang.weekday}, ${panchang.tithi})`,
      });
    } catch (err) {
      console.error('Bhojpatra PDF generation error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const dateDisplay = (currentDate || panchang.date).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      <PdfSuccessModal
        info={pdfSuccessInfo}
        onClose={() => setPdfSuccessInfo(null)}
      />

      {/* 1. Mobile-Fit Compact Date & Location Header */}
      <div className="flex items-center justify-between bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl px-2 py-1 sm:py-1.5 shadow-2xs">
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-0.5 sm:p-1 hover:bg-[#F4E8D1] rounded-lg text-[#5C3A21] transition cursor-pointer active:scale-90"
          title="पिछला दिन"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="text-center">
          <div className="text-[11px] sm:text-xs font-black text-[#5C3A21] leading-tight">
            {panchang.weekday} • {dateDisplay}
          </div>
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="text-[9px] sm:text-[10px] font-semibold text-[#8C6239] hover:underline cursor-pointer flex items-center justify-center gap-0.5 mx-auto"
          >
            <span>📍 {locationName}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="p-0.5 sm:p-1 hover:bg-[#F4E8D1] rounded-lg text-[#5C3A21] transition cursor-pointer active:scale-90"
          title="अगला दिन"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* 2. Flutter-Style 5 Segmented Sub-Page Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#FAF2E4]/90 backdrop-blur-md border border-[#8C6239]/20 rounded-2xl shadow-xs">
        {SUB_PAGES.map((sub, idx) => {
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubTab(sub.id)}
              className={`flex-1 py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 ${
                isActive
                  ? 'bg-[#5C3A21] text-[#FFD88A] shadow-xs'
                  : 'bg-white/70 text-[#5C3A21] hover:bg-white'
              }`}
              title={sub.fullLabel}
            >
              <span>{sub.icon}</span>
              <span className="truncate">{sub.label}</span>
              <span className="text-[8px] opacity-70 font-mono hidden xs:inline">{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Share / Copy Notice Notification */}
      {shareNotice && (
        <div className="bg-emerald-800 text-[#FAF2E4] px-3 py-1.5 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in duration-150 shadow-xs">
          <Check className="w-3.5 h-3.5 text-emerald-300" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 1: 🪔 मुख्य अंग (100% Mobile Screen Fit - Zero Scroll Needed!) */}
      {/* ========================================================================= */}
      {activeSubTab === 'main' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          {/* Hero Tithi Card (Compact, High-Visual Hierarchy) */}
          <div className="bg-gradient-to-r from-[#FAF2E4] to-[#F5E7D0] border border-[#8C6239]/35 rounded-xl p-2.5 sm:p-3 shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8C6239] font-bold">
              <span>{panchang.paksha} पक्ष • {panchang.masa} मास</span>
              <span className="font-mono text-[10px] bg-[#8C6239]/15 text-[#5C3A21] px-1.5 py-0.5 rounded">
                {panchang.samvat}
              </span>
            </div>

            <div className="mt-1 flex items-baseline justify-between">
              <div>
                <span className="text-lg sm:text-xl font-black font-granth text-[#5C3A21]">
                  {panchang.tithi}
                </span>
                {panchang.tithiSpan && (
                  <span className="text-[11px] text-[#735133] ml-2">
                    ({fmt(panchang.tithiSpan.end)} तक)
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-[#B56A00]">
                {(panchang.tithiProgress * 100).toFixed(0)}% व्यतीत
              </span>
            </div>

            {/* Micro Tithi progress bar */}
            <div className="w-full bg-[#E5D2B8] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-[#B56A00] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, panchang.tithiProgress * 100))}%` }}
              />
            </div>
          </div>

          {/* Special Vedic Yogas Banner (सर्वार्थ सिद्धि, अमृत सिद्धि, गुरु पुष्य, द्विपुष्कर आदि) */}
          {specialYogas.length > 0 && (
            <div className="space-y-1">
              {specialYogas.map((y) => (
                <div
                  key={y.id}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs shadow-2xs ${y.badgeColor}`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-black text-[#5C3A21]">{y.name}</span>
                    <span className="text-[10px] text-[#735133] hidden sm:inline truncate">
                      — {y.description}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-[#5C3A21] shrink-0">
                    सक्रिय योग
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Panchak & Bhadra Quick Micro-Indicators */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div
              className={`px-2 py-1 rounded-lg border flex items-center justify-between shadow-2xs ${
                panchak.isActive
                  ? panchak.nature === 'auspicious'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-white border-[#8C6239]/20 text-[#735133]'
              }`}
            >
              <span className="font-bold">⚡ पञ्चक:</span>
              <span className="font-black truncate ml-1">{panchak.isActive ? panchak.typeNameHindi : 'पञ्चक मुक्त'}</span>
            </div>

            <div
              className={`px-2 py-1 rounded-lg border flex items-center justify-between shadow-2xs ${
                bhadra.isActive
                  ? bhadra.nature === 'varjya'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-white border-[#8C6239]/20 text-[#735133]'
              }`}
            >
              <span className="font-bold">🛡️ भद्रा:</span>
              <span className="font-black truncate ml-1">{bhadra.isActive ? `${bhadra.vas} (${bhadra.nature === 'varjya' ? 'वर्जित' : 'शुभ'})` : 'भद्रा मुक्त'}</span>
            </div>
          </div>

          {/* Quick Gochar & Hora Action Cards (1-Tap Fast Jump & Live Info) */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            {/* Gochar Snapshot Card */}
            <button
              type="button"
              onClick={() => setActiveSubTab('gochar')}
              className="bg-gradient-to-br from-[#FFF8E1] to-[#FFE082]/60 hover:to-[#FFE082] border border-[#FFE082] rounded-2xl p-2.5 text-left shadow-2xs transition cursor-pointer active:scale-95 group m3-touch"
              title="दैनिक प्रत्यक्ष नवग्रह गोचर चक्र देखें"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8C6239]">
                <span className="flex items-center gap-1">
                  <span>🪐</span>
                  <span>दैनिक ग्रह गोचर</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#B56A00] group-hover:translate-x-0.5 transition" />
              </div>
              <div className="text-xs font-black text-[#5C3A21] mt-0.5 truncate">
                सूर्य: {panchang.solarRashi} • चंद्र: {panchang.lunarRashi}
              </div>
              <div className="text-[9px] text-[#B56A00] font-bold mt-0.5 flex items-center justify-between">
                <span>नवग्रह चक्र व सारणी</span>
                <span>खोलें →</span>
              </div>
            </button>

            {/* Hora Snapshot Card */}
            <button
              type="button"
              onClick={() => setActiveSubTab('hora')}
              className="bg-gradient-to-br from-[#FAF2E4] to-[#F4E8D1] hover:to-[#EBDDC1] border border-[#8C6239]/30 rounded-2xl p-2.5 text-left shadow-2xs transition cursor-pointer active:scale-95 group m3-touch"
              title="२४ घंटे का दैनिक होरा चक्र देखें"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8C6239]">
                <span className="flex items-center gap-1">
                  <span>⏳</span>
                  <span>वर्तमान होरा चक्र</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#5C3A21] group-hover:translate-x-0.5 transition" />
              </div>
              <div className="text-xs font-black text-[#5C3A21] mt-0.5 truncate">
                {currentActiveHora ? `${currentActiveHora.symbol} ${currentActiveHora.planet} की होरा` : '२४ घंटे होरा'}
              </div>
              <div className="text-[9px] text-[#8C6239] font-bold mt-0.5 flex items-center justify-between">
                <span>दिन-रात्रि होरा सारणी</span>
                <span>खोलें →</span>
              </div>
            </button>
          </div>

          {/* 4 Anga 2x2 Grid (Ultra-Compact Mobile Fit) */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* 1. नक्षत्र */}
            <div className="bg-white border border-[#8C6239]/25 rounded-xl p-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C6239] uppercase">🌟 नक्षत्र</span>
                <span className="text-[9px] font-bold text-[#B56A00]">
                  {(panchang.nakshatraProgress * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs font-black text-[#5C3A21] mt-0.5 truncate">
                {panchang.nakshatra}
              </div>
              <div className="text-[10px] text-[#735133]">
                चरण {panchang.pada}
              </div>
            </div>

            {/* 2. योग */}
            <div className="bg-white border border-[#8C6239]/25 rounded-xl p-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C6239] uppercase">☯️ योग</span>
                <span className="text-[9px] font-mono text-[#8C6239]">
                  {panchang.yogaNumber}/27
                </span>
              </div>
              <div className="text-xs font-black text-[#5C3A21] mt-0.5 truncate">
                {panchang.yoga}
              </div>
              <div className="text-[10px] text-[#735133]">
                दैनिक योग
              </div>
            </div>

            {/* 3. करण */}
            <div className="bg-white border border-[#8C6239]/25 rounded-xl p-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C6239] uppercase">⚡ करण</span>
                <span className="text-[9px] font-mono text-[#8C6239]">
                  करण {panchang.karanaNumber}
                </span>
              </div>
              <div className="text-xs font-black text-[#5C3A21] mt-0.5 truncate">
                {panchang.karana}
              </div>
              <div className="text-[10px] text-[#735133]">
                आधा तिथि मान
              </div>
            </div>

            {/* 4. वार एवं राशि */}
            <div className="bg-white border border-[#8C6239]/25 rounded-xl p-2 shadow-2xs">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">♈ सूर्य-चन्द्र राशि</div>
              <div className="text-xs font-black text-[#5C3A21] mt-0.5 truncate">
                चंद्र: {panchang.lunarRashi}
              </div>
              <div className="text-[10px] text-[#735133] truncate">
                सूर्य: {panchang.solarRashi}
              </div>
            </div>
          </div>

          {/* Sun & Moon Timings 4-Col Ribbon */}
          <div className="grid grid-cols-4 gap-1 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-1.5 shadow-2xs text-center">
            <div className="p-1 rounded-lg bg-white/70">
              <div className="text-[9px] font-bold text-[#8C6239] flex items-center justify-center gap-0.5">
                <Sunrise className="w-3 h-3 text-amber-600" />
                <span>सूर्योदय</span>
              </div>
              <div className="text-[11px] font-black font-mono text-[#5C3A21] mt-0.5">
                {fmt(solar.sunrise)}
              </div>
            </div>

            <div className="p-1 rounded-lg bg-white/70">
              <div className="text-[9px] font-bold text-[#8C6239] flex items-center justify-center gap-0.5">
                <Sunset className="w-3 h-3 text-orange-600" />
                <span>सूर्यास्त</span>
              </div>
              <div className="text-[11px] font-black font-mono text-[#5C3A21] mt-0.5">
                {fmt(solar.sunset)}
              </div>
            </div>

            <div className="p-1 rounded-lg bg-white/70">
              <div className="text-[9px] font-bold text-[#8C6239] flex items-center justify-center gap-0.5">
                <Sun className="w-3 h-3 text-yellow-600" />
                <span>मध्याह्न</span>
              </div>
              <div className="text-[11px] font-black font-mono text-[#5C3A21] mt-0.5">
                {fmt(solar.solarNoon)}
              </div>
            </div>

            <div className="p-1 rounded-lg bg-white/70">
              <div className="text-[9px] font-bold text-[#8C6239] flex items-center justify-center gap-0.5">
                <Moon className="w-3 h-3 text-indigo-600" />
                <span>चन्द्र</span>
              </div>
              <div className="text-[11px] font-black text-[#5C3A21] mt-0.5 truncate">
                {panchang.lunarRashi}
              </div>
            </div>
          </div>

          {/* 1-Click WhatsApp Daily Panchang Card Button */}
          {onOpenWhatsAppPanchang && (
            <button
              type="button"
              onClick={() => onOpenWhatsAppPanchang()}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#25D366] via-[#20BD5A] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#1aa852] text-white font-black text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-97 m3-touch"
              title="दैनिक पंचांग व सुविचार व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>📲 व्हाट्सएप सुप्रभात पंचांग कार्ड (सुविचार सहित)</span>
            </button>
          )}

          {/* Quick Action Row (4 Buttons) */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={handleShare}
              className="py-2 px-1 bg-[#1e7e34] hover:bg-[#155d27] text-white font-bold text-xs rounded-2xl transition flex flex-col items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95 m3-touch"
              title="व्हाट्सएप पंचांग साझा करें"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-200" />
              <span className="text-[10px]">साझा करें</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTodayBhojpatra}
              disabled={isDownloadingPdf}
              className="py-2 px-1 bg-[#8f2121] hover:bg-[#731919] text-[#fdf8eb] font-bold text-xs rounded-2xl transition flex flex-col items-center justify-center gap-1 shadow-2xs disabled:opacity-50 cursor-pointer active:scale-95 m3-touch"
              title="भोजपत्र PDF डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5 text-[#ffd88a]" />
              <span className="text-[10px] font-bold">{isDownloadingPdf ? 'तैयार…' : 'भोजपत्र PDF'}</span>
            </button>

            {onOpenUmaModal && (
              <button
                type="button"
                onClick={() => onOpenUmaModal()}
                className="py-2 px-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-black text-xs rounded-2xl transition flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 m3-touch uma-glow-badge"
                title="उमा AI - सनातन दैवज्ञ परामर्श"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                <span className="text-[10px] font-black">उमा AI ✨</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="py-2 px-1 bg-white/90 hover:bg-white text-[#5C3A21] border border-[#8C6239]/20 font-bold text-xs rounded-2xl transition flex flex-col items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95 m3-touch"
              title="पंचांग टेक्स्ट कॉपी करें"
            >
              <Copy className="w-3.5 h-3.5 text-[#B56A00]" />
              <span className="text-[10px]">कॉपी</span>
            </button>
          </div>

          {/* Quick link to Monthly Calendar & Vrat Katha */}
          {onNavigateTab && (
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => onNavigateTab('festivals')}
                className="text-[11px] font-bold text-[#8B1E1E] hover:text-[#5C3A21] flex items-center justify-center gap-1.5 py-1.5 bg-[#FAF2E4] hover:bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl transition cursor-pointer shadow-2xs active:scale-98"
                title="पूरे महीने के व्रत, त्यौहार और तिथियाँ मासिक पंचांग में देखें"
              >
                <Calendar className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>🗓️ मासिक पंचांग</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('vratkatha')}
                className="text-[11px] font-bold text-[#5C3A21] hover:text-[#8B1E1E] flex items-center justify-center gap-1.5 py-1.5 bg-[#FAF2E4] hover:bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl transition cursor-pointer shadow-2xs active:scale-98"
                title="व्रत कथा, पूजा विधि एवं आरती संग्रह"
              >
                <span>📖 व्रत कथा व आरती</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: 🪐 दैनिक प्रत्यक्ष नवग्रह गोचर चक्र (Live Planetary Transit) */}
      {/* ========================================================================= */}
      {activeSubTab === 'gochar' && (
        <DailyGocharView
          date={currentDate || panchang.date}
          locationName={locationName}
          lat={latitude}
          lon={longitude}
          tzHours={timezoneHours}
          onOpenUmaModal={onOpenUmaModal}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: ⏳ दैनिक २४ घंटे होरा चक्र (24-Hour Hora Table) */}
      {/* ========================================================================= */}
      {activeSubTab === 'hora' && (
        <HoraChakraView
          solar={solar}
          date={currentDate || panchang.date}
          locationName={locationName}
          onOpenUmaModal={onOpenUmaModal}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: 🛡️ शुभ मुहूर्त, चौघड़िया एवं पञ्चक-भद्रा */}
      {/* ========================================================================= */}
      {activeSubTab === 'muhurat' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          {/* Muhurat Sub-Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setMuhuratSubTab('shubh')}
              className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-black transition cursor-pointer text-center ${
                muhuratSubTab === 'shubh'
                  ? 'bg-[#5C3A21] text-white shadow-xs'
                  : 'text-[#5C3A21] hover:bg-[#F4E8D1]'
              }`}
            >
              ⏳ शुभ मुहूर्त व चौघड़िया
            </button>

            <button
              type="button"
              onClick={() => setMuhuratSubTab('panchak')}
              className={`flex-1 py-1.5 px-1 rounded-lg text-xs font-black transition cursor-pointer text-center ${
                muhuratSubTab === 'panchak'
                  ? 'bg-[#5C3A21] text-white shadow-xs'
                  : 'text-[#5C3A21] hover:bg-[#F4E8D1]'
              }`}
            >
              🛡️ पञ्चक व भद्रा विचार
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('hora')}
              className="py-1.5 px-2 rounded-lg text-xs font-bold text-[#B56A00] hover:bg-[#F4E8D1] transition cursor-pointer text-center flex items-center justify-center gap-1 shrink-0"
              title="२४ घंटे का सम्पूर्ण होरा चक्र खोलें"
            >
              <span>🪐 होरा</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Sub-View 1: Standard Shubh/Tyajya Windows & Day Choghadiya */}
          {muhuratSubTab === 'shubh' && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              {/* Active Special Yogas if any */}
              {specialYogas.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-black text-[#B56A00] flex items-center gap-1 px-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>आज के विशिष्ट सिद्ध योग</span>
                  </div>
                  {specialYogas.map((y) => (
                    <div
                      key={y.id}
                      className={`p-2.5 rounded-xl border text-xs shadow-2xs space-y-1 ${y.badgeColor}`}
                    >
                      <div className="flex items-center justify-between font-black text-[#5C3A21]">
                        <span>{y.name}</span>
                        <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">सक्रिय</span>
                      </div>
                      <div className="text-xs text-[#5C3A21]">{y.description}</div>
                      <div className="text-[11px] text-[#735133] leading-snug">
                        <strong>निर्देश: </strong>{y.guidance}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tyajya / Inauspicious Cards (लाल रंग - Red) */}
              <div className="space-y-1.5">
                <div className="text-xs font-black text-[#B71C1C] flex items-center gap-1 px-1">
                  <span>⚠️ त्याज्य / अशुभ काल (वर्जित समय)</span>
                </div>

                {rahu && (
                  <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-black text-[#B71C1C]">राहु काल</div>
                      <div className="text-[10px] text-[#C62828]">नवीन कार्य आरंभ वर्जित</div>
                    </div>
                    <div className="font-black font-mono text-[#B71C1C] text-xs sm:text-sm">
                      {fmt(rahu.start)} – {fmt(rahu.end)}
                    </div>
                  </div>
                )}

                {yamaghanta && (
                  <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-black text-[#B71C1C]">यमगण्ड</div>
                      <div className="text-[10px] text-[#C62828]">यात्रा व शुभ कार्य त्याज्य</div>
                    </div>
                    <div className="font-black font-mono text-[#B71C1C] text-xs sm:text-sm">
                      {fmt(yamaghanta.start)} – {fmt(yamaghanta.end)}
                    </div>
                  </div>
                )}

                {gulika && (
                  <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-black text-[#B71C1C]">गुलिक काल</div>
                      <div className="text-[10px] text-[#C62828]">मन्द फलदायी समय</div>
                    </div>
                    <div className="font-black font-mono text-[#B71C1C] text-xs sm:text-sm">
                      {fmt(gulika.start)} – {fmt(gulika.end)}
                    </div>
                  </div>
                )}
              </div>

              {/* Auspicious Cards (हरा रंग - Green) */}
              <div className="space-y-1.5">
                <div className="text-xs font-black text-[#1B5E20] flex items-center gap-1 px-1">
                  <span>✨ शुभ मुहूर्त (सर्वकार्य सिद्धि)</span>
                </div>

                {abhijit && (
                  <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-black text-[#1B5E20]">अभिजित मुहूर्त</div>
                      <div className="text-[10px] text-[#2E7D32]">सर्वकार्य सिद्धिदायक काल</div>
                    </div>
                    <div className="font-black font-mono text-[#1B5E20] text-xs sm:text-sm">
                      {fmt(abhijit.start)} – {fmt(abhijit.end)}
                    </div>
                  </div>
                )}

                {brahma && (
                  <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-black text-[#1B5E20]">ब्रह्म मुहूर्त</div>
                      <div className="text-[10px] text-[#2E7D32]">ईश्वर ध्यान, साधना व अध्ययन</div>
                    </div>
                    <div className="font-black font-mono text-[#1B5E20] text-xs sm:text-sm">
                      {fmt(brahma.start)} – {fmt(brahma.end)}
                    </div>
                  </div>
                )}

                {amrit && (
                  <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-black text-[#1B5E20]">अमृत काल</div>
                      <div className="text-[10px] text-[#2E7D32]">श्रेष्ठ अमृत सिद्धि योग</div>
                    </div>
                    <div className="font-black font-mono text-[#1B5E20] text-xs sm:text-sm">
                      {fmt(amrit.start)} – {fmt(amrit.end)}
                    </div>
                  </div>
                )}

                {godhuli && (
                  <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <div className="font-black text-[#1B5E20]">गोधूलि मुहूर्त</div>
                      <div className="text-[10px] text-[#2E7D32]">संध्या दीपदान व पूजन</div>
                    </div>
                    <div className="font-black font-mono text-[#1B5E20] text-xs sm:text-sm">
                      {fmt(godhuli.start)} – {fmt(godhuli.end)}
                    </div>
                  </div>
                )}
              </div>

              {/* Day Choghadiya List (दिन चौघड़िया) */}
              <div className="pt-1 space-y-1.5">
                <div className="text-xs font-black text-[#5C3A21] px-0.5">दिन चौघड़िया चक्र</div>
                <div className="space-y-1">
                  {dayChoghadiyas.map((c, idx) => {
                    const isTyajya = c.nature === 'inauspicious';
                    const isShubh = c.nature === 'auspicious';
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl px-3 py-1.5 flex items-center justify-between text-xs border shadow-2xs ${
                          isTyajya
                            ? 'bg-[#FFEBEE] border-[#FFCDD2] text-[#B71C1C]'
                            : isShubh
                            ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#1B5E20]'
                            : 'bg-[#FFF8E1] border-[#FFE082] text-[#F57F17]'
                        }`}
                      >
                        <div>
                          <span className="font-black">{c.hindiName}</span>
                          <span className="text-[10px] opacity-80 ml-1.5">({c.meaning})</span>
                        </div>
                        <div className="font-black font-mono text-xs">
                          {fmt(c.start)} – {fmt(c.end)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sub-View 2: Panchak and Bhadra Analysis */}
          {muhuratSubTab === 'panchak' && (
            <PanchakBhadraCard panchak={panchak} bhadra={bhadra} />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 5: 🧭 यात्रा, दिशाशूल, चन्द्र दर्शन एवं खगोल */}
      {/* ========================================================================= */}
      {activeSubTab === 'disha' && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          {/* Disha Shool Card */}
          <div className="bg-[#FFF4DC] border border-[#FFE082] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Compass className="w-6 h-6 text-[#B56A00] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-black text-[#5C3A21]">
                  आज का दिशाशूल: {dishaShool} दिशा
                </div>
                <div className="text-xs text-[#735133] leading-relaxed">
                  आज <strong className="text-[#B71C1C]">{dishaShool}</strong> दिशा में नई यात्रा शुरू न करें।
                </div>
                <div className="pt-1.5 text-xs text-[#5C3A21] border-t border-[#8C6239]/20">
                  <span className="font-bold text-[#B56A00]">वैदिक परिहार: </span>
                  {dishaRemedy || 'यात्रा आवश्यक होने पर थोड़ा मीठा या दही खाकर भगवान गणेश का स्मरण करके निकलें।'}
                </div>
              </div>
            </div>
          </div>

          {/* D3.js Moon Phase & Current Tithi Progress Visualization */}
          <MoonPhaseChart panchang={panchang} />

          {/* Key Ephemeris Metrics */}
          <div className="bg-white border border-[#8C6239]/25 rounded-xl p-3 space-y-2 shadow-2xs">
            <div className="text-xs font-black text-[#5C3A21] border-b border-[#8C6239]/15 pb-1 flex items-center justify-between">
              <span>खगोलीय रेखांश एवं अयनांश</span>
              <span className="text-[10px] text-[#8C6239]">दृक-सिद्धान्त</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#FAF2E4]/80 p-2 rounded-lg border border-[#8C6239]/20">
                <span className="text-[10px] font-bold text-[#8C6239] block">अयनांश</span>
                <span className="font-bold text-[#5C3A21] mt-0.5 block">
                  {panchang.ayanamshaName}
                </span>
                <span className="font-mono text-[11px] text-[#735133]">
                  {panchang.ayanamsha.toFixed(4)}°
                </span>
              </div>

              <div className="bg-[#FAF2E4]/80 p-2 rounded-lg border border-[#8C6239]/20">
                <span className="text-[10px] font-bold text-[#8C6239] block">गणना इंजन</span>
                <span className="font-bold text-[#5C3A21] mt-0.5 block">
                  Astronomical Ephemeris
                </span>
                <span className="text-[10px] text-[#735133]">
                  High-Precision VSOP87
                </span>
              </div>
            </div>
          </div>

          {/* Boundaries Spans (यदि उपलब्ध हों) */}
          {(panchang.tithiSpan || panchang.nakshatraSpan || panchang.yogaSpan || panchang.karanaSpan) && (
            <div className="bg-white border border-[#8C6239]/25 rounded-xl p-3 space-y-1.5 shadow-2xs">
              <div className="text-xs font-black text-[#5C3A21] border-b border-[#8C6239]/15 pb-1">
                काल आरंभ–समाप्ति सीमाएँ
              </div>
              {panchang.tithiSpan && (
                <div className="text-xs text-[#735133]">
                  <span className="font-bold text-[#5C3A21]">तिथि: </span>
                  {fmt(panchang.tithiSpan.start)} – {fmt(panchang.tithiSpan.end)} → {panchang.tithiSpan.nextName}
                </div>
              )}
              {panchang.nakshatraSpan && (
                <div className="text-xs text-[#735133]">
                  <span className="font-bold text-[#5C3A21]">नक्षत्र: </span>
                  {fmt(panchang.nakshatraSpan.start)} – {fmt(panchang.nakshatraSpan.end)} → {panchang.nakshatraSpan.nextName}
                </div>
              )}
              {panchang.yogaSpan && (
                <div className="text-xs text-[#735133]">
                  <span className="font-bold text-[#5C3A21]">योग: </span>
                  {fmt(panchang.yogaSpan.start)} – {fmt(panchang.yogaSpan.end)} → {panchang.yogaSpan.nextName}
                </div>
              )}
              {panchang.karanaSpan && (
                <div className="text-xs text-[#735133]">
                  <span className="font-bold text-[#5C3A21]">करण: </span>
                  {fmt(panchang.karanaSpan.start)} {panchang.karanaSpan.name}
                </div>
              )}
            </div>
          )}

          {/* Travel Advice Button */}
          <div className="bg-white border border-[#8C6239]/25 rounded-xl p-3 shadow-2xs space-y-1.5">
            <div className="text-xs font-black text-[#5C3A21]">यात्रा मार्गदर्शन</div>
            <div className="text-xs text-[#735133] leading-relaxed">
              शास्त्रानुसार जिस दिशा में शूल हो, उस दिशा में यात्रा करने से कार्य में विघ्न व विलंब हो सकता है। यदि अत्यंत आवश्यक हो, तो परिहार वस्तु ग्रहण करके पाँच पग पीछे हटकर शुभ मुहूर्त में प्रस्थान करें।
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigateTab('yatra')}
                className="w-full py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] font-bold text-xs text-center rounded-lg transition cursor-pointer"
              >
                सम्पूर्ण यात्रा दिशाशूल व दिशा सलाह खोलें →
              </button>
            </div>
          </div>

          {/* Collapsible Calculation Options (गणना विकल्प) */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowCalcOptions(!showCalcOptions)}
              className="w-full py-1.5 px-3 bg-[#FAF2E4] hover:bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl text-xs font-bold text-[#5C3A21] flex items-center justify-between cursor-pointer transition shadow-2xs"
            >
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-[#B56A00]" />
                गणना विकल्प (अयनांश, राहु, भाव)
              </span>
              {showCalcOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showCalcOptions && (
              <div className="mt-1.5">
                <CalcSettingsPanel compact={true} />
              </div>
            )}
          </div>

          {/* Daily Shloka Verse of Wisdom (दैनिक सुभाषितम्) */}
          <DailyShlokaCard date={currentDate || panchang.date} />
        </div>
      )}

      {/* 5. Flutter-Style Page Navigator (Next / Prev Page Buttons) */}
      <div className="flex items-center justify-between bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl px-3 py-1.5 shadow-2xs text-xs">
        <button
          type="button"
          onClick={handlePrevSubPage}
          className="flex items-center gap-1 font-bold text-[#5C3A21] hover:text-[#B56A00] transition cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>पिछला</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] font-bold text-[#8C6239]">
          <Layers className="w-3 h-3 text-[#B56A00]" />
          <span>पृष्ठ {currentSubPageIdx + 1}/{SUB_PAGES.length} : {SUB_PAGES[currentSubPageIdx].label}</span>
        </div>

        <button
          type="button"
          onClick={handleNextSubPage}
          className="flex items-center gap-1 font-bold text-[#B56A00] hover:text-[#5C3A21] transition cursor-pointer active:scale-95"
        >
          <span>अगला</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
