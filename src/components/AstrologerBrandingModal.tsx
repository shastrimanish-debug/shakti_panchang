import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Building2,
  Sparkles,
  Check,
  X,
  Award,
  Share2,
  FileText,
} from 'lucide-react';
import {
  AstrologerBranding,
  getAstrologerBranding,
  saveAstrologerBranding,
} from '../services/storage';
import { ShaktiLogo } from './ShaktiLogo';

interface AstrologerBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (branding: AstrologerBranding) => void;
}

export const AstrologerBrandingModal: React.FC<AstrologerBrandingModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [branding, setBranding] = useState<AstrologerBranding>(() => getAstrologerBranding());
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBranding(getAstrologerBranding());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAstrologerBranding(branding);
    if (onSaved) onSaved(branding);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FAF2E4] text-[#3E2714] rounded-2xl border-2 border-[#8C6239] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#5C3A21] to-[#735133] text-[#FAF2E4] border-b border-[#8C6239]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#B56A00] rounded-lg text-white shadow-xs">
              <Award className="w-5 h-5 text-[#FFD88A]" />
            </div>
            <div>
              <h3 className="font-granth font-bold text-base text-[#FAF2E4]">
                ज्योतिषी / पंडित डिजिटल विज़िटिंग कार्ड
              </h3>
              <p className="text-[10px] text-[#FFD88A]">
                पंचांग शेयर कार्ड व कुंडली PDF पर अपना नाम व नंबर जोड़ें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-[#FAF2E4]/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Feature Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#F4E8D1] border-2 border-[#8C6239]/40 rounded-xl shadow-xs">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                <span>डिजिटल ब्रांडिंग सक्रिय करें (Enable Branding)</span>
              </div>
              <p className="text-[11px] text-[#735133]">
                दैनिक व्हाट्सएप पंचांग कार्ड और कुंडली पर आपका नाम दिखेगा
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={branding.enabled}
                onChange={(e) => setBranding({ ...branding, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B56A00]"></div>
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#5C3A21] mb-1">
                आपका शुभ नाम (ज्योतिषी / पंडित जी का नाम):
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C6239] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={branding.name}
                  onChange={(e) => setBranding({ ...branding, name: e.target.value })}
                  placeholder="उदा. ज्योतिषाचार्य मनीष शास्त्री"
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg text-[#3E2714] focus:outline-hidden focus:border-[#B56A00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#5C3A21] mb-1">
                  उपाधि / पदवी (Designation):
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-[#8C6239] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={branding.title}
                    onChange={(e) => setBranding({ ...branding, title: e.target.value })}
                    placeholder="उदा. वैदिक ज्योतिषी एवं कर्मकांड मर्मज्ञ"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg text-[#3E2714] focus:outline-hidden focus:border-[#B56A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3A21] mb-1">
                  व्हाट्सएप / संपर्क नंबर:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C6239] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={branding.phone}
                    onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                    placeholder="उदा. +91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg text-[#3E2714] focus:outline-hidden focus:border-[#B56A00]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#5C3A21] mb-1">
                  नगर / राज्य (City):
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C6239] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={branding.city}
                    onChange={(e) => setBranding({ ...branding, city: e.target.value })}
                    placeholder="उदा. वडोदरा (गुजरात) / वाराणसी"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg text-[#3E2714] focus:outline-hidden focus:border-[#B56A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3A21] mb-1">
                  आश्रम / ज्योतिष संस्थान (वैकल्पिक):
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#8C6239] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={branding.sansthan || ''}
                    onChange={(e) => setBranding({ ...branding, sansthan: e.target.value })}
                    placeholder="उदा. श्री शक्ति ज्योतिष संस्थान"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg text-[#3E2714] focus:outline-hidden focus:border-[#B56A00]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C3A21] mb-1">
                विशेषज्ञता / सेवाएँ (Services provided):
              </label>
              <input
                type="text"
                value={branding.specialization || ''}
                onChange={(e) => setBranding({ ...branding, specialization: e.target.value })}
                placeholder="उदा. जन्म पत्रिका, विवाह मेलापक, वास्तु दोष निवारण, महामृत्युंजय अनुष्ठान"
                className="w-full px-3 py-2 text-xs bg-[#FAF2E4] border border-[#8C6239]/40 rounded-lg text-[#3E2714] focus:outline-hidden focus:border-[#B56A00]"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-[#8C6239] mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-[#B56A00]" />
              <span>पंचांग कार्ड पर आपका कार्ड इस प्रकार दिखेगा (Live Preview):</span>
            </div>

            <div className={`p-3 rounded-xl border-2 transition-all ${
              branding.enabled
                ? 'bg-gradient-to-r from-[#F4E8D1] to-[#EBD8BD] border-[#B56A00] shadow-sm'
                : 'bg-stone-100 border-stone-300 opacity-60'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#5C3A21] border border-[#FFD88A] flex items-center justify-center text-[#FFD88A] shrink-0 font-granth font-bold text-sm shadow-xs">
                  {branding.name ? branding.name.charAt(0) : 'शा'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5 flex-wrap">
                    <span>{branding.name || 'ज्योतिषाचार्य मनीष शास्त्री'}</span>
                    <span className="text-[10px] bg-[#B56A00] text-white px-1.5 py-0.2 rounded font-medium">
                      {branding.title || 'वैदिक ज्योतिषी'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#735133] mt-0.5 flex items-center gap-2 flex-wrap">
                    {branding.phone && <span>📞 {branding.phone}</span>}
                    {branding.city && <span>📍 {branding.city}</span>}
                    {branding.sansthan && <span>🏛️ {branding.sansthan}</span>}
                  </div>
                  {branding.specialization && (
                    <div className="text-[9px] text-[#8C6239] italic mt-0.5">
                      विशेषज्ञता: {branding.specialization}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#8C6239]/20 flex items-center justify-between text-[9px] text-[#8C6239]">
                <span>दैनिक पंचांग सौजन्य: {branding.name}</span>
                <span>॥ शुभम भवतु ॥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F4E8D1] border-t border-[#8C6239]/30 flex items-center justify-between gap-2">
          <div className="text-[11px] text-[#735133] font-medium">
            {showSavedToast && (
              <span className="text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" /> सुरक्षित हो गया!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#735133] hover:text-[#5C3A21] font-bold cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-[#B56A00] to-[#C67D24] hover:from-[#A05C00] hover:to-[#B56A00] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>सेव करें और लागू करें</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
