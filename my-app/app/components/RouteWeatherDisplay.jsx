"use client";

import { useState, useEffect } from "react";
import SaveRoute from "./SaveRoute";

export default function RouteWeatherDisplay({ cityName }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getWeatherData() {
      try {
        setLoading(true);
        const apiKey = process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY;
        
        console.log("cityName:", cityName);
        console.log("API Key exists:", !!apiKey);
        
        if (!apiKey) {
          throw new Error("Weather API key is not configured. Add NEXT_PUBLIC_OPEN_WEATHER_API_KEY to .env.local");
        }

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
        console.log("Fetching weather for:", cityName);
        
        const response = await fetch(apiUrl);
        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(`Weather API error: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.log("Weather data received:", data);
        setWeatherData(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (cityName) {
      getWeatherData();
    }
  }, [cityName]);

  if (loading) return <p>Loading weather data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!weatherData) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-md">
      <h3 className="font-semibold text-lg mb-2">Weather in {weatherData.name}</h3>
      <p>Temperature: {weatherData.main.temp.toFixed(1)}°C</p>
      <p>Feels like: {weatherData.main.feels_like.toFixed(1)}°C</p>
      <p>Condition: {weatherData.weather[0].description}</p>
      <p>Humidity: {weatherData.main.humidity}%</p>
      <p>Wind: {weatherData.wind.speed} m/s</p>
    </div>
  );
}