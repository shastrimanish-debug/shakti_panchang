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

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  locked?: boolean;
}

export function SubscriptionModal({ isOpen, onClose, reason, locked }: SubscriptionModalProps) {
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
        setError("सदस्यता सक्रिय नहीं हुई। Google Play में योजना जाँचें।");
        return;
      }
      setSuccessMsg("बधाई हो। Google Play सदस्यता सक्रिय है।");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      const message = String(err?.message || "");
      if (message.toLowerCase().includes("cancel") || message.includes("रद्द")) {
        setError("भुगतान रद्द हुआ।");
      } else {
        setError(message || "Google Play भुगतान पूरा नहीं हुआ।");
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
                शक्ति पंचांग आजीवन VIP सदस्यता
              </h3>
              <p className="text-[11px] text-[#D9C4A9]">
                ७ दिन निःशुल्क ट्रायल • ₹99 (भारत) / $1 (Global) आजीवन
              </p>
            </div>
          </div>
          {!locked && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#462B17] text-[#D9C4A9] hover:text-white cursor-pointer transition"
            aria-label="बंद करें"
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
                सुरक्षा चेतावनी: समय या ऐप डेटा में अनधिकृत परिवर्तन का प्रयास। केवल मुख्य पंचांग निःशुल्क खुला है।
              </span>
            </div>
          )}

          {status.entitled && (status.kind === "annual" || status.kind === "lifetime") ? (
            <div className="border-2 border-[#8C6239]/30 rounded-xl p-4 text-center space-y-3 bg-[#EBD8BD]/40">
              <CheckCircle2 className="w-10 h-10 mx-auto text-[#B56A00]" />
              <h4 className="font-bold font-granth text-lg text-[#5C3A21]">
                {status.kind === "lifetime" ? "आजीवन VIP सदस्यता सक्रिय" : "वार्षिक सदस्यता सक्रिय"}
              </h4>
              <p className="text-xs text-[#735133]">
                {status.kind === "lifetime"
                  ? "आपके पास सम्पूर्ण सुविधाओं का आजीवन अधिकार है।"
                  : `शेष ${status.daysRemaining} दिन • वैधता: ${
                      status.expiresAt
                        ? new Date(status.expiresAt).toLocaleDateString("hi-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""
                    }`}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-11 py-2.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-xl text-sm font-bold cursor-pointer transition shadow-xs"
              >
                ग्रन्थ में वापस जाएँ
              </button>
            </div>
          ) : (
            <>
              {/* Plan Card */}
              <div className="bg-[#F4E8D1] border-2 border-[#B56A00] rounded-xl p-3.5 sm:p-4 text-center relative shadow-xs">
                <div className="absolute top-2 right-2 bg-[#B56A00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {status.entitled ? "७ दिन फ्री ट्रायल" : "ट्रायल समाप्त"}
                </div>
                <div className="text-[11px] text-[#8C6239] font-bold uppercase tracking-wider">
                  एक बार का भुगतान — आजीवन असीमित उपयोग
                </div>
                <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black font-granth text-[#5C3A21]">₹99 / $1</span>
                  <span className="text-xs font-bold text-[#8C6239] bg-[#EBD8BD] px-2 py-0.5 rounded-md">आजीवन (Lifetime)</span>
                </div>
                <p className="text-[12px] text-[#3E2714] mt-2 font-medium leading-relaxed">
                  ७ दिन पूरी ऐप निःशुल्क उपलब्ध है। उसके बाद केवल ₹99 (भारत) या $1 (विश्व भर में) के एकमुश्त शुल्क में आजीवन समस्त कुण्डली PDF, मिलान पत्रिका, चौघड़िया व दैनिक उपाय अनलॉक रहेंगे।
                </p>
                {status.entitled && status.kind === "trial" ? (
                  <p className="text-[11px] text-[#735133] mt-1.5 font-medium">
                    आपकी ७-दिवसीय निःशुल्क ट्रायल अवधि सक्रिय है — <span className="font-bold text-[#B56A00]">{status.daysRemaining} दिन शेष</span>।
                  </p>
                ) : (
                  <p className="text-[11px] text-[#8C3A00] mt-1.5 font-bold">
                    ७ दिन का निःशुल्क परीक्षण समाप्त। ₹99 / $1 की आजीवन सदस्यता प्राप्त करके ऐप को स्थायी रूप से अनलॉक करें।
                  </p>
                )}
              </div>

              {/* What gets unlocked list */}
              <div className="border border-[#8C6239]/30 rounded-xl p-3 bg-white/70">
                <div className="text-[11px] font-bold text-[#5C3A21] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>₹99 / $1 में आजीवन उपलब्ध विशेष सेवाएँ:</span>
                </div>
                <ul className="grid grid-cols-1 gap-1.5 text-[11px] text-[#5C3A21]">
                  {[
                    "📜 59-पृष्ठीय कुण्डली व महापत्रिका PDF (आजीवन)",
                    "💖 अष्टकूट 36-गुण मिलान पत्रिका व मंगलीक विचार",
                    "🔔 दैनिक पंचांग, राहुकाल, शुभ चौघड़िया व सुबह का उपाय",
                    "✨ हस्तरेखा, टैरो कार्ड, रत्न विचार व उमा दैवज्ञ परामर्श",
                  ].map((item) => (
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
                  भुगतान Google Play बिलिंग से सुरक्षित। भारत: ₹99 • Rest of World: $1 (आजीवन)
                </p>
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={isProcessing || loading}
                  className="w-full min-h-11 py-2.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer shadow-xs active:scale-98 transition"
                >
                  {isProcessing ? "Play खुल रहा है..." : "Google Play पर ₹99 / $1 आजीवन लें"}
                </button>
                <p className="text-[11px] text-[#735133] leading-relaxed">
                  ७ दिन पूरे ऐप का निःशुल्क आनंद लें। उसके बाद एकमुश्त ₹99 / $1 आजीवन सदस्यता Google Play से प्राप्त करें।
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
                    href="https://shastrimanish-debug.github.io/shakti_panchang/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B56A00]" />
                    गोपनीयता नीति
                  </a>
                  <span>Google Play बिलिंग</span>
                </div>
              </div>
            </>
          )}
        </ZeroScrollPager>
      </div>
    </div>
  );
}
