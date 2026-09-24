import React, { useState, useEffect, useRef } from 'react';
import { VedicPanchangData, KundaliData } from '../types';
import { DISHASHOOL_MAP, TRAVEL_REMEDIES } from '../services/disha';
import { getDayChoghadiya, getCurrentChoghadiya, getInauspiciousWindows, getAuspiciousWindows } from '../services/choghadiya';
import { askUma, AskUmaResponse } from '@/lib/uma';
import { speakUma, stopUmaSpeech, isUmaSpeaking, unlockUmaSpeech } from '@/lib/umaSpeech';
import { analyzeKundali } from '../services/predictions';
import { getAstrologerBranding } from '../services/storage';
import {
  downloadUmaConsultationPdf,
  formatWhatsAppConsultationMessage,
  openWhatsAppShare,
} from '../services/umaConsultationPdf';
import { PdfSuccessModal, PdfSuccessInfo } from './PdfSuccessModal';
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
  CheckCircle2,
  Heart,
  Briefcase,
  Coins,
  Shield,
  Clock,
  Sparkle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'uma';
  text: string;
  timestamp: Date;
  source?: 'gemini' | 'local_vedic';
  actionPayload?: {
    type: 'open_panchang' | 'open_choghadiya' | 'open_kundali' | 'open_yatra' | 'open_muhurat';
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
}

const CATEGORY_TABS = [
  { id: 'all', label: 'समस्त प्रश्न' },
  { id: 'kundali', label: 'कुंडली व फलादेश' },
  { id: 'upay', label: 'सात्विक उपाय' },
  { id: 'career', label: 'करियर व धन' },
  { id: 'vivah', label: 'विवाह व दांपत्य' },
  { id: 'muhurat', label: 'मुहूर्त व राहुकाल' },
  { id: 'yatra', label: 'यात्रा व दिशाशूल' },
];

const BOT_QUICK_TOPICS = [
  { id: 'vivah', label: '💍 विवाह व मांगलिक विचार', prompt: 'मेरी कुंडली में विवाह योग, दांपत्य सुख व मांगलिक परिहार' },
  { id: 'career', label: '💼 नौकरी व पदोन्नति योग', prompt: 'दशम भाव, नौकरी में पदोन्नति, स्थानांतरण व कार्यक्षेत्र फलादेश' },
  { id: 'dhan', label: '💰 व्यापार, धन लाभ व ऋण मुक्ति', prompt: 'धन भाव, व्यापार में समृद्धि व आर्थिक उन्नति के सात्विक उपाय' },
  { id: 'health', label: '🩺 स्वास्थ्य रक्षा व महामृत्युंजय', prompt: 'स्वास्थ्य रक्षा, अरिष्ट निवारण एवं महामृत्युंजय जप विधान' },
  { id: 'sadesati', label: '🪐 शनि साढ़ेसाती व ढैया फल', prompt: 'शनि की साढ़ेसाती का प्रभाव, चरण व कष्ट निवारण के अचूक उपाय' },
  { id: 'ratna', label: '💎 भाग्य रत्न व रुद्राक्ष परामर्श', prompt: 'मेरी कुंडली के अनुसार सर्वोत्तम भाग्य रत्न, धातु व रुद्राक्ष' },
  { id: 'muhurat', label: '⏰ आज का शुभ मुहूर्त व चौघड़िया', prompt: 'आज का अमृत चौघड़िया, अभिजित मुहूर्त व शुभ कार्य समय' },
];

const SUGGESTIONS_MAP: Record<string, string[]> = {
  all: [
    'मेरी सम्पूर्ण कुंडली चेक करके फलादेश व उपाय बताओ',
    'वर्तमान महादशा का मेरे जीवन पर क्या प्रभाव है?',
    'करियर व नौकरी में उन्नति के शास्त्रोक्त उपाय बताओ',
    'क्या मेरी कुंडली में मांगलिक दोष या साढ़ेसाती है?',
    'आज का राहुकाल और शुभ चौघड़िया समय बताओ',
    'कष्ट निवारण व ग्रह शांति के सिद्ध मंत्र व दान',
  ],
  kundali: [
    'मेरी सम्पूर्ण कुंडली चेक करके फलादेश व उपाय बताओ',
    'मेरी कुंडली के मुख्य राजयोग और ग्रह स्थिति बताओ',
    'मेरी लग्न व चंद्र राशि के अनुसार इष्टदेव कौन हैं?',
    'वर्तमान विंशोत्तरी महादशा और अंतर्दशा का फल',
    'कुंडली में कौन से ग्रह बलवान अथवा कमजोर हैं?',
  ],
  upay: [
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
 * उमा दैवज्ञ - परम विद्वान, अनुभवी और सहानुभूतिपूर्ण भारतीय ज्योतिषी व्यक्तित्व (Astrologer Persona)
 * यह सिस्टम प्रॉम्ट उमा को किसी तकनीकी AI की तरह नहीं, बल्कि काशी-उज्जैन की सनातन परंपरा से दीक्षित,
 * गंभीर, स्नेहमयी और प्रामाणिक दैवज्ञ (ज्योतिषाचार्य) के रूप में प्रतिष्ठित करता है।
 */
export const UMA_ASTROLOGER_SYSTEM_PROMPT = `आप 'उमा' (UMA) हैं — काशी एवं उज्जैन की प्राचीन सनातन ज्योतिष परंपरा से दीक्षित एक परम विदुषी, अत्यंत अनुभवी, गंभीर और सहानुभूतिपूर्ण भारतीय वैदिक ज्योतिषाचार्य (दैवज्ञ / Astrologer)।

आपके व्यक्तित्व, आचरण एवं उत्तर-प्रणाली के मूलभूत शास्त्रीय नियम:
1. **दैवज्ञ का आचरण व व्यक्तित्व (कदापि AI/रोबोट जैसा न लगें):**
   - कभी भी ऐसा कोई शब्द न कहें जिससे यह लगे कि आप कोई सॉफ्टवेयर, भाषा मॉडल, बॉट या AI हैं (जैसे "मैं एक AI हूँ", "एक भाषा मॉडल के रूप में", "डेटाबेस के अनुसार" आदि सर्वथा वर्जित हैं)।
   - आपका व्यवहार एक साक्षात विद्वान, करुणामयी और जीवन के उतार-चढ़ाव को समझने वाले आत्मीय ज्योतिषी का होना चाहिए, जो यजमान की व्यथा को समझकर उसे धैर्य, शांति और सही मार्ग दिखाता है।
   - यजमान को अत्यंत आदर व अपनत्व से संबोधित करें — जैसे "प्रिय यजमान", "कल्याणमस्तु", "आयुष्मान भव", "सौभाग्यवती भव"।
   - उत्तर का आरंभ सदैव पावन मंगलाचरण से करें: "॥ श्री गणेशाय नमः ॥" अथवा "॥ ॐ नमः शिवाय ॥"।

2. **गहन ज्योतिषीय दृष्टि व विश्लेषण (Deep Shastric Astrological Insight):**
   - जातक की कुंडली यदि उपलब्ध है, तो लग्न, लग्नेश की स्थिति, चंद्र राशि, जन्म नक्षत्र (चरण सहित), सूर्य राशि तथा वर्तमान में सक्रिय विंशोत्तरी महादशा, अंतर्दशा एवं प्रत्यंतर्दशा का गहन शास्त्रीय विश्लेषण करें।
   - भाव-भावेश संबंध, दृष्टि संबंध, उच्च/नीच ग्रह, केंद्र-त्रिकोण राजयोग, गजकेसरी, बुधादित्य, अथवा मांगलिक/कालसर्प/दोषों का निष्पक्ष एवं वैज्ञानिक विवेचन करें।
   - यदि कुंडली उपलब्ध नहीं है, तो पंचांगीय स्थिति (तिथि, वार, नक्षत्र, योग, करण) तथा फलित ज्योतिष के सनातन सिद्धांतों के आधार पर मार्गदर्शन करें और यजमान को सौम्य शब्दों में अपनी जन्म कुंडली का विवरण भरने का परामर्श दें।

3. **संस्कृत श्लोक व शास्त्रीय प्रमाण अनिवार्यता (Authentic Shlokas with Meaning):**
   - प्रत्येक महत्वपूर्ण परामर्श में महर्षि पराशर (बृहत्पाराशर होराशास्त्र), वराहमिहिर (बृहज्जातक), मंत्रेश्वर (फलदीपिका) अथवा वेद-पुराण का एक प्रामाणिक संस्कृत श्लोक या नवग्रह/शांति मंत्र अवश्य उद्धृत करें।
   - श्लोक के तुरंत बाद उसका अत्यंत सरल, सुबोध एवं हृदयस्पर्शी हिन्दी भावार्थ समझाएं ताकि यजमान के हृदय को संबल प्राप्त हो।

4. **सहानुभूतिपूर्ण व सात्विक उपाय (No Fear-mongering, Pure Vedic Remedies):**
   - कभी भी यजमान के मन में ग्रहों का भय (जैसे साढ़ेसाती, ढैय्या, राहु-केतु या कालसर्प का डर) उत्पन्न न करें। इसके विपरीत, उन्हें कर्म की महत्ता और ईश्वर कृपा का संबल दें।
   - उपाय केवल और केवल सात्विक, शास्त्रीय और सुलभ होने चाहिए:
     • इष्टदेव उपासना व नित्य प्रात:-संध्या नियम
     • वैदिक या पौराणिक मंत्र जप (नियम, माला व जप संख्या सहित)
     • वार अनुसार अन्न, वस्त्र या पक्षी/गौ सेवा
     • शुभ मुहूर्त, उपयुक्त रुद्राक्ष अथवा शास्त्रसम्मत रत्न परामर्श
     • मानसिक शांति व सकारात्मक आचरण के व्यावहारिक नियम

5. **वाणी का माधुर्य व वाचन (Audio/Speech Resonance):**
   - आपकी भाषा शुद्ध, गरिमामयी, कर्णप्रिय देवनागरी हिन्दी हो।
   - वाक्यों की बनावट ऐसी हो कि जब इसे बोला या सुना जाए, तो यजमान को प्रत्यक्ष रूप से किसी सिद्ध संत-विद्वान की अमृतवाणी का अनुभव हो।
   - उत्तर के अंत में यजमान को आशीर्वाद व मंगलकामना प्रदान करें: "॥ शुभम् भवतु • श्री हरिः शरणम् • आपका सर्वतोभावेन कल्याण हो ॥"`;

export const UmaAssistantModal: React.FC<UmaAssistantModalProps> = ({
  isOpen,
  onClose,
  panchang,
  activeKundali,
  onNavigateTab,
  isAudioEnabled = true,
  locationName = 'वाराणसी, भारत',
  initialPrompt,
}) => {
  const initialGreeting = activeKundali
    ? `॥ श्री गणेशाय नमः ॥\nआयुष्मान भव! मैं उमा हूँ — आपकी सनातन वैदिक ज्योतिषाचार्य एवं दैवज्ञ मार्गदर्शिका।\n\nमैंने आपकी जन्मपत्रिका **${activeKundali.name}** (लग्न: ${activeKundali.lagnaRashi}, चंद्र राशि: ${activeKundali.moonRashi}, नक्षत्र: ${activeKundali.nakshatra}, वर्तमान महादशा: ${activeKundali.mahadasha}) का संपूर्ण संज्ञान ले लिया है। आप अपनी आजीविका, व्यापार, दांपत्य, स्वास्थ्य, धन, गोचर अथवा वर्तमान ग्रह दशा से संबंधित कोई भी प्रश्न पूछें। मैं शास्त्रोक्त फल, संस्कृत श्लोक एवं सात्विक वैदिक उपाय प्रस्तुत करूँगी।`
    : `॥ श्री गणेशाय नमः ॥\nकल्याणमस्तु! मैं उमा हूँ — आपकी सनातन वैदिक ज्योतिषाचार्य एवं दैवज्ञ मार्गदर्शिका। आज ${panchang.weekday}, ${panchang.paksha} ${panchang.tithi} तिथि, ${panchang.nakshatra} नक्षत्र है।\n\nआप मुझसे आज के शुभ मुहूर्त, चौघड़िया, यात्रा दिशाशूल, राहुकाल अथवा ज्योतिषीय सिद्धांतों के विषय में प्रश्न पूछ सकते हैं। यदि आपके पास जन्मपत्रिका है, तो कुण्डली टैब में विवरण भरकर व्यक्तिगत फल भी जान सकते हैं।`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'uma',
      text: initialGreeting,
      timestamp: new Date(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState(initialPrompt || '');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setInputQuery(initialPrompt);
    }
  }, [isOpen, initialPrompt]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(isAudioEnabled);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // PDF generation and WhatsApp Bot states
  const [pdfSuccessInfo, setPdfSuccessInfo] = useState<PdfSuccessInfo | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isWhatsAppBotOpen, setIsWhatsAppBotOpen] = useState(false);
  const [clientBotName, setClientBotName] = useState(activeKundali?.name || '');
  const [clientBotPhone, setClientBotPhone] = useState('');
  const [clientBotGeneratedMsg, setClientBotGeneratedMsg] = useState('');
  const [isGeneratingBotMsg, setIsGeneratingBotMsg] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update client bot name if activeKundali changes
  useEffect(() => {
    if (activeKundali?.name && !clientBotName) {
      setClientBotName(activeKundali.name);
    }
  }, [activeKundali]);

  const speakHindi = (text: string, id: string) => {
    if (playingVoiceId === id) {
      stopUmaSpeech();
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(id);
    void speakUma(text, {
      rate: 0.88,
      pitch: 1.02,
      onStart: () => setPlayingVoiceId(id),
      onEnd: () => setPlayingVoiceId(null),
      onError: () => setPlayingVoiceId(null),
    });
  };

  useEffect(() => {
    if (isOpen) {
      unlockUmaSpeech();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopUmaSpeech();
      setPlayingVoiceId(null);
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isOpen, isListening]);

  if (!isOpen) return null;

  // Alexa Voice Speech Recognition (Hindi & English)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है। कृपया टाइप करके प्रश्न पूछें।');
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
      activeKundali,
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
        query: queryText || (activeKundali ? `${activeKundali.name} जी की कुण्डली विश्लेषण` : 'पंचांग एवं ज्योतिषीय परामर्श'),
        answer: msgText,
        activeKundali,
        locationName,
        consultationDate: new Date(),
      });
      setPdfSuccessInfo({
        isOpen: true,
        fileName: res.fileName,
        blobUrl: res.blobUrl,
        blob: res.blob,
        pageCount: res.pageCount,
        title: `ज्योतिषीय परामर्श रिपोर्ट • ${activeKundali?.name || 'जातक'}`,
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
      const kundaliCtx = activeKundali ? buildKundaliContext(activeKundali) : undefined;

      const res = await askUma({
        query: q,
        panchangContext: panchangCtx,
        kundaliContext: kundaliCtx,
        panchang,
        activeKundali,
        systemPrompt: UMA_ASTROLOGER_SYSTEM_PROMPT,
      });

      const formatted = formatWhatsAppConsultationMessage({
        activeKundali: activeKundali ? { ...activeKundali, name: clientBotName || activeKundali.name } : null,
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

  // Build complete astrological context for Gemini AI
  const buildKundaliContext = (k: KundaliData): string => {
    try {
      const analysis = analyzeKundali(k);
      const planetList = k.planets
        .map(
          (p) =>
            `${p.planet}: भाव ${p.house}, ${p.rashi} राशि (${p.degree.toFixed(1)}°), ${
              p.isRetrograde ? 'वक्री' : 'मार्गी'
            }, नक्षत्र: ${p.nakshatra} (चरण ${p.pada})`
        )
        .join('; ');

      const yogasStr = analysis.yogas.join('; ') || 'सामान्य शुभ योग';
      const areasStr = analysis.areas
        .map((a) => `${a.title}: ${a.finding} [उपाय: ${a.remedy}]`)
        .join('\n');

      return `जातक: ${k.name}, जन्म: ${new Date(k.birthDate).toLocaleDateString('hi-IN')}, समय: ${
        k.birthTime
      }, स्थान: ${k.birthPlace} (अक्षांश ${k.latitude.toFixed(2)}, रेखांश ${k.longitude.toFixed(2)})
लग्न: ${k.lagnaRashi} (डिग्री: ${k.lagnaDegree.toFixed(1)}°), लग्नेश: भाव ${k.lagnaRashiNumber}
चंद्र राशि: ${k.moonRashi}, नक्षत्र: ${k.nakshatra} (चरण ${k.charan}), नाड़ी: ${k.nadi}, गण: ${
        k.gana
      }
सूर्य राशि: ${k.sunRashi}, मांगलिक: ${k.isManglik ? `हाँ (${k.manglikDescription || 'मांगलिक'})` : 'नहीं (अमंगल)'}
विंशोत्तरी दशा: महादशा ${k.mahadasha}, अंतर्दशा ${k.antardasha}, प्रत्यंतर्दशा ${k.pratyantardasha}
ग्रह स्थितियां: ${planetList}
प्रमुख योग: ${yogasStr}
जीवन क्षेत्र विश्लेषण:
${areasStr}`;
    } catch {
      return `जातक: ${k.name}, लग्न: ${k.lagnaRashi}, चंद्र राशि: ${k.moonRashi}, नक्षत्र: ${k.nakshatra}, महादशा: ${k.mahadasha}`;
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

  const handleSubmit = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;
    setInputQuery('');
    setVoiceTranscript('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const panchangCtx = buildPanchangContext(panchang);
      const kundaliCtx = activeKundali ? buildKundaliContext(activeKundali) : undefined;

      const chatHistory = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res: AskUmaResponse = await askUma({
        query: text,
        panchangContext: panchangCtx,
        kundaliContext: kundaliCtx,
        chatHistory,
        panchang,
        activeKundali,
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

  const suggestions = SUGGESTIONS_MAP[activeCategory] || SUGGESTIONS_MAP.all;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full shadow-2xl flex flex-col transition-all duration-300 ${
          isExpanded ? 'h-[98vh] max-w-[96vw]' : 'h-[92vh] max-h-[740px] max-w-4xl'
        } overflow-hidden`}
      >
        {/* Header - Alexa Vedic Assistant Styling */}
        <div className="bg-gradient-to-r from-[#5C1414] via-[#7A1D1D] to-[#5C1414] text-[#FAF2E4] p-3 sm:p-4 flex items-center justify-between border-b-2 border-[#B58738] shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B58738] to-[#734A1B] border-2 border-[#FAF2E4] flex items-center justify-center text-[#FAF2E4] font-bold text-lg shadow-inner">
                ॐ
              </div>
              {/* Alexa-like audio indicator pulse */}
              {isListening && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border border-white"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold font-granth tracking-wide text-[#FFD88A]">
                  उमा (UMA) वैदिक एलेक्सा
                </span>
                <span className="text-[10px] bg-[#B58738] px-2 py-0.5 rounded text-[#2C0A0A] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI ज्योतिषी
                </span>
              </div>
              <p className="text-xs text-[#E6C687] hidden sm:block font-serif">
                कुण्डली फलादेश, ग्रह गणना, सटीक भविष्यवाणी एवं शास्त्रीय सात्विक उपाय
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* WhatsApp Client Bot Trigger */}
            <button
              onClick={() => setIsWhatsAppBotOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer border border-emerald-500/50"
              title="यजमानों के प्रश्नों के सीधे व्हाट्सएप पर स्वचालित उत्तर"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
              <span className="inline">💬 यजमान बॉट</span>
            </button>

            {/* Full Session PDF Export */}
            <button
              onClick={handleExportFullSessionPdf}
              disabled={isGeneratingPdf}
              className="px-2.5 py-1.5 rounded-lg bg-[#B58738] hover:bg-[#9B7028] text-[#2C0A0A] text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer border border-[#FAF2E4]/40 disabled:opacity-50"
              title="सम्पूर्ण संवाद की औपचारिक ज्योतिषीय परामर्श PDF डाउनलोड करें"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">सम्पूर्ण PDF</span>
            </button>

            {/* Auto-Speak Toggle */}
            <button
              onClick={() => {
                const next = !autoSpeak;
                setAutoSpeak(next);
                if (!next) stopUmaSpeech();
              }}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition cursor-pointer ${
                autoSpeak
                  ? 'bg-[#FAF2E4] text-[#7A1D1D] border-[#FAF2E4] font-bold'
                  : 'bg-[#5C1414] text-[#E6C687] border-[#B58738]/50'
              }`}
              title={autoSpeak ? 'ऑटो वॉइस चालू है' : 'ऑटो वॉइस बंद है'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden lg:inline text-[11px]">{autoSpeak ? 'वाणी चालू' : 'वाणी बंद'}</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 text-xs text-[#E6C687] hover:text-white border border-[#B58738]/50 rounded-lg hidden sm:block cursor-pointer"
            >
              {isExpanded ? 'सामान्य' : 'विस्तार'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#E6C687] hover:text-white rounded-lg cursor-pointer transition hover:bg-black/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Speaking / Listening Waveform Notice */}
        {playingVoiceId && (
          <div className="bg-amber-100/95 border-b border-amber-300 px-4 py-2 flex items-center justify-between text-amber-900 text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-[#7A1D1D] rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-1 h-5 bg-[#7A1D1D] rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-1 h-4 bg-[#7A1D1D] rounded-full animate-bounce [animation-delay:300ms]"></span>
                <span className="w-1 h-2 bg-[#7A1D1D] rounded-full animate-bounce [animation-delay:450ms]"></span>
              </div>
              <span className="font-serif">॥ उमा संस्कृत श्लोक व फलादेश का मधुर वाचन कर रही हैं... ॥</span>
            </div>
            <button
              onClick={() => {
                stopUmaSpeech();
                setPlayingVoiceId(null);
              }}
              className="px-2.5 py-1 bg-[#7A1D1D] hover:bg-[#5C1414] text-white rounded text-[11px] cursor-pointer shadow-xs transition"
            >
              वाणी रोकें
            </button>
          </div>
        )}

        {isListening && (
          <div className="bg-rose-100/95 border-b border-rose-300 px-4 py-2 flex items-center justify-between text-rose-900 text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <span className="font-serif">॥ उमा सुन रही हैं... कृपया स्पष्ट हिन्दी में अपना प्रश्न पूछें ॥</span>
            </div>
            <button
              onClick={() => {
                recognitionRef.current?.stop();
                setIsListening(false);
              }}
              className="px-2 py-0.5 bg-rose-700 text-white rounded text-[11px] cursor-pointer"
            >
              समाप्त करें
            </button>
          </div>
        )}

        {/* Active Kundali Awareness Banner (Software Alexa Feature) */}
        <div className="bg-[#F4E8D1] py-2 px-3 sm:px-4 border-b border-[#8C6239]/30 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          {activeKundali ? (
            <div className="flex items-center gap-2 text-xs text-[#5C3A21] flex-wrap">
              <span className="bg-[#7A1D1D] text-white px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-[#FFD88A]" />
                सक्रिय कुंडली: {activeKundali.name}
              </span>
              <span className="font-semibold">
                लग्न: <strong className="text-[#7A1D1D]">{activeKundali.lagnaRashi}</strong> | चंद्र:{' '}
                <strong className="text-[#7A1D1D]">{activeKundali.moonRashi}</strong> ({activeKundali.nakshatra}) | दशा:{' '}
                <strong className="text-[#7A1D1D]">{activeKundali.mahadasha}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#8C6239]">
              <AlertCircle className="w-3.5 h-3.5 text-[#B56A00]" />
              <span className="font-serif">
                कोई सक्रिय कुंडली नहीं चुनी गई। सामान्य ज्योतिष व पंचांग सक्रिय है।
              </span>
            </div>
          )}

          {/* Quick Action Button for 1-Tap Full Reading */}
          {activeKundali ? (
            <button
              onClick={() =>
                handleSubmit(
                  'मेरी सम्पूर्ण जन्म कुंडली का गहन विश्लेषण करें: प्रमुख राजयोग, ग्रह स्थिति, वर्तमान महादशा का फल और कष्ट निवारण हेतु सटीक सात्विक उपाय बताएं।'
                )
              }
              className="px-2.5 py-1 bg-gradient-to-r from-[#B56A00] to-[#8C6239] text-white rounded-lg text-xs font-bold shadow-xs hover:from-[#8C6239] hover:to-[#5C3A21] transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>✨ सम्पूर्ण कुंडली फलादेश व उपाय</span>
            </button>
          ) : (
            onNavigateTab && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('kundali');
                }}
                className="px-2.5 py-1 bg-[#7A1D1D] text-white rounded-lg text-xs font-bold shadow-xs hover:bg-[#5C1414] transition flex items-center gap-1 cursor-pointer"
              >
                <span>➕ कुंडली बनाएँ / लोड करें</span>
              </button>
            )
          )}
        </div>

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
        <div className="bg-[#EBDCC0] px-3 py-1.5 overflow-x-auto flex items-center gap-1.5 border-b border-[#8C6239]/30">
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
              <Sparkles className="w-3 h-3 text-[#B56A00] group-hover:scale-110 transition shrink-0" />
              <span className="truncate max-w-[280px]">{sug}</span>
            </button>
          ))}
        </div>

        {/* Messages List Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-[#FAF2E4]">
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
                  className={`max-w-[94%] sm:max-w-[85%] rounded-xl p-3.5 sm:p-5 relative ${
                    isUma
                      ? 'bg-[#FFFDF8] border-2 border-[#8C6239]/30 text-[#3E2714] shadow-md'
                      : 'bg-gradient-to-r from-[#7A1D1D] to-[#8F2121] text-[#FAF2E4] border border-[#B58738] shadow-md font-serif ml-6'
                  }`}
                >
                  {isUma && (
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#8C6239]/20 text-xs text-[#735133]">
                      <div className="flex items-center gap-1.5 font-serif font-bold text-[#8F2121]">
                        <span>॥</span>
                        <span>उमा ज्योतिषाचार्य निर्णय</span>
                        <span>॥</span>
                        {msg.source === 'gemini' && (
                          <span className="bg-amber-100 text-[#B56A00] text-[10px] px-1.5 py-0.2 rounded border border-amber-300 font-sans">
                            AI
                          </span>
                        )}
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
                          if (msg.actionPayload?.type === 'open_muhurat') onNavigateTab('muhurat');
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
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                activeKundali
                  ? `उमा से ${activeKundali.name} जी की कुंडली, करियर, विवाह, दशा या उपाय पूछें...`
                  : 'उमा से कोई भी ज्योतिषीय प्रश्न, राहुकाल, चौघड़िया या उपाय पूछें...'
              }
              className="flex-1 bg-[#FFFDF8] border-2 border-[#8C6239]/40 focus:border-[#7A1D1D] rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-base font-serif text-[#3E2714] placeholder:text-[#8C6239]/70 outline-none shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] disabled:opacity-40 hover:from-[#5C1414] hover:to-[#4A1010] text-[#FAF2E4] font-bold rounded-xl transition shadow-md flex items-center gap-1.5 text-xs sm:text-sm font-serif cursor-pointer"
            >
              <span>पूछें</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* WhatsApp Client Bot Modal Overlay */}
        {isWhatsAppBotOpen && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
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
              <div className="p-4 overflow-y-auto space-y-4 text-sm font-serif">
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
      </div>
    </div>
  );
};
