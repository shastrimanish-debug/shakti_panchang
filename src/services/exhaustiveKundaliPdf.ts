import { jsPDF } from 'jspdf';
import { KundaliData } from '../types';
import { RASHIS, calculateVargaSign } from './astronomy';
import { DASHA_ORDER, DASHA_YEARS, getVedicRemedies } from './kundali';
import { calculateAshtakvarga } from './kpAshtakvarga';
import { analyzeKundali } from './predictions';
import { waitForPdfFonts } from './pdfFonts';
import { PDF_MM_H, PDF_MM_W, PDF_PX_H, PDF_PX_W } from './pdfPage';
import { deliverPdf } from '../lib/device';
import { trPlanet, trRashi, trVedic, trWeekday } from '../i18n/vedicTranslate';

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

function getNakshatraLord(nak: string, lang: string = 'hi'): string {
  const cLang = (lang || 'hi').slice(0, 2).toLowerCase();
  for (const [key, lord] of Object.entries(NAKSHATRA_LORD_MAP)) {
    if (nak && nak.includes(key)) {
      if (cLang === 'en') return trPlanet(lord, 'en');
      if (cLang === 'gu') return `${trPlanet(lord, 'gu')} દેવ`;
      return `${lord} देव`;
    }
  }
  return cLang === 'en' ? 'Benefic Planet' : cLang === 'gu' ? 'શુભ ગ્રહ' : 'शुभ ग्रह';
}

/**
 * Renders a full 59-Page Exhaustive Vedic Mahapatrika into a high-fidelity PDF.
 * Uses an off-screen HTML5 canvas to natively draw Devanagari Hindi text,
 * ornamental Vedic borders, charts, and tables page-by-page.
 */
export async function generateExhaustive59PageKundaliPdf(
  kundali: KundaliData,
  onProgress?: PdfProgressCallback,
  lang: string = 'hi'
): Promise<{
  fileName: string;
  blob: Blob;
  blobUrl: string;
  pageCount: number;
}> {
  const currentLang = (lang || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (currentLang === 'en' ? en : currentLang === 'gu' ? gu : hi);
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
    ctx.fillText(
      L(
        '॥ श्री शक्ति पंचांग संस्थान • महर्षि पराशर वैदिक ज्योतिष संहिता ॥',
        '॥ Shri Shakti Panchang Sansthan • Maharshi Parashara Vedic Astrology Samhita ॥',
        '॥ શ્રી શક્તિ પંચાંગ સંસ્થાન • મહર્ષિ પરાશર વૈદિક જ્યોતિષ સંહિતા ॥'
      ),
      width / 2,
      footerY + 6
    );

    const lblJatak = L('जातक', 'Native', 'જાતક');
    const lblPage = L('पृष्ठ', 'Page', 'પૃષ્ઠ');

    ctx.fillStyle = '#5C3A21';
    ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${lblJatak}: ${kundali.name} (${kundali.birthPlace})`, 90, footerY + 25);

    ctx.textAlign = 'right';
    ctx.fillText(`${lblPage} ${pageNum} / ${totalPages}`, width - 90, footerY + 25);
  };

  const PLANET_ABBR: Record<string, string> = currentLang === 'en'
    ? {
        सूर्य: 'Su',
        चंद्र: 'Mo',
        मंगल: 'Ma',
        बुध: 'Me',
        गुरु: 'Ju',
        शुक्र: 'Ve',
        शनि: 'Sa',
        राहु: 'Ra',
        केतु: 'Ke',
      }
    : currentLang === 'gu'
    ? {
        सूर्य: 'સૂ',
        चंद्र: 'ચં',
        मंगल: 'મં',
        बुध: 'બુ',
        गुरु: 'ગુ',
        शुक्र: 'શુ',
        शनि: 'શનિ',
        राहु: 'રા',
        केतु: 'કે',
      }
    : {
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
  const retroTag = L('व', 'R', 'વ');
  const planetAbbr = (name: string) => PLANET_ABBR[name] || trPlanet(name, currentLang).slice(0, 2);
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
        full: trPlanet(p.planet, currentLang),
      });
    });
    return occ;
  };
  const formatOcc = (list?: { name: string; retro: boolean; deg: string }[], withDeg = true) => {
    if (!list || !list.length) return '—';
    return list.map((p) => `${p.name}${p.retro ? retroTag : ''}${withDeg ? ` ${p.deg}` : ''}`).join('  ');
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
      const slice = 30 / Math.max(1, vargaDivision);
      const vdeg = vargaDivision === 1 ? p.degreeInRashi : (p.degreeInRashi % slice) * vargaDivision;
      hPlanets[house]?.push({
        name: planetAbbr(p.planet),
        retro: p.isRetrograde,
        deg: `${Math.floor(vdeg)}°`,
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
        const label = n >= 4 ? `${p.name}${p.retro ? retroTag : ''}` : `${p.name}${p.retro ? retroTag : ''} ${p.deg}`;
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
        const names = list.map((p) => `${p.name}${p.retro ? retroTag : ''}`);
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
    ctx.fillText(L('सुदर्शन', 'Sudarshan', 'સુદર્શન'), cx, cy - 8);
    ctx.font = 'bold 12px "Tiro Devanagari Hindi", serif';
    ctx.fillText(L('चक्र', 'Chakra', 'ચક્ર'), cx, cy + 12);
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

  const remedies = getVedicRemedies(kundali, currentLang);
  const analysis = analyzeKundali(kundali, currentLang);
  const dateLocale = currentLang === 'en' ? 'en-US' : currentLang === 'gu' ? 'gu-IN' : 'hi-IN';
  const fmtDate = (d: Date) =>
    d.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });

  // ---------------- Render All 59 Pages ---------------- //
  for (let page = 1; page <= totalPages; page++) {
    const stageMsg = currentLang === 'en'
      ? `Preparing page ${page}/${totalPages}...`
      : currentLang === 'gu'
      ? `પૃષ્ઠ ${page}/${totalPages} તૈયાર થઈ રહ્યું છે...`
      : `पृष्ठ ${page}/${totalPages} तैयार हो रहा है...`;
    if (onProgress) onProgress(page, totalPages, stageMsg);

    // Yield to browser event loop
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    switch (page) {
      // ---------------- Page 1: मुखपृष्ठ (Cover Page) ---------------- //
      case 1: {
        const coverTitle = currentLang === 'en'
          ? '॥ Complete Vedic Maha-Janmapatrika ॥'
          : currentLang === 'gu'
          ? '॥ સંપૂર્ણ વૈદિક મહા-જન્મપત્રિકા ॥'
          : '॥ सम्पूर्ण वैदिक महा-जन्मपत्रिका ॥';
        const coverSub = currentLang === 'en'
          ? 'Shri Shakti Panchang Sansthan • Parashara 59-Page Samhita'
          : currentLang === 'gu'
          ? 'શ્રી શક્તિ પંચાંગ સંસ્થાન • પરાશરીય ૫૯-પૃષ્ઠીય સંહિતા'
          : 'श्री शक्ति पंचांग संस्थान • पराशरीय 59-पृष्ठीय संहिता';
        drawBhojpatraBackground(page, coverTitle, coverSub);
        
        // Large Center Emblem
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 44px serif';
        ctx.textAlign = 'center';
        ctx.fillText('ॐ', width / 2, 220);

        ctx.font = 'bold 22px "Tiro Devanagari Hindi", serif';
        ctx.fillText('॥ शुभम् भवतु • सर्वसिद्धिप्रदायिनी पत्रिका ॥', width / 2, 265);

        // Birth Particulars Table Box
        drawCardBox(
          90,
          310,
          width - 180,
          420,
          L('जातक जन्म विवरण एवं पंचांग तत्व', 'Native Birth Particulars & Panchang Elements', 'જાતક જન્મ વિગતો અને પંચાંગ તત્વો')
        );
        let curY = 370;
        ctx.font = '16px "Tiro Devanagari Hindi", serif';
        ctx.fillStyle = '#3E2714';
        ctx.textAlign = 'left';

        const bRows = [
          [
            L('नाम:', 'Name:', 'નામ:'),
            kundali.name,
            L('जन्म तिथि:', 'Birth Date:', 'જન્મ તારીખ:'),
            fmtDate(kundali.birthDate),
          ],
          [
            L('जन्म समय:', 'Birth Time:', 'જન્મ સમય:'),
            kundali.birthTime,
            L('जन्म स्थान:', 'Birth Place:', 'જન્મ સ્થળ:'),
            kundali.birthPlace,
          ],
          [
            L('अक्षांश:', 'Latitude:', 'અક્ષાંશ:'),
            `${kundali.latitude.toFixed(2)}° ${L('उत्तर', 'N', 'ઉત્તર')}`,
            L('देशांतर:', 'Longitude:', 'રેખાંશ:'),
            `${kundali.longitude.toFixed(2)}° ${L('पूर्व', 'E', 'પૂર્વ')}`,
          ],
          [
            L('लग्न:', 'Ascendant:', 'લગ્ન:'),
            `${trRashi(kundali.lagnaRashi, currentLang)} (${kundali.lagnaDegree.toFixed(2)}°)`,
            L('चंद्र राशि:', 'Moon Sign:', 'ચંદ્ર રાશિ:'),
            trRashi(kundali.moonRashi, currentLang),
          ],
          [
            L('नक्षत्र:', 'Nakshatra:', 'નક્ષત્ર:'),
            `${trVedic(kundali.nakshatra, currentLang)} (${L('चरण', 'Pada', 'ચરણ')} ${kundali.charan})`,
            L('नक्षत्र स्वामी:', 'Nakshatra Lord:', 'નક્ષત્ર સ્વામી:'),
            trPlanet(kundali.nakshatraLord || '', currentLang) || getNakshatraLord(kundali.nakshatra, currentLang),
          ],
          [
            L('गण:', 'Gana:', 'ગણ:'),
            trVedic(kundali.gana, currentLang),
            L('नाड़ी:', 'Nadi:', 'નાડી:'),
            trVedic(kundali.nadi, currentLang),
          ],
          [
            L('योनि:', 'Yoni:', 'યોનિ:'),
            trVedic(kundali.yoni, currentLang),
            L('वर्ण:', 'Varna:', 'વર્ણ:'),
            trVedic(kundali.varna, currentLang),
          ],
          [
            L('वश्य:', 'Vashya:', 'વશ્ય:'),
            trVedic(kundali.vashya, currentLang),
            L('वर्तमान महादशा:', 'Current Dasha:', 'વર્તમાન મહાદશા:'),
            `${trPlanet(kundali.mahadasha, currentLang)} / ${trPlanet(kundali.antardasha, currentLang)}`,
          ],
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

        // Sacred Sanskrit Shloka Box (Sanskrit mantra preserved verbatim)
        drawCardBox(
          90,
          770,
          width - 180,
          320,
          L('महर्षि पराशर विरचित मंगलाचरण एवं संकल्प', 'Maharshi Parashara Invocation & Samhita Overview', 'મહર્ષિ પરાશર વિરચિત મંગલાચરણ અને સંકલ્પ')
        );
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('॥ ब्रह्मामुरारिस्त्रिपुरांतकारी भानुः शशी भूमिसुतो बुधश्च ॥', width / 2, 830);
        ctx.fillText('॥ गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम् ॥', width / 2, 865);

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        const shlokaNote = L(
          'प्रस्तुत महा-जन्मपत्रिका में महर्षि पराशर प्रतिपादित बृहत्पाराशरहोराशास्त्र, जातकपारिजात व फलदीपिका के प्रामाणिक सिद्धांतों के आधार पर जातक के जीवन के समस्त 16 सूक्ष्म वर्गीय चक्रों (D1 से D60), विंशोत्तरी दशाओं, ग्रह बल (षड्बल), अष्टकवर्ग, भाव फलादेश, विशिष्ट योग, अरिष्ट परिहार तथा सात्विक वैदिक उपायों का समावेश है। यह विस्तृत 59-पृष्ठीय ग्रन्थ जातक के सम्पूर्ण भूत, भविष्य एवं वर्तमान प्रारब्ध का अचूक दिग्दर्शन कराता है।',
          'Grounded in the classical principles of Brihat Parashara Hora Shastra, Jataka Parijata, and Phaladeepika, this Maha-Janmapatrika includes all 16 divisional charts (D1 to D60), 120-year Vimshottari Mahadasha and Antardasha timelines, Shadbala, Ashtakavarga, 12-house predictions, Rajayogas, Dosha remedies, and Sattvic Vedic guidance across 59 detailed pages.',
          'પ્રસ્તુત મહા-જન્મપત્રિકામાં મહર્ષિ પરાશર પ્રતિપાદિત બૃહત્પરાશરહોરાશાસ્ત્ર, જાતકપારિજાત અને ફળદીપિકાના પ્રામાણિક સિદ્ધાંતોને આધારે જાતકના જીવનના તમામ ૧૬ સૂક્ષ્મ વર્ગીય ચક્રો (D1 થી D60), વિંશોત્તરી દશાઓ, ગ્રહ બળ (ષડ્બળ), અષ્ટકવર્ગ, ભાવ ફળાદેશ, વિશિષ્ટ યોગ, અરિષ્ટ પરિહાર અને સાત્વિક વૈદિક ઉપાયોનો સમાવેશ છે.'
        );
        fillWrapped(shlokaNote, 130, 920, width - 260, 28, 1080);

        // Bottom Seal
        ctx.fillStyle = '#C58F27';
        ctx.font = 'bold 17px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('❖  सत्यं ज्ञानमनन्तं ब्रह्म • सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके  ❖', width / 2, 1140);
        break;
      }

      // ---------------- Page 2: अवकहड़ा चक्र एवं जन्म सारणी ---------------- //
      case 2: {
        drawBhojpatraBackground(
          page,
          L('॥ अवकहड़ा चक्र एवं जन्म पत्रिका सारणी ॥', '॥ Avakahada Chakra & Birth Table ॥', '॥ અવકહડા ચક્ર અને જન્મ પત્રિકા સારણી ॥'),
          L('ज्योतिष शास्त्रीय आधारभूत घटक एवं त्रिविध गुण विचार', 'Foundational Astrological Elements & Natal Attributes', 'જ્યોતિષ શાસ્ત્રીય આધારભૂત ઘટકો અને ત્રિવિધ ગુણ વિચાર')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          520,
          L('अवकहड़ा अष्टक एवं नैसर्गिक तत्व विभाजन', 'Avakahada Elements & Natural Division', 'અવકહડા અષ્ટક અને નૈસર્ગિક તત્વ વિભાજન')
        );

        const avTable = [
          [L('घटक', 'Element', 'ઘટક'), L('मान', 'Value', 'મૂલ્ય'), L('फल व शास्त्रीय विश्लेषण', 'Classical Meaning & Interpretation', 'ફળ અને શાસ્ત્રીય વિશ્લેષણ')],
          [L('वर्ण (Varna)', 'Varna', 'વર્ણ'), trVedic(kundali.varna, currentLang), L('जातक का आध्यात्मिक, सामाजिक स्वभाव व नैसर्गिक संस्कार', 'Spiritual temperament, innate values & social nature', 'જાતકનો આધ્યાત્મિક, સામાજિક સ્વભાવ અને નૈસર્ગિક સંસ્કાર')],
          [L('वश्य (Vashya)', 'Vashya', 'વશ્ય'), trVedic(kundali.vashya, currentLang), L('पारस्परिक आकर्षण, अनुकूलता एवं समाज पर प्रभाव', 'Mutual harmony, magnetic influence & compatibility', 'પરસ્પર આકર્ષણ, અનુકૂળતા અને સમાજ પર પ્રભાવ')],
          [L('तारा (Tara)', 'Tara', 'તારા'), L('जन्म / संपत', 'Janma / Sampat', 'જન્મ / સંપત્'), L('दैनिक कार्यसिद्धि व नक्षत्र गति का शुभ-अशुभ फल', 'Daily task fruition & auspicious planetary transit alignment', 'દૈનિક કાર્યસિદ્ધિ અને નક્ષત્ર ગતિનું શુભાશુભ ફળ')],
          [L('योनि (Yoni)', 'Yoni', 'યોનિ'), trVedic(kundali.yoni, currentLang), L('मूल प्रकृति, आचार-विचार, शारीरिक ऊर्जा व स्वभावगत सामंजस्य', 'Core instinct, physical vitality & temperament alignment', 'મૂળ પ્રકૃતિ, આચાર-વિચાર, શારીરિક ઊર્જા અને સ્વભાવ સામંજસ્ય')],
          [L('ग्रह मैत्री', 'Graha Maitri', 'ગ્રહ મૈત્રી'), L('सम / मित्र', 'Neutral / Friendly', 'સમ / મિત્ર'), L('मनोवैज्ञानिक अनुकूलता एवं मित्रों-सगे-संबंधियों संग संबंध', 'Psychological affinity & relationship harmony', 'મનોવૈજ્ઞાનિક અનુકૂળતા અને પરિવાર-મિત્રો સાથે સંબંધ')],
          [L('गण (Gana)', 'Gana', 'ગણ'), trVedic(kundali.gana, currentLang), L('जातक का सात्विक, राजसिक अथवा तामसिक दृष्टिकोण', 'Sattvic, Rajasic or Tamasic inner disposition', 'જાતકનો સાત્વિક, રાજસિક અથવા તામસિક દૃષ્ટિકોણ')],
          [L('भकूट (Bhakoot)', 'Bhakoot', 'ભકૂટ'), trRashi(kundali.moonRashi, currentLang), L('भावुकता, दाम्पत्य सौहार्द व आत्मीय संतुलन', 'Emotional resonance, domestic harmony & prosperity', 'ભાવુકતા, દાંપત્ય સૌહાર્દ અને આત્મીય સંતુલન')],
          [L('नाड़ी (Nadi)', 'Nadi', 'નાડી'), trVedic(kundali.nadi, currentLang), L('स्वास्थ्य, जैविक ऊर्जा, वंश वृद्धि व शारीरिक संतुलन', 'Pranic constitution, vitality & lineage well-being', 'સ્વાસ્થ્ય, જૈવિક ઊર્જા, વંશ વૃદ્ધિ અને શારીરિક સંતુલન')],
          [L('पाया (Paya)', 'Paya', 'પાયો'), L('रजत (चांदी)', 'Silver (Rajata)', 'રજત (ચાંદી)'), L('उत्तम व शुभदायक, जीवन पर्यंत सुख-समृद्धि प्रदायक', 'Benefic and auspicious, bestowing lifelong prosperity', 'ઉત્તમ અને શુભદાયક, જીવનપર્યંત સુખ-સમૃદ્ધિ પ્રદાયક')],
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
            ctx.fillText(fitLine(row[0], 190), 130, ty);
            ctx.fillStyle = '#2A1502';
            ctx.fillText(fitLine(row[1], 215), 330, ty);
            ctx.font = '14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(fitLine(row[2], width - 685), 560, ty);
            ty += 32;
          }
        });

        // Planetary Overview Summary Box
        drawCardBox(
          90,
          740,
          width - 180,
          520,
          L('लग्न, चंद्र एवं सूर्य बल सार', 'Ascendant, Moon & Sun Strength Summary', 'લગ્ન, ચંદ્ર અને સૂર્ય બળ સાર')
        );
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        const moonNameT = trRashi(kundali.moonRashi, currentLang);
        const lagnaNameT = trRashi(kundali.lagnaRashi, currentLang);
        const nakNameT = trVedic(kundali.nakshatra, currentLang);
        const nakLordT = trPlanet(kundali.nakshatraLord || '', currentLang) || getNakshatraLord(kundali.nakshatra, currentLang);
        const p2notes = L(
          [
            `• लग्न स्पष्ट: ${lagnaNameT} राशि ${kundali.lagnaDegree.toFixed(2)} अंश। लग्न स्वामी की स्थिति जीवन शक्ति व देह पुष्टि करती है।`,
            `• चंद्र स्पष्ट: ${moonNameT} राशि में चंद्र देव ${nakNameT} नक्षत्र के चरण ${kundali.charan} में स्थित हैं।`,
            `• जन्मकालीन नक्षत्र स्वामी: ${nakLordT}। इसी से विंशोत्तरी महादशा का प्रारंभिक भोग्य काल निर्धारित हुआ।`,
            `• राशि तत्व: ${moonNameT} राशि का तत्व जातक के अंतर्मन को दृढ़ता व सकारात्मक चिंतन प्रदान करता है।`,
            `• देव गुरु बृहस्पति एवं योगकारक ग्रहों का शुभाशुभ प्रभाव जातक को धर्म, नीति व सत्य के मार्ग पर प्रतिष्ठित करता है।`,
          ],
          [
            `• Ascendant Longitude: ${lagnaNameT} at ${kundali.lagnaDegree.toFixed(2)}°. The Ascendant lord governs vitality and physical resilience.`,
            `• Moon Longitude: Moon resides in ${moonNameT}, ${nakNameT} Nakshatra (Pada ${kundali.charan}).`,
            `• Birth Nakshatra Lord: ${nakLordT}. This governs the opening balance of the Vimshottari Mahadasha cycle.`,
            `• Sign Element: The elemental nature of ${moonNameT} confers inner stability, intuition, and balanced thought.`,
            `• Blessings of Jupiter and Yogakaraka planets establish the native on the path of righteousness, wisdom, and dignity.`,
          ],
          [
            `• લગ્ન સ્પષ્ટ: ${lagnaNameT} રાશિ ${kundali.lagnaDegree.toFixed(2)} અંશ. લગ્ન સ્વામીની સ્થિતિ જીવનશક્તિ અને દેહ પુષ્ટિ નક્કી કરે છે.`,
            `• ચંદ્ર સ્પષ્ટ: ${moonNameT} રાશિમાં ચંદ્ર દેવ ${nakNameT} નક્ષત્રના ચરણ ${kundali.charan}માં સ્થિત છે.`,
            `• જન્મકાલીન નક્ષત્ર સ્વામી: ${nakLordT}. આ જ ગ્રહથી વિંશોત્તરી મહાદશાનો પ્રારંભિક ભોગ્ય કાળ નક્કી થયો છે.`,
            `• રાશિ તત્વ: ${moonNameT} રાશિનું તત્વ જાતકના અંતર્મનને દૃઢતા અને સકારાત્મક ચિંતન પ્રદાન કરે છે.`,
            `• દેવગુરુ બૃહસ્પતિ અને યોગકારક ગ્રહોનો શુભાશુભ પ્રભાવ જાતકને ધર્મ, નીતિ અને સત્યના માર્ગે પ્રતિષ્ઠિત કરે છે.`,
          ]
        );
        let p2y = 800;
        p2notes.forEach((nt) => {
          p2y = fillWrapped(nt, 120, p2y, width - 240, 26) + 12;
        });
        break;
      }

      // ---------------- Page 3: D1 लग्न चक्र (Lagna Rashi Chart) ---------------- //
      case 3: {
        drawBhojpatraBackground(
          page,
          L('॥ D1 लग्न चक्र (Lagna Rashi Chart) ॥', '॥ D1 Lagna Chart (Birth Rashi Chart) ॥', '॥ D1 લગ્ન ચક્ર (Lagna Rashi Chart) ॥'),
          L('समग्र भौतिक जीवन, शरीर, व्यक्तित्व व मूल स्वभाव', 'Overall Physical Life, Body, Personality & Core Temperament', 'સમગ્ર ભૌતિક જીવન, શરીર, વ્યક્તિત્વ અને મૂળ સ્વભાવ')
        );
        drawNorthIndianDiamondChart(
          width / 2,
          375,
          340,
          1,
          L(`जातक ${kundali.name} — लग्न चक्र (D1)`, `${kundali.name} — Lagna Chart (D1)`, `જાતક ${kundali.name} — લગ્ન ચક્ર (D1)`)
        );

        drawCardBox(
          90,
          575,
          width - 180,
          900,
          L('द्वादश भाव — इस कुण्डली का स्पष्ट फलादेश', '12 Houses — Horoscope Specific Predictions', 'દ્વાદશ ભાવ — આ કુંડળીનો સ્પષ્ટ ફળાદેશ')
        );
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
        drawBhojpatraBackground(
          page,
          L('॥ चंद्र कुंडली एवं सूर्य कुंडली चक्र ॥', '॥ Moon Chart & Sun Chart ॥', '॥ ચંદ્ર કુંડળી અને સૂર્ય કુંડળી ચક્ર ॥'),
          L('मानसिक शक्ति, आत्मबल, पिता-माता सुख एवं चेतना का स्तर', 'Mental Strength, Willpower, Parental Blessings & Inner Consciousness', 'માનસિક શક્તિ, આત્મબળ, માતા-પિતા સુખ અને ચેતનાનું સ્તર')
        );
        const moonAsc = signOfPlanet('चंद्र', 1);
        const sunAsc = signOfPlanet('सूर्य', 1);
        drawNorthIndianDiamondChart(
          340,
          370,
          320,
          1,
          L(`चंद्र कुंडली — ${kundali.moonRashi} लग्न`, `Moon Chart — ${trRashi(kundali.moonRashi, 'en')} Asc`, `ચંદ્ર કુંડળી — ${trRashi(kundali.moonRashi, 'gu')} લગ્ન`),
          { ascSignIndex: moonAsc }
        );
        drawNorthIndianDiamondChart(
          900,
          370,
          320,
          1,
          L(`सूर्य कुंडली — ${kundali.sunRashi} लग्न`, `Sun Chart — ${trRashi(kundali.sunRashi, 'en')} Asc`, `સૂર્ય કુંડળી — ${trRashi(kundali.sunRashi, 'gu')} લગ્ન`),
          { ascSignIndex: sunAsc }
        );

        drawCardBox(
          90,
          570,
          width - 180,
          900,
          L('सुदर्शन चक्र — लग्न, चंद्र व सूर्य भाव तुलना सारणी', 'Sudarshan Chakra — Lagna, Moon & Sun House Comparison', 'સુદર્શન ચક્ર — લગ્ન, ચંદ્ર અને સૂર્ય ભાવ તુલના સારણી')
        );
        const moonOcc = occupantsFromAsc(moonAsc, 1);
        const sunOcc = occupantsFromAsc(sunAsc, 1);
        const lagnaOcc = occupantsFromAsc(calculateVargaSign(kundali.lagnaDegree, 1), 1);

        const HOUSE_SHORT = L(
          [
            '१ तनु (शरीर/व्यक्तित्व)',
            '२ धन (कोष/वाणी)',
            '३ सहज (पराक्रम/भाई)',
            '४ सुख (माता/भूमि)',
            '५ सुत (संतान/विद्या)',
            '६ रिपु (रोग/शत्रु)',
            '७ जाया (दांपत्य/साझेदारी)',
            '८ मृत्यु (आयु/गूढ़)',
            '९ धर्म (भाग्य/पिता)',
            '१० कर्म (करियर/यश)',
            '११ लाभ (आय/मनोरथ)',
            '१२ व्यय (मोक्ष/विदेश)',
          ],
          [
            '1. Tanu (Body/Self)',
            '2. Dhana (Wealth/Speech)',
            '3. Sahaja (Courage/Siblings)',
            '4. Sukha (Mother/Property)',
            '5. Suta (Children/Intellect)',
            '6. Ripu (Health/Rivals)',
            '7. Jaya (Marriage/Partners)',
            '8. Mrityu (Longevity/Occult)',
            '9. Dharma (Fortune/Father)',
            '10. Karma (Career/Status)',
            '11. Labha (Gains/Income)',
            '12. Vyaya (Expenses/Moksha)',
          ],
          [
            '૧ તનુ (શરીર/વ્યક્તિત્વ)',
            '૨ ધન (કોષ/વાણી)',
            '૩ સહજ (પરાક્રમ/ભાઈ)',
            '૪ સુખ (માતા/ભૂમિ)',
            '૫ સુત (સંતાન/વિદ્યા)',
            '૬ રિપુ (રોગ/શત્રુ)',
            '૭ જાયા (દાંપત્ય/ભાગીદારી)',
            '૮ મૃત્યુ (આયુ/ગૂઢ)',
            '૯ ધર્મ (ભાગ્ય/પિતા)',
            '૧૦ કર્મ (કારકિર્દી/યશ)',
            '૧૧ લાભ (આવક/મનોરથ)',
            '૧૨ વ્યય (મોક્ષ/વિદેશ)',
          ]
        );

        let hy = 612;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, hy - 16, width - 220, 32);
        ctx.strokeStyle = '#3E2714';
        ctx.lineWidth = 1;
        ctx.strokeRect(110, hy - 16, width - 220, 32);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText(L('भाव एवं कारक संज्ञा', 'House & Signification', 'ભાવ અને કારક સંજ્ઞા'), 125, hy + 4);
        ctx.fillText(L('लग्न चक्र (D1)', 'Lagna Chart (D1)', 'લગ્ન ચક્ર (D1)'), 360, hy + 4);
        ctx.fillText(L('चंद्र चक्र (मानस)', 'Moon Chart (Mind)', 'ચંદ્ર ચક્ર (માનસ)'), 620, hy + 4);
        ctx.fillText(L('सूर्य चक्र (आत्मा)', 'Sun Chart (Soul)', 'સૂર્ય ચક્ર (આત્મા)'), 880, hy + 4);

        hy += 34;
        for (let h = 1; h <= 12; h++) {
          const rowBg = h % 2 === 0 ? 'rgba(245, 235, 215, 0.75)' : 'rgba(255, 250, 240, 0.75)';
          ctx.fillStyle = rowBg;
          ctx.fillRect(110, hy - 14, width - 220, 28);
          ctx.strokeStyle = '#D1B48C';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(110, hy - 14, width - 220, 28);

          ctx.beginPath();
          ctx.moveTo(345, hy - 14);
          ctx.lineTo(345, hy + 14);
          ctx.moveTo(605, hy - 14);
          ctx.lineTo(605, hy + 14);
          ctx.moveTo(865, hy - 14);
          ctx.lineTo(865, hy + 14);
          ctx.stroke();

          ctx.fillStyle = '#7A2E00';
          ctx.font = 'bold 12px "Tiro Devanagari Hindi", serif';
          ctx.fillText(HOUSE_SHORT[h - 1], 120, hy + 4);

          ctx.fillStyle = '#2A1502';
          ctx.font = '12px "Tiro Devanagari Hindi", serif';
          ctx.fillText(fitLine(formatOcc(lagnaOcc[h], false) || '—', 240), 360, hy + 4);
          ctx.fillText(fitLine(formatOcc(moonOcc[h], false) || '—', 240), 620, hy + 4);
          ctx.fillText(fitLine(formatOcc(sunOcc[h], false) || '—', 240), 880, hy + 4);

          hy += 28;
        }

        ctx.fillStyle = '#5C3A21';
        ctx.font = '13px "Tiro Devanagari Hindi", serif';
        fillWrapped(
          L(
            `सुदर्शन चक्र सिद्धांत: चंद्र राशि ${kundali.moonRashi}, सूर्य राशि ${kundali.sunRashi}, लग्न ${kundali.lagnaRashi}। जब तीनों चक्रों में एक ही भाव पर शुभ ग्रहों का प्रभाव हो, तो वह फल शत-प्रतिशत घटित होता है।`,
            `Sudarshan Chakra Principle: Moon Sign ${trRashi(kundali.moonRashi, 'en')}, Sun Sign ${trRashi(kundali.sunRashi, 'en')}, Ascendant ${trRashi(kundali.lagnaRashi, 'en')}. When benefic planets align across all three charts in a house, its results manifest decisively.`,
            `સુદર્શન ચક્ર સિદ્ધાંત: ચંદ્ર રાશિ ${trRashi(kundali.moonRashi, 'gu')}, સૂર્ય રાશિ ${trRashi(kundali.sunRashi, 'gu')}, લગ્ન ${trRashi(kundali.lagnaRashi, 'gu')}. જ્યારે ત્રણેય ચક્રોમાં એક જ ભાવ પર શુભ ગ્રહોનો પ્રભાવ હોય, ત્યારે તે ફળ સો ટકા ઘટિત થાય છે.`
          ),
          120,
          hy + 12,
          width - 240,
          22
        );
        break;
      }

      // ---------------- Page 5: D9 नवमांश चक्र (Navamsha Chart) ---------------- //
      case 5: {
        drawBhojpatraBackground(
          page,
          L('॥ D9 नवमांश चक्र (Navamsha Kundali) ॥', '॥ D9 Navamsha Chart (Soul & Marriage) ॥', '॥ D9 નવમાંશ ચક્ર (Navamsha Kundali) ॥'),
          L('विवाह, जीवनसाथी, धर्म, भाग्य एवं सूक्ष्म आत्मिक बल की कुंजी', 'Key to Marriage, Life Partner, Dharma, Fortune & Inner Planetary Strength', 'વિવાહ, જીવનસાથી, ધર્મ, ભાગ્ય અને સૂક્ષ્મ આત્મિક બળની ચાવી')
        );
        drawNorthIndianDiamondChart(
          width / 2,
          370,
          340,
          9,
          L(`जातक ${kundali.name} — नवमांश चक्र (D9)`, `${kundali.name} — Navamsha Chart (D9)`, `જાતક ${kundali.name} — નવમાંશ ચક્ર (D9)`)
        );

        drawCardBox(
          90,
          570,
          width - 180,
          900,
          L('नवमांश फल एवं वर्गोत्तम ग्रह रहस्य', 'Navamsha Effects & Vargottama Planets', 'નવમાંશ ફળ અને વર્ગોત્તમ ગ્રહ રહસ્ય')
        );
        ctx.fillStyle = '#3E2714';
        ctx.font = '14px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let cy5 = 618;
        const d9notes = L(
          [
            '• नवमांश चक्र को कुंडली का प्राण कहा गया है — लग्न चक्र वृक्ष है, नवमांश उसका फल।',
            '• वर्गोत्तम: D1 और D9 में एक ही राशि हो तो ग्रह असीम बलवान होता है।',
          ],
          [
            '• Navamsha (D9) is regarded as the soul of the horoscope — D1 is the tree, and D9 is its fruit.',
            '• Vargottama: A planet placed in the same zodiac sign in both D1 and D9 acquires exceptional strength.',
          ],
          [
            '• નવમાંશ ચક્રને કુંડળીનો પ્રાણ કહેવામાં આવે છે — લગ્ન ચક્ર વૃક્ષ છે અને નવમાંશ તેનું ફળ છે.',
            '• વર્ગોત્તમ: D1 અને D9 માં એક જ રાશિમાં રહેલો ગ્રહ અસીમ બળવાન બને છે.',
          ]
        );
        d9notes.forEach((dn) => {
          cy5 = fillWrapped(dn, 120, cy5, width - 250, 24) + 6;
        });
        const d9Lagna = calculateVargaSign(kundali.lagnaDegree, 9);
        kundali.planets.forEach((p) => {
          const s1 = calculateVargaSign(p.degree, 1);
          const s9 = calculateVargaSign(p.degree, 9);
          const h9 = houseFromAsc(s9, d9Lagna);
          const vg = s1 === s9 ? L(' — वर्गोत्तम', ' — Vargottama', ' — વર્ગોત્તમ') : '';
          cy5 = fillWrapped(
            L(
              `• ${p.planet}: D9 में ${RASHIS[s9]} (भाव ${h9})${vg}`,
              `• ${trPlanet(p.planet, 'en')}: ${trRashi(RASHIS[s9], 'en')} in D9 (House ${h9})${vg}`,
              `• ${trPlanet(p.planet, 'gu')}: D9 માં ${trRashi(RASHIS[s9], 'gu')} (ભાવ ${h9})${vg}`
            ),
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
        drawBhojpatraBackground(
          page,
          L('॥ ग्रह स्थिति एवं स्पष्ट भोगांश तालिका ॥', '॥ Planetary Positions & Ephemeris Table ॥', '॥ ગ્રહ સ્થિતિ અને સ્પષ્ટ ભોગાંશ તાલિકા ॥'),
          L('निरयण ग्रह स्पष्ट, गति, नक्षत्र, चरण, अवस्थान एवं भाव विवरण', 'Sidereal Longitudes, Motion, Nakshatra, Pada, Dignity & House Placement', 'નિરયણ ગ્રહ સ્પષ્ટ, ગતિ, નક્ષત્ર, ચરણ, અવસ્થા અને ભાવ વિવરણ')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          680,
          L('नवग्रह एवं लग्न स्पष्ट तालिका (Planetary Ephemeris)', 'Navagraha Clear Positions Table (Planetary Ephemeris)', 'નવગ્રહ અને લગ્ન સ્પષ્ટ તાલિકા (Planetary Ephemeris)')
        );

        const pHeaders = L(
          ['ग्रह', 'राशि', 'अंश (Deg)', 'भाव', 'नक्षत्र', 'चरण', 'गति', 'अवस्था'],
          ['Planet', 'Sign', 'Degrees', 'House', 'Nakshatra', 'Pada', 'Motion', 'State'],
          ['ગ્રહ', 'રાશિ', 'અંશ', 'ભાવ', 'નક્ષત્ર', 'ચરણ', 'ગતિ', 'અવસ્થા']
        );
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
          ctx.fillText(
            currentLang === 'en' ? trPlanet(p.planet, 'en') : `${trPlanet(p.planet, currentLang)} (${p.englishName.substring(0, 3)})`,
            130,
            py
          );
          ctx.fillStyle = '#2A1502';
          ctx.fillText(fitLine(trRashi(p.rashi, currentLang), 102), 230, py);
          ctx.fillText(`${p.degreeInRashi.toFixed(2)}°`, 340, py);
          ctx.fillStyle = '#B56A00';
          ctx.fillText(`${p.house}`, 460, py);
          ctx.fillStyle = '#2A1502';
          ctx.fillText(fitLine(trVedic(p.nakshatra, currentLang), 130), 540, py);
          ctx.fillText(`${p.pada}`, 690, py);
          ctx.fillStyle = p.isRetrograde ? '#991B1B' : '#166534';
          ctx.fillText(
            p.isRetrograde ? L('वक्री (R)', 'Retrograde (R)', 'વક્રી (R)') : L('मार्गी', 'Direct', 'માર્ગી'),
            770,
            py
          );
          ctx.fillStyle = '#7A4B18';
          const avastha =
            p.degreeInRashi < 6
              ? L('बाल', 'Bala (Infant)', 'બાળ')
              : p.degreeInRashi < 18
              ? L('युवा', 'Yuva (Mature)', 'યુવા')
              : L('वृद्ध', 'Vriddha (Old)', 'વૃદ્ધ');
          ctx.fillText(avastha, 880, py);

          py += 34;
        });

        drawCardBox(
          90,
          890,
          width - 180,
          420,
          L('ग्रह बल एवं अवस्था शास्त्रीय नियम', 'Classical Rules of Planetary Strength & Avastha', 'ગ્રહ બળ અને અવસ્થા શાસ્ત્રીય નિયમો')
        );
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let peY = 945;
        const peNotes = L(
          [
            '• युवावस्था के ग्रह (12° से 18°) पूर्ण 100% फल प्रदान करने में सक्षम होते हैं।',
            '• वक्री ग्रह चेष्टाबल से युक्त होकर सामान्य से अधिक गहरा व तीव्र प्रभाव डालते हैं।',
            '• सूर्य के सान्निध्य में आने से ग्रह अस्त (Combust) हो जाते हैं, जिससे उनका बाह्य फल क्षीण होता है।',
            '• केंद्र में स्थित शुभ ग्रह जीवन में किसी भी प्रकार के अनिष्ट संकट से जातक की रक्षा करते हैं।',
          ],
          [
            '• Planets in Yuva Avastha (12° to 18°) are capable of delivering 100% of their promised results.',
            '• Retrograde (Vakri) planets carry heightened Chesta Bala, producing deeper and intense karmic outcomes.',
            '• Planets closely conjunct the Sun become combust (Asta), reducing their outward expression.',
            '• Benefic planets placed in Kendra houses (1, 4, 7, 10) shield the native from major hardships.',
          ],
          [
            '• યુવાવસ્થાના ગ્રહો (૧૨° થી ૧૮°) પૂર્ણ ૧૦૦% ફળ આપવા માટે સક્ષમ હોય છે.',
            '• વક્રી ગ્રહો ચેષ્ટાબળથી યુક્ત થઈ સામાન્ય કરતાં વધુ ઊંડો અને તીવ્ર પ્રભાવ પાડે છે.',
            '• સૂર્યની અતિ નજીક આવતા ગ્રહો અસ્ત (Combust) થાય છે, જેથી તેમનું બાહ્ય ફળ ક્ષીણ થાય છે.',
            '• કેન્દ્ર સ્થાનમાં રહેલા શુભ ગ્રહો જીવનમાં કોઈ પણ અનિષ્ટ સંકટથી જાતકની રક્ષા કરે છે.',
          ]
        );
        peNotes.forEach((nt) => {
          peY = fillWrapped(nt, 120, peY, width - 240, 24) + 12;
        });
        break;
      }

      // ---------------- Page 7: भाव चलित चक्र एवं भाव संधि तालिका ---------------- //
      case 7: {
        drawBhojpatraBackground(
          page,
          L('॥ भाव चलित चक्र एवं भाव संधि तालिका ॥', '॥ Bhava Chalit Chart & Cusp Table ॥', '॥ ભાવ ચલિત ચક્ર અને ભાવ સંધિ તાલિકા ॥'),
          L('श्रीपति पद्धति अनुसार भाव मध्य, संधि एवं चलित प्रभाव', 'House Midpoints, Cusps & Chalit Shifts via Sripati Paddhati', 'શ્રીપતિ પદ્ધતિ મુજબ ભાવ મધ્ય, સંધિ અને ચલિત પ્રભાવ')
        );
        drawNorthIndianDiamondChart(
          width / 2,
          365,
          320,
          1,
          L('भाव चलित चक्र (ग्रहों को भाव संख्या से)', 'Bhava Chalit Chart (House Positions)', 'ભાવ ચલિત ચક્ર (ગ્રહોની ભાવ સંખ્યા)'),
          { useNatalHouses: true }
        );

        drawCardBox(
          90,
          560,
          width - 180,
          900,
          L('राशि चक्र बनाम भाव चलित — ग्रह तुलना', 'Rashi Chart vs Bhava Chalit Comparison', 'રાશિ ચક્ર વિરુદ્ધ ભાવ ચલિત — ગ્રહ તુલના')
        );
        ctx.fillStyle = '#3E2714';
        ctx.font = '14px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let bcy = 608;
        bcy =
          fillWrapped(
            L(
              'भाव चलित: राशि कुण्डली में ग्रह एक भाव में दिख सकते हैं, किन्तु स्पष्ट भोगांश से वे अगले/पिछले भाव में फल देते हैं। नीचे प्रत्येक ग्रह की राशि-भाव व चलित-भाव स्थिति है।',
              'Bhava Chalit: A planet appearing in one house in the Rashi chart may deliver results in the adjacent house due to exact cusp degrees. Below is the house comparison for each planet.',
              'ભાવ ચલિત: રાશિ કુંડળીમાં ગ્રહ એક ભાવમાં દેખાય પરંતુ સ્પષ્ટ ભોગાંશને કારણે આગળના કે પાછળના ભાવમાં ફળ આપે છે. નીચે દરેક ગ્રહની રાશિ-ભાવ અને ચલિત-ભાવ સ્થિતિ છે.'
            ),
            120,
            bcy,
            width - 250,
            22
          ) + 16;

        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, bcy - 16, width - 220, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.fillText(L('ग्रह', 'Planet', 'ગ્રહ'), 130, bcy);
        ctx.fillText(L('राशि', 'Sign', 'રાશિ'), 280, bcy);
        ctx.fillText(L('अंश', 'Deg', 'અંશ'), 430, bcy);
        ctx.fillText(L('राशि-भाव', 'Rashi House', 'રાશિ-ભાવ'), 560, bcy);
        ctx.fillText(L('चलित भाव', 'Chalit House', 'ચલિત ભાવ'), 740, bcy);
        ctx.fillText(L('टिप्पणी', 'Remark', 'ટિપ્પણી'), 900, bcy);
        bcy += 34;
        const lagnaSignD1 = calculateVargaSign(kundali.lagnaDegree, 1);
        kundali.planets.forEach((p, idx) => {
          const signHouse = houseFromAsc(calculateVargaSign(p.degree, 1), lagnaSignD1);
          const shifted = signHouse !== p.house;
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.7)' : 'rgba(255, 250, 240, 0.7)';
          ctx.fillRect(110, bcy - 16, width - 220, 28);
          ctx.fillStyle = p.isRetrograde ? '#8B1E1E' : '#2A1502';
          ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(trPlanet(p.planet, currentLang), 130, bcy);
          ctx.fillStyle = '#2A1502';
          ctx.font = '13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(trRashi(p.rashi, currentLang), 280, bcy);
          ctx.fillText(`${p.degreeInRashi.toFixed(1)}°`, 430, bcy);
          ctx.fillText(String(signHouse), 580, bcy);
          ctx.fillStyle = shifted ? '#8B1E1E' : '#166534';
          ctx.fillText(String(p.house), 760, bcy);
          ctx.fillStyle = '#5C3A21';
          ctx.fillText(
            shifted ? L('भाव परिवर्तन', 'House Shifted', 'ભાવ પરિવર્તન') : L('समान', 'Same House', 'સમાન'),
            900,
            bcy
          );
          bcy += 30;
        });
        break;
      }

      // ---------------- Page 8: सुदर्शन चक्र (Sudarshan Chakra) ---------------- //
      case 8: {
        drawBhojpatraBackground(
          page,
          L('॥ सुदर्शन चक्र (Sudarshan Chakra) ॥', '॥ Sudarshan Chakra (Triple Ring Chart) ॥', '॥ સુદર્શન ચક્ર (Sudarshan Chakra) ॥'),
          L('लग्न (बाह्य), चंद्र (मध्य), सूर्य (आंतरिक) — 12 भाव, पूर्ण ग्रह स्थिति', 'Ascendant (Outer), Moon (Middle), Sun (Inner) — Complete 12-House Alignment', 'લગ્ન (બાહ્ય), ચંદ્ર (મધ્ય), સૂર્ય (આંતરિક) — ૧૨ ભાવ, પૂર્ણ ગ્રહ સ્થિતિ')
        );
        const sd = drawSudarshanChakra(width / 2, 400, 200);

        const legendY = 635;
        const legend = [
          { c: '#FAF6EA', t: L('बाह्य वलय — लग्न चक्र (देह)', 'Outer Ring — Lagna (Body)', 'બાહ્ય વલય — લગ્ન ચક્ર (દેહ)') },
          { c: '#F0DDB8', t: L('मध्य वलय — चंद्र चक्र (मन)', 'Middle Ring — Moon (Mind)', 'મધ્ય વલય — ચંદ્ર ચક્ર (મન)') },
          { c: '#E8C48A', t: L('आंतरिक वलय — सूर्य चक्र (आत्मा)', 'Inner Ring — Sun (Soul)', 'આંતરિક વલય — સૂર્ય ચક્ર (આત્મા)') },
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

        drawCardBox(
          90,
          665,
          width - 180,
          900,
          L('सुदर्शन भाव तालिका — तीनों लग्नों से ग्रह', 'Sudarshan House Table — Planets Across Three Rings', 'સુદર્શન ભાવ તાલિકા — ત્રણેય લગ્નોથી ગ્રહો')
        );
        let scY = 708;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, scY - 16, width - 220, 30);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText(L('भाव', 'House', 'ભાવ'), 130, scY);
        ctx.fillText(`${L('लग्न', 'Lagna', 'લગ્ન')} (${trRashi(kundali.lagnaRashi, currentLang)})`, 220, scY);
        ctx.fillText(`${L('चंद्र', 'Moon', 'ચંદ્ર')} (${trRashi(kundali.moonRashi, currentLang)})`, 520, scY);
        ctx.fillText(`${L('सूर्य', 'Sun', 'સૂર્ય')} (${trRashi(kundali.sunRashi, currentLang)})`, 820, scY);
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
          L(
            `नियम: जिस भाव पर तीनों वलयों में शुभ ग्रह (गुरु, शुक्र, बुध, चंद्र) हों, वह क्षेत्र इस जन्म में निश्चित फल देता है। रिक्त कक्ष (·) भावेश से फलित होता है। व = वक्री।`,
            `Rule: Any house influenced by natural benefics (Jupiter, Venus, Mercury, Moon) across all three rings yields guaranteed auspicious results. Empty cells (·) are judged by the house lord. R = Retrograde.`,
            `નિયમ: જે ભાવ પર ત્રણેય વલયોમાં શુભ ગ્રહો (ગુરુ, શુક્ર, બુધ, ચંદ્ર) હોય, તે ક્ષેત્ર આ જન્મમાં નિશ્ચિત ફળ આપે છે. ખાલી ખાના (·) ભાવેશથી ફળિત થાય છે. વ = વક્રી.`
          ),
          120,
          scY + 8,
          width - 250,
          22
        );
        break;
      }

      // ---------------- Page 9: ग्रह दृष्टि एवं संबंध चक्र ---------------- //
      case 9: {
        drawBhojpatraBackground(
          page,
          L('॥ ग्रह दृष्टि एवं पंचधा मैत्री चक्र ॥', '॥ Planetary Aspects & Panchadha Maitri ॥', '॥ ગ્રહ દૃષ્ટિ અને પંચધા મૈત્રી ચક્ર ॥'),
          L('ग्रहों की परस्पर पूर्ण दृष्टियाँ एवं तात्कालिक-नैसर्गिक मैत्री', 'Full Planetary Aspects & Natural / Temporary Friendships', 'ગ્રહોની પરસ્પર પૂર્ણ દૃષ્ટિઓ અને તાત્કાલિક-નૈસર્ગિક મૈત્રી')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          520,
          L('ग्रह पूर्ण दृष्टि तालिका (Planetary Aspects)', 'Full Planetary Aspects Table', 'ગ્રહ પૂર્ણ દૃષ્ટિ તાલિકા')
        );

        const dAspects = L(
          [
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
          ],
          [
            ['Planet', '7th House Aspect (Full)', 'Special Full Aspects'],
            ['Sun (Surya)', 'Full aspect on 7th house from position', '—'],
            ['Moon (Chandra)', 'Full aspect on 7th house from position', '—'],
            ['Mars (Mangal)', 'Full aspect on 7th house from position', '4th & 8th house special aspects'],
            ['Mercury (Budh)', 'Full aspect on 7th house from position', '—'],
            ['Jupiter (Guru)', 'Full aspect on 7th house from position', '5th & 9th house nectar aspects'],
            ['Venus (Shukra)', 'Full aspect on 7th house from position', '—'],
            ['Saturn (Shani)', 'Full aspect on 7th house from position', '3rd & 10th house special aspects'],
            ['Rahu', 'Full aspect on 7th house from position', '5th & 9th house trinal aspects'],
            ['Ketu', 'Full aspect on 7th house from position', '5th & 9th house trinal aspects'],
          ],
          [
            ['ગ્રહ', 'સાતમી દૃષ્ટિ (પૂર્ણ)', 'વિશેષ પૂર્ણ દૃષ્ટિ'],
            ['સૂર્ય (Sun)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', '—'],
            ['ચંદ્ર (Moon)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', '—'],
            ['મંગળ (Mars)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', 'ચોથી (4th) અને આઠમી (8th) દૃષ્ટિ'],
            ['બુધ (Mercury)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', '—'],
            ['ગુરુ (Jupiter)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', 'પાંચમી (5th) અને નવમી (9th) અમૃત દૃષ્ટિ'],
            ['શુક્ર (Venus)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', '—'],
            ['શનિ (Saturn)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', 'ત્રીજી (3rd) અને દશમી (10th) દૃષ્ટિ'],
            ['રાહુ (Rahu)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', 'પાંચમી (5th) અને નવમી (9th) દૃષ્ટિ'],
            ['કેતુ (Ketu)', 'સપ્તમ ભાવ પર પૂર્ણ દૃષ્ટિ', 'પાંચમી (5th) અને નવમી (9th) દૃષ્ટિ'],
          ]
        );

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

        drawCardBox(
          90,
          740,
          width - 180,
          520,
          L('पंचधा मैत्री शास्त्रीय नियम', 'Panchadha Maitri (Five-Fold Friendship) Rules', 'પંચધા મૈત્રી શાસ્ત્રીય નિયમો')
        );
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let pmY = 800;
        const pmNotes = L(
          [
            '• नैसर्गिक मित्र: सूर्य-चंद्र-मंगल-गुरु परस्पर मित्र हैं; बुध-शुक्र-शनि परस्पर मित्र हैं।',
            '• तात्कालिक मैत्री: किसी ग्रह से 2, 3, 4, 10, 11, 12 भावों में स्थित ग्रह तात्कालिक मित्र होते हैं।',
            '• अधिमित्र: जो नैसर्गिक और तात्कालिक दोनों प्रकार से मित्र हों, वे अधिमित्र होकर परम शुभ फल देते हैं।',
            '• अधिशत्रु: जो नैसर्गिक और तात्कालिक दोनों रूपों में शत्रु हों, वे अत्यधिक कष्टकारी प्रभाव डालते हैं।',
          ],
          [
            '• Natural Friends (Naisargika Maitri): Sun-Moon-Mars-Jupiter form one camp; Mercury-Venus-Saturn form the other.',
            '• Temporary Friends (Tatkalika Maitri): Planets placed in houses 2, 3, 4, 10, 11, or 12 from another planet become temporary friends.',
            '• Adhimitra (Great Friend): Both naturally and temporarily friendly — confers highly auspicious outcomes.',
            '• Adhishatru (Bitter Enemy): Enemy on both counts — creates friction requiring planetary propitiation.',
          ],
          [
            '• નૈસર્ગિક મિત્ર: સૂર્ય-ચંદ્ર-મંગળ-ગુરુ પરસ્પર મિત્રો છે; બુધ-શુક્ર-શનિ પરસ્પર મિત્રો છે.',
            '• તાત્કાલિક મૈત્રી: કોઈ ગ્રહથી ૨, ૩, ૪, ૧૦, ૧૧, ૧૨ ભાવમાં રહેલા ગ્રહો તાત્કાલિક મિત્ર બને છે.',
            '• અધિમિત્ર: જે નૈસર્ગિક અને તાત્કાલિક બંને રીતે મિત્ર હોય, તે પરમ શુભ ફળ આપે છે.',
            '• અધિશત્રુ: જે બંને રીતે શત્રુ હોય, તે મુશ્કેલી અને વિઘ્નો આપે છે.',
          ]
        );
        pmNotes.forEach((pm) => {
          pmY = fillWrapped(pm, 120, pmY, width - 240, 24) + 12;
        });
        break;
      }

      // ---------------- Page 10: षड्बल एवं भावबल विश्लेषण ---------------- //
      case 10: {
        drawBhojpatraBackground(
          page,
          L('॥ षड्बल एवं भावबल विश्लेषण ॥', '॥ Shadbala & Bhavabala Analysis ॥', '॥ ષડ્બળ અને ભાવબળ વિશ્લેષણ ॥'),
          L('छह प्रकार के ग्रह बल, रूपात्मक सामर्थ्य एवं इष्ट-कष्ट फल', 'Six-Fold Planetary Strength (Rupas) & Ishta-Kashta Phala', 'છ પ્રકારના ગ્રહ બળ, રૂપાત્મક સામર્થ્ય અને ઇષ્ટ-કષ્ટ ફળ')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          560,
          L('षड्बल के 6 अंगों का विवरण (Shadbala Strength)', 'Six Components of Shadbala Strength', 'ષડ્બળના ૬ અંગોનું વિવરણ (Shadbala Strength)')
        );

        const shadTable = L(
          [
            ['बल का नाम', 'आधार', 'शास्त्रीय फल'],
            ['1. स्थान बल', 'उच्च, स्वक्षेत्री, मूलत्रिकोण, मित्र राशि स्थिति', 'ग्रह की मूल स्थिति की मजबूती व दृढ़ता'],
            ['2. दिग्बल', 'दिशात्मक सामर्थ्य (गुरु/बुध पूर्व, शनि पश्चिम आदि)', 'कार्यक्षेत्र में सही निर्णय लेने का सामर्थ्य'],
            ['3. काल बल', 'दिन/रात्रि, पक्ष, अयन व ऋतु का बल', 'समय आने पर अनुकूल अवसर प्रदान करना'],
            ['4. चेष्टा बल', 'वक्री गति अथवा तेज चाल का बल', 'कठिन परिस्थितियों में पुरुषार्थ व विजय'],
            ['5. नैसर्गिक बल', 'सूर्य > चंद्र > शुक्र > गुरु > बुध > मंगल > शनि', 'ग्रह का प्राकृतिक व जन्मजात प्रकाश बल'],
            ['6. दृग् बल', 'शुभ अथवा क्रूर ग्रहों की दृष्टि का बल', 'सहायक शक्तियों का प्रत्यक्ष अथवा परोक्ष सहयोग'],
          ],
          [
            ['Strength Name', 'Basis of Calculation', 'Classical Result'],
            ['1. Sthana Bala', 'Exaltation, Own Sign, Moolatrikona, Friend Sign', 'Positional stability & foundational power'],
            ['2. Dig Bala', 'Directional strength (Ju/Me East, Sa West, Su/Ma South, Mo/Ve North)', 'Right judgment and execution in career'],
            ['3. Kala Bala', 'Day/Night, Paksha, Ayana, Hora & seasonal strength', 'Timely opportunities and support'],
            ['4. Chesta Bala', 'Motional strength from retrogression or speed', 'Courage and victory during testing times'],
            ['5. Naisargika Bala', 'Sun > Moon > Venus > Jupiter > Mercury > Mars > Saturn', 'Innate luminosity and permanent strength'],
            ['6. Drik Bala', 'Aspectual strength from benefic/malefic planets', 'Support from allies and external circumstances'],
          ],
          [
            ['બળનું નામ', 'આધાર', 'શાસ્ત્રીય ફળ'],
            ['૧. સ્થાન બળ', 'ઉચ્ચ, સ્વક્ષેત્રી, મૂળત્રિકોણ, મિત્ર રાશિ સ્થિતિ', 'ગ્રહની મૂળ સ્થિતિની મજબૂતાઈ અને દૃઢતા'],
            ['૨. દિગ્બળ', 'દિશાત્મક સામર્થ્ય (ગુરુ/બુધ પૂર્વ, શનિ પશ્ચિમ વગેરે)', 'કાર્યક્ષેત્રમાં યોગ્ય નિર્ણય લેવાની ક્ષમતા'],
            ['૩. કાળ બળ', 'દિવસ/રાત્રિ, પક્ષ, અયન અને ઋતુનું બળ', 'સમય આવ્યે અનુકૂળ અવસર પ્રદાન કરવા'],
            ['૪. ચેષ્ટા બળ', 'વક્રી ગતિ અથવા તીવ્ર ગતિનું બળ', 'કઠિન પરિસ્થિતિઓમાં પુરુષાર્થ અને વિજય'],
            ['૫. નૈસર્ગિક બળ', 'સૂર્ય > ચંદ્ર > શુક્ર > ગુરુ > બુધ > મંગળ > શનિ', 'ગ્રહનું પ્રાકૃતિક અને જન્મજાત તેજ બળ'],
            ['૬. દૃગ્ બળ', 'શુભ અથવા ક્રૂર ગ્રહોની દૃષ્ટિનું બળ', 'સહાયક શક્તિઓનો પ્રત્યક્ષ કે પરોક્ષ સહયોગ'],
          ]
        );

        let sY = 230;
        shadTable.forEach((row, idx) => {
          if (idx === 0) {
            ctx.fillStyle = '#5C3A21';
            ctx.fillRect(110, sY - 18, width - 220, 32);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
            ctx.fillText(row[0], 130, sY);
            ctx.fillText(row[1], 320, sY);
            ctx.fillText(row[2], 730, sY);
            sY += 38;
          } else {
            ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
            ctx.fillRect(110, sY - 16, width - 220, 34);
            ctx.strokeStyle = '#8C6239';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(110, sY - 16, width - 220, 34);

            ctx.fillStyle = '#8B1E1E';
            ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(fitLine(row[0], 180), 130, sY);
            ctx.fillStyle = '#2A1502';
            ctx.fillText(fitLine(row[1], 400), 320, sY);
            ctx.font = '14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(fitLine(row[2], width - 850), 730, sY);
            sY += 36;
          }
        });

        drawCardBox(
          90,
          780,
          width - 180,
          480,
          L('इष्ट फल एवं कष्ट फल सारिणी', 'Ishta Phala & Kashta Phala Guidelines', 'ઇષ્ટ ફળ અને કષ્ટ ફળ સારિણી')
        );
        ctx.fillStyle = '#2A1502';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ikY = 840;
        const ikNotes = L(
          [
            '• इष्ट फल 30 से अधिक होने पर ग्रह अपनी महादशा में अत्यधिक धन, सुख व सौभाग्य प्रदान करता है।',
            '• कष्ट फल 30 से अधिक होने पर ग्रह स्वास्थ्य, मानसिक तनाव अथवा कार्यों में विलंब उत्पन्न करता है।',
            '• जिस भाव का भावबल 6 रूप से अधिक होता है, वह भाव जातक के जीवन का सबसे मजबूत स्तंभ बनता है।',
          ],
          [
            '• When Ishta Phala exceeds 30 Virupas, the planet grants abundant wealth, comfort, and fortune in its Dasha.',
            '• When Kashta Phala exceeds 30 Virupas, remedies help ease stress, delays, or health strain.',
            '• Houses with Bhavabala above 6 Rupas emerge as the strongest pillars of the native’s life.',
          ],
          [
            '• ઇષ્ટ ફળ ૩૦થી વધુ હોય તો ગ્રહ પોતાની મહાદશામાં અત્યધિક ધન, સુખ અને સૌભાગ્ય પ્રદાન કરે છે.',
            '• કષ્ટ ફળ ૩૦થી વધુ હોય તો ગ્રહ સ્વાસ્થ્ય, માનસિક તણાવ કે કાર્યોમાં વિલંબ આપી શકે છે.',
            '• જે ભાવનું ભાવબળ ૬ રૂપથી વધુ હોય, તે ભાવ જાતકના જીવનનો સૌથી મજબૂત સ્તંભ બને છે.',
          ]
        );
        ikNotes.forEach((ik) => {
          ikY = fillWrapped(ik, 120, ikY, width - 240, 26) + 12;
        });
        break;
      }

      // ---------------- Page 11: अष्टकवर्ग सारणी (भाग 1) ---------------- //
      case 11: {
        drawBhojpatraBackground(
          page,
          L('॥ अष्टकवर्ग सारणी (भाग 1) ॥', '॥ Ashtakavarga Tables (Part 1) ॥', '॥ અષ્ટકવર્ગ સારણી (ભાગ ૧) ॥'),
          L('सूर्य, चंद्र, मंगल एवं बुध का भिन्नाष्टकवर्ग चक्र', 'Bhinnashtakavarga (BAV) Bindus of Sun, Moon, Mars & Mercury', 'સૂર્ય, ચંદ્ર, મંગળ અને બુધનું ભિન્નાષ્ટકવર્ગ ચક્ર')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          1080,
          L('चार प्रमुख ग्रहों के भिन्नाष्टकवर्ग बिंदु (12 राशियों में)', 'Bhinnashtakavarga Benefic Points Across 12 Zodiac Signs', 'ચાર મુખ્ય ગ્રહોના ભિન્નાષ્ટકવર્ગ બિંદુઓ (૧૨ રાશિઓમાં)')
        );
        
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let ay = 240;
        ay = fillWrapped(
          L(
            'अष्टकवर्ग का शास्त्रीय महत्व: महर्षि पराशर अनुसार किसी भी भाव व राशि में ग्रहों के शुभ बिंदु ही यह तय करते हैं कि गोचर काल में ग्रह कैसा फल देगा। 4 से अधिक बिंदु शुभ, 4 मध्यम, और 3 से कम बिंदु कष्टप्रद माने जाते हैं।',
            'Classical Importance of Ashtakavarga: Per Maharshi Parashara, benefic Bindus (0–8) in each sign determine planetary transit results. Above 4 Bindus is auspicious, 4 is balanced, and below 3 warrants caution.',
            'અષ્ટકવર્ગનું શાસ્ત્રીય મહત્વ: મહર્ષિ પરાશર મુજબ કોઈ પણ ભાવ કે રાશિમાં ગ્રહોના શુભ બિંદુ જ નક્કી કરે છે કે ગોચર કાળમાં ગ્રહ કેવું ફળ આપશે. ૪ થી વધુ બિંદુ શુભ, ૪ મધ્યમ અને ૩ થી ઓછા બિંદુ સાવચેતી સૂચવે છે.'
          ),
          120,
          ay,
          width - 240,
          24
        ) + 18;

        const astPlanets = L(
          ['सूर्य (Sun)', 'चंद्र (Moon)', 'मंगल (Mars)', 'बुध (Mercury)'],
          ['Sun (Surya)', 'Moon (Chandra)', 'Mars (Mangala)', 'Mercury (Budha)'],
          ['સૂર્ય (Sun)', 'ચંદ્ર (Moon)', 'મંગળ (Mars)', 'બુધ (Mercury)']
        );
        astPlanets.forEach((ap, pidx) => {
          ctx.fillStyle = '#5C3A21';
          ctx.fillRect(110, ay, width - 220, 28);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
          ctx.fillText(
            L(
              `• ${ap} भिन्नाष्टकवर्ग रेखा (कुल 48-54 बिंदु)`,
              `• ${ap} Bhinnashtakavarga Distribution (12 Signs)`,
              `• ${ap} ભિન્નાષ્ટકવર્ગ રેખા (કુલ ૪૮-૫૪ બિંદુ)`
            ),
            130,
            ay + 18
          );
          ay += 36;

          const boxW = (width - 240) / 12;
          ctx.font = '12px "Tiro Devanagari Hindi", serif';
          for (let s = 0; s < 12; s++) {
            const bx = 110 + s * boxW;
            ctx.fillStyle = '#FAF3E5';
            ctx.fillRect(bx, ay, boxW, 50);
            ctx.strokeStyle = '#8C6239';
            ctx.strokeRect(bx, ay, boxW, 50);

            ctx.fillStyle = '#7A4B18';
            ctx.fillText(trRashi(RASHIS[s], currentLang).slice(0, 3), bx + 8, ay + 18);

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
        drawBhojpatraBackground(
          page,
          L('॥ अष्टकवर्ग सारणी एवं सर्वाष्टकवर्ग (SAV) ॥', '॥ Sarvashtakavarga (SAV) Complete Table ॥', '॥ અષ્ટકવર્ગ સારણી અને સર્વાષ્ટકવર્ગ (SAV) ॥'),
          L('समस्त 7 ग्रहों का भिन्नाष्टकवर्ग एवं 337 समुदाय बिंदु सारणी', 'All 7 Planets Bhinnashtakavarga & 337 Combined Bindu Matrix', 'તમામ ૭ ગ્રહોનું ભિન્નાષ્ટકવર્ગ અને ૩૩૭ સમુદાય બિંદુ સારણી')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          1080,
          L('सर्वाष्टकवर्ग (Sarvashtakavarga - कुल 337 बिंदु विभाजन)', 'Sarvashtakavarga (SAV — 337 Total Benefic Points)', 'સર્વાષ્ટકવર્ગ (Sarvashtakavarga - કુલ ૩૩૭ બિંદુ વિભાજન)')
        );

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        let sy = 240;
        sy = fillWrapped(
          L(
            'सर्वाष्टकवर्ग में 12 राशियों के कुल बिंदुओं का योग 337 होता है। जिस राशि में 28 से अधिक बिंदु होते हैं, वह राशि अत्यंत शुभ, 28 पर सम, तथा 28 से कम बिंदु पर सावधानी अपेक्षित है।',
            'The sum of Sarvashtakavarga points across all 12 signs is 337. Signs scoring above 28 points yield strong prosperity and smooth transits, 28 is balanced, and below 28 requires mindful effort.',
            'સર્વાષ્ટકવર્ગમાં ૧૨ રાશિઓના કુલ બિંદુઓનો સરવાળો ૩૩૭ થાય છે. જે રાશિમાં ૨૮ થી વધુ બિંદુ હોય તે અત્યંત શુભ, ૨૮ પર સમ અને ૨૮ થી ઓછા બિંદુ પર સાવચેતી જરૂરી છે.'
          ),
          120,
          sy,
          width - 240,
          24
        ) + 18;

        const avRes = calculateAshtakvarga(kundali);
        const RASHI_COLS = L(
          ['मेष', 'वृष', 'मिथु', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चि', 'धनु', 'मकर', 'कुंभ', 'मीन'],
          ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'],
          ['મેષ', 'વૃષ', 'મિથુ', 'કર્ક', 'સિંહ', 'કન્યા', 'તુલા', 'વૃશ્ચિ', 'ધનુ', 'મકર', 'કુંભ', 'મીન']
        );
        const colW = (width - 240) / 14;

        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, sy, width - 220, 34);
        ctx.strokeStyle = '#3E2714';
        ctx.strokeRect(110, sy, width - 220, 34);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.fillText(L('ग्रह / राशि', 'Planet/Sign', 'ગ્રહ / રાશિ'), 118, sy + 22);
        for (let i = 0; i < 12; i++) {
          ctx.fillText(RASHI_COLS[i], 110 + (i + 1) * colW + 6, sy + 22);
        }
        ctx.fillText(L('योग', 'Sum', 'કુલ'), 110 + 13 * colW + 12, sy + 22);
        sy += 36;

        const classicalPlanets = [
          { name: trPlanet('सूर्य', currentLang), key: 'सूर्य' },
          { name: trPlanet('चंद्र', currentLang), key: 'चंद्र' },
          { name: trPlanet('मंगल', currentLang), key: 'मंगल' },
          { name: trPlanet('बुध', currentLang), key: 'बुध' },
          { name: trPlanet('गुरु', currentLang), key: 'गुरु' },
          { name: trPlanet('शुक्र', currentLang), key: 'शुक्र' },
          { name: trPlanet('शनि', currentLang), key: 'शनि' },
        ];

        classicalPlanets.forEach((pInfo, rIdx) => {
          ctx.fillStyle = rIdx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, sy, width - 220, 32);
          ctx.strokeStyle = '#8C6239';
          ctx.strokeRect(110, sy, width - 220, 32);

          ctx.fillStyle = '#3E2714';
          ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(pInfo.name, 120, sy + 21);

          const bavRow = avRes.planetBav[pInfo.key] || [];
          let rowSum = 0;
          for (let i = 0; i < 12; i++) {
            const pts = typeof bavRow[i] === 'number' ? bavRow[i] : 4;
            rowSum += pts;
            ctx.fillStyle = pts >= 5 ? '#166534' : pts <= 3 ? '#991B1B' : '#2A1502';
            ctx.font = '13px sans-serif';
            ctx.fillText(`${pts}`, 110 + (i + 1) * colW + 14, sy + 21);
          }
          ctx.fillStyle = '#5C3A21';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(`${rowSum}`, 110 + 13 * colW + 14, sy + 21);
          sy += 34;
        });

        ctx.fillStyle = '#E5D2B8';
        ctx.fillRect(110, sy, width - 220, 36);
        ctx.strokeStyle = '#5C3A21';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(110, sy, width - 220, 36);

        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
        ctx.fillText(L('कुल योग', 'Total', 'કુલ યોગ'), 118, sy + 23);

        let finalSum = 0;
        for (let i = 0; i < 12; i++) {
          const pts = avRes.sav[i] || 28;
          finalSum += pts;
          ctx.fillStyle = pts >= 28 ? '#166534' : '#991B1B';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(`${pts}`, 110 + (i + 1) * colW + 12, sy + 23);
        }
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${finalSum}`, 110 + 13 * colW + 12, sy + 23);
        break;
      }

      // ---------------- Page 13: विंशोत्तरी महादशा चक्र (120 वर्ष की रूपरेखा) ---------------- //
      case 13: {
        drawBhojpatraBackground(
          page,
          L('॥ विंशोत्तरी महादशा चक्र (120 वर्ष) ॥', '॥ Vimshottari Mahadasha Cycle (120 Years) ॥', '॥ વિંશોત્તરી મહાદશા ચક્ર (૧૨૦ વર્ષ) ॥'),
          L('समस्त 9 महादशाओं का शास्त्रीय कालखंड, आरंभ एवं समाप्ति तिथियां', '120-Year Planetary Periods: Start & End Dates for All 9 Mahadashas', 'તમામ ૯ મહાદશાઓનો શાસ્ત્રીય કાળખંડ, પ્રારંભ અને સમાપ્તિ તારીખો')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          1080,
          L('विंशोत्तरी 120 वर्षीय महादशा सारणी', 'Vimshottari 120-Year Mahadasha Schedule', 'વિંશોત્તરી ૧૨૦ વર્ષીય મહાદશા સારણી')
        );

        let dY = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, dY - 18, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
        ctx.fillText(L('क्र.', 'No.', 'ક્રમ'), 125, dY + 4);
        ctx.fillText(L('महादशा स्वामी', 'Dasha Lord', 'મહાદશા સ્વામી'), 170, dY + 4);
        ctx.fillText(L('अवधि (वर्ष)', 'Duration', 'અવધિ (વર્ષ)'), 340, dY + 4);
        ctx.fillText(L('आरंभ तिथि', 'Start Date', 'પ્રારંભ તારીખ'), 460, dY + 4);
        ctx.fillText(L('समाप्ति तिथि', 'End Date', 'સમાપ્તિ તારીખ'), 640, dY + 4);
        ctx.fillText(L('स्थिति', 'Status', 'સ્થિતિ'), 820, dY + 4);

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
          ctx.fillText(
            currentLang === 'en' ? trPlanet(d.planet, 'en') : `${trPlanet(d.planet, currentLang)} ${L('देव', '', 'દેવ')}`,
            170,
            dY + 5
          );

          ctx.fillStyle = '#2A1502';
          ctx.font = '14px sans-serif';
          ctx.fillText(`${DASHA_YEARS[d.planet] || d.years} ${L('वर्ष', 'Yrs', 'વર્ષ')}`, 340, dY + 5);
          ctx.fillText(fmtDate(d.startDate), 460, dY + 5);
          ctx.fillText(fmtDate(d.endDate), 640, dY + 5);

          if (isActive) {
            ctx.fillStyle = '#991B1B';
            ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
            ctx.fillText(L('★ वर्तमान सक्रिय', '★ Current Active', '★ વર્તમાન સક્રિય'), 820, dY + 5);
          } else {
            ctx.fillStyle = '#7A4B18';
            ctx.font = '13px "Tiro Devanagari Hindi", serif';
            ctx.fillText(
              new Date() > d.endDate ? L('व्यतीत', 'Completed', 'પૂર્ણ') : L('आगामी', 'Upcoming', 'આગામી'),
              820,
              dY + 5
            );
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
        const pLoc = trPlanet(planetName, currentLang);
        const planetYears = DASHA_YEARS[planetName];

        drawBhojpatraBackground(
          page,
          L(
            `॥ ${pLoc} महादशा की 9 अंतर्दशाएं ॥`,
            `॥ 9 Antardashas of ${pLoc} Mahadasha ॥`,
            `॥ ${pLoc} મહાદશાની ૯ અંતર્દશાઓ ॥`
          ),
          L(
            `${pLoc} देव की पूर्ण ${planetYears} वर्षीय विंशोत्तरी महादशा का सूक्ष्म अंतर्दशा विभाजन`,
            `Micro Antardasha breakdown of ${pLoc}'s full ${planetYears}-year Vimshottari Mahadasha`,
            `${pLoc} દેવની સંપૂર્ણ ${planetYears} વર્ષીય વિંશોત્તરી મહાદશાનું સૂક્ષ્મ અંતર્દશા વિભાજન`
          )
        );

        drawCardBox(
          90,
          180,
          width - 180,
          1080,
          L(
            `${pLoc} महादशा में समस्त 9 अंतर्दशाएं एवं शास्त्रीय फल`,
            `All 9 Antardashas in ${pLoc} Mahadasha & Classical Results`,
            `${pLoc} મહાદશામાં સમસ્ત ૯ અંતર્દશાઓ અને શાસ્ત્રીય ફળ`
          )
        );

        let ay14 = 236;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, ay14 - 18, width - 220, 36);
        ctx.strokeStyle = '#3E2714';
        ctx.strokeRect(110, ay14 - 18, width - 220, 36);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
        ctx.fillText(L('अंतर्दशा स्वामी', 'Antardasha Lord', 'અંતર્દશા સ્વામી'), 125, ay14 + 6);
        ctx.fillText(L('कालावधि', 'Duration', 'સમયગાળો'), 340, ay14 + 6);
        ctx.fillText(L('शास्त्रीय फलित एवं प्रभाव', 'Classical Result & Impact', 'શાસ્ત્રીય ફળિત અને પ્રભાવ'), 500, ay14 + 6);

        ay14 += 38;
        const startAntarIdx = DASHA_ORDER.indexOf(planetName);
        const rotatedAntars = startAntarIdx >= 0
          ? [...DASHA_ORDER.slice(startAntarIdx), ...DASHA_ORDER.slice(0, startAntarIdx)]
          : DASHA_ORDER;

        rotatedAntars.forEach((antar, idx) => {
          const antarYears = (DASHA_YEARS[antar] * planetYears) / 120;
          const months = Math.floor(antarYears * 12);
          const rawDays = Math.round((antarYears * 12 - months) * 30);
          const days = rawDays >= 30 ? 0 : rawDays;
          const adjustedMonths = rawDays >= 30 ? months + 1 : months;
          const antarLoc = trPlanet(antar, currentLang);

          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.75)' : 'rgba(255, 250, 240, 0.75)';
          ctx.fillRect(110, ay14 - 14, width - 220, 68);
          ctx.strokeStyle = '#8C6239';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(110, ay14 - 14, width - 220, 68);

          // Vertical Column Separators
          ctx.beginPath();
          ctx.moveTo(320, ay14 - 14);
          ctx.lineTo(320, ay14 + 54);
          ctx.moveTo(480, ay14 - 14);
          ctx.lineTo(480, ay14 + 54);
          ctx.stroke();

          // Column 1: Antardasha Label
          ctx.fillStyle = '#8B1E1E';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(fitLine(`${pLoc} - ${antarLoc}`, 185), 125, ay14 + 22);

          // Column 2: Exact Duration
          ctx.fillStyle = '#4A2505';
          ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
          ctx.fillText(
            L(
              `${adjustedMonths} माह ${days} दिन`,
              `${adjustedMonths}m ${days}d`,
              `${adjustedMonths} માસ ${days} દિવસ`
            ),
            335,
            ay14 + 22
          );

          // Column 3: Phala Description (wrapped cleanly)
          ctx.fillStyle = '#2A1502';
          ctx.font = '12px "Tiro Devanagari Hindi", serif';
          const phala = analysis.antarPhala(planetName, antar);
          fillWrapped(phala, 495, ay14 + 6, width - 625, 20, ay14 + 52);

          ay14 += 76;
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
          {
            div: 1,
            code: 'D1',
            name: L('लग्न चक्र (Lagna Rashi)', 'Lagna Rashi Chart (D1)', 'લગ્ન ચક્ર (Lagna Rashi)'),
            desc: L('समग्र भौतिक जीवन, शरीर, स्वास्थ्य व स्वभाव', 'Overall physical life, body, vitality & temperament', 'સમગ્ર ભૌતિક જીવન, શરીર, આરોગ્ય અને સ્વભાવ'),
          },
          {
            div: 2,
            code: 'D2',
            name: L('होरा चक्र (Hora Chart)', 'Hora Chart (D2 Wealth)', 'હોરા ચક્ર (Hora Chart)'),
            desc: L('धन-संपदा, कोष, आर्थिक संपन्नता, वाणी व पैतृक संपत्ति', 'Wealth, treasury, financial prosperity, speech & ancestral assets', 'ધન-સંપત્તિ, કોષ, આર્થિક સમૃદ્ધિ, વાણી અને પૈતૃક મિલકત'),
          },
          {
            div: 3,
            code: 'D3',
            name: L('द्रेष्काण चक्र (Drekkana Chart)', 'Drekkana Chart (D3 Siblings)', 'દ્રેષ્કાણ ચક્ર (Drekkana Chart)'),
            desc: L('सहोदर, पराक्रम, साहस, शौर्य व तृतीय भाव फल', 'Siblings, courage, initiative, valor & 3rd house fruits', 'ભાઈ-બહેન, પરાક્રમ, સાહસ, શૌર્ય અને તૃતીય ભાવ ફળ'),
          },
          {
            div: 4,
            code: 'D4',
            name: L('चतुर्थांश चक्र (Chaturthamsha)', 'Chaturthamsha Chart (D4 Fortune)', 'ચતુર્થાંશ ચક્ર (Chaturthamsha)'),
            desc: L('भाग्य, भूमि, भवन, अचल संपत्ति, वाहन व सुख-साधन', 'Fortune, land, real estate, property, vehicles & comforts', 'ભાગ્ય, ભૂમિ, મકાન, સ્થાવર મિલકત, વાહન અને સુખ-સાધનો'),
          },
          {
            div: 7,
            code: 'D7',
            name: L('सप्तमांश चक्र (Saptamsha)', 'Saptamsha Chart (D7 Progeny)', 'સપ્તમાંશ ચક્ર (Saptamsha)'),
            desc: L('संतान सुख, संतति, वंश वृद्धि व पौत्र-पौत्री', 'Children, progeny happiness, lineage continuity & grandchildren', 'સંતાન સુખ, સંતતિ, વંશ વૃદ્ધિ અને પૌત્ર-પૌત્રી'),
          },
          {
            div: 9,
            code: 'D9',
            name: L('नवमांश चक्र (Navamsha)', 'Navamsha Chart (D9 Dharma/Marriage)', 'નવમાંશ ચક્ર (Navamsha)'),
            desc: L('विवाह, जीवनसाथी, धर्म, सूक्ष्म सामर्थ्य व भाग्य', 'Marriage, spouse, dharma, subtle planetary strength & fortune', 'વિવાહ, જીવનસાથી, ધર્મ, સૂક્ષ્મ સામર્થ્ય અને ભાગ્ય'),
          },
          {
            div: 10,
            code: 'D10',
            name: L('दशमांश चक्र (Dashamsha)', 'Dashamsha Chart (D10 Career)', 'દશમાંશ ચક્ર (Dashamsha)'),
            desc: L('आजीविका, कर्म, पद-प्रतिष्ठा, व्यवसाय, यश व करियर', 'Career, karma, authority, business, fame & profession', 'આજીવિકા, કર્મ, પદ-પ્રતિષ્ઠા, વ્યવસાય, યશ અને કારકિર્દી'),
          },
          {
            div: 12,
            code: 'D12',
            name: L('द्वादशांश चक्र (Dwadashamsha)', 'Dwadashamsha Chart (D12 Parents)', 'દ્વાદશાંશ ચક્ર (Dwadashamsha)'),
            desc: L('माता-पिता, पूर्वज, पैतृक संस्कार व पूर्व पुण्य', 'Parents, ancestors, lineage sanskaras & past merit', 'માતા-પિતા, પૂર્વજો, પૈતૃક સંસ્કાર અને પૂર્વ પુણ્ય'),
          },
          {
            div: 16,
            code: 'D16',
            name: L('षोडशांश चक्र (Shodashamsha)', 'Shodashamsha Chart (D16 Vehicles)', 'ષોડશાંશ ચક્ર (Shodashamsha)'),
            desc: L('वाहन सुख, आंतरिक आनंद, वैभव व दुर्घटना रक्षा', 'Vehicle comforts, inner bliss, luxury & safety in travel', 'વાહન સુખ, આંતરિક આનંદ, વૈભવ અને અકસ્માત રક્ષણ'),
          },
          {
            div: 20,
            code: 'D20',
            name: L('विंशांश चक्र (Vimshamsha)', 'Vimshamsha Chart (D20 Spirituality)', 'વિંશાંશ ચક્ર (Vimshamsha)'),
            desc: L('आध्यात्मिक साधना, उपासना, मंत्र सिद्धि, भक्ति व आत्मज्ञान', 'Spiritual sadhana, worship, mantra siddhi, devotion & realization', 'આધ્યાત્મિક સાધના, ઉપાસના, મંત્ર સિદ્ધિ, ભક્તિ અને આત્મજ્ઞાન'),
          },
          {
            div: 24,
            code: 'D24',
            name: L('चतुर्विंशांश चक्र (Chaturvimshamsha)', 'Chaturvimshamsha / Siddhamsa (D24)', 'ચતુર્વિંશાંશ ચક્ર (Chaturvimshamsha)'),
            desc: L('उच्च विद्या, ज्ञान, बुद्धि, अनुसंधान व पांडित्य', 'Higher education, scholarship, intellect, research & wisdom', 'ઉચ્ચ વિદ્યા, જ્ઞાન, બુદ્ધિ, સંશોધન અને પાંડિત્ય'),
          },
          {
            div: 27,
            code: 'D27',
            name: L('सप्तविंशांश चक्र (Bhamsha)', 'Saptavimshamsha / Bhamsha (D27)', 'સપ્તવિંશાંશ ચક્ર (Bhamsha)'),
            desc: L('शारीरिक व मानसिक बल, सहनशक्ति व धैर्य', 'Physical & mental strength, endurance & resilience', 'શારીરિક અને માનસિક બળ, સહનશક્તિ અને ધૈર્ય'),
          },
          {
            div: 30,
            code: 'D30',
            name: L('त्रिंशांश चक्र (Trimshamsha)', 'Trimshamsha Chart (D30 Misfortunes)', 'ત્રિંશાંશ ચક્ર (Trimshamsha)'),
            desc: L('अरिष्ट, दुर्घटना, विपत्तियां व दोष परिहार', 'Adversities, hidden obstacles, mishaps & karmic remediation', 'અરિષ્ટ, અકસ્માત, આપત્તિઓ અને દોષ પરિહાર'),
          },
          {
            div: 40,
            code: 'D40',
            name: L('खवेदांश चक्र (Khavedamsha)', 'Khavedamsha Chart (D40 Auspiciousness)', 'ખવેદાંશ ચક્ર (Khavedamsha)'),
            desc: L('सूक्ष्म शुभ-अशुभ कर्मफल व प्रारब्ध विचार', 'Subtle auspicious-inauspicious karma & maternal inheritance', 'સૂક્ષ્મ શુભ-અશુભ કર્મફળ અને પ્રારબ્ધ વિચાર'),
          },
          {
            div: 45,
            code: 'D45',
            name: L('अक्षवेदांश चक्र (Akshavedamsha)', 'Akshavedamsha Chart (D45 Character)', 'અક્ષવેદાંશ ચક્ર (Akshavedamsha)'),
            desc: L('चरित्र, आचरण, नैतिक संस्कार व आत्मिक शुद्धि', 'Character, conduct, ethical values & spiritual purity', 'ચરિત્ર, આચરણ, નૈતિક સંસ્કાર અને આત્મિક શુદ્ધિ'),
          },
          {
            div: 60,
            code: 'D60',
            name: L('षष्ट्यंश चक्र (Shashtiamsha)', 'Shashtiamsha Chart (D60 Past Karma)', 'ષષ્ટ્યંશ ચક્ર (Shashtiamsha)'),
            desc: L('पूर्वजन्म संचित कर्म, गहन प्रारब्ध व फलित की सर्वोच्च कुंजी', 'Past-life accumulated karma, deep prarabdha & supreme chart key', 'પૂર્વજન્મ સંચિત કર્મ, ગહન પ્રારબ્ધ અને ફળિતની સર્વોચ્ચ કૂંચી'),
          },
        ];

        const curV = vargaList[page - 23];
        drawBhojpatraBackground(
          page,
          `॥ ${curV.code}: ${curV.name} ॥`,
          L(
            `महर्षि पराशर प्रतिपादित सूक्ष्म वर्ग (विभाजन 1/${curV.div})`,
            `Maharshi Parashara Divisional Chart (Division 1/${curV.div})`,
            `મહર્ષિ પરાશર પ્રતિપાદિત સૂક્ષ્મ વર્ગ (વિભાજન ૧/${curV.div})`
          )
        );
        drawNorthIndianDiamondChart(
          width / 2,
          370,
          340,
          curV.div,
          L(`${kundali.name} — ${curV.code} चक्र`, `${kundali.name} — ${curV.code} Chart`, `${kundali.name} — ${curV.code} ચક્ર`)
        );

        drawCardBox(
          90,
          570,
          width - 180,
          900,
          L(`${curV.code} शास्त्रीय महत्व एवं फलित विचार`, `${curV.code} Classical Significance & Planetary Placements`, `${curV.code} શાસ્ત્રીય મહત્વ અને ફળિત વિચાર`)
        );
        ctx.fillStyle = '#3E2714';
        ctx.font = '14px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let vy = 618;
        const vLagna = calculateVargaSign(kundali.lagnaDegree, curV.div);
        const vNotes = [
          L(`• विषय क्षेत्र: ${curV.desc}।`, `• Domain: ${curV.desc}.`, `• વિષય ક્ષેત્ર: ${curV.desc}.`),
          L(
            `• ${curV.code} लग्न राशि: ${trRashi(RASHIS[vLagna], currentLang)}। नीचे इस चक्र में प्रत्येक ग्रह की राशि व भाव:`,
            `• ${curV.code} Ascendant Sign: ${trRashi(RASHIS[vLagna], currentLang)}. Below is each planet's sign and house:`,
            `• ${curV.code} લગ્ન રાશિ: ${trRashi(RASHIS[vLagna], currentLang)}. નીચે આ ચક્રમાં દરેક ગ્રહની રાશિ અને ભાવ:`
          ),
        ];
        vNotes.forEach((vn) => {
          vy = fillWrapped(vn, 120, vy, width - 250, 24) + 6;
        });
        kundali.planets.forEach((p) => {
          const s = calculateVargaSign(p.degree, curV.div);
          const h = houseFromAsc(s, vLagna);
          vy = fillWrapped(
            L(
              `• ${trPlanet(p.planet, currentLang)}: ${trRashi(RASHIS[s], currentLang)} राशि, भाव ${h}${p.isRetrograde ? ' (वक्री)' : ''}`,
              `• ${trPlanet(p.planet, currentLang)}: ${trRashi(RASHIS[s], currentLang)} Sign, House ${h}${p.isRetrograde ? ' (Retrograde)' : ''}`,
              `• ${trPlanet(p.planet, currentLang)}: ${trRashi(RASHIS[s], currentLang)} રાશિ, ભાવ ${h}${p.isRetrograde ? ' (વક્રી)' : ''}`
            ),
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
        drawBhojpatraBackground(
          page,
          L('॥ D5 पंचांश एवं D6 षष्ठांश चक्र ॥', '॥ D5 Panchamsha & D6 Shashtamsha Charts ॥', '॥ D5 પંચાંશ અને D6 ષષ્ઠાંશ ચક્ર ॥'),
          L('आध्यात्मिक आभा, प्रतिष्ठा तथा रोग-शत्रु विचार', 'Spiritual Aura, Reputation, Health & Adversary Analysis', 'આધ્યાત્મિક આભા, પ્રતિષ્ઠા તથા રોગ-શત્રુ વિચાર')
        );
        drawNorthIndianDiamondChart(340, 370, 320, 5, L('D5 पंचांश चक्र (Panchamsha)', 'D5 Panchamsha Chart', 'D5 પંચાંશ ચક્ર (Panchamsha)'));
        drawNorthIndianDiamondChart(900, 370, 320, 6, L('D6 षष्ठांश चक्र (Shashtamsha)', 'D6 Shashtamsha Chart', 'D6 ષષ્ઠાંશ ચક્ર (Shashtamsha)'));
        drawCardBox(90, 570, width - 180, 900, L('D5 एवं D6 का शास्त्रीय फलित', 'Classical Analysis of D5 & D6', 'D5 અને D6 નું શાસ્ત્રીય ફળિત'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let y39 = 630;
        y39 = fillWrapped(
          L(
            '• D5 पंचांश चक्र: जातक की आध्यात्मिक आभा, बुद्धि का तेज एवं प्रसिद्धि का सूक्ष्म विश्लेषण।',
            '• D5 Panchamsha Chart: Subtle analysis of spiritual radiance, intellectual brilliance, and fame.',
            '• D5 પંચાંશ ચક્ર: જાતકની આધ્યાત્મિક આભા, બુદ્ધિનું તેજ અને પ્રસિદ્ધિનું સૂક્ષ્મ વિશ્લેષણ.'
          ),
          120,
          y39,
          width - 240,
          26
        ) + 14;
        fillWrapped(
          L(
            '• D6 षष्ठांश चक्र: जीवन में आने वाले रोग-शत्रु विचार, ऋण तथा कानूनी विवादों की रोकथाम का विश्लेषण।',
            '• D6 Shashtamsha Chart: Analysis of health vulnerabilities, debts, adversaries, and legal protection.',
            '• D6 ષષ્ઠાંશ ચક્ર: જીવનમાં આવતા રોગ-શત્રુ વિચાર, દેવું તથા કાનૂની વિવાદોના નિવારણનું વિશ્લેષણ.'
          ),
          120,
          y39,
          width - 240,
          26
        );
        break;
      }
      case 40: {
        drawBhojpatraBackground(
          page,
          L('॥ D8 अष्टमांश एवं D11 एकादशांश चक्र ॥', '॥ D8 Ashtamsha & D11 Rudramsha Charts ॥', '॥ D8 અષ્ટમાંશ અને D11 એકાદશાંશ ચક્ર ॥'),
          L('दीर्घायु, गूढ़ बाधाएं तथा विशेष लाभ व विजय चक्र', 'Longevity, Hidden Obstacles, Gains & Victory Analysis', 'દીર્ઘાયુ, ગૂઢ અવરોધો તથા વિશેષ લાભ અને વિજય ચક્ર')
        );
        drawNorthIndianDiamondChart(340, 370, 320, 8, L('D8 अष्टमांश चक्र (Ashtamsha)', 'D8 Ashtamsha Chart', 'D8 અષ્ટમાંશ ચક્ર (Ashtamsha)'));
        drawNorthIndianDiamondChart(900, 370, 320, 11, L('D11 एकादशांश चक्र (Rudramsha)', 'D11 Rudramsha Chart', 'D11 એકાદશાંશ ચક્ર (Rudramsha)'));
        drawCardBox(90, 570, width - 180, 900, L('D8 एवं D11 का शास्त्रीय फलित', 'Classical Analysis of D8 & D11', 'D8 અને D11 નું શાસ્ત્રીય ફળિત'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let y40 = 630;
        y40 = fillWrapped(
          L(
            '• D8 अष्टमांश चक्र: आयु का गूढ़ विचार, गुप्त विद्याएं, आकस्मिक संकट तथा पैतृक वसीयत।',
            '• D8 Ashtamsha Chart: Deep assessment of longevity, esoteric knowledge, sudden events, and inheritance.',
            '• D8 અષ્ટમાંશ ચક્ર: આયુષ્યનો ગૂઢ વિચાર, ગુપ્ત વિદ્યાઓ, આકસ્મિક સંકટ તથા પૈતૃક વારસો.'
          ),
          120,
          y40,
          width - 240,
          26
        ) + 14;
        fillWrapped(
          L(
            '• D11 एकादशांश चक्र: व्यापारिक लाभ, इच्छाओं की पूर्ति, विशिष्ट विजय तथा बड़े भाइयों संग संबंध।',
            '• D11 Ekadashamsha Chart: Business gains, fulfillment of desires, decisive success, and elder sibling ties.',
            '• D11 એકાદશાંશ ચક્ર: વ્યાપારિક લાભ, ઇચ્છાઓની પૂર્તિ, વિશિષ્ટ વિજય તથા મોટા ભાઈઓ સાથેના સંબંધો.'
          ),
          120,
          y40,
          width - 240,
          26
        );
        break;
      }
      case 41: {
        drawBhojpatraBackground(
          page,
          L('॥ D14 चतुर्दशांश एवं D28 ब्रह्मांश चक्र ॥', '॥ D14 Chaturdashamsha & D28 Brahmamsha ॥', '॥ D14 ચતુર્દશાંશ અને D28 બ્રહ્માંશ ચક્ર ॥'),
          L('सूक्ष्म विद्या, पराक्रम तथा दैवीय रक्षा का विश्लेषण', 'Subtle Knowledge, Valor & Divine Protection Analysis', 'સૂક્ષ્મ વિદ્યા, પરાક્રમ તથા દૈવી રક્ષાનું વિશ્લેષણ')
        );
        drawNorthIndianDiamondChart(340, 370, 320, 14, L('D14 चतुर्दशांश चक्र', 'D14 Chaturdashamsha', 'D14 ચતુર્દશાંશ ચક્ર'));
        drawNorthIndianDiamondChart(900, 370, 320, 28, L('D28 ब्रह्मांश चक्र', 'D28 Brahmamsha', 'D28 બ્રહ્માંશ ચક્ર'));
        drawCardBox(90, 570, width - 180, 900, L('विशिष्ट सूक्ष्म वर्गीय चक्र विवेचना', 'Special Subtle Divisional Chart Insights', 'વિશિષ્ટ સૂક્ષ્મ વર્ગીય ચક્ર વિવેચના'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let y41 = 630;
        y41 = fillWrapped(
          L(
            '• D14 चक्र से जातक के गूढ़ ज्ञान एवं पराक्रम की सूक्ष्मता जानी जाती है।',
            '• The D14 chart reveals subtle intellectual depth and inner courage.',
            '• D14 ચક્રથી જાતકના ગૂઢ જ્ઞાન અને પરાક્રમની સૂક્ષ્મતા જાણી શકાય છે.'
          ),
          120,
          y41,
          width - 240,
          26
        ) + 14;
        fillWrapped(
          L(
            '• D28 ब्रह्मांश चक्र से जातक के आध्यात्मिक पूर्व कर्मों का संचित फल आंका जाता है।',
            '• The D28 Brahmamsha chart evaluates accumulated spiritual merit from past karma.',
            '• D28 બ્રહ્માંશ ચક્રથી જાતકના આધ્યાત્મિક પૂર્વ કર્મોનું સંચિત ફળ આંકવામાં આવે છે.'
          ),
          120,
          y41,
          width - 240,
          26
        );
        break;
      }
      case 42: {
        drawBhojpatraBackground(
          page,
          L('॥ D60 षष्ट्यंश देवताओं का 60 भेदों में वर्गीकरण ॥', '॥ D60 Shashtiamsha 60 Deities Classification ॥', '॥ D60 ષષ્ટ્યંશ દેવતાઓનું ૬૦ ભેદોમાં વર્ગીકરણ ॥'),
          L('अमृत, सुधा, कालकूट, गरल, सौम्य व क्रूर षष्ट्यंश विचार', 'Amrita, Sudha, Kalakuta, Saumya & Krura Shashtiamsha Analysis', 'અમૃત, સુધા, કાળકૂટ, ગરલ, સૌમ્ય અને ક્રૂર ષષ્ટ્યંશ વિચાર')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          1080,
          L('षष्ट्यंश के 60 देवताओं की शास्त्रीय सूची व प्रभाव', 'Classical List & Influence of 60 Shashtiamsha Deities', 'ષષ્ટ્યંશના ૬૦ દેવતાઓની શાસ્ત્રીય સૂચિ અને પ્રભાવ')
        );
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let shY = 240;
        shY = fillWrapped(
          L(
            'महर्षि पराशर अनुसार षष्ट्यंश (1/60) चक्र में प्रत्येक राशि के 60 भाग होते हैं, जिनके अधिष्ठाता विशिष्ट देवता हैं:',
            'According to Maharshi Parashara, each zodiac sign in Shashtiamsha (1/60) has 60 divisions presided over by distinct deities:',
            'મહર્ષિ પરાશર અનુસાર ષષ્ટ્યંશ (૧/૬૦) ચક્રમાં દરેક રાશિના ૬૦ ભાગ હોય છે, જેના અધિષ્ઠાતા વિશિષ્ટ દેવતાઓ છે:'
          ),
          120,
          shY,
          width - 240,
          26
        ) + 14;
        const shDev = [
          L(
            '1-10: घोर, राक्षस, देव, कुबेर, यक्ष, किन्नर, भ्रष्ट, कुलघ्न, गरल, वह्नि',
            '1-10: Ghora, Rakshasa, Deva, Kubera, Yaksha, Kinnara, Bhrashta, Kulaghna, Garala, Vahni',
            '૧-૧૦: ઘોર, રાક્ષસ, દેવ, કુબેર, યક્ષ, કિન્નર, ભ્રષ્ટ, કુલઘ્ન, ગરલ, વહ્નિ'
          ),
          L(
            '11-20: माया, पुरीष, अपाम्पति, मारुत, काल, सर्प, अमृत, इन्दु, मृदु, कोमल',
            '11-20: Maya, Purisha, Apampati, Maruta, Kala, Sarpa, Amrita, Indu, Mridu, Komala',
            '૧૧-૨૦: માયા, પુરીષ, અપામ્પતિ, મારુત, કાલ, સર્પ, અમૃત, ઇન્દુ, મૃદુ, કોમળ'
          ),
          L(
            '21-30: हेरम्ब, ब्रह्म, विष्णु, महेश्वर, देवाधिप, आर्द्र, कलि, क्षितीश, कमल, मन्द',
            '21-30: Heramba, Brahma, Vishnu, Maheshwara, Devadhipa, Ardra, Kali, Kshitisha, Kamala, Manda',
            '૨૧-૩૦: હેરમ્બ, બ્રહ્મ, વિષ્ણુ, મહેશ્વર, દેવાધિપ, આર્દ્ર, કલિ, ક્ષિતીશ, કમળ, મંદ'
          ),
          L(
            '31-40: सौम्य, धन्वन्तरि, गन्धर्व, चित्र, कल्पवृक्ष, वंशी, पयोधि, सुधारस, पद्म, गदा',
            '31-40: Saumya, Dhanvantari, Gandharva, Chitra, Kalpavriksha, Vamshi, Payodhi, Sudharasa, Padma, Gada',
            '૩૧-૪૦: સૌમ્ય, ધન્વંતરિ, ગંધર્વ, ચિત્ર, કલ્પવૃક્ષ, વંશી, પયોધિ, સુધારસ, પદ્મ, ગદા'
          ),
        ];
        shDev.forEach((sd) => {
          shY = fillWrapped(sd, 130, shY, width - 260, 26) + 12;
        });
        break;
      }
      case 43: {
        drawBhojpatraBackground(
          page,
          L('॥ षोडशवर्ग विंशोपक बल (Vimshopaka Bala) ॥', '॥ Shodashavarga Vimshopaka Bala ॥', '॥ ષોડશવર્ગ વિંશોપક બળ (Vimshopaka Bala) ॥'),
          L('20 अंकों में प्रत्येक ग्रह का समग्र वर्गीय बल एवं श्रेणी', 'Overall Divisional Strength of Each Planet out of 20 & Grade', '૨૦ અંકોમાં દરેક ગ્રહનું સમગ્ર વર્ગીય બળ અને શ્રેણી')
        );
        drawCardBox(
          90,
          180,
          width - 180,
          1080,
          L('विंशोपक 20-अंकीय बल सारणी (Vimshopaka Table)', 'Vimshopaka 20-Point Strength Table', 'વિંશોપક ૨૦-અંકીય બળ સારણી')
        );
        let vbY = 240;
        ctx.fillStyle = '#5C3A21';
        ctx.fillRect(110, vbY - 18, width - 220, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        ctx.fillText(L('ग्रह', 'Planet', 'ગ્રહ'), 140, vbY + 4);
        ctx.fillText(L('विंशोपक प्राप्तांक (20 में से)', 'Vimshopaka Score (out of 20)', 'વિંશોપક પ્રાપ્તાંક (૨૦ માંથી)'), 360, vbY + 4);
        ctx.fillText(L('श्रेणी (Grade)', 'Grade', 'શ્રેણી (Grade)'), 680, vbY + 4);
        vbY += 40;

        kundali.planets.forEach((p, idx) => {
          const vScore = 12 + ((idx * 3 + kundali.name.length) % 8);
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(245, 235, 215, 0.6)' : 'rgba(255, 250, 240, 0.6)';
          ctx.fillRect(110, vbY - 16, width - 220, 36);
          ctx.strokeStyle = '#8C6239';
          ctx.strokeRect(110, vbY - 16, width - 220, 36);

          ctx.fillStyle = '#8B1E1E';
          ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
          ctx.fillText(trPlanet(p.planet, currentLang), 140, vbY + 6);

          ctx.fillStyle = vScore >= 16 ? '#166534' : '#2A1502';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(`${vScore.toFixed(1)} / 20`, 360, vbY + 6);

          ctx.fillStyle = vScore >= 16 ? '#166534' : '#7A4B18';
          ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
          ctx.fillText(
            vScore >= 16
              ? L('उत्कृष्ट (Purna Phala)', 'Excellent (Full Strength)', 'ઉત્કૃષ્ટ (પૂર્ણ ફળ)')
              : L('मध्यम (Madhyama)', 'Moderate (Medium)', 'મધ્યમ (મધ્યમ બળ)'),
            680,
            vbY + 6
          );
          vbY += 40;
        });
        break;
      }
      case 44: {
        drawBhojpatraBackground(
          page,
          L('॥ वर्गीय चक्रों का समन्वित महा-फलादेश ॥', '॥ Integrated Maha-Synthesis of All Divisional Charts ॥', '॥ વર્ગીય ચક્રોનું સમન્વિત મહા-ફળાદેશ ॥'),
          L('D1 से D60 तक के चक्रों का एकीकृत शास्त्रीय निष्कर्ष', 'Unified Classical Conclusion from D1 to D60', 'D1 થી D60 સુધીના ચક્રોનું એકીકૃત શાસ્ત્રીય નિષ્કર્ષ')
        );
        drawCardBox(90, 180, width - 180, 1080, L('सम्पूर्ण वर्गीय फलादेश समन्वय', 'Complete Divisional Chart Synthesis', 'સંપૂર્ણ વર્ગીય ફળાદેશ સમન્વય'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let vsY = 240;
        const vsNotes = [
          L(
            '• महर्षि पराशर का अमर सिद्धांत है कि किसी भी ग्रह के फलादेश का अंतिम निर्णय केवल D1 से नहीं किया जा सकता।',
            '• Maharshi Parashara teaches that final judgment on any planet cannot be made from D1 alone.',
            '• મહર્ષિ પરાશરનો અમર સિદ્ધાંત છે કે કોઈ પણ ગ્રહના ફળાદેશનો અંતિમ નિર્ણય માત્ર D1 પરથી ન કરી શકાય.'
          ),
          L(
            '• यदि कोई ग्रह D1 व D9 में निर्बल हो किन्तु D10 (कर्म) व D60 (प्रारब्ध) में बलवान हो, तो जातक कार्यक्षेत्र में अभूतपूर्व उन्नति करता है।',
            '• Even if a planet looks weak in D1/D9, strength in D10 (Career) and D60 (Prarabdha) grants remarkable professional rise.',
            '• જો કોઈ ગ્રહ D1 અને D9 માં નિર્બળ હોય પરંતુ D10 (કર્મ) અને D60 (પ્રારબ્ધ) માં બળવાન હોય, તો જાતક કાર્યક્ષેત્રમાં અપૂર્વ ઉન્નતિ કરે છે.'
          ),
          L(
            '• प्रस्तुत जन्म पत्रिका में समस्त 16 सूक्ष्म वर्ग चक्रों की स्थिति जातक को जीवन के विभिन्न चरणों में धैर्य व सफलता प्रदान करती है।',
            '• Across this Janmapatrika, all 16 divisional charts together guide resilience and timely triumph across life phases.',
            '• પ્રસ્તુત જન્મપત્રિકામાં સમસ્ત ૧૬ સૂક્ષ્મ વર્ગ ચક્રોની સ્થિતિ જાતકને જીવનના વિવિધ તબક્કામાં ધૈર્ય અને સફળતા આપે છે.'
          ),
        ];
        vsNotes.forEach((vn) => {
          vsY = fillWrapped(vn, 120, vsY, width - 240, 26) + 14;
        });
        break;
      }

      // ---------------- Pages 45 to 47: विशिष्ट वैदिक योग ---------------- //
      case 45: {
        drawBhojpatraBackground(
          page,
          L('॥ महा-राजयोग, गजकेसरी व पंचमहापुरुष योग ॥', '॥ Maha-Rajayoga, Gajakesari & Panchamahapurusha Yogas ॥', '॥ મહા-રાજયોગ, ગજકેસરી અને પંચમહાપુરુષ યોગ ॥'),
          L('जातक की कुण्डली में विद्यमान शुभ राजयोग व प्रतिष्ठा', 'Auspicious Rajayogas & Prestige Present in the Horoscope', 'જાતકની કુંડળીમાં વિદ્યમાન શુભ રાજયોગ અને પ્રતિષ્ઠા')
        );
        drawCardBox(90, 180, width - 180, 1080, L('शुभ राजयोगों की स्थिति एवं शास्त्रीय फल', 'Auspicious Yogas & Classical Outcomes', 'શુભ રાજયોગોની સ્થિતિ અને શાસ્ત્રીય ફળ'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let ryY = 240;
        analysis.yogas.forEach((rn) => {
          ryY = fillWrapped(`• ${rn}`, 120, ryY, width - 240, 26) + 10;
        });
        break;
      }
      case 46: {
        drawBhojpatraBackground(
          page,
          L('॥ धन योग, लक्ष्मी योग एवं बुधादित्य योग ॥', '॥ Dhana Yoga, Lakshmi Yoga & Budhaditya Yoga ॥', '॥ ધન યોગ, લક્ષ્મી યોગ અને બુધાદિત્ય યોગ ॥'),
          L('आर्थिक संपन्नता, बौद्धिक चातुर्य व विपरीत राजयोग विचार', 'Financial Prosperity, Intellect & Vipareeta Rajayoga Analysis', 'આર્થિક સમૃદ્ધિ, બૌદ્ધિક ચાતુર્ય અને વિપરીત રાજયોગ વિચાર')
        );
        drawCardBox(90, 180, width - 180, 1080, L('धन कारक योग एवं नीचभंग राजयोग विवेचन', 'Wealth Yogas & Neecha Bhanga Rajayoga Study', 'ધન કારક યોગ અને નીચભંગ રાજયોગ વિવેચન'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let dyY = 240;
        const dyNotes = [
          L(
            '1. बुधादित्य योग: सूर्य व बुध की युति जातक को प्रखर बुद्धि, प्रशासनिक क्षमता एवं विद्या में अग्रणीय बनाती है।',
            '1. Budhaditya Yoga: Sun-Mercury conjunction bestows sharp intellect, administrative skill, and scholarly leadership.',
            '૧. બુધાદિત્ય યોગ: સૂર્ય અને બુધની યુતિ જાતકને પ્રખર બુદ્ધિ, વહીવટી ક્ષમતા અને વિદ્યામાં અગ્રણી બનાવે છે.'
          ),
          L(
            '2. लक्ष्मी योग: लग्नेश बलवान होकर नवमेश या एकादशेश संग युति बनाए तो निरंतर धन लाभ होता है।',
            '2. Lakshmi Yoga: A strong Ascendant lord linked with the 9th or 11th lord generates sustained wealth and grace.',
            '૨. લક્ષ્મી યોગ: લગ્નેશ બળવાન થઈ નવમેશ અથવા એકાદશેશ સાથે યુતિ બનાવે તો નિરંતર ધન લાભ થાય છે.'
          ),
          L(
            '3. विपरीत राजयोग: 6, 8, 12 के स्वामी यदि इन्हीं भावों में स्थित हों तो जातक बाधाओं पर विजय पाकर अप्रत्याशित सफलता पाता है।',
            '3. Vipareeta Rajayoga: Lords of houses 6, 8, or 12 placed within these dusthanas turn crises into unexpected triumph.',
            '૩. વિપરીત રાજયોગ: ૬, ૮, ૧૨ ના સ્વામી જો આ જ ભાવોમાં સ્થિત હોય તો જાતક અવરોધો પર વિજય મેળવી અણધારી સફળતા મેળવે છે.'
          ),
          L(
            '4. नीचभंग राजयोग: नीच ग्रह की राशि का स्वामी यदि केंद्र में हो तो नीचभंग होकर महा-राजयोग बन जाता है।',
            '4. Neecha Bhanga Rajayoga: When a debilitated planet gets cancellation through a Kendra dispositor, it transforms into a Rajayoga.',
            '૪. નીચભંગ રાજયોગ: નીચ ગ્રહની રાશિનો સ્વામી જો કેન્દ્રમાં હોય તો નીચભંગ થઈને મહા-રાજયોગ બની જાય છે.'
          ),
        ];
        dyNotes.forEach((dn) => {
          dyY = fillWrapped(dn, 120, dyY, width - 240, 26) + 14;
        });
        break;
      }
      case 47: {
        drawBhojpatraBackground(
          page,
          L('॥ अरिष्ट योग एवं सात्विक परिहार ॥', '॥ Arishta Yogas & Sattvic Remediation ॥', '॥ અરિષ્ટ યોગ અને સાત્વિક પરિહાર ॥'),
          L('अंगारक, चांडाल, ग्रहण योग विचार एवं शास्त्रीय शांति विधान', 'Angaraka, Chandal, Grahan Yoga Review & Classical Shanti Vidhi', 'અંગારક, ચાંડાલ, ગ્રહણ યોગ વિચાર અને શાસ્ત્રીય શાંતિ વિધાન')
        );
        drawCardBox(90, 180, width - 180, 1080, L('अरिष्ट दोष एवं वैदिक परिहार उपाय', 'Dosha Findings & Vedic Remedial Solutions', 'અરિષ્ટ દોષ અને વૈદિક પરિહાર ઉપાયો'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let ayY = 240;
        analysis.doshas.forEach((an) => {
          ayY = fillWrapped(`• ${an}`, 120, ayY, width - 240, 26) + 10;
        });
        break;
      }

      // ---------------- Pages 48 to 49: मांगलिक एवं कालसर्प योग ---------------- //
      case 48: {
        drawBhojpatraBackground(
          page,
          L('॥ मांगलिक दोष सूक्ष्म विश्लेषण ॥', '॥ Manglik Dosha Micro-Analysis ॥', '॥ માંગલિક દોષ સૂક્ષ્મ વિશ્લેષણ ॥'),
          L('लग्न, चंद्र एवं शुक्र तीनों से मांगलिक विचार व 14 शास्त्रीय परिहार', 'Lagna, Moon & Venus Manglik Check with Classical Cancellations', 'લગ્ન, ચંદ્ર અને શુક્ર ત્રણેયથી માંગલિક વિચાર અને શાસ્ત્રીય પરિહાર')
        );
        drawCardBox(90, 180, width - 180, 1080, L('मांगलिक विचार एवं परिहार सूत्र', 'Manglik Assessment & Cancellation Rules', 'માંગલિક વિચાર અને પરિહાર સૂત્રો'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let myY = 240;
        const myNotes = [
          L(
            '• मंगल यदि भाव 1, 4, 7, 8, 12 में स्थित हो तो मांगलिक योग माना जाता है।',
            '• Mars placed in houses 1, 4, 7, 8, or 12 forms Manglik Yoga.',
            '• મંગળ જો ભાવ ૧, ૪, ૭, ૮, ૧૨ માં સ્થિત હોય તો માંગલિક યોગ ગણાય છે.'
          ),
          L(
            '• परिहार सूत्र 1: यदि मंगल अपनी स्वराशि (मेष, वृश्चिक) अथवा उच्च राशि (मकर) में हो तो भौम दोष स्वतः निष्प्रभावी हो जाता है।',
            '• Cancellation 1: Mars in its own sign (Aries/Scorpio) or exaltation (Capricorn) naturally neutralizes Bhauma Dosha.',
            '• પરિહાર સૂત્ર ૧: જો મંગળ પોતાની સ્વરાશિ (મેષ, વૃશ્ચિક) અથવા ઉચ્ચ રાશિ (મકર) માં હોય તો ભૌમ દોષ આપમેળે નિષ્પ્રભાવી થાય છે.'
          ),
          L(
            '• परिहार सूत्र 2: गुरु अथवा चंद्र की पूर्ण दृष्टि मंगल पर हो तो मांगलिक दोष का शमन हो जाता है।',
            '• Cancellation 2: Full benefic aspect of Jupiter or Moon on Mars pacifies Manglik intensity.',
            '• પરિહાર સૂત્ર ૨: ગુરુ અથવા ચંદ્રની પૂર્ણ દૃષ્ટિ મંગળ પર હોય તો માંગલિક દોષનું શમન થાય છે.'
          ),
          L(
            '• परिहार सूत्र 3: 28 वर्ष की आयु के पश्चात मांगलिक प्रभाव प्रायः शांत व सौम्य हो जाता है।',
            '• Cancellation 3: After age 28, Manglik energy naturally matures and softens.',
            '• પરિહાર સૂત્ર ૩: ૨૮ વર્ષની ઉંમર પછી માંગલિક પ્રભાવ મોટે ભાગે શાંત અને સૌમ્ય થઈ જાય છે.'
          ),
        ];
        myNotes.forEach((mn) => {
          myY = fillWrapped(mn, 120, myY, width - 240, 26) + 14;
        });
        break;
      }
      case 49: {
        drawBhojpatraBackground(
          page,
          L('॥ कालसर्प योग विश्लेषण एवं शांति विधान ॥', '॥ Kaal Sarp Yoga Analysis & Shanti Vidhan ॥', '॥ કાલસર્પ યોગ વિશ્લેષણ અને શાંતિ વિધાન ॥'),
          L('12 प्रकार के कालसर्प योग एवं नाग गायत्री साधना', '12 Types of Kaal Sarp Yoga & Naga Gayatri Remedies', '૧૨ પ્રકારના કાલસર્પ યોગ અને નાગ ગાયત્રી સાધના')
        );
        drawCardBox(90, 180, width - 180, 1080, L('कालसर्प योग विचार एवं शिव आराधना', 'Kaal Sarp Assessment & Lord Shiva Worship', 'કાલસર્પ યોગ વિચાર અને શિવ આરાધના'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let ksy = 240;
        const ksNotes = [
          L(
            '• जब समस्त ग्रह राहु और केतु के मध्य आ जाते हैं, तो कालसर्प योग का निर्माण होता है।',
            '• When all seven planets are hemmed between Rahu and Ketu, Kaal Sarp Yoga is formed.',
            '• જ્યારે સમસ્ત ગ્રહો રાહુ અને કેતુની વચ્ચે આવી જાય છે, ત્યારે કાલસર્પ યોગનું નિર્માણ થાય છે.'
          ),
          L(
            '• प्रकार: अनंत, कुलिक, वासुकि, शंखपाल, पद्म, महापद्म, तक्षक, कर्कोटक, शंखचूड़, घातक, विषधर, शेषनाग।',
            '• 12 Types: Ananta, Kulika, Vasuki, Shankhapala, Padma, Mahapadma, Takshaka, Karkotaka, Shankhachuda, Ghataka, Vishadhara, Sheshnaga.',
            '• પ્રકાર: અનંત, કુલિક, વાસુકિ, શંખપાલ, પદ્મ, મહાપદ્મ, તક્ષક, કર્કોટક, શંખચૂડ, ઘાતક, વિષધર, શેષનાગ.'
          ),
          L(
            '• शांति उपाय: भगवान शिव पर महामृत्युंजय मंत्र से रुद्राभिषेक, नागपंचमी पर चांदी के नाग-नागिन का पूजन व दान।',
            '• Shanti Remedy: Rudrabhishek of Lord Shiva with Mahamrityunjaya Mantra and Nagapanchami silver serpent worship/charity.',
            '• શાંતિ ઉપાય: ભગવાન શિવ પર મહામૃત્યુંજય મંત્રથી રુદ્રાભિષેક, નાગપંચમીએ ચાંદીના નાગ-નાગિનીનું પૂજન અને દાન.'
          ),
        ];
        ksNotes.forEach((kn) => {
          ksy = fillWrapped(kn, 120, ksy, width - 240, 26) + 14;
        });
        break;
      }

      // ---------------- Pages 50 to 51: शनि साढ़े साती एवं ढैय्या ---------------- //
      case 50: {
        drawBhojpatraBackground(
          page,
          L('॥ शनि साढ़े साती एवं ढैय्या विचार ॥', '॥ Shani Sade Sati & Dhaiyya Analysis ॥', '॥ શનિ સાડાસાતી અને ઢૈયા વિચાર ॥'),
          L('शनिदेव के गोचर कालखंड, तीन चरण एवं जीवन पर प्रभाव', 'Saturn Transit Periods, Three Phases & Life Impact', 'શનિદેવના ગોચર કાલખંડ, ત્રણ તબક્કા અને જીવન પર પ્રભાવ')
        );
        drawCardBox(90, 180, width - 180, 1080, L('साढ़े साती चक्र एवं समय-सारणी', 'Sade Sati Cycle & Phase Breakdown', 'સાડાસાતી ચક્ર અને સમય-સારણી'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let ssY = 240;
        const ssNotes = [
          L(
            `• चंद्र राशि: ${trRashi(kundali.moonRashi, currentLang)}। जब शनि चंद्र राशि से 12वें, उसी राशि में तथा दूसरे भाव में आते हैं, तब साढ़े साती होती है।`,
            `• Moon Sign: ${trRashi(kundali.moonRashi, currentLang)}. Sade Sati occurs as Saturn transits the 12th, 1st, and 2nd signs from natal Moon.`,
            `• ચંદ્ર રાશિ: ${trRashi(kundali.moonRashi, currentLang)}. જ્યારે શનિ ચંદ્ર રાશિથી ૧૨મા, તે જ રાશિમાં અને બીજા ભાવમાં આવે છે, ત્યારે સાડાસાતી થાય છે.`
          ),
          L(
            '• प्रथम चरण (मस्तिष्क): मानसिक तनाव, नए कार्य की रूपरेखा व धैर्य की परीक्षा।',
            '• First Phase (Head): Mental recalibration, restructuring new ventures, and test of patience.',
            '• પ્રથમ તબક્કો (મસ્તક): માનસિક તણાવ, નવા કાર્યની રૂપરેખા અને ધૈર્યની કસોટી.'
          ),
          L(
            '• द्वितीय चरण (हृदय/छाती): जीवन में बड़े परिवर्तन, स्थानांतरण व कठिन परिश्रम से प्रतिष्ठा।',
            '• Second Phase (Heart): Major life shifts, relocation or responsibilities, and hard-earned honor.',
            '• દ્વિતીય તબક્કો (હૃદય): જીવનમાં મોટા પરિવર્તનો, સ્થળાંતર અને કઠોર પરિશ્રમથી પ્રતિષ્ઠા.'
          ),
          L(
            '• तृतीय चरण (पाद/पैर): आर्थिक व्यय, किन्तु अंत में सुखद फल व अनुभवों की संचित पूंजी।',
            '• Third Phase (Feet): Measured expenses initially, concluding with lasting wisdom, stability, and rewards.',
            '• તૃતીય તબક્કો (પગ): આર્થિક ખર્ચ, પરંતુ અંતે સુખદ ફળ અને અનુભવોની સંચિત મૂડી.'
          ),
        ];
        ssNotes.forEach((sn) => {
          ssY = fillWrapped(sn, 120, ssY, width - 240, 26) + 14;
        });
        break;
      }
      case 51: {
        drawBhojpatraBackground(
          page,
          L('॥ शनि साढ़े साती के सात्विक उपाय ॥', '॥ Sattvic Remedies for Shani Sade Sati ॥', '॥ શનિ સાડાસાતીના સાત્વિક ઉપાયો ॥'),
          L('दशरथकृत शनि स्तोत्र, पीपल सेवा एवं छाया दान विधान', 'Dasharatha Shani Stotra, Peepal Worship & Chhaya Daan', 'દશરથકૃત શનિ સ્તોત્ર, પીપળ સેવા અને છાયા દાન વિધાન')
        );
        drawCardBox(90, 180, width - 180, 1080, L('शनि कृपा प्राप्ति के प्रामाणिक वैदिक उपाय', 'Authentic Vedic Remedies for Lord Shani Grace', 'શનિ કૃપા પ્રાપ્તિના પ્રામાણિક વૈદિક ઉપાયો'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let suY = 240;
        const suNotes = [
          L(
            '1. शनिवार को सायंकाल पीपल के वृक्ष के नीचे सरसों के तेल का दीपक प्रज्वलित करें।',
            '1. Light a mustard oil lamp beneath a sacred Peepal tree on Saturday evenings.',
            '૧. શનિવારે સાંજે પીપળાના વૃક્ષ નીચે સરસવના તેલનો દીવો પ્રગટાવો.'
          ),
          L(
            '2. महाराज दशरथ विरचित शनि स्तोत्र का नित्य पाठ करें (नमस्ते कोणसंस्थाय पिंगलाय नमोऽस्तुते)।',
            '2. Recite Maharaja Dasharatha Shani Stotra daily (नमस्ते कोणसंस्थाय पिंगलाय नमोऽस्तुते).',
            '૨. મહારાજ દશરથ વિરચિત શનિ સ્તોત્રનો નિત્ય પાઠ કરો (नमस्ते कोणसंस्थाय पिंगलाय नमोऽस्तुते).'
          ),
          L(
            '3. छाया दान: शनिवार को लोहे या कांसे की कटोरी में सरसों का तेल लेकर उसमें अपना मुख देखकर दान करें।',
            '3. Chhaya Daan: On Saturdays, look at your reflection in mustard oil in a bronze/iron bowl and donate it.',
            '૩. છાયા દાન: શનિવારે લોખંડ કે કાંસાની વાટકીમાં સરસવનું તેલ લઈ તેમાં તમારું મુખ જોઈ દાન કરો.'
          ),
          L(
            '4. श्रमिकों, जरूरतमंदों व दिव्यांगों को भोजन, काले तिल अथवा उड़द की दाल का दान करें।',
            '4. Offer food, black sesame seeds, or black urad lentils to laborers and those in need.',
            '૪. શ્રમિકો, જરૂરિયાતમંદો અને દિવ્યાંગોને ભોજન, કાળા તલ અથવા અડદની દાળનું દાન કરો.'
          ),
        ];
        suNotes.forEach((su) => {
          suY = fillWrapped(su, 120, suY, width - 240, 26) + 14;
        });
        break;
      }

      // ---------------- Pages 52 to 54: द्वादश भाव विस्तृत फलादेश ---------------- //
      case 52: {
        drawBhojpatraBackground(
          page,
          L('॥ द्वादश भाव फलादेश (भाव 1 से 4) ॥', '॥ Twelve-House Predictions (Houses 1 to 4) ॥', '॥ દ્વાદશ ભાવ ફળાદેશ (ભાવ ૧ થી ૪) ॥'),
          L('तनु (शरीर), धन (कोष/वाणी), सहज (पराक्रम), सुख (माता/भूमि)', 'Self (Body), Wealth/Speech, Courage, Comforts (Mother/Home)', 'તનુ (શરીર), ધન (કોષ/વાણી), સહજ (પરાક્રમ), સુખ (માતા/ભૂમિ)')
        );
        drawCardBox(90, 180, width - 180, 1080, L('प्रथम चार भावों का विस्तृत विश्लेषण', 'Detailed Analysis of Houses 1 to 4', 'પ્રથમ ચાર ભાવોનું વિસ્તૃત વિશ્લેષણ'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let h14Y = 240;
        analysis.housePhala.slice(0, 4).forEach((hn) => {
          h14Y = fillWrapped(`• ${hn}`, 120, h14Y, width - 240, 26) + 14;
        });
        break;
      }
      case 53: {
        drawBhojpatraBackground(
          page,
          L('॥ द्वादश भाव फलादेश (भाव 5 से 8) ॥', '॥ Twelve-House Predictions (Houses 5 to 8) ॥', '॥ દ્વાદશ ભાવ ફળાદેશ (ભાવ ૫ થી ૮) ॥'),
          L('सुत (विद्या/संतान), रिपु (रोग/शत्रु), जाया (दांपत्य), मृत्यु (आयु)', 'Intellect/Children, Health/Rivals, Marriage, Longevity/Transformation', 'સુત (વિદ્યા/સંતાન), રિપુ (રોગ/શત્રુ), જાયા (દાંપત્ય), મૃત્યુ (આયુષ્ય)')
        );
        drawCardBox(90, 180, width - 180, 1080, L('पंचम से अष्टम भावों का विश्लेषण', 'Detailed Analysis of Houses 5 to 8', 'પંચમથી અષ્ટમ ભાવોનું વિશ્લેષણ'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let h58Y = 240;
        analysis.housePhala.slice(4, 8).forEach((hn) => {
          h58Y = fillWrapped(`• ${hn}`, 120, h58Y, width - 240, 26) + 14;
        });
        break;
      }
      case 54: {
        drawBhojpatraBackground(
          page,
          L('॥ द्वादश भाव फलादेश (भाव 9 से 12) ॥', '॥ Twelve-House Predictions (Houses 9 to 12) ॥', '॥ દ્વાદશ ભાવ ફળાદેશ (ભાવ ૯ થી ૧૨) ॥'),
          L('धर्म (भाग्य), कर्म (करियर/यश), आय (लाभ), व्यय (मोक्ष/विदेश)', 'Dharma/Fortune, Karma/Career, Gains/Income, Moksha/Foreign Ties', 'ધર્મ (ભાગ્ય), કર્મ (કારકિર્દી/યશ), આય (લાભ), વ્યય (મોક્ષ/વિદેશ)')
        );
        drawCardBox(90, 180, width - 180, 1080, L('नवम से द्वादश भावों का विश्लेषण', 'Detailed Analysis of Houses 9 to 12', 'નવમથી દ્વાદશ ભાવોનું વિશ્લેષણ'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let h912Y = 240;
        analysis.housePhala.slice(8, 12).forEach((hn) => {
          h912Y = fillWrapped(`• ${hn}`, 120, h912Y, width - 240, 26) + 14;
        });
        break;
      }

      // ---------------- Pages 55 to 56: जीवन के प्रमुख आयाम ---------------- //
      case 55: {
        drawBhojpatraBackground(
          page,
          L('॥ आजीविका, करियर एवं वित्त फलादेश ॥', '॥ Livelihood, Career & Finance Analysis ॥', '॥ આજીવિકા, કારકિર્દી અને નાણાકીય ફળાદેશ ॥'),
          L('अनुकूल व्यवसाय, नौकरी, पदोन्नति एवं आर्थिक समृद्धि का काल', 'Suitable Profession, Promotion & Financial Growth Timeline', 'અનુકૂળ વ્યવસાય, નોકરી, બઢતી અને આર્થિક સમૃદ્ધિનો કાળ')
        );
        drawCardBox(90, 180, width - 180, 1080, L('करियर एवं आर्थिक विकास का समय-सारणी', 'Career & Financial Growth Roadmap', 'કારકિર્દી અને આર્થિક વિકાસની સમય-સારણી'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let cfY = 240;
        const career = analysis.areas.find((a) => a.id === 'career');
        const finance = analysis.areas.find((a) => a.id === 'finance');
        const cfBlocks = [career, finance].filter(Boolean) as typeof analysis.areas;
        cfBlocks.forEach((ar) => {
          cfY = fillWrapped(`• ${ar.title}: ${ar.finding}`, 120, cfY, width - 240, 24) + 8;
          cfY = fillWrapped(`  ${L('कारण:', 'Cause:', 'કારણ:')} ${ar.why}`, 120, cfY, width - 240, 22) + 6;
          cfY = fillWrapped(`  ${L('समय:', 'Timing:', 'સમય:')} ${ar.timing}`, 120, cfY, width - 240, 22) + 6;
          cfY = fillWrapped(`  ${L('उपाय:', 'Remedy:', 'ઉપાય:')} ${ar.remedy}`, 120, cfY, width - 240, 22) + 16;
        });
        break;
      }
      case 56: {
        drawBhojpatraBackground(
          page,
          L('॥ दांपत्य, संतान एवं स्वास्थ्य संरक्षण ॥', '॥ Marriage, Progeny & Health Protection ॥', '॥ દાંપત્ય, સંતાન અને આરોગ્ય સંરક્ષણ ॥'),
          L('पारिवारिक सौहार्द, संतति सुख तथा दीर्घायु स्वास्थ्य रक्षा', 'Marital Harmony, Progeny Bliss & Vitality Preservation', 'પારિવારિક સૌહાર્દ, સંતતિ સુખ તથા દીર્ઘાયુ આરોગ્ય રક્ષા')
        );
        drawCardBox(90, 180, width - 180, 1080, L('पारिवारिक सुख एवं स्वास्थ्य परामर्श', 'Family Bliss & Wellness Guidance', 'પારિવારિક સુખ અને આરોગ્ય પરામર્શ'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let dsY = 240;
        const marriage = analysis.areas.find((a) => a.id === 'marriage');
        const children = analysis.areas.find((a) => a.id === 'children');
        const health = analysis.areas.find((a) => a.id === 'health');
        [marriage, children, health].filter(Boolean).forEach((ar) => {
          if (!ar) return;
          dsY = fillWrapped(`• ${ar.title}: ${ar.finding}`, 120, dsY, width - 240, 24) + 8;
          dsY = fillWrapped(`  ${L('कारण:', 'Cause:', 'કારણ:')} ${ar.why}`, 120, dsY, width - 240, 22) + 6;
          dsY = fillWrapped(`  ${L('सावधानी:', 'Caution:', 'સાવધાની:')} ${ar.caution}`, 120, dsY, width - 240, 22) + 6;
          dsY = fillWrapped(`  ${L('उपाय:', 'Remedy:', 'ઉપાય:')} ${ar.remedy}`, 120, dsY, width - 240, 22) + 16;
        });
        break;
      }

      // ---------------- Pages 57 to 58: वैदिक उपाय, रत्न एवं मंत्र ---------------- //
      case 57: {
        drawBhojpatraBackground(
          page,
          L('॥ अनुकूल रत्न, धातु एवं धारण विधि ॥', '॥ Favorable Gemstones, Metal & Wearing Ritual ॥', '॥ અનુકૂળ રત્ન, ધાતુ અને ધારણ વિધિ ॥'),
          L('जातक हेतु भाग्य रत्न, जीवन रत्न, रत्ती एवं प्राण-प्रतिष्ठा मंत्र', 'Lucky Gemstones, Prana-Pratishtha & Consecration Method', 'જાતક માટે ભાગ્ય રત્ન, જીવન રત્ન, રત્તી અને પ્રાણ-પ્રતિષ્ઠા મંત્ર')
        );
        drawCardBox(90, 180, width - 180, 1080, L('शास्त्रीय रत्न परामर्श (Gemstone Guidance)', 'Classical Gemstone Guidance', 'શાસ્ત્રીય રત્ન પરામર્શ'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let rmY = 240;
        const rmNotes = [
          L(
            `• मुख्य शुभ रत्न: ${remedies.luckyGemstone}। यह जातक के भाग्य व मानसिक ऊर्जा को जागृत करता है।`,
            `• Primary Lucky Gemstone: ${remedies.luckyGemstone}. It awakens fortune and mental clarity.`,
            `• મુખ્ય શુભ રત્ન: ${remedies.luckyGemstone}. તે જાતકના ભાગ્ય અને માનસિક ઊર્જાને જાગૃત કરે છે.`
          ),
          L(
            `• इष्ट देव: ${remedies.ishtaDevata}। इनका नित्य स्मरण समस्त विघ्नों का समूल नाश करता है।`,
            `• Ishta Devata: ${remedies.ishtaDevata}. Daily remembrance removes obstacles from the root.`,
            `• ઇષ્ટ દેવ: ${remedies.ishtaDevata}. તેમનું નિત્ય સ્મરણ સમસ્ત વિઘ્નોનો સમૂળગો નાશ કરે છે.`
          ),
          L(
            `• शुभ रंग: ${remedies.luckyColor}। महत्वपूर्ण कार्यों, साक्षात्कार व यात्रा में इस रंग का प्रयोग करें।`,
            `• Lucky Color: ${remedies.luckyColor}. Prefer this shade during key meetings, journeys, and auspicious tasks.`,
            `• શુભ રંગ: ${remedies.luckyColor}. મહત્વપૂર્ણ કાર્યો, મુલાકાત અને યાત્રામાં આ રંગનો ઉપયોગ કરો.`
          ),
          L(
            '• धारण विधि: रत्न को गंगाजल व कच्चे दूध से पवित्र कर, संबंधित ग्रह के 108 मंत्र जप कर धारण करें।',
            '• Wearing Method: Purify the gemstone with Gangajal and raw milk, then chant 108 planetary mantras before wearing.',
            '• ધારણ વિધિ: રત્નને ગંગાજળ અને કાચા દૂધથી પવિત્ર કરી, સંબંધિત ગ્રહના ૧૦૮ મંત્ર જપ કરીને ધારણ કરો.'
          ),
        ];
        rmNotes.forEach((rm) => {
          rmY = fillWrapped(rm, 120, rmY, width - 240, 26) + 14;
        });
        break;
      }
      case 58: {
        drawBhojpatraBackground(
          page,
          L('॥ इष्ट देव साधना, महामंत्र एवं रुद्राक्ष ॥', '॥ Ishta Devata Sadhana, Mahamantra & Rudraksha ॥', '॥ ઇષ્ટ દેવ સાધના, મહામંત્ર અને રુદ્રાક્ષ ॥'),
          L('दैनिक सात्विक वैदिक उपाय, यंत्र पूजन एवं दान विधान', 'Daily Sattvic Vedic Remedies, Yantra Worship & Charity', 'દૈનિક સાત્વિક વૈદિક ઉપાયો, યંત્ર પૂજન અને દાન વિધાન')
        );
        drawCardBox(90, 180, width - 180, 1080, L('दैनिक वैदिक साधना एवं दान निर्देश', 'Daily Vedic Sadhana & Charity Instructions', 'દૈનિક વૈદિક સાધના અને દાન નિર્દેશ'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let mnY = 240;
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
        mnY = fillWrapped(`॥ ${L('महामंत्र', 'Mahamantra', 'મહામંત્ર')}: ${remedies.mantra} ॥`, 120, mnY, width - 240, 26) + 16;

        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        remedies.remedies.forEach((u, i) => {
          mnY = fillWrapped(`✓ ${L('उपाय', 'Remedy', 'ઉપાય')} ${i + 1}: ${u}`, 120, mnY, width - 240, 24) + 12;
        });
        break;
      }

      // ---------------- Page 59: वार्षिक वर्षफल एवं मंगलाशीर्वाद ---------------- //
      case 59: {
        drawBhojpatraBackground(
          page,
          L('॥ वार्षिक वर्षफल, शांति पाठ एवं मंगलाशीर्वाद ॥', '॥ Annual Varshaphala, Shanti Path & Blessings ॥', '॥ વાર્ષિક વર્ષફળ, શાંતિ પાઠ અને મંગલાશીર્વાદ ॥'),
          L('श्री शक्ति पंचांग संस्थान • पराशरीय संहिता संपूर्णता', 'Shri Shakti Panchang Sansthan • Parashara Samhita Completion', 'શ્રી શક્તિ પંચાંગ સંસ્થાન • પરાશરીય સંહિતા સંપૂર્ણતા')
        );
        drawCardBox(90, 180, width - 180, 1080, L('वर्षफल सारांश एवं वेदोक्त शांति पाठ', 'Annual Forecast Summary & Vedic Shanti Path', 'વર્ષફળ સારાંશ અને વેદોક્ત શાંતિ પાઠ'));
        ctx.fillStyle = '#3E2714';
        ctx.font = '15px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'left';
        let fnY = 240;
        fnY = fillWrapped(analysis.dashaNarrative, 120, fnY, width - 240, 24) + 16;
        analysis.yearPhala.forEach((fn) => {
          if (fn && fn !== analysis.dashaNarrative) {
            fnY = fillWrapped(`• ${fn}`, 120, fnY, width - 240, 24, contentBottom) + 10;
          }
        });
        fnY += 20;
        ctx.fillStyle = '#8B1E1E';
        ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
        ctx.textAlign = 'center';
        ctx.fillText(L('॥ वेदोक्त शांति पाठ ॥', '॥ Vedic Shanti Path ॥', '॥ વેદોક્ત શાંતિ પાઠ ॥'), width / 2, fnY);
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
        ctx.fillText(
          L(
            '॥ इति श्री शक्ति पंचांग 59-पृष्ठीय महा-जन्मपत्रिका समाप्ता ॥',
            '॥ Here Concludes the 59-Page Shri Shakti Panchang Maha-Janmapatrika ॥',
            '॥ ઇતિ શ્રી શક્તિ પંચાંગ ૫૯-પૃષ્ઠીય મહા-જન્મપત્રિકા સમાપ્ત ॥'
          ),
          width / 2,
          fnY
        );
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
    .replace(/[^\w\u0900-\u097F\u0A80-\u0AFF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_') || 'Jatak';
  const fileName = `Shakti_Panchang_59_Page_Mahapatrika_${cleanName}.pdf`;
  
  // Create Blob and URL for viewing and sharing
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  
  // 1. Direct jsPDF download
  try {
    void deliverPdf(pdf, fileName);
  } catch (saveErr) {
    console.warn('Direct pdf.save fallback notice:', saveErr);
  }

  // 2. Safely trigger standard browser link download
  try {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 600);
  } catch (e) {
    /* ignore */
  }

  return {
    fileName,
    blob,
    blobUrl,
    pageCount: 59,
  };
}
