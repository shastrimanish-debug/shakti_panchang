import React from 'react';
import { Clock, Heart, Sun, Sparkles, BookOpen, Shield } from 'lucide-react';

export const MuhuratView: React.FC = () => {
  const muhurats = [
    { title: 'विवाह मुहूर्त (Marriage)', date: 'नवंबर - दिसंबर 2026', count: '14 शुभ तिथियाँ', desc: 'पाणिग्रहण संस्कार और विवाह के लिए सर्वोत्कृष्ट मुहूर्त।', icon: Heart, color: 'text-pink-600 bg-pink-50' },
    { title: 'गृह प्रवेश (House Warming)', date: 'अक्टूबर - नवंबर 2026', count: '8 शुभ तिथियाँ', desc: 'नए घर में प्रवेश और वास्तु शांति के लिए मंगलमय दिन।', icon: Sun, color: 'text-amber-600 bg-amber-50' },
    { title: 'वाहन खरीदी (Vehicle Purchase)', date: 'इस माह रवि पुष्य योग', count: '5 शुभ दिन', desc: 'कार, बाइक या संपत्ति की रजिस्ट्री एवं खरीदी हेतु।', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'नामकरण संस्कार (Naming)', date: 'शुक्ल पक्ष तिथियाँ', count: '10 शुभ मुहूर्त', desc: 'नवजात शिशु के नामकरण और जातकर्म संस्कार हेतु।', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'मुंडन संस्कार (Mundan)', date: 'नवंबर 2026', count: '6 शुभ तिथियाँ', desc: 'बालक के प्रथम केश मुंडन संस्कार हेतु शुभ दिन।', icon: Shield, color: 'text-blue-600 bg-blue-50' },
    { title: 'व्यापार आरंभ (Business Opening)', date: 'शुभ चौघड़िया में', count: 'दैनिक मुहूर्त', desc: 'नया प्रतिष्ठान, दुकान या ऑफिस शुभारंभ के लिए।', icon: Clock, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-amber-600" /> शुभ मुहूर्त 2026 (Shubh Muhurat)
        </h2>
        <p className="text-sm text-stone-600 mt-1">विवाह, गृह प्रवेश, वाहन खरीदी और सभी संस्कारों के लिए पारंपरिक वैदिक मुहूर्त।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {muhurats.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-amber-200/80 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${m.color} flex items-center justify-center shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">{m.count}</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">{m.title}</h3>
                <p className="text-xs text-amber-700 font-semibold mb-3">{m.date}</p>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">{m.desc}</p>
              </div>
              <button 
                onClick={() => alert(`${m.title} के लिए इस माह की सभी विस्तृत शुभ तिथियां और समय लोड हो रहे हैं...`)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow transition-all"
              >
                विस्तृत तिथियाँ देखें
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
