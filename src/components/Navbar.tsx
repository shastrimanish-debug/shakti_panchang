import { BOOK_PAGES } from "../constants/bookPages";
import type { SavedLocation } from "../types";
import { useLicense } from "@/lib/license-client";
import {
  BookOpen,
  MapPin,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  Download,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  currentLocation: SavedLocation;
  onOpenLocationModal: () => void;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (enabled: boolean) => void;
  onOpenUmaModal: () => void;
  onOpenInstallModal?: () => void;
  onOpenPremium?: () => void;
  isBookOpen?: boolean;
  onToggleBookOpen?: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  currentDate,
  onDateChange,
  currentLocation,
  onOpenLocationModal,
  isAudioEnabled,
  setIsAudioEnabled,
  onOpenUmaModal,
  onOpenInstallModal,
  onOpenPremium,
  isBookOpen = true,
  onToggleBookOpen,
}: NavbarProps) {
  const { status, loading } = useLicense();

  const handlePrevDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    onDateChange(next);
  };
  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const formattedDate = currentDate.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "short",
  });

  const placeShort = currentLocation.name.split("(")[0].trim();

  const trialLabel = loading
    ? "सदस्यता…"
    : status.entitled && status.kind === "trial"
      ? `${status.daysRemaining} दिन`
      : status.entitled
        ? "प्रीमियम"
        : "₹99/वर्ष";

  return (
    <header className="sticky top-0 z-40 bg-[#5C3A21] text-[#FAF2E4] shadow-md border-b border-[#8C6239]">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 py-1.5 flex items-center justify-between gap-1.5">
        <button
          type="button"
          className="flex items-center gap-1.5 shrink-0"
          onClick={() => setActiveTab("panchang")}
          title="शक्ति पंचांग"
        >
          <div className="w-7 h-7 rounded-full bg-[#B56A00] flex items-center justify-center border border-[#F4E8D1] text-xs font-bold text-white">
            ॐ
          </div>
          <h1 className="text-xs sm:text-sm font-black font-granth tracking-wide leading-none whitespace-nowrap">
            शक्ति पंचांग
          </h1>
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5 text-xs min-w-0">
          <div className="flex items-center bg-[#462B17] rounded border border-[#8C6239]/60 shrink-0">
            <button type="button" onClick={handlePrevDay} title="पिछला दिन" className="p-1">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDateChange(new Date())}
              className="px-1.5 py-1 text-[11px] font-bold whitespace-nowrap"
            >
              {formattedDate}
            </button>
            <button type="button" onClick={handleNextDay} title="अगला दिन" className="p-1">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-0.5 px-1.5 py-1 bg-[#462B17] hover:bg-[#3B2211] border border-[#8C6239]/60 rounded text-[11px] font-medium min-w-0"
            title={currentLocation.name}
          >
            <MapPin className="w-3 h-3 text-[#E69A33] shrink-0" />
            <span className="truncate max-w-[72px] sm:max-w-[140px]">{placeShort}</span>
          </button>

          {onOpenPremium && (
            <button
              type="button"
              onClick={onOpenPremium}
              className={`shrink-0 px-1.5 py-1 rounded text-[10px] sm:text-[11px] font-bold flex items-center gap-1 border ${
                status.entitled
                  ? "bg-[#FAF2E4] text-[#5C3A21] border-[#FFD88A]"
                  : "bg-[#B56A00] text-white border-[#FFD88A]"
              }`}
            >
              <Crown className="w-3 h-3" />
              <span className="whitespace-nowrap">{trialLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="hidden sm:flex p-1 bg-[#462B17] border border-[#8C6239]/60 rounded"
            title={isAudioEnabled ? "ध्वनि चालू" : "ध्वनि बंद"}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#E69A33]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#A89279]" />
            )}
          </button>

          {onToggleBookOpen && (
            <button
              type="button"
              onClick={onToggleBookOpen}
              className={`hidden md:flex items-center gap-1 px-1.5 py-1 rounded text-[11px] font-bold border ${
                !isBookOpen
                  ? "bg-gradient-to-r from-[#B58738] to-[#D4A548] text-[#2C0A0A] border-[#FFD88A]"
                  : "bg-[#462B17] text-[#FFD88A] border-[#8C6239]"
              }`}
            >
              <BookOpen className="w-3 h-3" />
              {isBookOpen ? "मुखपृष्ठ" : "ग्रंथ"}
            </button>
          )}

          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="hidden sm:flex items-center gap-1 px-1.5 py-1 bg-[#462B17] border border-[#8C6239] text-[#FFD88A] rounded text-[11px] font-bold"
            >
              <Download className="w-3 h-3" />
              APK
            </button>
          )}

          <button
            type="button"
            onClick={onOpenUmaModal}
            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#B56A00] to-[#C67D24] text-white rounded text-[11px] font-bold shrink-0"
          >
            <Sparkles className="w-3 h-3 text-[#FFD88A]" />
            उमा
          </button>
        </div>
      </div>

      {isBookOpen && (
        <div className="bg-[#462B17] border-t border-[#8C6239]/60 px-2 sm:px-3 overflow-hidden">
        <nav className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1.5">
          {BOOK_PAGES.map((tab) => {
            const Icon = tab.icon;
            const isActive = isBookOpen && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-[#FAF2E4] text-[#5C3A21] shadow-sm font-black ring-1 ring-[#FFD88A]"
                    : "text-[#D9C4A9] hover:text-[#FAF2E4] hover:bg-[#5C3A21]/50"
                }`}
              >
                <span
                  className={`text-[10px] font-bold px-1.5 rounded ${
                    isActive ? "bg-[#5C3A21] text-[#FAF2E4]" : "bg-[#331C0C] text-[#D9C4A9]"
                  }`}
                >
                  {tab.pageNumber}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#B56A00]" : "text-[#A89279]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      )}
    </header>
  );
}
