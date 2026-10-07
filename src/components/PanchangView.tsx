import React from 'react';
import { VedicPanchangData } from '../types';
import { PanchangStoryView } from './PanchangStoryView';

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
  currentDate,
  onDateChange,
  onOpenLocationModal,
  latitude = 23.1765,
  longitude = 75.7885,
  onPrevChapter,
  onNextChapter,
}) => {
  return (
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
  );
};
export default PanchangView;
