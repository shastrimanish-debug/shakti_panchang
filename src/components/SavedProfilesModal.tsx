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
import {
  saveProfilesToCloud,
  restoreProfilesFromCloud,
  getStoredCloudBackupKey,
} from '../services/cloudBackup';
import {
  BookMarked,
  X,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Copy,
  FileText,
  Cloud,
  Smartphone,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { useTranslation, useLanguage } from '../i18n';
import { trRashi, trVedic } from '../i18n/vedicTranslate';
import { ZeroScrollPager } from './ZeroScrollPager';
import { saveOrDeliverKundaliBackup } from '../lib/device';

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
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [profiles, setProfiles] = useState<KundaliData[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pastedJsonText, setPastedJsonText] = useState<string>('');
  const [activeBackupTab, setActiveBackupTab] = useState<'cloud' | 'local'>('cloud');
  const [cloudPhone, setCloudPhone] = useState<string>(() => getStoredCloudBackupKey());
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);
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
      const storedKey = getStoredCloudBackupKey();
      if (storedKey && !cloudPhone) {
        setCloudPhone(storedKey);
      }
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleDelete = async (e: React.MouseEvent, profile: KundaliData) => {
    e.stopPropagation();
    const updated = await deleteSavedKundaliProfile(profile.name, profile.birthTime);
    setProfiles(updated);
    window.dispatchEvent(
      new CustomEvent('shakti-profile-deleted', {
        detail: { name: profile.name, birthTime: profile.birthTime },
      })
    );
    showToast(`"${profile.name}" की कुंडली सूची से हटा दी गई।`);
  };

  const handleClearAll = async () => {
    if (window.confirm('क्या आप सभी कुंडली साफ़ करके एकदम नई शुरुआत करना चाहते हैं?')) {
      await clearAllSavedKundaliProfiles();
      setProfiles([]);
      window.dispatchEvent(new CustomEvent('shakti-profiles-cleared'));
      showToast('सभी सहेजी गई कुण्डलियाँ साफ़ कर दी गईं।');
    }
  };

  const handleCloudBackup = async () => {
    const cleanKey = cloudPhone.trim();
    if (!cleanKey || cleanKey.length < 4) {
      showToast('कृपया अपना 10-अंकों का मोबाइल नंबर या बैकअप कोड दर्ज करें।');
      return;
    }
    if (profiles.length === 0) {
      showToast('बैकअप लेने के लिए कम से कम 1 कुंडली होनी चाहिए।');
      return;
    }

    setIsCloudLoading(true);
    try {
      const res = await saveProfilesToCloud(cleanKey, profiles);
      if (res.success) {
        showToast(`✅ ${res.message} (नंबर: ${cleanKey})`);
      } else {
        showToast(res.message);
      }
    } catch {
      showToast('क्लाउड बैकअप के दौरान त्रुटि आई। कृपया इंटरनेट कनेक्शन जांचें।');
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleCloudRestore = async () => {
    const cleanKey = cloudPhone.trim();
    if (!cleanKey || cleanKey.length < 4) {
      showToast('कृपया अपना 10-अंकों का मोबाइल नंबर या बैकअप कोड दर्ज करें।');
      return;
    }

    setIsCloudLoading(true);
    try {
      const res = await restoreProfilesFromCloud(cleanKey);
      if (res.success && res.profiles.length > 0) {
        const importRes = importKundaliProfilesJson(JSON.stringify(res.profiles));
        if (importRes.success) {
          loadList();
          showToast(`✅ सफलता! ${importRes.count} कुण्डलियाँ क्लाउड से रीस्टोर हो गईं।`);
        } else {
          showToast('क्लाउड डेटा प्रारूप अमान्य है।');
        }
      } else {
        showToast(res.message || 'इस नंबर पर कोई क्लाउड बैकअप नहीं मिला।');
      }
    } catch {
      showToast('क्लाउड से रीस्टोर करने में त्रुटि आई।');
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = exportKundaliProfilesJson();
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `Kundali_Backup_${dateStr}.json`;
      const res = await saveOrDeliverKundaliBackup(jsonStr, fileName);
      if (res.success) {
        showToast(`✅ ${res.message}`);
      } else {
        showToast('बैकअप डाउनलोड करने में त्रुटि आई। कृपया "डेटा कॉपी" विकल्प का उपयोग करें।');
      }
    } catch {
      showToast('बैकअप सुरक्षित करने में त्रुटि आई।');
    }
  };

  const handleCopyBackup = async () => {
    try {
      const jsonStr = exportKundaliProfilesJson();
      await navigator.clipboard.writeText(jsonStr);
      showToast('📋 कुंडली बैकअप डेटा कॉपी हो गया! इसे WhatsApp या Notes में सुरक्षित रख सकते हैं।');
    } catch {
      showToast('क्लिपबोर्ड में कॉपी नहीं हो सका।');
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

  const handleApplyPastedJson = () => {
    if (!pastedJsonText.trim()) {
      showToast('कृपया पहले बैकअप टेक्स्ट पेस्ट करें।');
      return;
    }
    const res = importKundaliProfilesJson(pastedJsonText.trim());
    if (res.success) {
      loadList();
      setShowPasteModal(false);
      setPastedJsonText('');
      showToast(`✅ सफलता! ${res.count} कुण्डलियाँ सफलतापूर्वक रिस्टोर हो गईं।`);
    } else {
      showToast(res.error || 'अमान्य बैकअप टेक्स्ट।');
    }
  };

  const formatDate = (d: Date) => {
    const dt = d instanceof Date ? d : new Date(d);
    const loc = language === 'en' ? 'en-US' : language === 'gu' ? 'gu-IN' : 'hi-IN';
    return dt.toLocaleDateString(loc, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  const dateStr = new Date().toISOString().slice(0, 10);
  const currentBackupFileName = `Kundali_Backup_${dateStr}.json`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: 'var(--bx-panel)',
          borderColor: 'var(--bx-line)',
        }}
        className="border-2 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col h-[88dvh] max-h-[100dvh] relative"
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

        {/* Dual Mode Switcher: Cloud Backup vs Local File */}
        <div
          style={{
            backgroundColor: 'var(--bx-cream)',
            borderColor: 'var(--bx-line)',
          }}
          className="px-3 pt-2.5 pb-2 border-b space-y-2 text-xs"
        >
          <div className="flex items-center rounded-lg bg-stone-200/70 p-0.5 border border-stone-300">
            <button
              type="button"
              onClick={() => setActiveBackupTab('cloud')}
              className={`flex-1 py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeBackupTab === 'cloud'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>☁️ सीधा क्लाउड बैकअप</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBackupTab('local')}
              className={`flex-1 py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeBackupTab === 'local'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📁 लोकल फ़ाइल / कॉपी</span>
            </button>
          </div>

          {/* TAB 1: CLOUD BACKUP & RESTORE */}
          {activeBackupTab === 'cloud' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-2.5 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                    मोबाइल नंबर (नया फोन बदलने पर भी सुरक्षित):
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                    क्लाउड सुरक्षित
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="tel"
                    value={cloudPhone}
                    onChange={(e) => setCloudPhone(e.target.value)}
                    placeholder="उदा. 9820012345 (10-अंकों का नंबर)"
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600 placeholder:text-stone-400"
                  />
                </div>

                {/* Cloud Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleCloudBackup}
                    disabled={isCloudLoading || profiles.length === 0}
                    className="py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-40 text-xs"
                    title="सभी कुण्डलियों को क्लाउड में सुरक्षित रखें"
                  >
                    {isCloudLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5" />
                    )}
                    <span>क्लाउड में सहेजें</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloudRestore}
                    disabled={isCloudLoading}
                    className="py-1.5 px-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-40 text-xs"
                    title="इस नंबर से क्लाउड की सभी कुण्डलियाँ पुनः प्राप्त करें"
                  >
                    {isCloudLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>क्लाउड से रीस्टोर</span>
                  </button>
                </div>
              </div>

              {/* Quick Google Drive / Share */}
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={profiles.length === 0}
                className="w-full py-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer text-xs disabled:opacity-40"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Google Drive / WhatsApp पर बैकअप फ़ाइल भेजें</span>
              </button>
            </div>
          )}

          {/* TAB 2: LOCAL BACKUP & RESTORE */}
          {activeBackupTab === 'local' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
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
                  title="फोन मेमोरी (Downloads) में बैकअप फ़ाइल सुरक्षित करें"
                >
                  <Download className="w-3.5 h-3.5" style={{ color: 'var(--bx-gold)' }} />
                  <span>डाउनलोड फ़ाइल</span>
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
                  title="फ़ाइल मैनेजर से Kundali_Backup फ़ाइल चुनें"
                >
                  <Upload className="w-3.5 h-3.5" style={{ color: 'var(--bx-gold)' }} />
                  <span>फ़ाइल से रीस्टोर</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleCopyBackup}
                  disabled={profiles.length === 0}
                  className="flex-1 py-1 px-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-500/30 font-medium flex items-center justify-center gap-1 cursor-pointer transition disabled:opacity-40"
                  title="पूरा बैकअप टेक्स्ट क्लिपबोर्ड में कॉपी करें"
                >
                  <Copy className="w-3 h-3 text-amber-700" />
                  <span>डेटा कॉपी करें</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasteModal(true)}
                  className="flex-1 py-1 px-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-500/30 font-medium flex items-center justify-center gap-1 cursor-pointer transition"
                  title="कॉपी किया गया बैकअप टेक्स्ट पेस्ट करके लोड करें"
                >
                  <FileText className="w-3 h-3 text-amber-700" />
                  <span>टेक्स्ट पेस्ट रीस्टोर</span>
                </button>
              </div>

              <div className="text-[10px] text-stone-600 bg-amber-50/80 px-2 py-1 rounded border border-amber-200/50 flex items-center justify-between">
                <span>🔍 सर्च करें: <strong className="text-amber-900 font-mono">Kundali_Backup</strong></span>
                <span className="text-stone-500 font-mono text-[9px]">{currentBackupFileName}</span>
              </div>
            </div>
          )}

          {/* Hidden File Input for Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json,text/plain,*/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Text Paste Modal Dialog */}
        {showPasteModal && (
          <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
            <div
              style={{
                backgroundColor: 'var(--bx-panel)',
                borderColor: 'var(--bx-line)',
              }}
              className="border-2 rounded-xl p-3.5 w-full max-w-sm shadow-2xl space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-stone-900 font-granth">
                  📋 बैकअप टेक्स्ट पेस्ट करें
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="p-1 text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-stone-600">
                यदि आपने पहले बैकअप कॉपी किया था या WhatsApp/Notes में रखा है, तो उसे यहाँ पेस्ट करें:
              </p>
              <textarea
                value={pastedJsonText}
                onChange={(e) => setPastedJsonText(e.target.value)}
                placeholder='{"app": "Shakti Panchang", "profiles": [...] }'
                rows={6}
                className="w-full text-xs font-mono p-2 border border-stone-300 rounded-lg bg-white/90 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-2.5 py-1 text-xs rounded border border-stone-300 text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleApplyPastedJson}
                  className="px-3 py-1 text-xs font-bold rounded bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
                >
                  रीस्टोर करें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="bg-emerald-800 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1.5 shadow-xs animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* List of Saved Profiles */}
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
