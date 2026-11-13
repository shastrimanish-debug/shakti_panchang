import React, { useState } from 'react';
import {
  captureSpiritualScanPhoto,
  generatePalmAnalysis,
  PalmScanAnalysisResult,
} from '../services/spiritualModules';
import { useTranslation, useLanguage } from '../i18n';
import { trVedic } from '../i18n/vedicTranslate';
import {
  Camera,
  Hand,
  Activity,
  Heart,
  Brain,
  Zap,
} from 'lucide-react';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface PalmistryViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const PalmistryView: React.FC<PalmistryViewProps> = ({
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const cLang = (language || 'hi').slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === 'en' ? en : cLang === 'gu' ? gu : hi);

  const [selectedHand, setSelectedHand] = useState<'right' | 'left'>('right');
  const [analysisResult, setAnalysisResult] = useState<PalmScanAnalysisResult>(() => generatePalmAnalysis('right'));
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const handleStartScan = async () => {
    await captureSpiritualScanPhoto('palm');
    setAnalysisResult(generatePalmAnalysis(selectedHand));
  };

  const lifeLine = analysisResult.lines.find((l) => l.nameKey.includes('life')) || analysisResult.lines[0];
  const heartLine = analysisResult.lines.find((l) => l.nameKey.includes('heart')) || analysisResult.lines[1];
  const headLine = analysisResult.lines.find((l) => l.nameKey.includes('head')) || analysisResult.lines[2];
  const fateLine = analysisResult.lines.find((l) => l.nameKey.includes('fate')) || analysisResult.lines[3];

  const getMountLabel = (planetStr: string) => {
    const pBase = planetStr.split(' ')[0];
    return L(planetStr, `${trVedic(pBase, 'en')} Mount`, `${trVedic(pBase, 'gu')} પર્વત`);
  };

  const slides: StorySlideItem[] = [
    // Slide 1: Scanner / Hand Overview
    {
      id: 'scan-overview',
      title: L('सामुद्रिक हस्तरेखा शास्त्र', 'Samudrik Palmistry Shastra', 'સામુદ્રિક હસ્તરેખા શાસ્ત્ર'),
      subtitle: `${selectedHand === 'right' ? L('दक्षिण (दाहिना)', 'Right Hand', 'જમણો') : L('वाम (बायां)', 'Left Hand', 'ડાબો')} ${L('हस्त विश्लेषण', 'Palm Analysis', 'હસ્ત વિશ્લેષણ')}`,
      badge: L('सामुद्रिक विज्ञान', 'Samudrik Shastra', 'સામુદ્રિક વિજ્ઞાન'),
      icon: '✋',
      voiceText: L(
        'सामुद्रिक हस्तरेखा शास्त्र। अपनी हथेली की मुख्य रेखाओं का फल देखें।',
        'Samudrik Palmistry Shastra. View predictions for the major lines on your palm.',
        'સામુદ્રિક હસ્તરેખા શાસ્ત્ર. તમારી હથેળીની મુખ્ય રેખાઓનું ફળ જુઓ.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm text-center my-auto space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 shadow-md">
              <Hand className="w-6 h-6" />
            </div>

            <div className="text-sm font-black font-granth text-[#462B17]">
              {L('सामुद्रिक हस्तरेखा विश्लेषण', 'Samudrik Palmistry Analysis', 'સામુદ્રિક હસ્તરેખા વિશ્લેષણ')}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHand('right');
                  setAnalysisResult(generatePalmAnalysis('right'));
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedHand === 'right'
                    ? 'bg-[#5C3A21] text-white shadow-xs'
                    : 'bg-white text-[#5C3A21] border border-amber-300'
                }`}
              >
                {L('दाहिना हाथ (पुरुष/कर्म)', 'Right Palm (Karma/Active)', 'જમણો હાથ (કર્મ)')}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHand('left');
                  setAnalysisResult(generatePalmAnalysis('left'));
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedHand === 'left'
                    ? 'bg-[#5C3A21] text-white shadow-xs'
                    : 'bg-white text-[#5C3A21] border border-amber-300'
                }`}
              >
                {L('बायां हाथ (स्त्री/प्रारब्ध)', 'Left Palm (Prarabdha/Past)', 'ડાબો હાથ (પ્રારબ્ધ)')}
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartScan();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 text-xs font-black transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{L('हथेली स्कैन / पुनः विश्लेषण', 'Scan Palm / Re-analyze', 'હથેળી સ્કેન / ફરી વિશ્લેષણ')}</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती • करमूले तु गोविन्दः
          </div>
        </div>
      ),
    },

    // Slide 2: Three Main Lines (Heart, Head, Life)
    {
      id: 'main-lines',
      title: L('जीवन, मस्तिष्क एवं हृदय रेखा', 'Life, Head & Heart Lines', 'જીવન, મસ્તિષ્ક અને હૃદય રેખા'),
      subtitle: L('आयु, विद्या व भावनात्मक संतुलन', 'Longevity, Intellect & Emotional Balance', 'આયુષ્ય, વિદ્યા અને ભાવનાત્મક સંતુલન'),
      badge: L('त्रिवेणी रेखा', 'Three Core Lines', 'ત્રિવેણી રેખા'),
      icon: '🧬',
      voiceText: L(
        'जीवन रेखा, मस्तिष्क रेखा और हृदय रेखा का फलित।',
        'Interpretation of Life Line, Head Line, and Heart Line.',
        'જીવન રેખા, મસ્તિષ્ક રેખા અને હૃદય રેખાનું ફળ.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <span>
                  {L('हृदय रेखा', 'Heart Line', 'હૃદય રેખા')}: {t(heartLine?.qualityKey, L('स्पष्ट व सबल', 'Clear & Strong', 'સ્પષ્ટ અને સબળ'))}
                </span>
              </div>
              <p className="text-[10px] text-rose-900 mt-0.5">
                {t(heartLine?.interpretationKey, L('सहानुभूति व भावनात्मक स्थिरता का सूचक।', 'Indicates empathy, warmth, and emotional stability.', 'સહાનુભૂતિ અને ભાવનાત્મક સ્થિરતાનું સૂચક.'))}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  {L('मस्तिष्क रेखा', 'Head Line', 'મસ્તિષ્ક રેખા')}: {t(headLine?.qualityKey, L('दीर्घ व स्पष्ट', 'Long & Well-defined', 'દીર્ઘ અને સ્પષ્ટ'))}
                </span>
              </div>
              <p className="text-[10px] text-sky-900 mt-0.5">
                {t(headLine?.interpretationKey, L('तीक्ष्ण बुद्धि, निर्णय क्षमता व दूरदर्शिता।', 'Reflects sharp intellect, clarity of thought, and foresight.', 'તીક્ષ્ણ બુદ્ધિ, નિર્ણય ક્ષમતા અને દૂરદર્શિતા.'))}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {L('जीवन रेखा', 'Life Line', 'જીવન રેખા')}: {t(lifeLine?.qualityKey, L('सुदृढ़ एवं अक्षुण्ण', 'Deep & Unbroken', 'સુદૃઢ અને અખંડ'))}
                </span>
              </div>
              <p className="text-[10px] text-emerald-900 mt-0.5">
                {t(lifeLine?.interpretationKey, L('उत्तम आरोग्य, प्राणशक्ति एवं दीर्घायु का वरदान।', 'Signifies strong vitality, good health, and longevity.', 'ઉત્તમ આરોગ્ય, પ્રાણશક્તિ અને દીર્ઘાયુનું વરદાન.'))}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'स्पष्ट व निर्दोष रेखाएं जातक को दीर्घायु व सफलता प्रदान करती हैं।',
              'Clear, unbroken lines bless the native with longevity and steady success.',
              'સ્પષ્ટ અને નિર્દોષ રેખાઓ જાતકને દીર્ઘાયુ અને સફળતા પ્રદાન કરે છે.'
            )}
          </div>
        </div>
      ),
    },

    // Slide 3: Fate Line & Mounts
    {
      id: 'fate-sun-line',
      title: L('भाग्य रेखा एवं प्रमुख पर्वत', 'Fate Line & Major Mounts', 'ભાગ્ય રેખા અને મુખ્ય પર્વત'),
      subtitle: L('आजीविका, पदोन्नति एवं मान-सम्मान', 'Career, Growth & Social Honor', 'આજીવિકા, પ્રગતિ અને માન-સન્માન'),
      badge: L('राजयोग रेखा', 'Fortune Lines', 'રાજયોગ રેખા'),
      icon: '👑',
      voiceText: L(
        'भाग्य रेखा और पर्वतों का विश्लेषण।',
        'Analysis of the Fate Line and planetary mounts on the palm.',
        'ભાગ્ય રેખા અને પર્વતોનું વિશ્લેષણ.'
      ),
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-2 my-auto text-xs">
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300">
              <div className="font-bold text-[#5C3A21] flex items-center gap-1 text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {L('भाग्य रेखा', 'Fate Line', 'ભાગ્ય રેખા')}: {t(fateLine?.qualityKey, L('सक्रिय', 'Active', 'સક્રિય'))}
                </span>
              </div>
              <p className="text-[11px] text-[#6E472A] mt-1 leading-snug">
                {t(fateLine?.interpretationKey, L('स्वावलम्बन से भाग्य निर्माण एवं निरंतर कार्य सिद्धि।', 'Self-made fortune through dedication and steady progress.', 'સ્વાવલંબનથી ભાગ્ય નિર્માણ અને સતત કાર્ય સિદ્ધિ.'))}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100/70 to-yellow-50 border border-amber-300">
              <div className="font-bold text-amber-950 flex items-center gap-1 text-xs">
                <span>{L('हथेली के प्रमुख पर्वत', 'Major Planetary Mounts', 'હથેળીના મુખ્ય પર્વતો')}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {analysisResult.mounts.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="p-1.5 rounded-lg bg-white/80 border border-amber-200">
                    <div className="font-bold text-[10px] text-[#5C3A21]">{getMountLabel(m.planet)}</div>
                    <div className="text-[9px] text-[#735133]">{L('बल:', 'Strength:', 'બળ:')} {m.strength}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            {L(
              'शनि व सूर्य पर्वत की शुभता से समाज में प्रतिष्ठा प्राप्त होती है।',
              'Well-developed Mounts of Saturn and Sun bestow social honor and leadership.',
              'શનિ અને સૂર્ય પર્વતની શુભતાથી સમાજમાં પ્રતિષ્ઠા પ્રાપ્ત થાય છે.'
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
      headerTitle={t('nav.palmistry', L('सामुद्रिक हस्तरेखा शास्त्र', 'Samudrik Palmistry', 'સામુદ્રિક હસ્તરેખા શાસ્ત્ર'))}
      headerIcon="✋"
      chapterNumber={11}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery(L('हस्तरेखा फलित एवं सामुद्रिक परामर्श', 'Palmistry & Samudrik consultation', 'હસ્તરેખા ફળ અને સામુદ્રિક પરામર્શ')) : undefined}
    />
  );
};
export default PalmistryView;
