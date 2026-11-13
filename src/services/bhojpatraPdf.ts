import { jsPDF } from 'jspdf';
import { VedicPanchangData, KundaliData, PlanetPosition } from '../types';
import { triggerPdfDownload, waitForPdfFonts, type PdfResult } from './pdfFonts';
import { PDF_MM_H, PDF_MM_W, PDF_PX_H, PDF_PX_W } from './pdfPage';
import { deliverPdf } from '../lib/device';
import { calculateVargaSign, RASHIS, NAKSHATRAS } from './astronomy';
import { analyzeKundali, SIGN_LORDS } from './predictions';
import { trPlanet, trRashi, trVedic, trWeekday } from '../i18n/vedicTranslate';

export interface BhojpatraPdfOptions {
  title?: string;
  panchang: VedicPanchangData;
  query: string;
  answer: string;
  activeKundali?: KundaliData | null;
  kundali?: KundaliData | null;
  locationName?: string;
  date?: Date;
  lang?: string;
}

/**
 * Planet short abbreviations for North Indian Kundali chart
 */
const PLANET_ABBR_MAPS: Record<string, Record<string, string>> = {
  hi: {
    सूर्य: 'सू',
    चंद्र: 'चं',
    मंगल: 'मं',
    बुध: 'बु',
    गुरु: 'गु',
    बृहस्पति: 'गु',
    शुक्र: 'शु',
    शनि: 'श',
    राहु: 'रा',
    केतु: 'के',
  },
  en: {
    सूर्य: 'Su',
    चंद्र: 'Mo',
    मंगल: 'Ma',
    बुध: 'Me',
    गुरु: 'Ju',
    बृहस्पति: 'Ju',
    शुक्र: 'Ve',
    शनि: 'Sa',
    राहु: 'Ra',
    केतु: 'Ke',
  },
  gu: {
    सूर्य: 'સૂ',
    चंद्र: 'ચં',
    मंगल: 'મં',
    बुध: 'બુ',
    गुरु: 'ગુ',
    बृहस्पति: 'ગુ',
    शुक्र: 'શુ',
    शनि: 'શ',
    राहु: 'રા',
    केतु: 'કે',
  },
};

function getPlanetAbbr(planetName: string, lang: string = 'hi'): string {
  const cLang = (lang || 'hi').slice(0, 2).toLowerCase();
  const map = PLANET_ABBR_MAPS[cLang] || PLANET_ABBR_MAPS.hi;
  for (const [k, v] of Object.entries(map)) {
    if (planetName.includes(k)) return v;
  }
  return planetName.slice(0, 2);
}

/**
 * Classical exaltation and debilitation mapping
 */
const EXALTATION_SIGNS: Record<string, string> = {
  सूर्य: 'मेष',
  चंद्र: 'वृषभ',
  मंगल: 'मकर',
  बुध: 'कन्या',
  गुरु: 'कर्क',
  शुक्र: 'मीन',
  शनि: 'तुला',
  राहु: 'वृषभ',
  केतु: 'वृश्चिक',
};

const DEBILITATION_SIGNS: Record<string, string> = {
  सूर्य: 'तुला',
  चंद्र: 'वृश्चिक',
  मंगल: 'कर्क',
  बुध: 'मीन',
  गुरु: 'मकर',
  शुक्र: 'कन्या',
  शनि: 'मेष',
  राहु: 'वृश्चिक',
  केतु: 'वृषभ',
};

const OWN_SIGNS_MAP: Record<string, string[]> = {
  सूर्य: ['सिंह'],
  चंद्र: ['कर्क'],
  मंगल: ['मेष', 'वृश्चिक'],
  बुध: ['मिथुन', 'कन्या'],
  गुरु: ['धनु', 'मीन'],
  शुक्र: ['वृषभ', 'तुला'],
  शनि: ['मकर', 'कुंभ'],
};

/**
 * Draws a classical North Indian Diamond Kundali chart
 */
function drawNorthIndianDiamondChart(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  vargaDivision: number,
  kundali: KundaliData,
  title: string,
  subTitle?: string,
  lang: string = 'hi'
) {
  const cLang = (lang || 'hi').slice(0, 2).toLowerCase();
  ctx.save();
  const half = size / 2;
  const x0 = centerX - half;
  const y0 = centerY - half;

  // 1. Chart Background & Outer Frame
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(x0, y0, size, size);
  ctx.strokeStyle = '#8C6239';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x0, y0, size, size);

  // 2. Diagonals (X)
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + size, y0 + size);
  ctx.moveTo(x0 + size, y0);
  ctx.lineTo(x0, y0 + size);
  ctx.strokeStyle = '#8C6239';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Central Diamond (Kendra: 1, 4, 7, 10 houses)
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

  // 4. Calculate Varga Lagna & Planet House Placements
  const lagnaSign = calculateVargaSign(kundali.lagnaDegree, vargaDivision);
  const scale = size / 360;

  // Anchors for house number & planet cluster positions in 360x360 reference
  const anchors = [
    { h: 1, cx: 180, cy: 92, nx: 180, ny: 150 },
    { h: 2, cx: 90, cy: 46, nx: 122, ny: 78 },
    { h: 3, cx: 46, cy: 90, nx: 78, ny: 122 },
    { h: 4, cx: 95, cy: 180, nx: 150, ny: 180 },
    { h: 5, cx: 46, cy: 270, nx: 78, ny: 238 },
    { h: 6, cx: 90, cy: 314, nx: 122, ny: 282 },
    { h: 7, cx: 180, cy: 268, nx: 180, ny: 210 },
    { h: 8, cx: 270, cy: 314, nx: 238, ny: 282 },
    { h: 9, cx: 314, cy: 270, nx: 282, ny: 238 },
    { h: 10, cx: 265, cy: 180, nx: 210, ny: 180 },
    { h: 11, cx: 314, cy: 90, nx: 282, ny: 122 },
    { h: 12, cx: 270, cy: 46, nx: 238, ny: 78 },
  ];

  const hPlanets: Record<number, { name: string; retro: boolean; deg: string }[]> = {};
  for (let i = 1; i <= 12; i++) hPlanets[i] = [];

  kundali.planets.forEach((p) => {
    // Only standard 9 classical Grahas in the primary chart
    const isMajorGraha = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'].some(
      (g) => p.planet.includes(g)
    );
    if (!isMajorGraha) return;

    const pVargaSign = calculateVargaSign(p.degree, vargaDivision);
    const house = ((pVargaSign - lagnaSign + 12) % 12) + 1;
    const slice = 30 / Math.max(1, vargaDivision);
    const vdeg = vargaDivision === 1 ? p.degreeInRashi : (p.degreeInRashi % slice) * vargaDivision;

    hPlanets[house]?.push({
      name: getPlanetAbbr(p.planet, cLang),
      retro: p.isRetrograde,
      deg: `${Math.floor(vdeg)}°`,
    });
  });

  const retroTag = cLang === 'en' ? 'R' : cLang === 'gu' ? 'વ' : 'व';

  // 5. Draw House Rashi Numbers and Resident Planets
  anchors.forEach(({ h, cx: acx, cy: acy, nx, ny }) => {
    // Rashi number in this house (1 to 12)
    const rashiNum = ((lagnaSign + h - 1) % 12) + 1;
    const px = x0 + acx * scale;
    const py = y0 + acy * scale;

    ctx.fillStyle = h === 1 ? '#8B1E1E' : '#8C6239';
    ctx.font = h === 1 ? 'bold 15px "Tiro Devanagari Hindi", serif' : 'bold 12px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${rashiNum}`, x0 + nx * scale, y0 + ny * scale);

    const plist = hPlanets[h] || [];
    const n = plist.length;
    const fs = n >= 4 ? 9 : n >= 3 ? 10 : 11;
    const lh = fs + 3;
    ctx.font = `bold ${fs}px "Tiro Devanagari Hindi", serif`;

    plist.forEach((p, idx) => {
      ctx.fillStyle = p.retro ? '#8B1E1E' : '#2A1502';
      const label = n >= 4 ? `${p.name}${p.retro ? retroTag : ''}` : `${p.name}${p.retro ? retroTag : ''} ${p.deg}`;
      ctx.fillText(label, px, py + (idx - (n - 1) / 2) * lh);
    });
  });

  // 6. Chart Title and Subtitle
  ctx.fillStyle = '#8B1E1E';
  ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(title, centerX, y0 - 10);

  if (subTitle) {
    ctx.fillStyle = '#7A4B18';
    ctx.font = '12px "Tiro Devanagari Hindi", serif';
    ctx.fillText(subTitle, centerX, y0 + size + 18);
  }

  ctx.restore();
}

/**
 * Draws the Graha Spashta (Planetary Longitudes & Dignity) Table
 */
function drawGrahaSpashtaTable(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  kundali: KundaliData,
  lang: string = 'hi'
) {
  const currentLang = (lang || 'hi').slice(0, 2).toLowerCase();
  ctx.save();

  // Outer container
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = '#C58F27';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, width, height);

  // Table Title
  const tableTitle = currentLang === 'en'
    ? '॥ Planetary Positions & Nakshatra Table ॥'
    : currentLang === 'gu'
    ? '॥ ગ્રહ સ્પષ્ટ સ્થિતિ અને નક્ષત્ર સારણી ॥'
    : '॥ ग्रह स्पष्ट स्थिति व नक्षत्र सारणी ॥';

  ctx.fillStyle = '#8B1E1E';
  ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(tableTitle, x + width / 2, y - 10);

  // Header Bar
  const headerH = 25;
  ctx.fillStyle = '#5C3A21';
  ctx.fillRect(x, y, width, headerH);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const colX = {
    graha: x + 8,
    rashi: x + 62,
    deg: x + 128,
    nakshatra: x + 195,
    status: x + 315,
  };

  const midH = y + headerH / 2;
  const thGraha = currentLang === 'en' ? 'Planet' : currentLang === 'gu' ? 'ગ્રહ' : 'ग्रह';
  const thRashi = currentLang === 'en' ? 'Sign' : currentLang === 'gu' ? 'રાશિ' : 'राशि';
  const thDeg = currentLang === 'en' ? 'Deg/Min' : currentLang === 'gu' ? 'અંશ/કળા' : 'अंश/कला';
  const thNak = currentLang === 'en' ? 'Nakshatra (Pada)' : currentLang === 'gu' ? 'નક્ષત્ર (ચરણ)' : 'नक्षत्र (चरण)';
  const thStatus = currentLang === 'en' ? 'Status/Motion' : currentLang === 'gu' ? 'સ્થિતિ/ગતિ' : 'स्थिति/गति';

  ctx.fillText(thGraha, colX.graha, midH);
  ctx.fillText(thRashi, colX.rashi, midH);
  ctx.fillText(thDeg, colX.deg, midH);
  ctx.fillText(thNak, colX.nakshatra, midH);
  ctx.fillText(thStatus, colX.status, midH);

  // Prepare 10 rows: Lagna + 9 Grahas
  const lagnaDeg = kundali.lagnaDegree;
  const lagnaNakIdx = Math.floor(lagnaDeg / (360 / 27));
  const lagnaPada = Math.floor((lagnaDeg % (360 / 27)) / (360 / 108)) + 1;
  const lagnaDegInRashi = lagnaDeg % 30;

  const fmtDMS = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg % 1) * 60);
    return `${d}° ${m < 10 ? '0' : ''}${m}'`;
  };

  const majorOrder = ['सूर्य', 'चंद्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'];
  const pMap: Record<string, PlanetPosition> = {};
  kundali.planets.forEach((p) => {
    for (const g of majorOrder) {
      if (p.planet.includes(g)) {
        pMap[g] = p;
        break;
      }
    }
  });

  interface TableRow {
    name: string;
    rashi: string;
    deg: string;
    nakshatra: string;
    status: string;
    statusColor: string;
    isLagna?: boolean;
  }

  const lagnaStatus = currentLang === 'en' ? 'Ascendant' : currentLang === 'gu' ? 'ઉદય (Udaya)' : 'उदय (Udaya)';
  const lagnaName = currentLang === 'en' ? 'Ascendant' : currentLang === 'gu' ? 'લગ્ન' : 'लग्न (Asc)';

  const rows: TableRow[] = [
    {
      name: lagnaName,
      rashi: trRashi(kundali.lagnaRashi, currentLang),
      deg: fmtDMS(lagnaDegInRashi),
      nakshatra: `${trVedic(NAKSHATRAS[lagnaNakIdx % 27] || '—', currentLang)} (${lagnaPada})`,
      status: lagnaStatus,
      statusColor: '#8B1E1E',
      isLagna: true,
    },
  ];

  majorOrder.forEach((g) => {
    const p = pMap[g];
    if (!p) return;

    let status = p.isRetrograde
      ? (currentLang === 'en' ? 'Retrograde (R)' : currentLang === 'gu' ? 'વક્રી (R)' : 'वक्री (R)')
      : (currentLang === 'en' ? 'Direct (D)' : currentLang === 'gu' ? 'માર્ગી (D)' : 'मार्गी (D)');
    let statusColor = p.isRetrograde ? '#8B1E1E' : '#2A1402';

    if (EXALTATION_SIGNS[g] === p.rashi) {
      status = currentLang === 'en' ? 'Exalted' : currentLang === 'gu' ? 'ઉચ્ચ' : 'उच्च (Exalt)';
      statusColor = '#1A5319';
    } else if (DEBILITATION_SIGNS[g] === p.rashi) {
      status = currentLang === 'en' ? 'Debilitated' : currentLang === 'gu' ? 'નીચ' : 'नीच (Debil)';
      statusColor = '#9A1B1B';
    } else if (OWN_SIGNS_MAP[g]?.includes(p.rashi)) {
      status = currentLang === 'en' ? 'Own Sign' : currentLang === 'gu' ? 'સ્વરાશિ' : 'स्वराशि (Own)';
      statusColor = '#1F4529';
    }

    rows.push({
      name: trPlanet(p.planet, currentLang),
      rashi: trRashi(p.rashi, currentLang),
      deg: fmtDMS(p.degreeInRashi),
      nakshatra: `${trVedic(p.nakshatra, currentLang)} (${p.pada})`,
      status,
      statusColor,
    });
  });

  const rowCount = rows.length;
  const rowH = (height - headerH) / rowCount;

  rows.forEach((r, idx) => {
    const ry = y + headerH + idx * rowH;
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 252, 243, 0.95)' : 'rgba(247, 238, 220, 0.95)';
    ctx.fillRect(x, ry, width, rowH);

    ctx.strokeStyle = 'rgba(197, 143, 39, 0.3)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x, ry, width, rowH);

    const textY = ry + rowH / 2;
    ctx.font = r.isLagna ? 'bold 12px "Tiro Devanagari Hindi", serif' : '11.5px "Tiro Devanagari Hindi", serif';

    // Graha Name
    ctx.fillStyle = r.isLagna ? '#8B1E1E' : '#3A1F0A';
    ctx.fillText(r.name, colX.graha, textY);

    // Rashi
    ctx.fillStyle = '#2A1402';
    ctx.fillText(r.rashi, colX.rashi, textY);

    // Degree
    ctx.fillText(r.deg, colX.deg, textY);

    // Nakshatra
    ctx.fillText(r.nakshatra, colX.nakshatra, textY);

    // Status
    ctx.fillStyle = r.statusColor;
    ctx.font = 'bold 11px "Tiro Devanagari Hindi", serif';
    ctx.fillText(r.status, colX.status, textY);
  });

  ctx.restore();
}

/**
 * Word wrapper helper for canvas text blocks
 */
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(currentLine);
      currentLine = words[n];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Renders a magnificent Bhojpatra (Ancient Sacred Birch Bark) Vedic Patrika
 * onto an off-screen Canvas and compiles it into a high-fidelity PDF.
 */
export async function downloadBhojpatraPdf(options: BhojpatraPdfOptions): Promise<PdfResult> {
  await waitForPdfFonts();
  const { panchang, query, answer, activeKundali, locationName, date = new Date() } = options;
  const kundali: KundaliData | null = activeKundali || options.kundali || null;

  // Single-page A4 canvas at 150 DPI
  const width = PDF_PX_W;
  const height = PDF_PX_H;

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
  const outerPad = 30;
  ctx.strokeStyle = '#8b1e1e'; // Vermilion Vedic Red
  ctx.lineWidth = 5.5;
  ctx.strokeRect(outerPad, outerPad, width - outerPad * 2, height - outerPad * 2);

  const innerPad = 42;
  ctx.strokeStyle = '#c58f27'; // Antique Temple Gold
  ctx.lineWidth = 2.2;
  ctx.strokeRect(innerPad, innerPad, width - innerPad * 2, height - innerPad * 2);

  const subPad = 50;
  ctx.strokeStyle = 'rgba(139, 30, 30, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(subPad, subPad, width - subPad * 2, height - subPad * 2);

  // 3. Corner Ornamental Knots
  const drawCornerKnot = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#8b1e1e';
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('卐', 0, 0);
    ctx.restore();
  };
  drawCornerKnot(subPad + 14, subPad + 14);
  drawCornerKnot(width - subPad - 14, subPad + 14);
  drawCornerKnot(subPad + 14, height - subPad - 14);
  drawCornerKnot(width - subPad - 14, height - subPad - 14);

  const currentLang = (options.lang || 'hi').slice(0, 2).toLowerCase();

  // =========================================================================
  // IF KUNDALI DATA IS PROVIDED -> RENDER COMPLETE SACRED KUNDALI PATRIKA
  // =========================================================================
  if (kundali) {
    const analysis = analyzeKundali(kundali, currentLang);
    const lagnaLord = SIGN_LORDS[kundali.lagnaRashi] || '—';
    const moonLord = SIGN_LORDS[kundali.moonRashi] || '—';

    // 9th house sign and lord for Bhagya
    const bhagyaSign = RASHIS[((kundali.lagnaRashiNumber - 1 + 8) % 12)] || '—';
    const bhagyaLord = SIGN_LORDS[bhagyaSign] || '—';

    // Auspicious gemstone based on Lagna & Language
    const luckyGem = (() => {
      if (currentLang === 'en') {
        const enGem: Record<string, string> = {
          मेष: 'Red Coral (Moonga)',
          वृषभ: 'Diamond or Opal',
          मिथुन: 'Emerald (Panna)',
          कर्क: 'Natural Pearl (Moti)',
          सिंह: 'Ruby (Manikya)',
          कन्या: 'Emerald (Panna)',
          तुला: 'Diamond / White Sapphire',
          वृश्चिक: 'Red Coral (Moonga)',
          धनु: 'Yellow Sapphire (Pukhraj)',
          मकर: 'Blue Sapphire (Neelam)',
          कुंभ: 'Blue Sapphire or Amethyst',
          मीन: 'Yellow Sapphire (Pukhraj)',
        };
        return enGem[kundali.lagnaRashi] || 'Yellow Sapphire / Coral';
      }
      if (currentLang === 'gu') {
        const guGem: Record<string, string> = {
          मेष: 'લાલ પરવાળું (મૂંગા)',
          वृषभ: 'હીરો અથવા ઓપલ',
          मिथुन: 'પન્ના (Emerald)',
          कर्क: 'સાચું મોતી',
          सिंह: 'માણેક (રૂબી)',
          कन्या: 'પન્ના (Emerald)',
          तुला: 'હીરો / શ્વેત પોખરાજ',
          वृश्चिक: 'લાલ પરવાળું (મૂંગા)',
          धनु: 'પીળો પોખરાજ',
          मकर: 'નીલમ (Blue Sapphire)',
          कुंभ: 'નીલમ અથવા જાંબુડીયો (Amethyst)',
          मीन: 'પીળો પોખરાજ',
        };
        return guGem[kundali.lagnaRashi] || 'પોખરાજ / પરવાળું';
      }
      const GEMSTONE_MAP: Record<string, string> = {
        मेष: 'मूँगा (Red Coral)',
        वृषभ: 'हीरा अथवा ओपल (Diamond/Opal)',
        मिथुन: 'पन्ना (Emerald)',
        कर्क: 'सच्चा मोती (Natural Pearl)',
        सिंह: 'माणिक्य (Ruby)',
        कन्या: 'पन्ना (Emerald)',
        तुला: 'हीरा / श्वेत पुखराज (Diamond)',
        वृश्चिक: 'मूँगा (Red Coral)',
        धनु: 'पीला पुखराज (Yellow Sapphire)',
        मकर: 'नीलम (Blue Sapphire)',
        कुंभ: 'नीलम अथवा जमुनिया (Blue Sapphire)',
        मीन: 'पीला पुखराज (Yellow Sapphire)',
      };
      return GEMSTONE_MAP[kundali.lagnaRashi] || 'पुखराज / मूँगा';
    })();

    // Ishta Devta based on 5th house sign
    const fifthSign = RASHIS[((kundali.lagnaRashiNumber - 1 + 4) % 12)] || 'मेष';
    const fifthLord = SIGN_LORDS[fifthSign] || 'सूर्य';
    const ishtaDev = (() => {
      if (currentLang === 'en') {
        const enDeity: Record<string, string> = {
          सूर्य: 'Lord Surya Narayana / Mother Gayatri',
          चंद्र: 'Lord Shiva Shankar / Mother Parvati',
          मंगल: 'Sri Hanuman Ji / Lord Kartikeya',
          बुध: 'Lord Sri Ganesha / Sri Vishnu',
          गुरु: 'Lord Sri Hari Vishnu / Dattatreya',
          शुक्र: 'Maa Mahalakshmi / Sri Radha-Krishna',
          शनि: 'Sri Hanuman Ji / Lord Shiva / Shanidev',
        };
        return enDeity[fifthLord] || 'Lord Sri Hari Vishnu';
      }
      if (currentLang === 'gu') {
        const guDeity: Record<string, string> = {
          सूर्य: 'ભગવાન સૂર્ય નારાયણ / ગાયત્રી માતા',
          चंद्र: 'ભગવાન શિવ શંકર / માતા પાર્વતી',
          मंगल: 'શ્રી હનુમાનજી / ભગવાન કાર્તિકેય',
          बुध: 'ભગવાન શ્રી ગણેશ / શ્રી વિષ્ણુ',
          गुरु: 'ભગવાન શ્રી હરિ વિષ્ણુ / દત્તાત્રેય',
          शुक्र: 'માઁ મહાલક્ષ્મી / શ્રી રાધા-કૃષ્ણ',
          शनि: 'શ્રી હનુમાનજી / ભગવાન શિવ / શનિદેવ',
        };
        return guDeity[fifthLord] || 'ભગવાન શ્રી હરિ વિષ્ણુ';
      }
      const DEITY_MAP: Record<string, string> = {
        सूर्य: 'भगवान सूर्य नारायण / गायत्री माता',
        चंद्र: 'भगवान शिव शंकर / माता पार्वती',
        मंगल: 'श्री हनुमान जी / भगवान कार्तिकेय',
        बुध: 'भगवान श्री गणेश / श्री विष्णु',
        गुरु: 'भगवान श्री हरि विष्णु / दत्तात्रेय',
        शुक्र: 'माँ महालक्ष्मी / श्री राधा-कृष्ण',
        शनि: 'श्री हनुमान जी / भगवान शिव / शनिदेव',
      };
      return DEITY_MAP[fifthLord] || 'भगवान श्री हरि विष्णु';
    })();

    // 4. Header & Invocations (Sacred Sanskrit mantras kept intact)
    let cursorY = 82;
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 22px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥   •   ॥ ॐ कुलदेवताभ्यो नमः ॥   •   ॥ ॐ नमः शिवाय ॥', width / 2, cursorY);

    cursorY += 34;
    ctx.fillStyle = '#4a2505';
    ctx.font = 'bold 32px "Rozha One", "Tiro Devanagari Hindi", serif';
    const mainTitle = currentLang === 'en'
      ? '॥ Sri Shakti Vedic Janma-Kundali Chart & Complete Predictions ॥'
      : currentLang === 'gu'
      ? '॥ શ્રી શક્તિ વૈદિક જન્મ-કુંડળી ચક્ર અને સંપૂર્ણ ફળાદેશ ॥'
      : '॥ श्री शक्ति वैदिक जन्म-कुण्डली चक्र एवं सम्पूर्ण फलादेश ॥';
    ctx.fillText(mainTitle, width / 2, cursorY);

    cursorY += 24;
    ctx.fillStyle = '#7a4b18';
    ctx.font = '14.5px "Tiro Devanagari Hindi", serif';
    const subTitleText = currentLang === 'en'
      ? 'Authentic Lagna Chart (D-1), Navamsha (D-9), Planetary Longitudes, Vimshottari Dasha & Classical Guidance'
      : currentLang === 'gu'
      ? 'પ્રામાણિક લગ્ન કુંડળી (D-1), નવમાંશ ચક્ર (D-9), ગ્રહ સ્પષ્ટ, વિંશોત્તરી દશા અને શાસ્ત્ર-સંમત જીવન વિશ્લેષણ'
      : 'प्रामाणिक लग्न कुण्डली (D-1), नवमांश चक्र (D-9), ग्रह स्पष्ट, विंशोत्तरी दशा व शास्त्र-सम्मत जीवन विश्लेषण';
    ctx.fillText(subTitleText, width / 2, cursorY);

    // Ornate Divider
    cursorY += 20;
    ctx.strokeStyle = '#c58f27';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 280, cursorY);
    ctx.lineTo(width / 2 + 280, cursorY);
    ctx.stroke();

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 16px serif';
    ctx.fillText('❖   ॐ   卐   श्री   卐   ॐ   ❖', width / 2, cursorY + 5);

    // 5. Jatak & Janma Panchang Profile Strip
    cursorY += 20;
    const pBoxX = 72;
    const pBoxW = width - 144;
    const pBoxH = 92;

    ctx.fillStyle = 'rgba(255, 250, 238, 0.88)';
    ctx.fillRect(pBoxX, cursorY, pBoxW, pBoxH);
    ctx.strokeStyle = '#c58f27';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pBoxX, cursorY, pBoxW, pBoxH);

    // Profile Grid
    const birthDateObj = kundali.birthDate instanceof Date ? kundali.birthDate : new Date(kundali.birthDate);
    const dateLocale = currentLang === 'en' ? 'en-US' : currentLang === 'gu' ? 'gu-IN' : 'hi-IN';
    const dateStr = birthDateObj.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });

    ctx.fillStyle = '#3a1f0a';
    ctx.font = '13.5px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'left';

    const col1 = pBoxX + 18;
    const col2 = pBoxX + 285;
    const col3 = pBoxX + 575;
    const col4 = pBoxX + 850;

    const lblJatak = currentLang === 'en' ? 'Native' : currentLang === 'gu' ? 'જાતક' : 'जातक';
    const lblBirthPlace = currentLang === 'en' ? 'Birth Place' : currentLang === 'gu' ? 'જન્મ સ્થળ' : 'जन्म स्थान';
    const lblLagna = currentLang === 'en' ? 'Ascendant' : currentLang === 'gu' ? 'લગ્ન' : 'लग्न';
    const lblLord = currentLang === 'en' ? 'Lord' : currentLang === 'gu' ? 'સ્વામી' : 'स्वामी';
    const lblSunRashi = currentLang === 'en' ? 'Sun Sign' : currentLang === 'gu' ? 'સૂર્ય રાશિ' : 'सूर्य राशि';
    const lblBirthDate = currentLang === 'en' ? 'Birth Date' : currentLang === 'gu' ? 'જન્મ તારીખ' : 'जन्म तिथि';
    const lblCoords = currentLang === 'en' ? 'Coordinates' : currentLang === 'gu' ? 'અક્ષાંશ/રેખાંશ' : 'अक्षांश/रेखांश';
    const lblMoonRashi = currentLang === 'en' ? 'Moon Sign' : currentLang === 'gu' ? 'ચંદ્ર રાશિ' : 'चंद्र राशि';
    const lblManglik = currentLang === 'en' ? 'Manglik' : currentLang === 'gu' ? 'માંગલિક' : 'मांगलिक';
    const lblBirthTime = currentLang === 'en' ? 'Birth Time' : currentLang === 'gu' ? 'જન્મ સમય' : 'जन्म समय';
    const lblDayTithi = currentLang === 'en' ? 'Day & Tithi' : currentLang === 'gu' ? 'વાર અને તિથિ' : 'वार व तिथि';
    const lblNakshatra = currentLang === 'en' ? 'Nakshatra' : currentLang === 'gu' ? 'નક્ષત્ર' : 'नक्षत्र';
    const lblPada = currentLang === 'en' ? 'Pada' : currentLang === 'gu' ? 'ચરણ' : 'चरण';
    const lblGana = currentLang === 'en' ? 'Gana' : currentLang === 'gu' ? 'ગણ' : 'गण';
    const lblNadi = currentLang === 'en' ? 'Nadi' : currentLang === 'gu' ? 'નાડી' : 'नाड़ी';
    const lblVarna = currentLang === 'en' ? 'Varna' : currentLang === 'gu' ? 'વર્ણ' : 'वर्ण';

    const manglikVal = kundali.isManglik
      ? (currentLang === 'en' ? 'Yes (Manglik)' : currentLang === 'gu' ? 'હા (માંગલિક પ્રભાવ)' : 'हाँ (मांगलिक प्रभाव)')
      : (currentLang === 'en' ? 'No (Dosha Free)' : currentLang === 'gu' ? 'ના (દોષ મુક્ત)' : 'नहीं (दोष मुक्त)');

    let rY = cursorY + 24;
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
    ctx.fillText(`${lblJatak}: ${kundali.name}`, col1, rY);
    ctx.font = '13.5px "Tiro Devanagari Hindi", serif';
    ctx.fillStyle = '#3a1f0a';
    ctx.fillText(`${lblBirthPlace}: ${kundali.birthPlace}`, col2, rY);
    ctx.fillText(`${lblLagna}: ${trRashi(kundali.lagnaRashi, currentLang)} (${lblLord}: ${trPlanet(lagnaLord, currentLang)})`, col3, rY);
    ctx.fillText(`${lblSunRashi}: ${trRashi(kundali.sunRashi, currentLang)}`, col4, rY);

    rY += 24;
    ctx.fillText(`${lblBirthDate}: ${dateStr}`, col1, rY);
    ctx.fillText(`${lblCoords}: ${kundali.latitude.toFixed(2)}°N, ${kundali.longitude.toFixed(2)}°E`, col2, rY);
    ctx.fillText(`${lblMoonRashi}: ${trRashi(kundali.moonRashi, currentLang)} (${lblLord}: ${trPlanet(moonLord, currentLang)})`, col3, rY);
    ctx.fillText(`${lblManglik}: ${manglikVal}`, col4, rY);

    rY += 24;
    ctx.fillText(`${lblBirthTime}: ${kundali.birthTime}`, col1, rY);
    ctx.fillText(`${lblDayTithi}: ${trWeekday(panchang.weekday, currentLang)} | ${trVedic(panchang.paksha, currentLang)} ${trVedic(panchang.tithi, currentLang)}`, col2, rY);
    ctx.fillText(`${lblNakshatra}: ${trVedic(kundali.nakshatra, currentLang)} (${lblPada} ${kundali.charan})`, col3, rY);
    ctx.fillText(`${lblGana}: ${trVedic(kundali.gana, currentLang)} | ${lblNadi}: ${trVedic(kundali.nadi, currentLang)} | ${lblVarna}: ${trVedic(kundali.varna, currentLang)}`, col4, rY);

    // 6. Visual Kundali Charts & Graha Spashta Table Section
    cursorY += pBoxH + 34;
    const chartSize = 310;
    const chartCenterY = cursorY + chartSize / 2;

    const d1Title = currentLang === 'en'
      ? '॥ Lagna Kundali Chart (D-1) ॥'
      : currentLang === 'gu'
      ? '॥ લગ્ન કુંડળી ચક્ર (D-1) ॥'
      : '॥ लग्न कुण्डली चक्र (D-1) ॥';
    const d1Sub = currentLang === 'en'
      ? `Ascendant: ${trRashi(kundali.lagnaRashi, 'en')} (${kundali.lagnaRashiNumber}) • Tanu Bhava`
      : currentLang === 'gu'
      ? `લગ્ન: ${trRashi(kundali.lagnaRashi, 'gu')} (${kundali.lagnaRashiNumber}) • તનુ ચક્ર`
      : `लग्न: ${kundali.lagnaRashi} (${kundali.lagnaRashiNumber}) • तनु चक्र`;

    const d9Title = currentLang === 'en'
      ? '॥ Navamsha Kundali Chart (D-9) ॥'
      : currentLang === 'gu'
      ? '॥ નવમાંશ કુંડળી ચક્ર (D-9) ॥'
      : '॥ नवमांश कुण्डली चक्र (D-9) ॥';
    const d9Sub = currentLang === 'en'
      ? 'Atmakaraka, Fortune & Marital Potential'
      : currentLang === 'gu'
      ? 'આત્મકારક, ભાગ્ય અને વૈવાહિક સામર્થ્ય'
      : 'आत्मकारक, भाग्य एवं वैवाहिक सामर्थ्य';

    // D-1 Lagna Chart
    drawNorthIndianDiamondChart(ctx, 230, chartCenterY, chartSize, 1, kundali, d1Title, d1Sub, currentLang);

    // D-9 Navamsha Chart
    drawNorthIndianDiamondChart(ctx, 575, chartCenterY, chartSize, 9, kundali, d9Title, d9Sub, currentLang);

    // Graha Spashta & Dignity Table
    drawGrahaSpashtaTable(ctx, 755, cursorY, width - 755 - 72, chartSize, kundali, currentLang);

    // 7. Vimshottari Dasha & Planetary Friendship Banner
    cursorY += chartSize + 32;
    const dBoxH = 64;
    ctx.fillStyle = 'rgba(255, 248, 230, 0.9)';
    ctx.fillRect(pBoxX, cursorY, pBoxW, dBoxH);
    ctx.strokeStyle = '#8b1e1e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pBoxX, cursorY, pBoxW, dBoxH);

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'left';

    const dashaBannerText = currentLang === 'en'
      ? `★ Current Vimshottari Dasha:  ${trPlanet(kundali.mahadasha, 'en')} Mahadasha  ➔  ${trPlanet(kundali.antardasha, 'en')} Antardasha  ➔  ${trPlanet(kundali.pratyantardasha, 'en')} Pratyantar Dasha`
      : currentLang === 'gu'
      ? `★ વર્તમાન વિંશોત્તરી દશા:  ${trPlanet(kundali.mahadasha, 'gu')} મહાદશા  ➔  ${trPlanet(kundali.antardasha, 'gu')} અંતર્દશા  ➔  ${trPlanet(kundali.pratyantardasha, 'gu')} પ્રત્યંતર દશા`
      : `★ वर्तमान विंशोत्तरी दशा:  ${kundali.mahadasha} महादशा  ➔  ${kundali.antardasha} अंतर्दशा  ➔  ${kundali.pratyantardasha} प्रत्यंतर दशा`;
    ctx.fillText(dashaBannerText, pBoxX + 16, cursorY + 24);

    ctx.fillStyle = '#4a2505';
    ctx.font = '13px "Tiro Devanagari Hindi", serif';
    const formulaText = currentLang === 'en'
      ? `Key Planetary Formulas:  Ascendant Lord: ${trPlanet(lagnaLord, 'en')}  |  Fortune Lord (9th): ${trPlanet(bhagyaLord, 'en')}  |  Ishta Devta: ${ishtaDev}  |  Lucky Gem: ${luckyGem}  |  Key Yoga: ${analysis.yogas[0] || 'Raj Yoga'}`
      : currentLang === 'gu'
      ? `પ્રમુખ ગ્રહીય સૂત્રો:  લગ્ન સ્વામી: ${trPlanet(lagnaLord, 'gu')}  |  ભાગ્યેશ (9th): ${trPlanet(bhagyaLord, 'gu')}  |  ઇષ્ટ દેવ: ${ishtaDev}  |  શુભ રત્ન: ${luckyGem}  |  મુખ્ય યોગ: ${analysis.yogas[0] || 'શુભ રાજયોગ'}`
      : `प्रमुख ग्रहीय सूत्र:  लग्न स्वामी: ${lagnaLord}  |  भाग्येश (9th): ${bhagyaLord}  |  इष्ट देव: ${ishtaDev}  |  शुभ रत्न: ${luckyGem}  |  मुख्य योग: ${analysis.yogas[0] || 'शुभ राजयोग'}`;
    ctx.fillText(formulaText, pBoxX + 16, cursorY + 48);

    // 8. Bento Shastra-Sammat Predictions & Remedies (4 Classical Quadrants)
    cursorY += dBoxH + 18;
    const bentoW = (pBoxW - 20) / 2; // ~535 px
    const bentoH = 345;

    const bento1X = pBoxX;
    const bento2X = pBoxX + bentoW + 20;

    const careerArea = analysis.areas.find((x) => x.id === 'career');
    const financeArea = analysis.areas.find((x) => x.id === 'finance');
    const marriageArea = analysis.areas.find((x) => x.id === 'marriage');
    const healthArea = analysis.areas.find((x) => x.id === 'health');

    // Helper to draw a rich Bento Card
    const drawBentoCard = (
      bx: number,
      by: number,
      title: string,
      tag: string,
      lines: { label: string; text: string }[]
    ) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 252, 245, 0.88)';
      ctx.fillRect(bx, by, bentoW, bentoH);
      ctx.strokeStyle = '#c58f27';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(bx, by, bentoW, bentoH);

      // Top title bar
      ctx.fillStyle = 'rgba(92, 58, 33, 0.08)';
      ctx.fillRect(bx, by, bentoW, 32);
      ctx.strokeStyle = '#c58f27';
      ctx.beginPath();
      ctx.moveTo(bx, by + 32);
      ctx.lineTo(bx + bentoW, by + 32);
      ctx.stroke();

      ctx.fillStyle = '#8b1e1e';
      ctx.font = 'bold 14.5px "Tiro Devanagari Hindi", serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, bx + 14, by + 21);

      ctx.fillStyle = '#7a4b18';
      ctx.font = 'bold 11.5px "Tiro Devanagari Hindi", serif';
      ctx.textAlign = 'right';
      ctx.fillText(tag, bx + bentoW - 14, by + 21);

      // Body lines
      let curLineY = by + 50;
      ctx.textAlign = 'left';

      lines.forEach(({ label, text }) => {
        if (!text) return;
        ctx.fillStyle = '#8b1e1e';
        ctx.font = 'bold 12.5px "Tiro Devanagari Hindi", serif';
        ctx.fillText(`• ${label}:`, bx + 14, curLineY);

        ctx.fillStyle = '#2a1402';
        ctx.font = '12px "Tiro Devanagari Hindi", serif';
        const indentX = bx + 22;
        curLineY += 18;

        const wrapped = wrapLines(ctx, text, bentoW - 36);
        wrapped.forEach((w) => {
          if (curLineY < by + bentoH - 12) {
            ctx.fillText(w, indentX, curLineY);
            curLineY += 18;
          }
        });
        curLineY += 6;
      });

      ctx.restore();
    };

    // Bento 1: Personality
    const bento1Title = currentLang === 'en' ? '1. Personality, Nature & Physical Build' : currentLang === 'gu' ? '૧. વ્યક્તિત્વ, સ્વભાવ અને શારીરિક બંધારણ' : '१. व्यक्तित्व, स्वभाव एवं शारीरिक गठन';
    const bento1Tag = currentLang === 'en' ? 'Body & Mind' : currentLang === 'gu' ? 'તનુ અને માનસ વિચાર' : 'तनु व मानस विचार';
    const bento1Lines = currentLang === 'en'
      ? [
          {
            label: 'Ascendant & Moon Influence',
            text: `${kundali.name} was born in ${trRashi(kundali.lagnaRashi, 'en')} ascendant and ${trRashi(kundali.moonRashi, 'en')} moon sign. Ascendant lord ${trPlanet(lagnaLord, 'en')} bestows diligence, foresight and confidence.`,
          },
          {
            label: 'Nakshatra & Nature',
            text: `Under nakshatra ${trVedic(kundali.nakshatra, 'en')} (pada ${kundali.charan}), the native possesses sharp intellect, dignity, and patience in overcoming obstacles.`,
          },
          {
            label: 'Health & Vitality',
            text: healthArea?.finding ? `${healthArea.finding} ${healthArea.caution || ''}` : 'Vital energy remains strong. Maintain balance in seasonal diets and daily routine.',
          },
        ]
      : currentLang === 'gu'
      ? [
          {
            label: 'લગ્ન અને રાશિ પ્રભાવ',
            text: `${kundali.name}નો જન્મ ${trRashi(kundali.lagnaRashi, 'gu')} લગ્ન અને ${trRashi(kundali.moonRashi, 'gu')} ચંદ્ર રાશિમાં થયો છે. લગ્ન સ્વામી ${trPlanet(lagnaLord, 'gu')} જાતકને કર્મઠ, દીર્ઘદ્રષ્ટા અને આત્મવિશ્વાસુ બનાવે છે.`,
          },
          {
            label: 'નક્ષત્ર અને માનસિક સ્વભાવ',
            text: `નક્ષત્ર ${trVedic(kundali.nakshatra, 'gu')} (ચરણ ${kundali.charan})ના પ્રભાવથી જાતક તીક્ષ્ણ બુદ્ધિ, સ્વાભિમાની અને વિષમ પરિસ્થિતિઓમાં પણ ધૈર્યપૂર્વક માર્ગ બનાવવાની ક્ષમતા ધરાવે છે.`,
          },
          {
            label: 'સ્વાસ્થ્ય અને શારીરિક બળ',
            text: healthArea?.finding ? `${healthArea.finding} ${healthArea.caution || ''}` : 'સામાન્ય રીતે જીવનશક્તિ ઉત્તમ રહેશે. મોસમી આહાર અને પિત્ત-વાત સંતુલન પર ધ્યાન આપવું.',
          },
        ]
      : [
          {
            label: 'लग्न एवं राशि प्रभाव',
            text: `${kundali.name} का जन्म ${kundali.lagnaRashi} लग्न एवं ${kundali.moonRashi} चंद्र राशि में हुआ है। लग्न स्वामी ${lagnaLord} की स्थिति जातक को कर्मठ, दूरदर्शी और आत्मविश्वासी बनाती है।`,
          },
          {
            label: 'नक्षत्र व मानसिक स्वभाव',
            text: `नक्षत्र ${kundali.nakshatra} (चरण ${kundali.charan}) के प्रभाव से जातक तीक्ष्ण बुद्धि, स्वाभिमानी तथा विषम परिस्थितियों में भी धैर्यपूर्वक मार्ग प्रशस्त करने की क्षमता रखता है।`,
          },
          {
            label: 'स्वास्थ्य व शारीरिक बल',
            text: healthArea?.finding ? `${healthArea.finding} ${healthArea.caution || ''}` : 'सामान्यतः जीवनशक्ति उत्तम रहेगी। मौसमी विकारों और पित्त-वात संतुलन पर ध्यान दें।',
          },
        ];
    drawBentoCard(bento1X, cursorY, bento1Title, bento1Tag, bento1Lines);

    // Bento 2: Career & Wealth
    const bento2Title = currentLang === 'en' ? '2. Career, Wealth & Livelihood' : currentLang === 'gu' ? '૨. કાર્યક્ષેત્ર, ધન-વૈભવ અને આજીવિકા' : '२. कार्यक्षेत्र, धन-वैभव एवं आजीविका';
    const bento2Tag = currentLang === 'en' ? 'Karma & Wealth' : currentLang === 'gu' ? 'કર્મ અને અર્થ લાભ' : 'कर्म व अर्थ लाभ';
    const bento2Lines = currentLang === 'en'
      ? [
          {
            label: 'Career Direction',
            text: careerArea?.finding ? `${careerArea.finding} (Reason: ${careerArea.why})` : 'Combinations of 10th house and ascendant lord bestow special renown in administrative, technical, business, or independent ventures.',
          },
          {
            label: 'Wealth Accumulation',
            text: financeArea?.finding || 'Combinations of 2nd (wealth) and 11th (gains) houses indicate strong financial stability and property accumulation.',
          },
          {
            label: 'Timing & Caution',
            text: careerArea?.caution || 'Take major commercial and financial decisions during auspicious transits with prayer.',
          },
        ]
      : currentLang === 'gu'
      ? [
          {
            label: 'આજીવિકા અને કારકિર્દી દિશા',
            text: careerArea?.finding ? `${careerArea.finding} (કારણ: ${careerArea.why})` : 'દશમ ભાવ અને લગ્ન સ્વામીના પ્રભાવથી વહીવટી, ટેકનિકલ, વ્યાપારિક અથવા સ્વતંત્ર સાહસમાં વિશેષ ખ્યાતિ પ્રાપ્ત થશે.',
          },
          {
            label: 'ધન સંચય અને આર્થિક યોગ',
            text: financeArea?.finding ? financeArea.finding : 'દ્વિતીય (ધન) અને એકાદશ (લાભ) ભાવના યોગથી મધ્યમ આયુ પછી સુદૃઢ આર્થિક સ્થિરતા અને ભૂમિ-ભવન લાભના યોગ છે.',
          },
          {
            label: 'સમય અને નિર્ણય સાવચેતી',
            text: careerArea?.caution || 'મહત્વપૂર્ણ વ્યાવસાયિક અને નાણાકીય નિર્ણયો શુભ ગોચર અને ઇષ્ટ સ્મરણ સાથે લેવા.',
          },
        ]
      : [
          {
            label: 'आजीविका व करियर दिशा',
            text: careerArea?.finding ? `${careerArea.finding} (कारण: ${careerArea.why})` : 'दशम भाव व लग्न स्वामी के प्रभाव से प्रशासनिक, तकनीकी, व्यापारिक अथवा स्वतंत्र उद्यम में विशेष ख्याति प्राप्त होगी।',
          },
          {
            label: 'धन संचय व आर्थिक योग',
            text: financeArea?.finding ? financeArea.finding : 'द्वितीय (धन) एवं एकादश (आय) भाव के योग से मध्यम आयु के उपरांत सुदृढ़ आर्थिक स्थिरता एवं भूमि-भवन लाभ के योग हैं।',
          },
          {
            label: 'समय व निर्णय सावधानी',
            text: careerArea?.caution || 'महत्त्वपूर्ण व्यावसायिक व वित्तीय निर्णय सदैव शुभ गोचर व इष्ट स्मरण से लें।',
          },
        ];
    drawBentoCard(bento2X, cursorY, bento2Title, bento2Tag, bento2Lines);

    // Row 2 of Bento Cards
    cursorY += bentoH + 16;

    // Bento 3: Marriage & Family
    const bento3Title = currentLang === 'en' ? '3. Married Life, Family & Fortune' : currentLang === 'gu' ? '૩. દાંપત્ય જીવન, પરિવાર અને ભાગ્ય પક્ષ' : '३. दांपत्य जीवन, परिवार एवं भाग्य पक्ष';
    const bento3Tag = currentLang === 'en' ? '7th & 9th Fruit' : currentLang === 'gu' ? 'સપ્તમ અને નવમ ફળ' : 'सप्तम व नवम फल';
    const bento3Lines = currentLang === 'en'
      ? [
          {
            label: 'Marital & Family Joy',
            text: marriageArea?.finding || 'Favorable 7th house and Navamsha D-9 indicate cooperation from a cultured life partner. Open communication enhances harmony.',
          },
          {
            label: 'Manglik & Dosha Analysis',
            text: kundali.isManglik
              ? 'Manglik influence is present; matching horoscopes and propitiation rituals are recommended.'
              : 'Horoscope is free from Manglik dosha. Family life is peaceful and affectionate.',
          },
          {
            label: 'Fortune Lord & Rise',
            text: `Fortune house lord is ${trPlanet(bhagyaLord, 'en')}. Destiny strengthens through hard work, elders’ blessings, and righteous deeds.`,
          },
        ]
      : currentLang === 'gu'
      ? [
          {
            label: 'વૈવાહિક અને પારિવારિક સુખ',
            text: marriageArea?.finding || 'સપ્તમ ભાવ અને નવમાંશ ચક્ર D-9 ની અનુકૂળતાથી યોગ્ય અને સંસ્કારી જીવનસાથીનો સહયોગ મળશે. પરસ્પર સંવાદથી સુખમાં વૃદ્ધિ થશે.',
          },
          {
            label: 'માંગલિક અને દોષ વિચાર',
            text: kundali.isManglik
              ? 'કુંડળીમાં માંગલિક પ્રભાવ ઉપસ્થિત છે; તેથી વિવાહમાં કુંડળી મિલન અને મંગળ શાંતિ અનુષ્ઠાન શાસ્ત્રસંમત શ્રેયસ્કર છે.'
              : 'કુંડળી માંગલિક દોષથી મુક્ત છે. પારિવારિક જીવન સામાન્ય રીતે સૌહાર્દપૂર્ણ અને સુખદ રહેશે.',
          },
          {
            label: 'ભાગ્યેશ અને ભાગ્યોદય',
            text: `ભાગ્ય ભાવના સ્વામી ${trPlanet(bhagyaLord, 'gu')} છે. જાતકનો ભાગ્યોદય કર્મઠતા, ગુરુજનોના આશીર્વાદ અને તીર્થયાત્રાથી તીવ્રતા પ્રાપ્ત કરશે.`,
          },
        ]
      : [
          {
            label: 'वैवाहिक व पारिवारिक सुख',
            text: marriageArea?.finding || 'सप्तम भाव व नवमांश चक्र D-9 की अनुकूलता से योग्य एवं संस्कारी जीवनसाथी का सहयोग मिलेगा। पारस्परिक संवाद से सुख में वृद्धि होगी।',
          },
          {
            label: 'मांगलिक व दोष विचार',
            text: kundali.isManglik
              ? 'कुंडली में मांगलिक प्रभाव उपस्थित है; अतः विवाह में कुंडली मिलान एवं मंगल शांति अनुष्ठान शास्त्रसम्मत श्रेयस्कर है।'
              : 'कुंडली मांगलिक दोष से मुक्त है। पारिवारिक जीवन सामान्यतः सौहार्दपूर्ण व प्रीतिकर रहेगा।',
          },
          {
            label: 'भाग्येश व भाग्य उदय',
            text: `भाग्य भाव के स्वामी ${bhagyaLord} हैं। जातक का भाग्योदय कर्मठता, गुरुजनों के आशीर्वाद एवं तीर्थाटन से तीव्रता प्राप्त करेगा।`,
          },
        ];
    drawBentoCard(bento1X, cursorY, bento3Title, bento3Tag, bento3Lines);

    // Bento 4: Vedic Remedies
    const bento4Title = currentLang === 'en' ? '4. Vedic Remedies, Gemstone & Worship' : currentLang === 'gu' ? '૪. અચૂક વૈદિક ઉપાય, રત્ન અને ઇષ્ટ આરાધના' : '४. अचूक वैदिक उपाय, रत्न एवं इष्ट आराधना';
    const bento4Tag = currentLang === 'en' ? 'Classical Welfare Code' : currentLang === 'gu' ? 'શાસ્ત્રીય કલ્યાણ સૂત્ર' : 'शास्त्रीय कल्याण सूत्र';
    const bento4Lines = currentLang === 'en'
      ? [
          {
            label: 'Auspicious Gemstone',
            text: `For strengthening ascendant and fortune, wearing ${luckyGem} under qualified astrological guidance in an auspicious muhurat is beneficial.`,
          },
          {
            label: 'Ishta Devta & Prayer',
            text: `Daily worship of ${ishtaDev}, lighting a ghee lamp, and regular chanting of Gayatri Mantra or Om Namah Shivaya (1 mala daily) brings peace.`,
          },
          {
            label: 'Daily Benefic Deeds',
            text: careerArea?.remedy || 'Feed birds and cows, seek elders’ blessings before beginning the day, and practice charity.',
          },
        ]
      : currentLang === 'gu'
      ? [
          {
            label: 'શુભ રત્ન પરામર્શ',
            text: `લગ્ન અને ભાગ્ય બળ સંવર્ધન માટે ${luckyGem} કોઈ યોગ્ય જ્યોતિષીના માર્ગદર્શનમાં શુભ મુહૂર્તમાં ધારણ કરવું કલ્યાણકારી રહેશે.`,
          },
          {
            label: 'ઇષ્ટ દેવ અને ઉપાસના',
            text: `દરરોજ ${ishtaDev}ની આરાધના, ધૂપ-દીપ દર્શન અને ગાયત્રી મંત્ર અથવા ૐ નમઃ શિવાયનો ૧ માળા નિત્ય જપ કરવો.`,
          },
          {
            label: 'દૈનિક કલ્યાણકારી ઉપાય',
            text: careerArea?.remedy || 'પક્ષીઓને ચણ-પાણી આપવું, માતા-પિતાના ચરણ સ્પર્શ કરી દિવસની શરૂઆત કરવી અને ગૌસેવા કરવી.',
          },
        ]
      : [
          {
            label: 'शुभ रत्न परामर्श',
            text: `लग्न व भाग्य बल संवर्धन हेतु ${luckyGem} किसी योग्य ज्योतिर्विद के मार्गदर्शन में शुभ मुहूर्त में धारण करना कल्याणकारी रहेगा।`,
          },
          {
            label: 'इष्ट देव व उपासना',
            text: `प्रतिदिन ${ishtaDev} की आराधना, धूप-दीप दर्शन एवं गायत्री मंत्र अथवा ॐ नमः शिवाय का 1 माला नित्य जप करें।`,
          },
          {
            label: 'दैनिक कल्याणकारी उपाय',
            text: careerArea?.remedy || 'पक्षियों को अन्न-जल दें, माता-पिता के चरण स्पर्श कर दिन का आरम्भ करें एवं गौसेवा करें।',
          },
        ];
    drawBentoCard(bento2X, cursorY, bento4Title, bento4Tag, bento4Lines);

    // 9. Sacred Vedic Blessings & Seal at Bottom
    const footerY = height - 88;
    ctx.strokeStyle = '#c58f27';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pBoxX, footerY - 14);
    ctx.lineTo(width - pBoxX, footerY - 14);
    ctx.stroke();

    // Sacred Seal / Stamp
    ctx.save();
    ctx.strokeStyle = '#8b1e1e';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(pBoxX + 42, footerY + 18, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ॐ', pBoxX + 42, footerY + 16);
    ctx.font = 'bold 8.5px "Tiro Devanagari Hindi", serif';
    const stampLabel = currentLang === 'en' ? 'Certified' : currentLang === 'gu' ? 'પ્રમાણિત' : 'प्रमाणित';
    ctx.fillText(stampLabel, pBoxX + 42, footerY + 29);
    ctx.restore();

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 16.5px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ शुभम् भवतु • कल्याणमस्तु • सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥', width / 2 + 25, footerY + 12);

    ctx.fillStyle = '#7a4b18';
    ctx.font = '12px "Tiro Devanagari Hindi", serif';
    const instFooter = currentLang === 'en'
      ? 'Shri Shakti Panchang Sansthan • Handcrafted Bhojpatra Janma-Patrika by Uma Vedic Astrology Research'
      : currentLang === 'gu'
      ? 'શ્રી શક્તિ પંચાંગ સંસ્થાન • ઉમા દિવ્ય વૈદિક જ્યોતિષ શોધપીઠ દ્વારા મુદ્રિત હસ્તનિર્મિત ભોજપત્ર જન્મ-પત્રિકા'
      : 'श्री शक्ति पंचांग संस्थान • उमा दिव्य वैदिक ज्योतिष शोधपीठ द्वारा मुद्रित हस्तनिर्मित भोजपत्र जन्म-पत्रिका';
    ctx.fillText(instFooter, width / 2 + 25, footerY + 32);
  } else {
    // =========================================================================
    // GENERAL PANCHANG Q&A CONSULTATION LAYOUT (BACKWARD COMPATIBILITY)
    // =========================================================================
    let cursorY = 95;

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 26px "Tiro Devanagari Hindi", "Rozha One", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥', width / 2, cursorY);

    cursorY += 42;
    ctx.fillStyle = '#4a2505';
    ctx.font = 'bold 36px "Rozha One", "Tiro Devanagari Hindi", serif';
    ctx.fillText(
      currentLang === 'en'
        ? 'Shakti Panchang — Uma Divine Guidance Scroll'
        : currentLang === 'gu'
        ? '॥ શ્રી શક્તિ પંચાંગ - ઉમા દિવ્ય માર્ગદર્શન પત્રિકા ॥'
        : '॥ श्री शक्ति पंचांग - उमा दिव्य मार्गदर्शन पत्रिका ॥',
      width / 2,
      cursorY
    );

    cursorY += 26;
    ctx.fillStyle = '#7a4b18';
    ctx.font = 'italic 18px "Tiro Devanagari Hindi", serif';
    ctx.fillText(
      currentLang === 'en'
        ? 'Vedic Astrology, Panchang, Auspicious Muhurat & Sanatan Shastra Consultation'
        : currentLang === 'gu'
        ? 'વૈદિક જ્યોતિષ, પંચાંગ, શુભાશુભ મુહૂર્ત અને સનાતન પરાવિદ્યા પરામર્શ'
        : 'वैदिक ज्योतिष, पंचांग, शुभाशुभ मुहूर्त एवं सनातन पराविद्या परामर्श',
      width / 2,
      cursorY
    );

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

    cursorY += 36;
    const pBoxX = 75;
    const pBoxW = width - 150;
    const pBoxH = 150;

    ctx.fillStyle = 'rgba(255, 248, 230, 0.75)';
    ctx.fillRect(pBoxX, cursorY, pBoxW, pBoxH);
    ctx.strokeStyle = '#c58f27';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pBoxX, cursorY, pBoxW, pBoxH);

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 16px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      currentLang === 'en'
        ? 'Daily Vedic Panchang Details'
        : currentLang === 'gu'
        ? '॥ દૈનિક વૈદિક પંચાંગ વિગતો ॥'
        : '॥ दैनिक वैदिक पंचांग विवरण ॥',
      pBoxX + 16,
      cursorY + 26
    );

    ctx.fillStyle = '#3a1f0a';
    ctx.font = '15px "Tiro Devanagari Hindi", serif';

    const col1X = pBoxX + 20;
    const col2X = pBoxX + 320;
    const col3X = pBoxX + 630;
    const col4X = pBoxX + 870;

    const dateLocale = currentLang === 'en' ? 'en-US' : currentLang === 'gu' ? 'gu-IN' : 'hi-IN';
    const dateStr = date.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });

    const lbl = (hi: string, en: string, gu: string) =>
      currentLang === 'en' ? en : currentLang === 'gu' ? gu : hi;

    let rY = cursorY + 54;
    ctx.fillText(`${lbl('दिनांक', 'Date', 'તારીખ')}: ${dateStr} (${trWeekday(panchang.weekday, currentLang)})`, col1X, rY);
    ctx.fillText(`${lbl('तिथि', 'Tithi', 'તિથિ')}: ${trVedic(panchang.paksha, currentLang)} ${trVedic(panchang.tithi, currentLang)}`, col2X, rY);
    ctx.fillText(`${lbl('नक्षत्र', 'Nakshatra', 'નક્ષત્ર')}: ${trVedic(panchang.nakshatra, currentLang)} (${lbl('चरण', 'Pada', 'ચરણ')} ${panchang.pada})`, col3X, rY);
    ctx.fillText(`${lbl('स्थान', 'Location', 'સ્થળ')}: ${locationName || lbl('अयोध्या / दिल्ली', 'Ayodhya / Delhi', 'અયોધ્યા / દિલ્હી')}`, col4X, rY);

    rY += 28;
    ctx.fillText(`${lbl('योग', 'Yoga', 'યોગ')}: ${trVedic(panchang.yoga, currentLang)}`, col1X, rY);
    ctx.fillText(`${lbl('करण', 'Karana', 'કરણ')}: ${trVedic(panchang.karana, currentLang)}`, col2X, rY);
    ctx.fillText(`${lbl('संवत्', 'Samvat', 'સંવત')}: ${trVedic(panchang.samvat, currentLang)}`, col3X, rY);
    ctx.fillText(`${lbl('सूर्य राशि', 'Sun Sign', 'સૂર્ય રાશિ')}: ${trRashi(panchang.solarRashi, currentLang)}`, col4X, rY);

    rY += 28;
    const fmtT = (d: Date) => d.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(`${lbl('सूर्योदय', 'Sunrise', 'સૂર્યોદય')}: ${fmtT(panchang.solar.sunrise)} | ${lbl('सूर्यास्त', 'Sunset', 'સૂર્યાસ્ત')}: ${fmtT(panchang.solar.sunset)}`, col1X, rY);
    ctx.fillText(`${lbl('चंद्र राशि', 'Moon Sign', 'ચંદ્ર રાશિ')}: ${trRashi(panchang.lunarRashi, currentLang)}`, col2X, rY);
    const dishaStr =
      panchang.weekday === 'रविवार'
        ? lbl('पश्चिम', 'West', 'પશ્ચિમ')
        : panchang.weekday === 'सोमवार'
        ? lbl('पूर्व', 'East', 'પૂર્વ')
        : lbl('सम्बन्धित दिशा', 'As per day', 'દિવસ મુજબ');
    ctx.fillText(`${lbl('दिशाशूल', 'Dishashool', 'દિશાશૂળ')}: ${dishaStr}`, col3X, rY);
    ctx.fillText(`${lbl('अंकन समय', 'Issued', 'સમય')}: ${timeStr}`, col4X, rY);

    cursorY += pBoxH + 30;

    if (query) {
      ctx.fillStyle = '#8b1e1e';
      ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        lbl('॥ जातक जिज्ञासा व प्रश्न ॥', 'Native Query & Question', '॥ જાતક જિજ્ઞાસા અને પ્રશ્ન ॥'),
        pBoxX,
        cursorY
      );

      cursorY += 12;
      ctx.fillStyle = '#2d1403';
      ctx.font = 'italic 16px "Tiro Devanagari Hindi", serif';
      const cleanQuery = query.replace(/\n/g, ' ');
      ctx.fillText(`“${cleanQuery}”`, pBoxX + 12, cursorY + 16);

      cursorY += 36;
    }

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 20px "Tiro Devanagari Hindi", serif';
    ctx.fillText(
      lbl(
        '॥ उमा दिव्य मार्गदर्शन व शास्त्र-सम्मत निर्णय ॥',
        'Uma Divine Guidance & Scriptural Verdict',
        '॥ ઉમા દિવ્ય માર્ગદર્શન અને શાસ્ત્ર-સંમત નિર્ણય ॥'
      ),
      pBoxX,
      cursorY
    );

    cursorY += 14;
    ctx.strokeStyle = '#c58f27';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pBoxX, cursorY);
    ctx.lineTo(width - pBoxX, cursorY);
    ctx.stroke();

    cursorY += 24;

    ctx.fillStyle = '#2a1403';
    ctx.font = '16px "Tiro Devanagari Hindi", serif';
    const maxWidth = width - pBoxX * 2 - 20;
    const lineHeight = 26;

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

          if (cursorY > height - 160) break;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine && cursorY <= height - 160) {
        ctx.fillText(currentLine, pBoxX + 8, cursorY);
        cursorY += lineHeight;
      }
    }

    const footerY = height - 100;
    ctx.strokeStyle = '#c58f27';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pBoxX, footerY - 20);
    ctx.lineTo(width - pBoxX, footerY - 20);
    ctx.stroke();

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
    const stampLabel = lbl('प्रमाणित', 'Certified', 'પ્રમાણિત');
    ctx.fillText(stampLabel, pBoxX + 45, footerY + 30);
    ctx.restore();

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ शुभम् भवतु • कल्याणमस्तु • धर्मो रक्षति रक्षितः ॥', width / 2 + 30, footerY + 10);

    ctx.fillStyle = '#7a4b18';
    ctx.font = '13px "Tiro Devanagari Hindi", serif';
    ctx.fillText(
      lbl(
        'श्री शक्ति पंचांग संस्थान | उमा एआई वैदिक ज्योतिष प्रणाली द्वारा मुद्रित भोजपत्र पत्रिका',
        'Shri Shakti Panchang Sansthan | Handcrafted Bhojpatra Patrika via Uma Vedic System',
        'શ્રી શક્તિ પંચાંગ સંસ્થાન | ઉમા વૈદિક જ્યોતિષ પ્રણાલી દ્વારા મુદ્રિત ભોજપત્ર પત્રિકા'
      ),
      width / 2 + 30,
      footerY + 32
    );
  }

  // 10. Compile Canvas to high-res PDF with jsPDF
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PDF_MM_W, PDF_MM_H],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, PDF_MM_W, PDF_MM_H, undefined, 'FAST');
  const dateObj = date instanceof Date ? date : new Date(date || Date.now());
  const dateIso = !isNaN(dateObj.getTime()) ? dateObj.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  const stampLabelDefault = currentLang === 'en' ? 'Vedic_Kundali' : currentLang === 'gu' ? 'વૈદિક_જન્મ_પત્રિકા' : 'वैदिक_जन्म_पत्रिका';
  const sanitizedTitle = (options.title || (kundali ? `${stampLabelDefault}_${kundali.name}` : 'Bhojpatra_Patrika'))
    .replace(/[^\w\u0900-\u097F\u0A80-\u0AFF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const fileName = `${sanitizedTitle}_${dateIso}.pdf`;
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // 1. Direct jsPDF download (safest across all mobile and iframe environments)
  try {
    void deliverPdf(pdf, fileName);
  } catch (saveErr) {
    console.warn('pdf.save notice:', saveErr);
  }

  // 2. Also trigger DOM link download with blob URL
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
    pageCount: 1,
  };
}

export interface MilanPdfOptions {
  boy: KundaliData;
  girl: KundaliData;
  milan: any;
  date?: Date;
  lang?: string;
}

export async function downloadMilanBhojpatraPdf(options: MilanPdfOptions): Promise<PdfResult> {
  await waitForPdfFonts();
  const { boy, girl, milan, date = new Date() } = options;
  const currentLang = (options.lang || 'hi').slice(0, 2).toLowerCase();
  const width = PDF_PX_W;
  const height = PDF_PX_H;

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
  const milanMainTitle = currentLang === 'en'
    ? '॥ Sri Ashtakoot Guna Milan & Vivah Patrika ॥'
    : currentLang === 'gu'
    ? '॥ શ્રી અષ્ટકૂટ ગુણ મિલન અને વૈવાહિક પત્રિકા ॥'
    : '॥ श्री अष्टकूट गुण मिलान एवं वैवाहिक पत्रिका ॥';
  ctx.fillText(milanMainTitle, width / 2, cursorY);

  cursorY += 26;
  ctx.fillStyle = '#7a4b18';
  ctx.font = 'italic 18px "Tiro Devanagari Hindi", serif';
  const milanSubTitle = currentLang === 'en'
    ? 'Bridegroom & Bride Horoscope Match, Manglik Analysis, Nadi & Bhakoot Investigation'
    : currentLang === 'gu'
    ? 'વર-કન્યા કુંડળી મિલન, માંગલિક વિચાર, નાડી અને ભકૂટ દોષ વિશ્લેષણ'
    : 'वर-कन्या कुण्डली मिलान, मांगलिक विचार, नाड़ी व भकूट दोष विश्लेषण';
  ctx.fillText(milanSubTitle, width / 2, cursorY);

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
  ctx.fillText(
    currentLang === 'en' ? '❖  Shubh Vivah Mangalam  ❖' : currentLang === 'gu' ? '❖  શુભ વિવાહ મંગલમ્  ❖' : '❖  शुभ विवाह मंगलम्  ❖',
    width / 2,
    cursorY + 6
  );

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
  const coupleProfileTitle = currentLang === 'en'
    ? '॥ Bridegroom & Bride Birth Details ॥'
    : currentLang === 'gu'
    ? '॥ વર અને કન્યા જન્મ વિવરણ ॥'
    : '॥ वर एवं कन्या जन्म विवरण ॥';
  ctx.fillText(coupleProfileTitle, pBoxX + 16, cursorY + 26);

  ctx.fillStyle = '#3a1f0a';
  ctx.font = '14px "Tiro Devanagari Hindi", serif';
  const col1X = pBoxX + 24;
  const col2X = pBoxX + width / 2 - 40;

  const dateLocale = currentLang === 'en' ? 'en-US' : currentLang === 'gu' ? 'gu-IN' : 'hi-IN';
  const fmtBDate = (d: Date) => d.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' });

  const lblBoy = currentLang === 'en' ? 'Groom (Boy)' : currentLang === 'gu' ? 'વર' : 'वर (Boy)';
  const lblGirl = currentLang === 'en' ? 'Bride (Girl)' : currentLang === 'gu' ? 'કન્યા' : 'कन्या (Girl)';
  const lblBirth = currentLang === 'en' ? 'Birth' : currentLang === 'gu' ? 'જન્મ' : 'जन्म';
  const lblTime = currentLang === 'en' ? 'Time' : currentLang === 'gu' ? 'સમય' : 'समय';
  const lblLagna = currentLang === 'en' ? 'Ascendant' : currentLang === 'gu' ? 'લગ્ન' : 'लग्न';
  const lblMoon = currentLang === 'en' ? 'Moon' : currentLang === 'gu' ? 'ચંદ્ર' : 'चंद्र';
  const lblNakshatra = currentLang === 'en' ? 'Nakshatra' : currentLang === 'gu' ? 'નક્ષત્ર' : 'नक्षत्र';
  const lblGana = currentLang === 'en' ? 'Gana' : currentLang === 'gu' ? 'ગણ' : 'गण';
  const lblYoni = currentLang === 'en' ? 'Yoni' : currentLang === 'gu' ? 'યોનિ' : 'योनि';
  const lblNadi = currentLang === 'en' ? 'Nadi' : currentLang === 'gu' ? 'નાડી' : 'नाड़ी';
  const lblVarna = currentLang === 'en' ? 'Varna' : currentLang === 'gu' ? 'વર્ણ' : 'वर्ण';

  let rY = cursorY + 52;
  ctx.fillText(`${lblBoy}: ${boy.name}`, col1X, rY);
  ctx.fillText(`${lblGirl}: ${girl.name}`, col2X, rY);

  rY += 24;
  ctx.fillText(`${lblBirth}: ${fmtBDate(boy.birthDate)} | ${lblTime}: ${boy.birthTime} (${boy.birthPlace})`, col1X, rY);
  ctx.fillText(`${lblBirth}: ${fmtBDate(girl.birthDate)} | ${lblTime}: ${girl.birthTime} (${girl.birthPlace})`, col2X, rY);

  rY += 24;
  ctx.fillText(`${lblLagna}: ${trRashi(boy.lagnaRashi, currentLang)} | ${lblMoon}: ${trRashi(boy.moonRashi, currentLang)} | ${lblNakshatra}: ${trVedic(boy.nakshatra, currentLang)} (${boy.charan})`, col1X, rY);
  ctx.fillText(`${lblLagna}: ${trRashi(girl.lagnaRashi, currentLang)} | ${lblMoon}: ${trRashi(girl.moonRashi, currentLang)} | ${lblNakshatra}: ${trVedic(girl.nakshatra, currentLang)} (${girl.charan})`, col2X, rY);

  rY += 24;
  ctx.fillText(`${lblGana}: ${trVedic(boy.gana, currentLang)} | ${lblYoni}: ${trVedic(boy.yoni, currentLang)} | ${lblNadi}: ${trVedic(boy.nadi, currentLang)} | ${lblVarna}: ${trVedic(boy.varna, currentLang)}`, col1X, rY);
  ctx.fillText(`${lblGana}: ${trVedic(girl.gana, currentLang)} | ${lblYoni}: ${trVedic(girl.yoni, currentLang)} | ${lblNadi}: ${trVedic(girl.nadi, currentLang)} | ${lblVarna}: ${trVedic(girl.varna, currentLang)}`, col2X, rY);

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
  const totalScoreLabel = currentLang === 'en'
    ? `Total Score: ${milan.totalScore} / 36 Gunas — ${milan.verdict}`
    : currentLang === 'gu'
    ? `કુલ ગુણાંક: ${milan.totalScore} / 36 ગુણ — ${milan.verdict}`
    : `कुल प्राप्तांक: ${milan.totalScore} / 36 गुण — ${milan.verdict}`;
  ctx.fillText(totalScoreLabel, width / 2, cursorY + 42);

  cursorY += sBoxH + 26;

  // 8 Kootas Table
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'left';
  const tableHeading = currentLang === 'en'
    ? '॥ Ashtakoot 8 Components Guna Details ॥'
    : currentLang === 'gu'
    ? '॥ અષ્ટકૂટ ૮ ઘટકોનું ગુણ વિવરણ ॥'
    : '॥ अष्टकूट 8 घटकों का गुण विवरण ॥';
  ctx.fillText(tableHeading, pBoxX, cursorY);

  cursorY += 12;
  const thY = cursorY + 18;
  ctx.fillStyle = '#5C3A21';
  ctx.fillRect(pBoxX, cursorY, pBoxW, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
  const thKoot = currentLang === 'en' ? 'Koota Name' : currentLang === 'gu' ? 'કૂટનું નામ' : 'कूट का नाम';
  const thObtained = currentLang === 'en' ? 'Score' : currentLang === 'gu' ? 'પ્રાપ્ત' : 'प्राप्त';
  const thMax = currentLang === 'en' ? 'Max' : currentLang === 'gu' ? 'મહત્તમ' : 'अधिकतम';
  const thBoy = currentLang === 'en' ? 'Groom Value' : currentLang === 'gu' ? 'વર મૂલ્ય' : 'वर मान';
  const thGirl = currentLang === 'en' ? 'Bride Value' : currentLang === 'gu' ? 'કન્યા મૂલ્ય' : 'कन्या मान';
  const thNote = currentLang === 'en' ? 'Classical Analysis & Guidance' : currentLang === 'gu' ? 'શાસ્ત્રીય ફળ અને વિશ્લેષણ' : 'शास्त्रीय फल व विश्लेषण';

  ctx.fillText(thKoot, pBoxX + 16, thY);
  ctx.fillText(thObtained, pBoxX + 200, thY);
  ctx.fillText(thMax, pBoxX + 280, thY);
  ctx.fillText(thBoy, pBoxX + 370, thY);
  ctx.fillText(thGirl, pBoxX + 500, thY);
  ctx.fillText(thNote, pBoxX + 640, thY);

  cursorY += 26;
  ctx.font = '13px "Tiro Devanagari Hindi", serif';
  milan.items.forEach((it: any, idx: number) => {
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 248, 235, 0.7)' : 'rgba(245, 235, 215, 0.7)';
    ctx.fillRect(pBoxX, cursorY, pBoxW, 24);
    ctx.strokeStyle = 'rgba(140, 98, 57, 0.2)';
    ctx.strokeRect(pBoxX, cursorY, pBoxW, 24);

    ctx.fillStyle = '#4a2505';
    ctx.fillText(trVedic(it.name, currentLang), pBoxX + 16, cursorY + 16);
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 13px "Tiro Devanagari Hindi", serif';
    ctx.fillText(`${it.score}`, pBoxX + 210, cursorY + 16);
    ctx.font = '13px "Tiro Devanagari Hindi", serif';
    ctx.fillStyle = '#6b431e';
    ctx.fillText(`${it.max}`, pBoxX + 295, cursorY + 16);
    ctx.fillText(trVedic(it.boyValue, currentLang), pBoxX + 370, cursorY + 16);
    ctx.fillText(trVedic(it.girlValue, currentLang), pBoxX + 500, cursorY + 16);
    ctx.fillText(it.note, pBoxX + 640, cursorY + 16);

    cursorY += 24;
  });

  cursorY += 20;

  // Manglik, Nadi & Bhakoot Section
  ctx.fillStyle = '#8b1e1e';
  ctx.font = 'bold 17px "Tiro Devanagari Hindi", serif';
  const doshaHeading = currentLang === 'en'
    ? '॥ Manglik Analysis & Special Dosha Remedies ॥'
    : currentLang === 'gu'
    ? '॥ માંગલિક વિચાર અને વિશેષ દોષ પરિહાર ॥'
    : '॥ मांगलिक विचार एवं विशेष दोष परिहार ॥';
  ctx.fillText(doshaHeading, pBoxX, cursorY);

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
    const lblMglk = currentLang === 'en' ? '• Manglik Findings:' : currentLang === 'gu' ? '• માંગલિક વિચાર:' : '• मांगलिक विचार:';
    ctx.fillText(`${lblMglk} ${milan.manglikAnalysis.verdict}`, pBoxX + 16, dY);
    ctx.fillStyle = '#2d1403';
    ctx.font = '13px "Tiro Devanagari Hindi", serif';
    dY += 20;
    const groomNoteLbl = currentLang === 'en' ? 'Groom:' : currentLang === 'gu' ? 'વર:' : 'वर:';
    const brideNoteLbl = currentLang === 'en' ? 'Bride:' : currentLang === 'gu' ? 'કન્યા:' : 'कन्या:';
    ctx.fillText(`  ${groomNoteLbl} ${milan.manglikAnalysis.boyNote} | ${brideNoteLbl} ${milan.manglikAnalysis.girlNote}`, pBoxX + 16, dY);
    dY += 20;
    const cancelLbl = currentLang === 'en' ? 'Remedy/Cancellation:' : currentLang === 'gu' ? 'પરિહાર:' : 'परिहार:';
    ctx.fillText(`  ${cancelLbl} ${milan.manglikAnalysis.cancellationReason}`, pBoxX + 16, dY);
    dY += 22;
  }

  if (milan.nadiDosha) {
    const nadiLbl = currentLang === 'en' ? '• Nadi Analysis:' : currentLang === 'gu' ? '• નાડી વિચાર:' : '• नाड़ी विचार:';
    const groomNadiLbl = currentLang === 'en' ? 'Groom Nadi' : currentLang === 'gu' ? 'વર નાડી' : 'वर नाड़ी';
    const brideNadiLbl = currentLang === 'en' ? 'Bride Nadi' : currentLang === 'gu' ? 'કન્યા નાડી' : 'कन्या नाड़ी';
    const flawlessNadi = currentLang === 'en' ? 'Flawless Nadi Match' : currentLang === 'gu' ? 'નિર્દોષ નાડી' : 'निर्दोष नाड़ी';
    ctx.fillText(`${nadiLbl} ${groomNadiLbl} (${trVedic(milan.nadiDosha.boyNadi, currentLang)}) vs ${brideNadiLbl} (${trVedic(milan.nadiDosha.girlNadi, currentLang)}) — ${milan.nadiDosha.hasDosha ? milan.nadiDosha.remedy : flawlessNadi}`, pBoxX + 16, dY);
    dY += 22;
  }

  if (milan.bhakootDosha) {
    const bhakootLbl = currentLang === 'en' ? '• Bhakoot Analysis:' : currentLang === 'gu' ? '• ભકૂટ વિચાર:' : '• भकूट विचार:';
    const flawlessBhakoot = currentLang === 'en' ? 'Flawless Bhakoot Relation' : currentLang === 'gu' ? 'નિર્દોષ ભકૂટ સંબંધ' : 'निर्दोष भकूट संबंध';
    ctx.fillText(`${bhakootLbl} ${milan.bhakootDosha.hasDosha ? milan.bhakootDosha.remedy : flawlessBhakoot}`, pBoxX + 16, dY);
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
  const milanFooterInst = currentLang === 'en'
    ? 'Shri Shakti Panchang Sansthan | Certified Ashtakoot Guna Milan Bhojpatra Patrika'
    : currentLang === 'gu'
    ? 'શ્રી શક્તિ પંચાંગ સંસ્થાન | પ્રમાણિત અષ્ટકૂટ ગુણ મિલન ભોજપત્ર પત્રિકા'
    : 'श्री शक्ति पंचांग संस्थान | प्रमाणित अष्टकूट गुण मिलान भोजपत्र पत्रिका';
  ctx.fillText(milanFooterInst, width / 2, footerY + 30);

  const imgData = canvas.toDataURL('image/jpeg', 0.88);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PDF_MM_W, PDF_MM_H],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, PDF_MM_W, PDF_MM_H, undefined, 'FAST');
  const sanitizedBoy = (boy.name || 'Var').replace(/[^\w\u0900-\u097F\s-]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedGirl = (girl.name || 'Kanya').replace(/[^\w\u0900-\u097F\s-]/g, '').trim().replace(/\s+/g, '_');
  const fileName = `Milan_Bhojpatra_Patrika_${sanitizedBoy}_${sanitizedGirl}.pdf`;
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // 1. Direct jsPDF download
  try {
    void deliverPdf(pdf, fileName);
  } catch (saveErr) {
    console.warn('pdf.save notice:', saveErr);
  }

  // 2. Also trigger DOM link download with blob URL
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
    pageCount: 1,
  };
}
