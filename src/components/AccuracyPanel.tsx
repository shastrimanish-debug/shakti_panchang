import { useEffect, useMemo, useState } from "react";
import { verifyEngines } from "../services/engine/verify";
import { formatDms } from "../services/engine/ayanamsha";
import { AYANAMSHA_LABELS, getCalcSettings } from "../services/engine/calcSettings";

export function AccuracyPanel({ date }: { date: Date }) {
  const [rev, setRev] = useState(0);
  useEffect(() => {
    const bump = () => setRev((n) => n + 1);
    window.addEventListener("shakti-calc-settings", bump);
    return () => window.removeEventListener("shakti-calc-settings", bump);
  }, []);
  const report = useMemo(() => verifyEngines(date), [date, rev]);
  const settings = getCalcSettings();

  return (
    <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3.5 space-y-2.5">
      <div>
        <h3 className="text-sm font-black text-[#5C3A21]">गणना जाँच पट्टी</h3>
        <p className="text-[11px] text-[#735133] mt-0.5">
          {AYANAMSHA_LABELS[settings.ayanamsha]} • {formatDms(report.ayanamsha)} • दो मुफ़्त इंजन
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-[#3E2714]">
          <thead>
            <tr className="text-[#8C6239] border-b border-[#8C6239]/25">
              <th className="text-left py-1 font-bold">ग्रह</th>
              <th className="text-right py-1 font-bold">XALEN</th>
              <th className="text-right py-1 font-bold">मीयस</th>
              <th className="text-right py-1 font-bold">अंतर</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((r) => (
              <tr key={r.planet} className="border-b border-[#8C6239]/10">
                <td className="py-1 font-bold">{r.planet}</td>
                <td className="py-1 text-right font-mono">{r.xalenDeg.toFixed(2)}°</td>
                <td className="py-1 text-right font-mono">{r.meeusDeg.toFixed(2)}°</td>
                <td className="py-1 text-right font-mono">
                  {r.deltaArcsec < 60
                    ? `${r.deltaArcsec.toFixed(0)}″`
                    : `${(r.deltaArcsec / 60).toFixed(1)}′`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-[#735133] leading-relaxed">{report.note}</p>
    </div>
  );
}
