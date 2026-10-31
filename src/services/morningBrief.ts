import { calculateVedicPanchang } from "./astronomy";
import { getInauspiciousWindows } from "./choghadiya";
import { scheduleNativeReminder } from "../lib/device";

const RASHI_UPAY: Record<string, string> = {
  मेष: "हनुमान जी का स्मरण व ॐ क्रां क्रीं क्रौं सः भौमाय नमः।",
  वृषभ: "माँ लक्ष्मी का ध्यान, श्वेत पुष्प व ॐ शुं शुक्राय नमः।",
  मिथुन: "गणेश जी को दूर्वा व ॐ बुं बुधाय नमः।",
  कर्क: "शिवलिंग पर जल अर्पण व ॐ सों सोमाय नमः।",
  सिंह: "सूर्य देव को तांबे के लोटे से अर्घ्य व ॐ घृणिः सूर्याय नमः।",
  कन्या: "हरी वस्तु दान, तुलसी सेवा व ॐ बुं बुधाय नमः।",
  तुला: "इत्र या श्वेत मिष्ठान्न अर्पण व ॐ शुं शुक्राय नमः।",
  वृश्चिक: "हनुमान चालीसा पाठ व ॐ क्रां क्रीं क्रौं सः भौमाय नमः।",
  धनु: "पीला तिलक, गुरु स्मरण व ॐ बृं बृहस्पतये नमः।",
  मकर: "शनि स्मरण, तिल व ॐ शं शनैश्चराय नमः।",
  कुंभ: "काले तिल या सरसों तेल का दीप व ॐ शं शनैश्चराय नमः।",
  मीन: "भगवान विष्णु का ध्यान व ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः।",
};

/**
 * Authentic Vedic Weekday (वार) Deity & Daily Remedy
 */
const DAY_DEITY_UPAY: Record<number, { day: string; deity: string; upay: string }> = {
  0: {
    day: "रविवार",
    deity: "भगवान सूर्य देव",
    upay: "सूर्य देव को तांबे के पात्र से अर्घ्य दें एवं ॐ सूर्याय नमः का जप करें।",
  },
  1: {
    day: "सोमवार",
    deity: "देवाधिदेव महादेव",
    upay: "शिवलिंग पर जल या कच्चा दूध अर्पित कर ॐ नमः शिवाय का जप करें।",
  },
  2: {
    day: "मंगलवार",
    deity: "पवनपुत्र हनुमान जी",
    upay: "हनुमान चालीसा का पाठ करें व सिंदूर/गुड़-चना अर्पित करें।",
  },
  3: {
    day: "बुधवार",
    deity: "विघ्नहर्ता गणेश जी",
    upay: "गणेश जी को दूर्वा चढ़ाएं एवं ॐ गं गणपतये नमः का जप करें।",
  },
  4: {
    day: "गुरुवार",
    deity: "श्री हरि विष्णु व देवगुरु",
    upay: "पीला चंदन/तिलक लगाएं एवं ॐ नमो भगवते वासुदेवाय का जप करें।",
  },
  5: {
    day: "शुक्रवार",
    deity: "माँ महालक्ष्मी",
    upay: "माँ लक्ष्मी का ध्यान करें, मिश्री या श्वेत मिठाई अर्पित कर ॐ श्रीं नमः जपें।",
  },
  6: {
    day: "शनिवार",
    deity: "न्यायदेव श्री शनि देव व हनुमान जी",
    upay: "सरसों के तेल का दीपक जलाएं, काले तिल अर्पित करें व ॐ शं शनैश्चराय नमः जपें।",
  },
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
    if (localStorage.getItem("sp_morning_brief_v4") === stamp) return;
  } catch {
    /* still schedule */
  }

  const tz = timezoneHours ?? 5.5;
  const rashiName = Object.keys(RASHI_UPAY).find((name) => lagnaRashi?.startsWith(name));

  window.setTimeout(() => {
    try {
      for (let i = 0; i < 7; i++) {
        const morning = new Date();
        morning.setDate(morning.getDate() + i);
        // Schedule at 7:00 AM (guaranteed post-sunrise across entire India all year)
        morning.setHours(7, 0, 0, 0);
        if (morning.getTime() < Date.now() + 60_000) continue;

        const panchang = calculateVedicPanchang(morning, latitude, longitude, tz);
        const weekdayNum = morning.getDay();
        const dayInfo = DAY_DEITY_UPAY[weekdayNum] || {
          day: panchang.weekday,
          deity: "इष्टदेव",
          upay: "इष्टदेव का स्मरण व नित्य प्रार्थना करें।",
        };

        const rahu = getInauspiciousWindows(panchang.solar, weekdayNum).find((w) => w.title.includes("राहु"));
        const rahuStr = rahu ? `${clock(rahu.start)} से ${clock(rahu.end)}` : "ऐप में देखें";
        const who = personName ? `${personName}, ` : "";
        const rashiUpayText = rashiName
          ? `${rashiName} लग्न उपाय: ${RASHI_UPAY[rashiName]}`
          : `${panchang.lunarRashi} राशि उपाय: ${RASHI_UPAY[panchang.lunarRashi] || "इष्टदेव का स्मरण।"}`;

        // Distinct title with current weekday and tithi
        const title = `${who}आज ${dayInfo.day} • ${panchang.tithi}`;
        const body = `आज ${dayInfo.day} (${panchang.tithi})। राहुकाल: ${rahuStr}। ${dayInfo.day} विशेष: ${dayInfo.upay} • ${rashiUpayText}`;
        const id = `brief-v4-${morning.getFullYear()}-${morning.getMonth() + 1}-${morning.getDate()}`;
        scheduleNativeReminder(id, title, body, morning.getTime());
      }
      localStorage.setItem("sp_morning_brief_v4", stamp);
    } catch {
      /* ignore */
    }
  }, 3000);
}
