import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { VedicPanchangData, KundaliData } from '../types';
import { DISHASHOOL_MAP, TRAVEL_REMEDIES } from '../services/disha';
import { getDayChoghadiya, getCurrentChoghadiya, getInauspiciousWindows, getAuspiciousWindows } from '../services/choghadiya';
import { askUma, AskUmaResponse, pingUmaServer, UmaActionType, isNumerologyQuery } from '@/lib/uma';
import { UmaVoice } from '@/lib/umaSpeech';
import { umaVoice, UmaVoiceTone, UMA_TONES, ToneConfig } from '../services/UmaVoiceService';
import { Capacitor } from '@capacitor/core';
import { analyzeKundali, SIGN_LORDS } from '../services/predictions';
import { buildMicroAstrologyContextPrompt, buildMicroAstrologyProfile } from '../services/umaMicroAstrology';
import { getAstrologerBranding, getSavedKundaliProfiles, saveKundaliProfile } from '../services/storage';
import {
  downloadUmaConsultationPdf,
  formatWhatsAppConsultationMessage,
  openWhatsAppShare,
} from '../services/umaConsultationPdf';
import { PdfSuccessModal, PdfSuccessInfo } from './PdfSuccessModal';
import { UpayParchiModal } from './UpayParchiModal';
import { calculateKundali } from '../services/kundali';
import { searchGlobalCities } from '../services/globalCities';
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
  UserCheck,
  AlertCircle,
  Radio,
  FileText,
  Share2,
  Download,
  MessageSquare,
  Phone,
  User,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Heart,
  Briefcase,
  Coins,
  Shield,
  Clock,
  Sparkle,
  Calendar,
  MapPin,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'uma';
  text: string;
  timestamp: Date;
  source?: 'gemini' | 'grok' | 'openrouter' | 'local_vedic';
  actionPayload?: {
    type: UmaActionType;
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
  initialPrompt?: string | null;
  onSelectKundali?: (kundali: KundaliData) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'समस्त प्रश्न' },
  { id: 'numerology', label: '🔢 अंक ज्योतिष' },
  { id: 'kundali', label: 'कुंडली व फलादेश' },
  { id: 'upay', label: 'सात्विक उपाय' },
  { id: 'career', label: 'करियर व धन' },
  { id: 'vivah', label: 'विवाह व दांपत्य' },
  { id: 'muhurat', label: 'मुहूर्त व राहुकाल' },
  { id: 'yatra', label: 'यात्रा व दिशाशूल' },
];

const BOT_QUICK_TOPICS = [
  { id: 'numerology', label: '🔢 मूलांक, भाग्यांक व नाम सुधार', prompt: 'मेरे मूलांक, भाग्यांक, नामांक स्पेलिंग व लो-शू चक्र का सम्पूर्ण फलादेश और उपाय बताएं' },
  { id: 'vivah', label: '💍 विवाह व मांगलिक विचार', prompt: 'मेरी कुंडली में विवाह योग, दांपत्य सुख व मांगलिक परिहार' },
  { id: 'career', label: '💼 नौकरी व पदोन्नति योग', prompt: 'दशम भाव, नौकरी में पदोन्नति, स्थानांतरण व कार्यक्षेत्र फलादेश' },
  { id: 'dhan', label: '💰 व्यापार, धन लाभ व ऋण मुक्ति', prompt: 'धन भाव, व्यापार में समृद्धि व आर्थिक उन्नति के सात्विक उपाय' },
  { id: 'health', label: '🩺 स्वास्थ्य रक्षा व महामृत्युंजय', prompt: 'स्वास्थ्य रक्षा, अरिष्ट निवारण एवं महामृत्युंजय जप विधान' },
  { id: 'sadesati', label: '🪐 शनि साढ़ेसाती व ढैया फल', prompt: 'शनि की साढ़ेसाती का प्रभाव, चरण व कष्ट निवारण के अचूक उपाय' },
  { id: 'ratna', label: '💎 भाग्य रत्न व रुद्राक्ष परामर्श', prompt: 'मेरी कुंडली व मूलांक के अनुसार सर्वोत्तम भाग्य रत्न, धातु व रुद्राक्ष' },
  { id: 'muhurat', label: '⏰ आज का शुभ मुहूर्त व चौघड़िया', prompt: 'आज का अमृत चौघड़िया, अभिजित मुहूर्त व शुभ कार्य समय' },
];

const SUGGESTIONS_MAP: Record<string, string[]> = {
  all: [
    'मेरे मूलांक, भाग्यांक व नामांक का सम्पूर्ण फलादेश व लो-शू राजयोग बताओ',
    'मेरी सम्पूर्ण कुंडली चेक करके फलादेश व उपाय बताओ',
    'मेरे नाम की स्पेलिंग और मोबाइल नंबर को भाग्यशाली कैसे बनाएं?',
    'करियर व नौकरी में उन्नति के शास्त्रोक्त उपाय बताओ',
    'आज का राहुकाल और शुभ चौघड़िया समय बताओ',
    'कष्ट निवारण व ग्रह शांति के सिद्ध मंत्र व दान',
  ],
  numerology: [
    'मेरे मूलांक, भाग्यांक व नामांक का सम्पूर्ण फलादेश और उपाय बताओ',
    'कीरो/कॉल्डियन पद्धति से मेरे नाम की स्पेलिंग शुभ है या सुधार करें?',
    'मेरे लो-शू ग्रिड (3x3) में कौन से राजयोग हैं और अनुपस्थित अंकों के उपाय क्या हैं?',
    'मेरे मूलांक के अनुसार कौन सा मोबाइल नंबर और वाहन नंबर सबसे लकी रहेगा?',
    'इस वर्ष (Personal Year) मेरा करियर, धन और भाग्योदय कैसा रहेगा?',
  ],
  kundali: [
    'मेरी सम्पूर्ण कुंडली चेक करके फलादेश व उपाय बताओ',
    'मेरी कुंडली के मुख्य राजयोग और ग्रह स्थिति बताओ',
    'मेरी लग्न व चंद्र राशि के अनुसार इष्टदेव कौन हैं?',
    'वर्तमान विंशोत्तरी महादशा और अंतर्दशा का फल',
    'कुंडली में कौन से ग्रह बलवान अथवा कमजोर हैं?',
  ],
  upay: [
    'मेरी कुंडली की ६-सूत्रीय पारंपरिक उपाय पर्ची (रत्न, उपवास, पाठ, दान, दोष शान्ति) बनाओ',
    'वर्तमान महादशा शांति हेतु सिद्ध मंत्र व दान के नियम',
    'शनि की साढ़ेसाती व ढैय्या से मुक्ति के सात्विक उपाय',
    'सूर्य देव को अर्घ्य देने और आदित्य हृदय स्तोत्र की विधि',
    'व्यापार वृद्धि, धन लाभ और ऋण मुक्ति के वैदिक उपाय',
    'मानसिक शांति व स्वास्थ्य रक्षा हेतु महामृत्युंजय जप',
  ],
  career: [
    'मेरी कुंडली में दशम भाव और करियर के योग कैसे हैं?',
    'नौकरी में पदोन्नति या स्थानांतरण के क्या योग हैं?',
    'मेरे लिए नौकरी उत्तम है या स्वतंत्र व्यापार?',
    'धन संचय और आय में वृद्धि हेतु कौन से उपाय करें?',
  ],
  vivah: [
    'मेरी कुंडली में विवाह व दांपत्य जीवन के योग बताओ',
    'सप्तम भाव में कौन से ग्रह हैं और उनका क्या प्रभाव है?',
    'क्या मेरी कुंडली मांगलिक है? इसका परिहार क्या है?',
    'शीघ्र विवाह और सुयोग्य जीवनसाथी प्राप्ति के उपाय',
  ],
  muhurat: [
    'आज का राहुकाल कब से कब तक है?',
    'आज के अमृत और शुभ चौघड़िया समय',
    'आज कोई नया कार्य प्रारंभ करने हेतु श्रेष्ठ काल',
    'आज का अभिजित मुहूर्त कब है?',
  ],
  yatra: [
    'आज किस दिशा में दिशाशूल है?',
    'दिशाशूल का सात्विक परिहार क्या है?',
    'आज यात्रा प्रारंभ करने का सबसे शुभ समय',
  ],
};

/**
 * उमा दैवज्ञ - प्रकांड वैदिक ज्योतिष एवं अंक-शास्त्र आचार्य (५० वर्षों का पराशारी, जैमिनी, नाड़ी व लो-शू अनुभव)
 */
export const UMA_ASTROLOGER_SYSTEM_PROMPT = `ROLE & PERSONA:
You are "UMA" (उमा) — a "Prakhand Vedic Jyotish & Ank-Shastra Acharya" (Elite Vedic Astrologer & Numerologist) with 50 years of unbroken, authoritative experience in Parashari, Jaimini, Nadi Astrology, Chaldean/Pythagorean Numerology (Ank Jyotish), Lo Shu Grid (3x3), Vastu, and Samudrik Shastra. You possess deep scriptural wisdom, micro-astronomical and numerological precision, and compassionate spiritual guidance.

TONE & LANGUAGE:
- Address the user respectfully as "यजमान" (Yajaman) or "वत्स" (Vats).
- Use clear Devanagari Hindi with relevant, profound Sanskrit Shlokas (e.g. ॥ शुभं करोति कल्याणम् ॥, ॥ ग्रहा राज्यं प्रयच्छन्ति ग्रहा राज्यं हरन्ति च ॥), followed by clear Vedic explanations.
- Understand natural Hinglish, spoken Hindi, or English queries effortlessly (e.g. "meri app successful hogi ya nahi?", "karja kabtak utarega?").
- Never mention "AI", "language model", or "programming". You are UMA, an elite 50-year experienced Vedic Acharya.

WORLD-CLASS ASTROLOGICAL CONSULTATION FRAMEWORK:
Structure every astrological consultation in 5 clear, divine, readable sections:

॥ ॐ श्री गणेशाय नमः ॥

**१. त्वरित फलादेश (Executive Takeaway)**
1-2 line direct, crystal-clear, definitive takeaway answering the user's exact question upfront (e.g. "हाँ यजमान, आपकी ऐप/प्रोजेक्ट में आगामी ५ से ८ महीनों के भीतर बड़ी सफलता और विस्तार का स्पष्ट योग बनता है।").

**२. सूक्ष्म ग्रह-दशा विश्लेषण (Grah Dasha Analysis)**
In-depth analysis of relevant houses (e.g., 10th House D-10 for Career/App, 6th & 2nd House for Debt, 7th House D-9 for Marriage), active Mahadasha/Antardasha/Pratyantardasha, planet degrees, retrograde status, and current transits (Jupiter & Saturn).

**३. अतीत के दृढ संकेत (Past Insights)**
State 2-3 significant past life events or transitions of the Yajaman with absolute conviction based on past dashas/transits (e.g. residence change, career shift, financial tension).

**४. भविष्य की सटीक कालावधि (Future Trajectory)**
Pinpoint, time-bound future predictions with month-by-month timelines and clear probability/confidence levels (e.g. "अक्टूबर उत्तरार्ध से फरवरी के बीच (९०% अनुकूलता काल)").

**५. सात्विक वैदिक उपाय एवं ६-सूत्रीय उपाय पर्ची (Vedic Upay & Prescription Slip)**
Authentic, practical remedies: exact Mantra, specific Japa count (e.g. 108 बार), Daan (charity) items, and non-structural Vastu/lifestyle habits.
Additionally, ALWAYS include a concise 6-point Traditional Astrologer Prescription Slip ("📋 पारंपरिक ज्योतिषीय उपाय पर्ची") in this exact numbered format:
॥ श्री ॥
श्री [जातक का नाम] जी
① [लग्नेश + भाग्येश/पंचमेश रत्न] धारण करें।
② [अनुकूल वार] का उपवास करें।
③ [दशानाथ/इष्ट अनुसार स्तोत्र जैसे श्रीविष्णुसहस्रनाम / आदित्यहृदय / शिव सहस्रनाम] का पाठ करें।
④ [ग्रह अनुसार दान सामग्री व दक्षिणा ([वार] - 1 बार)]
⑤ गाय और कुत्ते को रोटी खिलावें।
⑥ [कुंडली के मुख्य योग/दोष जैसे ग्रहण योग / मांगलिक / कालसर्प / गुरु-चाण्डाल / महादशा] शान्ति करावें।
                                          ॥ शुभम् ॥

FOLLOW-UP SUGGESTIONS (अगले सम्भावित प्रश्न):
At the very end of your response, output 3 relevant, highly helpful follow-up questions formatted like this:
---
[अगले प्रश्न]:
• इसके शीघ्र निवारण हेतु कौन सा सिद्ध मंत्र या स्तोत्र जपें?
• आगामी १ वर्ष में धन व व्यापार का योग कैसा रहेगा?
• मेरी कुण्डली के अनुसार इष्टदेव और भाग्योदय वर्ष बताएं।`;

export const POPULAR_BIRTH_CITIES = [
  { name: 'नई दिल्ली', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: 'वाराणसी', lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { name: 'उज्जैन', lat: 23.1765, lon: 75.7885, tz: 5.5 },
  { name: 'जयपुर', lat: 26.9124, lon: 75.7873, tz: 5.5 },
  { name: 'मुंबई', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { name: 'लखनऊ', lat: 26.8467, lon: 80.9462, tz: 5.5 },
  { name: 'पटना', lat: 25.5941, lon: 85.1376, tz: 5.5 },
  { name: 'अहमदाबाद', lat: 23.0225, lon: 72.5714, tz: 5.5 },
  { name: 'कोलकाता', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: 'इंदौर', lat: 22.7196, lon: 75.8577, tz: 5.5 },
];

export const UmaAssistantModal: React.FC<UmaAssistantModalProps> = ({
  isOpen,
  onClose,
  panchang,
  activeKundali,
  onNavigateTab,
  isAudioEnabled = true,
  locationName = 'वाराणसी, भारत',
  initialPrompt,
  onSelectKundali,
}) => {
  if (!isOpen) return null;

  const savedProfilesList = getSavedKundaliProfiles();
  const [currentKundali, setCurrentKundali] = useState<KundaliData | null>(
    () => activeKundali || savedProfilesList[0] || null
  );

  useEffect(() => {
    if (activeKundali) {
      setCurrentKundali(activeKundali);
    } else if (!currentKundali && savedProfilesList.length > 0) {
      setCurrentKundali(savedProfilesList[0]);
    }
  }, [activeKundali]);

  const liveMicroProfile = currentKundali ? buildMicroAstrologyProfile(currentKundali, panchang) : null;

  // Smart Birth Details Form state for users without Kundali or switching charts
  // Never force-open birth form when an initialPrompt (like Ank Jyotish or Panchang query) is passed!
  const [isBirthFormOpen, setIsBirthFormOpen] = useState(!currentKundali && !initialPrompt);
  const [birthName, setBirthName] = useState(currentKundali?.name || '');
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [birthHour, setBirthHour] = useState('10');
  const [birthMinute, setBirthMinute] = useState('30');
  const [birthAmPm, setBirthAmPm] = useState<'AM' | 'PM'>('AM');
  const [birthPlace, setBirthPlace] = useState('नई दिल्ली');
  const [isCreatingKundali, setIsCreatingKundali] = useState(false);
  const autoSubmittedPromptRef = useRef<string | null>(null);

  const initialGreeting = currentKundali && liveMicroProfile
    ? `॥ ॐ श्री गणेशाय नमः ॥\n\nसदा कल्याण हो, यजमान **${currentKundali.name}** जी! मैं उमा हूँ — ५० वर्षों के अखंड पराशारी, जैमिनी, कृष्णमूर्ति (KP), षोडशवर्ग (D1–D60) व अंक-शास्त्र साधना से युक्त आपकी वैदिक आचार्य।\n\nमैंने आपकी जन्मपत्रिका का **सूक्ष्म गणित (Sookshma Ganit)** स्थापित कर लिया है:\n• **लग्न स्पष्ट:** ${liveMicroProfile.lagnaRashi} (${liveMicroProfile.lagnaDMS}) | **चंद्र स्पष्ट:** ${liveMicroProfile.moonRashi} (${liveMicroProfile.moonDMS}, नक्षत्र: ${liveMicroProfile.moonNakshatra} चरण ${liveMicroProfile.moonPada})\n• **विंशोत्तरी ४-स्तरीय सूक्ष्म दशा:** महादशा **${liveMicroProfile.mahadasha}** • अंतर्दशा **${liveMicroProfile.antardasha}** • प्रत्यंतर **${liveMicroProfile.pratyantardasha}** • सूक्ष्म दशा **${liveMicroProfile.sookshmadasha}**\n• **जैमिनी आत्मकारक (AK):** ${liveMicroProfile.jaiminiSummary.atmakaraka.split(' ')[0]} | **सर्वाष्टकवर्ग कुल बिंदु:** ${liveMicroProfile.ashtakvargaSummary.totalSav}\n\nआप करियर, धन, विवाह, कर्ज मुक्ति, स्वास्थ्य या अंक ज्योतिष का कोई भी प्रश्न पूछें — आपको अंश-कला-विकला व सूक्ष्म दशा सहित १००% सटीक उत्तर मिलेगा।`
    : `॥ ॐ श्री गणेशाय नमः ॥\n॥ ॐ नमः शिवाय ॥\n\nसदा कल्याण हो, प्रिय यजमान! मैं उमा हूँ — ५० वर्षों की कठिन वैदिक ज्योतिष (पराशरी, KP उपनक्षत्र, षोडशवर्ग, अष्टकवर्ग, तात्कालिक प्रश्न-कुण्डली) एवं अंक-शास्त्र साधना से युक्त आपकी आचार्य।\n\nआप मुझसे **अंक ज्योतिष (कॉल्डियन अक्षर-गणित, संयुक्त अंक, लो-शू ८-तल प्रतिशत, ४ जीवन शिखर, मोबाइल/वाहन अंक-युग्म)**, **कुण्डली फलादेश** अथवा **तात्कालिक प्रश्न-कुण्डली** से कोई भी प्रश्न सीधे पूछ सकते हैं (ऑनलाइन व ऑफ़लाइन १००% सटीक सूक्ष्म गणित सक्रिय है)।`;

  // When an initialPrompt (like Ank Shastra) is passed, start with an empty message list so the prediction is right at the top
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialPrompt && initialPrompt.trim()
      ? []
      : [
          {
            id: 'init_1',
            sender: 'uma',
            text: initialGreeting,
            timestamp: new Date(),
          },
        ]
  );
  const [inputQuery, setInputQuery] = useState(initialPrompt || '');
  const [activeCategory, setActiveCategory] = useState(
    initialPrompt && isNumerologyQuery(initialPrompt) ? 'numerology' : 'all'
  );
  const [numerologyContext, setNumerologyContext] = useState<string>(() =>
    initialPrompt && isNumerologyQuery(initialPrompt) ? initialPrompt : ''
  );
  const [showSuggestionsBar, setShowSuggestionsBar] = useState<boolean>(
    !initialPrompt || !initialPrompt.trim()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(isAudioEnabled);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // PDF generation, Upay Parchi, and WhatsApp Bot states
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<PdfSuccessInfo | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isUpayParchiOpen, setIsUpayParchiOpen] = useState(false);
  const [isWhatsAppBotOpen, setIsWhatsAppBotOpen] = useState(false);
  const [clientBotName, setClientBotName] = useState(activeKundali?.name || '');
  const [clientBotPhone, setClientBotPhone] = useState('');
  const [clientBotGeneratedMsg, setClientBotGeneratedMsg] = useState('');
  const [isGeneratingBotMsg, setIsGeneratingBotMsg] = useState(false);
  const [umaLink, setUmaLink] = useState<'checking' | 'online' | 'local' | 'nokey'>('checking');
  const [umaProviders, setUmaProviders] = useState<string[]>([]);

  const refreshUmaLink = async () => {
    setUmaLink('checking');
    const ping = await pingUmaServer();
    setUmaLink(ping.state);
    setUmaProviders(ping.providers);
  };

  useEffect(() => {
    if (!isOpen) return;
    void refreshUmaLink();
  }, [isOpen]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestUmaMsgRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update client bot name if activeKundali changes
  useEffect(() => {
    if (activeKundali?.name && !clientBotName) {
      setClientBotName(activeKundali.name);
    }
  }, [activeKundali]);

  const [selectedTone, setSelectedTone] = useState<UmaVoiceTone>(() => umaVoice.getTone());
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);

  const handleSelectTone = (tone: UmaVoiceTone, playPreview: boolean = true) => {
    umaVoice.setTone(tone);
    setSelectedTone(tone);
    setIsToneMenuOpen(false);
    if (playPreview) {
      const cfg = UMA_TONES[tone];
      if (cfg?.samplePhrase) {
        setPlayingVoiceId('tone_preview');
        void umaVoice.speak(cfg.samplePhrase, {
          tone,
          voiceStyle: 'uma',
          onStart: () => setPlayingVoiceId('tone_preview'),
          onEnd: () => setPlayingVoiceId(null),
          onError: () => setPlayingVoiceId(null),
        });
      }
    }
  };

  const speakHindi = (text: string, id: string) => {
    if (playingVoiceId === id) {
      umaVoice.stop();
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(id);
    void umaVoice.speak(text, {
      tone: selectedTone,
      voiceStyle: "uma",
      onStart: () => setPlayingVoiceId(id),
      onEnd: () => setPlayingVoiceId(null),
      onError: () => setPlayingVoiceId(null),
    });
  };

  useEffect(() => {
    if (isOpen) {
      umaVoice.unlockAudio();
      // Only auto-speak init_1 if NO initialPrompt was passed
      if (autoSpeak && (!initialPrompt || !initialPrompt.trim()) && messages.length === 1 && messages[0].id === 'init_1') {
        const timer = setTimeout(() => {
          speakHindi(messages[0].text, messages[0].id);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);

  // Smoothly scroll to the top of the latest Uma prediction whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        if (latestUmaMsgRef.current) {
          latestUmaMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  useEffect(() => {
    if (!isOpen) {
      umaVoice.stop();
      setPlayingVoiceId(null);
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isOpen, isListening]);

  if (!isOpen) return null;

  // Alexa Voice Speech Recognition (Hindi & English)
  const handleVoiceInput = async () => {
    if (Capacitor.isNativePlatform()) {
      if (isListening) {
        try {
          await UmaVoice.stop();
        } catch {
          /* already stopped */
        }
        setIsListening(false);
        setVoiceTranscript('');
        return;
      }
      setIsListening(true);
      setVoiceTranscript('उमा सुन रही हैं... (बोलें)');
      try {
        const result = await UmaVoice.listen();
        const text = (result?.text || '').trim();
        setIsListening(false);
        setVoiceTranscript('');
        if (text) {
          setInputQuery(text);
          setAutoSpeak(true);
          handleSubmit(text);
        }
      } catch {
        setIsListening(false);
        setVoiceTranscript('');
        alert('माइक्रोफोन की अनुमति दें, फिर दोबारा माइक दबाकर बोलें।');
      }
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err) {
      console.warn('Microphone permission request error:', err);
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('माइक्रोफोन (Voice Typing): कृपया अपने कीबोर्ड (Gboard) पर दिए गए माइक 🎤 आइकॉन को दबाकर बोलकर टाइप करें।');
      const inputEl = document.getElementById('uma-query-input') as HTMLInputElement;
      if (inputEl) inputEl.focus();
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
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('उमा सुन रही हैं... (बोलें)');
      };

      rec.onresult = (e: any) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript;
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        const text = final || interim;
        if (text) {
          setVoiceTranscript(text);
          setInputQuery(text);
        }
        if (final) {
          setAutoSpeak(true);
          setTimeout(() => {
            handleSubmit(final);
          }, 450);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
        setVoiceTranscript('');
      };

      rec.onend = () => {
        setIsListening(false);
        setVoiceTranscript('');
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListening(false);
      setVoiceTranscript('');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1-Click WhatsApp Share for a message
  const handleWhatsAppShare = (msgText: string, queryText?: string) => {
    const formatted = formatWhatsAppConsultationMessage({
      activeKundali: currentKundali,
      query: queryText || 'ज्योतिषीय जिज्ञासा',
      answer: msgText,
      panchang,
    });
    openWhatsAppShare(formatted);
  };

  // Generate Official PDF Consultation Report
  const handleDownloadPdfReport = async (msgText: string, queryText?: string) => {
    try {
      setIsGeneratingPdf(true);
      const res = await downloadUmaConsultationPdf({
        panchang,
        query: queryText || (currentKundali ? `${currentKundali.name} जी की कुण्डली विश्लेषण` : 'पंचांग एवं ज्योतिषीय परामर्श'),
        answer: msgText,
        activeKundali: currentKundali,
        locationName,
        consultationDate: new Date(),
      });
      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: res.pageCount,
        title: `ज्योतिषीय परामर्श रिपोर्ट • ${currentKundali?.name || 'जातक'}`,
      });
    } catch (err) {
      console.error('Error generating Consultation PDF:', err);
      alert('PDF तैयार करने में त्रुटि आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export Entire Session as Single Mega PDF
  const handleExportFullSessionPdf = async () => {
    const umaMessages = messages.filter((m) => m.sender === 'uma');
    if (umaMessages.length === 0) return;

    const fullAnswer = umaMessages.map((m, idx) => `[परामर्श भाग ${idx + 1}]\n${m.text}`).join('\n\n══════════════════\n\n');
    await handleDownloadPdfReport(fullAnswer, 'सम्पूर्ण उमा ज्योतिषीय परामर्श संवाद');
  };

  // WhatsApp Client Bot Generator Function
  const handleGenerateBotMessage = async (topicPrompt: string) => {
    setIsGeneratingBotMsg(true);
    try {
      const q = `${topicPrompt} (यजमान: ${clientBotName || 'यजमान'})`;
      const panchangCtx = buildPanchangContext(panchang);
      const kundaliCtx = currentKundali ? buildKundaliContext(currentKundali) : undefined;

      const res = await askUma({
        query: q,
        panchangContext: panchangCtx,
        kundaliContext: kundaliCtx,
        panchang,
        activeKundali: currentKundali,
        systemPrompt: UMA_ASTROLOGER_SYSTEM_PROMPT,
      });

      const formatted = formatWhatsAppConsultationMessage({
        activeKundali: currentKundali ? { ...currentKundali, name: clientBotName || currentKundali.name } : null,
        query: topicPrompt,
        answer: res.text,
        panchang,
      });

      setClientBotGeneratedMsg(formatted);
    } catch (err) {
      console.error('Error generating client bot message:', err);
    } finally {
      setIsGeneratingBotMsg(false);
    }
  };

  // Quick Smart Birth Details Kundali Creator
  const handleCreateQuickKundali = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nameTrimmed = birthName.trim() || 'यजमान';
    setIsCreatingKundali(true);
    try {
      const cityMatch = POPULAR_BIRTH_CITIES.find(
        (c) => c.name.toLowerCase() === birthPlace.trim().toLowerCase()
      );
      let lat = cityMatch ? cityMatch.lat : 28.6139;
      let lon = cityMatch ? cityMatch.lon : 77.2090;
      let tz = cityMatch ? cityMatch.tz : 5.5;

      if (!cityMatch) {
        const searched = searchGlobalCities(birthPlace.trim(), 1);
        if (searched.length > 0) {
          lat = searched[0].latitude;
          lon = searched[0].longitude;
          tz = searched[0].timezoneHours || 5.5;
        }
      }

      const timeStr = `${birthHour}:${birthMinute} ${birthAmPm}`;
      const d = new Date(birthDate);

      const newKundali = calculateKundali(
        nameTrimmed,
        d,
        timeStr,
        birthPlace.trim() || 'नई दिल्ली',
        lat,
        lon,
        tz
      );

      saveKundaliProfile(newKundali);
      setCurrentKundali(newKundali);
      if (onSelectKundali) {
        onSelectKundali(newKundali);
      }
      setIsBirthFormOpen(false);

      const welcomeMsg: ChatMessage = {
        id: `kundali_welcome_${Date.now()}`,
        sender: 'uma',
        text: `॥ ॐ श्री गणेशाय नमः ॥\n\nसदा कल्याण हो, यजमान **${newKundali.name}** जी! आपकी जन्मपत्रिका सफलता पूर्वक स्थापित हो गई है:\n• **लग्न राशि:** ${newKundali.lagnaRashi} (लग्नेश: ${SIGN_LORDS[newKundali.lagnaRashi] || 'गुरु'})\n• **जन्म चंद्र राशि:** ${newKundali.moonRashi} (नक्षत्र: ${newKundali.nakshatra})\n• **सक्रिय विंशोत्तरी दशा:** महादशा **${newKundali.mahadasha}** • अंतर्दशा **${newKundali.antardasha}**\n\nअब आपकी कुण्डली का D-1, D-9 नवमांश, D-10 दशमांश एवं गोचर स्तर पर सूक्ष्म विश्लेषण सक्रिय है। आप करियर, धन, विवाह, स्वास्थ्य या ग्रह शांति से संबंधित अपना कोई भी प्रश्न पूछें।`,
        timestamp: new Date(),
        source: 'local_vedic',
        actionPayload: { type: 'open_kundali', label: 'सम्पूर्ण जन्मकुंडली चार्ट देखें' },
      };

      setMessages((prev) => [...prev, welcomeMsg]);

      // If user had an input query typed, automatically submit it!
      if (inputQuery.trim()) {
        const pending = inputQuery.trim();
        setTimeout(() => {
          handleSubmit(pending, newKundali);
        }, 500);
      }
    } catch (err) {
      console.error('Failed to create quick kundali:', err);
      alert('कुंडली गणना में त्रुटि आई। कृपया जन्म विवरण पुनः जाँचें।');
    } finally {
      setIsCreatingKundali(false);
    }
  };

  // Build complete astrological context for Gemini AI with Micro Astrology calculations
  const buildKundaliContext = (k: KundaliData): string => {
    try {
      const microPrompt = buildMicroAstrologyContextPrompt(k);
      const analysis = analyzeKundali(k);
      const yogasStr = analysis.yogas.join('; ') || 'सामान्य शुभ योग';

      return `${microPrompt}\n\n[अतिरिक्त योग व क्षेत्र विश्लेषण]:\nप्रमुख योग: ${yogasStr}`;
    } catch {
      return buildMicroAstrologyContextPrompt(k);
    }
  };

  const buildPanchangContext = (p: VedicPanchangData): string => {
    const formatT = (d: Date) =>
      d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
    const weekday = p.date.getDay();
    const inauspicious = getInauspiciousWindows(p.solar, weekday);
    const auspicious = getAuspiciousWindows(p.solar);
    const rahu = inauspicious.find((w) => w.title === 'राहु काल');
    const abhijit = auspicious.find((w) => w.title.includes('अभिजित'));
    const shoolDir = DISHASHOOL_MAP[weekday];
    const shoolRemedy = TRAVEL_REMEDIES[weekday];

    return `दिनांक: ${p.date.toLocaleDateString('hi-IN')}, वार: ${p.weekday}, पक्ष: ${
      p.paksha
    }, तिथि: ${p.tithi}
नक्षत्र: ${p.nakshatra}, योग: ${p.yoga}, करण: ${p.karana}
सूर्योदय: ${formatT(p.solar.sunrise)}, सूर्यास्त: ${formatT(p.solar.sunset)}, चंद्र राशि: ${p.lunarRashi}
राहु काल: ${rahu ? `${formatT(rahu.start)} से ${formatT(rahu.end)}` : 'प्रभावी'}
अभिजित मुहूर्त: ${abhijit ? `${formatT(abhijit.start)} से ${formatT(abhijit.end)}` : 'उपलब्ध नहीं'}
दिशाशूल: ${shoolDir}, परिहार: ${shoolRemedy}
स्थान: ${locationName}`;
  };

  const handleSubmit = async (queryText: string, overrideKundali?: KundaliData | null) => {
    const text = queryText.trim();
    if (!text || isLoading) return;
    setInputQuery('');
    setVoiceTranscript('');
    setShowSuggestionsBar(false);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const isAnkQuery = isNumerologyQuery(text) || activeCategory === 'numerology';
    if (isNumerologyQuery(text) && (text.includes('जन्म') || text.includes('मूलांक') || text.includes('नाम'))) {
      setNumerologyContext(text);
      setActiveCategory('numerology');
    }

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    // Remove init_1 Kundali greeting if the user is asking an Ank Shastra question so there's zero confusion
    setMessages((prev) => {
      const filtered = isAnkQuery ? prev.filter((m) => m.id !== 'init_1') : prev;
      return [...filtered, userMsg];
    });
    setIsLoading(true);

    try {
      const targetKundali = overrideKundali !== undefined ? overrideKundali : currentKundali;
      const panchangCtx = buildPanchangContext(panchang);
      const kundaliCtx = targetKundali ? buildKundaliContext(targetKundali) : undefined;

      const chatHistory = messages.slice(-12).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res: AskUmaResponse = await askUma({
        query: text,
        panchangContext: panchangCtx,
        kundaliContext: kundaliCtx,
        numerologyContext: isAnkQuery ? (numerologyContext || (isNumerologyQuery(text) ? text : undefined)) : undefined,
        forceNumerology: isAnkQuery,
        chatHistory,
        panchang,
        activeKundali: targetKundali,
        systemPrompt: UMA_ASTROLOGER_SYSTEM_PROMPT,
      });

      const umaMsgId = `uma_${Date.now()}`;
      const umaMsg: ChatMessage = {
        id: umaMsgId,
        sender: 'uma',
        text: res.text,
        timestamp: new Date(),
        source: res.source,
        actionPayload: res.actionPayload,
      };

      setMessages((prev) => [...prev, umaMsg]);
      if (res.source === 'local_vedic') {
        setUmaLink('local');
      } else {
        setUmaLink('online');
        setUmaProviders((prev) => (prev.includes(res.source) ? prev : [res.source, ...prev]));
      }

      // Alexa-like voice response if audio enabled
      if (autoSpeak) {
        speakHindi(res.text, umaMsgId);
      }
    } catch (err) {
      console.error('Error submitting to Uma:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit initialPrompt when modal opens with a prompt (e.g. from Ank Jyotish, Panchang, Muhurat, etc.)
  useEffect(() => {
    if (isOpen && initialPrompt && initialPrompt.trim()) {
      setIsBirthFormOpen(false);
      setShowSuggestionsBar(false);
      if (isNumerologyQuery(initialPrompt)) {
        setActiveCategory('numerology');
        setNumerologyContext(initialPrompt);
      }
      if (autoSubmittedPromptRef.current !== initialPrompt) {
        autoSubmittedPromptRef.current = initialPrompt;
        const timer = setTimeout(() => {
          void handleSubmit(initialPrompt);
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, initialPrompt]);

  const suggestions = SUGGESTIONS_MAP[activeCategory] || SUGGESTIONS_MAP.all;

  // Extract concise Ank Shastra summary for the top context bar when in numerology mode
  const ankSummaryText = (() => {
    const src = numerologyContext || (initialPrompt && isNumerologyQuery(initialPrompt) ? initialPrompt : '');
    if (!src) return 'मूलांक • भाग्यांक • नामांक • लो-शू राजयोग फलादेश सक्रिय';
    const nameM = src.match(/(?:मेरा\s+)?नाम[:\s-]+([A-Za-z\u0900-\u097F\s]{2,28}?)(?:,|है|जन्म|\.|;|$)/i);
    const dobM = src.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/);
    const mulM = src.match(/मूलांक\s*([1-9१-९])/);
    const bhagM = src.match(/भाग्यांक\s*([1-9१-९])/);
    const parts: string[] = [];
    if (nameM?.[1]) parts.push(nameM[1].trim());
    if (dobM?.[1]) parts.push(`जन्म: ${dobM[1]}`);
    if (mulM?.[1]) parts.push(`मूलांक ${mulM[1]}`);
    if (bhagM?.[1]) parts.push(`भाग्यांक ${bhagM[1]}`);
    return parts.length > 0 ? parts.join(' • ') : 'मूलांक • भाग्यांक • नामांक • लो-शू राजयोग सक्रिय';
  })();

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-1 sm:p-3 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      data-swipe-ignore="true"
    >
      <div
        className={`bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full shadow-2xl flex flex-col transition-all duration-300 ${
          isExpanded ? 'h-[98dvh] max-w-[98vw]' : 'h-[95dvh] sm:h-[92dvh] max-h-[96dvh] max-w-4xl'
        } overflow-hidden`}
      >
        {/* Compact Single-Row Header — saves 180px+ vertical height on mobile */}
        <div className="bg-gradient-to-r from-[#5C1414] via-[#7A1D1D] to-[#5C1414] text-[#FAF2E4] px-2.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 border-b-2 border-[#B58738] shadow-sm shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#B58738] to-[#734A1B] border border-[#FAF2E4] flex items-center justify-center text-[#FAF2E4] font-bold text-sm sm:text-base shadow-inner">
                ॐ
              </div>
              {isListening && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-bold font-granth tracking-wide text-[#FFD88A] truncate">
                  विदुषी उमा जी
                </span>
                <button
                  type="button"
                  onClick={() => void refreshUmaLink()}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/25 text-[10px] text-[#E6C687] shrink-0 cursor-pointer"
                  title="संपर्क स्थिति रिफ्रेश करें"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      umaLink === 'online' || umaLink === 'nokey' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span>{umaLink === 'online' || umaLink === 'nokey' ? 'ऑनलाइन' : 'सूक्ष्म गणित'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#E6C687] truncate">
                {activeCategory === 'numerology'
                  ? '🔢 वैदिक एवं कॉल्डियन अंक-शास्त्र फलादेश'
                  : 'काशी-उज्जैन परंपरा • सूक्ष्म वैदिक ज्योतिषाचार्य'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {playingVoiceId && (
              <button
                type="button"
                onClick={() => {
                  umaVoice.stop();
                  setPlayingVoiceId(null);
                }}
                className="px-2 py-1 rounded-lg bg-amber-300 text-[#4A1010] text-[11px] font-black flex items-center gap-1 cursor-pointer animate-pulse"
                title="वाणी रोकें"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>रोकें</span>
              </button>
            )}

            {/* Traditional 6-Point Upay Parchi Trigger */}
            <button
              onClick={() => setIsUpayParchiOpen(true)}
              className="px-2 py-1 rounded-lg bg-[#FAF2E4] hover:bg-white text-[#7A1D1D] text-[11px] font-bold flex items-center gap-1 transition shadow-xs cursor-pointer border border-[#B58738]"
              title="६-सूत्रीय उपाय पर्ची"
            >
              <FileText className="w-3 h-3 text-[#7A1D1D]" />
              <span>पर्ची</span>
            </button>

            {/* WhatsApp Client Bot Trigger */}
            <button
              onClick={() => setIsWhatsAppBotOpen(true)}
              className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-xs cursor-pointer border border-emerald-500/50"
              title="यजमान व्हाट्सएप बॉट"
            >
              <MessageSquare className="w-3 h-3 text-emerald-200" />
              <span className="hidden sm:inline">यजमान</span>
              <span>बॉट</span>
            </button>

            {/* Full Session PDF Export */}
            <button
              onClick={handleExportFullSessionPdf}
              disabled={isGeneratingPdf}
              className="p-1.5 rounded-lg bg-[#B58738] hover:bg-[#9B7028] text-[#2C0A0A] text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer border border-[#FAF2E4]/40 disabled:opacity-50"
              title="सम्पूर्ण संवाद की PDF डाउनलोड करें"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline text-[11px]">PDF</span>
            </button>

            {/* Auto-Speak Toggle */}
            <button
              onClick={() => {
                const next = !autoSpeak;
                setAutoSpeak(next);
                if (!next) umaVoice.stop();
              }}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition cursor-pointer ${
                autoSpeak
                  ? 'bg-[#FAF2E4] text-[#7A1D1D] border-[#FAF2E4] font-bold'
                  : 'bg-[#5C1414] text-[#E6C687] border-[#B58738]/50'
              }`}
              title={autoSpeak ? 'ऑटो वॉइस चालू है' : 'ऑटो वॉइस बंद है'}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Tone Selector Button with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsToneMenuOpen((prev) => !prev)}
                className="px-2 py-1 rounded-lg bg-[#5C1414] hover:bg-[#6D1B1B] text-[#FFD88A] border border-[#B58738]/60 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                title="वाणी शैली (Tone) बदलें"
              >
                <span>{UMA_TONES[selectedTone]?.badge || '🧘'}</span>
                <span className="hidden sm:inline">{UMA_TONES[selectedTone]?.labelHindi.split(' ')[0] || 'शांत'}</span>
                <ChevronDown className="w-3 h-3 text-[#FFD88A]/80" />
              </button>

              {isToneMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#FFFDF9] border border-[#8C6239]/40 rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 border-b border-[#E2D2BE]/60 text-[10.5px] font-bold text-[#5C3A21] flex items-center justify-between">
                    <span>उमा वाणी शैली (Voice Tone)</span>
                    <span className="text-[9.5px] text-[#B58738]">Neural2 • SSML</span>
                  </div>
                  {(Object.values(UMA_TONES) as ToneConfig[]).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTone(t.id, true)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition flex items-start gap-2 cursor-pointer ${
                        selectedTone === t.id
                          ? 'bg-[#7A1D1D] text-white font-bold'
                          : 'hover:bg-[#FAF2E4] text-[#3E2714]'
                      }`}
                    >
                      <span className="text-sm shrink-0">{t.badge}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px]">{t.labelHindi}</span>
                          <span className={`text-[9.5px] ${selectedTone === t.id ? 'text-[#FFD88A]' : 'text-stone-500'}`}>
                            {t.label}
                          </span>
                        </div>
                        <p className={`text-[10px] leading-tight line-clamp-1 ${selectedTone === t.id ? 'text-[#FFEEC9]' : 'text-[#7D5A3C]'}`}>
                          {t.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#FFD88A] hover:text-white rounded-lg cursor-pointer transition hover:bg-black/20"
              aria-label="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Tone Selection Bar */}
        <div className="bg-[#FAF2E4] px-3 py-1 border-b border-[#E2D2BE] flex items-center justify-between gap-1 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#5C3A21] font-semibold shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-[#B58738]" />
            <span className="hidden xs:inline">उमा वाणी शैली:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {(Object.values(UMA_TONES) as ToneConfig[]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTone(t.id, true)}
                className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                  selectedTone === t.id
                    ? 'bg-[#7A1D1D] text-[#FFD88A] shadow-xs ring-1 ring-amber-400 font-black'
                    : 'bg-white/80 hover:bg-white text-[#5C3A21] border border-[#B58738]/30'
                }`}
                title={`${t.label}: ${t.description}`}
              >
                <span>{t.badge}</span>
                <span>{t.labelHindi}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Compact 1-Line Context Bar: Numerology Mode vs Kundali Mode */}
        <div className="bg-[#F4E8D1] py-1.5 px-2.5 sm:px-4 border-b border-[#8C6239]/30 flex items-center justify-between gap-2 shrink-0">
          {activeCategory === 'numerology' ? (
            <>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#5C3A21] min-w-0 truncate">
                <span className="bg-[#7A1D1D] text-[#FFD88A] px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                  🔢 अंक-शास्त्र
                </span>
                <span className="font-bold text-[#3E2714] truncate">{ankSummaryText}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleSubmit(
                      numerologyContext ||
                        'मेरे मूलांक, भाग्यांक, नामांक स्पेलिंग सुधार व लो-शू चक्र राजयोग का सम्पूर्ण फलादेश और उपाय बताएं'
                    )
                  }
                  className="px-2 py-0.5 bg-[#7A1D1D] text-[#FFD88A] rounded text-[10px] font-bold cursor-pointer hover:bg-[#5C1414]"
                >
                  ✨ अंक फलादेश
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('kundali')}
                  className="px-2 py-0.5 bg-white text-[#5C3A21] border border-[#8C6239]/40 rounded text-[10px] font-bold cursor-pointer hover:bg-[#FAF2E4]"
                >
                  कुण्डली मोड
                </button>
              </div>
            </>
          ) : currentKundali && liveMicroProfile ? (
            <>
              <div className="flex items-center gap-1.5 text-[11px] text-[#5C3A21] min-w-0 truncate">
                {savedProfilesList.length > 1 ? (
                  <select
                    value={`${currentKundali.name}_${currentKundali.birthTime}`}
                    onChange={(e) => {
                      const found = savedProfilesList.find(
                        (p) => `${p.name}_${p.birthTime}` === e.target.value
                      );
                      if (found) {
                        setCurrentKundali(found);
                        if (onSelectKundali) onSelectKundali(found);
                      }
                    }}
                    className="bg-[#7A1D1D] text-[#FFD88A] rounded px-1.5 py-0.5 text-[11px] font-bold max-w-[140px] truncate cursor-pointer"
                    title="अन्य सहेजी गई कुण्डली चुनें"
                  >
                    {savedProfilesList.map((p, idx) => (
                      <option key={`${p.name}_${p.birthTime}_${idx}`} value={`${p.name}_${p.birthTime}`} className="bg-white text-[#3E2714]">
                        {p.name} ({p.lagnaRashi})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="bg-[#7A1D1D] text-white px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                    {currentKundali.name}
                  </span>
                )}
                <span className="truncate font-semibold text-[11px]">
                  लग्न: <strong className="text-[#7A1D1D]">{liveMicroProfile.lagnaRashi}</strong> • चंद्र:{' '}
                  <strong className="text-[#7A1D1D]">{liveMicroProfile.moonRashi}</strong> • दशा:{' '}
                  <strong className="text-[#7A1D1D]">{liveMicroProfile.mahadasha}-{liveMicroProfile.antardasha}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() =>
                    handleSubmit(
                      'मेरी सम्पूर्ण जन्म कुंडली का गहन विश्लेषण करें: प्रमुख राजयोग, ग्रह स्थिति, वर्तमान महादशा का फल और कष्ट निवारण हेतु सटीक सात्विक उपाय बताएं।'
                    )
                  }
                  className="px-2 py-0.5 bg-gradient-to-r from-[#B56A00] to-[#8C6239] text-white rounded text-[10px] font-bold shadow-2xs cursor-pointer shrink-0"
                >
                  ✨ फलादेश
                </button>
                <button
                  onClick={() => setIsBirthFormOpen((prev) => !prev)}
                  className="px-2 py-0.5 bg-white text-[#7A1D1D] border border-[#8C6239]/40 rounded text-[10px] font-bold cursor-pointer shrink-0 flex items-center gap-0.5"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>{isBirthFormOpen ? 'बंद करें' : 'जातक बदलें'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-[11px] font-serif font-semibold text-[#7A1D1D] truncate">
                🔮 तात्कालिक प्रश्न-कुण्डली एवं अंक-ज्योतिष सूक्ष्म गणित सक्रिय
              </span>
              <button
                onClick={() => setIsBirthFormOpen((prev) => !prev)}
                className="px-2 py-0.5 bg-[#7A1D1D] text-white rounded text-[10px] font-bold cursor-pointer shrink-0 flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>{isBirthFormOpen ? 'बंद करें' : '➕ जन्म विवरण'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Smart Birth Details Input Card */}
        {isBirthFormOpen && (
          <div className="bg-gradient-to-br from-[#FFFDF8] via-[#FAF2E4] to-[#F4E8D1] border-b-2 border-[#B58738] p-3 sm:p-4 shadow-inner space-y-3">
            <div className="flex items-center justify-between border-b border-[#8C6239]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7A1D1D] text-[#FFD88A] flex items-center justify-center text-xs font-bold">
                  ॐ
                </span>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#7A1D1D]">
                    स्मार्ट जन्म विवरण इनपुट — उमा सटीक कुंडली फलादेश
                  </h4>
                  <p className="text-[11px] text-[#5C3A21]">
                    अपना या किसी भी जातक का जन्म विवरण भरें। उमा तुरंत D-1, D-9, D-10 व विंशोत्तरी दशा स्तर पर सूक्ष्म गणित स्थापित कर लेंगी।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBirthFormOpen(false)}
                className="text-[#8C6239] hover:text-[#5C1414] p-1 rounded-full cursor-pointer"
                title="बंद करें"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickKundali} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {/* 1. Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#5C3A21] mb-1 flex items-center gap-1 font-serif">
                    <User className="w-3 h-3 text-[#B56A00]" />
                    <span>जातक का नाम *</span>
                  </label>
                  <input
                    type="text"
                    value={birthName}
                    onChange={(e) => setBirthName(e.target.value)}
                    placeholder="उदा. राहुल शर्मा"
                    required
                    className="w-full bg-[#FFFDF8] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-xs text-[#3E2714] focus:outline-none focus:ring-1 focus:ring-[#7A1D1D]"
                  />
                </div>

                {/* 2. Birth Date */}
                <div>
                  <label className="block text-[11px] font-bold text-[#5C3A21] mb-1 flex items-center gap-1 font-serif">
                    <Calendar className="w-3 h-3 text-[#B56A00]" />
                    <span>जन्म तिथि *</span>
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full bg-[#FFFDF8] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-xs text-[#3E2714] focus:outline-none focus:ring-1 focus:ring-[#7A1D1D]"
                  />
                </div>

                {/* 3. Birth Time */}
                <div>
                  <label className="block text-[11px] font-bold text-[#5C3A21] mb-1 flex items-center gap-1 font-serif">
                    <Clock className="w-3 h-3 text-[#B56A00]" />
                    <span>जन्म समय *</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={birthHour}
                      onChange={(e) => setBirthHour(e.target.value.padStart(2, '0'))}
                      className="w-12 text-center bg-[#FFFDF8] border border-[#8C6239]/40 rounded-lg py-1.5 text-xs text-[#3E2714]"
                      title="घंटे (1-12)"
                    />
                    <span className="text-[#8C6239] font-bold">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={birthMinute}
                      onChange={(e) => setBirthMinute(e.target.value.padStart(2, '0'))}
                      className="w-12 text-center bg-[#FFFDF8] border border-[#8C6239]/40 rounded-lg py-1.5 text-xs text-[#3E2714]"
                      title="मिनट (0-59)"
                    />
                    <div className="flex rounded-lg overflow-hidden border border-[#8C6239]/40 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setBirthAmPm('AM')}
                        className={`px-1.5 py-1.5 font-bold cursor-pointer ${
                          birthAmPm === 'AM'
                            ? 'bg-[#7A1D1D] text-white'
                            : 'bg-[#FFFDF8] text-[#5C3A21] hover:bg-[#F4E8D1]'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setBirthAmPm('PM')}
                        className={`px-1.5 py-1.5 font-bold cursor-pointer ${
                          birthAmPm === 'PM'
                            ? 'bg-[#7A1D1D] text-white'
                            : 'bg-[#FFFDF8] text-[#5C3A21] hover:bg-[#F4E8D1]'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Birth Place */}
                <div>
                  <label className="block text-[11px] font-bold text-[#5C3A21] mb-1 flex items-center gap-1 font-serif">
                    <MapPin className="w-3 h-3 text-[#B56A00]" />
                    <span>जन्म स्थान / शहर *</span>
                  </label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="उदा. नई दिल्ली, वाराणसी, जयपुर"
                    required
                    className="w-full bg-[#FFFDF8] border border-[#8C6239]/40 rounded-lg px-2.5 py-1.5 text-xs text-[#3E2714] focus:outline-none focus:ring-1 focus:ring-[#7A1D1D]"
                  />
                </div>
              </div>

              {/* Quick Popular City Selector Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 text-[11px]">
                <span className="text-[#8C6239] font-serif shrink-0">लोकप्रिय शहर:</span>
                {POPULAR_BIRTH_CITIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setBirthPlace(c.name)}
                    className={`px-2 py-0.5 rounded-full border transition cursor-pointer shrink-0 font-serif ${
                      birthPlace === c.name
                        ? 'bg-[#7A1D1D] text-white border-[#7A1D1D]'
                        : 'bg-[#FFFDF8] text-[#5C3A21] hover:bg-[#FAF2E4] border-[#8C6239]/30'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsBirthFormOpen(false)}
                  className="px-3 py-1.5 bg-[#FAF2E4] hover:bg-[#EBDCC0] text-[#5C3A21] border border-[#8C6239]/30 rounded-lg text-xs font-serif cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isCreatingKundali}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#7A1D1D] via-[#8F2121] to-[#B56A00] hover:from-[#5C1414] hover:to-[#8C6239] text-[#FFFDF8] rounded-lg text-xs font-bold font-serif shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCreatingKundali ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>कुंडली गणना जारी है...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#FFD88A]" />
                      <span>✨ कुंडली तैयार करें व उमा से परामर्श लें</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listening Status Bar when Mic is active */}
        {isListening && (
          <div className="bg-rose-100 border-b border-rose-300 px-4 py-2 flex items-center justify-between text-rose-800 text-xs font-bold animate-pulse">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-600 animate-spin" />
              <span>{voiceTranscript || 'उमा सुन रही हैं... (कृपया स्पष्ट हिन्दी में बोलें)'}</span>
            </div>
            <button
              onClick={handleVoiceInput}
              className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] cursor-pointer"
            >
              रोकें
            </button>
          </div>
        )}

        {/* Category Tabs */}
        <div className="bg-[#EBDCC0] px-2.5 py-1 overflow-x-auto no-scrollbar flex items-center gap-1 border-b border-[#8C6239]/30 shrink-0">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setShowSuggestionsBar(true);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-serif whitespace-nowrap transition cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#7A1D1D] text-[#FAF2E4] font-bold shadow-2xs'
                  : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#F4E8D1] border border-[#8C6239]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowSuggestionsBar((prev) => !prev)}
            className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#FAF2E4] text-[#7A1D1D] border border-[#8C6239]/30 whitespace-nowrap cursor-pointer ml-auto shrink-0"
          >
            {showSuggestionsBar ? 'सुझाव छुपाएं ▲' : '💡 प्रश्न सुझाव ▼'}
          </button>
        </div>

        {/* Suggested Question Chips (Auto-collapsed during active predictions to maximize prediction screen height) */}
        {(showSuggestionsBar || messages.length <= 1) && (
          <div className="bg-[#FAF2E4] px-2.5 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-b border-[#8C6239]/20 shrink-0">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(sug)}
                className="px-2 py-1 bg-[#F4E8D1] hover:bg-[#EBDCC0] border border-[#8C6239]/30 rounded-lg text-[11px] font-serif text-[#5C3A21] whitespace-nowrap transition flex items-center gap-1 group cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#B56A00] group-hover:scale-110 transition shrink-0" />
                <span className="truncate max-w-[260px]">{sug}</span>
              </button>
            ))}
          </div>
        )}

        {/* Messages List Container — Maximized Prediction Screen */}
        <div className="flex-1 sm:p-4 p-2.5 bg-[#FAF2E4] overflow-y-auto overscroll-contain min-h-0 space-y-3">
          {messages.map((msg, msgIndex) => {
            const isUma = msg.sender === 'uma';
            const isLatestUma =
              isUma &&
              msgIndex === messages.map((m) => m.sender).lastIndexOf('uma');

            // Extract follow-up question chips if present
            let mainText = msg.text;
            let followUpChips: string[] = [];
            if (isUma) {
              const marker = '[अगले प्रश्न]:';
              const pos = msg.text.indexOf(marker);
              if (pos !== -1) {
                mainText = msg.text.substring(0, pos).trim();
                const rawChips = msg.text.substring(pos + marker.length).trim();
                followUpChips = rawChips
                  .split('\n')
                  .map((s) => s.replace(/^[•\-\*\d\.\s]+/, '').trim())
                  .filter((s) => s.length > 3);
              }
            }

            return (
              <div
                key={msg.id}
                ref={isLatestUma ? latestUmaMsgRef : undefined}
                className={`flex gap-2 sm:gap-3 ${isUma ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}
              >
                {isUma && (
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#7A1D1D] to-[#4A1010] text-[#FAF2E4] border border-[#B58738] flex items-center justify-center shrink-0 text-xs sm:text-sm font-bold shadow-sm mt-1">
                    ॐ
                  </div>
                )}
                <div
                  className={`max-w-[95%] sm:max-w-[88%] rounded-xl p-3 sm:p-4 relative ${
                    isUma
                      ? 'bg-[#FFFDF8] border-2 border-[#8C6239]/30 text-[#3E2714] shadow-md'
                      : 'bg-gradient-to-r from-[#7A1D1D] to-[#8F2121] text-[#FAF2E4] border border-[#B58738] shadow-sm font-serif text-xs sm:text-sm py-2 px-3 ml-6'
                  }`}
                >
                  {isUma && (
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#8C6239]/20 text-xs text-[#735133]">
                      <div className="flex items-center gap-1.5 font-serif font-bold text-[#8F2121]">
                        <span>॥</span>
                        <span>उमा ज्योतिषाचार्य निर्णय</span>
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
                    {mainText}
                  </div>

                  {/* Interactive Single-Tap Follow-Up Question Chips */}
                  {isUma && followUpChips.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-[#8C6239]/25 space-y-2">
                      <p className="text-[11px] font-bold text-[#8F2121] flex items-center gap-1 font-serif">
                        <Sparkles className="w-3.5 h-3.5 text-[#B58738]" />
                        <span>त्वरित अनुवर्ती प्रश्न (एक क्लिक में पूछें):</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {followUpChips.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSubmit(chip)}
                            className="px-3 py-1.5 bg-[#F4E8D1] hover:bg-[#E8D6B5] text-[#4A2E12] text-xs font-serif font-medium rounded-full border border-[#8C6239]/40 cursor-pointer shadow-2xs transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1"
                          >
                            <span>• {chip}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation Action Buttons / Smart Birth Trigger */}
                  {isUma && !currentKundali && msg.actionPayload?.type === 'open_kundali' && (
                    <div className="mt-3 pt-2.5 border-t border-[#8C6239]/20 flex items-center justify-between flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setIsBirthFormOpen(true)}
                        className="text-xs font-bold text-[#7A1D1D] hover:bg-[#FAF2E4] flex items-center gap-1.5 bg-[#F4E8D1] px-3 py-1.5 rounded-lg border border-[#B58738] cursor-pointer shadow-xs transition hover:scale-[1.01]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                        <span>✨ यहीं जन्म विवरण भरें (सटीक कुंडली फलादेश)</span>
                      </button>
                    </div>
                  )}

                  {msg.actionPayload && onNavigateTab && (msg.actionPayload.type !== 'open_kundali' || currentKundali) && (
                    <div className="mt-3 pt-2.5 border-t border-[#8C6239]/20 flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          if (msg.actionPayload?.type === 'open_panchang') onNavigateTab('panchang');
                          if (msg.actionPayload?.type === 'open_choghadiya') onNavigateTab('choghadiya');
                          if (msg.actionPayload?.type === 'open_kundali') onNavigateTab('kundali');
                          if (msg.actionPayload?.type === 'open_yatra') onNavigateTab('yatra');
                          if (msg.actionPayload?.type === 'open_muhurat') onNavigateTab('muhurat');
                          if (msg.actionPayload?.type === 'open_numerology') onNavigateTab('numerology');
                          if (msg.actionPayload?.type === 'open_vastu') onNavigateTab('vastu');
                          if (msg.actionPayload?.type === 'open_palmistry') onNavigateTab('palmistry');
                          if (msg.actionPayload?.type === 'open_gemology') onNavigateTab('gemology');
                          if (msg.actionPayload?.type === 'open_upay') onNavigateTab('upay');
                        }}
                        className="text-xs font-bold text-[#7A1D1D] hover:text-[#5C1414] hover:underline flex items-center gap-1 bg-[#F4E8D1] px-3 py-1.5 rounded-lg border border-[#8C6239]/30 cursor-pointer shadow-xs"
                      >
                        <span>{msg.actionPayload.label}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Voice / WhatsApp / PDF / Copy Controls */}
                  {isUma && (
                    <div className="mt-3 pt-2.5 border-t border-[#8C6239]/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 1. Voice Play/Stop */}
                        <button
                          onClick={() => speakHindi(msg.text, msg.id)}
                          className={`px-2.5 py-1 rounded-md border flex items-center gap-1 transition cursor-pointer font-medium ${
                            playingVoiceId === msg.id
                              ? 'bg-[#7A1D1D] text-white border-[#7A1D1D]'
                              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EBDCC0] border-[#8C6239]/40'
                          }`}
                          title="हिन्दी व संस्कृत श्लोक में सुनें"
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

                        {/* 2. Direct 1-Click WhatsApp Share */}
                        <button
                          onClick={() => {
                            const idx = messages.findIndex((m) => m.id === msg.id);
                            const userQuery =
                              idx > 0 && messages[idx - 1].sender === 'user'
                                ? messages[idx - 1].text
                                : undefined;
                            handleWhatsAppShare(msg.text, userQuery);
                          }}
                          className="px-2.5 py-1 rounded-md border border-emerald-600/50 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 transition cursor-pointer font-medium"
                          title="यजमान को सीधे व्हाट्सएप पर भेजें"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp शेयर</span>
                        </button>

                        {/* 3. Direct PDF Generator */}
                        <button
                          onClick={() => {
                            const idx = messages.findIndex((m) => m.id === msg.id);
                            const userQuery =
                              idx > 0 && messages[idx - 1].sender === 'user'
                                ? messages[idx - 1].text
                                : undefined;
                            void handleDownloadPdfReport(msg.text, userQuery);
                          }}
                          disabled={isGeneratingPdf}
                          className="px-2.5 py-1 rounded-md border border-amber-600/50 bg-amber-50 text-amber-900 hover:bg-amber-100 flex items-center gap-1 transition cursor-pointer font-medium disabled:opacity-50"
                          title="जातक के नाम की औपचारिक ज्योतिषीय परामर्श रिपोर्ट (PDF)"
                        >
                          {isGeneratingPdf ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                          )}
                          <span>PDF रिपोर्ट</span>
                        </button>

                        {/* 3b. Traditional 6-Point Upay Parchi Slip */}
                        <button
                          onClick={() => setIsUpayParchiOpen(true)}
                          className="px-2.5 py-1 rounded-md border border-[#7A1D1D]/50 bg-[#FFFDF8] text-[#7A1D1D] hover:bg-[#FAF2E4] flex items-center gap-1 transition cursor-pointer font-bold shadow-2xs"
                          title="पारंपरिक ज्योतिषीय लेटरहेड पर ६-सूत्रीय उपाय पर्ची खोलें व डाउनलोड करें"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#7A1D1D]" />
                          <span>📋 उपाय पर्ची</span>
                        </button>

                        {/* 4. Copy */}
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

          {/* Loading Indicator with Vedic Chant */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-150">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7A1D1D] text-[#FAF2E4] border-2 border-[#B58738] flex items-center justify-center shrink-0 text-sm font-bold shadow-md">
                ॐ
              </div>
              <div className="bg-[#FFFDF8] border-2 border-[#8C6239]/30 rounded-xl p-4 max-w-md shadow-md flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#7A1D1D] border-t-transparent rounded-full animate-spin shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-serif font-bold text-[#7A1D1D]">
                    उमा कुण्डली के भावों, ग्रहों व दशा का सूक्ष्म विश्लेषण कर रही हैं...
                  </p>
                  <p className="text-[11px] text-[#735133] font-serif">
                    ॥ ॐ सूर्याय नमः • ॐ गुरवे नमः • ॐ नमः शिवाय ॥
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar - Alexa Voice & Text input */}
        <div className="bg-[#F4E8D1] p-2.5 sm:p-3 border-t-2 border-[#8C6239]/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            {/* Mic button for Alexa Voice query */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 sm:p-3 rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300'
                  : 'bg-[#FAF2E4] text-[#5C3A21] hover:bg-[#EBDCC0] border border-[#8C6239]/40'
              }`}
              title={isListening ? 'बोलना बंद करें' : 'उमा से बोलकर पूछें (Alexa Voice)'}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-[#7A1D1D]" />
              )}
            </button>

            <input
              id="uma-query-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                activeCategory === 'numerology'
                  ? 'अंक ज्योतिष, नाम स्पेलिंग, मूलांक, लकी नंबर या उपाय पूछें...'
                  : currentKundali
                  ? `उमा से ${currentKundali.name} जी की कुंडली, करियर, विवाह, दशा या उपाय पूछें...`
                  : 'उमा से कोई भी ज्योतिषीय प्रश्न, करियर, विवाह, व्यापार या उपाय पूछें...'
              }
              className="flex-1 bg-[#FFFDF8] border-2 border-[#8C6239]/40 focus:border-[#7A1D1D] rounded-xl px-3 py-2 text-xs sm:text-base font-serif text-[#3E2714] placeholder:text-[#8C6239]/70 outline-none shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-3.5 py-2 bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] disabled:opacity-40 hover:from-[#5C1414] hover:to-[#4A1010] text-[#FAF2E4] font-bold rounded-xl transition shadow-md flex items-center gap-1.5 text-xs sm:text-sm font-serif cursor-pointer shrink-0"
            >
              <span>पूछें</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* WhatsApp Client Bot Modal Overlay */}
        {isWhatsAppBotOpen && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-2xl h-[92dvh] max-h-[100dvh] flex flex-col shadow-2xl overflow-hidden">
              {/* Bot Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-3 sm:p-4 flex items-center justify-between border-b border-emerald-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 border border-emerald-300 flex items-center justify-center shadow-inner">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg font-granth text-emerald-100 flex items-center gap-1.5">
                      <span>यजमान व्हाट्सएप बॉट</span>
                      <span className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded text-white font-mono uppercase tracking-wider">
                        BOT AI
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-200">
                      यजमानों के प्रश्नों के सीधे व्हाट्सएप पर स्वचालित शास्त्रीय उत्तर व उपाय
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWhatsAppBotOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-emerald-700 text-emerald-200 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bot Body */}
              <div className="flex-1 min-h-0 text-sm font-serif overflow-y-auto p-4 space-y-4">
                {/* Client Details Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FFFDF8] p-3 rounded-xl border border-[#8C6239]/30 shadow-xs">
                  <div>
                    <label className="block text-xs font-bold text-[#5C3A21] mb-1">
                      यजमान / जातक का नाम:
                    </label>
                    <input
                      type="text"
                      value={clientBotName}
                      onChange={(e) => setClientBotName(e.target.value)}
                      placeholder="यजमान का नाम लिखें"
                      className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-3 py-1.5 text-xs text-[#3E2714] focus:outline-[#7A1D1D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C3A21] mb-1">
                      व्हाट्सएप मोबाइल नंबर (वैकल्पिक):
                    </label>
                    <input
                      type="text"
                      value={clientBotPhone}
                      onChange={(e) => setClientBotPhone(e.target.value)}
                      placeholder="उदा. 9876543210"
                      className="w-full bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg px-3 py-1.5 text-xs text-[#3E2714] focus:outline-[#7A1D1D]"
                    />
                  </div>
                </div>

                {/* Quick Topic Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#7A1D1D] mb-2">
                    १. त्वरित शास्त्रीय परामर्श विषय चुनें (Topic Select):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BOT_QUICK_TOPICS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleGenerateBotMessage(item.prompt)}
                        disabled={isGeneratingBotMsg}
                        className="text-left px-3 py-2 bg-[#FFFDF8] hover:bg-emerald-50 border border-[#8C6239]/30 hover:border-emerald-600 rounded-lg text-xs text-[#3E2714] transition flex items-center justify-between cursor-pointer group disabled:opacity-50"
                      >
                        <span className="font-medium group-hover:text-emerald-800">{item.label}</span>
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status indicator */}
                {isGeneratingBotMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs shadow-inner">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                    <span>उमा यजमान हेतु संस्कृत श्लोक सहित शास्त्रोक्त परामर्श संदेश तैयार कर रही हैं...</span>
                  </div>
                )}

                {/* Generated WhatsApp Preview */}
                {clientBotGeneratedMsg && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#5C3A21]">
                        २. व्हाट्सएप संदेश पूर्वावलोकन (संपादन योग्य):
                      </label>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(clientBotGeneratedMsg);
                          alert('संदेश कॉपी कर लिया गया!');
                        }}
                        className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Copy className="w-3 h-3" /> प्रतिलिपि (Copy)
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={clientBotGeneratedMsg}
                      onChange={(e) => setClientBotGeneratedMsg(e.target.value)}
                      className="w-full bg-[#FFFDF8] border border-[#8C6239]/40 rounded-xl p-3 text-xs text-[#2C0A0A] font-mono leading-relaxed focus:outline-[#7A1D1D] shadow-inner"
                    />
                  </div>
                )}
              </div>

              {/* Bot Footer Actions */}
              <div className="bg-[#F4E8D1] p-3 border-t border-[#8C6239]/30 flex items-center justify-between flex-wrap gap-2">
                <button
                  onClick={() => setIsWhatsAppBotOpen(false)}
                  className="px-3 py-1.5 border border-[#8C6239]/50 rounded-lg text-xs text-[#5C3A21] hover:bg-[#EBDCC0] cursor-pointer"
                >
                  बंद करें
                </button>

                <div className="flex items-center gap-2">
                  {clientBotGeneratedMsg && (
                    <button
                      onClick={() =>
                        handleDownloadPdfReport(
                          clientBotGeneratedMsg,
                          `${clientBotName || 'यजमान'} जी का परामर्श`
                        )
                      }
                      disabled={isGeneratingPdf}
                      className="px-3 py-1.5 bg-[#B58738] hover:bg-[#9B7028] text-[#2C0A0A] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>PDF बनाएं</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (!clientBotGeneratedMsg) {
                        alert('कृपया पहले कोई विषय चुनकर संदेश तैयार करें।');
                        return;
                      }
                      openWhatsAppShare(clientBotGeneratedMsg, clientBotPhone);
                    }}
                    disabled={!clientBotGeneratedMsg}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>📲 सीधे व्हाट्सएप पर भेजें</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Success Download Modal */}
        <PdfSuccessModal info={pdfSuccessInfo} onClose={() => setPdfSuccessInfo(null)} />

        {/* Traditional 6-Point Astrologer Upay Parchi (Prescription Slip) Modal */}
        <UpayParchiModal
          isOpen={isUpayParchiOpen}
          onClose={() => setIsUpayParchiOpen(false)}
          activeKundali={currentKundali}
          panchang={panchang}
        />
      </div>
    </div>,
    document.body
  );
};
