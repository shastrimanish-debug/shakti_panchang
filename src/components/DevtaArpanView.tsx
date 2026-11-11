import React, { useState, useMemo } from 'react';
import {
  DEVTA_ARPAN_DATA,
  DevtaModule,
  DevtaOfferingItem,
} from '../data/devtaArpan';
import {
  Sparkles,
  Search,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Volume2,
  VolumeX,
  BookOpen,
  HelpCircle,
  Clock,
  ShieldAlert,
  ChevronRight,
  Filter,
  X,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { triggerHapticSelection } from '../utils/haptics';
import { umaVoice } from '../services/UmaVoiceService';

interface DevtaArpanViewProps {
  onSelectTab?: (tabId: string) => void;
  onOpenUmaWithPrompt?: (prompt: string) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'समस्त अर्पण', icon: '✨' },
  { id: 'wealth', label: 'धन व व्यापार', icon: '💰' },
  { id: 'health', label: 'आरोग्य व रोग-मुक्ति', icon: '🩺' },
  { id: 'marriage', label: 'विवाह व दांपत्य', icon: '💍' },
  { id: 'protection', label: 'संकट व शत्रु नाश', icon: '🛡️' },
  { id: 'education', label: 'विद्या व परीक्षा', icon: '📚' },
  { id: 'graha', label: 'ग्रह शांति व साढ़ेसाती', icon: '🪐' },
  { id: 'career', label: 'नौकरी व पदोन्नति', icon: '💼' },
];

export const DevtaArpanView: React.FC<DevtaArpanViewProps> = ({
  onSelectTab,
  onOpenUmaWithPrompt,
}) => {
  const [selectedDeityId, setSelectedDeityId] = useState<string>('ganesh');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedMantraId, setCopiedMantraId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showProhibitionView, setShowProhibitionView] = useState<boolean>(false);

  const deities = DEVTA_ARPAN_DATA.devta_arpan_modules;

  // Selected deity
  const currentDeity = useMemo(() => {
    return deities.find((d) => d.deity_id === selectedDeityId) || deities[0];
  }, [deities, selectedDeityId]);

  // Filtered offerings based on search and category
  const filteredOfferings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // If searching across all deities
    if (q) {
      const allMatches: { deity: DevtaModule; item: DevtaOfferingItem }[] = [];
      deities.forEach((d) => {
        d.offerings.forEach((item) => {
          const matchQuery =
            item.action_text.toLowerCase().includes(q) ||
            item.highlighted_benefit.toLowerCase().includes(q) ||
            (item.mantra && item.mantra.toLowerCase().includes(q)) ||
            d.deity.toLowerCase().includes(q);

          const matchCat =
            selectedCategory === 'all' || item.category === selectedCategory;

          if (matchQuery && matchCat) {
            allMatches.push({ deity: d, item });
          }
        });
      });
      return { isGlobalSearch: true, results: allMatches };
    }

    // Default: current deity's offerings filtered by category
    const list = currentDeity.offerings.filter((item) => {
      if (selectedCategory === 'all') return true;
      return item.category === selectedCategory;
    });

    return {
      isGlobalSearch: false,
      results: list.map((item) => ({ deity: currentDeity, item })),
    };
  }, [searchQuery, selectedCategory, currentDeity, deities]);

  const handleCopyMantra = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMantraId(id);
    setTimeout(() => setCopiedMantraId(null), 2500);
  };

  const handleSpeakMantra = (id: string, text: string) => {
    if (speakingId === id) {
      umaVoice.stop();
      setSpeakingId(null);
      return;
    }
    umaVoice.stop();
    setSpeakingId(id);
    void umaVoice.speak(text, {
      rate: 0.88,
      pitch: 1.08,
      voiceStyle: 'uma',
      sanskritOnly: true,
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleShareWhatsApp = (deityName: string, item: DevtaOfferingItem) => {
    const text = `🪔 *${deityName} — देवता अर्पण फल* 🪔\n\n📌 *सामग्री:* ${item.action_text}\n✨ *प्राप्त फल:* ${item.highlighted_benefit}\n${item.mantra ? `ॐ *मंत्र:* ${item.mantra}\n` : ''}${item.best_time ? `⏰ *श्रेष्ठ काल:* ${item.best_time}\n` : ''}\n✨ *सनातन शक्ति पंचांग*`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleConsultUma = (deityName: string, item: DevtaOfferingItem) => {
    const prompt = `मुझे ${deityName} पर "${item.action_text.replace(/[–-]/g, '').trim()}" अर्पण करना है। इससे "${item.highlighted_benefit}" हेतु शास्त्रोक्त अर्पण विधि, संकल्प मंत्र, श्रेष्ठ वार व दिशा और मेरी कुंडली के अनुसार इसका फल विस्तार से बताएं।`;
    if (onOpenUmaWithPrompt) {
      onOpenUmaWithPrompt(prompt);
    } else if (onSelectTab) {
      onSelectTab('services');
    }
  };

  return (
    <div className="h-full flex-1 min-h-0 overflow-y-auto overscroll-contain pb-28 bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E8] to-[#F5ECE0] text-[#3E2714] font-sans">
      {/* Divine Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#7A1D1D] via-[#942626] to-[#5C1414] text-[#FAF2E4] px-4 py-3.5 sm:px-6 sm:py-5 shadow-md border-b-2 border-[#D4AF37]">
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none text-9xl">
          🪔
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37] text-[#2C0A0A] shadow-xs">
                卐 नवम अध्याय · प्रामाणिक शास्त्रोक्त विधान
              </span>
              <span className="text-xs text-amber-200 font-serif">
                १४+ देवता · ५०+ अर्पण सामग्री
              </span>
            </div>
            <h1 className="font-granth text-2xl sm:text-3xl font-black text-[#FFD88A] tracking-wide">
              देवता अर्पण फल व पूजन सामग्री
            </h1>
            <p className="text-xs sm:text-sm text-[#F5ECE0]/90 font-serif max-w-2xl leading-relaxed">
              किस देवी-देवता पर क्या सामग्री चढ़ाने से क्या अभीष्ट फल प्राप्त होता है?
              मंत्र, वर्जित नियम (क्या न चढ़ाएं), श्रेष्ठ वार व मनोकामना पूर्ति का संपूर्ण सार।
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => {
                triggerHapticSelection();
                setShowRulesModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFD88A] text-xs font-bold border border-[#D4AF37]/50 flex items-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>सामान्य अर्पण नियम</span>
            </button>
            <button
              onClick={() => {
                triggerHapticSelection();
                setShowProhibitionView(!showProhibitionView);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                showProhibitionView
                  ? 'bg-rose-900 text-white border-rose-400'
                  : 'bg-white/10 hover:bg-white/20 text-rose-200 border-rose-400/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
              <span>{showProhibitionView ? 'सामग्री देखें' : 'वर्जित अर्पण (निषेध)'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        {/* Deity Carousel / Tabs */}
        <div>
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
              देवी-देवता चुनें
            </span>
            <span className="text-[11px] text-[#A67C52]">
              {deities.length} जाग्रत विग्रह उपलब्ध
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
            {deities.map((d) => {
              const isSelected = d.deity_id === selectedDeityId && !searchQuery;
              return (
                <button
                  key={d.deity_id}
                  onClick={() => {
                    triggerHapticSelection();
                    setSelectedDeityId(d.deity_id);
                    setSearchQuery('');
                  }}
                  className={`snap-start shrink-0 px-3.5 py-2 rounded-2xl border transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7A1D1D] to-[#5C1414] text-[#FAF2E4] border-[#D4AF37] scale-102 ring-2 ring-[#D4AF37]/30'
                      : 'bg-white/90 hover:bg-white text-[#5C3A21] border-[#DFCBB5] hover:border-[#B58738]'
                  }`}
                >
                  <span className="text-base leading-none">{d.avatar_icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-black truncate max-w-[120px]">
                      {d.deity}
                    </div>
                    <div
                      className={`text-[10px] font-medium leading-none ${
                        isSelected ? 'text-amber-200' : 'text-[#8C6239]'
                      }`}
                    >
                      {d.holy_symbol} {d.offerings.length} सामग्री
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Wish Category Filter */}
        <div className="bg-white/95 rounded-2xl p-3 border border-[#DFCBB5] shadow-sm space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="सामग्री (उदा. बेलपत्र, नींबू, सिंदूर, लौंग) या फल (उदा. रोग मुक्ति, धन, विवाह) खोजें..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FFFDF9] border border-[#DFCBB5] text-xs sm:text-sm text-[#3E2714] placeholder-[#A67C52] focus:outline-none focus:ring-2 focus:ring-[#B58738]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  triggerHapticSelection();
                  setSearchQuery('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Wish / Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-[11px] font-bold text-[#8C6239] shrink-0 flex items-center gap-1 pr-1">
              <Filter className="w-3 h-3" />
              मनोकामना:
            </span>
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHapticSelection();
                  setSelectedCategory(cat.id);
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-[#7A1D1D] text-white border-[#7A1D1D] shadow-xs'
                    : 'bg-[#FFFDF9] text-[#5C3A21] border-[#DFCBB5] hover:border-[#8C6239]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Deity Context Header (when not searching globally) */}
        {!searchQuery && (
          <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF2E4] to-[#F5ECE0] rounded-2xl p-4 border border-[#D4AF37]/50 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFCBB5] pb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7A1D1D] to-[#942626] text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                  {currentDeity.avatar_icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-granth text-lg sm:text-xl font-black text-[#5C1414]">
                      {currentDeity.header_title}
                    </h2>
                  </div>
                  <p className="text-xs text-[#5C3A21] font-serif leading-snug mt-0.5">
                    {currentDeity.short_intro}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
                {currentDeity.best_day && (
                  <span className="px-2 py-0.5 rounded-md bg-[#8C4A00]/10 text-[#8C4A00] text-[11px] font-bold border border-[#8C4A00]/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentDeity.best_day}
                  </span>
                )}
                {currentDeity.ruling_planet && (
                  <span className="px-2 py-0.5 rounded-md bg-[#7A1D1D]/10 text-[#7A1D1D] text-[11px] font-bold border border-[#7A1D1D]/20">
                    ग्रह: {currentDeity.ruling_planet}
                  </span>
                )}
              </div>
            </div>

            {/* Main Arpan Chanting Mantra */}
            <div className="bg-[#FAF2E4] p-3 rounded-xl border border-[#D4AF37]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] font-black text-[#8C4A00] uppercase tracking-wider flex items-center gap-1">
                  <span>ॐ</span>
                  <span>मूल अर्पण व स्तुति मंत्र</span>
                </div>
                <div className="font-serif text-xs sm:text-sm font-bold text-[#462B17] italic">
                  {currentDeity.main_arpan_mantra}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() =>
                    handleSpeakMantra(`main_${currentDeity.deity_id}`, currentDeity.main_arpan_mantra)
                  }
                  className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    speakingId === `main_${currentDeity.deity_id}`
                      ? 'bg-[#7A1D1D] text-white border-[#7A1D1D]'
                      : 'bg-white text-[#7A1D1D] border-[#DFCBB5] hover:bg-[#FAF2E4]'
                  }`}
                  title="मंत्र का मधुर वाचन सुनें"
                >
                  {speakingId === `main_${currentDeity.deity_id}` ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">
                    {speakingId === `main_${currentDeity.deity_id}` ? 'रोकें' : 'श्रवण'}
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleCopyMantra(`main_${currentDeity.deity_id}`, currentDeity.main_arpan_mantra)
                  }
                  className="p-1.5 rounded-lg bg-white hover:bg-[#FAF2E4] text-[#5C3A21] border border-[#DFCBB5] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="मंत्र कॉपी करें"
                >
                  {copiedMantraId === `main_${currentDeity.deity_id}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">
                    {copiedMantraId === `main_${currentDeity.deity_id}` ? 'कॉपी हुआ' : 'कॉपी'}
                  </span>
                </button>
              </div>
            </div>

            {/* Prohibited items alert */}
            {currentDeity.prohibited_items && currentDeity.prohibited_items.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-rose-950">
                    सावधानी — क्या कभी न चढ़ाएं (वर्जित):{' '}
                  </span>
                  <span>{currentDeity.prohibited_items.join(' • ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Search Header Notice */}
        {filteredOfferings.isGlobalSearch && (
          <div className="bg-amber-100/80 border border-amber-300 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-bold">
            <span>
              "{searchQuery}" हेतु {filteredOfferings.results.length} अर्पण परिणाम मिले:
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-amber-800 underline text-[11px] cursor-pointer"
            >
              खोज रद्द करें
            </button>
          </div>
        )}

        {/* Quick Offerings Jump Bar */}
        {!filteredOfferings.isGlobalSearch && (
          <div className="bg-[#FAF2E4]/90 rounded-2xl p-3 border border-[#D4AF37]/50 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#8C4A00]">
              <span className="flex items-center gap-1.5">
                <span className="text-base">🌿</span>
                <span className="font-granth text-sm font-black text-[#5C1414]">
                  {currentDeity.deity} की मुख्य अर्पण सामग्रियां ({currentDeity.offerings.length}):
                </span>
              </span>
              <span className="text-[11px] text-[#A67C52] font-medium hidden sm:inline">
                सामग्री पर टैप करें 👇
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentDeity.offerings.map((item) => (
                <button
                  key={`pill_${item.id}`}
                  type="button"
                  onClick={() => {
                    document.getElementById(`offering_${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-[#5C1414] border border-[#DFCBB5] hover:border-amber-500 text-xs font-bold flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  <span className="text-sm">{item.item_icon}</span>
                  <span>{item.action_text.replace(/[–-]/g, '').trim()}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Offerings Grid Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B64D18] animate-pulse" />
            <h3 className="font-granth text-base sm:text-lg font-black text-[#5C1414]">
              {filteredOfferings.isGlobalSearch
                ? `खोज परिणाम: अर्पण सामग्री व फल (${filteredOfferings.results.length})`
                : `${currentDeity.deity} — क्या अर्पण करें व क्या फल मिलेगा (${filteredOfferings.results.length} सामग्री)`}
            </h3>
          </div>
        </div>

        {/* Offerings Grid */}
        {filteredOfferings.results.length === 0 ? (
          <div className="bg-white/80 rounded-2xl p-8 text-center space-y-2 border border-dashed border-[#DFCBB5]">
            <div className="text-3xl">🪔</div>
            <h3 className="font-granth text-base font-bold text-[#5C3A21]">
              कोई अर्पण सामग्री नहीं मिली
            </h3>
            <p className="text-xs text-[#8C6239]">
              कृपया अन्य शब्द खोजें अथवा मनोकामना फ़िल्टर बदलकर पुनः प्रयास करें।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-3 py-1.5 bg-[#7A1D1D] text-white rounded-lg text-xs font-bold mt-2 cursor-pointer"
            >
              फ़िल्टर रीसेट करें
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredOfferings.results.map(({ deity, item }) => {
              const isSpeaking = speakingId === item.id;
              const isCopied = copiedMantraId === item.id;

              return (
                <div
                  id={`offering_${item.id}`}
                  key={`${deity.deity_id}_${item.id}`}
                  className="bg-white/95 rounded-2xl p-4 border border-[#DFCBB5] hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 group scroll-mt-24"
                >
                  <div className="space-y-2.5">
                    {/* Top row: Deity badge (if search) and holy symbol */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl leading-none">{item.item_icon}</span>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-[#7A1D1D] text-[#FFD88A]">
                          अर्पण सामग्री
                        </span>
                        {filteredOfferings.isGlobalSearch && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2E4] text-[#7A1D1D] border border-[#DFCBB5] truncate">
                            {deity.avatar_icon} {deity.deity}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-[#FFF9F0] border border-[#DFCBB5] text-[#8C4A00] flex items-center justify-center text-xs font-serif font-black">
                          {item.holy_symbol}
                        </span>
                      </div>
                    </div>

                    {/* Action text */}
                    <div>
                      <h3 className="font-granth text-base sm:text-lg font-black text-[#462B17] leading-snug">
                        {item.action_text}
                      </h3>
                    </div>

                    {/* Highlighted Benefit Badge */}
                    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-l-4 border-[#B64D18] p-2.5 rounded-r-xl">
                      <div className="text-[10px] font-bold text-[#8C4A00] uppercase tracking-wider">
                        ✨ प्रत्यक्ष शास्त्रीय फल
                      </div>
                      <div className="font-serif text-sm font-black text-[#7A1D1D] mt-0.5 leading-snug">
                        {item.highlighted_benefit}
                      </div>
                    </div>

                    {/* Arpan Mantra if present */}
                    {item.mantra && (
                      <div className="bg-[#FFFDF8] rounded-xl p-2.5 border border-[#DFCBB5]/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#8C6239] flex items-center gap-1">
                            <span>ॐ</span>
                            <span>अर्पण करते समय जपें:</span>
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleSpeakMantra(item.id, item.mantra!)}
                              className={`p-1 rounded text-xs transition cursor-pointer ${
                                isSpeaking
                                  ? 'bg-[#7A1D1D] text-white'
                                  : 'text-[#8C6239] hover:text-[#7A1D1D] hover:bg-stone-100'
                              }`}
                              title="मंत्र उच्चारण सुनें"
                            >
                              {isSpeaking ? (
                                <VolumeX className="w-3.5 h-3.5" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleCopyMantra(item.id, item.mantra!)}
                              className="p-1 rounded text-xs text-[#8C6239] hover:text-[#7A1D1D] hover:bg-stone-100 transition cursor-pointer"
                              title="मंत्र कॉपी करें"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="font-serif text-xs font-semibold text-[#462B17] italic">
                          {item.mantra}
                        </div>
                      </div>
                    )}

                    {/* Extra Notes / Best Time */}
                    {(item.best_time || item.rules_note) && (
                      <div className="space-y-1 text-[11px] text-[#5C3A21]">
                        {item.best_time && (
                          <div className="flex items-center gap-1 text-[#8C6239]">
                            <Clock className="w-3 h-3 text-[#B58738] shrink-0" />
                            <span>
                              <strong>श्रेष्ठ काल:</strong> {item.best_time}
                            </span>
                          </div>
                        )}
                        {item.rules_note && (
                          <div className="flex items-start gap-1 text-[#7A1D1D] bg-[#FAF2E4]/60 p-1.5 rounded-lg border border-[#DFCBB5]/50">
                            <AlertTriangle className="w-3 h-3 text-[#B64D18] shrink-0 mt-0.5" />
                            <span>
                              <strong>विधि संकेत:</strong> {item.rules_note}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-2 border-t border-[#DFCBB5]/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleConsultUma(deity.deity, item)}
                      className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#B58738]/20 to-amber-500/20 hover:from-[#B58738]/30 hover:to-amber-500/30 text-[#5C1414] text-xs font-bold border border-[#B58738]/40 flex items-center gap-1 transition cursor-pointer"
                      title="उमा दैवज्ञ से इस अर्पण का व्यक्तिगत मुहूर्त व संकल्प पूछें"
                    >
                      <Sparkles className="w-3 h-3 text-[#B58738]" />
                      <span>उमा से पूछें</span>
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(deity.deity, item)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1 transition cursor-pointer"
                      title="व्हाट्सएप पर शेयर करें"
                    >
                      <Share2 className="w-3 h-3 text-emerald-600" />
                      <span>शेयर</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Prohibitions Full View Modal / Panel */}
        {showProhibitionView && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-rose-200 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-700" />
                <h3 className="font-granth text-base sm:text-lg font-black text-rose-950">
                  समस्त देवी-देवताओं पर वर्जित अर्पण (निषेध नियम)
                </h3>
              </div>
              <button
                onClick={() => setShowProhibitionView(false)}
                className="text-rose-700 hover:text-rose-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-rose-900 font-serif">
              शास्त्रों में स्पष्ट वर्णन है कि अनजाने में वर्जित वस्तु चढ़ाने से पुण्य के स्थान पर
              दोष लगता है। इन निषेधों का कड़ाई से पालन करें:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {deities
                .filter((d) => d.prohibited_items && d.prohibited_items.length > 0)
                .map((d) => (
                  <div
                    key={d.deity_id}
                    className="bg-white rounded-xl p-3 border border-rose-200 space-y-1 shadow-xs"
                  >
                    <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <span>{d.avatar_icon}</span>
                      <span>{d.deity}</span>
                    </div>
                    <ul className="text-[11px] text-rose-900 list-disc list-inside space-y-0.5">
                      {d.prohibited_items.map((pi, idx) => (
                        <li key={idx} className="leading-snug">
                          {pi}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* General Puja Rules Modal */}
        {showRulesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full p-5 border-2 border-[#D4AF37] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFCBB5] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪔</span>
                  <h3 className="font-granth text-lg font-bold text-[#5C1414]">
                    शास्त्रोक्त पूजन व अर्पण सामान्य नियम
                  </h3>
                </div>
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-[#462B17] font-serif leading-relaxed">
                {DEVTA_ARPAN_DATA.general_puja_rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-[#FAF2E4]/60 p-2 rounded-xl border border-[#DFCBB5]/50"
                  >
                    <span className="text-[#B64D18] font-bold shrink-0">{idx + 1}.</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong>धार्मिक मान्यता:</strong> {DEVTA_ARPAN_DATA.religious_disclaimer}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#7A1D1D] text-white text-xs font-bold hover:bg-[#5C1414] transition cursor-pointer"
                >
                  समझ गया / बंद करें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Religious Disclaimer Footer */}
        <div className="text-[11px] text-center text-[#8C6239] pt-4 border-t border-[#DFCBB5]/60 font-serif">
          {DEVTA_ARPAN_DATA.religious_disclaimer}
        </div>
      </div>
    </div>
  );
};
