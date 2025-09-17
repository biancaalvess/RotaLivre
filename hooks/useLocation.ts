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

  const updateLocation = useCallback(async (lat: number, lng: number) => {
    // Verificar se as coordenadas são válidas
    if (!LocationApiService.isValidLocation(lat, lng)) {
      setError('Coordenadas inválidas');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const details = await LocationApiService.getLocationDetails(lat, lng);
      setLocationDetails(details);
    } catch (err) {
      console.error('Erro ao buscar detalhes da localização:', err);
      setError('Erro ao carregar informações da localização. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Efeito para buscar detalhes quando a localização inicial mudar
  useEffect(() => {
    if (initialLocation) {
      updateLocation(initialLocation.lat, initialLocation.lon).catch((error) => {
        console.error('Erro ao buscar detalhes da localização inicial:', error);
        setError('Erro ao carregar informações da localização inicial.');
        setLoading(false);
      });
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
