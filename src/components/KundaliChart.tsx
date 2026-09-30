import React from 'react';

export const KundaliChart: React.FC = () => {
  return (
    <div className="w-64 h-64 border-2 border-amber-600 relative bg-amber-50/40 rounded-xl shadow-inner flex items-center justify-center">
      {/* Diagonal lines for North Indian Kundali style */}
      <div className="absolute inset-0 border border-amber-500/40 rotate-45 scale-[0.707] pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-px bg-amber-600/40" />
        <div className="absolute h-full w-px bg-amber-600/40" />
      </div>

      {/* House labels / Planets */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-900">1 (लग्न)</div>
      <div className="absolute top-8 left-12 text-[10px] font-semibold text-stone-700">सूर्य, बुध</div>
      <div className="absolute top-8 right-12 text-[10px] font-semibold text-stone-700">गुरु</div>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-900">12</div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-900">2</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-900">7</div>
      <div className="absolute bottom-8 left-12 text-[10px] font-semibold text-stone-700">शनि</div>
      <div className="absolute bottom-8 right-12 text-[10px] font-semibold text-stone-700">मंगल, राहु</div>
      
      <div className="text-center z-10">
        <span className="text-xs font-extrabold text-amber-800 bg-white/80 px-2 py-1 rounded-md shadow-sm border border-amber-200">
          जन्म लग्न चक्र
        </span>
      </div>
    </div>
  );
};
