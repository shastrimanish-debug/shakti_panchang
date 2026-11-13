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
} from 'lucide-react';
import {
  NumberInfo,
  getLocalizedNumberInfo,
  reduceToSingleDigit,
} from '../services/numerology';
import { umaVoice } from '../services/UmaVoiceService';
import { useLanguage } from '../i18n';

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
  personalYear: {
    yearNum: number;
    theme: string;
    themeEn?: string;
    themeGu?: string;
    advice: string;
    adviceEn?: string;
    adviceGu?: string;
  };
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
}) => {
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const pickL = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);
  const dateLocale = cLang === 'en' ? 'en-US' : cLang === 'gu' ? 'gu-IN' : 'hi-IN';

  const [inputText, setInputText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const locMulank = useMemo(() => getLocalizedNumberInfo(mulank.number, cLang), [mulank.number, cLang]);
  const locBhagyank = useMemo(() => getLocalizedNumberInfo(bhagyank.number, cLang), [bhagyank.number, cLang]);
  const locNamank = useMemo(() => getLocalizedNumberInfo(namank.number, cLang), [namank.number, cLang]);

  const cleanName = inputName.trim() || pickL('प्रिय यजमान', 'Dear Seeker', 'પ્રિય યજમાન');
  const mulankPlanet = locMulank.planet.split(' ')[0];
  const bhagyankPlanet = locBhagyank.planet.split(' ')[0];
  const namankPlanet = locNamank.planet.split(' ')[0];

  const pyTheme = pickL(
    personalYear.theme,
    personalYear.themeEn || personalYear.theme,
    personalYear.themeGu || personalYear.theme
  );
  const pyAdvice = pickL(
    personalYear.advice,
    personalYear.adviceEn || personalYear.advice,
    personalYear.adviceGu || personalYear.advice
  );

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
        const code = ch.charCodeAt(0) - 64;
        sum += code;
      }
    }
    return reduceToSingleDigit(sum);
  }, [vehicleNum]);

  const isMobileFriendly = locMulank.friendlyNumbers.includes(mobileDigitsSum);
  const isVehicleFriendly = locMulank.friendlyNumbers.includes(vehicleDigitsSum);

  const curYear = new Date().getFullYear();

  const quickSuggestions = useMemo(() => [
    {
      label: pickL('🔤 क्या मेरे नाम की स्पेलिंग सही है?', '🔤 Is my name spelling harmonious?', '🔤 શું મારા નામની સ્પેલિંગ યોગ્ય છે?'),
      query: pickL('क्या मेरे नाम की स्पेलिंग सही है?', 'Is my name spelling harmonious?', 'શું મારા નામની સ્પેલિંગ યોગ્ય છે?'),
    },
    {
      label: pickL('💼 मेरे लिए शुभ करियर व बिजनेस क्या है?', '💼 Best career & business for me?', '💼 મારા માટે શુભ કારકિર્દી અને વ્યવસાય?'),
      query: pickL('मेरे लिए शुभ करियर और व्यापार कौन सा है?', 'Best career and business for me?', 'મારા માટે શુભ કારકિર્દી અને વ્યવસાય કયો છે?'),
    },
    {
      label: pickL('🌟 मेरे लकी नंबर, शुभ दिन और रंग बताएं', '🌟 Show my lucky numbers, days & colors', '🌟 મારા લકી નંબર, શુભ વાર અને રંગ જણાવો'),
      query: pickL('मेरे लकी नंबर, शुभ दिन और शुभ रंग कौन से हैं?', 'What are my lucky numbers, days and colors?', 'મારા લકી નંબર, શુભ વાર અને રંગ કયા છે?'),
    },
    {
      label: pickL('📱 मेरा मोबाइल व गाड़ी नंबर अनुकूल है या नहीं?', '📱 Are my mobile & vehicle numbers lucky?', '📱 મારો મોબાઇલ અને વાહન નંબર અનુકૂળ છે?'),
      query: pickL('मेरा मोबाइल नंबर और गाड़ी का नंबर कैसा है?', 'How are my mobile and vehicle numbers?', 'મારો મોબાઇલ નંબર અને વાહન નંબર કેવો છે?'),
    },
    {
      label: pickL('🪔 धन बरकत और सफलता के सरल उपाय', '🪔 Simple wealth & success remedies', '🪔 ધન વૃદ્ધિ અને સફળતાના સરળ ઉપાય'),
      query: pickL('धन बरकत और कर्ज मुक्ति के लिए कौन सा उपाय करें?', 'Simple remedies for wealth and success?', 'ધન વૃદ્ધિ અને દેવા મુક્તિના ઉપાય જણાવો'),
    },
    {
      label: pickL(`📅 वर्ष ${curYear} मेरे लिए कैसा रहेगा?`, `📅 How will year ${curYear} be for me?`, `📅 વર્ષ ${curYear} મારા માટે કેવું રહેશે?`),
      query: pickL(`व्यक्तिगत वर्ष ${curYear} फलादेश बताएं`, `Personal year ${curYear} forecast`, `વ્યક્તિગત વર્ષ ${curYear} ફળાદેશ જણાવો`),
    },
    {
      label: pickL('📐 मेरी जन्मतिथि में कौन से राजयोग हैं?', '📐 Which Raj Yogas exist in my Lo Shu grid?', '📐 મારી જન્મ તારીખમાં કયા રાજયોગ છે?'),
      query: pickL('लो-शू ग्रिड और मेरी जन्मतिथि के राजयोग बताएं', 'Show my Lo Shu grid and Raj Yogas', 'લો-શૂ ગ્રીડ અને મારી જન્મ તારીખના રાજયોગ જણાવો'),
    },
  ], [cLang, curYear]);

  const buildInitialGreeting = (): ChatMessage => {
    const isFriendly =
      locMulank.friendlyNumbers.includes(bhagyankNum) ||
      locBhagyank.friendlyNumbers.includes(mulankNum) ||
      mulankNum === bhagyankNum;

    const dobStr = `${String(inputDay).padStart(2, '0')}/${String(inputMonth).padStart(2, '0')}/${inputYear}`;

    const greetingText = pickL(
      `प्रणाम ${cleanName} जी! 🙏

मैंने आपकी जन्मतिथि (${dobStr}) और नाम के आधार पर आपके वैदिक अंकों का अध्ययन किया है:

• आपका मूलांक ${mulankNum} (स्वामी: ${mulankPlanet}) है — यह आपके स्वभाव, निर्णय क्षमता और मूल ऊर्जा को दर्शाता है।
• आपका भाग्यांक ${bhagyankNum} (स्वामी: ${bhagyankPlanet}) है — यह आपके जीवन की दिशा, भाग्य और कार्यक्षेत्र को निर्देशित करता है।
• आपका नामांक ${namankData.single} (संयुक्त अंक ${namankData.compound}, स्वामी: ${namankPlanet}) है।

${
  isFriendly
    ? `✨ शुभ संयोग: आपके मूलांक ${mulankNum} और भाग्यांक ${bhagyankNum} में परस्पर मधुर मित्रता है। यह संयोग जीवन में मान-सम्मान, नेतृत्व शक्ति और निरंतर प्रगति का मार्ग प्रशस्त करता है।`
    : `✨ अंक संतुलन: आपके मूलांक ${mulankNum} और भाग्यांक ${bhagyankNum} की प्रकृति अलग-अलग है। अपने नाम की सही स्पेलिंग और शुभ मित्र अंकों के प्रयोग से आप जीवन में बहुत बड़ा भाग्योदय प्राप्त कर सकते हैं।`
}

बताइए, आज आप अपने बारे में क्या जानना चाहते हैं? आप नीचे दिए गए किसी भी विषय पर टैप कर सकते हैं या साधारण बातचीत की तरह अपना प्रश्न लिख सकते हैं।`,
      `Pranam ${cleanName}! 🙏

I have analyzed your Vedic numerology profile based on your Date of Birth (${dobStr}) and Name:

• Your Root Number (Mulank) is ${mulankNum} (Ruler: ${mulankPlanet}) — reflecting your core nature, judgment, and primal energy.
• Your Destiny Number (Bhagyank) is ${bhagyankNum} (Ruler: ${bhagyankPlanet}) — guiding your life path, fortune, and career trajectory.
• Your Name Number (Namank) is ${namankData.single} (Compound ${namankData.compound}, Ruler: ${namankPlanet}).

${
  isFriendly
    ? `✨ Auspicious Synergy: Your Root Number ${mulankNum} and Destiny Number ${bhagyankNum} share warm harmony. This combination paves the way for honor, leadership, and steady growth.`
    : `✨ Number Balance: Your Root Number ${mulankNum} and Destiny Number ${bhagyankNum} carry distinct energies. Aligning your name spelling and using friendly numbers will unlock major fortune.`
}

What would you like to explore today? Tap any quick topic below or ask your question naturally.`,
      `પ્રણામ ${cleanName} જી! 🙏

મેં તમારી જન્મ તારીખ (${dobStr}) અને નામના આધારે તમારા વૈદિક અંકોનો અભ્યાસ કર્યો છે:

• તમારો મૂળાંક ${mulankNum} (સ્વામી: ${mulankPlanet}) છે — જે તમારા સ્વભાવ, નિર્ણય શક્તિ અને મૂળ ઊર્જાને દર્શાવે છે.
• તમારો ભાગ્યાંક ${bhagyankNum} (સ્વામી: ${bhagyankPlanet}) છે — જે તમારા જીવનની દિશા, ભાગ્ય અને કાર્યક્ષેત્રનું માર્ગદર્શન કરે છે.
• તમારો નામાંક ${namankData.single} (સંયુક્ત અંક ${namankData.compound}, સ્વામી: ${namankPlanet}) છે.

${
  isFriendly
    ? `✨ શુભ સંયોગ: તમારા મૂળાંક ${mulankNum} અને ભાગ્યાંક ${bhagyankNum} વચ્ચે મધુર મિત્રતા છે. આ સંયોગ જીવનમાં માન-સન્માન અને સતત પ્રગતિ આપે છે.`
    : `✨ અંક સંતુલન: તમારા મૂળાંક ${mulankNum} અને ભાગ્યાંક ${bhagyankNum} ની પ્રકૃતિ અલગ છે. નામની સાચી સ્પેલિંગ અને મિત્ર અંકોના ઉપયોગથી તમે મોટો ભાગ્યોદય મેળવી શકો છો.`
}

જણાવો, આજે તમે તમારા વિશે શું જાણવા માંગો છો? નીચે આપેલા વિષયો પર ટેપ કરો અથવા તમારો પ્રશ્ન લખો.`
    );

    return {
      id: 'init_welcome',
      sender: 'uma',
      text: greetingText,
      timestamp: new Date(),
      followUpChips: quickSuggestions.slice(0, 4).map((s) => s.query),
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildInitialGreeting()]);

  useEffect(() => {
    setMessages([buildInitialGreeting()]);
  }, [inputName, inputDay, inputMonth, inputYear, gender, cLang]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const generateAnkResponse = (query: string): { reply: string; chips: string[] } => {
    const q = query.toLowerCase().trim();

    // 1. Casual Greetings
    if (/^(नमस्ते|प्रणाम|जय श्री राम|जय श्री महाकाल|हर हर महादेव|राधे राधे|हेलो|हाय|hi|hello|hey|namaste|pranam|कैसे हो|कैसी हो|क्या हाल)[\s!?.]*$/i.test(q)) {
      return {
        reply: pickL(
          `सदा प्रसन्न रहें ${cleanName} जी! 🙏\n\nमैं बिल्कुल आनंद में हूँ। आपकी जन्मतिथि (${inputDay}/${inputMonth}/${inputYear}) के अनुसार आपका मूलांक ${mulankNum} (${mulankPlanet}) और भाग्यांक ${bhagyankNum} (${bhagyankPlanet}) का चार्ट मेरे सामने खुला है।\n\nबताइए, आज आप अपने नाम की स्पेलिंग, करियर, व्यापार, लकी नंबर या किसी अन्य विषय में क्या जानना चाहते हैं?`,
          `Blessings to you, ${cleanName}! 🙏\n\nBased on your birth date (${inputDay}/${inputMonth}/${inputYear}), your Root Number ${mulankNum} (${mulankPlanet}) and Destiny Number ${bhagyankNum} (${bhagyankPlanet}) chart is open before me.\n\nWhat would you like to know about your name spelling, career, business, lucky numbers, or remedies?`,
          `સદા પ્રસન્ન રહો ${cleanName} જી! 🙏\n\nતમારી જન્મ તારીખ (${inputDay}/${inputMonth}/${inputYear}) મુજબ તમારો મૂળાંક ${mulankNum} (${mulankPlanet}) અને ભાગ્યાંક ${bhagyankNum} (${bhagyankPlanet}) નો ચાર્ટ મારી સામે છે.\n\nજણાવો, આજે તમે નામની સ્પેલિંગ, કારકિર્દી, વ્યવસાય કે લકી નંબર વિશે શું જાણવા માંગો છો?`
        ),
        chips: quickSuggestions.slice(0, 3).map((s) => s.query),
      };
    }

    // 2. Thank you
    if (/धन्यवाद|थैंक यू|thanks|thank you|शुक्रिया|बढ़िया|बहुत अच्छा|આભાર/i.test(q)) {
      return {
        reply: pickL(
          `आपका हार्दिक अभिनंदन ${cleanName} जी! 🙏\n\nश्रीगणेश जी और नवग्रहों की कृपा आप पर सदा बनी रहे। अंक ज्योतिष या नाम स्पेलिंग को लेकर मन में जब भी कोई जिज्ञासा हो, आप कभी भी मुझसे पूछ सकते हैं।`,
          `You are most welcome, ${cleanName}! 🙏\n\nMay Lord Ganesha and the Navagrahas always bless you. Whenever you have any question about numerology or name alignment, feel free to ask anytime.`,
          `તમારો હાર્દિક આભાર ${cleanName} જી! 🙏\n\nશ્રી ગણેશજી અને નવગ્રહોની કૃપા તમારા પર સદા બની રહે. અંક જ્યોતિષ કે નામ સ્પેલિંગ વિશે કોઈ પણ જિજ્ઞાસા હોય ત્યારે તમે મને પૂછી શકો છો.`
        ),
        chips: [quickSuggestions[5].query, quickSuggestions[4].query, quickSuggestions[3].query],
      };
    }

    // 3. Name spelling / Signature / Namank
    if (/नाम|स्पेलिंग|spelling|नामांक|अक्षर|हस्ताक्षर|signature|sign|नाम सुधार|નામ|સ્પેલિંગ/i.test(q)) {
      const isNameFriendly =
        locMulank.friendlyNumbers.includes(namankData.single) ||
        locBhagyank.friendlyNumbers.includes(namankData.single);

      const targetNumber = locMulank.friendlyNumbers[0] || 1;
      const spellingAdvice = isNameFriendly
        ? pickL(
            `बधाई हो! आपका वर्तमान नामांक ${namankData.single} आपके मूलांक ${mulankNum} व भाग्यांक ${bhagyankNum} का मित्र अंक है। इसलिए आपको अपने नाम की स्पेलिंग में कोई बदलाव करने की आवश्यकता नहीं है।`,
            `Congratulations! Your current Name Number ${namankData.single} is a friendly vibration with your Root Number ${mulankNum} and Destiny Number ${bhagyankNum}. You do not need to alter your name spelling.`,
            `અભિનંદન! તમારો વર્તમાન નામાંક ${namankData.single} તમારા મૂળાંક ${mulankNum} અને ભાગ્યાંક ${bhagyankNum} નો મિત્ર અંક છે. તેથી નામની સ્પેલિંગ બદલવાની જરૂર નથી.`
          )
        : pickL(
            `वर्तमान में आपका नामांक ${namankData.single} आपके मूलांक ${mulankNum} के मित्र अंकों (${locMulank.friendlyNumbers.join(', ')}) से थोड़ा भिन्न है। अपने नाम में एक अतिरिक्त स्वर (A, E, I) जोड़कर कुल जोड़ को मित्र अंक ${targetNumber} पर लाना अत्यंत फलदायी रहेगा।`,
            `Currently your Name Number ${namankData.single} differs from your Root Number ${mulankNum}'s friendly numbers (${locMulank.friendlyNumbers.join(', ')}). Adding a balancing vowel (A, E, I) to align the total to ${targetNumber} will be highly beneficial.`,
            `હાલમાં તમારો નામાંક ${namankData.single} તમારા મૂળાંક ${mulankNum} ના મિત્ર અંકો (${locMulank.friendlyNumbers.join(', ')}) થી અલગ છે. નામમાં યોગ્ય સ્વર (A, E, I) ઉમેરીને કુલ યોગ મિત્ર અંક ${targetNumber} પર લાવવો લાભદાયી રહેશે.`
          );

      const text = pickL(
        `जी ${cleanName} जी, आपके नाम («${cleanName.toUpperCase()}») का कॉल्डियन अंक शास्त्र के अनुसार विश्लेषण इस प्रकार है:\n\n• नाम का कुल संयुक्त योग: ${namankData.compound}\n• एकल नामांक (Name Number): अंक ${namankData.single} (स्वामी: ${namankPlanet})\n\n${spellingAdvice}\n\n✍️ भाग्यशाली हस्ताक्षर (Signature) के ३ अचूक नियम:\n१. हस्ताक्षर का पहला अक्षर सदा बड़ा, स्पष्ट और आत्मविश्वास से भरा रखें।\n२. हस्ताक्षर की दिशा हमेशा नीचे बाएं से ऊपर दाएं (लगभग ४५ डिग्री कोण) उठती हुई होनी चाहिए—यह जीवन में निरन्तर उत्थान का प्रतीक है।\n३. हस्ताक्षर के अंत में एक बिंदु (.) लगाएं और भूलकर भी अपने हस्ताक्षर को बीच से या उल्टी रेखा से न काटें।`,
        `${cleanName}, here is your Chaldean Numerology analysis for «${cleanName.toUpperCase()}»:\n\n• Compound Name Total: ${namankData.compound}\n• Single Name Number (Namank): ${namankData.single} (Ruler: ${namankPlanet})\n\n${spellingAdvice}\n\n✍️ 3 Golden Rules for a Lucky Signature:\n1. Keep the first letter bold, tall, and clear to project confidence.\n2. Slant the signature gently upward (around 30–45° from bottom-left to top-right) to symbolize steady rise.\n3. Place a small dot (.) at the end and never strike or underline backward through your own name.`,
        `${cleanName} જી, તમારા નામ («${cleanName.toUpperCase()}») નું કોલ્ડિયન અંક શાસ્ત્ર મુજબ વિશ્લેષણ:\n\n• નામનો કુલ સંયુક્ત યોગ: ${namankData.compound}\n• એકલ નામાંક (Name Number): અંક ${namankData.single} (સ્વામી: ${namankPlanet})\n\n${spellingAdvice}\n\n✍️ ભાગ્યશાળી હસ્તાક્ષર (Signature) ના ૩ નિયમો:\n૧. સહીનો પ્રથમ અક્ષર હંમેશા મોટો અને સ્પષ્ટ રાખો.\n૨. સહી હંમેશા નીચે ડાબેથી ઉપર જમણી તરફ (લગભગ ૪૫ ડિગ્રી) ઊંચી જતી રાખો — તે પ્રગતિનું પ્રતીક છે.\n૩. સહીના અંતે એક નાનું ટપકું (.) મૂકો અને સહીને વચ્ચેથી ક્યારેય કાપશો નહીં.`
      );

      return {
        reply: text,
        chips: [quickSuggestions[1].query, quickSuggestions[2].query, quickSuggestions[4].query],
      };
    }

    // 4. Career / Job / Business
    if (/करियर|नौकरी|बिजनेस|व्यापार|काम|आजीविका|धंधा|career|job|business|work|કારકિર્દી|વ્યવસાય|નોકરી/i.test(q)) {
      const topCareers = locMulank.careers.slice(0, 5).join(', ');
      const pathGuidance =
        mulankNum === 1 || mulankNum === 3 || mulankNum === 9
          ? pickL(
              'आपके अंकों में जन्मजात नेतृत्व, स्वाभिमान और स्वतंत्र निर्णय लेने की अद्भुत शक्ति है। इसलिए स्वतंत्र व्यवसाय, प्रशासन, परामर्श या प्रबंधन में आप बहुत तेजी से सफलता प्राप्त करेंगे।',
              'Your numbers carry natural leadership, pride, and decisive drive. Independent business, administration, consulting, or management roles suit you extraordinarily well.',
              'તમારા અંકોમાં જન્મજાત નેતૃત્વ અને સ્વતંત્ર નિર્ણય લેવાની શક્તિ છે. સ્વતંત્ર વ્યવસાય, વહીવટ કે મેનેજમેન્ટમાં તમને ઝડપી સફળતા મળશે.'
            )
          : mulankNum === 2 || mulankNum === 6 || mulankNum === 7
          ? pickL(
              'आपकी प्रकृति में रचनात्मकता, सौम्यता और गहरी समझ है। कला, शिक्षा, डिजाइन, साझेदारी या सेवा क्षेत्र आपके लिए अत्यंत लाभकारी रहेंगे।',
              'Your nature blends creativity, diplomacy, and deep insight. Arts, education, design, partnerships, or advisory roles are highly rewarding for you.',
              'તમારી પ્રકૃતિમાં સર્જનાત્મકતા, સૌમ્યતા અને ઊંડી સમજ છે. કલા, શિક્ષણ, ડિઝાઇન કે સેવા ક્ષેત્ર તમારા માટે અત્યંત લાભદાયી રહેશે.'
            )
          : pickL(
              'आपके अंकों में परिश्रम, व्यावहारिकता और स्थिरता का विशेष गुण है। तकनीक, निर्माण, वित्त या संगठित उद्योग में आपकी सफलता सुनिश्चित है।',
              'Your numbers reflect diligence, practicality, and structural strength. Technology, real estate, finance, or organized enterprise bring steady triumph.',
              'તમારા અંકોમાં પરિશ્રમ, વ્યવહારુતા અને સ્થિરતાનો વિશેષ ગુણ છે. ટેકનોલોજી, નાણાં કે ઉદ્યોગ ક્ષેત્રમાં તમારી સફળતા નિશ્ચિત છે.'
            );

      const text = pickL(
        `जी ${cleanName} जी, आपके मूलांक ${mulankNum} (स्वामी: ${mulankPlanet}) और भाग्यांक ${bhagyankNum} (स्वामी: ${bhagyankPlanet}) के अनुसार आपके लिए निम्नलिखित कार्यक्षेत्र सर्वाधिक उन्नतिदायक रहेंगे:\n\n💼 आपके लिए श्रेष्ठ आजीविका:\n• ${topCareers}\n\n🌟 व्यापार या नौकरी का चयन:\n${pathGuidance}\n\n💡 भाग्योदय सूत्र:\nकिसी भी नए कार्य, मीटिंग या अनुबंध के लिए ${locMulank.luckyDays.join(' व ')} का दिन चुनें और अपने साथ ${locMulank.luckyColors[0]} रंग का रुमाल या कलम रखें।`,
        `${cleanName}, based on your Root Number ${mulankNum} (${mulankPlanet}) and Destiny Number ${bhagyankNum} (${bhagyankPlanet}), these career paths bring your highest growth:\n\n💼 Best Career Domains:\n• ${topCareers}\n\n🌟 Business vs Job Guidance:\n${pathGuidance}\n\n💡 Success Formula:\nSchedule key meetings and new launches on ${locMulank.luckyDays.join(' & ')}, and keep a ${locMulank.luckyColors[0]} pen or handkerchief with you.`,
        `${cleanName} જી, તમારા મૂળાંક ${mulankNum} (સ્વામી: ${mulankPlanet}) અને ભાગ્યાંક ${bhagyankNum} (સ્વામી: ${bhagyankPlanet}) મુજબ તમારા માટે શ્રેષ્ઠ કાર્યક્ષેત્રો:\n\n💼 શ્રેષ્ઠ આજીવિકા:\n• ${topCareers}\n\n🌟 વ્યવસાય કે નોકરી:\n${pathGuidance}\n\n💡 ભાગ્યોદય સૂત્ર:\nમહત્વની મીટિંગ કે નવા કાર્ય માટે ${locMulank.luckyDays.join(' અને ')} પસંદ કરો અને સાથે ${locMulank.luckyColors[0]} રંગનો રૂમાલ કે પેન રાખો.`
      );

      return {
        reply: text,
        chips: [quickSuggestions[4].query, quickSuggestions[2].query, quickSuggestions[5].query],
      };
    }

    // 5. Lucky Numbers, Days, Colors, Gem
    if (/लकी|शुभ|रंग|वार|दिन|रत्न|रुद्राक्ष|अंक|lucky|color|day|gem|stone|લકી|શુભ|રંગ/i.test(q)) {
      const text = pickL(
        `जी ${cleanName} जी, आपके मूलांक ${mulankNum} और भाग्यांक ${bhagyankNum} के अनुसार आपके संपूर्ण भाग्यशाली कारक इस प्रकार हैं:\n\n🌟 लकी नंबर (शुभ अंक): अंक ${locMulank.friendlyNumbers.join(', ')} (विशेषकर ${locMulank.luckyDates.slice(0, 3).join(', ')} तारीखें)\n📅 शुभ दिन (वार): ${locMulank.luckyDays.join(', ')}\n🎨 शुभ रंग: ${locMulank.luckyColors.join(', ')}\n💎 शुभ रत्न: ${locMulank.luckyGem} (${locMulank.subGem})\n📿 सिद्ध रुद्राक्ष: ${locMulank.rudraksha}\n🪔 इष्ट देवता: ${locMulank.deity}\n\n⚠️ इनसे सावधानी रखें:\n• शत्रु अंक: ${locMulank.enemyNumbers.length > 0 ? locMulank.enemyNumbers.join(', ') : 'कोई मुख्य शत्रु अंक नहीं'}\n• विरोधी रंग: ${locMulank.enemyNumbers.includes(8) ? 'गहरा काला व नीला' : 'धूमिल व मटमैले रंग'}`,
        `${cleanName}, here are your complete auspicious numerology parameters for Root ${mulankNum} & Destiny ${bhagyankNum}:\n\n🌟 Lucky Numbers: ${locMulank.friendlyNumbers.join(', ')} (especially dates ${locMulank.luckyDates.slice(0, 3).join(', ')})\n📅 Lucky Days: ${locMulank.luckyDays.join(', ')}\n🎨 Lucky Colors: ${locMulank.luckyColors.join(', ')}\n💎 Auspicious Gemstone: ${locMulank.luckyGem} (${locMulank.subGem})\n📿 Sacred Rudraksha: ${locMulank.rudraksha}\n🪔 Ishta Devta: ${locMulank.deity}\n\n⚠️ Cautions:\n• Challenging Numbers: ${locMulank.enemyNumbers.length > 0 ? locMulank.enemyNumbers.join(', ') : 'None major'}\n• Avoid Colors: ${locMulank.enemyNumbers.includes(8) ? 'Deep Black & Dark Blue' : 'Dull & Muddy shades'}`,
        `${cleanName} જી, તમારા મૂળાંક ${mulankNum} અને ભાગ્યાંક ${bhagyankNum} મુજબ તમારા શુભ કારકો:\n\n🌟 લકી નંબર: અંક ${locMulank.friendlyNumbers.join(', ')} (ખાસ કરીને ${locMulank.luckyDates.slice(0, 3).join(', ')} તારીખો)\n📅 શુભ વાર: ${locMulank.luckyDays.join(', ')}\n🎨 શુભ રંગ: ${locMulank.luckyColors.join(', ')}\n💎 શુભ રત્ન: ${locMulank.luckyGem} (${locMulank.subGem})\n📿 સિદ્ધ રુદ્રાક્ષ: ${locMulank.rudraksha}\n🪔 ઇષ્ટ દેવ: ${locMulank.deity}\n\n⚠️ સાવધાની:\n• વિરોધી અંક: ${locMulank.enemyNumbers.length > 0 ? locMulank.enemyNumbers.join(', ') : 'કોઈ મુખ્ય શત્રુ અંક નથી'}\n• ટાળવા જેવા રંગ: ${locMulank.enemyNumbers.includes(8) ? 'ઘેરો કાળો અને વાદળી' : 'ઝાંખા અને માટીયાળ રંગ'}`
      );

      return {
        reply: text,
        chips: [quickSuggestions[4].query, quickSuggestions[0].query, quickSuggestions[3].query],
      };
    }

    // 6. Mobile & Vehicle Number
    if (/मोबाइल|गाड़ी|वाहन|कार|नंबर|mobile|vehicle|car|bike|મોબાઇલ|વાહન/i.test(q)) {
      const mobileVerdict = isMobileFriendly
        ? pickL('अत्यंत शुभ, व्यापारिक लाभ व संपर्क बढ़ाने वाला है ✓', 'Highly auspicious for business growth & networking ✓', 'અત્યંત શુભ, વેપાર અને સંપર્કો વધારનાર છે ✓')
        : pickL(
            `सामान्य है। इसके प्रभाव को अनुकूल बनाने के लिए फोन के पीछे पीले या सुनहरे रंग से अपना कुआं अंक (${kuaNum}) लिखें।`,
            `Neutral/Average. To harmonize it, write your Kua Number (${kuaNum}) in yellow or gold ink inside your phone cover.`,
            `સામાન્ય છે. તેની ઊર્જા અનુકૂળ બનાવવા ફોન કવરની અંદર પીળા કે સોનેરી રંગથી તમારો કુઆ અંક (${kuaNum}) લખો.`
          );

      const vehicleVerdict = isVehicleFriendly
        ? pickL('सुरक्षित, शांतिदायक व यात्रा में मंगलकारी है ✓', 'Safe, peaceful, and auspicious for journeys ✓', 'સુરક્ષિત, શાંતિદાયક અને યાત્રામાં મંગળકારી છે ✓')
        : pickL(
            'सामान्य है। वाहन की सुरक्षा हेतु उसमें तांबे का छोटा स्वस्तिक या मारुति यंत्र अवश्य स्थापित करें।',
            'Neutral/Average. Place a small copper Swastik or Maruti Yantra on the dashboard for protection.',
            'સામાન્ય છે. વાહનની સુરક્ષા માટે તેમાં તાંબાનો નાનો સ્વસ્તિક કે મારુતિ યંત્ર સ્થાપિત કરો.'
          );

      const text = pickL(
        `जी ${cleanName} जी, आपके मोबाइल (${mobileNum}) और वाहन (${vehicleNum}) का अंक विश्लेषण:\n\n📱 मोबाइल नंबर विश्लेषण:\n• आपके मोबाइल नंबर के अंकों का कुल योग एकल अंक ${mobileDigitsSum} बनता है।\n• निर्णय: यह अंक आपके मूलांक ${mulankNum} के लिए ${mobileVerdict}\n\n🚗 वाहन नंबर विश्लेषण:\n• आपके वाहन नंबर के अक्षरों व अंकों का कुल योग एकल अंक ${vehicleDigitsSum} बनता है।\n• निर्णय: यह अंक आपके लिए ${vehicleVerdict}\n\n💡 नया नंबर चुनते समय ध्यान रखें:\nमोबाइल या गाड़ी के अंतिम ४ अंकों का जोड़ हमेशा अपने मित्र अंक (${locMulank.friendlyNumbers.join(', ')}) पर रखें।`,
        `${cleanName}, analysis for your Mobile (${mobileNum}) and Vehicle (${vehicleNum}):\n\n📱 Mobile Number Analysis:\n• Total reduced digit is ${mobileDigitsSum}.\n• Verdict: For Root Number ${mulankNum}, this is ${mobileVerdict}\n\n🚗 Vehicle Plate Analysis:\n• Combined letter + digit total reduces to ${vehicleDigitsSum}.\n• Verdict: For you, this number is ${vehicleVerdict}\n\n💡 Tip for Future Numbers:\nEnsure the sum of the last 4 digits aligns with your friendly numbers (${locMulank.friendlyNumbers.join(', ')}).`,
        `${cleanName} જી, તમારા મોબાઇલ (${mobileNum}) અને વાહન (${vehicleNum}) નું અંક વિશ્લેષણ:\n\n📱 મોબાઇલ નંબર વિશ્લેષણ:\n• તમારા મોબાઇલ નંબરના અંકોનો કુલ સરવાળો એકલ અંક ${mobileDigitsSum} થાય છે.\n• નિર્ણય: આ અંક તમારા મૂળાંક ${mulankNum} માટે ${mobileVerdict}\n\n🚗 વાહન નંબર વિશ્લેષણ:\n• વાહન નંબરના અક્ષરો અને અંકોનો કુલ યોગ ${vehicleDigitsSum} થાય છે.\n• નિર્ણય: આ અંક તમારા માટે ${vehicleVerdict}\n\n💡 નવો નંબર પસંદ કરતી વખતે ધ્યાન રાખો:\nછેલ્લા ૪ અંકોનો સરવાળો હંમેશા તમારા મિત્ર અંકો (${locMulank.friendlyNumbers.join(', ')}) પર રાખો.`
      );

      return {
        reply: text,
        chips: [quickSuggestions[2].query, quickSuggestions[4].query, quickSuggestions[0].query],
      };
    }

    // 7. Wealth / Remedies / Upay
    if (/धन|बरकत|पैसा|आर्थिक|कर्ज|समृद्धि|उपाय|wealth|money|finance|remedy|upay|ધન|ઉપાય/i.test(q)) {
      const text = pickL(
        `जी ${cleanName} जी, आपके मूलांक ${mulankNum} (${mulankPlanet}) और भाग्यांक ${bhagyankNum} के लिए धन-समृद्धि के ३ अचूक वैदिक व अंक उपाय:\n\n१. 💧 जल-चिकित्सा (Water Therapy):\nप्रतिदिन ${locMulank.waterBottleColor} में जल भरकर प्रातःकाल २ घंटे सूर्य प्रकाश में रखें और फिर उस अभिमंत्रित जल का सेवन करें।\n\n२. 🪙 व्यक्तिगत कुआं अंक (Kua Number ${kuaNum}) प्रयोग:\nआपका व्यक्तिगत ऊर्जा अंक ${kuaNum} है। एक छोटे चौकोर श्वेत पत्र पर हरे या सुनहरे स्याही से «${kuaNum}» लिखकर अपनी तिजोरी, गल्ले या पर्स में रखें।\n\n३. 🪔 दैनिक सिद्ध मंत्र जप:\nप्रतिदिन प्रातः स्नान के बाद शांत मन से इस मंत्र का २७ या १०८ बार जप करें:\n«${locMulank.mantra}»\n(दान सामग्री: ${locMulank.charity.slice(0, 3).join(', ')})`,
        `${cleanName}, 3 authentic Vedic & Numerology remedies for wealth and success tailored to Root ${mulankNum} (${mulankPlanet}) & Destiny ${bhagyankNum}:\n\n1. 💧 Solar Water Therapy:\nFill a ${locMulank.waterBottleColor} with drinking water, keep it in morning sunlight for 2 hours, and drink it to strengthen your ruling planet.\n\n2. 🪙 Personal Kua Angel Number (${kuaNum}):\nWrite «${kuaNum}» in green or gold ink on a small white paper square and keep it in your wallet or cash vault to attract financial flow.\n\n3. 🪔 Daily Sacred Beej Mantra:\nChant this mantra 27 or 108 times after bathing each morning:\n«${locMulank.mantra}»\n(Charity items: ${locMulank.charity.slice(0, 3).join(', ')})`,
        `${cleanName} જી, તમારા મૂળાંક ${mulankNum} (${mulankPlanet}) અને ભાગ્યાંક ${bhagyankNum} માટે ધન-સમૃદ્ધિના ૩ અચૂક ઉપાય:\n\n૧. 💧 જળ-ચિકિત્સા (Water Therapy):\nદરરોજ ${locMulank.waterBottleColor} માં પાણી ભરીને સવારે ૨ કલાક સૂર્યપ્રકાશમાં રાખીને તેનું સેવન કરો.\n\n૨. 🪙 વ્યક્તિગત કુઆ અંક (Kua Number ${kuaNum}) પ્રયોગ:\nસફેદ કાગળ પર લીલી કે સોનેરી શાહીથી «${kuaNum}» લખીને તમારા પર્સ કે તિજોરીમાં રાખો.\n\n૩. 🪔 દૈનિક સિદ્ધ મંત્ર જપ:\nરોજ સવારે સ્નાન બાદ આ મંત્રનો ૨૭ કે ૧૦૮ વાર જપ કરો:\n«${locMulank.mantra}»\n(દાન સામગ્રી: ${locMulank.charity.slice(0, 3).join(', ')})`
      );

      return {
        reply: text,
        chips: [quickSuggestions[1].query, quickSuggestions[0].query, quickSuggestions[5].query],
      };
    }

    // 8. Personal Year forecast
    if (/वर्ष|साल|2026|year|forecast|भविष्य|વર્ષ/i.test(q)) {
      const text = pickL(
        `जी ${cleanName} जी, अंक ज्योतिष के अनुसार वर्ष ${curYear} आपके जीवन का व्यक्तिगत वर्ष अंक ${personalYear.yearNum} (Personal Year ${personalYear.yearNum}) है।\n\n🎯 इस वर्ष का मुख्य प्रभाव:\n«${pyTheme}»\n\n💡 आपके लिए वैदिक मार्गदर्शन:\n${pyAdvice}\n\nइस वर्ष अपने मूलांक ${mulankNum} की शक्तियों पर भरोसा रखें। महत्वपूर्ण कार्य की शुरुआत के लिए ${locMulank.luckyDays[0]} का चयन करें।`,
        `${cleanName}, in Numerology, ${curYear} activates your Personal Year Number ${personalYear.yearNum}.\n\n🎯 Key Theme of ${curYear}:\n«${pyTheme}»\n\n💡 Vedic Guidance:\n${pyAdvice}\n\nTrust the strengths of your Root Number ${mulankNum} this year, and initiate important milestones on ${locMulank.luckyDays[0]}.`,
        `${cleanName} જી, અંક જ્યોતિષ અનુસાર વર્ષ ${curYear} તમારા જીવનનો વ્યક્તિગત વર્ષ અંક ${personalYear.yearNum} છે.\n\n🎯 આ વર્ષનો મુખ્ય પ્રભાવ:\n«${pyTheme}»\n\n💡 વૈદિક માર્ગદર્શન:\n${pyAdvice}\n\nઆ વર્ષે તમારા મૂળાંક ${mulankNum} ની શક્તિઓ પર વિશ્વાસ રાખો અને નવા કાર્યોની શરૂઆત ${locMulank.luckyDays[0]} ના રોજ કરો.`
      );

      return {
        reply: text,
        chips: [quickSuggestions[4].query, quickSuggestions[1].query, quickSuggestions[2].query],
      };
    }

    // 9. Loshu Grid / Rajyoga
    if (/लो-शू|राजयोग|ग्रिड|loshu|grid|missing|अनुपस्थित|લો-શૂ|રાજયોગ/i.test(q)) {
      const presentList = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .filter((n) => (loshu.counts[n] || 0) > 0)
        .join(', ');

      const text = pickL(
        `जी ${cleanName} जी, आपकी जन्मतिथि (${inputDay}/${inputMonth}/${inputYear}) के आधार पर ३x३ लो-शू चक्र का फलादेश इस प्रकार है:\n\n🌟 उपस्थित अंक: ${presentList}\n${loshu.goldenRajYoga ? '✨ स्वर्ण राजयोग (4-5-6): आपकी जन्मतिथि में ४, ५ और ६ तीनों अंक मौजूद हैं! यह स्थायी सफलता और संपत्ति देता है।\n' : ''}${loshu.silverRajYoga ? '🥈 रजत राजयोग (2-5-8): आपकी जन्मतिथि में २, ५ और ८ तीनों अंक उपस्थित हैं। यह भूमि-भवन के लिए भाग्यशाली है।\n' : ''}${!loshu.goldenRajYoga && !loshu.silverRajYoga ? '🌟 संतुलित ग्रिड: आपकी जन्मतिथि में व्यावहारिक और बौद्धिक अंकों का सुंदर संतुलन है।\n' : ''}\n💡 अनुपस्थित अंक (${loshu.missingNumbers.join(', ') || 'कोई नहीं'}) का निवारण:\nघर के उत्तर-पूर्व (ईशान कोण) को स्वच्छ रखें तथा अपने कुआं अंक ${kuaNum} को ऊर्जा सेतु के रूप में प्रयोग करें।`,
        `${cleanName}, here is your 3×3 Lo Shu Grid analysis for birth date ${inputDay}/${inputMonth}/${inputYear}:\n\n🌟 Present Digits: ${presentList}\n${loshu.goldenRajYoga ? '✨ Golden Raj Yoga (4-5-6): All three digits 4, 5, and 6 are active — signifying lasting prosperity and prestige.\n' : ''}${loshu.silverRajYoga ? '🥈 Silver Raj Yoga (2-5-8): Digits 2, 5, and 8 are active — highly auspicious for real estate and property.\n' : ''}${!loshu.goldenRajYoga && !loshu.silverRajYoga ? '🌟 Balanced Grid: Your grid holds a steady blend of practical and intellectual energies.\n' : ''}\n💡 Missing Digits (${loshu.missingNumbers.join(', ') || 'None'}) Balance:\nKeep the North-East corner clean and bright, and use your Kua Number (${kuaNum}) as an energy bridge.`,
        `${cleanName} જી, તમારી જન્મ તારીખ (${inputDay}/${inputMonth}/${inputYear}) પર આધારિત ૩×૩ લો-શૂ ચક્રનું ફળકથન:\n\n🌟 હાજર અંકો: ${presentList}\n${loshu.goldenRajYoga ? '✨ સ્વર્ણ રાજયોગ (4-5-6): તમારી જન્મ તારીખમાં ૪, ૫ અને ૬ ત્રણેય અંકો હાજર છે — જે સ્થાયી સમૃદ્ધિ આપે છે.\n' : ''}${loshu.silverRajYoga ? '🥈 સિલ્વર રાજયોગ (2-5-8): ૨, ૫ અને ૮ અંકો જમીન-મકાન માટે અત્યંત ભાગ્યશાળી છે.\n' : ''}${!loshu.goldenRajYoga && !loshu.silverRajYoga ? '🌟 સંતુલિત ગ્રીડ: તમારી જન્મ તારીખમાં બૌદ્ધિક અને વ્યવહારુ અંકોનું સુંદર સંતુલન છે.\n' : ''}\n💡 ગેરહાજર અંકો (${loshu.missingNumbers.join(', ') || 'કોઈ નહીં'}) નું નિવારણ:\nઘરના ઉત્તર-પૂર્વ (ઈશાન) ખૂણાને સ્વચ્છ રાખો અને તમારા કુઆ અંક ${kuaNum} નો ઊર્જા સેતુ તરીકે ઉપયોગ કરો.`
      );

      return {
        reply: text,
        chips: [quickSuggestions[0].query, quickSuggestions[4].query, quickSuggestions[1].query],
      };
    }

    // 10. Default General Conversational Fallback
    const isFriendly =
      locMulank.friendlyNumbers.includes(bhagyankNum) ||
      locBhagyank.friendlyNumbers.includes(mulankNum);

    const text = pickL(
      `जी ${cleanName} जी, आपके प्रश्न पर मैंने आपके अंक चार्ट (मूलांक ${mulankNum} - स्वामी ${mulankPlanet}, भाग्यांक ${bhagyankNum} - स्वामी ${bhagyankPlanet}, नामांक ${namankData.single}) के अनुसार विचार किया है।\n\nआपके अंकों की ऊर्जा दर्शाती है कि आपकी स्वाभाविक क्षमताएं पूरी तरह सहायक हैं। ${
        isFriendly
          ? 'आपके मूलांक और भाग्यांक का मित्र संबंध आपके प्रयासों को सही दिशा देता है।'
          : `धैर्य रखें और मित्र अंकों (${locMulank.friendlyNumbers.join(', ')}) का सहयोग लें।`
      }\n\nप्रतिदिन प्रातः «${locMulank.mantra}» का स्मरण करें और शुभ कार्यों के लिए ${locMulank.luckyDays.join(' व ')} चुनें।`,
      `${cleanName}, I have evaluated your question against your chart (Root ${mulankNum} - ${mulankPlanet}, Destiny ${bhagyankNum} - ${bhagyankPlanet}, Name ${namankData.single}).\n\nYour numerical vibrations confirm that your innate strengths support steady progress. ${
        isFriendly
          ? 'The friendly bond between your Root and Destiny numbers gives momentum and stability.'
          : `Practice patience and align with your friendly numbers (${locMulank.friendlyNumbers.join(', ')}).`
      }\n\nRecite «${locMulank.mantra}» each morning and choose ${locMulank.luckyDays.join(' & ')} for key initiatives.`,
      `${cleanName} જી, તમારા પ્રશ્ન પર મેં તમારા અંક ચાર્ટ (મૂળાંક ${mulankNum} - ${mulankPlanet}, ભાગ્યાંક ${bhagyankNum} - ${bhagyankPlanet}, નામાંક ${namankData.single}) મુજબ વિચાર કર્યો છે.\n\n${
        isFriendly
          ? 'તમારા મૂળાંક અને ભાગ્યાંકનો મિત્ર સંબંધ તમારા પ્રયત્નોને યોગ્ય દિશા આપે છે.'
          : `ધીરજ રાખો અને મિત્ર અંકો (${locMulank.friendlyNumbers.join(', ')}) નો સહયોગ લો.`
      }\n\nદરરોજ સવારે «${locMulank.mantra}» નું સ્મરણ કરો અને શુભ કાર્યો માટે ${locMulank.luckyDays.join(' અને ')} પસંદ કરો.`
    );

    return {
      reply: text,
      chips: quickSuggestions.slice(0, 4).map((s) => s.query),
    };
  };

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

  const handleToggleSpeak = async (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      umaVoice.stop();
      setSpeakingMessageId(null);
      return;
    }

    umaVoice.stop();
    setSpeakingMessageId(msg.id);

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

  const handleCopy = (msg: ChatMessage) => {
    const cleanText = msg.text.replace(/[*#_~`]/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedMessageId(msg.id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleShareWhatsApp = (msg: ChatMessage) => {
    const cleanText = msg.text.replace(/[*#_~`]/g, '');
    const shareContent = pickL(
      `🔢 *सनातन शक्ति पंचांग — विदुषी उमा अंक ज्योतिष संवाद*\n👤 यजमान: ${cleanName} (मूलांक: ${mulankNum} | भाग्यांक: ${bhagyankNum} | नामांक: ${namankData.single})\n\n${cleanText}\n\n📲 सनातन शक्ति पंचांग ऐप`,
      `🔢 *Sanatan Shakti Panchang — Vidushi Uma Numerology*\n👤 Native: ${cleanName} (Root: ${mulankNum} | Destiny: ${bhagyankNum} | Name: ${namankData.single})\n\n${cleanText}\n\n📲 Sanatan Shakti Panchang App`,
      `🔢 *સનાતન શક્તિ પંચાંગ — વિદુષી ઉમા અંક જ્યોતિષ સંવાદ*\n👤 યજમાન: ${cleanName} (મૂળાંક: ${mulankNum} | ભાગ્યાંક: ${bhagyankNum} | નામાંક: ${namankData.single})\n\n${cleanText}\n\n📲 સનાતન શક્તિ પંચાંગ એપ`
    );
    const url = `https://wa.me/?text=${encodeURIComponent(shareContent)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

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
                {pickL('विदुषी उमा — अंक-ज्योतिष संवाद', 'Vidushi Uma — Numerology Dialogue', 'વિદુષી ઉમા — અંક-જ્યોતિષ સંવાદ')}
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-800 text-emerald-100 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                {pickL('सक्रिय परामर्श', 'Live Session', 'સક્રિય પરામર્શ')}
              </span>
            </div>
            <p className="text-[10px] text-[#F5ECE0]/90 font-serif truncate">
              {cleanName} • {pickL('जन्म', 'DOB', 'જન્મ')}: {inputDay}/{inputMonth}/{inputYear} • {pickL('मूलांक', 'Root', 'મૂળાંક')} {mulankNum} ({mulankPlanet}) • {pickL('भाग्यांक', 'Destiny', 'ભાગ્યાંક')} {bhagyankNum} ({bhagyankPlanet})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            title={pickL('नया संवाद शुरू करें', 'Start new dialogue', 'નવો સંવાદ શરૂ કરો')}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-[#FFD88A] text-xs transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px] font-bold">{pickL('नया संवाद', 'Reset', 'નવો સંવાદ')}</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Suggestion Carousel */}
      <div className="px-2.5 py-1.5 bg-[#F4E8D1] border-b border-[#8C6239]/25 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-[#7A1D1D] shrink-0 font-serif flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          {pickL('त्वरित प्रश्न:', 'Quick Questions:', 'ત્વરિત પ્રશ્નો:')}
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
                {isUma && (
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#8C6239]/15 text-[11px] text-[#735133]">
                    <span className="font-serif font-black text-[#7A1D1D] flex items-center gap-1">
                      <span>॥</span>
                      <span>{pickL('विदुषी उमा परामर्श', 'Vidushi Uma Consultation', 'વિદુષી ઉમા પરામર્શ')}</span>
                      <span>॥</span>
                    </span>
                    <span className="text-[10px] text-[#8C6239]">
                      {msg.timestamp.toLocaleTimeString(dateLocale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                <div className="font-serif text-xs sm:text-[13px] leading-relaxed whitespace-pre-line select-text">
                  {msg.text}
                </div>

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
                        <span>{isSpeaking ? pickL('रोकें', 'Stop', 'રોકો') : pickL('सुनें', 'Listen', 'સાંભળો')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(msg)}
                        className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>{pickL('शेयर', 'Share', 'શેર')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg)}
                        className="px-2 py-1 rounded-lg bg-[#FAF5ED] hover:bg-amber-100 text-[#5C3A21] border border-amber-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-700" />}
                        <span>{isCopied ? pickL('कॉपी हुआ', 'Copied', 'કોપી થયું') : pickL('कॉपी', 'Copy', 'કોપી')}</span>
                      </button>
                    </div>

                    <span className="text-[9px] text-[#8C6239] font-medium hidden sm:inline">
                      {pickL('वैदिक अंक ज्योतिष सम्मत', 'Authentic Vedic Numerology', 'વૈદિક અંક જ્યોતિષ સંમત')}
                    </span>
                  </div>
                )}

                {isUma && msg.followUpChips && msg.followUpChips.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#8C6239]/15 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#7A1D1D] font-serif flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      {pickL('संबंधित प्रश्न (टैप करके पूछें):', 'Related Questions (Tap to ask):', 'સંબંધિત પ્રશ્નો (ટેપ કરીને પૂછો):')}
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

      {/* 4. Chat Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-2 sm:p-2.5 bg-white border-t border-amber-300/80 flex items-center gap-1.5 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={pickL(
            'अंक ज्योतिष का कोई भी प्रश्न लिखें (उदा: मेरा लकी नंबर, नाम स्पेलिंग या उपाय)...',
            'Ask any numerology question (e.g., lucky number, name spelling, remedies)...',
            'અંક જ્યોતિષનો કોઈ પણ પ્રશ્ન લખો (દા.ત. લકી નંબર, નામ સ્પેલિંગ કે ઉપાય)...'
          )}
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
          <span className="hidden sm:inline">{pickL('पूछें', 'Ask', 'પૂછો')}</span>
        </button>
      </form>
    </div>
  );
};
