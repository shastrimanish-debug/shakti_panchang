import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Share2,
  FileText,
  FolderCheck,
  Eye,
  X,
  Smartphone,
  Laptop,
  BookOpen,
  Send,
} from 'lucide-react';

export interface PdfSuccessInfo {
  isOpen: boolean;
  fileName: string;
  blobUrl: string;
  blob?: Blob;
  pageCount: number;
  title: string;
}

interface PdfSuccessModalProps {
  info: PdfSuccessInfo | null;
  onClose: () => void;
}

export const PdfSuccessModal: React.FC<PdfSuccessModalProps> = ({ info, onClose }) => {
  const [viewMode, setViewMode] = useState<'info' | 'reader'>('info');
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  if (!info || !info.isOpen) return null;

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

  // 1. Native Mobile Share / Save to Files
  const handleSaveToMobileDevice = async () => {
    if (!info.blob) {
      handleDownloadDirect();
      return;
    }

    try {
      const file = new File([info.blob], info.fileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: info.title,
          text: `श्री शक्ति पंचांग • ${info.title}`,
        });
        setDownloadSuccessMsg('सफलतापूर्वक सहेजा / शेयर किया गया!');
        setTimeout(() => setDownloadSuccessMsg(null), 5000);
        return;
      } else if (navigator.share) {
        await navigator.share({
          title: info.title,
          text: `श्री शक्ति पंचांग • ${info.title}`,
          url: info.blobUrl,
        });
        return;
      }
    } catch {
      // User cancelled share or aborted
    }

    // Fallback if native share fails or cancelled
    handleDownloadDirect();
  };

  // 2. Direct Browser Download
  const handleDownloadDirect = () => {
    try {
      const blobUrl = info.blobUrl || (info.blob ? URL.createObjectURL(info.blob) : '');
      if (!blobUrl) return;

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = info.fileName;
      a.target = '_self';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 600);

      setDownloadSuccessMsg('डाउनलोड शुरू हो गया है! आपके "Downloads" फ़ोल्डर में सहेजी जा रही है।');
      setTimeout(() => setDownloadSuccessMsg(null), 5000);
    } catch {
      // If direct download fails on mobile, open in tab
      handleOpenInTab();
    }
  };

  // 3. Direct Open In Native Browser Tab / PDF Viewer
  const handleOpenInTab = () => {
    if (info.blobUrl) {
      const win = window.open(info.blobUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        setViewMode('reader');
      }
    }
  };

  const fileSizeMb = info.blob ? (info.blob.size / (1024 * 1024)).toFixed(1) : '8.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl shadow-2xl overflow-hidden text-[#5C3A21] flex flex-col transition-all duration-300 ${
          viewMode === 'reader' ? 'max-w-4xl w-full h-[90vh]' : 'max-w-xl w-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5C3A21] to-[#3B1F0E] text-[#FAF2E4] p-3.5 sm:p-4 flex items-center justify-between border-b border-[#8C6239] shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold font-granth text-sm sm:text-base text-[#FAF2E4]">
                ॥ PDF महा-पत्रिका सफलतापूर्वक तैयार है ॥
              </h3>
              <p className="text-[11px] text-[#D9C4A9]">
                {info.title} • {info.pageCount} पृष्ठ • {fileSizeMb} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex bg-[#2C180C] p-0.5 rounded-lg border border-[#8C6239]/60 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('info')}
                className={`px-2 py-1 rounded font-bold transition cursor-pointer ${
                  viewMode === 'info' ? 'bg-[#8C6239] text-white shadow-xs' : 'text-[#D9C4A9] hover:text-white'
                }`}
              >
                डाउनलोड विवरण
              </button>
              <button
                type="button"
                onClick={() => setViewMode('reader')}
                className={`px-2 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'reader' ? 'bg-[#8C6239] text-white shadow-xs' : 'text-[#D9C4A9] hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>ऐप में पढ़ें</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#462B17] text-[#D9C4A9] hover:text-white transition cursor-pointer"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {viewMode === 'reader' ? (
          /* Interactive In-App PDF Reader */
          <div className="flex-1 flex flex-col min-h-0 bg-[#341F10] p-2">
            <div className="flex items-center justify-between p-2 bg-[#FAF2E4] rounded-t-lg border-b border-[#8C6239] text-xs font-bold text-[#5C3A21]">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#B56A00]" />
                अन्तर्निहित ग्रन्थ पत्रिका पाठक (In-App PDF Granth Reader)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToMobileDevice}
                  className="px-2.5 py-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <Share2 className="w-3 h-3" />
                  <span>फ़ोन में सहेजें / शेयर</span>
                </button>
                <a
                  href={info.blobUrl}
                  download={info.fileName}
                  className="px-2.5 py-1 bg-[#8B1E1E] hover:bg-[#721818] text-white rounded font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <Download className="w-3 h-3" />
                  <span>डाउनलोड</span>
                </a>
              </div>
            </div>

            <div className="flex-1 w-full bg-[#1C0E07] relative rounded-b-lg overflow-hidden">
              <iframe
                src={`${info.blobUrl}#toolbar=1&navpanes=1`}
                title="Kundali Mahapatrika PDF"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        ) : (
          /* Download & Location Guide Mode */
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[80vh]">
            {downloadSuccessMsg && (
              <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-950 rounded-xl text-xs font-bold animate-in fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{downloadSuccessMsg}</span>
              </div>
            )}

            {/* Main File Announcement Card */}
            <div className="bg-emerald-50 border border-emerald-300/80 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-emerald-950 text-sm sm:text-base leading-snug">
                  {info.title}
                </h4>
                <p className="text-xs text-emerald-800 break-all font-mono font-bold mt-0.5">
                  {info.fileName}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-emerald-700 font-bold">
                  <span>पृष्ठ संख्या: {info.pageCount} पृष्ठ</span>
                  <span>•</span>
                  <span>आकार: ~{fileSizeMb} MB</span>
                  <span>•</span>
                  <span>फॉर्मेट: वैदिक भोजपत्र A4</span>
                </div>
              </div>
            </div>

            {/* Mobile-Optimized Direct Action Buttons */}
            <div className="space-y-2.5">
              {/* Primary Mobile Button: Save to Device / Native Share */}
              <button
                type="button"
                onClick={handleSaveToMobileDevice}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#1E7E34] via-[#28A745] to-[#1E7E34] hover:brightness-110 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition transform active:scale-98 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>📲 फ़ोन में सेव करें (Save to Files / WhatsApp)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Direct Physical Download Link (Works with single tap on mobile) */}
                <a
                  href={info.blobUrl}
                  download={info.fileName}
                  target="_self"
                  onClick={() => {
                    setDownloadSuccessMsg('डाउनलोड आरंभ हो गया है!');
                    setTimeout(() => setDownloadSuccessMsg(null), 5000);
                  }}
                  className="py-2.5 px-3 bg-gradient-to-r from-[#8B1E1E] to-[#B56A00] hover:brightness-110 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition transform active:scale-98 text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>📥 सीधा डाउनलोड</span>
                </a>

                {/* Open In New Browser Tab (Native PDF viewer with download/print) */}
                <button
                  type="button"
                  onClick={handleOpenInTab}
                  className="py-2.5 px-3 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition transform active:scale-98 cursor-pointer text-center"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>🌐 नए टैब में खोलें</span>
                </button>

                {/* In-App Reader */}
                <button
                  type="button"
                  onClick={() => setViewMode('reader')}
                  className="py-2.5 px-3 bg-[#462B17] hover:bg-[#382010] text-[#FFD88A] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition transform active:scale-98 cursor-pointer text-center"
                >
                  <Eye className="w-4 h-4" />
                  <span>📖 यहीं ऐप में पढ़ें</span>
                </button>
              </div>
            </div>

            {/* Mobile Helpful Hint */}
            <div className="p-3 bg-amber-50 border border-amber-300/80 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Smartphone className="w-4 h-4 text-[#B56A00]" />
                <span>फ़ोन में PDF सेव करने के लिए:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#735133]">
                ऊपर दिए गए हरे बटन <strong>&quot;फ़ोन में सेव करें&quot;</strong> पर क्लिक करें। Android व iPhone आपको सीधे <strong>&quot;Save to Files&quot;</strong>, <strong>&quot;Drive&quot;</strong> या <strong>&quot;WhatsApp&quot;</strong> में भेजने का विकल्प देंगे।
              </p>
            </div>

            {/* Secondary footer options */}
            <div className="pt-2 border-t border-[#8C6239]/30 flex items-center justify-between">
              <button
                type="button"
                onClick={handleOpenInTab}
                className="text-xs font-bold text-[#8C6239] hover:text-[#5C3A21] flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ब्राउज़र के नए टैब में खोलें</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-[#E5D2B8] hover:bg-[#D9C4A9] text-[#5C3A21] rounded-lg text-xs font-bold transition cursor-pointer"
              >
                सम्पन्न (बंद करें)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
