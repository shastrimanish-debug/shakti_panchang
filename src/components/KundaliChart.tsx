import React, { useState } from 'react';
import { PlanetPosition } from '../types';
import { RASHIS, calculateVargaSign } from '../services/astronomy';

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
  { house: 1, cx: 180, cy: 95, numX: 180, numY: 155, shapeType: 'center-diamond' },
  { house: 2, cx: 90, cy: 45, numX: 120, numY: 75, shapeType: 'top-triangle' },
  { house: 3, cx: 45, cy: 90, numX: 75, numY: 120, shapeType: 'corner-triangle' },
  { house: 4, cx: 95, cy: 180, numX: 155, numY: 180, shapeType: 'side-triangle' },
  { house: 5, cx: 45, cy: 270, numX: 75, numY: 240, shapeType: 'corner-triangle' },
  { house: 6, cx: 90, cy: 315, numX: 120, numY: 285, shapeType: 'bottom-triangle' },
  { house: 7, cx: 180, cy: 265, numX: 180, numY: 205, shapeType: 'center-diamond' },
  { house: 8, cx: 270, cy: 315, numX: 240, numY: 285, shapeType: 'bottom-triangle' },
  { house: 9, cx: 315, cy: 270, numX: 285, numY: 240, shapeType: 'corner-triangle' },
  { house: 10, cx: 265, cy: 180, numX: 205, numY: 180, shapeType: 'side-triangle' },
  { house: 11, cx: 315, cy: 90, numX: 285, numY: 120, shapeType: 'corner-triangle' },
  { house: 12, cx: 270, cy: 45, numX: 240, numY: 75, shapeType: 'top-triangle' },
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
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [showDegrees, setShowDegrees] = useState(true);

  const ascSignIdx = calculateVargaSign(lagnaDegree, vargaDivision);

  const housePlanets: Record<number, FormattedPlanet[]> = {};
  for (let i = 1; i <= 12; i++) housePlanets[i] = [];

  const signPlanets: Record<number, FormattedPlanet[]> = {};
  for (let i = 0; i < 12; i++) signPlanets[i] = [];

  planets.forEach((p) => {
    const vargaSign = calculateVargaSign(p.degree, vargaDivision);
    const house = ((vargaSign - ascSignIdx + 12) % 12) + 1;
    const isBenefic = ['गुरु', 'शुक्र', 'बुध', 'चंद्र'].includes(p.planet);
    const degStr = `${Math.floor(p.degreeInRashi)}°`;

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
    <div className="flex flex-col items-center bg-[#FAF2E4] p-3 sm:p-4 rounded-xl border border-[#8C6239]/40 shadow-xs w-full">
      {/* Chart Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#8C6239]/20">
        <div className="text-xs font-bold font-granth text-[#5C3A21] uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#B56A00]" />
          {chartTitle || 'वैदिक कुण्डली चक्र'}
        </div>

        {allowToggleStyle && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowDegrees(!showDegrees)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded border transition ${
                showDegrees
                  ? 'bg-[#B56A00] text-white border-[#B56A00]'
                  : 'bg-[#F4E8D1] text-[#5C3A21] border-[#8C6239]/40'
              }`}
              title="ग्रहों के अंश दर्शाएँ या छिपाएँ"
            >
              {showDegrees ? 'अंश: चालू' : 'अंश: बंद'}
            </button>
            <button
              onClick={() => setChartStyle(chartStyle === 'north' ? 'south' : 'north')}
              className="px-2 py-0.5 text-[10px] font-bold rounded border bg-[#F4E8D1] hover:bg-[#EBDCC0] text-[#5C3A21] border-[#8C6239]/40 transition"
              title="उत्तर/दक्षिण भारतीय शैली बदलें"
            >
              {chartStyle === 'north' ? 'दक्षिण भारतीय' : 'उत्तर भारतीय'}
            </button>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="w-full max-w-[360px] aspect-square relative select-none">
        {chartStyle === 'north' ? (
          <svg
            viewBox="0 0 360 360"
            className="w-full h-full"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            {/* Background Outer Box */}
            <rect
              x="6"
              y="6"
              width="348"
              height="348"
              fill="#FFFDF8"
              stroke="#8C6239"
              strokeWidth="2.5"
              rx="3"
            />
            {/* Center diamond */}
            <polygon
              points="180,6 354,180 180,354 6,180"
              fill="#FAF3E6"
              stroke="#8C6239"
              strokeWidth="2"
            />
            {/* Diagonal Lines */}
            <line x1="6" y1="6" x2="354" y2="354" stroke="#8C6239" strokeWidth="2" />
            <line x1="354" y1="6" x2="6" y2="354" stroke="#8C6239" strokeWidth="2" />
            <polygon
              points="180,6 354,180 180,354 6,180"
              fill="none"
              stroke="#5C3A21"
              strokeWidth="2"
            />

            {/* Houses Render */}
            {NORTH_HOUSE_COORDS.map(({ house, cx, cy, numX, numY }) => {
              const signNum = ((ascSignIdx + house - 1) % 12) + 1;
              const pList = housePlanets[house] || [];
              const isLagna = house === 1;

              return (
                <g key={house}>
                  {/* Rashi number badge */}
                  <circle
                    cx={numX}
                    cy={numY}
                    r="9"
                    fill="#F4E8D1"
                    stroke="#8C6239"
                    strokeWidth="0.8"
                    opacity="0.9"
                  />
                  <text
                    x={numX}
                    y={numY + 0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#5C3A21"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="serif"
                  >
                    {signNum}
                  </text>

                  {isLagna && (
                    <text
                      x={cx}
                      y={cy - 26}
                      textAnchor="middle"
                      fill="#B56A00"
                      fontSize="9.5"
                      fontWeight="800"
                      fontFamily="system-ui, sans-serif"
                    >
                      [ लग्न ]
                    </text>
                  )}

                  {/* Planets inside house */}
                  {pList.length > 0 && (
                    <g transform={`translate(${cx}, ${cy})`}>
                      {pList.map((p, idx) => {
                        let offsetX = 0;
                        let offsetY = 0;
                        if (pList.length === 1) {
                          offsetY = 0;
                        } else if (pList.length === 2) {
                          offsetY = (idx - 0.5) * 16;
                        } else if (pList.length === 3) {
                          offsetY = (idx - 1) * 15;
                        } else {
                          const col = idx % 2 === 0 ? -28 : 28;
                          const row = Math.floor(idx / 2) * 15 - (pList.length > 4 ? 12 : 7);
                          offsetX = col;
                          offsetY = row;
                        }

                        const color = p.isRetro
                          ? '#B91C1C'
                          : p.isBenefic
                          ? '#166534'
                          : '#3E2714';

                        return (
                          <g key={idx} transform={`translate(${offsetX}, ${offsetY})`}>
                            <text
                              x="0"
                              y="0"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={color}
                              fontSize={pList.length > 3 ? '10' : '11.5'}
                              fontWeight="700"
                              fontFamily="'Tiro Devanagari Hindi', 'Rozha One', serif"
                            >
                              {p.name}
                              {p.isRetro && (
                                <tspan fill="#DC2626" fontWeight="900">
                                  (व)
                                </tspan>
                              )}
                              {showDegrees && (
                                <tspan
                                  fill="#78350F"
                                  fontSize={pList.length > 3 ? '8.5' : '9.5'}
                                  fontWeight="500"
                                >
                                  {' '}
                                  {p.degreeStr}
                                </tspan>
                              )}
                            </text>
                          </g>
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
            <rect
              x="6"
              y="6"
              width="348"
              height="348"
              fill="#FFFDF8"
              stroke="#8C6239"
              strokeWidth="2.5"
              rx="3"
            />
            {/* South Indian 4x4 Grid Lines */}
            <line x1="93" y1="6" x2="93" y2="354" stroke="#8C6239" strokeWidth="1.5" />
            <line x1="180" y1="6" x2="180" y2="93" stroke="#8C6239" strokeWidth="1.5" />
            <line x1="180" y1="267" x2="180" y2="354" stroke="#8C6239" strokeWidth="1.5" />
            <line x1="267" y1="6" x2="267" y2="354" stroke="#8C6239" strokeWidth="1.5" />
            <line x1="6" y1="93" x2="354" y2="93" stroke="#8C6239" strokeWidth="1.5" />
            <line x1="6" y1="180" x2="93" y2="180" stroke="#8C6239" strokeWidth="1.5" />
            <line x1="267" y1="180" x2="354" y2="180" stroke="#8C6239" strokeWidth="1.5" />
            <line x1="6" y1="267" x2="354" y2="267" stroke="#8C6239" strokeWidth="1.5" />

            {/* South Indian Center Box */}
            <rect
              x="93"
              y="93"
              width="174"
              height="174"
              fill="#FAF3E6"
              stroke="#C58F27"
              strokeWidth="1.5"
            />
            <text
              x="180"
              y="165"
              textAnchor="middle"
              fill="#5C3A21"
              fontSize="12"
              fontWeight="800"
              fontFamily="'Tiro Devanagari Hindi', serif"
            >
              दक्षिण भारतीय चक्र
            </text>
            <text
              x="180"
              y="185"
              textAnchor="middle"
              fill="#B56A00"
              fontSize="10"
              fontWeight="600"
            >
              लग्न: {RASHIS[ascSignIdx]}
            </text>

            {SOUTH_SIGNS.map(({ signIdx, row, col, name }) => {
              const left = 6 + col * 87;
              const top = 6 + row * 87;
              const centerX = left + 43.5;
              const centerY = top + 43.5;
              const isLagna = signIdx === ascSignIdx;
              const pList = signPlanets[signIdx] || [];

              return (
                <g key={signIdx}>
                  <text
                    x={left + 6}
                    y={top + 14}
                    fill="#8C6239"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="'Tiro Devanagari Hindi', serif"
                  >
                    {name}
                  </text>
                  {isLagna && (
                    <>
                      <line
                        x1={left + 4}
                        y1={top + 4}
                        x2={left + 35}
                        y2={top + 35}
                        stroke="#B56A00"
                        strokeWidth="1.8"
                      />
                      <text
                        x={left + 80}
                        y={top + 14}
                        textAnchor="end"
                        fill="#B56A00"
                        fontSize="9.5"
                        fontWeight="900"
                      >
                        [ल]
                      </text>
                    </>
                  )}
                  {pList.length > 0 && (
                    <g transform={`translate(${centerX}, ${centerY + 4})`}>
                      {pList.map((p, idx) => {
                        const offsetY = (idx - (pList.length - 1) / 2) * 14;
                        const color = p.isRetro
                          ? '#B91C1C'
                          : p.isBenefic
                          ? '#166534'
                          : '#3E2714';
                        return (
                          <text
                            key={idx}
                            x="0"
                            y={offsetY}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={color}
                            fontSize="10.5"
                            fontWeight="700"
                            fontFamily="'Tiro Devanagari Hindi', serif"
                          >
                            {p.name}
                            {p.isRetro && <tspan fill="#DC2626">(व)</tspan>}
                            {showDegrees && (
                              <tspan fill="#78350F" fontSize="8.5">
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

      {/* Chart Legend */}
      <div className="w-full mt-2.5 pt-2 border-t border-[#8C6239]/20 flex flex-wrap items-center justify-between text-[11px] text-[#735133] gap-2 font-medium">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#5C3A21]">
            लग्न: {RASHIS[ascSignIdx]} ({lagnaDegree.toFixed(1)}°)
          </span>
          <span className="text-[#8C6239]">•</span>
          <span className="text-emerald-800 font-semibold">शुभ ग्रह (हरित)</span>
          <span className="text-[#8C6239]">•</span>
          <span className="text-rose-800 font-bold">(व) = वक्री (लाल)</span>
        </div>
        <div className="text-[10px] text-[#8C6239]">
          {chartStyle === 'north'
            ? 'उत्तर भारतीय (भाव स्थिर, राशि चलायमान)'
            : 'दक्षिण भारतीय (राशि स्थिर, भाव चलायमान)'}
        </div>
      </div>
    </div>
  );
};
