import React, { useState, useEffect, useRef } from 'react';
import { KundaliData } from '../types';
import {
  getSavedKundaliProfiles,
  deleteSavedKundaliProfile,
  clearAllSavedKundaliProfiles,
  syncKundaliProfilesWithNativeStorage,
  exportKundaliProfilesJson,
  importKundaliProfilesJson,
} from '../services/storage';
import { BookMarked, X, Trash2, Download, Upload, CheckCircle2 } from 'lucide-react';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadList = () => {
    setProfiles(getSavedKundaliProfiles());
  };

  useEffect(() => {
    if (isOpen) {
      loadList();
      void syncKundaliProfilesWithNativeStorage().then((synced) => {
        setProfiles(synced);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDelete = (e: React.MouseEvent, profile: KundaliData) => {
    e.stopPropagation();
    deleteSavedKundaliProfile(profile.name, profile.birthTime);
    loadList();
    showToast(`"${profile.name}" की कुंडली सूची से हटा दी गई।`);
  };

  const handleClearAll = () => {
    if (window.confirm('क्या आप सभी कुंडली साफ़ करके एकदम नई शुरुआत करना चाहते हैं?')) {
      clearAllSavedKundaliProfiles();
      loadList();
      showToast('सभी सहेजी गई कुण्डलियाँ साफ़ कर दी गईं।');
    }
  };

  const handleExportBackup = () => {
    try {
      const jsonStr = exportKundaliProfilesJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `shakti_kundali_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📥 कुंडली बैकअप फ़ाइल सफलतापूर्वक डाउनलोड हो गई!');
    } catch {
      showToast('बैकअप डाउनलोड करने में त्रुटि आई।');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = importKundaliProfilesJson(content);
      if (res.success) {
        loadList();
        showToast(`✅ सफलता! ${res.count} कुण्डलियाँ सफलतापूर्वक रिस्टोर हो गईं।`);
      } else {
        alert(res.error || 'अमान्य बैकअप फ़ाइल।');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (d: Date) => {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: 'var(--bx-panel)',
          borderColor: 'var(--bx-line)',
        }}
        className="border-2 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col h-[85dvh] max-h-[100dvh]"
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--bx-header)',
            borderColor: 'var(--bx-line)',
            color: '#FFFFFF',
          }}
          className="p-3.5 flex items-center justify-between border-b shadow-xs"
        >
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base font-granth leading-tight">
                {t('savedProfiles.title', 'सहेजी गई जन्म कुण्डलियाँ')}
              </h3>
              <span className="text-[10px] text-amber-100 opacity-90 block">
                कुल {profiles.length} कुण्डली सुरक्षित
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {profiles.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10px] px-2 py-1 rounded bg-rose-900/70 hover:bg-rose-900 text-rose-100 border border-rose-400/40 cursor-pointer font-bold transition"
                title="सभी प्रोफाइल हटाएं"
              >
                सभी साफ़
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Permanent Backup & Restore Action Toolbar */}
        <div
          style={{
            backgroundColor: 'var(--bx-cream)',
            borderColor: 'var(--bx-line)',
          }}
          className="px-3 py-2 border-b flex items-center justify-between gap-2 text-xs"
        >
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={profiles.length === 0}
            style={{
              backgroundColor: 'var(--bx-panel)',
              borderColor: 'var(--bx-line)',
              color: 'var(--bx-header)',
            }}
            className="flex-1 py-1.5 px-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer hover:opacity-90 disabled:opacity-40"
            title="फ़ोन मेमोरी या गूगल ड्राइव में बैकअप फ़ाइल डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5" style={{ color: 'var(--bx-gold)' }} />
            <span>बैकअप लें (Export)</span>
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            style={{
              backgroundColor: 'var(--bx-panel)',
              borderColor: 'var(--bx-line)',
              color: 'var(--bx-header)',
            }}
            className="flex-1 py-1.5 px-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer hover:opacity-90"
            title="पहले से ली गई बैकअप फ़ाइल से कुण्डलियाँ रिस्टोर करें"
          >
            <Upload className="w-3.5 h-3.5" style={{ color: 'var(--bx-gold)' }} />
            <span>रिस्टोर करें (Import)</span>
          </button>

          {/* Hidden File Input for Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="bg-emerald-800 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1.5 shadow-xs animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

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
                style={{
                  backgroundColor: 'var(--bx-cream)',
                  borderColor: 'var(--bx-line)',
                }}
                className="border hover:border-[#B56A00] p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition shadow-2xs group"
              >
                <div>
                  <div style={{ color: 'var(--bx-header)' }} className="font-black text-sm font-granth">
                    {p.name}
                  </div>
                  <div style={{ color: 'var(--bx-mute)' }} className="text-xs mt-0.5">
                    {formatDate(p.birthDate)} • {p.birthTime} • {p.birthPlace}
                  </div>
                  <div style={{ color: 'var(--bx-gold)' }} className="text-[11px] font-bold mt-1">
                    {t('savedProfiles.lagna', 'लग्न')}: {trRashi(p.lagnaRashi)} • {t('savedProfiles.moon', 'चन्द्र')}: {trRashi(p.moonRashi)} ({trVedic(p.nakshatra)})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, p)}
                  className="p-2 text-rose-700 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                  title={t('savedProfiles.remove', 'हटाएँ')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-4 space-y-2">
              <BookMarked className="w-8 h-8 mx-auto" style={{ color: 'var(--bx-mute)' }} />
              <p style={{ color: 'var(--bx-mute)' }} className="text-xs">
                {t('savedProfiles.empty', 'कोई साफ़ सहेजी गई कुंडली नहीं मिली। नई कुंडली बनाकर सहेजें या “रिस्टोर” द्वारा बैकअप फ़ाइल लोड करें।')}
              </p>
            </div>
          )}
        </ZeroScrollPager>
      </div>
    </div>
  );
};
