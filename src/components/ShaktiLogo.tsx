import React from 'react';

interface ShaktiLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
  subtitle?: string;
  variant?: 'emblem' | 'full';
}

export const ShaktiLogo: React.FC<ShaktiLogoProps> = ({
  className = 'w-7 h-7',
  size = 28,
  showText = false,
  textClassName = 'text-sm font-bold text-[#FAF2E4]',
  subtitle,
  variant = 'emblem'
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Sacred Solar-Omkara Vector Emblem */}
      <svg
        viewBox="0 0 1024 1024"
        width={size}
        height={size}
        className="shrink-0 drop-shadow-sm transition-transform active:scale-95"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="शक्ति पंचांग प्रतीक"
      >
        <defs>
          <radialGradient id="sl_bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4A1E0E"/>
            <stop offset="65%" stop-color="#261007"/>
            <stop offset="100%" stop-color="#140803"/>
          </radialGradient>

          <radialGradient id="sl_enamelRed" cx="42%" cy="38%" r="62%">
            <stop offset="0%" stop-color="#B92D1D"/>
            <stop offset="45%" stop-color="#841717"/>
            <stop offset="85%" stop-color="#4E0C0C"/>
            <stop offset="100%" stop-color="#2D0606"/>
          </radialGradient>

          <linearGradient id="sl_goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF4D0"/>
            <stop offset="25%" stop-color="#FCD34D"/>
            <stop offset="50%" stop-color="#F59E0B"/>
            <stop offset="75%" stop-color="#D97706"/>
            <stop offset="100%" stop-color="#92400E"/>
          </linearGradient>

          <linearGradient id="sl_goldRev" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#78350F"/>
            <stop offset="35%" stop-color="#B45309"/>
            <stop offset="70%" stop-color="#FBBF24"/>
            <stop offset="100%" stop-color="#FEF3C7"/>
          </linearGradient>

          <radialGradient id="sl_sunFlare" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFE082" stop-opacity="0.9"/>
            <stop offset="40%" stop-color="#F59E0B" stop-opacity="0.5"/>
            <stop offset="80%" stop-color="#78350F" stop-opacity="0"/>
          </radialGradient>

          <linearGradient id="sl_moonGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stop-color="#FFFDF5"/>
            <stop offset="50%" stop-color="#FDE68A"/>
            <stop offset="100%" stop-color="#D97706"/>
          </linearGradient>

          <filter id="sl_dropShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.5"/>
          </filter>
        </defs>

        {/* Squircle App Icon Base */}
        <rect x="32" y="32" width="960" height="960" rx="230" ry="230" fill="url(#sl_bgGlow)"/>
        <rect x="40" y="40" width="944" height="944" rx="222" ry="222" fill="none" stroke="url(#sl_goldLight)" stroke-width="12" opacity="0.9"/>

        {/* Central Solar Mandala */}
        <g transform="translate(512, 512)" filter="url(#sl_dropShadow)">
          <circle r="410" fill="url(#sl_sunFlare)" />

          {/* 12 Radiant Spear Aditya Rays */}
          <g>
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <g key={`ray-${deg}`} transform={`rotate(${deg})`}>
                <polygon points="0,-420 28,-310 0,-330 -28,-310" fill="url(#sl_goldLight)" />
                <polygon points="0,-420 0,-330 28,-310" fill="url(#sl_goldRev)" opacity="0.8" />
                <circle cx="0" cy="-428" r="8" fill="#FFF4D0" />
              </g>
            ))}
          </g>

          {/* 12 Lotus Petal Rays */}
          <g>
            {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
              <g key={`lotus-${deg}`} transform={`rotate(${deg})`}>
                <path d="M 0,-375 C 22,-320 28,-290 0,-270 C -28,-290 -22,-320 0,-375 Z" fill="url(#sl_goldLight)" opacity="0.95" />
                <circle cx="0" cy="-380" r="5" fill="#FCD34D" />
              </g>
            ))}
          </g>

          {/* Outer Gold Ring with Nakshatra Band */}
          <circle r="300" fill="none" stroke="url(#sl_goldLight)" stroke-width="14"/>
          <circle r="275" fill="url(#sl_enamelRed)" stroke="url(#sl_goldRev)" stroke-width="12" />

          {/* Crescent Moon */}
          <path
            d="M -130,-155 A 195 195 0 0 0 -130, 155 A 165 165 0 0 1 -130,-155 Z"
            fill="url(#sl_moonGrad)"
            opacity="0.9"
          />

          {/* Om (ॐ) Sacred Glyph */}
          <g transform="scale(1.15)">
            <path
              d="M -70,-50 C -90,-95 -35,-140 30,-125 C 85,-110 95,-60 55,-22 C 110,5 115,85 50,128 C -20,170 -95,130 -105,75 C -108,58 -88,52 -85,70 C -75,108 -20,135 35,105 C 80,78 70,22 18,18 L 5,16 L 5,-15 L 20,-17 C 55,-25 55,-78 16,-88 C -20,-98 -58,-72 -48,-45 C -44,-28 -66,-28 -70,-50 Z"
              fill="url(#sl_goldLight)"
              stroke="#78350F"
              stroke-width="5"
            />
            <path
              d="M 25,-12 C 75,-8 135,32 155,105 C 160,122 178,118 174,102 C 148,22 80,-28 25,-25 Z"
              fill="url(#sl_goldLight)"
              stroke="#78350F"
              stroke-width="4"
            />
            <path
              d="M -20,-165 C 20,-195 80,-195 120,-165 C 85,-178 35,-178 -5,-165 C -15,-162 -25,-158 -20,-165 Z"
              fill="url(#sl_goldLight)"
              stroke="#78350F"
              stroke-width="3"
            />
            <circle cx="50" cy="-210" r="18" fill="url(#sl_goldLight)" stroke="#78350F" stroke-width="4"/>
            <circle cx="46" cy="-214" r="6" fill="#FFFDF5" />
          </g>

          <path d="M -110, 205 Q 0, 235 110, 205" fill="none" stroke="url(#sl_goldLight)" stroke-width="4" stroke-linecap="round"/>
        </g>
      </svg>

      {/* Brand Text (if enabled) */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-granth tracking-wide ${textClassName}`}>
            शक्ति पंचांग
          </span>
          {subtitle && (
            <span className="text-[10px] text-[#D9C4A9] tracking-wider">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
