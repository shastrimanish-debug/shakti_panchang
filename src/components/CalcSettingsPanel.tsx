import { useEffect, useState } from "react";
import {
  AYANAMSHA_LABELS,
  HOUSE_LABELS,
  NODE_LABELS,
  getCalcSettings,
  setCalcSettings,
  type AyanamshaId,
  type CalcSettings,
  type HouseSystem,
  type NodeType,
} from "../services/engine/calcSettings";

export function CalcSettingsPanel({ compact = false }: { compact?: boolean }) {
  const [s, setS] = useState<CalcSettings>(getCalcSettings);

  useEffect(() => {
    const sync = () => setS(getCalcSettings());
    window.addEventListener("shakti-calc-settings", sync);
    return () => window.removeEventListener("shakti-calc-settings", sync);
  }, []);

  const apply = (patch: Partial<CalcSettings>) => {
    const next = { ...s, ...patch };
    setS(next);
    setCalcSettings(next);
  };

  return (
    <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 space-y-2.5">
      <div className="text-xs font-black text-[#5C3A21]">गणना विकल्प (मुफ़्त इंजन)</div>
      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
        <label className="text-[11px] font-bold text-[#8C6239] space-y-1">
          <span>अयनांश</span>
          <select
            value={s.ayanamsha}
            onChange={(e) => apply({ ayanamsha: e.target.value as AyanamshaId })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white px-2 text-sm text-[#3E2714]"
          >
            {(Object.keys(AYANAMSHA_LABELS) as AyanamshaId[]).map((id) => (
              <option key={id} value={id}>
                {AYANAMSHA_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-bold text-[#8C6239] space-y-1">
          <span>राहु–केतु</span>
          <select
            value={s.nodeType}
            onChange={(e) => apply({ nodeType: e.target.value as NodeType })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white px-2 text-sm text-[#3E2714]"
          >
            {(Object.keys(NODE_LABELS) as NodeType[]).map((id) => (
              <option key={id} value={id}>
                {NODE_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-bold text-[#8C6239] space-y-1">
          <span>भाव पद्धति</span>
          <select
            value={s.houseSystem}
            onChange={(e) => apply({ houseSystem: e.target.value as HouseSystem })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white px-2 text-sm text-[#3E2714]"
          >
            {(Object.keys(HOUSE_LABELS) as HouseSystem[]).map((id) => (
              <option key={id} value={id}>
                {HOUSE_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-[10px] text-[#735133] leading-relaxed">
        मुख्य: XALEN / astronomy-engine • जाँच: मीयस • Swiss नहीं (लाइसेंस नहीं)
      </p>
    </div>
  );
}
