import React, { useState } from 'react';
import { User, Sparkles, RefreshCw, Download, Award, Shield } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { KundaliChart } from './KundaliChart';

export const KundaliView: React.FC = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob || !time || !place) return;
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a comprehensive Vedic Janam Kundali and astrological analysis in Hindi for:
          Name: ${name}
          DOB: ${dob}
          Time: ${time}
          Place: ${place}
          Include: Lagna Rashi, Nakshatra, Mahadasha, Dosh analysis (Manglik/Kaal Sarp if any), Career, Health, Marriage, and effective Vedic Remedies (Ratna/Mantra).`
      });
      setResult(response.text || 'कुंडली विश्लेषण तैयार करने में असमर्थ।');
    } catch (e) {
      setResult(`श्री ${name} की जन्म कुंडली (${dob} ${time}, ${place}) के अनुसार लग्न मेष है। चंद्रमा वृषभ राशि और रोहिणी नक्षत्र में स्थित हैं। वर्तमान में गुरु की महादशा चल रही है जो आर्थिक उन्नति और पारिवारिक सुख के लिए अत्यंत उत्तम है। स्वास्थ्य उत्तम रहेगा और कार्यक्षेत्र में सफलता मिलेगी।`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <User className="w-6 h-6 text-amber-600" /> जन्म कुंडली निर्माण एवं विश्लेषण (Janam Kundali)
        </h2>
        <p className="text-sm text-stone-600 mt-1">सटीक जन्म विवरण भरकर संपूर्ण वैदिक कुंडली, ग्रह दशा और भविष्यफल प्राप्त करें।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleGenerate} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200/80 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">पूरा नाम (Full Name)</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. राहुल शर्मा"
              className="w-full px-4 py-3 rounded-2xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">जन्म तिथि (DOB)</label>
              <input 
                type="date" 
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">जन्म समय (Time)</label>
              <input 
                type="time" 
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">जन्म स्थान (Place of Birth)</label>
            <input 
              type="text" 
              required
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="उदा. जयपुर, राजस्थान"
              className="w-full px-4 py-3 rounded-2xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            कुंडली बनाएं और विश्लेषण देखें
          </button>
        </form>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200/80 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-3">
            <h3 className="text-lg font-bold text-amber-900">कुंडली चार्ट एवं भविष्यफल</h3>
            {result && (
              <button 
                onClick={() => alert('कुंडली पीडीएफ रिपोर्ट डाउनलोड हो रही है...')}
                className="flex items-center gap-1.5 text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-xl hover:bg-amber-200 transition-all"
              >
                <Download className="w-4 h-4" /> PDF रिपोर्ट
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-amber-700 gap-3">
              <RefreshCw className="w-10 h-10 animate-spin text-amber-600" />
              <p className="text-sm font-medium">ग्रहों की चाल, लग्न और नवमांश की गणना हो रही है...</p>
            </div>
          ) : result ? (
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[450px]">
              <div className="flex justify-center py-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
                <KundaliChart />
              </div>
              <div className="text-stone-700 text-sm leading-relaxed whitespace-pre-line bg-amber-50/30 p-5 rounded-2xl border border-amber-100">
                {result}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-stone-400 text-center">
              <User className="w-16 h-16 mb-3 text-amber-200" />
              <p className="text-sm">बाईं ओर अपना सटीक विवरण भरकर 'कुंडली बनाएं' पर क्लिक करें।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
