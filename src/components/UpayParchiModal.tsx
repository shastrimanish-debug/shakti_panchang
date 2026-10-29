import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { KundaliData, VedicPanchangData } from '../types';
import {
  generateTraditionalUpayParchi,
  TraditionalUpayParchiData,
  getRemedyDeepDetail,
  buildDetailedParchiGuideText,
  UpayParchiDetailedItem,
  GrahanShantiDeepDive,
} from '../services/umaMicroAstrology';
import {
  getAstrologerBranding,
  saveAstrologerBranding,
  getStoredFontSize,
  setStoredFontSize,
  getSavedKundaliProfiles,
  AppFontSize,
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
  ExternalLink,
  ZoomIn,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Volume2,
  VolumeX,
  Flame,
  Maximize2,
  Minimize2,
  Type,
} from 'lucide-react';
import { saveImageNative } from '../lib/device';
import { shareImageFile } from '../lib/shareHelper';
import { umaVoice } from '../services/UmaVoiceService';
import { speakUma, stopUmaSpeech } from '../lib/umaSpeech';

interface UpayParchiModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeKundali?: KundaliData | null;
  panchang?: VedicPanchangData | null;
  onOpenVishnuSahasranama?: () => void;
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
      // Cleanse legacy dummy data from previous sessions if present in browser localStorage
      const rawName = (parsed.astrologerName || '').trim();
      const scrubbedName = rawName === 'डॉ. आशीष शुक्ल' ? '' : rawName;

      const rawAddress = (parsed.address || '').trim();
      const scrubbedAddress = rawAddress === 'राजपुरा, बुरहानपुर (म.प्र.)' ? '' : rawAddress;

      const rawQual = (parsed.qualification || '').trim();
      const scrubbedQual = rawQual.includes('M.A., Ph.D (संस्कृत') ? '' : rawQual;

      return {
        astrologerName: scrubbedName || branding.name || '',
        qualification: scrubbedQual || '',
        designation: parsed.designation || branding.title || 'ज्योतिषाचार्य एवं वास्तुविद',
        mobile: parsed.mobile ?? branding.phone ?? '',
        address: scrubbedAddress || branding.city || '',
      };
    }
  } catch {}
  return {
    astrologerName: branding.name || '',
    qualification: '',
    designation: branding.title || 'ज्योतिषाचार्य एवं वास्तुविद',
    mobile: branding.phone || '',
    address: branding.city || '',
  };
}

export const UpayParchiModal: React.FC<UpayParchiModalProps> = ({
  isOpen,
  onClose,
  activeKundali,
  panchang,
  onOpenVishnuSahasranama,
}) => {
  const effectiveKundali =
    activeKundali || (typeof window !== 'undefined' ? getSavedKundaliProfiles()[0] || null : null);

  const [header, setHeader] = useState<ParchiHeaderConfig>(() => loadParchiHeader());
  const [isEditAstrologerModalOpen, setIsEditAstrologerModalOpen] = useState(false);
  const [parchiData, setParchiData] = useState<TraditionalUpayParchiData>(() =>
    generateTraditionalUpayParchi(effectiveKundali, panchang)
  );
  const [salutation, setSalutation] = useState(parchiData.salutation);
  const [serialNo, setSerialNo] = useState(parchiData.serialNo);
  const [dateStr, setDateStr] = useState(parchiData.dateStr);
  const [points, setPoints] = useState<string[]>(parchiData.points);

  // Tab switcher: 'parchi' (Letterhead pad) vs 'guide' (Why & Benefits detailed guide)
  const [activeTab, setActiveTab] = useState<'parchi' | 'guide'>('parchi');
  const [highlightedItemIndex, setHighlightedItemIndex] = useState<number | null>(null);
  const [expandedCardIndices, setExpandedCardIndices] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Elder accessibility & Reading view controls (वृद्धजन सुपाठ्यता एवं स्क्रीन विस्तार)
  const [fontSize, setFontSize] = useState<AppFontSize>(() => getStoredFontSize());
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isAutoHideEnabled, setIsAutoHideEnabled] = useState(true);
  const lastScrollTopRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleUpdateFontSize = (newSize: AppFontSize) => {
    setFontSize(newSize);
    setStoredFontSize(newSize);
    try {
      document.documentElement.setAttribute('data-font-size', newSize);
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.setAttribute('data-font-size', newSize);
    } catch {}
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // If auto-hide is disabled, or editing form inputs, or in Zen mode, do nothing
    if (!isAutoHideEnabled || isEditing || isZenMode) return;

    // Strict cooldown lock: prevents layout-shift recursion and continuous blinking
    const now = Date.now();
    if (now < cooldownUntilRef.current) return;

    const el = e.currentTarget;
    const currentScrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    // If content does not have substantial scrollable overflow, do not toggle to avoid bounce
    if (scrollHeight - clientHeight < 160) return;

    const delta = currentScrollTop - lastScrollTopRef.current;

    // Scrolling down: significant movement past 120px threshold
    if (delta > 45 && currentScrollTop > 120) {
      if (isChromeVisible) {
        setIsChromeVisible(false);
        cooldownUntilRef.current = now + 500;
        lastScrollTopRef.current = currentScrollTop;
      }
    } else if (delta < -35 || currentScrollTop < 20) {
      // Scrolling up or at very top: reveal chrome
      if (!isChromeVisible) {
        setIsChromeVisible(true);
        cooldownUntilRef.current = now + 500;
        lastScrollTopRef.current = currentScrollTop;
      }
    }

    if (Math.abs(delta) > 15) {
      lastScrollTopRef.current = Math.max(0, currentScrollTop);
    }
  };

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [blobFile, setBlobFile] = useState<File | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fresh = generateTraditionalUpayParchi(effectiveKundali, panchang);
      setParchiData(fresh);
      setSalutation(fresh.salutation);
      setSerialNo(fresh.serialNo);
      setDateStr(fresh.dateStr);
      setPoints(fresh.points);
      setHeader(loadParchiHeader());
      setActiveTab('parchi');
      setHighlightedItemIndex(null);
      setIsChromeVisible(true);
      setIsZenMode(false);
      setFontSize(getStoredFontSize());
    }
  }, [isOpen, activeKundali]);

  useEffect(() => {
    return () => {
      if (isPlayingAudio) {
        stopUmaSpeech();
      }
    };
  }, [isPlayingAudio]);

  if (!isOpen) return null;

  // Real-time recomputed detailed items based on active points
  const currentDetailedItems: UpayParchiDetailedItem[] = points.map((pt, idx) =>
    getRemedyDeepDetail(pt, idx, effectiveKundali)
  );
  const currentGrahanDeep: GrahanShantiDeepDive | undefined =
    currentDetailedItems.find((it) => it.shantiDeepDive)?.shantiDeepDive;

  const currentGuideText = buildDetailedParchiGuideText(
    salutation,
    serialNo,
    dateStr,
    effectiveKundali
      ? `${effectiveKundali.lagnaRashi} लग्न • ${effectiveKundali.moonRashi} राशि • ${effectiveKundali.mahadasha} महादशा`
      : 'तात्कालिक प्रश्न लग्न',
    currentDetailedItems,
    currentGrahanDeep
  );

  const handleCloseModal = () => {
    if (isPlayingAudio) {
      stopUmaSpeech();
      setIsPlayingAudio(false);
    }
    onClose();
  };

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
    const fresh = generateTraditionalUpayParchi(effectiveKundali, panchang);
    setParchiData(fresh);
    setSalutation(fresh.salutation);
    setDateStr(fresh.dateStr);
    setPoints(fresh.points);
  };

  const buildPlainTextSlip = () => {
    const astroName = header.astrologerName?.trim();
    const subTitle = [header.qualification?.trim(), header.designation?.trim()].filter(Boolean).join(' • ');
    const contactLine = [header.address ? `स्थान: ${header.address}` : '', header.mobile ? `Mo. ${header.mobile}` : ''].filter(Boolean).join(' | ');

    const lines = [
      astroName ? `卐  *${astroName}*  卐` : `卐  *वैदिक ज्योतिष परामर्श एवं उपाय पर्ची*  卐`,
      subTitle || undefined,
      contactLine || undefined,
      `────────────────────────`,
      `               *॥ श्री ॥*`,
      `क्र.: ${serialNo}                  दिनांक: ${dateStr}`,
      ``,
      `*${salutation}*`,
      ``,
      ...points.map((pt, idx) => `${CIRCLED_NUMS[idx] || `(${idx + 1})`} ${pt}`),
      ``,
      `                                        *॥ शुभम् ॥*`,
    ].filter((l): l is string => typeof l === 'string' && l.length > 0);
    return lines.join('\n');
  };

  const handleCopySlip = () => {
    navigator.clipboard.writeText(buildPlainTextSlip());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDetailedGuide = () => {
    navigator.clipboard.writeText(currentGuideText);
    setCopiedGuide(true);
    setTimeout(() => setCopiedGuide(false), 2500);
  };

  const handleShareWhatsAppGuide = () => {
    openWhatsAppShare(currentGuideText);
  };

  const handleToggleUmaAudio = async () => {
    if (isPlayingAudio) {
      stopUmaSpeech();
      setIsPlayingAudio(false);
      return;
    }
    try {
      setIsPlayingAudio(true);
      const pointsSpeech = points
        .map((pt, idx) => `उपाय क्रमांक ${idx + 1}, ${pt.replace(/[\(\)\[\]\{\}]/g, '')}`)
        .join('। ');

      const spokenSummary = `॥ ॐ श्री गणेशाय नमः ॥ ॥ ॐ नमो भगवते वासुदेवाय ॥ सदा कल्याण हो ${salutation}! आपकी जन्मपत्रिका के ग्रह दोषों की शांति और भाग्योदय हेतु, यह प्रामाणिक वैदिक उपाय पर्ची श्रवण करें। ${pointsSpeech}। ${
        currentGrahanDeep
          ? `आपकी पत्रिका में ${currentGrahanDeep.grahanTypeLabel} के निवारण हेतु संकल्प, नवग्रह पूजन, एकादशवार रुद्राभिषेक एवं वैदिक जप की छह चरणीय शांति अवश्य कराएं। `
          : ''
      } श्रद्धा और विश्वास के साथ इन उपायों का नित्य पालन करें। भगवान श्री हरि विष्णु एवं देवाधिदेव महादेव आपके सर्व मनोरथ पूर्ण करें। ॥ ॐ शान्तिः शान्तिः शान्तिः ॥`;

      await speakUma(spokenSummary, {
        rate: 0.82,
        pitch: 1.26,
        voiceStyle: 'uma',
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const toggleCardExpansion = (idx: number) => {
    if (expandedCardIndices.includes(idx)) {
      setExpandedCardIndices(expandedCardIndices.filter((i) => i !== idx));
    } else {
      setExpandedCardIndices([...expandedCardIndices, idx]);
    }
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
    const displayAstroName = header.astrologerName?.trim() || 'पं. ..................................';
    ctx.fillText(displayAstroName, padX, 100);

    let nextLeftY = 145;
    if (header.qualification?.trim()) {
      ctx.fillStyle = '#6E2020';
      ctx.font = 'bold 25px "Tiro Devanagari Hindi", serif';
      ctx.fillText(header.qualification.trim(), padX, nextLeftY);
      nextLeftY += 43;
    }

    if (header.designation?.trim()) {
      ctx.fillStyle = '#7A1C1C';
      ctx.font = 'bold 27px "Tiro Devanagari Hindi", serif';
      ctx.fillText(header.designation.trim(), padX, nextLeftY);
    }

    // 3. Top Center: Red Swastika (卐)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B81D1D';
    ctx.font = 'bold 58px serif';
    ctx.fillText('卐', width / 2 + 15, 135);

    // 4. Top Right: Mobile & Address
    ctx.textAlign = 'right';
    ctx.fillStyle = '#7A1C1C';
    ctx.font = 'bold 26px "Tiro Devanagari Hindi", serif';
    const moLine = header.mobile?.trim() ? `Mo. ${header.mobile.trim()}` : 'Mo. ..............................';
    ctx.fillText(moLine, width - padX, 138);

    if (header.address?.trim()) {
      ctx.fillStyle = '#6E2020';
      ctx.font = 'bold 28px "Tiro Devanagari Hindi", serif';
      ctx.fillText(header.address.trim(), width - padX, 188);
    }

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

    // 7. Client Salutation in handwritten deep blue ink
    const salutationY = dividerY + 168;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#162C6A';
    ctx.font = 'bold 42px "Tiro Devanagari Hindi", serif';
    ctx.fillText(salutation, padX, salutationY);

    // 8. Numbered Remedies List in classic Indian Fountain-Pen Blue
    let cursorY = salutationY + 82;
    ctx.fillStyle = '#162C6A';
    ctx.font = 'bold 34px "Tiro Devanagari Hindi", serif';

    points.forEach((pointText, index) => {
      const circ = CIRCLED_NUMS[index] || `(${index + 1})`;
      ctx.textAlign = 'left';
      ctx.fillText(circ, padX, cursorY);

      const maxLineWidth = width - padX * 2 - 86;
      const words = pointText.split(' ');
      let currentLine = '';
      const lines: string[] = [];

      for (const w of words) {
        const testLine = currentLine ? `${currentLine} ${w}` : w;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxLineWidth && currentLine) {
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

  // 100% SPA-Safe, non-navigating, non-freezing download helper
  const triggerNativeDownload = async (dataUrl: string, name: string) => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);

    // 1. If running inside native Android / Capacitor app, save directly to device gallery/storage
    try {
      const saved = await saveImageNative(dataUrl, name);
      if (saved) return;
    } catch (e) {
      console.warn('Native save failed, falling back:', e);
    }

    // 2. Direct simple link download (Instant, zero memory spike)
    try {
      const link = document.createElement('a');
      link.download = name;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
      return;
    } catch (e) {
      console.warn('Direct link download failed:', e);
    }

    // 3. Fallback to server-side attachment stream
    try {
      const res = await fetch('/api/parchi/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, fileName: name }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
      }
    } catch (err) {
      console.warn('Server download stream failed:', err);
    }
  };

  const handleShareOrSaveToGallery = async (dataUrl: string, name: string) => {
    try {
      await shareImageFile({
        imageUri: dataUrl,
        fileName: name,
        title: `ज्योतिषीय उपाय पर्ची — ${salutation}`,
        text: `॥ श्री ॥ उमा ज्योतिषीय उपाय पर्ची (${salutation})\n\n${buildPlainTextSlip()}`,
      });
    } catch (err) {
      console.warn('Share image error:', err);
      openWhatsAppShare(buildPlainTextSlip());
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      setDownloadStatus('HD पर्ची तैयार हो रही है...');
      const canvas = await renderParchiCanvas();

      // Convert to Base64 DataURL and Blob File
      const dataUrl = canvas.toDataURL('image/png');
      const safeSalutation = (salutation || 'Yajaman')
        .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
        .substring(0, 25);
      const fileName = `Upay_Parchi_${safeSalutation}.png`;

      canvas.toBlob((blob) => {
        if (blob) {
          try {
            const file = new File([blob], fileName, { type: 'image/png' });
            setBlobFile(file);
          } catch {}
        }
      }, 'image/png');

      setGeneratedImageUrl(dataUrl);

      // Trigger safe download without navigation
      triggerNativeDownload(dataUrl, fileName);

      // Open HD Preview Modal so mobile users can view/save/share without fail
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

      const safeSalutation = (salutation || 'Yajaman')
        .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
        .substring(0, 25);
      const fileName = `Upay_Parchi_${safeSalutation}.png`;

      if (
        blob &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [new File([blob], fileName, { type: 'image/png' })],
        })
      ) {
        const file = new File([blob], fileName, { type: 'image/png' });
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
    <div
      className={`fixed inset-0 z-[140] flex items-center justify-center transition-all duration-200 ${
        isZenMode ? 'p-0 bg-black/85' : 'p-2 sm:p-4 bg-black/75 backdrop-blur-xs'
      } animate-in fade-in duration-200`}
    >
      <div
        data-font-size={fontSize}
        className={`bg-[#FAF2E4] border-[#8C6239] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 relative ${
          isZenMode
            ? 'w-full h-full max-h-[100dvh] max-w-none rounded-none border-0'
            : 'w-full max-w-3xl max-h-[92dvh] rounded-2xl border-2'
        }`}
      >
        {/* Top Modal Bar (Always anchored at top for easy closing, font scaling & Zen toggle) */}
        {!isZenMode && (
          <div className="bg-gradient-to-r from-[#5C1414] via-[#7A1D1D] to-[#5C1414] text-[#FAF2E4] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between border-b-2 border-[#B58738] shrink-0 z-20">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#B58738] text-[#2C0A0A] flex items-center justify-center font-bold text-base sm:text-lg shadow-inner shrink-0">
                卐
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-lg font-granth text-[#FFD88A] truncate flex items-center gap-1.5">
                  <span>📋 उमा ज्योतिषीय उपाय पर्ची</span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#E6C687] truncate">
                  {activeKundali
                    ? `${activeKundali.name} • ${activeKundali.lagnaRashi} लग्न • ${activeKundali.moonRashi} राशि`
                    : 'पारंपरिक लेटरहेड पर्ची एवं शास्त्रीय मार्गदर्शन'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Senior & Elder Friendly Font Sizing (अ / अ+ / अ++) */}
              <div
                className="flex items-center bg-[#460E0E] rounded-lg p-0.5 border border-[#B58738]/50"
                title="अक्षर आकार (बुजुर्गों एवं वृद्धजनों हेतु सुगम फॉन्ट)"
              >
                {(['normal', 'large', 'xlarge'] as AppFontSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleUpdateFontSize(sz)}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                      fontSize === sz
                        ? 'bg-[#FFD88A] text-[#5C1414] shadow-xs'
                        : 'text-[#E6C687] hover:text-white'
                    }`}
                    title={
                      sz === 'normal'
                        ? 'सामान्य आकार'
                        : sz === 'large'
                        ? 'बड़ा अक्षर (सुगम पाठ)'
                        : 'अति बड़ा अक्षर (वृद्धजनों हेतु - बिना चश्मे के)'
                    }
                  >
                    {sz === 'normal' ? 'अ' : sz === 'large' ? 'अ+' : 'अ++'}
                  </button>
                ))}
              </div>

              {/* Fullscreen / Zen Reading Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsZenMode(!isZenMode);
                  cooldownUntilRef.current = Date.now() + 500;
                }}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                  isZenMode
                    ? 'bg-[#FFD88A] text-[#5C1414] border-white'
                    : 'bg-[#5C1414] text-[#E6C687] border-[#B58738]/60 hover:text-white'
                }`}
                title={isZenMode ? 'सामान्य दृश्य पर लौटें' : 'पूर्ण स्क्रीन स्वाध्याय (पढ़ने हेतु अधिक स्थान)'}
              >
                {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{isZenMode ? 'छोटा' : 'पूर्ण स्क्रीन'}</span>
              </button>

              {activeTab === 'parchi' && (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
                    isEditing
                      ? 'bg-[#FFD88A] text-[#5C1414] border-white'
                      : 'bg-[#5C1414] text-[#FFD88A] border-[#B58738]/60 hover:bg-[#4A1010]'
                  }`}
                >
                  {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isEditing ? 'पूर्वावलोकन' : '✏️ पर्ची संपादन'}</span>
                  <span className="sm:hidden">{isEditing ? 'देखें' : 'संपादित'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 sm:p-1.5 rounded-lg text-[#E6C687] hover:text-white hover:bg-black/20 cursor-pointer"
                title="पर्ची बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Sub-Header Tabs & Quick Presets (Collapses smoothly on downward scroll) */}
        <div
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-10 ${
            !isChromeVisible || isZenMode
              ? 'max-h-0 opacity-0 pointer-events-none'
              : 'max-h-[160px] opacity-100'
          }`}
        >

          {/* View Switcher Tabs: 📜 पारंपरिक पर्ची vs 📖 यजमान विस्तृत मार्गदर्शन */}
          <div className="bg-[#FAF2E4] px-3 sm:px-6 pt-2 pb-1.5 border-b border-[#8C6239]/25 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                onClick={() => {
                  setActiveTab('parchi');
                  setIsChromeVisible(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'parchi'
                    ? 'bg-[#7A1D1D] text-[#FFD88A] shadow-sm'
                    : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDCC0]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📜 पारंपरिक उपाय पर्ची (Slip)</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                onClick={() => {
                  setActiveTab('guide');
                  setHighlightedItemIndex(null);
                  setIsChromeVisible(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer relative ${
                  activeTab === 'guide'
                    ? 'bg-[#7A1D1D] text-[#FFD88A] shadow-sm'
                    : 'bg-[#FFFDF8] text-[#7A1D1D] border border-[#8C6239]/40 hover:bg-[#F4E8D1]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>📖 यजमान विस्तृत मार्गदर्शन (क्यों व क्या लाभ?)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="विस्तृत कारण व लाभ उपलब्ध" />
              </motion.button>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={handleToggleUmaAudio}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs border ${
                  isPlayingAudio
                    ? 'bg-rose-700 text-white border-rose-800 animate-pulse'
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 text-[#7A1D1D] border-amber-400 hover:bg-amber-100'
                }`}
                title="विदुषी उमा जी के मधुर स्वर में लयबद्ध मंगलाचरण व उपाय पाठ सुनें"
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#7A1D1D]" />}
                <span>{isPlayingAudio ? 'स्वर पाठ रोकें' : '🎙️ सुरीला स्वर पाठ'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isPlayingAudio) {
                    stopUmaSpeech();
                    setIsPlayingAudio(false);
                  }
                  onClose();
                  if (onOpenVishnuSahasranama) {
                    onOpenVishnuSahasranama();
                  } else {
                    window.dispatchEvent(
                      new CustomEvent('navigate-to-tab', {
                        detail: { tab: 'vishnu_sahasranama' },
                      })
                    );
                  }
                }}
                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-amber-100 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                title="श्री विष्णु सहस्रनाम सम्पूर्ण पाठ खोलें"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>सहस्रनाम पाठ</span>
              </button>

              {activeTab === 'guide' && (
                <>
                  <button
                    type="button"
                    onClick={handleShareWhatsAppGuide}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                    title="WhatsApp पर विस्तृत विवरण भेजें"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyDetailedGuide}
                    className="px-2 py-1 bg-[#FFFDF8] hover:bg-[#EBDCC0] text-[#5C3A21] border border-[#8C6239]/40 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                    title="मार्गदर्शन कॉपी करें"
                  >
                    {copiedGuide ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedGuide ? 'कॉपी हुआ!' : 'कॉपी'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Mode Bar (For template presets & astrologer branding) */}
          {activeTab === 'parchi' && (
            <div className="bg-[#F4E8D1] px-4 py-2 border-b border-[#8C6239]/30 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsEditAstrologerModalOpen(true)}
                  className="px-2.5 py-1 bg-[#FFFDF8] text-[#7A1D1D] border border-[#8C6239]/40 rounded-md font-bold flex items-center gap-1 cursor-pointer hover:bg-[#EBDCC0] transition shadow-2xs"
                  title="लेटरहेड पर अपना नाम या विवरण लिखें"
                >
                  <Edit3 className="w-3 h-3 text-[#B56A00]" />
                  <span>{header.astrologerName?.trim() ? `नाम: ${header.astrologerName}` : '✏️ अपना / ज्योतिषी का नाम लिखें'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetFromKundali}
                  className="px-2.5 py-1 bg-[#7A1D1D] text-white rounded-md font-bold flex items-center gap-1 cursor-pointer hover:bg-[#5C1414] transition shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>कुण्डली अनुसार स्वतः उपाय रीसेट करें</span>
                </button>
              </div>

              <span className="text-[11px] text-[#7A1D1D] font-semibold">
                {isEditing ? 'आप किसी भी पंक्ति या नाम को बदल सकते हैं' : 'पारंपरिक ज्योतिषाचार्य लेटरहेड प्रारूप'}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleContentScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-[#EBDCC0]/60 relative"
        >
          {/* TAB 1: PARCHI VIEW */}
          {activeTab === 'parchi' && (
            <>
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
                        placeholder="उदा. पं. शास्त्री जी / आपका शुभ नाम"
                        className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#5C3A21] mb-1">शैक्षणिक योग्यता (Degree):</label>
                      <input
                        type="text"
                        value={header.qualification}
                        onChange={(e) => saveHeaderChanges({ ...header, qualification: e.target.value })}
                        placeholder="उदा. M.A. (संस्कृत), ज्योतिषाचार्य"
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
                        placeholder="उदा. 98XXXXXXXX"
                        className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-[#2C0A0A]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#5C3A21] mb-1">पता / नगर (Address):</label>
                      <input
                        type="text"
                        value={header.address}
                        onChange={(e) => saveHeaderChanges({ ...header, address: e.target.value })}
                        placeholder="उदा. काशी / उज्जैन / आपका नगर"
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

              {/* Informative Guidance Banner */}
              <div
                onClick={() => setActiveTab('guide')}
                className="mx-auto max-w-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between text-xs text-[#5C3A21] cursor-pointer hover:bg-amber-100/80 transition shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌟</span>
                  <div>
                    <h5 className="font-bold text-[#7A1D1D] text-xs sm:text-sm">
                      यजमान को समझाने हेतु: प्रत्येक उपाय क्यों करना है और क्या लाभ होगा?
                    </h5>
                    <p className="text-[11px] text-[#5C3A21]">
                      {points[0] || 'रत्न धारण'}, दान सामग्री का प्रभाव व {parchiData.detectedDoshaYoga || 'ग्रह शान्ति'} की संपूर्ण शास्त्रीय विधि देखने के लिए यहाँ क्लिक करें।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-[#7A1D1D] text-[#FFD88A] rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <span>विस्तृत देखें</span>
                  <BookOpen className="w-3 h-3" />
                </button>
              </div>

              {/* DYNAMIC ASTROLOGICAL CALCULATION RATIONALE BOX */}
              {parchiData.astrologicalCalculationSummary && (
                <div className="mx-auto max-w-2xl bg-[#FFFDF8] border border-[#B58738]/50 rounded-xl p-3.5 text-xs text-[#5C3A21] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-2 flex-wrap gap-1">
                    <span className="font-bold text-[#7A1D1D] flex items-center gap-1.5 text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-[#B56A00]" />
                      <span>🔬 कुण्डली ग्रह गणना एवं ज्योतिषीय निर्णय आधार:</span>
                    </span>
                    <span className="text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ ग्रह स्पष्ट, बलाबल व भाव स्थिति से प्रत्यक्ष निष्पादित
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] pt-1">
                    <div className="bg-[#FAF2E4]/80 p-2.5 rounded-lg border border-[#8C6239]/15">
                      <div className="text-[10px] font-bold text-[#8B1E1E] uppercase">१. लग्नेश व शुभ कारक ग्रह (रत्न हेतु)</div>
                      <div className="font-bold text-[#3A1F0A] mt-0.5">
                        {parchiData.astrologicalCalculationSummary.beneficPlanets.join(' • ') || 'लग्नेश बलवान'}
                      </div>
                      <p className="text-[10.5px] text-[#5C3A21] mt-1 leading-snug">
                        {parchiData.astrologicalCalculationSummary.reasons.gemstoneReason}
                      </p>
                    </div>

                    <div className="bg-[#FAF2E4]/80 p-2.5 rounded-lg border border-[#8C6239]/15">
                      <div className="text-[10px] font-bold text-[#8B1E1E] uppercase">२. बाधक व पीड़ित ग्रह (उपवास व दान हेतु)</div>
                      <div className="font-bold text-[#3A1F0A] mt-0.5">
                        {parchiData.astrologicalCalculationSummary.afflictedPlanets.join(' • ') || 'ग्रह स्थिति सामान्य'}
                      </div>
                      <p className="text-[10.5px] text-[#5C3A21] mt-1 leading-snug">
                        {parchiData.astrologicalCalculationSummary.reasons.upvasReason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A1D1D] pt-1 border-t border-[#8C6239]/15 flex-wrap gap-2">
                    <span>
                      <strong>दशा प्रभाव:</strong> {parchiData.astrologicalCalculationSummary.dashaSummary}
                    </span>
                    <span>
                      <strong>प्रमुख योग/दोष:</strong> {parchiData.astrologicalCalculationSummary.keyYogaOrDosha}
                    </span>
                    {parchiData.astrologicalCalculationSummary.combustPlanets.length > 0 && (
                      <span className="text-amber-800 font-bold">
                        अस्त: {parchiData.astrologicalCalculationSummary.combustPlanets.join(', ')}
                      </span>
                    )}
                    {parchiData.astrologicalCalculationSummary.debilitatedPlanets.length > 0 && (
                      <span className="text-rose-800 font-bold">
                        नीच: {parchiData.astrologicalCalculationSummary.debilitatedPlanets.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* LIVE REALISTIC PRESCRIPTION PAD PREVIEW (Matches Classic Letterhead) */}
              <div className="mx-auto max-w-2xl bg-[#FFFDF9] border-2 border-[#8B1E1E] rounded-md shadow-xl p-4 sm:p-8 text-[#162C6A] relative overflow-hidden">
                {/* Top Letterhead Header */}
                <div className="grid grid-cols-3 items-start gap-2 pb-3 border-b-[3px] border-[#8B1E1E]">
                  {/* Top Left: Name, Degree, Title */}
                  <div className="text-left space-y-0.5">
                    {header.astrologerName?.trim() ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-lg sm:text-2xl font-bold text-[#8B1E1E] font-serif leading-tight">
                          {header.astrologerName}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setIsEditAstrologerModalOpen(true)}
                          className="px-1.5 py-0.5 text-[10px] sm:text-xs font-sans font-semibold bg-[#8B1E1E]/10 hover:bg-[#8B1E1E]/20 text-[#8B1E1E] rounded cursor-pointer transition inline-flex items-center gap-1"
                          title="नाम व पदवी बदलें"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>बदलें</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditAstrologerModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#8B1E1E]/10 hover:bg-[#8B1E1E]/20 text-[#8B1E1E] border border-dashed border-[#8B1E1E]/50 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition group"
                        title="यहाँ क्लिक कर अपना / ज्योतिषी का नाम लिखें"
                      >
                        <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                        <span>+ ज्योतिषी का नाम लिखें</span>
                      </button>
                    )}

                    {header.qualification?.trim() && (
                      <p className="text-xs sm:text-sm font-bold text-[#6E2020] font-serif">
                        {header.qualification}
                      </p>
                    )}
                    {header.designation?.trim() && (
                      <p className="text-xs sm:text-sm font-bold text-[#7A1C1C] font-serif">
                        {header.designation}
                      </p>
                    )}
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
                      Mo. {header.mobile?.trim() || '..............................'}
                    </p>
                    {header.address?.trim() ? (
                      <p className="text-xs sm:text-base font-bold text-[#6E2020] font-serif">
                        {header.address}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditAstrologerModalOpen(true)}
                        className="text-[11px] text-[#8C6239] hover:underline cursor-pointer"
                      >
                        + स्थान/शहर जोड़ें
                      </button>
                    )}
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
                    {points.map((pt, index) => {
                      const isVishnuRemedy = /विष्णु|सहस्रनाम/i.test(pt);
                      return (
                        <div
                          key={index}
                          className="space-y-1.5 border-b border-amber-900/10 pb-2.5"
                        >
                          <div className="flex items-start gap-2.5 sm:gap-3.5 text-base sm:text-xl font-bold text-[#162C6A] leading-snug">
                            <span className="text-lg sm:text-2xl text-[#162C6A] shrink-0 select-none">
                              {CIRCLED_NUMS[index] || `(${index + 1})`}
                            </span>
                            <span className="flex-1">{pt}</span>
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                              {isVishnuRemedy && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isPlayingAudio) {
                                      stopUmaSpeech();
                                      setIsPlayingAudio(false);
                                    }
                                    onClose();
                                    if (onOpenVishnuSahasranama) {
                                      onOpenVishnuSahasranama();
                                    } else {
                                      window.dispatchEvent(
                                        new CustomEvent('navigate-to-tab', {
                                          detail: { tab: 'vishnu_sahasranama' },
                                        })
                                      );
                                    }
                                  }}
                                  className="text-[11px] font-sans font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-400 rounded-md px-2 py-0.5 flex items-center gap-1 cursor-pointer transition active:scale-95 shadow-2xs"
                                  title="श्रीविष्णुसहस्रनाम सम्पूर्ण पाठ खोलें"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-700" />
                                  <span>पाठ खोलें</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setHighlightedItemIndex(index);
                                  setActiveTab('guide');
                                }}
                                className="text-[11px] font-sans font-semibold text-[#8B1E1E] bg-[#FAF2E4] hover:bg-[#F4E8D1] border border-[#8B1E1E]/30 rounded px-2 py-0.5 flex items-center gap-1 cursor-pointer transition shrink-0"
                                title="इस उपाय का कारण और लाभ जानें"
                              >
                                <Info className="w-3 h-3 text-[#B56A00]" />
                                <span className="text-[10px] font-semibold">कारण व लाभ</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

              {/* Bottom Quick Switcher Card */}
              <div className="text-center pt-2 flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className="px-4 py-2 bg-[#FFFDF8] hover:bg-[#FAF2E4] text-[#7A1D1D] border-2 border-[#8C6239]/50 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-[#B56A00]" />
                  <span>📖 सम्पूर्ण पर्ची का यजमान विस्तृत मार्गदर्शन देखें</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isPlayingAudio) {
                      stopUmaSpeech();
                      setIsPlayingAudio(false);
                    }
                    onClose();
                    if (onOpenVishnuSahasranama) {
                      onOpenVishnuSahasranama();
                    } else {
                      window.dispatchEvent(
                        new CustomEvent('navigate-to-tab', {
                          detail: { tab: 'vishnu_sahasranama' },
                        })
                      );
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-[#FFF9E6] border-2 border-amber-500/60 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition shadow-sm active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>🙏 श्रीविष्णुसहस्रनाम सम्पूर्ण पाठ खोलें</span>
                </button>
              </div>
            </>
          )}

          {/* TAB 2: DETAILED WHY & BENEFITS GUIDE FOR YAJMAN */}
          {activeTab === 'guide' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Identity Banner */}
              <div className="bg-[#FFFDF8] border-2 border-[#B58738] rounded-xl p-4 shadow-sm space-y-2 text-[#3E2714]">
                <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#7A1D1D] text-[#FFD88A] flex items-center justify-center font-bold text-sm">
                      卐
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm sm:text-base text-[#7A1D1D]">
                          {header.astrologerName?.trim() || 'वैदिक ज्योतिष परामर्श'} — उपाय पर्ची विस्तृत मार्गदर्शन
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsEditAstrologerModalOpen(true)}
                          className="px-2 py-0.5 bg-[#FAF2E4] hover:bg-[#EBDCC0] border border-[#8C6239]/40 rounded text-[11px] text-[#7A1D1D] font-bold cursor-pointer inline-flex items-center gap-1"
                          title="ज्योतिषी का नाम व पदवी बदलें"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>नाम बदलें</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[#7A1C1C]">
                        {[header.qualification?.trim(), header.designation?.trim(), header.address?.trim()].filter(Boolean).join(' • ') || 'शास्त्रीय मार्गदर्शन एवं उपाय विवरण'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('parchi')}
                    className="px-2.5 py-1 text-xs bg-[#FAF2E4] hover:bg-[#EBDCC0] border border-[#8C6239]/40 rounded-lg text-[#7A1D1D] font-bold cursor-pointer"
                  >
                    📜 पर्ची देखें
                  </button>
                </div>

                <div className="text-xs space-y-1">
                  <p>
                    <strong>यजमान:</strong> <span className="text-[#162C6A] font-bold">{salutation}</span> | <strong>क्र.:</strong> {serialNo} | <strong>दिनांक:</strong> {dateStr}
                  </p>
                  <p className="text-[#5C3A21]">
                    <strong>कुण्डली आधार:</strong> {activeKundali ? `${activeKundali.lagnaRashi} लग्न • ${activeKundali.moonRashi} राशि • ${activeKundali.nakshatra} नक्षत्र • ${activeKundali.mahadasha} महादशा` : 'तात्कालिक प्रश्न लग्न आधार'}
                  </p>
                  <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    💡 <strong>यजमान के लिए शास्त्रीय निर्देश:</strong> नीचे आपकी पर्ची में लिखे प्रत्येक उपाय का वास्तविक ज्योतिषीय कारण (यह उपाय क्यों करना है), मिलने वाले प्रत्यक्ष लाभ, एवं धारण/दान/पूजा की प्रामाणिक शास्त्रीय विधि दी गई है।
                  </p>
                </div>
              </div>

              {/* SPECIAL HIGHLIGHT CARD: GRAHAN YOG DEEP DIVE (If Grahan Yog is active or in slip) */}
              {currentGrahanDeep && (
                <div className="bg-gradient-to-br from-[#FFF9F0] via-[#FFF3E0] to-[#FFE8CC] border-2 border-amber-600 rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5">
                  <div className="flex items-start justify-between gap-2 border-b border-amber-400/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔱</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base sm:text-lg text-[#7A1D1D]">
                            {currentGrahanDeep.grahanTypeLabel}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              currentGrahanDeep.severity === 'अत्यधिक तीव्र'
                                ? 'bg-rose-700 text-white animate-pulse'
                                : currentGrahanDeep.severity === 'तीव्र'
                                ? 'bg-amber-700 text-white'
                                : 'bg-emerald-700 text-white'
                            }`}
                          >
                            तीव्रता: {currentGrahanDeep.severity}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C3A21] font-semibold">
                          स्थिति: {currentGrahanDeep.houseName} ({currentGrahanDeep.rashi} राशि) • {currentGrahanDeep.severityDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Why this Shanti is needed */}
                  <div className="bg-white/80 rounded-xl p-3 border border-amber-300 text-xs sm:text-sm text-[#3E2714] space-y-1.5 shadow-2xs">
                    <h5 className="font-bold text-[#7A1D1D] flex items-center gap-1.5 text-xs sm:text-sm">
                      <span>❓ यह ग्रहण योग शान्ति क्यों आवश्यक है? (ज्योतिषीय कारण):</span>
                    </h5>
                    <p className="leading-relaxed whitespace-pre-line text-[#4A2610]">
                      {currentGrahanDeep.whyReason}
                    </p>
                  </div>

                  {/* What Benefits will occur */}
                  <div className="bg-white/80 rounded-xl p-3 border border-amber-300 text-xs sm:text-sm text-[#3E2714] space-y-2 shadow-2xs">
                    <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs sm:text-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>🌟 इस शान्ति अनुष्ठान से क्या-क्या प्रत्यक्ष लाभ होंगे?</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {currentGrahanDeep.whatBenefits.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-1.5 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="text-[#2C0A0A] font-semibold">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6-Step Vedic Shanti Vidhi */}
                  <div className="bg-white/90 rounded-xl p-3 sm:p-4 border-2 border-amber-500/60 text-xs space-y-2.5 shadow-2xs">
                    <h5 className="font-bold text-[#7A1D1D] flex items-center gap-1.5 text-xs sm:text-sm border-b border-amber-200 pb-1">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span>📿 प्रामाणिक ६-चरणीय वैदिक शान्ति विधान:</span>
                    </h5>
                    <div className="space-y-2">
                      {currentGrahanDeep.sixStepVidhi.map((step) => (
                        <div key={step.stepNo} className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#7A1D1D] text-[#FFD88A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {step.stepNo}
                          </span>
                          <div className="space-y-0.5">
                            <strong className="text-[#7A1D1D] text-xs sm:text-sm">{step.stepName}</strong>
                            <p className="text-[11px] sm:text-xs text-[#4A2610] leading-relaxed">
                              {step.stepVidhi}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kaliyuga Mantra Counts Table */}
                  <div className="bg-white/90 rounded-xl p-3 border border-amber-300 text-xs space-y-2 shadow-2xs">
                    <h5 className="font-bold text-[#7A1D1D] text-xs flex items-center gap-1">
                      <span>📜 कलियुग चतुर्गुण शास्त्रीय जप संख्या तालिका (निर्णयसिंधु अनुसार):</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {currentGrahanDeep.recommendedJapa.map((rj, rjIdx) => (
                        <div key={rjIdx} className="bg-[#FAF2E4] p-2 rounded-lg border border-[#8C6239]/30">
                          <div className="flex items-center justify-between font-bold text-[#7A1D1D]">
                            <span>{rj.planet}</span>
                            <span className="text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                              {rj.count}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-[#162C6A] mt-1 break-all">
                            {rj.mantra}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Numbered Detailed Cards for Each Remedy Point on the Slip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#7A1D1D] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B56A00]" />
                    <span>पर्ची के प्रत्येक उपाय का पृथक विश्लेषण एवं लाभ:</span>
                  </h4>
                  <span className="text-[11px] text-[#5C3A21]">कुल {currentDetailedItems.length} उपाय</span>
                </div>

                {currentDetailedItems.map((item, idx) => {
                  const isExpanded = expandedCardIndices.includes(idx);
                  const isHighlighted = highlightedItemIndex === idx;

                  return (
                    <div
                      key={idx}
                      id={`guide-item-${idx}`}
                      className={`bg-[#FFFDF8] rounded-xl border-2 transition-all shadow-xs overflow-hidden ${
                        isHighlighted
                          ? 'border-[#7A1D1D] ring-2 ring-[#7A1D1D]/30 shadow-md'
                          : 'border-[#8C6239]/35 hover:border-[#8C6239]/60'
                      }`}
                    >
                      {/* Card Header Accordion */}
                      <div
                        onClick={() => toggleCardExpansion(idx)}
                        className="p-3 sm:p-3.5 bg-gradient-to-r from-[#FAF2E4] to-[#F4E8D1] flex items-center justify-between cursor-pointer select-none border-b border-[#8C6239]/20"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base sm:text-lg font-bold text-[#7A1D1D] w-6 shrink-0">
                            {item.bullet}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-xs sm:text-sm text-[#162C6A]">
                                {item.title}
                              </h5>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FFFDF8] text-[#7A1D1D] border border-[#8C6239]/30 rounded-full">
                                {item.categoryLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#7A1D1D] font-semibold">
                            {isExpanded ? 'संक्षिप्त करें' : 'विस्तार देखें'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#7A1D1D]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#7A1D1D]" />
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      {isExpanded && (
                        <div className="p-3 sm:p-4 space-y-3 text-xs sm:text-sm text-[#3E2714] bg-[#FFFDF8]">
                          {/* 1. Why Reason */}
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-1">
                            <h6 className="font-bold text-[#7A1D1D] flex items-center gap-1.5 text-xs">
                              <span>❓ यह उपाय क्यों करें? (शास्त्रीय व कुण्डली कारण):</span>
                            </h6>
                            <p className="text-xs sm:text-sm text-[#4A2610] leading-relaxed whitespace-pre-line">
                              {item.whyReason}
                            </p>
                          </div>

                          {/* 2. What Benefits */}
                          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 space-y-1.5">
                            <h6 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                              <ShieldCheck className="w-4 h-4 text-emerald-700" />
                              <span>🌟 इस उपाय से क्या-क्या प्रत्यक्ष लाभ होंगे?</span>
                            </h6>
                            <div className="space-y-1 pl-1">
                              {item.benefits.map((b, bIdx) => (
                                <div key={bIdx} className="flex items-start gap-1.5 text-xs">
                                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                                  <span className="text-[#2C0A0A] font-semibold">{b}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3. Authentic Vidhi */}
                          <div className="bg-[#FAF2E4]/80 border border-[#8C6239]/30 rounded-xl p-3 space-y-1 text-xs">
                            <h6 className="font-bold text-[#7A1D1D] flex items-center gap-1.5">
                              <span>📿 प्रामाणिक शास्त्रीय विधि एवं नियम:</span>
                            </h6>
                            <p className="text-xs text-[#3E2714] leading-relaxed whitespace-pre-line">
                              {item.vidhi}
                            </p>

                            {item.samagri && (
                              <p className="pt-1.5 text-[11px] text-[#5C3A21]">
                                <strong>सामग्री:</strong> {item.samagri}
                              </p>
                            )}
                            {item.precautions && (
                              <p className="text-[11px] text-amber-900 bg-amber-100/60 p-1.5 rounded mt-1 border border-amber-200">
                                <strong>⚠️ विशेष सावधानी:</strong> {item.precautions}
                              </p>
                            )}

                            {/विष्णु|सहस्रनाम/i.test(`${item.title} ${item.vidhi} ${item.whyReason}`) && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 rounded-xl border border-amber-300 flex items-center justify-between gap-2.5 flex-wrap shadow-2xs">
                                <div className="flex items-center gap-2 text-xs text-[#7A1D1D] font-bold">
                                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span>श्रीविष्णुसहस्रनाम स्तोत्रम् (पूर्वपीठिका, ध्यानम्, १०८ मूल श्लोक, १००० दिव्य नाम व फलश्रुति)</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isPlayingAudio) {
                                      stopUmaSpeech();
                                      setIsPlayingAudio(false);
                                    }
                                    onClose();
                                    if (onOpenVishnuSahasranama) {
                                      onOpenVishnuSahasranama();
                                    } else {
                                      window.dispatchEvent(
                                        new CustomEvent('navigate-to-tab', {
                                          detail: { tab: 'vishnu_sahasranama' },
                                        })
                                      );
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-[#7A1D1D] hover:bg-[#5C1414] text-[#FFD88A] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs active:scale-95"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>📖 संपूर्ण पाठ व श्रवण खोलें</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons in Guide */}
              <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#8C6239]/40 flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleShareWhatsAppGuide}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>📲 यजमान को WhatsApp पर विस्तृत विवरण भेजें</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDetailedGuide}
                    className="px-3 py-2 bg-[#FFFDF8] hover:bg-[#EBDCC0] text-[#5C3A21] border border-[#8C6239]/40 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedGuide ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedGuide ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('parchi')}
                    className="px-3.5 py-2 bg-[#7A1D1D] hover:bg-[#5C1414] text-[#FFD88A] rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
                  >
                    📜 वापस पर्ची देखें
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Auto-collapsible on Scroll to give full reading space) */}
        <div
          className={`shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            !isChromeVisible || isZenMode
              ? 'max-h-0 opacity-0 py-0 border-t-0 pointer-events-none'
              : 'max-h-40 opacity-100'
          }`}
        >
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
                    <span>पर्ची टेक्स्ट कॉपी</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'parchi') {
                    setActiveTab('guide');
                  } else {
                    setActiveTab('parchi');
                  }
                }}
                className="px-3 py-2 bg-[#FFFDF8] hover:bg-[#EBDCC0] text-[#7A1D1D] border border-[#8C6239]/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              >
                <BookOpen className="w-4 h-4 text-[#B56A00]" />
                <span>{activeTab === 'parchi' ? '📖 यजमान विस्तृत मार्गदर्शन' : '📜 पारंपरिक पर्ची'}</span>
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
                <span>📲 WhatsApp पर्ची</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Bottom Reveal Pill (Shown when Header & Footer are auto-hidden) */}
        {(!isChromeVisible || isZenMode) && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 bg-[#5C1414]/95 text-[#FFD88A] border-2 border-[#B58738] rounded-full px-3 py-1.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
            <button
              type="button"
              onClick={() => {
                setIsChromeVisible(true);
                setIsZenMode(false);
                cooldownUntilRef.current = Date.now() + 600;
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#FFD88A] hover:text-white px-2 py-0.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              title="मेनू, डाउनलोड व हेडर फिर से दिखाएं"
            >
              <Eye className="w-3.5 h-3.5 text-[#E6C687]" />
              <span>मेनू व डाउनलोड दिखाएं</span>
            </button>

            <div className="h-4 w-px bg-[#B58738]/50" />

            <div className="flex items-center gap-0.5" title="अक्षर का आकार (सुगम फॉन्ट)">
              {(['normal', 'large', 'xlarge'] as AppFontSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleUpdateFontSize(sz)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                    fontSize === sz
                      ? 'bg-[#FFD88A] text-[#5C1414] font-extrabold'
                      : 'text-[#E6C687] hover:bg-white/10'
                  }`}
                  title={
                    sz === 'normal'
                      ? 'सामान्य आकार'
                      : sz === 'large'
                      ? 'बड़ा आकार'
                      : 'अति बड़ा आकार (वृद्धजनों हेतु)'
                  }
                >
                  {sz === 'normal' ? 'अ' : sz === 'large' ? 'अ+' : 'अ++'}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-[#B58738]/50" />

            <button
              type="button"
              onClick={handleCloseModal}
              className="p-1 rounded-full text-[#E6C687] hover:text-white hover:bg-white/10 cursor-pointer"
              title="पर्ची बंद करें"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* HD PNG Download & Save Preview Modal (100% Reliable for Android, Mobile WebViews, iOS & PC) */}
      {previewModalOpen && generatedImageUrl && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-lg max-h-[95dvh] flex flex-col shadow-2xl overflow-hidden">
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
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 flex flex-col items-center select-auto">
              {/* Status or instruction banner */}
              {downloadSuccess ? (
                <div className="w-full bg-emerald-50 border border-emerald-400 rounded-xl p-2.5 mb-3 text-xs text-emerald-900 flex items-center gap-2 shadow-xs animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <strong>डाउनलोड प्रारंभ हो गया है!</strong> अपने फोन के 'Downloads' फोल्डर या नोटिफिकेशन बार में देखें।
                  </div>
                </div>
              ) : (
                <div className="w-full bg-amber-50/95 border border-amber-300 rounded-xl p-2.5 mb-3 text-xs text-[#5C3A21] space-y-1 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#7A1D1D]">
                    <span>📱</span>
                    <span>मोबाइल में सहेजने के आसान विकल्प:</span>
                  </div>
                  <ul className="text-[11px] space-y-0.5 pl-5 list-disc text-[#4A2610]">
                    <li><strong>विकल्प १:</strong> नीचे '📥 फोन में सेव करें' बटन दबाएं।</li>
                    <li><strong>विकल्प २:</strong> '📲 गैलरी / शेयर' दबाकर सीधे WhatsApp या Photos में सहेजें।</li>
                    <li><strong>विकल्प ३:</strong> नीचे दिख रही पर्ची पर <strong>२ सेकंड उंगली दबाकर रखें (Long-press)</strong> और <strong>'Download image' (छवि डाउनलोड करें)</strong> चुनें।</li>
                  </ul>
                </div>
              )}

              {/* HD Image Preview with Full Touch & Long-press Support */}
              <div
                className="relative border-2 border-[#8C6239]/50 rounded-xl overflow-hidden shadow-lg max-h-[50vh] flex items-center justify-center bg-[#FAF6EE] select-auto"
                style={{ WebkitTouchCallout: 'default', userSelect: 'auto' }}
              >
                <img
                  src={generatedImageUrl}
                  alt="ज्योतिषीय उपाय पर्ची"
                  draggable={true}
                  className="w-auto h-auto max-h-[50vh] max-w-full object-contain cursor-pointer select-auto"
                  style={{
                    WebkitTouchCallout: 'default',
                    WebkitUserSelect: 'auto',
                    userSelect: 'auto',
                    touchAction: 'auto',
                    pointerEvents: 'auto',
                  }}
                  title="लंबा दबाकर (Long-press) छवि सहेजें"
                />
              </div>

              <p className="text-[10px] text-[#7A1D1D]/75 mt-2 text-center">
                💡 पर्ची पर लंबा दबाकर (Long-press) सीधे अपने फोन में सेव कर सकते हैं।
              </p>
            </div>

            {/* Action Buttons */}
            <div className="bg-[#F4E8D1] px-3 sm:px-4 py-3 border-t border-[#8C6239]/30 flex items-center justify-between gap-2 flex-wrap">
              {/* Button 1: Native Phone Download */}
              <button
                type="button"
                onClick={() => {
                  const safeSal = (salutation || 'Yajaman')
                    .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
                    .substring(0, 25);
                  triggerNativeDownload(generatedImageUrl, `Upay_Parchi_${safeSal}.png`);
                }}
                className="flex-1 min-w-[130px] py-2.5 px-3 bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] hover:from-[#5C1414] hover:to-[#3E0A0A] text-[#FFD88A] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition text-center"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>सेव हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>📥 फोन में सेव करें</span>
                  </>
                )}
              </button>

              {/* Button 2: Native Share & Save to Gallery / WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  const safeSal = (salutation || 'Yajaman')
                    .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
                    .substring(0, 25);
                  handleShareOrSaveToGallery(generatedImageUrl, `Upay_Parchi_${safeSal}.png`);
                }}
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                title="फोन की गैलरी या WhatsApp पर भेजें"
              >
                <Share2 className="w-4 h-4" />
                <span>📲 गैलरी / शेयर</span>
              </button>

              {/* Button 3: In-app Fullscreen Lightbox Zoom */}
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="py-2.5 px-2.5 bg-[#FFFDF8] hover:bg-[#EBDCC0] text-[#7A1D1D] border border-[#8C6239]/40 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1 cursor-pointer transition"
                title="पूरी स्क्रीन पर बड़ी छवि देखें"
              >
                <ZoomIn className="w-4 h-4" />
                <span className="text-xs font-semibold">बड़ा रूप</span>
              </button>

              {/* Button 4: Close Modal */}
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="py-2.5 px-3 bg-[#E6D7BC] hover:bg-[#D9C6A5] text-[#5C3A21] rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition"
              >
                पूर्ण / बंद
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Astrologer / Shastri Details Edit Modal */}
      {isEditAstrologerModalOpen && (
        <div
          className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 select-none animate-in fade-in duration-150"
          onClick={() => setIsEditAstrologerModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#FFFDF8] border-2 border-[#8C6239] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7A1D1D] to-[#9C2828] text-[#FFD88A] px-4 py-3 flex items-center justify-between border-b border-[#B58738]/40">
              <div className="flex items-center gap-2">
                <span className="text-xl">卐</span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    ज्योतिषी / आचार्य लेटरहेड विवरण
                  </h3>
                  <p className="text-[11px] text-[#F3E2C4]/80">
                    यहाँ अपना नाम व परिचय लिखें, यह पर्ची में सहेजा जाएगा
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditAstrologerModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-4 space-y-3.5 text-xs overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block font-bold text-[#5C3A21] mb-1">
                  ज्योतिषी / आचार्य का नाम:
                </label>
                <input
                  type="text"
                  value={header.astrologerName}
                  onChange={(e) => saveHeaderChanges({ ...header, astrologerName: e.target.value })}
                  placeholder="उदा. पं. शास्त्री जी / आपका शुभ नाम"
                  className="w-full bg-[#FAF2E4] border border-[#8C6239]/50 rounded-lg px-3 py-2 text-[#2C0A0A] font-bold text-sm focus:outline-[#8B1E1E]"
                  autoFocus
                />
                <p className="text-[10px] text-[#8C6239] mt-1">
                  यदि नाम खाली रखेंगे तो पर्ची पर खाली डॉटेड लाइन (पं. ............................) रहेगी।
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#5C3A21] mb-1">
                  उपाधि / पदवी (Designation):
                </label>
                <input
                  type="text"
                  value={header.designation}
                  onChange={(e) => saveHeaderChanges({ ...header, designation: e.target.value })}
                  placeholder="उदा. ज्योतिषाचार्य, वास्तुविद एवं याज्ञिक"
                  className="w-full bg-[#FAF2E4] border border-[#8C6239]/50 rounded-lg px-3 py-2 text-[#2C0A0A] focus:outline-[#8B1E1E]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C3A21] mb-1">
                  शैक्षणिक योग्यता (Degree / Qualification):
                </label>
                <input
                  type="text"
                  value={header.qualification}
                  onChange={(e) => saveHeaderChanges({ ...header, qualification: e.target.value })}
                  placeholder="उदा. M.A. (संस्कृत), ज्योतिष अलंकार"
                  className="w-full bg-[#FAF2E4] border border-[#8C6239]/50 rounded-lg px-3 py-2 text-[#2C0A0A] focus:outline-[#8B1E1E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#5C3A21] mb-1">
                    मोबाइल नंबर (Mo.):
                  </label>
                  <input
                    type="text"
                    value={header.mobile}
                    onChange={(e) => saveHeaderChanges({ ...header, mobile: e.target.value })}
                    placeholder="उदा. 98XXXXXXXX"
                    className="w-full bg-[#FAF2E4] border border-[#8C6239]/50 rounded-lg px-3 py-2 text-[#2C0A0A] focus:outline-[#8B1E1E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C3A21] mb-1">
                    स्थान / नगर (Address):
                  </label>
                  <input
                    type="text"
                    value={header.address}
                    onChange={(e) => saveHeaderChanges({ ...header, address: e.target.value })}
                    placeholder="उदा. काशी / उज्जैन / आपका नगर"
                    className="w-full bg-[#FAF2E4] border border-[#8C6239]/50 rounded-lg px-3 py-2 text-[#2C0A0A] focus:outline-[#8B1E1E]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#FAF2E4] px-4 py-3 border-t border-[#8C6239]/30 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  saveHeaderChanges({
                    ...header,
                    astrologerName: '',
                    qualification: '',
                    address: '',
                  });
                }}
                className="text-[11px] text-[#7A1D1D] hover:underline font-semibold cursor-pointer"
              >
                नाम खाली करें
              </button>

              <button
                type="button"
                onClick={() => setIsEditAstrologerModalOpen(false)}
                className="px-4 py-2 bg-[#7A1D1D] hover:bg-[#5C1414] text-[#FFD88A] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>विवरण सहेजें व लागू करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox View (100% In-app, zero navigation) */}
      {isZoomed && generatedImageUrl && (
        <div
          className="fixed inset-0 z-[180] bg-black/95 flex flex-col items-center justify-between p-3 select-auto animate-in fade-in duration-150"
          onClick={() => setIsZoomed(false)}
        >
          <div className="w-full max-w-lg flex items-center justify-between text-white p-2">
            <span className="text-xs text-amber-200">
              📱 छवि पर २ सेकंड दबाकर रखें (Long-press) और 'Download image' चुनें
            </span>
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="flex-1 flex items-center justify-center w-full max-h-[82vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={generatedImageUrl}
              alt="ज्योतिषीय उपाय पर्ची"
              draggable={true}
              className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl select-auto"
              style={{
                WebkitTouchCallout: 'default',
                WebkitUserSelect: 'auto',
                userSelect: 'auto',
                touchAction: 'auto',
                pointerEvents: 'auto',
              }}
            />
          </div>

          <div className="p-2 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const safeSal = (salutation || 'Yajaman')
                  .replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')
                  .substring(0, 25);
                triggerNativeDownload(generatedImageUrl, `Upay_Parchi_${safeSal}.png`);
              }}
              className="px-4 py-2 bg-[#8C6239] hover:bg-[#6A4825] text-amber-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>डाउनलोड करें</span>
            </button>
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              वापस जाएं
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
