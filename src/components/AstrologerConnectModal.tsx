import React, { useState } from 'react';
import { MessageCircle, Phone, Sparkles, X, ShieldCheck, Award } from 'lucide-react';

interface AstrologerConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEntitled: boolean;
  onTriggerSubscription: (reason: string) => void;
}

export const AstrologerConnectModal: React.FC<AstrologerConnectModalProps> = ({
  isOpen,
  onClose,
  isEntitled,
  onTriggerSubscription,
}) => {
  const [selectedService, setSelectedService] = useState<'chat' | 'call'>('chat');
  const [userQuery, setUserQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEntitled) {
      onTriggerSubscription("विशेषज्ञ ज्योतिषी से सीधे परामर्श और व्हाट्सएप चैट हेतु वार्षिक सदस्यता सक्रिय करें।");
      return;
    }
    setSubmitted(true);
    // Open WhatsApp with prefilled message to Pandit Manish Shastri
    const phone = "919876543210"; // Placeholder for Acharya Manish Shastri
    const text = encodeURIComponent(`प्रणाम आचार्य जी! शक्ति पंचांग ऐप से परामर्श हेतु:\n\n${userQuery || 'मेरी जन्मपत्रिका व जीवन के संबंध में मार्गदर्शन प्रदान करें।'}`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF2E4] dark:bg-[#2A1508] border-2 border-amber-600/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-[#5C3A21] dark:text-[#FAF2E4]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-500/20 text-[#5C3A21] dark:text-amber-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-granth text-[#462B17] dark:text-amber-200">
              आचार्य परामर्श केंद्र
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">
              सीधे आचार्य मनीष शास्त्री जी से जुड़ें
            </p>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleConnect} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedService('chat')}
                className={`py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition ${
                  selectedService === 'chat'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                    : 'bg-white/60 dark:bg-stone-900/60 border-amber-500/30 text-[#5C3A21] dark:text-amber-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>व्हाट्सएप चैट</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedService('call')}
                className={`py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition ${
                  selectedService === 'call'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                    : 'bg-white/60 dark:bg-stone-900/60 border-amber-500/30 text-[#5C3A21] dark:text-amber-200'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>फोन कॉल</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1.5">
                अपनी समस्या या प्रश्न लिखें:
              </label>
              <textarea
                rows={3}
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="उदा: विवाह मुहूर्त, करियर में बाधा, या कुंडली मिलान के संबंध में..."
                className="w-full rounded-2xl border border-amber-600/40 bg-white dark:bg-stone-900 p-3 text-sm text-[#5C3A21] dark:text-[#FAF2E4] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 bg-amber-100/70 dark:bg-stone-900/80 rounded-2xl border border-amber-500/30 flex items-center gap-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>वार्षिक सदस्यता धारकों हेतु यह परामर्श सेवा पूरी तरह निःशुल्क एवं प्राथमिकता प्राप्त है।</span>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5C3A21] to-[#381E0C] text-[#FAF2E4] font-black shadow-xl hover:brightness-110 transition flex items-center justify-center gap-2 border border-amber-500/40"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>आचार्य जी से सीधे कनेक्ट करें</span>
            </button>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg animate-bounce">
              ✓
            </div>
            <h3 className="text-lg font-bold text-[#462B17] dark:text-amber-200">
              WhatsApp पर कनेक्ट किया जा रहा है...
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              यदि व्हाट्सएप स्वतः न खुले, तो कृपया हमारे आधिकारिक नंबर पर सीधा संदेश भेजें।
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
            >
              वापस जाएं
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
