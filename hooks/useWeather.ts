"use client";

import { useState, useEffect, useCallback } from 'react';
import { WeatherApiService, WeatherData, WeatherForecast } from '@/lib/weather-api';

interface UseWeatherReturn {
  currentWeather: WeatherData | null;
  forecast: WeatherForecast[];
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
  searchCity: (cityName: string) => Promise<void>;
}

export function useWeather(userLocation?: { lat: number; lon: number } | null): UseWeatherReturn {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    try {
      // Buscar dados atuais e previsão em paralelo
      const [currentData, forecastData] = await Promise.all([
        WeatherApiService.getCurrentWeather(lat, lng),
        WeatherApiService.getWeatherForecast(lat, lng)
      ]);

      setCurrentWeather(currentData);
      setForecast(forecastData);
    } catch (err) {
      console.error('Erro ao buscar dados do tempo:', err);
      setError('Erro ao carregar dados do tempo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshWeather = useCallback(async () => {
    if (userLocation) {
      await fetchWeatherData(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, fetchWeatherData]);

  const searchCity = useCallback(async (cityName: string) => {
    if (!cityName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const cities = await WeatherApiService.searchCity(cityName);
      
      if (cities.length > 0) {
        const city = cities[0]; // Usar a primeira cidade encontrada
        await fetchWeatherData(city.lat, city.lng);
      } else {
        setError('Cidade não encontrada. Tente outro nome.');
      }
    } catch (err) {
      console.error('Erro ao buscar cidade:', err);
      setError('Erro ao buscar cidade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [fetchWeatherData]);

  // Efeito para buscar dados quando a localização do usuário mudar
  useEffect(() => {
    if (userLocation) {
      fetchWeatherData(userLocation.lat, userLocation.lon).catch((error) => {
        console.error('Erro ao buscar dados do tempo:', error);
        setError('Erro ao carregar dados do tempo. Tente novamente.');
        setLoading(false);
      });
    }
  }, [userLocation, fetchWeatherData]);

  return {
    currentWeather,
    forecast,
    loading,
    error,
    refreshWeather,
    searchCity
  };
}
