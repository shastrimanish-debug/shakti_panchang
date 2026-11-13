import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../i18n";

const SIXTEEN = [
  { hi: "उत्तर", en: "North (N)", gu: "ઉત્તર", devaHi: "कुबेर", devaEn: "Kubera", devaGu: "કુબેર" },
  { hi: "उत्तर-ईशान", en: "NNE", gu: "ઉત્તર-ઈશાન", devaHi: "ईश", devaEn: "Isha", devaGu: "ઈશ" },
  { hi: "ईशान", en: "North-East (NE)", gu: "ઈશાન", devaHi: "शिव", devaEn: "Shiva", devaGu: "શિવ" },
  { hi: "पूर्व-ईशान", en: "ENE", gu: "પૂર્વ-ઈશાન", devaHi: "पर्जन्य", devaEn: "Parjanya", devaGu: "પર્જન્ય" },
  { hi: "पूर्व", en: "East (E)", gu: "પૂર્વ", devaHi: "इंद्र", devaEn: "Indra", devaGu: "ઇન્દ્ર" },
  { hi: "पूर्व-आग्नेय", en: "ESE", gu: "પૂર્વ-અગ્નિ", devaHi: "सूर्य", devaEn: "Surya", devaGu: "સૂર્ય" },
  { hi: "आग्नेय", en: "South-East (SE)", gu: "અગ્નિ", devaHi: "अग्नि", devaEn: "Agni", devaGu: "અગ્નિ" },
  { hi: "दक्षिण-आग्नेय", en: "SSE", gu: "દક્ષિણ-અગ્નિ", devaHi: "अग्नि", devaEn: "Agni", devaGu: "અગ્નિ" },
  { hi: "दक्षिण", en: "South (S)", gu: "દક્ષિણ", devaHi: "यम", devaEn: "Yama", devaGu: "યમ" },
  { hi: "दक्षिण-नैऋत्य", en: "SSW", gu: "દક્ષિણ-નૈઋત્ય", devaHi: "नैऋति", devaEn: "Nirrti", devaGu: "નૈઋતિ" },
  { hi: "नैऋत्य", en: "South-West (SW)", gu: "નૈઋત્ય", devaHi: "राक्षस", devaEn: "Rakshasa", devaGu: "રાક્ષસ" },
  { hi: "पश्चिम-नैऋत्य", en: "WSW", gu: "પશ્ચિમ-નૈઋત્ય", devaHi: "वरुण", devaEn: "Varuna", devaGu: "વરુણ" },
  { hi: "पश्चिम", en: "West (W)", gu: "પશ્ચિમ", devaHi: "वरुण", devaEn: "Varuna", devaGu: "વરુણ" },
  { hi: "पश्चिम-वायव्य", en: "WNW", gu: "પશ્ચિમ-વાયવ્ય", devaHi: "वायु", devaEn: "Vayu", devaGu: "વાયુ" },
  { hi: "वायव्य", en: "North-West (NW)", gu: "વાયવ્ય", devaHi: "वायु", devaEn: "Vayu", devaGu: "વાયુ" },
  { hi: "उत्तर-वायव्य", en: "NNW", gu: "ઉત્તર-વાયવ્ય", devaHi: "कुबेर", devaEn: "Kubera", devaGu: "કુબેર" },
];

type Part = { name: string; deva: string; center: number; start: number; end: number };

function buildParts(count: 16 | 32, lang: string): Part[] {
  const cLang = (lang || "hi").slice(0, 2).toLowerCase();
  const span = 360 / count;
  return Array.from({ length: count }, (_, index) => {
    const center = index * span;
    const parent = SIXTEEN[Math.round(center / 22.5) % 16];
    const baseName = cLang === "en" ? parent.en : cLang === "gu" ? parent.gu : parent.hi;
    const deva = cLang === "en" ? parent.devaEn : cLang === "gu" ? parent.devaGu : parent.devaHi;
    const half = count === 32
      ? (index % 2 === 0 ? (cLang === "en" ? " A" : " क") : (cLang === "en" ? " B" : " ख"))
      : "";
    return {
      name: `${baseName}${half}`,
      deva,
      center,
      start: (center - span / 2 + 360) % 360,
      end: (center + span / 2) % 360,
    };
  });
}

function formatDeg(value: number) {
  return `${value.toFixed(1).replace(".0", "")}°`;
}

function wedge(center: number, span: number) {
  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [Math.cos(rad) * 100, Math.sin(rad) * 100];
  };
  const [x1, y1] = toXY(center - span / 2);
  const [x2, y2] = toXY(center + span / 2);
  const large = span > 180 ? 1 : 0;
  return `M 0 0 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 100 100 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

export function VastuCompass() {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const [parts, setParts] = useState<16 | 32>(16);
  const [heading, setHeading] = useState(0);
  const [live, setLive] = useState(false);
  const [flat, setFlat] = useState(true);
  const sectors = useMemo(() => buildParts(parts, cLang), [parts, cLang]);
  const span = 360 / parts;
  const index = Math.round(heading / span) % parts;
  const facing = sectors[index];

  const onOrientation = useCallback((event: DeviceOrientationEvent) => {
    const webkit = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
    const alpha = event.alpha;
    const next = typeof webkit === "number" ? webkit : alpha == null ? null : (360 - alpha) % 360;
    if (next == null || Number.isNaN(next)) return;
    setHeading((next + 360) % 360);
    setLive(true);
    const beta = Math.abs(event.beta ?? 0);
    const gamma = Math.abs(event.gamma ?? 0);
    setFlat(beta < 28 && gamma < 28);
  }, []);

  useEffect(() => {
    const absolute = "ondeviceorientationabsolute" in window;
    const name = absolute ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(name, onOrientation as EventListener, true);
    return () => window.removeEventListener(name, onOrientation as EventListener, true);
  }, [onOrientation]);

  return (
    <div className="flex flex-col gap-2">
      <div className="bx-verse">
        <div className="bx-kicker">
          {live ? L("लाइव कम्पास", "Live Compass", "લાઈવ કંપાસ") : L("सेंसर प्रतीक्षा", "Awaiting Sensor", "સેન્સર પ્રતીક્ષા")} · {parts} {L("भाग", "Zones", "ભાગ")}
        </div>
        <p className="text-sm">
          {L(
            "फ़ोन को ज़मीन पर सपाट रखें। ऊपर वाला किनारा जिस दिशा में हो, वही नीचे ग्रिड में चमकेगा।",
            "Place your phone flat on the floor. Whichever direction the top edge points will highlight in the grid below.",
            "ફોનને જમીન પર સપાટ રાખો. ઉપરની ધાર જે દિશામાં હશે, તે જ નીચેના ગ્રીડમાં ચમકશે."
          )}
        </p>
        {!flat && live ? (
          <p className="text-xs font-bold">
            {L(
              "फ़ोन अभी सपाट नहीं है। उसे ज़मीन पर बिछा दें।",
              "Phone is not flat right now. Lay it flat on the floor.",
              "ફોન હમણાં સપાટ નથી. તેને જમીન પર સપાટ મૂકો."
            )}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-3xl font-black leading-none">{formatDeg(heading)}</div>
          <div className="text-sm font-bold">{facing.name}</div>
          <div className="text-[11px] opacity-80">
            {facing.deva} · {formatDeg(facing.start)} {L("से", "to", "થી")} {formatDeg(facing.end)}
          </div>
        </div>
        <div className="flex gap-1">
          {([16, 32] as const).map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setParts(count)}
              className="rounded-full px-3 py-1 text-xs font-bold cursor-pointer"
              style={{ background: parts === count ? "#5C3A21" : "#F4E8D1", color: parts === count ? "#FAF2E4" : "#3a2414" }}
            >
              {count} {L("भाग", "Zones", "ભાગ")}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[320px] aspect-square">
        <svg viewBox="-120 -120 240 240" className="w-full h-full">
          <g style={{ transform: `rotate(${-heading}deg)`, transformOrigin: "0 0" }}>
            {sectors.map((sector, sectorIndex) => (
              <path
                key={sector.name + sector.center}
                d={wedge(sector.center, span)}
                fill={sectorIndex === index ? "#e7b15a" : sectorIndex % 2 ? "#fffaf3" : "#f3e2c4"}
                stroke="#8c6239"
                strokeWidth="0.6"
              />
            ))}
            {sectors.filter((_, sectorIndex) => parts === 16 || sectorIndex % 2 === 0).map((sector) => {
              const rad = ((sector.center - 90) * Math.PI) / 180;
              const x = Math.cos(rad) * 78;
              const y = Math.sin(rad) * 78;
              return (
                <text key={sector.center} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={parts === 32 ? 5 : 6.2} fill="#3a2414" transform={`rotate(${heading} ${x} ${y})`}>
                  {sector.name.replace("-", " ").replace(/ \([A-Z]+\)/, "")}
                </text>
              );
            })}
          </g>
          <polygon points="0,-108 9,-88 -9,-88" fill="#8b1e1e" />
          <circle cx="0" cy="0" r="28" fill="#fffaf3" stroke="#5c3a21" />
          <text x="0" y="2" textAnchor="middle" fontSize="11" fontWeight="700" fill="#5c3a21">{Math.round(heading)}°</text>
        </svg>
      </div>

      {!live ? (
        <label className="text-xs flex flex-col gap-1">
          {L(
            "सेंसर न चले तो अंश हाथ से घुमाएँ",
            "If sensor is unavailable, rotate degrees manually",
            "સેન્સર ન ચાલે તો અંશ હાથેથી ફેરવો"
          )}
          <input type="range" min={0} max={359} value={Math.round(heading)} onChange={(event) => setHeading(Number(event.target.value))} />
        </label>
      ) : null}

      <div className="grid grid-cols-2 gap-1.5">
        {sectors.map((sector, sectorIndex) => (
          <article key={sector.center} className="bx-verse" style={sectorIndex === index ? { outline: "2px solid #8b1e1e" } : undefined}>
            <div className="bx-kicker">
              {L("भाग", "Zone", "ભાગ")} {sectorIndex + 1}/{parts} · {L("मध्य", "Mid", "મધ્ય")} {formatDeg(sector.center)}
            </div>
            <strong className="text-sm">{sector.name}</strong>
            <span className="text-[11px]">{formatDeg(sector.start)} – {formatDeg(sector.end)} · {sector.deva}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
