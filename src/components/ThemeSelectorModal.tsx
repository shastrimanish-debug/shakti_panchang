import React, { useState, useMemo, useEffect } from 'react';
import { DEVOTIONAL_THEMES, AppTheme, DevotionalThemeInfo } from '../services/storage';
import { useTranslation } from '../i18n';
import {
  Sparkles,
  X,
  Check,
  Sun,
  Moon,
  Eye,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { ShaktiLogo } from './ShaktiLogo';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n?.language?.slice(0, 2).toLowerCase() || 'hi';

  // Preview state - starts with activeTheme, changes on theme card click
  const [previewThemeId, setPreviewThemeId] = useState<AppTheme>(activeTheme);

  // Sync with activeTheme whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewThemeId(activeTheme);
    }
  }, [isOpen, activeTheme]);

  const selectedTheme = useMemo<DevotionalThemeInfo>(() => {
    return (
      DEVOTIONAL_THEMES.find((item) => item.id === previewThemeId) ||
      DEVOTIONAL_THEMES[0]
    );
  }, [previewThemeId]);

  const isCurrentActive = previewThemeId === activeTheme;

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectTheme(previewThemeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-amber-300/80 bg-gradient-to-b from-[#FFFDF9] via-[#FFF9EE] to-[#FFF4DE] dark:from-[#1F140D] dark:to-[#170E08] text-[#3E2714] dark:text-[#FAF2E4]"
        style={{ color: '#3E2714' }}
      >
        {/* Header */}
        <div
          style={{ backgroundColor: '#5C2D11', color: '#FFFFFF' }}
          className="bx-modal-dark-head p-3.5 sm:p-4 border-b border-amber-200/90 bg-gradient-to-r from-[#5C2D11] via-[#7A3E18] to-[#5C2D11] flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 border border-amber-300/40 flex items-center justify-center shadow-inner shrink-0">
              <Palette className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-granth font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5" style={{ color: '#FFFDF5' }}>
                <span>
                  {lang === 'en'
                    ? 'Sacred Themes (9 Devotional Palettes)'
                    : lang === 'gu'
                    ? 'પાવન ભક્તિમય પ્રકાશ થીમ્સ'
                    : 'पावन भक्तिमय प्रकाश थीम (९ दिव्य रंग)'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 font-sans font-bold" style={{ color: '#FDE68A' }}>
                  {lang === 'en' ? 'Live Preview' : lang === 'gu' ? 'લાઇવ પ્રિવ્યુ' : 'लाइव पूर्वावलोकन'}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] line-clamp-1" style={{ color: '#FEF08A' }}>
                {lang === 'en'
                  ? 'Preview and choose your temple color palette before confirming'
                  : lang === 'gu'
                  ? 'થીમ લાગુ કરતાં પહેલાં એપનું જીવંત પૂર્વાવલોકન જુઓ'
                  : 'दिव्य देवी-देवता कृपा व मंदिर प्रकाश चयन • लागू करने से पूर्व पूर्वावलोकन देखें'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ color: '#FFFFFF' }}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label={lang === 'en' ? 'Close' : 'बंद करें'}
          >
            <X className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
          {/* 🌟 1. INTERACTIVE LIVE APP PREVIEW CARD */}
          <div className="rounded-2xl border border-amber-300/90 shadow-sm overflow-hidden bg-white/95">
            {/* Preview Banner Bar */}
            <div
              className="px-3 py-2 border-b flex items-center justify-between text-xs font-bold"
              style={{
                backgroundColor: selectedTheme.isLight ? selectedTheme.bgHex : '#231710',
                borderColor: selectedTheme.borderHex,
                color: selectedTheme.accentHex,
              }}
            >
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" style={{ color: selectedTheme.accentHex }} />
                <span className="font-black text-xs">
                  {lang === 'en' ? 'Live App Preview:' : lang === 'gu' ? 'લાઇવ પૂર્વાવલોકન:' : 'लाइव ऐप पूर्वावलोकन:'}
                </span>
                <span className="font-extrabold flex items-center gap-1">
                  <span>{selectedTheme.icon}</span>
                  <span>{lang === 'en' ? selectedTheme.nameEn : selectedTheme.name}</span>
                </span>
              </div>

              {isCurrentActive ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Active Theme' : lang === 'gu' ? 'હાલમાં સક્રિય' : 'सक्रिय थीम'}</span>
                </span>
              ) : (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-black text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: selectedTheme.accentHex }}
                >
                  {lang === 'en' ? 'Previewing' : lang === 'gu' ? 'પૂર્વાવલોકન' : 'पूर्वावलोकन में'}
                </span>
              )}
            </div>

            {/* Miniature App Screen Simulation */}
            <div
              className="p-3 space-y-2.5 transition-colors duration-200"
              style={{
                backgroundColor: selectedTheme.bgHex,
                color: selectedTheme.isLight ? '#3E2714' : '#F1E6D4',
              }}
            >
              {/* Mini App Topbar */}
              <div
                className="px-2.5 py-1.5 rounded-xl flex items-center justify-between shadow-xs border text-xs"
                style={{
                  backgroundColor: selectedTheme.cardBgHex,
                  borderColor: selectedTheme.borderHex,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black" style={{ color: selectedTheme.accentHex }}>🕉️</span>
                  <span className="font-black text-[11px]" style={{ color: selectedTheme.accentHex }}>
                    {lang === 'en' ? 'Shakti Panchang' : lang === 'gu' ? 'શક્તિ પંચાંગ' : 'शक्ति पंचांग'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <span
                    className="px-2 py-0.5 rounded-md font-extrabold"
                    style={{
                      backgroundColor: selectedTheme.isLight ? '#FEF3C7' : '#332115',
                      color: selectedTheme.accentHex,
                      border: `1px solid ${selectedTheme.borderHex}`,
                    }}
                  >
                    📍 {lang === 'en' ? 'Vadodara • Today' : lang === 'gu' ? 'વડોદરા • આજે' : 'वडोदरा • आज'}
                  </span>
                </div>
              </div>

              {/* Mini Hero Banner */}
              <div
                className="p-2.5 rounded-xl shadow-xs border flex items-center justify-between gap-2"
                style={{
                  backgroundColor: selectedTheme.accentHex,
                  borderColor: selectedTheme.borderHex,
                  color: '#FFFFFF',
                }}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-black text-white flex items-center gap-1">
                    <span>✨</span>
                    <span>
                      {lang === 'en'
                        ? 'Kartik Krishna Trayodashi • Friday'
                        : lang === 'gu'
                        ? 'કાર્તિક કૃષ્ણ ત્રયોદશી • શુક્રવાર'
                        : 'कार्तिक कृष्ण त्रयोदशी (धनतेरस) • शुक्रवार'}
                    </span>
                  </div>
                  <div className="text-[9px] text-amber-100 line-clamp-1">
                    {lang === 'en'
                      ? 'Sunrise 06:43 • Sunset 18:02 • Pradosha Kaala'
                      : lang === 'gu'
                      ? 'સૂર્યોદય ૦૬:૪૩ • સૂર્યાસ્ત ૧૮:૦૨ • પ્રદોષ કાળ'
                      : 'सूर्योदय ०६:४३ • सूर्यास्त १८:०२ • सायंकाल प्रदोष काल'}
                  </div>
                </div>
                <span className="text-base shrink-0">{selectedTheme.icon}</span>
              </div>

              {/* 2 Mini Panchang Grid Tiles */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Tile 1 */}
                <div
                  className="p-2 rounded-xl shadow-xs border"
                  style={{
                    backgroundColor: selectedTheme.cardBgHex,
                    borderColor: selectedTheme.borderHex,
                  }}
                >
                  <div className="text-[9px] font-bold text-stone-500 uppercase">
                    {lang === 'en' ? 'Tithi' : lang === 'gu' ? 'તિથિ' : 'तिथि'}
                  </div>
                  <div className="font-black text-xs mt-0.5" style={{ color: selectedTheme.accentHex }}>
                    {lang === 'en' ? 'Trayodashi (10:31)' : lang === 'gu' ? 'ત્રયોદશી (૧૦:૩૧)' : 'त्रयोदशी (१०:३१ से)'}
                  </div>
                  <div className="text-[9px] font-semibold text-stone-600 mt-0.5">
                    {lang === 'en' ? 'Pradosha Vyapini' : lang === 'gu' ? 'પ્રદોષ વ્યાપિની' : 'प्रदोष व्यापिनी'}
                  </div>
                </div>

                {/* Tile 2 */}
                <div
                  className="p-2 rounded-xl shadow-xs border"
                  style={{
                    backgroundColor: selectedTheme.cardBgHex,
                    borderColor: selectedTheme.borderHex,
                  }}
                >
                  <div className="text-[9px] font-bold text-stone-500 uppercase">
                    {lang === 'en' ? 'Nakshatra' : lang === 'gu' ? 'નક્ષત્ર' : 'नक्षत्र'}
                  </div>
                  <div className="font-black text-xs mt-0.5" style={{ color: selectedTheme.accentHex }}>
                    {lang === 'en' ? 'Hasta (Pada 1)' : lang === 'gu' ? 'હસ્ત (ચરણ ૧)' : 'हस्त (चरण १)'}
                  </div>
                  <div className="text-[9px] font-semibold text-stone-600 mt-0.5">
                    {lang === 'en' ? 'Vishkambha Yoga' : lang === 'gu' ? 'વિષ્કંભ યોગ' : 'विष्कम्भ योग'}
                  </div>
                </div>
              </div>

              {/* Mini Action Button */}
              <div
                className="py-1.5 px-3 rounded-xl font-bold text-[10px] text-center flex items-center justify-center gap-1 shadow-xs"
                style={{
                  backgroundColor: selectedTheme.cardBgHex,
                  border: `1.5px solid ${selectedTheme.accentHex}`,
                  color: selectedTheme.accentHex,
                }}
              >
                <span>{lang === 'en' ? 'View Choghadiya & Shubh Muhurat' : lang === 'gu' ? 'શુભ ચોઘડિયા અને મુહૂર્ત જુઓ' : 'शुभ चौघड़िया व अमृत मुहूर्त देखें'}</span>
                <ArrowRight className="w-3 h-3" />
              </div>

              {/* Palette Swatch Strip */}
              <div className="pt-1.5 border-t border-black/10 flex items-center justify-between text-[9px] font-bold text-stone-600">
                <span className="flex items-center gap-1">
                  <span>{selectedTheme.deity}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] uppercase tracking-wider text-stone-400">
                    {lang === 'en' ? 'Palette:' : 'रंग:'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      title="Background"
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs inline-block"
                      style={{ backgroundColor: selectedTheme.bgHex }}
                    />
                    <span
                      title="Card Background"
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs inline-block"
                      style={{ backgroundColor: selectedTheme.cardBgHex }}
                    />
                    <span
                      title="Accent"
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs inline-block"
                      style={{ backgroundColor: selectedTheme.accentHex }}
                    />
                    <span
                      title="Border"
                      className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs inline-block"
                      style={{ backgroundColor: selectedTheme.borderHex }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 2. 8 DEVOTIONAL LIGHT THEMES GRID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#8C4A00] dark:text-amber-300 px-1">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {lang === 'en'
                    ? 'Divine Light Themes (8 Palettes)'
                    : lang === 'gu'
                    ? 'દિવ્ય પ્રકાશ થીમ્સ (૮ પાવન રંગો)'
                    : 'दिव्य प्रकाश थीम (८ पावन रंग)'}
                </span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-[#8C4A00] dark:text-amber-300 px-2 py-0.5 rounded-full font-extrabold">
                {DEVOTIONAL_THEMES.filter((t) => t.isLight).length} {lang === 'en' ? 'Themes' : 'पावन रंग'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEVOTIONAL_THEMES.filter((t) => t.isLight).map((themeItem) => {
                const isSelected = previewThemeId === themeItem.id;
                const isSaved = activeTheme === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    type="button"
                    onClick={() => setPreviewThemeId(themeItem.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex items-start gap-2.5 active:scale-98 ${
                      isSelected
                        ? 'shadow-md scale-[1.01] ring-2 ring-amber-400/50'
                        : 'hover:border-amber-400 opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: themeItem.bgHex,
                      borderColor: isSelected ? themeItem.accentHex : themeItem.borderHex,
                    }}
                  >
                    {/* Theme Icon & Swatch */}
                    <div
                      className="p-2 rounded-xl text-lg shrink-0 shadow-xs flex items-center justify-center"
                      style={{
                        backgroundColor: themeItem.cardBgHex,
                        border: `1px solid ${themeItem.borderHex}`,
                      }}
                    >
                      <span>{themeItem.icon}</span>
                    </div>

                    {/* Theme Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-black text-xs truncate"
                          style={{ color: themeItem.accentHex }}
                        >
                          {lang === 'en' ? themeItem.nameEn : themeItem.name}
                        </span>
                        {isSelected && (
                          <span
                            className="p-1 rounded-full text-white text-xs shadow-xs"
                            style={{ backgroundColor: themeItem.accentHex }}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                        {!isSelected && isSaved && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 font-black">
                            {lang === 'en' ? 'Active' : 'सक्रिय'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-stone-700 leading-tight truncate mt-0.5">
                        {themeItem.deity}
                      </div>
                      <div className="text-[9px] text-stone-600 leading-tight line-clamp-1 mt-0.5">
                        {themeItem.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 🌟 3. NIGHT MODE OPTION */}
            <div className="pt-2 border-t border-[#8C6239]/20">
              <div className="text-[11px] font-bold text-[#8C4A00] dark:text-amber-300 px-1 mb-1.5 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {lang === 'en'
                    ? 'Nocturnal / Night Theme'
                    : lang === 'gu'
                    ? 'રાત્રિ ઉપાસના ડાર્ક થીમ'
                    : 'रात्रि उपासना (Night Dark Theme)'}
                </span>
              </div>
              {DEVOTIONAL_THEMES.filter((t) => !t.isLight).map((themeItem) => {
                const isSelected = previewThemeId === themeItem.id;
                const isSaved = activeTheme === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    type="button"
                    onClick={() => setPreviewThemeId(themeItem.id)}
                    className={`w-full p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 active:scale-98 ${
                      isSelected
                        ? 'shadow-md border-amber-500 bg-[#231710] text-[#FFD88A] ring-2 ring-amber-400/50'
                        : 'border-stone-700/60 bg-[#1A110B] text-stone-300 hover:border-amber-500/60'
                    }`}
                  >
                    <div className="p-1.5 rounded-xl bg-stone-900 border border-stone-700 text-base">
                      <span>{themeItem.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-amber-300">
                          {lang === 'en' ? themeItem.nameEn : themeItem.name}
                        </span>
                        {isSelected && (
                          <span className="p-0.5 rounded-full bg-amber-500 text-stone-950">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                        {!isSelected && isSaved && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-stone-950 font-black">
                            {lang === 'en' ? 'Active' : 'सक्रिय'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">{themeItem.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🌟 4. STICKY CONFIRMATION ACTION FOOTER */}
        <div className="p-3 sm:p-3.5 border-t border-amber-200 bg-amber-100/70 dark:bg-stone-900 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
          >
            {lang === 'en' ? 'Cancel' : lang === 'gu' ? 'રદ કરો' : 'रद्द करें'}
          </button>

          <button
            type="button"
            onClick={handleApply}
            style={{
              backgroundColor: selectedTheme.accentHex,
              color: '#FFFFFF',
            }}
            className="bx-dark-btn flex-1 max-w-xs px-4 py-2 rounded-xl text-white text-xs font-black shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span style={{ color: '#FFFFFF' }}>
              {isCurrentActive
                ? (lang === 'en' ? 'Keep Current Theme' : lang === 'gu' ? 'આ જ થીમ ચાલુ રાખો' : 'यही थीम रखें (पुष्टि)')
                : (lang === 'en'
                    ? `Apply ${selectedTheme.nameEn}`
                    : lang === 'gu'
                    ? `${selectedTheme.name} લાગુ કરો`
                    : `${selectedTheme.name} थीम लागू करें`)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectorModal;
