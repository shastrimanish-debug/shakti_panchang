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
  CalendarDays,
  Star,
  Info,
  Download,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { getAuspiciousWindows, getInauspiciousWindows } from '../services/choghadiya';
import { DISHASHOOL_MAP, DISHASHOOL_REMEDIES } from '../services/disha';
import { downloadBhojpatraPdf } from '../services/bhojpatraPdf';
import { PdfSuccessModal, PdfSuccessInfo } from './PdfSuccessModal';

interface PanchangViewProps {
  panchang: VedicPanchangData;
  onNavigateTab: (tab: string) => void;
  onOpenUmaModal?: () => void;
  locationName?: string;
}

type PanchangSubPage = 'anga' | 'muhurat' | 'disha';

export const PanchangView: React.FC<PanchangViewProps> = ({
  panchang,
  onNavigateTab,
  onOpenUmaModal,
  locationName,
}) => {
  const [subPage, setSubPage] = useState<PanchangSubPage>('anga');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<PdfSuccessInfo | null>(null);

  const solar = panchang.solar;
  const weekday = panchang.date.getDay();
  const auspicious = getAuspiciousWindows(solar);
  const inauspicious = getInauspiciousWindows(solar, weekday);

  const abhijit = auspicious.find((w) => w.title === 'अभिजित मुहूर्त');
  const brahma = auspicious.find((w) => w.title === 'ब्रह्म मुहूर्त');
  const amrit = auspicious.find((w) => w.title.includes('अमृत') || w.title.includes('शुभ'));
  const rahu = inauspicious.find((w) => w.title === 'राहु काल');
  const yamaghanta = inauspicious.find((w) => w.title.includes('यमघण्ट'));
  const gulika = inauspicious.find((w) => w.title.includes('गुलिक'));

  const dishaShool = DISHASHOOL_MAP[weekday] || 'अज्ञात';
  const dishaRemedy = DISHASHOOL_REMEDIES[weekday] || '';

  const fmt = (d: Date) =>
    d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

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

  const pages: { id: PanchangSubPage; title: string; shortTitle: string; icon: any }[] = [
    { id: 'anga', title: 'पृष्ठ १: मुख्य पंचांग व अंग', shortTitle: '१. मुख्य पंचांग', icon: BookOpen },
    { id: 'muhurat', title: 'पृष्ठ २: सौर काल व मुहूर्त', shortTitle: '२. शुभ मुहूर्त', icon: Clock },
    { id: 'disha', title: 'पृष्ठ ३: दिशा शूल व काल', shortTitle: '३. दिशा शूल', icon: Compass },
  ];

  const currentSubPageIndex = pages.findIndex((p) => p.id === subPage);

  const goToNextSubPage = () => {
    const nextIdx = (currentSubPageIndex + 1) % pages.length;
    setSubPage(pages[nextIdx].id);
  };

  const goToPrevSubPage = () => {
    const prevIdx = (currentSubPageIndex - 1 + pages.length) % pages.length;
    setSubPage(pages[prevIdx].id);
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      {/* PDF Download and Storage Location Notification Modal */}
      <PdfSuccessModal
        info={pdfSuccessInfo}
        onClose={() => setPdfSuccessInfo(null)}
      />

      {/* Screen-Fit Sub-Page Segmented Bar (Mobile Viewport Optimized) */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl shadow-xs">
        {pages.map((p, idx) => {
          const Icon = p.icon;
          const isActive = subPage === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSubPage(p.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
                  : 'text-[#8C6239] hover:bg-[#F4E8D1]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFD88A]' : 'text-[#8C6239]'}`} />
              <span className="hidden sm:inline">{p.title}</span>
              <span className="sm:hidden">{p.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-PAGE 1: MAIN PANCHANG & 5 ANGAS */}
      {subPage === 'anga' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Top Heritage Card */}
          <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-3.5 sm:p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider bg-[#5C3A21] text-[#FAF2E4] px-2.5 py-0.5 rounded">
                    {panchang.weekday}
                  </span>
                  <span className="text-xs font-semibold text-[#8C6239]">
                    {panchang.paksha}
                  </span>
                  <span className="text-xs bg-[#B56A00]/15 text-[#B56A00] font-bold px-2 py-0.5 rounded border border-[#B56A00]/30">
                    {panchang.masa}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-granth text-[#5C3A21] mt-1">
                  {panchang.tithi}
                </h2>
                <p className="text-[11px] sm:text-xs text-[#735133] mt-0.5">
                  {panchang.samvat} • {panchang.sakaSamvat}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-[#F4E8D1] p-2 rounded-lg border border-[#8C6239]/30">
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <div>
                    <div className="text-[9px] text-[#8C6239] font-bold">सूर्य राशि</div>
                    <div className="font-bold text-[#5C3A21] text-xs">{panchang.solarRashi}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-[#F4E8D1] p-2 rounded-lg border border-[#8C6239]/30">
                  <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[9px] text-[#8C6239] font-bold">चंद्र राशि</div>
                    <div className="font-bold text-[#5C3A21] text-xs">{panchang.lunarRashi}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tithi & Nakshatra Visual Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
              <div className="bg-[#F4E8D1] p-2.5 rounded-lg border border-[#8C6239]/20">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#5C3A21] mb-1">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 text-[#B56A00]" />
                    तिथि: {panchang.tithi}
                  </span>
                  <span>{(panchang.tithiProgress * 100).toFixed(0)}% व्यतीत</span>
                </div>
                <div className="w-full bg-[#E5D2B8] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#B56A00] to-[#E69A33] h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, panchang.tithiProgress * 100))}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#F4E8D1] p-2.5 rounded-lg border border-[#8C6239]/20">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#5C3A21] mb-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#B56A00]" />
                    नक्षत्र: {panchang.nakshatra} ({panchang.pada})
                  </span>
                  <span>{(panchang.nakshatraProgress * 100).toFixed(0)}% व्यतीत</span>
                </div>
                <div className="w-full bg-[#E5D2B8] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#5C3A21] to-[#8C6239] h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, panchang.nakshatraProgress * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Panchang 4 Angas Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] font-bold text-[#8C6239]">१. तिथि</div>
              <div className="text-base font-black text-[#5C3A21] truncate">{panchang.tithi}</div>
              <div className="text-[10px] text-[#735133]">{panchang.paksha}</div>
            </div>

            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] font-bold text-[#8C6239]">२. नक्षत्र</div>
              <div className="text-base font-black text-[#5C3A21] truncate">{panchang.nakshatra}</div>
              <div className="text-[10px] text-[#735133]">चरण {panchang.pada}</div>
            </div>

            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] font-bold text-[#8C6239]">३. योग</div>
              <div className="text-base font-black text-[#5C3A21] truncate">{panchang.yoga}</div>
              <div className="text-[10px] text-[#735133]">योग {panchang.yogaNumber}/27</div>
            </div>

            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/30 text-center">
              <div className="text-[10px] font-bold text-[#8C6239]">४. करण</div>
              <div className="text-base font-black text-[#5C3A21] truncate">{panchang.karana}</div>
              <div className="text-[10px] text-[#735133]">संख्या {panchang.karanaNumber}</div>
            </div>
          </div>

          {/* Compact Quick Action Row (PDF & UMA) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTodayBhojpatra}
              disabled={isDownloadingPdf}
              className="flex-1 py-2 px-3 bg-[#8f2121] hover:bg-[#731919] text-[#fdf8eb] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'PDF तैयार हो रही है...' : 'भोजपत्र PDF डाउनलोड'}</span>
            </button>

            {onOpenUmaModal && (
              <button
                type="button"
                onClick={onOpenUmaModal}
                className="py-2 px-3.5 bg-[#c27803] hover:bg-[#a66602] text-[#2a1303] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>उमा संवाद</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUB-PAGE 2: SOLAR TIMES & AUSPICIOUS / INAUSPICIOUS MUHURAT */}
      {subPage === 'muhurat' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Solar & Day Times */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3.5 shadow-xs">
            <div className="text-xs font-bold text-[#5C3A21] mb-2.5 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>स्थानीय सौर समय चक्र (Local Sun Ephemeris)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-[#F4E8D1] p-2 rounded-lg border border-[#8C6239]/20">
                <Sunrise className="w-4 h-4 text-amber-700 mx-auto mb-0.5" />
                <div className="text-[10px] text-[#8C6239] font-bold">सूर्योदय</div>
                <div className="text-xs font-black text-[#5C3A21]">{fmt(solar.sunrise)}</div>
              </div>

              <div className="bg-[#F4E8D1] p-2 rounded-lg border border-[#8C6239]/20">
                <Sunset className="w-4 h-4 text-rose-700 mx-auto mb-0.5" />
                <div className="text-[10px] text-[#8C6239] font-bold">सूर्यास्त</div>
                <div className="text-xs font-black text-[#5C3A21]">{fmt(solar.sunset)}</div>
              </div>

              <div className="bg-[#F4E8D1] p-2 rounded-lg border border-[#8C6239]/20">
                <Sun className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
                <div className="text-[10px] text-[#8C6239] font-bold">मध्याह्न</div>
                <div className="text-xs font-black text-[#5C3A21]">{fmt(solar.solarNoon)}</div>
              </div>

              <div className="bg-[#F4E8D1] p-2 rounded-lg border border-[#8C6239]/20">
                <Sunrise className="w-4 h-4 text-amber-600 mx-auto mb-0.5" />
                <div className="text-[10px] text-[#8C6239] font-bold">अगला सूर्योदय</div>
                <div className="text-xs font-black text-[#5C3A21]">{fmt(solar.nextSunrise)}</div>
              </div>
            </div>
          </div>

          {/* Key Auspicious & Inauspicious Periods */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5 px-0.5">
              <Award className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>आज के प्रमुख शुभाशुभ काल व मुहूर्त</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {abhijit && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-start gap-2.5">
                  <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-emerald-900">अभिजित मुहूर्त (शुभ)</div>
                    <div className="text-xs font-black text-emerald-800">
                      {fmt(abhijit.start)} - {fmt(abhijit.end)}
                    </div>
                    <div className="text-[10px] text-emerald-700">सर्वकार्य सिद्धिदायक काल</div>
                  </div>
                </div>
              )}

              {brahma && (
                <div className="bg-blue-50 border border-blue-300 rounded-xl p-2.5 flex items-start gap-2.5">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-800 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-blue-900">ब्रह्म मुहूर्त (साधना)</div>
                    <div className="text-xs font-black text-blue-800">
                      {fmt(brahma.start)} - {fmt(brahma.end)}
                    </div>
                    <div className="text-[10px] text-blue-700">ध्यान व अध्ययन हेतु सर्वोत्तम</div>
                  </div>
                </div>
              )}

              {rahu && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-2.5 flex items-start gap-2.5">
                  <div className="p-1.5 bg-rose-100 rounded-lg text-rose-800 shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-rose-900">राहु काल (वर्जित/त्याज्य)</div>
                    <div className="text-xs font-black text-rose-800">
                      {fmt(rahu.start)} - {fmt(rahu.end)}
                    </div>
                    <div className="text-[10px] text-rose-700">नवीन कार्य व यात्रा न करें</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 3: DISHA SHOOL, AYANAMSHA & GUIDANCE */}
      {subPage === 'disha' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Disha Shool Card */}
          <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#B56A00]" />
                <h3 className="font-bold text-xs sm:text-sm text-[#5C3A21]">
                  आज का दिशा शूल: <span className="text-rose-700 font-black">{dishaShool} दिशा</span>
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded">
                यात्रा वर्जित दिशा
              </span>
            </div>

            <div className="bg-[#F4E8D1] p-3 rounded-lg border border-[#8C6239]/20 text-xs text-[#5C3A21] leading-relaxed">
              <div className="font-bold text-[#8C6239] text-[11px] mb-1">वैदिक परिहार एवं उपाय:</div>
              <p>{dishaRemedy || 'यात्रा से पूर्व इष्टदेव का स्मरण कर तथा मीठा खाकर प्रस्थान करें।'}</p>
            </div>
          </div>

          {/* Ayanamsha & Celestial Information */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#5C3A21]">
              <Info className="w-4 h-4 text-[#B56A00] shrink-0" />
              <span>अयनांश: <strong>{panchang.ayanamshaName}</strong> ({panchang.ayanamsha.toFixed(4)}°)</span>
            </div>
            <div className="text-[11px] text-[#8C6239]">
              खगोलीय गणना: चित्रपक्षीय / लाहिरी
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigateTab('choghadiya')}
              className="py-2 px-3 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition text-center shadow-xs cursor-pointer"
            >
              चौघड़िया देखें →
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('muhurat')}
              className="py-2 px-3 bg-[#B56A00] hover:bg-[#A25E00] text-white text-xs font-bold rounded-lg transition text-center shadow-xs cursor-pointer"
            >
              शुभ मुहूर्त सलाह →
            </button>
          </div>
        </div>
      )}

      {/* Screen-Fit Sub-Page Bottom Navigation Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#8C6239]/25 text-xs">
        <button
          type="button"
          onClick={goToPrevSubPage}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF2E4] hover:bg-[#F4E8D1] text-[#5C3A21] border border-[#8C6239]/30 rounded-lg font-bold transition cursor-pointer active:scale-95 shadow-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#B56A00]" />
          <span>पिछला पृष्ठ</span>
        </button>

        <span className="font-granth text-xs font-bold text-[#8C6239]">
          {pages[currentSubPageIndex].shortTitle} (पृष्ठ {currentSubPageIndex + 1} / {pages.length})
        </span>

        <button
          type="button"
          onClick={goToNextSubPage}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF2E4] hover:bg-[#F4E8D1] text-[#5C3A21] border border-[#8C6239]/30 rounded-lg font-bold transition cursor-pointer active:scale-95 shadow-xs"
        >
          <span>अगला पृष्ठ</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#B56A00]" />
        </button>
      </div>
    </div>
  );
};

