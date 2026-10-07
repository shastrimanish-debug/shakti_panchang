import React, { useState } from 'react';
import {
  captureSpiritualScanPhoto,
  generatePalmAnalysis,
  PalmScanAnalysisResult,
} from '../services/spiritualModules';
import { useTranslation } from '../i18n';
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

  const slides: StorySlideItem[] = [
    // Slide 1: Scanner / Hand Overview
    {
      id: 'scan-overview',
      title: 'सामुद्रिक हस्तरेखा शास्त्र',
      subtitle: `${selectedHand === 'right' ? 'दक्षिण (दाहिना)' : 'वाम (बायां)'} हस्त विश्लेषण`,
      badge: 'सामुद्रिक विज्ञान',
      icon: '✋',
      voiceText: 'सामुद्रिक हस्तरेखा शास्त्र। अपनी हथेली की मुख्य रेखाओं का फल देखें।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm text-center my-auto space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 shadow-md">
              <Hand className="w-6 h-6" />
            </div>

            <div className="text-sm font-black font-granth text-[#462B17]">
              सामुद्रिक हस्तरेखा विश्लेषण
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
                दाहिना हाथ (पुरुष/कर्म)
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
                बायां हाथ (स्त्री/प्रारब्ध)
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
              <span>हथेली स्कैन / पुनः विश्लेषण</span>
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
      title: 'जीवन, मस्तिष्क एवं हृदय रेखा',
      subtitle: 'आयु, विद्या व भावनात्मक संतुलन',
      badge: 'त्रिवेणी रेखा',
      icon: '🧬',
      voiceText: 'जीवन रेखा, मस्तिष्क रेखा और हृदय रेखा का फलित।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-600" />
                <span>{heartLine?.sanskritName || 'हृदय रेखा'}: {t(heartLine?.qualityKey, 'स्पष्ट व सबल')}</span>
              </div>
              <p className="text-[10px] text-rose-900 mt-0.5">{t(heartLine?.interpretationKey, 'सहानुभूति व भावनात्मक स्थिरता का सूचक।')}</p>
            </div>

            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-sky-600" />
                <span>{headLine?.sanskritName || 'मस्तिष्क रेखा'}: {t(headLine?.qualityKey, 'दीर्घ व स्पष्ट')}</span>
              </div>
              <p className="text-[10px] text-sky-900 mt-0.5">{t(headLine?.interpretationKey, 'तीक्ष्ण बुद्धि, निर्णय क्षमता व दूरदर्शिता।')}</p>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lifeLine?.sanskritName || 'जीवन रेखा'}: {t(lifeLine?.qualityKey, 'सुदृढ़ एवं अक्षुण्ण')}</span>
              </div>
              <p className="text-[10px] text-emerald-900 mt-0.5">{t(lifeLine?.interpretationKey, 'उत्तम आरोग्य, प्राणशक्ति एवं दीर्घायु का वरदान।')}</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            स्पष्ट व निर्दोष रेखाएं जातक को दीर्घायु व सफलता प्रदान करती हैं।
          </div>
        </div>
      ),
    },

    // Slide 3: Fate Line & Mounts
    {
      id: 'fate-sun-line',
      title: 'भाग्य रेखा एवं प्रमुख पर्वत',
      subtitle: 'आजीविका, पदोन्नति एवं मान-सम्मान',
      badge: 'राजयोग रेखा',
      icon: '👑',
      voiceText: 'भाग्य रेखा और पर्वतों का विश्लेषण।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-2 my-auto text-xs">
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300">
              <div className="font-bold text-[#5C3A21] flex items-center gap-1 text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>{fateLine?.sanskritName || 'भाग्य रेखा'}: {t(fateLine?.qualityKey, 'सक्रिय')}</span>
              </div>
              <p className="text-[11px] text-[#6E472A] mt-1 leading-snug">
                {t(fateLine?.interpretationKey, 'स्वावलम्बन से भाग्य निर्माण एवं निरंतर कार्य सिद्धि।')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100/70 to-yellow-50 border border-amber-300">
              <div className="font-bold text-amber-950 flex items-center gap-1 text-xs">
                <span>हथेली के प्रमुख पर्वत</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {analysisResult.mounts.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="p-1.5 rounded-lg bg-white/80 border border-amber-200">
                    <div className="font-bold text-[10px] text-[#5C3A21]">{m.planet}</div>
                    <div className="text-[9px] text-[#735133]">बल: {m.strength}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            शनि व सूर्य पर्वत की शुभता से समाज में प्रतिष्ठा प्राप्त होती है।
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
      headerTitle="सामुद्रिक हस्तरेखा शास्त्र"
      headerIcon="✋"
      chapterNumber={11}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery('हस्तरेखा फलित एवं सामुद्रिक परामर्श') : undefined}
    />
  );
};
export default PalmistryView;
