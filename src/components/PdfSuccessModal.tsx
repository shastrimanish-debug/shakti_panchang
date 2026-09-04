import React from 'react';
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
  if (!info || !info.isOpen) return null;

  const handleOpenPdf = () => {
    if (info.blobUrl) {
      window.open(info.blobUrl, '_blank');
    }
  };

  const handleDownloadAgain = () => {
    if (!info.blobUrl) return;
    const a = document.createElement('a');
    a.href = info.blobUrl;
    a.download = info.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!info.blob) return;
    try {
      const file = new File([info.blob], info.fileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: info.title,
          text: `शक्ति पंचांग द्वारा निर्मित ${info.title} (${info.fileName})`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: info.title,
          text: `शक्ति पंचांग द्वारा निर्मित ${info.title}`,
          url: info.blobUrl,
        });
      } else {
        handleDownloadAgain();
      }
    } catch {
      // User cancelled share
    }
  };

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    !!navigator.canShare &&
    !!info.blob &&
    navigator.canShare({
      files: [new File([info.blob], info.fileName, { type: 'application/pdf' })],
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-[#5C3A21] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#5C3A21] text-[#FAF2E4] p-3.5 sm:p-4 flex items-center justify-between border-b border-[#8C6239]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="font-bold font-granth text-base sm:text-lg">
              PDF सफलतापूर्वक सुरक्षित हो गई है!
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#462B17] text-[#D9C4A9] hover:text-white transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Main Success Announcement Card */}
          <div className="bg-emerald-50 border border-emerald-300/80 rounded-xl p-3 sm:p-3.5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                {info.title}
              </h4>
              <p className="text-xs text-emerald-800 break-all font-mono mt-0.5 font-bold">
                {info.fileName}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-bold">
                <span>पृष्ठ संख्या: {info.pageCount} पृष्ठ</span>
                <span>•</span>
                <span>फॉर्मेट: उच्च रिज़ॉल्यूशन A4</span>
              </div>
            </div>
          </div>

          {/* Where is the PDF Saved Info Section (Answers user's complaint) */}
          <div className="bg-[#F4E8D1] border border-[#8C6239]/40 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#5C3A21]">
              <FolderCheck className="w-4 h-4 text-[#B56A00]" />
              <span>फ़ाइल आपके डिवाइस में कहाँ सेव हुई है?</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Mobile Info */}
              <div className="bg-[#FAF2E4] p-2.5 rounded-lg border border-[#8C6239]/20 space-y-1">
                <div className="flex items-center gap-1 font-bold text-[#8C6239]">
                  <Smartphone className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>फ़ोन (Android / iPhone)</span>
                </div>
                <p className="text-[11px] text-[#735133] leading-relaxed">
                  आपके फ़ोन के <strong>&quot;Files&quot;</strong> या <strong>&quot;My Files&quot;</strong> ऐप के <strong>&quot;Downloads&quot;</strong> फ़ोल्डर में सहेजी गई है।
                </p>
              </div>

              {/* Computer Info */}
              <div className="bg-[#FAF2E4] p-2.5 rounded-lg border border-[#8C6239]/20 space-y-1">
                <div className="flex items-center gap-1 font-bold text-[#8C6239]">
                  <Laptop className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>कंप्यूटर / लैपटॉप</span>
                </div>
                <p className="text-[11px] text-[#735133] leading-relaxed">
                  आपके PC/Mac के <strong>Downloads</strong> (डाउनलोड्स) फ़ोल्डर में स्वतः सेव हो गई है।
                </p>
              </div>
            </div>
          </div>

          {/* Instant Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Direct Open in Tab Button */}
              <button
                type="button"
                onClick={handleOpenPdf}
                className="w-full py-2.5 px-3 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition transform active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#FFD88A]" />
                <span>सीधे PDF खोलें / देखें</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Share Button (or Download Again) */}
              {canShareFiles ? (
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-[#B56A00] to-[#C67D24] hover:brightness-110 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition transform active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp / ड्राइव पर भेजें</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadAgain}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-[#B56A00] to-[#C67D24] hover:brightness-110 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>पुनः डाउनलोड करें</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleDownloadAgain}
                className="text-[11px] font-bold text-[#8C6239] hover:text-[#5C3A21] flex items-center gap-1 cursor-pointer underline"
              >
                <Download className="w-3 h-3" />
                <span>एक और प्रति डाउनलोड करें (Save Another Copy)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-[#E5D2B8] hover:bg-[#D9C4A9] text-[#5C3A21] rounded-lg text-xs font-bold transition cursor-pointer"
              >
                सम्पन्न (ठीक है)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
