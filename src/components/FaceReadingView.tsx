import React, { useState } from 'react';
import {
  captureSpiritualScanPhoto,
  generateFaceReadingAnalysis,
  FaceReadingResult,
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
  Eye,
  Smile,
  Shield,
  Activity,
  User,
} from 'lucide-react';

interface FaceReadingViewProps {
  onOpenUmaWithQuery?: (query: string) => void;
}

export const FaceReadingView: React.FC<FaceReadingViewProps> = ({ onOpenUmaWithQuery }) => {
  const { t } = useTranslation();

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'analyzed'>('idle');
  const [capturedImage, setCapturedImage] = useState<CapturedImageResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FaceReadingResult | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);

  const handleStartFaceScan = async () => {
    setScanState('scanning');
    setScanProgress(20);

    // Call Capacitor Camera hardware integration helper
    const captured = await captureSpiritualScanPhoto('face');
    setCapturedImage(captured);

    let progress = 20;
    const interval = setInterval(() => {
      progress = Math.min(100, progress + 20);
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setAnalysisResult(generateFaceReadingAnalysis());
        setScanState('analyzed');
      }
    }, 400);
  };

  const handleResetScan = () => {
    setScanState('idle');
    setCapturedImage(null);
    setAnalysisResult(null);
    setScanProgress(0);
  };

  const handleShareResult = () => {
    if (!analysisResult) return;
    const shareText = `👤 *${t('faceReading.title', 'सामुद्रिक मुख लक्षण शास्त्र (Face Reading)')}*
✨ *${t('faceReading.faceShapeTitle', 'मुख आकृति:')}* ${t(analysisResult.faceShapeKey, 'अंडाकार मुख')}
⭐ *${t('faceReading.vitalityTitle', 'प्राण ऊर्जा व ओजस स्कोर:')}* ${analysisResult.vitalityScore}/100

📜 *${t('faceReading.featuresHeading', 'प्रमुख मुख लक्षण फलादेश:')}*
• ${analysisResult.features.map((f) => `${t(f.partKey, 'अंग')}: ${t(f.traitsKey, 'लक्षण')}`).join('\n• ')}

📲 *${t('app.name', 'सनातन शक्ति पंचांग')}*`;
    openWhatsAppShare(shareText);
  };

  return (
    <PremiumModuleLock
      moduleId="face_reading"
      titleKey="faceReading.lockTitle"
      descKey="faceReading.lockDesc"
      featureKeys={[
        'faceReading.feature1',
        'faceReading.feature2',
        'faceReading.feature3',
        'faceReading.feature4',
      ]}
    >
      <div className="w-full space-y-4 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#5C3A21] via-[#8C6239] to-[#5C3A21] text-[#FAF2E4] shadow-md border border-[#FFD88A]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD88A]/20 text-[#FFD88A] border border-[#FFD88A]/40 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-[#FFD88A]" />
                  <span>{t('faceReading.badge', 'Samudrika Shastra Facial Analysis')}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-granth text-[#FFD88A]">
                {t('faceReading.title', 'सामुद्रिक मुख लक्षण शास्त्र (Face Reading)')}
              </h2>
              <p className="text-xs text-[#FAF2E4]/90 mt-0.5 max-w-xl">
                {t('faceReading.subtitle', 'ललाट, नयन, नासिका, ओष्ठ व चिबुक के आधार पर व्यक्तित्व, स्वभाव व भाग्य विचार')}
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
                  <span>{t('faceReading.rescanBtn', 'नया स्कैन')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Camera Scanner Trigger Area */}
        {scanState === 'idle' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs text-center space-y-4">
            <div
              onClick={handleStartFaceScan}
              className="w-full aspect-4/3 max-w-sm mx-auto rounded-3xl bg-[#FAF5ED] dark:bg-[#1E0F07] border-2 border-dashed border-[#B56A00]/50 hover:border-[#B56A00] flex flex-col items-center justify-center p-6 text-center transition cursor-pointer group hover:bg-[#F5EAD8] dark:hover:bg-[#281309] relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-3xl bg-[#5C3A21] text-[#FFD88A] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                {t('faceReading.scanPromptTitle', 'चेहरे को कैमरे के सामने रखें')}
              </h3>
              <p className="text-xs text-[#735133] dark:text-stone-300 mt-1 max-w-xs">
                {t('faceReading.scanPromptDesc', 'सीधे प्रकाश में बिना चश्मे के अपना मुख स्कैन करने के लिए टैप करें')}
              </p>
              <span className="mt-3 px-4 py-1.5 rounded-full bg-[#B56A00] text-white text-xs font-bold shadow-xs">
                {t('faceReading.startScanBtn', '📸 मुख स्कैन शुरू करें')}
              </span>
            </div>
          </div>
        )}

        {/* Scanning In Progress State */}
        {scanState === 'scanning' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/25 shadow-xs text-center space-y-4">
            <div className="relative w-64 h-72 mx-auto rounded-3xl overflow-hidden border-2 border-amber-500 shadow-xl bg-black">
              {capturedImage && (
                <img
                  src={capturedImage.imageUrl}
                  alt="Scanning Face"
                  className="w-full h-full object-cover opacity-85"
                />
              )}
              {/* Oval face guide overlay */}
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-amber-400 pointer-events-none animate-pulse" />
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#F59E0B] top-1/2 -translate-y-1/2" />
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#5C3A21] dark:text-[#FFD88A]">
                <span>{t('faceReading.processingZone', 'ललाट, नयन व नासिका लक्षण विश्लेषण...')}</span>
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
            {/* Summary Highlight Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#FAF2E4] to-[#FBF0DD] dark:bg-[#2A1508] border border-[#B56A00]/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#5C3A21] text-[#FFD88A] flex items-center justify-center text-2xl font-black shadow-xs">
                  👤
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C4A00] uppercase tracking-wider block">
                    {t('faceReading.faceShapeTitle', 'मुख मंडल आकृति')}
                  </span>
                  <h3 className="text-base font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A]">
                    {t(analysisResult.faceShapeKey, 'अंडाकार मुख (Oval Face)')}
                  </h3>
                  <p className="text-xs text-[#735133] dark:text-stone-300">
                    {t(analysisResult.faceShapeDescKey, 'संतुलित बुद्धि, न्यायप्रियता व सामाजिक प्रतिष्ठा')}
                  </p>
                </div>
              </div>

              <div className="text-right self-stretch sm:self-center border-t sm:border-t-0 sm:border-l border-[#8C6239]/20 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[10px] font-bold text-[#8C6239] uppercase tracking-wider block">
                  {t('faceReading.vitalityTitle', 'प्राण ऊर्जा व ओजस')}
                </span>
                <span className="text-2xl font-black text-[#5C3A21] dark:text-[#FFD88A]">
                  {analysisResult.vitalityScore}/100
                </span>
              </div>
            </div>

            {/* Facial Features Deep Breakdown */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold font-granth text-[#5C3A21] dark:text-[#FFD88A] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>{t('faceReading.featuresHeading', 'मुख अंगों का सामुद्रिक फलादेश')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisResult.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#2A1508]/80 border border-[#8C6239]/20 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-[#5C3A21] dark:text-[#FFD88A] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                        <span>{t(feat.partKey, 'अंग')}</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                        {t(feat.typeKey, 'शुभ लक्षण')}
                      </span>
                    </div>

                    <p className="text-xs text-[#735133] dark:text-stone-300 leading-relaxed">
                      {t(feat.traitsKey, 'तीव्र स्मरण शक्ति व उच्च बौद्धिक क्षमता का प्रमाण')}
                    </p>

                    <div className="p-2 rounded-xl bg-[#FAF5ED] dark:bg-[#1E0F07] border border-[#8C6239]/15 text-[11px] text-[#8C6239] leading-relaxed">
                      <strong>{t('faceReading.scripturalRule', 'सामुद्रिक वचन:')}</strong>{' '}
                      {t(feat.samudrikaWisdomKey, 'विशाल ललाट धन, विद्या व दीर्घायु का सूचक होता है।')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Uma Facial Consultation */}
            {onOpenUmaWithQuery && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <strong className="text-[#5C3A21] dark:text-[#FFD88A] block">
                    {t('faceReading.askUmaTitle', 'मुख लक्षणों के आधार पर उपाय व परामर्श?')}
                  </strong>
                  <span className="text-[11px] text-[#735133] dark:text-stone-300">
                    {t('faceReading.askUmaDesc', 'उमा AI से अपने व्यक्तित्व संवर्धन व सकारात्मक प्रभाव बढ़ाने के उपाय पूछें')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenUmaWithQuery(
                      'सामुद्रिक मुख लक्षण शास्त्र के अनुसार मेरे चेहरे के लक्षणों के आधार पर मुझे अपने भाग्य और एकाग्रता को बढ़ाने के लिए कौन से सात्विक उपाय करने चाहिए?'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                >
                  {t('faceReading.askUmaBtn', 'उमा से पूछें →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PremiumModuleLock>
  );
};
