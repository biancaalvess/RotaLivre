import { useState, useEffect, useCallback } from 'react';
import { SerpApiService, SerpApiPlace } from '@/lib/serpapi';

interface UseSerpApiReturn {
  gasStations: SerpApiPlace[];
  accommodations: SerpApiPlace[];
  mechanics: SerpApiPlace[];
  restaurants: SerpApiPlace[];
  pharmacies: SerpApiPlace[];
  loading: boolean;
  error: string | null;
  searchPlaces: (category: string, lat: number, lng: number, radius?: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useSerpApi(
  userLocation: { lat: number; lon: number } | null
): UseSerpApiReturn {
  const [gasStations, setGasStations] = useState<SerpApiPlace[]>([]);
  const [accommodations, setAccommodations] = useState<SerpApiPlace[]>([]);
  const [mechanics, setMechanics] = useState<SerpApiPlace[]>([]);
  const [restaurants, setRestaurants] = useState<SerpApiPlace[]>([]);
  const [pharmacies, setPharmacies] = useState<SerpApiPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar todos os tipos de lugares
  const searchAllPlaces = useCallback(async (lat: number, lng: number) => {
    if (!lat || !lng) return;

    setLoading(true);
    setError(null);

    try {
      // Buscar em paralelo para melhor performance
      const [
        gasResults,
        accommodationResults,
        mechanicResults,
        restaurantResults,
        pharmacyResults
      ] = await Promise.all([
        SerpApiService.searchGasStations(lat, lng, '5km'),
        SerpApiService.searchAccommodations(lat, lng, '10km'),
        SerpApiService.searchMechanics(lat, lng, '5km'),
        SerpApiService.searchRestaurants(lat, lng, '3km'),
        SerpApiService.searchPharmacies(lat, lng, '3km')
      ]);

      setGasStations(gasResults);
      setAccommodations(accommodationResults);
      setMechanics(mechanicResults);
      setRestaurants(restaurantResults);
      setPharmacies(pharmacyResults);

    } catch (err) {
      setError('Erro ao buscar lugares próximos. Tente novamente.');
      console.error('Error searching places:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar lugares por categoria específica
  const searchPlaces = useCallback(async (
    category: string,
    lat: number,
    lng: number,
    radius: string = '5km'
  ) => {
    if (!lat || !lng) return;

    setLoading(true);
    setError(null);

    try {
      const results = await SerpApiService.searchPlacesByCategory(category, lat, lng, radius);
      
      // Atualizar o estado apropriado baseado na categoria
      switch (category.toLowerCase()) {
        case 'posto de gasolina':
        case 'gasolina':
          setGasStations(results);
          break;
        case 'hotel':
        case 'pousada':
        case 'camping':
        case 'hospedagem':
          setAccommodations(results);
          break;
        case 'oficina':
        case 'mecânica':
        case 'moto':
          setMechanics(results);
          break;
        case 'restaurante':
        case 'lanchonete':
          setRestaurants(results);
          break;
        case 'farmácia':
        case 'drogaria':
          setPharmacies(results);
          break;
        default:
          // Para categorias não específicas, não atualizar nenhum estado
          break;
      }
    } catch (err) {
      setError(`Erro ao buscar ${category}. Tente novamente.`);
      console.error(`Error searching ${category}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para atualizar todos os dados
  const refreshData = useCallback(async () => {
    if (userLocation) {
      await searchAllPlaces(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, searchAllPlaces]);

  // Efeito para buscar lugares quando a localização do usuário mudar
  useEffect(() => {
    if (userLocation) {
      // Usar catch para evitar promises não tratadas
      searchAllPlaces(userLocation.lat, userLocation.lon).catch((error) => {
        console.error('Erro ao buscar lugares:', error);
        setError('Erro ao carregar dados. Tente novamente.');
        setLoading(false);
      });
    }
  }, [userLocation, searchAllPlaces]);

  return {
    gasStations,
    accommodations,
    mechanics,
    restaurants,
    pharmacies,
    loading,
    error,
    searchPlaces,
    refreshData
  };
}
