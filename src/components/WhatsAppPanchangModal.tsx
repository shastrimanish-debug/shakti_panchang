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
  Clock,
  Smartphone,
} from 'lucide-react';
import { VedicPanchangData, SavedLocation } from '../types';
import { getAstrologerBranding, AstrologerBranding } from '../services/storage';
import {
  getDayChoghadiya,
  getNightChoghadiya,
  getInauspiciousWindows,
  getAuspiciousWindows,
} from '../services/choghadiya';
import { shareImageFile, shareTextContent } from '../lib/shareHelper';
import { saveImageNative } from '../lib/device';
import { useLanguage } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';

function pickL<T>(lang: string, hi: T, en: T, gu: T): T {
  const l = (lang || 'hi').slice(0, 2).toLowerCase();
  if (l === 'en') return en;
  if (l === 'gu') return gu;
  return hi;
}

interface WhatsAppPanchangModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchang: VedicPanchangData;
  location: SavedLocation;
  currentDate: Date;
  personName?: string;
  onOpenBrandingModal?: () => void;
}

type CardTemplateMode = 'panchang' | 'choghadiya' | 'status_9_16';

const DAILY_SHLOKAS = [
  {
    shloka: 'शुभं करोति कल्याणं आरोग्यं धनसंपदाम्। शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तुते॥',
    meaning: {
      hi: 'दीपज्योति कल्याण, आरोग्य और धन-सम्पत्ति प्रदान करती है तथा सन्मार्ग की ओर प्रेरित करती है।',
      en: 'Salutations to the sacred lamp light that brings auspiciousness, good health, prosperity, and destroys negative thoughts.',
      gu: 'દીપજ્યોતિ કલ્યાણ, આરોગ્ય અને ધન-સંપત્તિ પ્રદાન કરે છે તથા સન્માર્ગ તરફ પ્રેરિત કરે છે.',
    },
  },
  {
    shloka: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    meaning: {
      hi: 'सृष्टि के प्रकाशक परमात्मा हमारे अंतःकरण को सद्बुद्धि व सन्मार्ग से प्रकाशित करें।',
      en: 'We meditate upon the divine radiance of Lord Savitur; may He illuminate our intellect onto the righteous path.',
      gu: 'સૃષ્ટિના પ્રકાશક પરમાત્મા આપણા અંતઃકરણને સદ્બુદ્ધિ અને સન્માર્ગથી પ્રકાશિત કરે.',
    },
  },
  {
    shloka: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    meaning: {
      hi: 'तुम्हारा अधिकार केवल कर्म करने में है, फल की चिंता में नहीं। कर्तव्य पथ पर अग्रसर रहें।',
      en: 'You have the right to perform your duty alone, never to the fruits thereof. Stay steadfast on the path of righteous action.',
      gu: 'તમારો અધિકાર કેવળ કર્મ કરવાનો છે, ફળની ચિંતાનો નહીં. કર્તવ્ય પથ પર આગળ વધતા રહો.',
    },
  },
  {
    shloka: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥',
    meaning: {
      hi: 'सब सुखी हों, सब निरोगी हों, सब का कल्याण हो, कोई भी दुःखी न हो।',
      en: 'May all beings be happy, may all be free from illness, may all witness auspiciousness, and may none suffer sorrow.',
      gu: 'સૌ સુખી થાઓ, સૌ નિરોગી રહો, સૌનું કલ્યાણ થાઓ, કોઈ પણ દુઃખી ન થાઓ.',
    },
  },
  {
    shloka: 'विद्या ददाति विनयं विनयाद्याति पात्रताम्। पात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम्॥',
    meaning: {
      hi: 'विद्या विनय देती है, विनय से पात्रता आती है, पात्रता से धन और धर्म से सच्चा सुख मिलता है।',
      en: 'True knowledge bestows humility, humility brings worthiness, worthiness brings wealth, and righteousness leads to true joy.',
      gu: 'વિદ્યા વિનય આપે છે, વિનયથી પાત્રતા આવે છે, પાત્રતાથી ધન અને ધર્મથી સાચું સુખ મળે છે.',
    },
  },
];

function dataURItoBlob(dataURI: string): Blob {
  const parts = dataURI.split(',');
  const byteString = atob(parts[1] || parts[0]);
  const mimeString = parts[0].includes(':') ? parts[0].split(':')[1].split(';')[0] : 'image/png';
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

export const WhatsAppPanchangModal: React.FC<WhatsAppPanchangModalProps> = ({
  isOpen,
  onClose,
  panchang,
  location,
  currentDate,
  personName,
  onOpenBrandingModal,
}) => {
  const { language } = useLanguage();
  const currentLang = (language || 'hi').slice(0, 2).toLowerCase();
  const locale = currentLang === 'en' ? 'en-US' : currentLang === 'gu' ? 'gu-IN' : 'hi-IN';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [templateMode, setTemplateMode] = useState<CardTemplateMode>('panchang');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [branding, setBranding] = useState<AstrologerBranding>(() => getAstrologerBranding());

  const shlokaIndex = currentDate.getDate() % DAILY_SHLOKAS.length;
  const currentShloka = DAILY_SHLOKAS[shlokaIndex];
  const shlokaMeaningText =
    currentLang === 'en'
      ? currentShloka.meaning.en
      : currentLang === 'gu'
      ? currentShloka.meaning.gu
      : currentShloka.meaning.hi;

  useEffect(() => {
    if (isOpen) {
      setBranding(getAstrologerBranding());
    }
  }, [isOpen]);

  // Real calculated Choghadiya, Rahukaal & Abhijit Muhurat
  const weekday = currentDate.getDay();
  const dayChoghadiyas = getDayChoghadiya(panchang.solar, weekday);
  const nightChoghadiyas = getNightChoghadiya(panchang.solar, weekday);
  const inauspiciousWindows = getInauspiciousWindows(panchang.solar, weekday);
  const auspiciousWindows = getAuspiciousWindows(panchang.solar);

  const fmtShort = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  const rahuWin =
    inauspiciousWindows.find((w) => w.title.includes('राहु')) || inauspiciousWindows[0];
  const rahuStr = rahuWin
    ? `${fmtShort(rahuWin.start)} - ${fmtShort(rahuWin.end)}`
    : '12:00 - 13:30';

  const abhijitWin =
    auspiciousWindows.find((w) => w.title.includes('अभिजित')) || auspiciousWindows[0];
  const abhijitStr = abhijitWin
    ? `${fmtShort(abhijitWin.start)} – ${fmtShort(abhijitWin.end)}`
    : '11:52 – 12:42';

  const drawFooterBranding = (
    ctx: CanvasRenderingContext2D,
    W: number,
    leftX: number,
    footerY: number
  ) => {
    const appBrandName = pickL(currentLang, 'सनातन शक्ति पंचांग', 'Shakti Sanatan Panchang', 'સનાતન શક્તિ પંચાંગ');
    if (branding.enabled && branding.name) {
      const cardGrad = ctx.createLinearGradient(leftX, footerY, W - leftX, footerY + 230);
      cardGrad.addColorStop(0, '#5C3A21');
      cardGrad.addColorStop(1, '#3E2714');
      ctx.fillStyle = cardGrad;
      ctx.beginPath();
      safeRoundRect(ctx, leftX, footerY, W - leftX * 2, 230, 20);
      ctx.fill();
      ctx.strokeStyle = '#FFD88A';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        pickL(
          currentLang,
          '॥ प्रामाणिक वैदिक ज्योतिष एवं कर्मकांड परामर्श ॥',
          'Authentic Vedic Astrology & Karmakanda Consultation',
          '॥ પ્રામાણિક વૈદિક જ્યોતિષ અને કર્મકાંડ પરામર્શ ॥'
        ),
        W / 2,
        footerY + 42
      );

      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(branding.name, W / 2, footerY + 92);

      ctx.fillStyle = '#FFD88A';
      ctx.font = '24px sans-serif';
      ctx.fillText(branding.title || pickL(currentLang, 'वैदिक ज्योतिषी', 'Vedic Astrologer', 'વૈદિક જ્યોતિષી'), W / 2, footerY + 130);

      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 25px sans-serif';
      const contactStr = [
        branding.phone ? `📞 ${branding.phone}` : '',
        branding.city ? `📍 ${branding.city}` : '',
        branding.sansthan ? `🏛️ ${branding.sansthan}` : '',
      ]
        .filter(Boolean)
        .join('   •   ');
      ctx.fillText(contactStr || appBrandName, W / 2, footerY + 172);

      if (branding.specialization) {
        ctx.fillStyle = 'rgba(255, 216, 138, 0.88)';
        ctx.font = '19px sans-serif';
        ctx.fillText(
          `${pickL(currentLang, 'विशेषज्ञता:', 'Specialization:', 'વિશેષતા:')} ${branding.specialization}`,
          W / 2,
          footerY + 208
        );
      }
    } else {
      ctx.fillStyle = '#5C3A21';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, footerY, W - leftX * 2, 230, 20);
      ctx.fill();
      ctx.strokeStyle = '#B56A00';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 36px serif';
      ctx.textAlign = 'center';
      ctx.fillText(appBrandName, W / 2, footerY + 70);

      ctx.fillStyle = '#FAF2E4';
      ctx.font = '24px sans-serif';
      ctx.fillText(
        pickL(
          currentLang,
          'अचूक वैदिक खगोलशास्त्र • सूर्य सिद्धान्त एवं लाहिरी अयनांश',
          'Precision Vedic Astronomy • Surya Siddhanta & Lahiri Ayanamsha',
          'સચોટ વૈદિક ખગોળશાસ્ત્ર • સૂર્ય સિદ્ધાંત અને લાહિરી અયનાંશ'
        ),
        W / 2,
        footerY + 118
      );

      ctx.fillStyle = '#FFD88A';
      ctx.font = '22px sans-serif';
      ctx.fillText('॥ ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥', W / 2, footerY + 162);

      ctx.fillStyle = 'rgba(250, 242, 228, 0.78)';
      ctx.font = '19px sans-serif';
      ctx.fillText(
        pickL(
          currentLang,
          'दैनिक पंचांग, शुभ मुहूर्त, चौघड़िया एवं कुंडली मिलान',
          'Daily Panchang, Shubh Muhurat, Choghadiya & Kundali Matching',
          'દૈનિક પંચાંગ, શુભ મુહૂર્ત, ચોઘડિયા અને કુંડળી મિલાન'
        ),
        W / 2,
        footerY + 198
      );
    }
  };

  const generateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    const W = 1080;
    const H = templateMode === 'status_9_16' ? 1920 : 1350;
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

    // 2. Double Ornate Borders
    ctx.strokeStyle = '#8B1E1E';
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    ctx.strokeStyle = '#5C3A21';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    const drawCorner = (cx: number, cy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#8B1E1E';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B56A00';
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
    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥', W / 2, 85);

    // 4. Header Badge
    const headerGrad = ctx.createLinearGradient(W / 2 - 340, 105, W / 2 + 340, 185);
    headerGrad.addColorStop(0, '#6E1409');
    headerGrad.addColorStop(0.5, '#4A0E0E');
    headerGrad.addColorStop(1, '#6E1409');
    ctx.fillStyle = headerGrad;
    ctx.beginPath();
    safeRoundRect(ctx, W / 2 - 350, 105, 700, 80, 20);
    ctx.fill();
    ctx.strokeStyle = '#FFD88A';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFD88A';
    ctx.font = 'bold 36px sans-serif';
    const headerText =
      templateMode === 'choghadiya'
        ? pickL(currentLang, 'आज का शुभ चौघड़िया व मुहूर्त', "Today's Shubh Choghadiya & Muhurat", 'આજનું શુભ ચોઘડિયા અને મુહૂર્ત')
        : templateMode === 'status_9_16'
          ? pickL(currentLang, 'आज का सुभाषित एवं पंचांग दर्शन', "Today's Subhashita & Panchang", 'આજનું સુભાષિત અને પંચાંગ દર્શન')
          : pickL(currentLang, 'दैनिक वैदिक पञ्चाङ्गम्', 'Daily Vedic Panchang', 'દૈનિક વૈદિક પંચાંગમ્');
    ctx.fillText(headerText, W / 2, 158);

    // 5. Date & Location Bar
    const dateStr = currentDate.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillStyle = '#241005';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(dateStr, W / 2, 235);

    ctx.fillStyle = '#5C2D0C';
    ctx.font = 'bold 24px sans-serif';
    const locName = location.name.split('(')[0].trim();
    const who = personName ? `${personName} • ` : '';
    const locLabel = pickL(currentLang, 'स्थान:', 'Place:', 'સ્થળ:');
    const samvatLabel = pickL(currentLang, 'संवत्:', 'Samvat:', 'સંવત:');
    ctx.fillText(`${who}${locLabel} ${locName} • ${samvatLabel} ${panchang.samvat || '2083'}`, W / 2, 275);

    // Divider Line
    ctx.strokeStyle = '#8C6239';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 302);
    ctx.lineTo(W - 80, 302);
    ctx.stroke();

    const leftX = 75;
    const tithiTr = trVedic(panchang.tithi, currentLang);
    const pakshaTr = trVedic(panchang.paksha, currentLang);
    const nakTr = trVedic(panchang.nakshatra, currentLang);
    const yogaTr = trVedic(panchang.yoga, currentLang);
    const karanaTr = trVedic(panchang.karana, currentLang);

    const chogDisplayName = (ch: { hindiName: string; name: string }) =>
      currentLang === 'en' ? ch.name : trVedic(ch.hindiName, currentLang);

    if (templateMode === 'choghadiya') {
      // ================== CHOGHADIYA POSTER MODE ==================
      const colW = 445;
      const rightX = 560;

      // Day Choghadiya Header
      ctx.fillStyle = '#8B1E1E';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, 322, colW, 54, 12);
      ctx.fill();
      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pickL(currentLang, '☀️ दिन का चौघड़िया', '☀️ Day Choghadiya', '☀️ દિવસનું ચોઘડિયા'), leftX + colW / 2, 358);

      // Night Choghadiya Header
      ctx.fillStyle = '#3E2714';
      ctx.beginPath();
      safeRoundRect(ctx, rightX, 322, colW, 54, 12);
      ctx.fill();
      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(pickL(currentLang, '🌙 रात्रि का चौघड़िया', '🌙 Night Choghadiya', '🌙 રાત્રિનું ચોઘડિયા'), rightX + colW / 2, 358);

      const drawChogRow = (
        x: number,
        y: number,
        name: string,
        timeRange: string,
        nature: string
      ) => {
        const isGood = nature === 'auspicious';
        const isNeutral = nature === 'neutral';
        ctx.fillStyle = isGood ? '#ECFDF5' : isNeutral ? '#FFFBEB' : '#FFFDF9';
        ctx.beginPath();
        safeRoundRect(ctx, x, y, colW, 52, 10);
        ctx.fill();
        ctx.strokeStyle = isGood ? '#10B981' : isNeutral ? '#F59E0B' : '#D6B892';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = isGood ? '#065F46' : isNeutral ? '#92400E' : '#7F1D1D';
        ctx.font = 'bold 22px sans-serif';
        const tag = isGood
          ? pickL(currentLang, '✦ शुभ', '✦ Good', '✦ શુભ')
          : isNeutral
          ? pickL(currentLang, '• चल', '• Neutral', '• ચલ')
          : pickL(currentLang, '× त्याज्य', '× Avoid', '× ત્યાજ્ય');
        ctx.fillText(`${name} (${tag})`, x + 16, y + 34);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#241005';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(timeRange, x + colW - 16, y + 34);
      };

      dayChoghadiyas.slice(0, 8).forEach((ch, idx) => {
        const rowY = 388 + idx * 60;
        drawChogRow(
          leftX,
          rowY,
          chogDisplayName(ch),
          `${fmtShort(ch.start)} - ${fmtShort(ch.end)}`,
          ch.nature
        );
      });

      nightChoghadiyas.slice(0, 8).forEach((ch, idx) => {
        const rowY = 388 + idx * 60;
        drawChogRow(
          rightX,
          rowY,
          chogDisplayName(ch),
          `${fmtShort(ch.start)} - ${fmtShort(ch.end)}`,
          ch.nature
        );
      });

      // Abhijit & Rahukaal strip
      const stripY = 885;
      ctx.fillStyle = '#FFFDF9';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, stripY, W - 150, 110, 16);
      ctx.fill();
      ctx.strokeStyle = '#B56A00';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#15803D';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(
        `${pickL(currentLang, '✨ अभिजित मुहूर्त (सर्वश्रेष्ठ):', '✨ Abhijit Muhurat (Best):', '✨ અભિજિત મુહૂર્ત (સર્વોત્તમ):')} ${abhijitStr}`,
        W / 2,
        stripY + 44
      );

      ctx.fillStyle = '#991B1B';
      ctx.font = 'bold 23px sans-serif';
      ctx.fillText(
        `${pickL(currentLang, '⚠️ राहुकाल (त्याज्य समय):', '⚠️ Rahu Kaal (Avoid):', '⚠️ રાહુકાળ (ત્યાજ્ય સમય):')} ${rahuStr}   •   ${pickL(currentLang, 'तिथि:', 'Tithi:', 'તિથિ:')} ${tithiTr} (${nakTr})`,
        W / 2,
        stripY + 86
      );

      drawFooterBranding(ctx, W, leftX, 1020);
    } else if (templateMode === 'status_9_16') {
      // ================== 9:16 WHATSAPP STATUS MODE ==================
      // Big Sacred Shloka Card + Today's Panchang Summary
      const boxW = W - 150;

      // Shloka Hero Box
      const heroY = 335;
      const heroH = 560;
      ctx.fillStyle = '#FFFDF9';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, heroY, boxW, heroH, 26);
      ctx.fill();
      ctx.strokeStyle = '#8B1E1E';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#8B1E1E';
      ctx.font = 'bold 28px serif';
      ctx.fillText(
        pickL(currentLang, '॥ आज का पावन वैदिक सुभाषित ॥', "Today's Sacred Vedic Subhashita", '॥ આજનું પાવન વૈદિક સુભાષિત ॥'),
        W / 2,
        heroY + 60
      );

      // Wrap Sanskrit
      ctx.fillStyle = '#4A0E0E';
      ctx.font = 'bold 38px serif';
      const words = currentShloka.shloka.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const cand = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(cand).width > boxW - 100 && cur) {
          lines.push(cur);
          cur = w;
        } else {
          cur = cand;
        }
      }
      if (cur) lines.push(cur);

      let sy = heroY + 145;
      for (const l of lines) {
        ctx.fillText(l, W / 2, sy);
        sy += 56;
      }

      // Meaning inside hero
      ctx.fillStyle = '#FFF6E0';
      ctx.beginPath();
      safeRoundRect(ctx, leftX + 36, heroY + 320, boxW - 72, 200, 18);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#8B1E1E';
      ctx.font = 'bold 25px sans-serif';
      ctx.fillText(
        pickL(currentLang, '✦ हिंदी भावार्थ ✦', '✦ Meaning ✦', '✦ ગુજરાતી ભાવાર્થ ✦'),
        W / 2,
        heroY + 368
      );

      ctx.fillStyle = '#1F1006';
      ctx.font = 'bold 27px sans-serif';
      const mWords = shlokaMeaningText.split(' ');
      const mLines: string[] = [];
      let mCur = '';
      for (const w of mWords) {
        const cand = mCur ? `${mCur} ${w}` : w;
        if (ctx.measureText(cand).width > boxW - 130 && mCur) {
          mLines.push(mCur);
          mCur = w;
        } else {
          mCur = cand;
        }
      }
      if (mCur) mLines.push(mCur);

      let my = heroY + 420;
      for (const ml of mLines.slice(0, 3)) {
        ctx.fillText(ml, W / 2, my);
        my += 42;
      }

      // Today's Panchang Summary Box in Status
      const pBoxY = 935;
      const pBoxH = 620;
      ctx.fillStyle = '#FFF8EB';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, pBoxY, boxW, pBoxH, 24);
      ctx.fill();
      ctx.strokeStyle = '#8C6239';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#6E1409';
      ctx.font = 'bold 30px serif';
      ctx.fillText(
        pickL(currentLang, '📜 आज के पंचांग के प्रमुख बिंदु', "Today's Panchang Highlights", '📜 આજના પંચાંગના મુખ્ય અંશો'),
        W / 2,
        pBoxY + 56
      );

      const padaWord = pickL(currentLang, 'चरण', 'Pada', 'ચરણ');
      const rows = [
        [pickL(currentLang, '🌙 तिथि व पक्ष', '🌙 Tithi & Paksha', '🌙 તિથિ અને પક્ષ'), `${tithiTr} (${pakshaTr})`],
        [pickL(currentLang, '⭐ नक्षत्र व चरण', '⭐ Nakshatra & Pada', '⭐ નક્ષત્ર અને ચરણ'), `${nakTr} (${padaWord} ${panchang.pada})`],
        [pickL(currentLang, '☸ योग व करण', '☸ Yoga & Karana', '☸ યોગ અને કરણ'), `${yogaTr}  •  ${karanaTr}`],
        [
          pickL(currentLang, '🌅 सूर्योदय व सूर्यास्त', '🌅 Sunrise & Sunset', '🌅 સૂર્યોદય અને સૂર્યાસ્ત'),
          `${panchang.solar ? fmtShort(panchang.solar.sunrise) : '06:15'}  —  ${panchang.solar ? fmtShort(panchang.solar.sunset) : '18:22'}`,
        ],
        [pickL(currentLang, '✨ अभिजित मुहूर्त (शुभ)', '✨ Abhijit Muhurat (Shubh)', '✨ અભિજિત મુહૂર્ત (શુભ)'), abhijitStr],
        [pickL(currentLang, '⚠️ राहुकाल (त्याज्य)', '⚠️ Rahu Kaal (Avoid)', '⚠️ રાહુકાળ (ત્યાજ્ય)'), rahuStr],
      ];

      rows.forEach(([label, val], idx) => {
        const ry = pBoxY + 90 + idx * 84;
        ctx.fillStyle = '#FFFDF9';
        ctx.beginPath();
        safeRoundRect(ctx, leftX + 28, ry, boxW - 56, 68, 14);
        ctx.fill();
        ctx.strokeStyle = '#D6B892';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#6E1409';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(label, leftX + 52, ry + 43);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#1F1006';
        ctx.font = 'bold 25px sans-serif';
        ctx.fillText(val, leftX + boxW - 52, ry + 43);
      });

      drawFooterBranding(ctx, W, leftX, 1600);
    } else {
      // ================== DEFAULT PANCHANG POSTER MODE ==================
      const card = (
        x: number,
        y: number,
        w: number,
        h: number,
        title: string,
        value: string,
        sub: string,
        iconStr: string
      ) => {
        ctx.fillStyle = '#FFFDF9';
        ctx.beginPath();
        safeRoundRect(ctx, x, y, w, h, 14);
        ctx.fill();
        ctx.strokeStyle = '#8C6239';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#6E1409';
        ctx.beginPath();
        ctx.arc(x + 36, y + h / 2, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD88A';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(iconStr, x + 36, y + h / 2 + 7);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#6E1409';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(title, x + 72, y + 36);

        ctx.fillStyle = '#1F1006';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(value, x + 72, y + 68);

        if (sub) {
          ctx.fillStyle = '#9A3412';
          ctx.font = 'bold 19px sans-serif';
          ctx.fillText(sub, x + 72, y + 96);
        }
      };

      const cardW = 445;
      const cardH = 115;
      const rightX = 560;
      const endsPrefix = pickL(currentLang, 'समाप्ति:', 'Ends:', 'સમાપ્તિ:');
      const padaPrefix = pickL(currentLang, 'चरण', 'Pada', 'ચરણ');

      const tithiSub = panchang.tithiSpan
        ? `${endsPrefix} ${fmtShort(panchang.tithiSpan.end)}`
        : pakshaTr;
      card(leftX, 330, cardW, cardH, pickL(currentLang, 'तिथि (Tithi)', 'Tithi', 'તિથિ (Tithi)'), tithiTr, tithiSub, '🌙');

      const nakSub = panchang.nakshatraSpan
        ? `${endsPrefix} ${fmtShort(panchang.nakshatraSpan.end)}`
        : `${padaPrefix} ${panchang.pada}`;
      card(rightX, 330, cardW, cardH, pickL(currentLang, 'नक्षत्र (Nakshatra)', 'Nakshatra', 'નક્ષત્ર (Nakshatra)'), nakTr, nakSub, '⭐');

      card(leftX, 465, cardW, cardH, pickL(currentLang, 'योग (Yoga)', 'Yoga', 'યોગ (Yoga)'), yogaTr, pickL(currentLang, 'शुभ कार्य सिद्धि', 'Auspicious Alignment', 'શુભ કાર્ય સિદ્ધિ'), '☸');
      card(rightX, 465, cardW, cardH, pickL(currentLang, 'करण (Karana)', 'Karana', 'કરણ (Karana)'), karanaTr, pickL(currentLang, 'तिथि अर्ध भाग', 'Half-Tithi Division', 'તિથિ અર્ધ ભાગ'), '⚡');

      // Sunrise, Sunset & Rahu Kaal Banner
      const sunBoxY = 605;
      ctx.fillStyle = '#5C3A21';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, sunBoxY, W - 150, 115, 16);
      ctx.fill();
      ctx.strokeStyle = '#B56A00';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      const sRise = panchang.solar ? fmtShort(panchang.solar.sunrise) : '06:15';
      const sSet = panchang.solar ? fmtShort(panchang.solar.sunset) : '18:22';

      const sec1 = leftX + (W - 150) * 0.18;
      const sec2 = leftX + (W - 150) * 0.5;
      const sec3 = leftX + (W - 150) * 0.82;

      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(pickL(currentLang, '🌅 सूर्योदय', '🌅 Sunrise', '🌅 સૂર્યોદય'), sec1, sunBoxY + 42);
      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(sRise, sec1, sunBoxY + 84);

      ctx.fillStyle = '#FFD88A';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(pickL(currentLang, '🌄 सूर्यास्त', '🌄 Sunset', '🌄 સૂર્યાસ્ત'), sec2, sunBoxY + 42);
      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(sSet, sec2, sunBoxY + 84);

      ctx.fillStyle = '#FFB4A2';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(pickL(currentLang, '⚠️ राहुकाल', '⚠️ Rahu Kaal', '⚠️ રાહુકાળ'), sec3, sunBoxY + 42);
      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(rahuStr, sec3, sunBoxY + 84);

      // Shubh Muhurat / Abhijit Bar
      const muhuratY = 740;
      ctx.fillStyle = '#FFFDF9';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, muhuratY, W - 150, 75, 14);
      ctx.fill();
      ctx.strokeStyle = '#8C6239';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#8B1E1E';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(
        pickL(currentLang, '✨ आज का अभिजित मुहूर्त (श्रेष्ठ समय):', "✨ Today's Abhijit Muhurat (Best Window):", '✨ આજનું અભિજિત મુહૂર્ત (શ્રેષ્ઠ સમય):'),
        leftX + 25,
        muhuratY + 47
      );

      ctx.textAlign = 'right';
      ctx.fillStyle = '#1F1006';
      ctx.font = 'bold 25px sans-serif';
      ctx.fillText(
        `${abhijitStr} (${pickL(currentLang, 'सर्वकार्य सिद्धि', 'All-Success Window', 'સર્વકાર્ય સિદ્ધિ')})`,
        W - leftX - 25,
        muhuratY + 47
      );

      // Daily Sacred Subhashita / Shloka Box
      const shlokaY = 835;
      ctx.fillStyle = '#FFFDF9';
      ctx.beginPath();
      safeRoundRect(ctx, leftX, shlokaY, W - 150, 160, 16);
      ctx.fill();
      ctx.strokeStyle = '#B56A00';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#8B1E1E';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(
        pickL(currentLang, '॥ आज का पावन सुभाषित व विचार ॥', "Today's Sacred Subhashita & Thought", '॥ આજનું પાવન સુભાષિત અને વિચાર ॥'),
        W / 2,
        shlokaY + 40
      );

      ctx.fillStyle = '#4A0E0E';
      ctx.font = 'bold 23px serif';
      ctx.fillText(currentShloka.shloka, W / 2, shlokaY + 82);

      ctx.fillStyle = '#241005';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`“${shlokaMeaningText}”`, W / 2, shlokaY + 124);

      drawFooterBranding(ctx, W, leftX, 1020);
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      setImageUri(dataUrl);
    } catch {
      // Ignore
    } finally {
      setIsGenerating(false);
    }
  }, [
    panchang,
    location,
    currentDate,
    branding,
    currentShloka,
    shlokaMeaningText,
    personName,
    templateMode,
    dayChoghadiyas,
    nightChoghadiyas,
    rahuStr,
    abhijitStr,
    currentLang,
    locale,
  ]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        generateCanvas();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [isOpen, generateCanvas]);

  if (!isOpen) return null;

  const dateFormatted = currentDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const locShort = location.name.split('(')[0].trim();

  const getShareText = () => {
    const tithiTr = trVedic(panchang.tithi, currentLang);
    const pakshaTr = trVedic(panchang.paksha, currentLang);
    const nakTr = trVedic(panchang.nakshatra, currentLang);
    const yogaTr = trVedic(panchang.yoga, currentLang);
    const karanaTr = trVedic(panchang.karana, currentLang);
    const sRise = panchang.solar ? fmtShort(panchang.solar.sunrise) : '06:15';
    const sSet = panchang.solar ? fmtShort(panchang.solar.sunset) : '18:22';

    let txt = `*॥ श्री गणेशाय नमः ॥*\n`;
    txt += `*${pickL(
      currentLang,
      'दैनिक वैदिक पञ्चाङ्गम् एवं चौघड़िया — शक्ति पंचांग',
      'Daily Vedic Panchang & Choghadiya — Shakti Panchang',
      'દૈનિક વૈદિક પંચાંગમ્ અને ચોઘડિયા — શક્તિ પંચાંગ'
    )}*\n`;
    txt += `📅 *${pickL(currentLang, 'दिनांक:', 'Date:', 'તારીખ:')}* ${dateFormatted}\n`;
    txt += `📍 *${pickL(currentLang, 'स्थान:', 'Location:', 'સ્થળ:')}* ${locShort}\n`;
    txt += `──────────────────\n`;
    txt += `🌙 *${pickL(currentLang, 'तिथि:', 'Tithi:', 'તિથિ:')}* ${tithiTr} (${pakshaTr})\n`;
    txt += `⭐ *${pickL(currentLang, 'नक्षत्र:', 'Nakshatra:', 'નક્ષત્ર:')}* ${nakTr} (${pickL(currentLang, 'चरण', 'Pada', 'ચરણ')} ${panchang.pada})\n`;
    txt += `☸ *${pickL(currentLang, 'योग:', 'Yoga:', 'યોગ:')}* ${yogaTr}  •  *${pickL(currentLang, 'करण:', 'Karana:', 'કરણ:')}* ${karanaTr}\n`;
    txt += `🌅 *${pickL(currentLang, 'सूर्योदय:', 'Sunrise:', 'સૂર્યોદય:')}* ${sRise} | 🌄 *${pickL(currentLang, 'सूर्यास्त:', 'Sunset:', 'સૂર્યાસ્ત:')}* ${sSet}\n`;
    txt += `✨ *${pickL(currentLang, 'अभिजित मुहूर्त:', 'Abhijit Muhurat:', 'અભિજિત મુહૂર્ત:')}* ${abhijitStr}\n`;
    txt += `⚠️ *${pickL(currentLang, 'राहुकाल:', 'Rahu Kaal:', 'રાહુકાળ:')}* ${rahuStr}\n`;
    if (templateMode === 'choghadiya') {
      txt += `──────────────────\n`;
      txt += `☀️ *${pickL(currentLang, 'आज के शुभ दिन चौघड़िया:', "Today's Auspicious Day Choghadiya:", 'આજના શુભ દિવસના ચોઘડિયા:')}*\n`;
      dayChoghadiyas
        .filter((c) => c.nature === 'auspicious' || c.nature === 'neutral')
        .forEach((c) => {
          const chName = currentLang === 'en' ? c.name : trVedic(c.hindiName, currentLang);
          txt += `• ${chName}: ${fmtShort(c.start)} – ${fmtShort(c.end)}\n`;
        });
    }
    txt += `──────────────────\n`;
    txt += `📖 *${pickL(currentLang, 'सुभाषित:', 'Subhashita:', 'સુભાષિત:')}* ${currentShloka.shloka}\n`;
    txt += `(${pickL(currentLang, 'अर्थ:', 'Meaning:', 'અર્થ:')} ${shlokaMeaningText})\n`;

    if (branding.enabled && branding.name) {
      txt += `──────────────────\n`;
      txt += `🙏 *${pickL(currentLang, 'ज्योतिषीय परामर्श सौजन्य:', 'Astrological Consultation Courtesy:', 'જ્યોતિષીય પરામર્શ સૌજન્ય:')}* ${branding.name}\n`;
      if (branding.title) txt += `🎖️ ${branding.title}\n`;
      if (branding.phone) txt += `📞 ${pickL(currentLang, 'संपर्क:', 'Contact:', 'સંપર્ક:')} ${branding.phone}\n`;
      if (branding.city) txt += `📍 ${branding.city}\n`;
    } else {
      txt += `──────────────────\n`;
      txt += `${pickL(
        currentLang,
        'सनातन शक्ति पंचांग — प्रामाणिक वैदिक पंचांग',
        'Shakti Sanatan Panchang — Authentic Vedic Almanac',
        'સનાતન શક્તિ પંચાંગ — પ્રામાણિક વૈદિક પંચાંગ'
      )}\n`;
    }
    return txt;
  };

  const handleShareWhatsApp = async () => {
    const text = getShareText();
    const fileName = `Shakti-Panchang-${templateMode}-${currentDate.toISOString().slice(0, 10)}.png`;
    const shareTitle = `${pickL(currentLang, 'दैनिक वैदिक पञ्चाङ्गम्', 'Daily Vedic Panchang', 'દૈનિક વૈદિક પંચાંગમ્')} - ${dateFormatted}`;

    if (imageUri) {
      await shareImageFile({
        imageUri,
        fileName,
        title: shareTitle,
        text,
      });
    } else {
      await shareTextContent({
        title: shareTitle,
        text,
      });
    }
  };

  const handleDownloadImage = async () => {
    if (!imageUri) return;
    const fileName = `Shakti-Panchang-${templateMode}-${currentDate.toISOString().slice(0, 10)}.png`;
    try {
      const savedNative = await saveImageNative(imageUri, fileName);
      if (savedNative) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
        return;
      }

      const blob = dataURItoBlob(imageUri);
      const file = new File([blob], fileName, { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: pickL(currentLang, 'दैनिक वैदिक पंचांग कार्ड (HD)', 'Daily Vedic Panchang Card (HD)', 'દૈનિક વૈદિક પંચાંગ કાર્ડ (HD)'),
            files: [file],
          });
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 2500);
          return;
        } catch (e: any) {
          if (e?.name === 'AbortError') return;
        }
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      a.target = '_blank';
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

  const handleCopyText = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
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
        className="w-full max-w-md rounded-2xl border-2 shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#6E1409',
            color: '#FFFFFF',
            borderColor: '#D97706',
          }}
          className="shrink-0 flex items-center justify-between p-3 border-b"
        >
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: '#8B1E1E', color: '#FDE047' }}
              className="p-1.5 rounded-lg"
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3
                className="font-granth font-bold text-sm sm:text-base"
                style={{ color: '#FFFFFF' }}
              >
                {pickL(currentLang, 'HD पंचांग, चौघड़िया व स्टेटस कार्ड', 'HD Panchang, Choghadiya & Status Card', 'HD પંચાંગ, ચોઘડિયા અને સ્ટેટસ કાર્ડ')}
              </h3>
              <p className="text-[11px]" style={{ color: '#FDE68A' }}>
                {pickL(
                  currentLang,
                  'ज्योतिषी ब्रांडिंग के साथ पंचांग या चौघड़िया फोटो शेयर करें',
                  'Share Panchang or Choghadiya card with custom astrologer branding',
                  'જ્યોતિષી બ્રાન્ડિંગ સાથે પંચાંગ કે ચોઘડિયા ફોટો શેર કરો'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: '#4A0E0E', color: '#FFFFFF' }}
            className="p-1.5 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Template Switcher Bar */}
        <div
          style={{
            backgroundColor: '#FFF8EB',
            borderColor: '#D6B892',
          }}
          className="shrink-0 px-3 py-2 border-b grid grid-cols-3 gap-1.5"
        >
          {(
            [
              { id: 'panchang', label: pickL(currentLang, '📜 पंचांग कार्ड', '📜 Panchang Card', '📜 પંચાંગ કાર્ડ'), icon: Calendar },
              { id: 'choghadiya', label: pickL(currentLang, '⏰ शुभ चौघड़िया', '⏰ Choghadiya', '⏰ શુભ ચોઘડિયા'), icon: Clock },
              { id: 'status_9_16', label: pickL(currentLang, '📱 स्टेटस (9:16)', '📱 Status (9:16)', '📱 સ્ટેટસ (9:16)'), icon: Smartphone },
            ] as const
          ).map((tab) => {
            const active = templateMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTemplateMode(tab.id)}
                style={
                  active
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
                className="py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain p-3 sm:p-4 flex flex-col items-center space-y-2.5">
          {/* Card Preview */}
          <div
            style={{
              backgroundColor: '#E5CFAF',
              borderColor: '#8B1E1E',
            }}
            className={`w-full ${
              templateMode === 'status_9_16'
                ? 'max-w-[230px] aspect-[9/16]'
                : 'max-w-[290px] sm:max-w-[320px] aspect-[4/5]'
            } rounded-xl overflow-hidden border-2 shadow-md flex items-center justify-center shrink-0`}
          >
            {isGenerating || !imageUri ? (
              <div className="text-center p-4 space-y-2">
                <Sparkles className="w-6 h-6 animate-spin mx-auto" style={{ color: '#8B1E1E' }} />
                <p className="text-xs font-bold" style={{ color: '#3A1405' }}>
                  {pickL(currentLang, 'एचडी पोस्टर कार्ड तैयार हो रहा है...', 'Preparing HD Poster Card...', 'HD પોસ્ટર કાર્ડ તૈયાર થઈ રહ્યું છે...')}
                </p>
              </div>
            ) : (
              <img
                src={imageUri}
                alt={pickL(currentLang, 'दैनिक पंचांग कार्ड', 'Daily Panchang Card', 'દૈનિક પંચાંગ કાર્ડ')}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-lg"
              />
            )}
          </div>

          {/* Pandit Custom Branding Indicator / Shortcut */}
          <div
            style={{
              backgroundColor: '#FFFDF9',
              borderColor: '#D6B892',
            }}
            className="w-full p-2.5 border rounded-xl flex items-center justify-between text-xs shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Award className="w-4 h-4 shrink-0" style={{ color: '#8B1E1E' }} />
              <div className="truncate">
                <span className="font-bold" style={{ color: '#241005' }}>
                  {branding.enabled && branding.name
                    ? `${pickL(currentLang, 'परामर्शदाता:', 'Consultant:', 'પરામર્શદાતા:')} ${branding.name}`
                    : pickL(currentLang, 'साधारण ब्रांडिंग (शक्ति पंचांग)', 'Standard Branding (Shakti Panchang)', 'સામાન્ય બ્રાન્ડિંગ (શક્તિ પંચાંગ)')}
                </span>
                <span className="text-[11px] block truncate" style={{ color: '#5C2D0C' }}>
                  {branding.enabled
                    ? `📞 ${branding.phone || branding.city}`
                    : pickL(currentLang, 'कार्ड पर अपना नाम, पद व मोबाइल नंबर जोड़ें', 'Add your name, title & phone to the card', 'કાર્ડ પર તમારું નામ, પદ અને મોબાઈલ નંબર ઉમેરો')}
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
                style={{ backgroundColor: '#8B1E1E', color: '#FFFFFF' }}
                className="text-[11px] px-2.5 py-1 font-bold rounded-lg shrink-0 cursor-pointer"
              >
                {branding.enabled
                  ? pickL(currentLang, 'बदलें', 'Edit', 'બદલો')
                  : pickL(currentLang, 'कार्ड बनाएँ', 'Customize', 'કાર્ડ બનાવો')}
              </button>
            )}
          </div>

          {/* Action Buttons Grid */}
          <div className="w-full space-y-2 shrink-0">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{ backgroundColor: '#15803D', color: '#FFFFFF' }}
              className="w-full py-2.5 px-4 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{pickL(currentLang, 'व्हाट्सएप पर शेयर करें (WhatsApp Share)', 'Share on WhatsApp', 'વોટ્સએપ પર શેર કરો (WhatsApp Share)')}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={!imageUri}
                style={{ backgroundColor: '#6E1409', color: '#FFFFFF' }}
                className="py-2 px-3 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" style={{ color: '#86EFAC' }} />
                    <span>{pickL(currentLang, 'गैलरी में सेव!', 'Saved to Gallery!', 'ગેલેરીમાં સેવ!')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" style={{ color: '#FDE047' }} />
                    <span>{pickL(currentLang, 'HD चित्र डाउनलोड', 'Download HD Image', 'HD ચિત્ર ડાઉનલોડ')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#3A1405',
                  borderColor: '#C8A986',
                }}
                className="py-2 px-3 border font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" style={{ color: '#15803D' }} />
                    <span>{pickL(currentLang, 'कॉपी हो गया!', 'Copied!', 'કોપી થઈ ગયું!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" style={{ color: '#7C2D12' }} />
                    <span>{pickL(currentLang, 'टेक्स्ट कॉपी करें', 'Copy Text', 'ટેક્સ્ટ કોપી કરો')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
