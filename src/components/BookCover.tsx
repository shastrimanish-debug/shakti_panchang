import React from 'react';
import { BOOK_PAGES } from '../constants/bookPages';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface BookCoverProps {
  onOpenBook: (targetTabId?: string) => void;
  currentLocationName?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({
  onOpenBook,
  currentLocationName,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto my-4 sm:my-8 px-2 sm:px-4">
      <div className="relative rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(40,10,10,0.6)] border-4 sm:border-8 border-[#B58738] bg-gradient-to-br from-[#4A1010] via-[#5C1414] to-[#340808] p-4 sm:p-8 lg:p-12 text-[#FAF2E4] overflow-hidden">
        {/* Book Spine Simulation */}
        <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-7 bg-gradient-to-r from-[#200505] via-[#380909] to-transparent border-r-2 border-[#B58738]/40 pointer-events-none" />

        {/* Decorative Paper Rim */}
        <div className="absolute right-0 top-3 bottom-3 w-2.5 sm:w-4 bg-repeating-linear-gradient(to right, #F5E6CC, #F5E6CC 1px, #D4BA94 1px, #D4BA94 2px) rounded-r-md opacity-80 pointer-events-none" />

        {/* Corner Ornaments */}
        <div className="absolute top-2 left-2 text-[#E6C687] text-lg sm:text-2xl font-bold select-none pointer-events-none opacity-90">
          ❖
        </div>
        <div className="absolute top-2 right-2 text-[#E6C687] text-lg sm:text-2xl font-bold select-none pointer-events-none opacity-90">
          ❖
        </div>
        <div className="absolute bottom-2 left-2 text-[#E6C687] text-lg sm:text-2xl font-bold select-none pointer-events-none opacity-90">
          ❖
        </div>
        <div className="absolute bottom-2 right-2 text-[#E6C687] text-lg sm:text-2xl font-bold select-none pointer-events-none opacity-90">
          ❖
        </div>

        {/* Inner Border Frame */}
        <div className="border-2 border-[#E6C687]/60 rounded-xl p-4 sm:p-6 lg:p-8 relative backdrop-blur-xs bg-[#2E0707]/30">
          {/* Top Invocations */}
          <div className="text-center pb-4 border-b border-[#E6C687]/30 space-y-1">
            <div className="text-xs sm:text-sm font-granth text-[#FFD88A] tracking-widest uppercase">
              ॥ श्री गणेशाय नमः ॥ श्री सरस्वत्यै नमः ॥ श्री कुलदेवतायै नमः ॥
            </div>
            <div className="text-[11px] sm:text-xs text-[#E6C687]/90 font-serif italic">
              ॥ तिथिर्वारश्च नक्षत्रं योगः करणमेव च । पञ्चाङ्गस्य फलं श्रुत्वा गङ्गास्नानफलं लभेत् ॥
            </div>
          </div>

          {/* Central Emblem & Title */}
          <div className="my-6 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#FFD88A] bg-gradient-to-br from-[#7A1E1E] to-[#3B0A0A] shadow-[0_0_35px_rgba(255,216,138,0.45)] mb-4">
              <span className="text-4xl sm:text-6xl text-[#FFD88A] font-serif font-black drop-shadow-md select-none">
                ॐ
              </span>
              <div className="absolute -top-2 text-[#FFD88A] text-xs">✦</div>
              <div className="absolute -bottom-2 text-[#FFD88A] text-xs">✦</div>
              <div className="absolute -left-2 text-[#FFD88A] text-xs">✦</div>
              <div className="absolute -right-2 text-[#FFD88A] text-xs">✦</div>
            </div>

            <h1 className="font-granth text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFEEC2] via-[#FFD88A] to-[#FFC559] tracking-wider drop-shadow-lg mb-2">
              श्री शक्ति पंचांग
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-[#F4E8D1] font-serif max-w-2xl mx-auto leading-relaxed">
              सम्पूर्ण वैदिक काल-गणना, दैनिक पंचांग, षोडशवर्ग जन्म-कुण्डली एवं निर्णय ग्रन्थ
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-[#FFD88A]">
              <span className="px-3 py-1 bg-[#4A1010] border border-[#B58738]/60 rounded-full font-bold">
                विक्रम संवत् २०८१
              </span>
              <span className="px-3 py-1 bg-[#4A1010] border border-[#B58738]/60 rounded-full font-bold">
                शालिवाहन शके १९४६
              </span>
              <span className="px-3 py-1 bg-[#4A1010] border border-[#B58738]/60 rounded-full font-bold">
                लाहिरी अयनांश (Lahiri)
              </span>
              {currentLocationName && (
                <span className="px-3 py-1 bg-[#3A0B0B] border border-[#B58738]/60 rounded-full font-bold text-[#E6C687]">
                  📍 {currentLocationName}
                </span>
              )}
            </div>
          </div>

          {/* Granth Features & Highlights Box */}
          <div className="bg-[#1F0404]/80 border-2 border-[#E6C687]/70 rounded-xl p-3.5 sm:p-5 my-6 max-w-2xl mx-auto shadow-inner">
            <div className="flex items-center justify-between gap-2 border-b border-[#E6C687]/30 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD88A] fill-[#FFD88A]" />
                <span className="text-xs sm:text-sm font-bold text-[#FFEEC2] font-granth">
                  ॥ श्री शक्ति पञ्चाङ्गम् - प्रमुख ग्रन्थ विभाग ॥
                </span>
              </div>
              <span className="px-2 py-0.5 bg-[#4A1010] text-[#FFD88A] border border-[#FFD88A]/40 rounded text-[10px] font-bold">
                दृक-गणित परिशुद्धता
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
              <div className="bg-[#3D0A0A]/70 p-2.5 rounded border border-[#E6C687]/30 space-y-1">
                <div className="font-bold text-sm text-[#FFD88A]">१. दैनिक पञ्चाङ्ग व मुहूर्त</div>
                <p className="text-[11px] text-[#FAF2E4]/85 leading-relaxed">
                  तिथि, वार, नक्षत्र, योग, करण, सूर्योदय-सूर्यास्त, चौघड़िया, होरा, राहुकाल एवं अभिजित मुहूर्त।
                </p>
              </div>
              <div className="bg-[#3D0A0A]/70 p-2.5 rounded border border-[#E6C687]/30 space-y-1">
                <div className="font-bold text-sm text-[#FFD88A]">२. सम्पूर्ण षोडशवर्ग कुण्डली</div>
                <p className="text-[11px] text-[#FAF2E4]/85 leading-relaxed">
                  लग्न चक्र (D1), नवमांश (D9) से D60 तक समस्त 16 वर्ग चक्र, 120 वर्षीय विंशोत्तरी दशा व उपाय।
                </p>
              </div>
              <div className="bg-[#3D0A0A]/70 p-2.5 rounded border border-[#E6C687]/30 space-y-1">
                <div className="font-bold text-sm text-[#FFD88A]">३. अष्टकूट गुण मिलान</div>
                <p className="text-[11px] text-[#FAF2E4]/85 leading-relaxed">
                  वर-कन्या 36 गुण मिलान, नाड़ी व भकूट दोष परिहार, मांगलिक विचार एवं भोजपत्र मिलान पत्रक।
                </p>
              </div>
              <div className="bg-[#3D0A0A]/70 p-2.5 rounded border border-[#E6C687]/30 space-y-1">
                <div className="font-bold text-sm text-[#FFD88A]">४. उमा एआई व भोजपत्र PDF</div>
                <p className="text-[11px] text-[#FAF2E4]/85 leading-relaxed">
                  सम्पूर्ण 59 पृष्ठीय महा-पत्रिका एवं त्वरित 1-पृष्ठ भोजपत्र जन्मपत्रिका डाउनलोड सुविधा।
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#E6C687]/20 text-[11px] text-[#FFD88A]/90 text-center font-medium">
              ❖ सूर्य सिद्धांत एवं पराशर होरा शास्त्र सम्मत प्रामाणिक वैदिक गणना ❖
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              onClick={() => onOpenBook('panchang')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#C28A32] via-[#E8B85C] to-[#C28A32] hover:from-[#D4993B] hover:to-[#B37825] text-[#2C0A0A] font-black text-base sm:text-lg rounded-xl shadow-[0_0_25px_rgba(232,184,92,0.6)] border-2 border-[#FFE8B3] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-[#2C0A0A]" />
              <span>📖 पञ्चाङ्ग ग्रन्थ खोलें (पन्ना पलटें)</span>
              <ArrowRight className="w-5 h-5 text-[#2C0A0A]" />
            </button>
            <button
              onClick={() => onOpenBook('kundali')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#4A1010] hover:bg-[#5C1414] text-[#FFD88A] font-bold text-sm sm:text-base rounded-xl border-2 border-[#E6C687]/70 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFD88A]" />
              <span>🪐 जन्म पत्रिका बनाएं (Kundali)</span>
            </button>
          </div>

          {/* Table of Contents / Chapters Index */}
          <div className="mt-8 pt-6 border-t border-[#E6C687]/30">
            <div className="text-center text-xs font-bold text-[#E6C687] uppercase tracking-wider mb-3">
              ग्रन्थ सूची एवं प्रमुख अध्याय (Chapters Index)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {BOOK_PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onOpenBook(page.id)}
                  className="p-2 rounded-lg bg-[#3A0B0B]/80 hover:bg-[#521111] border border-[#E6C687]/40 text-center transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="text-[10px] text-[#E6C687] font-serif">पृष्ठ {page.pageNumber}</div>
                  <div className="text-xs font-bold text-[#FAF2E4] truncate">{page.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
