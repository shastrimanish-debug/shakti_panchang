import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Moon, Compass, Calendar, Sparkles, MessageCircle, User, 
  MapPin, Clock, Award, BookOpen, Heart, Shield, Send, X, Volume2, 
  ChevronRight, Star, AlertCircle, RefreshCw, Zap, CheckCircle2, Mic, MicOff
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'panchang' | 'kundali' | 'milan' | 'muhurat' | 'gochar' | 'sadesati'>('home');
  const [isUmaOpen, setIsUmaOpen] = useState(false);
  const [umaMessages, setUmaMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: "प्रणाम! 🙏 मैं उमा हूँ — आपका विद्वान ज्योतिष सहायक। वैदिक ज्योतिष, पंचांग, कुंडली विश्लेषण, रत्न परामर्श या जीवन के किसी भी मार्गदर्शन के लिए आप मुझसे निसंकोच पूछ सकते हैं। आज आपकी क्या सहायता करूँ?"
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isUmaLoading, setIsUmaLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Panchang State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cityName, setCityName] = useState('New Delhi, India');
  const [isBookOpen, setIsBookOpen] = useState(false);

  // Kundali State
  const [kundaliForm, setKundaliForm] = useState({
    name: 'अमित शास्त्री',
    dob: '1995-06-15',
    tob: '10:30',
    pob: 'Varanasi, UP'
  });
  const [kundaliResult, setKundaliResult] = useState<any>(null);

  // Milan State
  const [milanForm, setMilanForm] = useState({
    boyName: 'राहुल शर्मा',
    boyDob: '1993-04-10',
    girlName: 'प्रियंका वर्मा',
    girlDob: '1995-09-22'
  });
  const [milanResult, setMilanResult] = useState<any>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [umaMessages, isUmaOpen]);

  const speakUma = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("क्षमा करें, आपका ब्राउज़र स्पीच रिकग्निशन (Speech Recognition) का समर्थन नहीं करता है। कृपया क्रोम या सफारी का उपयोग करें।");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSendUma = async (customPrompt?: string) => {
    const textToSend = customPrompt || userInput;
    if (!textToSend.trim() || isUmaLoading) return;

    const newMsgs = [...umaMessages, { role: 'user' as const, text: textToSend }];
    setUmaMessages(newMsgs);
    if (!customPrompt) setUserInput('');
    setIsUmaLoading(true);

    try {
      const res = await fetch('/api/uma/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: newMsgs.slice(0, -1),
          userProfile: kundaliForm
        })
      });
      const data = await res.json();
      if (data.reply) {
        setUmaMessages([...newMsgs, { role: 'model', text: data.reply }]);
        speakUma(data.reply);
      } else {
        const fallback = "प्रणाम वत्स, ग्रहों की स्थिति के कारण अभी संपर्क स्थापित नहीं हो पाया। कृपया पुनः प्रयास करें।";
        setUmaMessages([...newMsgs, { role: 'model', text: fallback }]);
        speakUma(fallback);
      }
    } catch (err) {
      console.error(err);
      const fallback = "ॐ नमः शिवाय। सर्वर से संपर्क में त्रुटि आई है। कृपया पुनः प्रयास करें।";
      setUmaMessages([...newMsgs, { role: 'model', text: fallback }]);
      speakUma(fallback);
    } finally {
      setIsUmaLoading(false);
    }
  };

  const generateKundali = (e: React.FormEvent) => {
    e.preventDefault();
    setKundaliResult({
      lagna: 'वृश्चिक (Scorpio)',
      nakshatra: 'पुष्य (Pushya) - चरण 3',
      rashi: 'कर्क (Cancer)',
      mahadasha: 'बृहस्पति (Jupiter) महादशा चल रही है (2022 - 2038)',
      manglik: 'मांगलिक दोष नहीं है (शुभ योग)',
      gemstone: 'पुखराज (Yellow Sapphire) और मूंगा धारण करना अत्यंत शुभ रहेगा।',
      summary: `${kundaliForm.name} जी, आपकी कुंडली में गजकेसरी योग और राजयोग का सुंदर संयोग बन रहा है। आने वाले ढाई वर्ष करियर और आध्यात्मिक उन्नति के लिए स्वर्णिम हैं।`
    });
  };

  const calculateMilan = (e: React.FormEvent) => {
    e.preventDefault();
    setMilanResult({
      totalGun: '28 / 36',
      nadi: 'उत्तम (भिन्न नाड़ी - दोष मुक्त)',
      bhakoot: 'शुभ (7/7 संबंध)',
      gana: 'देव - मनुष्य (मध्यम अनुकूलता)',
      status: 'अत्यंत उत्तम मिलान (विवाह के लिए श्रेष्ठ योग)',
      recommendation: 'वर-वधू की कुंडली का मिलान 36 में से 28 गुणों के साथ अत्यंत श्रेष्ठ है। मांगलिक दोष का परिहार भी पूर्ण है।'
    });
  };

  if (!isBookOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-stone-950 text-amber-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-serif">
        <div className="absolute w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-xl w-full bg-gradient-to-b from-amber-900/90 via-orange-950/95 to-stone-950 border-8 border-amber-500/80 rounded-3xl shadow-2xl p-8 md:p-12 text-center relative border-double flex flex-col items-center space-y-6">
          
          <div className="text-yellow-400 font-bold tracking-widest text-sm uppercase border-b border-amber-600/50 pb-2 w-full">
            ॥ श्री गणेशाय नमः ॥
          </div>

          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-full flex items-center justify-center text-amber-950 font-extrabold text-5xl shadow-xl border-4 border-yellow-200">
            ॐ
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-yellow-200 tracking-wider font-serif">
              शक्ति पंचांग महाग्रंथ
            </h1>
            <p className="text-amber-300 font-sans text-sm tracking-widest uppercase font-bold">
              एवं विद्वान ज्योतिष उमा निर्देशिका
            </p>
          </div>

          <div className="py-4 border-y border-amber-700/60 w-full space-y-2 font-sans text-stone-300 text-sm">
            <p>✦ दैनिक वैदिक पंचांग एवं नक्षत्र गणना ✦</p>
            <p>✦ जन्म कुंडली, अष्टकूट गुण मिलान एवं गोचर ✦</p>
            <p>✦ विद्वान ज्योतिषी उमा द्वारा दिव्य ज्योतिषीय मार्गदर्शन ✦</p>
          </div>

          <div className="pt-4 w-full flex flex-col gap-3 font-sans">
            <button
              onClick={() => setIsBookOpen(true)}
              className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-amber-950 font-black py-4 px-8 rounded-2xl shadow-2xl transition transform hover:scale-105 border-2 border-yellow-200 text-lg flex items-center justify-center gap-3"
            >
              <BookOpen className="w-6 h-6" />
              <span>📖 पुस्तक खोलें (Open Book & Enter)</span>
            </button>
            
            <button
              onClick={() => {
                setIsBookOpen(true);
                setIsUmaOpen(true);
              }}
              className="w-full bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-bold py-3 px-6 rounded-xl border border-amber-600 transition flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>सीधे उमा (विद्वान ज्योतिष) से मिलें</span>
            </button>
          </div>

          <div className="text-xs text-amber-400/60 font-sans pt-2">
            © 2026 सनातन वैदिक पंचांग प्रकाशन | सर्वाधिकार सुरक्षित
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 text-stone-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-orange-900 to-yellow-900 text-amber-100 shadow-xl border-b-4 border-amber-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-amber-950 font-bold text-2xl shadow-inner border-2 border-yellow-300">
              ॐ
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide text-amber-200 flex items-center gap-2">
                शक्ति पंचांग & विद्वान ज्योतिष उमा
                <span className="text-xs bg-amber-600 px-2 py-0.5 rounded-full text-amber-100 font-normal">Vedic AI</span>
              </h1>
              <p className="text-xs text-amber-300/80">सटीक पंचांग, जन्म कुंडली, गुण मिलान एवं विद्वान ज्योतिषी उमा का मार्गदर्शन</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUmaOpen(true)}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-amber-950 px-5 py-2.5 rounded-full font-bold shadow-lg flex items-center gap-2 transform transition hover:scale-105 border-2 border-yellow-200 animate-pulse"
            >
              <Sparkles className="w-5 h-5 text-amber-950" />
              <span>विद्वान उमा से पूछें</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-amber-950/60 backdrop-blur border-t border-amber-800/50 px-4">
          <div className="max-w-7xl mx-auto flex overflow-x-auto space-x-2 py-2 no-scrollbar">
            {[
              { id: 'home', label: 'मुख्य पृष्ठ (Home)', icon: Star },
              { id: 'panchang', label: 'दैनिक पंचांग', icon: Calendar },
              { id: 'kundali', label: 'जन्म कुंडली', icon: Star },
              { id: 'milan', label: 'कुंडली मिलान', icon: Heart },
              { id: 'muhurat', label: 'शुभ मुहूर्त', icon: Clock },
              { id: 'gochar', label: 'ग्रह गोचर', icon: Compass },
              { id: 'sadesati', label: 'साढ़े साती', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-amber-950 font-bold shadow-md'
                      : 'text-amber-200 hover:bg-amber-900/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        {/* Home / Mukhiya Prusht Tab */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Grand Cover Banner */}
            <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-950 text-amber-100 rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-amber-500 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 bg-amber-800/80 px-4 py-1.5 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-600 shadow-sm">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>वैदिक ज्योतिष एवं पंचांग महाग्रंथ</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-yellow-200 tracking-wide font-serif leading-tight">
                  शक्ति पंचांग & विद्वान ज्योतिष उमा
                </h2>
                <p className="text-amber-100/90 text-base md:text-lg leading-relaxed font-serif">
                  "धर्मो रक्षति रक्षितः" — सनातन वैदिक पंचांग, सटीक जन्म कुंडली, अष्टकूट गुण मिलान, शुभ मुहूर्त और विद्वान ज्योतिषी उमा का दिव्य मार्गदर्शन अब एक ही स्थान पर।
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveTab('panchang')}
                    className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 text-base border-2 border-yellow-200"
                  >
                    <Calendar className="w-5 h-5" /> अध्याय १: पंचांग पढ़ें
                  </button>
                  <button
                    onClick={() => setIsUmaOpen(true)}
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-amber-950 font-extrabold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2 text-base border-2 border-yellow-200 animate-pulse"
                  >
                    <Sparkles className="w-5 h-5" /> उमा से परामर्श लें
                  </button>
                </div>
              </div>
            </div>

            {/* Chapters Grid (अध्याय सूची) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-amber-300 pb-2">
                <h3 className="text-2xl font-extrabold text-amber-950 flex items-center gap-2 font-serif">
                  <BookOpen className="w-6 h-6 text-amber-700" /> ग्रंथ के प्रमुख अध्याय (Chapters)
                </h3>
                <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full">6 अध्यायों का संग्रह</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'panchang', title: 'अध्याय १: दैनिक पंचांग', desc: 'तिथि, नक्षत्र, योग, करण, सूर्योदय एवं राहुकाल की संपूर्ण जानकारी।', icon: Calendar, color: 'border-orange-500' },
                  { id: 'kundali', title: 'अध्याय २: जन्म कुंडली', desc: 'लग्न, राशि, महादशा और ग्रहों की स्थिति का सूक्ष्म विश्लेषण।', icon: Star, color: 'border-amber-500' },
                  { id: 'milan', title: 'अध्याय ३: कुंडली मिलान', desc: '36 गुणों का अष्टकूट मिलान, नाड़ी एवं मांगलिक दोष परीक्षण।', icon: Heart, color: 'border-red-500' },
                  { id: 'muhurat', title: 'अध्याय ४: शुभ मुहूर्त', desc: 'विवाह, गृह प्रवेश, वाहन क्रय एवं व्यापार आरंभ हेतु श्रेष्ठ समय।', icon: Clock, color: 'border-yellow-600' },
                  { id: 'gochar', title: 'अध्याय ५: ग्रह गोचर', desc: 'नवनिर्मित आकाशमंडल में सूर्य, चंद्र, गुरु और शनि का राशि परिवर्तन।', icon: Compass, color: 'border-amber-700' },
                  { id: 'sadesati', title: 'अध्याय ६: साढ़े साती', desc: 'शनि की साढ़े साती, ढैया और शांति के लिए अचूक वैदिक उपाय।', icon: Shield, color: 'border-stone-700' },
                ].map((chap) => {
                  const Icon = chap.icon;
                  return (
                    <div 
                      key={chap.id}
                      onClick={() => setActiveTab(chap.id as any)}
                      className={`bg-white rounded-2xl shadow-xl p-6 border-t-4 ${chap.color} hover:shadow-2xl transform transition hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4`}
                    >
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-900 font-bold mb-3 shadow-inner">
                          <Icon className="w-6 h-6 text-amber-700" />
                        </div>
                        <h4 className="text-xl font-extrabold text-amber-950 font-serif">{chap.title}</h4>
                        <p className="text-stone-600 text-sm leading-relaxed">{chap.desc}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-700 font-bold text-sm pt-2 group-hover:text-amber-900">
                        <span>अध्याय खोलें</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Panchang Tab */}
        {activeTab === 'panchang' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 border border-amber-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                  <Sun className="w-6 h-6 text-amber-600" /> आज का वैदिक पंचांग
                </h2>
                <p className="text-sm text-stone-600">स्थान: {cityName} | विक्रम संवत 2083</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <select 
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option>New Delhi, India</option>
                  <option>Varanasi, UP</option>
                  <option>Ujjain, MP</option>
                  <option>Haridwar, UK</option>
                  <option>Mumbai, MH</option>
                </select>
              </div>
            </div>

            {/* Panchang Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'तिथि (Tithi)', value: 'शुक्ल पक्ष द्वितीया (रात 09:42 तक)', desc: 'चन्द्रमा वृषभ राशि में गोचरस्थ', icon: Calendar, color: 'border-orange-500' },
                { title: 'नक्षत्र (Nakshatra)', value: 'पुष्य (Pushya) नक्षत्र', desc: 'स्वामी: शनि देवता | अत्यंत शुभ', icon: Star, color: 'border-amber-500' },
                { title: 'योग (Yoga)', value: 'साध्य योग (शाम 05:15 तक)', desc: 'कार्यों में सिद्धि दायक योग', icon: Sparkles, color: 'border-yellow-500' },
                { title: 'करण (Karan)', value: 'बालव करण', desc: 'शुभ कार्यों के लिए अनुकूल', icon: Compass, color: 'border-amber-600' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${item.color} hover:shadow-lg transition`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-stone-700 text-sm">{item.title}</h3>
                      <Icon className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="text-lg font-extrabold text-amber-950 mb-1">{item.value}</div>
                    <p className="text-xs text-stone-500">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Sun/Moon & Auspicious Timings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-orange-600" /> सूर्य एवं चन्द्र गणना
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                    <span className="text-stone-600 font-medium">सूर्योदय (Sunrise):</span>
                    <span className="font-bold text-amber-900">06:18 AM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                    <span className="text-stone-600 font-medium">सूर्यास्त (Sunset):</span>
                    <span className="font-bold text-amber-900">06:24 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                    <span className="text-stone-600 font-medium">चन्द्रोदय (Moonrise):</span>
                    <span className="font-bold text-amber-900">08:12 AM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                    <span className="text-stone-600 font-medium">चंद्रास्त (Moonset):</span>
                    <span className="font-bold text-amber-900">07:45 PM</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600" /> अशुभ काल (वर्ज्य समय)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg border border-red-100">
                    <span className="text-stone-700 font-medium">राहुकाल (Rahu Kaal):</span>
                    <span className="font-bold text-red-800">04:30 PM - 06:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                    <span className="text-stone-700 font-medium">यमगण्ड काल (Yamagandam):</span>
                    <span className="font-bold text-amber-800">10:35 AM - 12:05 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                    <span className="text-stone-700 font-medium">गुलिक काल (Gulika Kaal):</span>
                    <span className="font-bold text-amber-800">01:45 PM - 03:15 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                    <span className="text-stone-700 font-medium">दुमुहूर्त (Durmuhurtham):</span>
                    <span className="font-bold text-amber-800">12:15 PM - 01:02 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Vedic Mantra Section */}
            <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-amber-950 text-amber-100 rounded-2xl shadow-2xl p-8 border-2 border-amber-500/50 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider bg-amber-800/60 px-3 py-1 rounded-full w-max border border-amber-700">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>आज का नक्षत्र आधारित वैदिक मंत्र (Daily Vedic Mantra)</span>
                  </div>
                  <div className="text-3xl font-extrabold text-yellow-200 tracking-wide font-serif">
                    "ॐ बृं बृहस्पतये नमः"
                  </div>
                  <div className="text-sm text-amber-300 font-medium italic">
                    Om Braam Breem Braum Sah Brihaspataye Namah
                  </div>
                  <p className="text-amber-100/90 text-sm leading-relaxed">
                    <strong>महत्व एवं फल:</strong> पुष्य नक्षत्र एवं शुक्ल पक्ष की तिथि के प्रभावस्वरूप आज देवगुरु बृहस्पति का यह महामंत्र बुद्धि, यश, ऐश्वर्य और ज्ञान प्राप्ति के लिए अत्यंत फलदायी है।
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center bg-amber-900/60 p-6 rounded-2xl border border-amber-600/40 shadow-inner min-w-[200px] text-center gap-3">
                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance("ॐ बृं बृहस्पतये नमः");
                        utterance.lang = 'hi-IN';
                        utterance.rate = 0.8;
                        window.speechSynthesis.speak(utterance);
                      } else {
                        alert("Speech synthesis not supported.");
                      }
                    }}
                    className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-lg transform transition hover:scale-110 border-2 border-yellow-200 group"
                    title="मंत्र उच्चारण सुनें (Play Audio Pronunciation)"
                  >
                    <Volume2 className="w-8 h-8 text-amber-950 group-hover:scale-110 transition" />
                  </button>
                  <span className="text-xs font-bold text-amber-200">उच्चारण सुनें (Audio Guide)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kundali Tab */}
        {activeTab === 'kundali' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-600" /> वैदिक जन्म कुंडली निर्माण
              </h2>
              <p className="text-stone-600 text-sm mb-6">अपनी जन्म तिथि, समय और स्थान दर्ज करके विस्तृत ज्योतिषीय विश्लेषण प्राप्त करें।</p>
              
              <form onSubmit={generateKundali} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">जातक का नाम</label>
                  <input 
                    type="text" 
                    value={kundaliForm.name}
                    onChange={(e) => setKundaliForm({...kundaliForm, name: e.target.value})}
                    className="w-full bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">जन्म तिथि (DOB)</label>
                  <input 
                    type="date" 
                    value={kundaliForm.dob}
                    onChange={(e) => setKundaliForm({...kundaliForm, dob: e.target.value})}
                    className="w-full bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">जन्म समय (TOB)</label>
                  <input 
                    type="time" 
                    value={kundaliForm.tob}
                    onChange={(e) => setKundaliForm({...kundaliForm, tob: e.target.value})}
                    className="w-full bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit"
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 px-4 rounded-lg shadow transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" /> कुंडली देखें
                  </button>
                </div>
              </form>
            </div>

            {kundaliResult && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-300 animate-fadeIn space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 border-amber-200">
                  <div>
                    <h3 className="text-2xl font-extrabold text-amber-950">{kundaliForm.name} की जन्म कुंडली</h3>
                    <p className="text-sm text-stone-500">जन्म: {kundaliForm.dob} समय {kundaliForm.tob}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUmaOpen(true);
                      handleSendUma(`नमस्ते उमा जी! मेरी जन्म कुंडली तैयार है (लग्न: ${kundaliResult.lagna}, राशि: ${kundaliResult.rashi}, महादशा: ${kundaliResult.mahadasha})। कृपया मेरे जीवन, करियर और भविष्य के बारे में विस्तार से मार्गदर्शन करें।`);
                    }}
                    className="mt-2 md:mt-0 bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow"
                  >
                    <MessageCircle className="w-4 h-4" /> उमा से इस कुंडली पर चर्चा करें
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">लग्न (Ascendant)</span>
                    <div className="text-xl font-bold text-amber-950 mt-1">{kundaliResult.lagna}</div>
                  </div>
                  <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">चन्द्र राशि (Moon Sign)</span>
                    <div className="text-xl font-bold text-amber-950 mt-1">{kundaliResult.rashi}</div>
                  </div>
                  <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">नक्षत्र (Nakshatra)</span>
                    <div className="text-xl font-bold text-amber-950 mt-1">{kundaliResult.nakshatra}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-600" /> दशा एवं योग विश्लेषण
                    </h4>
                    <p className="text-stone-700 font-medium"><strong>वर्तमान महादशा:</strong> {kundaliResult.mahadasha}</p>
                    <p className="text-stone-700 font-medium"><strong>मांगलिक स्थिति:</strong> {kundaliResult.manglik}</p>
                    <p className="text-stone-700 text-sm leading-relaxed bg-amber-50 p-4 rounded-lg">
                      {kundaliResult.summary}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" /> रत्न एवं उपाय (Remedies)
                    </h4>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-xs font-bold text-yellow-800 uppercase">सुझाए गए रत्न:</span>
                      <p className="text-amber-950 font-bold mt-1">{kundaliResult.gemstone}</p>
                    </div>
                    <p className="text-stone-600 text-sm">
                      विशेष शांति पूजा या मंत्र जप के लिए विद्वान उमा जी से परामर्श लें।
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Milan Tab */}
        {activeTab === 'milan' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-600" /> अष्टकूट गुण मिलान (Kundali Milan)
              </h2>
              <p className="text-stone-600 text-sm mb-6">वर एवं वधू के जन्म विवरण दर्ज कर विवाह मिलान और गुण स्कोर प्राप्त करें।</p>

              <form onSubmit={calculateMilan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200 space-y-4">
                  <h3 className="font-bold text-amber-900">वर का विवरण (Boy's Details)</h3>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">वर का नाम</label>
                    <input 
                      type="text" 
                      value={milanForm.boyName}
                      onChange={(e) => setMilanForm({...milanForm, boyName: e.target.value})}
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">जन्म तिथि</label>
                    <input 
                      type="date" 
                      value={milanForm.boyDob}
                      onChange={(e) => setMilanForm({...milanForm, boyDob: e.target.value})}
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="bg-orange-50/60 p-5 rounded-xl border border-orange-200 space-y-4">
                  <h3 className="font-bold text-orange-900">वधू का विवरण (Girl's Details)</h3>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">वधू का नाम</label>
                    <input 
                      type="text" 
                      value={milanForm.girlName}
                      onChange={(e) => setMilanForm({...milanForm, girlName: e.target.value})}
                      className="w-full bg-white border border-orange-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">जन्म तिथि</label>
                    <input 
                      type="date" 
                      value={milanForm.girlDob}
                      onChange={(e) => setMilanForm({...milanForm, girlDob: e.target.value})}
                      className="w-full bg-white border border-orange-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-lg"
                  >
                    <Heart className="w-5 h-5 text-yellow-300" /> गुण मिलान की गणना करें (Calculate Match)
                  </button>
                </div>
              </form>
            </div>

            {milanResult && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-300 animate-fadeIn space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 border-amber-200">
                  <div>
                    <h3 className="text-2xl font-extrabold text-amber-950">{milanForm.boyName} एवं {milanForm.girlName} का मिलान</h3>
                    <p className="text-sm text-stone-500">वैवाहिक अनुकूलता रिपोर्ट</p>
                  </div>
                  <div className="bg-amber-100 text-amber-950 px-6 py-3 rounded-2xl font-black text-2xl border-2 border-amber-500 shadow-inner mt-3 md:mt-0">
                    {milanResult.totalGun}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase">नाड़ी दोष (Nadi)</span>
                    <div className="text-lg font-bold text-amber-950 mt-1">{milanResult.nadi}</div>
                  </div>
                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase">भकूट मिलान (Bhakoot)</span>
                    <div className="text-lg font-bold text-amber-950 mt-1">{milanResult.bhakoot}</div>
                  </div>
                  <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase">गण मिलान (Gana)</span>
                    <div className="text-lg font-bold text-amber-950 mt-1">{milanResult.gana}</div>
                  </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 space-y-3">
                  <h4 className="font-bold text-amber-900 text-lg">निष्कर्ष एवं ज्योतिषीय परामर्श:</h4>
                  <p className="text-stone-800 font-medium">{milanResult.status}</p>
                  <p className="text-stone-600 text-sm leading-relaxed">{milanResult.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Muhurat Tab */}
        {activeTab === 'muhurat' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                <Clock className="w-6 h-6 text-amber-600" /> शुभ मुहूर्त (Auspicious Timings)
              </h2>
              <p className="text-stone-600 text-sm mb-6">विवाह, गृह प्रवेश, वाहन क्रय एवं नए व्यापार आरंभ हेतु सर्वोत्तम मुहूर्त।</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'विवाह मुहूर्त (Marriage)', date: 'नवंबर - दिसंबर 2026', desc: 'शीतकालीन सत्र में कुल 14 अत्यंत शुभ विवाह लग्न उपलब्ध हैं।', icon: Heart },
                  { title: 'गृह प्रवेश (House Warming)', date: 'इस माह के शुभ दिन', desc: 'रोहिणी और मृगशिरा नक्षत्र में गृह प्रवेश करना सर्वश्रेष्ठ रहेगा।', icon: Star },
                  { title: 'वाहन एवं संपत्ति क्रय', date: 'पुष्य एवं रवि पुष्य योग', desc: 'नया वाहन या संपत्ति खरीदने के लिए आगामी गुरुवार का दिन श्रेष्ठ है।', icon: Sparkles },
                ].map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="bg-amber-50/70 p-6 rounded-xl border border-amber-200 shadow-sm space-y-3 hover:shadow-md transition">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-amber-950 font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-amber-950">{m.title}</h3>
                      <div className="text-xs font-bold text-amber-700">{m.date}</div>
                      <p className="text-stone-600 text-sm">{m.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Gochar Tab */}
        {activeTab === 'gochar' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 border border-amber-200 space-y-4">
              <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <Compass className="w-6 h-6 text-amber-600" /> वर्तमान ग्रह गोचर (Planetary Transits)
              </h2>
              <p className="text-stone-600 text-sm">आकाशमंडल में ग्रहों की वर्तमान स्थिति और विभिन्न राशियों पर उनका प्रभाव।</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { planet: 'सूर्य (Sun)', sign: 'कन्या राशि', effect: 'तेज, मान-सम्मान और सरकारी कार्यों में सफलता।' },
                  { planet: 'चन्द्रमा (Moon)', sign: 'वृषभ राशि', effect: 'मन की शांति, भावनात्मक स्थिरता और धन लाभ।' },
                  { planet: 'मंगल (Mars)', sign: 'मिथुन राशि', effect: 'पराक्रम में वृद्धि, भूमि-भवन संबंधी कार्य.' },
                  { planet: 'बुध (Mercury)', sign: 'सिंह राशि', effect: 'बुद्धिमत्ता, व्यापारिक उन्नति और संवाद में कुशलता।' },
                  { planet: 'गुरु (Jupiter)', sign: 'वृषभ राशि', effect: 'ज्ञान, संतान सुख और आर्थिक समृद्धि।' },
                  { planet: 'शनि (Saturn)', sign: 'कुंभ राशि (वक्र)', effect: 'न्यायप्रियता, परिश्रम का फल और अनुशासन।' },
                ].map((g, idx) => (
                  <div key={idx} className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1">
                    <div className="font-bold text-amber-900">{g.planet}</div>
                    <div className="text-xs text-amber-700 font-semibold">स्थान: {g.sign}</div>
                    <p className="text-xs text-stone-600 mt-1">{g.effect}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sade Sati Tab */}
        {activeTab === 'sadesati' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 border border-amber-200 space-y-4">
              <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-600" /> शनि साढ़े साती एवं ढैया (Sade Sati Status)
              </h2>
              <p className="text-stone-600 text-sm">जानिए वर्तमान में शनि की साढ़े साती का प्रभाव किन राशियों पर है और इसके सरल ज्योतिषीय उपाय।</p>

              <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                <h3 className="font-bold text-amber-950 text-lg">वर्तमान स्थिति (2026):</h3>
                <ul className="list-disc list-inside text-stone-700 text-sm space-y-2">
                  <li><strong>मकर राशि:</strong> साढ़े साती का उतरता चरण (समाप्ति की ओर)।</li>
                  <li><strong>कुंभ राशि:</strong> साढ़े साती का मध्य चरण (कल्याणकारी शनि साधना आवश्यक)।</li>
                  <li><strong>मीन राशि:</strong> साढ़े साती का प्रथम चरण (मानसिक व शारीरिक सजगता रखें)।</li>
                  <li><strong>कर्क एवं वृश्चिक राशि:</strong> शनि की ढैया का प्रभाव।</li>
                </ul>
              </div>

              <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200 space-y-2">
                <h4 className="font-bold text-amber-900">शनि शांति एवं राहत के उपाय:</h4>
                <p className="text-stone-700 text-sm">प्रत्येक शनिवार को पीपल के वृक्ष के नीचे सरसों के तेल का दीपक जलाएं, हनुमान चालीसा का पाठ करें और काले तिल का दान करें। विद्वान उमा जी से व्यक्तिगत उपाय के लिए चैट करें।</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Uma Assistant Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsUmaOpen(true)}
          className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 border-4 border-yellow-200 transform transition hover:scale-110 group"
          title="विद्वान ज्योतिषी उमा से परामर्श करें"
        >
          <div className="relative">
            <Sparkles className="w-7 h-7 text-yellow-200 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <span className="hidden md:inline font-bold text-base tracking-wide pr-2">उमा - विद्वान ज्योतिष</span>
        </button>
      </div>

      {/* Uma Modal / Chat Drawer */}
      {isUmaOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-lg bg-gradient-to-b from-stone-900 via-amber-950 to-stone-950 text-amber-100 h-full shadow-2xl flex flex-col border-l border-amber-500/40">
            {/* Modal Header */}
            <div className="p-4 bg-amber-900/80 border-b border-amber-700/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-amber-950 font-bold text-lg shadow border-2 border-yellow-300">
                  उमा
                </div>
                <div>
                  <h3 className="font-extrabold text-amber-200 text-base flex items-center gap-1.5">
                    विद्वान ज्योतिष उमा 
                    <span className="text-[10px] bg-yellow-500 text-amber-950 px-1.5 py-0.5 rounded font-bold">AI Jyotishi</span>
                  </h3>
                  <p className="text-xs text-amber-300/80">वैदिक ज्योतिष, कुंडली एवं पंचांग विशेषज्ञ</p>
                </div>
              </div>
              <button
                onClick={() => setIsUmaOpen(false)}
                className="p-2 text-amber-300 hover:text-white rounded-lg hover:bg-amber-800/50 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2.5 bg-stone-900/90 border-b border-amber-900/50 flex overflow-x-auto space-x-2 no-scrollbar">
              {[
                "मेरी कुंडली में कौन सा रत्न शुभ रहेगा?",
                "साढ़े साती का प्रभाव कैसे कम करें?",
                "आज का दिन मेरे लिए कैसा रहेगा?",
                "विवाह और मांगलिक दोष के बारे में बताएं"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendUma(chip)}
                  className="bg-amber-950/80 hover:bg-amber-800 text-amber-200 text-xs px-3 py-1.5 rounded-full whitespace-nowrap border border-amber-700/60 transition shadow-sm flex items-center gap-1"
                >
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {umaMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                      msg.role === 'user'
                        ? 'bg-amber-600 text-white rounded-br-none'
                        : 'bg-stone-800/90 text-amber-100 rounded-bl-none border border-amber-700/40'
                    }`}
                  >
                    {msg.role === 'model' && (
                      <div className="flex items-center justify-between gap-1.5 text-xs text-yellow-400 font-bold mb-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>विद्वान उमा</span>
                        </div>
                        <button
                          onClick={() => speakUma(msg.text)}
                          className="p-1 hover:bg-amber-800/60 rounded text-amber-200 transition"
                          title="उमा की आवाज़ सुनें (Listen)"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                </div>
              ))}
              {isUmaLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-800 text-amber-200 rounded-2xl rounded-bl-none px-4 py-3 text-sm border border-amber-700/40 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>उमा ग्रहों की गणना कर रही हैं...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-stone-900 border-t border-amber-900/60 flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendUma()}
                placeholder={isListening ? "सुना जा रहा है... बोलिए..." : "उमा जी से अपना ज्योतिष प्रश्न पूछें..."}
                className="flex-grow bg-stone-800 border border-amber-700/60 rounded-xl px-4 py-3 text-amber-100 placeholder-amber-400/50 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-xl shadow transition flex items-center justify-center border ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 animate-pulse' 
                    : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-700/60'
                }`}
                title={isListening ? "सुनना बंद करें" : "बोलकर प्रश्न पूछें (Voice Input)"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => handleSendUma()}
                disabled={isUmaLoading || !userInput.trim()}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white p-3 rounded-xl shadow transition flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-amber-200/70 text-center py-6 border-t border-amber-900 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 शक्ति पंचांग & विद्वान ज्योतिष उमा. सर्वाधिकार सुरक्षित।</p>
          <div className="flex items-center gap-4 text-amber-300">
            <span>ॐ सर्वे भवन्तु सुखिनः</span>
            <span>•</span>
            <span>सटीक वैदिक ज्योतिष</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
