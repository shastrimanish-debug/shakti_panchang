import { jsPDF } from 'jspdf';
import { VedicPanchangData, KundaliData } from '../types';

export interface BhojpatraPdfOptions {
  title?: string;
  panchang: VedicPanchangData;
  query: string;
  answer: string;
  activeKundali?: KundaliData | null;
  locationName?: string;
  date?: Date;
}

/**
 * Renders a magnificent Bhojpatra (Ancient Sacred Birch Bark) Vedic Patrika
 * onto an off-screen Canvas and compiles it into a high-fidelity PDF.
 */
export async function downloadBhojpatraPdf(options: BhojpatraPdfOptions): Promise<PdfResult> {
  const { panchang, query, answer, activeKundali, locationName, date = new Date() } = options;

  // A4 dimensions at 150 DPI for crisp typography without excessive payload
  const width = 1240;
  const height = 1754;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // 1. Draw Bhojpatra Birch-Bark Parchment Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#fbf3e0');
  bgGrad.addColorStop(0.3, '#f6ebd0');
  bgGrad.addColorStop(0.7, '#eedab3');
  bgGrad.addColorStop(1, '#e7ce9e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle natural birch bark grain & fibers
  ctx.fillStyle = 'rgba(120, 75, 30, 0.035)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 40 + Math.random() * 160;
    const h = 1.5 + Math.random() * 2;
    ctx.fillRect(x, y, w, h);
  }

  // 2. Ancient Sacred Borders (लाल व सुनहरी दोहरी ग्रन्थ पट्टिका)
  const outerPad = 32;
  ctx.strokeStyle = '#8b1e1e'; // Vermilion Vedic Red
  ctx.lineWidth = 6;
  ctx.strokeRect(outerPad, outerPad, width - outerPad * 2, height - outerPad * 2);

  const innerPad = 44;
  ctx.strokeStyle = '#c58f27'; // Antique Temple Gold
  ctx.lineWidth = 2.5;
  ctx.strokeRect(innerPad, innerPad, width - innerPad * 2, height - innerPad * 2);

  const subPad = 52;
  ctx.strokeStyle = 'rgba(139, 30, 30, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(subPad, subPad, width - subPad * 2, height - subPad * 2);

  // 3. Corner Ornamental Knots
  const drawCornerKnot = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#8b1e1e';
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('卐', 0, 0);
    ctx.restore();
  };
  drawCornerKnot(subPad + 16, subPad + 16);
  drawCornerKnot(width - subPad - 16, subPad + 16);
  drawCornerKnot(subPad + 16, height - subPad - 16);
  drawCornerKnot(width - subPad - 16, height - subPad - 16);

  // 4. Header & Invocations
  let cursorY = 95;

  // Invocation
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 26px "Tiro Devanagari Hindi", "Rozha One", serif';
  ctx.textAlign = 'center';
  ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥', width / 2, cursorY);

  cursorY += 42;
  ctx.fillStyle = '#4a2505';
  ctx.font = 'bold 36px "Rozha One", "Tiro Devanagari Hindi", serif';
  ctx.fillText('॥ श्री शक्ति पंचांग - उमा दिव्य मार्गदर्शन पत्रिका ॥', width / 2, cursorY);

  cursorY += 26;
  ctx.fillStyle = '#7a4b18';
  ctx.font = 'italic 18px "Tiro Devanagari Hindi", serif';
  ctx.fillText('वैदिक ज्योतिष, पंचांग, शुभाशुभ मुहूर्त एवं सनातन पराविद्या परामर्श', width / 2, cursorY);

  // Ornate central motif divider
  cursorY += 28;
  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 280, cursorY);
  ctx.lineTo(width / 2 + 280, cursorY);
  ctx.stroke();

  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 18px serif';
  ctx.fillText('❖  ॐ  卐  ॐ  ❖', width / 2, cursorY + 6);

  // 5. Vedic Panchang Shlokic Card Box
  cursorY += 36;
  const pBoxX = 75;
  const pBoxW = width - 150;
  const pBoxH = 150;

  ctx.fillStyle = 'rgba(255, 248, 230, 0.75)';
  ctx.fillRect(pBoxX, cursorY, pBoxW, pBoxH);
  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pBoxX, cursorY, pBoxW, pBoxH);

  // Box Title
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'left';
  ctx.fillText('॥ दैनिक वैदिक पंचांग विवरण ॥', pBoxX + 16, cursorY + 26);

  // Panchang Grid Information
  ctx.fillStyle = '#3a1f0a';
  ctx.font = '15px "Tiro Devanagari Hindi", serif';

  const col1X = pBoxX + 20;
  const col2X = pBoxX + 320;
  const col3X = pBoxX + 630;
  const col4X = pBoxX + 870;

  const dateStr = date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  let rY = cursorY + 54;
  ctx.fillText(`दिनांक: ${dateStr} (${panchang.weekday})`, col1X, rY);
  ctx.fillText(`तिथि: ${panchang.paksha} ${panchang.tithi}`, col2X, rY);
  ctx.fillText(`नक्षत्र: ${panchang.nakshatra} (चरण ${panchang.pada})`, col3X, rY);
  ctx.fillText(`स्थान: ${locationName || 'अयोध्या / दिल्ली'}`, col4X, rY);

  rY += 28;
  ctx.fillText(`योग: ${panchang.yoga}`, col1X, rY);
  ctx.fillText(`करण: ${panchang.karana}`, col2X, rY);
  ctx.fillText(`संवत्: ${panchang.samvat}`, col3X, rY);
  ctx.fillText(`सूर्य राशि: ${panchang.solarRashi}`, col4X, rY);

  rY += 28;
  const fmtT = (d: Date) => d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
  ctx.fillText(`सूर्योदय: ${fmtT(panchang.solar.sunrise)} | सूर्यास्त: ${fmtT(panchang.solar.sunset)}`, col1X, rY);
  ctx.fillText(`चंद्र राशि: ${panchang.lunarRashi}`, col2X, rY);
  if (activeKundali) {
    ctx.fillText(`जातक: ${activeKundali.name} (${activeKundali.lagnaRashi} लग्न)`, col3X, rY);
  } else {
    ctx.fillText(`दिशाशूल: ${panchang.weekday === 'रविवार' ? 'पश्चिम' : panchang.weekday === 'सोमवार' ? 'पूर्व' : 'सम्बन्धित दिशा'}`, col3X, rY);
  }
  ctx.fillText(`अंकन समय: ${timeStr}`, col4X, rY);

  cursorY += pBoxH + 30;

  // 6. User Query Section (जातक जिज्ञासा)
  if (query) {
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'left';
    ctx.fillText('॥ जातक जिज्ञासा व प्रश्न ॥', pBoxX, cursorY);

    cursorY += 12;
    ctx.fillStyle = '#2d1403';
    ctx.font = 'italic 16px "Tiro Devanagari Hindi", serif';
    const cleanQuery = query.replace(/\n/g, ' ');
    ctx.fillText(`“${cleanQuery}”`, pBoxX + 12, cursorY + 16);

    cursorY += 36;
  }

  // 7. Divine Uma AI Guidance (उमा दिव्य शास्त्र सम्मत समाधान)
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 20px "Tiro Devanagari Hindi", serif';
  ctx.fillText('॥ उमा दिव्य मार्गदर्शन व शास्त्र-सम्मत निर्णय ॥', pBoxX, cursorY);

  cursorY += 14;
  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pBoxX, cursorY);
  ctx.lineTo(width - pBoxX, cursorY);
  ctx.stroke();

  cursorY += 24;

  // Render text lines with word wrapping
  ctx.fillStyle = '#2a1403';
  ctx.font = '16px "Tiro Devanagari Hindi", serif';
  const maxWidth = width - pBoxX * 2 - 20;
  const lineHeight = 26;

  // Clean markdown tokens for printed bhojpatra
  const cleanAnswer = answer
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .trim();

  const paragraphs = cleanAnswer.split('\n');

  for (const para of paragraphs) {
    if (!para.trim()) {
      cursorY += 12;
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(currentLine, pBoxX + 8, cursorY);
        currentLine = words[n];
        cursorY += lineHeight;

        if (cursorY > height - 160) {
          // Page limit safeguard
          break;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine && cursorY <= height - 160) {
      ctx.fillText(currentLine, pBoxX + 8, cursorY);
      cursorY += lineHeight;
    }
  }

  // 8. Sacred Vedic Blessings & Seal at Bottom
  const footerY = height - 100;

  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pBoxX, footerY - 20);
  ctx.lineTo(width - pBoxX, footerY - 20);
  ctx.stroke();

  // Sacred Seal / Stamp
  ctx.save();
  ctx.strokeStyle = '#8b1e1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pBoxX + 45, footerY + 15, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 18px serif';
  ctx.textAlign = 'center';
  ctx.fillText('ॐ', pBoxX + 45, footerY + 15);
  ctx.font = '8px "Tiro Devanagari Hindi", serif';
  ctx.fillText('प्रमाणित', pBoxX + 45, footerY + 30);
  ctx.restore();

  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'center';
  ctx.fillText('॥ शुभम् भवतु • कल्याणमस्तु • धर्मो रक्षति रक्षितः ॥', width / 2 + 30, footerY + 10);

  ctx.fillStyle = '#7a4b18';
  ctx.font = '13px "Tiro Devanagari Hindi", serif';
  ctx.fillText('श्री शक्ति पंचांग संस्थान | उमा एआई वैदिक ज्योतिष प्रणाली द्वारा मुद्रित भोजपत्र पत्रिका', width / 2 + 30, footerY + 32);

  // 9. Generate and save PDF with jsPDF
  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  const dateObj = date instanceof Date ? date : new Date(date || Date.now());
  const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const sanitizedTitle = (options.title || 'Bhojpatra_Patrika')
    .replace(/[^\w\u0900-\u097F\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const fileName = `${sanitizedTitle}_${dateIso}.pdf`;
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // Safely trigger browser file download without crashing if blocked
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
  } catch (e) {
    try {
      pdf.save(fileName);
    } catch {}
  }

  return {
    fileName,
    blob,
    blobUrl,
    pageCount: 1,
  };
}

export interface MilanPdfOptions {
  boy: KundaliData;
  girl: KundaliData;
  milan: any;
  date?: Date;
}

export interface PdfResult {
  fileName: string;
  blob: Blob;
  blobUrl: string;
  pageCount: number;
}

export async function downloadMilanBhojpatraPdf(options: MilanPdfOptions): Promise<PdfResult> {
  const { boy, girl, milan, date = new Date() } = options;
  const width = 1240;
  const height = 1754;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Background Parchment
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#fbf3e0');
  bgGrad.addColorStop(0.3, '#f6ebd0');
  bgGrad.addColorStop(0.7, '#eedab3');
  bgGrad.addColorStop(1, '#e7ce9e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Texture
  ctx.fillStyle = 'rgba(120, 75, 30, 0.035)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 40 + Math.random() * 160;
    const h = 1.5 + Math.random() * 2;
    ctx.fillRect(x, y, w, h);
  }

  // Sacred Borders
  const outerPad = 32;
  ctx.strokeStyle = '#8b1e1e';
  ctx.lineWidth = 6;
  ctx.strokeRect(outerPad, outerPad, width - outerPad * 2, height - outerPad * 2);

  const innerPad = 44;
  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(innerPad, innerPad, width - innerPad * 2, height - innerPad * 2);

  const subPad = 52;
  ctx.strokeStyle = 'rgba(139, 30, 30, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(subPad, subPad, width - subPad * 2, height - subPad * 2);

  // Swastikas
  const drawCornerKnot = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#8b1e1e';
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('卐', 0, 0);
    ctx.restore();
  };
  drawCornerKnot(subPad + 16, subPad + 16);
  drawCornerKnot(width - subPad - 16, subPad + 16);
  drawCornerKnot(subPad + 16, height - subPad - 16);
  drawCornerKnot(width - subPad - 16, height - subPad - 16);

  let cursorY = 95;
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 26px "Tiro Devanagari Hindi", "Rozha One", serif';
  ctx.textAlign = 'center';
  ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥', width / 2, cursorY);

  cursorY += 42;
  ctx.fillStyle = '#4a2505';
  ctx.font = 'bold 36px "Rozha One", "Tiro Devanagari Hindi", serif';
  ctx.fillText('॥ श्री अष्टकूट गुण मिलान एवं वैवाहिक पत्रिका ॥', width / 2, cursorY);

  cursorY += 26;
  ctx.fillStyle = '#7a4b18';
  ctx.font = 'italic 18px "Tiro Devanagari Hindi", serif';
  ctx.fillText('वर-कन्या कुण्डली मिलान, मांगलिक विचार, नाड़ी व भकूट दोष विश्लेषण', width / 2, cursorY);

  // Divider
  cursorY += 28;
  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 280, cursorY);
  ctx.lineTo(width / 2 + 280, cursorY);
  ctx.stroke();

  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 18px serif';
  ctx.fillText('❖  शुभ विवाह मंगलम्  ❖', width / 2, cursorY + 6);

  cursorY += 36;
  // Couple Profile Box
  const pBoxX = 75;
  const pBoxW = width - 150;
  const pBoxH = 160;

  ctx.fillStyle = 'rgba(255, 248, 230, 0.75)';
  ctx.fillRect(pBoxX, cursorY, pBoxW, pBoxH);
  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pBoxX, cursorY, pBoxW, pBoxH);

  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'left';
  ctx.fillText('॥ वर एवं कन्या जन्म विवरण ॥', pBoxX + 16, cursorY + 26);

  ctx.fillStyle = '#3a1f0a';
  ctx.font = '14px "Tiro Devanagari Hindi", serif';
  const col1X = pBoxX + 24;
  const col2X = pBoxX + width / 2 - 40;

  const fmtBDate = (d: Date) => d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  let rY = cursorY + 52;
  ctx.fillText(`वर (Boy): ${boy.name}`, col1X, rY);
  ctx.fillText(`कन्या (Girl): ${girl.name}`, col2X, rY);

  rY += 24;
  ctx.fillText(`जन्म: ${fmtBDate(boy.birthDate)} | समय: ${boy.birthTime} (${boy.birthPlace})`, col1X, rY);
  ctx.fillText(`जन्म: ${fmtBDate(girl.birthDate)} | समय: ${girl.birthTime} (${girl.birthPlace})`, col2X, rY);

  rY += 24;
  ctx.fillText(`लग्न: ${boy.lagnaRashi} | चंद्र: ${boy.moonRashi} | नक्षत्र: ${boy.nakshatra} (${boy.charan})`, col1X, rY);
  ctx.fillText(`लग्न: ${girl.lagnaRashi} | चंद्र: ${girl.moonRashi} | नक्षत्र: ${girl.nakshatra} (${girl.charan})`, col2X, rY);

  rY += 24;
  ctx.fillText(`गण: ${boy.gana} | योनि: ${boy.yoni} | नाड़ी: ${boy.nadi} | वर्ण: ${boy.varna}`, col1X, rY);
  ctx.fillText(`गण: ${girl.gana} | योनि: ${girl.yoni} | नाड़ी: ${girl.nadi} | वर्ण: ${girl.varna}`, col2X, rY);

  cursorY += pBoxH + 24;

  // Total Score Banner
  const sBoxH = 65;
  ctx.fillStyle = milan.totalScore >= 21 ? 'rgba(230, 245, 230, 0.85)' : 'rgba(255, 235, 210, 0.85)';
  ctx.fillRect(pBoxX, cursorY, pBoxW, sBoxH);
  ctx.strokeStyle = '#8b1e1e';
  ctx.lineWidth = 2;
  ctx.strokeRect(pBoxX, cursorY, pBoxW, sBoxH);

  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 24px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'center';
  ctx.fillText(`कुल प्राप्तांक: ${milan.totalScore} / 36 गुण — ${milan.verdict}`, width / 2, cursorY + 42);

  cursorY += sBoxH + 26;

  // 8 Kootas Table
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'left';
  ctx.fillText('॥ अष्टकूट 8 घटकों का गुण विवरण ॥', pBoxX, cursorY);

  cursorY += 12;
  const thY = cursorY + 18;
  ctx.fillStyle = '#5C3A21';
  ctx.fillRect(pBoxX, cursorY, pBoxW, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
  ctx.fillText('कूट का नाम', pBoxX + 16, thY);
  ctx.fillText('प्राप्त', pBoxX + 200, thY);
  ctx.fillText('अधिकतम', pBoxX + 280, thY);
  ctx.fillText('वर मान', pBoxX + 370, thY);
  ctx.fillText('कन्या मान', pBoxX + 500, thY);
  ctx.fillText('शास्त्रीय फल व विश्लेषण', pBoxX + 640, thY);

  cursorY += 26;
  ctx.font = '13px "Tiro Devanagari Hindi", serif';
  milan.items.forEach((it: any, idx: number) => {
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 248, 235, 0.7)' : 'rgba(245, 235, 215, 0.7)';
    ctx.fillRect(pBoxX, cursorY, pBoxW, 24);
    ctx.strokeStyle = 'rgba(140, 98, 57, 0.2)';
    ctx.strokeRect(pBoxX, cursorY, pBoxW, 24);

    ctx.fillStyle = '#4a2505';
    ctx.fillText(it.name, pBoxX + 16, cursorY + 16);
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
    ctx.fillText(`${it.score}`, pBoxX + 210, cursorY + 16);
    ctx.font = '13px "Tiro Devanagari Hindi", serif';
    ctx.fillStyle = '#6b431e';
    ctx.fillText(`${it.max}`, pBoxX + 295, cursorY + 16);
    ctx.fillText(it.boyValue, pBoxX + 370, cursorY + 16);
    ctx.fillText(it.girlValue, pBoxX + 500, cursorY + 16);
    ctx.fillText(it.note, pBoxX + 640, cursorY + 16);

    cursorY += 24;
  });

  cursorY += 20;

  // Manglik, Nadi & Bhakoot Section
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 17px "Tiro Devanagari Hindi", serif';
  ctx.fillText('॥ मांगलिक विचार एवं विशेष दोष परिहार ॥', pBoxX, cursorY);

  cursorY += 10;
  const dBoxH = 140;
  ctx.fillStyle = 'rgba(255, 248, 230, 0.85)';
  ctx.fillRect(pBoxX, cursorY, pBoxW, dBoxH);
  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pBoxX, cursorY, pBoxW, dBoxH);

  ctx.fillStyle = '#2d1403';
  ctx.font = '13px "Tiro Devanagari Hindi", serif';
  let dY = cursorY + 22;

  if (milan.manglikAnalysis) {
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
    ctx.fillText(`• मांगलिक विचार: ${milan.manglikAnalysis.verdict}`, pBoxX + 16, dY);
    ctx.fillStyle = '#2d1403';
    ctx.font = '13px "Tiro Devanagari Hindi", serif';
    dY += 20;
    ctx.fillText(`  वर: ${milan.manglikAnalysis.boyNote} | कन्या: ${milan.manglikAnalysis.girlNote}`, pBoxX + 16, dY);
    dY += 20;
    ctx.fillText(`  परिहार: ${milan.manglikAnalysis.cancellationReason}`, pBoxX + 16, dY);
    dY += 22;
  }

  if (milan.nadiDosha) {
    ctx.fillText(`• नाड़ी विचार: वर नाड़ी (${milan.nadiDosha.boyNadi}) vs कन्या नाड़ी (${milan.nadiDosha.girlNadi}) — ${milan.nadiDosha.hasDosha ? milan.nadiDosha.remedy : 'निर्दोष नाड़ी'}`, pBoxX + 16, dY);
    dY += 22;
  }

  if (milan.bhakootDosha) {
    ctx.fillText(`• भकूट विचार: ${milan.bhakootDosha.hasDosha ? milan.bhakootDosha.remedy : 'निर्दोष भकूट संबंध'}`, pBoxX + 16, dY);
  }

  // Footer
  const footerY = height - 90;
  ctx.strokeStyle = '#c58f27';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pBoxX, footerY - 16);
  ctx.lineTo(width - pBoxX, footerY - 16);
  ctx.stroke();

  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'center';
  ctx.fillText('॥ स्वस्ति न इन्द्रो वृद्धश्रवाः • कल्याणमस्तु • शुभ विवाह ॥', width / 2, footerY + 10);

  ctx.fillStyle = '#7a4b18';
  ctx.font = '13px "Tiro Devanagari Hindi", serif';
  ctx.fillText('श्री शक्ति पंचांग संस्थान | प्रमाणित अष्टकूट गुण मिलान भोजपत्र पत्रिका', width / 2, footerY + 30);

  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  const sanitizedBoy = (boy.name || 'Var').replace(/[^\w\u0900-\u097F\s-]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedGirl = (girl.name || 'Kanya').replace(/[^\w\u0900-\u097F\s-]/g, '').trim().replace(/\s+/g, '_');
  const fileName = `Milan_Bhojpatra_Patrika_${sanitizedBoy}_${sanitizedGirl}.pdf`;
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // Safely trigger browser file download without crashing if blocked
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
  } catch (e) {
    try {
      pdf.save(fileName);
    } catch {}
  }

  return {
    fileName,
    blob,
    blobUrl,
    pageCount: 1,
  };
}
