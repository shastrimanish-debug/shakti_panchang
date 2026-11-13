import React, { useMemo, useState } from "react";
import {
  RAVAN_SANHITA_CATEGORIES,
  RAVAN_SANHITA_DATA,
  type RavanSanhitaUpayItem,
} from "../data/ravanSanhitaData";
import { shareTextContent } from "../lib/shareHelper";
import { speakUma, stopUmaSpeech } from "../lib/umaSpeech";
import { useLanguage } from "../i18n";
import { trVedic } from "../i18n/vedicTranslate";
import {
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Search,
  X,
  Compass,
  BookOpen,
} from "lucide-react";
import { useTabMenu } from "./BoardShell";
import { ShlokaPosterModal, ShlokaPosterData } from "./ShlokaPosterModal";

const RAVAN_CAT_LABELS: Record<string, { en: string; gu: string }> = {
  "सभी": { en: "All", gu: "બધા" },
  "धन व बरकत": { en: "Wealth & Prosperity", gu: "ધન અને બરકત" },
  "व्यापार व दुकान": { en: "Business & Shop", gu: "વ્યાપાર અને દુકાન" },
  "नौकरी व करियर": { en: "Job & Career", gu: "નોકરી અને કારકિર્દી" },
  "कर्ज-मुक्ति": { en: "Debt Relief", gu: "દેવા-મુક્તિ" },
  "विवाह व गृह-शांति": { en: "Marriage & Home Peace", gu: "વિવાહ અને ગૃહ-શાંતિ" },
  "नवग्रह व दोष शांति": { en: "Navagraha & Dosha Shanti", gu: "નવગ્રહ અને દોષ શાંતિ" },
  "स्वास्थ्य व रक्षा": { en: "Health & Protection", gu: "આરોગ્ય અને રક્ષા" },
  "विद्या, संतान व संपत्ति": { en: "Education, Progeny & Property", gu: "વિદ્યા, સંતાન અને સંપત્તિ" },
};

function trRavanCat(cat: string, cLang: string): string {
  if (cLang === "en") return RAVAN_CAT_LABELS[cat]?.en || trVedic(cat, "en");
  if (cLang === "gu") return RAVAN_CAT_LABELS[cat]?.gu || trVedic(cat, "gu");
  return cat;
}

export function RavanSanhitaUpayView({
  onAskUma,
}: {
  onAskUma?: (query: string) => void;
}) {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("सभी");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const needle = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      RAVAN_SANHITA_DATA.upay_list.filter((item) => {
        if (category !== "सभी" && item.tag !== category) return false;
        if (!needle) return true;
        return `${item.code} ${item.title} ${item.planetOrDeity} ${item.best_time} ${item.directionAndAsana} ${item.samagri.join(" ")} ${item.sankalpAndMantra} ${item.vidhi} ${item.durationAndRules} ${item.labh} ${item.tag}`
          .toLowerCase()
          .includes(needle);
      }),
    [category, needle]
  );

  const selected =
    RAVAN_SANHITA_DATA.upay_list.find((item) => item.id === selectedId) ?? null;

  useTabMenu(() => {
    if (selectedId == null) return false;
    stopUmaSpeech();
    setSelectedId(null);
    return true;
  });

  return (
    <div
      className="flex-1 min-h-0 h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FFF9F0" }}
    >
      {/* Uniform Header & Filter Bar */}
      <div
        className="shrink-0 relative z-10 px-3 pt-2 pb-2 flex flex-col gap-1.5 border-b"
        style={{ backgroundColor: "#FFF9F0", borderColor: "#C89D66" }}
      >
        {selected ? (
          <button
            type="button"
            className="text-left text-sm font-bold truncate py-1 cursor-pointer flex items-center gap-1.5"
            style={{ color: "#4A0E0E" }}
            onClick={() => {
              stopUmaSpeech();
              setSelectedId(null);
            }}
          >
            <span>←</span>
            <span>
              {selected.id}. {selected.title}
            </span>
          </button>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                className="text-[13px] sm:text-sm font-bold flex items-center gap-1.5"
                style={{ color: "#4A0E0E" }}
              >
                <span>
                  🔱{" "}
                  {L(
                    RAVAN_SANHITA_DATA.category,
                    "108 Authentic Maha-Upay of Ravan Sanhita (Complete Vidhi)",
                    "રાવણ સંહિતાના ૧૦૮ સિદ્ધ મહા-ઉપાય (સંપૂર્ણ વિધિ સહિત)"
                  )}
                </span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: "#F4E8D1", color: "#4A0E0E" }}
                >
                  {list.length} / {RAVAN_SANHITA_DATA.upay_list.length} {L("उपाय", "Remedies", "ઉપાય")}
                </span>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                style={{
                  backgroundColor: "#FAF2E4",
                  color: "#5C3A21",
                  borderColor: "#C89D66",
                }}
              >
                {L(
                  `१०८ विस्तृत विधान (v${RAVAN_SANHITA_DATA.module_version})`,
                  `108 Detailed Methods (v${RAVAN_SANHITA_DATA.module_version})`,
                  `૧૦૮ વિસ્તૃત વિધાન (v${RAVAN_SANHITA_DATA.module_version})`
                )}
              </span>
            </div>

            <p
              className="text-[11px] leading-snug font-semibold"
              style={{ color: "#4A2511" }}
            >
              {L(
                RAVAN_SANHITA_DATA.content_note,
                "These 108 Sattvic remedies are rooted in Ravan Sanhita and Vedic traditions. Each entry includes preparation, exact materials, direction/asana, sankalpa mantra, 3-step vidhi, and closing rules.",
                "આ ૧૦૮ મહા-ઉપાય રાવણ સંહિતા અને પરંપરાગત વૈદિક માન્યતાઓ પર આધારિત સાત્વિક અને અહાનિકર પ્રયોગો છે. દરેક ઉપાયમાં પૂર્વ તૈયારી, સામગ્રી, દિશા-આસન, સંકલ્પ મંત્ર, ૩-ચરણીય વિધિ અને વિસર્જન નિયમો આપેલા છે."
              )}
            </p>

            <div className="relative">
              <Search
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#6E1409" }}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={L(
                  "१०८ उपायों में खोजें (जैसे: तिजोरी, व्यापार, प्रमोशन, कर्ज, विवाह, शनि, रोग, संतान, मकान)...",
                  "Search 108 remedies (wealth, business, promotion, debt, marriage, Shani, health, property)...",
                  "૧૦૮ ઉપાયોમાં શોધો (જેમ કે: તિજોરી, વ્યાપાર, પ્રમોશન, દેવું, વિવાહ, શનિ, રોગ, સંતાન)..."
                )}
                className="w-full rounded-xl border pl-8 pr-8 py-1.5 text-xs sm:text-sm bg-white outline-none"
                style={{ color: "#1F1006", borderColor: "#C89D66" }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: "#5C3A21" }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {RAVAN_SANHITA_CATEGORIES.map((item) => (
                <Chip
                  key={item}
                  active={category === item}
                  onClick={() => setCategory(item)}
                >
                  {trRavanCat(item, cLang)}
                </Chip>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Uniform Remedy Cards List or Full Step-by-Step Detail View */}
      <div
        className="flex-1 min-h-0 h-full w-full overflow-y-auto overscroll-y-contain px-2 py-2 pb-28 flex flex-col gap-2.5"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {selected ? (
          <Detail item={selected} onAskUma={onAskUma} />
        ) : (
          list.map((item) => (
            <button
              key={item.id}
              type="button"
              className="bx-verse text-left w-full cursor-pointer transition hover:opacity-95"
              style={{ touchAction: "pan-y" }}
              onClick={() => setSelectedId(item.id)}
            >
              <div className="bx-kicker flex flex-wrap items-center justify-between gap-1.5">
                <span>
                  {L("उपाय", "Remedy", "ઉપાય")} #{item.id} ({item.code}) · {trRavanCat(item.tag, cLang)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.best_time}
                </span>
              </div>
              <strong
                className="text-sm font-bold block mt-0.5"
                style={{ color: "#4A0E0E" }}
              >
                {item.title}
              </strong>
              <span
                className="text-[11px] font-bold block mt-0.5"
                style={{ color: "#6E1409" }}
              >
                {L("आराध्य व ग्रह:", "Deity & Planet:", "આરાધ્ય અને ગ્રહ:")} {item.planetOrDeity}
              </span>
              <span
                className="text-xs font-semibold block mt-0.5 line-clamp-2"
                style={{ color: "#241004" }}
              >
                {item.sankalpAndMantra}
              </span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span
                  className="text-[11px] font-semibold truncate"
                  style={{ color: "#4A2511" }}
                >
                  {L("सामग्री:", "Materials:", "સામગ્રી:")} {item.samagri.join(" • ")}
                </span>
                <span
                  className="text-[11px] font-bold shrink-0 px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: "#F4E8D1", color: "#4A0E0E" }}
                >
                  {L("संपूर्ण विधि पढ़ें →", "Read Full Method →", "સંપૂર્ણ વિધિ વાંચો →")}
                </span>
              </div>
            </button>
          ))
        )}

        {!selected && list.length === 0 ? (
          <article className="bx-verse text-center py-6">
            <p className="text-sm font-bold" style={{ color: "#4A0E0E" }}>
              {L(
                "इस खोज में कोई उपाय नहीं मिला।",
                "No remedies matched your search.",
                "આ શોધમાં કોઈ ઉપાય મળ્યો નથી."
              )}
            </p>
          </article>
        ) : null}
      </div>
    </div>
  );
}

function Detail({
  item,
  onAskUma,
}: {
  item: RavanSanhitaUpayItem;
  onAskUma?: (query: string) => void;
}) {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildShareText = () =>
    `${L(
      `॥ रावण संहिता सिद्ध महा-उपाय #${item.id} (${item.code}) ॥`,
      `॥ Ravan Sanhita Authentic Maha-Upay #${item.id} (${item.code}) ॥`,
      `॥ રાવણ સંહિતા સિદ્ધ મહા-ઉપાય #${item.id} (${item.code}) ॥`
    )}\n\n` +
    `🔱 ${item.title}\n` +
    `• ${L("श्रेणी:", "Category:", "શ્રેણી:")} ${trRavanCat(item.tag, cLang)}\n` +
    `• ${L("आराध्य देवता व ग्रह:", "Deity & Planet:", "આરાધ્ય દેવતા અને ગ્રહ:")} ${item.planetOrDeity}\n` +
    `• ${L("शुभ वार व सटीक समय:", "Auspicious Day & Time:", "શુભ વાર અને સચોટ સમય:")} ${item.best_time}\n` +
    `• ${L("दिशा, वस्त्र व आसन:", "Direction, Attire & Asana:", "દિશા, વસ્ત્ર અને આસન:")} ${item.directionAndAsana}\n\n` +
    `• ${L("आवश्यक पूजन सामग्री:", "Required Puja Materials:", "આવશ્યક પૂજન સામગ્રી:")}\n  - ${item.samagri.join("\n  - ")}\n\n` +
    `• ${L("संकल्प एवं सिद्ध मंत्र:", "Sankalpa & Siddha Mantra:", "સંકલ્પ અને સિદ્ધ મંત્ર:")}\n${item.sankalpAndMantra}\n\n` +
    `• ${L("संपूर्ण चरणबद्ध प्रयोग विधि:", "Complete Step-by-Step Procedure:", "સંપૂર્ણ ચરણબદ્ધ પ્રયોગ વિધિ:")}\n${item.vidhi}\n\n` +
    `• ${L("अवधि एवं सात्विक नियम:", "Duration & Sattvic Rules:", "અવધિ અને સાત્વિક નિયમો:")}\n${item.durationAndRules}\n\n` +
    `• ${L("परंपरागत शास्त्रीय लाभ:", "Traditional Classical Benefits:", "પરંપરાગત શાસ્ત્રીય લાભ:")}\n${item.labh}\n\n` +
    `• ${L("सावधानी एवं व्यावहारिक सूत्र:", "Precautions & Practical Note:", "સાવધાની અને વ્યવહારિક સૂત્ર:")}\n${item.safety_note}\n\n` +
    `_${L("सनातन शक्ति पंचांग", "Sanatan Shakti Panchang", "સનાતન શક્તિ પંચાંગ")}_`;

  const handleShare = () => {
    shareTextContent({
      title: item.title,
      text: buildShareText(),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }
    const speechText = L(
      `रावण संहिता उपाय संख्या ${item.id}। ${item.title}। आराध्य देवता एवं ग्रह: ${item.planetOrDeity}। शुभ समय: ${item.best_time}। दिशा एवं आसन: ${item.directionAndAsana}। आवश्यक सामग्री: ${item.samagri.join(", ")}। संकल्प एवं मंत्र: ${item.sankalpAndMantra}। विस्तृत विधि: ${item.vidhi}। अवधि एवं नियम: ${item.durationAndRules}। लाभ: ${item.labh}। सावधानी: ${item.safety_note}`,
      `Ravan Sanhita Remedy number ${item.id}. ${item.title}. Presiding Deity and Planet: ${item.planetOrDeity}. Auspicious Time: ${item.best_time}. Direction and Asana: ${item.directionAndAsana}. Materials: ${item.samagri.join(", ")}. Sankalpa and Mantra: ${item.sankalpAndMantra}. Procedure: ${item.vidhi}. Duration and Rules: ${item.durationAndRules}. Benefits: ${item.labh}. Caution: ${item.safety_note}`,
      `રાવણ સંહિતા ઉપાય સંખ્યા ${item.id}. ${item.title}. આરાધ્ય દેવતા અને ગ્રહ: ${item.planetOrDeity}. શુભ સમય: ${item.best_time}. દિશા અને આસન: ${item.directionAndAsana}. આવશ્યક સામગ્રી: ${item.samagri.join(", ")}. સંકલ્પ અને મંત્ર: ${item.sankalpAndMantra}. વિસ્તૃત વિધિ: ${item.vidhi}. અવધિ અને નિયમ: ${item.durationAndRules}. લાભ: ${item.labh}. સાવધાની: ${item.safety_note}`
    );
    setIsSpeaking(true);
    speakUma(speechText, { mode: "stotram", onEnd: () => setIsSpeaking(false) });
  };

  return (
    <>
      <div className="flex flex-wrap justify-end gap-1.5 px-1 pt-0.5 pb-1">
        <button
          type="button"
          onClick={handleToggleVoice}
          style={{
            backgroundColor: isSpeaking ? "#4A0E0E" : "#6E1409",
            color: "#FFFFFF",
          }}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          {isSpeaking ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span>
            {isSpeaking
              ? L("वाणी रोकें", "Stop Voice", "વાણી રોકો")
              : L("संपूर्ण विधि सुनें", "Listen Full Vidhi", "સંપૂર્ણ વિધિ સાંભળો")}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setPosterData({
              title: item.title,
              reference: `${L("रावण संहिता उपाय", "Ravan Sanhita Remedy", "રાવણ સંહિતા ઉપાય")} #${item.id} (${item.code}) · ${item.best_time}`,
              sanskrit: item.sankalpAndMantra,
              meaning: `${L("सामग्री:", "Materials:", "સામગ્રી:")} ${item.samagri.join(" • ")}\n\n${L("लाभ:", "Benefits:", "લાભ:")} ${item.labh}`,
              accentTag: L(
                "🔱 रावण संहिता १०८ महा-उपाय",
                "🔱 Ravan Sanhita 108 Maha-Upay",
                "🔱 રાવણ સંહિતા ૧૦૮ મહા-ઉપાય"
              ),
            })
          }
          style={{ backgroundColor: "#6E1409", color: "#FFFFFF" }}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <span>{L("📸 स्टेटस कार्ड", "📸 Status Card", "📸 સ્ટેટસ કાર્ડ")}</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          style={{ backgroundColor: "#F4E8D1", color: "#3A2414" }}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#C89D66] shadow-xs cursor-pointer"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>
            {copied
              ? L("कॉपी हुआ", "Copied", "કૉપિ થયું")
              : L("कॉपी", "Copy", "કૉપિ")}
          </span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          style={{ backgroundColor: "#6E1409", color: "#FFFFFF" }}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{L("शेयर", "Share", "શેર")}</span>
        </button>

        {onAskUma && (
          <button
            type="button"
            onClick={() =>
              onAskUma(
                L(
                  `रावण संहिता का उपाय #${item.id} "${item.title}" मेरे लग्न और राशि के अनुसार करने का सबसे शुभ मुहूर्त और व्यक्तिगत विधान क्या है?`,
                  `What is the best Muhurat and personalized guidance for performing Ravan Sanhita Remedy #${item.id} "${item.title}" according to my Ascendant and Moon Sign?`,
                  `મારા લગ્ન અને રાશિ અનુસાર રાવણ સંહિતાનો ઉપાય #${item.id} "${item.title}" કરવાનું સૌથી શુભ મુહૂર્ત અને વ્યક્તિગત વિધાન શું છે?`
                )
              )
            }
            style={{ backgroundColor: "#4A0E0E", color: "#FAF2E4" }}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{L("उमा से पूछें", "Ask Uma", "ઉમાને પૂછો")}</span>
          </button>
        )}
      </div>

      {/* १. उपाय शीर्षक, आराध्य देवता, शुभ समय व दिशा-आसन */}
      <article className="bx-verse">
        <div className="bx-kicker">
          {L("उपाय संख्या", "Remedy No.", "ઉપાય સંખ્યા")} #{item.id} ({item.code}) · {trRavanCat(item.tag, cLang)}
        </div>
        <p
          className="font-granth font-bold text-[17px] leading-snug"
          style={{ color: "#4A0E0E" }}
        >
          {item.title}
        </p>
        <div className="mt-2 space-y-1 text-xs font-semibold" style={{ color: "#241004" }}>
          <p className="flex items-start gap-1.5">
            <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#6E1409" }} />
            <span>
              <strong>{L("आराध्य देवता एवं संबंधित ग्रह:", "Deity & Related Planet:", "આરાધ્ય દેવતા અને સંબંધિત ગ્રહ:")}</strong> {item.planetOrDeity}
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#6E1409" }} />
            <span>
              <strong>{L("शुभ वार, तिथि एवं सटीक समय:", "Auspicious Day, Tithi & Time:", "શુભ વાર, તિથિ અને સચોટ સમય:")}</strong> {item.best_time}
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <Compass className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#6E1409" }} />
            <span>
              <strong>{L("दिशा, वस्त्र एवं आसन विधान:", "Direction, Attire & Asana:", "દિશા, વસ્ત્ર અને આસન વિધાન:")}</strong> {item.directionAndAsana}
            </span>
          </p>
        </div>
      </article>

      {/* २. आवश्यक पूजन सामग्री (सटीक मात्रा सहित) */}
      <article className="bx-verse">
        <div className="bx-kicker">
          {L(
            "आवश्यक पूजन सामग्री (सटीक मात्रा सहित)",
            "Required Puja Materials (with Exact Measure)",
            "આવશ્યક પૂજન સામગ્રી (સચોટ માત્રા સહિત)"
          )}
        </div>
        <ul className="space-y-1.5 mt-1">
          {item.samagri.map((sam, idx) => (
            <li
              key={idx}
              className="text-sm font-semibold flex items-start gap-2"
              style={{ color: "#241004" }}
            >
              <span className="font-bold" style={{ color: "#6E1409" }}>
                {idx + 1}.
              </span>
              <span>{sam}</span>
            </li>
          ))}
        </ul>
      </article>

      {/* ३. संकल्प, सिद्ध मंत्र एवं जप संख्या */}
      <article className="bx-verse">
        <div className="bx-kicker">
          {L(
            "संकल्प, सिद्ध मंत्र, माला एवं जप संख्या",
            "Sankalpa, Siddha Mantra, Mala & Japa Count",
            "સંકલ્પ, સિદ્ધ મંત્ર, માળા અને જપ સંખ્યા"
          )}
        </div>
        <p
          className="font-granth font-bold text-[15px] sm:text-base leading-relaxed"
          style={{ color: "#4A0E0E" }}
        >
          {item.sankalpAndMantra}
        </p>
      </article>

      {/* ४. संपूर्ण ३-चरणीय विस्तृत प्रयोग विधि */}
      <article className="bx-verse">
        <div className="bx-kicker">
          {L(
            "संपूर्ण चरणबद्ध प्रयोग विधि (तैयारी, अभिमंत्रण एवं विसर्जन विधान)",
            "Complete Step-by-Step Procedure (Preparation, Consecration & Immersion)",
            "સંપૂર્ણ ચરણબદ્ધ પ્રયોગ વિધિ (તૈયારી, અભિમંત્રણ અને વિસર્જન વિધાન)"
          )}
        </div>
        <div
          className="text-sm leading-relaxed font-medium whitespace-pre-line mt-1"
          style={{ color: "#241004" }}
        >
          {item.vidhi}
        </div>
      </article>

      {/* ५. प्रयोग की अवधि एवं पालन करने योग्य सात्विक नियम */}
      <article className="bx-verse">
        <div className="bx-kicker">
          {L(
            "अवधि एवं आवश्यक सात्विक नियम",
            "Duration & Essential Sattvic Rules",
            "અવધિ અને આવશ્યક સાત્વિક નિયમો"
          )}
        </div>
        <p
          className="text-sm leading-relaxed font-semibold"
          style={{ color: "#241004" }}
        >
          {item.durationAndRules}
        </p>
      </article>

      {/* ६. परंपरागत मान्यता एवं शास्त्रीय फल */}
      <article className="bx-verse">
        <div className="bx-kicker">
          {L(
            "परंपरागत मान्यता एवं शास्त्रीय फल",
            "Traditional Belief & Classical Benefits",
            "પરંપરાગત માન્યતા અને શાસ્ત્રીય ફળ"
          )}
        </div>
        <p
          className="text-sm leading-relaxed font-semibold"
          style={{ color: "#241004" }}
        >
          {item.labh}
        </p>
      </article>

      {/* ७. सावधानी एवं व्यावहारिक जीवन सूत्र */}
      <article className="bx-verse">
        <div className="bx-kicker flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#6E1409" }} />
          <span>
            {L(
              "सावधानी एवं व्यावहारिक जीवन सूत्र",
              "Precautions & Practical Wisdom",
              "સાવધાની અને વ્યવહારિક જીવન સૂત્ર"
            )}
          </span>
        </div>
        <p
          className="text-xs sm:text-sm leading-relaxed font-semibold"
          style={{ color: "#4A2511" }}
        >
          {item.safety_note}
        </p>
      </article>

      <ShlokaPosterModal
        isOpen={posterData !== null}
        onClose={() => setPosterData(null)}
        data={posterData}
      />
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer transition"
      style={{
        background: active ? "#6E1409" : "#F4E8D1",
        color: active ? "#FFFFFF" : "#3A2414",
        border: active ? "1px solid #4A0E0E" : "1px solid #C89D66",
      }}
    >
      {children}
    </button>
  );
}

export default RavanSanhitaUpayView;

