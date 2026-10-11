import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  Eye,
  Smile,
  CheckCircle2,
  RefreshCw,
  Volume2,
  VolumeX,
  Share2,
  HelpCircle,
  Zap,
  ShieldCheck,
  Flame,
  Award,
} from "lucide-react";
import { speakUma, stopUmaSpeech } from "../lib/umaSpeech";
import { openWhatsAppShare } from "../services/umaConsultationPdf";

interface FeatureDetail {
  part: string;
  type: string;
  traits: string;
  wisdom: string;
}

interface FaceAnalysisData {
  faceShape: string;
  faceShapeDesc: string;
  vitalityScore: number;
  temperament: string;
  features: FeatureDetail[];
  careerGuidance: string;
  remedy: string;
}

// Preset Face Types for immediate testing or simulated scanning
const PRESET_FACES = [
  {
    id: "oval_m",
    name: "अंडाकार मुखाकृति (पुरुष)",
    shape: "अंडाकार (Oval)",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "oval_f",
    name: "अंडाकार मुखाकृति (महिला)",
    shape: "अंडाकार (Oval)",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "square_m",
    name: "वर्गाकार मुखाकृति (दृढ़ इच्छाशक्ति)",
    shape: "वर्गाकार (Square)",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "round_f",
    name: "गोलाकार मुखाकृति (सौम्य स्वभाव)",
    shape: "गोलाकार (Round)",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
];

// Facial Moles Dataset (तिल फलादेश)
const FACE_MOLES = [
  {
    location: "ललाट के मध्य में (Center of Forehead)",
    meaning: "तीक्ष्ण बुद्धिमत्ता, उच्च पद प्रतिष्ठा एवं अकस्मात भाग्योदय का संकेत।",
    nature: "शुभ",
  },
  {
    location: "दाहिनी गाल पर (Right Cheek)",
    meaning: "व्यापारिक कुशलता, धन-समृद्धि एवं सुखी वैवाहिक जीवन का सूचक।",
    nature: "अति शुभ",
  },
  {
    location: "बाएँ गाल पर (Left Cheek)",
    meaning: "कलात्मक दृष्टिकोण, भावुकता तथा सीमित लेकिन सच्चे मित्र।",
    nature: "मध्यम",
  },
  {
    location: "ऊपरी होंठ पर (Upper Lip)",
    meaning: "मधुर सम्भाषण कला, आकर्षक व्यक्तित्व व भौतिक सुख-साधनों की प्राप्ति।",
    nature: "अति शुभ",
  },
  {
    location: "ठोड़ी पर (Chin)",
    meaning: "दृढ़ संकल्प शक्ति, यात्राओं का योग तथा वृद्धावस्था में अपार प्रतिष्ठा।",
    nature: "शुभ",
  },
  {
    location: "भौंह के मध्य में (Between Eyebrows - त्रिकुटी)",
    meaning: "गहरी अंतर्दृष्टि, आध्यात्मिक चेतना तथा समाज में उच्च नेतृत्व।",
    nature: "अति शुभ",
  },
  {
    location: "नासिका के अग्रभाग पर (Nose Tip)",
    meaning: "शीघ्र निर्णय क्षमता, स्वाभिमान तथा त्वरित धन लाभ की सम्भावना।",
    nature: "शुभ",
  },
];

export const FaceReadingView: React.FC<{
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onOpenUmaWithQuery }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(PRESET_FACES[0].imageUrl);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "destiny" | "moles" | "remedies">("overview");
  const [selectedMoleIndex, setSelectedMoleIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Vedic Analysis Result
  const [analysis, setAnalysis] = useState<FaceAnalysisData>({
    faceShape: "अंडाकार (Oval)",
    faceShapeDesc:
      "सामुद्रिक शास्त्र के अनुसार अंडाकार मुखाकृति उत्तम संतुलन, तीक्ष्ण बुद्धि और धैर्य की प्रतीक है। आप निर्णय लेने में कुशल, व्यवहारिक और सौम्य स्वभाव के धनी हैं। समाज में आपका आदर एवं यश निरंतर बढ़ता है।",
    vitalityScore: 94,
    temperament: "सात्त्विक व सांतुलित",
    careerGuidance:
      "प्रशासनिक सेवा, परामर्श, शिक्षा, सूचना प्रौद्योगिकी, बैंकिंग एवं रचनात्मक क्षेत्रों में सर्वोच्च सफलता प्राप्त होगी। आपकी तार्किक क्षमता दूसरों को प्रभावित करती है।",
    remedy:
      "प्रतिदिन सूर्य देव को अर्घ्य दें। ललाट पर चन्दन व कुंकुम का तिलक लगाएं। तर्जनी या अनामिका अंगुली में पीला पुखराज या माणिक्य धारण करना अति शुभ रहेगा।",
    features: [
      {
        part: "ललाट (Forehead)",
        type: "उन्नत एवं चौड़ा",
        traits: "तीक्ष्ण स्मरणशक्ति, दूरगामी सोच व नेतृत्व क्षमता।",
        wisdom: "महर्षि वराहमिहिर के अनुसार चौड़ा ललाट उच्च पद एवं दूरदर्शिता का सूचक है।",
      },
      {
        part: "नेत्र (Eyes)",
        type: "तेजस्वी व सौम्य",
        traits: "सहानुभूति, गहरी अंतर्दृष्टि, सत्यनिष्ठा एवं एकाग्रता।",
        wisdom: "चमकदार एवं विशाल नेत्र अंतरात्मा की पवित्रता व अंतर्ज्ञान प्रकट करते हैं।",
      },
      {
        part: "नासिका (Nose)",
        type: "सरल एवं उन्नत",
        traits: "स्वाभिमान, आर्थिक समृद्धि, दृढ संकल्प व ईमानदारी।",
        wisdom: "सीधी नासिका धन-धान्य की स्थिरता एवं स्वाभिमान दर्शाती है।",
      },
      {
        part: "ओष्ठ व दंत (Lips & Teeth)",
        type: "सुगठित व मधुर",
        traits: "मधुर वाणी, सम्मोहन क्षमता, कलाप्रियता व सम्भाषण कला।",
        wisdom: "रक्तवर्ण ओष्ठ सम्भाषण में सफलता एवं लोकप्रियता प्रदान करते हैं।",
      },
      {
        part: "चिबुक (Chin)",
        type: "दृढ़ व सुडौल",
        traits: "दृढ़ इच्छाशक्ति, अनुशासन, स्थायित्व व दीर्घायु।",
        wisdom: "सुडौल चिबुक जीवन के उत्तरार्ध में अपार सुख व सम्पति की प्रतीक है।",
      },
    ],
  });

  // Handle image upload from gallery or camera capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Img = event.target?.result as string;
      setSelectedImage(base64Img);
      runFacialAnalysis(base64Img, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Run analysis pipeline (AI Vision call + scanning animation)
  const runFacialAnalysis = async (imgData: string, mimeType: string = "image/jpeg") => {
    setIsScanning(true);
    setScanStep("मुखाकृति स्कैन की जा रही है...");

    try {
      setTimeout(() => setScanStep("ललाट, नेत्र व नासिका रेखाओं का मापन..."), 800);
      setTimeout(() => setScanStep("महर्षि गर्ग सामुद्रिक शास्त्र से तुलना..."), 1600);

      // Call AI endpoint if available
      const response = await fetch("/api/face-reading/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imgData,
          imageMimeType: mimeType,
        }),
      });

      const json = await response.json();
      if (json.ok && json.data) {
        setAnalysis({
          faceShape: json.data.faceShape || "अंडाकार (Oval)",
          faceShapeDesc: json.data.faceShapeDesc || analysis.faceShapeDesc,
          vitalityScore: json.data.vitalityScore || 92,
          temperament: json.data.temperament || "सात्त्विक",
          features: Array.isArray(json.data.features) ? json.data.features : analysis.features,
          careerGuidance: json.data.careerGuidance || analysis.careerGuidance,
          remedy: json.data.remedy || analysis.remedy,
        });
      }
    } catch {
      // Graceful fallback to rich offline analysis
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanStep("");
      }, 2200);
    }
  };

  // Speech voice readout
  const handleAudioSpeech = async () => {
    if (isSpeaking) {
      stopUmaSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const speechText = `सामुद्रिक मुखाकृति विश्लेषण। आपकी मुखाकृति स्वरूप ${analysis.faceShape} है। ${analysis.faceShapeDesc} आपका सामुद्रिक भाग्य सूचकांक ${analysis.vitalityScore} प्रतिशत है।`;

    await speakUma(speechText, { onEnd: () => setIsSpeaking(false) });
  };

  // Share result on WhatsApp
  const handleShareResult = () => {
    const text = `*👤 सामुद्रिक मुखाकृति विज्ञान (Face Reading)*\n\n*मुखाकृति:* ${analysis.faceShape}\n*सामुद्रिक सूचकांक:* ${analysis.vitalityScore}%\n*प्रकृति:* ${analysis.temperament}\n\n*फलादेश:* ${analysis.faceShapeDesc}\n\n*करियर संकेत:* ${analysis.careerGuidance}\n\n📲 *शक्ति पंचांग* से अपना चेहरा स्कैन करें!`;
    openWhatsAppShare(text);
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FAF6EE] overflow-y-auto overscroll-contain">
      {/* Header Banner */}
      <div className="p-3 bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-50 shadow-md border-b border-amber-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <div>
              <h1 className="text-base font-black font-granth text-amber-200">
                सामुद्रिक मुखाकृति विज्ञान (Face Reading)
              </h1>
              <p className="text-[11px] text-amber-300/80">
                महर्षि गर्ग व वराहमिहिर कृत चेहरा भाग्य विश्लेषण
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleAudioSpeech}
              className={`p-1.5 rounded-xl border transition ${
                isSpeaking
                  ? "bg-amber-500 text-stone-950 border-amber-300 animate-pulse"
                  : "bg-amber-900/60 text-amber-200 border-amber-700/60 hover:bg-amber-800"
              }`}
              title="फलादेश सुनें"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleShareResult}
              className="p-1.5 rounded-xl bg-amber-900/60 text-amber-200 border border-amber-700/60 hover:bg-amber-800 transition"
              title="व्हाट्सएप शेयर"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 space-y-3.5 max-w-2xl mx-auto w-full">
        {/* Photo Upload & Camera Scanner Section */}
        <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#5C3A21]">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>अपना चेहरा स्कैन करें या फोटो चुनें</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
              AI + वैदिक सामुद्रिक
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Image Preview with Scanner Beam */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-900 border-2 border-amber-300/80 shadow-inner flex items-center justify-center group">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Face Scan Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-amber-200/70 p-4">
                  <Smile className="w-10 h-10 mx-auto mb-1 opacity-50" />
                  <p className="text-xs font-bold">कोई चित्र अपलोड नहीं है</p>
                </div>
              )}

              {/* Facial Alignment Overlay Grid */}
              <div className="absolute inset-0 pointer-events-none border border-amber-400/40 m-3 rounded-lg flex flex-col justify-between p-2">
                <div className="flex justify-between text-[9px] text-amber-300 font-mono">
                  <span>[LALAT GRID]</span>
                  <span>[NETRA ANGLE]</span>
                </div>
                <div className="w-16 h-16 border-2 border-dashed border-amber-400/70 rounded-full mx-auto flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </div>
                <div className="flex justify-between text-[9px] text-amber-300 font-mono">
                  <span>[NASIKA]</span>
                  <span>[CHIBUK]</span>
                </div>
              </div>

              {/* Scanning Laser Beam Effect */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-[0_0_15px_#f59e0b] animate-[bounce_1.5s_infinite]" />
              )}

              {/* Status Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-amber-200 space-y-2 p-3 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <p className="text-xs font-bold">{scanStep}</p>
                </div>
              )}
            </div>

            {/* Action Buttons & Sample Presets */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 text-xs font-bold shadow-md hover:from-amber-800 hover:to-amber-900 transition flex items-center justify-center gap-2 cursor-pointer border border-amber-500/40"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>कैमरा / गैलरी से फोटो लें</span>
              </button>

              <div className="text-[11px] font-bold text-[#8C6239] pt-1">
                या मुख्य मुखाकृति सैंपल चुनें:
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_FACES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedImage(preset.imageUrl);
                      runFacialAnalysis(preset.imageUrl);
                    }}
                    className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition border truncate cursor-pointer ${
                      selectedImage === preset.imageUrl
                        ? "bg-amber-100 border-amber-500 text-amber-950"
                        : "bg-amber-50/60 border-amber-200 text-stone-700 hover:bg-amber-100/70"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-amber-200">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-amber-900 border-t-2 border-x border-amber-400 shadow-xs"
                : "text-stone-600 hover:text-amber-800"
            }`}
          >
            👤 मुख्य फलादेश
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "features"
                ? "bg-white text-amber-900 border-t-2 border-x border-amber-400 shadow-xs"
                : "text-stone-600 hover:text-amber-800"
            }`}
          >
            👁️ अंगवार विश्लेषण
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("destiny")}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "destiny"
                ? "bg-white text-amber-900 border-t-2 border-x border-amber-400 shadow-xs"
                : "text-stone-600 hover:text-amber-800"
            }`}
          >
            💼 धन व करियर
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("moles")}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "moles"
                ? "bg-white text-amber-900 border-t-2 border-x border-amber-400 shadow-xs"
                : "text-stone-600 hover:text-amber-800"
            }`}
          >
            📍 तिल फलादेश
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("remedies")}
            className={`px-3 py-1.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "remedies"
                ? "bg-white text-amber-900 border-t-2 border-x border-amber-400 shadow-xs"
                : "text-stone-600 hover:text-amber-800"
            }`}
          >
            ✨ सात्विक उपाय
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            {/* Vitality Index Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-stone-950 shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1 relative z-10 max-w-[70%]">
                <span className="px-2 py-0.5 rounded-full bg-stone-950/20 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                  सामुद्रिक सूचकांक
                </span>
                <div className="text-xl font-black font-granth">
                  मुखाकृति स्वरूप: {analysis.faceShape}
                </div>
                <p className="text-xs font-medium opacity-90">
                  प्रकृति: <strong>{analysis.temperament}</strong>
                </p>
              </div>

              <div className="text-center bg-stone-950/15 p-2.5 rounded-2xl border border-amber-300/40 shrink-0">
                <div className="text-2xl font-black">{analysis.vitalityScore}%</div>
                <div className="text-[9px] font-bold uppercase">भाग्य ऊर्जा</div>
              </div>
            </div>

            {/* Main Explanation */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2 font-sans">
              <h3 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>मुखाकृति विस्तृत विश्लेषण व गुणधर्म</span>
              </h3>
              <p className="text-xs text-[#3E2714] leading-relaxed font-medium">
                {analysis.faceShapeDesc}
              </p>
            </div>

            {/* Quick Consultation CTA */}
            {onOpenUmaWithQuery && (
              <button
                type="button"
                onClick={() =>
                  onOpenUmaWithQuery(
                    `मेरी मुखाकृति (${analysis.faceShape}) के आधार पर संपूर्ण जीवन का भाग्य फलादेश बताएं।`
                  )
                }
                className="w-full p-3 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-between hover:bg-amber-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔮</span>
                  <span>उमा AI से मुखाकृति संबंधी व्यक्तिगत प्रश्न पूछें</span>
                </div>
                <span className="text-amber-800">→</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: FACIAL FEATURES */}
        {activeTab === "features" && (
          <div className="space-y-2.5">
            {analysis.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-1 hover:border-amber-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>{feat.part}: {feat.type}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                    सामुद्रिक लक्षण
                  </span>
                </div>

                <p className="text-xs text-stone-800 font-medium leading-relaxed pl-3 border-l-2 border-amber-300">
                  {feat.traits}
                </p>

                <p className="text-[11px] text-amber-800/80 italic pt-0.5 font-granth">
                  {feat.wisdom}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DESTINY & CAREER */}
        {activeTab === "destiny" && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2">
              <h3 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>धन, वैभव व करियर संभावनाएँ</span>
              </h3>
              <p className="text-xs text-[#3E2714] leading-relaxed font-medium">
                {analysis.careerGuidance}
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: MOLE READING (तिल विचार) */}
        {activeTab === "moles" && (
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>📍 चेहरे के प्रमुख तिलों का सामुद्रिक रहस्य</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold">
                स्थान चुनें
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FACE_MOLES.map((mole, mIdx) => (
                <button
                  key={mIdx}
                  type="button"
                  onClick={() => setSelectedMoleIndex(mIdx)}
                  className={`p-2.5 rounded-xl text-left text-xs transition border cursor-pointer ${
                    selectedMoleIndex === mIdx
                      ? "bg-amber-100/90 border-amber-500 text-amber-950 font-bold"
                      : "bg-amber-50/50 border-amber-200/80 text-stone-700 hover:bg-amber-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="truncate">{mole.location}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                      {mole.nature}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-600 font-normal line-clamp-2">
                    {mole.meaning}
                  </p>
                </button>
              ))}
            </div>

            {/* Selected Mole Highlight Details */}
            {FACE_MOLES[selectedMoleIndex] && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
                <div className="text-xs font-black text-amber-950">
                  🎯 विस्तृत प्रभाव: {FACE_MOLES[selectedMoleIndex].location}
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {FACE_MOLES[selectedMoleIndex].meaning}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REMEDIES */}
        {activeTab === "remedies" && (
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2.5">
            <h3 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>शास्त्रोक्त सात्विक उपाय व रत्नोपचार</span>
            </h3>
            <p className="text-xs text-[#3E2714] leading-relaxed font-medium bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
              {analysis.remedy}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceReadingView;
