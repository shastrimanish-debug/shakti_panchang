import { useState } from "react";
import {
  CheckCircle2,
  Crown,
  Sparkles,
  X,
  Smartphone,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  MessageCircle,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { useLicense } from "@/lib/license-client";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function SubscriptionModal({ isOpen, onClose, reason }: SubscriptionModalProps) {
  const { status, activateAnnual, loading } = useLicense();
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText("vedicshakti@upi");
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      setCopiedUpi(false);
    }
  };

  const handleActivate = async () => {
    const ref = paymentRef.trim().toUpperCase();
    if (!ref || ref.length < 6) {
      setError("कृपया मान्य UPI संदर्भ (UTR) या VIP लाइसेंस कोड दर्ज करें।");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const next = await activateAnnual(ref);
      if (!next.entitled) {
        setError("सदस्यता सक्रिय नहीं हो सकी। कृपया संदर्भ या कोड पुनः जाँचें।");
        return;
      }
      setSuccessMsg("बधाई हो! आपकी सदस्यता सफलतापूर्वक सक्रिय हो चुकी है।");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "सत्यापन विफल रहा। कृपया सही UTR या VIP कोड दर्ज करें।");
    } finally {
      setIsProcessing(false);
    }
  };

  const upiDeepLink =
    "upi://pay?pa=vedicshakti@upi&pn=ShaktiPanchang&am=99&cu=INR&tn=ShaktiPanchangAnnual";

  const whatsappInquiryUrl = `https://wa.me/?text=${encodeURIComponent(
    "प्रणाम! मुझे शक्ति सनातन पंचांग की वार्षिक सदस्यता (₹99/वर्ष) या VIP लाइसेंस कोड चाहिए। कृपया मार्गदर्शन करें।"
  )}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      data-swipe-ignore="true"
    >
      <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full text-[#3E2714] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#5C3A21] text-[#FAF2E4] p-3.5 sm:p-4 flex items-center justify-between border-b border-[#B56A00] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B56A00] text-[#2C180C] flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold font-granth text-base text-[#FFD88A] leading-tight">
                शक्ति पंचांग वार्षिक सदस्यता
              </h3>
              <p className="text-[11px] text-[#D9C4A9]">
                ७ दिन निःशुल्क • उसके बाद केवल पंचांग मुख्य पृष्ठ फ्री
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#462B17] text-[#D9C4A9] hover:text-white cursor-pointer transition"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-[#FAF2E4]">
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
                  सम्पूर्ण सनातन वैदिक ग्रन्थ
                </div>
                <div className="flex items-baseline justify-center gap-1 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black font-granth text-[#5C3A21]">₹99</span>
                  <span className="text-xs font-bold text-[#8C6239]">/ वर्ष (₹8.25/माह)</span>
                </div>
                {status.entitled && status.kind === "trial" ? (
                  <p className="text-[11px] text-[#735133] mt-1 font-medium">
                    आपकी निःशुल्क अवधि सक्रिय है — <span className="font-bold text-[#B56A00]">{status.daysRemaining} दिन शेष</span>।
                  </p>
                ) : (
                  <p className="text-[11px] text-[#8C3A00] mt-1 font-bold">
                    ७-दिवसीय निःशुल्क परीक्षण पूर्ण हो चुका है। अब केवल पंचांग मुख्य पृष्ठ फ्री रहेगा। गोचर, होरा, कुण्डली, चौघड़िया, मिलान व उमा AI के लिए सदस्यता लें।
                  </p>
                )}
              </div>

              {/* What gets unlocked list */}
              <div className="border border-[#8C6239]/30 rounded-xl p-3 bg-white/70">
                <div className="text-[11px] font-bold text-[#5C3A21] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>सदस्यता में क्या अनलॉक होगा:</span>
                </div>
                <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-[#5C3A21]">
                  {[
                    "🪐 दैनिक प्रत्यक्ष ग्रह गोचर चक्र",
                    "⏳ २४ घंटे का दैनिक होरा चक्र",
                    "📜 सम्पूर्ण जन्म कुण्डली व PDF",
                    "💖 अष्टकूट ३६ गुण मिलान",
                    "⏱️ दिन व रात्रि चौघड़िया",
                    "🧭 यात्रा दिशाशूल व परिहार",
                    "🙏 व्रत कथाएँ व आरती संग्रह",
                    "🤖 उमा AI विद्वान दैवज्ञ परामर्श",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#B56A00] shrink-0" />
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment & Activation Card */}
              <div className="border border-[#8C6239]/30 rounded-xl p-3.5 space-y-3 bg-white/80">
                <div className="flex items-center justify-between text-xs font-bold text-[#5C3A21]">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-4 h-4 text-[#B56A00]" />
                    UPI द्वारा तुरंत भुगतान (₹99)
                  </span>
                  <span className="text-[#B56A00] font-black">₹99 / वर्ष</span>
                </div>

                <div className="flex items-center justify-between bg-[#FDF9F3] border border-[#8C6239]/40 rounded-lg p-2 text-xs">
                  <div>
                    <div className="text-[10px] text-[#8C6239] font-bold">UPI ID</div>
                    <div className="font-mono font-bold text-[#5C3A21]">vedicshakti@upi</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F4E8D1] hover:bg-[#EBD8BD] text-[#5C3A21] rounded-md font-bold cursor-pointer text-xs transition"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUpi ? "कॉपी हुआ" : "कॉपी"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={upiDeepLink}
                    className="flex items-center justify-center gap-1.5 py-2 min-h-10 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-xl text-xs font-bold transition shadow-xs text-center"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    UPI ऐप खोलें
                  </a>
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 min-h-10 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold transition shadow-xs text-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    व्हाट्सएप पर पूछें
                  </a>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#8C6239] mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#B56A00]" />
                    <span>भुगतान UTR (संदर्भ संख्या) अथवा VIP लाइसेंस कोड दर्ज करें:</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="उदा. 428912345678 या VIP कोड"
                      className="flex-1 min-h-10 px-2.5 bg-white border border-[#8C6239]/40 rounded-lg text-xs font-mono outline-none text-[#5C3A21] uppercase focus:border-[#B56A00]"
                    />
                    <button
                      type="button"
                      onClick={handleActivate}
                      disabled={isProcessing || loading || !paymentRef.trim()}
                      className="px-3.5 min-h-10 bg-[#B56A00] hover:bg-[#C27803] text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs transition whitespace-nowrap"
                    >
                      {isProcessing ? "जाँच..." : "सक्रिय करें"}
                    </button>
                  </div>
                </div>

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
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B56A00]" />
                    हस्ताक्षरित क्रिप्टोग्राफिक लाइसेंस
                  </span>
                  <span>शास्त्री मनीष • काशी-उज्जैन</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
