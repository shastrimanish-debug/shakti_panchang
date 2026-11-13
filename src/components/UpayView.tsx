import React, { useState, useMemo } from 'react';
import {
  PLANETS_UPAY_DATA,
  MAJOR_DOSHAS_UPAY,
} from '../data/upayData';
import { KundaliData } from '../types';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../i18n';
import { trRashi } from '../i18n/vedicTranslate';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';
import { LalKitabUpayListView } from './LalKitabUpayListView';
import { SaralUpayPanel } from './SaralUpayPanel';
import { RavanSanhitaUpayView } from './RavanSanhitaUpayView';

function pickL<T>(lang: string, hi: T, en: T, gu: T): T {
  const l = (lang || 'hi').slice(0, 2).toLowerCase();
  if (l === 'en') return en;
  if (l === 'gu') return gu;
  return hi;
}

interface UpayViewProps {
  activeKundali: KundaliData | null;
  onOpenKundaliTab?: () => void;
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const UpayView: React.FC<UpayViewProps> = ({
  activeKundali,
  onOpenKundaliTab,
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { language } = useLanguage();
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [upayTab, setUpayTab] = useState<'lal_kitab' | 'ravan_sanhita' | 'story_deck' | 'saral_upay'>('lal_kitab');

  const lagnaLabel = activeKundali ? trRashi(activeKundali.lagnaRashi, language) : '';
  const rashiLabel = activeKundali ? trRashi(activeKundali.moonRashi, language) : '';

  const slides: StorySlideItem[] = [
    // Slide 1: Personalized Kundali Upay
    {
      id: 'personal-upay',
      title: activeKundali
        ? pickL(
            language,
            `${activeKundali.name} की कुण्डली उपाय`,
            `${activeKundali.name}'s Kundali Remedies`,
            `${activeKundali.name} ની કુંડળી ઉપાય`
          )
        : pickL(language, 'व्यक्तिगत कुण्डली ग्रह शांति', 'Personal Planetary Remedies', 'વ્યક્તિગત કુંડળી ગ્રહ શાંતિ'),
      subtitle: activeKundali
        ? pickL(
            language,
            `लग्न: ${lagnaLabel} • राशि: ${rashiLabel}`,
            `Ascendant: ${lagnaLabel} • Moon Sign: ${rashiLabel}`,
            `લગ્ન: ${lagnaLabel} • રાશિ: ${rashiLabel}`
          )
        : pickL(language, 'ग्रह शांति विश्लेषण', 'Planetary Peace Analysis', 'ગ્રહ શાંતિ વિશ્લેષણ'),
      badge: pickL(language, 'कुण्डली अनुकूल', 'Chart Aligned', 'કુંડળી અનુકૂળ'),
      icon: '🪔',
      voiceText: pickL(
        language,
        'आपकी कुण्डली के अनुसार ग्रह शांति व अचूक उपाय।',
        'Authentic Vedic planetary remedies aligned with your horoscope.',
        'તમારી કુંડળી અનુસાર ગ્રહ શાંતિ અને અચૂક વૈદિક ઉપાયો.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm space-y-2 my-auto text-xs">
            <div className="font-black text-[#5C3A21] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>{pickL(language, 'नित्य पावन वैदिक नियम', 'Daily Sacred Vedic Practice', 'નિત્ય પાવન વૈદિક નિયમ')}</span>
            </div>
            <p className="text-[11px] text-[#3E2714] leading-relaxed">
              {pickL(
                language,
                <>प्रातःकाल सूर्योदय के समय तांबे के लोटे से सूर्य देव को जल अर्पित करें और <strong>॥ ॐ सूर्याय नमः ॥</strong> का ११ बार जप करें।</>,
                <>At sunrise each morning, offer water (Arghya) to Lord Surya from a copper vessel and chant <strong>॥ ॐ सूर्याय नमः ॥</strong> 11 times.</>,
                <>સવારે સૂર્યોદય સમયે તાંબાના લોટાથી સૂર્યદેવને જળ અર્પણ કરો અને <strong>॥ ॐ सूर्याय नमः ॥</strong> નો ૧૧ વાર જપ કરો.</>
              )}
            </p>
            <div className="p-2 rounded-xl bg-white border border-amber-200 text-[11px]">
              <span className="font-bold text-[#B56A00]">{pickL(language, 'दैनिक दान: ', 'Daily Charity: ', 'દૈનિક દાન: ')}</span>
              <span>
                {pickL(
                  language,
                  'पक्षियों को दाना और गाय को नित्य पहली रोटी गुड़ के साथ दें।',
                  'Feed grains to birds and offer the first roti with jaggery to a cow daily.',
                  'પક્ષીઓને દાણા અને ગાયને નિત્ય પ્રથમ રોટલી ગોળ સાથે ખવડાવો.'
                )}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {pickL(
              language,
              "विस्तृत महादशा उपाय हेतु 'उमा परामर्श' प्राप्त करें।",
              "Consult 'Uma Consultation' for detailed Mahadasha remedies.",
              "વિગતવાર મહાદશા ઉપાય માટે 'ઉમા પરામર્શ' પ્રાપ્ત કરો."
            )}
          </div>
        </div>
      ),
    },

    // Slide 2: Sun, Moon & Mars
    {
      id: 'sun-moon-mars',
      title: pickL(language, 'सूर्य, चन्द्र व मंगल ग्रह उपाय', 'Sun, Moon & Mars Remedies', 'સૂર્ય, ચંદ્ર અને મંગળ ગ્રહ ઉપાય'),
      subtitle: pickL(language, 'आरोग्य, मानसिक शांति व पराक्रम', 'Vitality, Peace of Mind & Courage', 'આરોગ્ય, માનસિક શાંતિ અને પરાક્રમ'),
      badge: pickL(language, 'तेज व शक्ति', 'Vitality & Strength', 'તેજ અને શક્તિ'),
      icon: '☀️',
      voiceText: pickL(
        language,
        'सूर्य, चन्द्रमा और मंगल ग्रह के अचूक वैदिक उपाय।',
        'Vedic remedies for the Sun, Moon, and Mars.',
        'સૂર્ય, ચંદ્ર અને મંગળ ગ્રહના અચૂક વૈદિક ઉપાયો.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-orange-50 border border-orange-200">
              <div className="font-bold text-orange-950">
                {pickL(language, '☀️ सूर्य शांति: पिता की सेवा व तांबे का दान', '☀️ Sun Peace: Respect Father & Donate Copper', '☀️ સૂર્ય શાંતિ: પિતાની સેવા અને તાંબાનું દાન')}
              </div>
              <p className="text-[10px] text-orange-900 mt-0.5">
                {pickL(language, 'आदित्य हृदय स्तोत्र पाठ व रविवार को नमक रहित भोजन।', 'Recite Aditya Hridaya Stotra and observe saltless meals on Sundays.', 'આદિત્ય હૃદય સ્તોત્ર પાઠ અને રવિવારે મીઠા વગરનું ભોજન.')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950">
                {pickL(language, '🌕 चन्द्र शांति: माता का आशीर्वाद व शिव अभिषेक', '🌕 Moon Peace: Mother\'s Blessings & Shiva Abhishek', '🌕 ચંદ્ર શાંતિ: માતાના આશીર્વાદ અને શિવ અભિષેક')}
              </div>
              <p className="text-[10px] text-sky-900 mt-0.5">
                {pickL(language, 'सोमवार को दूध व जल से शिवलिंग का अभिषेक व चांदी धारण।', 'Offer milk & water on Shivling on Mondays and wear silver.', 'સોમવારે દૂધ અને જળથી શિવલિંગનો અભિષેક અને ચાંદી ધારણ.')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950">
                {pickL(language, '🔴 मंगल शांति: हनुमान चालीसा व मसूर दान', '🔴 Mars Peace: Hanuman Chalisa & Red Lentil Daan', '🔴 મંગળ શાંતિ: હનુમાન ચાલીસા અને મસૂર દાન')}
              </div>
              <p className="text-[10px] text-rose-900 mt-0.5">
                {pickL(language, 'मंगलवार को सिन्दूर अर्पण व छोटे भाइयों से मधुर संबंध।', 'Offer vermilion on Tuesdays and maintain harmony with younger siblings.', 'મંગળવારે સિંદૂર અર્પણ અને નાના ભાઈઓ સાથે મધુર સંબંધ.')}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {pickL(language, 'शुभ ग्रहों का मंत्र जप सदा फलदायी होता है।', 'Chanting mantras of auspicious planets is always fruitful.', 'શુભ ગ્રહોનો મંત્ર જપ સદા ફળદાયી હોય છે.')}
          </div>
        </div>
      ),
    },

    // Slide 3: Mercury, Jupiter & Venus
    {
      id: 'mercury-jupiter-venus',
      title: pickL(language, 'बुध, गुरु व शुक्र ग्रह उपाय', 'Mercury, Jupiter & Venus Remedies', 'બુધ, ગુરુ અને શુક્ર ગ્રહ ઉપાય'),
      subtitle: pickL(language, 'बुद्धि, ज्ञान, समृद्धि व सुख', 'Intellect, Wisdom, Prosperity & Comfort', 'બુદ્ધિ, જ્ઞાન, સમૃદ્ધિ અને સુખ'),
      badge: pickL(language, 'विद्या व वैभव', 'Wisdom & Wealth', 'વિદ્યા અને વૈભવ'),
      icon: '🌿',
      voiceText: pickL(
        language,
        'बुध, बृहस्पति और शुक्र ग्रह के वैदिक उपाय।',
        'Vedic remedies for Mercury, Jupiter, and Venus.',
        'બુધ, બૃહસ્પતિ અને શુક્ર ગ્રહના વૈદિક ઉપાયો.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950">
                {pickL(language, '💚 बुध शांति: गौ सेवा व हरी मूंग का दान', '💚 Mercury Peace: Cow Service & Green Moong Daan', '💚 બુધ શાંતિ: ગૌ સેવા અને લીલા મગનું દાન')}
              </div>
              <p className="text-[10px] text-emerald-900 mt-0.5">
                {pickL(language, 'बुधवार को गणेश जी को दूर्वा अर्पित करें व किन्नरों का सम्मान करें।', 'Offer Durva grass to Lord Ganesha on Wednesdays and be charitable.', 'બુધવારે ગણેશજીને દૂર્વા અર્પણ કરો અને જરૂરિયાતમંદોને મદદ કરો.')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">
                {pickL(language, '💛 गुरु शांति: चने की दाल, हल्दी व गुरु सेवा', '💛 Jupiter Peace: Chana Dal, Turmeric & Guru Seva', '💛 ગુરુ શાંતિ: ચણાની દાળ, હળદર અને ગુરુ સેવા')}
              </div>
              <p className="text-[10px] text-amber-900 mt-0.5">
                {pickL(language, 'गुरुवार को केले के वृक्ष का पूजन व विष्णु सहस्रनाम पाठ।', 'Worship banana tree on Thursdays and recite Vishnu Sahasranama.', 'ગુરુવારે કેળના વૃક્ષનું પૂજન અને વિષ્ણુ સહસ્રનામ પાઠ.')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
              <div className="font-bold text-purple-950">
                {pickL(language, '🤍 शुक्र शांति: माँ लक्ष्मी पूजन व श्वेत वस्त्र', '🤍 Venus Peace: Maa Lakshmi Worship & White Attire', '🤍 શુક્ર શાંતિ: મા લક્ષ્મી પૂજન અને શ્વેત વસ્ત્ર')}
              </div>
              <p className="text-[10px] text-purple-900 mt-0.5">
                {pickL(language, 'शुक्रवार को खीर का भोग व इत्र/सुगंध का प्रयोग।', 'Offer kheer bhog on Fridays and use pure natural fragrance.', 'શુક્રવારે ખીરનો ભોગ ધરાવો અને સુગંધિત દ્રવ્યોનો ઉપયોગ કરો.')}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {pickL(language, 'समस्त नवग्रह शांति मन्त्र नित्य कल्याण करते हैं।', 'Navagraha Shanti mantras bring perpetual well-being.', 'સમસ્ત નવગ્રહ શાંતિ મંત્ર નિત્ય કલ્યાણ કરે છે.')}
          </div>
        </div>
      ),
    },

    // Slide 4: Saturn, Rahu & Ketu
    {
      id: 'saturn-rahu-ketu',
      title: pickL(language, 'शनि, राहु व केतु शांति उपाय', 'Saturn, Rahu & Ketu Remedies', 'શનિ, રાહુ અને કેતુ શાંતિ ઉપાય'),
      subtitle: pickL(language, 'साढ़ेसाती, ढैया व छाया ग्रह शांति', 'Sade Sati, Dhaiya & Shadow Planet Pacification', 'સાડાસાતી, ઢૈય્યા અને છાયા ગ્રહ શાંતિ'),
      badge: pickL(language, 'छाया ग्रह शांति', 'Shadow Planet Relief', 'છાયા ગ્રહ શાંતિ'),
      icon: '🪐',
      voiceText: pickL(
        language,
        'शनि, राहु और केतु ग्रह के अचूक वैदिक उपाय।',
        'Effective Vedic remedies for Saturn, Rahu, and Ketu.',
        'શનિ, રાહુ અને કેતુ ગ્રહના અચૂક વૈદિક ઉપાયો.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-stone-100 border border-stone-300">
              <div className="font-bold text-stone-900">
                {pickL(language, '🖤 शनि शांति: सरसों तेल का छाया दान व पीपल पूजन', '🖤 Saturn Peace: Mustard Oil Chhaya Daan & Peepal Puja', '🖤 શનિ શાંતિ: સરસવ તેલનું છાયા દાન અને પીપળ પૂજન')}
              </div>
              <p className="text-[10px] text-stone-800 mt-0.5">
                {pickL(language, 'शनिवार सायं पीपल वृक्ष पर तिल तेल का दीप जलाएं व गरीबों की सहायता करें।', 'Light a sesame-oil lamp under a Peepal tree on Saturday evening and help the needy.', 'શનિવારે સાંજે પીપળાના વૃક્ષ નીચે તલના તેલનો દીવો પ્રગટાવો અને ગરીબોની સેવા કરો.')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="font-bold text-indigo-950">
                {pickL(language, '🌌 राहु शांति: काले कुत्ते को रोटी व भैरव उपासना', '🌌 Rahu Peace: Feed Black Dog & Bhairav Worship', '🌌 રાહુ શાંતિ: કાળા કૂતરાને રોટલી અને ભૈરવ ઉપાસના')}
              </div>
              <p className="text-[10px] text-indigo-900 mt-0.5">
                {pickL(language, 'पक्षियों को बाजरा व सात प्रकार के अनाज (सप्तधान्य) का दान।', 'Feed pearl millet (bajra) to birds and donate Saptadhanya (7 grains).', 'પક્ષીઓને બાજરી અને સાત પ્રકારના અનાજ (સપ્તધાન્ય) નું દાન કરો.')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">
                {pickL(language, '🚩 केतु शांति: गणेश अथर्वशीर्ष पाठ व कंबल दान', '🚩 Ketu Peace: Ganpati Atharvashirsha & Blanket Daan', '🚩 કેતુ શાંતિ: ગણેશ અથર્વશીર્ષ પાઠ અને કામળાનું દાન')}
              </div>
              <p className="text-[10px] text-amber-900 mt-0.5">
                {pickL(language, 'धार्मिक स्थलों पर ध्वजा अर्पण व असहायों को भोजन कराएं।', 'Offer a temple flag at a shrine and offer meals to the underprivileged.', 'ધાર્મિક સ્થળો પર ધજા અર્પણ કરો અને અસહાયોને ભોજન કરાવો.')}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {pickL(language, 'भगवान शिव व हनुमान जी की उपासना से समस्त क्रूर ग्रह शांत होते हैं।', 'Worship of Lord Shiva & Hanuman Ji pacifies all malefic influences.', 'ભગવાન શિવ અને હનુમાનજીની ઉપાસનાથી સમસ્ત ક્રૂર ગ્રહો શાંત થાય છે.')}
          </div>
        </div>
      ),
    },

    // Slide 5: Major Dosha Remedies
    {
      id: 'major-doshas',
      title: pickL(language, 'मांगलिक, कालसर्प व पितृ दोष उपाय', 'Manglik, Kaalsarp & Pitru Dosha Remedies', 'માંગલિક, કાલસર્પ અને પિતૃ દોષ ઉપાય'),
      subtitle: pickL(language, 'प्रमुख जन्म कुण्डली दोष निवारण', 'Major Birth Chart Dosha Pacification', 'મુખ્ય જન્મ કુંડળી દોષ નિવારણ'),
      badge: pickL(language, 'दोष मुक्ति', 'Dosha Relief', 'દોષ મુક્તિ'),
      icon: '🛡️',
      voiceText: pickL(
        language,
        'मांगलिक, कालसर्प और पितृ दोष निवारण उपाय।',
        'Remedies for Manglik, Kaal Sarp, and Pitru Dosha.',
        'માંગલિક, કાલસર્પ અને પિતૃ દોષ નિવારણના ઉપાયો.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950">
                {pickL(language, '🌺 मांगलिक दोष: कुंभ विवाह व मंगल चण्डिका स्तोत्र', '🌺 Manglik Dosha: Kumbha Vivah & Mangal Chandika Stotra', '🌺 માંગલિક દોષ: કુંભ વિવાહ અને મંગળ ચંડિકા સ્તોત્ર')}
              </div>
              <p className="text-[10px] text-rose-900 mt-0.5">
                {pickL(language, 'मंगलवार को मसूर दाल दान व हनुमान जी को चोला अर्पण।', 'Donate masoor dal on Tuesdays and offer sindoor chola to Hanuman Ji.', 'મંગળવારે મસૂર દાળ દાન અને હનુમાનજીને ચોલા અર્પણ.')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="font-bold text-indigo-950">
                {pickL(language, '🐍 कालसर्प योग: महामृत्युंजय जप व नाग-नागिन अर्पण', '🐍 Kaalsarp Yoga: Mahamrityunjaya Japa & Nag-Nagin Puja', '🐍 કાલસર્પ યોગ: મહામૃત્યુંજય જપ અને નાગ-નાગિન અર્પણ')}
              </div>
              <p className="text-[10px] text-indigo-900 mt-0.5">
                {pickL(language, 'नागपंचमी पर चांदी के नाग-नागिन बहते जल में प्रवाहित करें।', 'On Nag Panchami, float silver Nag-Nagin pairs in flowing sacred water.', 'નાગપંચમીએ ચાંદીના નાગ-નાગિન વહેતા જળમાં પ્રવાહિત કરો.')}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">
                {pickL(language, '🕉️ पितृ दोष: अमावस्या तर्पण व पीपल पर जल', '🕉️ Pitru Dosha: Amavasya Tarpan & Peepal Water Offering', '🕉️ પિતૃ દોષ: અમાસ તર્પણ અને પીપળા પર જળ')}
              </div>
              <p className="text-[10px] text-amber-900 mt-0.5">
                {pickL(language, 'अमावस्या को ब्राह्मण भोजन, कौवे व गाय को ग्रास दें।', 'On Amavasya, offer meals to Brahmins, crows, and cows with reverence.', 'અમાસના દિવસે બ્રાહ્મણ ભોજન અને કાગડા તથા ગાયને ગ્રાસ આપો.')}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {pickL(language, 'श्रद्धा और नियम से किए गए उपाय अवश्य फल देते हैं।', 'Remedies performed with faith and discipline always bear fruit.', 'શ્રદ્ધા અને નિયમથી કરેલા ઉપાય અવશ્ય ફળ આપે છે.')}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Uniform Mode Switcher: Lal Kitab | Ravan Sanhita | Navagraha Story Deck | Saral Upay */}
      <div className="flex flex-wrap items-center justify-center p-1 bg-[#462B17] rounded-xl text-xs font-bold border border-[#8C6239]/60 gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setUpayTab('lal_kitab')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg transition cursor-pointer ${
            upayTab === 'lal_kitab'
              ? 'bg-[#6E1409] text-amber-100 shadow-xs border border-amber-400/50'
              : 'text-[#D9C4A9] hover:text-white'
          }`}
        >
          {pickL(language, '📕 १. लाल किताब (501)', '📕 1. Lal Kitab (501)', '📕 ૧. લાલ કિતાબ (501)')}
        </button>
        <button
          type="button"
          onClick={() => setUpayTab('ravan_sanhita')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg transition cursor-pointer ${
            upayTab === 'ravan_sanhita'
              ? 'bg-[#6E1409] text-amber-100 shadow-xs border border-amber-400/50'
              : 'text-[#D9C4A9] hover:text-white'
          }`}
        >
          {pickL(language, '🔱 २. रावण संहिता (108)', '🔱 2. Ravan Sanhita (108)', '🔱 ૨. રાવણ સંહિતા (108)')}
        </button>
        <button
          type="button"
          onClick={() => setUpayTab('story_deck')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg transition cursor-pointer ${
            upayTab === 'story_deck'
              ? 'bg-[#6E1409] text-amber-100 shadow-xs border border-amber-400/50'
              : 'text-[#D9C4A9] hover:text-white'
          }`}
        >
          {pickL(language, '🪔 ३. नवग्रह व दोष शांति', '🪔 3. Navagraha & Dosha Shanti', '🪔 ૩. નવગ્રહ અને દોષ શાંતિ')}
        </button>
        <button
          type="button"
          onClick={() => setUpayTab('saral_upay')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg transition cursor-pointer ${
            upayTab === 'saral_upay'
              ? 'bg-[#6E1409] text-amber-100 shadow-xs border border-amber-400/50'
              : 'text-[#D9C4A9] hover:text-white'
          }`}
        >
          {pickL(language, '📿 ४. सरल उपाय (501)', '📿 4. Simple Remedies (501)', '📿 ૪. સરળ ઉપાય (501)')}
        </button>
      </div>

      {upayTab === 'lal_kitab' && (
        <LalKitabUpayListView onAskUma={onOpenUmaWithQuery} />
      )}

      {upayTab === 'ravan_sanhita' && (
        <RavanSanhitaUpayView onAskUma={onOpenUmaWithQuery} />
      )}

      {upayTab === 'story_deck' && (
        <UniversalStoryDeck
          slides={slides}
          currentSlideIndex={activeSlideIndex}
          onSlideIndexChange={setActiveSlideIndex}
          headerTitle={pickL(language, 'ग्रह शांति व चमत्कारी उपाय', 'Planetary Peace & Remedies', 'ગ્રહ શાંતિ અને ચમત્કારી ઉપાય')}
          headerIcon="🪔"
          chapterNumber={13}
          onOpenUma={
            onOpenUmaWithQuery
              ? () =>
                  onOpenUmaWithQuery(
                    pickL(
                      language,
                      'मेरी कुण्डली के अनुसार सबसे सटीक उपाय',
                      'Most accurate Vedic remedies according to my Kundali',
                      'મારી કુંડળી અનુસાર સૌથી સચોટ ઉપાયો'
                    )
                  )
              : undefined
          }
          onPrevChapter={onPrevChapter}
          onNextChapter={onNextChapter}
          prevChapterLabel={pickL(language, 'दुर्गा सप्तशती', 'Durga Saptashati', 'દુર્ગા સપ્તશતી')}
          nextChapterLabel={pickL(language, 'अंकशास्त्र', 'Numerology', 'અંકશાસ્ત્ર')}
        />
      )}

      {upayTab === 'saral_upay' && <SaralUpayPanel />}
    </div>
  );
};
export default UpayView;
