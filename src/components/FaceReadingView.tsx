import React, { useState, useRef, useEffect, useCallback } from "react";
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
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Move,
  MapPin,
  Sliders,
  Grid,
  Crop,
  Download,
  UserCheck,
  X,
  Play,
  Check,
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

// Preset Face Types for quick selection
const PRESET_FACES = [
  {
    id: "oval_m",
    name: "अंडाकार (पुरुष)",
    shape: "अंडाकार (Oval)",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "oval_f",
    name: "अंडाकार (महिला)",
    shape: "अंडाकार (Oval)",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "square_m",
    name: "वर्गाकार (दृढ़ स्वभाव)",
    shape: "वर्गाकार (Square)",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "round_f",
    name: "गोलाकार (सौम्य स्वभाव)",
    shape: "गोलाकार (Round)",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
];

// Facial Moles Dataset with default coordinate targets (% from top-left)
const FACE_MOLES = [
  {
    id: "forehead_center",
    location: "ललाट के मध्य में (Center Forehead)",
    meaning: "तीक्ष्ण बुद्धिमत्ता, उच्च पद प्रतिष्ठा एवं अकस्मात भाग्योदय का संकेत।",
    nature: "शुभ",
    x: 50,
    y: 25,
  },
  {
    id: "trikuti",
    location: "त्रिकुटी (Between Eyebrows)",
    meaning: "गहरी अंतर्दृष्टि, आध्यात्मिक चेतना तथा समाज में उच्च नेतृत्व योग।",
    nature: "अति शुभ",
    x: 50,
    y: 35,
  },
  {
    id: "right_cheek",
    location: "दाहिनी गाल पर (Right Cheek)",
    meaning: "व्यापारिक कुशलता, धन-समृद्धि एवं सुखी पारिवारिक जीवन का सूचक।",
    nature: "अति शुभ",
    x: 32,
    y: 55,
  },
  {
    id: "left_cheek",
    location: "बाएँ गाल पर (Left Cheek)",
    meaning: "कलात्मक दृष्टिकोण, भावुकता तथा सीमित लेकिन सच्चे मित्र।",
    nature: "मध्यम",
    x: 68,
    y: 55,
  },
  {
    id: "upper_lip",
    location: "ऊपरी होंठ पर (Upper Lip)",
    meaning: "मधुर सम्भाषण कला, आकर्षक व्यक्तित्व व भौतिक सुख-साधनों की प्राप्ति।",
    nature: "अति शुभ",
    x: 50,
    y: 70,
  },
  {
    id: "chin",
    location: "ठोड़ी पर (Chin)",
    meaning: "दृढ़ संकल्प शक्ति, यात्राओं का योग तथा उत्तरार्ध में अपार प्रतिष्ठा।",
    nature: "शुभ",
    x: 50,
    y: 84,
  },
  {
    id: "nose_tip",
    location: "नासिका के अग्रभाग पर (Nose Tip)",
    meaning: "शीघ्र निर्णय क्षमता, स्वाभिमान तथा त्वरित धन लाभ की सम्भावना।",
    nature: "शुभ",
    x: 50,
    y: 52,
  },
];

// Helper to determine region description from relative X,Y coordinates
function getMoleMeaningByCoords(xPct: number, yPct: number): { location: string; meaning: string; nature: string } {
  if (yPct < 32) {
    if (xPct < 40) return { location: "ललाट का दायाँ भाग (Right Forehead)", meaning: "व्यापार में अभूतपूर्व उन्नति, प्रशासनिक क्षमता व विदेश यात्रा का योग।", nature: "शुभ" };
    if (xPct > 60) return { location: "ललाट का बायाँ भाग (Left Forehead)", meaning: "रचनात्मक कला, संगीत व विचारशीलता में विशेष रुचि का प्रतीक।", nature: "शुभ" };
    return { location: "ललाट का मध्य भाग (Center Forehead)", meaning: "अत्यधिक तीक्ष्ण बुद्धि, समाज में प्रतिष्ठा व नेतृत्व क्षमता का सूचक।", nature: "अति शुभ" };
  } else if (yPct < 45) {
    if (xPct < 45) return { location: "दाहिनी भौंह / नेत्र (Right Eyebrow)", meaning: "सुखी दाम्पत्य जीवन, धन की निरंतर प्राप्ति व धार्मिक प्रवृत्ति।", nature: "शुभ" };
    if (xPct > 55) return { location: "बाएँ भौंह / नेत्र (Left Eyebrow)", meaning: "संघर्ष के बाद भारी सफलता व दूरदर्शी निर्णय क्षमता।", nature: "मध्यम-शुभ" };
    return { location: "त्रिकुटी - भौंहों के मध्य (Trikuti)", meaning: "आध्यात्मिक ऊर्जा, अंतर्ज्ञान तथा समाज में पूजनीय स्थिति।", nature: "अति शुभ" };
  } else if (yPct < 62) {
    if (xPct < 42) return { location: "दायाँ गाल (Right Cheek)", meaning: "अकस्मात धन लाभ, सुदृढ़ पारिवारिक जीवन व व्यापारिक सफलता।", nature: "अति शुभ" };
    if (xPct > 58) return { location: "बायाँ गाल (Left Cheek)", meaning: "कलात्मक सौंदर्य, भावुक मन व साहित्य-संगीत में सफलता।", nature: "शुभ" };
    return { location: "नासिका (Nose Bridge/Tip)", meaning: "स्वाभिमान, तीक्ष्ण निर्णय शक्ति व आर्थिक स्थिरता।", nature: "शुभ" };
  } else if (yPct < 76) {
    return { location: "ओष्ठ क्षेत्र (Lips Region)", meaning: "मधुर वाक्पटुता, सम्मोहन शक्ति व भौतिक एशो-आराम।", nature: "अति शुभ" };
  } else {
    return { location: "चिबुक / चिबुक रेखा (Chin & Jawline)", meaning: "दृढ़ इच्छाशक्ति, अचल संपत्ति का लाभ व दीर्घायु जीवन।", nature: "शुभ" };
  }
}

export const FaceReadingView: React.FC<{
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onOpenUmaWithQuery }) => {
  // Image & Adjustment States
  const [originalImage, setOriginalImage] = useState<string | null>(PRESET_FACES[0].imageUrl);
  const [adjustedImage, setAdjustedImage] = useState<string | null>(PRESET_FACES[0].imageUrl);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [ageGroup, setAgeGroup] = useState<"young" | "adult" | "senior">("adult");

  // Adjustment Tool Controls
  const [isAdjustMode, setIsAdjustMode] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0); // in degrees
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // WebCam Camera Stream State
  const [isLiveCamera, setIsLiveCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Custom Mole Pinning State
  const [customPins, setCustomPins] = useState<{ x: number; y: number; info: { location: string; meaning: string; nature: string } }[]>([]);
  const [selectedPinIndex, setSelectedPinIndex] = useState<number | null>(null);

  // Processing & View States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "destiny" | "moles" | "remedies">("overview");
  const [selectedMoleIndex, setSelectedMoleIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Default Analysis Data
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

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Img = event.target?.result as string;
      setOriginalImage(base64Img);
      setAdjustedImage(base64Img);
      resetAdjustments();
      setIsAdjustMode(true); // Open adjustment tool immediately for perfect framing
    };
    reader.readAsDataURL(file);
  };

  // Reset Adjustment Sliders
  const resetAdjustments = () => {
    setScale(1.0);
    setRotation(0);
    setPanX(0);
    setPanY(0);
    setFlipH(false);
  };

  // Start Live WebCam
  const startCamera = async () => {
    setIsLiveCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied or unavailble:", err);
      alert("कैमरा एक्सेस प्राप्त नहीं हो सका। कृपया गैलरी से फोटो अपलोड करें।");
      setIsLiveCamera(false);
    }
  };

  // Stop WebCam Stream
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCamera(false);
  };

  // Snap Photo from Camera Stream
  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setOriginalImage(dataUrl);
      setAdjustedImage(dataUrl);
      resetAdjustments();
      stopCamera();
      setIsAdjustMode(true);
    }
  };

  // Render & Crop Adjusted Canvas to output clean image
  const renderCroppedImage = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!originalImage) {
        resolve(adjustedImage || "");
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const cropWidth = 600;
        const cropHeight = 600;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        if (!ctx) {
          resolve(originalImage);
          return;
        }

        // Background fill
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(0, 0, cropWidth, cropHeight);

        ctx.save();
        // Move to center of canvas
        ctx.translate(cropWidth / 2 + panX, cropHeight / 2 + panY);
        // Rotate
        ctx.rotate((rotation * Math.PI) / 180);
        // Scale & Flip
        ctx.scale(scale * (flipH ? -1 : 1), scale);

        // Draw image centered
        ctx.drawImage(img, -cropWidth / 2, -cropHeight / 2, cropWidth, cropHeight);
        ctx.restore();

        const croppedBase64 = canvas.toDataURL("image/jpeg", 0.92);
        resolve(croppedBase64);
      };
      img.onerror = () => resolve(originalImage);
      img.src = originalImage;
    });
  }, [originalImage, adjustedImage, panX, panY, rotation, scale, flipH]);

  // Apply Adjustment and Run Analysis
  const applyAdjustmentAndScan = async () => {
    const finalCropped = await renderCroppedImage();
    setAdjustedImage(finalCropped);
    setIsAdjustMode(false);
    runFacialAnalysis(finalCropped);
  };

  // Run AI Facial Analysis
  const runFacialAnalysis = async (imgData: string) => {
    setIsScanning(true);
    setScanStep("मुखाकृति स्कैन व संरेखण जाँच चालू है...");

    try {
      setTimeout(() => setScanStep("ललाट, नेत्र, नासिका व चिमुख कोण मापन..."), 800);
      setTimeout(() => setScanStep("महर्षि गर्ग व वराहमिहिर सामुद्रिक ग्रंथों से मिलान..."), 1600);

      const response = await fetch("/api/face-reading/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imgData,
          imageMimeType: "image/jpeg",
          gender,
          ageGroup,
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
      // Offline fallback
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanStep("");
      }, 2200);
    }
  };

  // Pan / Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  // Click on Face Image to place custom pin
  const handleImagePinClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAdjustMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const info = getMoleMeaningByCoords(xPct, yPct);
    const newPin = { x: xPct, y: yPct, info };
    setCustomPins((prev) => [...prev, newPin]);
    setSelectedPinIndex(customPins.length);
    setActiveTab("moles");
  };

  // Audio Speech Readout
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

  // Share Result on WhatsApp
  const handleShareResult = () => {
    const text = `*👤 सामुद्रिक मुखाकृति विज्ञान (Face Reading)*\n\n*मुखाकृति:* ${analysis.faceShape}\n*सामुद्रिक सूचकांक:* ${analysis.vitalityScore}%\n*प्रकृति:* ${analysis.temperament}\n\n*फलादेश:* ${analysis.faceShapeDesc}\n\n*करियर व धन संकेत:* ${analysis.careerGuidance}\n\n📲 *शक्ति पंचांग* से अपना चेहरा स्कैन एवं एडजस्ट करें!`;
    openWhatsAppShare(text);
  };

  // Cleanup Camera on Unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-[#FAF6EE] overflow-y-auto overscroll-contain">
      {/* Header Banner */}
      <div className="p-3 bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-50 shadow-md border-b border-amber-600/30 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <div>
              <h1 className="text-base font-black font-granth text-amber-200">
                सामुद्रिक मुखाकृति विज्ञान (Face Reading & Alignment)
              </h1>
              <p className="text-[11px] text-amber-300/80">
                महर्षि गर्ग व वराहमिहिर कृत चेहरा समायोजन एवं भाग्य विश्लेषण
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

      {/* Main Container */}
      <div className="p-3 space-y-3.5 max-w-2xl mx-auto w-full">
        {/* Gender & Age Selection Bar */}
        <div className="p-2.5 rounded-xl bg-white border border-amber-200/90 shadow-2xs flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>व्यक्तिगत विवरण:</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Gender Toggle */}
            <div className="flex rounded-lg bg-amber-100/70 p-0.5 border border-amber-300/60">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition ${
                  gender === "male" ? "bg-amber-700 text-amber-50 shadow-xs" : "text-amber-900 hover:bg-amber-200/50"
                }`}
              >
                पुरुष
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition ${
                  gender === "female" ? "bg-amber-700 text-amber-50 shadow-xs" : "text-amber-900 hover:bg-amber-200/50"
                }`}
              >
                महिला
              </button>
            </div>

            {/* Age Category */}
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as any)}
              className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 font-bold text-[11px] text-amber-900 outline-none"
            >
              <option value="young">आयु: 18 - 30 वर्ष</option>
              <option value="adult">आयु: 30 - 50 वर्ष</option>
              <option value="senior">आयु: 50+ वर्ष</option>
            </select>
          </div>
        </div>

        {/* Live WebCam Overlay Mode */}
        {isLiveCamera ? (
          <div className="p-4 rounded-2xl bg-stone-900 border-2 border-amber-400 shadow-xl space-y-3 text-amber-50">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400 animate-pulse" />
                लाइव कैमरा स्कैन (Align Face in Oval)
              </span>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-amber-500/40">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />

              {/* Live Oval Frame Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 border-2 border-dashed border-amber-400/90 rounded-[50%] shadow-[0_0_20px_rgba(245,158,11,0.5)] flex flex-col justify-between p-3">
                  <span className="text-[9px] text-amber-300 text-center font-mono">ललाट (FOREHEAD)</span>
                  <div className="w-full border-t border-amber-400/40" />
                  <span className="text-[9px] text-amber-300 text-center font-mono">नेत्र (EYE LEVEL)</span>
                  <div className="w-full border-t border-amber-400/40" />
                  <span className="text-[9px] text-amber-300 text-center font-mono">चिबुक (CHIN)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={captureCameraPhoto}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs shadow-md hover:from-amber-400 hover:to-amber-500 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>फोटो खींचें एवं फ्रेम करें</span>
              </button>
            </div>
          </div>
        ) : (
          /* Face Preview & Adjustment Area */
          <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#5C3A21]">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>मुखाकृति समायोजन एवं स्कैनिंग</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAdjustMode(!isAdjustMode)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                    isAdjustMode
                      ? "bg-amber-600 text-amber-50 border-amber-700 shadow-xs"
                      : "bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isAdjustMode ? "एडजस्ट मोड ऑन" : "चेहरा एडजस्ट करें"}</span>
                </button>
              </div>
            </div>

            {/* Interactive Image Viewport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div
                ref={viewportRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                onClick={handleImagePinClick}
                className={`relative aspect-square rounded-2xl overflow-hidden bg-stone-950 border-2 border-amber-400/80 shadow-inner flex items-center justify-center select-none ${
                  isAdjustMode ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
                }`}
              >
                {/* Background Image with Transform applied */}
                {adjustedImage || originalImage ? (
                  <div
                    style={{
                      transform: `translate(${panX}px, ${panY}px) scale(${scale}) rotate(${rotation}deg) scaleX(${
                        flipH ? -1 : 1
                      })`,
                      transition: isDragging ? "none" : "transform 0.15s ease-out",
                    }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={originalImage || adjustedImage || ""}
                      alt="Face Preview"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                ) : (
                  <div className="text-center text-amber-200/70 p-4">
                    <Smile className="w-10 h-10 mx-auto mb-1 opacity-50" />
                    <p className="text-xs font-bold">कोई फोटो उपलब्ध नहीं</p>
                  </div>
                )}

                {/* Live Vedic Grid Overlay Guides */}
                {showGridOverlay && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-amber-400/40 rounded-2xl flex flex-col justify-between p-3 m-2">
                    <div className="flex justify-between text-[8px] text-amber-300 font-mono tracking-wider">
                      <span>[LALAT: FOREHEAD]</span>
                      <span>[TRILOK: OVAL]</span>
                    </div>

                    {/* Central Alignment Target */}
                    <div className="w-40 h-52 border-2 border-dashed border-amber-400/80 rounded-[50%] mx-auto flex flex-col justify-between p-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <div className="w-full border-b border-amber-400/30 text-[8px] text-amber-300 text-center">
                        ललाट रेखा
                      </div>
                      <div className="w-full border-b border-amber-400/40 flex justify-between px-2 text-[8px] text-amber-300">
                        <span>दायाँ नेत्र</span>
                        <span>बायाँ नेत्र</span>
                      </div>
                      <div className="w-full border-b border-amber-400/30 text-[8px] text-amber-300 text-center">
                        नासिका रेखा
                      </div>
                      <div className="text-[8px] text-amber-300 text-center">चिमुख</div>
                    </div>

                    <div className="flex justify-between text-[8px] text-amber-300 font-mono tracking-wider">
                      <span>[SAMUDRIK MESH]</span>
                      <span>[GARGA SCALE]</span>
                    </div>
                  </div>
                )}

                {/* Custom Pinned Moles Markers */}
                {!isAdjustMode &&
                  customPins.map((pin, pIdx) => (
                    <div
                      key={pIdx}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPinIndex(pIdx);
                        setActiveTab("moles");
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-amber-500 border-2 border-stone-900 shadow-md text-[9px] font-bold text-stone-950 flex items-center justify-center cursor-pointer animate-bounce z-20"
                      title={pin.info.location}
                    >
                      📍
                    </div>
                  ))}

                {/* Scanning Laser Beam */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 shadow-[0_0_20px_#f59e0b] animate-[bounce_1.5s_infinite] z-30" />
                )}

                {/* Scanning Status Backdrop */}
                {isScanning && (
                  <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-amber-200 space-y-2 p-3 text-center z-40">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                    <p className="text-xs font-bold font-granth">{scanStep}</p>
                  </div>
                )}

                {/* Instruction Tag */}
                {!isAdjustMode && !isScanning && (
                  <div className="absolute bottom-2 left-2 right-2 py-1 px-2 rounded-lg bg-stone-900/80 backdrop-blur-xs text-[10px] text-amber-200 font-bold text-center border border-amber-500/30 pointer-events-none">
                    👆 चेहरे पर किसी भी स्थान पर क्लिक करके तिल / चिह्न फलादेश देखें
                  </div>
                )}
              </div>

              {/* Adjustment Controls Panel OR Action Buttons */}
              {isAdjustMode ? (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2.5">
                  <div className="text-xs font-black text-amber-950 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Crop className="w-4 h-4 text-amber-700" />
                      चेहरा संरेखण व एडजस्टमेंट
                    </span>
                    <button
                      type="button"
                      onClick={resetAdjustments}
                      className="text-[10px] text-amber-800 font-bold underline hover:text-amber-950"
                    >
                      रीसेट करें
                    </button>
                  </div>

                  {/* Zoom Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-amber-900">
                      <span className="flex items-center gap-1">
                        <ZoomIn className="w-3.5 h-3.5" /> ज़ूम (Zoom)
                      </span>
                      <span>{Math.round(scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full accent-amber-700 cursor-pointer h-1.5 bg-amber-200 rounded-lg"
                    />
                  </div>

                  {/* Rotate Controls */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-amber-900">
                      <span className="flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> कोण घूर्णन (Rotation)
                      </span>
                      <span>{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full accent-amber-700 cursor-pointer h-1.5 bg-amber-200 rounded-lg"
                    />
                  </div>

                  {/* Toggle Flip & Grid Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setFlipH(!flipH)}
                      className={`p-1.5 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 ${
                        flipH ? "bg-amber-700 text-amber-50" : "bg-white text-stone-800 border-amber-300"
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>{flipH ? "फ्लिप सक्रिय" : "क्षैतिज फ्लिप"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowGridOverlay(!showGridOverlay)}
                      className={`p-1.5 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 ${
                        showGridOverlay ? "bg-amber-700 text-amber-50" : "bg-white text-stone-800 border-amber-300"
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>{showGridOverlay ? "ग्रिड दृश्यमान" : "ग्रिड छिपाएँ"}</span>
                    </button>
                  </div>

                  {/* Apply & Crop Button */}
                  <button
                    type="button"
                    onClick={applyAdjustmentAndScan}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-amber-50 font-black text-xs shadow-md hover:from-emerald-800 hover:to-teal-900 transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>एडजस्टमेंट लागू करें एवं स्कैन करें</span>
                  </button>
                </div>
              ) : (
                /* Standard Image Source Chooser */
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                      className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 text-[11px] font-bold shadow-md hover:from-amber-800 hover:to-amber-900 transition flex items-center justify-center gap-1 cursor-pointer border border-amber-500/40"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>गैलरी फोटो</span>
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={isScanning}
                      className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 text-amber-200 text-[11px] font-bold shadow-md hover:from-stone-900 hover:to-black transition flex items-center justify-center gap-1 cursor-pointer border border-amber-600/40"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>लाइव कैमरा</span>
                    </button>
                  </div>

                  <div className="text-[11px] font-bold text-[#8C6239] pt-1">
                    या मुख्य मुखाकृति सैंपल चुनें:
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_FACES.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setOriginalImage(preset.imageUrl);
                          setAdjustedImage(preset.imageUrl);
                          resetAdjustments();
                          runFacialAnalysis(preset.imageUrl);
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition border truncate cursor-pointer ${
                          originalImage === preset.imageUrl
                            ? "bg-amber-100 border-amber-500 text-amber-950"
                            : "bg-amber-50/60 border-amber-200 text-stone-700 hover:bg-amber-100/70"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
            👁️ अंगवार लक्षण
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
            📍 तिल व लक्षण चिह्नीकरण ({FACE_MOLES.length + customPins.length})
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
                    <span>
                      {feat.part}: {feat.type}
                    </span>
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

        {/* TAB 4: MOLE READING & CUSTOM PINNED POINTS */}
        {activeTab === "moles" && (
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>चेहरे के प्रमुख तिलों व कस्टम पॉइंट्स का फलादेश</span>
              </div>
            </div>

            {/* Custom Pinned Points Section */}
            {customPins.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300/80 space-y-2">
                <div className="text-xs font-bold text-amber-950">
                  📍 आपके द्वारा फोटो पर अंकित किए गए स्थान ({customPins.length}):
                </div>

                <div className="space-y-1.5">
                  {customPins.map((p, pinIdx) => (
                    <div
                      key={pinIdx}
                      onClick={() => setSelectedPinIndex(pinIdx)}
                      className={`p-2 rounded-lg text-xs transition border cursor-pointer ${
                        selectedPinIndex === pinIdx
                          ? "bg-amber-200/80 border-amber-500 font-bold text-amber-950"
                          : "bg-white border-amber-200 text-stone-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">
                          बिंदु #{pinIdx + 1}: {p.info.location}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-300/70 text-amber-900 font-bold">
                          {p.info.nature}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-700 font-medium mt-1">
                        {p.info.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Face Moles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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
