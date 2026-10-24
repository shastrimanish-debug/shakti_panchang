import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Award,
  Smartphone,
  Square,
  Palette,
} from 'lucide-react';
import { getAstrologerBranding, AstrologerBranding } from '../services/storage';
import { shareImageFile, shareTextContent } from '../lib/shareHelper';
import { saveImageNative } from '../lib/device';

export interface ShlokaPosterData {
  headerKicker?: string; // e.g., "॥ श्रीमद्भगवद्गीता • अध्याय २, श्लोक ४७ ॥"
  reference?: string; // alias for headerKicker / verse reference
  title: string; // e.g., "कर्मयोग का शाश्वत सिद्धांत" or "श्री दुर्गा सप्तशती"
  sanskrit: string; // Main Sanskrit / Chaupai / Mantra text
  transliteration?: string;
  meaning: string; // Hindi / English / Gujarati Bhavartha
  sourceLabel?: string; // e.g., "उपनिषद् स्वाध्याय • ईशावास्योपनिषद्"
  accentTag?: string; // alias for extraBadge / source badge
  speaker?: string; // optional speaker / rishi
  extraBadge?: string; // e.g., "36 में से 28.5 गुण प्राप्त • अति उत्तम मिलान"
}

interface ShlokaPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShlokaPosterData | null;
  onOpenBrandingModal?: () => void;
}

type PosterFormat = 'status_9_16' | 'post_4_5';
type PosterTheme = 'bhojpatra' | 'kesariya' | 'tamra';

function dataURItoBlob(dataURI: string): Blob {
  const parts = dataURI.split(',');
  const byteString = atob(parts[1] || parts[0]);
  const mimeString = parts[0].includes(':')
    ? parts[0].split(':')[1].split(';')[0]
    : 'image/png';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

function safeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }
}

function wrapCanvasParagraphs(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const rawLines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const lines: string[] = [];

  for (const rawLine of rawLines) {
    const words = rawLine.split(/\s+/);
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export const ShlokaPosterModal: React.FC<ShlokaPosterModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenBrandingModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [format, setFormat] = useState<PosterFormat>('status_9_16');
  const [posterTheme, setPosterTheme] = useState<PosterTheme>('bhojpatra');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [branding, setBranding] = useState<AstrologerBranding>(() =>
    getAstrologerBranding()
  );

  useEffect(() => {
    if (isOpen) {
      setBranding(getAstrologerBranding());
    }
  }, [isOpen]);

  const generatePosterCanvas = useCallback(() => {
    if (!data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    const W = 1080;
    const H = format === 'status_9_16' ? 1920 : 1350;
    canvas.width = W;
    canvas.height = H;

    // Theme palettes
    const palettes = {
      bhojpatra: {
        bgStart: '#FAF3E3',
        bgMid: '#F4E5C8',
        bgEnd: '#E7D1AA',
        outerBorder: '#8B1E1E',
        innerBorder: '#B45309',
        headerBg1: '#6E1409',
        headerBg2: '#4A0E0E',
        headerText: '#FFE49E',
        kickerColor: '#8B1E1E',
        cardBg: '#FFFDF8',
        cardBorder: '#D4A359',
        sanskritColor: '#4A0E0E',
        meaningBg: '#FFF7E8',
        meaningBorder: '#C8892D',
        meaningTitle: '#8B1E1E',
        meaningText: '#1F1006',
        footerBg1: '#4A0E0E',
        footerBg2: '#2C0808',
        footerGold: '#FFD88A',
        footerCream: '#FFFDF9',
      },
      kesariya: {
        bgStart: '#FFF7ED',
        bgMid: '#FFEDD5',
        bgEnd: '#FED7AA',
        outerBorder: '#9A3412',
        innerBorder: '#D97706',
        headerBg1: '#9A3412',
        headerBg2: '#7C2D12',
        headerText: '#FEF08A',
        kickerColor: '#9A3412',
        cardBg: '#FFFFFF',
        cardBorder: '#EA580C',
        sanskritColor: '#7C2D12',
        meaningBg: '#FFFBEB',
        meaningBorder: '#D97706',
        meaningTitle: '#9A3412',
        meaningText: '#2A1205',
        footerBg1: '#7C2D12',
        footerBg2: '#431407',
        footerGold: '#FDE047',
        footerCream: '#FFFDF9',
      },
      tamra: {
        bgStart: '#1C0D06',
        bgMid: '#2A140A',
        bgEnd: '#140904',
        outerBorder: '#D97706',
        innerBorder: '#F59E0B',
        headerBg1: '#7C2D12',
        headerBg2: '#451A03',
        headerText: '#FDE68A',
        kickerColor: '#FBBF24',
        cardBg: '#29150C',
        cardBorder: '#B45309',
        sanskritColor: '#FEF3C7',
        meaningBg: '#1F0F08',
        meaningBorder: '#92400E',
        meaningTitle: '#FBBF24',
        meaningText: '#F5E6D3',
        footerBg1: '#3B180C',
        footerBg2: '#1C0A04',
        footerGold: '#FCD34D',
        footerCream: '#FFFBEB',
      },
    };

    const pal = palettes[posterTheme];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, pal.bgStart);
    bgGrad.addColorStop(0.5, pal.bgMid);
    bgGrad.addColorStop(1, pal.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle Mandala / Radial Halo at center top
    const haloGrad = ctx.createRadialGradient(W / 2, H * 0.28, 30, W / 2, H * 0.28, 520);
    haloGrad.addColorStop(
      0,
      posterTheme === 'tamra'
        ? 'rgba(245, 158, 11, 0.14)'
        : 'rgba(217, 119, 6, 0.12)'
    );
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Ornate Double Vedic Frame
    ctx.strokeStyle = pal.outerBorder;
    ctx.lineWidth = 8;
    ctx.strokeRect(26, 26, W - 52, H - 52);

    ctx.strokeStyle = pal.innerBorder;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // Corner Medallions
    const drawCorner = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = pal.outerBorder;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pal.innerBorder;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(54, 54);
    drawCorner(W - 54, 54);
    drawCorner(54, H - 54);
    drawCorner(W - 54, H - 54);

    // 3. Top Sacred Invocation
    const topY = format === 'status_9_16' ? 98 : 84;
    ctx.textAlign = 'center';
    ctx.fillStyle = pal.kickerColor;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('॥ ॐ श्री परमात्मने नमः ॥', W / 2, topY);

    // 4. Royal Header Banner
    const bannerY = topY + 26;
    const bannerH = format === 'status_9_16' ? 96 : 82;
    const headerGrad = ctx.createLinearGradient(90, bannerY, W - 90, bannerY + bannerH);
    headerGrad.addColorStop(0, pal.headerBg1);
    headerGrad.addColorStop(0.5, pal.headerBg2);
    headerGrad.addColorStop(1, pal.headerBg1);
    ctx.fillStyle = headerGrad;
    ctx.beginPath();
    safeRoundRect(ctx, 84, bannerY, W - 168, bannerH, 22);
    ctx.fill();
    ctx.strokeStyle = pal.innerBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = pal.headerText;
    ctx.font = 'bold 34px serif';
    const cleanTitle = data.title.length > 40 ? `${data.title.slice(0, 38)}…` : data.title;
    ctx.fillText(cleanTitle, W / 2, bannerY + bannerH / 2 + 12);

    // 5. Subtitle / Scripture Kicker
    let headerBottomY = bannerY + bannerH + (format === 'status_9_16' ? 46 : 38);
    const kickerText = data.headerKicker || data.reference || data.sourceLabel;
    if (kickerText) {
      ctx.fillStyle = pal.kickerColor;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(kickerText, W / 2, headerBottomY);
      headerBottomY += format === 'status_9_16' ? 40 : 30;
    }

    const badgeText = data.extraBadge || data.accentTag || (data.speaker ? `प्रवक्ता/ऋषि: ${data.speaker}` : '');
    if (badgeText) {
      ctx.fillStyle = pal.outerBorder;
      ctx.font = 'bold 25px sans-serif';
      ctx.fillText(badgeText, W / 2, headerBottomY);
      headerBottomY += format === 'status_9_16' ? 38 : 28;
    }

    // Pre-calculate Sanskrit & Meaning boxes so we can vertically balance the card
    const padX = 76;
    const boxW = W - padX * 2;
    const textMaxW = boxW - 88;
    const footerH = 215;
    const footerY = H - footerH - 58;

    const sanskritFontSize =
      data.sanskrit.length > 260
        ? 28
        : data.sanskrit.length > 160
        ? 33
        : format === 'status_9_16'
        ? 38
        : 35;
    ctx.font = `bold ${sanskritFontSize}px serif`;
    const sanskritLines = wrapCanvasParagraphs(ctx, data.sanskrit, textMaxW).slice(
      0,
      format === 'status_9_16' ? 11 : 7
    );
    const sanskritLineH = Math.round(sanskritFontSize * 1.5);
    const sanskritContentH =
      sanskritLines.length * sanskritLineH +
      (data.transliteration && format === 'status_9_16' ? 48 : 0);
    const sanskritBoxH = Math.max(
      format === 'status_9_16' ? 230 : 185,
      sanskritContentH + (format === 'status_9_16' ? 120 : 94)
    );

    const meaningFontSize =
      data.meaning.length > 320
        ? 25
        : data.meaning.length > 200
        ? 28
        : format === 'status_9_16'
        ? 31
        : 28;
    ctx.font = `bold ${meaningFontSize}px sans-serif`;
    const meaningLines = wrapCanvasParagraphs(ctx, data.meaning, textMaxW);
    const meaningLineH = Math.round(meaningFontSize * 1.48);
    const maxAllowedMeaningLines = format === 'status_9_16' ? 12 : 6;
    const visibleMeaningLines = meaningLines.slice(0, maxAllowedMeaningLines);
    const meaningContentH = visibleMeaningLines.length * meaningLineH;
    const meaningBoxH = Math.max(
      format === 'status_9_16' ? 220 : 175,
      meaningContentH + (format === 'status_9_16' ? 120 : 92)
    );

    const gapBetweenBoxes = format === 'status_9_16' ? 34 : 24;
    const availableZoneH = footerY - 28 - headerBottomY;
    const baseStackH = sanskritBoxH + gapBetweenBoxes + meaningBoxH;
    const leftoverH = availableZoneH - baseStackH;
    const showVedicBlessingCard = format === 'status_9_16' && leftoverH >= 150;
    const blessingCardH = showVedicBlessingCard ? 128 : 0;
    const totalStackH =
      baseStackH + (showVedicBlessingCard ? gapBetweenBoxes + blessingCardH : 0);

    let cursorY =
      headerBottomY + Math.max(8, Math.floor((availableZoneH - totalStackH) / 2));

    // 6. Main Sanskrit / Verse Manuscript Box
    ctx.fillStyle = pal.cardBg;
    ctx.beginPath();
    safeRoundRect(ctx, padX, cursorY, boxW, sanskritBoxH, 24);
    ctx.fill();
    ctx.strokeStyle = pal.cardBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = pal.kickerColor;
    ctx.font = 'bold 23px serif';
    ctx.fillText('✦ मूल पाठ / मुख्य विवरण ✦', W / 2, cursorY + 42);

    ctx.fillStyle = pal.sanskritColor;
    ctx.font = `bold ${sanskritFontSize}px serif`;
    const sanskritStartOffset = Math.max(
      88,
      Math.floor((sanskritBoxH - 46 - sanskritContentH) / 2) + 64
    );
    let sLineY = cursorY + sanskritStartOffset;
    for (const line of sanskritLines) {
      ctx.fillText(line, W / 2, sLineY);
      sLineY += sanskritLineH;
    }

    if (data.transliteration && format === 'status_9_16') {
      ctx.fillStyle = pal.kickerColor;
      ctx.font = 'italic 21px sans-serif';
      const trClean =
        data.transliteration.length > 95
          ? `${data.transliteration.slice(0, 92)}...`
          : data.transliteration;
      ctx.fillText(trClean, W / 2, sLineY + 12);
    }

    cursorY += sanskritBoxH + gapBetweenBoxes;

    // 7. Hindi / English Bhavartha (Meaning) Box — Sized naturally and centered
    ctx.fillStyle = pal.meaningBg;
    ctx.beginPath();
    safeRoundRect(ctx, padX, cursorY, boxW, meaningBoxH, 22);
    ctx.fill();
    ctx.strokeStyle = pal.meaningBorder;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = pal.meaningTitle;
    ctx.font = 'bold 25px sans-serif';
    ctx.fillText('॥ दिव्य भावार्थ एवं जीवन संदेश ॥', W / 2, cursorY + 44);

    ctx.fillStyle = pal.meaningText;
    ctx.font = `bold ${meaningFontSize}px sans-serif`;
    const meaningStartOffset = Math.max(
      92,
      Math.floor((meaningBoxH - 50 - meaningContentH) / 2) + 66
    );
    let mLineY = cursorY + meaningStartOffset;
    for (let i = 0; i < visibleMeaningLines.length; i++) {
      let lineStr = visibleMeaningLines[i];
      if (i === visibleMeaningLines.length - 1 && meaningLines.length > maxAllowedMeaningLines) {
        lineStr = `${lineStr.slice(0, Math.max(0, lineStr.length - 3))}...`;
      }
      ctx.fillText(lineStr, W / 2, mLineY);
      mLineY += meaningLineH;
    }

    cursorY += meaningBoxH + gapBetweenBoxes;

    // 7B. Optional Sacred Vedic Blessing Medallion in 9:16 mode when space permits
    if (showVedicBlessingCard) {
      ctx.fillStyle = pal.cardBg;
      ctx.beginPath();
      safeRoundRect(ctx, padX, cursorY, boxW, blessingCardH, 20);
      ctx.fill();
      ctx.strokeStyle = pal.innerBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = pal.kickerColor;
      ctx.font = 'bold 24px serif';
      ctx.fillText('॥ शुभमस्तु • कल्याणमस्तु • धर्मो रक्षति रक्षितः ॥', W / 2, cursorY + 52);

      ctx.fillStyle = pal.meaningText;
      ctx.font = 'bold 21px sans-serif';
      ctx.fillText(
        'सनातन वैदिक ज्योतिष एवं शास्त्र-सम्मत प्रमाणिक मार्गदर्शन',
        W / 2,
        cursorY + 92
      );
    }

    // 8. Footer Branding Card (Astrologer Custom Visiting Card OR Shakti Panchang Seal)

    const footGrad = ctx.createLinearGradient(padX, footerY, W - padX, footerY + footerH);
    footGrad.addColorStop(0, pal.footerBg1);
    footGrad.addColorStop(1, pal.footerBg2);
    ctx.fillStyle = footGrad;
    ctx.beginPath();
    safeRoundRect(ctx, padX, footerY, boxW, footerH, 22);
    ctx.fill();
    ctx.strokeStyle = pal.footerGold;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.textAlign = 'center';
    if (branding.enabled && branding.name) {
      ctx.fillStyle = pal.footerGold;
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('॥ वैदिक ज्योतिष, कुंडली एवं आध्यात्मिक परामर्श ॥', W / 2, footerY + 40);

      ctx.fillStyle = pal.footerCream;
      ctx.font = 'bold 35px sans-serif';
      ctx.fillText(branding.name, W / 2, footerY + 86);

      ctx.fillStyle = pal.footerGold;
      ctx.font = 'bold 23px sans-serif';
      ctx.fillText(branding.title || 'वैदिक ज्योतिषाचार्य', W / 2, footerY + 122);

      ctx.fillStyle = pal.footerCream;
      ctx.font = 'bold 24px sans-serif';
      const contactLine = [
        branding.phone ? `📞 ${branding.phone}` : '',
        branding.city ? `📍 ${branding.city}` : '',
        branding.sansthan ? `🏛️ ${branding.sansthan}` : '',
      ]
        .filter(Boolean)
        .join('   •   ');
      ctx.fillText(
        contactLine || 'सनातन शक्ति पंचांग',
        W / 2,
        footerY + 162
      );

      ctx.fillStyle = pal.footerGold;
      ctx.font = '19px sans-serif';
      ctx.fillText(
        branding.specialization
          ? `विशेषज्ञता: ${branding.specialization}`
          : 'सनातन शक्ति पंचांग • प्रामाणिक वैदिक ज्ञान एवं पंचांग',
        W / 2,
        footerY + 195
      );
    } else {
      ctx.fillStyle = pal.footerGold;
      ctx.font = 'bold 36px serif';
      ctx.fillText('सनातन शक्ति पंचांग', W / 2, footerY + 64);

      ctx.fillStyle = pal.footerCream;
      ctx.font = 'bold 23px sans-serif';
      ctx.fillText(
        'दैनिक पंचांग • शुभ चौघड़िया • कुंडली मिलान • प्राचीन ग्रन्थ स्वाध्याय',
        W / 2,
        footerY + 110
      );

      ctx.fillStyle = pal.footerGold;
      ctx.font = 'bold 22px serif';
      ctx.fillText(
        '॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥',
        W / 2,
        footerY + 154
      );

      ctx.fillStyle = pal.footerCream;
      ctx.font = '19px sans-serif';
      ctx.fillText(
        new Date().toLocaleDateString('hi-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        W / 2,
        footerY + 190
      );
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      setImageUri(dataUrl);
    } catch {
      // Ignore canvas security errors
    } finally {
      setIsGenerating(false);
    }
  }, [data, format, posterTheme, branding]);

  useEffect(() => {
    if (isOpen && data) {
      const timer = setTimeout(() => {
        generatePosterCanvas();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, data, generatePosterCanvas]);

  if (!isOpen || !data) return null;

  const getShareCaption = () => {
    let txt = `*${data.headerKicker || `॥ ${data.title} ॥`}*\n\n`;
    txt += `${data.sanskrit}\n\n`;
    txt += `*भावार्थ:* ${data.meaning}\n`;
    if (branding.enabled && branding.name) {
      txt += `──────────────────\n`;
      txt += `🙏 *सौजन्य:* ${branding.name} (${branding.title || 'वैदिक ज्योतिषी'})\n`;
      if (branding.phone) txt += `📞 ${branding.phone}\n`;
    } else {
      txt += `\n— *सनातन शक्ति पंचांग*`;
    }
    return txt;
  };

  const handleSharePoster = async () => {
    const caption = getShareCaption();
    const fileName = `Shakti-Status-Card-${Date.now()}.png`;
    if (imageUri) {
      await shareImageFile({
        imageUri,
        fileName,
        title: data.title,
        text: caption,
      });
    } else {
      await shareTextContent({
        title: data.title,
        text: caption,
      });
    }
  };

  const handleDownloadPoster = async () => {
    if (!imageUri) return;
    const fileName = `Shakti-Status-Card-${Date.now()}.png`;
    try {
      const savedNative = await saveImageNative(imageUri, fileName);
      if (savedNative) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
        return;
      }

      const blob = dataURItoBlob(imageUri);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 3000);
    } catch {
      const a = document.createElement('a');
      a.href = imageUri;
      a.download = fileName;
      a.click();
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(getShareCaption());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FAF3E3',
          color: '#1F1006',
          borderColor: '#8B1E1E',
        }}
        className="w-full max-w-md rounded-2xl border-2 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col my-auto"
      >
        {/* Modal Header (Always Visible) */}
        <div
          style={{
            backgroundColor: '#6E1409',
            color: '#FFFFFF',
            borderColor: '#D97706',
          }}
          className="shrink-0 flex items-center justify-between px-3.5 py-2.5 border-b"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 shrink-0" style={{ color: '#FDE047' }} />
            <div className="min-w-0">
              <h3
                className="font-granth font-bold text-sm sm:text-base truncate"
                style={{ color: '#FFFFFF' }}
              >
                HD स्टेटस एवं पोस्टर कार्ड
              </h3>
              <p className="text-[11px] truncate" style={{ color: '#FDE68A' }}>
                व्हाट्सएप स्टेटस, स्टोरी व ग्रुप्स के लिए सचित्र कार्ड
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: '#4A0E0E', color: '#FFFFFF' }}
            className="p-1.5 rounded-lg cursor-pointer shrink-0"
            aria-label="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format & Theme Controls (Always Visible) */}
        <div
          style={{
            backgroundColor: '#FFF8EB',
            borderColor: '#D6B892',
          }}
          className="shrink-0 px-3 py-2 border-b flex flex-wrap items-center justify-between gap-1.5"
        >
          {/* Size Toggle */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFormat('status_9_16')}
              style={
                format === 'status_9_16'
                  ? {
                      backgroundColor: '#8B1E1E',
                      color: '#FFFFFF',
                      borderColor: '#6E1409',
                    }
                  : {
                      backgroundColor: '#FFFFFF',
                      color: '#3A1405',
                      borderColor: '#C8A986',
                    }
              }
              className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>स्टेटस (9:16)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('post_4_5')}
              style={
                format === 'post_4_5'
                  ? {
                      backgroundColor: '#8B1E1E',
                      color: '#FFFFFF',
                      borderColor: '#6E1409',
                    }
                  : {
                      backgroundColor: '#FFFFFF',
                      color: '#3A1405',
                      borderColor: '#C8A986',
                    }
              }
              className="px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Square className="w-3.5 h-3.5" />
              <span>पोस्ट (4:5)</span>
            </button>
          </div>

          {/* Theme Swatches */}
          <div className="flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 mr-0.5" style={{ color: '#7C2D12' }} />
            {(
              [
                { id: 'bhojpatra', label: 'भोजपत्र' },
                { id: 'kesariya', label: 'केसरिया' },
                { id: 'tamra', label: 'ताम्र-रात्रि' },
              ] as const
            ).map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setPosterTheme(th.id)}
                style={
                  posterTheme === th.id
                    ? {
                        backgroundColor: '#5C1909',
                        color: '#FFFFFF',
                        borderColor: '#3A1405',
                      }
                    : {
                        backgroundColor: '#FFFFFF',
                        color: '#3A1405',
                        borderColor: '#C8A986',
                      }
                }
                className="px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer whitespace-nowrap"
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Poster Preview + Astrologer Branding */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2.5 sm:p-3 flex flex-col items-center space-y-2.5">
          <div
            style={{
              backgroundColor: '#E5CFAF',
              borderColor: '#8B1E1E',
            }}
            className={`w-full ${
              format === 'status_9_16'
                ? 'max-w-[205px] sm:max-w-[230px] aspect-[9/16]'
                : 'max-w-[260px] sm:max-w-[280px] aspect-[4/5]'
            } rounded-xl overflow-hidden border-2 shadow-md flex items-center justify-center shrink-0`}
          >
            {isGenerating || !imageUri ? (
              <div className="text-center p-4 space-y-2">
                <Sparkles
                  className="w-6 h-6 animate-spin mx-auto"
                  style={{ color: '#8B1E1E' }}
                />
                <p className="text-xs font-bold" style={{ color: '#3A1405' }}>
                  HD स्टेटस कार्ड तैयार हो रहा है...
                </p>
              </div>
            ) : (
              <img
                src={imageUri}
                alt={data.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Astrologer Branding Bar */}
          <div
            style={{
              backgroundColor: '#FFFDF9',
              borderColor: '#D6B892',
            }}
            className="w-full p-2 rounded-xl border flex items-center justify-between gap-2 text-xs shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 shrink-0" style={{ color: '#8B1E1E' }} />
              <div className="min-w-0">
                <div className="font-bold truncate" style={{ color: '#241005' }}>
                  {branding.enabled && branding.name
                    ? `ब्रांडिंग: ${branding.name}`
                    : 'सनातन शक्ति पंचांग ब्रांडिंग'}
                </div>
                <div className="text-[11px] truncate" style={{ color: '#5C2D0C' }}>
                  {branding.enabled && branding.phone
                    ? `📞 ${branding.phone}`
                    : 'नीचे कार्ड पर अपना नाम व मोबाइल नंबर जोड़ें'}
                </div>
              </div>
            </div>

            {onOpenBrandingModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBrandingModal();
                }}
                style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
              >
                नाम जोड़ें
              </button>
            )}
          </div>
        </div>

        {/* Sticky Bottom Action Buttons (Never Clipped) */}
        <div
          style={{
            backgroundColor: '#FFF8EB',
            borderColor: '#D6B892',
          }}
          className="shrink-0 p-2.5 sm:p-3 border-t space-y-2"
        >
          <button
            type="button"
            onClick={handleSharePoster}
            style={{ backgroundColor: '#15803D', color: '#FFFFFF' }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>व्हाट्सएप स्टेटस / ग्रुप पर शेयर करें</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPoster}
              disabled={!imageUri}
              style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
              className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" style={{ color: '#86EFAC' }} />
                  <span>डाउनलोड हुआ!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" style={{ color: '#FDE047' }} />
                  <span>HD इमेज सेव करें</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyCaption}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#3A1405',
                borderColor: '#C8A986',
              }}
              className="py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" style={{ color: '#15803D' }} />
                  <span>कॉपी हो गया!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" style={{ color: '#7C2D12' }} />
                  <span>टेक्स्ट कॉपी करें</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalNode, document.body)
    : modalNode;
};
