import React, { useState } from 'react';
import { Calendar, Sparkles, Clock, Star } from 'lucide-react';
import { Festival } from '../types';

export const FestivalsView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'major' | 'vrata'>('all');

  const festivals: Festival[] = [
    { date: '2026-10-02', name: 'पितृ पक्ष समाप्त / सर्वपित्री अमावस्या', category: 'major', description: 'अपने पूर्वजों के तर्पण और श्रद्धांजलि का अंतिम पावन दिन।' },
    { date: '2026-10-03', name: 'शारदीय नवरात्रि प्रारंभ / कलश स्थापना', category: 'major', description: 'माँ दुर्गा के नौ रूपों की उपासना का महान पर्व प्रारंभ।' },
    { date: '2026-10-11', name: 'महा अष्टमी / महानवमी', category: 'major', description: 'माँ महागौरी सिद्धिदात्री पूजन और कन्या पूजन।' },
    { date: '2026-10-12', name: 'विजयादशमी (दुकहरा / रावण दहन)', category: 'major', description: 'अधर्म पर धर्म की विजय और भगवान राम की लंका विजय का उत्सव।' },
    { date: '2026-10-20', name: 'पापांकुशा एकादशी व्रत', category: 'vrata', description: 'भगवान विष्णु को समर्पित एकादशी व्रत जो सभी पापों का नाश करता है।' },
    { date: '2026-10-29', name: 'शरद पूर्णिमा (कोजागर व्रत)', category: 'major', description: 'चंद्रमा की अमृत वर्षा और माँ लक्ष्मी का प्राकट्य उत्सव।' },
    { date: '2026-11-08', name: 'करवा चौथ व्रत', category: 'vrata', description: 'अखंड सौभाग्य और पति की दीर्घायु का व्रत।' },
    { date: '2026-11-12', name: 'धनतेरस / धन्वंतरि जयन्ती', category: 'major', description: 'आयुर्वेद के देवता धन्वंतरि पूजन और दीपदान का पर्व।' },
    { date: '2026-11-14', name: 'दीपावली (लक्ष्मी-गणेश पूजन)', category: 'major', description: 'महालक्ष्मी और भगवान गणेश की महापूजा का दीपोत्सव।' },
    { date: '2026-11-16', name: 'गोवर्धन पूजा / अन्नकूट', category: 'major', description: 'गोवर्धन पर्वत और भगवान श्रीकृष्ण की पूजा।' },
    { date: '2026-11-18', name: 'भैया दूज (यम द्वितीया)', category: 'major', description: 'भाई-बहन के स्नेह और रक्षा का पर्व।' },
    { date: '2026-11-20', name: 'छठ पूजा (महापर्व)', category: 'major', description: 'सूर्य देव और छठी मइया की उपासना का कठोर व्रत।' },
  ];

  const filteredFestivals = festivals.filter(f => filter === 'all' || f.category === filter);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-600" /> सनातन व्रत एवं त्यौहार 2026
            </h2>
            <p className="text-sm text-stone-600 mt-1">वर्ष 2026 के सभी प्रमुख व्रत, एकादशी, पूर्णिमा और त्यौहारों की सूची।</p>
          </div>
          <div className="flex gap-2 bg-amber-50 p-1.5 rounded-2xl border border-amber-200">
            {[
              { id: 'all', label: 'सभी' },
              { id: 'major', label: 'प्रमुख पर्व' },
              { id: 'vrata', label: 'व्रत / एकादशी' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.id ? 'bg-amber-600 text-white shadow' : 'text-stone-700 hover:bg-amber-100/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFestivals.map((fest, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-md border border-amber-200/80 flex flex-col justify-between hover:shadow-xl transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> {fest.date}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  fest.category === 'major' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {fest.category === 'major' ? 'प्रमुख पर्व' : 'व्रत'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{fest.name}</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">{fest.description}</p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
              <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> शुभ मुहूर्त उपलब्ध</span>
              <span>विधि सहित</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
