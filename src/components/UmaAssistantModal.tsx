import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface UmaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UmaAssistantModal: React.FC<UmaAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'नमस्ते! मैं उमा हूँ, आपकी वैदिक ज्योतिष सलाहकार। आज आपके जीवन, व्रत, मुहूर्त या राशिफल के बारे में क्या जानना चाहते हैं?' }
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
          systemInstruction: 'You are Uma, a wise, compassionate, and knowledgeable Vedic Astrologer and Pandit. Answer questions in respectful Hindi about Hindu astrology, Panchang, festivals, Vrat Kathas, gemstones, and remedies.'
        }
      });
      const response = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'कृपया पुनः प्रयास करें।' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'क्षमा करें, इस समय संपर्क स्थापित नहीं हो पा रहा है। कृपया पुनः प्रयास करें।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[650px] shadow-2xl border border-amber-300 flex flex-col overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-stone-800 transition-all z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-amber-700 to-orange-600 text-white p-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center border border-white/40 shadow-inner">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <h3 className="font-bold text-lg">उमा • वैदिक ज्योतिष सलाहकार (AI Astrologer)</h3>
            <p className="text-xs text-amber-200">आपकी हर जिज्ञासा का ज्योतिषीय समाधान</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-amber-50/30">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-amber-600 text-white rounded-br-none' 
                  : 'bg-white text-stone-800 border border-amber-200 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-stone-600 border border-amber-200 rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                <span>उमा विचार कर रही हैं...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-amber-200 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="उमा से पूछें (उदा. आज का दिन कैसा रहेगा? व्रत विधि क्या है?)..."
            className="flex-1 px-4 py-3 rounded-2xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> भेजें
          </button>
        </div>
      </div>
    </div>
  );
};
