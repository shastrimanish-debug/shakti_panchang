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
import { useTranslation } from "../i18n";

export function CalcSettingsPanel({ compact = false }: { compact?: boolean }) {
  const [s, setS] = useState<CalcSettings>(getCalcSettings);
  const { i18n } = useTranslation();
  const lang = i18n?.language?.slice(0, 2).toLowerCase() || "hi";

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

  const getAyanamshaLabel = (id: AyanamshaId) => {
    if (lang === "en") {
      if (id === "lahiri") return "Lahiri / Chitrapaksha";
      if (id === "raman") return "B.V. Raman";
      if (id === "kp") return "K.P. / Krishnamurti";
    }
    if (lang === "gu") {
      if (id === "lahiri") return "લાહિરી / ચિત્રપક્ષ";
      if (id === "raman") return "બી.વી. રમણ";
      if (id === "kp") return "કે.પી. / કૃષ્ણમૂર્તિ";
    }
    return AYANAMSHA_LABELS[id];
  };

  const getNodeLabel = (id: NodeType) => {
    if (lang === "en") {
      return id === "mean" ? "Mean Rahu & Ketu" : "True Rahu & Ketu";
    }
    if (lang === "gu") {
      return id === "mean" ? "મધ્ય રાહુ (Mean)" : "સ્પષ્ટ રાહુ (True)";
    }
    return NODE_LABELS[id];
  };

  const getHouseLabel = (id: HouseSystem) => {
    if (lang === "en") {
      return id === "whole" ? "Whole Sign (Rashi Bhava)" : "Sripati Houses";
    }
    if (lang === "gu") {
      return id === "whole" ? "રાશિ ભાવ (Whole Sign)" : "શ્રીપતિ ભાવ";
    }
    return HOUSE_LABELS[id];
  };

  return (
    <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 space-y-2.5">
      <div className="text-xs font-black text-[#5C3A21]">
        {lang === "en" ? "Calculation Options" : lang === "gu" ? "ગણતરી વિકલ્પો" : "गणना विकल्प"}
      </div>
      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
        <label className="text-[11px] font-bold text-[#8C6239] space-y-1">
          <span>{lang === "en" ? "Ayanamsha" : lang === "gu" ? "અયનાંશ" : "अयनांश"}</span>
          <select
            value={s.ayanamsha}
            onChange={(e) => apply({ ayanamsha: e.target.value as AyanamshaId })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white px-2 text-sm text-[#3E2714]"
          >
            {(Object.keys(AYANAMSHA_LABELS) as AyanamshaId[]).map((id) => (
              <option key={id} value={id}>
                {getAyanamshaLabel(id)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-bold text-[#8C6239] space-y-1">
          <span>{lang === "en" ? "Rahu–Ketu" : lang === "gu" ? "રાહુ–કેતુ" : "राहु–केतु"}</span>
          <select
            value={s.nodeType}
            onChange={(e) => apply({ nodeType: e.target.value as NodeType })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white px-2 text-sm text-[#3E2714]"
          >
            {(Object.keys(NODE_LABELS) as NodeType[]).map((id) => (
              <option key={id} value={id}>
                {getNodeLabel(id)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-bold text-[#8C6239] space-y-1">
          <span>{lang === "en" ? "House System" : lang === "gu" ? "ભાવ પદ્ધતિ" : "भाव पद्धति"}</span>
          <select
            value={s.houseSystem}
            onChange={(e) => apply({ houseSystem: e.target.value as HouseSystem })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white px-2 text-sm text-[#3E2714]"
          >
            {(Object.keys(HOUSE_LABELS) as HouseSystem[]).map((id) => (
              <option key={id} value={id}>
                {getHouseLabel(id)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
