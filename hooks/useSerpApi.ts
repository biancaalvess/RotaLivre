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
  const [lastSearchLocation, setLastSearchLocation] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Função para buscar todos os tipos de lugares
  const searchAllPlaces = useCallback(async (lat: number, lng: number) => {
    if (!lat || !lng) return;

    // Verificar cache - se já buscamos para esta localização recentemente, não buscar novamente
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (lastSearchLocation === cacheKey && (gasStations.length > 0 || accommodations.length > 0)) {
      return; // Já temos dados para esta localização
    }

    setLoading(true);
    setError(null);
    setLastSearchLocation(cacheKey);

    try {
      // Buscar apenas postos de gasolina para reduzir chamadas da API
      const gasResults = await SerpApiService.searchGasStations(lat, lng, '5km');
      
      // Usar dados mock para outras categorias para reduzir rate limits
      const mockAccommodations: SerpApiPlace[] = [
        {
          position: 1,
          title: 'Hotel Pousada - Exemplo',
          place_id: 'mock_hotel_1',
          rating: 4.2,
          reviews: 45,
          price: '$$',
          type: 'business',
          address: 'Rua das Flores, 123',
          open_state: 'Open now',
          phone: '(11) 99999-9999',
          website: 'https://example.com',
          gps_coordinates: { latitude: lat + 0.001, longitude: lng + 0.001 }
        }
      ];

      const mockMechanics: SerpApiPlace[] = [
        {
          position: 1,
          title: 'Oficina Mecânica - Exemplo',
          place_id: 'mock_mech_1',
          rating: 4.5,
          reviews: 78,
          price: '$$',
          type: 'business',
          address: 'Av. Principal, 456',
          open_state: 'Open now',
          phone: '(11) 88888-8888',
          website: 'https://example.com',
          gps_coordinates: { latitude: lat - 0.001, longitude: lng - 0.001 }
        }
      ];

      const mockRestaurants: SerpApiPlace[] = [
        {
          position: 1,
          title: 'Restaurante - Exemplo',
          place_id: 'mock_rest_1',
          rating: 4.0,
          reviews: 32,
          price: '$',
          type: 'business',
          address: 'Rua do Comércio, 789',
          open_state: 'Open now',
          phone: '(11) 77777-7777',
          website: 'https://example.com',
          gps_coordinates: { latitude: lat + 0.002, longitude: lng - 0.002 }
        }
      ];

      const mockPharmacies: SerpApiPlace[] = [
        {
          position: 1,
          title: 'Farmácia - Exemplo',
          place_id: 'mock_pharm_1',
          rating: 4.3,
          reviews: 56,
          price: '$$',
          type: 'business',
          address: 'Praça Central, 321',
          open_state: 'Open now',
          phone: '(11) 66666-6666',
          website: 'https://example.com',
          gps_coordinates: { latitude: lat - 0.002, longitude: lng + 0.002 }
        }
      ];

      setGasStations(gasResults);
      setAccommodations(mockAccommodations);
      setMechanics(mockMechanics);
      setRestaurants(mockRestaurants);
      setPharmacies(mockPharmacies);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar lugares próximos.';
      if (errorMessage.includes('Rate limit exceeded')) {
        setError('Muitas requisições. Aguarde um momento e tente novamente.');
      } else if (errorMessage.includes('timeout')) {
        setError('Tempo limite excedido. Verifique sua conexão e tente novamente.');
      } else {
        setError('Erro ao buscar lugares próximos. Tente novamente.');
      }
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

  // Efeito para buscar lugares quando a localização do usuário mudar (com debounce)
  useEffect(() => {
    if (userLocation) {
      // Limpar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Criar novo timeout para debounce
      const timeout = setTimeout(() => {
        searchAllPlaces(userLocation.lat, userLocation.lon).catch((error) => {
          console.error('Erro ao buscar lugares:', error);
          setError('Erro ao carregar dados. Tente novamente.');
          setLoading(false);
        });
      }, 2000); // Aguardar 2 segundos antes de fazer a busca

      setSearchTimeout(timeout);

      // Cleanup function
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
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
