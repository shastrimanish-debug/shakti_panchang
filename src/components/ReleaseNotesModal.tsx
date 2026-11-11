import React, { useState } from 'react';
import { APP_RELEASE_NOTES, CURRENT_RELEASE } from '../constants/releaseNotes';
import { Sparkles, X, CheckCircle2, ChevronRight, ChevronDown, BookOpen, MessageSquare, Award } from 'lucide-react';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabId: string) => void;
  onOpenUma?: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenUma,
}) => {
  const [expandedVersion, setExpandedVersion] = useState<string>(CURRENT_RELEASE.version);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFDF9] text-[#3E2714] rounded-3xl max-w-xl w-full max-h-[90vh] border-2 border-[#D4AF37] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7A1D1D] via-[#942626] to-[#5C1414] text-[#FAF2E4] px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-[#2C0A0A] flex items-center justify-center font-black text-lg shadow-sm">
              卐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-granth text-base sm:text-lg font-black text-[#FFD88A]">
                  नवीनतम अपडेट्स व रिलीज़ नोट्स
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#2C0A0A]">
                  v{CURRENT_RELEASE.version} (Code {CURRENT_RELEASE.versionCode})
                </span>
              </div>
              <p className="text-[11px] text-[#F5ECE0]/90 font-serif">
                सनातन शक्ति पंचांग का नवीनतम संस्करण विवरण
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white rounded-lg transition hover:bg-black/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {APP_RELEASE_NOTES.map((note) => {
            const isCurrent = note.version === CURRENT_RELEASE.version;
            const isExpanded = expandedVersion === note.version;

            return (
              <div
                key={note.version}
                className={`rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFDF8] via-[#FAF2E4] to-[#F5ECE0] shadow-sm'
                    : 'border-[#DFCBB5] bg-white/80'
                }`}
              >
                {/* Version bar */}
                <button
                  onClick={() =>
                    setExpandedVersion(isExpanded ? '' : note.version)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isCurrent
                          ? 'bg-[#7A1D1D] text-[#FFD88A]'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {note.versionCode}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-granth font-black text-sm sm:text-base text-[#462B17]">
                          संस्करण v{note.version}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-700 text-white">
                            नवीनतम सक्रिय
                          </span>
                        )}
                        <span className="text-[11px] text-[#8C6239]">
                          ({note.date})
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#7A1D1D] truncate mt-0.5">
                        {note.title}
                      </div>
                    </div>
                  </div>

                  <div className="text-[#8C6239] shrink-0 pl-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#DFCBB5]/60 space-y-3">
                    {/* Highlights */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-[#8C4A00] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>मुख्य विशेषताएं</span>
                      </div>
                      <div className="space-y-1">
                        {note.highlights.map((h, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs font-semibold text-[#462B17] leading-snug"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-2.5 pt-1">
                      {note.details.map((sec, idx) => (
                        <div
                          key={idx}
                          className="bg-white/90 p-3 rounded-xl border border-[#DFCBB5] space-y-1 text-xs"
                        >
                          <div className="font-bold text-[#7A1D1D] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B64D18]" />
                            <span>{sec.category}</span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-[#5C3A21] text-[11px] font-serif leading-relaxed">
                            {sec.items.map((it, ii) => (
                              <li key={ii}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Quick navigation actions if current */}
                    {isCurrent && (
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        {onNavigateTab && (
                          <button
                            onClick={() => {
                              onNavigateTab('devta_arpan');
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7A1D1D] to-[#942626] text-white text-xs font-bold hover:from-[#5C1414] hover:to-[#7A1D1D] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>नया मॉड्यूल खोलें: देवता अर्पण फल</span>
                          </button>
                        )}

                        {onOpenUma && (
                          <button
                            onClick={() => {
                              onOpenUma();
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#FAF2E4] text-[#7A1D1D] hover:bg-[#EBDCC0] border border-[#8C6239]/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                            <span>उमा दैवज्ञ से परामर्श</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF2E4] px-5 py-3 border-t border-[#DFCBB5] flex items-center justify-between">
          <div className="text-[11px] text-[#8C6239] font-serif">
            सनातन शक्ति पंचांग · v{CURRENT_RELEASE.version} (Code {CURRENT_RELEASE.versionCode})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#7A1D1D] hover:bg-[#5C1414] text-white text-xs font-bold transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
