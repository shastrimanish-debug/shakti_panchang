import React, { useState, useEffect } from 'react';
import { KundaliData } from '../types';
import { getSavedKundaliProfiles, deleteSavedKundaliProfile } from '../services/storage';
import { BookMarked, X, Trash2 } from 'lucide-react';
import { useTranslation } from '../i18n';
import { trRashi, trVedic } from '../i18n/vedicTranslate';
import { ZeroScrollPager } from './ZeroScrollPager';

interface SavedProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (profile: KundaliData) => void;
}

export const SavedProfilesModal: React.FC<SavedProfilesModalProps> = ({
  isOpen,
  onClose,
  onSelectProfile,
}) => {
  const { t, i18n } = useTranslation();
  const [profiles, setProfiles] = useState<KundaliData[]>([]);

  const loadList = () => {
    setProfiles(getSavedKundaliProfiles());
  };

  useEffect(() => {
    if (isOpen) {
      loadList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, profile: KundaliData) => {
    e.stopPropagation();
    deleteSavedKundaliProfile(profile.name, profile.birthTime);
    loadList();
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col h-[85dvh] max-h-[100dvh]">
        {/* Header */}
        <div className="bg-[#5C3A21] text-[#FAF2E4] p-3.5 flex items-center justify-between border-b-2 border-[#8C6239]">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#E69A33]" />
            <h3 className="font-bold text-base font-granth">{t('savedProfiles.title', 'સાચવેલી જન્મ કુંડળીઓ')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#E5D2B8] hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <ZeroScrollPager className="flex-1 overflow-hidden min-h-0" contentClassName="p-3 space-y-2">
          {profiles.length > 0 ? (
            profiles.map((p, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectProfile(p);
                  onClose();
                }}
                className="bg-[#F4E8D1] border border-[#8C6239]/30 hover:border-[#B56A00] p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition shadow-xs"
              >
                <div>
                  <div className="font-black text-sm text-[#5C3A21]">{p.name}</div>
                  <div className="text-xs text-[#735133] mt-0.5">
                    {formatDate(p.birthDate)} • {p.birthTime} • {p.birthPlace}
                  </div>
                  <div className="text-[11px] font-bold text-[#B56A00] mt-1">
                    {t('savedProfiles.lagna', 'લગ્ન')}: {trRashi(p.lagnaRashi)} • {t('savedProfiles.moon', 'ચંદ્ર')}: {trRashi(p.moonRashi)} ({trVedic(p.nakshatra)})
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, p)}
                  className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                  title={t('savedProfiles.remove', 'કાઢી નાખો')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-[#8C6239]">
              {t('savedProfiles.empty', 'કોઈ સાચવેલી કુંડળી મળી નથી. કુંડળી બનાવીને તેને અહીં સાચવી શકાય છે.')}
            </div>
          )}
        </ZeroScrollPager>
      </div>
    </div>
  );
};
