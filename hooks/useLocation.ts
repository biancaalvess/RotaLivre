"use client";

import { useState, useEffect, useCallback } from 'react';
import { LocationApiService, ReverseGeocodeResult } from '@/lib/location-api';

interface LocationDetails {
  address: string;
  cityState: string;
  coordinates: { lat: number; lng: number };
  fullData: ReverseGeocodeResult;
}

interface UseLocationReturn {
  locationDetails: LocationDetails | null;
  loading: boolean;
  error: string | null;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  searchAddress: (query: string) => Promise<{ lat: number; lng: number; address: string }[]>;
}

export function useLocation(initialLocation?: { lat: number; lon: number } | null): UseLocationReturn {
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<string>('');
  const [locationTimeout, setLocationTimeout] = useState<NodeJS.Timeout | null>(null);

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    // Verificar se as coordenadas são válidas
    if (!LocationApiService.isValidLocation(lat, lng)) {
      setError('Coordenadas inválidas');
      return;
    }

    // Verificar cache - se já buscamos para esta localização recentemente, não buscar novamente
    const locationKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (lastLocation === locationKey && locationDetails) {
      return; // Já temos dados para esta localização
    }

    setLoading(true);
    setError(null);
    setLastLocation(locationKey);

    try {
      // Adicionar delay para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      const details = await LocationApiService.getLocationDetails(lat, lng);
      setLocationDetails(details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar detalhes da localização.';
      if (errorMessage.includes('Rate limit exceeded')) {
        setError('Muitas requisições. Aguarde um momento e tente novamente.');
      } else if (errorMessage.includes('timeout')) {
        setError('Tempo limite excedido. Verifique sua conexão e tente novamente.');
      } else {
        setError('Erro ao carregar informações da localização. Tente novamente.');
      }
      console.error('Erro ao buscar detalhes da localização:', err);
    } finally {
      setLoading(false);
    }
  }, [lastLocation, locationDetails]);

  const searchAddress = useCallback(async (query: string): Promise<{ lat: number; lng: number; address: string }[]> => {
    if (!query.trim()) return [];

    setLoading(true);
    setError(null);

    try {
      const results = await LocationApiService.forwardGeocode(query.trim());
      
      return results.map(result => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name
      }));
    } catch (err) {
      console.error('Erro ao buscar endereço:', err);
      setError('Erro ao buscar endereço. Tente novamente.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para buscar detalhes quando a localização inicial mudar (com debounce)
  useEffect(() => {
    if (initialLocation) {
      // Limpar timeout anterior
      if (locationTimeout) {
        clearTimeout(locationTimeout);
      }

      // Criar novo timeout para debounce
      const timeout = setTimeout(() => {
        updateLocation(initialLocation.lat, initialLocation.lon).catch((error) => {
          console.error('Erro ao buscar detalhes da localização inicial:', error);
          setError('Erro ao carregar informações da localização inicial.');
          setLoading(false);
        });
      }, 3000); // Aguardar 3 segundos antes de fazer a busca

      setLocationTimeout(timeout);

      // Cleanup function
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  }, [initialLocation, updateLocation]);

  return {
    locationDetails,
    loading,
    error,
    updateLocation,
    searchAddress
  };
}
