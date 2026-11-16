import { useEffect, useState } from "react";
import {
  AYANAMSHA_LABELS,
  EKADASHI_TRADITION_LABELS,
  HOUSE_LABELS,
  MASA_SYSTEM_LABELS,
  NODE_LABELS,
  getCalcSettings,
  setCalcSettings,
  type AyanamshaId,
  type CalcSettings,
  type EkadashiTradition,
  type HouseSystem,
  type MasaSystem,
  type NodeType,
} from "../services/engine/calcSettings";
import { useTranslation } from "../i18n";

export function CalcSettingsPanel({
  compact = false,
  panchangOnly = false,
}: {
  compact?: boolean;
  panchangOnly?: boolean;
}) {
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

  const getMasaLabel = (id: MasaSystem) => {
    if (lang === "en") {
      return id === "purnimanta"
        ? "Purnimanta (North India)"
        : "Amanta (Guj / Mah / South)";
    }
    if (lang === "gu") {
      return id === "purnimanta"
        ? "પૂર્ણિમાંત (ઉત્તર ભારત)"
        : "અમાંત (ગુજરાત / મહારાષ્ટ્ર / દક્ષિણ)";
    }
    return MASA_SYSTEM_LABELS[id];
  };

  const getEkadashiLabel = (id: EkadashiTradition) => {
    if (lang === "en") {
      return id === "smarta"
        ? "Smarta (Householders)"
        : "Vaishnava (Viddha Check)";
    }
    if (lang === "gu") {
      return id === "smarta"
        ? "સ્માર્ત (ગૃહસ્થ મત)"
        : "વૈષ્ણવ (દશમી વિદ્ધા વર્જિત)";
    }
    return EKADASHI_TRADITION_LABELS[id];
  };

  return (
    <div className="bg-[#FAF2E4] dark:bg-[#2A170D] border border-[#8C6239]/30 rounded-xl p-3 space-y-2.5">
      <div className="text-xs font-black text-[#5C3A21] dark:text-[#FFD88A]">
        {lang === "en"
          ? panchangOnly
            ? "Regional Panchang & Vrat Tradition"
            : "Calculation & Regional Options"
          : lang === "gu"
          ? panchangOnly
            ? "ક્ષેત્રીય પંચાંગ અને વ્રત પરંપરા"
            : "ગણતરી અને ક્ષેત્રીય વિકલ્પો"
          : panchangOnly
          ? "क्षेत्रीय पञ्चाङ्ग व व्रत परंपरा"
          : "गणना व क्षेत्रीय परंपरा विकल्प"}
      </div>
      <div
        className={`grid gap-2 ${
          compact
            ? "grid-cols-1"
            : panchangOnly
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        }`}
      >
        <label className="text-[11px] font-bold text-[#8C6239] dark:text-amber-300 space-y-1">
          <span>{lang === "en" ? "Ayanamsha" : lang === "gu" ? "અયનાંશ" : "अयनांश"}</span>
          <select
            value={s.ayanamsha}
            onChange={(e) => apply({ ayanamsha: e.target.value as AyanamshaId })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white dark:bg-stone-900 px-2 text-xs font-semibold text-[#3E2714] dark:text-amber-100"
          >
            {(Object.keys(AYANAMSHA_LABELS) as AyanamshaId[]).map((id) => (
              <option key={id} value={id}>
                {getAyanamshaLabel(id)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[11px] font-bold text-[#8C6239] dark:text-amber-300 space-y-1">
          <span>
            {lang === "en" ? "Lunar Month" : lang === "gu" ? "માસ પરંપરા" : "मास परंपरा"}
          </span>
          <select
            value={s.masaSystem}
            onChange={(e) => apply({ masaSystem: e.target.value as MasaSystem })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white dark:bg-stone-900 px-2 text-xs font-semibold text-[#3E2714] dark:text-amber-100"
          >
            {(Object.keys(MASA_SYSTEM_LABELS) as MasaSystem[]).map((id) => (
              <option key={id} value={id}>
                {getMasaLabel(id)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[11px] font-bold text-[#8C6239] dark:text-amber-300 space-y-1">
          <span>
            {lang === "en" ? "Ekadashi Rule" : lang === "gu" ? "એકાદશી મત" : "एकादशी मत"}
          </span>
          <select
            value={s.ekadashiTradition}
            onChange={(e) => apply({ ekadashiTradition: e.target.value as EkadashiTradition })}
            className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white dark:bg-stone-900 px-2 text-xs font-semibold text-[#3E2714] dark:text-amber-100"
          >
            {(Object.keys(EKADASHI_TRADITION_LABELS) as EkadashiTradition[]).map((id) => (
              <option key={id} value={id}>
                {getEkadashiLabel(id)}
              </option>
            ))}
          </select>
        </label>

        {!panchangOnly && (
          <>
            <label className="text-[11px] font-bold text-[#8C6239] dark:text-amber-300 space-y-1">
              <span>{lang === "en" ? "Rahu–Ketu" : lang === "gu" ? "રાહુ–કેતુ" : "राहु–केतु"}</span>
              <select
                value={s.nodeType}
                onChange={(e) => apply({ nodeType: e.target.value as NodeType })}
                className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white dark:bg-stone-900 px-2 text-xs font-semibold text-[#3E2714] dark:text-amber-100"
              >
                {(Object.keys(NODE_LABELS) as NodeType[]).map((id) => (
                  <option key={id} value={id}>
                    {getNodeLabel(id)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] font-bold text-[#8C6239] dark:text-amber-300 space-y-1">
              <span>
                {lang === "en" ? "House System" : lang === "gu" ? "ભાવ પદ્ધતિ" : "भाव पद्धति"}
              </span>
              <select
                value={s.houseSystem}
                onChange={(e) => apply({ houseSystem: e.target.value as HouseSystem })}
                className="w-full min-h-11 rounded-lg border border-[#8C6239]/40 bg-white dark:bg-stone-900 px-2 text-xs font-semibold text-[#3E2714] dark:text-amber-100"
              >
                {(Object.keys(HOUSE_LABELS) as HouseSystem[]).map((id) => (
                  <option key={id} value={id}>
                    {getHouseLabel(id)}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
