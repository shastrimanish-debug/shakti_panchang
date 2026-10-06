import React, { useState } from 'react';
import { SolarTimes } from '../types';
import { calculateHoraTable, HoraItem } from '../services/horaPanchakYogas';
import { Clock, Sun, Moon, Info, Sparkles, Share2 } from 'lucide-react';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import { useLanguage } from '../i18n';

interface HoraChakraViewProps {
  solar: SolarTimes;
  date: Date;
  locationName?: string;
  onOpenUmaModal?: (query?: string) => void;
}

export const HoraChakraView: React.FC<HoraChakraViewProps> = ({
  solar,
  date,
  locationName = 'उज्जैन',
  onOpenUmaModal,
}) => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<'day' | 'night'>('day');
  const { dayHoras, nightHoras, currentActiveHora } = calculateHoraTable(solar, date);

  const horas = period === 'day' ? dayHoras : nightHoras;

  const locale = language === 'gu' ? 'gu-IN' : language === 'en' ? 'en-US' : 'hi-IN';

  const fmt = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  const getPlanetName = (h: HoraItem) => {
    if (language === 'en') return `${h.planetEnglish} Hora`;
    if (language === 'gu') {
      const guPlanet = h.planet
        .replace('चन्द्र', 'ચંદ્ર')
        .replace('सूर्य', 'સૂર્ય')
        .replace('मंगल', 'મંગળ')
        .replace('बुध', 'બુધ')
        .replace('गुरु', 'ગુરુ')
        .replace('शुक्र', 'શુક્ર')
        .replace('शनि', 'શનિ');
      return `${guPlanet} હોરા`;
    }
    return `${h.planet} होरा`;
  };

  const getHoraWork = (h: HoraItem) => {
    if (language === 'gu') {
      return h.favorableWork
        .replace(/विद्या/g, 'વિદ્યા')
        .replace(/विवाह/g, 'વિવાહ')
        .replace(/पूजा/g, 'પૂજા')
        .replace(/कार्य/g, 'કાર્ય')
        .replace(/यात्रा/g, 'યાત્રા')
        .replace(/व्यापार/g, 'વેપાર')
        .replace(/शांति/g, 'શાંતિ');
    }
    if (language === 'en') {
      if (h.nature === 'auspicious') return 'Auspicious rites, study, trade, new ventures and spiritual pujas';
      if (h.nature === 'strict') return 'Physical labor, caution needed; avoid marriages and journeys';
      return 'Routine official duties, communication and transactions';
    }
    return h.favorableWork;
  };

  const handleShareHora = () => {
    const lines = [
      language === 'en'
        ? `⏳ *Daily Planetary Hora Cycle (24-Hour) • Shakti Panchang*`
        : language === 'gu'
        ? `⏳ *દૈનિક હોરા ચક્ર (૨૪ હોરા કોષ્ટક) • શક્તિ સનાતન પંચાંગ*`
        : `⏳ *दैनिक होरा चक्र (24-Hour Hora Table) • शक्ति सनातन पंचांग*`,
      `${language === 'en' ? 'Date' : language === 'gu' ? 'તારીખ' : 'दिनांक'}: ${date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `${language === 'en' ? 'Place' : language === 'gu' ? 'સ્થાન' : 'स्थान'}: ${locationName}`,
    ];

    if (currentActiveHora) {
      lines.push(``);
      lines.push(`✨ *${language === 'en' ? 'Current Active Hora:' : language === 'gu' ? 'હાલની સક્રિય હોરા:' : 'वर्तमान सक्रिय होरा:'}* ${currentActiveHora.symbol} ${getPlanetName(currentActiveHora)} (${fmt(currentActiveHora.start)} ${language === 'en' ? 'to' : language === 'gu' ? 'થી' : 'से'} ${fmt(currentActiveHora.end)})`);
      lines.push(`• ${language === 'en' ? 'Favorable Activities:' : language === 'gu' ? 'અનુકૂળ કાર્યો:' : 'अनुकूल कार्य:'} ${getHoraWork(currentActiveHora)}`);
    }

    lines.push(``);
    lines.push(`*${period === 'day' ? (language === 'en' ? '12 Day Horas' : language === 'gu' ? 'દિવસની ૧૨ હોરા' : 'दिन की १२ होरा') : (language === 'en' ? '12 Night Horas' : language === 'gu' ? 'રાત્રિની ૧૨ હોરા' : 'रात्रि की १२ होरा')}:*`);
    horas.forEach((h) => {
      const tag = h.nature === 'auspicious' ? (language === 'en' ? 'Shubh' : language === 'gu' ? 'શુભ' : 'शुभ') : h.nature === 'strict' ? (language === 'en' ? 'Varjya' : language === 'gu' ? 'ત્યાજ્ય' : 'त्याज्य') : (language === 'en' ? 'Moderate' : language === 'gu' ? 'મધ્યમ' : 'मध्यम');
      lines.push(`• ${h.symbol} ${getPlanetName(h)}: ${fmt(h.start)} - ${fmt(h.end)} [${tag}]`);
    });

    lines.push(``);
    lines.push(`॥ ${language === 'en' ? 'Om Shubhaye Namah • Shakti Panchang' : language === 'gu' ? 'શુભમ ભવતુ • શક્તિ પંચાંગ' : 'शुभम् भवतु • शक्ति पंचांग'} ॥`);

    const text = lines.join('\n');
    openWhatsAppShare(text);
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {/* Current Active Hora Banner */}
      {currentActiveHora && (
        <div className="bg-gradient-to-r from-[#FFF8E1] to-[#FFE082] border border-[#FFE082] rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{currentActiveHora.symbol}</span>
              <div>
                <span className="text-[10px] font-bold text-[#8C6239] uppercase">
                  {language === 'en' ? 'Currently Active Hora' : language === 'gu' ? 'હાલની સક્રિય હોરા' : 'वर्तमान सक्रिय होरा'}
                </span>
                <div className="text-xs sm:text-sm font-black text-[#5C3A21]">
                  {getPlanetName(currentActiveHora)} ({fmt(currentActiveHora.start)} – {fmt(currentActiveHora.end)})
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#B56A00] text-white animate-pulse">
              {language === 'en' ? 'Active' : language === 'gu' ? 'સક્રિય' : 'सक्रिय'}
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-[#735133] leading-snug">
            <strong className="text-[#5C3A21]">
              {language === 'en' ? 'Favorable Activities: ' : language === 'gu' ? 'અનુકૂળ કાર્યો: ' : 'अनुकूल कार्य: '}
            </strong>
            {getHoraWork(currentActiveHora)}
          </div>
        </div>
      )}

      {/* Day / Night Hora Switcher */}
      <div className="flex items-center justify-between gap-1 bg-[#F4E8D1] border border-[#8C6239]/25 p-1 rounded-xl shadow-2xs">
        <button
          type="button"
          onClick={() => setPeriod('day')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            period === 'day'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>{language === 'en' ? 'Day Hora (12 Horas)' : language === 'gu' ? 'દિવસ હોરા (૧૨ હોરા)' : 'दिन होरा (१२ होरा)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setPeriod('night')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            period === 'night'
              ? 'bg-[#5C3A21] text-white shadow-xs'
              : 'text-[#5C3A21] hover:bg-[#EBDDC1]'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-300" />
          <span>{language === 'en' ? 'Night Hora (12 Horas)' : language === 'gu' ? 'રાત્રિ હોરા (૧૨ હોરા)' : 'रात्रि होरा (१२ होरा)'}</span>
        </button>
      </div>

      {/* Hora List (Grid / Cards) */}
      <div className="space-y-1">
        {horas.map((h) => {
          const isAuspicious = h.nature === 'auspicious';
          const isStrict = h.nature === 'strict';

          return (
            <div
              key={h.number}
              className={`rounded-xl px-2.5 py-1.5 border text-xs transition shadow-2xs flex items-center justify-between ${
                h.isActive
                  ? 'bg-[#FFF9C4] border-[#FBC02D] ring-2 ring-[#FBC02D]/40'
                  : isAuspicious
                  ? 'bg-[#F1F8E9] border-[#C8E6C9]'
                  : isStrict
                  ? 'bg-[#FFEBEE] border-[#FFCDD2]'
                  : 'bg-white border-[#8C6239]/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{h.symbol}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-[#5C3A21]">
                      {getPlanetName(h)}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isAuspicious
                          ? 'bg-[#C8E6C9] text-[#1B5E20]'
                          : isStrict
                          ? 'bg-[#FFCDD2] text-[#B71C1C]'
                          : 'bg-[#FFE082] text-[#B56A00]'
                      }`}
                    >
                      {isAuspicious
                        ? (language === 'en' ? 'Auspicious' : language === 'gu' ? 'શુભ' : 'शुभ')
                        : isStrict
                        ? (language === 'en' ? 'Strict/Avoid' : language === 'gu' ? 'ત્યાજ્ય' : 'कठोर/त्याज्य')
                        : (language === 'en' ? 'Moderate' : language === 'gu' ? 'મધ્યમ' : 'मध्यम')}
                    </span>
                    {h.isActive && (
                      <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded animate-pulse">
                        {language === 'en' ? 'Now' : language === 'gu' ? 'હાલ' : 'अब'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#735133] truncate max-w-[210px] sm:max-w-md">
                    {getHoraWork(h)}
                  </div>
                </div>
              </div>

              <div className="font-mono font-bold text-xs text-[#5C3A21] shrink-0 text-right">
                <div>{fmt(h.start)}</div>
                <div className="text-[10px] opacity-75 text-[#8C6239]">
                  {language === 'en' ? 'to' : language === 'gu' ? 'થી' : 'से'} {fmt(h.end)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Classical Guidance Note */}
      <div className="p-2 bg-[#FAF2E4] border border-[#8C6239]/20 rounded-xl text-[10px] text-[#735133] leading-relaxed">
        <span className="font-bold text-[#5C3A21]">
          {language === 'en' ? 'Scriptural Rule: ' : language === 'gu' ? 'શાસ્ત્રોક્ત નિયમ: ' : 'शास्त्रोक्त नियम: '}
        </span>
        {language === 'en'
          ? '24 planetary Horas occur between sunrise and next sunrise. Jupiter, Venus, Mercury and Moon Horas are most auspicious for starting sacred works. Saturn and Mars Horas are avoided for sacraments.'
          : language === 'gu'
          ? 'સૂર્યોદયથી બીજા સૂર્યોદય સુધી ૨૪ હોરા હોય છે. ગુરુ, શુક્ર, બુધ અને ચંદ્રની હોરા શુભ કાર્યો માટે શ્રેષ્ઠ છે. શનિ અને મંગળની હોરામાં માંગલિક કાર્યો વર્જિત છે.'
          : 'सूर्योदय से लेकर अगले सूर्योदय तक २४ होरा होती हैं। गुरु, शुक्र, बुध एवं चन्द्र की होरा शुभ कार्यों हेतु श्रेष्ठ होती हैं। शनि एवं मंगल की होरा में मांगलिक कार्य वर्जित हैं।'}
      </div>

      {/* Actions: Share & Ask Uma */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          type="button"
          onClick={handleShareHora}
          className="py-1.5 px-3 bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20bd5a] hover:to-[#1aa852] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          title={language === 'en' ? 'Share on WhatsApp' : language === 'gu' ? 'હોરા વોટ્સએપ પર શેર કરો' : 'होरा चक्र व्हाट्सएप पर साझा करें'}
        >
          <Share2 className="w-3.5 h-3.5 text-white" />
          <span>{language === 'en' ? 'Share Hora' : language === 'gu' ? 'હોરા શેર કરો' : 'होरा व्हाट्सएप शेयर'}</span>
        </button>

        {onOpenUmaModal && (
          <button
            type="button"
            onClick={() => onOpenUmaModal(`आज की वर्तमान होरा (${currentActiveHora ? currentActiveHora.planet : 'सक्रिय'} की होरा) में कौन से कार्य करने चाहिए और क्या सावधानी रखें?`)}
            className="py-1.5 px-3 bg-gradient-to-r from-[#B56A00] to-[#8C6239] hover:from-[#9c5a00] hover:to-[#734f2d] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            title={language === 'en' ? 'Consult Uma' : language === 'gu' ? 'ઉમાને પૂછો' : 'उमा से होरा विचार पूछें'}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>{language === 'en' ? 'Consult Uma' : language === 'gu' ? 'ઉમાને હોરા પૂછો' : 'उमा से होरा फल पूछें'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
