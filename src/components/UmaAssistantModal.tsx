import React, { useState, useEffect, useRef } from 'react';
import { VedicPanchangData, KundaliData } from '../types';
import { DISHASHOOL_MAP, TRAVEL_REMEDIES } from '../services/disha';
import { getDayChoghadiya, getCurrentChoghadiya, getInauspiciousWindows } from '../services/choghadiya';
import {
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'uma';
  text: string;
  timestamp: Date;
  actionPayload?: {
    type: 'open_panchang' | 'open_choghadiya' | 'open_kundali' | 'open_yatra';
    label: string;
  };
}

interface UmaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchang: VedicPanchangData;
  activeKundali: KundaliData | null;
  onNavigateTab?: (tabId: string) => void;
  isAudioEnabled?: boolean;
  locationName?: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'समस्त जिज्ञासा' },
  { id: 'muhurat', label: 'मुहूर्त व राहुकाल' },
  { id: 'vivah', label: 'विवाह व संस्कार' },
  { id: 'yatra', label: 'यात्रा व दिशाशूल' },
  { id: 'kundali', label: 'कुंडली व दशा' },
  { id: 'upay', label: 'सात्विक उपाय' },
];

const SUGGESTIONS_MAP: Record<string, string[]> = {
  all: [
    'आज का राहुकाल और चौघड़िया बताओ',
    'क्या आज कोई नया कार्य प्रारंभ करना शुभ है?',
    'आज यात्रा किस दिशा में न करें?',
    'विवाह विचार व शुभ लग्न',
    'मेरी कुंडली में वर्तमान दशा और प्रभाव',
    'ग्रह शांति व कष्ट निवारण के सात्विक उपाय',
  ],
  muhurat: [
    'आज का राहुकाल कब से कब तक है?',
    'आज के अमृत और शुभ चौघड़िया समय',
    'आज गृह प्रवेश का मुहूर्त है या नहीं?',
    'आज नया वाहन क्रय करने का समय',
  ],
  vivah: [
    'विवाह हेतु आज की तिथि व नक्षत्र की अनुकूलता',
    'विवाह में गुरु और शुक्र के बल का विचार',
    'कुंडली में नाड़ी व भकूट दोष का प्रभाव',
  ],
  yatra: [
    'आज किस दिशा में दिशाशूल है?',
    'दिशाशूल का सात्विक परिहार क्या है?',
    'आज की यात्रा हेतु शुभ समय बताओ',
  ],
  kundali: [
    'मेरी कुंडली के मुख्य ग्रह योग बताओ',
    'वर्तमान विंशोत्तरी महादशा का फल',
    'चंद्र राशि और लग्न के अनुसार इष्टदेव कौन हैं?',
  ],
  upay: [
    'सूर्य देव को अर्घ्य देने की शास्त्रीय विधि',
    'मानसिक शान्ति व स्वास्थ्य हेतु महामृत्युंजय जप',
    'व्यापार वृद्धि और धन लाभ के वैदिक उपाय',
    'गौ-सेवा और दीप दान का धार्मिक महत्व',
  ],
};

export const UmaAssistantModal: React.FC<UmaAssistantModalProps> = ({
  isOpen,
  onClose,
  panchang,
  activeKundali,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'uma',
      text: `॥ श्री गणेशाय नमः ॥\nप्रणाम! मैं उमा (UMA) हूँ — आपकी वैदिक ग्रन्थ एवं पंचांग मार्गदर्शिका। आज ${panchang.weekday}, ${panchang.paksha} ${panchang.tithi} तिथि है। आप मुझसे शुभ मुहूर्त, राहुकाल, चौघड़िया, यात्रा दिशाशूल, विवाह विचार, जन्म कुंडली एवं ग्रह शांति के उपाय शुद्ध हिन्दी में पूछ सकते हैं।`,
      timestamp: new Date(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Stop TTS voice on close
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है। कृपया टाइप करें।');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'hi-IN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
        }
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (playingVoiceId === id) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*_#•]/g, '').replace(/\n+/g, '। ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);

    setPlayingVoiceId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateOfflineResponse = (query: string): { text: string; actionPayload?: ChatMessage['actionPayload'] } => {
    const q = query.toLowerCase().trim();
    const weekday = panchang.date.getDay();
    const formatT = (d: Date) =>
      d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

    if (q.includes('राहु') || q.includes('rahu') || q.includes('अशुभ समय')) {
      const inauspicious = getInauspiciousWindows(panchang.solar, weekday);
      const rahu = inauspicious.find((w) => w.title === 'राहु काल');
      return {
        text: `॥ ॐ श्री गणेशाय नमः ॥\nशास्त्रानुसार आज ${panchang.weekday} को राहु काल ${
          rahu ? `प्रातः ${formatT(rahu.start)} से ${formatT(rahu.end)} तक` : 'प्रभावी'
        } रहेगा।\n\n**वैदिक सिद्धांत व परिहार:**\nराहु काल को तमोगुणी एवं विघ्नकारक वेला माना गया है। इस कालखंड में कोई भी नवीन व्यापार, गृह प्रवेश, स्वर्ण-रजत क्रय, विवाह वार्ता अथवा दूरस्थ यात्रा का श्रीगणेश न करें। यदि कोई कार्य इस समय अपरिहार्य हो, तो भगवान शिव के पंचाक्षरी मंत्र 'ॐ नमः शिवाय' का 108 बार मानसिक जप करें अथवा श्री हनुमान चालीसा का पाठ कर जल ग्रहण करके ही अग्रसर हों।`,
        actionPayload: { type: 'open_choghadiya', label: 'चौघड़िया तालिका देखें' },
      };
    }

    if (q.includes('चौघड़िया') || q.includes('शुभ समय') || q.includes('choghadiya')) {
      const dayChoghadiyas = getDayChoghadiya(panchang.solar, weekday);
      const { current, remainingMinutes } = getCurrentChoghadiya(dayChoghadiyas);
      const amritList = dayChoghadiyas
        .filter((c) => ['Amrit', 'Shubh', 'Labh'].includes(c.name))
        .map((c) => `• ${c.hindiName}: ${formatT(c.start)} से ${formatT(c.end)} तक`)
        .join('\n');

      const currStr = current
        ? `वर्तमान में **${current.hindiName}** चौघड़िया चल रहा है (लगभग ${remainingMinutes} मिनट शेष)।\n\n`
        : '';

      return {
        text: `॥ ॐ नमः शिवाय ॥\n${currStr}आज के प्रमुख शुभ व फलदायी चौघड़िया कालखंड इस प्रकार हैं:\n${amritList}\n\n**शास्त्रोक्त परामर्श:**\nअमृत चौघड़िया समस्त कार्यों की सिद्धि हेतु सर्वोत्तम है। शुभ चौघड़िया में विद्या, धार्मिक अनुष्ठान व क्रय-विक्रय उत्तम रहता है, तथा लाभ चौघड़िया में व्यापारिक समझौते व धन-निवेश अति फलदायी सिद्ध होते हैं।`,
        actionPayload: { type: 'open_choghadiya', label: 'सम्पूर्ण चौघड़िया चक्र' },
      };
    }

    if (q.includes('यात्रा') || q.includes('दिशाशूल') || q.includes('travel')) {
      const shoolDir = DISHASHOOL_MAP[weekday];
      const remedy = TRAVEL_REMEDIES[weekday];
      return {
        text: `॥ ॐ नमो भगवते वासुदेवाय ॥\nआज ${panchang.weekday} होने के कारण **${shoolDir}** दिशा में दिशाशूल का वास है।\n\n**शास्त्र निर्देश:**\nऋषियों का मत है कि जिस दिशा में शूल हो, उस दिशा की ओर मुख कर नई यात्रा का प्रारंभ नहीं करना चाहिए।\n\n**सात्विक परिहार:**\nयदि यात्रा अत्यावश्यक व टाली न जा सके, तो प्रस्थान से पूर्व: **${remedy}**। इसके उपरांत पूर्व दिशा की ओर पाँच पग चलकर अपने गंतव्य की ओर अग्रसर हों, यात्रा मंगलमय होगी।`,
        actionPayload: { type: 'open_yatra', label: 'यात्रा कैलकुलेटर देखें' },
      };
    }

    if (q.includes('पंचांग') || q.includes('तिथि') || q.includes('नक्षत्र')) {
      return {
        text: `॥ श्री गणेशाय नमः ॥\nआज का विशुद्ध वैदिक पंचांग विवरण:\n• **संवत्सर:** ${panchang.samvat} (शक संवत्: ${panchang.sakaSamvat})\n• **वार व तिथि:** ${panchang.weekday}, ${panchang.paksha} की **${panchang.tithi}** तिथि\n• **नक्षत्र:** **${panchang.nakshatra}** (चरण ${panchang.pada})\n• **योग:** **${panchang.yoga}** | **करण:** **${panchang.karana}**\n• **सूर्य व चंद्र राशि:** सूर्य देव **${panchang.solarRashi}** में तथा चंद्र देव **${panchang.lunarRashi}** में विराजमान हैं।\n• **सौर समय:** सूर्योदय प्रातः ${formatT(panchang.solar.sunrise)} एवं सूर्यास्त सायं ${formatT(panchang.solar.sunset)}।\n\nयह दिन धर्म-कर्म, अध्ययन, सात्विक उपासना एवं सद्कार्यों के चिंतन हेतु अत्यंत प्रशस्त है।`,
        actionPayload: { type: 'open_panchang', label: 'विस्तृत पंचांग पटल' },
      };
    }

    if (q.includes('कुंडली') || q.includes('दशा') || q.includes('ग्रह योग')) {
      if (activeKundali) {
        return {
          text: `॥ ॐ गुरवे नमः ॥\n**जातक:** ${activeKundali.name}\n• **लग्न राशि:** ${activeKundali.lagnaRashi}\n• **चंद्र राशि:** ${activeKundali.moonRashi} (${activeKundali.nakshatra})\n• **वर्तमान विंशोत्तरी महादशा:** ${activeKundali.mahadasha}\n• **अंतर्दशा:** ${activeKundali.antardasha}\n\n**ज्योतिषीय फलकथन:**\nलग्न एवं चंद्र राशि की युति जातक को प्रखर बुद्धि व सात्विक चेतना प्रदान करती है। वर्तमान महादशा में इष्टदेव का पूजन व नित्य गायत्री मंत्र अथवा अपने इष्ट मंत्र का जाप करने से कार्यों में निर्विघ्न प्रगति होगी।`,
          actionPayload: { type: 'open_kundali', label: 'सम्पूर्ण जन्म कुण्डली चक्र' },
        };
      }
      return {
        text: `॥ ॐ गुरवे नमः ॥\nवैदिक ज्योतिष में जन्म कुण्डली जातक के पूर्वार्जित कर्मों और ग्रहीय संरेखण का दिव्य दर्पण है। कुण्डली का अवलोकन करने हेतु ऊपर 'जन्म कुंडली' टैब में जाकर अपनी जन्म विवरण भरें अथवा सहेजी गई प्रोफाइल का चयन करें।`,
        actionPayload: { type: 'open_kundali', label: 'जन्म कुंडली बनाएँ' },
      };
    }

    return {
      text: `॥ शुभम् भवतु ॥\nआपकी जिज्ञासा के संदर्भ में शास्त्र सम्मत विचार:\nवैदिक सनातन परम्परा में कोई भी शुभ कार्य करते समय तिथि, वार, नक्षत्र, योग और करण (पञ्चाङ्ग) की शुद्धि अनिवार्य मानी गई है।\n\nआज का दिन ${panchang.weekday}, ${panchang.paksha} ${panchang.tithi} तिथि और ${panchang.nakshatra} नक्षत्र से युक्त है। अपने इष्टदेव का स्मरण कर, गुरु व माता-पिता का आशीर्वाद लेकर किया गया कार्य सदैव कल्याणकारी सिद्ध होता है।`,
    };
  };

  const handleSubmit = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    const text = queryText.trim();
    setInputQuery('');

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Attempt backend call to /api/uma-chat if server is alive
      const panchangCtx = `वार: ${panchang.weekday}, तिथि: ${panchang.paksha} ${panchang.tithi}, नक्षत्र: ${panchang.nakshatra}, संवत्: ${panchang.samvat}`;
      const kundaliCtx = activeKundali
        ? `जातक: ${activeKundali.name}, लग्न: ${activeKundali.lagnaRashi}, चंद्र: ${activeKundali.moonRashi}, महादशा: ${activeKundali.mahadasha}`
        : 'सामान्य';

      let answer = '';
      let actionPayload: ChatMessage['actionPayload'] | undefined;

      try {
        const res = await fetch('/api/uma-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: text,
            panchangContext: panchangCtx,
            kundaliContext: kundaliCtx,
            chatHistory: messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text })),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.answer) {
            answer = data.answer;
          }
        }
      } catch {
        // Handled by offline fallback
      }

      if (!answer) {
        const offlineResult = generateOfflineResponse(text);
        answer = offlineResult.text;
        actionPayload = offlineResult.actionPayload;
      }

      const umaMsg: ChatMessage = {
        id: `uma_${Date.now() + 1}`,
        sender: 'uma',
        text: answer,
        timestamp: new Date(),
        actionPayload,
      };

      setMessages((prev) => [...prev, umaMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `uma_err_${Date.now()}`,
          sender: 'uma',
          text: '॥ क्षम्यताम् ॥ उत्तर तैयार करने में तकनीकी व्यवधान आया। कृपया पुनः प्रयास करें।',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = SUGGESTIONS_MAP[activeCategory] || SUGGESTIONS_MAP.all;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full shadow-2xl flex flex-col transition-all duration-300 ${
          isExpanded ? 'h-[98vh] max-w-[96vw]' : 'h-[92vh] max-h-[720px] max-w-4xl'
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5C1414] via-[#7A1D1D] to-[#5C1414] text-[#FAF2E4] p-3 sm:p-4 flex items-center justify-between border-b-2 border-[#B58738] shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B58738] to-[#734A1B] border-2 border-[#FAF2E4] flex items-center justify-center text-[#FAF2E4] font-bold text-lg shadow-inner">
              ॐ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold font-granth tracking-wide text-[#FFD88A]">
                  उमा (UMA) वैदिक ग्रन्थ AI
                </span>
                <span className="text-[10px] bg-[#B58738] px-2 py-0.5 rounded text-[#2C0A0A] font-black uppercase tracking-wider shadow-xs">
                  भोजपत्र दर्शन
                </span>
              </div>
              <p className="text-xs text-[#E6C687] hidden sm:block font-serif">
                सनातन पराविद्या, मुहूर्त निर्णय, ज्योतिष संहिता एवं पंचांग ज्ञानकोष
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 text-xs text-[#E6C687] hover:text-white border border-[#B58738]/50 rounded-lg hidden sm:block cursor-pointer"
            >
              {isExpanded ? 'सामान्य आकार' : 'विस्तृत आकार'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#E6C687] hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shloka Sub-banner */}
        <div className="bg-[#F4E8D1] py-1.5 px-3 sm:px-6 flex items-center justify-between text-xs text-[#5C3A21] font-semibold border-b border-[#8C6239]/20">
          <div className="flex items-center gap-2">
            <span className="text-[#8F2121] font-bold">॥ ॐ ॥</span>
            <span className="font-serif italic truncate">
              शुभम् करोति कल्याणम् आरोग्यम् धनसंपदा | शत्रुबुद्धि विनाशाय दीपज्योतिर्नमोऽस्तुते ||
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-[#735133]">
            <span>{panchang.weekday}</span>
            <span>•</span>
            <span>
              {panchang.paksha} {panchang.tithi}
            </span>
            <span>•</span>
            <span>{panchang.nakshatra}</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-[#EBDCC0] px-3 py-2 overflow-x-auto flex items-center gap-1.5 border-b border-[#8C6239]/30">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-serif whitespace-nowrap transition cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#7A1D1D] text-[#FAF2E4] font-bold shadow-xs'
                  : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#F4E8D1] border border-[#8C6239]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Suggested Question Chips */}
        <div className="bg-[#FAF2E4] p-2 overflow-x-auto flex items-center gap-1.5 border-b border-[#8C6239]/20">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(sug)}
              className="px-2.5 py-1 bg-[#F4E8D1] hover:bg-[#EBDCC0] border border-[#8C6239]/30 rounded-lg text-xs font-serif text-[#5C3A21] whitespace-nowrap transition flex items-center gap-1 group cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#B56A00] group-hover:scale-110 transition" />
              <span>{sug}</span>
            </button>
          ))}
        </div>

        {/* Messages List Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-[#FAF2E4]">
          {messages.map((msg) => {
            const isUma = msg.sender === 'uma';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUma ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}
              >
                {isUma && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#7A1D1D] to-[#4A1010] text-[#FAF2E4] border-2 border-[#B58738] flex items-center justify-center shrink-0 text-sm font-bold shadow-md mt-1">
                    ॐ
                  </div>
                )}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-4 sm:p-5 relative ${
                    isUma
                      ? 'bg-[#FFFDF8] border-2 border-[#8C6239]/30 text-[#3E2714] shadow-md'
                      : 'bg-gradient-to-r from-[#7A1D1D] to-[#8F2121] text-[#FAF2E4] border border-[#B58738] shadow-md font-serif ml-6'
                  }`}
                >
                  {isUma && (
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#8C6239]/20 text-xs text-[#735133]">
                      <div className="flex items-center gap-1.5 font-serif font-bold text-[#8F2121]">
                        <span>॥</span>
                        <span>अथ उमा दिव्य निर्णयः</span>
                        <span>॥</span>
                      </div>
                      <span className="text-[11px] text-[#8C6239]">
                        {msg.timestamp.toLocaleTimeString('hi-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  <div className="font-serif text-sm sm:text-base leading-relaxed tracking-wide whitespace-pre-line select-text">
                    {msg.text}
                  </div>

                  {/* Navigation Action Buttons */}
                  {msg.actionPayload && onNavigateTab && (
                    <div className="mt-3 pt-2.5 border-t border-[#8C6239]/20 flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          if (msg.actionPayload?.type === 'open_panchang') onNavigateTab('panchang');
                          if (msg.actionPayload?.type === 'open_choghadiya') onNavigateTab('choghadiya');
                          if (msg.actionPayload?.type === 'open_kundali') onNavigateTab('kundali');
                          if (msg.actionPayload?.type === 'open_yatra') onNavigateTab('yatra');
                        }}
                        className="text-xs font-bold text-[#7A1D1D] hover:text-[#5C1414] hover:underline flex items-center gap-1 bg-[#F4E8D1] px-3 py-1.5 rounded-lg border border-[#8C6239]/30 cursor-pointer"
                      >
                        <span>{msg.actionPayload.label}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Voice / Copy Controls */}
                  {isUma && (
                    <div className="mt-3 pt-2.5 border-t border-[#8C6239]/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          className={`px-2.5 py-1 rounded-md border flex items-center gap-1 transition cursor-pointer ${
                            playingVoiceId === msg.id
                              ? 'bg-[#7A1D1D] text-white border-[#7A1D1D]'
                              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDCC0] border-[#8C6239]/40'
                          }`}
                          title="हिन्दी में सुनें"
                        >
                          {playingVoiceId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>वाणी बंद</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-[#7A1D1D]" />
                              <span>वाणी श्रवण</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1 text-[#8C6239] hover:text-[#5C3A21] rounded transition cursor-pointer"
                          title="प्रतिलिपि बनाएँ (Copy)"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[11px] text-[#8C6239] italic">॥ शुभम् भवतु ॥</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-150">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7A1D1D] text-[#FAF2E4] border-2 border-[#B58738] flex items-center justify-center shrink-0 text-sm font-bold shadow-md">
                ॐ
              </div>
              <div className="bg-[#FFFDF8] border-2 border-[#8C6239]/30 rounded-xl p-4 max-w-md shadow-md flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#7A1D1D] border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="text-xs sm:text-sm font-serif font-bold text-[#7A1D1D]">
                    उमा नक्षत्र, ग्रह गोचर व ग्रन्थों का अवलोकन कर रही हैं...
                  </p>
                  <p className="text-[11px] text-[#735133] font-serif">
                    ॥ ॐ सूर्याय नमः • ॐ चं चंद्राय नमः ॥
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-[#F4E8D1] p-3 border-t-2 border-[#8C6239]/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 sm:p-3 rounded-xl transition shadow-xs cursor-pointer ${
                isListening
                  ? 'bg-rose-700 text-white animate-pulse'
                  : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#EBDCC0] border border-[#8C6239]/40'
              }`}
              title={isListening ? 'सुनना बंद करें' : 'हिन्दी में बोलकर पूछें'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#7A1D1D]" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="उमा से शुद्ध हिन्दी में कोई भी शंका या मुहूर्त पूछें..."
              className="flex-1 bg-[#FFFDF8] border-2 border-[#8C6239]/40 focus:border-[#7A1D1D] rounded-xl px-3.5 py-2.5 text-xs sm:text-base font-serif text-[#3E2714] placeholder:text-[#8C6239]/70 outline-none shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] disabled:opacity-40 hover:from-[#5C1414] hover:to-[#4A1010] text-[#FAF2E4] font-bold rounded-xl transition shadow-md flex items-center gap-1.5 text-xs sm:text-sm font-serif cursor-pointer"
            >
              <span>पूछें</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
