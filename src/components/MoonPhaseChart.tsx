import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { VedicPanchangData } from '../types';
import {
  Moon,
  Sparkles,
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  CheckCircle2,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { saveImageNative } from '../lib/device';
import { shareImageFile } from '../lib/shareHelper';
import { triggerHapticSelection } from '../utils/haptics';
import { trVedic } from '../i18n/vedicTranslate';

interface MoonPhaseChartProps {
  panchang: VedicPanchangData;
  placeName?: string;
  onWhatsApp?: () => void;
}

function formatClock(d?: Date): string {
  if (!d) return '—';
  return d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Generates a Full HD (1080 x 1760) PNG Data URL containing the 3D Lunar Phase & Tithi Orbit
 * at the top and the complete Vedic Panchang details directly below it.
 */
export async function generateHdMoonPanchangDataUrl(
  panchang: VedicPanchangData,
  placeName: string = 'उज्जैन'
): Promise<string> {
  const canvas = document.createElement('canvas');
  const W = 1080;
  const H = 1760;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const rawDiff = (((panchang.moonLongitude - panchang.sunLongitude) % 360) + 360) % 360;
  const tNum = Math.floor(rawDiff / 12) + 1;
  const prog = panchang.tithiProgress ?? (rawDiff % 12) / 12;
  const rad = (rawDiff * Math.PI) / 180;
  const illum = Math.max(0, Math.min(100, ((1 - Math.cos(rad)) / 2) * 100));
  const isWaxing = rawDiff <= 180;
  const tithiProgressPct = Math.round(prog * 100);

  // 1. Royal Parchment & Deep Cosmic Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#1D110A');
  bgGrad.addColorStop(0.38, '#2C1A10');
  bgGrad.addColorStop(0.42, '#FAF2E4');
  bgGrad.addColorStop(1, '#F3E3C9');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Outer Ornate Golden Border
  ctx.strokeStyle = '#D4A048';
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.strokeStyle = 'rgba(181, 106, 0, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  // 2. Top Sacred Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD88A';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('॥ श्री गणेशाय नमः • शक्ति सनातन पंचांग ॥', W / 2, 82);

  ctx.fillStyle = '#FFF8EB';
  ctx.font = '900 44px sans-serif';
  ctx.fillText('चन्द्र कला एवं तिथि प्रगति चक्र (HD)', W / 2, 138);

  const dateStr = (panchang.solar.sunrise || new Date()).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  ctx.fillStyle = '#E5B869';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`📅 ${dateStr}  •  ${trVedic(panchang.weekday)}  •  📍 ${placeName}`, W / 2, 182);

  // 3. Celestial Moon Phase & Orbit Box (Top Half)
  const mCx = 320;
  const mCy = 415;
  const moonR = 128;
  const arcInner = moonR + 24;
  const arcOuter = moonR + 42;

  // Starfield around Moon
  const stars = [
    [90, 260], [150, 310], [110, 520], [510, 260], [490, 540],
    [220, 250], [440, 280], [130, 410], [520, 400],
  ];
  stars.forEach(([sx, sy], i) => {
    ctx.beginPath();
    ctx.arc(sx, sy, i % 2 === 0 ? 3.2 : 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 244, 214, 0.65)';
    ctx.fill();
  });

  // Moon Outer Glow
  const glowGrad = ctx.createRadialGradient(mCx, mCy, moonR * 0.7, mCx, mCy, moonR * 1.45);
  glowGrad.addColorStop(0, 'rgba(255, 232, 175, 0.35)');
  glowGrad.addColorStop(1, 'rgba(255, 232, 175, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(mCx, mCy, moonR * 1.45, 0, Math.PI * 2);
  ctx.fill();

  // Unlit Dark Moon Base Sphere
  const darkGrad = ctx.createRadialGradient(mCx - 30, mCy - 30, 20, mCx, mCy, moonR);
  darkGrad.addColorStop(0, '#3B2C20');
  darkGrad.addColorStop(0.7, '#22170F');
  darkGrad.addColorStop(1, '#120B06');
  ctx.fillStyle = darkGrad;
  ctx.beginPath();
  ctx.arc(mCx, mCy, moonR, 0, Math.PI * 2);
  ctx.fill();

  // Illuminated Moon Surface (clipped using exact spherical terminator)
  ctx.save();
  ctx.beginPath();
  if (rawDiff >= 0.5 && rawDiff <= 359.5) {
    const cosAngle = Math.cos((rawDiff * Math.PI) / 180);
    const rx = Math.abs(moonR * cosAngle);
    if (Math.abs(rawDiff - 180) < 0.8) {
      ctx.arc(mCx, mCy, moonR, 0, Math.PI * 2);
    } else if (rawDiff <= 180) {
      // Waxing: right side lit
      ctx.arc(mCx, mCy, moonR, -Math.PI / 2, Math.PI / 2, false);
      ctx.ellipse(
        mCx,
        mCy,
        rx,
        moonR,
        0,
        Math.PI / 2,
        -Math.PI / 2,
        rawDiff < 90
      );
    } else {
      // Waning: left side lit
      ctx.arc(mCx, mCy, moonR, -Math.PI / 2, Math.PI / 2, true);
      ctx.ellipse(
        mCx,
        mCy,
        rx,
        moonR,
        0,
        Math.PI / 2,
        -Math.PI / 2,
        rawDiff <= 270
      );
    }
    ctx.closePath();
    const litGrad = ctx.createRadialGradient(
      mCx + (isWaxing ? 35 : -35),
      mCy - 35,
      15,
      mCx,
      mCy,
      moonR * 1.1
    );
    litGrad.addColorStop(0, '#FFFDF6');
    litGrad.addColorStop(0.5, '#F5EBD6');
    litGrad.addColorStop(0.85, '#DAC7A4');
    litGrad.addColorStop(1, '#B89F74');
    ctx.fillStyle = litGrad;
    ctx.fill();
  }
  ctx.restore();

  // Subtle Lunar Maria Craters
  const craters = [
    { x: mCx - 34, y: mCy - 40, r: 24 },
    { x: mCx + 40, y: mCy - 26, r: 22 },
    { x: mCx + 48, y: mCy + 28, r: 26 },
    { x: mCx - 40, y: mCy + 36, r: 28 },
  ];
  craters.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(40, 26, 14, 0.14)';
    ctx.fill();
  });

  // Tithi Progress Track Ring
  const ringR = (arcInner + arcOuter) / 2;
  ctx.beginPath();
  ctx.arc(mCx, mCy, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(92, 58, 33, 0.65)';
  ctx.lineWidth = arcOuter - arcInner;
  ctx.stroke();

  // Active Golden Tithi Progress Arc
  const startA = -Math.PI / 2;
  const endA = startA + Math.max(0.03, Math.min(1, prog)) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(mCx, mCy, ringR, startA, endA, false);
  ctx.strokeStyle = '#FFC83B';
  ctx.lineWidth = arcOuter - arcInner;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Right-side Astronomical Stats inside Top Cosmic Panel
  ctx.textAlign = 'left';
  const statX = 560;
  ctx.fillStyle = '#FFD88A';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(isWaxing ? '▲ शुक्ल पक्ष (वर्धमान चन्द्र)' : '▼ कृष्ण पक्ष (क्षीयमान चन्द्र)', statX, 265);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 40px sans-serif';
  ctx.fillText(`${trVedic(panchang.paksha)} • ${trVedic(panchang.tithi)}`, statX, 322);

  // Stat Box 1: Illumination & Elongation
  ctx.fillStyle = 'rgba(255, 248, 231, 0.12)';
  ctx.strokeStyle = 'rgba(229, 160, 36, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(statX, 350, 455, 115, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#E5B869';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('चन्द्र प्रकाश (Illumination)', statX + 22, 388);
  ctx.fillText('सूर्य-चन्द्र अंतर', statX + 275, 388);

  ctx.fillStyle = '#FFFDF4';
  ctx.font = '900 38px sans-serif';
  ctx.fillText(`${illum.toFixed(1)}%`, statX + 22, 440);
  ctx.fillText(`${rawDiff.toFixed(1)}°`, statX + 275, 440);

  // Stat Box 2: Tithi Progress & Moon Rashi
  ctx.fillStyle = 'rgba(255, 248, 231, 0.12)';
  ctx.beginPath();
  ctx.roundRect(statX, 482, 455, 130, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFD88A';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`तिथि प्रगति: ${tithiProgressPct}% व्यतीत (तिथि ${tNum}/30)`, statX + 22, 524);
  ctx.fillStyle = '#FFF8EB';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`चन्द्र राशि: ${trVedic(panchang.lunarRashi)} • ${trVedic(panchang.nakshatra)}`, statX + 22, 564);
  if (panchang.tithiSpan) {
    ctx.fillStyle = '#E5B869';
    ctx.font = '600 21px sans-serif';
    ctx.fillText(
      `समाप्ति: ${formatClock(panchang.tithiSpan.end)} तक (आगे: ${trVedic(panchang.tithiSpan.nextName)})`,
      statX + 22,
      596
    );
  }

  // 4. Lower Half: Today's Complete Panchang Details Table
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5C3A21';
  ctx.font = '900 36px sans-serif';
  ctx.fillText('॥ आज का सम्पूर्ण वैदिक पंचांग विवरण ॥', W / 2, 742);

  const facts: [string, string][] = [
    ['तिथि (Tithi)', trVedic(panchang.tithi)],
    ['पक्ष (Paksha)', trVedic(panchang.paksha)],
    ['नक्षत्र व चरण', `${trVedic(panchang.nakshatra)} · चरण ${panchang.pada}`],
    ['योग (Yoga)', trVedic(panchang.yoga)],
    ['करण (Karana)', trVedic(panchang.karana)],
    ['वार (Weekday)', trVedic(panchang.weekday)],
    ['मास (Lunar Month)', trVedic(panchang.masa)],
    ['विक्रम संवत्', panchang.samvat],
    ['शक संवत्', panchang.sakaSamvat],
    ['सूर्योदय / सूर्यास्त', `${formatClock(panchang.solar.sunrise)} / ${formatClock(panchang.solar.sunset)}`],
    ['सूर्य राशि', trVedic(panchang.solarRashi)],
    ['चन्द्र राशि', trVedic(panchang.lunarRashi)],
    ['अयनांश (Ayanamsha)', `${panchang.ayanamshaName} (${panchang.ayanamsha.toFixed(2)}°)`],
    ['पंचांग स्थान', placeName],
  ];

  const startY = 778;
  const colW = 480;
  const rowH = 114;
  facts.forEach(([label, val], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 52 : 548;
    const y = startY + row * rowH;

    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = 'rgba(140, 98, 57, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, colW, rowH - 14, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8C6239';
    ctx.font = 'bold 21px sans-serif';
    ctx.fillText(label, x + 22, y + 36);

    ctx.fillStyle = '#3E2412';
    ctx.font = '900 28px sans-serif';
    ctx.fillText(String(val).slice(0, 28), x + 22, y + 76);
  });

  // Footer Branding
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5C3A21';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('🕉️ शक्ति पंचांग (Shakti Panchang) • दृक-सिद्ध वैदिक गणना • Full HD 1080p', W / 2, H - 54);

  return canvas.toDataURL('image/png', 1.0);
}

export const MoonPhaseChart: React.FC<MoonPhaseChartProps> = ({
  panchang,
  placeName = 'उज्जैन',
  onWhatsApp,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedTithiIndex, setSelectedTithiIndex] = useState<number | null>(null);
  const [showOrbitCycle, setShowOrbitCycle] = useState(false);
  const [isSavingHd, setIsSavingHd] = useState(false);
  const [isSharingHd, setIsSharingHd] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // 1. Precise Astronomical Calculations
  const {
    elongationDeg,
    tithiNum,
    tithiProgress,
    illuminationPct,
    isWaxing,
    pakshaName,
    tithiName,
    tithiProgressPct,
    rashi,
    nakshatra,
  } = useMemo(() => {
    const rawDiff = (((panchang.moonLongitude - panchang.sunLongitude) % 360) + 360) % 360;
    const tNum = Math.floor(rawDiff / 12) + 1; // 1 to 30
    const prog = (rawDiff % 12) / 12; // 0.0 to 1.0

    const rad = (rawDiff * Math.PI) / 180;
    const illum = Math.max(0, Math.min(100, ((1 - Math.cos(rad)) / 2) * 100));
    const waxing = rawDiff <= 180;

    return {
      elongationDeg: rawDiff,
      tithiNum: tNum,
      tithiProgress: panchang.tithiProgress ?? prog,
      illuminationPct: illum,
      isWaxing: waxing,
      pakshaName: panchang.paksha,
      tithiName: panchang.tithi,
      tithiProgressPct: Math.round((panchang.tithiProgress ?? prog) * 100),
      rashi: panchang.lunarRashi,
      nakshatra: panchang.nakshatra,
    };
  }, [panchang]);

  const handleSaveHdImage = async () => {
    triggerHapticSelection();
    if (isSavingHd) return;
    setIsSavingHd(true);
    setStatusNotice(null);
    try {
      const dataUrl = await generateHdMoonPanchangDataUrl(panchang, placeName);
      const dateSlug = (panchang.solar.sunrise || new Date()).toISOString().slice(0, 10);
      const fileName = `shakti-panchang-hd-${dateSlug}.png`;
      await saveImageNative(dataUrl, fileName);
      setStatusNotice('✓ Full HD (1080p) पंचांग व चन्द्र कला चित्र सफलतापूर्वक सेव हो गया!');
      setTimeout(() => setStatusNotice(null), 4000);
    } catch {
      setStatusNotice('HD चित्र सेव करने में त्रुटि हुई, कृपया पुनः प्रयास करें।');
    } finally {
      setIsSavingHd(false);
    }
  };

  const handleShareHdPanchang = async () => {
    triggerHapticSelection();
    if (isSharingHd) return;
    setIsSharingHd(true);
    setStatusNotice(null);
    try {
      const dataUrl = await generateHdMoonPanchangDataUrl(panchang, placeName);
      const dateSlug = (panchang.solar.sunrise || new Date()).toISOString().slice(0, 10);
      const fileName = `shakti-panchang-hd-${dateSlug}.png`;
      const shareText = [
        `🌙 *चन्द्र कला एवं आज का पंचांग (${placeName})*`,
        `• तिथि: ${trVedic(panchang.paksha)} ${trVedic(panchang.tithi)} (${tithiProgressPct}% व्यतीत)`,
        `• चन्द्र प्रकाश: ${illuminationPct.toFixed(1)}% (${elongationDeg.toFixed(1)}° रेखांश)`,
        `• नक्षत्र: ${trVedic(panchang.nakshatra)} (चरण ${panchang.pada})`,
        `• योग: ${trVedic(panchang.yoga)} | करण: ${trVedic(panchang.karana)}`,
        `• वार: ${trVedic(panchang.weekday)} | मास: ${trVedic(panchang.masa)}`,
        `• सूर्योदय: ${formatClock(panchang.solar.sunrise)} | सूर्यास्त: ${formatClock(panchang.solar.sunset)}`,
        `• सूर्य राशि: ${trVedic(panchang.solarRashi)} | चन्द्र राशि: ${trVedic(panchang.lunarRashi)}`,
        `🕉️ *शक्ति सनातन पंचांग*`,
      ].join('\n');

      await shareImageFile({
        imageUri: dataUrl,
        fileName,
        title: 'आज का वैदिक पंचांग एवं चन्द्र कला (HD)',
        text: shareText,
      });
    } catch {
      // User cancelled share or fallback completed
    } finally {
      setIsSharingHd(false);
    }
  };

  // 2. D3 Visualization Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 280;
    const height = 240;
    const cx = width / 2;
    const cy = 110;
    const moonRadius = 54;
    const arcInnerRadius = moonRadius + 10;
    const arcOuterRadius = moonRadius + 18;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');

    const filter = defs
      .append('filter')
      .attr('id', 'moon-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');

    filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur');
    filter
      .append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    const bgGrad = defs
      .append('radialGradient')
      .attr('id', 'space-bg')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '75%');

    bgGrad.append('stop').attr('offset', '0%').attr('stop-color', '#261C14');
    bgGrad.append('stop').attr('offset', '100%').attr('stop-color', '#150E09');

    const litMoonGrad = defs
      .append('radialGradient')
      .attr('id', 'lit-moon-surface')
      .attr('cx', isWaxing ? '65%' : '35%')
      .attr('cy', '35%')
      .attr('r', '70%');

    litMoonGrad.append('stop').attr('offset', '0%').attr('stop-color', '#FFFDF4');
    litMoonGrad.append('stop').attr('offset', '45%').attr('stop-color', '#F3EAD4');
    litMoonGrad.append('stop').attr('offset', '80%').attr('stop-color', '#D9C8A7');
    litMoonGrad.append('stop').attr('offset', '100%').attr('stop-color', '#BFAC87');

    const darkMoonGrad = defs
      .append('radialGradient')
      .attr('id', 'dark-moon-surface')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '60%');

    darkMoonGrad.append('stop').attr('offset', '0%').attr('stop-color', '#33271D');
    darkMoonGrad.append('stop').attr('offset', '70%').attr('stop-color', '#20160F');
    darkMoonGrad.append('stop').attr('offset', '100%').attr('stop-color', '#120B06');

    const arcGrad = defs
      .append('linearGradient')
      .attr('id', 'tithi-arc-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    arcGrad.append('stop').attr('offset', '0%').attr('stop-color', '#E5A024');
    arcGrad.append('stop').attr('offset', '50%').attr('stop-color', '#FFC83B');
    arcGrad.append('stop').attr('offset', '100%').attr('stop-color', '#B56A00');

    svg
      .append('rect')
      .attr('x', 4)
      .attr('y', 4)
      .attr('width', width - 8)
      .attr('height', height - 8)
      .attr('rx', 16)
      .attr('fill', 'url(#space-bg)')
      .attr('stroke', '#8C6239')
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.45);

    const starCoords = [
      [24, 28],
      [55, 48],
      [42, 160],
      [240, 32],
      [225, 75],
      [250, 150],
      [80, 200],
      [210, 205],
      [30, 95],
      [255, 110],
    ];
    starCoords.forEach(([sx, sy], idx) => {
      svg
        .append('circle')
        .attr('cx', sx)
        .attr('cy', sy)
        .attr('r', idx % 3 === 0 ? 1.5 : 1)
        .attr('fill', '#FAF2E4')
        .attr('opacity', 0.35 + (idx % 4) * 0.15);
    });

    svg
      .append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', moonRadius + 2)
      .attr('fill', 'none')
      .attr('stroke', '#FFF8E7')
      .attr('stroke-width', 3)
      .attr('opacity', Math.min(0.5, illuminationPct / 180))
      .attr('filter', 'url(#moon-glow)');

    svg
      .append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', moonRadius)
      .attr('fill', 'url(#dark-moon-surface)')
      .attr('stroke', '#5C3A21')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', 0.6);

    const mariaGroup = svg.append('g').attr('opacity', 0.18);
    const mariaCraters = [
      { x: cx - 14, y: cy - 18, rx: 11, ry: 9, rot: 15 },
      { x: cx + 18, y: cy - 12, rx: 10, ry: 13, rot: -10 },
      { x: cx + 22, y: cy + 12, rx: 13, ry: 9, rot: 25 },
      { x: cx - 18, y: cy + 16, rx: 14, ry: 11, rot: -15 },
      { x: cx + 2, y: cy + 24, rx: 8, ry: 6, rot: 5 },
    ];
    mariaCraters.forEach((c) => {
      mariaGroup
        .append('ellipse')
        .attr('cx', c.x)
        .attr('cy', c.y)
        .attr('rx', c.rx)
        .attr('ry', c.ry)
        .attr('transform', `rotate(${c.rot}, ${c.x}, ${c.y})`)
        .attr('fill', '#000');
    });

    const theta = elongationDeg;
    const R = moonRadius;

    function buildLitMoonPath(angle: number, r: number): string {
      if (angle < 0.5 || angle > 359.5) {
        return '';
      }
      if (Math.abs(angle - 180) < 0.5) {
        return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
      }

      const cosAngle = Math.cos((angle * Math.PI) / 180);
      const rx = Math.abs(r * cosAngle);

      if (angle <= 180) {
        const outerArc = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`;
        const sweep = angle < 90 ? 0 : 1;
        const innerTerminator = `A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}`;
        return `${outerArc} ${innerTerminator} Z`;
      } else {
        const outerArc = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;
        const sweep = angle > 270 ? 1 : 0;
        const innerTerminator = `A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}`;
        return `${outerArc} ${innerTerminator} Z`;
      }
    }

    const litPath = buildLitMoonPath(theta, R);
    if (litPath) {
      svg
        .append('path')
        .attr('d', litPath)
        .attr('fill', 'url(#lit-moon-surface)')
        .attr('stroke', '#FFF8E7')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.98);
    }

    const arcGenerator = d3
      .arc<d3.DefaultArcObject>()
      .innerRadius(arcInnerRadius)
      .outerRadius(arcOuterRadius)
      .cornerRadius(4);

    const trackArc = arcGenerator({
      innerRadius: arcInnerRadius,
      outerRadius: arcOuterRadius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
    });

    svg
      .append('path')
      .attr('d', trackArc)
      .attr('transform', `translate(${cx}, ${cy})`)
      .attr('fill', '#3D2A1C')
      .attr('opacity', 0.65);

    const targetAngle = 2 * Math.PI * Math.max(0.02, Math.min(1.0, tithiProgress));

    const progressPath = svg
      .append('path')
      .attr('transform', `translate(${cx}, ${cy})`)
      .attr('fill', 'url(#tithi-arc-grad)')
      .attr('filter', 'drop-shadow(0px 0px 4px rgba(229,160,36,0.5))');

    progressPath
      .transition()
      .duration(750)
      .attrTween('d', () => {
        const interpolate = d3.interpolate(0.01, targetAngle);
        return (t) => {
          return (
            arcGenerator({
              innerRadius: arcInnerRadius,
              outerRadius: arcOuterRadius,
              startAngle: 0,
              endAngle: interpolate(t),
            }) || ''
          );
        };
      });

    const tipAngle = targetAngle - Math.PI / 2;
    const tipRadius = (arcInnerRadius + arcOuterRadius) / 2;
    const tipX = cx + tipRadius * Math.cos(tipAngle);
    const tipY = cy + tipRadius * Math.sin(tipAngle);

    svg
      .append('circle')
      .attr('cx', tipX)
      .attr('cy', tipY)
      .attr('r', 5)
      .attr('fill', '#FFFDF4')
      .attr('stroke', '#B56A00')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 0 3px #FFC83B)');

    [0, 0.25, 0.5, 0.75].forEach((frac) => {
      const a = frac * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + (arcInnerRadius - 3) * Math.cos(a);
      const y1 = cy + (arcInnerRadius - 3) * Math.sin(a);
      const x2 = cx + (arcOuterRadius + 3) * Math.cos(a);
      const y2 = cy + (arcOuterRadius + 3) * Math.sin(a);

      svg
        .append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#FAF2E4')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.4);
    });

    svg
      .append('text')
      .attr('x', cx)
      .attr('y', cy + arcOuterRadius + 22)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FAF2E4')
      .attr('font-size', '13px')
      .attr('font-weight', '900')
      .attr('font-family', 'sans-serif')
      .text(`${pakshaName} • ${tithiName}`);

    svg
      .append('text')
      .attr('x', cx)
      .attr('y', cy + arcOuterRadius + 37)
      .attr('text-anchor', 'middle')
      .attr('fill', '#E5A024')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text(`तिथि व्यतीत: ${tithiProgressPct}% (${(tithiProgress * 12).toFixed(1)}° / 12°)`);

    svg
      .append('text')
      .attr('x', 14)
      .attr('y', 22)
      .attr('fill', '#E5D2B8')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('letter-spacing', '0.5px')
      .text('दशम-कला चन्द्र दर्शन (D3 Engine)');

    svg
      .append('text')
      .attr('x', width - 14)
      .attr('y', 22)
      .attr('text-anchor', 'end')
      .attr('fill', isWaxing ? '#74D99F' : '#E8B074')
      .attr('font-size', '10px')
      .attr('font-weight', '800')
      .text(isWaxing ? '▲ शुक्ल (वर्धमान)' : '▼ कृष्ण (क्षीयमान)');
  }, [elongationDeg, tithiProgress, illuminationPct, isWaxing, pakshaName, tithiName, tithiProgressPct]);

  // 30-Day Tithi Cycle Map for quick lookup
  const all30Tithis = useMemo(() => {
    const list = [];
    const tithiNames = [
      'प्रतिपदा',
      'द्वितीया',
      'तृतीया',
      'चतुर्थी',
      'पंचमी',
      'षष्ठी',
      'सप्तमी',
      'अष्टमी',
      'नवमी',
      'दशमी',
      'एकादशी',
      'द्वादशी',
      'त्रयोदशी',
      'चतुर्दशी',
      'पूर्णिमा / अमावस्या',
    ];
    for (let i = 1; i <= 30; i++) {
      const isShukla = i <= 15;
      const idxInPaksha = (i - 1) % 15;
      const name = idxInPaksha === 14 ? (isShukla ? 'पूर्णिमा' : 'अमावस्या') : tithiNames[idxInPaksha];
      const approxIllum = ((1 - Math.cos(((i - 0.5) * 12 * Math.PI) / 180)) / 2) * 100;
      list.push({
        index: i,
        name,
        paksha: isShukla ? 'शुक्ल' : 'कृष्ण',
        illum: Math.round(approxIllum),
        isCurrent: i === tithiNum,
      });
    }
    return list;
  }, [tithiNum]);

  return (
    <div
      data-zsp-atomic="1"
      style={{
        backgroundColor: "var(--bx-panel)",
        borderColor: "var(--bx-line)",
        color: "var(--bx-ink)",
      }}
      className="border rounded-xl p-3 sm:p-4 shadow-xs space-y-3"
    >
      {/* Header Bar */}
      <div
        style={{ borderColor: "var(--bx-line)" }}
        className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5"
      >
        <div className="flex items-center gap-2">
          <div
            style={{ backgroundColor: "var(--bx-header)", color: "#FFFFFF" }}
            className="p-1.5 rounded-lg shadow-xs"
          >
            <Moon className="w-4 h-4" style={{ color: "var(--bx-gold)" }} />
          </div>
          <div>
            <h3
              style={{ color: "var(--bx-header)" }}
              className="font-bold font-granth text-sm sm:text-base flex items-center gap-1.5"
            >
              <span>चन्द्र कला एवं तिथि प्रगति चक्र (Moon Phase & Tithi Orbit)</span>
              <span
                style={{ backgroundColor: "var(--bx-gold)", color: "#FFFFFF" }}
                className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
              >
                D3.js
              </span>
            </h3>
            <p style={{ color: "var(--bx-mute)" }} className="text-[11px]">
              दृक-सिद्ध सूर्य-चंद्र कोणीय अंतर (Elongation) आधारित वास्तविक खगोलीय चन्द्रमा
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHapticSelection();
            setShowOrbitCycle(!showOrbitCycle);
          }}
          style={{
            backgroundColor: "var(--bx-cream)",
            borderColor: "var(--bx-line)",
            color: "var(--bx-header)",
          }}
          className="text-xs font-bold border rounded-lg px-2.5 py-1 flex items-center gap-1 transition cursor-pointer hover:opacity-90 shadow-2xs"
        >
          <span>{showOrbitCycle ? 'चक्र संक्षेप' : '३० तिथि महा-चक्र'}</span>
          {showOrbitCycle ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Grid: D3 SVG Graphic on left, Astrological Metrics on right */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* D3 Graphical Canvas */}
        <div className="sm:col-span-6 lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[280px]">
            <svg
              ref={svgRef}
              className="w-full h-auto drop-shadow-md rounded-2xl select-none"
            />
          </div>
        </div>

        {/* Realtime Metrics & Vedic Astrological Calculations */}
        <div className="sm:col-span-6 lg:col-span-7 space-y-2.5">
          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 gap-2">
            <div
              style={{
                backgroundColor: "var(--bx-cream)",
                borderColor: "var(--bx-line)",
              }}
              className="border rounded-lg p-2.5 shadow-2xs"
            >
              <span
                style={{ color: "var(--bx-mute)" }}
                className="text-[10px] font-bold uppercase tracking-wider block"
              >
                चन्द्र प्रकाश (Illumination)
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  style={{ color: "var(--bx-header)" }}
                  className="text-xl font-black font-granth"
                >
                  {illuminationPct.toFixed(1)}%
                </span>
                <span style={{ color: "var(--bx-mute)" }} className="text-[11px] font-medium">प्रकाशित</span>
              </div>
              <div
                style={{ backgroundColor: "var(--bx-line)" }}
                className="w-full h-1.5 rounded-full overflow-hidden mt-1.5"
              >
                <div
                  style={{
                    backgroundColor: "var(--bx-gold)",
                    width: `${Math.min(100, Math.max(2, illuminationPct))}%`,
                  }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bx-cream)",
                borderColor: "var(--bx-line)",
              }}
              className="border rounded-lg p-2.5 shadow-2xs"
            >
              <span
                style={{ color: "var(--bx-mute)" }}
                className="text-[10px] font-bold uppercase tracking-wider block"
              >
                सूर्य-चन्द्र कोणीय अंतर
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  style={{ color: "var(--bx-header)" }}
                  className="text-xl font-black font-granth"
                >
                  {elongationDeg.toFixed(1)}°
                </span>
                <span style={{ color: "var(--bx-mute)" }} className="text-[11px] font-medium">रेखांश</span>
              </div>
              <span style={{ color: "var(--bx-ink)" }} className="text-[10px] block mt-1">
                १ तिथि = १२° (व्यतीत: {(tithiProgress * 12).toFixed(2)}°)
              </span>
            </div>
          </div>

          {/* Current Tithi Progress Details */}
          <div
            style={{
              backgroundColor: "var(--bx-cream)",
              borderColor: "var(--bx-line)",
            }}
            className="border rounded-lg p-2.5 space-y-1.5 text-xs shadow-2xs"
          >
            <div
              style={{ color: "var(--bx-header)" }}
              className="flex items-center justify-between font-bold"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: "var(--bx-gold)" }} />
                <span>तिथि विस्तार एवं समाप्ति</span>
              </span>
              <span
                style={{ backgroundColor: "var(--bx-header)", color: "#FFFFFF" }}
                className="text-xs px-2 py-0.5 rounded-md font-bold"
              >
                {tithiProgressPct}% व्यतीत
              </span>
            </div>

            <div style={{ color: "var(--bx-ink)" }} className="text-[11px] space-y-1">
              <p>
                <strong>वर्तमान तिथि:</strong> {pakshaName} की {tithiName} (तिथि संख्या {tithiNum}/30)
              </p>
              {panchang.tithiSpan && (
                <p>
                  <strong>समाप्ति काल:</strong>{' '}
                  {panchang.tithiSpan.end.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })} तक
                  (तदोपरांत {panchang.tithiSpan.nextName} आरम्भ)
                </p>
              )}
              <p>
                <strong>चन्द्र स्थिति:</strong> {rashi} राशि • {nakshatra} नक्षत्र
              </p>
            </div>
          </div>

          {/* Astronomical Note */}
          <div
            style={{
              backgroundColor: "var(--bx-panel)",
              borderColor: "var(--bx-line)",
              color: "var(--bx-ink)",
            }}
            className="flex items-start gap-1.5 text-[11px] p-2 rounded-lg border shadow-2xs"
          >
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--bx-gold)" }} />
            <span className="leading-snug">
              सूर्य और चन्द्रमा के स्पष्ट देशांतर का अंतर जब १२° बढ़ता है, तब एक तिथि पूर्ण होती है। ०° पर अमावस्या तथा १८०° पर पूर्णिमा होती है।
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Share & HD Save Action Bar */}
      <div className="pt-2 border-t border-[#8C6239]/25 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleShareHdPanchang}
          disabled={isSharingHd}
          className="flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#5C3A21] to-[#7A4B2A] hover:brightness-110 text-[#FAF2E4] font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
        >
          {isSharingHd ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#FFD88A]" />
          ) : (
            <Share2 className="w-4 h-4 text-[#FFD88A]" />
          )}
          <span>पंचांग शेयर करें (Share)</span>
        </button>

        <button
          type="button"
          onClick={handleSaveHdImage}
          disabled={isSavingHd}
          className="flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
        >
          {isSavingHd ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
          ) : (
            <Download className="w-4 h-4 text-amber-200" />
          )}
          <span>HD में सेव करें (1080p)</span>
        </button>

        {onWhatsApp && (
          <button
            type="button"
            onClick={() => {
              triggerHapticSelection();
              onWhatsApp();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#F4E8D1] hover:bg-[#E8D5B5] border border-[#8C6239]/40 text-[#5C3A21] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            title="व्हाट्सएप सुप्रभात पंचांग कार्ड स्टूडियो"
          >
            <MessageCircle className="w-4 h-4 text-emerald-700" />
            <span>व्हाट्सएप कार्ड</span>
          </button>
        )}
      </div>

      {statusNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* 30-Tithi Interactive Orbit Strip (Expandable) */}
      {showOrbitCycle && (
        <div className="mt-3 pt-3 border-t border-[#8C6239]/20 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#5C3A21] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>सम्पूर्ण ३० तिथि चन्द्र-कला चक्र (1 to 30 Lunar Cycle)</span>
            </span>
            <span className="text-[11px] text-[#8C6239]">किसी भी तिथि पर क्लिक करें</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-15 gap-1 text-center">
            {all30Tithis.map((t) => {
              const isSelected = selectedTithiIndex === t.index || (selectedTithiIndex === null && t.isCurrent);
              return (
                <button
                  key={t.index}
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setSelectedTithiIndex(t.index);
                  }}
                  className={`p-1 rounded-md text-[10px] transition cursor-pointer flex flex-col items-center justify-between min-h-[52px] ${
                    t.isCurrent
                      ? 'bg-[#B56A00] text-white font-black shadow-xs ring-2 ring-[#B56A00]/40'
                      : isSelected
                      ? 'bg-[#5C3A21] text-white font-bold'
                      : 'bg-white hover:bg-[#F4E8D1] border border-[#8C6239]/20 text-[#5C3A21]'
                  }`}
                  title={`${t.paksha} ${t.name} (प्रकाश: ${t.illum}%)`}
                >
                  <span className="font-mono text-[9px] opacity-80">{t.index}</span>
                  <span className="truncate w-full font-semibold">{t.name.slice(0, 4)}</span>
                  <span className={`text-[9px] ${t.isCurrent ? 'text-amber-200' : 'text-[#8C6239]'}`}>
                    {t.illum}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Tithi Details Bar */}
          {selectedTithiIndex && (
            <div className="p-2 bg-white rounded-lg border border-[#8C6239]/30 text-xs flex items-center justify-between animate-in fade-in duration-100">
              <span className="font-bold text-[#5C3A21]">
                तिथि {selectedTithiIndex}: {all30Tithis[selectedTithiIndex - 1]?.paksha}{' '}
                {all30Tithis[selectedTithiIndex - 1]?.name}
              </span>
              <span className="text-[#8C6239]">
                अनुमानित चन्द्र कला: {all30Tithis[selectedTithiIndex - 1]?.illum}% प्रकाश
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
