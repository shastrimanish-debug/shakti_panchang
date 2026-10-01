import React from 'react';
import { Sun, MapPin, Calendar, Menu, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  location: string;
  setLocation: (loc: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onOpenUma: () => void;
  onOpenLocationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  location,
  selectedDate,
  setSelectedDate,
  onOpenUma,
  onOpenLocationModal
}) => {
  const navItems: Array<{ id: ActiveTab; label: string }> = [
    { id: 'dashboard', label: 'डैशबोर्ड' },
    { id: 'panchang', label: 'पंचांग' },
    { id: 'festivals', label: 'व्रत व त्यौहार' },
    { id: 'muhurat', label: 'शुभ मुहूर्त' },
    { id: 'kundali', label: 'कुंडली' },
    { id: 'milan', label: 'गुण मिलान' },
    { id: 'choghadiya', label: 'चौघड़िया' },
    { id: 'vrat', label: 'व्रत कथाएँ' },
    { id: 'sadesati', label: 'साडेसाती' },
    { id: 'gochar', label: 'ग्रह गोचर' },
    { id: 'ratna', label: 'रत्न विचार' },
    { id: 'mantra', label: 'मंत्र & स्तोत्र' },
    { id: 'rashifal', label: 'दैनिक राशिफल' },
    { id: 'upay', label: 'चमत्कारिक उपाय' },
    { id: 'vastu', label: 'वास्तु शास्त्र' },
    { id: 'uma', label: 'उमा AI ज्योतिषी' }
  ];

  return (
    <header className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/30 flex items-center justify-center border-2 border-amber-300 shadow-inner">
            <Sun className="w-7 h-7 text-amber-200 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
              शक्ति पंचांग <span className="text-xs bg-amber-500/40 text-amber-100 px-2 py-0.5 rounded-full font-normal">v1.0.8 Pro</span>
            </h1>
            <p className="text-xs text-amber-200/90">सनातन वैदिक पंचांग, व्रत कथाएँ और AI ज्योतिष उमा</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm text-sm border border-amber-500/30">
          <button 
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 text-amber-200 hover:text-white transition-all cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-xs">{location}</span>
          </button>
          <div className="w-px h-4 bg-amber-400/40" />
          <div className="flex items-center gap-1.5 text-amber-200">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer text-xs font-medium"
            />
          </div>
          <button
            onClick={onOpenUma}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> उमा AI
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-amber-900/40 border-t border-amber-600/30 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex gap-1.5 py-2">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'uma') {
                    onOpenUma();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-amber-500 text-stone-950 shadow-md font-bold' 
                    : 'text-amber-100 hover:bg-amber-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
