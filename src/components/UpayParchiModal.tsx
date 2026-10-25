import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { KundaliData, VedicPanchangData } from '../types';
import {
  generateTraditionalUpayParchi,
  TraditionalUpayParchiData,
} from '../services/umaMicroAstrology';
import {
  getAstrologerBranding,
  saveAstrologerBranding,
} from '../services/storage';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import {
  X,
  Download,
  Share2,
  Edit3,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Sparkles,
  FileText,
  Award,
  Loader2,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface UpayParchiModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeKundali?: KundaliData | null;
  panchang?: VedicPanchangData | null;
}

const CIRCLED_NUMS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

const STORAGE_KEY_PARCHI_HEADER = 'shakti_upay_parchi_header_v1';

interface ParchiHeaderConfig {
  astrologerName: string;
  qualification: string;
  designation: string;
  mobile: string;
  address: string;
}

const QUICK_REMEDY_PRESETS = [
  'मोती + माणिक रत्न धारण करें।',
  'पुखराज + माणिक रत्न धारण करें।',
  'पन्ना + ओपल रत्न धारण करें।',
  'मूंगा + पुखराज रत्न धारण करें।',
  'रविवार का उपवास करें।',
  'गुरुवार का उपवास करें।',
  'मंगलवार का उपवास करें।',
  'श्रीविष्णुसहस्रनाम का पाठ करें।',
  'श्री आदित्यहृदय स्तोत्र का पाठ करें।',
  'श्री सुन्दरकाण्ड का पाठ करें।',
  'पीला कपड़ा, चने की दाल, गुड़, हल्दी, दक्षिणा (गुरुवार - 1 बार)',
  'काला कपड़ा, काली उड़द, तिल, तेल, लोहा, दक्षिणा (शनिवार - 1 बार)',
  'लाल कपड़ा, मसूर दाल, गुड़, तांबा, दक्षिणा (मंगलवार - 1 बार)',
  'गाय और कुत्ते को रोटी खिलावें।',
  'ग्रहण योग शान्ति करावें।',
  'कालसर्प योग शान्ति करावें।',
  'मंगल भात पूजा / मांगलिक शान्ति करावें।',
  'गुरु-चाण्डाल योग शान्ति करावें।',
  'पितृ दोष शान्ति एवं तर्पण करावें।',
  'रुद्राभिषेक एवं महामृत्युंजय जप करावें।',
];

function loadParchiHeader(): ParchiHeaderConfig {
  const branding = getAstrologerBranding();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARCHI_HEADER);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        astrologerName: parsed.astrologerName || branding.name || 'उमा वैदिक ज्योतिष पीठ',
        qualification: parsed.qualification || 'M.A., Ph.D (संस्कृत एवं ज्योतिष)',
        designation: parsed.designation || branding.title || 'ज्योतिषी, याज्ञिक एवं वास्तुविद',
        mobile: parsed.mobile ?? branding.phone ?? '',
        address: parsed.address || branding.city || 'काशी / उज्जैन वैदिक परम्परा',
      };
    }
  } catch {}
  return {
    astrologerName: branding.name || 'वैदिक ज्योतिषी (उमा पीठ)',
    qualification: 'M.A., Ph.D (संस्कृत)',
    designation: branding.title || 'ज्योतिषी, याज्ञिक एवं वास्तुविद',
    mobile: branding.phone || '',
    address: branding.city || 'काशी / उज्जैन वैदिक परम्परा',
  };
}

export const UpayParchiModal: React.FC<UpayParchiModalProps> = ({
  isOpen,
  onClose,
  activeKundali,
  panchang,
}) => {
  const [header, setHeader] = useState<ParchiHeaderConfig>(() => loadParchiHeader());
  const [parchiData, setParchiData] = useState<TraditionalUpayParchiData>(() =>
    generateTraditionalUpayParchi(activeKundali, panchang)
  );
  const [salutation, setSalutation] = useState(parchiData.salutation);
  const [serialNo, setSerialNo] = useState(parchiData.serialNo);
  const [dateStr, setDateStr] = useState(parchiData.dateStr);
  const [points, setPoints] = useState<string[]>(parchiData.points);
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [blobFile, setBlobFile] = useState<File | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fresh = generateTraditionalUpayParchi(activeKundali, panchang);
      setParchiData(fresh);
      setSalutation(fresh.salutation);
      setSerialNo(fresh.serialNo);
      setDateStr(fresh.dateStr);
      setPoints(fresh.points);
      setHeader(loadParchiHeader());
    }
  }, [isOpen, activeKundali]);

  if (!isOpen) return null;

  const saveHeaderChanges = (nextHeader: ParchiHeaderConfig) => {
    setHeader(nextHeader);
    try {
      localStorage.setItem(STORAGE_KEY_PARCHI_HEADER, JSON.stringify(nextHeader));
      const existingBranding = getAstrologerBranding();
      saveAstrologerBranding({
        ...existingBranding,
        name: nextHeader.astrologerName,
        title: nextHeader.designation,
        phone: nextHeader.mobile,
        city: nextHeader.address,
      });
    } catch {}
  };

  const handleResetFromKundali = () => {
    const fresh = generateTraditionalUpayParchi(activeKundali, panchang);
    setParchiData(fresh);
    setSalutation(fresh.salutation);
    setDateStr(fresh.dateStr);
    setPoints(fresh.points);
  };

  const handleLoadExampleTemplate = () => {
    setSalutation(activeKundali?.name ? `श्री ${activeKundali.name} जी` : 'श्री यजमान जी');
    setPoints([
      'मोती + माणिक रत्न धारण करें।',
      'रविवार का उपवास करें।',
      'श्रीविष्णुसहस्रनाम का पाठ करें।',
      'पीला कपड़ा, चने की दाल, गुड़, हल्दी, दक्षिणा (गुरुवार - 1 बार)',
      'गाय और कुत्ते को रोटी खिलावें।',
      'ग्रहण योग शान्ति करावें।',
    ]);
  };

  const buildPlainTextSlip = () => {
    const lines = [
      `卐  *${header.astrologerName}*  卐`,
      `${header.qualification} • ${header.designation}`,
      header.address ? `स्थान: ${header.address}${header.mobile ? ` | Mo. ${header.mobile}` : ''}` : '',
      `────────────────────────`,
      `               *॥ श्री ॥*`,
      `क्र.: ${serialNo}                  दिनांक: ${dateStr}`,
      ``,
      `*${salutation}*`,
      ``,
      ...points.map((pt, idx) => `${CIRCLED_NUMS[idx] || `(${idx + 1})`} ${pt}`),
      ``,
      `                                        *॥ शुभम् ॥*`,
    ].filter((l) => l !== undefined);
    return lines.join('\n');
  };

  const handleCopySlip = () => {
    navigator.clipboard.writeText(buildPlainTextSlip());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Renders the exact high-resolution prescription slip onto an HTML5 Canvas
   * matching traditional Indian astrologer letterhead pads.
   */
  const renderParchiCanvas = async (): Promise<HTMLCanvasElement> => {
    if (document.fonts && document.fonts.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 350)),
        ]);
      } catch {}
    }

    const width = 1080;
    const baseHeight = 1360;
    const extraRows = Math.max(0, points.length - 6);
    const height = baseHeight + extraRows * 90;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    // 1. Warm Cream Prescription Paper Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#FFFDF9');
    bgGrad.addColorStop(0.5, '#FCF8F0');
    bgGrad.addColorStop(1, '#F7F1E3');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal notebook/pad texture lines in body
    ctx.strokeStyle = 'rgba(180, 160, 130, 0.14)';
    ctx.lineWidth = 1;
    for (let y = 390; y < height - 110; y += 64) {
      ctx.beginPath();
      ctx.moveTo(64, y);
      ctx.lineTo(width - 64, y);
      ctx.stroke();
    }

    // Subtle outer border
    ctx.strokeStyle = '#8B1E1E';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    const padX = 64;

    // 2. Top Left: Astrologer Name, Qualification, Designation
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 44px "Tiro Devanagari Hindi", "Noto Serif Devanagari", serif';
    ctx.fillText(header.astrologerName || 'डॉ. आशीष शुक्ल', padX, 100);

    ctx.fillStyle = '#6E2020';
    ctx.font = 'bold 25px "Tiro Devanagari Hindi", serif';
    ctx.fillText(header.qualification || 'M.A., Ph.D (संस्कृत)', padX, 145);

    ctx.fillStyle = '#7A1C1C';
    ctx.font = 'bold 27px "Tiro Devanagari Hindi", serif';
    ctx.fillText(header.designation || 'ज्योतिषी, याज्ञिक एवं वास्तुविद', padX, 188);

    // 3. Top Center: Red Swastika (卐)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B81D1D';
    ctx.font = 'bold 58px serif';
    ctx.fillText('卐', width / 2 + 15, 135);

    // 4. Top Right: Mobile & Address
    ctx.textAlign = 'right';
    ctx.fillStyle = '#7A1C1C';
    ctx.font = 'bold 26px "Tiro Devanagari Hindi", serif';
    const moLine = header.mobile ? `Mo. ${header.mobile}` : 'Mo. ..............................';
    ctx.fillText(moLine, width - padX, 138);

    ctx.fillStyle = '#6E2020';
    ctx.font = 'bold 28px "Tiro Devanagari Hindi", serif';
    ctx.fillText(header.address || 'राजपुरा, बुरहानपुर (म.प्र.)', width - padX, 188);

    // 5. Horizontal Maroon Divider Line
    const dividerY = 222;
    ctx.strokeStyle = '#8B1E1E';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(padX - 10, dividerY);
    ctx.lineTo(width - padX + 10, dividerY);
    ctx.stroke();

    // 6. Below Divider: || श्री || (Center), क्र. (Left), दिनांक (Right)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 34px "Tiro Devanagari Hindi", serif';
    ctx.fillText('|| श्री ||', width / 2, dividerY + 46);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#7A1C1C';
    ctx.font = 'bold 27px "Tiro Devanagari Hindi", serif';
    ctx.fillText(`क्र.  ${serialNo}`, padX, dividerY + 92);

    ctx.textAlign = 'right';
    ctx.fillText(`दिनांक  ${dateStr}`, width - padX, dividerY + 92);

    // Dotted underline under date
    ctx.strokeStyle = '#8B1E1E';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width - padX - 175, dividerY + 100);
    ctx.lineTo(width - padX, dividerY + 100);
    ctx.stroke();
    ctx.setLineDash([]);

    // 7. Client Salutation (Royal Blue Ink)
    let cursorY = dividerY + 175;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#162C6A';
    ctx.font = 'bold 40px "Tiro Devanagari Hindi", "Noto Serif Devanagari", serif';
    ctx.fillText(salutation || 'श्री यजमान जी', padX + 16, cursorY);

    cursorY += 85;

    // 8. Numbered Remedies (① to ⑥+) in Royal Blue Ink with Word Wrapping
    const maxTextWidth = width - padX * 2 - 90;
    ctx.font = 'bold 36px "Tiro Devanagari Hindi", "Noto Serif Devanagari", serif';

    points.forEach((pt, idx) => {
      const badge = CIRCLED_NUMS[idx] || `(${idx + 1})`;
      ctx.fillStyle = '#162C6A';
      ctx.fillText(badge, padX + 20, cursorY);

      // Wrap text if long
      const words = pt.split(' ');
      let currentLine = '';
      const lines: string[] = [];

      for (const w of words) {
        const testLine = currentLine ? `${currentLine} ${w}` : w;
        if (ctx.measureText(testLine).width > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = w;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      lines.forEach((lineStr, lineIdx) => {
        ctx.fillText(lineStr, padX + 86, cursorY + lineIdx * 54);
      });

      cursorY += Math.max(1, lines.length) * 56 + 44;
    });

    // 9. Bottom Right Sign-Off: || शुभम् ||
    const shubhamY = Math.max(cursorY + 50, height - 115);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#162C6A';
    ctx.font = 'bold 40px "Tiro Devanagari Hindi", serif';
    ctx.fillText('|| शुभम् ||', width - padX - 30, shubhamY);

    // Subtle Kundali metadata footer
    if (activeKundali) {
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(122, 28, 28, 0.65)';
      ctx.font = '20px "Tiro Devanagari Hindi", serif';
      ctx.fillText(
        `जन्मपत्रिका आधार: ${activeKundali.lagnaRashi} लग्न • ${activeKundali.moonRashi} राशि • ${activeKundali.nakshatra} नक्षत्र • ${activeKundali.mahadasha} महादशा`,
        padX,
        height - 46
      );
    }

    return canvas;
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      setDownloadStatus('HD पर्ची तैयार हो रही है...');
      const canvas = await renderParchiCanvas();

      // Convert canvas to Blob (proper binary data, avoids huge data URL limits on mobile browsers)
      const blob: Blob | null = await new Promise((resolve) => {
        try {
          canvas.toBlob((b) => resolve(b), 'image/png');
        } catch {
          resolve(null);
        }
      });

      let downloadUrl = '';
      const safeSalutation = (salutation || 'Yajaman')
        .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
        .substring(0, 25);
      const fileName = `Upay_Parchi_${safeSalutation}.png`;

      if (blob) {
        downloadUrl = URL.createObjectURL(blob);
        try {
          const file = new File([blob], fileName, { type: 'image/png' });
          setBlobFile(file);
        } catch {}
      } else {
        downloadUrl = canvas.toDataURL('image/png');
      }

      setGeneratedImageUrl(downloadUrl);

      // Attempt standard browser download
      try {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = downloadUrl;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          try {
            document.body.removeChild(link);
          } catch {}
        }, 1500);
      } catch (clickErr) {
        console.warn('Auto-click download error:', clickErr);
      }

      // Always open HD Preview Modal so mobile users can view/save/long-press without fail
      setPreviewModalOpen(true);
      setDownloadStatus(null);
    } catch (err) {
      console.error('Failed to download Upay Parchi PNG:', err);
      setDownloadStatus('डाउनलोड में समस्या आई। पुनः प्रयास करें।');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      setIsDownloading(true);
      const canvas = await renderParchiCanvas();
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );

      if (
        blob &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [new File([blob], 'Upay_Parchi.png', { type: 'image/png' })],
        })
      ) {
        const file = new File([blob], 'Upay_Parchi.png', { type: 'image/png' });
        await navigator.share({
          title: `ज्योतिषीय उपाय पर्ची — ${salutation}`,
          text: buildPlainTextSlip(),
          files: [file],
        });
        return;
      }
    } catch {
      // Fallback to WhatsApp text share
    } finally {
      setIsDownloading(false);
    }
    openWhatsAppShare(buildPlainTextSlip());
  };

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-3xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Modal Bar */}
        <div className="bg-gradient-to-r from-[#5C1414] via-[#7A1D1D] to-[#5C1414] text-[#FAF2E4] px-4 py-3 flex items-center justify-between border-b-2 border-[#B58738]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#B58738] text-[#2C0A0A] flex items-center justify-center font-bold text-lg shadow-inner">
              卐
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-granth text-[#FFD88A] flex items-center gap-2">
                <span>📋 उमा ज्योतिषीय उपाय पर्ची (Prescription Pad)</span>
              </h3>
              <p className="text-[11px] text-[#E6C687]">
                {activeKundali
                  ? `${activeKundali.name} • ${activeKundali.lagnaRashi} लग्न • ${activeKundali.moonRashi} राशि • दोष: ${parchiData.detectedDoshaYoga}`
                  : 'पारंपरिक लेटरहेड पर संक्षिप्त ६-सूत्रीय रत्न, उपवास, पाठ, दान व दोष शान्ति पर्ची'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
                isEditing
                  ? 'bg-[#FFD88A] text-[#5C1414] border-white'
                  : 'bg-[#5C1414] text-[#FFD88A] border-[#B58738]/60 hover:bg-[#4A1010]'
              }`}
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'पूर्वावलोकन (Preview)' : '✏️ पर्ची संपादित करें'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#E6C687] hover:text-white hover:bg-black/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Mode Bar */}
        <div className="bg-[#F4E8D1] px-4 py-2 border-b border-[#8C6239]/30 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleResetFromKundali}
              className="px-2.5 py-1 bg-[#7A1D1D] text-white rounded-md font-bold flex items-center gap-1 cursor-pointer hover:bg-[#5C1414] transition shadow-2xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>कुण्डली अनुसार स्वतः उपाय</span>
            </button>

            <button
              type="button"
              onClick={handleLoadExampleTemplate}
              className="px-2.5 py-1 bg-[#FFFDF8] text-[#5C3A21] border border-[#8C6239]/40 rounded-md font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#EBDCC0] transition"
            >
              <Sparkles className="w-3 h-3 text-[#B56A00]" />
              <span>आदर्श उदाहरण पर्ची (मोती+माणिक / ग्रहण योग)</span>
            </button>
          </div>

          <span className="text-[11px] text-[#7A1D1D] font-semibold">
            {isEditing ? 'आप किसी भी पंक्ति या नाम को बदल सकते हैं' : 'हूबहू पारंपरिक ज्योतिषाचार्य लेटरहेड प्रारूप'}
          </span>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-[#EBDCC0]/60">
          {/* Edit Form Panel (when isEditing is true) */}
          {isEditing && (
            <div className="bg-[#FFFDF8] border-2 border-[#B58738] rounded-xl p-4 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-[#8C6239]/25 pb-2">
                <h4 className="text-xs sm:text-sm font-bold text-[#7A1D1D] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#B56A00]" />
                  <span>१. ज्योतिषाचार्य लेटरहेड (शीर्षक) विवरण संपादित करें:</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block font-bold text-[#5C3A21] mb-1">ज्योतिषी / आचार्य का नाम:</label>
                  <input
                    type="text"
                    value={header.astrologerName}
                    onChange={(e) => saveHeaderChanges({ ...header, astrologerName: e.target.value })}
                    placeholder="उदा. डॉ. आशीष शुक्ल"
                    className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C3A21] mb-1">शैक्षणिक योग्यता (Degree):</label>
                  <input
                    type="text"
                    value={header.qualification}
                    onChange={(e) => saveHeaderChanges({ ...header, qualification: e.target.value })}
                    placeholder="उदा. M.A., Ph.D (संस्कृत)"
                    className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C3A21] mb-1">पदवी (Designation):</label>
                  <input
                    type="text"
                    value={header.designation}
                    onChange={(e) => saveHeaderChanges({ ...header, designation: e.target.value })}
                    placeholder="उदा. ज्योतिषी, याज्ञिक एवं वास्तुविद"
                    className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C3A21] mb-1">मोबाइल नंबर (Mo.):</label>
                  <input
                    type="text"
                    value={header.mobile}
                    onChange={(e) => saveHeaderChanges({ ...header, mobile: e.target.value })}
                    placeholder="उदा. 9876543210"
                    className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C3A21] mb-1">पता / नगर (Address):</label>
                  <input
                    type="text"
                    value={header.address}
                    onChange={(e) => saveHeaderChanges({ ...header, address: e.target.value })}
                    placeholder="उदा. राजपुरा, बुरहानपुर (म.प्र.)"
                    className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#5C3A21] mb-1">क्रमांक (क्र.):</label>
                    <input
                      type="text"
                      value={serialNo}
                      onChange={(e) => setSerialNo(e.target.value)}
                      className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#5C3A21] mb-1">दिनांक:</label>
                    <input
                      type="text"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#8C6239]/25 pt-3 space-y-2.5 text-xs">
                <div>
                  <label className="block font-bold text-[#7A1D1D] mb-1">
                    २. यजमान / जातक का संबोधन (Salutation):
                  </label>
                  <input
                    type="text"
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    placeholder="उदा. श्री यजमान जी"
                    className="w-full sm:w-80 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-3 py-1.5 text-sm font-bold text-[#162C6A]"
                  />
                </div>

                <label className="block font-bold text-[#7A1D1D]">
                  ३. उपाय बिंदु (① से ⑥) संपादित करें या नया जोड़ें:
                </label>
                <div className="space-y-2">
                  {points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#162C6A] w-6 shrink-0">
                        {CIRCLED_NUMS[i] || `${i + 1}.`}
                      </span>
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => {
                          const next = [...points];
                          next[i] = e.target.value;
                          setPoints(next);
                        }}
                        className="flex-1 bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#162C6A]"
                      />
                      {points.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPoints(points.filter((_, idx) => idx !== i))}
                          className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPoints([...points, 'नया सात्विक उपाय यहाँ लिखें।'])}
                    className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#EBDCC0] text-[#7A1D1D] border border-[#8C6239]/40 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ नया बिंदु जोड़ें</span>
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-[#5C3A21] mb-1.5">
                    त्वरित शास्त्रीय उपाय जोड़ें (क्लिक करते ही पर्ची में जुड़ेगा):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REMEDY_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!points.includes(preset)) {
                            setPoints([...points, preset]);
                          }
                        }}
                        className="px-2 py-1 bg-[#FAF2E4] hover:bg-[#EBDCC0] border border-[#8C6239]/30 rounded text-[11px] text-[#3E2714] cursor-pointer transition"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE REALISTIC PRESCRIPTION PAD PREVIEW (Matches Uploaded Image 100%) */}
          <div className="mx-auto max-w-2xl bg-[#FFFDF9] border-2 border-[#8B1E1E] rounded-md shadow-xl p-4 sm:p-8 text-[#162C6A] relative overflow-hidden">
            {/* Top Letterhead Header */}
            <div className="grid grid-cols-3 items-start gap-2 pb-3 border-b-[3px] border-[#8B1E1E]">
              {/* Top Left: Name, Degree, Title */}
              <div className="text-left space-y-0.5">
                <h2 className="text-lg sm:text-2xl font-bold text-[#8B1E1E] font-serif leading-tight">
                  {header.astrologerName || 'डॉ. आशीष शुक्ल'}
                </h2>
                <p className="text-xs sm:text-sm font-bold text-[#6E2020] font-serif">
                  {header.qualification || 'M.A., Ph.D (संस्कृत)'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#7A1C1C] font-serif">
                  {header.designation || 'ज्योतिषी, याज्ञिक एवं वास्तुविद'}
                </p>
              </div>

              {/* Top Center: Red Swastika */}
              <div className="flex flex-col items-center justify-center pt-1">
                <span className="text-3xl sm:text-4xl font-bold text-[#B81D1D] leading-none select-none">
                  卐
                </span>
              </div>

              {/* Top Right: Mobile & Address */}
              <div className="text-right space-y-1 pt-1">
                <p className="text-xs sm:text-sm font-bold text-[#7A1C1C] font-serif">
                  Mo. {header.mobile || '..............................'}
                </p>
                <p className="text-xs sm:text-base font-bold text-[#6E2020] font-serif">
                  {header.address || 'राजपुरा, बुरहानपुर (म.प्र.)'}
                </p>
              </div>
            </div>

            {/* Sub-header: || श्री ||, क्र., दिनांक */}
            <div className="pt-2 pb-4">
              <div className="text-center">
                <span className="text-base sm:text-xl font-bold text-[#8B1E1E] font-serif">
                  || श्री ||
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#7A1C1C] font-serif mt-1">
                <span>क्र. {serialNo}</span>
                <span>
                  दिनांक{' '}
                  <span className="border-b border-dotted border-[#8B1E1E] px-2 pb-0.5">
                    {dateStr}
                  </span>
                </span>
              </div>
            </div>

            {/* Handwritten-style Blue Ink Body */}
            <div className="pt-3 pb-6 space-y-4 sm:space-y-5 font-serif">
              {/* Client Salutation */}
              <div className="text-lg sm:text-2xl font-bold text-[#162C6A] pl-1">
                {salutation}
              </div>

              {/* Numbered Remedies List */}
              <div className="space-y-3.5 sm:space-y-4 pl-2 sm:pl-4">
                {points.map((pt, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 sm:gap-3.5 text-base sm:text-xl font-bold text-[#162C6A] leading-snug border-b border-amber-900/10 pb-2"
                  >
                    <span className="text-lg sm:text-2xl text-[#162C6A] shrink-0 select-none">
                      {CIRCLED_NUMS[index] || `(${index + 1})`}
                    </span>
                    <span className="flex-1">{pt}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Right Sign-off: || शुभम् || */}
              <div className="pt-6 pr-4 text-right">
                <span className="text-lg sm:text-2xl font-bold text-[#162C6A] font-serif">
                  || शुभम् ||
                </span>
              </div>
            </div>

            {/* Subtle Footer Tag */}
            {activeKundali && (
              <div className="pt-2 border-t border-[#8B1E1E]/20 flex items-center justify-between text-[11px] text-[#7A1C1C]/80 font-serif">
                <span>
                  कुण्डली आधार: {activeKundali.lagnaRashi} लग्न • {activeKundali.moonRashi} राशि •{' '}
                  {activeKundali.nakshatra} नक्षत्र
                </span>
                <span>दशा: {activeKundali.mahadasha}–{activeKundali.antardasha}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#F4E8D1] px-4 py-3 border-t-2 border-[#8C6239]/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySlip}
              className="px-3 py-2 bg-[#FFFDF8] hover:bg-[#EBDCC0] text-[#5C3A21] border border-[#8C6239]/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span className="text-emerald-800">कॉपी हो गया!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#7A1D1D]" />
                  <span>टेक्स्ट कॉपी करें</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-2 bg-[#FFFDF8] hover:bg-[#EBDCC0] text-[#7A1D1D] border border-[#8C6239]/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'संपादन पूर्ण' : 'नाम/उपाय बदलें'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-4 py-2 bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] hover:from-[#5C1414] hover:to-[#3E0A0A] text-[#FFD88A] rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFD88A]" />
                  <span>पर्ची बन रही है...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>📥 HD पर्ची डाउनलोड (PNG)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isDownloading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>📲 WhatsApp पर भेजें</span>
            </button>
          </div>
        </div>
      </div>

      {/* HD PNG Download & Save Preview Modal (100% Reliable for Android & Mobile WebViews) */}
      {previewModalOpen && generatedImageUrl && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-lg max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6A1717] to-[#4A0E0E] text-[#FFF4DE] px-4 py-3 flex items-center justify-between border-b border-[#8C6239]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎉</span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#FFD88A]">
                    आपकी HD उपाय पर्ची तैयार है!
                  </h3>
                  <p className="text-[11px] text-[#F3E2C4]/80">
                    पारंपरिक लेटरहेड प्रारूप (1080×1360 HD PNG)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-amber-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Helpful Hint & Image View */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 flex flex-col items-center">
              <div className="w-full bg-amber-50/90 border border-amber-300 rounded-xl p-2.5 mb-3 text-xs text-[#5C3A21] flex items-start gap-2 shadow-xs">
                <span className="text-base shrink-0">📱</span>
                <div>
                  <strong className="text-[#7A1D1D] font-bold block mb-0.5">
                    मोबाइल उपयोगकर्ताओं के लिए सुझाव:
                  </strong>
                  यदि फाइल अपने आप डाउनलोड न हुई हो, तो नीचे दिख रही पर्ची पर अपनी उंगली <strong>२ सेकंड दबाकर रखें (Long-press)</strong> और <strong>'Download image' (छवि सहेजें)</strong> चुनें।
                </div>
              </div>

              <div className="relative border-2 border-[#8C6239]/50 rounded-xl overflow-hidden shadow-lg max-h-[52vh] flex items-center justify-center bg-[#FAF6EE]">
                <img
                  src={generatedImageUrl}
                  alt="ज्योतिषीय उपाय पर्ची"
                  className="w-auto h-auto max-h-[52vh] max-w-full object-contain"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-[#F4E8D1] px-4 py-3 border-t border-[#8C6239]/30 flex items-center justify-between gap-2 flex-wrap">
              <a
                href={generatedImageUrl}
                download={`Upay_Parchi_${(salutation || 'Yajaman').replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[130px] py-2.5 px-3 bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] hover:from-[#5C1414] hover:to-[#3E0A0A] text-[#FFD88A] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition text-center"
              >
                <Download className="w-4 h-4" />
                <span>सीधे डाउनलोड करें</span>
              </a>

              {blobFile && navigator.share && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (blobFile) {
                        await navigator.share({
                          title: `ज्योतिषीय उपाय पर्ची — ${salutation}`,
                          files: [blobFile],
                        });
                      }
                    } catch {}
                  }}
                  className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>गैलरी / शेयर</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="py-2.5 px-4 bg-[#E6D7BC] hover:bg-[#D9C6A5] text-[#5C3A21] rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition"
              >
                पूर्ण / बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
