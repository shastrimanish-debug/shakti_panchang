import React, { useState } from 'react';
import {
  drawRandomTarotCards,
  DrawnTarotCard,
  TAROT_MAJOR_ARCANA,
} from '../services/spiritualModules';
import { PremiumModuleLock } from './PremiumModuleLock';
import { useTranslation } from '../i18n';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import {
  Sparkles,
  RefreshCw,
  Share2,
  Layers,
  HelpCircle,
  Compass,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface TarotViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
}

export const TarotView: React.FC<TarotViewProps> = ({ onOpenUmaWithQuery }) => {
  const { t } = useTranslation();

  const [readingMode, setReadingMode] = useState<1 | 3>(1);
  const [drawnCards, setDrawnCards] = useState<DrawnTarotCard[] | null>(null);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  const handleDrawCards = (mode: 1 | 3 = readingMode) => {
    setIsShuffling(true);
    setDrawnCards(null);
    setRevealedIndices([]);

    setTimeout(() => {
      const cards = drawRandomTarotCards(mode);
      setDrawnCards(cards);
      setIsShuffling(false);
      // Automatically reveal cards sequentially
      cards.forEach((_, i) => {
        setTimeout(() => {
          setRevealedIndices((prev) => [...prev, i]);
        }, (i + 1) * 350);
      });
    }, 700);
  };

  const handleShareReading = () => {
    if (!drawnCards) return;
    const shareText = `🔮 *${t('tarot.title', 'टैरो कार्ड परामर्श व फलादेश (Tarot Reading)')}*
✨ *${readingMode === 1 ? t('tarot.modeDaily', 'दैनिक एक कार्ड संदेश') : t('tarot.mode3Spread', 'त्रिकाल (भूत, वर्तमान, भविष्य) प्रसार')}:*

${drawnCards
  .map(
    (dc) =>
      `• *${t(dc.positionKey, 'कार्ड')}:* ${t(dc.card.nameKey, 'The Fool')} ${dc.isReversed ? `(${t('tarot.reversed', 'उल्टा / Reversed')})` : `(${t('tarot.upright', 'सीधा / Upright')})`}
  ${t('tarot.keyMessage', 'संदेश:')} ${t(dc.isReversed ? dc.card.reversedMeaningKey : dc.card.uprightMeaningKey, '')}`
  )
  .join('\n\n')}

📲 *${t('app.name', 'सनातन शक्ति पंचांग')}*`;
    openWhatsAppShare(shareText);
  };

  return (
    <PremiumModuleLock
      moduleId="tarot"
      titleKey="tarot.lockTitle"
      descKey="tarot.lockDesc"
      featureKeys={[
        'tarot.feature1',
        'tarot.feature2',
        'tarot.feature3',
        'tarot.feature4',
      ]}
    >
      <div className="w-full space-y-4 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#311847] via-[#5C2B72] to-[#311847] text-[#FAF2E4] shadow-md border border-purple-400/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-400/20 text-purple-200 border border-purple-400/40 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  <span>{t('tarot.badge', 'Sacred Tarot Divination')}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-granth text-purple-200">
                {t('tarot.title', 'टैरो कार्ड रीडिंग (Tarot Guidance)')}
              </h2>
              <p className="text-xs text-[#FAF2E4]/90 mt-0.5 max-w-xl">
                {t('tarot.subtitle', '२२ मेजर अरकाना कार्ड्स द्वारा अंतर्ज्ञान, भूत-वर्तमान-भविष्य व दिव्य मार्गदर्शन')}
              </p>
            </div>

            {drawnCards && (
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleShareReading}
                  className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('common.share', 'शेयर')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDrawCards(readingMode)}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('tarot.reshuffleBtn', 'पुनः निकालें')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mode Selector & Action Bar */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/20 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setReadingMode(1);
                handleDrawCards(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                readingMode === 1
                  ? 'bg-purple-900 text-purple-100 shadow-xs'
                  : 'bg-[#FAF5ED] dark:bg-stone-800 text-[#5C3A21] dark:text-stone-300'
              }`}
            >
              {t('tarot.modeDaily', 'दैनिक १ कार्ड संदेश (Daily 1 Card)')}
            </button>
            <button
              type="button"
              onClick={() => {
                setReadingMode(3);
                handleDrawCards(3);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                readingMode === 3
                  ? 'bg-purple-900 text-purple-100 shadow-xs'
                  : 'bg-[#FAF5ED] dark:bg-stone-800 text-[#5C3A21] dark:text-stone-300'
              }`}
            >
              {t('tarot.mode3Spread', 'त्रिकाल ३ कार्ड (Past • Present • Future)')}
            </button>
          </div>

          {!drawnCards && (
            <button
              type="button"
              disabled={isShuffling}
              onClick={() => handleDrawCards(readingMode)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isShuffling ? t('tarot.shuffling', 'शफल हो रहा है...') : t('tarot.drawCardsBtn', '🔮 कार्ड निकालें')}</span>
            </button>
          )}
        </div>

        {/* Initial Empty / Idle State */}
        {!drawnCards && !isShuffling && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs text-center space-y-4">
            <div className="w-20 h-28 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-purple-800 border-2 border-purple-400/60 shadow-xl flex items-center justify-center text-3xl mx-auto animate-bounce">
              ✨
            </div>
            <div className="max-w-sm mx-auto space-y-1.5">
              <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                {t('tarot.promptTitle', 'मन में अपना प्रश्न या संकल्प दोहराएं')}
              </h3>
              <p className="text-xs text-[#735133] dark:text-stone-300 leading-relaxed">
                {t('tarot.promptDesc', 'शांत चित्त होकर "कार्ड निकालें" बटन पर टैप करें। टैरो कार्ड आपके अवचेतन मन व ब्रह्मांडीय संकेतों को उजागर करेंगे।')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDrawCards(readingMode)}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer active:scale-95"
            >
              {t('tarot.drawNowBtn', '🔮 दिव्य कार्ड निकालें')}
            </button>
          </div>
        )}

        {/* Shuffling Loading State */}
        {isShuffling && (
          <div className="p-10 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-purple-300 shadow-xs text-center space-y-3">
            <div className="w-16 h-24 rounded-xl bg-purple-900 border-2 border-amber-400 mx-auto animate-spin flex items-center justify-center text-xl text-white">
              🃏
            </div>
            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">
              {t('tarot.shufflingText', 'कार्ड्स शफल किए जा रहे हैं...')}
            </h4>
          </div>
        )}

        {/* Drawn Cards Display */}
        {drawnCards && (
          <div className="space-y-4">
            <div className={`grid gap-4 ${readingMode === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 sm:grid-cols-3'}`}>
              {drawnCards.map((item, idx) => {
                const isRevealed = revealedIndices.includes(idx);
                const isRev = item.isReversed;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-3xl bg-white dark:bg-[#2A1508]/90 border border-purple-300/60 shadow-md flex flex-col justify-between space-y-3 animate-in zoom-in-95 duration-300"
                  >
                    <div>
                      {/* Position Tag */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-800 dark:text-purple-300 mb-2">
                        <span className="uppercase tracking-wider">{t(item.positionKey, 'स्थिति')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${isRev ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {isRev ? t('tarot.reversed', 'उल्टा (Reversed)') : t('tarot.upright', 'सीधा (Upright)')}
                        </span>
                      </div>

                      {/* Card Graphic Frame */}
                      <div className={`w-full aspect-2/3 rounded-2xl bg-gradient-to-b from-[#25103A] to-[#12071E] border-2 border-amber-400/80 shadow-lg p-3 flex flex-col items-center justify-between text-center relative overflow-hidden transition-all ${isRev ? 'rotate-180' : ''}`}>
                        <div className="text-[10px] font-bold text-amber-300/80 uppercase">
                          № {item.card.id} • {item.card.element}
                        </div>
                        <div className="text-4xl my-auto select-none">
                          {item.card.imageUrl}
                        </div>
                        <div className="text-xs font-black font-granth text-amber-200">
                          {t(item.card.nameKey, 'Card Name')}
                        </div>
                      </div>
                    </div>

                    {/* Card Interpretation Details */}
                    <div className="space-y-2 pt-2 border-t border-purple-200/40 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
                          {t('tarot.keywordsTitle', 'प्रमुख संकेत:')}
                        </span>
                        <p className="text-[11px] font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                          {t(isRev ? item.card.reversedKeywordsKey : item.card.uprightKeywordsKey, '')}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
                          {t('tarot.meaningTitle', 'गहन फलादेश:')}
                        </span>
                        <p className="text-[11px] text-[#735133] dark:text-stone-300 leading-relaxed">
                          {t(isRev ? item.card.reversedMeaningKey : item.card.uprightMeaningKey, '')}
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-[10px] text-purple-900 dark:text-purple-200 border border-purple-200/50">
                        <strong>{t('tarot.spiritualGuidance', 'दिव्य सुझाव:')}</strong> {t(item.card.guidanceKey, '')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Uma Spiritual Follow-up */}
            {onOpenUmaWithQuery && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-purple-500/15 border border-purple-400/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <strong className="text-purple-950 dark:text-purple-200 block">
                    {t('tarot.askUmaTarotTitle', 'टैरो कार्ड्स पर विशेष प्रश्न या शंका?')}
                  </strong>
                  <span className="text-[11px] text-[#735133] dark:text-stone-300">
                    {t('tarot.askUmaTarotDesc', 'उमा AI से अपने निकाले गए कार्ड के अनुसार प्रेम, करियर व निर्णय पर सलाह लें')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenUmaWithQuery(
                      `मैंने टैरो रीडिंग में ${drawnCards.map((c) => t(c.card.nameKey, '')).join(', ')} कार्ड निकाले हैं। कृपया इसके अनुसार मेरे वर्तमान निर्णय के लिए विस्तृत मार्गदर्शन दें।`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                >
                  {t('tarot.askUmaTarotBtn', 'उमा से पूछें →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PremiumModuleLock>
  );
};
