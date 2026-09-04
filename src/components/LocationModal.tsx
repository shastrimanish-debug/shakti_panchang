import React, { useState, useEffect, useRef } from 'react';
import { SavedLocation } from '../types';
import { COMMON_INDIAN_CITIES } from '../services/disha';
import {
  getUserCustomLocations,
  saveUserCustomLocation,
  setStoredLocation,
} from '../services/storage';
import {
  MapPin,
  X,
  Search,
  Sparkles,
  Plus,
  Compass,
  Check,
  Loader2,
} from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: SavedLocation;
  onSelectLocation: (loc: SavedLocation) => void;
  title?: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  title = 'स्थान / शहर / गाँव चुनें',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SavedLocation[]>(() =>
    COMMON_INDIAN_CITIES.slice(0, 30)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'pilgrimage' | 'custom'>('search');

  // Custom Village Form states
  const [customName, setCustomName] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customState, setCustomState] = useState('');
  const [customCountry, setCustomCountry] = useState('भारत');
  const [customLat, setCustomLat] = useState('28.6139');
  const [customLon, setCustomLon] = useState('77.2090');

  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (!searchQuery.trim()) {
      const customLocs = getUserCustomLocations();
      setResults([...customLocs, ...COMMON_INDIAN_CITIES.slice(0, 30)]);
      setIsLoading(false);
      return;
    }

    const q = searchQuery.trim().toLowerCase();
    const customLocs = getUserCustomLocations();
    const combined = [...customLocs, ...COMMON_INDIAN_CITIES];
    const filtered = combined.filter(
      (loc: any) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.state && loc.state.toLowerCase().includes(q)) ||
        (loc.country && loc.country.toLowerCase().includes(q)) ||
        (loc.district && loc.district.toLowerCase().includes(q))
    );

    setResults(filtered.slice(0, 20));
    setIsLoading(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        if (searchQuery.trim().length >= 3) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery.trim()
          )}&limit=12&addressdetails=1&accept-language=hi,en`;

          const res = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const onlineResults: SavedLocation[] = data.map((item: any) => {
                const addr = item.address || {};
                const name =
                  addr.village ||
                  addr.town ||
                  addr.city ||
                  addr.suburb ||
                  addr.county ||
                  item.name ||
                  searchQuery;
                const state = addr.state || addr.state_district || addr.region || '';
                const country = addr.country || 'विश्व';
                const dist = addr.county || addr.state_district || '';
                return {
                  name: dist
                    ? `${name} (${dist}, ${state || country})`
                    : state
                    ? `${name} (${state}, ${country})`
                    : `${name} (${country})`,
                  latitude: parseFloat(item.lat),
                  longitude: parseFloat(item.lon),
                  state: state || undefined,
                  district: dist || undefined,
                  country,
                  type: 'village',
                };
              });
              setResults([...filtered, ...onlineResults]);
            }
          }
        }
      } catch {
        // Fallback to offline filtered results
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (loc: SavedLocation) => {
    setStoredLocation(loc);
    onSelectLocation(loc);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      const base = customName.trim() || `कस्टम स्थान (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
      const full = customDistrict
        ? `${base} (${customDistrict}, ${customState || customCountry})`
        : customState
        ? `${base} (${customState})`
        : base;

      const newLoc: SavedLocation = {
        name: full,
        latitude: lat,
        longitude: lon,
        state: customState.trim() || undefined,
        district: customDistrict.trim() || undefined,
        country: customCountry.trim() || 'भारत',
        type: 'village',
      };

      saveUserCustomLocation(newLoc);
      setStoredLocation(newLoc);
      onSelectLocation(newLoc);
      onClose();
    }
  };

  const handleGpsDetect = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          let label = `वर्तमान जीपीएस स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=hi,en`
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const place =
                addr.village || addr.town || addr.city || addr.suburb || addr.county;
              const region = addr.state || addr.country || '';
              if (place) {
                label = `${place} (${region}) [GPS]`;
              }
            }
          } catch {}

          const gpsLoc: SavedLocation = {
            name: label,
            latitude: lat,
            longitude: lon,
          };
          setStoredLocation(gpsLoc);
          onSelectLocation(gpsLoc);
          onClose();
        },
        () => {
          alert(
            'जीपीएस लोकेशन प्राप्त नहीं हो सकी। कृपया खोज बॉक्स में अपने गाँव या शहर का नाम लिखें।'
          );
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const pilgrimageCities = COMMON_INDIAN_CITIES.filter((c: any) => c.type === 'pilgrimage');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#5C3A21] text-[#FAF2E4] p-3.5 flex items-center justify-between border-b-2 border-[#8C6239]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#E69A33]" />
            <div>
              <h3 className="font-bold text-base font-granth">{title}</h3>
              <p className="text-[10px] text-[#E5D2B8]">
                विश्व के किसी भी शहर, कस्बे अथवा गाँव का चयन करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#E5D2B8] hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#8C6239]/20 bg-[#F4E8D1] px-3 pt-2 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[#FAF2E4] text-[#5C3A21] border-t-2 border-[#B56A00]'
                : 'text-[#8C6239] hover:bg-[#FAF2E4]/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            वैश्विक खोज (गाँव/शहर)
          </button>
          <button
            onClick={() => setActiveTab('pilgrimage')}
            className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pilgrimage'
                ? 'bg-[#FAF2E4] text-[#5C3A21] border-t-2 border-[#B56A00]'
                : 'text-[#8C6239] hover:bg-[#FAF2E4]/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
            पवित्र तीर्थ स्थल
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-[#FAF2E4] text-[#5C3A21] border-t-2 border-[#B56A00]'
                : 'text-[#8C6239] hover:bg-[#FAF2E4]/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            कस्टम गाँव जोड़ें
          </button>
        </div>

        {/* Tab 1: Global Search */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-[#8C6239]/20 space-y-2.5">
              <button
                onClick={handleGpsDetect}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/40 rounded-lg text-xs font-bold text-[#5C3A21] transition cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#B56A00]" />
                वर्तमान जीपीएस स्थान से ऑटो-डिटेक्ट करें (Auto-Detect GPS)
              </button>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="गाँव, तहसील, जिला या शहर का नाम लिखें (उदा. पिंडवाड़ा, अयोध्या, Pushkar, London)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg text-xs sm:text-sm font-semibold text-[#5C3A21] placeholder-[#8C6239]/70 focus:outline-none focus:ring-1 focus:ring-[#B56A00]"
                  autoFocus
                />
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-[#B56A00] absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                ) : searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6239] hover:text-[#5C3A21] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#735133] px-1">
                <span>
                  {isLoading
                    ? '🌐 ऑनलाइन वैश्विक मानचित्र पर खोज रहे हैं...'
                    : searchQuery
                    ? `खोज परिणाम: ${results.length} स्थान मिले`
                    : '🌐 ऑनलाइन व ऑफ़लाइन दोनों मोड में विश्वभर का कोई भी गाँव खोजें'}
                </span>
                <span className="text-[#B56A00] font-medium">अक्षांश-देशांतर सहित</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#8C6239]/10">
              {results.length === 0 ? (
                <div className="text-center py-8 px-4 text-[#8C6239] space-y-2">
                  <p className="text-xs sm:text-sm font-medium">कोई परिणाम नहीं मिला।</p>
                  <p className="text-[11px] text-[#735133]">
                    आप ऊपर &apos;कस्टम गाँव जोड़ें&apos; टैब में जाकर अपने गाँव का नाम व निर्देशांक सीधे दर्ज कर सकते हैं।
                  </p>
                </div>
              ) : (
                results.map((loc, idx) => {
                  const isCurrent =
                    Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
                    Math.abs(loc.longitude - currentLocation.longitude) < 0.01;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                        isCurrent
                          ? 'bg-[#E5D2B8] text-[#5C3A21] font-bold'
                          : 'hover:bg-[#F4E8D1] text-[#5C3A21]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <MapPin
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isCurrent ? 'text-[#B56A00]' : 'text-[#8C6239]'
                          }`}
                        />
                        <div className="truncate">
                          <div className="text-xs sm:text-sm font-bold truncate">
                            {loc.name}
                          </div>
                          <div className="text-[10px] text-[#735133]">
                            {loc.country || 'विश्व'} • अक्षांश: {loc.latitude.toFixed(2)}°, देशांतर:{' '}
                            {loc.longitude.toFixed(2)}°
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#B56A00] shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Pilgrimage Sites */}
        {activeTab === 'pilgrimage' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <p className="text-xs text-[#735133] px-1 font-medium">
              सनातन धर्म के प्रमुख चार धाम, द्वादश ज्योतिर्लिंग एवं काल गणना के सिद्ध तीर्थ स्थल:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pilgrimageCities.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(loc)}
                  className="text-left p-2.5 bg-[#F4E8D1] hover:bg-[#E5D2B8] border border-[#8C6239]/30 rounded-lg transition cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#5C3A21] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B56A00]" />
                    {loc.name}
                  </div>
                  <div className="text-[10px] text-[#735133] mt-0.5">
                    {loc.state}{(loc as any).country ? `, ${(loc as any).country}` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Custom Location Addition */}
        {activeTab === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-xs text-[#735133] leading-relaxed">
              यदि आपका गाँव या कस्बा सूची में नहीं है, तो उसका नाम व अक्षांश-देशांतर यहाँ भरें। यह आपके ब्राउज़र में सदा के लिए सुरक्षित हो जाएगा।
            </p>

            <div>
              <label className="block text-xs font-bold text-[#8C6239] mb-1">
                गाँव / कस्बे का नाम *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. पिण्डवाड़ा / रामगढ़ / मेरा गाँव"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full p-2 bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg text-xs sm:text-sm text-[#5C3A21] font-medium outline-none focus:ring-1 focus:ring-[#B56A00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#8C6239] mb-1">
                  जिला (District)
                </label>
                <input
                  type="text"
                  placeholder="उदा. सिरोही / सीकर"
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                  className="w-full p-2 bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg text-xs sm:text-sm text-[#5C3A21] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8C6239] mb-1">
                  राज्य (State)
                </label>
                <input
                  type="text"
                  placeholder="उदा. राजस्थान / गुजरात"
                  value={customState}
                  onChange={(e) => setCustomState(e.target.value)}
                  className="w-full p-2 bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg text-xs sm:text-sm text-[#5C3A21] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#8C6239] mb-1">
                  अक्षांश (Latitude) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full p-2 bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg text-xs sm:text-sm text-[#5C3A21] font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8C6239] mb-1">
                  देशांतर (Longitude) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="w-full p-2 bg-[#F4E8D1] border border-[#8C6239]/40 rounded-lg text-xs sm:text-sm text-[#5C3A21] font-mono outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#5C3A21] hover:bg-[#462B17] text-[#FAF2E4] rounded-lg text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              इस स्थान को सहेजें और चुनें
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
