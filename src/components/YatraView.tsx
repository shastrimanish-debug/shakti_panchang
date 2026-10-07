import React, { useState } from 'react';
import { VedicPanchangData, SavedLocation } from '../types';
import { COMMON_INDIAN_CITIES, calculateYatraShool } from '../services/disha';
import { Compass, MapPin, Navigation, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DigitalCompass } from './DigitalCompass';
import { useTranslation } from '../i18n';
import { trVedic, trWeekday } from '../i18n/vedicTranslate';
import { UniversalStoryDeck, StorySlideItem } from './UniversalStoryDeck';

interface YatraViewProps {
  panchang: VedicPanchangData;
  currentLocation: SavedLocation;
  onOpenUmaModal?: (query?: string) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const YatraView: React.FC<YatraViewProps> = ({
  panchang,
  currentLocation,
  onOpenUmaModal,
  onPrevChapter,
  onNextChapter,
}) => {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState<SavedLocation>(currentLocation);
  const defaultDest =
    COMMON_INDIAN_CITIES.find((c) => c.name.includes('Varanasi')) ||
    COMMON_INDIAN_CITIES[1] || {
      name: 'वाराणसी (Varanasi / Kashi)',
      latitude: 25.3176,
      longitude: 82.9739,
      state: 'उत्तर प्रदेश',
    };
  const [destination, setDestination] = useState<SavedLocation>(defaultDest);

  const result = calculateYatraShool(
    origin.name,
    origin.latitude,
    origin.longitude,
    destination.name,
    destination.latitude,
    destination.longitude,
    panchang.date
  );

  const slides: StorySlideItem[] = [
    // Slide 1: Today's Disha Shool
    {
      id: 'disha-shool',
      title: 'आज का दिशाशूल एवं परिहार',
      subtitle: `${trWeekday(panchang.weekday)} • ${trVedic(result.shoolDirection)} दिशा`,
      badge: 'सावधानी',
      icon: '🧭',
      voiceText: `आज ${trWeekday(panchang.weekday)} है। आज का दिशाशूल ${result.shoolDirection} दिशा में है। परिहार: ${result.remedy}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-400 shadow-sm space-y-2.5 my-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8C6239] uppercase">दिशाशूल वेला</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 font-black text-[10px]">
                वर्जित दिशा
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-2xl sm:text-3xl font-black font-granth text-[#462B17]">
                {trVedic(result.shoolDirection)} दिशा
              </div>
              <p className="text-xs text-[#735133] mt-1">
                आज {trVedic(result.shoolDirection)} दिशा में अनावश्यक यात्रा से बचना चाहिए।
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs">
              <span className="font-bold text-[#B56A00]">🛡️ आवश्यक यात्रा परिहार: </span>
              <span className="text-[#5C3A21] font-medium">{result.remedy}।</span>
            </div>
          </div>

          <div className="text-[10px] text-center text-[#8C6239]">
            यदि यात्रा अनिवार्य हो तो परिहार ग्रहण कर व इष्टदेव का स्मरण कर निकलें।
          </div>
        </div>
      ),
    },

    // Slide 2: Digital Compass
    {
      id: 'compass',
      title: 'वैदिक यात्रा दिशा चक्र',
      subtitle: 'दिशाशूल व यात्रा कोण',
      badge: 'दिशा ज्ञान',
      icon: '🧭',
      voiceText: 'वैदिक यात्रा दिशा चक्र।',
      content: (
        <div className="h-full flex flex-col justify-center items-center py-1">
          <div className="w-full max-w-xs scale-90 sm:scale-100">
            <DigitalCompass
              shoolDirectionName={trVedic(result.shoolDirection)}
              targetBearing={result.bearing}
              targetDirectionName={trVedic(result.direction)}
              isDirectionBlocked={result.isDirectionBlocked}
            />
          </div>
        </div>
      ),
    },

    // Slide 3: Route Calculator
    {
      id: 'route-calc',
      title: 'यात्रा मार्ग एवं अनुकूलता',
      subtitle: `${origin.name.split(' ')[0]} ➔ ${destination.name.split(' ')[0]}`,
      badge: result.isDirectionBlocked ? 'दिशाशूल प्रभावित' : 'यात्रा अनुकूल',
      icon: '📍',
      voiceText: `यात्रा मार्ग: ${origin.name} से ${destination.name}।`,
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          {/* Origin / Dest Selectors */}
          <div className="grid grid-cols-2 gap-1.5 shrink-0">
            <div>
              <label className="text-[10px] font-bold text-[#8C6239] block mb-0.5">प्रस्थान (Origin)</label>
              <select
                value={origin.name}
                onChange={(e) => {
                  const f = COMMON_INDIAN_CITIES.find((c) => c.name === e.target.value);
                  if (f) setOrigin(f);
                }}
                className="w-full bg-white border border-[#DFCBB5] rounded-lg p-1.5 text-xs font-semibold text-[#5C3A21] outline-none"
              >
                {COMMON_INDIAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8C6239] block mb-0.5">गंतव्य (Destination)</label>
              <select
                value={destination.name}
                onChange={(e) => {
                  const f = COMMON_INDIAN_CITIES.find((c) => c.name === e.target.value);
                  if (f) setDestination(f);
                }}
                className="w-full bg-white border border-[#DFCBB5] rounded-lg p-1.5 text-xs font-semibold text-[#5C3A21] outline-none"
              >
                {COMMON_INDIAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={`p-3 rounded-xl border-2 my-auto ${
            result.isDirectionBlocked
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-black mb-1">
              {result.isDirectionBlocked ? (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>{result.isDirectionBlocked ? 'दिशाशूल सम्मुख है' : 'मार्ग निर्विघ्न व अनुकूल है'}</span>
            </div>
            <p className="text-xs font-medium">
              दिशा: {trVedic(result.direction)} ({Math.round(result.bearing)}°) • दूरी: ~{Math.round(result.distanceKm)} किमी
            </p>
          </div>

          <div className="text-[10px] text-center text-[#8C6239]">
            मार्ग शुद्धि हेतु शुभ चौघड़िया समय में प्रस्थान करें।
          </div>
        </div>
      ),
    },

    // Slide 4: Yatra Mantra
    {
      id: 'yatra-mantra',
      title: 'पावन मंगल यात्रा मन्त्र',
      subtitle: 'यात्रा निर्विघ्न सिद्धि',
      badge: 'महामंत्र',
      icon: '🕉️',
      voiceText: 'प्रविसि नगर कीजै सब काजा। हृदयं राखि कोसलपुर राजा।',
      content: (
        <div className="h-full flex flex-col justify-between py-1 space-y-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF9EE] to-[#FFEEC9] border-2 border-amber-400 text-center my-auto space-y-2">
            <div className="text-xs font-black text-[#B56A00] tracking-widest">
              ॥ श्री रामचरितमानस ॥
            </div>
            <div className="text-sm sm:text-base font-black font-granth text-[#462B17] leading-relaxed">
              प्रबिसि नगर कीजै सब काजा।<br />
              हृदयँ राखि कोसलपुर राजा॥
            </div>
            <p className="text-xs text-[#735133] pt-1 border-t border-amber-300/60 font-medium">
              भगवान श्री राम व श्री हनुमान जी का स्मरण कर प्रारम्भ की गई यात्रा सदा कल्याणकारी और सिद्धिकारक होती है।
            </p>
          </div>
          <div className="text-[10px] text-center text-[#8C6239]">
            शुभमस्तु • यात्रा सफल व मंगलमय हो
          </div>
        </div>
      ),
    },
  ];

  return (
    <UniversalStoryDeck
      slides={slides}
      headerTitle={t('nav.yatra', 'यात्रा दिशाशूल')}
      headerIcon="🧭"
      chapterNumber={4}
      currentDate={panchang.date}
      onOpenUma={onOpenUmaModal ? () => onOpenUmaModal('यात्रा दिशाशूल परामर्श') : undefined}
      onPrevChapter={onPrevChapter}
      onNextChapter={onNextChapter}
      prevChapterLabel="शुभ मुहूर्त"
      nextChapterLabel="कुण्डली"
    />
  );
};
export default YatraView;
