const SERPAPI_KEY = process.env.NEXT_PUBLIC_SERPAPI_KEY || 'your_serpapi_key_here';
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

export interface SerpApiPlace {
  position: number;
  title: string;
  place_id: string;
  rating: number;
  reviews: number;
  price: string;
  type: string;
  address: string;
  open_state: string;
  phone: string;
  website: string;
  gps_coordinates: {
    latitude: number;
    longitude: number;
  };
  thumbnail?: string;
}

export interface SerpApiSearchResult {
  search_metadata: {
    status: string;
    created_at: string;
  };
  search_parameters: {
    engine: string;
    q: string;
    ll: string;
    type: string;
  };
  search_information: {
    query_displayed: string;
    total_results: number;
  };
  place_results: SerpApiPlace[];
  serpapi_pagination?: {
    next: string;
  };
}

export class SerpApiService {
  private static async makeRequest(params: Record<string, string>): Promise<SerpApiSearchResult> {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`/api/serpapi?${searchParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 segundos para API route
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Se retornou dados mock, usar os dados mock locais
      if (data.mockData || data.error) {
        console.warn('Using mock data due to API error:', data.error);
        return this.getMockData(params);
      }
      
      return data;
    } catch (error) {
      console.error('SerpAPI request failed:', error);
      // Retornar dados mock em caso de erro
      return this.getMockData(params);
    }
  }

  // Dados mock para quando a API não estiver disponível
  private static getMockData(params: Record<string, string>): SerpApiSearchResult {
    const mockPlaces: SerpApiPlace[] = [
      {
        position: 1,
        title: `${params.q} - Exemplo 1`,
        place_id: 'mock_1',
        rating: 4.5,
        reviews: 123,
        price: '$$',
        type: 'business',
        address: 'Endereço de exemplo, 123',
        open_state: 'Open now',
        phone: '(11) 99999-9999',
        website: 'https://example.com',
        gps_coordinates: {
          latitude: -23.5505,
          longitude: -46.6333
        }
      },
      {
        position: 2,
        title: `${params.q} - Exemplo 2`,
        place_id: 'mock_2',
        rating: 4.2,
        reviews: 89,
        price: '$',
        type: 'business',
        address: 'Outro endereço, 456',
        open_state: 'Closed now',
        phone: '(11) 88888-8888',
        website: 'https://example2.com',
        gps_coordinates: {
          latitude: -23.5515,
          longitude: -46.6343
        }
      }
    ];

    return {
      search_metadata: {
        status: 'Success',
        created_at: new Date().toISOString()
      },
      search_parameters: {
        engine: 'google_maps',
        q: params.q || 'search',
        ll: params.ll || '@-23.5505,-46.6333,5km',
        type: params.type || 'search'
      },
      search_information: {
        query_displayed: params.q || 'search',
        total_results: mockPlaces.length
      },
      place_results: mockPlaces
    };
  }

  // Buscar postos de gasolina próximos
  static async searchGasStations(lat: number, lng: number, radius: string = '5km'): Promise<SerpApiPlace[]> {
    const params = {
      q: 'posto de gasolina',
      ll: `@${lat},${lng},${radius}`,
      type: 'search'
    };

    try {
      const result = await this.makeRequest(params);
      return result.place_results || [];
    } catch (error) {
      console.error('Failed to search gas stations:', error);
      return [];
    }
  }

  // Buscar hospedagens próximas
  static async searchAccommodations(lat: number, lng: number, radius: string = '10km'): Promise<SerpApiPlace[]> {
    const params = {
      q: 'hotel pousada camping',
      ll: `@${lat},${lng},${radius}`,
      type: 'search'
    };

    try {
      const result = await this.makeRequest(params);
      return result.place_results || [];
    } catch (error) {
      console.error('Failed to search accommodations:', error);
      return [];
    }
  }

  // Buscar oficinas mecânicas próximas
  static async searchMechanics(lat: number, lng: number, radius: string = '5km'): Promise<SerpApiPlace[]> {
    const params = {
      q: 'oficina mecânica moto',
      ll: `@${lat},${lng},${radius}`,
      type: 'search'
    };

    try {
      const result = await this.makeRequest(params);
      return result.place_results || [];
    } catch (error) {
      console.error('Failed to search mechanics:', error);
      return [];
    }
  }

  // Buscar restaurantes próximos
  static async searchRestaurants(lat: number, lng: number, radius: string = '3km'): Promise<SerpApiPlace[]> {
    const params = {
      q: 'restaurante lanchonete',
      ll: `@${lat},${lng},${radius}`,
      type: 'search'
    };

    try {
      const result = await this.makeRequest(params);
      return result.place_results || [];
    } catch (error) {
      console.error('Failed to search restaurants:', error);
      return [];
    }
  }

  // Buscar farmácias próximas
  static async searchPharmacies(lat: number, lng: number, radius: string = '3km'): Promise<SerpApiPlace[]> {
    const params = {
      q: 'farmácia drogaria',
      ll: `@${lat},${lng},${radius}`,
      type: 'search'
    };

    try {
      const result = await this.makeRequest(params);
      return result.place_results || [];
    } catch (error) {
      console.error('Failed to search pharmacies:', error);
      return [];
    }
  }

  // Buscar pontos de interesse por categoria
  static async searchPlacesByCategory(
    category: string,
    lat: number,
    lng: number,
    radius: string = '5km'
  ): Promise<SerpApiPlace[]> {
    const params = {
      q: category,
      ll: `@${lat},${lng},${radius}`,
      type: 'search'
    };

    try {
      const result = await this.makeRequest(params);
      return result.place_results || [];
    } catch (error) {
      console.error(`Failed to search ${category}:`, error);
      return [];
    }
  }

  // Calcular distância entre dois pontos (fórmula de Haversine)
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distância em km
    return Math.round(distance * 10) / 10; // Arredondar para 1 casa decimal
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Formatar dados do lugar para uso no app
  static formatPlaceData(place: SerpApiPlace, userLat: number, userLng: number) {
    const distance = this.calculateDistance(
      userLat,
      userLng,
      place.gps_coordinates.latitude,
      place.gps_coordinates.longitude
    );

    return {
      id: place.place_id,
      name: place.title,
      distance,
      rating: place.rating,
      reviews: place.reviews,
      price: place.price,
      address: place.address,
      open: place.open_state.includes('Open'),
      phone: place.phone,
      website: place.website,
      coordinates: place.gps_coordinates,
      thumbnail: place.thumbnail,
      type: place.type
    };
  }
}
