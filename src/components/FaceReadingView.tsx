import React, { useState } from 'react';
import {
  generateFaceReadingAnalysis,
  FaceReadingResult,
} from '../services/spiritualModules';
import { useTranslation } from '../i18n';
import { Camera, Eye, Smile, Sparkles } from 'lucide-react';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface FaceReadingViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const FaceReadingView: React.FC<FaceReadingViewProps> = ({
  onOpenUmaWithQuery,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const [analysisResult, setAnalysisResult] = useState<FaceReadingResult>(() => generateFaceReadingAnalysis());
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const forehead = analysisResult.features.find((f) => f.partKey.includes('forehead')) || analysisResult.features[0];
  const eyes = analysisResult.features.find((f) => f.partKey.includes('eyes')) || analysisResult.features[1];
  const nose = analysisResult.features.find((f) => f.partKey.includes('nose')) || analysisResult.features[2];
  const lips = analysisResult.features.find((f) => f.partKey.includes('lips')) || analysisResult.features[3];
  const chin = analysisResult.features.find((f) => f.partKey.includes('chin')) || analysisResult.features[4];

  const slides: StorySlideItem[] = [
    // Slide 1: Face Overview
    {
      id: 'face-overview',
      title: 'सामुद्रिक मुखाकृति विज्ञान',
      subtitle: `${t(analysisResult.faceShapeKey, 'अंडाकार मुखाकृति')} • सात्त्विक आभा`,
      badge: 'सामुद्रिक शास्त्र',
      icon: '👤',
      voiceText: `सामुद्रिक मुखाकृति विज्ञान। आपका मुखाकृति स्वरूप उत्तम व संतुलित है।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm text-center my-auto space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-stone-950 shadow-md">
              <Smile className="w-6 h-6" />
            </div>

            <div className="text-sm font-black font-granth text-[#462B17]">
              मुखाकृति स्वरूप: {t(analysisResult.faceShapeKey, 'अंडाकार / संतुलित')}
            </div>

            <p className="text-xs text-[#5C3A21] font-medium leading-relaxed max-w-xs mx-auto">
              {t(analysisResult.faceShapeDescKey, 'संतुलित बुद्धि, धैर्य और आत्मसंयम का प्रतीक। निर्णय लेने में कुशल और सौम्य स्वभाव।')}
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAnalysisResult(generateFaceReadingAnalysis());
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#5C3A21] text-[#FAF2E4] text-xs font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>मुखाकृति पुनः विश्लेषण</span>
            </button>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            महर्षि गर्ग व वराहमिहिर कृत सामुद्रिक लक्षण शास्त्र
          </div>
        </div>
      ),
    },

    // Slide 2: Forehead, Eyes & Nose
    {
      id: 'forehead-eyes-nose',
      title: 'ललाट (माथा), नेत्र एवं नासिका लक्षण',
      subtitle: 'बुद्धि, अंतर्दृष्टि एवं धन भाव',
      badge: 'ऊर्ध्व भाग',
      icon: '👁️',
      voiceText: 'ललाट, नेत्र और नासिका के सामुद्रिक लक्षण।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300">
              <div className="font-bold text-amber-950">🌟 ललाट (Forehead): {t(forehead?.typeKey, 'उन्नत एवं चौड़ा')}</div>
              <p className="text-[10px] text-amber-900 mt-0.5">{t(forehead?.traitsKey, 'तीक्ष्ण स्मरणशक्ति, दूरगामी सोच व नेतृत्व क्षमता।')}</p>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
              <div className="font-bold text-sky-950 flex items-center gap-1">
                <Eye className="w-3 h-3 text-sky-600" />
                <span>नेत्र (Eyes): {t(eyes?.typeKey, 'तेजस्वी व सौम्य')}</span>
              </div>
              <p className="text-[10px] text-sky-900 mt-0.5">{t(eyes?.traitsKey, 'सहानुभूति, गहरी अंतर्दृष्टि एवं सत्यनिष्ठा।')}</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="font-bold text-emerald-950">👃 नासिका (Nose): {t(nose?.typeKey, 'सरल एवं उन्नत')}</div>
              <p className="text-[10px] text-emerald-900 mt-0.5">{t(nose?.traitsKey, 'स्वाभिमान, आर्थिक समृद्धि व दृढ संकल्प।')}</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            उन्नत ललाट और चमकीले नेत्र सौभाग्य के सूचक हैं।
          </div>
        </div>
      ),
    },

    // Slide 3: Lips & Chin
    {
      id: 'lips-chin',
      title: 'ओष्ठ (होंठ), चिबुक (ठोड़ी) व कान लक्षण',
      subtitle: 'वाणी, निर्णय शक्ति एवं दीर्घायु',
      badge: 'निम्न भाग',
      icon: '✨',
      voiceText: 'ओष्ठ और ठोड़ी के लक्षण और भविष्य संकेत।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-1.5">
          <div className="space-y-1.5 my-auto text-xs">
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <div className="font-bold text-rose-950">👄 ओष्ठ लक्षण (Lips): {t(lips?.typeKey, 'सुगठित व मधुर')}</div>
              <p className="text-[11px] text-rose-900 mt-0.5">{t(lips?.traitsKey, 'मधुर वाणी, कलाप्रियता व सम्मोहन क्षमता।')}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="font-bold text-amber-950">🎯 चिबुक लक्षण (Chin): {t(chin?.typeKey, 'दृढ़ व सुडौल')}</div>
              <p className="text-[11px] text-amber-900 mt-0.5">{t(chin?.traitsKey, 'दृढ़ इच्छाशक्ति, अनुशासन एवं स्थिरता।')}</p>
            </div>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            सूक्ष्म मुख लक्षण विश्लेषण हेतु 'उमा परामर्श' प्राप्त करें।
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
      headerTitle="सामुद्रिक मुखाकृति (Face Reading)"
      headerIcon="👤"
      chapterNumber={18}
      onOpenUma={onOpenUmaWithQuery ? () => onOpenUmaWithQuery('मेरी मुखाकृति के अनुसार व्यक्तित्व व भाग्य') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
    />
  );
};
export default FaceReadingView;
