import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Volume2,
  VolumeX,
  Share2,
  ShieldCheck,
  Flame,
  Award,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  MapPin,
  Sliders,
  Grid,
  Crop,
  UserCheck,
  X,
  Smile,
} from "lucide-react";
import { umaVoice } from "../services/UmaVoiceService";
import { openWhatsAppShare } from "../services/umaConsultationPdf";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { useLanguage } from "../i18n";

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

function getPresetFaces(cLang: string) {
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);
  return [
    {
      id: "oval_m",
      name: L("अंडाकार (पुरुष)", "Oval (Male)", "અંડાકાર (પુરુષ)"),
      shape: L("अंडाकार (Oval)", "Oval", "અંડાકાર (Oval)"),
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "oval_f",
      name: L("अंडाकार (महिला)", "Oval (Female)", "અંડાકાર (મહિલા)"),
      shape: L("अंडाकार (Oval)", "Oval", "અંડાકાર (Oval)"),
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "square_m",
      name: L("वर्गाकार (दृढ़ स्वभाव)", "Square (Strong Will)", "ચોરસ (દૃઢ સ્વભાવ)"),
      shape: L("वर्गाकार (Square)", "Square", "ચોરસ (Square)"),
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "round_f",
      name: L("गोलाकार (सौम्य स्वभाव)", "Round (Gentle Nature)", "ગોળાકાર (સૌમ્ય સ્વભાવ)"),
      shape: L("गोलाकार (Round)", "Round", "ગોળાકાર (Round)"),
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    },
  ];
}

function getFaceMoles(cLang: string) {
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);
  return [
    {
      id: "forehead_center",
      location: L("ललाट के मध्य में (Center Forehead)", "Center Forehead", "લલાટના મધ્યમાં (Center Forehead)"),
      meaning: L(
        "तीक्ष्ण बुद्धिमत्ता, उच्च पद प्रतिष्ठा एवं अकस्मात भाग्योदय का संकेत।",
        "Indicates sharp intellect, high status, and sudden rise in fortune.",
        "તીક્ષ્ણ બુદ્ધિમત્તા, ઉચ્ચ પદ-પ્રતિષ્ઠા અને અચાનક ભાગ્યોદયનો સંકેત."
      ),
      nature: L("शुभ", "Auspicious", "શુભ"),
      x: 50,
      y: 25,
    },
    {
      id: "trikuti",
      location: L("त्रिकुटी (Between Eyebrows)", "Trikuti (Between Eyebrows)", "ત્રિકુટી (ભ્રમર વચ્ચે)"),
      meaning: L(
        "गहरी अंतर्दृष्टि, आध्यात्मिक चेतना तथा समाज में उच्च नेतृत्व योग।",
        "Signifies deep intuition, spiritual awareness, and natural leadership.",
        "ઊંડી અંતર્દૃષ્ટિ, આધ્યાત્મિક ચેતના અને સમાજમાં ઉચ્ચ નેતૃત્વ યોગ."
      ),
      nature: L("अति शुभ", "Highly Auspicious", "અતિ શુભ"),
      x: 50,
      y: 35,
    },
    {
      id: "right_cheek",
      location: L("दाहिनी गाल पर (Right Cheek)", "Right Cheek", "જમણા ગાલ પર (Right Cheek)"),
      meaning: L(
        "व्यापारिक कुशलता, धन-समृद्धि एवं सुखी पारिवारिक जीवन का सूचक।",
        "Denotes business acumen, financial abundance, and harmonious family life.",
        "વ્યાપારિક કુશળતા, ધન-સમૃદ્ધિ અને સુખી પારિવારિક જીવનનો સૂચક."
      ),
      nature: L("अति शुभ", "Highly Auspicious", "અતિ શુભ"),
      x: 32,
      y: 55,
    },
    {
      id: "left_cheek",
      location: L("बाएँ गाल पर (Left Cheek)", "Left Cheek", "ડાબા ગાલ પર (Left Cheek)"),
      meaning: L(
        "कलात्मक दृष्टिकोण, भावुकता तथा सीमित लेकिन सच्चे मित्र।",
        "Reflects artistic sensitivity, emotional depth, and loyal close friends.",
        "કલાત્મક દૃષ્ટિકોણ, ભાવુકતા અને મર્યાદિત પરંતુ સાચા મિત્રો."
      ),
      nature: L("मध्यम", "Moderate", "મધ્યમ"),
      x: 68,
      y: 55,
    },
    {
      id: "upper_lip",
      location: L("ऊपरी होंठ पर (Upper Lip)", "Upper Lip", "ઉપલા હોઠ પર (Upper Lip)"),
      meaning: L(
        "मधुर सम्भाषण कला, आकर्षक व्यक्तित्व व भौतिक सुख-साधनों की प्राप्ति।",
        "Bestows sweet eloquence, magnetic charm, and material comforts.",
        "મધુર વાણી, આકર્ષક વ્યક્તિત્વ અને ભૌતિક સુખ-સાધનોની પ્રાપ્તિ."
      ),
      nature: L("अति शुभ", "Highly Auspicious", "અતિ શુભ"),
      x: 50,
      y: 70,
    },
    {
      id: "chin",
      location: L("ठोड़ी पर (Chin)", "Chin", "હડપચી પર (Chin)"),
      meaning: L(
        "दृढ़ संकल्प शक्ति, यात्राओं का योग तथा उत्तरार्ध में अपार प्रतिष्ठा।",
        "Shows strong determination, travel opportunities, and lasting fame later in life.",
        "દૃઢ સંકલ્પ શક્તિ, યાત્રાઓનો યોગ અને ઉત્તરાર્ધમાં અપાર પ્રતિષ્ઠા."
      ),
      nature: L("शुभ", "Auspicious", "શુભ"),
      x: 50,
      y: 84,
    },
    {
      id: "nose_tip",
      location: L("नासिका के अग्रभाग पर (Nose Tip)", "Tip of Nose", "નાસિકાના અગ્રભાગ પર (Nose Tip)"),
      meaning: L(
        "शीघ्र निर्णय क्षमता, स्वाभिमान तथा त्वरित धन लाभ की सम्भावना।",
        "Indicates swift decision-making, self-respect, and timely financial gains.",
        "ઝડપી નિર્ણય ક્ષમતા, સ્વાભિમાન અને ત્વરિત ધન લાભની સંભાવના."
      ),
      nature: L("शुभ", "Auspicious", "શુભ"),
      x: 50,
      y: 52,
    },
  ];
}

function getMoleMeaningByCoords(xPct: number, yPct: number, cLang: string): { location: string; meaning: string; nature: string } {
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);
  if (yPct < 32) {
    if (xPct < 40) {
      return {
        location: L("ललाट का दायाँ भाग (Right Forehead)", "Right Forehead", "લલાટનો જમણો ભાગ (Right Forehead)"),
        meaning: L(
          "व्यापार में अभूतपूर्व उन्नति, प्रशासनिक क्षमता व विदेश यात्रा का योग।",
          "Strong growth in business, administrative authority, and foreign travel prospects.",
          "વ્યાપારમાં અપૂર્વ પ્રગતિ, વહીવટી ક્ષમતા અને વિદેશ યાત્રાનો યોગ."
        ),
        nature: L("शुभ", "Auspicious", "શુભ"),
      };
    }
    if (xPct > 60) {
      return {
        location: L("ललाट का बायाँ भाग (Left Forehead)", "Left Forehead", "લલાટનો ડાબો ભાગ (Left Forehead)"),
        meaning: L(
          "रचनात्मक कला, संगीत व विचारशीलता में विशेष रुचि का प्रतीक।",
          "Symbol of creative arts, music, and reflective wisdom.",
          "રચનાત્મક કલા, સંગીત અને વિચારશીલતામાં વિશેષ રુચિનું પ્રતીક."
        ),
        nature: L("शुभ", "Auspicious", "શુભ"),
      };
    }
    return {
      location: L("ललाट का मध्य भाग (Center Forehead)", "Center Forehead", "લલાટનો મધ્ય ભાગ (Center Forehead)"),
      meaning: L(
        "अत्यधिक तीक्ष्ण बुद्धि, समाज में प्रतिष्ठा व नेतृत्व क्षमता का सूचक।",
        "Indicates high intellect, social honor, and leadership capacity.",
        "અત્યંત તીક્ષ્ણ બુદ્ધિ, સમાજમાં પ્રતિષ્ઠા અને નેતૃત્વ ક્ષમતાનો સૂચક."
      ),
      nature: L("अति शुभ", "Highly Auspicious", "અતિ શુભ"),
    };
  } else if (yPct < 45) {
    if (xPct < 45) {
      return {
        location: L("दाहिनी भौंह / नेत्र (Right Eyebrow)", "Right Eyebrow / Eye", "જમણી ભ્રમર / નેત્ર (Right Eyebrow)"),
        meaning: L(
          "सुखी दाम्पत्य जीवन, धन की निरंतर प्राप्ति व धार्मिक प्रवृत्ति।",
          "Harmonious marriage, steady wealth, and dharmic inclination.",
          "સુખી દાંપત્ય જીવન, ધનની નિરંતર પ્રાપ્તિ અને ધાર્મિક વૃત્તિ."
        ),
        nature: L("शुभ", "Auspicious", "શુભ"),
      };
    }
    if (xPct > 55) {
      return {
        location: L("बाएँ भौंह / नेत्र (Left Eyebrow)", "Left Eyebrow / Eye", "ડાબી ભ્રમર / નેત્ર (Left Eyebrow)"),
        meaning: L(
          "संघर्ष के बाद भारी सफलता व दूरदर्शी निर्णय क्षमता।",
          "Major triumph after perseverance and far-sighted judgment.",
          "સંઘર્ષ બાદ મોટી સફળતા અને દૂરદર્શી નિર્ણય ક્ષમતા."
        ),
        nature: L("मध्यम-शुभ", "Moderately Auspicious", "મધ્યમ-શુભ"),
      };
    }
    return {
      location: L("त्रिकुटी - भौंहों के मध्य (Trikuti)", "Trikuti (Between Eyebrows)", "ત્રિકુટી - ભ્રમર વચ્ચે"),
      meaning: L(
        "आध्यात्मिक ऊर्जा, अंतर्ज्ञान तथा समाज में पूजनीय स्थिति।",
        "Spiritual vitality, intuition, and respected standing in society.",
        "આધ્યાત્મિક ઊર્જા, અંતર્જ્ઞાન અને સમાજમાં પૂજનીય સ્થિતિ."
      ),
      nature: L("अति शुभ", "Highly Auspicious", "અતિ શુભ"),
    };
  } else if (yPct < 62) {
    if (xPct < 42) {
      return {
        location: L("दायाँ गाल (Right Cheek)", "Right Cheek", "જમણો ગાલ (Right Cheek)"),
        meaning: L(
          "अकस्मात धन लाभ, सुदृढ़ पारिवारिक जीवन व व्यापारिक सफलता।",
          "Unexpected financial gains, strong family bond, and commercial success.",
          "અચાનક ધન લાભ, સુદૃઢ પારિવારિક જીવન અને વ્યાપારિક સફળતા."
        ),
        nature: L("अति शुभ", "Highly Auspicious", "અતિ શુભ"),
      };
    }
    if (xPct > 58) {
      return {
        location: L("बायाँ गाल (Left Cheek)", "Left Cheek", "ડાબો ગાલ (Left Cheek)"),
        meaning: L(
          "कलात्मक सौंदर्य, भावुक मन व साहित्य-संगीत में सफलता।",
          "Artistic grace, compassionate heart, and success in literature or music.",
          "કલાત્મક સૌંદર્ય, ભાવુક મન અને સાહિત્ય-સંગીતમાં સફળતા."
        ),
        nature: L("शुभ", "Auspicious", "શુભ"),
      };
    }
    return {
      location: L("नासिका (Nose Bridge/Tip)", "Nose Bridge / Tip", "નાસિકા (Nose Bridge/Tip)"),
      meaning: L(
        "स्वाभिमान, तीक्ष्ण निर्णय शक्ति व आर्थिक स्थिरता।",
        "Self-dignity, sharp decisiveness, and long-term financial stability.",
        "સ્વાભિમાન, તીક્ષ્ણ નિર્ણય શક્તિ અને આર્થિક સ્થિરતા."
      ),
      nature: L("शुभ", "Auspicious", "શુભ"),
    };
  } else if (yPct < 76) {
    return {
      location: L("ओष्ठ क्षेत्र (Lips Region)", "Lips Region", "હોઠ ક્ષેત્ર (Lips Region)"),
      meaning: L(
        "मधुर वाक्पटुता, सम्मोहन शक्ति व भौतिक एशो-आराम।",
        "Eloquent speech, magnetic charisma, and material prosperity.",
        "મધુર વાક્પટુતા, આકર્ષણ શક્તિ અને ભૌતિક સુખ-સમૃદ્ધિ."
      ),
      nature: L("अति शुभ", "Highly Auspicious", "અતિ શુભ"),
    };
  } else {
    return {
      location: L("चिबुक / चिबुक रेखा (Chin & Jawline)", "Chin & Jawline", "હડપચી / ચિબુક રેખા (Chin & Jawline)"),
      meaning: L(
        "दृढ़ इच्छाशक्ति, अचल संपत्ति का लाभ व दीर्घायु जीवन।",
        "Steadfast willpower, real-estate fortune, and longevity.",
        "દૃઢ ઇચ્છાશક્તિ, સ્થાવર મિલકતનો લાભ અને દીર્ઘાયુ જીવન."
      ),
      nature: L("शुभ", "Auspicious", "શુભ"),
    };
  }
}

function getDefaultFaceAnalysis(cLang: string): FaceAnalysisData {
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);
  return {
    faceShape: L("अंडाकार (Oval)", "Oval", "અંડાકાર (Oval)"),
    faceShapeDesc: L(
      "सामुद्रिक शास्त्र के अनुसार अंडाकार मुखाकृति उत्तम संतुलन, तीक्ष्ण बुद्धि और धैर्य की प्रतीक है। आप निर्णय लेने में कुशल, व्यवहारिक और सौम्य स्वभाव के धनी हैं। समाज में आपका आदर एवं यश निरंतर बढ़ता है।",
      "According to Samudrika Shastra, an oval face symbolizes harmony, sharp intellect, and patience. You are practical, composed, and skilled in balanced decision-making, earning steady respect in society.",
      "સામુદ્રિક શાસ્ત્ર અનુસાર અંડાકાર મુખાકૃતિ ઉત્તમ સંતુલન, તીક્ષ્ણ બુદ્ધિ અને ધૈર્યનું પ્રતીક છે. તમે નિર્ણય લેવામાં કુશળ, વ્યવહારુ અને સૌમ્ય સ્વભાવના ધની છો."
    ),
    vitalityScore: 94,
    temperament: L("सात्त्विक व सांतुलित", "Sattvic & Balanced", "સાત્વિક અને સંતુલિત"),
    careerGuidance: L(
      "प्रशासनिक सेवा, परामर्श, शिक्षा, सूचना प्रौद्योगिकी, बैंकिंग एवं रचनात्मक क्षेत्रों में सर्वोच्च सफलता प्राप्त होगी। आपकी तार्किक क्षमता दूसरों को प्रभावित करती है।",
      "High success awaits in administration, advisory roles, education, technology, finance, and creative fields. Your analytical clarity inspires trust.",
      "વહીવટી સેવા, પરામર્શ, શિક્ષણ, આઇટી, બેંકિંગ અને રચનાત્મક ક્ષેત્રોમાં શ્રેષ્ઠ સફળતા પ્રાપ્ત થશે."
    ),
    remedy: L(
      "प्रतिदिन सूर्य देव को अर्घ्य दें। ललाट पर चन्दन व कुंकुम का तिलक लगाएं। तर्जनी या अनामिका अंगुली में पीला पुखराज या माणिक्य धारण करना अति शुभ रहेगा।",
      "Offer water (Arghya) to Lord Surya daily. Apply sandalwood and kumkum tilak on your forehead. Following a qualified astrologer's advice on Yellow Sapphire or Ruby brings auspicious clarity.",
      "દરરોજ સૂર્યદેવને અર્ઘ્ય અર્પણ કરો. કપાળ પર ચંદન અને કુમકુમનું તિલક લગાવો. શુભ મુહૂર્તે ગુરુ અથવા સૂર્યનું રત્ન ધારણ કરવું ઉત્તમ રહેશે."
    ),
    features: [
      {
        part: L("ललाट (Forehead)", "Forehead", "લલાટ (Forehead)"),
        type: L("उन्नत एवं चौड़ा", "Broad & Elevated", "ઉન્નત અને પહોળું"),
        traits: L(
          "तीक्ष्ण स्मरणशक्ति, दूरगामी सोच व नेतृत्व क्षमता।",
          "Sharp memory, visionary foresight, and leadership ability.",
          "તીક્ષ્ણ સ્મરણશક્તિ, દૂરગામી વિચારસરણી અને નેતૃત્વ ક્ષમતા."
        ),
        wisdom: L(
          "महर्षि वराहमिहिर के अनुसार चौड़ा ललाट उच्च पद एवं दूरदर्शिता का सूचक है।",
          "Maharshi Varahamihira states that a well-proportioned broad forehead signifies authority and foresight.",
          "મહર્ષિ વરાહમિહિર અનુસાર પહોળું લલાટ ઉચ્ચ પદ અને દૂરદર્શિતાનો સૂચક છે."
        ),
      },
      {
        part: L("नेत्र (Eyes)", "Eyes", "નેત્ર (Eyes)"),
        type: L("तेजस्वी व सौम्य", "Lustrous & Serene", "તેજસ્વી અને સૌમ્ય"),
        traits: L(
          "सहानुभूति, गहरी अंतर्दृष्टि, सत्यनिष्ठा एवं एकाग्रता।",
          "Empathy, deep insight, integrity, and focused concentration.",
          "સહાનુભૂતિ, ઊંડી અંતર્દૃષ્ટિ, સત્યનિષ્ઠા અને એકાગ્રતા."
        ),
        wisdom: L(
          "चमकदार एवं विशाल नेत्र अंतरात्मा की पवित्रता व अंतर्ज्ञान प्रकट करते हैं।",
          "Clear, luminous eyes reveal inner purity and heightened intuition.",
          "ચમકદાર અને વિશાળ નેત્ર અંતરાત્માની પવિત્રતા અને અંતર્જ્ઞાન પ્રગટ કરે છે."
        ),
      },
      {
        part: L("नासिका (Nose)", "Nose", "નાસિકા (Nose)"),
        type: L("सरल एवं उन्नत", "Straight & Well-Formed", "સરળ અને ઉન્નત"),
        traits: L(
          "स्वाभिमान, आर्थिक समृद्धि, दृढ संकल्प व ईमानदारी।",
          "Self-respect, steady prosperity, determination, and honesty.",
          "સ્વાભિમાન, આર્થિક સમૃદ્ધિ, દૃઢ સંકલ્પ અને પ્રામાણિકતા."
        ),
        wisdom: L(
          "सीधी नासिका धन-धान्य की स्थिरता एवं स्वाभिमान दर्शाती है।",
          "A balanced straight nose indicates financial stability and dignity.",
          "સીધી નાસિકા ધન-ધાન્યની સ્થિરતા અને સ્વાભિમાન દર્શાવે છે."
        ),
      },
      {
        part: L("ओष्ठ व दंत (Lips & Teeth)", "Lips & Teeth", "હોઠ અને દાંત (Lips & Teeth)"),
        type: L("सुगठित व मधुर", "Well-Shaped & Graceful", "સુગઠિત અને મધુર"),
        traits: L(
          "मधुर वाणी, सम्मोहन क्षमता, कलाप्रियता व सम्भाषण कला।",
          "Sweet speech, persuasive charm, artistic taste, and diplomacy.",
          "મધુર વાણી, આકર્ષણ ક્ષમતા, કલાપ્રેમ અને સંભાષણ કલા."
        ),
        wisdom: L(
          "रक्तवर्ण ओष्ठ सम्भाषण में सफलता एवं लोकप्रियता प्रदान करते हैं।",
          "Naturally proportioned lips grant eloquence and social popularity.",
          "સુગઠિત હોઠ વાણીમાં સફળતા અને લોકપ્રિયતા પ્રદાન કરે છે."
        ),
      },
      {
        part: L("चिबुक (Chin)", "Chin", "હડપચી (Chin)"),
        type: L("दृढ़ व सुडौल", "Firm & Balanced", "દૃઢ અને સુડોળ"),
        traits: L(
          "दृढ़ इच्छाशक्ति, अनुशासन, स्थायित्व व दीर्घायु।",
          "Strong willpower, discipline, stability, and longevity.",
          "દૃઢ ઇચ્છાશક્તિ, અનુશાસન, સ્થિરતા અને દીર્ઘાયુ."
        ),
        wisdom: L(
          "सुडौल चिबुक जीवन के उत्तरार्ध में अपार सुख व सम्पति की प्रतीक है।",
          "A well-defined chin symbolizes comfort and prosperity in later life.",
          "સુડોળ હડપચી જીવનના ઉત્તરાર્ધમાં અપાર સુખ અને સંપત્તિનું પ્રતીક છે."
        ),
      },
    ],
  };
}

export const FaceReadingView: React.FC<{
  onOpenUmaWithQuery?: (query: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}> = ({ onOpenUmaWithQuery }) => {
  const { language } = useLanguage();
  const cLang = (language || "hi").slice(0, 2).toLowerCase();
  const L = <T,>(hi: T, en: T, gu: T): T => (cLang === "en" ? en : cLang === "gu" ? gu : hi);

  const presetFaces = getPresetFaces(cLang);
  const faceMoles = getFaceMoles(cLang);

  // Image & Adjustment States
  const [originalImage, setOriginalImage] = useState<string | null>(presetFaces[0].imageUrl);
  const [adjustedImage, setAdjustedImage] = useState<string | null>(presetFaces[0].imageUrl);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [ageGroup, setAgeGroup] = useState<"young" | "adult" | "senior">("adult");

  // Adjustment Tool Controls
  const [isAdjustMode, setIsAdjustMode] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
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
  const cameraCaptureInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasCustomScanRef = useRef<boolean>(false);

  const [analysis, setAnalysis] = useState<FaceAnalysisData>(() => getDefaultFaceAnalysis(cLang));

  // Sync default analysis & pinned coords when language switches (and if custom scan was done, re-fetch in new language)
  useEffect(() => {
    setCustomPins((prev) =>
      prev.map((pin) => ({
        ...pin,
        info: getMoleMeaningByCoords(pin.x, pin.y, cLang),
      }))
    );
    if (!hasCustomScanRef.current) {
      setAnalysis(getDefaultFaceAnalysis(cLang));
    } else if (adjustedImage) {
      void runFacialAnalysis(adjustedImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cLang]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Img = event.target?.result as string;
      setOriginalImage(base64Img);
      setAdjustedImage(base64Img);
      resetAdjustments();
      setIsAdjustMode(true);
    };
    reader.readAsDataURL(file);
  };

  const resetAdjustments = () => {
    setScale(1.0);
    setRotation(0);
    setPanX(0);
    setPanY(0);
    setFlipH(false);
  };

  const startCamera = async () => {
    try {
      if (Capacitor.isPluginAvailable("Camera")) {
        const photo = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          promptLabelHeader: L("सामुद्रिक मुख लक्षण कैमरा", "Samudrika Face Scan Camera", "સામુદ્રિક મુખ લક્ષણ કેમેરા"),
          promptLabelPicture: L("फोटो खींचें", "Capture Photo", "ફોટો ખેંચો"),
        });

        if (photo?.dataUrl) {
          setOriginalImage(photo.dataUrl);
          setAdjustedImage(photo.dataUrl);
          resetAdjustments();
          setIsAdjustMode(true);
          return;
        }
      }
    } catch (nativeErr: any) {
      console.warn("Native camera cancelled or unavailable:", nativeErr);
      if (
        nativeErr?.message?.includes("User cancelled") ||
        nativeErr?.message?.includes("cancelled")
      ) {
        return;
      }
    }

    if (cameraCaptureInputRef.current) {
      cameraCaptureInputRef.current.click();
      return;
    }

    if (navigator?.mediaDevices?.getUserMedia) {
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
        console.warn("Live video stream unavailable, triggering file picker:", err);
        setIsLiveCamera(false);
        fileInputRef.current?.click();
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCamera(false);
  };

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

        ctx.fillStyle = "#1c1917";
        ctx.fillRect(0, 0, cropWidth, cropHeight);

        ctx.save();
        ctx.translate(cropWidth / 2 + panX, cropHeight / 2 + panY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale * (flipH ? -1 : 1), scale);
        ctx.drawImage(img, -cropWidth / 2, -cropHeight / 2, cropWidth, cropHeight);
        ctx.restore();

        const croppedBase64 = canvas.toDataURL("image/jpeg", 0.92);
        resolve(croppedBase64);
      };
      img.onerror = () => resolve(originalImage);
      img.src = originalImage;
    });
  }, [originalImage, adjustedImage, panX, panY, rotation, scale, flipH]);

  const applyAdjustmentAndScan = async () => {
    const finalCropped = await renderCroppedImage();
    setAdjustedImage(finalCropped);
    setIsAdjustMode(false);
    runFacialAnalysis(finalCropped);
  };

  const runFacialAnalysis = async (imgData: string) => {
    setIsScanning(true);
    setScanStep(L(
      "मुखाकृति स्कैन व संरेखण जाँच चालू है...",
      "Scanning facial structure & alignment...",
      "મુખાકૃતિ સ્કેન અને સંરેખણ તપાસ ચાલુ છે..."
    ));

    try {
      setTimeout(
        () =>
          setScanStep(
            L(
              "ललाट, नेत्र, नासिका व चिबुक कोण मापन...",
              "Measuring forehead, eye, nose & chin proportions...",
              "લલાટ, નેત્ર, નાસિકા અને હડપચીના કોણ માપન..."
            )
          ),
        800
      );
      setTimeout(
        () =>
          setScanStep(
            L(
              "महर्षि गर्ग व वराहमिहिर सामुद्रिक ग्रंथों से मिलान...",
              "Matching with Maharshi Garga & Varahamihira Samudrika texts...",
              "મહર્ષિ ગર્ગ અને વરાહમિહિર સામુદ્રિક ગ્રંથો સાથે મિલન..."
            )
          ),
        1600
      );

      const response = await fetch("/api/face-reading/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imgData,
          imageMimeType: "image/jpeg",
          gender,
          ageGroup,
          lang: cLang,
        }),
      });

      const json = await response.json();
      const fallback = getDefaultFaceAnalysis(cLang);
      if (json.ok && json.data) {
        hasCustomScanRef.current = true;
        setAnalysis({
          faceShape: json.data.faceShape || fallback.faceShape,
          faceShapeDesc: json.data.faceShapeDesc || fallback.faceShapeDesc,
          vitalityScore: json.data.vitalityScore || 92,
          temperament: json.data.temperament || fallback.temperament,
          features: Array.isArray(json.data.features) ? json.data.features : fallback.features,
          careerGuidance: json.data.careerGuidance || fallback.careerGuidance,
          remedy: json.data.remedy || fallback.remedy,
        });
      }
    } catch {
      setAnalysis(getDefaultFaceAnalysis(cLang));
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanStep("");
      }, 2200);
    }
  };

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

  const handleImagePinClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAdjustMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const info = getMoleMeaningByCoords(xPct, yPct, cLang);
    const newPin = { x: xPct, y: yPct, info };
    setCustomPins((prev) => [...prev, newPin]);
    setSelectedPinIndex(customPins.length);
    setActiveTab("moles");
  };

  const handleAudioSpeech = async () => {
    if (isSpeaking) {
      umaVoice.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const speechText = L(
      `सामुद्रिक मुखाकृति विश्लेषण। आपकी मुखाकृति स्वरूप ${analysis.faceShape} है। ${analysis.faceShapeDesc} आपका सामुद्रिक भाग्य सूचकांक ${analysis.vitalityScore} प्रतिशत है।`,
      `Samudrika Face Reading Analysis. Your face shape is ${analysis.faceShape}. ${analysis.faceShapeDesc} Your vitality score is ${analysis.vitalityScore} percent.`,
      `સામુદ્રિક મુખાકૃતિ વિશ્લેષણ. તમારી મુખાકૃતિ ${analysis.faceShape} છે. ${analysis.faceShapeDesc} તમારો સામુદ્રિક ભાગ્ય સૂચકાંક ${analysis.vitalityScore} ટકા છે.`
    );

    await umaVoice.speak(speechText, {
      voiceStyle: "uma",
      rate: 0.94,
      pitch: 1.04,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleShareResult = () => {
    const text = L(
      `*👤 सामुद्रिक मुखाकृति विज्ञान (Face Reading)*\n\n*मुखाकृति:* ${analysis.faceShape}\n*सामुद्रिक सूचकांक:* ${analysis.vitalityScore}%\n*प्रकृति:* ${analysis.temperament}\n\n*फलादेश:* ${analysis.faceShapeDesc}\n\n*करियर व धन संकेत:* ${analysis.careerGuidance}\n\n📲 *शक्ति पंचांग* से अपना चेहरा स्कैन एवं एडजस्ट करें!`,
      `*👤 Samudrika Face Reading Analysis*\n\n*Face Shape:* ${analysis.faceShape}\n*Vitality Index:* ${analysis.vitalityScore}%\n*Temperament:* ${analysis.temperament}\n\n*Reading:* ${analysis.faceShapeDesc}\n\n*Career & Wealth:* ${analysis.careerGuidance}\n\n📲 Scan & align your face on *Shakti Panchang*!`,
      `*👤 સામુદ્રિક મુખાકૃતિ વિજ્ઞાન (Face Reading)*\n\n*મુખાકૃતિ:* ${analysis.faceShape}\n*સામુદ્રિક સૂચકાંક:* ${analysis.vitalityScore}%\n*પ્રકૃતિ:* ${analysis.temperament}\n\n*ફળાદેશ:* ${analysis.faceShapeDesc}\n\n*કારકિર્દી અને ધન સંકેત:* ${analysis.careerGuidance}\n\n📲 *શક્તિ પંચાંગ* પર તમારો ચહેરો સ્કેન કરો!`
    );
    openWhatsAppShare(text);
  };

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
                {L(
                  "सामुद्रिक मुखाकृति विज्ञान (Face Reading & Alignment)",
                  "Samudrika Shastra (Face Reading & Alignment)",
                  "સામુદ્રિક મુખાકૃતિ વિજ્ઞાન (Face Reading & Alignment)"
                )}
              </h1>
              <p className="text-[11px] text-amber-300/80">
                {L(
                  "महर्षि गर्ग व वराहमिहिर कृत चेहरा समायोजन एवं भाग्य विश्लेषण",
                  "Facial proportion alignment & destiny reading per Maharshi Garga & Varahamihira",
                  "મહર્ષિ ગર્ગ અને વરાહમિહિર કૃત ચહેરા સમાયોજન અને ભાગ્ય વિશ્લેષણ"
                )}
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
              title={L("फलादेश सुनें", "Listen to Analysis", "ફળાદેશ સાંભળો")}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleShareResult}
              className="p-1.5 rounded-xl bg-amber-900/60 text-amber-200 border border-amber-700/60 hover:bg-amber-800 transition"
              title={L("व्हाट्सएप शेयर", "Share on WhatsApp", "WhatsApp પર શેર કરો")}
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
            <span>{L("व्यक्तिगत विवरण:", "Personal Details:", "વ્યક્તિગત વિગતો:")}</span>
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
                {L("पुरुष", "Male", "પુરુષ")}
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition ${
                  gender === "female" ? "bg-amber-700 text-amber-50 shadow-xs" : "text-amber-900 hover:bg-amber-200/50"
                }`}
              >
                {L("महिला", "Female", "મહિલા")}
              </button>
            </div>

            {/* Age Category */}
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as any)}
              className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-300 font-bold text-[11px] text-amber-900 outline-none"
            >
              <option value="young">{L("आयु: 18 - 30 वर्ष", "Age: 18 - 30 yrs", "ઉંમર: ૧૮ - ૩૦ વર્ષ")}</option>
              <option value="adult">{L("आयु: 30 - 50 वर्ष", "Age: 30 - 50 yrs", "ઉંમર: ૩૦ - ૫૦ વર્ષ")}</option>
              <option value="senior">{L("आयु: 50+ वर्ष", "Age: 50+ yrs", "ઉંમર: ૫૦+ વર્ષ")}</option>
            </select>
          </div>
        </div>

        {/* Live WebCam Overlay Mode */}
        {isLiveCamera ? (
          <div className="p-4 rounded-2xl bg-stone-900 border-2 border-amber-400 shadow-xl space-y-3 text-amber-50">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400 animate-pulse" />
                {L(
                  "लाइव कैमरा स्कैन (अंडाकार फ्रेम में चेहरा रखें)",
                  "Live Camera Scan (Align Face in Oval)",
                  "લાઇવ કેમેરા સ્કેન (ગોળ ફ્રેમમાં ચહેરો રાખો)"
                )}
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
                  <span className="text-[9px] text-amber-300 text-center font-mono">
                    {L("ललाट (FOREHEAD)", "FOREHEAD", "લલાટ (FOREHEAD)")}
                  </span>
                  <div className="w-full border-t border-amber-400/40" />
                  <span className="text-[9px] text-amber-300 text-center font-mono">
                    {L("नेत्र (EYE LEVEL)", "EYE LEVEL", "નેત્ર (EYE LEVEL)")}
                  </span>
                  <div className="w-full border-t border-amber-400/40" />
                  <span className="text-[9px] text-amber-300 text-center font-mono">
                    {L("चिबुक (CHIN)", "CHIN", "હડપચી (CHIN)")}
                  </span>
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
                <span>{L("फोटो खींचें एवं फ्रेम करें", "Capture & Frame Photo", "ફોટો ખેંચો અને ફ્રેમ કરો")}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Face Preview & Adjustment Area */
          <div className="p-3.5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#5C3A21]">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{L("मुखाकृति समायोजन एवं स्कैनिंग", "Face Alignment & Scanning", "મુખાકૃતિ સમાયોજન અને સ્કેનિંગ")}</span>
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
                  <span>
                    {isAdjustMode
                      ? L("एडजस्ट मोड ऑन", "Adjust Mode On", "એડજસ્ટ મોડ ચાલુ")
                      : L("चेहरा एडजस्ट करें", "Adjust Face", "ચહેરો એડજસ્ટ કરો")}
                  </span>
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
                    <p className="text-xs font-bold">{L("कोई फोटो उपलब्ध नहीं", "No photo available", "કોઈ ફોટો ઉપલબ્ધ નથી")}</p>
                  </div>
                )}

                {/* Live Vedic Grid Overlay Guides */}
                {showGridOverlay && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-amber-400/40 rounded-2xl flex flex-col justify-between p-3 m-2">
                    <div className="flex justify-between text-[8px] text-amber-300 font-mono tracking-wider">
                      <span>{L("[LALAT: ललाट]", "[LALAT: FOREHEAD]", "[LALAT: લલાટ]")}</span>
                      <span>[TRILOK: OVAL]</span>
                    </div>

                    {/* Central Alignment Target */}
                    <div className="w-40 h-52 border-2 border-dashed border-amber-400/80 rounded-[50%] mx-auto flex flex-col justify-between p-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <div className="w-full border-b border-amber-400/30 text-[8px] text-amber-300 text-center">
                        {L("ललाट रेखा", "Forehead Line", "લલાટ રેખા")}
                      </div>
                      <div className="w-full border-b border-amber-400/40 flex justify-between px-2 text-[8px] text-amber-300">
                        <span>{L("दायाँ नेत्र", "Right Eye", "જમણું નેત્ર")}</span>
                        <span>{L("बायाँ नेत्र", "Left Eye", "ડાબું નેત્ર")}</span>
                      </div>
                      <div className="w-full border-b border-amber-400/30 text-[8px] text-amber-300 text-center">
                        {L("नासिका रेखा", "Nose Line", "નાસિકા રેખા")}
                      </div>
                      <div className="text-[8px] text-amber-300 text-center">
                        {L("चिबुक", "Chin", "હડપચી")}
                      </div>
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
                    {L(
                      "👆 चेहरे पर किसी भी स्थान पर क्लिक करके तिल / चिह्न फलादेश देखें",
                      "👆 Tap anywhere on the face to inspect mole & mark significance",
                      "👆 ચહેરા પર કોઈપણ સ્થાન પર ક્લિક કરીને તલ / ચિહ્ન ફળાદેશ જુઓ"
                    )}
                  </div>
                )}
              </div>

              {/* Adjustment Controls Panel OR Action Buttons */}
              {isAdjustMode ? (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2.5">
                  <div className="text-xs font-black text-amber-950 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Crop className="w-4 h-4 text-amber-700" />
                      {L("चेहरा संरेखण व एडजस्टमेंट", "Face Alignment & Adjustment", "ચહેરો સંરેખણ અને એડજસ્ટમેન્ટ")}
                    </span>
                    <button
                      type="button"
                      onClick={resetAdjustments}
                      className="text-[10px] text-amber-800 font-bold underline hover:text-amber-950"
                    >
                      {L("रीसेट करें", "Reset", "રીસેટ કરો")}
                    </button>
                  </div>

                  {/* Zoom Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-amber-900">
                      <span className="flex items-center gap-1">
                        <ZoomIn className="w-3.5 h-3.5" /> {L("ज़ूम (Zoom)", "Zoom", "ઝૂમ (Zoom)")}
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
                        <RotateCw className="w-3.5 h-3.5" /> {L("कोण घूर्णन (Rotation)", "Rotation", "કોણ પરિભ્રમણ (Rotation)")}
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
                      <span>
                        {flipH
                          ? L("फ्लिप सक्रिय", "Flip Active", "ફ્લિપ સક્રિય")
                          : L("क्षैतिज फ्लिप", "Flip Horizontal", "આડી ફ્લિપ")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowGridOverlay(!showGridOverlay)}
                      className={`p-1.5 rounded-lg text-[10px] font-bold border transition flex items-center justify-center gap-1 ${
                        showGridOverlay ? "bg-amber-700 text-amber-50" : "bg-white text-stone-800 border-amber-300"
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>
                        {showGridOverlay
                          ? L("ग्रिड दृश्यमान", "Grid Visible", "ગ્રિડ દૃશ્યમાન")
                          : L("ग्रिड छिपाएँ", "Hide Grid", "ગ્રિડ છુપાવો")}
                      </span>
                    </button>
                  </div>

                  {/* Apply & Crop Button */}
                  <button
                    type="button"
                    onClick={applyAdjustmentAndScan}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-amber-50 font-black text-xs shadow-md hover:from-emerald-800 hover:to-teal-900 transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>
                      {L("एडजस्टमेंट लागू करें एवं स्कैन करें", "Apply Alignment & Scan", "એડજસ્ટમેન્ટ લાગુ કરો અને સ્કેન કરો")}
                    </span>
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
                  <input
                    ref={cameraCaptureInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
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
                      <span>{L("गैलरी फोटो", "Gallery Photo", "ગેલેરી ફોટો")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={isScanning}
                      className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 text-amber-200 text-[11px] font-bold shadow-md hover:from-stone-900 hover:to-black transition flex items-center justify-center gap-1 cursor-pointer border border-amber-600/40"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{L("लाइव कैमरा", "Live Camera", "લાઇવ કેમેરા")}</span>
                    </button>
                  </div>

                  <div className="text-[11px] font-bold text-[#8C6239] pt-1">
                    {L("या मुख्य मुखाकृति सैंपल चुनें:", "Or select a sample face archetype:", "અથવા મુખ્ય મુખાકૃતિ નમૂનો પસંદ કરો:")}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {presetFaces.map((preset) => (
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
            {L("👤 मुख्य फलादेश", "👤 Main Reading", "👤 મુખ્ય ફળાદેશ")}
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
            {L("👁️ अंगवार लक्षण", "👁️ Feature Traits", "👁️ અંગવાર લક્ષણો")}
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
            {L("💼 धन व करियर", "💼 Wealth & Career", "💼 ધન અને કારકિર્દી")}
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
            {L(
              `📍 तिल व लक्षण चिह्नीकरण (${faceMoles.length + customPins.length})`,
              `📍 Moles & Marks (${faceMoles.length + customPins.length})`,
              `📍 તલ અને લક્ષણ ચિહ્નીકરણ (${faceMoles.length + customPins.length})`
            )}
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
            {L("✨ सात्विक उपाय", "✨ Sattvic Remedies", "✨ સાત્વિક ઉપાયો")}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            {/* Vitality Index Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-stone-950 shadow-md relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1 relative z-10 max-w-[70%]">
                <span className="px-2 py-0.5 rounded-full bg-stone-950/20 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                  {L("सामुद्रिक सूचकांक", "Samudrika Index", "સામુદ્રિક સૂચકાંક")}
                </span>
                <div className="text-xl font-black font-granth">
                  {L("मुखाकृति स्वरूप:", "Face Archetype:", "મુખાકૃતિ સ્વરૂપ:")} {analysis.faceShape}
                </div>
                <p className="text-xs font-medium opacity-90">
                  {L("प्रकृति:", "Temperament:", "પ્રકૃતિ:")} <strong>{analysis.temperament}</strong>
                </p>
              </div>

              <div className="text-center bg-stone-950/15 p-2.5 rounded-2xl border border-amber-300/40 shrink-0">
                <div className="text-2xl font-black">{analysis.vitalityScore}%</div>
                <div className="text-[9px] font-bold uppercase">
                  {L("भाग्य ऊर्जा", "Vitality", "ભાગ્ય ઊર્જા")}
                </div>
              </div>
            </div>

            {/* Main Explanation */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2 font-sans">
              <h3 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{L("मुखाकृति विस्तृत विश्लेषण व गुणधर्म", "Detailed Facial Analysis & Qualities", "મુખાકૃતિ વિસ્તૃત વિશ્લેષણ અને ગુણધર્મો")}</span>
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
                    L(
                      `मेरी मुखाकृति (${analysis.faceShape}) के आधार पर संपूर्ण जीवन का भाग्य फलादेश बताएं।`,
                      `Give me a complete destiny reading based on my face shape (${analysis.faceShape}).`,
                      `મારી મુખાકૃતિ (${analysis.faceShape}) ના આધારે સંપૂર્ણ જીવનનું ભાગ્ય ફળાદેશ જણાવો.`
                    )
                  )
                }
                className="w-full p-3 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-between hover:bg-amber-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔮</span>
                  <span>
                    {L(
                      "उमा AI से मुखाकृति संबंधी व्यक्तिगत प्रश्न पूछें",
                      "Ask Uma for Personalized Face-Reading Guidance",
                      "ઉમા પાસેથી મુખાકૃતિ સંબંધી વ્યક્તિગત માર્ગદર્શન મેળવો"
                    )}
                  </span>
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
                    {L("सामुद्रिक लक्षण", "Samudrika Trait", "સામુદ્રિક લક્ષણ")}
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
                <span>{L("धन, वैभव व करियर संभावनाएँ", "Wealth, Prosperity & Career Prospects", "ધન, વૈભવ અને કારકિર્દી સંભાવનાઓ")}</span>
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
                <span>
                  {L(
                    "चेहरे के प्रमुख तिलों व कस्टम पॉइंट्स का फलादेश",
                    "Facial Moles & Custom Tapped Marks Reading",
                    "ચહેરાના મુખ્ય તલ અને કસ્ટમ પોઇન્ટ્સનું ફળાદેશ"
                  )}
                </span>
              </div>
            </div>

            {/* Custom Pinned Points Section */}
            {customPins.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300/80 space-y-2">
                <div className="text-xs font-bold text-amber-950">
                  {L(
                    `📍 आपके द्वारा फोटो पर अंकित किए गए स्थान (${customPins.length}):`,
                    `📍 Points Marked by You on Photo (${customPins.length}):`,
                    `📍 તમારા દ્વારા ફોટો પર અંકિત કરાયેલા સ્થાન (${customPins.length}):`
                  )}
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
                          {L("बिंदु", "Point", "બિંદુ")} #{pinIdx + 1}: {p.info.location}
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
              {faceMoles.map((mole, mIdx) => (
                <button
                  key={mole.id}
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
            {faceMoles[selectedMoleIndex] && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
                <div className="text-xs font-black text-amber-950">
                  {L("🎯 विस्तृत प्रभाव:", "🎯 Detailed Effect:", "🎯 વિસ્તૃત પ્રભાવ:")} {faceMoles[selectedMoleIndex].location}
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {faceMoles[selectedMoleIndex].meaning}
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
              <span>{L("शास्त्रोक्त सात्विक उपाय व रत्नोपचार", "Authentic Sattvic Remedies & Gem Guidance", "શાસ્ત્રોક્ત સાત્વિક ઉપાયો અને રત્નોપચાર")}</span>
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

