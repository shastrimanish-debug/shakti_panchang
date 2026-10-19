import React, { useCallback, useEffect, useMemo, useState } from "react";

const SIXTEEN = [
  { name: "उत्तर", deva: "कुबेर" },
  { name: "उत्तर-ईशान", deva: "ईश" },
  { name: "ईशान", deva: "शिव" },
  { name: "पूर्व-ईशान", deva: "पर्जन्य" },
  { name: "पूर्व", deva: "इंद्र" },
  { name: "पूर्व-आग्नेय", deva: "सूर्य" },
  { name: "आग्नेय", deva: "अग्नि" },
  { name: "दक्षिण-आग्नेय", deva: "अग्नि" },
  { name: "दक्षिण", deva: "यम" },
  { name: "दक्षिण-नैऋत्य", deva: "नैऋति" },
  { name: "नैऋत्य", deva: "राक्षस" },
  { name: "पश्चिम-नैऋत्य", deva: "वरुण" },
  { name: "पश्चिम", deva: "वरुण" },
  { name: "पश्चिम-वायव्य", deva: "वायु" },
  { name: "वायव्य", deva: "वायु" },
  { name: "उत्तर-वायव्य", deva: "कुबेर" },
];

type Part = { name: string; deva: string; center: number; start: number; end: number };

function buildParts(count: 16 | 32): Part[] {
  const span = 360 / count;
  return Array.from({ length: count }, (_, index) => {
    const center = index * span;
    const parent = SIXTEEN[Math.round(center / 22.5) % 16];
    const half = count === 32 ? (index % 2 === 0 ? " क" : " ख") : "";
    return {
      name: `${parent.name}${half}`,
      deva: parent.deva,
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
  const [parts, setParts] = useState<16 | 32>(16);
  const [heading, setHeading] = useState(0);
  const [live, setLive] = useState(false);
  const [flat, setFlat] = useState(true);
  const sectors = useMemo(() => buildParts(parts), [parts]);
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
        <div className="bx-kicker">{live ? "लाइव कम्पास" : "सेंसर प्रतीक्षा"} · {parts} भाग</div>
        <p className="text-sm">फ़ोन को ज़मीन पर सपाट रखें। ऊपर वाला किनारा जिस दिशा में हो, वही नीचे ग्रिड में चमकेगा।</p>
        {!flat && live ? <p className="text-xs font-bold">फ़ोन अभी सपाट नहीं है। उसे ज़मीन पर बिछा दें।</p> : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-3xl font-black leading-none">{formatDeg(heading)}</div>
          <div className="text-sm font-bold">{facing.name}</div>
          <div className="text-[11px] opacity-80">{facing.deva} · {formatDeg(facing.start)} से {formatDeg(facing.end)}</div>
        </div>
        <div className="flex gap-1">
          {([16, 32] as const).map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setParts(count)}
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: parts === count ? "#5C3A21" : "#F4E8D1", color: parts === count ? "#FAF2E4" : "#3a2414" }}
            >
              {count} भाग
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
                <text key={sector.center} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={parts === 32 ? 5 : 7} fill="#3a2414" transform={`rotate(${heading} ${x} ${y})`}>
                  {sector.name.replace("-", " ")}
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
          सेंसर न चले तो अंश हाथ से घुमाएँ
          <input type="range" min={0} max={359} value={Math.round(heading)} onChange={(event) => setHeading(Number(event.target.value))} />
        </label>
      ) : null}

      <div className="grid grid-cols-2 gap-1.5">
        {sectors.map((sector, sectorIndex) => (
          <article key={sector.center} className="bx-verse" style={sectorIndex === index ? { outline: "2px solid #8b1e1e" } : undefined}>
            <div className="bx-kicker">भाग {sectorIndex + 1}/{parts} · मध्य {formatDeg(sector.center)}</div>
            <strong className="text-sm">{sector.name}</strong>
            <span className="text-[11px]">{formatDeg(sector.start)} – {formatDeg(sector.end)} · {sector.deva}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
