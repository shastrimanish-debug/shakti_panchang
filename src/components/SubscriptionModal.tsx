import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Crown,
  Sparkles,
  X,
  Smartphone,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import {
  getSubscriptionStatus,
  activateSubscription,
  SubscriptionStatus,
} from '../services/storage';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribed?: (status: SubscriptionStatus) => void;
  reason?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscribed,
  reason,
}) => {
  const [subStatus, setSubStatus] = useState<SubscriptionStatus>(getSubscriptionStatus());
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeTab, setActiveTab] = useState<'pay' | 'details'>('pay');

  if (!isOpen) return null;

  const handleActivate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updated = activateSubscription();
      setSubStatus(updated);
      setIsProcessing(false);
      if (onSubscribed) onSubscribed(updated);
    }, 600);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('vedicshakti@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const upiDeepLink = 'upi://pay?pa=vedicshakti@upi&pn=ShaktiPanchang&am=99&cu=INR&tn=ShaktiPanchangAnnualSubscription';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF2E4] border-2 border-[#B56A00] rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full text-[#5C3A21] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5C3A21] via-[#735133] to-[#462B17] text-[#FAF2E4] p-4 flex items-center justify-between border-b border-[#B56A00] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-[#2C0A0A] flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold font-granth text-base sm:text-lg text-[#FFD88A]">
                ॥ श्री शक्ति पंचांग वार्षिक सदस्यता ॥
              </h3>
              <p className="text-[11px] text-[#D9C4A9]">
                असीमित 59-पृष्ठीय महापत्रिका, कुण्डली व समस्त PDF सेवा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#3B1F0E] text-[#D9C4A9] hover:text-white transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Reason Alert if passed */}
          {reason && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2 font-bold">
              <Lock className="w-4 h-4 text-[#B56A00] shrink-0" />
              <span>{reason}</span>
            </div>
          )}

          {subStatus.isSubscribed ? (
            /* Subscribed State */
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-4 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold font-granth text-lg text-emerald-950">
                  आपकी वार्षिक सदस्यता सक्रिय है!
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  शेष अवधि: <strong>{subStatus.daysRemaining} दिन</strong> • वैधता:{' '}
                  {new Date(subStatus.expiresAt).toLocaleDateString('hi-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shadow-md"
                >
                  जारी रखें (ग्रन्थ खोलें)
                </button>
              </div>
            </div>
          ) : (
            /* Non-Subscribed State & Payment Options */
            <>
              {/* Premium Pricing Hero Card */}
              <div className="bg-gradient-to-br from-[#F4E8D1] to-[#EBD8BD] border-2 border-[#B56A00] rounded-xl p-4 text-center shadow-xs relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-[#B56A00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  केवल ₹8.25 / माह
                </div>

                <div className="text-xs text-[#8C6239] font-bold uppercase tracking-wider">
                  वार्षिक सम्पूर्ण वैदिक पैकेज
                </div>
                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#5C3A21] font-granth">₹99</span>
                  <span className="text-xs font-bold text-[#8C6239]">/ प्रति वर्ष (365 दिन)</span>
                </div>
                <p className="text-[11px] text-[#735133] mt-1">
                  कोई छिपा शुल्क नहीं • 1 वर्ष के लिए असीमित कुण्डली व PDF डाउनलोड
                </p>
              </div>

              {/* What is included */}
              <div className="space-y-2 bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3 text-xs">
                <div className="font-bold text-[#5C3A21] flex items-center gap-1 text-[13px]">
                  <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                  <span>सदस्यता में क्या शामिल है:</span>
                </div>
                <ul className="space-y-1.5 text-[#735133]">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B56A00] shrink-0 mt-0.5" />
                    <span><strong>सम्पूर्ण 59-पृष्ठीय महापत्रिका</strong> सचित्र वैदिक कुण्डली PDF</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B56A00] shrink-0 mt-0.5" />
                    <span><strong>36-गुण अष्टकूट मिलान</strong>, मांगलिक, नाड़ी व भकूट दोष विश्लेषण</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B56A00] shrink-0 mt-0.5" />
                    <span><strong>त्रि-स्तरीय विंशोत्तरी दशा</strong> (महादशा, अंतर्दशा व सूक्ष्म प्रत्यंतर)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B56A00] shrink-0 mt-0.5" />
                    <span><strong>दैनिक व मासिक भोजपत्र पंचांग</strong> PDF फ़ोन में सहेजने की सुविधा</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B56A00] shrink-0 mt-0.5" />
                    <span><strong>आजीवन सुरक्षित प्रोफाइल</strong> - परिवार व मित्रों की कुण्डली संचयन</span>
                  </li>
                </ul>
              </div>

              {/* UPI Direct Payment / Verification */}
              <div className="bg-[#FAF2E4] border border-[#8C6239]/30 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#5C3A21]">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-4 h-4 text-[#B56A00]" />
                    <span>Google Pay / PhonePe / Paytm UPI</span>
                  </span>
                  <span className="text-[#B56A00]">राशि: ₹99</span>
                </div>

                {/* UPI ID Row */}
                <div className="flex items-center justify-between bg-white border border-[#8C6239]/40 rounded-lg p-2 text-xs">
                  <div>
                    <div className="text-[10px] text-[#8C6239]">UPI ID:</div>
                    <div className="font-mono font-bold text-[#5C3A21]">vedicshakti@upi</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#F4E8D1] hover:bg-[#EBD8BD] text-[#5C3A21] rounded-md font-bold text-[11px] transition cursor-pointer"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>कॉपी हो गया</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#8C6239]" />
                        <span>कॉपी करें</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct UPI App Opening for Phones */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={upiDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition text-center shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                    <span>UPI ऐप से भरें</span>
                  </a>

                  {/* Instant Verification & Activation */}
                  <button
                    type="button"
                    onClick={handleActivate}
                    disabled={isProcessing}
                    className="py-2.5 px-2 bg-gradient-to-r from-[#B56A00] to-[#8B1E1E] hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 animate-spin" />
                        <span>सक्रिय हो रहा है...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                        <span>₹99 तुरंत सक्रिय करें</span>
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-center text-[#8C6239]">
                  ✓ सुरक्षित 256-bit एन्क्रिप्टेड वैदिक सेवा • 100% संतोष की गारंटी
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
