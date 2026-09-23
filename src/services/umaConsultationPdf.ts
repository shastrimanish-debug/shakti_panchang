import { jsPDF } from 'jspdf';
import { VedicPanchangData, KundaliData } from '../types';
import { getAstrologerBranding, AstrologerBranding } from './storage';
import { waitForPdfFonts, type PdfResult } from './pdfFonts';
import { PDF_MM_H, PDF_MM_W, PDF_PX_H, PDF_PX_W } from './pdfPage';

export interface UmaConsultationPdfOptions {
  panchang: VedicPanchangData;
  query: string;
  answer: string;
  activeKundali?: KundaliData | null;
  locationName?: string;
  consultationDate?: Date;
  branding?: AstrologerBranding;
}

/**
 * Generates an official, high-fidelity Vedic Astrology Consultation Report PDF
 * featuring the Client Details, Kundali Coordinates, Query, Astrological Analysis,
 * Sanskrit Shlokas, Remedies, and Astrologer Digital Visiting Card Stamp.
 */
export async function downloadUmaConsultationPdf(
  options: UmaConsultationPdfOptions
): Promise<PdfResult> {
  await waitForPdfFonts();
  const {
    panchang,
    query,
    answer,
    activeKundali,
    locationName = 'भारत',
    consultationDate = new Date(),
    branding = getAstrologerBranding(),
  } = options;

  const width = PDF_PX_W;
  const height = PDF_PX_H;

  // Split cleaned paragraphs
  const cleanAnswer = answer
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .trim();
  const paragraphs = cleanAnswer.split('\n');

  // Pre-calculate line breaks to support multi-page reports gracefully
  const pBoxX = 75;
  const pBoxW = width - 150;
  const maxWidth = pBoxW - 24;
  const lineHeight = 28;

  // We will create canvas pages as needed
  const canvasPages: HTMLCanvasElement[] = [];

  const createBlankParchmentPage = (pageIndex: number, totalEstPages: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    // 1. Birch-bark parchment gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#FAF2E4');
    bgGrad.addColorStop(0.3, '#F5E7CC');
    bgGrad.addColorStop(0.7, '#EEDBB5');
    bgGrad.addColorStop(1, '#E6CFA0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grain texture
    ctx.fillStyle = 'rgba(120, 75, 30, 0.03)';
    for (let i = 0; i < 350; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const w = 40 + Math.random() * 150;
      const h = 1.5 + Math.random() * 2;
      ctx.fillRect(x, y, w, h);
    }

    // Traditional red and gold borders
    const outerPad = 32;
    ctx.strokeStyle = '#7A1D1D';
    ctx.lineWidth = 5;
    ctx.strokeRect(outerPad, outerPad, width - outerPad * 2, height - outerPad * 2);

    const innerPad = 44;
    ctx.strokeStyle = '#B58738';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(innerPad, innerPad, width - innerPad * 2, height - innerPad * 2);

    const subPad = 52;
    ctx.strokeStyle = 'rgba(122, 29, 29, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(subPad, subPad, width - subPad * 2, height - subPad * 2);

    // Corner Auspicious Knots
    const drawKnot = (x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#7A1D1D';
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('卐', 0, 0);
      ctx.restore();
    };
    drawKnot(subPad + 16, subPad + 16);
    drawKnot(width - subPad - 16, subPad + 16);
    drawKnot(subPad + 16, height - subPad - 16);
    drawKnot(width - subPad - 16, height - subPad - 16);

    // Header strip on top
    let cursorY = 90;
    ctx.fillStyle = '#7A1D1D';
    ctx.font = 'bold 24px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥', width / 2, cursorY);

    cursorY += 38;
    ctx.fillStyle = '#3E2714';
    ctx.font = 'bold 32px "Rozha One", "Tiro Devanagari Hindi", serif';
    ctx.fillText('॥ श्री शक्ति वैदिक ज्योतिष परामर्श रिपोर्ट ॥', width / 2, cursorY);

    cursorY += 24;
    ctx.fillStyle = '#735133';
    ctx.font = 'italic 16px "Tiro Devanagari Hindi", serif';
    ctx.fillText(
      'उमा (UMA) एआई वैदिक ज्योतिषाचार्य एवं प्रामाणिक शास्त्रोक्त मार्गदर्शन',
      width / 2,
      cursorY
    );

    cursorY += 24;
    ctx.strokeStyle = '#B58738';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, cursorY);
    ctx.lineTo(width / 2 + 250, cursorY);
    ctx.stroke();

    ctx.fillStyle = '#7A1D1D';
    ctx.font = 'bold 16px serif';
    ctx.fillText('❖  ॐ  कल्याणमस्तु  ॐ  ❖', width / 2, cursorY + 5);

    return { canvas, ctx, startY: cursorY + 30 };
  };

  // Draw Page 1
  const page1 = createBlankParchmentPage(0, 1);
  let ctx = page1.ctx;
  let currentCanvas = page1.canvas;
  canvasPages.push(currentCanvas);
  let cursorY = page1.startY;

  // 1. Client & Kundali Profile Box (जातक जन्म एवं कुण्डली विवरण)
  const cBoxH = activeKundali ? 150 : 100;
  ctx.fillStyle = 'rgba(255, 252, 242, 0.85)';
  ctx.fillRect(pBoxX, cursorY, pBoxW, cBoxH);
  ctx.strokeStyle = '#B58738';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pBoxX, cursorY, pBoxW, cBoxH);

  ctx.fillStyle = '#7A1D1D';
  ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    activeKundali ? '॥ जातक परिचय एवं जन्म कुण्डली विवरण ॥' : '॥ परामर्श कालीन पंचांग विवरण ॥',
    pBoxX + 16,
    cursorY + 24
  );

  ctx.fillStyle = '#3E2714';
  ctx.font = '14px "Tiro Devanagari Hindi", serif';

  const col1 = pBoxX + 18;
  const col2 = pBoxX + 310;
  const col3 = pBoxX + 610;
  const col4 = pBoxX + 850;

  const consultDateStr = consultationDate.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const consultTimeStr = consultationDate.toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (activeKundali) {
    let rY = cursorY + 52;
    ctx.fillText(`जातक नाम: ${activeKundali.name}`, col1, rY);
    ctx.fillText(
      `जन्म दिनांक: ${new Date(activeKundali.birthDate).toLocaleDateString('hi-IN')}`,
      col2,
      rY
    );
    ctx.fillText(`जन्म समय: ${activeKundali.birthTime || 'सटीक'}`, col3, rY);
    ctx.fillText(`जन्म स्थान: ${activeKundali.birthPlace}`, col4, rY);

    rY += 26;
    ctx.fillText(`लग्न: ${activeKundali.lagnaRashi}`, col1, rY);
    ctx.fillText(`चंद्र राशि: ${activeKundali.moonRashi}`, col2, rY);
    ctx.fillText(`नक्षत्र: ${activeKundali.nakshatra} (चरण ${activeKundali.charan || 1})`, col3, rY);
    ctx.fillText(`सूर्य राशि: ${activeKundali.sunRashi || 'शुभ'}`, col4, rY);

    rY += 26;
    ctx.fillText(`विंशोत्तरी महादशा: ${activeKundali.mahadasha}`, col1, rY);
    ctx.fillText(`मांगलिक विचार: ${activeKundali.isManglik ? 'हाँ (मांगलिक)' : 'निर्दोष (अमंगल)'}`, col2, rY);
    ctx.fillText(`परामर्श दिनांक: ${consultDateStr}`, col3, rY);
    ctx.fillText(`परामर्श समय: ${consultTimeStr}`, col4, rY);
  } else {
    let rY = cursorY + 52;
    ctx.fillText(`परामर्श दिनांक: ${consultDateStr} (${panchang.weekday})`, col1, rY);
    ctx.fillText(`तिथि: ${panchang.paksha} ${panchang.tithi}`, col2, rY);
    ctx.fillText(`नक्षत्र: ${panchang.nakshatra}`, col3, rY);
    ctx.fillText(`स्थान: ${locationName}`, col4, rY);

    rY += 26;
    ctx.fillText(`योग: ${panchang.yoga} | करण: ${panchang.karana}`, col1, rY);
    ctx.fillText(`चंद्र राशि: ${panchang.lunarRashi}`, col2, rY);
    ctx.fillText(`संवत्: ${panchang.samvat}`, col3, rY);
    ctx.fillText(`समय: ${consultTimeStr}`, col4, rY);
  }

  cursorY += cBoxH + 24;

  // 2. Query Box (जातक द्वारा पूछा गया प्रश्न)
  if (query) {
    ctx.fillStyle = '#7A1D1D';
    ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
    ctx.fillText('॥ जातक जिज्ञासा / विचारणीय प्रश्न ॥', pBoxX, cursorY);

    cursorY += 10;
    const cleanQ = query.replace(/\n/g, ' ');
    ctx.fillStyle = 'rgba(255, 252, 242, 0.7)';
    ctx.fillRect(pBoxX, cursorY, pBoxW, 44);
    ctx.strokeStyle = '#B58738';
    ctx.lineWidth = 1;
    ctx.strokeRect(pBoxX, cursorY, pBoxW, 44);

    ctx.fillStyle = '#2C0A0A';
    ctx.font = 'italic 15px "Tiro Devanagari Hindi", serif';
    ctx.fillText(`“${cleanQ}”`, pBoxX + 16, cursorY + 27, maxWidth - 20);

    cursorY += 60;
  }

  // 3. Section Title: Astrological Decision & Analysis
  ctx.fillStyle = '#7A1D1D';
  ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
  ctx.fillText('॥ उमा ज्योतिषाचार्य निर्णय, शास्त्रोक्त फलादेश एवं सात्विक उपाय ॥', pBoxX, cursorY);

  cursorY += 10;
  ctx.strokeStyle = '#B58738';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(pBoxX, cursorY);
  ctx.lineTo(width - pBoxX, cursorY);
  ctx.stroke();

  cursorY += 22;

  // Footer space reserved on every page
  const footerHeight = 160;
  const maxY = height - footerHeight;

  // Helper to render text paragraph with wrap
  ctx.fillStyle = '#2A1403';
  ctx.font = '15px "Tiro Devanagari Hindi", serif';

  for (const para of paragraphs) {
    if (!para.trim()) {
      cursorY += 10;
      continue;
    }

    const isHeader = para.startsWith('॥') || para.startsWith('**') || para.endsWith(':');
    if (isHeader) {
      ctx.fillStyle = '#7A1D1D';
      ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
    } else {
      ctx.fillStyle = '#2A1403';
      ctx.font = '15px "Tiro Devanagari Hindi", serif';
    }

    const words = para.split(' ');
    let line = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = line ? `${line} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, pBoxX + 10, cursorY);
        line = words[i];
        cursorY += lineHeight;

        // Check if page overflow
        if (cursorY > maxY) {
          // Draw page number on current canvas
          drawPageFooter(ctx, width, height, canvasPages.length, branding);

          // Create next page
          const nextPage = createBlankParchmentPage(canvasPages.length, canvasPages.length + 1);
          ctx = nextPage.ctx;
          currentCanvas = nextPage.canvas;
          canvasPages.push(currentCanvas);
          cursorY = nextPage.startY + 10;
          ctx.fillStyle = '#2A1403';
          ctx.font = '15px "Tiro Devanagari Hindi", serif';
        }
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.fillText(line, pBoxX + 10, cursorY);
      cursorY += lineHeight;
    }
  }

  // Draw final footer on the last canvas
  drawPageFooter(ctx, width, height, canvasPages.length, branding, true);

  // Compile PDF from canvases using jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PDF_MM_W, PDF_MM_H],
  });

  canvasPages.forEach((c, idx) => {
    if (idx > 0) pdf.addPage([PDF_MM_W, PDF_MM_H], 'portrait');
    const imgData = c.toDataURL('image/jpeg', 0.9);
    pdf.addImage(imgData, 'JPEG', 0, 0, PDF_MM_W, PDF_MM_H, undefined, 'FAST');
  });

  const jatakName = (activeKundali?.name || 'Jatak')
    .replace(/[^\w\u0900-\u097F\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const dateIso = consultationDate.toISOString().slice(0, 10);
  const fileName = `Vedic_Astrology_Consultation_${jatakName}_${dateIso}.pdf`;

  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // Trigger safe download
  try {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 500);
  } catch {
    try {
      pdf.save(fileName);
    } catch {}
  }

  return {
    fileName,
    blob,
    blobUrl,
    pageCount: canvasPages.length,
  };
}

/**
 * Renders the Astrologer Digital Visiting Card Stamp and Vedic Seal on the bottom of page
 */
function drawPageFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pageNum: number,
  branding: AstrologerBranding,
  isLastPage: boolean = false
) {
  const footerY = height - 120;
  const pBoxX = 75;

  ctx.strokeStyle = '#B58738';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pBoxX, footerY - 14);
  ctx.lineTo(width - pBoxX, footerY - 14);
  ctx.stroke();

  // Sacred Seal on bottom-left
  ctx.save();
  ctx.strokeStyle = '#7A1D1D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pBoxX + 45, footerY + 32, 28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#7A1D1D';
  ctx.font = 'bold 18px serif';
  ctx.textAlign = 'center';
  ctx.fillText('ॐ', pBoxX + 45, footerY + 30);
  ctx.font = '9px "Tiro Devanagari Hindi", serif';
  ctx.fillText('प्रमाणित', pBoxX + 45, footerY + 46);
  ctx.restore();

  // Astrologer Branding / Visiting Card text
  ctx.fillStyle = '#7A1D1D';
  ctx.font = 'bold 17px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'left';

  const astName = branding.enabled && branding.name ? branding.name : 'ज्योतिषाचार्य मनीष शास्त्री';
  const astTitle =
    branding.enabled && branding.title ? branding.title : 'वैदिक ज्योतिषी एवं कर्मकांड मर्मज्ञ';
  const astSansthan =
    branding.enabled && branding.sansthan
      ? branding.sansthan
      : 'श्री शक्ति वैदिक ज्योतिष एवं पंचांग संस्थान';
  const astContact =
    branding.enabled && branding.phone
      ? `संपर्क: ${branding.phone} | ${branding.city || 'भारत'}`
      : `स्थान: ${branding.city || 'वाराणसी / दिल्ली'} | ॥ धर्मो रक्षति रक्षितः ॥`;

  ctx.fillText(astName, pBoxX + 90, footerY + 16);

  ctx.fillStyle = '#3E2714';
  ctx.font = '13px "Tiro Devanagari Hindi", serif';
  ctx.fillText(`${astTitle} • ${astSansthan}`, pBoxX + 90, footerY + 36);

  ctx.fillStyle = '#735133';
  ctx.font = 'italic 12px "Tiro Devanagari Hindi", serif';
  ctx.fillText(astContact, pBoxX + 90, footerY + 54);

  // Blessing and Page Number on the right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#7A1D1D';
  ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
  ctx.fillText('॥ शुभम् भवतु • कल्याणमस्तु ॥', width - pBoxX - 10, footerY + 22);

  ctx.fillStyle = '#8C6239';
  ctx.font = '12px "Tiro Devanagari Hindi", serif';
  ctx.fillText(`पृष्ठ संख्या ${pageNum}`, width - pBoxX - 10, footerY + 46);
}

/**
 * Generates an elegantly formatted WhatsApp message string for 1-click sharing to clients
 */
export function formatWhatsAppConsultationMessage(params: {
  activeKundali?: KundaliData | null;
  query: string;
  answer: string;
  panchang: VedicPanchangData;
  branding?: AstrologerBranding;
}): string {
  const { activeKundali, query, answer, panchang, branding = getAstrologerBranding() } = params;

  const cleanAns = answer
    .replace(/\*\*(.*?)\*\*/g, '*$1*') // Keep WhatsApp bold format
    .replace(/#{1,6}\s?/g, '')
    .trim();

  const astName = branding.enabled && branding.name ? branding.name : 'ज्योतिषाचार्य मनीष शास्त्री';
  const astTitle = branding.enabled && branding.title ? branding.title : 'वैदिक ज्योतिषाचार्य';
  const astPhone = branding.enabled && branding.phone ? branding.phone : '';
  const astSansthan =
    branding.enabled && branding.sansthan
      ? branding.sansthan
      : 'श्री शक्ति सनातन वैदिक पंचांग';

  let msg = `॥ ॐ श्री गणेशाय नमः ॥ 🌺\n`;
  msg += `*${astSansthan}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📜 *ज्योतिषीय परामर्श व शास्त्रोक्त निर्णय*\n\n`;

  if (activeKundali) {
    msg += `👤 *जातक:* ${activeKundali.name}\n`;
    msg += `🌟 *लग्न:* ${activeKundali.lagnaRashi} | *राशि:* ${activeKundali.moonRashi} (${activeKundali.nakshatra})\n`;
    msg += `🪐 *वर्तमान दशा:* ${activeKundali.mahadasha}\n`;
  } else {
    msg += `📅 *दिनांक:* ${panchang.date.toLocaleDateString('hi-IN')} (${panchang.weekday})\n`;
    msg += `✨ *तिथि:* ${panchang.paksha} ${panchang.tithi} | *नक्षत्र:* ${panchang.nakshatra}\n`;
  }

  if (query) {
    msg += `\n❓ *जातक का प्रश्न:* "${query.trim()}"\n`;
  }

  msg += `\n🔮 *उमा शास्त्रीय फलादेश व उपाय:*\n${cleanAns}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `⚜️ *परामर्शदाता:* ${astName} (${astTitle})\n`;
  if (astPhone) {
    msg += `📞 *संपर्क:* ${astPhone}\n`;
  }
  msg += `॥ शुभम् भवतु • धर्मो रक्षति रक्षितः ॥`;

  return msg;
}

/**
 * Opens WhatsApp directly with pre-filled encoded text
 */
export function openWhatsAppShare(text: string, phoneNumber?: string) {
  const encoded = encodeURIComponent(text);
  let cleanPhone = (phoneNumber || '').replace(/\D/g, '');
  if (cleanPhone && cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;

  window.open(url, '_blank');
}
