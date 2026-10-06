export const LANGS = [
  { code: "hi", native: "हिन्दी", name: "Hindi" },
  { code: "en", native: "English", name: "English" },
  { code: "gu", native: "ગુજરાતી", name: "Gujarati" },
  { code: "mr", native: "मराठी", name: "Marathi" },
  { code: "bn", native: "বাংলা", name: "Bengali" },
  { code: "ta", native: "தமிழ்", name: "Tamil" },
  { code: "te", native: "తెలుగు", name: "Telugu" },
  { code: "kn", native: "ಕನ್ನಡ", name: "Kannada" },
  { code: "ml", native: "മലയാളം", name: "Malayalam" },
  { code: "pa", native: "ਪੰਜਾਬੀ", name: "Punjabi" },
  { code: "or", native: "ଓଡ଼ିଆ", name: "Odia" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

export function isLang(value: string): value is LangCode {
  return LANGS.some((lang) => lang.code === value);
}

const DIGITS: Partial<Record<LangCode, string>> = {
  hi: "०१२३४५६७८९",
  mr: "०१२३४५६७८९",
  bn: "০১২৩৪৫৬৭৮৯",
  gu: "૦૧૨૩૪૫૬૭૮૯",
  pa: "੦੧੨੩੪੫੬੭੮੯",
  or: "୦୧୨୩୪୫୬୭୮୯",
};

export function formatNum(value: number, lang: LangCode) {
  const digits = DIGITS[lang];
  const text = String(value);
  if (!digits) return text;
  return text.replace(/\d/g, (digit) => digits[Number(digit)] ?? digit);
}
