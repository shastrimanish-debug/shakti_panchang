import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  MessageCircle,
  PhoneCall,
  Car,
  Briefcase,
  Coins,
  Calendar,
  PenTool,
} from 'lucide-react';
import {
  NumberInfo,
  NUMBER_DATA,
  reduceToSingleDigit,
} from '../services/numerology';
import { umaVoice } from '../services/UmaVoiceService';

export interface AnkChatRoomProps {
  inputName: string;
  inputDay: number;
  inputMonth: number;
  inputYear: number;
  gender: 'male' | 'female';
  mobileNum: string;
  vehicleNum: string;
  mulankNum: number;
  bhagyankNum: number;
  namankData: { single: number; compound: number };
  kuaNum: number;
  personalYear: { yearNum: number; theme: string; advice: string };
  loshu: {
    counts: Record<number, number>;
    missingNumbers: number[];
    goldenRajYoga: boolean;
    silverRajYoga: boolean;
  };
  mulank: NumberInfo;
  bhagyank: NumberInfo;
  namank: NumberInfo;
  onOpenUmaWithQuery?: (query: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'uma';
  text: string;
  timestamp: Date;
  followUpChips?: string[];
}

export const AnkChatRoom: React.FC<AnkChatRoomProps> = ({
  inputName,
  inputDay,
  inputMonth,
  inputYear,
  gender,
  mobileNum,
  vehicleNum,
  mulankNum,
  bhagyankNum,
  namankData,
  kuaNum,
  personalYear,
  loshu,
  mulank,
  bhagyank,
  namank,
  onOpenUmaWithQuery,
}) => {
  const [inputText, setInputText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const cleanName = inputName.trim() || 'प्रिय यजमान';
  const mulankPlanet = mulank.planet.split(' ')[0];
  const bhagyankPlanet = bhagyank.planet.split(' ')[0];
  const namankPlanet = namank.planet.split(' ')[0];

  // Mobile and Vehicle evaluations
  const mobileDigitsSum = useMemo(() => {
    const digits = mobileNum.replace(/\D/g, '');
    let sum = 0;
    for (const d of digits) sum += parseInt(d, 10) || 0;
    return reduceToSingleDigit(sum);
  }, [mobileNum]);

  const vehicleDigitsSum = useMemo(() => {
    const cleaned = vehicleNum.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let sum = 0;
    for (const ch of cleaned) {
      if (/[0-9]/.test(ch)) sum += parseInt(ch, 10);
      else if (/[A-Z]/.test(ch)) {
        // Simple letter values
        const code = ch.charCodeAt(0) - 64;
        sum += code;
      }
    }
    return reduceToSingleDigit(sum);
  }, [vehicleNum]);

  const isMobileFriendly = mulank.friendlyNumbers.includes(mobileDigitsSum);
  const isVehicleFriendly = mulank.friendlyNumbers.includes(vehicleDigitsSum);

  // Quick chips shown to the user
  const quickSuggestions = [
    { label: '🔤 क्या मेरे नाम की स्पेलिंग सही है?', query: 'क्या मेरे नाम की स्पेलिंग सही है?' },
    { label: '💼 मेरे लिए शुभ करियर व बिजनेस क्या है?', query: 'मेरे लिए शुभ करियर और व्यापार कौन सा है?' },
    { label: '🌟 मेरे लकी नंबर, शुभ दिन और रंग बताएं', query: 'मेरे लकी नंबर, शुभ दिन और शुभ रंग कौन से हैं?' },
    { label: '📱 मेरा मोबाइल व गाड़ी नंबर अनुकूल है या नहीं?', query: 'मेरा मोबाइल नंबर और गाड़ी का नंबर कैसा है?' },
    { label: '🪔 धन बरकत और सफलता के सरल उपाय', query: 'धन बरकत और कर्ज मुक्ति के लिए कौन सा उपाय करें?' },
    { label: `📅 वर्ष ${new Date().getFullYear()} मेरे लिए कैसा रहेगा?`, query: `व्यक्तिगत वर्ष ${new Date().getFullYear()} फलादेश बताएं` },
    { label: '📐 मेरी जन्मतिथि में कौन से राजयोग हैं?', query: 'लो-शू ग्रिड और मेरी जन्मतिथि के राजयोग बताएं' },
  ];

  // Build the initial welcome message from Vidushi Uma
  const buildInitialGreeting = (): ChatMessage => {
    const isFriendly =
      mulank.friendlyNumbers.includes(bhagyankNum) ||
      bhagyank.friendlyNumbers.includes(mulankNum) ||
      mulankNum === bhagyankNum;

    const greetingText = `प्रणाम ${cleanName} जी! 🙏

मैंने आपकी जन्मतिथि (${String(inputDay).padStart(2, '0')}/${String(inputMonth).padStart(2, '0')}/${inputYear}) और नाम के आधार पर आपके वैदिक अंकों का अध्ययन किया है:

• आपका मूलांक ${mulankNum} (स्वामी: ${mulankPlanet}) है — यह आपके स्वभाव, निर्णय क्षमता और मूल ऊर्जा को दर्शाता है।
• आपका भाग्यांक ${bhagyankNum} (स्वामी: ${bhagyankPlanet}) है — यह आपके जीवन की दिशा, भाग्य और कार्यक्षेत्र को निर्देशित करता है।
• आपका नामांक ${namankData.single} (संयुक्त अंक ${namankData.compound}, स्वामी: ${namankPlanet}) है।

${
  isFriendly
    ? `✨ शुभ संयोग: आपके मूलांक ${mulankNum} और भाग्यांक ${bhagyankNum} में परस्पर मधुर मित्रता है। यह संयोग जीवन में मान-सम्मान, नेतृत्व शक्ति और निरंतर प्रगति का मार्ग प्रशस्त करता है।`
    : `✨ अंक संतुलन: आपके मूलांक ${mulankNum} और भाग्यांक ${bhagyankNum} की प्रकृति अलग-अलग है। अपने नाम की सही स्पेलिंग और शुभ मित्र अंकों के प्रयोग से आप जीवन में बहुत बड़ा भाग्योदय प्राप्त कर सकते हैं।`
}

बताइए, आज आप अपने बारे में क्या जानना चाहते हैं? आप नीचे दिए गए किसी भी विषय पर टैप कर सकते हैं या साधारण बातचीत की तरह अपना प्रश्न लिख सकते हैं।`;

    return {
      id: 'init_welcome',
      sender: 'uma',
      text: greetingText,
      timestamp: new Date(),
      followUpChips: [
        'क्या मेरे नाम की स्पेलिंग सही है?',
        'मेरे लिए शुभ करियर और व्यापार कौन सा है?',
        'मेरे लकी नंबर, शुभ दिन और रंग बताएं',
        'धन बरकत के सरल उपाय बताएं',
      ],
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildInitialGreeting()]);

  // Reset or update welcome message if user changes profile inputs
  useEffect(() => {
    setMessages([buildInitialGreeting()]);
  }, [inputName, inputDay, inputMonth, inputYear, gender]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Conversational response engine for Numerology
  const generateAnkResponse = (query: string): { reply: string; chips: string[] } => {
    const q = query.toLowerCase().trim();

    // 1. Casual Greetings / How are you
    if (/^(नमस्ते|प्रणाम|जय श्री राम|जय श्री महाकाल|हर हर महादेव|राधे राधे|हेलो|हाय|hi|hello|hey|namaste|pranam|कैसे हो|कैसी हो|क्या हाल)[\s!?.]*$/i.test(q)) {
      return {
        reply: `सदा प्रसन्न रहें ${cleanName} जी! 🙏\n\nमैं बिल्कुल आनंद में हूँ। आपकी जन्मतिथि (${inputDay}/${inputMonth}/${inputYear}) के अनुसार आपका मूलांक ${mulankNum} (${mulankPlanet}) और भाग्यांक ${bhagyankNum} (${bhagyankPlanet}) का चार्ट मेरे सामने खुला है।\n\nबताइए, आज आप अपने नाम की स्पेलिंग, करियर, व्यापार, लकी नंबर या किसी अन्य विषय में क्या जानना चाहते हैं?`,
        chips: [
          'क्या मेरे नाम की स्पेलिंग सही है?',
          'मेरे लिए शुभ करियर और व्यापार कौन सा है?',
          'मेरे लकी नंबर, शुभ दिन और रंग बताएं',
        ],
      };
    }

    // 2. Thank you / Appreciation
    if (/धन्यवाद|थैंक यू|thanks|thank you|शुक्रिया|बढ़िया|बहुत अच्छा/i.test(q)) {
      return {
        reply: `आपका हार्दिक अभिनंदन ${cleanName} जी! 🙏\n\nश्रीगणेश जी और नवग्रहों की कृपा आप पर सदा बनी रहे। अंक ज्योतिष या नाम स्पेलिंग को लेकर मन में जब भी कोई जिज्ञासा हो, आप कभी भी मुझसे पूछ सकते हैं।`,
        chips: [
          `वर्ष ${new Date().getFullYear()} मेरे लिए कैसा रहेगा?`,
          'धन बरकत और कर्ज मुक्ति के उपाय बताएं',
          'मेरा मोबाइल व गाड़ी नंबर अनुकूल है या नहीं?',
        ],
      };
    }

    // 3. Name spelling / Signature / Namank
    if (/नाम|स्पेलिंग|spelling|नामांक|अक्षर|हस्ताक्षर|signature|sign|नाम सुधार/i.test(q)) {
      const isNameFriendly =
        mulank.friendlyNumbers.includes(namankData.single) ||
        bhagyank.friendlyNumbers.includes(namankData.single);

      let spellingAdvice = '';
      if (isNameFriendly) {
        spellingAdvice = `बधाई हो! आपका वर्तमान नामांक ${namankData.single} आपके मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} का मित्र अंक है। इसलिए आपको अपने नाम की स्पेलिंग में कोई बदलाव करने की आवश्यकता नहीं है।`;
      } else {
        const targetNumber = mulank.friendlyNumbers[0] || 1;
        spellingAdvice = `वर्तमान में आपका नामांक ${namankData.single} आपके मूलांक ${mulankNum} के मित्र अंकों (${mulank.friendlyNumbers.join(', ')}) से थोड़ा भिन्न है। अपने नाम में एक अतिरिक्त स्वर (A, E, I) जोड़कर कुल जोड़ को मित्र अंक ${targetNumber} पर लाना अत्यंत फलदायी रहेगा।`;
      }

      const text = `जी ${cleanName} जी, आपके नाम («${cleanName.toUpperCase()}») का कॉल्डियन अंक शास्त्र के अनुसार विश्लेषण इस प्रकार है:

• नाम का कुल संयुक्त योग: ${namankData.compound}
• एकल नामांक (Name Number): अंक ${namankData.single} (स्वामी: ${namankPlanet})

${spellingAdvice}

✍️ भाग्यशाली हस्ताक्षर (Signature) के ३ अचूक नियम:
१. हस्ताक्षर का पहला अक्षर सदा बड़ा, स्पष्ट और आत्मविश्वास से भरा रखें।
२. हस्ताक्षर की दिशा हमेशा नीचे बाएं से ऊपर दाएं (लगभग ४५ डिग्री कोण) उठती हुई होनी चाहिए—यह जीवन में निरन्तर उत्थान का प्रतीक है।
३. हस्ताक्षर के अंत में एक बिंदु (.) लगाएं और भूलकर भी अपने हस्ताक्षर को बीच से या उल्टी रेखा से न काटें।`;

      return {
        reply: text,
        chips: [
          'मेरे लिए शुभ करियर और व्यापार कौन सा है?',
          'मेरे लकी नंबर, शुभ दिन और रंग बताएं',
          'धन बरकत और सफलता के सरल उपाय बताएं',
        ],
      };
    }

    // 4. Career / Job / Business
    if (/करियर|नौकरी|बिजनेस|व्यापार|काम|आजीविका|धंधा|career|job|business|work/i.test(q)) {
      const topCareers = mulank.careers.slice(0, 5).join(', ');
      const text = `जी ${cleanName} जी, आपके मूलांक ${mulankNum} (स्वामी: ${mulankPlanet}) और भाग्यांक ${bhagyankNum} (स्वामी: ${bhagyankPlanet}) के अनुसार आपके लिए निम्नलिखित कार्यक्षेत्र सर्वाधिक उन्नतिदायक रहेंगे:

💼 आपके लिए श्रेष्ठ आजीविका:
• ${topCareers}

🌟 व्यापार या नौकरी का चयन:
${
  mulankNum === 1 || mulankNum === 3 || mulankNum === 9
    ? `आपके अंकों में जन्मजात नेतृत्व, स्वाभिमान और स्वतंत्र निर्णय लेने की अद्भुत शक्ति है। इसलिए स्वतंत्र व्यवसाय, प्रशासन, परामर्श या प्रबंधन में आप बहुत तेजी से सफलता प्राप्त करेंगे।`
    : mulankNum === 2 || mulankNum === 6 || mulankNum === 7
    ? `आपकी प्रकृति में रचनात्मकता, सौम्यता और गहरी समझ है। कला, शिक्षा, डिजाइन, साझेदारी या सेवा क्षेत्र आपके लिए अत्यंत लाभकारी रहेंगे।`
    : `आपके अंकों में परिश्रम, व्यावहारिकता और स्थिरता का विशेष गुण है। तकनीक, निर्माण, वित्त या संगठित उद्योग में आपकी सफलता सुनिश्चित है।`
}

💡 भाग्योदय सूत्र:
किसी भी नए कार्य, मीटिंग या अनुबंध के लिए ${mulank.luckyDays.join(' व ')} का दिन चुनें और अपने साथ ${mulank.luckyColors[0]} रंग का रुमाल या कलम रखें।`;

      return {
        reply: text,
        chips: [
          'धन बरकत और कर्ज मुक्ति के उपाय बताएं',
          'मेरे लकी नंबर, शुभ दिन और रंग बताएं',
          `व्यक्तिगत वर्ष ${new Date().getFullYear()} मेरे करियर के लिए कैसा रहेगा?`,
        ],
      };
    }

    // 5. Lucky Numbers, Days, Colors, Gem
    if (/लकी|शुभ|रंग|वार|दिन|रत्न|रुद्राक्ष|अंक|lucky|color|day|gem|stone/i.test(q)) {
      const text = `जी ${cleanName} जी, आपके मूलांक ${mulankNum} और भाग्यांक ${bhagyankNum} के अनुसार आपके संपूर्ण भाग्यशाली कारक इस प्रकार हैं:

🌟 लकी नंबर (शुभ अंक): अंक ${mulank.friendlyNumbers.join(', ')} (विशेषकर ${mulank.luckyDates.slice(0, 3).join(', ')} तारीखें)
📅 शुभ दिन (वार): ${mulank.luckyDays.join(', ')}
🎨 शुभ रंग: ${mulank.luckyColors.join(', ')}
💎 शुभ रत्न: ${mulank.luckyGem} (${mulank.subGem})
📿 सिद्ध रुद्राक्ष: ${mulank.rudraksha}
🪔 इष्ट देवता: ${mulank.deity}

⚠️ इनसे सावधानी रखें:
• शत्रु अंक: ${mulank.enemyNumbers.length > 0 ? mulank.enemyNumbers.join(', ') : 'कोई मुख्य शत्रु अंक नहीं'}
• विरोधी रंग: ${mulank.enemyNumbers.includes(8) ? 'गहरा काला व नीला' : 'धूमिल व मटमैले रंग'}`;

      return {
        reply: text,
        chips: [
          'धन बरकत और कर्ज मुक्ति के उपाय बताएं',
          'क्या मेरे नाम की स्पेलिंग सही है?',
          'मेरा मोबाइल व गाड़ी नंबर अनुकूल है या नहीं?',
        ],
      };
    }

    // 6. Mobile & Vehicle Number
    if (/मोबाइल|गाड़ी|वाहन|कार|नंबर|mobile|vehicle|car|bike/i.test(q)) {
      const text = `जी ${cleanName} जी, आपके मोबाइल (${mobileNum}) और वाहन (${vehicleNum}) का अंक विश्लेषण:

📱 मोबाइल नंबर विश्लेषण:
• आपके मोबाइल नंबर के अंकों का कुल योग एकल अंक ${mobileDigitsSum} बनता है।
• निर्णय: यह अंक आपके मूलांक ${mulankNum} के लिए ${
        isMobileFriendly
          ? 'अत्यंत शुभ, व्यापारिक लाभ व संपर्क बढ़ाने वाला है ✓'
          : 'सामान्य है। इसके प्रभाव को अनुकूल बनाने के लिए फोन के पीछे पीले या सुनहरे रंग से अपना कुआं अंक (' + kuaNum + ') लिखें।'
      }

🚗 वाहन नंबर विश्लेषण:
• आपके वाहन नंबर के अक्षरों व अंकों का कुल योग एकल अंक ${vehicleDigitsSum} बनता है।
• निर्णय: यह अंक आपके लिए ${
        isVehicleFriendly
          ? 'सुरक्षित, शांतिदायक व यात्रा में मंगलकारी है ✓'
          : 'सामान्य है। वाहन की सुरक्षा हेतु उसमें तांबे का छोटा स्वस्तिक या मारुति यंत्र अवश्य स्थापित करें।'
      }

💡 नया नंबर चुनते समय ध्यान रखें:
मोबाइल या गाड़ी के अंतिम ४ अंकों का जोड़ हमेशा अपने मित्र अंक (${mulank.friendlyNumbers.join(', ')}) पर रखें।`;

      return {
        reply: text,
        chips: [
          'मेरे लकी नंबर, शुभ दिन और रंग बताएं',
          'धन बरकत और सफलता के सरल उपाय बताएं',
          'क्या मेरे नाम की स्पेलिंग सही है?',
        ],
      };
    }

    // 7. Wealth / Remedies / Upay
    if (/धन|बरकत|पैसा|आर्थिक|कर्ज|समृद्धि|उपाय|wealth|money|finance|remedy|upay/i.test(q)) {
      const text = `जी ${cleanName} जी, आपके मूलांक ${mulankNum} (${mulankPlanet}) और भाग्यांक ${bhagyankNum} के लिए धन-समृद्धि के ३ अचूक वैदिक व अंक उपाय:

१. 💧 जल-चिकित्सा (Water Therapy):
प्रतिदिन ${mulank.waterBottleColor} में जल भरकर प्रातःकाल २ घंटे सूर्य प्रकाश में रखें और फिर उस अभिमंत्रित जल का सेवन करें। इससे शरीर में आपके ग्रह का आत्मबल और सकारात्मक आभा जाग्रत होती है।

२. 🪙 व्यक्तिगत कुआं अंक (Kua Number ${kuaNum}) प्रयोग:
आपका व्यक्तिगत ऊर्जा अंक ${kuaNum} है। एक छोटे चौकोर श्वेत पत्र पर हरे या सुनहरे स्याही से «${kuaNum}» लिखकर अपनी तिजोरी, गल्ले या पर्स में रखें। इससे आर्थिक अवरोध दूर होते हैं।

३. 🪔 दैनिक सिद्ध मंत्र जप:
प्रतिदिन प्रातः स्नान के बाद शांत मन से इस मंत्र का २७ या १०८ बार जप करें:
«${mulank.mantra}»
(दान सामग्री: ${mulank.charity.slice(0, 3).join(', ')})`;

      return {
        reply: text,
        chips: [
          'मेरे लिए शुभ करियर और व्यापार कौन सा है?',
          'क्या मेरे नाम की स्पेलिंग सही है?',
          `वर्ष ${new Date().getFullYear()} मेरे लिए कैसा रहेगा?`,
        ],
      };
    }

    // 8. Personal Year / 2026 forecast
    if (/वर्ष|साल|2026|year|forecast|भविष्य/i.test(q)) {
      const currentYear = new Date().getFullYear();
      const text = `जी ${cleanName} जी, अंक ज्योतिष के अनुसार वर्ष ${currentYear} आपके जीवन का व्यक्तिगत वर्ष अंक ${personalYear.yearNum} (Personal Year ${personalYear.yearNum}) है।

🎯 इस वर्ष का मुख्य प्रभाव:
«${personalYear.theme}»

💡 आपके लिए वैदिक मार्गदर्शन:
${personalYear.advice}

इस वर्ष अपने मूलांक ${mulankNum} की शक्तियों (धैर्य, एकाग्रता व आत्मविश्वास) पर भरोसा रखें। किसी भी नए अनुबंध या महत्वपूर्ण कार्य की शुरुआत के लिए ${mulank.luckyDays[0] || 'शुभ दिन'} का चयन करें।`;

      return {
        reply: text,
        chips: [
          'धन बरकत और कर्ज मुक्ति के उपाय बताएं',
          'मेरे लिए शुभ करियर और व्यापार कौन सा है?',
          'मेरे लकी नंबर, शुभ दिन और रंग बताएं',
        ],
      };
    }

    // 9. Loshu Grid / Rajyoga
    if (/लो-शू|राजयोग|ग्रिड|loshu|grid|missing|अनुपस्थित/i.test(q)) {
      const presentList = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .filter((n) => (loshu.counts[n] || 0) > 0)
        .join(', ');

      const text = `जी ${cleanName} जी, आपकी जन्मतिथि (${inputDay}/${inputMonth}/${inputYear}) के आधार पर ३x३ लो-शू चक्र का फलादेश इस प्रकार है:

🌟 उपस्थित अंक: ${presentList}
${
  loshu.goldenRajYoga
    ? '✨ स्वर्ण राजयोग (4-5-6): आपकी जन्मतिथि में ४, ५ और ६ तीनों अंक मौजूद हैं! यह अंक-ज्योतिष का सबसे शक्तिशाली राजयोग है, जो जीवन में अचल संपत्ति, स्थायी सफलता और सामाजिक प्रतिष्ठा देता है।'
    : ''
}
${
  loshu.silverRajYoga
    ? '🥈 रजत राजयोग (2-5-8): आपकी जन्मतिथि में २, ५ और ८ तीनों अंक उपस्थित हैं। यह प्रॉपर्टी, भूमि-भवन और अचल संपत्ति के लिए अत्यंत भाग्यशाली माना जाता है।'
    : ''
}
${
  !loshu.goldenRajYoga && !loshu.silverRajYoga
    ? '🌟 संतुलित ग्रिड: आपकी जन्मतिथि में व्यावहारिक और बौद्धिक अंकों का सुंदर संतुलन है। सही दिशा में किया गया सतत प्रयास आपको बड़ी सफलता दिलाएगा।'
    : ''
}

💡 अनुपस्थित अंक (${loshu.missingNumbers.join(', ') || 'कोई नहीं'}) का निवारण:
घर के उत्तर-पूर्व (ईशान कोण) को सदैव स्वच्छ और प्रकाशित रखें तथा अपने कुआं अंक ${kuaNum} को ऊर्जा सेतु के रूप में प्रयोग करें।`;

      return {
        reply: text,
        chips: [
          'क्या मेरे नाम की स्पेलिंग सही है?',
          'धन बरकत और सफलता के सरल उपाय बताएं',
          'मेरे लिए शुभ करियर और व्यापार कौन सा है?',
        ],
      };
    }

    // 10. Default General Conversational Fallback
    const isFriendly =
      mulank.friendlyNumbers.includes(bhagyankNum) ||
      bhagyank.friendlyNumbers.includes(mulankNum);

    const text = `जी ${cleanName} जी, आपके प्रश्न पर मैंने आपके अंक चार्ट (मूलांक ${mulankNum} - स्वामी ${mulankPlanet}, भाग्यांक ${bhagyankNum} - स्वामी ${bhagyankPlanet}, नामांक ${namankData.single}) के अनुसार विचार किया है।

आपके अंकों की ऊर्जा यह दर्शाती है कि आप जिस विषय को लेकर प्रयासरत हैं, उसमें आपकी स्वाभाविक क्षमताएं पूरी तरह से सहायक हैं। ${
      isFriendly
        ? 'आपके मूलांक और भाग्यांक का मित्र संबंध आपके प्रयासों को सही दिशा और स्थिरता देता है।'
        : 'अपने कार्य में धैर्य रखें और नाम की सही स्पेलिंग तथा शुभ मित्र अंकों (' +
          mulank.friendlyNumbers.join(', ') +
          ') के प्रभाव से अनुकूलता प्राप्त करें।'
    }

सफलता में वृद्धि के लिए प्रतिदिन प्रातः «${mulank.mantra}» का स्मरण करें और शुभ कार्यों के लिए ${mulank.luckyDays.join(' व ')} का दिन चुनें।

यदि आप किसी विशेष विषय पर विस्तार से जानना चाहें, तो नीचे दिए गए प्रश्नों में से चुनें!`;

    return {
      reply: text,
      chips: [
        'क्या मेरे नाम की स्पेलिंग सही है?',
        'मेरे लिए शुभ करियर और व्यापार कौन सा है?',
        'मेरे लकी नंबर, शुभ दिन और रंग बताएं',
        'धन बरकत और सफलता के सरल उपाय बताएं',
      ],
    };
  };

  // Send message handler
  const handleSendMessage = (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    const { reply, chips } = generateAnkResponse(trimmed);

    const umaMsg: ChatMessage = {
      id: `uma_${Date.now() + 1}`,
      sender: 'uma',
      text: reply,
      timestamp: new Date(),
      followUpChips: chips,
    };

    setMessages((prev) => [...prev, userMsg, umaMsg]);
    setInputText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Text-To-Speech with Uma Voice
  const handleToggleSpeak = async (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      umaVoice.stop();
      setSpeakingMessageId(null);
      return;
    }

    umaVoice.stop();
    setSpeakingMessageId(msg.id);

    // Clean plain text for speech
    const cleanSpeechText = msg.text
      .replace(/[*#_~`]/g, '')
      .replace(/•/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .trim();

    try {
      await umaVoice.speak(cleanSpeechText, {
        voiceStyle: 'uma',
        rate: 0.95,
        pitch: 1.04,
        onStart: () => setSpeakingMessageId(msg.id),
        onEnd: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null),
      });
    } catch {
      setSpeakingMessageId(null);
    }
  };

  // Copy text to clipboard
  const handleCopy = (msg: ChatMessage) => {
    const cleanText = msg.text.replace(/[*#_~`]/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedMessageId(msg.id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // WhatsApp Share
  const handleShareWhatsApp = (msg: ChatMessage) => {
    const cleanText = msg.text.replace(/[*#_~`]/g, '');
    const shareContent = `🔢 *सनातन शक्ति पंचांग — विदुषी उमा अंक ज्योतिष संवाद*\n👤 यजमान: ${cleanName} (मूलांक: ${mulankNum} | भाग्यांक: ${bhagyankNum} | नामांक: ${namankData.single})\n\n${cleanText}\n\n📲 सनातन शक्ति पंचांग ऐप`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareContent)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Reset chat
  const handleResetChat = () => {
    umaVoice.stop();
    setSpeakingMessageId(null);
    setMessages([buildInitialGreeting()]);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF5ED] rounded-2xl border-2 border-[#B58738]/50 shadow-md overflow-hidden">
      {/* 1. Sacred Header */}
      <div className="px-3 py-2.5 bg-gradient-to-r from-[#7A1D1D] via-[#8F2121] to-[#5C1414] text-[#FAF2E4] border-b border-[#D4AF37] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#996515] text-[#2C0A0A] border border-[#FFE8A3] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            ॐ
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-granth text-xs sm:text-sm font-black text-[#FFD88A] truncate">
                विदुषी उमा — अंक-ज्योतिष संवाद
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-800 text-emerald-100 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                सक्रिय परामर्श
              </span>
            </div>
            <p className="text-[10px] text-[#F5ECE0]/90 font-serif truncate">
              {cleanName} • जन्म: {inputDay}/{inputMonth}/{inputYear} • मूलांक {mulankNum} ({mulankPlanet}) • भाग्यांक {bhagyankNum} ({bhagyankPlanet})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            title="नया संवाद शुरू करें"
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-[#FFD88A] text-xs transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px] font-bold">नया संवाद</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Suggestion Carousel (Instant Questions) */}
      <div className="px-2.5 py-1.5 bg-[#F4E8D1] border-b border-[#8C6239]/25 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-[#7A1D1D] shrink-0 font-serif flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          त्वरित प्रश्न:
        </span>
        {quickSuggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.query)}
            className="px-2.5 py-1 bg-white hover:bg-amber-50 text-[#5C3A21] hover:text-[#7A1D1D] text-[11px] font-serif font-bold rounded-full border border-amber-300 shadow-2xs shrink-0 cursor-pointer transition active:scale-95"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 3. Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-[320px] max-h-[58vh] sm:max-h-[64vh] overflow-y-auto p-3 sm:p-4 space-y-3.5 overscroll-contain"
      >
        {messages.map((msg) => {
          const isUma = msg.sender === 'uma';
          const isSpeaking = speakingMessageId === msg.id;
          const isCopied = copiedMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2 sm:gap-2.5 ${isUma ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}
            >
              {isUma && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#7A1D1D] to-[#4A1010] text-[#FFD88A] border border-[#B58738] flex items-center justify-center shrink-0 text-xs font-bold shadow-xs mt-0.5">
                  ॐ
                </div>
              )}

              <div
                className={`max-w-[94%] sm:max-w-[85%] rounded-2xl p-3 sm:p-3.5 relative shadow-xs ${
                  isUma
                    ? 'bg-white border border-[#8C6239]/25 text-[#3E2714] rounded-tl-xs'
                    : 'bg-gradient-to-r from-[#7A1D1D] to-[#8F2121] text-[#FAF2E4] border border-[#B58738] rounded-tr-xs'
                }`}
              >
                {/* Header for Uma Message */}
                {isUma && (
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#8C6239]/15 text-[11px] text-[#735133]">
                    <span className="font-serif font-black text-[#7A1D1D] flex items-center gap-1">
                      <span>॥</span>
                      <span>विदुषी उमा परामर्श</span>
                      <span>॥</span>
                    </span>
                    <span className="text-[10px] text-[#8C6239]">
                      {msg.timestamp.toLocaleTimeString('hi-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {/* Message Body */}
                <div className="font-serif text-xs sm:text-[13px] leading-relaxed whitespace-pre-line select-text">
                  {msg.text}
                </div>

                {/* Uma Message Action Toolbar (Audio, Share, Copy) */}
                {isUma && (
                  <div className="mt-2.5 pt-2 border-t border-[#8C6239]/15 flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(msg)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition cursor-pointer ${
                          isSpeaking
                            ? 'bg-[#7A1D1D] text-white border-[#7A1D1D]'
                            : 'bg-[#FAF5ED] text-[#5C3A21] border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-amber-700" />}
                        <span>{isSpeaking ? 'रोकें' : 'सुनें'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(msg)}
                        className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>शेयर</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg)}
                        className="px-2 py-1 rounded-lg bg-[#FAF5ED] hover:bg-amber-100 text-[#5C3A21] border border-amber-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-700" />}
                        <span>{isCopied ? 'कॉपी हुआ' : 'कॉपी'}</span>
                      </button>
                    </div>

                    <span className="text-[9px] text-[#8C6239] font-medium hidden sm:inline">
                      वैदिक अंक ज्योतिष सम्मत
                    </span>
                  </div>
                )}

                {/* Follow-up question chips */}
                {isUma && msg.followUpChips && msg.followUpChips.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#8C6239]/15 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#7A1D1D] font-serif flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      संबंधित प्रश्न (टैप करके पूछें):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.followUpChips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 bg-[#FAF5ED] hover:bg-[#F0E4D0] text-[#5C3A21] hover:text-[#7A1D1D] text-[10px] font-serif font-bold rounded-full border border-amber-300/80 cursor-pointer shadow-2xs transition active:scale-95"
                        >
                          • {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Chat Input Form (Fixed at Bottom) */}
      <form
        onSubmit={handleSubmit}
        className="p-2 sm:p-2.5 bg-white border-t border-amber-300/80 flex items-center gap-1.5 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="अंक ज्योतिष का कोई भी प्रश्न लिखें (उदा: मेरा लकी नंबर, नाम स्पेलिंग या उपाय)..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-[#3E2714] bg-[#FAF5ED] border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif placeholder:text-stone-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0 ${
            inputText.trim()
              ? 'bg-[#7A1D1D] hover:bg-[#5C1414] text-[#FFD88A] active:scale-95'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">पूछें</span>
        </button>
      </form>
    </div>
  );
};
