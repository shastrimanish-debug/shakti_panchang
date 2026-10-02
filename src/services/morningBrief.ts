import { calculateVedicPanchang } from "./astronomy";
import { getInauspiciousWindows } from "./choghadiya";
import { scheduleNativeReminder } from "../lib/device";

const WEEKDAY_UPAY = [
  "सूर्य को जल और ॐ घृणिः सूर्याय नमः।",
  "शिव का जलाभिषेक और ॐ नमः शिवाय।",
  "हनुमान जी को सिन्दूर और बजरंग बाण।",
  "गणेश जी को दूर्वा और ॐ गं गणपतये नमः।",
  "गुरु या पीपल पर जल, ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः।",
  "लक्ष्मी को खीर और शुक्र बीज मंत्र।",
  "शनि को तेल का दीप और तिल दान।",
];

function clock(d: Date): string {
  return d.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function scheduleMorningBriefs(
  latitude: number,
  longitude: number,
  timezoneHours: number | undefined,
  placeName: string,
  personName?: string,
) {
  if (typeof window === "undefined") return;
  const stamp = `${placeName}|${personName || ""}|${new Date().toDateString()}`;
  try {
    if (localStorage.getItem("sp_morning_brief_v1") === stamp) return;
  } catch {
    /* still schedule */
  }

  const tz = timezoneHours ?? 5.5;
  for (let i = 0; i < 14; i++) {
    const morning = new Date();
    morning.setDate(morning.getDate() + i);
    morning.setHours(6, 0, 0, 0);
    if (morning.getTime() < Date.now() + 60_000) continue;
    const panchang = calculateVedicPanchang(morning, latitude, longitude, tz);
    const rahu = getInauspiciousWindows(panchang.solar, morning.getDay()).find((w) => w.title.includes("राहु"));
    const rahuStr = rahu ? `${clock(rahu.start)}–${clock(rahu.end)}` : "देखें ऐप में";
    const who = personName ? `${personName}, ` : "";
    const title = `${who}आज का शक्ति पंचांग`;
    const body = `${panchang.weekday}, ${panchang.tithi} (${panchang.paksha}), नक्षत्र ${panchang.nakshatra}। राहुकाल ${rahuStr}। उपाय: ${WEEKDAY_UPAY[morning.getDay()]}`;
    const id = `brief-${morning.getFullYear()}-${morning.getMonth() + 1}-${morning.getDate()}`;
    scheduleNativeReminder(id, title, body, morning.getTime());
  }

  try {
    localStorage.setItem("sp_morning_brief_v1", stamp);
  } catch {
    /* ignore */
  }
}
