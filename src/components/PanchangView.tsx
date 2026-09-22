import React, { useState } from 'react';
import { VedicPanchangData } from '../types';
import {
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Sparkles,
  Compass,
  ShieldAlert,
  Award,
  Calendar,
  CalendarDays,
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
} from 'lucide-react';
import {
  getAuspiciousWindows,
  getInauspiciousWindows,
  getDayChoghadiya,
  getNightChoghadiya,
} from '../services/choghadiya';
import { DISHASHOOL_MAP, DISHASHOOL_REMEDIES } from '../services/disha';
import { downloadBhojpatraPdf } from '../services/bhojpatraPdf';
import { PdfSuccessModal, PdfSuccessInfo } from './PdfSuccessModal';
import { sharePanchang, copyPanchangToClipboard } from '../services/sharePanchang';
import { CalcSettingsPanel } from './CalcSettingsPanel';
import { DailyShlokaCard } from './DailyShlokaCard';
import { MoonPhaseChart } from './MoonPhaseChart';

interface PanchangViewProps {
  panchang: VedicPanchangData;
  onNavigateTab: (tab: string) => void;
  onOpenUmaModal?: () => void;
  locationName?: string;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onOpenLocationModal?: () => void;
}

export const PanchangView: React.FC<PanchangViewProps> = ({
  panchang,
  onNavigateTab,
  onOpenUmaModal,
  locationName = 'उज्जैन',
  currentDate,
  onDateChange,
  onOpenLocationModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'anga' | 'muhurat' | 'disha'>('anga');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<PdfSuccessInfo | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [showCalcOptions, setShowCalcOptions] = useState(false);

  const solar = panchang.solar;
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
      console.error(err);
      alert('भोजपत्र पत्रिका तैयार करने में त्रुटि आई।');
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
    <div className="space-y-2.5 animate-in fade-in duration-150">
      <PdfSuccessModal
        info={pdfSuccessInfo}
        onClose={() => setPdfSuccessInfo(null)}
      />

      {/* 1. Flutter-Style Date Selector Row */}
      <div className="flex items-center justify-between bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl px-2 py-1.5 shadow-xs">
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-1 hover:bg-[#F4E8D1] rounded-lg text-[#5C3A21] transition cursor-pointer"
          title="पिछला दिन"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-xs sm:text-sm font-black text-[#5C3A21]">
            {panchang.weekday}  {dateDisplay}
          </div>
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="text-[10px] sm:text-xs font-semibold text-[#8C6239] hover:underline cursor-pointer"
          >
            📍 {locationName}
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="p-1 hover:bg-[#F4E8D1] rounded-lg text-[#5C3A21] transition cursor-pointer"
          title="अगला दिन"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quick link to Kalnirnay Monthly Calendar */}
      {onNavigateTab && (
        <div className="flex items-center justify-end px-0.5">
          <button
            type="button"
            onClick={() => onNavigateTab('festivals')}
            className="text-[11px] sm:text-xs font-bold text-[#8B1E1E] hover:text-[#5C3A21] flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF2E4] hover:bg-[#F4E8D1] border border-[#8C6239]/30 rounded-lg transition cursor-pointer shadow-2xs active:scale-95"
            title="पूरे महीने के व्रत, त्यौहार और तिथियाँ मासिक पंचांग में देखें"
          >
            <Calendar className="w-3.5 h-3.5 text-[#B56A00]" />
            <span>🗓️ मासिक पंचांग देखें →</span>
          </button>
        </div>
      )}

      {/* 2. Flutter Exact 3 Segmented Chips (_chip: अंग, मुहूर्त, दिशा) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('anga')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
            activeSubTab === 'anga'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <span>अंग</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('muhurat')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
            activeSubTab === 'muhurat'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <span>मुहूर्त</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('disha')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
            activeSubTab === 'disha'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <span>दिशा</span>
        </button>
      </div>

      {/* Share / Copy Notice Notification */}
      {shareNotice && (
        <div className="bg-emerald-800 text-[#FAF2E4] px-3 py-1.5 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in duration-150 shadow-xs">
          <Check className="w-3.5 h-3.5 text-emerald-300" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* 3. Sub-Tab 0: 'अंग' (Five Limbs & Astronomical Ephemeris) */}
      {activeSubTab === 'anga' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* D3.js Moon Phase & Current Tithi Progress Visualization */}
          <MoonPhaseChart panchang={panchang} />

          {/* Quick Header Card */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8C6239] font-bold">
              <span>{panchang.paksha} पक्ष • {panchang.masa} मास</span>
              <span>{panchang.samvat}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-base sm:text-lg font-black font-granth text-[#5C3A21]">
                {panchang.tithi}
              </span>
              <span className="text-xs font-bold text-[#8C6239]">
                {(panchang.tithiProgress * 100).toFixed(0)}% व्यतीत
              </span>
            </div>
            {/* Tithi progress bar */}
            <div className="w-full bg-[#E5D2B8] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-[#B56A00] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, panchang.tithiProgress * 100))}%` }}
              />
            </div>
          </div>

          {/* Key-Value Pairs List (_kv) */}
          <div className="space-y-1.5">
            <div className="bg-white border border-[#8C6239]/25 rounded-xl px-3 py-2 shadow-2xs">
              <div className="text-xs font-black text-[#5C3A21]">पक्ष / तिथि</div>
              <div className="text-xs font-semibold text-[#735133] mt-0.5">
                {panchang.paksha}  {panchang.tithi}  ({(panchang.tithiProgress * 100).toFixed(0)}%)
              </div>
            </div>

            <div className="bg-white border border-[#8C6239]/25 rounded-xl px-3 py-2 shadow-2xs">
              <div className="text-xs font-black text-[#5C3A21]">नक्षत्र</div>
              <div className="text-xs font-semibold text-[#735133] mt-0.5">
                {panchang.nakshatra}  ({(panchang.nakshatraProgress * 100).toFixed(0)}%) • चरण {panchang.pada}
              </div>
            </div>

            <div className="bg-white border border-[#8C6239]/25 rounded-xl px-3 py-2 shadow-2xs">
              <div className="text-xs font-black text-[#5C3A21]">योग</div>
              <div className="text-xs font-semibold text-[#735133] mt-0.5">
                {panchang.yoga} (योग {panchang.yogaNumber}/27)
              </div>
            </div>

            <div className="bg-white border border-[#8C6239]/25 rounded-xl px-3 py-2 shadow-2xs">
              <div className="text-xs font-black text-[#5C3A21]">करण</div>
              <div className="text-xs font-semibold text-[#735133] mt-0.5">
                {panchang.karana} (करण {panchang.karanaNumber})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-white border border-[#8C6239]/25 rounded-xl px-3 py-2 shadow-2xs">
                <div className="text-xs font-black text-[#5C3A21]">सूर्य राशि</div>
                <div className="text-xs font-semibold text-[#735133] mt-0.5">
                  {panchang.solarRashi} राशि
                </div>
              </div>
              <div className="bg-white border border-[#8C6239]/25 rounded-xl px-3 py-2 shadow-2xs">
                <div className="text-xs font-black text-[#5C3A21]">चंद्र राशि</div>
                <div className="text-xs font-semibold text-[#735133] mt-0.5">
                  {panchang.lunarRashi} राशि
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#8C6239]/25 rounded-xl px-3 py-2 shadow-2xs">
              <div className="text-xs font-black text-[#5C3A21]">अयनांश</div>
              <div className="text-xs font-semibold text-[#735133] mt-0.5">
                {panchang.ayanamshaName}  {panchang.ayanamsha.toFixed(4)}°
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <div className="bg-white border border-[#8C6239]/25 rounded-xl px-2.5 py-1.5 shadow-2xs text-center">
                <div className="text-[10px] font-bold text-[#8C6239]">सूर्योदय</div>
                <div className="text-xs font-black text-[#5C3A21] mt-0.5">{fmt(solar.sunrise)}</div>
              </div>
              <div className="bg-white border border-[#8C6239]/25 rounded-xl px-2.5 py-1.5 shadow-2xs text-center">
                <div className="text-[10px] font-bold text-[#8C6239]">सूर्यास्त</div>
                <div className="text-xs font-black text-[#5C3A21] mt-0.5">{fmt(solar.sunset)}</div>
              </div>
              <div className="bg-white border border-[#8C6239]/25 rounded-xl px-2.5 py-1.5 shadow-2xs text-center">
                <div className="text-[10px] font-bold text-[#8C6239]">मध्याह्न</div>
                <div className="text-xs font-black text-[#5C3A21] mt-0.5">{fmt(solar.solarNoon)}</div>
              </div>
              <div className="bg-white border border-[#8C6239]/25 rounded-xl px-2.5 py-1.5 shadow-2xs text-center">
                <div className="text-[10px] font-bold text-[#8C6239]">आगामी उदय</div>
                <div className="text-xs font-black text-[#5C3A21] mt-0.5">{fmt(solar.nextSunrise)}</div>
              </div>
            </div>

            <div className="bg-white border border-[#8C6239]/25 rounded-xl px-3 py-2 shadow-2xs">
              <div className="text-xs font-black text-[#5C3A21]">इंजन</div>
              <div className="text-xs font-semibold text-[#735133] mt-0.5">
                Precision Astronomical Ephemeris Engine
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

          {/* Collapsible Calculation Options (गणना विकल्प) */}
          <div className="pt-1">
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
        </div>
      )}

      {/* 4. Sub-Tab 1: 'मुहूर्त' (Inauspicious & Auspicious Timings & Day Choghadiya) */}
      {activeSubTab === 'muhurat' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          {/* Tyajya / Inauspicious Cards (लाल रंग - Red) */}
          <div className="space-y-1.5">
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
            <div className="text-xs font-black text-[#5C3A21] px-0.5">दिन चौघड़िया</div>
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

      {/* 5. Sub-Tab 2: 'दिशा' (Disha Shool & Travel Guidance) */}
      {activeSubTab === 'disha' && (
        <div className="space-y-2 animate-in fade-in duration-150">
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

          <div className="bg-white border border-[#8C6239]/25 rounded-xl p-3 shadow-2xs space-y-1.5">
            <div className="text-xs font-black text-[#5C3A21]">यात्रा मार्गदर्शन</div>
            <div className="text-xs text-[#735133] leading-relaxed">
              शास्त्रानुसार जिस दिशा में शूल हो, उस दिशा में यात्रा करने से कार्य में विघ्न व विलंब हो सकता है। यदि अत्यंत आवश्यक हो, तो परिहार वस्तु ग्रहण करके पाँच पग पीछे हटकर शुभ मुहूर्त में प्रस्थान करें।
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('yatra')}
                className="w-full py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] font-bold text-xs text-center rounded-lg transition cursor-pointer"
              >
                सम्पूर्ण यात्रा दिशाशूल व दिशा सलाह खोलें →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Shloka Verse of Wisdom (दैनिक सुभाषितम्) */}
      <DailyShlokaCard date={currentDate || panchang.date} />

      {/* 6. Quick Action Row (WhatsApp Share, Bhojpatra PDF, Uma AI, Copy) */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        <button
          type="button"
          onClick={handleShare}
          className="py-2 px-1 bg-[#1e7e34] hover:bg-[#155d27] text-white font-bold text-xs rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
          title="व्हाट्सएप पंचांग साझा करें"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-200" />
          <span className="text-[10px] sm:text-xs">साझा करें</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadTodayBhojpatra}
          disabled={isDownloadingPdf}
          className="py-2 px-1 bg-[#8f2121] hover:bg-[#731919] text-[#fdf8eb] font-bold text-xs rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
          title="भोजपत्र PDF डाउनलोड करें"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="text-[10px] sm:text-xs">{isDownloadingPdf ? 'तैयार…' : 'भोजपत्र PDF'}</span>
        </button>

        {onOpenUmaModal && (
          <button
            type="button"
            onClick={onOpenUmaModal}
            className="py-2 px-1 bg-[#c27803] hover:bg-[#a66602] text-[#2a1303] font-bold text-xs rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
            title="उमा AI से परामर्श करें"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs">उमा AI</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="py-2 px-1 bg-[#FAF2E4] hover:bg-[#F4E8D1] text-[#5C3A21] border border-[#8C6239]/40 font-bold text-xs rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
          title="पंचांग टेक्स्ट कॉपी करें"
        >
          <Copy className="w-3.5 h-3.5 text-[#B56A00]" />
          <span className="text-[10px] sm:text-xs">कॉपी</span>
        </button>
      </div>
    </div>
  );
};
