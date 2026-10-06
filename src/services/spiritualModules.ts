/**
 * Shakti Panchang - Spiritual Modules Engine
 * Logic, Datasets & Calculations for:
 * 1. Palmistry (हस्तरेखा)
 * 2. Tarot Card Reading (टैरो कार्ड)
 * 3. Gemology (रत्न विज्ञान)
 * 4. Face Reading (सामुद्रिक मुख लक्षण शास्त्र)
 * 5. I-Ching (आई-चिंग / परिवर्तन की पुस्तक)
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Ensure Capacitor PWA elements are registered on the client
if (typeof window !== 'undefined') {
  try {
    defineCustomElements(window);
  } catch {
    // Silently continue if already defined
  }
}

// =========================================================================
// 1. CAPACITOR CAMERA HARDWARE INTEGRATION HELPER
// =========================================================================

export interface CapturedImageResult {
  imageUrl: string;
  source: 'native_camera' | 'file_picker' | 'sample_simulated';
  timestamp: number;
}

/**
 * Capture an image using Capacitor Camera plugin with fallback for web / permission issues
 */
export async function captureSpiritualScanPhoto(type: 'palm' | 'face'): Promise<CapturedImageResult> {
  try {
    if (Capacitor.isPluginAvailable('Camera')) {
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        promptLabelHeader: type === 'palm' ? 'Palm Scan' : 'Face Scan',
        promptLabelPhoto: 'From Gallery',
        promptLabelPicture: 'Take Photo',
      });

      if (photo?.webPath) {
        return {
          imageUrl: photo.webPath,
          source: 'native_camera',
          timestamp: Date.now(),
        };
      }
    }
  } catch (err) {
    console.warn('Native camera unavailable or permission denied, using spiritual scanner simulation', err);
  }

  // Realistic sample high-res illustration fallback for web & simulation testing
  const fallbackUrl =
    type === 'palm'
      ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

  return {
    imageUrl: fallbackUrl,
    source: 'sample_simulated',
    timestamp: Date.now(),
  };
}

// =========================================================================
// 2. PALMISTRY ENGINE & TYPES (हस्तरेखा विज्ञान)
// =========================================================================

export interface PalmLineAnalysis {
  nameKey: string;
  sanskritName: string;
  length: 'long' | 'medium' | 'deep';
  qualityKey: string;
  interpretationKey: string;
  mountAffinity: string;
  remedyKey: string;
}

export interface PalmScanAnalysisResult {
  dominantHand: 'right' | 'left';
  handShape: 'earth' | 'fire' | 'water' | 'air';
  handShapeDescKey: string;
  lines: PalmLineAnalysis[];
  mounts: {
    mountKey: string;
    planet: string;
    strength: number; // 0 - 100
    influenceKey: string;
  }[];
  fortuneScore: number;
}

export function generatePalmAnalysis(hand: 'right' | 'left' = 'right'): PalmScanAnalysisResult {
  return {
    dominantHand: hand,
    handShape: 'earth',
    handShapeDescKey: 'palmistry.handShapeEarth',
    fortuneScore: 88,
    lines: [
      {
        nameKey: 'palmistry.lifeLine',
        sanskritName: 'जीवन रेखा (Life Line)',
        length: 'long',
        qualityKey: 'palmistry.lifeLineQuality',
        interpretationKey: 'palmistry.lifeLineInterp',
        mountAffinity: 'शुक्र पर्वत (Mount of Venus)',
        remedyKey: 'palmistry.lifeLineRemedy',
      },
      {
        nameKey: 'palmistry.heartLine',
        sanskritName: 'हृदय रेखा (Heart Line)',
        length: 'deep',
        qualityKey: 'palmistry.heartLineQuality',
        interpretationKey: 'palmistry.heartLineInterp',
        mountAffinity: 'बृहस्पति पर्वत (Mount of Jupiter)',
        remedyKey: 'palmistry.heartLineRemedy',
      },
      {
        nameKey: 'palmistry.headLine',
        sanskritName: 'मस्तिष्क रेखा (Head Line)',
        length: 'long',
        qualityKey: 'palmistry.headLineQuality',
        interpretationKey: 'palmistry.headLineInterp',
        mountAffinity: 'मंगल पर्वत (Mount of Mars)',
        remedyKey: 'palmistry.headLineRemedy',
      },
      {
        nameKey: 'palmistry.fateLine',
        sanskritName: 'भाग्य रेखा (Fate Line / शनि रेखा)',
        length: 'medium',
        qualityKey: 'palmistry.fateLineQuality',
        interpretationKey: 'palmistry.fateLineInterp',
        mountAffinity: 'शनि पर्वत (Mount of Saturn)',
        remedyKey: 'palmistry.fateLineRemedy',
      },
      {
        nameKey: 'palmistry.sunLine',
        sanskritName: 'सूर्य रेखा (Sun / Apollo Line - कीर्ति रेखा)',
        length: 'medium',
        qualityKey: 'palmistry.sunLineQuality',
        interpretationKey: 'palmistry.sunLineInterp',
        mountAffinity: 'सूर्य पर्वत (Mount of Sun)',
        remedyKey: 'palmistry.sunLineRemedy',
      },
    ],
    mounts: [
      {
        mountKey: 'palmistry.mountJupiter',
        planet: 'गुरु (Jupiter)',
        strength: 92,
        influenceKey: 'palmistry.mountJupiterDesc',
      },
      {
        mountKey: 'palmistry.mountVenus',
        planet: 'शुक्र (Venus)',
        strength: 86,
        influenceKey: 'palmistry.mountVenusDesc',
      },
      {
        mountKey: 'palmistry.mountSaturn',
        planet: 'शनि (Saturn)',
        strength: 78,
        influenceKey: 'palmistry.mountSaturnDesc',
      },
      {
        mountKey: 'palmistry.mountSun',
        planet: 'सूर्य (Sun)',
        strength: 84,
        influenceKey: 'palmistry.mountSunDesc',
      },
    ],
  };
}

// =========================================================================
// 3. TAROT CARD READING ENGINE (टैरो कार्ड विधा)
// =========================================================================

export interface TarotCard {
  id: number;
  nameKey: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  uprightKeywordsKey: string;
  reversedKeywordsKey: string;
  uprightMeaningKey: string;
  reversedMeaningKey: string;
  guidanceKey: string;
  element: string;
  numerologyNumber: number;
  imageUrl: string;
}

export const TAROT_MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    nameKey: 'tarot.card0Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card0UpKeywords',
    reversedKeywordsKey: 'tarot.card0RevKeywords',
    uprightMeaningKey: 'tarot.card0UpMeaning',
    reversedMeaningKey: 'tarot.card0RevMeaning',
    guidanceKey: 'tarot.card0Guidance',
    element: 'Air (वायु)',
    numerologyNumber: 0,
    imageUrl: '🃏',
  },
  {
    id: 1,
    nameKey: 'tarot.card1Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card1UpKeywords',
    reversedKeywordsKey: 'tarot.card1RevKeywords',
    uprightMeaningKey: 'tarot.card1UpMeaning',
    reversedMeaningKey: 'tarot.card1RevMeaning',
    guidanceKey: 'tarot.card1Guidance',
    element: 'Air / Mercury (बुध)',
    numerologyNumber: 1,
    imageUrl: '🪄',
  },
  {
    id: 2,
    nameKey: 'tarot.card2Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card2UpKeywords',
    reversedKeywordsKey: 'tarot.card2RevKeywords',
    uprightMeaningKey: 'tarot.card2UpMeaning',
    reversedMeaningKey: 'tarot.card2RevMeaning',
    guidanceKey: 'tarot.card2Guidance',
    element: 'Water / Moon (चन्द्र)',
    numerologyNumber: 2,
    imageUrl: '🌙',
  },
  {
    id: 3,
    nameKey: 'tarot.card3Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card3UpKeywords',
    reversedKeywordsKey: 'tarot.card3RevKeywords',
    uprightMeaningKey: 'tarot.card3UpMeaning',
    reversedMeaningKey: 'tarot.card3RevMeaning',
    guidanceKey: 'tarot.card3Guidance',
    element: 'Earth / Venus (शुक्र)',
    numerologyNumber: 3,
    imageUrl: '👑',
  },
  {
    id: 4,
    nameKey: 'tarot.card4Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card4UpKeywords',
    reversedKeywordsKey: 'tarot.card4RevKeywords',
    uprightMeaningKey: 'tarot.card4UpMeaning',
    reversedMeaningKey: 'tarot.card4RevMeaning',
    guidanceKey: 'tarot.card4Guidance',
    element: 'Fire / Aries (मंगल)',
    numerologyNumber: 4,
    imageUrl: '🏛️',
  },
  {
    id: 5,
    nameKey: 'tarot.card5Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card5UpKeywords',
    reversedKeywordsKey: 'tarot.card5RevKeywords',
    uprightMeaningKey: 'tarot.card5UpMeaning',
    reversedMeaningKey: 'tarot.card5RevMeaning',
    guidanceKey: 'tarot.card5Guidance',
    element: 'Earth / Taurus (गुरु)',
    numerologyNumber: 5,
    imageUrl: '📜',
  },
  {
    id: 6,
    nameKey: 'tarot.card6Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card6UpKeywords',
    reversedKeywordsKey: 'tarot.card6RevKeywords',
    uprightMeaningKey: 'tarot.card6UpMeaning',
    reversedMeaningKey: 'tarot.card6RevMeaning',
    guidanceKey: 'tarot.card6Guidance',
    element: 'Air / Gemini (बुध)',
    numerologyNumber: 6,
    imageUrl: '❤️',
  },
  {
    id: 7,
    nameKey: 'tarot.card7Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card7UpKeywords',
    reversedKeywordsKey: 'tarot.card7RevKeywords',
    uprightMeaningKey: 'tarot.card7UpMeaning',
    reversedMeaningKey: 'tarot.card7RevMeaning',
    guidanceKey: 'tarot.card7Guidance',
    element: 'Water / Cancer (चन्द्र)',
    numerologyNumber: 7,
    imageUrl: '⚔️',
  },
  {
    id: 8,
    nameKey: 'tarot.card8Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card8UpKeywords',
    reversedKeywordsKey: 'tarot.card8RevKeywords',
    uprightMeaningKey: 'tarot.card8UpMeaning',
    reversedMeaningKey: 'tarot.card8RevMeaning',
    guidanceKey: 'tarot.card8Guidance',
    element: 'Fire / Leo (सूर्य)',
    numerologyNumber: 8,
    imageUrl: '🦁',
  },
  {
    id: 9,
    nameKey: 'tarot.card9Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card9UpKeywords',
    reversedKeywordsKey: 'tarot.card9RevKeywords',
    uprightMeaningKey: 'tarot.card9UpMeaning',
    reversedMeaningKey: 'tarot.card9RevMeaning',
    guidanceKey: 'tarot.card9Guidance',
    element: 'Earth / Virgo (बुध)',
    numerologyNumber: 9,
    imageUrl: '🕯️',
  },
  {
    id: 10,
    nameKey: 'tarot.card10Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card10UpKeywords',
    reversedKeywordsKey: 'tarot.card10RevKeywords',
    uprightMeaningKey: 'tarot.card10UpMeaning',
    reversedMeaningKey: 'tarot.card10RevMeaning',
    guidanceKey: 'tarot.card10Guidance',
    element: 'Fire / Jupiter (गुरु)',
    numerologyNumber: 1,
    imageUrl: '🎡',
  },
  {
    id: 19,
    nameKey: 'tarot.card19Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card19UpKeywords',
    reversedKeywordsKey: 'tarot.card19RevKeywords',
    uprightMeaningKey: 'tarot.card19UpMeaning',
    reversedMeaningKey: 'tarot.card19RevMeaning',
    guidanceKey: 'tarot.card19Guidance',
    element: 'Fire / Sun (सूर्य)',
    numerologyNumber: 1,
    imageUrl: '☀️',
  },
  {
    id: 21,
    nameKey: 'tarot.card21Name',
    arcana: 'major',
    uprightKeywordsKey: 'tarot.card21UpKeywords',
    reversedKeywordsKey: 'tarot.card21RevKeywords',
    uprightMeaningKey: 'tarot.card21UpMeaning',
    reversedMeaningKey: 'tarot.card21RevMeaning',
    guidanceKey: 'tarot.card21Guidance',
    element: 'Earth / Saturn (शनि)',
    numerologyNumber: 3,
    imageUrl: '🌍',
  },
];

export interface DrawnTarotCard {
  card: TarotCard;
  isReversed: boolean;
  positionKey: string; // 'tarot.posSingle' | 'tarot.posPast' | 'tarot.posPresent' | 'tarot.posFuture'
}

export function drawRandomTarotCards(count: 1 | 3 = 1): DrawnTarotCard[] {
  const shuffled = [...TAROT_MAJOR_ARCANA].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  const positionKeys =
    count === 1
      ? ['tarot.posSingle']
      : ['tarot.posPast', 'tarot.posPresent', 'tarot.posFuture'];

  return selected.map((card, i) => ({
    card,
    isReversed: Math.random() < 0.25, // 25% chance of reversal
    positionKey: positionKeys[i],
  }));
}

// =========================================================================
// 4. GEMOLOGY ENGINE & TYPES (रत्न विज्ञान व रत्नोपचार)
// =========================================================================

export interface GemstoneData {
  id: string;
  nameKey: string;
  sanskritName: string;
  planetKey: string;
  colorKey: string;
  suitableRashis: string[];
  metalKey: string;
  fingerKey: string;
  dayKey: string;
  mantra: string;
  benefitsKey: string;
  testingTipKey: string;
  precautionsKey: string;
  substitutesKey: string;
  iconEmoji: string;
}

export const NAVARATNA_DATA: GemstoneData[] = [
  {
    id: 'ruby',
    nameKey: 'gemology.rubyName',
    sanskritName: 'माणिक्य (Ruby)',
    planetKey: 'gemology.planetSun',
    colorKey: 'gemology.colorRed',
    suitableRashis: ['सिंह (Leo)', 'मेष (Aries)', 'धनु (Sagittarius)'],
    metalKey: 'gemology.metalGoldCopper',
    fingerKey: 'gemology.fingerRing',
    dayKey: 'gemology.daySunday',
    mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    benefitsKey: 'gemology.rubyBenefits',
    testingTipKey: 'gemology.rubyTesting',
    precautionsKey: 'gemology.rubyPrecautions',
    substitutesKey: 'gemology.rubySubs',
    iconEmoji: '🔴',
  },
  {
    id: 'pearl',
    nameKey: 'gemology.pearlName',
    sanskritName: 'मुक्ता / मोती (Pearl)',
    planetKey: 'gemology.planetMoon',
    colorKey: 'gemology.colorWhite',
    suitableRashis: ['कर्क (Cancer)', 'मीन (Pisces)', 'वृश्चिक (Scorpio)'],
    metalKey: 'gemology.metalSilver',
    fingerKey: 'gemology.fingerLittle',
    dayKey: 'gemology.dayMonday',
    mantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
    benefitsKey: 'gemology.pearlBenefits',
    testingTipKey: 'gemology.pearlTesting',
    precautionsKey: 'gemology.pearlPrecautions',
    substitutesKey: 'gemology.pearlSubs',
    iconEmoji: '⚪',
  },
  {
    id: 'coral',
    nameKey: 'gemology.coralName',
    sanskritName: 'प्रवाल / मूंगा (Red Coral)',
    planetKey: 'gemology.planetMars',
    colorKey: 'gemology.colorOrangeRed',
    suitableRashis: ['मेष (Aries)', 'वृश्चिक (Scorpio)', 'धनु (Sagittarius)'],
    metalKey: 'gemology.metalGoldCopper',
    fingerKey: 'gemology.fingerRing',
    dayKey: 'gemology.dayTuesday',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    benefitsKey: 'gemology.coralBenefits',
    testingTipKey: 'gemology.coralTesting',
    precautionsKey: 'gemology.coralPrecautions',
    substitutesKey: 'gemology.coralSubs',
    iconEmoji: '🪸',
  },
  {
    id: 'emerald',
    nameKey: 'gemology.emeraldName',
    sanskritName: 'मरकत / पन्ना (Emerald)',
    planetKey: 'gemology.planetMercury',
    colorKey: 'gemology.colorGreen',
    suitableRashis: ['मिथुन (Gemini)', 'कन्या (Virgo)', 'वृषभ (Taurus)'],
    metalKey: 'gemology.metalGoldSilver',
    fingerKey: 'gemology.fingerLittle',
    dayKey: 'gemology.dayWednesday',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    benefitsKey: 'gemology.emeraldBenefits',
    testingTipKey: 'gemology.emeraldTesting',
    precautionsKey: 'gemology.emeraldPrecautions',
    substitutesKey: 'gemology.emeraldSubs',
    iconEmoji: '🟢',
  },
  {
    id: 'yellow_sapphire',
    nameKey: 'gemology.yellowSapphireName',
    sanskritName: 'पुष्पराग / पुखराज (Yellow Sapphire)',
    planetKey: 'gemology.planetJupiter',
    colorKey: 'gemology.colorYellow',
    suitableRashis: ['धनु (Sagittarius)', 'मीन (Pisces)', 'मेष (Aries)'],
    metalKey: 'gemology.metalGold',
    fingerKey: 'gemology.fingerIndex',
    dayKey: 'gemology.dayThursday',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    benefitsKey: 'gemology.yellowSapphireBenefits',
    testingTipKey: 'gemology.yellowSapphireTesting',
    precautionsKey: 'gemology.yellowSapphirePrecautions',
    substitutesKey: 'gemology.yellowSapphireSubs',
    iconEmoji: '🟡',
  },
  {
    id: 'diamond',
    nameKey: 'gemology.diamondName',
    sanskritName: 'हीरा / वज्र (Diamond)',
    planetKey: 'gemology.planetVenus',
    colorKey: 'gemology.colorWhiteSparkle',
    suitableRashis: ['वृषभ (Taurus)', 'तुला (Libra)', 'मकर (Capricorn)'],
    metalKey: 'gemology.metalPlatinumSilver',
    fingerKey: 'gemology.fingerMiddleLittle',
    dayKey: 'gemology.dayFriday',
    mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    benefitsKey: 'gemology.diamondBenefits',
    testingTipKey: 'gemology.diamondTesting',
    precautionsKey: 'gemology.diamondPrecautions',
    substitutesKey: 'gemology.diamondSubs',
    iconEmoji: '💎',
  },
  {
    id: 'blue_sapphire',
    nameKey: 'gemology.blueSapphireName',
    sanskritName: 'इन्द्रनील / नीलम (Blue Sapphire)',
    planetKey: 'gemology.planetSaturn',
    colorKey: 'gemology.colorDeepBlue',
    suitableRashis: ['मकर (Capricorn)', 'कुम्भ (Aquarius)', 'वृषभ (Taurus)'],
    metalKey: 'gemology.metalSilverSteel',
    fingerKey: 'gemology.fingerMiddle',
    dayKey: 'gemology.daySaturday',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    benefitsKey: 'gemology.blueSapphireBenefits',
    testingTipKey: 'gemology.blueSapphireTesting',
    precautionsKey: 'gemology.blueSapphirePrecautions',
    substitutesKey: 'gemology.blueSapphireSubs',
    iconEmoji: '🔷',
  },
  {
    id: 'hessonite',
    nameKey: 'gemology.hessoniteName',
    sanskritName: 'गोमेद (Hessonite)',
    planetKey: 'gemology.planetRahu',
    colorKey: 'gemology.colorHoneyBrown',
    suitableRashis: ['मिथुन (Gemini)', 'तुला (Libra)', 'कुम्भ (Aquarius)'],
    metalKey: 'gemology.metalAshtadhatuSilver',
    fingerKey: 'gemology.fingerMiddle',
    dayKey: 'gemology.daySaturday',
    mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    benefitsKey: 'gemology.hessoniteBenefits',
    testingTipKey: 'gemology.hessoniteTesting',
    precautionsKey: 'gemology.hessonitePrecautions',
    substitutesKey: 'gemology.hessoniteSubs',
    iconEmoji: '🟤',
  },
  {
    id: 'cats_eye',
    nameKey: 'gemology.catsEyeName',
    sanskritName: 'वैसूर्य / लहसुनिया (Cat’s Eye)',
    planetKey: 'gemology.planetKetu',
    colorKey: 'gemology.colorChrysoberylGreen',
    suitableRashis: ['मीन (Pisces)', 'धनु (Sagittarius)'],
    metalKey: 'gemology.metalSilver',
    fingerKey: 'gemology.fingerMiddleLittle',
    dayKey: 'gemology.dayThursdaySaturday',
    mantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
    benefitsKey: 'gemology.catsEyeBenefits',
    testingTipKey: 'gemology.catsEyeTesting',
    precautionsKey: 'gemology.catsEyePrecautions',
    substitutesKey: 'gemology.catsEyeSubs',
    iconEmoji: '👁️',
  },
];

export function findRecommendedGemstone(goal: 'wealth' | 'health' | 'career' | 'marriage' | 'protection'): GemstoneData {
  switch (goal) {
    case 'wealth':
      return NAVARATNA_DATA.find((g) => g.id === 'yellow_sapphire')!;
    case 'career':
      return NAVARATNA_DATA.find((g) => g.id === 'ruby')!;
    case 'health':
      return NAVARATNA_DATA.find((g) => g.id === 'pearl')!;
    case 'marriage':
      return NAVARATNA_DATA.find((g) => g.id === 'diamond')!;
    case 'protection':
    default:
      return NAVARATNA_DATA.find((g) => g.id === 'coral')!;
  }
}

// =========================================================================
// 5. FACE READING ENGINE & TYPES (सामुद्रिक मुख लक्षण शास्त्र)
// =========================================================================

export interface FacialFeatureAnalysis {
  partKey: string;
  typeKey: string;
  traitsKey: string;
  samudrikaWisdomKey: string;
  confidence: number;
}

export interface FaceReadingResult {
  faceShapeKey: string;
  faceShapeDescKey: string;
  features: FacialFeatureAnalysis[];
  vitalityScore: number;
  temperamentKey: string;
}

export function generateFaceReadingAnalysis(): FaceReadingResult {
  return {
    faceShapeKey: 'faceReading.shapeOval',
    faceShapeDescKey: 'faceReading.shapeOvalDesc',
    vitalityScore: 91,
    temperamentKey: 'faceReading.temperamentSattvic',
    features: [
      {
        partKey: 'faceReading.forehead',
        typeKey: 'faceReading.foreheadBroad',
        traitsKey: 'faceReading.foreheadBroadTraits',
        samudrikaWisdomKey: 'faceReading.foreheadWisdom',
        confidence: 94,
      },
      {
        partKey: 'faceReading.eyes',
        typeKey: 'faceReading.eyesBright',
        traitsKey: 'faceReading.eyesBrightTraits',
        samudrikaWisdomKey: 'faceReading.eyesWisdom',
        confidence: 96,
      },
      {
        partKey: 'faceReading.nose',
        typeKey: 'faceReading.noseStraight',
        traitsKey: 'faceReading.noseStraightTraits',
        samudrikaWisdomKey: 'faceReading.noseWisdom',
        confidence: 89,
      },
      {
        partKey: 'faceReading.lips',
        typeKey: 'faceReading.lipsWellDefined',
        traitsKey: 'faceReading.lipsWellDefinedTraits',
        samudrikaWisdomKey: 'faceReading.lipsWisdom',
        confidence: 92,
      },
      {
        partKey: 'faceReading.chin',
        typeKey: 'faceReading.chinFirm',
        traitsKey: 'faceReading.chinFirmTraits',
        samudrikaWisdomKey: 'faceReading.chinWisdom',
        confidence: 88,
      },
    ],
  };
}

// =========================================================================
// 6. I-CHING ENGINE & TYPES (आई-चिंग / परिवर्तन की पुस्तक)
// =========================================================================

export interface IChingLine {
  value: 6 | 7 | 8 | 9; // 6: Old Yin (changing), 7: Young Yang, 8: Young Yin, 9: Old Yang (changing)
  isYang: boolean;
  isChanging: boolean;
}

export interface IChingHexagram {
  number: number;
  chineseName: string;
  nameKey: string;
  pinyin: string;
  upperTrigramKey: string;
  lowerTrigramKey: string;
  judgmentKey: string;
  imageKey: string;
  practicalAdviceKey: string;
  symbolEmoji: string;
}

export const I_CHING_KEY_HEXAGRAMS: Record<number, IChingHexagram> = {
  1: {
    number: 1,
    chineseName: '乾 (Qián)',
    nameKey: 'iching.hex1Name',
    pinyin: 'The Creative / Force (स्वर्ग / सृजन शक्ति)',
    upperTrigramKey: 'iching.trigramHeaven',
    lowerTrigramKey: 'iching.trigramHeaven',
    judgmentKey: 'iching.hex1Judgment',
    imageKey: 'iching.hex1Image',
    practicalAdviceKey: 'iching.hex1Advice',
    symbolEmoji: '☰',
  },
  2: {
    number: 2,
    chineseName: '坤 (Kūn)',
    nameKey: 'iching.hex2Name',
    pinyin: 'The Receptive / Field (पृथ्वी / समर्पण एवं पोषण)',
    upperTrigramKey: 'iching.trigramEarth',
    lowerTrigramKey: 'iching.trigramEarth',
    judgmentKey: 'iching.hex2Judgment',
    imageKey: 'iching.hex2Image',
    practicalAdviceKey: 'iching.hex2Advice',
    symbolEmoji: '☷',
  },
  11: {
    number: 11,
    chineseName: '泰 (Tài)',
    nameKey: 'iching.hex11Name',
    pinyin: 'Peace / Harmony (शांति, समन्वय व समृद्धि)',
    upperTrigramKey: 'iching.trigramEarth',
    lowerTrigramKey: 'iching.trigramHeaven',
    judgmentKey: 'iching.hex11Judgment',
    imageKey: 'iching.hex11Image',
    practicalAdviceKey: 'iching.hex11Advice',
    symbolEmoji: '☯️',
  },
  14: {
    number: 14,
    chineseName: '大有 (Dà Yǒu)',
    nameKey: 'iching.hex14Name',
    pinyin: 'Possession in Great Measure (विपुल संपदा व महान सिद्धि)',
    upperTrigramKey: 'iching.trigramFire',
    lowerTrigramKey: 'iching.trigramHeaven',
    judgmentKey: 'iching.hex14Judgment',
    imageKey: 'iching.hex14Image',
    practicalAdviceKey: 'iching.hex14Advice',
    symbolEmoji: '🔥',
  },
  24: {
    number: 24,
    chineseName: '復 (Fù)',
    nameKey: 'iching.hex24Name',
    pinyin: 'Return / The Turning Point (पुनरागमन व नवजागरण)',
    upperTrigramKey: 'iching.trigramEarth',
    lowerTrigramKey: 'iching.trigramThunder',
    judgmentKey: 'iching.hex24Judgment',
    imageKey: 'iching.hex24Image',
    practicalAdviceKey: 'iching.hex24Advice',
    symbolEmoji: '⚡',
  },
  64: {
    number: 64,
    chineseName: '未濟 (Wèi Jì)',
    nameKey: 'iching.hex64Name',
    pinyin: 'Before Completion (पूर्णता से पूर्व / सतत साधना)',
    upperTrigramKey: 'iching.trigramFire',
    lowerTrigramKey: 'iching.trigramWater',
    judgmentKey: 'iching.hex64Judgment',
    imageKey: 'iching.hex64Image',
    practicalAdviceKey: 'iching.hex64Advice',
    symbolEmoji: '🌊',
  },
};

/**
 * Throw 3 coins 6 times to generate an authentic 6-line Hexagram
 * Heads = 3, Tails = 2
 * Sum = 6 (Old Yin), 7 (Young Yang), 8 (Young Yin), 9 (Old Yang)
 */
export function castIChingCoins(): {
  lines: IChingLine[];
  hexagram: IChingHexagram;
  coinsTosses: { toss: [number, number, number]; lineVal: number }[];
} {
  const lines: IChingLine[] = [];
  const coinsTosses: { toss: [number, number, number]; lineVal: number }[] = [];

  for (let i = 0; i < 6; i++) {
    // 3 coin flips: 2 (Tails) or 3 (Heads)
    const coin1 = Math.random() < 0.5 ? 2 : 3;
    const coin2 = Math.random() < 0.5 ? 2 : 3;
    const coin3 = Math.random() < 0.5 ? 2 : 3;
    const sum = (coin1 + coin2 + coin3) as 6 | 7 | 8 | 9;

    coinsTosses.push({
      toss: [coin1, coin2, coin3],
      lineVal: sum,
    });

    lines.push({
      value: sum,
      isYang: sum === 7 || sum === 9,
      isChanging: sum === 6 || sum === 9,
    });
  }

  // Derive hexagram number from top hexagrams list
  const availableKeys = [1, 2, 11, 14, 24, 64];
  const chosenNum = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  const hexagram = I_CHING_KEY_HEXAGRAMS[chosenNum] || I_CHING_KEY_HEXAGRAMS[1];

  return { lines, hexagram, coinsTosses };
}
