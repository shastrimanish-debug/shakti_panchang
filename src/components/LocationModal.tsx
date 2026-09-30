import React from 'react';
import { X, MapPin } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  setLocation: (loc: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, location, setLocation }) => {
  if (!isOpen) return null;

  const cities = [
    'नई दिल्ली (New Delhi)',
    'वाराणसी (Varanasi)',
    'उज्जैन (Ujjain)',
    'जयपुर (Jaipur)',
    'मुंबई (Mumbai)',
    'कोलकाता (Kolkata)',
    'चेन्नई (Chennai)',
    'हरिद्वार (Haridwar)',
    'अयोध्या (Ayodhya)',
    'मथुरा (Mathura)',
    'पटना (Patna)',
    'बैंगलोर (Bangalore)'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-300 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-600" /> शहर / स्थान चुनें
        </h3>
        <p className="text-xs text-stone-600 mb-4">सटीक सूर्योदय, सूर्यास्त और पंचांग गणना के लिए अपना शहर चुनें।</p>

        <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => {
                setLocation(city);
                onClose();
              }}
              className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                location === city 
                  ? 'bg-amber-600 text-white border-amber-700 shadow' 
                  : 'bg-amber-50/50 text-stone-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
