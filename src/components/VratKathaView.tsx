import React, { useState } from 'react';
import { BookOpen, Clock, ChevronRight, ChevronLeft, X, Sparkles, Bookmark, FileText } from 'lucide-react';
import { vratKathaList, VratKatha } from '../data/vratKathaData';

export const VratKathaView: React.FC = () => {
  const [selectedVrat, setSelectedVrat] = useState<VratKatha | null>(null);
  const [currentPage, setCurrentPage] = useState<'cover' | 'index' | number>('cover');

  // Helper to generate chapters/pages for the selected Vrat
  const getBookPages = (vrat: VratKatha) => {
    if (vrat.id === 'durga-saptashati') {
      return [
        {
          title: 'विषय-सूची (Index / अनुक्रमणिका)',
          type: 'index',
          content: [
            { page: 1, name: 'मुखपृष्ठ (Cover Page)' },
            { page: 2, name: 'संकल्प, विनियोग व ध्यानम्' },
            { page: 3, name: 'अर्गला, कीलक व कवच स्तोत्रम्' },
            { page: 4, name: 'अध्याय १: मधुकैटभ वध' },
            { page: 5, name: 'अध्याय २, ३ व ४: महिषासुर वध एवं स्तुति' },
            { page: 6, name: 'अध्याय ५ व ६: चण्ड-मुण्ड वध' },
            { page: 7, name: 'अध्याय ७ व ८: रक्तबीज वध' },
            { page: 8, name: 'अध्याय ९ व १०: सेनापति संहार' },
            { page: 9, name: 'अध्याय ११: नारायणी स्तुति' },
            { page: 10, name: 'अध्याय १२ व १३: फलश्रुति एवं वरदान' },
            { page: 11, name: 'श्री महादुर्गा आरती' }
          ]
        },
        {
          title: 'संकल्प, विनियोग व ध्यानम्',
          type: 'chapter',
          sanskrit: `ॐ अस्य श्रीचण्डीचरित्रस्य ब्रह्मा ऋषिः, महासकलगायत्री छन्दः, महाकाली-महालक्ष्मी-महासरस्वती देवताः, नन्दा शक्तिः, रक्तदन्तिका बीजम्, अग्निस्तत्त्वम्, रक्तदन्तिका साम्यम्, श्रीमहादुर्गाप्रीत्यर्थे सप्तशतीपाठे विनियोगः।\n\nध्यायेत् सिंहस्थितां द्विभुजां त्रिनेत्रामरविन्दसंस्थितां महादुर्गाम्।`,
          hindi: 'विनियोग एवं ध्यान: माँ महादुर्गा का स्मरण करते हुए सभी विघ્नों के नाश हेतु पवित्र मन से पाठ का संकल्प लें।'
        },
        {
          title: 'अर्गला, कीलक व कवच स्तोत्रम्',
          type: 'chapter',
          sanskrit: `ॐ नमश्चण्डिकायै।\nजय त्वं देवि चामुण्डे जय भूतार्तिहारिणि। जय सर्वगते देवि कालरात्रि नमोऽस्तु ते॥\nरूपं देहि जयं देहि यशो देहि द्विषो जहि॥\n\nकीलकम्:\nॐ विशुद्धज्ञानदेहाय त्रिवेदीदिव्यचक्षुषे। श्रेयःप्राप्तिनिमित्ताय नमः कीलकनाशिने॥`,
          hindi: 'अर्गला और कीलक स्तोत्र: माँ चंडिका के चरणों में रूप, यश, बल और ज्ञान की प्राप्ति के लिए प्रार्थना।'
        },
        {
          title: 'अध्याय १: मधुकैटभ वध',
          type: 'chapter',
          sanskrit: `मधुकैटभप्रधंसनम् - मेधा ऋषि द्वारा सुरथ राजा और समाधि वैश्य को महामाया की कथा का उपदेश।`,
          hindi: 'महाप्रलय काल में भगवान विष्णु के कर्णसुमल से उत्पन्न हुए महापराक्रमी असुर मधु और कैटभ ने ब्रह्मा जी को भयभीत किया। तब ब्रह्मा जी ने योगनिद्रा की स्तुति की। महामाया के प्रसन्न होने पर भगवान विष्णु ने दोनों असुरों का वध किया।'
        },
        {
          title: 'अध्याय २, ३ व ४: महिषासुर वध एवं स्तुति',
          type: 'chapter',
          sanskrit: `महिषासुरसेनानीवधः तथा महिषासुरवधः - "या देवी सर्वभूतेषु बुद्धिरूपेण संस्थिता..."`,
          hindi: 'देवताओं और दानवों के युद्ध में महिषासुर ने देवताओं को परास्त किया। तब सभी देवताओं के तेजोमय प्रकाश से महातेजस्वी भगवती दुर्गा प्रकट हुईं। देवी ने चिक्षुर, चामर और अंततः महाबली महिषासुर का संहार किया। देवताओं ने "या देवी सर्वभूतेषु..." मंत्र से स्तुति की।'
        },
        {
          title: 'अध्याय ५ व ६: चण्ड-मुण्ड वध',
          type: 'chapter',
          sanskrit: `शुंभ-निःशुंभ के दूत प्रेषण तथा चण्ड-मुण्ड वधम्।`,
          hindi: 'शुंभ और निःशुंभ के शासन में असुरों ने स्वर्ग पर अधिकार किया। देवी के रूप पर मोहित होकर शुंभ ने दूत भेजे। दूत के अपमान पर चण्ड और मुण्ड सेना लेकर आए। माँ काली ने विकराल रूप धारण कर चण्ड और मुण्ड का वध किया, जिससे उनका नाम "चामुंडा" पड़ा।'
        },
        {
          title: 'अध्याय ७ व ८: रक्तबीज वध',
          type: 'chapter',
          sanskrit: `रक्तबीजवधः - यावन्तः पतितो भूमौ रक्तबिन्दवो जनाः...`,
          hindi: 'रक्तबीज नामक असुर को वरदान था कि उसके रक्त की बूंद पृथ्वी पर गिरते ही उसी के समान हजारों नए राक्षस उत्पन्न हो जाएंगे। माता काली ने अपने विकराल मुख और जिह्वा से उसका सारा रक्तपान कर लिया और उसका वध किया।'
        },
        {
          title: 'अध्याय ९ व १०: सेनापति संहार',
          type: 'chapter',
          sanskrit: `निशुंभ-शुंभ सेनापतिसंहारः।`,
          hindi: 'शुंभ और निःशुंभ के सेनापति धूम्रलोचन और अन्य महाबली राक्षसों का महासंग्राम में भगवती द्वारा संहार किया गया।'
        },
        {
          title: 'अध्याय ११: नारायणी स्तुति',
          type: 'chapter',
          sanskrit: `सर्वाबाधाप्रशमनं त्रैलोक्यस्याखिलेश्वरी। एवमेव त्वया कार्यमस्मद्वैरिनाशनम्॥`,
          hindi: 'समस्त देवताओं ने हाथ जोड़कर नारायणी स्तुति की - हे जगदम्बे! तीनों लोकों की समस्त बाधाओं को शांत करो और हमारे शत्रुओं का नाश करो।'
        },
        {
          title: 'अध्याय १२ व १३: फलश्रुति एवं वरदान',
          type: 'chapter',
          sanskrit: `फलश्रुतिः तथा सुरथ-समाधिसवरप्रदानम्।`,
          hindi: 'सप्तशती पाठ के महापुण्य का वर्णन। राजा सुरथ और समाधि वैश्य ने जंगल में देवी की आराधना की। माता ने प्रसन्न होकर राजा सुरथ को अखंड राज्य और समाधि वैश्य को ब्रह्मज्ञान का वरदान दिया।'
        },
        {
          title: 'श्री महादुर्गा आरती',
          type: 'chapter',
          sanskrit: `अम्बिके अनादिशक्ति चण्डिके प्रसीद मे। जय त्वं देवि चामुण्डे जय भूतार्तिहारिणि॥`,
          hindi: 'आरती: जय अम्बे गौरी मैया जय श्यामा गौरी। तुम को निश दिन ध्यावत हरि ब्रह्मा शिव जी। मांग सिंदूर विराजत टीको मृगमद को। उज्ज्वल से दोउ नैना चंद्रവദन नीको।'
        }
      ];
    } else {
      // Standard Vrat Katha pages
      return [
        {
          title: 'विषय-सूची (Index / अनुक्रमणिका)',
          type: 'index',
          content: [
            { page: 1, name: 'मुखपृष्ठ (Cover Page)' },
            { page: 2, name: 'व्रत का महत्व एवं महिमा' },
            { page: 3, name: 'पूजन विधि एवं सामग्री' },
            { page: 4, name: 'पौराणिक कथा' },
            { page: 5, name: 'आरती एवं पुष्पांजलि' }
          ]
        },
        {
          title: 'व्रत का महत्व एवं महिमा',
          type: 'chapter',
          sanskrit: `सत्यं ज्ञानं अनन्तं ब्रह्म। व्रतानां उत्तमं व्रतम ्।`,
          hindi: vrat.significance
        },
        {
          title: 'पूजन विधि एवं सामग्री',
          type: 'chapter',
          sanskrit: `शुचिर्भूत्वा शुचिः स्नात्वा पूजां कुर्याद् यथाविधि।`,
          hindi: vrat.vidhi
        },
        {
          title: 'पौराणिक कथा',
          type: 'chapter',
          sanskrit: `इतिहासः पुरातनः कथा पवित्रता दायिनी।`,
          hindi: vrat.katha
        },
        {
          title: 'आरती एवं पुष्पांजलि',
          type: 'chapter',
          sanskrit: `आरती श्री भगवान की...`,
          hindi: vrat.aarti
        }
      ];
    }
  };

  const [activePageIndex, setActivePageIndex] = useState<number>(0); // 0 = Cover, 1 = Index, 2+ = Chapters

  const openBook = (vrat: VratKatha) => {
    setSelectedVrat(vrat);
    setActivePageIndex(0); // Start at Cover
  };

  const pages = selectedVrat ? getBookPages(selectedVrat) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-600" /> संपूर्ण व्रत कथा संग्रह & पवित्र ग्रंथ (Book Reader)
        </h2>
        <p className="text-sm text-stone-600 mt-1">सनातन धर्म के सभी प्रमुख व्रतों, उपवासों और दुर्गा सप्तशती का डिजिटल पवित्र ग्रंथ - स्पष्ट अक्षरों और विषय-सूची के साथ।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vratKathaList.map((vrat) => (
          <div key={vrat.id} className="bg-white rounded-2xl p-6 shadow-md border border-amber-200/80 flex flex-col justify-between hover:shadow-xl transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">{vrat.deity}</span>
                <span className="text-xs text-stone-500 flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-amber-600" /> {vrat.tithi}</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{vrat.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">{vrat.description}</p>
            </div>
            <button
              onClick={() => openBook(vrat)}
              className="self-start flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> ग्रंथ खोलें (Open Book) <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Book Reader Modal */}
      {selectedVrat && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-[#fcf8ec] rounded-3xl max-w-4xl w-full h-[92vh] flex flex-col shadow-2xl border-4 border-amber-700/60 relative overflow-hidden">
            
            {/* Book Header Toolbar */}
            <div className="bg-gradient-to-r from-amber-800 via-orange-700 to-amber-900 text-amber-50 px-6 py-4 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/40 flex items-center justify-center border border-amber-400/50">
                  <BookOpen className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base md:text-lg tracking-wide text-white">{selectedVrat.title}</h3>
                  <p className="text-xs text-amber-200/90 font-medium">दिव्य सनातन ग्रंथ • पठन मोड</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePageIndex(1)}
                  className="bg-amber-600/80 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" /> विषय-सूची (Index)
                </button>
                <button 
                  onClick={() => setSelectedVrat(null)}
                  className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Book Body - High Readability Manuscript Style */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 text-[#2c1810] font-serif selection:bg-amber-200">
              {activePageIndex === 0 ? (
                // Cover Page
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
                  <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-600/40 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-12 h-12 text-amber-700 animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-xl">
                    <span className="text-xs uppercase tracking-widest bg-amber-200/70 text-amber-900 px-3 py-1 rounded-full font-bold">
                      पवित्र सनातन ग्रंथ • {selectedVrat.deity}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-amber-950 tracking-tight leading-tight">
                      {selectedVrat.title}
                    </h1>
                    <p className="text-sm md:text-base text-stone-700 pt-2 leading-relaxed">
                      {selectedVrat.description}
                    </p>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setActivePageIndex(1)}
                      className="bg-amber-800 hover:bg-amber-900 text-white font-sans font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-amber-300" /> विषय-सूची (Index देखें)
                    </button>
                    <button
                      onClick={() => setActivePageIndex(2)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      पढ़ना शुरू करें (Start Reading) <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : activePageIndex === 1 ? (
                // Index / अनुक्रमणिका Page
                <div className="max-w-2xl mx-auto space-y-6 py-4">
                  <div className="border-b-2 border-amber-800/30 pb-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-amber-950">विषय-सूची (Index / अनुक्रमणिका)</h2>
                    <p className="text-xs text-stone-600 mt-1 font-sans">किसी भी अध्याय या पृष्ठ पर जाने के लिए नीचे क्लिक करें</p>
                  </div>
                  
                  <div className="grid gap-3 font-sans">
                    {pages.map((p, idx) => {
                      if (idx === 0) return null; // skip cover
                      return (
                        <button
                          key={idx}
                          onClick={() => setActivePageIndex(idx + 1)}
                          className="w-full text-left bg-white/80 hover:bg-amber-100/80 p-4 rounded-2xl border border-amber-300 shadow-sm flex items-center justify-between transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">
                              {idx}
                            </span>
                            <span className="font-bold text-stone-900 group-hover:text-amber-900 text-sm md:text-base">
                              {p.title}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                            पढ़ें <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => setActivePageIndex(2)}
                      className="bg-amber-800 hover:bg-amber-900 text-white font-sans font-bold px-6 py-3 rounded-xl text-xs transition-all cursor-pointer shadow"
                    >
                      प्रथम पृष्ठ से पढ़ना शुरू करें
                    </button>
                  </div>
                </div>
              ) : (
                // Chapter / Content Page
                (() => {
                  const currentChapter = pages[activePageIndex - 1] || pages[1];
                  return (
                    <div className="max-w-3xl mx-auto space-y-6 py-4 font-serif">
                      <div className="flex justify-between items-center text-xs font-sans text-stone-600 border-b border-amber-800/20 pb-3">
                        <span className="bg-amber-200/80 text-amber-950 px-3 py-1 rounded-full font-bold">
                          अध्याय / पृष्ठ {activePageIndex - 1} / {pages.length}
                        </span>
                        <button
                          onClick={() => setActivePageIndex(1)}
                          className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" /> विषय-सूची पर लौटें
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-950 leading-tight">
                          {currentChapter.title}
                        </h2>

                        {currentChapter.sanskrit && (
                          <div className="bg-amber-100/70 p-5 rounded-2xl border-l-4 border-amber-700 text-amber-950 font-semibold text-base md:text-lg leading-relaxed shadow-sm whitespace-pre-line">
                            <span className="text-xs uppercase font-sans tracking-wide text-amber-800 block mb-1">संस्कृत श्लोक / मंत्र:</span>
                            {currentChapter.sanskrit}
                          </div>
                        )}

                        <div className="text-stone-900 text-base md:text-lg leading-relaxed whitespace-pre-line pt-2 font-serif bg-white/60 p-6 rounded-2xl border border-amber-200/50 shadow-sm">
                          <span className="text-xs uppercase font-sans font-bold tracking-wide text-amber-800 block mb-2">हिंदी अनुवाद / कथा विवरण:</span>
                          {currentChapter.hindi}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Book Footer Pagination Bar */}
            <div className="bg-[#f5ebd6] border-t border-amber-800/30 px-6 py-4 flex items-center justify-between text-stone-800 font-sans shadow-inner z-10">
              <button
                onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
                disabled={activePageIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePageIndex === 0 
                    ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500' 
                    : 'bg-amber-700 hover:bg-amber-800 text-white cursor-pointer shadow'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> पिछला पृष्ठ (Previous)
              </button>

              <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <span>पृष्ठ {activePageIndex} / {pages.length}</span>
                <span className="hidden sm:inline text-stone-500">• (पुस्तक वाचन मोड)</span>
              </div>

              <button
                onClick={() => setActivePageIndex(Math.min(pages.length, activePageIndex + 1))}
                disabled={activePageIndex >= pages.length}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePageIndex >= pages.length 
                    ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500' 
                    : 'bg-amber-700 hover:bg-amber-800 text-white cursor-pointer shadow'
                }`}
              >
                अगला पृष्ठ (Next) <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
