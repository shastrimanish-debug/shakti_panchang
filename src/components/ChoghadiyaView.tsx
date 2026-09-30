import React, { useState } from 'react';
import { Clock, Sun, Moon } from 'lucide-react';

export const ChoghadiyaView: React.FC = () => {
  const [isDay, setIsDay] = useState(true);

  const dayChoghadiya = [
    { name: 'उद्वेग (Udweg)', type: 'अशुभ (Ashubh)', ruling: 'सूर्य' },
    { name: 'चर (Char)', type: 'शुभ (Shubh)', ruling: 'शुक्र' },
    { name: 'लाभ (Labh)', type: 'उत्तम (Uttam)', ruling: 'बुध' },
    { name: 'अमृत (Amrit)', type: 'सर्वोत्तम (Sarvottam)', ruling: 'चंद्रमा' },
    { name: 'काल (Kaal)', type: 'अशुभ (Ashubh)', ruling: 'शनि' },
    { name: 'शुभ (Shubh)', type: 'उत्तम (Uttam)', ruling: 'गुरु' },
    { name: 'रोग (Rog)', type: 'अशुभ (Ashubh)', ruling: 'मंगल' },
    { name: 'उद्वेग (Udweg)', type: 'अशुभ (Ashubh)', ruling: 'सूर्य' },
  ];

  const nightChoghadiya = [
    { name: 'शुभ (Shubh)', type: 'उत्तम (Uttam)', ruling: 'गुरु' },
    { name: 'अमृत (Amrit)', type: 'सर्वोत्तम (Sarvottam)', ruling: 'चंद्रमा' },
    { name: 'चर (Char)', type: 'शुभ (Shubh)', ruling: 'शुक्र' },
    { name: 'रोग (Rog)', type: 'अशुभ (Ashubh)', ruling: 'मंगल' },
    { name: 'काल (Kaal)', type: 'अशुभ (Ashubh)', ruling: 'शनि' },
    { name: 'लाभ (Labh)', type: 'उत्तम (Uttam)', ruling: 'बुध' },
    { name: 'उद्वेग (Udweg)', type: 'अशुभ (Ashubh)', ruling: 'सूर्य' },
    { name: 'शुभ (Shubh)', type: 'उत्तम (Uttam)', ruling: 'गुरु' },
  ];

  const currentList = isDay ? dayChoghadiya : nightChoghadiya;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-600" /> दैनिक चौघड़िया (Choghadiya Muhurat)
            </h2>
            <p className="text-sm text-stone-600 mt-1">यात्रा, व्यापार और किसी भी नए कार्य के शुभारंभ हेतु दिन और रात का चौघड़िया।</p>
          </div>
          <div className="flex gap-2 bg-amber-50 p-1.5 rounded-2xl border border-amber-200">
            <button
              onClick={() => setIsDay(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isDay ? 'bg-amber-600 text-white shadow' : 'text-stone-700 hover:bg-amber-100/60'
              }`}
            >
              <Sun className="w-4 h-4" /> दिन का चौघड़िया
            </button>
            <button
              onClick={() => setIsDay(false)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !isDay ? 'bg-amber-600 text-white shadow' : 'text-stone-700 hover:bg-amber-100/60'
              }`}
            >
              <Moon className="w-4 h-4" /> रात का चौघड़िया
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentList.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-md border border-amber-200/80 hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-stone-500 font-bold">मुहूर्त #{idx + 1}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  item.type.includes('शुभ') || item.type.includes('उत्तम') || item.type.includes('सर्वोत्तम')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">{item.name}</h3>
              <p className="text-xs text-stone-600">स्वामी ग्रह: <strong className="text-amber-900">{item.ruling}</strong></p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500">
              <span>अवधि: ~1.5 घंटा</span>
              <span className="font-semibold text-amber-700">सक्रिय</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
