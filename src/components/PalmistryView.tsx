import React, { useState } from 'react';
import {
  captureSpiritualScanPhoto,
  generatePalmAnalysis,
  PalmScanAnalysisResult,
  CapturedImageResult,
} from '../services/spiritualModules';
import { useTranslation } from '../i18n';
import {
  Camera,
  Sparkles,
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
    const captured = await captureSpiritualScanPhoto('palm');
    setAnalysisResult(generatePalmAnalysis(selectedHand));
  };

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
                <span>हृदय रेखा (Heart Line): {analysisResult.heartLine.strength}</span>
              </div>
              <p className="text-[10px] text-rose-900 mt-0.5">{analysisResult.heartLine.prediction}</p>
            </div>

            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-sky-600" />
                <span>मस्तिष्क रेखा (Head Line): {analysisResult.headLine.strength}</span>
              </div>
              <p className="text-[10px] text-sky-900 mt-0.5">{analysisResult.headLine.prediction}</p>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>जीवन रेखा (Life Line): {analysisResult.lifeLine.strength}</span>
              </div>
              <p className="text-[10px] text-emerald-900 mt-0.5">{analysisResult.lifeLine.prediction}</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            स्पष्ट व निर्दोष रेखाएं जातक को दीर्घायु व सफलता प्रदान करती हैं।
          </div>
        </div>
      ),
    },

    // Slide 3: Fate Line & Sun Line
    {
      id: 'fate-sun-line',
      title: 'भाग्य रेखा एवं सूर्य रेखा (यश-कीर्ति)',
      subtitle: 'आजीविका, पदोन्नति एवं मान-सम्मान',
      badge: 'राजयोग रेखा',
      icon: '👑',
      voiceText: 'भाग्य रेखा और सूर्य रेखा का विश्लेषण।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-2 my-auto text-xs">
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300">
              <div className="font-bold text-[#5C3A21] flex items-center gap-1 text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>भाग्य रेखा (Fate Line): {analysisResult.fateLine.strength}</span>
              </div>
              <p className="text-[11px] text-[#6E472A] mt-1 leading-snug">
                {analysisResult.fateLine.prediction}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100/70 to-yellow-50 border border-amber-300">
              <div className="font-bold text-amber-950 flex items-center gap-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>सूर्य रेखा एवं विशिष्ट योग</span>
              </div>
              <p className="text-[11px] text-[#462B17] mt-1 leading-snug">
                हथेली में मत्स्य, त्रिशूल या पद्म चिह्न की उपस्थिति जातक को उच्च सामाजिक प्रतिष्ठा व आकस्मिक धन लाभ दिलाती है।
              </p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            हस्तरेखा की विस्तृत सूक्ष्म रीडिंग हेतु 'उमा परामर्श' लें।
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
      headerTitle="हस्तरेखा शास्त्र (Palmistry)"
      headerIcon="✋"
      chapterNumber={15}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery('मेरी हस्तरेखा का सम्पूर्ण फलित') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="अंकशास्त्र"
      nextChapterLabel="टैरो कार्ड"
    />
  );
};
export default PalmistryView;
