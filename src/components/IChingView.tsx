import React, { useState } from 'react';
import {
  castIChingCoins,
  IChingHexagram,
  IChingLine,
} from '../services/spiritualModules';
import { PremiumModuleLock } from './PremiumModuleLock';
import { useTranslation } from '../i18n';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import {
  Sparkles,
  RefreshCw,
  Share2,
  Coins,
  Compass,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface IChingViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
}

export const IChingView: React.FC<IChingViewProps> = ({ onOpenUmaWithQuery }) => {
  const { t } = useTranslation();

  const [castResult, setCastResult] = useState<{
    lines: IChingLine[];
    hexagram: IChingHexagram;
    coinsTosses: { toss: [number, number, number]; lineVal: number }[];
  } | null>(null);

  const [isTossing, setIsTossing] = useState<boolean>(false);
  const [tossStep, setTossStep] = useState<number>(0);

  const handleCastCoins = () => {
    setIsTossing(true);
    setCastResult(null);
    setTossStep(0);

    // Simulate authentic 6 successive coin tosses
    const fullResult = castIChingCoins();

    let step = 1;
    const interval = setInterval(() => {
      setTossStep(step);
      if (step >= 6) {
        clearInterval(interval);
        setCastResult(fullResult);
        setIsTossing(false);
      }
      step++;
    }, 300);
  };

  const handleShareIChing = () => {
    if (!castResult) return;
    const h = castResult.hexagram;
    const shareText = `☯️ *${t('iching.title', 'आई-चिंग दैवज्ञ परामर्श (I-Ching Oracle)')}*
✨ *${t(h.nameKey, h.chineseName)}* — ${h.pinyin}
№ *${t('iching.hexagramLabel', 'षट्कोण संख्या:')}* ${h.number}

📜 *${t('iching.judgmentHeading', 'निर्णय (Judgment):')}*
${t(h.judgmentKey, '')}

🌊 *${t('iching.imageHeading', 'प्रतीक (The Image):')}*
${t(h.imageKey, '')}

💡 *${t('iching.adviceHeading', 'व्यावहारिक मार्गदर्शन:')}*
${t(h.practicalAdviceKey, '')}

📲 *${t('app.name', 'सनातन शक्ति पंचांग')}*`;
    openWhatsAppShare(shareText);
  };

  return (
    <PremiumModuleLock
      moduleId="iching"
      titleKey="iching.lockTitle"
      descKey="iching.lockDesc"
      featureKeys={[
        'iching.feature1',
        'iching.feature2',
        'iching.feature3',
        'iching.feature4',
      ]}
    >
      <div className="w-full space-y-4 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#20152B] via-[#3B2252] to-[#20152B] text-[#FAF2E4] shadow-md border border-purple-400/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-400/20 text-purple-200 border border-purple-400/40 uppercase tracking-wider flex items-center gap-1">
                  <span>☯️</span>
                  <span>{t('iching.badge', 'Book of Changes • King Wen I-Ching')}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-granth text-purple-200">
                {t('iching.title', 'आई-चिंग दैवज्ञ विधा (I-Ching Oracle)')}
              </h2>
              <p className="text-xs text-[#FAF2E4]/90 mt-0.5 max-w-xl">
                {t('iching.subtitle', 'प्राचीन यिन-यांग ३ सिक्कों द्वारा ६४ षट्कोणों (Hexagrams) का दैवीय मार्गदर्शन')}
              </p>
            </div>

            {castResult && (
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleShareIChing}
                  className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('common.share', 'शेयर')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCastCoins}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('iching.recastBtn', 'सिक्के पुनः उछालें')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Empty / Idle Toss Trigger Area */}
        {!castResult && !isTossing && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs text-center space-y-4">
            <div className="flex justify-center gap-3 text-3xl">
              <span className="animate-bounce">🪙</span>
              <span className="animate-bounce delay-100">🪙</span>
              <span className="animate-bounce delay-200">🪙</span>
            </div>
            <div className="max-w-sm mx-auto space-y-1.5">
              <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                {t('iching.promptTitle', 'मन में अपना संशय अथवा प्रश्न सोचें')}
              </h3>
              <p className="text-xs text-[#735133] dark:text-stone-300 leading-relaxed">
                {t('iching.promptDesc', 'आई-चिंग ३ कांस्य सिक्कों को ६ बार उछालकर नीचे से ऊपर की ओर रेखाएं निर्मित करता है।')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCastCoins}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-900 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Coins className="w-4 h-4" />
              <span>{t('iching.tossCoinsBtn', '🪙 ३ सिक्के उछालें (Cast Hexagram)')}</span>
            </button>
          </div>
        )}

        {/* Tossing Progress Animation */}
        {isTossing && (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-purple-300 shadow-xs text-center space-y-3">
            <div className="flex justify-center gap-2 text-2xl animate-spin">
              🪙 🪙 🪙
            </div>
            <h4 className="text-sm font-bold text-purple-950 dark:text-purple-200">
              {t('iching.castingStep', 'सिक्का उछाल जारी:')} {tossStep}/6 {t('iching.linesBuilt', 'रेखाएं निर्मित')}
            </h4>
            <div className="w-48 h-2 rounded-full bg-stone-200 dark:bg-stone-800 mx-auto overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${(tossStep / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Cast Result Display */}
        {castResult && (
          <div className="space-y-4">
            {/* Hexagram Visual & Title Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#2A1508]/90 border border-purple-300/60 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
              {/* Authentic 6 Lines Graphic (Drawn from Bottom Line 1 to Top Line 6) */}
              <div className="w-44 p-3 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border-2 border-purple-400/50 flex flex-col-reverse gap-1.5 shadow-inner">
                {castResult.lines.map((line, lIdx) => (
                  <div key={lIdx} className="w-full flex items-center justify-center gap-1.5 h-3">
                    {line.isYang ? (
                      // Solid Yang Line (⚊)
                      <div className="w-full h-2 rounded-sm bg-purple-900 dark:bg-purple-300" />
                    ) : (
                      // Broken Yin Line (⚋)
                      <div className="w-full flex gap-2 h-2">
                        <div className="w-1/2 h-full rounded-sm bg-purple-900 dark:bg-purple-300" />
                        <div className="w-1/2 h-full rounded-sm bg-purple-900 dark:bg-purple-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Hexagram Name & Trigram Metadata */}
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-3xl select-none">{castResult.hexagram.symbolEmoji}</span>
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                      {t('iching.hexagramNum', 'षट्कोण संख्या')} {castResult.hexagram.number}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                      {t(castResult.hexagram.nameKey, castResult.hexagram.chineseName)}
                    </h3>
                  </div>
                </div>

                <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  {castResult.hexagram.pinyin}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-[#735133] dark:text-stone-300">
                  <span>
                    {t('iching.upperTrigram', 'ऊपरी त्रिगुण:')} <strong>{t(castResult.hexagram.upperTrigramKey, 'स्वर्ग')}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {t('iching.lowerTrigram', 'निचला त्रिगुण:')} <strong>{t(castResult.hexagram.lowerTrigramKey, 'पृथ्वी')}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Deep Divine Wisdom Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Judgment */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/20 shadow-xs space-y-1.5">
                <span className="font-bold text-purple-900 dark:text-purple-300 uppercase text-[10px] block">
                  {t('iching.judgmentHeading', '१. निर्णय (The Judgment / King Wen)')}
                </span>
                <p className="text-[11px] text-[#735133] dark:text-stone-300 leading-relaxed font-medium">
                  {t(castResult.hexagram.judgmentKey, 'महान सफलता, दृढ़ता फलदायी है। बड़ों का आदर करें।')}
                </p>
              </div>

              {/* The Image */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/20 shadow-xs space-y-1.5">
                <span className="font-bold text-purple-900 dark:text-purple-300 uppercase text-[10px] block">
                  {t('iching.imageHeading', '२. प्रतीक व दर्शन (The Image)')}
                </span>
                <p className="text-[11px] text-[#735133] dark:text-stone-300 leading-relaxed font-medium">
                  {t(castResult.hexagram.imageKey, 'स्वर्ग अपनी गति में सतत कार्यरत है; श्रेष्ठ पुरुष आत्म-संयम से उन्नति करते हैं।')}
                </p>
              </div>
            </div>

            {/* Practical Spiritual Counsel */}
            <div className="p-4 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/20 space-y-1 text-xs">
              <span className="font-bold text-[#8C4A00] uppercase text-[10px] block">
                {t('iching.adviceHeading', '३. व्यावहारिक निर्णय एवं जीवन सलाह (Practical Counsel)')}
              </span>
              <p className="text-[11px] text-[#5C3A21] dark:text-stone-200 leading-relaxed">
                {t(castResult.hexagram.practicalAdviceKey, 'सक्रिय पहल करें, किन्तु अहंकार से बचें। सहयोगियों को साथ लेकर चलें।')}
              </p>
            </div>

            {/* Uma I-Ching Guidance */}
            {onOpenUmaWithQuery && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-purple-500/15 border border-purple-400/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <strong className="text-purple-950 dark:text-purple-200 block">
                    {t('iching.askUmaTitle', 'इस षट्कोण पर विशिष्ट प्रश्न पूछें?')}
                  </strong>
                  <span className="text-[11px] text-[#735133] dark:text-stone-300">
                    {t('iching.askUmaDesc', 'उमा AI से आई-चिंग षट्कोण के आधार पर अपने व्यापार या व्यक्तिगत निर्णय पर परामर्श लें')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenUmaWithQuery(
                      `मैंने आई-चिंग में षट्कोण संख्या ${castResult.hexagram.number} (${t(castResult.hexagram.nameKey, castResult.hexagram.chineseName)}) प्राप्त किया है। कृपया इसके अनुसार मेरे निर्णय के लिए व्यावहारिक सुझाव दें।`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-black text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                >
                  {t('iching.askUmaBtn', 'उमा से पूछें →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PremiumModuleLock>
  );
};
