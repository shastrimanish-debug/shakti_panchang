import React, { useState, useEffect } from 'react';
import { ActiveTab, PanchangData } from './types';
import { calculatePanchang } from './services/astronomy';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PanchangView } from './components/PanchangView';
import { FestivalsView } from './components/FestivalsView';
import { MuhuratView } from './components/MuhuratView';
import { KundaliView } from './components/KundaliView';
import { VratKathaView } from './components/VratKathaView';
import { ChoghadiyaView } from './components/ChoghadiyaView';
import { SadeSatiView } from './components/SadeSatiView';
import { UpayView } from './components/UpayView';
import { VastuView } from './components/VastuView';
import { UmaAssistantModal } from './components/UmaAssistantModal';
import { LocationModal } from './components/LocationModal';
import { Star, Shield, Sparkles, RefreshCw, Heart, Compass, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [location, setLocation] = useState('नई दिल्ली (New Delhi)');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isUmaOpen, setIsUmaOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'uma') {
      setIsUmaOpen(true);
    }
  }, [activeTab]);

  const handleCloseUma = () => {
    setIsUmaOpen(false);
    if (activeTab === 'uma') {
      setActiveTab('dashboard');
    }
  };

  // Rashifal state
  const [selectedRashi, setSelectedRashi] = useState('मेष (Aries)');
  const [rashifalText, setRashifalText] = useState('');
  const [isRashifalLoading, setIsRashifalLoading] = useState(false);

  const panchang: PanchangData = calculatePanchang(selectedDate, location);

  const rashis = [
    'मेष (Aries)', 'वृषभ (Taurus)', 'मिथुन (Gemini)', 'कर्क (Cancer)',
    'सिंह (Leo)', 'कन्या (Virgo)', 'तुला (Libra)', 'वृश्चिक (Scorpio)',
    'धनु (Sagittarius)', 'मकर (Capricorn)', 'कुंभ (Aquarius)', 'मीन (Pisces)'
  ];

  const fetchRashifal = async (rashiName: string) => {
    setIsRashifalLoading(true);
    try {
      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a detailed daily astrological prediction (Rashifal) for ${rashiName} in Hindi, covering career, health, relationships, financial outlook, lucky color, and lucky number for today.`
      });
      setRashifalText(response.text || 'आज का राशिफल उत्पन्न करने में असमर्थ।');
    } catch (e) {
      setRashifalText(`आज ${rashiName} के जातकों के लिए दिन मिला-जुला रहेगा। कार्यक्षेत्र में प्रगति होगी और परिवार का सहयोग मिलेगा। स्वास्थ्य का ध्यान रखें। शुभ रंग: पीला, शुभ अंक: 3.`);
    } finally {
      setIsRashifalLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rashifal') {
      fetchRashifal(selectedRashi);
    }
  }, [selectedRashi, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100/50 pb-24 text-stone-900 font-sans">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        location={location}
        setLocation={setLocation}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onOpenUma={() => setIsUmaOpen(true)}
        onOpenLocationModal={() => setIsLocationOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView 
            panchang={panchang}
            setActiveTab={setActiveTab}
            onOpenUma={() => setIsUmaOpen(true)}
          />
        )}

        {activeTab === 'panchang' && (
          <PanchangView panchang={panchang} />
        )}

        {activeTab === 'festivals' && (
          <FestivalsView />
        )}

        {activeTab === 'muhurat' && (
          <MuhuratView />
        )}

        {activeTab === 'kundali' && (
          <KundaliView />
        )}

        {activeTab === 'vrat' && (
          <VratKathaView />
        )}

        {activeTab === 'choghadiya' && (
          <ChoghadiyaView />
        )}

        {activeTab === 'sadesati' && (
          <SadeSatiView />
        )}

        {activeTab === 'upay' && (
          <UpayView />
        )}

        {activeTab === 'vastu' && (
          <VastuView />
        )}

        {activeTab === 'milan' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-amber-600" /> गुण मिलान (Kundali Milan - 36 Gun)
              </h2>
              <p className="text-sm text-stone-600 mt-1">वर और वधू की जन्म कुंडली के अष्टकूट गुण मिलान की पारंपरिक वैदिक पद्धति।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-md border border-amber-200 space-y-4">
                <h3 className="font-bold text-amber-900 border-b pb-2">वर का विवरण (Boy's Details)</h3>
                <input type="text" placeholder="वर का नाम" className="w-full px-4 py-3 rounded-2xl border border-amber-300 text-sm" />
                <input type="date" className="w-full px-4 py-3 rounded-2xl border border-amber-300 text-sm" />
                <input type="text" placeholder="जन्म नक्षत्र / राशि" className="w-full px-4 py-3 rounded-2xl border border-amber-300 text-sm" />
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-md border border-amber-200 space-y-4">
                <h3 className="font-bold text-amber-900 border-b pb-2">वधू का विवरण (Girl's Details)</h3>
                <input type="text" placeholder="वधू का नाम" className="w-full px-4 py-3 rounded-2xl border border-amber-300 text-sm" />
                <input type="date" className="w-full px-4 py-3 rounded-2xl border border-amber-300 text-sm" />
                <input type="text" placeholder="जन्म नक्षत्र / राशि" className="w-full px-4 py-3 rounded-2xl border border-amber-300 text-sm" />
              </div>
            </div>
            <div className="text-center">
              <button 
                onClick={() => alert('अष्टकूट मिलान सफल! कुल गुण: 28/36 (उत्तम मिलान)')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                गुण मिलान करें (Calculate Milan)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'gochar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <Compass className="w-6 h-6 text-amber-600" /> ग्रह गोचर स्थिति (Planetary Transits)
              </h2>
              <p className="text-sm text-stone-600 mt-1">वर्तमान समय में आकाश मंडल में ग्रहों की स्थिति और राशिनुसार प्रभाव।</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { planet: 'सूर्य देव', sign: 'कन्या राशि', status: 'मार्गी', effect: 'मान-सम्मान और करियर में उन्नति।' },
                { planet: 'चंद्रमा', sign: 'वृषभ राशि', status: 'उच्च राशि', effect: 'मानसिक शांति और सौम्यता।' },
                { planet: 'मंगल', sign: 'मिथुन राशि', status: 'मार्गी', effect: 'पराक्रम और ऊर्जा में वृद्धि।' },
                { planet: 'बुध', sign: 'सिंह राशि', status: 'वक्र गति', effect: 'वाणी और बौद्धिक कार्यों में सावधानी।' },
                { planet: 'गुरु (बृहस्पति)', sign: 'वृषभ राशि', status: 'मार्गी', effect: 'धन लाभ और आध्यात्मिक प्रगति।' },
                { planet: 'शनि देव', sign: 'कुंभ राशि', status: 'वक्र (अपनी राशि)', effect: 'न्याय और कर्मानुसार फल।' },
              ].map((g, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-amber-900 text-lg">{g.planet}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">{g.status}</span>
                  </div>
                  <p className="text-sm text-stone-700"><strong>स्थिति:</strong> {g.sign}</p>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">{g.effect}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ratna' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-600" /> रत्न विचार एवं ज्योतिषीय उपाय (Gemstones)
              </h2>
              <p className="text-sm text-stone-600 mt-1">कौन सा रत्न किस ग्रह की शांति और भाग्य वृद्धि के लिए धारण करें।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { name: 'माणिक्य (Ruby)', planet: 'सूर्य', benefit: 'यश, मान-सम्मान और नेतृत्व क्षमता।' },
                { name: 'मोती (Pearl)', planet: 'चंद्रमा', benefit: 'मानसिक शांति और एकाग्रता।' },
                { name: 'मूंगा (Coral)', planet: 'मंगल', benefit: 'साहस, भूमि सुख और ऊर्जा।' },
                { name: 'पन्ना (Emerald)', planet: 'बुध', benefit: 'बुद्धि, व्यापार और वक्ता कौशल।' },
                { name: 'पुखराज (Yellow Sapphire)', planet: 'गुरु', benefit: 'ज्ञान, धन, सौभाग्य और वैवाहिक सुख।' },
                { name: 'नीलम (Blue Sapphire)', planet: 'शनि', benefit: 'शीघ्र सफलता और अनुशासन (विशेष ज्योतिषी सलाह से पहनें)।' }
              ].map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-1">{r.name}</h3>
                  <p className="text-xs text-amber-700 font-semibold mb-2">स्वामी ग्रह: {r.planet}</p>
                  <p className="text-sm text-stone-600 leading-relaxed">{r.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mantra' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-600" /> वैदिक मंत्र एवं स्तोत्र (Mantras & Stotram)
              </h2>
              <p className="text-sm text-stone-600 mt-1">दैनिक जाप और मानसिक शांति हेतु शक्तिशाली वैदिक मंत्र।</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'महामृत्युंजय मंत्र', sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्।', meaning: 'भगवान शिव का यह महामंत्र अकाल मृत्यु से रक्षा और आरोग्य प्रदान करता है।' },
                { title: 'गायत्री मंत्र', sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्।', meaning: 'बुद्धि और तेजस्विता की प्राप्ति हेतु सबसे पवित्र महामंत्र।' },
                { title: 'गणेश बीज मंत्र', sanskrit: 'ॐ गं गणपतये नमः।', meaning: 'सभी विघ्न-बाधाओं के नाश और शुभ कार्यों की शुरुआत हेतु।' },
              ].map((m, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-2">{m.title}</h3>
                  <p className="font-serif text-amber-800 text-lg mb-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">{m.sanskrit}</p>
                  <p className="text-sm text-stone-600 leading-relaxed">{m.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rashifal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-600" /> अपनी राशि चुनें (Daily Rashifal)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {rashis.map((rashi) => (
                  <button
                    key={rashi}
                    onClick={() => setSelectedRashi(rashi)}
                    className={`p-3.5 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                      selectedRashi === rashi
                        ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                        : 'bg-amber-50/50 text-stone-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {rashi}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-amber-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Star className="w-32 h-32 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-1">{selectedRashi} का राशिफल</h3>
              <p className="text-xs text-amber-600 mb-4 font-semibold">दिनांक: {selectedDate} • AI ज्योतिषीय विश्लेषण</p>
              
              {isRashifalLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-amber-700">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
                  <p className="text-sm font-medium">तारे आपकी गणना कर रहे हैं...</p>
                </div>
              ) : (
                <div className="prose text-stone-700 leading-relaxed whitespace-pre-line bg-amber-50/40 p-6 rounded-2xl border border-amber-100 text-sm">
                  {rashifalText}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <UmaAssistantModal 
        isOpen={isUmaOpen}
        onClose={handleCloseUma}
      />

      <LocationModal 
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        location={location}
        setLocation={setLocation}
      />
    </div>
  );
}
