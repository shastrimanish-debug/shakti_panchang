import { calculateVedicPanchang } from "./astronomy";
import { getInauspiciousWindows } from "./choghadiya";
import { scheduleNativeReminder } from "../lib/device";
import { getSyncedNow } from "../hooks/useUserDateTime";
import { formatPlaceTime, timezoneHoursFor } from "./engine/time";

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

/**
 * Schedule 7-day Morning Brief Notifications at 5:00 AM (सुबह ५:०० बजे)
 * Synchronized with the user's location timezone and currentDate from useUserDateTime.
 */
export function scheduleMorningBriefs(
  latitude: number,
  longitude: number,
  timezoneHours: number | undefined,
  placeName: string,
  personName?: string,
  lagnaRashi?: string,
  currentDate?: Date,
) {
  if (typeof window === "undefined") return;

  const tz = timezoneHours ?? timezoneHoursFor(latitude, longitude) ?? 5.5;

  // Authoritative base instant synchronized with useUserDateTime
  const baseInstant =
    currentDate instanceof Date && !Number.isNaN(currentDate.getTime())
      ? currentDate
      : getSyncedNow();

  // Shift to the user's location civil date to avoid any host device timezone offsets
  const locShifted = new Date(baseInstant.getTime() + tz * 3600000);
  const baseLocYear = locShifted.getUTCFullYear();
  const baseLocMonth = locShifted.getUTCMonth();
  const baseLocDay = locShifted.getUTCDate();

  const stamp = `${placeName}|${personName || ""}|${lagnaRashi || ""}|${baseLocYear}-${baseLocMonth + 1}-${baseLocDay}`;
  try {
    if (localStorage.getItem("sp_morning_brief_v5") === stamp) return;
  } catch {
    /* continue scheduling */
  }

  const rashiName = Object.keys(RASHI_UPAY).find((name) => lagnaRashi?.startsWith(name));

  window.setTimeout(() => {
    try {
      const nowMs = getSyncedNow().getTime();

      for (let i = 0; i < 7; i++) {
        // Precise calendar date at the location
        const dayAnchor = new Date(Date.UTC(baseLocYear, baseLocMonth, baseLocDay + i, 12, 0, 0));
        const locYear = dayAnchor.getUTCFullYear();
        const locMonth = dayAnchor.getUTCMonth();
        const locDay = dayAnchor.getUTCDate();
        const locWeekday = dayAnchor.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

        // Subah 5:00 AM (सुबह ५:०० बजे) trigger time at the target location in UTC epoch milliseconds
        const targetTriggerUtcMs = Date.UTC(locYear, locMonth, locDay, 5, 0, 0, 0) - tz * 3600000;

        // If 5:00 AM for this calendar date has already passed, skip to tomorrow
        if (targetTriggerUtcMs <= nowMs + 60_000) {
          continue;
        }

        // Calculate accurate Vedic Panchang for this exact location calendar day
        const calcDate = new Date(locYear, locMonth, locDay, 12, 0, 0);
        const panchang = calculateVedicPanchang(calcDate, latitude, longitude, tz);

        const dayInfo = DAY_DEITY_UPAY[locWeekday] || {
          day: panchang.weekday,
          deity: "इष्टदेव",
          upay: "इष्टदेव का स्मरण व नित्य प्रार्थना करें।",
        };

        const rahu = getInauspiciousWindows(panchang.solar, locWeekday).find((w) => w.title.includes("राहु"));
        const rahuStr = rahu
          ? `${formatPlaceTime(rahu.start, latitude, longitude, tz)} से ${formatPlaceTime(rahu.end, latitude, longitude, tz)}`
          : "ऐप में देखें";

        const who = personName ? `${personName}, ` : "";
        const rashiUpayText = rashiName
          ? `${rashiName} लग्न उपाय: ${RASHI_UPAY[rashiName]}`
          : `${panchang.lunarRashi} राशि उपाय: ${RASHI_UPAY[panchang.lunarRashi] || "इष्टदेव का स्मरण।"}`;

        // Distinct title with the verified weekday name and tithi
        const title = `${who}आज ${dayInfo.day} • ${panchang.tithi}`;
        const body = `प्रातः ५:०० बजे शुभ स्मरण • आज ${dayInfo.day} (${panchang.tithi})। राहुकाल: ${rahuStr}। ${dayInfo.day} विशेष: ${dayInfo.upay} • ${rashiUpayText}`;
        const id = `brief-v5-${locYear}-${locMonth + 1}-${locDay}`;

        scheduleNativeReminder(id, title, body, targetTriggerUtcMs);
      }

      localStorage.setItem("sp_morning_brief_v5", stamp);
    } catch {
      /* ignore */
    }
  }, 2500);
}
