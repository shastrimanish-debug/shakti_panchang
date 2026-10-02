import React, { useState, useEffect, useCallback } from 'react';
import { Compass, RotateCw, AlertTriangle, ShieldCheck, Smartphone } from 'lucide-react';

interface DigitalCompassProps {
  shoolDirectionName: string; // e.g. 'पूर्व', 'पश्चिम', 'उत्तर', 'दक्षिण'
  targetBearing?: number; // 0-360
  targetDirectionName?: string;
  isDirectionBlocked?: boolean;
}

// Map Vedic directions to angle degrees (center of sector)
const DIRECTION_ANGLES: Record<string, number> = {
  'उत्तर': 0,
  'ईशान': 45,
  'पूर्व': 90,
  'आग्नेय': 135,
  'दक्षिण': 180,
  'नैऋत्य': 225,
  'पश्चिम': 270,
  'वायव्य': 315,
};

const VEDIC_CARDINALS = [
  { name: 'उत्तर', angle: 0, en: 'N', devata: 'कुबेर' },
  { name: 'ईशान', angle: 45, en: 'NE', devata: 'शिव' },
  { name: 'पूर्व', angle: 90, en: 'E', devata: 'इंद्र' },
  { name: 'आग्नेय', angle: 135, en: 'SE', devata: 'अग्नि' },
  { name: 'दक्षिण', angle: 180, en: 'S', devata: 'यम' },
  { name: 'नैऋत्य', angle: 225, en: 'SW', devata: 'नैऋति' },
  { name: 'पश्चिम', angle: 270, en: 'W', devata: 'वरुण' },
  { name: 'वायव्य', angle: 315, en: 'NW', devata: 'वायु' },
];

export const DigitalCompass: React.FC<DigitalCompassProps> = ({
  shoolDirectionName,
  targetBearing = 90,
  targetDirectionName = 'पूर्व',
  isDirectionBlocked = false,
}) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);
  const [manualOffset, setManualOffset] = useState<number>(0);

  // Determine shool angle
  const shoolAngle = DIRECTION_ANGLES[shoolDirectionName] ?? 90;

  // Handle device orientation
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let heading: number | null = null;

    // iOS WebKit compass heading
    if ('webkitCompassHeading' in e && typeof (e as any).webkitCompassHeading === 'number') {
      heading = (e as any).webkitCompassHeading;
    } else if (e.alpha !== null && e.alpha !== undefined) {
      // Android / Standard W3C orientation
      heading = (360 - e.alpha) % 360;
    }

    if (heading !== null && !isNaN(heading)) {
      setDeviceHeading(Math.round(heading));
      setHasSensor(true);
      setSensorActive(true);
    }
  }, []);

  const requestSensorAccess = async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setSensorActive(true);
          setPermissionNeeded(false);
        } else {
          alert('कम्पास सेंसर अनुमति अस्वीकार की गई। आप नीचे दिए गए स्लाइडर से दिशा जांच सकते हैं।');
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
        setSensorActive(true);
      }
    } catch (err) {
      console.warn('Orientation sensor error:', err);
    }
  };

  useEffect(() => {
    // Check if permission required (iOS 13+)
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setPermissionNeeded(true);
    } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [handleOrientation]);

  // Current effective heading (sensor or manual slider)
  const currentHeading = sensorActive ? deviceHeading : manualOffset;

  // Calculate current facing Vedic direction
  const getFacingDirection = (deg: number) => {
    const normalized = (deg % 360 + 360) % 360;
    for (const card of VEDIC_CARDINALS) {
      const diff = Math.abs(normalized - card.angle);
      const angleDist = Math.min(diff, 360 - diff);
      if (angleDist <= 22.5) {
        return card;
      }
    }
    return VEDIC_CARDINALS[0];
  };

  const facingCard = getFacingDirection(currentHeading);
  const isFacingShool = facingCard.name === shoolDirectionName;

  return (
    <div className="bg-[#FAF2E4] border border-[#8C6239]/40 rounded-xl p-2.5 sm:p-4 shadow-xs space-y-2.5 sm:space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#8C6239]/20 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#5C3A21] flex items-center justify-center text-amber-300 shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-granth text-xs sm:text-base font-bold text-[#5C3A21] leading-none">
              सजीव डिजिटल दिशा-सूचक (Live Vedic Compass)
            </h3>
            <p className="text-[9px] sm:text-[11px] text-[#735133] mt-0.5 line-clamp-1">
              शास्त्रोक्त अष्ट-दिक्पाल, दिशाशूल चेतावनी एवं सजीव कोण मापक
            </p>
          </div>
        </div>

        {/* Sensor activation state */}
        <div className="flex items-center gap-1.5">
          {permissionNeeded && !sensorActive && (
            <button
              type="button"
              onClick={requestSensorAccess}
              className="px-2 py-0.5 bg-[#B56A00] hover:bg-[#8C5200] text-white text-[10px] sm:text-xs font-bold rounded-md shadow-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Smartphone className="w-3 h-3" />
              <span>सेंसर सक्रिय</span>
            </button>
          )}

          <span
            className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${
              sensorActive
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {sensorActive ? '● लाइव सेंसर' : '○ मैनुअल'}
          </span>
        </div>
      </div>

      {/* Compass Stage & Readout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5 items-center">
        {/* Visual Dial (Left/Top) */}
        <div className="md:col-span-7 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 sm:w-64 sm:h-64 rounded-full border-3 sm:border-4 border-[#8C6239] bg-gradient-to-b from-[#FFFDF8] to-[#F3E5CB] shadow-md flex items-center justify-center select-none overflow-hidden">
            {/* Outer Compass Rose Ticks */}
            <div
              className="absolute inset-1 rounded-full border border-dashed border-[#8C6239]/40 transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${-currentHeading}deg)` }}
            >
              {/* Cardinal & Inter-cardinal Markers */}
              {VEDIC_CARDINALS.map((dir) => {
                const isShool = dir.name === shoolDirectionName;
                const isTarget = dir.name === targetDirectionName;

                return (
                  <div
                    key={dir.name}
                    className="absolute inset-0 flex flex-col items-center justify-start pt-1 pointer-events-none"
                    style={{ transform: `rotate(${dir.angle}deg)` }}
                  >
                    {/* Tick Mark */}
                    <div
                      className={`w-0.5 sm:w-1 h-2 sm:h-3 rounded-full ${
                        isShool
                          ? 'bg-rose-600'
                          : dir.angle % 90 === 0
                          ? 'bg-[#5C3A21]'
                          : 'bg-[#8C6239]/60'
                      }`}
                    />

                    {/* Vedic Name */}
                    <div
                      className="mt-0.5 flex flex-col items-center"
                      style={{ transform: `rotate(${-dir.angle + currentHeading}deg)` }}
                    >
                      <span
                        className={`text-[8px] sm:text-[10px] font-black leading-none ${
                          isShool
                            ? 'text-rose-700 bg-rose-100 px-0.5 rounded font-bold'
                            : isTarget
                            ? 'text-[#B56A00] font-black'
                            : 'text-[#5C3A21]'
                        }`}
                      >
                        {dir.name}
                      </span>
                      <span className="text-[7px] sm:text-[8px] text-[#8C6239]/80 font-bold leading-none">
                        {dir.en}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Dishashool Warning Sector Highlight */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${shoolAngle}deg)` }}
              >
                <div className="absolute top-0 w-12 sm:w-16 h-20 sm:h-28 bg-gradient-to-b from-rose-500/25 to-transparent rounded-t-full border-t-2 border-rose-500" />
              </div>
            </div>

            {/* Needle Pivot / Target Pointer Needle (Fixed on dial) */}
            {/* North Magnetic Arrow (Always points to North 0°) */}
            <div
              className="absolute w-6 sm:w-8 h-32 sm:h-44 transition-transform duration-300 ease-out pointer-events-none flex flex-col items-center justify-between"
              style={{ transform: `rotate(${-currentHeading}deg)` }}
            >
              {/* North Arrow Tip */}
              <div className="w-0 h-0 border-l-[7px] sm:border-l-[10px] border-l-transparent border-r-[7px] sm:border-r-[10px] border-r-transparent border-b-[28px] sm:border-b-[38px] border-b-[#C82333] drop-shadow-xs" />
              <div className="w-1 sm:w-1.5 h-8 sm:h-12 bg-gradient-to-b from-[#C82333] to-[#5C3A21]" />
              {/* South Arrow Tip */}
              <div className="w-0 h-0 border-l-[7px] sm:border-l-[10px] border-l-transparent border-r-[7px] sm:border-r-[10px] border-r-transparent border-t-[28px] sm:border-t-[38px] border-t-[#5C3A21] drop-shadow-xs" />
            </div>

            {/* Target Bearing Needle (Gold pointer) */}
            <div
              className="absolute w-5 sm:w-6 h-28 sm:h-38 transition-transform duration-300 ease-out pointer-events-none flex flex-col items-center justify-start"
              style={{ transform: `rotate(${targetBearing - currentHeading}deg)` }}
            >
              <div className="w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-transparent border-r-[6px] sm:border-r-[8px] border-r-transparent border-b-[22px] sm:border-b-[30px] border-b-[#E69A33] drop-shadow-xs" />
              <div className="w-0.5 sm:w-1 h-10 sm:h-14 bg-[#E69A33]" />
            </div>

            {/* Center Dial Hub */}
            <div className="relative z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#FAF2E4] to-[#E3CEAE] border sm:border-2 border-[#8C6239] shadow-inner flex flex-col items-center justify-center text-center">
              <span className="text-[9px] sm:text-[10px] font-black text-[#5C3A21] leading-none">
                {currentHeading}°
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-[#8C6239] mt-0.5">
                {facingCard.name}
              </span>
            </div>
          </div>

          {/* Compass Legends */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-[#5C3A21] mt-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-xs inline-block" />
              <span>उत्तर</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs inline-block" />
              <span>गंतव्य ({targetDirectionName})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-rose-200 border border-rose-500 rounded-xs inline-block" />
              <span>दिशाशूल ({shoolDirectionName})</span>
            </div>
          </div>
        </div>

        {/* Real-time Diagnostics & Shool Proximity (Right/Bottom) */}
        <div className="md:col-span-5 space-y-2">
          {/* Facing Direction Status */}
          <div
            className={`p-2.5 sm:p-3.5 rounded-xl border transition ${
              isFacingShool
                ? 'bg-rose-50 border-rose-400 text-rose-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {isFacingShool ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  {isFacingShool ? '⚠️ दिशाशूल चेतावनी' : '✓ अनुकूल दिशा'}
                </div>
                <div className="text-xs sm:text-sm font-bold font-granth mt-0.5">
                  वर्तमान सम्मुख दिशा: {facingCard.name} ({currentHeading}°)
                </div>
                <p className="text-[10px] sm:text-xs mt-0.5 leading-relaxed">
                  {isFacingShool
                    ? `आपका फ़ोन आज के वर्जित दिशाशूल (${shoolDirectionName}) की ओर लक्षित है। इस दिशा में प्रस्थान से पूर्व वैदिक परिहार अवश्य करें।`
                    : `वर्तमान मुख दिशा ${facingCard.name} है, दिक्पाल ${facingCard.devata} हैं।`}
                </p>
              </div>
            </div>
          </div>

          {/* Target Route Correlation */}
          <div className="bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-[#5C3A21]">
              <span className="font-bold">यात्रा गंतव्य कोण:</span>
              <span className="font-black text-amber-800">{targetBearing.toFixed(1)}° ({targetDirectionName})</span>
            </div>
            <div className="flex justify-between items-center text-[#5C3A21]">
              <span className="font-bold">आज का दिशाशूल:</span>
              <span className="font-black text-rose-700">{shoolDirectionName} दिशा</span>
            </div>
            <div className="flex justify-between items-center text-[#5C3A21]">
              <span className="font-bold">मार्ग स्थिति:</span>
              <span className={`font-black ${isDirectionBlocked ? 'text-rose-700' : 'text-emerald-700'}`}>
                {isDirectionBlocked ? 'दिशाशूल प्रभावित ⛔' : 'शुभ व निर्बाध ✦'}
              </span>
            </div>
          </div>

          {/* Manual Angle Simulation Slider (Always available for testing / desktop) */}
          <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#5C3A21]">
              <span className="font-bold flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-[#B56A00]" />
                मैनुअल कम्पास कोण घुमाएँ
              </span>
              <span className="font-mono font-bold text-[#B56A00]">{manualOffset}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={sensorActive ? deviceHeading : manualOffset}
              onChange={(e) => {
                setSensorActive(false);
                setManualOffset(Number(e.target.value));
              }}
              className="w-full accent-[#B56A00] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C6239] font-bold">
              <span>उ (0°)</span>
              <span>पू (90°)</span>
              <span>द (180°)</span>
              <span>प (270°)</span>
              <span>उ (360°)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
