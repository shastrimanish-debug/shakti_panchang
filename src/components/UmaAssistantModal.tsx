import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, RefreshCw, Award } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface UmaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UmaAssistantModal: React.FC<UmaAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'नमस्कार! मैं आचार्य उमा हूँ — 40 वर्षों के प्रगाढ़ अनुभव वाली वैदिक ज्योतिष सलाहकार। आप अपनी जन्मतिथि, समय, स्थान या जीवन की कोई भी समस्या साझा करें। मैं आपकी कुंडली के विशिष्ट ग्रहों, योगों और दशाओं का सटीक विश्लेषण करके बिल्कुल स्पष्ट, व्यक्तिगत और बिना किसी भ्रम के सटीक वैदिक उपाय बताऊँगी।' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI();
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `You are Acharya Uma, a master Vedic Astrologer with 40 years of profound experience.
          CRITICAL RULES FOR ASTROLOGICAL CONSULTATION:
          1. NEVER provide generic or hardcoded remedies. Every prediction and remedy must be dynamically tailored and calculated specifically based on the user's exact query, birth details, planetary positions, Dasha, Gochar (transits), and specific yoga/dosha (e.g., Manglik, Kaalsarp, Shani Sade Sati, Pitru Dosha, Guru Chandal Yog, etc.).
          2. Remedies must be crystal-clear, highly detailed, and structured step-by-step so the user never experiences any confusion. 
          3. Include exact specifications: Which day to start, auspicious muhurat/time, required puja items, exact mantra pronunciation/count (e.g., 108 times), charity (daan), and practical spiritual discipline.
          4. Respond in professional, compassionate, and authoritative Hindi as a veteran 40-year astrologer.`
        }
      });
      const response = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'कृपया पुनः प्रयास करें।' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'क्षमा करें, इस समय ग्रहों की गति के कारण संपर्क में बाधा है। कृपया पुनः प्रश्न पूछें।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#fcf8ec] rounded-3xl max-w-3xl w-full h-[700px] shadow-2xl border-4 border-amber-600/60 flex flex-col overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-stone-900 transition-all z-10 cursor-pointer shadow"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-950 text-white p-5 flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/30 flex items-center justify-center border-2 border-amber-400/50 shadow-inner">
            <Award className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              आचार्य उमा <span className="text-xs bg-amber-500/40 text-amber-100 px-2.5 py-0.5 rounded-full font-sans font-normal">40 वर्ष अनुभव • व्यक्तिगत सटीक ज्योतिष</span>
            </h3>
            <p className="text-xs text-amber-200/90 font-sans">कस्टम कुंडली विश्लेषण • बिना भ्रम के स्पष्ट और विस्तृत वैदिक उपाय</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-amber-50/40 font-serif">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm md:text-base shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-amber-700 text-white rounded-br-none font-sans' 
                  : 'bg-white text-stone-900 border border-amber-300 rounded-bl-none leading-relaxed'
              }`}>
                <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-amber-900 border border-amber-300 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-3 shadow-sm font-sans">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                <span>आचार्य उमा विशिष्ट ग्रहों और योगों की गणना कर रही हैं...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-amber-300 flex gap-2 shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="अपनी जन्मतिथि, समय, स्थान या समस्या बताएं (ताकि सटीक और स्पष्ट उपाय मिल सके)..."
            className="flex-1 px-4 py-3 rounded-2xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm font-sans"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer font-sans"
          >
            <Send className="w-4 h-4" /> पूछें
          </button>
        </div>
      </div>
    </div>
  );
};
