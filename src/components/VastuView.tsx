import React, { useState } from 'react';
import { Compass, Home, Sparkles, CheckCircle2, ChevronRight, Bookmark, X } from 'lucide-react';

export const VastuView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const vastuTopics = [
    {
      id: 'home',
      title: 'गृह वास्तु शास्त्र (Home Vastu)',
      subtitle: 'मुख्य द्वार, हॉल, और संपूर्ण घर की सकारात्मक ऊर्जा के नियम',
      icon: Home,
      color: 'bg-amber-600',
      pages: [
        {
          title: 'विषय-सूची (Vastu Index)',
          type: 'index',
          content: [
            { page: 1, name: 'मुखपृष्ठ' },
            { page: 2, name: '1. मुख्य द्वार (Main Entrance) के नियम' },
            { page: 3, name: '2. पूजा कक्ष (Puja Room) की सही दिशा' },
            { page: 4, name: '3. रसोईघर (Kitchen) एवं अग्नि कोण' },
            { page: 5, name: '4. शयनकक्ष (Bedroom) एवं बेड की स्थिति' }
          ]
        },
        {
          title: '1. मुख्य द्वार (Main Entrance) के नियम',
          type: 'rule',
          direction: 'उत्तर, पूर्व या ईशान कोण (North, East, or North-East)',
          description: 'घर का मुख्य द्वार हमेशा साफ-सुथरा और रोशनी से परिपूर्ण होना चाहिए। मुख्य द्वार पर कभी भी कूड़ेदान या जूते-चप्पल न रखें। द्वार पर शुभ-लाभ, स्वास्तिक या ऊँ का चिन्ह लगाना अत्यंत शुभ होता है।',
          benefit: 'इससे घर में सकारात्मक ऊर्जा (Positive Energy) और माता लक्ष्मी का प्रवेश होता है।'
        },
        {
          title: '2. पूजा कक्ष (Puja Room) की सही दिशा',
          type: 'rule',
          direction: 'ईशान कोण (North-East / Northeast Corner)',
          description: 'पूजा घर हमेशा ईशान कोण में होना चाहिए। भगवान का मुख पश्चिम की ओर हो ताकि पूजा करते समय आपका मुख पूर्व (East) या उत्तर (North) दिशा की ओर रहे। पूजा कक्ष में कभी भी खंडित मूर्तियां या पुरानी तस्वीरें न रखें।',
          benefit: 'घर में शांति, मानसिक एकाग्रता और आध्यात्मिक उन्नति बनी रहती है।'
        },
        {
          title: '3. रसोईघर (Kitchen) एवं अग्नि कोण',
          type: 'rule',
          direction: 'दक्षिण-पूर्व (South-East / Agneey Kon)',
          description: 'भोजन पकाने का स्थान हमेशा आग्नेय कोण में होना चाहिए। चूल्हा (Gas Stove) पूर्व दिशा की ओर मुंह करके खाना बनाने के अनुकूल हो। पीने का पानी और चूल्हा आमने-सामने नहीं होना चाहिए।',
          benefit: 'स्वास्थ्य उत्तम रहता है और घर में अन्न-धन की बरकत बनी रहती है।'
        },
        {
          title: '4. शयनकक्ष (Bedroom) एवं बेड की स्थिति',
          type: 'rule',
          direction: 'दक्षिण या पश्चिम (South or West)',
          description: 'सोते समय सिर हमेशा दक्षिण (South) या पूर्व (East) दिशा की ओर होना चाहिए। बेडरूम में कभी भी शीशा (Mirror) बेड के सामने नहीं होना चाहिए। दीवारों पर हल्के और शांत रंगों का प्रयोग करें।',
          benefit: 'गहरी नींद आती है, तनाव दूर होता है और दांपत्य जीवन में मधुरता बनी रहती है।'
        }
      ]
    }
  ];

  const openTopic = (topic: any) => {
    setSelectedTopic(topic);
    setCurrentPage(0);
  };

  const pages = selectedTopic ? selectedTopic.pages : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Compass className="w-6 h-6 text-amber-600" /> वास्तु शास्त्र मार्गदर्शन (Vastu Shastra)
        </h2>
        <p className="text-sm text-stone-600 mt-1">सनातन वास्तुकला के प्राचीन सिद्धांतों पर आधारित घर, कार्यालय और जीवन में सुख-समृद्धि लाने के अचूक वास्तु नियम।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vastuTopics.map((topic) => {
          const Icon = topic.icon;
          return (
            <div key={topic.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className={`w-14 h-14 rounded-2xl ${topic.color} text-white flex items-center justify-center shadow-md mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{topic.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-6">{topic.subtitle}</p>
              </div>
              <button
                onClick={() => openTopic(topic)}
                className="self-start flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow cursor-pointer"
              >
                <Compass className="w-4 h-4" /> वास्तु ग्रंथ खोलें <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Book Reader Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-[#fcf8ec] rounded-3xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl border-4 border-amber-700/60 relative overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-950 text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/30 flex items-center justify-center border border-amber-400/50">
                  <Compass className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base md:text-lg tracking-wide">{selectedTopic.title}</h3>
                  <p className="text-xs text-amber-200/90 font-sans">प्राचीन वास्तु शास्त्र • ग्रंथ वाचन मोड</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-sans">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" /> विषय-सूची
                </button>
                <button 
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 text-[#2c1810] font-serif selection:bg-amber-200">
              {currentPage === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
                  <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-600/40 flex items-center justify-center shadow-inner">
                    <Compass className="w-12 h-12 text-amber-800 animate-pulse" />
                  </div>
                  <div className="space-y-3 max-w-xl">
                    <span className="text-xs uppercase tracking-widest bg-amber-200/80 text-amber-950 px-3.5 py-1 rounded-full font-bold font-sans">
                      वास्तु शास्त्र ग्रंथ
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-amber-950 tracking-tight leading-tight">
                      {selectedTopic.title}
                    </h1>
                    <p className="text-sm md:text-base text-stone-700 pt-2 leading-relaxed">
                      {selectedTopic.subtitle}
                    </p>
                  </div>
                  <div className="pt-6 flex gap-4 justify-center font-sans">
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="bg-amber-900 hover:bg-amber-950 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-amber-300" /> विषय-सूची देखें
                    </button>
                    <button
                      onClick={() => setCurrentPage(2)}
                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
                    >
                      पढ़ना शुरू करें <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : currentPage === 1 ? (
                <div className="max-w-2xl mx-auto space-y-6 py-4">
                  <div className="border-b-2 border-amber-800/30 pb-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-amber-950">विषय-सूची (Index)</h2>
                  </div>
                  <div className="grid gap-3 font-sans">
                    {pages.map((p: any, idx: number) => {
                      if (idx === 0) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className="w-full text-left bg-white/90 hover:bg-amber-100/90 p-4 rounded-2xl border border-amber-300 shadow-sm flex items-center justify-between transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-amber-200 text-amber-950 font-bold flex items-center justify-center text-xs">
                              {idx}
                            </span>
                            <span className="font-bold text-stone-900 group-hover:text-amber-900 text-sm md:text-base">
                              {p.title}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                            पढ़ें <ChevronRight className="w-4 h-4" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                (() => {
                  const rule = pages[currentPage - 1] || pages[1];
                  return (
                    <div className="max-w-3xl mx-auto space-y-6 py-4 font-serif">
                      <div className="flex justify-between items-center text-xs font-sans text-stone-600 border-b border-amber-800/20 pb-3">
                        <span className="bg-amber-200/90 text-amber-950 px-3 py-1 rounded-full font-bold">
                          वास्तु नियम {currentPage - 1} / {pages.length}
                        </span>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" /> विषय-सूची पर लौटें
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-950 leading-tight">
                          {rule.title}
                        </h2>

                        <div className="bg-amber-100/80 p-4 rounded-2xl border-l-4 border-amber-700 text-amber-950 font-sans font-bold text-sm">
                          सही दिशा / स्थान: {rule.direction}
                        </div>

                        <div className="bg-white/80 p-6 rounded-2xl border border-amber-200 shadow-sm space-y-3 font-serif">
                          <h4 className="text-xs uppercase font-sans font-bold tracking-wide text-amber-800">वास्तु नियम एवं विवरण:</h4>
                          <p className="text-stone-900 text-base md:text-lg leading-relaxed">
                            {rule.description}
                          </p>
                        </div>

                        <div className="bg-emerald-50/80 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-2 font-serif">
                          <h4 className="text-xs uppercase font-sans font-bold tracking-wide text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> वास्तु लाभ:
                          </h4>
                          <p className="text-emerald-950 text-sm md:text-base leading-relaxed">
                            {rule.benefit}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#f5ebd6] border-t border-amber-800/30 px-6 py-4 flex items-center justify-between text-stone-800 font-sans shadow-inner z-10">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage === 0 ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500' : 'bg-amber-800 text-white cursor-pointer shadow'
                }`}
              >
                पिछला पृष्ठ
              </button>
              <div className="text-xs font-bold text-amber-950">
                पृष्ठ {currentPage} / {pages.length}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
                disabled={currentPage >= pages.length}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage >= pages.length ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500' : 'bg-amber-800 text-white cursor-pointer shadow'
                }`}
              >
                अगला पृष्ठ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
