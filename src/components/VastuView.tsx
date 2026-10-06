import React, { useState } from 'react';
import {
  VASTU_DIRECTIONS,
  VASTU_ROOM_GUIDES,
  CHAMTKARI_VASTU_TIPS,
  VastuDirection,
  VastuZone,
  ChamtkariVastuTip
} from '../data/vastuData';
import {
  Compass,
  Home,
  Sparkles,
  Flame,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Info,
  ChevronRight,
  Sun,
  Droplets,
  Wind
} from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { DigitalCompass } from './DigitalCompass';
import { useLanguage } from '../i18n';

export const VastuView: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'directions' | 'rooms' | 'tips' | 'compass'>('directions');
  const [selectedDirection, setSelectedDirection] = useState<string>('ishan');
  const [selectedRoom, setSelectedRoom] = useState<string>('main_door');

  const currentDir = VASTU_DIRECTIONS.find((d) => d.id === selectedDirection) || VASTU_DIRECTIONS[0];
  const currentRoom = VASTU_ROOM_GUIDES.find((r) => r.id === selectedRoom) || VASTU_ROOM_GUIDES[0];

  const handleShareTip = (title: string, purpose: string) => {
    const text = `🏡 *${language === 'en' ? 'Vastu Guidance' : language === 'gu' ? 'વાસ્તુ પરામર્શ' : 'वास्तु परामर्श'} - ${title}* 🏡\n\n${language === 'en' ? 'Purpose: ' : language === 'gu' ? 'ઉદ્દેશ્ય: ' : 'उद्देश्य: '}${purpose}\n\n(${language === 'en' ? 'Shakti Panchang' : language === 'gu' ? 'શક્તિ પંચાંગ' : 'सनातन शक्ति पंचांग'})`;
    openWhatsAppShare(text);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#5C3A21] via-[#734F2D] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF2E4]/10 border border-[#FFD88A]/40 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-[#FFD88A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-granth text-[#FFD88A]">
                {language === 'en'
                  ? 'Vedic Vastu Shastra & Miraculous Tips'
                  : language === 'gu'
                  ? 'વૈદિક વાસ્તુ શાસ્ત્ર અને ચમત્કારી ટિપ્સ'
                  : 'वैदिक वास्तु शास्त्र व चमत्कारी टिप्स'}
              </h2>
              <span className="text-[10px] bg-[#B56A00] text-white px-2 py-0.5 rounded-full font-bold">
                {language === 'en' ? 'Vishwakarma Samhita' : language === 'gu' ? 'વિશ્વકર્મા સંહિતા' : 'विश्वकर्मा संहिता'}
              </span>
            </div>
            <p className="text-xs text-[#FAF2E4]/80 mt-0.5">
              {language === 'en'
                ? '8 cardinal directions, five elements, home design principles & remedies without demolition'
                : language === 'gu'
                ? '૮ દિશાઓ, પંચમહાભૂત, ગૃહ નિર્માણના નિયમો અને તોડફોડ વગરના સરળ વાસ્તુ ઉપાયો'
                : '८ दिशाएं, पंचमहाभूत, गृह निर्माण के नियम व बिना तोड़-फोड़ के चमत्कारी वास्तु उपाय'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#8C6239]/20 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('directions')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'directions'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#FFD88A]" />
          <span>{language === 'en' ? '8 Directions & Elements' : language === 'gu' ? '૮ દિશાઓ અને તત્વ' : '८ दिशाएं व तत्व'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-[#FFD88A]" />
          <span>{language === 'en' ? 'Rooms & Main Entrance' : language === 'gu' ? 'ઓરડા અને મુખ્ય દ્વાર' : 'कमरे व मुख्य द्वार'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tips')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'tips'
              ? 'bg-[#B56A00] text-white shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>{language === 'en' ? 'Miraculous Vastu Tips' : language === 'gu' ? 'ચમત્કારી વાસ્તુ ટિપ્સ' : 'चमत्कारी वास्तु टिप्स'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compass')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'compass'
              ? 'bg-[#5C3A21] text-[#FAF2E4] shadow-xs'
              : 'bg-[#F4E8D1] text-[#5C3A21] hover:bg-[#EADBCC]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-300" />
          <span>{language === 'en' ? 'Digital Compass' : language === 'gu' ? 'ડિજિટલ કંપાસ' : 'डिजिटल कम्पास'}</span>
        </button>
      </div>

      {/* 1. DIRECTIONS TAB */}
      {activeTab === 'directions' && (
        <div className="space-y-4">
          {/* 3x3 Grid Matrix of Directions */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/20 shadow-xs">
            <h3 className="text-xs font-bold text-[#8C6239] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>🧭</span>
              <span>{language === 'en' ? 'Vastu Mandala Direction Wheel (Select Direction)' : language === 'gu' ? 'વાસ્તુ મંડળ દિશા ચક્ર (દિશા પસંદ કરો)' : 'वास्तु मंडल दिशा चक्र (दिशा का चयन करें)'}</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {VASTU_DIRECTIONS.map((dir) => {
                const isSelected = selectedDirection === dir.id;
                return (
                  <button
                    key={dir.id}
                    type="button"
                    onClick={() => setSelectedDirection(dir.id)}
                    className={`p-2.5 rounded-xl border transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#5C3A21] text-[#FFD88A] border-[#B56A00] shadow-sm scale-102'
                        : 'bg-white text-[#5C3A21] border-[#8C6239]/20 hover:bg-[#F4E8D1]'
                    }`}
                  >
                    <span className="font-bold font-granth text-xs sm:text-sm">
                      {language === 'en' ? dir.name : dir.hindiName.split(' ')[0]}
                    </span>
                    <span className="text-[10px] opacity-80">{dir.ruler.split('/')[0]}</span>
                    <span className="text-[9px] px-1 rounded bg-[#B56A00]/20 text-[#B56A00]">
                      {dir.element}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Direction Details */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#8C6239]/20 gap-2">
              <div>
                <span className="text-[11px] font-bold text-[#B56A00] tracking-wider uppercase">
                  {language === 'en' ? 'Element: ' : language === 'gu' ? 'તત્વ: ' : 'तत्व: '}{currentDir.element} • {language === 'en' ? 'Ruler: ' : language === 'gu' ? 'સ્વામી ગ્રહ: ' : 'स्वामी ग्रह: '}{currentDir.planet}
                </span>
                <h3 className="text-lg font-bold font-granth text-[#5C3A21]">
                  {currentDir.hindiName} ({currentDir.name})
                </h3>
                <p className="text-xs text-[#735133] mt-0.5">
                  {language === 'en' ? 'Presiding Deity: ' : language === 'gu' ? 'અધિપતિ દેવતા: ' : 'अधिपति देवता: '}<strong className="text-[#5C3A21]">{currentDir.ruler}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {language === 'en' ? 'Color: ' : language === 'gu' ? 'શુભ રંગ: ' : 'शुभ रंग: '}{currentDir.color}
                </span>
              </div>
            </div>

            {/* Ideal for vs Avoid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'en' ? 'Recommended Construction (Auspicious)' : language === 'gu' ? 'આ દિશામાં શું હોવું જોઈએ (શુભ નિર્માણ)' : 'इस दिशा में क्या होना चाहिए (शुभ निर्माण)'}</span>
                </h4>
                <ul className="space-y-1 text-emerald-800 list-disc list-inside">
                  {currentDir.idealFor.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>{language === 'en' ? 'Strictly Avoid (Inauspicious)' : language === 'gu' ? 'શું ક્યારેય ન બનાવવું (વર્જિત નિર્માણ)' : 'क्या कदापि न बनाएं (वर्जित निर्माण)'}</span>
                </h4>
                <ul className="space-y-1 text-rose-800 list-disc list-inside">
                  {currentDir.avoid.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Direction Remedy */}
            <div className="p-3.5 rounded-xl bg-[#FBF0DD] border border-[#B56A00]/30 space-y-1 text-xs">
              <h4 className="font-bold text-[#5C3A21] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>{language === 'en' ? 'Vastu Remedy for this Direction' : language === 'gu' ? 'આ દિશાનો દોષ નિવારક ઉપાય' : 'इस दिशा का दोष निवारक उपाय'}</span>
              </h4>
              <p className="text-[#735133] leading-relaxed">{currentDir.remedy}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ROOM GUIDES TAB */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          {/* Room Horizontal Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {VASTU_ROOM_GUIDES.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoom(room.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedRoom === room.id
                    ? 'bg-[#B56A00] text-white shadow-xs'
                    : 'bg-[#FAF2E4] text-[#5C3A21] border border-[#8C6239]/20 hover:bg-[#F4E8D1]'
                }`}
              >
                {room.title.split('(')[0]}
              </button>
            ))}
          </div>

          {/* Active Room Detail Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-4">
            <div className="pb-3 border-b border-[#8C6239]/20">
              <span className="text-[11px] font-bold text-[#B56A00] tracking-wider uppercase">
                {language === 'en' ? 'Best Direction: ' : language === 'gu' ? 'સર્વોત્તમ દિશા: ' : 'सर्वोत्तम दिशा: '}{currentRoom.bestDirection}
              </span>
              <h3 className="text-lg font-bold font-granth text-[#5C3A21] mt-0.5">
                {currentRoom.title}
              </h3>
              <p className="text-xs text-[#735133] mt-1">{currentRoom.importance}</p>
            </div>

            {/* Rules */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[#8C6239] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>{language === 'en' ? 'Key Vastu Rules & Alignment' : language === 'gu' ? 'મહત્વપૂર્ણ વાસ્તુ નિયમો અને વ્યવસ્થા' : 'महत्वपूर्ण वास्तु नियम व व्यवस्था'}</span>
              </h4>
              <ul className="space-y-1.5 text-[#3E2714] list-disc list-inside bg-white p-3.5 rounded-xl border border-[#8C6239]/15">
                {currentRoom.rules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dosha & Consequence */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>{language === 'en' ? 'Adverse Effects of Defect:' : language === 'gu' ? 'દોષ હોવા પર શી આડઅસર થાય?' : 'दोष होने पर क्या दुष्प्रभाव होता है?'}</span>
              </h4>
              <p className="text-amber-800 leading-relaxed">{currentRoom.doshaConsequence}</p>
            </div>

            {/* Remedy without demolition */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FBF0DD] to-[#F4E8D1] border border-[#B56A00]/30 text-xs space-y-1.5">
              <h4 className="font-bold text-[#5C3A21] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B56A00]" />
                <span>{language === 'en' ? 'Remedies without Demolition' : language === 'gu' ? 'તોડફોડ વગરના ચમત્કારી ઉપાયો' : 'बिना तोड़-फोड़ के चमत्कारी उपाय'}</span>
              </h4>
              <p className="text-[#735133] leading-relaxed">
                {currentRoom.remedyWithoutDemolition}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHAMTKARI VASTU TIPS TAB */}
      {activeTab === 'tips' && (
        <div className="space-y-3">
          {CHAMTKARI_VASTU_TIPS.map((tip) => (
            <div
              key={tip.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E4] border border-[#8C6239]/25 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#8C6239]/15">
                <div>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B56A00]" />
                    <span>{tip.title}</span>
                  </h3>
                  <p className="text-xs text-[#735133] mt-0.5">{tip.purpose}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleShareTip(tip.title, tip.purpose)}
                  className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs cursor-pointer shrink-0"
                  title="व्हाट्सएप पर शेयर करें"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white/70 border border-[#8C6239]/15">
                  <span className="font-bold text-[#8C6239]">आवश्यक सामग्री: </span>
                  <span className="text-[#3E2714]">{tip.materials}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/70 border border-[#8C6239]/15">
                  <span className="font-bold text-[#8C6239]">शुभ समय / वार: </span>
                  <span className="text-[#3E2714]">{tip.bestTime}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-[#5C3A21]">उपाय की संपूर्ण विधि:</span>
                <ol className="space-y-1 list-decimal list-inside text-[#3E2714] bg-white p-3 rounded-xl border border-[#8C6239]/15 leading-relaxed">
                  {tip.method.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. DIGITAL COMPASS TAB */}
      {activeTab === 'compass' && (
        <div className="space-y-4">
          <div className="p-3 bg-[#FAF2E4] rounded-xl border border-[#8C6239]/20 text-xs text-[#735133] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#B56A00] shrink-0" />
            <span>
              मोबाइल को समतल (Flat) रखकर घर के केंद्र (ब्रह्मस्थान) में खड़े हों और वास्तु दिशाओं का सटीक परीक्षण करें।
            </span>
          </div>
          <DigitalCompass shoolDirectionName="पूर्व" />
        </div>
      )}
    </div>
  );
};
