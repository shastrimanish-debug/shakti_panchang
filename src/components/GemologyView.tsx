import React, { useState } from 'react';
import {
  NAVARATNA_DATA,
  GemstoneData,
  findRecommendedGemstone,
} from '../services/spiritualModules';
import { PremiumModuleLock } from './PremiumModuleLock';
import { useTranslation } from '../i18n';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import {
  Sparkles,
  Share2,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
  Compass,
  Flame,
  Award,
} from 'lucide-react';

interface GemologyViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
}

export const GemologyView: React.FC<GemologyViewProps> = ({ onOpenUmaWithQuery }) => {
  const { t } = useTranslation();

  const [selectedGemId, setSelectedGemId] = useState<string>('yellow_sapphire');
  const [goalFilter, setGoalFilter] = useState<'all' | 'wealth' | 'career' | 'health' | 'marriage' | 'protection'>('all');

  const selectedGem: GemstoneData =
    NAVARATNA_DATA.find((g) => g.id === selectedGemId) || NAVARATNA_DATA[0];

  const handleSelectGoal = (goal: 'wealth' | 'career' | 'health' | 'marriage' | 'protection') => {
    setGoalFilter(goal);
    const rec = findRecommendedGemstone(goal);
    setSelectedGemId(rec.id);
  };

  const handleShareGemInfo = () => {
    const shareText = `💎 *${t('gemology.title', 'वैदिक रत्न विज्ञान एवं परामर्श')}*
✨ *${t(selectedGem.nameKey, selectedGem.sanskritName)}*
🪐 *${t('gemology.planetLabel', 'ग्रह:')}* ${t(selectedGem.planetKey, 'बृहस्पति')}
🔱 *${t('gemology.benefitsLabel', 'फल व लाभ:')}* ${t(selectedGem.benefitsKey, 'सुख, समृद्धि व ज्ञान')}
🖐️ *${t('gemology.fingerLabel', 'उंगली:')}* ${t(selectedGem.fingerKey, 'तर्जनी')} • *${t('gemology.metalLabel', 'धातु:')}* ${t(selectedGem.metalKey, 'स्वर्ण')}
📿 *${t('gemology.mantraLabel', 'मंत्र:')}* ${selectedGem.mantra}

📲 *${t('app.name', 'सनातन शक्ति पंचांग')}*`;
    openWhatsAppShare(shareText);
  };

  return (
    <PremiumModuleLock
      moduleId="gemology"
      titleKey="gemology.lockTitle"
      descKey="gemology.lockDesc"
      featureKeys={[
        'gemology.feature1',
        'gemology.feature2',
        'gemology.feature3',
        'gemology.feature4',
      ]}
    >
      <div className="w-full space-y-4 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#1C3A27] via-[#2D5A3E] to-[#1C3A27] text-[#FAF2E4] shadow-md border border-emerald-400/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  <span>{t('gemology.badge', 'Navaratna & Vedic Gem Therapy')}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-granth text-emerald-200">
                {t('gemology.title', 'वैदिक रत्न विज्ञान (Gemology)')}
              </h2>
              <p className="text-xs text-[#FAF2E4]/90 mt-0.5 max-w-xl">
                {t('gemology.subtitle', '९ प्रमुख रत्न, उपरत्न, प्रामाणिकता परीक्षण, धातु, उंगली व धारण विधि')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleShareGemInfo}
              className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 self-start sm:self-center"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('common.share', 'शेयर')}</span>
            </button>
          </div>
        </div>

        {/* Goal-Based Quick Gemstone Finder */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/20 shadow-xs space-y-2 text-xs">
          <span className="text-[10px] font-bold text-[#8C4A00] uppercase tracking-wider block">
            {t('gemology.goalFinderTitle', 'जीवन लक्ष्य अनुसार तुरंत रत्न चुनें:')}
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'wealth', labelKey: 'gemology.goalWealth', icon: '💰' },
              { id: 'career', labelKey: 'gemology.goalCareer', icon: '👑' },
              { id: 'health', labelKey: 'gemology.goalHealth', icon: '🧘' },
              { id: 'marriage', labelKey: 'gemology.goalMarriage', icon: '💍' },
              { id: 'protection', labelKey: 'gemology.goalProtection', icon: '🛡️' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleSelectGoal(btn.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                  goalFilter === btn.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-[#FAF5ED] dark:bg-stone-800 text-[#5C3A21] dark:text-stone-300'
                }`}
              >
                <span>{btn.icon}</span>
                <span>{t(btn.labelKey, btn.id)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navaratna Selector Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 text-xs">
          {NAVARATNA_DATA.map((gem) => {
            const isSelected = selectedGemId === gem.id;
            return (
              <button
                key={gem.id}
                type="button"
                onClick={() => {
                  setSelectedGemId(gem.id);
                  setGoalFilter('all');
                }}
                className={`p-2 rounded-2xl border transition text-center cursor-pointer flex flex-col items-center justify-center gap-1 select-none ${
                  isSelected
                    ? 'bg-emerald-900 text-emerald-100 border-emerald-400 shadow-md scale-102'
                    : 'bg-white dark:bg-[#2A1508]/80 hover:bg-[#FAF5ED] text-[#5C3A21] dark:text-[#FFD88A] border-[#8C6239]/20'
                }`}
              >
                <span className="text-xl">{gem.iconEmoji}</span>
                <span className="text-[10px] font-bold line-clamp-1">
                  {t(gem.nameKey, gem.sanskritName.split(' ')[0])}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Gemstone Complete Deep Dive Profile */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#2A1508]/90 border border-[#8C6239]/25 shadow-xs space-y-4">
          {/* Header of Card */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#8C6239]/15">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF5ED] dark:bg-stone-800 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-xs">
                {selectedGem.iconEmoji}
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  {t('gemology.planetLabel', 'स्वामी ग्रह')}: {t(selectedGem.planetKey, 'बृहस्पति')}
                </span>
                <h3 className="text-lg font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                  {t(selectedGem.nameKey, selectedGem.sanskritName)}
                </h3>
                <span className="text-xs text-[#735133] dark:text-stone-300">
                  {t('gemology.suitableRashisTitle', 'अनुकूल राशियाँ:')} {selectedGem.suitableRashis.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Core Ritual Guidelines Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15">
              <span className="text-[10px] font-bold text-[#8C6239] uppercase block">
                {t('gemology.metalLabel', 'शुभ धातु')}
              </span>
              <strong className="text-xs text-[#5C3A21] dark:text-stone-200">
                {t(selectedGem.metalKey, 'स्वर्ण')}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15">
              <span className="text-[10px] font-bold text-[#8C6239] uppercase block">
                {t('gemology.fingerLabel', 'धारण उंगली')}
              </span>
              <strong className="text-xs text-[#5C3A21] dark:text-stone-200">
                {t(selectedGem.fingerKey, 'तर्जनी')}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15">
              <span className="text-[10px] font-bold text-[#8C6239] uppercase block">
                {t('gemology.dayLabel', 'शुभ दिन व समय')}
              </span>
              <strong className="text-xs text-[#5C3A21] dark:text-stone-200">
                {t(selectedGem.dayKey, 'गुरुवार')}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15">
              <span className="text-[10px] font-bold text-[#8C6239] uppercase block">
                {t('gemology.substitutesLabel', 'सस्ता उपरत्न')}
              </span>
              <strong className="text-xs text-[#5C3A21] dark:text-stone-200">
                {t(selectedGem.substitutesKey, 'सुनहला')}
              </strong>
            </div>
          </div>

          {/* Vedic Mantra */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C4A00]">
              {t('gemology.mantraLabel', 'प्राण-प्रतिष्ठा सिद्ध बीज मंत्र (१०८ बार जप)')}
            </span>
            <div className="text-sm sm:text-base font-black font-granth text-[#5C3A21] dark:text-[#FFD88A]">
              {selectedGem.mantra}
            </div>
            <p className="text-[10px] text-[#735133] dark:text-stone-400">
              {t('gemology.ritualAdvice', 'कच्चे दूध, गंगाजल, तुलसी दल व शहद से शुद्ध करके शुभ चौघड़िया में धारण करें।')}
            </p>
          </div>

          {/* Benefits & Testing Guidelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/20 space-y-1.5">
              <h4 className="font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{t('gemology.benefitsHeading', 'शास्त्रीय फल व प्रभाव:')}</span>
              </h4>
              <p className="text-[11px] text-[#735133] dark:text-stone-300 leading-relaxed">
                {t(selectedGem.benefitsKey, 'यह रत्न ज्ञान, धन-संपदा, मान-प्रतिष्ठा व मानसिक शांति प्रदान करता है।')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/20 space-y-1.5">
              <h4 className="font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{t('gemology.testingHeading', 'प्रामाणिकता परीक्षण टिप्स:')}</span>
              </h4>
              <p className="text-[11px] text-[#735133] dark:text-stone-300 leading-relaxed">
                {t(selectedGem.testingTipKey, 'प्राकृतिक रेशे, चमक व कठोरता की जांच लैब सर्टिफिकेट के साथ करें।')}
              </p>
            </div>
          </div>
        </div>

        {/* Uma Custom Kundali Gem Analysis */}
        {onOpenUmaWithQuery && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-400/30 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div>
              <strong className="text-emerald-950 dark:text-emerald-200 block">
                {t('gemology.askUmaTitle', 'अपनी जन्म कुंडली अनुसार सटीक रत्न जानना चाहते हैं?')}
              </strong>
              <span className="text-[11px] text-[#735133] dark:text-stone-300">
                {t('gemology.askUmaDesc', 'उमा AI से लग्न, महादशा व ग्रह बल के आधार पर अनुकूल रत्न परामर्श लें')}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                onOpenUmaWithQuery(
                  `मेरी जन्म कुंडली के आधार पर मेरे लिए कौन सा रत्न सबसे अधिक फलदायी रहेगा? क्या मैं ${t(selectedGem.nameKey, selectedGem.sanskritName)} धारण कर सकता हूँ?`
                )
              }
              className="px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
            >
              {t('gemology.askUmaBtn', 'उमा से पूछें →')}
            </button>
          </div>
        )}
      </div>
    </PremiumModuleLock>
  );
};
