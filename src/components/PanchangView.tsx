import React from 'react';
import { Sun, Moon, Compass, Calendar, AlertCircle, Sparkles, Clock, Share2, Download } from 'lucide-react';
import { PanchangData } from '../types';

interface PanchangViewProps {
  panchang: PanchangData;
}

export const PanchangView: React.FC<PanchangViewProps> = ({ panchang }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-600 to-amber-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-semibold">वैदिक पंचांग ({panchang.date})</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">{panchang.masa} {panchang.paksha}, {panchang.tithi.name}</h2>
            <p className="text-amber-100 mt-1 text-sm">विक्रम संवत {panchang.vikramSamvat} • शक संवत {panchang.shakaSamvat} • {panchang.ritu}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right">
            <p className="text-xs text-amber-200">मुख्य नक्षत्र</p>
            <p className="text-lg font-bold">{panchang.nakshatra.name}</p>
            <p className="text-xs text-amber-200 mt-1">योग: {panchang.yoga.name} • करण: {panchang.karan.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'सूर्य & चंद्र गणना', items: [{ l: 'सूर्योदय', r: panchang.sunrise }, { l: 'सूर्यास्त', r: panchang.sunset }, { l: 'चंद्रोदय', r: panchang.moonrise }, { l: 'चंद्रास्त', r: panchang.moonset }], icon: Sun, color: 'text-amber-600' },
          { title: 'अशुभ समय (राहुकाल)', items: [{ l: 'राहुकाल', r: panchang.rahuKaal }, { l: 'यमगण्ड', r: panchang.yamgand }, { l: 'गुलिक काल', r: panchang.gulikKaal }, { l: 'वर्ज्य काल', r: '01:15 PM - 02:45 PM' }], icon: AlertCircle, color: 'text-red-600' },
          { title: 'शुभ मुहूर्त', items: [{ l: 'अभिजित मुहूर्त', r: panchang.abhijitMuhurat }, { l: 'अमृत काल', r: '02:15 PM - 03:50 PM' }, { l: 'ब्रह्म मुहूर्त', r: '04:20 AM - 05:08 AM' }, { l: 'विजय मुहूर्त', r: '02:24 PM - 03:12 PM' }], icon: Sparkles, color: 'text-emerald-600' },
          { title: 'दिशा शूल & तारा', items: [{ l: 'दिशा शूल', r: 'पश्चिम दिशा' }, { l: 'राहु वास', r: 'दक्षिण दिशा' }, { l: 'नक्षत्र तारा', r: 'उत्तम सिद्धि तारा' }, { l: 'निवास', r: 'पूर्व दिशा' }], icon: Compass, color: 'text-blue-600' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-md border border-amber-200/60 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${card.color}`} />
                <h3 className="font-bold text-stone-800 text-base">{card.title}</h3>
              </div>
              <div className="space-y-2.5 text-sm">
                {card.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-stone-100 pb-2 last:border-0">
                    <span className="text-stone-500 text-xs">{item.l}</span>
                    <span className="font-semibold text-stone-800 text-xs">{item.r}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
