import { useState } from "react";
import {
  CheckCircle2,
  Crown,
  Sparkles,
  X,
  Lock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useLicense } from "@/lib/license-client";
import { ZeroScrollPager } from './ZeroScrollPager';
import { useLanguage } from '../i18n';

function pickL<T>(lang: string, hi: T, en: T, gu: T): T {
  const c = (lang || 'hi').slice(0, 2).toLowerCase();
  if (c === 'en') return en;
  if (c === 'gu') return gu;
  return hi;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  locked?: boolean;
}

export function SubscriptionModal({ isOpen, onClose, reason, locked }: SubscriptionModalProps) {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const dateLocale = cLang === 'en' ? 'en-US' : cLang === 'gu' ? 'gu-IN' : 'hi-IN';
  const { status, activateAnnual, loading } = useLicense();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivate = async () => {
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const next = await activateAnnual();
      if (!next.entitled) {
        setError(
          pickL(
            cLang,
            "सदस्यता सक्रिय नहीं हुई। Google Play में योजना जाँचें।",
            "Subscription could not be activated. Please check your plan in Google Play.",
            "સભ્યપદ સક્રિય થયું નથી. Google Play માં પ્લાન તપાસો."
          )
        );
        return;
      }
      setSuccessMsg(
        pickL(
          cLang,
          "बधाई हो। Google Play सदस्यता सक्रिय है।",
          "Congratulations! Your Google Play subscription is now active.",
          "અભિનંદન. તમારું Google Play સભ્યપદ સક્રિય થઈ ગયું છે."
        )
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      const message = String(err?.message || "");
      if (message.toLowerCase().includes("cancel") || message.includes("रद्द")) {
        setError(pickL(cLang, "भुगतान रद्द हुआ।", "Payment was cancelled.", "ચુકવણી રદ કરવામાં આવી."));
      } else {
        setError(
          message ||
            pickL(
              cLang,
              "Google Play भुगतान पूरा नहीं हुआ।",
              "Google Play payment could not be completed.",
              "Google Play ચુકવણી પૂર્ણ થઈ નથી."
            )
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const unlockedFeatures = pickL(
    cLang,
    [
      "📜 59-पृष्ठीय कुण्डली व महापत्रिका PDF (आजीवन)",
      "💖 अष्टकूट 36-गुण मिलान पत्रिका व मंगलीक विचार",
      "🔔 दैनिक पंचांग, राहुकाल, शुभ चौघड़िया व सुबह का उपाय",
      "✨ हस्तरेखा, टैरो कार्ड, रत्न विचार व उमा दैवज्ञ परामर्श",
    ],
    [
      "📜 59-Page Kundali & Mahapatrika PDF (Lifetime)",
      "💖 Ashtakoot 36-Guna Matchmaking & Manglik Analysis",
      "🔔 Daily Panchang, Rahu Kaal, Shubh Choghadiya & Morning Remedy",
      "✨ Palmistry, Tarot Cards, Gemology & Uma Daivagya Consultation",
    ],
    [
      "📜 59-પાનાની કુંડળી અને મહાપત્રિકા PDF (આજીવન)",
      "💖 અષ્ટકૂટ 36-ગુણ મિલાન પત્રિકા અને માંગલિક વિચાર",
      "🔔 દૈનિક પંચાંગ, રાહુકાળ, શુભ ચોઘડિયા અને સવારનો ઉપાય",
      "✨ હસ્તરેખા, ટેરો કાર્ડ, રત્ન વિચાર અને ઉમા દૈવજ્ઞ પરામર્શ",
    ]
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      data-swipe-ignore="true"
    >
      <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full text-[#3E2714] flex flex-col h-[90dvh] max-h-[100dvh]">
        {/* Header */}
        <div className="bg-[#5C3A21] text-[#FAF2E4] p-3.5 sm:p-4 flex items-center justify-between border-b border-[#B56A00] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B56A00] text-[#2C180C] flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold font-granth text-base text-[#FFD88A] leading-tight">
                {pickL(
                  cLang,
                  "शक्ति पंचांग आजीवन VIP सदस्यता",
                  "Shakti Panchang Lifetime VIP Membership",
                  "શક્તિ પંચાંગ આજીવન VIP સભ્યપદ"
                )}
              </h3>
              <p className="text-[11px] text-[#D9C4A9]">
                {pickL(
                  cLang,
                  "७ दिन निःशुल्क ट्रायल • ₹99 (भारत) / $1 (Global) आजीवन",
                  "7-Day Free Trial • ₹99 (India) / $1 (Global) Lifetime",
                  "૭ દિવસ નિઃશુલ્ક ટ્રાયલ • ₹99 (ભારત) / $1 (Global) આજીવન"
                )}
              </p>
            </div>
          </div>
          {!locked && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#462B17] text-[#D9C4A9] hover:text-white cursor-pointer transition"
            aria-label={pickL(cLang, "बंद करें", "Close", "બંધ કરો")}
          >
            <X className="w-5 h-5" />
          </button>
          )}
        </div>

        {/* Content */}
        <ZeroScrollPager className="flex-1 min-h-0 bg-[#FAF2E4] overflow-hidden" contentClassName="p-4 sm:p-5 space-y-3.5">
          {/* Reason Notification Banner */}
          {reason && (
            <div className="p-2.5 bg-amber-100 border border-[#B56A00]/50 rounded-xl text-xs text-[#3E2714] flex items-center gap-2 font-bold shadow-2xs">
              <Lock className="w-4 h-4 text-[#B56A00] shrink-0" />
              <span>{reason}</span>
            </div>
          )}

          {status.isTampered && (
            <div className="p-2.5 bg-red-100 border border-red-500/50 rounded-xl text-xs text-red-800 flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                {pickL(
                  cLang,
                  "सुरक्षा चेतावनी: समय या ऐप डेटा में अनधिकृत परिवर्तन का प्रयास। केवल मुख्य पंचांग निःशुल्क खुला है।",
                  "Security warning: Unauthorized device clock or app data modification detected. Only main Panchang remains free.",
                  "સુરક્ષા ચેતવણી: સમય અથવા એપ ડેટામાં અનધિકૃત ફેરફાર જણાયો છે. માત્ર મુખ્ય પંચાંગ નિઃશુલ્ક ખુલ્લું છે."
                )}
              </span>
            </div>
          )}

          {status.entitled && (status.kind === "annual" || status.kind === "lifetime") ? (
            <div className="border-2 border-[#8C6239]/30 rounded-xl p-4 text-center space-y-3 bg-[#EBD8BD]/40">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#B56A00]" />
              <h4 className="font-bold font-granth text-lg text-[#5C3A21]">
                {status.kind === "lifetime"
                  ? pickL(cLang, "आजीवन VIP सदस्यता सक्रिय", "Lifetime VIP Membership Active", "આજીવન VIP સભ્યપદ સક્રિય")
                  : pickL(cLang, "वार्षिक सदस्यता सक्रिय", "Annual Membership Active", "વાર્ષિક સભ્યપદ સક્રિય")}
              </h4>
              <p className="text-xs text-[#735133]">
                {status.kind === "lifetime"
                  ? pickL(
                      cLang,
                      "आपके पास सम्पूर्ण सुविधाओं का आजीवन अधिकार है।",
                      "You have lifetime access to all premium features.",
                      "તમારી પાસે તમામ સુવિધાઓનો આજીવન અધિકાર છે."
                    )
                  : pickL(
                      cLang,
                      `शेष ${status.daysRemaining} दिन • वैधता: ${
                        status.expiresAt
                          ? new Date(status.expiresAt).toLocaleDateString(dateLocale, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""
                      }`,
                      `${status.daysRemaining} days left • Valid until: ${
                        status.expiresAt
                          ? new Date(status.expiresAt).toLocaleDateString(dateLocale, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""
                      }`,
                      `બાકી ${status.daysRemaining} દિવસ • માન્યતા: ${
                        status.expiresAt
                          ? new Date(status.expiresAt).toLocaleDateString(dateLocale, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""
                      }`
                    )}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-11 py-2.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-xl text-sm font-bold cursor-pointer transition shadow-xs"
              >
                {pickL(cLang, "ग्रन्थ में वापस जाएँ", "Return to App", "ગ્રંથમાં પાછા જાઓ")}
              </button>
            </div>
          ) : (
            <>
              {/* Plan Card */}
              <div className="bg-[#F4E8D1] border-2 border-[#B56A00] rounded-xl p-3.5 sm:p-4 text-center relative shadow-xs">
                <div className="absolute top-2 right-2 bg-[#B56A00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {status.entitled
                    ? pickL(cLang, "७ दिन फ्री ट्रायल", "7-Day Free Trial", "૭ દિવસ ફ્રી ટ્રાયલ")
                    : pickL(cLang, "ट्रायल समाप्त", "Trial Ended", "ટ્રાયલ પૂર્ણ")}
                </div>
                <div className="text-[11px] text-[#8C6239] font-bold uppercase tracking-wider">
                  {pickL(
                    cLang,
                    "एक बार का भुगतान — आजीवन असीमित उपयोग",
                    "One-Time Payment — Unlimited Lifetime Access",
                    "એક જ વાર ચુકવણી — આજીવન અમર્યાદિત ઉપયોગ"
                  )}
                </div>
                <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black font-granth text-[#5C3A21]">₹99 / $1</span>
                  <span className="text-xs font-bold text-[#8C6239] bg-[#EBD8BD] px-2 py-0.5 rounded-md">
                    {pickL(cLang, "आजीवन (Lifetime)", "Lifetime", "આજીવન (Lifetime)")}
                  </span>
                </div>
                <p className="text-[12px] text-[#3E2714] mt-2 font-medium leading-relaxed">
                  {pickL(
                    cLang,
                    "७ दिन पूरी ऐप निःशुल्क उपलब्ध है। उसके बाद केवल ₹99 (भारत) या $1 (विश्व भर में) के एकमुश्त शुल्क में आजीवन समस्त कुण्डली PDF, मिलान पत्रिका, चौघड़िया व दैनिक उपाय अनलॉक रहेंगे।",
                    "Enjoy the entire app free for 7 days. Afterwards, unlock all Kundali PDFs, Matchmaking charts, Choghadiya, and daily remedies for life with a single ₹99 (India) / $1 (Global) payment.",
                    "૭ દિવસ સંપૂર્ણ એપ નિઃશુલ્ક ઉપલબ્ધ છે. ત્યારબાદ માત્ર ₹99 (ભારત) અથવા $1 (વિશ્વભરમાં) ના એકમુશ્ત શુલ્કમાં આજીવન તમામ કુંડળી PDF, મિલાન પત્રિકા, ચોઘડિયા અને દૈનિક ઉપાય અનલોક રહેશે."
                  )}
                </p>
                {status.entitled && status.kind === "trial" ? (
                  <p className="text-[11px] text-[#735133] mt-1.5 font-medium">
                    {pickL(
                      cLang,
                      "आपकी ७-दिवसीय निःशुल्क ट्रायल अवधि सक्रिय है — ",
                      "Your 7-day free trial is active — ",
                      "તમારો ૭-દિવસનો નિઃશુલ્ક ટ્રાયલ સમય સક્રિય છે — "
                    )}
                    <span className="font-bold text-[#B56A00]">
                      {pickL(
                        cLang,
                        `${status.daysRemaining} दिन शेष`,
                        `${status.daysRemaining} days remaining`,
                        `${status.daysRemaining} દિવસ બાકી`
                      )}
                    </span>
                    .
                  </p>
                ) : (
                  <p className="text-[11px] text-[#8C3A00] mt-1.5 font-bold">
                    {pickL(
                      cLang,
                      "७ दिन का निःशुल्क परीक्षण समाप्त। ₹99 / $1 की आजीवन सदस्यता प्राप्त करके ऐप को स्थायी रूप से अनलॉक करें।",
                      "Your 7-day free trial has ended. Unlock the app permanently with a ₹99 / $1 lifetime membership.",
                      "૭ દિવસનું નિઃશુલ્ક પરીક્ષણ સમાપ્ત થયું છે. ₹99 / $1 નું આજીવન સભ્યપદ મેળવી એપ કાયમી અનલોક કરો."
                    )}
                  </p>
                )}
              </div>

              {/* What gets unlocked list */}
              <div className="border border-[#8C6239]/30 rounded-xl p-3 bg-white/70">
                <div className="text-[11px] font-bold text-[#5C3A21] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>
                    {pickL(
                      cLang,
                      "₹99 / $1 में आजीवन उपलब्ध विशेष सेवाएँ:",
                      "Lifetime Premium Features Included for ₹99 / $1:",
                      "₹99 / $1 માં આજીવન ઉપલબ્ધ વિશેષ સેવાઓ:"
                    )}
                  </span>
                </div>
                <ul className="grid grid-cols-1 gap-1.5 text-[11px] text-[#5C3A21]">
                  {unlockedFeatures.map((item) => (
                    <li key={item} className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#B56A00] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment & Activation Card */}
              <div className="border border-[#8C6239]/30 rounded-xl p-3.5 space-y-3 bg-white/80">
                <p className="text-xs font-bold text-[#5C3A21]">
                  {pickL(
                    cLang,
                    "भुगतान Google Play बिलिंग से सुरक्षित। भारत: ₹99 • Rest of World: $1 (आजीवन)",
                    "Secured via Google Play Billing. India: ₹99 • Rest of World: $1 (Lifetime)",
                    "ચુકવણી Google Play બિલિંગથી સુરક્ષિત. ભારત: ₹99 • Rest of World: $1 (આજીવન)"
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={isProcessing || loading}
                  className="w-full min-h-11 py-2.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-xs active:scale-98 transition"
                >
                  {isProcessing
                    ? pickL(cLang, "Play खुल रहा है...", "Opening Play...", "Play ખૂલી રહ્યું છે...")
                    : pickL(
                        cLang,
                        "Google Play पर ₹99 / $1 आजीवन लें",
                        "Unlock Lifetime on Google Play (₹99 / $1)",
                        "Google Play પર ₹99 / $1 આજીવન મેળવો"
                      )}
                </button>
                <p className="text-[11px] text-[#735133] leading-relaxed">
                  {pickL(
                    cLang,
                    "७ दिन पूरे ऐप का निःशुल्क आनंद लें। उसके बाद एकमुश्त ₹99 / $1 आजीवन सदस्यता Google Play से प्राप्त करें।",
                    "Enjoy full access free for 7 days, then unlock permanently for a one-time ₹99 / $1 fee via Google Play.",
                    "૭ દિવસ સંપૂર્ણ એપનો નિઃશુલ્ક આનંદ માણો. ત્યારબાદ એકવાર ₹99 / $1 આજીવન સભ્યપદ Google Play થી મેળવો."
                  )}
                </p>
                {error && (
                  <p className="text-[11px] text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                    {error}
                  </p>
                )}
                {successMsg && (
                  <p className="text-[11px] text-green-800 font-bold bg-green-50 p-2 rounded-lg border border-green-200">
                    {successMsg}
                  </p>
                )}
                <div className="pt-1 flex items-center justify-between text-[10px] text-[#8C6239] border-t border-[#8C6239]/20">
                  <a
                    className="flex items-center gap-1 underline"
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      setSuccessMsg(
                        pickL(
                          cLang,
                          'सनातन शक्ति पंचांग आपकी पूर्ण गोपनीयता व डेटा सुरक्षा सुनिश्चित करता है।',
                          'Sanatan Shakti Panchang guarantees complete privacy and local data security.',
                          'સનાતન શક્તિ પંચાંગ તમારી સંપૂર્ણ ગોપનીયતા અને ડેટા સુરક્ષા સુનિશ્ચિત કરે છે.'
                        )
                      );
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B56A00]" />
                    {pickL(cLang, "गोपनीयता नीति", "Privacy Policy", "ગોપનીયતા નીતિ")}
                  </a>
                  <span>{pickL(cLang, "Google Play बिलिंग", "Google Play Billing", "Google Play બિલિંગ")}</span>
                </div>
              </div>
            </>
          )}
        </ZeroScrollPager>
      </div>
    </div>
  );
}
