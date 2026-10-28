import React, { useMemo, useState } from "react";
import {
  RAVAN_SANHITA_CATEGORIES,
  RAVAN_SANHITA_DATA,
  type RavanSanhitaUpayItem,
} from "../data/ravanSanhitaData";
import { shareTextContent } from "../lib/shareHelper";
import { speakUma, stopUmaSpeech } from "../lib/umaSpeech";
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

export function RavanSanhitaUpayView({
  onAskUma,
}: {
  onAskUma?: (query: string) => void;
}) {
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
      className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-2xl"
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
                <span>🔱 {RAVAN_SANHITA_DATA.category}</span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: "#F4E8D1", color: "#4A0E0E" }}
                >
                  {list.length} / {RAVAN_SANHITA_DATA.upay_list.length} उपाय
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
                १०८ विस्तृत विधान (v{RAVAN_SANHITA_DATA.module_version})
              </span>
            </div>

            <p
              className="text-[11px] leading-snug font-semibold"
              style={{ color: "#4A2511" }}
            >
              {RAVAN_SANHITA_DATA.content_note}
            </p>

            <div className="relative">
              <Search
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#6E1409" }}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="१०८ उपायों में खोजें (जैसे: तिजोरी, व्यापार, प्रमोशन, कर्ज, विवाह, शनि, रोग, संतान, मकान)..."
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
                  {item}
                </Chip>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Uniform Remedy Cards List or Full Step-by-Step Detail View */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-2 py-2 pb-16 flex flex-col gap-1.5">
        {selected ? (
          <Detail item={selected} onAskUma={onAskUma} />
        ) : (
          list.map((item) => (
            <button
              key={item.id}
              type="button"
              className="bx-verse text-left w-full cursor-pointer transition hover:opacity-95"
              onClick={() => setSelectedId(item.id)}
            >
              <div className="bx-kicker flex flex-wrap items-center justify-between gap-1.5">
                <span>
                  उपाय #{item.id} ({item.code}) · {item.tag}
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
                आराध्य व ग्रह: {item.planetOrDeity}
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
                  सामग्री: {item.samagri.join(" • ")}
                </span>
                <span
                  className="text-[11px] font-bold shrink-0 px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: "#F4E8D1", color: "#4A0E0E" }}
                >
                  संपूर्ण विधि पढ़ें →
                </span>
              </div>
            </button>
          ))
        )}

        {!selected && list.length === 0 ? (
          <article className="bx-verse text-center py-6">
            <p className="text-sm font-bold" style={{ color: "#4A0E0E" }}>
              इस खोज में कोई उपाय नहीं मिला।
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
  const [posterData, setPosterData] = useState<ShlokaPosterData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildShareText = () =>
    `॥ रावण संहिता सिद्ध महा-उपाय #${item.id} (${item.code}) ॥\n\n` +
    `🔱 ${item.title}\n` +
    `• श्रेणी: ${item.tag}\n` +
    `• आराध्य देवता व ग्रह: ${item.planetOrDeity}\n` +
    `• शुभ वार व सटीक समय: ${item.best_time}\n` +
    `• दिशा, वस्त्र व आसन: ${item.directionAndAsana}\n\n` +
    `• आवश्यक पूजन सामग्री:\n  - ${item.samagri.join("\n  - ")}\n\n` +
    `• संकल्प एवं सिद्ध मंत्र:\n${item.sankalpAndMantra}\n\n` +
    `• संपूर्ण चरणबद्ध प्रयोग विधि:\n${item.vidhi}\n\n` +
    `• अवधि एवं सात्विक नियम:\n${item.durationAndRules}\n\n` +
    `• परंपरागत शास्त्रीय लाभ:\n${item.labh}\n\n` +
    `• सावधानी एवं व्यावहारिक सूत्र:\n${item.safety_note}\n\n` +
    `_सनातन शक्ति पंचांग_`;

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
    const speechText =
      `रावण संहिता उपाय संख्या ${item.id}। ${item.title}। ` +
      `आराध्य देवता एवं ग्रह: ${item.planetOrDeity}। ` +
      `शुभ समय: ${item.best_time}। ` +
      `दिशा एवं आसन: ${item.directionAndAsana}। ` +
      `आवश्यक सामग्री: ${item.samagri.join(", ")}। ` +
      `संकल्प एवं मंत्र: ${item.sankalpAndMantra}। ` +
      `विस्तृत विधि: ${item.vidhi}। ` +
      `अवधि एवं नियम: ${item.durationAndRules}। ` +
      `लाभ: ${item.labh}। ` +
      `सावधानी: ${item.safety_note}`;
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
          <span>{isSpeaking ? "वाणी रोकें" : "संपूर्ण विधि सुनें"}</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setPosterData({
              title: item.title,
              reference: `रावण संहिता उपाय #${item.id} (${item.code}) · ${item.best_time}`,
              sanskrit: item.sankalpAndMantra,
              meaning: `सामग्री: ${item.samagri.join(" • ")}\n\nलाभ: ${item.labh}`,
              accentTag: "🔱 रावण संहिता १०८ महा-उपाय",
            })
          }
          style={{ backgroundColor: "#6E1409", color: "#FFFFFF" }}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <span>📸 स्टेटस कार्ड</span>
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
          <span>{copied ? "कॉपी हुआ" : "कॉपी"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          style={{ backgroundColor: "#6E1409", color: "#FFFFFF" }}
          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>शेयर</span>
        </button>

        {onAskUma && (
          <button
            type="button"
            onClick={() =>
              onAskUma(
                `रावण संहिता का उपाय #${item.id} "${item.title}" मेरे लग्न और राशि के अनुसार करने का सबसे शुभ मुहूर्त और व्यक्तिगत विधान क्या है?`
              )
            }
            style={{ backgroundColor: "#4A0E0E", color: "#FAF2E4" }}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>उमा से पूछें</span>
          </button>
        )}
      </div>

      {/* १. उपाय शीर्षक, आराध्य देवता, शुभ समय व दिशा-आसन */}
      <article className="bx-verse">
        <div className="bx-kicker">
          उपाय संख्या #{item.id} ({item.code}) · {item.tag}
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
              <strong>आराध्य देवता एवं संबंधित ग्रह:</strong> {item.planetOrDeity}
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#6E1409" }} />
            <span>
              <strong>शुभ वार, तिथि एवं सटीक समय:</strong> {item.best_time}
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <Compass className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#6E1409" }} />
            <span>
              <strong>दिशा, वस्त्र एवं आसन विधान:</strong> {item.directionAndAsana}
            </span>
          </p>
        </div>
      </article>

      {/* २. आवश्यक पूजन सामग्री (सटीक मात्रा सहित) */}
      <article className="bx-verse">
        <div className="bx-kicker">आवश्यक पूजन सामग्री (सटीक मात्रा सहित)</div>
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
        <div className="bx-kicker">संकल्प, सिद्ध मंत्र, माला एवं जप संख्या</div>
        <p
          className="font-granth font-bold text-[15px] sm:text-base leading-relaxed"
          style={{ color: "#4A0E0E" }}
        >
          {item.sankalpAndMantra}
        </p>
      </article>

      {/* ४. संपूर्ण ३-चरणीय विस्तृत प्रयोग विधि (पूर्व तैयारी -> पूजन -> स्थापना/विसर्जन) */}
      <article className="bx-verse">
        <div className="bx-kicker">
          संपूर्ण चरणबद्ध प्रयोग विधि (तैयारी, अभिमंत्रण एवं विसर्जन विधान)
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
        <div className="bx-kicker">अवधि एवं आवश्यक सात्विक नियम</div>
        <p
          className="text-sm leading-relaxed font-semibold"
          style={{ color: "#241004" }}
        >
          {item.durationAndRules}
        </p>
      </article>

      {/* ६. परंपरागत मान्यता एवं शास्त्रीय फल */}
      <article className="bx-verse">
        <div className="bx-kicker">परंपरागत मान्यता एवं शास्त्रीय फल</div>
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
          <span>सावधानी एवं व्यावहारिक जीवन सूत्र</span>
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
