import { useEffect, useMemo, useRef, useState } from "react";
import { SavedLocation } from "../types";
import { COMMON_INDIAN_CITIES } from "../services/disha";
import {
  getUserCustomLocations,
  saveUserCustomLocation,
  setStoredLocation,
} from "../services/storage";
import { reverseGeocode, searchPlaces } from "@/lib/geocode";
import {
  MapPin,
  X,
  Search,
  Sparkles,
  Plus,
  Compass,
  Check,
  Loader2,
} from "lucide-react";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: SavedLocation;
  onSelectLocation: (loc: SavedLocation) => void;
  title?: string;
  persistGlobal?: boolean;
}

export function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  title = "स्थान / शहर / गाँव चुनें",
  persistGlobal = true,
}: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"search" | "pilgrimage" | "custom">("search");
  const [customName, setCustomName] = useState("");
  const [customDistrict, setCustomDistrict] = useState("");
  const [customState, setCustomState] = useState("");
  const [customLat, setCustomLat] = useState("23.1765");
  const [customLon, setCustomLon] = useState("75.7885");
  const debounceTimer = useRef<number | null>(null);

  const pilgrimageCities = useMemo(
    () => COMMON_INDIAN_CITIES.filter((c) => c.type === "pilgrimage"),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    const customLocs = getUserCustomLocations();
    if (!searchQuery.trim()) {
      setResults([...customLocs, ...COMMON_INDIAN_CITIES]);
      setIsLoading(false);
      return;
    }

    const q = searchQuery.trim().toLowerCase();
    const combined = [...customLocs, ...COMMON_INDIAN_CITIES];
    const filtered = combined.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.state && loc.state.toLowerCase().includes(q)) ||
        (loc.country && loc.country.toLowerCase().includes(q)) ||
        (loc.district && loc.district.toLowerCase().includes(q)),
    );
    setResults(filtered);

    if (q.length < 2) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(async () => {
      try {
        const online = await searchPlaces({ data: { query: searchQuery.trim() } });
        setResults((prev) => {
          const merged = [...online, ...prev];
          const seen = new Set<string>();
          return merged.filter((loc) => {
            const key = `${loc.name}|${loc.latitude.toFixed(3)}|${loc.longitude.toFixed(3)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }).slice(0, 30);
        });
      } catch {
        setError("ऑनलाइन खोज अभी उपलब्ध नहीं। नीचे सूची से चुनें या कस्टम स्थान जोड़ें।");
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (loc: SavedLocation) => {
    if (persistGlobal) setStoredLocation(loc);
    onSelectLocation(loc);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError("सही अक्षांश (−90 से 90) और देशांतर (−180 से 180) लिखें।");
      return;
    }
    const base = customName.trim() || `कस्टम स्थान (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
    const full = customDistrict
      ? `${base} (${customDistrict}, ${customState || "भारत"})`
      : customState
        ? `${base} (${customState})`
        : base;
    const newLoc: SavedLocation = {
      name: full,
      latitude: lat,
      longitude: lon,
      state: customState.trim() || undefined,
      district: customDistrict.trim() || undefined,
      country: "भारत",
      type: "village",
    };
    saveUserCustomLocation(newLoc);
    handleSelect(newLoc);
  };

  const handleGpsDetect = () => {
    if (!("geolocation" in navigator)) {
      setError("इस ब्राउज़र में GPS उपलब्ध नहीं है। शहर का नाम खोजें।");
      return;
    }
    setGpsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const place = await reverseGeocode({
            data: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          });
          handleSelect({ ...place, type: "gps" });
        } catch {
          handleSelect({
            name: `GPS स्थान (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            type: "gps",
          });
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        setError("GPS नहीं मिल सका। अनुमति दें, या शहर/गाँव का नाम लिखें।");
      },
      { enableHighAccuracy: true, timeout: 9000 },
    );
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-temple-dark/70"
      data-swipe-ignore="true"
      onClick={onClose}
    >
      <div
        className="bg-parchment border-2 border-wood rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-temple text-parchment p-3.5 flex items-center justify-between border-b-2 border-wood">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-5 h-5 text-gold-mid shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-base font-granth">{title}</h3>
              <p className="text-[11px] text-sand truncate">
                वर्तमान: {currentLocation.name}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-sand hover:text-parchment rounded-lg" aria-label="बंद करें">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-wood/20 bg-parchment-deep px-2 pt-2 gap-1 text-xs font-bold overflow-x-auto no-scrollbar">
          {(
            [
              ["search", "खोज", Search],
              ["pilgrimage", "तीर्थ", Sparkles],
              ["custom", "कस्टम", Plus],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3 py-2.5 rounded-t-lg transition flex items-center gap-1.5 shrink-0 min-h-11 ${
                activeTab === id
                  ? "bg-parchment text-temple border-t-2 border-gold"
                  : "text-wood hover:bg-parchment/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-3 mt-3 p-2.5 bg-gold-bright/30 border border-gold/40 rounded-lg text-xs text-ink font-medium">
            {error}
          </div>
        )}

        {activeTab === "search" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-wood/20 space-y-2.5">
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={gpsLoading}
                className="w-full min-h-11 flex items-center justify-center gap-2 py-2.5 px-3 bg-parchment-deep hover:bg-leaf border border-wood/40 rounded-lg text-xs font-bold text-temple"
              >
                {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <Compass className="w-4 h-4 text-gold" />}
                {gpsLoading ? "GPS खोजा जा रहा है..." : "वर्तमान GPS स्थान चुनें"}
              </button>
              <div className="relative">
                <Search className="w-4 h-4 text-wood absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  placeholder="गाँव, शहर या तीर्थ लिखें — अयोध्या, पिंडवाड़ा, London..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-11 pl-9 pr-10 py-2 bg-parchment-deep border border-wood/40 rounded-lg text-sm font-semibold text-temple placeholder:text-muted/80 outline-none focus:ring-2 focus:ring-gold/40"
                  autoFocus
                />
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-gold absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                ) : null}
              </div>
              <p className="text-[11px] text-muted px-1">
                {isLoading
                  ? "विश्व मानचित्र पर खोज हो रही है..."
                  : `${results.length} स्थान • अक्षांश-देशांतर सहित`}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="text-center py-10 px-4 text-wood space-y-2">
                  <p className="text-sm font-medium">कोई परिणाम नहीं मिला।</p>
                  <p className="text-xs text-muted">कस्टम टैब से गाँव का नाम व निर्देशांक जोड़ें।</p>
                </div>
              ) : (
                results.map((loc, idx) => {
                  const isCurrent =
                    Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
                    Math.abs(loc.longitude - currentLocation.longitude) < 0.01;
                  return (
                    <button
                      key={`${loc.name}-${idx}`}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left p-3 rounded-lg flex items-center justify-between min-h-12 ${
                        isCurrent ? "bg-leaf-dark text-temple font-bold" : "hover:bg-parchment-deep text-temple"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isCurrent ? "text-gold" : "text-wood"}`} />
                        <div className="min-w-0">
                          <div className="text-sm font-bold leading-snug">{loc.name}</div>
                          <div className="text-[11px] text-muted">
                            {loc.state || loc.country || "विश्व"} • {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-gold shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "pilgrimage" && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <p className="text-xs text-muted px-1 font-medium">
              चार धाम, ज्योतिर्लिंग एवं सिद्ध तीर्थ — पंचांग गणना यहीं से सटीक होगी।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pilgrimageCities.map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="text-left p-3 min-h-14 bg-parchment-deep hover:bg-leaf border border-wood/30 rounded-lg"
                >
                  <div className="text-xs font-bold text-temple flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    {loc.name}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">{loc.state}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "custom" && (
          <form onSubmit={handleCustomSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-xs text-muted leading-relaxed">
              गाँव सूची में न हो तो नाम व निर्देशांक भरें। यह केवल आपके उपकरण पर सहेजा जाता है।
            </p>
            <label className="block text-xs font-bold text-wood">गाँव / कस्बे का नाम *</label>
            <input
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="उदा. पिण्डवाड़ा"
              className="w-full min-h-11 p-2 bg-parchment-deep border border-wood/40 rounded-lg text-sm text-temple outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-wood mb-1">जिला</label>
                <input value={customDistrict} onChange={(e) => setCustomDistrict(e.target.value)} className="w-full min-h-11 p-2 bg-parchment-deep border border-wood/40 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-wood mb-1">राज्य</label>
                <input value={customState} onChange={(e) => setCustomState(e.target.value)} className="w-full min-h-11 p-2 bg-parchment-deep border border-wood/40 rounded-lg text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-wood mb-1">अक्षांश *</label>
                <input type="number" step="any" required value={customLat} onChange={(e) => setCustomLat(e.target.value)} className="w-full min-h-11 p-2 bg-parchment-deep border border-wood/40 rounded-lg text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-wood mb-1">देशांतर *</label>
                <input type="number" step="any" required value={customLon} onChange={(e) => setCustomLon(e.target.value)} className="w-full min-h-11 p-2 bg-parchment-deep border border-wood/40 rounded-lg text-sm font-mono" />
              </div>
            </div>
            <button type="submit" className="w-full min-h-11 py-2.5 bg-temple hover:bg-temple-deep text-parchment rounded-lg text-sm font-bold flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" />
              सहेजें और चुनें
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
