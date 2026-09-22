import React from 'react';
import { X, Activity } from 'lucide-react';
import { AccuracyPanel } from './AccuracyPanel';

interface AccuracyModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
}

export const AccuracyModal: React.FC<AccuracyModalProps> = ({
  isOpen,
  onClose,
  date,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FAF2E4] text-[#3E2714] rounded-2xl border-2 border-[#8C6239] shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#8C6239]/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#5C3A21] text-[#FAF2E4] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-[#FFD88A]" />
            </div>
            <h3 className="font-granth font-bold text-base text-[#5C3A21]">
              खगोलीय गणना जाँच
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#F4E8D1] rounded-full text-[#8C6239] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accuracy Panel */}
        <AccuracyPanel date={date} />
      </div>
    </div>
  );
};
