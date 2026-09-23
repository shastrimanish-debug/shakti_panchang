import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  MapPin,
  Sparkles,
  Plus,
  Compass,
  Loader2,
  X,
  Check,
  Globe,
  Globe2,
  Building2,
  ChevronRight,
} from "lucide-react";
import { SavedLocation } from "../types";
import { searchPlaces, reverseGeocode } from "../lib/geocode";
import {
  getUserCustomLocations,
  saveUserCustomLocation,
  setStoredLocation,
} from "../services/storage";
import {
  GLOBAL_COUNTRIES,
  GLOBAL_CITIES_DATABASE,
  searchGlobalCities,
  toSavedLocation,
  GlobalCity,
} from "../services/globalCities";
import { timezoneHoursFor } from "../services/engine/time";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: SavedLocation;
  onSelectLocation: (loc: SavedLocation) => void;
  title?: string;
  persistGlobal?: boolean;
}

type ModalTab = "search" | "directory" | "pilgrimage" | "custom";

export function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  title = "स्थान / शहर / वैश्विक नगर चुनें",
  persistGlobal = true,
}: LocationModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Directory navigation state (Country -> Region -> City)
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("IN");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  // Custom Form state
  const [customName, setCustomName] = useState("");
  const [customDistrict, setCustomDistrict] = useState("");
  const [customState, setCustomState] = useState("");
  const [customCountry, setCustomCountry] = useState("भारत");
  const [customLat, setCustomLat] = useState("28.6139");
  const [customLon, setCustomLon] = useState("77.2090");
  const [customTz, setCustomTz] = useState("5.5");

  const debounceTimer = useRef<number | null>(null);

  // Pilgrimage cities from global database
  const pilgrimageCities = useMemo(() => {
    return GLOBAL_CITIES_DATABASE.filter((c) => c.type === "pilgrimage").map(toSavedLocation);
  }, []);

  // Directory: Countries list
  const countries = useMemo(() => GLOBAL_COUNTRIES, []);

  // Directory: Cities in selected country
  const countryCities = useMemo(() => {
    return GLOBAL_CITIES_DATABASE.filter((c) => c.countryCode === selectedCountryCode);
  }, [selectedCountryCode]);

  // Directory: Available regions in selected country
  const availableRegions = useMemo(() => {
    const regionSet = new Set<string>();
    countryCities.forEach((c) => {
      if (c.region) regionSet.add(c.region);
    });
    return Array.from(regionSet);
  }, [countryCities]);

  // Directory: Filtered cities based on region
  const filteredDirectoryCities = useMemo(() => {
    if (selectedRegion === "all") return countryCities;
    return countryCities.filter((c) => c.region === selectedRegion);
  }, [countryCities, selectedRegion]);

  // Fast Instant Search + Online Worldwide Geocode fallback
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    const customLocs = getUserCustomLocations();

    if (!searchQuery.trim()) {
      const defaultCities = GLOBAL_CITIES_DATABASE.slice(0, 40).map(toSavedLocation);
      setResults([...customLocs, ...defaultCities]);
      setIsLoading(false);
      return;
    }

    const q = searchQuery.trim().toLowerCase();
    // 1. Instant local search across our 150+ global & Indian cities database
    const localMatches = searchGlobalCities(q, 40);
    const customMatches = customLocs.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.state && loc.state.toLowerCase().includes(q)) ||
        (loc.country && loc.country.toLowerCase().includes(q))
    );
    const instantResults = [...customMatches, ...localMatches];
    setResults(instantResults);

    // If query is short, don't ping online geocoder
    if (q.length < 3) {
      setIsLoading(false);
      return;
    }

    // 2. Online Geocode fallback for any village/address globally
    setIsLoading(true);
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(async () => {
      try {
        const online = await searchPlaces({ data: { query: searchQuery.trim() } });
        setResults((prev) => {
          const merged = [...prev, ...online];
          const seen = new Set<string>();
          return merged
            .filter((loc) => {
              const key = `${loc.latitude.toFixed(2)}|${loc.longitude.toFixed(2)}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .slice(0, 45);
        });
      } catch {
        // Online geocode failed; keep local results
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (loc: SavedLocation) => {
    const tzHours = loc.timezoneHours ?? timezoneHoursFor(loc.latitude, loc.longitude);
    const finalLoc: SavedLocation = {
      ...loc,
      timezoneHours: tzHours,
    };
    if (persistGlobal) setStoredLocation(finalLoc);
    onSelectLocation(finalLoc);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    const tz = parseFloat(customTz);

    if (Number.isNaN(lat) || Number.isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError("सही अक्षांश (−90 से 90) और देशांतर (−180 से 180) लिखें।");
      return;
    }

    const base = customName.trim() || `कस्टम स्थान (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
    const full = customDistrict
      ? `${base} (${customDistrict}, ${customState || customCountry || "विश्व"})`
      : customState
        ? `${base} (${customState}, ${customCountry})`
        : customCountry
          ? `${base} (${customCountry})`
          : base;

    const newLoc: SavedLocation = {
      name: full,
      latitude: lat,
      longitude: lon,
      state: customState.trim() || undefined,
      district: customDistrict.trim() || undefined,
      country: customCountry.trim() || "भारत",
      type: "custom",
      timezoneHours: Number.isNaN(tz) ? timezoneHoursFor(lat, lon) : tz,
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
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const place = await reverseGeocode({
            data: { latitude: lat, longitude: lon },
          });
          handleSelect({
            ...place,
            type: "gps",
            timezoneHours: timezoneHoursFor(lat, lon),
          });
        } catch {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          handleSelect({
            name: `GPS स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
            latitude: lat,
            longitude: lon,
            type: "gps",
            timezoneHours: timezoneHoursFor(lat, lon),
          });
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        setError("GPS नहीं मिल सका। अनुमति दें, या शहर/गाँव का नाम लिखें।");
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  const selectedCountryInfo = countries.find((c) => c.code === selectedCountryCode) || countries[0];

  return (
    <div
      className="fixed inset-0 z-[99] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      data-swipe-ignore="true"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF2E4] border-2 border-[#8C6239] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[85vh] text-[#3E2714]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#5C3A21] text-[#FAF2E4] p-3 sm:p-3.5 flex items-center justify-between border-b-2 border-[#8C6239] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-5 h-5 text-[#E69A33] shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base font-granth text-[#FAF2E4] truncate">
                {title}
              </h3>
              <p className="text-[11px] text-[#D9C4A9] truncate">
                वर्तमान: {currentLocation.name} (UTC{currentLocation.timezoneHours !== undefined ? (currentLocation.timezoneHours >= 0 ? `+${currentLocation.timezoneHours}` : currentLocation.timezoneHours) : "+5.5"})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#D9C4A9] hover:text-[#FAF2E4] rounded-lg cursor-pointer transition active:scale-95 shrink-0"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#8C6239]/20 bg-[#F4E8D1] px-2 pt-2 gap-1 text-xs font-bold overflow-x-auto no-scrollbar shrink-0">
          {(
            [
              ["search", "त्वरित खोज", Search],
              ["directory", "विश्व नगर", Globe2],
              ["pilgrimage", "तीर्थ स्थल", Sparkles],
              ["custom", "कस्टम निर्देशांक", Plus],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3 py-2 rounded-t-lg transition flex items-center gap-1.5 shrink-0 min-h-10 cursor-pointer font-bold ${
                activeTab === id
                  ? "bg-[#FAF2E4] text-[#5C3A21] border-t-2 border-[#B56A00] shadow-xs"
                  : "text-[#8C6239] hover:bg-[#FAF2E4]/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-3 mt-2.5 p-2 bg-amber-100 border border-amber-400 rounded-lg text-xs text-amber-950 font-medium">
            {error}
          </div>
        )}

        {/* TAB 1: QUICK GLOBAL SEARCH */}
        {activeTab === "search" && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF2E4]">
            <div className="p-3 border-b border-[#8C6239]/20 bg-[#FAF2E4] space-y-2 shrink-0">
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={gpsLoading}
                className="w-full min-h-10 flex items-center justify-center gap-2 py-2 px-3 bg-[#F4E8D1] hover:bg-[#EBD8BD] border border-[#8C6239]/40 rounded-lg text-xs font-bold text-[#5C3A21] shadow-xs cursor-pointer active:scale-[0.99] transition"
              >
                {gpsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#B56A00]" />
                ) : (
                  <Compass className="w-4 h-4 text-[#B56A00]" />
                )}
                {gpsLoading ? "GPS खोजा जा रहा है..." : "वर्तमान GPS स्थान से सेट करें"}
              </button>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  placeholder="विश्व का कोई भी शहर लिखें — London, New York, Ayodhya, Dubai, Toronto, Ujjain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-10 pl-9 pr-10 py-1.5 bg-white border-2 border-[#8C6239]/40 focus:border-[#B56A00] rounded-lg text-sm font-semibold text-[#5C3A21] placeholder:text-[#8C6239]/70 outline-none shadow-inner"
                  autoFocus
                />
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-[#B56A00] absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#735133] px-1 font-medium">
                <span>
                  {isLoading
                    ? "विश्व मानचित्र पर खोज हो रही है..."
                    : `${results.length} नगर उपलब्ध • अक्षांश-देशांतर व समय-क्षेत्र सहित`}
                </span>
                <span className="text-[#B56A00] font-bold">Drik Panchang डेटाबेस</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 bg-[#FAF2E4] space-y-1.5">
              {results.length === 0 ? (
                <div className="text-center py-10 px-4 text-[#8C6239] space-y-2">
                  <p className="text-sm font-medium">कोई नगर नहीं मिला।</p>
                  <p className="text-xs text-[#735133]">
                    "विश्व नगर" टैब से देश व राज्य चुनें, या "कस्टम निर्देशांक" से नया स्थान जोड़ें।
                  </p>
                </div>
              ) : (
                results.map((loc, idx) => {
                  const isCurrent =
                    Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
                    Math.abs(loc.longitude - currentLocation.longitude) < 0.01;
                  const tz = loc.timezoneHours ?? timezoneHoursFor(loc.latitude, loc.longitude);
                  const tzString = `UTC${tz >= 0 ? `+${tz}` : tz}`;

                  return (
                    <button
                      key={`${loc.name}-${idx}`}
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between min-h-12 border transition cursor-pointer shadow-xs ${
                        isCurrent
                          ? "bg-[#E5D2B8] border-[#B56A00] text-[#5C3A21] font-bold ring-1 ring-[#B56A00]/40"
                          : "bg-white/95 hover:bg-[#F4E8D1] border-[#8C6239]/25 text-[#5C3A21]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <MapPin
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isCurrent ? "text-[#B56A00]" : "text-[#8C6239]"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold leading-snug truncate">
                            {loc.name}
                          </div>
                          <div className="text-[11px] text-[#735133] flex items-center gap-1.5 flex-wrap">
                            <span>{loc.state || loc.country || "विश्व"}</span>
                            <span>•</span>
                            <span>
                              {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                            </span>
                            <span className="bg-[#EAE0CD] text-[#5C3A21] px-1.5 py-0.2 rounded font-semibold text-[10px]">
                              {tzString}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-[#B56A00] shrink-0 font-bold" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GLOBAL DIRECTORY (DRIK PANCHANG STYLE: COUNTRY -> REGION -> CITY) */}
        {activeTab === "directory" && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF2E4]">
            {/* Country Picker Bar */}
            <div className="p-2.5 border-b border-[#8C6239]/20 bg-[#F4E8D1] space-y-2 shrink-0">
              <label className="text-[11px] font-bold text-[#5C3A21] uppercase tracking-wider block">
                1. देश चुनें (Select Country)
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountryCode(c.code);
                      setSelectedRegion("all");
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      selectedCountryCode === c.code
                        ? "bg-[#5C3A21] text-[#FAF2E4] shadow-xs"
                        : "bg-white/80 text-[#5C3A21] border border-[#8C6239]/30 hover:bg-white"
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.nameHi.split("(")[0].trim()}</span>
                  </button>
                ))}
              </div>

              {/* State / Province Sub-filter */}
              {availableRegions.length > 1 && (
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-[#5C3A21] uppercase tracking-wider block mb-1">
                    2. राज्य / प्रांत चुनें ({selectedCountryInfo.flag} {selectedCountryInfo.nameHi.split("(")[0].trim()})
                  </label>
                  <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setSelectedRegion("all")}
                      className={`px-2 py-1 rounded text-[11px] font-bold whitespace-nowrap cursor-pointer transition ${
                        selectedRegion === "all"
                          ? "bg-[#B56A00] text-white"
                          : "bg-white/70 text-[#5C3A21] border border-[#8C6239]/30"
                      }`}
                    >
                      सभी ({countryCities.length})
                    </button>
                    {availableRegions.map((region) => (
                      <button
                        key={region}
                        type="button"
                        onClick={() => setSelectedRegion(region)}
                        className={`px-2 py-1 rounded text-[11px] font-bold whitespace-nowrap cursor-pointer transition ${
                          selectedRegion === region
                            ? "bg-[#B56A00] text-white"
                            : "bg-white/70 text-[#5C3A21] border border-[#8C6239]/30"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* City List for Chosen Country / Region */}
            <div className="flex-1 overflow-y-auto p-2 bg-[#FAF2E4] space-y-1.5">
              <div className="px-1 py-0.5 text-[11px] font-semibold text-[#735133] flex justify-between">
                <span>{selectedCountryInfo.flag} {selectedCountryInfo.nameHi} • {filteredDirectoryCities.length} नगर</span>
                <span>सटीक पंचांग व सूर्योदय गणना</span>
              </div>
              {filteredDirectoryCities.map((city) => {
                const loc = toSavedLocation(city);
                const isCurrent =
                  Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
                  Math.abs(loc.longitude - currentLocation.longitude) < 0.01;
                const tz = city.timezoneHours;
                const tzString = `UTC${tz >= 0 ? `+${tz}` : tz}`;

                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between min-h-12 border transition cursor-pointer shadow-xs ${
                      isCurrent
                        ? "bg-[#E5D2B8] border-[#B56A00] text-[#5C3A21] font-bold ring-1 ring-[#B56A00]/40"
                        : "bg-white/95 hover:bg-[#F4E8D1] border-[#8C6239]/25 text-[#5C3A21]"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <span className="text-base shrink-0 leading-none mt-0.5">{city.flag}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold leading-snug truncate">
                          {city.nameHi} <span className="text-xs font-normal text-[#735133]">({city.nameEn})</span>
                        </div>
                        <div className="text-[11px] text-[#735133] flex items-center gap-1.5 flex-wrap">
                          <span>{city.region}</span>
                          <span>•</span>
                          <span>{city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°</span>
                          <span className="bg-[#EAE0CD] text-[#5C3A21] px-1.5 py-0.2 rounded font-semibold text-[10px]">
                            {tzString}
                          </span>
                          {city.type === 'capital' && (
                            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              राजधानी
                            </span>
                          )}
                          {city.type === 'pilgrimage' && (
                            <span className="bg-orange-100 text-orange-900 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              तीर्थ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-[#B56A00] shrink-0 font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SACRED PILGRIMAGE CENTRES */}
        {activeTab === "pilgrimage" && (
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-[#FAF2E4]">
            <div className="p-2 bg-[#F4E8D1] border border-[#8C6239]/30 rounded-xl text-xs text-[#5C3A21] font-medium">
              चार धाम, द्वादश ज्योतिर्लिंग, सप्त पुरी एवं सिद्ध तीर्थ — इन पावन स्थलों के अक्षांश-देशांतर से पंचांग की गणना पूर्णतः प्रमाणिक होती है।
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {pilgrimageCities.map((loc, idx) => {
                const isCurrent =
                  Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
                  Math.abs(loc.longitude - currentLocation.longitude) < 0.01;
                return (
                  <button
                    key={`${loc.name}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={`text-left p-2.5 rounded-xl flex items-center justify-between border transition cursor-pointer shadow-xs min-h-12 ${
                      isCurrent
                        ? "bg-[#E5D2B8] border-[#B56A00] text-[#5C3A21] font-bold ring-1 ring-[#B56A00]"
                        : "bg-white/95 hover:bg-[#F4E8D1] border-[#8C6239]/25 text-[#5C3A21]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <Sparkles className="w-4 h-4 text-[#B56A00] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight truncate">{loc.name}</div>
                        <div className="text-[10px] text-[#735133] truncate">
                          {loc.state || loc.country} • {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                        </div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-[#B56A00] shrink-0 font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOM COORDINATES & TIMEZONE */}
        {activeTab === "custom" && (
          <form onSubmit={handleCustomSubmit} className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#FAF2E4]">
            <p className="text-xs text-[#735133] font-medium">
              यदि आपका गाँव, कस्बा या विदेश का कोई स्थान सूची में नहीं है, तो उसके सटीक निर्देशांक (GPS) व समय-क्षेत्र यहाँ भरें:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-[#5C3A21] block mb-1">
                  स्थान / गाँव का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. रामनगर, शिवगंज, Sunnyvale..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full min-h-10 px-3 py-1.5 bg-white border border-[#8C6239]/50 rounded-lg text-sm font-semibold text-[#5C3A21] outline-none focus:border-[#B56A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5C3A21] block mb-1">
                  देश (Country)
                </label>
                <input
                  type="text"
                  placeholder="उदा. भारत, USA, Canada, UK..."
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="w-full min-h-10 px-3 py-1.5 bg-white border border-[#8C6239]/50 rounded-lg text-sm font-semibold text-[#5C3A21] outline-none focus:border-[#B56A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5C3A21] block mb-1">
                  राज्य / प्रांत (State / Region)
                </label>
                <input
                  type="text"
                  placeholder="उदा. राजस्थान, उत्तर प्रदेश, California..."
                  value={customState}
                  onChange={(e) => setCustomState(e.target.value)}
                  className="w-full min-h-10 px-3 py-1.5 bg-white border border-[#8C6239]/50 rounded-lg text-sm font-semibold text-[#5C3A21] outline-none focus:border-[#B56A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5C3A21] block mb-1">
                  जिला / तहसील (District / County)
                </label>
                <input
                  type="text"
                  placeholder="उदा. सिरोही, वाराणसी, Santa Clara..."
                  value={customDistrict}
                  onChange={(e) => setCustomDistrict(e.target.value)}
                  className="w-full min-h-10 px-3 py-1.5 bg-white border border-[#8C6239]/50 rounded-lg text-sm font-semibold text-[#5C3A21] outline-none focus:border-[#B56A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5C3A21] block mb-1">
                  अक्षांश (Latitude: −90 से 90) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="उदा. 28.6139"
                  value={customLat}
                  onChange={(e) => {
                    setCustomLat(e.target.value);
                    const latVal = parseFloat(e.target.value);
                    const lonVal = parseFloat(customLon);
                    if (!Number.isNaN(latVal) && !Number.isNaN(lonVal)) {
                      setCustomTz(String(timezoneHoursFor(latVal, lonVal)));
                    }
                  }}
                  className="w-full min-h-10 px-3 py-1.5 bg-white border border-[#8C6239]/50 rounded-lg text-sm font-semibold text-[#5C3A21] outline-none focus:border-[#B56A00]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5C3A21] block mb-1">
                  देशांतर (Longitude: −180 से 180) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="उदा. 77.2090"
                  value={customLon}
                  onChange={(e) => {
                    setCustomLon(e.target.value);
                    const latVal = parseFloat(customLat);
                    const lonVal = parseFloat(e.target.value);
                    if (!Number.isNaN(latVal) && !Number.isNaN(lonVal)) {
                      setCustomTz(String(timezoneHoursFor(latVal, lonVal)));
                    }
                  }}
                  className="w-full min-h-10 px-3 py-1.5 bg-white border border-[#8C6239]/50 rounded-lg text-sm font-semibold text-[#5C3A21] outline-none focus:border-[#B56A00]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#5C3A21] block mb-1">
                समय-क्षेत्र ऑफसेट (Timezone Offset: UTC Hours)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.25"
                  required
                  placeholder="5.5"
                  value={customTz}
                  onChange={(e) => setCustomTz(e.target.value)}
                  className="w-32 min-h-10 px-3 py-1.5 bg-white border border-[#8C6239]/50 rounded-lg text-sm font-semibold text-[#5C3A21] outline-none focus:border-[#B56A00]"
                />
                <span className="text-xs text-[#735133] font-medium">
                  (भारत = +5.5, नेपाल = +5.75, लंदन = 0, न्यू यॉर्क = -5, कैलिफोर्निया = -8, दुबई = +4)
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-11 py-2.5 px-4 bg-[#B56A00] hover:bg-[#965500] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              <MapPin className="w-4 h-4" />
              स्थान सुरक्षित करें और पंचांग देखें
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
