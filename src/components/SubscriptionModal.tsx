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
    if (!/^[A-Z0-9]{8,22}$/.test(ref)) {
      setError("UPI संदर्भ / UTR 8–22 अक्षर लिखें (भुगतान के बाद ऐप में दिखता है)।");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const next = await activateAnnual(ref);
      if (!next.entitled || next.kind !== "annual") {
        setError(
          next.reason === "payment_ref_used"
            ? "यह भुगतान संदर्भ पहले उपयोग हो चुका है।"
            : "सदस्यता सक्रिय नहीं हो सकी। संदर्भ जाँचें।",
        );
        return;
      }
    } catch {
      setError("सर्वर से जुड़ नहीं सके। कुछ क्षण बाद पुनः प्रयास करें।");
    } finally {
      setIsProcessing(false);
    }
  };

  const upiDeepLink =
    "upi://pay?pa=vedicshakti@upi&pn=ShaktiPanchang&am=99&cu=INR&tn=ShaktiPanchangAnnual";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 bg-temple-dark/80" data-swipe-ignore="true">
      <div className="bg-parchment border-2 border-gold rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full text-temple flex flex-col max-h-[92vh]">
        <div className="bg-temple text-parchment p-4 flex items-center justify-between border-b border-gold shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold text-temple-dark flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-granth text-base text-gold-bright">शक्ति पंचांग प्रीमियम</h3>
              <p className="text-[11px] text-sand">7 दिन निःशुल्क • उसके बाद ₹99 / वर्ष</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-temple-deep" aria-label="बंद करें">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {reason && (
            <div className="p-2.5 bg-gold-bright/25 border border-gold/40 rounded-xl text-xs text-ink flex items-center gap-2 font-bold">
              <Lock className="w-4 h-4 text-gold shrink-0" />
              <span>{reason}</span>
            </div>
          )}

          {status.entitled && status.kind === "annual" ? (
            <div className="border-2 border-wood/30 rounded-xl p-4 text-center space-y-3 bg-leaf/40">
              <CheckCircle2 className="w-10 h-10 mx-auto text-gold" />
              <h4 className="font-bold font-granth text-lg">वार्षिक सदस्यता सक्रिय</h4>
              <p className="text-xs text-muted">
                शेष {status.daysRemaining} दिन •{" "}
                {status.expiresAt
                  ? new Date(status.expiresAt).toLocaleDateString("hi-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </p>
              <button type="button" onClick={onClose} className="w-full min-h-11 py-2.5 bg-temple text-parchment rounded-xl text-sm font-bold">
                ग्रन्थ जारी रखें
              </button>
            </div>
          ) : (
            <>
              <div className="bg-parchment-deep border-2 border-gold rounded-xl p-4 text-center relative">
                <div className="absolute top-2 right-2 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  7 दिन परीक्षण
                </div>
                <div className="text-xs text-wood font-bold uppercase tracking-wider">वार्षिक वैदिक पैकेज</div>
                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                  <span className="text-4xl font-black font-granth">₹99</span>
                  <span className="text-xs font-bold text-wood">/ वर्ष</span>
                </div>
                {status.entitled && status.kind === "trial" ? (
                  <p className="text-[11px] text-muted mt-1">
                    आपकी निःशुल्क अवधि चल रही है — {status.daysRemaining} दिन शेष। PDF व महापत्रिका अभी खुली हैं।
                  </p>
                ) : (
                  <p className="text-[11px] text-muted mt-1">
                    परीक्षण समाप्त। कुण्डली PDF व महापत्रिका के लिए ₹99/वर्ष सक्रिय करें।
                  </p>
                )}
              </div>

              <ul className="space-y-1.5 text-xs text-muted border border-wood/30 rounded-xl p-3">
                {[
                  "सम्पूर्ण कुण्डली व भोजपत्र PDF",
                  "59-पृष्ठीय महापत्रिका",
                  "अष्टकूट मिलान पत्रिका",
                  "उमा AI वैदिक मार्गदर्शन",
                  "स्थान आधारित पंचांग",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="border border-wood/30 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-4 h-4 text-gold" />
                    Google Pay / PhonePe / Paytm
                  </span>
                  <span className="text-gold">₹99</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 border border-wood/40 rounded-lg p-2 text-xs">
                  <div>
                    <div className="text-[10px] text-wood">UPI ID</div>
                    <div className="font-mono font-bold">vedicshakti@upi</div>
                  </div>
                  <button type="button" onClick={handleCopyUpi} className="flex items-center gap-1 px-2.5 py-1.5 bg-parchment-deep rounded-md font-bold">
                    {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUpi ? "कॉपी" : "कॉपी करें"}
                  </button>
                </div>
                <a
                  href={upiDeepLink}
                  className="block text-center py-2.5 min-h-11 bg-temple text-parchment rounded-xl text-xs font-bold"
                >
                  UPI ऐप खोलें
                </a>
                <label className="block text-xs font-bold text-wood">भुगतान UTR / संदर्भ संख्या</label>
                <input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="उदा. 123456789012"
                  className="w-full min-h-11 p-2 bg-parchment-deep border border-wood/40 rounded-lg text-sm font-mono outline-none"
                />
                {error && <p className="text-[11px] text-vermilion font-bold">{error}</p>}
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={isProcessing || loading}
                  className="w-full min-h-11 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {isProcessing ? "सत्यापन हो रहा है..." : "₹99 सदस्यता सक्रिय करें"}
                </button>
                <p className="text-[10px] text-center text-wood flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  हस्ताक्षरित लाइसेंस — स्थानीय झूठी सदस्यता काम नहीं करती
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
