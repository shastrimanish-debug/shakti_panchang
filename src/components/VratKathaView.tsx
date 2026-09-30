import React, { useState } from 'react';
import { BookOpen, Clock, ChevronRight, X, Sparkles, Volume2 } from 'lucide-react';
import { vratKathaList, VratKatha } from '../data/vratKathaData';

export const VratKathaView: React.FC = () => {
  const [selectedVrat, setSelectedVrat] = useState<VratKatha | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-600" /> संपूर्ण व्रत कथा संग्रह (Vrat Kathayein)
        </h2>
        <p className="text-sm text-stone-600 mt-1">सनातन धर्म के सभी प्रमुख व्रतों, उपवासों की पवित्र कथाएँ, विधि और आरती।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vratKathaList.map((vrat) => (
          <div key={vrat.id} className="bg-white rounded-2xl p-6 shadow-md border border-amber-200/80 flex flex-col justify-between hover:shadow-xl transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full">{vrat.deity}</span>
                <span className="text-xs text-stone-500 flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-amber-600" /> {vrat.tithi}</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{vrat.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">{vrat.description}</p>
            </div>
            <button
              onClick={() => setSelectedVrat(vrat)}
              className="self-start flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
            >
              कथा पढ़ें <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedVrat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-amber-300 relative">
            <button 
              onClick={() => setSelectedVrat(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3.5 py-1 rounded-full">{selectedVrat.deity}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mt-2 mb-1">{selectedVrat.title}</h2>
            <p className="text-xs text-amber-700 font-semibold mb-4">तिथि: {selectedVrat.tithi}</p>

            <div className="space-y-4 text-stone-700 text-sm leading-relaxed border-t border-amber-100 pt-5">
              <div>
                <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-600" /> व्रत का महत्व</h4>
                <p>{selectedVrat.significance}</p>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 mb-1">पूजन विधि</h4>
                <p>{selectedVrat.vidhi}</p>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 mb-1">पौराणिक कथा</h4>
                <p>{selectedVrat.katha}</p>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 mb-1">आरती</h4>
                <p className="font-serif bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900">{selectedVrat.aarti}</p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedVrat(null)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
