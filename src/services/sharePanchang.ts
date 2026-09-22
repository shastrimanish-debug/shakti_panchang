import { VedicPanchangData, SavedLocation } from '../types';
import { DISHASHOOL_MAP, DISHASHOOL_REMEDIES } from './disha';
import { getAuspiciousWindows, getInauspiciousWindows } from './choghadiya';

export function formatTimeHi(d: Date): string {
  return d.toLocaleTimeString('hi-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function generatePanchangShareText(panchang: VedicPanchangData, location: SavedLocation): string {
  const weekday = panchang.date.getDay();
  const shool = DISHASHOOL_MAP[weekday] || 'अनिश्चित';
  const remedy = DISHASHOOL_REMEDIES[weekday] || 'इष्टदेव स्मरण कर निकलें';

  const dateStr = panchang.date.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const sunrise = formatTimeHi(panchang.solar.sunrise);
  const sunset = formatTimeHi(panchang.solar.sunset);

  const auspicious = getAuspiciousWindows(panchang.solar);
  const inauspicious = getInauspiciousWindows(panchang.solar, weekday);

  const abhijit = auspicious.find((w) => w.title.includes('अभिजित'));
  const abhijitStr = abhijit ? `${formatTimeHi(abhijit.start)} - ${formatTimeHi(abhijit.end)}` : 'उपलब्ध नहीं';

  const rahu = inauspicious.find((w) => w.title.includes('राहु'));
  const rahuStr = rahu ? `${formatTimeHi(rahu.start)} - ${formatTimeHi(rahu.end)}` : 'उपलब्ध नहीं';

  const yama = inauspicious.find((w) => w.title.includes('यमगण्ड'));
  const yamaStr = yama ? `${formatTimeHi(yama.start)} - ${formatTimeHi(yama.end)}` : 'उपलब्ध नहीं';

  const gulik = inauspicious.find((w) => w.title.includes('गुलिक'));
  const gulikStr = gulik ? `${formatTimeHi(gulik.start)} - ${formatTimeHi(gulik.end)}` : 'उपलब्ध नहीं';

  const text = `🚩 ॐ श्री गणेशाय नमः 🚩
*सनातन शक्ति वैदिक पंचांग*
📅 दिनांक: ${dateStr} (${panchang.weekday})
📍 स्थान: ${location.name}
══════════════════════════
☀️ सूर्योदय: ${sunrise} | सूर्यास्त: ${sunset}
✨ संवत: ${panchang.samvat} | शक: ${panchang.sakaSamvat}
🌙 मास: ${panchang.masa} मास (${panchang.paksha} पक्ष)
♈ सूर्य राशि: ${panchang.solarRashi} | चन्द्र राशि: ${panchang.lunarRashi}

📜 *पञ्चाङ्ग के ५ मुख्य अंग:*
🔹 तिथि: ${panchang.tithi} (${panchang.paksha})
🔹 वार: ${panchang.weekday}
🔹 नक्षत्र: ${panchang.nakshatra} (चरण: ${panchang.pada})
🔹 योग: ${panchang.yoga}
🔹 करण: ${panchang.karana}

⏱️ *शुभ एवं त्याज्य समय:*
✅ अभिजित मुहूर्त: ${abhijitStr}
❌ राहु काल: ${rahuStr}
❌ यमगण्ड काल: ${yamaStr}
❌ गुलिक काल: ${gulikStr}
⚠️ दिशाशूल: ${shool} दिशा
💡 परिहार: ${remedy}

🕉️ *दैनिक वैदिक मन्त्र:*
"तिथिर्वारश्च नक्षत्रं योगः करणमेव च।
पञ्चाङ्गस्य फलं श्रुत्वा गङ्गास्नानफलं लभेत्॥"

📲 संपूर्ण कुण्डली, चौघड़िया व 200 वर्ष पर्व खोजें शक्ति पंचांग पर:
https://shaktipanchang.app`;

  return text;
}

export async function sharePanchang(panchang: VedicPanchangData, location: SavedLocation): Promise<'shared' | 'whatsapp' | 'copied'> {
  const text = generatePanchangShareText(panchang, location);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `आज का शक्ति वैदिक पंचांग - ${panchang.weekday}`,
        text: text,
      });
      return 'shared';
    } catch {
      // If user dismissed share or platform share failed, fall through to WhatsApp
    }
  }

  // Fallback to WhatsApp Web/App
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
  return 'whatsapp';
}

export function copyPanchangToClipboard(panchang: VedicPanchangData, location: SavedLocation): boolean {
  const text = generatePanchangShareText(panchang, location);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
