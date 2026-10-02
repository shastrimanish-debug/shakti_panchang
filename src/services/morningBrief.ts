import { calculateVedicPanchang } from "./astronomy";
import { getInauspiciousWindows } from "./choghadiya";
import { scheduleMorningQueue } from "../lib/device";

const RASHI_UPAY: Record<string, string> = {
  मेष: "हनुमान को सिन्दूर और ॐ क्रां क्रीं क्रौं सः भौमाय नमः।",
  वृषभ: "श्वेत वस्त्र और माँ लक्ष्मी को खीर।",
  मिथुन: "गणेश जी को २१ दूर्वा और ॐ गं गणपतये नमः।",
  कर्क: "चाँदी या दूध, ॐ सोमाय नमः।",
  सिंह: "सूर्य को जल और ॐ घृणिः सूर्याय नमः।",
  कन्या: "हरी वस्तु दान और गणेश स्मरण।",
  तुला: "शुक्रवार को सफेद मिठाई और ॐ शुक्राय नमः।",
  वृश्चिक: "हनुमान चालीसा और लाल मसूर दान।",
  धनु: "पीला चना दान और गुरु मंत्र।",
  मकर: "शनि को तेल का दीप और तिल।",
  कुंभ: "काले तिल का दान और शनि मंत्र।",
  मीन: "पीले फूल और ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः।",
};

function clock(d: Date): string {
  return d.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function scheduleMorningBriefs(
  latitude: number,
  longitude: number,
  timezoneHours: number | undefined,
  placeName: string,
  personName?: string,
  lagnaRashi?: string,
) {
  if (typeof window === "undefined") return;
  const stamp = `${placeName}|${personName || ""}|${lagnaRashi || ""}|${new Date().toDateString()}`;
  try {
    if (localStorage.getItem("sp_morning_brief_v3") === stamp) return;
  } catch {
    /* still schedule */
  }

  const tz = timezoneHours ?? 5.5;
  const rashiName = Object.keys(RASHI_UPAY).find((name) => lagnaRashi?.startsWith(name));
  const items: { id: string; title: string; body: string; at: number }[] = [];
  for (let i = 0; i < 21; i++) {
    const morning = new Date();
    morning.setDate(morning.getDate() + i);
    morning.setHours(6, 0, 0, 0);
    if (morning.getTime() < Date.now() + 60_000) continue;
    const panchang = calculateVedicPanchang(morning, latitude, longitude, tz);
    const rahu = getInauspiciousWindows(panchang.solar, morning.getDay()).find((w) => w.title.includes("राहु"));
    const rahuStr = rahu ? `${clock(rahu.start)} से ${clock(rahu.end)}` : "ऐप में देखें";
    const who = personName ? `${personName}, ` : "";
    const upay = rashiName
      ? `${rashiName} लग्न का उपाय: ${RASHI_UPAY[rashiName]}`
      : `${panchang.lunarRashi} चंद्र राशि का उपाय: ${RASHI_UPAY[panchang.lunarRashi] || "इष्टदेव का स्मरण।"}`;
    items.push({
      id: `brief-${morning.getFullYear()}-${morning.getMonth() + 1}-${morning.getDate()}`,
      title: `${who}आज ${panchang.tithi}`,
      body: `आज ${panchang.tithi}, राहुकाल ${rahuStr}। ${upay}`,
      at: morning.getTime(),
    });
  }
  void scheduleMorningQueue(items).then((ok) => {
    if (!ok) return;
    try {
      localStorage.setItem("sp_morning_brief_v3", stamp);
    } catch {
      /* ignore */
    }
  });
}
