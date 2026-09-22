import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { VedicPanchangData } from '../types';
import { Moon, Sparkles, Clock, Compass, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface MoonPhaseChartProps {
  panchang: VedicPanchangData;
}

export const MoonPhaseChart: React.FC<MoonPhaseChartProps> = ({ panchang }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedTithiIndex, setSelectedTithiIndex] = useState<number | null>(null);
  const [showOrbitCycle, setShowOrbitCycle] = useState(false);

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
    // Difference between Moon and Sun sidereal / tropical longitudes (0 to 360 deg)
    const rawDiff = ((panchang.moonLongitude - panchang.sunLongitude) % 360 + 360) % 360;
    // Each Tithi is 12 degrees
    const tNum = Math.floor(rawDiff / 12) + 1; // 1 to 30
    const prog = (rawDiff % 12) / 12; // 0.0 to 1.0

    // Accurate illumination fraction: (1 - cos(elongation)) / 2
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

  // 2. D3 Visualization Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 280;
    const height = 240;
    const cx = width / 2;
    const cy = 110;
    const moonRadius = 54;
    const arcInnerRadius = moonRadius + 10;
    const arcOuterRadius = moonRadius + 18;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const defs = svg.append('defs');

    // Glow filter for moon moonlight
    const filter = defs.append('filter')
      .attr('id', 'moon-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'blur');

    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Subtle starfield background pattern
    const bgGrad = defs.append('radialGradient')
      .attr('id', 'space-bg')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '75%');

    bgGrad.append('stop').attr('offset', '0%').attr('stop-color', '#261C14');
    bgGrad.append('stop').attr('offset', '100%').attr('stop-color', '#150E09');

    // Lit Moon Gradient (creamy lunar surface)
    const litMoonGrad = defs.append('radialGradient')
      .attr('id', 'lit-moon-surface')
      .attr('cx', isWaxing ? '65%' : '35%')
      .attr('cy', '35%')
      .attr('r', '70%');

    litMoonGrad.append('stop').attr('offset', '0%').attr('stop-color', '#FFFDF4');
    litMoonGrad.append('stop').attr('offset', '45%').attr('stop-color', '#F3EAD4');
    litMoonGrad.append('stop').attr('offset', '80%').attr('stop-color', '#D9C8A7');
    litMoonGrad.append('stop').attr('offset', '100%').attr('stop-color', '#BFAC87');

    // Dark Moon Gradient (Earthshine / ash light)
    const darkMoonGrad = defs.append('radialGradient')
      .attr('id', 'dark-moon-surface')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '60%');

    darkMoonGrad.append('stop').attr('offset', '0%').attr('stop-color', '#33271D');
    darkMoonGrad.append('stop').attr('offset', '70%').attr('stop-color', '#20160F');
    darkMoonGrad.append('stop').attr('offset', '100%').attr('stop-color', '#120B06');

    // Golden Arc Progress Gradient
    const arcGrad = defs.append('linearGradient')
      .attr('id', 'tithi-arc-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');

    arcGrad.append('stop').attr('offset', '0%').attr('stop-color', '#E5A024');
    arcGrad.append('stop').attr('offset', '50%').attr('stop-color', '#FFC83B');
    arcGrad.append('stop').attr('offset', '100%').attr('stop-color', '#B56A00');

    // Backdrop Card Canvas
    svg.append('rect')
      .attr('x', 4)
      .attr('y', 4)
      .attr('width', width - 8)
      .attr('height', height - 8)
      .attr('rx', 16)
      .attr('fill', 'url(#space-bg)')
      .attr('stroke', '#8C6239')
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.45);

    // Subtle decorative celestial stars
    const starCoords = [
      [24, 28], [55, 48], [42, 160], [240, 32], [225, 75],
      [250, 150], [80, 200], [210, 205], [30, 95], [255, 110]
    ];
    starCoords.forEach(([sx, sy], idx) => {
      svg.append('circle')
        .attr('cx', sx)
        .attr('cy', sy)
        .attr('r', idx % 3 === 0 ? 1.5 : 1)
        .attr('fill', '#FAF2E4')
        .attr('opacity', 0.35 + (idx % 4) * 0.15);
    });

    // Outer Aura Glow Ring
    svg.append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', moonRadius + 2)
      .attr('fill', 'none')
      .attr('stroke', '#FFF8E7')
      .attr('stroke-width', 3)
      .attr('opacity', Math.min(0.5, illuminationPct / 180))
      .attr('filter', 'url(#moon-glow)');

    // 1. Base Dark Moon Sphere (Unlit Hemisphere with Earthshine)
    svg.append('circle')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', moonRadius)
      .attr('fill', 'url(#dark-moon-surface)')
      .attr('stroke', '#5C3A21')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', 0.6);

    // Subtle Lunar Crater Mare Textures (astronomically styled maria)
    const mariaGroup = svg.append('g').attr('opacity', 0.18);
    const mariaCraters = [
      { x: cx - 14, y: cy - 18, rx: 11, ry: 9, rot: 15 }, // Mare Imbrium
      { x: cx + 18, y: cy - 12, rx: 10, ry: 13, rot: -10 }, // Mare Serenitatis
      { x: cx + 22, y: cy + 12, rx: 13, ry: 9, rot: 25 }, // Mare Tranquillitatis
      { x: cx - 18, y: cy + 16, rx: 14, ry: 11, rot: -15 }, // Oceanus Procellarum
      { x: cx + 2, y: cy + 24, rx: 8, ry: 6, rot: 5 }, // Mare Nubium
    ];
    mariaCraters.forEach((c) => {
      mariaGroup.append('ellipse')
        .attr('cx', c.x)
        .attr('cy', c.y)
        .attr('rx', c.rx)
        .attr('ry', c.ry)
        .attr('transform', `rotate(${c.rot}, ${c.x}, ${c.y})`)
        .attr('fill', '#000');
    });

    // 2. Mathematically Exact Lunar Terminator & Lit Path
    const theta = elongationDeg; // 0 to 360
    const R = moonRadius;

    // Helper to build D3 path for the illuminated region
    function buildLitMoonPath(angle: number, r: number): string {
      // 0 deg: New Moon (None lit)
      if (angle < 0.5 || angle > 359.5) {
        return '';
      }
      // 180 deg: Full Moon (Fully lit)
      if (Math.abs(angle - 180) < 0.5) {
        return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
      }

      const cosAngle = Math.cos((angle * Math.PI) / 180);
      const rx = Math.abs(r * cosAngle);

      if (angle <= 180) {
        // Shukla Paksha (Waxing): Right side is illuminated
        // Outer arc on right: from (cx, cy - r) to (cx, cy + r)
        const outerArc = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`;
        // Terminator arc returning to (cx, cy - r)
        // If angle < 90 (crescent): terminator bends towards the right (sweep = 0)
        // If angle >= 90 (gibbous): terminator bends into dark left side (sweep = 1)
        const sweep = angle < 90 ? 0 : 1;
        const innerTerminator = `A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}`;
        return `${outerArc} ${innerTerminator} Z`;
      } else {
        // Krishna Paksha (Waning): Left side is illuminated
        // Outer arc on left: from (cx, cy - r) to (cx, cy + r)
        const outerArc = `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;
        // Terminator arc returning to (cx, cy - r)
        // If angle > 270 (crescent): terminator bends towards left (sweep = 1)
        // If angle <= 270 (gibbous): terminator bends into dark right side (sweep = 0)
        const sweep = angle > 270 ? 1 : 0;
        const innerTerminator = `A ${rx} ${r} 0 0 ${sweep} ${cx} ${cy - r}`;
        return `${outerArc} ${innerTerminator} Z`;
      }
    }

    const litPath = buildLitMoonPath(theta, R);
    if (litPath) {
      svg.append('path')
        .attr('d', litPath)
        .attr('fill', 'url(#lit-moon-surface)')
        .attr('stroke', '#FFF8E7')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.98);
    }

    // 3. D3 TITHI PROGRESS RADIAL ARC GAUGE
    const arcGenerator = d3.arc<d3.DefaultArcObject>()
      .innerRadius(arcInnerRadius)
      .outerRadius(arcOuterRadius)
      .cornerRadius(4);

    // Background track ring
    const trackArc = arcGenerator({
      innerRadius: arcInnerRadius,
      outerRadius: arcOuterRadius,
      startAngle: 0,
      endAngle: 2 * Math.PI,
    });

    svg.append('path')
      .attr('d', trackArc)
      .attr('transform', `translate(${cx}, ${cy})`)
      .attr('fill', '#3D2A1C')
      .attr('opacity', 0.65);

    // Active progress arc (smooth animated entrance)
    const targetAngle = 2 * Math.PI * Math.max(0.02, Math.min(1.0, tithiProgress));

    const progressPath = svg.append('path')
      .attr('transform', `translate(${cx}, ${cy})`)
      .attr('fill', 'url(#tithi-arc-grad)')
      .attr('filter', 'drop-shadow(0px 0px 4px rgba(229,160,36,0.5))');

    // Smooth transition with D3
    progressPath.transition()
      .duration(750)
      .attrTween('d', () => {
        const interpolate = d3.interpolate(0.01, targetAngle);
        return (t) => {
          return arcGenerator({
            innerRadius: arcInnerRadius,
            outerRadius: arcOuterRadius,
            startAngle: 0,
            endAngle: interpolate(t),
          }) || '';
        };
      });

    // Needle / Indicator Orb at the tip of the Tithi arc
    const tipAngle = targetAngle - Math.PI / 2; // offset for trig coordinate
    const tipRadius = (arcInnerRadius + arcOuterRadius) / 2;
    const tipX = cx + tipRadius * Math.cos(tipAngle);
    const tipY = cy + tipRadius * Math.sin(tipAngle);

    svg.append('circle')
      .attr('cx', tipX)
      .attr('cy', tipY)
      .attr('r', 5)
      .attr('fill', '#FFFDF4')
      .attr('stroke', '#B56A00')
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 0 3px #FFC83B)');

    // 4. Tick Marks on Orbit (0%, 25%, 50%, 75% markers)
    [0, 0.25, 0.5, 0.75].forEach((frac) => {
      const a = frac * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + (arcInnerRadius - 3) * Math.cos(a);
      const y1 = cy + (arcInnerRadius - 3) * Math.sin(a);
      const x2 = cx + (arcOuterRadius + 3) * Math.cos(a);
      const y2 = cy + (arcOuterRadius + 3) * Math.sin(a);

      svg.append('line')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', '#FAF2E4')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.4);
    });

    // 5. Center Bottom Status Badges
    // Tithi & Progress Text
    svg.append('text')
      .attr('x', cx)
      .attr('y', cy + arcOuterRadius + 22)
      .attr('text-anchor', 'middle')
      .attr('fill', '#FAF2E4')
      .attr('font-size', '13px')
      .attr('font-weight', '900')
      .attr('font-family', 'sans-serif')
      .text(`${pakshaName} • ${tithiName}`);

    svg.append('text')
      .attr('x', cx)
      .attr('y', cy + arcOuterRadius + 37)
      .attr('text-anchor', 'middle')
      .attr('fill', '#E5A024')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text(`तिथि व्यतीत: ${tithiProgressPct}% (${(elongationDeg % 12).toFixed(1)}° / 12°)`);

    // Top Header In-SVG Label
    svg.append('text')
      .attr('x', 14)
      .attr('y', 22)
      .attr('fill', '#E5D2B8')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('letter-spacing', '0.5px')
      .text('दशम-कला चन्द्र दर्शन (D3 Engine)');

    svg.append('text')
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
      'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
      'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
      'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा / अमावस्या'
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
    <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-3 sm:p-4 shadow-xs space-y-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8C6239]/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#5C3A21] text-[#FAF2E4] rounded-lg shadow-xs">
            <Moon className="w-4 h-4 text-[#E5A024]" />
          </div>
          <div>
            <h3 className="font-bold font-granth text-sm sm:text-base text-[#5C3A21] flex items-center gap-1.5">
              <span>चन्द्र कला एवं तिथि प्रगति चक्र (Moon Phase & Tithi Orbit)</span>
              <span className="text-[10px] bg-[#B56A00] text-white px-1.5 py-0.5 rounded font-mono font-bold">
                D3.js
              </span>
            </h3>
            <p className="text-[11px] text-[#735133]">
              दृक-सिद्ध सूर्य-चंद्र कोणीय अंतर (Elongation) आधारित वास्तविक खगोलीय चन्द्रमा
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowOrbitCycle(!showOrbitCycle)}
          className="text-xs font-bold text-[#5C3A21] hover:text-[#8B1E1E] bg-[#F4E8D1] hover:bg-[#EBDDC1] border border-[#8C6239]/30 rounded-lg px-2.5 py-1 flex items-center gap-1 transition cursor-pointer"
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
            <div className="bg-white border border-[#8C6239]/30 rounded-lg p-2.5 shadow-2xs">
              <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                चन्द्र प्रकाश (Illumination)
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-granth text-[#5C3A21]">
                  {illuminationPct.toFixed(1)}%
                </span>
                <span className="text-[11px] text-[#8C6239] font-medium">प्रकाशित</span>
              </div>
              <div className="w-full bg-[#E5D2B8] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-[#E5A024] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(2, illuminationPct))}%` }}
                />
              </div>
            </div>

            <div className="bg-white border border-[#8C6239]/30 rounded-lg p-2.5 shadow-2xs">
              <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                सूर्य-चन्द्र कोणीय अंतर
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black font-granth text-[#5C3A21]">
                  {elongationDeg.toFixed(1)}°
                </span>
                <span className="text-[11px] text-[#8C6239] font-medium">रेखांश</span>
              </div>
              <span className="text-[10px] text-[#735133] block mt-1">
                १ तिथि = १२° (वर्तमान: {(elongationDeg % 12).toFixed(2)}°)
              </span>
            </div>
          </div>

          {/* Current Tithi Progress Details */}
          <div className="bg-[#F4E8D1]/80 border border-[#8C6239]/30 rounded-lg p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-[#5C3A21]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>तिथि विस्तार एवं समाप्ति</span>
              </span>
              <span className="text-xs bg-[#B56A00] text-white px-2 py-0.5 rounded-md font-bold">
                {tithiProgressPct}% व्यतीत
              </span>
            </div>

            <div className="text-[11px] text-[#735133] space-y-1">
              <p>
                <strong className="text-[#5C3A21]">वर्तमान तिथि:</strong> {pakshaName} की {tithiName} (तिथि संख्या {tithiNum}/30)
              </p>
              {panchang.tithiSpan && (
                <p>
                  <strong className="text-[#5C3A21]">समाप्ति काल:</strong>{' '}
                  {panchang.tithiSpan.end.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })} तक
                  (तदोपरांत {panchang.tithiSpan.nextName} आरम्भ)
                </p>
              )}
              <p>
                <strong className="text-[#5C3A21]">चन्द्र स्थिति:</strong> {rashi} राशि • {nakshatra} नक्षत्र
              </p>
            </div>
          </div>

          {/* Astronomical Note */}
          <div className="flex items-start gap-1.5 text-[11px] text-[#735133] bg-white/70 p-2 rounded-lg border border-[#8C6239]/20">
            <Info className="w-3.5 h-3.5 text-[#B56A00] shrink-0 mt-0.5" />
            <span className="leading-snug">
              सूर्य और चन्द्रमा के स्पष्ट देशांतर का अंतर जब १२° बढ़ता है, तब एक तिथि पूर्ण होती है। ०° पर अमावस्या तथा १८०° पर पूर्णिमा होती है।
            </span>
          </div>
        </div>
      </div>

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
                  onClick={() => setSelectedTithiIndex(t.index)}
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
                तिथि {selectedTithiIndex}: {all30Tithis[selectedTithiIndex - 1]?.paksha} {all30Tithis[selectedTithiIndex - 1]?.name}
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
