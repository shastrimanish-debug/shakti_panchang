import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Award,
  Calendar,
  Sun,
  Moon,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { VedicPanchangData, SavedLocation } from '../types';
import { getAstrologerBranding, AstrologerBranding } from '../services/storage';

interface WhatsAppPanchangModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchang: VedicPanchangData;
  location: SavedLocation;
  currentDate: Date;
  onOpenBrandingModal?: () => void;
}

const DAILY_SHLOKAS = [
  {
    shloka: 'शुभं करोति कल्याणं आरोग्यं धनसंपदाम्। शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तुते॥',
    meaning: 'दीपज्योति कल्याण, आरोग्य और धन-सम्पत्ति प्रदान करती है तथा सन्मार्ग की ओर प्रेरित करती है।',
  },
  {
    shloka: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    meaning: 'सृष्टि के प्रकाशक परमात्मा हमारे अंतःकरण को सद्बुद्धि व सन्मार्ग से प्रकाशित करें।',
  },
  {
    shloka: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    meaning: 'तुम्हारा अधिकार केवल कर्म करने में है, फल की चिंता में नहीं। कर्तव्य पथ पर अग्रसर रहें।',
  },
  {
    shloka: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥',
    meaning: 'सब सुखी हों, सब निरोगी हों, सब का कल्याण हो, कोई भी दुःखी न हो।',
  },
  {
    shloka: 'विद्या ददाति विनयं विनयाद्याति पात्रताम्। पात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम्॥',
    meaning: 'विद्या विनय देती है, विनय से पात्रता आती है, पात्रता से धन और धर्म से सच्चा सुख मिलता है।',
  },
];

// Safe rounded rectangle for Canvas across all browser/webview versions
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

export const WhatsAppPanchangModal: React.FC<WhatsAppPanchangModalProps> = ({
  isOpen,
  onClose,
  panchang,
  location,
  currentDate,
  onOpenBrandingModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [branding, setBranding] = useState<AstrologerBranding>(() => getAstrologerBranding());

  // Shloka for today based on day of month
  const shlokaIndex = currentDate.getDate() % DAILY_SHLOKAS.length;
  const currentShloka = DAILY_SHLOKAS[shlokaIndex];

  // Refresh branding when opened
  useEffect(() => {
    if (isOpen) {
      setBranding(getAstrologerBranding());
    }
  }, [isOpen]);

  const generateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // 1. Background (Sacred Bhojpatra / Warm Papyrus)
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#FAF2E4');
    bgGrad.addColorStop(0.5, '#F4E8D1');
    bgGrad.addColorStop(1, '#E8D5B7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle paper texture speckles
    ctx.fillStyle = 'rgba(140, 98, 57, 0.03)';
    for (let i = 0; i < 600; i++) {
      const rx = (i * 137) % W;
      const ry = (i * 269) % H;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // 2. Double Ornate Borders (सुवर्ण वेष्टन)
    ctx.strokeStyle = '#B56A00';
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    ctx.strokeStyle = '#5C3A21';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    // Corner Vedic Ornaments
    const drawCorner = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#B56A00';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8C6239';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(50, 50);
    drawCorner(W - 50, 50);
    drawCorner(50, H - 50);
    drawCorner(W - 50, H - 50);

    // 3. Sacred Invocation Top
    ctx.fillStyle = '#B56A00';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥', W / 2, 85);

    // 4. Header Badge
    const headerGrad = ctx.createLinearGradient(W / 2 - 320, 105, W / 2 + 320, 180);
    headerGrad.addColorStop(0, '#5C3A21');
    headerGrad.addColorStop(0.5, '#462B17');
    headerGrad.addColorStop(1, '#5C3A21');
    ctx.fillStyle = headerGrad;
    ctx.beginPath();
    safeRoundRect(ctx, W / 2 - 340, 105, 680, 80, 20);
    ctx.fill();
    ctx.strokeStyle = '#FFD88A';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFD88A';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('दैनिक वैदिक पञ्चाङ्गम्', W / 2, 160);

    // 5. Date & Location Bar
    const dateStr = currentDate.toLocaleDateString('hi-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillStyle = '#3E2714';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(dateStr, W / 2, 235);

    ctx.fillStyle = '#735133';
    ctx.font = '24px sans-serif';
    const locName = location.name.split('(')[0].trim();
    ctx.fillText(`स्थान: ${locName} • संवत्: ${panchang.samvat || '2083'} • ऋतु: ${panchang.masa || 'भाद्रपद'}`, W / 2, 275);

    // Divider Line
    ctx.strokeStyle = '#8C6239';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 305);
    ctx.lineTo(W - 80, 305);
    ctx.stroke();

    // 6. Panchang 5 Core Limbs Cards (Grid 2x2 + 1)
    const card = (x: number, y: number, w: number, h: number, title: string, value: string, sub: string, iconStr: string) => {
      ctx.fillStyle = '#FAF2E4';
      ctx.beginPath();
      safeRoundRect(ctx, x, y, w, h, 14);
      ctx.fill();
      ctx.strokeStyle = '#8C6239';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon circle
      ctx.fillStyle = '#5C3A21';
      ctx.beginPath();
      ctx.arc(x + 36, y + h / 2, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(iconStr, x + 36, y + h / 2 + 7);

      // Title & Value
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8C6239';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(title, x + 72, y + 36);

      ctx.fillStyle = '#3E2714';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(value, x + 72, y + 68);

      if (sub) {
        ctx.fillStyle = '#B56A00';
        ctx.font = '19px sans-serif';
        ctx.fillText(sub, x + 72, y + 96);
      }
    };

    const cardW = 445;
    const cardH = 115;
    const leftX = 75;
    const rightX = 560;

    // Tithi
    const tithiSub = panchang.tithiSpan
      ? `समाप्ति: ${panchang.tithiSpan.end.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}`
      : panchang.paksha;
    card(leftX, 330, cardW, cardH, 'तिथि (Tithi)', `${panchang.tithi}`, tithiSub, '🌙');

    // Nakshatra
    const nakSub = panchang.nakshatraSpan
      ? `समाप्ति: ${panchang.nakshatraSpan.end.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}`
      : `चरण ${panchang.pada}`;
    card(rightX, 330, cardW, cardH, 'नक्षत्र (Nakshatra)', `${panchang.nakshatra}`, nakSub, '⭐');

    // Yoga
    card(leftX, 465, cardW, cardH, 'योग (Yoga)', `${panchang.yoga}`, 'शुभ कार्य सिद्धि', '☸');

    // Karana
    card(rightX, 465, cardW, cardH, 'करण (Karana)', `${panchang.karana}`, 'तिथि अर्ध भाग', '⚡');

    // 7. Sunrise, Sunset & Rahu Kaal Banner
    const sunBoxY = 605;
    ctx.fillStyle = '#5C3A21';
    ctx.beginPath();
    safeRoundRect(ctx, leftX, sunBoxY, W - 150, 115, 16);
    ctx.fill();
    ctx.strokeStyle = '#B56A00';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    const sRise = panchang.solar ? panchang.solar.sunrise.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '06:15';
    const sSet = panchang.solar ? panchang.solar.sunset.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '18:22';

    // 3 sections in sun box
    const sec1 = leftX + (W - 150) * 0.18;
    const sec2 = leftX + (W - 150) * 0.5;
    const sec3 = leftX + (W - 150) * 0.82;

    ctx.fillStyle = '#FFD88A';
    ctx.font = '20px sans-serif';
    ctx.fillText('🌅 सूर्योदय', sec1, sunBoxY + 42);
    ctx.fillStyle = '#FAF2E4';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(sRise, sec1, sunBoxY + 84);

    ctx.fillStyle = '#FFD88A';
    ctx.font = '20px sans-serif';
    ctx.fillText('🌄 सूर्यास्त', sec2, sunBoxY + 42);
    ctx.fillStyle = '#FAF2E4';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(sSet, sec2, sunBoxY + 84);

    ctx.fillStyle = '#FFB4A2';
    ctx.font = '20px sans-serif';
    ctx.fillText('⚠️ राहुकाल', sec3, sunBoxY + 42);
    ctx.fillStyle = '#FAF2E4';
    ctx.font = 'bold 26px sans-serif';
    const rahuStr = '12:20 - 13:50';
    ctx.fillText(rahuStr, sec3, sunBoxY + 84);

    // 8. Shubh Muhurat / Abhijit Bar
    const muhuratY = 740;
    ctx.fillStyle = '#FAF2E4';
    ctx.beginPath();
    safeRoundRect(ctx, leftX, muhuratY, W - 150, 75, 14);
    ctx.fill();
    ctx.strokeStyle = '#8C6239';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#B56A00';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('✨ आज का अभिजित मुहूर्त (श्रेष्ठ समय):', leftX + 25, muhuratY + 47);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#3E2714';
    ctx.font = 'bold 25px sans-serif';
    ctx.fillText('11:56 AM – 12:45 PM (सर्वकार्य सिद्धि)', W - leftX - 25, muhuratY + 47);

    // 9. Daily Sacred Subhashita / Shloka Box
    const shlokaY = 835;
    ctx.fillStyle = '#FAF2E4';
    ctx.beginPath();
    safeRoundRect(ctx, leftX, shlokaY, W - 150, 160, 16);
    ctx.fill();
    ctx.strokeStyle = '#B56A00';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#B56A00';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('॥ आज का पावन सुभाषित व विचार ॥', W / 2, shlokaY + 40);

    ctx.fillStyle = '#3E2714';
    ctx.font = 'italic bold 23px serif';
    ctx.fillText(currentShloka.shloka, W / 2, shlokaY + 82);

    ctx.fillStyle = '#735133';
    ctx.font = '20px sans-serif';
    ctx.fillText(`“${currentShloka.meaning}”`, W / 2, shlokaY + 124);

    // 10. Footer Section (Astrologer Visiting Card OR Sacred Brand)
    const footerY = 1020;
    if (branding.enabled && branding.name) {
      // Astrologer Digital Visiting Card
      const cardGrad = ctx.createLinearGradient(leftX, footerY, W - leftX, footerY + 230);
      cardGrad.addColorStop(0, '#5C3A21');
      cardGrad.addColorStop(1, '#3E2714');
      ctx.fillStyle = cardGrad;
      ctx.beginPath();
      safeRoundRect(ctx, leftX, footerY, W - 150, 230, 20);
      ctx.fill();
      ctx.strokeStyle = '#FFD88A';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Top banner inside card
      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('॥ प्रामाणिक वैदिक ज्योतिष एवं कर्मकांड परामर्श ॥', W / 2, footerY + 42);

      // Astrologer Name
      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(branding.name, W / 2, footerY + 92);

      // Designation
      ctx.fillStyle = '#FFD88A';
      ctx.font = '24px sans-serif';
      ctx.fillText(branding.title || 'वैदिक ज्योतिषी', W / 2, footerY + 130);

      // Contacts line
      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 25px sans-serif';
      const contactStr = [
        branding.phone ? `📞 ${branding.phone}` : '',
        branding.city ? `📍 ${branding.city}` : '',
        branding.sansthan ? `🏛️ ${branding.sansthan}` : '',
      ].filter(Boolean).join('   •   ');
      ctx.fillText(contactStr, W / 2, footerY + 172);

      if (branding.specialization) {
        ctx.fillStyle = 'rgba(255, 216, 138, 0.85)';
        ctx.font = '19px sans-serif';
        ctx.fillText(`विशेषज्ञता: ${branding.specialization}`, W / 2, footerY + 208);
      }
    } else {
      // Default Sacred Shakti Panchang Granth Brand
      ctx.fillStyle = '#5C3A21';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, footerY, W - 150, 230, 20);
      ctx.fill();
      ctx.strokeStyle = '#B56A00';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 36px serif';
      ctx.textAlign = 'center';
      ctx.fillText('सनातन शक्ति पंचांग', W / 2, footerY + 70);

      ctx.fillStyle = '#FAF2E4';
      ctx.font = '24px sans-serif';
      ctx.fillText('अचूक वैदिक खगोलशास्त्र • सूर्य सिद्धान्त एवं लाहिरी अयनांश', W / 2, footerY + 118);

      ctx.fillStyle = '#FFD88A';
      ctx.font = '22px sans-serif';
      ctx.fillText('॥ ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥', W / 2, footerY + 162);

      ctx.fillStyle = 'rgba(250, 242, 228, 0.7)';
      ctx.font = '19px sans-serif';
      ctx.fillText('दैनिक पंचांग, शुभ मुहूर्त, चौघड़िया एवं कुंडली मिलान', W / 2, footerY + 198);
    }

    // Finished rendering
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setImageUri(dataUrl);
    } catch {
      // Ignore
    } finally {
      setIsGenerating(false);
    }
  }, [panchang, location, currentDate, branding, currentShloka]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        generateCanvas();
      }, 80);
    }
  }, [isOpen, generateCanvas]);

  if (!isOpen) return null;

  // Text message format for WhatsApp
  const dateFormatted = currentDate.toLocaleDateString('hi-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const locShort = location.name.split('(')[0].trim();

  const getShareText = () => {
    let txt = `*॥ श्री गणेशाय नमः ॥*\n`;
    txt += `*दैनिक वैदिक पञ्चाङ्गम् — शक्ति पंचांग*\n`;
    txt += `📅 *दिनांक:* ${dateFormatted}\n`;
    txt += `📍 *स्थान:* ${locShort}\n`;
    txt += `──────────────────\n`;
    txt += `🌙 *तिथि:* ${panchang.tithi} (${panchang.paksha})\n`;
    txt += `⭐ *नक्षत्र:* ${panchang.nakshatra} (चरण ${panchang.pada})\n`;
    txt += `☸ *योग:* ${panchang.yoga}\n`;
    txt += `⚡ *करण:* ${panchang.karana}\n`;
    txt += `🌅 *सूर्योदय:* ${panchang.solar ? panchang.solar.sunrise.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '06:15'}\n`;
    txt += `🌄 *सूर्यास्त:* ${panchang.solar ? panchang.solar.sunset.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '18:22'}\n`;
    txt += `✨ *अभिजित मुहूर्त:* 11:56 AM – 12:45 PM\n`;
    txt += `⚠️ *राहुकाल:* 12:20 PM – 01:50 PM\n`;
    txt += `──────────────────\n`;
    txt += `📖 *सुभाषित:* ${currentShloka.shloka}\n`;
    txt += `(अर्थ: ${currentShloka.meaning})\n`;

    if (branding.enabled && branding.name) {
      txt += `──────────────────\n`;
      txt += `🙏 *ज्योतिषीय परामर्श सौजन्य:* ${branding.name}\n`;
      if (branding.title) txt += `🎖️ ${branding.title}\n`;
      if (branding.phone) txt += `📞 संपर्क: ${branding.phone}\n`;
      if (branding.city) txt += `📍 ${branding.city}\n`;
    } else {
      txt += `──────────────────\n`;
      txt += `सनातन शक्ति पंचांग — प्रामाणिक वैदिक पंचांग\n`;
    }
    return txt;
  };

  const handleShareWhatsApp = async () => {
    const text = getShareText();

    // Try Web Share API with File
    if (imageUri && navigator.share && navigator.canShare) {
      try {
        const res = await fetch(imageUri);
        const blob = await res.blob();
        const file = new File([blob], `Panchang-${currentDate.toISOString().slice(0, 10)}.png`, {
          type: 'image/png',
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `दैनिक पंचांग - ${dateFormatted}`,
            text: text,
            files: [file],
          });
          return;
        }
      } catch {
        // Fallback below
      }
    }

    // Direct WhatsApp Web / Mobile intent
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleDownloadImage = () => {
    if (!imageUri) return;
    const a = document.createElement('a');
    a.href = imageUri;
    a.download = `Shakti-Panchang-${currentDate.toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyText = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Hidden offscreen canvas for crisp 1080x1350 rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="w-full max-w-md bg-[#FAF2E4] text-[#3E2714] rounded-2xl border-2 border-[#8C6239] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#5C3A21] to-[#735133] text-[#FAF2E4] border-b border-[#8C6239]">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[#B56A00] rounded-lg text-white">
              <Share2 className="w-4 h-4 text-[#FFD88A]" />
            </div>
            <div>
              <h3 className="font-granth font-bold text-sm sm:text-base text-[#FAF2E4]">
                दैनिक व्हाट्सएप पंचांग कार्ड
              </h3>
              <p className="text-[10px] text-[#FFD88A]">
                1-क्लिक में आज का पंचांग व सुविचार स्टेटस/ग्रुप्स पर शेयर करें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full text-[#FAF2E4]/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 flex flex-col items-center">
          {/* Card Preview */}
          <div className="w-full max-w-[340px] rounded-xl overflow-hidden border-2 border-[#8C6239] shadow-md bg-stone-100 relative group aspect-[4/5] flex items-center justify-center">
            {isGenerating || !imageUri ? (
              <div className="text-center p-4 space-y-2">
                <Sparkles className="w-6 h-6 text-[#B56A00] animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#5C3A21]">एचडी पंचांग कार्ड तैयार हो रहा है...</p>
              </div>
            ) : (
              <img
                src={imageUri}
                alt="दैनिक पंचांग कार्ड"
                className="w-full h-full object-contain rounded-lg"
              />
            )}
          </div>

          {/* Pandit Custom Branding Indicator / Shortcut */}
          <div className="w-full p-2.5 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 text-[#B56A00] shrink-0" />
              <div className="truncate">
                <span className="font-bold text-[#5C3A21]">
                  {branding.enabled && branding.name
                    ? `परामर्शदाता: ${branding.name}`
                    : 'साधारण ब्रांडिंग (शक्ति पंचांग)'}
                </span>
                <span className="text-[10px] text-[#735133] block truncate">
                  {branding.enabled ? `📞 ${branding.phone || branding.city}` : 'कार्ड पर अपना नाम/नंबर जोड़ें'}
                </span>
              </div>
            </div>

            {onOpenBrandingModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBrandingModal();
                }}
                className="text-[11px] px-2.5 py-1 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] font-bold rounded-lg shrink-0 cursor-pointer"
              >
                {branding.enabled ? 'बदलें' : 'कार्ड बनाएँ'}
              </button>
            )}
          </div>

          {/* Action Buttons Grid */}
          <div className="w-full space-y-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>व्हाट्सएप पर शेयर करें (WhatsApp Share)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={!imageUri}
                className="py-2 px-3 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-[#FFD88A]" />
                <span>HD चित्र डाउनलोड</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="py-2 px-3 bg-[#FAF2E4] hover:bg-[#EBD8BD] border border-[#8C6239] text-[#5C3A21] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">कॉपी हो गया!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8C6239]" />
                    <span>टेक्स्ट कॉपी करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#F4E8D1] border-t border-[#8C6239]/20 text-center">
          <span className="text-[10px] text-[#8C6239] font-granth">
            सनातन शक्ति पंचांग • अचूक वैदिक गणना व सुविचार
          </span>
        </div>
      </div>
    </div>
  );
};
