import React, { useState, useId } from 'react';
import { PlanetPosition } from '../types';
import { RASHIS, calculateVargaSign } from '../services/astronomy';
import { triggerHapticSelection } from '../utils/haptics';

export interface KundaliChartProps {
  lagnaDegree: number;
  planets: PlanetPosition[];
  vargaDivision?: number;
  chartTitle?: string;
  allowToggleStyle?: boolean;
}

interface HouseCoord {
  house: number;
  cx: number;
  cy: number;
  numX: number;
  numY: number;
  shapeType: string;
}

const NORTH_HOUSE_COORDS: HouseCoord[] = [
  { house: 1, cx: 180, cy: 74, numX: 180, numY: 26, shapeType: 'center-diamond' },
  { house: 2, cx: 96, cy: 44, numX: 34, numY: 22, shapeType: 'top-triangle' },
  { house: 3, cx: 46, cy: 96, numX: 22, numY: 74, shapeType: 'corner-triangle' },
  { house: 4, cx: 82, cy: 180, numX: 26, numY: 180, shapeType: 'side-triangle' },
  { house: 5, cx: 46, cy: 264, numX: 22, numY: 286, shapeType: 'corner-triangle' },
  { house: 6, cx: 96, cy: 316, numX: 34, numY: 338, shapeType: 'bottom-triangle' },
  { house: 7, cx: 180, cy: 286, numX: 180, numY: 334, shapeType: 'center-diamond' },
  { house: 8, cx: 264, cy: 316, numX: 326, numY: 338, shapeType: 'bottom-triangle' },
  { house: 9, cx: 314, cy: 264, numX: 338, numY: 286, shapeType: 'corner-triangle' },
  { house: 10, cx: 278, cy: 180, numX: 334, numY: 180, shapeType: 'side-triangle' },
  { house: 11, cx: 314, cy: 96, numX: 338, numY: 74, shapeType: 'corner-triangle' },
  { house: 12, cx: 264, cy: 44, numX: 326, numY: 22, shapeType: 'top-triangle' },
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

interface FormattedPlanet {
  name: string;
  degreeStr: string;
  isRetro: boolean;
  isBenefic: boolean;
  english: string;
}

export const KundaliChart: React.FC<KundaliChartProps> = ({
  lagnaDegree,
  planets,
  vargaDivision = 1,
  chartTitle,
  allowToggleStyle = true,
}) => {
  const uid = useId().replace(/:/g, '');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [showDegrees, setShowDegrees] = useState(true);
  const [depthMode, setDepthMode] = useState<'sculpted' | 'deep'>('sculpted');

  const ascSignIdx = calculateVargaSign(lagnaDegree, vargaDivision);

  const housePlanets: Record<number, FormattedPlanet[]> = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];

  const signPlanets: Record<number, FormattedPlanet[]> = {};
  for (let i = 0; i < 12; i++) signPlanets[i] = [];

  planets.forEach((p) => {
    const vargaSign = calculateVargaSign(p.degree, vargaDivision);
    const house = ((vargaSign - ascSignIdx + 12) % 12) + 1;
    const isBenefic = ['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(p.planet);
    const slice = 30 / Math.max(1, vargaDivision);
    const degInVarga = vargaDivision === 1 ? p.degreeInRashi : (p.degreeInRashi % slice) * vargaDivision;
    const degStr = `${Math.floor(degInVarga)}°`;

    const item: FormattedPlanet = {
      name: p.planet,
      degreeStr: degStr,
      isRetro: p.isRetrograde,
      isBenefic,
      english: p.englishName,
    };

    housePlanets[house]?.push(item);
    signPlanets[vargaSign]?.push(item);
  });

  return (
    <div className="flex flex-col items-center bg-[#FAF2E4] p-3 sm:p-4 rounded-2xl border border-[#8C6239]/40 shadow-sm w-full">
      {/* Chart Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#8C6239]/25">
        <div className="text-xs sm:text-sm font-black font-granth text-[#5C3A21] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#8B1E1E] shadow-xs" />
          <span>{chartTitle || '3D वैदिक कुण्डली चक्र'}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5C3A21] text-[#FFD88A] font-bold">
            3D
          </span>
        </div>

        {allowToggleStyle && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setDepthMode(depthMode === 'sculpted' ? 'deep' : 'sculpted');
              }}
              className={`px-2 py-0.5 text-[10px] font-bold rounded border transition cursor-pointer ${
                depthMode === 'deep'
                  ? 'bg-[#5C3A21] text-[#FFD88A] border-[#5C3A21]'
                  : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/40'
              }`}
              title="3D झुकाव एवं गहराई बदलें"
            >
              {depthMode === 'deep' ? '3D: गहरा कोण' : '3D: उभरा दृश्य'}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setShowDegrees(!showDegrees);
              }}
              className={`px-2 py-0.5 text-[10px] font-bold rounded border transition cursor-pointer ${
                showDegrees
                  ? 'bg-[#B56A00] text-white border-[#B56A00]'
                  : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/40'
              }`}
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
              className="px-2 py-0.5 text-[10px] font-bold rounded border bg-[#F4E8D1] hover:bg-[#EBDCC0] text-[#5C3A21] border-[#8C6239]/40 transition cursor-pointer"
              title="उत्तर/दक्षिण भारतीय शैली बदलें"
            >
              {chartStyle === 'north' ? 'दक्षिण भारतीय' : 'उत्तर भारतीय'}
            </button>
          </div>
        )}
      </div>

      {/* 3D Sculpted Yantra Stage */}
      <div className="bx-chart-stage w-full max-w-[400px]">
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
                {/* 3D Outer Temple Frame Gradient */}
                <linearGradient id={`frame-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8A5628" />
                  <stop offset="35%" stopColor="#D49B4B" />
                  <stop offset="70%" stopColor="#6B3E1B" />
                  <stop offset="100%" stopColor="#3D200C" />
                </linearGradient>

                {/* 3D Recessed Chamber Surface */}
                <radialGradient id={`chamber-${uid}`} cx="50%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="#FFFDF9" />
                  <stop offset="68%" stopColor="#FBF2E1" />
                  <stop offset="100%" stopColor="#EAD6B3" />
                </radialGradient>

                {/* 3D Center Brahmasthan Diamond Surface */}
                <radialGradient id={`diamond-${uid}`} cx="50%" cy="42%" r="60%">
                  <stop offset="0%" stopColor="#FFFDF8" />
                  <stop offset="65%" stopColor="#F9EBD0" />
                  <stop offset="100%" stopColor="#E4C896" />
                </radialGradient>

                {/* 3D Medallion Gold Gradient */}
                <radialGradient id={`medallion-${uid}`} cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFF6D6" />
                  <stop offset="55%" stopColor="#F3C66F" />
                  <stop offset="100%" stopColor="#B87A1E" />
                </radialGradient>

                {/* 3D Wall Extrusion Shadow */}
                <filter id={`ridge-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="1.8" dy="2.8" stdDeviation="1.8" floodColor="#3A1D0C" floodOpacity="0.42" />
                </filter>

                {/* 3D Floating Planet Label Shadow */}
                <filter id={`planet-3d-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1.8" stdDeviation="1.1" floodColor="#2A1408" floodOpacity="0.28" />
                </filter>
              </defs>

              {/* 3D Carved Outer Temple Pedestal */}
              <rect
                x="2"
                y="2"
                width="356"
                height="356"
                rx="12"
                fill={`url(#frame-${uid})`}
              />
              {/* Inner Recessed 3D Chamber */}
              <rect
                x="10"
                y="10"
                width="340"
                height="340"
                rx="7"
                fill={`url(#chamber-${uid})`}
                stroke="#4A2711"
                strokeWidth="3"
              />

              {/* 3D Center Diamond (Kendra Houses) */}
              <polygon
                points="180,10 350,180 180,350 10,180"
                fill={`url(#diamond-${uid})`}
                stroke="#6B3E1B"
                strokeWidth="4.5"
                filter={`url(#ridge-${uid})`}
              />

              {/* 3D Diagonal Carved Walls (Base Shadow + Gold Ridge) */}
              <line
                x1="10"
                y1="10"
                x2="350"
                y2="350"
                stroke="#5C3416"
                strokeWidth="4.5"
                filter={`url(#ridge-${uid})`}
              />
              <line
                x1="350"
                y1="10"
                x2="10"
                y2="350"
                stroke="#5C3416"
                strokeWidth="4.5"
                filter={`url(#ridge-${uid})`}
              />

              {/* Top Specular Gold Highlights on 3D Walls */}
              <line x1="10" y1="10" x2="350" y2="350" stroke="#F6D386" strokeWidth="1.4" />
              <line x1="350" y1="10" x2="10" y2="350" stroke="#F6D386" strokeWidth="1.4" />
              <polygon
                points="180,10 350,180 180,350 10,180"
                fill="none"
                stroke="#F6D386"
                strokeWidth="1.5"
              />
              <rect
                x="10"
                y="10"
                width="340"
                height="340"
                rx="7"
                fill="none"
                stroke="#F6D386"
                strokeWidth="1.5"
              />

              {/* 12 Houses Render with Larger Planet Fonts & 3D Relief */}
              {NORTH_HOUSE_COORDS.map(({ house, cx, cy, numX, numY }) => {
                const signNum = ((ascSignIdx + house - 1) % 12) + 1;
                const pList = housePlanets[house] || [];
                const isLagna = house === 1;

                return (
                  <g key={house}>
                    {isLagna && (
                      <text
                        x={cx}
                        y={47}
                        textAnchor="middle"
                        fill="#B55300"
                        fontSize="11"
                        fontWeight="900"
                        fontFamily="'Tiro Devanagari Hindi', system-ui, sans-serif"
                        style={{
                          paintOrder: 'stroke fill',
                          stroke: '#FFFDF8',
                          strokeWidth: '2.5px',
                        }}
                      >
                        ॥ लग्न ॥
                      </text>
                    )}

                    {/* 3D Embossed Rashi Number Medallion */}
                    <g filter={`url(#planet-3d-${uid})`}>
                      <circle
                        cx={numX}
                        cy={numY}
                        r="11.5"
                        fill={`url(#medallion-${uid})`}
                        stroke="#5C3A21"
                        strokeWidth="1.4"
                      />
                      <text
                        x={numX}
                        y={numY + 0.5}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#3A1D0C"
                        fontSize="12.5"
                        fontWeight="900"
                        fontFamily="serif"
                      >
                        {signNum}
                      </text>
                    </g>

                    {/* Enlarged Planet Names & Degrees in 3D Relief */}
                    {pList.length > 0 && (
                      <g
                        transform={`translate(${cx}, ${cy})`}
                        filter={`url(#planet-3d-${uid})`}
                      >
                        {pList.map((p, idx) => {
                          const n = pList.length;
                          const cols = n > 2 ? 2 : 1;
                          const rows = Math.ceil(n / cols);
                          const col = idx % cols;
                          const row = Math.floor(idx / cols);
                          const rowH = n > 4 ? 15.5 : n > 2 ? 17.5 : 20;
                          const colW = showDegrees ? 50 : 42;
                          const offsetX = (col - (cols - 1) / 2) * colW;
                          const offsetY = (row - (rows - 1) / 2) * rowH;
                          const color = p.isRetro
                            ? '#B91C1C'
                            : p.isBenefic
                            ? '#14532D'
                            : '#2D1606';
                          const size = n > 4 ? 12.5 : n > 2 ? 14 : n === 2 ? 15.5 : 17;
                          const degSize = n > 4 ? 10 : n > 2 ? 11 : 12;

                          return (
                            <text
                              key={idx}
                              x={offsetX}
                              y={offsetY}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={color}
                              fontSize={size}
                              fontWeight="800"
                              fontFamily="'Tiro Devanagari Hindi', 'Rozha One', serif"
                              style={{
                                paintOrder: 'stroke fill',
                                stroke: '#FFFDF8',
                                strokeWidth: '3px',
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
                                <tspan
                                  fill="#7C2D12"
                                  fontSize={degSize}
                                  fontWeight="800"
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
          ) : (
            <svg
              viewBox="0 0 360 360"
              className="w-full h-full"
              style={{ shapeRendering: 'geometricPrecision' }}
            >
              <defs>
                <linearGradient id={`sframe-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8A5628" />
                  <stop offset="40%" stopColor="#D49B4B" />
                  <stop offset="100%" stopColor="#3D200C" />
                </linearGradient>
                <radialGradient id={`schamber-${uid}`} cx="50%" cy="45%" r="65%">
                  <stop offset="0%" stopColor="#FFFDF9" />
                  <stop offset="70%" stopColor="#FBF2E1" />
                  <stop offset="100%" stopColor="#EAD6B3" />
                </radialGradient>
                <filter id={`sridge-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="1.5" dy="2.5" stdDeviation="1.6" floodColor="#3A1D0C" floodOpacity="0.4" />
                </filter>
                <filter id={`splanet-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1.6" stdDeviation="1" floodColor="#2A1408" floodOpacity="0.26" />
                </filter>
              </defs>

              {/* 3D Outer Temple Frame */}
              <rect x="2" y="2" width="356" height="356" rx="12" fill={`url(#sframe-${uid})`} />
              <rect
                x="8"
                y="8"
                width="344"
                height="344"
                rx="6"
                fill={`url(#schamber-${uid})`}
                stroke="#4A2711"
                strokeWidth="3"
              />

              {/* South Indian 4x4 3D Grid Lines */}
              <g filter={`url(#sridge-${uid})`} stroke="#5C3416" strokeWidth="3.8">
                <line x1="94" y1="8" x2="94" y2="352" />
                <line x1="180" y1="8" x2="180" y2="94" />
                <line x1="180" y1="266" x2="180" y2="352" />
                <line x1="266" y1="8" x2="266" y2="352" />
                <line x1="8" y1="94" x2="352" y2="94" />
                <line x1="8" y1="180" x2="94" y2="180" />
                <line x1="266" y1="180" x2="352" y2="180" />
                <line x1="8" y1="266" x2="352" y2="266" />
              </g>
              <g stroke="#F6D386" strokeWidth="1.2">
                <line x1="94" y1="8" x2="94" y2="352" />
                <line x1="180" y1="8" x2="180" y2="94" />
                <line x1="180" y1="266" x2="180" y2="352" />
                <line x1="266" y1="8" x2="266" y2="352" />
                <line x1="8" y1="94" x2="352" y2="94" />
                <line x1="8" y1="180" x2="94" y2="180" />
                <line x1="266" y1="180" x2="352" y2="180" />
                <line x1="8" y1="266" x2="352" y2="266" />
              </g>

              {/* South Indian 3D Center Sanctum Box */}
              <rect
                x="94"
                y="94"
                width="172"
                height="172"
                fill="#F5E4C3"
                stroke="#B56A00"
                strokeWidth="2.5"
              />
              <text
                x="180"
                y="164"
                textAnchor="middle"
                fill="#5C3A21"
                fontSize="14.5"
                fontWeight="900"
                fontFamily="'Tiro Devanagari Hindi', serif"
              >
                3D दक्षिण भारतीय चक्र
              </text>
              <text
                x="180"
                y="188"
                textAnchor="middle"
                fill="#B56A00"
                fontSize="13"
                fontWeight="800"
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
                      fill="#6B3E1B"
                      fontSize="11.5"
                      fontWeight="800"
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
                          stroke="#B56A00"
                          strokeWidth="2.4"
                        />
                        <text
                          x={left + 79}
                          y={top + 16}
                          textAnchor="end"
                          fill="#B56A00"
                          fontSize="11.5"
                          fontWeight="900"
                        >
                          [लग्न]
                        </text>
                      </>
                    )}
                    {pList.length > 0 && (
                      <g
                        transform={`translate(${centerX}, ${centerY})`}
                        filter={`url(#splanet-${uid})`}
                      >
                        {pList.map((p, idx) => {
                          const n = pList.length;
                          const rowH = n > 3 ? 14 : 16.5;
                          const offsetY = (idx - (n - 1) / 2) * rowH;
                          const color = p.isRetro
                            ? '#B91C1C'
                            : p.isBenefic
                            ? '#14532D'
                            : '#2D1606';
                          const size = n > 3 ? 13 : n > 2 ? 14.5 : 16;

                          return (
                            <text
                              key={idx}
                              x="0"
                              y={offsetY}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={color}
                              fontSize={size}
                              fontWeight="800"
                              fontFamily="'Tiro Devanagari Hindi', serif"
                              style={{
                                paintOrder: 'stroke fill',
                                stroke: '#FFFDF8',
                                strokeWidth: '2.8px',
                                strokeLinejoin: 'round',
                              }}
                            >
                              {p.name}
                              {p.isRetro && <tspan fill="#DC2626">(व)</tspan>}
                              {showDegrees && (
                                <tspan
                                  fill="#7C2D12"
                                  fontSize={n > 3 ? 10.5 : 11.5}
                                  fontWeight="800"
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

      {/* Chart Legend */}
      <div className="w-full mt-2.5 pt-2 border-t border-[#8C6239]/20 flex flex-wrap items-center justify-between text-xs text-[#735133] gap-2 font-semibold">
        <div className="flex items-center gap-2">
          <span className="font-black text-[#5C3A21]">
            लग्न: {RASHIS[ascSignIdx]} ({lagnaDegree.toFixed(1)}°)
          </span>
          <span className="text-[#8C6239]">•</span>
          <span className="text-emerald-800 font-bold">शुभ ग्रह (हरित)</span>
          <span className="text-[#8C6239]">•</span>
          <span className="text-rose-800 font-bold">(व) = वक्री (लाल)</span>
        </div>
        <div className="text-[11px] text-[#8C6239]">
          {chartStyle === 'north'
            ? '3D उत्तर भारतीय (भाव स्थिर, राशि चलायमान)'
            : '3D दक्षिण भारतीय (राशि स्थिर, भाव चलायमान)'}
        </div>
      </div>
    </div>
  );
};
