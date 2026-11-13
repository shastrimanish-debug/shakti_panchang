import React, { useState } from 'react';
import { MessageCircle, Phone, Sparkles, X, ShieldCheck, Award } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const pickL = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [selectedService, setSelectedService] = useState<'chat' | 'call'>('chat');
  const [userQuery, setUserQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEntitled) {
      onTriggerSubscription(
        pickL(
          'विशेषज्ञ ज्योतिषी से सीधे परामर्श और व्हाट्सएप चैट हेतु सदस्यता सक्रिय करें।',
          'Activate your membership for direct consultation and WhatsApp chat with our expert astrologer.',
          'નિષ્ણાત જ્યોતિષી સાથે સીધા પરામર્શ અને વોટ્સએપ ચેટ માટે સભ્યપદ સક્રિય કરો.'
        )
      );
      return;
    }
    setSubmitted(true);
    const phone = '';
    const defaultMsg = pickL(
      'मेरी जन्मपत्रिका व जीवन के संबंध में मार्गदर्शन प्रदान करें।',
      'Please provide guidance regarding my birth chart and life path.',
      'મારી જન્મકુંડળી અને જીવન અંગે માર્ગદર્શન આપવા વિનંતી.'
    );
    const prefix = pickL(
      'प्रणाम आचार्य जी! शक्ति पंचांग ऐप से परामर्श हेतु:',
      'Pranam Acharya Ji! Consultation request from Shakti Panchang App:',
      'પ્રણામ આચાર્ય જી! શક્તિ પંચાંગ એપમાંથી પરામર્શ માટે:'
    );
    const text = encodeURIComponent(`${prefix}\n\n${userQuery || defaultMsg}`);
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF2E4] dark:bg-[#2A1508] border-2 border-amber-600/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-[#5C3A21] dark:text-[#FAF2E4]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-500/20 text-[#5C3A21] dark:text-amber-300 transition"
          aria-label={pickL('बंद करें', 'Close', 'બંધ કરો')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-granth text-[#462B17] dark:text-amber-200">
              {pickL('आचार्य परामर्श केंद्र', 'Acharya Consultation Center', 'આચાર્ય પરામર્શ કેન્દ્ર')}
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">
              {pickL('सीधे विद्वान ज्योतिषाचार्य जी से जुड़ें', 'Connect directly with a learned Vedic Astrologer', 'વિદ્વાન જ્યોતિષાચાર્ય જી સાથે સીધા જોડાઓ')}
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
                <span>{pickL('व्हाट्सएप चैट', 'WhatsApp Chat', 'વોટ્સએપ ચેટ')}</span>
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
                <span>{pickL('फोन कॉल', 'Phone Call', 'ફોન કોલ')}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1.5">
                {pickL('अपनी समस्या या प्रश्न लिखें:', 'Write your question or concern:', 'તમારી સમસ્યા કે પ્રશ્ન લખો:')}
              </label>
              <textarea
                rows={3}
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder={pickL(
                  'उदा: विवाह मुहूर्त, करियर में बाधा, या कुंडली मिलान के संबंध में...',
                  'e.g.: Marriage Muhurat, career obstacles, or Kundali matching...',
                  'દા.ત.: લગ્ન મુહૂર્ત, કારકિર્દી અવરોધ કે કુંડળી મિલાન અંગે...'
                )}
                className="w-full rounded-2xl border border-amber-600/40 bg-white dark:bg-stone-900 p-3 text-sm text-[#5C3A21] dark:text-[#FAF2E4] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 bg-amber-100/70 dark:bg-stone-900/80 rounded-2xl border border-amber-500/30 flex items-center gap-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                {pickL(
                  'सदस्यता धारकों हेतु यह परामर्श सेवा पूरी तरह निःशुल्क एवं प्राथमिकता प्राप्त है।',
                  'This consultation service is complimentary and prioritized for subscribed members.',
                  'સભ્યપદ ધારકો માટે આ પરામર્શ સેવા સંપૂર્ણ નિઃશુલ્ક અને પ્રાથમિકતા ધરાવે છે.'
                )}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5C3A21] to-[#381E0C] text-[#FAF2E4] font-black shadow-xl hover:brightness-110 transition flex items-center justify-center gap-2 border border-amber-500/40"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>{pickL('आचार्य जी से सीधे कनेक्ट करें', 'Connect Directly with Acharya Ji', 'આચાર્ય જી સાથે સીધા જોડાઓ')}</span>
            </button>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-lg animate-bounce">
              ✓
            </div>
            <h3 className="text-lg font-bold text-[#462B17] dark:text-amber-200">
              {pickL('WhatsApp पर कनेक्ट किया जा रहा है...', 'Connecting on WhatsApp...', 'WhatsApp પર કનેક્ટ થઈ રહ્યું છે...')}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              {pickL(
                'यदि व्हाट्सएप स्वतः न खुले, तो कृपया हमारे आधिकारिक नंबर पर सीधा संदेश भेजें।',
                'If WhatsApp does not open automatically, please send a direct message to our official number.',
                'જો વોટ્સએપ આપમેળે ન ખુલે, તો કૃપા કરીને અમારા સત્તાવાર નંબર પર સીધો સંદેશ મોકલો.'
              )}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
            >
              {pickL('वापस जाएं', 'Go Back', 'પાછા જાઓ')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
