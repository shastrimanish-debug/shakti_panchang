import React, { useState } from 'react';
import {
  castIChingCoins,
  IChingHexagram,
  IChingLine,
} from '../services/spiritualModules';
import { useTranslation, useLanguage } from '../i18n';
import { Sparkles, Coins, RefreshCw } from 'lucide-react';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface IChingViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const IChingView: React.FC<IChingViewProps> = ({
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [castResult, setCastResult] = useState<{
    lines: IChingLine[];
    hexagram: IChingHexagram;
    coinsTosses: { toss: [number, number, number]; lineVal: number }[];
  }>(() => castIChingCoins());
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const hex = castResult.hexagram;

  const slides: StorySlideItem[] = [
    // Slide 1: Hexagram & Coin Oracle
    {
      id: 'hexagram-overview',
      title: `${hex.chineseName} ${t(hex.nameKey, hex.pinyin)}`,
      subtitle: `${L('हेक्साग्राम', 'Hexagram', 'હેક્સાગ્રામ')} #${hex.number} • ${hex.pinyin}`,
      badge: L('आई-चिंग दैवज्ञ', 'I-Ching Oracle', 'આઈ-ચિંગ દૈવજ્ઞ'),
      icon: hex.symbolEmoji || '☯️',
      voiceText: L(
        `आई चिंग हेक्साग्राम संख्या ${hex.number}। ${hex.pinyin}।`,
        `I-Ching Hexagram number ${hex.number}, ${hex.pinyin}.`,
        `આઈ ચિંગ હેક્સાગ્રામ નંબર ${hex.number}. ${hex.pinyin}.`
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FFEEC9] border-2 border-amber-400 text-center shadow-sm my-auto space-y-2">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{hex.symbolEmoji || hex.chineseName}</span>
              <div className="text-left">
                <div className="text-xs font-black text-[#B56A00]">
                  {L('हेक्साग्राम', 'Hexagram', 'હેક્સાગ્રામ')} #{hex.number} ({hex.chineseName})
                </div>
                <div className="font-black font-granth text-base text-[#462B17]">
                  {t(hex.nameKey, hex.pinyin)}
                </div>
              </div>
            </div>

            {/* 6 lines visual */}
            <div className="flex flex-col gap-1 max-w-[120px] mx-auto py-1">
              {[...castResult.lines].reverse().map((line, i) => (
                <div key={i} className="flex items-center justify-center gap-1 h-2">
                  {line.isYang ? (
                    <div className="w-full h-1.5 bg-[#5C3A21] rounded-full" />
                  ) : (
                    <div className="w-full flex items-center justify-between gap-1.5">
                      <div className="w-1/2 h-1.5 bg-[#5C3A21] rounded-full" />
                      <div className="w-1/2 h-1.5 bg-[#5C3A21] rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-left text-xs">
              <div className="text-[10px] font-bold text-[#8C6239] uppercase">
                {L('दैवज्ञ निर्णय (Judgment)', 'ORACLE JUDGMENT', 'દૈવજ્ઞ નિર્ણય (Judgment)')}
              </div>
              <p className="text-[#3E2714] text-[11px] mt-0.5 leading-snug">
                {t(hex.judgmentKey, L('धैर्य, संतुलन और सात्विक कर्म से कार्य सिद्धि प्राप्त होगी।', 'Through patience, balance, and right action, success will follow.', 'ધૈર્ય, સંતુલન અને સાત્વિક કર્મથી કાર્ય સિદ્ધિ પ્રાપ્ત થશે.'))}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCastResult(castIChingCoins());
              }}
              className="px-3 py-1.5 rounded-xl bg-[#5C3A21] text-[#FAF2E4] text-xs font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-amber-300" />
              <span>{L('सिक्के पुनः उछालें (Cast Coins)', 'Cast Coins Again', 'સિક્કા ફરી ઉછાળો (Cast Coins)')}</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'यिन और यांग का संतुलन प्रकृति और जीवन का सार्वभौमिक सत्य है।',
              'The harmony of Yin and Yang is the universal rhythm of nature and life.',
              'યિન અને યાંગનું સંતુલન પ્રકૃતિ અને જીવનનું સાર્વભૌમિક સત્ય છે.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 2: Image & Guidance
    {
      id: 'image-advice',
      title: L('दैवज्ञ प्रतीक एवं कर्म मार्गदर्शन', 'Oracle Symbolism & Action Guidance', 'દૈવજ્ઞ પ્રતીક અને કર્મ માર્ગદર્શન'),
      subtitle: L('प्रतीक एवं आध्यात्मिक संकेत', 'The Image & Spiritual Advice', 'પ્રતીક અને આધ્યાત્મિક સંકેત'),
      badge: L('कर्म सूत्र', 'Action Insight', 'કર્મ સૂત્ર'),
      icon: '✨',
      voiceText: L('मार्गदर्शन एवं सलाह।', 'I-Ching symbolism and practical guidance.', 'માર્ગદર્શન અને સલાહ.'),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-2 my-auto text-xs">
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300">
              <div className="font-bold text-[#5C3A21] text-xs">
                {L('🌊 प्रतीक एवं प्रकृति (The Image)', '🌊 Symbolism (The Image)', '🌊 પ્રતીક અને પ્રકૃતિ (The Image)')}
              </div>
              <p className="text-[11px] text-[#6E472A] mt-1 leading-relaxed">
                {t(hex.imageKey, L('प्रकृति के शाश्वत नियमों का पालन करते हुए आत्मसंयम बनाए रखें।', 'Align with natural law and cultivate calm self-restraint.', 'પ્રકૃતિના શાશ્વત નિયમોનું પાલન કરીને આત્મસંયમ જાળવો.'))}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300">
              <div className="font-bold text-emerald-950 text-xs">
                {L('💡 व्यावहारिक सलाह (Practical Action)', '💡 Practical Action', '💡 વ્યવહારુ સલાહ (Practical Action)')}
              </div>
              <p className="text-[11px] text-emerald-900 mt-1 leading-relaxed">
                {t(hex.practicalAdviceKey, L('जल्दबाजी से बचें और सही समय की प्रतीक्षा करते हुए निरंतर पुरुषार्थ करें।', 'Avoid haste; wait for the right moment while continuing steady effort.', 'ઉતાવળ ટાળો અને યોગ્ય સમયની રાહ જોતા સતત પુરુષાર્થ કરો.'))}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              "विस्तृत प्रश्न मार्गदर्शन हेतु 'उमा परामर्श' प्राप्त करें।",
              "Get 'Uma Consultation' for deeper personal question guidance.",
              "વિગતવાર પ્રશ્ન માર્ગદર્શન માટે 'ઉમા પરામર્શ' મેળવો."
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <UniversalStoryDeck
      slides={slides}
      currentSlideIndex={activeSlideIndex}
      onSlideIndexChange={setActiveSlideIndex}
      headerTitle={t('nav.iching', L('आई-चिंग दैवज्ञ (I-Ching Oracle)', 'I-Ching Oracle', 'આઈ-ચિંગ દૈવજ્ઞ (I-Ching Oracle)'))}
      headerIcon="☯️"
      chapterNumber={19}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery(L('आई-चिंग दैवज्ञ परामर्श', 'I-Ching Oracle Consultation', 'આઈ-ચિંગ દૈવજ્ઞ પરામર્શ')) : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
    />
  );
};
export default IChingView;
