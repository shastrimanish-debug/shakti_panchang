import React, { useState } from 'react';
import {
  captureSpiritualScanPhoto,
  generatePalmAnalysis,
  PalmScanAnalysisResult,
  CapturedImageResult,
} from '../services/spiritualModules';
import { PremiumModuleLock } from './PremiumModuleLock';
import { useTranslation } from '../i18n';
import { openWhatsAppShare } from '../services/umaConsultationPdf';
import {
  Camera,
  Sparkles,
  RefreshCw,
  Share2,
  CheckCircle,
  Shield,
  Hand,
  Activity,
  Layers,
  Heart,
  Brain,
  Zap,
} from 'lucide-react';

interface PalmistryViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
}

export const PalmistryView: React.FC<PalmistryViewProps> = ({ onOpenUmaWithQuery }) => {
  const { t } = useTranslation();

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'analyzed'>('idle');
  const [capturedImage, setCapturedImage] = useState<CapturedImageResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PalmScanAnalysisResult | null>(null);
  const [selectedHand, setSelectedHand] = useState<'right' | 'left'>('right');
  const [scanProgress, setScanProgress] = useState<number>(0);

  const handleStartPalmScan = async () => {
    setScanState('scanning');
    setScanProgress(15);

    // Call Capacitor Camera hardware integration helper
    const captured = await captureSpiritualScanPhoto('palm');
    setCapturedImage(captured);

    // Simulate progressive computer-vision line detection
    let progress = 15;
    const interval = setInterval(() => {
      progress = Math.min(100, progress + 25);
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setAnalysisResult(generatePalmAnalysis(selectedHand));
        setScanState('analyzed');
      }
    }, 450);
  };

  const handleResetScan = () => {
    setScanState('idle');
    setCapturedImage(null);
    setAnalysisResult(null);
    setScanProgress(0);
  };

  const handleShareResult = () => {
    if (!analysisResult) return;
    const shareText = `✋ *${t('palmistry.title', 'वैदिक हस्तरेखा विश्लेषण (Palmistry Report)')}*
✨ *${t('palmistry.handShapeTitle', 'हस्त प्रकार:')}* ${t(analysisResult.handShapeDescKey, 'पार्थिव हस्त (Earth Hand)')}
⭐ *${t('palmistry.fortuneScoreTitle', 'हस्तरेखा भाग्य स्कोर:')}* ${analysisResult.fortuneScore}/100

📜 *${t('palmistry.keyLinesHeading', 'प्रमुख रेखाएं:')}*
• ${analysisResult.lines.map((l) => `${l.sanskritName}: ${t(l.qualityKey, 'सुस्पष्ट व दीर्घ')}`).join('\n• ')}

📲 *${t('app.name', 'सनातन शक्ति पंचांग')}*`;
    openWhatsAppShare(shareText);
  };

  return (
    <PremiumModuleLock
      moduleId="palmistry"
      titleKey="palmistry.lockTitle"
      descKey="palmistry.lockDesc"
      featureKeys={[
        'palmistry.feature1',
        'palmistry.feature2',
        'palmistry.feature3',
        'palmistry.feature4',
      ]}
    >
      <div className="w-full space-y-4 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD88A]/20 text-[#FFD88A] border border-[#FFD88A]/40 uppercase tracking-wider flex items-center gap-1">
                  <Hand className="w-3 h-3 text-[#FFD88A]" />
                  <span>{t('palmistry.badge', 'AI Palmistry & Samudrika Shastra')}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-granth text-[#FFD88A]">
                {t('palmistry.title', 'वैदिक हस्तरेखा विज्ञान (Palmistry)')}
              </h2>
              <p className="text-xs text-[#FAF2E4]/90 mt-0.5 max-w-xl">
                {t('palmistry.subtitle', 'जीवन, मस्तिष्क, हृदय, भाग्य व सूर्य रेखाओं का सम्पूर्ण शास्त्रीय विश्लेषण')}
              </p>
            </div>

            {analysisResult && (
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleShareResult}
                  className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('common.share', 'शेयर')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('palmistry.rescanBtn', 'नया स्कैन')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hand Selector & Scanner Stage */}
        {scanState === 'idle' && (
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs text-center space-y-4">
            <div className="max-w-md mx-auto space-y-3">
              <div className="flex justify-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedHand('right')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    selectedHand === 'right'
                      ? 'bg-[#5C3A21] text-white shadow-xs'
                      : 'bg-[#FAF5ED] dark:bg-stone-800 text-[#5C3A21] dark:text-stone-300 border border-[#8C6239]/30'
                  }`}
                >
                  {t('palmistry.rightHand', 'दाहिना हाथ (कर्म हाथ / Right Hand)')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedHand('left')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    selectedHand === 'left'
                      ? 'bg-[#5C3A21] text-white shadow-xs'
                      : 'bg-[#FAF5ED] dark:bg-stone-800 text-[#5C3A21] dark:text-stone-300 border border-[#8C6239]/30'
                  }`}
                >
                  {t('palmistry.leftHand', 'बायां हाथ (प्रारब्ध हाथ / Left Hand)')}
                </button>
              </div>

              {/* Camera Scanner Trigger Area */}
              <div
                onClick={handleStartPalmScan}
                className="w-full aspect-4/3 max-w-sm mx-auto rounded-3xl bg-[#FAF5ED] dark:bg-[#1E0F07] border-2 border-dashed border-[#B56A00]/50 hover:border-[#B56A00] flex flex-col items-center justify-center p-6 text-center transition cursor-pointer group hover:bg-[#F5EAD8] dark:hover:bg-[#281309] relative overflow-hidden"
              >
                <div className="w-16 h-16 rounded-3xl bg-[#5C3A21] text-[#FFD88A] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mb-3">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                  {t('palmistry.scanPromptTitle', 'हथेली को कैमरे के सामने रखें')}
                </h3>
                <p className="text-xs text-[#735133] dark:text-stone-300 mt-1 max-w-xs">
                  {t('palmistry.scanPromptDesc', 'अच्छी रोशनी में अपनी पूरी हथेली को स्पष्ट रूप से स्कैन करने के लिए टैप करें')}
                </p>
                <span className="mt-3 px-4 py-1.5 rounded-full bg-[#B56A00] text-white text-xs font-bold shadow-xs">
                  {t('palmistry.startScanBtn', '📸 हथेली स्कैन शुरू करें')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scanning In Progress State */}
        {scanState === 'scanning' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs text-center space-y-4">
            <div className="relative w-64 h-72 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500 shadow-xl bg-black">
              {capturedImage && (
                <img
                  src={capturedImage.imageUrl}
                  alt="Scanning Palm"
                  className="w-full h-full object-cover opacity-80"
                />
              )}
              {/* Laser scanning beam animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#F59E0B] animate-pulse top-1/2 -translate-y-1/2" />
              <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                <span>{t('palmistry.detectingLines', 'हस्तरेखाओं व पर्वतों की पहचान जारी...')}</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analyzed Result View */}
        {scanState === 'analyzed' && analysisResult && (
          <div className="space-y-4">
            {/* Quick Summary Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FAF2E4] to-[#FBF0DD] dark:bg-[#2A1508] border border-[#B56A00]/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#5C3A21] text-[#FFD88A] flex items-center justify-center text-2xl font-black shadow-xs">
                  ✋
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C4A00] uppercase tracking-wider block">
                    {t('palmistry.handShapeTitle', 'हस्त प्रकार एवं तत्व')}
                  </span>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {t(analysisResult.handShapeDescKey, 'पार्थिव हस्त (Earth Hand) — स्थिरता व कर्मठता')}
                  </h3>
                  <p className="text-xs text-[#735133] dark:text-stone-300">
                    {selectedHand === 'right' ? t('palmistry.rightHandActive', 'सक्रिय कर्म हाथ') : t('palmistry.leftHandPassive', 'आंतरिक प्रारब्ध हाथ')}
                  </p>
                </div>
              </div>

              <div className="text-right self-stretch sm:self-center border-t sm:border-t-0 sm:border-l border-[#8C6239]/20 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                  {t('palmistry.fortuneScoreTitle', 'हस्तरेखा भाग्य स्कोर')}
                </span>
                <span className="text-2xl font-black text-[#5C3A21] dark:text-[#FFD88A]">
                  {analysisResult.fortuneScore}/100
                </span>
              </div>
            </div>

            {/* Major Lines Breakdown */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>{t('palmistry.majorLinesHeading', 'प्रमुख हस्तरेखाओं का विस्तृत फलादेश')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisResult.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/20 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                        <span>{t(line.nameKey, line.sanskritName)}</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {t(line.qualityKey, 'सुस्पष्ट व दीर्घ')}
                      </span>
                    </div>

                    <p className="text-xs text-[#735133] dark:text-stone-300 leading-relaxed">
                      {t(line.interpretationKey, 'यह रेखा उत्तम स्वास्थ्य, दीर्घायु एवं दृढ़ जीवन शक्ति का संकेत देती है।')}
                    </p>

                    <div className="pt-1.5 border-t border-[#8C6239]/15 flex items-center justify-between text-[11px] text-[#8C6239]">
                      <span>{t('palmistry.mountLink', 'संबद्ध पर्वत:')} {line.mountAffinity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planetary Mounts (हस्त पर्वत) */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/20 shadow-xs space-y-3">
              <h3 className="text-sm font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>{t('palmistry.mountsHeading', 'हथेली के प्रमुख पर्वत (Planetary Mounts)')}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {analysisResult.mounts.map((m, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#5C3A21] dark:text-stone-200">{t(m.mountKey, m.planet)}</span>
                      <span className="text-[10px] font-black text-amber-700">{m.strength}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                      <div className="h-full bg-amber-600 rounded-full" style={{ width: `${m.strength}%` }} />
                    </div>
                    <p className="text-[10px] text-[#735133] dark:text-stone-400 mt-1">
                      {t(m.influenceKey, 'उच्च प्रभाव व शुभ कारक')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Uma Consultation Advice */}
            {onOpenUmaWithQuery && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs">
                  <strong className="text-[#5C3A21] dark:text-[#FFD88A] block">
                    {t('palmistry.askUmaTitle', 'हस्तरेखा दोष निवारण व उपाय परामर्श')}
                  </strong>
                  <span className="text-[11px] text-[#735133] dark:text-stone-300">
                    {t('palmistry.askUmaDesc', 'उमा AI से अपनी रेखाओं के आधार पर व्यक्तिगत रत्न व मंत्र पूछें')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenUmaWithQuery(
                      'मेरी हस्तरेखा स्कैन के अनुसार मेरी भाग्य रेखा और सूर्य रेखा को प्रबल करने के सर्वोत्तम वैदिक उपाय बताएं।'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                >
                  {t('palmistry.askUmaBtn', 'उमा से पूछें →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PremiumModuleLock>
  );
};
