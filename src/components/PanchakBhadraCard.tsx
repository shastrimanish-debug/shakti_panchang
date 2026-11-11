import React from 'react';
import { PanchakStatus, BhadraStatus } from '../services/horaPanchakYogas';
import { ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Compass } from 'lucide-react';
import { useLanguage } from '../i18n';

interface PanchakBhadraCardProps {
  panchak: PanchakStatus;
  bhadra: BhadraStatus;
}

export const PanchakBhadraCard: React.FC<PanchakBhadraCardProps> = ({ panchak, bhadra }) => {
  const { language } = useLanguage();

  const getPanchakTypeName = () => {
    if (!panchak.isActive) {
      return language === 'en' ? 'No Panchak (Normal)' : language === 'gu' ? 'પંચક મુક્ત (સામાન્ય)' : 'पञ्चक रहित (सामान्य)';
    }
    if (language === 'gu') {
      const guMap: Record<string, string> = {
        'रोग पञ्चक': 'રોગ પંચક',
        'अग्नि पञ्चक': 'અગ્નિ પંચક',
        'नृप/राज पञ्चक': 'રાજ પંચક',
        'चोर पञ्चक': 'ચોર પંચક',
        'मृत्यु पञ्चક': 'મૃત્યુ પંચક',
        'शुभ/अमृत पञ्चક': 'શુભ/અમૃત પંચક',
        'सामान्य पञ्चક': 'સામાન્ય પંચક',
      };
      return guMap[panchak.typeNameHindi] || panchak.typeNameHindi.replace('पञ्चक', 'પંચક');
    }
    if (language === 'en') {
      const enMap: Record<string, string> = {
        'रोग पञ्चक': 'Roga Panchak',
        'अग्नि पञ्चक': 'Agni Panchak',
        'नृप/राज पञ्चक': 'Raj Panchak',
        'चोर पञ्चक': 'Chor Panchak',
        'मृत्यु पञ्चक': 'Mrityu Panchak',
        'शुभ/अमृत पञ्चक': 'Shubh/Amrit Panchak',
        'सामान्य पञ्चक': 'General Panchak',
      };
      return enMap[panchak.typeNameHindi] || panchak.type + ' Panchak';
    }
    return panchak.typeNameHindi;
  };

  const getPanchakDescription = () => {
    if (!panchak.isActive) {
      if (language === 'en') return 'Moon is currently in an auspicious constellation. Regular daily activities, journeys, and constructions are permitted.';
      if (language === 'gu') return 'ચંદ્ર હાલ પંચક નક્ષત્રોમાં નથી. દૈનિક કાર્યો, યાત્રા તથા બાંધકામ નિર્વિઘ્ન કરી શકાય છે.';
      return panchak.description;
    }
    if (language === 'gu') {
      return panchak.description
        .replace(/पञ्चक/g, 'પંચક')
        .replace(/है/g, 'છે')
        .replace(/नक्षत्र/g, 'નક્ષત્ર')
        .replace(/कहा जाता है/g, 'કહેવાય છે');
    }
    return panchak.description;
  };

  const getForbiddenActs = () => {
    if (language === 'gu') {
      return [
        '૧. દક્ષિણ દિશામાં યાત્રા કરવી વર્જિત છે.',
        '૨. ઘરની છત (ધાબું) ભરવું કે છત બાંધવી વર્જિત.',
        '૩. ખાટલો કે પલંગ વણવો / ખરીદવો નિષેધ.',
        '૪. ઘાસ, લાકડું કે ઇંધણનો મોટો સંગ્રહ કરવો વર્જિત.',
        '૫. પંચકમાં અંતિમ સંસ્કાર વખતે શાસ્ત્રોક્ત શાંતિ વિધિ કરવી.',
      ];
    }
    if (language === 'en') {
      return [
        '1. Southward travel is strictly prohibited.',
        '2. Laying roof or ceiling construction prohibited.',
        '3. Buying or weaving cots/beds is forbidden.',
        '4. Hoarding large piles of dry grass or timber.',
        '5. Special scriptural peace rituals required for last rites.',
      ];
    }
    return panchak.forbiddenActs;
  };

  const getBhadraVasDisplay = () => {
    if (language === 'gu') {
      return bhadra.vasEnglish === 'heaven' ? 'સ્વર્ગલોક' : bhadra.vasEnglish === 'netherworld' ? 'પાતાળલોક' : bhadra.vasEnglish === 'earth' ? 'પૃથ્વીલોક (મૃત્યુલોક)' : 'અનુપસ્થિત';
    }
    if (language === 'en') {
      return bhadra.vasEnglish === 'heaven' ? 'Heaven (Swarga)' : bhadra.vasEnglish === 'netherworld' ? 'Netherworld (Patala)' : bhadra.vasEnglish === 'earth' ? 'Earth (Prithvi)' : 'Absent';
    }
    return bhadra.vas;
  };

  const getBhadraBadge = () => {
    if (!bhadra.isActive) {
      return language === 'en' ? 'Bhadra Free' : language === 'gu' ? 'ભદ્રા મુક્ત' : 'भद्रा मुक्त';
    }
    if (language === 'gu') {
      return `${bhadra.vasEnglish === 'heaven' ? 'સ્વર્ગ' : bhadra.vasEnglish === 'netherworld' ? 'પાતાળ' : 'પૃથ્વી'} ભદ્રા`;
    }
    if (language === 'en') {
      return `${bhadra.vasEnglish === 'heaven' ? 'Heaven' : bhadra.vasEnglish === 'netherworld' ? 'Nether' : 'Earth'} Bhadra`;
    }
    return `${bhadra.vas} भद्रा`;
  };

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150">
      {/* 1. Panchak Card */}
      <div
        className={`border rounded-xl p-3 shadow-2xs space-y-2 ${
          panchak.isActive
            ? panchak.nature === 'auspicious'
              ? 'bg-[#F1F8E9] border-[#C8E6C9]'
              : 'bg-[#FFF8E1] border-[#FFE082]'
            : 'bg-white border-[#8C6239]/20'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">⚡</span>
            <div>
              <span className="text-xs font-black text-[#5C3A21]">
                {language === 'en' ? 'Panchak Analysis' : language === 'gu' ? 'પંચક વિચાર' : 'पञ्चक विचार'}
              </span>
              <span className="text-[10px] text-[#8C6239] ml-1.5 font-bold">
                ({panchak.rashi} • {panchak.nakshatra})
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
              panchak.isActive
                ? panchak.nature === 'auspicious'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-amber-700 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {getPanchakTypeName()}
          </span>
        </div>

        <div className="text-xs text-[#5C3A21] leading-relaxed">
          {getPanchakDescription()}
        </div>

        {panchak.isActive && (
          <div className="bg-white/80 border border-[#8C6239]/20 rounded-lg p-2 space-y-1">
            <div className="text-[10px] font-bold text-[#B71C1C] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-[#B71C1C]" />
              <span>
                {language === 'en' 
                  ? '5 Scripturally Prohibited Activities in Panchak:' 
                  : language === 'gu' 
                  ? 'પંચકમાં શાસ્ત્રોક્ત ૫ વર્જિત કાર્યો:' 
                  : 'पञ्चक में शास्त्रोक्त ५ वर्जित कार्य:'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-[#735133]">
              {getForbiddenActs().map((act, i) => (
                <div key={i} className="leading-snug">
                  {act}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Bhadra Card */}
      <div
        className={`border rounded-xl p-3 shadow-2xs space-y-2 ${
          bhadra.isActive
            ? bhadra.nature === 'varjya'
              ? 'bg-[#FFEBEE] border-[#FFCDD2]'
              : 'bg-[#E8F5E9] border-[#C8E6C9]'
            : 'bg-white border-[#8C6239]/20'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🛡️</span>
            <div>
              <span className="text-xs font-black text-[#5C3A21]">
                {language === 'en' ? 'Bhadra Analysis (Vishti Karana)' : language === 'gu' ? 'ભદ્રા વિચાર (વિષ્ટિ કરણ)' : 'भद्रा विचार (विष्टि करण)'}
              </span>
              <span className="text-[10px] text-[#8C6239] ml-1.5 font-bold">
                {language === 'en' ? 'Residence: ' : language === 'gu' ? 'વાસ: ' : 'वास: '}
                {getBhadraVasDisplay()}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
              bhadra.isActive
                ? bhadra.nature === 'varjya'
                  ? 'bg-rose-700 text-white'
                  : 'bg-emerald-700 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {getBhadraBadge()}
          </span>
        </div>

        <div className="text-xs text-[#5C3A21] leading-relaxed">
          {bhadra.isActive
            ? bhadra.nature === 'varjya'
              ? (language === 'en'
                  ? 'Bhadra resides on Earth (Prithvi Loka). Auspicious ceremonies, journeys, weddings, and investments should be avoided.'
                  : language === 'gu'
                  ? 'ભદ્રા પૃથ્વીલોકમાં વાસ કરે છે. શુભ માંગલિક કાર્યો, યાત્રા અને ગૃહપ્રવેશ આ સમયમાં વર્જિત છે.'
                  : bhadra.impactDescription)
              : (language === 'en'
                  ? `Bhadra resides in ${getBhadraVasDisplay()}. According to Muhurat scriptures, Bhadra in Heaven brings auspiciousness and in the Netherworld brings prosperity.`
                  : language === 'gu'
                  ? `ભદ્રા ${getBhadraVasDisplay()}માં વાસ કરે છે. મુહૂર્ત શાસ્ત્ર અનુસાર સ્વર્ગ કે પાતાળની ભદ્રા પૃથ્વીવાસીઓ માટે શુભ ફળદાયી માનવામાં આવે છે.`
                  : bhadra.impactDescription)
            : (language === 'en'
                ? 'No Bhadra currently active. All auspicious activities and rituals can proceed without hindrance.'
                : language === 'gu'
                ? 'હાલ કોઈ ભદ્રા નથી. તમામ શુભ કાર્યો અને સંસ્કારો નિર્વિઘ્ન કરી શકાય છે.'
                : 'वर्तमान में भद्रा नहीं है। सर्व कार्य निर्विघ्न संपन्न हो सकते हैं।')}
        </div>

        <div className="p-2 bg-white/80 border border-[#8C6239]/20 rounded-lg text-xs leading-relaxed text-[#735133]">
          <strong className="text-[#5C3A21]">
            {language === 'en' ? 'Scriptural Fruit: ' : language === 'gu' ? 'શાસ્ત્રીય ફળ: ' : 'शास्त्रीय फल: '}
          </strong>
          {language === 'en'
            ? bhadra.nature === 'varjya'
              ? 'Strictly avoid starting new businesses, house warmings, and travels during Bhadra.'
              : 'Beneficial for peaceful daily duties; no malefic impact on earth.'
            : language === 'gu'
            ? bhadra.nature === 'varjya'
              ? 'શુભ માંગલિક કાર્યો ટાળો; શિવ પૂજા, ગણેશ પૂજા કે મંત્ર જાપ અત્યંત ફળદાયી છે.'
              : 'શુભ કાર્યો માટે અનુકૂળ; પૃથ્વી પર કોઈ અશુભ પ્રભાવ નથી.'
            : bhadra.guidance}
        </div>

        {/* Classical Shloka on Bhadra Residence */}
        <div className="p-2 bg-[#FAF2E4] rounded-lg border border-[#8C6239]/15 text-[10px] text-[#8C6239] italic text-center">
          &quot;स्वर्गे भद्रा शुभं कुर्यात् पाताले च धनागमा। मृत्युलोके यदा भद्रा सर्वकार्य विनाशिनी॥&quot;
        </div>
      </div>
    </div>
  );
};
