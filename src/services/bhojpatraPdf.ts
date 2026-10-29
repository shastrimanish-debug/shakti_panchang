import { jsPDF } from 'jspdf';
import { VedicPanchangData, KundaliData, PlanetPosition } from '../types';
import { triggerPdfDownload, waitForPdfFonts, type PdfResult } from './pdfFonts';
import { PDF_MM_H, PDF_MM_W, PDF_PX_H, PDF_PX_W } from './pdfPage';
import { deliverPdf } from '../lib/device';
import { calculateVargaSign, RASHIS, NAKSHATRAS } from './astronomy';
import { analyzeKundali, SIGN_LORDS } from './predictions';

export interface BhojpatraPdfOptions {
  title?: string;
  panchang: VedicPanchangData;
  query: string;
  answer: string;
  activeKundali?: KundaliData | null;
  kundali?: KundaliData | null;
  locationName?: string;
  date?: Date;
}

/**
 * Planet short abbreviations for North Indian Kundali chart
 */
const PLANET_ABBR_MAP: Record<string, string> = {
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
};

function getPlanetAbbr(planetName: string): string {
  for (const [k, v] of Object.entries(PLANET_ABBR_MAP)) {
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
  subTitle?: string
) {
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
      name: getPlanetAbbr(p.planet),
      retro: p.isRetrograde,
      deg: `${Math.floor(vdeg)}°`,
    });
  });

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
      const label = n >= 4 ? `${p.name}${p.retro ? 'व' : ''}` : `${p.name}${p.retro ? 'व' : ''} ${p.deg}`;
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
  kundali: KundaliData
) {
  ctx.save();

  // Outer container
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = '#C58F27';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, width, height);

  // Table Title
  ctx.fillStyle = '#8B1E1E';
  ctx.font = 'bold 15px "Tiro Devanagari Hindi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('॥ ग्रह स्पष्ट स्थिति व नक्षत्र सारणी ॥', x + width / 2, y - 10);

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
  ctx.fillText('ग्रह', colX.graha, midH);
  ctx.fillText('राशि', colX.rashi, midH);
  ctx.fillText('अंश/कला', colX.deg, midH);
  ctx.fillText('नक्षत्र (चरण)', colX.nakshatra, midH);
  ctx.fillText('स्थिति/गति', colX.status, midH);

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

  const rows: TableRow[] = [
    {
      name: 'लग्न (Asc)',
      rashi: kundali.lagnaRashi,
      deg: fmtDMS(lagnaDegInRashi),
      nakshatra: `${NAKSHATRAS[lagnaNakIdx % 27] || '—'} (${lagnaPada})`,
      status: 'उदय (Udaya)',
      statusColor: '#8B1E1E',
      isLagna: true,
    },
  ];

  majorOrder.forEach((g) => {
    const p = pMap[g];
    if (!p) return;

    let status = p.isRetrograde ? 'वक्री (R)' : 'मार्गी (D)';
    let statusColor = p.isRetrograde ? '#8B1E1E' : '#2A1402';

    if (EXALTATION_SIGNS[g] === p.rashi) {
      status = 'उच्च (Exalt)';
      statusColor = '#1A5319';
    } else if (DEBILITATION_SIGNS[g] === p.rashi) {
      status = 'नीच (Debil)';
      statusColor = '#9A1B1B';
    } else if (OWN_SIGNS_MAP[g]?.includes(p.rashi)) {
      status = 'स्वराशि (Own)';
      statusColor = '#1F4529';
    }

    rows.push({
      name: p.planet,
      rashi: p.rashi,
      deg: fmtDMS(p.degreeInRashi),
      nakshatra: `${p.nakshatra} (${p.pada})`,
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

  // =========================================================================
  // IF KUNDALI DATA IS PROVIDED -> RENDER COMPLETE SACRED KUNDALI PATRIKA
  // =========================================================================
  if (kundali) {
    const analysis = analyzeKundali(kundali);
    const lagnaLord = SIGN_LORDS[kundali.lagnaRashi] || '—';
    const moonLord = SIGN_LORDS[kundali.moonRashi] || '—';

    // 9th house sign and lord for Bhagya
    const bhagyaSign = RASHIS[((kundali.lagnaRashiNumber - 1 + 8) % 12)] || '—';
    const bhagyaLord = SIGN_LORDS[bhagyaSign] || '—';

    // Auspicious gemstone based on Lagna
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
    const luckyGem = GEMSTONE_MAP[kundali.lagnaRashi] || 'पुखराज / मूँगा';

    // Ishta Devta based on 5th house sign
    const fifthSign = RASHIS[((kundali.lagnaRashiNumber - 1 + 4) % 12)] || 'मेष';
    const fifthLord = SIGN_LORDS[fifthSign] || 'सूर्य';
    const DEITY_MAP: Record<string, string> = {
      सूर्य: 'भगवान सूर्य नारायण / गायत्री माता',
      चंद्र: 'भगवान शिव शंकर / माता पार्वती',
      मंगल: 'श्री हनुमान जी / भगवान कार्तिकेय',
      बुध: 'भगवान श्री गणेश / श्री विष्णु',
      गुरु: 'भगवान श्री हरि विष्णु / दत्तात्रेय',
      शुक्र: 'माँ महालक्ष्मी / श्री राधा-कृष्ण',
      शनि: 'श्री हनुमान जी / भगवान शिव / शनिदेव',
    };
    const ishtaDev = DEITY_MAP[fifthLord] || 'भगवान श्री हरि विष्णु';

    // 4. Header & Invocations
    let cursorY = 82;
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 22px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ ॐ श्री गणेशाय नमः ॥   •   ॥ ॐ कुलदेवताभ्यो नमः ॥   •   ॥ ॐ नमः शिवाय ॥', width / 2, cursorY);

    cursorY += 34;
    ctx.fillStyle = '#4a2505';
    ctx.font = 'bold 32px "Rozha One", "Tiro Devanagari Hindi", serif';
    ctx.fillText('॥ श्री शक्ति वैदिक जन्म-कुण्डली चक्र एवं सम्पूर्ण फलादेश ॥', width / 2, cursorY);

    cursorY += 24;
    ctx.fillStyle = '#7a4b18';
    ctx.font = '14.5px "Tiro Devanagari Hindi", serif';
    ctx.fillText(
      'प्रामाणिक लग्न कुण्डली (D-1), नवमांश चक्र (D-9), ग्रह स्पष्ट, विंशोत्तरी दशा व शास्त्र-सम्मत जीवन विश्लेषण',
      width / 2,
      cursorY
    );

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
    const dateStr = birthDateObj.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    ctx.fillStyle = '#3a1f0a';
    ctx.font = '13.5px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'left';

    const col1 = pBoxX + 18;
    const col2 = pBoxX + 285;
    const col3 = pBoxX + 575;
    const col4 = pBoxX + 850;

    let rY = cursorY + 24;
    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 14px "Tiro Devanagari Hindi", serif';
    ctx.fillText(`जातक: ${kundali.name}`, col1, rY);
    ctx.font = '13.5px "Tiro Devanagari Hindi", serif';
    ctx.fillStyle = '#3a1f0a';
    ctx.fillText(`जन्म स्थान: ${kundali.birthPlace}`, col2, rY);
    ctx.fillText(`लग्न: ${kundali.lagnaRashi} (स्वामी: ${lagnaLord})`, col3, rY);
    ctx.fillText(`सूर्य राशि: ${kundali.sunRashi}`, col4, rY);

    rY += 24;
    ctx.fillText(`जन्म तिथि: ${dateStr}`, col1, rY);
    ctx.fillText(`अक्षांश/रेखांश: ${kundali.latitude.toFixed(2)}°N, ${kundali.longitude.toFixed(2)}°E`, col2, rY);
    ctx.fillText(`चंद्र राशि: ${kundali.moonRashi} (स्वामी: ${moonLord})`, col3, rY);
    ctx.fillText(`मांगलिक: ${kundali.isManglik ? 'हाँ (मांगलिक प्रभाव)' : 'नहीं (दोष मुक्त)'}`, col4, rY);

    rY += 24;
    ctx.fillText(`जन्म समय: ${kundali.birthTime}`, col1, rY);
    ctx.fillText(`वार व तिथि: ${panchang.weekday} | ${panchang.paksha} ${panchang.tithi}`, col2, rY);
    ctx.fillText(`नक्षत्र: ${kundali.nakshatra} (चरण ${kundali.charan})`, col3, rY);
    ctx.fillText(`गण: ${kundali.gana} | नाड़ी: ${kundali.nadi} | वर्ण: ${kundali.varna}`, col4, rY);

    // 6. Visual Kundali Charts & Graha Spashta Table Section
    // Center D-1 at X = 230, D-9 at X = 575, Graha Table at X = 755
    cursorY += pBoxH + 34;
    const chartSize = 310;
    const chartCenterY = cursorY + chartSize / 2;

    // D-1 Lagna Chart
    drawNorthIndianDiamondChart(
      ctx,
      230,
      chartCenterY,
      chartSize,
      1,
      kundali,
      `॥ लग्न कुण्डली चक्र (D-1) ॥`,
      `लग्न: ${kundali.lagnaRashi} (${kundali.lagnaRashiNumber}) • तनु चक्र`
    );

    // D-9 Navamsha Chart
    drawNorthIndianDiamondChart(
      ctx,
      575,
      chartCenterY,
      chartSize,
      9,
      kundali,
      `॥ नवमांश कुण्डली चक्र (D-9) ॥`,
      `आत्मकारक, भाग्य एवं वैवाहिक सामर्थ्य`
    );

    // Graha Spashta & Dignity Table
    drawGrahaSpashtaTable(ctx, 755, cursorY, width - 755 - 72, chartSize, kundali);

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
    ctx.fillText(
      `★ वर्तमान विंशोत्तरी दशा:  ${kundali.mahadasha} महादशा  ➔  ${kundali.antardasha} अंतर्दशा  ➔  ${kundali.pratyantardasha} प्रत्यंतर दशा`,
      pBoxX + 16,
      cursorY + 24
    );

    ctx.fillStyle = '#4a2505';
    ctx.font = '13px "Tiro Devanagari Hindi", serif';
    ctx.fillText(
      `प्रमुख ग्रहीय सूत्र:  लग्न स्वामी: ${lagnaLord}  |  भाग्येश (9th): ${bhagyaLord}  |  इष्ट देव: ${ishtaDev}  |  शुभ रत्न: ${luckyGem}  |  मुख्य योग: ${analysis.yogas[0] || 'शुभ राजयोग'}`,
      pBoxX + 16,
      cursorY + 48
    );

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

    // Bento 1: व्यक्तित्व, स्वभाव एवं शारीरिक गठन
    drawBentoCard(
      bento1X,
      cursorY,
      '१. व्यक्तित्व, स्वभाव एवं शारीरिक गठन',
      'तनु व मानस विचार',
      [
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
          text: healthArea?.finding
            ? `${healthArea.finding} ${healthArea.caution || ''}`
            : 'सामान्यतः जीवनशक्ति उत्तम रहेगी। मौसमी विकारों और पित्त-वात संतुलन पर ध्यान दें।',
        },
      ]
    );

    // Bento 2: कार्यक्षेत्र, धन-वैभव एवं आजीविका
    drawBentoCard(
      bento2X,
      cursorY,
      '२. कार्यक्षेत्र, धन-वैभव एवं आजीविका',
      'कर्म व अर्थ लाभ',
      [
        {
          label: 'आजीविका व करियर दिशा',
          text: careerArea?.finding
            ? `${careerArea.finding} (कारण: ${careerArea.why})`
            : 'दशम भाव व लग्न स्वामी के प्रभाव से प्रशासनिक, तकनीकी, व्यापारिक अथवा स्वतंत्र उद्यम में विशेष ख्याति प्राप्त होगी।',
        },
        {
          label: 'धन संचय व आर्थिक योग',
          text: financeArea?.finding
            ? financeArea.finding
            : 'द्वितीय (धन) एवं एकादश (आय) भाव के योग से मध्यम आयु के उपरांत सुदृढ़ आर्थिक स्थिरता एवं भूमि-भवन लाभ के योग हैं।',
        },
        {
          label: 'समय व निर्णय सावधानी',
          text: careerArea?.caution || 'महत्त्वपूर्ण व्यावसायिक व वित्तीय निर्णय सदैव शुभ गोचर व इष्ट स्मरण से लें।',
        },
      ]
    );

    // Row 2 of Bento Cards
    cursorY += bentoH + 16;

    // Bento 3: दांपत्य जीवन, परिवार एवं भाग्य पक्ष
    drawBentoCard(
      bento1X,
      cursorY,
      '३. दांपत्य जीवन, परिवार एवं भाग्य पक्ष',
      'सप्तम व नवम फल',
      [
        {
          label: 'वैवाहिक व पारिवारिक सुख',
          text: marriageArea?.finding
            ? marriageArea.finding
            : 'सप्तम भाव व नवमांश चक्र D-9 की अनुकूलता से योग्य एवं संस्कारी जीवनसाथी का सहयोग मिलेगा। पारस्परिक संवाद से सुख में वृद्धि होगी।',
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
      ]
    );

    // Bento 4: अचूक वैदिक उपाय, रत्न एवं इष्ट आराधना
    drawBentoCard(
      bento2X,
      cursorY,
      '४. अचूक वैदिक उपाय, रत्न एवं इष्ट आराधना',
      'शास्त्रीय कल्याण सूत्र',
      [
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
      ]
    );

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
    ctx.fillText('प्रमाणित', pBoxX + 42, footerY + 29);
    ctx.restore();

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 16.5px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ शुभम् भवतु • कल्याणमस्तु • सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥', width / 2 + 25, footerY + 12);

    ctx.fillStyle = '#7a4b18';
    ctx.font = '12px "Tiro Devanagari Hindi", serif';
    ctx.fillText(
      'श्री शक्ति पंचांग संस्थान • उमा दिव्य वैदिक ज्योतिष शोधपीठ द्वारा मुद्रित हस्तनिर्मित भोजपत्र जन्म-पत्रिका',
      width / 2 + 25,
      footerY + 32
    );
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
    ctx.fillText('॥ श्री शक्ति पंचांग - उमा दिव्य मार्गदर्शन पत्रिका ॥', width / 2, cursorY);

    cursorY += 26;
    ctx.fillStyle = '#7a4b18';
    ctx.font = 'italic 18px "Tiro Devanagari Hindi", serif';
    ctx.fillText('वैदिक ज्योतिष, पंचांग, शुभाशुभ मुहूर्त एवं सनातन पराविद्या परामर्श', width / 2, cursorY);

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
    ctx.fillText('॥ दैनिक वैदिक पंचांग विवरण ॥', pBoxX + 16, cursorY + 26);

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
    ctx.fillText(
      `दिशाशूल: ${panchang.weekday === 'रविवार' ? 'पश्चिम' : panchang.weekday === 'सोमवार' ? 'पूर्व' : 'सम्बन्धित दिशा'}`,
      col3X,
      rY
    );
    ctx.fillText(`अंकन समय: ${timeStr}`, col4X, rY);

    cursorY += pBoxH + 30;

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
    ctx.fillText('प्रमाणित', pBoxX + 45, footerY + 30);
    ctx.restore();

    ctx.fillStyle = '#8b1e1e';
    ctx.font = 'bold 18px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('॥ शुभम् भवतु • कल्याणमस्तु • धर्मो रक्षति रक्षितः ॥', width / 2 + 30, footerY + 10);

    ctx.fillStyle = '#7a4b18';
    ctx.font = '13px "Tiro Devanagari Hindi", serif';
    ctx.fillText('श्री शक्ति पंचांग संस्थान | उमा एआई वैदिक ज्योतिष प्रणाली द्वारा मुद्रित भोजपत्र पत्रिका', width / 2 + 30, footerY + 32);
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
  const sanitizedTitle = (options.title || (kundali ? `वैदिक_जन्म_पत्रिका_${kundali.name}` : 'Bhojpatra_Patrika'))
    .replace(/[^\w\u0900-\u097F\s-]/g, '')
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
}

export async function downloadMilanBhojpatraPdf(options: MilanPdfOptions): Promise<PdfResult> {
  await waitForPdfFonts();
  const { boy, girl, milan, date = new Date() } = options;
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
