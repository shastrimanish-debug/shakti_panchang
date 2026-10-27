import React, { useState, useId, useMemo, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { PlanetPosition } from '../types';
import { RASHIS, calculateVargaSign } from '../services/astronomy';
import { triggerHapticSelection } from '../utils/haptics';
import { ThreeKundaliCanvas, ThreeFormattedPlanet } from './ThreeKundaliCanvas';

export interface KundaliChartProps {
  lagnaDegree: number;
  planets: PlanetPosition[];
  vargaDivision?: number;
  chartTitle?: string;
  allowToggleStyle?: boolean;
  defaultRenderMode?: 'three3d' | 'relief3d';
}

interface HouseCoord {
  house: number;
  cx: number;
  cy: number;
  numX: number;
  numY: number;
  shapeType: 'center-diamond' | 'side-diamond' | 'top-triangle' | 'bottom-triangle' | 'left-triangle' | 'right-triangle';
  clipPoints: string;
}

const NORTH_HOUSE_COORDS: HouseCoord[] = [
  { house: 1, cx: 180, cy: 105, numX: 180, numY: 29, shapeType: 'center-diamond', clipPoints: '180,15 261,96 180,177 99,96' },
  { house: 2, cx: 96, cy: 34, numX: 96, numY: 77, shapeType: 'top-triangle', clipPoints: '16,14 176,14 96,93' },
  { house: 3, cx: 17, cy: 96, numX: 77, numY: 96, shapeType: 'left-triangle', clipPoints: '14,16 93,96 14,176' },
  { house: 4, cx: 104, cy: 180, numX: 29, numY: 180, shapeType: 'side-diamond', clipPoints: '96,99 177,180 96,261 15,180' },
  { house: 5, cx: 17, cy: 264, numX: 77, numY: 264, shapeType: 'left-triangle', clipPoints: '14,184 93,264 14,344' },
  { house: 6, cx: 96, cy: 326, numX: 96, numY: 283, shapeType: 'bottom-triangle', clipPoints: '16,346 96,267 176,346' },
  { house: 7, cx: 180, cy: 255, numX: 180, numY: 331, shapeType: 'center-diamond', clipPoints: '180,183 261,264 180,345 99,264' },
  { house: 8, cx: 264, cy: 326, numX: 264, numY: 283, shapeType: 'bottom-triangle', clipPoints: '184,346 264,267 344,346' },
  { house: 9, cx: 343, cy: 264, numX: 283, numY: 264, shapeType: 'right-triangle', clipPoints: '346,184 346,344 267,264' },
  { house: 10, cx: 256, cy: 180, numX: 331, numY: 180, shapeType: 'side-diamond', clipPoints: '264,99 345,180 264,261 183,180' },
  { house: 11, cx: 343, cy: 96, numX: 283, numY: 96, shapeType: 'right-triangle', clipPoints: '346,16 346,176 267,96' },
  { house: 12, cx: 264, cy: 34, numX: 264, numY: 77, shapeType: 'top-triangle', clipPoints: '184,14 344,14 264,93' },
];

const SOUTH_SIGNS = [
  { signIdx: 11, row: 0, col: 0, name: 'मीन' },
  { signIdx: 0, row: 0, col: 1, name: 'मेष' },
  { signIdx: 1, row: 0, col: 2, name: 'वृषभ' },
  { signIdx: 2, row: 0, col: 3, name: 'मिथुन' },
  { signIdx: 10, row: 1, col: 0, name: 'कुंभ' },
  { signIdx: 3, row: 1, col: 3, name: 'कर्क' },
  { signIdx: 9, row: 2, col: 0, name: 'मकर' },
  { signIdx: 4, row: 2, col: 3, name: 'सिंह' },
  { signIdx: 8, row: 3, col: 0, name: 'धनु' },
  { signIdx: 7, row: 3, col: 1, name: 'वृश्चिक' },
  { signIdx: 6, row: 3, col: 2, name: 'तुला' },
  { signIdx: 5, row: 3, col: 3, name: 'कन्या' },
];

export const KundaliChart: React.FC<KundaliChartProps> = ({
  lagnaDegree,
  planets,
  vargaDivision = 1,
  chartTitle,
  allowToggleStyle = true,
  defaultRenderMode,
}) => {
  const uid = useId().replace(/:/g, '');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [showDegrees, setShowDegrees] = useState(true);
  // Multi-chart grids (allowToggleStyle=false) default to instant 3D Relief SVG to prevent WebGL context exhaustion
  const [renderMode, setRenderMode] = useState<'three3d' | 'relief3d'>(
    defaultRenderMode ?? (allowToggleStyle ? 'three3d' : 'relief3d')
  );
  const [depthMode, setDepthMode] = useState<'sculpted' | 'deep'>('sculpted');

  // Centered Pinch-to-Zoom state (1.0x to 2.5x)
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2.5;
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const pinchStateRef = useRef<{ startDist: number; startScale: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const clampZoom = useCallback((val: number) => {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(val.toFixed(3))));
  }, []);

  const handleZoomIn = useCallback(() => {
    triggerHapticSelection();
    setZoomScale((prev) => clampZoom(prev + 0.25));
  }, [clampZoom]);

  const handleZoomOut = useCallback(() => {
    triggerHapticSelection();
    setZoomScale((prev) => clampZoom(prev - 0.25));
  }, [clampZoom]);

  const handleZoomReset = useCallback(() => {
    triggerHapticSelection();
    setZoomScale(1);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2) {
        e.stopPropagation();
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.hypot(dx, dy);
        if (dist > 8) {
          pinchStateRef.current = {
            startDist: dist,
            startScale: zoomScale,
          };
          setIsPinching(true);
        }
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTapTimeRef.current < 280) {
          e.stopPropagation();
          triggerHapticSelection();
          setZoomScale((prev) => (prev > 1.08 ? 1 : 1.65));
          lastTapTimeRef.current = 0;
        } else {
          lastTapTimeRef.current = now;
        }
      }
    },
    [zoomScale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2 && pinchStateRef.current) {
        e.stopPropagation();
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.hypot(dx, dy);
        if (pinchStateRef.current.startDist > 8) {
          const ratio = dist / pinchStateRef.current.startDist;
          const nextScale = clampZoom(pinchStateRef.current.startScale * ratio);
          setZoomScale(nextScale);
        }
      }
    },
    [clampZoom]
  );

  const handleTouchEnd = useCallback(() => {
    if (pinchStateRef.current) {
      pinchStateRef.current = null;
      setIsPinching(false);
      setZoomScale((prev) => (prev < 1.04 ? 1 : prev));
    }
  }, []);

  const handleWheelZoom = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.ctrlKey || e.metaKey || zoomScale > 1) {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setZoomScale((prev) => {
          const next = clampZoom(prev + delta);
          return next < 1.04 ? 1 : next;
        });
      }
    },
    [clampZoom, zoomScale]
  );

  const ascSignIdx = useMemo(
    () => calculateVargaSign(lagnaDegree, vargaDivision),
    [lagnaDegree, vargaDivision]
  );

  const { housePlanets, signPlanets } = useMemo(() => {
    const hMap: Record<number, ThreeFormattedPlanet[]> = {};
    for (let i = 1; i <= 12; i++) hMap[i] = [];

    const sMap: Record<number, ThreeFormattedPlanet[]> = {};
    for (let i = 0; i < 12; i++) sMap[i] = [];

    planets.forEach((p) => {
      const vargaSign = calculateVargaSign(p.degree, vargaDivision);
      const house = ((vargaSign - ascSignIdx + 12) % 12) + 1;
      const isBenefic = ['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(p.planet);
      const slice = 30 / Math.max(1, vargaDivision);
      const degInVarga =
        vargaDivision === 1 ? p.degreeInRashi : (p.degreeInRashi % slice) * vargaDivision;
      const degStr = `${Math.floor(degInVarga)}°`;

      const item: ThreeFormattedPlanet = {
        name: p.planet,
        degreeStr: degStr,
        isRetro: p.isRetrograde,
        isBenefic,
        english: p.englishName,
      };

      hMap[house]?.push(item);
      sMap[vargaSign]?.push(item);
    });

    return { housePlanets: hMap, signPlanets: sMap };
  }, [planets, vargaDivision, ascSignIdx]);

  return (
    <div
      className="flex flex-col items-center p-3 sm:p-4 rounded-2xl border border-[#B56A00]/45 shadow-sm w-full"
      style={{
        background: 'linear-gradient(180deg, #FFFDF9 0%, #FAF2E4 100%)',
      }}
    >
      {/* Chart Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#8C6239]/25">
        <div className="text-xs sm:text-sm font-black font-granth text-[#4A200A] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#8B1E1E] shadow-xs" />
          <span>{chartTitle || '3D वैदिक कुण्डली चक्र'}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-bold"
            style={{ backgroundColor: '#5C2D0C', color: '#FFF3C4' }}
          >
            3D
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerHapticSelection();
              setRenderMode(renderMode === 'three3d' ? 'relief3d' : 'three3d');
            }}
            className="px-2.5 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer"
            style={
              renderMode === 'three3d'
                ? {
                    backgroundColor: '#5C2D0C',
                    color: '#FFF3C4',
                    borderColor: '#D97706',
                  }
                : {
                    backgroundColor: '#FFF3D6',
                    color: '#5C2D0C',
                    borderColor: '#C88A2B',
                  }
            }
            title="3D स्वर्ण यंत्र या 3D उभरा यंत्र चुनें"
          >
            {renderMode === 'three3d' ? '✦ 3D स्वर्ण यंत्र: चालू' : '✦ 3D स्वर्ण यंत्र में देखें'}
          </button>

          {allowToggleStyle && (
            <>
              {renderMode === 'relief3d' && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    setDepthMode(depthMode === 'sculpted' ? 'deep' : 'sculpted');
                  }}
                  className="px-2 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer"
                  style={
                    depthMode === 'deep'
                      ? { backgroundColor: '#5C2D0C', color: '#FFF3C4', borderColor: '#5C2D0C' }
                      : { backgroundColor: '#F4E8D1', color: '#5C2D0C', borderColor: '#C88A2B' }
                  }
                  title="3D झुकाव एवं गहराई बदलें"
                >
                  {depthMode === 'deep' ? '3D: गहरा कोण' : '3D: उभरा दृश्य'}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setShowDegrees(!showDegrees);
                }}
                className="px-2 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer"
                style={
                  showDegrees
                    ? { backgroundColor: '#B56A00', color: '#FFFFFF', borderColor: '#B56A00' }
                    : { backgroundColor: '#F4E8D1', color: '#5C2D0C', borderColor: '#C88A2B' }
                }
                title="ग्रहों के अंश दर्शाएँ या छिपाएँ"
              >
                {showDegrees ? 'अंश: चालू' : 'अंश: बंद'}
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHapticSelection();
                  setChartStyle(chartStyle === 'north' ? 'south' : 'north');
                }}
                className="px-2 py-1 text-[10px] font-bold rounded-lg border bg-[#F4E8D1] hover:bg-[#EBDCC0] text-[#5C2D0C] border-[#C88A2B] transition cursor-pointer"
                title="उत्तर/दक्षिण भारतीय शैली बदलें"
              >
                {chartStyle === 'north' ? 'दक्षिण भारतीय' : 'उत्तर भारतीय'}
              </button>
            </>
          )}

          {renderMode === 'relief3d' && (
            <div
              className="inline-flex items-center rounded-lg border border-[#C88A2B] bg-[#F4E8D1] overflow-hidden"
              title="चुटकी से ज़ूम करें (Pinch-to-Zoom)"
            >
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale <= MIN_ZOOM}
                aria-label="ज़ूम कम करें"
                className="px-1.5 py-1 text-[#5C2D0C] hover:bg-[#EBDCC0] disabled:opacity-40 transition cursor-pointer"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-1.5 py-0.5 text-[10px] font-black text-[#5C2D0C] border-x border-[#C88A2B]/50 cursor-pointer"
                title="ज़ूम 100% पर रीसेट करें"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= MAX_ZOOM}
                aria-label="ज़ूम बढ़ाएँ"
                className="px-1.5 py-1 text-[#5C2D0C] hover:bg-[#EBDCC0] disabled:opacity-40 transition cursor-pointer"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary 3D Render Stage: Three.js WebGL 3D Perspective or Sculpted 3D Relief */}
      {renderMode === 'three3d' ? (
        <ThreeKundaliCanvas
          chartStyle={chartStyle}
          ascSignIdx={ascSignIdx}
          housePlanets={housePlanets}
          signPlanets={signPlanets}
          showDegrees={showDegrees}
          onFallback={() => setRenderMode('relief3d')}
        />
      ) : (
        <div
          data-zsp-atomic="1"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onWheel={handleWheelZoom}
          className="bx-chart-stage w-full max-w-[420px] relative flex items-center justify-center overflow-hidden rounded-2xl"
          style={{
            touchAction: zoomScale > 1.01 ? 'none' : 'pan-y',
          }}
        >
          {zoomScale > 1.02 && (
            <button
              type="button"
              onClick={handleZoomReset}
              className="absolute top-2 right-2 z-20 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black shadow-md border border-[#F59E0B] cursor-pointer"
              style={{ backgroundColor: 'rgba(62, 31, 13, 0.92)', color: '#FFF3C4' }}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{Math.round(zoomScale * 100)}% • रीसेट</span>
            </button>
          )}
          <div
            className="w-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: '50% 50%',
              transition: isPinching
                ? 'none'
                : 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform',
            }}
          >
            <div
              className={`bx-chart-plate w-full aspect-square relative select-none ${
                depthMode === 'deep' ? 'bx-chart-plate-deep' : ''
              }`}
            >
            {chartStyle === 'north' ? (
              <svg
                viewBox="0 0 360 360"
                className="w-full h-full"
                style={{ shapeRendering: 'geometricPrecision' }}
              >
                <defs>
                  <linearGradient id={`frame-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9A5B25" />
                    <stop offset="35%" stopColor="#E5A93B" />
                    <stop offset="70%" stopColor="#7C3F16" />
                    <stop offset="100%" stopColor="#4A2109" />
                  </linearGradient>
                  <radialGradient id={`chamber-${uid}`} cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#FFFDF9" />
                    <stop offset="68%" stopColor="#FDF4E3" />
                    <stop offset="100%" stopColor="#EEDAB7" />
                  </radialGradient>
                  <radialGradient id={`diamond-${uid}`} cx="50%" cy="42%" r="60%">
                    <stop offset="0%" stopColor="#FFFDF9" />
                    <stop offset="65%" stopColor="#FBF0D9" />
                    <stop offset="100%" stopColor="#E7CC9B" />
                  </radialGradient>
                  <radialGradient id={`medallion-${uid}`} cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#FFF8DC" />
                    <stop offset="55%" stopColor="#F5C869" />
                    <stop offset="100%" stopColor="#B87314" />
                  </radialGradient>
                  {NORTH_HOUSE_COORDS.map(({ house, clipPoints }) => (
                    <clipPath key={`clip-${house}`} id={`hclip-${uid}-${house}`}>
                      <polygon points={clipPoints} />
                    </clipPath>
                  ))}
                </defs>

                {/* 3D Stepped Temple Outer Frame */}
                <rect x="2" y="2" width="356" height="356" rx="12" fill={`url(#frame-${uid})`} />
                <rect
                  x="8"
                  y="8"
                  width="344"
                  height="344"
                  rx="9"
                  fill="none"
                  stroke="#FDE68A"
                  strokeWidth="1.5"
                />
                <rect
                  x="12"
                  y="12"
                  width="336"
                  height="336"
                  rx="7"
                  fill={`url(#chamber-${uid})`}
                  stroke="#5C2D0C"
                  strokeWidth="3.5"
                />

                {/* 3D Shadow Layer for Diamond & Diagonals */}
                <polygon
                  points="180,15 349,183 180,351 15,183"
                  fill="none"
                  stroke="rgba(74, 33, 9, 0.28)"
                  strokeWidth="6"
                />
                <line
                  x1="14"
                  y1="15"
                  x2="348"
                  y2="351"
                  stroke="rgba(74, 33, 9, 0.28)"
                  strokeWidth="6"
                />
                <line
                  x1="348"
                  y1="15"
                  x2="14"
                  y2="351"
                  stroke="rgba(74, 33, 9, 0.28)"
                  strokeWidth="6"
                />

                {/* Central Raised 3D Kendra Diamond */}
                <polygon
                  points="180,12 348,180 180,348 12,180"
                  fill={`url(#diamond-${uid})`}
                  stroke="#6B3410"
                  strokeWidth="5"
                />

                {/* Raised 3D Diagonal Walls */}
                <line x1="12" y1="12" x2="348" y2="348" stroke="#6B3410" strokeWidth="5" />
                <line x1="348" y1="12" x2="12" y2="348" stroke="#6B3410" strokeWidth="5" />

                {/* 24K Gold Ridge Highlights */}
                <line x1="12" y1="12" x2="348" y2="348" stroke="#FCD34D" strokeWidth="1.6" />
                <line x1="348" y1="12" x2="12" y2="348" stroke="#FCD34D" strokeWidth="1.6" />
                <polygon
                  points="180,12 348,180 180,348 12,180"
                  fill="none"
                  stroke="#FCD34D"
                  strokeWidth="1.8"
                />
                <rect
                  x="12"
                  y="12"
                  width="336"
                  height="336"
                  rx="7"
                  fill="none"
                  stroke="#FCD34D"
                  strokeWidth="1.6"
                />

                {/* Central 3D Golden Bindu Medallion */}
                <circle
                  cx="180"
                  cy="180"
                  r="8"
                  fill={`url(#medallion-${uid})`}
                  stroke="#5C2D0C"
                  strokeWidth="1.8"
                />

                {NORTH_HOUSE_COORDS.map(({ house, cx, cy, numX, numY, shapeType }) => {
                  const signNum = ((ascSignIdx + house - 1) % 12) + 1;
                  const pList = housePlanets[house] || [];
                  const isLagna = house === 1;
                  const isOuterTriangle =
                    shapeType === 'top-triangle' ||
                    shapeType === 'bottom-triangle' ||
                    shapeType === 'left-triangle' ||
                    shapeType === 'right-triangle';
                  const medRadius = isOuterTriangle ? 10 : 11.5;

                  return (
                    <g key={house}>
                      {isLagna && (
                        <text
                          x={cx}
                          y={50}
                          textAnchor="middle"
                          fill="#9A3412"
                          fontSize="11.5"
                          fontWeight="900"
                          fontFamily="'Tiro Devanagari Hindi', system-ui, sans-serif"
                          style={{
                            paintOrder: 'stroke fill',
                            stroke: '#FFFDF8',
                            strokeWidth: '3px',
                          }}
                        >
                          ॥ लग्न ॥
                        </text>
                      )}

                      {/* 3D Rashi Number Gold Medallion at Inner Apex */}
                      <g>
                        <circle
                          cx={numX}
                          cy={numY + 1.2}
                          r={medRadius}
                          fill="rgba(74, 33, 9, 0.25)"
                        />
                        <circle
                          cx={numX}
                          cy={numY}
                          r={medRadius}
                          fill={isLagna ? '#9A3412' : `url(#medallion-${uid})`}
                          stroke={isLagna ? '#FDE68A' : '#4A2109'}
                          strokeWidth="1.6"
                        />
                        <text
                          x={numX}
                          y={numY + 0.5}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isLagna ? '#FFF3C4' : '#2A1205'}
                          fontSize={isOuterTriangle ? '11.5' : '12.5'}
                          fontWeight="900"
                          fontFamily="serif"
                        >
                          {signNum}
                        </text>
                      </g>

                      {/* Strictly Contained High-Contrast Planets inside House */}
                      {pList.length > 0 && (
                        <g clipPath={`url(#hclip-${uid}-${house})`}>
                          {pList.map((p, idx) => {
                            const n = pList.length;
                            let targetX = cx;
                            let targetY = cy;
                            let anchor: 'start' | 'middle' | 'end' = 'middle';
                            let size = 14.5;
                            let degSize = 11;

                            if (shapeType === 'left-triangle' || shapeType === 'right-triangle') {
                              // Vertical side triangles (Houses 3, 5, 9, 11):
                              // Align neatly along the straight outer vertical wall and stack in 1 column
                              anchor = shapeType === 'left-triangle' ? 'start' : 'end';
                              targetX = cx;
                              const rowH = n >= 5 ? 11.5 : n === 4 ? 13 : n === 3 ? 15 : 17;
                              targetY = cy + (idx - (n - 1) / 2) * rowH;
                              size = n >= 5 ? 10.5 : n === 4 ? 11.5 : n === 3 ? 12.5 : n === 2 ? 13.5 : 14.5;
                              degSize = n >= 5 ? 8.5 : n === 4 ? 9.2 : n === 3 ? 10 : 10.8;
                            } else if (shapeType === 'top-triangle') {
                              // Top horizontal triangles (Houses 2, 12): widest near top border (y=24..28), narrower below (y=43..45)
                              if (n === 1) {
                                targetX = cx;
                                targetY = 34;
                                size = 15;
                                degSize = 11.5;
                              } else if (n === 2) {
                                targetX = cx + (idx === 0 ? -26 : 26);
                                targetY = 31;
                                size = 13.5;
                                degSize = 10.2;
                              } else if (n === 3) {
                                if (idx < 2) {
                                  targetX = cx + (idx === 0 ? -27 : 27);
                                  targetY = 27;
                                } else {
                                  targetX = cx;
                                  targetY = 44;
                                }
                                size = 12.8;
                                degSize = 10;
                              } else {
                                const col = idx % 2;
                                const row = Math.floor(idx / 2);
                                const spread = row === 0 ? 27 : 20;
                                targetX = cx + (col === 0 ? -spread : spread);
                                targetY = 25 + row * 15;
                                size = n > 4 ? 11 : 12;
                                degSize = n > 4 ? 9 : 9.6;
                              }
                            } else if (shapeType === 'bottom-triangle') {
                              // Bottom horizontal triangles (Houses 6, 8): widest near bottom border (y=332..335), narrower above (y=315..317)
                              if (n === 1) {
                                targetX = cx;
                                targetY = 326;
                                size = 15;
                                degSize = 11.5;
                              } else if (n === 2) {
                                targetX = cx + (idx === 0 ? -26 : 26);
                                targetY = 329;
                                size = 13.5;
                                degSize = 10.2;
                              } else if (n === 3) {
                                if (idx < 2) {
                                  targetX = cx + (idx === 0 ? -27 : 27);
                                  targetY = 333;
                                } else {
                                  targetX = cx;
                                  targetY = 316;
                                }
                                size = 12.8;
                                degSize = 10;
                              } else {
                                const col = idx % 2;
                                const row = Math.floor(idx / 2);
                                const spread = row === 0 ? 27 : 20;
                                targetX = cx + (col === 0 ? -spread : spread);
                                targetY = 335 - row * 15;
                                size = n > 4 ? 11 : 12;
                                degSize = n > 4 ? 9 : 9.6;
                              }
                            } else {
                              // Large Kendra Diamonds (Houses 1, 4, 7, 10)
                              const cols = n > 2 ? 2 : 1;
                              const rows = Math.ceil(n / cols);
                              const col = idx % cols;
                              const row = Math.floor(idx / cols);
                              const rowH = n > 4 ? 15.5 : n > 2 ? 18 : 20;
                              const colW = showDegrees ? 48 : 40;
                              const isLastOdd = cols === 2 && n % 2 === 1 && idx === n - 1;
                              targetX = cx + (isLastOdd ? 0 : (col - (cols - 1) / 2) * colW);
                              targetY = cy + (row - (rows - 1) / 2) * rowH;
                              size = n > 4 ? 12.5 : n > 2 ? 14 : n === 2 ? 15.5 : 17;
                              degSize = n > 4 ? 10 : n > 2 ? 11 : 12;
                            }

                            const color = p.isRetro
                              ? '#B91C1C'
                              : p.isBenefic
                              ? '#065F46'
                              : '#2A1205';

                            return (
                              <text
                                key={idx}
                                x={targetX}
                                y={targetY}
                                textAnchor={anchor}
                                dominantBaseline="central"
                                fill={color}
                                fontSize={size}
                                fontWeight="900"
                                fontFamily="'Tiro Devanagari Hindi', 'Rozha One', serif"
                                style={{
                                  paintOrder: 'stroke fill',
                                  stroke: '#FFFFFF',
                                  strokeWidth: '3.2px',
                                  strokeLinejoin: 'round',
                                }}
                              >
                                {p.name}
                                {p.isRetro && (
                                  <tspan fill="#DC2626" fontWeight="900">
                                    (व)
                                  </tspan>
                                )}
                                {showDegrees && (
                                  <tspan fill="#7C2D12" fontSize={degSize} fontWeight="900">
                                    {' '}
                                    {p.degreeStr}
                                  </tspan>
                                )}
                              </text>
                            );
                          })}
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            ) : (
              <svg
                viewBox="0 0 360 360"
                className="w-full h-full"
                style={{ shapeRendering: 'geometricPrecision' }}
              >
                <defs>
                  <linearGradient id={`sframe-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9A5B25" />
                    <stop offset="40%" stopColor="#E5A93B" />
                    <stop offset="100%" stopColor="#4A2109" />
                  </linearGradient>
                  <radialGradient id={`schamber-${uid}`} cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#FFFDF9" />
                    <stop offset="70%" stopColor="#FDF4E3" />
                    <stop offset="100%" stopColor="#EEDAB7" />
                  </radialGradient>
                </defs>

                <rect x="2" y="2" width="356" height="356" rx="12" fill={`url(#sframe-${uid})`} />
                <rect
                  x="8"
                  y="8"
                  width="344"
                  height="344"
                  rx="6"
                  fill={`url(#schamber-${uid})`}
                  stroke="#5C2D0C"
                  strokeWidth="3.2"
                />

                <g stroke="#6B3410" strokeWidth="4.2">
                  <line x1="94" y1="8" x2="94" y2="352" />
                  <line x1="180" y1="8" x2="180" y2="94" />
                  <line x1="180" y1="266" x2="180" y2="352" />
                  <line x1="266" y1="8" x2="266" y2="352" />
                  <line x1="8" y1="94" x2="352" y2="94" />
                  <line x1="8" y1="180" x2="94" y2="180" />
                  <line x1="266" y1="180" x2="352" y2="180" />
                  <line x1="8" y1="266" x2="352" y2="266" />
                </g>
                <g stroke="#FCD34D" strokeWidth="1.4">
                  <line x1="94" y1="8" x2="94" y2="352" />
                  <line x1="180" y1="8" x2="180" y2="94" />
                  <line x1="180" y1="266" x2="180" y2="352" />
                  <line x1="266" y1="8" x2="266" y2="352" />
                  <line x1="8" y1="94" x2="352" y2="94" />
                  <line x1="8" y1="180" x2="94" y2="180" />
                  <line x1="266" y1="180" x2="352" y2="180" />
                  <line x1="8" y1="266" x2="352" y2="266" />
                </g>

                <rect
                  x="94"
                  y="94"
                  width="172"
                  height="172"
                  fill="#FBF0D9"
                  stroke="#B56A00"
                  strokeWidth="2.8"
                />
                <text
                  x="180"
                  y="164"
                  textAnchor="middle"
                  fill="#4A2109"
                  fontSize="15.5"
                  fontWeight="900"
                  fontFamily="'Tiro Devanagari Hindi', serif"
                >
                  3D दक्षिण भारतीय चक्र
                </text>
                <text
                  x="180"
                  y="188"
                  textAnchor="middle"
                  fill="#9A3412"
                  fontSize="14"
                  fontWeight="900"
                >
                  लग्न: {RASHIS[ascSignIdx]}
                </text>

                {SOUTH_SIGNS.map(({ signIdx, row, col, name }) => {
                  const left = 8 + col * 86;
                  const top = 8 + row * 86;
                  const centerX = left + 43;
                  const centerY = top + 48;
                  const isLagna = signIdx === ascSignIdx;
                  const pList = signPlanets[signIdx] || [];

                  return (
                    <g key={signIdx}>
                      <text
                        x={left + 7}
                        y={top + 16}
                        fill="#4A2109"
                        fontSize="12.5"
                        fontWeight="900"
                        fontFamily="'Tiro Devanagari Hindi', serif"
                      >
                        {name}
                      </text>
                      {isLagna && (
                        <>
                          <line
                            x1={left + 4}
                            y1={top + 4}
                            x2={left + 32}
                            y2={top + 32}
                            stroke="#9A3412"
                            strokeWidth="2.6"
                          />
                          <text
                            x={left + 79}
                            y={top + 16}
                            textAnchor="end"
                            fill="#9A3412"
                            fontSize="12"
                            fontWeight="900"
                          >
                            [लग्न]
                          </text>
                        </>
                      )}
                      {pList.length > 0 && (
                        <g transform={`translate(${centerX}, ${top + 52})`}>
                          {pList.map((p, idx) => {
                            const n = pList.length;
                            const cols = n >= 4 ? 2 : 1;
                            const rows = Math.ceil(n / cols);
                            const col = idx % cols;
                            const row = Math.floor(idx / cols);
                            const rowH = n >= 4 ? 14 : n === 3 ? 14.5 : 17;
                            const colW = 38;
                            const isLastOdd = cols === 2 && n % 2 === 1 && idx === n - 1;
                            const offsetX = isLastOdd ? 0 : (col - (cols - 1) / 2) * colW;
                            const offsetY = (row - (rows - 1) / 2) * rowH;
                            const color = p.isRetro
                              ? '#B91C1C'
                              : p.isBenefic
                              ? '#065F46'
                              : '#2A1205';
                            const size = n >= 4 ? 11.2 : n === 3 ? 12.8 : n === 2 ? 14.5 : 16;

                            return (
                              <text
                                key={idx}
                                x={offsetX}
                                y={offsetY}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={color}
                                fontSize={size}
                                fontWeight="900"
                                fontFamily="'Tiro Devanagari Hindi', serif"
                                style={{
                                  paintOrder: 'stroke fill',
                                  stroke: '#FFFFFF',
                                  strokeWidth: '3px',
                                  strokeLinejoin: 'round',
                                }}
                              >
                                {p.name}
                                {p.isRetro && <tspan fill="#DC2626">(व)</tspan>}
                                {showDegrees && (
                                  <tspan
                                    fill="#7C2D12"
                                    fontSize={n >= 4 ? 9.2 : n === 3 ? 10.2 : 11.5}
                                    fontWeight="900"
                                  >
                                    {' '}
                                    {p.degreeStr}
                                  </tspan>
                                )}
                              </text>
                            );
                          })}
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Harmonious Royal Vedic Bhojpatra & Swarna Gold House-Planet Summary Bar */}
      <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
          const signIdx = (ascSignIdx + houseNum - 1) % 12;
          const pList = housePlanets[houseNum] || [];
          if (pList.length === 0 && houseNum !== 1) return null;
          const isLagnaHouse = houseNum === 1;
          return (
            <div
              key={houseNum}
              data-zsp-atomic="1"
              className="rounded-xl border shadow-2xs text-left flex flex-col"
              style={{
                backgroundColor: '#FFFDF8',
                borderColor: isLagnaHouse ? '#B45309' : '#D6B377',
              }}
            >
              <div
                className="px-2.5 py-1 rounded-t-[11px] flex items-center justify-between text-[11px] font-bold"
                style={{
                  background: isLagnaHouse
                    ? 'linear-gradient(90deg, #7C2D12 0%, #9A3412 100%)'
                    : 'linear-gradient(90deg, #5C2D0C 0%, #78350F 100%)',
                  color: '#FFF3C4',
                }}
              >
                <span>{isLagnaHouse ? 'भाव 1 (लग्न)' : `भाव ${houseNum}`}</span>
                <span>
                  {signIdx + 1}. {RASHIS[signIdx]}
                </span>
              </div>
              <div className="px-2.5 py-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                {pList.length > 0 ? (
                  pList.map((p, i) => (
                    <span
                      key={i}
                      className="text-xs sm:text-sm font-black leading-normal"
                      style={{
                        color: p.isRetro ? '#B91C1C' : p.isBenefic ? '#065F46' : '#2A1205',
                      }}
                    >
                      {p.name}
                      {p.isRetro ? '(व)' : ''}
                      {showDegrees ? (
                        <span className="text-[11px] font-bold text-[#7C2D12]">
                          {' '}
                          {p.degreeStr}
                        </span>
                      ) : (
                        ''
                      )}
                      {i < pList.length - 1 ? ',' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-[#78350F] leading-normal">लग्न भाव (शांत)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Legend */}
      <div className="w-full mt-2.5 pt-2 border-t border-[#8C6239]/25 flex flex-wrap items-center justify-between text-xs text-[#5C3A21] gap-2 font-semibold">
        <div className="flex items-center gap-2">
          <span className="font-black text-[#3E1F0D]">
            लग्न: {RASHIS[ascSignIdx]} ({lagnaDegree.toFixed(1)}°)
          </span>
          <span className="text-[#8C6239]">•</span>
          <span style={{ color: '#065F46' }} className="font-bold">
            शुभ ग्रह (हरित)
          </span>
          <span className="text-[#8C6239]">•</span>
          <span style={{ color: '#B91C1C' }} className="font-bold">
            (व) = वक्री (कुमकुम लाल)
          </span>
        </div>
        <div className="text-[11px] text-[#735133]">
          {chartStyle === 'north'
            ? '3D उत्तर भारतीय (भाव स्थिर, राशि चलायमान)'
            : '3D दक्षिण भारतीय (राशि स्थिर, भाव चलायमान)'}
        </div>
      </div>
    </div>
  );
};
