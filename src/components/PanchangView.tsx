import React, { useState } from 'react';
import { VedicPanchangData } from '../types';
import { Sunrise, Sunset, Sun, Moon, Sparkles, Compass, ShieldAlert, Award, CalendarDays, Star, Info, Download, BookOpen } from 'lucide-react';
import { getAuspiciousWindows, getInauspiciousWindows } from '../services/choghadiya';
import { downloadBhojpatraPdf } from '../services/bhojpatraPdf';
import { PdfSuccessModal, PdfSuccessInfo } from './PdfSuccessModal';

interface PanchangViewProps {
  panchang: VedicPanchangData;
  onNavigateTab: (tab: string) => void;
  onOpenUmaModal?: () => void;
  locationName?: string;
}

export const PanchangView: React.FC<PanchangViewProps> = ({ panchang, onNavigateTab, onOpenUmaModal, locationName }) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<PdfSuccessInfo | null>(null);
  const solar = panchang.solar;
  const auspicious = getAuspiciousWindows(solar);
  const inauspicious = getInauspiciousWindows(solar, panchang.date.getDay());

  const abhijit = auspicious.find((w) => w.title === 'अभिजित मुहूर्त');
  const brahma = auspicious.find((w) => w.title === 'ब्रह्म मुहूर्त');
  const rahu = inauspicious.find((w) => w.title === 'राहु काल');

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* PDF Download and Storage Location Notification Modal */}
      <PdfSuccessModal
        info={pdfSuccessInfo}
        onClose={() => setPdfSuccessInfo(null)}
      />
      {/* Sacred Bhojpatra Granth & UMA AI Feature Banner */}
      <div className="bhojpatra-leaf granth-border rounded-xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#8f2121] border-2 border-[#c27803] flex items-center justify-center text-[#fdf8eb] text-xl font-bold shrink-0 shadow-inner">
            ॐ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-granth text-[#522507]">
                ॥ उमा दिव्य मार्गदर्शन व भोजपत्र पत्रिका ॥
              </h2>
              <span className="text-[10px] bg-[#8f2121] text-[#fdf8eb] px-2 py-0.5 rounded font-serif font-semibold">
                शास्त्र सम्मत
              </span>
            </div>
            <p className="text-xs sm:text-sm font-serif text-[#7a4212] mt-0.5">
              प्राचीन भोजपत्र पाण्डुलिपि शैली में आज के पंचांग का सम्पूर्ण विश्लेषण एवं एआई ज्योतिषाचार्य परामर्श
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleDownloadTodayBhojpatra}
            disabled={isDownloadingPdf}
            className="px-3.5 py-2 bg-[#8f2121] hover:bg-[#731919] text-[#fdf8eb] font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="आज के पंचांग की भोजपत्र पत्रिका पीडीएफ डाउनलोड करें"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingPdf ? 'पीडीएफ तैयार हो रही है...' : 'भोजपत्र PDF डाउनलोड'}</span>
          </button>

          {onOpenUmaModal && (
            <button
              onClick={onOpenUmaModal}
              className="px-3.5 py-2 bg-[#c27803] hover:bg-[#a66602] text-[#2a1303] font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm"
              title="उमा से वैदिक परामर्श प्राप्त करें"
            >
              <Sparkles className="w-4 h-4" />
              <span>उमा ग्रन्थ संवाद</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Heritage Card */}
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239]/40 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#8C6239]/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-[#5C3A21] text-[#FAF2E4] px-2.5 py-1 rounded">
                {panchang.weekday}
              </span>
              <span className="text-sm font-semibold text-[#8C6239]">
                {panchang.paksha}
              </span>
              <span className="text-xs bg-[#B56A00]/15 text-[#B56A00] font-bold px-2 py-0.5 rounded border border-[#B56A00]/30">
                {panchang.masa}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-granth text-[#5C3A21] mt-1.5">
              {panchang.tithi}
            </h2>
            <p className="text-xs sm:text-sm text-[#735133] mt-0.5">
              {panchang.samvat} • {panchang.sakaSamvat}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 bg-[#F4E8D1] p-2.5 rounded-lg border border-[#8C6239]/30">
              <Sun className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-[10px] text-[#8C6239] font-bold">सूर्य राशि</div>
                <div className="font-bold text-[#5C3A21]">{panchang.solarRashi} ({panchang.sunLongitude.toFixed(1)}°)</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#F4E8D1] p-2.5 rounded-lg border border-[#8C6239]/30">
              <Moon className="w-4 h-4 text-indigo-600" />
              <div>
                <div className="text-[10px] text-[#8C6239] font-bold">चंद्र राशि</div>
                <div className="font-bold text-[#5C3A21]">{panchang.lunarRashi} ({panchang.moonLongitude.toFixed(1)}°)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tithi & Nakshatra Visual Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Tithi Progress */}
          <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
            <div className="flex justify-between items-center text-xs font-bold text-[#5C3A21] mb-1.5">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#B56A00]" />
                तिथि: {panchang.tithi} ({panchang.paksha})
              </span>
              <span>{(panchang.tithiProgress * 100).toFixed(0)}% व्यतीत</span>
            </div>
            <div className="w-full bg-[#E5D2B8] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#B56A00] to-[#E69A33] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(5, panchang.tithiProgress * 100))}%` }}
              />
            </div>
          </div>

          {/* Nakshatra Progress */}
          <div className="bg-[#F4E8D1] p-3.5 rounded-lg border border-[#8C6239]/20">
            <div className="flex justify-between items-center text-xs font-bold text-[#5C3A21] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#B56A00]" />
                नक्षत्र: {panchang.nakshatra} (चरण {panchang.pada})
              </span>
              <span>{(panchang.nakshatraProgress * 100).toFixed(0)}% व्यतीत</span>
            </div>
            <div className="w-full bg-[#E5D2B8] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#5C3A21] to-[#8C6239] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(5, panchang.nakshatraProgress * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Panchang Angas Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FAF2E4] p-4 rounded-xl border border-[#8C6239]/30 shadow-xs">
          <div className="text-xs font-bold text-[#8C6239] mb-1">तिथि</div>
          <div className="text-lg font-black text-[#5C3A21]">{panchang.tithi}</div>
          <div className="text-[11px] text-[#735133] mt-1">{panchang.paksha} • संख्या {panchang.tithiNumber}</div>
        </div>

        <div className="bg-[#FAF2E4] p-4 rounded-xl border border-[#8C6239]/30 shadow-xs">
          <div className="text-xs font-bold text-[#8C6239] mb-1">नक्षत्र</div>
          <div className="text-lg font-black text-[#5C3A21]">{panchang.nakshatra}</div>
          <div className="text-[11px] text-[#735133] mt-1">चरण {panchang.pada} • सं. {panchang.nakshatraNumber}/27</div>
        </div>

        <div className="bg-[#FAF2E4] p-4 rounded-xl border border-[#8C6239]/30 shadow-xs">
          <div className="text-xs font-bold text-[#8C6239] mb-1">योग</div>
          <div className="text-lg font-black text-[#5C3A21]">{panchang.yoga}</div>
          <div className="text-[11px] text-[#735133] mt-1">योग संख्या {panchang.yogaNumber}/27</div>
        </div>

        <div className="bg-[#FAF2E4] p-4 rounded-xl border border-[#8C6239]/30 shadow-xs">
          <div className="text-xs font-bold text-[#8C6239] mb-1">करण</div>
          <div className="text-lg font-black text-[#5C3A21]">{panchang.karana}</div>
          <div className="text-[11px] text-[#735133] mt-1">करण संख्या {panchang.karanaNumber}/60</div>
        </div>
      </div>

      {/* Solar & Day Times */}
      <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#5C3A21] mb-3 flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-amber-600" />
          स्थानीय सौर समय चक्र (Local Solar Ephemeris)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#F4E8D1] p-3 rounded-lg border border-[#8C6239]/20">
            <Sunrise className="w-5 h-5 text-amber-700 mx-auto mb-1" />
            <div className="text-[11px] text-[#8C6239] font-bold">सूर्योदय</div>
            <div className="text-sm font-black text-[#5C3A21]">{fmt(solar.sunrise)}</div>
          </div>

          <div className="bg-[#F4E8D1] p-3 rounded-lg border border-[#8C6239]/20">
            <Sunset className="w-5 h-5 text-rose-700 mx-auto mb-1" />
            <div className="text-[11px] text-[#8C6239] font-bold">सूर्यास्त</div>
            <div className="text-sm font-black text-[#5C3A21]">{fmt(solar.sunset)}</div>
          </div>

          <div className="bg-[#F4E8D1] p-3 rounded-lg border border-[#8C6239]/20">
            <Sun className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-[11px] text-[#8C6239] font-bold">मध्याह्न (Noon)</div>
            <div className="text-sm font-black text-[#5C3A21]">{fmt(solar.solarNoon)}</div>
          </div>

          <div className="bg-[#F4E8D1] p-3 rounded-lg border border-[#8C6239]/20">
            <Sunrise className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-[11px] text-[#8C6239] font-bold">अगला सूर्योदय</div>
            <div className="text-sm font-black text-[#5C3A21]">{fmt(solar.nextSunrise)}</div>
          </div>
        </div>
      </div>

      {/* Key Auspicious & Inauspicious Periods Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {abhijit && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900">अभिजित मुहूर्त</div>
              <div className="text-sm font-black text-emerald-800">
                {fmt(abhijit.start)} - {fmt(abhijit.end)}
              </div>
              <div className="text-[11px] text-emerald-700">सर्वकार्य सिद्धिदायक काल</div>
            </div>
          </div>
        )}

        {brahma && (
          <div className="bg-blue-50 border border-blue-300 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-900">ब्रह्म मुहूर्त</div>
              <div className="text-sm font-black text-blue-800">
                {fmt(brahma.start)} - {fmt(brahma.end)}
              </div>
              <div className="text-[11px] text-blue-700">ध्यान व अध्ययन हेतु सर्वोत्तम</div>
            </div>
          </div>
        )}

        {rahu && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900">राहु काल (वर्जित)</div>
              <div className="text-sm font-black text-rose-800">
                {fmt(rahu.start)} - {fmt(rahu.end)}
              </div>
              <div className="text-[11px] text-rose-700">नवीन कार्य व यात्रा न करें</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Action Banners */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-[#5C3A21]">
          <Info className="w-4 h-4 text-[#B56A00]" />
          <span>अयनांश: {panchang.ayanamshaName} ({panchang.ayanamsha.toFixed(4)}°)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('choghadiya')}
            className="px-3 py-1.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold rounded-lg transition"
          >
            चौघड़िया देखें →
          </button>
          <button
            onClick={() => onNavigateTab('muhurat')}
            className="px-3 py-1.5 bg-[#B56A00] hover:bg-[#A25E00] text-white text-xs font-bold rounded-lg transition"
          >
            शुभ समय सलाह →
          </button>
        </div>
      </div>
    </div>
  );
};
