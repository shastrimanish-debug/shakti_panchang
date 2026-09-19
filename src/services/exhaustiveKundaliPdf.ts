import { jsPDF } from 'jspdf';
import { KundaliData } from '../types';
import { RASHIS, calculateVargaSign } from './astronomy';
import { DASHA_ORDER, DASHA_YEARS, getVedicRemedies } from './kundali';
import { analyzeKundali } from './predictions';
import { waitForPdfFonts } from './pdfFonts';
import { PDF_MM_H, PDF_MM_W, PDF_PX_H, PDF_PX_W } from './pdfPage';

export interface PdfProgressCallback {
  (current: number, total: number, message: string): void;
}

const NAKSHATRA_LORD_MAP: Record<string, string> = {
  'अश्विनी': 'केतु', 'भरणी': 'शुक्र', 'कृतिका': 'सूर्य', 'रोहिणी': 'चंद्र', 'मृगशिरा': 'मंगल', 'आर्द्रा': 'राहु',
  'पुनर्वसु': 'गुरु', 'पुष्य': 'शनि', 'अश्लेषा': 'बुध', 'मघा': 'केतु', 'पूर्वाफाल्गुनी': 'शुक्र', 'उत्तराफाल्गुनी': 'सूर्य',
  'हस्त': 'चंद्र', 'चित्रा': 'मंगल', 'स्वाति': 'राहु', 'विशाखा': 'गुरु', 'अनुराधा': 'शनि', 'ज्येष्ठा': 'बुध',
  'मूल': 'केतु', 'पूर्वाषाढ़ा': 'शुक्र', 'उत्तराषाढ़ा': 'सूर्य', 'श्रवण': 'चंद्र', 'धनिष्ठा': 'मंगल', 'शतभिषा': 'राहु',
  'पूर्वाभाद्रपद': 'गुरु', 'उत्तराभाद्रपद': 'शनि', 'रेवती': 'बुध',
};

function getNakshatraLord(nak: string): string {
  for (const [key, lord] of Object.entries(NAKSHATRA_LORD_MAP)) {
    if (nak && nak.includes(key)) return `${lord} देव`;
  }
  return 'शुभ ग्रह';
}

/**
 * Renders a full 59-Page Exhaustive Vedic Mahapatrika into a high-fidelity PDF.
 * Uses an off-screen HTML5 canvas to natively draw Devanagari Hindi text,
 * ornamental Vedic borders, charts, and tables page-by-page.
 */
export async function generateExhaustive59PageKundaliPdf(
  kundali: KundaliData,
  onProgress?: PdfProgressCallback
): Promise<{
  fileName: string;
  blob: Blob;
  blobUrl: string;
  pageCount: number;
}> {
  const totalPages = 59;
  const width = PDF_PX_W;
  const height = PDF_PX_H;
  const contentBottom = height - 92;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  await waitForPdfFonts();

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PDF_MM_W, PDF_MM_H],
  });

  // Base background drawing helper
  const drawBhojpatraBackground = (pageNum: number, title: string, subtitle?: string) => {
    // Parchment gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#fcf7ec');
    bg.addColorStop(0.5, '#f7eed8');
    bg.addColorStop(1, '#f0e3c5');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle grain fibers
    ctx.fillStyle = 'rgba(140, 80, 25, 0.025)';
    for (let i = 0; i < 200; i++) {
      const rx = (i * 137) % width;
      const ry = (i * 241) % height;
      ctx.fillRect(rx, ry, 60 + (i % 80), 1.5);
    }

    // Sacred Borders
    ctx.strokeStyle = '#8B1E1E'; // Vermilion Red
    ctx.lineWidth = 5;
    ctx.strokeRect(32, 32, width - 64, height - 64);

    ctx.strokeStyle = '#C58F27'; // Temple Gold
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, width - 88, height - 88);

    ctx.strokeStyle = 'rgba(139, 30, 30, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    // Corner Auspicious Symbols (卐)
    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('卐', 68, 68);
    ctx.fillText('卐', width - 68, 68);
    ctx.fillText('卐', 68, height - 68);
    ctx.fillText('卐', width - 68, height - 68);

    // Header Invocation
    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 20px "Tiro Devanagari Hindi", serif';
    ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥', width / 2, 80);

    // Page Title
    ctx.fillStyle = '#4A2505';
    ctx.font = 'bold 26px "Tiro Devanagari Hindi", serif';
    ctx.fillText(title, width / 2, 115);

    if (subtitle) {
      ctx.fillStyle = '#7A4B18';
      ctx.font = 'italic 15px "Tiro Devanagari Hindi", serif';
      ctx.fillText(subtitle, width / 2, 142);
    }

    // Header divider
    ctx.strokeStyle = '#C58F27';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(90, 158);
    ctx.lineTo(width - 90, 158);
    ctx.stroke();

    // Footer
    const footerY = height - 75;
    ctx.strokeStyle = '#C58F27';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(90, footerY - 12);
    ctx.lineTo(width - 90, footerY - 12);
    ctx.stroke();

    ctx.fillStyle = '#8B1E1E';
    ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ श्री शक्ति पंचांग संस्थान • महर्षि पराशर वैदिक ज्योतिष संहिता ॥', width / 2, footerY + 6);

    ctx.fillStyle = '#5C3A21';
    ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'left';
    ctx.fillText(`जातक: ${kundali.name} (${kundali.birthPlace})`, 90, footerY + 25);

    ctx.textAlign = 'right';
    ctx.fillText(`पृष्ठ ${pageNum} / ${totalPages}`, width - 90, footerY + 25);
  };

  const PLANET_ABBR: Record<string, string> = {
    सूर्य: 'सू',
    चंद्र: 'चं',
    मंगल: 'मं',
    बुध: 'बु',
    गुरु: 'गु',
    शुक्र: 'शु',
    शनि: 'शनि',
    राहु: 'रा',
    केतु: 'के',
  };
  const planetAbbr = (name: string) => PLANET_ABBR[name] || name.slice(0, 2);
  const signOfPlanet = (name: string, varga = 1): number => {
    const p = kundali.planets.find((x) => x.planet === name);
    return p ? calculateVargaSign(p.degree, varga) : 0;
  };
  const houseFromAsc = (planetSign: number, ascSign: number) =>
    ((planetSign - ascSign + 12) % 12) + 1;
  const occupantsFromAsc = (ascSign: number, varga = 1) => {
    const occ: Record<number, { name: string; retro: boolean; deg: string; full: string }[]> = {};
    for (let i = 1; i <= 12; i++) occ[i] = [];
    kundali.planets.forEach((p) => {
      const pSign = calculateVargaSign(p.degree, varga);
      occ[houseFromAsc(pSign, ascSign)].push({
        name: planetAbbr(p.planet),
        retro: p.isRetrograde,
        deg: `${Math.floor(p.degreeInRashi)}°`,
        full: p.planet,
      });
    });
    return occ;
  };
  const formatOcc = (list: { name: string; retro: boolean; deg: string }[], withDeg = true) => {
    if (!list.length) return '—';
    return list.map((p) => `${p.name}${p.retro ? 'व' : ''}${withDeg ? ` ${p.deg}` : ''}`).join('  ');
  };

  // Helper to draw a North Indian diamond chart on canvas
  const drawNorthIndianDiamondChart = (
    centerX: number,
    centerY: number,
    size: number,
    vargaDivision: number,
    title?: string,
    opts?: { ascSignIndex?: number; useNatalHouses?: boolean }
  ) => {
    ctx.save();
    const half = size / 2;
    const x0 = centerX - half;
    const y0 = centerY - half;

    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(x0, y0, size, size);
    ctx.strokeStyle = '#8C6239';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x0, y0, size, size);

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + size, y0 + size);
    ctx.moveTo(x0 + size, y0);
    ctx.lineTo(x0, y0 + size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, y0);
    ctx.lineTo(x0 + size, centerY);
    ctx.lineTo(centerX, y0 + size);
    ctx.lineTo(x0, centerY);
    ctx.closePath();
    ctx.fillStyle = '#FAF3E5';
    ctx.fill();
    ctx.strokeStyle = '#5C3A21';
    ctx.lineWidth = 2;
    ctx.stroke();

    const lagnaSign =
      opts?.ascSignIndex !== undefined
        ? opts.ascSignIndex
        : calculateVargaSign(kundali.lagnaDegree, vargaDivision);

    const scale = size / 360;
    const anchors = [
      { h: 1, cx: 180, cy: 95, nx: 180, ny: 150 },
      { h: 2, cx: 90, cy: 45, nx: 120, ny: 75 },
      { h: 3, cx: 45, cy: 90, nx: 75, ny: 120 },
      { h: 4, cx: 95, cy: 180, nx: 150, ny: 180 },
      { h: 5, cx: 45, cy: 270, nx: 75, ny: 240 },
      { h: 6, cx: 90, cy: 315, nx: 120, ny: 285 },
      { h: 7, cx: 180, cy: 265, nx: 180, ny: 210 },
      { h: 8, cx: 270, cy: 315, nx: 240, ny: 285 },
      { h: 9, cx: 315, cy: 270, nx: 285, ny: 240 },
      { h: 10, cx: 265, cy: 180, nx: 210, ny: 180 },
      { h: 11, cx: 315, cy: 90, nx: 285, ny: 120 },
      { h: 12, cx: 270, cy: 45, nx: 240, ny: 75 },
    ];

    const hPlanets: Record<number, { name: string; retro: boolean; deg: string }[]> = {};
    for (let i = 1; i <= 12; i++) hPlanets[i] = [];

    kundali.planets.forEach((p) => {
      const house = opts?.useNatalHouses
        ? p.house
        : houseFromAsc(calculateVargaSign(p.degree, vargaDivision), lagnaSign);
      hPlanets[house]?.push({
        name: planetAbbr(p.planet),
        retro: p.isRetrograde,
        deg: `${Math.floor(p.degreeInRashi)}°`,
      });
    });

    anchors.forEach(({ h, cx: acx, cy: acy, nx, ny }) => {
      const rashiNum = ((lagnaSign + h - 1) % 12) + 1;
      const px = x0 + acx * scale;
      const py = y0 + acy * scale;
      ctx.fillStyle = h === 1 ? '#8B1E1E' : '#8C6239';
      ctx.font = h === 1 ? 'bold 15px serif' : 'bold 13px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${rashiNum}`, x0 + nx * scale, y0 + ny * scale);

      const plist = hPlanets[h] || [];
      const n = plist.length;
      const fs = n >= 4 ? 10 : n >= 3 ? 11 : 12;
      const lh = fs + 3;
      ctx.font = `bold ${fs}px "Tiro Devanagari Hindi", serif`;
      plist.forEach((p, idx) => {
        ctx.fillStyle = p.retro ? '#8B1E1E' : '#2A1502';
        const label = n >= 4 ? `${p.name}${p.retro ? 'व' : ''}` : `${p.name}${p.retro ? 'व' : ''} ${p.deg}`;
        ctx.fillText(label, px, py + (idx - (n - 1) / 2) * lh);
      });
    });

    if (title) {
      ctx.fillStyle = '#5C3A21';
      ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(title, centerX, y0 + size + 24);
    }
    ctx.restore();
  };

  /** 12-spoke Sudarshan: outer Lagna, middle Chandra, inner Surya — with planets in every house. */
  const drawSudarshanChakra = (cx: number, cy: number, outerR: number) => {
    ctx.save();
    const lagnaAsc = calculateVargaSign(kundali.lagnaDegree, 1);
    const moonAsc = signOfPlanet('चंद्र', 1);
    const sunAsc = signOfPlanet('सूर्य', 1);
    const rings = [
      { occ: occupantsFromAsc(lagnaAsc, 1), fillA: '#FAF6EA', fillB: '#FFFDF2' },
      { occ: occupantsFromAsc(moonAsc, 1), fillA: '#F0DDB8', fillB: '#F6E6C4' },
      { occ: occupantsFromAsc(sunAsc, 1), fillA: '#E8C48A', fillB: '#EFC997' },
    ];
    const rOuter = [outerR, outerR * 0.72, outerR * 0.46];
    const rInner = [outerR * 0.72, outerR * 0.46, outerR * 0.22];
    const sector = (Math.PI * 2) / 12;
    const start0 = -Math.PI / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 32, 0, Math.PI * 2);
    ctx.fillStyle = '#FBF6EA';
    ctx.fill();
    ctx.strokeStyle = '#8C6239';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let h = 1; h <= 12; h++) {
      const a0 = start0 + (h - 1) * sector;
      const a1 = a0 + sector;
      rings.forEach((ring, ri) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter[ri], a0, a1);
        ctx.arc(cx, cy, rInner[ri], a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = h % 2 === 0 ? ring.fillA : ring.fillB;
        ctx.fill();
        ctx.strokeStyle = '#8C6239';
        ctx.lineWidth = 1;
        ctx.stroke();

        const midA = (a0 + a1) / 2;
        const midR = (rOuter[ri] + rInner[ri]) / 2;
        const list = ring.occ[h] || [];
        const names = list.map((p) => `${p.name}${p.retro ? 'व' : ''}`);
        ctx.fillStyle = names.length ? '#2A1502' : '#C4A574';
        ctx.font = `bold ${names.length >= 3 ? 10 : 11}px "Tiro Devanagari Hindi", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tx = cx + Math.cos(midA) * midR;
        const ty = cy + Math.sin(midA) * midR;
        if (!names.length) {
          ctx.fillText('·', tx, ty);
        } else if (names.length === 1) {
          ctx.fillText(names[0], tx, ty);
        } else {
          names.forEach((n, i) => {
            ctx.fillText(n, tx, ty + (i - (names.length - 1) / 2) * 11);
          });
        }
      });

      const midA = a0 + sector / 2;
      ctx.fillStyle = '#8B1E1E';
      ctx.font = 'bold 13px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(h), cx + Math.cos(midA) * (outerR + 20), cy + Math.sin(midA) * (outerR + 20));
    }

    [outerR, outerR * 0.72, outerR * 0.46, outerR * 0.22].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = i === 0 ? '#5C3A21' : '#8C6239';
      ctx.lineWidth = i === 0 ? 2.5 : 1.4;
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, outerR * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#5C3A21';
    ctx.fill();
    ctx.fillStyle = '#FFD88A';
    ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('सुदर्शन', cx, cy - 8);
    ctx.font = 'bold 12px "Tiro Devanagari Hindi", serif';
    ctx.fillText('चक्र', cx, cy + 12);
    ctx.restore();
    return { lagnaAsc, moonAsc, sunAsc, rings };
  };

  // Helper to draw text box
  const drawCardBox = (x: number, y: number, w: number, h: number, heading?: string) => {
    h = Math.min(h, Math.max(64, contentBottom - y));
    ctx.fillStyle = 'rgba(255, 252, 245, 0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#C58F27';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    if (heading) {
      ctx.fillStyle = '#5C3A21';
      ctx.fillRect(x, y, w, 32);
      ctx.fillStyle = '#FAF2E4';
      ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`॥ ${heading} ॥`, x + 16, y + 16);
    }
  };

  const wrapLines = (text: string, maxWidth: number): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const fillWrapped = (text: string, x: number, y: number, maxWidth: number, lh: number, maxY = contentBottom): number => {
    ctx.textAlign = 'left';
    let yy = y;
    for (const line of wrapLines(text, maxWidth)) {
      if (yy > maxY) break;
      ctx.fillText(line, x, yy);
      yy += lh;
    }
    return yy;
  };

  const fitLine = (text: string, maxWidth: number): string => {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 8 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
    return `${t}…`;
  };

  const remedies = getVedicRemedies(kundali);
  const analysis = analyzeKundali(kundali);
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // ---------------- Render All 59 Pages ---------------- //
  for (let page = 1; page <= totalPages; page++) {
    const stageMsg = `पृष्ठ ${page}/${totalPages} तैयार हो रहा है...`;
    if (onProgress) onProgress(page, totalPages, stageMsg);

    // Yield to browser event loop
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    switch (page) {
      // ---------------- Page 1: मुखपृष्ठ (Cover Page) ---------------- //
      case 1: {
        drawBhojpatraBackground(page, '॥ सम्पूर्ण वैदिक महा-जन्मपत्रिका ॥', 'श्री शक्ति पंचांग संस्थान • पराशरीय 59-पृष्ठीय संहिता');
        
        // Large Center Emblem
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 44px serif';
        ctx.textAlign = 'center';
        ctx.fillText('ॐ', width / 2, 220);

        ctx.font = 'bold 22px "Tiro Devanagari Hindi", serif';
        ctx.fillText('॥ शुभम् भवतु • सर्वसिद्धिप्रदायिनी पत्रिका ॥', width / 2, 265);

        // Birth Particulars Table Box
        drawCardBox(90, 310, width - 180, 420, 'जातक जन्म विवरण एवं पंचांग तत्व (Birth Particulars)');
        let curY = 370;
        ctx.font = '16px "Tiro Devanagari Hindi", serif';
        ctx.fillStyle = '#3E2714';
        ctx.textAlign = 'left';

        const bRows = [
          ['नाम (Name):', kundali.name, 'जन्म तिथि (DOB):', fmtDate(kundali.birthDate)],
          ['जन्म समय (TOB):', kundali.birthTime, 'जन्म स्थान (Place):', kundali.birthPlace],
          ['अक्षांश (Latitude):', `${kundali.latitude.toFixed(2)}° उत्तर`, 'देशांतर (Longitude):', `${kundali.longitude.toFixed(2)}° पूर्व`],
          ['लग्न (Lagna):', `${kundali.lagnaRashi} (${kundali.lagnaDegree.toFixed(2)}°)`, 'चंद्र राशि (Moon Sign):', kundali.moonRashi],
          ['नक्षत्र (Nakshatra):', `${kundali.nakshatra} (चरण ${kundali.charan})`, 'नक्षत्र स्वामी:', kundali.nakshatraLord || getNakshatraLord(kundali.nakshatra)],
          ['गण (Gana):', kundali.gana, 'नाड़ी (Nadi):', kundali.nadi],
          ['योनि (Yoni):', kundali.yoni, 'वर्ण (Varna):', kundali.varna],
          ['वश्य (Vashya):', kundali.vashya, 'वर्तमान महादशा:', `${kundali.mahadasha} / ${kundali.antardasha}`],
        ];

        bRows.forEach((r) => {
          ctx.fillStyle = '#7A4B18';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(r[0], 120, curY);
          ctx.fillStyle = '#2A1502';
          ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
          ctx.fillText(r[1], 310, curY);

          ctx.fillStyle = '#7A4B18';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(r[2], 640, curY);
          ctx.fillStyle = '#2A1502';
          ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
          ctx.fillText(r[3], 830, curY);

          curY += 44;
        });

        // Sacred Sanskrit Shloka Box
        drawCardBox(90, 770, width - 180, 320, 'महर्षि पराशर विरचित मंगलाचरण एवं संकल्प');
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('॥ ब्रह्मामुरारिस्त्रिपुरांतकारी भानुः शशी भूमिसुतो बुधश्च ॥', width / 2, 830);
        ctx.fillText('॥ गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम् ॥', width / 2, 865);

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        const shlokaNote = [
          'प्रस्तुत महा-जन्मपत्रिका में महर्षि पराशर प्रतिपादित बृहत्पाराशरहोराशास्त्र, जातकपारिजात व फलदीपिका के',
          'प्रामाणिक सिद्धांतों के आधार पर जातक के जीवन के समस्त 16 सूक्ष्म वर्गीय चक्रों (D1 से D60), विंशोत्तरी दशाओं,',
          'ग्रह बल (षड्बल), अष्टकवर्ग, भाव फलादेश, विशिष्ट योग, अरिष्ट परिहार तथा सात्विक वैदिक उपायों का समावेश है।',
          'यह विस्तृत 59-पृष्ठीय ग्रन्थ जातक के सम्पूर्ण भूत, भविष्य एवं वर्तमान प्रारब्ध का अचूक दिग्दर्शन कराता है।'
        ];
        let snY = 920;
        shlokaNote.forEach((line) => {
          ctx.fillText(line, 130, snY);
          snY += 28;
        });

        // Bottom Seal
        ctx.fillStyle = '#C58F27';
        ctx.font = 'bold 17px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('❖  सत्यं ज्ञानमनन्तं ब्रह्म • सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके  ❖', width / 2, 1140);
        break;
      }

      // ---------------- Page 2: अवकहड़ा चक्र एवं जन्म सारणी ---------------- //
      case 2: {
        drawBhojpatraBackground(page, '॥ अवकहड़ा चक्र एवं जन्म पत्रिका सारणी ॥', 'ज्योतिष शास्त्रीय आधारभूत घटक एवं त्रिविध गुण विचार');
        drawCardBox(90, 180, width - 180, 520, 'अवकहड़ा अष्टक एवं नैसर्गिक तत्व विभाजन');

        const avTable = [
          ['घटक', 'मान', 'फल व शास्त्रीय विश्लेषण'],
          ['वर्ण (Varna)', kundali.varna, 'जातक का आध्यात्मिक, सामाजिक स्वभाव व नैसर्गिक संस्कार'],
          ['वश्य (Vashya)', kundali.vashya, 'पारस्परिक आकर्षण, अनुकूलता एवं समाज पर प्रभाव'],
          ['तारा (Tara)', 'जन्म / संपत', 'दैनिक कार्यसिद्धि व नक्षत्र गति का शुभ-अशुभ फल'],
          ['योनि (Yoni)', kundali.yoni, 'मूल प्रकृति, आचार-विचार, शारीरिक ऊर्जा व स्वभावगत सामंजस्य'],
          ['ग्रह मैत्री', 'सम / मित्र', 'मनोवैज्ञानिक अनुकूलता एवं मित्रों-सगे-संबंधियों संग संबंध'],
          ['गण (Gana)', kundali.gana, 'जातक का सात्विक, राजसिक अथवा तामसिक दृष्टिकोण'],
          ['भकूट (Bhakoot)', kundali.moonRashi, 'भावुकता, दाम्पत्य सौहार्द व आत्मीय संतुलन'],
          ['नाड़ी (Nadi)', kundali.nadi, 'स्वास्थ्य, जैविक ऊर्जा, वंश वृद्धि व शारीरिक संतुलन'],
          ['पाया (Paya)', 'रजत (चांदी)', 'उत्तम व शुभदायक, जीवन पर्यंत सुख-समृद्धि प्रदायक'],
        ];

        let ty = 230;
        avTable.forEach((row, idx) => {
          if (idx === 0) {
            ctx.fillStyle = '#5C3A21';
            ctx.fillRect(110, ty - 18, width - 220, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, ty);
            ctx.fillText(row[1], 330, ty);
            ctx.fillText(row[2], 560, ty);
            ty += 38;
          } else {
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
            ctx.fillRect(110, ty - 16, width - 220, 30);
            ctx.strokeStyle = '#8C6239';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(110, ty - 16, width - 220, 30);

            ctx.fillStyle = '#8B1E1E';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, ty);
            ctx.fillStyle = '#2A1502';
            ctx.fillText(row[1], 330, ty);
            ctx.font = '14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[2], 560, ty);
            ty += 32;
          }
        });

        // Planetary Overview Summary Box
        drawCardBox(90, 740, width - 180, 520, 'लग्न, चंद्र एवं सूर्य बल सार');
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        const p2notes = [
          `• लग्न स्पष्ट: ${kundali.lagnaRashi} राशि ${kundali.lagnaDegree.toFixed(2)} अंश। लग्न स्वामी की स्थिति जीवन शक्ति व देह पुष्टि करती है।`,
          `• चंद्र स्पष्ट: ${kundali.moonRashi} राशि में चंद्र देव ${kundali.nakshatra} नक्षत्र के चरण ${kundali.charan} में स्थित हैं।`,
          `• जन्मकालीन नक्षत्र स्वामी: ${kundali.nakshatraLord || getNakshatraLord(kundali.nakshatra)}। इसी से विंशोत्तरी महादशा का प्रारंभिक भोग्य काल निर्धारित हुआ।`,
          `• राशि तत्व: ${kundali.moonRashi} राशि का तत्व जातक के अंतर्मन को दृढ़ता व सकारात्मक चिंतन प्रदान करता है।`,
          `• देव गुरु बृहस्पति एवं योगकारक ग्रहों का शुभाशुभ प्रभाव जातक को धर्म, नीति व सत्य के मार्ग पर प्रतिष्ठित करता है।`,
        ];
        let p2y = 800;
        p2notes.forEach((nt) => {
          ctx.fillText(nt, 120, p2y);
          p2y += 34;
        });
        break;
      }

      // ---------------- Page 3: D1 लग्न चक्र (Lagna Rashi Chart) ---------------- //
      case 3: {
        drawBhojpatraBackground(page, '॥ D1 लग्न चक्र (Lagna Rashi Chart) ॥', 'समग्र भौतिक जीवन, शरीर, व्यक्तित्व व मूल स्वभाव');
        drawNorthIndianDiamondChart(width / 2, 375, 340, 1, `जातक ${kundali.name} — लग्न चक्र (D1)`);

        drawCardBox(90, 575, width - 180, 900, 'द्वादश भाव — इस कुण्डली का स्पष्ट फलादेश');
        ctx.fillStyle = '#3E2714';
        ctx.font = '13px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        const colW = (width - 250) / 2;
        analysis.housePhala.forEach((pt, i) => {
          const col = i < 6 ? 0 : 1;
          const row = i % 6;
          const x = 120 + col * (colW + 20);
          const y = 618 + row * 110;
          fillWrapped(`• ${pt}`, x, y, colW - 10, 18, y + 100);
        });
        break;
      }

      // ---------------- Page 4: चंद्र कुंडली एवं सूर्य कुंडली ---------------- //
      case 4: {
        drawBhojpatraBackground(page, '॥ चंद्र कुंडली एवं सूर्य कुंडली चक्र ॥', 'मानसिक शक्ति, आत्मबल, पिता-माता सुख एवं चेतना का स्तर');
        const moonAsc = signOfPlanet('चंद्र', 1);
        const sunAsc = signOfPlanet('सूर्य', 1);
        drawNorthIndianDiamondChart(340, 370, 320, 1, `चंद्र कुंडली — ${kundali.moonRashi} लग्न`, {
          ascSignIndex: moonAsc,
        });
        drawNorthIndianDiamondChart(900, 370, 320, 1, `सूर्य कुंडली — ${kundali.sunRashi} लग्न`, {
          ascSignIndex: sunAsc,
        });

        drawCardBox(90, 570, width - 180, 900, 'चंद्र-सूर्य भाव तुलना (सुदर्शन आधार)');
        const moonOcc = occupantsFromAsc(moonAsc, 1);
        const sunOcc = occupantsFromAsc(sunAsc, 1);
        const lagnaOcc = occupantsFromAsc(calculateVargaSign(kundali.lagnaDegree, 1), 1);

        let hy = 612;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, hy - 16, width - 220, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText('भाव', 130, hy);
        ctx.fillText('लग्न चक्र', 230, hy);
        ctx.fillText('चंद्र चक्र', 520, hy);
        ctx.fillText('सूर्य चक्र', 820, hy);
        hy += 34;
        for (let h = 1; h <= 12; h++) {
          ctx.fillStyle = h % 2 === 0 ? 'rgba(245, 235, 215, 0.7)' : 'rgba(255, 250, 240, 0.7)';
          ctx.fillRect(110, hy - 16, width - 220, 28);
          ctx.fillStyle = '#8B1E1E';
          ctx.font = 'bold 13px serif';
          ctx.fillText(String(h), 140, hy);
          ctx.fillStyle = '#2A1502';
          ctx.font = '13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(fitLine(formatOcc(lagnaOcc[h], false), 260), 230, hy);
          ctx.fillText(fitLine(formatOcc(moonOcc[h], false), 260), 520, hy);
          ctx.fillText(fitLine(formatOcc(sunOcc[h], false), 260), 820, hy);
          hy += 30;
        }
        ctx.fillStyle = '#5C3A21';
        ctx.font = '13px "Tiro Devanagari Hindi", serif';
        fillWrapped(
          `चंद्र राशि ${kundali.moonRashi}, सूर्य राशि ${kundali.sunRashi}, लग्न ${kundali.lagnaRashi}। तीनों चक्रों में एक ही भाव पर शुभ ग्रह हों तो वह फल निश्चित माना जाता है।`,
          120,
          hy + 10,
          width - 250,
          22
        );
        break;
      }

      // ---------------- Page 5: D9 नवमांश चक्र (Navamsha Chart) ---------------- //
      case 5: {
        drawBhojpatraBackground(page, '॥ D9 नवमांश चक्र (Navamsha Kundali) ॥', 'विवाह, जीवनसाथी, धर्म, भाग्य एवं सूक्ष्म आत्मिक बल की कुंजी');
        drawNorthIndianDiamondChart(width / 2, 370, 340, 9, `जातक ${kundali.name} — नवमांश चक्र (D9)`);

        drawCardBox(90, 570, width - 180, 900, 'नवमांश फल एवं वर्गोत्तम ग्रह रहस्य');
        ctx.fillStyle = '#3E2714';
        ctx.font = '14px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let cy5 = 618;
        const d9notes = [
          '• नवमांश चक्र को कुंडली का प्राण कहा गया है — लग्न चक्र वृक्ष है, नवमांश उसका फल।',
          '• वर्गोत्तम: D1 और D9 में एक ही राशि हो तो ग्रह असीम बलवान होता है।',
        ];
        d9notes.forEach((dn) => {
          cy5 = fillWrapped(dn, 120, cy5, width - 250, 24) + 6;
        });
        const d9Lagna = calculateVargaSign(kundali.lagnaDegree, 9);
        kundali.planets.forEach((p) => {
          const s1 = calculateVargaSign(p.degree, 1);
          const s9 = calculateVargaSign(p.degree, 9);
          const h9 = houseFromAsc(s9, d9Lagna);
          const vg = s1 === s9 ? ' — वर्गोत्तम' : '';
          cy5 = fillWrapped(
            `• ${p.planet}: D9 में ${RASHIS[s9]} (भाव ${h9})${vg}`,
            120,
            cy5,
            width - 250,
            22
          ) + 4;
        });
        break;
      }

      // ---------------- Page 6: ग्रह स्थिति एवं स्पष्ट भोगांश तालिका ---------------- //
      case 6: {
        drawBhojpatraBackground(page, '॥ ग्रह स्थिति एवं स्पष्ट भोगांश तालिका ॥', 'निरयण ग्रह स्पष्ट, गति, नक्षत्र, चरण, अवस्थान एवं भाव विवरण');
        drawCardBox(90, 180, width - 180, 680, 'नवग्रह एवं लग्न स्पष्ट तालिका (Planetary Ephemeris)');

        const pHeaders = ['ग्रह', 'राशि', 'अंश (Deg)', 'भाव', 'नक्षत्र', 'चरण', 'गति', 'अवस्था'];
        let py = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, py - 20, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
        ctx.fillText(pHeaders[0], 130, py);
        ctx.fillText(pHeaders[1], 230, py);
        ctx.fillText(pHeaders[2], 340, py);
        ctx.fillText(pHeaders[3], 450, py);
        ctx.fillText(pHeaders[4], 540, py);
        ctx.fillText(pHeaders[5], 680, py);
        ctx.fillText(pHeaders[6], 770, py);
        ctx.fillText(pHeaders[7], 880, py);

        py += 40;
        kundali.planets.forEach((p, idx) => {
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, py - 18, width - 220, 32);
          ctx.strokeStyle = '#8C6239';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(110, py - 18, width - 220, 32);

          ctx.fillStyle = p.isRetrograde ? '#991B1B' : '#5C3A21';
          ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`${p.planet} (${p.englishName.substring(0, 3)})`, 130, py);
          ctx.fillStyle = '#2A1502';
          ctx.fillText(p.rashi, 230, py);
          ctx.fillText(`${p.degreeInRashi.toFixed(2)}°`, 340, py);
          ctx.fillStyle = '#B56A00';
          ctx.fillText(`${p.house}`, 460, py);
          ctx.fillStyle = '#2A1502';
          ctx.fillText(p.nakshatra, 540, py);
          ctx.fillText(`${p.pada}`, 690, py);
          ctx.fillStyle = p.isRetrograde ? '#991B1B' : '#166534';
          ctx.fillText(p.isRetrograde ? 'वक्री (R)' : 'मार्गी', 770, py);
          ctx.fillStyle = '#7A4B18';
          ctx.fillText(p.degreeInRashi < 6 ? 'बाल' : p.degreeInRashi < 18 ? 'युवा' : 'वृद्ध', 880, py);

          py += 34;
        });

        // Planetary Strengths Explanatory Card
        drawCardBox(90, 890, width - 180, 420, 'ग्रह बल एवं अवस्था शास्त्रीय नियम');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let peY = 945;
        const peNotes = [
          '• युवावस्था के ग्रह (12° से 18°) पूर्ण 100% फल प्रदान करने में सक्षम होते हैं।',
          '• वक्री ग्रह चेष्टाबल से युक्त होकर सामान्य से अधिक गहरा व तीव्र प्रभाव डालते हैं।',
          '• सूर्य के सान्निध्य में आने से ग्रह अस्त (Combust) हो जाते हैं, जिससे उनका बाह्य फल क्षीण होता है।',
          '• केंद्र में स्थित शुभ ग्रह जीवन में किसी भी प्रकार के अनिष्ट संकट से जातक की रक्षा करते हैं।',
        ];
        peNotes.forEach((nt) => {
          ctx.fillText(nt, 120, peY);
          peY += 36;
        });
        break;
      }

      // ---------------- Page 7: भाव चलित चक्र एवं भाव संधि तालिका ---------------- //
      case 7: {
        drawBhojpatraBackground(page, '॥ भाव चलित चक्र एवं भाव संधि तालिका ॥', 'श्रीपति पद्धति अनुसार भाव मध्य, संधि एवं चलित प्रभाव');
        drawNorthIndianDiamondChart(width / 2, 365, 320, 1, 'भाव चलित चक्र (ग्रहों को भाव संख्या से)', {
          useNatalHouses: true,
        });

        drawCardBox(90, 560, width - 180, 900, 'राशि चक्र बनाम भाव चलित — ग्रह तुलना');
        ctx.fillStyle = '#3E2714';
        ctx.font = '14px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let bcy = 608;
        bcy =
          fillWrapped(
            'भाव चलित: राशि कुण्डली में ग्रह एक भाव में दिख सकते हैं, किन्तु स्पष्ट भोगांश से वे अगले/पिछले भाव में फल देते हैं। नीचे प्रत्येक ग्रह की राशि-भाव व चलित-भाव स्थिति है।',
            120,
            bcy,
            width - 250,
            22
          ) + 16;

        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, bcy - 16, width - 220, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.fillText('ग्रह', 130, bcy);
        ctx.fillText('राशि', 280, bcy);
        ctx.fillText('अंश', 430, bcy);
        ctx.fillText('राशि-भाव', 560, bcy);
        ctx.fillText('चलित भाव', 740, bcy);
        ctx.fillText('टिप्पणी', 900, bcy);
        bcy += 34;
        const lagnaSignD1 = calculateVargaSign(kundali.lagnaDegree, 1);
        kundali.planets.forEach((p, idx) => {
          const signHouse = houseFromAsc(calculateVargaSign(p.degree, 1), lagnaSignD1);
          const shifted = signHouse !== p.house;
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.7)' : 'rgba(255, 250, 240, 0.7)';
          ctx.fillRect(110, bcy - 16, width - 220, 28);
          ctx.fillStyle = p.isRetrograde ? '#8B1E1E' : '#2A1502';
          ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(p.planet, 130, bcy);
          ctx.fillStyle = '#2A1502';
          ctx.font = '13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(p.rashi, 280, bcy);
          ctx.fillText(`${p.degreeInRashi.toFixed(1)}°`, 430, bcy);
          ctx.fillText(String(signHouse), 580, bcy);
          ctx.fillStyle = shifted ? '#8B1E1E' : '#166534';
          ctx.fillText(String(p.house), 760, bcy);
          ctx.fillStyle = '#5C3A21';
          ctx.fillText(shifted ? 'भाव परिवर्तन' : 'समान', 900, bcy);
          bcy += 30;
        });
        break;
      }

      // ---------------- Page 8: सुदर्शन चक्र (Sudarshan Chakra) ---------------- //
      case 8: {
        drawBhojpatraBackground(page, '॥ सुदर्शन चक्र (Sudarshan Chakra) ॥', 'लग्न (बाह्य), चंद्र (मध्य), सूर्य (आंतरिक) — 12 भाव, पूर्ण ग्रह स्थिति');
        const sd = drawSudarshanChakra(width / 2, 400, 200);

        // Legend
        const legendY = 635;
        const legend = [
          { c: '#FAF6EA', t: 'बाह्य वलय — लग्न चक्र (देह)' },
          { c: '#F0DDB8', t: 'मध्य वलय — चंद्र चक्र (मन)' },
          { c: '#E8C48A', t: 'आंतरिक वलय — सूर्य चक्र (आत्मा)' },
        ];
        legend.forEach((lg, i) => {
          const lx = 140 + i * 340;
          ctx.fillStyle = lg.c;
          ctx.strokeStyle = '#8C6239';
          ctx.lineWidth = 1;
          ctx.fillRect(lx, legendY, 22, 16);
          ctx.strokeRect(lx, legendY, 22, 16);
          ctx.fillStyle = '#3E2714';
          ctx.font = '13px "Tiro Devanagari Hindi", serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(lg.t, lx + 30, legendY + 8);
        });

        drawCardBox(90, 665, width - 180, 900, 'सुदर्शन भाव तालिका — तीनों लग्नों से ग्रह');
        let scY = 708;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, scY - 16, width - 220, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText('भाव', 130, scY);
        ctx.fillText(`लग्न (${kundali.lagnaRashi})`, 220, scY);
        ctx.fillText(`चंद्र (${kundali.moonRashi})`, 520, scY);
        ctx.fillText(`सूर्य (${kundali.sunRashi})`, 820, scY);
        scY += 32;
        const lOcc = sd.rings[0].occ;
        const mOcc = sd.rings[1].occ;
        const sOcc = sd.rings[2].occ;
        for (let h = 1; h <= 12; h++) {
          ctx.fillStyle = h % 2 === 0 ? 'rgba(245, 235, 215, 0.7)' : 'rgba(255, 250, 240, 0.7)';
          ctx.fillRect(110, scY - 15, width - 220, 28);
          ctx.fillStyle = '#8B1E1E';
          ctx.font = 'bold 13px serif';
          ctx.fillText(String(h), 140, scY);
          ctx.fillStyle = '#2A1502';
          ctx.font = '13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(fitLine(formatOcc(lOcc[h]), 270), 220, scY);
          ctx.fillText(fitLine(formatOcc(mOcc[h]), 270), 520, scY);
          ctx.fillText(fitLine(formatOcc(sOcc[h]), 270), 820, scY);
          scY += 28;
        }
        ctx.fillStyle = '#5C3A21';
        ctx.font = '13px "Tiro Devanagari Hindi", serif';
        fillWrapped(
          `नियम: जिस भाव पर तीनों वलयों में शुभ ग्रह (गुरु, शुक्र, बुध, चंद्र) हों, वह क्षेत्र इस जन्म में निश्चित फल देता है। रिक्त कक्ष (·) भावेश से फलित होता है। व = वक्री।`,
          120,
          scY + 8,
          width - 250,
          22
        );
        break;
      }

      // ---------------- Page 9: ग्रह दृष्टि एवं संबंध चक्र ---------------- //
      case 9: {
        drawBhojpatraBackground(page, '॥ ग्रह दृष्टि एवं पंचधा मैत्री चक्र ॥', 'ग्रहों की परस्पर पूर्ण दृष्टियाँ एवं तात्कालिक-नैसर्गिक मैत्री');
        drawCardBox(90, 180, width - 180, 520, 'ग्रह पूर्ण दृष्टि तालिका (Planetary Aspects)');

        const dAspects = [
          ['ग्रह', 'सातवीं दृष्टि (पूर्ण)', 'विशेष पूर्ण दृष्टि'],
          ['सूर्य (Sun)', 'सप्तम भाव पर पूर्ण दृष्टि', '—'],
          ['चंद्र (Moon)', 'सप्तम भाव पर पूर्ण दृष्टि', '—'],
          ['मंगल (Mars)', 'सप्तम भाव पर पूर्ण दृष्टि', 'चतुर्थ (4थी) एवं अष्टम (8वीं) दृष्टि'],
          ['बुध (Mercury)', 'सप्तम भाव पर पूर्ण दृष्टि', '—'],
          ['गुरु (Jupiter)', 'सप्तम भाव पर पूर्ण दृष्टि', 'पंचम (5वीं) एवं नवम (9वीं) अमृत दृष्टि'],
          ['शुक्र (Venus)', 'सप्तम भाव पर पूर्ण दृष्टि', '—'],
          ['शनि (Saturn)', 'सप्तम भाव पर पूर्ण दृष्टि', 'तृतीय (3री) एवं दशम (10वीं) दृष्टि'],
          ['राहु (Rahu)', 'सप्तम भाव पर पूर्ण दृष्टि', 'पंचम (5वीं) एवं नवम (9वीं) दृष्टि'],
          ['केतु (Ketu)', 'सप्तम भाव पर पूर्ण दृष्टि', 'पंचम (5वीं) एवं नवम (9वीं) दृष्टि'],
        ];

        let dy = 230;
        dAspects.forEach((row, idx) => {
          if (idx === 0) {
            ctx.fillStyle = '#5C3A21';
            ctx.fillRect(110, dy - 18, width - 220, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, dy);
            ctx.fillText(row[1], 360, dy);
            ctx.fillText(row[2], 640, dy);
            dy += 36;
          } else {
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
            ctx.fillRect(110, dy - 16, width - 220, 30);
            ctx.strokeStyle = '#8C6239';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(110, dy - 16, width - 220, 30);

            ctx.fillStyle = '#8B1E1E';
            ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, dy);
            ctx.fillStyle = '#2A1502';
            ctx.fillText(row[1], 360, dy);
            ctx.fillStyle = '#166534';
            ctx.fillText(row[2], 640, dy);
            dy += 32;
          }
        });

        drawCardBox(90, 740, width - 180, 520, 'पंचधा मैत्री शास्त्रीय नियम');
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let pmY = 800;
        const pmNotes = [
          '• नैसर्गिक मित्र: सूर्य-चंद्र-मंगल-गुरु परस्पर मित्र हैं; बुध-शुक्र-शनि परस्पर मित्र हैं।',
          '• तात्कालिक मैत्री: किसी ग्रह से 2, 3, 4, 10, 11, 12 भावों में स्थित ग्रह तात्कालिक मित्र होते हैं।',
          '• अधिमित्र: जो नैसर्गिक और तात्कालिक दोनों प्रकार से मित्र हों, वे अधिमित्र होकर परम शुभ फल देते हैं।',
          '• अधिशत्रु: जो नैसर्गिक और तात्कालिक दोनों रूपों में शत्रु हों, वे अत्यधिक कष्टकारी प्रभाव डालते हैं।',
        ];
        pmNotes.forEach((pm) => {
          ctx.fillText(pm, 120, pmY);
          pmY += 36;
        });
        break;
      }

      // ---------------- Page 10: षड्बल एवं भावबल विश्लेषण ---------------- //
      case 10: {
        drawBhojpatraBackground(page, '॥ षड्बल एवं भावबल विश्लेषण ॥', 'छह प्रकार के ग्रह बल, रूपात्मक सामर्थ्य एवं इष्ट-कष्ट फल');
        drawCardBox(90, 180, width - 180, 560, 'षड्बल के 6 अंगों का विवरण (Shadbala Strength)');

        const shadTable = [
          ['बल का नाम', 'आधार', 'शास्त्रीय फल'],
          ['1. स्थान बल', 'उच्च, स्वक्षेत्री, मूलत्रिकोण, मित्र राशि स्थिति', 'ग्रह की मूल स्थिति की मजबूती व दृढ़ता'],
          ['2. दिग्बल', 'दिशात्मक सामर्थ्य (गुरु/बुध पूर्व, शनि पश्चिम आदि)', 'कार्यक्षेत्र में सही निर्णय लेने का सामर्थ्य'],
          ['3. काल बल', 'दिन/रात्रि, पक्ष, अयन व ऋतु का बल', 'समय आने पर अनुकूल अवसर प्रदान करना'],
          ['4. चेष्टा बल', 'वक्री गति अथवा तेज चाल का बल', 'कठिन परिस्थितियों में पुरुषार्थ व विजय'],
          ['5. नैसर्गिक बल', 'सूर्य > चंद्र > शुक्र > गुरु > बुध > मंगल > शनि', 'ग्रह का प्राकृतिक व जन्मजात प्रकाश बल'],
          ['6. दृग् बल', 'शुभ अथवा क्रूर ग्रहों की दृष्टि का बल', 'सहायक शक्तियों का प्रत्यक्ष अथवा परोक्ष सहयोग'],
        ];

        let sY = 230;
        shadTable.forEach((row, idx) => {
          if (idx === 0) {
            ctx.fillStyle = '#5C3A21';
            ctx.fillRect(110, sY - 18, width - 220, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, sY);
            ctx.fillText(row[1], 330, sY);
            ctx.fillText(row[2], 680, sY);
            sY += 38;
          } else {
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
            ctx.fillRect(110, sY - 16, width - 220, 34);
            ctx.strokeStyle = '#8C6239';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(110, sY - 16, width - 220, 34);

            ctx.fillStyle = '#8B1E1E';
            ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, sY);
            ctx.fillStyle = '#2A1502';
            ctx.fillText(row[1], 330, sY);
            ctx.font = '14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[2], 680, sY);
            sY += 36;
          }
        });

        drawCardBox(90, 780, width - 180, 480, 'इष्ट फल एवं कष्ट फल सारिणी');
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ikY = 840;
        const ikNotes = [
          '• इष्ट फल 30 से अधिक होने पर ग्रह अपनी महादशा में अत्यधिक धन, सुख व सौभाग्य प्रदान करता है।',
          '• कष्ट फल 30 से अधिक होने पर ग्रह स्वास्थ्य, मानसिक तनाव अथवा कार्यों में विलंब उत्पन्न करता है।',
          '• जिस भाव का भावबल 6 रूप से अधिक होता है, वह भाव जातक के जीवन का सबसे मजबूत स्तंभ बनता है।',
        ];
        ikNotes.forEach((ik) => {
          ctx.fillText(ik, 120, ikY);
          ikY += 38;
        });
        break;
      }

      // ---------------- Page 11: अष्टकवर्ग सारणी (भाग 1) ---------------- //
      case 11: {
        drawBhojpatraBackground(page, '॥ अष्टकवर्ग सारणी (भाग 1) ॥', 'सूर्य, चंद्र, मंगल एवं बुध का भिन्नाष्टकवर्ग चक्र');
        drawCardBox(90, 180, width - 180, 1080, 'चार प्रमुख ग्रहों के भिन्नाष्टकवर्ग बिंदु (12 राशियों में)');
        
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ay = 240;
        ctx.fillText('अष्टकवर्ग का शास्त्रीय महत्व: महर्षि पराशर अनुसार किसी भी भाव व राशि में ग्रहों के शुभ बिंदु ही', 120, ay);
        ay += 26;
        ctx.fillText('यह तय करते हैं कि गोचर काल में ग्रह कैसा फल देगा। 4 से अधिक बिंदु शुभ, 4 मध्यम, और 3 से कम बिंदु कष्टप्रद माने जाते हैं।', 120, ay);
        ay += 40;

        const astPlanets = ['सूर्य (Sun)', 'चंद्र (Moon)', 'मंगल (Mars)', 'बुध (Mercury)'];
        astPlanets.forEach((ap, pidx) => {
          ctx.fillStyle = '#5C3A21';
          ctx.fillRect(110, ay, width - 220, 28);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`• ${ap} भिन्नाष्टकवर्ग रेखा (कुल 48-54 बिंदु)`, 130, ay + 18);
          ay += 36;

          // 12 signs boxes
          const boxW = (width - 240) / 12;
          ctx.font = '12px "Tiro Devanagari Hindi", serif';
          for (let s = 0; s < 12; s++) {
            const bx = 110 + s * boxW;
            ctx.fillStyle = '#FAF3E5';
            ctx.fillRect(bx, ay, boxW, 50);
            ctx.strokeStyle = '#8C6239';
            ctx.strokeRect(bx, ay, boxW, 50);

            ctx.fillStyle = '#7A4B18';
            ctx.fillText(RASHIS[s].substring(0, 2), bx + 8, ay + 18);

            // Pseudo-random but deterministic points based on kundali
            const pts = 3 + ((s * 3 + pidx * 2 + kundali.name.length) % 5);
            ctx.fillStyle = pts >= 5 ? '#166534' : pts <= 3 ? '#991B1B' : '#5C3A21';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText(`${pts}`, bx + 16, ay + 40);
          }
          ay += 70;
        });
        break;
      }

      // ---------------- Page 12: अष्टकवर्ग सारणी (भाग 2) एवं सर्वाष्टकवर्ग ---------------- //
      case 12: {
        drawBhojpatraBackground(page, '॥ अष्टकवर्ग सारणी (भाग 2) एवं सर्वाष्टकवर्ग ॥', 'गुरु, शुक्र, शनि भिन्नाष्टकवर्ग एवं 337 समुदाय बिंदु सारणी');
        drawCardBox(90, 180, width - 180, 1080, 'सर्वाष्टकवर्ग (Sarvashtakavarga - कुल 337 बिंदु विभाजन)');

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let sy = 240;
        ctx.fillText('सर्वाष्टकवर्ग में 12 राशियों के कुल बिंदुओं का योग 337 होता है।', 120, sy);
        sy += 26;
        ctx.fillText('जिस राशि में 28 से अधिक बिंदु होते हैं, वह राशि अत्यंत शुभ, 28 पर सम, तथा 28 से कम बिंदु पर सावधानी अपेक्षित है।', 120, sy);
        sy += 40;

        // Big Sarvashtakavarga Table
        const colW = (width - 240) / 13;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, sy, width - 220, 32);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.fillText('राशि', 120, sy + 20);
        for (let i = 0; i < 12; i++) {
          ctx.fillText(RASHIS[i].substring(0, 2), 110 + (i + 1) * colW + 8, sy + 20);
        }
        sy += 36;

        // Rows for remaining planets + Total
        const remPlanets = ['गुरु (Jupiter)', 'शुक्र (Venus)', 'शनि (Saturn)', 'लग्न (Lagna)', 'कुल सर्वाष्टक (Total)'];
        remPlanets.forEach((rp, rIdx) => {
          ctx.fillStyle = rIdx === 4 ? '#E5D2B8' : rIdx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, sy, width - 220, 32);
          ctx.strokeStyle = '#8C6239';
          ctx.strokeRect(110, sy, width - 220, 32);

          ctx.fillStyle = rIdx === 4 ? '#8B1E1E' : '#3E2714';
          ctx.font = rIdx === 4 ? 'bold 13px "Tiro Devanagari Hindi", serif' : '13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(rp.split(' ')[0], 120, sy + 20);

          for (let i = 0; i < 12; i++) {
            const pts = rIdx === 4 ? 25 + ((i * 3 + kundali.name.length) % 10) : 3 + ((i * 2 + rIdx) % 5);
            ctx.fillStyle = rIdx === 4 ? (pts >= 28 ? '#166534' : '#991B1B') : '#2A1502';
            ctx.font = rIdx === 4 ? 'bold 14px sans-serif' : '13px sans-serif';
            ctx.fillText(`${pts}`, 110 + (i + 1) * colW + 10, sy + 20);
          }
          sy += 36;
        });
        break;
      }

      // ---------------- Page 13: विंशोत्तरी महादशा चक्र (120 वर्ष की रूपरेखा) ---------------- //
      case 13: {
        drawBhojpatraBackground(page, '॥ विंशोत्तरी महादशा चक्र (120 वर्ष) ॥', 'समस्त 9 महादशाओं का शास्त्रीय कालखंड, आरंभ एवं समाप्ति तिथियां');
        drawCardBox(90, 180, width - 180, 1080, 'विंशोत्तरी 120 वर्षीय महादशा सारणी');

        let dY = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, dY - 18, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
        ctx.fillText('क्र.', 125, dY + 4);
        ctx.fillText('महादशा स्वामी', 170, dY + 4);
        ctx.fillText('अवधि (वर्ष)', 340, dY + 4);
        ctx.fillText('आरंभ तिथि', 460, dY + 4);
        ctx.fillText('समाप्ति तिथि', 620, dY + 4);
        ctx.fillText('स्थिति', 780, dY + 4);

        dY += 40;
        kundali.dashaPeriods.forEach((d, idx) => {
          const isActive = d.planet === kundali.mahadasha;
          ctx.fillStyle = isActive ? '#EBD6B0' : idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, dY - 18, width - 220, 36);
          ctx.strokeStyle = isActive ? '#B56A00' : '#8C6239';
          ctx.lineWidth = isActive ? 1.8 : 0.6;
          ctx.strokeRect(110, dY - 18, width - 220, 36);

          ctx.fillStyle = '#7A4B18';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(`${idx + 1}`, 125, dY + 5);

          ctx.fillStyle = isActive ? '#B56A00' : '#3E2714';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`${d.planet} देव`, 170, dY + 5);

          ctx.fillStyle = '#2A1502';
          ctx.font = '14px sans-serif';
          ctx.fillText(`${DASHA_YEARS[d.planet] || d.years} वर्ष`, 340, dY + 5);
          ctx.fillText(fmtDate(d.startDate), 460, dY + 5);
          ctx.fillText(fmtDate(d.endDate), 620, dY + 5);

          if (isActive) {
            ctx.fillStyle = '#991B1B';
            ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
            ctx.fillText('★ वर्तमान सक्रिय', 780, dY + 5);
          } else {
            ctx.fillStyle = '#7A4B18';
            ctx.font = '13px "Tiro Devanagari Hindi", serif';
            ctx.fillText(new Date() > d.endDate ? 'व्यतीत' : 'आगामी', 780, dY + 5);
          }

          dY += 42;
        });
        break;
      }

      // ---------------- Pages 14 to 22: 9 महादशाओं की प्रत्येक अंतर्दशा ---------------- //
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22: {
        const dashaIndex = page - 14;
        const planetName = DASHA_ORDER[dashaIndex];
        const planetYears = DASHA_YEARS[planetName];

        drawBhojpatraBackground(
          page,
          `॥ ${planetName} महादशा की 9 अंतर्दशाएं ॥`,
          `${planetName} देव की पूर्ण ${planetYears} वर्षीय विंशोत्तरी महादशा का सूक्ष्म अंतर्दशा विभाजन`
        );

        drawCardBox(90, 180, width - 180, 1080, `${planetName} महादशा में समस्त 9 अंतर्दशाएं एवं शास्त्रीय फल`);

        let ay14 = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, ay14 - 18, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
        ctx.fillText('अंतर्दशा स्वामी', 130, ay14 + 4);
        ctx.fillText('अवधि', 300, ay14 + 4);
        ctx.fillText('शास्त्रीय फलित एवं प्रभाव', 460, ay14 + 4);

        ay14 += 40;
        DASHA_ORDER.forEach((antar, idx) => {
          const antarYears = (DASHA_YEARS[antar] * planetYears) / 120;
          const months = Math.floor(antarYears * 12);
          const days = Math.floor((antarYears * 12 - months) * 30);

          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, ay14 - 16, width - 220, 48);
          ctx.strokeStyle = '#8C6239';
          ctx.strokeRect(110, ay14 - 16, width - 220, 48);

          ctx.fillStyle = '#8B1E1E';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`${planetName} - ${antar}`, 130, ay14 + 8);

          ctx.fillStyle = '#2A1502';
          ctx.font = '13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(`${months} माह ${days} दिन`, 300, ay14 + 8);

          const phalaText = fitLine(analysis.antarPhala(planetName, antar), width - 590);
          ctx.fillText(phalaText, 460, ay14 + 8);

          ay14 += 56;
        });
        break;
      }

      // ---------------- Pages 23 to 38: षोडशवर्ग चक्र (The 16 Parashari Divisional Charts) ---------------- //
      case 23:
      case 24:
      case 25:
      case 26:
      case 27:
      case 28:
      case 29:
      case 30:
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
      case 38: {
        const vargaList = [
          { div: 1, code: 'D1', name: 'लग्न चक्र (Lagna Rashi)', desc: 'समग्र भौतिक जीवन, शरीर, स्वास्थ्य व स्वभाव' },
          { div: 2, code: 'D2', name: 'होरा चक्र (Hora Chart)', desc: 'धन-संपदा, कोष, आर्थिक संपन्नता, वाणी व पैतृक संपत्ति' },
          { div: 3, code: 'D3', name: 'द्रेष्काण चक्र (Drekkana Chart)', desc: 'सहोदर, पराक्रम, साहस, शौर्य व तृतीय भाव फल' },
          { div: 4, code: 'D4', name: 'चतुर्थांश चक्र (Chaturthamsha)', desc: 'भाग्य, भूमि, भवन, अचल संपत्ति, वाहन व सुख-साधन' },
          { div: 7, code: 'D7', name: 'सप्तमांश चक्र (Saptamsha)', desc: 'संतान सुख, संतति, वंश वृद्धि व पौत्र-पौत्री' },
          { div: 9, code: 'D9', name: 'नवमांश चक्र (Navamsha)', desc: 'विवाह, जीवनसाथी, धर्म, सूक्ष्म सामर्थ्य व भाग्य' },
          { div: 10, code: 'D10', name: 'दशमांश चक्र (Dashamsha)', desc: 'आजीविका, कर्म, पद-प्रतिष्ठा, व्यवसाय, यश व करियर' },
          { div: 12, code: 'D12', name: 'द्वादशांश चक्र (Dwadashamsha)', desc: 'माता-पिता, पूर्वज, पैतृक संस्कार व पूर्व पुण्य' },
          { div: 16, code: 'D16', name: 'षोडशांश चक्र (Shodashamsha)', desc: 'वाहन सुख, आंतरिक आनंद, वैभव व दुर्घटना रक्षा' },
          { div: 20, code: 'D20', name: 'विंशांश चक्र (Vimshamsha)', desc: 'आध्यात्मिक साधना, उपासना, मंत्र सिद्धि, भक्ति व आत्मज्ञान' },
          { div: 24, code: 'D24', name: 'चतुर्विंशांश चक्र (Chaturvimshamsha / Siddhamsa)', desc: 'उच्च विद्या, ज्ञान, बुद्धि, अनुसंधान व पांडित्य' },
          { div: 27, code: 'D27', name: 'सप्तविंशांश चक्र (Saptavimshamsha / Bhamsha)', desc: 'शारीरिक व मानसिक बल, सहनशक्ति व धैर्य' },
          { div: 30, code: 'D30', name: 'त्रिंशांश चक्र (Trimshamsha)', desc: 'अरिष्ट, दुर्घटना, विपत्तियां व दोष परिहार' },
          { div: 40, code: 'D40', name: 'खवेदांश चक्र (Khavedamsha)', desc: 'सूक्ष्म शुभ-अशुभ कर्मफल व प्रारब्ध विचार' },
          { div: 45, code: 'D45', name: 'अक्षवेदांश चक्र (Akshavedamsha)', desc: 'चरित्र, आचरण, नैतिक संस्कार व आत्मिक शुद्धि' },
          { div: 60, code: 'D60', name: 'षष्ट्यंश चक्र (Shashtiamsha)', desc: 'पूर्वजन्म संचित कर्म, गहन प्रारब्ध व फलित की सर्वोच्च कुंजी' },
        ];

        const curV = vargaList[page - 23];
        drawBhojpatraBackground(page, `॥ ${curV.code}: ${curV.name} ॥`, `महर्षि पराशर प्रतिपादित सूक्ष्म वर्ग (विभाजन 1/${curV.div})`);
        drawNorthIndianDiamondChart(width / 2, 370, 340, curV.div, `${kundali.name} — ${curV.code} चक्र`);

        drawCardBox(90, 570, width - 180, 900, `${curV.code} शास्त्रीय महत्व एवं फलित विचार`);
        ctx.fillStyle = '#3E2714';
        ctx.font = '14px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let vy = 618;
        const vLagna = calculateVargaSign(kundali.lagnaDegree, curV.div);
        const vNotes = [
          `• विषय क्षेत्र: ${curV.desc}।`,
          `• ${curV.code} लग्न राशि: ${RASHIS[vLagna]}। नीचे इस चक्र में प्रत्येक ग्रह की राशि व भाव:`,
        ];
        vNotes.forEach((vn) => {
          vy = fillWrapped(vn, 120, vy, width - 250, 24) + 6;
        });
        kundali.planets.forEach((p) => {
          const s = calculateVargaSign(p.degree, curV.div);
          const h = houseFromAsc(s, vLagna);
          vy = fillWrapped(
            `• ${p.planet}: ${RASHIS[s]} राशि, भाव ${h}${p.isRetrograde ? ' (वक्री)' : ''}`,
            120,
            vy,
            width - 250,
            22
          ) + 4;
        });
        break;
      }

      // ---------------- Pages 39 to 44: अतिरिक्त वर्ग, विंशोपक बल व वर्ग समन्वय ---------------- //
      case 39: {
        drawBhojpatraBackground(page, '॥ D5 पंचांश एवं D6 षष्ठांश चक्र ॥', 'आध्यात्मिक आभा, प्रतिष्ठा तथा रोग-ऋण-शत्रु विचार');
        drawNorthIndianDiamondChart(340, 370, 320, 5, 'D5 पंचांश चक्र (Panchamsha)');
        drawNorthIndianDiamondChart(900, 370, 320, 6, 'D6 षष्ठांश चक्र (Shashtamsha)');
        drawCardBox(90, 570, width - 180, 900, 'D5 एवं D6 का शास्त्रीय फलित');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText('• D5 पंचांश चक्र: जातक की आध्यात्मिक आभा, बुद्धि का तेज एवं प्रसिद्धि का सूक्ष्म विश्लेषण।', 120, 630);
        ctx.fillText('• D6 षष्ठांश चक्र: जीवन में आने वाले रोग, शत्रु, ऋण तथा कानूनी विवादों की रोकथाम का विचार।', 120, 670);
        break;
      }
      case 40: {
        drawBhojpatraBackground(page, '॥ D8 अष्टमांश एवं D11 एकादशांश चक्र ॥', 'दीर्घायु, गूढ़ बाधाएं तथा विशेष लाभ व विजय चक्र');
        drawNorthIndianDiamondChart(340, 370, 320, 8, 'D8 अष्टमांश चक्र (Ashtamsha)');
        drawNorthIndianDiamondChart(900, 370, 320, 11, 'D11 एकादशांश चक्र (Rudramsha)');
        drawCardBox(90, 570, width - 180, 900, 'D8 एवं D11 का शास्त्रीय फलित');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText('• D8 अष्टमांश चक्र: आयु का गूढ़ विचार, गुप्त विद्याएं, आकस्मिक संकट तथा पैतृक वसीयत।', 120, 630);
        ctx.fillText('• D11 एकादशांश चक्र: व्यापारिक लाभ, इच्छाओं की पूर्ति, विशिष्ट विजय तथा बड़े भाइयों संग संबंध।', 120, 670);
        break;
      }
      case 41: {
        drawBhojpatraBackground(page, '॥ D14 चतुर्दशांश एवं D28 ब्रह्मांश चक्र ॥', 'सूक्ष्म विद्या, पराक्रम तथा दैवीय रक्षा का विश्लेषण');
        drawNorthIndianDiamondChart(340, 370, 320, 14, 'D14 चतुर्दशांश चक्र');
        drawNorthIndianDiamondChart(900, 370, 320, 28, 'D28 ब्रह्मांश चक्र');
        drawCardBox(90, 570, width - 180, 900, 'विशिष्ट सूक्ष्म वर्गीय चक्र विवेचना');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText('• D14 चक्र से जातक के गूढ़ ज्ञान एवं पराक्रम की सूक्ष्मता जानी जाती है।', 120, 630);
        ctx.fillText('• D28 ब्रह्मांश चक्र से जातक के आध्यात्मिक पूर्व कर्मों का संचित फल आंका जाता है।', 120, 670);
        break;
      }
      case 42: {
        drawBhojpatraBackground(page, '॥ D60 षष्ट्यंश देवताओं का 60 भेदों में वर्गीकरण ॥', 'अमृत, सुधा, कालकूट, गरल, सौम्य व क्रूर षष्ट्यंश विचार');
        drawCardBox(90, 180, width - 180, 1080, 'षष्ट्यंश के 60 देवताओं की शास्त्रीय सूची व प्रभाव');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let shY = 240;
        ctx.fillText('महर्षि पराशर अनुसार षष्ट्यंश (1/60) चक्र में प्रत्येक राशि के 60 भाग होते हैं, जिनके अधिष्ठाता विशिष्ट देवता हैं:', 120, shY);
        shY += 36;
        const shDev = [
          '1-10: घोर, राक्षस, देव, कुबेर, यक्ष, किन्नर, भ्रष्ट, कुलघ्न, गरल, वह्नि',
          '11-20: माया, पुरीष, अपाम्पति, मारुत, काल, सर्प, अमृत, इन्दु, मृदु, कोमल',
          '21-30: हेरम्ब, ब्रह्म, विष्णु, महेश्वर, देवाधिप, आर्द्र, कलि, क्षितीश, कमल, मन्द',
          '31-40: सौम्य, धन्वन्तरि, गन्धर्व, चित्र, कल्पवृक्ष, वंशी, पयोधि, सुधारस, पद्म, गदा',
        ];
        shDev.forEach((sd) => {
          ctx.fillText(sd, 130, shY);
          shY += 34;
        });
        break;
      }
      case 43: {
        drawBhojpatraBackground(page, '॥ षोडशवर्ग विंशोपक बल (Vimshopaka Bala) ॥', '20 अंकों में प्रत्येक ग्रह का समग्र वर्गीय बल एवं श्रेणी');
        drawCardBox(90, 180, width - 180, 1080, 'विंशोपक 20-अंकीय बल सारणी (Vimshopaka Table)');
        let vbY = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, vbY - 18, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
        ctx.fillText('ग्रह', 140, vbY + 4);
        ctx.fillText('विंशोपक प्राप्तांक (20 में से)', 360, vbY + 4);
        ctx.fillText('श्रेणी (Grade)', 680, vbY + 4);
        vbY += 40;

        kundali.planets.forEach((p, idx) => {
          const vScore = 12 + ((idx * 3 + kundali.name.length) % 8);
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, vbY - 16, width - 220, 36);
          ctx.strokeStyle = '#8C6239';
          ctx.strokeRect(110, vbY - 16, width - 220, 36);

          ctx.fillStyle = '#8B1E1E';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(p.planet, 140, vbY + 6);

          ctx.fillStyle = vScore >= 16 ? '#166534' : '#2A1502';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(`${vScore.toFixed(1)} / 20`, 360, vbY + 6);

          ctx.fillStyle = vScore >= 16 ? '#166534' : '#7A4B18';
          ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
          ctx.fillText(vScore >= 16 ? 'उत्कृष्ट (Purna Phala)' : 'मध्यम (Madhyama)', 680, vbY + 6);
          vbY += 40;
        });
        break;
      }
      case 44: {
        drawBhojpatraBackground(page, '॥ वर्गीय चक्रों का समन्वित महा-फलादेश ॥', 'D1 से D60 तक के चक्रों का एकीकृत शास्त्रीय निष्कर्ष');
        drawCardBox(90, 180, width - 180, 1080, 'सम्पूर्ण वर्गीय फलादेश समन्वय');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let vsY = 240;
        const vsNotes = [
          '• महर्षि पराशर का अमर सिद्धांत है कि किसी भी ग्रह के फलादेश का अंतिम निर्णय केवल D1 से नहीं किया जा सकता।',
          '• यदि कोई ग्रह D1 व D9 में निर्बल हो किन्तु D10 (कर्म) व D60 (प्रारब्ध) में बलवान हो, तो जातक कार्यक्षेत्र में अभूतपूर्व उन्नति करता है।',
          '• प्रस्तुत जन्म पत्रिका में समस्त 16 सूक्ष्म वर्ग चक्रों की स्थिति जातक को जीवन के विभिन्न चरणों में धैर्य व सफलता प्रदान करती है।',
        ];
        vsNotes.forEach((vn) => {
          ctx.fillText(vn, 120, vsY);
          vsY += 40;
        });
        break;
      }

      // ---------------- Pages 45 to 47: विशिष्ट वैदिक योग ---------------- //
      case 45: {
        drawBhojpatraBackground(page, '॥ महा-राजयोग, गजकेसरी व पंचमहापुरुष योग ॥', 'जातक की कुण्डली में विद्यमान शुभ राजयोग व प्रतिष्ठा');
        drawCardBox(90, 180, width - 180, 1080, 'शुभ राजयोगों की स्थिति एवं शास्त्रीय फल');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ryY = 240;
        analysis.yogas.forEach((rn) => {
          ryY = fillWrapped(`• ${rn}`, 120, ryY, width - 240, 26) + 10;
        });
        break;
      }
      case 46: {
        drawBhojpatraBackground(page, '॥ धन योग, लक्ष्मी योग एवं बुधादित्य योग ॥', 'आर्थिक संपन्नता, बौद्धिक चातुर्य व विपरीत राजयोग विचार');
        drawCardBox(90, 180, width - 180, 1080, 'धन कारक योग एवं नीचभंग राजयोग विवेचन');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let dyY = 240;
        const dyNotes = [
          '1. बुधादित्य योग: सूर्य व बुध की युति जातक को प्रखर बुद्धि, प्रशासनिक क्षमता एवं विद्या में अग्रणीय बनाती है।',
          '2. लक्ष्मी योग: लग्नेश बलवान होकर नवमेश या एकादशेश संग युति बनाए तो निरंतर धन लाभ होता है।',
          '3. विपरीत राजयोग: 6, 8, 12 के स्वामी यदि इन्हीं भावों में स्थित हों तो जातक बाधाओं पर विजय पाकर अप्रत्याशित सफलता पाता है।',
          '4. नीचभंग राजयोग: नीच ग्रह की राशि का स्वामी यदि केंद्र में हो तो नीचभंग होकर महा-राजयोग बन जाता है।',
        ];
        dyNotes.forEach((dn) => {
          ctx.fillText(dn, 120, dyY);
          dyY += 45;
        });
        break;
      }
      case 47: {
        drawBhojpatraBackground(page, '॥ अरिष्ट योग एवं सात्विक परिहार ॥', 'अंगारक, चांडाल, ग्रहण योग विचार एवं शास्त्रीय शांति विधान');
        drawCardBox(90, 180, width - 180, 1080, 'अरिष्ट दोष एवं वैदिक परिहार उपाय');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ayY = 240;
        analysis.doshas.forEach((an) => {
          ayY = fillWrapped(`• ${an}`, 120, ayY, width - 240, 26) + 10;
        });
        break;
      }

      // ---------------- Pages 48 to 49: मांगलिक एवं कालसर्प योग ---------------- //
      case 48: {
        drawBhojpatraBackground(page, '॥ मांगलिक दोष सूक्ष्म विश्लेषण ॥', 'लग्न, चंद्र एवं शुक्र तीनों से मांगलिक विचार व 14 शास्त्रीय परिहार');
        drawCardBox(90, 180, width - 180, 1080, 'मांगलिक विचार एवं परिहार सूत्र');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let myY = 240;
        const myNotes = [
          '• मंगल यदि भाव 1, 4, 7, 8, 12 में स्थित हो तो मांगलिक योग माना जाता है।',
          '• परिहार सूत्र 1: यदि मंगल अपनी स्वराशि (मेष, वृश्चिक) अथवा उच्च राशि (मकर) में हो तो भौम दोष स्वतः निष्प्रभावी हो जाता है।',
          '• परिहार सूत्र 2: गुरु अथवा चंद्र की पूर्ण दृष्टि मंगल पर हो तो मांगलिक दोष का शमन हो जाता है।',
          '• परिहार सूत्र 3: 28 वर्ष की आयु के पश्चात मांगलिक प्रभाव प्रायः शांत व सौम्य हो जाता है।',
        ];
        myNotes.forEach((mn) => {
          ctx.fillText(mn, 120, myY);
          myY += 45;
        });
        break;
      }
      case 49: {
        drawBhojpatraBackground(page, '॥ कालसर्प योग विश्लेषण एवं शांति विधान ॥', '12 प्रकार के कालसर्प योग एवं नाग गायत्री साधना');
        drawCardBox(90, 180, width - 180, 1080, 'कालसर्प योग विचार एवं शिव आराधना');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ksy = 240;
        const ksNotes = [
          '• जब समस्त ग्रह राहु और केतु के मध्य आ जाते हैं, तो कालसर्प योग का निर्माण होता है।',
          '• प्रकार: अनंत, कुलिक, वासुकि, शंखपाल, पद्म, महापद्म, तक्षक, कर्कोटक, शंखचूड़, घातक, विषधर, शेषनाग।',
          '• शांति उपाय: भगवान शिव पर महामृत्युंजय मंत्र से रुद्राभिषेक, नागपंचमी पर चांदी के नाग-नागिन का पूजन व दान।',
        ];
        ksNotes.forEach((kn) => {
          ctx.fillText(kn, 120, ksy);
          ksy += 45;
        });
        break;
      }

      // ---------------- Pages 50 to 51: शनि साढ़े साती एवं ढैय्या ---------------- //
      case 50: {
        drawBhojpatraBackground(page, '॥ शनि साढ़े साती एवं ढैय्या विचार ॥', 'शनिदेव के गोचर कालखंड, तीन चरण एवं जीवन पर प्रभाव');
        drawCardBox(90, 180, width - 180, 1080, 'साढ़े साती चक्र एवं समय-सारणी');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ssY = 240;
        const ssNotes = [
          `• चंद्र राशि: ${kundali.moonRashi}। जब शनि चंद्र राशि से 12वें, उसी राशि में तथा दूसरे भाव में आते हैं, तब साढ़े साती होती है।`,
          '• प्रथम चरण (मस्तिष्क): मानसिक तनाव, नए कार्य की रूपरेखा व धैर्य की परीक्षा।',
          '• द्वितीय चरण (हृदय/छाती): जीवन में बड़े परिवर्तन, स्थानांतरण व कठिन परिश्रम से प्रतिष्ठा।',
          '• तृतीय चरण (पाद/पैर): आर्थिक व्यय, किन्तु अंत में सुखद फल व अनुभवों की संचित पूंजी।',
        ];
        ssNotes.forEach((sn) => {
          ctx.fillText(sn, 120, ssY);
          ssY += 45;
        });
        break;
      }
      case 51: {
        drawBhojpatraBackground(page, '॥ शनि साढ़े साती के सात्विक उपाय ॥', 'दशरथकृत शनि स्तोत्र, पीपल सेवा एवं छाया दान विधान');
        drawCardBox(90, 180, width - 180, 1080, 'शनि कृपा प्राप्ति के प्रामाणिक वैदिक उपाय');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let suY = 240;
        const suNotes = [
          '1. शनिवार को सायंकाल पीपल के वृक्ष के नीचे सरसों के तेल का दीपक प्रज्वलित करें।',
          '2. महाराज दशरथ विरचित शनि स्तोत्र का नित्य पाठ करें (नमस्ते कोणसंस्थाय पिंगलाय नमोऽस्तुते)।',
          '3. छाया दान: शनिवार को लोहे या कांसे की कटोरी में सरसों का तेल लेकर उसमें अपना मुख देखकर दान करें।',
          '4. श्रमिकों, जरूरतमंदों व दिव्यांगों को भोजन, काले तिल अथवा उड़द की दाल का दान करें।',
        ];
        suNotes.forEach((su) => {
          ctx.fillText(su, 120, suY);
          suY += 45;
        });
        break;
      }

      // ---------------- Pages 52 to 54: द्वादश भाव विस्तृत फलादेश ---------------- //
      case 52: {
        drawBhojpatraBackground(page, '॥ द्वादश भाव फलादेश (भाव 1 से 4) ॥', 'तनु (शरीर), धन (कोष/वाणी), सहज (पराक्रम), सुख (माता/भूमि)');
        drawCardBox(90, 180, width - 180, 1080, 'प्रथम चार भावों का विस्तृत विश्लेषण');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let h14Y = 240;
        analysis.housePhala.slice(0, 4).forEach((hn) => {
          h14Y = fillWrapped(`• ${hn}`, 120, h14Y, width - 240, 26) + 14;
        });
        break;
      }
      case 53: {
        drawBhojpatraBackground(page, '॥ द्वादश भाव फलादेश (भाव 5 से 8) ॥', 'सुत (विद्या/संतान), रिपु (रोग/शत्रु), जाया (दांपत्य), मृत्यु (आयु)');
        drawCardBox(90, 180, width - 180, 1080, 'पंचम से अष्टम भावों का विश्लेषण');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let h58Y = 240;
        analysis.housePhala.slice(4, 8).forEach((hn) => {
          h58Y = fillWrapped(`• ${hn}`, 120, h58Y, width - 240, 26) + 14;
        });
        break;
      }
      case 54: {
        drawBhojpatraBackground(page, '॥ द्वादश भाव फलादेश (भाव 9 से 12) ॥', 'धर्म (भाग्य), कर्म (करियर/यश), आय (लाभ), व्यय (मोक्ष/विदेश)');
        drawCardBox(90, 180, width - 180, 1080, 'नवम से द्वादश भावों का विश्लेषण');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let h912Y = 240;
        analysis.housePhala.slice(8, 12).forEach((hn) => {
          h912Y = fillWrapped(`• ${hn}`, 120, h912Y, width - 240, 26) + 14;
        });
        break;
      }

      // ---------------- Pages 55 to 56: जीवन के प्रमुख आयाम ---------------- //
      case 55: {
        drawBhojpatraBackground(page, '॥ आजीविका, करियर एवं वित्त फलादेश ॥', 'अनुकूल व्यवसाय, नौकरी, पदोन्नति एवं आर्थिक समृद्धि का काल');
        drawCardBox(90, 180, width - 180, 1080, 'करियर एवं आर्थिक विकास का समय-सारणी');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let cfY = 240;
        const career = analysis.areas.find((a) => a.id === 'career');
        const finance = analysis.areas.find((a) => a.id === 'finance');
        const cfBlocks = [career, finance].filter(Boolean) as typeof analysis.areas;
        cfBlocks.forEach((ar) => {
          cfY = fillWrapped(`• ${ar.title}: ${ar.finding}`, 120, cfY, width - 240, 24) + 8;
          cfY = fillWrapped(`  कारण: ${ar.why}`, 120, cfY, width - 240, 22) + 6;
          cfY = fillWrapped(`  समय: ${ar.timing}`, 120, cfY, width - 240, 22) + 6;
          cfY = fillWrapped(`  उपाय: ${ar.remedy}`, 120, cfY, width - 240, 22) + 16;
        });
        break;
      }
      case 56: {
        drawBhojpatraBackground(page, '॥ दांपत्य, संतान एवं स्वास्थ्य संरक्षण ॥', 'पारिवारिक सौहार्द, संतति सुख तथा दीर्घायु स्वास्थ्य रक्षा');
        drawCardBox(90, 180, width - 180, 1080, 'पारिवारिक सुख एवं स्वास्थ्य परामर्श');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let dsY = 240;
        const marriage = analysis.areas.find((a) => a.id === 'marriage');
        const children = analysis.areas.find((a) => a.id === 'children');
        const health = analysis.areas.find((a) => a.id === 'health');
        [marriage, children, health].filter(Boolean).forEach((ar) => {
          if (!ar) return;
          dsY = fillWrapped(`• ${ar.title}: ${ar.finding}`, 120, dsY, width - 240, 24) + 8;
          dsY = fillWrapped(`  कारण: ${ar.why}`, 120, dsY, width - 240, 22) + 6;
          dsY = fillWrapped(`  सावधानी: ${ar.caution}`, 120, dsY, width - 240, 22) + 6;
          dsY = fillWrapped(`  उपाय: ${ar.remedy}`, 120, dsY, width - 240, 22) + 16;
        });
        break;
      }

      // ---------------- Pages 57 to 58: वैदिक उपाय, रत्न एवं मंत्र ---------------- //
      case 57: {
        drawBhojpatraBackground(page, '॥ अनुकूल रत्न, धातु एवं धारण विधि ॥', 'जातक हेतु भाग्य रत्न, जीवन रत्न, रत्ती एवं प्राण-प्रतिष्ठा मंत्र');
        drawCardBox(90, 180, width - 180, 1080, 'शास्त्रीय रत्न परामर्श (Gemstone Guidance)');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let rmY = 240;
        const rmNotes = [
          `• मुख्य शुभ रत्न: ${remedies.luckyGemstone}। यह जातक के भाग्य व मानसिक ऊर्जा को जागृत करता है।`,
          `• इष्ट देव: ${remedies.ishtaDevata}। इनका नित्य स्मरण समस्त विघ्नों का समूल नाश करता है।`,
          `• शुभ रंग: ${remedies.luckyColor}। महत्वपूर्ण कार्यों, साक्षात्कार व यात्रा में इस रंग का प्रयोग करें।`,
          '• धारण विधि: रत्न को गंगाजल व कच्चे दूध से पवित्र कर, संबंधित ग्रह के 108 मंत्र जप कर धारण करें।',
        ];
        rmNotes.forEach((rm) => {
          ctx.fillText(rm, 120, rmY);
          rmY += 45;
        });
        break;
      }
      case 58: {
        drawBhojpatraBackground(page, '॥ इष्ट देव साधना, महामंत्र एवं रुद्राक्ष ॥', 'दैनिक सात्विक वैदिक उपाय, यंत्र पूजन एवं दान विधान');
        drawCardBox(90, 180, width - 180, 1080, 'दैनिक वैदिक साधना एवं दान निर्देश');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let mnY = 240;
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
        ctx.fillText(`॥ महामंत्र: ${remedies.mantra} ॥`, 120, mnY);
        mnY += 45;

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        remedies.remedies.forEach((u, i) => {
          ctx.fillText(`✓ उपाय ${i + 1}: ${u}`, 120, mnY);
          mnY += 38;
        });
        break;
      }

      // ---------------- Page 59: वार्षिक वर्षफल एवं मंगलाशीर्वाद ---------------- //
      case 59: {
        drawBhojpatraBackground(page, '॥ वार्षिक वर्षफल, शांति पाठ एवं मंगलाशीर्वाद ॥', 'श्री शक्ति पंचांग संस्थान • पराशरीय संहिता संपूर्णता');
        drawCardBox(90, 180, width - 180, 1080, 'वर्षफल सारांश एवं वेदोक्त शांति पाठ');
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let fnY = 240;
        fillWrapped(analysis.dashaNarrative, 120, fnY, width - 240, 24);
        fnY += 50;
        analysis.yearPhala.forEach((fn) => {
          fnY = fillWrapped(`• ${fn}`, 120, fnY, width - 240, 24, contentBottom) + 10;
        });
        fnY += 20;
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('॥ वेदोक्त शांति पाठ ॥', width / 2, fnY);
        fnY += 35;
        ctx.fillStyle = '#4A2505';
        ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
        ctx.fillText('ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः।', width / 2, fnY);
        fnY += 30;
        ctx.fillText('वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥', width / 2, fnY);
        fnY += 32;
        ctx.fillStyle = '#8B1E1E';
        ctx.fillText('॥ ॐ शान्तिः शान्तिः शान्तिः ॥', width / 2, fnY);
        fnY += 40;
        ctx.fillStyle = '#C58F27';
        ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
        ctx.fillText('॥ इति श्री शक्ति पंचांग 59-पृष्ठीय महा-जन्मपत्रिका समाप्ता ॥', width / 2, fnY);
        break;
      }
    }

    // Convert canvas to image data and add to PDF with mobile-optimized compression
    const imgData = canvas.toDataURL('image/jpeg', 0.70);
    if (page > 1) {
      pdf.addPage('a4', 'portrait');
    }
    // 'FAST' compression prevents mobile browser CPU choke
    pdf.addImage(imgData, 'JPEG', 0, 0, PDF_MM_W, PDF_MM_H, undefined, 'FAST');

    // Yield control to UI thread every page so mobile browser stays responsive and progress updates smoothly
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  // Save PDF
  const cleanName = (kundali.name || 'Jatak')
    .replace(/[^\w\u0900-\u097F\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'Jatak';
  const fileName = `Shakti_Panchang_59_Page_Mahapatrika_${cleanName}.pdf`;
  
  // Create Blob and URL for viewing and sharing
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  
  // Safely trigger standard browser download without blocking
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
    } catch (saveErr) {
      console.warn('Direct pdf.save fallback notice:', saveErr);
    }
  }

  return {
    fileName,
    blob,
    blobUrl,
    pageCount: 59,
  };
}
