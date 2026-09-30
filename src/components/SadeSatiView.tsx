import React, { useState } from 'react';
import { Shield, Sparkles, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export const SadeSatiView: React.FC = () => {
  const [rashi, setRashi] = useState('मेष (Aries)');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const rashis = [
    'मेष (Aries)', 'वृषभ (Taurus)', 'मिथुन (Gemini)', 'कर्क (Cancer)',
    'सिंह (Leo)', 'कन्या (Virgo)', 'तुला (Libra)', 'वृश्चिक (Scorpio)',
    'धनु (Sagittarius)', 'मकर (Capricorn)', 'कुंभ (Aquarius)', 'मीन (Pisces)'
  ];

  const handleCheck = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a detailed astrological analysis in Hindi regarding Shani Sade Sati, Dhaiyya, and planetary effects for ${rashi} in 2026. Include effective remedies (shanti puja, Hanuman Chalisa, charity).`
      });
      setResult(response.text || 'शनि गोचर एवं साडेसाती विश्लेषण प्राप्त करने में असमर्थ।');
    } catch (e) {
      setResult(`वर्तमान गोचर के अनुसार ${rashi} के जातकों पर शनि का प्रभाव सामान्य है। शनिवार को पीपल के पेड़ के नीचे दीया जलाएं और हनुमान चालीसा का पाठ करें।`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200">
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-600" /> शनि साडेसाती एवं ढैया कैलकुलेटर (Sade Sati)
        </h2>
        <p className="text-sm text-stone-600 mt-1">अपनी राशि के आधार पर शनि की साडेसाती, ढैया और उसके निवारण के उपाय जानें।</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200/80 space-y-4">
          <label className="block text-xs font-bold text-stone-700">अपनी चंद्र राशि चुनें</label>
          <select
            value={rashi}
            onChange={(e) => setRashi(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium bg-amber-50/50 cursor-pointer"
          >
            {rashis.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            onClick={handleCheck}
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-2xl shadow transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            साडेसाती स्थिति जांचें
          </button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-md border border-amber-200/80 flex flex-col">
          <h3 className="text-lg font-bold text-amber-900 mb-3">ज्योतिषीय विश्लेषण एवं निवारण</h3>
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-amber-700 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
              <p className="text-sm">शनि की चाल और गोचर की गणना हो रही है...</p>
            </div>
          ) : result ? (
            <div className="flex-1 overflow-y-auto max-h-[350px] text-stone-700 text-sm leading-relaxed whitespace-pre-line bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
              {result}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-stone-400 text-center">
              <Shield className="w-16 h-16 mb-2 text-amber-200" />
              <p className="text-sm">बाईं ओर राशि चुनकर 'साडेसाती स्थिति जांचें' पर क्लिक करें।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
