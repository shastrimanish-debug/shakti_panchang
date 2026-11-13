import { VedicPanchangData, SavedLocation } from '../types';
import { DISHASHOOL_MAP, DISHASHOOL_REMEDIES } from './disha';
import { getAuspiciousWindows, getInauspiciousWindows } from './choghadiya';
import { calculateSpecialYogas, calculatePanchakAndBhadra } from './horaPanchakYogas';
import i18n from '../i18n';
import { trVedic, trWeekday } from '../i18n/vedicTranslate';

function pickL<T>(lang: string, hi: T, en: T, gu: T): T {
  const l = (lang || 'hi').slice(0, 2).toLowerCase();
  if (l === 'en') return en;
  if (l === 'gu') return gu;
  return hi;
}

export function formatTimeHi(d: Date, lang?: string): string {
  const l = ((lang || i18n.language || 'hi') as string).slice(0, 2).toLowerCase();
  const locale = l === 'en' ? 'en-US' : l === 'gu' ? 'gu-IN' : 'hi-IN';
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function generatePanchangShareText(
  panchang: VedicPanchangData,
  location: SavedLocation,
  lang?: string
): string {
  const currentLang = ((lang || i18n.language || 'hi') as string).slice(0, 2).toLowerCase();
  const locale = currentLang === 'en' ? 'en-US' : currentLang === 'gu' ? 'gu-IN' : 'hi-IN';

  const weekday = panchang.date.getDay();
  const shool = trVedic(DISHASHOOL_MAP[weekday] || 'अनिश्चित', currentLang);
  const remedy = trVedic(DISHASHOOL_REMEDIES[weekday] || 'इष्टदेव स्मरण कर निकलें', currentLang);

  const dateStr = panchang.date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const sunrise = formatTimeHi(panchang.solar.sunrise, currentLang);
  const sunset = formatTimeHi(panchang.solar.sunset, currentLang);

  const auspicious = getAuspiciousWindows(panchang.solar);
  const inauspicious = getInauspiciousWindows(panchang.solar, weekday);

  const naLabel = pickL(currentLang, 'उपलब्ध नहीं', 'Not Available', 'ઉપલબ્ધ નથી');

  const abhijit = auspicious.find((w) => w.title.includes('अभिजित'));
  const abhijitStr = abhijit ? `${formatTimeHi(abhijit.start, currentLang)} - ${formatTimeHi(abhijit.end, currentLang)}` : naLabel;

  const rahu = inauspicious.find((w) => w.title.includes('राहु'));
  const rahuStr = rahu ? `${formatTimeHi(rahu.start, currentLang)} - ${formatTimeHi(rahu.end, currentLang)}` : naLabel;

  const yama = inauspicious.find((w) => w.title.includes('यमगण्ड'));
  const yamaStr = yama ? `${formatTimeHi(yama.start, currentLang)} - ${formatTimeHi(yama.end, currentLang)}` : naLabel;

  const gulik = inauspicious.find((w) => w.title.includes('गुलिक'));
  const gulikStr = gulik ? `${formatTimeHi(gulik.start, currentLang)} - ${formatTimeHi(gulik.end, currentLang)}` : naLabel;

  const specialYogas = calculateSpecialYogas(panchang);
  const { panchak, bhadra } = calculatePanchakAndBhadra(panchang);

  const yogaLines = specialYogas.length > 0
    ? `\n🌟 *${pickL(currentLang, 'विशिष्ट महायोग:', 'Special Auspicious Yogas:', 'વિશિષ્ટ મહાયોગ:')}*\n${specialYogas.map((y) => `✨ ${trVedic(y.name, currentLang)}: ${trVedic(y.description, currentLang)}`).join('\n')}\n`
    : '';

  const panchakLine = panchak.isActive
    ? `⚡ ${pickL(currentLang, 'पञ्चक', 'Panchak', 'પંચક')}: ${trVedic(panchang.nakshatra ? panchak.typeNameHindi : '', currentLang) || trVedic(panchak.typeNameHindi, currentLang)}`
    : pickL(currentLang, '⚡ पञ्चक: पञ्चक रहित (सामान्य)', '⚡ Panchak: Panchak-Free (Normal)', '⚡ પંચક: પંચક મુક્ત (સામાન્ય)');

  const bhadraNature = bhadra.nature === 'varjya'
    ? pickL(currentLang, 'वर्जित', 'Prohibited', 'વર્જિત')
    : pickL(currentLang, 'दोषमुक्त', 'Auspicious / Free of Dosha', 'દોષમુક્ત');

  const bhadraLine = bhadra.isActive
    ? `🛡️ ${pickL(currentLang, 'भद्रा', 'Bhadra', 'ભદ્રા')}: ${trVedic(bhadra.vas, currentLang)} (${bhadraNature})`
    : pickL(currentLang, '🛡️ भद्रा: भद्रा मुक्त', '🛡️ Bhadra: Bhadra-Free', '🛡️ ભદ્રા: ભદ્રા મુક્ત');

  const wDay = trWeekday(panchang.weekday, currentLang);
  const masa = trVedic(panchang.masa, currentLang);
  const paksha = trVedic(panchang.paksha, currentLang);
  const tithi = trVedic(panchang.tithi, currentLang);
  const nak = trVedic(panchang.nakshatra, currentLang);
  const yoga = trVedic(panchang.yoga, currentLang);
  const karana = trVedic(panchang.karana, currentLang);
  const solarR = trVedic(panchang.solarRashi, currentLang);
  const lunarR = trVedic(panchang.lunarRashi, currentLang);

  if (currentLang === 'en') {
    return `🚩 ॐ श्री गणेशाय नमः 🚩
*Shakti Sanatan Vedic Panchang*
📅 Date: ${dateStr} (${wDay})
📍 Location: ${location.name}
══════════════════════════
☀️ Sunrise: ${sunrise} | Sunset: ${sunset}
✨ Samvat: ${panchang.samvat} | Shaka: ${panchang.sakaSamvat}
🌙 Month: ${masa} (${paksha})
♈ Sun Sign: ${solarR} | Moon Sign: ${lunarR}

📜 *Five Limbs of Panchang:*
🔹 Tithi: ${tithi} (${paksha})
🔹 Weekday: ${wDay}
🔹 Nakshatra: ${nak} (Pada: ${panchang.pada})
🔹 Yoga: ${yoga}
🔹 Karana: ${karana}
${yogaLines}
🛡️ *Panchak & Bhadra:*
${panchakLine}
${bhadraLine}

⏱️ *Auspicious & Avoidable Timings:*
✅ Abhijit Muhurat: ${abhijitStr}
❌ Rahu Kaal: ${rahuStr}
❌ Yamaganda: ${yamaStr}
❌ Gulika Kaal: ${gulikStr}
⚠️ Dishashool: ${shool} Direction
💡 Remedy: ${remedy}

🕉️ *Daily Vedic Mantra:*
"तिथिर्वारश्च नक्षत्रं योगः करणमेव च।
पञ्चाङ्गस्य फलं श्रुत्वा गङ्गास्नानफलं लभेत्॥"

📲 View full Kundali, Hora Chakra, Panchak & Choghadiya on Shakti Panchang:
https://shaktipanchang.app`;
  }

  if (currentLang === 'gu') {
    return `🚩 ॐ श्री गणेशाय नमः 🚩
*શક્તિ સનાતન વૈદિક પંચાંગ*
📅 તારીખ: ${dateStr} (${wDay})
📍 સ્થળ: ${location.name}
══════════════════════════
☀️ સૂર્યોદય: ${sunrise} | સૂર્યાસ્ત: ${sunset}
✨ સંવત: ${panchang.samvat} | શક: ${panchang.sakaSamvat}
🌙 માસ: ${masa} (${paksha})
♈ સૂર્ય રાશિ: ${solarR} | ચંદ્ર રાશિ: ${lunarR}

📜 *પંચાંગના ૫ મુખ્ય અંગો:*
🔹 તિથિ: ${tithi} (${paksha})
🔹 વાર: ${wDay}
🔹 નક્ષત્ર: ${nak} (ચરણ: ${panchang.pada})
🔹 યોગ: ${yoga}
🔹 કરણ: ${karana}
${yogaLines}
🛡️ *પંચક અને ભદ્રા:*
${panchakLine}
${bhadraLine}

⏱️ *શુભ અને ત્યાજ્ય સમય:*
✅ અભિજિત મુહૂર્ત: ${abhijitStr}
❌ રાહુ કાળ: ${rahuStr}
❌ યમગંડ કાળ: ${yamaStr}
❌ ગુલિક કાળ: ${gulikStr}
⚠️ દિશાશૂળ: ${shool} દિશા
💡 પરિહાર: ${remedy}

🕉️ *દૈનિક વૈદિક મંત્ર:*
"तिथिर्वारश्च नक्षत्रं योगः करणमेव च।
पञ्चाङ्गस्य फलं श्रुत्वा गङ्गास्नानफलं लभेत्॥"

📲 સંપૂર્ણ કુંડળી, હોરા ચક્ર, પંચક અને ચોઘડિયા જુઓ શક્તિ પંચાંગ પર:
https://shaktipanchang.app`;
  }

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
${yogaLines}
🛡️ *पञ्चक एवं भद्रा:*
${panchakLine}
${bhadraLine}

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

📲 संपूर्ण कुण्डली, होरा चक्र, पञ्चक व चौघड़िया देखें शक्ति पंचांग पर:
https://shaktipanchang.app`;

  return text;
}

export async function sharePanchang(
  panchang: VedicPanchangData,
  location: SavedLocation,
  lang?: string
): Promise<'shared' | 'whatsapp' | 'copied'> {
  const currentLang = ((lang || i18n.language || 'hi') as string).slice(0, 2).toLowerCase();
  const text = generatePanchangShareText(panchang, location, currentLang);
  const wDay = trWeekday(panchang.weekday, currentLang);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: pickL(
          currentLang,
          `आज का शक्ति वैदिक पंचांग - ${wDay}`,
          `Today's Shakti Vedic Panchang - ${wDay}`,
          `આજનું શક્તિ વૈદિક પંચાંગ - ${wDay}`
        ),
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

export function copyPanchangToClipboard(
  panchang: VedicPanchangData,
  location: SavedLocation,
  lang?: string
): boolean {
  const text = generatePanchangShareText(panchang, location, lang);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
