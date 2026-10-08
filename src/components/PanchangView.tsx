import React, { useState } from 'react';
import { VedicPanchangData, SavedLocation } from '../types';
import { PanchangStoryView } from './PanchangStoryView';
import { DashboardView } from './DashboardView';

interface PanchangViewProps {
  panchang: VedicPanchangData;
  onNavigateTab?: (tabId: string) => void;
  onOpenUmaModal?: (initialQuery?: string) => void;
  onOpenWhatsAppPanchang?: () => void;
  onOpenSubscriptionModal?: (reason?: string) => void;
  locationName?: string;
  currentDate?: Date;
  onDateChange?: (d: Date) => void;
  onOpenLocationModal?: () => void;
  latitude?: number;
  longitude?: number;
  timezoneHours?: number;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
}

export const PanchangView: React.FC<PanchangViewProps> = ({
  panchang,
  onNavigateTab,
  onOpenUmaModal,
  onOpenWhatsAppPanchang,
  locationName = 'उज्जैन',
  currentDate = new Date(),
  onDateChange,
  onOpenLocationModal,
  latitude = 23.1765,
  longitude = 75.7885,
  timezoneHours = 5.5,
  onPrevChapter,
  onNextChapter,
}) => {
  const [viewMode, setViewMode] = useState<'bento' | 'story'>('bento');

  const locationObj: SavedLocation = {
    name: locationName,
    latitude,
    longitude,
    timezoneHours,
  };

  if (viewMode === 'story') {
    return (
      <div className="relative w-full h-full min-h-0 flex flex-col overflow-hidden">
        <div className="bg-[#FFFDF9] dark:bg-[#1E110A] border-b border-[#E8DCCB] dark:border-amber-900/30 px-4 py-2 flex justify-between items-center text-xs shadow-xs shrink-0 z-30">
          <span className="font-bold text-[#8C4A00] dark:text-amber-300">📖 ग्रन्थ स्टोरी व्यू (Story Book)</span>
          <button
            type="button"
            onClick={() => setViewMode('bento')}
            className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black rounded-xl shadow-xs hover:from-amber-700 hover:to-amber-800 transition cursor-pointer"
          >
            📱 iOS Bento Mode
          </button>
        </div>
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <PanchangStoryView
            panchang={panchang}
            locationName={locationName}
            currentDate={currentDate}
            onDateChange={onDateChange}
            onOpenLocationModal={onOpenLocationModal}
            onOpenUmaModal={onOpenUmaModal}
            onOpenWhatsAppPanchang={onOpenWhatsAppPanchang}
            latitude={latitude}
            longitude={longitude}
            onPrevChapter={onPrevChapter}
            onNextChapter={onNextChapter}
          />
        </div>
      </div>
    );
  }

  return (
    <DashboardView
      panchang={panchang}
      currentLocation={locationObj}
      currentDate={currentDate}
      onDateChange={onDateChange}
      onNavigateTab={onNavigateTab || (() => {})}
      onOpenUma={(q) => onOpenUmaModal?.(q)}
      onOpenConnect={() => {}}
      onOpenLocationModal={onOpenLocationModal}
      onOpenWhatsAppPanchang={onOpenWhatsAppPanchang}
      onToggleStoryMode={() => setViewMode('story')}
    />
  );
};

export default PanchangView;
