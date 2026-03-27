import { useState, useEffect, useCallback } from "react";

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    windDir: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    dewPoint: number;
    sunrise: string;
    sunset: string;
    icon: string;
  };
  hourly: Array<{
    time: string;
    temp: number;
    icon: string;
  }>;
  daily: Array<{
    day: string;
    high: number;
    low: number;
    icon: string;
    rain: number;
    condition: string;
  }>;
}

interface Location {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY || "";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

// Default location: Kolkata, West Bengal
const DEFAULT_LOCATION: Location = {
  name: "Kolkata",
  lat: 22.5726,
  lon: 88.3639,
  country: "IN",
  state: "West Bengal",
};

function getWindDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function getWeatherIcon(iconCode: string): string {
  const iconMap: { [key: string]: string } = {
    "01d": "☀️",
    "01n": "🌙",
    "02d": "⛅",
    "02n": "☁️",
    "03d": "☁️",
    "03n": "☁️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌦️",
    "10n": "🌧️",
    "11d": "⛈️",
    "11n": "⛈️",
    "13d": "❄️",
    "13n": "❄️",
    "50d": "🌫️",
    "50n": "🌫️",
  };
  return iconMap[iconCode] || "☀️";
}

function getConditionText(iconCode: string): string {
  const conditionMap: { [key: string]: string } = {
    "01d": "Clear Sky",
    "01n": "Clear Night",
    "02d": "Partly Cloudy",
    "02n": "Partly Cloudy",
    "03d": "Cloudy",
    "03n": "Cloudy",
    "04d": "Overcast",
    "04n": "Overcast",
    "09d": "Rainy",
    "09n": "Rainy",
    "10d": "Light Rain",
    "10n": "Light Rain",
    "11d": "Thunderstorm",
    "11n": "Thunderstorm",
    "13d": "Snow",
    "13n": "Snow",
    "50d": "Foggy",
    "50n": "Foggy",
  };
  return conditionMap[iconCode] || "Clear";
}

function formatTime(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

function formatHourlyTime(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  const now = new Date();
  const nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const dateUtc = new Date(date.getTime());
  
  const diffHours = Math.round((dateUtc.getTime() - nowUtc.getTime()) / (1000 * 60 * 60));
  
  if (diffHours <= 0) return "Now";
  if (diffHours <= 2) return `${diffHours}h`;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "UTC",
  });
}

function getDayName(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  const now = new Date();
  const nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const dateUtc = new Date(date.getTime());
  
  const diffDays = Math.round((dateUtc.getTime() - nowUtc.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function useWeather(initialLocation: Location = DEFAULT_LOCATION) {
  const [location, setLocation] = useState<Location>(initialLocation);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (loc: Location) => {
    if (!API_KEY) {
      setError("API key not configured. Please add VITE_OPENWEATHERMAP_API_KEY to your .env file");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch current weather and forecast in parallel
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${BASE_URL}/weather?lat=${loc.lat}&lon=${loc.lon}&units=metric&appid=${API_KEY}`),
        fetch(`${BASE_URL}/forecast?lat=${loc.lat}&lon=${loc.lon}&units=metric&appid=${API_KEY}`),
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      // Process hourly forecast (next 8 hours)
      const hourly = forecastData.list.slice(0, 8).map((item: any) => ({
        time: formatHourlyTime(item.dt, currentData.timezone),
        temp: Math.round(item.main.temp),
        icon: getWeatherIcon(item.weather[0].icon),
      }));

      // Process daily forecast (7 days)
      const dailyMap = new Map<string, any>();
      forecastData.list.forEach((item: any) => {
        const date = new Date((item.dt + currentData.timezone) * 1000);
        const dateKey = date.toISOString().split("T")[0];
        
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            dt: item.dt,
            temps: [],
            icons: [],
            conditions: [],
            rain: 0,
          });
        }
        
        const dayData = dailyMap.get(dateKey);
        dayData.temps.push(item.main.temp);
        dayData.icons.push(item.weather[0].icon);
        dayData.conditions.push(item.weather[0].main);
        
        if (item.rain && item.rain["3h"]) {
          dayData.rain = Math.max(dayData.rain, Math.round(item.pop * 100));
        }
      });

      const daily = Array.from(dailyMap.values()).slice(0, 7).map((day: any) => ({
        day: getDayName(day.dt, currentData.timezone),
        high: Math.round(Math.max(...day.temps)),
        low: Math.round(Math.min(...day.temps)),
        icon: getWeatherIcon(day.icons[Math.floor(day.icons.length / 2)]),
        rain: day.rain,
        condition: getConditionText(day.icons[Math.floor(day.icons.length / 2)]),
      }));

      // Calculate dew point (approximation)
      const temp = currentData.main.temp;
      const humidity = currentData.main.humidity;
      const dewPoint = Math.round(temp - ((100 - humidity) / 5));

      const weatherData: WeatherData = {
        current: {
          temp: Math.round(currentData.main.temp),
          feelsLike: Math.round(currentData.main.feels_like),
          condition: getConditionText(currentData.weather[0].icon),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
          windDir: getWindDirection(currentData.wind.deg),
          pressure: currentData.main.pressure,
          visibility: Math.round((currentData.visibility || 10000) / 1000), // meters to km
          uvIndex: 0, // UV index requires separate API call
          dewPoint: dewPoint,
          sunrise: formatTime(currentData.sys.sunrise, currentData.timezone),
          sunset: formatTime(currentData.sys.sunset, currentData.timezone),
          icon: getWeatherIcon(currentData.weather[0].icon),
        },
        hourly,
        daily,
      };

      setWeather(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Search for locations by name
  const searchLocations = useCallback(async (query: string): Promise<Location[]> => {
    if (!API_KEY || !query.trim()) return [];

    try {
      const response = await fetch(
        `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.map((item: any) => ({
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state,
      }));
    } catch {
      return [];
    }
  }, []);

  // Change location
  const changeLocation = useCallback((newLocation: Location) => {
    setLocation(newLocation);
    fetchWeather(newLocation);
  }, [fetchWeather]);

  // Get current location using browser geolocation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get location name
        try {
          const response = await fetch(
            `${GEO_URL}/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              const newLocation: Location = {
                name: data[0].name,
                lat: latitude,
                lon: longitude,
                country: data[0].country,
                state: data[0].state,
              };
              changeLocation(newLocation);
              return;
            }
          }
        } catch {
          // If reverse geocoding fails, use coordinates
        }
        
        // Fallback: use coordinates as location name
        changeLocation({
          name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
          lat: latitude,
          lon: longitude,
          country: "",
        });
      },
      (err) => {
        setError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  }, [changeLocation]);

  useEffect(() => {
    fetchWeather(location);
    
    // Refresh weather data every 10 minutes
    const interval = setInterval(() => fetchWeather(location), 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location, fetchWeather]);

  return { 
    weather, 
    loading, 
    error, 
    location, 
    changeLocation, 
    searchLocations,
    getCurrentLocation 
  };
}
