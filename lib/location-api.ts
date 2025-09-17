const LOCATIONIQ_API_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
const LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1';

export interface LocationData {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  place_id?: string;
  osm_type?: string;
  osm_id?: string;
}

export interface ReverseGeocodeResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
  };
  boundingbox: string[];
}

export interface ForwardGeocodeResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  display_name: string;
  boundingbox: string[];
  importance: number;
}

export class LocationApiService {
  private static async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    try {
      const searchParams = new URLSearchParams({
        endpoint,
        ...params
      });

      const response = await fetch(`/api/locationiq?${searchParams}`, {
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
        return this.getMockLocationData();
      }
      
      return data;
    } catch (error) {
      console.error('LocationIQ request failed:', error);
      // Retornar dados mock em caso de erro
      return this.getMockLocationData();
    }
  }

  // Dados mock para quando a API não estiver disponível
  private static getMockLocationData(): ReverseGeocodeResult {
    return {
      place_id: 'mock_place_123',
      licence: 'Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright',
      osm_type: 'way',
      osm_id: '12345678',
      lat: '-23.5505',
      lon: '-46.6333',
      display_name: 'São Paulo, SP, Brasil',
      address: {
        city: 'São Paulo',
        state: 'São Paulo',
        country: 'Brasil',
        country_code: 'br'
      },
      boundingbox: ['-23.6505', '-23.4505', '-46.7333', '-46.5333']
    };
  }

  // Geocodificação reversa: coordenadas para endereço
  static async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const params = {
      lat: lat.toString(),
      lon: lng.toString()
    };

    try {
      const data = await this.makeRequest('/reverse', params);
      return data;
    } catch (error) {
      console.error('Failed to reverse geocode:', error);
      // Retornar dados mock em caso de erro
      return this.getMockLocationData();
    }
  }

  // Geocodificação direta: endereço para coordenadas
  static async forwardGeocode(query: string): Promise<ForwardGeocodeResult[]> {
    const params = {
      q: query,
      limit: '5'
    };

    try {
      const data = await this.makeRequest('/search', params);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to forward geocode:', error);
      return [];
    }
  }

  // Obter endereço formatado de forma amigável
  static formatAddress(address: ReverseGeocodeResult['address']): string {
    const parts = [];
    
    if (address.house_number && address.road) {
      parts.push(`${address.road}, ${address.house_number}`);
    } else if (address.road) {
      parts.push(address.road);
    }
    
    if (address.neighbourhood) {
      parts.push(address.neighbourhood);
    }
    
    if (address.city) {
      parts.push(address.city);
    }
    
    if (address.state) {
      parts.push(address.state);
    }
    
    if (address.country) {
      parts.push(address.country);
    }
    
    return parts.join(', ');
  }

  // Obter cidade e estado de forma simplificada
  static getCityState(address: ReverseGeocodeResult['address']): string {
    const city = address.city || address.suburb || address.neighbourhood || '';
    const state = address.state || '';
    
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }
    
    return address.country || 'Localização desconhecida';
  }

  // Verificar se é uma localização válida
  static isValidLocation(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // Calcular distância aproximada entre dois pontos (em km)
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Arredondar para 1 casa decimal
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Buscar lugares próximos por categoria
  static async searchNearbyPlaces(
    lat: number,
    lng: number,
    category: string,
    radius: number = 1000
  ): Promise<ForwardGeocodeResult[]> {
    const query = `${category} near ${lat},${lng}`;
    return await this.forwardGeocode(query);
  }

  // Obter informações detalhadas de uma coordenada
  static async getLocationDetails(lat: number, lng: number): Promise<{
    address: string;
    cityState: string;
    coordinates: { lat: number; lng: number };
    fullData: ReverseGeocodeResult;
  }> {
    try {
      const data = await this.reverseGeocode(lat, lng);
      
      return {
        address: this.formatAddress(data.address),
        cityState: this.getCityState(data.address),
        coordinates: { lat: parseFloat(data.lat), lng: parseFloat(data.lon) },
        fullData: data
      };
    } catch (error) {
      console.error('Failed to get location details:', error);
      // Retornar dados mock em caso de erro
      const mockData = this.getMockLocationData();
      return {
        address: this.formatAddress(mockData.address),
        cityState: this.getCityState(mockData.address),
        coordinates: { lat: parseFloat(mockData.lat), lng: parseFloat(mockData.lon) },
        fullData: mockData
      };
    }
  }
}
