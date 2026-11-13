import React, { useMemo, useState } from "react";
import { SABAR_DEITIES, SABAR_MANTRAS, SABAR_NOTE, type SabarMantra } from "../data/saral/sabar";
import { shareTextContent } from "../lib/shareHelper";
import { Share2 } from "lucide-react";
import { useTabMenu } from "./BoardShell";
import { ShlokaPosterModal, ShlokaPosterData } from "./ShlokaPosterModal";
import { useLanguage } from "../i18n";
import { trVedic } from "../i18n/vedicTranslate";

const SABAR_DEITY_LABELS: Record<string, { en: string; gu: string }> = {
  "हनुमान": { en: "Hanuman", gu: "હનુમાન" },
  "गुरु गोरखनाथ": { en: "Guru Gorakhnath", gu: "ગુરુ ગોરખનાથ" },
  "दुर्गा": { en: "Durga", gu: "દુર્ગા" },
  "शिव": { en: "Shiva", gu: "શિવ" },
  "लक्ष्मी": { en: "Lakshmi", gu: "લક્ષ્મી" },
  "भैरव": { en: "Bhairava", gu: "ભૈરવ" },
  "नवनाथ": { en: "Navnath", gu: "નવનાથ" },
  "कामाख्या देवी": { en: "Kamakhya Devi", gu: "કામાખ્યા દેવી" },
  "नवग्रह (शिव-गोरखनाथ)": { en: "Navagraha (Shiva-Gorakhnath)", gu: "નવગ્રહ (શિવ-ગોરખનાથ)" },
  "नरसिंह": { en: "Narasimha", gu: "નરસિંહ" },
  "महाकाली": { en: "Mahakali", gu: "મહાકાળી" },
  "काल भैरव": { en: "Kaal Bhairava", gu: "કાળ ભૈરવ" },
  "सरस्वती": { en: "Saraswati", gu: "સરસ્વતી" },
  "शिव-पार्वती": { en: "Shiva-Parvati", gu: "શિવ-પાર્વતી" },
  "नवनाथ / दत्तात्रेय": { en: "Navnath / Dattatreya", gu: "નવનાથ / દત્તાત્રેય" },
  "क्षेत्रपाल / भैरव": { en: "Kshetrapal / Bhairava", gu: "ક્ષેત્રપાળ / ભૈરવ" },
  "शीतला माता": { en: "Sheetala Mata", gu: "શીતળા માતા" },
  "चंडी / दुर्गा": { en: "Chandi / Durga", gu: "ચંડી / દુર્ગા" },
  "सूर्य": { en: "Surya", gu: "સૂર્ય" },
  "कुबेर / दत्तात्रेय": { en: "Kubera / Dattatreya", gu: "કુબેર / દત્તાત્રેય" },
  "शिव / गोरखनाथ": { en: "Shiva / Gorakhnath", gu: "શિવ / ગોરખનાથ" },
  "कृष्ण": { en: "Krishna", gu: "કૃષ્ણ" },
  "हनुमान / भैरव": { en: "Hanuman / Bhairava", gu: "હનુમાન / ભૈરવ" },
  "गंगा माता / शिव": { en: "Ganga Mata / Shiva", gu: "ગંગા માતા / શિવ" },
  "हनुमान / दुर्गा": { en: "Hanuman / Durga", gu: "હનુમાન / દુર્ગા" },
  "नाथ परंपरा / गुरु": { en: "Nath Tradition / Guru", gu: "નાથ પરંપરા / ગુરુ" },
  "माँ काली": { en: "Maa Kali", gu: "મા કાળી" },
  "माँ काली / महाकाली": { en: "Maa Kali / Mahakali", gu: "મા કાળી / મહાકાળી" },
  "दत्तात्रेय": { en: "Dattatreya", gu: "દત્તાત્રેય" },
  "चन्द्र": { en: "Chandra", gu: "ચંદ્ર" },
  "शनि": { en: "Shani", gu: "શનિ" },
  "महादेव": { en: "Mahadev", gu: "મહાદેવ" },
  "कुबेर": { en: "Kubera", gu: "કુબેર" },
  "नवग्रह": { en: "Navagraha", gu: "નવગ્રહ" },
  "क्षेत्रपाल": { en: "Kshetrapal", gu: "ક્ષેત્રપાળ" },
  "कुबेर / भैरव": { en: "Kubera / Bhairava", gu: "કુબેર / ભૈરવ" },
  "नवग्रह / शनि": { en: "Navagraha / Shani", gu: "નવગ્રહ / શનિ" },
  "चंडी": { en: "Chandi", gu: "ચંડી" },
  "गणेश": { en: "Ganesha", gu: "ગણેશ" },
  "बगलामुखी": { en: "Baglamukhi", gu: "બગલામુખી" },
  "कुबेर / लक्ष्मी": { en: "Kubera / Lakshmi", gu: "કુબેર / લક્ષ્મી" },
  "नवनाथ / गुरु गोरखनाथ": { en: "Navnath / Guru Gorakhnath", gu: "નવનાથ / ગુરુ ગોરખનાથ" },
};

function trSabarDeity(d: string, cLang: string): string {
  if (cLang === "en") return SABAR_DEITY_LABELS[d]?.en || trVedic(d, "en");
  if (cLang === "gu") return SABAR_DEITY_LABELS[d]?.gu || trVedic(d, "gu");
  return d;
}

export function SabarMantraView() {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const [query, setQuery] = useState("");
  const [deity, setDeity] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const needle = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      SABAR_MANTRAS.filter((item) => {
        if (deity !== "all" && item.deity !== deity) return false;
        if (!needle) return true;
        return `${item.title} ${item.use} ${item.mantra} ${item.deity} ${item.planet}`.toLowerCase().includes(needle);
      }),
    [deity, needle],
  );
  const selected = SABAR_MANTRAS.find((item) => item.id === selectedId) ?? null;
  useTabMenu(() => {
    if (selectedId == null) return false;
    setSelectedId(null);
    return true;
  });

  return (
    <div className="flex-1 min-h-0 h-full w-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-3 pt-1 pb-1 flex flex-col gap-1.5">
        {selected ? (
          <button type="button" className="text-left text-sm font-semibold truncate" onClick={() => setSelectedId(null)}>
            ← {selected.id}. {selected.title}
          </button>
        ) : (
          <>
            <div className="text-[13px] font-bold" style={{ color: "#4A0E0E" }}>
              {L(`शाबर मंत्र · ${list.length}`, `Shabar Mantras · ${list.length}`, `શાબર મંત્ર · ${list.length}`)}
            </div>
            <p className="text-[11px] leading-snug font-semibold" style={{ color: "#4A2511" }}>
              {L(
                SABAR_NOTE,
                "Please practice with discretion and faith. Shakti Panchang provides these traditional Shabar mantras for informational convenience.",
                "સાધક પોતાના વિવેક અને શ્રદ્ધા અનુસાર ઉપયોગ કરે. શક્તિ પંચાંગે આ મંત્રો આપની સુવિધા માટે ઉપલબ્ધ કરાવ્યા છે."
              )}
            </p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={L("मंत्र, देवता या काम खोजें", "Search mantra, deity or purpose...", "મંત્ર, દેવતા અથવા હેતુ શોધો...")}
              className="w-full rounded-xl border px-3 py-1.5 text-sm bg-white"
              style={{ color: "#1F1006", borderColor: "#C89D66" }}
            />
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <Chip active={deity === "all"} onClick={() => setDeity("all")}>
                {L("सभी", "All", "બધા")}
              </Chip>
              {SABAR_DEITIES.map((item) => (
                <Chip key={item} active={deity === item} onClick={() => setDeity(item)}>
                  {trSabarDeity(item, cLang)}
                </Chip>
              ))}
            </div>
          </>
        )}
      </div>
      <div
        className="flex-1 min-h-0 h-full w-full overflow-y-auto overscroll-y-contain px-2 pb-28 flex flex-col gap-1.5"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
        {selected ? <Detail item={selected} /> : list.map((item) => (
          <button
            key={item.id}
            type="button"
            className="bx-verse text-left w-full cursor-pointer"
            style={{ touchAction: "pan-y" }}
            onClick={() => setSelectedId(item.id)}
          >
            <div className="bx-kicker">{trSabarDeity(item.deity, cLang)}</div>
            <strong className="text-sm font-bold" style={{ color: "#241004" }}>{item.title}</strong>
            <span className="text-xs font-semibold" style={{ color: "#4A2511" }}>{item.use} · {item.day}</span>
          </button>
        ))}
        {!selected && list.length === 0 ? (
          <article className="bx-verse">
            {L("कोई साबर मंत्र इस खोज में नहीं मिला।", "No Shabar mantras matched your search.", "આ શોધમાં કોઈ શાબર મંત્ર મળ્યો નથી.")}
          </article>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ item }: { item: SabarMantra }) {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);
  const handleShare = () => {
    const text = `॥ ${item.title} ॥\n(${trSabarDeity(item.deity, cLang)})\n\n${L("मंत्र:", "Mantra:", "મંત્ર:")}\n${item.mantra}\n\n${L("उद्देश्य:", "Purpose:", "હેતુ:")} ${item.use}\n${L("दिन:", "Day:", "વાર:")} ${item.day}\n${L("समय:", "Time:", "સમય:")} ${item.time}\n${L("दिशा:", "Direction:", "દિશા:")} ${item.direction}\n${L("माला:", "Mala:", "માળા:")} ${item.mala}\n${L("जप:", "Japa:", "જપ:")} ${item.japa}\n${L("संकल्प:", "Sankalpa:", "સંકલ્પ:")} ${item.days}\n\n${L("तैयारी:", "Preparation:", "તૈયારી:")} ${item.preparation}\n${L("पूजा:", "Worship:", "પૂજા:")} ${item.worship}\n${L("जप विधि:", "Japa Vidhi:", "જપ વિધિ:")} ${item.japaProcess}\n\n${item.caution}\n\n_${L("शक्ति पंचांग", "Shakti Panchang", "શક્તિ પંચાંગ")}_`;
    shareTextContent({ title: item.title, text });
  };

  return (
    <>
      <div className="flex justify-end gap-2 px-1 pt-1">
        <button
          type="button"
          onClick={() =>
            setPosterData({
              title: item.title,
              reference: `${trSabarDeity(item.deity, cLang)} · ${item.day}`,
              sanskrit: item.mantra,
              meaning: `${L("उद्देश्य:", "Purpose:", "હેતુ:")} ${item.use}\n${L("जप विधि:", "Japa:", "જપ વિધિ:")} ${item.japa} (${item.mala})`,
              accentTag: L("🔱 सिद्ध शाबर मंत्र", "🔱 Siddha Shabar Mantra", "🔱 સિદ્ધ શાબર મંત્ર"),
            })
          }
          style={{ backgroundColor: "#6E1409", color: "#FFFFFF" }}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <span>{L("📸 स्टेटस कार्ड", "📸 Status Card", "📸 સ્ટેટસ કાર્ડ")}</span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-[#25D366] text-white rounded-lg shadow-xs cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{L("व्हाट्सएप शेयर", "WhatsApp Share", "WhatsApp શેર")}</span>
        </button>
      </div>

      <article className="bx-verse">
        <div className="bx-kicker">{trSabarDeity(item.deity, cLang)} · {L("पूरा मंत्र", "Full Mantra", "સંપૂર્ણ મંત્ર")}</div>
        <p className="font-granth font-bold whitespace-pre-wrap text-[16px] leading-relaxed" style={{ color: "#4A0E0E" }}>{item.mantra}</p>
        <p className="text-sm font-semibold" style={{ color: "#241004" }}>{item.use}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("दिन · समय · माला", "Day · Time · Mala", "વાર · સમય · માળા")}</div>
        <p className="text-sm">{item.day}</p>
        <p className="text-sm">{item.time} · {item.direction}</p>
        <p className="text-sm">{item.mala}</p>
        <p className="text-xs opacity-80">{item.planet}</p>
      </article>
      <article className="bx-verse">
        <div className="bx-kicker">{L("संख्या · संकल्प", "Count · Sankalpa", "સંખ્યા · સંકલ્પ")}</div>
        <p className="text-sm">{item.japa}</p>
        <p className="text-sm">{item.days}</p>
      </article>
      {item.preparation ? (
        <article className="bx-verse">
          <div className="bx-kicker">{L("तैयारी", "Preparation", "તૈયારી")}</div>
          <p className="text-sm">{item.preparation}</p>
        </article>
      ) : null}
      {item.worship ? (
        <article className="bx-verse">
          <div className="bx-kicker">{L("पूजा", "Worship", "પૂજા")}</div>
          <p className="text-sm">{item.worship}</p>
        </article>
      ) : null}
      {item.japaProcess ? (
        <article className="bx-verse">
          <div className="bx-kicker">{L("जप", "Japa Process", "જપ વિધિ")}</div>
          <p className="text-sm">{item.japaProcess}</p>
        </article>
      ) : null}
      <article className="bx-verse">
        <div className="bx-kicker">{L("सूचना", "Note", "સૂચના")}</div>
        <p className="text-xs leading-relaxed font-semibold" style={{ color: "#3A1807" }}>{item.caution}</p>
      </article>
      <ShlokaPosterModal
        isOpen={posterData !== null}
        onClose={() => setPosterData(null)}
        data={posterData}
      />
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer"
      style={{ background: active ? "#6E1409" : "#F4E8D1", color: active ? "#FFFFFF" : "#3a2414" }}
    >
      {children}
    </button>
  );
}
