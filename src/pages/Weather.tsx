import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudSun, Droplets, Wind, Thermometer, Eye, Sunrise, Sunset,
  CloudRain, Cloud, Sun, Snowflake, CloudLightning, AlertTriangle,
  CheckCircle2, Leaf, ArrowUp, ArrowDown, Loader2, RefreshCw,
  MapPin, Search, X, Navigation,
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Fallback mock data for Kolkata region (used when API fails)
const fallbackWeather = {
  current: {
    temp: 32,
    feelsLike: 35,
    condition: "Partly Cloudy",
    humidity: 68,
    windSpeed: 14,
    windDir: "SE",
    pressure: 1012,
    visibility: 8,
    uvIndex: 7,
    dewPoint: 24,
    sunrise: "06:12 AM",
    sunset: "05:48 PM",
    icon: "⛅",
  },
  hourly: [
    { time: "Now", temp: 32, icon: "⛅" },
    { time: "2PM", temp: 33, icon: "☀️" },
    { time: "4PM", temp: 31, icon: "⛅" },
    { time: "6PM", temp: 28, icon: "☁️" },
    { time: "8PM", temp: 26, icon: "☁️" },
    { time: "10PM", temp: 24, icon: "☁️" },
    { time: "12AM", temp: 23, icon: "☁️" },
    { time: "2AM", temp: 22, icon: "☁️" },
  ],
  daily: [
    { day: "Today", high: 32, low: 22, icon: "⛅", rain: 10, condition: "Partly Cloudy" },
    { day: "Tue", high: 30, low: 21, icon: "🌧️", rain: 65, condition: "Rainy" },
    { day: "Wed", high: 28, low: 20, icon: "🌧️", rain: 80, condition: "Heavy Rain" },
    { day: "Thu", high: 29, low: 21, icon: "☁️", rain: 30, condition: "Cloudy" },
    { day: "Fri", high: 31, low: 22, icon: "☀️", rain: 5, condition: "Sunny" },
    { day: "Sat", high: 33, low: 23, icon: "☀️", rain: 0, condition: "Clear" },
    { day: "Sun", high: 32, low: 22, icon: "⛅", rain: 15, condition: "Partly Cloudy" },
  ],
};

const advisories = [
  {
    type: "warning",
    icon: CloudRain,
    title: "Heavy Rain Expected",
    desc: "Heavy rainfall (40-60mm) expected on Wednesday. Postpone fertilizer application and ensure proper drainage in fields.",
    priority: "high",
  },
  {
    type: "success",
    icon: Leaf,
    title: "Ideal Sowing Conditions",
    desc: "Soil moisture levels are optimal for Rabi crop sowing. Best window: Thursday to Saturday.",
    priority: "medium",
  },
  {
    type: "warning",
    icon: Thermometer,
    title: "High UV Alert",
    desc: "UV Index 7+ today. Avoid prolonged outdoor work between 11AM-3PM. Apply irrigation early morning or evening.",
    priority: "medium",
  },
  {
    type: "info",
    icon: Wind,
    title: "Wind Advisory",
    desc: "Moderate SE winds (14 km/h) favoring pollination. Good conditions for mustard and sunflower crops.",
    priority: "low",
  },
];

const rainfallData = [
  { month: "Jun", value: 280 },
  { month: "Jul", value: 340 },
  { month: "Aug", value: 320 },
  { month: "Sep", value: 250 },
  { month: "Oct", value: 140 },
  { month: "Nov", value: 30 },
  { month: "Dec", value: 10 },
  { month: "Jan", value: 15 },
];

export default function Weather() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { weather, loading, error, location, changeLocation, searchLocations, getCurrentLocation } = useWeather();
  const maxRainfall = Math.max(...rainfallData.map((d) => d.value));

  // Use live data if available, otherwise fallback to mock data
  const displayData = weather || fallbackWeather;

  // Handle search
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, searchLocations]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (loc: any) => {
    changeLocation(loc);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleGetCurrentLocation = () => {
    getCurrentLocation();
    setSearchQuery("");
  };

  // Loading state
  if (loading && !weather) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading weather data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">🌤️ Weather Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {error ? "Using cached data" : "Real-time weather data & agricultural advisories"}
            </p>
          </div>
          
          {/* Location Search */}
          <div ref={searchRef} className="relative w-full sm:w-80">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleGetCurrentLocation}
                title="Use current location"
                className="shrink-0"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchResults && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-background border rounded-xl shadow-lg overflow-hidden"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.lat}-${result.lon}`}
                          onClick={() => handleLocationSelect(result)}
                          className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{result.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.state && `${result.state}, `}{result.country}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No locations found
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Current Location Display */}
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>
            {location.name}
            {location.state && `, ${location.state}`}
            {location.country && `, ${location.country}`}
          </span>
          {loading && (
            <RefreshCw className="w-3 h-3 animate-spin ml-2" />
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-foreground">API Configuration Required</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Get a free API key from{" "}
              <a
                href="https://openweathermap.org/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                OpenWeatherMap
              </a>{" "}
              and add it to your .env file as VITE_OPENWEATHERMAP_API_KEY
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Weather - Large Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">
                {location.name}
                {location.state && `, ${location.state}`}
              </p>
              <div className="flex items-end gap-3 mt-1">
                <span className="font-numbers text-6xl font-bold text-foreground">{displayData.current.temp}°</span>
                <div className="pb-2">
                  <p className="text-foreground font-medium">{displayData.current.condition}</p>
                  <p className="text-sm text-muted-foreground">Feels like {displayData.current.feelsLike}°C</p>
                </div>
              </div>
            </div>
            <div className="text-7xl animate-float">
              {displayData.current.icon}
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <WeatherDetail icon={Droplets} label="Humidity" value={`${displayData.current.humidity}%`} />
            <WeatherDetail icon={Wind} label="Wind" value={`${displayData.current.windSpeed} km/h ${displayData.current.windDir}`} />
            <WeatherDetail icon={Eye} label="Visibility" value={`${displayData.current.visibility} km`} />
            <WeatherDetail icon={Thermometer} label="Pressure" value={`${displayData.current.pressure} hPa`} />
            <WeatherDetail icon={Sunrise} label="Sunrise" value={displayData.current.sunrise} />
            <WeatherDetail icon={Sunset} label="Sunset" value={displayData.current.sunset} />
            <WeatherDetail icon={Droplets} label="Dew Point" value={`${displayData.current.dewPoint}°C`} />
            <WeatherDetail icon={Sun} label="UV Index" value={`${displayData.current.uvIndex} (High)`} />
          </div>
        </motion.div>

        {/* Hourly Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4">Hourly Forecast</h3>
          <div className="space-y-3">
            {displayData.hourly.map((h, i) => (
              <div key={h.time} className="flex items-center justify-between text-sm">
                <span className={`w-12 ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{h.time}</span>
                <span className="text-xl">{h.icon}</span>
                <span className="font-numbers font-medium text-foreground">{h.temp}°</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 7-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4">7-Day Forecast</h3>
          <div className="space-y-2">
            {displayData.daily.map((day, i) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(i)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  selectedDay === i ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                }`}
              >
                <span className={`w-12 text-sm ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {day.day}
                </span>
                <span className="text-xl shrink-0">{day.icon}</span>
                <span className="text-xs text-muted-foreground flex-1 hidden sm:block">{day.condition}</span>
                {day.rain > 0 && (
                  <span className="flex items-center gap-1 text-xs text-info">
                    <Droplets className="w-3 h-3" /> {day.rain}%
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-numbers font-medium flex items-center">
                    <ArrowUp className="w-3 h-3 text-secondary" />{day.high}°
                  </span>
                  <span className="text-muted-foreground font-numbers flex items-center">
                    <ArrowDown className="w-3 h-3 text-info" />{day.low}°
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Rainfall Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4">Rainfall History (mm)</h3>
          <div className="flex items-end gap-2 h-40">
            {rainfallData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-numbers text-muted-foreground">{d.value}</span>
                <div
                  className="w-full rounded-t-md bg-info/70 transition-all"
                  style={{ height: `${(d.value / maxRainfall) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Agricultural Advisories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 glass-card rounded-2xl p-6"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4">🌾 Agricultural Advisories</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {advisories.map((adv, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                  adv.type === "warning"
                    ? "bg-warning/5 border-warning/20"
                    : adv.type === "success"
                    ? "bg-success/5 border-success/20"
                    : "bg-info/5 border-info/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      adv.type === "warning"
                        ? "bg-warning/20"
                        : adv.type === "success"
                        ? "bg-success/20"
                        : "bg-info/20"
                    }`}
                  >
                    <adv.icon
                      className={`w-4 h-4 ${
                        adv.type === "warning"
                          ? "text-warning"
                          : adv.type === "success"
                          ? "text-success"
                          : "text-info"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{adv.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{adv.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

function WeatherDetail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
