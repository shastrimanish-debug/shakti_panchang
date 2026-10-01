import React, { useState } from 'react';
import { Sparkles, BookOpen, CheckCircle2, ChevronRight, ChevronLeft, Bookmark, X, Shield, Star } from 'lucide-react';

export const UpayView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0 = Cover, 1 = Index, 2+ = Pages

  const upayCategories = [
    {
      id: 'education',
      title: 'बच्चों की शिक्षा, एकाग्रता एवं मोबाइल मुक्ति',
      subtitle: 'विद्या प्राप्ति, स्मरण शक्ति और गेम/मोबाइल की लत छुड़ाने के अचूक व सरल उपाय',
      icon: BookOpen,
      color: 'bg-emerald-600',
      pages: [
        {
          title: 'विषय-सूची (Education Index)',
          type: 'index',
          content: [
            { page: 1, name: 'मुखपृष्ठ' },
            { page: 2, name: '1. एकाग्रता और स्मरण शक्ति बढ़ाने का महामंत्र' },
            { page: 3, name: '2. मोबाइल व वीडियो गेम्स की लत छुड़ाने का अचूक उपाय' },
            { page: 4, name: '3. परीक्षा में सफलता और आत्मविश्वास हेतु उपाय' },
            { page: 5, name: '4. अध्ययन कक्ष (Study Room) का वास्तु नियम' }
          ]
        },
        {
          title: '1. एकाग्रता और स्मरण शक्ति बढ़ाने का महामंत्र',
          type: 'remedy',
          sanskrit: 'ॐ ऐं महासरस्वत्यै नमः । सरस्वत्यै नमो नित्यं भद्रकाल्यै नमो नमः।',
          howTo: 'प्रत्येक दिन प्रातःकाल स्नान के पश्चात बच्चे को पूर्व दिशा की ओर मुख करके बैठना चाहिए। माँ सरस्वती का स्मरण कर स्फटिक या रुद्राक्ष की माला से इस मंत्र की एक माला (108 बार) जप करें।',
          benefit: 'इससे बुद्धि तीव्र होती है, याददाश्त मजबूत होती है और पढ़ाई में मन लगने लगता है।'
        },
        {
          title: '2. मोबाइल व वीडियो गेम्स की लत छुड़ाने का अचूक उपाय',
          type: 'remedy',
          sanskrit: 'ॐ गं गणपतये नमः । दुर्वा अर्पण विधि।',
          howTo: 'बुधवार के दिन गणेश मंदिर जाएं। गणेश जी को 21 दुर्वा (घास) अर्पित करें और उनसे प्रार्थना करें कि "हे विघ्नहर्ता, बच्चे का मन दुर्बुद्धि और मोबाइल गेम्स से हटाकर विवेक व शिक्षा में लगाएं।" गणेश जी को अर्पित गुड़ का भोग बच्चे को प्रसाद रूप में दें।',
          benefit: 'राहु और केतु के कुप्रभाव शांत होते हैं जो बच्चों को डिजिटल स्क्रीन और गेम्स की तरफ आकर्षित करते हैं।'
        },
        {
          title: '3. परीक्षा में सफलता और आत्मविश्वास हेतु उपाय',
          type: 'remedy',
          sanskrit: 'संकट मोचन हनुमान अष्टक पाठ एवं सूर्योदय अर्घ्य।',
          howTo: 'परीक्षा के दिनों में बच्चे को रोज सुबह तांबे के लोटे में जल, थोड़ा सा सिंदूर और लाल फूल डालकर सूर्य देव को अर्घ्य देना चाहिए। साथ ही संध्याकाल में हनुमान जी के सामने चमेली के तेल का दीपक जलाकर हनुमान चालीसा का पाठ करें।',
          benefit: 'परीक्षा का डर, घबराहट और परीक्षा कक्ष का तनाव पूरी तरह समाप्त होता है।'
        },
        {
          title: '4. अध्ययन कक्ष (Study Room) का वास्तु',
          type: 'remedy',
          sanskrit: 'दिशा एवं रंग संयोजन नियम',
          howTo: 'बच्चे का पठन-पाठन करते समय मुख पूर्व (East) या उत्तर (North) दिशा की ओर होना चाहिए। स्टडी टेबल पर कभी भी कचरा या किताबें बिखरी न रखें। मेज पर हल्का पीला या हरा रंग अत्यंत शुभ होता है।',
          benefit: 'सकारात्मक ऊर्जा का प्रवाह बढ़ता है और आलस्य दूर होता है।'
        }
      ]
    },
    {
      id: 'career',
      title: 'करियर, नौकरी एवं व्यवसाय में सफलता',
      subtitle: 'प्रमोशन, नई नौकरी, इंटरव्यू में सफलता और व्यापार वृद्धि के अचूक उपाय',
      icon: Star,
      color: 'bg-amber-600',
      pages: [
        {
          title: 'विषय-सूची (Career Index)',
          type: 'index',
          content: [
            { page: 1, name: 'मुखपृष्ठ' },
            { page: 2, name: '1. मनचाही नौकरी और प्रमोशन का अचूक उपाय' },
            { page: 3, name: '2. इंटरव्यू (Interview) में शत-प्रतिशत सफलता के लिए' },
            { page: 4, name: '3. व्यापार और दुकान में ग्राहकों की वृद्धि हेतु' },
            { page: 5, name: '4. सूर्य देव की आराधना से नेतृत्व क्षमता विकास' }
          ]
        },
        {
          title: '1. मनचाही नौकरी और प्रमोशन का अचूक उपाय',
          type: 'remedy',
          sanskrit: 'ॐ श्रीं ह्रीं श्रीं कमले महालक्ष्मये नमः।',
          howTo: 'प्रत्येक शुक्रवार को लक्ष्मी मंदिर में जाकर कमल का फूल या मखाने की खीर का भोग लगाएं। साथ ही किसी सुहागन स्त्री को सुहाग की वस्तुएं दान करें।',
          benefit: 'नौकरी में आ रही अड़चनें दूर होती हैं और उच्चाधिकारियों का सहयोग प्राप्त होता है।'
        },
        {
          title: '2. इंटरव्यू (Interview) में सफलता के लिए',
          type: 'remedy',
          sanskrit: 'गणपति बाप्पा मोरया - विघ्नहर्ता स्मरण।',
          howTo: 'जब भी इंटरव्यू या महत्वपूर्ण मीटिंग के लिए घर से निकलें, घर की देहरी पर थोड़ा सा कच्चा मीठा दही खाकर और दाईं (Right) पैर पहले बाहर रखकर निकलें। जेब में एक छोटा टुकड़ा गुड़ का रखें।',
          benefit: 'बुध और सूर्य मजबूत होते हैं, जिससे वाणी में प्रभाव और कार्य में सफलता मिलती है।'
        },
        {
          title: '3. व्यापार और दुकान में वृद्धि हेतु',
          type: 'remedy',
          sanskrit: 'श्री यंत्र एवं व्यापार वृद्धि यंत्र स्थापना।',
          howTo: 'गुरुवार के दिन अपनी दुकान या ऑफिस के ईशान कोण (North-East) को गंगाजल से पवित्र कर पीला वस्त्र बिछाएं। वहाँ हल्दी से रंगे चावल की ढेरी पर श्रीयंत्र स्थापित कर धूप-दीप दिखाएं।',
          benefit: 'व्यापार में मंदी दूर होती है और नए ग्राहकों का आगमन तेजी से होता है।'
        },
        {
          title: '4. सूर्य देव की आराधना',
          type: 'remedy',
          sanskrit: 'ॐ सूर्याय नमः । घृणिः सूर्य आदित्यो नमो नमः।',
          howTo: 'प्रतिदिन सुबह तांबे के लोटे में शुद्ध जल, अक्षत और लाल चंदन मिलाकर उगते हुए सूर्य को अर्घ्य दें।',
          benefit: 'समाज में मान-सम्मान, यश और उच्च पद की प्राप्ति होती है।'
        }
      ]
    },
    {
      id: 'debt',
      title: 'कर्ज मुक्ति एवं आर्थिक समृद्धि',
      subtitle: 'पुराने कर्ज से छुटकारा, धन के नए स्रोत और बरकत के सरल उपाय',
      icon: Shield,
      color: 'bg-red-600',
      pages: [
        {
          title: 'विषय-सूची (Debt Relief Index)',
          type: 'index',
          content: [
            { page: 1, name: 'मुखपृष्ठ' },
            { page: 2, name: '1. ऋणमोचन मंगल स्तोत्र और मंगलवार व्रत' },
            { page: 3, name: '2. पीपल के वृक्ष के नीचे दीपक जलाने का विधान' },
            { page: 4, name: '3. घर में धन टिकने और बरकत का अचूक टोटका' },
            { page: 5, name: '4. महालक्ष्मी कुबेर मंत्र जाप' }
          ]
        },
        {
          title: '1. ऋणमोचन मंगल स्तोत्र और मंगलवार',
          type: 'remedy',
          sanskrit: 'ॐ अंगारकाय नमः । ऋणमोचन मंगल स्तोत्र पाठ।',
          howTo: 'मंगलवार के दिन हनुमान मंदिर जाएं। हनुमान जी के चरणों का सिंदूर अपने माथे पर लगाएं। मंगलवार का व्रत रखें और शाम को ऋणमोचन मंगल स्तोत्र का पाठ करें।',
          benefit: 'मंगल ग्रह के कारण बढ़ा हुआ कर्ज और भूमि-भवन संबंधी ऋण शीघ्र चुकने लगते हैं।'
        },
        {
          title: '2. पीपल के वृक्ष के नीचे दीपक',
          type: 'remedy',
          sanskrit: 'सरसों के तेल का चौमुखा दीया।',
          howTo: 'शनिवार की शाम को किसी प्राचीन पीपल के वृक्ष के नीचे सरसों के तेल का चार मुख वाला (चौमुखा) दीया जलाएं और बिना पीछे मुड़े घर वापस आ जाएं।',
          benefit: 'शनि और पितृ दोष शांत होते हैं, जिससे अचानक धन लाभ और कर्ज से मुक्ति के मार्ग खुलते हैं।'
        },
        {
          title: '3. घर में बरकत का अचूक उपाय',
          type: 'remedy',
          sanskrit: 'फटकड़ी (Alum) और सेंधा नमक उपाय।',
          howTo: 'घर के मुख्य द्वार के कोने में कांच की एक कटोरी में थोड़ी सी फटकड़ी के टुकड़े रख दें। हर 15 दिन पर उसे बदल दें।',
          benefit: 'नकारात्मक ऊर्जा और नजर दोष दूर होती है, जिससे घर में बरकत और धन की आवक बढ़ती है।'
        },
        {
          title: '4. महालक्ष्मी कुबेर मंत्र जाप',
          type: 'remedy',
          sanskrit: 'ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये धनधान्यसमृद्धिं मे देहि दापय स्वाहा।',
          howTo: 'रात को सोते समय तिजोरी या धन रखने वाले स्थान के पास बैठकर इस मंत्र का 108 बार मानसिक जप करें।',
          benefit: 'कुबेर देवता और माता लक्ष्मी की कृपा से आर्थिक तंगी दूर होती है।'
        }
      ]
    }
  ];

  const openCategory = (cat: any) => {
    setSelectedCategory(cat);
    setCurrentPage(0); // Cover page
  };

  const currentCat = upayCategories.find(c => c.id === selectedCategory);
  const pages = currentCat ? currentCat.pages : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-600" /> चमत्कारिक एवं सरल ज्योतिषीय उपाय (ग्रंथों से संग्रहित)
        </h2>
        <p className="text-sm text-stone-600 mt-1">आज के समय की सबसे बड़ी समस्याएं — कर्ज मुक्ति, करियर सफलता, और बच्चों की शिक्षा व मोबाइल मुक्ति के अचूक व अत्यंत सरल उपाय।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upayCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className={`w-14 h-14 rounded-2xl ${cat.color} text-white flex items-center justify-center shadow-md mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-6">{cat.subtitle}</p>
              </div>
              <button
                onClick={() => openCategory(cat)}
                className="self-start flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow cursor-pointer"
              >
                <BookOpen className="w-4 h-4" /> उपाय ग्रंथ खोलें (Open Book) <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Book Reader Modal */}
      {selectedCategory && currentCat && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-[#fcf8ec] rounded-3xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl border-4 border-amber-700/60 relative overflow-hidden">
            
            {/* Header Toolbar */}
            <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-950 text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/30 flex items-center justify-center border border-amber-400/50">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base md:text-lg tracking-wide">{currentCat.title}</h3>
                  <p className="text-xs text-amber-200/90 font-sans">चमत्कारिक एवं सरल उपाय • ग्रंथ वाचन मोड</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-sans">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" /> विषय-सूची (Index)
                </button>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 text-[#2c1810] font-serif selection:bg-amber-200">
              {currentPage === 0 ? (
                // Cover Page
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
                  <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-600/40 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-12 h-12 text-amber-800 animate-pulse" />
                  </div>
                  <div className="space-y-3 max-w-xl">
                    <span className="text-xs uppercase tracking-widest bg-amber-200/80 text-amber-950 px-3.5 py-1 rounded-full font-bold font-sans">
                      पवित्र ज्योतिषीय ग्रंथ • सरल उपाय संग्रह
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-amber-950 tracking-tight leading-tight">
                      {currentCat.title}
                    </h1>
                    <p className="text-sm md:text-base text-stone-700 pt-2 leading-relaxed">
                      {currentCat.subtitle}
                    </p>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center font-sans">
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="bg-amber-900 hover:bg-amber-950 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-amber-300" /> विषय-सूची (Index देखें)
                    </button>
                    <button
                      onClick={() => setCurrentPage(2)}
                      className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      पहला उपाय पढ़ें <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : currentPage === 1 ? (
                // Index Page
                <div className="max-w-2xl mx-auto space-y-6 py-4">
                  <div className="border-b-2 border-amber-800/30 pb-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-amber-950">विषय-सूची (Index / अनुक्रमणिका)</h2>
                    <p className="text-xs text-stone-600 mt-1 font-sans">पढ़ने के लिए किसी भी उपाय पर क्लिक करें</p>
                  </div>
                  
                  <div className="grid gap-3 font-sans">
                    {pages.map((p, idx) => {
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
                            पढ़ें <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-center pt-4 font-sans">
                    <button
                      onClick={() => setCurrentPage(2)}
                      className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all cursor-pointer shadow"
                    >
                      प्रथम उपाय से पढ़ना शुरू करें
                    </button>
                  </div>
                </div>
              ) : (
                // Remedy Detail Page
                (() => {
                  const currentRemedy = pages[currentPage - 1] || pages[1];
                  return (
                    <div className="max-w-3xl mx-auto space-y-6 py-4 font-serif">
                      <div className="flex justify-between items-center text-xs font-sans text-stone-600 border-b border-amber-800/20 pb-3">
                        <span className="bg-amber-200/90 text-amber-950 px-3 py-1 rounded-full font-bold">
                          उपाय पृष्ठ {currentPage - 1} / {pages.length}
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
                          {currentRemedy.title}
                        </h2>

                        {currentRemedy.sanskrit && (
                          <div className="bg-amber-100/80 p-5 rounded-2xl border-l-4 border-amber-700 text-amber-950 font-semibold text-base md:text-lg leading-relaxed shadow-sm whitespace-pre-line">
                            <span className="text-xs uppercase font-sans tracking-wide text-amber-800 block mb-1">मंत्र / श्लोक:</span>
                            {currentRemedy.sanskrit}
                          </div>
                        )}

                        <div className="bg-white/80 p-6 rounded-2xl border border-amber-200 shadow-sm space-y-3 font-serif">
                          <h4 className="text-xs uppercase font-sans font-bold tracking-wide text-amber-800">करने की सरल विधि (How to do):</h4>
                          <p className="text-stone-900 text-base md:text-lg leading-relaxed whitespace-pre-line">
                            {currentRemedy.howTo}
                          </p>
                        </div>

                        <div className="bg-emerald-50/80 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-2 font-serif">
                          <h4 className="text-xs uppercase font-sans font-bold tracking-wide text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> चमत्कारी लाभ (Benefits):
                          </h4>
                          <p className="text-emerald-950 text-sm md:text-base leading-relaxed">
                            {currentRemedy.benefit}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Footer Pagination */}
            <div className="bg-[#f5ebd6] border-t border-amber-800/30 px-6 py-4 flex items-center justify-between text-stone-800 font-sans shadow-inner z-10">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage === 0 
                    ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500' 
                    : 'bg-amber-800 hover:bg-amber-900 text-white cursor-pointer shadow'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> पिछला पृष्ठ
              </button>

              <div className="text-xs font-bold text-amber-950">
                पृष्ठ {currentPage} / {pages.length}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
                disabled={currentPage >= pages.length}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentPage >= pages.length 
                    ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500' 
                    : 'bg-amber-800 hover:bg-amber-900 text-white cursor-pointer shadow'
                }`}
              >
                अगला पृष्ठ <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
