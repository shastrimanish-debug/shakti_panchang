import React, { useState } from 'react';
import {
  VedicPanchangData,
} from '../types';
import {
  formatPlaceTime,
} from '../services/engine/time';
import {
  Sparkles,
  Check,
  Copy,
  Share2,
  Download,
  Calendar,
} from 'lucide-react';
import {
  calculateSpecialYogas,
  calculatePanchakAndBhadra,
  calculateHoraTable,
} from '../services/horaPanchakYogas';
import {
  getAuspiciousWindows,
  getInauspiciousWindows,
} from '../services/choghadiya';
import { downloadBhojpatraPdf } from '../services/bhojpatraPdf';
import { PdfSuccessModal } from './PdfSuccessModal';

// Sub-pages inside Panchang tab
export type PanchangSubPage = 'main' | 'gochar' | 'hora' | 'muhurat_quick' | 'khagol';

interface PanchangViewProps {
  panchang: VedicPanchangData;
  onNavigateTab?: (tabId: string) => void;
  onOpenUmaModal?: (initialQuery?: string) => void;
  onOpenWhatsAppPanchang?: () => void;
  onOpenSubscriptionModal?: (reason?: string) => void;
  locationName?: string;
  currentDate?: Date;
  onDateChange?: (d: Date) => void;
  onOpenLocationModal?: () => void;
  latitude?: number;
  longitude?: number;
  timezoneHours?: number;
}

const SUB_PAGES: { id: PanchangSubPage; label: string; fullLabel: string; icon: string }[] = [
  { id: 'main', label: 'मुख्य', fullLabel: 'मुख्य अंग', icon: '🪔' },
  { id: 'gochar', label: 'गोचर', fullLabel: 'दैनिक ग्रह गोचर', icon: '🪐' },
  { id: 'hora', label: 'होरा', fullLabel: '२४ घंटे होरा चक्र', icon: '⏳' },
  { id: 'muhurat_quick', label: 'मुहूर्त', fullLabel: 'शुभ-अशुभ मुहूर्त', icon: '✨' },
  { id: 'khagol', label: 'खगोल', fullLabel: 'सूर्य-चन्द्र खगोल', icon: '🔭' },
];

export const PanchangView: React.FC<PanchangViewProps> = ({
  panchang,
  onNavigateTab,
  onOpenUmaModal,
  onOpenWhatsAppPanchang,
  locationName = 'उज्जैन',
  currentDate,
  latitude = 23.1765,
  longitude = 75.7885,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<PanchangSubPage>('main');
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<{
    isOpen: boolean;
    fileName: string;
    blobUrl: string;
    blob: Blob;
    pageCount: number;
    title: string;
  } | null>(null);

  const solar = panchang.solar;
  const fmt = (d: Date) => formatPlaceTime(d);

  const weekdayNum = panchang.date.getDay();
  const auspiciousWindows = getAuspiciousWindows(solar);
  const inauspiciousWindows = getInauspiciousWindows(solar, weekdayNum);
  const abhijitWindow = auspiciousWindows.find((w) => w.title === 'अभिजित मुहूर्त');
  const rahuWindow = inauspiciousWindows.find((w) => w.title === 'राहु काल');

  const dayDurationHours = (solar.sunset.getTime() - solar.sunrise.getTime()) / 3600000;
  const nightDurationHours = (solar.nextSunrise.getTime() - solar.sunset.getTime()) / 3600000;

  const specialYogas = calculateSpecialYogas(panchang);
  const { panchak, bhadra } = calculatePanchakAndBhadra(panchang);
  const { dayHoras, nightHoras, currentActiveHora } = calculateHoraTable(solar, panchang.date);
  const allHoras = [...dayHoras, ...nightHoras];

  const buildPanchangShareText = () => {
    const loc = locationName ? ` (${locationName})` : '';
    const dateStr = panchang.date.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `॥ श्री गणेशाय नमः ॥
🕉️ सनातन शक्ति पंचांग${loc}
📅 दिनांक: ${dateStr}, ${panchang.weekday}
🚩 संवत्: ${panchang.samvat}
🌕 मास/पक्ष: ${panchang.masa} मास, ${panchang.paksha} पक्ष

१. तिथि: ${panchang.tithi} (${panchang.tithiSpan ? fmt(panchang.tithiSpan.end) + ' तक' : ''})
२. नक्षत्र: ${panchang.nakshatra} (चरण ${panchang.pada})
३. योग: ${panchang.yoga}
४. करण: ${panchang.karana}
५. वार: ${panchang.weekday}

🌅 सूर्योदय: ${fmt(solar.sunrise)} | सूर्यास्त: ${fmt(solar.sunset)}
🌙 चंद्र राशि: ${panchang.lunarRashi} | सूर्य राशि: ${panchang.solarRashi}
✨ अभिजित मुहूर्त: ${abhijitWindow && weekdayNum !== 3 ? `${fmt(abhijitWindow.start)} - ${fmt(abhijitWindow.end)}` : 'आज नहीं'}
⚠️ राहुकाल: ${rahuWindow ? `${fmt(rahuWindow.start)} - ${fmt(rahuWindow.end)}` : '—'}

🌸 शक्ति वैदिक पंचांग द्वारा प्रामाणिक गणना`;
  };

  const handleShare = async () => {
    const text = buildPanchangShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `सनातन शक्ति पंचांग - ${panchang.weekday}`,
          text,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareNotice('पंचांग विवरण कॉपी किया गया!');
      setTimeout(() => setShareNotice(null), 3000);
    } catch {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPanchangShareText());
      setShareNotice('पंचांग कॉपी हो गया!');
      setTimeout(() => setShareNotice(null), 2500);
    } catch {}
  };

  const handleDownloadTodayBhojpatra = async () => {
    try {
      setIsDownloadingPdf(true);
      const res = await downloadBhojpatraPdf({
        title: `दैनिक_भोजपत्र_पंचांग_${panchang.weekday}`,
        panchang,
        query: `दैनिक पंचांग — ${panchang.weekday}, ${panchang.tithi}`,
        answer: buildPanchangShareText(),
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

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      <PdfSuccessModal
        info={pdfSuccessInfo}
        onClose={() => setPdfSuccessInfo(null)}
      />

      {/* 1. Flutter App Style Segmented Sub-Page Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F5ECE0] border border-[#DFCBB5] rounded-2xl shadow-xs">
        {SUB_PAGES.map((sub) => {
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubTab(sub.id)}
              className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 active:scale-95 m3-touch ${
                isActive
                  ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                  : 'bg-white text-[#5C3A21] border border-[#EADBCC] hover:bg-[#F9F3EA]'
              }`}
              title={sub.fullLabel}
            >
              <span>{sub.icon}</span>
              <span className="truncate">{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Share / Copy Notice Toast */}
      {shareNotice && (
        <div className="bg-emerald-800 text-white px-3 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 1: 🪔 मुख्य अंग (Flutter Material 3 Elevated Card) */}
      {/* ========================================================================= */}
      {activeSubTab === 'main' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Flutter Hero Tithi Card (Luminous Vedic Gold & Parchment) */}
          <div className="flutter-hero-gradient rounded-3xl p-4 sm:p-5 text-[#2C180C] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs font-bold text-[#7A4518]">
                <span className="tracking-wide">{panchang.paksha} पक्ष • {panchang.masa} मास</span>
                <span className="font-mono text-[11px] bg-[#F5DEBE] text-[#6E3C12] px-2.5 py-0.5 rounded-full border border-[#E8C59D] font-bold shadow-2xs">
                  {panchang.samvat}
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black font-granth text-[#3B190B] tracking-wide">
                    {panchang.tithi}
                  </h2>
                  {panchang.tithiSpan && (
                    <span className="text-xs text-[#6A3C1C] font-semibold">
                      समाप्ति: {fmt(panchang.tithiSpan.end)} तक
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#8C4A00] font-mono">
                    {(panchang.tithiProgress * 100).toFixed(0)}%
                  </span>
                  <div className="text-[10px] text-[#6E472A] font-semibold">व्यतीत</div>
                </div>
              </div>

              {/* Material 3 Progress Bar */}
              <div className="w-full bg-[#EAD4BC] h-2 rounded-full overflow-hidden mt-3 p-0.5 border border-[#DFBF9F]">
                <div
                  className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${Math.min(100, Math.max(5, panchang.tithiProgress * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Special Vedic Yogas Banner */}
          {specialYogas.length > 0 && (
            <div className="space-y-1.5">
              {specialYogas.map((y) => (
                <div
                  key={y.id}
                  className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="p-1 rounded-lg bg-amber-500/20 text-[#8C4A00]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-black text-[#3B190B]">{y.name}</div>
                      <div className="text-[10px] text-[#6E472A] truncate">{y.description}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 shrink-0 shadow-xs">
                    सक्रिय योग
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Panchak & Bhadra Quick Micro-Indicators */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div
              className={`p-2.5 rounded-2xl border flex items-center justify-between shadow-xs ${
                panchak.isActive
                  ? panchak.nature === 'auspicious'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-white border-[#EADBCC] text-[#3B2312]'
              }`}
            >
              <span className="font-bold">⚡ पञ्चक:</span>
              <span className="font-black truncate ml-1">{panchak.isActive ? panchak.typeNameHindi : 'पञ्चक मुक्त'}</span>
            </div>

            <div
              className={`p-2.5 rounded-2xl border flex items-center justify-between shadow-xs ${
                bhadra.isActive
                  ? bhadra.nature === 'varjya'
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-white border-[#EADBCC] text-[#3B2312]'
              }`}
            >
              <span className="font-bold">🛡️ भद्रा:</span>
              <span className="font-black truncate ml-1">{bhadra.isActive ? `${bhadra.vas} (${bhadra.nature === 'varjya' ? 'वर्जित' : 'शुभ'})` : 'भद्रा मुक्त'}</span>
            </div>
          </div>

          {/* 4 Vedic Angas 2x2 Grid (Elevated Cards) */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. नक्षत्र */}
            <div className="flutter-card p-3 shadow-xs hover:border-[#DFCBB5] transition bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C4A00] uppercase tracking-wide">🌟 नक्षत्र</span>
                <span className="text-[10px] font-bold text-[#8C4A00] font-mono">
                  {(panchang.nakshatraProgress * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-sm font-black text-[#2A160C] mt-1 truncate">
                {panchang.nakshatra}
              </div>
              <div className="text-[11px] text-[#5C3A21] font-semibold">
                चरण {panchang.pada}
              </div>
            </div>

            {/* 2. योग */}
            <div className="flutter-card p-3 shadow-xs hover:border-[#DFCBB5] transition bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C4A00] uppercase tracking-wide">☯️ योग</span>
                <span className="text-[10px] font-mono text-[#6E472A] font-semibold">
                  {panchang.yogaNumber}/27
                </span>
              </div>
              <div className="text-sm font-black text-[#2A160C] mt-1 truncate">
                {panchang.yoga}
              </div>
              <div className="text-[11px] text-[#5C3A21] font-semibold">
                दैनिक योग
              </div>
            </div>

            {/* 3. करण */}
            <div className="flutter-card p-3 shadow-xs hover:border-[#DFCBB5] transition bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8C4A00] uppercase tracking-wide">⚡ करण</span>
                <span className="text-[10px] font-mono text-[#6E472A] font-semibold">
                  करण {panchang.karanaNumber}
                </span>
              </div>
              <div className="text-sm font-black text-[#2A160C] mt-1 truncate">
                {panchang.karana}
              </div>
              <div className="text-[11px] text-[#5C3A21] font-semibold">
                आधा तिथि मान
              </div>
            </div>

            {/* 4. वार एवं राशि */}
            <div className="flutter-card p-3 shadow-xs hover:border-[#DFCBB5] transition bg-white">
              <div className="text-[11px] font-bold text-[#8C4A00] uppercase tracking-wide">♈ चन्द्र व सूर्य राशि</div>
              <div className="text-sm font-black text-[#2A160C] mt-1 truncate">
                चंद्र: {panchang.lunarRashi}
              </div>
              <div className="text-[11px] text-[#5C3A21] font-semibold truncate">
                सूर्य: {panchang.solarRashi}
              </div>
            </div>
          </div>

          {/* Sun & Moon Timings 4-Col Ribbon */}
          <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-white border border-[#EADBCC] shadow-xs text-center">
            <div className="p-1.5 rounded-xl bg-[#FFF6EB] border border-[#F4DFC8]">
              <div className="text-[10px] font-bold text-[#8C4A00]">सूर्योदय</div>
              <div className="text-xs font-black font-mono text-[#2A160C] mt-0.5">
                {fmt(solar.sunrise)}
              </div>
            </div>

            <div className="p-1.5 rounded-xl bg-[#FFF6EB] border border-[#F4DFC8]">
              <div className="text-[10px] font-bold text-[#8C4A00]">सूर्यास्त</div>
              <div className="text-xs font-black font-mono text-[#2A160C] mt-0.5">
                {fmt(solar.sunset)}
              </div>
            </div>

            <div className="p-1.5 rounded-xl bg-[#FFF6EB] border border-[#F4DFC8]">
              <div className="text-[10px] font-bold text-[#8C4A00]">मध्याह्न</div>
              <div className="text-xs font-black font-mono text-[#2A160C] mt-0.5">
                {fmt(solar.solarNoon)}
              </div>
            </div>

            <div className="p-1.5 rounded-xl bg-[#FFF6EB] border border-[#F4DFC8]">
              <div className="text-[10px] font-bold text-[#8C4A00]">चन्द्र राशि</div>
              <div className="text-xs font-black text-[#2A160C] mt-0.5 truncate">
                {panchang.lunarRashi}
              </div>
            </div>
          </div>

          {/* 1-Click WhatsApp Daily Panchang Card Button */}
          {onOpenWhatsAppPanchang && (
            <button
              type="button"
              onClick={() => onOpenWhatsAppPanchang()}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#25D366] via-[#20BD5A] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#1aa852] text-white font-black text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.35)] cursor-pointer active:scale-97 m3-touch"
              title="दैनिक पंचांग व सुविचार व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>📲 व्हाट्सएप सुप्रभात पंचांग कार्ड (सुविचार सहित)</span>
            </button>
          )}

          {/* Quick Action Row (4 Buttons) */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl transition flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer active:scale-95 m3-touch"
              title="व्हाट्सएप पंचांग साझा करें"
            >
              <Share2 className="w-4 h-4 text-emerald-200" />
              <span className="text-[10px]">साझा करें</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTodayBhojpatra}
              disabled={isDownloadingPdf}
              className="py-2.5 px-1 bg-[#8f2121] hover:bg-[#731919] text-[#fdf8eb] font-bold text-xs rounded-2xl transition flex flex-col items-center justify-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer active:scale-95 m3-touch"
              title="भोजपत्र PDF डाउनलोड करें"
            >
              <Download className="w-4 h-4 text-amber-200" />
              <span className="text-[10px] font-bold">{isDownloadingPdf ? 'तैयार…' : 'भोजपत्र PDF'}</span>
            </button>

            {onOpenUmaModal && (
              <button
                type="button"
                onClick={() => onOpenUmaModal()}
                className="py-2.5 px-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-stone-950 font-black text-xs rounded-2xl transition flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 m3-touch uma-glow-badge"
                title="उमा AI - सनातन दैवज्ञ परामर्श"
              >
                <Sparkles className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span className="text-[10px] font-black">उमा AI ✨</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-1 bg-white/90 dark:bg-stone-800 hover:bg-white text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-bold text-xs rounded-2xl transition flex flex-col items-center justify-center gap-1 shadow-sm cursor-pointer active:scale-95 m3-touch"
              title="पंचांग टेक्स्ट कॉपी करें"
            >
              <Copy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px]">कॉपी</span>
            </button>
          </div>

          {/* Navigation Links */}
          {onNavigateTab && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigateTab('festivals')}
                className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2 py-2.5 bg-amber-50 dark:bg-stone-800/80 border border-amber-500/30 rounded-2xl transition cursor-pointer shadow-sm active:scale-98 m3-touch"
                title="पूरे महीने के व्रत, त्यौहार और तिथियाँ मासिक पंचांग में देखें"
              >
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>🗓️ मासिक पंचांग</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('vratkatha')}
                className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2 py-2.5 bg-amber-50 dark:bg-stone-800/80 border border-amber-500/30 rounded-2xl transition cursor-pointer shadow-sm active:scale-98 m3-touch"
                title="व्रत कथा, पूजा विधि एवं आरती संग्रह"
              >
                <span>📖 व्रत कथा व आरती</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* PAGE 2: 🪐 गोचर (Navagraha Gochar) */}
      {activeSubTab === 'gochar' && (
        <div className="flutter-card p-4 space-y-3 animate-in fade-in duration-150 bg-white">
          <div className="flex items-center justify-between border-b border-[#EADBCC] pb-2">
            <h3 className="text-sm font-black text-[#3B190B] flex items-center gap-1.5">
              <span>🪐 प्रत्यक्ष नवग्रह गोचर स्थिति</span>
            </h3>
            <span className="text-[10px] text-[#8C4A00] font-bold">
              {locationName}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FFF8ED] border border-[#F0DCBE]">
              <div className="text-[10px] text-[#8C4A00] font-bold">सूर्य (Sun)</div>
              <div className="font-black text-[#2C180C] text-sm mt-0.5">{panchang.solarRashi}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFF8ED] border border-[#F0DCBE]">
              <div className="text-[10px] text-[#8C4A00] font-bold">चन्द्र (Moon)</div>
              <div className="font-black text-[#2C180C] text-sm mt-0.5">{panchang.lunarRashi}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FFF8ED] border border-[#F0DCBE]">
              <div className="text-[10px] text-[#8C4A00] font-bold">नक्षत्र</div>
              <div className="font-black text-[#2C180C] text-sm mt-0.5">{panchang.nakshatra} ({panchang.pada})</div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 3: ⏳ होरा (Hora Table) */}
      {activeSubTab === 'hora' && (
        <div className="flutter-card p-4 space-y-3 animate-in fade-in duration-150 bg-white">
          <div className="flex items-center justify-between border-b border-[#EADBCC] pb-2">
            <h3 className="text-sm font-black text-[#3B190B] flex items-center gap-1.5">
              <span>⏳ दैनिक २४ घंटे होरा चक्र</span>
            </h3>
            {currentActiveHora && (
              <span className="text-[11px] font-black text-[#8C4A00] bg-[#FBF0DD] border border-[#E8C59D] px-2 py-0.5 rounded-full">
                वर्तमान: {currentActiveHora.planet}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-96 overflow-y-auto pr-1">
            {allHoras.map((h, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  h.isActive
                    ? 'bg-[#FFF3DC] border-[#E8B878] font-black text-[#2C180C] shadow-xs'
                    : 'bg-white border-[#EADBCC] text-[#3B2312]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#8C4A00] font-bold">#{i + 1}</span>
                  <span className="font-bold">{h.symbol} {h.planet} होरा</span>
                </div>
                <span className="font-mono text-[11px] text-[#5C3A21] font-semibold">
                  {fmt(h.start)} - {fmt(h.end)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE 4: ✨ त्वरित मुहूर्त (Quick Muhurat) */}
      {activeSubTab === 'muhurat_quick' && (
        <div className="flutter-card p-4 space-y-3 animate-in fade-in duration-150 bg-white">
          <h3 className="text-sm font-black text-[#3B190B] border-b border-[#EADBCC] pb-2">
            ✨ दैनिक मुख्य शुभ व अशुभ काल
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
              <div>
                <div className="font-black text-emerald-950">अभिजित मुहूर्त (सर्वश्रेष्ठ)</div>
                <div className="text-[11px] text-emerald-800 font-medium">विजय व सर्वकार्य सिद्धि</div>
              </div>
              <span className="font-mono font-black text-emerald-950 text-xs">
                {abhijitWindow && weekdayNum !== 3 ? `${fmt(abhijitWindow.start)} - ${fmt(abhijitWindow.end)}` : 'आज नहीं'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-between">
              <div>
                <div className="font-black text-rose-950">राहुकाल (त्याज्य काल)</div>
                <div className="text-[11px] text-rose-800 font-medium">शुभ कार्य वर्जित</div>
              </div>
              <span className="font-mono font-black text-rose-950 text-xs">
                {rahuWindow ? `${fmt(rahuWindow.start)} - ${fmt(rahuWindow.end)}` : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 5: 🔭 खगोल (Solar & Astronomical) */}
      {activeSubTab === 'khagol' && (
        <div className="flutter-card p-4 space-y-3 animate-in fade-in duration-150">
          <h3 className="text-sm font-black text-[#462B17] dark:text-amber-200 border-b border-amber-500/20 pb-2">
            🔭 सूर्य व चन्द्र खगोलीय स्थिति
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-500/20">
              <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">दिनमान (Day Duration)</div>
              <div className="font-black text-[#462B17] dark:text-amber-100">{dayDurationHours.toFixed(2)} घंटे</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-500/20">
              <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">रात्रिमान (Night Duration)</div>
              <div className="font-black text-[#462B17] dark:text-amber-100">{nightDurationHours.toFixed(2)} घंटे</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-500/20">
              <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">अक्षांश (Latitude)</div>
              <div className="font-mono font-black text-[#462B17] dark:text-amber-100">{latitude.toFixed(4)}° N</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-500/20">
              <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">देशांतर (Longitude)</div>
              <div className="font-mono font-black text-[#462B17] dark:text-amber-100">{longitude.toFixed(4)}° E</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
